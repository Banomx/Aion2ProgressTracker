# Aion 2 Progress Tracker

[Open the tracker](https://banomx.github.io/Aion2ProgressTracker/).

Progression routes and character checklists based on [Madsin's video](https://www.youtube.com/watch?v=9r4nDbBxRxk) and the reviewed text guide.

## Basic usage

- **Manage characters:** name your main and choose 0–50 named alts.
- Check off shared route milestones and per-character daily/weekly tasks. Sidebar cards show completion counts, progress bars and the next unfinished entry.
- Progress saves in your browser. Use **Export backup** and **Import backup** to move it between browsers or devices; clearing site data removes local progress.
- Optional resets use the UTC hour and weekly day you configure. Confirm your server's schedule in game before enabling them.

## Run locally

Requires Node.js 24, npm and Bash (Git Bash or WSL on Windows). Python 3 is used for the preview server.

```sh
npm ci
npm test
npm run build
npm run validate
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`.

## GitHub Pages

Set repository **Settings → Pages → Source** to **GitHub Actions**. Push to `main` or run **Tracker checks and GitHub Pages deploy** from the Actions tab.

The workflow also runs hourly at minute 17 UTC. Scheduled runs may be delayed by GitHub. Pull requests run checks without deploying.

See [docs/architecture.md](docs/architecture.md) for source files, storage, build and deployment details.
