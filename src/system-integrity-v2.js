/* 群陸旅誌：系統完整性修正（動態發布版） CURRENT-2.07.3
 * SYSTEM-INTEGRITY-2.0
 * 版本同步／舊存檔遷移閘門／跨模組稽核／職業技能整合／狀態修復
 */
(()=>{
  if(typeof DB!=="object"||!DB)return;

  const titleRelease=typeof document!=="undefined"?(String(document.title||"").match(/CURRENT-\d+\.\d+\.\d+/)?.[0]||""):"";
  const RELEASE=globalThis.QUNLU_RELEASE_VERSION||titleRelease||DB.meta?.current_version||"CURRENT-2.07.3";
  const REVISION="SYSTEM-INTEGRITY-2.3";
  const LEGACY_RUNTIME_VERSION="CURRENT-1.57.0";
  const CFG={event_limit:80,seen_limit:220,repair_interval_ms:60000,audit_interval_ms:60000,persist_after_repair:true};

  DB.meta=DB.meta||{};
  DB.meta.current_version=RELEASE;
  DB.meta.system_integrity_revision=REVISION;
  DB.system_integrity_system={
    version:REVISION,
    release_source:"document_title_or_release_sync",
    scope:["版本同步","存檔遷移","事件去重","NPC狀態完整性","跨模組版本一致性","職業／技能結構","組織／流派全鏈路"],
    rules:[
      "CURRENT-1.57.0以前的存檔才執行舊runtime完整遷移；完整性模組不再以舊發布常數反向降版。",
      "每次寫入本機存檔前，G.meta.version必須與DB.meta.current_version同步。",
      "NPC第一、第二階段與自主世界事件依事件ID去重，不修改事件內容與遊戲結果。",
      "職業與技能完整性由CLASS-SKILL-OPT-1.0共同稽核，既有角色技能XP與職業進度不得被重置。",
      "組織／流派稽核涵蓋會員、貢獻、職位、內部委託、捐贈、規模、寶庫、獨有裝備技能與來源索引。","自檢只修復可確定的結構性問題，不刪除角色進度、不重置人物關係、不繞過資格規則。","啟動與手動開啟執行完整稽核；回到分頁與定時排程僅執行狀態修復；每5回合主runtime完整自檢規則保持不變。"
    ],
    save_schema_changed:false,
    destructive_repairs:false
  };

  function parseVersion(value){const m=String(value||"").match(/CURRENT-(\d+)\.(\d+)\.(\d+)/);return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null}
  function compareVersion(a,b){const av=parseVersion(a),bv=parseVersion(b);if(!av||!bv)return null;for(let i=0;i<3;i++){if(av[i]!==bv[i])return av[i]>bv[i]?1:-1}return 0}
  function game(){try{return typeof G!=="undefined"?G:null}catch(e){return null}}
  function syncGameVersion(){const g=game();DB.meta.current_version=RELEASE;if(!g)return false;g.meta=g.meta&&typeof g.meta==="object"?g.meta:{};const changed=g.meta.version!==RELEASE;g.meta.version=RELEASE;return changed}
  function uniqStrings(list,limit=CFG.seen_limit){const out=[];for(const v of (Array.isArray(list)?list:[])){const s=String(v||"");if(!s||out.includes(s))continue;out.push(s);if(out.length>=limit)break}return out}
  function dedupeEvents(list,limit=CFG.event_limit){const out=[],seen=new Set();let changed=false;for(const row of (Array.isArray(list)?list:[])){const key=row?.id?String(row.id):null;if(key&&seen.has(key)){changed=true;continue}if(key)seen.add(key);out.push(row);if(out.length>=limit){if((list||[]).length>out.length)changed=true;break}}if(!Array.isArray(list)||out.length!==list.length)changed=true;return {list:out,changed}}
  function duplicateIds(list,key="id"){const seen=new Set(),dupes=[];for(const row of (Array.isArray(list)?list:[])){const id=row?.[key];if(!id)continue;if(seen.has(id)&&!dupes.includes(id))dupes.push(id);seen.add(id)}return dupes}
  function knownNpcIds(){return new Set((DB.regional_npc_archetypes||[]).map(x=>x.id).filter(Boolean))}
  function knownQuestIds(){return new Set([...(DB.quest_templates||[]),...(DB.shop_quests||[])].map(x=>x.id).filter(Boolean))}

  function repairWorldState(){
    const g=game();if(!g?.worldState)return {changed:false,repairs:[]};
    let changed=false;const repairs=[];
    const containers=[[g.worldState.worldAutonomy2,"events","自主世界事件"],[g.worldState.npcDepth,"events","NPC第一階段事件"],[g.worldState.npcDepth2,"events","NPC第二階段事件"]];
    for(const [obj,key,label] of containers){if(!obj||typeof obj!=="object")continue;const r=dedupeEvents(obj[key]);if(r.changed){obj[key]=r.list;changed=true;repairs.push(`${label}去重／裁切`)}}
    const n2=g.worldState.npcDepth2;
    if(n2&&typeof n2==="object"){
      for(const key of ["seenWorldEvents","seenNpcEvents","appliedPlayerEvents"]){const before=Array.isArray(n2[key])?n2[key]:[],after=uniqStrings(before);if(after.length!==before.length||!Array.isArray(n2[key])){n2[key]=after;changed=true;repairs.push(`${key}去重`)}}
      if(n2.npcs&&typeof n2.npcs==="object")for(const s of Object.values(n2.npcs)){if(!s||typeof s!=="object")continue;const before=Number(s.playerImpression||0),after=Math.max(-50,Math.min(50,before));if(before!==after){s.playerImpression=after;changed=true;repairs.push("NPC工作圈口碑越界修正")}if(Array.isArray(s.knowledge)&&s.knowledge.length>12){s.knowledge=s.knowledge.slice(0,12);changed=true;repairs.push("NPC情報上限修正")}}
    }
    if(typeof globalThis.syncClassSkillOptimizationState==="function")try{if(globalThis.syncClassSkillOptimizationState()){changed=true;repairs.push("既有角色技能欄位同步")}}catch(e){}
    if(typeof globalThis.repairAffiliationIntegrityState==="function")try{const ar=globalThis.repairAffiliationIntegrityState();if(ar?.changed){changed=true;repairs.push(...(ar.repairs||["組織／流派狀態修復"]))}}catch(e){}
    if(syncGameVersion()){changed=true;repairs.push("存檔版本同步")}
    return {changed,repairs:[...new Set(repairs)]}
  }

  function runAudit(repair=true){
    const g=game(),checks=[];const add=(id,pass,value=null,detail="")=>checks.push({id,pass:!!pass,value,detail});
    add("db_version",DB.meta?.current_version===RELEASE,DB.meta?.current_version,"資料庫版本需與發布版一致");
    add("market_revision",DB.meta?.market_economy_revision==="MARKET-PRICE-SYNC-2.0",DB.meta?.market_economy_revision);
    add("world_revision",DB.meta?.world_autonomy_revision==="WORLD-AUTONOMY-2.1",DB.meta?.world_autonomy_revision);
    add("npc_revision",DB.meta?.npc_depth_revision==="NPC-DEPTH-2.0",DB.meta?.npc_depth_revision);
    add("class_skill_revision",DB.meta?.class_skill_revision==="CLASS-SKILL-OPT-1.0",DB.meta?.class_skill_revision);
    add("npc_phase1_api",typeof globalThis.ensureNpcDepthState==="function"&&typeof globalThis.npcDepthHeartbeat==="function");
    add("npc_phase2_api",typeof globalThis.ensureNpcDepth2State==="function"&&typeof globalThis.npcDepth2Heartbeat==="function"&&typeof globalThis.runNpcDepth2SelfCheck==="function");
    add("world_api",typeof globalThis.phase2Heartbeat==="function"&&typeof globalThis.worldNpcCurrentState==="function");
    add("market_api",typeof globalThis.itemTradeFlowFactor==="function"&&typeof globalThis.itemTradePressure==="function");
    add("class_skill_api",typeof globalThis.runClassSkillOptimizationAudit==="function"&&typeof globalThis.classMasteryOptimizedGain==="function");

    const idGroups=[["item_ids",DB.items||[]],["location_ids",DB.locations||[]],["monster_ids",DB.monsters||[]],["quest_ids",[...(DB.quest_templates||[]),...(DB.shop_quests||[])]],["npc_ids",DB.regional_npc_archetypes||[]],["class_ids",DB.combat_classes||[]]];
    for(const [id,list] of idGroups){const d=duplicateIds(list);add(id,d.length===0,d.length,d.length?`重複：${d.slice(0,6).join("、")}`:"")}

    const npcIds=knownNpcIds(),profiles=DB.npc_personality_profiles||[],profileMissing=profiles.filter(p=>!npcIds.has(p.npc_id)).map(p=>p.npc_id);add("npc_profile_refs",profiles.length>=18&&profileMissing.length===0,profiles.length,profileMissing.join("、"));
    const badEdges=(DB.npc_relationship_edges||[]).filter(e=>!npcIds.has(e.a)||!npcIds.has(e.b));add("npc_relation_refs",badEdges.length===0,badEdges.length,badEdges.slice(0,5).map(e=>`${e.a}->${e.b}`).join("、"));
    const qIds=knownQuestIds(),badPatrons=Object.entries(DB.npc_quest_patrons||{}).filter(([qid,nid])=>!qIds.has(qid)||!npcIds.has(nid));add("npc_quest_refs",badPatrons.length===0,badPatrons.length,badPatrons.slice(0,5).map(x=>x.join("->")).join("、"));

    if(g){add("save_version",g.meta?.version===RELEASE,g.meta?.version);add("character_present",!!g.character);add("world_state_present",!!g.worldState)}
    const npc2=typeof globalThis.runNpcDepth2SelfCheck==="function"?globalThis.runNpcDepth2SelfCheck():null;add("npc_depth2_selfcheck",!npc2||npc2.pass===true,npc2?.revision||null,npc2&&!npc2.pass?JSON.stringify(npc2.checks.filter(x=>!x.pass)):"");
    const cs=typeof globalThis.runClassSkillOptimizationAudit==="function"?globalThis.runClassSkillOptimizationAudit():null;add("class_skill_selfcheck",!cs||cs.high===0,cs?`H${cs.high}/M${cs.medium}/L${cs.low}`:null,cs?.issues?.filter(x=>x.severity==="high").slice(0,5).map(x=>`${x.name}:${x.text}`).join("；")||"");
    const ac=typeof globalThis.runAffiliationContributionAudit==="function"?globalThis.runAffiliationContributionAudit():null;add("affiliation_contribution_selfcheck",!ac||ac.pass===true,ac?.revision||null,ac?.issues?.slice(0,5).join("；")||"");
    const at=typeof globalThis.runAffiliationTreasuryDepthAudit==="function"?globalThis.runAffiliationTreasuryDepthAudit():null;add("affiliation_treasury_selfcheck",!at||at.pass===true,at?.revision||null,at?.issues?.slice(0,5).join("；")||"");
    const ai=typeof globalThis.runAffiliationIntegrityAudit==="function"?globalThis.runAffiliationIntegrityAudit():null;add("affiliation_integrity_selfcheck",!ai||ai.pass===true,ai?.revision||null,ai?.issues?.slice(0,5).join("；")||"");

    const repairResult=repair?repairWorldState():{changed:false,repairs:[]};
    const result={revision:REVISION,release:RELEASE,mode:"full-audit",pass:checks.every(x=>x.pass),checks,repair:repairResult,time:Date.now(),classSkill:cs,affiliationContribution:ac,affiliationTreasury:at,affiliationIntegrity:ai};
    const gg=game();if(gg?.worldState)gg.worldState.systemIntegrity=result;
    if(repairResult.changed&&CFG.persist_after_repair&&typeof originalPersist==="function")try{originalPersist()}catch(e){}
    return result
  }

  function runStateRepair(){
    const repairResult=repairWorldState();
    const g=game();
    if(g?.worldState){
      const previous=g.worldState.systemIntegrity&&typeof g.worldState.systemIntegrity==="object"?g.worldState.systemIntegrity:{};
      g.worldState.systemIntegrity={...previous,revision:REVISION,release:RELEASE,mode:"state-repair",repair:repairResult,time:Date.now()};
    }
    if(repairResult.changed&&CFG.persist_after_repair&&typeof originalPersist==="function")try{originalPersist()}catch(e){}
    return repairResult
  }

  const originalMigrateSave=typeof globalThis.migrateSave==="function"?globalThis.migrateSave:null;
  if(originalMigrateSave&&!globalThis.__SYSTEM_INTEGRITY2_MIGRATION_PATCHED){globalThis.migrateSave=function(){const g=game(),source=g?.meta?.version,cmp=compareVersion(source,LEGACY_RUNTIME_VERSION);let result;if(cmp===null||cmp<0)result=originalMigrateSave.apply(this,arguments);syncGameVersion();if(typeof globalThis.syncClassSkillOptimizationState==="function")try{globalThis.syncClassSkillOptimizationState()}catch(e){}return result};globalThis.__SYSTEM_INTEGRITY2_MIGRATION_PATCHED=true}
  const originalPersist=typeof globalThis.persist==="function"?globalThis.persist:null;
  if(originalPersist&&!globalThis.__SYSTEM_INTEGRITY2_PERSIST_PATCHED){globalThis.persist=function(){syncGameVersion();return originalPersist.apply(this,arguments)};globalThis.__SYSTEM_INTEGRITY2_PERSIST_PATCHED=true}
  const originalCreateCharacter=typeof globalThis.createCharacter==="function"?globalThis.createCharacter:null;
  if(originalCreateCharacter&&!globalThis.__SYSTEM_INTEGRITY2_CREATE_PATCHED){globalThis.createCharacter=function(){const result=originalCreateCharacter.apply(this,arguments);syncGameVersion();try{globalThis.persist?.()}catch(e){}return result};globalThis.__SYSTEM_INTEGRITY2_CREATE_PATCHED=true}

  function openSystemIntegrityPanel(){const result=runAudit(true),bad=result.checks.filter(x=>!x.pass),good=result.checks.length-bad.length,esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");const badHtml=bad.length?bad.map(x=>`<div class="small badText"><b>${esc(x.id)}</b>｜${esc(x.value??"")} ${esc(x.detail||"")}</div>`).join(""):"<div class='small ok'>未發現阻斷級整合錯誤。</div>";const repairs=result.repair.repairs.length?result.repair.repairs.map(x=>`<div class="small">• ${esc(x)}</div>`).join(""):"<div class='small'>本次沒有需要自動修復的狀態。</div>";const cs=result.classSkill?`<div class="small">職業／技能：高優先${result.classSkill.high}｜中優先${result.classSkill.medium}｜觀察${result.classSkill.low}</div>`:"";const ai=result.affiliationIntegrity?`<div class="small">組織／流派：${result.affiliationIntegrity.pass?"通過":"需檢查"}｜組織${result.affiliationIntegrity.stats?.organizations||0}／流派${result.affiliationIntegrity.stats?.disciplines||0}／寶庫物品${result.affiliationIntegrity.stats?.treasury_items||0}／獨有技能${result.affiliationIntegrity.stats?.exclusive_skills||0}</div>`:"";if(typeof showModal==="function")showModal("系統自檢",`<div class="card"><b>${esc(REVISION)}</b><br><span class="small">通過 ${good}/${result.checks.length} 項｜發布版 ${esc(RELEASE)}｜${result.pass?"核心檢查通過":"仍有需處理項目"}</span>${cs}${ai}</div><div class="card"><b>異常項目</b>${badHtml}</div><div class="card"><b>本次修復</b>${repairs}</div>`)}
  function patchMoreMenu(){if(globalThis.__SYSTEM_INTEGRITY2_MENU_PATCHED||typeof globalThis.openMoreMenu!=="function")return;const original=globalThis.openMoreMenu;globalThis.openMoreMenu=function(){const result=original.apply(this,arguments);setTimeout(()=>{const grid=typeof document!=="undefined"?document.querySelector("#modalBody .more-grid"):null;if(grid&&!grid.querySelector("[data-system-integrity]")){const b=document.createElement("button");b.className="more-card";b.dataset.systemIntegrity="1";b.innerHTML='<span class="more-icon">✓</span><span>系統自檢</span>';b.addEventListener("click",openSystemIntegrityPanel);grid.appendChild(b)}},0);return result};globalThis.__SYSTEM_INTEGRITY2_MENU_PATCHED=true}

  globalThis.runSystemIntegrityAudit=runAudit;globalThis.runSystemIntegrityStateRepair=runStateRepair;globalThis.openSystemIntegrityPanel=openSystemIntegrityPanel;globalThis.SYSTEM_INTEGRITY_CONFIG=Object.freeze({...CFG});
  patchMoreMenu();syncGameVersion();
  if(typeof window!=="undefined")window.addEventListener("load",()=>setTimeout(()=>runAudit(true),250),{once:true});
  if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>runStateRepair(),180)});
  setInterval(()=>{if(game()?.character)runStateRepair()},CFG.repair_interval_ms);
})();
