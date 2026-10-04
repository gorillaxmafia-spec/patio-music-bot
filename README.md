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
- Build Command: `python3 -m venv .venv && .venv/bin/pip install -U "yt-dlp[default]" && YOUTUBE_DL_SKIP_DOWNLOAD=true npm install`
- Start Command: `npm start`

Environment variables:
- `DISCORD_TOKEN` = your bot token
- `CLIENT_ID` = Discord application/client ID
- `GUILD_ID` = optional server ID for faster guild command registration

The app listens on `process.env.PORT` so Render can detect the open port.

## Discord Developer Portal

Enable the bot's required permissions for the server and invite it with the `bot` and `applications.commands` scopes.

Never put your real Discord token into GitHub. Use Render Environment Variables.


### Important playback fix (V11)
This version fixes the Render playback failures by removing the youtube-dl-exec AbortError path and running yt-dlp directly: (1) YouTube now requires a JavaScript runtime/EJS solver for full extraction, so Render installs current `yt-dlp[default]` into `.venv` and the bot uses Node as the JS runtime; (2) Discord voice needs an Opus encoder for raw PCM, so `@discordjs/opus` and `opusscript` are installed. `ffmpeg-static` provides FFmpeg. yt-dlp's current documentation confirms the EJS + JS runtime requirement for full YouTube support.

After uploading this ZIP to GitHub, trigger a **Clear build cache & deploy** on Render so the new yt-dlp binary and dependencies are installed.

Render settings:
- Environment: Node
- Build Command: `python3 -m venv .venv && .venv/bin/pip install -U "yt-dlp[default]" && YOUTUBE_DL_SKIP_DOWNLOAD=true npm install`
- Start Command: `npm start`



### V10 change
V10 no longer uses the youtube-dl-exec Promise wrapper for YouTube extraction. It runs the Render-installed yt-dlp binary directly, with Node/EJS support, and streams audio to FFmpeg. This prevents the `The operation was aborted` error that can occur in the previous wrapper path.


### V11 voice connection fix
V11 upgrades `@discordjs/voice` from 0.18.x to 0.19.2 and explicitly includes the DAVE library. Discord voice now requires DAVE support, and the older 0.18.x line can fail with `AbortError: The operation was aborted` while waiting for the voice connection to become Ready. V11 also destroys zombie voice connections and retries the voice handshake up to 3 times. The current `@discordjs/voice` package requires Node.js 22.12+ and includes DAVE support.
