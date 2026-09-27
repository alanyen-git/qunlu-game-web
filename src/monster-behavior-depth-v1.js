/* 群陸旅誌：野獸／魔物／菁英／Boss 戰鬥行為深化 CURRENT-2.20.0
 * MONSTER-BEHAVIOR-DEPTH-1.0
 * 依物種、構造、元素、棲地與階級建立可執行的專屬攻擊循環。
 */
(()=>{
"use strict";
const REV="MONSTER-BEHAVIOR-DEPTH-1.0";
const RELEASE=String(globalThis.QUNLU_RELEASE_VERSION||globalThis.DB?.meta?.current_version||"CURRENT-2.20.0");
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const s=v=>String(v??"").trim();
const db=()=>{try{return typeof DB!=="undefined"?DB:(globalThis.DB||{})}catch(e){return globalThis.DB||{}}};
const game=()=>{try{return typeof G!=="undefined"?G:null}catch(e){return null}};
const battle=()=>game()?.battle||null;
const rank=m=>{const x=s(m?.role||m?.lore_role||m?.name);if(/高階首領|魔王|領主/.test(x))return"boss";if(/首領/.test(x)&&!/菁英|精英/.test(x))return"boss";if(/菁英|精英/.test(x))return"elite";return"normal"};
const hash=x=>{let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const text=m=>[m?.name,m?.category,m?.description,m?.element,m?.primary_element].filter(Boolean).join("");

const F={
 small:{family:"小型獵物",label:"逃竄與反咬",ai:"skitter",open:"feint",a:[
  {id:"feint",name:"假動作反咬",kind:"strike",mult:.78,target:"player",cd:2,acc:8},
  {id:"scramble",name:"竄入死角",kind:"stance",cd:4,ev:9,rounds:1}]},
 pack:{family:"群獵犬科",label:"包抄與壓制",ai:"pack",open:"flank",a:[
  {id:"flank",name:"側翼包抄",kind:"strike",mult:1.02,target:"lowest",cd:2,acc:8,status:"bleed",chance:28,rounds:2},
  {id:"howl",name:"群獵低嘯",kind:"debuff",cd:4,accDown:5,evDown:3,rounds:2}]},
 brute:{family:"大型猛獸",label:"蓄力與震擊",ai:"bruiser",open:"maul",a:[
  {id:"maul",name:"撕裂重擊",kind:"strike",mult:1.34,target:"player",cd:3,pen:8,status:"bleed",chance:34,rounds:2},
  {id:"ground",name:"震地咆哮",kind:"cleave",mult:.72,target:"all",cd:5,poise:8,status:"slow",chance:30,rounds:2}]},
 ambush:{family:"伏擊獵獸",label:"隱伏與突襲",ai:"ambush",open:"pounce",a:[
  {id:"pounce",name:"伏影撲殺",kind:"strike",mult:1.18,target:"lowest",cd:3,acc:14,crit:10,status:"bleed",chance:36,rounds:2},
  {id:"vanish",name:"掠影退位",kind:"stance",cd:4,ev:12,rounds:2}]},
 flight:{family:"飛行掠食者",label:"俯衝與致盲",ai:"dive",open:"dive",a:[
  {id:"dive",name:"高空俯衝",kind:"strike",mult:1.08,target:"lowest",cd:2,acc:16,crit:8},
  {id:"wing",name:"翼塵遮目",kind:"cleave",mult:.42,target:"all",cd:4,status:"blind",chance:32,rounds:2}]},
 raider:{family:"小型部族掠襲者",label:"誘敵與毒刃",ai:"skirmisher",open:"jab",a:[
  {id:"jab",name:"繞背毒刃",kind:"strike",mult:.94,target:"lowest",cd:2,acc:10,pen:6,status:"poison",chance:34,rounds:3},
  {id:"feint",name:"假退誘敵",kind:"stance",cd:4,ev:8,accDown:4,rounds:2}]},
 giant:{family:"重裝巨軀",label:"破陣與壓倒",ai:"brute",open:"charge",a:[
  {id:"charge",name:"破陣衝撞",kind:"strike",mult:1.42,target:"player",cd:3,acc:5,pen:16,status:"slow",chance:26,rounds:1},
  {id:"sweep",name:"橫掃斷陣",kind:"cleave",mult:.82,target:"all",cd:5,poise:10,status:"slow",chance:32,rounds:2}]},
 dragon:{family:"龍脈爬行霸主",label:"吐息與鱗甲",ai:"dragon",open:"breath",a:[
  {id:"breath",name:"龍脈吐息",kind:"cleave",mult:1.02,target:"all",cd:3,element:"inherit",pen:10},
  {id:"talon",name:"裂鱗爪擊",kind:"strike",mult:1.26,target:"lowest",cd:2,acc:10,pen:12,status:"bleed",chance:32,rounds:2}]},
 venom:{family:"毒牙伏行種",label:"纏繞與毒素",ai:"venom",open:"fang",a:[
  {id:"fang",name:"穿脈毒牙",kind:"strike",mult:.96,target:"lowest",cd:2,acc:12,status:"poison",chance:58,rounds:3},
  {id:"coil",name:"纏身窒息",kind:"strike",mult:.72,target:"player",cd:4,acc:5,status:"slow",chance:46,rounds:2,accDown:4}]},
 web:{family:"蛛網獵場",label:"結網與毒襲",ai:"web",open:"web",a:[
  {id:"web",name:"黏網封足",kind:"control",target:"lowest",cd:3,status:"slow",chance:66,rounds:2,accDown:5},
  {id:"bite",name:"蛛牙分解液",kind:"strike",mult:1.02,target:"lowest",cd:2,status:"poison",chance:46,rounds:3}]},
 undead:{family:"不死殘響",label:"重組與亡者詛咒",ai:"undead",open:"curse",a:[
  {id:"curse",name:"亡者詛咒",kind:"control",target:"lowest",cd:3,status:"curse",chance:44,rounds:3,accDown:5,defDown:4},
  {id:"reassemble",name:"殘骸重組",kind:"heal",cd:5,heal:.12}]},
 wraith:{family:"幽魂侵蝕體",label:"穿透與恐懼",ai:"wraith",open:"phase",a:[
  {id:"phase",name:"虛相穿行",kind:"stance",cd:4,ev:14,pen:18,rounds:2},
  {id:"dread",name:"貼耳亡語",kind:"strike",mult:.76,target:"lowest",cd:3,acc:12,status:"fear",chance:46,rounds:2,magic:true}]},
 blood:{family:"血族獵食者",label:"汲血與支配",ai:"drain",open:"drain",a:[
  {id:"drain",name:"血契汲取",kind:"drain",mult:1.06,target:"lowest",cd:2,heal:.22,acc:10},
  {id:"charm",name:"血族支配",kind:"control",target:"lowest",cd:5,status:"charm",chance:32,rounds:2,accDown:5}]},
 demon:{family:"深淵契約體",label:"灼燒與代價",ai:"demon",open:"brand",a:[
  {id:"brand",name:"地獄烙印",kind:"strike",mult:1,target:"lowest",cd:2,element:"火",status:"burn",chance:52,rounds:3},
  {id:"bargain",name:"深淵代價",kind:"cleave",mult:.82,target:"all",cd:4,pen:14,status:"curse",chance:28,rounds:2}]},
 element:{family:"元素聚合體",label:"元素調諧與爆發",ai:"elemental",open:"burst",a:[
  {id:"burst",name:"元素爆發",kind:"cleave",mult:.9,target:"all",element:"inherit",cd:3,acc:10},
  {id:"attune",name:"元素調諧",kind:"stance",cd:4,element:"inherit",ev:5,pen:10,rounds:2}]},
 plant:{family:"植生魔法體",label:"根縛與孢子",ai:"control",open:"root",a:[
  {id:"root",name:"根脈纏縛",kind:"control",target:"lowest",cd:3,status:"slow",chance:62,rounds:3,accDown:4},
  {id:"spore",name:"幻孢散播",kind:"cleave",mult:.48,target:"all",cd:4,status:"confusion",chance:28,rounds:2}]},
 construct:{family:"古代構裝體",label:"守衛協定與蓄能",ai:"guardian",open:"guard",a:[
  {id:"guard",name:"守衛協定",kind:"stance",cd:3,def:14,mdef:10,rounds:2},
  {id:"ram",name:"鎖定撞擊",kind:"strike",mult:1.18,target:"lowest",cd:2,acc:8,poise:8}]},
 slime:{family:"流變黏體",label:"分裂與酸蝕",ai:"slime",open:"acid",a:[
  {id:"acid",name:"酸液噴濺",kind:"cleave",mult:.66,target:"all",cd:2,element:"水",pen:18,status:"poison",chance:34,rounds:2},
  {id:"split",name:"流變分裂",kind:"stance",cd:5,def:8,ev:6,rounds:2}]},
 aquatic:{family:"潮汐掠食者",label:"拖拽與水壓",ai:"aquatic",open:"pressure",a:[
  {id:"pressure",name:"水壓衝擊",kind:"strike",mult:1.06,target:"lowest",cd:2,element:"水",status:"slow",chance:42,rounds:2},
  {id:"drag",name:"潮汐拖拽",kind:"cleave",mult:.55,target:"all",cd:4,status:"slow",chance:50,rounds:2,accDown:4}]},
 humanoid:{family:"人型戰術者",label:"讀招與破綻",ai:"tactician",open:"probe",a:[
  {id:"probe",name:"試探破綻",kind:"strike",mult:.86,target:"lowest",cd:2,acc:14,defDown:6,rounds:2},
  {id:"finish",name:"乘隙追擊",kind:"strike",mult:1.28,target:"lowest",cd:4,acc:8,pen:10}]},
 default:{family:"地域魔獸",label:"本能變式",ai:"adaptive",open:"adapt",a:[
  {id:"adapt",name:"地域本能",kind:"strike",mult:1,target:"lowest",cd:2,acc:6},
  {id:"pressure",name:"危險逼近",kind:"cleave",mult:.52,target:"all",cd:4,acc:8}]}
};

function familyOf(m){
 const x=text(m);
 if(/兔|鼠|蛙|貂|鼬|獺|松鼠|獾|蠑螈/.test(x))return"small";
 if(/狼|犬|座狼|鬣犬|豺/.test(x))return"pack";
 if(/熊|豬|野牛|犀|羚|羊|鹿|獅子|老虎|猩猩|豪豬/.test(x))return"brute";
 if(/黑豹|豹|狐|貓|虎|猿/.test(x))return"ambush";
 if(/鷹|鳥|鴉|貓頭鷹|翼|飛|蝙蝠|獅鷲/.test(x))return"flight";
 if(/哥布林|狗頭|豺狼人|蜥蜴人|蛇人/.test(x))return"raider";
 if(/獸人|半獸|食人魔|巨魔|巨人|牛頭|獨眼|戰士|騎士/.test(x))return"giant";
 if(/龍|亞龍|飛龍|九頭|海德拉|蛇怪|美杜莎|蟒|鱷|龜|蜥/.test(x))return"dragon";
 if(/蛇|蟒|毒蛇/.test(x))return"venom";
 if(/蜘蛛|蛛|蠍|蟻|蜂|甲蟲|獨角仙|蟲|蛾|蟹/.test(x))return"web";
 if(/骷髏|殭屍|食屍鬼|屍妖|木乃伊|骸骨|活鎧甲|活盔甲|墓園|守靈/.test(x))return"undead";
 if(/幽靈|幽魂|怨靈|惡靈|女妖|報喪|死神|無面|沉鐘/.test(x))return"wraith";
 if(/吸血鬼|狼人/.test(x))return"blood";
 if(/惡魔|深淵|地獄|墮天|墮落|魔王|夢魔|魅魔/.test(x))return"demon";
 if(/元素|熔岩|暴風|石像鬼|魔像|魔法/.test(x)&&!/樹人|荊棘|花|妖精/.test(x))return"element";
 if(/樹人|古樹|荊棘|蘑菇|南瓜|花仙|妖精|仙女|根脈|纏根/.test(x))return"plant";
 if(/構裝|傀|石衛|銅衛|鎧衛|守衛|鎖門|監守/.test(x))return"construct";
 if(/史萊姆|黏獸|軟泥|泥魘|腐蝕團/.test(x))return"slime";
 if(/人魚|娜迦|海怪|克拉肯|鰻|潮|水獸|魚/.test(x))return"aquatic";
 if(m?.category==="人型"||/強盜|逃兵|斥候|劫匪/.test(x))return"humanoid";
 return"default"
}
function element(m,a){return a.element==="inherit"?s(m?.element||m?.primary_element)||null:a.element||null}
function build(m){
 const key=familyOf(m),base=F[key]||F.default,r=rank(m),seed=hash(m.id+"|"+m.name);
 const a=base.a.map((x,i)=>({...x,id:x.id+"-"+((seed+i)%997),name:m.name+"・"+x.name,element:element(m,x)}));
 if(r!=="normal")a.push({id:"phase-"+(seed%997),name:m.name+"・"+(r==="boss"?"領域轉相":"狂性解放"),kind:"phase",cd:r==="boss"?5:6,threshold:r==="boss"?.48:.34,def:r==="boss"?12:7,ev:r==="boss"?10:6,pen:r==="boss"?14:7,rounds:2});
 return {id:"MBB-"+m.id,monster_id:m.id,name:m.name,family:base.family,family_key:key,rank:r,ai:base.ai,label:base.label,opening:base.open,attack_cycle:a.map(x=>x.id),special_attacks:a,unique_key:key+":"+m.id+":"+seed,save_compatible:true}
}
function attach(){
 const ms=Array.isArray(db().monsters)?db().monsters:[],profiles=[],skills=[];
 for(const m of ms){
   const p=build(m);profiles.push(p);
   m.monster_behavior_profile_id=p.id;
   m.monster_behavior={version:REV,profile_id:p.id,family:p.family,role:p.label,ai:p.ai,opening:p.opening,unique_key:p.unique_key};
   m.special_attacks=p.special_attacks.map(a=>({id:a.id,name:a.name,kind:a.kind,cooldown:a.cd,target:a.target||"player",element:a.element||null}));
   for(const a of p.special_attacks)skills.push({id:p.id+":"+a.id+":"+skills.length,monster_id:m.id,monster_name:m.name,name:a.name,kind:a.kind,cooldown:a.cd,unique_key:p.unique_key,source_profile:p.id});
 }
 db().monster_behavior_profiles=profiles;db().monster_special_skills=skills;
 db().monster_behavior_assignments=profiles.map(p=>({monster_id:p.monster_id,profile_id:p.id,rank:p.rank,family:p.family,unique_key:p.unique_key}));
 db().monster_behavior_system={version:REV,release:RELEASE,profiles:profiles.length,unique_monster_signatures:profiles.length,special_skills:skills.length,rank_rules:{normal:"物種本能與棲地反應",elite:"低血量追加狂性解放",boss:"低血量追加領域轉相"},save_compatible:true};
 if(db().meta)db().meta.monster_behavior_revision=REV;return profiles
}
const PROFILES=attach(),BY_ID=new Map(PROFILES.map(x=>[x.id,x]));
function selected(){return battle()?.enemy||null}
function profile(e){return BY_ID.get(e?.monster_behavior_profile_id)||PROFILES.find(x=>x.monster_id===e?.id)||null}
function state(e){const b=battle();if(!b||!e)return null;b.monsterBehaviorState=b.monsterBehaviorState||{};const k=e.battleId||e.id,x=b.monsterBehaviorState[k]||(b.monsterBehaviorState[k]={turns:0,cooldowns:{},used:[]});for(const i of Object.keys(x.cooldowns))x.cooldowns[i]=Math.max(0,n(x.cooldowns[i])-1);return x}
function controlled(){return(battle()?.enemyStatuses||[]).some(x=>["sleep","paralysis","petrify","fear","confusion","charm"].includes(x?.id||x))}
function allies(){const g=game(),b=battle(),o=[];if(g?.character?.hp>0)o.push({kind:"player",unit:g.character,stats:typeof combatStats==="function"?combatStats():{}});for(const p of b?.party||[])if(p?.hp>0)o.push({kind:"party",unit:p,stats:p});if(b?.companion&&!b.companion.knockedOut&&b.companion.hp>0)o.push({kind:"companion",unit:b.companion,stats:b.companion});return o}
function targets(a){const o=allies();if(!o.length)return[];if(a.target==="all")return o;if(a.target==="companion"){const c=o.find(x=>x.kind==="companion");return c?[c]:[o[0]]}if(a.target==="lowest")return[o.slice().sort((x,y)=>(x.unit.hp/x.unit.maxHp)-(y.unit.hp/y.unit.maxHp))[0]];return[o.find(x=>x.kind==="player")||o[0]]}
function defense(t,magic){return n(t.stats?.[magic?"magicDefense":"defense"]||t.stats?.defense)}
function hit(e,t,a){const r=typeof rollD20==="function"?rollD20():1+Math.floor(Math.random()*20);return{roll:r,ok:r+Math.floor((n(e.accuracy,60)+n(a.acc)-n(t.stats?.evasion))/10)>=10}}
function damage(t,dmg,status,e,a){t.unit.hp=Math.max(0,n(t.unit.hp)-Math.round(dmg));if(!status)return;if(t.kind==="player"&&typeof applyPlayerStatus==="function")applyPlayerStatus(status,e,n(a.chance,45),n(a.rounds,2));else{t.unit.statusEffects=Array.isArray(t.unit.statusEffects)?t.unit.statusEffects:[];const old=t.unit.statusEffects.find(x=>(x.id||x)===status);if(old&&typeof old==="object")old.rounds=Math.max(n(old.rounds),n(a.rounds,2));else t.unit.statusEffects.push({id:status,rounds:n(a.rounds,2)})}}
function logSkill(a,t,d){const name=selected()?.name||"敵人",move=a.name.split("・").slice(1).join("・")||a.name;battleLog(name+"使出「"+move+"」"+(t.length>1?"，波及我方"+t.length+"個目標":"")+(d||"")+"。")}
function execute(e,p,a,st){
 const b=battle(),ts=targets(a),el=a.element;
 if(!ts.length)return false;
 if(a.kind==="stance"||a.kind==="phase"){e.enemyBuff=e.enemyBuff||{};e.enemyBuff.evasion=n(e.enemyBuff.evasion)+n(a.ev);e.enemyBuff.defense=n(e.enemyBuff.defense)+n(a.def);e.enemyBuff.magicDefense=n(e.enemyBuff.magicDefense)+n(a.mdef);if(a.pen)e.armorPenPct=n(e.armorPenPct)+n(a.pen);logSkill(a,[],a.kind==="phase"?"，進入新的戰鬥階段":"，改變自身姿態");return true}
 if(a.kind==="heal"){const q=Math.max(1,Math.round(n(e.maxHp)*n(a.heal,.1)));e.hp=Math.min(n(e.maxHp),n(e.hp)+q);logSkill(a,[],"，恢復"+q+" HP");return true}
 if(a.kind==="debuff"){b.enemyBuff=b.enemyBuff||{};b.enemyBuff.accuracy=n(b.enemyBuff.accuracy)-n(a.accDown);b.enemyBuff.evasion=n(b.enemyBuff.evasion)-n(a.evDown);logSkill(a,[],"，干擾我方戰線");return true}
 let total=0,hits=0;for(const t of ts){const q=hit(e,t,a);if(!q.ok)continue;let d=Math.max(1,Math.round(n(e.attack,1)*n(a.mult,1)-defense(t,a.magic)*.38));if(a.pen)d+=Math.round(n(e.attack)*n(a.pen)/100);if(el&&typeof applyElementDamage==="function"&&t.kind==="player")d=applyElementDamage(d,e,el);damage(t,d,a.status,e,a);total+=d;hits++}
 if(a.kind==="drain"&&hits){const q=Math.max(1,Math.round(total*n(a.heal,.15)));e.hp=Math.min(n(e.maxHp),n(e.hp)+q)}
 b.enemyBuff=b.enemyBuff||{};if(a.defDown)b.enemyBuff.defense=n(b.enemyBuff.defense)-n(a.defDown);if(a.accDown)b.enemyBuff.accuracy=n(b.enemyBuff.accuracy)-n(a.accDown);
 logSkill(a,ts,hits?"，造成"+total+"傷害"+(el?"／"+el:""):"，被我方閃避");return true
}
function choose(e,p,st){const bonus=rank(e)==="boss"?.92:rank(e)==="elite"?.70:.38;let list=(p.special_attacks||[]).filter(a=>!st.cooldowns[a.id]&&(!a.threshold||n(e.hp)/Math.max(1,n(e.maxHp))<=a.threshold));if(!list.length||Math.random()>bonus)return null;if(st.turns===0){const x=list.find(a=>a.id.startsWith(p.opening));if(x)return x}list.sort((a,b)=>n(b.threshold)-n(a.threshold)||n(a.cd)-n(b.cd));return list[(st.turns+st.used.length)%list.length]}
function finishTurn(e){const b=battle();if(!b)return;if(e.hp<=0){finishBattle("勝利");return}if(game()?.character?.hp<=0){if(typeof tryAutoRevive==="function"&&tryAutoRevive()){b.round++;persist();renderAll();return}finishBattle("戰敗");return}b.defending=false;if(typeof tickBattleEffects==="function")tickBattleEffects();b.round++;persist();renderAll()}
function patch(){
 if(typeof window==="undefined"||typeof window.enemyBattleTurn!=="function")return;
 const base=window.enemyBattleTurn;if(base.__monsterBehaviorDepth)return;
 const wrapped=function(){const e=selected(),p=profile(e),b=battle();if(!b?.active||!e||!p||controlled())return base.apply(this,arguments);const st=state(e),a=choose(e,p,st);st.turns++;if(!a)return base.apply(this,arguments);st.cooldowns[a.id]=Math.max(1,n(a.cd,2));st.used.push(a.id);if(st.used.length>8)st.used.shift();execute(e,p,a,st);finishTurn(e)};
 wrapped.__monsterBehaviorDepth=true;wrapped.__monsterBehaviorBase=base;window.enemyBattleTurn=wrapped;
 const oldStart=window.startBattle;if(typeof oldStart==="function"&&!oldStart.__monsterBehaviorStart){const start=function(monster,context){const r=oldStart.apply(this,arguments),b=battle();if(b?.active){b.monster_behavior_revision=REV;b.log.push(monster.name+"已載入物種行為："+(profile(monster)?.label||"地域本能")+"。");renderAll()}return r};start.__monsterBehaviorStart=true;window.startBattle=start}
}
patch();
function audit(){const ms=Array.isArray(db().monsters)?db().monsters:[],ps=Array.isArray(db().monster_behavior_profiles)?db().monster_behavior_profiles:[],issues=[];if(!ms.length)issues.push("怪物資料庫為空");if(ms.length!==ps.length)issues.push("行為簽章數量不一致");const ids=new Set();for(const p of ps){if(ids.has(p.id))issues.push("行為簽章重複:"+p.id);ids.add(p.id);if(!p.unique_key||!p.family||!Array.isArray(p.special_attacks)||p.special_attacks.length<2)issues.push("行為資料不完整:"+p.id);for(const a of p.special_attacks||[])if(!a.name||!a.kind||!n(a.cd))issues.push("專屬動作不完整:"+p.id)}for(const m of ms)if(!m.monster_behavior_profile_id||!m.special_attacks?.length)issues.push("怪物未掛接行為:"+m.id);const elite=ps.filter(x=>x.rank==="elite").length,boss=ps.filter(x=>x.rank==="boss").length;if(!elite||!boss)issues.push("菁英／Boss 行為缺失");return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{monsters:ms.length,profiles:ps.length,special_skills:db().monster_special_skills?.length||0,elite,boss,families:new Set(ps.map(x=>x.family_key)).size},save_compatible:true}}
globalThis.runMonsterBehaviorAudit=audit;
if(globalThis.QUNLU_CORE?.registerModule)globalThis.QUNLU_CORE.registerModule("src/monster-behavior-depth-v1.js",{domain:"runtime",revision:REV,release:RELEASE});
if(db()?.meta)db().meta.monster_behavior_revision=REV;
})();
