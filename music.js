const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");
const play = require("@iamtraction/play-dl");

const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
    });

    const q = {
      songs: [],
      player,
      connection: null,
      textChannel: null,
      volume: 0.8,
      loop: false,
      playing: false,
      current: null
    };

    player.on(AudioPlayerStatus.Idle, async () => {
      if (!q.current) return;
      if (q.loop) {
        // Keep current at front for a fresh replay.
        q.songs[0] = q.current;
      } else {
        q.songs.shift();
      }
      q.current = null;
      q.playing = false;
      if (q.songs.length && q.connection) await playNext(guildId);
    });

    player.on("error", async err => {
      console.error("Audio player error:", err);
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
  await entersState(q.connection, VoiceConnectionStatus.Ready, 15000);
  return q;
}

async function addSong(guild, voiceChannel, textChannel, query) {
  const q = await connect(guild, voiceChannel);
  q.textChannel = textChannel;

  let url = query, title = query, duration = "", thumbnail = null;

  if (!/^https?:\/\//i.test(query)) {
    const results = await play.search(query, {
      limit: 1,
      source: { youtube: "video" }
    });
    if (!results.length) throw new Error("No results");
    const r = results[0];
    url = r.url;
    title = r.title;
    duration = r.durationRaw || "";
    thumbnail = r.thumbnails?.[0]?.url || null;
  } else {
    try {
      const info = await play.video_info(query);
      const d = info.video_details;
      title = d.title || query;
      duration = d.durationRaw || "";
      thumbnail = d.thumbnails?.[0]?.url || null;
    } catch {}
  }

  q.songs.push({ url, title, duration, thumbnail });
  if (!q.playing && !q.current) await playNext(guild.id);
  return q.songs[q.songs.length - 1];
}

async function playNext(guildId) {
  const q = queues.get(guildId);
  if (!q || !q.songs.length || !q.connection) {
    if (q) q.playing = false;
    return;
  }

  q.current = q.songs[0];

  try {
    const stream = await play.stream(q.current.url, {
      discordPlayerCompatibility: true
    });
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });
    resource.volume.setVolume(q.volume);
    q.player.play(resource);
    q.playing = true;
  } catch (e) {
    console.error("Stream error:", e?.stack || e);
    q.songs.shift();
    q.current = null;
    q.playing = false;
    await q.textChannel?.send("❌ Could not start this track. Skipping...").catch(() => {});
    if (q.songs.length) await playNext(guildId);
  }
}

function pause(id) { return getQueue(id).player.pause(); }
function resume(id) { return getQueue(id).player.unpause(); }

function skip(id) {
  const q = getQueue(id);
  if (!q.current) return false;
  q.player.stop(true);
  return true;
}

function stop(id) {
  const q = getQueue(id);
  q.songs = [];
  q.current = null;
  q.playing = false;
  q.loop = false;
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

module.exports = {
  addSong, pause, resume, skip, stop, setVolume,
  toggleLoop, shuffle, getStatus
};
