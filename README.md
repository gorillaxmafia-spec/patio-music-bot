# PATIO MUSIC

Discord music bot with:
- `/play`
- `/pause`
- `/resume`
- `/skip`
- `/stop`
- `/queue`
- `/loop`
- `/shuffle`
- `/volume`
- `/panel`
- Interactive Pause / Resume / Skip / Stop / Shuffle / Loop / Queue / Volume buttons
- Render Web Service health endpoint

## Render deployment (fixed)

Use **Web Service** with:
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:
- `DISCORD_TOKEN` = your bot token
- `CLIENT_ID` = Discord application/client ID
- `GUILD_ID` = optional server ID for faster guild command registration

The app listens on `process.env.PORT` so Render can detect the open port.

## Discord Developer Portal

Enable the bot's required permissions for the server and invite it with the `bot` and `applications.commands` scopes.

Never put your real Discord token into GitHub. Use Render Environment Variables.


### Important playback fix (V8)
This version replaces the YouTube playback path with `yt-dlp` + FFmpeg. `youtube-dl-exec` downloads the current yt-dlp binary during `npm install`, and `ffmpeg-static` provides FFmpeg without requiring you to install it manually. This avoids relying on the older YouTube extraction path that was causing `I couldn't load that song`.

After uploading this ZIP to GitHub, trigger a **Clear build cache & deploy** on Render so the new yt-dlp binary and dependencies are installed.

Render settings:
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`

