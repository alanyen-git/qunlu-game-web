/* 群陸旅誌：技能機制深化 CURRENT-1.77.0
 * SKILL-MECHANICS-DEPTH-1.0
 * 讓技能差異進入實際戰鬥流程，而非只靠名稱與攻防百分比換皮。
 */
(()=>{
"use strict";

const REV="SKILL-MECHANICS-DEPTH-1.0";
const RELEASE=String(globalThis.QUNLU_RELEASE_VERSION||globalThis.DB?.meta?.current_version||"CURRENT-1.77.0");
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const ATTACK_TYPES=new Set(["physical","magic","hybrid"]);
const CONTROL_STATUSES=new Set(["slow","blind","sleep","paralysis","petrify","fear","confusion","charm","curse"]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clean=v=>String(v||"").trim();
const rank=s=>TIER[clean(s?.tier).toUpperCase()]??0;
const game=()=>{try{return typeof G!=="undefined"?G:null}catch(e){return null}};
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const pct=(v,min=0,max=100)=>Math.max(min,Math.min(max,num(v)));
const has=(text,re)=>re.test(String(text||""));
const skillText=s=>[s?.name,s?.base_name,s?.school,s?.family,(s?.weapon_requirements||[]).join(" ")].filter(Boolean).join(" ");

function allSkills(){
 const out=[];
 for(const pool of Object.values(DB.skill_pools||{}))for(const s of pool||[])out.push(s);
 for(const s of DB.shared_skills||[])out.push(s);
 return out
}
function canonicalKey(s){return clean(s?.canonical_skill_id)||[clean(s?.name),clean(s?.tier),clean(s?.source_class)].join("|")}
function isAttack(s){return ATTACK_TYPES.has(s?.damage_type)}
function activeKind(s){return (s?.display_type||s?.kind||"主動")!=="被動"}
function hitCount(text){
 if(/三連|三重|三段|三射/.test(text))return 3;
 if(/四連|四重|四段/.test(text))return 4;
 if(/二連|雙持|雙重|連擊|連刃|連射|連環|多重|箭雨|槍雨|軍勢|洪流|風暴|暴風雪|亂舞|劍舞|飛刃風暴|連鎖/.test(text))return 3;
 return 1
}
function attackMechanics(s){
 const text=skillText(s),r=rank(s),traits=[],m={version:REV,profile:"",traits};
 const add=t=>{if(!traits.includes(t))traits.push(t)};
 const hits=hitCount(text);
 if(hits>1){add("multi_hit");m.hits=Math.min(4,hits);m.damage_multiplier=Math.round((.93+Math.min(3,m.hits)*.01)*100)/100;m.defense_coefficient=.30}
 if(/背刺|伏擊|暗殺|突襲|偷襲|影襲|暗影步|幻影|隱形/.test(text)){add("opener");m.opener_bonus_pct=22+r*2;m.opener_pen_pct=4+r}
 if(/致命|終結|斬殺|處決|最後一搏|裁決|審判|天罰|死亡之觸/.test(text)){add("execute");m.execute_threshold_pct=35;m.execute_bonus_pct=24+r*2}
 if(/破甲|穿甲|穿透|貫穿|斷鋼|碎|崩|裂地|重擊|猛擊|震地|岩槍|石彈|大地震擊|魔導衝擊|爆裂|爆彈|酸液/.test(text)){add("guard_break");m.penetration_bonus_pct=6+r;m.defense_shred=1+Math.ceil((r+1)/2);m.defense_coefficient=Math.min(num(m.defense_coefficient,.42),.27)}
 if(/瞄準|狙擊|精準|一閃|突刺|刺$|飛刀|投擲|射擊|魔法飛彈|魔力飛彈|魔力箭|星光彈|次元箭/.test(text)||num(s?.accuracy)>=4){add("precision");m.accuracy_bonus=3+r;m.crit_bonus=4+r;m.defense_coefficient=Math.min(num(m.defense_coefficient,.42),.34);m.damage_multiplier=Math.min(num(m.damage_multiplier,1),.98)}
 if(/盾擊|守護打擊|反擊|迎擊|鐵壁|聖光盾擊/.test(text)||num(s?.defense)>0){add("guard_strike");m.guard_after_hit=true}
 if(/衝鋒|跳躍|旋身|迅擊|霞斬|月影|風雷|疾風|風刃|龍捲|星界斷空|暗影步/.test(text)){add("mobile");m.post_evasion=2+Math.min(5,r)}
 if(/吸取|汲取|血刃|鮮血|嗜血/.test(text)){add("drain");m.drain_pct=12+r*2}
 if(/召喚|軍勢|精靈|盟友|幼龍|龍群|骸骨|魔像/.test(text)){add("summon_echo");m.echo_pct=22+r*3}
 if(s?.status){add("status_mastery");m.status_chance_bonus=6+r*2;m.status_round_bonus=r>=3?1:0}
 if(s?.element){add("elemental_focus");m.weakness_bonus_pct=10+r*2}
 if(/火|炎|焰|隕火|灼熱/.test(text)&&!s?.status){add("searing");m.searing_accuracy_penalty=1+Math.floor(r/2)}
 if(/冰|霜|寒|水/.test(text)&&!s?.status){add("chilling");m.chill_evasion_penalty=1+Math.floor(r/2)}
 if(/雷|電/.test(text)){add("surge");m.surge_crit_bonus=2+Math.floor(r/2)}
 if(/神聖|聖光|破邪|驅魔/.test(text)){add("sanctified");m.controlled_target_bonus_pct=8+r}
 if(/黑暗|暗影|詛咒|死靈|惡魔|魔女/.test(text)&&!traits.includes("opener")&&!traits.includes("drain")){add("hexed");m.controlled_target_bonus_pct=7+r}
 if(/拳|掌|腿|斬|劍|刃|槍|矛|戟/.test(text)&&!traits.some(x=>["multi_hit","opener","execute","guard_break","precision","guard_strike","summon_echo"].includes(x))){add("combo");m.combo_bonus_pct=4;m.combo_cap=3}
 if(!traits.length){
   if(s?.damage_type==="physical"){add("force");m.damage_multiplier=1.02;m.defense_coefficient=.40}
   else if(s?.damage_type==="magic"){add("arcane_pressure");m.penetration_bonus_pct=3+r;m.resource_refund_on_hit=1+(r>=4?1:0)}
   else{add("hybrid_balance");m.penetration_bonus_pct=3+r;m.crit_bonus=2+r}
 }
 const priority=["summon_echo","drain","opener","execute","multi_hit","guard_break","guard_strike","precision","mobile","status_mastery","elemental_focus","combo","arcane_pressure","hybrid_balance","force"];
 m.profile=priority.find(x=>traits.includes(x))||traits[0];
 return m
}
function supportMechanics(s){
 const text=skillText(s),r=rank(s),traits=[],m={version:REV,profile:"support",traits};
 const add=t=>{if(!traits.includes(t))traits.push(t)};
 if(s?.damage_type==="heal"){
   if(/群體|全體|聖歌/.test(text)){add("group_heal");m.group_heal_ratio=Math.max(.66,.78-r*.01)}
   if(/高階|大治療|聖光治癒|生命|神聖/.test(text)){add("missing_hp_heal");m.missing_hp_heal_pct=5+r*1.5}
   if(!traits.length)add("direct_heal");
 }else if(s?.damage_type==="cleanse"){
   add("cleanse");if(/解除魔法|驅魔|淨化/.test(text)){m.post_cleanse_guard=r>=1;m.cleanse_priority_control=true}
 }else if(s?.damage_type==="debuff"){
   add("debuff");
   if(s?.status){add("status_mastery");m.status_chance_bonus=5+r*2;m.status_round_bonus=r>=3?1:0}
   if(/破|弱化|詛咒|酸液/.test(text)){add("expose");m.defense_shred=1+Math.ceil((r+1)/2)}
 }else{
   if(/陷阱|地雷|機關/.test(text)){add("trap");m.trap_power_pct=58+r*6;m.trap_status=s?.status||null;m.trap_status_chance=45+r*3}
   if(/反擊|迎擊/.test(text)){add("counter_stance");m.counter_power_pct=58+r*5}
   if(/護盾|壁壘|護體|守勢|防禦|聖盾|守護|石膚|屏障|護幕|結界/.test(text)){add("barrier_stance");m.guard_stance=true;if(s?.status){m.reactive_status=s.status;m.reactive_status_chance=40+r*4}}
   if(/潛行|隱形|煙霧|暗影步|瞬間移動|閃避|迴避|疾風/.test(text)){add("mobility_stance");m.next_opener=true;m.temporary_evasion=3+r}
   if(/瞄準|預兆|未來視|戰場推演|集中|專注|加速|快速射擊|星軌加速|祝福/.test(text)){add("focus");m.next_skill_accuracy=3+r;m.next_skill_crit=3+Math.floor(r/2);m.next_skill_damage_pct=5+r}
   if(/冥想|祈禱|安息/.test(text)){add("resource_recovery");m.resource_recovery_pct=8+r*2}
   if(/歌|舞|怒吼|號令|命令|指令|讚歌|祝福/.test(text)){add("party_aura");m.party_aura=1+r}
   if(/附刃|附體|神聖武器|武裝|元素增幅/.test(text)){add("imbue_focus");m.next_skill_damage_pct=Math.max(num(m.next_skill_damage_pct),7+r*2);m.next_skill_status_bonus=5+r}
   if(!traits.length){add("battle_preparation");m.next_skill_damage_pct=3+r;m.next_skill_accuracy=2+Math.floor(r/2)}
 }
 m.profile=traits[0]||m.profile;
 return m
}
function passiveMechanics(s){
 const text=skillText(s),traits=[],m={version:REV,profile:"passive",traits};
 const add=t=>{if(!traits.includes(t))traits.push(t)};
 if(/鷹眼/.test(text)){add("ranged_opening");m.first_round_accuracy=4;m.first_round_crit=4}
 if(/劍心/.test(text)){add("combo_mastery");m.combo_bonus_pct=2;m.combo_cap_bonus=1}
 if(/符文增幅/.test(text)){add("rune_weakness");m.weakness_bonus_pct=6}
 if(/弱點分析/.test(text)){add("weakpoint_analysis");m.penetration_bonus_pct=4;m.controlled_target_bonus_pct=6}
 if(/追蹤/.test(text)){add("tracking");m.opener_accuracy=3;m.status_chance_bonus=4}
 if(!traits.length)add("passive_stat");m.profile=traits[0];return m
}
function deriveMechanics(s){
 if(!s)return null;
 if((s.display_type||s.kind)==="被動"||s.damage_type==="passive")return passiveMechanics(s);
 if(isAttack(s))return attackMechanics(s);
 return supportMechanics(s)
}
function enrichSkill(s){
 if(!s)return false;
 const next=deriveMechanics(s),before=JSON.stringify(s.mechanics||null),after=JSON.stringify(next);
 if(before===after)return false;s.mechanics=next;return true
}
function enrichAll(){let changed=0;for(const s of allSkills())if(enrichSkill(s))changed++;return changed}
function sourceSkill(saved){
 const key=canonicalKey(saved),name=clean(saved?.name),tier=clean(saved?.tier);
 for(const s of allSkills())if(canonicalKey(s)===key||(name&&clean(s.name)===name&&clean(s.tier)===tier))return s;
 return null
}
function syncSavedSkills(){
 const c=game()?.character;if(!c?.skills)return 0;let changed=0;
 for(const s of c.skills){const src=sourceSkill(s);const next=clone(src?.mechanics||deriveMechanics(s));if(JSON.stringify(s.mechanics||null)!==JSON.stringify(next)){s.mechanics=next;changed++}}
 return changed
}
function mechanicsFor(s){if(!s)return null;if(!s.mechanics)enrichSkill(s);return s.mechanics||deriveMechanics(s)}
function playerPassiveMechanics(){
 const out=[];for(const s of game()?.character?.skills||[])if((s.kind==="被動"||s.display_type==="被動"||s.damage_type==="passive")&&s.mechanics)out.push(s.mechanics);return out
}
function passiveBonus(key){return playerPassiveMechanics().reduce((n,m)=>n+num(m?.[key]),0)}
function enemyControlled(){return (game()?.battle?.enemyStatuses||[]).some(x=>CONTROL_STATUSES.has(x?.id||x))}
function mechanicState(){const b=game()?.battle;if(!b)return null;return b.skillMechanics||(b.skillMechanics={comboKey:null,comboCount:0,nextSkill:null,tempBuff:null,counterReady:null,trap:null,reactiveStatus:null})}
function resetCombo(){const st=mechanicState();if(st){st.comboKey=null;st.comboCount=0}}
function applyNonStackingEnemyDebuff(key,value){
 const b=game()?.battle;if(!b||!value)return;b.enemyBuff=b.enemyBuff||{};b.enemyBuff[key]=Math.min(num(b.enemyBuff[key]),-Math.abs(value))
}
function addTemporaryEvasion(value){
 const b=game()?.battle,st=mechanicState();if(!b||!st||!value)return;
 if(st.tempBuff?.evasion) b.playerBuff.evasion=num(b.playerBuff.evasion)-num(st.tempBuff.evasion);
 b.playerBuff.evasion=num(b.playerBuff.evasion)+value;st.tempBuff={evasion:value}
}
function clearTemporaryBattleBuff(){
 const b=game()?.battle,st=b?.skillMechanics;if(!b||!st?.tempBuff)return false;
 const ev=num(st.tempBuff.evasion);if(ev)b.playerBuff.evasion=num(b.playerBuff.evasion)-ev;st.tempBuff=null;return true
}
function setNextSkill(m){
 const st=mechanicState();if(!st)return;
 st.nextSkill={
   damage_pct:Math.max(num(st.nextSkill?.damage_pct),num(m.next_skill_damage_pct)),
   accuracy:Math.max(num(st.nextSkill?.accuracy),num(m.next_skill_accuracy)),
   crit:Math.max(num(st.nextSkill?.crit),num(m.next_skill_crit)),
   status:Math.max(num(st.nextSkill?.status),num(m.next_skill_status_bonus)),
   opener:!!(st.nextSkill?.opener||m.next_opener)
 }
}
function consumeNextSkill(){const st=mechanicState(),v=st?.nextSkill?{...st.nextSkill}:null;if(st)st.nextSkill=null;return v}
function splitDamage(total,hits){
 hits=Math.max(1,Math.min(4,Math.round(hits||1)));if(hits===1)return [total];
 const base=Math.floor(total/hits),rem=total-base*hits;return Array.from({length:hits},(_,i)=>Math.max(1,base+(i<rem?1:0)))
}
function statusBonus(s,m){return num(m?.status_chance_bonus)+passiveBonus("status_chance_bonus")+skillLevelBonus(s,"status_chance_bonus")}
function battleAttackMechanicText(s,m){
 const out=[];
 if(m.traits?.includes("multi_hit"))out.push(`連段：同一次D20判定造成${m.hits}段傷害，對高防禦較穩定`);
 if(m.traits?.includes("precision"))out.push(`精準：命中+${m.accuracy_bonus}、爆擊率+${m.crit_bonus}%，並降低防禦減傷`);
 if(m.traits?.includes("guard_break"))out.push(`破勢：額外穿透${m.penetration_bonus_pct}%，命中後削弱敵方防禦${m.defense_shred}`);
 if(m.traits?.includes("opener"))out.push(`背襲：首回合、隱蔽準備或敵方受控時傷害+${m.opener_bonus_pct}%`);
 if(m.traits?.includes("execute"))out.push(`處決：敵方HP≤${m.execute_threshold_pct}%時傷害+${m.execute_bonus_pct}%`);
 if(m.traits?.includes("guard_strike"))out.push("攻守一體：命中後下一次敵方攻擊視同防禦");
 if(m.traits?.includes("mobile"))out.push(`機動：命中後下一次敵方攻擊期間閃避+${m.post_evasion}`);
 if(m.traits?.includes("drain"))out.push(`汲取：回復本技能傷害${m.drain_pct}%的生命`);
 if(m.traits?.includes("summon_echo"))out.push(`召喚追擊：命中後追加相當於主攻${m.echo_pct}%的召喚傷害`);
 if(m.traits?.includes("status_mastery"))out.push(`異常專精：狀態成功率額外+${m.status_chance_bonus}%${m.status_round_bonus?`、高階延長${m.status_round_bonus}回合`:""}`);
 if(m.traits?.includes("elemental_focus"))out.push(`弱點追擊：命中元素弱點時額外+${m.weakness_bonus_pct}%傷害`);
 if(m.traits?.includes("combo"))out.push(`連勢：連續使用同系攻擊，每層傷害+${m.combo_bonus_pct}%（最多${m.combo_cap}層）`);
 if(m.traits?.includes("arcane_pressure"))out.push(`魔力壓制：額外魔法穿透${m.penetration_bonus_pct}%，命中回復${m.resource_refund_on_hit} MP`);
 if(m.traits?.includes("hybrid_balance"))out.push(`魔武協調：額外穿透${m.penetration_bonus_pct}%、爆擊率+${m.crit_bonus}%`);
 return out.join("；")
}
function supportMechanicText(s,m){
 const out=[];
 if(m.traits?.includes("group_heal"))out.push(`群體治療：同時治療所有可用友方，各為單體量的${Math.round(m.group_heal_ratio*100)}%`);
 if(m.traits?.includes("missing_hp_heal"))out.push(`救急：再恢復目標已損生命的${Math.round(m.missing_hp_heal_pct*10)/10}%`);
 if(m.traits?.includes("trap"))out.push(`陷阱：敵方下次行動前觸發${m.trap_power_pct}%攻擊係數傷害`);
 if(m.traits?.includes("counter_stance"))out.push(`迎擊：下一次自己受到攻擊後，以${m.counter_power_pct}%物攻反擊`);
 if(m.traits?.includes("barrier_stance"))out.push("屏障：下一次敵方攻擊視同防禦姿態");
 if(m.traits?.includes("mobility_stance"))out.push(`機動準備：下一次敵方攻擊期間閃避+${m.temporary_evasion}，下一個攻擊技能可觸發背襲條件`);
 if(m.traits?.includes("focus"))out.push(`專注：下一個攻擊技能命中+${m.next_skill_accuracy}、爆擊率+${m.next_skill_crit}%、傷害+${m.next_skill_damage_pct}%`);
 if(m.traits?.includes("resource_recovery"))out.push(`調息：立即回復最大資源${m.resource_recovery_pct}%`);
 if(m.traits?.includes("party_aura"))out.push(`團隊支援：本場戰鬥同步強化隊友與出戰夥伴（強度${m.party_aura}）`);
 if(m.traits?.includes("imbue_focus"))out.push(`附魔準備：下一個攻擊技能傷害額外+${m.next_skill_damage_pct}%`);
 if(m.traits?.includes("battle_preparation"))out.push(`戰術準備：下一個攻擊技能傷害+${m.next_skill_damage_pct}%、命中+${m.next_skill_accuracy}`);
 if(m.reactive_status)out.push(`反應效果：受擊後有${m.reactive_status_chance}%機率使攻擊者陷入${m.reactive_status}`);
 return out.join("；")
}
function passiveMechanicText(m){
 const out=[];
 if(m.profile==="ranged_opening")out.push(`首回合攻擊命中+${m.first_round_accuracy}、爆擊率+${m.first_round_crit}%`);
 if(m.profile==="combo_mastery")out.push(`連勢每層額外+${m.combo_bonus_pct}%傷害，連勢上限+${m.combo_cap_bonus}`);
 if(m.profile==="rune_weakness")out.push(`命中元素弱點時額外+${m.weakness_bonus_pct}%傷害`);
 if(m.profile==="weakpoint_analysis")out.push(`技能額外穿透${m.penetration_bonus_pct}%；敵方受控時再增傷${m.controlled_target_bonus_pct}%`);
 if(m.profile==="tracking")out.push(`背襲技能命中+${m.opener_accuracy}；異常狀態成功率+${m.status_chance_bonus}%`);
 return out.join("；")
}
function mechanicText(s){
 const m=mechanicsFor(s);if(!m)return "";
 if((s.display_type||s.kind)==="被動"||s.damage_type==="passive")return passiveMechanicText(m);
 if(isAttack(s))return battleAttackMechanicText(s,m);
 return supportMechanicText(s,m)
}
function applyPartyAura(m){
 const b=game()?.battle;if(!b||!m?.party_aura)return;const n=num(m.party_aura);
 for(const p of b.party||[]){p.attack=num(p.attack)+n;p.magic=num(p.magic)+n;p.accuracy=num(p.accuracy)+n*2}
 if(b.companion){b.companion.attack=num(b.companion.attack)+n;b.companion.magic=num(b.companion.magic)+n;b.companion.accuracy=num(b.companion.accuracy)+n*2}
}
function recoverResource(m,s){
 const c=game()?.character;if(!c||!m?.resource_recovery_pct)return;
 const magic=/冥想|祈禱|安息|魔力|奧術|星/.test(skillText(s))||skillUsesMana(s),k=magic?"mana":"stamina",mk=magic?"maxMana":"maxStamina";
 const amount=Math.max(1,Math.round(num(c[mk])*m.resource_recovery_pct/100));c[k]=Math.min(num(c[mk]),num(c[k])+amount);battleLog(`${s.name}使${magic?"MP":"體力"}回復 ${amount}。`)
}
function applySupportMechanics(s,m){
 const b=game()?.battle,st=mechanicState();if(!b||!st||!m)return;
 resetCombo();
 if(m.traits?.includes("trap"))st.trap={power_pct:m.trap_power_pct,status:m.trap_status,status_chance:m.trap_status_chance,element:s.element||null,scaling:s.scaling_stat||"physical",name:s.name};
 if(m.traits?.includes("counter_stance"))st.counterReady={power_pct:m.counter_power_pct,name:s.name};
 if(m.guard_stance)b.defending=true;
 if(m.traits?.includes("mobility_stance")){addTemporaryEvasion(m.temporary_evasion);setNextSkill(m)}
 if(m.traits?.includes("focus")||m.traits?.includes("imbue_focus")||m.traits?.includes("battle_preparation"))setNextSkill(m);
 if(m.traits?.includes("resource_recovery"))recoverResource(m,s);
 if(m.traits?.includes("party_aura"))applyPartyAura(m);
 if(m.reactive_status)st.reactiveStatus={id:m.reactive_status,chance:m.reactive_status_chance,rounds:2,name:s.name}
}
function healTargetAmount(s,t,cs,m,ratio=1){
 const power=skillPowerPercent(s)/100,extra=skillLevelBonus(s,"target_max_hp_heal_pct");
 let amount=Math.max(1,Math.round(cs.magicPower*power+(t.maxHp||0)*extra/100))*(cs.healingPower/100);
 if(m?.missing_hp_heal_pct)amount+=Math.max(0,(num(t.maxHp)-num(t.hp))*m.missing_hp_heal_pct/100);
 return Math.max(1,Math.round(amount*ratio))
}
function supportTargetObject(key){
 if(key==="self")return game()?.character||null;
 const b=game()?.battle;if(key==="companion")return b?.companion||null;
 if(String(key).startsWith("party:"))return b?.party?.[Number(String(key).split(":")[1])]||null;
 return null
}
function resolveHealSkill(s,targetKey,cs,m){
 if(m?.traits?.includes("group_heal")){
   const targets=battleSupportTargets();for(const row of targets){const t=supportTargetObject(row.key);if(!t)continue;const amount=healTargetAmount(s,t,cs,m,m.group_heal_ratio);t.hp=clamp(num(t.hp)+amount,0,num(t.maxHp)||amount);battleLog(`${s.name}使${t.name||game().character.name}恢復 ${amount} HP。`)}
 }else mutateBattleSupportTarget(targetKey,t=>{const amount=healTargetAmount(s,t,cs,m,1);t.hp=clamp(num(t.hp)+amount,0,num(t.maxHp)||amount);battleLog(`${s.name}使${t.name||game().character.name}恢復 ${amount} HP。`)})
}
function attackComboMultiplier(s,m){
 const st=mechanicState();if(!st||!m?.traits?.includes("combo"))return 1;
 const key=clean(s.family||s.school||s.damage_type);if(st.comboKey===key)st.comboCount=Math.min(num(m.combo_cap,3)+passiveBonus("combo_cap_bonus"),num(st.comboCount)+1);else{st.comboKey=key;st.comboCount=1}
 return 1+(num(m.combo_bonus_pct)+passiveBonus("combo_bonus_pct"))*Math.max(0,st.comboCount-1)/100
}
function controlledBonus(m){return enemyControlled()?num(m?.controlled_target_bonus_pct)+passiveBonus("controlled_target_bonus_pct"):0}
function attackPassiveBonuses(m,b){
 const out={accuracy:0,crit:0,pen:passiveBonus("penetration_bonus_pct"),weak:passiveBonus("weakness_bonus_pct"),status:passiveBonus("status_chance_bonus")};
 if(b?.round===1){out.accuracy+=passiveBonus("first_round_accuracy");out.crit+=passiveBonus("first_round_crit")}
 if(m?.traits?.includes("opener"))out.accuracy+=passiveBonus("opener_accuracy");return out
}
function attackSkill(index,targetKey="self"){
 if(!game()?.battle?.active)return;closeBattleSkillPopup();
 const s=game().character.skills[index];if(!s||s.kind==="被動")return;
 const mana=skillUsesMana(s),cost=skillResourceCost(s),resource=mana?"MP":"體力";
 if((mana?game().character.mana:game().character.stamina)<cost){battleLog(`${resource}不足。`);return}
 if(!beginPlayerBattleAction())return;
 if(mana&&(game().character.statusEffects||[]).some(x=>(x.id||x)==="silence")){battleLog("沉默狀態下無法施放魔法技能。");enemyBattleTurn();return}
 if(mana)game().character.mana-=cost;else game().character.stamina-=cost;gainSkillMastery(s);
 const b=game().battle,e=b.enemy,cs=combatStats(),dtype=s.damage_type||"physical",stagger=b.playerStaggered?3:0,lvl=skillLevel(s),m=mechanicsFor(s)||{};b.playerStaggered=false;

 if(dtype==="heal"){
   resolveHealSkill(s,targetKey,cs,m);resetCombo();enemyBattleTurn();return
 }
 if(dtype==="cleanse"){
   const exclusions=new Set(s.cleanse_exclusions||["poison","hunger","thirst","fatigue"]),count=(s.cleanse_count||1)+skillLevelBonus(s,"cleanse_count_bonus");
   mutateBattleSupportTarget(targetKey,t=>{
     const arr=t.statusEffects||[],keep=[],removed=[];const ordered=m.cleanse_priority_control?[...arr].sort((a,z)=>Number(CONTROL_STATUSES.has(z.id||z))-Number(CONTROL_STATUSES.has(a.id||a))):arr;
     for(const st of ordered){const id=st.id||st;if(removed.length<count&&!exclusions.has(id))removed.push(st);else keep.push(st)}t.statusEffects=keep;
     if(skillLevelBonus(s,"post_cleanse_heal_magic_pct")>0){const amount=Math.max(1,Math.round(cs.magicPower*skillLevelBonus(s,"post_cleanse_heal_magic_pct")/100));t.hp=clamp(num(t.hp)+amount,0,num(t.maxHp)||amount)}
     battleLog(`${s.name}為${t.name||game().character.name}清除 ${removed.length} 個可淨化負面狀態。`)
   });if(m.post_cleanse_guard)b.defending=true;resetCombo();enemyBattleTurn();return
 }
 if(dtype==="buff"){
   b.playerBuff.attack=num(b.playerBuff.attack)+num(s.power);b.playerBuff.defense=num(b.playerBuff.defense)+num(s.defense);
   b.playerBuff.accuracy=num(b.playerBuff.accuracy)+num(s.accuracy)+skillLevelBonus(s,"accuracy_bonus");b.playerBuff.evasion=num(b.playerBuff.evasion)+num(s.evasion);
   for(const k of ["magicPower","magicDefense","critRate","critDamage","attackSpeed","castSpeed","blockRate","statusResist"])b.playerBuff[k]=num(b.playerBuff[k])+num(s[k]);
   b.playerBuff.statusResist=num(b.playerBuff.statusResist)+skillLevelBonus(s,"status_resist_bonus");b.playerBuffPct=b.playerBuffPct||{};
   const defPct=supportPercentValue(s,"defense_pct"),mdefPct=supportPercentValue(s,"magic_defense_pct");if(defPct)b.playerBuffPct.defensePct=Math.max(num(b.playerBuffPct.defensePct),defPct);if(mdefPct)b.playerBuffPct.magicDefensePct=Math.max(num(b.playerBuffPct.magicDefensePct),mdefPct);
   applySupportMechanics(s,m);battleLog(`使用 ${s.name}：${supportEffectText(s)}。`);enemyBattleTurn();return
 }
 if(dtype==="debuff"){
   for(const [k,v] of Object.entries(s.debuff||{}))b.enemyBuff[k]=num(b.enemyBuff[k])+v;
   if(m.defense_shred){applyNonStackingEnemyDebuff("defense",m.defense_shred);applyNonStackingEnemyDebuff("magicDefense",m.defense_shred)}
   if(s.status)applyEnemyStatus(s.status,(s.status_chance||50)+statusBonus(s,m),(s.status_rounds||2)+num(m.status_round_bonus)+skillLevelBonus(s,"status_rounds_bonus"));
   resetCombo();battleLog(`${s.name} 削弱 ${e.name}：${mechanicText(s)||"戰鬥能力下降"}。`);enemyBattleTurn();return
 }

 const next=consumeNextSkill()||{},pass=attackPassiveBonuses(m,b),r=rollD20(),scale=s.scaling_stat||(dtype==="magic"?"magic":dtype==="physical"?"physical":"hybrid"),power=skillPowerPercent(s)/100;
 let baseAtk=scale==="magic"?cs.magicPower:scale==="physical"?cs.attack:Math.round((cs.attack+cs.magicPower)/2),atk=baseAtk*power+talentTargetBonus(e);
 const physDef=Math.max(0,num(e.defense)+num(b.enemyBuff.defense)-enemyStatusDefensePenalty()),magDef=Math.max(0,num(e.magicDefense||e.defense)+num(b.enemyBuff.magicDefense)-enemyStatusDefensePenalty());
 let edef=dtype==="magic"?magDef:dtype==="hybrid"?Math.round((physDef+magDef)/2):physDef;
 let pen=dtype==="magic"?cs.magicPenPct:cs.armorPenPct;pen+=num(m.penetration_bonus_pct)+pass.pen;
 if(dtype==="magic")pen+=skillLevelBonus(s,"magic_pen_pct");else if(dtype==="hybrid")pen+=Math.max(skillLevelBonus(s,"armor_pen_pct"),skillLevelBonus(s,"magic_pen_pct"));else pen+=skillLevelBonus(s,"armor_pen_pct");
 edef*=1-Math.min(85,pen)/100;
 if(e.hp/e.maxHp<=.25)atk+=talentSpecial("executeBonus");
 let conditional=1;
 const openerReady=b.round===1||enemyControlled()||!!next.opener;if(m.traits?.includes("opener"))conditional*=openerReady?1+m.opener_bonus_pct/100:.96;
 if(m.traits?.includes("execute"))conditional*=e.hp/e.maxHp<=m.execute_threshold_pct/100?1+m.execute_bonus_pct/100:.96;
 const controlled=controlledBonus(m);if(controlled)conditional*=1+controlled/100;
 conditional*=attackComboMultiplier(s,m);conditional*=1+num(next.damage_pct)/100;
 let damageMultiplier=num(m.damage_multiplier,1)*conditional;
 const coeff=num(m.defense_coefficient,.42),accuracyBonus=num(m.accuracy_bonus)+pass.accuracy+num(next.accuracy),critBonus=num(m.crit_bonus)+num(m.surge_crit_bonus)+pass.crit+num(next.crit);
 const score=r+Math.floor((cs.accuracy+num(s.accuracy)+skillLevelBonus(s,"accuracy_bonus")+accuracyBonus-stagger-(e.evasion+num(b.enemyBuff.evasion)-enemyStatusEvasionPenalty()))/10);
 if(score>=10){
   const crit=battleCritFromRoll(r,Math.max(0,cs.critRate+critBonus-(e.critResist||0)));let raw=Math.max(1,Math.round(atk*damageMultiplier-edef*coeff));
   let dmg=applyElementDamage(raw,e,s.element),er=enemyElementResistance(e,s.element);if(er<0)dmg=Math.round(dmg*(1+(num(m.weakness_bonus_pct)+pass.weak)/100));if(crit)dmg=Math.round(dmg*cs.critDamage/100);
   let echo=0;if(m.echo_pct){echo=Math.max(1,Math.round(dmg*m.echo_pct/100));dmg+=echo}
   const segments=splitDamage(dmg,num(m.hits,1));e.hp=Math.max(0,e.hp-dmg);
   if(cs.lifeSteal>0)game().character.hp=clamp(game().character.hp+dmg*(cs.lifeSteal/100),0,game().character.maxHp);
   if(m.drain_pct){const heal=Math.max(1,Math.round(dmg*m.drain_pct/100));game().character.hp=clamp(game().character.hp+heal,0,game().character.maxHp);battleLog(`${s.name}汲取生命，恢復 ${heal} HP。`)}
   if(s.status)applyEnemyStatus(s.status,(s.status_chance||45)+statusBonus(s,m)+num(next.status),(s.status_rounds||2)+num(m.status_round_bonus)+skillLevelBonus(s,"status_rounds_bonus"));
   if(m.defense_shred){const key=dtype==="magic"?"magicDefense":"defense";applyNonStackingEnemyDebuff(key,m.defense_shred)}
   if(m.searing_accuracy_penalty)applyNonStackingEnemyDebuff("accuracy",m.searing_accuracy_penalty);
   if(m.chill_evasion_penalty)applyNonStackingEnemyDebuff("evasion",m.chill_evasion_penalty);
   if(m.guard_after_hit)b.defending=true;if(m.post_evasion)addTemporaryEvasion(m.post_evasion);if(/反擊/.test(skillText(s)))mechanicState().counterReady={power_pct:48+rank(s)*5,name:s.name};
   if(m.resource_refund_on_hit&&mana){game().character.mana=Math.min(game().character.maxMana,game().character.mana+m.resource_refund_on_hit);battleLog(`${s.name}命中後回收 ${m.resource_refund_on_hit} MP。`)}
   const hitText=segments.length>1?`，${segments.length}段［${segments.join("＋")}］`:"";battleLog(`${s.name} Lv${lvl} D20=${r} 命中，造成 ${dmg} ${dtype==="physical"?"物理":dtype==="hybrid"?"混合":"魔法"}傷害${hitText}${s.element?`／${s.element}`:""}${er>0?"（抗性）":er<0?"（弱點追擊）":""}${crit?"（爆擊）":""}${echo?`（召喚追擊${echo}）`:""}。`)
 }else battleLog(`${s.name} Lv${lvl} D20=${r} 未命中。`);
 degradeEquipment();tickBattleEffects();if(e.hp<=0){finishBattle("勝利");return}enemyBattleTurn()
}
function triggerTrap(){
 const b=game()?.battle,st=b?.skillMechanics,t=st?.trap;if(!b?.active||!t)return false;st.trap=null;
 const cs=combatStats(),base=t.scaling==="magic"?cs.magicPower:t.scaling==="hybrid"?Math.round((cs.attack+cs.magicPower)/2):cs.attack;
 let dmg=Math.max(1,Math.round(base*t.power_pct/100-(b.enemy.defense||0)*.18));dmg=applyElementDamage(dmg,b.enemy,t.element);b.enemy.hp=Math.max(0,b.enemy.hp-dmg);battleLog(`${t.name}的陷阱在${b.enemy.name}行動前觸發，造成 ${dmg} 傷害。`);
 if(t.status)applyEnemyStatus(t.status,t.status_chance||50,2);else applyNonStackingEnemyDebuff("evasion",2);return b.enemy.hp<=0
}
function resolveCounter(counter,damageTaken,csBefore){
 const b=game()?.battle;if(!b?.active||!counter||damageTaken<=0)return false;const raw=Math.max(1,Math.round(csBefore.attack*counter.power_pct/100-(b.enemy.defense||0)*.28)),dmg=applyElementDamage(raw,b.enemy,null);b.enemy.hp=Math.max(0,b.enemy.hp-dmg);battleLog(`${counter.name}觸發迎擊，反擊造成 ${dmg} 傷害。`);return b.enemy.hp<=0
}
function installRuntimePatches(){
 const oldSkillText=typeof globalThis.skillEffectText==="function"?globalThis.skillEffectText:null;
 if(oldSkillText){globalThis.skillEffectText=function(s){const base=oldSkillText(s),extra=mechanicText(s);return extra&&!String(base).includes(extra)?`${base}｜特色：${extra}`:base}}
 const oldEnemyTurn=typeof globalThis.enemyBattleTurn==="function"?globalThis.enemyBattleTurn:null;
 if(oldEnemyTurn){globalThis.enemyBattleTurn=function(){
   const b=game()?.battle;if(!b?.active)return oldEnemyTurn.apply(this,arguments);const st=mechanicState();
   if(triggerTrap()){finishBattle("勝利");return}
   const hpBefore=num(game().character.hp),counter=st?.counterReady?{...st.counterReady}:null,reactive=st?.reactiveStatus?{...st.reactiveStatus}:null,csBefore=combatStats();
   const result=oldEnemyTurn.apply(this,arguments);const after=game()?.battle;if(!after?.active||after!==b)return result;
   const damageTaken=Math.max(0,hpBefore-num(game().character.hp));let changed=clearTemporaryBattleBuff();
   if(damageTaken>0&&counter){st.counterReady=null;if(resolveCounter(counter,damageTaken,csBefore)){finishBattle("勝利");return result}changed=true}
   if(damageTaken>0&&reactive){st.reactiveStatus=null;applyEnemyStatus(reactive.id,reactive.chance||45,reactive.rounds||2);battleLog(`${reactive.name}的反應效果嘗試反制攻擊者。`);changed=true}
   if(changed){persist();renderAll()}return result
 }}
 if(typeof globalThis.battleUseSkill==="function")globalThis.battleUseSkill=attackSkill;
 const oldMigrate=typeof globalThis.migrateSave==="function"?globalThis.migrateSave:null;
 if(oldMigrate){globalThis.migrateSave=function(){const r=oldMigrate.apply(this,arguments);syncSavedSkills();return r}}
 const oldCreate=typeof globalThis.createCharacter==="function"?globalThis.createCharacter:null;
 if(oldCreate){globalThis.createCharacter=function(){const r=oldCreate.apply(this,arguments);syncSavedSkills();return r}}
}
function audit(){
 const issues=[],warnings=[],skills=allSkills(),seen=new Set(),unique=[];for(const s of skills){const k=canonicalKey(s);if(seen.has(k))continue;seen.add(k);unique.push(s)}
 const attacks=unique.filter(isAttack),supports=unique.filter(s=>activeKind(s)&&!isAttack(s)),passives=unique.filter(s=>(s.display_type||s.kind)==="被動"||s.damage_type==="passive");
 const uncovered=unique.filter(s=>!s.mechanics?.profile);if(uncovered.length)issues.push(`技能機制未覆蓋:${uncovered.slice(0,12).map(x=>x.name).join("、")}`);
 const attackProfiles=new Map();for(const s of attacks){const p=s.mechanics?.profile||"none";attackProfiles.set(p,(attackProfiles.get(p)||0)+1)}
 const traitSet=new Set(attacks.flatMap(s=>s.mechanics?.traits||[]));if(traitSet.size<10)issues.push(`攻擊技能機制類型不足:${traitSet.size}`);
 const semanticChecks=[[/破甲|穿甲|斷鋼/,"guard_break"],[/背刺|伏擊|突襲/,"opener"],[/連擊|連刃|二連|多重|箭雨|槍雨/,"multi_hit"],[/吸取|汲取/,"drain"],[/召喚|軍勢/,"summon_echo"],[/反擊|迎擊/,null]];
 for(const s of attacks){for(const [re,trait] of semanticChecks){if(!re.test(skillText(s)))continue;if(trait&&!(s.mechanics?.traits||[]).includes(trait))issues.push(`${s.name}:名稱語義未實裝${trait}`)}}
 const oldSig=new Map(),newSig=new Map();for(const s of attacks){const old=[s.damage_type,s.tier,s.scaling_stat,s.base_power_percent,s.power_growth_percent_per_level,s.resource_cost,s.accuracy,s.status].join("|");const nw=old+"|"+[s.mechanics?.profile,(s.mechanics?.traits||[]).join(","),s.mechanics?.hits,s.mechanics?.defense_coefficient,s.mechanics?.penetration_bonus_pct,s.mechanics?.conditional_bonus_pct].join("|");oldSig.set(old,(oldSig.get(old)||0)+1);newSig.set(nw,(newSig.get(nw)||0)+1)}
 const oldMax=Math.max(0,...oldSig.values()),newMax=Math.max(0,...newSig.values());if(newMax>=oldMax&&oldMax>2)warnings.push(`最大同質群未下降:${oldMax}→${newMax}`);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],stats:{unique_skills:unique.length,attack_skills:attacks.length,support_skills:supports.length,passive_skills:passives.length,mechanic_traits:traitSet.size,attack_profiles:Object.fromEntries(attackProfiles),max_clone_group_before:oldMax,max_clone_group_after:newMax,save_compatible:true}}
}

const changed=enrichAll();
DB.skill_mechanics_depth_system={version:REV,release:RELEASE,principles:["技能差異必須進入命中、減傷、狀態、條件、資源或敵我回合流程，不能只改名稱。","多段技能維持單一D20判定，不破壞既有一次擲骰規則。","破甲、背襲、處決、守勢、反擊、陷阱、群體治療、召喚追擊等語義均有runtime效果。","既有攻防百分比保留作數值底盤，但不再是技能特色的唯一來源。"],battle_mechanics:["multi_hit","precision","guard_break","opener","execute","guard_strike","mobile","drain","summon_echo","status_mastery","elemental_focus","combo"],support_mechanics:["group_heal","missing_hp_heal","trap","counter_stance","barrier_stance","mobility_stance","focus","resource_recovery","party_aura","imbue_focus"],skills_enriched:changed,save_schema_changed:false,save_compatible:true};
DB.meta=DB.meta||{};DB.meta.skill_mechanics_depth_revision=REV;DB.hard_rules=DB.hard_rules||{};DB.hard_rules.skill_mechanics_not_name_only=true;DB.hard_rules.skill_single_d20_multi_hit=true;
const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-SKILL");if(ai){ai.inputs=Array.from(new Set([...(ai.inputs||[]),REV,"skill mechanics/profile/traits"]));ai.validations=Array.from(new Set([...(ai.validations||[]),"技能不得只靠名稱、base_power_percent或防禦百分比形成差異；至少要有一項實際戰鬥流程機制。","連擊、破甲、背襲、處決、反擊、陷阱、召喚、群體治療等功能詞必須對應runtime。","多段攻擊仍只使用一次D20命中判定。"]));}
installRuntimePatches();
globalThis.skillMechanicsFor=mechanicsFor;globalThis.skillMechanicText=mechanicText;globalThis.syncSkillMechanics=syncSavedSkills;globalThis.runSkillMechanicsDepthAudit=audit;globalThis.QUNLU_SKILL_MECHANICS=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
globalThis.QUNLU_CORE?.registerModule?.("src/skill-mechanics-depth-v1.js",{domain:"progression",revision:REV,release:RELEASE});
})();
