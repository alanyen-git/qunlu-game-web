/* 群陸旅誌：阿斯戴爾劇情鏈 runtime CURRENT-1.73.0
 * ASDAIL-NARRATIVE-RUNTIME-1.0
 * 功能：委託前置解鎖、舊存檔回推、完成後果、奇遇結果紀錄、劇情進度面板。
 */
(()=>{
"use strict";
const CORE=globalThis.QUNLU_CORE;
const DBX=globalThis.DB;
if(!DBX)return;
const RELEASE=CORE?.release?.("CURRENT-1.73.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.73.0";
const REV="ASDAIL-NARRATIVE-RUNTIME-1.0";
const THREADS=()=>Array.isArray(DBX.asdail_narrative_threads)?DBX.asdail_narrative_threads:[];
const quests=()=>Array.isArray(DBX.quest_templates)?DBX.quest_templates:[];
const template=id=>quests().find(x=>x?.id===id)||null;
const nowHour=()=>{try{return typeof totalHours==="function"?totalHours():0}catch(error){return 0}};
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function state(){
  if(typeof G==="undefined"||!G)return null;
  G.worldState=G.worldState||{};
  const s=G.worldState.asdailNarrative||(G.worldState.asdailNarrative={revision:REV,completedQuestTemplates:[],flags:{},localStates:{},eventOutcomes:{},threadUpdates:{},journal:[]});
  s.revision=REV;
  s.completedQuestTemplates=Array.isArray(s.completedQuestTemplates)?s.completedQuestTemplates:[];
  s.flags=s.flags&&typeof s.flags==="object"?s.flags:{};
  s.localStates=s.localStates&&typeof s.localStates==="object"?s.localStates:{};
  s.eventOutcomes=s.eventOutcomes&&typeof s.eventOutcomes==="object"?s.eventOutcomes:{};
  s.threadUpdates=s.threadUpdates&&typeof s.threadUpdates==="object"?s.threadUpdates:{};
  s.journal=Array.isArray(s.journal)?s.journal:[];
  recoverLegacyHistory(s);
  return s
}
function recoverLegacyHistory(s){
  if(s.historyRecovered)return;
  const hist=Array.isArray(G?.questHistory)?G.questHistory:[];
  const candidates=quests().filter(q=>q?.narrative);
  for(const h of hist){
    if(h?.status!=="完成")continue;
    for(const q of candidates){
      if(h.name===q.name||String(h.id||"").includes(q.id)){
        if(!s.completedQuestTemplates.includes(q.id))s.completedQuestTemplates.push(q.id)
      }
    }
  }
  s.historyRecovered=true
}
function completed(id){
  const s=state();if(!s)return false;
  if(s.completedQuestTemplates.includes(id))return true;
  const t=template(id);
  const h=(G?.questHistory||[]).some(x=>x?.status==="完成"&&(x.name===t?.name||String(x.id||"").includes(id)));
  if(h&&!s.completedQuestTemplates.includes(id))s.completedQuestTemplates.push(id);
  return h
}
function gate(t){
  const n=t?.narrative;if(!n)return {ok:true,missing:[],missingFlags:[]};
  const req=Array.isArray(n.requires_quests)?n.requires_quests:[];
  const missing=req.filter(id=>!completed(id));
  const flags=Array.isArray(n.requires_flags)?n.requires_flags:[];
  const s=state(),missingFlags=flags.filter(id=>!s?.flags?.[id]);
  return {ok:missing.length===0&&missingFlags.length===0,missing,missingFlags}
}
function pushJournal(kind,title,text,meta={}){
  const s=state();if(!s)return;
  s.journal.unshift({kind,title,text,hour:nowHour(),turn:G?.turn||0,...meta});
  if(s.journal.length>30)s.journal.length=30
}
function markQuestCompleted(t,q){
  const n=t?.narrative,s=state();if(!n||!s)return;
  if(!s.completedQuestTemplates.includes(t.id))s.completedQuestTemplates.push(t.id);
  for(const flag of n.completion_flags||[])s.flags[flag]={hour:nowHour(),questId:t.id};
  if(n.local_state&&typeof n.local_state==="object")Object.assign(s.localStates,n.local_state);
  if(n.thread_id)s.threadUpdates[n.thread_id]={hour:nowHour(),questId:t.id,stage:n.stage??null};
  pushJournal("quest",t.name,n.aftermath||"此委託已成為阿斯戴爾地方紀錄的一部分。",{threadId:n.thread_id,questId:t.id});
  try{if(typeof log==="function")log("劇情",t.name+"："+(n.aftermath||"後續地方狀態已更新。"),"ok")}catch(error){}
}
function recordEventOutcome(t,choice){
  const n=t?.narrative,s=state();if(!n||!s)return;
  if(choice==="leave"){
    s.eventOutcomes[t.id]={choice:"leave",success:null,hour:nowHour()};
    pushJournal("event",t.name,"你沒有介入；事件保留為未處理地方紀錄。",{threadId:n.thread_id,eventId:t.id});
    return
  }
  const ev=(G?.worldState?.integratedEvents||[]).find(x=>x?.type==="adventure_event"&&x?.data?.templateId===t.id);
  const success=typeof ev?.data?.success==="boolean"?ev.data.success:null;
  s.eventOutcomes[t.id]={choice:"engage",success,hour:nowHour()};
  const flag=success===true?n.success_flag:success===false?n.failure_flag:null;
  if(flag)s.flags[flag]={hour:nowHour(),eventId:t.id,success};
  if(n.event_state&&typeof n.event_state==="object")Object.assign(s.localStates,n.event_state);
  pushJournal("event",t.name,(success===true?"成功處理。":success===false?"未成功處理。":"已介入。")+" "+(n.aftermath||""),{threadId:n.thread_id,eventId:t.id,success})
}
function threadProgress(th){
  const ids=Array.isArray(th?.stages)?th.stages:[];
  const done=ids.filter(completed);
  let next=null;
  for(const id of ids){if(completed(id))continue;const t=template(id);if(t&&gate(t).ok){next=t;break}}
  return {done:done.length,total:ids.length,next}
}
function openAsdailNarrativePanel(){
  const s=state();
  const rows=THREADS().map(th=>{
    const p=threadProgress(th),pct=p.total?Math.round(p.done/p.total*100):0;
    const next=p.next?"下一步："+esc(p.next.name):p.done>=p.total?"此線目前階段已完成":"前置條件尚未達成";
    return '<div class="card"><b>'+esc(th.name)+'</b> <span class="tier">'+esc(th.tier)+'</span><br><span class="small">'+esc(th.theme||"")+'<br>進度 '+p.done+'/'+p.total+'（'+pct+'%）｜'+next+'<br>'+esc(th.resolution||"")+'</span></div>'
  }).join("")||'<div class="card small">目前沒有阿斯戴爾劇情鏈資料。</div>';
  const recent=(s?.journal||[]).slice(0,8).map(x=>'<div class="small">'+esc(x.title)+'｜'+esc(x.text)+'</div>').join("")||'<div class="small">尚無深化劇情紀錄。</div>';
  if(typeof showModal==="function")showModal("阿斯戴爾・劇情脈絡",'<div class="card small">後續委託依前置成果逐步解鎖；奇遇成功與失敗會留下線索紀錄，但不以隨機奇遇鎖死主要委託鏈。</div>'+rows+'<div class="card"><b>近期後果</b>'+recent+'</div>')
}
function patchGuild(){
  if(globalThis.__ASD_NARRATIVE_GUILD_PATCHED)return;
  const baseGuild=globalThis.guildQuests,baseAccept=globalThis.acceptGuildQuest;
  if(typeof baseGuild==="function"){
    globalThis.guildQuests=function(){
      if(typeof G==="undefined"||!G?.character)return baseGuild.apply(this,arguments);
      state();
      const original=DBX.quest_templates;
      const active=new Set((G.quests||[]).map(q=>q.templateId));
      const locked=original.filter(q=>q?.narrative&&!active.has(q.id)&&!gate(q).ok);
      DBX.quest_templates=original.filter(q=>!q?.narrative||active.has(q.id)||gate(q).ok);
      let result;
      try{result=baseGuild.apply(this,arguments)}
      finally{DBX.quest_templates=original}
      if(locked.length&&typeof document!=="undefined"&&document.querySelector){
        setTimeout(()=>{
          const body=document.querySelector("#modalBody");
          if(!body||body.querySelector("[data-asd-narrative-locks]"))return;
          const box=document.createElement("div");box.className="card small";box.dataset.asdNarrativeLocks="1";
          box.textContent="劇情前置尚未完成："+locked.length+" 個後續委託會在完成相關調查後自動出現。";
          body.appendChild(box)
        },0)
      }
      return result
    }
  }
  if(typeof baseAccept==="function"){
    globalThis.acceptGuildQuest=function(templateId){
      const t=template(templateId),g=gate(t);
      if(t?.narrative&&!g.ok){
        const names=g.missing.map(id=>template(id)?.name||id);
        if(typeof alert==="function")alert("此委託尚未解鎖。前置："+(names.join("、")||"地方劇情條件"));
        return
      }
      return baseAccept.apply(this,arguments)
    }
  }
  globalThis.__ASD_NARRATIVE_GUILD_PATCHED=true
}
function patchTurnIn(){
  if(globalThis.__ASD_NARRATIVE_TURNIN_PATCHED)return;
  const base=globalThis.turnInQuest;if(typeof base!=="function")return;
  globalThis.turnInQuest=function(id){
    const q=G?.quests?.find(x=>x.id===id),t=q?template(q.templateId):null,wasReady=q?.status==="ready";
    const result=base.apply(this,arguments);
    if(q&&t?.narrative&&wasReady&&!(G?.quests||[]).some(x=>x.id===q.id)){
      markQuestCompleted(t,q);
      try{if(typeof persist==="function")persist()}catch(error){}
    }
    return result
  };
  globalThis.turnInGuildQuest=function(id){return globalThis.turnInQuest(id)};
  globalThis.__ASD_NARRATIVE_TURNIN_PATCHED=true
}
function patchAdventure(){
  if(globalThis.__ASD_NARRATIVE_EVENT_PATCHED)return;
  const base=globalThis.resolveAdventureEvent;if(typeof base!=="function")return;
  globalThis.resolveAdventureEvent=function(choice){
    const pending=G?.pendingAdventureEvent,t=pending?((DBX.adventure_event_templates||[]).find(x=>x.id===pending.templateId)||null):null;
    const result=base.apply(this,arguments);
    if(t?.narrative){
      recordEventOutcome(t,choice);
      try{if(typeof persist==="function")persist()}catch(error){}
    }
    return result
  };
  globalThis.__ASD_NARRATIVE_EVENT_PATCHED=true
}
function patchMoreMenu(){
  if(globalThis.__ASD_NARRATIVE_MENU_PATCHED)return;
  const base=globalThis.openMoreMenu;if(typeof base!=="function")return;
  globalThis.openMoreMenu=function(){
    const result=base.apply(this,arguments);
    if(typeof document!=="undefined"&&document.querySelector)setTimeout(()=>{
      const grid=document.querySelector("#modalBody .more-grid");
      if(!grid||grid.querySelector("[data-asd-narrative]"))return;
      const b=document.createElement("button");b.className="more-card";b.dataset.asdNarrative="1";
      b.innerHTML='<span class="more-icon">◇</span><span>區域劇情</span>';
      b.addEventListener("click",openAsdailNarrativePanel);grid.appendChild(b)
    },0);
    return result
  };
  globalThis.__ASD_NARRATIVE_MENU_PATCHED=true
}
function audit(){
  const issues=[],qids=new Set(quests().map(x=>x?.id).filter(Boolean)),lids=new Set((DBX.locations||[]).map(x=>x?.id).filter(Boolean));
  for(const q of quests().filter(x=>x?.narrative))for(const id of q.narrative.requires_quests||[])if(!qids.has(id))issues.push("劇情前置委託缺失:"+q.id+"->"+id);
  for(const th of THREADS())for(const id of th.stages||[])if(!qids.has(id))issues.push("劇情階段委託缺失:"+th.id+"->"+id);
  for(const e of (DBX.adventure_event_templates||[]).filter(x=>x?.narrative))for(const id of e.location_ids||[])if(!lids.has(id))issues.push("劇情奇遇地點缺失:"+e.id+"->"+id);
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{threads:THREADS().length,narrativeQuests:quests().filter(x=>x?.narrative).length,narrativeEvents:(DBX.adventure_event_templates||[]).filter(x=>x?.narrative).length}}
}

patchGuild();patchTurnIn();patchAdventure();patchMoreMenu();
globalThis.openAsdailNarrativePanel=openAsdailNarrativePanel;
globalThis.asdailNarrativeQuestGate=gate;
globalThis.runAsdailNarrativeAudit=audit;
DBX.asdail_narrative_runtime_system={version:REV,release:RELEASE,save_compatible:true,initial_audit:audit()};
if(CORE?.registerModule)CORE.registerModule("src/asdail-narrative-runtime-v1.js",{domain:"runtime",revision:REV,release:RELEASE});
})();