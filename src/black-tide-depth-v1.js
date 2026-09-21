/* 群陸旅誌：黑潮群島完整區域深化 CURRENT-1.96.1
 * BLACK-TIDE-DEPTH-1.1
 * 將POL-010由宏觀政體骨架深化為可遊玩的三大島、五小島與外圍島鏈。
 * 建立政治權力落點、城鎮、野外、地下城、怪物、NPC、經濟、傳聞與委託脈絡。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.96.1")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.96.1";
const REV="BLACK-TIDE-DEPTH-1.1";
const POLITY_ID="POL-010",REGION_ID="REG-10",CULTURE_ID="CUL-010",REALM_ID="RMAP-POL-010";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const tierRank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(key){DB[key]=Array.isArray(DB[key])?DB[key]:[];return DB[key]}
function upsert(key,row,idKey="id"){const a=arr(key),i=a.findIndex(x=>x?.[idKey]===row[idKey]);if(i>=0)a[i]=row;else a.push(row);return row}
function row(key,id,idKey="id"){return (DB[key]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,hours){
 const from=loc(a);if(!from||!loc(b))return;
 from.links=Array.isArray(from.links)?from.links:[];
 const old=from.links.find(x=>x?.to===b);
 if(old)old.hours=hours;else from.links.push({to:b,hours});
}
function twoWay(a,b,hours){addLink(a,b,hours);addLink(b,a,hours)}
function economy(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){
 return {prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]};
}
function town(x){
 return {
  id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,size:x.size,region:"黑潮群島",
  description:x.description,facilities:[...x.facilities],links:[],
  safety_score:x.safety??90,safety_label:x.safetyLabel||"安穩",risk:Math.max(2,100-(x.safety??90)),
  world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  history_scope:"黑潮群島／"+x.island,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,
  local_authority:clone(x.authority),local_economy:clone(x.economy),
  island_id:x.islandId,island_name:x.island,archipelago_zone:x.zone||"inner_sea"
 };
}
function field(x){
 const ref=loc(x.template)||loc("L-WOOD")||{};
 const ep=clone(ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zone||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,
  allow_magical_ecology:!!x.allowMagical,allow_demons:false,allow_undead:!!x.allowUndead,allow_aquatic:!!x.aquatic,
  archetype:x.archetype||"open_wild",space_class:x.space||"open",preferred_monster_ids:[...(x.preferred||[])]});
 const gather=[...(x.gather||[])],fish=[...(x.fish||[])],hunt=[...(x.hunt||[])];
 return {
  id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"黑潮群島",description:x.description,
  links:[],risk:x.risk??14,safety_score:x.safety??72,safety_label:x.safetyLabel||"警戒",
  world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  history_scope:"黑潮群島／"+x.island,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,
  island_id:x.islandId,island_name:x.island,encounter_tags:[...(x.tags||[])],encounter_profile:ep,
  gather,fish,hunt,allow_aquatic:!!x.aquatic,hunt_requires_battle:true,
  resource_profile:{forage:gather,mining:[...(x.mining||[])],woodcut:[...(x.woodcut||[])],hunt,fish},
  explore:clone(x.explore||[]),local_economy:clone(x.economy||null),resource_economy:clone(x.resource_economy||{capacity_mult:1,regen_hours_mult:1})
 };
}

const ISLANDS=[
 {id:"BT-ISL-01",name:"玄潮島",class:"major",tier:"C",province:"PROV-BT-01",smap:"SMAP-BT-01",seat:"L-BT-KYO",role:"皓月御國與黑潮幕府共同核心",economy:["行政","工藝","高階港務","文書"],risk:["人口集中","派閥競爭","颱風季港務壓力"]},
 {id:"BT-ISL-02",name:"赤浦島",class:"major",tier:"D",province:"PROV-BT-02",smap:"SMAP-BT-02",seat:"L-BT-AKAMINATO",role:"造船與西南海防支點",economy:["造船","木材","鐵件","軍需"],risk:["船塢火災","海盜偵察","季風湧浪"]},
 {id:"BT-ISL-03",name:"青岬島",class:"major",tier:"D",province:"PROV-BT-03",smap:"SMAP-BT-03",seat:"L-BT-AOMISAKI",role:"糧食、竹木與東南航路支點",economy:["稻作","竹木","果物","海運"],risk:["山崩","暴雨","獸害"]},
 {id:"BT-ISL-04",name:"白砂島",class:"minor",tier:"E",province:"PROV-BT-04",smap:"SMAP-BT-04",seat:"L-BT-SHIRASUNA",role:"鹽場與淺海漁業島",economy:["鹽","乾魚","貝類"],risk:["缺水","暴潮","鹽田受損"]},
 {id:"BT-ISL-05",name:"潮見島",class:"minor",tier:"E",province:"PROV-BT-05",smap:"SMAP-BT-05",seat:"L-BT-SHIOMI",role:"內海水先與漁港島",economy:["水先","漁獲","短程船運"],risk:["濃霧","礁撞","海獸"]},
 {id:"BT-ISL-06",name:"灰燈島",class:"minor",tier:"D",province:"PROV-BT-06",smap:"SMAP-BT-06",seat:"L-BT-HAITOU",role:"外海燈塔與護航前哨",economy:["燈油","護航","修帆"],risk:["強風","外海魔物","補給中斷"]},
 {id:"BT-ISL-07",name:"鯨背島",class:"minor",tier:"D",province:"PROV-BT-07",smap:"SMAP-BT-07",seat:"L-BT-KUJIRA",role:"石材、深水漁場與南航路補給",economy:["石材","深海漁獲","繩索"],risk:["落石","大浪","大型海獸"]},
 {id:"BT-ISL-08",name:"霧浦島",class:"minor",tier:"E",province:"PROV-BT-08",smap:"SMAP-BT-08",seat:"L-BT-KIRIURA",role:"藥草、避風泊地與東航路中繼",economy:["藥草","淡水","小型修船"],risk:["長霧","濕滑山路","補給波動"]}
];
const OUTER_ISLETS=["雁礁","松燈礁","細雨礁","長索島","海門礁","雙帆島","伏浪礁"];

const TOWNS=[
 {id:"L-BT-KYO",name:"黑潮京",tier:"C",size:"大城",islandId:"BT-ISL-01",island:"玄潮島",province:"PROV-BT-01",smap:"SMAP-BT-01",
  role:"皓月御國所在地／群島法統與文化中心",description:"玄潮島北灣的大城。皓月御國的典儀院、書庫、商町與工坊沿內河展開；潮皇在此主持祭祀、冊命與群島共同禮制。",
  facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","church","clinic"],safety:95,
  authority:{office_title:"王庭京尹",reports_to:"皓月御國",authority_tier:"AUTH-5",jurisdiction:"黑潮京城務、治安與王庭外圍行政"},
  economy:economy(86,"高度繁榮",["行政","高級工藝","書籍","祭儀用品"],["糧食部分依賴青岬島","颱風季船期波動"],.99,1.20,1.25,1.22)},
 {id:"L-BT-SHOGUNPORT",name:"黑潮灣",tier:"C",size:"大港",islandId:"BT-ISL-01",island:"玄潮島",province:"PROV-BT-01",smap:"SMAP-BT-01",
  role:"黑潮幕府評定所與聯合艦隊主港",description:"玄潮島南側深水港。黑潮幕府評定所、海防奉行所、軍船泊地、海關與大型倉庫集中於此，是群島實際軍政與海運中樞。",
  facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","church","clinic"],safety:93,
  authority:{office_title:"黑潮灣奉行",reports_to:"征夷大將軍／黑潮幕府評定所",authority_tier:"AUTH-5",jurisdiction:"軍港、海關、倉儲與外來船舶"},
  economy:economy(90,"高度繁榮",["軍需","港務","造船","轉口"],["戰時優先軍需","外海封鎖會快速推高進口價"],.99,1.28,1.32,1.30)},
 {id:"L-BT-AKAMINATO",name:"赤浦港",tier:"D",size:"港城",islandId:"BT-ISL-02",island:"赤浦島",province:"PROV-BT-02",smap:"SMAP-BT-02",
  role:"赤浦大名居城港／造船基地",description:"赤浦島西灣的港城，船渠、木場與鐵件工坊沿岸排列。赤浦家負責西南海防並向黑潮幕府提供軍船。",
  facilities:["guild","general","blacksmith","tailor","tavern","inn","church","clinic"],safety:91,
  authority:{office_title:"赤浦島奉行",reports_to:"赤浦大名／黑潮幕府",authority_tier:"AUTH-4",jurisdiction:"造船、海防、島內稅務"},
  economy:economy(78,"繁榮",["造船","船材","鐵件","軍需"],["糧食進口","船塢火災風險"],.99,1.16,1.18,1.14)},
 {id:"L-BT-AOMISAKI",name:"青岬城",tier:"D",size:"城下町",islandId:"BT-ISL-03",island:"青岬島",province:"PROV-BT-03",smap:"SMAP-BT-03",
  role:"青岬大名居城／糧產集散中心",description:"青岬島中央河谷的城下町，周圍梯田、果園與竹林密集。穀糧與竹木在此集散後運往黑潮京與軍港。",
  facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","church","clinic"],safety:92,
  authority:{office_title:"青岬城代",reports_to:"青岬大名／黑潮幕府",authority_tier:"AUTH-4",jurisdiction:"糧政、水利、林地與道路"},
  economy:economy(75,"繁榮",["稻米","竹木","果物","藥草"],["精鐵與高階裝備需輸入","暴雨影響山路"],.98,1.13,1.13,1.10)},
 {id:"L-BT-SHIRASUNA",name:"白砂港",tier:"E",size:"小港町",islandId:"BT-ISL-04",island:"白砂島",province:"PROV-BT-04",smap:"SMAP-BT-04",
  role:"鹽場與近海漁業行政港",description:"白色珊瑚砂灘後方的小港町，鹽田、曬魚場與蓄水池占據大部分平地。淡水與木材是最重要的輸入物資。",
  facilities:["guild","general","tailor","tavern","inn","church"],safety:89,
  authority:{office_title:"白砂島代官",reports_to:"黑潮幕府海防奉行",authority_tier:"AUTH-3",jurisdiction:"鹽課、漁場與蓄水"},
  economy:economy(58,"穩健",["海鹽","乾魚","貝類"],["淡水不足","木材與鐵器依賴輸入"],1.01,.93,.90,.94)},
 {id:"L-BT-SHIOMI",name:"潮見町",tier:"E",size:"漁港町",islandId:"BT-ISL-05",island:"潮見島",province:"PROV-BT-05",smap:"SMAP-BT-05",
  role:"內海水先人與短程客貨船中心",description:"建在兩道潮流交會處的漁港町。水先人熟知暗礁與潮窗，往來潮生村、黑潮灣與各小島的短程船多在此轉乘。",
  facilities:["guild","general","blacksmith","tavern","inn","church"],safety:90,
  authority:{office_title:"潮見港代",reports_to:"黑潮幕府港務奉行",authority_tier:"AUTH-3",jurisdiction:"水先、渡船、碼頭與礁航標"},
  economy:economy(66,"穩健",["水先","漁獲","短程海運"],["濃霧停航","大型貨物需轉運"],1.00,1.00,1.04,1.06)},
 {id:"L-BT-HAITOU",name:"灰燈港",tier:"E",size:"前哨港",islandId:"BT-ISL-06",island:"灰燈島",province:"PROV-BT-06",smap:"SMAP-BT-06",
  role:"外海燈塔、護航與警戒前哨",description:"灰色海崖下的小港，塔火與信號旗日夜不停。海防隊與護航船常在此更換人員、燈油、淡水與帆索。",
  facilities:["guild","general","blacksmith","tavern","inn","church","clinic"],safety:84,
  authority:{office_title:"灰燈海防代",reports_to:"黑潮幕府海防奉行",authority_tier:"AUTH-4",jurisdiction:"外海警戒、護航與烽燈"},
  economy:economy(61,"穩健",["護航","燈油","修帆"],["食糧依賴補給","強風停港"],1.02,.93,.96,.98)},
 {id:"L-BT-KUJIRA",name:"鯨背村",tier:"E",size:"港村",islandId:"BT-ISL-07",island:"鯨背島",province:"PROV-BT-07",smap:"SMAP-BT-07",
  role:"石材與南航路補給村",description:"島脊像伏在海上的長鯨，村落位於背風灣。居民採石、編繩、深海捕魚，也替南向船隊補水與修補船身。",
  facilities:["guild","general","blacksmith","tavern","inn","church"],safety:85,
  authority:{office_title:"鯨背島代官",reports_to:"黑潮幕府海防奉行",authority_tier:"AUTH-3",jurisdiction:"採石、漁場與南航補給"},
  economy:economy(54,"普通",["石材","深海魚","繩索"],["耕地少","大浪造成船期不穩"],1.02,.90,.88,.92)},
 {id:"L-BT-KIRIURA",name:"霧浦町",tier:"E",size:"小港町",islandId:"BT-ISL-08",island:"霧浦島",province:"PROV-BT-08",smap:"SMAP-BT-08",
  role:"東航避風港／藥草與淡水供應點",description:"常年晨霧籠罩的小港町，山泉充足，林地出產藥草與修船木。東行船隊會在此等待霧散與季風轉向。",
  facilities:["guild","general","tailor","alchemy","tavern","inn","church","clinic"],safety:88,
  authority:{office_title:"霧浦島代官",reports_to:"黑潮幕府港務奉行",authority_tier:"AUTH-3",jurisdiction:"水源、林地、藥草與避風泊位"},
  economy:economy(64,"穩健",["藥草","淡水","小型修船"],["濃霧延誤","鐵件需輸入"],1.00,1.02,1.00,1.02)}
];

for(const t of TOWNS)upsert("locations",town(t));

const FIELDS=[
 {id:"L-BT-NORTHCEDAR",name:"京北杉嶺",islandId:"BT-ISL-01",island:"玄潮島",province:"PROV-BT-01",smap:"SMAP-BT-01",tier:"D",size:"山林丘陵",tags:["forest","mountain"],zone:"frontier",template:"L-WOOD",safety:69,risk:20,
  description:"黑潮京北面的杉林與丘陵，王庭林地、寺社山路與獵場交錯。越過巡林線後常見野豬與山犬。",
  gather:["I-BRANCH","I-HERB","I-MINT"],woodcut:["I-BRANCH"],hunt:["I-RAWMEAT"],preferred:["MON-BT-004","MON-BT-006"],explore:[["杉林驛道",25],["巡林小屋",20],["山泉",20],["野豬泥坑",20],["舊界石",15]]},
 {id:"L-BT-INNERMARSH",name:"內海葦灘",islandId:"BT-ISL-01",island:"玄潮島",province:"PROV-BT-01",smap:"SMAP-BT-01",tier:"E",size:"河口濕地",tags:["water","plains"],zone:"frontier",template:"L-RIVER",aquatic:true,safety:76,risk:15,
  description:"黑潮灣內側的蘆葦河口，漁船、鹽水與淡水交錯。退潮後可採集貝類與藥草，但泥灘容易困住行人。",
  gather:["I-HERB","I-MINT"],fish:["I-RAWFISH"],preferred:["MON-BT-001","MON-BT-002"],explore:[["蘆葦水道",25],["退潮泥灘",25],["舊魚樁",20],["水鳥洲",15],["漂流木帶",15]]},
 {id:"L-BT-REDLAVA",name:"赤浦熔岩岸",islandId:"BT-ISL-02",island:"赤浦島",province:"PROV-BT-02",smap:"SMAP-BT-02",tier:"D",size:"黑岩海岸",tags:["mountain","water"],zone:"frontier",template:"L-HILL",aquatic:true,safety:65,risk:23,
  description:"古火山熔岩形成的黑色海岸，浪洞與尖岩密集。退潮時可見礦砂與甲殼類魔物。",
  gather:["I-HERB"],mining:["I-ORE-BRONZE","I-ORE-IRON"],fish:["I-RAWFISH"],preferred:["MON-BT-007","MON-BT-008"],explore:[["黑岩潮池",25],["熔岩脊",25],["礦砂灘",20],["浪洞",15],["海防石標",15]]},
 {id:"L-BT-SHIPWOOD",name:"船木林場",islandId:"BT-ISL-02",island:"赤浦島",province:"PROV-BT-02",smap:"SMAP-BT-02",tier:"E",size:"管理林地",tags:["forest","plains"],zone:"frontier",template:"L-WOOD",safety:78,risk:14,
  description:"供應船桅、肋材與修船木的管理林。伐採採輪區制，冒險者多承接巡林、驅獸與找回失蹤伐木工。",
  gather:["I-BRANCH","I-HERB"],woodcut:["I-BRANCH"],hunt:["I-RAWMEAT"],preferred:["MON-BT-003","MON-BT-004"],explore:[["伐木輪區",25],["運木滑道",20],["林務棚",20],["獸徑",20],["舊炭窯",15]]},
 {id:"L-BT-TERRACES",name:"青岬梯田丘",islandId:"BT-ISL-03",island:"青岬島",province:"PROV-BT-03",smap:"SMAP-BT-03",tier:"E",size:"農丘",tags:["plains","forest"],zone:"town_outskirts",template:"L-LOWFIELD",safety:86,risk:9,
  description:"青岬城外的梯田、果園與灌渠丘地。農忙時人煙密集，主要危險來自害獸與暴雨後崩坡。",
  gather:["I-ROOT","I-BERRY","I-HERB"],hunt:["I-RAWMEAT"],preferred:["MON-BT-003"],explore:[["梯田水渠",25],["果園坡",25],["農家水車",20],["竹籬",15],["獸害足跡",15]]},
 {id:"L-BT-BAMBOO",name:"南風竹林",islandId:"BT-ISL-03",island:"青岬島",province:"PROV-BT-03",smap:"SMAP-BT-03",tier:"D",size:"竹木山林",tags:["forest","mountain"],zone:"frontier",template:"L-WOOD",safety:70,risk:20,
  description:"島南風口的大片竹林，竹材、藥草與山泉豐富。風雨時竹倒與土石流會封閉山徑。",
  gather:["I-BRANCH","I-HERB","I-MINT"],woodcut:["I-BRANCH"],hunt:["I-RAWMEAT"],preferred:["MON-BT-005","MON-BT-006"],explore:[["竹林坡道",25],["山泉石槽",20],["採藥棚",20],["倒竹區",20],["古祠石階",15]]},
 {id:"L-BT-SALTFIELD",name:"白砂鹽田",islandId:"BT-ISL-04",island:"白砂島",province:"PROV-BT-04",smap:"SMAP-BT-04",tier:"E",size:"海岸鹽田",tags:["plains","water"],zone:"town_outskirts",template:"L-RIVER",aquatic:true,safety:84,risk:10,
  description:"石堤圍出的淺鹽田與曬鹽棚。暴潮後常有海生小魔物困在水池裡，鹽工會委託公會清理。",
  gather:["I-HERB"],fish:["I-RAWFISH"],preferred:["MON-BT-001","MON-BT-009"],explore:[["結晶鹽池",30],["引潮石溝",25],["曬鹽棚",20],["蓄水井",15],["破損海堤",10]]},
 {id:"L-BT-REEFROUTE",name:"潮見礁路",islandId:"BT-ISL-05",island:"潮見島",province:"PROV-BT-05",smap:"SMAP-BT-05",tier:"E",size:"礁岸航路",tags:["water","plains"],zone:"frontier",template:"L-RIVER",aquatic:true,safety:75,risk:16,
  description:"潮見島外側的淺礁與潮溝，水先人以木樁和石標標出可航路線。濃霧時極易迷向。",
  gather:["I-HERB"],fish:["I-RAWFISH"],preferred:["MON-BT-002","MON-BT-010"],explore:[["水先石標",25],["淺礁潮溝",25],["海鳥礁",20],["霧鐘樁",15],["失事木片",15]]},
 {id:"L-BT-GRAYCLIFF",name:"灰燈海崖",islandId:"BT-ISL-06",island:"灰燈島",province:"PROV-BT-06",smap:"SMAP-BT-06",tier:"D",size:"外海海崖",tags:["mountain","water"],zone:"deep_wild",template:"L-HILL",aquatic:true,safety:58,risk:28,
  description:"燈塔外側的高海崖與風切坡。巡燈隊必須沿固定繩路行動，飛行魔物與突來陣風是主要威脅。",
  gather:["I-HERB"],fish:["I-RAWFISH"],preferred:["MON-BT-011","MON-BT-012"],explore:[["巡燈繩路",25],["風切崖",25],["海鳥巢壁",20],["舊烽火臺",15],["沉船望點",15]]},
 {id:"L-BT-WHALEBACK",name:"鯨背石脊",islandId:"BT-ISL-07",island:"鯨背島",province:"PROV-BT-07",smap:"SMAP-BT-07",tier:"D",size:"岩脊與採石地",tags:["mountain","plains"],zone:"frontier",template:"L-HILL",safety:64,risk:24,
  description:"貫穿全島的灰白石脊，採石坑、繩橋與海風風口相連。部分廢坑已被大型甲殼獸利用。",
  gather:["I-HERB"],mining:["I-ORE-BRONZE","I-ORE-IRON"],hunt:["I-RAWMEAT"],preferred:["MON-BT-013","MON-BT-014"],explore:[["採石階",25],["繩橋",20],["風蝕石柱",20],["廢坑",20],["南海望臺",15]]},
 {id:"L-BT-MISTWOOD",name:"霧浦藥草林",islandId:"BT-ISL-08",island:"霧浦島",province:"PROV-BT-08",smap:"SMAP-BT-08",tier:"E",size:"濕潤林地",tags:["forest","water"],zone:"frontier",template:"L-WOOD",aquatic:true,safety:74,risk:17,
  description:"山泉密集的濕潤林地，霧氣讓藥草生長旺盛，也讓山路辨識困難。採集者多結伴進出。",
  gather:["I-HERB","I-MINT","I-MUSHROOM","I-BERRY"],fish:["I-RAWFISH"],preferred:["MON-BT-005","MON-BT-015"],explore:[["藥草濕坡",25],["霧泉",25],["林間木橋",20],["採集棚",15],["迷霧岔路",15]]}
];

const DUNGEONS=[
 {id:"D-BT-SEAGATE",name:"舊海門地道",islandId:"BT-ISL-01",island:"玄潮島",province:"PROV-BT-01",smap:"SMAP-BT-01",tier:"C",kind:"dungeon",size:"城防地下通道",tags:["dungeon","ruins","water"],zone:"dungeon",archetype:"fortress_basement",space:"standard",aquatic:true,allowUndead:true,safety:42,risk:34,
  description:"舊城防海門下方的封閉地道，部分區段與潮水相通。黑潮幕府只開放已測繪外層，深處仍有舊守衛構裝與不穩定水道。",
  preferred:["MON-BT-016","MON-BT-017"],gather:["I-MUSHROOM"],fish:["I-RAWFISH"],explore:[["舊海門",25],["排水廊",20],["封條石室",20],["軍械槽",20],["深層閘門",15]]},
 {id:"D-BT-DRYDOCK",name:"廢船渠下層",islandId:"BT-ISL-02",island:"赤浦島",province:"PROV-BT-02",smap:"SMAP-BT-02",tier:"D",kind:"dungeon",size:"廢棄船渠",tags:["dungeon","ruins","water"],zone:"dungeon",archetype:"waterway_ruin",space:"large",aquatic:true,safety:48,risk:29,
  description:"舊軍船乾塢下方的維修渠與排水室，停用後積水、木樁腐朽，海生魔物會隨高潮進入。",
  preferred:["MON-BT-008","MON-BT-010"],gather:["I-MUSHROOM"],fish:["I-RAWFISH"],explore:[["乾塢閘門",25],["排水室",25],["腐木棧道",20],["舊工具庫",15],["潮水暗渠",15]]},
 {id:"D-BT-OLDTEMPLE",name:"青岬舊祠洞",islandId:"BT-ISL-03",island:"青岬島",province:"PROV-BT-03",smap:"SMAP-BT-03",tier:"D",kind:"dungeon",size:"山腹舊祠",tags:["dungeon","ruins","forest","cave"],zone:"dungeon",archetype:"shrine_ruin",space:"standard",allowUndead:true,safety:50,risk:27,
  description:"舊祠後方因山崩露出的洞室，地方神職只確認外層祭具與儲藏間；內部有獸穴與失修木構。",
  preferred:["MON-BT-006","MON-BT-018"],gather:["I-MUSHROOM","I-HERB"],explore:[["石鳥居殘基",25],["祭具庫",20],["崩落洞口",20],["根系洞室",20],["內祠石門",15]]},
 {id:"D-BT-SALTWELL",name:"鹽井舊坑",islandId:"BT-ISL-04",island:"白砂島",province:"PROV-BT-04",smap:"SMAP-BT-04",tier:"E",kind:"dungeon",size:"地下鹽井",tags:["dungeon","cave","water"],zone:"dungeon",archetype:"mine",space:"standard",aquatic:true,safety:54,risk:20,
  description:"早年鹽井與蓄水坑交錯的地下空間，因滲海水而停用。現由公會定期清理甲殼獸與檢查井壁。",
  preferred:["MON-BT-009","MON-BT-001"],gather:["I-MUSHROOM"],fish:["I-RAWFISH"],explore:[["舊鹽井",30],["滲水坑",25],["木支架",20],["鹽晶壁",15],["封閉深井",10]]},
 {id:"D-BT-TIDECAVE",name:"潮見深潮洞",islandId:"BT-ISL-05",island:"潮見島",province:"PROV-BT-05",smap:"SMAP-BT-05",tier:"E",kind:"dungeon",size:"海蝕潮洞",tags:["dungeon","cave","water"],zone:"dungeon",archetype:"natural_water_cave",space:"standard",aquatic:true,safety:51,risk:22,
  description:"島東側只有退潮時能穩定進入的海蝕洞。水先人用繩結標出安全線，越過標記後水位變化很快。",
  preferred:["MON-BT-002","MON-BT-010"],fish:["I-RAWFISH"],explore:[["退潮口",30],["繩結安全線",25],["潮池廳",20],["狹窄水道",15],["深潮裂縫",10]]},
 {id:"D-BT-BEACON",name:"灰燈舊烽臺地窖",islandId:"BT-ISL-06",island:"灰燈島",province:"PROV-BT-06",smap:"SMAP-BT-06",tier:"D",kind:"dungeon",size:"海防地窖",tags:["dungeon","ruins","mountain"],zone:"dungeon",archetype:"fortress_basement",space:"standard",safety:46,risk:31,
  description:"現役燈塔更換位置後留下的舊烽臺地窖，內有燈油槽、信號器材與被風蝕破壞的下層通道。",
  preferred:["MON-BT-011","MON-BT-016"],gather:["I-MUSHROOM"],explore:[["燈油槽",25],["信號器材庫",20],["舊值勤室",20],["風蝕裂壁",20],["封閉下層",15]]},
 {id:"D-BT-STONECAVE",name:"石脊海蝕洞",islandId:"BT-ISL-07",island:"鯨背島",province:"PROV-BT-07",smap:"SMAP-BT-07",tier:"D",kind:"dungeon",size:"大型海蝕洞",tags:["dungeon","cave","water","mountain"],zone:"dungeon",archetype:"natural_water_cave",space:"large",aquatic:true,safety:44,risk:32,
  description:"採石造成裂隙後與天然海蝕洞相連的大洞系，乾燥石臺與深水洞交錯，偶有大型甲殼獸在此換殼。",
  preferred:["MON-BT-013","MON-BT-014"],fish:["I-RAWFISH"],explore:[["採石裂口",25],["高頂石廳",20],["潮水洞",20],["舊繩橋",20],["深水回音",15]]},
 {id:"D-BT-MISTCHANNEL",name:"霧泉舊水道",islandId:"BT-ISL-08",island:"霧浦島",province:"PROV-BT-08",smap:"SMAP-BT-08",tier:"E",kind:"dungeon",size:"山泉引水道",tags:["dungeon","ruins","forest","water"],zone:"dungeon",archetype:"waterway_ruin",space:"standard",aquatic:true,safety:55,risk:19,
  description:"舊聚落留下的石砌引水道，部分仍有清水流過。潮濕環境吸引菌類、蛙獸與小型水生魔物。",
  preferred:["MON-BT-015","MON-BT-002"],gather:["I-MUSHROOM","I-HERB","I-MINT"],fish:["I-RAWFISH"],explore:[["引水石槽",30],["泉眼室",25],["菌苔壁",20],["崩落側道",15],["舊蓄水池",10]]}
];

for(const x of [...FIELDS,...DUNGEONS])upsert("locations",field(x));

const ROUTES=[
 ["L-BT-KYO","L-BT-SHOGUNPORT",1.5],["L-BT-KYO","L-BT-NORTHCEDAR",1.4],["L-BT-SHOGUNPORT","L-BT-INNERMARSH",1.1],["L-BT-INNERMARSH","D-BT-SEAGATE",1.4],
 ["L-BT-SHOGUNPORT","L-BT-AKAMINATO",7],["L-BT-SHOGUNPORT","L-BT-AOMISAKI",6],["L-BT-AKAMINATO","L-BT-REDLAVA",1.3],["L-BT-AKAMINATO","L-BT-SHIPWOOD",1.6],["L-BT-REDLAVA","D-BT-DRYDOCK",1.5],
 ["L-BT-AOMISAKI","L-BT-TERRACES",1.0],["L-BT-AOMISAKI","L-BT-BAMBOO",1.7],["L-BT-BAMBOO","D-BT-OLDTEMPLE",1.6],
 ["L-BT-AKAMINATO","L-BT-SHIRASUNA",4],["L-BT-SHIRASUNA","L-BT-SALTFIELD",.8],["L-BT-SALTFIELD","D-BT-SALTWELL",1.1],
 ["L-BT-SHOGUNPORT","L-BT-SHIOMI",5],["L-BT-SHIOMI","L-BT-REEFROUTE",1.0],["L-BT-REEFROUTE","D-BT-TIDECAVE",1.2],
 ["L-BT-AKAMINATO","L-BT-HAITOU",5],["L-BT-HAITOU","L-BT-GRAYCLIFF",1.2],["L-BT-GRAYCLIFF","D-BT-BEACON",1.4],
 ["L-BT-AOMISAKI","L-BT-KUJIRA",6],["L-BT-KUJIRA","L-BT-WHALEBACK",1.3],["L-BT-WHALEBACK","D-BT-STONECAVE",1.5],
 ["L-BT-AOMISAKI","L-BT-KIRIURA",4],["L-BT-KIRIURA","L-BT-MISTWOOD",1.0],["L-BT-MISTWOOD","D-BT-MISTCHANNEL",1.3],
 ["L-BT-SHIOMI","L-START-TIDEBORN",5],["L-BT-SHOGUNPORT","L-START-TIDEBORN",8]
];
for(const r of ROUTES)twoWay(r[0],r[1],r[2]);

const ITEMS=[
 {id:"BT-MAT-001",name:"礁蟹甲片",tier:"E",weight:.3,value:12,description:"沿岸甲殼獸留下的硬質甲片，可用於低階護具與工具補強。"},
 {id:"BT-MAT-002",name:"海犬皮",tier:"E",weight:.6,value:16,description:"耐濕的短毛獸皮，常用於海上皮具與護腕。"},
 {id:"BT-MAT-003",name:"山豬硬皮",tier:"E",weight:.8,value:18,description:"群島山豬的厚皮，可作耐磨皮革。"},
 {id:"BT-MAT-004",name:"風鳥硬羽",tier:"D",weight:.15,value:24,description:"大型海鳥翼羽，適合製作箭羽與風向標。"},
 {id:"BT-MAT-005",name:"黑岩蜥甲",tier:"D",weight:.45,value:34,description:"吸熱較慢的黑色鱗甲，可作耐熱護具素材。"},
 {id:"BT-MAT-006",name:"潮鰻皮膜",tier:"D",weight:.25,value:31,description:"富彈性且耐水的薄膜，常用於防水與煉金處理。"},
 {id:"BT-MAT-007",name:"海崖翼膜",tier:"D",weight:.2,value:36,description:"外海飛行魔物的厚韌翼膜。"},
 {id:"BT-MAT-008",name:"石背甲殼",tier:"D",weight:.7,value:42,description:"大型石甲蟹背殼碎片，兼具硬度與耐鹽性。"},
 {id:"BT-MAT-009",name:"霧泉囊",tier:"E",weight:.2,value:19,description:"霧林蛙獸的儲水囊，經處理後可作藥劑容器素材。"},
 {id:"BT-MAT-010",name:"舊海門核心片",tier:"C",weight:.5,value:76,description:"舊城防構裝體的刻紋核心碎片，只能由合法清理任務取得。"}
];
for(const d of ITEMS)upsert("items",{...d,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID});

function mon(x){
 const allowed=[...(x.drops||[])];
 return {
  id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:x.category||"野獸與一般魔物系",
  habitat:[...(x.habitat||[])],habitats:[...(x.habitat||[])],hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??x.def,
  accuracy:x.acc,initiative:x.init??10,damage:clone(x.damage),primary_element:x.element||null,element:x.element||null,
  xp_reward:x.xp||({F:10,E:18,D:34,C:58}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,
  encounter_enabled:true,encounter_weight:x.weight||1,
  ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},
  loot_profile:{version:"LOOT-ECOLOGY-1.0",allowed_material_ids:allowed},
  loot_materials:allowed.map((id,i)=>({id,chance:Math.max(.18,(x.lootChance??.45)-i*.08),min:1,max:1}))
 };
}
const MONSTERS=[
 {id:"MON-BT-001",name:"潮灘礁蟹",tier:"F",habitat:["L-BT-INNERMARSH","L-BT-SALTFIELD","D-BT-SALTWELL"],hp:30,atk:10,def:7,acc:66,damage:[3,6],element:"水",scale:"small",tags:["aquatic","invertebrate","small_intruder"],drops:["BT-MAT-001"],near:true,description:"退潮時在泥灘與鹽池覓食的礁蟹，受驚會用螯夾住腳踝。"},
 {id:"MON-BT-002",name:"短鰭潮鰻",tier:"E",habitat:["L-BT-INNERMARSH","L-BT-REEFROUTE","D-BT-TIDECAVE"],hp:46,atk:15,def:6,acc:72,damage:[5,9],element:"水",scale:"small",tags:["aquatic","small_intruder"],drops:["BT-MAT-006"],description:"生活在潮溝與礁洞的小型掠食鰻，成群時威脅明顯上升。"},
 {id:"MON-BT-003",name:"島田野豬",tier:"E",habitat:["L-BT-SHIPWOOD","L-BT-TERRACES"],hp:56,atk:17,def:9,acc:69,damage:[6,11],scale:"medium",tags:["wildlife"],drops:["BT-MAT-003"],near:true,description:"群島常見野豬，會闖入田地與林場。"},
 {id:"MON-BT-004",name:"海松山犬",tier:"E",habitat:["L-BT-NORTHCEDAR","L-BT-SHIPWOOD"],hp:50,atk:18,def:7,acc:75,damage:[6,11],scale:"medium",tags:["wildlife"],drops:["BT-MAT-002"],description:"適應鹹濕海風的山犬，多以小群活動。"},
 {id:"MON-BT-005",name:"竹林角鹿",tier:"D",habitat:["L-BT-BAMBOO","L-BT-MISTWOOD"],hp:82,atk:23,def:10,acc:72,damage:[8,15],element:"風",scale:"medium",tags:["wildlife"],drops:["BT-MAT-004"],description:"大型林鹿，受驚後會沿坡高速衝撞。"},
 {id:"MON-BT-006",name:"杉嶺黑熊",tier:"D",habitat:["L-BT-NORTHCEDAR","L-BT-BAMBOO","D-BT-OLDTEMPLE"],hp:110,atk:27,def:16,acc:70,damage:[10,19],scale:"large",tags:["wildlife","large_wildlife"],drops:["BT-MAT-003"],description:"棲息大島山林的黑熊，通常避人，但護幼或受傷時極危險。"},
 {id:"MON-BT-007",name:"黑岩甲蜥",tier:"D",habitat:["L-BT-REDLAVA"],hp:96,atk:25,def:19,acc:71,damage:[9,17],element:"地",scale:"medium",tags:["wildlife"],drops:["BT-MAT-005"],description:"棲息熔岩岸的厚甲蜥，會伏在黑岩間等待小型獵物。"},
 {id:"MON-BT-008",name:"船渠鉗獸",tier:"D",habitat:["L-BT-REDLAVA","D-BT-DRYDOCK"],hp:102,atk:26,def:20,acc:70,damage:[9,18],element:"水",scale:"medium",tags:["aquatic","invertebrate"],drops:["BT-MAT-001","BT-MAT-008"],description:"喜歡躲在船渠與礁洞的大型甲殼獸，會剪斷繩索和木構。"},
 {id:"MON-BT-009",name:"鹽池硬殼蟹",tier:"E",habitat:["L-BT-SALTFIELD","D-BT-SALTWELL"],hp:52,atk:16,def:12,acc:68,damage:[5,10],element:"水",scale:"small",tags:["aquatic","invertebrate","small_intruder"],drops:["BT-MAT-001"],near:true,description:"能忍受高鹽水的硬殼蟹，暴潮後常大量進入鹽池。"},
 {id:"MON-BT-010",name:"礁路獵鰻",tier:"D",habitat:["L-BT-REEFROUTE","D-BT-TIDECAVE","D-BT-DRYDOCK"],hp:88,atk:27,def:10,acc:78,damage:[9,18],element:"水",scale:"medium",tags:["aquatic"],drops:["BT-MAT-006"],description:"伏在深礁潮溝的掠食鰻，會利用混濁水流突襲。"},
 {id:"MON-BT-011",name:"灰崖風鳥",tier:"D",habitat:["L-BT-GRAYCLIFF","D-BT-BEACON"],hp:78,atk:25,def:9,acc:80,init:15,damage:[8,16],element:"風",scale:"medium",tags:["wildlife"],drops:["BT-MAT-004","BT-MAT-007"],description:"利用海崖上升氣流盤旋的大型風鳥，常攻擊暴露在崖路上的行人。"},
 {id:"MON-BT-012",name:"外海裂翼鳥",tier:"C",role:"菁英",habitat:["L-BT-GRAYCLIFF"],hp:138,atk:35,def:17,acc:82,init:17,damage:[12,24],element:"風",scale:"large",tags:["wildlife","large_wildlife"],drops:["BT-MAT-007"],description:"外海大型飛行魔物，會從逆風側低空掠襲。"},
 {id:"MON-BT-013",name:"石背大蟹",tier:"D",habitat:["L-BT-WHALEBACK","D-BT-STONECAVE"],hp:118,atk:27,def:23,acc:69,damage:[9,18],element:"地",scale:"large",tags:["aquatic","invertebrate"],drops:["BT-MAT-008"],description:"以石屑覆蓋背殼的大型蟹類，常占據廢採石坑與海蝕洞。"},
 {id:"MON-BT-014",name:"洞潮石甲獸",tier:"C",role:"菁英",habitat:["D-BT-STONECAVE"],hp:156,atk:36,def:28,acc:73,damage:[13,25],element:"地",scale:"large",tags:["aquatic","invertebrate"],drops:["BT-MAT-008","BT-MAT-005"],description:"長年棲息石洞的老成甲殼獸，甲殼夾入大量礦砂與石片。"},
 {id:"MON-BT-015",name:"霧泉鼓蛙",tier:"E",habitat:["L-BT-MISTWOOD","D-BT-MISTCHANNEL"],hp:48,atk:15,def:8,acc:70,damage:[5,9],element:"水",scale:"small",tags:["aquatic","small_intruder"],drops:["BT-MAT-009"],description:"在霧泉與水道繁殖的蛙獸，鳴聲在濃霧裡容易誤導方向感。"},
 {id:"MON-BT-016",name:"舊海門銅衛",tier:"C",role:"菁英",habitat:["D-BT-SEAGATE","D-BT-BEACON"],hp:152,atk:35,def:27,acc:76,damage:[12,24],element:"地",scale:"medium",tags:["construct"],drops:["BT-MAT-010"],description:"舊海防設施留下的構裝守衛，只在受損封鎖線附近活動。"},
 {id:"MON-BT-017",name:"海門水鎧衛",tier:"C",role:"首領候選",habitat:["D-BT-SEAGATE"],hp:175,atk:38,def:29,acc:78,damage:[13,27],element:"水",scale:"large",tags:["construct","aquatic"],drops:["BT-MAT-010","BT-MAT-006"],description:"能在淹水廊道運作的重型舊守衛，動作緩慢但難以正面擊破。"},
 {id:"MON-BT-018",name:"舊祠守石像",tier:"D",role:"菁英",habitat:["D-BT-OLDTEMPLE"],hp:112,atk:28,def:22,acc:72,damage:[10,19],element:"地",scale:"medium",tags:["construct"],drops:["BT-MAT-010"],description:"舊祠外層的石製守衛，只有部分個體仍會對闖入者反應。"}
];
for(const m of MONSTERS)upsert("monsters",mon(m));

const NPCS=[
 {id:"NPC-BT-001",name:"汐宮 景仁",role:"潮皇",tier:"C",location_id:"L-BT-KYO",knowledge_scope:"皓月御國禮制、冊命、群島正史與外交禮儀",combat_tier_ceiling:"D",organization_ids:["ORG-BT-COURT"],services:["王庭接見","高階冊命劇情"],description:"現任潮皇。維持皓月御國法統與諸島共同儀禮，不直接處理日常軍政。"},
 {id:"NPC-BT-002",name:"鷹森 宗政",role:"征夷大將軍",tier:"B",location_id:"L-BT-SHOGUNPORT",knowledge_scope:"黑潮幕府軍政、海防、諸島大名與對外戰略",combat_tier_ceiling:"B",organization_ids:["ORG-BT-BAKUFU"],services:["黑潮幕府軍政劇情","高階海防委託"],description:"現任征夷大將軍，主持黑潮幕府評定與聯合海防。"},
 {id:"NPC-BT-003",name:"早瀨 信綱",role:"黑潮幕府老中首座",tier:"C",location_id:"L-BT-SHOGUNPORT",knowledge_scope:"評定所、諸島人事、稅務與政令執行",combat_tier_ceiling:"D",organization_ids:["ORG-BT-BAKUFU"],services:["黑潮幕府文書","大名協調"],description:"負責把將軍裁示轉成各奉行與島領能執行的政令。"},
 {id:"NPC-BT-004",name:"間宮 道隆",role:"海防奉行",tier:"C",location_id:"L-BT-SHOGUNPORT",knowledge_scope:"燈塔、護航、海盜、巡航與軍港",combat_tier_ceiling:"C",organization_ids:["ORG-BT-BAKUFU"],services:["護航委託","海防情報"],description:"掌管群島海防與巡航配置，重視航標、補給與實際船況。"},
 {id:"NPC-BT-005",name:"水城 綾",role:"王庭典儀官",tier:"D",location_id:"L-BT-KYO",knowledge_scope:"祭儀、王庭文書、冊命程序與島領禮序",combat_tier_ceiling:"E",organization_ids:["ORG-BT-COURT"],services:["王庭文書查詢","禮儀引介"],description:"負責王庭典禮與冊命文書，對法統與實權的界線說明得很清楚。"},
 {id:"NPC-BT-006",name:"赤津 盛房",role:"赤浦大名",tier:"C",location_id:"L-BT-AKAMINATO",knowledge_scope:"赤浦造船、島領武家、西南海防",combat_tier_ceiling:"C",organization_ids:["ORG-BT-BAKUFU"],services:["造船軍需委託","島領引介"],description:"赤浦島領主，維持船渠與軍船供應，以實務能力在黑潮幕府中有發言權。"},
 {id:"NPC-BT-007",name:"青枝 兼久",role:"青岬大名",tier:"C",location_id:"L-BT-AOMISAKI",knowledge_scope:"青岬糧政、水利、林地與東南航路",combat_tier_ceiling:"D",organization_ids:["ORG-BT-BAKUFU"],services:["糧運委託","山林通行"],description:"青岬島領主，關注糧產與水利，不願為軍功過度抽調農戶。"},
 {id:"NPC-BT-008",name:"久瀨 隆一",role:"黑潮灣船匠頭",tier:"D",location_id:"L-BT-SHOGUNPORT",knowledge_scope:"船材、船渠、修船工期與軍船規格",combat_tier_ceiling:"E",organization_ids:["ORG-BT-SHIPWRIGHTS"],services:["修船","船材鑑定"],description:"大型船匠會的工頭，只按材料、工時與海況估算，不接受空泛催工。"},
 {id:"NPC-BT-009",name:"白砂 千代",role:"白砂鹽務代官",tier:"E",location_id:"L-BT-SHIRASUNA",knowledge_scope:"鹽課、蓄水、乾魚與小島民生",combat_tier_ceiling:"F",organization_ids:["ORG-BT-FISH-SALT"],services:["鹽場委託","民生情報"],description:"負責鹽課與蓄水配給，最怕暴潮後同時缺水又停船。"},
 {id:"NPC-BT-010",name:"潮見 直人",role:"水先人頭",tier:"D",location_id:"L-BT-SHIOMI",knowledge_scope:"內海潮流、暗礁、霧季與短程航路",combat_tier_ceiling:"D",organization_ids:["ORG-BT-PILOTS"],services:["航路情報","水先委託"],description:"熟悉群島內海每一段潮窗，說明路線時總先談風、潮、霧三件事。"},
 {id:"NPC-BT-011",name:"灰燈 佐奈",role:"燈塔守備長",tier:"D",location_id:"L-BT-HAITOU",knowledge_scope:"外海天候、燈塔、烽號與護航船",combat_tier_ceiling:"C",organization_ids:["ORG-BT-BAKUFU"],services:["外海警戒","燈塔委託"],description:"長期駐守外海燈塔，習慣把任何異常先記錄成時間、方位與距離。"},
 {id:"NPC-BT-012",name:"石戶 源次",role:"鯨背採石頭",tier:"D",location_id:"L-BT-KUJIRA",knowledge_scope:"採石坑、繩橋、石材品質與海蝕洞",combat_tier_ceiling:"D",organization_ids:["ORG-BT-SHIPWRIGHTS"],services:["石材鑑定","坑道委託"],description:"熟悉島上每處採石層，反對為趕工破壞支撐與排水。"},
 {id:"NPC-BT-013",name:"霧浦 澄",role:"藥草師",tier:"D",location_id:"L-BT-KIRIURA",knowledge_scope:"群島藥草、泉水、濃霧與簡易調劑",combat_tier_ceiling:"E",organization_ids:["ORG-BT-FISH-SALT"],services:["藥草收購","調劑委託"],description:"在霧林採藥多年，會嚴格區分能緩解症狀與真正治療的材料。"},
 {id:"NPC-BT-014",name:"堀江 泰成",role:"冒險者公會黑潮支部長",tier:"C",location_id:"L-BT-SHOGUNPORT",knowledge_scope:"群島委託、地下城、怪物分布與冒險者資格",combat_tier_ceiling:"C",organization_ids:[],services:["冒險者委託","群島收購櫃檯"],description:"協調八島公會櫃檯與黑潮幕府海防需求，不讓低階冒險者被派去超階地圖。"},
 {id:"NPC-BT-015",name:"松永 里穗",role:"黑潮京商會帳房",tier:"D",location_id:"L-BT-KYO",knowledge_scope:"島際價格、倉儲、船期與進口糧鐵",combat_tier_ceiling:"F",organization_ids:["ORG-BT-FISH-SALT"],services:["市場情報","商隊委託"],description:"追蹤各島糧、鹽、木材與鐵器的船期和庫存，對風暴造成的價格異常非常敏感。"},
 {id:"NPC-BT-016",name:"島田 宗介",role:"黑潮幕府裁判奉行",tier:"C",location_id:"L-BT-KYO",knowledge_scope:"武家法、港灣法、船誓與跨島爭議",combat_tier_ceiling:"D",organization_ids:["ORG-BT-BAKUFU"],services:["法律查詢","跨島仲裁"],description:"處理武家、商船與島民之間的跨島案件，重證據、航海紀錄與正式印記。"}
];
for(const n of NPCS)upsert("regional_npc_archetypes",{...n,region_id:REGION_ID,polity_id:POLITY_ID});

const DIALOGUES=[
 ["DIA-BT-001","NPC-BT-001","王庭","黑潮幕府治理海疆，皓月御國維繫的是讓諸島仍承認彼此同屬一國的法統。"],
 ["DIA-BT-002","NPC-BT-002","海防","軍船不是越多越好；補給港、船匠和能安全返航的航路一樣重要。"],
 ["DIA-BT-003","NPC-BT-003","政令","一道命令送到八座島，若沒有奉行、港代和島代官把細節做完，就只是紙。"],
 ["DIA-BT-004","NPC-BT-004","巡航","先看燈塔有沒有亮，再問巡船去了哪。海防最怕的是資訊斷線。"],
 ["DIA-BT-005","NPC-BT-005","冊命","冊封不是替黑潮幕府任命官員；它確認的是島領身分與皓月御國承認的禮序。"],
 ["DIA-BT-006","NPC-BT-006","造船","船材、鐵件、工期少一樣，船就不能因為軍令兩字提早下水。"],
 ["DIA-BT-007","NPC-BT-007","糧政","海上的勝負很快，糧田壞掉卻要一季才長回來。"],
 ["DIA-BT-008","NPC-BT-008","修船","木頭裂在哪、龍骨彎多少，先量完再談修幾天。"],
 ["DIA-BT-009","NPC-BT-009","鹽田","暴潮過後先護淡水井。鹽少一批是生意，水壞一井是全島的事。"],
 ["DIA-BT-010","NPC-BT-010","航路","霧可以等，潮不能硬闖。今天晚兩個時辰，總比撞在礁上快。"],
 ["DIA-BT-011","NPC-BT-011","燈塔","我只回報看見的帆影、方位和速度，不把猜測寫進烽號。"],
 ["DIA-BT-012","NPC-BT-012","採石","石頭不是挖得越深越值錢；排水和支撐先壞，整個坑就不值錢。"],
 ["DIA-BT-013","NPC-BT-013","藥草","霧泉囊能保水，不代表它能治病。材料的用途要分清楚。"],
 ["DIA-BT-014","NPC-BT-014","委託","公會先看地圖層級，再看你能不能做；黑潮不缺敢出海的人，缺的是能回來的人。"],
 ["DIA-BT-015","NPC-BT-015","市場","風暴先打亂船期，船期再打亂價格。不要把三天缺貨當成整年短缺。"],
 ["DIA-BT-016","NPC-BT-016","法務","船誓能證明誰承諾過什麼，不能替你證明海上每件事的真相。"]
];
for(const d of DIALOGUES)upsert("npc_dialogues",{id:d[0],speaker_id:d[1],topic:d[2],text:d[3]});
for(const n of NPCS){const r=(DB.regional_npc_archetypes||[]).find(x=>x.id===n.id);if(r)r.dialogue_ids=["DIA-"+n.id.slice(4)]}

const ORGS=[
 {id:"ORG-BT-COURT",name:"皓月御國",kind:"court",tier:"C",region_id:REGION_ID,base_location_id:"L-BT-KYO",description:"維持祭祀、冊命、法統、典禮與王庭文書的國家禮制核心。"},
 {id:"ORG-BT-BAKUFU",name:"黑潮幕府",kind:"government",tier:"C",region_id:REGION_ID,base_location_id:"L-BT-SHOGUNPORT",description:"征夷大將軍統領的實際軍政中樞，統合海防、稅務、裁判與諸島治理。"},
 {id:"ORG-BT-SHIPWRIGHTS",name:"黑潮船匠會",kind:"craft",tier:"D",region_id:REGION_ID,base_location_id:"L-BT-AKAMINATO",description:"跨島船匠、木場與鐵件工坊組成的專業行會，維持民船與軍船修造標準。"},
 {id:"ORG-BT-FISH-SALT",name:"群島漁鹽公所",kind:"trade",tier:"D",region_id:REGION_ID,base_location_id:"L-BT-SHIRASUNA",description:"協調鹽課、漁場、乾製、水源與島際民生運輸的跨島公所。"},
 {id:"ORG-BT-PILOTS",name:"潮路水先人會",kind:"civilian",tier:"D",region_id:REGION_ID,base_location_id:"L-BT-SHIOMI",description:"登記水先人、潮窗、礁航標與短程渡船規則，對內海航行安全負責。"}
];
for(const o of ORGS)upsert("world_organizations",o);

const profile={
 id:"RCP-BT-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"黑潮群島",recommended_tier:"F～C",
 identity:"三大島、五小島與外圍礁島共同構成的海島國。皓月御國維繫法統與祭儀，黑潮幕府掌軍政與海防，各島以大名、奉行、港代與代官落實治理。",
 terrain:"火山丘陵、杉竹林、梯田河谷、海蝕崖、礁岸與多天然港灣",
 common_exports:["魚","鹽","船材","竹木","石材","藥草"],common_imports:["穀物","鐵器","高階礦材","大型牲畜"],
 food_staples:["米飯","乾魚","海菜","根菜","醃漬物"],recurring_risks:["季風暴潮","外海海獸","濃霧停航","島際補給中斷","港口派閥競爭"]
};
upsert("regional_content_profiles",profile);
upsert("regional_economy_profiles",{id:"ECO-BT-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["魚","鹽","木","竹","石","藥草"],imports:["鐵","礦","穀","馬"],notes:"島際市場受船期影響較大；本地魚鹽與船材相對充足，鐵器與高階礦材依賴外來。"});
const HOOKS=[
 {id:"HOOK-BT-01",title:"失火的航標",premise:"灰燈島外海航標連續熄滅，先查天候、燈油與值勤紀錄，再判斷是否有人為破壞。",tier:"D"},
 {id:"HOOK-BT-02",title:"船渠積水",premise:"赤浦廢船渠出現異常水位，船匠要求先疏通排水道，再清理進入的甲殼獸。",tier:"D"},
 {id:"HOOK-BT-03",title:"鹽井滲海",premise:"白砂島淡水井鹽度升高，需要調查舊鹽坑是否與海水裂隙重新連通。",tier:"E"},
 {id:"HOOK-BT-04",title:"霧季失航",premise:"潮見島與潮生村之間的短程船未按時抵達，水先人要求沿航標逐段確認。",tier:"E"},
 {id:"HOOK-BT-05",title:"糧船延誤",premise:"青岬運往黑潮京的糧船被風暴延誤，市場開始出現囤貨，需要護運與查價。",tier:"D"},
 {id:"HOOK-BT-06",title:"舊海門封條",premise:"黑潮京舊海門地道的封條受潮破裂，王庭與黑潮幕府要求共同見證後才能深入。",tier:"C"}
];
for(const h of HOOKS)upsert("regional_adventure_hooks",{...h,region_id:REGION_ID,polity_id:POLITY_ID});
const LIFE=[
 {id:"LIFE-BT-01",name:"潮汐市",text:"小島市場依船期與潮窗調整開市時間，風暴後常先交易淡水、乾糧、燈油與繩索。"},
 {id:"LIFE-BT-02",name:"換帆季",text:"季風轉向前，漁船與商船集中換帆、補繩、清船底，船匠與港務人手短期緊張。"},
 {id:"LIFE-BT-03",name:"皓月御國冊命日",text:"王庭典禮確認島領禮序與官位，但不等同黑潮幕府對實際軍政職務的任命。"},
 {id:"LIFE-BT-04",name:"巡燈夜",text:"外海島民在風暴季前共同檢查燈塔、烽臺與備用燈油。"},
 {id:"LIFE-BT-05",name:"鹽田輪水",text:"白砂島旱季優先保障飲水，鹽田引水會被限量，鹽價因此出現季節波動。"},
 {id:"LIFE-BT-06",name:"島際公船",text:"黑潮幕府與地方港代維持基本公船班次，低繁榮小島仍可能因風浪中斷數日。"}
];
for(const e of LIFE)upsert("regional_life_events",{...e,region_id:REGION_ID,polity_id:POLITY_ID});

for(const island of ISLANDS){
 const towns=TOWNS.filter(x=>x.islandId===island.id).map(x=>x.id);
 const wilds=FIELDS.filter(x=>x.islandId===island.id).map(x=>x.id);
 const dungeons=DUNGEONS.filter(x=>x.islandId===island.id).map(x=>x.id);
 upsert("province_region_maps",{
  id:island.province,layer:"province_region",name:island.name+"島領",display_name:"黑潮群島・"+island.name,
  administrative_type:island.class==="major"?"主要島領":"小島直轄／島領",parent_realm_map_id:REALM_ID,political_entity_id:POLITY_ID,world_region_id:REGION_ID,
  world_tier:island.tier,map_status:"playable_current",capital_location_id:island.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,
  economy:[...island.economy],recurring_risks:[...island.risk],identity:island.role,island_class:island.class
 });
 upsert("settlement_region_maps",{
  id:island.smap,name:island.name+"區域",parent_province_region_id:island.province,center_location_id:island.seat,world_tier:island.tier,map_status:"playable_current",
  location_ids:[...towns,...wilds,...dungeons],role:island.role,island_id:island.id
 });
}
const realm=row("realm_region_maps",REALM_ID);
if(realm){
 realm.province_region_ids=ISLANDS.map(x=>x.province);
 realm.regional_centers=["黑潮京","黑潮灣","赤浦港","青岬城"];
 realm.major_islands=ISLANDS.filter(x=>x.class==="major").map(x=>x.name);
 realm.minor_islands=ISLANDS.filter(x=>x.class==="minor").map(x=>x.name);
 realm.surrounding_islets=[...OUTER_ISLETS];
 realm.map_status="playable_current";
 realm.notes="三大島、五小島與七個外圍小型島礁構成同一獨立群島國；王庭與黑潮幕府為平行頂層權力，各島透過大名、奉行、港代與代官治理。";
}

const polity=row("political_entities",POLITY_ID);
if(polity){
 polity.capital="黑潮京";polity.secondary_centers=["黑潮灣","赤浦港","青岬城"];
 polity.island_structure={major:ISLANDS.filter(x=>x.class==="major").map(x=>x.name),minor:ISLANDS.filter(x=>x.class==="minor").map(x=>x.name),outer:[...OUTER_ISLETS]};
 polity.economic_base=["島際海運","漁鹽","造船","竹木","糧產","石材","藥草"];
 polity.military_structure=["黑潮幕府直轄聯合艦隊","諸島大名水軍","海防奉行巡船","港代與烽燈網"];
 polity.current_tensions=["皓月御國禮序與黑潮幕府實務協調","大島軍費與小島民生分配","金衡自由港的轉口競爭","風暴季護航與糧運"];
 polity.gameplay_role="完整海島雙軌政體／島際航行、武門政治、漁鹽造船、海防與群島探索";
}

const authority=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(authority){
 authority.office_nodes=Array.isArray(authority.office_nodes)?authority.office_nodes:[];
 const extra=[
  {id:"POL-010-O5",title:"黑潮幕府老中首座",authority_tier:"AUTH-6",authority_level:6,scope:"評定所政務統籌與大名協調",appointment:"征夷大將軍任命",rights:["AR-003","AR-004","AR-005","AR-008"],reports_to:"POL-010-O2",notes:"將軍之下的最高常務政務協調者。"},
  {id:"POL-010-O6",title:"海防奉行",authority_tier:"AUTH-5",authority_level:5,scope:"艦隊、巡航、燈塔、護航與軍港",appointment:"黑潮幕府任命",rights:["AR-003","AR-004","AR-008"],reports_to:"POL-010-O5",notes:"統籌群島海防，不具有獨立外交權。"},
  {id:"POL-010-O7",title:"財賦奉行",authority_tier:"AUTH-5",authority_level:5,scope:"島際稅賦、倉儲、鹽課與軍費",appointment:"黑潮幕府任命",rights:["AR-003","AR-005","AR-008"],reports_to:"POL-010-O5",notes:"協調各島稅務與黑潮幕府直轄收入。"},
  {id:"POL-010-O8",title:"裁判奉行",authority_tier:"AUTH-5",authority_level:5,scope:"武家法、港灣法與跨島案件",appointment:"黑潮幕府任命",rights:["AR-003","AR-005","AR-008"],reports_to:"POL-010-O5",notes:"跨島重大司法節點。"},
  {id:"POL-010-O9",title:"島代官",authority_tier:"AUTH-3",authority_level:3,scope:"小島行政、徵收、治安與公共工程",appointment:"黑潮幕府或大名任命",rights:["AR-003","AR-005"],reports_to:"POL-010-O4",notes:"五小島主要地方行政職。"},
  {id:"POL-010-O10",title:"港代",authority_tier:"AUTH-3",authority_level:3,scope:"港務、水先、船籍與碼頭治安",appointment:"奉行或島領任命",rights:["AR-003","AR-005","AR-008"],reports_to:"POL-010-O4",notes:"港市日常治理與海上交通落點。"}
 ];
 for(const n of extra){const i=authority.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)authority.office_nodes[i]=n;else authority.office_nodes.push(n)}
 authority.rival_power_centers=["皓月御國","黑潮幕府","赤浦與青岬等主要島領","大型船匠與港商","水先人會"];
 authority.player_interaction_summary="低階玩家多接觸港代、島代官、公會與地方奉行；中階可進入大名與奉行層；黑潮幕府評定與皓月御國冊命保留給高階劇情。";
}

const LORE=[
 {id:"LORE-BT-01",category:"geography",title:"三大島與五小島",text:"玄潮、赤浦、青岬為三大島；白砂、潮見、灰燈、鯨背、霧浦為五小島。外圍七個小型島礁主要服務航標、漁汛與臨時避風，不另設完整島領政府。"},
 {id:"LORE-BT-02",category:"politics",title:"王庭與黑潮幕府的分工",text:"皓月御國維繫祭祀、冊命、法統與共同禮制；征夷大將軍與黑潮幕府掌軍政、海防、稅務與諸島治理。兩者同屬黑潮群島國家體制，不是兩個國家。"},
 {id:"LORE-BT-03",category:"military",title:"群島海防網",text:"海防由黑潮幕府直轄聯合艦隊、主要大名水軍、海防奉行巡船與外島烽燈共同構成；控制航道與補給港比守住連續陸地邊界更重要。"},
 {id:"LORE-BT-04",category:"economy",title:"島際分工",text:"玄潮島提供行政與高階市場，赤浦島偏造船軍需，青岬島供糧與竹木，小島分別承擔鹽、漁、水先、護航、石材與藥草等功能。"},
 {id:"LORE-BT-05",category:"society",title:"港町與武家的日常",text:"多數島民首先面對的是港代、島代官、行會、公會與地方武家；高階王庭或黑潮幕府政治不會因玩家抵達就直接介入日常。"},
 {id:"LORE-BT-06",category:"environment",title:"風暴季與霧季",text:"風暴季會減少外海船班並提高護航、修船與糧運委託；霧季則主要影響潮見、霧浦與內海礁路的短程交通。"}
];
for(const l of LORE)upsert("lore_records",{...l,scope_type:"polity",scope_id:POLITY_ID});
if(polity){
 polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];
 for(const l of LORE)if(!polity.lore_record_ids.includes(l.id))polity.lore_record_ids.push(l.id);
}

DB.content_link_index=DB.content_link_index||{};
DB.content_link_index.location_content=DB.content_link_index.location_content||{};
for(const l of [...TOWNS.map(x=>loc(x.id)),...FIELDS.map(x=>loc(x.id)),...DUNGEONS.map(x=>loc(x.id))].filter(Boolean)){
 DB.content_link_index.location_content[l.id]={
  facility_ids:[...(l.facilities||[])],gather_item_ids:[...(l.gather||[])],fish_item_ids:[...(l.fish||[])],
  encounter_monster_ids:MONSTERS.filter(m=>(m.habitat||[]).includes(l.id)).map(m=>m.id),
  companion_species_ids:[],organization_ids:ORGS.filter(o=>o.base_location_id===l.id).map(o=>o.id),pantheon_ids:[]
 };
}

DB.black_tide_archipelago={
 version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,
 structure:"3大島＋5小島＋7外圍小型島礁",major_islands:ISLANDS.filter(x=>x.class==="major").map(x=>x.id),
 minor_islands:ISLANDS.filter(x=>x.class==="minor").map(x=>x.id),outer_islets:[...OUTER_ISLETS],
 town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),
 monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),
 governance:{
  sovereign_legal_center:"皓月御國",executive_military_center:"征夷大將軍／黑潮幕府",
  major_island_rule:"主要島由大名與黑潮幕府奉行共同構成地方權力網；大名領地世襲需黑潮幕府安堵並受皓月御國名義冊封。",
  minor_island_rule:"五小島以島代官、港代與地方武家治理，軍政最終受黑潮幕府奉行體系節制。"
 },
 save_compatible:true
};

function audit(){
 const issues=[];
 const p=row("political_entities",POLITY_ID);
 if(!p)issues.push("黑潮政治體缺失");
 else if(p.vassal_of)issues.push("黑潮群島不得成為其他政治體附庸");
 if(ISLANDS.length!==8||ISLANDS.filter(x=>x.class==="major").length!==3||ISLANDS.filter(x=>x.class==="minor").length!==5)issues.push("島嶼結構必須為3大島＋5小島");
 if(OUTER_ISLETS.length!==7)issues.push("外圍小型島礁數量應為7");
 for(const island of ISLANDS){
  const province=row("province_region_maps",island.province),smap=row("settlement_region_maps",island.smap);
  if(!province)issues.push("缺少島領地圖:"+island.name);
  if(!smap)issues.push("缺少島內地圖:"+island.name);
  const ids=smap?.location_ids||[];
  if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("島內缺少城鎮:"+island.name);
  if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("島內缺少野外:"+island.name);
  if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("島內缺少地下城:"+island.name);
 }
 const newLocIds=[...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id);
 for(const id of newLocIds){
  const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}
  if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);
  for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to);
 }
 if(MONSTERS.length!==18)issues.push("黑潮專屬怪物應為18種");
 for(const m0 of MONSTERS){
  const m=row("monsters",m0.id);if(!m)issues.push("怪物缺失:"+m0.id);
  else{
   if(tierRank(m.tier)>tierRank("C"))issues.push("REG-10怪物超過C級:"+m.id);
   if(!(m.habitat||[]).some(id=>loc(id)))issues.push("怪物棲地缺失:"+m.id);
   for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落素材缺失:"+m.id+"->"+d.id);
  }
 }
 if(NPCS.length!==16)issues.push("核心NPC應為16名");
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id)}
 for(const id of ORGS.map(x=>x.id))if(!row("world_organizations",id))issues.push("組織缺失:"+id);
  if(row("world_organizations","ORG-BT-COURT")?.name!=="皓月御國")issues.push("皓月御國正式名稱失步");
  if(row("world_organizations","ORG-BT-BAKUFU")?.name!=="黑潮幕府")issues.push("黑潮幕府正式名稱失步");
  if(row("regional_npc_archetypes","NPC-BT-002")?.role!=="征夷大將軍")issues.push("征夷大將軍職稱失步");
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
 for(const id of ["POL-010-O1","POL-010-O2","POL-010-O5","POL-010-O6","POL-010-O9","POL-010-O10"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
  if(a?.office_nodes?.find(x=>x.id==="POL-010-O2")?.title!=="征夷大將軍")issues.push("POL-010-O2職稱應為征夷大將軍");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
  stats:{islands:ISLANDS.length,major:3,minor:5,outer_islets:OUTER_ISLETS.length,towns:TOWNS.length,existing_starter_town:!!loc("L-START-TIDEBORN"),wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length}};
}

DB.meta=DB.meta||{};
DB.meta.black_tide_depth_revision=REV;
DB.black_tide_archipelago.initial_audit=audit();
globalThis.runBlackTideDepthAudit=audit;
globalThis.QUNLU_BLACK_TIDE=Object.freeze({version:REV,audit,island_ids:ISLANDS.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/black-tide-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();