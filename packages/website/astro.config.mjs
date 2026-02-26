import { defineConfig } from "astro/config";

const defaultBasePath = "/accessibility-auditor/";
const configuredBasePath = process.env.SITE_BASE_PATH ?? defaultBasePath;
const normalizedBasePath = configuredBasePath.startsWith("/")
  ? configuredBasePath
  : `/${configuredBasePath}`;
const basePath = normalizedBasePath.endsWith("/")
  ? normalizedBasePath
  : `${normalizedBasePath}/`;

export default defineConfig({
  site: "https://softwarebyze.github.io",
  base: basePath,
  build: {
    assets: "_assets",
  },
});
