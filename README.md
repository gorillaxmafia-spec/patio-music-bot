# 🎵 PATIO MUSIC — Discord Music Bot

A ready-to-deploy Discord music bot built with Node.js, Discord.js 14 and Discord Player 7.

## Commands

- `/play <query>` — play/search a track
- `/skip` — skip current track
- `/stop` — stop and clear queue
- `/pause` — pause
- `/resume` — resume
- `/queue` — show queue
- `/nowplaying` — current track
- `/volume <1-100>` — volume
- `/loop <off|song|queue>` — repeat mode
- `/shuffle` — shuffle queue
- `/clear` — clear upcoming tracks
- `/join` — join your voice channel
- `/leave` — leave voice
- `/ping` — latency
- `/help` — command list

## Important source note

Discord Player v7 officially removed YouTube playback because YouTube extraction frequently breaks. Its official extractors include SoundCloud and can search Spotify/Apple Music; Spotify/Apple Music are metadata/search sources and may be bridged to a stream source when possible. See the Discord Player documentation before using any third-party extractor.

## 1. Create the Discord bot

1. Open the Discord Developer Portal.
2. Create a New Application.
3. Open **Bot** and create/reset the bot token.
4. Copy the token. **Never share it or commit it to GitHub.**
5. Open **OAuth2 → URL Generator**.
6. Select scopes: `bot` and `applications.commands`.
7. Select bot permissions:
   - View Channels
   - Send Messages
   - Embed Links
   - Connect
   - Speak
   - Use Voice Activity
8. Open the generated invite URL and add the bot to your server.

## 2. Configure variables

Copy `.env.example` to `.env` and fill:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
BOT_STATUS=🎵 /play | PATIO MUSIC
```

## 3. Run locally

Node.js 20+ is recommended.

```bash
npm install
npm run register
npm start
```

## 4. Railway deployment

Recommended for this bot because it is a long-running Node.js service.

1. Create a GitHub repository and upload this project.
2. Open Railway and create a new project.
3. Choose **Deploy from GitHub repo**.
4. Select your repository.
5. Add the variables from `.env` in Railway's Variables tab.
6. Railway will install dependencies and run `npm start`.
7. If slash commands are not registered yet, run `npm run register` once locally using the same Discord credentials, or create a one-off deployment/command step.

### Railway start command

```bash
npm start
```

## 5. iPhone setup

You can manage the Discord bot from an iPhone by using GitHub + Railway in Safari. For editing files, GitHub's web editor or an iOS code editor can be used. You do not need to run the bot continuously on the iPhone; Railway runs the Node.js process in the cloud.

## Troubleshooting

### Slash commands don't appear

Make sure `CLIENT_ID` and `GUILD_ID` are correct and run:

```bash
npm run register
```

### Bot joins but no audio

Check the supported extractors and source availability. Discord Player v7 does not officially support YouTube playback.

### Token exposed

Immediately reset the bot token in the Discord Developer Portal and replace `DISCORD_TOKEN` in Railway.
