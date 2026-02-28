# Task Manager Monorepo

This repository contains the monorepo version of the TaskFlow task management application.
The codebase is split into **apps/web** (Next.js frontend/back-end) and **packages/common-types** for shared schemas and types.

## Getting started

```bash
# install dependencies
pnpm install

# run development server
pnpm dev

# build all packages
pnpm build

# lint all packages
pnpm lint

# run tests (none defined yet)
pnpm test
```

## Workspace structure

```
/
├─ apps/
│   └─ web/           # Next.js application
└─ packages/
    └─ common-types/  # Shared Zod schemas & TS interfaces
```

The `@taskmanager/common-types` package is consumed by the web app using the workspace protocol.

## Notes

* Use `turbo` for running tasks across packages.
* Keep environment variables in `.env.local` under `apps/web`.
* Delete the old standalone project once migration is complete.

## Monorepo migration summary

The original single-app repository was migrated into this workspace by:
1. Creating a new root with `pnpm` workspaces and `turbo.json`.
2. Copying the existing Next.js code into `apps/web`.
3. Extracting shared Zod schemas and types into `packages/common-types`.
4. Updating imports in the app to reference the shared package.
5. Configuring TypeScript paths and workspace dependency.
6. Ensuring the package emits compiled output and adjusting tsconfig settings.
7. Validating `pnpm install`, `pnpm dev`, `pnpm build`, and linting from the root.

This structure enables scalable development, faster builds, and code reuse.
