"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const ctx=vm.createContext({console,globalThis:null,QUNLU_CORE:{release:x=>x,registerModule(){}}});
ctx.globalThis=ctx;
for(const file of ["src/game-data.js","src/data-patches.js","src/starter-settlements-v1.js"]){
  vm.runInContext(fs.readFileSync(file,"utf8")+";globalThis.DB=DB;",ctx,{filename:file,timeout:30000});
}
ctx.G={character:{locationId:"L-START-DAWNGRAIN",level:1,currentFacility:"church"},quests:[],questHistory:[],worldState:{}};
ctx.totalHours=()=>0;
ctx.shortestTravelHours=(from,to)=>{
  const a=ctx.DB.locations.find(x=>x.id===from),b=ctx.DB.locations.find(x=>x.id===to);
  if(!a||!b)return Infinity;
  if(a.id===b.id)return 0;
  return b.starter_cluster_id===a.starter_cluster_id?1:100;
};
ctx.questViableLocations=()=>[];
ctx.questTemplateViable=()=>true;ctx.questMarketAvailable=()=>true;
ctx.questTemplate=id=>ctx.DB.quest_templates.find(x=>x.id===id)||null;
ctx.persist=()=>{};ctx.guildQuests=()=>{};ctx.facilityQuest=()=>{};
ctx.turnInQuest=()=>{};ctx.acceptGuildQuest=()=>{};ctx.acceptFacilityQuest=()=>{};
ctx.generateAuthorityRequests=function(){
  return ctx.DB.authority_request_archetypes.map(t=>({
    id:"ARQ-TEST-"+t.id,templateId:t.id,sourceId:"OFFICE-TEST",
    objective:JSON.parse(JSON.stringify(t.objective))
  }));
};
ctx.acceptAuthorityRequest=function(_polityId,_officeId,templateId){
  const t=ctx.DB.authority_request_archetypes.find(x=>x.id===templateId);
  ctx.G.quests.push({id:"AQ-TEST",templateId:t.id,objective:JSON.parse(JSON.stringify(t.objective)),
    viableLocationIds:t.objective.location_id?[t.objective.location_id]:[]});
};
vm.runInContext(fs.readFileSync("src/quest-regional-ecology-v1.js","utf8"),ctx,{filename:"src/quest-regional-ecology-v1.js",timeout:30000});

const town=ctx.DB.locations.find(x=>x.id==="L-START-DAWNGRAIN");
const canonical=ctx.DB.authority_request_archetypes;
const original=JSON.stringify(canonical.map(x=>x.objective));
const published=ctx.generateAuthorityRequests("POL-004");
const patrol=published.find(x=>x.templateId==="AUTHQ-PATROL");
const road=published.find(x=>x.templateId==="AUTHQ-ROAD");
assert.ok(patrol&&road,"晨穗村應保留可在當地完成的巡查與道路政務委託");
for(const q of [patrol,road]){
  const target=ctx.DB.locations.find(x=>x.id===q.objective.location_id);
  assert.ok(target&&target.starter_cluster_id===town.starter_cluster_id,q.templateId+" 必須指向晨穗村自己的野外地圖");
  assert.equal(q.viableLocationIds[0],target.id);
  assert.notEqual(target.id,"L-WOOD","不得發布柳橋鎮灰橡林緣作為晨穗村委託目標");
  assert.notEqual(target.id,"L-MEADOW","不得發布柳橋鎮長草牧野作為晨穗村委託目標");
}
assert.equal(JSON.stringify(canonical.map(x=>x.objective)),original,"公告不得改寫正史政務模板");

ctx.acceptAuthorityRequest("POL-004","OFFICE-TEST","AUTHQ-PATROL");
const accepted=ctx.G.quests.find(x=>x.templateId==="AUTHQ-PATROL");
assert.ok(accepted,"可接取地方政務委託");
const acceptedTarget=ctx.DB.locations.find(x=>x.id===accepted.objective.location_id);
assert.equal(acceptedTarget&&acceptedTarget.starter_cluster_id,town.starter_cluster_id,"接取時必須保存公告中的當地目標");
assert.equal(accepted.viableLocationIds[0],acceptedTarget.id);
assert.equal(JSON.stringify(canonical.map(x=>x.objective)),original,"接取後也不得改寫正史政務模板");
console.log("STARTER-AUTHORITY-QUEST-LOCALIZATION-1.0 regression OK: 晨穗村政務巡查／道路委託公告與接取均使用本地野外地圖");
