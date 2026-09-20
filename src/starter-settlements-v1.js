/* 群陸旅誌：多政治體新手村與出生分配 CURRENT-1.93.0
 * STARTER-SETTLEMENTS-1.0
 * 在阿斯戴爾以外的5個政治體建立F級新手村與周邊低階區域；
 * 新角色依種族、出身、職業加權分配至柳橋鎮＋5個新手村之一，不改存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.93.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.93.0";
const REV="STARTER-SETTLEMENTS-1.0";
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
  realm_region_map_id:"RMAP-"+cfg.polity_id,settlement_world_tier:"F",
  starter_cluster_id:cfg.id,starter_village:true
 };
}
function wild(cfg){
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
  realm_region_map_id:"RMAP-"+cfg.polity_id,starter_cluster_id:cfg.cluster_id,
  hunt_requires_battle:true
 };
}

const VILLAGES=[
 {
  id:"L-START-DAWNGRAIN",name:"晨穗村",polity_id:"POL-004",region_id:"REG-04",culture_id:"CUL-004",region:"晨鐘聖原",
  history_scope:"晨律教國／晨鐘聖原",route_hours:32,
  facilities:["guild","general","tavern","inn","church"],
  description:"晨鐘聖原西側的農牧村，清晨鐘聲、穀倉與朝聖小路交織；公會以採集、護田、巡溪等F級工作訓練新人。",
  links:[{to:"L-DG-DEWFIELD",hours:1.1},{to:"L-DG-PRAYERBROOK",hours:1.3},{to:"L-SELENBURG",hours:32}]
 },
 {
  id:"L-START-MOSSMOON",name:"苔月村",polity_id:"POL-012",region_id:"REG-12",culture_id:"CUL-012",region:"瑟露維亞森海",
  history_scope:"瑟露維亞精靈王庭／瑟露維亞森海",route_hours:44,
  facilities:["guild","general","alchemy","tavern","inn","church"],
  description:"位於古林外緣的混居小村，以林下藥草、鹿徑與月泉為生；對精靈、半精靈與自然系旅人較為熟悉。",
  links:[{to:"L-MM-SILVERLEAF",hours:1.0},{to:"L-MM-DEERSPRING",hours:1.4},{to:"L-SELENBURG",hours:44}]
 },
 {
  id:"L-START-IRONPINE",name:"鐵松村",polity_id:"POL-013",region_id:"REG-13",culture_id:"CUL-013",region:"安威爾山地",
  history_scope:"安威爾帝國／西北山廳外緣",route_hours:48,
  facilities:["guild","general","blacksmith","tavern","inn","church"],
  description:"安威爾南側山路上的礦木村，矮人、侏儒與山民商隊常在此整補；低階委託集中於礦道巡查與山坡採集。",
  links:[{to:"L-IP-ANVILRIDGE",hours:1.2},{to:"L-IP-BLACKVEIN",hours:1.5},{to:"L-SELENBURG",hours:48}]
 },
 {
  id:"L-START-WINDSPRING",name:"風泉村",polity_id:"POL-015",region_id:"REG-15",culture_id:"CUL-015",region:"白氈草海",
  history_scope:"白氈汗國／北中部草海",route_hours:52,
  facilities:["guild","general","tavern","inn","church"],
  description:"依季節泉眼形成的定居補給村，牧民、獸族與旅隊在此交換乾糧、皮革與路況；周圍草原適合基礎追蹤與巡牧。",
  links:[{to:"L-WS-WHITEGRASS",hours:1.1},{to:"L-WS-GOOSEFORD",hours:1.6},{to:"L-SELENBURG",hours:52}]
 },
 {
  id:"L-START-TIDEBORN",name:"潮生村",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",
  history_scope:"黑潮群島／外海小島帶",route_hours:64,
  facilities:["guild","general","blacksmith","tavern","inn","church"],
  description:"黑潮群島內側航道的小型漁武村，潮汐、礁路與短程船運塑造生活；東方劍士、漁家與海上背景旅人常從這裡起步。",
  links:[{to:"L-TB-SEAPINE",hours:1.2},{to:"L-TB-BLACKREEF",hours:1.0},{to:"L-SELENBURG",hours:64}]
 }
];

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
 {id:"D-TB-TIDECAVE",name:"退潮岩窟",cluster_id:"L-START-TIDEBORN",polity_id:"POL-010",region_id:"REG-10",culture_id:"CUL-010",region:"黑潮群島",history_scope:"黑潮群島／外海小島帶",template:"D-AQUEDUCT",kind:"dungeon",tier:"E",size:"潮汐海蝕洞",description:"只有退潮時能穩定進入的淺層海蝕洞，公會立有潮時牌，深部仍禁止低階冒險者進入。",links:[{to:"L-TB-SEAPINE",hours:1.7}],zone:"dungeon",archetype:"waterway_ruin",space_class:"standard",allow_aquatic:true,encounter_tags:["cave","dungeon","water","ruins"],safety_score:51,safety_label:"警戒",risk:18,gather:["I-MUSHROOM","I-HERB"],hunt:[],fish:["I-RAWFISH"],resource_profile:{forage:["I-MUSHROOM","I-HERB"],mining:[],woodcut:[],hunt:[],fish:["I-RAWFISH"]},explore:[["潮時石標",30],["淺層潮池",25],["海蝕側洞",20],["舊繫船環",15],["封閉深洞",10]]}
];

for(const cfg of VILLAGES)upsertLocation(town(cfg));
for(const cfg of AREAS)upsertLocation(wild(cfg));

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
 for(const cfg of VILLAGES){
  if(!polity(cfg.polity_id))issues.push("新手村政治體不存在："+cfg.polity_id);
  const neighbors=AREAS.filter(x=>x.cluster_id===cfg.id);
  if(neighbors.length!==3)issues.push("新手村周邊區域應為3個："+cfg.id);
  if(neighbors.filter(x=>x.kind!=="dungeon").length<2)issues.push("新手村至少需要2個周邊野外："+cfg.id);
  if(!neighbors.some(x=>x.kind==="dungeon"&&x.tier==="E"))issues.push("新手村缺少E級入門地下區："+cfg.id);
 }
 const addedIds=new Set([...external,...AREAS.map(x=>x.id)]);
 for(const id of addedIds){
  const l=location(id);if(!l)continue;
  for(const edge of l.links||[])if(!location(edge.to))issues.push("道路引用缺失："+id+"->"+edge.to);
 }
 if(PROFILES.some(x=>!location(x.location_id)))issues.push("出生分配候選引用不存在");
 return {
  revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
  stats:{starter_villages:starterIds.length,external_villages:VILLAGES.length,surrounding_areas:AREAS.length,external_polities:new Set(externalPolities).size}
 };
}

DB.meta=DB.meta||{};
DB.meta.starter_settlement_revision=REV;
DB.starter_settlement_system={
 version:REV,release:RELEASE,
 starter_location_ids:PROFILES.map(x=>x.location_id),
 external_village_ids:VILLAGES.map(x=>x.id),
 assignment_inputs:["種族","出身","戰鬥職業"],
 distribution_rule:"柳橋鎮＋5個非阿斯戴爾新手村共同構成出生池；相符條件提高權重但不硬鎖出生地。",
 world_rule:"五個新增村落分布於不同非阿斯戴爾政治體；政治體選擇在版本內容中固定，避免同版本刷新造成正史漂移。",
 surrounding_rule:"每個新增新手村配置2個F級周邊野外＋1個E級入門地下區，並以長途路線接回既有可遊玩核心。",
 save_compatible:true,initial_audit:null
};

const api=Object.freeze({version:REV,starter_ids:PROFILES.map(x=>x.location_id),external_village_ids:VILLAGES.map(x=>x.id),assign,score:profileScore,audit});
globalThis.QUNLU_STARTER_SETTLEMENTS=api;
globalThis.runStarterSettlementsAudit=audit;
DB.starter_settlement_system.initial_audit=audit();
CORE?.registerModule?.("src/starter-settlements-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();