import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

const UPDATE_MANIFEST_URL = "https://alanyen-git.github.io/qunlu-game-web/mobile/update-manifest.json";
const BUNDLE_PREFIX = new URL("./bundles/", UPDATE_MANIFEST_URL).href;

async function readJson(response) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`HTTP ${response.status}`);
  }
  return typeof response.data === "string" ? JSON.parse(response.data) : response.data;
}

function compareVersions(left, right) {
  const digits = value => (String(value).match(/\d+(?:\.\d+)+/) || ["0.0.0"])[0].split(".").map(Number);
  const a = digits(left);
  const b = digits(right);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function checkForGameUpdate() {
  const [localResponse, remoteResponse] = await Promise.all([
    CapacitorHttp.get({ url: new URL("version.json", document.baseURI).href, connectTimeout: 10000, readTimeout: 10000 }),
    CapacitorHttp.get({ url: UPDATE_MANIFEST_URL, connectTimeout: 10000, readTimeout: 10000 })
  ]);
  const local = await readJson(localResponse);
  const latest = await readJson(remoteResponse);
  if (!local?.version || !latest?.version || !latest?.bundleUrl) return;
  if (compareVersions(latest.version, local.version) <= 0) return;

  const bundleUrl = new URL(latest.bundleUrl, UPDATE_MANIFEST_URL).href;
  if (!bundleUrl.startsWith(BUNDLE_PREFIX)) {
    throw new Error("Update bundle URL is outside the trusted GitHub Pages bundle path.");
  }

  const bundle = await CapacitorUpdater.download({
    url: bundleUrl,
    version: latest.version
  });
  await CapacitorUpdater.next({ id: bundle.id });
  console.info(`群陸旅誌已下載遊戲更新 ${latest.version}；將於 App 進入背景或下次啟動時套用。`);
}

async function startNativeUpdates() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (error) {
    console.warn("Native updater readiness notification failed", error);
  }
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await checkForGameUpdate();
  } catch (error) {
    // A missing connection or a failed download must never block the game.
    console.info("Game update check skipped", error);
  }
}

void startNativeUpdates();
