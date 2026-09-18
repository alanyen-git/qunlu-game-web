/* 群陸旅誌：寵物／召喚獸獨有光環 CURRENT-1.70.0
 * COMPANION-AURA-1.0
 * 每個夥伴物種依夥伴類型、AI定位、元素、族群與固定物種簽章生成唯一光環。
 * 出戰時作用於主人與冒險團隊友；夥伴倒下時立即失效。既有存檔不增欄位。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REVISION="COMPANION-AURA-1.0";
const TIER_SCALE={F:.75,E:.9,D:1.05,C:1.2,B:1.4,A:1.65,S:1.9};
const KIND_SCALE={pet:.9,summon:1,contract:1.05};
const PROFILE={
  guardian:{suffix:"守護領域",effects:{defense:1.5,magicDefense:1,blockRate:1.5,poise:2}},
  assault:{suffix:"猛攻領域",effects:{attack:1.5,critRate:1,critDamage:2}},
  skirmisher:{suffix:"疾獵領域",effects:{accuracy:1,evasion:1.5,initiative:2,moveSpeed:2}},
  caster:{suffix:"術式領域",effects:{magicPower:1.5,magicPenPct:1,statusAccuracy:1.5}},
  support:{suffix:"護生領域",effects:{healingPower:3,statusResist:1.5,manaRegen:.12}},
  dark:{suffix:"蝕影領域",effects:{attack:1,magicPower:1,lifeSteal:.5,statusAccuracy:1}},
  legend:{suffix:"王者領域",effects:{attack:1,magicPower:1,defense:1,magicDefense:1,critRate:1,statusResist:1}},
  balanced:{suffix:"共鳴領域",effects:{accuracy:1,statusResist:1}}
};
const KIND={
  pet:{label:"伴生",effects:{perception:1.5,hpRegen:.05}},
  summon:{label:"召靈",effects:{magicPower:.5,manaRegen:.08,statusAccuracy:.5}},
  contract:{label:"契約",effects:{attack:.5,magicPower:.5,statusResist:.5}}
};
const ELEMENT={
  光明:{suffix:"聖輝",effects:{healingPower:2,statusResist:1},resist:{光明:3}},
  黑暗:{suffix:"幽影",effects:{magicPower:1,statusAccuracy:1,critDamage:1},resist:{黑暗:3}},
  火:{suffix:"熾脈",effects:{attack:1,magicPower:1},resist:{火:3}},
  風:{suffix:"迅風",effects:{evasion:1,initiative:1.5,moveSpeed:1},resist:{風:3}},
  水:{suffix:"潮息",effects:{magicDefense:1,healingPower:1.5},resist:{水:3}},
  地:{suffix:"磐域",effects:{defense:1.5,poise:1.5},resist:{地:3}},
  雷:{suffix:"雷脈",effects:{critRate:1,initiative:1.5,accuracy:.5},resist:{雷:3}},
  生命:{suffix:"生息",effects:{hpRegen:.1,healingPower:2,statusResist:.5},resist:{生命:3}},
  死亡:{suffix:"冥痕",effects:{critDamage:2,statusAccuracy:1,critResist:.5},resist:{死亡:3}}
};
const SIGNATURES=[
  {suffix:"銳感",effects:{accuracy:.5,perception:1}},
  {suffix:"靈步",effects:{evasion:.5,moveSpeed:1}},
  {suffix:"堅心",effects:{statusResist:.75,critResist:.5}},
  {suffix:"獵意",effects:{critRate:.5,accuracy:.5}},
  {suffix:"秘感",effects:{statusAccuracy:.75,perception:.5}},
  {suffix:"護念",effects:{magicDefense:.75,healingPower:1}},
  {suffix:"戰意",effects:{attack:.75,poise:.75}},
  {suffix:"靈潮",effects:{magicPower:.75,manaRegen:.04}},
  {suffix:"守勢",effects:{defense:.75,blockRate:.5}},
  {suffix:"先覺",effects:{initiative:1,perception:.5}},
  {suffix:"尋珍",effects:{lootRate:1,rareEventRate:.1}},
  {suffix:"潛行",effects:{stealth:1,evasion:.5}}
];
const LABELS={
 attack:"物攻",magicPower:"魔攻",defense:"物防",magicDefense:"魔防",accuracy:"命中",evasion:"閃避",
 critRate:"爆擊",critDamage:"爆傷",initiative:"先攻",moveSpeed:"移速",armorPenPct:"破甲",magicPenPct:"法穿",
 blockRate:"格擋",blockValue:"格擋減傷",poise:"韌性",statusAccuracy:"異常命中",statusResist:"異常抗性",
 lifeSteal:"生命偷取",healingPower:"治療效果",manaRegen:"MP回復",hpRegen:"HP回復",critResist:"爆擊抗性",
 stealth:"潛行",perception:"感知",lootRate:"掉寶率",rareEventRate:"稀有事件率"
};
const AURA_KEYS=new Set(Object.keys(LABELS));

function hashText(text){
  let h=2166136261>>>0;
  for(const ch of String(text||"")){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0}
  return h>>>0
}
function mergeInto(target,source){
  for(const [k,v] of Object.entries(source||{}))target[k]=Number(target[k]||0)+Number(v||0);
  return target
}
function familyEffects(sp){
  const f=String(sp?.family||"");
  if(/狼|犬|狐|canine|wolf|dog|fox/i.test(f))return {suffix:"群獵",effects:{accuracy:1,perception:1.5}};
  if(/貓|豹|虎|獅|feline|cat|panther|tiger|lion/i.test(f))return {suffix:"伏獵",effects:{evasion:1,critRate:.75}};
  if(/鳥|鷹|隼|鴞|owl|bird|avian|eagle|hawk|falcon/i.test(f))return {suffix:"天巡",effects:{initiative:1.5,perception:1.5}};
  if(/龍|dragon|drake|wyrm/i.test(f))return {suffix:"龍威",effects:{defense:1,magicDefense:1,poise:1}};
  if(/黏|史萊姆|slime|ooze/i.test(f))return {suffix:"膠質",effects:{statusResist:1.5,defense:.75}};
  if(/精靈|元素|靈體|spirit|elemental/i.test(f))return {suffix:"靈質",effects:{magicPower:1,manaRegen:.06}};
  if(/不死|亡靈|undead|wraith|skeleton/i.test(f))return {suffix:"冥韌",effects:{critResist:1,statusResist:1}};
  if(/妖精|仙靈|fairy|fey|sprite/i.test(f))return {suffix:"妖光",effects:{evasion:.75,magicPower:.75}};
  if(/魚|水棲|aquatic|fish|serpent/i.test(f))return {suffix:"水棲",effects:{magicDefense:1,evasion:.5}};
  if(/構裝|魔像|golem|construct/i.test(f))return {suffix:"構裝",effects:{defense:1.5,poise:1.5}};
  if(/蟲|蜂|蠍|蛛|insect|bee|scorpion|spider/i.test(f))return {suffix:"蟲感",effects:{statusAccuracy:1,evasion:.5}};
  if(/馬|鹿|騎獸|horse|stag|equine/i.test(f))return {suffix:"奔行",effects:{moveSpeed:1.5,initiative:1}};
  if(/植物|樹|藤|plant|treant|vine/i.test(f))return {suffix:"根息",effects:{hpRegen:.06,statusResist:1}};
  if(/獸|beast/i.test(f))return {suffix:"野性",effects:{attack:.75,accuracy:.75}};
  return {suffix:"異質",effects:{}}
}
function auraBlueprint(sp){
  if(!sp)return null;
  const profile=PROFILE[sp.ai_profile]||PROFILE.balanced;
  const kind=KIND[sp.companion_kind]||KIND.pet;
  const elem=ELEMENT[sp.element]||null;
  const family=familyEffects(sp);
  const sig=SIGNATURES[hashText(sp.id)%SIGNATURES.length];
  const effects={};
  mergeInto(effects,profile.effects);mergeInto(effects,kind.effects);mergeInto(effects,elem?.effects);mergeInto(effects,family.effects);mergeInto(effects,sig.effects);
  const resist={};mergeInto(resist,elem?.resist);
  const elementName=elem?.suffix||"無相";
  return {
    id:`AURA-${sp.id}`,
    name:`${sp.name}・${elementName}${profile.suffix}`,
    revision:REVISION,
    source_species_id:sp.id,
    source_kind:sp.companion_kind,
    source_kind_label:sp.companion_kind_label||kind.label,
    ai_profile:sp.ai_profile||"balanced",
    tier:sp.tier||"F",
    element:sp.element||null,
    family:sp.family||null,
    signature:`${family.suffix}・${sig.suffix}`,
    scope:"all_allies_except_source",
    activation:"active_companion_alive",
    effects,
    element_resistances:resist
  }
}
function scaleNumber(v,factor,key){
  const n=Number(v||0)*factor;
  if(["manaRegen","hpRegen","lifeSteal","rareEventRate"].includes(key))return Math.round(n*100)/100;
  return Math.round(n*10)/10
}
function auraStateFor(inst,sp){
  if(!inst||!sp)return null;
  const base=sp.unique_aura||auraBlueprint(sp);
  const tier=TIER_SCALE[sp.tier]??.75,kind=KIND_SCALE[sp.companion_kind]??.9;
  const level=1+Math.min(.15,Math.max(0,(Number(inst.level||1)-1)*.004));
  const bond=1+Math.min(.2,Math.max(0,Number(inst.bond||0))/500);
  const factor=tier*kind*level*bond;
  const effects={},resist={};
  for(const [k,v] of Object.entries(base.effects||{}))effects[k]=scaleNumber(v,factor,k);
  for(const [k,v] of Object.entries(base.element_resistances||{}))resist[k]=Math.round(Number(v||0)*factor);
  return {...base,level:Number(inst.level||1),bond:Number(inst.bond||0),factor:Math.round(factor*1000)/1000,effects,element_resistances:resist}
}
function activeAura(){
  if(typeof activeCompanionInstance!=="function"||typeof companionSpecies!=="function")return null;
  const inst=activeCompanionInstance();if(!inst)return null;
  if(typeof G!=="undefined"&&G?.battle?.active){
    const snap=G.battle.companion;
    if(!snap||snap.knockedOut||Number(snap.hp||0)<=0)return null
  }
  const sp=companionSpecies(inst.speciesId);
  return auraStateFor(inst,sp)
}
function fmt(v){
  const n=Number(v||0);if(!Number.isFinite(n))return "0";
  if(Math.abs(n)<1)return `${n>0?"+":""}${n.toFixed(2).replace(/0+$/,"").replace(/\.$/,"")}`;
  const rounded=Math.round(n*10)/10;return `${rounded>0?"+":""}${Number.isInteger(rounded)?rounded:rounded.toFixed(1)}`
}
function auraText(aura){
  if(!aura)return "無";
  const parts=[];
  for(const [k,v] of Object.entries(aura.effects||{}))if(Number(v))parts.push(`${LABELS[k]||k}${fmt(v)}`);
  for(const [k,v] of Object.entries(aura.element_resistances||{}))if(Number(v))parts.push(`${k}抗性${fmt(v)}`);
  return parts.join("、")||"無數值效果"
}
function applyCombatAura(base,aura){
  if(!aura)return base;
  const out={...base};
  for(const [k,v] of Object.entries(aura.effects||{})){
    if(!AURA_KEYS.has(k)||!(k in out))continue;
    out[k]=Number(out[k]||0)+Number(v||0)
  }
  const integerKeys=["attack","magicPower","defense","magicDefense","accuracy","evasion","critRate","critDamage","initiative","moveSpeed","blockRate","blockValue","poise","statusAccuracy","statusResist","healingPower","critResist","stealth","perception","lootRate"];
  integerKeys.forEach(k=>{if(k in out)out[k]=Math.round(out[k])});
  out.accuracy=Math.min(99,Math.max(5,out.accuracy));
  out.evasion=Math.min(80,Math.max(0,out.evasion));
  out.critRate=Math.min(75,Math.max(0,out.critRate));
  out.blockRate=Math.min(75,Math.max(0,out.blockRate));
  out.statusAccuracy=Math.min(95,Math.max(0,out.statusAccuracy));
  out.statusResist=Math.min(90,Math.max(0,out.statusResist));
  out.moveSpeed=Math.min(180,Math.max(55,out.moveSpeed));
  out.armorPenPct=Math.min(60,Math.max(0,out.armorPenPct));
  out.magicPenPct=Math.min(60,Math.max(0,out.magicPenPct));
  out.critResist=Math.min(60,Math.max(0,out.critResist));
  out.lifeSteal=Math.min(50,Math.max(0,Math.round(Number(out.lifeSteal||0)*10)/10));
  out.lootRate=Math.min(200,Math.max(100,out.lootRate));
  out.rareEventRate=Math.min(20,Math.max(1,Math.round(Number(out.rareEventRate||0)*10)/10));
  out.manaRegen=Math.round(Number(out.manaRegen||0)*100)/100;
  out.hpRegen=Math.round(Number(out.hpRegen||0)*100)/100;
  return out
}
function applyPartyAura(base,aura){
  if(!aura)return base;
  const out={...base},e=aura.effects||{};
  out.attack=Math.max(1,Math.round(Number(out.attack||0)+Number(e.attack||0)));
  out.magic=Math.max(1,Math.round(Number(out.magic||0)+Number(e.magicPower||0)));
  out.defense=Math.max(0,Math.round(Number(out.defense||0)+Number(e.defense||0)+Number(e.magicDefense||0)*.25));
  out.accuracy=Math.min(95,Math.max(40,Math.round(Number(out.accuracy||0)+Number(e.accuracy||0))));
  out.evasion=Math.min(55,Math.max(0,Math.round(Number(out.evasion||0)+Number(e.evasion||0))));
  out.speed=Math.round(Number(out.speed||0)+Number(e.initiative||0)*.35+Number(e.moveSpeed||0)*.2);
  return out
}
function decorateBattleAura(){
  if(typeof document==="undefined")return;
  const box=document.querySelector("#battleBody .battleunit.companion");if(!box)return;
  let line=box.querySelector(".companion-aura-line");
  const aura=activeAura();
  if(!aura){line?.remove();return}
  if(!line){line=document.createElement("div");line.className="small companion-aura-line";const hp=box.querySelector(".hpbar");hp?box.insertBefore(line,hp):box.appendChild(line)}
  line.innerHTML=`<b>光環：${aura.name}</b><br>己方：${auraText(aura)}`
}

DB.companion_aura_system={
  version:REVISION,
  rule:"每個寵物、召喚獸與契約獸物種各有固定獨有光環；出戰且未倒下時作用於主人與冒險團隊友，來源本身不吃自己的光環。",
  generation_axes:["companion_kind","ai_profile","element","family","species_signature","tier","level","bond"],
  supported_kinds:["pet","summon","contract"],
  supported_profiles:Object.keys(PROFILE),
  tier_scale:{...TIER_SCALE},
  save_schema_changed:false
};
DB.meta=DB.meta||{};
DB.meta.companion_aura_revision=REVISION;
for(const sp of (DB.companion_species||[]))sp.unique_aura=auraBlueprint(sp);
DB.companion_aura_system.species_total=(DB.companion_species||[]).length;
DB.companion_aura_system.aura_total=(DB.companion_species||[]).filter(sp=>sp.unique_aura).length;
if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(REVISION))){
  DB.integration_registry.optimization_notes.push("CURRENT-1.70.0／COMPANION-AURA-1.0：全寵物、召喚獸與契約獸依類型、AI、元素、族群與物種簽章生成固定獨有光環；出戰生效、倒下失效，既有存檔相容。")
}

if(typeof combatStats==="function"){
  const baseCombatStats=combatStats;
  combatStats=function(){return applyCombatAura(baseCombatStats.apply(this,arguments),activeAura())}
}
if(typeof elementalResistances==="function"){
  const baseElementalResistances=elementalResistances;
  elementalResistances=function(){
    const out={...baseElementalResistances.apply(this,arguments)},aura=activeAura();
    for(const [k,v] of Object.entries(aura?.element_resistances||{}))out[k]=Math.max(-50,Math.min(80,Number(out[k]||0)+Number(v||0)));
    return out
  }
}
function setPartySnapshotAuraStats(m,aura){
  if(!m)return m;
  m._auraBase=m._auraBase||{
    attack:Number(m.attack||0),magic:Number(m.magic||0),defense:Number(m.defense||0),
    accuracy:Number(m.accuracy||0),evasion:Number(m.evasion||0),speed:Number(m.speed||0)
  };
  const next=applyPartyAura(m._auraBase,aura);
  for(const k of ["attack","magic","defense","accuracy","evasion","speed"])m[k]=next[k];
  return m
}
function syncBattlePartyAura(){
  if(typeof G==="undefined"||!G?.battle?.active||!Array.isArray(G.battle.party))return;
  const aura=activeAura();
  for(const m of G.battle.party)setPartySnapshotAuraStats(m,aura)
}
if(typeof partyBattleSnapshots==="function"){
  const basePartyBattleSnapshots=partyBattleSnapshots;
  partyBattleSnapshots=function(){
    const snaps=basePartyBattleSnapshots.apply(this,arguments)||[],aura=activeAura();
    for(const m of snaps)setPartySnapshotAuraStats(m,aura);
    return snaps
  }
}
if(typeof battleCompanionSnapshot==="function"){
  const baseBattleCompanionSnapshot=battleCompanionSnapshot;
  battleCompanionSnapshot=function(){
    const snap=baseBattleCompanionSnapshot.apply(this,arguments);if(!snap)return snap;
    const inst=typeof activeCompanionInstance==="function"?activeCompanionInstance():null,sp=inst&&typeof companionSpecies==="function"?companionSpecies(inst.speciesId):null;
    snap.aura=auraStateFor(inst,sp);return snap
  }
}
if(typeof resolvePartyTurns==="function"){
  const baseResolvePartyTurns=resolvePartyTurns;
  resolvePartyTurns=function(){syncBattlePartyAura();const r=baseResolvePartyTurns.apply(this,arguments);syncBattlePartyAura();return r}
}
if(typeof partyThreatTargets==="function"){
  const basePartyThreatTargets=partyThreatTargets;
  partyThreatTargets=function(){syncBattlePartyAura();return basePartyThreatTargets.apply(this,arguments)}
}
if(typeof enemyBattleTurn==="function"){
  const baseEnemyBattleTurn=enemyBattleTurn;
  enemyBattleTurn=function(){syncBattlePartyAura();const r=baseEnemyBattleTurn.apply(this,arguments);syncBattlePartyAura();return r}
}
if(typeof renderBattle==="function"){
  const baseRenderBattle=renderBattle;
  renderBattle=function(){syncBattlePartyAura();const r=baseRenderBattle.apply(this,arguments);decorateBattleAura();return r}
}
if(typeof openCompanionPanel==="function"){
  openCompanionPanel=function(filter="pet"){
    const isSummon=filter==="summon",list=companions().filter(c=>{
      const k=companionSpecies(c.speciesId)?.companion_kind;return isSummon?k==="summon":k==="pet"||k==="contract"
    });
    const rows=list.map(c=>{
      const sp=companionSpecies(c.speciesId),active=G.character.activeCompanionId===c.uid,aura=auraStateFor(c,sp),state=active?"啟動中":"待機不生效";
      return `<div class="card"><b>${sp.name}</b> <span class="tier">${sp.tier}</span>［${sp.companion_kind_label}／${sp.ai_label}］${active?" <span class='ok'>出戰中</span>":""}<br>
      <span class="small">Lv${c.level}｜XP ${c.xp||0}/${c.level>=G.character.level?"主人等級上限":companionXpToNext(c.level)}｜羈絆${(c.bond||0).toFixed(1)}%${sp.element?`｜${sp.element}`:""}<br>${DB.companion_system.ai_profiles[sp.ai_profile].behavior}</span>
      <div class="card small"><b>獨有光環：${aura.name}</b> <span class="${active?"ok":""}">［${state}］</span><br>己方全體：${auraText(aura)}<br><span class="muted">類型：${aura.signature}｜出戰且未倒下時生效；光環來源不自我增幅。</span></div>
      <div class="actions">${active?`<button disabled>出戰中</button>`:`<button class="good" onclick="setActiveCompanion('${c.uid}')">設為出戰</button>`}<button class="bad" onclick="releaseCompanion('${c.uid}')">離隊</button></div></div>`
    }).join("")||`<div class="card small">目前沒有${isSummon?"召喚獸":"寵物／契約獸"}。</div>`;
    const hint=isSummon?`召喚獸需在法師公會進行召喚研究；最高研究階級：${highestSummonSkillTier()||"尚無召喚技能"}。`:"寵物可在符合地區與階級的探索機緣中馴養；契約獸需進行契約儀式。";
    showModal(isSummon?"召喚":"寵物／契約",`<div class="card small"><b>${companionRosterSummary()}</b><br>${hint}<br>所有夥伴戰鬥時由AI自動操作；每個物種各有一個固定獨有光環。</div>${rows}`)
  }
}
if(typeof runGeneratorAudit==="function"){
  const baseRunGeneratorAudit=runGeneratorAudit;
  runGeneratorAudit=function(){
    const issues=baseRunGeneratorAudit.apply(this,arguments),species=DB.companion_species||[];
    if(DB.companion_aura_system?.version!==REVISION)issues.push(`${REVISION}規則缺失`);
    const ids=new Set(),names=new Set();
    for(const sp of species){
      const a=sp.unique_aura;
      if(!a||a.source_species_id!==sp.id){issues.push(`夥伴光環缺失:${sp.id}`);continue}
      if(ids.has(a.id))issues.push(`夥伴光環ID重複:${a.id}`);ids.add(a.id);
      if(names.has(a.name))issues.push(`夥伴光環名稱重複:${a.name}`);names.add(a.name);
      if(!Object.keys(a.effects||{}).length&&!Object.keys(a.element_resistances||{}).length)issues.push(`夥伴光環無效果:${sp.id}`);
      for(const k of Object.keys(a.effects||{}))if(!AURA_KEYS.has(k))issues.push(`夥伴光環未支援效果:${sp.id}/${k}`)
    }
    return issues
  }
}

globalThis.QUNLU_COMPANION_AURA={version:REVISION,resolve:auraBlueprint,state:auraStateFor,active:activeAura,text:auraText};
})();
