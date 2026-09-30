# Aion 2 Progress Tracker

Static progression route and daily/weekly checklists based only on [Madsin's Global progression video](https://www.youtube.com/watch?v=9r4nDbBxRxk). Includes the first three days, main progression route, side-content priorities and useful Q&A details, with timestamp links. These are the creator's plans and assumptions for Global, not independently verified game rules.

## Your characters and progress

Use **Manage characters** to name your main and choose 0–50 named alts. Daily and weekly checklists are tracked separately for each character; route milestones are shared. Reducing the alt count hides those alts without deleting their names or completed tasks.

All character names, completed entries and reset settings are stored in your browser's localStorage. There are no accounts, database, backend or progress uploads. Storage belongs to the browser profile and site origin; a different browser, device or hosting address starts separately. Clearing site data removes progress. Use **Export backup** to download a JSON backup, then **Import backup** to restore it elsewhere. Imports are validated and require confirmation before replacing current progress.

Optional automatic resets use your chosen UTC hour and weekly day; they run when the page is open or next reopened. Set these to your server's actual reset schedule. Manual resets affect only the selected character and checklist. The launch guide's main + 3 alts reflects the video's plan; the character selector supports your own roster.

## GitHub Pages

1. In repository **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
2. Open **Actions → Tracker checks and GitHub Pages deploy** and choose **Run workflow**, or push to `main`.
3. The successful deploy job displays the published site URL.

The workflow tests, builds, validates and deploys on pushes to `main`, manual runs and every hour at minute 17 UTC (`17 * * * *`). GitHub may delay scheduled runs. Pull requests run checks without deploying.

The Pages artifact contains only `dist/index.html`, `dist/favicon.svg` and `dist/.nojekyll`. Asset URLs are relative so the site works under a repository path. No hosting secrets or external hosting provider are required. The earlier `.openai/hosting.json` was specific to ChatGPT Sites hosting and has been removed with its unused Worker and database configuration.

## Local development

Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run build
npm run validate
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Edit `site/index.html` for content and interactions, and `site/favicon.svg` for the icon. Tests cover browser persistence, per-character progress, character naming/counts, safe name rendering, backup export/import, invalid backups, resets and storage failures.
