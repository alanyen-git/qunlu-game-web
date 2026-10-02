/* 群陸旅誌：地區委託生態／城鎮差異與完成冷卻 CURRENT-2.25.18
 * REGIONAL-QUEST-ECOLOGY-1.5
 * 只從現有正史委託和已建檔可到達地圖發布；不創造不存在的地點／素材／魔物。
 * 保存於既有 G.worldState 下；不重置 G.quests、questHistory 或舊存檔。
 */
(()=>{
"use strict";
const REV="REGIONAL-QUEST-ECOLOGY-1.9";
const arr=x=>Array.isArray(x)?x:[];
const game=()=>typeof G!=="undefined"?G:null;
const db=()=>typeof DB!=="undefined"?DB:null;
const place=id=>arr(db()?.locations).find(x=>x.id===id)||null;
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
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

// 所有城鎮委託必須使用該城自身的野外／地下城節點；只複製任務實例，不改 canonical 地圖或模板。
// 部分舊王都資料以歷史 parent_id 建檔，透過 local_region_anchor_ids 明確對應，絕不回退到同省其他城鎮。
function localRegionLocations(town){
 if(!town)return [];
 const cluster=town.starter_cluster_id||null,settlement=town.settlement_region_id||null;
 const anchors=new Set([town.id,...arr(town.local_region_anchor_ids).filter(Boolean)]);
 return arr(db()?.locations).filter(l=>{
  if(l.id===town.id)return true;
  if(cluster&&l.starter_cluster_id===cluster)return true;
  if(settlement&&l.settlement_region_id===settlement)return true;
  return anchors.has(l.parent_id);
 });
}
function localTargetCandidates(t,town){
 const o=t?.objective||{};
 if(!town||!["action","patrol"].includes(o.kind))return [];
 const original=place(o.location_id),wantedKind=original?.kind||"wild",originalTier=rank(original?.tier||t?.tier||"F");
 const rows=localRegionLocations(town).filter(l=>l.id!==town.id&&l.kind===wantedKind&&Number.isFinite(travel(town.id,l.id)));
 rows.sort((a,b)=>{
  const exact=Number(a.id===original?.id)-Number(b.id===original?.id);
  const tier=Math.abs(rank(a.tier)-originalTier)-Math.abs(rank(b.tier)-originalTier);
  return exact||tier||travel(town.id,a.id)-travel(town.id,b.id)||a.id.localeCompare(b.id);
 });
 return rows;
}
function localObjectiveCandidates(t,town){
 const o=t?.objective||{};
 if(!town)return [];
 if(["action","patrol"].includes(o.kind))return localTargetCandidates(t,town);
 const original=place(o.location_id),wantedKind=original?.kind||"";
 let rows=localRegionLocations(town).filter(l=>l.id!==town.id&&["wild","dungeon"].includes(l.kind)&&Number.isFinite(travel(town.id,l.id)));
 if(wantedKind)rows=rows.filter(l=>l.kind===wantedKind);
 if(["gather","item"].includes(o.kind)&&o.item_id){
  rows=rows.filter(l=>arr(l.gather).includes(o.item_id)||arr(l.resource_profile?.forage).includes(o.item_id)||arr(l.resource_profile?.mining).includes(o.item_id)||arr(l.resource_profile?.woodcut).includes(o.item_id)||arr(l.resource_profile?.hunt).includes(o.item_id));
 }
 if(["kill","hunt"].includes(o.kind)&&o.monster_id){
  const withRoster=rows.filter(l=>arr(l.encounter_monster_ids).includes(o.monster_id));
  if(withRoster.length)rows=withRoster;
 }
 const originalTier=rank(original?.tier||t?.tier||"F");
 rows.sort((a,b)=>{
  const exact=Number(a.id===original?.id)-Number(b.id===original?.id);
  const tier=Math.abs(rank(a.tier)-originalTier)-Math.abs(rank(b.tier)-originalTier);
  return exact||tier||travel(town.id,a.id)-travel(town.id,b.id)||a.id.localeCompare(b.id);
 });
 return rows;
}
function localizedCheckpoints(target,original,targetCount){
 const local=arr(target?.explore).map(x=>Array.isArray(x)?x[0]:x).filter(Boolean);
 const old=arr(original?.checkpoints).filter(Boolean);
 return [...new Set([...local,...old])].slice(0,Math.max(1,Number(targetCount)||old.length||1));
}
function mentionedLocationNames(t){
 const texts=[t?.name,t?.description,t?.desc,t?.completion_rule].filter(x=>typeof x==="string");
 return [...new Set(arr(db()?.locations).map(l=>String(l?.name||"")).filter(name=>name&&texts.some(text=>text.includes(name))))]
   .sort((a,b)=>b.length-a.length);
}
function localizeQuestText(value,original,target,oldCheckpoints=[],newCheckpoints=[],aliases=[]){
 let out=String(value??"");
 const pairs=[];
 if(original?.name&&target?.name&&original.name!==target.name)pairs.push([original.name,target.name]);
 for(const alias of aliases){
  if(alias&&alias!==target?.name)pairs.push([alias,target?.name||alias]);
 }
 const count=Math.min(oldCheckpoints.length,newCheckpoints.length);
 for(let i=0;i<count;i++){
  if(oldCheckpoints[i]&&newCheckpoints[i]&&oldCheckpoints[i]!==newCheckpoints[i])pairs.push([oldCheckpoints[i],newCheckpoints[i]]);
 }
 for(const [from,to] of pairs){
  if(!from||!to||from===to)continue;
  out=out.split(String(from)).join(String(to));
 }
 return out;
}
function localizeQuestName(t,target,original,aliases=[]){
 if(!target?.name)return String(t?.name||"");
 let name=String(t?.name||"");
 const originalName=name;
 const sources=[original?.name,...aliases].filter(Boolean).sort((a,b)=>String(b).length-String(a).length);
 for(const from of sources){
  if(from&&from!==target.name)name=name.split(String(from)).join(String(target.name));
 }
 if(name!==originalName)return name;
 if(t?.objective?.kind==="patrol")return target.name+"巡查";
 if(t?.objective?.kind==="action")return target.name+(t?.type||"調查");
 return name;
}
function localizeTemplate(t,town,locations){
 const o=clone(t?.objective||{}),original=place(o.location_id);
 const localTarget=localObjectiveCandidates(t,town)[0];
 const fallback=arr(locations).map(x=>place(x?.id||x)).find(Boolean);
 const target=localTarget||fallback;
 if(target&&["action","patrol"].includes(o.kind)){
  o.location_id=target.id;
  if(o.kind==="patrol")o.checkpoints=localizedCheckpoints(target,o,o.target);
 }else if(target&&o.location_id){
  o.location_id=target.id;
 }
 const sites=(target&&["action","patrol"].includes(o.kind)?[target.id]:arr(locations).map(x=>x.id)).filter(Boolean);
 const localized={...t,objective:o,recommended_locations:[...new Set(sites.length?sites:arr(t?.recommended_locations))]};
 if(target){
  const aliases=mentionedLocationNames(t);
  const oldCheckpoints=arr(t?.objective?.checkpoints);
  const newCheckpoints=arr(o.checkpoints);
  localized.name=localizeQuestName(t,target,original,aliases);
  if(typeof t.description==="string")localized.description=localizeQuestText(t.description,original,target,oldCheckpoints,newCheckpoints,aliases);
  if(typeof t.desc==="string")localized.desc=localizeQuestText(t.desc,original,target,oldCheckpoints,newCheckpoints,aliases);
  if(typeof t.completion_rule==="string")localized.completion_rule=localizeQuestText(t.completion_rule,original,target,oldCheckpoints,newCheckpoints,aliases);
 }
 return localized;
}
function localizeAuthorityRequest(q,town){
 if(!town||town.kind!=="town")return q;
 const o=q?.objective||{},mapBound=!!o.location_id||arr(q?.recommended_locations).length>0||["action","patrol","gather","kill","hunt"].includes(o.kind);
 if(!mapBound)return q;
 const locations=validLocations(q,town);if(!locations.length)return null;
 const localized=localizeTemplate(q,town,locations);
 return {...localized,viableLocationIds:locations.map(x=>x.id),places:locations.map(x=>x.id),issuerTownId:town.id,issuerTownName:town.name,issuerProvinceId:province(town),regionQuestCategory:"地方政務",objectiveSignature:target(localized)};
}
function localizeFaithMission(q,town){
 if(!town||town.kind!=="town")return q;
 const o=q?.objective||{},mapBound=!!o.location_id||arr(q?.recommended_locations).length>0||["action","patrol","gather","kill","hunt"].includes(o.kind);
 if(!mapBound)return q;
 const places=validLocations(q,town);if(!places.length)return null;
 const localized=localizeTemplate(q,town,places);
 localized.viableLocationIds=places.map(x=>x.id);
 localized.places=localized.viableLocationIds.slice();
 localized.issuerTownId=town.id;localized.issuerTownName=town.name;localized.issuerProvinceId=province(town);
 localized.regionQuestCategory="神殿委託";localized.objectiveSignature=target(localized);
 localized.description=(localized.description||"")+"（本次依"+town.name+"周邊可達地圖發布。）";
 return localized;
}
function localizeOrganizationContract(q,town){
 if(!town||town.kind!=="town")return q;
 const o=q?.objective||{},mapBound=!!o.location_id||arr(q?.recommended_locations).length>0||["action","patrol","gather","kill","hunt"].includes(o.kind);
 if(!mapBound)return {...q,issuerTownId:town.id,issuerTownName:town.name,issuerProvinceId:province(town),regionQuestCategory:"組織契約"};
 const places=validLocations(q,town);if(!places.length)return null;
 const localized=localizeTemplate(q,town,places);
 localized.viableLocationIds=places.map(x=>x.id);
 localized.places=localized.viableLocationIds.slice();
 localized.issuerTownId=town.id;localized.issuerTownName=town.name;localized.issuerProvinceId=province(town);
 localized.regionQuestCategory="組織契約";localized.objectiveSignature=target(localized);
 localized.description=(localized.description||"")+"（本次依"+town.name+"周邊可達地圖發布。）";
 return localized;
}
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
 const o=t?.objective||{},mapBound=!!o.location_id||arr(t?.recommended_locations).length>0||["action","patrol","gather","kill","hunt"].includes(o.kind);
 const local=localObjectiveCandidates(t,town);
 if(local.length)return local.map(l=>({id:l.id,hours:travel(town.id,l.id),local:true}));
 // 地方目標不足時不再退回同省或20小時外的其他城鎮地圖。
 if(mapBound)return [];
 return [{id:town.id,hours:0,local:true}];
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
  // 只複製一份地方公告；正史模板、canonical 地圖與舊存檔保持不變。
  const local=entry.locations.filter(x=>x.local).slice(0,5);
  const sites=(local.length?local:entry.locations).slice(0,5).map(x=>x.id);
  const localized=localizeTemplate(entry.t,town,entry.locations);
  localized.recommended_locations=sites.length&&!["action","patrol"].includes(localized.objective?.kind)?sites:localized.recommended_locations;
  const localizedDescription=localized.description||entry.t.description||entry.t.desc||"";
  const localizedDesc=localized.desc||localized.description||entry.t.desc||entry.t.description||"";
  Object.assign(localized,{
   name:localized.name||entry.t.name,
   description:localizedDescription+"（"+town.name+"公會公告；本次依周邊實際可達地圖發布。）",
   desc:localizedDesc+"（"+town.name+"設施公告。）",
  });
  const publishedSites=["action","patrol"].includes(localized.objective?.kind)?arr(localized.recommended_locations):sites;
  selected.set(entry.t.id,{townId:town.id,townName:town.name,provinceId:province(town),places:publishedSites,kind:entry.k,signature:target(localized),description:localized.description,objective:clone(localized.objective),name:localized.name,template:localized});
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
 if(entry.objective)q.objective=clone(entry.objective);
 if(entry.name)q.name=entry.name;
 q.issuerTownId=entry.townId;q.issuerTownName=entry.townName;
 q.issuerProvinceId=entry.provinceId;q.regionQuestCategory=entry.kind;q.objectiveSignature=entry.signature;
 q.description=entry.description;
 if(entry.places.length)q.viableLocationIds=entry.places.slice();
}
function patch(){
 if(globalThis.__REGIONAL_QUEST_ECOLOGY_PATCHED)return;
 const baseGuild=globalThis.guildQuests,baseAccept=globalThis.acceptGuildQuest,baseTurnIn=globalThis.turnInQuest;
 const baseFacility=globalThis.facilityQuest,baseFacilityAccept=globalThis.acceptFacilityQuest;
 const baseAuthorityGenerate=globalThis.generateAuthorityRequests,baseAuthorityAccept=globalThis.acceptAuthorityRequest;
  const baseFaithGenerate=globalThis.generateFaithMissions,baseFaithAccept=globalThis.acceptFaithMission;
  const baseOrgCandidates=globalThis.organizationContractCandidates,baseOrgGenerate=globalThis.generateOrganizationContracts,baseOrgAccept=globalThis.acceptOrganizationContract;
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
 if(typeof baseAuthorityGenerate==="function")globalThis.generateAuthorityRequests=function(polityId){
  const rows=baseAuthorityGenerate.apply(this,arguments),town=place(game()?.character?.locationId);
  return town?.kind==="town"?arr(rows).map(q=>localizeAuthorityRequest(q,town)).filter(Boolean):rows;
 };
 if(typeof baseAuthorityAccept==="function")globalThis.acceptAuthorityRequest=function(polityId,officeId,templateId){
  const town=place(game()?.character?.locationId),archetype=arr(db()?.authority_request_archetypes).find(x=>x.id===templateId);
  if(!town||town.kind!=="town"||!archetype||!["action","patrol"].includes(archetype.objective?.kind))
   return baseAuthorityAccept.apply(this,arguments);
  const listed=globalThis.generateAuthorityRequests?.(polityId)?.some(x=>x.templateId===templateId&&x.sourceId===officeId);
  const localized=localizeAuthorityRequest({templateId,sourceId:officeId,objective:archetype.objective},town);
  if(!listed||!localized){if(typeof alert==="function")alert("此政務委託目前未在當地公告中，請重新開啟地方政務清單。");return;}
  const original=archetype.objective;
  archetype.objective=clone(localized.objective);
  try{return baseAuthorityAccept.apply(this,arguments);}
  finally{archetype.objective=original;}
 };
 if(typeof baseFaithGenerate==="function")globalThis.generateFaithMissions=function(){
  const rows=baseFaithGenerate.apply(this,arguments),town=place(game()?.character?.locationId);
  return town?.kind==="town"?arr(rows).map(q=>localizeFaithMission(q,town)).filter(Boolean):rows;
 };
 if(typeof baseFaithAccept==="function")globalThis.acceptFaithMission=function(id){
  const town=place(game()?.character?.locationId);
  if(!town||town.kind!=="town")return baseFaithAccept.apply(this,arguments);
  const fresh=arr(globalThis.generateFaithMissions?.()).find(q=>q.id===id);
  if(!fresh){if(typeof alert==="function")alert("此神殿委託目前未在當地公告中，請重新開啟神殿委託清單。");return;}
  const saved=arr(game()?.tempFaithMissions),index=saved.findIndex(q=>q.id===id);
  if(index>=0)saved[index]=fresh;
  else game().tempFaithMissions=[...saved,fresh];
  const before=new Set(arr(game()?.quests).map(q=>q.id)),v=baseFaithAccept.apply(this,arguments);
  const accepted=arr(game()?.quests).find(q=>!before.has(q.id)&&q.templateId===fresh.templateId&&q.faithPantheonId===fresh.faithPantheonId);
  if(accepted){decorateAccepted(accepted,fresh);if(typeof persist==="function")persist();}
  return v;
 };
 if(typeof baseOrgCandidates==="function")globalThis.organizationContractCandidates=function(orgOrId){
  const rows=arr(baseOrgCandidates.apply(this,arguments)),town=place(game()?.character?.locationId);
  return town?.kind==="town"?rows.map(q=>localizeOrganizationContract(q,town)).filter(Boolean):rows;
 };
 if(typeof baseOrgGenerate==="function")globalThis.generateOrganizationContracts=function(orgOrId){
  const rows=arr(baseOrgGenerate.apply(this,arguments)),town=place(game()?.character?.locationId);
  return town?.kind==="town"?rows.map(q=>localizeOrganizationContract(q,town)).filter(Boolean):rows;
 };
 if(typeof baseOrgAccept==="function")globalThis.acceptOrganizationContract=function(orgId,templateId){
  const town=place(game()?.character?.locationId),org=typeof worldOrg==="function"?worldOrg(orgId):null;
  const raw=town&&org&&typeof baseOrgCandidates==="function"?arr(baseOrgCandidates(org)).find(q=>q.id===templateId):null;
  const localized=raw&&town?localizeOrganizationContract(raw,town):raw;
  if(!raw||!localized){if(typeof alert==="function")alert("此組織契約目前未在當地發布，請重新開啟契約清單。");return;}
  const before=new Set(arr(game()?.quests).map(q=>q.id));
  const v=baseOrgAccept.apply(this,arguments);
  const accepted=arr(game()?.quests).find(q=>!before.has(q.id)&&q.templateId===templateId&&q.organizationId===orgId);
  if(accepted){decorateAccepted(accepted,localized);if(typeof persist==="function")persist();}
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
function localizationAudit(){
 const collections=[
  ["guild",arr(db()?.quest_templates)],
  ["facility",arr(db()?.shop_quests)],
  ["authority",arr(db()?.authority_request_archetypes)],
  ["faith",arr(db()?.faith_mission_archetypes)],
  ["organization",arr(db()?.organization_contract_archetypes)],
  ["adventure",arr(db()?.adventure_event_templates)]
 ];
 const warnings=[],locationById=new Map(arr(db()?.locations).map(l=>[l.id,l]));
 for(const [source,rows] of collections)for(const row of rows){
  const o=row?.objective||{},ids=[o.location_id,...arr(row?.recommended_locations),...arr(row?.location_ids)].filter(Boolean);
  const bound=new Set(ids.map(id=>locationById.get(id)?.name).filter(Boolean));
  const mentioned=mentionedLocationNames(row);
  const unresolved=mentioned.filter(name=>!bound.has(name));
  if(unresolved.length)warnings.push({source,id:row.id||"",names:unresolved.slice(0,5)});
 }
 const active=[],g=game();
 for(const q of arr(g?.quests)){
  const issuer=place(q?.issuerTownId),allowed=new Set(localRegionLocations(issuer).map(l=>l.id));
  const bad=arr(q?.viableLocationIds).filter(id=>!allowed.has(id));
  if(issuer&&bad.length)active.push({id:q.id||"",issuerTownId:issuer.id,foreignLocationIds:bad});
 }
 return {
  pass:active.length===0,
  canonical_template_warnings:warnings.length,
  canonical_template_samples:warnings.slice(0,20),
  active_cross_region_quests:active,
  rule:"模板可保留正史固定地點；所有地方發布與接取後快照必須改用當前城鎮可達地圖，禁止同省或20小時外備援。"
}
}
function audit(){
 const issues=[];if(!globalThis.__REGIONAL_QUEST_ECOLOGY_PATCHED)issues.push("委託板／完成冷卻未接入");
 if(!arr(db()?.quest_templates).length)issues.push("沒有可供地區調度的公會委託模板");
 if(!arr(db()?.locations).some(x=>x.kind==="town"))issues.push("缺少城鎮索引");
 const localization=localizationAudit();
 if(localization.active_cross_region_quests.length)issues.push("已有接取委託仍指向發布城鎮以外的地圖");
 return {revision:REV,pass:issues.length===0,issues,localization,history_size:arr(game()?.worldState?.regionalQuestEcology?.records).length,
  cooldown_hours:{same_template:120,same_target:96,recent_patrol_type:48},save_compatible:true};
}
globalThis.runRegionalQuestEcologyAudit=audit;
globalThis.QUNLU_REGIONAL_QUEST=Object.freeze({revision:REV,board,cooldown,validLocations,kind,target,localizeAuthorityRequest,localizeFaithMission,localizeOrganizationContract,localizationAudit,audit});
if(db()?.meta)db().meta.regional_quest_ecology_revision=REV;
patch();
globalThis.QUNLU_CORE?.registerModule?.("src/quest-regional-ecology-v1.js",{domain:"finalization",revision:REV});
})();
