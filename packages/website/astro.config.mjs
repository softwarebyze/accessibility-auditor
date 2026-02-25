import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://softwarebyze.github.io",
  base: "/accessibility-auditor/",
  build: {
    assets: "_assets",
  },
});
