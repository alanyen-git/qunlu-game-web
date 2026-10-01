#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");

const runtime=fs.readFileSync("src/runtime.js","utf8");
const ota=fs.readFileSync("mobile/ota-bootstrap.js","utf8");
const architecture=fs.readFileSync("mobile/ARCHITECTURE.md","utf8");
const html=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));

assert.equal(version.version,"CURRENT-2.25.20");
assert.equal(version.previous_version,"CURRENT-2.25.19");
assert.equal(version.pwa_cache_revision,"v199");
assert.match(runtime,/raw\.githubusercontent\.com\/alanyen-git\/qunlu-game-web\/main\/version\.json/);
assert.match(runtime,/checkForGameUpdate\(true\)/);
assert.match(runtime,/QUNLU_NATIVE_UPDATE/);
assert.doesNotMatch(runtime,/checkForGameUpdate\(false\)/);
assert.doesNotMatch(runtime,/setInterval\(\(\)=>checkForGameUpdate/);
assert.match(runtime,/連線 GitHub 檢查更新/);
assert.match(runtime,/legacy save restore failed; trying expanded storage/);
assert.match(runtime,/expanded save restore failed/);
assert.match(runtime,/legacy save is incomplete/);
assert.match(sw,/CACHE_NAME=CACHE_PREFIX\+"v199"/);

assert.match(ota,/GITHUB_VERSION_URL\s*=\s*"https:\/\/raw\.githubusercontent\.com\/alanyen-git\/qunlu-game-web\/main\/version\.json"/);
assert.match(ota,/globalThis\.QUNLU_NATIVE_UPDATE/);
assert.match(ota,/CapacitorUpdater\.download/);
assert.match(ota,/CapacitorUpdater\.next/);
const startup=ota.slice(ota.indexOf("async function startNativeUpdates()"),ota.indexOf("void startNativeUpdates();"));
assert.doesNotMatch(startup,/checkForGameUpdate/);
assert.match(architecture,/manually connects to GitHub/);
assert.match(architecture,/interrupt an active session/);
console.log(`Manual GitHub update flow OK: ${version.version}, PWA ${version.pwa_cache_revision}, Android versionCode 2025020`);
