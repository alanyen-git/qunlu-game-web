"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const source=fs.readFileSync("src/monster-behavior-depth-v1.js","utf8");
assert.match(source,/MONSTER-BEHAVIOR-DEPTH-1\.0/);
assert.match(source,/monster_behavior_profiles/);
assert.match(source,/monster_special_skills/);
assert.match(source,/window\.enemyBattleTurn/);
assert.match(source,/低血量追加領域轉相/);
for(const key of ["small","pack","brute","ambush","flight","raider","giant","dragon","venom","web","undead","wraith","blood","demon","element","plant","construct","slime","aquatic","humanoid"]){
  assert.match(source,new RegExp(key+":\\{"),"missing authored behavior family: "+key);
}
assert.match(source,/unique_key/);
assert.match(source,/runMonsterBehaviorAudit/);
console.log("monster behavior depth source OK: species signatures, special attacks, elite/boss phases");
