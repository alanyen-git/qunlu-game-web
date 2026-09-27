import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const androidRoot = join(root, "android");
const gradleCandidates = [
  join(androidRoot, "app", "build.gradle"),
  join(androidRoot, "app", "build.gradle.kts")
];
const gradlePath = gradleCandidates.find(existsSync);
if (!gradlePath) throw new Error("Android app Gradle file was not generated.");

const versionData = JSON.parse(await readFile(join(root, "version.json"), "utf8"));
const match = String(versionData.version || "").match(/^CURRENT-(\d+)\.(\d+)\.(\d+)$/);
if (!match) throw new Error(`Invalid release version: ${versionData.version}`);
const [, major, minor, patch] = match.map(Number);
const versionName = `${major}.${minor}.${patch}`;
// Monotonic Android version code: CURRENT-2.25.9 -> 2025009.
const versionCode = major * 1_000_000 + minor * 1_000 + patch;
const stableKeystore = join(androidRoot, "app", "qunlu-update.keystore");
if (!existsSync(stableKeystore)) throw new Error("Stable Android update keystore is missing.");

let source = await readFile(gradlePath, "utf8");
if (gradlePath.endsWith(".kts")) {
  source = source.replace(/versionCode\s*=\s*\d+/, `versionCode = ${versionCode}`);
  source = source.replace(/versionName\s*=\s*"[^"]*"/, `versionName = "${versionName}"`);
  source += `\n// QUNLU-STABLE-UPDATE-SIGNING\nandroid {\n  signingConfigs {\n    create("qunluUpdate") {\n      storeFile = file("$projectDir/qunlu-update.keystore")\n      storePassword = "qunlu-update-2026"\n      keyAlias = "qunlu-update"\n      keyPassword = "qunlu-update-2026"\n    }\n  }\n  buildTypes {\n    getByName("debug") { signingConfig = signingConfigs.getByName("qunluUpdate") }\n  }\n}\n`;
} else {
  source = source.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  source = source.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
  source += `\n// QUNLU-STABLE-UPDATE-SIGNING\nandroid {\n  signingConfigs {\n    qunluUpdate {\n      storeFile file("$projectDir/qunlu-update.keystore")\n      storePassword "qunlu-update-2026"\n      keyAlias "qunlu-update"\n      keyPassword "qunlu-update-2026"\n    }\n  }\n  buildTypes {\n    debug { signingConfig signingConfigs.qunluUpdate }\n  }\n}\n`;
}
await writeFile(gradlePath, source);
console.log(`Android ${versionName} configured with versionCode ${versionCode} and stable update signing.`);
