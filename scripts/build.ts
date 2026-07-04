import { $, build } from "bun";
import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });

await Promise.all([
  build({
    entrypoints: [
      "src/browser/broadutils.ts",
      "src/browser/canvas/canvas.ts",
      "src/browser/data/data.ts",
      "src/browser/math/math.ts",
      "src/browser/misc/misc.ts",
      "src/browser/network/network.ts",
      "src/browser/timing/timing.ts",
      "src/browser/validate/validate.ts",
    ],
    outdir: "dist/browser",
    target: "browser",
    format: "esm",
    minify: true,
    sourcemap: "external",
    tsconfig: "tsconfig.browser.json",
    splitting: true,
  }),

  build({
    entrypoints: [
      "src/node/broadutils.ts",
      "src/node/data/data.ts",
      "src/node/environment/environment.ts",
      "src/node/filesystem/filesystem.ts",
      "src/node/math/math.ts",
      "src/node/misc/misc.ts",
      "src/node/timing/timing.ts",
      "src/node/validate/validate.ts",
    ],
    outdir: "dist/node",
    target: "node",
    format: "esm",
    minify: true,
    sourcemap: "external",
    tsconfig: "tsconfig.node.json",
    splitting: true,
  }),

  $`bunx tsc --project tsconfig.browser.json`,
  $`bunx tsc --project tsconfig.node.json`,
]);
