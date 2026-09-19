/* 群陸旅誌：阿斯戴爾劇情鏈相容橋接 CURRENT-1.75.0
 * ASDAIL-NARRATIVE-RUNTIME-2.0
 * 原本的地區專用狀態／前置／奇遇寫回已上移至 LIVE-WORLD-LOOP-1.0。
 * 本檔只保留舊API、地區面板入口與資料完整性稽核，確保既有存檔與舊呼叫不斷鏈。
 */
(()=>{
"use strict";
const CORE=globalThis.QUNLU_CORE;
const DBX=typeof DB!=="undefined"?DB:null;
if(!DBX)return;
const RELEASE=CORE?.release?.("CURRENT-1.75.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.75.0";
const REV="ASDAIL-NARRATIVE-RUNTIME-2.0";
const THREADS=()=>Array.isArray(DBX.asdail_narrative_threads)?DBX.asdail_narrative_threads:[];
const quests=()=>Array.isArray(DBX.quest_templates)?DBX.quest_templates:[];
const template=id=>quests().find(x=>x?.id===id)||null;

function fallbackState(){
 try{
   if(typeof G==="undefined"||!G)return null;
   G.worldState=G.worldState||{};
   const s=G.worldState.asdailNarrative||(G.worldState.asdailNarrative={completedQuestTemplates:[],flags:{},localStates:{},eventOutcomes:{},threadUpdates:{},journal:[]});
   s.revision=REV;s.completedQuestTemplates=Array.isArray(s.completedQuestTemplates)?s.completedQuestTemplates:[];s.flags=s.flags&&typeof s.flags==="object"?s.flags:{};return s
 }catch(error){return null}
}
function fallbackCompleted(id){
 const s=fallbackState();if(s?.completedQuestTemplates?.includes(id))return true;
 try{
   const t=template(id);return (G?.questHistory||[]).some(x=>x?.status==="完成"&&(x.name===t?.name||String(x.id||"").includes(id)))
 }catch(error){return false}
}
function fallbackGate(t){
 const n=t?.live_world||t?.narrative;if(!n)return {ok:true,missing:[],missingFlags:[]};
 const s=fallbackState(),missing=(n.requires_quests||[]).filter(id=>!fallbackCompleted(id)),missingFlags=(n.requires_flags||[]).filter(id=>!s?.flags?.[id]);
 return {ok:missing.length===0&&missingFlags.length===0,missing,missingFlags}
}
function gate(t){
 if(typeof globalThis.liveWorldQuestGate==="function")return globalThis.liveWorldQuestGate(t);
 return fallbackGate(t)
}
function openAsdailNarrativePanel(){
 if(typeof globalThis.openLiveWorldPanel==="function"){globalThis.openLiveWorldPanel({regionId:"REG-ASD-01"});return}
 const rows=THREADS().map(th=>{
   const ids=Array.isArray(th?.stages)?th.stages:[],done=ids.filter(fallbackCompleted).length;
   return `<div class="card"><b>${th.name}</b> <span class="tier">${th.tier}</span><br><span class="small">${th.theme||""}<br>進度 ${done}/${ids.length}<br>${th.resolution||""}</span></div>`
 }).join("")||'<div class="card small">目前沒有阿斯戴爾劇情鏈資料。</div>';
 if(typeof showModal==="function")showModal("阿斯戴爾・劇情脈絡",'<div class="card small">劇情鏈已改由活世界共同底層管理；此頁保留舊入口相容。</div>'+rows)
}
function audit(){
 const issues=[],qids=new Set(quests().map(x=>x?.id).filter(Boolean)),lids=new Set((DBX.locations||[]).map(x=>x?.id).filter(Boolean));
 for(const q of quests().filter(x=>x?.narrative||x?.live_world)){
   const n=q.live_world||q.narrative;
   for(const id of n.requires_quests||[])if(!qids.has(id))issues.push("劇情前置委託缺失:"+q.id+"->"+id)
 }
 for(const th of THREADS())for(const id of th.stages||[])if(!qids.has(id))issues.push("劇情階段委託缺失:"+th.id+"->"+id);
 for(const e of (DBX.adventure_event_templates||[]).filter(x=>x?.narrative||x?.live_world))for(const id of e.location_ids||[])if(!lids.has(id))issues.push("劇情奇遇地點缺失:"+e.id+"->"+id);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],delegated_to:"LIVE-WORLD-LOOP-1.0",stats:{threads:THREADS().length,narrativeQuests:quests().filter(x=>x?.narrative||x?.live_world).length,narrativeEvents:(DBX.adventure_event_templates||[]).filter(x=>x?.narrative||x?.live_world).length}}
}
globalThis.openAsdailNarrativePanel=openAsdailNarrativePanel;
globalThis.asdailNarrativeQuestGate=gate;
globalThis.runAsdailNarrativeAudit=audit;
DBX.asdail_narrative_runtime_system={version:REV,release:RELEASE,delegated_to:"LIVE-WORLD-LOOP-1.0",save_compatible:true,initial_audit:audit()};
if(CORE?.registerModule)CORE.registerModule("src/asdail-narrative-runtime-v1.js",{domain:"runtime",revision:REV,release:RELEASE});
})();
