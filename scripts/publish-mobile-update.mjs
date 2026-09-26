import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const publicationRoot = resolve(process.argv[2] || "_site/mobile");
const commit = String(process.argv[3] || process.env.GITHUB_SHA || "local").slice(0, 12);
const repository = process.env.GITHUB_REPOSITORY || "alanyen-git/qunlu-game-web";
const [owner, repo] = repository.split("/");
if (!owner || !repo) throw new Error(`Invalid GitHub repository name: ${repository}`);

const versionData = JSON.parse(await (await import("node:fs/promises")).readFile(resolve(dist, "version.json"), "utf8"));
const version = String(versionData.version || "");
if (!/^CURRENT-\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Unexpected mobile bundle version: ${version}`);
}
const fileName = `${version}-${commit}.zip`;
const bundles = resolve(publicationRoot, "bundles");
mkdirSync(bundles, { recursive: true });
const bundlePath = resolve(bundles, fileName);
execFileSync("zip", ["-q", "-r", "-X", bundlePath, "."], { cwd: dist, stdio: "inherit" });

const baseUrl = `https://${owner}.github.io/${repo}/mobile/`;
const manifest = {
  schema: 1,
  appId: "io.github.alanyengit.qunlu",
  platforms: ["android"],
  version,
  commit,
  bundleUrl: `${baseUrl}bundles/${fileName}`
};
writeFileSync(
  resolve(publicationRoot, "update-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);
console.log(`Published OTA manifest for ${version}: ${manifest.bundleUrl}`);
