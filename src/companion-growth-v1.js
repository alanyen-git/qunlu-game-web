/* 群陸旅誌：夥伴能力與升級修正 CURRENT-1.71.0
 * COMPANION-GROWTH-1.0
 * 修正高階夥伴把階級基礎值與絕對等級重複放大的問題，並封鎖主人等級上限時的XP囤積。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.companion_species))return;

const RELEASE="CURRENT-1.71.0";
const REVISION="COMPANION-GROWTH-1.0";
const CORE_GROWTH_PER_LEVEL=.025;
const ACCURACY_PER_LEVEL=.35;
const EVASION_PER_LEVEL=.16;
const SPEED_PER_LEVEL=.10;
const LEVEL_CAP=99;

function speciesFor(inst){
 return inst&&typeof companionSpecies==="function"?companionSpecies(inst.speciesId):null
}
function growthAnchor(sp){
 const gate=DB.companion_system?.tier_gates?.[sp?.tier];
 return Math.max(1,Math.min(LEVEL_CAP,Math.round(Number(sp?.min_owner_level||gate||1))))
}
function ownerLevelCap(){
 return Math.max(1,Math.min(LEVEL_CAP,Math.round(Number(typeof G!=="undefined"?G?.character?.level||1:1))))
}
function growthLevels(inst,sp=speciesFor(inst)){
 const lv=Math.max(1,Math.min(LEVEL_CAP,Math.round(Number(inst?.level||1))));
 return Math.max(0,lv-growthAnchor(sp))
}
function normalizeInstance(inst){
 if(!inst)return false;
 let changed=false;
 const cap=ownerLevelCap(),sp=speciesFor(inst),anchor=growthAnchor(sp);
 const oldLv=Number(inst.level||anchor),lv=Math.max(1,Math.min(cap,LEVEL_CAP,Math.round(oldLv)));
 if(lv!==oldLv){inst.level=lv;changed=true}else inst.level=lv;
 const oldXp=Number(inst.xp||0);
 inst.xp=Math.max(0,Number.isFinite(oldXp)?oldXp:0);
 if(inst.level>=cap&&typeof companionXpToNext==="function"){
   const maxBank=Math.max(0,companionXpToNext(inst.level)-1);
   if(inst.xp>maxBank){inst.xp=maxBank;changed=true}
 }
 if(!Number.isFinite(Number(inst.bond))){inst.bond=0;changed=true}
 inst.bond=Math.max(0,Math.min(100,Number(inst.bond||0)));
 return changed
}
function correctedStats(inst){
 const sp=speciesFor(inst);if(!sp)return null;
 normalizeInstance(inst);
 const b=sp.base_stats||{},lv=Math.max(1,Number(inst.level||1)),delta=growthLevels(inst,sp);
 const scale=1+delta*CORE_GROWTH_PER_LEVEL;
 const owner=typeof combatStats==="function"?combatStats():{summonPower:0};
 const bond=Math.max(0,Math.min(100,Number(inst.bond||0)));
 let power=1+bond/600;
 if(sp.companion_kind==="summon")power*=1+Number(owner.summonPower||0)/350;
 else if(sp.companion_kind==="contract")power*=1+Number(owner.summonPower||0)/500;
 return {
   hp:Math.max(1,Math.round(Number(b.hp||18)*scale*power)),
   attack:Math.max(1,Math.round(Number(b.attack||6)*scale*power)),
   magic:Math.max(1,Math.round(Number(b.magic||4)*scale*power)),
   defense:Math.max(0,Math.round(Number(b.defense||4)*scale*power)),
   accuracy:Math.max(40,Math.min(95,Math.round(Number(b.accuracy||58)+delta*ACCURACY_PER_LEVEL))),
   evasion:Math.max(0,Math.min(55,Math.round(Number(b.evasion||8)+delta*EVASION_PER_LEVEL))),
   speed:Math.max(1,Math.round(Number(b.speed||10)+delta*SPEED_PER_LEVEL)),
   element:sp.element,
   ai:sp.ai_profile
 }
}
function grantActiveCompanionXp(amount){
 const c=typeof activeCompanionInstance==="function"?activeCompanionInstance():null;
 if(!c||!amount)return;
 normalizeInstance(c);
 const cap=ownerLevelCap(),sp=speciesFor(c);
 c.bond=Math.max(0,Math.min(100,Number(c.bond||0)+.35));
 if(c.level>=cap){
   if(typeof companionXpToNext==="function")c.xp=Math.min(Number(c.xp||0),Math.max(0,companionXpToNext(c.level)-1));
   return
 }
 c.xp=Number(c.xp||0)+Math.max(1,Math.round(Number(amount)||0));
 let up=0;
 while(c.level<cap&&c.level<LEVEL_CAP&&c.xp>=companionXpToNext(c.level)){
   c.xp-=companionXpToNext(c.level);c.level++;up++
 }
 if(c.level>=cap&&c.xp>=companionXpToNext(c.level))c.xp=Math.max(0,companionXpToNext(c.level)-1);
 if(up&&typeof log==="function")log("夥伴",`${sp?.name||"出戰夥伴"}提升至Lv${c.level}。`,"ok")
}
function state(inst){
 const sp=speciesFor(inst);if(!sp)return null;
 normalizeInstance(inst);
 const cap=ownerLevelCap(),now=typeof companionCombatStats==="function"?companionCombatStats(inst):correctedStats(inst);
 let next=null;
 if(inst.level<cap&&inst.level<LEVEL_CAP){
   const clone={...inst,level:inst.level+1};
   next=correctedStats(clone)
 }
 return {
   revision:REVISION,
   species_id:sp.id,
   level:inst.level,
   owner_level_cap:cap,
   growth_anchor_level:growthAnchor(sp),
   effective_growth_levels:growthLevels(inst,sp),
   core_growth_per_level:CORE_GROWTH_PER_LEVEL,
   xp:Number(inst.xp||0),
   xp_to_next:inst.level>=cap?null:companionXpToNext(inst.level),
   at_owner_cap:inst.level>=cap,
   stats:now,
   next_base_stats:next
 }
}
function audit(){
 const issues=[],tiers=DB.companion_system?.tier_gates||{};
 for(const sp of DB.companion_species){
   const anchor=growthAnchor(sp),gate=Number(tiers[sp.tier]||anchor);
   if(anchor!==gate)issues.push(`夥伴成長基準與階級門檻不一致:${sp.id}/${anchor}/${gate}`);
   if(anchor<1||anchor>LEVEL_CAP)issues.push(`夥伴成長基準超界:${sp.id}`);
   for(const k of ["hp","attack","magic","defense","accuracy","evasion","speed"])if(!Number.isFinite(Number(sp.base_stats?.[k])))issues.push(`夥伴基礎能力缺失:${sp.id}/${k}`)
 }
 return issues
}

if(typeof companionCombatStats==="function")companionCombatStats=correctedStats;
if(typeof gainCompanionXp==="function")gainCompanionXp=grantActiveCompanionXp;

let saveChanged=false;
if(typeof G!=="undefined"&&G?.character?.companions){
 for(const c of G.character.companions)if(normalizeInstance(c))saveChanged=true;
 if(saveChanged&&typeof persist==="function")persist()
}

DB.companion_growth_system={
 version:REVISION,
 release:RELEASE,
 max_level:LEVEL_CAP,
 growth_anchor:"species_min_owner_level",
 core_stat_growth_per_level:CORE_GROWTH_PER_LEVEL,
 accuracy_per_level:ACCURACY_PER_LEVEL,
 evasion_per_level:EVASION_PER_LEVEL,
 speed_per_level:SPEED_PER_LEVEL,
 xp_source:"出戰夥伴於戰鬥勝利取得既有35%敵人XP份額",
 owner_level_cap:true,
 xp_banking_at_owner_cap:false,
 bond_gain_per_victory:.35,
 rules:[
   "物種base_stats已包含階級基礎能力，因此等級成長只計算超過該物種最低取得等級的有效成長等級，避免階級與等級重複放大。",
   "核心HP／物攻／魔攻／防禦每個有效成長等級增加2.5%；命中、閃避、速度採較低線性成長。",
   "夥伴不得高於主人等級；追上主人後暫停取得XP，避免預先囤積XP造成主人升級後瞬間連動升級。",
   "羈絆與召喚力仍沿用既有乘區；召喚獸與契約獸仍受召喚力額外加成。",
   "既有夥伴等級、羈絆、物種與取得來源全部保留；能力值於戰鬥開始時依新公式即時計算。"
 ],
 save_compatible:true
};
DB.meta=DB.meta||{};
DB.meta.companion_growth_revision=REVISION;
if(DB.companion_system){
 DB.companion_system.level_rule="夥伴等級獨立成長且不得高於角色等級；物種基礎值已含階級強度，升級只計算超過物種最低取得等級的有效成長等級；追上主人後暫停XP。";
 DB.companion_system.growth_revision=REVISION;
 DB.companion_system.xp_cap_rule="出戰夥伴追上主人等級後暫停取得XP，不允許無限囤積至未來等級。"
}
if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(REVISION))){
 DB.integration_registry.optimization_notes.push("CURRENT-1.71.0／COMPANION-GROWTH-1.0：修正夥伴base_stats與絕對等級重複放大；改以物種最低取得等級作為成長基準，並封鎖主人等級上限時的XP囤積。")
}
if(typeof runGeneratorAudit==="function"){
 const baseRunGeneratorAudit=runGeneratorAudit;
 runGeneratorAudit=function(){
   const issues=baseRunGeneratorAudit.apply(this,arguments)||[];
   for(const msg of audit())issues.push("夥伴成長："+msg);
   return issues
 }
}
globalThis.QUNLU_COMPANION_GROWTH={version:REVISION,state,audit,growthAnchor,growthLevels,normalizeInstance};
})();