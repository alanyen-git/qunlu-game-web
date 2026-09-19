/* 群陸旅誌：組織／流派辨識度深化 CURRENT-1.79.0
 * AFFILIATION-IDENTITY-DEPTH-1.0
 * 同質勢力收斂、舊ID映射、歷史／現況／特色補全與作用域上限稽核。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.79.0";
const REV="AFFILIATION-IDENTITY-DEPTH-1.0";
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
  if(/世界|全球|跨洲/.test(s))return "world";
  if(/跨國|國際/.test(s))return "world";
  if(/王國|國家|帝國|全國/.test(s))return "kingdom";
  if(/地區|區域|地方|城鎮|城市|行省|省級/.test(s))return "region";
  const r=tier(x&&x.tier);
  return r>=5?"world":r>=4?"kingdom":"region";
}
function regionAnchor(x){
  return text(x&&x.region_id)||text(x&&x.world_region_id)||text(x&&x.province_id)||text(x&&x.base_location_id)||"global";
}
function kingdomAnchor(x){
  return text(x&&x.political_entity_id)||text(x&&x.kingdom_id)||text(x&&x.country_id)||text(x&&x.region_id)||"world";
}
function anchor(x,scope){
  return scope==="world"?"world":scope==="kingdom"?kingdomAnchor(x):regionAnchor(x);
}
function orgFamily(o){
  const s=[o&&o.kind,o&&o.category,o&&o.name,o&&o.description,o&&o.specialty].map(text).join(" ");
  if(has(s,/鍛造|鐵匠|鍛冶|鍛造院|smith|forge/i))return "craft_smith";
  if(has(s,/煉金|藥劑|藥師|alchemy/i))return "craft_alchemy";
  if(has(s,/礦務|礦業|採礦|礦材|assay|mining/i))return "resource_mining";
  if(has(s,/農產|糧|農民|穀|蜂農|畜產|grain|farm/i))return "supply_food";
  if(has(s,/救難|救護|醫療|診療|傷兵|rescue|medical/i))return "welfare_rescue";
  if(has(s,/教會|神殿|聖堂|宗教|封印|仲裁所|church|relig/i))return "faith_legal";
  if(has(s,/外廷|王廷|公證|官署|行政|稅|court|notar|political/i))return "governance";
  if(has(s,/守備|軍|騎士|衛隊|兵團|military/i))return "military";
  if(has(s,/林務|巡林|遊俠|獵團|探索|冒險|ranger|explor/i))return "exploration";
  if(has(s,/商路|商會|商業|貿易|運輸|驛站|河運|渠務|trade|merchant/i))return "trade_logistics";
  if(has(s,/盜賊|黑市|地下|密會|刺客|criminal|underground/i))return "underworld";
  if(has(s,/魔法|法師|奧術|術士|學院|學術|arcane|magic/i))return "magic_academic";
  return "other";
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
  return [track,weapon,tactic,element].join(":");
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
    status:"已整併為分會／部門／支系，不再視為獨立同質勢力"
  };
}
function appendBranch(target,src,kind){
  target.branches=Array.isArray(target.branches)?target.branches:[];
  if(!target.branches.some(x=>x&&x.legacy_id===src.id))target.branches.push(branchRecord(src,kind));
  if(kind==="discipline"){
    target.substyles=uniq([...(target.substyles||[]),src.name]);
    target.contact_location_ids=uniq([...(target.contact_location_ids||[]),...(src.contact_location_ids||[]),src.base_location_id]);
  }
}
const orgMap=Object.assign({},DB.organization_merge_map||{});
const discMap=Object.assign({},DB.discipline_merge_map||{});

Object.assign(orgMap,{
  "ORG-ASD2-CROWN-NOTARIES":"ORG-ASD-CROWN-COURT",
  "ORG-ASD2-RIVERWORKS":"ORG-ASD-ROAD-LEAGUE",
  "ORG-ASD2-AMBER-GROWERS":"ORG-ASD-GRAIN-COMPACT"
});

function consolidate(rows,map,familyFn,kind){
  const byId=new Map((rows||[]).map(x=>[x.id,x]));
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
    const keep=ranked.slice(0,cap),overflow=ranked.slice(cap);
    for(const src of overflow){
      let dst=keep.find(x=>x.base_location_id&&x.base_location_id===src.base_location_id);
      if(!dst)dst=keep[0];
      map[src.id]=dst.id;
      appendBranch(dst,src,kind);
    }
  }
  for(const key of Object.keys(map))map[key]=resolveMap(map,map[key]);
  const ids=new Set((rows||[]).map(x=>x.id));
  for(const [from,to] of Object.entries(map))if(!ids.has(to))delete map[from];
  const aliases=new Set(Object.keys(map));
  return (rows||[]).filter(x=>x&&x.id&&!aliases.has(x.id));
}

DB.world_organizations=consolidate(DB.world_organizations||[],orgMap,orgFamily,"organization");
DB.discipline_factions=consolidate(DB.discipline_factions||[],discMap,disciplineFamily,"discipline");
DB.organization_merge_map=orgMap;
DB.discipline_merge_map=discMap;

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
  const f=orgFamily(o),p=ORG_IDENTITY[f]||ORG_IDENTITY.other;
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
  o.identity_profile={scope_level:scopeLevel(o),family:f,signature:o.signature,culture:o.institutional_culture,tension:o.strategic_tension};
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

function audit(){
  const issues=[],stats={organizations:(DB.world_organizations||[]).length,disciplines:(DB.discipline_factions||[]).length,organization_aliases:Object.keys(orgMap).length,discipline_aliases:Object.keys(discMap).length,merged_branches:0};
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
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats};
}

DB.meta=DB.meta||{};
DB.meta.affiliation_identity_depth_revision=REV;
DB.affiliation_identity_depth_system={
  version:REV,release:RELEASE,save_compatible:true,
  caps:{world:4,kingdom:3,region:2},
  merge_rule:"同作用域＋同地域錨點＋同核心職能／戰術方法才視為同質；不同職能不因同層級而強制合併。",
  legacy_aliases:{organization:Object.keys(orgMap).length,discipline:Object.keys(discMap).length},
  required_depth:["歷史","現狀","核心特色","制度／訓練文化","限制／張力"],
  explicit_asdail_merges:{
    "王冠公證人會":"阿斯戴爾王國外廷・公證部門",
    "河谷渠務聯會":"王國商路聯盟阿斯戴爾分會・水運渠務部",
    "琥珀田農產協會":"銀穗糧議會・農產分會"
  }
};
if(Array.isArray(DB.integration_registry&&DB.integration_registry.optimization_notes))DB.integration_registry.optimization_notes.push("CURRENT-1.79.0／"+REV+"：同質組織與流派依世界4、王國3、地區2上限收斂；舊ID保留映射，並補歷史、現況與不可替代特色。");
globalThis.resolveOrganizationAlias=id=>resolveMap(orgMap,id);
globalThis.resolveDisciplineAlias=id=>resolveMap(discMap,id);
globalThis.runAffiliationIdentityDepthAudit=audit;
globalThis.QUNLU_CORE&&globalThis.QUNLU_CORE.registerModule&&globalThis.QUNLU_CORE.registerModule("src/affiliation-identity-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
DB.affiliation_identity_depth_system.initial_audit=audit();
})();