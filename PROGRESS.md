# PROGRESS: drz-smp-changelog-bot

Status: reviewed and fixed. Dependencies still could not be installed in the review environment.

## Review fixes
- Duplicate changelog entries are rejected (409 / Discord message) instead of silently stored twice.
- A failed disk write no longer leaves a ghost entry in memory; corrupt JSON gives a clear error.
- Bot can no longer ping @everyone/roles via `/api/send` (allowedMentions disabled).
- `/api/status` is cached 30s so the public endpoint cannot hammer the Discord API.
- `ALLOWED_ORIGIN` accepts several origins and tolerates trailing slashes; env values are trimmed; IDs validated.
- Versions like "Season 2" no longer render as "vSeason 2" (embed and website).
- `npm test` now uses `node --test` (the quoted glob did not work on Node 18/20).
- Unhandled rejections are logged; `package.json` marked private.

## Verified
- `node --check` on every JS file.
- test/store.test.js (11 tests) passes using a throwaway discord.js stub that is NOT shipped.
- Config trimming/validation checked by a small script.

## NOT verified (needs `npm install`)
- test/api.test.js, test/handlers.test.js, test/embed.test.js against real express/cors/discord.js
- Real Discord login, slash command registration, `withCounts` status call
- No package-lock.json (cannot be generated offline)
