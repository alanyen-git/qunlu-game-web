/* 群陸旅誌：活世界共同循環／阿斯戴爾相容入口 CURRENT-1.75.0
 * LIVE-WORLD-LOOP-1.0
 * 世界事件鏈＋城鎮狀態＋傳聞調查＋NPC反應的共同底層。
 * 新劇情／委託／怪物／生產內容只要進入既有 runtime，就會自動留下活世界脈絡。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.75.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.75.0";
const REV="LIVE-WORLD-LOOP-1.0";
const CFG=Object.freeze({
 heartbeat_ms:30000,
 event_limit:140,
 journal_limit:80,
 rumor_limit:80,
 seen_limit:320,
 town_history_limit:30,
 investigation_hours:.5,
 production_event_threshold:3,
 monster_event_threshold:3
});
const DIMENSIONS=["safety","supply","stability","prosperity","knowledge","ecology"];
const LABEL={safety:"治安",supply:"供應",stability:"秩序",prosperity:"繁榮",knowledge:"情報",ecology:"生態"};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Number(v||0)));
const arr=v=>Array.isArray(v)?v:[];
const uniq=a=>[...new Set(arr(a).filter(Boolean))];
const nowHour=()=>{try{return typeof totalHours==="function"?Number(totalHours()||0):0}catch(error){return 0}};
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const locationBy=id=>{try{return typeof loc==="function"?loc(id):(DB.locations||[]).find(x=>x?.id===id)||null}catch(error){return (DB.locations||[]).find(x=>x?.id===id)||null}};
const itemBy=id=>{try{return typeof item==="function"?item(id):(DB.items||[]).find(x=>x?.id===id)||null}catch(error){return (DB.items||[]).find(x=>x?.id===id)||null}};
const questBy=id=>(DB.quest_templates||[]).find(x=>x?.id===id)||null;
const eventBy=id=>(DB.adventure_event_templates||[]).find(x=>x?.id===id)||null;
const monsterBy=id=>(DB.monsters||[]).find(x=>x?.id===id)||null;
const townKinds=new Set(["town","city","village","capital","port","settlement"]);
function game(){try{return typeof G!=="undefined"?G:null}catch(error){return null}}
function state(){
 const g=game();if(!g)return null;
 g.worldState=g.worldState||{};
 let s=g.worldState.liveWorld;
 if(!s||typeof s!=="object")s=g.worldState.liveWorld={};
 s.revision=REV;
 s.completedQuestTemplates=arr(s.completedQuestTemplates);
 s.flags=s.flags&&typeof s.flags==="object"?s.flags:{};
 s.localStates=s.localStates&&typeof s.localStates==="object"?s.localStates:{};
 s.townStates=s.townStates&&typeof s.townStates==="object"?s.townStates:{};
 s.eventChains=s.eventChains&&typeof s.eventChains==="object"?s.eventChains:{};
 s.investigations=s.investigations&&typeof s.investigations==="object"?s.investigations:{};
 s.eventOutcomes=s.eventOutcomes&&typeof s.eventOutcomes==="object"?s.eventOutcomes:{};
 s.contentIndex=s.contentIndex&&typeof s.contentIndex==="object"?s.contentIndex:{};
 s.productionLedger=s.productionLedger&&typeof s.productionLedger==="object"?s.productionLedger:{};
 s.monsterLedger=s.monsterLedger&&typeof s.monsterLedger==="object"?s.monsterLedger:{};
 s.events=arr(s.events);s.rumors=arr(s.rumors);s.journal=arr(s.journal);s.seenExternalEvents=arr(s.seenExternalEvents);
 migrateLegacy(s);
 recoverQuestHistory(s);
 return s
}
function migrateLegacy(s){
 if(s.legacyMigrated)return;
 const old=game()?.worldState?.asdailNarrative;
 if(old&&typeof old==="object"){
   s.completedQuestTemplates=uniq([...s.completedQuestTemplates,...arr(old.completedQuestTemplates)]);
   Object.assign(s.flags,old.flags||{});
   Object.assign(s.localStates,old.localStates||{});
   Object.assign(s.eventOutcomes,old.eventOutcomes||{});
   for(const x of arr(old.journal).slice().reverse())pushJournalRaw(s,{...x,source:x.source||"legacy_asdail"});
 }
 s.legacyMigrated=true;
}
function mirrorLegacy(s=state()){
 const g=game();if(!g||!s)return;
 const old=g.worldState.asdailNarrative||(g.worldState.asdailNarrative={});
 old.revision="ASDAIL-NARRATIVE-RUNTIME-2.0";
 old.completedQuestTemplates=[...s.completedQuestTemplates];
 old.flags={...s.flags};old.localStates={...s.localStates};old.eventOutcomes={...s.eventOutcomes};
 old.threadUpdates=old.threadUpdates&&typeof old.threadUpdates==="object"?old.threadUpdates:{};
 old.journal=s.journal.filter(x=>!x.regionId||x.regionId==="REG-ASD-01").slice(0,30);
 old.historyRecovered=true;
}
function recoverQuestHistory(s){
 if(s.questHistoryRecovered)return;
 for(const h of arr(game()?.questHistory)){
   if(h?.status!=="完成")continue;
   for(const q of DB.quest_templates||[]){
     if(h.name===q?.name||String(h.id||"").includes(String(q?.id||""))){
       if(q?.id&&!s.completedQuestTemplates.includes(q.id))s.completedQuestTemplates.push(q.id);
     }
   }
 }
 s.questHistoryRecovered=true;
}
function descriptor(row){
 if(!row)return null;
 if(row.live_world&&typeof row.live_world==="object")return row.live_world;
 const n=row.narrative;if(!n||typeof n!=="object")return null;
 return {
   chain_id:n.chain_id||n.thread_id||null,
   stage:n.stage??null,
   requires_quests:arr(n.requires_quests),
   requires_flags:arr(n.requires_flags),
   completion_flags:arr(n.completion_flags),
   success_flag:n.success_flag||null,
   failure_flag:n.failure_flag||null,
   local_state:n.local_state||n.event_state||null,
   aftermath:n.aftermath||"",
   town_effects:n.town_effects||null,
   rumor:n.rumor||null
 };
}
function chainRows(){
 const direct=arr(DB.live_world_event_chains);
 const legacy=arr(DB.asdail_narrative_threads).map(x=>({...x,source:"asdail"}));
 const out=[],seen=new Set();
 for(const x of [...direct,...legacy])if(x?.id&&!seen.has(x.id)){seen.add(x.id);out.push(x)}
 return out
}
function completed(id){return !!id&&state()?.completedQuestTemplates.includes(id)}
function questGate(t){
 const d=descriptor(t);if(!d)return {ok:true,missing:[],missingFlags:[]};
 const s=state(),missing=arr(d.requires_quests).filter(id=>!completed(id)),missingFlags=arr(d.requires_flags).filter(id=>!s?.flags?.[id]);
 return {ok:missing.length===0&&missingFlags.length===0,missing,missingFlags}
}
function settlementFor(locationId){
 const l=locationBy(locationId);if(!l)return null;
 if(townKinds.has(String(l.kind||"").toLowerCase()))return l;
 const links=arr(l.links).map(x=>locationBy(x?.to)).filter(Boolean);
 const linked=links.find(x=>townKinds.has(String(x.kind||"").toLowerCase()));if(linked)return linked;
 const province=l.province_id,region=l.world_region_id||l.region_id;
 return (DB.locations||[]).find(x=>townKinds.has(String(x?.kind||"").toLowerCase())&&province&&x?.province_id===province)
   ||(DB.locations||[]).find(x=>townKinds.has(String(x?.kind||"").toLowerCase())&&region&&(x?.world_region_id||x?.region_id)===region)
   ||l
}
function ensureTown(locationId){
 const s=state(),town=settlementFor(locationId);if(!s||!town)return null;
 let t=s.townStates[town.id];
 if(!t||typeof t!=="object")t=s.townStates[town.id]={locationId:town.id,name:town.name||town.id,history:[],updatedHour:nowHour()};
 for(const k of DIMENSIONS)if(!Number.isFinite(Number(t[k])))t[k]=50;
 t.history=arr(t.history);return t
}
function townState(locationId){return ensureTown(locationId)}
function pushJournalRaw(s,row){
 s.journal.unshift(row);if(s.journal.length>CFG.journal_limit)s.journal.length=CFG.journal_limit
}
function pushJournal(kind,title,text,meta={}){
 const s=state();if(!s)return;
 pushJournalRaw(s,{id:`LWJ-${Math.round(nowHour()*100)}-${Math.random().toString(36).slice(2,7)}`,hour:nowHour(),turn:game()?.turn||0,kind,title,text,...meta})
}
function applyTownDelta(locationId,deltas={},reason="",meta={}){
 const t=ensureTown(locationId);if(!t)return null;
 const before={};for(const k of DIMENSIONS)before[k]=Number(t[k]);
 for(const k of DIMENSIONS)if(Number.isFinite(Number(deltas[k])))t[k]=Math.round(clamp(Number(t[k])+Number(deltas[k]))*10)/10;
 const changed=DIMENSIONS.some(k=>before[k]!==t[k]);
 if(changed){
   t.updatedHour=nowHour();t.history.unshift({hour:nowHour(),reason,deltas:{...deltas},...meta});
   if(t.history.length>CFG.town_history_limit)t.history.length=CFG.town_history_limit;
 }
 return t
}
function defaultTownEffects(type,data={}){
 const map={
   quest_complete:{stability:2,knowledge:2,safety:1,prosperity:1},
   adventure_success:{knowledge:2,stability:1,safety:1},
   adventure_failure:{knowledge:1,stability:-1,safety:-1},
   caravan_arrival:{supply:4,prosperity:2},
   caravan_incident:{supply:-3,stability:-1},
   resource_depleted:{supply:-3,ecology:-2},
   dungeon_occupation:{safety:-4,stability:-2},
   monster_pressure_reduced:{safety:1,ecology:-.4},
   production:{supply:1,prosperity:1},
   rumor_verified:{knowledge:2,stability:.5}
 };
 const base={...(map[type]||{})};
 if(data?.townEffects&&typeof data.townEffects==="object")Object.assign(base,data.townEffects);
 return base
}
function locationFrom(row,data={}){
 return data.locationId||data.location_id||row?.location_id||row?.objective?.location_id||arr(row?.recommended_locations)[0]||game()?.character?.locationId||null
}
function regionFor(locationId){
 const l=locationBy(locationId);return l?.world_region_id||l?.region_id||null
}
function confidenceFor(type,data={}){
 if(Number.isFinite(Number(data.confidence)))return clamp(Number(data.confidence),.05,1);
 if(/quest_complete|rumor_verified/.test(type))return .92;
 if(/adventure_success|caravan_arrival/.test(type))return .84;
 if(/resource_depleted|dungeon_occupation|caravan_incident/.test(type))return .78;
 if(/adventure_failure/.test(type))return .52;
 return .64
}
function publishRumor(input={}){
 const s=state();if(!s)return null;
 const locationId=input.locationId||game()?.character?.locationId||null,regionId=input.regionId||regionFor(locationId);
 const sourceId=String(input.sourceId||input.eventId||input.id||"");
 const existing=sourceId?s.rumors.find(x=>x.sourceId===sourceId&&x.sourceType===String(input.sourceType||"event")):null;
 const confidence=confidenceFor(String(input.type||""),input);
 if(existing){
   existing.confidence=Math.max(Number(existing.confidence||0),confidence);
   existing.lastUpdatedHour=nowHour();existing.text=input.text||existing.text;return existing
 }
 const r={
   id:input.id||`RUM-LW-${Math.round(nowHour()*100)}-${Math.random().toString(36).slice(2,8)}`,
   title:String(input.title||"地方傳聞"),
   text:String(input.text||input.summary||"有一件尚待確認的地方消息。"),
   locationId,regionId,chainId:input.chainId||null,
   confidence,status:confidence>=.86?"verified":confidence>=.68?"credible":"unverified",
   sourceType:String(input.sourceType||"event"),sourceId,
   createdHour:nowHour(),lastUpdatedHour:nowHour(),evidence:arr(input.evidence)
 };
 s.rumors.unshift(r);if(s.rumors.length>CFG.rumor_limit)s.rumors.length=CFG.rumor_limit;
 return r
}
function forwardNpcEvent(e){
 const g=game();if(!g?.worldState)return;
 const w=g.worldState.worldAutonomy2;if(!w||!Array.isArray(w.events))return;
 if(w.events.some(x=>x?.data?.liveWorldEventId===e.id))return;
 w.events.unshift({
   id:"LW-NPC-"+e.id,hour:e.hour,time:typeof timeText==="function"?timeText():"",
   type:"live_world_"+e.type,summary:e.summary,
   data:{...(e.data||{}),liveWorldForwarded:true,liveWorldEventId:e.id}
 });
 if(w.events.length>80)w.events.length=80;
 try{if(typeof globalThis.npcDepth2Heartbeat==="function")globalThis.npcDepth2Heartbeat("live-world")}catch(error){}
}
function emit(type,summary,data={},opt={}){
 const s=state();if(!s)return null;
 const locationId=data.locationId||data.location_id||game()?.character?.locationId||null;
 const e={
   id:opt.id||`LWE-${Math.round(nowHour()*100)}-${Math.random().toString(36).slice(2,8)}`,
   hour:nowHour(),turn:game()?.turn||0,type:String(type||"world_event"),summary:String(summary||"世界狀態發生變化。"),
   locationId,regionId:data.regionId||regionFor(locationId),chainId:data.chainId||null,data:{...data}
 };
 s.events.unshift(e);if(s.events.length>CFG.event_limit)s.events.length=CFG.event_limit;
 const effects=opt.townEffects||defaultTownEffects(e.type,data);
 if(locationId&&Object.keys(effects).length)applyTownDelta(locationId,effects,e.summary,{eventId:e.id,type:e.type});
 if(opt.journal!==false)pushJournal("event",data.title||e.type,e.summary,{eventId:e.id,locationId:e.locationId,regionId:e.regionId,chainId:e.chainId});
 if(opt.rumor!==false&&confidenceFor(e.type,data)>=.5){
   publishRumor({title:data.rumorTitle||data.title||"地方消息",text:data.rumorText||e.summary,locationId:e.locationId,regionId:e.regionId,chainId:e.chainId,sourceType:"event",sourceId:e.id,type:e.type,confidence:data.confidence});
 }
 if(opt.forwardNpc!==false)forwardNpcEvent(e);
 return e
}
function externalKey(e,index=0){return String(e?.id||`EXT-${Math.round(Number(e?.hour||0)*100)}-${index}-${e?.type||""}-${String(e?.summary||"").slice(0,48)}`)}
function ingestExternalEvents(){
 const s=state(),g=game();if(!s||!g?.worldState)return false;
 let changed=false;const seen=new Set(s.seenExternalEvents);
 const pools=[
   {name:"autonomy",rows:arr(g.worldState.worldAutonomy2?.events)},
   {name:"integrated",rows:arr(g.worldState.integratedEvents)}
 ];
 for(const pool of pools){
   pool.rows.slice(0,100).reverse().forEach((e,i)=>{
     if(e?.data?.liveWorldForwarded)return;
     const key=pool.name+":"+externalKey(e,i);if(seen.has(key))return;
     seen.add(key);s.seenExternalEvents.unshift(key);changed=true;
     const type=String(e?.type||"world_event"),summary=String(e?.summary||e?.text||"世界事件更新。");
     const data={...(e?.data||{}),locationId:e?.locationId||e?.sourceId||e?.data?.locationId||null,sourceType:pool.name,confidence:confidenceFor(type,e?.data||{})};
     const effects=defaultTownEffects(type,data);
     if(data.locationId&&Object.keys(effects).length)applyTownDelta(data.locationId,effects,summary,{externalKey:key,type});
     if(/caravan|resource|dungeon|adventure|quest|weather|incident|occupation/.test(type)){
       publishRumor({title:"地方動態",text:summary,locationId:data.locationId,regionId:regionFor(data.locationId),sourceType:pool.name,sourceId:key,type,confidence:data.confidence});
     }
   });
 }
 if(s.seenExternalEvents.length>CFG.seen_limit)s.seenExternalEvents.length=CFG.seen_limit;
 return changed
}
function chainProgress(chain){
 const stages=arr(chain?.stages),done=stages.filter(completed),s=state();let next=null;
 for(const id of stages){
   if(completed(id))continue;const q=questBy(id);if(q&&questGate(q).ok){next=q;break}
 }
 const row=s.eventChains[chain.id]||(s.eventChains[chain.id]={id:chain.id});
 row.done=done.length;row.total=stages.length;row.nextQuestId=next?.id||null;row.completed=!!stages.length&&done.length===stages.length;row.updatedHour=nowHour();
 return {...row,next}
}
function syncChains(){for(const c of chainRows())chainProgress(c)}
function applyDescriptorCompletion(t,q){
 const d=descriptor(t),s=state();if(!s||!t)return;
 if(!s.completedQuestTemplates.includes(t.id))s.completedQuestTemplates.push(t.id);
 if(d){
   for(const flag of arr(d.completion_flags))s.flags[flag]={hour:nowHour(),questId:t.id};
   if(d.local_state&&typeof d.local_state==="object")Object.assign(s.localStates,d.local_state);
 }
 const locationId=locationFrom(t,{});
 const summary=d?.aftermath||`${t.name}已完成，地方狀態依成果更新。`;
 emit("quest_complete",summary,{title:t.name,questId:t.id,locationId,chainId:d?.chain_id||null,townEffects:d?.town_effects||undefined,confidence:.94,rumorTitle:t.name});
 if(d?.chain_id){
   const c=chainRows().find(x=>x.id===d.chain_id);if(c)chainProgress(c);
 }
 mirrorLegacy(s)
}
function recordAdventure(t,choice,success){
 const d=descriptor(t),s=state();if(!s||!t)return;
 s.eventOutcomes[t.id]={choice,success,hour:nowHour()};
 const flag=success===true?d?.success_flag:success===false?d?.failure_flag:null;
 if(flag)s.flags[flag]={hour:nowHour(),eventId:t.id,success};
 if(d?.local_state&&typeof d.local_state==="object")Object.assign(s.localStates,d.local_state);
 const locationId=locationFrom(t,{});
 const type=choice==="leave"?"adventure_ignored":success===true?"adventure_success":"adventure_failure";
 const lead=choice==="leave"?"未介入":success===true?"成功處理":"未成功處理";
 emit(type,`${t.name}：${lead}。 ${d?.aftermath||""}`.trim(),{title:t.name,eventTemplateId:t.id,locationId,chainId:d?.chain_id||null,confidence:choice==="leave"?.45:success?.82:.55,rumorTitle:t.name},{townEffects:d?.town_effects||undefined});
 mirrorLegacy(s)
}
function inventoryQty(id){return arr(game()?.character?.inventory).filter(x=>x?.id===id).reduce((n,x)=>n+Number(x?.qty||1),0)}
function recordProduction(itemId,qty,kind="production"){
 const d=itemBy(itemId);if(!d||qty<=0)return;
 const s=state(),locationId=game()?.character?.locationId||null,key=`${locationId||"world"}::${itemId}`;
 const row=s.productionLedger[key]||(s.productionLedger[key]={qty:0,lastEmitQty:0});row.qty+=qty;
 if(row.qty-row.lastEmitQty>=CFG.production_event_threshold||Number(qty)>=CFG.production_event_threshold){
   row.lastEmitQty=row.qty;
   emit("production",`${locationBy(locationId)?.name||"當地"}完成一批${d.name}生產，供應與工坊活動有所增加。`,{title:"生產動態",locationId,itemId,qty:row.qty,productionKind:kind,confidence:.9});
 }
}
function monsterIdFrom(data={}){return data.monsterId||data.monster_id||data.id||data.targetId||data.target_id||null}
function recordMonsterPressure(data={}){
 const s=state(),mid=monsterIdFrom(data),locationId=game()?.character?.locationId||data.locationId||null;if(!s||!locationId)return;
 const key=`${locationId}::${mid||"unknown"}`,row=s.monsterLedger[key]||(s.monsterLedger[key]={count:0,lastEmitCount:0});row.count+=Math.max(1,Number(data.qty||1));
 if(row.count-row.lastEmitCount>=CFG.monster_event_threshold){
   const m=monsterBy(mid);row.lastEmitCount=row.count;
   emit("monster_pressure_reduced",`${locationBy(locationId)?.name||"當地"}的${m?.name||"魔物"}活動受到壓制。`,{title:"魔物動態",locationId,monsterId:mid,count:row.count,confidence:.88});
 }
}
function refreshContentIndex(){
 const s=state();if(!s)return null;
 const next={
   quests:(DB.quest_templates||[]).length,
   narrativeQuests:(DB.quest_templates||[]).filter(x=>!!descriptor(x)).length,
   adventureEvents:(DB.adventure_event_templates||[]).length,
   narrativeEvents:(DB.adventure_event_templates||[]).filter(x=>!!descriptor(x)).length,
   monsters:(DB.monsters||[]).length,
   craftableItems:(DB.items||[]).filter(x=>x?.craft_recipe).length,
   cookingRecipes:(DB.recipes||[]).length,
   chains:chainRows().length,
   updatedHour:nowHour()
 };
 const changed=JSON.stringify({...s.contentIndex,updatedHour:0})!==JSON.stringify({...next,updatedHour:0});
 s.contentIndex=next;
 if(changed&&s.indexInitialized)pushJournal("system","內容自動接入","偵測到內容資料庫變更；劇情、委託、怪物或生產索引已自動重新接入活世界循環。",{});
 s.indexInitialized=true;return next
}
function nearbyNpcRows(locationId){
 const rows=[];
 for(const n of DB.regional_npc_archetypes||[]){
   let st=null;try{st=typeof globalThis.worldNpcCurrentState==="function"?globalThis.worldNpcCurrentState(n.id):null}catch(error){}
   if(st?.locationId!==locationId)continue;
   let agenda=null,av=null;
   try{agenda=typeof globalThis.npcDepth2Agenda==="function"?globalThis.npcDepth2Agenda(n.id):null}catch(error){}
   try{av=typeof globalThis.npcDepth2Availability==="function"?globalThis.npcDepth2Availability(n.id):null}catch(error){}
   rows.push({id:n.id,name:n.name||n.role||n.id,activity:st.activity||"",agenda:agenda?.text||"",availability:av?.label||""});
 }
 return rows
}
function investigateRumor(id){
 const s=state(),r=s?.rumors?.find(x=>x.id===id);if(!r)return;
 const here=game()?.character?.locationId;
 if(r.locationId&&here!==r.locationId){if(typeof alert==="function")alert("這條傳聞需要到相關地點才能進一步調查。");return}
 if(typeof beginTurn==="function"&&!beginTurn("調查地方傳聞"))return;
 let roll=10,stat=10;
 try{roll=typeof rollD20==="function"?rollD20():1+Math.floor(Math.random()*20)}catch(error){}
 try{stat=typeof effectiveStat==="function"?effectiveStat("感知"):10}catch(error){}
 const mod=Math.floor((Number(stat||10)-10)/2),dc=r.status==="verified"?16:r.status==="credible"?13:11,total=roll+mod,ok=total>=dc;
 if(typeof endTurn==="function")endTurn(CFG.investigation_hours);
 const ev={hour:nowHour(),roll,total,dc,success:ok};
 r.evidence.unshift(ev);if(r.evidence.length>10)r.evidence.length=10;r.lastUpdatedHour=nowHour();
 if(ok){
   r.confidence=clamp(Number(r.confidence||.5)+.18,.05,1);
   r.status=r.confidence>=.86?"verified":r.confidence>=.68?"credible":"unverified";
   applyTownDelta(r.locationId||here,{knowledge:2,stability:.5},"傳聞調查取得可核驗證據",{rumorId:r.id});
   emit("rumor_verified",`「${r.title}」取得新的可核驗證據。`,{title:r.title,locationId:r.locationId||here,rumorId:r.id,confidence:r.confidence},{rumor:false});
 }else{
   r.confidence=clamp(Number(r.confidence||.5)+.02,.05,1);
   pushJournal("investigation",r.title,"本次調查沒有取得足以提高可信度的證據。",{rumorId:r.id,locationId:r.locationId||here});
 }
 try{if(typeof persist==="function")persist()}catch(error){}
 openLiveWorldPanel()
}
function townBand(v){
 v=Number(v||50);if(v>=70)return "強";if(v>=55)return "穩";if(v>=40)return "平";if(v>=25)return "弱";return "危"
}
function openLiveWorldPanel(){
 liveWorldTick("panel");const s=state(),here=game()?.character?.locationId||null,t=ensureTown(here),town=settlementFor(here);
 const metrics=t?DIMENSIONS.map(k=>`<div class="small"><b>${LABEL[k]}</b> ${Math.round(t[k])}（${townBand(t[k])}）</div>`).join(""):"<div class='small'>尚無城鎮狀態。</div>";
 const chains=chainRows().filter(c=>!c.region_id||c.region_id===regionFor(here)||c.region_id==="REG-ASD-01").map(c=>{const p=chainProgress(c);return `<div class="small"><b>${esc(c.name||c.id)}</b>｜${p.done}/${p.total}${p.next?`｜下一步：${esc(p.next.name)}`:p.completed?"｜本階段完成":"｜等待前置"}</div>`}).join("")||"<div class='small'>目前沒有可追蹤事件鏈。</div>";
 const rumors=s.rumors.filter(r=>!r.locationId||r.locationId===here||r.regionId===regionFor(here)).slice(0,8);
 const rumorHtml=rumors.map(r=>`<div class="card small"><b>${esc(r.title)}</b>｜${r.status==="verified"?"已核實":r.status==="credible"?"可信傳聞":"未核實"}<br>${esc(r.text)}<br><button type="button" data-live-rumor="${esc(r.id)}">調查</button></div>`).join("")||"<div class='small'>目前沒有與所在地相關的動態傳聞。</div>";
 const npcs=nearbyNpcRows(here).slice(0,8),npcHtml=npcs.map(n=>`<div class="small"><b>${esc(n.name)}</b>｜${esc(n.availability||n.activity)}<br>${esc(n.agenda)}</div>`).join("")||"<div class='small'>此刻沒有已建檔固定NPC在附近。</div>";
 const recent=s.events.slice(0,6).map(e=>`<div class="small">${esc(e.summary)}</div>`).join("")||"<div class='small'>尚無近期活世界事件。</div>";
 const idx=s.contentIndex||{};
 if(typeof showModal==="function")showModal("活世界循環",`<div class="card"><b>${esc(town?.name||locationBy(here)?.name||"所在地")}・城鎮狀態</b>${metrics}</div><div class="card"><b>事件鏈</b>${chains}</div><div class="card"><b>傳聞與調查</b>${rumorHtml}</div><div class="card"><b>NPC目前反應</b>${npcHtml}</div><div class="card"><b>近期事件</b>${recent}</div><div class="card small"><b>自動接入索引</b><br>委託 ${idx.quests||0}｜奇遇 ${idx.adventureEvents||0}｜怪物 ${idx.monsters||0}｜可製作物 ${idx.craftableItems||0}｜料理 ${idx.cookingRecipes||0}</div>`);
 if(typeof document!=="undefined")setTimeout(()=>document.querySelectorAll?.("[data-live-rumor]")?.forEach?.(b=>b.addEventListener("click",()=>investigateRumor(b.dataset.liveRumor))),0)
}
function context(locationId=game()?.character?.locationId){
 const s=state(),town=ensureTown(locationId),regionId=regionFor(locationId);
 return {
   revision:REV,locationId,regionId,town,
   chains:chainRows().map(c=>({chain:c,progress:chainProgress(c)})).filter(x=>!x.chain.region_id||x.chain.region_id===regionId),
   rumors:s.rumors.filter(r=>!r.locationId||r.locationId===locationId||r.regionId===regionId),
   nearbyNpcs:nearbyNpcRows(locationId),
   contentIndex:{...s.contentIndex}
 }
}
function patchQuestRuntime(){
 if(globalThis.__LIVE_WORLD_QUEST_PATCHED)return;
 const baseGuild=globalThis.guildQuests,baseAccept=globalThis.acceptGuildQuest,baseTurnIn=globalThis.turnInQuest;
 if(typeof baseGuild==="function")globalThis.guildQuests=function(){
   if(!game()?.character)return baseGuild.apply(this,arguments);
   const original=DB.quest_templates,active=new Set(arr(game()?.quests).map(q=>q.templateId));
   DB.quest_templates=original.filter(q=>!descriptor(q)||active.has(q.id)||questGate(q).ok);
   try{return baseGuild.apply(this,arguments)}finally{DB.quest_templates=original}
 };
 if(typeof baseAccept==="function")globalThis.acceptGuildQuest=function(templateId){
   const t=questBy(templateId),g=questGate(t);
   if(t&&descriptor(t)&&!g.ok){
     const names=g.missing.map(id=>questBy(id)?.name||id),flags=g.missingFlags;
     if(typeof alert==="function")alert("此委託尚未解鎖。前置："+[...names,...flags].join("、"));return
   }
   return baseAccept.apply(this,arguments)
 };
 if(typeof baseTurnIn==="function")globalThis.turnInQuest=function(id){
   const q=arr(game()?.quests).find(x=>x.id===id),t=q?questBy(q.templateId):null,wasReady=q?.status==="ready";
   const result=baseTurnIn.apply(this,arguments);
   if(q&&t&&wasReady&&!arr(game()?.quests).some(x=>x.id===q.id))applyDescriptorCompletion(t,q);
   return result
 };
 if(typeof globalThis.turnInQuest==="function")globalThis.turnInGuildQuest=function(id){return globalThis.turnInQuest.apply(this,arguments)};
 globalThis.__LIVE_WORLD_QUEST_PATCHED=true
}
function patchAdventureRuntime(){
 if(globalThis.__LIVE_WORLD_ADVENTURE_PATCHED)return;
 const base=globalThis.resolveAdventureEvent;if(typeof base!=="function")return;
 globalThis.resolveAdventureEvent=function(choice){
   const pending=game()?.pendingAdventureEvent,t=pending?eventBy(pending.templateId):null;
   const before=arr(game()?.worldState?.integratedEvents).length,result=base.apply(this,arguments);
   let success=null;
   const latest=arr(game()?.worldState?.integratedEvents).slice(0,Math.max(6,arr(game()?.worldState?.integratedEvents).length-before+2)).find(x=>x?.data?.templateId===t?.id);
   if(typeof latest?.data?.success==="boolean")success=latest.data.success;
   if(t)recordAdventure(t,choice,success);
   return result
 };
 globalThis.__LIVE_WORLD_ADVENTURE_PATCHED=true
}
function patchMonsterRuntime(){
 if(globalThis.__LIVE_WORLD_MONSTER_PATCHED)return;
 const base=globalThis.updateQuestProgress;if(typeof base!=="function")return;
 globalThis.updateQuestProgress=function(kind,data={}){
   const result=base.apply(this,arguments);if(kind==="kill")recordMonsterPressure(data);return result
 };
 globalThis.__LIVE_WORLD_MONSTER_PATCHED=true
}
function patchProductionRuntime(){
 if(globalThis.__LIVE_WORLD_PRODUCTION_PATCHED)return;
 const baseCraft=globalThis.craftItemBatch,baseCook=globalThis.cookBatch;
 if(typeof baseCraft==="function")globalThis.craftItemBatch=function(itemId,count=1){
   const before=inventoryQty(itemId),result=baseCraft.apply(this,arguments),gained=Math.max(0,inventoryQty(itemId)-before);
   if(gained>0)recordProduction(itemId,gained,"craft");return result
 };
 if(typeof baseCook==="function")globalThis.cookBatch=function(rid,count=1){
   const r=(DB.recipes||[]).find(x=>x?.id===rid),out=r?(r.output_item_id||r.item_id||r.output):null,before=out?inventoryQty(out):0;
   const result=baseCook.apply(this,arguments),gained=out?Math.max(0,inventoryQty(out)-before):0;if(gained>0)recordProduction(out,gained,"cooking");return result
 };
 globalThis.__LIVE_WORLD_PRODUCTION_PATCHED=true
}
function patchTurnRuntime(){
 if(globalThis.__LIVE_WORLD_TURN_PATCHED)return;
 const base=globalThis.endTurn;if(typeof base!=="function")return;
 globalThis.endTurn=function(){const result=base.apply(this,arguments);setTimeout(()=>liveWorldTick("action"),0);return result};
 globalThis.__LIVE_WORLD_TURN_PATCHED=true
}
function patchMoreMenu(){
 if(globalThis.__LIVE_WORLD_MENU_PATCHED)return;
 const base=globalThis.openMoreMenu;if(typeof base!=="function")return;
 globalThis.openMoreMenu=function(){
   const result=base.apply(this,arguments);
   if(typeof document!=="undefined")setTimeout(()=>{
     const grid=document.querySelector("#modalBody .more-grid");if(!grid||grid.querySelector("[data-live-world]"))return;
     const b=document.createElement("button");b.className="more-card";b.dataset.liveWorld="1";b.innerHTML='<span class="more-icon">◎</span><span>活世界</span>';b.addEventListener("click",openLiveWorldPanel);grid.appendChild(b)
   },0);return result
 };
 globalThis.__LIVE_WORLD_MENU_PATCHED=true
}
function liveWorldTick(reason="interval"){
 const s=state();if(!s||!game()?.worldTime)return false;
 const changed=ingestExternalEvents();refreshContentIndex();syncChains();mirrorLegacy(s);
 if(changed)try{if(typeof globalThis.npcDepth2Heartbeat==="function")globalThis.npcDepth2Heartbeat("live-world-tick")}catch(error){}
 if(changed&&typeof persist==="function"&&reason!=="interval")try{persist()}catch(error){}
 return changed
}
function audit(){
 const issues=[],qids=new Set((DB.quest_templates||[]).map(x=>x?.id).filter(Boolean)),lids=new Set((DB.locations||[]).map(x=>x?.id).filter(Boolean));
 for(const q of DB.quest_templates||[]){
   const d=descriptor(q);if(!d)continue;
   for(const id of arr(d.requires_quests))if(!qids.has(id))issues.push("活世界前置委託缺失:"+q.id+"->"+id);
   const lid=locationFrom(q,{});if(lid&&!lids.has(lid))issues.push("活世界委託地點缺失:"+q.id+"->"+lid)
 }
 for(const e of DB.adventure_event_templates||[]){
   const d=descriptor(e);if(!d)continue;for(const lid of arr(e.location_ids))if(!lids.has(lid))issues.push("活世界奇遇地點缺失:"+e.id+"->"+lid)
 }
 for(const c of chainRows())for(const id of arr(c.stages))if(!qids.has(id))issues.push("活世界事件鏈階段缺失:"+c.id+"->"+id);
 const s=state();if(s)for(const t of Object.values(s.townStates||{}))for(const k of DIMENSIONS)if(Number(t[k])<0||Number(t[k])>100)issues.push("城鎮狀態越界:"+(t.locationId||"unknown")+"."+k);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{chains:chainRows().length,quests:(DB.quest_templates||[]).length,events:(DB.adventure_event_templates||[]).length,monsters:(DB.monsters||[]).length,towns:Object.keys(s?.townStates||{}).length,rumors:s?.rumors?.length||0},save_compatible:true}
}
function initialize(){
 DB.meta=DB.meta||{};DB.meta.live_world_loop_revision=REV;
 DB.live_world_system={
   version:REV,release:RELEASE,
   layers:["世界事件匯流排","事件鏈","城鎮狀態","動態傳聞與調查","NPC知識／議程橋接","內容自動接入索引"],
   auto_connect:["劇情","委託","奇遇","怪物","生產","商隊","資源","地下城"],
   state_root:"G.worldState.liveWorld",legacy_asdail_migration:true,save_schema_changed:false,save_compatible:true
 };
 state();refreshContentIndex();syncChains();patchQuestRuntime();patchAdventureRuntime();patchMonsterRuntime();patchProductionRuntime();patchTurnRuntime();patchMoreMenu();liveWorldTick("startup")
}
globalThis.liveWorldState=state;
globalThis.liveWorldTownState=townState;
globalThis.liveWorldApplyTownDelta=applyTownDelta;
globalThis.liveWorldEmit=emit;
globalThis.liveWorldQuestGate=questGate;
globalThis.publishLiveWorldRumor=publishRumor;
globalThis.investigateLiveWorldRumor=investigateRumor;
globalThis.liveWorldContext=context;
globalThis.openLiveWorldPanel=openLiveWorldPanel;
globalThis.runLiveWorldAudit=audit;\nglobalThis.runAsdailNarrativeAudit=()=>{const r=audit();return {...r,revision:"ASDAIL-NARRATIVE-RUNTIME-2.0",delegated_to:REV}};\nglobalThis.openAsdailNarrativePanel=openLiveWorldPanel;\nglobalThis.asdailNarrativeQuestGate=questGate;\nDB.asdail_narrative_runtime_system={version:"ASDAIL-NARRATIVE-RUNTIME-2.0",release:RELEASE,delegated_to:REV,save_compatible:true};
globalThis.QUNLU_LIVE_WORLD=Object.freeze({revision:REV,emit,context,townState,questGate,publishRumor,investigateRumor,tick:liveWorldTick});
initialize();
if(CORE?.registerModule)CORE.registerModule("src/live-world-loop-v1.js",{domain:"world",revision:REV,release:RELEASE});
if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>liveWorldTick("visible"),160)});
if(typeof window!=="undefined")window.addEventListener("focus",()=>setTimeout(()=>liveWorldTick("focus"),160));
setInterval(()=>liveWorldTick("interval"),CFG.heartbeat_ms);
})();
