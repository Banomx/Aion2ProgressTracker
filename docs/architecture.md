# Architecture

## Static browser application

GitHub Pages serves the files from `site/`. All interactions run in the browser; there is no application server, account system or database. This keeps deployment simple and stores each user's progress locally.

| File | Purpose |
| --- | --- |
| `site/index.html` | Page shell, tabs, sidebar and dialogs |
| `site/data.js` | Route, launch plan, task and reference content |
| `site/app.js` | Rendering, character management, persistence, backups and resets |
| `site/styles.css` | Layout and responsive styles |
| `site/favicon.svg` | Site icon |

Guide content combines the video and reviewed text guide. Global-specific assumptions remain labeled. Video links point to relevant sections; the detailed reviewed notes are not a transcript of each linked timestamp.

Route entries use stable IDs independently of display order. Preserve existing IDs when editing or inserting milestones so saved completions keep their meaning. Update the route-ID validation in `normalizeState()` when adding IDs beyond its accepted range.

Daily tasks use Daily, Scheduled, Routine and Accumulating ordering, omitting empty groups. Shugo Festival/Invasion keys are listed under Daily with a reminder that entries can be saved and do not all need to be used in one day. Weekly tasks group reset purchases, subscription purchases, ongoing requests, late-week attempts and scheduled events. Sidebar counts and next-entry labels derive from the selected character's saved checks; route progress is shared.

## Storage and backups

`site/app.js` stores state under localStorage key `aion2-progress-tracker-v2`:

- `checks`: completion flags keyed by stable route ID or checklist, character and task ID.
- `characters`: main name, alt count and retained alt names.
- `itemLevels`: optional non-negative numeric iLvL values keyed by `main` or alt slot.
- `settings`: UTC reset hour, weekly day and automatic-reset toggle.
- `periods`: daily and weekly reset dates.

Alt slots have stable keys (`alt1` through `alt50`). Reducing the count hides slots without deleting their names, item levels or progress. Names are rendered as text or escaped before insertion into HTML.

Storage belongs to the browser profile and site origin. A different device, browser or hosting address has separate progress. No progress is sent to a backend. Storage failures show an error while keeping changes on screen so users can export or retry.

JSON exports contain `format: "aion2-progress-tracker"`, `version: 2`, `exportedAt` and `state`. Imports validate structure, values and a 1 MB size limit, then require confirmation before replacing saved state. Invalid imports leave existing data intact. Older states without character settings default to the original main and three alts. States/backups without `itemLevels` default to unset values. Blank iLvL inputs clear the saved value; zero and fractional values are supported. Values are included in version-2 backups and validated on import.

Automatic resets are off by default. When enabled, they run on load, when the page becomes visible and on a one-minute interval while open. Daily/weekly resets clear checklist flags across characters; route milestones remain. Manual resets affect only the selected checklist and character. Sidebar cards track task completion, not ticket counts or currency balances.

## Build and deployment

`scripts/build.sh` copies `site/` into `dist/` and adds `.nojekyll`. All stylesheet, script and icon paths are relative so the app works under the repository's Pages path.

`.github/workflows/ci.yml` runs `npm ci`, `npm test`, `npm run build` and `npm run validate`. It uploads `dist/` and deploys to GitHub Pages on main-branch pushes, manual runs and the hourly `17 * * * *` schedule. Pull requests only run checks. Repository Pages must use GitHub Actions as its source.

Tests in `scripts/test.mjs` use an isolated Happy DOM browser to cover persistence, per-character progress cards, naming, backups, reset behavior and preservation of route IDs. The artifact validator checks required files, relative paths and JavaScript syntax.

For a deployment problem, inspect the failed job in Actions. For missing progress, confirm the browser profile and site address before importing a backup. Do not clear site storage to troubleshoot without first exporting recoverable progress.
