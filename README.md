# DRZ SMP Changelog Bot

A Discord bot for posting your server's changelogs, plus a small web API and a ready-made changelog page you can hook to your website.

- `/changelog add` saves an entry and posts it to your changelog channel as an embed.
- Your website can read the changelog (`GET /api/changelog`) or add entries (`POST /api/changelog`).
- Entries are stored in `data/changelog.json` (or `DATA_FILE`). No database needed.

## 1. Create the bot
1. Go to https://discord.com/developers/applications and click **New Application**.
2. **Bot** tab: click **Reset Token** and copy it. This is `DISCORD_TOKEN`.
3. **OAuth2 > URL Generator**: tick scopes `bot` and `applications.commands`, then permissions **View Channels**, **Send Messages** and **Embed Links**. Open the generated URL to invite the bot.
4. In Discord, turn on Developer Mode (Settings > Advanced). Right-click your server and the changelog channel to copy their IDs.

## 2. Run it
Requires Node 18.17 or newer.
```bash
npm install
cp .env.example .env    # then fill in the values
npm test                # optional: run the test suite
npm start
```
The website is served at `http://localhost:4000/`.

## 3. Slash commands
| Command | Who | What it does |
|---|---|---|
| `/changelog latest` | everyone | Show the newest entry |
| `/changelog list [count]` | everyone | List recent entries |
| `/changelog add version title changes [type] [post]` | Manage Server | Save a new entry (separate changes with `;`) and post it |
| `/changelog post id` | Manage Server | Re-post an entry |
| `/changelog remove id` | Manage Server | Delete an entry |
| `/ping` | everyone | Check the bot is alive |

Entry types: `release`, `update`, `fix`, `event`, `maintenance`.

## 4. Hook it to your website

**Public endpoints (safe to call from the browser):**
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/changelog?limit=20` | Recent entries, newest first |
| GET | `/api/changelog/latest` | Newest entry (404 if none) |
| GET | `/api/status` | Discord server name and member counts |
| GET | `/health` | Is it running |

**Protected endpoints (send the `x-api-key` header from your website's BACKEND):**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/changelog` | Add an entry (posts to Discord unless `"post": false`) |
| POST | `/api/changelog/:id/post` | Re-post an entry |
| DELETE | `/api/changelog/:id` | Delete an entry |
| POST | `/api/send` | Send a plain message or embed |

```js
// From your website's server (never from browser JavaScript):
await fetch('https://YOUR-BOT-HOST/api/changelog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.BOT_API_KEY },
  body: JSON.stringify({
    version: '1.4.0',
    title: 'Spawn rebuild',
    type: 'release',
    changes: ['New spawn area', 'Fixed lag at the market', 'Added /home limits'],
    // post: false,        // save without posting to Discord
    // channelId: '123',   // post to another channel in your server
  }),
});
```
`changes` can be an array or one string separated by `;` or new lines.

Submitting an identical entry again (same version, title and changes) is rejected with `409` (or a duplicate message in Discord) so retries and double clicks don't create duplicates.

If the entry is saved but Discord rejects the post, the API still returns `201` with `"posted": false` and a `postError` message.

**Showing the changelog on your own site:** either use the included page at `/`, or host `public/index.html` anywhere and add this line before its script:
```html
<script>window.DRZ_API_BASE = 'https://YOUR-BOT-HOST';</script>
```
Then set `ALLOWED_ORIGIN` in `.env` to your site's address, e.g. `https://drzsmp.example.com` (several origins can be separated by commas; no trailing slash needed).

Keep `API_KEY` secret. Anyone with it can add or delete entries and post to your channels. The bot only posts into channels of the server in `GUILD_ID`.

## 5. Hosting
The bot must stay running. Railway, Render, Fly.io or a small VPS all work. Set the variables from `.env` in the host's settings. The app listens on the `PORT` the host provides and needs no build step: build command `npm install`, start command `npm start`. A `package-lock.json` is not included (it must be generated with network access); run `npm install` once locally and commit the lockfile if your host uses `npm ci`. Mount a persistent volume for `data/` (or set `DATA_FILE` to a path on one), otherwise entries are lost when the host redeploys.

## Project layout
```
index.js           entry point
src/store.js       changelog storage and validation
src/embed.js       Discord embeds
src/commands.js    slash command definitions
src/handlers.js    slash command logic
src/bot.js         Discord client
src/api.js         HTTP API for the website
public/index.html  changelog page
test/              tests (node --test)
```
