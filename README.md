# Matrix Life OS

A local-first personal management desktop app built with React, TypeScript, Zustand, Vite, and Electron.

## Current Product Scope

The canonical product scope is [docs/project-requirements.md](docs/project-requirements.md).

Matrix Life OS supports four core records:

- Task
- Capture Note
- Goal Note
- Reflection

The app has three top-level areas:

- **Action**: Capture Notes, Weekly Task Board, and Goal Notes.
- **Review**: create and view dated Reflections.
- **System**: feature visibility, local data status, version, and short help.

Core use is local-first and does not require an account, cloud sync, collaboration, or network access.

## Storage

App state is persisted with Zustand persist.

Electron runtime:

- Data file: `app.getPath('userData')/alo-data.json`
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

There is currently no dedicated `test` script in `package.json`.

## Documentation

The rebuilt project documentation lives in [docs/](docs/README.md):

- [Project Requirements](docs/project-requirements.md)
- [Implementation Review](docs/implementation-review.md)
- [Remediation Plan](docs/remediation-plan.md)

## License

MIT. See [LICENSE](LICENSE).
