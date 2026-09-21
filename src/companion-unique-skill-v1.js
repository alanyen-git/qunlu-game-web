/* 群陸旅誌：夥伴專屬技能 CURRENT-1.71.0
 * COMPANION-UNIQUE-SKILL-1.0
 * 每一種寵物／召喚獸／契約獸依物種家族、元素與AI定位擁有且僅擁有一招專屬技能。
 * 主動／輔助由AI自動判斷使用；被動於出戰時常駐。既有存檔相容。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.companion_species))return;

const RELEASE="CURRENT-1.71.0";
const REV="COMPANION-UNIQUE-SKILL-1.0";
const RUNTIME_REV="COMPANION-UNIQUE-SKILL-RUNTIME-1.1";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const VALID_KINDS=new Set(["主動","被動","輔助"]);
const round1=n=>Math.round(Number(n||0)*10)/10;
const clip=(n,a,b)=>Math.max(a,Math.min(b,n));
const bySpecies=id=>(DB.companion_species||[]).find(x=>x?.id===id)||null;

const FAMILY_PROFILE={
  "野獸系":{active:"猛撲",passive:"狩獵本能",support:"鼓舞嚎叫"},
  "飛行系":{active:"俯衝攻擊",passive:"飛行本能",support:"空中掩護"},
  "魔法與植物系":{active:"魔力衝擊",passive:"魔力循環",support:"自然治癒"},
  "龍系":{active:"龍息",passive:"龍鱗防護",support:"龍族守護"},
  "元素系":{active:"元素衝擊",passive:"元素親和",support:"元素護盾"},
  "惡魔與不死暗影系":{active:"暗影衝擊",passive:"不死本能",support:"暗影護盾"},
  "神聖與傳奇系":{active:"聖光衝擊",passive:"傳奇本能",support:"聖光治癒"}
};

function skillKind(sp){
  const i=Number(sp.index||0),ai=sp.ai_profile;
  if(ai==="support")return "輔助";
  if(ai==="guardian")return i%3===0?"被動":"輔助";
  if(ai==="skirmisher")return i%3===0?"被動":"主動";
  if(ai==="caster")return i%5===0?"輔助":"主動";
  if(ai==="dark")return i%4===0?"被動":"主動";
  if(ai==="legend")return i%3===0?"輔助":"被動";
  return i%5===0?"被動":"主動";
}
function suffixFor(sp,kind){
  const p=FAMILY_PROFILE[sp.family]||FAMILY_PROFILE["野獸系"];
  let suffix=kind==="主動"?p.active:kind==="被動"?p.passive:p.support;
  if(sp.family==="元素系"&&sp.element)suffix=sp.element+(kind==="主動"?"衝擊":kind==="被動"?"親和":"護盾");
  if(sp.family==="龍系"&&sp.element&&kind==="主動")suffix=sp.element+"龍息";
  return suffix;
}
function passiveEffect(sp,r){
  const ai=sp.ai_profile,f=sp.family;
  if(ai==="guardian")return {mode:"passive",hp_pct:round1(9+r*1.5),defense_pct:round1(11+r*1.5)};
  if(ai==="skirmisher"||f==="飛行系")return {mode:"passive",evasion_flat:4+r,accuracy_flat:2+Math.floor(r/2),speed_pct:round1(6+r)};
  if(ai==="caster"||ai==="support"||f==="元素系"||f==="魔法與植物系")return {mode:"passive",magic_pct:round1(8+r*1.5),accuracy_flat:2+Math.floor(r/2)};
  if(ai==="dark"||f==="惡魔與不死暗影系")return {mode:"passive",attack_pct:6+r,magic_pct:6+r,evasion_flat:2+Math.floor(r/2)};
  if(ai==="legend"||f==="神聖與傳奇系")return {mode:"passive",attack_pct:6+r,magic_pct:6+r,defense_pct:5+r};
  return {mode:"passive",attack_pct:round1(8+r*1.5),speed_pct:4+r};
}
function activeEffect(sp,r){
  const magic=["caster","support","legend"].includes(sp.ai_profile)||["元素系","魔法與植物系"].includes(sp.family);
  const drain=sp.ai_profile==="dark"||sp.family==="惡魔與不死暗影系";
  return {
    mode:drain?"drain":"damage",
    scaling:magic?"magic":"attack",
    multiplier:round1(1.18+r*.035+(sp.family==="龍系"?.05:0)),
    accuracy_bonus:(sp.ai_profile==="skirmisher"||sp.family==="飛行系")?7:3,
    cooldown_rounds:3,
    element:sp.element||null,
    drain_pct:drain?22:0,
    owner_heal_pct:sp.family==="神聖與傳奇系"?12:0,
    enemy_accuracy_down:(sp.ai_profile==="caster"||sp.family==="魔法與植物系")?1+Math.floor(r/3):0
  };
}
function supportEffect(sp,r){
  return {
    mode:sp.ai_profile==="guardian"?"guard_heal":"heal",
    heal_scale:round1(.62+r*.055),
    max_hp_heal_pct:round1(2+r*.35),
    trigger_hp_pct:84,
    cooldown_rounds:3,
    guard:sp.ai_profile==="guardian",
    element:sp.element||null
  };
}
function effectText(kind,e){
  if(kind==="主動"){
    const parts=[(e.scaling==="magic"?"魔法":"物理")+"攻擊"+Math.round(e.multiplier*100)+"%"];
    if(e.element)parts.push(e.element+"屬性");
    if(e.drain_pct)parts.push("造成傷害的"+e.drain_pct+"%轉為自身HP");
    if(e.owner_heal_pct)parts.push("為主人恢復傷害的"+e.owner_heal_pct+"%HP");
    if(e.enemy_accuracy_down)parts.push("命中後使敵方命中-"+e.enemy_accuracy_down);
    parts.push("冷卻"+e.cooldown_rounds+"回合");
    return parts.join("、");
  }
  if(kind==="輔助"){
    const parts=["魔力係數"+Math.round(e.heal_scale*100)+"%＋目標最大HP"+e.max_hp_heal_pct+"%支援"];
    if(e.guard)parts.push("並進入護衛姿態");
    parts.push("生命低於"+e.trigger_hp_pct+"%時自動判斷","冷卻"+e.cooldown_rounds+"回合");
    return parts.join("、");
  }
  const parts=[];
  if(e.hp_pct)parts.push("最大HP+"+e.hp_pct+"%");
  if(e.attack_pct)parts.push("物理攻擊+"+e.attack_pct+"%");
  if(e.magic_pct)parts.push("魔法攻擊+"+e.magic_pct+"%");
  if(e.defense_pct)parts.push("防禦+"+e.defense_pct+"%");
  if(e.evasion_flat)parts.push("閃避+"+e.evasion_flat);
  if(e.accuracy_flat)parts.push("命中+"+e.accuracy_flat);
  if(e.speed_pct)parts.push("速度+"+e.speed_pct+"%");
  return "出戰時常駐："+parts.join("、");
}
function buildSkill(sp){
  const r=TIER_RANK[sp.tier]??0,kind=skillKind(sp);
  const effect=kind==="主動"?activeEffect(sp,r):kind==="輔助"?supportEffect(sp,r):passiveEffect(sp,r);
  return {
    id:"CSK-"+sp.id,
    name:sp.name+"・"+suffixFor(sp,kind),
    kind,
    tier:sp.tier,
    element:sp.element||null,
    family:sp.family,
    ai_profile:sp.ai_profile,
    auto_controlled:true,
    effect,
    description:effectText(kind,effect)
  };
}

for(const sp of DB.companion_species){
  if(!["pet","summon","contract"].includes(sp.companion_kind))continue;
  sp.unique_skill=buildSkill(sp);
  sp.unique_skill_revision=REV;
}

function audit(){
  const rows=DB.companion_species.filter(sp=>["pet","summon","contract"].includes(sp.companion_kind));
  const issues=[],ids=new Set(),names=new Set(),kind_counts={"主動":0,"被動":0,"輔助":0};
  for(const sp of rows){
    const s=sp.unique_skill;
    if(!s){issues.push(sp.id+":缺少專屬技能");continue}
    if(!VALID_KINDS.has(s.kind))issues.push(sp.id+":技能類型錯誤/"+s.kind);
    else kind_counts[s.kind]=(kind_counts[s.kind]||0)+1;
    if(ids.has(s.id))issues.push(sp.id+":技能ID重複/"+s.id);ids.add(s.id);
    if(names.has(s.name))issues.push(sp.id+":技能名稱重複/"+s.name);names.add(s.name);
    if(!s.description||!s.effect)issues.push(sp.id+":技能效果不完整");
    if(s.tier!==sp.tier)issues.push(sp.id+":技能階級與物種不一致");
  }
  return {
    pass:issues.length===0,total:rows.length,
    pet:rows.filter(x=>x.companion_kind==="pet").length,
    summon:rows.filter(x=>x.companion_kind==="summon").length,
    contract:rows.filter(x=>x.companion_kind==="contract").length,
    kind_counts,issues
  };
}

const initial=audit();
DB.companion_unique_skill_system={
  version:REV,release:RELEASE,
  rule:"每一種寵物、召喚獸與契約獸依家族、元素、AI定位與階級擁有且僅擁有一招專屬技能；技能由夥伴AI自動使用，被動技能於出戰時常駐。",
  supported_kinds:["主動","被動","輔助"],
  balance:"技能倍率與被動加成依F-S階級緩升，不取代角色技能，也不允許玩家手動控制夥伴。",
  initial_audit:initial,
  save_compatible:true
};
DB.companion_system=DB.companion_system||{};
DB.companion_system.unique_skill_revision=REV;
DB.meta=DB.meta||{};
DB.meta.companion_unique_skill_revision=REV;
globalThis.runCompanionUniqueSkillAudit=audit;

function skillOfCompanion(c){return bySpecies(c?.speciesId)?.unique_skill||null}
function applyPassiveStats(stats,skill){
  if(!stats||!skill||skill.kind!=="被動")return stats;
  const e=skill.effect||{},out={...stats};
  if(e.hp_pct)out.hp=Math.max(1,Math.round(out.hp*(1+e.hp_pct/100)));
  if(e.attack_pct)out.attack=Math.max(1,Math.round(out.attack*(1+e.attack_pct/100)));
  if(e.magic_pct)out.magic=Math.max(1,Math.round(out.magic*(1+e.magic_pct/100)));
  if(e.defense_pct)out.defense=Math.max(0,Math.round(out.defense*(1+e.defense_pct/100)));
  if(e.accuracy_flat)out.accuracy=clip(Math.round(out.accuracy+e.accuracy_flat),40,99);
  if(e.evasion_flat)out.evasion=clip(Math.round(out.evasion+e.evasion_flat),0,65);
  if(e.speed_pct)out.speed=Math.max(1,Math.round(out.speed*(1+e.speed_pct/100)));
  return out
}
if(typeof companionCombatStats==="function"){
  const baseCompanionCombatStats=companionCombatStats;
  companionCombatStats=function(inst){return applyPassiveStats(baseCompanionCombatStats.apply(this,arguments),skillOfCompanion({speciesId:inst?.speciesId}))}
}

function currentRound(){return Math.max(1,Number(typeof G!=="undefined"?G?.battle?.round||1:1))}
function ready(c,skill){
  const cd=Math.max(1,Number(skill?.effect?.cooldown_rounds||3));
  const n=Number(c?.uniqueSkillLastRound),last=Number.isFinite(n)?n:-999;
  return currentRound()-last>=cd
}
function markUsed(c){c.uniqueSkillLastRound=currentRound()}
function logSkill(c,skill,msg){
  const line=`${c.name}施展【${skill.name}】${msg?"，"+msg:""}`;
  if(typeof companionBattleLog==="function")companionBattleLog(line);
  else if(typeof battleLog==="function")battleLog("【夥伴】"+line)
}
function trySupportSkill(c,skill){
  if(typeof G==="undefined")return false;
  const b=G?.battle,player=G?.character,e=skill?.effect||{};
  if(!b?.active||!player||!ready(c,skill))return false;
  const pr=player.hp/Math.max(1,player.maxHp),cr=c.hp/Math.max(1,c.maxHp),trigger=clip(Number(e.trigger_hp_pct||84)/100,.35,.98);
  if(pr>=trigger&&cr>=trigger)return false;
  const target=pr<=cr?player:c;
  const heal=Math.max(2,Math.round(c.magic*Number(e.heal_scale||.7)+target.maxHp*(Number(e.max_hp_heal_pct||2)/100)));
  target.hp=clip(target.hp+heal,0,target.maxHp);
  if(e.guard)c.guarding=true;
  markUsed(c);
  logSkill(c,skill,`${target===player?"主人":c.name}恢復${heal}HP${e.guard?"，並進入護衛姿態":""}。`);
  return true
}
function tryActiveSkill(c,skill){
  if(typeof G==="undefined")return false;
  const b=G?.battle,enemy=b?.enemy,e=skill?.effect||{};
  if(!b?.active||!enemy||enemy.hp<=0||!ready(c,skill))return false;
  markUsed(c);
  const roll=typeof rollD20==="function"?rollD20():1+Math.floor(Math.random()*20);
  const score=roll+Math.floor(((c.accuracy||0)+Number(e.accuracy_bonus||0)-(enemy.evasion||0))/10);
  if(score<10){logSkill(c,skill,"攻擊未命中。");return true}
  const magic=e.scaling==="magic",power=magic?c.magic:c.attack;
  const defense=magic?(enemy.magicDefense||enemy.defense||0):(enemy.defense||0);
  let dmg=Math.max(1,Math.round(power*Number(e.multiplier||1.2)-defense*.30));
  const element=e.element||c.element||null;
  if(element&&typeof applyElementDamage==="function")dmg=applyElementDamage(dmg,enemy,element);
  enemy.hp=Math.max(0,enemy.hp-dmg);
  const extra=[];
  if(Number(e.drain_pct)>0){
    const heal=Math.max(1,Math.round(dmg*Number(e.drain_pct)/100));
    c.hp=clip(c.hp+heal,0,c.maxHp);extra.push(`自身恢復${heal}HP`)
  }
  if(Number(e.owner_heal_pct)>0&&G?.character){
    const heal=Math.max(1,Math.round(dmg*Number(e.owner_heal_pct)/100));
    G.character.hp=clip(G.character.hp+heal,0,G.character.maxHp);extra.push(`主人恢復${heal}HP`)
  }
  if(Number(e.enemy_accuracy_down)>0){
    b.enemyBuff=b.enemyBuff||{};
    b.enemyBuff.accuracy=(b.enemyBuff.accuracy||0)-Number(e.enemy_accuracy_down);
    extra.push(`敵方命中-${Number(e.enemy_accuracy_down)}`)
  }
  logSkill(c,skill,`造成${dmg}傷害${element?"／"+element:""}${extra.length?"；"+extra.join("、"):""}。`);
  return true
}
if(typeof resolveCompanionTurn==="function"){
  const baseResolveCompanionTurn=resolveCompanionTurn;
  resolveCompanionTurn=function(){
    if(typeof G!=="undefined"){
      const b=G?.battle,c=b?.companion,enemy=b?.enemy;
      if(b?.active&&c&&!c.knockedOut&&c.hp>0&&enemy?.hp>0){
        const skill=skillOfCompanion(c);
        if(skill?.kind==="輔助"&&trySupportSkill(c,skill))return;
        if(skill?.kind==="主動"&&tryActiveSkill(c,skill))return
      }
    }
    return baseResolveCompanionTurn.apply(this,arguments)
  }
}

function decorateBattleSkill(){
  if(typeof document==="undefined"||typeof G==="undefined")return;
  const box=document.querySelector("#battleBody .battleunit.companion");if(!box)return;
  let line=box.querySelector(".companion-skill-line");
  const c=G?.battle?.companion,sp=c?bySpecies(c.speciesId):null,skill=sp?.unique_skill;
  if(!skill){line?.remove();return}
  if(!line){line=document.createElement("div");line.className="small companion-skill-line";const aura=box.querySelector(".companion-aura-line"),hp=box.querySelector(".hpbar");aura?.after(line)||(hp?box.insertBefore(line,hp):box.appendChild(line))}
  line.innerHTML=`<b>專屬技能：${skill.name}</b>［${skill.kind}］`
}
if(typeof renderBattle==="function"){
  const baseRenderBattle=renderBattle;
  renderBattle=function(){const r=baseRenderBattle.apply(this,arguments);decorateBattleSkill();return r}
}

function auraFor(inst,sp){
  try{return globalThis.QUNLU_COMPANION_AURA?.state?.(inst,sp)||null}catch(_){return null}
}
function auraText(aura){
  try{return globalThis.QUNLU_COMPANION_AURA?.text?.(aura)||"無"}catch(_){return "無"}
}
function companionGrowthText(c){
  const stats=typeof companionCombatStats==="function"?companionCombatStats(c):null;
  const growth=globalThis.QUNLU_COMPANION_GROWTH?.state?.(c)||null;
  if(!stats)return "";
  const base=`HP ${stats.hp}｜物攻 ${stats.attack}｜魔攻 ${stats.magic}｜防禦 ${stats.defense}｜命中 ${stats.accuracy}｜閃避 ${stats.evasion}｜速度 ${stats.speed}`;
  if(!growth)return base;
  const progress=growth.at_owner_cap?`已達主人Lv${growth.owner_level_cap}上限，XP暫停`:`成長基準Lv${growth.growth_anchor_level}｜有效成長+${growth.effective_growth_levels}級｜下一級XP ${growth.xp}/${growth.xp_to_next}`;
  return base+`<br><span class="muted">${progress}</span>`
}
if(typeof openCompanionPanel==="function"){
  openCompanionPanel=function(filter="pet"){
    const isSummon=filter==="summon",list=companions().filter(c=>{
      const k=companionSpecies(c.speciesId)?.companion_kind;return isSummon?k==="summon":k==="pet"||k==="contract"
    });
    const rows=list.map(c=>{
      const sp=companionSpecies(c.speciesId),active=G.character.activeCompanionId===c.uid,skill=sp?.unique_skill,aura=auraFor(c,sp),state=active?"啟動中":"待機不生效";
      const behavior=DB.companion_system?.ai_profiles?.[sp.ai_profile]?.behavior||"依AI定位自動戰鬥";
      const auraBlock=aura?`<div class="card small"><b>獨有光環：${aura.name}</b> <span class="${active?"ok":""}">［${state}］</span><br>己方全體：${auraText(aura)}<br><span class="muted">類型：${aura.signature}｜出戰且未倒下時生效；光環來源不自我增幅。</span></div>`:"";
      const skillBlock=skill?`<div class="card small"><b>專屬技能：${skill.name}</b>［${skill.kind}］<br>${skill.description}<br><span class="muted">${skill.kind==="被動"?"出戰時常駐生效":"由夥伴AI自動判斷使用；玩家不可手動控制。"}</span></div>`:"";
      return `<div class="card"><b>${sp.name}</b> <span class="tier">${sp.tier}</span>［${sp.companion_kind_label}／${sp.ai_label}］${active?" <span class='ok'>出戰中</span>":""}<br>
      <span class="small">Lv${c.level}｜XP ${c.level>=G.character.level?"暫停":Math.round((c.xp||0)*10)/10}/${c.level>=G.character.level?"主人等級上限":companionXpToNext(c.level)}｜羈絆${(c.bond||0).toFixed(1)}%${sp.element?`｜${sp.element}`:""}<br>${behavior}</span>
      <div class="card small"><b>目前能力</b><br>${companionGrowthText(c)}</div>
      ${auraBlock}${skillBlock}
      <div class="actions">${active?`<button disabled>出戰中</button>`:`<button class="good" onclick="setActiveCompanion('${c.uid}')">設為出戰</button>`}<button class="bad" onclick="releaseCompanion('${c.uid}')">離隊</button></div></div>`
    }).join("")||`<div class="card small">目前沒有${isSummon?"召喚獸":"寵物／契約獸"}。</div>`;
    const hint=isSummon?`召喚獸需在法師公會進行召喚研究；最高研究階級：${highestSummonSkillTier()||"尚無召喚技能"}。`:"寵物可在符合地區與階級的探索機緣中馴養；契約獸需進行契約儀式。";
    showModal(isSummon?"召喚":"寵物／契約",`<div class="card small"><b>${companionRosterSummary()}</b><br>${hint}<br>所有夥伴戰鬥時由AI自動操作；每個物種各有一個固定獨有光環與一招專屬技能。</div>${rows}`)
  }
}

if(typeof runGeneratorAudit==="function"){
  const baseRunGeneratorAudit=runGeneratorAudit;
  runGeneratorAudit=function(){
    const issues=baseRunGeneratorAudit.apply(this,arguments)||[],result=audit();
    if(DB.companion_unique_skill_system?.version!==REV)issues.push(REV+"規則缺失");
    for(const msg of result.issues)issues.push("夥伴專屬技能："+msg);
    return issues
  }
}

DB.companion_unique_skill_runtime_system={
  version:RUNTIME_REV,release:RELEASE,
  rules:[
    "主動專屬技能依冷卻由夥伴AI自動施放，不能由玩家手動控制。",
    "輔助專屬技能依主人／夥伴生命狀態自動判斷；守護型可同時進入護衛姿態。",
    "被動專屬技能直接修改出戰夥伴戰鬥快照的HP、攻擊、魔法、防禦、命中、閃避或速度。",
    "專屬技能與既有獨有光環可同時生效，但光環仍不作用於光環來源本身。",
    "夥伴面板顯示修正後的即時能力、成長基準、有效成長等級與主人等級上限狀態。"
  ],
  save_compatible:true
};
DB.meta.companion_unique_skill_runtime_revision=RUNTIME_REV;
if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(REV))){
  DB.integration_registry.optimization_notes.push("CURRENT-1.70.1／COMPANION-UNIQUE-SKILL-1.0：全200種寵物、召喚獸與契約獸各自取得一招依家族、元素與AI定位生成的專屬技能；主動／輔助由AI施放，被動常駐，並與獨有光環並存。")
}
globalThis.QUNLU_COMPANION_UNIQUE_SKILL={version:REV,audit,skillForSpecies:id=>bySpecies(id)?.unique_skill||null};
})();