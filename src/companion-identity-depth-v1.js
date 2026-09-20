/* 群陸旅誌：夥伴光環與專屬技能深化 CURRENT-1.83.0
 * COMPANION-IDENTITY-DEPTH-1.0
 * 將寵物／召喚獸／契約獸從固定數值模板深化為物種家族核心、AI戰術觸發、夥伴類型特性與元素互動。
 * 不新增存檔欄位；戰鬥暫態資料只存在 G.battle。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.companion_species))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.83.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.83.0";
const REV="COMPANION-IDENTITY-DEPTH-1.0";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const clip=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const round1=n=>Math.round((Number(n)||0)*10)/10;
const bySpecies=id=>(DB.companion_species||[]).find(x=>x?.id===id)||null;
const FAMILY_ORDER=["野獸系","飛行系","魔法與植物系","龍系","元素系","惡魔與不死暗影系","神聖與傳奇系"];
const STATUS_BY_ELEMENT={光明:null,黑暗:"curse",火:"burn",風:"slow",水:"slow",地:"slow",雷:"paralysis",生命:null,死亡:"curse"};

const FAMILY_IDENTITY={
 "野獸系":{
   title:"群獵與追跡",auraKey:"prey_sense",auraName:"群獵感知",auraRule:"敵人進入負傷階段後，主人獲得追獵命中與終結壓力；越接近瀕死越強。",
   skills:{
     "主動":{pattern:"pack_hunt",name:"裂喉追獵",summary:"對負傷目標顯著增傷，並有機會造成流血；不是單純固定倍率技能。"},
     "被動":{pattern:"hunt_instinct",name:"獵痕本能",summary:"敵人生命過半以下時才進入追獵狀態，臨時提高攻擊與命中。"},
     "輔助":{pattern:"rally_howl",name:"守群號令",summary:"在開戰或隊伍受傷時鼓舞主人，兼具小幅恢復與短暫命中／攻勢強化。"}
   }
 },
 "飛行系":{
   title:"制空與先手",auraKey:"air_superiority",auraName:"制空視野",auraRule:"前兩回合提供明顯先手、命中與迴避優勢，久戰後優勢收斂。",
   skills:{
     "主動":{pattern:"dive_break",name:"破勢俯衝",summary:"開戰前段威力較高，命中後可施加緩速，適合搶節奏而非持續站樁輸出。"},
     "被動":{pattern:"sky_dance",name:"高空獵域",summary:"開戰時取得額外迴避與首輪命中，之後回歸常態，凸顯飛行單位的制空窗口。"},
     "輔助":{pattern:"wing_screen",name:"翼幕掩護",summary:"展翼掩護主人並進入護衛，同時提供短時間迴避與抗壓。"}
   }
 },
 "魔法與植物系":{
   title:"根脈與循環",auraKey:"root_cadence",auraName:"根脈循環",auraRule:"主人穩定時偏向魔力循環，受傷後則轉為防禦與治療增幅，會依戰況切換。",
   skills:{
     "主動":{pattern:"root_snare",name:"根脈束縛",summary:"魔法傷害伴隨緩速；目標已被束縛時，高階個體有機會進一步造成麻痺。"},
     "被動":{pattern:"root_cycle",name:"根脈輪替",summary:"每隔數回合自我再生並回補主人少量魔力，形成長戰續航節奏。"},
     "輔助":{pattern:"life_bloom",name:"生命綻放",summary:"治療受傷較重的一方，並優先清除恐懼、混亂、魅惑、沉默或緩速等干擾。"}
   }
 },
 "龍系":{
   title:"威壓與龍息",auraKey:"dragon_pressure",auraName:"龍威壓境",auraRule:"主人狀態良好時偏向壓迫輸出，危急時轉為防禦、格擋與韌性。",
   skills:{
     "主動":{pattern:"dragon_breath",name:"龍息爆發",summary:"高冷卻、高威力的元素吐息，並依元素附帶灼燒、緩速、麻痺或詛咒等效果。"},
     "被動":{pattern:"dragon_majesty",name:"龍鱗威儀",summary:"高生命時強化攻勢；低生命時主動轉入護衛，呈現龍族攻守兩態。"},
     "輔助":{pattern:"scale_guard",name:"翼鱗守護",summary:"以自身承擔壓力，短時間強化防禦並賦予主人對應元素護持。"}
   }
 },
 "元素系":{
   title:"元素調律",auraKey:"elemental_resonance",auraName:"元素共振",auraRule:"敵人出現異常狀態時提升術式穿透與異常命中；同元素抗性也會進一步提高。",
   skills:{
     "主動":{pattern:"resonance_burst",name:"共振爆裂",summary:"面對元素弱點會放大傷害，遇到抗性時則削減部分抗性效果，避免只是換色攻擊。"},
     "被動":{pattern:"element_core",name:"元素核心",summary:"自身攻擊會暫時削薄目標對本元素的抗性，讓元素體真正擅長對應元素。"},
     "輔助":{pattern:"element_ward",name:"調律護幕",summary:"依自身元素建立短暫抗性護幕，同時回復少量生命與魔力。"}
   }
 },
 "惡魔與不死暗影系":{
   title:"蝕命與不滅",auraKey:"blood_eclipse",auraName:"蝕命月影",auraRule:"敵人受創後提高吸血、爆傷與異常壓力，屬於越打越危險的收割型光環。",
   skills:{
     "主動":{pattern:"soul_drain",name:"蝕魂汲取",summary:"造成傷害並大量自癒，可施加詛咒；對已受詛咒目標還會回復主人。"},
     "被動":{pattern:"undying_shadow",name:"不滅冥影",summary:"每場戰鬥第一次被擊倒時可自行復起一次，之後才真正失去戰鬥能力。"},
     "輔助":{pattern:"grave_veil",name:"墓影帷幕",summary:"清理精神干擾並賦予主人短暫迴避、爆擊抗性與異常抗性。"}
   }
 },
 "神聖與傳奇系":{
   title:"誓約與救援",auraKey:"vow_guard",auraName:"誓約聖域",auraRule:"主人生命危急時明顯轉向守護、治療與抗性；安全時只保留溫和常駐效果。",
   skills:{
     "主動":{pattern:"judgment",name:"誓光裁決",summary:"對黑暗／死亡屬性敵人更強，造成傷害後同時治療主人。"},
     "被動":{pattern:"oathkeeper",name:"守誓者",summary:"每場戰鬥可在主人第一次遭受致命傷時救回一次，與一般復活道具分開判定。"},
     "輔助":{pattern:"sanctuary",name:"聖域回響",summary:"恢復並淨化主人，且在短時間內預備一次致命傷救援。"}
   }
 }
};

const AI_IDENTITY={
 guardian:{name:"護主反應",rule:"主人生命偏低時，光環追加防禦與格擋；技能傾向護衛。"},
 assault:{name:"終結壓力",rule:"敵人進入低生命時，光環追加攻勢與爆擊。"},
 skirmisher:{name:"游擊窗口",rule:"前兩回合追加命中與迴避，之後不再維持同等優勢。"},
 caster:{name:"術式破綻",rule:"敵人已有異常狀態時，提高魔法穿透與異常命中。"},
 support:{name:"救援節奏",rule:"主人受傷時提升治療與異常抗性。"},
 dark:{name:"傷勢共鳴",rule:"主人或敵人進入負傷階段時，吸血與爆傷提高。"},
 legend:{name:"王者節拍",rule:"奇數回合偏進攻、偶數回合偏守勢，形成輪替節奏。"},
 balanced:{name:"穩定共鳴",rule:"沒有爆發窗口，但維持小幅命中與異常抗性。"}
};
const KIND_IDENTITY={
 pet:{name:"野外默契",rule:"第一回合提供小幅命中／迴避，並保留寵物原本的探索感知優勢。"},
 summon:{name:"術式連結",rule:"主人偏魔法時追加術式穿透與異常命中，並強化少量魔力循環。"},
 contract:{name:"雙向契約",rule:"主人或契約獸任一方低生命時，觸發攻勢與抗性回響。"}
};

function familyKey(sp){
 const f=String(sp?.family||"");
 if(FAMILY_IDENTITY[f])return f;
 if(/龍|dragon|drake|wyrm/i.test(f))return "龍系";
 if(/元素|elemental|spirit/i.test(f))return "元素系";
 if(/植物|樹|藤|妖精|精靈|plant|treant|vine|fairy|fey/i.test(f))return "魔法與植物系";
 if(/不死|亡靈|惡魔|暗影|undead|wraith|demon|shadow/i.test(f))return "惡魔與不死暗影系";
 if(/神聖|傳奇|聖|legend|holy|celestial/i.test(f))return "神聖與傳奇系";
 if(/鳥|鷹|隼|鴞|飛行|avian|bird|eagle|hawk|falcon/i.test(f))return "飛行系";
 return "野獸系";
}
function tierRank(sp){return TIER_RANK[sp?.tier]??0}
function kindIdentity(sp){return KIND_IDENTITY[sp?.companion_kind]||KIND_IDENTITY.pet}
function aiIdentity(sp){return AI_IDENTITY[sp?.ai_profile]||AI_IDENTITY.balanced}
function familyIdentity(sp){return FAMILY_IDENTITY[familyKey(sp)]||FAMILY_IDENTITY["野獸系"]}

function enrichAura(sp){
 const aura=sp?.unique_aura;if(!aura)return null;
 const f=familyIdentity(sp),ai=aiIdentity(sp),kind=kindIdentity(sp);
 aura.identity_depth_revision=REV;
 aura.identity={family:familyKey(sp),family_title:f.title,family_mechanic:f.auraKey,ai:sp.ai_profile||"balanced",ai_trait:ai.name,kind:sp.companion_kind||"pet",kind_trait:kind.name};
 aura.tactical_rules=[
   {axis:"物種家族",key:f.auraKey,name:f.auraName,rule:f.auraRule},
   {axis:"AI定位",key:sp.ai_profile||"balanced",name:ai.name,rule:ai.rule},
   {axis:"夥伴類型",key:sp.companion_kind||"pet",name:kind.name,rule:kind.rule}
 ];
 aura.identity_summary=`${f.auraName}｜${ai.name}｜${kind.name}`;
 return aura;
}
function skillBlueprint(sp,kind){
 const f=familyIdentity(sp),bp=f.skills?.[kind]||f.skills?.["主動"];
 return {...bp,family_title:f.title};
}
function enrichSkill(sp){
 const skill=sp?.unique_skill;if(!skill)return null;
 const bp=skillBlueprint(sp,skill.kind),ai=aiIdentity(sp),kind=kindIdentity(sp),e=skill.effect||{};
 skill.identity_depth_revision=REV;
 skill.mechanic_pattern=bp.pattern;
 skill.identity={family:familyKey(sp),family_title:bp.family_title,core_mechanic:bp.pattern,ai_trait:ai.name,kind_trait:kind.name};
 skill.name=`${sp.name}・${sp.element&&["dragon_breath","resonance_burst","element_core","element_ward"].includes(bp.pattern)?sp.element:""}${bp.name}`;
 e.pattern=bp.pattern;e.tier_rank=tierRank(sp);e.family=familyKey(sp);e.ai_profile=sp.ai_profile||"balanced";e.companion_kind=sp.companion_kind||"pet";
 if(skill.kind==="主動"){
   if(bp.pattern==="dragon_breath")e.cooldown_rounds=4;
   if(bp.pattern==="pack_hunt")e.wounded_bonus=1.25;
   if(bp.pattern==="dive_break")e.opening_bonus=1.22;
   if(bp.pattern==="soul_drain")e.drain_pct=Math.max(Number(e.drain_pct||0),26+tierRank(sp));
   if(bp.pattern==="judgment")e.owner_heal_pct=Math.max(Number(e.owner_heal_pct||0),12+tierRank(sp));
 }
 if(skill.kind==="輔助"){
   e.cooldown_rounds=bp.pattern==="sanctuary"?4:3;
   e.trigger_hp_pct=bp.pattern==="rally_howl"?78:bp.pattern==="element_ward"?88:86;
 }
 skill.effect=e;
 skill.description=`特色：${bp.summary}｜AI修正：${ai.rule}｜${kind.name}：${kind.rule}`;
 return skill;
}

for(const sp of DB.companion_species){
 if(!["pet","summon","contract"].includes(sp?.companion_kind))continue;
 enrichAura(sp);enrichSkill(sp);
}

function activeAura(){try{return globalThis.QUNLU_COMPANION_AURA?.active?.()||null}catch(_){return null}}
function battleRatios(){
 const b=typeof G!=="undefined"?G?.battle:null,c=typeof G!=="undefined"?G?.character:null;
 return {
   battle:b,
   round:Math.max(1,Number(b?.round||1)),
   enemy:b?.enemy||null,
   enemyRatio:b?.enemy?clip(b.enemy.hp/Math.max(1,b.enemy.maxHp),0,1):1,
   playerRatio:c?clip(c.hp/Math.max(1,c.maxHp),0,1):1,
   companionRatio:b?.companion?clip(b.companion.hp/Math.max(1,b.companion.maxHp),0,1):1,
   enemyStatuses:b?.enemyStatuses||[]
 };
}
function addEffects(target,source,mult=1){
 for(const [k,v] of Object.entries(source||{}))target[k]=Number(target[k]||0)+Number(v||0)*mult;
 return target;
}
function dynamicAuraState(aura){
 const out={effects:{},labels:[]};if(!aura||typeof G==="undefined"||!G?.battle?.active)return out;
 const s=battleRatios(),key=aura.identity?.family_mechanic,ai=aura.identity?.ai||"balanced",kind=aura.identity?.kind||"pet";
 const factor=clip(aura.factor||1,.75,1.55);
 const push=(label,effects)=>{out.labels.push(label);addEffects(out.effects,effects,factor)};
 if(key==="prey_sense"&&s.enemyRatio<=.5)push("追獵",{accuracy:3,critRate:3,...(s.enemyRatio<=.25?{critDamage:8}:{})});
 if(key==="air_superiority"&&s.round<=2)push("制空",{initiative:6,evasion:3,accuracy:2});
 if(key==="root_cadence"){
   if(s.playerRatio<.65)push("護生根脈",{defense:3,magicDefense:3,healingPower:10});
   else push("魔力根脈",{magicPower:2,manaRegen:.12});
 }
 if(key==="dragon_pressure"){
   if(s.playerRatio>=.65)push("龍威壓迫",{attack:3,magicPower:3,poise:5});
   else push("龍鱗守勢",{defense:4,magicDefense:4,blockRate:3,poise:5});
 }
 if(key==="elemental_resonance"&&s.enemyStatuses.length)push("異常共振",{magicPenPct:5,statusAccuracy:5});
 if(key==="blood_eclipse"&&s.enemyRatio<.55)push("蝕命收割",{lifeSteal:3,critDamage:8,statusAccuracy:2});
 if(key==="vow_guard"&&s.playerRatio<.5)push("危急誓護",{defense:4,magicDefense:4,healingPower:12,statusResist:4});

 if(ai==="guardian"&&s.playerRatio<.6)push("護主反應",{defense:2,blockRate:2});
 else if(ai==="assault"&&s.enemyRatio<.4)push("終結壓力",{attack:2,critRate:2});
 else if(ai==="skirmisher"&&s.round<=2)push("游擊窗口",{accuracy:2,evasion:2});
 else if(ai==="caster"&&s.enemyStatuses.length)push("術式破綻",{magicPower:2,magicPenPct:2,statusAccuracy:2});
 else if(ai==="support"&&s.playerRatio<.75)push("救援節奏",{healingPower:6,statusResist:2});
 else if(ai==="dark"&&(s.playerRatio<.65||s.enemyRatio<.5))push("傷勢共鳴",{lifeSteal:1.5,critDamage:4});
 else if(ai==="legend")push(s.round%2?"王者攻勢":"王者守勢",s.round%2?{attack:1.5,magicPower:1.5,critRate:1.5}:{defense:2,magicDefense:2,statusResist:2});
 else if(ai==="balanced")push("穩定共鳴",{accuracy:1,statusResist:1});

 if(kind==="pet"&&s.round===1)push("野外默契",{accuracy:1,evasion:1});
 else if(kind==="summon"){
   push("術式連結",{magicPenPct:2,statusAccuracy:2,manaRegen:.06});
 }else if(kind==="contract"&&(s.playerRatio<.5||s.companionRatio<.5))push("雙向契約",{attack:1.5,magicPower:1.5,statusResist:3});
 return out;
}
function depthBuffState(){
 const b=typeof G!=="undefined"?G?.battle:null;if(!b?.active)return {effects:{},element_resistances:{},labels:[]};
 b.companionDepthBuffs=Array.isArray(b.companionDepthBuffs)?b.companionDepthBuffs:[];
 b.companionDepthBuffs=b.companionDepthBuffs.filter(x=>Number(x?.untilRound||0)>=Number(b.round||1));
 const out={effects:{},element_resistances:{},labels:[]};
 for(const row of b.companionDepthBuffs){addEffects(out.effects,row.effects);addEffects(out.element_resistances,row.element_resistances);if(row.label)out.labels.push(row.label)}
 return out;
}
function addDepthBuff(source,label,effects={},element_resistances={},rounds=2){
 const b=typeof G!=="undefined"?G?.battle:null;if(!b?.active)return;
 b.companionDepthBuffs=Array.isArray(b.companionDepthBuffs)?b.companionDepthBuffs:[];
 b.companionDepthBuffs=b.companionDepthBuffs.filter(x=>x.source!==source);
 b.companionDepthBuffs.push({source,label,effects:{...effects},element_resistances:{...element_resistances},untilRound:Number(b.round||1)+Math.max(1,rounds)-1});
}
function applyCombatEffects(out,effects){
 const next={...out};
 for(const [k,v] of Object.entries(effects||{}))if(k in next)next[k]=Number(next[k]||0)+Number(v||0);
 for(const k of ["attack","magicPower","defense","magicDefense","accuracy","evasion","critRate","critDamage","initiative","moveSpeed","blockRate","poise","statusAccuracy","statusResist","healingPower","critResist"])if(k in next)next[k]=Math.round(next[k]);
 if("accuracy" in next)next.accuracy=clip(next.accuracy,5,99);
 if("evasion" in next)next.evasion=clip(next.evasion,0,80);
 if("critRate" in next)next.critRate=clip(next.critRate,0,75);
 if("blockRate" in next)next.blockRate=clip(next.blockRate,0,75);
 if("statusAccuracy" in next)next.statusAccuracy=clip(next.statusAccuracy,0,95);
 if("statusResist" in next)next.statusResist=clip(next.statusResist,0,90);
 if("magicPenPct" in next)next.magicPenPct=round1(clip(next.magicPenPct,0,60));
 if("lifeSteal" in next)next.lifeSteal=round1(clip(next.lifeSteal,0,50));
 if("manaRegen" in next)next.manaRegen=Math.round(Number(next.manaRegen||0)*100)/100;
 return next;
}

if(typeof combatStats==="function"&&!combatStats.__companionIdentityDepthPatched){
 const baseCombatStats=combatStats;
 const wrapped=function(){
   let out=baseCombatStats.apply(this,arguments),a=activeAura(),dyn=dynamicAuraState(a),buff=depthBuffState();
   out=applyCombatEffects(out,dyn.effects);out=applyCombatEffects(out,buff.effects);return out;
 };
 wrapped.__companionIdentityDepthPatched=true;combatStats=wrapped;
}
if(typeof elementalResistances==="function"&&!elementalResistances.__companionIdentityDepthPatched){
 const baseElementalResistances=elementalResistances;
 const wrapped=function(){
   const out={...baseElementalResistances.apply(this,arguments)},a=activeAura(),buff=depthBuffState();
   if(a?.identity?.family_mechanic==="elemental_resonance"&&a.element)out[a.element]=clip(Number(out[a.element]||0)+5,-50,80);
   if(a?.identity?.family_mechanic==="dragon_pressure"&&a.element&&battleRatios().playerRatio<.65)out[a.element]=clip(Number(out[a.element]||0)+3,-50,80);
   for(const [k,v] of Object.entries(buff.element_resistances||{}))out[k]=clip(Number(out[k]||0)+Number(v||0),-50,80);
   return out;
 };
 wrapped.__companionIdentityDepthPatched=true;elementalResistances=wrapped;
}

function currentRound(){return Math.max(1,Number(typeof G!=="undefined"?G?.battle?.round||1:1))}
function skillReady(c,skill){
 const cd=Math.max(1,Number(skill?.effect?.cooldown_rounds||3)),last=Number(c?.uniqueSkillLastRound);
 return currentRound()-(Number.isFinite(last)?last:-999)>=cd;
}
function markSkill(c){c.uniqueSkillLastRound=currentRound()}
function skillLog(c,skill,msg){
 const text=`${c.name}施展【${skill.name}】${msg?"，"+msg:""}`;
 if(typeof companionBattleLog==="function")companionBattleLog(text);else if(typeof battleLog==="function")battleLog("【夥伴】"+text);
}
function applyCompanionStatus(c,status,baseChance=45,rounds=2){
 if(!status||typeof G==="undefined"||!G?.battle?.active||!DB.status_system?.definitions?.[status])return false;
 const e=G.battle.enemy,chance=clip(Math.round(baseChance+(Number(c.accuracy||60)-Number(e.statusResist||0))*.35),5,92);
 if(Math.random()*100>=chance)return false;
 G.battle.enemyStatuses=G.battle.enemyStatuses||[];const old=G.battle.enemyStatuses.find(x=>x.id===status);
 if(old)old.rounds=Math.max(Number(old.rounds||0),rounds);else G.battle.enemyStatuses.push({id:status,rounds});
 return true;
}
function elementDamage(raw,e,element,pattern){
 if(!element)return Math.max(1,Math.round(raw));
 let resist=Number(e?.element_resistances?.[element]||0);
 if(pattern==="resonance_burst"&&resist>0)resist*=.5;
 let dmg=Math.max(1,Math.round(raw*(1-clip(resist,-50,80)/100)));
 if(pattern==="resonance_burst"&&resist<0)dmg=Math.max(1,Math.round(dmg*1.18));
 return dmg;
}
function activeDamage(c,skill){
 const b=G?.battle,e=b?.enemy,ef=skill?.effect||{},pattern=skill?.mechanic_pattern||ef.pattern;if(!b?.active||!e||e.hp<=0||!skillReady(c,skill))return false;
 markSkill(c);
 const r=typeof rollD20==="function"?rollD20():1+Math.floor(Math.random()*20),rank=tierRank(bySpecies(c.speciesId)),s=battleRatios();
 let accuracy=Number(ef.accuracy_bonus||3);
 if(pattern==="dive_break"&&s.round<=2)accuracy+=5;
 if((ef.ai_profile||c.ai)==="skirmisher"&&s.round<=2)accuracy+=3;
 const score=r+Math.floor((Number(c.accuracy||60)+accuracy-Number(e.evasion||0))/10);
 if(score<10){skillLog(c,skill,"攻擊未命中。");return true}
 const magic=ef.scaling==="magic"||["root_snare","resonance_burst","soul_drain","judgment"].includes(pattern);
 const power=magic?Number(c.magic||1):Number(c.attack||1),defense=magic?Number(e.magicDefense||e.defense||0):Number(e.defense||0);
 let mult=Math.max(.75,Number(ef.multiplier||1.18));
 if(pattern==="pack_hunt"&&s.enemyRatio<=.5)mult*=Number(ef.wounded_bonus||1.25);
 if(pattern==="dive_break"&&s.round<=2)mult*=Number(ef.opening_bonus||1.22);
 if(pattern==="dragon_breath")mult=Math.max(mult,1.34+rank*.035);
 if(pattern==="judgment"&&["黑暗","死亡"].includes(e.primary_element))mult*=1.28;
 if((ef.ai_profile||c.ai)==="assault"&&s.enemyRatio<.4)mult*=1.12;
 let dmg=Math.max(1,Math.round(power*mult-defense*.30));
 dmg=elementDamage(dmg,e,ef.element||c.element||null,pattern);e.hp=Math.max(0,e.hp-dmg);
 const extra=[];
 if(pattern==="pack_hunt"&&applyCompanionStatus(c,"bleed",35+rank*3,2))extra.push("流血");
 if(pattern==="dive_break"&&applyCompanionStatus(c,"slow",48+rank*2,2))extra.push("緩速");
 if(pattern==="root_snare"){
   const already=(b.enemyStatuses||[]).some(x=>x.id==="slow");
   if(applyCompanionStatus(c,"slow",58+rank*2,2))extra.push("束縛緩速");
   if(already&&rank>=3&&applyCompanionStatus(c,"paralysis",18+rank*2,1))extra.push("麻痺");
 }
 if(pattern==="dragon_breath"){
   const status=STATUS_BY_ELEMENT[ef.element||c.element];if(status&&applyCompanionStatus(c,status,36+rank*3,status==="paralysis"?1:2))extra.push(DB.status_system.definitions[status]?.name||status);
 }
 if(pattern==="soul_drain"){
   const heal=Math.max(1,Math.round(dmg*Math.max(.20,Number(ef.drain_pct||26)/100)));c.hp=clip(c.hp+heal,0,c.maxHp);extra.push(`自身恢復${heal}HP`);
   const cursed=applyCompanionStatus(c,"curse",42+rank*3,2);if(cursed)extra.push("詛咒");
   if((b.enemyStatuses||[]).some(x=>x.id==="curse")&&G?.character){const ownerHeal=Math.max(1,Math.round(dmg*.08));G.character.hp=clip(G.character.hp+ownerHeal,0,G.character.maxHp);extra.push(`主人恢復${ownerHeal}HP`)}
 }
 if(pattern==="judgment"&&G?.character){const heal=Math.max(1,Math.round(dmg*Math.max(.10,Number(ef.owner_heal_pct||12)/100)));G.character.hp=clip(G.character.hp+heal,0,G.character.maxHp);extra.push(`主人恢復${heal}HP`)}
 if((ef.ai_profile||c.ai)==="guardian")c.guarding=true;
 skillLog(c,skill,`造成${dmg}傷害${ef.element||c.element?"／"+(ef.element||c.element):""}${extra.length?"；"+extra.join("、"):""}。`);return true;
}
function lowestOwnerOrCompanion(c){
 const p=G.character,pr=p.hp/Math.max(1,p.maxHp),cr=c.hp/Math.max(1,c.maxHp);return pr<=cr?{target:p,label:"主人",ratio:pr}:{target:c,label:c.name,ratio:cr};
}
function cleanseOwnerOne(){
 const arr=G?.character?.statusEffects||[],allowed=new Set(["fear","confusion","charm","silence","slow","sleep","paralysis"]),idx=arr.findIndex(x=>allowed.has(x?.id||x));
 if(idx<0)return null;const row=arr.splice(idx,1)[0];return DB.status_system?.definitions?.[row?.id||row]?.name||row?.id||row;
}
function healTarget(c,target,scale=.55,pct=.02){const amount=Math.max(2,Math.round(Number(c.magic||1)*scale+Number(target.maxHp||1)*pct));target.hp=clip(Number(target.hp||0)+amount,0,target.maxHp);return amount}
function supportShouldUse(c,skill){
 const p=G.character,pattern=skill.mechanic_pattern,s=battleRatios(),hasStatus=(p.statusEffects||[]).some(x=>["fear","confusion","charm","silence","slow","sleep","paralysis"].includes(x?.id||x));
 if(!skillReady(c,skill))return false;
 if(pattern==="rally_howl")return s.round===1||s.playerRatio<.78||s.companionRatio<.72;
 if(pattern==="wing_screen")return s.round===1||s.playerRatio<.76;
 if(pattern==="life_bloom")return s.playerRatio<.9||s.companionRatio<.78||hasStatus||p.mana<Math.max(1,p.maxMana)*.55;
 if(pattern==="scale_guard")return s.playerRatio<.82;
 if(pattern==="element_ward")return s.round===1||s.playerRatio<.86||!!s.enemy?.primary_element;
 if(pattern==="grave_veil")return s.playerRatio<.78||hasStatus;
 if(pattern==="sanctuary")return s.playerRatio<.72||hasStatus;
 return s.playerRatio<.8||s.companionRatio<.7;
}
function supportSkill(c,skill){
 if(!supportShouldUse(c,skill))return false;markSkill(c);
 const ef=skill.effect||{},pattern=skill.mechanic_pattern,rank=tierRank(bySpecies(c.speciesId)),choice=lowestOwnerOrCompanion(c),extra=[];let heal=0;
 if(pattern==="rally_howl"){
   heal=healTarget(c,choice.target,.34,.012);addDepthBuff("rally_howl","守群號令",{attack:1+rank*.35,accuracy:3+Math.floor(rank/2)}, {},2);extra.push("主人獲得2回合守群攻勢");
 }else if(pattern==="wing_screen"){
   heal=healTarget(c,choice.target,.26,.01);c.guarding=true;addDepthBuff("wing_screen","翼幕掩護",{evasion:5+Math.floor(rank/2),statusResist:2+rank*.4},{},2);extra.push("夥伴進入護衛");
 }else if(pattern==="life_bloom"){
   heal=healTarget(c,choice.target,.62,.025);const clean=cleanseOwnerOne();if(clean)extra.push(`淨化${clean}`);if(G.character.maxMana){const mp=Math.max(1,Math.round(G.character.maxMana*(.025+rank*.003)));G.character.mana=clip(G.character.mana+mp,0,G.character.maxMana);extra.push(`主人恢復${mp}MP`)}
 }else if(pattern==="scale_guard"){
   heal=healTarget(c,choice.target,.28,.012);c.guarding=true;if(!c.depthBaseDefense)c.depthBaseDefense=c.defense;c.defense=Math.max(c.defense,Math.round(c.depthBaseDefense*(1.22+rank*.015)));c.depthDefenseUntil=currentRound()+1;
   if(c.element)addDepthBuff("scale_guard","翼鱗守護",{}, {[c.element]:8+rank*2},2);extra.push("夥伴進入護衛");
 }else if(pattern==="element_ward"){
   heal=healTarget(c,choice.target,.32,.012);if(G.character.maxMana){const mp=Math.max(1,Math.round(G.character.maxMana*(.04+rank*.003)));G.character.mana=clip(G.character.mana+mp,0,G.character.maxMana);extra.push(`主人恢復${mp}MP`)}
   if(c.element)addDepthBuff("element_ward","元素護幕",{statusResist:2+rank*.5},{[c.element]:10+rank*2},3);
 }else if(pattern==="grave_veil"){
   heal=healTarget(c,choice.target,.30,.01);const clean=cleanseOwnerOne();if(clean)extra.push(`驅散${clean}`);addDepthBuff("grave_veil","墓影帷幕",{evasion:4+Math.floor(rank/2),critResist:4+rank,statusResist:4+rank},{},2);
 }else if(pattern==="sanctuary"){
   choice.label="主人";heal=healTarget(c,G.character,.72,.035);const clean=cleanseOwnerOne();if(clean)extra.push(`淨化${clean}`);G.battle.companionDepthRescue={source:"sanctuary",untilRound:currentRound()+2,hpPct:18+rank*2};extra.push("短暫預備致命傷救援");
 }else heal=healTarget(c,choice.target,.55,.02);
 skillLog(c,skill,`${choice.label}恢復${heal}HP${extra.length?"；"+extra.join("、"):""}。`);return true;
}
function callLegacyWithoutUnique(base,ctx,args,skill){
 const kind=skill.kind;skill.kind="深化戰術";try{return base.apply(ctx,args)}finally{skill.kind=kind}
}
function passivePreTurn(c,skill){
 const pattern=skill.mechanic_pattern,b=G?.battle,e=b?.enemy,s=battleRatios(),restore=[];
 if(pattern==="hunt_instinct"&&s.enemyRatio<=.5){const a=c.attack,acc=c.accuracy;c.attack=Math.round(c.attack*1.16);c.accuracy+=6;restore.push(()=>{c.attack=a;c.accuracy=acc})}
 if(pattern==="sky_dance"){
   if(!c.depthSkyDance){c.evasion=clip(c.evasion+6,0,70);c.depthSkyDance=true}
   if(s.round<=2){const acc=c.accuracy;c.accuracy+=7;restore.push(()=>{c.accuracy=acc})}
 }
 if(pattern==="root_cycle"&&b&&c.depthRootCycleRound!==s.round&&s.round%3===1){
   c.depthRootCycleRound=s.round;const hp=Math.max(1,Math.round(c.maxHp*.035));c.hp=clip(c.hp+hp,0,c.maxHp);
   if(G.character.maxMana){const mp=Math.max(1,Math.round(G.character.maxMana*.025));G.character.mana=clip(G.character.mana+mp,0,G.character.maxMana);skillLog(c,skill,`根脈循環恢復自身${hp}HP與主人${mp}MP。`)}
 }
 if(pattern==="dragon_majesty"){
   if(s.companionRatio>.5){const a=c.attack,m=c.magic;c.attack=Math.round(c.attack*1.12);c.magic=Math.round(c.magic*1.12);restore.push(()=>{c.attack=a;c.magic=m})}
   else c.guarding=true;
 }
 if(pattern==="element_core"&&e&&c.element){
   e.element_resistances=e.element_resistances||{};const had=Object.prototype.hasOwnProperty.call(e.element_resistances,c.element),old=Number(e.element_resistances[c.element]||0);e.element_resistances[c.element]=old>0?old*.5:old-5;
   restore.push(()=>{if(had)e.element_resistances[c.element]=old;else delete e.element_resistances[c.element]});
 }
 return ()=>{for(const fn of restore.reverse())try{fn()}catch(_){}};
}

if(typeof resolveCompanionTurn==="function"&&!resolveCompanionTurn.__companionIdentityDepthPatched){
 const baseResolveCompanionTurn=resolveCompanionTurn;
 const wrapped=function(){
   const c=typeof G!=="undefined"?G?.battle?.companion:null,sp=c?bySpecies(c.speciesId):null,skill=sp?.unique_skill;
   if(!c||!skill||skill.identity_depth_revision!==REV)return baseResolveCompanionTurn.apply(this,arguments);
   if(c.depthBaseDefense&&c.depthDefenseUntil<currentRound()){c.defense=c.depthBaseDefense;c.depthBaseDefense=null;c.depthDefenseUntil=0}
   if(skill.kind==="主動"){
     if(skillReady(c,skill))return activeDamage(c,skill);
     return callLegacyWithoutUnique(baseResolveCompanionTurn,this,arguments,skill);
   }
   if(skill.kind==="輔助"){
     if(supportSkill(c,skill))return;
     return callLegacyWithoutUnique(baseResolveCompanionTurn,this,arguments,skill);
   }
   const cleanup=passivePreTurn(c,skill);try{return baseResolveCompanionTurn.apply(this,arguments)}finally{cleanup()}
 };
 wrapped.__companionIdentityDepthPatched=true;resolveCompanionTurn=wrapped;
}

if(typeof enemyBattleTurn==="function"&&!enemyBattleTurn.__companionIdentityDepthPatched){
 const baseEnemyBattleTurn=enemyBattleTurn;
 const wrapped=function(){
   const result=baseEnemyBattleTurn.apply(this,arguments),b=typeof G!=="undefined"?G?.battle:null,c=b?.companion;
   if(!b?.active||!c?.knockedOut)return result;
   const skill=bySpecies(c.speciesId)?.unique_skill;
   if(skill?.mechanic_pattern==="undying_shadow"&&!b.depthUndyingShadowUsed){
     b.depthUndyingShadowUsed=true;c.knockedOut=false;c.hp=Math.max(1,Math.round(c.maxHp*(.18+tierRank(bySpecies(c.speciesId))*.015)));
     if(typeof companionBattleLog==="function")companionBattleLog(`${c.name}的【${skill.name}】發動，從冥影中復起並恢復${c.hp}HP。`);
     if(typeof persist==="function")persist();if(typeof renderAll==="function")renderAll();
   }
   return result;
 };
 wrapped.__companionIdentityDepthPatched=true;enemyBattleTurn=wrapped;
}
if(typeof tryAutoRevive==="function"&&!tryAutoRevive.__companionIdentityDepthPatched){
 const baseTryAutoRevive=tryAutoRevive;
 const wrapped=function(){
   const b=typeof G!=="undefined"?G?.battle:null,c=b?.companion,skill=c?bySpecies(c.speciesId)?.unique_skill:null;
   if(b?.active&&G?.character?.hp<=0){
     if(b.companionDepthRescue&&Number(b.companionDepthRescue.untilRound||0)>=currentRound()){
       const pct=Number(b.companionDepthRescue.hpPct||20);b.companionDepthRescue=null;G.character.hp=Math.max(1,Math.round(G.character.maxHp*pct/100));
       if(typeof battleLog==="function")battleLog(`【夥伴】預備的聖域救援發動，主人以${pct}% HP撐過致命傷。`);return true;
     }
     if(skill?.mechanic_pattern==="oathkeeper"&&!b.depthOathkeeperUsed&&!c.knockedOut&&c.hp>0){
       b.depthOathkeeperUsed=true;const pct=16+tierRank(bySpecies(c.speciesId))*2;G.character.hp=Math.max(1,Math.round(G.character.maxHp*pct/100));
       if(typeof battleLog==="function")battleLog(`【夥伴】${c.name}的【${skill.name}】履行守誓，主人以${pct}% HP避免倒下。`);return true;
     }
   }
   return baseTryAutoRevive.apply(this,arguments);
 };
 wrapped.__companionIdentityDepthPatched=true;tryAutoRevive=wrapped;
}

function tacticText(aura){
 if(!aura?.tactical_rules?.length)return "";
 return aura.tactical_rules.map(x=>`${x.name}：${x.rule}`).join("｜");
}
if(globalThis.QUNLU_COMPANION_AURA?.text&&!globalThis.QUNLU_COMPANION_AURA.__identityDepthTextPatched){
 const oldText=globalThis.QUNLU_COMPANION_AURA.text;
 globalThis.QUNLU_COMPANION_AURA.text=function(aura){const base=oldText(aura),extra=tacticText(aura);return extra?`${base}<br><span class="muted">戰術：${extra}</span>`:base};
 globalThis.QUNLU_COMPANION_AURA.__identityDepthTextPatched=true;
}
function decorateBattleIdentity(){
 if(typeof document==="undefined"||typeof G==="undefined")return;const box=document.querySelector("#battleBody .battleunit.companion");if(!box)return;
 const c=G?.battle?.companion,sp=c?bySpecies(c.speciesId):null,aura=activeAura(),skill=sp?.unique_skill;if(!sp||!skill||!aura)return;
 let line=box.querySelector(".companion-identity-depth-line");if(!line){line=document.createElement("div");line.className="small companion-identity-depth-line";const hp=box.querySelector(".hpbar");hp?box.insertBefore(line,hp):box.appendChild(line)}
 const dyn=dynamicAuraState(aura),triggers=[...dyn.labels,...depthBuffState().labels];
 line.innerHTML=`<b>戰術核心：${familyIdentity(sp).title}</b>${triggers.length?`<span class="ok companion-trigger-state">｜觸發：${[...new Set(triggers)].join("、")}</span>`:""}`;
}
if(typeof renderBattle==="function"&&!renderBattle.__companionIdentityDepthPatched){
 const baseRenderBattle=renderBattle;
 const wrapped=function(){const r=baseRenderBattle.apply(this,arguments);decorateBattleIdentity();return r};wrapped.__companionIdentityDepthPatched=true;renderBattle=wrapped;
}

function audit(){
 const issues=[],patterns=new Map(),families=new Map(),rows=DB.companion_species.filter(sp=>["pet","summon","contract"].includes(sp?.companion_kind));
 for(const sp of rows){
   const f=familyKey(sp),a=sp.unique_aura,s=sp.unique_skill;
   families.set(f,(families.get(f)||0)+1);
   if(!a||a.identity_depth_revision!==REV)issues.push(`${sp.id}:光環未深化`);
   else if((a.tactical_rules||[]).length<3)issues.push(`${sp.id}:光環戰術軸不足`);
   if(!s||s.identity_depth_revision!==REV||!s.mechanic_pattern)issues.push(`${sp.id}:技能未深化`);
   else patterns.set(s.mechanic_pattern,(patterns.get(s.mechanic_pattern)||0)+1);
   if(s&&String(s.description||"").length<30)issues.push(`${sp.id}:技能特色描述不足`);
 }
 if(patterns.size<14)issues.push(`技能核心機制過少:${patterns.size}`);
 for(const k of FAMILY_ORDER)if(!families.has(k))issues.push(`夥伴家族未覆蓋:${k}`);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,total:rows.length,pattern_count:patterns.size,patterns:Object.fromEntries(patterns),families:Object.fromEntries(families)};
}
const initial=audit();
DB.companion_identity_depth_system={
 version:REV,release:RELEASE,save_compatible:true,
 design_rules:[
   "光環由常駐基底、物種家族條件、AI戰術觸發與夥伴類型回響共同組成；特色不再只由固定攻防百分比區分。",
   "七大物種家族各自擁有主動、被動、輔助三種不同核心機制，共21種技能核心；同家族再受元素、AI與寵物／召喚／契約類型修正。",
   "召喚獸偏術式連結與元素調律；一般寵物偏追跡、制空、野外默契；契約獸在主人或自身陷入危急時觸發雙向契約回響。",
   "高階效果提升觸發可靠度、持續時間或附加效果，不以單純把傷害倍率放大作為唯一成長。",
   "戰鬥暫態buff、救援、復起與護幕不寫入永久存檔結構，舊存檔可直接沿用。"
 ],
 family_identities:Object.fromEntries(Object.entries(FAMILY_IDENTITY).map(([k,v])=>[k,{title:v.title,aura:v.auraName,active:v.skills["主動"].pattern,passive:v.skills["被動"].pattern,support:v.skills["輔助"].pattern}])),
 initial_audit:initial
};
DB.meta=DB.meta||{};DB.meta.companion_identity_depth_revision=REV;
DB.companion_system=DB.companion_system||{};DB.companion_system.identity_depth_revision=REV;
if(DB.integration_registry?.optimization_notes&&!DB.integration_registry.optimization_notes.some(x=>String(x).includes(REV))){
 DB.integration_registry.optimization_notes.push("CURRENT-1.83.0／COMPANION-IDENTITY-DEPTH-1.0：200種寵物、召喚獸與契約獸的光環改為條件式戰術光環，技能建立7家族×主動／被動／輔助共21種核心機制，加入負傷追獵、制空窗口、根脈循環、龍息、元素抗性調律、不滅復起與守誓救援等實際runtime差異。")
}
if(typeof runGeneratorAudit==="function"){
 const baseRunGeneratorAudit=runGeneratorAudit;
 runGeneratorAudit=function(){const issues=baseRunGeneratorAudit.apply(this,arguments)||[],r=audit();for(const x of r.issues)issues.push("夥伴特色深化:"+x);return issues}
}
globalThis.runCompanionIdentityDepthAudit=audit;
globalThis.QUNLU_COMPANION_IDENTITY_DEPTH={version:REV,audit,familyKey,dynamicAuraState,skillForSpecies:id=>bySpecies(id)?.unique_skill||null};
CORE?.registerModule?.("src/companion-identity-depth-v1.js",{domain:"survival",revision:REV,release:RELEASE});
})();
