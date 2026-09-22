/* COMBAT-CLASS-PROGRESSION-1.0 regression: sealed B class and normal B route. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const src=fs.readFileSync("src/combat-class-progression-v1.js","utf8");
const holy={id:"C-HOLY",name:"聖劍士",tier:"B",unlock_level:36,progression_from:["C-WAR"]};
const war={id:"C-WAR",name:"見習劍士",tier:"C",unlock_level:20};
const c={
  classId:holy.id,combatGrade:"F",classSealed:true,classMastery:100,level:70,xp:114,
  currentFacility:"guild",locationId:"T-B",unlockedClassRoutes:[],classHistory:[],
  faith:{patronDeityId:"D1",oathId:"O1"}
};
const G={character:c,turn:100,quests:[],questHistory:[]},events={modals:[],checks:[],logs:[],persist:0};
const ctx={
  DB:{
    meta:{},combat_classes:[holy,war],locations:[{id:"T-B",tier:"B"}],
    class_design_system:{unlock_levels:{E:5,D:12,C:22,B:35,A:56,S:78}},
    faith_entities:[{id:"D1",pantheon_id:"P1"}],
    faith_oaths:[{id:"O1",pantheons:["P1"]}]
  },
  G,console,
  classMasteryNeed:grade=>({E:15,D:30,C:45,B:65,A:80,S:100}[grade]||100),
  classAdvanceCandidates(){
    if(c.classSealed||c.classId!==war.id)return [];
    return [{c:holy,ok:c.level>=holy.unlock_level&&c.classMastery>=65&&c.unlockedClassRoutes.includes(holy.id)}]
  },
  showModal:(title,html)=>events.modals.push({title,html}),
  showBlockedRequirements:(title,checks)=>events.checks.push({title,checks}),
  beginTurn:()=>{G.turn++;return true},
  endTurn:()=>{},persist:()=>{events.persist++;return true},
  log:(...x)=>events.logs.push(x),alert:()=>{},
  timeText:()=>"T"+G.turn,
  openClassAdvancement(){},
  unsealCurrentClass(){},
  advanceCombatClass(id){if(ctx.classAdvanceCandidates().some(x=>x.c.id===id&&x.ok)){c.classId=id;c.combatGrade="B";c.classMastery=0}},
  awardBattleProgress(){},
  turnInQuest(id){const q=G.quests.find(x=>x.id===id);if(q){G.quests=G.quests.filter(x=>x.id!==id);G.questHistory.unshift({id:q.id})}},
  runAudit(){G.lastAudit={issues:[]}},
  QUNLU_CORE:{registerModule(){}}
};
vm.createContext(ctx);vm.runInContext(src,ctx,{filename:"src/combat-class-progression-v1.js"});
assert.equal(ctx.DB.meta.combat_class_progression_revision,"COMBAT-CLASS-PROGRESSION-1.1");
assert.equal(c.classPromotionExam,undefined,"legacy save has no exam state");
ctx.openClassAdvancement();
assert.match(events.modals.at(-1).html,/封印逐階解封/);
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"E");assert.equal(c.classSealed,true);
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"E","mastery must not be skipped");
c.classMastery=100;ctx.DB.locations[0].tier="F";ctx.unsealCurrentClass();
assert.equal(c.combatGrade,"E","F town cannot host D qualification");
ctx.DB.locations[0].tier="B";
for(const grade of ["D","C"]){ctx.unsealCurrentClass();assert.equal(c.combatGrade,grade);c.classMastery=100}
ctx.openClassAdvancement();
assert.match(events.modals.at(-1).html,/onclick="requestCombatClassExam\(&#39;C-HOLY&#39;\)"/,"HTML action must quote class ID safely");
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"C","B requires qualification");
ctx.requestCombatClassExam(holy.id);assert.equal(c.classPromotionExam.winsNeeded,3);
ctx.awardBattleProgress({tier:"E"});assert.equal(c.classPromotionExam.wins,0,"weak monster cannot satisfy B exam");
for(let i=0;i<3;i++)ctx.awardBattleProgress({tier:"C"});
assert.equal(c.classPromotionExam.wins,3);
G.quests=[{id:"SQ",tier:"C",sourceType:"subjob_exam",turninFacility:"guild"}];ctx.turnInQuest("SQ");
assert.equal(c.classPromotionExam.reports,0,"subjob exam does not count");
G.quests=[{id:"Q1",tier:"C",turninFacility:"guild"}];ctx.turnInQuest("Q1");
assert.equal(c.classPromotionExam.reports,1);
const saveCount=events.persist;assert.ok(saveCount>0,"quest progress persisted");
c.faith.oathId=null;ctx.finishCombatClassExam(holy.id);
assert.equal(c.unlockedClassRoutes.length,0,"holy oath must be complete");
assert.ok(events.checks.at(-1).checks.some(x=>x.label==="聖職誓言"&&!x.ok),"shows missing oath");
c.faith.oathId="O1";ctx.finishCombatClassExam(holy.id);
assert.ok(c.unlockedClassRoutes.includes(holy.id));
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"B");assert.equal(c.classSealed,false);
assert.equal(c.xp,114,"normal character XP unchanged");
assert.equal(c.classHistory.length,4,"four grade-by-grade history entries");
assert.equal(c.classPromotionExam,null,"completed exam is cleared");
c.classId=war.id;c.classSealed=false;c.combatGrade="C";c.classMastery=100;c.unlockedClassRoutes=[];c.classExamHistory=[];c.classPromotionExam=null;
ctx.advanceCombatClass(holy.id);assert.equal(c.classId,war.id,"normal B class needs qualification");
ctx.requestCombatClassExam(holy.id);assert.equal(c.classPromotionExam.targetId,holy.id);
for(let i=0;i<3;i++)ctx.awardBattleProgress({tier:"C"});
G.quests=[{id:"Q2",tier:"C",turninFacility:"guild"}];ctx.turnInQuest("Q2");
ctx.finishCombatClassExam(holy.id);
ctx.advanceCombatClass(holy.id);assert.equal(c.classId,holy.id,"normal B class unlocks after qualification");

/* Higher-tier origin: passing B examination must never waive A examination. */
const arch={id:"C-HOLY-A",name:"聖劍士宗師",tier:"A",unlock_level:57};
ctx.DB.combat_classes.push(arch);
c.classId=arch.id;c.combatGrade="C";c.classSealed=true;c.classMastery=100;
c.unlockedClassRoutes=[];c.classExamHistory=[];c.classPromotionExam=null;
ctx.requestCombatClassExam(arch.id);assert.equal(c.classPromotionExam.targetGrade,"B");
for(let i=0;i<3;i++)ctx.awardBattleProgress({tier:"C"});
G.quests=[{id:"Q3",tier:"C",turninFacility:"guild"}];ctx.turnInQuest("Q3");
ctx.finishCombatClassExam(arch.id);
assert.equal(c.unlockedClassRoutes.length,0,"intermediate B must not grant final A qualification");
assert.ok(c.classExamHistory.some(x=>x.targetGrade==="B"));
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"B");
c.classMastery=100;
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"B","A still needs its own exam");
ctx.requestCombatClassExam(arch.id);assert.equal(c.classPromotionExam.targetGrade,"A");
for(let i=0;i<5;i++)ctx.awardBattleProgress({tier:"B"});
for(let i=0;i<2;i++){const id="AQ"+i;G.quests=[{id,tier:"B",turninFacility:"guild"}];ctx.turnInQuest(id)}
ctx.finishCombatClassExam(arch.id);
assert.ok(c.unlockedClassRoutes.includes(arch.id),"A qualification issued on passing A exam");
ctx.unsealCurrentClass();assert.equal(c.combatGrade,"A");assert.equal(c.classSealed,false);
console.log("PASS combat class progression: sealed F→E→D→C→B, guild tiers, mastery, high-rank exam, holy oath, quest persistence, normal B class, legacy save");