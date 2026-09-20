/* 群陸旅誌：組織／流派辨識度深化 CURRENT-1.85.1
 * AFFILIATION-IDENTITY-DEPTH-1.2
 * 同質勢力收斂、冒險類組織50%整併、舊ID映射、歷史／現況／特色補全與作用域上限稽核。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.85.1";
const REV="AFFILIATION-IDENTITY-DEPTH-1.2";
const CAPS=Object.freeze({world:4,kingdom:3,region:2});
const R=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const text=v=>String(v==null?"":v).trim();
const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
const tier=t=>R[text(t).toUpperCase()]??0;
const find=(a,id)=>(Array.isArray(a)?a:[]).find(x=>x&&x.id===id)||null;
const asArray=v=>Array.isArray(v)?v:(v?[v]:[]);
const has=(s,re)=>re.test(text(s));
const resolveMap=(m,id)=>{
  let cur=id,guard=0;
  while(cur&&m&&m[cur]&&m[cur]!==cur&&guard++<20)cur=m[cur];
  return cur;
};

function scopeLevel(x){
  const s=text(x&&x.scope)+" "+text(x&&x.scale)+" "+text(x&&x.reach);
  if(/世界|全球|跨洲|continental|global|world/i.test(s))return "world";
  if(/跨國|國際|transnational|international/i.test(s))return "world";
  if(/王國|國家|帝國|全國|kingdom|national|country/i.test(s))return "kingdom";
  if(/地區|區域|地方|城鎮|城市|行省|省級|regional|local|province|settlement/i.test(s))return "region";
  const r=tier(x&&x.tier);
  return r>=5?"world":r>=4?"kingdom":"region";
}
function regionAnchor(x){
  const a=text(x&&x.region_id)||text(x&&x.world_region_id)||text(x&&x.province_id)||text(x&&x.base_location_id);
  return a||("unanchored:"+text(x&&x.id));
}
function kingdomAnchor(x){
  const a=text(x&&x.political_entity_id)||text(x&&x.kingdom_id)||text(x&&x.country_id)||text(x&&x.region_id);
  return a||("unanchored:"+text(x&&x.id));
}
function anchor(x,scope){
  return scope==="world"?"world":scope==="kingdom"?kingdomAnchor(x):regionAnchor(x);
}
function orgFamily(o){
  const s=[o&&o.kind,o&&o.category,o&&o.name,o&&o.description,o&&o.specialty].map(text).join(" ");
  let base="other";
  if(has(s,/鍛造|鐵匠|鍛冶|鍛造院|smith|forge/i))base="craft_smith";
  else if(has(s,/煉金|藥劑|藥師|alchemy/i))base="craft_alchemy";
  else if(has(s,/礦務|礦業|採礦|礦材|assay|mining/i))base="resource_mining";
  else if(has(s,/農產|糧|農民|穀|蜂農|畜產|grain|farm/i))base="supply_food";
  else if(has(s,/救難|救護|醫療|診療|傷兵|rescue|medical/i))base="welfare_rescue";
  else if(has(s,/教會|神殿|聖堂|宗教|封印|仲裁所|church|relig/i))base="faith_legal";
  else if(has(s,/外廷|王廷|公證|官署|行政|稅|court|notar|political/i))base="governance";
  else if(has(s,/守備|軍|騎士|衛隊|兵團|military/i))base="military";
  else if(has(s,/林務|巡林|遊俠|獵團|探索|冒險|ranger|explor/i))base="exploration";
  else if(has(s,/商路|商會|商業|貿易|運輸|驛站|河運|渠務|trade|merchant/i))base="trade_logistics";
  else if(has(s,/盜賊|黑市|地下|密會|刺客|criminal|underground/i))base="underworld";
  else if(has(s,/魔法|法師|奧術|術士|學院|學術|arcane|magic/i))base="magic_academic";
  const subtype=text(o&&o.kind)||text(o&&o.category)||"unspecified";
  return base+":"+subtype;
}
function disciplineFamily(d){
  const s=[d&&d.name,d&&d.description,d&&d.specialty,d&&d.family,(d&&d.requirements&&d.requirements.weapon_types||[]).join(" ")].map(text).join(" ");
  const track=d&&d.track==="magic"?"magic":"physical";
  let weapon="mixed";
  if(/武士刀|太刀|居合/.test(s))weapon="katana";
  else if(/槍|矛|長槍|投槍/.test(s))weapon="spear";
  else if(/盾/.test(s)&&/劍|刀/.test(s))weapon="swordshield";
  else if(/弓|弩|射手/.test(s))weapon="bow";
  else if(/短刃|匕首/.test(s))weapon="dagger";
  else if(/劍|刀|刃/.test(s))weapon="blade";
  else if(/拳|掌|徒手|格鬥/.test(s))weapon="unarmed";
  else if(/斧/.test(s))weapon="axe";
  else if(/錘|鎚/.test(s))weapon="hammer";
  else if(track==="magic")weapon="focus";
  let tactic="balanced";
  if(/護印|結界|屏障|驅邪|守護/.test(s))tactic="ward";
  else if(/治癒|治療|回復|生命/.test(s))tactic="healing";
  else if(/幻術|幻影|迷惑/.test(s))tactic="illusion";
  else if(/召喚|契約/.test(s))tactic="summon";
  else if(/救援|撤離|繩|固定/.test(s))tactic="rescue";
  else if(/陣|隊形|槍盾|軍陣/.test(s))tactic="formation";
  else if(/守勢|格擋|招架|防禦|反擊/.test(s))tactic="guard";
  else if(/獵|大型獸|狙|射/.test(s))tactic="ranged_hunt";
  else if(/步法|位移|閃避|先手|迅捷|聽息/.test(s))tactic="mobility";
  else if(/摔|擒|投技/.test(s))tactic="grapple";
  else if(/重擊|破甲|蓄力|猛攻/.test(s))tactic="power";
  let element="none";
  if(/火|炎/.test(s))element="fire";
  else if(/冰|霜|水|潮/.test(s))element="water";
  else if(/雷|電/.test(s))element="lightning";
  else if(/風|嵐/.test(s))element="wind";
  else if(/土|岩|地/.test(s))element="earth";
  else if(/光|聖/.test(s))element="light";
  else if(/暗|影|死亡/.test(s))element="dark";
  else if(/生命|自然|林/.test(s))element="life";
  const institution=text(d&&d.kind)||"tradition";
  const lineage=text(d&&d.family)||"unclassified";
  const skillFamily=asArray(d&&d.skill_family_ids)[0]||"none";
  return [track,weapon,tactic,element,institution,lineage,skillFamily].join(":");
}
function mergeScore(x){
  let n=tier(x&&x.tier)*20;
  n+=text(x&&x.description).length>45?8:4;
  n+=asArray(x&&x.history).length?8:0;
  n+=x&&x.member_bonus?7:0;
  n+=x&&x.primary_facility?5:0;
  n+=x&&x.joinable!==false?3:0;
  if(!/^ORG-ASD2-|^DISC-ASD2-/.test(text(x&&x.id)))n+=5;
  return n;
}
function branchRecord(src,kind){
  return {
    legacy_id:src.id,
    name:src.name,
    kind:kind,
    former_scope:src.scope||null,
    former_tier:src.tier||null,
    base_location_id:src.base_location_id||null,
    specialty:src.specialty||src.description||"",
    mission_themes:[...(src.mission_themes||[])],
    services:[...(src.services||[])],
    former_member_bonus:src.member_bonus?{id:src.member_bonus.id||null,name:src.member_bonus.name||null,text:src.member_bonus.text||null,effects:{...(src.member_bonus.effects||{})}}:null,
    status:"已整併為分會／部門／支系，不再視為獨立同質勢力"
  };
}
function appendBranch(target,src,kind){
  target.branches=Array.isArray(target.branches)?target.branches:[];
  if(!target.branches.some(x=>x&&x.legacy_id===src.id))target.branches.push(branchRecord(src,kind));
  if(kind==="organization"){
    for(const key of ["mission_themes","services","contact_location_ids","contract_archetype_ids","dialogue_record_ids","intel_record_ids","lore_record_ids","related_class_ids","related_subjob_ids","faith_entity_ids"]){
      target[key]=uniq([...(target[key]||[]),...(src[key]||[])]);
    }
    target.branch_specialties=Array.isArray(target.branch_specialties)?target.branch_specialties:[];
    if(!target.branch_specialties.some(x=>x&&x.legacy_id===src.id))target.branch_specialties.push({
      legacy_id:src.id,name:src.name,specialty:src.specialty||src.description||"",former_member_bonus:src.member_bonus?.text||null
    });
  }
  if(kind==="discipline"){
    target.substyles=uniq([...(target.substyles||[]),src.name,...(src.substyles||[])]);
    target.contact_location_ids=uniq([...(target.contact_location_ids||[]),...(src.contact_location_ids||[]),src.base_location_id]);
    for(const key of ["related_class_ids","skill_family_ids","dialogue_record_ids","intel_record_ids","lore_record_ids"]){
      target[key]=uniq([...(target[key]||[]),...(src[key]||[])]);
    }
    target.merged_from_ids=uniq([...(target.merged_from_ids||[]),src.id,...(src.merged_from_ids||[])]);
    target.legacy_names=uniq([...(target.legacy_names||[]),src.name,...(src.legacy_names||[])]);
    target.branch_specialties=Array.isArray(target.branch_specialties)?target.branch_specialties:[];
    if(!target.branch_specialties.some(x=>x&&(x.former_id===src.id||x.legacy_id===src.id)))target.branch_specialties.push({
      former_id:src.id,name:src.name,specialty:src.specialty||src.description||"",
      former_member_bonus:src.member_bonus?.text||null,
      training_tier_ceiling:src.training_tier_ceiling||null
    });
  }
}
const inheritedOrgMap=Object.assign({},DB.organization_merge_map||{});
const inheritedDiscMap=Object.assign({},DB.discipline_merge_map||{});
const orgMap=Object.assign({},inheritedOrgMap);
const discMap=Object.assign({},inheritedDiscMap);
const protectedOrgTargets=new Set(Object.values(inheritedOrgMap).map(id=>resolveMap(inheritedOrgMap,id)));
const protectedDiscTargets=new Set(Object.values(inheritedDiscMap).map(id=>resolveMap(inheritedDiscMap,id)));

const ADVENTURE_BASELINE=16;
const ADVENTURE_TARGET=8;
const ADVENTURE_CANONICAL_IDS=Object.freeze(["ORG-001","ORG-002","ORG-003","ORG-004","ORG-005","ORG-010","ORG-012","ORG-ASD-MISTWARDENS"]);
const ADVENTURE_MERGES=Object.freeze({
  "ORG-006":"ORG-005",
  "ORG-007":"ORG-002",
  "ORG-008":"ORG-002",
  "ORG-009":"ORG-003",
  "ORG-011":"ORG-003",
  "ORG-013":"ORG-001",
  "ORG-014":"ORG-002",
  "ORG-015":"ORG-003"
});

Object.assign(orgMap,{
  ...ADVENTURE_MERGES,
  "ORG-ASD2-CROWN-NOTARIES":"ORG-ASD-CROWN-COURT",
  "ORG-ASD2-RIVERWORKS":"ORG-ASD-ROAD-LEAGUE",
  "ORG-ASD2-AMBER-GROWERS":"ORG-ASD-GRAIN-COMPACT"
});

const DISCIPLINE_BASELINE=(DB.discipline_factions||[]).length;
const DISCIPLINE_HOMOGENEITY_MERGES=Object.freeze({
  "DSC-MAG-27":"DSC-MAG-05",
  "DSC-MAG-14":"DSC-MAG-01",
  "DSC-MAG-24":"DSC-MAG-03",
  "DISC-ASD-IRON-BANNER":"DSC-PHY-02",
  "DISC-ASD-MIST-STEP":"DSC-PHY-16",
  "DISC-ASD2-CROWN-SPEAR":"DSC-PHY-03",
  "DISC-ASD2-WHITE-TOWER-WARD":"DSC-MAG-17"
});
const DISCIPLINE_TARGET=DISCIPLINE_BASELINE-Object.keys(DISCIPLINE_HOMOGENEITY_MERGES).length;
const DISCIPLINE_PROTECTED_IDS=Object.freeze([
  "DSC-PHY-02","DSC-PHY-03","DSC-PHY-08","DSC-PHY-11","DSC-PHY-12","DSC-PHY-16","DSC-PHY-21","DSC-PHY-24","DSC-PHY-31",
  "DISC-ASD2-REEF-ROPE","DISC-ASD2-FROST-SPEAR",
  "DSC-MAG-06","DSC-MAG-09","DSC-MAG-10","DSC-MAG-11","DSC-MAG-13","DSC-MAG-17","DSC-MAG-20","DSC-MAG-21","DSC-MAG-25","DSC-MAG-26"
]);
Object.assign(discMap,DISCIPLINE_HOMOGENEITY_MERGES);

function consolidate(rows,map,familyFn,kind,protectedTargets){
  const byId=new Map((rows||[]).map(x=>[x.id,x]));
  const extensionPrefix=kind==="organization"?/^ORG-ASD2-/:/^DISC-ASD2-/;
  for(const [from,to0] of Object.entries(map)){
    const src=byId.get(from),to=resolveMap(map,to0),dst=byId.get(to);
    if(src&&dst&&src!==dst)appendBranch(dst,src,kind);
  }
  const groups=new Map();
  for(const row of rows||[]){
    if(!row||!row.id||map[row.id])continue;
    const scope=scopeLevel(row),key=[scope,anchor(row,scope),familyFn(row)].join("|");
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(row);
  }
  for(const [key,list] of groups){
    const scope=key.split("|")[0],cap=CAPS[scope]||2;
    if(list.length<=cap)continue;
    const ranked=list.slice().sort((a,b)=>mergeScore(b)-mergeScore(a)||text(a.id).localeCompare(text(b.id)));
    const keep=ranked.slice(0,cap);
    let excess=list.length-cap;
    const overflow=ranked.filter(x=>!protectedTargets.has(x.id)&&(extensionPrefix.test(text(x.id))||x.consolidation_candidate===true)).reverse();
    for(const src of overflow){
      if(excess<=0)break;
      let dst=keep.find(x=>x.id!==src.id&&x.base_location_id&&x.base_location_id===src.base_location_id);
      if(!dst)dst=keep.find(x=>x.id!==src.id&&!map[x.id]);
      if(!dst)continue;
      map[src.id]=dst.id;appendBranch(dst,src,kind);excess--;
    }
  }
  for(const key of Object.keys(map))map[key]=resolveMap(map,map[key]);
  const ids=new Set((rows||[]).map(x=>x.id));
  for(const [from,to] of Object.entries(map))if(!ids.has(to))delete map[from];
  const aliases=new Set(Object.keys(map));
  return (rows||[]).filter(x=>x&&x.id&&!aliases.has(x.id));
}

DB.world_organizations=consolidate(DB.world_organizations||[],orgMap,orgFamily,"organization",protectedOrgTargets);
DB.discipline_factions=consolidate(DB.discipline_factions||[],discMap,disciplineFamily,"discipline",protectedDiscTargets);
DB.organization_merge_map=orgMap;
DB.discipline_merge_map=discMap;

const disciplinePhysical=(DB.discipline_factions||[]).filter(x=>x?.track==="physical").length;
const disciplineMagic=(DB.discipline_factions||[]).filter(x=>x?.track==="magic").length;
const disciplineTotal=(DB.discipline_factions||[]).length;
if(DB.discipline_system&&typeof DB.discipline_system==="object"){
  DB.discipline_system.physical_count=disciplinePhysical;
  DB.discipline_system.magic_count=disciplineMagic;
  DB.discipline_system.total_count=disciplineTotal;
  DB.discipline_system.state_cap=disciplineTotal;
  DB.discipline_system.runtime_consolidation_revision=REV;
  DB.discipline_system.rules=uniq((DB.discipline_system.rules||[]).map(rule=>String(rule)
    .replace(/維持49個canonical武技／魔法流派/g,`維持${disciplineTotal}個canonical武技／魔法流派`)
    .replace(/物理系31個、魔法系30個/g,`物理系${disciplinePhysical}個、魔法系${disciplineMagic}個`)));
  DB.discipline_system.rules.push("CURRENT-1.85.1：玩法循環、技能家族、對應職業、接觸設施與會員加成高度重疊者改列同一傳承的專修支系；只共享技能家族但訓練目的、制度或高階資格不同者保留獨立。");
}
const canonAI=find(DB.management_ai||[],"AI-DISCIPLINE-CANON");
if(canonAI){
  canonAI.responsibility=`維持${disciplineTotal}個canonical武技／魔法流派與世界史、組織、職業、技能家族的一致性。`;
  canonAI.validations=(canonAI.validations||[]).map(v=>String(v)
    .replace(/物理31魔法30/g,`物理${disciplinePhysical}魔法${disciplineMagic}`)
    .replace(/49個canonical武技／魔法流派/g,`${disciplineTotal}個canonical武技／魔法流派`));
}

function mapScalar(obj,key,map){
  if(obj&&obj[key]&&typeof obj[key]==="string")obj[key]=resolveMap(map,obj[key]);
}
function mapArray(obj,key,map){
  if(obj&&Array.isArray(obj[key]))obj[key]=uniq(obj[key].map(x=>typeof x==="string"?resolveMap(map,x):x));
}
function walk(v,seen){
  if(!v||typeof v!=="object")return;
  if(seen.has(v))return;seen.add(v);
  const orgScalars=["organization_id","organizationId","org_id","parent_org_id","required_organization","issuer_organization_id"];
  const orgArrays=["organization_ids","related_organization_ids"];
  const discScalars=["discipline_id","disciplineId","required_discipline"];
  const discArrays=["discipline_ids","related_discipline_ids"];
  for(const k of orgScalars)mapScalar(v,k,orgMap);
  for(const k of orgArrays)mapArray(v,k,orgMap);
  for(const k of discScalars)mapScalar(v,k,discMap);
  for(const k of discArrays)mapArray(v,k,discMap);
  if(v.affiliation_treasury_owner&&v.affiliation_treasury_owner.type==="organization")mapScalar(v.affiliation_treasury_owner,"id",orgMap);
  if(v.affiliation_treasury_owner&&v.affiliation_treasury_owner.type==="discipline")mapScalar(v.affiliation_treasury_owner,"id",discMap);
  if(v.affiliation_skill_owner&&v.affiliation_skill_owner.type==="organization")mapScalar(v.affiliation_skill_owner,"id",orgMap);
  if(v.affiliation_skill_owner&&v.affiliation_skill_owner.type==="discipline")mapScalar(v.affiliation_skill_owner,"id",discMap);
  if(v.a_type==="organization")mapScalar(v,"a_id",orgMap);
  if(v.b_type==="organization")mapScalar(v,"b_id",orgMap);
  if(v.a_type==="discipline")mapScalar(v,"a_id",discMap);
  if(v.b_type==="discipline")mapScalar(v,"b_id",discMap);
  for(const x of Object.values(v))walk(x,seen);
}
walk(DB,new WeakSet());

function normalizeRelations(key,map){
  const out=[],seen=new Set();
  for(const r of DB[key]||[]){
    if(!r||!r.a||!r.b)continue;
    r.a=resolveMap(map,r.a);r.b=resolveMap(map,r.b);
    if(r.a===r.b)continue;
    const k=[r.a,r.b].sort().join("|");
    if(seen.has(k))continue;
    seen.add(k);out.push(r);
  }
  DB[key]=out;
}
normalizeRelations("organization_relations",orgMap);
normalizeRelations("discipline_relations",discMap);

const ORG_IDENTITY={
  governance:["法統與公文","把道路、稅役、通行與契約轉成可追查的責任鏈","程序緩慢，但能提供最高可信度的行政證據","地方擴張使文書量與偽造案同步增加"],
  faith_legal:["信仰仲裁與封印","以誓約、公證死亡、封印與救濟維持超越地方領主的信任","權威依賴教義與程序，不能任意替王權執法","異常事件增加，使公開教務與機密封印之間更緊張"],
  military:["守土與動員","用輪值、哨線、隊形與後勤把地區危險壓在居民之外","擅長集體紀律而非個人決鬥","邊境威脅與護送需求讓兵力長期被分散"],
  exploration:["荒野治理","以路標、採集許可、追蹤與災害預警管理文明邊界","知道哪裡能去，也知道何時不該去","資源壓力與冒險者湧入使保育與開採衝突升高"],
  trade_logistics:["道路與物流","靠驛站、護運、倉儲、水路與風險分攤連接市場","真正的力量是讓貨物準時抵達","商路延伸後，走私、道路維護與價格波動成為主要負擔"],
  craft_smith:["鍛造標準與軍需","以材料鑑定、工法分級與師徒責任維持金屬製品品質","高階工法靠資格與長期訓練，不靠一次性配方","精鋼以上需求增加，但合格工匠與材料仍有限"],
  craft_alchemy:["藥劑標準與危材","以純度、批號、禁材與反應紀錄降低藥害","重視可重現配方與材料來源","新素材增加速度快於地方檢驗能力"],
  resource_mining:["礦產鑑定與採掘秩序","以礦印、成色、礦脈紀錄與安全規程降低摻假與塌方","不生產傳說礦物，只確認現有資源品質","深層採掘與市場需求正在推高事故及非法採礦"],
  supply_food:["糧食與民生協調","把農戶、倉商與城鎮需求放進同一套季節供應協議","強項是穩定供應而非追求最高售價","天候與商路波動讓地方糧價更容易互相傳導"],
  welfare_rescue:["救難與醫療網","以現場分級、撤離路線、急救與物資預置降低死亡","先確保撤離與生存，再談英雄式冒險","災害與邊境衝突讓常備物資持續吃緊"],
  underworld:["地下交換網","以匿名引介、黑市信用與情報交換繞過正式制度","信任建立在可驗證履約，而非公開名聲","官方稽查加強迫使網路更加碎片化"],
  magic_academic:["術式研究與傳承","以抄錄、實驗、導師審核與危險分級保存魔法知識","知識可傳授，但高階術式必須有前置與責任人","研究需求與安全規範正形成長期拉鋸"],
  other:["專門職能","以長期累積的專業與人脈處理一般勢力不願承擔的工作","特色來自不可替代的職能而非單純數值加成","目前正面臨擴張需求與人手有限的矛盾"]
};
const DISC_IDENTITY={
  ward:["守護術式","先建立穩定防線，再處理異常來源","面對純粹速度與長時間消耗時較被動"],
  healing:["戰地回復","用判斷傷勢與資源節奏維持隊伍續戰","缺乏直接壓制能力"],
  illusion:["感知誤導","以錯位、遮蔽與判斷差製造勝機","對不依賴視聽判斷的敵人效果較差"],
  summon:["契約協同","把施術者、召喚體與場地視為一個戰術單位","召喚體受制時本體壓力會快速上升"],
  rescue:["救援控制","先固定位置與退路，再用短兵保護撤離","開闊地正面火力不足"],
  formation:["隊形協同","用距離、掩護與交替前進把個人技術轉成集體優勢","脫離隊形後上限明顯下降"],
  guard:["守中反擊","以穩定架勢換取讀招與反擊窗口","容易被遠距離與持續消耗拖慢"],
  ranged_hunt:["獵殺控制","先限制大型目標移動，再從安全距離累積傷勢","狹窄近身戰不利"],
  mobility:["機動先手","靠步法、感知與短距位移挑選交戰時機","失去空間後優勢快速下降"],
  grapple:["貼身制御","用重心、關節與位置控制打斷對手節奏","對大型或難以抓握目標受限"],
  power:["破勢重擊","用蓄力與結構性打擊突破防禦","出手節奏較慢且容易被預判"],
  balanced:["基礎戰法","以可靠姿勢、距離與節奏建立可延伸的底子","沒有單一極端優勢，需靠熟練度取勝"]
};
function tacticOf(d){return disciplineFamily(d).split(":")[2]||"balanced";}
function enrichOrg(o){
  const cluster=orgFamily(o),f=cluster.split(":")[0],p=ORG_IDENTITY[f]||ORG_IDENTITY.other;
  o.identity_family=f;
  o.signature=o.signature||p[0];
  o.institutional_culture=o.institutional_culture||p[1];
  o.strategic_tension=o.strategic_tension||p[3];
  o.distinctive_features=uniq([...(o.distinctive_features||[]),p[0],p[2],p[3]]);
  const old=Array.isArray(o.history)?o.history:(text(o.history)?[text(o.history)]:[]);
  if(!old.length)old.push("最初由地方上的"+p[0]+"需求逐步形成固定規章，之後才取得現在的名稱、據點與權限。");
  if((o.branches||[]).length)old.push("近年將若干職能高度重疊的地方團體改編為分會或部門，保留人員與地方經驗，但統一資格、財務與責任。");
  o.history=uniq(old);
  o.history_summary=o.history_summary||o.history.join(" ");
  o.current_state=o.current_state||p[3]+"；組織正優先維持核心職能，而非無限制擴張分會數量。";
  o.identity_profile={scope_level:scopeLevel(o),family:f,identity_cluster:cluster,signature:o.signature,culture:o.institutional_culture,tension:o.strategic_tension};
}
function enrichDiscipline(d){
  const t=tacticOf(d),p=DISC_IDENTITY[t]||DISC_IDENTITY.balanced;
  d.combat_identity=d.combat_identity||p[0];
  d.training_philosophy=d.training_philosophy||p[1];
  d.signature=d.signature||p[0];
  d.weakness=d.weakness||p[2];
  d.distinctive_features=uniq([...(d.distinctive_features||[]),p[0],p[1],p[2]]);
  const old=Array.isArray(d.history)?d.history:(text(d.history)?[text(d.history)]:[]);
  if(!old.length)old.push("此傳承從實際戰鬥與訓練事故中逐步固定教範，後來才形成可被辨識的師承名稱。");
  if((d.branches||[]).length)old.push("相近教範不再各自視為獨立流派，而改列支系；差異保留在武器、場地與師承習慣中。");
  d.history=uniq(old);
  d.historical_origin=d.historical_origin||d.history.join(" ");
  d.current_state=d.current_state||"現行教學重視"+p[1]+"；同時避免只以招式名稱區分支系，必須保留戰術方法或訓練哲學上的實質差異。";
  d.identity_profile={scope_level:scopeLevel(d),family:disciplineFamily(d),signature:d.signature,weakness:d.weakness};
}
for(const o of DB.world_organizations||[])enrichOrg(o);
for(const d of DB.discipline_factions||[])enrichDiscipline(d);

const ADVENTURE_ORG_OVERRIDES={
 "ORG-001":{
  role:"跨境綜合委託與資格網絡",
  description:"跨越多個國家與商路的冒險者公共委託網，負責資格紀錄、一般委託、情報交換與跨境信用；不取代專業探勘、考古或研究團體。",
  history:["早期冒險委託散落於旅店、商站與地方軍營，報酬、責任與失蹤紀錄互不相通。","數次跨境委託糾紛後，各地分會共同建立冒險者身分、任務風險與交付憑證制度；英雄功績評議會後來改為內部功績審核部。"],
  current_state:"目前正擴張跨境委託交換，但刻意把深層考古、魔物學與遠航專業留給合作組織；總會重點是信用與仲介，而不是壟斷所有冒險活動。",
  signature:"跨境委託信用網",
  specialty:"一般委託、冒險者資格、跨境情報與功績審核",
  institutional_culture:"重視可驗證的履約紀錄、任務風險標示與分會互認；名聲不能取代交付證據。",
  strategic_tension:"分會越多，地方彈性與總會統一標準之間的摩擦越強。",
  distinctive_features:["唯一跨區互認的冒險者委託網","功績評議改為內部審核部，不再另立平行公會","只處理通用仲介，專業領域轉交合作組織"],
  mission_themes:["一般護送","採集委託","地方調查","公開討伐","跨境委託"],
  services:["委託","情報","地圖","冒險者資格","收購櫃檯","功績審核"]
 },
 "ORG-002":{
  role:"遠征踏查與新路開闢",
  description:"專門處理文明邊界以外的長距離踏查、秘境路線、高峰與荒野營地；邊境拓荒團、秘境踏查隊與高峰攀登協會已改編為其專門隊。",
  history:["最初由長距離商路與學術遠征共用嚮導、帳篷與路標紀錄而形成。","邊境拓荒、秘境踏查與高峰攀登團體後來共享補給與事故資料，最終整併為地形不同的專門隊。"],
  current_state:"新路開闢速度已放慢，協會把更多資源投入撤退路線、營地補給與季節性封路判定，避免把每次發現都變成永久開放區。",
  signature:"遠征路線與生存踏查",
  specialty:"長距離探索、秘境、高峰、邊境開路與營地規劃",
  institutional_culture:"先確認回程、補給與天候窗口，再討論深入距離；完整撤退紀錄與成功抵達同等重要。",
  strategic_tension:"冒險者希望更快開放新區，協會則傾向保留季節性封鎖與環境承載上限。",
  distinctive_features:["秘境／高峰／邊境三種專門隊共用後勤","任務核心是到得了也回得來","路線情報有季節有效期，不視為永久安全"],
  mission_themes:["遠征","秘境踏查","高峰攀登","邊境開路","營地補給","撤退路線"],
  services:["遠征準備","路線情報","地圖","營地規劃","危險通報"]
 },
 "ORG-003":{
  role:"遺跡考古與地下發掘",
  description:"負責遺跡、古墓、地穴與古藏的合法發掘、編目與回收；灰鏟古墓團、古藏尋獵會與地穴探險隊改編為墓葬、文物與地下通道專門隊。",
  history:["早期遺跡探索常由尋寶隊自行帶走物品，導致出土地點與年代證據大量流失。","古墓、古藏與地穴團體在多次歸屬爭議後共同採用分層測記、發現物編號與危險封存程序。"],
  current_state:"發掘權與文物市場需求持續衝突；組織允許合理報酬，但要求重要發現先完成定位、編目與危險評估。",
  signature:"有紀錄的發掘與回收",
  specialty:"遺跡、古墓、地穴、文物編目與危險封存",
  institutional_culture:"位置、地層與發現順序比單件寶物更重要；未記錄的掠取會降低成員信用。",
  strategic_tension:"冒險收益、地方所有權與學術保存三者經常彼此衝突。",
  distinctive_features:["古墓／古藏／地穴三專門隊統一發掘規範","出土物先編目再分配","危險封印物不直接進入一般市場"],
  mission_themes:["遺跡發掘","古墓調查","地穴探索","文物回收","封印物處置","出土地點記錄"],
  services:["發掘許可","遺跡情報","文物編目","地下路線","危險物封存"]
 },
 "ORG-004":{
  role:"深層測繪與危區製圖",
  description:"以地下城、洞穴、礦坑、立體遺構與高風險區域的精密製圖為主，不負責文物所有權或一般討伐。",
  history:["由礦坑測量師、地下嚮導與事故救援製圖員共同建立，起初只交換深度與方位校正方法。","地下城擴張後，逐步形成危險層級、失效路線與可撤退節點的標準圖例。"],
  current_state:"最大的問題不是缺圖，而是舊圖過期；測繪會正在建立『最後確認時間』制度，避免玩家把歷史地圖當成即時安全保證。",
  signature:"可驗證的三維危區地圖",
  specialty:"地下深度、方位、危險層、撤退節點與地圖時效",
  institutional_culture:"不畫沒走過的路，不把傳聞線條標成實測通道；每張圖都保留測量日期與誤差。",
  strategic_tension:"完整製圖需要反覆進出危區，但市場常要求一次探索就交付『完整地圖』。",
  distinctive_features:["地圖具有時效與誤差欄位","專精三維地下空間而非一般探險","撤退節點與失效路線同樣列入正式成果"],
  mission_themes:["地下測繪","危區製圖","舊圖複查","路標校正","撤退點確認"],
  services:["地圖","測量器材","舊圖校驗","危區路線評估"]
 },
 "ORG-005":{
  role:"懸賞追蹤與魔物討伐",
  description:"處理有明確目標、證據與報酬來源的懸賞、危險魔物追蹤與地方討伐；地方魔物討伐隊已成為其區域行動分隊。",
  history:["最初由城鎮懸賞榜與獵人證明制度演變，早期常發生重複領賞與錯殺普通野獸。","地方討伐隊併入後，建立目標確認、危險分級、戰利證據與民害優先級。"],
  current_state:"高報酬懸賞容易吸引過量獵手，公會正在限制同一目標的重複接取，並把生態性魔物問題轉交怪物學者協會共同判定。",
  signature:"有證據的目標追蹤",
  specialty:"懸賞、危險個體追蹤、地方魔物討伐與戰果驗證",
  institutional_culture:"先確認目標身份與危害，再計算報酬；『看起來像』不能當作領賞證據。",
  strategic_tension:"快速清除威脅與避免濫殺、重複懸賞之間存在長期拉鋸。",
  distinctive_features:["地方討伐隊改為區域行動分隊","懸賞接取有目標上限，避免無限重複","研究型魔物案件轉介學者協會"],
  mission_themes:["懸賞","追蹤","危險魔物討伐","戰果驗證","護村"],
  services:["懸賞板","目標情報","戰果驗證","危險分級","討伐委託"]
 },
 "ORG-010":{
  role:"遠航探險與海外補給",
  description:"專注海岸以外的遠航、島鏈、未知港口與長時間船上補給；不與陸上遠路探勘協會重複。",
  history:["由商船領航員、博物採集隊與冒險者共同分攤遠洋風險而成。","數次補給錯估與失聯事件後，公會開始把飲水、靠港權與返航季風列為與目的地同等重要的任務條件。"],
  current_state:"海外情報增加，但可靠港口與補給點沒有同步成長；公會目前限制沒有返航窗口的遠洋委託。",
  signature:"跨海遠征後勤",
  specialty:"海路、島鏈、遠洋補給、未知港口與返航窗口",
  institutional_culture:"任何遠航計畫都必須同時寫出目的地、補給鏈與返航方案。",
  strategic_tension:"新航路帶來高收益，但一次補給失算就可能讓整支遠征隊消失。",
  distinctive_features:["唯一以海上補給鏈為核心的冒險組織","任務強制計算返航季節","與陸上探勘組織分工明確"],
  mission_themes:["遠航","島鏈踏查","海岸測繪","未知港口","船隊護航","遠洋補給"],
  services:["航路情報","遠征委託","補給規劃","海圖","靠港情報"]
 },
 "ORG-012":{
  role:"魔物生態與危險研究",
  description:"研究魔物棲地、行為、遷徙、素材與異常狀態，偏向觀察與樣本證據；不以擊殺數量作為主要成果。",
  history:["由獵人紀錄、藥師素材簿與地方目擊報告逐步合併成正式研究協會。","與懸賞獵人公會分工後，學者協會負責判定族群、生態與異常，討伐公會只處理確認需要移除的威脅。"],
  current_state:"市場對魔物素材需求上升，使研究與捕獵邊界更難維持；協會增加非致死觀察與族群數量紀錄。",
  signature:"先理解再處置",
  specialty:"魔物生態、樣本、棲地、異常與族群風險判定",
  institutional_culture:"單一屍體不能代表整個物種；研究紀錄必須標示地點、季節、狀態與觀察方式。",
  strategic_tension:"稀有素材的高價會誘使研究委託被當成狩獵許可。",
  distinctive_features:["研究成果不以擊殺量計算","與懸賞討伐組織建立案件轉介","可將『怪物很多』拆成遷徙、繁殖或異常事件"],
  mission_themes:["生態觀察","樣本採集","足跡調查","族群估算","異常魔物研究"],
  services:["魔物圖鑑","樣本鑑定","棲地情報","研究委託","危險判定"]
 },
 "ORG-ASD-MISTWARDENS":{
  role:"地方林務與文明邊界管理",
  description:"阿斯戴爾霧杉地區的林徑、採集許可、野火與地方生態管理組織；它不是泛用冒險公會，而是具有行政責任的地方巡林體系。",
  history:["霧杉聚落早期由獵戶與教會共同維護林徑，火災與過度採集後才形成正式林務會。","隨外來冒險者增加，林務會把採集區輪休、路標與祭壇周邊禁入線納入同一套許可制度。"],
  current_state:"採集需求持續增加，但霧杉林的恢復速度有限；林務會正在縮小部分採集區並增加可替代路線。",
  signature:"林徑許可與資源輪休",
  specialty:"地方巡林、採集許可、野火警戒、林徑維護與保育",
  institutional_culture:"熟悉森林不等於擁有森林；採集與探索都必須服從季節輪休和安全封鎖。",
  strategic_tension:"地方生計依賴森林資源，但冒險與市場需求正在逼近資源恢復上限。",
  distinctive_features:["唯一保留的地方型冒險治理組織","採集許可直接連動資源輪休","兼具巡林、保育與道路安全責任"],
  mission_themes:["巡林","採集許可","野火警戒","林徑維護","資源輪休"],
  services:["採集許可","林徑情報","巡林委託","資源狀態","危險封鎖"]
 }
};

const ASD_ORG_OVERRIDES={
 "ORG-ASD-CROWN-COURT":{
  history:["王國早期各地稅役、道路與通行文書互不相認，王都遂把對外行政整理成外廷制度。","隨王冠大道延伸，地方公證職能被納入外廷，不再另立平行行政組織。"],
  current_state:"現正處理道路擴建、契約偽造與地方申訴增加三項壓力；公證部門強調證據鏈，外廷官員則更關注行政效率。",
  distinctive_features:["王國公開行政窗口","跨領地文書與通行權責","公證部門已整併為內設職能"]
 },
 "ORG-ASD-ROAD-LEAGUE":{
  history:["最初是護送商隊共享路況與驛站成本的協議，後來才取得王國商路聯盟分會資格。","河運與渠務團體在共同維護橋路、水閘後併入聯盟，形成陸路與水路並行的物流體系。"],
  current_state:"商路仍在擴張，但維修費、走私與水路淤塞同時增加；聯盟正把資源從開新線轉向維持既有節點。",
  distinctive_features:["跨城鎮物流協調","陸路與水路共同調度","護運契約與市場供應直接連動"]
 },
 "ORG-ASD-GRAIN-COMPACT":{
  history:["數次季節性糧價衝突後，農戶、糧商與城鎮代表建立固定議價席位。","琥珀田農產協會後來改為農產分會，使蜂蠟、亞麻、乳品與主糧進入同一季節供應協議。"],
  current_state:"目前沒有全面糧荒，但不同城鎮的庫存差距正在擴大；議會的主要爭論從價格轉向誰應先獲得有限運力。",
  distinctive_features:["農戶與商人共同議價","季節庫存與運力協調","地方農產分會保留品項專業"]
 }
};
for(const [id,patch] of Object.entries(ASD_ORG_OVERRIDES)){
  const o=find(DB.world_organizations,id);if(!o)continue;
  o.history=uniq(patch.history);o.history_summary=o.history.join(" ");o.current_state=patch.current_state;
  o.distinctive_features=uniq([...(o.distinctive_features||[]),...patch.distinctive_features]);
}

for(const [id,patch] of Object.entries(ADVENTURE_ORG_OVERRIDES)){
  const o=find(DB.world_organizations,id);if(!o)continue;
  o.adventure_role=patch.role;
  o.description=patch.description||o.description;
  o.history=uniq(patch.history||o.history||[]);o.history_summary=o.history.join(" ");o.current_state=patch.current_state||o.current_state;
  o.signature=patch.signature||o.signature;o.specialty=patch.specialty||o.specialty;
  o.institutional_culture=patch.institutional_culture||o.institutional_culture;
  o.strategic_tension=patch.strategic_tension||o.strategic_tension;
  o.distinctive_features=uniq([...(o.distinctive_features||[]),...(patch.distinctive_features||[])]);
  o.mission_themes=uniq(patch.mission_themes||o.mission_themes||[]);
  o.services=uniq(patch.services||o.services||[]);
  o.identity_profile={...(o.identity_profile||{}),family:"exploration",signature:o.signature,adventure_role:o.adventure_role};
}

function audit(){
  const adventureRows=(DB.world_organizations||[]).filter(x=>x&&x.category==="冒險與探索");
  const issues=[],stats={
    organizations:(DB.world_organizations||[]).length,
    disciplines:(DB.discipline_factions||[]).length,
    organization_aliases:Object.keys(orgMap).length,
    discipline_aliases:Object.keys(discMap).length,
    discipline_canonical_before:DISCIPLINE_BASELINE,
    discipline_canonical_after:(DB.discipline_factions||[]).length,
    discipline_homogeneity_merges:Object.keys(DISCIPLINE_HOMOGENEITY_MERGES).length,
    merged_branches:0,
    adventure_organizations:adventureRows.length,
    adventure_baseline:ADVENTURE_BASELINE,
    adventure_target:ADVENTURE_TARGET,
    adventure_reduction:ADVENTURE_BASELINE-adventureRows.length,
    adventure_reduction_pct:Math.round((ADVENTURE_BASELINE-adventureRows.length)/ADVENTURE_BASELINE*1000)/10
  };
  const adventureIds=new Set(adventureRows.map(x=>x.id));
  if(adventureRows.length!==ADVENTURE_TARGET)issues.push("冒險類組織數量未達50%整併目標:"+adventureRows.length+"/"+ADVENTURE_TARGET);
  for(const id of ADVENTURE_CANONICAL_IDS)if(!adventureIds.has(id))issues.push("冒險類核心組織缺失:"+id);
  for(const [from,to] of Object.entries(ADVENTURE_MERGES)){
    if(adventureIds.has(from))issues.push("冒險類舊組織仍獨立存在:"+from);
    if(resolveMap(orgMap,from)!==to)issues.push("冒險類舊ID映射異常:"+from+"->"+resolveMap(orgMap,from));
  }
  const orgIds=new Set((DB.world_organizations||[]).map(x=>x.id)),discIds=new Set((DB.discipline_factions||[]).map(x=>x.id));
  for(const [from,to] of Object.entries(orgMap))if(!orgIds.has(resolveMap(orgMap,to)))issues.push("組織舊ID映射斷鏈:"+from+"->"+to);
  for(const [from,to] of Object.entries(discMap))if(!discIds.has(resolveMap(discMap,to)))issues.push("流派舊ID映射斷鏈:"+from+"->"+to);
  for(const kind of ["organization","discipline"]){
    const rows=kind==="organization"?DB.world_organizations||[]:DB.discipline_factions||[];
    const familyFn=kind==="organization"?orgFamily:disciplineFamily;
    const groups=new Map();
    for(const x of rows){
      const scope=scopeLevel(x),key=[scope,anchor(x,scope),familyFn(x)].join("|");
      groups.set(key,(groups.get(key)||0)+1);
      stats.merged_branches+=(x.branches||[]).length;
      for(const req of kind==="organization"?["history_summary","current_state","signature","distinctive_features"]:["historical_origin","current_state","signature","weakness","distinctive_features"]){
        if(!x[req]||(Array.isArray(x[req])&&!x[req].length))issues.push(kind+"特色欄位缺失:"+x.id+"/"+req);
      }
    }
    for(const [key,n] of groups){
      const scope=key.split("|")[0],cap=CAPS[scope]||2;
      if(n>cap)issues.push(kind+"同質群超過"+scope+"上限:"+key+"="+n+"/"+cap);
    }
  }
  for(const [from,to] of Object.entries(DISCIPLINE_HOMOGENEITY_MERGES)){
    if(discIds.has(from))issues.push("高同質流派仍獨立存在:"+from);
    if(resolveMap(discMap,from)!==to)issues.push("高同質流派映射異常:"+from+"->"+resolveMap(discMap,from));
  }
  for(const id of DISCIPLINE_PROTECTED_IDS)if(!discIds.has(id))issues.push("差異化流派遭誤合併:"+id);
  if((DB.discipline_factions||[]).length!==DISCIPLINE_TARGET)issues.push("canonical流派數量異常:"+(DB.discipline_factions||[]).length+"/"+DISCIPLINE_TARGET);
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats};
}

DB.meta=DB.meta||{};
DB.meta.affiliation_identity_depth_revision=REV;
DB.affiliation_identity_depth_system={
  version:REV,release:RELEASE,save_compatible:true,
  caps:{world:4,kingdom:3,region:2},
  merge_rule:"同作用域＋同地域錨點＋同核心職能／戰術方法才視為同質；不同職能不因同層級而強制合併。",
  adventure_consolidation:{
    baseline:ADVENTURE_BASELINE,target:ADVENTURE_TARGET,reduction:ADVENTURE_BASELINE-ADVENTURE_TARGET,reduction_pct:50,
    canonical_ids:[...ADVENTURE_CANONICAL_IDS],legacy_to_branch:{...ADVENTURE_MERGES},
    rule:"保留8個互補核心角色；被整併者轉為分會／專門隊並保留舊ID、任務、情報與接觸點映射。"
  },
  legacy_aliases:{organization:Object.keys(orgMap).length,discipline:Object.keys(discMap).length},
  discipline_consolidation:{
    canonical_before:DISCIPLINE_BASELINE,canonical_after:disciplineTotal,physical_after:disciplinePhysical,magic_after:disciplineMagic,merged:Object.keys(DISCIPLINE_HOMOGENEITY_MERGES).length,
    legacy_to_canonical:{...DISCIPLINE_HOMOGENEITY_MERGES},
    protected_distinct:[...DISCIPLINE_PROTECTED_IDS],
    rule:"只有玩法循環、技能家族、職業重疊、接觸制度與會員效果整體高度同質才合併；來源、用途、高階資格或核心戰術不同者不得只因同武器／同元素而合併。"
  },
  required_depth:["歷史","現狀","核心特色","制度／訓練文化","限制／張力"],
  explicit_asdail_merges:{
    "王冠公證人會":"阿斯戴爾王國外廷・公證部門",
    "河谷渠務聯會":"王國商路聯盟阿斯戴爾分會・水運渠務部",
    "琥珀田農產協會":"銀穗糧議會・農產分會"
  }
};
if(Array.isArray(DB.integration_registry&&DB.integration_registry.optimization_notes))DB.integration_registry.optimization_notes.push(RELEASE+"／"+REV+"：完整載入庫高同質流派收斂7組，55→48；既有術式重疊3組與阿斯戴爾地方支系4組改列專修支系。舊ID、職業、技能家族、對話、情報、正史引用、接觸點與存檔進度保留映射。");
globalThis.resolveOrganizationAlias=id=>resolveMap(orgMap,id);
globalThis.resolveDisciplineAlias=id=>resolveMap(discMap,id);
globalThis.runAffiliationIdentityDepthAudit=audit;
globalThis.QUNLU_CORE&&globalThis.QUNLU_CORE.registerModule&&globalThis.QUNLU_CORE.registerModule("src/affiliation-identity-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
DB.affiliation_identity_depth_system.initial_audit=audit();
})();