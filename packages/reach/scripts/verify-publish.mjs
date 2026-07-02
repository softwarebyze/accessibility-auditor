#!/usr/bin/env node
/**
 * Guard: blocks accidental publish under the wrong npm name.
 * The CLI command is `reach`; the npm package must stay `reach-a11y`
 * (`reach` on npm is a different project).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "package.json",
);
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

if (pkg.name !== "reach-a11y") {
  console.error(
    `publish blocked: package name is "${pkg.name}" but must be "reach-a11y". ` +
      "The CLI binary remains `reach`.",
  );
  process.exit(1);
}

if (!pkg.bin?.reach) {
  console.error("publish blocked: package.json must define bin.reach");
  process.exit(1);
}
