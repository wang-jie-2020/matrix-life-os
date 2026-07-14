# Matrix Life OS

A local-first personal life management desktop app built with React, TypeScript, Zustand, Vite, and Electron.

This fork is being reset from a half-finished upstream state. The current documentation favors implemented behavior over old roadmap promises.

## Current Product Scope

The canonical product scope is documented in [docs/project-requirements.md](docs/project-requirements.md).

Matrix Life OS is being reset to four core records:

- Task.
- Capture Note.
- Goal Note.
- Reflection.

The required product areas are:

- Action Area.
- Review Area.
- System Area.

Core use must not require an account, cloud sync, collaboration, or network access. Manual backup, export, import, and recovery are not current product requirements.

## Current Implementation Status

The current source still contains upstream or pre-reset modules that are outside the current product scope. The remediation plan is to remove old module source code, not keep those modules as hidden or experimental features.

The app currently has three top-level pages:

- **Action Desk**: inbox, weekly task board, OKR, daily progress, principles, calendar, entertainment, and optional habit/mood/time-block/inspiration modules.
- **Review Archive**: reflection entry, reflection library, objective archive, abilities, and optional mood panel.
- **System**: module manager, about panel, quote panel, reflection template manager, data health panel, update panel, and manual panel.

Treat that list as existing implementation inventory, not as the target product surface.

## Storage

App state is persisted with Zustand persist.

Electron runtime:

- Main data file: `app.getPath('userData')/alo-data.json`
- Internal fallback file: `alo-data.json.bak`
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
- [Implementation Review](docs/implementation-review.md)
- [Remediation Plan](docs/remediation-plan.md)

## Packaging And Release

Electron packaging is configured in `package.json`.

Current targets:

- Windows portable executable
- macOS DMG and ZIP

The GitHub release workflow is `.github/workflows/release.yml` and runs for tags matching `v*`.

## Known Reset Notes

- The upstream README and old docs contained roadmap claims that were not fully implemented.
- Old modules are still present in source until remediation removes them.
- Manual backup/export/import/recovery are not current product requirements.
- Update checking is not part of current core use and is scheduled for removal.
- Automated test coverage is not established.

## License

MIT. See [LICENSE](LICENSE).
