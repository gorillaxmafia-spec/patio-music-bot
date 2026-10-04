const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  StreamType,
  entersState,
  getVoiceConnection
} = require("@discordjs/voice");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const ffmpegPath = require("ffmpeg-static");

const queues = new Map();
const ytDlpBinary = path.join(__dirname, ".venv", "bin", "yt-dlp");
const YTDLP = fs.existsSync(ytDlpBinary) ? ytDlpBinary : "yt-dlp";

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    const q = {
      songs: [], player, connection: null, textChannel: null,
      volume: 0.8, loop: false, playing: false, current: null,
      ytdlp: null, ffmpeg: null, starting: false
    };

    player.on(AudioPlayerStatus.Idle, async () => {
      if (!q.current || q.starting) return;
      cleanupProcesses(q);
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
      await q.textChannel?.send("❌ Player error. Skipping this track...").catch(() => {});
      if (q.songs.length && q.connection) await playNext(guildId);
    });
    queues.set(guildId, q);
  }
  return queues.get(guildId);
}

function cleanupProcesses(q) {
  for (const key of ["ytdlp", "ffmpeg"]) {
    const p = q[key];
    if (p) {
      try { p.kill("SIGKILL"); } catch {}
      q[key] = null;
    }
  }
}

function runYtDlp(args, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const child = spawn(YTDLP, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let finished = false;
    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      try { child.kill("SIGKILL"); } catch {}
      reject(new Error("yt-dlp timed out while contacting YouTube"));
    }, timeoutMs);

    child.stdout.on("data", d => { stdout += d.toString(); });
    child.stderr.on("data", d => { stderr += d.toString(); });
    child.on("error", err => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;
      reject(new Error(`yt-dlp could not start: ${err.message}`));
    });
    child.on("close", code => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;
      if (code !== 0) {
        const detail = stderr.trim().replace(/\s+/g, " ").slice(-900);
        reject(new Error(`yt-dlp exited with code ${code}${detail ? `: ${detail}` : ""}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// YouTube currently uses anti-bot checks and Proof-of-Origin (PO) tokens.
// Render has no browser session, so use the bgutil provider plugin to generate
// fresh PO tokens for yt-dlp. This avoids asking the user to upload cookies.
const bgutilScript = path.join(__dirname, ".bgutil", "server", "build", "generate_once.js");

const ytCommon = [
  "--no-playlist",
  "--no-warnings",
  "--quiet",
  "--js-runtimes", "node",
  "--remote-components", "ejs:github",
  "--extractor-args", "youtube:player_client=mweb",
  "--extractor-args", `youtubepot-bgutilscript:script_path=${bgutilScript}`
];

async function getVideoInfo(input) {
  const { stdout } = await runYtDlp([
    ...ytCommon,
    "--dump-single-json",
    "--skip-download",
    input
  ]);
  let data;
  try { data = JSON.parse(stdout.trim().split("\n").filter(Boolean).pop()); }
  catch { throw new Error("yt-dlp returned invalid video information"); }
  const video = data?.entries?.[0] || data;
  if (!video?.webpage_url && !video?.original_url && !video?.url && !video?.id) {
    throw new Error("No playable video found");
  }
  return video;
}

async function searchYouTube(query) {
  return getVideoInfo(`ytsearch1:${query}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connect(guild, voiceChannel) {
  const q = getQueue(guild.id);

  // Discord voice can occasionally leave a failed connection in a zombie
  // signalling/connecting state. Never reuse that connection.
  const existing = q.connection || getVoiceConnection(guild.id);
  if (existing && existing.joinConfig?.channelId !== voiceChannel.id) {
    try { existing.destroy(); } catch {}
    q.connection = null;
  }

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const current = q.connection || getVoiceConnection(guild.id);
      if (current && current.state.status !== VoiceConnectionStatus.Ready) {
        try { current.destroy(); } catch {}
        q.connection = null;
      }

      q.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false,
        debug: true
      });
      q.connection.subscribe(q.player);
      q.connection.on("error", err => console.error(`[VOICE] ${err?.stack || err}`));
      q.connection.on("debug", msg => console.log(`[VOICE] ${msg}`));

      await entersState(q.connection, VoiceConnectionStatus.Ready, 30000);
      console.log(`[VOICE] Connected on attempt ${attempt}`);
      return q;
    } catch (err) {
      lastError = err;
      console.error(`[VOICE] Connection attempt ${attempt}/3 failed:`, err?.stack || err);
      try { q.connection?.destroy(); } catch {}
      q.connection = null;
      if (attempt < 3) await sleep(2000);
    }
  }

  throw new Error(`Discord voice connection failed after 3 attempts: ${lastError?.message || lastError}`);
}

async function addSong(guild, voiceChannel, textChannel, query) {
  const q = await connect(guild, voiceChannel);
  q.textChannel = textChannel;
  const isHttp = /^https?:\/\//i.test(query);
  const video = isHttp ? await getVideoInfo(query) : await searchYouTube(query);
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
    // Stream yt-dlp's audio directly into FFmpeg. This avoids the
    // youtube-dl-exec AbortError that was occurring during playback.
    const ytdlp = spawn(YTDLP, [
      ...ytCommon,
      "-f", "bestaudio/best",
      "-o", "-",
      q.current.url
    ], { stdio: ["ignore", "pipe", "pipe"] });
    q.ytdlp = ytdlp;

    const ffmpeg = spawn(ffmpegPath, [
      "-hide_banner", "-loglevel", "error",
      "-reconnect", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      "-i", "pipe:0",
      "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"
    ], { stdio: ["pipe", "pipe", "pipe"] });
    q.ffmpeg = ffmpeg;

    ytdlp.stdout.pipe(ffmpeg.stdin);
    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });
    resource.volume.setVolume(q.volume);

    let ffmpegError = "";
    let ytError = "";
    ffmpeg.stderr.on("data", d => { ffmpegError += d.toString(); });
    ytdlp.stderr.on("data", d => { ytError += d.toString(); });

    ytdlp.on("error", err => console.error("yt-dlp process error:", err));
    ffmpeg.on("error", err => console.error("FFmpeg process error:", err));

    ytdlp.on("close", code => {
      if (code !== 0 && q.playing) console.error("yt-dlp exited:", code, ytError.trim());
    });
    ffmpeg.on("close", code => {
      if (code !== 0 && q.playing) console.error("FFmpeg exited:", code, ffmpegError.trim());
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
    await q.textChannel?.send(`❌ Could not start this track.\n\`${String(e?.message || e).slice(0, 700)}\``).catch(() => {});
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
function toggleLoop(id) { const q = getQueue(id); q.loop = !q.loop; return q.loop; }
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
