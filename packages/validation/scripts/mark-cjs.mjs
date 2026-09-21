import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// This package is "type": "module", so Node would read dist/cjs/*.js as ES modules. The compiled
// CommonJS output needs its own package.json saying otherwise.
const dir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist", "cjs");
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, "package.json"), '{ "type": "commonjs" }\n');
