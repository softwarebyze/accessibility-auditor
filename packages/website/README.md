# Reach — Marketing site

Static marketing site for Reach. Built with [Astro](https://astro.build).

## Commands

From **repo root**:

- `bun run site` — dev server (http://localhost:4321)
- `bun run site:build` — build to `packages/website/dist`
- `bun run site:preview` — serve the built site

From **packages/website**:

- `bun run dev` / `bun run build` / `bun run preview`

## Deploy

After `bun run site:build`, deploy the contents of `packages/website/dist` to any static host. Set build command to `bun run build` from the `packages/website` directory, or use root script `bun run site:build` with publish directory `packages/website/dist`.
