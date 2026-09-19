/* 群陸旅誌：活世界共同循環／阿斯戴爾相容入口 CURRENT-1.76.0
 * LIVE-WORLD-LOOP-1.1
 * 世界事件鏈＋城鎮狀態＋傳聞調查＋NPC反應的共同底層。
 * 新劇情／委託／怪物／生產內容只要進入既有 runtime，就會自動留下活世界脈絡。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.76.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.76.0";
const REV="LIVE-WORLD-LOOP-1.1";
const CFG=Object.freeze({
 heartbeat_ms:30000,
 event_limit:140,
 journal_limit:80,
 rumor_limit:80,
 hook_limit:96,
 hook_ttl_hours:96,
 seen_limit:320,
 town_history_limit:30,
 rumor_max_age_hours:168,
 rumor_spread_interval_hours:6,
 rumor_spread_max_depth:3,
 rumor_spread_confidence_factor:.82,
 town_drift_interval_hours:12,
 town_drift_step:.6,
 npc_response_cooldown_hours:12,
 npc_response_max_per_origin:3,
 investigation_hours:.5,
 investigation_cooldown_hours:1,
 production_event_threshold:3,
 monster_event_threshold:3
});
const DIMENSIONS=["safety","supply","stability","prosperity","knowledge","ecology"];
const LABEL={safety:"治安",supply:"供應",stability:"秩序",prosperity:"繁榮",knowledge:"情報",ecology:"生態"};
const HOOK_LABEL={safety:"治安壓力",supply:"供應變化",stability:"秩序變化",prosperity:"地方機會",knowledge:"調查線索",ecology:"生態變化",trade:"物流商機",production:"生產動態",story:"劇情脈絡",general:"地方動態"};
const CHAIN_PHASE_LABEL={dormant:"潛伏",exposed:"浮現",active:"發展中",climax:"關鍵階段",resolved:"已收束"};
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
 s.npcResponses=s.npcResponses&&typeof s.npcResponses==="object"?s.npcResponses:{};
 s.townSignals=s.townSignals&&typeof s.townSignals==="object"?s.townSignals:{};
 s.events=arr(s.events);s.rumors=arr(s.rumors);s.hooks=arr(s.hooks);s.journal=arr(s.journal);
 s.seenExternalEvents=arr(s.seenExternalEvents);s.seenHookEvents=arr(s.seenHookEvents);
 if(!Number.isFinite(Number(s.lastRumorSpreadHour)))s.lastRumorSpreadHour=nowHour();
 if(!Number.isFinite(Number(s.lastTownDriftHour)))s.lastTownDriftHour=nowHour();
 if(!Number.isFinite(Number(s.lastPersistMs)))s.lastPersistMs=Date.now();
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
   requires_hooks:arr(n.requires_hooks),
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
 const d=descriptor(t);if(!d)return {ok:true,missing:[],missingFlags:[],missingHooks:[]};
 const s=state(),missing=arr(d.requires_quests).filter(id=>!completed(id)),missingFlags=arr(d.requires_flags).filter(id=>!s?.flags?.[id]);
 const requiredHooks=arr(d.requires_hooks),locationId=locationFrom(t,{}),available=s?activeHooks(locationId,regionFor(locationId)):[];
 const missingHooks=requiredHooks.filter(tag=>!available.some(h=>h.topic===tag||arr(h.tags).includes(tag)));
 return {ok:missing.length===0&&missingFlags.length===0&&missingHooks.length===0,missing,missingFlags,missingHooks}
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

function townProfile(locationId){
 const t=ensureTown(locationId);if(!t)return null;
 const low=[],high=[];let sum=0,pressure=0;
 for(const k of DIMENSIONS){
   const v=Number(t[k]||50);sum+=v;
   if(v<35){low.push({key:k,label:LABEL[k],value:v});pressure+=35-v}
   if(v>70)high.push({key:k,label:LABEL[k],value:v});
 }
 const average=Math.round(sum/DIMENSIONS.length*10)/10;
 const alert=pressure>=35?"crisis":pressure>=18?"strained":low.length?"watch":"stable";
 return {locationId:t.locationId,name:t.name,average,pressure:Math.round(pressure*10)/10,alert,low,high,updatedHour:t.updatedHour};
}
function driftTownStates(){
 const s=state();if(!s)return false;
 const current=nowHour(),elapsed=Math.max(0,current-Number(s.lastTownDriftHour||current));
 const ticks=Math.min(8,Math.floor(elapsed/CFG.town_drift_interval_hours));if(ticks<=0)return false;
 const move=CFG.town_drift_step*ticks;let changed=false;
 for(const t of Object.values(s.townStates||{})){
   for(const k of DIMENSIONS){
     const v=Number(t[k]||50),diff=50-v;if(Math.abs(diff)<.05)continue;
     const next=v+Math.sign(diff)*Math.min(Math.abs(diff),move);
     t[k]=Math.round(clamp(next)*10)/10;if(t[k]!==v)changed=true;
   }
   if(changed)t.updatedHour=current;
 }
 s.lastTownDriftHour=current;return changed;
}
function chainPhase(done,total,nextQuestId){
 if(total>0&&done>=total)return "resolved";
 if(done<=0)return nextQuestId?"exposed":"dormant";
 if(total>0&&done/total>=.75)return "climax";
 return "active";
}
function syncChainTransitions(){
 const s=state();if(!s)return false;let changed=false;
 for(const c of chainRows()){
   const p=chainProgress(c),row=s.eventChains[c.id];if(!row)continue;
   const phase=chainPhase(Number(row.done||0),Number(row.total||0),row.nextQuestId);
   const key=String(row.done||0)+"/"+String(row.total||0)+":"+String(row.nextQuestId||"done")+":"+phase;
   const before=row.transitionKey||null;row.phase=phase;
   if(before&&before!==key){
     const next=row.nextQuestId?questBy(row.nextQuestId):null,locationId=next?locationFrom(next,{}):game()?.character?.locationId||null;
     emit("chain_advanced","事件鏈「"+String(c.name||c.id)+"」推進至"+String(row.done||0)+"/"+String(row.total||0)+"（"+CHAIN_PHASE_LABEL[phase]+"）。",{title:c.name||"事件鏈推進",locationId,chainId:c.id,confidence:.9,rumorTitle:c.name||"事件鏈動態"},{townEffects:{}});
     changed=true;
   }
   row.transitionKey=key;
 }
 return changed;
}
function hookTagsFor(type,summary,data={}){
 const text=(String(type||"")+" "+String(summary||"")+" "+JSON.stringify(data||{})).toLowerCase(),tags=[];
 const add=x=>{if(!tags.includes(x))tags.push(x)};
 if(/monster|dungeon|occupation|guard|attack|kill|危|襲|守備|魔物|地下城|治安/.test(text))add("safety");
 if(/caravan|resource|supply|grain|food|shortage|供應|糧|資源|商隊/.test(text))add("supply");
 if(/law|order|quest|chain|stability|仲裁|封鎖|秩序|委託|事件鏈/.test(text))add("stability");
 if(/trade|market|prosper|商業|市場|繁榮|物流/.test(text))add("prosperity");
 if(/rumor|investig|evidence|knowledge|情報|調查|證據|傳聞/.test(text))add("knowledge");
 if(/ecology|wild|depleted|harvest|生態|採集|枯竭/.test(text))add("ecology");
 if(/caravan|market|trade|物流|商隊|市場/.test(text))add("trade");
 if(/production|craft|cook|鍛造|料理|生產|製作/.test(text))add("production");
 if(/quest|chain|adventure|story|委託|奇遇|事件鏈|劇情/.test(text))add("story");
 if(!tags.length)add("general");return tags;
}
function pruneHooks(s=state()){
 if(!s)return;
 const current=nowHour();
 for(const h of s.hooks)if(h.status==="open"&&Number(h.expiresHour||Infinity)<=current)h.status="expired";
 s.hooks=s.hooks.filter(h=>h.status==="open"||current-Number(h.lastHour||h.createdHour||current)<=336);
 s.hooks.sort((a,b)=>Number(b.priority||0)-Number(a.priority||0)||Number(b.lastHour||0)-Number(a.lastHour||0));
 if(s.hooks.length>CFG.hook_limit)s.hooks.length=CFG.hook_limit;
}
function registerHook(input={}){
 const s=state();if(!s)return null;pruneHooks(s);
 const locationId=input.locationId||null,regionId=input.regionId||regionFor(locationId),tags=uniq(input.tags||[]);
 const topic=String(input.topic||tags[0]||"general"),current=nowHour(),priority=Math.round(clamp(Number(input.priority||2),1,5));
 let h=s.hooks.find(x=>x.status==="open"&&x.topic===topic&&(x.locationId||null)===(locationId||null)&&(x.chainId||null)===(input.chainId||null));
 if(h){
   h.priority=Math.max(Number(h.priority||1),priority);h.summary=String(input.summary||h.summary||"地方動態");
   h.lastHour=current;h.expiresHour=Math.max(Number(h.expiresHour||0),current+Number(input.ttlHours||CFG.hook_ttl_hours));
   h.tags=uniq([...arr(h.tags),...tags]);h.evidenceCount=Number(h.evidenceCount||1)+1;
   h.sourceEventIds=uniq([...arr(h.sourceEventIds),...arr(input.sourceEventIds)]).slice(-8);return h;
 }
 h={id:"LWH-"+Math.round(current*100)+"-"+Math.random().toString(36).slice(2,7),topic,label:HOOK_LABEL[topic]||topic,tags:uniq([topic,...tags]),priority,status:"open",summary:String(input.summary||"地方動態"),locationId,regionId,chainId:input.chainId||null,createdHour:current,lastHour:current,expiresHour:current+Number(input.ttlHours||CFG.hook_ttl_hours),evidenceCount:1,sourceEventIds:uniq(arr(input.sourceEventIds)).slice(-8)};
 s.hooks.unshift(h);pruneHooks(s);return h;
}
function activeHooks(locationId,regionId=regionFor(locationId)){
 const s=state();if(!s)return [];pruneHooks(s);
 return s.hooks.filter(h=>h.status==="open"&&(!h.locationId||h.locationId===locationId||h.regionId&&h.regionId===regionId));
}
function syncEventHooks(){
 const s=state();if(!s)return false;const seen=new Set(s.seenHookEvents);let changed=false;
 for(const e of s.events.slice().reverse()){
   if(!e?.id||seen.has(e.id))continue;seen.add(e.id);s.seenHookEvents.unshift(e.id);
   const tags=hookTagsFor(e.type,e.summary,e.data),effects=defaultTownEffects(e.type,e.data||{});
   const negative=Object.values(effects).filter(v=>Number(v)<0).reduce((n,v)=>n+Math.abs(Number(v)),0);
   const positive=Object.values(effects).filter(v=>Number(v)>0).reduce((n,v)=>n+Number(v),0);
   const priority=Math.round(clamp(1+Math.ceil(negative/2)+(negative>0?1:0)+(positive>=4?1:0),1,5));
   if(!["npc_response","town_recovery"].includes(String(e.type||"")))registerHook({topic:tags[0],tags,priority,summary:e.summary,locationId:e.locationId,regionId:e.regionId,chainId:e.chainId,sourceEventIds:[e.id],ttlHours:/production|monster_pressure_reduced/.test(String(e.type||""))?48:CFG.hook_ttl_hours});
   changed=true;
 }
 if(s.seenHookEvents.length>CFG.seen_limit)s.seenHookEvents.length=CFG.seen_limit;return changed;
}
function mirrorExternalEvent(type,summary,data,key){
 const s=state();if(!s||s.events.some(x=>x?.data?.externalKey===key))return null;
 const e={id:"LWX-"+Math.round(nowHour()*100)+"-"+Math.random().toString(36).slice(2,7),hour:nowHour(),turn:game()?.turn||0,type:String(type||"world_event"),summary:String(summary||"世界事件更新。"),locationId:data.locationId||null,regionId:data.regionId||regionFor(data.locationId),chainId:data.chainId||null,data:{...data,externalKey:key,mirroredExternal:true}};
 s.events.unshift(e);if(s.events.length>CFG.event_limit)s.events.length=CFG.event_limit;
 pushJournal("event",data.title||"世界動態",e.summary,{eventId:e.id,locationId:e.locationId,regionId:e.regionId});return e;
}
function rumorTargets(r){
 const town=settlementFor(r.locationId);if(!town)return [];
 const direct=arr(town.links).map(x=>settlementFor(x?.to||x)).filter(Boolean);
 const province=town.province_id,region=town.world_region_id||town.region_id;
 const same=(DB.locations||[]).filter(x=>townKinds.has(String(x?.kind||"").toLowerCase())&&x.id!==town.id&&(province&&x.province_id===province||!province&&region&&(x.world_region_id||x.region_id)===region));
 const ids=uniq([...direct.map(x=>x.id),...same.map(x=>x.id)]).filter(id=>id&&id!==town.id);
 return ids.map(locationBy).filter(Boolean);
}
function spreadRumors(){
 const s=state();if(!s)return false;const current=nowHour(),elapsed=Math.max(0,current-Number(s.lastRumorSpreadHour||current));
 const steps=Math.min(3,Math.floor(elapsed/CFG.rumor_spread_interval_hours));if(steps<=0)return false;let changed=false;
 for(let step=0;step<steps;step++){
   const seeds=s.rumors.slice().filter(r=>current-Number(r.createdHour||current)<=CFG.rumor_max_age_hours&&Number(r.confidence||0)>=.5&&Number(r.spreadDepth||0)<CFG.rumor_spread_max_depth);
   for(const r of seeds){
     r.spreadTargets=arr(r.spreadTargets);const available=rumorTargets(r).filter(t=>!r.spreadTargets.includes(t.id)).slice(0,2);
     for(const target of available){
       const origin=r.originRumorId||r.id,existing=s.rumors.find(x=>(x.originRumorId||x.id)===origin&&x.locationId===target.id);
       const confidence=clamp(Number(r.confidence||.5)*CFG.rumor_spread_confidence_factor,.05,1);
       r.spreadTargets.push(target.id);
       if(existing){if(confidence>Number(existing.confidence||0)){existing.confidence=confidence;existing.status=confidence>=.86?"verified":confidence>=.68?"credible":"unverified";existing.lastUpdatedHour=current}continue}
       const copy=publishRumor({title:r.title,text:r.text,locationId:target.id,regionId:regionFor(target.id),chainId:r.chainId,sourceType:"rumor_network",sourceId:origin+":"+target.id,confidence,evidence:[]});
       if(copy){copy.originRumorId=origin;copy.spreadDepth=Number(r.spreadDepth||0)+1;copy.spreadTargets=[];copy.cameFromLocationId=r.locationId||null;changed=true}
     }
   }
 }
 s.lastRumorSpreadHour=current;return changed;
}
function boostRumorNetwork(r,amount=.04){
 const s=state();if(!s||!r)return;const origin=r.originRumorId||r.id;
 for(const x of s.rumors){
   if(x===r||(x.originRumorId||x.id)!==origin)continue;
   const current=Number(x.confidence||.5),cap=Math.max(current,Math.min(.95,Number(r.confidence||.95)));
   x.confidence=Math.min(cap,current+Number(amount||0));
   x.status=x.confidence>=.86?"verified":x.confidence>=.68?"credible":"unverified";x.lastUpdatedHour=nowHour();
 }
}
function processNpcResponses(){
 const s=state();if(!s||typeof globalThis.npcDepth2Agenda!=="function"||typeof globalThis.worldNpcCurrentState!=="function")return false;
 const effectsByTopic={infrastructure:{stability:.8,safety:.4},law:{stability:.8,knowledge:.5},food:{supply:1,stability:.3},river:{supply:.6,ecology:.3},ore:{supply:.5,prosperity:.4},north:{safety:1,stability:.4},medical:{stability:.6,safety:.4},coast:{safety:.5,supply:.5},wetland:{knowledge:.8,ecology:.3},player:{knowledge:.3},general:{stability:.3}};
 let changed=false;
 for(const p of DB.npc_personality_profiles||[]){
   const id=p?.npc_id;if(!id)continue;let agenda=null,st=null,av=null;
   try{agenda=globalThis.npcDepth2Agenda(id);st=globalThis.worldNpcCurrentState(id);av=typeof globalThis.npcDepth2Availability==="function"?globalThis.npcDepth2Availability(id):null}catch(error){continue}
   const severity=Number(agenda?.severity||0),confidence=Number(agenda?.confidence??1);if(severity<2||confidence<.5||!st?.locationId||av?.code==="off"||av?.code==="unknown")continue;
   const origin=String(agenda.originId||agenda.topic||"general"),key=id+"::"+origin,row=s.npcResponses[key]||(s.npcResponses[key]={count:0,lastHour:-999});
   if(Number(row.count||0)>=CFG.npc_response_max_per_origin||nowHour()-Number(row.lastHour||-999)<CFG.npc_response_cooldown_hours)continue;
   const base=effectsByTopic[agenda.topic]||effectsByTopic.general,scale=severity>=3?1.25:1,effects={};
   for(const [k,v] of Object.entries(base))effects[k]=Math.round(Number(v)*scale*10)/10;
   const npc=(DB.regional_npc_archetypes||[]).find(x=>x?.id===id);
   emit("npc_response",(npc?.name||id)+"依近期情報調整勤務並完成一輪地方處置。",{title:"NPC回應",locationId:st.locationId,npcId:id,topic:agenda.topic||"general",originId:origin,confidence},{townEffects:effects,rumor:false,forwardNpc:false});
   row.count=Number(row.count||0)+1;row.lastHour=nowHour();changed=true;
 }
 return changed;
}
function refreshTownSignals(){
 const s=state();if(!s)return false;let changed=false;
 for(const t of Object.values(s.townStates||{})){
   const p=townProfile(t.locationId);if(!p)continue;
   const signature=[...p.low.map(x=>"-"+x.key),...p.high.map(x=>"+"+x.key)].join("|"),prev=s.townSignals[t.locationId];
   if(!prev){s.townSignals[t.locationId]={signature,hour:nowHour()};continue}
   if(prev.signature===signature)continue;s.townSignals[t.locationId]={signature,hour:nowHour()};changed=true;
   if(signature){
     const low=p.low.length?"需關注："+p.low.map(x=>x.label+" "+Math.round(x.value)).join("、"):"";
     const high=p.high.length?"優勢："+p.high.map(x=>x.label+" "+Math.round(x.value)).join("、"):"";
     emit("town_pressure",(t.name||locationBy(t.locationId)?.name||"當地")+"態勢改變。"+[low,high].filter(Boolean).join("；"),{title:"地方態勢",locationId:t.locationId,confidence:.86,pressureTags:p.low.map(x=>x.key),opportunityTags:p.high.map(x=>x.key)},{townEffects:{}});
   }else if(prev.signature){
     emit("town_recovery",(t.name||locationBy(t.locationId)?.name||"當地")+"的主要指標回到常態區間。",{title:"地方態勢",locationId:t.locationId,confidence:.9},{townEffects:{},rumor:false});
   }
 }
 return changed;
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
     if(/caravan|resource|dungeon|adventure|quest|weather|incident|occupation|market|trade|production/.test(type))mirrorExternalEvent(type,summary,data,key);
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
 const snapshot={id:chain?.id||null,done:done.length,total:stages.length,nextQuestId:next?.id||null,completed:!!stages.length&&done.length===stages.length,updatedHour:nowHour()};
 if(!s)return {...snapshot,next};
 const row=s.eventChains[chain.id]||(s.eventChains[chain.id]={id:chain.id});
 Object.assign(row,snapshot);
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
 const inv=s.investigations[id]||(s.investigations[id]={attempts:0,successes:0,lastHour:-999,evidence:[]});
 const elapsed=nowHour()-Number(inv.lastHour||-999);
 if(Number(inv.attempts||0)>0&&elapsed<CFG.investigation_cooldown_hours){
   const minutes=Math.max(1,Math.ceil((CFG.investigation_cooldown_hours-elapsed)*60));
   if(typeof alert==="function")alert("剛完成一輪調查，至少再經過約"+minutes+"分鐘，地方線索才可能出現新的變化。");return;
 }
 if(typeof beginTurn==="function"&&!beginTurn("調查地方傳聞"))return;
 let roll=10,stat=10;
 try{roll=typeof rollD20==="function"?rollD20():1+Math.floor(Math.random()*20)}catch(error){}
 try{stat=typeof effectiveStat==="function"?effectiveStat("感知"):10}catch(error){}
 const t=ensureTown(here),mod=Math.floor((Number(stat||10)-10)/2);
 const localBonus=Math.round(clamp(Math.floor((Number(t?.knowledge||50)-50)/20),-1,2));
 const npcSupport=nearbyNpcRows(here).some(n=>!/休息|未知/.test(String(n.availability||"")))?1:0;
 const attemptPenalty=Math.min(2,Math.floor(Number(inv.attempts||0)/3));
 const dc=r.status==="verified"?17:r.status==="credible"?14:12,total=roll+mod+localBonus+npcSupport-attemptPenalty,ok=total>=dc;
 if(typeof endTurn==="function")endTurn(CFG.investigation_hours);
 const ev={hour:nowHour(),roll,total,dc,success:ok,localBonus,npcSupport,attempt:Number(inv.attempts||0)+1};
 r.evidence=arr(r.evidence);r.evidence.unshift(ev);if(r.evidence.length>10)r.evidence.length=10;r.lastUpdatedHour=nowHour();
 inv.attempts=Number(inv.attempts||0)+1;inv.lastHour=nowHour();inv.evidence=arr(inv.evidence);inv.evidence.unshift(ev);if(inv.evidence.length>10)inv.evidence.length=10;
 if(ok){
   inv.successes=Number(inv.successes||0)+1;
   const gain=inv.successes===1?.18:r.status==="verified"?.05:.12;
   r.confidence=clamp(Number(r.confidence||.5)+gain,.05,1);
   r.status=r.confidence>=.86?"verified":r.confidence>=.68?"credible":"unverified";
   applyTownDelta(r.locationId||here,{knowledge:2,stability:.5},"傳聞調查取得可核驗證據",{rumorId:r.id});
   boostRumorNetwork(r,.04);
   emit("rumor_verified","「"+r.title+"」取得新的可核驗證據。",{title:r.title,locationId:r.locationId||here,rumorId:r.id,confidence:r.confidence},{rumor:false});
 }else{
   pushJournal("investigation",r.title,"本次調查沒有取得足以提高可信度的證據（"+total+" / DC "+dc+"）。",{rumorId:r.id,locationId:r.locationId||here});
 }
 try{if(typeof persist==="function")persist()}catch(error){}
 openLiveWorldPanel()
}
function townBand(v){
 v=Number(v||50);if(v>=70)return "強";if(v>=55)return "穩";if(v>=40)return "平";if(v>=25)return "弱";return "危"
}
function openLiveWorldPanel(){
 liveWorldTick("panel");const s=state(),here=game()?.character?.locationId||null,t=ensureTown(here),town=settlementFor(here),tp=townProfile(here);
 const metrics=t?DIMENSIONS.map(k=>'<div class="small"><b>'+LABEL[k]+'</b> '+Math.round(t[k])+'（'+townBand(t[k])+'）</div>').join(""):"<div class='small'>尚無城鎮狀態。</div>";
 const posture=tp?'<div class="small"><b>整體態勢</b> '+(tp.alert==="crisis"?"危急":tp.alert==="strained"?"吃緊":tp.alert==="watch"?"需留意":"穩定")+'｜壓力 '+Math.round(tp.pressure)+'</div>':"";
 const chains=chainRows().filter(c=>!c.region_id||c.region_id===regionFor(here)).map(c=>{const p=chainProgress(c);return '<div class="small"><b>'+esc(c.name||c.id)+'</b>｜'+p.done+'/'+p.total+'｜'+esc(CHAIN_PHASE_LABEL[p.phase]||"追蹤中")+(p.next?'｜下一步：'+esc(p.next.name):p.completed?'｜本階段完成':'｜等待前置')+'</div>'}).join("")||"<div class='small'>目前沒有可追蹤事件鏈。</div>";
 const hooks=activeHooks(here,regionFor(here)).slice(0,6);
 const hookHtml=hooks.map(h=>'<div class="small"><b>'+esc(h.label||HOOK_LABEL[h.topic]||h.topic)+'</b>｜優先度 '+Math.round(h.priority||1)+'/5<br>'+esc(h.summary)+'</div>').join("")||"<div class='small'>目前沒有需要追蹤的地方鉤子。</div>";
 const rumors=s.rumors.filter(r=>!r.locationId||r.locationId===here||r.regionId===regionFor(here)).slice(0,8);
 const rumorHtml=rumors.map(r=>{const inv=s.investigations[r.id],spread=Number(r.spreadDepth||0)>0?'｜轉述 '+Number(r.spreadDepth)+' 層':"";return '<div class="card small"><b>'+esc(r.title)+'</b>｜'+(r.status==="verified"?"已核實":r.status==="credible"?"可信傳聞":"未核實")+' '+Math.round(Number(r.confidence||0)*100)+'%'+spread+'<br>'+esc(r.text)+(inv?'<br>調查 '+Number(inv.attempts||0)+' 次｜成功 '+Number(inv.successes||0)+' 次':"")+'<br><button type="button" data-live-rumor="'+esc(r.id)+'">調查</button></div>'}).join("")||"<div class='small'>目前沒有與所在地相關的動態傳聞。</div>";
 const npcs=nearbyNpcRows(here).slice(0,8),npcHtml=npcs.map(n=>'<div class="small"><b>'+esc(n.name)+'</b>｜'+esc(n.availability||n.activity)+'<br>'+esc(n.agenda)+'</div>').join("")||"<div class='small'>此刻沒有已建檔固定NPC在附近。</div>";
 const recent=s.events.slice(0,6).map(e=>'<div class="small">'+esc(e.summary)+'</div>').join("")||"<div class='small'>尚無近期活世界事件。</div>";
 const idx=s.contentIndex||{};
 if(typeof showModal==="function")showModal("活世界循環",'<div class="card"><b>'+esc(town?.name||locationBy(here)?.name||"所在地")+'・城鎮狀態</b>'+posture+metrics+'</div><div class="card"><b>事件鏈</b>'+chains+'</div><div class="card"><b>世界鉤子</b>'+hookHtml+'</div><div class="card"><b>傳聞與調查</b>'+rumorHtml+'</div><div class="card"><b>NPC目前反應</b>'+npcHtml+'</div><div class="card"><b>近期事件</b>'+recent+'</div><div class="card small"><b>自動接入索引</b><br>委託 '+(idx.quests||0)+'｜奇遇 '+(idx.adventureEvents||0)+'｜怪物 '+(idx.monsters||0)+'｜可製作物 '+(idx.craftableItems||0)+'｜料理 '+(idx.cookingRecipes||0)+'</div>');
 if(typeof document!=="undefined")setTimeout(()=>document.querySelectorAll?.("[data-live-rumor]")?.forEach?.(b=>b.addEventListener("click",()=>investigateRumor(b.dataset.liveRumor))),0)
}
function context(locationId=game()?.character?.locationId){
 const s=state(),town=ensureTown(locationId),regionId=regionFor(locationId);
 return {
   revision:REV,locationId,regionId,town,townProfile:townProfile(locationId),
   chains:chainRows().map(c=>({chain:c,progress:chainProgress(c)})).filter(x=>!x.chain.region_id||x.chain.region_id===regionId),
   hooks:activeHooks(locationId,regionId),
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
     const names=g.missing.map(id=>questBy(id)?.name||id),flags=g.missingFlags,hooks=g.missingHooks||[];
     if(typeof alert==="function")alert("此委託尚未解鎖。前置："+[...names,...flags,...hooks.map(x=>"世界鉤子:"+x)].join("、"));return
   }
   return baseAccept.apply(this,arguments)
 };
 if(typeof baseTurnIn==="function")globalThis.turnInQuest=function(id){
   const q=arr(game()?.quests).find(x=>x.id===id),t=q?questBy(q.templateId):null,wasReady=q?.status==="ready";
   const result=baseTurnIn.apply(this,arguments);
   if(q&&t&&wasReady&&!arr(game()?.quests).some(x=>x.id===q.id)){applyDescriptorCompletion(t,q);try{if(typeof persist==="function")persist()}catch(error){}}
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
   if(t){recordAdventure(t,choice,success);try{if(typeof persist==="function")persist()}catch(error){}}
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
   const r=(DB.recipes||[]).find(x=>x?.id===rid),out=r?(r.result||r.output?.item_id||r.output_item_id||r.item_id||null):null,before=out?inventoryQty(out):0;
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
 const s=state();if(!s||!game()?.worldTime)return false;let changed=false;
 if(ingestExternalEvents())changed=true;
 refreshContentIndex();syncChains();
 if(syncChainTransitions())changed=true;
 if(driftTownStates())changed=true;
 if(spreadRumors())changed=true;
 if(processNpcResponses())changed=true;
 if(refreshTownSignals())changed=true;
 if(syncEventHooks())changed=true;
 pruneHooks(s);mirrorLegacy(s);
 if(changed)try{if(typeof globalThis.npcDepth2Heartbeat==="function")globalThis.npcDepth2Heartbeat("live-world-tick")}catch(error){}
 const shouldPersist=changed&&typeof persist==="function"&&(reason!=="interval"||Date.now()-Number(s.lastPersistMs||0)>=60000);
 if(shouldPersist)try{s.lastPersistMs=Date.now();persist()}catch(error){}
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
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{chains:chainRows().length,quests:(DB.quest_templates||[]).length,events:(DB.adventure_event_templates||[]).length,monsters:(DB.monsters||[]).length,towns:Object.keys(s?.townStates||{}).length,rumors:s?.rumors?.length||0,hooks:s?.hooks?.filter(x=>x?.status==="open").length||0,investigations:Object.keys(s?.investigations||{}).length},save_compatible:true}
}
function initialize(){
 DB.meta=DB.meta||{};DB.meta.live_world_loop_revision=REV;
 DB.live_world_system={
   version:REV,release:RELEASE,
   layers:["世界事件匯流排","事件鏈階段狀態","城鎮六維壓力與自然回穩","動態傳聞擴散與調查","NPC知識／議程回應","世界鉤子","內容自動接入索引"],
   auto_connect:["劇情","委託","奇遇","怪物","生產","商隊","資源","地下城"],
   integration_contract:{emit_api:"liveWorldEmit",context_api:"liveWorldContext",hooks_api:"liveWorldHooks",town_profile_api:"liveWorldTownProfile"},
   state_root:"G.worldState.liveWorld",legacy_asdail_migration:true,save_schema_changed:false,save_compatible:true
 };

 state();refreshContentIndex();syncChains();patchQuestRuntime();patchAdventureRuntime();patchMonsterRuntime();patchProductionRuntime();patchTurnRuntime();patchMoreMenu();liveWorldTick("startup")
}
globalThis.liveWorldState=state;
globalThis.liveWorldTownState=townState;
globalThis.liveWorldTownProfile=townProfile;
globalThis.liveWorldHooks=activeHooks;
globalThis.liveWorldApplyTownDelta=applyTownDelta;
globalThis.liveWorldEmit=emit;
globalThis.liveWorldQuestGate=questGate;
globalThis.publishLiveWorldRumor=publishRumor;
globalThis.investigateLiveWorldRumor=investigateRumor;
globalThis.liveWorldContext=context;
globalThis.openLiveWorldPanel=openLiveWorldPanel;
globalThis.runLiveWorldAudit=audit;
globalThis.runAsdailNarrativeAudit=()=>{const r=audit();return {...r,revision:"ASDAIL-NARRATIVE-RUNTIME-2.0",delegated_to:REV}};
globalThis.openAsdailNarrativePanel=openLiveWorldPanel;
globalThis.asdailNarrativeQuestGate=questGate;
DB.asdail_narrative_runtime_system={version:"ASDAIL-NARRATIVE-RUNTIME-2.0",release:RELEASE,delegated_to:REV,save_compatible:true};
globalThis.QUNLU_LIVE_WORLD=Object.freeze({revision:REV,emit,context,townState,townProfile,hooks:activeHooks,questGate,publishRumor,investigateRumor,tick:liveWorldTick});
initialize();
setTimeout(()=>{
 globalThis.__LIVE_WORLD_PRODUCTION_PATCHED=false;
 patchProductionRuntime();
 liveWorldTick("post-load");
},0);
if(CORE?.registerModule)CORE.registerModule("src/asdail-narrative-runtime-v1.js",{domain:"runtime",revision:REV,release:RELEASE});
if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>liveWorldTick("visible"),160)});
if(typeof window!=="undefined")window.addEventListener("focus",()=>setTimeout(()=>liveWorldTick("focus"),160));
setInterval(()=>liveWorldTick("interval"),CFG.heartbeat_ms);
})();
