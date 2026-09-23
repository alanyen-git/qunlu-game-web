/* 群陸旅誌：F級共通精簡、全職業E～B技能譜系與F→E精修
 * CLASS-TIER-SKILL-EXPANSION-1.0；純增量技能ID，不移除已學技能。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.combat_classes))return;
const REV="CLASS-TIER-SKILL-EXPANSION-1.0",R={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const LEVEL={E:8,D:16,C:28,B:42},POWER={E:114,D:128,C:143,B:158},COST={E:5,D:7,C:9,B:12};
const ATTACK=new Set(["physical","magic","hybrid"]),clone=x=>JSON.parse(JSON.stringify(x));
const ranks=["E","D","C","B"];
/* 每個職能的四階攻擊、戰術技能；名稱由機制而來，並非純倍率換皮。 */
const FAMILIES={
 blade:{a:["疾影突刺","劍氣橫斬","連刃破甲","決勝斷空斬"],u:["凝神架式","迴避步法","反擊劍勢","劍心決意"],areas:["single","row","single","cross"]},
 heavy:{a:["破甲重擊","震地橫掃","三連重斧","崩山處決"],u:["重甲守勢","震懾怒吼","反擊重架","不屈戰吼"],areas:["single","row","single","cross"]},
 guard:{a:["盾擊破勢","盾陣橫掃","鋼壁迎擊","壁壘裁斷"],u:["盾牌守勢","盾牆","鐵壁號令","聖盾壁壘"],areas:["single","row","single","single"],allyRow:"D"},
 spear:{a:["貫甲突刺","槍陣橫掃","連環貫穿","破陣龍牙槍"],u:["迎擊架式","槍勢封路","貫穿蓄勢","戰陣號令"],areas:["single","row","column","column"]},
 archer:{a:["精準狙擊","貫穿箭雨","三重連射","破甲風暴箭"],u:["瞄準呼吸","煙幕退避","弱點分析","鷹眼戰令"],areas:["single","column","random","all"]},
 ranger:{a:["獵物伏擊","迴旋箭雨","追獵連射","終獵穿心箭"],u:["獵物標記","拘束陷阱","追蹤弱點","獵場指令"],areas:["single","row","random","single"]},
 assassin:{a:["暗影背刺","飛刀連擊","毒刃破甲","影襲處決"],u:["潛行煙幕","毒刃附體","幻影迴避","致命預兆"],areas:["single","random","single","single"]},
 monk:{a:["疾風連拳","震地掌擊","破甲三連拳","崩岳斷脈掌"],u:["調息凝神","護體架式","反擊拳勢","金剛護體"],areas:["single","row","single","cross"]},
 healer:{a:["聖光擊","淨邪光波","生命裁決","晨曦神聖裁斷"],u:["治癒術","治療波","全體治療","生命聖歌"],areas:["single","row","single","column"],heal:["E","D","C","B"]},
 holy:{a:["聖光斬","破邪橫掃","審判連刃","聖輝裁決"],u:["神聖守勢","淨化祝福","護佑號令","誓約聖盾"],areas:["single","row","single","cross"]},
 nature:{a:["荊棘突刺","藤蔓圍困","自然連環術","森羅地脈震"],u:["自然滋養","藤蔓陷阱","生命護幕","大地祝禱"],areas:["single","cross","random","all"]},
 summon:{a:["靈獸爪擊","召喚追襲","精靈軍勢","契靈風暴"],u:["契約凝神","召喚護幕","精靈指令","群靈戰歌"],areas:["single","row","random","all"]},
 elemental:{a:["元素彈","元素爆裂","元素連鎖","元素洪流"],u:["元素凝聚","元素護幕","元素增幅","元素共鳴"],areas:["single","cross","random","all"]},
 frost:{a:["冰晶射擊","寒冰十字","碎冰連射","暴風雪"],u:["寒霜凝神","冰晶護盾","霜凍枷鎖","絕寒護幕"],areas:["single","cross","random","all"]},
 storm:{a:["雷光衝擊","風雷橫掃","連鎖閃電","雷霆風暴"],u:["雷息凝神","疾風護幕","雷電增幅","風雷戰歌"],areas:["single","row","random","all"]},
 fire:{a:["炎矢爆擊","爆裂火球","熾焰連擊","烈焰風暴"],u:["火焰凝神","熔岩護盾","烈焰增幅","焰環戰歌"],areas:["single","cross","random","all"]},
 shadow:{a:["暗影飛彈","詛咒暗潮","死亡汲取","冥界風暴"],u:["暗影潛行","衰弱詛咒","黑暗護幕","死靈戰歌"],areas:["single","row","single","all"]},
 arcane:{a:["秘術飛彈","奧術衝擊","秘紋連鎖","星芒洪流"],u:["冥想凝神","奧術護盾","法術增幅","群星預兆"],areas:["single","cross","random","all"]},
 spellblade:{a:["魔刃刺擊","符文橫斬","附刃連擊","魔武裁決"],u:["元素附刃","符文護盾","魔刃增幅","魔武戰歌"],areas:["single","row","random","cross"]},
 tactics:{a:["弱點精擊","指令齊射","戰術連擊","軍勢破陣"],u:["戰場推演","警戒陷阱","隊伍號令","決戰指令"],areas:["single","column","random","all"]}
};
function family(c){
 const s=String(c.name||"")+" "+String(c.combat_identity?.family||"")+" "+String(c.combat_role||"");
 if(/戰術|學者|指揮|吟遊|舞者/.test(s))return"tactics";
 if(/魔劍|符文劍|魔武|戰鬥法師|奧術騎士/.test(s))return"spellblade";
 if(/白魔導|治療|療術|牧師|聖職|聖者/.test(s))return"healer";
 if(/聖武|聖劍|聖盾|審判|驅魔|戰鬥司祭/.test(s))return"holy";
 if(/魔弓|靈弓/.test(s))return"spellblade";
 if(/死靈|詛咒|暗影法|魔女|血法|黑魔導/.test(s))return"shadow";
 if(/火焰|炎法|火元素/.test(s))return"fire";
 if(/寒冰|霜|水元素/.test(s))return"frost";
 if(/雷電|風魔法|風元素|雷元素/.test(s))return"storm";
 if(/召喚|精靈使|馴龍|龍契|祖靈|薩滿/.test(s))return"summon";
 if(/德魯伊|自然術|森|靈獸|自然/.test(s))return"nature";
 if(/元素|地元素/.test(s))return"elemental";
 if(/魔導|法師|術師|魔法|巫師|奧術|星象|幻術|秘紋|時序/.test(s))return"arcane";
 if(/盾|守衛|守護|騎士|重裝/.test(s))return"guard";
 if(/狂戰|野蠻|巨兵|重斧|戰鎚/.test(s))return"heavy";
 if(/槍士|長槍|長兵|槍宗師/.test(s))return"spear";
 if(/武僧|拳|格鬥/.test(s))return"monk";
 if(/刺客|盜賊|影刃|暗影|雙刃|飛刀|海盜/.test(s))return"assassin";
 if(/遊俠|獵人|斥候|巡林|陷阱/.test(s))return"ranger";
 if(/射手|弓箭|弓術|長弓|弩/.test(s))return"archer";
 return c.combat_track==="magic"?"arcane":c.combat_track==="hybrid"?"spellblade":"blade";
}
function element(c,f){
 const text=String(c.name||"")+" "+String(c.combat_identity?.family||"");
 if(/火|炎/.test(text)||f==="fire")return"火";
 if(/雷|電/.test(text))return"雷";
 if(/冰|霜|寒|水元素/.test(text)||f==="frost")return"水";
 if(/風/.test(text))return"風";
 if(/地|岩|土/.test(text))return"地";
 if(/死靈|亡靈/.test(text))return"死亡";
 if(/黑暗|暗影|詛咒/.test(text)||f==="shadow")return"黑暗";
 if(/聖|光/.test(text)||f==="holy")return"光明";
 if(/生命|治癒|自然/.test(text)||f==="healer"||f==="nature")return"生命";
 return null;
}
const atkType=(c,f)=>["healer","nature","summon","elemental","frost","storm","fire","shadow","arcane"].includes(f)?"magic":f==="holy"||f==="spellblade"?"hybrid":c.combat_track==="magic"?"magic":c.combat_track==="hybrid"?"hybrid":"physical";
function scale(dtype){return dtype==="magic"||dtype==="heal"?"magic":dtype==="hybrid"?"hybrid":"physical"}
function bonuses(dtype){
 if(dtype==="heal")return{"6":{target_max_hp_heal_pct:1.5,text:"額外恢復最大生命1.5%"},"10":{target_max_hp_heal_pct:2.5,text:"額外恢復最大生命2.5%"}};
 if(dtype==="buff"||dtype==="cleanse")return{"6":{status_resist_bonus:3,text:"異常抗性+3%"},"10":{status_resist_bonus:5,text:"異常抗性再+5%"}};
 if(dtype==="debuff")return{"6":{status_chance_bonus:10,text:"異常附加率+10%"},"10":{status_rounds_bonus:1,text:"異常時間+1回合"}};
 return{"6":{accuracy_bonus:3,text:"命中判定+3"},"10":dtype==="magic"?{magic_pen_pct:5,text:"魔法穿透+5%"}:{armor_pen_pct:5,text:"護甲穿透+5%"}};
}
function make(c,f,grade,idx,name,dtype,pattern,variant){
 const n=R[grade],area=pattern==="all"?.59:pattern==="cross"?.80:pattern==="row"||pattern==="column"?.82:pattern==="random"?.76:1;
 const power=dtype==="heal"?(112+n*7):ATTACK.has(dtype)?Math.round(POWER[grade]*area):0;
 const resource=dtype==="magic"||dtype==="heal"||c.resource_type==="MP"?"mana":"stamina";
 const tag=String(c.combat_identity?.mechanic_tags?.[0]||f);
 const s={id:"SK-CTSE-"+c.id+"-"+grade+"-"+idx,name,tier:grade,kind:ATTACK.has(dtype)?"主動":"輔助",display_type:ATTACK.has(dtype)?"主動":"輔助",
 source_class:c.id,source_class_name:c.name,family:"CTSE-"+f,school:c.combat_identity?.family||f,
 damage_type:dtype,target:dtype==="heal"||dtype==="buff"||dtype==="cleanse"?"ally":"enemy",
 target_side:dtype==="heal"||dtype==="buff"||dtype==="cleanse"?"ally":"enemy",target_pattern:pattern,
 resource,resource_cost:COST[grade]+(pattern==="all"?3:0),stamina_cost:COST[grade],unlock_grade:grade,
 recommended_level:LEVEL[grade],skill_level_cap:10,level_growth_start:1,
 base_power_percent:power,power_growth_percent_per_level:ATTACK.has(dtype)?2.5:2,scaling_stat:scale(dtype),
 accuracy:ATTACK.has(dtype)?2+n:0,level_bonuses:bonuses(dtype),canonical_skill_id:"SK-CTSE-"+c.id+"-"+grade+"-"+idx,
 class_signature:true,cross_train_locked:true,manual_battle_use:true,
 class_identity_tag:tag,requires_class_exam:grade==="B",
 effect_text:ATTACK.has(dtype)?("依"+c.name+"戰鬥專長發動；"+name+"，"+(pattern==="all"?"對全部存活敵人":pattern==="cross"?"對十字範圍":pattern==="row"?"對同一行":pattern==="column"?"對同一列":pattern==="random"?"對隨機目標連續出手":"攻擊選定敵人")+"，"+power+"%"+(dtype==="physical"?"物攻":dtype==="magic"?"魔攻":"物魔混合攻擊")+"。"):"",
 };
 if(dtype==="magic"||dtype==="hybrid"){const el=element(c,f);if(el)s.element=el}
 if(pattern==="random"){s.target_count=grade==="B"?4:3;s.allow_repeat=true}
 if(pattern==="all_allies")s.target="ally",s.target_side="ally";
 if(dtype==="debuff"){s.target="enemy";s.target_side="enemy";s.target_pattern="single";s.debuff={defense:-(n+1),magicDefense:-(n+1)}}
 if(dtype==="heal")s.effect_text=name+"：恢復我方生命，基礎治療"+power+"%魔攻。";
 if(dtype==="buff")s.effect_text=name+"：提供守勢、防護、增幅或戰術支援；與職業核心「"+tag+"」連動。";
 if(dtype==="debuff")s.effect_text=name+"：削弱選定敵方的物理及魔法防禦，持續至本場戰鬥結束。";
 if(dtype==="cleanse")s.effect_text=name+"：清除可淨化異常，不包含中毒、飢餓、口渴、疲勞。",s.cleanse_exclusions=["poison","hunger","thirst","fatigue"];
 if(variant==="shield")s.target_pattern="ally_row",s.target="ally",s.target_side="ally",s.effect_text="為我方同一行全員建立護盾並吸收實際傷害。";
 s.desc=s.effect_text;
 return s;
}
function utilitySpec(f,grade,name){
 if(f==="healer"){const pattern=grade==="D"?"random_ally":grade==="C"||grade==="B"?"all_allies":"single";return{dtype:"heal",pattern}}
 if(f==="guard"&&grade==="D")return{dtype:"buff",pattern:"ally_row",variant:"shield"};
 if(f==="holy"&&grade==="D")return{dtype:"cleanse",pattern:"single"};
 if(f==="shadow"&&grade==="D")return{dtype:"debuff",pattern:"single"};
 if(f==="ranger"&&grade==="D")return{dtype:"buff",pattern:"single"};
 return{dtype:"buff",pattern:"single"};
}
function skillKey(s){return String(s?.canonical_skill_id||s?.id||s?.name+"|"+s?.tier)}
function level(s){
 try{if(typeof globalThis.skillLevel==="function")return Number(globalThis.skillLevel(s))||1}catch(_){}
 const xp=Number(s?.skillXp||0),t=DB.skill_scaling_system?.skill_xp_system?.xp_thresholds||[0,12,30,55,85,120,160,205,255,310];
 let out=1;for(let i=1;i<t.length;i++)if(xp>=t[i])out=i+1;return Math.min(10,out);
}
function findLearned(s,arr){return(arr||[]).find(x=>String(x.canonical_skill_id||x.id||"")===skillKey(s)||(x.name===s.name&&x.tier===s.tier))}
const stat={classes:0,added:0,evolutions:0,fPromoted:0,sharedPromoted:0,byGrade:{E:0,D:0,C:0,B:0}};
const repeated=new Map();
for(const pool of Object.values(DB.skill_pools||{}))for(const s of pool||[])if(s?.tier==="F")repeated.set(String(s.name||"").replace(/－通用（[^）]*）$/,""),(repeated.get(String(s.name||"").replace(/－通用（[^）]*）$/,""))||0)+1);
for(const c of DB.combat_classes){
 const pool=DB.skill_pools?.[c.id];if(!Array.isArray(pool))continue;
 const f=family(c),cfg=FAMILIES[f]||FAMILIES.blade;
 const fSkills=pool.filter(s=>s?.tier==="F"),attack=s=>ATTACK.has(s?.damage_type)&&s?.kind!=="被動";
 /* 保留招牌攻擊及一項不同功能的基礎技能；只升階重複的通用技能。 */
 const prime=fSkills.find(s=>s.class_signature&&attack(s))||fSkills.find(attack)||fSkills[0];
 const second=fSkills.find(s=>s!==prime&&(s.damage_type!==prime?.damage_type||s.kind==="被動"))||fSkills.find(s=>s!==prime);
 const keep=new Set([prime,second].filter(Boolean));let retain=0;
 for(const s of fSkills){if(keep.has(s))continue;
  const base=String(s.name||"").replace(/－通用（[^）]*）$/,"");
  const generic=(repeated.get(base)||0)>=3||/^(基礎|入門|初階|通用|基本)/.test(base)||/通用/.test(s.name||"");
  if(!generic)continue;
  s.legacy_tier="F";s.tier="E";s.unlock_grade="E";s.recommended_level=Math.max(LEVEL.E,Number(s.recommended_level||0));
  if(attack(s))s.base_power_percent=Math.max(POWER.E,Number(s.base_power_percent||0));
  if(!s.level_bonuses)s.level_bonuses=bonuses(s.damage_type);
  s.promoted_from_common=true;stat.fPromoted++;
 }
 /* F核心技能達Lv6，且職業已達E級時，可在公會精修為E階招牌版。 */
 if(prime&&attack(prime)){
  const id="SK-CTSE-"+c.id+"-E-EVOLVE",name=String(prime.name||"基礎戰技").replace(/－通用（[^）]*）$/,"")+"・精修";
  if(!pool.some(s=>s.id===id||s.canonical_skill_id===id)){
   const up=clone(prime);Object.assign(up,{id,canonical_skill_id:id,name,tier:"E",unlock_grade:"E",recommended_level:LEVEL.E,
    source_class:c.id,source_class_name:c.name,legacy_tier:undefined,upgrade_from_id:skillKey(prime),
    upgrade_from_name:prime.name,upgrade_min_level:6,learn_only_via_upgrade:true,
    base_power_percent:Math.max(POWER.E+8,Number(prime.base_power_percent||0)+12),
    resource_cost:Math.max(COST.E,Number(prime.resource_cost||prime.stamina_cost||0)+2),
    class_signature:true,cross_train_locked:true,level_bonuses:bonuses(prime.damage_type),
    effect_text:name+"：保留原招式特色，進一步提高命中品質及"+(prime.damage_type==="magic"?"魔法":"物理")+"威力。"});
   up.desc=up.effect_text;pool.push(up);stat.evolutions++;stat.added++;stat.byGrade.E++;
  }
 }
 for(let i=0;i<4;i++){
  const grade=ranks[i],raw=cfg.a[i],util=cfg.u[i],baseType=atkType(c,f),pattern=cfg.areas[i];
  const attackName=pool.some(s=>s.name===raw&&s.tier===grade)?raw+"・"+String(c.combat_identity?.mechanic_tags?.[0]||"精研"):raw;
  const u=utilitySpec(f,grade,util),defs=[
   make(c,f,grade,"A",attackName,baseType,pattern),
   make(c,f,grade,"U",util,u.dtype,u.pattern,u.variant)
  ];
  for(const s of defs){if(pool.some(x=>x.id===s.id||x.canonical_skill_id===s.id))continue;
   if(pool.some(x=>x.name===s.name&&x.tier===s.tier))s.name=String(c.name||"職業")+"・"+s.name;
   if(s.target_pattern==="random_ally"){s.target_count=4;s.allow_repeat=false}
   pool.push(s);stat.added++;stat.byGrade[grade]++;
  }
 }
 c.tier_skill_expansion={family:f,grades:ranks.slice(),f_core_kept:keep.size,evolution_id:prime&&attack(prime)?"SK-CTSE-"+c.id+"-E-EVOLVE":null};
 stat.classes++;
}
const shared=(DB.shared_skills||[]).filter(s=>s?.tier==="F"&&ATTACK.has(s?.damage_type)&&s?.kind!=="被動");
if(shared.length>3){
 const keep=new Set(),take=key=>{const hit=shared.find(s=>!keep.has(s)&&key(s));if(hit)keep.add(hit)};
 take(s=>s.damage_type==="physical");take(s=>s.damage_type==="magic");take(()=>true);
 for(const s of shared)if(!keep.has(s)){s.legacy_tier="F";s.tier="E";s.unlock_grade="E";s.recommended_level=Math.max(LEVEL.E,Number(s.recommended_level||0));if(!s.level_bonuses)s.level_bonuses=bonuses(s.damage_type);s.promoted_from_common=true;stat.sharedPromoted++}
}
function upgrade(skillId,classId){
 const c=typeof G!=="undefined"?G?.character:null,pool=DB.skill_pools?.[classId]||[],target=pool.find(s=>s.upgrade_from_id===skillId&&s.learn_only_via_upgrade);
 if(!c||!target)return{ok:false,reason:"精修路線不存在"};
 const current=(DB.combat_classes||[]).find(row=>row.id===c.classId),grade=c.combatGrade||current?.tier||"F";
 if((R[grade]??0)<1)return{ok:false,reason:"職業實際階級未達E級"};
 if(c.currentFacility!=="guild")return{ok:false,reason:"須在冒險者公會完成技能精修"};
 const lineage=c.classId===classId||(c.classHistory||[]).some(row=>row.id===classId)||(current?.progression_from||[]).includes(classId);
 if(!lineage)return{ok:false,reason:"尚未習得此職業傳承"};
 const idx=(c.skills||[]).findIndex(s=>skillKey(s)===skillId&&s.tier==="F");if(idx<0)return{ok:false,reason:"尚未擁有原F級技能"};
 const old=c.skills[idx];if(level(old)<6)return{ok:false,reason:"原技能需達Lv6"};
 if(c.skills.some(s=>skillKey(s)===skillKey(target)))return{ok:false,reason:"已取得該精修技能"};
 if(typeof globalThis.beginTurn==="function"&&!globalThis.beginTurn("職業技能精修"))return{ok:false,reason:"無法開始本次訓練"};
 const next=clone(target);next.skillXp=old.skillXp||0;next.mastery=old.mastery||0;next.type=old.type||"戰鬥";next.upgraded_from=skillId;
 c.skills[idx]=next;
 try{globalThis.persist?.();globalThis.endTurn?.(2)}catch(_){}
 return{ok:true,name:next.name,from:old.name};
}
function renderUpgrades(){
 if(typeof document==="undefined")return;const body=document.getElementById("modalBody"),c=typeof G!=="undefined"?G?.character:null;
 if(!body||!c||c.currentFacility!=="guild"||body.querySelector("[data-ctse-upgrade]"))return;
 const rows=[];for(const [cid,pool] of Object.entries(DB.skill_pools||{}))for(const s of pool||[])if(s.learn_only_via_upgrade){
  const old=(c.skills||[]).find(x=>skillKey(x)===s.upgrade_from_id&&x.tier==="F");if(!old)continue;
  const current=(DB.combat_classes||[]).find(x=>x.id===c.classId),lineage=c.classId===cid||(c.classHistory||[]).some(x=>x.id===cid)||(current?.progression_from||[]).includes(cid);
  if(!lineage)continue;
  const ready=(R[c.combatGrade||current?.tier||"F"]??0)>=1&&level(old)>=6;
  const eid=JSON.stringify(s.upgrade_from_id),cidText=JSON.stringify(cid);
  rows.push('<div class="itemrow"><span><b>'+String(old.name).replace(/[<>&"]/g,"")+'</b> Lv'+level(old)+' → '+String(s.name).replace(/[<>&"]/g,"")+'［E］</span><button type="button" '+(ready?'onclick=\u0027upgradeFoundationSkillUI('+eid+','+cidText+')\u0027':'disabled')+'>'+(ready?'精修升階':'需E級及Lv6')+'</button></div>');
 }
 if(!rows.length)return;const node=document.createElement("section");node.className="card";node.dataset.ctseUpgrade="1";node.innerHTML="<h3>基礎技能精修（F→E）</h3><div class='small'>原技能Lv6以上、實際職業階級E以上；保留原熟練與技能經驗。</div>"+rows.join("");body.appendChild(node);
}
globalThis.upgradeFoundationSkill=(id,cid)=>upgrade(id,cid);
globalThis.upgradeFoundationSkillUI=(id,cid)=>{
 const result=upgrade(id,cid);if(!result.ok){if(typeof alert==="function")alert(result.reason);return}
 if(typeof globalThis.guildBasicTraining==="function")globalThis.guildBasicTraining();
};
const basic=globalThis.guildBasicTraining;
if(typeof basic==="function")globalThis.guildBasicTraining=function(){const result=basic.apply(this,arguments);if(typeof setTimeout==="function")setTimeout(renderUpgrades,0);return result};
function audit(){
 const issues=[];let total=0;for(const c of DB.combat_classes){const p=DB.skill_pools?.[c.id]||[];if(!p.length){issues.push(c.id+":技能池不存在");continue}
  const uniq=new Set(),counts={};for(const s of p){const key=skillKey(s);if(uniq.has(key))issues.push(c.id+":技能ID重複"+key);uniq.add(key);counts[s.tier]=(counts[s.tier]||0)+1;if(String(s.id||"").startsWith("SK-CTSE-")&&s.requires_class_exam&&s.tier!=="B")issues.push(s.id+":考核標示錯誤");if(String(s.id||"").startsWith("SK-CTSE-")&&ATTACK.has(s.damage_type)&&s.base_power_percent<=0)issues.push(s.id+":攻擊倍率錯誤")}
  for(const t of ranks)if(!p.some(s=>s.id==="SK-CTSE-"+c.id+"-"+t+"-A")||!p.some(s=>s.id==="SK-CTSE-"+c.id+"-"+t+"-U"))issues.push(c.id+":"+t+"級技能缺漏");
  if(c.selectable&&p.filter(s=>s.tier==="F").length<2)issues.push(c.id+":F級不足兩招");
  total+=p.length;
 }
 return{revision:REV,pass:issues.length===0,issues,stats:{...stat,total_pool_records:total,save_compatible:true}};
}
DB.meta=DB.meta||{};DB.meta.class_tier_skill_expansion_revision=REV;
DB.class_tier_skill_expansion_system={revision:REV,stats:stat,design:"每個既有職業E/D/C/B各新增攻擊與戰術技能；保留F級兩項核心招式，重複通用F技能移為E級；F核心Lv6可在公會精修升E；B級仍須原考核。",save_compatible:true};
if(DB.skill_design_system&&Number.isFinite(Number(DB.skill_design_system.skill_records)))DB.skill_design_system.skill_records+=stat.added;
const ai=(DB.management_ai||[]).find(x=>x.id==="AI-SKILL");
if(ai){ai.inputs=[...new Set([...(ai.inputs||[]),REV,"職業E～B技能譜系及F技能精修"])];ai.validations=[...new Set([...(ai.validations||[]),"各職業E～B每階須具至少一項攻擊技能和一項不同功能的戰術技能。","F級只縮減重複共通技能，保留既有已學技能和原存檔。","B級技能仍須遵守職業高階考核及實際階級。"])]}
globalThis.runClassTierSkillExpansionAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/class-tier-skill-expansion-v1.js",{domain:"progression",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.4"});
})();
