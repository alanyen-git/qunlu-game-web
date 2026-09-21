/* 群陸旅誌：凡雷克帝國完整區域深化 CURRENT-1.98.0
 * VANREK-DEPTH-1.0
 * POL-002 / REG-02：帝冠、舊王冠領、總督制、七大區域、城鎮、野外、地下城、怪物、NPC與帝國地方循環。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.98.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.98.0";
const REV="VANREK-DEPTH-1.0";
const POLITY_ID="POL-002",REGION_ID="REG-02",CULTURE_ID="CUL-002",REALM_ID="RMAP-POL-002";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const tierRank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(key){DB[key]=Array.isArray(DB[key])?DB[key]:[];return DB[key]}
function upsert(key,value,idKey="id"){const a=arr(key),i=a.findIndex(x=>x?.[idKey]===value[idKey]);if(i>=0)a[i]=value;else a.push(value);return value}
function row(key,id,idKey="id"){return (DB[key]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,hours){const from=loc(a);if(!from||!loc(b))return;from.links=Array.isArray(from.links)?from.links:[];const old=from.links.find(x=>x?.to===b);if(old)old.hours=hours;else from.links.push({to:b,hours})}
function twoWay(a,b,hours){addLink(a,b,hours);addLink(b,a,hours)}
function economy(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){
 return {prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]};
}
function town(x){
 return {id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:"凡雷克帝國",
  description:x.description,facilities:[...(x.facilities||[])],links:[],safety_score:x.safety??88,safety_label:x.safetyLabel||"安穩",
  risk:Math.max(2,100-(x.safety??88)),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  history_scope:"凡雷克帝國／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,
  local_authority:clone(x.authority),local_economy:clone(x.economy),vanrek_zone_id:x.zoneId};
}
function field(x){
 const ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{};
 const ep=clone(ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,
  allow_demons:false,allow_undead:!!x.allowUndead,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"open",
  preferred_monster_ids:[...(x.preferred||[])]});
 return {id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"凡雷克帝國",description:x.description,links:[],
  risk:x.risk??18,safety_score:x.safety??Math.max(20,100-(x.risk??18)),safety_label:x.safetyLabel||((x.risk??18)<=15?"安穩":(x.risk??18)<=25?"普通":(x.risk??18)<=35?"警戒":"危險"),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,vanrek_zone_id:x.zoneId,tags:[...(x.tags||[])],
  gather:[...(x.gather||[])],mining:[...(x.mining||[])],woodcut:[...(x.woodcut||[])],fish:[...(x.fish||[])],hunt:[...(x.hunt||[])],explore:[...(x.explore||[])],
  encounter_profile:ep,resource_capacity:clone(x.resourceCapacity||{forage:14,hunt:8,ore:6}),resource_regen_hours:x.regen??48,hunt_requires_battle:true};
}
function dungeon(x){return field({...x,kind:"dungeon",zoneClass:"dungeon",space:x.space||"standard"})}

const ZONES=[
 {id:"VRK-Z-01",name:"帝都皇冠區",tier:"B",province:"PROV-VRK-01",smap:"SMAP-VRK-01",seat:"L-VRK-HESAR",role:"皇帝、帝國冠議會、中央法院、貢賦與皇室近衛中樞"},
 {id:"VRK-Z-02",name:"赫薩爾河心區",tier:"C",province:"PROV-VRK-02",smap:"SMAP-VRK-02",seat:"L-VRK-RIVERGATE",role:"河運、橋稅、倉儲、磨坊與帝都糧運核心"},
 {id:"VRK-Z-03",name:"北境黑松丘陵",tier:"C",province:"PROV-VRK-03",smap:"SMAP-VRK-03",seat:"L-VRK-BLACKPINE",role:"林產、獵場、北向山路與舊邊堡帶"},
 {id:"VRK-Z-04",name:"東門軍鎮帶",tier:"B",province:"PROV-VRK-04",smap:"SMAP-VRK-04",seat:"L-VRK-EASTMARCH",role:"東門隘、軍團補給、邊境關稅與鐵旗邊原方向防務"},
 {id:"VRK-Z-05",name:"南部金麥平原",tier:"C",province:"PROV-VRK-05",smap:"SMAP-VRK-05",seat:"L-VRK-GOLDWHEAT",role:"帝國主要糧倉、畜牧、軍糧契約與地方舊法鄉邑"},
 {id:"VRK-Z-06",name:"西脊舊王領",tier:"C",province:"PROV-VRK-06",smap:"SMAP-VRK-06",seat:"L-VRK-WESTCROWN",role:"被帝冠保留的舊王冠法統、採石、山路與古堡群"},
 {id:"VRK-Z-07",name:"赤槍修院帶",tier:"C",province:"PROV-VRK-07",smap:"SMAP-VRK-07",seat:"L-VRK-REDSPEAR",role:"赤槍教會、戰策修院、軍官教育、傷兵療養與南向驛路"}
];

const TOWNS=[
 {id:"L-VRK-HESAR",name:"赫薩爾帝都",zoneId:"VRK-Z-01",zone:"帝都皇冠區",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"B",size:"帝都／超大型城",safety:96,
  role:"凡雷克帝國首都、皇宮、帝國冠議會與中央行政所在地",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic","mageguild"],
  authority:{title:"凡雷克皇帝／帝國宰相府",tier:"AUTH-7"},economy:economy(91,"極繁榮",["帝國行政人口","跨區貢賦","軍團採購","高密度工坊與市場"],["高階軍需受許可限制","人口與糧運成本高"],1.11,1.22,1.34,1.30),
  description:"建於赫薩爾河中游高岸的帝都。皇宮、冠議會、中央法院、帝國檔案院與大型市場並存；帝國權力集中於此，但各舊王領與總督區的地方舊法仍受到有限承認。"},
 {id:"L-VRK-CROWNGATE",name:"皇冠門城",zoneId:"VRK-Z-01",zone:"帝都皇冠區",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"C",size:"帝都外環城",safety:93,
  role:"帝都西門、驛站、稅關與工匠衛星城",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"皇冠門城督",tier:"AUTH-4"},
  economy:economy(82,"繁榮",["帝都外溢需求","驛運","金屬與皮革工坊"],["關稅與房價偏高","軍需訂單有配額"],1.06,1.16,1.20,1.18),description:"帝都外環最大門城，旅人、貨車與軍團補給多在此完成檢查、換車與分流。"},
 {id:"L-VRK-RIVERGATE",name:"河門城",zoneId:"VRK-Z-02",zone:"赫薩爾河心區",province:"PROV-VRK-02",smap:"SMAP-VRK-02",tier:"C",size:"大型河港城",safety:91,
  role:"河運、橋關、糧倉與帝都下游集散",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic"],authority:{title:"河門總督署",tier:"AUTH-4"},
  economy:economy(84,"繁榮",["河運","糧倉","磨坊","木材與鹽貨轉運"],["洪水季影響碼頭","大宗交易受倉儲容量限制"],1.03,1.22,1.24,1.24),description:"橫跨赫薩爾河兩岸的橋港城，帝都的大宗糧食、木料與軍糧契約多在此結算。"},
 {id:"L-VRK-STONEBRIDGE",name:"石橋鎮",zoneId:"VRK-Z-02",zone:"赫薩爾河心區",province:"PROV-VRK-02",smap:"SMAP-VRK-02",tier:"D",size:"河谷市鎮",safety:90,
  role:"渡橋、磨坊與農產集散",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"石橋鎮裁判官",tier:"AUTH-3"},
  economy:economy(68,"穩定",["磨坊","穀物","渡橋","陶器"],["春汛時交通受限","高階商品稀少"],.98,1.08,1.05,1.05),description:"以古石橋和水車磨坊聞名的河谷市鎮，地方契約仍沿用舊王領時期的部分河權慣例。"},
 {id:"L-VRK-BLACKPINE",name:"黑松堡",zoneId:"VRK-Z-03",zone:"北境黑松丘陵",province:"PROV-VRK-03",smap:"SMAP-VRK-03",tier:"C",size:"林地堡城",safety:89,
  role:"北境林產、獵場管理與山路守備",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"北境總督／黑松堡守",tier:"AUTH-4"},
  economy:economy(70,"穩定",["硬木","樹脂","狩獵","山路護運"],["冬雪封路","採伐與獵場有配額"],1.00,1.08,1.10,1.06),description:"黑松丘陵最大的堡城，林務官與巡獵隊共同管理砍伐、獵場和北向山路。"},
 {id:"L-VRK-EASTMARCH",name:"東門要塞",zoneId:"VRK-Z-04",zone:"東門軍鎮帶",province:"PROV-VRK-04",smap:"SMAP-VRK-04",tier:"B",size:"大型軍鎮／國境要塞",safety:94,
  role:"帝國東境主關、軍團前線司令部與東北商道稅關",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"東境大元帥代理／要塞總督",tier:"AUTH-5"},
  economy:economy(79,"繁榮",["軍團採購","商隊稅關","馬匹與修具","邊境倉儲"],["戰備期民用庫存下降","高階武備受軍令管制"],1.08,1.15,1.30,1.16),description:"扼守東門隘的要塞城市。軍團、商隊、邊民與外交使節交錯，真正的B級軍備只存在於受管制軍區。"},
 {id:"L-VRK-GOLDWHEAT",name:"金穗城",zoneId:"VRK-Z-05",zone:"南部金麥平原",province:"PROV-VRK-05",smap:"SMAP-VRK-05",tier:"C",size:"大型農商城",safety:92,
  role:"帝國糧倉、軍糧契約與南部鄉邑行政中心",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"南部總督／糧賦監",tier:"AUTH-4"},
  economy:economy(81,"繁榮",["穀物","羊毛","啤酒","軍糧契約"],["歉收年受價格管制","農忙季人力短缺"],.96,1.24,1.22,1.20),description:"南部平原的糧賦中心。大糧倉、牲畜市場與軍糧契約行集中於城外環，地方村社保留古老水渠與收穫慣例。"},
 {id:"L-VRK-WESTCROWN",name:"維爾曼城",zoneId:"VRK-Z-06",zone:"西脊舊王領",province:"PROV-VRK-06",smap:"SMAP-VRK-06",tier:"C",size:"舊王城／山麓城市",safety:90,
  role:"西脊舊王冠領首府與帝國西側山路節點",facilities:["inn","general","guild","blacksmith","tailor","clinic","church"],authority:{title:"維爾曼舊王冠領主／帝國監察官",tier:"AUTH-5"},
  economy:economy(73,"興盛",["石材","鐵器","山路轉運","舊王領莊園"],["帝國法與舊法偶有衝突","山路運力有限"],1.02,1.09,1.13,1.10),description:"曾為獨立王冠所在地，納入凡雷克後保留部分繼承、莊園與地方司法慣例，帝國則掌握軍事、關稅與對外權。"},
 {id:"L-VRK-REDSPEAR",name:"赤槍城",zoneId:"VRK-Z-07",zone:"赤槍修院帶",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"C",size:"修院城／軍學城",safety:94,
  role:"赤槍教會、戰策修院、軍官教育與傷兵療養中心",facilities:["inn","general","guild","blacksmith","alchemy","clinic","church"],authority:{title:"修院帶帝國監督官／教會議席",tier:"AUTH-4"},
  economy:economy(76,"繁榮",["軍官教育","醫療","修院農莊","兵器維修"],["宗教資產與帝國稅權需協商","戰時傷兵增加"],1.03,1.12,1.16,1.12),description:"圍繞赤槍教會與戰策修院形成的軍學城市。兩個機構與帝國軍旅長期合作，但保持各自的宗教與學術內規。"},
 {id:"L-VRK-SOUTHROAD",name:"南驛鎮",zoneId:"VRK-Z-07",zone:"赤槍修院帶",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"D",size:"驛路鎮",safety:88,
  role:"修院、農區與南向道路補給",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"南驛驛政官",tier:"AUTH-3"},
  economy:economy(61,"穩定",["驛馬","乾糧","皮革","旅棧"],["需求受軍隊與學期波動","倉儲規模有限"],1.00,1.04,1.05,1.04),description:"修院帶南側的長途驛鎮，旅人、軍官學員與農產車隊在此換馬與補給。"}
];
for(const x of TOWNS)upsert("locations",town(x));

const FIELDS=[
 {id:"L-VRK-CROWNFIELDS",name:"帝都外環牧地",zoneId:"VRK-Z-01",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"E",size:"廣闊",risk:10,gather:["VRK-MAT-001"],hunt:["VRK-MAT-006"],description:"帝都外環的公共牧地與菜圃，巡邏頻繁，主要威脅是野犬、偷獵與小型野獸。"},
 {id:"L-VRK-OLDROAD",name:"舊帝冠大道",zoneId:"VRK-Z-01",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"D",size:"長帶狀",risk:17,gather:["VRK-MAT-002"],explore:["舊界碑","廢驛站"],description:"比現行皇家大道更早的石鋪道路，部分路段沉入土中，仍散布舊驛站和界碑。"},
 {id:"L-VRK-RIVERBANK",name:"赫薩爾河岸",zoneId:"VRK-Z-02",province:"PROV-VRK-02",smap:"SMAP-VRK-02",tier:"E",size:"廣闊",risk:14,aquatic:true,gather:["VRK-MAT-003"],fish:["VRK-MAT-005"],description:"河門城上下游的河岸、蘆灘與小碼頭，採集和捕撈受洪水季與輪休規則限制。"},
 {id:"L-VRK-MILLMEADOW",name:"水磨草甸",zoneId:"VRK-Z-02",province:"PROV-VRK-02",smap:"SMAP-VRK-02",tier:"D",size:"中型",risk:18,gather:["VRK-MAT-001","VRK-MAT-004"],hunt:["VRK-MAT-006"],description:"水渠、磨坊與牧草地交錯的河谷腹地，暴雨後常有野獸沿支流接近。"},
 {id:"L-VRK-BLACKPINEWOOD",name:"黑松林",zoneId:"VRK-Z-03",province:"PROV-VRK-03",smap:"SMAP-VRK-03",tier:"D",size:"大型",risk:27,woodcut:["VRK-MAT-007"],gather:["VRK-MAT-008"],hunt:["VRK-MAT-009"],regen:60,description:"帝國北部最重要的硬木與樹脂來源之一，採伐分區輪替，林深處仍有大型獸類。"},
 {id:"L-VRK-NORTHRIDGE",name:"北脊獵道",zoneId:"VRK-Z-03",province:"PROV-VRK-03",smap:"SMAP-VRK-03",tier:"C",size:"山地長帶",risk:34,mining:["VRK-MAT-010"],hunt:["VRK-MAT-009"],description:"黑松丘陵北緣的舊獵道與石脊，冬季低溫和落石比一般魔物更危險。"},
 {id:"L-VRK-EASTDRYLAND",name:"東門乾草帶",zoneId:"VRK-Z-04",province:"PROV-VRK-04",smap:"SMAP-VRK-04",tier:"D",size:"大型",risk:26,gather:["VRK-MAT-011"],hunt:["VRK-MAT-012"],description:"東門隘外側的乾草原與商路緩衝帶，帝國巡騎會定期清除伏擊點。"},
 {id:"L-VRK-LEGIONGROUND",name:"軍團演訓原",zoneId:"VRK-Z-04",province:"PROV-VRK-04",smap:"SMAP-VRK-04",tier:"C",size:"大型",risk:31,gather:["VRK-MAT-011"],explore:["舊壕溝","廢棄營盤"],description:"現役演訓區外圍與歷代舊營盤交錯，部分區段僅在無演訓時對冒險者開放。"},
 {id:"L-VRK-GOLDPLAIN",name:"金麥平原",zoneId:"VRK-Z-05",province:"PROV-VRK-05",smap:"SMAP-VRK-05",tier:"E",size:"超大型",risk:12,gather:["VRK-MAT-013"],hunt:["VRK-MAT-006"],regen:36,description:"帝國主要穀物產地，低威脅但資源不是無限；收穫期與休耕期會改變可採集內容。"},
 {id:"L-VRK-SHEPHERDHILLS",name:"牧羊丘",zoneId:"VRK-Z-05",province:"PROV-VRK-05",smap:"SMAP-VRK-05",tier:"D",size:"大型",risk:20,gather:["VRK-MAT-004"],hunt:["VRK-MAT-009"],description:"農區邊緣的低丘和牧場，大型掠食獸偶爾在冬末進入羊群活動範圍。"},
 {id:"L-VRK-WESTQUARRY",name:"西脊採石場",zoneId:"VRK-Z-06",province:"PROV-VRK-06",smap:"SMAP-VRK-06",tier:"D",size:"大型",risk:23,mining:["VRK-MAT-010","VRK-MAT-014"],description:"舊王領的露天採石場與廢棄切石面，採掘受領主與帝國礦務雙重規則約束。"},
 {id:"L-VRK-OLDKINGROAD",name:"舊王道丘陵",zoneId:"VRK-Z-06",province:"PROV-VRK-06",smap:"SMAP-VRK-06",tier:"C",size:"大型",risk:31,gather:["VRK-MAT-002"],explore:["舊王碑","倒塌烽塔"],description:"連接數座舊王領堡壘的山麓道路，廢烽塔和王領界碑仍是地方認同的一部分。"},
 {id:"L-VRK-ABBEYFIELDS",name:"修院田園",zoneId:"VRK-Z-07",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"E",size:"大型",risk:11,gather:["VRK-MAT-015"],description:"修院農莊、藥圃與傷兵療養地外圍，教會與修院共同規定採集量和安靜區。"},
 {id:"L-VRK-SOUTHMOOR",name:"南驛荒丘",zoneId:"VRK-Z-07",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"D",size:"大型",risk:24,gather:["VRK-MAT-015"],hunt:["VRK-MAT-012"],description:"南驛鎮外的乾燥荒丘與舊軍路，常有小型盜匪、野獸與迷路商隊事件。"}
];
for(const x of FIELDS)upsert("locations",field(x));

const DUNGEONS=[
 {id:"D-VRK-OLDSEWER",name:"帝都舊排水層",zoneId:"VRK-Z-01",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"D",size:"大型地下設施",risk:30,allowUndead:false,description:"帝都歷次擴建留下的舊排水層，部分區段封閉後成為野獸、走私者與失修機械的藏身處。"},
 {id:"D-VRK-CROWNTOMB",name:"沉冠王墓深層",zoneId:"VRK-Z-01",province:"PROV-VRK-01",smap:"SMAP-VRK-01",tier:"B",size:"受控大型王墓",risk:58,allowUndead:true,allowMagical:true,description:"早於凡雷克帝國統一的古王墓群深層，需皇室檔案與高階冒險資格才能進入；B級威脅不會自然外溢到帝都市街。"},
 {id:"D-VRK-RIVERCRYPT",name:"河門沉庫",zoneId:"VRK-Z-02",province:"PROV-VRK-02",smap:"SMAP-VRK-02",tier:"D",size:"水淹倉庫群",risk:32,aquatic:true,description:"舊河港倉庫因河道改變而半淹，內部有失落貨物、甲獸與走私暗道。"},
 {id:"D-VRK-PINEFORT",name:"黑松舊堡",zoneId:"VRK-Z-03",province:"PROV-VRK-03",smap:"SMAP-VRK-03",tier:"C",size:"山林廢堡",risk:39,description:"北境早期防線留下的石堡，地下糧窖與軍械室已被林獸和流亡者占據。"},
 {id:"D-VRK-EASTBUNKER",name:"東門舊軍堡",zoneId:"VRK-Z-04",province:"PROV-VRK-04",smap:"SMAP-VRK-04",tier:"C",size:"軍事地下堡",risk:43,description:"前代東境防線的地下軍堡，現役軍團封鎖主通道，只開放清理與測繪任務指定區段。"},
 {id:"D-VRK-ARSENAL",name:"帝國封存軍械庫",zoneId:"VRK-Z-04",province:"PROV-VRK-04",smap:"SMAP-VRK-04",tier:"B",size:"受控軍械深層",risk:61,allowMagical:true,description:"保存舊軍團重型構裝與戰時封印武備的深層軍械庫，進入需要軍令、組織資格與B級隊伍前置。"},
 {id:"D-VRK-GRANARY",name:"舊地下糧倉",zoneId:"VRK-Z-05",province:"PROV-VRK-05",smap:"SMAP-VRK-05",tier:"D",size:"地下倉窖",risk:29,description:"過去歉收與戰時修建的地下糧倉，部分封閉層有大型甲蟲、鼠群與坍塌風險。"},
 {id:"D-VRK-WESTCROWN",name:"維爾曼舊王堡",zoneId:"VRK-Z-06",province:"PROV-VRK-06",smap:"SMAP-VRK-06",tier:"C",size:"古堡地下區",risk:41,allowUndead:true,description:"舊王冠時代的城堡地下區，文書庫、祭室與防禦機關仍保留地方王權痕跡。"},
 {id:"D-VRK-REDSPEARCAT",name:"赤槍地下墓廊",zoneId:"VRK-Z-07",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"C",size:"修院墓廊",risk:37,allowUndead:true,description:"修院歷代軍牧與護教者的墓廊；大部分區段受管理，異常只在封閉舊層處理。"},
 {id:"D-VRK-TACTICVAULT",name:"戰策修院舊演武庫",zoneId:"VRK-Z-07",province:"PROV-VRK-07",smap:"SMAP-VRK-07",tier:"C",size:"地下訓練設施",risk:40,description:"早期修院用來保存戰圖、木偶構裝與演武機關的地下設施，現僅部分區段作實地考核。"}
];
for(const x of DUNGEONS)upsert("locations",dungeon(x));

const ROUTES=[
 ["L-VRK-HESAR","L-VRK-CROWNGATE",2],["L-VRK-HESAR","L-VRK-RIVERGATE",6],["L-VRK-HESAR","L-VRK-GOLDWHEAT",9],["L-VRK-HESAR","L-VRK-REDSPEAR",8],
 ["L-VRK-CROWNGATE","L-VRK-WESTCROWN",9],["L-VRK-RIVERGATE","L-VRK-STONEBRIDGE",3],["L-VRK-RIVERGATE","L-VRK-EASTMARCH",11],["L-VRK-STONEBRIDGE","L-VRK-BLACKPINE",8],
 ["L-VRK-GOLDWHEAT","L-VRK-SOUTHROAD",5],["L-VRK-REDSPEAR","L-VRK-SOUTHROAD",3],["L-VRK-EASTMARCH","L-VRK-EASTDRYLAND",2],["L-VRK-BLACKPINE","L-VRK-BLACKPINEWOOD",2],
 ["L-VRK-WESTCROWN","L-VRK-WESTQUARRY",2],["L-VRK-GOLDWHEAT","L-VRK-GOLDPLAIN",2],["L-VRK-RIVERGATE","L-VRK-RIVERBANK",2],["L-VRK-REDSPEAR","L-VRK-ABBEYFIELDS",1],
 ["L-VRK-HESAR","L-VRK-CROWNFIELDS",2],["L-VRK-CROWNGATE","L-VRK-OLDROAD",2],["L-VRK-RIVERGATE","L-VRK-MILLMEADOW",2],["L-VRK-BLACKPINE","L-VRK-NORTHRIDGE",4],
 ["L-VRK-EASTMARCH","L-VRK-LEGIONGROUND",2],["L-VRK-GOLDWHEAT","L-VRK-SHEPHERDHILLS",3],["L-VRK-WESTCROWN","L-VRK-OLDKINGROAD",3],["L-VRK-SOUTHROAD","L-VRK-SOUTHMOOR",2],
 ["L-VRK-HESAR","D-VRK-OLDSEWER",1],["L-VRK-HESAR","D-VRK-CROWNTOMB",5],["L-VRK-RIVERBANK","D-VRK-RIVERCRYPT",2],["L-VRK-BLACKPINEWOOD","D-VRK-PINEFORT",4],
 ["L-VRK-EASTMARCH","D-VRK-EASTBUNKER",3],["L-VRK-LEGIONGROUND","D-VRK-ARSENAL",5],["L-VRK-GOLDPLAIN","D-VRK-GRANARY",2],["L-VRK-OLDKINGROAD","D-VRK-WESTCROWN",3],
 ["L-VRK-REDSPEAR","D-VRK-REDSPEARCAT",2],["L-VRK-REDSPEAR","D-VRK-TACTICVAULT",2]
];
for(const r of ROUTES)twoWay(r[0],r[1],r[2]);
if(loc("L-BLT-GATE"))twoWay("L-VRK-BLACKPINE","L-BLT-GATE",11);

const ITEMS=[
 ["VRK-MAT-001","河谷止血草","F",.08,8,"赫薩爾河谷常見藥草，需與其他材料配製後才有穩定藥效。"],
 ["VRK-MAT-002","舊道燧石","F",.18,6,"舊道路基常見的硬質燧石。"],
 ["VRK-MAT-003","河蘆纖維","F",.12,7,"赫薩爾河岸蘆草加工後的纖維。"],
 ["VRK-MAT-004","牧地苦艾","E",.08,12,"河谷與牧丘常見的苦味草藥。"],
 ["VRK-MAT-005","赫薩爾銀鱗","E",.16,15,"河魚與小型水獸的銀灰鱗片。"],
 ["VRK-MAT-006","灰兔皮","F",.25,8,"平原灰兔與小型獵物的皮料。"],
 ["VRK-MAT-007","黑松硬木","E",1.2,18,"北境黑松林的硬木，採伐受輪替與配額限制。"],
 ["VRK-MAT-008","黑松樹脂","E",.2,14,"黑松樹脂，可作防水、黏合與一般工藝輔料。"],
 ["VRK-MAT-009","丘陵獸皮","D",.8,28,"北部丘陵中型獸類的耐磨皮料。"],
 ["VRK-MAT-010","西脊鐵石","D",1.1,31,"含鐵量穩定的西脊礦石與採石副產物。"],
 ["VRK-MAT-011","東境韌草","E",.12,11,"乾草帶常見的韌性草纖維。"],
 ["VRK-MAT-012","荒丘角質","D",.35,26,"乾草帶與荒丘角獸的角質材料。"],
 ["VRK-MAT-013","金麥穗","F",.15,5,"南部平原常見穀物，主要作食材與釀造原料。"],
 ["VRK-MAT-014","灰紋石","D",1.3,24,"西脊常見的堅硬建築石材。"],
 ["VRK-MAT-015","修院白芷","E",.08,16,"修院藥圃與附近荒丘栽培的藥草。"],
 ["VRK-MAT-016","帝國構裝芯片","B",.55,126,"舊軍團重型構裝的封存核心碎片，只能由受控B級軍械任務取得。"]
].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],value:x[4],description:x[5]}));
const GATHER_ELIGIBLE=new Set([...FIELDS,...DUNGEONS].flatMap(x=>x.gather||[]));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID,wild_gather_eligible:GATHER_ELIGIBLE.has(x.id)});

function mon(x){
 const drops=[...(x.drops||[])];
 return {id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:x.category||"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],
  hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,
  xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,
  ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},
  loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:1}))};
}
const MONSTERS=[
 {id:"MON-VRK-001",name:"平原灰兔",tier:"F",habitat:["L-VRK-CROWNFIELDS","L-VRK-GOLDPLAIN"],hp:25,atk:8,def:4,acc:68,damage:[2,5],scale:"small",drops:["VRK-MAT-006"],near:true,description:"帝都外環與南部平原常見的小型獵物。"},
 {id:"MON-VRK-002",name:"田野狐",tier:"F",habitat:["L-VRK-CROWNFIELDS","L-VRK-GOLDPLAIN","L-VRK-SHEPHERDHILLS"],hp:29,atk:9,def:4,acc:72,init:13,damage:[2,6],scale:"small",drops:["VRK-MAT-006"],near:true,description:"以鼠兔和田間小獸為食，通常避開人群。"},
 {id:"MON-VRK-003",name:"河灘蘆蟹",tier:"F",habitat:["L-VRK-RIVERBANK"],hp:27,atk:8,def:6,acc:64,damage:[2,5],scale:"small",tags:["aquatic"],drops:["VRK-MAT-005"],near:true,description:"河灘常見的小型甲殼生物。"},
 {id:"MON-VRK-004",name:"牧丘野犬",tier:"E",habitat:["L-VRK-MILLMEADOW","L-VRK-SHEPHERDHILLS","L-VRK-SOUTHMOOR"],hp:49,atk:16,def:7,acc:74,damage:[5,10],scale:"small",drops:[],near:true,description:"成群活動於牧丘和荒地，對落單牲畜較具威脅。"},
 {id:"MON-VRK-005",name:"黑松灰狼",tier:"E",habitat:["L-VRK-BLACKPINEWOOD"],hp:58,atk:18,def:8,acc:76,damage:[6,11],drops:["VRK-MAT-009"],description:"北境黑松林常見狼群，主要活動於林深處。"},
 {id:"MON-VRK-006",name:"河谷水蜥",tier:"E",habitat:["L-VRK-RIVERBANK","D-VRK-RIVERCRYPT"],hp:52,atk:16,def:10,acc:70,damage:[5,10],element:"水",tags:["aquatic","wildlife"],drops:["VRK-MAT-005"],description:"河岸和半淹倉庫常見的中型水蜥。"},
 {id:"MON-VRK-007",name:"糧倉硬殼蟲",tier:"E",habitat:["D-VRK-GRANARY"],hp:55,atk:15,def:13,acc:66,damage:[5,9],scale:"small",tags:["invertebrate"],drops:[],description:"以腐穀、木屑為食的大型甲蟲。"},
 {id:"MON-VRK-008",name:"舊道岩鼠",tier:"E",habitat:["L-VRK-OLDROAD","D-VRK-OLDSEWER"],hp:43,atk:14,def:6,acc:72,damage:[4,9],scale:"small",drops:[],near:true,description:"廢驛站與舊排水層常見的岩鼠。"},
 {id:"MON-VRK-009",name:"北脊野豬",tier:"D",habitat:["L-VRK-BLACKPINEWOOD","L-VRK-NORTHRIDGE"],hp:96,atk:27,def:16,acc:70,damage:[9,18],drops:["VRK-MAT-009"],description:"北境山林的大型野豬，受驚後具有相當衝擊力。"},
 {id:"MON-VRK-010",name:"鐵背山熊",tier:"D",habitat:["L-VRK-NORTHRIDGE","D-VRK-PINEFORT"],hp:118,atk:29,def:18,acc:69,damage:[10,20],scale:"large",drops:["VRK-MAT-009"],description:"活動於北脊岩地和廢堡周邊的大型熊類。"},
 {id:"MON-VRK-011",name:"東境角獸",tier:"D",habitat:["L-VRK-EASTDRYLAND","L-VRK-LEGIONGROUND"],hp:104,atk:28,def:17,acc:71,damage:[10,19],drops:["VRK-MAT-012"],description:"乾草帶常見的大型角獸，遷移期會跨越商路。"},
 {id:"MON-VRK-012",name:"河門甲獸",tier:"D",habitat:["L-VRK-RIVERBANK","D-VRK-RIVERCRYPT"],hp:112,atk:27,def:22,acc:68,damage:[9,18],element:"水",tags:["aquatic"],drops:["VRK-MAT-005"],description:"半水棲甲獸，會在洪水後進入廢棄倉區。"},
 {id:"MON-VRK-013",name:"舊堡灰蝠",tier:"D",habitat:["D-VRK-PINEFORT","D-VRK-WESTCROWN"],hp:83,atk:24,def:9,acc:79,init:16,damage:[8,16],scale:"small",drops:[],description:"棲息古堡高處與地下空腔的大型蝠類。"},
 {id:"MON-VRK-014",name:"墓廊硬甲蟲",tier:"D",habitat:["D-VRK-REDSPEARCAT","D-VRK-CROWNTOMB"],hp:91,atk:23,def:21,acc:68,damage:[8,16],tags:["invertebrate"],drops:[],description:"偏好乾燥墓室與石灰沉積層的大型甲蟲。"},
 {id:"MON-VRK-015",name:"舊軍團巡衛",tier:"D",habitat:["D-VRK-EASTBUNKER","D-VRK-TACTICVAULT"],hp:105,atk:28,def:23,acc:73,damage:[10,19],scale:"medium",tags:["construct"],drops:["VRK-MAT-010"],description:"舊軍堡仍在運作的簡易機械巡衛。"},
 {id:"MON-VRK-016",name:"西脊石蜥",tier:"D",habitat:["L-VRK-WESTQUARRY","L-VRK-OLDKINGROAD"],hp:94,atk:25,def:18,acc:73,damage:[9,18],element:"地",drops:["VRK-MAT-014"],description:"採石坡與舊王道常見的厚鱗石蜥。"},
 {id:"MON-VRK-017",name:"赫薩爾河獸",tier:"C",habitat:["D-VRK-RIVERCRYPT"],hp:151,atk:35,def:23,acc:76,damage:[12,25],element:"水",scale:"large",tags:["aquatic","wildlife"],drops:["VRK-MAT-005"],description:"棲息深水舊港層的大型河獸，不會自然出現在帝都市街。"},
 {id:"MON-VRK-018",name:"北境巨狼",tier:"C",habitat:["L-VRK-NORTHRIDGE","D-VRK-PINEFORT"],hp:142,atk:36,def:18,acc:81,damage:[13,25],scale:"large",drops:["VRK-MAT-009"],description:"極少數體型異常的大型狼，多在冬季獵物短缺時接近舊堡。"},
 {id:"MON-VRK-019",name:"東門重甲構裝",tier:"C",habitat:["D-VRK-EASTBUNKER","L-VRK-LEGIONGROUND"],hp:176,atk:37,def:31,acc:74,damage:[13,27],scale:"large",tags:["construct"],drops:["VRK-MAT-010"],description:"前代軍團用於要塞訓練與守門的重甲構裝。"},
 {id:"MON-VRK-020",name:"舊王堡守衛像",tier:"C",habitat:["D-VRK-WESTCROWN"],hp:169,atk:36,def:29,acc:75,damage:[13,26],element:"地",tags:["construct"],drops:["VRK-MAT-014"],description:"舊王領留下的石製守衛構裝，只在古堡深層啟動。"},
 {id:"MON-VRK-021",name:"墓廊失序守衛",tier:"C",habitat:["D-VRK-REDSPEARCAT","D-VRK-CROWNTOMB"],hp:158,atk:35,def:24,acc:76,damage:[12,26],tags:["undead"],drops:[],description:"少數墓廊封閉區中的失序守衛，教會將其視為需要處理的異常而非正常葬儀。"},
 {id:"MON-VRK-022",name:"戰策演武構裝",tier:"C",habitat:["D-VRK-TACTICVAULT"],hp:164,atk:38,def:25,acc:80,damage:[14,27],tags:["construct"],drops:["VRK-MAT-010"],description:"戰策修院早期用於隊形和破陣訓練的演武構裝。"},
 {id:"MON-VRK-023",name:"沉冠主守衛",tier:"B",role:"首領候選",habitat:["D-VRK-CROWNTOMB"],hp:338,atk:55,def:41,mdef:37,acc:82,damage:[20,40],scale:"large",tags:["construct"],drops:["VRK-MAT-016"],description:"古王墓深層主守衛，只能在受控B級探索中遭遇。"},
 {id:"MON-VRK-024",name:"封存軍械戰傀",tier:"B",role:"菁英",habitat:["D-VRK-ARSENAL"],hp:312,atk:53,def:44,mdef:34,acc:80,damage:[19,38],scale:"large",tags:["construct"],drops:["VRK-MAT-016"],description:"帝國封存軍械庫中的重型戰傀，平時由軍方封鎖，不會進入一般野外遭遇表。"}
];
for(const m of MONSTERS)upsert("monsters",mon(m));

const NPCS=[
 {id:"NPC-VRK-001",name:"阿爾德里克四世",role:"凡雷克皇帝",tier:"B",location_id:"L-VRK-HESAR",knowledge_scope:"帝國法統、舊王冠領、總督任命、軍團與外交",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-CROWN"],services:["帝國主線","高階政治引介"],description:"現任皇帝，主要課題是讓帝冠權威與地方舊法在同一行政體系內可持續運作。"},
 {id:"NPC-VRK-002",name:"瑪蒂爾達・雷恩",role:"帝國宰相",tier:"B",location_id:"L-VRK-HESAR",knowledge_scope:"冠議會、法令、總督考核與跨區行政",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-CROWN"],services:["帝國行政委託","法令查詢"],description:"負責把皇帝詔令轉成各總督區能執行的行政命令。"},
 {id:"NPC-VRK-003",name:"葛雷戈・瓦倫",role:"帝國大元帥",tier:"B",location_id:"L-VRK-EASTMARCH",knowledge_scope:"軍團、邊防、動員、軍糧與要塞體系",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-LEGION"],services:["軍團委託","邊防情報"],description:"主張軍團戰力建立在道路、糧秣、輪調與紀律，不依賴單一英雄。"},
 {id:"NPC-VRK-004",name:"伊蓮娜・索爾",role:"大法官",tier:"B",location_id:"L-VRK-HESAR",knowledge_scope:"帝國法、地方舊法、上訴與司法衝突",combat_tier_ceiling:"D",organization_ids:["ORG-VRK-JUSTICE"],services:["司法委託","法規查詢"],description:"專門處理帝國法令與舊王領法之間的邊界。"},
 {id:"NPC-VRK-005",name:"托曼・赫斯特",role:"貢賦總監",tier:"C",location_id:"L-VRK-RIVERGATE",knowledge_scope:"糧賦、倉儲、道路、稅關與軍需採購",combat_tier_ceiling:"D",organization_ids:["ORG-VRK-TRIBUTE"],services:["商路委託","糧賦情報"],description:"把貢賦視為倉庫、車隊和帳冊的系統，而不是紙面數字。"},
 {id:"NPC-VRK-006",name:"蕾雅・凡德",role:"皇冠門城督",tier:"C",location_id:"L-VRK-CROWNGATE",knowledge_scope:"帝都外環、驛運、工坊與入城檢查",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-ROAD"],services:["入城行政","驛路委託"],description:"管理帝都最繁忙的陸路門戶。"},
 {id:"NPC-VRK-007",name:"賽門・奧德",role:"河門總督",tier:"C",location_id:"L-VRK-RIVERGATE",knowledge_scope:"河運、橋關、糧倉與洪水應變",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-TRIBUTE"],services:["河運委託","倉儲情報"],description:"每年春汛前都會先查堤岸和糧倉，再談增加稅收。"},
 {id:"NPC-VRK-008",name:"瑟芮・莫恩",role:"石橋裁判官",tier:"D",location_id:"L-VRK-STONEBRIDGE",knowledge_scope:"地方契約、河權、水磨與村社爭議",combat_tier_ceiling:"E",organization_ids:["ORG-VRK-JUSTICE"],services:["地方調解","契約資訊"],description:"熟悉舊王領時代延續至今的水權和橋稅慣例。"},
 {id:"NPC-VRK-009",name:"哈根・布萊克",role:"黑松堡守",tier:"C",location_id:"L-VRK-BLACKPINE",knowledge_scope:"北境巡獵、林務、山路與冬季封路",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-WARDEN"],services:["巡林委託","狩獵情報"],description:"要求伐木、狩獵與護路隊共享同一套季節地圖。"},
 {id:"NPC-VRK-010",name:"米菈・芬",role:"北境林務官",tier:"D",location_id:"L-VRK-BLACKPINE",knowledge_scope:"採伐配額、樹脂、野生獸群與林地恢復",combat_tier_ceiling:"D",organization_ids:["ORG-VRK-WARDEN"],services:["採集配額","林地委託"],description:"堅持黑松林是長期資產而不是無限木材箱。"},
 {id:"NPC-VRK-011",name:"凱爾・德朗",role:"東門要塞總督",tier:"B",location_id:"L-VRK-EASTMARCH",knowledge_scope:"東門隘、軍鎮、關稅、鐵旗邊原與軍事封鎖區",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-LEGION"],services:["邊境任務","軍區通行"],description:"統籌要塞軍政，但民間商務仍交由稅關和城市官署處理。"},
 {id:"NPC-VRK-012",name:"奧斯汀・培爾",role:"軍械監",tier:"C",location_id:"L-VRK-EASTMARCH",knowledge_scope:"軍械庫、構裝、修具與軍需庫存",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-LEGION"],services:["軍械鑑定","封存庫委託"],description:"任何B級軍械取用都要求軍令、庫存紀錄和歸還流程。"},
 {id:"NPC-VRK-013",name:"海倫・葛林",role:"南部糧賦監",tier:"C",location_id:"L-VRK-GOLDWHEAT",knowledge_scope:"穀物、軍糧、歉收預案與農村水利",combat_tier_ceiling:"D",organization_ids:["ORG-VRK-TRIBUTE"],services:["糧食委託","市場情報"],description:"在豐收年也維持戰備與歉收儲備，不把市場存量視為無限。"},
 {id:"NPC-VRK-014",name:"柯爾・班納",role:"金穗冒險者公會館主",tier:"C",location_id:"L-VRK-GOLDWHEAT",knowledge_scope:"南部委託、地下糧倉、農地怪物與收購",combat_tier_ceiling:"C",organization_ids:[],services:["冒險者委託","收購櫃檯"],description:"熟悉農忙季對冒險任務供需的影響。"},
 {id:"NPC-VRK-015",name:"羅德里克・維爾曼",role:"維爾曼舊王冠領主",tier:"B",location_id:"L-VRK-WESTCROWN",knowledge_scope:"舊王冠法、山路、莊園與帝冠協議",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-OLDLAW"],services:["舊王領劇情","地方法引介"],description:"保留舊王冠家系的禮序與部分地方司法，但外交與軍權受帝國法統約束。"},
 {id:"NPC-VRK-016",name:"艾妲・柯石",role:"西脊礦務監察官",tier:"D",location_id:"L-VRK-WESTCROWN",knowledge_scope:"採石、鐵礦、山路與舊王領礦權",combat_tier_ceiling:"D",organization_ids:["ORG-VRK-OLDLAW"],services:["礦務委託","石材鑑定"],description:"經常處理帝國礦務條例和舊領採石權的衝突。"},
 {id:"NPC-VRK-017",name:"奧菲莉亞・雷德",role:"赤槍教會軍牧長",tier:"B",location_id:"L-VRK-REDSPEAR",knowledge_scope:"赤槍教會、軍牧、傷兵療養與帝國軍合作",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-REDSPEAR"],services:["教會委託","醫療引介"],description:"維持教會宗教自主，同時長期參與帝國軍的軍牧與救護制度。"},
 {id:"NPC-VRK-018",name:"提伯・莫里斯",role:"戰策修院院長",tier:"B",location_id:"L-VRK-REDSPEAR",knowledge_scope:"軍官教育、戰史、兵棋與學術自治",combat_tier_ceiling:"B",organization_ids:["ORG-VRK-TACTIC"],services:["戰術課程","軍官劇情"],description:"修院向凡雷克軍官提供教育，但拒絕把學術研究直接變成軍令附庸。"},
 {id:"NPC-VRK-019",name:"艾琳・索菲",role:"修院醫師",tier:"D",location_id:"L-VRK-REDSPEAR",knowledge_scope:"傷兵照護、基礎藥草與康復紀錄",combat_tier_ceiling:"F",organization_ids:["ORG-VRK-REDSPEAR"],services:["治療","藥材委託"],description:"關注感染、休養和補給，不把所有傷勢都交給高階魔法處理。"},
 {id:"NPC-VRK-020",name:"馬克・多恩",role:"南驛驛政官",tier:"D",location_id:"L-VRK-SOUTHROAD",knowledge_scope:"驛馬、道路、旅人與修院南路",combat_tier_ceiling:"E",organization_ids:["ORG-VRK-ROAD"],services:["旅路情報","驛站委託"],description:"掌握南向車流與驛馬輪替。"},
 {id:"NPC-VRK-021",name:"諾菈・提斯",role:"帝國檔案官",tier:"C",location_id:"L-VRK-HESAR",knowledge_scope:"詔令、總督檔案、舊王領條約與可公開史料",combat_tier_ceiling:"F",organization_ids:["ORG-VRK-CROWN"],services:["檔案查詢","歷史引介"],description:"清楚區分皇室宣稱、地方版本與已存檔條約文本。"},
 {id:"NPC-VRK-022",name:"芬恩・羅克",role:"皇家大道巡查長",tier:"C",location_id:"L-VRK-CROWNGATE",knowledge_scope:"道路、橋梁、驛站、商隊失蹤與跨區物流",combat_tier_ceiling:"C",organization_ids:["ORG-VRK-ROAD"],services:["護路委託","道路情報"],description:"帝國最實際的統一工具在他眼中不是徽章，而是能通車的道路。"}
];
for(const n of NPCS){if(tierRank(n.combat_tier_ceiling)>tierRank("C"))n.combat_tier_ceiling="C";upsert("regional_npc_archetypes",{...n,region_id:REGION_ID,polity_id:POLITY_ID})}

const ORGS=[
 {id:"ORG-VRK-CROWN",name:"帝國冠議會",kind:"government",tier:"B",base_location_id:"L-VRK-HESAR",description:"皇帝、宰相、主要舊王冠與中央高官處理帝國法令、總督任命與跨區衝突的最高政務機構。"},
 {id:"ORG-VRK-LEGION",name:"凡雷克軍團總署",kind:"military",tier:"B",base_location_id:"L-VRK-EASTMARCH",description:"統籌軍團編制、東境要塞、戰備、軍糧與封存軍械。"},
 {id:"ORG-VRK-JUSTICE",name:"帝國高等法院",kind:"government",tier:"B",base_location_id:"L-VRK-HESAR",description:"處理帝國法、地方舊法、總督區爭議與跨領上訴。"},
 {id:"ORG-VRK-TRIBUTE",name:"貢賦與倉運總署",kind:"civic",tier:"C",base_location_id:"L-VRK-RIVERGATE",description:"管理糧賦、倉儲、河運、軍糧契約與跨區調度。"},
 {id:"ORG-VRK-ROAD",name:"皇家大道與驛政署",kind:"civic",tier:"C",base_location_id:"L-VRK-CROWNGATE",description:"維護道路、橋梁、驛站、里程碑與主要商路安全。"},
 {id:"ORG-VRK-WARDEN",name:"北境林務巡守隊",kind:"ranger",tier:"C",base_location_id:"L-VRK-BLACKPINE",description:"管理黑松林採伐、獵場、山路與冬季救援。"},
 {id:"ORG-VRK-OLDLAW",name:"西脊舊法議院",kind:"civic",tier:"C",base_location_id:"L-VRK-WESTCROWN",description:"協調維爾曼舊王領法、莊園權、採石權與帝國法令的適用邊界。"},
 {id:"ORG-VRK-REDSPEAR",name:"赤槍軍牧會",kind:"religious",tier:"C",base_location_id:"L-VRK-REDSPEAR",description:"承接赤槍教會與帝國軍之間的軍牧、療養、祭儀與救護合作。"},
 {id:"ORG-VRK-TACTIC",name:"戰策修院議事會",kind:"research",tier:"C",base_location_id:"L-VRK-REDSPEAR",description:"維護軍官教育、戰史、兵棋與學術自治，與帝國軍合作但不直接隸屬軍團總署。"}
];
for(const o of ORGS)upsert("world_organizations",{...o,region_id:REGION_ID,political_entity_id:POLITY_ID});
const facilityByOrg={
 "ORG-VRK-CROWN":"guild","ORG-VRK-LEGION":"guild","ORG-VRK-JUSTICE":"guild","ORG-VRK-TRIBUTE":"general","ORG-VRK-ROAD":"guild",
 "ORG-VRK-WARDEN":"guild","ORG-VRK-OLDLAW":"guild","ORG-VRK-REDSPEAR":"church","ORG-VRK-TACTIC":"guild"
};
const lightOrgIds=new Set(["ORG-VRK-JUSTICE","ORG-VRK-WARDEN","ORG-VRK-REDSPEAR"]);
const bonusByOrgKind={government:{statusResist:4},military:{defense_pct:3},civic:{carryCapacity:4},ranger:{perception:4},religious:{healingPower:4},research:{perception:4}};
for(const o0 of ORGS){
 const o=row("world_organizations",o0.id);if(!o)continue;
 o.scope=o.tier==="B"?"kingdom":"local_regional";o.alignment=lightOrgIds.has(o.id)?"light":"neutral";o.category=o.kind;
 o.primary_facility=facilityByOrg[o.id]||"guild";o.min_join_level=Math.max(1,Number(o.min_join_level)||1);o.join_reputation=Number(o.join_reputation)||0;
 o.visibility="public";o.legal_status="legal";o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;
 o.contact_location_ids=[...new Set([...(o.contact_location_ids||[]),o.base_location_id].filter(Boolean))];
 o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"凡雷克職能會員訓練",effects:{...(bonusByOrgKind[o.kind]||{perception:3})}};
 o.history=Array.isArray(o.history)&&o.history.length?o.history:["隨凡雷克帝國整合舊王冠、總督區與跨區道路後，逐步由臨時職能固定為可追責的帝國或地方機構。"];
 o.history_summary=o.history_summary||o.history.join(" ");
 o.current_state=o.current_state||"目前以維持跨區治理與地方實務為主，權限受帝國法、地方舊法、預算與實際承載量共同約束。";
 o.signature=o.signature||({government:"法令、司法與跨區責任",military:"軍團輪調、補給與邊防",civic:"貢賦、道路與公共運輸",ranger:"林務、巡獵與山路救援",religious:"軍牧、療養與祭儀協作",research:"戰史、兵棋與軍官教育"}[o.kind]||"帝國地方職能");
 o.distinctive_features=Array.isArray(o.distinctive_features)&&o.distinctive_features.length?o.distinctive_features:[o.signature,"依道路、帳冊、法令與地方權限運作","不以國家B級直接等同個人成員B級戰力"];
 o.institutional_culture=o.institutional_culture||"重視文書、職責、補給、法定權限與可追查的行政紀錄。";
 o.strategic_tension=o.strategic_tension||"帝冠整合效率、地方舊法與民生承載量之間長期需要協調。";
}

upsert("regional_content_profiles",{id:"RCP-VRK-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"凡雷克帝國",recommended_tier:"F～B",
 identity:"由帝都、舊王冠領、總督區、軍鎮、糧倉與宗教軍學機構共同維持的B級帝國。道路、軍團、貢賦與法律整合不同地區，但地方舊法仍具有實際效力。",
 terrain:"赫薩爾河谷、北部黑松丘陵、東境乾草帶、南部農業平原與西脊山麓",
 common_exports:["穀物","硬木","石材","軍需品","皮革","河運服務"],common_imports:["高階魔法材料","部分奢侈品","精密術具","海產"],
 food_staples:["黑麥麵包","燉羊肉","河魚湯","麥酒","根菜燉鍋"],recurring_risks:["洪水","冬季封路","地方舊法與帝國法衝突","軍需擠壓民用市場","邊境警戒升級"]});
upsert("regional_economy_profiles",{id:"ECO-VRK-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["穀物","木材","石材","兵器修造","皮革","陸河運"],imports:["高階術具","稀有藥材","海產","高階魔法素材"],
 notes:"帝國市場龐大但不是無限供應。軍團採購、歉收、洪水、道路封鎖與地方倉儲都會影響庫存與價格；高階軍械受許可與軍令限制。"});

const HOOKS=[
 {id:"HOOK-VRK-01",title:"皇冠門失蹤車隊",premise:"一支已登記入境的貨車隊沒有抵達帝都，巡查長要求沿驛站、舊道與橋關逐段核對。",tier:"D"},
 {id:"HOOK-VRK-02",title:"春汛沉庫",premise:"河門沉庫水位異常上升，總督先封閉碼頭，再派隊確認河獸、坍塌與走私暗道。",tier:"D"},
 {id:"HOOK-VRK-03",title:"黑松採伐越界",premise:"合法採伐區出現超額砍伐，林務官需要查伐木隊、偽造木印與野獸遷移。",tier:"D"},
 {id:"HOOK-VRK-04",title:"東門舊軍堡警報",premise:"封閉軍堡的舊警報重新啟動，需要軍方與冒險者共同確認是否為構裝故障。",tier:"C"},
 {id:"HOOK-VRK-05",title:"糧倉蟲災",premise:"南部地下糧倉出現硬殼蟲群，若不處理將影響軍糧契約與市價。",tier:"D"},
 {id:"HOOK-VRK-06",title:"舊王法訴訟",premise:"維爾曼兩座莊園對採石權各持帝國法與舊王法文書，必須查檔案、界碑與實際採掘範圍。",tier:"C"},
 {id:"HOOK-VRK-07",title:"修院演武失控",premise:"舊演武庫中的訓練構裝未依停機程序復位，修院要求先保全學員再調查控制機關。",tier:"C"},
 {id:"HOOK-VRK-08",title:"軍械庫封印偏移",premise:"東門封存軍械庫的監測值異常，僅具軍令與B級前置的隊伍可進入深層。",tier:"B"},
 {id:"HOOK-VRK-09",title:"沉冠墓印",premise:"帝國檔案院發現古王墓封印與某份舊王冠條約記載不一致，調查可能牽動地方法統。",tier:"B"},
 {id:"HOOK-VRK-10",title:"貢賦失衡",premise:"河心區帳冊顯示糧食入庫與實際庫存不符，需要查收成、運損、價格與官署責任，而不是直接假定貪腐。",tier:"C"}
];
for(const h of HOOKS)upsert("regional_adventure_hooks",{...h,region_id:REGION_ID,polity_id:POLITY_ID});
const LIFE=[
 {id:"LIFE-VRK-01",name:"春汛檢堤",text:"河門與石橋沿線優先維修堤岸、橋墩與糧倉；部分河港短期減少一般貨運。"},
 {id:"LIFE-VRK-02",name:"夏季軍團輪調",text:"東門軍鎮進行例行輪調，驛站、馬匹、乾糧與修具需求上升。"},
 {id:"LIFE-VRK-03",name:"秋收貢賦期",text:"南部平原進入收穫與入倉高峰，市場糧價通常下降，但車隊與倉儲需求增加。"},
 {id:"LIFE-VRK-04",name:"黑松封養季",text:"部分林區暫停採伐與狩獵，野外資源恢復速度提高，木材市場庫存則下降。"},
 {id:"LIFE-VRK-05",name:"舊王法庭日",text:"維爾曼舊王領集中處理莊園、採石和繼承爭議，帝國監察官會旁聽跨法域案件。"},
 {id:"LIFE-VRK-06",name:"軍官學期",text:"赤槍城與戰策修院迎來新一期軍官學員，住宿、紙墨、訓練裝備和醫療需求上升。"},
 {id:"LIFE-VRK-07",name:"帝國冠議會季會",text:"主要總督與舊王冠代表進入帝都，行政委託、護衛與政治傳聞增加。"},
 {id:"LIFE-VRK-08",name:"冬路封閉",text:"北脊與西脊部分道路因雪和落石暫停通行，帝國會優先保障糧食、燃料與軍郵。"}
];
for(const e of LIFE)upsert("regional_life_events",{...e,region_id:REGION_ID,polity_id:POLITY_ID});

for(const zone of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===zone.id).map(x=>x.id),wilds=FIELDS.filter(x=>x.zoneId===zone.id).map(x=>x.id),dungeons=DUNGEONS.filter(x=>x.zoneId===zone.id).map(x=>x.id);
 upsert("province_region_maps",{id:zone.province,layer:"province_region",name:zone.name,display_name:"凡雷克帝國・"+zone.name,parent_realm_map_id:REALM_ID,
  political_entity_id:POLITY_ID,world_region_id:REGION_ID,world_tier:zone.tier,map_status:"playable_current",capital_location_id:zone.seat,
  all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:zone.role});
 upsert("settlement_region_maps",{id:zone.smap,name:zone.name+"區域圖",parent_province_region_id:zone.province,center_location_id:zone.seat,world_tier:zone.tier,
  map_status:"playable_current",location_ids:[...towns,...wilds,...dungeons],role:zone.role,vanrek_zone_id:zone.id});
}
let realm=row("realm_region_maps",REALM_ID);
if(!realm)realm=upsert("realm_region_maps",{id:REALM_ID,layer:"realm_region",political_entity_id:POLITY_ID,world_region_id:REGION_ID,name:"凡雷克帝國區域圖",world_tier:"B",map_status:"playable_current"});
realm.province_region_ids=ZONES.map(x=>x.province);realm.regional_centers=["赫薩爾帝都","河門城","黑松堡","東門要塞","金穗城","維爾曼城","赤槍城"];
realm.map_status="playable_current";realm.notes="凡雷克帝國沿用POL-002／REG-02既有正史，分為帝都皇冠、赫薩爾河心、北境黑松、東門軍鎮、南部金麥、西脊舊王領與赤槍修院七大區域。帝國整體B級，但一般城鎮與野外依實際風險維持F～C，B級威脅集中於受控皇室與軍械深層。";

const region=row("world_regions",REGION_ID);
if(region)Object.assign(region,{map_status:"playable_current",recommended_tier:"B",playable_tier_band:"F～B",terrain:"赫薩爾河谷、黑松丘陵、乾草邊原、金麥平原與西脊山麓",
 regional_identity:"道路、軍團與貢賦整合多個舊王冠和總督區；帝國法與地方舊法並行，普通民生區不因國家層級B而自動高階化。"});
const polity=row("political_entities",POLITY_ID);
if(polity){
 Object.assign(polity,{name:"凡雷克帝國",government_type:"帝國",capital:"赫薩爾帝都",map_status:"playable_current",world_tier:"B",
  secondary_centers:["河門城","黑松堡","東門要塞","金穗城","維爾曼城","赤槍城"],
  ruling_structure:"皇帝統御數個舊王冠領與總督區；帝國冠議會、宰相府、高等法院、軍團總署、貢賦與驛政官署維持跨區治理。地方舊王法、莊園慣例與宗教內規在不牴觸帝國軍事、外交、總稅制與重大刑律時保留效力。",
  legal_tradition:"皇室詔令、帝國成文法、地方舊王法、莊園慣例、軍團條令與受承認宗教內規並行",
  identity:"由道路、軍團、貢賦、共同帝冠與跨區法院把多個舊領地綁成一體的B級人類帝國；統一不是抹除地方制度，而是建立可上訴、可徵調、可通行的共同框架。",
  gameplay_role:"B級大陸帝國／帝都政治、軍團邊防、河運糧賦、地方舊法、舊王領與宗教軍學合作",
  economic_base:["南部糧倉","赫薩爾河運","黑松木材","西脊石材與鐵料","軍團採購","皇家大道與驛運"],
  military_structure:["常備軍團","東門要塞軍","皇室近衛","地方守備","皇家大道巡防","戰時舊王領與總督區徵調"],
  current_tensions:["帝冠集權與地方舊法","軍需採購與民用市場","總督權力與中央監察","東境邊防成本","舊王領身份","赤槍教會與戰策修院的自主"],
  internal_regions:ZONES.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier})),
  external_institution_relations:[
   {name:"赤槍教會",relation:"cooperation",note:"與帝國軍旅長期合作軍牧、療養與祭儀，但保留宗教內規。"},
   {name:"戰策修院",relation:"cooperation",note:"向凡雷克軍官提供教育與戰史研究，維持學術獨立。"}
  ],
  key_organization_ids:[...new Set([...(polity.key_organization_ids||[]),...ORGS.map(x=>x.id)])]});
}
const authority=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(authority){
 authority.office_nodes=Array.isArray(authority.office_nodes)?authority.office_nodes:[];
 const extra=[
  {id:"POL-002-D1",title:"凡雷克皇帝",authority_tier:"AUTH-7",authority_level:7,scope:"帝國主權、外交、軍事統帥、最高任命與皇室詔令",appointment:"帝室法統繼承與加冕",rights:["AR-001","AR-002","AR-003","AR-004","AR-005"],reports_to:null,notes:"皇帝是帝冠最高法統，但日常行政依賴冠議會與中央官署。"},
  {id:"POL-002-D2",title:"帝國宰相",authority_tier:"AUTH-6",authority_level:6,scope:"中央行政、詔令落地、總督考核與跨區協調",appointment:"皇帝任命、冠議會確認",rights:["AR-003","AR-005","AR-007"],reports_to:"POL-002-D1"},
  {id:"POL-002-D3",title:"帝國大元帥",authority_tier:"AUTH-6",authority_level:6,scope:"軍團、要塞、戰備與戰時徵調",appointment:"皇帝任命",rights:["AR-004","AR-005"],reports_to:"POL-002-D1"},
  {id:"POL-002-D4",title:"帝國大法官",authority_tier:"AUTH-5",authority_level:5,scope:"跨領上訴、帝國法與地方舊法衝突",appointment:"皇帝提名、冠議會確認",rights:["AR-005","AR-007"],reports_to:"POL-002-D1"},
  {id:"POL-002-D5",title:"貢賦總監",authority_tier:"AUTH-5",authority_level:5,scope:"糧賦、倉運、主要稅關與軍需調度",appointment:"宰相府提名、皇帝任命",rights:["AR-003","AR-005"],reports_to:"POL-002-D2"},
  {id:"POL-002-D6",title:"舊王冠領主",authority_tier:"AUTH-5",authority_level:5,scope:"依法保留的舊王領地方司法、莊園與禮序",appointment:"世襲並由帝冠承認",rights:["AR-003","AR-005"],reports_to:"POL-002-D1",notes:"不是獨立主權；外交、軍團與帝國總稅制受中央約束。"},
  {id:"POL-002-D7",title:"行省總督",authority_tier:"AUTH-4",authority_level:4,scope:"總督區行政、治安、地方稅務與公共工程",appointment:"皇帝或宰相府任命",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-002-D2"},
  {id:"POL-002-D8",title:"要塞總督／軍鎮司令",authority_tier:"AUTH-4",authority_level:4,scope:"國境要塞與軍鎮",appointment:"大元帥提名、皇帝任命",rights:["AR-003","AR-004"],reports_to:"POL-002-D3"},
  {id:"POL-002-D9",title:"城市城督／地方裁判官",authority_tier:"AUTH-3",authority_level:3,scope:"城市行政、治安、契約與基層司法",appointment:"總督、舊王領或中央依法任命",rights:["AR-003","AR-005"],reports_to:"POL-002-D7"},
  {id:"POL-002-D10",title:"驛政官／林務官／糧賦官",authority_tier:"AUTH-2",authority_level:2,scope:"道路、森林、糧倉等專業行政",appointment:"主管官署任命",rights:["AR-003"],reports_to:"POL-002-D9"}
 ];
 for(const n of extra){const i=authority.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)authority.office_nodes[i]=n;else authority.office_nodes.push(n)}
 authority.rival_power_centers=["皇帝與帝國冠議會","舊王冠領主","軍團總署與邊境大元帥","帝國高等法院","赤槍教會","戰策修院"];
 authority.player_interaction_summary="低階玩家主要接觸地方公會、驛政、林務、農區與河運；中階可進入總督區、舊王領與軍團委託；B級皇室王墓與封存軍械需要明確資格、軍令或政治前置。";
}

const LORE=[
 {id:"LORE-VRK-01",category:"history",title:"凡雷克帝冠的形成",text:"凡雷克約在紀元前288年前後形成可辨識的帝國體制。它不是單一建國日建立，而是舊王冠、盟約、總督區與軍事道路逐步固化為共同帝冠。"},
 {id:"LORE-VRK-02",category:"politics",title:"帝國不是單一路徑封建制",text:"皇帝、舊王冠領主、任命總督、軍團司令、中央法院與專業官署同時存在。禮序、封地與實際行政權必須分開判定。"},
 {id:"LORE-VRK-03",category:"law",title:"皇令與舊法並行",text:"帝國法處理軍事、外交、跨區稅制、重大刑律與上訴；地方舊王法仍可處理莊園、繼承、水權、採石與部分民事慣例。"},
 {id:"LORE-VRK-04",category:"economy",title:"道路與貢賦是帝國骨架",text:"皇家大道、赫薩爾河運、糧倉、驛站與軍需帳冊讓帝都能動員跨區資源；道路中斷或倉運失衡會直接影響政治與軍事能力。"},
 {id:"LORE-VRK-05",category:"military",title:"軍團依賴補給",text:"凡雷克軍團是B級國家力量，但常備軍不等於每名士兵都是B級戰士。帝國優勢來自組織、道路、輪調、軍械與大規模補給。"},
 {id:"LORE-VRK-06",category:"religion",title:"赤槍教會的合作界線",text:"赤槍教會與凡雷克軍旅長期合作軍牧、療養與祭儀，但宗教內規與神職任命並不由軍團直接控制。"},
 {id:"LORE-VRK-07",category:"education",title:"戰策修院的學術自治",text:"戰策修院向凡雷克軍官提供戰史與兵棋教育，接受帝國資助與委託，但保留課程、研究與學術評議的獨立性。"},
 {id:"LORE-VRK-08",category:"society",title:"地方身份沒有被抹除",text:"居民可以同時認同凡雷克帝國與自身舊王領、城市、修院或村社；帝國統一主要體現在道路、軍事、稅制、法院與對外法統。"},
 {id:"LORE-VRK-09",category:"adventure",title:"B級帝國不等於全圖B級",text:"帝國有能力管理B級軍械、王墓和國境危機，但普通農田、河岸、市鎮與林地仍依生態維持F到C級。"},
 {id:"LORE-VRK-10",category:"border",title:"東門隘與鐵旗邊原",text:"東門要塞是凡雷克東境的稅關與軍事節點；帝國在此維持商路與邊防，不把整個東境視為永久戰場。"}
];
for(const l of LORE)upsert("lore_records",{...l,scope_type:"polity",scope_id:POLITY_ID,verification:"recorded",era_id:"ERA-05",source_refs:[POLITY_ID,REGION_ID],tags:["凡雷克","區域深化"],common_knowledge:!["adventure"].includes(l.category)});
if(polity){polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];for(const l of LORE)if(!polity.lore_record_ids.includes(l.id))polity.lore_record_ids.push(l.id)}

DB.content_link_index=DB.content_link_index||{};DB.content_link_index.location_content=DB.content_link_index.location_content||{};
for(const l of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>loc(x.id)).filter(Boolean)){
 DB.content_link_index.location_content[l.id]={facility_ids:[...(l.facilities||[])],gather_item_ids:[...(l.gather||[])],fish_item_ids:[...(l.fish||[])],
  encounter_monster_ids:MONSTERS.filter(m=>(m.habitat||[]).includes(l.id)).map(m=>m.id),companion_species_ids:[],
  organization_ids:ORGS.filter(o=>o.base_location_id===l.id).map(o=>o.id),pantheon_ids:[]};
}
DB.content_link_index.item_sources=DB.content_link_index.item_sources||{};
for(const d of DB.items||[]){
 const s=DB.content_link_index.item_sources[d.id]=DB.content_link_index.item_sources[d.id]||{};
 for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?[...new Set(s[k])]:[];
}
for(const l of DB.locations||[])for(const id of [...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[]),...(l.fish||[]),...(l.hunt||[])]){
 const s=DB.content_link_index.item_sources[id];if(s&&!s.gather_locations.includes(l.id))s.gather_locations.push(l.id);
}
for(const m of DB.monsters||[])for(const d of m.loot_materials||[]){
 const s=DB.content_link_index.item_sources[d.id];if(s&&!s.monster_drops.includes(m.id))s.monster_drops.push(m.id);
}
if(DB.integration_registry?.counts)DB.integration_registry.counts.lore_records=(DB.lore_records||[]).length;
const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{}),verify=verifyKeys.includes("verified")?"verified":(verifyKeys.includes("recorded")?"recorded":(verifyKeys[0]||"recorded"));
for(const l of LORE){const x=row("lore_records",l.id);if(x)x.verification=verify}
if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}

DB.vanrek_empire={version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,
 playable_zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),
 monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),material_ids:ITEMS.map(x=>x.id),
 governance:{top:"凡雷克皇帝／帝國冠議會",central:"宰相府／高等法院／軍團總署／貢賦總署",regional:"舊王冠領主／行省總督／要塞總督",local:"城督／裁判官／驛政與專業官署"},
 tier_model:"帝國B級；一般可遊玩區F～C；B級內容集中於沉冠王墓、封存軍械與帝國最高政治軍事前置。",save_compatible:true};

function audit(){
 const issues=[],p=row("political_entities",POLITY_ID),r=row("world_regions",REGION_ID),rm=row("realm_region_maps",REALM_ID);
 if(!p)issues.push("凡雷克政治體缺失");else if(p.name!=="凡雷克帝國")issues.push("凡雷克政治體名稱失步");
 if(p&&p.capital!=="赫薩爾帝都")issues.push("凡雷克首都名稱失步");
 if(!r||r.map_status!=="playable_current")issues.push("REG-02未切換為可遊玩");
 if(!rm||rm.map_status!=="playable_current")issues.push("凡雷克帝國區域地圖未啟用");
 if(ZONES.length!==7)issues.push("凡雷克可遊玩區域應為7");
 if(TOWNS.length!==10)issues.push("凡雷克城鎮應為10");
 if(FIELDS.length!==14)issues.push("凡雷克野外應為14");
 if(DUNGEONS.length!==10)issues.push("凡雷克地下城應為10");
 for(const z of ZONES){const pr=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pr)issues.push("缺少區域地圖:"+z.name);if(!sm)issues.push("缺少聚落區域圖:"+z.name);const ids=sm?.location_ids||[];if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺城鎮:"+z.name);if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺野外:"+z.name);if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺地下城:"+z.name)}
 for(const id of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 if(MONSTERS.length!==24)issues.push("凡雷克怪物應為24種");
 for(const m0 of MONSTERS){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(tierRank(m.tier)>tierRank("B"))issues.push("REG-02怪物超過B級:"+m.id);if(m.near_town_eligible&&tierRank(m.tier)>tierRank("E"))issues.push("城鎮近郊怪物超階:"+m.id);if(m.loot_profile?.fallback_policy!=="none")issues.push("怪物通用掉落fallback未關閉:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落素材缺失:"+m.id+"->"+d.id)}
 if(NPCS.length!==22)issues.push("凡雷克核心NPC應為22名");
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id);if(x&&tierRank(x.combat_tier_ceiling)>tierRank("B"))issues.push("NPC戰力超過帝國上限:"+n.id)}
 for(const o of ORGS)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);for(const id of ["POL-002-D1","POL-002-D2","POL-002-D3","POL-002-D4","POL-002-D6","POL-002-D7","POL-002-D8","POL-002-D9"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(!DUNGEONS.some(x=>x.tier==="B")||!MONSTERS.some(x=>x.tier==="B"))issues.push("凡雷克缺少受控B級內容");
 if(FIELDS.every(x=>tierRank(x.tier)>=tierRank("C")))issues.push("凡雷克日常野外全部高階化");
 if(!(p?.external_institution_relations||[]).some(x=>x.name==="赤槍教會"&&x.relation==="cooperation"))issues.push("赤槍教會合作關係缺失");
 if(!(p?.external_institution_relations||[]).some(x=>x.name==="戰策修院"&&x.relation==="cooperation"))issues.push("戰策修院合作關係缺失");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length,b_tier_dungeons:DUNGEONS.filter(x=>x.tier==="B").length}};
}
DB.meta=DB.meta||{};DB.meta.vanrek_depth_revision=REV;DB.vanrek_empire.initial_audit=audit();
globalThis.runVanrekDepthAudit=audit;
globalThis.QUNLU_VANREK=Object.freeze({version:REV,audit,zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/vanrek-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();