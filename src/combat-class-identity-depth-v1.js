/* 群陸旅誌：戰鬥職業同質整併與職能深化 CURRENT-1.81.0
 * COMBAT-CLASS-IDENTITY-DEPTH-1.0
 * 合併只換名稱／技能高度重疊的職業，保留真正可形成不同戰術循環的分支。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const REV="COMBAT-CLASS-IDENTITY-DEPTH-1.0";
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.81.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.81.0";
const MERGE_MAP=Object.freeze({
  "C9-BATTLEMAGE":"C-SPELLBLADE",
  "C-ARCHSAGE":"C9-ARCHMAGE",
  "C-BEASTHUNTER":"C9-HUNTER",
  "C-CLERIC":"C9-HOLYCLERIC",
  "C9-PRIESTESS":"C9-PRIEST",
  "C9-BATTLECLERIC":"C-BATTLEPRIEST",
  "C-SHADOWDANCER":"C9-DARKASSASSIN"
});
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
const canonical=id=>MERGE_MAP[id]||id;
const beforeClasses=[...(DB.combat_classes||[])];
const classById=id=>beforeClasses.find(x=>x&&x.id===id)||null;
const skillKey=s=>String(s?.canonical_skill_id||"")+"|"+String(s?.name||"")+"|"+String(s?.tier||"F")+"|"+String(s?.kind||"");
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

function mergeSkills(targetId,aliasId){
  const target=Array.isArray(DB.skill_pools?.[targetId])?DB.skill_pools[targetId]:[];
  const alias=Array.isArray(DB.skill_pools?.[aliasId])?DB.skill_pools[aliasId]:[];
  const seen=new Set(),merged=[];
  for(const raw of [...target,...alias]){
    const s=clone(raw),key=skillKey(s);
    if(seen.has(key))continue;
    seen.add(key);
    if(s.source_class)s.source_class=canonical(s.source_class);
    if(Array.isArray(s.source_class_ids))s.source_class_ids=uniq(s.source_class_ids.map(canonical));
    merged.push(s);
  }
  DB.skill_pools[targetId]=merged;
  delete DB.skill_pools[aliasId];
}
for(const [aliasId,targetId] of Object.entries(MERGE_MAP)){
  const alias=classById(aliasId),target=classById(targetId);
  if(!alias||!target)continue;
  target.legacy_names=uniq([...(target.legacy_names||[]),alias.name,...(alias.legacy_names||[])]);
  target.merged_legacy_ids=uniq([...(target.merged_legacy_ids||[]),aliasId,...(alias.merged_legacy_ids||[])]);
  target.progression_from=uniq([...(target.progression_from||[]),...(alias.progression_from||[])].map(canonical).filter(id=>id!==targetId));
  mergeSkills(targetId,aliasId);
}

function remapDeep(v){
  if(typeof v==="string")return canonical(v);
  if(Array.isArray(v)){
    for(let i=0;i<v.length;i++)v[i]=remapDeep(v[i]);
    return v;
  }
  if(v&&typeof v==="object"){
    for(const k of Object.keys(v))v[k]=remapDeep(v[k]);
  }
  return v;
}
for(const [key,value] of Object.entries(DB)){
  if(["combat_classes","skill_pools","lore_query_index","combat_class_merge_map","combat_class_identity_system"].includes(key))continue;
  remapDeep(value);
}
if(DB.lore_query_index&&typeof DB.lore_query_index==="object"){
  for(const [aliasId,targetId] of Object.entries(MERGE_MAP)){
    const oldKey="class:"+aliasId,newKey="class:"+targetId;
    if(Array.isArray(DB.lore_query_index[oldKey])){
      DB.lore_query_index[newKey]=uniq([...(DB.lore_query_index[newKey]||[]),...DB.lore_query_index[oldKey]]);
      delete DB.lore_query_index[oldKey];
    }
  }
}
if(DB.profession_tree?.categories){
  for(const k of Object.keys(DB.profession_tree.categories))DB.profession_tree.categories[k]=uniq(DB.profession_tree.categories[k].map(canonical));
}
for(const s of DB.shared_skills||[]){
  if(s.source_class)s.source_class=canonical(s.source_class);
  if(Array.isArray(s.source_class_ids))s.source_class_ids=uniq(s.source_class_ids.map(canonical));
}
for(const p of DB.party_member_templates||[])if(Array.isArray(p.class_affinity_ids))p.class_affinity_ids=uniq(p.class_affinity_ids.map(canonical));
for(const d of DB.discipline_factions||[])if(Array.isArray(d.related_class_ids))d.related_class_ids=uniq(d.related_class_ids.map(canonical));

DB.combat_classes=(DB.combat_classes||[]).filter(c=>c&&!(c.id in MERGE_MAP));
for(const c of DB.combat_classes){
  c.progression_from=uniq((c.progression_from||[]).map(canonical).filter(id=>id!==c.id));
}
const liveIds=new Set(DB.combat_classes.map(c=>c.id));
for(const c of DB.combat_classes)c.progression_from=(c.progression_from||[]).filter(id=>liveIds.has(id));

function fx(v={}){return Object.assign({
 attack_pct:0,magic_attack_pct:0,defense_pct:0,magic_defense_pct:0,
 accuracy:0,evasion:0,crit_rate:0,crit_damage:0,attack_speed_pct:0,cast_speed_pct:0,
 armor_pen_pct:0,magic_pen_pct:0,block_value:0,poise:0,status_accuracy:0,status_resist:0,
 healing_power:0,mana_regen:0,threat:0,stealth:0,perception:0,summon_power:0,
 initiative:0,move_speed:0,life_steal:0
},v)}
function profile(c,family,signature,loop,strengths,tradeoffs,effects,tags=[]){
  return {
    family,
    signature:c.name+"｜"+signature,
    battle_loop:loop,
    strengths,
    tradeoffs,
    weapon_identity:c.weapon_group||"依裝備",
    mechanic_tags:uniq(tags),
    combat_effects:fx(effects),
    distinctive_axis:family+"／"+signature,
    merged_legacy_ids:uniq(c.merged_legacy_ids||[])
  };
}
function identityFor(c){
  const n=String(c.name||""),id=String(c.id||"");
  if(id==="C-EAST"||/劍豪/.test(n))return profile(c,"東方刃術","讀勢後以短窗口爆發斬擊","先觀察／守勢建立出手窗口，再以高爆擊傷害與先攻完成決勝。",["單體決勝","先攻","爆擊品質"],["容錯較低","被包圍時優勢下降"],{crit_damage:7,initiative:3,accuracy:2},["讀勢","決勝"]);
  if(/聖盾/.test(n))return profile(c,"聖盾守護","護衛與神聖壁壘","吸收威脅、維持格擋，將安全窗口留給後排。",["承傷","格擋","隊伍保護"],["輸出節奏慢","依賴盾系裝備"],{defense_pct:5,magic_defense_pct:3,block_value:7,poise:6,threat:14},["護衛","壁壘"]);
  if(/盾衛|守衛者/.test(n))return profile(c,"盾衛","格擋後反擊","主動拉高威脅並用格擋換取反擊與隊伍安全。",["格擋","控仇恨","反擊"],["機動性普通","遠程壓力較難處理"],{defense_pct:4,block_value:7,poise:5,threat:14},["格擋","反擊"]);
  if(/重裝|重騎/.test(n))return profile(c,"重裝前衛","以護甲與韌性硬吃交換","用高韌性維持站位，承受攻擊後再以重擊或衝鋒奪回節奏。",["韌性","物防","穩定站場"],["攻速偏慢","閃避與追擊能力弱"],{defense_pct:5,poise:9,threat:10,attack_speed_pct:-3},["重甲","承傷"]);
  if(/守誓|騎士/.test(n)&&!/魔導|魔劍|暗影|聖盾|奧術/.test(n))return profile(c,"騎士","衝鋒、守線與誓約反擊","進場建立前線，靠守勢與反擊維持隊形。",["正面戰","反擊","隊伍前線"],["轉向較慢","不擅長隱密戰"],{defense_pct:3,block_value:4,poise:4,threat:8},["衝鋒","守線"]);
  if(/狂戰|野蠻/.test(n))return profile(c,"狂戰","以防禦交換爆發","承擔更高受傷風險換取攻擊與爆擊，適合快速壓低敵方血線。",["爆發","破勢","低血壓迫"],["物防下降","長戰風險高"],{attack_pct:5,crit_rate:2,poise:5,defense_pct:-4},["狂暴","破勢"]);
  if(/角鬥/.test(n))return profile(c,"角鬥","逼戰與交換","用挑釁逼出對手行動，再靠順勢攻擊與韌性贏交換。",["單挑","逼戰","韌性"],["群體支援弱","遠距離弱"],{attack_pct:3,poise:4,threat:6,crit_rate:1},["挑釁","交換"]);
  if(/槍士|槍宗師|符文槍/.test(n))return profile(c,"長槍","距離控制與迎擊","保持武器距離，以精準突刺、迎擊和貫穿打斷近身節奏。",["破甲","迎擊","中距離"],["貼身後效率下降","需要站位"],{accuracy:3,armor_pen_pct:3,move_speed:2,initiative:2},["迎擊","貫穿"]);
  if(id==="C9-ARCHER")return profile(c,"弓術","定點精準火力","拉開距離後穩定瞄準，以高命中與高品質爆擊結束目標。",["命中","遠距離","單點輸出"],["被貼身時脆弱","攻擊節奏較固定"],{accuracy:5,crit_damage:6,perception:3,attack_speed_pct:-2},["瞄準","精準"]);
  if(/長弓/.test(n))return profile(c,"長弓","蓄力狙擊","犧牲部分射速換取更高命中與爆擊傷害，專打關鍵目標。",["超遠距離","狙擊","爆擊傷害"],["射速較慢","移動中效率下降"],{accuracy:6,crit_damage:10,perception:5,attack_speed_pct:-4},["狙擊","穿透"]);
  if(id==="C-RNG")return profile(c,"遊俠","野外控制與陷阱牽制","先偵察與布置，再用陷阱、連射和走位控制敵人。",["偵察","陷阱","持續遠程"],["正面爆發不及純弓手","依賴場地準備"],{perception:5,status_accuracy:4,initiative:2,move_speed:2},["陷阱","游擊"]);
  if(/斥候/.test(n))return profile(c,"斥候","先手偵察與伏擊","以感知、潛行取得情報優勢，第一輪搶先建立節奏。",["先攻","偵察","伏擊"],["正面耐久低","後期持續輸出普通"],{perception:6,stealth:5,initiative:4,accuracy:2},["伏擊","情報"]);
  if(/巡林/.test(n))return profile(c,"巡林","移動射擊與追蹤","持續移位保持安全距離，以追蹤和多重箭處理複數目標。",["機動","追蹤","多目標"],["重甲對手效率普通","需保持距離"],{move_speed:4,evasion:2,perception:5,accuracy:2},["追蹤","游擊"]);
  if(/獵人|獵師/.test(n)&&!/靈弓/.test(n))return profile(c,"獵人","標記獵物後專注追擊","辨識弱點與獵物習性後，以精準射擊與陷阱集中處理單一目標。",["感知","對單目標","野外適應"],["換目標需要重新建立節奏","近戰能力有限"],{accuracy:3,perception:6,status_accuracy:2},["獵物標記","追獵"]);
  if(/靈弓|魔弓/.test(n))return profile(c,"魔弓","將魔力導入箭矢","以遠程命中作為載體疊加元素／靈性效果，兼顧物理與魔法壓力。",["遠程魔武","元素弱點","命中"],["資源消耗較高","純物理爆發較低"],{accuracy:4,magic_attack_pct:2,status_accuracy:3,magic_pen_pct:1},["魔矢","元素"]);
  if(/陷阱/.test(n))return profile(c,"機關獵手","預置陷阱與連鎖控制","先布置控制點，再誘導敵人進入陷阱形成連鎖異常。",["控場","異常命中","戰場準備"],["突發遭遇較弱","對高抗性目標較慢"],{status_accuracy:7,perception:4,initiative:2},["陷阱","連鎖"]);
  if(/飛刀/.test(n))return profile(c,"投擲刃","高速投擲與異常附著","以高先攻和高命中連續投擲，快速累積毒或削弱。",["先攻","命中","異常"],["射程不及弓弩","單擊威力低"],{accuracy:4,initiative:4,attack_speed_pct:4,status_accuracy:2},["投擲","連擊"]);
  if(/暗影刺客|影刃/.test(n))return profile(c,"影刃","潛行切入與處決","利用潛行／位移取得背襲窗口，在短時間內完成處決後脫離。",["爆擊","潛行","機動"],["正面承傷低","失去先手時效率下降"],{crit_rate:4,evasion:3,stealth:8,initiative:3,defense_pct:-2},["背襲","處決"]);
  if(/刺客/.test(n))return profile(c,"刺客","背襲與毒刃爆發","以潛行取得背面，透過毒與爆擊快速壓低高價值目標。",["背襲","爆擊","毒"],["群戰續航弱","依賴位置"],{crit_rate:3,evasion:2,stealth:6,status_accuracy:2},["背襲","毒"]);
  if(/雙刃/.test(n))return profile(c,"雙持","高頻連擊","以攻速和閃避維持貼身壓力，連擊越完整收益越高。",["攻速","連擊","閃避"],["單擊破甲低","體力消耗快"],{attack_speed_pct:5,evasion:3,initiative:2},["雙持","連段"]);
  if(/海盜/.test(n))return profile(c,"掠擊","不規則近戰與投擲","在近戰、投擲與位移間切換，以多手段維持壓力。",["靈活","多手段","機動"],["專項上限較低","防禦普通"],{attack_pct:2,evasion:2,initiative:2},["掠擊","投擲"]);
  if(/盜賊/.test(n))return profile(c,"游擊刃","機動、背刺與煙幕","以閃避與煙幕重置位置，再抓背刺窗口。",["機動","潛行","爆擊"],["正面硬拼弱","依賴位置"],{crit_rate:3,evasion:3,stealth:6,initiative:2},["煙幕","背刺"]);
  if(/吟遊/.test(n))return profile(c,"戰歌","以歌曲改變團隊節奏","維持團隊增益、干擾敵人，在支援間穿插法術。",["團隊支援","控場","續航"],["單體爆發低","需要維持施唱"],{cast_speed_pct:3,status_accuracy:3,healing_power:4,mana_regen:.2},["戰歌","團隊"]);
  if(/舞者|劍舞/.test(n))return profile(c,"戰舞","以移動維持增益與閃避","持續移動與連續動作累積節奏，兼顧迴避與團隊鼓舞。",["機動","閃避","節奏支援"],["重甲相性差","被控制時損失大"],{evasion:4,move_speed:4,initiative:3,attack_speed_pct:2},["戰舞","節奏"]);
  if(/僧侶|武僧/.test(n))return profile(c,"武僧","連段與調息循環","以徒手連段建立壓力，適時調息維持體力與抗性。",["連段","韌性","資源恢復"],["武器選擇受限","遠程手段有限"],{attack_speed_pct:5,status_resist:4,poise:4,initiative:2},["連段","調息"]);
  if(/戰地療術/.test(n))return profile(c,"戰地療術","快速救急與淨化","優先穩住瀕危目標，再以防護與淨化修復隊伍狀態。",["救急","淨化","快速支援"],["輸出較低","MP壓力高"],{healing_power:10,status_accuracy:3,status_resist:3,initiative:4,mana_regen:.25},["救急","淨化"]);
  if(/牧師|聖職|聖者/.test(n))return profile(c,"聖療","治療、祝福與護盾","以治療維持血線，利用祝福／護盾降低後續傷害。",["治療","護盾","淨化"],["直接輸出較低","依賴MP"],{healing_power:13,status_resist:4,mana_regen:.35,magic_attack_pct:-2},["治療","祝福"]);
  if(/戰鬥司祭/.test(n))return profile(c,"戰禱","近戰施壓中維持治療","以斧錘貼近前線，攻擊與祝福交替，讓支援不中斷。",["前線支援","治療","韌性"],["純輸出與純治療都不及專職"],{attack_pct:2,healing_power:7,poise:5,status_resist:2},["戰禱","前線"]);
  if(/審判/.test(n))return profile(c,"審判","鎖定異常／邪術目標後制裁","以高異常命中、淨化與破法壓制特定威脅。",["破法","淨化","異常壓制"],["對純物理敵人優勢較少","資源消耗高"],{status_accuracy:6,status_resist:4,magic_pen_pct:2,poise:3},["破法","制裁"]);
  if(/驅魔/.test(n))return profile(c,"驅魔","解除負面與破除召喚／不死","先清除控制與詛咒，再以神聖手段針對異常來源。",["淨化","抗性","異常處理"],["一般輸出較低","專長偏情境"],{status_accuracy:6,status_resist:6,healing_power:5,mana_regen:.2},["淨化","破邪"]);
  if(/聖武士|聖劍/.test(n))return profile(c,"聖武","近戰制裁與自我維持","以武器攻擊建立壓力，透過神聖護佑維持自身與隊友。",["近戰","治療","抗性"],["爆發不及純戰士","治療不及聖療"],{attack_pct:2,defense_pct:2,healing_power:6,status_resist:3,threat:4},["制裁","護佑"]);
  if(/德魯伊/.test(n))return profile(c,"自然術","變形、荊棘與自然盟友","依敵情在治療、控場與自然召喚間切換。",["多功能","自然控場","召喚"],["專項爆發較低","切換成本"],{healing_power:5,summon_power:7,status_accuracy:3,mana_regen:.2},["變形","自然"]);
  if(/薩滿/.test(n))return profile(c,"祖靈術","圖騰式支援與祖靈追擊","以靈性護盾與元素術牽制，讓祖靈提供持續支援。",["支援","元素","召喚"],["依賴施法節奏","近戰弱"],{summon_power:6,status_accuracy:4,healing_power:4,mana_regen:.2},["祖靈","元素"]);
  if(/精靈使/.test(n))return profile(c,"精靈契約","以精靈追擊放大元素連鎖","先施加元素效果，再讓召喚精靈接續攻擊或支援。",["召喚","元素連鎖","支援"],["本體防禦薄","需要契約對象"],{summon_power:11,status_accuracy:4,magic_attack_pct:2},["精靈","連鎖"]);
  if(/馴龍|龍召喚/.test(n))return profile(c,"龍契","以高成本召喚換取高壓戰場存在","維持龍類召喚與命令窗口，以高召喚強度壓制戰場。",["召喚強度","威壓","持續壓力"],["資格與資源門檻高","本體較依賴召喚"],{summon_power:15,threat:4,status_resist:2,magic_attack_pct:-2},["龍契","召喚"]);
  if(/召喚師/.test(n))return profile(c,"召喚","本體控場、召喚物持續輸出","先建立召喚單位，再以護盾與法術替召喚物創造輸出時間。",["召喚","持續戰","戰場占位"],["本體爆發偏低","召喚被壓制時效率下降"],{summon_power:13,mana_regen:.25,magic_attack_pct:-2},["召喚","指揮"]);
  if(/時序|占星|星導|星界|先知|預言/.test(n))return profile(c,"時序／星象","操控先攻、速度與預兆","透過預兆與速度差取得先手，再用控制或星術擴大節奏優勢。",["先攻","控場","預判"],["直接耐久低","需要掌握行動順序"],{initiative:5,cast_speed_pct:4,status_accuracy:4,evasion:1},["預兆","時序"]);
  if(/火焰/.test(n))return profile(c,"火元素","燃燒壓力與範圍爆發","持續施加火焰壓力，抓聚集窗口投入範圍爆發。",["魔法爆發","範圍","持續壓力"],["防禦較薄","元素抗性會明顯影響效率"],{magic_attack_pct:5,status_accuracy:2,defense_pct:-3},["火","爆發"]);
  if(/寒冰/.test(n))return profile(c,"水／寒冰","緩速與區域控制","先降低敵方機動，再以冰霜範圍術維持安全距離。",["控場","安全距離","異常命中"],["瞬間傷害較低","抗性目標較難控制"],{magic_attack_pct:3,status_accuracy:6,magic_defense_pct:1,defense_pct:-2},["水","緩速"]);
  if(/雷電/.test(n))return profile(c,"雷元素","先手連鎖爆發","用高先攻快速施術，透過連鎖效果處理分散目標。",["先攻","連鎖","爆發"],["MP消耗快","持續戰較吃資源"],{magic_attack_pct:4,initiative:4,cast_speed_pct:3,defense_pct:-3},["雷","連鎖"]);
  if(/風魔法/.test(n))return profile(c,"風元素","高速施法與位移","靠高機動保持距離，以快速施法反覆切換位置。",["機動","施法速度","閃避"],["單擊威力較低","怕高命中壓制"],{cast_speed_pct:6,evasion:3,move_speed:4,magic_attack_pct:2},["風","機動"]);
  if(/大地/.test(n))return profile(c,"地元素","護體、地形與硬直壓制","以防護法術穩住站位，再用岩槍／震擊破壞敵方節奏。",["防禦","韌性","控場"],["施法較慢","追擊能力弱"],{defense_pct:4,poise:5,status_accuracy:3,cast_speed_pct:-2,magic_attack_pct:2},["地","護體"]);
  if(/元素法師|元素賢者|元素使/.test(n))return profile(c,"泛元素","依弱點切換元素","先辨識敵方抗性，再切換元素技能取得弱點收益。",["弱點利用","多元素","適應性"],["需要情報","單一元素專精較低"],{magic_attack_pct:4,status_accuracy:3,mana_regen:.25,perception:2},["元素弱點","切換"]);
  if(/幻術/.test(n))return profile(c,"幻術","以錯位與控制降低敵方有效行動","先建立幻象／隱形，再利用敵方失誤創造安全輸出窗口。",["控場","閃避","脫戰"],["對高感知目標效果下降","直接傷害低"],{status_accuracy:7,evasion:3,stealth:4,magic_attack_pct:-2},["幻象","控制"]);
  if(/死靈/.test(n))return profile(c,"死靈","汲取與亡者召喚","用生命汲取維持本體，再以亡者單位形成持續壓力。",["召喚","汲取","持續戰"],["神聖／淨化克制","前置時間較長"],{summon_power:9,life_steal:4,status_accuracy:4,magic_attack_pct:2},["亡者","汲取"]);
  if(/血法/.test(n))return profile(c,"血術","以生命風險換取法術壓力","透過汲取與血術強化爆發，必須管理自身生存風險。",["汲取","爆發","自我維持"],["防禦較低","資源風險高"],{magic_attack_pct:4,life_steal:5,defense_pct:-3,status_accuracy:2},["血術","汲取"]);
  if(/詛咒|魔女|黑魔導|惡魔術/.test(n))return profile(c,"咒術","先施加削弱再放大傷害","以詛咒、恐懼或毒降低目標狀態，再進行魔法收割。",["異常命中","削弱","魔穿"],["對高抗性敵人較慢","防禦薄"],{status_accuracy:7,magic_pen_pct:3,magic_attack_pct:2,defense_pct:-2},["詛咒","削弱"]);
  if(/白魔導/.test(n))return profile(c,"白魔導","群體治療與防護","優先維持全隊血線，再用聖光與護盾處理空檔。",["群療","防護","續航"],["傷害較低","MP需求高"],{healing_power:15,mana_regen:.4,status_resist:4,magic_attack_pct:-2},["群療","防護"]);
  if(/紅魔導/.test(n))return profile(c,"紅魔導","快速切換攻擊與治療","在攻擊魔法、治療與近戰間快速切換，利用行動彈性補缺口。",["彈性","快速施法","魔武"],["各專項峰值較低","資源管理複雜"],{attack_pct:2,magic_attack_pct:2,cast_speed_pct:4,healing_power:4},["雙修","快速施法"]);
  if(/魔導士|巫師|大法師/.test(n)||id==="C-MAG")return profile(c,"奧術","穩定法術循環與護盾","用護盾穩住施法空間，再以奧術／元素法術持續輸出。",["魔攻","施法速度","MP續航"],["物理防禦低","被貼身時受壓"],{magic_attack_pct:4,cast_speed_pct:3,mana_regen:.3,defense_pct:-3},["奧術","護盾"]);
  if(/秘紋|符文/.test(n)&&!/槍/.test(n))return profile(c,"秘紋魔武","預置符文後強化攻防","先布置符文護盾／增幅，再以符文武器引爆效果。",["攻守切換","魔穿","防護"],["需要準備回合","被驅散會損失節奏"],{attack_pct:2,magic_attack_pct:2,defense_pct:3,status_accuracy:3,magic_pen_pct:2},["符文","引爆"]);
  if(/魔劍|戰鬥法師|奧術騎士|魔導騎士/.test(n))return profile(c,"魔武","武器命中銜接法術","以近戰建立命中與站位，再用附刃／奧術效果形成混合壓力。",["物魔混傷","適應性","破防"],["屬性需求分散","資源管理較複雜"],{attack_pct:2,magic_attack_pct:2,armor_pen_pct:2,magic_pen_pct:2,defense_pct:1},["附刃","混傷"]);
  if(/暗影騎士/.test(n))return profile(c,"影騎","防守切入後暗影收割","用騎士防守撐過正面交換，再以影襲切入後排。",["生存","切後排","爆擊"],["混合定位使專項上限較低"],{defense_pct:2,crit_rate:2,stealth:5,attack_pct:2,threat:3},["影襲","守勢"]);
  if(/龍脈|龍法師/.test(n))return profile(c,"龍脈","以高韌性支撐元素爆發","靠龍脈護體站住前線，再用龍炎／雷等高壓技能爆發。",["韌性","元素爆發","混合輸出"],["資源成本高","血統／傳承門檻高"],{attack_pct:2,magic_attack_pct:3,poise:5,status_resist:3},["龍脈","爆發"]);
  if(/戰鬥鍊金/.test(n))return profile(c,"戰鬥鍊金","消耗品式控場與弱點製造","以爆裂、酸液與煙霧先改變戰場，再由隊伍利用弱點。",["異常","控場","破防"],["依賴準備與資源","直接續航普通"],{status_accuracy:7,perception:3,magic_pen_pct:2,initiative:2},["鍊金彈","弱點"]);
  if(/戰術學者/.test(n))return profile(c,"戰術","情報轉化為全隊效率","先分析弱點，再用指令調整先攻、命中與目標優先序。",["情報","先攻","隊伍效率"],["個人爆發低","需要觀察回合"],{accuracy:3,perception:7,initiative:5,status_accuracy:3,magic_attack_pct:-2},["分析","指令"]);
  return profile(c,"通用戰技","以武器與職業技能形成穩定循環","根據武器距離與角色資源，在攻擊、防守與技能間取得穩定交換。",["穩定","容易理解"],["缺乏極端專項"],{},["通用"]);
}
for(const c of DB.combat_classes){
  c.combat_identity=identityFor(c);
  c.combat_identity_revision=REV;
}

DB.combat_class_merge_map=Object.assign({},MERGE_MAP);
DB.meta=DB.meta||{};
DB.meta.current_version=RELEASE;
DB.meta.combat_class_identity_depth_revision=REV;
DB.meta.combat_profession_overhaul="93-class canonical combat profession pool + legacy alias migration + distinct tactical identities";
DB.hard_rules=DB.hard_rules||{};
DB.hard_rules.combat_profession_pool=DB.combat_classes.length;
DB.hard_rules.combat_profession_legacy_count=beforeClasses.length;
DB.hard_rules.combat_profession_identity_required=true;
DB.hard_rules.combat_profession_merge_only_when_tactical_identity_overlaps=true;

const classGen=(DB.generators||[]).find(g=>g&&((g.id==="GEN-CLASS")||String(g.name||"").includes("職業")));
if(classGen){
  classGen.constraints=uniq([...(classGen.constraints||[]),
    "新增戰鬥職業前必須比對武器、資源、戰鬥循環、招牌機制、強項與代價；若核心循環高度重疊，改為既有職業分支或合併。",
    "名稱不同但技能組、戰鬥定位與節奏相同，不得視為獨立職業。",
    "同武器職業可並存，但必須至少在戰鬥循環、資源交換、位置需求或隊伍功能之一形成實質差異。"
  ]);
}
for(const ai of DB.management_ai||[]){
  if(ai?.id==="AI-CLASS"||String(ai?.name||"").includes("職業")){
    ai.validations=uniq([...(ai.validations||[]),
      "職業資料必須存在combat_identity，包含招牌機制、戰鬥循環、強項、代價與實際戰鬥修正。",
      "同階同定位職業若技能與戰術循環高度重疊，應合併並保留legacy alias，而非只更名。"
    ]);
  }
}

function audit(){
  const issues=[],ids=new Set(DB.combat_classes.map(c=>c.id));
  if(beforeClasses.length!==100)issues.push("深化前職業基準不是100筆:"+beforeClasses.length);
  if(DB.combat_classes.length!==93)issues.push("合併後職業數不是93筆:"+DB.combat_classes.length);
  for(const alias of Object.keys(MERGE_MAP))if(ids.has(alias))issues.push("舊職業ID仍在canonical職業池:"+alias);
  for(const [alias,target] of Object.entries(MERGE_MAP))if(!ids.has(target))issues.push("合併目標缺失:"+alias+"->"+target);
  for(const c of DB.combat_classes){
    if(!c.combat_identity)issues.push("缺少職業特色:"+c.id);
    else{
      const x=c.combat_identity;
      if(!x.signature||!x.battle_loop||!x.strengths?.length||!x.tradeoffs?.length)issues.push("職業特色欄位不完整:"+c.id);
      if(!x.combat_effects)issues.push("缺少實際戰鬥修正:"+c.id);
    }
    if(!Array.isArray(DB.skill_pools?.[c.id])||!DB.skill_pools[c.id].length)issues.push("職業技能池缺失:"+c.id);
    for(const p of c.progression_from||[])if(!ids.has(p))issues.push("職業進階來源缺失:"+c.id+"<-"+p);
  }
  const signature=new Map();
  for(const c of DB.combat_classes){
    const skills=uniq((DB.skill_pools[c.id]||[]).map(s=>String(s.canonical_skill_id||s.name||""))).sort().join("|");
    const key=[c.tier,c.combat_track,c.weapon_group,c.combat_role,skills].join("::");
    if(signature.has(key))issues.push("仍存在完全同質職業:"+signature.get(key)+" / "+c.id);
    else signature.set(key,c.id);
  }
  return {
    revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
    stats:{
      legacy_classes:beforeClasses.length,
      canonical_classes:DB.combat_classes.length,
      merged_classes:Object.keys(MERGE_MAP).length,
      physical:DB.combat_classes.filter(c=>c.combat_track==="physical").length,
      magic:DB.combat_classes.filter(c=>c.combat_track==="magic").length,
      hybrid:DB.combat_classes.filter(c=>c.combat_track==="hybrid").length,
      identities:DB.combat_classes.filter(c=>c.combat_identity).length
    }
  };
}
DB.combat_class_identity_system={
  version:REV,release:RELEASE,legacy_count:beforeClasses.length,canonical_count:DB.combat_classes.length,
  merge_map:Object.assign({},MERGE_MAP),
  principles:[
    "只合併核心戰鬥循環與技能功能高度重疊者，不因同武器或同系別就合併。",
    "保留可形成不同玩法的近似職業，例如遊俠偏陷阱游擊、弓箭手偏精準火力。",
    "所有canonical職業必須同時具備招牌機制、戰鬥循環、強項、代價與實際戰鬥修正。",
    "舊ID透過merge map遷移，不刪除玩家既有存檔歷程。"
  ],
  save_compatible:true
};
globalThis.canonicalCombatClassId=canonical;
globalThis.runCombatClassIdentityDepthAudit=audit;
globalThis.QUNLU_COMBAT_CLASS_IDENTITY=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
globalThis.QUNLU_CORE?.registerModule?.("src/combat-class-identity-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();