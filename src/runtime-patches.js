/*
 * 群陸旅誌 Runtime 補丁入口
 * 載入順序：runtime.js -> runtime-patches.js
 *
 * CURRENT-1.56.x：
 * - 創角職業資訊補強。
 * - 三槽手動存檔／讀取／刪除系統。
 *
 * 手動槽保存完整 G 世界狀態；既有 chronicle_save 繼續作為每回合自動恢復存檔。
 * 不修改角色與世界資料結構；手動槽使用獨立 envelope schema。
 */
(()=>{
  const cleanSkillName=value=>String(value||"")
    .replace(/－通用（(?:物理|魔法)系）/g,"")
    .replace(/\s+/g," ")
    .trim();

  function ensureClassDetailNode(){
    const randomCount=document.getElementById("randomCount");
    if(!randomCount)return null;
    let detail=document.getElementById("classCreationDetails");
    if(detail)return detail;

    detail=document.createElement("div");
    detail.id="classCreationDetails";
    detail.className="small";
    detail.setAttribute("aria-live","polite");
    Object.assign(detail.style,{
      marginTop:"10px",
      paddingTop:"10px",
      borderTop:"1px solid rgba(255,255,255,.12)",
      display:"grid",
      gap:"7px",
      lineHeight:"1.65"
    });
    randomCount.insertAdjacentElement("afterend",detail);
    return detail;
  }

  function appendDetailRow(host,label,value){
    const row=document.createElement("div");
    const title=document.createElement("b");
    title.textContent=`${label}｜`;
    const text=document.createElement("span");
    text.textContent=value;
    row.append(title,text);
    host.appendChild(row);
  }

  function classSkillSummary(c){
    const pool=Array.isArray(DB?.skill_pools?.[c.id])?DB.skill_pools[c.id]:[];
    const unique=[];
    for(const skill of pool){
      const name=cleanSkillName(skill?.name);
      if(!name||unique.includes(name))continue;
      unique.push(name);
    }
    const signature=unique.filter(name=>!String(pool.find(s=>cleanSkillName(s?.name)===name)?.name||"").includes("通用"));
    const examples=(signature.length>=3?signature:unique).slice(0,4);
    const elements=[...new Set(pool.map(s=>s?.element).filter(Boolean))].slice(0,4);
    const core=c.combat_role||c.design_identity||c.category||"職業專屬戰鬥方式";
    const exampleText=examples.length?`代表技能包含${examples.join("、")}`:"技能會依職業技能池逐步解鎖";
    const elementText=elements.length?`；可延伸${elements.join("、")}等元素運用`:"";
    return `以${core}為核心，${exampleText}${elementText}。`;
  }

  function renderCreationClassDetails(){
    const host=ensureClassDetailNode();
    if(!host)return;
    host.replaceChildren();

    const classId=(typeof creation!=="undefined"&&creation)?creation.classId:null;
    const c=classId&&Array.isArray(DB?.combat_classes)
      ?DB.combat_classes.find(entry=>entry.id===classId)
      :null;
    if(!c){
      const hint=document.createElement("span");
      hint.textContent="選取職業後顯示職業介紹、專長武器、職業定位與技能特色。";
      host.appendChild(hint);
      return;
    }

    const category=c.category||c.combat_track_label||"戰鬥職業";
    const primary=c.primary?`，主能力為${c.primary}`:"";
    const resource=c.resource_type?`，主要戰鬥資源為${c.resource_type}`:"";
    const sealed=c.sealed?"目前高階能力處於封印狀態，需依職業前置條件逐步解封。":"";
    const intro=`${c.name}屬於${category}${primary}${resource}。${sealed}`;
    const weapon=c.weapon_group||"依職業裝備規則";
    const role=c.combat_role||c.design_identity||"依職業能力配置";

    appendDetailRow(host,"職業介紹",intro);
    appendDetailRow(host,"專長武器",weapon);
    appendDetailRow(host,"職業定位",role);
    appendDetailRow(host,"技能特色",classSkillSummary(c));
  }

  const originalSelectClass=window.selectClass;
  if(typeof originalSelectClass==="function"){
    window.selectClass=function(id){
      const result=originalSelectClass.apply(this,arguments);
      renderCreationClassDetails();
      return result;
    };
  }

  const originalRollClass=window.rollClass;
  if(typeof originalRollClass==="function"){
    window.rollClass=function(){
      const result=originalRollClass.apply(this,arguments);
      renderCreationClassDetails();
      return result;
    };
  }

  renderCreationClassDetails();
  window.renderCreationClassDetails=renderCreationClassDetails;
})();

(()=>{
  const SLOT_COUNT=3;
  const SLOT_KEY_PREFIX="qunlu_manual_slot_";
  const SLOT_SCHEMA_VERSION=1;
  const AUTOSAVE_KEY="chronicle_save";
  let lastSlotMode="save";

  const slotKey=slot=>`${SLOT_KEY_PREFIX}${slot}`;
  const validSlot=slot=>Number.isInteger(Number(slot))&&Number(slot)>=1&&Number(slot)<=SLOT_COUNT;
  const deepClone=value=>JSON.parse(JSON.stringify(value));
  const esc=value=>String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");

  function stateTimeText(state){
    const t=state?.worldTime;
    if(!t)return "未知遊戲時間";
    return `紀元${t.year}年・${t.season}・第${t.day}日 ${String(t.hour??0).padStart(2,"0")}:${String(t.minute??0).padStart(2,"0")}`;
  }

  function realTimeText(value){
    if(!value)return "未知";
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return String(value);
    try{return d.toLocaleString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false})}
    catch(e){return d.toISOString()}
  }

  function classNameFor(state){
    const id=state?.character?.classId;
    const c=Array.isArray(DB?.combat_classes)?DB.combat_classes.find(x=>x.id===id):null;
    return c?.name||id||"未知職業";
  }

  function locationNameFor(state){
    const id=state?.character?.locationId;
    const l=Array.isArray(DB?.locations)?DB.locations.find(x=>x.id===id):null;
    return l?.name||id||"未知地點";
  }

  function buildMetadata(state,savedAt=new Date().toISOString()){
    const c=state?.character||{};
    return {
      characterId:state?.meta?.characterId||c.id||null,
      characterName:c.name||"未命名角色",
      level:Number(c.level||1),
      classId:c.classId||null,
      className:classNameFor(state),
      adventureRank:c.adventureRank||"F",
      locationId:c.locationId||null,
      locationName:locationNameFor(state),
      turn:Number(state?.turn||0),
      worldTimeText:stateTimeText(state),
      savedAt,
      gameVersion:state?.meta?.version||((typeof CURRENT_VERSION!=="undefined")?CURRENT_VERSION:"unknown")
    };
  }

  function readManualSlot(slot){
    if(!validSlot(slot))return {slot:Number(slot),occupied:false,error:"無效存檔槽"};
    let raw=null;
    try{raw=window.localStorage?localStorage.getItem(slotKey(Number(slot))):null}
    catch(e){return {slot:Number(slot),occupied:false,error:"無法讀取瀏覽器儲存空間"}}
    if(!raw)return {slot:Number(slot),occupied:false,error:null};
    try{
      const envelope=JSON.parse(raw);
      if(!envelope||typeof envelope!=="object"||!envelope.gameState)throw new Error("缺少遊戲狀態");
      const schema=Number(envelope.schemaVersion||1);
      if(schema>SLOT_SCHEMA_VERSION)throw new Error(`存檔格式 v${schema} 高於目前支援版本`);
      const state=envelope.gameState;
      if(!state?.meta||!state?.character||!state?.worldTime)throw new Error("存檔核心欄位不完整");
      envelope.schemaVersion=schema;
      envelope.slot=Number(slot);
      envelope.metadata={...buildMetadata(state,envelope.savedAt||envelope.metadata?.savedAt),...(envelope.metadata||{})};
      return {slot:Number(slot),occupied:true,error:null,envelope};
    }catch(e){
      return {slot:Number(slot),occupied:true,error:`存檔資料損毀：${e.message||e}`};
    }
  }

  function manualSlotRecords(){return Array.from({length:SLOT_COUNT},(_,i)=>readManualSlot(i+1))}
  function occupiedSlotCount(){return manualSlotRecords().filter(x=>x.occupied&&!x.error).length}

  function hasManualSaveForCharacter(characterId){
    if(!characterId)return false;
    return manualSlotRecords().some(x=>x.occupied&&!x.error&&x.envelope?.metadata?.characterId===characterId);
  }

  function slotCardHtml(record,mode){
    const slot=record.slot;
    if(record.error){
      return `<div class="card"><b>存檔槽 ${slot}</b><br><span class="small badText">${esc(record.error)}</span><div class="actions"><button class="bad" onclick="deleteManualSlot(${slot},'${mode}')">刪除損毀存檔</button></div></div>`;
    }
    if(!record.occupied){
      return `<div class="card"><b>存檔槽 ${slot}</b><br><span class="small">空白存檔槽</span><div class="actions">${mode==="save"?`<button class="good" onclick="saveToManualSlot(${slot})">儲存至此槽</button>`:`<button disabled>無存檔可讀取</button>`}</div></div>`;
    }

    const m=record.envelope.metadata||{};
    const state=record.envelope.gameState||{};
    const action=mode==="save"
      ?`<button class="good" onclick="saveToManualSlot(${slot})">覆蓋／儲存至此槽</button>`
      :`<button class="good" onclick="loadManualSlot(${slot})">讀取此存檔</button>`;
    return `<div class="card"><b>存檔槽 ${slot}</b><br><b>${esc(m.characterName||"未命名角色")}</b><br><span class="small">Lv.${esc(m.level??state?.character?.level??1)}｜${esc(m.className||classNameFor(state))}｜冒險者［${esc(m.adventureRank||state?.character?.adventureRank||"F")}］<br>所在地：${esc(m.locationName||locationNameFor(state))}<br>遊戲時間：${esc(m.worldTimeText||stateTimeText(state))}<br>回合：${esc(m.turn??state?.turn??0)}<br>最後儲存：${esc(realTimeText(m.savedAt||record.envelope.savedAt))}</span><div class="actions">${action}<button class="bad" onclick="deleteManualSlot(${slot},'${mode}')">刪除存檔</button></div></div>`;
  }

  function saveSlotSummaryNode(){
    const records=manualSlotRecords();
    const node=document.createElement("div");
    node.className="card";
    const occupied=records.filter(x=>x.occupied&&!x.error).length;
    const damaged=records.filter(x=>x.error).length;
    const currentName=(typeof G!=="undefined"&&G?.character?.name)?G.character.name:"尚未開始";
    node.innerHTML=`<b>存檔管理</b><br><span class="small">手動存檔槽：${occupied}/${SLOT_COUNT}${damaged?`｜異常 ${damaged}`:""}<br>目前角色：${esc(currentName)}<br>每回合自動恢復存檔與三個手動槽彼此獨立。</span>`;
    return node;
  }

  function showSaveSlotModal(mode="save"){
    mode=mode==="load"?"load":"save";
    lastSlotMode=mode;
    if(mode==="save"&&(!(typeof G!=="undefined")||!G?.character)){
      alert("目前沒有可儲存的遊戲進度。");
      return;
    }
    const records=manualSlotRecords();
    const intro=mode==="save"
      ?"選擇一個存檔槽保存目前角色與完整世界進度。已有資料的槽位會先要求確認後才覆蓋。"
      :"選擇任一存檔槽讀取角色與完整世界進度。讀取後目前自動恢復進度會切換成該角色。";
    const cards=records.map(r=>slotCardHtml(r,mode)).join("");
    const footer=(typeof G!=="undefined"&&G?.character)?`<div class="actions"><button onclick="openSettings()">返回設定</button></div>`:"";
    showModal(mode==="save"?"手動存檔":"讀取存檔",`<div class="card small">${intro}</div>${cards}${footer}`);
  }

  function saveToManualSlot(slot){
    slot=Number(slot);
    if(!validSlot(slot)||!(typeof G!=="undefined")||!G?.character){alert("目前沒有可儲存的遊戲進度。");return}
    const existing=readManualSlot(slot);
    if(existing.occupied&&!existing.error){
      const oldName=existing.envelope?.metadata?.characterName||"既有角色";
      if(!confirm(`存檔槽 ${slot} 已有「${oldName}」的進度。\n確定要覆蓋嗎？`))return;
    }else if(existing.error){
      if(!confirm(`存檔槽 ${slot} 的資料目前無法讀取。\n確定要用目前進度覆蓋它嗎？`))return;
    }

    const savedAt=new Date().toISOString();
    const state=deepClone(G);
    state.meta=state.meta||{};
    state.meta.saveIndex=Array.isArray(state.meta.saveIndex)?state.meta.saveIndex:[];
    const saveId=`SLOT${slot}-${String(state.meta.characterId||state.character?.id||"CHAR").slice(-6)}-T${String(state.turn||0).padStart(5,"0")}`;
    state.meta.saveIndex.push({id:saveId,turn:state.turn||0,time:stateTimeText(state),type:"MANUAL",reason:`手動存檔槽 ${slot}`});
    if(state.meta.saveIndex.length>180)state.meta.saveIndex=state.meta.saveIndex.slice(-180);
    const envelope={
      schemaVersion:SLOT_SCHEMA_VERSION,
      gameVersion:state.meta.version||((typeof CURRENT_VERSION!=="undefined")?CURRENT_VERSION:"unknown"),
      slot,
      savedAt,
      metadata:buildMetadata(state,savedAt),
      gameState:state
    };

    try{
      if(!window.localStorage)throw new Error("瀏覽器未提供本機儲存空間");
      localStorage.setItem(slotKey(slot),JSON.stringify(envelope));
    }catch(e){
      if(typeof renderSaveHealth==="function")renderSaveHealth(`手動存檔失敗：${e.message||e}`);
      alert(`手動存檔失敗：${e.message||e}`);
      return;
    }

    G.meta=G.meta||{};
    G.meta.saveIndex=Array.isArray(G.meta.saveIndex)?G.meta.saveIndex:[];
    G.meta.saveIndex.push({id:saveId,turn:G.turn||0,time:(typeof timeText==="function"?timeText():stateTimeText(G)),type:"MANUAL",reason:`手動存檔槽 ${slot}`});
    if(G.meta.saveIndex.length>180)G.meta.saveIndex=G.meta.saveIndex.slice(-180);
    if(typeof log==="function")log("存檔",`已儲存至手動存檔槽 ${slot}。`,"save");
    if(typeof persist==="function")persist();
    if(typeof renderAll==="function")renderAll();
    showSaveSlotModal("save");
  }

  function loadManualSlot(slot){
    slot=Number(slot);
    if(!validSlot(slot))return;
    const record=readManualSlot(slot);
    if(!record.occupied){alert(`存檔槽 ${slot} 是空白的。`);return}
    if(record.error){alert(record.error);return}
    const name=record.envelope?.metadata?.characterName||"此角色";
    if(!confirm(`讀取存檔槽 ${slot}「${name}」？\n目前尚未手動保存的進度將由此存檔取代。`))return;

    const previous=(typeof G!=="undefined")?G:null;
    try{
      const candidate=deepClone(record.envelope.gameState);
      if(!candidate?.meta||!candidate?.character||!candidate?.worldTime)throw new Error("存檔核心欄位不完整");
      G=candidate;
      if(typeof migrateSave==="function")migrateSave();
      if(!G?.meta||!G?.character||!G?.worldTime)throw new Error("存檔轉換後驗證失敗");
      if(typeof persist==="function")persist();
      if(typeof closeModal==="function")closeModal();
      if(typeof enterGame==="function")enterGame(true);
      if(typeof log==="function")log("存檔",`已讀取手動存檔槽 ${slot}：${name}。`,"save");
      if(typeof persist==="function")persist();
    }catch(e){
      G=previous;
      alert(`此存檔無法讀取。\n目前遊戲進度沒有受到影響。\n${e.message||e}`);
      if(previous&&typeof renderAll==="function")renderAll();
    }
  }

  function deleteManualSlot(slot,mode=lastSlotMode){
    slot=Number(slot);
    if(!validSlot(slot))return;
    const record=readManualSlot(slot);
    if(!record.occupied)return;
    const name=record.error?`存檔槽 ${slot}`:(record.envelope?.metadata?.characterName||`存檔槽 ${slot}`);
    if(!confirm(`確定永久刪除「${name}」的存檔嗎？\n此操作無法復原。`))return;
    try{localStorage.removeItem(slotKey(slot))}
    catch(e){alert(`刪除失敗：${e.message||e}`);return}
    showSaveSlotModal(mode==="load"?"load":"save");
  }

  function ensureCreationLoadButton(){
    const panel=document.getElementById("createPanel");
    if(!panel||document.getElementById("creationLoadSaveButton"))return;
    const primary=panel.querySelector("button.primary");
    if(!primary)return;
    const box=document.createElement("div");
    box.className="card";
    box.id="creationSaveLoadBox";
    box.innerHTML=`<b>既有角色</b><br><span class="small">可從三個手動存檔槽切換至另一名角色；手動槽不會被每回合自動存檔覆蓋。</span><div class="actions"><button type="button" id="creationLoadSaveButton">讀取存檔（${occupiedSlotCount()}/${SLOT_COUNT}）</button></div>`;
    primary.insertAdjacentElement("beforebegin",box);
    box.querySelector("#creationLoadSaveButton")?.addEventListener("click",()=>showSaveSlotModal("load"));
  }

  const originalOpenSettings=window.openSettings;
  if(typeof originalOpenSettings==="function"){
    window.openSettings=function(){
      const result=originalOpenSettings.apply(this,arguments);
      const body=document.getElementById("modalBody");
      if(!body)return result;
      const buttons=[...body.querySelectorAll("button")];
      const manualButton=buttons.find(btn=>String(btn.getAttribute("onclick")||"").replace(/\s+/g,"")==="manualSave()");
      if(manualButton){
        manualButton.textContent="手動存檔";
        const loadButton=document.createElement("button");
        loadButton.type="button";
        loadButton.textContent="讀取存檔";
        loadButton.addEventListener("click",()=>showSaveSlotModal("load"));
        manualButton.insertAdjacentElement("afterend",loadButton);
      }
      const firstCard=body.querySelector(".card");
      const summary=saveSlotSummaryNode();
      if(firstCard)firstCard.insertAdjacentElement("afterend",summary);
      else body.prepend(summary);
      return result;
    };
  }

  window.manualSave=function(){showSaveSlotModal("save")};
  window.openManualSaveSlots=()=>showSaveSlotModal("save");
  window.openLoadSaveSlots=()=>showSaveSlotModal("load");
  window.saveToManualSlot=saveToManualSlot;
  window.loadManualSlot=loadManualSlot;
  window.deleteManualSlot=deleteManualSlot;

  const originalResetGame=window.resetGame;
  window.resetGame=function(){
    const current=(typeof G!=="undefined")?G:null;
    const currentId=current?.meta?.characterId||current?.character?.id||null;
    const protectedByManual=hasManualSaveForCharacter(currentId);
    const message=protectedByManual
      ?"確定建立新角色嗎？\n目前自動恢復進度會清除，但三個手動存檔槽都會保留。"
      :"目前角色尚未保存到任何手動存檔槽。\n建立新角色後，目前自動恢復進度會被清除。\n建議先取消並使用「手動存檔」。\n\n仍要建立新角色嗎？";
    if(!confirm(message))return;
    try{localStorage.removeItem(AUTOSAVE_KEY)}catch(e){}
    location.reload();
  };

  window.QUNLU_SAVE_SLOT_SYSTEM={
    version:"SAVE-SLOTS-1.0",
    slotCount:SLOT_COUNT,
    schemaVersion:SLOT_SCHEMA_VERSION,
    autosaveKey:AUTOSAVE_KEY,
    manualSlotPrefix:SLOT_KEY_PREFIX
  };

  window.addEventListener("load",()=>{
    ensureCreationLoadButton();
  },{once:true});

  /* CURRENT-2.12.0｜SUBJOB-EXAM-1.0：D級以上副職業動態晉階考核 */
  const SUBJOB_EXAM_REVISION="SUBJOB-EXAM-1.0";
  DB.meta.subjob_exam_revision=SUBJOB_EXAM_REVISION;
  DB.subjob_exam_system={
    version:SUBJOB_EXAM_REVISION,
    required_from_grade:"D",
    generation_factors:["副職業","種族／亞種","戰鬥職業／定位","天賦","政治體／文化圈","目前所在地","隨機權重"],
    objective_kinds:["gather","item","kill","hunt","patrol","action"],
    rules:[
      "晉升D級及以上前必須通過對應階級考核。",
      "副職業XP與角色等級達標後才可申請考核。",
      "考題從現行可完成委託目標池動態抽取，並依晉階級別調整工作量。",
      "考核失敗、逾期或放棄只使本次考核作廢，不扣公會信用或罰款。",
      "考核通過紀錄綁定副職業與目標階級；通過後才開放升級按鍵。"
    ],
    save_schema_changed:"additive"
  };
  if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(SUBJOB_EXAM_REVISION))){
    DB.integration_registry.optimization_notes.push("CURRENT-2.12.0／SUBJOB-EXAM-1.0：副職業晉升D～S級新增動態前置考核；考題依種族、戰鬥職業、天賦、政治體與所在地加權隨機推演，通過後才解鎖角色介面的升級按鍵。");
  }

  function ensureSubjobExamState(){
    const c=(typeof G!=="undefined"&&G)?.character;if(!c)return null;
    c.subjobExamPasses=c.subjobExamPasses&&typeof c.subjobExamPasses==="object"&&!Array.isArray(c.subjobExamPasses)?c.subjobExamPasses:{};
    c.subjobExamHistory=Array.isArray(c.subjobExamHistory)?c.subjobExamHistory:[];
    return c
  }
  function subjobExamKey(sid,targetGrade){return `${sid}:${targetGrade}`}
  function subjobExamRequired(targetGrade){return !!targetGrade&&tierOrder(targetGrade)>=tierOrder("D")}
  function subjobExamPassRecord(sid,targetGrade){const c=ensureSubjobExamState();return c?.subjobExamPasses?.[subjobExamKey(sid,targetGrade)]||null}
  function subjobExamPassed(sid,targetGrade){return !!subjobExamPassRecord(sid,targetGrade)}
  function subjobExamActive(sid,targetGrade){
    return ((typeof G!=="undefined"&&G)?.quests||[]).find(q=>q.sourceType==="subjob_exam"&&q.subjobExam?.sid===sid&&q.subjobExam?.targetGrade===targetGrade&&["active","ready"].includes(q.status))||null
  }
  function subjobExamHash(text){let h=2166136261>>>0;for(const ch of String(text||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0}
  function subjobExamVenue(sid){
    const c=ensureSubjobExamState(),sj=sub(sid),preferred=(sj?.facilities||[]).filter(fid=>DB.facilities[fid]),currentPolity=loc(c.locationId)?.political_entity_id,candidates=[];
    for(const l of DB.locations||[]){
      if(l.kind!=="town")continue;
      const travel=shortestTravelHours(c.locationId,l.id);if(!Number.isFinite(travel))continue;
      for(const fid of (l.facilities||[])){
        if(!preferred.includes(fid)&&fid!=="guild")continue;
        candidates.push({locationId:l.id,facilityId:fid,score:travel+(l.political_entity_id===currentPolity?0:72)+(preferred.includes(fid)?0:36)})
      }
    }
    candidates.sort((a,b)=>a.score-b.score);
    return candidates[0]||{locationId:c.locationId,facilityId:preferred[0]||"guild",score:999}
  }
  function subjobExamContext(sid,targetGrade,venue){
    const c=ensureSubjobExamState(),sj=sub(sid),cc=cls(c.classId),pc=politicalContextForLocation(venue?.locationId||c.locationId),talents=(c.talents||[]).map(talentById).filter(Boolean);
    const raceName=displayRace(),talentNames=talents.map(t=>t.name),polityName=pc.polity?.name||"無主地",cultureName=pc.culture?.name||"地方文化",regionName=pc.region?.name||pc.location?.name||"未知地區",currentLocationName=loc(c.locationId)?.name||c.locationId;
    const seedBase=[sid,targetGrade,raceName,cc?.id,talentNames.join("|"),pc.polity?.id,pc.culture?.id,currentLocationName,G.turn].join(":");
    const salt=(subjobExamHash(seedBase)^Math.floor(Math.random()*0xffffffff))>>>0;
    const focusPool=["現地應變與材料判讀","限時產出與品質控制","資源節約與風險處理","跨職協同與現場決策","地方規範與供應鏈應對","突發狀況下的專業判斷"];
    return {sid,targetGrade,subjobName:sj?.name||sid,raceName,className:cc?.name||c.classId,classRole:cc?.combat_role||"未定",talentNames,polityId:pc.polity?.id||null,polityName,cultureName,regionName,currentLocationName,focus:focusPool[salt%focusPool.length],salt}
  }
  function subjobExamKindWeights(ctx){
    const name=String(sub(ctx.sid)?.name||""),role=String(ctx.classRole||""),talentText=(ctx.talentNames||[]).join(""),w={gather:1.2,item:1.2,kill:1,hunt:1,patrol:1,action:1};
    if(/藥|煉金|草|醫|治療/.test(name)){w.gather+=2.4;w.item+=1.4;w.action+=.8}
    if(/料理|烹|廚|釀/.test(name)){w.gather+=1.4;w.item+=2;w.hunt+=.7}
    if(/鍛|冶|鐵|工匠|木工/.test(name)){w.item+=2;w.gather+=1.5;w.action+=.7}
    if(/裁縫|皮革|製皮|紡織/.test(name)){w.hunt+=1.2;w.item+=1.8;w.gather+=1}
    if(/附魔|魔導|符文|刻印/.test(name)){w.action+=2;w.item+=1.6;w.gather+=.7}
    if(/斥候|偵察|遠程|弓/.test(role)){w.patrol+=1.5;w.hunt+=1.2}
    if(/坦|前排|近戰|鬥士|守護/.test(role)){w.kill+=1.6;w.hunt+=1}
    if(/治療|支援|施法|法師/.test(role)){w.gather+=.8;w.item+=.8;w.action+=1.1}
    if(/採集|野外|幸運|敏銳|探索/.test(talentText)){w.gather+=.8;w.patrol+=.6}
    const keys=Object.keys(w);w[keys[ctx.salt%keys.length]]+=1.4;
    return w
  }
  function subjobExamTask(ctx){
    const weights=subjobExamKindWeights(ctx),targetIdx=tierOrder(ctx.targetGrade),seen=new Set(),candidates=[];
    for(const t of [...(DB.quest_templates||[]),...(DB.shop_quests||[])]){
      if(!t?.id||seen.has(t.id)||!weights[t.objective?.kind])continue;seen.add(t.id);
      const viable=questViableLocations(t).filter(id=>Number.isFinite(shortestTravelHours(G.character.locationId,id)));if(!viable.length)continue;
      const gap=Math.abs(targetIdx-tierOrder(t.tier||"F")),tierFit=Math.max(.35,3.6-gap*.7),contextNoise=(subjobExamHash(`${ctx.salt}:${t.id}`)%1000)/1000;
      candidates.push({base:t,viable,score:tierFit*(weights[t.objective.kind]||1)*(.72+contextNoise*.35+Math.random()*.55)})
    }
    candidates.sort((a,b)=>b.score-a.score);const pick=candidates[0];if(!pick)return null;
    const objective=JSON.parse(JSON.stringify(pick.base.objective||{})),mult={D:1,C:1.25,B:1.5,A:1.8,S:2.2}[ctx.targetGrade]||1;
    if(Number.isFinite(Number(objective.target))){
      const scaled=Math.max(1,Math.ceil(Number(objective.target||1)*mult));
      objective.target=objective.kind==="patrol"?Math.min((objective.checkpoints||[]).length||scaled,scaled):scaled
    }
    return {base:pick.base,objective,viable:pick.viable}
  }

  const originalMigrateSave=globalThis.migrateSave;
  if(typeof originalMigrateSave==="function"){
    globalThis.migrateSave=function(){const result=originalMigrateSave.apply(this,arguments);ensureSubjobExamState();return result};
  }

  const originalSubjobUpgradeState=globalThis.subjobUpgradeState;
  function examAwareSubjobUpgradeState(j){
    const base=typeof originalSubjobUpgradeState==="function"?originalSubjobUpgradeState(j):null;
    if(!base||base.max||!base.next)return base;
    const examRequired=subjobExamRequired(base.next),examPassed=!examRequired||subjobExamPassed(j.id,base.next),activeExam=examRequired?subjobExamActive(j.id,base.next):null;
    return {...base,examRequired,examPassed,activeExam,canUpgrade:base.xpReady&&base.levelReady&&examPassed}
  }
  globalThis.subjobUpgradeState=examAwareSubjobUpgradeState;

  globalThis.subjobProgressHtml=function(j){
    const d=sub(j.id),state=examAwareSubjobUpgradeState(j),name=d?.name||j.id,xp=formatSubjobXp(state.xp);
    if(state.max)return `<div class="subjob-progress-entry"><div class="subjob-progress-main"><b>${name}［${state.grade}］</b><br><span class="small">XP ${xp}/MAX｜已達最高階</span></div></div>`;
    const need=Number.isFinite(state.need)?formatSubjobXp(state.need):"—",levelHint=state.levelReady?"":`｜需角色Lv${state.levelNeed}`,examHint=state.examRequired?(state.examPassed?"｜考核已通過":state.activeExam?"｜考核進行中":"｜需通過晉階考核"):"";
    let action="";
    if(state.canUpgrade)action=`<button type="button" class="good" onclick="upgradeSubjob('${j.id}')">升級［${state.next}］</button>`;
    else if(state.examRequired&&state.xpReady&&state.levelReady&&!state.examPassed)action=state.activeExam?`<button type="button" onclick="openQuestLog()">查看［${state.next}］考核</button>`:`<button type="button" class="good" onclick="startSubjobExam('${j.id}')">申請［${state.next}］考核</button>`;
    else action=`<button type="button" disabled>${state.examRequired?"考核未開放":`升級［${state.next}］`}</button>`;
    return `<div class="subjob-progress-entry"><div class="subjob-progress-main"><b>${name}［${state.grade}］</b><br><span class="small">XP ${xp}/${need}${levelHint}${examHint}</span></div>${action}</div>`
  };

  function startSubjobExam(sid){
    const c=ensureSubjobExamState(),j=c?.subjobs?.find(x=>x.id===sid);if(!j)return;
    const state=examAwareSubjobUpgradeState(j),name=sub(sid)?.name||sid;
    if(!state?.next||!state.examRequired){globalThis.upgradeSubjob?.(sid);return}
    if(state.examPassed){alert(`${name}［${state.next}］考核已通過，可以直接升級。`);return}
    if(state.activeExam){openQuestLog();return}
    if(!state.xpReady){alert(`${name}副職業經驗不足：XP ${formatSubjobXp(state.xp)}/${formatSubjobXp(state.need)}。`);return}
    if(!state.levelReady){alert(`${name}申請［${state.next}］考核需要角色Lv${state.levelNeed}；目前Lv${G.character.level}。`);return}
    const venue=subjobExamVenue(sid),ctx=subjobExamContext(sid,state.next,venue),task=subjobExamTask(ctx);if(!task){alert("目前可達路網沒有可生成的副職業考題；移動到其他城鎮後再申請。");return}
    const baseHours=questTimeAllowance(task.base),timeLimit=Math.max(96,Math.min(480,Number.isFinite(baseHours)?Math.ceil(baseHours*(1+tierOrder(state.next)*.12)):168));
    const issuerPolity=politicalEntity(loc(venue.locationId)?.political_entity_id)||politicalContextForLocation().polity,facilityName=DB.facilities[venue.facilityId]?.name||"地方考核處",talentText=ctx.talentNames.length?ctx.talentNames.join("／"):"無特殊天賦";
    const q={id:`SJEX-${sid}-${state.next}-${Date.now().toString(36).slice(-6)}`,templateId:task.base.id,name:`${name}・［${state.next}］晉階考核`,tier:state.next,type:"副職業考核",
      description:`${issuerPolity?.name||ctx.polityName}的${facilityName}依角色背景臨時抽定「${task.base.name}」為考題。考核重點：${ctx.focus}。推演因子：種族 ${ctx.raceName}｜戰鬥職業 ${ctx.className}（${ctx.classRole}）｜天賦 ${talentText}｜政治體 ${ctx.polityName}｜文化 ${ctx.cultureName}｜申請地 ${ctx.currentLocationName}。`,
      objective:task.objective,progress:0,status:"active",acceptedHour:totalHours(),deadlineHour:totalHours()+timeLimit,timeLimitHours:timeLimit,rewardSilver:0,xp_reward:0,target_spawn_boost:task.base.target_spawn_boost||0,
      completionGraceHours:Math.max(24,DB.quest_system.report_grace_hours||24),viableLocationIds:task.viable,turninFacility:venue.facilityId,sourceType:"subjob_exam",sourceId:sid,
      subjobExam:{sid,fromGrade:state.grade,targetGrade:state.next,focus:ctx.focus,factors:{race:ctx.raceName,className:ctx.className,classRole:ctx.classRole,talents:[...ctx.talentNames],polityId:ctx.polityId,polityName:ctx.polityName,cultureName:ctx.cultureName,regionName:ctx.regionName,currentLocationName:ctx.currentLocationName},baseTemplateId:task.base.id,baseTemplateName:task.base.name,examinerLocationId:venue.locationId,examinerFacilityId:venue.facilityId,generatedTurn:G.turn}};
    closeModal();if(!beginTurn("申請副職業考核"))return;G.quests=G.quests||[];G.quests.push(q);syncQuestInventoryProgressOne(q,false);
    log("副職業考核",`已申請 ${name}［${state.next}］考核；考題「${task.base.name}」，完成後至${loc(venue.locationId)?.name||"指定城鎮"}・${facilityName}回報。`,"ok");endTurn(.2);openQuestLog()
  }
  globalThis.startSubjobExam=startSubjobExam;

  function turnInSubjobExam(q){
    ensureSubjobExamState();syncQuestInventoryProgressOne(q,true);const meta=q.subjobExam||{};
    if(q.status!=="ready"||G.character.currentFacility!==(q.turninFacility||"guild"))return;
    if(!questDeliveryReady(q)){alert(`回報考核需要保留 ${item(q.objective.item_id)?.name||q.objective.item_id} ×${q.objective.target}。`);return}
    const j=G.character.subjobs.find(x=>x.id===meta.sid);if(!j){alert("副職業資料不存在，無法完成考核。");return}
    if(!beginTurn("回報副職業考核"))return;if(questObjectiveConsumesItems(q))consumeIngredient(q.objective.item_id,q.objective.target||1);
    const record={id:q.id,sid:meta.sid,fromGrade:meta.fromGrade,targetGrade:meta.targetGrade,status:"通過",time:timeText(),turn:G.turn,focus:meta.focus,factors:meta.factors,baseTemplateId:meta.baseTemplateId};
    G.character.subjobExamPasses[subjobExamKey(meta.sid,meta.targetGrade)]=record;G.character.subjobExamHistory.unshift(record);if(G.character.subjobExamHistory.length>30)G.character.subjobExamHistory.length=30;
    G.questHistory=G.questHistory||[];G.questHistory.unshift({id:q.id,name:q.name,tier:q.tier,status:"考核通過",time:timeText(),sourceType:"subjob_exam",sourceId:meta.sid});if(G.questHistory.length>30)G.questHistory.length=30;
    G.quests=G.quests.filter(x=>x.id!==q.id);log("副職業考核",`${sub(meta.sid)?.name||meta.sid}［${meta.targetGrade}］考核通過；角色介面已解鎖晉階按鍵。`,"ok");endTurn(.2);openCharacter()
  }
  globalThis.turnInSubjobExam=turnInSubjobExam;

  const originalTurnInQuest=globalThis.turnInQuest;
  if(typeof originalTurnInQuest==="function"){
    globalThis.turnInQuest=function(id,returnView=null,returnArg=null){
      const q=(typeof G!=="undefined"&&G)?.quests?.find(x=>x.id===id);
      if(q?.sourceType==="subjob_exam")return turnInSubjobExam(q,returnView,returnArg);
      return originalTurnInQuest.call(this,id,returnView,returnArg)
    };
  }

  const originalQuestPenaltyText=globalThis.questPenaltyText;
  if(typeof originalQuestPenaltyText==="function"){
    globalThis.questPenaltyText=function(q){return q?.sourceType==="subjob_exam"?"本次考核作廢，可重新申請；不扣公會信用、不罰款":originalQuestPenaltyText(q)};
  }
  const originalApplyQuestPenalty=globalThis.applyQuestPenalty;
  if(typeof originalApplyQuestPenalty==="function"){
    globalThis.applyQuestPenalty=function(q,reason="解除"){
      if(q?.sourceType!=="subjob_exam")return originalApplyQuestPenalty(q,reason);
      ensureSubjobExamState();G.questHistory=G.questHistory||[];
      const meta=q.subjobExam||{},status=reason==="逾期失敗"?"考核逾期":"考核放棄",record={id:q.id,sid:meta.sid,targetGrade:meta.targetGrade,status,time:timeText(),turn:G.turn,summary:q.name};
      G.character.subjobExamHistory.unshift(record);if(G.character.subjobExamHistory.length>30)G.character.subjobExamHistory.length=30;
      G.questHistory.unshift({id:q.id,name:q.name,tier:q.tier,status,time:timeText(),sourceType:"subjob_exam",sourceId:meta.sid});if(G.questHistory.length>30)G.questHistory.length=30;
      log("副職業考核",`${q.name}${reason==="逾期失敗"?"逾期失敗":"已放棄"}；本次考核作廢，可重新申請，不影響公會信用。`,"warnText")
    };
  }
  const originalAbandonQuest=globalThis.abandonQuest;
  if(typeof originalAbandonQuest==="function"){
    globalThis.abandonQuest=function(id){
      const q=(typeof G!=="undefined"&&G)?.quests?.find(x=>x.id===id);if(q?.sourceType!=="subjob_exam")return originalAbandonQuest(id);
      if(!confirm(`確定放棄「${q.name}」？\n結果：${globalThis.questPenaltyText(q)}`))return;
      closeModal();if(!beginTurn("放棄副職業考核"))return;globalThis.applyQuestPenalty(q,"解除");G.quests=G.quests.filter(x=>x.id!==id);endTurn(.1);openQuestLog()
    };
  }

  globalThis.upgradeSubjob=function(sid){
    const j=ensureSubjobExamState()?.subjobs?.find(x=>x.id===sid);if(!j)return;
    const state=examAwareSubjobUpgradeState(j),name=sub(sid)?.name||sid;
    if(!state?.next){alert(`${name}已達最高階。`);return}
    if(!state.xpReady){alert(`${name}副職業經驗不足：XP ${formatSubjobXp(state.xp)}/${formatSubjobXp(state.need)}。`);return}
    if(!state.levelReady){alert(`${name}升級至［${state.next}］需要角色Lv${state.levelNeed}；目前Lv${G.character.level}。`);return}
    if(state.examRequired&&!state.examPassed){alert(`${name}升級至［${state.next}］前必須先通過晉階考核。`);return}
    j.grade=state.next;log("副職業",`${name}升級為［${state.next}］；累積XP保留。`,"ok");persist();openCharacter()
  };

  function subjobExamAudit(){
    const c=ensureSubjobExamState(),issues=[];if(!c)return issues;
    if(DB.subjob_exam_system?.version!==SUBJOB_EXAM_REVISION)issues.push("SUBJOB-EXAM-1.0缺失");
    for(const q of (G.quests||[]).filter(x=>x.sourceType==="subjob_exam")){
      const meta=q.subjobExam||{};
      if(!sub(meta.sid)||!subjobExamRequired(meta.targetGrade))issues.push(`副職業考核引用異常:${q.id}`);
      if(!DB.facilities[q.turninFacility])issues.push(`副職業考核回報設施缺失:${q.id}`);
      if(!["gather","item","kill","hunt","patrol","action"].includes(q.objective?.kind))issues.push(`副職業考核目標類型異常:${q.id}`);
      if(!(q.viableLocationIds||[]).length)issues.push(`副職業考核無可達地點:${q.id}`)
    }
    for(const [key,rec] of Object.entries(c.subjobExamPasses||{})){
      if(!sub(rec?.sid)||!subjobExamRequired(rec?.targetGrade)||key!==subjobExamKey(rec.sid,rec.targetGrade))issues.push(`副職業考核通過紀錄異常:${key}`)
    }
    return issues
  }
  const originalRunGeneratorAudit=globalThis.runGeneratorAudit;
  if(typeof originalRunGeneratorAudit==="function"){
    globalThis.runGeneratorAudit=function(){const issues=originalRunGeneratorAudit.apply(this,arguments)||[];return [...issues,...subjobExamAudit()]};
  }

})();


/* TAVERN-ALL-DAY-1.0：酒館全天供餐；按旅館同時段同級餐點價格加價10%～20%。 */
(()=>{
  "use strict";
  if(typeof DB!=="object"||!DB.meal_service_system?.venues?.tavern||!DB.meal_service_system?.venues?.inn)return;
  const sys=DB.meal_service_system,tavern=sys.venues.tavern,inn=sys.venues.inn;
  const periods=["breakfast","lunch","dinner"];
  const rawOpen=globalThis.openMealService,rawEat=globalThis.eatFacilityMeal,rawRender=globalThis.renderFacility;
  const originalAudit=globalThis.runGeneratorAudit;
  if(typeof rawOpen!=="function"||typeof rawEat!=="function")return;
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  function premiumPrice(reference){
    const base=Number(reference),minimum=Math.ceil(base*1.10-1e-9),maximum=Math.floor(base*1.20+1e-9);
    if(minimum>maximum)return Math.round(base*115)/100;
    return Math.min(maximum,Math.max(minimum,Math.round(base*1.15)));
  }
  // 相同餐期、相同菜單順序為同級比較基準；既有九款菜色與恢復數值不變。
  for(const period of periods){
    (tavern[period]||[]).forEach((meal,index)=>{
      const reference=Number(inn[period]?.[index]?.price);
      if(!Number.isFinite(reference)||reference<=0)return;
      meal.inn_reference_price=reference;
      meal.price=premiumPrice(reference);
      meal.premium_percentage=Math.round((meal.price/reference-1)*1000)/10;
    });
  }
  sys.version="MEAL-1.1";
  sys.tavern_all_day={revision:"TAVERN-ALL-DAY-1.0",hours:"00:00–24:00",inn_price_premium_min:10,inn_price_premium_max:20,reference:"同餐期同級餐點"};
  sys.rules=[
    "酒館全天24小時供應既有早餐、中餐、晚餐料理，任何遊戲時刻均可點餐。",
    "酒館各同級料理以旅館對應餐期的同級料理為基準，價格增加10%～20%。",
    "旅館仍只在早餐06:00–10:30、中餐11:00–14:30、晚餐17:00–21:30供餐。",
    ...(sys.rules||[]).filter(rule=>!/餐點只在對應時段|酒館與旅館都有獨立用餐按鍵/.test(String(rule)))
  ];
  function tavernRows(){
    return periods.map(period=>{
      const label=sys.service_windows?.[period]?.label||period;
      const rows=(tavern[period]||[]).map(meal=>{
        const cost=Number(meal.price),affordable=Number(G.character.moneySilver)>=cost;
        const compared=Number.isFinite(meal.inn_reference_price)
          ?"｜旅館同級 "+meal.inn_reference_price+"銀（加價"+meal.premium_percentage+"%）":"";
        const stats="飢餓-"+meal.hunger+"｜口渴-"+(meal.thirst||0)+"｜疲勞-"+(meal.fatigue||0)+(meal.hp?"｜HP+"+meal.hp:"");
        return '<div class="itemrow"><span><b>'+esc(meal.name)+'</b>｜'+cost+'銀'+compared+
          '<br><span class="small">'+stats+'</span></span>'+
          '<button type="button" '+(affordable?"":"disabled")+
          ' onclick=\x27eatFacilityMeal("tavern",'+JSON.stringify(period)+','+JSON.stringify(meal.id)+')\x27>用餐</button></div>';
      }).join("");
      return "<h3>"+esc(label)+"｜全天可點</h3>"+rows;
    }).join("");
  }
  globalThis.openMealService=function(fid){
    if(fid!=="tavern")return rawOpen.apply(this,arguments);
    if(!G?.character||G.character.currentFacility!=="tavern")return;
    const t=G.worldTime||{},hour=String(t.hour??0).padStart(2,"0"),minute=String(t.minute??0).padStart(2,"0");
    globalThis.showModal(tavern.label+"・全天供餐",
      '<div class="card small">目前 '+hour+':'+minute+'｜24小時供餐。酒館比旅館同級餐點貴10%～20%；每次用餐消耗0.5遊戲小時。</div>'+
      tavernRows()+'<div class="actions"><button type="button" onclick="renderFacility(\x27tavern\x27)">上一頁</button></div>');
  };
  globalThis.eatFacilityMeal=function(fid,period,mealId){
    if(fid!=="tavern")return rawEat.apply(this,arguments);
    if(!G?.character||G.character.currentFacility!=="tavern"||!periods.includes(period))return;
    const meal=(tavern[period]||[]).find(m=>m.id===mealId);
    if(!meal||!Number.isFinite(Number(meal.price))||G.character.moneySilver<meal.price)return;
    globalThis.closeModal();
    if(!globalThis.beginTurn("酒館用餐"))return;
    if(G.character.moneySilver<meal.price){globalThis.log("用餐","銀幣不足。","warnText");globalThis.endTurn(.1);return}
    G.character.moneySilver=Math.round((Number(G.character.moneySilver)-meal.price)*100)/100;
    G.character.hunger=Math.max(0,Math.min(120,G.character.hunger-meal.hunger));
    G.character.thirst=Math.max(0,Math.min(120,G.character.thirst-(meal.thirst||0)));
    G.character.fatigue=Math.max(0,Math.min(120,G.character.fatigue-(meal.fatigue||0)));
    if(meal.hp)G.character.hp=Math.max(0,Math.min(G.character.maxHp,G.character.hp+meal.hp));
    globalThis.log("用餐",DB.facilities.tavern.name+"：享用"+meal.name+"，支付"+meal.price+"銀。","ok");
    globalThis.endTurn(.5);
  };
  if(typeof rawRender==="function"){
    globalThis.renderFacility=function(fid){
      const result=rawRender.apply(this,arguments);
      if(fid==="tavern"&&typeof document!=="undefined"){
        const body=document.getElementById("modalBody");
        const button=body&&Array.from(body.querySelectorAll("button")).find(b=>b.getAttribute("onclick")==="openMealService('tavern')");
        if(button)button.textContent="用餐・24小時供應";
      }
      return result;
    };
  }
  if(typeof originalAudit==="function"){
    globalThis.runGeneratorAudit=function(){
      const issues=originalAudit.apply(this,arguments)||[];
      for(const period of periods){
        (tavern[period]||[]).forEach((meal,index)=>{
          const base=Number(inn[period]?.[index]?.price),price=Number(meal.price);
          if(!Number.isFinite(base)||!Number.isFinite(price)||price<base*1.1-1e-8||price>base*1.2+1e-8)
            issues.push("酒館餐價超出旅館加價10%～20%:"+period+"/"+meal.id);
        });
      }
      return issues;
    };
  }
  // Six-unit enemy formation and persistent battle roster.
  const battleRosterOriginal={start:window.startBattle,render:window.renderBattle,enemyTurn:window.enemyBattleTurn,finish:window.finishBattle,init:window.init};
  const rankOf=m=>{const r=String(m?.lore_role||"");if(/高階首領|領主|魔王/.test(r)||m?.name==="克拉肯"||(/首領/.test(m?.name||"")&&!/菁英|精英/.test(r)))return "boss";if(/菁英|精英/.test(r))return "elite";return "normal"};
  const tierStep=t=>Math.max(0,Math.min(6,Number(tierOrder(t)||0)));
  const tierScale=(m,t)=>{const n=tierStep(t),r=rankOf(m);return r==="boss"?1+.10*n+.035*n*n:r==="elite"?1+.055*n+.02*n*n:1};
  const scaledEnemy=(m,t,i)=>{const e={...m,battleId:"enemy-"+Date.now().toString(36)+"-"+i+"-"+Math.random().toString(36).slice(2,7),maxHp:m.hp,hp:m.hp,enemyBuff:{},enemyStatuses:[],battleRank:rankOf(m)},scale=tierScale(m,t);for(const k of ["hp","attack","damage","defense","magicDefense","poise"])if(Number.isFinite(Number(e[k])))e[k]=Math.max(1,Math.round(Number(e[k])*scale));e.maxHp=e.hp;if(i>0&&e.battleRank==="normal"){e.hp=e.maxHp=Math.max(1,Math.round(e.maxHp*.55));for(const k of ["attack","damage"])if(Number.isFinite(Number(e[k])))e[k]=Math.max(1,Math.round(e[k]*.58))}e.worldScale=scale;return e};
  function selectRosterEnemy(id,paint=true){const b=G?.battle;if(!b?.enemies)return;const e=b.enemies.find(x=>x.battleId===id)||b.enemies.find(x=>x.hp>0);if(!e)return;b.enemy=e;b.enemyBuff=e.enemyBuff||(e.enemyBuff={});b.enemyStatuses=e.enemyStatuses||(e.enemyStatuses=[]);if(paint&&typeof renderAll==="function")renderAll()}
  function rosterNormalize(){const b=G?.battle;if(!b?.active)return;if(!Array.isArray(b.enemies)||!b.enemies.length)b.enemies=[{...b.enemy,battleId:b.enemy?.battleId||"enemy-legacy-0",enemyBuff:b.enemyBuff||{},enemyStatuses:b.enemyStatuses||[]}];if(b.enemies.length<6&&typeof encounterFormation==="function"){const saved=b.enemy,expanded=encounterFormation(saved);if(saved?.battleId)expanded[0]={...expanded[0],...saved};b.enemies=expanded}const e=b.enemies.find(x=>x.battleId===b.enemy?.battleId)||b.enemies.find(x=>x.hp>0);if(e)selectRosterEnemy(e.battleId,false)}
  window.selectBattleEnemy=selectRosterEnemy;
  function encounterFormation(first){const loc=(DB.locations||DB.places||[]).find(x=>x.id===G?.character?.locationId)||null,tier=loc?.tier||first.tier||"F",pool=typeof encounterCandidates==="function"?encounterCandidates(loc).filter(m=>rankOf(m)!=="boss"):[],chosen=[first];while(chosen.length<6)chosen.push(pool.length&&typeof weightedPick==="function"?weightedPick(pool.map(m=>[m,Math.max(1,Number(m.encounter_weight||m.weight||1))])):first);const bi=chosen.findIndex(m=>rankOf(m)==="boss");if(bi>1)[chosen[1],chosen[bi]]=[chosen[bi],chosen[1]];const seen={};return chosen.map((m,i)=>{const e=scaledEnemy(m,tier,i);seen[m.id]=(seen[m.id]||0)+1;if(seen[m.id]>1)e.name=m.name+"（"+seen[m.id]+"）";return e})}
  window.startBattle=function(monster,context){const result=battleRosterOriginal.start.apply(this,arguments),b=G?.battle;if(b?.active){b.enemies=encounterFormation(monster);const primary=b.enemies.find(x=>x.id===monster.id&&x.battleRank===rankOf(monster))||b.enemies[0];selectRosterEnemy(primary.battleId,false);b.log.push("敵方陣形：六名敵人列陣；首領固定在第一列中央。");if(typeof renderAll==="function")renderAll()}return result};
  window.renderBattle=function(){rosterNormalize();const result=battleRosterOriginal.render.apply(this,arguments),b=G?.battle,head=document.querySelector(".battlehead");if(!b?.active||!head||!Array.isArray(b.enemies))return result;head.querySelector(".battle-enemy-row")?.remove();let grid=head.querySelector(".battle-enemy-grid");if(!grid){grid=document.createElement("div");grid.className="battle-enemy-grid";head.insertBefore(grid,head.firstChild)}grid.innerHTML=b.enemies.map(e=>{const p=Math.max(0,Math.min(100,e.hp/Math.max(1,e.maxHp)*100)),alive=e.hp>0,sel=e.battleId===b.enemy?.battleId,rank=e.battleRank==="boss"?"首領":e.battleRank==="elite"?"菁英":"",scale=e.worldScale>1?"｜層級倍率 ×"+e.worldScale.toFixed(2):"";return '<button type="button" class="battleunit enemy battle-enemy-card '+(sel?"selected ":"")+(alive?"":"defeated ")+(e.battleRank||"")+'" onclick="selectBattleEnemy(\''+e.battleId+'\')"><b>'+e.name+' <span class="tier">'+e.tier+'</span></b><div class="small">'+(rank||e.category||"敵人")+'｜'+(alive?"回合目標":"已擊倒")+scale+'</div><div>HP '+Math.max(0,Math.round(e.hp))+'/'+e.maxHp+'</div><div class="hpbar"><i style="width:'+p+'%"></i></div></button>'}).join("");return result};
  window.finishBattle=function(result){const b=G?.battle;if(result==="勝利"&&b?.active&&Array.isArray(b.enemies)){const living=b.enemies.filter(e=>e.hp>0);if(living.length){selectRosterEnemy(living[0].battleId);return}const current=b.enemy,extras=b.enemies.filter(e=>e.battleId!==current?.battleId),done=battleRosterOriginal.finish.apply(this,arguments);for(const e of extras){emitIntegratedEvent("battle_victory","monster",e.id,"擊退"+e.name+"［"+e.tier+"］",{locationId:G.character.locationId});updateQuestProgress("kill",{name:e.name,id:e.id});rollEnemyLoot(e);awardBattleProgress(e)}return done}return battleRosterOriginal.finish.apply(this,arguments)};
  window.enemyBattleTurn=function(){const b=G?.battle;if(!b?.active||!Array.isArray(b.enemies))return battleRosterOriginal.enemyTurn.apply(this,arguments);rosterNormalize();if(b.awaitingCompanion){b.awaitingCompanion=false;if(typeof resolvePartyTurns==="function")resolvePartyTurns();if(typeof resolveCompanionTurn==="function")resolveCompanionTurn()}const round=b.round,units=b.enemies.filter(e=>e.hp>0);for(const e of units){if(!b.active)break;selectRosterEnemy(e.battleId,false);b.awaitingCompanion=false;battleRosterOriginal.enemyTurn.call(this);if(!G.battle?.active||G.character.hp<=0)break}if(b.active){b.round=round+1;if(typeof persist==="function")persist();if(typeof renderAll==="function")renderAll()}};
  window.init=async function(){await battleRosterOriginal.init.apply(this,arguments);rosterNormalize()};

})();