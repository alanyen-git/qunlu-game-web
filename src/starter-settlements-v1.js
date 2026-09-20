/* 群陸旅誌：多政治體新手村與出生分配 CURRENT-1.95.0
 * STARTER-SETTLEMENTS-1.0
 * 在阿斯戴爾以外的5個政治體建立F級新手村與周邊低階區域；
 * 新角色依種族、出身、職業加權分配至柳橋鎮＋5個新手村之一，不改存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.95.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.95.0";
const REV="STARTER-SETTLEMENTS-1.2";
const SAFE_RULE="安全度越低，普通敵對遭遇機率越高；仍受生態、地圖層級、潛行與行動類型約束。";
const deep=v=>v==null?v:JSON.parse(JSON.stringify(v));
const location=id=>(DB.locations||[]).find(x=>x?.id===id)||null;
const polity=id=>(DB.political_entities||[]).find(x=>x?.id===id)||null;
const race=id=>(DB.races||[]).find(x=>x?.id===id)||null;
const origin=id=>(DB.origins||[]).find(x=>x?.id===id)||null;
const combatClass=id=>(DB.combat_classes||[]).find(x=>x?.id===id)||null;

function upsertLocation(row){
 const i=DB.locations.findIndex(x=>x?.id===row.id);
 if(i>=0)DB.locations[i]=row;else DB.locations.push(row);
 return row;
}
function addLink(fromId,toId,hours){
 const from=location(fromId);if(!from)return;
 from.links=Array.isArray(from.links)?from.links:[];
 const old=from.links.find(x=>x?.to===toId);
 if(old)old.hours=hours;else from.links.push({to:toId,hours});
}
function town(cfg){
 return {
  id:cfg.id,name:cfg.name,tier:"F",world_tier:"F",kind:"town",size:"新手村",region:cfg.region,
  description:cfg.description,risk:3,facilities:cfg.facilities,links:deep(cfg.links),
  safety_score:96,safety_label:"安穩",safety_rule:SAFE_RULE,
  world_region_id:cfg.region_id,political_entity_id:cfg.polity_id,culture_id:cfg.culture_id,
  history_scope:cfg.history_scope,political_role:"地方新手聚落",
  province_region_id:cfg.province_id,realm_region_map_id:"RMAP-"+cfg.polity_id,settlement_region_id:cfg.settlement_map_id,settlement_world_tier:"F",
  starter_cluster_id:cfg.id,starter_village:true,local_economy:deep(cfg.economy)
 };
}
function wild(cfg){
 const cluster=VILLAGES.find(x=>x.id===cfg.cluster_id)||null;
 const ref=location(cfg.template)||location("L-WOOD")||{};
 const ep=deep(ref.encounter_profile||{});
 Object.assign(ep,{
  zone:cfg.zone||"town_outskirts",max_tier:cfg.tier||"F",
  allow_magical_ecology:false,allow_demons:false,strict_habitat:true,no_constraint_relaxation:true,
  archetype:cfg.archetype||"open_wild",space_class:cfg.space_class||"open",
  allow_undead:false,allow_aquatic:!!cfg.allow_aquatic
 });
 const gather=deep(cfg.gather||ref.gather||[]);
 const hunt=deep(cfg.hunt??ref.hunt??[]);
 const fish=deep(cfg.fish??ref.fish??[]);
 return {
  id:cfg.id,name:cfg.name,tier:cfg.tier||"F",world_tier:cfg.tier||"F",kind:cfg.kind||"wild",size:cfg.size,
  region:cfg.region,description:cfg.description,risk:cfg.risk??8,encounter:cfg.encounter??0.18,
  links:deep(cfg.links),gather,hunt,fish,explore:deep(cfg.explore||[]),
  encounter_tags:deep(cfg.encounter_tags||ref.encounter_tags||[]),ecology_zone:cfg.zone||ref.ecology_zone||"town_outskirts",
  nearest_town_distance_hours:cfg.nearest_town_distance_hours??null,encounter_profile:ep,
  resource_profile:{
   forage:deep(cfg.resource_profile?.forage??gather),
   mining:deep(cfg.resource_profile?.mining??[]),
   woodcut:deep(cfg.resource_profile?.woodcut??[]),
   hunt:deep(cfg.resource_profile?.hunt??hunt),
   fish:deep(cfg.resource_profile?.fish??fish)
  },
  safety_score:cfg.safety_score??80,safety_label:cfg.safety_label||"較安全",safety_rule:SAFE_RULE,
  world_region_id:cfg.region_id,political_entity_id:cfg.polity_id,culture_id:cfg.culture_id,
  history_scope:cfg.history_scope,political_role:cfg.kind==="dungeon"?"新手區遺跡／地下區":"新手村周邊野外",
  province_region_id:cluster?.province_id||null,realm_region_map_id:"RMAP-"+cfg.polity_id,settlement_region_id:cluster?.settlement_map_id||null,
  starter_cluster_id:cfg.cluster_id,local_economy:deep(cluster?.economy||null),
  hunt_requires_battle:true
 };
}

const VILLAGES=[
 {
  id:"L-START-DAWNGRAIN",name:"晨穗村",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",
  history_scope:"晨律教國／晨鐘聖原",province_id:"PROV-START-04",settlement_map_id:"SMAP-START-DAWNGRAIN",route_hours:32,
  economy:{prosperity_score:76,prosperity_label:"繁榮",market_budget_mult:1.20,stock_mult:1.18,liquidity_mult:1.22,market_price_mult:.98,drivers:["穀物","羊毛","朝聖補給"],constraints:["金屬工具仰賴輸入","洪水季交通"],infrastructure:"鋪設聖道、糧倉、定期市集與教會救濟網完整"},
  facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","church"],
  description:"晨鐘聖原西側的農牧村，清晨鐘聲、穀倉與朝聖小路交織；公會以採集、護田、巡溪等F級工作訓練新人。",
  links:[{to:"L-DG-DEWFIELD",hours:1.1},{to:"L-DG-PRAYERBROOK",hours:1.3},{to:"L-DG-PILGRIMORCHARD",hours:1.4},{to:"L-SELENBURG",hours:32}]
 },
 {
  id:"L-START-MOSSMOON",name:"苔月村",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",
  history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",province_id:"PROV-START-12",settlement_map_id:"SMAP-START-MOSSMOON",route_hours:44,
  economy:{prosperity_score:64,prosperity_label:"穩健",market_budget_mult:1.06,stock_mult:1.10,liquidity_mult:1.00,market_price_mult:1.00,drivers:["藥草","樹脂","林下採集"],constraints:["金屬與鹽需輸入","林地採伐受配額"],infrastructure:"林徑維護良好，小型藥草市集穩定，但重型商路有限"},
  facilities:["guild","general","tailor","alchemy","tavern","inn","church"],
  description:"位於古林外緣的混居小村，以林下藥草、鹿徑與月泉為生；對精靈、半精靈與自然系旅人較為熟悉。",
  links:[{to:"L-MM-SILVERLEAF",hours:1.0},{to:"L-MM-DEERSPRING",hours:1.4},{to:"L-MM-RESINGLADE",hours:1.3},{to:"L-SELENBURG",hours:44}]
 },
 {
  id:"L-START-IRONPINE",name:"鐵松村",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",
  history_scope:"安威爾帝國／西北山廳外緣",province_id:"PROV-START-13",settlement_map_id:"SMAP-START-IRONPINE",route_hours:48,
  economy:{prosperity_score:72,prosperity_label:"繁榮",market_budget_mult:1.18,stock_mult:1.15,liquidity_mult:1.18,market_price_mult:.99,drivers:["礦石","石材","工具維修"],constraints:["穀物與藥材依賴山外","冬雪封路"],infrastructure:"礦道、吊運架與鍛造工坊密度高，日常現金流優於同級村落"},
  facilities:["guild","general","blacksmith","tailor","tavern","inn","church","clinic"],
  description:"安威爾南側山路上的礦木村，矮人、侏儒與山民商隊常在此整補；低階委託集中於礦道巡查與山坡採集。",
  links:[{to:"L-IP-ANVILRIDGE",hours:1.2},{to:"L-IP-BLACKVEIN",hours:1.5},{to:"L-IP-COPPERCUT",hours:1.4},{to:"L-SELENBURG",hours:48}]
 },
 {
  id:"L-START-WINDSPRING",name:"風泉村",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",
  history_scope:"白氈汗國／北中部草海",province_id:"PROV-START-15",settlement_map_id:"SMAP-START-WINDSPRING",route_hours:52,
  economy:{prosperity_score:48,prosperity_label:"偏弱",market_budget_mult:.82,stock_mult:.82,liquidity_mult:.78,market_price_mult:1.04,drivers:["馬匹","羊毛","皮革"],constraints:["固定市場小","金屬與藥劑依賴輸入","旱季水源不穩"],infrastructure:"以季節市集、牧道與泉眼維持交易，固定倉儲與工坊較少"},
  facilities:["guild","general","blacksmith","tavern","inn","church"],
  description:"依季節泉眼形成的定居補給村，牧民、獸族與旅隊在此交換乾糧、皮革與路況；周圍草原適合基礎追蹤與巡牧。",
  links:[{to:"L-WS-WHITEGRASS",hours:1.1},{to:"L-WS-GOOSEFORD",hours:1.6},{to:"L-WS-HERDSTONE",hours:1.5},{to:"L-SELENBURG",hours:52}]
 },
 {
  id:"L-START-TIDEBORN",name:"潮生村",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",
  history_scope:"黑潮群島／外海小島帶",province_id:"PROV-START-10",settlement_map_id:"SMAP-START-TIDEBORN",route_hours:64,
  economy:{prosperity_score:63,prosperity_label:"穩健",market_budget_mult:.98,stock_mult:.96,liquidity_mult:1.06,market_price_mult:1.01,drivers:["鹽","乾魚","船材","短程海運"],constraints:["穀物與鐵器依賴輸入","風暴造成到貨波動"],infrastructure:"碼頭與修船棚帶來較快周轉，但島嶼倉儲容量與進口依賴限制庫存"},
  facilities:["guild","general","blacksmith","tailor","tavern","inn","church"],
  description:"黑潮群島內側航道的小型漁武村，潮汐、礁路與短程船運塑造生活；東方劍士、漁家與海上背景旅人常從這裡起步。",
  links:[{to:"L-TB-SEAPINE",hours:1.2},{to:"L-TB-BLACKREEF",hours:1.0},{to:"L-TB-ROPEGRASS",hours:1.3},{to:"L-SELENBURG",hours:64}]
 }
];

const PROSPERITY_DETAIL={
 "L-START-DAWNGRAIN":{
  road:{quality:"鋪設聖道與整修田間路",maintenance:"高",reliability:"高",note:"糧車與朝聖人流使主要道路全年維護；雨季支路仍可能泥濘。"},
  market:{restock_cycle_hours:20,contract_volume_mult:1.18,merchant_frequency:"高",warehouse_capacity:"高",note:"糧倉與定期市集使基礎補給穩定，公會委託更新較密。"},
  resource:{capacity_mult:1.12,regen_hours_mult:.85,management:"農田輪作、灌溉與合作採集",note:"可再生農野資源容量較高、恢復較快；高階素材仍受F級區域限制。"},
  dungeon:{respawn_hours_mult:1.20,patrol_pressure:"高",note:"教會與公會巡查頻繁，清理後敵對活動恢復較慢。"},
  summary:"高繁榮農牧型：補給穩、道路佳、可再生資源管理成熟，地下區受巡查壓制。"
 },
 "L-START-MOSSMOON":{
  road:{quality:"巡林木道與林間步徑",maintenance:"中高",reliability:"中高",note:"路徑清楚但大型車隊受林地寬度與採伐規範限制。"},
  market:{restock_cycle_hours:24,contract_volume_mult:1.05,merchant_frequency:"中",warehouse_capacity:"中",note:"藥草與林產周轉穩定，金屬、鹽與重型裝備補貨較慢。"},
  resource:{capacity_mult:1.06,regen_hours_mult:.82,management:"採集配額、巡林與輪區封養",note:"林下資源恢復快，但採伐與稀有素材受配額保護。"},
  dungeon:{respawn_hours_mult:1.15,patrol_pressure:"中高",note:"巡林隊會定期封鎖與清理危險入口，敵對活動再聚集速度偏慢。"},
  summary:"穩健林業型：資源再生管理最佳，重貨物流較弱，地下遺構受巡林制度控制。"
 },
 "L-START-IRONPINE":{
  road:{quality:"碎石礦道、吊運坡道與工程棧道",maintenance:"高",reliability:"中高",note:"工程道路適合礦材運輸，但冬雪與落石會造成季節性阻塞。"},
  market:{restock_cycle_hours:22,contract_volume_mult:1.15,merchant_frequency:"中高",warehouse_capacity:"中高",note:"礦材、工具與維修品流通快，糧食與藥材仍仰賴山外輸入。"},
  resource:{capacity_mult:.95,regen_hours_mult:1.10,management:"礦權分區與淺層開採管制",note:"礦業繁榮帶來較高採掘壓力，淺層資源容量略低且恢復較慢。"},
  dungeon:{respawn_hours_mult:1.10,patrol_pressure:"中高",note:"礦道巡查與工程隊能延緩敵對生物回流，但廢坑仍有持續活動。"},
  summary:"高現金流礦業型：市場與工坊強，但野外礦材承受採掘壓力，冬季物流有風險。"
 },
 "L-START-WINDSPRING":{
  road:{quality:"季節牧道與泉眼土路",maintenance:"低",reliability:"偏低",note:"路網依牧季、水源與天候變動，固定橋涵與倉儲不足。"},
  market:{restock_cycle_hours:36,contract_volume_mult:.82,merchant_frequency:"偏低",warehouse_capacity:"偏低",note:"季節市集主導交易，金屬、藥劑與精製品常需等待商隊。"},
  resource:{capacity_mult:.90,regen_hours_mult:1.20,management:"低密度牧地與自然恢復",note:"旱季與水源波動壓低可採資源容量，恢復也較慢。"},
  dungeon:{respawn_hours_mult:.85,patrol_pressure:"低",note:"固定巡查不足，清理後盜匪或小型魔物較快重新利用地下空間。"},
  summary:"低繁榮牧業型：固定補給弱、資源受旱季限制、地下區再活化最快。"
 },
 "L-START-TIDEBORN":{
  road:{quality:"碼頭棧橋、潮路與海岸小徑",maintenance:"中",reliability:"中",note:"短程海運效率佳，但風暴與潮汐使到貨與通行具有波動。"},
  market:{restock_cycle_hours:28,contract_volume_mult:1.02,merchant_frequency:"中高",warehouse_capacity:"中",note:"魚鹽與船材周轉快，穀物、鐵器等進口品受船期影響。"},
  resource:{capacity_mult:1.08,regen_hours_mult:.90,management:"潮間帶輪採、漁汛與碼頭配額",note:"海岸與漁獲類可再生資源恢復較快，但陸上進口型資源不足。"},
  dungeon:{respawn_hours_mult:1.00,patrol_pressure:"中",note:"海防與漁隊巡查有限，潮汐洞窟活動恢復速度接近標準。"},
  summary:"海運穩健型：周轉快但庫存受船期限制，海岸資源恢復佳，風暴造成供應波動。"
 }
};
function applyProsperityDetail(cfg){
 const detail=PROSPERITY_DETAIL[cfg.id];if(!detail)return;
 cfg.economy=cfg.economy||{};
 cfg.economy.prosperity_detail=deep(detail);
 cfg.economy.infrastructure_detail=detail.summary;
 if(detail.summary&&!String(cfg.economy.infrastructure||"").includes(detail.summary))cfg.economy.infrastructure=`${cfg.economy.infrastructure||""}；${detail.summary}`;
}
function enrichStarterEconomyLocations(){
 for(const cfg of VILLAGES){
  const detail=cfg.economy?.prosperity_detail||PROSPERITY_DETAIL[cfg.id];if(!detail)continue;
  const rows=[location(cfg.id),...AREAS.filter(x=>x.cluster_id===cfg.id).map(x=>location(x.id))].filter(Boolean);
  for(const l of rows){
   l.local_economy=deep(cfg.economy);
   l.road_profile=deep(detail.road);
   l.supply_profile=deep(detail.market);
   l.economic_detail_summary=detail.summary;
   if(l.kind==="wild"||l.kind==="dungeon")l.resource_economy=deep(detail.resource);
   if(l.kind==="dungeon")l.dungeon_economy=deep(detail.dungeon);
  }
 }
}

const AREAS=[
 {id:"L-DG-DEWFIELD",name:"露鐘田野",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"L-LOWFIELD",size:"農野",description:"晨穗村外的穀田、菜圃與灌溉渠，新手可辨識作物、採集低階藥草並處理小型獸害。",links:[{to:"L-START-DAWNGRAIN",hours:1.1},{to:"L-DG-PRAYERBROOK",hours:1.0},{to:"D-DG-OLDCHANNEL",hours:1.5}],encounter_tags:["plains"],nearest_town_distance_hours:1.1,safety_score:89,explore:[["灌溉渠",30],["穀田獸徑",25],["巡田石標",20],["野草藥斑",15],["朝聖岔路",10]]},
 {id:"L-DG-PRAYERBROOK",name:"白祈溪岸",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"L-RIVER",size:"溪岸",description:"流經村外的小溪與淺灘，是取水、釣魚與採藥的低風險地帶。",links:[{to:"L-START-DAWNGRAIN",hours:1.3},{to:"L-DG-DEWFIELD",hours:1.0}],encounter_tags:["plains","water"],allow_aquatic:true,nearest_town_distance_hours:1.3,safety_score:86,explore:[["淺灘魚群",30],["祈願石",25],["河岸藥草",20],["舊木橋",15],["水獸足跡",10]]},
 {id:"D-DG-OLDCHANNEL",name:"舊渠祈室",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"小型地下水渠",description:"廢棄引水渠旁的小型祈室，已由地方公會標為E級以下訓練遺構。",links:[{to:"L-DG-DEWFIELD",hours:1.5}],zone:"dungeon",archetype:"waterway_ruin",space_class:"standard",allow_aquatic:true,encounter_tags:["cave","dungeon","ruins","water"],safety_score:55,safety_label:"警戒",risk:15,gather:["I-MUSHROOM","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-MUSHROOM","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["封閉水門",30],["祈室石刻",25],["潮濕菌叢",20],["舊維修道",15],["崩落支渠",10]]},

 {id:"L-MM-SILVERLEAF",name:"銀葉林緣",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"L-WOOD",size:"林地",description:"苔月村外圍經常有人巡護的銀葉林，低階藥草與小型獸類豐富。",links:[{to:"L-START-MOSSMOON",hours:1.0},{to:"L-MM-DEERSPRING",hours:1.1},{to:"D-MM-ROOTSHRINE",hours:1.6}],encounter_tags:["forest","plains"],nearest_town_distance_hours:1.0,safety_score:84,explore:[["銀葉藥斑",30],["鹿徑",25],["林冠光井",20],["巡林記號",15],["古根裂縫",10]]},
 {id:"L-MM-DEERSPRING",name:"鹿泉溪谷",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"L-RIVER",size:"林溪",description:"林間泉水匯成的小溪谷，常見鹿群、鳥獸與可食野果。",links:[{to:"L-START-MOSSMOON",hours:1.4},{to:"L-MM-SILVERLEAF",hours:1.1}],encounter_tags:["forest","water"],allow_aquatic:true,nearest_town_distance_hours:1.4,safety_score:82,explore:[["鹿群飲水處",30],["林泉",25],["野果灌叢",20],["倒木橋",15],["月光苔",10]]},
 {id:"D-MM-ROOTSHRINE",name:"根門舊祠",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"樹根遺構",description:"被巨樹根系包覆的古老小祠，入口由巡林隊標記，深處仍有未清理的獸穴與殘破通道。",links:[{to:"L-MM-SILVERLEAF",hours:1.6}],zone:"dungeon",archetype:"shrine_ruin",space_class:"standard",encounter_tags:["cave","forest","ruins","dungeon"],safety_score:54,safety_label:"警戒",risk:16,gather:["I-MUSHROOM","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],hunt:[],fish:[],resource_profile:{forage:["I-MUSHROOM","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["根門石階",30],["苔紋祭臺",25],["獸穴側道",20],["舊巡林符",15],["封閉根室",10]]},

 {id:"L-IP-ANVILRIDGE",name:"砧風坡",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"L-HILL",size:"山坡",description:"鐵松村外的低矮礦脈坡地，能採到基礎礦材，但較高山區仍被巡山隊封鎖。",links:[{to:"L-START-IRONPINE",hours:1.2},{to:"L-IP-BLACKVEIN",hours:1.2},{to:"D-IP-OLDMINE",hours:1.4}],encounter_tags:["mountain","plains"],nearest_town_distance_hours:1.2,safety_score:79,gather:["I-BRANCH","I-HERB","I-ORE-BRONZE"],explore:[["裸露礦脈",30],["松木坡",25],["礦車舊轍",20],["碎石棚",15],["山羊足跡",10]],resource_profile:{forage:["I-BRANCH","I-HERB"],mining:["I-ORE-BRONZE"],woodcut:[],hunt:["I-RAWMEAT"],fish:[]}},
 {id:"L-IP-BLACKVEIN",name:"黑脈溪谷",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"L-RIVER",size:"山溪",description:"黑色岩層間流出的冷溪，連接木料場與舊礦支道，是村民日常取水與搬運路線。",links:[{to:"L-START-IRONPINE",hours:1.5},{to:"L-IP-ANVILRIDGE",hours:1.2}],encounter_tags:["mountain","water"],allow_aquatic:true,nearest_town_distance_hours:1.5,safety_score:81,explore:[["冷泉",30],["礦砂",25],["松木棧道",20],["山羊飲水處",15],["舊礦標",10]]},
 {id:"D-IP-OLDMINE",name:"舊礦支坑",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"廢棄礦坑",description:"主礦脈停採後留下的小型支坑，公會只開放淺層區給F級新人熟悉地下行動。",links:[{to:"L-IP-ANVILRIDGE",hours:1.4}],zone:"dungeon",archetype:"mine",space_class:"standard",encounter_tags:["cave","dungeon","ruins","mountain"],safety_score:50,safety_label:"警戒",risk:18,gather:["I-ORE-BRONZE","I-ORE-IRON","MAT-ORE-02","MAT-ORE-09","MAT-ORE-10"],hunt:[],fish:[],resource_profile:{forage:[],mining:["I-ORE-BRONZE","I-ORE-IRON","MAT-ORE-02","MAT-ORE-09","MAT-ORE-10"],woodcut:[],hunt:[],fish:[]},explore:[["廢礦車",30],["淺層礦脈",25],["支撐木架",20],["坍塌側坑",15],["深處回音",10]]},

 {id:"L-WS-WHITEGRASS",name:"白草牧野",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"L-LOWFIELD",size:"草原",description:"風泉村外的短草牧地，牧群、野兔與小型掠食獸共享同一片水草地。",links:[{to:"L-START-WINDSPRING",hours:1.1},{to:"L-WS-GOOSEFORD",hours:1.3},{to:"D-WS-STONERING",hours:1.8}],encounter_tags:["plains"],nearest_town_distance_hours:1.1,safety_score:85,explore:[["牧群路",30],["白草藥斑",25],["舊營火",20],["兔穴",15],["遠方騎痕",10]]},
 {id:"L-WS-GOOSEFORD",name:"雁回河灘",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"L-RIVER",size:"河灘",description:"季節河在此形成淺灘與蘆草帶，是候鳥、牧隊與新手獵人的共同補水點。",links:[{to:"L-START-WINDSPRING",hours:1.6},{to:"L-WS-WHITEGRASS",hours:1.3}],encounter_tags:["plains","water"],allow_aquatic:true,nearest_town_distance_hours:1.6,safety_score:83,explore:[["雁群",30],["淺河灘",25],["蘆草帶",20],["牧隊石標",15],["獸群足跡",10]]},
 {id:"D-WS-STONERING",name:"石圈舊營",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"半地下舊營",description:"廢棄石圈下方連著儲藏坑與避風地道，偶有小型魔物或盜匪留下活動痕跡。",links:[{to:"L-WS-WHITEGRASS",hours:1.8}],zone:"dungeon",archetype:"artificial_ruin",space_class:"standard",encounter_tags:["dungeon","ruins","plains","cave"],safety_score:53,safety_label:"警戒",risk:17,gather:["I-HERB","I-BRANCH","I-ORE-BRONZE"],hunt:[],fish:[],resource_profile:{forage:["I-HERB","I-BRANCH"],mining:["I-ORE-BRONZE"],woodcut:[],hunt:[],fish:[]},explore:[["石圈入口",30],["舊儲藏坑",25],["避風地道",20],["營火灰燼",15],["封土側室",10]]},

 {id:"L-TB-SEAPINE",name:"海松坡",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"L-WOOD",size:"海岸林坡",description:"潮生村上方的矮海松林與風坡，可採集枝材、藥草並觀察島上小型野獸。",links:[{to:"L-START-TIDEBORN",hours:1.2},{to:"L-TB-BLACKREEF",hours:1.1},{to:"D-TB-TIDECAVE",hours:1.7}],encounter_tags:["forest","plains"],nearest_town_distance_hours:1.2,safety_score:82,explore:[["海松林",30],["鳥巢崖",25],["採藥坡",20],["舊烽火石",15],["野獸徑",10]]},
 {id:"L-TB-BLACKREEF",name:"玄礁潮坪",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"L-RIVER",size:"潮間帶",description:"黑色礁石與淺潮池形成的海岸潮坪，退潮時可安全採集與釣捕低階水產。",links:[{to:"L-START-TIDEBORN",hours:1.0},{to:"L-TB-SEAPINE",hours:1.1}],encounter_tags:["plains","water"],allow_aquatic:true,nearest_town_distance_hours:1.0,safety_score:84,explore:[["潮池魚群",30],["玄色礁脊",25],["漂木",20],["貝殼灘",15],["海鳥群",10]]},
 {id:"D-TB-TIDECAVE",name:"退潮岩窟",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"潮汐海蝕洞",description:"只有退潮時能穩定進入的淺層海蝕洞，公會立有潮時牌，深部仍禁止低階冒險者進入。",links:[{to:"L-TB-SEAPINE",hours:1.7}],zone:"dungeon",archetype:"waterway_ruin",space_class:"standard",allow_aquatic:true,encounter_tags:["cave","dungeon","water","ruins"],safety_score:51,safety_label:"警戒",risk:18,gather:["I-MUSHROOM","I-HERB"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-MUSHROOM","I-HERB"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["潮時石標",30],["淺層潮池",25],["海蝕側洞",20],["舊繫船環",15],["封閉深洞",10]]},
 {id:"L-DG-PILGRIMORCHARD",name:"巡禮果園帶",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"L-LOWFIELD",size:"果園農路",description:"連接晨穗村與小教堂群的果園農路，因朝聖補給需求而維護良好，路旁有蜂箱、果樹與基礎藥草。",links:[{to:"L-START-DAWNGRAIN",hours:1.4},{to:"L-DG-DEWFIELD",hours:1.1},{to:"D-DG-TITHECELLAR",hours:1.2}],gather:["I-ROOT","I-BERRY","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],encounter_tags:["plains"],nearest_town_distance_hours:1.4,safety_score:91,explore:[["果園水渠",30],["蜂箱列",25],["巡禮路標",20],["小型市集棚",15],["野兔穴",10]],resource_profile:{forage:["I-ROOT","I-BERRY","I-HERB","I-MINT","MAT-HERB-01","MAT-HERB-04"],mining:[],woodcut:[],hunt:["I-RAWMEAT"],fish:[]}},
 {id:"D-DG-TITHECELLAR",name:"舊什一糧窖",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"地下糧窖",description:"早期教區徵收什一糧時使用的石砌糧窖，現因潮濕與鼠害停用，地方公會定期派新人巡查。",links:[{to:"L-DG-PILGRIMORCHARD",hours:1.2}],zone:"dungeon",archetype:"artificial_cellar",space_class:"standard",encounter_tags:["dungeon","ruins","plains","cave"],safety_score:58,safety_label:"警戒",risk:14,gather:["I-MUSHROOM","I-HERB"],hunt:[],fish:[],resource_profile:{forage:["I-MUSHROOM","I-HERB"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["舊糧架",30],["封蠟木箱",25],["鼠道",20],["滲水石壁",15],["封閉稅冊室",10]]},
 {id:"D-DG-WAYSHRINE",name:"白路小聖堂地窖",cluster_id:"L-START-DAWNGRAIN",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",history_scope:"晨律教國／晨鐘聖原",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"道路聖堂地窖",description:"白祈溪舊道路旁的小聖堂地窖，曾存放救濟糧與燈油；廢棄後成為低階害獸與史萊姆藏身處。",links:[{to:"L-DG-PRAYERBROOK",hours:1.4}],zone:"dungeon",archetype:"shrine_ruin",space_class:"standard",encounter_tags:["dungeon","ruins","plains","cave"],safety_score:56,safety_label:"警戒",risk:15,gather:["I-MUSHROOM","I-HERB","I-MINT"],hunt:[],fish:[],resource_profile:{forage:["I-MUSHROOM","I-HERB","I-MINT"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["舊燈油庫",30],["救濟糧架",25],["祈禱石室",20],["鼠怪抓痕",15],["封死側門",10]]},

 {id:"L-MM-RESINGLADE",name:"琥脂林間地",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"L-WOOD",size:"林間採集地",description:"受配額管理的樹脂與藥草採集地，採伐量不大但品質穩定，反映苔月村重視永續而非大量交易的經濟方式。",links:[{to:"L-START-MOSSMOON",hours:1.3},{to:"L-MM-SILVERLEAF",hours:1.2},{to:"D-MM-HOLLOWOAK",hours:1.3}],gather:["I-BRANCH","I-HERB","I-MINT","I-MUSHROOM","I-BERRY","MAT-HERB-01","MAT-HERB-04"],encounter_tags:["forest","plains"],nearest_town_distance_hours:1.3,safety_score:86,explore:[["採脂樹列",30],["藥草圃",25],["林地配額牌",20],["菌菇倒木",15],["小獸巢徑",10]],resource_profile:{forage:["I-BRANCH","I-HERB","I-MINT","I-MUSHROOM","I-BERRY","MAT-HERB-01","MAT-HERB-04"],mining:[],woodcut:[],hunt:["I-RAWMEAT"],fish:[]}},
 {id:"D-MM-HOLLOWOAK",name:"空心古橡下層",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"根系洞室",description:"倒塌古橡的巨大根穴連到舊儲藏室，巡林人只開放外層給新人清理害獸與記錄菌類。",links:[{to:"L-MM-RESINGLADE",hours:1.3}],zone:"dungeon",archetype:"natural_burrow",space_class:"standard",encounter_tags:["forest","cave","dungeon"],safety_score:55,safety_label:"警戒",risk:15,gather:["I-MUSHROOM","I-HERB","I-MINT"],hunt:[],fish:[],resource_profile:{forage:["I-MUSHROOM","I-HERB","I-MINT"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["空心樹室",30],["根系隧道",25],["菌簇",20],["獸爪痕",15],["封閉舊藏室",10]]},
 {id:"D-MM-SPRINGVAULT",name:"鹿泉石蓄室",cluster_id:"L-START-MOSSMOON",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"古老蓄水室",description:"鹿泉溪谷下方的小型石蓄室，原用於旱季調水；淤泥與倒根使部分通道成為水生小型魔物棲地。",links:[{to:"L-MM-DEERSPRING",hours:1.5}],zone:"dungeon",archetype:"waterway_ruin",space_class:"standard",allow_aquatic:true,encounter_tags:["forest","water","cave","dungeon","ruins"],safety_score:54,safety_label:"警戒",risk:16,gather:["I-MUSHROOM","I-HERB"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-MUSHROOM","I-HERB"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["古蓄水槽",30],["樹根裂口",25],["淤泥通道",20],["水生足跡",15],["封閉閘室",10]]},

 {id:"L-IP-COPPERCUT",name:"銅痕採石坡",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"L-HILL",size:"淺層採石坡",description:"只開放青銅級淺層礦材與石料的新手採集坡，高價礦脈由山廳封鎖，避免F級區域產出超階素材。",links:[{to:"L-START-IRONPINE",hours:1.4},{to:"L-IP-ANVILRIDGE",hours:1.0},{to:"D-IP-TOOLVAULT",hours:1.2}],gather:["I-BRANCH","I-HERB","I-ORE-BRONZE"],encounter_tags:["mountain","plains"],nearest_town_distance_hours:1.4,safety_score:80,explore:[["青銅露頭",30],["採石臺階",25],["木料堆",20],["吊運架",15],["山羊徑",10]],resource_profile:{forage:["I-BRANCH","I-HERB"],mining:["I-ORE-BRONZE"],woodcut:[],hunt:["I-RAWMEAT"],fish:[]}},
 {id:"D-IP-TOOLVAULT",name:"封存工具庫",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"地下工具庫",description:"舊採石場撤離後封存的工具庫，殘留黑鐵級碎料與失修吊具，屬適合新人處理的工程型地下區。",links:[{to:"L-IP-COPPERCUT",hours:1.2}],zone:"dungeon",archetype:"artificial_cellar",space_class:"standard",encounter_tags:["mountain","cave","dungeon","ruins"],safety_score:52,safety_label:"警戒",risk:17,gather:["I-ORE-BRONZE","I-ORE-IRON","MAT-ORE-02"],hunt:[],fish:[],resource_profile:{forage:[],mining:["I-ORE-BRONZE","I-ORE-IRON","MAT-ORE-02"],woodcut:[],hunt:[],fish:[]},explore:[["舊工具架",30],["礦車零件",25],["吊具井",20],["碎礦堆",15],["封存內庫",10]]},
 {id:"D-IP-WATERADIT",name:"排水橫坑",cluster_id:"L-START-IRONPINE",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",history_scope:"安威爾帝國／西北山廳外緣",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"礦山排水道",description:"黑脈溪谷旁的舊礦山排水橫坑，水路與支撐木架仍可見，偶有礦鼠、史萊姆與坍落風險。",links:[{to:"L-IP-BLACKVEIN",hours:1.3}],zone:"dungeon",archetype:"mine",space_class:"standard",allow_aquatic:true,encounter_tags:["mountain","water","cave","dungeon","ruins"],safety_score:50,safety_label:"警戒",risk:18,gather:["I-ORE-BRONZE","I-ORE-IRON"],hunt:[],fish:[],resource_profile:{forage:[],mining:["I-ORE-BRONZE","I-ORE-IRON"],woodcut:[],hunt:[],fish:[]},explore:[["排水溝",30],["支撐木架",25],["礦鼠穴",20],["積水側道",15],["封閉深坑",10]]},

 {id:"L-WS-HERDSTONE",name:"牧石緩坡",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"L-LOWFIELD",size:"草坡牧地",description:"以堆石、繩旗和臨時圈欄標示的牧地，資源不算稀少，但缺乏固定倉儲使商品化能力低於農業型村落。",links:[{to:"L-START-WINDSPRING",hours:1.5},{to:"L-WS-WHITEGRASS",hours:1.2},{to:"D-WS-SUPPLYCELLAR",hours:1.4}],gather:["I-ROOT","I-BERRY","I-HERB","I-BRANCH"],encounter_tags:["plains"],nearest_town_distance_hours:1.5,safety_score:82,explore:[["牧石界標",30],["臨時圈欄",25],["野根斑",20],["舊營火",15],["牧犬足跡",10]],resource_profile:{forage:["I-ROOT","I-BERRY","I-HERB","I-BRANCH"],mining:[],woodcut:[],hunt:["I-RAWMEAT"],fish:[]}},
 {id:"D-WS-SUPPLYCELLAR",name:"舊牧隊補給窖",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"半地下補給窖",description:"舊牧隊在固定牧路留下的補給窖，因水患與盜取停用，現由公會當作低階巡查點。",links:[{to:"L-WS-HERDSTONE",hours:1.4}],zone:"dungeon",archetype:"artificial_cellar",space_class:"standard",encounter_tags:["plains","cave","dungeon","ruins"],safety_score:57,safety_label:"警戒",risk:15,gather:["I-HERB","I-BRANCH"],hunt:[],fish:[],resource_profile:{forage:["I-HERB","I-BRANCH"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["乾糧架",30],["繩旗束",25],["鼠洞",20],["滲水土壁",15],["封閉側窖",10]]},
 {id:"D-WS-DRYWELL",name:"枯泉井道",cluster_id:"L-START-WINDSPRING",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",history_scope:"白氈汗國／北中部草海",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"廢棄取水井道",description:"雁回河灘附近的舊取水井道，旱季裸露、雨季積水，反映白氈草海水源波動對地方經濟的直接影響。",links:[{to:"L-WS-GOOSEFORD",hours:1.5}],zone:"dungeon",archetype:"waterway_ruin",space_class:"standard",allow_aquatic:true,encounter_tags:["plains","water","cave","dungeon","ruins"],safety_score:53,safety_label:"警戒",risk:17,gather:["I-HERB","I-MUSHROOM"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-HERB","I-MUSHROOM"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["舊井梯",30],["乾裂水槽",25],["雨季水痕",20],["小型獸穴",15],["封閉深井",10]]},

 {id:"L-TB-ROPEGRASS",name:"繩草避風灣",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"L-RIVER",size:"海灣草坡",description:"盛產可搓繩海草與漂木的小灣，船匠和漁民會定期清理，供應潮生村的低階船材與繩索需求。",links:[{to:"L-START-TIDEBORN",hours:1.3},{to:"L-TB-BLACKREEF",hours:1.0},{to:"D-TB-WATCHCAVE",hours:1.4}],gather:["I-BRANCH","I-HERB","I-MINT"],fish:["I-RAWFISH"],encounter_tags:["plains","water"],allow_aquatic:true,nearest_town_distance_hours:1.3,safety_score:85,explore:[["繩草帶",30],["漂木灘",25],["避風泊位",20],["舊纜樁",15],["潮池",10]],resource_profile:{forage:["I-BRANCH","I-HERB","I-MINT"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]}},
 {id:"D-TB-WATCHCAVE",name:"舊烽哨岩洞",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"海岸烽哨洞",description:"舊海防烽哨利用天然岩洞擴建的儲備點，現只剩繩索架、炭槽與少量廢棄器材。",links:[{to:"L-TB-ROPEGRASS",hours:1.4}],zone:"dungeon",archetype:"fortress_basement",space_class:"standard",encounter_tags:["cave","dungeon","ruins","water"],safety_score:54,safety_label:"警戒",risk:16,gather:["I-HERB","I-MUSHROOM"],hunt:[],fish:[],resource_profile:{forage:["I-HERB","I-MUSHROOM"],mining:[],woodcut:[],hunt:[],fish:[]},explore:[["烽火炭槽",30],["繩索架",25],["舊瞭望孔",20],["海風裂縫",15],["封閉軍械槽",10]]},
 {id:"D-TB-SALTVAULT",name:"潮鹽舊藏窖",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"地下鹽藏窖",description:"玄礁潮坪後方停用的鹽藏窖，海水滲入後形成潮濕側室，偶有水生小型魔物與盜取者活動。",links:[{to:"L-TB-BLACKREEF",hours:1.2}],zone:"dungeon",archetype:"artificial_cellar",space_class:"standard",allow_aquatic:true,encounter_tags:["cave","dungeon","ruins","water"],safety_score:55,safety_label:"警戒",risk:16,gather:["I-HERB","I-MUSHROOM"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-HERB","I-MUSHROOM"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["鹽槽",30],["滲潮石壁",25],["舊秤臺",20],["小型水道",15],["封閉藏室",10]]}

];

for(const cfg of VILLAGES)applyProsperityDetail(cfg);
for(const cfg of VILLAGES)upsertLocation(town(cfg));
for(const cfg of AREAS)upsertLocation(wild(cfg));
enrichStarterEconomyLocations();

function upsertMapRow(key,row){
 DB[key]=Array.isArray(DB[key])?DB[key]:[];
 const i=DB[key].findIndex(x=>x?.id===row.id);
 if(i>=0)DB[key][i]=row;else DB[key].push(row);
}
function syncStarterMapHierarchy(){
 for(const cfg of VILLAGES){
  const clusterAreas=AREAS.filter(x=>x.cluster_id===cfg.id),wildIds=clusterAreas.filter(x=>(x.kind||"wild")==="wild").map(x=>x.id),dungeonIds=clusterAreas.filter(x=>x.kind==="dungeon").map(x=>x.id);
  const polityName=polity(cfg.polity_id)?.name||cfg.polity_id;
  upsertMapRow("province_region_maps",{
   id:cfg.province_id,layer:"province_region",name:cfg.name+"周邊區",display_name:polityName+"・"+cfg.name+"周邊區",
   administrative_type:"地方新手行政區",parent_realm_map_id:"RMAP-"+cfg.polity_id,political_entity_id:cfg.polity_id,world_region_id:cfg.region_id,
   world_tier:"F",map_status:"playable_current",capital_location_id:cfg.id,peer_city_ids:[],subordinate_settlement_ids:[],
   wild_location_ids:wildIds,dungeon_location_ids:dungeonIds,all_settlement_ids:[cfg.id],
   economy:[...cfg.economy.drivers],major_routes:["新手村—周邊採集路","地方對外商路"],recurring_risks:[...cfg.economy.constraints],
   identity:cfg.description,economy_profile:deep(cfg.economy),starter_region:true
  });
  upsertMapRow("settlement_region_maps",{
   id:cfg.settlement_map_id,name:cfg.name+"區域",parent_province_region_id:cfg.province_id,center_location_id:cfg.id,
   world_tier:"F",map_status:"playable_current",location_ids:[cfg.id,...wildIds,...dungeonIds],
   role:"新手聚落與其3張F級野外、3座E級地下城",economy_profile:deep(cfg.economy),starter_region:true
  });
  const realm=(DB.realm_region_maps||[]).find(x=>x?.id==="RMAP-"+cfg.polity_id);
  if(realm){
   realm.province_region_ids=Array.isArray(realm.province_region_ids)?realm.province_region_ids:[];
   if(!realm.province_region_ids.includes(cfg.province_id))realm.province_region_ids.push(cfg.province_id);
  }
  for(const lid of [cfg.id,...wildIds,...dungeonIds]){
   const l=location(lid);if(!l)continue;
   l.province_region_id=cfg.province_id;l.settlement_region_id=cfg.settlement_map_id;l.realm_region_map_id="RMAP-"+cfg.polity_id;l.local_economy=deep(cfg.economy);
  }
 }
}
syncStarterMapHierarchy();

/* 五個外地新手村以長途商路／船路連回現有可遊玩核心，並保留雙向旅行。 */
for(const cfg of VILLAGES){
 addLink(cfg.id,"L-SELENBURG",cfg.route_hours);
 addLink("L-SELENBURG",cfg.id,cfg.route_hours);
}

/* 讓地圖整合索引能立即識別新增地點，不等待下一次資料庫離線重建。 */
DB.content_link_index=DB.content_link_index||{};
DB.content_link_index.location_content=DB.content_link_index.location_content||{};
for(const l of [...VILLAGES.map(x=>location(x.id)),...AREAS.map(x=>location(x.id))].filter(Boolean)){
 DB.content_link_index.location_content[l.id]={
  facility_ids:deep(l.facilities||[]),gather_item_ids:deep(l.gather||[]),fish_item_ids:deep(l.fish||[]),
  encounter_monster_ids:[],companion_species_ids:[],organization_ids:[],pantheon_ids:[]
 };
}

const PROFILES=[
 {location_id:"L-WILLOW",base:11,race_ids:["R-HUM","R-HALFELF","R-HFL","R-ANCIENT"],origin_ids:["O-FARM","O-HUNTER","O-TAVERN","O-SOLDIERCHILD","O-MERC","O-SURVIVOR"],class_ids:["C-WAR","C-RNG","C-ROG"],origin_categories:["平民與鄉野","軍事與傭兵"]},
 {location_id:"L-START-DAWNGRAIN",base:10,race_ids:["R-HUM","R-CELESTIAL","R-HALFELF","R-PHOENIX"],origin_ids:["O-MONASTERY","O-ACOLYTE","O-CLERICAPP","O-PALADIN-NOVICE","O-PENITENT","O-FARM"],class_ids:["C-MONK","C-MAG","C-WAR"],origin_categories:["信仰與魔法","貴族與騎士"]},
 {location_id:"L-START-MOSSMOON",base:10,race_ids:["R-ELF","R-HIGHELF","R-HALFELF"],origin_ids:["O-HUNTER","O-RANGERAPP","O-DRUIDCHILD","O-ELFRAISED","O-SAGEAPP"],class_ids:["C-RNG","C-MAG","C-MONK"],origin_categories:["信仰與魔法","平民與鄉野"]},
 {location_id:"L-START-IRONPINE",base:10,race_ids:["R-DWF","R-GNOME","R-HALFORC"],origin_ids:["O-SMITH","O-HIGHLAND","O-SOLDIERCHILD","O-VETERAN","O-MONSTERHUNTER"],class_ids:["C-WAR","C-MONK","C-MAG"],origin_categories:["平民與鄉野","軍事與傭兵"]},
 {location_id:"L-START-WINDSPRING",base:10,race_ids:["R-ORC","R-HALFORC","R-HFL"],origin_ids:["O-NOMAD","O-SCOUT","O-MERC","O-HUNTER","O-SURVIVOR"],class_ids:["C-RNG","C-WAR","C-ROG"],origin_categories:["平民與鄉野","軍事與傭兵"]},
 {location_id:"L-START-TIDEBORN",base:10,race_ids:["R-HUM","R-HFL","R-HALFELF","R-ORC"],origin_ids:["O-FISHER","O-PIRATECHILD","O-MERCHANT","O-CIRCUS","O-BARDAPP"],class_ids:["C-EAST","C-ROG","C-RNG"],origin_categories:["平民與鄉野"]}
];

function profileScore(p,ctx={}){
 let score=Number(p.base||10);
 const r=race(ctx.raceId),o=origin(ctx.originId),c=combatClass(ctx.classId);
 if(p.race_ids.includes(ctx.raceId))score+=8;
 if(p.origin_ids.includes(ctx.originId))score+=7;
 if(p.class_ids.includes(ctx.classId))score+=5;
 if(o&&p.origin_categories.includes(o.category))score+=1.5;
 if(r?.id==="R-ELF"&&p.location_id==="L-START-MOSSMOON")score+=2;
 if(r?.id==="R-DWF"&&p.location_id==="L-START-IRONPINE")score+=2;
 if(c?.id==="C-EAST"&&p.location_id==="L-START-TIDEBORN")score+=3;
 return Math.max(1,score);
}
function weightedPick(rows){
 let total=rows.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;
 for(const row of rows){roll-=row.weight;if(roll<=0)return row}
 return rows.at(-1);
}
function assign(ctx={}){
 const rows=PROFILES.map(p=>({profile:p,weight:profileScore(p,ctx)}));
 const picked=weightedPick(rows);
 return {
  location_id:picked?.profile?.location_id||"L-WILLOW",
  weight:picked?.weight||0,
  revision:REV,
  basis:{raceId:ctx.raceId||null,originId:ctx.originId||null,classId:ctx.classId||null}
 };
}
function audit(){
 const issues=[],starterIds=PROFILES.map(x=>x.location_id),external=VILLAGES.map(x=>x.id);
 if(new Set(starterIds).size!==6)issues.push("新手村清單必須為6個唯一地點");
 if(VILLAGES.length!==5)issues.push("阿斯戴爾外新手村必須為5個");
 const externalPolities=VILLAGES.map(x=>x.polity_id);
 if(externalPolities.some(id=>id==="POL-001"))issues.push("5個新增新手村不可位於阿斯戴爾王國");
 if(new Set(externalPolities).size!==5)issues.push("5個新增新手村必須分布於5個不同政治體");
 for(const id of starterIds){
  const l=location(id);
  if(!l)issues.push("新手村缺失："+id);
  else{
   if(l.kind!=="town"||l.tier!=="F")issues.push("新手村層級／類型錯誤："+id);
   if(!(l.facilities||[]).includes("guild"))issues.push("新手村缺少公會："+id);
   if(!(l.facilities||[]).includes("church"))issues.push("新手村缺少教會復活點："+id);
  }
 }
 const willowMap=(DB.settlement_region_maps||[]).find(x=>x.id==="SMAP-WILLOW"),willowRows=(willowMap?.location_ids||[]).map(location).filter(Boolean);
 const willowCounts={town:willowRows.filter(x=>x.kind==="town").length,wild:willowRows.filter(x=>x.kind==="wild").length,dungeon:willowRows.filter(x=>x.kind==="dungeon").length};
 for(const cfg of VILLAGES){
  if(!polity(cfg.polity_id))issues.push("新手村政治體不存在："+cfg.polity_id);
  const rows=[location(cfg.id),...AREAS.filter(x=>x.cluster_id===cfg.id).map(x=>location(x.id))].filter(Boolean);
  const counts={town:rows.filter(x=>x.kind==="town").length,wild:rows.filter(x=>x.kind==="wild").length,dungeon:rows.filter(x=>x.kind==="dungeon").length};
  for(const kind of ["town","wild","dungeon"])if(counts[kind]!==willowCounts[kind])issues.push(`新手區${cfg.name}${kind}數量${counts[kind]}，應與柳橋${willowCounts[kind]}相同`);
  if(rows.filter(x=>x.kind==="wild").some(x=>x.tier!=="F"))issues.push("新手區野外應維持F級："+cfg.id);
  if(rows.filter(x=>x.kind==="dungeon").some(x=>x.tier!=="E"))issues.push("新手區地下城應維持E級："+cfg.id);
  const province=(DB.province_region_maps||[]).find(x=>x.id===cfg.province_id),smap=(DB.settlement_region_maps||[]).find(x=>x.id===cfg.settlement_map_id);
  if(!province)issues.push("新手區行省地圖缺失："+cfg.id);
  if(!smap)issues.push("新手區聚落地圖缺失："+cfg.id);
  if(smap&&(smap.location_ids||[]).length!==willowRows.length)issues.push("新手區地圖總節點數未對齊柳橋："+cfg.id);
  const eco=cfg.economy||{};
  if(!(Number(eco.prosperity_score)>=0&&Number(eco.prosperity_score)<=100))issues.push("新手村繁榮度異常："+cfg.id);
  for(const k of ["market_budget_mult","stock_mult","liquidity_mult","market_price_mult"])if(!(Number(eco[k])>0))issues.push("新手村經濟倍率異常："+cfg.id+":"+k);
  const detail=eco.prosperity_detail;
  if(!detail)issues.push("新手村繁榮細節缺失："+cfg.id);
  else{
   for(const k of ["capacity_mult","regen_hours_mult"])if(!(Number(detail.resource?.[k])>0))issues.push("新手村資源繁榮倍率異常："+cfg.id+":"+k);
   if(!(Number(detail.dungeon?.respawn_hours_mult)>0))issues.push("新手村地下城重生倍率異常："+cfg.id);
   if(!(Number(detail.market?.restock_cycle_hours)>0))issues.push("新手村補貨週期異常："+cfg.id);
   if(rows.filter(x=>x.kind==="wild").some(x=>!x.resource_economy))issues.push("新手區野外缺少繁榮資源設定："+cfg.id);
   if(rows.filter(x=>x.kind==="dungeon").some(x=>!x.dungeon_economy))issues.push("新手區地下城缺少繁榮活動設定："+cfg.id);
  }
 }
 const addedIds=new Set([...external,...AREAS.map(x=>x.id)]);
 for(const id of addedIds){
  const l=location(id);if(!l)continue;
  for(const edge of l.links||[])if(!location(edge.to))issues.push("道路引用缺失："+id+"->"+edge.to);
 }
 if(PROFILES.some(x=>!location(x.location_id)))issues.push("出生分配候選引用不存在");
 return {
  revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
  stats:{starter_villages:starterIds.length,external_villages:VILLAGES.length,surrounding_areas:AREAS.length,external_polities:new Set(externalPolities).size,willow_baseline:willowCounts}
 };
}

DB.meta=DB.meta||{};
DB.meta.starter_settlement_revision=REV;
DB.starter_settlement_system={
 version:REV,release:RELEASE,
 willow_baseline:{town:1,wild:3,dungeon:3,total:7},
 prosperity_profiles:Object.fromEntries(VILLAGES.map(x=>[x.id,deep(x.economy)])),
 starter_location_ids:PROFILES.map(x=>x.location_id),
 external_village_ids:VILLAGES.map(x=>x.id),
 assignment_inputs:["種族","出身","戰鬥職業"],
 distribution_rule:"柳橋鎮＋5個非阿斯戴爾新手村共同構成出生池；相符條件提高權重但不硬鎖出生地。",
 world_rule:"五個新增村落分布於不同非阿斯戴爾政治體；政治體選擇在版本內容中固定，避免同版本刷新造成正史漂移。",
 surrounding_rule:"每個新增新手區對齊柳橋鎮區域：1個F級城鎮＋3張F級野外＋3座E級地下城，並以長途路線接回既有可遊玩核心。",
 economy_rule:"繁榮度0–100實際影響市場每日資金、商品庫存、本地流動性與整體價格微幅修正；地方輸出／輸入仍受區域經濟模型約束。",
 prosperity_detail_rule:"繁榮度同時接入世界循環：周邊野外資源容量／恢復速度與地下城敵對活動重生速度依地方產業、基礎設施與巡查能力細分；地圖數量與F/E層級保持柳橋基準不變。",
 save_compatible:true,initial_audit:null
};

const api=Object.freeze({version:REV,starter_ids:PROFILES.map(x=>x.location_id),external_village_ids:VILLAGES.map(x=>x.id),assign,score:profileScore,audit});
globalThis.QUNLU_STARTER_SETTLEMENTS=api;
globalThis.runStarterSettlementsAudit=audit;
DB.starter_settlement_system.initial_audit=audit();
CORE?.registerModule?.("src/starter-settlements-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();