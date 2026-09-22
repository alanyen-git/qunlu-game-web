/* 群陸旅誌：封印戰鬥職業逐階解封與高階考核
 * COMBAT-CLASS-PROGRESSION-1.0：保留既有職業ID、熟練度、存檔與進階來源。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.combat_classes)||typeof globalThis.openClassAdvancement!=="function")return;
const REV="COMBAT-CLASS-PROGRESSION-1.1";
const GRADES=["F","E","D","C","B","A","S"],RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const MIN_GUILD=Object.freeze({F:"F",E:"F",D:"E",C:"D",B:"C",A:"B",S:"B"});
const EXAMS=Object.freeze({B:{wins:3,reports:1},A:{wins:5,reports:2},S:{wins:7,reports:3}});
const originals={
  open:globalThis.openClassAdvancement,
  unseal:globalThis.unsealCurrentClass,
  advance:globalThis.advanceCombatClass,
  battle:globalThis.awardBattleProgress,
  quest:globalThis.turnInQuest,
  audit:globalThis.runAudit
};
DB.meta=DB.meta||{};
DB.meta.combat_class_progression_revision=REV;
DB.combat_class_progression_system={
  version:REV,grades:GRADES,exam_from_grade:"B",guild_minimum_tier:MIN_GUILD,
  rules:[
    "封印高階職業按F→E→D→C→B→A→S逐階提升，不得跨階直解封。",
    "逐階滿足角色等級及目前職業熟練度，晉階消耗本階熟練度而不扣角色經驗。",
    "B級及以上取得對應職業考核資格；考核包含同階前一級以上實戰及委託回報。",
    "聖劍士等聖職高階路線另需先選擇主神並立下有效誓言。",
    "B/A/S考核資格逐階獨立；原始職業正式階級仍存於unlockedClassRoutes，舊存檔不重置。"
  ],save_schema_changed:"additive",revision_notes:"開放公會考核及職業逐階解封；不改動高階職業的原始ID與技能資料。"
};
function character(){try{return typeof G!=="undefined"?G?.character:null}catch(error){return null}}
function classRow(id){return (DB.combat_classes||[]).find(row=>row?.id===id)||null}
function rank(grade){return RANK[String(grade||"F")]??0}
function currentGuild(){const c=character();return !!c&&c.currentFacility==="guild"}
function locationTier(){const c=character();return (DB.locations||[]).find(row=>row?.id===c?.locationId)?.tier||"F"}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function isHoly(target){return /聖劍士|聖武士|聖盾騎士|守誓騎士/.test(String(target?.name||""))}
function faithReady(target){
  if(!isHoly(target))return true;
  const f=character()?.faith||{},deity=(DB.faith_entities||[]).find(d=>d.id===f.patronDeityId);
  const oath=(DB.faith_oaths||[]).find(o=>o.id===f.oathId);
  return !!(deity&&oath&&Array.isArray(oath.pantheons)&&oath.pantheons.includes(deity.pantheon_id))
}
function goalFor(targetId){
  const c=character(),current=classRow(c?.classId),target=classRow(targetId);
  if(!c||!current||!target)return null;
  if(c.classSealed){
    if(current.id!==target.id)return null;
    const activeRank=rank(c.combatGrade),originalRank=rank(target.tier);
    const nextGrade=GRADES[Math.min(activeRank+1,originalRank)];
    const level=Number(DB.class_design_system?.unlock_levels?.[nextGrade]||1);
    return {target,mode:"sealed",grade:nextGrade,levelNeed:Math.max(level,nextGrade===target.tier?Number(target.unlock_level||1):1),masteryNeed:Number(classMasteryNeed(nextGrade)),minGuild:MIN_GUILD[nextGrade]};
  }
  const candidate=classAdvanceCandidates().find(row=>row.c?.id===target.id);
  if(!candidate)return null;
  const grade=target.tier||"F";
  return {target,mode:"advance",grade,levelNeed:Number(target.unlock_level||1),masteryNeed:Number(classMasteryNeed(grade)),minGuild:MIN_GUILD[grade]};
}
function qualified(target,grade){
  const c=character();
  if(!c||!target)return false;
  const passed=(c.classExamHistory||[]).some(x=>x.targetId===target.id&&x.targetGrade===grade);
  if(rank(grade)<rank(target.tier))return passed;
  return passed||(c.unlockedClassRoutes||[]).includes(target.id)
}
function examFor(targetId){const exam=character()?.classPromotionExam;return exam?.active&&exam.targetId===targetId?exam:null}
function checksFor(goal,withQualification=true){
  if(!goal)return [];
  const c=character(),checks=[],add=(label,need,current,ok,shortfall)=>checks.push({label,need,current,ok:!!ok,shortfall:ok?"":shortfall||""});
  const townTier=locationTier();
  add("角色等級","Lv"+goal.levelNeed,"Lv"+c.level,c.level>=goal.levelNeed,"Lv"+Math.max(0,goal.levelNeed-c.level));
  add("職業熟練",goal.masteryNeed+"%",Number(c.classMastery||0).toFixed(1)+"%",Number(c.classMastery||0)>=goal.masteryNeed,Math.max(0,goal.masteryNeed-Number(c.classMastery||0)).toFixed(1)+"%");
  add("公會接待","在冒險者公會辦理",currentGuild()?"已進入公會":"不在公會",currentGuild(),"前往城鎮冒險者公會");
  add("城鎮規模",goal.minGuild+"級或以上公會",townTier+"級",rank(townTier)>=rank(goal.minGuild),"前往更高階城鎮");
  if(withQualification&&rank(goal.grade)>=rank("B")){
    add("高階職業考核","通過"+goal.target.name+"［"+goal.grade+"］考核",qualified(goal.target,goal.grade)?"已通過":"未取得資格",qualified(goal.target,goal.grade),"先申請並完成對應考核");
    if(isHoly(goal.target))add("聖職誓言","先選主神，並立下相容誓言",faithReady(goal.target)?"已完成":"未完成",faithReady(goal.target),"前往教會選主神並立誓");
  }
  return checks
}
function basicReady(goal){return checksFor(goal,false).every(row=>row.ok)}
function examState(goal){
  const exam=examFor(goal.target.id);
  if(!exam)return null;
  return {exam,done:exam.wins>=exam.winsNeeded&&exam.reports>=exam.reportsNeeded&&faithReady(goal.target)}
}
function showClassPromotionRequirements(targetId){
  const goal=goalFor(targetId);if(!goal)return;
  showBlockedRequirements(goal.target.name+"・"+goal.grade+"級升階條件",checksFor(goal), "openClassAdvancement()");
}
function requestCombatClassExam(targetId){
  const goal=goalFor(targetId),c=character();
  if(!goal||!EXAMS[goal.grade]||!basicReady(goal)){showClassPromotionRequirements(targetId);return}
  if(qualified(goal.target,goal.grade)){openClassAdvancement();return}
  if(c.classPromotionExam?.active){alert("已有進行中的職業考核；請先完成或取消原考核。");return}
  if(!beginTurn("申請職業考核"))return;
  const cfg=EXAMS[goal.grade],previous=GRADES[Math.max(0,rank(goal.grade)-1)];
  c.classPromotionExam={
    active:true,targetId:goal.target.id,targetGrade:goal.grade,sourceClassId:c.classId,
    issuedTurn:G.turn,issuedLocationId:c.locationId,
    wins:0,winsNeeded:cfg.wins,reports:0,reportsNeeded:cfg.reports,
    minEnemyTier:previous,minQuestTier:previous
  };
  log("職業考核","受理"+goal.target.name+"［"+goal.grade+"］考核；需擊敗"+cfg.wins+"名"+previous+"級以上敵人，並回報"+cfg.reports+"項"+previous+"級以上公會委託。","ok");
  endTurn(.5);openClassAdvancement()
}
function cancelCombatClassExam(){
  const c=character();if(!c?.classPromotionExam?.active||!currentGuild())return;
  c.classPromotionExam.active=false;
  log("職業考核","已取消本次職業考核；不扣既有角色等級或職業熟練度。");
  persist();openClassAdvancement()
}
function finishCombatClassExam(targetId){
  const goal=goalFor(targetId),c=character();
  if(!goal||!currentGuild()||!basicReady(goal))return;
  const state=examState(goal);
  if(!state||!state.done){
    const e=state?.exam;
    const checks=[
      {label:"實戰考核",need:(e?.minEnemyTier||"—")+"級以上勝利 "+(e?.winsNeeded||0)+"場",current:(e?.wins||0)+"場",ok:!!e&&e.wins>=e.winsNeeded},
      {label:"公會委託",need:(e?.minQuestTier||"—")+"級以上回報 "+(e?.reportsNeeded||0)+"項",current:(e?.reports||0)+"項",ok:!!e&&e.reports>=e.reportsNeeded}
    ];
    if(isHoly(goal.target))checks.push({label:"聖職誓言",need:"教會主神與相容誓言",current:faithReady(goal.target)?"已完成":"尚未完成",ok:faithReady(goal.target)});
    showBlockedRequirements(goal.target.name+"・考核進度",checks,"openClassAdvancement()");return
  }
  if(!beginTurn("職業考核回報"))return;
  c.unlockedClassRoutes=Array.isArray(c.unlockedClassRoutes)?c.unlockedClassRoutes:[];
  if(goal.mode==="advance"||goal.grade===goal.target.tier){if(!c.unlockedClassRoutes.includes(targetId))c.unlockedClassRoutes.push(targetId)}
  c.classExamHistory=Array.isArray(c.classExamHistory)?c.classExamHistory:[];
  c.classExamHistory.push({targetId,targetGrade:goal.grade,wins:state.exam.wins,reports:state.exam.reports,time:timeText()});
  c.classPromotionExam.active=false;
  log("職業考核",goal.target.name+"［"+goal.grade+"］考核已通過；正式升階按鍵已解鎖。","ok");
  endTurn(.5);openClassAdvancement()
}
function recordClassExamBattle(enemy){
  const c=character(),exam=c?.classPromotionExam;
  if(!exam?.active||!goalFor(exam.targetId)||rank(enemy?.tier)<rank(exam.minEnemyTier))return;
  exam.wins=Math.min(exam.winsNeeded,exam.wins+1);
  if(exam.wins===exam.winsNeeded)log("職業考核","實戰目標已達成："+exam.wins+"/"+exam.winsNeeded,"ok")
}
function recordClassExamQuest(q){
  const c=character(),exam=c?.classPromotionExam,goal=exam&&goalFor(exam.targetId);
  if(!exam?.active||!goal||rank(q?.tier)<rank(exam.minQuestTier)||q.sourceType==="subjob_exam")return;
  const isGuild=(q.turninFacility||"guild")==="guild";
  const isHolyFaith=isHoly(goal.target)&&!!q.faithPantheonId&&q.faithPantheonId===(DB.faith_entities||[]).find(d=>d.id===c.faith?.patronDeityId)?.pantheon_id;
  if(!isGuild&&!isHolyFaith)return;
  exam.reports=Math.min(exam.reportsNeeded,exam.reports+1);
  if(exam.reports===exam.reportsNeeded)log("職業考核","委託回報目標已達成："+exam.reports+"/"+exam.reportsNeeded,"ok")
}
function gradeProgression(targetId){
  const goal=goalFor(targetId),c=character();if(!goal||goal.mode!=="sealed")return;
  if(!checksFor(goal).every(row=>row.ok)){showClassPromotionRequirements(targetId);return}
  if(!beginTurn("封印職業逐階解封"))return;
  c.classHistory=Array.isArray(c.classHistory)?c.classHistory:[];
  c.classHistory.push({id:c.classId,name:goal.target.name,tier:c.combatGrade,mastery:c.classMastery||0,time:timeText(),kind:"封印職業逐階解封"});
  c.combatGrade=goal.grade;c.classMastery=0;
  c.classSealed=rank(c.combatGrade)<rank(goal.target.tier);
  if(!c.classSealed){c.classGate=null;c.classPromotionExam=null}
  log("職業",goal.target.name+"實際職業階級提升至［"+goal.grade+"］"+(c.classSealed?"，更高階能力仍封印。":"，已正式解封。"),"ok");
  endTurn(4);openClassAdvancement()
}
function renderGoal(goal){
  const c=character(),ready=checksFor(goal).every(row=>row.ok),needExam=rank(goal.grade)>=rank("B")&&!qualified(goal.target,goal.grade),exam=examState(goal);
  const label=goal.mode==="sealed"?(goal.grade===goal.target.tier?"正式解封":"解封下一階"):"轉職";
  let html='<div class="card"><b>'+escapeHtml(goal.target.name)+'</b>［'+escapeHtml(goal.grade)+'］'+(goal.mode==="sealed"?'｜封印逐階解封':'｜職業進階')+
    '<br><span class="small">需要 Lv'+goal.levelNeed+'、職業熟練'+goal.masteryNeed+'%｜'+goal.minGuild+'級以上城鎮公會'+(needExam?'｜需高階考核':'')+
    '<br>目前 Lv'+c.level+'、熟練'+Number(c.classMastery||0).toFixed(1)+'%｜所在城鎮 '+escapeHtml(locationTier())+'級</span>';
  if(exam){
    const e=exam.exam;
    html+='<div class="small">考核進度：'+e.minEnemyTier+'級以上實戰 '+e.wins+'/'+e.winsNeeded+
      '｜'+e.minQuestTier+'級以上委託回報 '+e.reports+'/'+e.reportsNeeded+
      (isHoly(goal.target)?'｜聖職誓言：'+(faithReady(goal.target)?"已立誓":"尚未立誓"):'')+'</div>';
    html+='<div class="actions"><button type="button" onclick="finishCombatClassExam('+JSON.stringify(goal.target.id).replace(/"/g,"&#39;")+')">'+(exam.done?'回報考核':'未達考核條件・查看')+'</button>'+
      '<button type="button" onclick="cancelCombatClassExam()">取消本次考核</button></div>';
  }else if(needExam){
    html+='<div class="actions"><button type="button" onclick="'+(basicReady(goal)?'requestCombatClassExam('+JSON.stringify(goal.target.id).replace(/"/g,"&#39;")+')':'showClassPromotionRequirements('+JSON.stringify(goal.target.id).replace(/"/g,"&#39;")+')')+'">'+(basicReady(goal)?'申請［'+goal.grade+'］考核':'未達條件・查看')+'</button></div>';
  }
  html+='<div class="actions"><button type="button" class="'+(ready?"good":"prereq-action")+'" onclick="'+(ready?(goal.mode==="sealed"?'unsealCurrentClass()':'advanceCombatClass('+JSON.stringify(goal.target.id).replace(/"/g,"&#39;")+')'):'showClassPromotionRequirements('+JSON.stringify(goal.target.id).replace(/"/g,"&#39;")+')')+'">'+(ready?label:'未達條件・查看')+'</button></div></div>';
  return html
}
globalThis.openClassAdvancement=function(){
  const c=character(),cur=classRow(c?.classId);
  if(!cur)return;
  let rows="";
  if(c.classSealed){
    const goal=goalFor(cur.id);
    rows+='<div class="card small">已選高階職業：'+escapeHtml(cur.name)+'［'+escapeHtml(cur.tier)+'］。目前實際職業階級為［'+escapeHtml(c.combatGrade||"F")+'］；必須逐階解封，完成原始階級後才解除封印。</div>';
    if(goal)rows+=renderGoal(goal);
  }else{
    const candidates=classAdvanceCandidates();
    rows=candidates.map(row=>renderGoal(goalFor(row.c.id))).join("")||'<div class="card small">目前沒有直接進階路線；已達目前職業原始階級或需從其他正式職業進階。</div>';
  }
  if(c.classPromotionExam?.active){
    const exam=c.classPromotionExam;
    if(!rows.includes("考核進度"))rows+='<div class="card small">另有進行中的考核：'+escapeHtml(classRow(exam.targetId)?.name||exam.targetId)+'｜實戰 '+exam.wins+'/'+exam.winsNeeded+'｜委託 '+exam.reports+'/'+exam.reportsNeeded+'</div>';
  }
  if(!currentGuild())rows='<div class="card small">目前僅能檢視條件；升階與考核請到相符城鎮的冒險者公會辦理。</div>'+rows;
  const back=currentGuild()?"renderFacility('guild')":"openCharacter()";
  showModal("冒險者公會・職業進階",rows+'<div class="actions"><button type="button" onclick="'+back+'">上一頁</button></div>')
};
globalThis.showClassPromotionRequirements=showClassPromotionRequirements;
globalThis.requestCombatClassExam=requestCombatClassExam;
globalThis.cancelCombatClassExam=cancelCombatClassExam;
globalThis.finishCombatClassExam=finishCombatClassExam;
globalThis.unsealCurrentClass=function(){
  const c=character();if(c?.classSealed)return gradeProgression(c.classId);
  return originals.unseal?.()
};
globalThis.advanceCombatClass=function(targetId){
  const goal=goalFor(targetId);
  if(!goal||goal.mode!=="advance")return;
  if(!checksFor(goal).every(row=>row.ok)){showClassPromotionRequirements(targetId);return}
  const originalId=character().classId;
  originals.advance(targetId);
  const c=character();
  if(c.classId!==originalId&&c.classId===targetId){c.classPromotionExam=null;persist()}
};
globalThis.awardBattleProgress=function(enemy){
  const result=originals.battle?.apply(this,arguments);
  recordClassExamBattle(enemy);
  return result
};
globalThis.turnInQuest=function(id){
  const c=character(),q=G?.quests?.find(row=>row.id===id),before=(G?.questHistory||[]).length;
  const result=originals.quest?.apply(this,arguments);
  if(c&&q&&!(G.quests||[]).some(row=>row.id===q.id)&&(G.questHistory||[]).some(row=>row.id===q.id)&&
     ((G.questHistory||[]).length>=before)){recordClassExamQuest(q);persist()}
  return result
};
if(typeof originals.audit==="function")globalThis.runAudit=function(){
  const result=originals.audit.apply(this,arguments),c=character(),exam=c?.classPromotionExam;
  if(exam?.active){
    const issues=[];
    if(!classRow(exam.targetId)||!goalFor(exam.targetId))issues.push("職業考核指向不可進階職業："+exam.targetId);
    if(!GRADES.includes(exam.targetGrade)||!Number.isFinite(exam.wins)||!Number.isFinite(exam.reports))issues.push("職業考核進度異常");
    if(issues.length){G.lastAudit=G.lastAudit||{issues:[]};G.lastAudit.issues=Array.isArray(G.lastAudit.issues)?G.lastAudit.issues:[];G.lastAudit.issues.push(...issues);log("五回合自檢",issues.join("、"),"danger")}
  }
  return result
};
globalThis.QUNLU_CORE?.registerModule?.("src/combat-class-progression-v1.js",{domain:"progression",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.12.5"});
})();