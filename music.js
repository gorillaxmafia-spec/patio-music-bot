const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  StreamType,
  entersState
} = require("@discordjs/voice");
const youtubedl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");
const { spawn } = require("node:child_process");

const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
    });

    const q = {
      songs: [], player, connection: null, textChannel: null,
      volume: 0.8, loop: false, playing: false, current: null,
      ytdlp: null, ffmpeg: null, starting: false
    };

    player.on(AudioPlayerStatus.Idle, async () => {
      if (!q.current || q.starting) return;
      if (q.loop) {
        q.playing = false;
      } else {
        q.songs.shift();
        q.current = null;
        q.playing = false;
      }
      if (q.songs.length && q.connection) await playNext(guildId);
    });

    player.on("error", async err => {
      console.error("Audio player error:", err?.stack || err);
      cleanupProcesses(q);
      if (q.songs.length) q.songs.shift();
      q.current = null;
      q.playing = false;
      if (q.textChannel) await q.textChannel.send("❌ Player error. Skipping this track...").catch(() => {});
      if (q.songs.length && q.connection) await playNext(guildId);
    });

    queues.set(guildId, q);
  }
  return queues.get(guildId);
}

function cleanupProcesses(q) {
  if (q.ytdlp) {
    try { q.ytdlp.kill("SIGKILL"); } catch {}
    q.ytdlp = null;
  }
  if (q.ffmpeg) {
    try { q.ffmpeg.kill("SIGKILL"); } catch {}
    q.ffmpeg = null;
  }
}

async function getVideoInfo(input) {
  const data = await youtubedl(input, {
    dumpSingleJson: true,
    skipDownload: true,
    noPlaylist: true,
    noWarnings: true,
    quiet: true,
    noCheckCertificates: true
  });
  const video = data?.entries?.[0] || data;
  if (!video?.webpage_url && !video?.url && !video?.id) throw new Error("No playable video found");
  return video;
}

async function searchYouTube(query) {
  return getVideoInfo(`ytsearch1:${query}`);
}

async function connect(guild, voiceChannel) {
  const q = getQueue(guild.id);
  if (q.connection && q.connection.state.status !== VoiceConnectionStatus.Destroyed) {
    if (q.connection.joinConfig.channelId !== voiceChannel.id) {
      q.connection.destroy();
      q.connection = null;
    }
  }
  if (!q.connection) {
    q.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true
    });
    q.connection.subscribe(q.player);
  }
  await entersState(q.connection, VoiceConnectionStatus.Ready, 20000);
  return q;
}

async function addSong(guild, voiceChannel, textChannel, query) {
  const q = await connect(guild, voiceChannel);
  q.textChannel = textChannel;

  let video;
  const isHttp = /^https?:\/\//i.test(query);
  if (isHttp) {
    video = await getVideoInfo(query);
  } else {
    video = await searchYouTube(query);
  }

  const url = video.webpage_url || video.original_url || video.url;
  const song = {
    url,
    title: video.title || query,
    duration: video.duration_string || formatDuration(video.duration),
    thumbnail: video.thumbnail || video.thumbnails?.[0]?.url || null
  };

  q.songs.push(song);
  if (!q.playing && !q.current) await playNext(guild.id);
  return song;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

async function playNext(guildId) {
  const q = queues.get(guildId);
  if (!q || !q.songs.length || !q.connection) {
    if (q) q.playing = false;
    return;
  }
  if (q.starting) return;

  q.starting = true;
  cleanupProcesses(q);
  q.current = q.songs[0];

  try {
    // yt-dlp is kept up to date automatically during npm install on Render.
    // It writes the best available audio to stdout; FFmpeg converts it to
    // raw PCM, which @discordjs/voice can send directly to Discord.
    const ytdlpProcess = youtubedl.exec(q.current.url, {
      format: "bestaudio/best",
      output: "-",
      noPlaylist: true,
      noWarnings: true,
      quiet: true,
      noCheckCertificates: true,
      preferFreeFormats: true
    });
    q.ytdlp = ytdlpProcess;

    const ffmpeg = spawn(ffmpegPath, [
      "-hide_banner", "-loglevel", "error",
      "-i", "pipe:0",
      "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"
    ], { stdio: ["pipe", "pipe", "pipe"] });
    q.ffmpeg = ffmpeg;

    ytdlpProcess.stdout.pipe(ffmpeg.stdin);
    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });
    resource.volume.setVolume(q.volume);

    let ffmpegError = "";
    ffmpeg.stderr.on("data", d => { ffmpegError += d.toString(); });
    ffmpeg.on("error", err => console.error("FFmpeg process error:", err));
    ytdlpProcess.stderr?.on("data", d => console.error("yt-dlp:", d.toString().trim()));

    ytdlpProcess.on("error", err => {
      console.error("yt-dlp process error:", err);
      try { ffmpeg.stdin.end(); } catch {}
    });

    ffmpeg.on("close", code => {
      if (code && q.playing) console.error("FFmpeg exited:", code, ffmpegError.trim());
    });

    q.player.play(resource);
    q.playing = true;
    q.starting = false;
  } catch (e) {
    q.starting = false;
    cleanupProcesses(q);
    console.error("Stream error:", e?.stack || e);
    q.songs.shift();
    q.current = null;
    q.playing = false;
    await q.textChannel?.send(`❌ Could not start this track.\n\`${String(e?.message || e).slice(0, 500)}\``).catch(() => {});
    if (q.songs.length) await playNext(guildId);
  }
}

function pause(id) { return getQueue(id).player.pause(); }
function resume(id) { return getQueue(id).player.unpause(); }

function skip(id) {
  const q = getQueue(id);
  if (!q.current) return false;
  cleanupProcesses(q);
  q.player.stop(true);
  return true;
}

function stop(id) {
  const q = getQueue(id);
  q.songs = [];
  q.current = null;
  q.playing = false;
  q.loop = false;
  cleanupProcesses(q);
  q.player.stop(true);
  if (q.connection) q.connection.destroy();
  queues.delete(id);
  return true;
}

function setVolume(id, value) {
  const q = getQueue(id);
  q.volume = Math.max(0, Math.min(1, value / 100));
  return Math.round(q.volume * 100);
}

function toggleLoop(id) {
  const q = getQueue(id);
  q.loop = !q.loop;
  return q.loop;
}

function shuffle(id) {
  const q = getQueue(id);
  if (q.songs.length < 2) return false;
  const current = q.songs[0];
  const rest = q.songs.slice(1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  q.songs = [current, ...rest];
  return true;
}

function getStatus(id) { return getQueue(id); }

module.exports = { addSong, pause, resume, skip, stop, setVolume, toggleLoop, shuffle, getStatus };
