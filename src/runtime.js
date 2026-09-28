Warning: truncated output (original token count: 145880)
Total output lines: 6910


const CURRENT_VERSION=globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.12.0";
const AUDIT_INTERVAL_TURNS=5;
DB.meta.current_version=CURRENT_VERSION;
DB.hard_rules.audit_every_turns=AUDIT_INTERVAL_TURNS;
DB.meta.runtime_optimization_revision="RUNTIME-OPT-1.5";
DB.meta.save_storage_revision="SAVE-STORAGE-2.0";
DB.meta.ui_runtime_revision="UI-RUNTIME-1.0";
DB.meta.inventory_category_filter_revision="INVENTORY-CATEGORY-FILTER-1.0";
DB.meta.quality_audit_revision="QUALITY-AUDIT-1.0";
DB.meta.status_runtime_revision="STATUS-1.11";
DB.meta.political_standing_repair_revision="POLITICAL-STANDING-REPAIR-1.0";
DB.meta.battle_formation_revision="BATTLE-FORMATION-2.0";
DB.meta.gather_runtime_revision="GATHER-RUNTIME-1.1";
DB.meta.team_carry_revision="TEAM-CARRY-1.0";
DB.meta.subjob_progression_revision="SUBJOB-PROGRESSION-2.0";
DB.subjob_progression_system={
 version:"SUBJOB-PROGRESSION-2.0",
 grades:["F","E","D","C","B","A","S"],
 promotion_mode:"manual",
 xp_mode:"cumulative",
 rules:["副職業經驗由對應製作／料理行動取得。","達到下一階XP門檻且角色等級符合要求後，由角色介面手動升級。","升級不消耗累積XP，門檻採累積制；S級為上限。"],
 save_schema_changed:false
};
DB.team_carry_system={version:"TEAM-CARRY-1.0",save_schema_changed:false,counts:["實際同行NPC隊友","寵物／契約獸"],excludes:["純召喚獸"],factors:{teammate:["定位","種族體格","階級","等級","羈絆"],companion:["物種體型特徵","階級","等級","羈絆"]},rule:"以共享行李額度增加角色即時負重上限；不改物品重量，不把同行者完整個人負重全部轉給玩家。"};
DB.runtime_optimization_system.version="RUNTIME-OPT-1.5";
DB.status_system.version="STATUS-1.11";
Object.assign(DB.status_system.definitions,{
 confusion:{name:"混亂",category:"control",cleanse:["confusion"],effect:"每回合45%無法行動，命中下降"},
 petrify:{name:"石化",category:"control",cleanse:["petrify"],effect:"無法行動"},
 charm:{name:"魅惑",category:"control",cleanse:["charm"],effect:"每回合35%無法行動"}
});
DB.quality_audit_system={version:"QUALITY-AUDIT-1.0",scope:["介面","內容","程序"],rules:["所有物品狀態引用必須有定義與runtime。","製作每次嘗試都消耗完整配方材料，成功與否不影響扣料。","戰鬥行動須先驗證道具與資源，再推進角色狀態回合。","窄螢幕不得因角色摘要造成水平溢位。"],save_schema_changed:false,canonical_world_content_changed:false};
DB.ui_runtime_system={version:"UI-RUNTIME-1.0",features:["連線中靜態DOM快取","相同HTML略過重寫","行動列依狀態簽章更新","動態按鈕補齊button型別","彈窗Tab焦點循環","目前導覽aria-current","存檔失敗可視提示"],rules:["快取只保存DOM參照與顯示字串，不寫入存檔。","戰鬥與首頁共用同一次combatStats結果。","介面重構不得改變角色數值、世界內容或存檔schema。"],save_schema_changed:false,canonical_world_content_changed:false};
DB.management_ai[7].responsibility="每回合自動存檔、每5回合自檢";
DB.management_ai[7].validations[1]="每5回合稽核";
DB.generation_pipeline.steps[11]="五回合績效與一致性稽核";
DB.system_orchestrator.domains[11].responsibility="每回合寫回、五回合自檢與整合健康度";
DB.integration_registry.optimization_notes.push("RUNTIME-OPT-1.1：移除戰鬥流程重複DOM繪製、合併本機初始化事件，並恢復每5回合自檢；不改canonical世界內容與存檔結構。");
DB.integration_registry.optimization_notes.push("CURRENT-1.52.0／QUALITY-AUDIT-1.0：修正製作扣料、戰鬥行動驗證、狀態引用/runtime與窄螢幕可讀性；不改canonical世界內容與存檔結構。");
DB.integration_registry.optimization_notes.push("CURRENT-1.53.0／UI-RUNTIME-1.0：快取靜態DOM、略過相同介面重寫、批次同步背包型委託、共用戰鬥數值，並補齊彈窗鍵盤焦點；不改canonical世界內容與存檔結構。");
DB.integration_registry.optimization_notes.push("CURRENT-1.54.0／RUNTIME-OPT-1.4：補齊能力點與技能XP舊存檔正規化、三次教會復活、商店每日庫存及每日收購資金；不改canonical世界內容與既有角色資料。");
DB.integration_registry.optimization_notes.push("CURRENT-2.07.1／RUNTIME-OPT-1.5：相同狀態存檔略過重複localStorage寫入、主畫面共用負重結果，降低大型存檔與背包反覆序列化／掃描成本；不改canonical世界內容與存檔schema。");
DB.integration_registry.optimization_notes.push("CURRENT-2.07.4／SAVE-STORAGE-2.0：主存檔與更新備份由localStorage遷移至IndexedDB大容量儲存，保留localStorage失敗回退與舊存檔自動搬移；以舊5 MB級localStorage為基準提供10倍50 MB設計目標。");
DB.integration_registry.optimization_notes.push("CURRENT-2.10.0／POLITICAL-STANDING-REPAIR-1.0：政治聲望整併改為每次載入、聲望讀寫與五回合自檢前皆正規化；POL-005→POL-001、POL-006→POL-007、POL-018→POL-001，不再因CURRENT版本短路或舊政務回報重新產生退役政治體聲望。");
DB.integration_registry.optimization_notes.push("CURRENT-2.10.0／BATTLE-FORMATION-2.0：戰鬥介面改為敵方置頂；自己、隊友與出戰寵物／召喚獸共用盟友並排網格。戰鬥卡不再顯示寵物／召喚獸光環與專屬技能明細，保留AI與HP資訊。");
DB.integration_registry.optimization_notes.push("CURRENT-2.10.0／GATHER-RUNTIME-1.1：採集正式讀取gather／mining／woodcut三類地圖資源池；工具需求統一以tool_effect判定，缺工具時顯示實際缺少的工具並提示雜貨鋪。");
DB.integration_registry.optimization_notes.push("CURRENT-2.10.1／TEAM-CARRY-1.0：實際同行隊友與寵物／契約獸依定位、體格、階級、等級與羈絆提供共享負重；純召喚獸不提供常駐行李空間。負重直接接入resourceCaps→combatStats主鏈、超重懲罰、HUD與背包。");
DB.integration_registry.optimization_notes.push("CURRENT-2.11.0／SUBJOB-PROGRESSION-2.0：副職業改為累積XP＋角色介面手動升級；角色頁直接顯示目前XP／下一階所需XP與升級按鍵，保留既有XP與舊存檔相容。");
DB.integration_registry.optimization_notes.push("CURRENT-1.55.0／CONTENT-DEPTH-1.0：西境河谷加入地點限定奇遇、F～C級委託、設施委託、地方傳聞、節慶、微歷史與民俗；既有存檔原地相容。");
DB.integration_registry.optimization_notes.push("CURRENT-1.57.0／WEB-DEPLOY-1.0：正式版改由GitHub Pages發布，版本檢查使用相對路徑並定期偵測更新；遊玩與發布皆不依賴Netlify。");
let G=null;
// 跨模組狀態橋接：地圖、勢力與其他獨立程序透過 globalThis.G 讀取目前遊戲狀態。
// 保留 runtime 內部 G 的既有引用與存檔流程，只補上同一個 live reference。
Object.defineProperty(globalThis,"G",{configurable:true,get:()=>G,set:value=>{G=value}});
let creation={race:null,raceSubtype:null,origin:null,originFacet:null,element:null,classId:null,randomLeft:10};
const DOM_CACHE=new Map(),UI_HTML_CACHE=new WeakMap();
const $=s=>{
 if(/^#[A-Za-z][\w-]*$/.test(s)){
   const cached=DOM_CACHE.get(s);if(cached?.isConnected)return cached;
   const found=document.querySelector(s);if(found)DOM_CACHE.set(s,found);return found
 }
 return document.querySelector(s)
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=n=>Math.floor(Math.random()*n);
function canonicalPoliticalStandingId(id){return DB.political_merge_map?.[id]||id}
function normalizePoliticalStandingState(){
 const c=G?.character;if(!c)return {changed:false,repairs:[]};
 c.politicalStanding=c.politicalStanding&&typeof c.politicalStanding==="object"?c.politicalStanding:{};
 const s=c.politicalStanding,repairs=[];let changed=false;
 for(const [oldId,newId] of Object.entries(DB.political_merge_map||{"POL-005":"POL-001","POL-006":"POL-007","POL-018":"POL-001"})){
   if(!Object.prototype.hasOwnProperty.call(s,oldId))continue;
   const source=clamp(Number(s[oldId])||0,-100,100),target=s[newId];
   if(target==null||Math.abs(source)>Math.abs(Number(target)||0))s[newId]=source;
   delete s[oldId];changed=true;repairs.push(`${oldId}→${newId}`)
 }
 for(const [pid,v] of Object.entries(s)){
   const n=Number(v),fixed=Number.isFinite(n)?clamp(n,-100,100):0;
   if(v!==fixed){s[pid]=fixed;changed=true;repairs.push(`${pid}聲望範圍修正`)}
 }
 if(changed){
   G.worldState=G.worldState||{};
   G.worldState.lastPoliticalStandingRepair={turn:Number(G.turn||0),time:typeof timeText==="function"?timeText():null,repairs:[...new Set(repairs)]}
 }
 return {changed,repairs:[...new Set(repairs)]}
}
globalThis.repairPoliticalStandingState=normalizePoliticalStandingState;
function normalizeUIButtonTypes(html){return String(html??"").replace(/<button\b(?![^>]*\btype\s*=)/gi,'<button type="button"')}
function setUIHTML(el,html){
 if(!el)return false;const safe=normalizeUIButtonTypes(html);if(UI_HTML_CACHE.get(el)===safe)return false;
 el.innerHTML=safe;UI_HTML_CACHE.set(el,safe);return true
}
function setUIText(el,text){if(!el)return false;const value=String(text??"");if(el.textContent===value)return false;el.textContent=value;return true}
const IDX={
 item:new Map(DB.items.map(x=>[x.id,x])),race:new Map(DB.races.map(x=>[x.id,x])),loc:new Map(DB.locations.map(x=>[x.id,x])),cls:new Map(DB.combat_classes.map(x=>[x.id,x])),
 origin:new Map(DB.origins.map(x=>[x.id,x])),sub:new Map(DB.subjobs.map(x=>[x.id,x])),talent:new Map((DB.talents||[]).map(x=>[x.id,x])),
 monster:new Map((DB.monsters||[]).map(x=>[x.id,x])),quest:new Map([...(DB.quest_templates||[]),...(DB.shop_quests||[])].map(x=>[x.id,x])),recipe:new Map((DB.recipes||[]).map(x=>[x.id,x])),
 companion:new Map((DB.companion_species||[]).map(x=>[x.id,x])),partyTemplate:new Map((DB.party_member_templates||[]).map(x=>[x.id,x])),
 faith:new Map((DB.faith_entities||[]).map(x=>[x.id,x])),faithOath:new Map((DB.faith_oaths||[]).map(x=>[x.id,x])),pantheon:new Map((DB.pantheons||[]).map(x=>[x.id,x])),
 worldOrg:new Map((DB.world_organizations||[]).map(x=>[x.id,x])),adventureEvent:new Map((DB.adventure_event_templates||[]).map(x=>[x.id,x])),
 dialogue:new Map((DB.dialogue_database?.records||[]).map(x=>[x.id,x])),intel:new Map((DB.intel_database?.records||[]).map(x=>[x.id,x])),
 lore:new Map((DB.lore_records||[]).map(x=>[x.id,x])),polity:new Map((DB.political_entities||[]).map(x=>[x.id,x])),
 culture:new Map((DB.culture_profiles||[]).map(x=>[x.id,x])),worldRegion:new Map((DB.world_regions||[]).map(x=>[x.id,x])),
 authority:new Map((DB.political_authority_catalog||DB.authority_archetypes||[]).map(x=>[x.id,x])),
 authorityTier:new Map((DB.authority_tiers||[]).map(x=>[x.id,x])),authorityRight:new Map((DB.authority_rights_catalog||[]).map(x=>[x.id,x])),
 authorityProfile:new Map((DB.polity_authority_profiles||[]).map(x=>[x.polity_id,x])),authorityRequest:new Map((DB.authority_request_archetypes||[]).map(x=>[x.id,x])),
 discipline:new Map((DB.discipline_factions||[]).map(x=>[x.id,x])),sTier:new Map((DB.s_tier_combatants||[]).map(x=>[x.id,x])),
 historyEvent:new Map((DB.world_timeline||[]).map(x=>[x.id,x])),historySubperiod:new Map((DB.historical_subperiods||[]).map(x=>[x.id,x])),
 historyChain:new Map((DB.historical_causal_chains||[]).map(x=>[x.id,x])),historicalDispute:new Map((DB.historical_disputes||[]).map(x=>[x.id,x])),
 regionalPower:new Map((DB.regional_powers||[]).map(x=>[x.id,x])),materialPack:new Map((DB.generator_material_packs||[]).map(x=>[x.region_id,x])),
 historicalRelation:new Map((DB.historical_relationship_records||[]).map(x=>[x.id,x]))
};
const STATIC_ARRAY_INDEXES=new Map();
function refreshStaticArrayIndexBindings(){
 STATIC_ARRAY_INDEXES.clear();
 for(const [rows,index] of [
  [DB.races,IDX.race],[DB.items,IDX.item],[DB.locations,IDX.loc],[DB.combat_classes,IDX.cls],
  [DB.origins,IDX.origin],[DB.subjobs,IDX.sub],[DB.talents,IDX.talent],[DB.monsters,IDX.monster],
  [DB.recipes,IDX.recipe],[DB.companion_species,IDX.companion],[DB.party_member_templates,IDX.partyTemplate],
  [DB.faith_entities,IDX.faith],[DB.world_organizations,IDX.worldOrg],[DB.political_entities,IDX.polity],
  [DB.world_regions,IDX.worldRegion]
 ])if(Array.isArray(rows))STATIC_ARRAY_INDEXES.set(rows,index);
}
refreshStaticArrayIndexBindings();
let TRAVEL_CACHE=null;
function ensureTravelCache(){if(TRAVEL_CACHE)return TRAVEL_CACHE;const ids=DB.locations.map(x=>x.id),ix=new Map(ids.map((id,i)=>[id,i])),n=ids.length,d=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));for(const l of DB.locations){const i=ix.get(l.id);for(const e of (l.links||[])){const j=ix.get(e.to);if(j!=null&&Number.isFinite(e.hours))d[i][j]=Math.min(d[i][j],e.hours)}}for(let k=0;k<n;k++)for(let i=0;i<n;i++){if(!Number.isFinite(d[i][k]))continue;for(let j=0;j<n;j++){const nd=d[i][k]+d[k][j];if(nd<d[i][j])d[i][j]=nd}}TRAVEL_CACHE={ix,d};return TRAVEL_CACHE}
const ENCOUNTER_CACHE=new Map();
const CRAFT_INDEX=new Map();

function replaceRuntimeIndex(map,rows,keyFn=x=>x?.id){
 if(!(map instanceof Map))return;
 map.clear();
 for(const x of rows||[]){const key=keyFn(x);if(key!=null)map.set(key,x)}
}
function syncRuntimeIndexesAndMetadata(){
 replaceRuntimeIndex(IDX.item,DB.items);
 replaceRuntimeIndex(IDX.race,DB.races);
 replaceRuntimeIndex(IDX.loc,DB.locations);
 replaceRuntimeIndex(IDX.cls,DB.combat_classes);
 replaceRuntimeIndex(IDX.origin,DB.origins);
 replaceRuntimeIndex(IDX.sub,DB.subjobs);
 replaceRuntimeIndex(IDX.talent,DB.talents);
 replaceRuntimeIndex(IDX.monster,DB.monsters);
 replaceRuntimeIndex(IDX.quest,[...(DB.quest_templates||[]),...(DB.shop_quests||[])]);
 replaceRuntimeIndex(IDX.recipe,DB.recipes);
 replaceRuntimeIndex(IDX.companion,DB.companion_species);
 replaceRuntimeIndex(IDX.partyTemplate,DB.party_member_templates);
 replaceRuntimeIndex(IDX.faith,DB.faith_entities);
 replaceRuntimeIndex(IDX.faithOath,DB.faith_oaths);
 replaceRuntimeIndex(IDX.pantheon,DB.pantheons);
 replaceRuntimeIndex(IDX.worldOrg,DB.world_organizations);
 replaceRuntimeIndex(IDX.adventureEvent,DB.adventure_event_templates);
 replaceRuntimeIndex(IDX.dialogue,DB.dialogue_database?.records);
 replaceRuntimeIndex(IDX.intel,DB.intel_database?.records);
 replaceRuntimeIndex(IDX.lore,DB.lore_records);
 replaceRuntimeIndex(IDX.polity,DB.political_entities);
 replaceRuntimeIndex(IDX.culture,DB.culture_profiles);
 replaceRuntimeIndex(IDX.worldRegion,DB.world_regions);
 replaceRuntimeIndex(IDX.authority,DB.political_authority_catalog?.length?DB.political_authority_catalog:DB.authority_archetypes);
 replaceRuntimeIndex(IDX.authorityTier,DB.authority_tiers);
 replaceRuntimeIndex(IDX.authorityRight,DB.authority_rights_catalog);
 replaceRuntimeIndex(IDX.authorityProfile,DB.polity_authority_profiles,x=>x?.polity_id);
 replaceRuntimeIndex(IDX.authorityRequest,DB.authority_request_archetypes);
 replaceRuntimeIndex(IDX.discipline,DB.discipline_factions);
 replaceRuntimeIndex(IDX.sTier,DB.s_tier_combatants);
 replaceRuntimeIndex(IDX.historyEvent,DB.world_timeline);
 replaceRuntimeIndex(IDX.historySubperiod,DB.historical_subperiods);
 replaceRuntimeIndex(IDX.historyChain,DB.historical_causal_chains);
 replaceRuntimeIndex(IDX.historicalDispute,DB.historical_disputes);
 replaceRuntimeIndex(IDX.regionalPower,DB.regional_powers);
 replaceRuntimeIndex(IDX.materialPack,DB.generator_material_packs,x=>x?.region_id);
 replaceRuntimeIndex(IDX.historicalRelation,DB.historical_relationship_records);
 refreshStaticArrayIndexBindings();

 TRAVEL_CACHE=null;ENCOUNTER_CACHE.clear();CRAFT_INDEX.clear();
 try{if(typeof globalThis.syncContentLinkItemSources==="function")globalThis.syncContentLinkItemSources()}catch(e){console.warn("item source resync",e)}

 const counts={
   items:(DB.items||[]).length,
   locations:(DB.locations||[]).length,
   monsters:(DB.monsters||[]).length,
   classes:(DB.combat_classes||[]).length,
   companions:(DB.companion_species||[]).length,
   party_templates:(DB.party_member_templates||[]).length,
   faith_entities:(DB.faith_entities||[]).length,
   organizations:(DB.world_organizations||[]).length,
   dialogue:(DB.dialogue_database?.records||[]).length,
   intel:(DB.intel_database?.records||[]).length,
   political_entities:(DB.political_entities||[]).length,
   authority_archetypes:(DB.authority_archetypes||[]).length,
   authority_profiles:(DB.polity_authority_profiles||[]).length,
   lore_records:(DB.lore_records||[]).length,
   history_events:(DB.world_timeline||[]).length,
   craft_recipes:(DB.items||[]).filter(x=>x?.craft_recipe).length,
   cooking_recipes:(DB.recipes||[]).filter(r=>typeof isCookingRecipe==="function"?isCookingRecipe(r):true).length,
   quest_templates:(DB.quest_templates||[]).length,
   adventure_event_templates:(DB.adventure_event_templates||[]).length,
   regional_profiles:(DB.regional_content_profiles||[]).length,
   regional_npc_archetypes:(DB.regional_npc_archetypes||[]).length,
   regional_adventure_hooks:(DB.regional_adventure_hooks||[]).length,
   regional_life_events:(DB.regional_life_events||[]).length,
   generators:(DB.generators||[]).length,
   management_ai:(DB.management_ai||[]).length,
   regional_economy_profiles:(DB.regional_economy_profiles||[]).length,
   realm_region_maps:(DB.realm_region_maps||[]).length,
   province_region_maps:(DB.province_region_maps||[]).length,
   settlement_region_maps:(DB.settlement_region_maps||[]).length,
   settlements:(DB.locations||[]).filter(x=>x?.kind==="town").length,
   cultural_festivals:(DB.cultural_festivals||[]).length,
   myth_cycle_records:(DB.myth_cycle_records||[]).length,
   local_historical_incidents:(DB.local_historical_incidents||[]).length,
   regional_folklore:(DB.regional_folklore||[]).length,
   regional_rumors:(DB.regional_rumors||[]).length,
   generator_material_packs:(DB.generator_material_packs||[]).length,
   regional_powers:(DB.regional_powers||[]).length,
   historical_relationship_records:(DB.historical_relationship_records||[]).length
 };
 if(DB.integration_registry){
   DB.integration_registry.counts=DB.integration_registry.counts&&typeof DB.integration_registry.counts==="object"?DB.integration_registry.counts:{};
   Object.assign(DB.integration_registry.counts,counts);
 }
 if(DB.lore_system)DB.lore_system.record_count=counts.lore_records;

 DB.database_growth_compat_system={
   version:"DATABASE-GROWTH-COMPAT-1.0",
   release:"CURRENT-1.66.1",
   live_counts:{...counts},
   expandable_minimums:{
     companion_species:200,party_member_templates:200,pantheons:9,faith_entities:100,
     political_entities:18,culture_profiles:20,authority_archetypes:20,
     physical_disciplines:25,magic_disciplines:24,eastern_sword_traditions:3,
     overseas_unknown_horizons:3,historical_subperiods:12,historical_causal_chains:14,
     historical_disputes:8,regional_powers:2,myth_cycle_records:27,
     historical_relationship_records:222,talents:100
   },
   closed_invariants:{
     s_tier_global_cap:40,equipment_slots:8,subjob_limit:2,skill_limit:10,
     map_hierarchy_layers:4,settlement_world_tiers:7
   },
   rules:[
     "可擴充資料庫只檢查核心最低量與引用完整性，不因新增合法資料超過舊版基準而報錯。",
     "真正封閉規則仍維持硬限制，例如S級全球上限40、8個頂層裝備欄、副職業2個、技能10個。",
     "五回合自檢前重建runtime索引與可推導統計，避免後載入擴充資料被舊索引誤判為不存在。",
     "新增資料若缺必要引用、ID重複、超出封閉上限或破壞世界規則，仍必須正常回報。"
   ]
 };
 return counts
}
function databaseGrowthAudit(){
 const issues=[];
 syncRuntimeIndexesAndMetadata();
 for(const [key,value] of Object.entries(DB)){
   if(!Array.isArray(value)||!value.length)continue;
   let objectCount=0,identifiedCount=0;
   const seen=new Set(),duplicates=new Set();
   for(const row of value){
     if(!row||typeof row!=="object"||Array.isArray(row))continue;
     objectCount++;
     if(row.id==null)continue;
     identifiedCount++;
     const id=String(row.id);
     if(seen.has(id))duplicates.add(id);else seen.add(id);
   }
   if(!objectCount||identifiedCount<Math.ceil(objectCount*.8)||!duplicates.size)continue;
   issues.push(`資料庫ID重複:${key}/${[...duplicates].slice(0,6).join("、")}`);
 }
 return issues
}

if(typeof window!=="undefined")window.addEventListener("load",()=>setTimeout(()=>{try{syncRuntimeIndexesAndMetadata()}catch(e){console.warn("runtime index sync",e)}},120),{once:true});

function craftingRecipeMatchesFacility(d,fid){
 const r=d?.craft_recipe,prof=DB.crafting_system?.facility_profession?.[fid];
 if(!r||!prof)return false;
 if(r.profession!==prof||r.requires_facility!==fid)return false;
 if(d.type==="料理"||d.inventory_group==="食物"||d.food_subtype)return false;
 return true
}
function currentFacilityAllowsCrafting(fid){
 const l=G?.character?loc(G.character.locationId):null;
 return !!fid&&G?.character?.currentFacility===fid&&!!l&&(l.facilities||[]).includes(fid)
}
function craftingItemsFor(fid,tier){const k=`${fid}|${tier}`;if(!CRAFT_INDEX.has(k))CRAFT_INDEX.set(k,(DB.items||[]).filter(d=>craftingRecipeMatchesFacility(d,fid)&&d.tier===tier));return CRAFT_INDEX.get(k)}
function by(arr,id){const index=STATIC_ARRAY_INDEXES.get(arr);return index?.get(id)??arr.find(x=>x.id===id)}
const item=id=>IDX.item.get(id),loc=id=>IDX.loc.get(id),cls=id=>IDX.cls.get(id),org=id=>IDX.origin.get(id),sub=id=>IDX.sub.get(id),monster=id=>IDX.monster.get(id);
function nowId(p){return p+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()}
function rollD20(){return 1+rand(20)}
function weightedPick(pairs){let total=pairs.reduce((s,x)=>s+x[1],0),r=Math.random()*total;for(const x of pairs){r-=x[1];if(r<=0)return x[0]}return pairs.at(-1)[0]}
function tierOrder(t){return {F:0,E:1,D:2,C:3,B:4,A:5,S:6}[t]??0}
const ITEM_LIST_CATEGORY_ORDER={"武器":10,"防具":20,"飾品":30,"藥劑":40,"餐飲":50,"素材":60,"補給／工具":70,"卷軸／書籍":80,"其他":90};
const SHOP_CATEGORY_STATE={};
const CRAFT_CATEGORY_STATE={};
function itemListCategoryLabel(d){
 if(!d)return "其他";
 if(d.catalog_group==="武器"||d.type==="主武器")return "武器";
 if(d.catalog_group==="防具"||["盔甲","頭盔","手套","鞋子"].includes(d.type))return "防具";
 if(d.catalog_group==="飾品"||["飾品","披風"].includes(d.type))return "飾品";
 if(d.type==="藥劑"||d.consumable_group)return "藥劑";
 if(["料理","食物","食材"].includes(d.type)||d.inventory_group==="食物"||d.inventory_group==="食材")return "餐飲";
 if(["素材","草藥素材","工藝素材","礦石","魔物素材","寶石素材"].includes(d.type)||d.material_group||d.monster_drop_core)return "素材";
 if(["補給","工具","道具"].includes(d.type)||d.tool_effect)return "補給／工具";
 if(["書籍","卷軸","符文"].includes(d.type)||d.knowledge_tag)return "卷軸／書籍";
 return "其他"
}
function worldTierItemSort(a,b){
 return tierOrder(a?.tier||"F")-tierOrder(b?.tier||"F") ||
   (ITEM_LIST_CATEGORY_ORDER[itemListCategoryLabel(a)]||99)-(ITEM_LIST_CATEGORY_ORDER[itemListCategoryLabel(b)]||99) ||
   String(a?.name||a?.id||"").localeCompare(String(b?.name||b?.id||""),"zh-Hant")
}
function itemListCategories(items){
 return [...new Set((items||[]).map(itemListCategoryLabel))].sort((a,b)=>(ITEM_LIST_CATEGORY_ORDER[a]||99)-(ITEM_LIST_CATEGORY_ORDER[b]||99)||a.localeCompare(b,"zh-Hant"))
}
function tierGroupedItemRows(items,rowFn,emptyText="目前沒有商品。"){
 const sorted=[...(items||[])].sort(worldTierItemSort);if(!sorted.length)return `<div class="small">${emptyText}</div>`;
 let last="",html="";
 for(const d of sorted){
   if(d.tier!==last){last=d.tier;html+=`<div class="inventory-category-title">${d.tier}級</div>`}
   html+=rowFn(d)
 }
 return html
}
function equipId(v){return v&&typeof v==="object"?v.id:v}
function makeEquip(id,dur=null){const d=item(id);return {id,durability:dur??d.durability,maxDurability:d.durability}}
const SAVE_DB_NAME="qunlu-chronicle-storage";
const SAVE_DB_VERSION=1;
const SAVE_DB_STORE="kv";
const SAVE_MAIN_KEY="chronicle_save";
const SAVE_BACKUP_INDEX_KEY="chronicle_update_backups";
const SAVE_STORAGE_BASELINE_BYTES=5*1024*1024;
const SAVE_STORAGE_TARGET_BYTES=SAVE_STORAGE_BASELINE_BYTES*10;
let saveDbPromise=null;
let saveStorageInfo={quota:null,usage:null,persisted:null,targetBytes:SAVE_STORAGE_TARGET_BYTES};

function openSaveDatabase(){
 if(saveDbPromise)return saveDbPromise;
 saveDbPromise=new Promise((resolve,reject)=>{
   if(!globalThis.indexedDB){reject(new Error("瀏覽器未提供 IndexedDB 大容量儲存。"));return}
   const req=indexedDB.open(SAVE_DB_NAME,SAVE_DB_VERSION);
   req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(SAVE_DB_STORE))db.createObjectStore(SAVE_DB_STORE)};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error("IndexedDB 開啟失敗。"));
   req.onblocked=()=>console.warn("save database upgrade blocked")
 });
 return saveDbPromise
}
async function saveDbGet(key){
 const db=await openSaveDatabase();
 return new Promise((resolve,reject)=>{
   const tx=db.transaction(SAVE_DB_STORE,"readonly"),req=tx.objectStore(SAVE_DB_STORE).get(key);
   req.onsuccess=()=>resolve(req.result??null);
   req.onerror=()=>reject(req.error||tx.error||new Error("IndexedDB 讀取失敗。"))
 })
}
async function saveDbPut(key,value){
 const db=await openSaveDatabase();
 return new Promise((resolve,reject)=>{
   const tx=db.transaction(SAVE_DB_STORE,"readwrite");
   tx.objectStore(SAVE_DB_STORE).put(value,key);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>reject(tx.error||new Error("IndexedDB 寫入失敗。"));
   tx.onabort=()=>reject(tx.error||new Error("IndexedDB 寫入已中止。"))
 })
}
async function saveDbDelete(key){
 const db=await openSaveDatabase();
 return new Promise((resolve,reject)=>{
   const tx=db.transaction(SAVE_DB_STORE,"readwrite");
   tx.objectStore(SAVE_DB_STORE).delete(key);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>reject(tx.error||new Error("IndexedDB 刪除失敗。"));
   tx.onabort=()=>reject(tx.error||new Error("IndexedDB 刪除已中止。"))
 })
}
async function saveDbClear(){
 const db=await openSaveDatabase();
 return new Promise((resolve,reject)=>{
   const tx=db.transaction(SAVE_DB_STORE,"readwrite");
   tx.objectStore(SAVE_DB_STORE).clear();
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>reject(tx.error||new Error("IndexedDB 清除失敗。"));
   tx.onabort=()=>reject(tx.error||new Error("IndexedDB 清除已中止。"))
 })
}
async function refreshSaveStorageInfo(){
 try{
   if(navigator.storage?.persisted)saveStorageInfo.persisted=await navigator.storage.persisted();
   if(navigator.storage?.estimate){
     const est=await navigator.storage.estimate();
     saveStorageInfo.quota=Number(est.quota||0)||null;
     saveStorageInfo.usage=Number(est.usage||0)||0
   }
 }catch(e){console.warn("storage estimate failed",e)}
 return saveStorageInfo
}
async function requestExpandedSaveStorage(){
 try{
   if(navigator.storage?.persist){
     const granted=await navigator.storage.persist();
     if(typeof granted==="boolean")saveStorageInfo.persisted=granted
   }
 }catch(e){console.warn("persistent storage request failed",e)}
 await refreshSaveStorageInfo();
 return saveStorageInfo
}
async function migrateLegacySaveBackups(){
 if(!window.localStorage)return;
 let legacyIndex=[];
 try{legacyIndex=JSON.parse(localStorage.getItem(SAVE_BACKUP_INDEX_KEY)||"[]");if(!Array.isArray(legacyIndex))legacyIndex=[]}catch(e){legacyIndex=[]}
 const keys=[];
 try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith("chronicle_save_backup_"))keys.push(key)}}catch(e){}
 if(!keys.length&&!legacyIndex.length)return;
 const known=new Map(legacyIndex.filter(x=>x?.key).map(x=>[x.key,x]));
 const moved=[];
 for(const key of keys){
   let raw=null;try{raw=localStorage.getItem(key)}catch(e){}
   if(!raw)continue;
   await saveDbPut(key,raw);
   moved.push(known.get(key)||{key,from:"legacy",to:"migrated",time:new Date().toISOString()})
 }
 const merged=[...moved,...legacyIndex.filter(x=>x?.key&&!keys.includes(x.key))].slice(0,5);
 if(merged.length)await saveDbPut(SAVE_BACKUP_INDEX_KEY,merged);
 try{
   for(const key of keys)localStorage.removeItem(key);
   localStorage.removeItem(SAVE_BACKUP_INDEX_KEY)
 }catch(e){}
}
async function init(){
 let legacyRaw=null;
 try{legacyRaw=window.localStorage?localStorage.getItem(SAVE_MAIN_KEY):null}catch(e){}
 if(legacyRaw){
   let restored=false;
   try{
     G=JSON.parse(legacyRaw);
     lastPersistSerialized="";
     migrateSave();
     if(!G||typeof G!=="object"||!G.meta||!G.character||!G.worldTime)throw new Error("legacy save is incomplete");
     enterGame(true);
     restored=true
   }catch(e){
     console.warn("legacy save restore failed; trying expanded storage",e);
     G=null
   }
   if(restored){
     try{
       await requestExpandedSaveStorage();
       await migrateLegacySaveBackups();
       persist();
       await flushPersistWrites()
     }catch(e){console.warn("legacy save migration failed",e)}
     return
   }
 }
 let raw=null;
 try{
   await requestExpandedSaveStorage();
   await migrateLegacySaveBackups();
   raw=await saveDbGet(SAVE_MAIN_KEY)
 }catch(e){console.warn("large save storage init failed",e)}
 if(raw){
   try{
     G=JSON.parse(raw);
     lastPersistSerialized=raw;
     migrateSave();
     if(!G||typeof G!=="object"||!G.meta||!G.character||!G.worldTime)throw new Error("expanded save is incomplete");
     enterGame(true)
   }catch(e){console.warn("expanded save restore failed",e);G=null}
 }
}
function migrateSave(){
 const legacyOriginMap=DB.origin_system?.legacy_origin_map||{};
 const legacyRaceSubtypeMap={"獅":"獅人","虎":"虎人","狼":"狼人","狐":"狐人","貓":"貓人","牛":"獅人"};
 if(G?.character?.raceId==="R-ORC"&&legacyRaceSubtypeMap[G.character.raceSubtype])G.character.raceSubtype=legacyRaceSubtypeMap[G.character.raceSubtype];

 const legacyOriginId=G?.character?.originId;
 if(legacyOriginId&&legacyOriginMap[legacyOriginId]){
   G.character.originId=legacyOriginMap[legacyOriginId];
   const mappedFacet=DB.origin_system?.legacy_origin_facets?.[legacyOriginId];
   if(mappedFacet&&!G.character.originFacetId)G.character.originFacetId=mappedFacet;
 }
 const defaultOriginFacet=DB.origin_system?.default_facets?.[G?.character?.originId];
 if(defaultOriginFacet&&!G?.character?.originFacetId)G.character.originFacetId=defaultOriginFacet;

 /* 政治聲望整併必須每次載入都執行，不能被CURRENT版本短路；舊地方政務也可能在升版後再次寫回退役政治體ID。 */
 normalizePoliticalStandingState();

 const classMerge=DB.combat_class_merge_map||{};
 const remapClassId=id=>classMerge[id]||id;
 if(G?.character?.classId)G.character.classId=remapClassId(G.character.classId);
 if(Array.isArray(G?.character?.classHistory))for(const row of G.character.classHistory)if(row?.id)row.id=remapClassId(row.id);
 if(Array.isArray(G?.character?.unlockedClassRoutes))G.character.unlockedClassRoutes=[...new Set(G.character.unlockedClassRoutes.map(remapClassId))];

 const talentMerge=DB.talent_merge_map||{};
 const remapTalentId=id=>talentMerge[id]||id;
 if(Array.isArray(G?.character?.talents)){
   const valid=IDX.talent;
   G.character.talents=[...new Set(G.character.talents.map(remapTalentId).filter(id=>valid.has(id)))];
 }

 if(!G||G.meta?.version===CURRENT_VERSION)return;
 G.meta.version=CURRENT_VERSION;
 const c=G.character;if(!Array.isArray(c.knownCookingRecipes))c.knownCookingRecipes=cookingLegacyKnownRecipes(c);c.politicalStanding=c.politicalStanding||{};c.regionalPowerStanding=c.regionalPowerStanding||{};
 for(const [oldId,newId] of Object.entries({"POL-010":"RP-010","POL-017":"RP-017"})){if(c.politicalStanding[oldId]!=null)c.regionalPowerStanding[newId]=c.politicalStanding[oldId];delete c.politicalStanding[oldId]}
 normalizePoliticalStandingState();
 c.disciplines=c.disciplines||{discovered:[],mastery:{},reputation:{},membershipId:null};
 const dm=DB.discipline_merge_map||{};c.disciplines.discovered=[...new Set((c.disciplines.discovered||[]).map(id=>dm[id]||id))];
 for(const [oldId,newId] of Object.entries(dm)){if(c.disciplines.mastery?.[oldId]!=null)c.disciplines.mastery[newId]=Math.max(Number(c.disciplines.mastery[newId]||0),Number(c.disciplines.mastery[oldId]||0));if(c.disciplines.reputation?.[oldId]!=null)c.disciplines.reputation[newId]=Math.max(Number(c.disciplines.reputation[newId]||-100),Number(c.disciplines.reputation[oldId]||0));delete c.disciplines.mastery?.[oldId];delete c.disciplines.reputation?.[oldId]}
 c.politicalStanding=c.politicalStanding||{};c.disciplines=c.disciplines||{discovered:[],mastery:{},reputation:{},membershipId:null};c.disciplines.discovered=Array.isArray(c.disciplines.discovered)?c.disciplines.discovered:[];c.disciplines.mastery=c.disciplines.mastery||{};c.disciplines.reputation=c.disciplines.reputation||{};G.worldState=G.worldState||{};G.worldState.disciplineEvents=Array.isArray(G.worldState.disciplineEvents)?G.worldState.disciplineEvents.slice(0,30):[];G.worldState.integratedEvents=Array.isArray(G.worldState.integratedEvents)?G.worldState.integratedEvents.slice(0,60):[];G.worldState.politicalRelations=G.worldState.politicalRelations||{};G.worldState.politicalEvents=Array.isArray(G.worldState.politicalEvents)?G.worldState.politicalEvents.slice(0,30):[];G.worldState.authorityEvents=Array.isArray(G.worldState.authorityEvents)?G.worldState.authorityEvents.slice(0,30):[];G.worldState.sTierEvents=Array.isArray(G.worldState.sTierEvents)?G.worldState.sTierEvents.slice(0,20):[];G.worldState.orchestrator=G.worldState.orchestrator||{lastWorldDynamicTurn:-1};c.knownLoreIds=Array.isArray(c.knownLoreIds)?c.knownLoreIds:starterLoreForCharacter(c.raceId,c.classId);c.knownLoreIds=[...new Set([...c.knownLoreIds,...starterLoreForCharacter(c.raceId,c.classId)])].slice(-300);c.organizations=c.organizations||{membershipId:null,memberships:[],formerMemberships:[],reputation:{},discovered:[]};c.organizations.memberships=Array.isArray(c.organizations.memberships)?c.organizations.memberships:[];c.organizations.formerMemberships=Array.isArray(c.organizations.formerMemberships)?c.organizations.formerMemberships:[];c.organizations.reputation=c.organizations.reputation||{};c.organizations.discovered=Array.isArray(c.organizations.discovered)?c.organizations.discovered:[];G.pendingOrganizationEncounter=G.pendingOrganizationEncounter||null;G.worldState.orgRelations=G.worldState.orgRelations||{};G.worldState.orgEvents=Array.isArray(G.worldState.orgEvents)?G.worldState.orgEvents.slice(0,30):[];c.faith=c.faith||{patronDeityId:null,oathId:null,standing:{}};c.faith.standing=c.faith.standing||{};G.dialogueMemory=Array.isArray(G.dialogueMemory)?G.dialogueMemory.slice(-12):[];G.knownIntel=Array.isArray(G.knownIntel)?G.knownIntel.slice(-120):[];G.explorationIntel=Array.isArray(G.explorationIntel)?G.explorationIntel.slice(-(DB.quest_system?.quest_intel_system?.exploration_record_cap||120)):[];G.intelBoardCache=G.intelBoardCache||{};G.pendingAdventureEvent=G.pendingAdventureEvent||null;G.pendingPartyOpportunity=G.pendingPartyOpportunity||null;c.adventureParty=c.adventureParty||null;if(c.adventureParty){c.adventureParty.members=Array.isArray(c.adventureParty.members)?c.adventureParty.members.slice(0,4):[];if(!c.adventureParty.members.length)c.adventureParty=null;}G.pendingPetOpportunity=G.pendingPetOpportunity||null;c.companions=Array.isArray(c.companions)?c.companions.slice(0,3):[];c.activeCompanionId=c.companions.some(x=>x.uid===c.activeCompanionId)?c.activeCompanionId:(c.companions[0]?.uid||null);G.worldState.lastAdventureEventTurn=G.worldState.lastAdventureEventTurn??-999;
 const rr=by(DB.races,c.raceId)||DB.races[0],rs=(c.raceId==="R-ORC"&&c.raceSubtype)?(DB.race_system.beastfolk_subtypes[c.raceSubtype]||{}):{};
 c.raceTraits=c.raceTraits||[...(rr.traits||[]),...(rs.traits||[])];
 c.raceResistances=c.raceResistances||{...(rr.element_resistances||{})};
 c.talents=Array.isArray(c.talents)?[...new Set(c.talents.map(id=>DB.talent_merge_map?.[id]||id).filter(id=>(DB.talents||[]).some(t=>t.id===id)))]:[];
 if(c.talents.length>DB.talent_system.character_limit)c.talents=c.talents.slice(0,DB.talent_system.character_limit);
 if(c.talents.length<DB.talent_system.character_limit){
   const ctx=talentContext(c.raceId,c.raceSubtype,c.originId,c.classId,c.element,c.subjobs||[]);
   const have=new Set(c.talents),groups=new Set(c.talents.map(id=>talentById(id)?.exclusive_group).filter(Boolean));
   const pool=talentCandidates(ctx).filter(([t])=>!have.has(t.id)&&(!t.exclusive_group||!groups.has(t.exclusive_group)));
   while(c.talents.length<DB.talent_system.character_limit&&pool.length){
     const pick=weightedPick(pool.map(([t,s])=>[t,s]));
     c.talents.push(pick.id);have.add(pick.id);
     if(pick.exclusive_group)groups.add(pick.exclusive_group);
     for(let i=pool.length-1;i>=0;i--)if(have.has(pool[i][0].id)||(pool[i][0].exclusive_group&&groups.has(pool[i][0].exclusive_group)))pool.splice(i,1);
   }
 }


 c.stats.幸運=c.stats.幸運??10;c.buffs=c.buffs||[];c.thirst=c.thirst??10;c.alive=c.hp>0;c.maxMana=c.maxMana??(12+(c.stats.智力||10)+Math.floor((c.stats.意志||10)/2)+talentSpecial("maxMana"));c.mana=c.mana??c.maxMana;c.toxicity=c.toxicity??0;c.statusEffects=c.statusEffects||[];
 c.guildReputation=c.guildReputation??0;c.guildRestrictionUntilTurn=c.guildRestrictionUntilTurn??0;G.quests=G.quests||[];G.questHistory=G.questHistory||[];
 for(const q of (G.quests||[])){if(!q.sourceType){const s=questSourceMeta(q);q.sourceType=s.type;q.sourceId=s.id;}}for(const q of G.quests){
   if(q.templateId==="Q-PATROL"){
     const fresh=questTemplate("Q-PATROL"),oldProgress=Math.min(q.progress||0,fresh.objective.target||2);
     q.objective=JSON.parse(JSON.stringify(fresh.objective));
     q.description=fresh.description;
     q.patrolVisited=(q.patrolVisited||fresh.objective.checkpoints.slice(0,oldProgress)).slice(0,oldProgress);
     q.progress=oldProgress
   }
 }for(const q of G.quests){if(q.status==="ready"&&!q.reportDeadlineHour)q.reportDeadlineHour=Math.max(q.deadlineHour||totalHours(),totalHours()+(DB.quest_system.report_grace_hours||24));}c.classMastery=c.classMastery??0;c.classHistory=c.classHistory||[];c.unlockedClassRoutes=c.unlockedClassRoutes||[];c.knownRecipes=c.knownRecipes||[];c.weaponSet=c.weaponSet||{offhand:null};for(const sj of (c.subjobs||[])){sj.xp=Math.max(0,Number(sj.xp)||0);if(!["F","E","D","C","B","A","S"].includes(sj.grade))sj.grade="F";}
 const mainD=item(equipId(c.equipment?.主武器));if(mainD&&isShieldItem(mainD)){if(!c.weaponSet.offhand)c.weaponSet.offhand=c.equipment.主武器;c.equipment.主武器=makeEquip("EQ-IRON-SWORD")}
 if(mainIsTwoHanded()&&c.weaponSet.offhand)unequipOffhand(true);
 const offD=c.weaponSet.offhand&&item(equipId(c.weaponSet.offhand));if(offD&&!offhandEligible(offD))unequipOffhand(true);
c.currentFacility=null;c.battle=null;
 const slotMap={主武器:"EQ-IRON-SWORD",頭盔:"EQ-HELM",盔甲:"EQ-CLOTH",手套:"EQ-GLOVE",鞋子:"EQ-SHOE",披風:"EQ-CLOAK",飾品1:null,飾品2:null};
 for(const slot of DB.hard_rules.equipment_slots){let v=c.equipment?.[slot];let id=equipId(v);if(id&&!item(id))id=slotMap[slot];c.equipment[slot]=id?makeEquip(id,v?.durability):null}
 c.inventory=(c.inventory||[]).map(x=>({...x}));normalizeCharacterSkills();
 normalizeAbilityPoints();normalizeRevivalState();for(const s of (c.skills||[]))normalizeSkillXp(s);G.worldState.questMarketLedger=Array.isArray(G.worldState.questMarketLedger)?G.worldState.questMarketLedger:[];for(const q of (G.quests||[])){const o=q.objective||{};if(["item","gather"].includes(o.kind)&&o.item_id)o.consume_on_turnin=true;const cap=DB.progression_system.quest_xp_by_tier[q.tier]||12;q.xp_reward=Math.min(Number(q.xp_reward||cap),cap)}syncAllQuestInventoryProgress(true);
 normalizeAffiliationMemberships();syncResourceCaps(true);persist()
}
let lastPersistError=null,lastPersistSerialized="",pendingPersistSerialized=null,persistDrainPromise=null;
function renderSaveHealth(error=null){
 const el=$("#saveWarning");if(!el)return;
 if(error){el.classList.remove("hide");const msg=el.querySelector("span");if(msg)msg.textContent=`${error} 請先匯出存檔備份。`}
 else el.classList.add("hide")
}
function persistErrorMessage(e){
 return e?.name==="QuotaExceededError"?"本機大容量儲存空間已滿。":"目前無法寫入本機存檔。"
}
async function writeSerializedSave(serialized){
 try{
   await saveDbPut(SAVE_MAIN_KEY,serialized);
   try{localStorage.removeItem(SAVE_MAIN_KEY)}catch(e){}
   return true
 }catch(indexedDbError){
   try{
     if(!window.localStorage)throw indexedDbError;
     localStorage.setItem(SAVE_MAIN_KEY,serialized);
     return true
   }catch(localError){
     throw localError?.name==="QuotaExceededError"?localError:indexedDbError
   }
 }
}
async function drainPersistQueue(){
 try{
   while(pendingPersistSerialized!==null){
     const serialized=pendingPersistSerialized;
     pendingPersistSerialized=null;
     try{
       await writeSerializedSave(serialized);
       lastPersistSerialized=serialized;
       if(lastPersistError){lastPersistError=null;renderSaveHealth(null)}
     }catch(e){
       const message=persistErrorMessage(e);
       if(lastPersistError!==message)console.error("local save failed",e);
       lastPersistError=message;renderSaveHealth(message)
     }
   }
   return !lastPersistError
 }finally{persistDrainPromise=null}
}
function persist(){
 try{
  if(G&&typeof generateSaveAuditSnapshot==="function"&&typeof manageSaveAudit==="function"){
   const saveGate=manageSaveAudit(generateSaveAuditSnapshot({gameState:G,includeState:false}));
   if(!saveGate.ok){const message="存檔治理閘門拒絕不完整狀態。";if(lastPersistError!==message)console.error(message,saveGate.issues);lastPersistError=message;renderSaveHealth(message);return false}
  }
  const serialized=JSON.stringify(G);
   if(serialized===lastPersistSerialized||serialized===pendingPersistSerialized)return true;
   if(!globalThis.indexedDB){
     if(!window.localStorage)throw new Error("瀏覽器未提供本機儲存空間。");
     localStorage.setItem(SAVE_MAIN_KEY,serialized);
     lastPersistSerialized=serialized;
     if(lastPersistError){lastPersistError=null;renderSaveHealth(null)}
     return true
   }
   pendingPersistSerialized=serialized;
   if(!persistDrainPromise)persistDrainPromise=drainPersistQueue();
   return true
 }catch(e){
   const message=persistErrorMessage(e);
   if(lastPersistError!==message)console.error("local save failed",e);
   lastPersistError=message;renderSaveHealth(message);return false
 }
}
async function flushPersistWrites(){
 if(persistDrainPromise)await persistDrainPromise;
 return !lastPersistError
}

function talentById(id){const cid=DB.talent_merge_map?.[id]||id;return IDX.talent.get(cid)||null}
function talentContext(raceId,raceSubtype,originId,classId,element,subjobs=[]){
 const r=by(DB.races,raceId),o=org(originId),c=cls(classId);
 return {race:r,subtype:raceSubtype,origin:o,cls:c,element,subjobs,weaponGroup:talentWeaponGroupForClass(c)}
}
function talentWeaponGroupFromItem(d,extraName=""){
 const name=(d?.name||"")+" "+String(extraName||""),sub=d?.catalog_subcategory||"";
 if(/盾/.test(name))return "盾牌";
 if(/巨劍|大劍/.test(name))return "巨劍";
 if(/弩/.test(name))return "弩";
 if(/弓/.test(name)||sub==="弓弩")return "弓";
 if(/飛刀|投擲/.test(name))return "投擲";
 if(/槍|矛|戟/.test(name)||sub==="槍矛長兵")return "長槍";
 if(/拳|武僧|僧侶/.test(name))return "徒手";
 if(/匕首|短刃|影刃|雙刃/.test(name))return "匕首";
 if(/斧|錘|鎚|釘頭/.test(name)||["斧","錘"].includes(sub))return "斧錘";
 if(/劍|刀/.test(name)||["劍","武士刀"].includes(sub))return "長劍";
 return sub||"其他"
}
function talentWeaponGroupForClass(c){
 if(!c)return null;
 return talentWeaponGroupFromItem(item(c.weapon),c.name||"")
}
function currentTalentWeaponGroups(){
 const out=[];
 const main=item(equipId(G?.character?.equipment?.主武器));
 const off=item(equipId(G?.character?.weaponSet?.offhand));
 for(const group of [talentWeaponGroupFromItem(main),talentWeaponGroupFromItem(off)]){
   if(group&&!out.includes(group))out.push(group);
 }
 if(!out.length){
   const fallback=talentWeaponGroupForClass(cls(G?.character?.classId));
   if(fallback)out.push(fallback);
 }
 return out
}
function currentTalentWeaponGroup(){return currentTalentWeaponGroups()[0]||null}
function talentEffectActive(t){
 const groups=t?.identity?.activation?.weapon_groups;
 return !Array.isArray(groups)||!groups.length||groups.some(group=>currentTalentWeaponGroups().includes(group))
}
function talentMatchBlock(block,ctx){
 if(!block)return 0;
 let hits=0,defined=0;
 const checks=[
  ["race_ids",ctx.race?.id],["race_groups",ctx.race?.group],["class_ids",ctx.cls?.id],
  ["class_categories",ctx.cls?.category],["origin_ids",ctx.origin?.id],["origin_categories",ctx.origin?.category],
  ["elements",ctx.element],["primary",ctx.cls?.primary],["weapon_groups",ctx.weaponGroup]
 ];
 for(const [k,v] of checks){
   if(block[k]?.length){defined++;if(block[k].includes(v))hits++}
 }
 if(block.starter_subjobs?.length){
   defined++;
   const have=new Set([...(ctx.origin?.starter_subjobs||[]),...(ctx.subjobs||[]).map(x=>x.id||x)]);
   if(block.starter_subjobs.some(x=>have.has(x)))hits++
 }
 return {hits,defined}
}
function talentEligible(t,ctx){
 const r=talentMatchBlock(t.required,ctx);
 return !r.defined||r.hits>0
}
function talentScore(t,ctx){
 if(!talentEligible(t,ctx))return 0;
 let s=Number(t.weight||1);
 const p=talentMatchBlock(t.preferred,ctx);
 s+=p.hits*6;
 if(t.universal)s+=2;
 return Math.max(.1,s)
}
function talentCandidates(ctx,starterOnly=true){
 let pool=DB.talents.filter(t=>!starterOnly||t.starter_eligible!==false).map(t=>[t,talentScore(t,ctx)]).filter(x=>x[1]>0);
 const strong=pool.filter(([t])=>{const p=talentMatchBlock(t.preferred,ctx),r=talentMatchBlock(t.required,ctx);return p.hits>0||r.hits>0});
 let out=strong;
 if(out.length<6){
   const ids=new Set(out.map(([t])=>t.id));
   const fallback=pool.filter(([t])=>t.universal&&!ids.has(t.id)).sort((a,b)=>b[1]-a[1]);
   out=[...out,...fallback.slice(0,8-out.length)]
 }
 out.sort((a,b)=>b[1]-a[1]||a[0].id.localeCompare(b[0].id));return out
}
function drawTalents(ctx,count=2,starterOnly=true){
 const pool=talentCandidates(ctx,starterOnly).slice(),out=[],groups=new Set();
 while(out.length<count&&pool.length){
   const eligible=pool.filter(([t])=>!t.exclusive_group||!groups.has(t.exclusive_group));
   if(!eligible.length)break;
   const pick=weightedPick(eligible.map(([t,s])=>[t,s]));out.push(pick);
   if(pick.exclusive_group)groups.add(pick.exclusive_group);
   for(let i=pool.length-1;i>=0;i--)if(pool[i][0].id===pick.id||(pick.exclusive_group&&pool[i][0].exclusive_group===pick.exclusive_group))pool.splice(i,1)
 }
 return out
}
function refreshTalentPreview(){
 const el=$("#talentPreview");if(!el)return;
 if(!creation.race||!creation.origin||!creation.classId||!creation.element){
   el.textContent="完成種族、出身與職業後顯示；建立角色時會從合適候選中無重複抽2個。";return
 }
 const ctx=talentContext(creation.race,creation.raceSubtype,creation.origin,creation.classId,creation.element,[]);
 const pool=talentCandidates(ctx);
 el.innerHTML=`候選 ${pool.length} 個：${pool.slice(0,8).map(([t])=>`${t.name}〔${t.identity?.distinctive_axis||t.category}〕`).join("、")}${pool.length>8?"……":""}<br>建立角色時依權重抽2個；同系列天賦不會重複。`
}
function characterTalents(){return (G?.character?.talents||[]).map(talentById).filter(Boolean)}
function activeCharacterTalents(){return characterTalents().filter(talentEffectActive)}
function talentStatBonus(n){return activeCharacterTalents().reduce((s,t)=>s+(t.effects?.stats?.[n]||0),0)}
function talentSpecial(key){return activeCharacterTalents().reduce((s,t)=>s+(t.effects?.special?.[key]||0),0)}
function talentSubjobBonus(sid,key){
 if(!sid||!G?.character?.subjobs?.some(x=>x.id===sid))return 0;
 let total=0;
 for(const t of activeCharacterTalents()){
   const s=t.effects?.subjob;if(!s)continue;
   if(s.all||(s.ids||[]).includes(sid))total+=Number(s[key]||0)
 }
 return total
}
function talentCombat(){
 const out={attack:0,magicPower:0,defense:0,magicDefense:0,accuracy:0,evasion:0,critRate:0,critDamage:0,attackSpeed:0,castSpeed:0,blockRate:0,statusResist:0};
 for(const t of activeCharacterTalents()){
   const c=t.effects?.combat||{};
   for(const k of Object.keys(out))out[k]+=c[k]||0
 }
 return out
}
function talentResistances(){
 const out={光明:0,黑暗:0,火:0,風:0,水:0,地:0,雷:0,生命:0,死亡:0};
 for(const t of activeCharacterTalents())for(const [k,v] of Object.entries(t.effects?.resist||{}))if(k in out)out[k]+=v;
 return out
}
function talentSurvival(){
 const out={hungerRate:1,fatigueRate:1,thirstRate:1};
 for(const t of activeCharacterTalents()){
   const s=t.effects?.survival||{};
   if(s.hungerRate)out.hungerRate*=s.hungerRate;
   if(s.fatigueRate)out.fatigueRate*=s.fatigueRate;
   if(s.thirstRate)out.thirstRate*=s.thirstRate
 }
 return out
}
function talentActionBonus(tag){
 return activeCharacterTalents().reduce((s,t)=>s+(t.effects?.action_bonus?.[tag]||0),0)
}
function talentTargetBonus(enemy){
 let bonus=0;
 for(const t of activeCharacterTalents()){
   const x=t.effects?.target_bonus;if(!x)continue;
   const catOk=!x.categories?.length||x.categories.includes(enemy.category);
   const nameOk=!x.name_keywords?.length||x.name_keywords.some(k=>(enemy.name||"").includes(k));
   if(catOk&&nameOk)bonus+=x.damage||0
 }
 return bonus
}
function rollRace(){
 const r=weightedPick(DB.races.map(x=>[x,Number(x.weight||1)]));
 creation.race=r.id;
 creation.raceSubtype=r.subtypes?.length?r.subtypes[rand(r.subtypes.length)]:null;
 $("#raceResult").innerHTML=`<b>${r.name}${creation.raceSubtype?`（${creation.raceSubtype}）`:""}</b><br><span class="small">${r.group||""}｜${r.description||""}</span>`;
 deriveElement();refreshTalentPreview()
}
function rollOrigin(){
 const o=weightedPick(DB.origins.map(x=>[x,Number(x.weight||1)]));
 const facets=Array.isArray(o.facets)?o.facets:[],facet=facets.length?weightedPick(facets.map(x=>[x,Number(x.weight||1)])):null;
 creation.origin=o.id;creation.originFacet=facet?.id||null;
 $("#originResult").innerHTML=`<b>${o.name}${facet?`・${facet.name}`:""}</b><br><span class="small">${o.category}｜${o.description}<br><b>特色：</b>${o.signature||"—"}<br><b>代價：</b>${o.burden||"—"}${facet?`<br><b>側寫：</b>${facet.note}`:""}</span>`;
 deriveElement();refreshTalentPreview()
}
function deriveElement(){if(!creation.race||!creation.origin){creation.element=null;$("#elementResult").textContent="依種族＋出身自動隨機";return}const r=by(DB.races,creation.race),o=org(creation.origin),pool=[...(r.affinity_bias||[]),...(o.affinities||[]),...(o.affinities||[])];creation.element=pool[rand(pool.length)]||"地";$("#elementResult").textContent=creation.element+"親和";refreshTalentPreview()}
function showClassSelect(){const list=DB.combat_classes.filter(x=>x.selectable);setUIHTML($("#classSelectBox"),list.map(c=>`<button onclick="selectClass('${c.id}')">${c.name} <span class="tier">${c.tier}</span></button>`).join(" "));$("#classSelectBox").classList.remove("hide")}
function selectClass(id){creation.classId=id;$("#classResult").innerHTML=`${cls(id).name} <span class="tier">${cls(id).tier}</span>（自選）`;$("#classSelectBox").classList.add("hide");refreshTalentPreview()}
function rollClass(){
 if(creation.randomLeft<=0){alert("隨機職業機會已用完。");return}
 creation.randomLeft--;
 const r=creation.race?by(DB.races,creation.race):null,o=creation.origin?org(creation.origin):null;
 const raceBias=new Set(r?.class_bias||[]),originBias=new Set(o?.class_bias||[]);
 const pool=DB.combat_classes.map(c=>{
   let w=c.selectable?12:(c.weight||3);
   if(raceBias.has(c.id))w*=1.65;
   if(originBias.has(c.id))w*=1.45;
   return [c.id,w]
 });
 const id=weightedPick(pool),c=cls(id);creation.classId=id;
 $("#classResult").innerHTML=`${c.name} <span class="tier">${c.tier}</span>${c.sealed?"（高階能力封印）":""}`;
 $("#randomCount").textContent=`隨機剩餘 ${creation.randomLeft} 次`
;refreshTalentPreview()}
function createCharacter(){
 if(!creation.race||!creation.origin||!creation.element||!creation.classId){alert("請先完成種族、出身與職業。");return}
 const r=by(DB.races,creation.race),o=org(creation.origin),cc=cls(creation.classId),id=nowId("CHAR");
 if(typeof generateCharacterProfile==="function"&&typeof manageCharacterGeneration==="function"){
  const draft=generateCharacterProfile({id,name:($("#nameInput").value||"旅人").trim(),raceId:r?.id, raceSubtype:creation.raceSubtype, originId:o?.id, originFacetId:creation.originFacet, element:creation.element, classId:cc?.id});
  const gate=manageCharacterGeneration(draft);
  if(!gate.ok){alert(`角色生成未通過資料治理：${(gate.issues||[]).slice(0,3).map(x=>x.detail||x.code).join("、")}`);return}
 }
 const facet=(o.facets||[]).find(x=>x.id===creation.originFacet)||null;
 const originStarterSubjobs=[...new Set([...(o.starter_subjobs||[]),...(facet?.starter_subjobs||[])])];
 const pool=DB.skill_pools[cc.id]||DB.skill_pools["C-WAR"],starterPool=[...new Map(pool.filter(s=>s.tier==="F").map(s=>[skillKey(s),s])).values()],fallbackPool=[...new Map(pool.map(s=>[skillKey(s),s])).values()],chosen=(starterPool.length>=2?starterPool:fallbackPool).slice().sort(()=>Math.random()-.5).slice(0,2);
 const originItems=[...(o.items||[]),...(facet?.items||[])].filter(id=>item(id));
 const inv=[{id:"I-WATER",qty:2,acquiredHour:8},{id:"I-BREAD",qty:2,acquiredHour:8},{id:"I-JERKY",qty:1,acquiredHour:8}];
 for(const iid of originItems){const found=inv.find(x=>x.id===iid);if(found)found.qty++;else inv.push({id:iid,qty:1,acquiredHour:8})}
 const startH=o.survival_start||{};
 const startResolver=globalThis.QUNLU_STARTER_SETTLEMENTS?.assign;
 const startInfo=typeof startResolver==="function"?startResolver({raceId:r.id,raceSubtype:creation.raceSubtype,originId:o.id,originCategory:o.category,classId:cc.id,classCategory:cc.category}):{location_id:"L-WILLOW"};
 const startLocationId=loc(startInfo?.location_id)?startInfo.location_id:"L-WILLOW";
 G={meta:{version:CURRENT_VERSION,characterId:id,saveIndex:[]},turn:0,worldTime:{year:317,season:"初春",day:1,hour:8,minute:0},worldState:{weather:"晴朗",eventClock:0,politicalRelations:{},politicalEvents:[],authorityEvents:[],disciplineEvents:[],orgRelations:{},orgEvents:[],sTierEvents:[],integratedEvents:[],orchestrator:{lastWorldDynamicTurn:-1}},
 character:{id,name:($("#nameInput").value||"旅人").trim(),raceId:r.id,raceSubtype:creation.raceSubtype,originId:o.id,originFacetId:facet?.id||null,originFlags:[...new Set([...(o.flags||[]),...(facet?.flags||[])])],originKnowledge:[...new Set([...(o.knowledge||[]),...(facet?.knowledge||[])])],element:creation.element,classId:cc.id,level:1,xp:0,abilityPoints:0,spentAbilityPoints:0,abilityPointEntitlement:0,adventureRank:"F",combatGrade:"F",classSealed:!!cc.sealed,classGate:cc.gate||null,classMastery:0,classHistory:[],unlockedClassRoutes:[],
 subjobs:originStarterSubjobs.slice(0,1).map(sid=>({id:sid,grade:"F",xp:0,source:"出身"})),stats:{力量:10,敏捷:10,智力:10,意志:10,體力:10,魅力:10,幸運:10},hp:28,maxHp:28,stamina:22,maxStamina:22,mana:24,maxMana:24,toxicity:0,statusEffects:[],hunger:startH.hunger??10,fatigue:startH.fatigue??5,thirst:startH.thirst??10,weightCap:28+(r.weight_mod||0)+(o.weight_mod||0)+Number(facet?.weight_mod||0),moneySilver:Math.max(0,Number(o.silver||30)+Number(facet?.silver_mod||0)),guildReputation:0,guildRestrictionUntilTurn:0,politicalStanding:{},disciplines:{discovered:[],mastery:{},reputation:{},membershipId:null},organizations:{membershipId:null,memberships:[],formerMemberships:[],reputation:{},discovered:[]},locationId:startLocationId,currentFacility:null,alive:true,revival:{base:3,bonus:0,max:3,used:0,remaining:3},buffs:[],
 skills:chosen.map(s=>({...s,type:"戰鬥",mastery:6,skillXp:Math.round(skillXpThresholds()[1]*.55*100)/100})),companions:[],activeCompanionId:null,adventureParty:null,equipment:{主武器:makeEquip(cc.starter_weapon_id||cc.weapon),頭盔:makeEquip("EQ-HELM"),盔甲:makeEquip("EQ-CLOTH"),手套:makeEquip("EQ-GLOVE"),鞋子:makeEquip("EQ-SHOE"),披風:makeEquip("EQ-CLOAK"),飾品1:null,飾品2:null},
 inventory:inv,weaponSet:{offhand:cc.starter_offhand_id?makeEquip(cc.starter_offhand_id):null},knownRecipes:[],knownCookingRecipes:[],knownLoreIds:starterLoreForCharacter(r.id,cc.id),conditions:[],trainingToday:{day:1,combat:0,survival:0,body:0}},history:[],dialogueMemory:[],knownIntel:[],explorationIntel:[],intelBoardCache:{},questBoard:[],quests:[],questHistory:[],battle:null};
 const tctx=talentContext(r.id,creation.raceSubtype,o.id,cc.id,creation.element,G.character.subjobs);
 const drawnTalents=drawTalents(tctx,DB.talent_system.character_limit);
 G.character.talents=drawnTalents.map(t=>t.id);
 Object.entries(r.stats||{}).forEach(([k,v])=>G.character.stats[k]=(G.character.stats[k]||10)+v);const rs=(r.id==="R-ORC"&&creation.raceSubtype)?(DB.race_system.beastfolk_subtypes[creation.raceSubtype]||{}):{};
 Object.entries(rs.stats||{}).forEach(([k,v])=>G.character.stats[k]=(G.character.stats[k]||10)+v);
 G.character.raceTraits=[...(r.traits||[]),...(rs.traits||[])];
 G.character.raceResistances={...(r.element_resistances||{})};
 Object.entries(o.stats||{}).forEach(([k,v])=>G.character.stats[k]=(G.character.stats[k]||10)+v);
 Object.entries(cc.stats||{}).forEach(([k,v])=>G.character.stats[k]=(G.character.stats[k]||10)+(v>0?Math.max(1,Math.round(v*(cc.creation_stat_scale??1))):Math.round(v*(cc.creation_stat_scale??1))));
 if(r.adaptive_primary_bonus&&cc.primary)G.character.stats[cc.primary]=(G.character.stats[cc.primary]||10)+r.adaptive_primary_bonus;
 syncResourceCaps(false);
 autosave("建立角色");enterGame(false);
 log("系統",`角色建立：${displayRace()}／${o.name}／${cc.name}［${cc.tier}］。`,"ok");log("天賦",`候選池${talentCandidates(tctx).length}個，抽取：${characterTalents().map(t=>t.name).join("、")}。`,"ok");
 if((o.starter_subjobs||[]).length)log("出身",`因「${o.name}」取得起始副職業：${sub(o.starter_subjobs[0]).name}［F］。`,"ok");
 if((o.items||[]).length)log("出身",`出身物資已加入背包：${o.items.map(id=>item(id)?.name).filter(Boolean).join("、")}。`);
 const startLoc=loc(startLocationId),startPolity=startLoc?.political_entity_id?IDX.polity.get(startLoc.political_entity_id):null;
 if(startLoc)log("出發地",`依種族、出身與職業分配至 ${startLoc.name}${startPolity?`（${startPolity.name}）`:""}。`,"ok");
 log("世界誌",`已載入${startLoc?.region||"所在區域"}、${startPolity?.name||"當地政治體"}、${r.name}與${cc.name}的起始歷史文化記錄，共${G.character.knownLoreIds.length}筆。`,"ok");
 if(cc.sealed)log("職業",`高階職業能力保持封印：${cc.gate}`,"warnText")
}
function enterGame(resume){$("#createPanel").classList.add("hide");$("#gamePanel").classList.remove("hide");$("#fixedNav").classList.remove("hide");if(resume)log("系統",`已讀取存檔並更新至${CURRENT_VERSION}。`,"save");renderAll()}
function displayRace(){const r=by(DB.races,G.character.raceId);return r.name+(G.character.raceSubtype?`（${G.character.raceSubtype}）`:"")}
function timeText(){const t=G.worldTime;return `紀元${t.year}年・${t.season}・第${t.day}日 ${String(t.hour).padStart(2,"0")}:${String(t.minute).padStart(2,"0")}`}
function totalHours(){return (G.worldTime.day-1)*24+G.worldTime.hour+G.worldTime.minute/60}
function autosave(reason){const id=`AUTO-${G.meta.characterId.slice(-6)}-T${String(G.turn).padStart(5,"0")}-${Date.now().toString(36).slice(-5).toUpperCase()}`;G.meta.saveIndex.push({id,turn:G.turn,time:timeText(),reason,type:"AUTO"});if(G.meta.saveIndex.length>180)G.meta.saveIndex.shift();persist()}
function beginTurn(reason){if(G.pendingOrganizationEncounter){openPendingOrganizationEncounter();return false}if(G.pendingPartyOpportunity){openPendingPartyOpportunity();return false}if(G.pendingPetOpportunity){const sp=companionSpecies(G.pendingPetOpportunity.speciesId);if(sp)showModal(`寵物機緣・${sp.name}`,`<div class="card"><b>${sp.name}</b> <span class="tier">${sp.tier}</span><br><span class="small">尚未處理先前的馴養機緣。</span></div><div class="actions"><button class="good" onclick="resolvePetOpportunity(true)">嘗試馴養</button><button onclick="resolvePetOpportunity(false)">不打擾牠</button></div>`);return false}if(G.pendingAdventureEvent){openPendingAdventureEvent();return false}if(!G.character.alive){log("系統","角色已死亡，無法行動。","danger");return false}G.turn++;autosave(reason);log("回合",`<span class="time">【${timeText()}】</span>　回合 ${G.turn}　<span class="save">${G.meta.saveIndex.at(-1).id}</span>`);return true}
function advance(h){
 let m=Math.round(h*60);G.worldTime.minute+=m;
 while(G.worldTime.minute>=60){G.worldTime.minute-=60;G.worldTime.hour++}
 while(G.worldTime.hour>=24){G.worldTime.hour-=24;G.worldTime.day++}
 const ts=talentSurvival(),cs=combatStats(),rates=DB.survival_balance?.per_hour||{hunger:.85,fatigue:1.15,thirst:1.15};
 G.character.hunger=clamp(G.character.hunger+h*rates.hunger*ts.hungerRate,0,120);
 G.character.fatigue=clamp(G.character.fatigue+h*rates.fatigue*ts.fatigueRate,0,120);
 G.character.thirst=clamp(G.character.thirst+h*rates.thirst*ts.thirstRate,0,120);
 G.character.hp=clamp(G.character.hp+cs.hpRegen*h,0,G.character.maxHp);
 G.character.mana=clamp(G.character.mana+cs.manaRegen*h,0,G.character.maxMana);
 G.character.buffs=(G.character.buffs||[]).map(b=>({...b,hours:b.hours-h})).filter(b=>b.hours>0);
 G.character.toxicity=clamp((G.character.toxicity||0)-h*4,0,100);
 decayFood();applySurvival()
}
function endTurn(h){advance(h);updateQuestDeadlines();runWorldDynamics();if(G.character.alive&&G.turn>0&&G.turn%AUDIT_INTERVAL_TURNS===0)runAudit();persist();renderAll()}

function decayFood(){const now=totalHours();G.character.inventory.forEach(x=>{const d=item(x.id);if(d?.fresh_hours)x.freshness=clamp(Math.round(100-(now-(x.acquiredHour??now))/d.fresh_hours*100),0,100)})}
function applySurvival(){
 const c=G.character,cs=combatStats();c.conditions=[];
 for(const [n,v] of [["飢餓",c.hunger],["疲勞",c.fatigue],["口渴",c.thirst]]){
   if(v>=70)c.conditions.push(`${n}≥70%：D20受罰`);
   if(v>=90)c.conditions.push(`${n}≥90%：能力減半`)
 }
 const lethal=[c.hunger,c.fatigue,c.thirst].filter(v=>v>=100).length;
 if(lethal){const dmg=lethal*2;c.hp=clamp(c.hp-dmg,0,c.maxHp);c.conditions.push(`生存危機扣血${dmg}`)}
 if(calcWeight()>cs.carryCapacity)c.conditions.push(`超重：D20-2／移動速度下降`);
 if(c.hp<=0){c.alive=false;c.conditions.push("死亡");log("死亡","生命值歸零。","danger")}
}
function effectiveStat(n){
 let v=(G.character.stats[n]||10)+talentStatBonus(n)+equipmentSetStatBonus(n);
 for(const b of (G.character.buffs||[]))v+=b[`stat_${n}`]||0;
 if(G.battle?.active&&G.battle.playerBuff)v+=G.battle.playerBuff[`stat_${n}`]||0;
 if(G.character.hunger>=90||G.character.fatigue>=90||G.character.thirst>=90)v=Math.floor(v/2);
 return Math.max(1,v)
}
function survivalPenalty(){let p=0;[G.character.hunger,G.character.fatigue,G.character.thirst].forEach(v=>{if(v>=70)p-=2});if(calcWeight()>combatStats().carryCapacity)p-=2;return p}
function isShieldItem(d){return !!d&&d.catalog_subcategory==="盾牌"}
function isOneHandedWeapon(d){return !!d&&d.type==="主武器"&&!isShieldItem(d)&&(d.weapon_profile?.hands||1)===1}
function offhandEligible(d){return isShieldItem(d)||isOneHandedWeapon(d)}
function canEquipOffhandItem(d){return equipmentRequirementState(d,true)}
function offhandEquip(){return G.character.weaponSet?.offhand||null}
function equippedEntries(){
 const arr=Object.entries(G.character.equipment||{}).map(([slot,eq])=>({slot,eq})).filter(x=>x.eq);
 if(offhandEquip())arr.push({slot:"副手",eq:offhandEquip()});return arr
}
let EQUIPMENT_SET_CACHE={signature:null,state:[]};
function equipmentSetState(){
 const ids=[...new Set(equippedEntries().map(({eq})=>equipId(eq)).filter(Boolean))].sort();
 const signature=ids.join("|");
 if(EQUIPMENT_SET_CACHE.signature===signature)return EQUIPMENT_SET_CACHE.state;
 const owned=new Set(ids),state=(DB.equipment_sets||[]).map(set=>{
   const count=(set.pieces||[]).filter(id=>owned.has(id)).length;
   const active=(set.bonuses||[]).filter(b=>Number(b.pieces)>0&&count>=Number(b.pieces)).sort((a,b)=>a.pieces-b.pieces);
   return {set,count,total:(set.pieces||[]).length,active}
 }).filter(x=>x.count>0);
 EQUIPMENT_SET_CACHE={signature,state};return state
}
function equipmentSetBonusBucket(field){
 const out={};
 for(const x of equipmentSetState())for(const b of x.active)for(const [k,v] of Object.entries(b?.[field]||{}))out[k]=(out[k]||0)+Number(v||0);
 return out
}
function equipmentSetStatBonus(stat){return Number(equipmentSetBonusBucket("stats")[stat]||0)}
function equipmentSetSummaryHtml(){
 const states=equipmentSetState();if(!states.length)return "";
 const rows=states.map(x=>{
   const lines=(x.set.bonuses||[]).map(b=>`<span class="${x.count>=b.pieces?"ok":"small"}">${b.pieces}件：${b.description||"套裝效果"}</span>`).join("<br>");
   return `<div class="card small"><b>${x.set.name}</b> ${x.count}/${x.total}<br>${lines}</div>`
 }).join("");
 return `<h3>套裝效果</h3>${rows}`
}
function mainIsTwoHanded(){
 const d=mainWeaponData();return (d?.weapon_profile?.hands||1)>=2
}
function unequipOffhand(silent=false){
 const eq=offhandEquip();if(!eq)return;
 addItem(eq.id,1,{durability:eq.durability});G.character.weaponSet.offhand=null;
 if(!silent){persist();renderAll();openEquipment()}
}function equipmentCombat(){
 const out={attack:0,magicPower:0,defense:0,magicDefense:0,accuracy:0,evasion:0,critRate:0,critDamage:0,attackSpeed:0,castSpeed:0,blockRate:0,statusResist:0};
 equippedEntries().forEach(({eq})=>{
   const d=item(equipId(eq));if(!d)return;const ratio=(eq.durability??1)/(eq.maxDurability||d.durability||1);
   let scale=ratio<=0?0:ratio<.3?.6:1;if(d.sealed)scale*=.35;
   for(const k of Object.keys(out))out[k]+=(d.combat?.[k]||0)*scale
 });
 const set=equipmentSetBonusBucket("combat");for(const k of Object.keys(out))out[k]+=Number(set[k]||0);
 return out
}
function skillCombat(){
 const out={attack:0,magicPower:0,defense:0,magicDefense:0,accuracy:0,evasion:0,critRate:0,critDamage:0,attackSpeed:0,castSpeed:0,blockRate:0,statusResist:0};
 G.character.skills.forEach(s=>{
   if(s.kind==="被動"){
     out.attack+=s.power||0;out.defense+=s.defense||0;out.accuracy+=s.accuracy||0;out.evasion+=s.evasion||0;
     for(const k of ["magicPower","magicDefense","critRate","critDamage","attackSpeed","castSpeed","blockRate","statusResist"])out[k]+=s[k]||0
   }
 });return out
}
function buffCombat(){
 const out={attack:0,magicPower:0,defense:0,magicDefense:0,accuracy:0,evasion:0,critRate:0,critDamage:0,attackSpeed:0,castSpeed:0,blockRate:0,statusResist:0};
 (G.character.buffs||[]).forEach(b=>{for(const k of Object.keys(out))out[k]+=b[k]||0});
 if(G.battle?.active&&G.battle.playerBuff){for(const k of Object.keys(out))out[k]+=G.battle.playerBuff[k]||0}
 return out
}
function battlePercentBuffs(){
 const b=G.battle?.active?G.battle.playerBuffPct:null;
 return {defensePct:Number(b?.defensePct||0),magicDefensePct:Number(b?.magicDefensePct||0)}
}
function raceData(){return by(DB.races,G.character.raceId)||{}}
function raceSubtypeData(){
 if(G.character.raceId!=="R-ORC"||!G.character.raceSubtype)return {};
 return DB.race_system?.beastfolk_subtypes?.[G.character.raceSubtype]||{}
}
function raceCombat(){
 const out={attack:0,magicPower:0,defense:0,magicDefense:0,accuracy:0,evasion:0,critRate:0,critDamage:0,attackSpeed:0,castSpeed:0,blockRate:0,statusResist:0};
 for(const src of [raceData().combat||{},raceSubtypeData().combat||{}])for(const k of Object.keys(out))out[k]+=src[k]||0;
 return out
}
function raceResistances(){
 const out={光明:0,黑暗:0,火:0,風:0,水:0,地:0,雷:0,生命:0,死亡:0};
 for(const [k,v] of Object.entries(raceData().element_resistances||{}))if(k in out)out[k]+=v;
 const tr=talentResistances();for(const k of Object.keys(out))out[k]+=tr[k]||0;
 return out
}
function permanentStat(n){return Math.max(1,(G.character.stats[n]||10)+talentStatBonus(n))}
function statCode(code,effective=true){
 const map={STR:"力量",DEX:"敏捷",CON:"體力",INT:"智力",WIS:"意志",CHA:"魅力",LUK:"幸運"},k=map[code]||code;
 return effective?effectiveStat(k):permanentStat(k)
}
function mainWeaponData(){const eq=G.character.equipment?.主武器;return eq?item(equipId(eq)):null}
function mainWeaponProfile(){
 const d=mainWeaponData();return d?.weapon_profile||{group:"其他",range:1.2,armor_pen_pct:0,required_str:null,required_dex:null}
}
function advancedEquipment(){
 const out={moveSpeed:0,range:0,armorPenPct:0,magicPenPct:0,blockValue:0,poise:0,statusAccuracy:0,lifeSteal:0,healingPower:0,manaRegen:0,hpRegen:0,critResist:0,threat:0,stealth:0,perception:0,carryCapacity:0,initiative:0,blockRate:0};
 equippedEntries().forEach(({eq})=>{
   const d=item(equipId(eq));if(!d)return;const ratio=(eq.durability??1)/(eq.maxDurability||d.durability||1),scale=ratio<=0?0:ratio<.3?.6:1;
   for(const [k,v] of Object.entries(d.advanced_combat||{}))if(k in out)out[k]+=Number(v||0)*scale
 });
 const set=equipmentSetBonusBucket("advanced_combat");for(const k of Object.keys(out))out[k]+=Number(set[k]||0);
 return out
}
function advancedBuffs(){
 const out={moveSpeed:0,range:0,armorPenPct:0,magicPenPct:0,blockRate:0,blockValue:0,poise:0,statusAccuracy:0,lifeSteal:0,healingPower:0,manaRegen:0,hpRegen:0,critResist:0,threat:0,stealth:0,perception:0,carryCapacity:0,initiative:0};
 for(const b of (G.character.buffs||[])){
   for(const k of Object.keys(out))out[k]+=Number(b[k]||0);
   out.hpRegen+=Number(b.hp_regen||0);out.manaRegen+=Number(b.mana_regen||0)
 }
 if(G.battle?.active&&G.battle.playerBuff)for(const k of Object.keys(out))out[k]+=Number(G.battle.playerBuff[k]||0);
 return out
}
function classCombatIdentityEffects(){
 const raw=cls(G.character.classId)?.combat_identity?.combat_effects||{};
 const keys=["attack_pct","magic_attack_pct","defense_pct","magic_defense_pct","accuracy","evasion","crit_rate","crit_damage","attack_speed_pct","cast_speed_pct","armor_pen_pct","magic_pen_pct","block_value","poise","status_accuracy","status_resist","healing_power","mana_regen","threat","stealth","perception","summon_power","initiative","move_speed","life_steal"];
 return Object.fromEntries(keys.map(k=>[k,Number(raw[k]||0)]))
}
function classCombatAdvanced(){
 const role=cls(G.character.classId)?.combat_role||"",ci=classCombatIdentityEffects(),out={initiative:0,moveSpeed:0,blockValue:0,poise:0,statusAccuracy:0,healingPower:0,manaRegen:0,threat:0,stealth:0,perception:0,summonPower:0};
 if(role.includes("防禦")){out.threat+=25;out.blockValue+=7;out.poise+=8}
 if(role.includes("敏捷")){out.initiative+=4;out.stealth+=6}
 if(role.includes("遠程")){out.perception+=5;out.initiative+=2}
 if(role.includes("治療")){out.healingPower+=10;out.manaRegen+=.4}
 if(role.includes("施法")){out.statusAccuracy+=4;out.manaRegen+=.3}
 if(role.includes("支援")){out.summonPower+=5}
 out.initiative+=ci.initiative;out.moveSpeed+=ci.move_speed;out.blockValue+=ci.block_value;out.poise+=ci.poise;
 out.statusAccuracy+=ci.status_accuracy;out.healingPower+=ci.healing_power;out.manaRegen+=ci.mana_regen;
 out.threat+=ci.threat;out.stealth+=ci.stealth;out.perception+=ci.perception;out.summonPower+=ci.summon_power;
 return out
}

function syncBodyScrollLock(){
 const modalOpen=!$("#modalBack")?.classList.contains("hide"),battleOpen=!!G?.battle?.active&&!$("#battleBack")?.classList.contains("hide");
 document.body.classList.toggle("modal-open",!!modalOpen);document.body.classList.toggle("battle-open",!!battleOpen)
}
function abilityPointsEarned(level=G?.character?.level||1){return Math.floor(Math.max(1,level)/5)}
function normalizeAbilityPoints(){
 if(!G?.character)return;const c=G.character;c.spentAbilityPoints=Math.max(0,Number(c.spentAbilityPoints||0));
 const entitled=abilityPointsEarned(c.level);
 c.abilityPoints=Math.max(0,entitled-c.spentAbilityPoints);c.abilityPointEntitlement=entitled
}
function normalizeRevivalState(){
 if(!G?.character)return null;const c=G.character,legacy=c.revival||{};
 const bonus=Math.max(0,Math.floor(Number(legacy.bonus||talentSpecial("revivalCharges")||0))),max=3+bonus;
 const used=Math.max(0,Math.min(max,Math.floor(Number(legacy.used||0))));
 c.revival={base:3,bonus,max,used,remaining:Math.max(0,max-used)};
 return c.revival
}
function spendAbilityPoint(stat){
 normalizeAbilityPoints();if(!DB.ability_point_system?.spend_stats?.includes(stat)||G.character.abilityPoints<=0)return;
 G.character.abilityPoints--;G.character.spentAbilityPoints=(G.character.spentAbilityPoints||0)+1;G.character.stats[stat]=(G.character.stats[stat]||10)+1;
 syncResourceCaps(true);persist();openCharacter()
}
function skillXpThresholds(){return DB.skill_scaling_system?.skill_xp_system?.xp_thresholds||[0,12,30,55,85,120,160,205,255,310]}
function skillXpFromLegacyMastery(s){
 const m=clamp(Number(s?.mastery||0),0,100),old=DB.skill_scaling_system?.mastery_level_thresholds||[0,10,20,30,40,50,60,70,82,94],xp=skillXpThresholds();
 let lv=1;for(let i=1;i<old.length;i++)if(m>=old[i])lv=i+1;
 const i=lv-1;if(i>=9)return xp[9];const lo=old[i]||0,hi=old[i+1]||100,t=(m-lo)/Math.max(1,hi-lo);return Math.round((xp[i]+(xp[i+1]-xp[i])*t)*100)/100
}
function normalizeSkillXp(s){
 if(!s)return 0;const cap=skillXpThresholds().at(-1);
 if(s.skillXp==null)s.skillXp=skillXpFromLegacyMastery(s);
 s.skillXp=clamp(Number.isFinite(Number(s.skillXp))?Number(s.skillXp):0,0,cap);syncSkillMasteryFromXp(s);return s.skillXp
}
function syncSkillMasteryFromXp(s){
 if(!s)return;const xp=skillXpThresholds(),v=Math.max(0,Number(s.skillXp||0));let lv=1;for(let i=1;i<xp.length;i++)if(v>=xp[i])lv=i+1;
 const i=lv-1;if(i>=9){s.mastery=100;return}const lo=xp[i],hi=xp[i+1],old=DB.skill_scaling_system?.mastery_level_thresholds||[0,10,20,30,40,50,60,70,82,94];const t=clamp((v-lo)/Math.max(1,hi-lo),0,1);s.mastery=Math.round(((old[i]||0)+((old[i+1]||100)-(old[i]||0))*t)*100)/100
}
function gainSkillXp(skill,amount,source="技能使用"){
 if(!skill||amount<=0)return;normalizeSkillXp(skill);const before=skillLevel(skill),cap=skillXpThresholds().at(-1);skill.skillXp=clamp(skill.skillXp+Number(amount||0),0,cap);syncSkillMasteryFromXp(skill);const after=skillLevel(skill);
 if(after>before){const msg=`${skill.name}提升至Lv${after}，技能效果增強。`;if(G?.battle?.active)battleLog(msg);else log("技能",msg,"ok")}
 if(source&&source!=="技能使用"&&!G?.battle?.active)log("技能",`${skill.name}獲得${Number(amount).toFixed(amount%1?1:0)}技能XP（${source}）。`)
}
function skillXpProgressText(s){normalizeSkillXp(s);const lv=skillLevel(s),xp=skillXpThresholds();return lv>=10?`${Math.round(s.skillXp)}/${xp[9]} MAX`:`${Math.round(s.skillXp)}/${xp[lv]}`}
function openSkillXpScroll(invIndex){
 const x=G.character.inventory[invIndex],d=item(x?.id);if(!d?.skill_xp)return;const rows=(G.character.skills||[]).map((s,i)=>`<div class="itemrow"><span><b>${s.name}</b> <span class="tier">Lv${skillLevel(s)}</span><br><span class="small">技能XP ${skillXpProgressText(s)}</span></span><button ${skillLevel(s)>=10?"disabled":""} onclick="applySkillXpScroll(${invIndex},${i})">研讀</button></div>`).join("");showModal(d.name,`<div class="card small">選擇一個已學技能，獲得 ${d.skill_xp} 技能XP。</div>${rows}`)
}
function applySkillXpScroll(invIndex,skillIndex){
 const x=G.character.inventory[invIndex],d=item(x?.id),s=G.character.skills?.[skillIndex];if(!d?.skill_xp||!s)return;if(skillLevel(s)>=10){alert("此技能已達Lv10。");return}removeItem(x.id,1,invIndex);gainSkillXp(s,d.skill_xp,d.name);persist();openCharacterSkills()
}
function questObjectiveConsumesItems(q){const o=q?.objective||{};return ["item","gather"].includes(o.kind)&&!!o.item_id&&o.consume_on_turnin!==false}
function inventoryQuantityMap(){
 const quantities=new Map();for(const x of G?.character?.inventory||[])quantities.set(x.id,(quantities.get(x.id)||0)+(x.qty||1));return quantities
}
function syncQuestInventoryProgressOne(q,quiet=true,quantities=null){
 if(!q||!["active","ready"].includes(q.status))return;const o=q.objective||{};if(!["item","gather"].includes(o.kind)||!o.item_id)return;
 const before=q.status,have=quantities?quantities.get(o.item_id)||0:inventoryQty(o.item_id),target=o.target||1;q.progress=Math.min(target,have);q.status=q.progress>=target?"ready":"active";
 if(q.status==="ready"&&before!=="ready"){q.completedHour=totalHours();const grace=q.completionGraceHours??DB.quest_system.report_grace_hours??24;q.reportDeadlineHour=Math.max(q.deadlineHour||totalHours(),totalHours()+grace);if(!quiet)log("委託",`${q.name}：已備妥 ${item(o.item_id)?.name||o.item_id} ×${target}，可前往回報。`,"ok")}
}
function syncAllQuestInventoryProgress(quiet=true){const quantities=inventoryQuantityMap();for(const q of G?.quests||[])syncQuestInventoryProgressOne(q,quiet,quantities)}
function questMarketKey(q){const o=q?.objective||{};if(["item","gather"].includes(o.kind)&&o.item_id)return `item:${o.item_id}`;if(o.kind==="kill")return `kill:${(o.monster_keywords||[]).slice().sort().join("+")}`;return null}
function questMarketRegionId(){return loc(G.character.locationId)?.world_region_id||loc(G.character.locationId)?.region_id||"REG-18"}
function localEconomyProfile(id=G.character.locationId){return loc(id)?.local_economy||null}
function questMarketLedger(){G.worldState=G.worldState||{};G.worldState.questMarketLedger=Array.isArray(G.worldState.questMarketLedger)?G.worldState.questMarketLedger:[];const win=DB.quest_system?.market_demand?.window_hours||120,now=totalHours();G.worldState.questMarketLedger=G.worldState.questMarketLedger.filter(x=>now-x.hour<=win);return G.worldState.questMarketLedger}
function questMarketPressure(q,regionId=questMarketRegionId()){const key=questMarketKey(q);if(!key)return 0;const now=totalHours(),win=DB.quest_system?.market_demand?.window_hours||120;return questMarketLedger().filter(x=>x.regionId===regionId&&x.key===key).reduce((n,x)=>n+(x.qty||1)*Math.max(.25,1-(now-x.hour)/win),0)}
function questMarketFactor(q,regionId=questMarketRegionId()){
 const key=questMarketKey(q);if(!key)return 1;const p=questMarketPressure(q,regionId),steps=DB.quest_system?.market_demand?.pressure_steps||[];for(const s of steps)if(p<=s.max)return s.factor;return 0
}
function questMarketAvailable(q){return questMarketFactor(q)>0}
function adjustedRewardRange(q){const af=affiliationEffects(),f=questMarketFactor(q)*(1+af.quest_reward_pct/100),r=q.reward||[q.rewardSilver||0,q.rewardSilver||0];return [Math.max(1,Math.round(r[0]*f)),Math.max(1,Math.round(r[1]*f)),f]}
function registerQuestMarketCompletion(q){const key=questMarketKey(q);if(!key)return;questMarketLedger().push({hour:totalHours(),regionId:questMarketRegionId(),key,qty:q.objective?.target||1,source:q.sourceType||q.type||"quest"});if(G.worldState.questMarketLedger.length>120)G.worldState.questMarketLedger=G.worldState.questMarketLedger.slice(-120)}
function marketPressureText(q){const f=questMarketFactor(q);return f>=1?"需求正常":f<=0?"市場飽和・暫停發布":`需求轉弱・報酬${Math.round(f*100)}%`}
function regionalItemMarketFactor(d){
 const rid=questMarketRegionId(),place=loc(G.character.locationId),ctx=regionalEconomyContext(rid,place?.political_entity_id),eco=localEconomyProfile();
 let f=Number(eco?.market_price_mult||1);
 if(d?.regional_origin_id===rid)f*=DB.market_economy_system?.regional_origin_factor||.95;else if(d?.regional_origin_id)f*=DB.market_economy_system?.imported_origin_factor||1.05;
 const text=[d?.name,d?.material,d?.material_group,d?.type].filter(Boolean).join(" ");
 if(ctx?.exports?.some(k=>text.includes(k)))f*=.95;
 if(ctx?.imports?.some(k=>text.includes(k)))f*=1.05;
 return clamp(f,...(DB.market_economy_system?.price_factor_range||[.8,1.2]))
}
function guildBuybackUnitPrice(d){
 const bonus=clamp(talentSpecial("sellBonus"),0,.25),market=Math.max(1,Math.floor((d?.value||1)*.5*(1+bonus)*regionalItemMarketFactor(d)*affiliationPriceMultiplier("sell")));
 return Math.max(1,Math.floor(market*.9))
}
const TEAM_CARRY_ROLE_BASE=Object.freeze({frontline:13,tank:16,healer:7,ranged:9,scout:8,caster:6,hybrid:10,support:11,specialist:10});
const TEAM_CARRY_ROLE_TRAIT=Object.freeze({
 frontline:"近戰體能與行軍整備",tank:"重裝搬運與前線補給",healer:"醫療包與輕量補給",ranged:"彈藥與野外行囊",scout:"輕裝偵查與分散攜行",
 caster:"施法媒介與輕量行囊",hybrid:"多用途行軍裝備",support:"補給整備與隊伍後勤",specialist:"專業工具與任務裝備"
});
const TEAM_CARRY_TIER_BONUS=Object.freeze([0,1,2,4,6,8,10]);
function roundCarry(v){return Math.round(Number(v||0)*10)/10}
function teammateCarryRaceModifier(race){
 const s=String(race||"");
 if(/巨人|食人魔|巨魔|泰坦/.test(s))return 10;
 if(/獸人|半獸人|牛頭|熊人|龍裔|龍人|構裝|魔像/.test(s))return 5;
 if(/矮人|山民/.test(s))return 4;
 if(/半身|侏儒|妖精/.test(s))return -3;
 if(/精靈/.test(s))return -1;
 return 0
}
function teammateCarryProfile(template,member=null){
 if(!template)return {bonus:0,trait:"無",role:"specialist",level:1,bond:0};
 const role=TEAM_CARRY_ROLE_BASE[template.role]!=null?template.role:"specialist";
 const level=Math.max(1,Number(member?.level||template.min_player_level||1));
 const bond=clamp(Number(member?.bond||0),0,100);
 const tierBonus=TEAM_CARRY_TIER_BONUS[tierOrder(template.tier)]||0;
 const base=TEAM_CARRY_ROLE_BASE[role]+teammateCarryRaceModifier(template.race)+tierBonus+Math.min(8,(level-1)*.35);
 const bonus=roundCarry(Math.max(2,base*(1+bond*.0015)));
 return {bonus,trait:TEAM_CARRY_ROLE_TRAIT[role],role,level,bond}
}
function companionCarryProfile(species,inst=null){
 if(!species)return {bonus:0,trait:"無",canCarry:false};
 if(species.companion_kind==="summon")return {bonus:0,trait:"召喚型不提供常駐負重",canCarry:false};
 const text=[species.name,species.family,species.species_group,species.body_type].filter(Boolean).join(" ");
 let base=6,trait="一般伴獸攜行";
 if(/馬|駝|牛|象|犀|熊|巨獸|甲獸|龍|龜/.test(text)){base=16;trait="大型載運／重體型"}
 else if(/構裝|魔像|傀儡|石像|岩獸|鐵獸/.test(text)){base=14;trait="重型構裝載運"}
 else if(/狼|犬|鹿|豬|羊|虎|獅|豹|蜥|猿/.test(text)){base=9;trait="中型獸類攜行"}
 else if(/鳥|鷹|隼|鴉|蝠|貓|狐|兔|蛇|鼠|蟲|蛙|妖精/.test(text)){base=3.5;trait="輕型／敏捷體型"}
 else if(/靈|幽|元素|幻/.test(text)){base=2.5;trait="半實體輕量攜行"}
 if(species.companion_kind==="contract"){base+=2;trait+="・契約穩定"}
 const level=Math.max(1,Number(inst?.level||species.min_owner_level||1));
 const bond=clamp(Number(inst?.bond||0),0,100);
 const tierBonus=TEAM_CARRY_TIER_BONUS[tierOrder(species.tier)]||0;
 const bonus=roundCarry(clamp((base+tierBonus+Math.min(10,(level-1)*.30))*(1+bond*.002),1.5,42));
 return {bonus,trait,canCarry:true,level,bond}
}
function teammateCarryCapacityBonus(){
 const rows=[];
 try{
   const list=typeof partyMembers==="function"?partyMembers():[];
   for(const m of list){
     const t=typeof partyTemplate==="function"?partyTemplate(m?.templateId):null;
     if(!t)continue;
     const p=teammateCarryProfile(t,m);
     rows.push({uid:m.uid,templateId:t.id,name:t.name,bonus:p.bonus,trait:p.trait})
   }
 }catch(error){}
 return {total:roundCarry(rows.reduce((s,x)=>s+x.bonus,0)),rows}
}
function companionCarryCapacityBonus(){
 const rows=[];
 try{
   const list=typeof companions==="function"?companions():(G?.character?.companions||[]);
   for(const inst of list){
     const sp=typeof companionSpecies==="function"?companionSpecies(inst?.speciesId):null;
     if(!sp)continue;
     const p=companionCarryProfile(sp,inst);
     if(!p.canCarry||p.bonus<=0)continue;
     rows.push({uid:inst.uid,speciesId:sp.id,name:sp.name,bonus:p.bonus,trait:p.trait})
   }
 }catch(error){}
 return {total:roundCarry(rows.reduce((s,x)=>s+x.bonus,0)),rows}
}
function sharedCarryCapacityBonus(){
 const teammates=teammateCarryCapacityBonus(),companionsCarry=companionCarryCapacityBonus();
 return {teammates,companions:companionsCarry,total:roundCarry(teammates.total+companionsCarry.total)}
}
globalThis.QUNLU_TEAM_CARRY={version:"TEAM-CARRY-1.0",teammateProfile:teammateCarryProfile,companionProfile:companionCarryProfile,teammates:teammateCarryCapacityBonus,companions:companionCarryCapacityBonus,total:sharedCarryCapacityBonus};

function resourceCaps(){
 const str=statCode("STR",false),con=statCode("CON",false),intl=statCode("INT",false),wis=statCode("WIS",false),lv=Math.max(1,G.character.level||1);
 const r=raceData(),o=org(G.character.originId);
 return {
   hp:Math.max(1,Math.round(16+con*1.2+(lv-1)*2)),
   stamina:Math.max(1,Math.round(12+con*.6+str*.4+(lv-1)*.8)),
   mana:Math.max(0,Math.round(9+intl+wis*.5+(lv-1)*.7+talentSpecial("maxMana"))),
   carry:Math.max(20,roundCarry(30+str*1.4+con*.6+(r?.weight_mod||0)+(o?.weight_mod||0)+talentSpecial("carryCapacity")+sharedCarryCapacityBonus().total))
 }
}

function syncResourceCaps(preserve=true){
 const c=G.character,caps=resourceCaps(),hr=c.maxHp?c.hp/c.maxHp:1,sr=c.maxStamina?c.stamina/c.maxStamina:1,mr=c.maxMana?c.mana/c.maxMana:1;
 c.maxHp=caps.hp;c.maxStamina=caps.stamina;c.maxMana=caps.mana;c.weightCap=caps.carry;
 c.hp=preserve?clamp(Math.round(c.maxHp*hr),0,c.maxHp):c.maxHp;
 c.stamina=preserve?clamp(Math.round(c.maxStamina*sr),0,c.maxStamina):c.maxStamina;
 c.mana=preserve?clamp(Math.round(c.maxMana*mr),0,c.maxMana):c.maxMana
}
function elementalResistances(){
 const out={光明:0,黑暗:0,火:0,風:0,水:0,地:0,雷:0,生命:0,死亡:0};
 for(const [k,v] of Object.entries(raceResistances()))if(k in out)out[k]+=Number(v||0);
 for(const {eq} of equippedEntries()){if(!eq)continue;const d=item(equipId(eq));for(const [k,v] of Object.entries(d?.element_resistances||{}))if(k in out)out[k]+=Number(v||0)}
 const set=equipmentSetBonusBucket("element_resistances");for(const [k,v] of Object.entries(set))if(k in out)out[k]+=Number(v||0);
 for(const b of (G.character.buffs||[]))for(const [k,v] of Object.entries(b.element_resistances||{}))if(k in out)out[k]+=Number(v||0);
 return out
}
function poisonResistance(){return clamp(combatStats().statusResist+talentSpecial("poisonResist"),0,95)}
function combatStats(sharedWeight=null){
 const e=equipmentCombat(),s=skillCombat(),b=buffCombat(),bp=battlePercentBuffs(),af=affiliationEffects(),r=raceCombat(),t=talentCombat(),ae=advancedEquipment(),ab=advancedBuffs(),ca=classCombatAdvanced(),ci=classCombatIdentityEffects(),wp=mainWeaponProfile();
 const str=effectiveStat("力量"),dex=effectiveStat("敏捷"),con=effectiveStat("體力"),intl=effectiveStat("智力"),wis=effectiveStat("意志"),cha=effectiveStat("魅力"),luck=effectiveStat("幸運");
 const cc=cls(G.character.classId),role=cc?.combat_role||"",group=wp.group;
 let atkBase;
 if(["弓","弩","投擲"].includes(group))atkBase=3+dex*1.05+str*.30;
 else if(group==="匕首")atkBase=3+dex*.72+str*.58;
 else if(group==="徒手")atkBase=3+dex*.55+str*.72;
 else atkBase=3+str*1.05+dex*.20;
 let magicBase;
 if(role.includes("治療")||/牧師|神官|祭司|聖職/.test(cc?.name||""))magicBase=2+wis*.95+intl*.45;
 else if(/吟遊|舞者/.test(cc?.name||""))magicBase=2+cha*.82+intl*.38+wis*.20;
 else magicBase=2+intl*1.05+wis*.30;
 const attackSpeed=clamp((.82+dex*.012+e.attackSpeed+s.attackSpeed+b.attackSpeed+r.attackSpeed+t.attackSpeed)*(1+(af.attack_speed_pct+ci.attack_speed_pct)/100),.55,2.5);
 const castSpeed=clamp((.78+intl*.009+wis*.008+e.castSpeed+s.castSpeed+b.castSpeed+r.castSpeed+t.castSpeed)*(1+(af.cast_speed_pct+ci.cast_speed_pct)/100),.55,2.5);
 const carry=resourceCaps().carry+ae.carryCapacity+ab.carryCapacity+af.carryCapacity;
 const loadWeight=sharedWeight==null?calcWeight():sharedWeight,loadRatio=carry>0?loadWeight/carry:0,overloadMove=loadRatio>1?Math.min(35,(loadRatio-1)*50):0;
 const blockRate=clamp(Math.round(2+con*.18+e.blockRate+s.blockRate+b.blockRate+r.blockRate+t.blockRate+(ae.blockRate||0)+af.blockRate),0,75);
 const cs={
   attack:Math.round((atkBase+e.attack+s.attack+b.attack+r.attack+t.attack)*(1+(af.attack_pct+ci.attack_pct)/100)),
   magicPower:Math.round((magicBase+e.magicPower+s.magicPower+b.magicPower+r.magicPower+t.magicPower)*(1+(af.magic_attack_pct+ci.magic_attack_pct)/100)),
   defense:Math.round((2+con*.78+str*.18+e.defense+s.defense+b.defense+r.defense+t.defense)*(1+bp.defensePct/100)*(1+(af.defense_pct+ci.defense_pct)/100)),
   magicDefense:Math.round((2+wis*.82+con*.26+e.magicDefense+s.magicDefense+b.magicDefense+r.magicDefense+t.magicDefense)*(1+bp.magicDefensePct/100)*(1+(af.magic_defense_pct+ci.magic_defense_pct)/100)),
   accuracy:clamp(Math.round(50+dex*1.6+luck*.2+e.accuracy+s.accuracy+b.accuracy+r.accuracy+t.accuracy+af.accuracy+ci.accuracy),5,99),
   evasion:clamp(Math.round(2+dex*.65+luck*.20+e.evasion+s.evasion+b.evasion+r.evasion+t.evasion+af.evasion+ci.evasion),0,80),
   critRate:clamp(Math.round(2+luck*.5+dex*.10+e.critRate+s.critRate+b.critRate+r.critRate+t.critRate+af.critRate+ci.crit_rate),0,75),
   critDamage:clamp(Math.round(145+str*.25+dex*.20+intl*.10+e.critDamage+s.critDamage+b.critDamage+r.critDamage+t.critDamage+af.critDamage+ci.crit_damage),125,300),
   initiative:Math.round((5+dex*1.35+luck*.35+(attackSpeed-1)*10+ae.initiative+ab.initiative+ca.initiative+talentSpecial("initiative"))*(1+af.initiative_pct/100)),
   moveSpeed:Math.round(clamp(100+dex*1.35+ae.moveSpeed+ab.moveSpeed+ca.moveSpeed+talentSpecial("moveSpeed")+af.moveSpeed-overloadMove,55,180)),
   attackSpeed,castSpeed,
   range:Math.round((Math.max(.8,wp.range+ae.range+ab.range))*10)/10,
   armorPenPct:Math.round(clamp((wp.armor_pen_pct||0)+str*.12+ae.armorPenPct+ab.armorPenPct+talentSpecial("armorPierce")+af.armorPenPct+ci.armor_pen_pct,0,60)*10)/10,
   magicPenPct:Math.round(clamp(intl*.10+wis*.06+ae.magicPenPct+ab.magicPenPct+talentSpecial("magicPierce")+af.magicPenPct+ci.magic_pen_pct,0,60)*10)/10,
   blockRate,
   blockValue:Math.round(clamp(20+con*.7+ae.blockValue+ab.blockValue+ca.blockValue+talentSpecial("blockValue"),10,80)),
   poise:Math.round(10+con*1.1+str*.35+ae.poise+ab.poise+ca.poise+talentSpecial("poise")),
   statusAccuracy:Math.round(clamp(5+wis*.65+intl*.35+luck*.2+ae.statusAccuracy+ab.statusAccuracy+ca.statusAccuracy+talentSpecial("statusAccuracy")+af.statusAccuracy,0,95)),
   statusResist:clamp(Math.round(5+wis*1.0+con*.45+e.statusResist+s.statusResist+b.statusResist+r.statusResist+t.statusResist+af.statusResist+ci.status_resist),0,90),
   lifeSteal:Math.round(clamp(talentSpecial("lifeSteal")*100+ae.lifeSteal+ab.lifeSteal+(G.battle?.weaponOil?.lifeSteal||0)*100+ci.life_steal,0,50)*10)/10,
   healingPower:Math.round(clamp(100+wis*1.2+intl*.35+talentSpecial("healingBonus")*100+ae.healingPower+ab.healingPower+ca.healingPower+af.healingPower,70,250)),
   manaRegen:Math.round((.5+wis*.10+intl*.03+ae.manaRegen+ab.manaRegen+ca.manaRegen+talentSpecial("manaRegen")+af.manaRegen)*100)/100,
   hpRegen:Math.round((.15+con*.04+talentSpecial("hpRegenPerHour")+ae.hpRegen+ab.hpRegen)*100)/100,
   critResist:Math.round(clamp(con*.20+wis*.15+ae.critResist+ab.critResist+talentSpecial("critResist"),0,60)*10)/10,
   threat:Math.round(100+con*1.4+str*.4+ae.threat+ab.threat+ca.threat+talentSpecial("threat")),
   stealth:Math.round(clamp(20+dex*1.4+luck*.3+ae.stealth+ab.stealth+ca.stealth+talentSpecial("stealth")+af.stealth,0,150)),
   perception:Math.round(clamp(20+wis*1.5+dex*.4+luck*.2+ae.perception+ab.perception+ca.perception+talentSpecial("perception")+af.perception,0,160)),
   carryCapacity:Math.round(carry*10)/10,
   summonPower:Math.round(10+cha*1.4+wis*.4+intl*.3+(ca.summonPower||0)+af.summonPower),
   lootRate:Math.round(clamp(100+luck*1.5+af.lootRate,100,200)),
   rareEventRate:Math.round(clamp(.5+luck*.15,1,20)*10)/10
 };
 const statusIds=new Set((G.character.statusEffects||[]).map(x=>x?.id||x));
 if(statusIds.has("slow")){
   cs.accuracy=clamp(cs.accuracy-5,5,99);cs.evasion=clamp(cs.evasion-5,0,80);
   cs.initiative=Math.round(cs.initiative*.8);cs.moveSpeed=Math.round(clamp(cs.moveSpeed-15,55,180))
 }
 if(statusIds.has("blind"))cs.accuracy=clamp(cs.accuracy-20,5,99);
 if(statusIds.has("curse"))for(const k of ["attack","magicPower","defense","magicDefense"])cs[k]=Math.max(0,Math.round(cs[k]*.85));
 return cs
}
function calcWeight(){
 let w=0;G.character.inventory.forEach(x=>{const d=item(x.id);if(d)w+=d.weight*(x.qty||1)});
 equippedEntries().forEach(({eq})=>{const d=item(equipId(eq));if(d)w+=d.weight});
 return Math.round(w*10)/10
}
function addItem(id,q=1,extra={}){
 const d=item(id),isEq=d&&["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"].includes(d.type);
 if(isEq){for(let i=0;i<q;i++)G.character.inventory.push({id,qty:1,durability:extra.durability??d.durability,maxDurability:d.durability,acquiredHour:totalHours()});return}
 let x=G.character.inventory.find(v=>v.id===id&&!v.durability);if(!x){x={id,qty:0,acquiredHour:totalHours()};G.character.inventory.push(x)}x.qty+=q;
 updateQuestProgress("item",{item_id:id,qty:q})
}
function removeItem(id,q=1,index=null){if(index!==null){const x=G.character.inventory[index];if(!x||x.id!==id)return false;if((x.qty||1)<=q)G.character.inventory.splice(index,1);else x.qty-=q;return true}let x=G.character.inventory.find(v=>v.id===id&&(v.qty||0)>0);if(!x)return false;if((x.qty||1)<=q)G.character.inventory.splice(G.character.inventory.indexOf(x),1);else x.qty-=q;return true}
function stripHtmlText(v){
 const temp=document.createElement("div");temp.innerHTML=String(v??"");return (temp.textContent||temp.innerText||"").trim()
}
function locationNarrative(){
 const l=loc(G.character.locationId);
 const place=l?.description||l?.desc||l?.flavor||"";
 const facility=G.character.currentFacility?DB.facilities[G.character.currentFacility]?.name:null;
 const context=facility?`目前位於${l.name}的${facility}。`:`目前位於${l.name}。`;
 return place?`${context} ${place}`:context
}
function latestNarrativeEntry(){
 const h=(G?.history||[]).at(-1);
 if(!h)return locationNarrative();
 const text=stripHtmlText(h.text||"");
 return text?`${h.tag?`【${h.tag}】`:""}${text}`:locationNarrative()
}
function renderNarrative(){renderHistoryLog()}

function renderHistoryLog(force=false){
 const el=$("#log");if(!el||!G)return;
 if(!force&&el.dataset.historyVersion===String((G.history||[]).length))return;
 const history=(G.history||[]).slice(-80);
 el.innerHTML=history.map(h=>`<div class="entry ${h.className||""}"><span class="badge">${h.tag||"旅誌"}</span> ${h.html||String(h.text||"")}<div class="entrymeta small">${h.time||""}${h.turn!=null?`｜T${h.turn}`:""}</div></div>`).join("");
 el.dataset.historyVersion=String((G.history||[]).length);
 el.scrollTop=el.scrollHeight;
}
function ensureActionsVisible(){
 const sec=$("#playSection");if(!sec||!G)return;
 // If the action section is partly hidden under the fixed bottom navigation, lift it into view.
 if(typeof sec.getBoundingClientRect!=="function")return;
 const r=sec.getBoundingClientRect(),nav=$("#fixedNav"),navRect=nav&&typeof nav.getBoundingClientRect==="function"?nav.getBoundingClientRect():null;
 const bottomLimit=navRect&&navRect.top>0?navRect.top:window.innerHeight-82;
 if(r.bottom>bottomLimit+2||r.top<0){
   sec.scrollIntoView({block:"nearest",behavior:"smooth"})
 }
}
function log(tag,msg,cl=""){
 const el=$("#log"),plain=stripHtmlText(msg);
 if(G)G.history.push({turn:G.turn,time:timeText(),tag,text:plain,html:String(msg),className:cl||""});
 if(el){
   const d=document.createElement("div");d.className="entry "+cl;
   d.innerHTML=`<span class="badge">${tag}</span> ${msg}<div class="entrymeta small">${timeText()}｜T${G?.turn??0}</div>`;
   el.appendChild(d);el.dataset.historyVersion=String((G?.history||[]).length);el.scrollTop=el.scrollHeight
 }
}
function resourceCard(kind,label,value,max,percent){
 const p=clamp(Number(percent||0),0,100),sev=p>=90?"danger":p>=70?"warning":"";
 return `<div class="resource-card ${kind} ${sev}"><div class="resource-name">${label}</div><div class="resource-value">${value}</div><div class="resource-track"><i style="width:${p}%"></i></div></div>`
}
function renderAll(){
 if(!G)return;syncBodyScrollLock();normalizeAbilityPoints();normalizeRevivalState();syncAllQuestInventoryProgress(true);
 const c=G.character,weight=calcWeight(),cs=combatStats(weight),hpPct=c.maxHp?c.hp/c.maxHp*100:0,spPct=c.maxStamina?c.stamina/c.maxStamina*100:0,mpPct=c.maxMana?c.mana/c.maxMana*100:0;
 setUIText($("#timeTop"),timeText());setUIText($("#turnTop"),G.turn);
 const here=loc(c.locationId);setUIHTML($("#locTop"),`<span class="loc-main">${here.name} <span class="tier">${here.tier}</span>｜安全${locationSafety(here)}/100 ${safetyLabel(here)}</span>`);
 setUIText($("#moneyTop"),"");
 const topStateText=c.alive?`${c.name}｜Lv${c.level}｜XP ${c.level>=99?"MAX":`${c.xp||0}/${xpToNext(c.level)}`}｜職業 ${(c.classMastery||0).toFixed(0)}%`:"角色已死亡",topState=$("#topState");
 setUIText(topState,topStateText);topState.title=topStateText;
 setUIHTML($("#statusSummary"),`<div class="resource-grid">
   ${resourceCard("hp","HP",`${Math.round(c.hp)}/${c.maxHp}`,c.maxHp,hpPct)}
   ${resourceCard("sp","SP",`${Math.round(c.stamina)}/${c.maxStamina}`,c.maxStamina,spPct)}
   ${resourceCard("mp","MP",`${Math.round(c.mana)}/${c.maxMana}`,c.maxMana,mpPct)}
   ${resourceCard("hunger","飢餓",`${Math.round(c.hunger)}%`,100,c.hunger)}
   ${resourceCard("fatigue","疲勞",`${Math.round(c.fatigue)}%`,100,c.fatigue)}
   ${resourceCard("thirst","口渴",`${Math.round(c.thirst)}%`,100,c.thirst)}
 </div>
 ${c.conditions.length?`<div class="condition-strip">${c.conditions.join("｜")}</div>`:""}
 <div class="hud-foot"><span>先攻 ${cs.initiative}｜移速 ${cs.moveSpeed}</span><span>負重 ${weight}/${cs.carryCapacity}kg</span></div>`);
 renderActions();renderHistoryLog();if(G.battle?.active)renderBattle(cs);else{$("#battleBack")?.classList.add("hide");closeBattleSkillPopup();syncBodyScrollLock()}
}

function renderActions(){
 const l=loc(G.character.locationId),box=$("#actionButtons"),rev=normalizeRevivalState(),signature=[l.id,l.kind,G.character.alive,rev?.remaining,!!G.pendingAdventureEvent,!!G.pendingPartyOpportunity,!!G.pendingPetOpportunity].join("|");
 if(box.dataset.actionSignature===signature)return;box.dataset.actionSignature=signature;box.innerHTML="";
 const add=(t,f,cl="")=>box.insertAdjacentHTML("beforeend",`<button type="button" class="${cl}" onclick="${f}">${t}</button>`);
 if(!G.character.alive){if(rev?.remaining>0)add(`復活（剩餘 ${rev.remaining} 次）`,`reviveAtChurch()`,`good`);else box.insertAdjacentHTML("beforeend",`<button type="button" disabled>復活次數已用盡</button>`);return}
 if(G.pendingAdventureEvent)add("處理目前奇遇","openPendingAdventureEvent()","warn");if(G.pendingPartyOpportunity)add("處理隊友奇遇","openPendingPartyOpportunity()","warn");if(G.pendingPetOpportunity)add("處理寵物機緣","resolvePetOpportunity(false)","warn");
 if(l.kind==="town"){
   add("探索所在地","actExplore()","good");add("城鎮設施","open…95880 tokens truncated…a.push(`<button onclick="openRealmRegionMap('${ctx.realm.id}')">${politicalEntity(ctx.realm.political_entity_id)?.name||"政體"}</button>`);
 if(ctx?.province)a.push(`<button onclick="openProvinceRegionMap('${ctx.province.id}')">${ctx.province.name}</button>`);
 return `<div class="actions mapCrumbs">${a.join("")}</div>`
}
function openWorldMapHierarchy(){
 const rows=(DB.realm_region_maps||[]).map(r=>{
   const p=politicalEntity(r.political_entity_id),primaryIds=r.province_region_ids||[],backgroundIds=r.background_province_region_ids||[],subs=[...new Set([...primaryIds,...backgroundIds])].length;
   return `<div class="itemrow"><span><b>${p?.name||r.name}</b> <span class="tier">${r.world_tier||p?.world_tier||"—"}</span><br><span class="small">${p?.government_type||""}｜首府：${p?.capital||"未固定"}｜行省級區域 ${subs}${backgroundIds.length?`（含背景推演 ${backgroundIds.length}）`:""}${(r.vassal_polity_ids||[]).length?`｜封臣 ${r.vassal_polity_ids.length}`:""}</span></span><button onclick="openRealmRegionMap('${r.id}')">查看</button></div>`
 }).join("");
 const powerRows=(DB.world_map?.regional_power_region_ids||[]).map(rid=>{const r=worldRegion(rid),ps=regionalPowersForRegion(rid);return `<div class="itemrow"><span><b>${r?.name||rid}</b> <span class="tier">${r?.recommended_tier||"—"}</span><br><span class="small">非主權大區｜主要勢力：${ps.map(x=>x.name).join("、")||"無"}</span></span><button onclick="openLoreScope('region','${rid}','${r?.name||"地區"}・地方誌')">查看</button></div>`}).join("");
 showModal("世界地圖",`<div class="actions"><button type="button" onclick="openWorldMapAtlas('surface')">世界圖面顯示</button></div><div class="card small">主要查看層級：世界地圖 ＞ 王國／政體區域 ＞ 行省級區域。行省內再分城鎮、野外、地下城三類；區域勢力不會被誤列為王國／政體地圖。</div>${rows}${powerRows?`<h3>非主權區域</h3>${powerRows}`:""}`)
}
function openRealmRegionMap(id){
 const r=realmRegionMap(id);if(!r)return;const p=politicalEntity(r.political_entity_id);
 const provinceIds=[...(r.province_region_ids||[]),...(r.background_province_region_ids||[])].filter((x,i,a)=>a.indexOf(x)===i);
 const provinces=provinceIds.map(provinceRegion).filter(Boolean);
 const rows=provinces.map(x=>`<div class="itemrow"><span><b>${x.name}</b> <span class="tier">${x.world_tier}</span><br><span class="small">${x.administrative_type}｜${x.map_status==="playable_current"?"CURRENT可玩":"背景資料"}｜首府：${loc(x.capital_location_id)?.name||p?.capital||"—"}</span></span><button onclick="openProvinceRegionMap('${x.id}')">查看</button></div>`).join("")||`<div class="card small">此政治體目前只建立王國／政體區域層級，尚未展開行省級可玩地圖；既有政治與世界誌資料仍有效。</div>`;
 showModal(`${p?.name||r.name}・${String(p?.government_type||"").includes("王國")?"王國區域地圖":"政體區域地圖"}`,`${mapBreadcrumb({realm:r})}<div class="actions regionmap-head-actions"><button type="button" class="primary" onclick="openRegionMapGraphic('realm','${r.id}')">圖面顯示</button></div><div class="card"><b>${p?.name||r.name}</b> <span class="tier">${r.world_tier||p?.world_tier||"—"}</span><br><span class="small">${p?.government_type||""}｜首府：${p?.capital||"未固定"}｜${p?.identity||""}</span><div class="actions">${p?`<button onclick="openPolity('${p.id}')">政治體</button>`:""}</div></div>${rows}`)
}

function worldTierRank(t){return ({F:0,E:1,D:2,C:3,B:4,A:5,S:6})[t]??-1}
function provinceCategoryLocations(p,kind,reachableOnly=true){
 if(!p)return [];
 let ids=[];
 if(kind==="town")ids=p.all_settlement_ids||[p.capital_location_id,...(p.peer_city_ids||[]),...(p.subordinate_settlement_ids||[])].filter(Boolean);
 else if(kind==="wild")ids=p.wild_location_ids||[];
 else ids=p.dungeon_location_ids||[];
 let rows=[...new Set(ids)].map(loc).filter(Boolean);
 if(reachableOnly)rows=rows.filter(l=>l.id===G.character.locationId||canDirectTravelTo(l.id));
 rows.sort((a,b)=>worldTierRank((b.kind==="town"?b.settlement_world_tier:b.tier)||"F")-worldTierRank((a.kind==="town"?a.settlement_world_tier:a.tier)||"F")||a.name.localeCompare(b.name,"zh-Hant"));
 return rows
}
function provinceCategoryLabel(kind){return kind==="town"?"城鎮":kind==="wild"?"野外":"地下城"}
function openProvinceCategoryMap(pid,kind){
 const p=provinceRegion(pid);if(!p)return;const realm=realmRegionMap(p.parent_realm_map_id),rows=provinceCategoryLocations(p,kind,true);
 const body=rows.map(l=>{
   const tier=l.kind==="town"?(l.settlement_world_tier||l.tier):l.tier,here=l.id===G.character.locationId,hours=here?0:directTravelHours(l.id);
   return `<div class="itemrow"><span><b>${l.name}</b> <span class="tier">${tier}</span><br><span class="small">${l.size||provinceCategoryLabel(kind)}｜安全度 ${locationSafety(l)}/100（${safetyLabel(l)}）</span></span>${here?`<span class="tier">目前</span>`:hours!==null?`<button onclick="travel('${l.id}',${hours})">前往 ${hours}小時</button>`:""}</div>`
 }).join("");
 showModal(`${p.name}・${provinceCategoryLabel(kind)}`,`${mapBreadcrumb({realm,province:p})}<div class="actions regionmap-head-actions"><button type="button" onclick="openRegionMapGraphic('province','${p.id}')">行省圖面顯示</button></div><div class="card small">只顯示目前位置與可直接前往的${provinceCategoryLabel(kind)}；不可前往區域已隱藏。依世界層級由高至低排列。</div>${body||"<div class='card small'>目前沒有可直接前往的區域。</div>"}`)
}
function openProvinceRegionMap(id){
 const p=provinceRegion(id);if(!p)return;const realm=realmRegionMap(p.parent_realm_map_id),ctx={realm,province:p},eco=p.economy_profile||null;
 const planned=p.map_status!=="playable_current"?p.planned_content||null:null;
 const plannedCard=planned?`<div class="card"><b>背景地理推演</b><br><span class="small">地形：${esc(planned.geography_profile?.terrain||"未設定")}｜氣候：${esc(planned.geography_profile?.climate||"未設定")}｜水系：${esc(planned.geography_profile?.water||"未設定")}<br>交通：${esc(planned.geography_profile?.transport||"未設定")}<br>治理：${esc(planned.governance||"未設定")}<br>預計城鎮：${(planned.towns||[]).map(esc).join("、")||"未規劃"}<br>預計野外：${(planned.wilds||[]).map(esc).join("、")||"未規劃"}<br>預計地下城：${(planned.dungeons||[]).map(esc).join("、")||"未規劃"}<br>預計NPC：${(planned.npcs||[]).map(esc).join("、")||"未規劃"}</span></div>`:"";
 const kinds=["town","wild","dungeon"];
 const cards=kinds.map(kind=>{
   const all=provinceCategoryLocations(p,kind,false),reachable=provinceCategoryLocations(p,kind,true);
   return `<div class="itemrow"><span><b>${provinceCategoryLabel(kind)}</b><br><span class="small">已建置 ${all.length}｜目前可前往 ${reachable.filter(x=>x.id!==G.character.locationId).length}${reachable.some(x=>x.id===G.character.locationId)?"｜含目前位置":""}</span></span><button onclick="openProvinceCategoryMap('${p.id}','${kind}')">查看</button></div>`
 }).join("");
 showModal(`${p.name}・行省級區域`,`${mapBreadcrumb(ctx)}<div class="actions regionmap-head-actions"><button type="button" class="primary" onclick="openRegionMapGraphic('province','${p.id}')">圖面顯示</button><button type="button" onclick="openRegionMapGraphic('local','${G.character.locationId}')">目前所在地圖面</button></div><div class="card"><b>${p.display_name||p.name}</b> <span class="tier">${p.world_tier}</span><br><span class="small">${p.administrative_type}<br>${p.identity||""}${eco?`<br>經濟繁榮度 ${eco.prosperity_score}/100（${eco.prosperity_label}）｜產業：${(eco.drivers||[]).join("、")}｜限制：${(eco.constraints||[]).join("、")}`:""}</span>${(p.lore_record_ids||[]).length?`<div class="actions"><button onclick="openLoreScope('province_region','${p.id}','${p.name}・地方史')">地方史</button></div>`:""}</div>${plannedCard}<div class="card small">省級地圖簡化為「城鎮／野外／地下城」三類。移動清單只顯示可以前往的區域；不可前往區域不顯示。</div>${cards}`)
}
function openProvinceTerrainMap(pid,kind){return openProvinceCategoryMap(pid,kind)}
function openSettlementRegionMap(id){
 const sm=settlementRegionMap(id);if(!sm)return;const p=provinceRegion(sm.parent_province_region_id);
 if(p)return openProvinceRegionMap(p.id);
 return openWorldMapHierarchy()
}
function openMapLocationDetail(id){
 const l=loc(id);if(!l)return;const ctx=mapHierarchyForLocation(id),ix=locationIntegration(l.id),pc=politicalContextForLocation(l.id),eco=l.local_economy||ctx.province?.economy_profile||null;
 const links=(l.links||[]).map(x=>{const d=loc(x.to);return `<div class="itemrow"><span>${d?.name||x.to} <span class="tier">${d?.kind==="town"?(d?.settlement_world_tier||d?.tier):d?.tier||"—"}</span><br><span class="small">${x.hours}小時</span></span>${l.id===G.character.locationId?`<button onclick="travel('${x.to}',${x.hours})">前往</button>`:""}</div>`}).join("");
 showModal(l.name,`${mapBreadcrumb(ctx)}<div class="actions regionmap-head-actions"><button type="button" class="primary" onclick="openRegionMapGraphic('local','${l.id}')">圖面顯示</button>${ctx.province?`<button type="button" onclick="openRegionMapGraphic('province','${ctx.province.id}')">行省圖面</button>`:""}</div><div class="card"><b>${l.name}</b> <span class="tier">${l.kind==="town"?(l.settlement_world_tier||l.tier):l.tier}</span>｜${l.size||mapKindLabel(l.kind)}<br><span class="small">${mapKindLabel(l.kind)}｜安全度 ${locationSafety(l)}/100（${safetyLabel(l)}）${l.kind==="town"?`<br>城市世界層級：${l.settlement_world_tier||l.tier}｜${settlementTierProfile(l)?.label||""}`:""}<br>政治：${pc.polity?.name||"未確認"}｜行省級：${ctx.province?.name||"未建立"}｜城鎮區域：${ctx.settlement?.name||"未建立"}${eco?`<br>經濟繁榮度：${eco.prosperity_score}/100（${eco.prosperity_label}）｜${eco.infrastructure||""}`:""}<br>整合資料：素材${ix.gather_item_ids.length+ix.fish_item_ids.length}｜組織${ix.organization_ids.length}｜神系${ix.pantheon_ids.length}</span><div class="actions"><button onclick="openLocationLore('${l.id}')">地方誌</button>${ctx.settlement?`<button onclick="openSettlementRegionMap('${ctx.settlement.id}')">城鎮區域</button>`:""}</div></div><div class="card"><b>道路連結</b></div>${links||"<div class='small'>沒有已建檔道路。</div>"}`)
}
function openMap(){
 const current=G?.character?.locationId;
 if(current&&typeof openRegionMapGraphic==="function"&&openRegionMapGraphic("local",current))return;
 const ctx=mapHierarchyForLocation();
 if(ctx.province)return openProvinceRegionMap(ctx.province.id);
 if(ctx.realm)return openRealmRegionMap(ctx.realm.id);
 return openWorldMapHierarchy()
}
function travel(id,h,mapRoute){
 const from=loc(G.character.locationId),to=loc(id);
 if(!from||!to)return;
 let route=[from.id,id],travelHours=h;
 if(mapRoute?.mapRoute===true){
  route=Array.isArray(mapRoute.path)?mapRoute.path:[];
  if(to.kind!=="town"||route.length<2||route[0]!==from.id||route.at(-1)!==id)return;
  for(let i=0;i<route.length-1;i++)if(!loc(route[i])?.links?.some(edge=>edge.to===route[i+1]))return;
  travelHours=route.slice(0,-1).reduce((sum,at,i)=>sum+Number(loc(at).links.find(edge=>edge.to===route[i+1])?.hours||0),0);
 }else if(!from.links.some(x=>x.to===id))return;
 closeModal();if(!beginTurn("旅行"))return;
 const routeRisk=route.some(locationId=>["wild","dungeon"].includes(loc(locationId)?.kind));
 G.character.locationId=id;G.character.currentFacility=null;discoverScopeLore("location",id,"旅行");if(to.world_region_id)discoverScopeLore("region",to.world_region_id,"旅行");if(to.political_entity_id)discoverScopeLore("polity",to.political_entity_id,"旅行");
 log("旅行",`抵達${to.name}［${to.tier}］；安全度${locationSafety(to)}/100（${safetyLabel(to)}）。`,"ok");
 let battled=false;
 if(routeRisk)battled=maybeEncounter("旅行");
 let evented=false;if(!battled&&["wild","dungeon"].includes(to.kind))evented=maybeAdventureEvent("旅行");
 let socialed=false;if(!battled&&!evented&&["wild","dungeon"].includes(to.kind))socialed=maybePartySocialEvent("旅行");
 if(!battled&&!evented&&!socialed&&["wild","dungeon"].includes(to.kind))maybeOrganizationEncounter("旅行");
 endTurn(travelHours)
}
function showAdventure(){setNavActive("adventure");closeModal();if(!G?.battle?.active){$("#battleBack")?.classList.add("hide");document.body.classList.remove("battle-open");closeBattleSkillPopup()}syncBodyScrollLock();window.scrollTo({top:0,behavior:"smooth"});renderHistoryLog();setTimeout(()=>{ensureActionsVisible();syncBodyScrollLock()},0)}


function currentSaveEntry(){
 return G?.meta?.saveIndex?.at(-1)||null
}
function saveInfoHtml(){
 const s=currentSaveEntry();
 if(!G)return `<div class="card"><b>目前存檔</b><br><span class="small">尚未開始遊戲。</span></div>`;
 const quota=saveStorageInfo.quota?`${Math.round(saveStorageInfo.quota/1048576)} MB`:"瀏覽器動態配額";return `<div class="card"><b>目前存檔</b><br>${s?`${s.id}<br><span class="small">${s.time||timeText()}｜T${s.turn??G.turn}｜${s.type||"AUTO"}${s.reason?`｜${s.reason}`:""}</span>`:`<span class="small">尚無存檔紀錄</span>`}<br><span class="small">存檔筆數：${G.meta.saveIndex.length}/180｜大容量存檔：IndexedDB｜10×設計目標：${Math.round(SAVE_STORAGE_TARGET_BYTES/1048576)} MB｜目前配額：${quota}</span></div>`
}
function openSettings(){showModal("設定",`${saveInfoHtml()}<h3>世界與權柄</h3><div class="actions"><button onclick="openWorldLore()">世界誌 ${knownLore().length}/${DB.lore_system.record_count}</button><button onclick="openPoliticalAuthorityCatalog()">權柄20原型</button></div><hr><div class="actions"><button onclick="manualSave()">手動存檔</button><button onclick="checkForGameUpdate(true)">連線 GitHub 檢查更新</button><button onclick="exportSave()">匯出存檔</button><button class="bad" onclick="resetGame()">重開新檔</button></div><hr><h3>世界資料庫</h3><div class="rulebox">版本：${DB.meta.current_version}<br>職業：${DB.combat_classes.length}<br>戰士／騎士系：${DB.profession_tree.categories["戰士／騎士系"].length}<br>遊俠／盜賊／吟遊系：${DB.profession_tree.categories["遊俠／盜賊／吟遊系"].length}<br>法師／術士系：${DB.profession_tree.categories["法師／術士系"].length}<br>神職／自然系：${DB.profession_tree.categories["神職／自然系"].length}<br>混合／上位／傳說系：${DB.profession_tree.categories["混合／上位／傳說系"].length}<br>技能定義：${Object.values(DB.skill_pools).reduce((s,a)=>s+a.length,0)}<br>技能進階家族：${DB.skill_families.length}<br>裝備：${DB.items.filter(x=>["主武器","盔甲","頭盔","手套","鞋子","披風","飾品"].includes(x.type)).length}<br>武器核心：${DB.equipment_system.catalog_counts["武器"]}<br>防具核心：${DB.equipment_system.catalog_counts["防具"]}<br>飾品核心：${DB.equipment_system.catalog_counts["飾品"]}<br>藥劑／戰鬥消耗品核心：${DB.items.filter(x=>x.type==="藥劑").length}<br>技能紀錄：${DB.skill_design_system.skill_records}<br>技能家族：${DB.skill_design_system.family_count}<br>戰鬥職業：${DB.class_design_system.count}<br>裝備核心：${DB.item_material_design_system.equipment_core_count}<br>藥劑：${DB.item_material_design_system.potion_count}<br>退出新生成的舊怪物素材：${DB.item_material_design_system.legacy_monster_materials_retired_from_generation}<br>公會跨職規則：${DB.guild_training.cross_track_rule}<br>同時委託上限：${DB.quest_system.max_active}<br>生成器：${DB.generators.length}（共同邏輯管線）<br>管理AI：${DB.management_ai.length}（輸入／驗證／回退規則）<br>網站模式：${location.protocol==="https:"?"公開HTTPS":"本機／預覽"}｜網域：${location.host||"local"}<br>戰鬥數值核心：${DB.combat_stat_system.count}項<br>CON/SP分離：啟用｜先攻/破甲/韌性/狀態命中：啟用<br>角色成長：Lv1–${DB.progression_system.max_level}｜職業熟練／轉職啟用<br>製作閉環：${DB.items.filter(x=>x.craft_recipe).length}筆配方資料｜鍛造／裁縫／藥劑／附魔介面啟用<br>武器組：8頂層欄＋內部副手（單手武器／盾牌）｜狀態系統：${Object.keys(DB.status_system.definitions).length}種<br>天賦核心：${DB.talent_system.core_count}<br>角色天賦上限：${DB.talent_system.character_limit}<br>體質／生存：${DB.talent_system.category_counts["體質與生存"]}<br>戰鬥專精：${DB.talent_system.category_counts["戰鬥專精"]}<br>魔法／血脈：${DB.talent_system.category_counts["魔法與血脈"]}<br>技巧／生活／命運：${DB.talent_system.category_counts["技巧生活與命運"]}<br>核心種族：${DB.race_system.core_count}<br>常見種族：${DB.race_system.groups["常見種族"].length}<br>精靈分支：${DB.race_system.groups["精靈族"].length}<br>混血種族：${DB.race_system.groups["混血種族"].length}<br>特殊種族：${DB.race_system.groups["特殊種族"].length}<br>角色出身核心：${DB.origin_system.core_count}<br>平民與鄉野：${DB.origin_system.category_counts["平民與鄉野"]}<br>貴族與騎士：${DB.origin_system.category_counts["貴族與騎士"]}<br>軍事與傭兵：${DB.origin_system.category_counts["軍事與傭兵"]}<br>信仰與魔法：${DB.origin_system.category_counts["信仰與魔法"]}<br>詛咒與命運：${DB.origin_system.category_counts["詛咒與命運"]}<br>怪物圖鑑核心：${DB.monster_catalog.core_count}<br>野獸動物：${DB.monster_catalog.category_counts["野獸動物系"]}<br>哥布林／獸人／巨人：${DB.monster_catalog.category_counts["哥布林獸人巨人系"]}<br>龍／亞龍／爬蟲：${DB.monster_catalog.category_counts["龍與亞龍爬蟲系"]}<br>不死：${DB.monster_catalog.category_counts["不死系"]}<br>惡魔／深淵：${DB.monster_catalog.category_counts["惡魔與深淵地獄系"]}<br>元素／植物／魔法生物：${DB.monster_catalog.category_counts["元素植物魔法生物系"]}<br>蟲／水生／軟泥：${DB.monster_catalog.category_counts["蟲水生軟泥系"]}<br>怪物掉落核心：${DB.monster_drop_system.core_count}<br>軟泥／魔像：${DB.monster_drop_system.category_counts["軟泥與魔像系"]}<br>哥布林／獸人／巨人：${DB.monster_drop_system.category_counts["哥布林獸人巨人系"]}<br>野獸：${DB.monster_drop_system.category_counts["野獸系"]}<br>龍與爬蟲：${DB.monster_drop_system.category_counts["龍與爬蟲系"]}<br>不死：${DB.monster_drop_system.category_counts["不死系"]}<br>惡魔／深淵：${DB.monster_drop_system.category_counts["惡魔與深淵系"]}<br>元素／植物／魔法生物：${DB.monster_drop_system.category_counts["元素植物魔法生物系"]}<br>蟲與水生：${DB.monster_drop_system.category_counts["蟲與水生系"]}<br>素材／通用道具核心：${DB.material_system.core_count}<br>草藥植物：${DB.material_system.category_counts["草藥與植物素材"]}<br>礦石金屬：${DB.material_system.category_counts["礦石與金屬素材"]}<br>怪物素材：${DB.material_system.category_counts["怪物素材"]}<br>食材食物：${DB.material_system.category_counts["食材與食物"]}<br>木材布料皮革：${DB.material_system.category_counts["木材布料皮革"]}<br>寶石結晶：${DB.material_system.category_counts["寶石與魔法結晶"]}<br>卷軸符文書籍：${DB.material_system.category_counts["卷軸符文書籍"]}<br>鑰匙工具寶藏：${DB.material_system.category_counts["鑰匙工具寶藏任務"]}<br>生命回復：${DB.consumable_system.category_counts["生命回復"]}<br>魔力與精力：${DB.consumable_system.category_counts["魔力與精力"]}<br>屬性強化：${DB.consumable_system.category_counts["屬性強化"]}<br>抗性防禦：${DB.consumable_system.category_counts["抗性防禦"]}<br>解除淨化：${DB.consumable_system.category_counts["解除淨化"]}<br>攻擊投擲／塗油：${DB.consumable_system.category_counts["攻擊投擲／塗油"]}<br>特殊煎藥／傳奇：${DB.consumable_system.category_counts["特殊煎藥／傳奇"]}<br>料理：${DB.items.filter(x=>x.type==="料理").length}<br>料理配方：${DB.recipes.length}<br>敵人：${DB.monsters.length}<br>敵方專用素材：${DB.items.filter(x=>x.type==="魔物素材").length}<br>野外地圖：${DB.locations.filter(x=>x.kind==="wild").length}<br>地下城：${DB.locations.filter(x=>x.kind==="dungeon").length}<br>城鎮：${DB.locations.filter(x=>x.kind==="town").length}<br>副職業：${DB.subjobs.length}</div><h3>核心規則</h3><div class="rulebox">設施對話與情報遵守知識來源限制。<br>副職業只能在指定設施且符合能力前置與學費後學習。<br>裝備耐久影響戰鬥加成，鐵匠鋪可修復。<br>戰鬥數值集中於角色卡；包含攻擊、魔法威力、防禦、魔防、命中、閃避、爆擊、爆傷、攻速、施法速度、格擋與狀態抗性。<br>遭遇戰鬥改為彈出式回合制介面，可選一般攻擊、技能、防禦、使用道具與逃跑。<br>B級以上內容仍受前置資格與封印規則限制。<br>掉落規則：只有人型敵人可能掉落金錢與裝備；非人型敵人只能掉落素材。<br>戰鬥職業池為100種。<br>核心裝備200件、藥劑200種、通用素材200種；本版新增200種怪物掉落核心，並建立200裝備升級連結與200藥劑鍊金連結。<br>技能命名採傳統RPG結構：動詞＋名詞／元素＋效果；東方系採原創自然意象＋動作。<br>命名AI：以用途可讀性、區域詞根、怪物家族與世界層級生成名稱，並避開專有作品名稱與過度現實訓練術語。</div>`)}
async function manualSave(){const id=`MANUAL-${G.meta.characterId.slice(-6)}-T${String(G.turn).padStart(5,"0")}`;G.meta.saveIndex.push({id,turn:G.turn,time:timeText(),type:"MANUAL"});persist();await flushPersistWrites();await requestExpandedSaveStorage();renderAll();log("存檔",`已建立${id}`,"save")}
function exportSave(){const b=new Blob([JSON.stringify(G,null,2)],{type:"application/json;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`${G.character.name}_${G.meta.characterId}_save.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),400)}
async function resetGame(){if(confirm("確定清除本機存檔？")){try{pendingPersistSerialized=null;await saveDbClear()}catch(e){}try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key==="chronicle_save"||key==="chronicle_update_backups"||key?.startsWith("chronicle_save_backup_"))localStorage.removeItem(key)}}catch(e){}location.reload()}}
function runGeneratorAudit(){
 const issues=[];
 issues.push(...databaseGrowthAudit());
  if(typeof globalThis.runAlchemyHealingRecipeAudit==="function"){
    const a=globalThis.runAlchemyHealingRecipeAudit();
    if(!a?.pass)issues.push(...(a?.issues||[]).map(x=>`生命藥劑配方:${x}`))
  }else issues.push("生命藥劑配方完整性runtime缺失");
 for(const l of DB.locations){
   if(typeof l.safety_score!=="number"||l.safety_score<0||l.safety_score>100)issues.push(`地圖安全度異常:${l.name}`);
   if(!l.safety_label)issues.push(`地圖安全標籤缺失:${l.name}`);
   if(!["wild","dungeon"].includes(l.kind))continue;
   for(const id of (l.gather||[])){const d=item(id);if(!d?.wild_gather_eligible)issues.push(`${l.name}採集池含非法來源:${d?.name||id}`);if(d&&tierOrder(d.tier)>tierOrder(l.tier))issues.push(`${l.name}採集超階:${d.name}`)}
   if(l.ecology_zone==="town_outskirts"){const bad=encounterCandidates(l).filter(m=>["元素植物魔法生物系","龍與亞龍爬蟲系","不死系","惡魔與深淵地獄系"].includes(m.category));if(bad.length)issues.push(`${l.name}近郊生態違規:${bad[0].name}`)}
 }
 for(const d of (DB.domestic_creatures||[]))if(d.encounter_enabled!==false)issues.push(`馴養生物誤入遭遇:${d.name}`);
 for(const q of DB.quest_templates)if(!questViableLocations(q).length)issues.push(`委託無目標來源:${q.name}`);
 for(const g of (DB.generators||[]))if(!g.inputs?.length||!g.constraints?.length||!g.fallback)issues.push(`生成器邏輯不完整:${g.name}`);
 for(const ai of (DB.management_ai||[]))if(!ai.inputs?.length||!ai.validations?.length||!ai.fallback)issues.push(`管理AI邏輯不完整:${ai.name}`);
 for(const c of DB.combat_classes)for(const p of (c.progression_from||[]))if(!cls(p))issues.push(`職業進階引用缺失:${c.name}->${p}`);
 for(const d of DB.items.filter(x=>x.craft_recipe))for(const x of craftRecipeMaterials(d))if(!item(x.id))issues.push(`配方引用缺失:${d.name}->${x.id}`);
 for(const s of Object.values(DB.skill_pools).flat())if(s.status&&!DB.status_system.definitions[s.status])issues.push(`技能狀態缺失:${s.name}->${s.status}`);
  if(DB.skill_learning_prereq_compare_system?.version!=="SKILL-LEARNING-PREREQ-COMPARE-1.0")issues.push("技能學習前置對比系統缺失");
  if(typeof skillLearningPrereqState!=="function"||typeof skillPrereqCompareLine!=="function")issues.push("技能學習前置對比runtime缺失");
 for(const d of DB.items||[])for(const id of (d.use?.conditions||[]))if(!DB.status_system.definitions[id])issues.push(`物品狀態引用缺失:${d.name}->${id}`);
 if(DB.status_system?.version!=="STATUS-1.11")issues.push("STATUS-1.11缺失");
 if(DB.quality_audit_system?.version!=="QUALITY-AUDIT-1.0")issues.push("QUALITY-AUDIT-1.0缺失");
 for(const e of (DB.adventure_event_templates||[])){
   if(!["F","E","D","C","B","A","S"].includes(e.tier))issues.push(`奇遇模板層級無效:${e.name}`);
   if(!e.kinds?.length||!e.stat||!Number.isFinite(e.dc))issues.push(`奇遇模板條件不完整:${e.name}`);
   if(Array.isArray(e.time_windows)&&e.time_windows.some(x=>!Array.isArray(x)||x.length!==2||x.some(v=>!Number.isFinite(Number(v))||Number(v)<0||Number(v)>24)))issues.push(`奇遇時段條件無效:${e.name}`);
   if(Array.isArray(e.required_intel_tags)&&e.required_intel_tags.some(tag=>!(e.intel_tags||[]).includes(tag)))issues.push(`奇遇情報門檻未列入情報標籤:${e.name}`);
   const r=e.reward||{},eventLoc=(e.location_ids||[]).map(loc).find(Boolean);
   for(const id of (r.item_pool||[])){
     const d=item(id);if(!d)issues.push(`奇遇獎勵引用缺失:${e.name}->${id}`);
     else if(["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"].includes(d.type)||["武器","防具","飾品"].includes(d.catalog_group)||tierOrder(d.tier)>tierOrder(e.tier))issues.push(`奇遇獎勵超規:${e.name}->${d.name}`)
   }
   const tierCaps={F:12,E:24,D:60,C:120,B:240,A:480,S:900};
   if(r.money&&r.money[1]>(tierCaps[e.tier]||12))issues.push(`奇遇金錢上限過高:${e.name}`);
   if(eventLoc&&tierOrder(e.tier)>tierOrder(eventLoc.tier))issues.push(`奇遇層級高於地圖:${e.name}->${eventLoc.name}`)
 }
 for(const sp of (DB.companion_species||[])){
   if(!["pet","summon","contract"].includes(sp.companion_kind))issues.push(`夥伴類型錯誤:${sp.name}`);
   if(!DB.companion_system.ai_profiles[sp.ai_profile])issues.push(`夥伴AI缺失:${sp.name}`);
   if(!sp.base_stats||!Number.isFinite(sp.base_stats.hp))issues.push(`夥伴戰鬥資料缺失:${sp.name}`);
 }
 if((DB.companion_species||[]).length<200)issues.push(`夥伴物種核心數量不足:${(DB.companion_species||[]).length}`);
 if(G?.character?.companions?.length>DB.companion_system.roster_limit)issues.push(`角色夥伴超過上限`);
 if(G?.character?.activeCompanionId&&!G.character.companions.some(x=>x.uid===G.character.activeCompanionId))issues.push(`出戰夥伴引用無效`);
 for(const t of (DB.party_member_templates||[])){
   if(!DB.adventure_party_system.ai_profiles[t.role])issues.push(`隊友AI角色缺失:${t.name}`);
   if(!t.base_stats||!Number.isFinite(t.base_stats.hp))issues.push(`隊友戰鬥資料缺失:${t.name}`);
   if(tierOrder(t.tier)>tierOrder("C"))issues.push(`普通招募隊友超過C級:${t.name}`);
 }
 if((DB.party_member_templates||[]).length<200)issues.push(`隊友模板核心數量不足:${(DB.party_member_templates||[]).length}`);
 if(G?.character?.adventureParty){
   const p=G.character.adventureParty;
   if((p.members||[]).length<1||(p.members||[]).length>4)issues.push(`冒險團人數異常:${1+(p.members||[]).length}`);
   if(p.leader!=="player"&&!p.members.some(x=>x.uid===p.leader))issues.push(`冒險團領隊引用無效`);
   for(const m of p.members)if(!partyTemplate(m.templateId))issues.push(`冒險團隊友引用缺失:${m.templateId}`)
 }
 if((DB.dialogue_database?.records||[]).length<200)issues.push(`對話資料量不足:${(DB.dialogue_database?.records||[]).length}`);
 if((DB.intel_database?.records||[]).length<200)issues.push(`情報資料量不足:${(DB.intel_database?.records||[]).length}`);
 for(const d of (DB.dialogue_database?.records||[])){
   if(!DB.facilities[d.facility])issues.push(`對話設施引用缺失:${d.id}`);
   if(tierOrder(d.tier_ceiling||"F")>tierOrder("C"))issues.push(`普通對話越權:${d.id}`)
 }
 for(const x of (DB.intel_database?.records||[])){
   if(!DB.facilities[x.facility])issues.push(`情報設施引用缺失:${x.id}`);
   if(!Number.isFinite(x.reliability)||x.reliability<0||x.reliability>100)issues.push(`情報可信度異常:${x.id}`);
   if(tierOrder(x.tier_ceiling||"F")>tierOrder("C"))issues.push(`普通情報越權:${x.id}`)
 }
 const mealSys=DB.meal_service_system;
 for(const fid of ["tavern","inn"])for(const p of ["breakfast","lunch","dinner"]){
   const arr=mealSys?.venues?.[fid]?.[p]||[];if(arr.length<3)issues.push(`餐點資料不足:${fid}/${p}`);
   if(arr.some(x=>!Number.isFinite(x.price)||x.price<=0))issues.push(`餐點價格異常:${fid}/${p}`)
 }
 if((DB.pantheons||[]).length<9)issues.push(`神系核心數量不足:${(DB.pantheons||[]).length}`);
 if((DB.faith_entities||[]).length<100)issues.push(`信仰實體核心數量不足:${(DB.faith_entities||[]).length}`);
 const faithIds=new Set((DB.faith_entities||[]).map(x=>x.id)),pantheonIds=new Set((DB.pantheons||[]).map(x=>x.id));
 for(const e of (DB.faith_entities||[])){
   if(!pantheonIds.has(e.pantheon_id))issues.push(`信仰神系引用缺失:${e.name}`);
   if(e.parent_id&&!faithIds.has(e.parent_id))issues.push(`信仰上級引用缺失:${e.name}`);
 }
 for(const r of (DB.faith_relations||[]))if(!pantheonIds.has(r.a)||!pantheonIds.has(r.b))issues.push(`神系關係引用缺失:${r.a}/${r.b}`);
 for(const [lid,p] of Object.entries(DB.local_faith_profiles||{})){
   if(!loc(lid))continue;
   for(const pid of (p.recognized||[]))if(!pantheonIds.has(pid))issues.push(`地方信仰引用缺失:${lid}/${pid}`)
 }
 if(G?.character?.faith){
   const f=G.character.faith;
   if(f.patronDeityId&&!deity(f.patronDeityId))issues.push(`角色主神引用無效`);
   if(f.oathId&&!(DB.faith_oaths||[]).some(x=>x.id===f.oathId))issues.push(`角色誓言引用無效`)
 }
 const orgRows=DB.world_organizations||[],intentionalOrgReduction=Math.max(0,Number(DB.affiliation_identity_depth_system?.adventure_consolidation?.reduction||0));
 const orgFloor=Math.max(80,100-intentionalOrgReduction);
 if(orgRows.length<orgFloor)issues.push(`世界組織核心數量不足:${orgRows.length}/${orgFloor}`);
 const orgIds=new Set(orgRows.map(x=>x.id));
 const alignCount=orgRows.reduce((m,x)=>(m[x.alignment]=(m[x.alignment]||0)+1,m),{}),orgTotal=Math.max(1,orgRows.length);
 const alignRatio={light:(alignCount.light||0)/orgTotal,neutral:(alignCount.neutral||0)/orgTotal,dark:(alignCount.dark||0)/orgTotal};
 if((alignCount.light||0)<5||(alignCount.dark||0)<10||(alignCount.neutral||0)<30||(alignCount.undefined||0)>0)issues.push(`世界組織核心陣營分布不足:${JSON.stringify({count:alignCount,ratio:Object.fromEntries(Object.entries(alignRatio).map(([k,v])=>[k,Math.round(v*1000)/1000]))})}`);
 for(const o of (DB.world_organizations||[])){
   if(!DB.facilities[o.primary_facility])issues.push(`組織設施引用缺失:${o.name}`);
   if(!o.joinable||!o.mission_issuer||!o.can_be_enemy)issues.push(`組織功能不完整:${o.name}`)
 }
 for(const r of (DB.organization_relations||[])){
   if(!orgIds.has(r.a)||!orgIds.has(r.b))issues.push(`組織關係引用缺失:${r.a}/${r.b}`);
   if(r.score<-100||r.score>100)issues.push(`組織關係值越界:${r.a}/${r.b}`)
 }
 if(G?.character?.organizations){
   for(const id of G.character.organizations.memberships||[])if(!orgIds.has(id))issues.push(`角色組織會籍引用無效:${id}`)
 }
 for(const [k,v] of Object.entries(G?.worldState?.orgRelations||{}))if(v.score<-100||v.score>100)issues.push(`動態組織關係越界:${k}`);
 if(!DB.integration_registry||DB.integration_registry.version!=="INTEGRATION-3.0")issues.push("INTEGRATION-3.0整合索引缺失");
 const ix=DB.content_link_index||{};
 if(Object.keys(ix.item_sources||{}).length!==DB.items.length)issues.push(`物品來源索引數量異常`);
 for(const [iid,s] of Object.entries(ix.item_sources||{})){
   if(!item(iid))issues.push(`物品來源索引指向無效物品:${iid}`);
   for(const lid of (s.gather_locations||[]))if(!loc(lid))issues.push(`物品來源地圖引用缺失:${iid}->${lid}`);
   for(const mid of (s.monster_drops||[]))if(!IDX.monster.has(mid))issues.push(`物品掉落魔物引用缺失:${iid}->${mid}`)
 }
 for(const [lid,x] of Object.entries(ix.location_content||{})){
   if(!loc(lid))issues.push(`地圖整合索引無效:${lid}`);
   for(const mid of (x.encounter_monster_ids||[]))if(!IDX.monster.has(mid))issues.push(`地圖魔物索引缺失:${lid}->${mid}`)
 }
 for(const t of (DB.party_member_templates||[]))for(const cid of (t.class_affinity_ids||[]))if(!cls(cid))issues.push(`隊友職業關聯缺失:${t.name}->${cid}`);for(const t of (DB.party_member_templates||[])){for(const sid of (t.subjob_affinity_ids||[]))if(!sub(sid))issues.push(`隊友副職關聯缺失:${t.name}->${sid}`);if(!(t.class_affinity_ids||[]).length&&!(t.subjob_affinity_ids||[]).length&&t.integration_role!=="noncombat_support")issues.push(`隊友缺少職業整合:${t.name}`)}
 for(const c of (DB.companion_species||[])){
   if(!["active","deferred_high_tier_region","non_wild_or_special_acquisition"].includes(c.habitat_integration_status))issues.push(`夥伴棲地整合狀態缺失:${c.name}`);
   for(const lid of (c.habitat_location_ids||[]))if(!loc(lid))issues.push(`夥伴棲地引用缺失:${c.name}->${lid}`);
   for(const mid of (c.monster_reference_ids||[]))if(!IDX.monster.has(mid))issues.push(`夥伴魔物關聯缺失:${c.name}->${mid}`)
 }
 if((G?.worldState?.integratedEvents||[]).length>60)issues.push("整合世界事件超過60筆");
 if((DB.political_entities||[]).length<15)issues.push(`政治單位核心數量不足:${(DB.political_entities||[]).length}`);
 if((DB.world_regions||[]).length<20)issues.push(`宏觀地區核心數量不足:${(DB.world_regions||[]).length}`);
 if((DB.culture_profiles||[]).length<20)issues.push(`文化資料核心數量不足:${(DB.culture_profiles||[]).length}`);
 const polityIds=new Set((DB.political_entities||[]).map(x=>x.id)),regionIds=new Set((DB.world_regions||[]).map(x=>x.id)),cultureIds=new Set((DB.culture_profiles||[]).map(x=>x.id));
 for(const p of (DB.political_entities||[])){if(!regionIds.has(p.core_region_id))issues.push(`政治體核心地區缺失:${p.name}`);if(!cultureIds.has(p.culture_id))issues.push(`政治體文化缺失:${p.name}`);if(p.vassal_of&&!polityIds.has(p.vassal_of))issues.push(`政治體宗主引用缺失:${p.name}`)}
 for(const r of (DB.political_relations||[])){if(!polityIds.has(r.a)||!polityIds.has(r.b))issues.push(`政治關係引用缺失:${r.a}/${r.b}`);if(r.score<-100||r.score>100)issues.push(`政治關係值越界:${r.a}/${r.b}`)}
 for(const l of DB.locations){if(l.world_region_id&&!regionIds.has(l.world_region_id))issues.push(`地點宏觀地區引用缺失:${l.name}`);if(l.political_entity_id&&!polityIds.has(l.political_entity_id))issues.push(`地點政治體引用缺失:${l.name}`);if(l.culture_id&&!cultureIds.has(l.culture_id))issues.push(`地點文化引用缺失:${l.name}`)}
 if(!DB.lore_system||DB.lore_system.version!=="LORE-1.0")issues.push("LORE-1.0缺失");
 const loreIds=new Set((DB.lore_records||[]).map(x=>x.id));if(loreIds.size!==(DB.lore_records||[]).length)issues.push("世界誌ID重複");
 const validVerify=new Set(Object.keys(DB.lore_system?.verification_levels||{}));
 for(const r of (DB.lore_records||[])){if(!validVerify.has(r.verification))issues.push(`世界誌驗證層級無效:${r.id}`);const k=`${r.scope_type}:${r.scope_id}`;if(!(DB.lore_query_index?.[k]||[]).includes(r.id))issues.push(`世界誌索引缺失:${r.id}`)}
 for(const [k,ids] of Object.entries(DB.lore_query_index||{}))for(const id of ids)if(!loreIds.has(id))issues.push(`世界誌查詢索引斷鏈:${k}->${id}`);
 if((G?.character?.knownLoreIds||[]).length>300)issues.push("角色世界誌已知記錄超過300");
 for(const id of (G?.character?.knownLoreIds||[]))if(!loreIds.has(id))issues.push(`角色世界誌引用缺失:${id}`);
 if((G?.worldState?.politicalEvents||[]).length>30)issues.push("政治事件超過30筆");
 for(const [k,v] of Object.entries(G?.worldState?.politicalRelations||{}))if(v.score<-100||v.score>100)issues.push(`動態政治關係越界:${k}`);

 const authTierIds=new Set((DB.authority_tiers||[]).map(x=>x.id)),authRightIds=new Set((DB.authority_rights_catalog||[]).map(x=>x.id)),authIds=new Set((DB.authority_archetypes||[]).map(x=>x.id));
 if((DB.authority_archetypes||[]).length<20)issues.push(`權力原型核心數量不足:${(DB.authority_archetypes||[]).length}`);
 const authorityProfilePolityIds=new Set();for(const ap of (DB.polity_authority_profiles||[])){if(authorityProfilePolityIds.has(ap.polity_id))issues.push(`政治體權力檔案重複:${ap.polity_id}`);authorityProfilePolityIds.add(ap.polity_id);if(!politicalEntity(ap.polity_id))issues.push(`政治體權力檔案指向無效政體:${ap.polity_id}`)}
 if((DB.political_authority_catalog||[]).length)issues.push(`舊權力catalog仍在參與資料:${DB.political_authority_catalog.length}`);
 for(const a of (DB.authority_archetypes||[])){
   if(!a.succession_method||!a.jurisdiction||!a.symbols?.length||!a.subordinate_titles?.length)issues.push(`權力原型資料不完整:${a.name||a.id}`);
   if(!authTierIds.has(a.authority_tier))issues.push(`權力原型權級缺失:${a.name}/${a.authority_tier}`);
   if(a.combat_power_independent!==true)issues.push(`權力原型錯誤綁定戰力:${a.name}`)
 }
 const profileByPolity=new Map((DB.polity_authority_profiles||[]).map(x=>[x.polity_id,x]));
 for(const p of (DB.political_entities||[])){
   const ap=profileByPolity.get(p.id);if(!ap){issues.push(`政治體權力檔案缺失:${p.name}`);continue}
   const officeIds=new Set((ap.office_nodes||[]).map(x=>x.id));if(!ap.office_nodes?.length)issues.push(`政治體權力鏈空白:${p.name}`);
   for(const o of (ap.office_nodes||[])){
     if(!authTierIds.has(o.authority_tier))issues.push(`政治體權級引用缺失:${p.name}/${o.title}`);
     if(o.reports_to&&!officeIds.has(o.reports_to))issues.push(`政治體上級引用缺失:${p.name}/${o.title}`);
     for(const x of (o.parallel_authority_ids||[]))if(!officeIds.has(x))issues.push(`政治體平行權力引用缺失:${p.name}/${o.title}/${x}`);
     for(const rid of (o.rights||[]))if(!authRightIds.has(rid))issues.push(`政治體權能引用缺失:${p.name}/${o.title}/${rid}`);
     if(o.authority_archetype_id&&!authIds.has(o.authority_archetype_id))issues.push(`政治體主權原型缺失:${p.name}/${o.title}`)
   }
 }
 if(typeof globalThis.runPoliticalHierarchyDepthAudit==="function"){
   const pha=globalThis.runPoliticalHierarchyDepthAudit();
   if(!pha?.pass)issues.push(...(pha?.issues||[]).map(x=>`政治階層深化:${x}`))
 }else issues.push("政治階層深化runtime缺失");
 for(const l of (DB.locations||[]))if(l.kind==='town'&&l.world_region_id==='REG-18'){
   if(!l.local_authority)issues.push(`CURRENT聚落地方統治缺失:${l.name}`);
   else if(!authTierIds.has(l.local_authority.authority_tier))issues.push(`CURRENT地方權級缺失:${l.name}`)
 }
 if((G?.worldState?.authorityEvents||[]).length>30)issues.push('權力事件超過30筆');
 for(const e of (G?.worldState?.authorityEvents||[])){
   const ap=profileByPolity.get(e.polityId),ids=new Set((ap?.office_nodes||[]).map(x=>x.id));
   if(!ap||!ids.has(e.a)||!ids.has(e.b))issues.push(`權力事件職位引用缺失:${e.polityId}/${e.a}/${e.b}`)
 }
 normalizePoliticalStandingState();
 for(const [pid,v] of Object.entries(G?.character?.politicalStanding||{}))if(!politicalEntity(pid)||v<-100||v>100)issues.push(`政治聲望異常:${pid}/${v}`);

 const dsc=DB.discipline_factions||[],dids=new Set(dsc.map(x=>x.id)),sfs=new Set((DB.skill_families||[]).map(x=>x.id)),cids=new Set(DB.combat_classes.map(x=>x.id));
 const discConsolidation=DB.affiliation_identity_depth_system?.discipline_consolidation||{};
 const physicalDisciplineFloor=Math.max(1,Number(discConsolidation.physical_after||25));
 const magicDisciplineFloor=Math.max(1,Number(discConsolidation.magic_after||24));
 if(dsc.filter(x=>x.track==="physical").length<physicalDisciplineFloor)issues.push(`物理流派核心數量不足:${dsc.filter(x=>x.track==="physical").length}/${physicalDisciplineFloor}`);
 if(dsc.filter(x=>x.track==="magic").length<magicDisciplineFloor)issues.push(`魔法流派核心數量不足:${dsc.filter(x=>x.track==="magic").length}/${magicDisciplineFloor}`);
 if(dids.size!==dsc.length)issues.push(`流派ID重複:${dids.size}/${dsc.length}`);
 const dnames=new Set();for(const d of dsc){
   if(dnames.has(d.name))issues.push(`流派名稱重複:${d.name}`);dnames.add(d.name);
   if(d.parent_org_id&&!orgIds.has(d.parent_org_id))issues.push(`流派父組織缺失:${d.name}->${d.parent_org_id}`);
   if(d.primary_facility&&!DB.facilities[d.primary_facility])issues.push(`流派設施缺失:${d.name}->${d.primary_facility}`);
   for(const lid of (d.contact_location_ids||[]))if(!loc(lid))issues.push(`流派地點缺失:${d.name}->${lid}`);
   for(const cid of (d.related_class_ids||[]))if(!cids.has(cid))issues.push(`流派職業引用缺失:${d.name}->${cid}`);
   for(const sf of (d.skill_family_ids||[]))if(!sfs.has(sf))issues.push(`流派技能家族缺失:${d.name}->${sf}`);
   if(!(d.lore_record_ids||[]).length)issues.push(`流派LORE缺失:${d.name}`);
   for(const x of (d.dialogue_record_ids||[]))if(!IDX.dialogue.has(x))issues.push(`流派對話引用缺失:${d.name}->${x}`);
   for(const x of (d.intel_record_ids||[]))if(!IDX.intel.has(x))issues.push(`流派情報引用缺失:${d.name}->${x}`);
 }
 for(const bad of ["寒冰劍術","烈焰劍術","雷電劍術","暴風劍術"])if(dsc.some(x=>x.name.includes(bad)))issues.push(`元素劍術未合併:${bad}`);
 if(!disciplineFor("DSC-PHY-30")?.substyles?.includes("霜環分支"))issues.push("魔劍元素分支合併缺失");
 if(!disciplineFor("DSC-MAG-09")?.substyles?.includes("焰環"))issues.push("元素塔分環合併缺失");
 for(const r of (DB.discipline_relations||[])){if(!dids.has(r.a)||!dids.has(r.b))issues.push(`流派關係斷鏈:${r.a}/${r.b}`);if(r.score<-100||r.score>100)issues.push(`流派關係值越界:${r.a}/${r.b}`)}
 if((G?.worldState?.disciplineEvents||[]).length>30)issues.push("流派世界事件超過30筆");
 if(G?.character?.disciplines){
   for(const id of G.character.disciplines.discovered||[])if(!dids.has(id))issues.push(`角色流派引用缺失:${id}`);
   for(const [id,v] of Object.entries(G.character.disciplines.mastery||{}))if(!dids.has(id)||v<0||v>100)issues.push(`流派研習度異常:${id}/${v}`)
 }

 const et=DB.eastern_sword_traditions||[],ef=DB.eastern_sword_figures||[],etsk=DB.eastern_sword_techniques||[];
 if(et.length<3)issues.push(`東方劍術核心傳承數量不足:${et.length}`);
 if(!et.some(x=>x.id==="EST-THUNDERCLAP")||!et.some(x=>x.id==="EST-RAIKO")||!et.some(x=>x.id==="EST-YAGYU-MIND"))issues.push("雷鳴／雷煌／柳生唯心傳承缺失");
 if(!disciplineFor("DSC-PHY-31")||disciplineFor("DSC-PHY-31").discovery!=="hidden_restricted")issues.push("雷煌流隱藏流派設定缺失");
 if((disciplineFor("DSC-PHY-31")?.dialogue_record_ids||[]).length||(disciplineFor("DSC-PHY-31")?.intel_record_ids||[]).length)issues.push("雷煌流誤接入普通公開對話／情報");
 const fifth=ef.find(x=>x.id==="FIG-RAIKO-FIFTH");if(!fifth||fifth.true_name!==null||fifth.visibility!=="core_secret")issues.push("第五弟子秘密資料異常");
 const feilie=ef.find(x=>x.id==="FIG-HUANG-FEILIE"),isshin=ef.find(x=>x.id==="FIG-HUANG-ISSHIN"),maya=ef.find(x=>x.id==="FIG-HUANG-MAYA");
 if(!feilie||feilie.combat_tier!=="A"||feilie.eastern_rank!=="劍聖"||feilie.rank_seniority!=="資深")issues.push("煌飛烈階級資料異常");
 if(!isshin||isshin.combat_tier!=="A"||isshin.eastern_rank!=="劍聖"||isshin.rank_seniority!=="新晉")issues.push("煌一心齋階級資料異常");
 if(!maya||maya.combat_tier!=="B"||maya.eastern_rank!=="劍豪")issues.push("煌真葉階級資料異常");
 const rein=(DB.notable_families||[]).find(x=>x.id==="FAM-REIN");if(!rein||!rein.aliases?.includes("萊恩家族"))issues.push("雷恩／萊恩家族別名索引缺失");
 const yagyu=et.find(x=>x.id==="EST-YAGYU-MIND");if(!yagyu||!yagyu.aliases?.some(x=>x.includes("柳生新陰流")))issues.push("柳生舊稱去重索引缺失");
 const eye=etsk.find(x=>x.id==="EST-SK-RAIKO-05"),rai=etsk.find(x=>x.id==="EST-SK-RAIKO-06");if(!eye||eye.tier!=="B")issues.push("心眼秘技資料異常");if(!rai||rai.tier!=="A"||!rai.requires_douqi)issues.push("雷殛秘傳／鬥氣條件異常");
 if((DB.named_weapons||[]).filter(x=>String(x.id).startsWith("NW-RAIKO-")).some(x=>x.acquisition?.includes("普通商店" )===false?false:false)){}

 const st=DB.s_tier_combatants||[],reservedS=DB.s_tier_reserved_slots||[],stIds=new Set(st.map(x=>x.id));
 if(st.length>40)issues.push(`S級已確認人數超過全球上限:${st.length}/40`);
 if(st.length+reservedS.length>40)issues.push(`S級全球席位超過上限:${st.length+reservedS.length}/40`);
 if(stIds.size!==st.length)issues.push("S級人物ID重複");
 for(const x of reservedS){
   if(x.status!=="reserved_blank"||x.name!==null||x.race_id!==null||x.background!==null||x.locked_for_future!==true)issues.push(`S級保留席被污染:${x.slot_id}`)
 }
 const validRegions=new Set((DB.world_regions||[]).map(x=>x.id)),validPolities=new Set((DB.political_entities||[]).map(x=>x.id)),validClasses=new Set(DB.combat_classes.map(x=>x.id));
 for(const x of st){
   if(x.combat_tier!=="S")issues.push(`S級人物戰力標記錯誤:${x.name}`);
   if(x.primary_polity_id&&!validPolities.has(x.primary_polity_id))issues.push(`S級政治體引用缺失:${x.name}`);
   if(x.current_region_id&&!validRegions.has(x.current_region_id))issues.push(`S級地區引用缺失:${x.name}`);
   if(x.combat_class_id&&!validClasses.has(x.combat_class_id))issues.push(`S級職業引用缺失:${x.name}`);
   if(!x.s_rank_path||!x.known_limitations||!(x.history||[]).length)issues.push(`S級人物脈絡不完整:${x.name}`);
   for(const o of x.organization_links||[])if(!orgIds.has(o.organization_id))issues.push(`S級組織引用缺失:${x.name}->${o.organization_id}`);
   if((x.formal_class_tier==="A"||x.formal_class_tier==="B")&&!String(x.s_rank_path).includes("S級"))issues.push(`A/B職業S級實效說明缺失:${x.name}`)
 }
 const extST=new Set(["FIG-HUANG-FEILIE"]);
 for(const r of DB.s_tier_relations||[]){
   if(!stIds.has(r.a)&&!extST.has(r.a))issues.push(`S級關係A端斷鏈:${r.id}->${r.a}`);
   if(!stIds.has(r.b)&&!extST.has(r.b))issues.push(`S級關係B端斷鏈:${r.id}->${r.b}`);
   if(r.score<-100||r.score>100)issues.push(`S級關係值越界:${r.id}`)
 }
 if((G?.worldState?.sTierEvents||[]).length>20)issues.push("S級世界影響事件超過20筆");

 const cpo=DB.continental_political_order,ou=DB.overseas_unknown_horizons||[];
 if(!cpo||cpo.political_unit_count<17||cpo.governed_polity_count<14||cpo.regional_power_count<2||cpo.nonstate_political_zone_count<1)issues.push("大陸政治體系統缺失或核心數量不足");
 if(politicalEntity("POL-020")?.name!=="黑月深庭")issues.push("POL-020未修正為黑月深庭");
 if(politicalEntity("POL-020")?.primary_authority_archetype_id!=="AUT-005")issues.push("黑月深庭主權原型錯誤");
 if(worldRegion("REG-20")?.political_entity_id!==null)issues.push("龍脊火山群誤掛政治體");
 if(worldRegion("REG-20")?.political_status!=="unclaimed_fragmented")issues.push("龍脊火山群無主狀態缺失");
 const stone=worldRegion("REG-13");if(!stone?.secondary_political_entity_ids?.includes("POL-020")||stone.layered_sovereignty!==true)issues.push("石冠山脈／黑月深庭重疊主權缺失");
 for(const rid of (stone?.secondary_political_entity_ids||[]))if(!politicalEntity(rid))issues.push(`宏觀地區次級政治體引用缺失:${rid}`);
 if(ou.length<3)issues.push(`海外未知文明核心數量不足:${ou.length}`);
 for(const x of ou){
   if(!["魔族","魔裔","龍族","鳳族"].includes(x.people))issues.push(`海外未知族群異常:${x.people}`);
   for(const k of ["known_political_entity_id","known_name","known_capital","known_government","known_ruler","known_borders"])if(x[k]!==null)issues.push(`海外未知欄位被污染:${x.people}/${k}`);
 }
 for(const sid of ["ST-28","ST-29","ST-30"])if(sTierCombatant(sid)?.primary_polity_id!==null)issues.push(`古龍被誤掛國籍:${sid}`);
 if((DB.political_relations||[]).some(r=>(r.a==="POL-020"||r.b==="POL-020")&&String(r.reason).includes("龍")))issues.push("POL-020仍殘留龍族政體外交");

 const wh=DB.world_history_system,ht=DB.world_timeline||[],hp=DB.historical_subperiods||[],hc=DB.historical_causal_chains||[],hd=DB.historical_disputes||[];
 if(!wh||wh.version!=="HISTORY-2.0")issues.push("HISTORY-2.0缺失");
 if(hp.length<12)issues.push(`歷史細分時期核心數量不足:${hp.length}`);
 if(ht.length<82)issues.push(`世界史年表核心數量不足:${ht.length}`);
 if(hc.length<14)issues.push(`歷史因果鏈核心數量不足:${hc.length}`);
 if(hd.length<8)issues.push(`爭議史核心數量不足:${hd.length}`);
 const heIds=new Set(ht.map(x=>x.id));if(heIds.size!==ht.length)issues.push("世界史事件ID重複");
 const eraMap=new Map((DB.historical_eras||[]).map(x=>[x.id,x])),perMap=new Map(hp.map(x=>[x.id,x]));
 for(const e of ht){
   const er=eraMap.get(e.era_id),pr=perMap.get(e.subperiod_id);
   if(!er||e.year<er.start_year||e.year>er.end_year)issues.push(`世界史時代引用異常:${e.id}`);
   if(!pr||e.year<pr.start_year||e.year>pr.end_year)issues.push(`世界史細分時期異常:${e.id}`);
   if(e.lore_record_id&&!loreIds.has(e.lore_record_id))issues.push(`世界史LORE引用缺失:${e.id}`);
   for(const cid of e.cause_ids||[]){const c=historyEvent(cid);if(!c)issues.push(`世界史原因斷鏈:${e.id}->${cid}`);else if(c.year>e.year)issues.push(`世界史逆時間因果:${cid}->${e.id}`)}
   for(const xid of e.consequence_ids||[])if(!heIds.has(xid))issues.push(`世界史後果斷鏈:${e.id}->${xid}`);
 }
 for(const c of hc){for(const eid of c.event_ids||[])if(!heIds.has(eid))issues.push(`歷史因果鏈斷鏈:${c.id}->${eid}`)}
 for(const d of hd){for(const eid of d.related_event_ids||[])if(!heIds.has(eid))issues.push(`爭議史事件斷鏈:${d.id}->${eid}`)}
 if(historyEvent("HIST-067")?.visibility!=="restricted")issues.push("雷煌相關歷史事件未受限");
 if(historicalDispute("HDIS-08")?.status!=="unknown")issues.push("海外未知歷史爭議狀態錯誤");
 for(const p of DB.political_entities||[])if(!(DB.history_entity_index?.[p.id]||[]).length)issues.push(`政治體缺世界史脈絡:${p.name}`);
 for(const r of DB.world_regions||[])if((DB.history_entity_index?.[r.id]||[]).length<2)issues.push(`地區世界史脈絡過薄:${r.name}`);

 const sh=systemDomainHealth();issues.push(...sh.issues);
 if(DB.system_orchestrator?.version!=="ORCHESTRATOR-3.0")issues.push("ORCHESTRATOR-3.0缺失");
 if(DB.generation_pipeline?.version!=="GEN-PIPE-2.0")issues.push("GEN-PIPE-2.0缺失");
 if((DB.regional_content_profiles||[]).length<21)issues.push(`區域內容檔案核心數量不足:${(DB.regional_content_profiles||[]).length}`);
 if((DB.regional_npc_archetypes||[]).length<126)issues.push(`地方NPC原型核心數量不足:${(DB.regional_npc_archetypes||[]).length}`);
 if((DB.regional_adventure_hooks||[]).length<84)issues.push(`區域冒險脈絡核心數量不足:${(DB.regional_adventure_hooks||[]).length}`);
 if((DB.regional_life_events||[]).length<63)issues.push(`區域生活事件核心數量不足:${(DB.regional_life_events||[]).length}`);
 if((DB.quest_templates||[]).length<24)issues.push(`公會委託模板核心數量不足:${(DB.quest_templates||[]).length}`);
 const expectedAdventureEvents=DB.integration_registry?.counts?.adventure_event_templates??(DB.adventure_event_templates||[]).length;if((DB.adventure_event_templates||[]).length!==expectedAdventureEvents)issues.push(`奇遇模板數量異常:${(DB.adventure_event_templates||[]).length}/${expectedAdventureEvents}`);
 if((DB.dialogue_database?.records||[]).length<546)issues.push(`對話資料核心數量不足:${(DB.dialogue_database?.records||[]).length}`);
 if((DB.intel_database?.records||[]).length<546)issues.push(`情報資料核心數量不足:${(DB.intel_database?.records||[]).length}`);
 const rgIds=new Set((DB.world_regions||[]).map(x=>x.id));
 for(const x of DB.regional_content_profiles||[]){if(!rgIds.has(x.region_id))issues.push(`區域內容地區斷鏈:${x.id}`);for(const eid of x.history_event_ids||[])if(!historyEvent(eid))issues.push(`區域內容歷史斷鏈:${x.id}->${eid}`)}
 for(const x of DB.regional_npc_archetypes||[]){if(!rgIds.has(x.region_id))issues.push(`NPC原型地區斷鏈:${x.id}`);if(x.combat_tier_ceiling&&tierOrder(x.combat_tier_ceiling)>tierOrder("C"))issues.push(`普通NPC原型戰力越權:${x.id}`)}
 for(const x of DB.regional_adventure_hooks||[]){if(!rgIds.has(x.region_id))issues.push(`區域冒險地區斷鏈:${x.id}`);for(const eid of x.history_event_ids||[])if(!historyEvent(eid))issues.push(`區域冒險歷史斷鏈:${x.id}->${eid}`)}
 for(const x of DB.regional_life_events||[])if(!rgIds.has(x.region_id))issues.push(`區域生活事件地區斷鏈:${x.id}`);
 for(const d of DB.dialogue_database?.records||[]){if(d.world_region_id&&!rgIds.has(d.world_region_id))issues.push(`對話宏觀地區斷鏈:${d.id}`)}
 for(const x of DB.intel_database?.records||[]){if(x.world_region_id&&!rgIds.has(x.world_region_id))issues.push(`情報宏觀地區斷鏈:${x.id}`)}
 if(G?.worldState?.orchestrator?.lastWorldDynamicTurn>G.turn)issues.push("世界動態調度器turn超前");

 const ic=DB.integration_registry?.counts||{};if(ic.lore_records!==DB.lore_records.length||ic.dialogue!==(DB.dialogue_database?.records||[]).length||ic.intel!==(DB.intel_database?.records||[]).length||ic.quest_templates!==DB.quest_templates.length||ic.adventure_event_templates!==DB.adventure_event_templates.length)issues.push("INTEGRATION-3.0統計與CURRENT實際數量不同步");

 const qi=DB.quest_system?.quest_intel_system;if(!qi||qi.version!=="QUEST-INTEL-1.1")issues.push("QUEST-INTEL-1.1缺失");
 if(!Array.isArray(G?.explorationIntel||[]))issues.push("探索情報狀態不是陣列");
 if((G?.explorationIntel||[]).length>(qi?.exploration_record_cap||120))issues.push("探索情報超過上限");
 if(typeof openIntelArchive!=="function"||typeof intelArchiveEntries!=="function")issues.push("固定情報頁runtime缺失");
 if(DB.hard_rules?.ui_bottom_nav_button_count!==8)issues.push("底部固定導覽按鍵數規則不是8");
 if(DB.hard_rules?.guild_quest_no_intel_button!==true||DB.hard_rules?.quest_card_no_intel_button!==true)issues.push("委託情報按鍵位置規則缺失");
 if(DB.hard_rules?.home_screen_hide_save_card!==true)issues.push("主畫面存檔欄位隱藏規則缺失");
 const homeSummary=DB.ui_mobile_panel_system?.main_screen?.summary_cards||[];
 if(homeSummary.join("|")!=="遊戲時間|位置|回合")issues.push(`主畫面摘要欄位順序異常:${homeSummary.join("/")}`);
 if(DB.home_hud_layout_system?.version!=="HOME-HUD-LAYOUT-1.0")issues.push("HOME-HUD-LAYOUT-1.0缺失");
 if(DB.hard_rules?.intel_archive_max_visible_per_source!==4)issues.push("情報頁單來源最大同時顯示數不是4");
 if(DB.hard_rules?.intel_archive_independent_scrollbars!==true||DB.intel_archive_system?.independent_scrollbars!==true)issues.push("情報頁獨立拖曳條規則缺失");
 if(DB.intel_archive_system?.max_visible_per_source!==4)issues.push("情報頁顯示上限metadata異常");

 const mh=DB.map_hierarchy_system,rrm=DB.realm_region_maps||[],prm=DB.province_region_maps||[],srm=DB.settlement_region_maps||[],stsys=DB.settlement_world_tier_system;
 if(!mh||mh.version!=="MAP-HIERARCHY-1.0"||mh.layers?.length!==4)issues.push("MAP-HIERARCHY-1.0缺失或層級異常");
 if(!stsys||stsys.version!=="SETTLEMENT-TIER-1.0"||stsys.tiers?.length!==7)issues.push("SETTLEMENT-TIER-1.0缺失");
 const rmapIds=new Set(rrm.map(x=>x.id)),pmapIds=new Set(prm.map(x=>x.id)),smapIds=new Set(srm.map(x=>x.id));
 for(const p of prm){if(!rmapIds.has(p.parent_realm_map_id))issues.push(`行省上層地圖缺失:${p.name}`);if(p.capital_location_id&&!loc(p.capital_location_id))issues.push(`行省首府缺失:${p.name}`)}
 for(const s of srm){if(!pmapIds.has(s.parent_province_region_id))issues.push(`城鎮區域上層行省缺失:${s.name}`);if(!loc(s.center_location_id))issues.push(`城鎮區域中心缺失:${s.name}`);for(const lid of s.location_ids||[])if(!loc(lid))issues.push(`城鎮區域地點缺失:${s.name}->${lid}`)}
 for(const l of DB.locations){
   if(l.kind==="town"){if(!l.settlement_world_tier)issues.push(`聚落世界層級缺失:${l.name}`);else if(l.settlement_world_tier!==l.tier)issues.push(`聚落世界層級與地點tier不同步:${l.name}`)}
   if(l.world_region_id==="REG-18"){if(!pmapIds.has(l.province_region_id))issues.push(`西境地點行省歸屬缺失:${l.name}`);if(!smapIds.has(l.settlement_region_id))issues.push(`西境地點城鎮區域歸屬缺失:${l.name}`)}
 }
 const lp=DB.loven_province_database;
 if(!lp||lp.version!=="LOVEN-PROVINCE-1.0")issues.push("LOVEN-PROVINCE-1.0缺失");
 else{
   if(lp.capital_city?.location_id!=="L-LOVEN")issues.push("洛文省級首府漂移");
   if(lp.upper_level_city?.location_id!=="L-SELENBURG")issues.push("洛文上一級城市缺失");
   if((lp.same_tier_cities||[]).length<2)issues.push("洛文同級城市不足");
   for(const x of lp.same_tier_cities||[])if(loc(x.location_id)?.settlement_world_tier!=="D")issues.push(`洛文同級城市tier錯誤:${x.location_id}`);
   if(!(lp.wilderness_map_ids||[]).length||!(lp.dungeon_map_ids||[]).length)issues.push("洛文省域野外／地下城資料缺失");
 }

 if((DB.regional_powers||[]).length<2)issues.push(`區域勢力核心數量不足:${(DB.regional_powers||[]).length}`);
 for(const rp of (DB.regional_powers||[])){if(rp.recognized_sovereignty!==false)issues.push(`區域勢力誤具主權:${rp.name}`);if(politicalEntity(rp.legacy_polity_id))issues.push(`退役政體仍存在:${rp.legacy_polity_id}`)}
 for(const rid of ["REG-17"]){const r=worldRegion(rid);if(r?.political_entity_id!==null)issues.push(`區域勢力地區誤掛政體:${rid}`);if(!regionalPowersForRegion(rid).length)issues.push(`區域勢力地區缺勢力:${rid}`)}
 const blackTide=worldRegion("REG-10");if(blackTide?.political_entity_id!=="POL-010")issues.push("黑潮群島主權未建立為POL-010");if(!regionalPowersForRegion("REG-10").length)issues.push("黑潮群島幕府軍政勢力缺失");
 for(const id of ["POL-005","POL-006","POL-018"])if(politicalEntity(id))issues.push(`已整併政治體仍存在:${id}`);
 for(const pid of ["POL-007","POL-008","POL-009"]){if(politicalEntity(pid)?.government_type!=="自由都市")issues.push(`自由都市類型未統整:${pid}`)}
 const disciplineCanonicalFloor=Math.max(1,Number(DB.affiliation_identity_depth_system?.discipline_consolidation?.canonical_after||49));
 if((DB.discipline_factions||[]).length<disciplineCanonicalFloor)issues.push(`流派核心數量不足:${DB.discipline_factions?.length}/${disciplineCanonicalFloor}`);
 for(const id of ["EST-THUNDERCLAP","EST-RAIKO","EST-YAGYU-MIND"]){if(!(DB.eastern_sword_traditions||[]).some(x=>x.id===id))issues.push(`東方核心傳承缺失:${id}`)}
 if(!disciplineFor("DSC-PHY-31"))issues.push("雷煌流canonical流派缺失");
 for(const [oldId,newId] of Object.entries(DB.discipline_merge_map||{})){if(!disciplineFor(newId))issues.push(`流派整併目標缺失:${oldId}->${newId}`);if((DB.discipline_factions||[]).some(x=>x.id===oldId))issues.push(`舊流派未退役:${oldId}`)}
 if(DB.naming_ai?.version!=="NAME-AI-1.0")issues.push("NAME-AI-1.0缺失");
 for(const banned of ["九璽貴族共和國","七橋自由城邦同盟","五環元素塔議會","七環魔劍士會"]){if(allCanonicalNames().includes(banned))issues.push(`舊公式化名稱仍為canonical:${banned}`)}

 const wm=DB.world_material_system,fest=DB.cultural_festivals||[],myths=DB.myth_cycle_records||[],
       lhist=DB.local_historical_incidents||[],folk=DB.regional_folklore||[],rum=DB.regional_rumors||[],
       packs=DB.generator_material_packs||[];
 if(!wm||wm.version!=="WORLD-MATERIAL-1.0")issues.push("WORLD-MATERIAL-1.0缺失");
 if(fest.length<40)issues.push(`文化節慶核心數量不足:${fest.length}`);
 if(myths.length<27)issues.push(`神話母題核心數量不足:${myths.length}`);
 if(lhist.length<40)issues.push(`地方微歷史核心數量不足:${lhist.length}`);
 if(folk.length<40)issues.push(`地方民俗核心數量不足:${folk.length}`);
 if(rum.length<100)issues.push(`地方傳聞核心數量不足:${rum.length}`);
 if(packs.length<20)issues.push(`區域素材包核心數量不足:${packs.length}`);
 for(const r of DB.world_regions||[]){
   const pack=generatorMaterialPackFor(r.id);if(!pack)issues.push(`地區素材包缺失:${r.id}`);
   if(localHistoryFor(r.id).length<2)issues.push(`地方微歷史不足:${r.id}`);
   if(regionalFolkloreFor(r.id).length<2)issues.push(`地方民俗不足:${r.id}`);
   if(regionalRumorsFor(r.id).length<5)issues.push(`地方傳聞不足:${r.id}`);
 }
 for(const p of DB.pantheons||[])if(mythMotifsFor(p.id).length<3)issues.push(`神系神話素材不足:${p.id}`);
 for(const c of DB.culture_profiles||[]){
   if(!(c.cuisine||[]).length||!(c.sayings||[]).length||!(c.festival_ids||[]).length)issues.push(`文化深化不足:${c.id}`);
 }

 const wrs=DB.world_relationship_system,hr=DB.historical_relationship_records||[],hri=DB.historical_relationship_index||{};
 if(!wrs||wrs.version!=="RELATION-HISTORY-1.0")issues.push("RELATION-HISTORY-1.0缺失");
 if(hr.length<222)issues.push(`歷史關係核心數量不足:${hr.length}`);
 const hrIds=new Set(hr.map(x=>x.id));if(hrIds.size!==hr.length)issues.push("歷史關係ID重複");
 for(const r of hr){
   if(r.score<-100||r.score>100)issues.push(`關係分數越界:${r.id}`);
   if(!DB.relationship_state_catalog?.[r.state])issues.push(`關係狀態未知:${r.id}`);
   if(r.lore_record_id&&!loreIds.has(r.lore_record_id))issues.push(`關係LORE缺失:${r.id}`);
 }
 for(const rc of DB.races||[])if(!(hri[`race:${rc.id}`]||[]).length)issues.push(`種族關係史缺失:${rc.id}`);
 for(const pp of DB.political_entities||[])if(!(hri[`polity:${pp.id}`]||[]).length)issues.push(`政體關係史缺失:${pp.id}`);
 for(const rr of DB.regional_powers||[])if(!(hri[`regional_power:${rr.id}`]||[]).length)issues.push(`區域勢力關係史缺失:${rr.id}`);
 for(const x of DB.organization_relations||[])if(!x.historical_basis||!x.current_effects?.length)issues.push(`組織關係未深化:${x.a}/${x.b}`);
 for(const x of DB.political_relations||[])if(!x.historical_basis||!x.current_effects?.length)issues.push(`政治關係未深化:${x.a}/${x.b}`);

 const ics=DB.item_catalog_system||{};
 const eqCount=(DB.items||[]).filter(x=>["武器","防具","飾品"].includes(x.catalog_group)).length;
 const potCount=(DB.items||[]).filter(x=>x.type==="藥劑").length;
 const otherCount=(DB.items||[]).length-eqCount-potCount;
 const craftCount=(DB.items||[]).filter(x=>x.craft_recipe).length;
 if(ics.version!=="ITEM-CATALOG-1.1")issues.push("ITEM-CATALOG-1.1缺失");
 if((DB.items||[]).length<(DB.hard_rules.item_total_core_count||1098))issues.push(`物品核心總數不足:${(DB.items||[]).length}`);
 if(eqCount<352)issues.push(`裝備核心數量不足:${eqCount}`);
 if(DB.equipment_depth_system?.version!=="EQUIPMENT-DEPTH-1.0")issues.push("EQUIPMENT-DEPTH-1.0缺失");
 const setSizes=new Set();
 for(const set of DB.equipment_sets||[]){
   const pieces=[...new Set(set.pieces||[])];setSizes.add(pieces.length);
   if(!set.id||!set.name||pieces.length<2)issues.push(`套裝定義異常:${set.id||"未知"}`);
   for(const id of pieces)if(!item(id))issues.push(`套裝部件不存在:${set.id}/${id}`);
   for(const b of set.bonuses||[])if(!(Number(b.pieces)>0)||Number(b.pieces)>pieces.length)issues.push(`套裝門檻異常:${set.id}/${b.pieces}`)
 }
 for(const n of [3,5,8])if(!setSizes.has(n))issues.push(`套裝件數範例缺失:${n}件`);
 if(potCount<240)issues.push(`藥劑核心數量不足:${potCount}`);
 if(otherCount<(DB.hard_rules.general_item_core_count||578))issues.push(`一般道具核心數量不足:${otherCount}`);
 if(craftCount<520)issues.push(`可製作品核心數量不足:${craftCount}`);
 if((DB.items||[]).some(x=>x.id?.startsWith("EQ31-")&&["A","S"].includes(x.tier)))issues.push("1.31新增裝備出現A/S級");
 for(const x of (DB.items||[]).filter(x=>x.id?.startsWith("EQ31-")||x.id?.startsWith("P31-"))){
   if(!x.craft_recipe)issues.push(`新增製作品缺配方:${x.id}`);
 }
 for(const fid of ["general","blacksmith","tailor","alchemy","enchanter","mageguild","church","clinic"]){
   for(const iid of DB.facilities?.[fid]?.stock||[])if(!item(iid))issues.push(`商店庫存引用缺失:${fid}/${iid}`);
 }
 const gatherToolIds=DB.gather_tool_market_system?.general_store_tool_ids||["MAT-UTIL-08","MAT-UTIL-09","MAT-UTIL-10","I-GATHER-KNIFE"];
 for(const id of gatherToolIds){
   const d=item(id);if(!d)issues.push(`採集工具缺失:${id}`);
   else if(!(DB.facilities?.general?.stock||[]).includes(id))issues.push(`雜貨鋪未販售採集工具:${d.name}`)
 }
 for(const effect of ["mining","woodcut","fishing","gather"])if(!(DB.items||[]).some(d=>d?.tool_effect===effect))issues.push(`採集工具效果缺失:${effect}`);
 if(typeof gatherToolEffectForItem!=="function"||typeof gatherLocationEntries!=="function")issues.push("採集工具runtime缺失");

 if(DB.system_audit_registry?.version!=="SYSTEM-AUDIT-3.0")issues.push("SYSTEM-AUDIT-3.0缺失");
 if(DB.generator_ai_coverage_system?.version!=="GEN-AI-COVERAGE-1.0")issues.push("GEN-AI-COVERAGE-1.0缺失");
 const coverageDomains=["combat_character","world_simulation","persistence_audit","character_generation"];
 for(const domainId of coverageDomains){
  const d=(DB.system_orchestrator?.domains||[]).find(x=>x?.id===domainId);
  if(!d?.generator_ids?.length)issues.push(`生成器配對缺失:${domainId}`);
  if(!d?.management_ai_ids?.length)issues.push(`管理AI配對缺失:${domainId}`);
 }
 const requiredRuntimeContracts=[
  ["GEN-COMBAT-CHARACTER","generateCombatCharacterProfile"],["GEN-WORLD-SIMULATION","generateWorldSimulationDecision"],["GEN-SAVE-AUDIT-SNAPSHOT","generateSaveAuditSnapshot"],["GEN-CHARACTER-PROFILE","generateCharacterProfile"],
  ["AI-COMBAT-CHARACTER","manageCombatCharacterProfile"],["AI-WORLD-SIMULATION","manageWorldSimulation"],["AI-SAVE-AUDIT-GOVERNANCE","manageSaveAudit"],["AI-CHARACTER-GENERATION","manageCharacterGeneration"]
 ];
 for(const [id,fn] of requiredRuntimeContracts)if(!generatorRuntimeFunctionExists(fn))issues.push(`治理runtime缺失:${id}->${fn}`);
 for(const g of DB.generators||[]){
   if(g.runtime_status==="IMPLEMENTED"&&!generatorRuntimeFunctionExists(g.runtime_function))issues.push(`生成器runtime缺失:${g.id}->${g.runtime_function||"null"}`);
   if(g.audit_status!=="PASS")issues.push(`生成器未通過系統稽核:${g.id}`);
 }
 for(const a of DB.management_ai||[])if(a.audit_status!=="PASS")issues.push(`管理AI未通過系統稽核:${a.id}`);
 const retiredPolities=new Set(["POL-017"]);
 for(const [name,rows] of [["regional_content_profiles",DB.regional_content_profiles],["regional_economy_profiles",DB.regional_economy_profiles],["regional_npc_archetypes",DB.regional_npc_archetypes],["regional_adventure_hooks",DB.regional_adventure_hooks]]){
   for(const x of rows||[])if(x.polity_id&&retiredPolities.has(x.polity_id))issues.push(`退役政體殘留:${name}/${x.id}/${x.polity_id}`)
 }
 for(const [iid,s] of Object.entries(DB.content_link_index?.item_sources||{})){
   if(!item(iid))issues.push(`來源索引無效物品:${iid}`);
   if(!["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"].some(k=>(s[k]||[]).length))issues.push(`物品來源完全空白:${iid}`)
 }

 if(DB.crafting_system?.ui_version!=="CRAFT-UI-1.1")issues.push("CRAFT-UI-1.1缺失");
 if(typeof craftMaterialText!=="function"||typeof cookingMaterialText!=="function")issues.push("製作素材文字函式缺失");
 if(DB.cooking_data_integrity_system?.version!=="COOKING-DATA-INTEGRITY-1.0")issues.push("COOKING-DATA-INTEGRITY-1.0缺失");
 if(typeof isCookingRecipe!=="function")issues.push("料理配方分類函式缺失");
 for(const x of DB.cooking_data_integrity_system?.semantic_issues||[])issues.push(`料理素材語意異常:${x.id}/${x.reason}`);
 const cookingProfessionLeaks=(DB.recipes||[]).filter(r=>{
   const d=cookingOutputItem(r),prof=String(r?.profession||"").trim();
   return d&&(d.type==="料理"||d.inventory_group==="食物"||d.food_subtype)&&prof&&!["料理","烹飪","cook","cooking","SJ-COOK"].includes(prof)
 });
 for(const r of cookingProfessionLeaks)issues.push(`料理配方專業分類異常:${r.id}/${r.profession}`);
 if(DB.crafting_data_integrity_system?.version!=="CRAFTING-DATA-INTEGRITY-1.0")issues.push("CRAFTING-DATA-INTEGRITY-1.0缺失");
 if(typeof craftingRecipeMatchesFacility!=="function"||typeof currentFacilityAllowsCrafting!=="function")issues.push("專業製作分類防線缺失");
 if(typeof inventoryComparisonItem!=="function"||typeof equipmentCompareValueText!=="function")issues.push("背包裝備屬性對比runtime缺失");
 if(typeof worldTierItemSort!=="function"||typeof itemListCategoryLabel!=="function"||typeof tierGroupedItemRows!=="function")issues.push("商品／製作世界層級排序runtime缺失");
 else{
   const orderProbe=[{tier:"C",name:"C"},{tier:"F",name:"F"},{tier:"A",name:"A"},{tier:"D",name:"D"}].sort(worldTierItemSort).map(x=>x.tier).join("");
   if(orderProbe!=="FDCA")issues.push("商品／製作世界層級排序異常");
 }
 for(const x of DB.crafting_data_integrity_system?.issues||[])issues.push(`專業製作資料異常:${x.id}/${x.reason}`);
 for(const [fid,prof] of Object.entries(DB.crafting_system?.facility_profession||{})){
   for(const d of (DB.items||[]).filter(x=>x?.craft_recipe?.requires_facility===fid)){
     if(d.craft_recipe.profession!==prof)issues.push(`製作設施專業污染:${fid}/${d.id}/${d.craft_recipe.profession}`);
   }
 }

 if(DB.talent_system?.version!=="TALENT-IDENTITY-DEPTH-1.0")issues.push("TALENT-IDENTITY-DEPTH-1.0缺失");
 if((DB.talents||[]).length!==Number(DB.talent_system?.core_count||0))issues.push(`天賦核心數量與系統宣告不一致:${(DB.talents||[]).length}/${DB.talent_system?.core_count}`);
 const talentActual=(DB.talents||[]).reduce((m,x)=>(m[x.category]=(m[x.category]||0)+1,m),{});
 for(const cat of ["角色能力","戰鬥專精","戰鬥素質","副職業專精"])if(!(talentActual[cat]>0))issues.push(`天賦分類缺失:${cat}`);
 if((DB.talents||[]).some(t=>!t.identity?.signature||!t.identity?.playstyle||!t.identity?.tradeoff||!t.identity?.distinctive_axis))issues.push("天賦特色欄位不完整");
 if(typeof globalThis.runTalentIdentityDepthAudit!=="function"||!globalThis.runTalentIdentityDepthAudit().pass)issues.push("天賦深化稽核失敗");
 if(typeof talentSubjobBonus!=="function"||typeof craftTimeHours!=="function")issues.push("天賦副職業runtime缺失");
 if(DB.crafting_system?.profession_subjob?.["附魔"]!=="SJ-ENCHANT")issues.push("附魔副職業映射缺失");

 if(DB.skill_scaling_system?.version!=="SKILL-SCALING-2.2")issues.push("SKILL-SCALING-2.2缺失");
 if(DB.map_navigation_system?.version!=="MAP-NAV-3.0")issues.push("MAP-NAV-3.0缺失");
 const dragon=(DB.skill_pools?.["C-DRAGONBLADE"]||[]).find(x=>x.name==="龍炎斬");
 if(!dragon||dragon.base_power_percent!==110)issues.push("龍炎斬百分比換算異常");
 const heal=(DB.shared_skills||[]).find(x=>x.base_name==="治癒術");
 if(!heal||heal.base_power_percent!==112)issues.push("治癒術百分比換算異常");
 const cleanse=(DB.shared_skills||[]).find(x=>x.base_name==="淨化術");
 if(!cleanse||!String(cleanse.effect_text||"").includes("不包含中毒"))issues.push("淨化術效果敘述異常");

 if(DB.meta?.distribution_mode!=="local_only")issues.push("本機模式未鎖定");
 if(DB.meta?.auto_update_system?.enabled!==false)issues.push("本機版仍啟用背景網站更新");
 if(!DB.ability_point_system||DB.ability_point_system.gain_every_levels!==5)issues.push("能力點系統缺失");
 if(DB.skill_scaling_system?.skill_xp_system?.level_cap!==10)issues.push("技能XP系統缺失");
 if(!DB.quest_system?.market_demand)issues.push("委託市場需求模型缺失");
 if(!DB.management_ai?.some(x=>x.id==="AI-QUEST-MARKET-DEMAND"))issues.push("委託市場需求AI缺失");
 if((DB.items||[]).some(x=>!(Number(x.weight)>0)))issues.push("存在無正重量物品");
 if(typeof craftItemBatch!=="function"||typeof cookBatch!=="function")issues.push("批量製作runtime缺失");
 if(typeof openGuildBuyback!=="function")issues.push("公會收購櫃檯runtime缺失");
 if(typeof isAbilityStatPotion!=="function"||typeof rareShopStockAvailable!=="function")issues.push("能力藥水稀有供應runtime缺失");
 else{
   const fixedAbility=(DB.facilities?.alchemy?.stock||[]).map(item).filter(Boolean).filter(isAbilityStatPotion);
   if(fixedAbility.some(d=>marketStockLimit(d)!==1))issues.push("能力藥水商店庫存上限異常");
 }
 if(typeof isAlchemyBuybackItem!=="function"||typeof alchemyBuybackIngredientIds!=="function")issues.push("煉金店收購分類runtime缺失");
 else{
   const rejectedAlchemyIngredients=[...alchemyBuybackIngredientIds()].map(item).filter(Boolean).filter(d=>!canSellTo("alchemy",d));
   if(rejectedAlchemyIngredients.length)issues.push(`煉金店拒收合法藥劑素材:${rejectedAlchemyIngredients.slice(0,8).map(x=>x.id).join(",")}`)
 }

 if(DB.encounter_ecology_system?.version!=="ENCOUNTER-ECOLOGY-2.0")issues.push("ENCOUNTER-ECOLOGY-2.0缺失");
 if(typeof monsterFitsLocationEcology!=="function"||typeof encounterWeightForLocation!=="function")issues.push("生態遭遇runtime缺失");
 const brokenTower=loc("D-WATCH"),brokenPool=brokenTower?encounterCandidates(brokenTower):[];
 if(brokenPool.some(m=>m.name==="棕熊"||m.name==="灰熊"||m.name==="洞穴熊"))issues.push("斷塔地下室仍可生成熊類");
 for(const l of DB.locations||[]){
   if(!["wild","dungeon"].includes(l.kind))continue;
   const ep=encounterCandidates(l);
   if(!ep.length)issues.push(`區域生態候選池為空:${l.id}`);
   if(l.encounter_profile?.archetype==="artificial_cellar"&&ep.some(m=>(m.ecology_profile?.tags||[]).includes("large_wildlife")))issues.push(`人工地下室生成大型野獸:${l.id}`);
 }

 if(DB.loot_ecology_system?.version!=="LOOT-ECOLOGY-1.0")issues.push("LOOT-ECOLOGY-1.0缺失");
 if(typeof validEnemyLootEntry!=="function")issues.push("掉落生態驗證函式缺失");
 for(const mon of DB.monsters||[]){
   const lp=mon.loot_profile;
   if(!lp||lp.version!=="LOOT-ECOLOGY-1.0")issues.push(`怪物掉落profile缺失:${mon.id}`);
   if(lp?.fallback_policy!=="none")issues.push(`怪物仍允許掉落fallback:${mon.id}`);
   for(const drop of mon.loot_materials||[]){
     if(!item(drop.id))issues.push(`怪物掉落物不存在:${mon.id}/${drop.id}`);
     if(!validEnemyLootEntry(mon,drop))issues.push(`怪物未授權掉落:${mon.id}/${drop.id}`);
   }
 }
 const halfOrc=monster("MON14-045"),kobold=monster("MON14-038");
 if((halfOrc?.loot_materials||[]).some(x=>item(x.id)?.name.includes("哥布林")))issues.push("半獸人仍掉落哥布林素材");
 if((kobold?.loot_materials||[]).some(x=>item(x.id)?.name.includes("鱗片")))issues.push("狗頭人仍掉落鱗片");

 if(DB.quest_turnin_ui_system?.version!=="QUEST-TURNIN-UI-1.0")issues.push("QUEST-TURNIN-UI-1.0缺失");
 if(typeof questListAction!=="function")issues.push("委託列表回報狀態函式缺失");
 const firewood=questTemplate("Q-FIREWOOD");
 if(!firewood||firewood.objective?.item_id!=="I-BRANCH")issues.push("乾燥枯枝委託item_id異常");
 if(item("I-BRANCH")?.name!=="乾燥枯枝")issues.push("乾燥枯枝canonical item異常");

 if(DB.quest_return_navigation_system?.version!=="QUEST-RETURN-NAV-1.0")issues.push("QUEST-RETURN-NAV-1.0缺失");
 if(typeof reopenQuestViewAfterTurnIn!=="function")issues.push("委託回報原畫面刷新函式缺失");

 if(DB.modal_state_sync_system?.version!=="MODAL-STATE-SYNC-1.0")issues.push("MODAL-STATE-SYNC-1.0缺失");
 if(typeof modalGoBack!=="function"||typeof captureModalPage!=="function")issues.push("modal狀態導覽核心缺失");

 if(DB.skill_description_system?.version!=="SKILL-DESCRIPTION-1.0")issues.push("SKILL-DESCRIPTION-1.0缺失");
 if(DB.skill_scaling_system?.version!=="SKILL-SCALING-2.2")issues.push("SKILL-SCALING-2.2缺失");
 if(typeof skillDescriptionText!=="function"||typeof supportEffectText!=="function"||typeof passiveEffectText!=="function")issues.push("技能文字敘述runtime缺失");
 const windSkill=(DB.skill_pools?.["C9-WINDMAGE"]||[]).find(x=>(x.base_name||x.name)==="風之護盾");
 if(!windSkill||supportPercentValue(windSkill,"defense_pct")<10)issues.push("風之護盾防禦百分比效果缺失");
 if((Object.values(DB.skill_pools||{}).flat()).some(s=>s.kind==="輔助"&&["","獲得戰鬥增益"].includes(String(s.effect_text||""))))issues.push("存在無具體效果的輔助技能");

 if(DB.team_carry_system?.version!=="TEAM-CARRY-1.0")issues.push("TEAM-CARRY-1.0缺失");
 if(typeof teammateCarryProfile!=="function"||typeof companionCarryProfile!=="function"||typeof sharedCarryCapacityBonus!=="function")issues.push("同行負重runtime缺失");
 else{
   for(const t of (DB.party_member_templates||[]))if(!(teammateCarryProfile(t,{level:Math.max(1,t.min_player_level||1),bond:0}).bonus>0))issues.push(`隊友負重設定異常:${t.id}`);
   for(const sp of (DB.companion_species||[])){
     const p=companionCarryProfile(sp,{level:Math.max(1,sp.min_owner_level||1),bond:0});
     if(sp.companion_kind==="summon"&&p.bonus!==0)issues.push(`召喚獸錯誤提供常駐負重:${sp.id}`);
     if(["pet","contract"].includes(sp.companion_kind)&&!(p.bonus>0))issues.push(`寵物負重設定異常:${sp.id}`)
   }
 }

 if(DB.inventory_organization_system?.version!=="INVENTORY-ORGANIZE-2.0")issues.push("INVENTORY-ORGANIZE-2.0缺失");
 if(DB.modal_scroll_preservation_system?.version!=="MODAL-SCROLL-PRESERVE-1.0")issues.push("MODAL-SCROLL-PRESERVE-1.0缺失");
 if(inventoryCategory(item("I-BREAD")).key!=="食物")issues.push("黑麵包未歸入食物");
 if(inventoryCategory(item("I-RAWMEAT")).key!=="食材")issues.push("生肉未歸入食材");
 if(typeof captureModalScrollState!=="function"||typeof restoreModalScrollState!=="function")issues.push("視窗捲動保存runtime缺失");

 if(DB.crafting_effect_display_system?.version!=="CRAFT-EFFECT-DISPLAY-1.0")issues.push("CRAFT-EFFECT-DISPLAY-1.0缺失");
 if(typeof craftEffectText!=="function"||typeof craftResultLine!=="function")issues.push("製作成品效果顯示runtime缺失");
 const roast=item("F-ROASTMEAT");
 if(!roast||Number(roast.use?.hunger)!==-30)issues.push("烤肉飢餓效果不是-30");
 if(roast&&!craftResultLine(roast).includes("降低飢餓30"))issues.push("烤肉製作描述未顯示降低飢餓30");

 const orgBonusIds=new Set(),discBonusIds=new Set(),supportedAffBonusKeys=new Set(["buy_price_pct","sell_price_pct","craft_success","quest_reward_pct","attack_pct","magic_attack_pct","defense_pct","magic_defense_pct","accuracy","evasion","critRate","attack_speed_pct","cast_speed_pct","initiative_pct","statusResist","statusAccuracy","perception","stealth","carryCapacity","healingPower","manaRegen","moveSpeed","blockRate","armorPenPct","magicPenPct","lootRate","summonPower","critDamage"]);
 for(const o of (DB.world_organizations||[])){const b=o.member_bonus;if(!b?.id||!b?.text||!b?.effects)issues.push(`組織加成缺失:${o.name}`);else{if(orgBonusIds.has(b.id))issues.push(`組織加成ID重複:${b.id}`);orgBonusIds.add(b.id);for(const k of Object.keys(b.effects))if(!supportedAffBonusKeys.has(k))issues.push(`組織加成未接runtime:${o.name}/${k}`)}}
 for(const d of (DB.discipline_factions||[])){const b=d.member_bonus;if(!b?.id||!b?.text||!b?.effects)issues.push(`流派加成缺失:${d.name}`);else{if(discBonusIds.has(b.id))issues.push(`流派加成ID重複:${b.id}`);discBonusIds.add(b.id);for(const k of Object.keys(b.effects))if(!supportedAffBonusKeys.has(k))issues.push(`流派加成未接runtime:${d.name}/${k}`)}}
 if(DB.organization_bonus_system?.version!=="ORG-BONUS-1.0"||DB.organization_bonus_system?.membership_limit!==1)issues.push("ORG-BONUS-1.0規則缺失");
 if(DB.discipline_bonus_system?.version!=="DISC-BONUS-1.0"||DB.discipline_bonus_system?.membership_limit!==1)issues.push("DISC-BONUS-1.0規則缺失");
 if(orgState().memberships.length>1)issues.push("角色同時加入超過1個組織");
 if(disciplineState().membershipId&&!disciplineFor(disciplineState().membershipId))issues.push("角色正式流派引用缺失");
 const merchantBonus=worldOrg("ORG-056")?.member_bonus?.effects||{};
 if(merchantBonus.buy_price_pct!==-10||merchantBonus.sell_price_pct!==-10)issues.push("金衡跨陸商會交易加成錯誤");
 if(disciplineFor("DSC-PHY-21")?.member_bonus?.effects?.accuracy!==10)issues.push("青嵐一刀流命中加成錯誤");
 if(disciplineFor("DSC-PHY-24")?.member_bonus?.effects?.initiative_pct!==10)issues.push("月影拔劍會先攻加成錯誤");

 if(DB.guild_cross_skill_layout_system?.version!=="GUILD-CROSS-SKILL-LAYOUT-1.0")issues.push("GUILD-CROSS-SKILL-LAYOUT-1.0缺失");
 if(DB.hard_rules?.guild_cross_skills_grouped_physical_magic!==true)issues.push("跨職技能物理／魔法分區規則缺失");
 if(DB.ui_runtime_system?.version!=="UI-RUNTIME-1.0")issues.push("UI-RUNTIME-1.0缺失");
 if(typeof setUIHTML!=="function"||typeof inventoryQuantityMap!=="function"||typeof trapOverlayFocus!=="function"||typeof renderSaveHealth!=="function")issues.push("介面runtime重構核心缺失");
 return issues
}
function runAudit(){
 const politicalRepair=normalizePoliticalStandingState();
 const c=G.character,issues=[];
 if(Object.keys(c.equipment).length!==8)issues.push("8裝備欄異常");
 if(c.subjobs.length>2)issues.push("副職業超過2");
 if(c.skills.length>10)issues.push("技能超過10");if(c.adventureParty&&(1+(c.adventureParty.members||[]).length<2||1+(c.adventureParty.members||[]).length>5))issues.push("冒險團總人數超出2–5");
 if((c.talents||[]).length>2)issues.push("天賦超過2");
 if(c.level<1||c.level>99)issues.push("角色等級超出1–99");
 if((c.classMastery||0)<0||(c.classMastery||0)>100)issues.push("職業熟練異常");
 if(DB.subjob_progression_system?.version!=="SUBJOB-PROGRESSION-2.0")issues.push("SUBJOB-PROGRESSION-2.0缺失");
 if(typeof subjobUpgradeState!=="function"||typeof upgradeSubjob!=="function")issues.push("副職業升級runtime缺失");
 for(const j of (c.subjobs||[])){if(!SUBJOB_GRADES.includes(j.grade))issues.push(`副職業階級異常:${j.id}/${j.grade}`);if(!Number.isFinite(Number(j.xp))||Number(j.xp)<0)issues.push(`副職業XP異常:${j.id}/${j.xp}`)}
 if(mainIsTwoHanded()&&offhandEquip())issues.push("雙手武器與副手裝備衝突");
 const auditOff=offhandEquip()&&item(equipId(offhandEquip()));if(auditOff&&!offhandEligible(auditOff))issues.push(`副手裝備不合法:${auditOff.name}`);
 for(const {eq} of equippedEntries())if(eq&&(eq.durability<0||eq.durability>eq.maxDurability))issues.push("裝備耐久異常");
 const caps=resourceCaps();if(c.maxHp!==caps.hp||c.maxStamina!==caps.stamina||c.maxMana!==caps.mana)issues.push("資源上限未同步");
 const hydrationItems=(DB.items||[]).filter(d=>Number(d?.use?.thirst)<0);
 const everydayHydration=hydrationItems.filter(d=>tierOrder(d.tier||"F")<=tierOrder("E")&&(d.acquisition_sources||[]).some(s=>["shop","cook","craft"].includes(s)));
 if(hydrationItems.length<24)issues.push(`補水食物／飲品總量不足:${hydrationItems.length}`);
 if(everydayHydration.length<10)issues.push(`低階日常補水來源不足:${everydayHydration.length}`);
 issues.push(...runGeneratorAudit());
 G.lastAudit={turn:G.turn,time:timeText(),issues,repairs:politicalRepair.repairs||[]};
 log("五回合自檢",issues.length?issues.join("、"):"通過：世界觀、HISTORY-2.0世界史、大陸政治體、海外未知邊界、權力層級、S級戰力名錄、武技／魔法流派、文化、角色、職業技能、裝備製作、地圖生態、夥伴隊伍、信仰組織、對話情報、委託來源、跨庫索引、INTEGRATION-3.0、ORCHESTRATOR-3.0、CURRENT現行引擎、生成器與管理AI一致。",issues.length?"danger":"ok")
}
let modalLastFocus=null;
function modalKindFromTitle(t){
 const s=String(t||"");
 if(s.includes("角色"))return "character";
 if(s.includes("背包"))return "inventory";
 if(s.includes("裝備")||s.includes("修理"))return "equipment";
 if(s.includes("委託"))return "quest";
 if(s.includes("地圖")||s.includes("移動"))return "map";
 if(s.includes("設定")||s.includes("遊戲更新"))return "settings";
 if(s.includes("技能")||s.includes("職業")||s.includes("訓練"))return "training";
 if(s.includes("製作")||s.includes("鍛造")||s.includes("裁縫")||s.includes("煉金"))return "craft";
 if(s.includes("商店")||s.includes("購買")||s.includes("出售"))return "shop";
 return "general"
}
function modalIconForKind(k){
 return {character:"♟",inventory:"▣",equipment:"⚔",quest:"✦",map:"⌖",settings:"⚙",training:"✧",craft:"◇",shop:"¤",general:"◆"}[k]||"◆"
}
let modalHistory=[];
let modalFallbackBackCode=null;
let modalCurrentRefreshCode=null;
let modalRestoring=false;
function modalBackLabel(text){
 const label=String(text||"").replace(/<[^>]+>/g,"").replace(/&larr;/gi,"←").replace(/\s+/g," ").trim().replace(/^←\s*/,"");
 return label==="上一頁"||label==="回上一頁"||label.startsWith("返回");
}
function extractModalNavigation(html){
 let fallbackCode=null;
 let cleaned=String(html??"").replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi,(full,attrs,labelHtml)=>{
   if(!modalBackLabel(labelHtml))return full;
   const mm=attrs.match(/\bonclick\s*=\s*(["'])([\s\S]*?)\1/i);
   if(!fallbackCode&&mm)fallbackCode=mm[2];
   return "";
 });
 cleaned=cleaned.replace(/<div\s+class=(["'])actions\1\s*>\s*<\/div>/gi,"");
 return {html:cleaned,fallbackCode};
}

function modalScrollElementKey(el,index){
 if(!el)return `scroll:${index}`;
 if(el.id)return `id:${el.id}`;
 if(el.dataset?.scrollKey)return `data-scroll:${el.dataset.scrollKey}`;
 if(el.dataset?.intelSource)return `intel:${el.dataset.intelSource}`;
 const cls=String(el.className||"").trim().split(/\s+/).filter(Boolean).slice(0,3).join(".");
 return `${String(el.tagName||"el").toLowerCase()}:${cls}:${index}`
}
function modalScrollableElements(body){
 if(!body||typeof body.querySelectorAll!=="function")return [];
 return [...new Set(body.querySelectorAll("[data-scroll-key],[data-intel-source],.rulebox,.intel-archive-scroll"))]
}
function captureModalScrollState(){
 const modal=document.querySelector("#modalBack .modal"),body=$("#modalBody"),nested=[];
 if(body){
   const els=modalScrollableElements(body);
   els.forEach((el,i)=>{
     const top=Number(el.scrollTop||0);
     if(top>0)nested.push({key:modalScrollElementKey(el,i),index:i,top})
   })
 }
 return {modalTop:Number(modal?.scrollTop||0),bodyTop:Number(body?.scrollTop||0),nested}
}
function restoreModalScrollState(state){
 if(!state)return;
 const modal=document.querySelector("#modalBack .modal"),body=$("#modalBody");
 if(modal)modal.scrollTop=Math.max(0,Number(state.modalTop||0));
 if(body)body.scrollTop=Math.max(0,Number(state.bodyTop||0));
 if(body&&Array.isArray(state.nested)){
   const els=modalScrollableElements(body),byKey=new Map();
   els.forEach((el,i)=>byKey.set(modalScrollElementKey(el,i),el));
   for(const s of state.nested){
     const el=byKey.get(s.key)||els[s.index];
     if(el)el.scrollTop=Math.max(0,Number(s.top||0))
   }
 }
}
function captureModalPage(){
 const modal=document.querySelector("#modalBack .modal");
 const title=$("#modalTitle")?.textContent||"";return {title,bodyHTML:$("#modalBody")?.innerHTML||"",kind:modal?.dataset?.kind||"default",fallbackCode:modalFallbackBackCode,refreshCode:modalCurrentRefreshCode,scrollState:captureModalScrollState(),characterDockContext,characterDockActiveKey:title==="角色"?null:characterDockActiveKey};
}
function updateModalBackButton(){
 const btn=$("#modalBackBtn");if(!btn)return;
 btn.textContent="←";
 btn.setAttribute("aria-label",(modalHistory.length||modalFallbackBackCode)?"回上一頁":"返回遊戲畫面");
 btn.title=(modalHistory.length||modalFallbackBackCode)?"回到上一層彈出頁面":"返回遊戲畫面";
}
function restoreModalPage(state){
 if(!state)return false;
 const back=$("#modalBack"),modal=document.querySelector("#modalBack .modal"),body=$("#modalBody");
 $("#modalTitle").textContent=state.title||"";
 $("#modalIcon").textContent=modalIconForKind(state.kind||modalKindFromTitle(state.title||""));
 body.innerHTML=normalizeUIButtonTypes(state.bodyHTML||"");UI_HTML_CACHE.delete(body);
 modalFallbackBackCode=state.fallbackCode||null;
 modalCurrentRefreshCode=state.refreshCode||null;
 characterDockContext=!!state.characterDockContext;characterDockActiveKey=state.characterDockActiveKey||null;
 if(modal){modal.dataset.kind=state.kind||modalKindFromTitle(state.title||"");modal.scrollTop=0}
 body.scrollTop=0;back.classList.remove("hide");document.body.classList.add("modal-open");
 updateModalBackButton();syncCharacterDock();
 if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>{restoreModalScrollState(state.scrollState);$("#modalBackBtn")?.focus({preventScroll:true})});
 return true
}
function modalGoBack(){
 if(modalHistory.length){
   const state=modalHistory.pop();
   if(state?.refreshCode){
     modalRestoring=true;
     try{Function(state.refreshCode).call(window);if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>restoreModalScrollState(state.scrollState))}
     catch(err){console.error("modal dynamic back refresh failed",err);restoreModalPage(state)}
     finally{modalRestoring=false}
     updateModalBackButton();return
   }
   restoreModalPage(state);return
 }
 if(modalFallbackBackCode){
   const code=modalFallbackBackCode;modalFallbackBackCode=null;modalRestoring=true;
   try{Function(code).call(window)}catch(err){console.error("modal back navigation failed",err);closeModal();return}
   finally{modalRestoring=false}
   updateModalBackButton();return
 }
 closeModal()
}
function showModal(t,b,refreshCode=null){
 const back=$("#modalBack"),modal=document.querySelector("#modalBack .modal"),body=$("#modalBody"),kind=modalKindFromTitle(t);
 const wasOpen=!back.classList.contains("hide"),oldTitle=$("#modalTitle")?.textContent||"";
 const samePage=wasOpen&&oldTitle===String(t||"");
 const preservedScroll=samePage?captureModalScrollState():null;
 modalLastFocus=document.activeElement;
 if(wasOpen&&!modalRestoring&&!samePage)modalHistory.push(captureModalPage());
 else if(!wasOpen){modalHistory=[];modalFallbackBackCode=null;modalCurrentRefreshCode=null}
 const nav=extractModalNavigation(b);modalFallbackBackCode=nav.fallbackCode;
 modalCurrentRefreshCode=refreshCode||null;
 setUIText($("#modalTitle"),t);setUIText($("#modalIcon"),modalIconForKind(kind));body.innerHTML=normalizeUIButtonTypes(nav.html);UI_HTML_CACHE.delete(body);
 if(modal){modal.dataset.kind=kind;if(!samePage)modal.scrollTop=0}
 if(!samePage)body.scrollTop=0;
 back.classList.remove("hide");document.body.classList.add("modal-open");
 updateModalBackButton();syncCharacterDock();
 if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>{
   if(samePage)restoreModalScrollState(preservedScroll);
   else $("#modalBackBtn")?.focus({preventScroll:true})
 })
}
function closeModal(){const back=$("#modalBack");back.classList.add("hide");document.body.classList.remove("modal-open");modalHistory=[];modalFallbackBackCode=null;modalCurrentRefreshCode=null;modalRestoring=false;characterDockContext=false;characterDockActiveKey=null;syncCharacterDock();if(modalLastFocus&&typeof modalLastFocus.focus==="function")modalLastFocus.focus();modalLastFocus=null;syncBodyScrollLock()}

function backClose(e){if(e.target.id==="modalBack")closeModal()}
function activeOverlayDialog(){
 const skill=$("#battleSkillPopup");if(skill&&!skill.classList.contains("hide"))return skill.querySelector('[role="dialog"]');
 const modal=$("#modalBack");if(modal&&!modal.classList.contains("hide"))return modal.querySelector('[role="dialog"]');
 const battle=$("#battleBack");if(battle&&!battle.classList.contains("hide"))return battle.querySelector('[role="dialog"]');
 return null
}
function trapOverlayFocus(e){
 if(e.key!=="Tab")return;const dialog=activeOverlayDialog();if(!dialog)return;
 const focusable=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el=>el.getAttribute("aria-hidden")!=="true");
 if(!focusable.length){e.preventDefault();dialog.focus?.({preventScroll:true});return}
 const first=focusable[0],last=focusable.at(-1),active=document.activeElement;
 if(e.shiftKey&&(active===first||!dialog.contains(active))){e.preventDefault();last.focus({preventScroll:true})}
 else if(!e.shiftKey&&(active===last||!dialog.contains(active))){e.preventDefault();first.focus({preventScroll:true})}
}
document.addEventListener("keydown",e=>{
 trapOverlayFocus(e);
 if(e.key!=="Escape")return;
 if(!$("#battleSkillPopup").classList.contains("hide")){closeBattleSkillPopup();return}
 if(!$("#modalBack").classList.contains("hide")&&!G?.battle?.active)closeModal()
})

const WEB_UPDATE={
 manifest:"https://raw.githubusercontent.com/alanyen-git/qunlu-game-web/main/version.json",
 checking:false,
 available:null,
 timer:null
};
function parseVersionNumber(v){
 const m=String(v||"").match(/(\d+)\.(\d+)\.(\d+)/);
 return m?m.slice(1).map(Number):[0,0,0]
}
function compareGameVersion(a,b){
 const A=parseVersionNumber(a),B=parseVersionNumber(b);
 for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]-B[i]}
 return 0
}
function localGameVersion(){return DB?.meta?.current_version||"CURRENT-0.0.0"}
function updateBannerHtml(info){
 const el=document.querySelector("#gameUpdateBanner");if(!el)return;
 if(!info){el.classList.add("hide");el.innerHTML="";return}
 el.innerHTML=`<b>發現新版本 ${info.version}</b><span>${info.summary||"遊戲已更新"}<br><small>來源：GitHub</small></span><button type="button" onclick="applyGameUpdate()">更新遊戲</button>`;
 el.classList.remove("hide")
}
async function saveUpdateBackup(targetVersion){
 try{
   const raw=JSON.stringify(G);
   if(!raw)return null;
   const stamp=new Date().toISOString().replace(/[:.]/g,"-");
   const key=`chronicle_save_backup_${localGameVersion()}_to_${targetVersion}_${stamp}`;
   await saveDbPut(key,raw);
   let index=await saveDbGet(SAVE_BACKUP_INDEX_KEY);
   if(!Array.isArray(index))index=[];
   index.unshift({key,from:localGameVersion(),to:targetVersion,time:new Date().toISOString()});
   while(index.length>5){const old=index.pop();if(old?.key)await saveDbDelete(old.key)}
   await saveDbPut(SAVE_BACKUP_INDEX_KEY,index);
   return key
 }catch(e){console.warn("update backup failed",e);return null}
}
async function checkForGameUpdate(manual=false){
 if(WEB_UPDATE.checking)return null;
 WEB_UPDATE.checking=true;
 try{
   const bridge=globalThis.QUNLU_NATIVE_UPDATE;
   let info=null;
   if(bridge?.isNative&&typeof bridge.check==="function") info=await bridge.check();
   else{
    const sep=WEB_UPDATE.manifest.includes("?")?"&":"?";
    const res=await fetch(`${WEB_UPDATE.manifest}${sep}t=${Date.now()}`,{cache:"no-store"});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    info=await res.json();
   }
   const hasUpdate=info?.available===false?false:compareGameVersion(info?.version,localGameVersion())>0;
   if(hasUpdate){
     WEB_UPDATE.available=info;updateBannerHtml(info);
     if(manual)showModal("遊戲更新",`<div class="card"><b>${info.version}</b><br>${info.summary||""}<br><span class="small">來源：GitHub<br>${(info.changelog||[]).join("<br>")}</span></div><div class="actions"><button class="good" onclick="applyGameUpdate()">備份存檔並下載</button><button onclick="closeModal()">稍後</button></div>`);
     return info
   }
   WEB_UPDATE.available=null;updateBannerHtml(null);
   if(manual)showModal("遊戲更新",`<div class="card ok">目前已是最新版：${localGameVersion()}<br><span class="small">已連線 GitHub 檢查版本。</span></div>`);
   return null
 }catch(e){
   console.warn("version check failed",e);
   if(manual)showModal("遊戲更新",`<div class="card warnText">目前無法連線檢查新版；不影響離線中的本地存檔。</div>`);
   return null
 }finally{WEB_UPDATE.checking=false}
}
async function applyGameUpdate(){
 const info=WEB_UPDATE.available;if(!info)return;
 try{persist();await flushPersistWrites()}catch(e){}
 await saveUpdateBackup(info.version);
 const bridge=globalThis.QUNLU_NATIVE_UPDATE;
 if(bridge?.isNative&&typeof bridge.apply==="function"){
  try{
   const result=await bridge.apply(info);
   WEB_UPDATE.available=null;updateBannerHtml(null);closeModal();
   showModal("更新已下載",`<div class="card ok">${result?.version||info.version} 已下載完成，將在遊戲進入背景或下次啟動時套用。當前遊戲不會被中斷。</div>`);
  }catch(e){
   console.warn("native game update failed",e);
   showModal("遊戲更新",`<div class="card warnText">更新下載失敗，請確認網路後再試；目前遊戲與存檔仍可繼續使用。</div>`);
  }
  return
 }
 const u=new URL(location.href);
 if(location.origin!=="https://alanyen-git.github.io"){
  const target=new URL("https://alanyen-git.github.io/qunlu-game-web/");
  target.search=u.search;
  target.hash=u.hash;
  target.searchParams.set("v",String(info.build||Date.now()));
  location.replace(target.toString());
  return
 }
 u.searchParams.set("v",String(info.build||Date.now()));
 location.replace(u.toString())
}
function initWebUpdate(){
 WEB_UPDATE.available=null;updateBannerHtml(null);
 if(WEB_UPDATE.timer){clearInterval(WEB_UPDATE.timer);WEB_UPDATE.timer=null}
 let protocol="";
 try{protocol=new URL(location.href).protocol}catch(e){}
 if(!/^https?:$/.test(protocol))return null;
 return null
}

window.addEventListener("load",async()=>{await init();initWebUpdate()},{once:true});
