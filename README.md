# OG APPAN GAME BOT

Discord economy/game bot with a normal `commands/` folder structure, ready for Render Web Service.

## Render
- Service: Web Service
- Build: `npm install`
- Start: `npm start`
- Environment: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `OWNER_ID`

## Commands
`/game` `/help` `/owner` `/profile` `/balance` `/give` `/deposit` `/withdraw` `/work` `/daily` `/play` `/rob` `/shop` `/buy` `/leaderboard` `/announce`


### Kerala Food Shop
The shop now includes Kerala foods such as Biriyani, Pazhampori, Porotta + Beef, Puttu + Kadala, Appam + Stew, Idiyappam, Sadya, Fish Curry Meals, Kappa + Beef, Chicken 65, Unniyappam, Sulaimani, Neychoru + Beef, Kallappam, Fish Fry and Banana Chips.

- `/shop` — view the food shop
- `/buy item:<food>` — buy food
- `/giftfood user:<player> item:<food> quantity:<number>` — give food from your inventory to another player

### Moderation
- `/slowmode seconds:<0-21600>` — enable slowmode in the current channel. Use `0` to disable it. Requires **Manage Channels**.

### Mandi Shop
Added Chicken Mandi, Alfham Mandi, Peri Peri Mandi, Beef Mandi, Mutton Mandi, Fish Mandi, BBQ Chicken Mandi and Spicy Chicken Mandi. Mandi can also be gifted with `/giftfood`.


## IMPORTANT: Fix Discord "Unknown Integration"
If Discord shows **Unknown Integration** when using `/help`, the bot application is usually not installed with the `applications.commands` scope. Re-invite the bot using both scopes:

`bot` + `applications.commands`

In the Discord Developer Portal, open **OAuth2 → URL Generator**, select **bot** and **applications.commands**, select the permissions your bot needs, generate the URL, and authorize the bot again.

For Render, set:
- `DISCORD_TOKEN` = your bot token
- `CLIENT_ID` = your Discord Application ID
- `GUILD_ID` = the server ID where you want instant slash-command updates
- `OWNER_ID` = `1445101801304227922`

After saving the environment variables, redeploy the Render service. The bot will automatically register all commands.

### If commands still show the old integration
1. Remove the bot from the server.
2. Re-invite it using `applications.commands` + `bot`.
3. Redeploy Render.
4. Type `/help` again.
