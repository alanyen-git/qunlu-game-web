/* CURRENT-2.14.3｜SKILL-TARGETING-1.0
 * Shared target geometry, area resolution, and canonical area-skill set.
 */
(()=>{
"use strict";
const REV="SKILL-TARGETING-1.0";
const LABEL={single:"單體型",column:"一列型",row:"一行型",cross:"十字型",all:"全體型",random:"亂數型",random_ally:"亂數型",all_allies:"全體型",ally_row:"一行型"};
const MODES=new Set(Object.keys(LABEL));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const aliveEnemies=()=>{const b=G?.battle;return (Array.isArray(b?.enemies)?b.enemies:[b?.enemy].filter(Boolean)).filter(e=>Number(e.hp)>0)};
const allyKeys=()=>{const b=G?.battle||{};return ["self",...(b.companion&&!b.companion.knockedOut?["companion"]:[]),...(b.party||[]).map((x,i)=>!x.knockedOut?"party:"+i:null).filter(Boolean)]};
function formationTargets(pattern,units,anchorId){
 const live=(units||[]).filter(x=>Number(x?.hp)>0),anchor=live.findIndex(x=>x.battleId===anchorId||x.key===anchorId);if(pattern==="all")return live;
 if(pattern==="single")return anchor>=0?[live[anchor]]:[];
 if(anchor<0)return [];
 const row=i=>Math.floor(i/3),col=i=>i%3,ar=row((units||[]).indexOf(live[anchor])),ac=col((units||[]).indexOf(live[anchor]));
 if(pattern==="row")return live.filter(x=>row(units.indexOf(x))===ar);
 if(pattern==="column")return live.filter(x=>col(units.indexOf(x))===ac);
 if(pattern==="cross")return live.filter(x=>Math.abs(row(units.indexOf(x))-ar)+Math.abs(col(units.indexOf(x))-ac)<=1);
 return []
}
function sampleWithoutReplacement(rows,count,rng=Math.random){const a=[...(rows||[])];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,Math.max(0,count))}
function addSkills(){
 const rows=[
  ["SK-TGT-001","C9-FIREMAGE","爆裂火球","D","magic","火","cross","enemy",132,5,"魔法攻擊力132%；命中目標與十字相鄰敵人。","SF-FIRE"],
  ["SK-TGT-002","C9-LIGHTNINGMAGE","連鎖閃電","C","magic","雷","random","enemy",142,6,"隨機攻擊4次，可重複命中同一敵人。","SF-LIGHTNING"],
  ["SK-TGT-003","C9-SWORDSMAN","劍氣斬","D","physical",null,"row","enemy",128,5,"攻擊選定敵方目標同一行的所有敵人。","SF-SWORD"],
  ["SK-TGT-004","C9-WINDMAGE","颶風術","C","magic","風","all","enemy",126,7,"攻擊全部存活敵人。施放時不用選擇目標。","SF-WIND"],
  ["SK-TGT-005","C9-WHITEMAGE","治療波","D","heal","生命","random_ally","ally",118,5,"隨機治療4名不同的我方存活同伴。","SF-HEAL"],
  ["SK-TGT-006","C9-WHITEMAGE","全體治療","C","heal","生命","all_allies","ally",136,8,"治療我方所有存活成員。施放時不用選擇目標。","SF-HEAL"],
  ["SK-TGT-007","C9-KNIGHT","盾牆","D","buff",null,"ally_row","ally",0,5,"為選定我方目標與同一行成員建立戰鬥護盾。","SF-SHIELD"]
 ];
 let count=0;
 for(const [id,cid,name,tier,dtype,element,pattern,side,power,cost,effect,family] of rows){
  const pool=DB.skill_pools?.[cid];if(!Array.isArray(pool)||pool.some(s=>s.id===id||s.canonical_skill_id===id))continue;
  const magic=["magic","heal"].includes(dtype),support=["heal","buff"].includes(dtype),className=(DB.combat_classes||[]).find(c=>c.id===cid)?.name||cid;
  pool.push({id,name,tier,kind:support?"輔助":"主動",display_type:support?"輔助":"主動",school:magic?"術式":"戰技",family,source_class:cid,source_class_name:className,damage_type:dtype,target:support?"ally":"enemy",target_side:side,target_pattern:pattern,target_count:pattern==="random"?4:pattern==="random_ally"?4:undefined,allow_repeat:pattern==="random",element:element||undefined,resource:magic?"mana":"stamina",resource_cost:cost,stamina_cost:cost,recommended_level:({E:8,D:16,C:28,B:42})[tier],unlock_grade:tier,skill_level_cap:10,level_growth_start:1,base_power_percent:power,power_growth_percent_per_level:magic?3:2,scaling_stat:magic?"magic":"physical",accuracy:2,effect_text:effect,desc:effect,canonical_skill_id:id,manual_battle_use:true,level_bonuses:{"6":{accuracy_bonus:3,text:"命中判定+3"},"10":{target_power_bonus_pct:8,text:"技能威力+8%"}}});
  count++
 }
 return count
}
function patternOf(s){const p=s?.target_pattern;if(MODES.has(p))return p;if(s?.damage_type==="heal"&&s?.mechanics?.traits?.includes("group_heal"))return "all_allies";return "single"}
function targetsFor(pattern,anchor){const b=G?.battle||{},units=Array.isArray(b.enemies)?b.enemies:[b.enemy].filter(Boolean);if(pattern==="all")return units.filter(e=>e.hp>0);return formationTargets(pattern,units,anchor)}
function enemyKey(e){return "enemy:"+(e?.battleId||e?.id||"")}
function targetStage(index,s,pattern){
 const enemySide=["column","row","cross"].includes(pattern),body=document.querySelector("#battleSkillPopupBody");if(!body)return;
 const units=G.battle.enemies||[G.battle.enemy],rows=enemySide?aliveEnemies().map(e=>{const i=units.indexOf(e);return{key:enemyKey(e),name:e.name,hp:e.hp,maxHp:e.maxHp,slot:"第"+(Math.floor(i/3)+1)+"行・第"+(i%3+1)+"列"}}):allyKeys().map((key,i)=>{const t=key==="self"?G.character:key==="companion"?G.battle.companion:G.battle.party[Number(key.slice(6))];return{key,name:t?.name||"我方成員",hp:t?.hp,maxHp:t?.maxHp,slot:"第"+(Math.floor(i/2)+1)+"行"}});
 battleSkillPopupStage="targets";battleSelectedSkillIndex=index;document.querySelector("#battleSkillPopupTitle").textContent="使用"+s.name+"：選擇"+(enemySide?"起點敵人":"我方起點");
 setUIHTML(body,'<div class="battle-skill-return"><button type="button" onclick="battleSkillMenu()">← 返回技能列表</button></div>'+rows.map(t=>'<div class="itemrow"><span><b>'+t.name+'</b> <span class="small">'+t.slot+'｜HP '+Math.round(t.hp||0)+'/'+Math.round(t.maxHp||0)+'</span></span><button type="button" onclick="battleConfirmSkillTarget('+index+',\''+t.key+'\')">選擇</button></div>').join(""));body.scrollTop=0
}
function alliedRowKeys(anchor){const keys=allyKeys(),idx=keys.indexOf(anchor);if(idx<0)return[];const row=Math.floor(idx/2);return keys.filter((_,i)=>Math.floor(i/2)===row)}
function resolveShieldWall(s,targetKey){
 const b=G.battle,cs=combatStats(),cost=skillResourceCost(s),mana=skillUsesMana(s);if((mana?G.character.mana:G.character.stamina)<cost||!beginPlayerBattleAction())return;
 if(mana)G.character.mana-=cost;else G.character.stamina-=cost;gainSkillMastery(s);
 b.allyShields=b.allyShields||{};const amount=Math.max(1,Math.round(cs.magicPower*.75+cs.defense*.55+skillPowerPercent(s)*.28));
 for(const key of alliedRowKeys(targetKey))b.allyShields[key]=Math.max(Number(b.allyShields[key]||0),amount);
 battleLog("盾牆保護同一行的我方成員；每人護盾 "+amount+" 點。護盾持續至戰鬥結束。");closeBattleSkillPopup();persist();renderAll();enemyBattleTurn()
}
function withShieldTurn(){
 const prior=globalThis.enemyBattleTurn;if(typeof prior!=="function")return;
 globalThis.enemyBattleTurn=function(){const b=G?.battle;if(!b?.active||!b.allyShields)return prior.apply(this,arguments);const char=G.character,baseMax=char.maxHp,buffers=[];
  const objFor=k=>k==="self"?char:k==="companion"?b.companion:String(k).startsWith("party:")?b.party?.[Number(k.slice(6))]:null;
  for(const [key,value] of Object.entries(b.allyShields)){const t=objFor(key),amount=Math.max(0,Number(value)||0);if(!t||amount<=0)continue;const hp=Number(t.hp)||0,max=Number(t.maxHp)||0;if(key==="self")t.maxHp=max+amount;t.hp=hp+amount;buffers.push({key,t,hp,max,amount})}
  let out;try{out=prior.apply(this,arguments)}finally{
   for(const x of buffers){if(x.key==="self")char.maxHp=baseMax;const active=G?.battle===b&&b.active,after=Number(x.t.hp)||0,used=Math.min(x.amount,Math.max(0,x.hp+x.amount-after));if(active){const left=x.amount-used;x.t.hp=Math.max(0,after-left);if(x.key==="self")x.t.hp=clamp(x.t.hp,0,x.max);b.allyShields[x.key]=left;if(used>0)battleLog("盾牆吸收 "+used+" 點傷害（"+x.t.name+"）。");if(left<=0)delete b.allyShields[x.key]}}
   if(G?.battle===b&&b.active){persist();renderAll()}
  }return out
 };
}
function patchUse(){
 const oldUse=globalThis.battleUseSkill;if(typeof oldUse!=="function")return;
 globalThis.battleUseSkill=function(index,targetKey="self"){
  const s=G?.character?.skills?.[index],pattern=patternOf(s);if(!s||pattern==="single")return oldUse.apply(this,arguments);const b=G?.battle;if(!b?.active)return;
  if(pattern==="ally_row"){if(!String(targetKey).startsWith("enemy:"))return resolveShieldWall(s,targetKey);return}
  if(["column","row","cross"].includes(pattern)&&!String(targetKey).startsWith("enemy:"))return;
  const side=s.target_side||(s.damage_type==="heal"?"ally":"enemy");let queue=[];
  if(["column","row","cross"].includes(pattern))queue=targetsFor(pattern,targetKey.slice(6));
  else if(pattern==="all")queue=targetsFor("all");
  else if(pattern==="random_ally")queue=sampleWithoutReplacement(allyKeys(),Math.max(1,Number(s.target_count||4))).map(key=>({key}));
  else if(pattern==="all_allies"){battleSkillPopupStage="closed";return oldUse.call(this,index,"self")}
  if(pattern==="random_ally"&&!queue.length)return;
  if(pattern==="random"&&!aliveEnemies().length)return;
  if(pattern==="random")queue=Array.from({length:Math.max(1,Number(s.target_count||4))},()=>({random:true}));
  if(!queue.length)return;
  const mana=skillUsesMana(s),prop=mana?"mana":"stamina",startResource=Number(G.character[prop]||0),saved={begin:globalThis.beginPlayerBattleAction,turn:globalThis.enemyBattleTurn,tick:globalThis.tickBattleEffects,degrade:globalThis.degradeEquipment,mastery:globalThis.gainSkillMastery},anchor=String(targetKey).startsWith("enemy:")?targetKey.slice(6):null;let first=true,paid=startResource;
  globalThis.enemyBattleTurn=()=>{};
  if(saved.begin)globalThis.beginPlayerBattleAction=function(){return first?saved.begin.apply(this,arguments):true};
  if(saved.tick)globalThis.tickBattleEffects=function(){return first?saved.tick.apply(this,arguments):undefined};
  if(saved.degrade)globalThis.degradeEquipment=function(){return first?saved.degrade.apply(this,arguments):undefined};
  if(saved.mastery)globalThis.gainSkillMastery=function(){return first?saved.mastery.apply(this,arguments):undefined};
  try{
   for(const item of queue){if(!G?.battle?.active)break;let key=item.key;
    if(item.random){const live=aliveEnemies();if(!live.length)break;key=enemyKey(live[Math.floor(Math.random()*live.length)])}
    if(side==="enemy"){const id=String(key).startsWith("enemy:")?String(key).slice(6):key,unit=(G.battle.enemies||[G.battle.enemy]).find(e=>e&&(e.battleId===id||e.id===id));if(!unit||unit.hp<=0)continue;if(globalThis.selectBattleEnemy)globalThis.selectBattleEnemy(unit.battleId||unit.id,false);else G.battle.enemy=unit}
    if(!first)G.character[prop]=startResource;battleSkillPopupStage="committing";oldUse.call(this,index,side==="ally"?key:"self");
    if(first){paid=Number(G.character[prop]||0);first=false}else G.character[prop]=paid;
   }
  }finally{globalThis.beginPlayerBattleAction=saved.begin;globalThis.enemyBattleTurn=saved.turn;globalThis.tickBattleEffects=saved.tick;globalThis.degradeEquipment=saved.degrade;globalThis.gainSkillMastery=saved.mastery}
  if(G?.battle?.active){const focus=(G.battle.enemies||[]).find(e=>e.battleId===anchor&&e.hp>0)||aliveEnemies()[0];if(focus&&globalThis.selectBattleEnemy)globalThis.selectBattleEnemy(focus.battleId,false);battleSkillPopupStage="closed";persist();renderAll();globalThis.enemyBattleTurn()}
 };
}
function patchPicker(){
 const oldChoose=globalThis.battleChooseSkill,oldConfirm=globalThis.battleConfirmSkillTarget;
 globalThis.battleChooseSkill=function(index){const s=G?.character?.skills?.[index],p=patternOf(s);if(!s||p==="single")return oldChoose?.apply(this,arguments);
  if(!G?.battle?.active||battleSkillPopupStage!=="list"||document.querySelector("#battleSkillPopup")?.classList.contains("hide"))return;const mana=skillUsesMana(s),cost=skillResourceCost(s);if((mana?G.character.mana:G.character.stamina)<cost)return;
  if(["column","row","cross","ally_row"].includes(p))return targetStage(index,s,p);battleSkillPopupStage="committing";globalThis.battleUseSkill(index,"area")
 };
 globalThis.battleConfirmSkillTarget=function(index,key){if(!G?.battle?.active||battleSkillPopupStage!=="targets"||battleSelectedSkillIndex!==index||document.querySelector("#battleSkillPopup")?.classList.contains("hide"))return;
  const s=G.character.skills[index],p=patternOf(s);if(["column","row","cross"].includes(p)){if(!String(key).startsWith("enemy:")||!aliveEnemies().some(e=>enemyKey(e)===key))return}
  else if(p==="ally_row"){if(!allyKeys().includes(key))return}else return oldConfirm?.apply(this,arguments);
  if((skillUsesMana(s)?G.character.mana:G.character.stamina)<skillResourceCost(s))return;battleSkillPopupStage="committing";globalThis.battleUseSkill(index,key)
 };
}
function patchDescription(){const old=globalThis.skillDescriptionText;if(typeof old!=="function")return;globalThis.skillDescriptionText=function(s){const base=old.apply(this,arguments),label=LABEL[patternOf(s)];return label&&!String(base).includes("作用範圍：")?String(base)+"｜作用範圍："+label:base}}
function register(){
 const added=addSkills();for(const s of Object.values(DB.skill_pools||{}).flat()){
  if(s&&s.kind!=="被動"&&!s.target_pattern)s.target_pattern=s.damage_type==="heal"&&s.mechanics?.traits?.includes("group_heal")?"all_allies":"single";
  if(s?.id?.startsWith("SK-TGT-")){if(globalThis.skillMechanicsFor)s.mechanics=globalThis.skillMechanicsFor(s);if(s.id==="SK-TGT-006"&&s.mechanics)s.mechanics.group_heal_ratio=1}
 }
 DB.skill_design_system=DB.skill_design_system||{};DB.skill_design_system.target_patterns=["single","column","row","cross","all","random"];DB.skill_design_system.skill_records=(Number(DB.skill_design_system.skill_records)||0)+added;
 DB.skill_targeting_system={version:REV,types:LABEL,rules:["全體型技能無須選擇目標。","範圍技能依六格陣形計算列、行、十字與全體目標。","連鎖閃電可重複命中；亂數治療不重複抽取同伴。","每次施放只消耗一次資源與行動，之後才進入敵方回合。","盾牆依我方兩欄陣形保護選定目標同一行，並實際吸收傷害。"],skills_added:added,save_compatible:true};
 DB.meta=DB.meta||{};DB.meta.skill_targeting_revision=REV;const ai=(DB.management_ai||[]).find(x=>x.id==="AI-SKILL");if(ai){ai.inputs=[...new Set([...(ai.inputs||[]),REV,"技能目標幾何、全體／亂數對象、我方護盾目標"])];ai.validations=[...new Set([...(ai.validations||[]),"技能範圍型態必須對應戰鬥格位與實際傷害／治療流程。","全體技能不得要求選擇目標；亂數連鎖可重複，亂數治療不得重複。","護盾技能必須吸收敵方實際傷害並於戰鬥結束清除。"])]}
 const oldMigrate=globalThis.migrateSave;if(typeof oldMigrate==="function")globalThis.migrateSave=function(){const r=oldMigrate.apply(this,arguments),pool=Object.values(DB.skill_pools||{}).flat();for(const s of G?.character?.skills||[]){const src=pool.find(x=>x.canonical_skill_id&&x.canonical_skill_id===s.canonical_skill_id||x.id&&x.id===s.id||x.name===s.name&&x.tier===s.tier);if(src&&!s.target_pattern)s.target_pattern=src.target_pattern||"single"}return r};
 patchUse();patchPicker();patchDescription();withShieldTurn()
}
register();globalThis.QUNLU_SKILL_TARGETING={revision:REV,patternOf,formationTargets,sampleWithoutReplacement,labels:LABEL};
})();
