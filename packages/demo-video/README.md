# Reach marketing demo (Remotion)

~55s product demo using **real** `reach-a11y` CLI output. Renders to `out/ReachDemo.mp4`.

## Preview

```bash
cd packages/demo-video
npm install
npm run dev
```

## Render

```bash
npm run render
```

Output: `out/ReachDemo.mp4` (1920×1080, 30fps).

## Regenerate captures

After changing the CLI output format:

```bash
chmod +x scripts/capture-output.sh
./scripts/capture-output.sh
# then trim/update src/data/captures.ts
```

## Scenes

1. Intro — Reach brand
2. Quick check — pass/fail
3. Full audit — violations report
4. Crawl — multi-page summary
5. History — trends
6. Features — Quick, Audit, Crawl, History, JSON, MCP
7. Outro — `npx reach-a11y audit …`
