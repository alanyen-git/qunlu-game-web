/* 群陸旅誌：地區委託生態／城鎮差異與完成冷卻 CURRENT-2.13.7
 * REGIONAL-QUEST-ECOLOGY-1.1
 * 只從現有正史委託和已建檔可到達地圖發布；不創造不存在的地點／素材／魔物。
 * 保存於既有 G.worldState 下；不重置 G.quests、questHistory 或舊存檔。
 */
(()=>{
"use strict";
const REV="REGIONAL-QUEST-ECOLOGY-1.1";
const arr=x=>Array.isArray(x)?x:[];
const game=()=>typeof G!=="undefined"?G:null;
const db=()=>typeof DB!=="undefined"?DB:null;
const place=id=>arr(db()?.locations).find(x=>x.id===id)||null;
const hour=()=>typeof totalHours==="function"?Number(totalHours())||0:0;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rank=x=>Math.max(0,["F","E","D","C","B","A","S"].indexOf(x||"F"));
const hash=text=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const kind=t=>{const o=t?.objective||{};if(o.kind==="patrol"||o.kind==="action")return "調查／巡查";if(o.kind==="kill"||o.kind==="hunt")return "討伐／狩獵";if(o.kind==="gather"||o.kind==="item")return "採集／補給";return "其他";};
const target=t=>{const o=t?.objective||{};return [o.kind||"",o.location_id||"",o.action||"",o.item_id||"",o.monster_id||"",arr(o.monster_keywords).join("+"),arr(o.checkpoints).join("+")].join("|")};
const province=l=>l?.province_region_id||l?.province_id||"";
const region=l=>l?.world_region_id||l?.region_id||"";
const nearby=(a,b)=>{if(!a||!b)return false;if(a.id===b.id)return true;if(province(a)&&province(a)===province(b))return true;if(region(a)&&region(a)===region(b))return true;return false};
const travel=(a,b)=>typeof shortestTravelHours==="function"?shortestTravelHours(a,b):Infinity;
const state=()=>{const g=game();if(!g)return null;g.worldState=g.worldState||{};const s=g.worldState.regionalQuestEcology||(g.worldState.regionalQuestEcology={records:[]});s.records=arr(s.records).filter(x=>Number.isFinite(Number(x.completedHour)));s.records=s.records.slice(-160);return s};
function history(){
 const s=state();if(!s)return [];
 // 舊存檔若已記錄templateId與完成時間則恢復，避免重讀後立即重複發布。
 for(const h of arr(game()?.questHistory)){
  if(h?.status!=="完成"||!h.templateId||!Number.isFinite(Number(h.completedHour)))continue;
  if(!s.records.some(x=>x.questId===h.id))s.records.push({questId:h.id,templateId:h.templateId,signature:h.objectiveSignature||"",kind:h.category||"",townId:h.issuerTownId||"",provinceId:h.issuerProvinceId||"",completedHour:Number(h.completedHour)});
 }
 s.records=s.records.slice(-160);return s.records;
}
function cooldown(t,town){
 const now=hour(),p=province(town),signature=target(t),category=kind(t);
 for(const r of history()){
  const elapsed=now-Number(r.completedHour);
  if(elapsed<0||elapsed>168)continue;
  const sameTown=!!town&&r.townId===town.id,sameProvince=!!p&&r.provinceId===p;
  if(r.templateId===t.id&&(sameTown||sameProvince)&&elapsed<120)return "近期已完成同一委託";
  if(r.signature===signature&&signature&&(sameTown||sameProvince)&&elapsed<96)return "相同目標正在冷卻";
  if(sameTown&&category==="調查／巡查"&&r.kind===category&&elapsed<48)return "探索／巡查委託同城鎮48小時冷卻";
 }
 return "";
}
function validLocations(t,town){
 if(!town)return [];
 const raw=typeof questViableLocations==="function"?questViableLocations(t):arr(t.recommended_locations);
 const seen=new Set(),out=[];
 for(const id of raw){const l=place(id);if(!l||seen.has(id)||!Number.isFinite(travel(town.id,id)))continue;seen.add(id);
  const hours=travel(town.id,id);
  if(nearby(town,l)||hours<=20)out.push({id,hours,local:nearby(town,l)});
 }
 out.sort((a,b)=>Number(b.local)-Number(a.local)||a.hours-b.hours||a.id.localeCompare(b.id));
 return out;
}
function signatureOfTown(town){
 const eco=town?.local_economy||{};
 const adjectives=[];
 if(Number(eco.prosperity_score)>=70)adjectives.push("商業活躍");
 if(Number(eco.prosperity_score)>0&&Number(eco.prosperity_score)<40)adjectives.push("補給吃緊");
 const l=arr(db()?.locations).filter(x=>x.id!==town.id&&nearby(town,x));
 const counts={town:0,wild:0,dungeon:0};for(const x of l)if(counts[x.kind]!=null)counts[x.kind]++;
 if(counts.wild)adjectives.push("野外地圖"+counts.wild+"處");
 if(counts.dungeon)adjectives.push("地下城"+counts.dungeon+"處");
 const p=arr(db()?.province_region_maps).find(x=>x.id===province(town));
 return {label:(p?.display_name||p?.name||town.name),details:adjectives.join("｜")||"依周邊地圖與可達道路發布"};
}
let displayBoard=new Map();
function board(pool,town,facility){
 const g=game();if(!g||!town)return {list:pool,selected:new Map(),counts:{eligible:0,blocked:0}};
 const active=new Set(arr(g.quests).filter(q=>q.turninFacility===facility).map(q=>q.templateId));
 const eligible=[],kept=[],selected=new Map();let blocked=0;
 const day=Math.floor(hour()/24);
 for(const t of pool){
  if(!t?.id)continue;
  if(active.has(t.id)){kept.push(t);continue;}
  if(Number(g.character?.level)<Number(t.min_level||1)||Number(g.character?.level)>Number(t.max_level||99))continue;
  if(typeof questTemplateViable==="function"&&!questTemplateViable(t))continue;
  if(typeof questMarketAvailable==="function"&&!questMarketAvailable(t))continue;
  if(cooldown(t,town)){blocked++;continue;}
  const locations=validLocations(t,town);if(!locations.length)continue;
  const primary=locations[0],k=kind(t);
  const localBonus=primary.local?5:0;
  const categoryBonus=k==="調查／巡查"?0:k==="採集／補給"?1:2;
  const score=(hash([town.id,facility,day,t.id].join("|"))%1000)/100+localBonus+categoryBonus-primary.hours*.08;
  eligible.push({t,k,locations,score});
 }
 eligible.sort((a,b)=>b.score-a.score||a.t.id.localeCompare(b.t.id));
 const grade=rank(town.settlement_world_tier||town.tier||"F");
 const prosperity=Number(town.local_economy?.prosperity_score||50);
 const slots=Math.max(3,Math.min(9,4+Math.floor(grade/2)+(prosperity>=75?1:0)));
 const chosen=[],categoryCount=new Map(),recentKind=arr(history()).filter(x=>x.townId===town.id&&hour()-x.completedHour<24).map(x=>x.kind);
 for(const pass of [0,1,2]){
  for(const entry of eligible){
   if(chosen.length>=slots)break;
   if(chosen.includes(entry))continue;
   const n=categoryCount.get(entry.k)||0;
   if(pass===0&&(n>=1||recentKind.includes(entry.k)&&eligible.some(x=>x.k!==entry.k)))continue;
   if(pass===1&&n>=2)continue;
   chosen.push(entry);categoryCount.set(entry.k,n+1);
  }
 }
 for(const entry of chosen){
  // 只為本地發行更改展示文案；正史模板ID及真實目標保持不變。
  const local=entry.locations.filter(x=>x.local).slice(0,5);
  const sites=(local.length?local:entry.locations).slice(0,5).map(x=>x.id);
  const localized={...entry.t,
   name:entry.t.name,
   description:(entry.t.description||entry.t.desc||"")+"（"+town.name+"公會公告；本次依周邊實際可達地圖發布。）",
   desc:(entry.t.desc||entry.t.description||"")+"（"+town.name+"設施公告。）",
   recommended_locations:sites
  };
  selected.set(entry.t.id,{townId:town.id,townName:town.name,provinceId:province(town),places:sites,kind:entry.k,signature:target(entry.t),description:localized.description});
  kept.push(localized);
 }
 return {list:kept,selected,counts:{eligible:eligible.length,blocked,shown:chosen.length,slots}};
}
function intro(town,facility,result){
 const node=typeof document!=="undefined"?document.getElementById("modalBody"):null;
 if(!node||!town)return;
 const details=signatureOfTown(town),box=document.createElement("div");
 box.className="card small regional-quest-note";
 box.style.cssText="border-left:3px solid #b0a16b;padding:10px 13px;line-height:1.6;";
 box.textContent=town.name+"地方公告｜"+details.label+"｜"+details.details+"。同一巡查／探查任務完成後會暫停發布，公會按地方需要逐日調整委託。";
 if(result.counts.blocked)box.textContent+="｜近期完結暫停："+result.counts.blocked+"件。";
 node.prepend(box);
}
function decorateAccepted(q,entry){
 if(!q||!entry)return;
 q.issuerTownId=entry.townId;q.issuerTownName=entry.townName;
 q.issuerProvinceId=entry.provinceId;q.regionQuestCategory=entry.kind;q.objectiveSignature=entry.signature;
 q.description=entry.description;
 if(entry.places.length)q.viableLocationIds=entry.places.slice();
}
function patch(){
 if(globalThis.__REGIONAL_QUEST_ECOLOGY_PATCHED)return;
 const baseGuild=globalThis.guildQuests,baseAccept=globalThis.acceptGuildQuest,baseTurnIn=globalThis.turnInQuest;
 const baseFacility=globalThis.facilityQuest,baseFacilityAccept=globalThis.acceptFacilityQuest;
 if([baseGuild,baseAccept,baseTurnIn,baseFacility,baseFacilityAccept].some(fn=>typeof fn!=="function"))return;
 globalThis.guildQuests=function(){
  const town=place(game()?.character?.locationId),original=db().quest_templates;
  if(!town||town.kind!=="town")return baseGuild.apply(this,arguments);
  const result=board(original,town,"guild");displayBoard=result.selected;
  db().quest_templates=result.list;
  try{const v=baseGuild.apply(this,arguments);intro(town,"guild",result);return v;}
  finally{db().quest_templates=original;}
 };
 globalThis.facilityQuest=function(fid){
  const town=place(game()?.character?.locationId),original=db().shop_quests;
  if(!town||town.kind!=="town")return baseFacility.apply(this,arguments);
  const result=board(original.filter(t=>t.facility===fid),town,fid);
  db().shop_quests=[...original.filter(t=>t.facility!==fid),...result.list];
  displayBoard=result.selected;
  try{const v=baseFacility.apply(this,arguments);intro(town,fid,result);return v;}
  finally{db().shop_quests=original;}
 };
 globalThis.acceptGuildQuest=function(id){
  const town=place(game()?.character?.locationId),template=arr(db()?.quest_templates).find(t=>t.id===id);
  if(!town||!template||!board(db().quest_templates,town,"guild").selected.has(id)){
   if(typeof alert==="function")alert("此委託不在當地現行公告中，可能已完成或進入冷卻；請重新開啟委託板。");return;
  }
  const issued=board(db().quest_templates,town,"guild").selected.get(id);
  const before=new Set(arr(game()?.quests).map(x=>x.id));
  const v=baseAccept.apply(this,arguments);
  const q=arr(game()?.quests).find(x=>!before.has(x.id)&&x.templateId===id);
  if(q){decorateAccepted(q,issued);if(typeof persist==="function")persist();if(typeof globalThis.guildQuests==="function")globalThis.guildQuests();}
  return v;
 };
 globalThis.acceptFacilityQuest=function(fid,id){
  const town=place(game()?.character?.locationId),template=arr(db()?.shop_quests).find(t=>t.id===id&&t.facility===fid);
  const issued=town&&template?board([template],town,fid).selected.get(id):null;
  // 單項查驗不可使用完整公告配額篩選，另驗證是否確實列在城鎮公告中。
  const live=town?board(arr(db()?.shop_quests).filter(t=>t.facility===fid),town,fid).selected.get(id):null;
  if(!live){if(typeof alert==="function")alert("這項設施委託目前未在當地發布。");return;}
  const before=new Set(arr(game()?.quests).map(x=>x.id));
  const v=baseFacilityAccept.apply(this,arguments),q=arr(game()?.quests).find(x=>!before.has(x.id)&&x.templateId===id);
  if(q){decorateAccepted(q,live||issued);if(typeof persist==="function")persist();if(typeof globalThis.facilityQuest==="function")globalThis.facilityQuest(fid);}
  return v;
 };
 globalThis.turnInQuest=function(id){
  const g=game(),q=arr(g?.quests).find(x=>x.id===id),wasReady=q?.status==="ready";
  const v=baseTurnIn.apply(this,arguments);
  if(!q||!wasReady||arr(g?.quests).some(x=>x.id===id))return v;
  const town=place(q.issuerTownId)||place(g?.character?.locationId);
  const entry={questId:id,templateId:q.templateId||"",signature:q.objectiveSignature||target(q),
    kind:q.regionQuestCategory||kind(q),townId:town?.id||"",provinceId:q.issuerProvinceId||province(town),completedHour:hour()};
  const s=state();if(s&&!s.records.some(x=>x.questId===id))s.records.push(entry);
  const h=arr(g.questHistory).find(x=>x.id===id);
  if(h){h.templateId=q.templateId;h.objectiveSignature=entry.signature;h.category=entry.kind;h.issuerTownId=entry.townId;h.issuerProvinceId=entry.provinceId;h.completedHour=entry.completedHour;}
  if(typeof persist==="function")persist();
  return v;
 };
 globalThis.turnInGuildQuest=function(id){return globalThis.turnInQuest.apply(this,arguments)};
 globalThis.__REGIONAL_QUEST_ECOLOGY_PATCHED=true;
}
function audit(){
 const issues=[];if(!globalThis.__REGIONAL_QUEST_ECOLOGY_PATCHED)issues.push("委託板／完成冷卻未接入");
 if(!arr(db()?.quest_templates).length)issues.push("沒有可供地區調度的公會委託模板");
 if(!arr(db()?.locations).some(x=>x.kind==="town"))issues.push("缺少城鎮索引");
 return {revision:REV,pass:issues.length===0,issues,history_size:arr(game()?.worldState?.regionalQuestEcology?.records).length,
  cooldown_hours:{same_template:120,same_target:96,recent_patrol_type:48},save_compatible:true};
}
globalThis.runRegionalQuestEcologyAudit=audit;
globalThis.QUNLU_REGIONAL_QUEST=Object.freeze({revision:REV,board,cooldown,validLocations,kind,target,audit});
if(db()?.meta)db().meta.regional_quest_ecology_revision=REV;
patch();
globalThis.QUNLU_CORE?.registerModule?.("src/quest-regional-ecology-v1.js",{domain:"finalization",revision:REV});
})();