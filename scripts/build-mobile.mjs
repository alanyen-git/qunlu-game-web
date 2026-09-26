import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

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

// The OTA bridge only exists in the native package; the web/PWA entry point stays unchanged.
const mobileOutput = join(output, "mobile");
mkdirSync(mobileOutput, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ["mobile/ota-bootstrap.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  outfile: join(mobileOutput, "ota-bootstrap.js")
});

const indexPath = join(output, "index.html");
let html = await readFile(indexPath, "utf8");
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
if (!statSync(indexPath).isFile()) {
  throw new Error("Mobile package does not contain index.html");
}
if (!html.includes("</body>")) {
  throw new Error("Cannot attach the native update bridge: </body> was not found.");
}
html = html.replace("</body>", '  <script type="module" src="./mobile/ota-bootstrap.js"></script>\n</body>');
await writeFile(indexPath, html);
console.log(`Mobile web runtime prepared at ${output}`);
console.log(`Bundled native OTA bridge and verified ${localReferences.length} local HTML asset references.`);
