# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Segundo Cérebro ("second brain") is a personal, single-user Next.js app for writing markdown
notes, storing references (files/links), and connecting them into a graph. There is no
authentication — it's designed for one user. The UI copy and error messages are in Portuguese
(pt-BR); keep new user-facing strings in Portuguese to match.

## Commands

```bash
npm install                  # also runs `prisma generate` via postinstall
npx prisma migrate deploy    # apply migrations to prisma/dev.db (run before first build/dev)
npm run dev                  # start dev server at http://localhost:3000
npm run build                # production build
npm start                    # run production build
npm run lint                 # next lint
```

Prisma workflow:
- `npm run prisma:migrate` — create/apply a new migration in development (`prisma migrate dev`)
- `npm run prisma:generate` — regenerate the Prisma client after editing `prisma/schema.prisma`
- Migration SQL lives under `prisma/migrations/`; edit `schema.prisma` then run
  `prisma:migrate` to generate the SQL rather than hand-writing it.

There is no test suite and no ESLint config in the repo (`next.config.js` sets
`eslint.ignoreDuringBuilds: true`), so `npm run build` is the main correctness check —
TypeScript is `strict: true`, and Next will fail the build on type errors.

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript, Prisma + SQLite, Tailwind CSS, `d3-force` for
graph layout, `react-markdown` + `remark-gfm` for rendering note content.

**Data model** (`prisma/schema.prisma`) — three models, all cascading on delete:
- `Space` — a "tema" (topic), has a `name`, unique `slug`, and a `color` used throughout the UI
  to tag items belonging to it.
- `Item` — the core content unit. `type` is a plain string (`"NOTE" | "FILE" | "LINK"`, not a
  Prisma enum) with the constraint enforced only in application code (see `ItemType` in
  `src/lib/types.ts`). Notes use `content` as markdown body; links use `url`; files use
  `fileName`/`filePath`/`fileSize`/`fileMime`, with the actual bytes on disk under `UPLOAD_DIR`
  (not in the DB).
- `Connection` — an edge between two `Item`s (`sourceId` → `targetId`, optional `label`).
  Uniqueness is enforced on `[sourceId, targetId]`; API routes that create connections
  additionally sort the pair and check both directions to prevent duplicate reverse edges (see
  `src/app/api/connections/route.ts`).

**Routing** (`src/app/`): App Router pages fetch data directly with the shared `prisma` client
(`src/lib/prisma.ts`, a standard Next.js singleton) inside async Server Components — there is no
separate data-fetching/service layer. Pages using `dynamic = "force-dynamic"` (e.g.
`src/app/page.tsx`) opt out of static generation because they read live DB state. Interactive
pieces (forms, the graph, search-as-you-type) are separate `"use client"` components under
`src/components/` that call the API routes.

**API routes** (`src/app/api/**/route.ts`): thin REST-ish handlers exporting `GET`/`POST`/
`PATCH`/`DELETE`. Conventions to follow when adding/editing routes:
- Validate/trim input manually (no schema library); return `NextResponse.json({ error: "..." },
  { status: 4xx })` with a Portuguese message on invalid input.
- Include related records (`include: { space: true }`, etc.) so responses are ready for direct
  UI consumption without extra client-side fetches.
- `src/app/api/upload/route.ts` writes uploaded files to `UPLOAD_DIR` under a random UUID
  filename (original name kept only in `fileName`); `src/app/api/items/[id]/route.ts` deletes the
  file from disk when its `Item` is deleted.
- `src/app/api/graph/route.ts` builds the `GraphData` (`{ nodes, edges }`) shape consumed by
  `GraphView`; filter logic for a single space lives here, not client-side.

**Graph view** (`src/components/GraphView.tsx`): runs `d3-force` synchronously (300 ticks, then
`.stop()`) to lay out nodes once on data change, not as a live simulation — dragging a node just
updates its position in React state directly, it doesn't re-run the simulation.

**File storage / deployment**: `UPLOAD_DIR` (`src/lib/uploads.ts`) defaults to `./uploads` but is
overridden in production. The app is deployed to Fly.io (`fly.toml`) with a persistent volume
mounted at `/data`; `DATABASE_URL` and `UPLOAD_DIR` point into that volume
(`file:/data/dev.db`, `/data/uploads`). `docker-entrypoint.sh` runs `prisma migrate deploy`
before starting the server. If `@flydotio/litestream` / `BUCKET_NAME` is configured, `dbsetup.js`
restores the SQLite DB from a replica bucket on boot and streams changes back — this path is only
exercised in the Fly.io deployment, not local dev.

**Path alias**: `@/*` maps to `src/*` (see `tsconfig.json`).
