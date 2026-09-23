"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const ids=["C-BLADE","C-MAGE","C-HEAL","C-GUARD","C-RANGER","C-MONK"];
const names=["見習劍士","火焰法師","治療牧師","盾衛","遊俠","武僧"];
const DB={meta:{},combat_classes:ids.map((id,i)=>({id,name:names[i],tier:"F",selectable:true,combat_track:i===1||i===2?"magic":"physical",combat_identity:{family:i===1?"火元素":i===2?"聖療":i===3?"盾衛":"東方刃術",mechanic_tags:["招牌"]}})),skill_pools:{},shared_skills:[],skill_design_system:{skill_records:100},management_ai:[{id:"AI-SKILL",inputs:[],validations:[]}]};
for(const id of ids)DB.skill_pools[id]=[
 {id:id+"-F-A",name:"基礎斬擊",tier:"F",kind:"主動",damage_type:"physical",base_power_percent:100,resource_cost:3,class_signature:true},
 {id:id+"-F-U",name:"基礎守勢",tier:"F",kind:"輔助",damage_type:"buff"},
 {id:id+"-F-X",name:"通用連擊",tier:"F",kind:"主動",damage_type:"physical",base_power_percent:101}
];
DB.shared_skills=Array.from({length:6},(_,i)=>({id:"SH"+i,name:"初階共通"+i,tier:"F",kind:"主動",damage_type:i===1?"magic":"physical"}));
const char={classId:ids[0],combatGrade:"F",currentFacility:"guild",skills:[{...DB.skill_pools[ids[0]][0],skillXp:160,mastery:12}],classHistory:[]};
const G={character:char,turn:1},c={DB,G,globalThis:null,console,JSON,setTimeout:null,persist(){c.writes++},writes:0,beginTurn(){G.turn++;return true},endTurn(){},skillLevel(s){return s.skillXp>=160?7:1}};
c.globalThis=c;vm.createContext(c);
const src=fs.readFileSync("src/class-tier-skill-expansion-v1.js","utf8");vm.runInContext(src,c,{filename:"class-tier-skill-expansion-v1.js"});
const audit=c.runClassTierSkillExpansionAudit();assert.equal(audit.pass,true,audit.issues.join("\n"));
assert.equal(audit.stats.classes,6);assert.equal(audit.stats.byGrade.D,12);assert.equal(audit.stats.byGrade.B,12);
assert.equal(audit.stats.fPromoted,6);assert.equal(audit.stats.sharedPromoted,3);
for(const id of ids){
 const p=DB.skill_pools[id];assert.equal(p.filter(s=>s.tier==="F").length,2);
 for(const t of ["E","D","C","B"])assert.ok(p.some(s=>s.id==="SK-CTSE-"+id+"-"+t+"-A")&&p.some(s=>s.id==="SK-CTSE-"+id+"-"+t+"-U"));
 assert.ok(p.filter(s=>s.tier==="B"&&s.requires_class_exam).length>=2);
 assert.ok(p.some(s=>s.learn_only_via_upgrade));
}
let s=c.upgradeFoundationSkill("C-BLADE-F-A","C-BLADE");assert.equal(s.ok,false);assert.match(s.reason,/E/);
char.combatGrade="E";s=c.upgradeFoundationSkill("C-BLADE-F-A","C-BLADE");assert.equal(s.ok,true);assert.equal(char.skills[0].tier,"E");assert.equal(char.skills[0].skillXp,160);assert.equal(c.writes,1);
assert.equal(c.upgradeFoundationSkill("C-BLADE-F-A","C-BLADE").ok,false,"cannot re-upgrade");
const before=DB.skill_pools[ids[0]].length;vm.runInContext(src,c,{filename:"class-tier-skill-expansion-v1.js"});assert.equal(DB.skill_pools[ids[0]].length,before,"replay must not duplicate IDs");
console.log("class tier expansion regression OK: all classes E-B, F commons reduced, shared preserved, E evolution save and gating");
