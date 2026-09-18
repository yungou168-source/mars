# Contributing

This repository accepts only plugins, skills, extension metadata and release documentation.

1. Create a branch from `main`.
2. Add or update one extension in `plugins/` or `skills/`.
3. Include a license, README and a valid `mars-extension.json` for every market-ready extension.
4. Run `pnpm typecheck` and `node scripts/verify-public-repository.mjs`.
5. Open a pull request without binaries, credentials, deployment settings or user data.

Windows installers are Release assets. Do not commit `.exe`, `.msi` or other build outputs to Git history.
