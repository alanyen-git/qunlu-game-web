#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const bootstrap=fs.readFileSync("src/bootstrap.js","utf8");
const runtime=fs.readFileSync("src/runtime.js","utf8");
assert.doesNotMatch(runtime,/\beval\s*\(/,"runtime generator lookup must not use eval");
assert.match(runtime,/GENERATOR_RUNTIME_FUNCTIONS/);
for(const file of [
  "src/asdail-narrative-runtime-v1.js",
  "src/npc-depth-v1.js",
  "src/npc-depth-v2.js",
  "src/world-autonomy-v1.js",
  "src/world-autonomy-v2.js",
  "src/system-integrity-v2.js"
]){
  const source=fs.readFileSync(file,"utf8");
  assert.match(source,/registerInterval/, `${file} must use the shared interval registry`);
}
let nextId=0,created=0,cleared=0;
const context=vm.createContext({
  console,
  setInterval(fn,ms){created+=1;return {id:++nextId,fn,ms}},
  clearInterval(){cleared+=1},
  Date
});
context.globalThis=context;
vm.runInContext(bootstrap,context,{filename:"src/bootstrap.js"});
const core=context.QUNLU_CORE;
assert(core&&typeof core.registerInterval==="function");
const first=core.registerInterval("duplicate-safe",()=>{},30000);
const second=core.registerInterval("duplicate-safe",()=>{},30000);
assert.equal(first,second);
assert.equal(created,1,"duplicate interval keys must create one timer");
assert.equal(JSON.stringify(core.intervalSnapshot()),JSON.stringify(["duplicate-safe"]));
assert.equal(core.unregisterInterval("duplicate-safe"),true);
assert.equal(core.unregisterInterval("duplicate-safe"),false);
assert.equal(cleared,1);
console.log("runtime refactor regression OK: explicit generator contract registry and idempotent shared intervals");
