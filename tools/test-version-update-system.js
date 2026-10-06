#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");

const runtime=fs.readFileSync("src/runtime.js","utf8");
const ota=fs.readFileSync("mobile/ota-bootstrap.js","utf8");
const architecture=fs.readFileSync("mobile/ARCHITECTURE.md","utf8");
const html=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const water=fs.readFileSync("src/water-source-v1.js","utf8");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));

assert.equal(version.version,"CURRENT-2.25.24");
assert.equal(version.previous_version,"CURRENT-2.25.23");
assert.equal(version.pwa_cache_revision,"v203");
assert.match(runtime,/raw\.githubusercontent\.com\/alanyen-git\/qunlu-game-web\/main\/version\.json/);
assert.match(runtime,/checkForGameUpdate\(true\)/);
assert.match(runtime,/QUNLU_NATIVE_UPDATE/);
assert.doesNotMatch(runtime,/checkForGameUpdate\(false\)/);
assert.doesNotMatch(runtime,/setInterval\(\(\)=>checkForGameUpdate/);
assert.match(runtime,/連線 GitHub 檢查更新/);
assert.match(runtime,/legacy save restore failed; trying expanded storage/);
assert.match(runtime,/expanded save restore failed/);
assert.match(runtime,/legacy save is incomplete/);
assert.match(sw,/CACHE_NAME=CACHE_PREFIX\+"v203"/);

assert.equal(version.full_program_debug.stateful_tests,12);
assert.equal(version.program_optimization.quest_viability_cache,true);
assert.equal(version.program_optimization.water_source_audit_read_only,true);
assert.ok(runtime.includes("function runtimeIndexSourcesChanged()"));
const auditStart=water.indexOf("function runWaterSourceAudit(){");
const auditEnd=water.indexOf("\n  }\n\n  if(typeof renderActions",auditStart);
assert.ok(auditStart>=0&&auditEnd>auditStart);
const waterAudit=water.slice(auditStart,auditEnd);
assert.equal(waterAudit.includes("syncContentLinkItemSources()"),false);
assert.ok(waterAudit.includes("missing_item_source_ids"));
assert.match(ota,/GITHUB_VERSION_URL\s*=\s*"https:\/\/raw\.githubusercontent\.com\/alanyen-git\/qunlu-game-web\/main\/version\.json"/);
assert.match(ota,/globalThis\.QUNLU_NATIVE_UPDATE/);
assert.match(ota,/CapacitorUpdater\.download/);
assert.match(ota,/CapacitorUpdater\.next/);
const startup=ota.slice(ota.indexOf("async function startNativeUpdates()"),ota.indexOf("void startNativeUpdates();"));
assert.doesNotMatch(startup,/checkForGameUpdate/);
assert.match(architecture,/manually connects to GitHub/);
assert.match(architecture,/interrupt an active session/);
console.log(`Manual GitHub update flow OK: ${version.version}, PWA ${version.pwa_cache_revision}, Android versionCode 2025023`);
