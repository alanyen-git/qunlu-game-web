"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const ctx=vm.createContext({console,globalThis:null,QUNLU_CORE:{release:x=>x,registerModule(){}}});
ctx.globalThis=ctx;
for(const file of ["src/game-data.js","src/data-patches.js","src/starter-settlements-v1.js"]){
  vm.runInContext(fs.readFileSync(file,"utf8")+";globalThis.DB=DB;",ctx,{filename:file,timeout:30000});
}
ctx.G={character:{locationId:"L-START-DAWNGRAIN",level:1,currentFacility:"guild"},quests:[],questHistory:[],worldState:{}};
ctx.totalHours=()=>0;
ctx.shortestTravelHours=(from,to)=>{
  const a=ctx.DB.locations.find(x=>x.id===from),b=ctx.DB.locations.find(x=>x.id===to);
  if(!a||!b)return Infinity;
  if(a.id===b.id)return 0;
  if(a.starter_cluster_id&&a.starter_cluster_id===b.starter_cluster_id)return 1;
  return 100;
};
ctx.questViableLocations=t=>{
  const o=t.objective||{};
  if(["action","patrol"].includes(o.kind))return o.location_id?[o.location_id]:[];
  if(o.kind==="gather")return ctx.DB.locations.filter(x=>["wild","dungeon"].includes(x.kind)&&(x.gather||[]).includes(o.item_id)).map(x=>x.id);
  if(o.kind==="item")return ctx.DB.locations.filter(x=>x.kind==="town").map(x=>x.id);
  if(["kill","hunt"].includes(o.kind))return ctx.DB.locations.filter(x=>["wild","dungeon"].includes(x.kind)).map(x=>x.id);
  return [];
};
ctx.questTemplateViable=()=>true;
ctx.questMarketAvailable=()=>true;
ctx.questTemplate=id=>ctx.DB.quest_templates.find(x=>x.id===id)||null;
ctx.persist=()=>{};
ctx.guildQuests=()=>{};
ctx.facilityQuest=()=>{};
ctx.turnInQuest=()=>{};
ctx.acceptFacilityQuest=()=>{};
ctx.acceptGuildQuest=function(id){
  const t=ctx.questTemplate(id);
  ctx.G.quests.push({id:"AQ-TEST",templateId:t.id,objective:JSON.parse(JSON.stringify(t.objective)),viableLocationIds:[]});
};
vm.runInContext(fs.readFileSync("src/quest-regional-ecology-v1.js","utf8"),ctx,{filename:"src/quest-regional-ecology-v1.js",timeout:30000});

const db=ctx.DB,town=db.locations.find(x=>x.id==="L-START-DAWNGRAIN"),canonical=db.quest_templates.find(x=>x.id==="Q-PATROL");
assert.ok(town&&canonical,"晨穗村與基礎巡查模板必須存在");
const originalObjective=JSON.stringify(canonical.objective);
const originalTemplates=db.quest_templates;
db.quest_templates=[canonical];
const board=ctx.QUNLU_REGIONAL_QUEST.board(db.quest_templates,town,"guild");
const issued=board.selected.get(canonical.id);
assert.ok(issued,"晨穗村應發布巡查委託");
assert.equal(issued.objective.location_id,"L-DG-DEWFIELD");
assert.equal(JSON.stringify(issued.objective.checkpoints),JSON.stringify(["灌溉渠","穀田獸徑"]));
assert.equal(JSON.stringify(canonical.objective),originalObjective,"canonical quest template must remain immutable");

ctx.acceptGuildQuest(canonical.id);
const accepted=ctx.G.quests[0];
assert.equal(accepted.objective.location_id,"L-DG-DEWFIELD","newly accepted quest must use the starter village target");
assert.equal(JSON.stringify(accepted.objective.checkpoints),JSON.stringify(["灌溉渠","穀田獸徑"]));
assert.equal(JSON.stringify(accepted.viableLocationIds),JSON.stringify(["L-DG-DEWFIELD"]));
assert.equal(JSON.stringify(canonical.objective),originalObjective,"acceptance must not mutate canonical data");
db.quest_templates=originalTemplates;
console.log("STARTER-QUEST-LOCALIZATION-1.2 regression OK: 晨穗村巡查委託與巡查點同步至露鐘田野，canonical模板與舊存檔資料不改寫");
