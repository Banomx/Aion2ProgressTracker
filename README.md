# Aion 2 Progress Tracker

Progression route, first-three-days plan, daily and weekly checklists, and useful Q&A details based **only** on [Madsin’s Global progression video](https://www.youtube.com/watch?v=9r4nDbBxRxk).

## Features

- Nine main-character milestones with item-level targets and video timestamps.
- Daily and weekly lists for the main and three alts.
- Server-side saved progress using Cloudflare D1. An HttpOnly browser profile cookie separates progress; clearing it loses access to that profile. No cross-device sync is claimed.
- Manual resets; optional automatic resets with configurable UTC hour and weekly day. Disabled by default because the video does not confirm the schedule.
- Q&A and resource priorities. Unconfirmed launch assumptions are labeled.
- Responsive layout, keyboard-operable tabs, labeled checkboxes, save-failure feedback and retry.

## Develop and validate

Requires Node.js 22 or newer.

```sh
npm ci
npm test
npm run build
npm run validate
```

`worker/index.js` contains the Cloudflare-compatible ES-module Worker and embedded UI. The `DB` binding needs the generated migrations in `drizzle/`. `db/schema.ts` and `drizzle.config.ts` define migrations; generate changes with `npx drizzle-kit generate`.

Deploy through Sites using `.openai/hosting.json`, or deploy the same Worker to your own Cloudflare account with a D1 `DB` binding and apply the migrations. The Worker requires a backend and is not a GitHub Pages static site.

The recording is a prelaunch plan, not verification of current game behavior. Auto-transcribed dungeon names that were unclear are described by content tier and timestamp.
