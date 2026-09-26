import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");
const runtimePaths = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "version.json",
  "src",
  "assets",
  "icons"
];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const relativePath of runtimePaths) {
  const source = join(root, relativePath);
  if (!existsSync(source)) {
    throw new Error(`Required runtime path is missing: ${relativePath}`);
  }
  cpSync(source, join(output, relativePath), { recursive: true });
}

// Capacitor loads this packaged directory locally, so the native app starts
// from its bundled runtime and remains playable without a web connection.
const html = await (await import("node:fs/promises")).readFile(join(output, "index.html"), "utf8");
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
const localReferences = references.filter(path => !/^(?:[a-z]+:|\/\/|#)/i.test(path));
for (const path of localReferences) {
  const pathname = decodeURIComponent(path.split(/[?#]/, 1)[0]);
  if (!pathname) continue;
  const target = resolve(output, pathname);
  if (!target.startsWith(output + "/") && target !== output) {
    throw new Error(`Runtime reference escapes the packaged directory: ${path}`);
  }
  if (!existsSync(target)) {
    throw new Error(`Runtime reference is missing from the mobile package: ${path}`);
  }
}
if (!statSync(join(output, "index.html")).isFile()) {
  throw new Error("Mobile package does not contain index.html");
}
console.log(`Mobile web runtime prepared at ${output}`);
console.log(`Verified ${localReferences.length} local HTML asset references.`);
