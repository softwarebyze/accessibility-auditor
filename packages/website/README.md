# Reach — Marketing site

Static marketing site for Reach. Built with [Astro](https://astro.build).

## Commands

From **repo root**:

- `npm run site` — dev server (http://localhost:4321)
- `npm run site:build` — build to `packages/website/dist`
- `npm run site:preview` — serve the built site

From **packages/website**:

- `npm run dev` / `npm run build` / `npm run preview` (Bun equivalents also work)

## Deploy

After `npm run site:build`, deploy the contents of `packages/website/dist` to any static host. Set build command to `npm run build` from the `packages/website` directory, or use root script `npm run site:build` with publish directory `packages/website/dist`.
