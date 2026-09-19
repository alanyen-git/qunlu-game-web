/* 群陸旅誌：夥伴物種簽章 CURRENT-1.84.0
 * COMPANION-SPECIES-IDENTITY-1.0
 * 解決同家族寵物／召喚獸光環與技能過度同質：每個物種再取得固定簽章，
 * 簽章會改變光環效果、條件觸發、技能名稱與實戰附加行為。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.companion_species))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.84.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.84.0";
const REV="COMPANION-SPECIES-IDENTITY-1.0";
const clip=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const round1=n=>Math.round((Number(n)||0)*10)/10;
const hashText=text=>{
 let h=2166136261>>>0;
 for(const ch of String(text||"")){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0}
 return h>>>0;
};
const bySpecies=id=>(DB.companion_species||[]).find(x=>x?.id===id)||null;
const companionRows=DB.companion_species.filter(sp=>["pet","summon","contract"].includes(sp?.companion_kind));

const SIGNATURES=[
 {key:"blood_scent",auraName:"血嗅獵域",skillLead:"血嗅",trigger:"敵人生命低於55%",rule:"敵人負傷後進入追獵，命中與爆擊提高。",static:{accuracy:2,critRate:1},dynamic:{accuracy:2,critRate:2},activeMult:1.18},
 {key:"ambush_shadow",auraName:"伏影獵域",skillLead:"伏影",trigger:"戰鬥前2回合",rule:"開戰時藏入死角，先攻與迴避提高。",static:{evasion:2,initiative:2},dynamic:{evasion:3,initiative:3},activeMult:1.16},
 {key:"nest_guard",auraName:"護巢領域",skillLead:"護巢",trigger:"主人生命低於65%",rule:"主人受傷時轉向護主，防禦、格擋與異常抗性提高。",static:{defense:2,statusResist:1},dynamic:{defense:3,blockRate:3,statusResist:2},guard:true},
 {key:"breaker",auraName:"破勢獵域",skillLead:"破勢",trigger:"敵人生命高於70%",rule:"面對完整防線時尋找薄弱點，提升穿透與命中。",static:{armorPenPct:2,accuracy:1},dynamic:{armorPenPct:3,accuracy:2},activeMult:1.12,breakDefense:true},
 {key:"relentless",auraName:"長驅領域",skillLead:"長驅",trigger:"第4回合起",rule:"久戰後進入穩定節奏，攻勢與抗壓逐步提高。",static:{hpRegen:.05,statusResist:1},dynamic:{attack:2,magicPower:2,statusResist:2},activeMult:1.15},
 {key:"mana_vein",auraName:"靈脈領域",skillLead:"靈脈",trigger:"主人魔力低於50%",rule:"主人魔力吃緊時強化魔力循環與術式壓力。",static:{magicPower:2,manaRegen:.08},dynamic:{magicPower:2,magicPenPct:2,manaRegen:.1},manaHelp:true},
 {key:"clear_heart",auraName:"清心領域",skillLead:"清心",trigger:"主人受到可淨化異常",rule:"主人受精神或行動干擾時提高抗性與治療效率。",static:{statusResist:2,healingPower:2},dynamic:{statusResist:4,healingPower:6},cleanse:true},
 {key:"thunder_step",auraName:"雷動領域",skillLead:"雷動",trigger:"奇數回合",rule:"奇數回合加速突進，先攻、命中與爆擊提高。",static:{initiative:2,critRate:1},dynamic:{initiative:3,accuracy:2,critRate:2},activeAccuracy:4},
 {key:"stone_watch",auraName:"磐守領域",skillLead:"磐守",trigger:"偶數回合",rule:"偶數回合收斂攻勢，轉入防禦與韌性。",static:{defense:2,poise:2},dynamic:{defense:3,magicDefense:2,poise:3},guard:true},
 {key:"status_resonance",auraName:"異響領域",skillLead:"異響",trigger:"敵人已有異常狀態",rule:"敵人一旦失衡便放大異常與穿透效果。",static:{statusAccuracy:2,magicPenPct:2},dynamic:{statusAccuracy:4,magicPenPct:3},activeMult:1.14},
 {key:"adversity",auraName:"逆境領域",skillLead:"逆境",trigger:"主人生命低於40%",rule:"主人陷入危急時爆發攻勢，同時提高爆擊抗性。",static:{critResist:1,statusResist:1},dynamic:{attack:3,magicPower:3,critResist:4},activeMult:1.20},
 {key:"perfect_form",auraName:"完勢領域",skillLead:"完勢",trigger:"主人生命高於85%",rule:"隊伍完整時維持精準攻勢，命中與爆擊提高。",static:{accuracy:1,critRate:2},dynamic:{accuracy:3,critRate:3},activeMult:1.12},
 {key:"life_bite",auraName:"噬生領域",skillLead:"噬生",trigger:"敵人生命低於60%",rule:"從受創目標汲取生命，吸血與爆傷提高。",static:{lifeSteal:1.5,critDamage:3},dynamic:{lifeSteal:2,critDamage:5},drainBoost:8},
 {key:"far_sight",auraName:"遠望領域",skillLead:"遠望",trigger:"敵人尚未受到異常且前3回合",rule:"戰況尚未混亂時維持觀測優勢，先攻與感知提高。",static:{perception:2,initiative:2},dynamic:{accuracy:2,initiative:2},activeAccuracy:3},
 {key:"hamper",auraName:"斷勢領域",skillLead:"斷勢",trigger:"敵人未受到緩速",rule:"優先破壞敵方節奏，命中後更容易造成緩速。",static:{accuracy:1,statusAccuracy:2},dynamic:{statusAccuracy:3,accuracy:2},slowChance:35},
 {key:"renewal",auraName:"回春領域",skillLead:"回春",trigger:"夥伴生命低於55%",rule:"自身受傷後強化治療與再生，適合拉長戰線。",static:{healingPower:3,hpRegen:.06},dynamic:{healingPower:5,statusResist:2},selfHeal:true},
 {key:"bond_guard",auraName:"守契領域",skillLead:"守契",trigger:"夥伴生命低於50%",rule:"夥伴危急時強化主人防護，呈現互相承擔的羈絆。",static:{defense:1,magicDefense:1,statusResist:2},dynamic:{defense:3,magicDefense:3,statusResist:3},guard:true},
 {key:"treasure_sense",auraName:"尋珍領域",skillLead:"尋珍",trigger:"戰鬥第一回合",rule:"保留探索本能，同時在初次交鋒時快速辨識破綻。",static:{lootRate:2,rareEventRate:.1,perception:1},dynamic:{accuracy:2,critRate:1},activeAccuracy:3},
 {key:"ghost_walk",auraName:"幽行領域",skillLead:"幽行",trigger:"戰鬥前2回合",rule:"開戰時以隱匿步調迴避正面壓力，提升閃避與命中。",static:{stealth:2,evasion:2},dynamic:{evasion:3,accuracy:2},activeMult:1.10},
 {key:"royal_breath",auraName:"王息領域",skillLead:"王息",trigger:"攻守回合交替",rule:"奇數回合偏攻、偶數回合偏守，形成固定戰鬥節拍。",static:{attack:1,magicPower:1,defense:1,magicDefense:1},dynamicOdd:{attack:2,magicPower:2,critRate:1},dynamicEven:{defense:2,magicDefense:2,statusResist:2}}
];

const CORE_ACTION={
 pack_hunt:"裂襲",hunt_instinct:"獵心",rally_howl:"群吼",
 dive_break:"俯擊",sky_dance:"翔舞",wing_screen:"翼障",
 root_snare:"纏束",root_cycle:"輪息",life_bloom:"綻生",
 dragon_breath:"龍息",dragon_majesty:"龍威",scale_guard:"鱗障",
 resonance_burst:"共振",element_core:"靈核",element_ward:"元素幕",
 soul_drain:"噬魂",undying_shadow:"冥返",grave_veil:"幽幕",
 judgment:"裁決",oathkeeper:"守誓",sanctuary:"聖域"
};

function morphology(sp){
 const n=String(sp?.name||""),f=String(sp?.family||"");
 if(/狼|犬|hound|wolf|dog/i.test(n+f))return "牙";
 if(/狐|fox/i.test(n+f))return "尾";
 if(/虎|豹|獅|貓|lynx|cat|tiger|lion|panther/i.test(n+f))return "爪";
 if(/熊|bear/i.test(n+f))return "掌";
 if(/鷹|隼|鴞|鳥|eagle|hawk|falcon|owl|bird/i.test(n+f))return "翼";
 if(/蛇|serpent|snake/i.test(n+f))return "牙";
 if(/龍|dragon|drake|wyrm/i.test(n+f))return "鱗";
 if(/樹|藤|花|草|plant|treant|vine/i.test(n+f))return "芽";
 if(/元素|精靈|spirit|elemental/i.test(n+f))return "核";
 if(/不死|亡靈|幽靈|wraith|undead|skeleton/i.test(n+f))return "魂";
 if(/惡魔|demon/i.test(n+f))return "角";
 if(/神聖|天使|holy|celestial/i.test(n+f))return "輝";
 if(/黏|史萊姆|slime|ooze/i.test(n+f))return "膠";
 if(/蟲|蛛|蠍|蜂|insect|spider|scorpion|bee/i.test(n+f))return "刺";
 if(/馬|鹿|horse|stag/i.test(n+f))return "蹄";
 if(f.includes("飛行"))return "翼";
 if(f.includes("龍"))return "鱗";
 if(f.includes("元素"))return "核";
 if(f.includes("魔法與植物"))return "芽";
 if(f.includes("惡魔與不死"))return "魂";
 if(f.includes("神聖與傳奇"))return "輝";
 return "痕";
}
function effectCopy(src){return Object.fromEntries(Object.entries(src||{}).map(([k,v])=>[k,Number(v||0)]))}
function addEffects(target,source){
 for(const [k,v] of Object.entries(source||{}))target[k]=Number(target[k]||0)+Number(v||0);
 return target;
}
function signatureFor(sp){
 return sp?.species_signature||null;
}
function signatureIndex(sp,index){
 // 以資料庫固定排序為主，ID雜湊作次偏移；相鄰／同區物種不會一直落入同一簽章。
 return (index+(hashText(sp?.id)%5))%SIGNATURES.length;
}
function makeUniqueName(base,sp,used){
 let name=base;
 if(used.has(name))name=`${base}・${sp.name}`;
 used.add(name);return name;
}
const usedAuraNames=new Set(),usedSkillNames=new Set();
for(let i=0;i<companionRows.length;i++){
 const sp=companionRows[i],sig={...SIGNATURES[signatureIndex(sp,i)]};
 sig.index=signatureIndex(sp,i);sig.morphology=morphology(sp);sig.source_species_id=sp.id;
 sp.species_signature=sig;
 const aura=sp.unique_aura;
 if(aura){
   aura.species_identity_revision=REV;
   aura.species_signature=sig.key;
   aura.species_signature_name=sig.auraName;
   aura.effects=aura.effects||{};
   addEffects(aura.effects,sig.static);
   aura.tactical_rules=Array.isArray(aura.tactical_rules)?aura.tactical_rules:[];
   aura.tactical_rules=aura.tactical_rules.filter(x=>x?.axis!=="物種簽章");
   aura.tactical_rules.push({axis:"物種簽章",key:sig.key,name:sig.auraName,rule:`${sig.trigger}：${sig.rule}`});
   aura.name=makeUniqueName(`${sig.auraName}・${sig.morphology}印`,sp,usedAuraNames);
   aura.identity_summary=[aura.identity_summary,sig.auraName].filter(Boolean).join("｜");
 }
 const skill=sp.unique_skill;
 if(skill){
   const action=CORE_ACTION[skill.mechanic_pattern]||CORE_ACTION[skill.effect?.pattern]||(skill.kind==="主動"?"戰技":skill.kind==="輔助"?"援式":"本能");
   skill.species_identity_revision=REV;
   skill.species_signature=sig.key;
   skill.name=makeUniqueName(`${sig.skillLead}${sig.morphology}${action}`,sp,usedSkillNames);
   skill.description=`物種特色：${sig.trigger}時「${sig.skillLead}」發揮，${sig.rule}｜家族核心：${String(skill.description||"").replace(/^特色：/,"")}`;
   skill.effect=skill.effect||{};
   skill.effect.species_signature=sig.key;
 }
}

function state(){
 const b=typeof G!=="undefined"?G?.battle:null,c=typeof G!=="undefined"?G?.character:null,comp=b?.companion;
 return {
   battle:b,round:Math.max(1,Number(b?.round||1)),enemy:b?.enemy||null,
   enemyRatio:b?.enemy?clip(b.enemy.hp/Math.max(1,b.enemy.maxHp),0,1):1,
   playerRatio:c?clip(c.hp/Math.max(1,c.maxHp),0,1):1,
   companionRatio:comp?clip(comp.hp/Math.max(1,comp.maxHp),0,1):1,
   manaRatio:c?.maxMana?clip(c.mana/Math.max(1,c.maxMana),0,1):1,
   enemyStatuses:b?.enemyStatuses||[],
   playerStatuses:c?.statusEffects||[]
 };
}
function isTriggered(sig,s=state()){
 if(!sig)return false;
 switch(sig.key){
   case "blood_scent":return s.enemyRatio<=.55;
   case "ambush_shadow":return s.round<=2;
   case "nest_guard":return s.playerRatio<=.65;
   case "breaker":return s.enemyRatio>=.70;
   case "relentless":return s.round>=4;
   case "mana_vein":return s.manaRatio<=.5;
   case "clear_heart":return s.playerStatuses.some(x=>["fear","confusion","charm","silence","slow","sleep","paralysis"].includes(x?.id||x));
   case "thunder_step":return s.round%2===1;
   case "stone_watch":return s.round%2===0;
   case "status_resonance":return s.enemyStatuses.length>0;
   case "adversity":return s.playerRatio<=.40;
   case "perfect_form":return s.playerRatio>=.85;
   case "life_bite":return s.enemyRatio<=.60;
   case "far_sight":return s.round<=3&&s.enemyStatuses.length===0;
   case "hamper":return !s.enemyStatuses.some(x=>x.id==="slow");
   case "renewal":return s.companionRatio<=.55;
   case "bond_guard":return s.companionRatio<=.50;
   case "treasure_sense":return s.round===1;
   case "ghost_walk":return s.round<=2;
   case "royal_breath":return true;
   default:return false;
 }
}
function dynamicEffects(sig,s=state()){
 if(!sig||!isTriggered(sig,s))return {};
 if(sig.key==="royal_breath")return effectCopy(s.round%2?sig.dynamicOdd:sig.dynamicEven);
 return effectCopy(sig.dynamic);
}
function activeSpecies(){
 try{
   const inst=typeof activeCompanionInstance==="function"?activeCompanionInstance():null;
   if(!inst)return null;
   if(typeof G!=="undefined"&&G?.battle?.active){
     const c=G.battle.companion;if(!c||c.knockedOut||Number(c.hp||0)<=0)return null;
   }
   return bySpecies(inst.speciesId);
 }catch(_){return null}
}
function applyCombat(out,effects){
 const next={...out};
 for(const [k,v] of Object.entries(effects||{}))if(k in next)next[k]=Number(next[k]||0)+Number(v||0);
 for(const k of ["attack","magicPower","defense","magicDefense","accuracy","evasion","critRate","critDamage","initiative","blockRate","poise","statusAccuracy","statusResist","healingPower","critResist","perception"])if(k in next)next[k]=Math.round(next[k]);
 if("accuracy" in next)next.accuracy=clip(next.accuracy,5,99);
 if("evasion" in next)next.evasion=clip(next.evasion,0,80);
 if("critRate" in next)next.critRate=clip(next.critRate,0,75);
 if("blockRate" in next)next.blockRate=clip(next.blockRate,0,75);
 if("statusAccuracy" in next)next.statusAccuracy=clip(next.statusAccuracy,0,95);
 if("statusResist" in next)next.statusResist=clip(next.statusResist,0,90);
 if("armorPenPct" in next)next.armorPenPct=round1(clip(next.armorPenPct,0,60));
 if("magicPenPct" in next)next.magicPenPct=round1(clip(next.magicPenPct,0,60));
 if("lifeSteal" in next)next.lifeSteal=round1(clip(next.lifeSteal,0,50));
 if("manaRegen" in next)next.manaRegen=Math.round(Number(next.manaRegen||0)*100)/100;
 return next;
}
if(typeof combatStats==="function"&&!combatStats.__companionSpeciesIdentityPatched){
 const baseCombatStats=combatStats;
 const wrapped=function(){
   let out=baseCombatStats.apply(this,arguments),sp=activeSpecies();
   if(typeof G!=="undefined"&&G?.battle?.active&&sp?.species_signature)out=applyCombat(out,dynamicEffects(sp.species_signature));
   return out;
 };
 wrapped.__companionSpeciesIdentityPatched=true;combatStats=wrapped;
}

function currentRound(){return Math.max(1,Number(typeof G!=="undefined"?G?.battle?.round||1:1))}
function cleanseOwnerOne(){
 const arr=G?.character?.statusEffects||[],allowed=new Set(["fear","confusion","charm","silence","slow","sleep","paralysis"]),idx=arr.findIndex(x=>allowed.has(x?.id||x));
 if(idx<0)return null;const row=arr.splice(idx,1)[0];return DB.status_system?.definitions?.[row?.id||row]?.name||row?.id||row;
}
function addSlow(c,chance){
 const b=G?.battle,e=b?.enemy;if(!b?.active||!e||!DB.status_system?.definitions?.slow)return false;
 const actual=clip(Number(chance||35)+(Number(c.accuracy||60)-Number(e.statusResist||0))*.2,8,85);
 if(Math.random()*100>=actual)return false;
 b.enemyStatuses=b.enemyStatuses||[];const old=b.enemyStatuses.find(x=>x.id==="slow");
 if(old)old.rounds=Math.max(Number(old.rounds||0),2);else b.enemyStatuses.push({id:"slow",rounds:2});
 return true;
}
function applySignatureBefore(c,skill,sig){
 const s=state(),restore=[];if(!sig||!isTriggered(sig,s))return ()=>{};
 const ef=skill.effect||{};
 const save=(obj,key,value)=>{const old=obj[key];obj[key]=value;restore.push(()=>{obj[key]=old})};
 if(skill.kind==="主動"){
   if(sig.activeMult)save(ef,"multiplier",Number(ef.multiplier||1.18)*sig.activeMult);
   if(sig.activeAccuracy)save(ef,"accuracy_bonus",Number(ef.accuracy_bonus||0)+sig.activeAccuracy);
   if(sig.drainBoost)save(ef,"drain_pct",Number(ef.drain_pct||0)+sig.drainBoost);
   if(sig.guard)c.guarding=true;
   if(sig.key==="mana_vein"){const old=c.magic;c.magic=Math.round(c.magic*1.12);restore.push(()=>{c.magic=old})}
 }
 if(skill.kind==="被動"){
   const fx=dynamicEffects(sig,s);
   if(fx.attack){const old=c.attack;c.attack=Math.round(c.attack+fx.attack);restore.push(()=>{c.attack=old})}
   if(fx.magicPower){const old=c.magic;c.magic=Math.round(c.magic+fx.magicPower);restore.push(()=>{c.magic=old})}
   if(fx.defense){const old=c.defense;c.defense=Math.round(c.defense+fx.defense);restore.push(()=>{c.defense=old})}
   if(fx.accuracy){const old=c.accuracy;c.accuracy=Math.round(c.accuracy+fx.accuracy);restore.push(()=>{c.accuracy=old})}
   if(fx.evasion){const old=c.evasion;c.evasion=Math.round(c.evasion+fx.evasion);restore.push(()=>{c.evasion=old})}
   if(sig.guard)c.guarding=true;
 }
 return ()=>{for(const fn of restore.reverse())try{fn()}catch(_){}};
}
function applySignatureAfter(c,skill,sig,before){
 const b=G?.battle,e=b?.enemy,s=state();if(!b?.active||!sig||!isTriggered(sig,s))return;
 const dealt=Math.max(0,Number(before.enemyHp||0)-Number(e?.hp||0)),extra=[];
 if(skill.kind==="主動"&&dealt>0){
   if(sig.breakDefense){
     b.enemyBuff=b.enemyBuff||{};b.enemyBuff.defense=Number(b.enemyBuff.defense||0)-2;extra.push("削弱防禦");
   }
   if(sig.slowChance&&addSlow(c,sig.slowChance))extra.push("緩速");
   if(sig.selfHeal){
     const heal=Math.max(1,Math.round(c.maxHp*.05));c.hp=clip(c.hp+heal,0,c.maxHp);extra.push(`自身恢復${heal}HP`);
   }
   if(sig.key==="adversity"){
     const heal=Math.max(1,Math.round(dealt*.06));G.character.hp=clip(G.character.hp+heal,0,G.character.maxHp);extra.push(`主人恢復${heal}HP`);
   }
 }
 if(skill.kind==="輔助"){
   if(sig.manaHelp&&G.character.maxMana){
     const mp=Math.max(1,Math.round(G.character.maxMana*.04));G.character.mana=clip(G.character.mana+mp,0,G.character.maxMana);extra.push(`主人恢復${mp}MP`);
   }
   if(sig.cleanse){const clean=cleanseOwnerOne();if(clean)extra.push(`額外淨化${clean}`)}
   if(sig.guard)c.guarding=true;
   if(sig.key==="renewal"){
     const heal=Math.max(1,Math.round(c.maxHp*.06));c.hp=clip(c.hp+heal,0,c.maxHp);extra.push(`夥伴恢復${heal}HP`);
   }
 }
 if(extra.length&&typeof companionBattleLog==="function")companionBattleLog(`${c.name}的物種簽章【${sig.auraName}】發揮：${extra.join("、")}。`);
}
if(typeof resolveCompanionTurn==="function"&&!resolveCompanionTurn.__companionSpeciesIdentityPatched){
 const baseResolveCompanionTurn=resolveCompanionTurn;
 const wrapped=function(){
   const c=typeof G!=="undefined"?G?.battle?.companion:null,sp=c?bySpecies(c.speciesId):null,skill=sp?.unique_skill,sig=sp?.species_signature;
   if(!c||!skill||!sig)return baseResolveCompanionTurn.apply(this,arguments);
   const before={enemyHp:Number(G?.battle?.enemy?.hp||0),playerHp:Number(G?.character?.hp||0),mana:Number(G?.character?.mana||0),companionHp:Number(c.hp||0)};
   const cleanup=applySignatureBefore(c,skill,sig);
   try{
     const result=baseResolveCompanionTurn.apply(this,arguments);
     applySignatureAfter(c,skill,sig,before);
     return result;
   }finally{cleanup()}
 };
 wrapped.__companionSpeciesIdentityPatched=true;resolveCompanionTurn=wrapped;
}

function signatureText(sp){
 const sig=sp?.species_signature;if(!sig)return "";
 const fx=Object.entries(sig.static||{}).map(([k,v])=>`${k}${Number(v)>=0?"+":""}${v}`).join("、");
 return `${sig.auraName}｜觸發：${sig.trigger}｜${sig.rule}${fx?`｜固定簽章：${fx}`:""}`;
}
if(globalThis.QUNLU_COMPANION_AURA?.text&&!globalThis.QUNLU_COMPANION_AURA.__speciesIdentityTextPatched){
 const oldText=globalThis.QUNLU_COMPANION_AURA.text;
 globalThis.QUNLU_COMPANION_AURA.text=function(aura){
   const base=oldText(aura),sp=bySpecies(aura?.source_species_id),extra=signatureText(sp);
   return extra?`${base}<br><span class="ok">物種簽章：${extra}</span>`:base;
 };
 globalThis.QUNLU_COMPANION_AURA.__speciesIdentityTextPatched=true;
}

function audit(){
 const issues=[],skillNames=new Set(),auraNames=new Set(),signatureCounts={};
 for(const sp of companionRows){
   const sig=sp.species_signature,a=sp.unique_aura,s=sp.unique_skill;
   if(!sig)issues.push(`${sp.id}:缺少物種簽章`);
   else signatureCounts[sig.key]=(signatureCounts[sig.key]||0)+1;
   if(!a?.species_identity_revision)issues.push(`${sp.id}:光環未套用物種簽章`);
   if(!s?.species_identity_revision)issues.push(`${sp.id}:技能未套用物種簽章`);
   if(a?.name){if(auraNames.has(a.name))issues.push(`${sp.id}:光環名稱仍重複/${a.name}`);auraNames.add(a.name)}
   if(s?.name){if(skillNames.has(s.name))issues.push(`${sp.id}:技能名稱仍重複/${s.name}`);skillNames.add(s.name)}
   if(!(a?.tactical_rules||[]).some(x=>x?.axis==="物種簽章"))issues.push(`${sp.id}:光環缺少物種簽章規則`);
 }
 if(Object.keys(signatureCounts).length<SIGNATURES.length)issues.push(`物種簽章覆蓋不足:${Object.keys(signatureCounts).length}/${SIGNATURES.length}`);
 const max=Math.max(0,...Object.values(signatureCounts));
 if(max>Math.ceil(companionRows.length/SIGNATURES.length)+3)issues.push(`物種簽章分布過度集中:${max}`);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,total:companionRows.length,signature_types:SIGNATURES.length,signature_counts:signatureCounts,unique_aura_names:auraNames.size,unique_skill_names:skillNames.size};
}
const initial=audit();
DB.companion_species_identity_system={
 version:REV,release:RELEASE,save_compatible:true,
 rule:"家族決定生態核心，物種簽章決定個體物種的戰術特徵；同家族夥伴不得只換名稱與倍率。",
 signature_types:SIGNATURES.length,
 signatures:SIGNATURES.map(x=>({key:x.key,auraName:x.auraName,trigger:x.trigger,rule:x.rule})),
 naming_rule:"技能名稱由物種簽章＋形態詞＋家族核心動作組成；僅在真的碰撞時才以物種名作消歧，不再以『物種名＋同一後綴』作主要命名法。",
 initial_audit:initial
};
DB.meta=DB.meta||{};DB.meta.companion_species_identity_revision=REV;
DB.companion_system=DB.companion_system||{};DB.companion_system.species_identity_revision=REV;
if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(REV))){
 DB.integration_registry.optimization_notes.push("CURRENT-1.84.0／COMPANION-SPECIES-IDENTITY-1.0：針對同家族三隻寵物光環與技能過度相似，再加入20種物種簽章；簽章改變光環固定效果、觸發條件、技能名稱與實戰附加行為，並加入名稱唯一與簽章分布稽核。")
}
if(typeof runGeneratorAudit==="function"){
 const baseRunGeneratorAudit=runGeneratorAudit;
 runGeneratorAudit=function(){const issues=baseRunGeneratorAudit.apply(this,arguments)||[],r=audit();for(const x of r.issues)issues.push("夥伴物種簽章:"+x);return issues}
}
globalThis.runCompanionSpeciesIdentityAudit=audit;
globalThis.QUNLU_COMPANION_SPECIES_IDENTITY={version:REV,audit,signatureFor,triggered:sp=>isTriggered(signatureFor(sp)),state};
CORE?.registerModule?.("src/companion-species-identity-v1.js",{domain:"survival",revision:REV,release:RELEASE});
})();