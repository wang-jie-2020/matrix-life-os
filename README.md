# Matrix Life OS

A local-first personal life management desktop app built with React, TypeScript, Zustand, Vite, and Electron.

This fork is being reset from a half-finished upstream state. The current documentation favors implemented behavior over old roadmap promises.

## Current Status

The app currently has three top-level pages:

- **Action Desk**: inbox, weekly task board, OKR, daily progress, principles, calendar, entertainment, and optional habit/mood/time-block/inspiration modules.
- **Review Archive**: reflection entry, reflection library, objective archive, abilities, and optional mood panel.
- **System**: module manager, about panel, quote panel, reflection template manager, data health panel, update panel, and manual panel.

Backup import/export components exist in the source tree, but they are not mounted in the current UI. Do not treat application-level manual backup as an available feature yet.

## Storage

App state is persisted with Zustand persist.

Electron runtime:

- Main data file: `app.getPath('userData')/alo-data.json`
- Backup file: `alo-data.json.bak`
- Temporary write file: `alo-data.json.tmp`

Browser or Vite dev fallback:

- `localStorage`
- Persist key: `alo-storage`

## Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Package the Electron app:

```bash
npm run electron:build
```

Run the contrast audit:

```bash
npm run audit:contrast
```

There is currently no dedicated `test` script in `package.json`.

## Documentation

The rebuilt project documentation lives in [docs/](docs/README.md):

- [Project Requirements](docs/project-requirements.md)

## Packaging And Release

Electron packaging is configured in `package.json`.

Current targets:

- Windows portable executable
- macOS DMG and ZIP

The GitHub release workflow is `.github/workflows/release.yml` and runs for tags matching `v*`.

## Known Reset Notes

- The upstream README and old docs contained roadmap claims that were not fully implemented.
- Manual backup UI is currently unmounted.
- The update checker currently points to the upstream release endpoints.
- Automated test coverage is not established.

## License

MIT. See [LICENSE](LICENSE).
