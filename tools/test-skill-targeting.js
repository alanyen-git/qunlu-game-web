"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const ids=["C9-FIREMAGE","C9-LIGHTNINGMAGE","C9-SWORDSMAN","C9-WINDMAGE","C9-WHITEMAGE","C9-KNIGHT"];
const skill_pools=Object.fromEntries(ids.map(id=>[id,[]]));
skill_pools["C9-FIREMAGE"].push({id:"OLD-SINGLE",name:"火球術",tier:"F",kind:"主動",damage_type:"magic"});
const context=vm.createContext({
 DB:{skill_pools,combat_classes:ids.map(id=>({id,name:id})),shared_skills:[],skill_design_system:{skill_records:1},management_ai:[{id:"AI-SKILL",inputs:[],validations:[]}],meta:{}},
 skillMechanicsFor:s=>({traits:s.name==="全體治療"?["group_heal"]:[],group_heal_ratio:.78}),
 console,Math
});
vm.runInContext(fs.readFileSync("src/skill-targeting-v1.js","utf8"),context,{filename:"src/skill-targeting-v1.js"});
const api=context.QUNLU_SKILL_TARGETING;
assert.ok(api,"target geometry API missing");
const enemies=Array.from({length:6},(_,i)=>({battleId:"e"+i,hp:10}));
const idsOf=x=>Array.from(x,e=>e.battleId);
assert.deepEqual(idsOf(api.formationTargets("cross",enemies,"e1")),["e0","e1","e2","e4"]);
assert.deepEqual(idsOf(api.formationTargets("row",enemies,"e4")),["e3","e4","e5"]);
assert.deepEqual(idsOf(api.formationTargets("column",enemies,"e2")),["e2","e5"]);
assert.deepEqual(idsOf(api.formationTargets("all",enemies)),["e0","e1","e2","e3","e4","e5"]);
enemies[4].hp=0;
assert.deepEqual(idsOf(api.formationTargets("cross",enemies,"e1")),["e0","e1","e2"]);
const unique=api.sampleWithoutReplacement(["self","companion","party:0","party:1","party:2"],4,()=>.25);
assert.equal(unique.length,4);assert.equal(new Set(unique).size,4);
const created=ids.flatMap(id=>context.DB.skill_pools[id]).filter(s=>s.id?.startsWith("SK-TGT-"));
assert.equal(created.length,7);
for(const name of ["爆裂火球","連鎖閃電","劍氣斬","颶風術","治療波","全體治療","盾牆"])assert.ok(created.some(s=>s.name===name),"missing area skill: "+name);
assert.equal(context.DB.skill_pools["C9-LIGHTNINGMAGE"].find(s=>s.name==="連鎖閃電").allow_repeat,true);
assert.equal(context.DB.skill_pools["C9-WHITEMAGE"].find(s=>s.name==="全體治療").mechanics.group_heal_ratio,1);
assert.ok(context.DB.skill_targeting_system.save_compatible);
console.log("skill targeting regression OK: six geometries, random unique allies, seven skills, repeatable chain, full-team heal");
