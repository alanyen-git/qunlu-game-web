/* 群陸旅誌：長局玩家體驗整合 CURRENT-1.65.0 | PLAYER-EXPERIENCE-1.0 */
(()=>{
  if(typeof DB!=="object"||!DB)return;
  const RELEASE="CURRENT-1.65.0",REV="PLAYER-EXPERIENCE-1.0";
  DB.meta=DB.meta||{};
  DB.meta.current_version=RELEASE;
  DB.meta.player_experience_revision=REV;
  DB.player_experience_system={
    version:REV,
    purpose:"整合16種MBTI風格玩家原型各2000回合的長局體驗回饋；MBTI僅作偏好原型，不作人格判定。",
    validation:{personas:16,turns_per_persona:2000,total_turns:32000,seed_family:"20260917",model:"state/action-intent simulation"},
    findings:[
      "長局主要摩擦來自想做的玩法與目前所在地／前置條件之間的轉換成本，而非單一戰鬥數值。",
      "委託玩家需要更清楚的剩餘時間、可回報狀態與下一個必要步驟。",
      "探索與自由玩法玩家需要知道哪些方向仍可能帶來新情報，而不是被迫照任務走。",
      "社交導向玩家需要更容易進入人物誌、人物網絡與已取得情報。",
      "系統導向玩家需要同時看見角色等級、職業熟練、技能成長與負重／生存風險。",
      "所有提示只能提供資訊與捷徑，不自動替玩家移動、接任務、消耗道具或決定玩法。"
    ],
    rules:["不推測實際玩家MBTI。","不修改戰鬥／經濟／掉落機率。","不消耗回合。","只讀取角色已知與存檔中可見狀態。","玩家保有最終行動決定權。"],
    save_schema_changed:false
  };

  const game=()=>{try{return typeof G!=="undefined"?G:null}catch(e){return null}};
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const loc=id=>(DB.locations||[]).find(x=>x.id===id)||null;
  const item=id=>(DB.items||[]).find(x=>x.id===id)||null;
  const cls=id=>(DB.combat_classes||[]).find(x=>x.id===id)||null;
  function nowHours(){
    try{if(typeof globalThis.totalHours==="function")return Number(globalThis.totalHours()||0)}catch(e){}
    const t=game()?.worldTime;return t?Math.max(0,(Number(t.day||1)-1)*24+Number(t.hour||0)+Number(t.minute||0)/60):0
  }
  function weightInfo(){
    const g=game(),c=g?.character;if(!c)return {weight:0,cap:0,ratio:0};
    let weight=0,cap=0;
    try{if(typeof globalThis.inventoryWeight==="function")weight=Number(globalThis.inventoryWeight()||0)}catch(e){}
    if(!weight)for(const x of (c.inventory||[])){const d=item(x.id);weight+=Number(d?.weight||0)*Number(x.qty||1)}
    try{if(typeof globalThis.combatStats==="function")cap=Number(globalThis.combatStats()?.carryCapacity||0)}catch(e){}
    return {weight:Math.round(weight*10)/10,cap:Math.round(cap*10)/10,ratio:cap>0?weight/cap:0}
  }
  function xpNeed(level){
    try{if(typeof globalThis.xpToNext==="function")return Number(globalThis.xpToNext(level)||0)}catch(e){}
    return 0
  }
  function skillLevelOf(s){
    try{if(typeof globalThis.skillLevel==="function")return Number(globalThis.skillLevel(s)||1)}catch(e){}
    const th=DB.skill_scaling_system?.skill_xp_system?.xp_thresholds||[0,12,30,55,85,120,160,205,255,310];
    let lv=1,x=Number(s?.skillXp||0);for(let i=1;i<th.length;i++)if(x>=th[i])lv=i+1;return Math.min(10,lv)
  }
  function compactSkills(c){
    const rows=(c?.skills||[]).map(s=>({name:s.name||s.id||"技能",lv:skillLevelOf(s),xp:Number(s.skillXp||0)}));
    rows.sort((a,b)=>a.lv-b.lv||b.xp-a.xp);return rows.slice(0,4)
  }
  function questState(){
    const g=game(),h=nowHours(),rows=(g?.quests||[]).filter(q=>["active","ready"].includes(q.status)).map(q=>{
      const left=Number.isFinite(Number(q.deadlineHour))?Number(q.deadlineHour)-h:null;
      return {...q,hoursLeft:left}
    }).sort((a,b)=>(a.status==="ready"?-1:0)-(b.status==="ready"?-1:0)||(a.hoursLeft??999999)-(b.hoursLeft??999999));
    return rows
  }
  function survival(){
    const c=game()?.character||{},w=weightInfo(),out=[];
    if(c.alive===false)out.push({level:"danger",text:"角色目前死亡；請先處理復活。"});
    if(Number(c.hp||0)>0&&Number(c.maxHp||0)>0&&c.hp/c.maxHp<.35)out.push({level:"danger",text:`生命偏低：${Math.round(c.hp)}/${Math.round(c.maxHp)}。`});
    if(Number(c.fatigue||0)>=75)out.push({level:"warn",text:`疲勞 ${Math.round(c.fatigue)}，長途移動或高風險戰鬥前建議休息。`});
    if(Number(c.hunger||0)>=70)out.push({level:"warn",text:`飢餓 ${Math.round(c.hunger)}，建議補充食物。`});
    if(Number(c.thirst||0)>=70)out.push({level:"warn",text:`口渴 ${Math.round(c.thirst)}，建議先補給。`});
    if(w.cap>0&&w.ratio>=.9)out.push({level:w.ratio>=1?"danger":"warn",text:`負重 ${w.weight}/${w.cap}kg，接近或超過負重上限。`});
    return out
  }
  function discoveredNpcCount(){
    const n=game()?.worldState?.npcDepth?.npcs||{};return Object.values(n).filter(x=>x?.discovered).length
  }
  function snapshot(){
    const g=game(),c=g?.character;if(!c)return null;const l=loc(c.locationId),qs=questState(),risks=survival(),skills=compactSkills(c),need=xpNeed(c.level);
    const ready=qs.filter(q=>q.status==="ready").length,urgent=qs.filter(q=>q.hoursLeft!=null&&q.hoursLeft<=12).length;
    const next=[];
    if(risks.length)next.push({kind:"生存",text:risks[0].text,action:l?.kind==="town"?"城鎮設施／背包補給":"野外休息／返回城鎮"});
    if(ready)next.push({kind:"委託",text:`有 ${ready} 個委託已達成目標，等待回報。`,action:"查看委託"});
    else if(urgent)next.push({kind:"委託",text:`有 ${urgent} 個委託剩餘時間不超過12小時。`,action:"查看委託"});
    else if(qs.length)next.push({kind:"委託",text:`目前有 ${qs.length} 個進行中委託；可先確認目標地點與素材。`,action:"查看委託"});
    if(l?.kind==="town"){
      next.push({kind:"人物／情報",text:"城鎮適合處理人物互動、情報、交易、學習與接洽委託。",action:"人物誌／情報"});
      next.push({kind:"探索",text:"若要採集、狩獵或高風險探索，可由地圖前往可到達的野外區域。",action:"移動"});
    }else{
      next.push({kind:"野外",text:"目前可優先探索、採集、打獵；若背包或委託已完成，考慮返回城鎮。",action:"探索／採集／打獵"});
    }
    next.push({kind:"成長",text:`Lv${c.level}${need?`：${Math.round(c.xp||0)}/${Math.round(need)} XP`:""}；職業熟練 ${Math.round(Number(c.classMastery||0)*10)/10}/100。`,action:"角色／自主訓練"});
    return {release:RELEASE,revision:REV,location:l?{id:l.id,name:l.name,kind:l.kind,tier:l.tier}:null,risks,quests:qs,ready,urgent,skills,next:next.slice(0,5),npcDiscovered:discoveredNpcCount(),weight:weightInfo()}
  }
  function button(fn,label){
    return typeof globalThis[fn]==="function"?`<button type="button" onclick="${fn}()">${esc(label)}</button>`:""
  }
  function openJourneyCompass(){
    const s=snapshot();if(!s||typeof globalThis.showModal!=="function")return;
    const c=game().character,cn=cls(c.classId);
    const riskHtml=s.risks.length?s.risks.map(x=>`<div class="small ${x.level==="danger"?"badText":x.level==="warn"?"warnText":""}">• ${esc(x.text)}</div>`).join(""):`<div class="small ok">目前沒有明顯的生存／負重警訊。</div>`;
    const questHtml=s.quests.length?s.quests.slice(0,5).map(q=>{
      const left=q.hoursLeft==null?"無明確時限":q.hoursLeft<0?"已逾期":`剩餘 ${Math.max(0,Math.round(q.hoursLeft*10)/10)} 小時`;
      const p=q.objective?.target?`${q.progress||0}/${q.objective.target}`:"依委託條件";
      return `<div class="small">• <b>${esc(q.name)}</b>［${esc(q.tier||"")}］｜${q.status==="ready"?"可回報":`進度 ${esc(p)}`}｜${esc(left)}</div>`
    }).join(""):`<div class="small">目前沒有進行中的委託；是否接取新委託由你決定。</div>`;
    const skillHtml=s.skills.length?s.skills.map(x=>`<span class="small">${esc(x.name)} Lv${x.lv}</span>`).join("｜"):"<span class='small'>尚無技能資料</span>";
    const nextHtml=s.next.map(x=>`<div class="card"><b>${esc(x.kind)}</b><br><span class="small">${esc(x.text)}<br>可考慮：${esc(x.action)}</span></div>`).join("");
    const quick=[button("openQuestLog","委託"),button("openMap","移動"),button("openCharacter","角色"),button("openTraining","自主訓練"),button("openIntelArchive","已取得情報"),button("openNpcJournal","人物誌"),button("openNpcNetwork","人物網絡"),button("openFacilities","城鎮設施")].filter(Boolean).join("");
    globalThis.showModal("旅程羅盤",`
      <div class="card"><b>${esc(s.location?.name||"未知地點")}［${esc(s.location?.tier||"")}］</b><br><span class="small">${s.location?.kind==="town"?"城鎮":"野外／地下城"}｜${esc(cn?.name||"未定職業")}｜Lv${c.level}｜已認識固定NPC ${s.npcDiscovered}</span></div>
      <div class="card"><b>目前風險</b>${riskHtml}</div>
      <div class="card"><b>委託節奏</b>${questHtml}</div>
      <div class="card"><b>成長摘要</b><br><span class="small">職業熟練 ${Math.round(Number(c.classMastery||0)*10)/10}/100｜負重 ${s.weight.weight}${s.weight.cap?`/${s.weight.cap}`:""}kg</span><br>${skillHtml}</div>
      <h3>接下來可考慮</h3>${nextHtml}
      <div class="card small">羅盤只整理目前存檔中已知資訊，不推測你的MBTI、不自動移動、不接任務、不消耗回合。</div>
      <div class="actions">${quick}</div>`)
  }
  function patchMoreMenu(){
    if(globalThis.__PLAYER_EXPERIENCE_MENU_PATCHED||typeof globalThis.openMoreMenu!=="function")return;
    const original=globalThis.openMoreMenu;
    globalThis.openMoreMenu=function(){const r=original.apply(this,arguments);setTimeout(()=>{const grid=typeof document!=="undefined"?document.querySelector("#modalBody .more-grid"):null;if(grid&&!grid.querySelector("[data-journey-compass]")){const b=document.createElement("button");b.className="more-card";b.dataset.journeyCompass="1";b.innerHTML='<span class="more-icon">◇</span><span>旅程羅盤</span>';b.addEventListener("click",openJourneyCompass);grid.appendChild(b)}},0);return r};
    globalThis.__PLAYER_EXPERIENCE_MENU_PATCHED=true
  }
  function patchActions(){
    if(globalThis.__PLAYER_EXPERIENCE_ACTION_PATCHED||typeof globalThis.renderActions!=="function")return;
    const original=globalThis.renderActions;
    globalThis.renderActions=function(){const r=original.apply(this,arguments);setTimeout(()=>{const box=typeof document!=="undefined"?document.getElementById("actionButtons"):null;if(box&&game()?.character?.alive!==false&&!box.querySelector("[data-journey-compass-action]")){const b=document.createElement("button");b.type="button";b.dataset.journeyCompassAction="1";b.textContent="旅程羅盤";b.addEventListener("click",openJourneyCompass);box.appendChild(b)}},0);return r};
    globalThis.__PLAYER_EXPERIENCE_ACTION_PATCHED=true
  }
  function audit(){
    const s=snapshot(),issues=[];
    if(!DB.player_experience_system?.validation||DB.player_experience_system.validation.total_turns!==32000)issues.push("長局驗證摘要缺失");
    if(typeof globalThis.openJourneyCompass!=="function")issues.push("旅程羅盤API缺失");
    if(s&&s.quests.some(q=>!["active","ready"].includes(q.status)))issues.push("羅盤收錄非進行中委託");
    return {revision:REV,release:RELEASE,pass:issues.length===0,issues,snapshot:s}
  }
  globalThis.openJourneyCompass=openJourneyCompass;
  globalThis.journeyCompassSnapshot=snapshot;
  globalThis.runPlayerExperienceAudit=audit;
  patchMoreMenu();patchActions();
})();
