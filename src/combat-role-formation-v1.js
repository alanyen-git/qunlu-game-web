/* 群陸旅誌：六格戰場職業定位與技能實戰差異化
 * COMBAT-ROLE-FORMATION-1.0。增量資料／機制模組，不改職業ID或角色存檔格式。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.combat_classes)||!DB.skill_pools)return;
const REV="COMBAT-ROLE-FORMATION-1.0";
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const ATTACK=new Set(["physical","magic","hybrid"]);
const FACTOR={single:1,row:.82,column:.82,cross:.80,all:.59,random:.76};
const BALANCED={single:1,row:.82,column:.82,cross:.73,all:.53,random:.70};
const PATTERN_LABEL={single:"單體",row:"同一行",column:"同一列",cross:"十字",all:"全體",random:"隨機連擊"};
const POS_LABEL={front:"前排",back:"後排",flex:"彈性站位"};
const P={
 guardian:["守護前衛","front",["single","row","row","cross"],"先承傷並守住同伴所在行","格擋後迎擊／群體護盾","治療者與後排法師","射程有限；被繞後容易失去護衛效率"],
 heavy:["重裝破陣","front",["single","row","column","cross"],"承受第一波攻擊後破甲","破防後以重擊壓制一行或十字敵人","長槍、範圍術士","行動較慢，無法持續追擊"],
 berserker:["狂戰收割","front",["single","row","random","cross"],"犧牲部分防守換取破勢","對殘血目標觸發處決","護衛與戰地治療","連續受擊與長時間作戰風險高"],
 duelist:["決鬥劍士","flex",["single","row","single","row"],"讀勢後優先鎖定高威脅個體","短窗口連段與破綻追擊","控場法師","被多名敵人包圍時效率下降"],
 lancer:["長兵控線","front",["single","column","column","row"],"迎擊穿透敵人同一列","破甲後控制敵方進攻線","盾衛與弓手","敵人貼身或頻繁換列時受限"],
 sniper:["定點狙擊","back",["single","column","single","column"],"專注觀察並精確點殺","高命中狙擊與穿透後列","斥候與破防隊友","移動戰和貼身戰較弱"],
 marksman:["遠程火力","back",["single","column","random","row"],"遠程壓低關鍵敵人血線","貫穿與多重箭覆蓋敵陣","前衛與標記型遊俠","被貼身後需要掩護"],
 hunter:["獵物追蹤","back",["single","row","random","single"],"偵查、設陷阱並鎖定獵物","伏擊後追獵同一目標","前衛與斥候","換目標需要重建節奏"],
 ranger:["機動游擊","flex",["single","row","random","cross"],"維持移動並牽制敵方","攻擊後轉移並削弱敵方陣形","盾衛與控場者","被持續壓制時不易拉開距離"],
 scout:["情報先鋒","flex",["single","column","random","row"],"首回合識破敵人並先手","先攻伏擊與弱點指示","狙擊手與戰術學者","正面持久輸出有限"],
 trapper:["地形控場","back",["single","cross","column","row"],"預置陷阱改變敵方進攻路線","觸發陷阱後形成追加攻擊","槍士與範圍法師","無準備的近距離遭遇較弱"],
 assassin:["單點處決","flex",["single","random","single","column"],"利用先手與錯位切入","背襲、毒刃與低血處決","斥候與控場者","失去先手後難以正面承傷"],
 skirmisher:["高速連段","flex",["single","row","random","cross"],"持續變換攻擊方向與距離","連段後以閃避脫離","盾衛與增益支援","單擊破甲能力有限"],
 monk:["連段調息","front",["single","row","random","cross"],"貼身打出連段並保持架勢","多段攻擊與調息回復體力","治療者與控場者","超遠距離對手不易處理"],
 healer:["後排生命支援","back",["single","row","single","column"],"救急、解除控制並維持全隊血線","傷者優先治療／治療波／全體回復","盾衛與召喚前衛","獨自承擔火力時風險高"],
 battle_healer:["戰線醫護","front",["single","row","single","cross"],"在近戰間隙為前線補血","擊退敵人並立即支援傷者","盾衛與狂戰士","魔力與體力需同時管理"],
 paladin:["誓約聖武","front",["single","row","single","cross"],"武器制裁與守護交錯","攻擊後取得守勢，兼顧支援","治療者與後排法師","單一攻防專精低於純職"],
 support:["戰場指揮","back",["single","column","row","all"],"先分析情勢再調整隊伍節奏","下一招強化、全隊鼓舞或克制敵術","各種專精輸出職","需要隊友接續才能發揮最大效益"],
 summoner:["契約召喚","back",["single","row","random","all"],"先建立召喚物和安全空間","召喚追擊連段與全域魔力壓制","盾衛與治療者","召喚遭壓制時本體較脆弱"],
 fire:["十字火力","back",["single","cross","random","all"],"先讓敵人聚集再施放十字火術","燃燒削弱命中後全體清場","束縛與挑釁型前衛","魔耗高；火抗敵人不利"],
 storm:["連鎖術士","back",["single","row","random","all"],"用先手建立雷風連鎖","亂數連鎖攻擊可重複同一目標","先攻斥候與魔力支援","爆發後須管理魔力"],
 frost:["區域封鎖","back",["single","cross","column","all"],"降低敵人閃避後控制行列","寒冰十字與大範圍緩速","長槍與遠程火力","遇到高抗性敵人需切換戰術"],
 geo:["壁壘法術","flex",["single","row","column","all"],"護體後以地形控制敵陣","護盾、破勢與大地範圍術","前衛與爆發職","施法速度較低"],
 curse:["削弱汲取","back",["single","row","single","all"],"先詛咒敵方再汲取生命","削弱防禦並回復自身","召喚師與後排輸出","異常免疫目標較難壓制"],
 controller:["干擾先手","back",["single","cross","column","all"],"預兆、幻象或破法製造窗口","控制敵方，讓隊友取得先攻","高爆發單體職","自身即時傷害較低"],
 mage:["奧術炮擊","back",["single","cross","random","all"],"護盾與法術交替","單點破法後轉範圍輸出","護衛、控場者","貼身戰與資源消耗較弱"],
 spellblade:["魔武破綻","flex",["single","row","random","cross"],"武器命中後附刃施術","物魔混傷、附刃與破甲","盾衛與元素法師","裝備與雙資源門檻較高"]
};
function roleFor(c){
 const f=String(c.combat_identity?.family||""),n=String(c.name||"");
 if(/聖盾守護|盾衛/.test(f))return"guardian";
 if(/重裝前衛/.test(f))return"heavy";
 if(/狂戰/.test(f))return"berserker";
 if(/長槍/.test(f))return"lancer";
 if(/東方刃術|角鬥/.test(f))return"duelist";
 if(/長弓/.test(f))return"sniper";
 if(/弓術/.test(f))return"marksman";
 if(/獵人/.test(f))return"hunter";
 if(/機關獵手|戰鬥鍊金/.test(f))return"trapper";
 if(/斥候/.test(f))return"scout";
 if(/遊俠|巡林/.test(f))return"ranger";
 if(/影刃|刺客/.test(f))return"assassin";
 if(/雙持|掠擊|游擊刃|投擲刃|戰舞/.test(f))return"skirmisher";
 if(/武僧/.test(f))return"monk";
 if(/戰地療術|聖療|白魔導/.test(f))return"healer";
 if(/戰禱/.test(f))return"battle_healer";
 if(/聖武|影騎/.test(f))return"paladin";
 if(/戰歌|戰術|時序|星象/.test(f))return"support";
 if(/審判|驅魔|幻術/.test(f))return"controller";
 if(/精靈契約|龍契|召喚|祖靈|自然術|死靈/.test(f))return"summoner";
 if(/火元素/.test(f))return"fire";
 if(/雷元素|風元素/.test(f))return"storm";
 if(/寒冰|水元素/.test(f))return"frost";
 if(/地元素/.test(f))return"geo";
 if(/咒術|血術/.test(f))return"curse";
 if(/魔武|龍脈|魔弓|秘紋|紅魔導/.test(f))return"spellblade";
 if(/奧術|泛元素/.test(f))return"mage";
 if(/騎士|守護|盾/.test(n))return"guardian";
 if(/弓|弩/.test(n))return"marksman";
 if(/槍|矛/.test(n))return"lancer";
 if(/刺客|盜賊/.test(n))return"assassin";
 return c.combat_track==="magic"?"mage":c.combat_track==="hybrid"?"spellblade":"duelist"
}
function add(m,t){if(!m.traits.includes(t))m.traits.push(t)}
function mechanics(s){const source=typeof globalThis.skillMechanicsFor==="function"?globalThis.skillMechanicsFor(s):s.mechanics;const m=source?JSON.parse(JSON.stringify(source)):{profile:"role",traits:[]};if(!Array.isArray(m.traits))m.traits=[];return m}
function enrichAttack(s,role){
 const r=TIER[s.tier]||0,m=mechanics(s);
 if(role==="guardian"||role==="paladin"){add(m,"guard_strike");m.guard_after_hit=true}
 if(role==="heavy"||role==="berserker"||role==="lancer"||role==="trapper"){add(m,"guard_break");m.penetration_bonus_pct=Math.max(Number(m.penetration_bonus_pct||0),5+r*2);m.defense_shred=Math.max(Number(m.defense_shred||0),1+Math.ceil(r/2))}
 if(role==="berserker"||role==="assassin"){add(m,"execute");m.execute_threshold_pct=Math.max(Number(m.execute_threshold_pct||0),35);m.execute_bonus_pct=Math.max(Number(m.execute_bonus_pct||0),18+r*3)}
 if(role==="assassin"||role==="hunter"||role==="scout"||role==="sniper"||role==="duelist"){add(m,"opener");m.opener_bonus_pct=Math.max(Number(m.opener_bonus_pct||0),14+r*2)}
 if(role==="duelist"||role==="skirmisher"||role==="monk"){add(m,"combo");m.combo_bonus_pct=Math.max(Number(m.combo_bonus_pct||0),4+r);m.combo_cap=Math.max(Number(m.combo_cap||0),3)}
 if(role==="monk"){add(m,"multi_hit");m.hits=Math.max(Number(m.hits||0),3);m.damage_multiplier=Math.min(Number(m.damage_multiplier||1),.94);m.defense_coefficient=Math.min(Number(m.defense_coefficient||.42),.32)}
 if(role==="marksman"||role==="sniper"||role==="scout"){add(m,"precision");m.accuracy_bonus=Math.max(Number(m.accuracy_bonus||0),3+r);m.crit_bonus=Math.max(Number(m.crit_bonus||0),2+r)}
 if(role==="ranger"||role==="skirmisher"){add(m,"mobile");m.post_evasion=Math.max(Number(m.post_evasion||0),2+r)}
 if(role==="hunter"||role==="trapper"){add(m,"delayed_trap");m.trap_followup_pct=Math.max(Number(m.trap_followup_pct||0),32+r*4);m.damage_multiplier=Math.min(Number(m.damage_multiplier||1),.92)}
 if(role==="summoner"){add(m,"summon_echo");m.echo_pct=Math.max(Number(m.echo_pct||0),14+r*3)}
 if(role==="fire"){add(m,"searing");m.searing_accuracy_penalty=Math.max(Number(m.searing_accuracy_penalty||0),1+Math.floor(r/2))}
 if(role==="frost"){add(m,"chilling");m.chill_evasion_penalty=Math.max(Number(m.chill_evasion_penalty||0),1+Math.floor(r/2))}
 if(role==="storm"){add(m,"surge");m.surge_crit_bonus=Math.max(Number(m.surge_crit_bonus||0),2+Math.floor(r/2))}
 if(role==="curse"){add(m,"drain");m.drain_pct=Math.max(Number(m.drain_pct||0),10+r*2)}
 if(role==="controller"||role==="support"){add(m,"guard_break");m.penetration_bonus_pct=Math.max(Number(m.penetration_bonus_pct||0),3+r)}
 if(role==="mage"||role==="spellblade"||role==="geo"||role==="fire"||role==="storm"||role==="frost"){if(s.element){add(m,"elemental_focus");m.weakness_bonus_pct=Math.max(Number(m.weakness_bonus_pct||0),7+r*2)}}
 if(role==="spellblade"){m.penetration_bonus_pct=Math.max(Number(m.penetration_bonus_pct||0),3+r)}
 if(role==="geo"){m.guard_after_hit=true;add(m,"guard_strike")}
 if(role==="healer"){add(m,"sanctified");m.controlled_target_bonus_pct=Math.max(Number(m.controlled_target_bonus_pct||0),6+r*2)}
 if(role==="battle_healer"){add(m,"guard_strike");m.guard_after_hit=true}
 if(role==="mage"){add(m,"arcane_pressure");m.penetration_bonus_pct=Math.max(Number(m.penetration_bonus_pct||0),3+r);m.resource_refund_on_hit=Math.max(Number(m.resource_refund_on_hit||0),1)}
 if(role==="spellblade"){add(m,"hybrid_balance");m.penetration_bonus_pct=Math.max(Number(m.penetration_bonus_pct||0),3+r)}
 m.class_role=role;m.class_role_revision=REV;s.mechanics=m
}
function enrichUtility(s,role){
 const r=TIER[s.tier]||0,m=mechanics(s);
 if(s.damage_type==="heal"){
  m.missing_hp_heal_pct=Math.max(Number(m.missing_hp_heal_pct||0),role==="healer"?8+r*2:5+r);
  if(s.target_pattern==="all_allies"){add(m,"group_heal");m.group_heal_ratio=Math.min(1,Math.max(.72,Number(m.group_heal_ratio||0)))}
 }else if(s.damage_type==="buff"){
  if(["guardian","heavy","paladin","geo","battle_healer"].includes(role)){add(m,"barrier_stance");m.guard_stance=true}
  if(["guardian","lancer","duelist","battle_healer"].includes(role)){add(m,"counter_stance");m.counter_power_pct=Math.max(Number(m.counter_power_pct||0),36+r*5)}
  if(["hunter","trapper","ranger"].includes(role)){add(m,"trap");m.trap_power_pct=Math.max(Number(m.trap_power_pct||0),38+r*4);m.trap_status=m.trap_status||"slow";m.trap_status_chance=Math.max(Number(m.trap_status_chance||0),40+r*3)}
  if(["support","summoner","paladin","healer"].includes(role)){add(m,"party_aura");m.party_aura=Math.max(Number(m.party_aura||0),1+Math.floor(r/2))}
  if(["sniper","marksman","scout","mage","fire","storm","frost","controller","spellblade"].includes(role)){add(m,"focus");m.next_skill_accuracy=Math.max(Number(m.next_skill_accuracy||0),3+r);m.next_skill_damage_pct=Math.max(Number(m.next_skill_damage_pct||0),4+r)}
  if(["monk","berserker"].includes(role)){add(m,"resource_recovery");m.resource_recovery_pct=Math.max(Number(m.resource_recovery_pct||0),5+r)}
  if(["skirmisher","assassin"].includes(role)){add(m,"mobility_stance");m.temporary_evasion=Math.max(Number(m.temporary_evasion||0),2+r);m.next_opener=true}
 }
 m.class_role=role;m.class_role_revision=REV;s.mechanics=m
}
function tacticalSkillText(c,s,p){
 const stat=s.damage_type==="magic"?"魔攻":s.damage_type==="hybrid"?"物魔混攻":"物攻";
 return s.name+"："+PATTERN_LABEL[p]+"型，"+Math.round(Number(s.base_power_percent||0))+"%"+stat+"；"+P[roleFor(c)][4]+"。"
}
function decorateClass(c){
 const role=roleFor(c),cfg=P[role],ci=c.combat_identity||(c.combat_identity={family:c.name,signature:c.name,mechanic_tags:[],strengths:[],tradeoffs:[]});
 ci.formation_role=cfg[0];ci.battlefield_position=POS_LABEL[cfg[1]];
 ci.preferred_target_patterns=[...new Set(cfg[2])];
 ci.formation_opening=cfg[3];ci.formation_signature=cfg[4];ci.team_synergy=cfg[5];ci.formation_weakness=cfg[6];
 ci.formation_role_id=role;ci.formation_revision=REV;
 c.combat_role_formation={role,position:cfg[1],attack_patterns:{E:cfg[2][0],D:cfg[2][1],C:cfg[2][2],B:cfg[2][3]},revision:REV};
 const pool=DB.skill_pools[c.id]||[];let changed=0;
 for(const s of pool){
  if(!s||!ATTACK.has(s.damage_type)&&s.damage_type!=="heal"&&s.damage_type!=="buff"&&s.damage_type!=="cleanse"&&s.damage_type!=="debuff")continue;
  const atk=s.id&&s.id.startsWith("SK-CTSE-"+c.id+"-")&&/-([EDCB])-A$/.test(s.id);
  const util=s.id&&s.id.startsWith("SK-CTSE-"+c.id+"-")&&/-([EDCB])-U$/.test(s.id);
  const starter=s.tier==="F"&&s.class_signature&&ATTACK.has(s.damage_type);
  if(atk){
   const grade=s.id.match(/-([EDCB])-A$/)[1],idx=({E:0,D:1,C:2,B:3})[grade],next=cfg[2][idx],prev=s.target_pattern||"single";
   if(prev!==next){
    const original=Number(s.base_power_percent||100);
    s.base_power_percent=Math.min(({E:144,D:174,C:198,B:225})[grade],Math.max(60,Math.round(original*(BALANCED[next]||1)/(FACTOR[prev]||1))));
    s.target_pattern=next;
   }
   if(next==="random"){s.target_count=grade==="B"?4:3;s.allow_repeat=true}else{delete s.target_count;delete s.allow_repeat}
   s.role_signature=c.name+"／"+cfg[0];s.effect_text=tacticalSkillText(c,s,s.target_pattern);s.desc=s.effect_text;
   enrichAttack(s,role);changed++;
  }else if(util){
   s.role_signature=c.name+"／"+cfg[0];
   s.effect_text=String(s.effect_text||s.desc||s.name).split("｜本職定位：")[0]+"｜本職定位："+cfg[0]+"；"+cfg[4];
   s.desc=s.effect_text;
   if(role==="guardian"&&s.tier==="B"&&s.damage_type==="buff"){s.target_pattern="ally_row";s.target_side="ally";s.target="ally";s.effect_text="為選定我方同一行建立高階護盾；"+cfg[4];s.desc=s.effect_text}
   enrichUtility(s,role);changed++;
  }else if(starter){
   s.role_signature=c.name+"／"+cfg[0];enrichAttack(s,role);changed++;
  }
 }
 return changed
}
const updated=DB.combat_classes.reduce((count,c)=>count+decorateClass(c),0);
const source=new Map();
for(const [cid,pool] of Object.entries(DB.skill_pools))for(const s of pool||[])if(s?.combat_formation_revision||s?.role_signature){
 const id=String(s.canonical_skill_id||s.id||"");if(id)source.set(id,s);
 source.set(cid+"|"+s.name+"|"+s.tier,s)
}
function syncLearned(){
 const ch=typeof G!=="undefined"?G?.character:null;if(!Array.isArray(ch?.skills))return 0;
 let n=0;
 for(const s of ch.skills){
  const src=source.get(String(s.canonical_skill_id||s.id||""))||source.get(String(s.source_class||ch.classId||"")+"|"+s.name+"|"+s.tier);
  if(!src)continue;
  for(const key of ["target_pattern","target_count","allow_repeat","base_power_percent","effect_text","desc","role_signature","mechanics"]){
   if(src[key]===undefined){if(["target_count","allow_repeat"].includes(key)&&s[key]!==undefined){delete s[key];n++}continue}
   const next=JSON.stringify(src[key]);if(JSON.stringify(s[key])!==next){s[key]=JSON.parse(next);n++}
  }
 }
 return n
}
function description(ci){return"定位："+ci.formation_role+"／"+ci.battlefield_position+"；進場："+ci.formation_opening+"；招牌："+ci.formation_signature+"；隊友配合："+ci.team_synergy+"；弱點："+ci.formation_weakness}
function creationInfo(){
 if(typeof document==="undefined")return;
 const c=DB.combat_classes.find(x=>x.id===(typeof creation!=="undefined"?creation?.classId:undefined));if(!c)return;
 const parent=document.querySelector("#classResult")?.parentElement;if(!parent)return;
 let node=document.querySelector("#classFormationPreview");
 if(!node){node=document.createElement("div");node.id="classFormationPreview";node.className="small";parent.appendChild(node)}
 node.textContent=description(c.combat_identity)
}
function characterInfo(){
 if(typeof document==="undefined")return;
 const ci=DB.combat_classes.find(c=>c.id===(typeof G!=="undefined"?G?.character?.classId:null))?.combat_identity;
 const card=document.querySelector(".class-identity-card");if(!card||!ci)return;
 let node=card.querySelector("[data-combat-formation]");
 if(!node){node=document.createElement("div");node.className="small";node.dataset.combatFormation="1";card.appendChild(node)}
 node.textContent=description(ci)+"；適用範圍："+ci.preferred_target_patterns.map(x=>PATTERN_LABEL[x]).join("／")
}
function patchUI(){
 if(typeof globalThis.showClassSelect==="function"){const old=globalThis.showClassSelect;globalThis.showClassSelect=function(){
  const r=old.apply(this,arguments);if(typeof document!=="undefined")for(const b of document.querySelectorAll("#classSelectBox button")){
   const id=(b.getAttribute("onclick")||"").match(/selectClass\('([^']+)'\)/)?.[1],c=DB.combat_classes.find(x=>x.id===id);
   if(c){b.title=description(c.combat_identity);b.setAttribute("aria-label",c.name+"，"+c.combat_identity.formation_role+"，"+c.combat_identity.battlefield_position)}
  }return r
 }}
 for(const name of ["selectClass","rollClass"]){const old=globalThis[name];if(typeof old==="function")globalThis[name]=function(){const r=old.apply(this,arguments);creationInfo();return r}}
 if(typeof globalThis.openCharacter==="function"){const old=globalThis.openCharacter;globalThis.openCharacter=function(){const r=old.apply(this,arguments);characterInfo();return r}}
 if(typeof globalThis.createCharacter==="function"){const old=globalThis.createCharacter;globalThis.createCharacter=function(){const r=old.apply(this,arguments);if(syncLearned())globalThis.persist?.();return r}}
 if(typeof globalThis.startBattle==="function"){const old=globalThis.startBattle;globalThis.startBattle=function(){syncLearned();return old.apply(this,arguments)}}
 if(typeof globalThis.migrateSave==="function"){const old=globalThis.migrateSave;globalThis.migrateSave=function(){const r=old.apply(this,arguments);syncLearned();return r}}
}
function audit(){
 const issues=[],roles={},patterns={};
 for(const c of DB.combat_classes){
  const ci=c.combat_identity,r=c.combat_role_formation;if(!ci?.formation_role||!r)issues.push(c.id+":缺少戰場定位");
  roles[r?.role]=(roles[r?.role]||0)+1;
  for(const s of (DB.skill_pools[c.id]||[]).filter(s=>String(s?.id||"").startsWith("SK-CTSE-"+c.id+"-")&&/-([EDCB])-A$/.test(s.id))){
   if(!PATTERN_LABEL[s.target_pattern])issues.push(s.id+":攻擊範圍無效");
   if(!s.mechanics?.class_role)issues.push(s.id+":招牌機制未接入");
   if(s.target_pattern==="random"&&(!Number.isFinite(Number(s.target_count))||s.target_count<1))issues.push(s.id+":連擊次數無效");
   if(Number(s.base_power_percent)<=0)issues.push(s.id+":倍率無效");
   patterns[s.target_pattern]=(patterns[s.target_pattern]||0)+1
  }
  if(!r?.attack_patterns?.B)issues.push(c.id+":缺B級戰術譜系");
 }
 return{revision:REV,pass:issues.length===0,issues,stats:{classes:DB.combat_classes.length,skills_enriched:updated,roles,attack_patterns:patterns},save_compatible:true}
}
DB.meta=DB.meta||{};DB.meta.combat_role_formation_revision=REV;
DB.combat_role_formation_system={version:REV,formation:"敵方2×3、我方每行2人",roles:Object.keys(P),signature_skill_grades:["E","D","C","B"],skill_records_updated:updated,save_compatible:true};
for(const ai of DB.management_ai||[])if(ai?.id==="AI-CLASS"||ai?.id==="AI-SKILL"){
 ai.inputs=[...new Set([...(ai.inputs||[]),REV,"六格戰場職業定位、實戰招牌機制與E～B範圍配置"])];
 ai.validations=[...new Set([...(ai.validations||[]),"每個正規戰鬥職業須有前／後／彈性站位、核心循環、同伴配合及明確代價。","範圍技能按每目標威力折算；隨機連擊只花一次資源且符合D20規則。","職業招牌技能須連結可執行的戰鬥機制，升階考核與已學技能XP不可重設。"])];
}
patchUI();
globalThis.runCombatRoleFormationAudit=audit;
globalThis.QUNLU_COMBAT_ROLE_FORMATION={revision:REV,roleFor,syncLearned,audit};
globalThis.QUNLU_CORE?.registerModule?.("src/combat-role-formation-v1.js",{domain:"progression",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.8"});
})();