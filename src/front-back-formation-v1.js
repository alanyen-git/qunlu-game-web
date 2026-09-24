/* 群陸旅誌｜前後排攻防、守衛援護、冒險團隊形 FRONT-BACK-FORMATION-1.0
 * 採用既有六敵人名單與隊友UID；只在現有冒險團增加選填 formationPositions。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const REV="FRONT-BACK-FORMATION-1.0",CAP=3;
const LABEL={front:"前排",back:"後排"};
const S=()=>typeof G!=="undefined"?G:null;
const alive=x=>!!x&&Number(x.hp)>0&&!x.knockedOut;
const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function party(){return S()?.character?.adventureParty||null}
function preferredPlayer(){
 const cid=S()?.character?.classId;
 const cls=(DB.combat_classes||[]).find(x=>x.id===cid);
 const pos=cls?.combat_role_formation?.position;
 return pos==="back"?"back":pos==="front"?"front":rangedWeapon()?"back":"front"
}
function rangedWeapon(){
 let w=null;
 try{w=typeof mainWeaponData==="function"?mainWeaponData():null}catch(error){}
 const p=w?.weapon_profile||{},group=String(p.group||w?.name||"");
 return /弓|弩|投擲|飛刀|火槍|銃/.test(group)||Number(p.range||0)>=3.5&&/射|遠程|投/.test(group)
}
function activePet(){
 try{const p=typeof activeCompanionInstance==="function"?activeCompanionInstance():null;
 if(!p)return null;const s=typeof companionSpecies==="function"?companionSpecies(p.speciesId):null;
 return {key:"companion",name:s?.name||"出戰夥伴",role:s?.ai_profile||"assault",preferred:["guardian","assault","legend"].includes(s?.ai_profile)?"front":"back"}}
 catch(error){return null}
}
function members(){
 const c=S()?.character;if(!c)return[];
 const rows=[{key:"self",name:c.name||"角色",role:"player",preferred:preferredPlayer()}];
 for(const m of party()?.members||[]){
  const t=(DB.party_member_templates||[]).find(x=>x.id===m.templateId);
  rows.push({key:"party:"+m.uid,name:t?.name||"隊友",role:t?.role||"frontline",preferred:["tank","frontline","hybrid"].includes(t?.role)?"front":"back"})
 }
 const pet=activePet();if(pet)rows.push(pet);
 return rows
}
function assign(rows,remembered={}){
 const slots={},count={front:0,back:0};
 const ordered=[...rows].sort((a,b)=>Number(!!remembered[b.key])-Number(!!remembered[a.key]));
 for(const r of ordered){
  const want=["front","back"].includes(remembered[r.key])?remembered[r.key]:r.preferred;
  const position=count[want]<CAP?want:(want==="front"?"back":"front");
  slots[r.key]=position;count[position]++
 }
 if(count.front===0&&rows.length){const first=rows.find(x=>x.preferred==="front")||rows[0];slots[first.key]="front"}
 return slots
}
function positions(){
 const p=party();return assign(members(),p?.formationPositions||{})
}
function saveFormation(key,pos){
 const p=party();if(!p||!["front","back"].includes(pos))return false;
 const rows=members(),entry=rows.find(x=>x.key===key);if(!entry)return false;
 const current=positions(),old=current[key];if(old===pos)return true;
 if(old==="front"&&Object.values(current).filter(x=>x==="front").length===1){
  if(typeof alert==="function")alert("前排至少需要一名成員；請先將其他成員移至前排。");
  return false
 }
 const target=rows.filter(x=>current[x.key]===pos&&x.key!==key);
 if(target.length>=CAP){
  const swap=target.find(x=>x.key!=="self")||target[0];
  if(swap)current[swap.key]=old
 }
 current[key]=pos;p.formationPositions=current;
 if(typeof persist==="function")persist();
 openPartyFormation();return true
}
function initBattle(b){
 if(!b||!b.active)return b;
 const remembered=positions(),rows=[{key:"self",preferred:preferredPlayer()},...(b.party||[]).map(m=>({key:"party:"+m.uid,preferred:["tank","frontline","hybrid"].includes(m.role)?"front":"back"})),...(b.companion?[{key:"companion",preferred:["guardian","assault","legend"].includes(b.companion.ai)?"front":"back"}]:[])];
 b.formationPositions=assign(rows,remembered);b.formationRevision=REV;return b
}
function setup(){
 const b=S()?.battle;if(b?.active&&(!b.formationPositions||b.formationRevision!==REV))initBattle(b);
 return b
}
function rowOf(key){
 const b=setup();if(!b)return"front";
 return b.formationPositions?.[key]||"front"
}
function enemyRow(target){
 const b=setup(),enemies=b?.enemies||[b?.enemy].filter(Boolean);
 const idx=enemies.findIndex(x=>x===target||x?.battleId===target?.battleId);
 return idx>=CAP?"back":"front"
}
function frontEnemies(){
 const b=setup();return(b?.enemies||[b?.enemy].filter(Boolean)).slice(0,CAP).filter(alive)
}
function weaponCanReachRear(actor,skill,magicOverride=false){
 if(magicOverride||skill?.damage_type==="magic"||skill?.scaling_stat==="magic"||skill?.resource==="mana"&&skill?.damage_type!=="physical")return true;
 const traits=skill?.mechanics?.traits||[];
 if(skill?.ignore_frontline===true||skill?.pierce_frontline===true||skill?.rear_access===true)return true;
 if(traits.some(x=>["backline_access","pierce_frontline","flank","teleport_strike","ranged_projectile"].includes(x)))return true;
 if(/劍氣|飛刃|背襲|突襲|穿刺|瞬身|閃襲|跳斬|破陣|衝鋒|投擲|投射|遠擊|箭|矢|狙擊|槍彈/.test(String(skill?.name||"")))return true;
 if(actor==="player")return rangedWeapon();
 if(actor?.role)return["ranged","caster","healer","support"].includes(actor.role)||(actor.role==="scout"&&/弓|弩/.test(actor.weapon||""));
 if(actor?.ai)return["caster","support","legend"].includes(actor.ai);
 return Number(actor?.range||0)>=3.5||/法師|術士|射手|弓|巫|魔導|弩/.test(String(actor?.category||actor?.name||""))
}
function canPlayerHit(skill,target){
 if(!alive(target))return false;
 if(enemyRow(target)!=="back"||!frontEnemies().length)return true;
 return weaponCanReachRear("player",skill)
}
function playerTargets(skill){
 const b=setup(),all=(b?.enemies||[b?.enemy].filter(Boolean)).filter(alive);
 return all.filter(e=>canPlayerHit(skill,e))
}
function filterEnemyTargets(enemy,targets){
 const b=setup();if(!b)return targets;
 const rows=targets.map(x=>({entry:x,key:x.type==="player"?"self":x.type==="companion"?"companion":"party:"+(x.unit?.uid||"")}));
 const front=rows.filter(x=>rowOf(x.key)==="front"&&(x.key==="self"?alive(S()?.character):alive(x.entry.unit)));
 if(!front.length||weaponCanReachRear(enemy))return targets;
 return front.map(x=>x.entry)
}
function interceptEnemyAttack(pick,enemy){
 if(!pick||!weaponCanReachRear(enemy))return pick;
 const b=setup(),key=pick.type==="player"?"self":pick.type==="companion"?"companion":"party:"+(pick.unit?.uid||"");
 if(rowOf(key)!=="back")return pick;
 if(rowOf("self")==="front"&&alive(S()?.character)&&b.playerCover){
  b.playerCover=false;if(typeof battleLog==="function")battleLog(S().character.name+"施展援護，替後排承受攻擊。");
  return{type:"player",weight:999}
 }
 const unit=(b.party||[]).find(x=>rowOf("party:"+x.uid)==="front"&&alive(x)&&x.guarding);
 if(unit){unit.guarding=false;if(typeof battleLog==="function")battleLog(unit.name+"援護後排，攔截來襲攻擊。");return{type:"party",unit,weight:999}}
 if(rowOf("companion")==="front"&&alive(b.companion)&&b.companion.guarding){
  b.companion.guarding=false;if(typeof battleLog==="function")battleLog(b.companion.name+"守護後排，攔截來襲攻擊。");
  return{type:"companion",unit:b.companion,weight:999}
 }
 return pick
}
function chooseAllyEnemy(actor,current,magic=false){
 const b=setup(),all=(b?.enemies||[b?.enemy].filter(Boolean)).filter(alive);
 if(!all.length)return null;
 const choices=weaponCanReachRear(actor,null,magic)?all:all.filter(e=>enemyRow(e)==="front"||!frontEnemies().length);
 // 只回傳AI合法目標，絕不覆寫敵方當前行動者或玩家選定的目標。
 return choices.find(e=>e===current||e.battleId===current?.battleId)||choices[0]||null
}
function activateGuardSkill(skill){
 const b=setup();if(!b||rowOf("self")!=="front"||skill?.damage_type!=="buff")return;
 const traits=skill?.mechanics?.traits||[];
 if(/援護|守衛|盾牆|護衛|守護|堅守/.test(String(skill?.name||""))||traits.some(x=>["barrier_stance","guard_stance","party_guard"].includes(x))){
  b.playerCover=true;if(typeof battleLog==="function")battleLog("前排守護啟動：可攔截下一次攻擊後排的單體遠程傷害。")
 }
}
function block(message){
 if(typeof battleLog==="function")battleLog(message||"敵方前排仍在，近戰不能越過前排攻擊後排。");
 if(typeof renderAll==="function")renderAll()
}
function paint(){
 if(typeof document==="undefined")return;
 const b=setup(),head=document.querySelector(".battlehead");if(!b?.active||!head)return;
 const grid=head.querySelector(".battle-enemy-grid");
 if(grid){
  const cards=[...grid.querySelectorAll(".battle-enemy-card")];
  cards.forEach((card,i)=>{
   const e=b.enemies?.[i];if(!e)return;
   const row=i<CAP?"front":"back",blocked=row==="back"&&frontEnemies().length&&!weaponCanReachRear("player");
   card.classList.toggle("formation-rear-protected",!!blocked);
   card.setAttribute("aria-label",e.name+"，"+LABEL[row]+(blocked?"，目前近戰無法直接攻擊":""));
   card.insertAdjacentHTML("afterbegin",'<span class="formation-slot-label">'+LABEL[row]+(blocked?"・受前排保護":"")+"</span>")
  });
  if(!head.querySelector(".formation-enemy-label"))grid.insertAdjacentHTML("beforebegin",'<div class="small formation-enemy-label">敵方陣形：上列前排／下列後排；近戰需先突破敵方前衛。</div>')
 }
 const allies=head.querySelector(".battle-allies");
 if(allies&&!allies.querySelector(".formation-row")){
  const group={front:document.createElement("div"),back:document.createElement("div")};
  for(const pos of ["front","back"]){group[pos].className="formation-row formation-"+pos;
   group[pos].insertAdjacentHTML("afterbegin",'<div class="formation-row-title">'+LABEL[pos]+"</div>")}
  const units=[...allies.querySelectorAll(".battleunit")];
  units.forEach((node,i)=>{
   const key=node.classList.contains("player")?"self":node.classList.contains("companion")?"companion":"party:"+(b.party?.[Math.max(0,i-(b.companion?1:0)-1)]?.uid||"");
   // 依DOM類別分派，隊友索引獨立計算，避免帶寵物時錯列。
   const partyIndex=node.classList.contains("party-mini")?units.slice(0,i).filter(x=>x.classList.contains("party-mini")).length:-1;
   const realKey=partyIndex>=0?"party:"+(b.party?.[partyIndex]?.uid||""):key;
   const pos=rowOf(realKey);node.insertAdjacentHTML("afterbegin",'<span class="formation-slot-label">'+LABEL[pos]+"</span>");
   group[pos].appendChild(node)
  });
  allies.replaceChildren(group.front,group.back)
 }
}
function openPartyFormation(){
 const p=party();if(!p)return typeof openAdventureParty==="function"?openAdventureParty():null;
 const list=members(),layout=positions();
 const html=['<div class="card small">前後排各最多3個位置，前排至少保留一名成員。近戰無法越過存活前衛；遠程、魔法及明確的突襲技能可攻擊後排。守衛、援護可攔截後排受到的單體遠程攻擊。修改隊形不消耗回合。</div>'];
 for(const pos of ["front","back"]){
  html.push('<div class="formation-editor-group"><h3>'+LABEL[pos]+"（"+list.filter(x=>layout[x.key]===pos).length+"/"+CAP+"）</h3>");
  const here=list.filter(x=>layout[x.key]===pos);
  if(!here.length)html.push('<div class="card small">目前沒有成員。</div>');
  for(const x of here){
   const other=pos==="front"?"back":"front";
   html.push('<div class="card formation-editor-member"><b>'+esc(x.name)+'</b> <span class="small">'+esc(x.role)+"</span>"+
    '<button type="button" class="good" data-key="'+esc(x.key)+'" data-pos="'+other+'" onclick="setPartyFormationPosition(this.dataset.key,this.dataset.pos)">移至'+LABEL[other]+"</button></div>")
  }
  html.push("</div>")
 }
 html.push('<div class="actions"><button onclick="openAdventureParty()">返回冒險團</button></div>');
 if(typeof showModal==="function")showModal("冒險團・調整隊形",html.join(""))
}
function audit(){
 const issues=[],p=party(),keys=new Set(members().map(x=>x.key));
 if(p?.formationPositions)for(const [key,pos] of Object.entries(p.formationPositions)){
  if(keys.has(key)&&!LABEL[pos])issues.push("隊形站位無效:"+key)
 }
 const assigned=positions();
 if(members().length>0){
  for(const row of ["front","back"])if(Object.values(assigned).filter(x=>x===row).length>CAP)issues.push("隊形超出單排容量:"+row);
  if(!Object.values(assigned).includes("front"))issues.push("我方缺少前排")
 }
 const b=S()?.battle;
 if(b?.active&&Array.isArray(b.enemies)&&b.enemies.length>6)issues.push("敵方格數超出六格");
 return{version:REV,pass:issues.length===0,issues,front_cap:CAP,back_cap:CAP,save_compatible:true}
}
if(typeof globalThis.openAdventureParty==="function"){
 const original=globalThis.openAdventureParty;
 globalThis.openAdventureParty=function(){
  const out=original.apply(this,arguments),body=typeof document!=="undefined"?document.querySelector("#modalBody"):null;
  if(party()&&body&&!body.querySelector("[data-open-party-formation]"))body.insertAdjacentHTML("afterbegin",'<div class="actions formation-editor-entry"><button type="button" class="good" data-open-party-formation="1" onclick="openPartyFormation()">調整隊形・前後排</button></div>');
  return out
 }
}
if(typeof globalThis.battleGeneralAttack==="function"){
 const original=globalThis.battleGeneralAttack;
 globalThis.battleGeneralAttack=function(){
  const b=setup();if(b?.active&&!canPlayerHit(null,b.enemy)){block();return}
  return original.apply(this,arguments)
 }
}
if(typeof globalThis.battleUseSkill==="function"){
 const original=globalThis.battleUseSkill;
 globalThis.battleUseSkill=function(index,targetKey){
  const b=setup(),skill=S()?.character?.skills?.[index];
  if(b?.active&&skill&&!["heal","cleanse","buff"].includes(skill.damage_type)){
   const pattern=String(skill.target_pattern||"single");
   if(pattern==="single"&&!canPlayerHit(skill,b.enemy)){
    block();if(typeof battleSkillMenu==="function")battleSkillMenu();return
   }
   if(pattern!=="single"&&!playerTargets(skill).length){block();if(typeof battleSkillMenu==="function")battleSkillMenu();return}
  }
  return original.apply(this,arguments)
 }
}
if(typeof globalThis.startBattle==="function"){
 const original=globalThis.startBattle;
 globalThis.startBattle=function(){const result=original.apply(this,arguments);if(S()?.battle?.active){initBattle(S().battle);if(typeof persist==="function")persist()}return result}
}
if(typeof globalThis.renderBattle==="function"){
 const original=globalThis.renderBattle;
 globalThis.renderBattle=function(){const result=original.apply(this,arguments);paint();return result}
}
if(typeof globalThis.migrateSave==="function"){
 const original=globalThis.migrateSave;
 globalThis.migrateSave=function(){const out=original.apply(this,arguments);if(party())positions();return out}
}
DB.front_back_formation_system={version:REV,front_slots:CAP,back_slots:CAP,enemy_front_indices:[0,1,2],enemy_back_indices:[3,4,5],mechanics:["近戰禁止越過存活敵方前排","遠程與魔法可點選後排","守衛援護攔截遠程攻擊","隊友AI遵守敵方前衛","冒險團隊形依UID保存"],save_compatible:true};
DB.meta=DB.meta||{};DB.meta.front_back_formation_revision=REV;
for(const ai of DB.management_ai||[])if(["AI-CLASS","AI-SKILL"].includes(ai.id)){
 ai.inputs=[...new Set([...(ai.inputs||[]),REV,"前後排站位、武器射程與前衛掩護"])];
 ai.validations=[...new Set([...(ai.validations||[]),"近戰不得在敵方前排存活時直接攻擊後排。","前排守衛與援護只能攔截單體射擊／魔法，不能取代範圍護盾。","隊形變更需以隊友UID存檔且不重置技能熟練。"])]
}
globalThis.openPartyFormation=openPartyFormation;
globalThis.setPartyFormationPosition=saveFormation;
globalThis.runFrontBackFormationAudit=audit;
globalThis.QUNLU_FRONT_BACK_FORMATION={revision:REV,positions,initBattle,rowOf,enemyRow,frontEnemies,canPlayerHit,playerTargets,weaponCanReachRear,filterEnemyTargets,interceptEnemyAttack,chooseAllyEnemy,activateGuardSkill,audit};
globalThis.QUNLU_CORE?.registerModule?.("src/front-back-formation-v1.js",{domain:"survival",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.9"});
})();