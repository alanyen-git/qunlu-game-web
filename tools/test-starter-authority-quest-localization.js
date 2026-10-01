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
  if((a.local_region_anchor_ids||[]).includes(b.parent_id))return 1;
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
ctx.generateFaithMissions=function(){
  const town=ctx.DB.locations.find(x=>x.id==="L-START-DAWNGRAIN");
  const local=ctx.DB.locations.find(x=>x.starter_cluster_id===town.starter_cluster_id&&x.kind==="wild"&&(x.gather||[]).length);
  return [
    {id:"FM-TEST-ACTION",templateId:"FAITH-TEST-ACTION",faithPantheonId:"P-TEST",objective:{kind:"action",location_id:"L-WOOD",target:1}},
    {id:"FM-TEST-GATHER",templateId:"FAITH-TEST-GATHER",faithPantheonId:"P-TEST",objective:{kind:"gather",item_id:local.gather[0],target:1}}
  ];
};
ctx.acceptFaithMission=function(id){
  const q=(ctx.G.tempFaithMissions||ctx.generateFaithMissions()).find(x=>x.id===id);
  if(q)ctx.G.quests.push({id:"AQ-FAITH-TEST",templateId:q.templateId,faithPantheonId:q.faithPantheonId,
    objective:JSON.parse(JSON.stringify(q.objective)),viableLocationIds:q.objective.location_id?[q.objective.location_id]:[],sourceType:"faith"});
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
console.log("STARTER-QUEST-LOCALIZATION-1.1 regression OK: 地方政務與神殿公告／接取均使用本地野外地圖");

const faith=ctx.generateFaithMissions(),faithAction=faith.find(x=>x.templateId==="FAITH-TEST-ACTION"),
  faithGather=faith.find(x=>x.templateId==="FAITH-TEST-GATHER");
assert.ok(faithAction&&faithGather,"晨穗村應只顯示具本地目標的神殿委託");
const faithTarget=ctx.DB.locations.find(x=>x.id===faithAction.objective.location_id);
assert.ok(faithTarget&&faithTarget.starter_cluster_id===town.starter_cluster_id,"神殿巡查須改用晨穗村野外地圖");
assert.notEqual(faithTarget.id,"L-WOOD","神殿委託不得沿用柳橋鎮灰橡林緣");
assert.deepEqual(Array.from(faithAction.viableLocationIds),[faithTarget.id]);
const localGatherIds=Array.from(faithGather.viableLocationIds);
assert.ok(localGatherIds.length>0,"採集型神殿委託須有本地可採集地圖");
assert.ok(localGatherIds.every(id=>ctx.DB.locations.find(x=>x.id===id)?.starter_cluster_id===town.starter_cluster_id),
  "採集型神殿委託不得列入其他新手村地圖");
ctx.G.tempFaithMissions=faith;
ctx.acceptFaithMission(faithAction.id);
const acceptedFaith=ctx.G.quests.find(x=>x.templateId==="FAITH-TEST-ACTION");
assert.ok(acceptedFaith,"神殿委託應可正常接取");
assert.equal(acceptedFaith.objective.location_id,faithAction.objective.location_id);
assert.deepEqual(Array.from(acceptedFaith.viableLocationIds),[faithAction.objective.location_id],
  "接取後需保存公告中的本地目標");

/* 瑟倫堡不是新手村，仍必須啟用相同的地圖隔離規則；
 * 測試王都舊資料以 parent_id 掛接時，不會回退成橋灣鎮／柳橋鎮地圖。 */
const selenburg=ctx.DB.locations.find(x=>x.id==="L-SELENBURG");
assert.ok(selenburg,"測試資料必須包含瑟倫堡");
const capitalWild={id:"TEST-SELENBURG-WILD",name:"王都測試近郊",kind:"wild",tier:"C",parent_id:"ASD-CAPITAL",gather:["I-HERB"]};
ctx.DB.locations.push(capitalWild);
ctx.G={character:{locationId:"L-SELENBURG",level:1,currentFacility:"church"},quests:[],questHistory:[],worldState:{}};
const capitalPublished=ctx.generateAuthorityRequests("POL-001");
for(const templateId of ["AUTHQ-PATROL","AUTHQ-ROAD"]){
  const q=capitalPublished.find(x=>x.templateId===templateId);
  assert.ok(q,"瑟倫堡應保留可在自身近郊完成的"+templateId+"政務委託");
  const target=ctx.DB.locations.find(x=>x.id===q.objective.location_id);
  assert.equal(target?.parent_id,"ASD-CAPITAL","瑟倫堡地方政務不得回退成其他城鎮的野外地圖");
  assert.notEqual(target?.id,"L-WOOD","瑟倫堡地方政務不得發布柳橋鎮灰橡林緣");
  assert.notEqual(target?.id,"L-MEADOW","瑟倫堡地方政務不得發布橋灣鎮長草牧野");
  assert.deepEqual(Array.from(q.viableLocationIds),[target.id]);
}
ctx.acceptAuthorityRequest("POL-001","OFFICE-TEST","AUTHQ-PATROL");
const acceptedCapital=ctx.G.quests.find(x=>x.templateId==="AUTHQ-PATROL");
const acceptedCapitalTarget=ctx.DB.locations.find(x=>x.id===acceptedCapital?.objective?.location_id);
assert.equal(acceptedCapitalTarget?.parent_id,"ASD-CAPITAL","瑟倫堡接取時必須保存王都近郊目標");
assert.deepEqual(Array.from(acceptedCapital?.viableLocationIds||[]),[acceptedCapitalTarget.id]);
assert.equal(JSON.stringify(canonical.map(x=>x.objective)),original,"瑟倫堡公告與接取不得改寫全域政務範本");
console.log("AUTHORITY-QUEST-LOCALIZATION-1.2 regression OK: 瑟倫堡與新手村均嚴格使用自身聚落地圖");
