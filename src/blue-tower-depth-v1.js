/* 群陸旅誌：藍塔魔導王國完整區域深化 CURRENT-1.97.0
 * BLUE-TOWER-DEPTH-1.0
 * POL-011 / REG-11：塔主議會、六大區域帶、城鎮、野外、地下城、怪物、NPC與魔法社會循環。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.97.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.97.0";
const REV="BLUE-TOWER-DEPTH-1.0";
const POLITY_ID="POL-011",REGION_ID="REG-11",CULTURE_ID="CUL-011",REALM_ID="RMAP-POL-011";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const tierRank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(key){DB[key]=Array.isArray(DB[key])?DB[key]:[];return DB[key]}
function upsert(key,row,idKey="id"){const a=arr(key),i=a.findIndex(x=>x?.[idKey]===row[idKey]);if(i>=0)a[i]=row;else a.push(row);return row}
function row(key,id,idKey="id"){return (DB[key]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,hours){const from=loc(a);if(!from||!loc(b))return;from.links=Array.isArray(from.links)?from.links:[];const old=from.links.find(x=>x?.to===b);if(old)old.hours=hours;else from.links.push({to:b,hours})}
function twoWay(a,b,hours){addLink(a,b,hours);addLink(b,a,hours)}
function economy(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){
 return {prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]};
}
function town(x){
 return {
  id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:"藍塔高地",
  description:x.description,facilities:[...x.facilities],links:[],safety_score:x.safety??90,safety_label:x.safetyLabel||"安穩",
  risk:Math.max(2,100-(x.safety??90)),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  history_scope:"藍塔魔導王國／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,
  local_authority:clone(x.authority),local_economy:clone(x.economy),blue_tower_zone_id:x.zoneId
 };
}
function field(x){
 const ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{};
 const ep=clone(ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,
  allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"open",
  preferred_monster_ids:[...(x.preferred||[])]});
 return {
  id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"藍塔高地",description:x.description,links:[],
  risk:x.risk??18,safety_score:x.safety??Math.max(20,100-(x.risk??18)),safety_label:x.safetyLabel||((x.risk??18)<=15?"安穩":(x.risk??18)<=25?"普通":(x.risk??18)<=35?"警戒":"危險"),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,blue_tower_zone_id:x.zoneId,tags:[...(x.tags||[])],
  gather:[...(x.gather||[])],mining:[...(x.mining||[])],woodcut:[...(x.woodcut||[])],fish:[...(x.fish||[])],hunt:[...(x.hunt||[])],
  explore:[...(x.explore||[])],encounter_profile:ep,resource_capacity:clone(x.resourceCapacity||{forage:14,hunt:8,ore:6}),
  resource_regen_hours:x.regen??48,hunt_requires_battle:true
 };
}
function dungeon(x){return field({...x,kind:"dungeon",zoneClass:"dungeon",allowMagical:true,space:x.space||"standard"})}

const ZONES=[
 {id:"BLT-Z-01",name:"中央塔城區",tier:"B",province:"PROV-BLT-01",smap:"SMAP-BLT-01",seat:"L-BLT-CITY",role:"首都、塔主議會、奧術院與王國級術式行政核心"},
 {id:"BLT-Z-02",name:"鏡塔湖盆",tier:"C",province:"PROV-BLT-02",smap:"SMAP-BLT-02",seat:"L-BLT-MIRROR",role:"淡水、漁業、藥草、低階魔法材料與城市民生腹地"},
 {id:"BLT-Z-03",name:"西脊塔院帶",tier:"C",province:"PROV-BLT-03",smap:"SMAP-BLT-03",seat:"L-BLT-RUNE",role:"符文、礦材、構裝與西向學術塔院群"},
 {id:"BLT-Z-04",name:"北部觀星臺地",tier:"C",province:"PROV-BLT-04",smap:"SMAP-BLT-04",seat:"L-BLT-STAR",role:"天象觀測、風場研究、遠距通信與高地巡界"},
 {id:"BLT-Z-05",name:"東界季市帶",tier:"D",province:"PROV-BLT-05",smap:"SMAP-BLT-05",seat:"L-BLT-EAST",role:"與泰爾瓦隆往來的季節市場、草原物資交換與邊界緩衝"},
 {id:"BLT-Z-06",name:"藍塔隘源谷",tier:"C",province:"PROV-BLT-06",smap:"SMAP-BLT-06",seat:"L-BLT-GATE",role:"赫薩爾河源頭、南向關隘、商路稅關與國境防務"}
];

const TOWNS=[
 {id:"L-BLT-CITY",name:"藍塔城",zoneId:"BLT-Z-01",zone:"中央塔城區",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"B",size:"王都／大型學術城",safety:95,
  role:"王都、塔主議會與全國術式資格中樞",facilities:["inn","general","guild","mageguild","blacksmith","alchemy","church"],
  authority:{title:"首席塔主議政廳／塔域執政官",tier:"AUTH-6"},economy:economy(88,"繁榮",["學院與研究人口","術具與捲軸產業","跨境研究委託"],["高階物資受資格與庫存雙重限制","事故審查成本高"],1.09,1.18,1.28,1.24),
  description:"圍繞古藍塔與數座學院塔群形成的王都。真正的禁術研究被隔離在受管制區，城市大部分仍由住宅、市場、工坊、學舍與公共設施構成。"},
 {id:"L-BLT-BLUESTEPS",name:"青階鎮",zoneId:"BLT-Z-01",zone:"中央塔城區",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"C",size:"學舍與工坊衛星鎮",safety:91,
  role:"學徒住宿、抄寫、基礎術具與王都民生支援",facilities:["inn","general","mageguild","blacksmith","alchemy"],
  authority:{title:"青階鎮務官",tier:"AUTH-3"},economy:economy(76,"興盛",["學徒人口","抄寫與低階術具","王都外溢需求"],["房租昂貴","考季需求波動"],1.05,1.13,1.13,1.12),
  description:"位於王都外環的學舍與工坊聚落。大量學徒、抄寫員、修繕工與普通居民在此生活，價格會隨資格考與新學期波動。"},
 {id:"L-BLT-MIRROR",name:"鏡湖鎮",zoneId:"BLT-Z-02",zone:"鏡塔湖盆",province:"PROV-BLT-02",smap:"SMAP-BLT-02",tier:"D",size:"湖畔市場鎮",safety:90,
  role:"湖產、水務、藥草與王都糧食集散",facilities:["inn","general","guild","alchemy"],
  authority:{title:"鏡湖水務官",tier:"AUTH-3"},economy:economy(67,"穩定",["淡水與湖魚","藥草","通往王都的短程供應"],["冬季湖面封凍","不得無限制捕撈"],.98,1.08,1.03,1.04),
  description:"鏡塔湖東岸的民生鎮。居民多從事漁業、水務、藥草與運輸，對王都的重要性遠高於它在學術政治中的地位。"},
 {id:"L-BLT-RUNE",name:"符脊鎮",zoneId:"BLT-Z-03",zone:"西脊塔院帶",province:"PROV-BLT-03",smap:"SMAP-BLT-03",tier:"D",size:"礦務與工坊鎮",safety:86,
  role:"符紋石材、導晶砂、構裝零件與西脊塔院補給",facilities:["inn","general","guild","blacksmith","mageguild"],
  authority:{title:"西脊塔務監",tier:"AUTH-3"},economy:economy(70,"穩健",["有限導晶礦","構裝修繕","塔院訂單"],["礦區配額","危險坑道封鎖"],1.06,1.02,1.12,1.05),
  description:"石質山脊下方的礦務工坊鎮。礦脈不被視為無限資源，採掘量、坑道穩定與術式污染都由塔務監與礦師共同記錄。"},
 {id:"L-BLT-STAR",name:"星盤鎮",zoneId:"BLT-Z-04",zone:"北部觀星臺地",province:"PROV-BLT-04",smap:"SMAP-BLT-04",tier:"C",size:"觀測院聚落",safety:84,
  role:"天象、氣象、遠距通信與高地觀測",facilities:["inn","general","mageguild","alchemy"],
  authority:{title:"觀測院值理",tier:"AUTH-4"},economy:economy(64,"專業型",["觀測院薪餉","精密玻璃","通訊術式"],["糧食與木材依賴外運","冬季道路不穩"],1.11,.91,1.09,.92),
  description:"圍繞大型星盤與數座低矮觀測塔形成的聚落。這裡最昂貴的不是魔法，而是穩定鏡片、精密刻度與能持續供應的生活物資。"},
 {id:"L-BLT-EAST",name:"東界市",zoneId:"BLT-Z-05",zone:"東界季市帶",province:"PROV-BLT-05",smap:"SMAP-BLT-05",tier:"D",size:"邊界市鎮",safety:83,
  role:"泰爾瓦隆互市、牲畜皮革與高地術具交換",facilities:["inn","general","guild","blacksmith"],
  authority:{title:"東界關貿監",tier:"AUTH-3"},economy:economy(69,"季節繁榮",["百族互市","牲畜與皮革","法器與藥材交換"],["季市結束後流動性下降","邊境天候影響商隊"],1.02,1.08,1.07,1.12),
  description:"東界高地與草原交會處的季節市場城鎮。法師、牧商、部落商隊與一般居民在明確的秤量、檢疫與術式安全規範下交易。"},
 {id:"L-BLT-GATE",name:"隘門城",zoneId:"BLT-Z-06",zone:"藍塔隘源谷",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"C",size:"關隘城市",safety:88,
  role:"藍塔隘、南向道路、赫薩爾河源谷與邊防",facilities:["inn","general","guild","blacksmith","mageguild"],
  authority:{title:"藍塔隘守備監",tier:"AUTH-4"},economy:economy(72,"穩健",["關隘商路","守備需求","河谷轉運"],["暴雪與落石會中斷道路","軍需優先時民用庫存下降"],1.04,1.07,1.15,1.06),
  description:"控制藍塔隘與赫薩爾河上游道路的石城。防務依靠城牆、偵測術式、人工路障與巡界隊，而不是以大規模禁咒維持日常秩序。"},
 {id:"L-BLT-HEADVALE",name:"源谷村",zoneId:"BLT-Z-06",zone:"藍塔隘源谷",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"E",size:"河源農牧村",safety:89,
  role:"河源維護、高地牧養、香草與隘門城糧食補給",facilities:["inn","general"],
  authority:{title:"源谷村務代表",tier:"AUTH-1"},economy:economy(48,"樸實",["河源牧地","高地香草","隘門補給"],["耕地有限","冬季運輸成本高"],.95,.94,.82,.86),
  description:"赫薩爾河源谷中少數適合長期耕牧的村落。村民大多不是法師，但熟悉水源、山路與季節風，是隘門城不可替代的補給基礎。"}
];
for(const t of TOWNS)upsert("locations",town(t));

const FIELDS=[
 {id:"L-BLT-CIRCUIT",name:"塔城外環田野",zoneId:"BLT-Z-01",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"E",size:"城郊農地與道路",tags:["plains"],zoneClass:"town_outskirts",template:"L-LOWFIELD",safety:88,risk:10,regen:36,
  description:"王都外圍的農田、道路、學院練習場與公共蓄水池。最常見的是害獸、失控的小型練習構裝與被丟棄的低階術式材料。",
  gather:["BLT-MAT-001","I-HERB"],hunt:["I-RAWMEAT"],preferred:["MON-BLT-001","MON-BLT-003","MON-BLT-007"],explore:[["學院練習場",25],["蓄水池",20],["外環農道",25],["回收材料站",15],["塔界石",15]]},
 {id:"L-BLT-BLUECLIFF",name:"藍石崖",zoneId:"BLT-Z-01",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"D",size:"高地石崖",tags:["mountain"],zoneClass:"frontier",template:"L-HILL",safety:72,risk:21,allowMagical:true,regen:60,
  description:"王都北側的藍灰色石崖，風切強烈且散布舊觀測樁。少量導晶會在岩縫形成，但採掘受年度配額限制。",
  gather:["BLT-MAT-005"],mining:["BLT-MAT-003","BLT-MAT-004"],preferred:["MON-BLT-008","MON-BLT-010"],explore:[["風切崖道",25],["舊觀測樁",20],["晶砂岩縫",20],["巡界棚",20],["封閉採點",15]]},
 {id:"L-BLT-MIRRORSHORE",name:"鏡塔湖北岸",zoneId:"BLT-Z-02",province:"PROV-BLT-02",smap:"SMAP-BLT-02",tier:"E",size:"湖岸草地",tags:["water","plains"],zoneClass:"town_outskirts",template:"L-RIVER",aquatic:true,safety:87,risk:11,regen:36,
  description:"鏡塔湖最容易接近的一段湖岸，有漁棚、藥草地與水務標尺。捕撈與採集都有季節上限。",
  gather:["BLT-MAT-002","I-HERB","I-MINT"],fish:["I-RAWFISH"],preferred:["MON-BLT-002","MON-BLT-004"],explore:[["水務標尺",25],["漁棚",25],["銀藻淺灣",20],["湖岸香草地",20],["禁捕浮標",10]]},
 {id:"L-BLT-REEDMIRE",name:"鏡湖西蘆澤",zoneId:"BLT-Z-02",province:"PROV-BLT-02",smap:"SMAP-BLT-02",tier:"D",size:"湖盆濕地",tags:["water","plains"],zoneClass:"frontier",template:"L-RIVER",aquatic:true,safety:70,risk:22,allowMagical:true,regen:48,
  description:"湖西側的蘆澤與淺水泥地。偶爾受塔群逸散魔力影響，水生生物會出現短期異常，但不是永久性的魔法荒野。",
  gather:["BLT-MAT-002","BLT-MAT-006","I-HERB"],fish:["I-RAWFISH"],preferred:["MON-BLT-004","MON-BLT-009","MON-BLT-013"],explore:[["蘆澤水道",25],["浮木洲",20],["冷霧洼",20],["水鳥地",20],["舊測水臺",15]]},
 {id:"L-BLT-RUNESLOPE",name:"符紋頁岩坡",zoneId:"BLT-Z-03",province:"PROV-BLT-03",smap:"SMAP-BLT-03",tier:"D",size:"礦坡與碎岩地",tags:["mountain"],zoneClass:"frontier",template:"L-HILL",safety:69,risk:23,allowMagical:true,regen:60,
  description:"頁岩中天然礦紋與早期採礦刻線交錯的山坡。可採低階符紋石，但不得破壞仍在監測的地層標記。",
  gather:["BLT-MAT-005"],mining:["BLT-MAT-004","BLT-MAT-010"],preferred:["MON-BLT-005","MON-BLT-010","MON-BLT-011"],explore:[["頁岩階",25],["礦務標樁",20],["舊纜車基座",20],["落石溝",20],["封礦碑",15]]},
 {id:"L-BLT-CRYSTALSLOPE",name:"導晶砂坡",zoneId:"BLT-Z-03",province:"PROV-BLT-03",smap:"SMAP-BLT-03",tier:"C",size:"晶砂風化坡",tags:["mountain"],zoneClass:"deep_wild",template:"L-HILL",safety:58,risk:30,allowMagical:true,regen:72,
  description:"含少量導魔晶砂的乾燥坡地。資源價值高但含量低，過度挖掘會破壞坡體，因此只開放輪採區。",
  mining:["BLT-MAT-003","BLT-MAT-010"],preferred:["MON-BLT-011","MON-BLT-014","MON-BLT-016"],explore:[["輪採區",25],["風化晶脈",20],["廢滑車道",20],["崩坡警戒線",20],["測式石柱",15]]},
 {id:"L-BLT-STARMEDOW",name:"星砂草原",zoneId:"BLT-Z-04",province:"PROV-BLT-04",smap:"SMAP-BLT-04",tier:"D",size:"高地短草原",tags:["plains"],zoneClass:"frontier",template:"L-LOWFIELD",safety:71,risk:21,allowMagical:true,regen:48,
  description:"觀測臺地周圍的短草原，夜間可見含微量晶質的風砂反光。星砂只是自然礦物與觀測名詞，不是無限掉落的高階魔法素材。",
  gather:["BLT-MAT-007","I-HERB"],hunt:["I-RAWMEAT"],preferred:["MON-BLT-006","MON-BLT-012"],explore:[["風砂草坡",25],["觀測界樁",20],["牧人石圈",20],["通訊桿",20],["小型隕坑",15]]},
 {id:"L-BLT-WINDTABLE",name:"風切臺地",zoneId:"BLT-Z-04",province:"PROV-BLT-04",smap:"SMAP-BLT-04",tier:"C",size:"裸岩高臺",tags:["mountain","plains"],zoneClass:"deep_wild",template:"L-HILL",safety:55,risk:32,allowMagical:true,regen:72,
  description:"高地北端的強風臺地，儀器與旅人都必須固定繫留。高空生物和雷暴比地面怪物更常造成事故。",
  gather:["BLT-MAT-008"],preferred:["MON-BLT-012","MON-BLT-015","MON-BLT-018"],explore:[["繫留柱",25],["雷暴避棚",20],["風向盤",20],["斷索崖",20],["北望臺",15]]},
 {id:"L-BLT-EASTSTEPPE",name:"東界乾草臺",zoneId:"BLT-Z-05",province:"PROV-BLT-05",smap:"SMAP-BLT-05",tier:"D",size:"高地草原",tags:["plains"],zoneClass:"frontier",template:"L-LOWFIELD",safety:73,risk:19,regen:48,
  description:"藍塔高地向泰爾瓦隆草原過渡的乾草臺地。商旅與牧群經常通過，危險以狼群、盜騎與突發風沙為主。",
  gather:["BLT-MAT-009","I-HERB"],hunt:["I-RAWMEAT"],preferred:["MON-BLT-006","MON-BLT-017"],explore:[["乾草坡",25],["互市路標",20],["牧群飲水槽",20],["巡界火塘",20],["舊界碑",15]]},
 {id:"L-BLT-MARKETROAD",name:"季市古道",zoneId:"BLT-Z-05",province:"PROV-BLT-05",smap:"SMAP-BLT-05",tier:"E",size:"商路丘道",tags:["plains"],zoneClass:"town_outskirts",template:"L-LOWFIELD",safety:82,risk:13,regen:36,
  description:"連接東界市與季節互市場的寬闊丘道。市期有巡界隊和商隊護衛，淡季則只剩零散旅人與小型野獸。",
  gather:["BLT-MAT-009","I-BERRY"],hunt:["I-RAWMEAT"],preferred:["MON-BLT-001","MON-BLT-003"],explore:[["季市棚架",25],["商隊井",25],["舊秤臺",20],["巡路碑",15],["淡季空營地",15]]},
 {id:"L-BLT-HEADWATER",name:"赫薩爾源谷",zoneId:"BLT-Z-06",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"D",size:"河源谷地",tags:["water","mountain"],zoneClass:"frontier",template:"L-RIVER",aquatic:true,safety:75,risk:18,regen:48,
  description:"赫薩爾河上游最穩定的河源谷地，山泉、牧草與低階藥草豐富。河源受嚴格保護，採礦和傾倒術式廢料均被禁止。",
  gather:["BLT-MAT-001","BLT-MAT-006","I-HERB"],fish:["I-RAWFISH"],hunt:["I-RAWMEAT"],preferred:["MON-BLT-002","MON-BLT-005","MON-BLT-009"],explore:[["河源泉眼",25],["牧草坡",20],["水質測站",20],["山羊徑",20],["護源石碑",15]]},
 {id:"L-BLT-PASSSLOPE",name:"藍塔隘高坡",zoneId:"BLT-Z-06",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"C",size:"關隘山坡",tags:["mountain"],zoneClass:"deep_wild",template:"L-HILL",safety:61,risk:28,allowMagical:true,regen:60,
  description:"藍塔隘上方的碎石坡與守備巡路。古代防禦構裝偶爾因雷暴或地震重新啟動，守備方會封鎖危險段落。",
  gather:["BLT-MAT-005"],mining:["BLT-MAT-004"],preferred:["MON-BLT-010","MON-BLT-014","MON-BLT-019"],explore:[["隘口巡路",25],["落石網",20],["舊防禦樁",20],["高坡烽臺",20],["封鎖機關門",15]]}
];
for(const x of FIELDS)upsert("locations",field(x));

const DUNGEONS=[
 {id:"D-BLT-FOUNDATION",name:"原初藍塔基座",zoneId:"BLT-Z-01",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"B",size:"古塔深層基座",tags:["dungeon","ruins"],space:"large",risk:43,safety:31,
  description:"王都最古老塔基下方的封閉結構，只開放經議會與事故審議署許可的隊伍進入。危險來自老舊構裝、術式殘留與不穩定空間，而非無限生成的寶物。",
  preferred:["MON-BLT-020","MON-BLT-021"],gather:["BLT-MAT-013"],explore:[["議會封印門",25],["舊升降井",20],["基座環廊",20],["主核心前室",20],["深層封閉門",15]]},
 {id:"D-BLT-STOREROOM",name:"舊式材庫",zoneId:"BLT-Z-01",province:"PROV-BLT-01",smap:"SMAP-BLT-01",tier:"D",size:"廢棄術材倉庫",tags:["dungeon","ruins"],risk:24,safety:55,
  description:"青階鎮外停用的舊術材庫，殘留低階封蠟、破損練習構裝與分類錯置的研究廢料。現作為受控清理委託地點。",
  preferred:["MON-BLT-007","MON-BLT-011"],gather:["BLT-MAT-014"],explore:[["分類庫房",25],["封蠟架",20],["練習構裝間",20],["回收井",20],["舊檔案室",15]]},
 {id:"D-BLT-SUNKENTOWER",name:"鏡湖沉塔",zoneId:"BLT-Z-02",province:"PROV-BLT-02",smap:"SMAP-BLT-02",tier:"C",size:"半沉沒研究塔",tags:["dungeon","ruins","water"],aquatic:true,space:"standard",risk:32,safety:43,
  description:"早年湖岸塌陷後半沉入水中的研究塔。水務公署只允許在低水位與完成安全檢查時進入外層。",
  preferred:["MON-BLT-013","MON-BLT-018"],gather:["BLT-MAT-002","BLT-MAT-012"],fish:["I-RAWFISH"],explore:[["傾斜門廳",25],["淹水書庫",20],["鏡面實驗室",20],["沉降樓梯",20],["水下封門",15]]},
 {id:"D-BLT-RUNEMINE",name:"符脊舊晶坑",zoneId:"BLT-Z-03",province:"PROV-BLT-03",smap:"SMAP-BLT-03",tier:"C",size:"舊導晶礦坑",tags:["dungeon","cave","mine"],space:"large",risk:34,safety:40,
  description:"因地層不穩與術式污染超標而關閉的舊礦坑。合法隊伍以調查、支撐與污染測量為主，不能當成無限採礦點。",
  preferred:["MON-BLT-014","MON-BLT-016","MON-BLT-019"],mining:["BLT-MAT-003","BLT-MAT-010"],explore:[["封礦閘",25],["舊支架帶",20],["晶砂沉積層",20],["污染測站",20],["深層裂縫",15]]},
 {id:"D-BLT-OBSERVATORY",name:"斷弦觀測臺",zoneId:"BLT-Z-04",province:"PROV-BLT-04",smap:"SMAP-BLT-04",tier:"C",size:"廢棄高地觀測站",tags:["dungeon","ruins","mountain"],space:"standard",risk:35,safety:39,
  description:"一次雷暴事故後廢棄的舊觀測臺。殘留的自動校準構裝仍會嘗試修正任何進入觀測線的人與物。",
  preferred:["MON-BLT-015","MON-BLT-018","MON-BLT-020"],gather:["BLT-MAT-008"],explore:[["斷裂天線架",25],["儀器廳",20],["校準環",20],["避雷井",20],["頂層星盤",15]]},
 {id:"D-BLT-BORDERLAB",name:"東界廢驗室",zoneId:"BLT-Z-05",province:"PROV-BLT-05",smap:"SMAP-BLT-05",tier:"D",size:"停用邊境試驗站",tags:["dungeon","ruins","plains"],risk:27,safety:50,
  description:"曾用於測試高地風沙與草原材料的邊境研究站。撤站後留下的簡易構裝與樣本槽偶爾失控。",
  preferred:["MON-BLT-007","MON-BLT-017"],gather:["BLT-MAT-009","BLT-MAT-014"],explore:[["樣本間",25],["風沙測試廊",20],["構裝棚",20],["舊宿舍",20],["封存地下室",15]]},
 {id:"D-BLT-GATEWORKS",name:"隘門舊機關層",zoneId:"BLT-Z-06",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"C",size:"關隘地下防禦層",tags:["dungeon","ruins","mountain"],space:"large",risk:36,safety:38,
  description:"隘門城舊防禦系統的一部分。新守備線早已移到地表，但部分石門、警戒符與構裝仍在地下運作。",
  preferred:["MON-BLT-019","MON-BLT-020"],gather:["BLT-MAT-004","BLT-MAT-014"],explore:[["舊閘門",25],["警戒符廊",20],["守衛槽",20],["落石控制室",20],["封閉指揮間",15]]},
 {id:"D-BLT-HEADSPRING",name:"源谷石泉穴",zoneId:"BLT-Z-06",province:"PROV-BLT-06",smap:"SMAP-BLT-06",tier:"D",size:"河源天然洞穴",tags:["dungeon","cave","water"],aquatic:true,risk:25,safety:52,
  description:"河源側壁的天然石灰洞，水務官定期檢查是否有崩塌、污染與大型水生生物進入。洞穴本身不是禁區，但雨季會封閉。",
  preferred:["MON-BLT-005","MON-BLT-009","MON-BLT-013"],gather:["BLT-MAT-006"],fish:["I-RAWFISH"],explore:[["泉水入口",25],["石灰臺",20],["冷水池",20],["窄縫支洞",20],["深泉回音",15]]}
];
for(const x of DUNGEONS)upsert("locations",dungeon(x));

const ROUTES=[
 ["L-BLT-CITY","L-BLT-BLUESTEPS",.8],["L-BLT-CITY","L-BLT-CIRCUIT",1.0],["L-BLT-CITY","L-BLT-BLUECLIFF",1.8],["L-BLT-BLUESTEPS","D-BLT-STOREROOM",1.2],["L-BLT-CITY","D-BLT-FOUNDATION",.7],
 ["L-BLT-CITY","L-BLT-MIRROR",2.4],["L-BLT-MIRROR","L-BLT-MIRRORSHORE",.7],["L-BLT-MIRRORSHORE","L-BLT-REEDMIRE",1.2],["L-BLT-REEDMIRE","D-BLT-SUNKENTOWER",1.1],
 ["L-BLT-CITY","L-BLT-RUNE",3.2],["L-BLT-RUNE","L-BLT-RUNESLOPE",.9],["L-BLT-RUNESLOPE","L-BLT-CRYSTALSLOPE",1.4],["L-BLT-CRYSTALSLOPE","D-BLT-RUNEMINE",1.1],
 ["L-BLT-CITY","L-BLT-STAR",3.7],["L-BLT-STAR","L-BLT-STARMEDOW",.9],["L-BLT-STARMEDOW","L-BLT-WINDTABLE",1.7],["L-BLT-WINDTABLE","D-BLT-OBSERVATORY",1.2],
 ["L-BLT-CITY","L-BLT-EAST",4.1],["L-BLT-EAST","L-BLT-EASTSTEPPE",1.0],["L-BLT-EAST","L-BLT-MARKETROAD",.8],["L-BLT-MARKETROAD","D-BLT-BORDERLAB",1.3],
 ["L-BLT-CITY","L-BLT-GATE",3.5],["L-BLT-GATE","L-BLT-HEADVALE",1.4],["L-BLT-HEADVALE","L-BLT-HEADWATER",.9],["L-BLT-GATE","L-BLT-PASSSLOPE",1.2],["L-BLT-PASSSLOPE","D-BLT-GATEWORKS",1.0],["L-BLT-HEADWATER","D-BLT-HEADSPRING",1.1],
 ["L-BLT-MIRROR","L-BLT-RUNE",2.6],["L-BLT-STAR","L-BLT-EAST",3.0],["L-BLT-EAST","L-BLT-GATE",3.8]
];
for(const r of ROUTES)twoWay(r[0],r[1],r[2]);

const ITEMS=[
 ["BLT-MAT-001","高地風茴","F",.08,7,"高地常見香草，可作食材與低階調劑輔料。"],
 ["BLT-MAT-002","鏡湖銀藻","E",.1,14,"鏡塔湖淺水帶的銀灰藻類，採集受季節配額限制。"],
 ["BLT-MAT-003","導晶砂","D",.25,31,"能穩定傳導少量魔力的晶質砂，須從合法輪採區取得。"],
 ["BLT-MAT-004","符紋頁岩","D",.45,28,"紋理規則的高地頁岩，常用於刻寫練習與低階術具底板。"],
 ["BLT-MAT-005","藍石苔","E",.08,13,"附著在高地藍灰石上的耐寒苔類。"],
 ["BLT-MAT-006","冷泉蘚","E",.09,15,"生長在河源與冷泉附近的濕生蘚類。"],
 ["BLT-MAT-007","星砂草籽","D",.06,24,"北臺地短草的硬質種子，表面常附細微晶砂。"],
 ["BLT-MAT-008","空鳴羽","D",.12,33,"高地飛行獸的中空硬羽，可作精密風向器與箭羽。"],
 ["BLT-MAT-009","東界韌草","E",.12,12,"乾草臺地常見的韌性草纖維。"],
 ["BLT-MAT-010","藍脊鐵晶","C",.5,58,"混有鐵質與導魔微晶的有限礦材，開採受配額管理。"],
 ["BLT-MAT-011","冷光蛛絲","D",.08,35,"洞穴晶蛛的耐寒絲束，可作精細縫線與術具纏束。"],
 ["BLT-MAT-012","鏡鱗甲片","D",.22,32,"湖生甲獸的反光甲片。"],
 ["BLT-MAT-013","舊塔核心片","B",.45,118,"古塔構裝核心碎片，只能由授權封鎖區清理任務取得。"],
 ["BLT-MAT-014","封式樹脂","D",.16,29,"舊式材庫與研究站常見的封存樹脂，需確認未受污染後才能回收。"]
].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],value:x[4],description:x[5]}));
const GATHER_ELIGIBLE=new Set([...FIELDS,...DUNGEONS].flatMap(x=>x.gather||[]));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID,wild_gather_eligible:GATHER_ELIGIBLE.has(x.id)});

function mon(x){
 const drops=[...(x.drops||[])];
 return {id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:x.category||"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],
  hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,
  xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,
  ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},
  loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},
  loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:1}))
 };
}
const MONSTERS=[
 {id:"MON-BLT-001",name:"高地岩兔",tier:"F",habitat:["L-BLT-CIRCUIT","L-BLT-MARKETROAD"],hp:25,atk:8,def:4,acc:68,damage:[2,5],scale:"small",tags:["wildlife","small_intruder"],drops:[],near:true,description:"常見於農田與商路邊的岩兔，幾乎不主動攻擊人。"},
 {id:"MON-BLT-002",name:"源谷山羊",tier:"F",habitat:["L-BLT-HEADWATER"],hp:31,atk:10,def:6,acc:66,damage:[3,6],scale:"small",tags:["wildlife"],drops:[],near:true,description:"河源谷地常見的小型山羊，受驚時會用短角衝撞。"},
 {id:"MON-BLT-003",name:"塔簷灰鴉",tier:"F",habitat:["L-BLT-CIRCUIT","L-BLT-MARKETROAD"],hp:23,atk:8,def:3,acc:72,init:13,damage:[2,5],element:"風",scale:"small",tags:["wildlife","small_intruder"],drops:["BLT-MAT-008"],near:true,description:"習慣在塔簷與道路石柱築巢的灰鴉，偶爾偷走閃亮的小物。"},
 {id:"MON-BLT-004",name:"鏡湖蘆蟹",tier:"E",habitat:["L-BLT-MIRRORSHORE","L-BLT-REEDMIRE"],hp:48,atk:15,def:11,acc:67,damage:[5,9],element:"水",scale:"small",tags:["aquatic","invertebrate"],drops:["BLT-MAT-012"],near:true,description:"鏡塔湖蘆葦帶常見的硬殼蟹。"},
 {id:"MON-BLT-005",name:"冷泉石蜥",tier:"E",habitat:["L-BLT-RUNESLOPE","L-BLT-HEADWATER","D-BLT-HEADSPRING"],hp:53,atk:16,def:10,acc:71,damage:[5,10],element:"地",scale:"small",tags:["wildlife"],drops:["BLT-MAT-006"],description:"喜歡貼近冷泉與石壁活動的小型蜥類。"},
 {id:"MON-BLT-006",name:"高原長尾狐",tier:"E",habitat:["L-BLT-STARMEDOW","L-BLT-EASTSTEPPE"],hp:49,atk:17,def:7,acc:75,init:14,damage:[6,10],scale:"small",tags:["wildlife"],drops:["BLT-MAT-009"],description:"東北高地常見的小型掠食獸，以鼠兔與鳥類為食。"},
 {id:"MON-BLT-007",name:"失控搬運魔像",tier:"E",habitat:["L-BLT-CIRCUIT","D-BLT-STOREROOM","D-BLT-BORDERLAB"],hp:61,atk:17,def:15,acc:68,damage:[6,11],scale:"small",tags:["construct"],drops:["BLT-MAT-014"],near:true,description:"低階搬運構裝在控制符損壞後仍反覆執行搬運指令，通常只是推撞與拖拽物品。"},
 {id:"MON-BLT-008",name:"藍崖風隼",tier:"D",habitat:["L-BLT-BLUECLIFF"],hp:78,atk:24,def:9,acc:81,init:16,damage:[8,16],element:"風",scale:"medium",tags:["wildlife"],drops:["BLT-MAT-008"],description:"利用藍石崖上升氣流狩獵的大型隼類。"},
 {id:"MON-BLT-009",name:"鏡鱗水蜥",tier:"D",habitat:["L-BLT-REEDMIRE","L-BLT-HEADWATER","D-BLT-HEADSPRING"],hp:87,atk:23,def:13,acc:74,damage:[8,16],element:"水",scale:"medium",tags:["aquatic","wildlife"],drops:["BLT-MAT-012"],description:"湖盆與河源常見的中型水蜥，鱗片在強光下反射明顯。"},
 {id:"MON-BLT-010",name:"符坡岩狼",tier:"D",habitat:["L-BLT-BLUECLIFF","L-BLT-RUNESLOPE","L-BLT-PASSSLOPE"],hp:91,atk:26,def:12,acc:77,damage:[9,18],scale:"medium",tags:["wildlife"],drops:[],description:"活動於高地石坡的狼群，通常遠離城鎮，但會追逐落單牲畜。"},
 {id:"MON-BLT-011",name:"刻紋甲蟲",tier:"D",habitat:["L-BLT-RUNESLOPE","L-BLT-CRYSTALSLOPE","D-BLT-STOREROOM"],hp:82,atk:22,def:18,acc:70,damage:[8,15],element:"地",scale:"small",tags:["invertebrate","magical_ecology"],drops:["BLT-MAT-004"],description:"以含晶礦屑為食的大型甲蟲，甲殼紋路常被誤認為人工符文。"},
 {id:"MON-BLT-012",name:"星臺風羽獸",tier:"D",habitat:["L-BLT-STARMEDOW","L-BLT-WINDTABLE"],hp:85,atk:25,def:10,acc:79,init:16,damage:[9,17],element:"風",scale:"medium",tags:["wildlife"],drops:["BLT-MAT-008"],description:"棲息北部臺地的飛行獸，會利用強風快速轉向。"},
 {id:"MON-BLT-013",name:"湖霧甲獸",tier:"D",habitat:["L-BLT-REEDMIRE","D-BLT-SUNKENTOWER","D-BLT-HEADSPRING"],hp:105,atk:26,def:20,acc:70,damage:[9,18],element:"水",scale:"large",tags:["aquatic","invertebrate"],drops:["BLT-MAT-012"],description:"喜歡在冷霧與淺水中伏藏的大型甲殼獸。"},
 {id:"MON-BLT-014",name:"靜電岩蜥",tier:"C",habitat:["L-BLT-CRYSTALSLOPE","L-BLT-PASSSLOPE","D-BLT-RUNEMINE"],hp:142,atk:34,def:22,acc:76,damage:[12,24],element:"雷",scale:"medium",tags:["wildlife","magical_ecology"],drops:["BLT-MAT-010"],description:"長期活動在含晶岩層附近的岩蜥，乾燥天候下體表容易積聚靜電。"},
 {id:"MON-BLT-015",name:"雷暴滑翔獸",tier:"C",habitat:["L-BLT-WINDTABLE","D-BLT-OBSERVATORY"],hp:137,atk:35,def:16,acc:82,init:18,damage:[12,25],element:"雷",scale:"large",tags:["wildlife"],drops:["BLT-MAT-008"],description:"會沿雷暴前緣滑翔的高地飛行獸，觀測院常在惡劣天候前發布警戒。"},
 {id:"MON-BLT-016",name:"冷光晶蛛",tier:"C",habitat:["L-BLT-CRYSTALSLOPE","D-BLT-RUNEMINE"],hp:132,atk:33,def:17,acc:78,damage:[11,23],scale:"medium",tags:["invertebrate","cave"],drops:["BLT-MAT-011"],description:"在舊晶坑與風化晶坡結網的大型蜘蛛，蛛絲會反射冷色光。"},
 {id:"MON-BLT-017",name:"東界草原狼",tier:"D",habitat:["L-BLT-EASTSTEPPE","D-BLT-BORDERLAB"],hp:94,atk:27,def:11,acc:79,damage:[9,18],scale:"medium",tags:["wildlife"],drops:[],description:"高地與東北草原交界的狼群，會跟隨遷移獵物改變活動範圍。"},
 {id:"MON-BLT-018",name:"觀測臺校準構裝",tier:"C",habitat:["L-BLT-WINDTABLE","D-BLT-SUNKENTOWER","D-BLT-OBSERVATORY"],hp:158,atk:34,def:26,acc:77,damage:[12,24],scale:"medium",tags:["construct"],drops:["BLT-MAT-013"],description:"舊研究設施的自動校準構裝，故障後會把闖入者當成需要重新定位的障礙物。"},
 {id:"MON-BLT-019",name:"隘門石衛",tier:"C",habitat:["L-BLT-PASSSLOPE","D-BLT-RUNEMINE","D-BLT-GATEWORKS"],hp:166,atk:36,def:29,acc:74,damage:[13,26],element:"地",scale:"large",tags:["construct"],drops:["BLT-MAT-013"],description:"早期關隘防禦構裝，現役系統已停用大多數個體，但受損區仍可能自行啟動。"},
 {id:"MON-BLT-020",name:"舊塔環衛構裝",tier:"B",role:"菁英",habitat:["D-BLT-FOUNDATION","D-BLT-OBSERVATORY","D-BLT-GATEWORKS"],hp:268,atk:49,def:37,mdef:34,acc:80,damage:[17,34],scale:"large",tags:["construct"],drops:["BLT-MAT-013"],description:"古塔與大型設施的重型環衛構裝，只有授權高階區域才可能遭遇。"},
 {id:"MON-BLT-021",name:"基座主守衛",tier:"B",role:"首領候選",habitat:["D-BLT-FOUNDATION"],hp:335,atk:55,def:42,mdef:40,acc:82,init:13,damage:[20,40],scale:"large",tags:["construct"],drops:["BLT-MAT-013"],description:"原初藍塔基座深層仍在運作的主守衛。其存在被議會列為已知風險，不會離開封閉基座進入城市。"}
];
for(const m of MONSTERS)upsert("monsters",mon(m));

const NPCS=[
 {id:"NPC-BLT-001",name:"瑟芙琳・艾爾文",role:"首席塔主／議長",tier:"B",location_id:"L-BLT-CITY",knowledge_scope:"塔主議會、王國法統、禁術政策、對外外交與高階研究責任",combat_tier_ceiling:"B",organization_ids:["ORG-077"],services:["高階議政劇情","王國級學術引介"],description:"現任首席塔主。她的職責是維持塔主間的可執行共識，而不是替所有學派決定研究方向。"},
 {id:"NPC-BLT-002",name:"洛德里克・凡恩",role:"藍塔奧術院院長",tier:"B",location_id:"L-BLT-CITY",knowledge_scope:"奧術教育、研究審查、學徒資格與事故紀錄",combat_tier_ceiling:"B",organization_ids:["ORG-077"],services:["學術資格","研究委託"],description:"主持藍塔奧術院教學與研究制度，重視可重現紀錄勝過華麗理論。"},
 {id:"NPC-BLT-003",name:"伊莉安・瑟德",role:"元素塔議會輪值首席",tier:"B",location_id:"L-BLT-BLUESTEPS",knowledge_scope:"元素塔協調、研究安全與跨塔事故互助",combat_tier_ceiling:"B",organization_ids:["ORG-078"],services:["元素研究委託","塔院引介"],description:"高等精靈法師，負責在各元素塔之間協調共同安全規範。"},
 {id:"NPC-BLT-004",name:"布林・柯鉚",role:"術式安全審議官",tier:"C",location_id:"L-BLT-CITY",knowledge_scope:"禁術分級、事故調查、封鎖區與術式責任",combat_tier_ceiling:"C",organization_ids:["ORG-BLT-CENSOR"],services:["事故調查","封鎖區許可"],description:"侏儒審議官，習慣先問誰記錄、誰複核、誰有權中止試驗。"},
 {id:"NPC-BLT-005",name:"瑪蓮・霍斯",role:"塔域執政官",tier:"C",location_id:"L-BLT-CITY",knowledge_scope:"王都市政、學舍、公共設施、術式廢棄物與居民申訴",combat_tier_ceiling:"D",organization_ids:["ORG-BLT-CENSOR"],services:["市政委託","行政引介"],description:"負責把高塔議會的規範轉成城市能實際執行的街區、水務與安全制度。"},
 {id:"NPC-BLT-006",name:"歐文・米爾",role:"鏡湖水務官",tier:"D",location_id:"L-BLT-MIRROR",knowledge_scope:"鏡塔湖水位、捕撈、藥草帶與王都供水",combat_tier_ceiling:"E",organization_ids:["ORG-BLT-LAKE"],services:["水務委託","湖產情報"],description:"長年管理湖水與捕撈配額，反對把任何發光水草都當成珍稀魔法材料。"},
 {id:"NPC-BLT-007",name:"塔維克・羅恩",role:"西脊塔主",tier:"C",location_id:"L-BLT-RUNE",knowledge_scope:"符紋、導晶、礦坑安全與構裝材料",combat_tier_ceiling:"C",organization_ids:["ORG-078","ORG-BLT-CRAFT"],services:["礦務研究","構裝委託"],description:"主持西脊塔院，研究方向偏符紋材料與構裝耐久。"},
 {id:"NPC-BLT-008",name:"艾妲・梅爾",role:"高地觀測院院長",tier:"C",location_id:"L-BLT-STAR",knowledge_scope:"天象、風場、雷暴與遠距通信",combat_tier_ceiling:"C",organization_ids:["ORG-BLT-OBS"],services:["觀測資料","氣象委託"],description:"要求所有觀測都標記時間、地點、能見度與儀器誤差。"},
 {id:"NPC-BLT-009",name:"哈洛・畢恩",role:"東界關貿監",tier:"D",location_id:"L-BLT-EAST",knowledge_scope:"東界互市、秤量、檢疫、泰爾瓦隆商隊與邊境價格",combat_tier_ceiling:"D",organization_ids:["ORG-BLT-TRADE"],services:["商路情報","互市委託"],description:"熟悉季市價格和部落商隊習慣，不允許用法術資格取代正常商法。"},
 {id:"NPC-BLT-010",name:"賽勒・布瑞克",role:"藍塔隘守備監",tier:"C",location_id:"L-BLT-GATE",knowledge_scope:"藍塔隘、守備構裝、落石、商路與邊境警戒",combat_tier_ceiling:"C",organization_ids:["ORG-BLT-WARDEN"],services:["守備委託","通行情報"],description:"重視巡路、糧秣與可靠警報，認為最好的防禦術式是不用每天維修的那一種。"},
 {id:"NPC-BLT-011",name:"妮雅・芬",role:"高地巡界隊長",tier:"C",location_id:"L-BLT-EAST",knowledge_scope:"邊界巡查、失蹤商隊、野生魔物與塔界石",combat_tier_ceiling:"C",organization_ids:["ORG-BLT-WARDEN"],services:["巡界委託","野外情報"],description:"帶隊巡查東界與北臺地，會把魔物遷移、盜騎和自然災害分開記錄。"},
 {id:"NPC-BLT-012",name:"哥朗・斐特",role:"魔像監造師",tier:"D",location_id:"L-BLT-RUNE",knowledge_scope:"構裝維修、核心負載、零件壽命與失控原因",combat_tier_ceiling:"D",organization_ids:["ORG-BLT-CRAFT"],services:["構裝修理","材料鑑定"],description:"堅持任何構裝故障都先斷能、固定、記錄，再談重新啟動。"},
 {id:"NPC-BLT-013",name:"菲爾・艾斯頓",role:"冒險者公會藍塔館主",tier:"C",location_id:"L-BLT-BLUESTEPS",knowledge_scope:"藍塔委託、地下城分級、冒險者資格與收購規則",combat_tier_ceiling:"C",organization_ids:[],services:["冒險者委託","收購櫃檯"],description:"將高階研究委託拆成合理前置，不讓低階冒險者因為報酬高就直接進入B級封鎖區。"},
 {id:"NPC-BLT-014",name:"露西亞・海姆",role:"湖畔草藥師",tier:"D",location_id:"L-BLT-MIRROR",knowledge_scope:"高地草藥、銀藻、冷泉蘚與基礎調劑",combat_tier_ceiling:"E",organization_ids:["ORG-BLT-LAKE"],services:["藥草收購","調劑委託"],description:"區分食材、輔料、藥材和真正有效成分，不把魔力反應等同療效。"},
 {id:"NPC-BLT-015",name:"德恩・卡索",role:"符脊礦工頭",tier:"D",location_id:"L-BLT-RUNE",knowledge_scope:"採掘配額、坑道支撐、晶砂品質與礦工安全",combat_tier_ceiling:"D",organization_ids:["ORG-BLT-CRAFT"],services:["礦材鑑定","坑道委託"],description:"比起晶砂價格更在意支撐、通風與輪採紀錄。"},
 {id:"NPC-BLT-016",name:"梅芙・唐恩",role:"青階旅棧主人",tier:"E",location_id:"L-BLT-BLUESTEPS",knowledge_scope:"學徒生活、考季房價、旅人與王都日常傳聞",combat_tier_ceiling:"F",organization_ids:[],services:["住宿","地方傳聞"],description:"接待過無數第一次來藍塔的學徒和旅人，知道哪些傳聞只是考生緊張造成的誇張。"},
 {id:"NPC-BLT-017",name:"佩特・羅梭",role:"學徒宿舍長",tier:"E",location_id:"L-BLT-BLUESTEPS",knowledge_scope:"學徒規章、基礎資格、宿舍事故與課程安排",combat_tier_ceiling:"E",organization_ids:["ORG-077"],services:["學徒引導","基礎資格資訊"],description:"負責宿舍與基礎學程紀律，最常處理的事故不是禁術，而是睡眠不足和違規練習。"},
 {id:"NPC-BLT-018",name:"茱蒂・克萊",role:"事故記錄員",tier:"D",location_id:"L-BLT-CITY",knowledge_scope:"公開事故檔案、研究封存編號與調查流程",combat_tier_ceiling:"F",organization_ids:["ORG-BLT-CENSOR"],services:["事故檔案查詢","研究紀錄引介"],description:"只提供權限允許的事故資料，並清楚區分目擊、推定原因與已驗證結論。"}
];
for(const n of NPCS){if(tierRank(n.combat_tier_ceiling)>tierRank("C"))n.combat_tier_ceiling="C";upsert("regional_npc_archetypes",{...n,region_id:REGION_ID,polity_id:POLITY_ID})}
const DIALOGUES=[
 ["DIA-BLT-001","NPC-BLT-001","議會","塔主議會不是比誰施法更強；真正難的是讓研究自由、城市安全和各塔責任能同時成立。"],
 ["DIA-BLT-002","NPC-BLT-002","研究","沒有方法與紀錄的成果，只能叫一次性的幸運。"],
 ["DIA-BLT-003","NPC-BLT-003","元素塔","共同安全規範不要求五座塔研究同一件事，只要求事故不要由別人收拾。"],
 ["DIA-BLT-004","NPC-BLT-004","事故","先封鎖、再取樣、再問責。把順序倒過來通常只會多一場事故。"],
 ["DIA-BLT-005","NPC-BLT-005","城市","藍塔城裡大多數人要的是水、路、房租和安全，不是每天看一次禁咒。"],
 ["DIA-BLT-006","NPC-BLT-006","鏡湖","湖水是王都的水源，不是研究院想拿多少就拿多少的材料桶。"],
 ["DIA-BLT-007","NPC-BLT-007","礦務","導晶砂少不代表要挖得更快，挖垮了坡地，明年就連少都沒有。"],
 ["DIA-BLT-008","NPC-BLT-008","觀測","看見一道光不等於看見一顆星。先把雲、角度和儀器誤差寫下來。"],
 ["DIA-BLT-009","NPC-BLT-009","互市","東界市按秤和契約做生意。對方是百族商隊，不代表價格可以靠猜。"],
 ["DIA-BLT-010","NPC-BLT-010","守備","隘口不是靠一座大法陣守住，是靠路障、巡哨、補給和能真的響起來的警報。"],
 ["DIA-BLT-011","NPC-BLT-011","巡界","狼群南移、商隊失蹤和邊界衝突是三種事，紀錄時別混成一種。"],
 ["DIA-BLT-012","NPC-BLT-012","魔像","構裝停不下來時先斷能，不要站在前面和它爭論指令。"],
 ["DIA-BLT-013","NPC-BLT-013","委託","B級區域不表示每個任務都是B級，但B級封鎖區一定要有前置資格。"],
 ["DIA-BLT-014","NPC-BLT-014","藥草","銀藻會對魔力起反應，不代表它單獨就能治傷。"],
 ["DIA-BLT-015","NPC-BLT-015","採礦","今天多挖一車，可能換來下個月整條坑道停工。"],
 ["DIA-BLT-016","NPC-BLT-016","旅人","第一次來的人總以為滿街都是大法師。其實最多的是學生、工匠和趕房租的人。"],
 ["DIA-BLT-017","NPC-BLT-017","學徒","能安全把基礎術式做十次，比冒險把高階術式做成一次重要。"],
 ["DIA-BLT-018","NPC-BLT-018","檔案","我可以告訴你記錄寫了什麼，但不會把推測替你說成結論。"]
];
for(const d of DIALOGUES)upsert("npc_dialogues",{id:d[0],speaker_id:d[1],topic:d[2],text:d[3]});
for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(x)x.dialogue_ids=["DIA-"+n.id.slice(4)]}

const ORGS=[
 {id:"ORG-BLT-CENSOR",name:"術式安全審議署",kind:"government",tier:"B",base_location_id:"L-BLT-CITY",description:"負責禁術分級、研究事故調查、封鎖區與高風險術式許可。"},
 {id:"ORG-BLT-OBS",name:"高地觀測院",kind:"research",tier:"C",base_location_id:"L-BLT-STAR",description:"管理天象、氣象、風場、遠距通信與高地儀器觀測。"},
 {id:"ORG-BLT-WARDEN",name:"塔界巡守隊",kind:"ranger",tier:"C",base_location_id:"L-BLT-GATE",description:"巡查國境、塔界石、商路與高地野外，處理失蹤、魔物遷移與邊界事故。"},
 {id:"ORG-BLT-CRAFT",name:"魔像與術具監造會",kind:"craft",tier:"C",base_location_id:"L-BLT-RUNE",description:"制定構裝、術具、核心負載、修繕與報廢標準。"},
 {id:"ORG-BLT-LAKE",name:"鏡塔湖民生公署",kind:"civic",tier:"D",base_location_id:"L-BLT-MIRROR",description:"管理王都供水、湖產、捕撈、河源保護與湖岸公共工程。"},
 {id:"ORG-BLT-TRADE",name:"赫薩爾上游商旅會",kind:"trade",tier:"D",base_location_id:"L-BLT-EAST",description:"協調東界季市、南向商路、倉儲、秤量與商隊互保。"}
];
for(const o of ORGS)upsert("world_organizations",{...o,region_id:REGION_ID,political_entity_id:POLITY_ID});

for(const id of ["ORG-076","ORG-077","ORG-078"]){
 const o=row("world_organizations",id);if(!o)continue;
 o.contact_location_ids=[...new Set([...(o.contact_location_ids||[]),id==="ORG-078"?"L-BLT-BLUESTEPS":"L-BLT-CITY"])];
 if(id!=="ORG-076"){o.political_entity_id=POLITY_ID;o.region_id=REGION_ID;}
}
const keyOrgPatches={
 "ORG-077":{base_location_id:"L-BLT-CITY",scope:"kingdom",signature:"完整奧術教育、研究審查與事故責任制度",member_bonus:{id:"ORG-BONUS-077",name:"藍塔奧術院・術式訓練",text:"魔法攻擊+6%",effects:{magic_attack_pct:6}}},
 "ORG-078":{base_location_id:"L-BLT-BLUESTEPS",scope:"kingdom",signature:"跨元素塔安全標準與事故互助",member_bonus:{id:"ORG-BONUS-078",name:"元素塔議會・元素防護",text:"異常抗性+5",effects:{statusResist:5}}}
};
for(const [id,p] of Object.entries(keyOrgPatches)){const o=row("world_organizations",id);if(o)Object.assign(o,p)}

const facilityByOrg={
 "ORG-BLT-CENSOR":"mageguild","ORG-BLT-OBS":"mageguild","ORG-BLT-WARDEN":"guild","ORG-BLT-CRAFT":"blacksmith","ORG-BLT-LAKE":"general","ORG-BLT-TRADE":"general"
};
const bonusByKind={
 government:{statusResist:6},research:{perception:5},ranger:{initiative_pct:4},craft:{craft_success:5},civic:{carryCapacity:4},trade:{carryCapacity:5}
};
for(const o0 of ORGS){
 const o=row("world_organizations",o0.id);if(!o)continue;
 o.scope=o.tier==="B"?"kingdom":"local_regional";o.alignment=o.alignment||"neutral";o.primary_facility=facilityByOrg[o.id]||"guild";
 o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;o.min_join_level=Math.max(1,Number(o.min_join_level)||1);
 o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"藍塔職能會員訓練",effects:{...(bonusByKind[o.kind]||{perception:3})}};
 o.contact_location_ids=[...new Set([...(o.contact_location_ids||[]),o.base_location_id].filter(Boolean))];
 o.history=o.history||["藍塔法令與奧術院制度化後，原本分散在各塔的職能逐步固定為可追責的公共組織。"];
 o.history_summary=o.history_summary||o.history.join(" ");
 o.current_state=o.current_state||"目前以維持研究安全、公共服務與區域職能為主，不以無限制擴張塔權為目標。";
 o.signature=o.signature||({government:"術式風險與責任審查",research:"可重現觀測",ranger:"高地巡界與實地紀錄",craft:"構裝與術具標準",civic:"水源與民生承載量",trade:"季市與商路契約"}[o.kind]||"專業職能");
 o.distinctive_features=o.distinctive_features||[o.signature,"要求紀錄與責任人","權限受塔主議會與地方公共需求共同約束"];
 o.institutional_culture=o.institutional_culture||"重視資格、紀錄、複核與可追責程序。";
 o.strategic_tension=o.strategic_tension||"研究自由、地方民生與事故風險之間長期需要協調。";
}

upsert("regional_content_profiles",{
 id:"RCP-BLT-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"藍塔高地",recommended_tier:"E～B",
 identity:"由高地塔院、鏡塔湖、觀測臺地、東界互市與藍塔隘共同構成的魔導王國。魔法資格影響仕途，但農民、工匠、商旅、水務與守備仍構成社會日常。",
 terrain:"冷涼高地、斷層湖盆、石質山脊、河源谷與東界草原過渡帶",
 common_exports:["捲軸與術具","研究服務","導晶砂","精密玻璃","高地藥材"],common_imports:["穀物","木材","皮革","一般金屬","燃料"],
 food_staples:["高地香草湯","湖魚奶燉","粗麥麵包","根菜燉肉"],recurring_risks:["研究事故","雷暴","冬季道路中斷","有限導晶礦枯竭","邊界商路波動"]
});
upsert("regional_economy_profiles",{
 id:"ECO-BLT-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["術具","捲軸","研究服務","導晶砂","藥材"],imports:["糧食","木材","皮革","普通鐵材","燃料"],
 notes:"高階術具與魔法材料不是無限商品；塔院資格、研究用途、商店庫存與區域資源配額共同限制供應。鏡塔湖與河源優先保障民生水務。"
});
const HOOKS=[
 {id:"HOOK-BLT-01",title:"搬運魔像越界",premise:"青階鎮的低階搬運構裝離開指定路線，先查控制符、貨單與最後維修紀錄，再決定是否直接破壞。",tier:"E"},
 {id:"HOOK-BLT-02",title:"銀藻採集爭議",premise:"鏡湖銀藻供應下降，藥師、漁民與研究院都聲稱需要配額，必須先查實際存量與湖岸生態。",tier:"D"},
 {id:"HOOK-BLT-03",title:"符脊坑道回響",premise:"封閉晶坑出現規律撞擊聲，礦務方要求確認是岩層、魔物還是舊構裝，而不是先假定有新礦脈。",tier:"D"},
 {id:"HOOK-BLT-04",title:"觀測臺斷訊",premise:"北部觀測臺在雷暴前失去聯絡，需要沿繫留柱與避雷棚逐段檢查。",tier:"C"},
 {id:"HOOK-BLT-05",title:"季市假術具",premise:"東界市出現冒用藍塔認證的低品質術具，關貿監需要查貨源、印記與實際功能。",tier:"D"},
 {id:"HOOK-BLT-06",title:"隘門舊警報",premise:"藍塔隘地下警戒符無故啟動，守備監要求先封閉路段，再確認是地震、構裝故障或真正入侵。",tier:"C"},
 {id:"HOOK-BLT-07",title:"沉塔水位",premise:"鏡湖沉塔附近水位與平常不同，水務公署只允許在確認湖況後進行調查。",tier:"C"},
 {id:"HOOK-BLT-08",title:"基座壓差",premise:"原初藍塔基座的封印監測值緩慢偏離正常範圍，只有具備多項前置資格的高階隊伍能進入深層查驗。",tier:"B"}
];
for(const h of HOOKS)upsert("regional_adventure_hooks",{...h,region_id:REGION_ID,polity_id:POLITY_ID});
const LIFE=[
 {id:"LIFE-BLT-01",name:"資格考季",text:"學徒與認證法師集中應試，青階鎮住宿、紙墨、低階藥劑與練習場需求上升。"},
 {id:"LIFE-BLT-02",name:"元素安全演練",text:"元素塔定期演練事故封鎖、疏散與跨塔支援，演練期間部分研究區暫停開放。"},
 {id:"LIFE-BLT-03",name:"鏡湖禁捕期",text:"水務公署依繁殖季限制捕撈，湖魚與銀藻市場庫存下降，但野外資源得以恢復。"},
 {id:"LIFE-BLT-04",name:"東界季市",text:"百族商隊與高地商旅集中進入東界市，皮革、牲畜、草原藥材與術具交易短期增加。"},
 {id:"LIFE-BLT-05",name:"觀星週",text:"北部觀測院集中發布可公開的天象與氣象紀錄，旅人與學者增加，但高階觀測儀器仍受管制。"},
 {id:"LIFE-BLT-06",name:"冬隘封路",text:"大雪或落石可能使藍塔隘部分道路暫停通行，隘門城會優先保留糧食、燃料與醫療物資。"}
];
for(const e of LIFE)upsert("regional_life_events",{...e,region_id:REGION_ID,polity_id:POLITY_ID});

for(const zone of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===zone.id).map(x=>x.id);
 const wilds=FIELDS.filter(x=>x.zoneId===zone.id).map(x=>x.id);
 const dungeons=DUNGEONS.filter(x=>x.zoneId===zone.id).map(x=>x.id);
 upsert("province_region_maps",{id:zone.province,layer:"province_region",name:zone.name,display_name:"藍塔魔導王國・"+zone.name,parent_realm_map_id:REALM_ID,
  political_entity_id:POLITY_ID,world_region_id:REGION_ID,world_tier:zone.tier,map_status:"playable_current",capital_location_id:zone.seat,
  all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:zone.role});
 upsert("settlement_region_maps",{id:zone.smap,name:zone.name+"區域圖",parent_province_region_id:zone.province,center_location_id:zone.seat,world_tier:zone.tier,
  map_status:"playable_current",location_ids:[...towns,...wilds,...dungeons],role:zone.role,blue_tower_zone_id:zone.id});
}
const realm=row("realm_region_maps",REALM_ID);
if(realm){
 realm.province_region_ids=ZONES.map(x=>x.province);realm.regional_centers=["藍塔城","鏡湖鎮","符脊鎮","星盤鎮","東界市","隘門城"];
 realm.map_status="playable_current";realm.notes="藍塔魔導王國分為中央塔城、鏡塔湖盆、西脊塔院、北部觀星、東界季市與藍塔隘源谷六個可遊玩區域；王國層級為B，但一般居民區與野外依實際威脅維持E～C，B級內容集中在受限深層。";
}
const region=row("world_regions",REGION_ID);
if(region)Object.assign(region,{map_status:"playable_current",recommended_tier:"B",playable_tier_band:"E～B",terrain:"高地、鏡塔湖、河源谷、石質山脊與法師塔群",
 regional_identity:"高階魔法制度與普通民生並存；塔院資格不等於居民戰力，區域威脅依地圖實際分級。"});
const polity=row("political_entities",POLITY_ID);
if(polity){
 Object.assign(polity,{
  capital:"藍塔城",map_status:"playable_current",secondary_centers:["鏡湖鎮","符脊鎮","星盤鎮","東界市","隘門城"],
  ruling_structure:"首席塔主主持塔主議會；各塔塔主、藍塔奧術院、元素塔議會與術式安全審議署分掌研究、教育、事故責任與塔域治理，地方民生由塔域執政官、水務、關貿與守備體系執行。",
  legal_tradition:"藍塔法令、塔規、學院章程、術式資格法、研究事故責任誓約與地方民生條例",
  identity:"魔法教育與術式資格影響身份與仕途，但國家運作同時依賴水務、工匠、農牧、商旅、礦務、守備與可追責的研究制度。",
  gameplay_role:"B級魔法強國／學院政治、研究事故、構裝、有限魔法資源、鏡湖民生與高地邊境探索",
  economic_base:["術具與捲軸","研究服務","有限導晶礦","精密工藝","鏡湖水產","高地藥材","東界互市"],
  military_structure:["塔界巡守隊","藍塔隘守備","塔域防禦構裝","各塔依法維持的防護法師隊"],
  current_tensions:["研究自由與事故監管","高階研究資源與民生配額","元素塔派系競爭","東界互市與邊境安全","導晶礦輪採與工坊需求"],
  internal_regions:ZONES.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier})),
  key_organization_ids:[...new Set([...(polity.key_organization_ids||[]),"ORG-BLT-CENSOR","ORG-BLT-OBS","ORG-BLT-WARDEN","ORG-BLT-CRAFT"])]
 });
}
const authority=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(authority){
 authority.office_nodes=Array.isArray(authority.office_nodes)?authority.office_nodes:[];
 const extra=[
  {id:"POL-011-O5",title:"議會書記長",authority_tier:"AUTH-4",authority_level:4,scope:"塔主議會議程、法令文本與跨塔執行追蹤",appointment:"首席塔主提名、塔主議會確認",rights:["AR-005","AR-007"],reports_to:"POL-011-O1",notes:"負責議決程序與法令一致性，不凌駕各塔研究權。"},
  {id:"POL-011-O6",title:"術式安全審議官",authority_tier:"AUTH-4",authority_level:4,scope:"禁術分級、重大研究事故與封鎖區",appointment:"塔主議會任命",rights:["AR-005","AR-007"],reports_to:"POL-011-O1",notes:"可依法中止高風險研究，但需留下可複核的事故與許可紀錄。"},
  {id:"POL-011-O7",title:"塔域執政官",authority_tier:"AUTH-3",authority_level:3,scope:"城市與各區公共行政",appointment:"地方塔主／議會任命",rights:["AR-003","AR-005"],reports_to:"POL-011-O2",notes:"處理市政、水務、道路、居民與地方公共秩序。"},
  {id:"POL-011-O8",title:"巡界監",authority_tier:"AUTH-3",authority_level:3,scope:"邊界、關隘、商路與高地巡守",appointment:"議會與地方守備共同任命",rights:["AR-003","AR-004"],reports_to:"POL-011-O1",notes:"不得以邊防名義干涉一般學術研究。"},
  {id:"POL-011-O9",title:"認證官／事故調查員",authority_tier:"AUTH-2",authority_level:2,scope:"法師資格與研究事故實地查核",appointment:"奧術院或安全審議署任命",rights:["AR-007"],reports_to:"POL-011-O3",notes:"只在授權範圍內查核，不具塔區統治權。"}
 ];
 for(const n of extra){const i=authority.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)authority.office_nodes[i]=n;else authority.office_nodes.push(n)}
 authority.rival_power_centers=["首席塔主與塔主議會","藍塔奧術院","元素塔議會","術式安全審議署","各地方塔主與民生行政"];
 authority.player_interaction_summary="低階玩家多接觸學舍、公會、地方水務、礦務、巡界與一般塔院；中階可進入元素塔、事故調查與受控研究區；B級原初藍塔與最高議政需要明確前置資格。";
}

const LORE=[
 {id:"LORE-BLT-01",category:"geography",title:"六大區域帶",text:"藍塔魔導王國以中央塔城、鏡塔湖盆、西脊塔院、北部觀星臺地、東界季市與藍塔隘源谷六個區域維持人口、研究、民生與邊防。"},
 {id:"LORE-BLT-02",category:"politics",title:"塔主議會不是法力排名",text:"首席塔主與各塔塔主的政治權力來自議會法統、塔域責任與資格制度；個人戰鬥力、冒險者階級與政治職位彼此獨立。"},
 {id:"LORE-BLT-03",category:"law",title:"藍塔法令的核心",text:"藍塔法令要求高風險研究留下責任人、方法、材料、事故處置與可複核紀錄；研究自由不能免除對城市與他人的責任。"},
 {id:"LORE-BLT-04",category:"society",title:"多數居民不是高階法師",text:"王國因魔法聞名，但農牧、水務、漁業、工匠、商旅、抄寫與一般服務人口仍占社會大多數；法師資格影響仕途，不代表人人具備高階戰力。"},
 {id:"LORE-BLT-05",category:"economy",title:"魔法材料也會短缺",text:"導晶砂、鐵晶、精密玻璃與高階術具受礦脈、工時、研究資格與市場庫存限制；藍塔不使用無限資源或無限商店供應。"},
 {id:"LORE-BLT-06",category:"environment",title:"鏡塔湖與赫薩爾河源頭",text:"鏡塔湖和赫薩爾河源谷是王國民生與下游交通的核心水源，水務優先級高於一般研究採樣，污染與過度採集會被追責。"},
 {id:"LORE-BLT-07",category:"border",title:"東界互市",text:"藍塔與泰爾瓦隆在高地—草原交界維持季節互市；雙方以界碑、商路與市集協議處理日常往來，而非把整條邊界視為永久戰場。"},
 {id:"LORE-BLT-08",category:"adventure",title:"B級區域不等於全圖B級",text:"藍塔魔導王國整體可接觸B級研究與地下城，但一般城鎮、農地與湖岸依實際風險維持E到C級；B級威脅主要集中在封鎖深層與原初藍塔基座。"}
];
for(const l of LORE)upsert("lore_records",{...l,scope_type:"polity",scope_id:POLITY_ID,verification:"recorded",era_id:"ERA-05",source_refs:[POLITY_ID,REGION_ID],tags:["藍塔","區域深化"],common_knowledge:l.category!=="adventure"});
if(polity){polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];for(const l of LORE)if(!polity.lore_record_ids.includes(l.id))polity.lore_record_ids.push(l.id)}

DB.content_link_index=DB.content_link_index||{};
DB.content_link_index.location_content=DB.content_link_index.location_content||{};
for(const l of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>loc(x.id)).filter(Boolean)){
 DB.content_link_index.location_content[l.id]={
  facility_ids:[...(l.facilities||[])],gather_item_ids:[...(l.gather||[])],fish_item_ids:[...(l.fish||[])],
  encounter_monster_ids:MONSTERS.filter(m=>(m.habitat||[]).includes(l.id)).map(m=>m.id),companion_species_ids:[],
  organization_ids:[...ORGS,row("world_organizations","ORG-077"),row("world_organizations","ORG-078")].filter(Boolean).filter(o=>o.base_location_id===l.id).map(o=>o.id),pantheon_ids:[]
 };
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
const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{});
const verify=verifyKeys.includes("verified")?"verified":(verifyKeys.includes("recorded")?"recorded":(verifyKeys[0]||"recorded"));
for(const l of LORE){const x=row("lore_records",l.id);if(x)x.verification=verify}
if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}

DB.blue_tower_kingdom={
 version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,
 playable_zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),
 monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:[...ORGS.map(x=>x.id),"ORG-077","ORG-078"],material_ids:ITEMS.map(x=>x.id),
 governance:{top:"首席塔主／塔主議會",research:"藍塔奧術院／元素塔議會",safety:"術式安全審議署",local:"塔域執政官／水務／關貿／巡界／守備"},
 tier_model:"王國B級；一般可遊玩區E～C；B級內容集中於受限深層與王國級研究設施。",save_compatible:true
};

function audit(){
 const issues=[];
 const p=row("political_entities",POLITY_ID),r=row("world_regions",REGION_ID),rm=row("realm_region_maps",REALM_ID);
 if(!p)issues.push("藍塔政治體缺失");else if(p.name!=="藍塔魔導王國")issues.push("藍塔政治體名稱失步");
 if(!r||r.map_status!=="playable_current")issues.push("REG-11未切換為可遊玩");
 if(!rm||rm.map_status!=="playable_current")issues.push("藍塔王國區域地圖未啟用");
 if(ZONES.length!==6)issues.push("藍塔可遊玩區域帶應為6");
 for(const z of ZONES){
  const pr=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);
  if(!pr)issues.push("缺少區域地圖:"+z.name);if(!sm)issues.push("缺少聚落區域圖:"+z.name);
  const ids=sm?.location_ids||[];
  if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺少城鎮:"+z.name);
  if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺少野外:"+z.name);
  if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺少地下城:"+z.name);
 }
 for(const id of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id)){
  const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}
  if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);
  for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to);
 }
 if(MONSTERS.length!==21)issues.push("藍塔區域怪物應為21種");
 for(const m0 of MONSTERS){
  const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}
  if(tierRank(m.tier)>tierRank("B"))issues.push("REG-11怪物超過B級:"+m.id);
  if(m.near_town_eligible&&tierRank(m.tier)>tierRank("E"))issues.push("城鎮近郊怪物超階:"+m.id);
  if(m.loot_profile?.fallback_policy!=="none")issues.push("怪物通用掉落fallback未關閉:"+m.id);
  for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落素材缺失:"+m.id+"->"+d.id);
 }
 if(NPCS.length!==18)issues.push("藍塔核心NPC應為18名");
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id);if(x&&tierRank(x.combat_tier_ceiling)>tierRank("B"))issues.push("NPC戰力上限超出王國層級:"+n.id)}
 for(const id of ORGS.map(x=>x.id))if(!row("world_organizations",id))issues.push("組織缺失:"+id);
 for(const id of ["ORG-077","ORG-078"])if(!(row("world_organizations",id)?.contact_location_ids||[]).some(x=>String(x).startsWith("L-BLT-")))issues.push("既有魔法組織未接入藍塔地點:"+id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
 for(const id of ["POL-011-O1","POL-011-O2","POL-011-O3","POL-011-O6","POL-011-O7","POL-011-O8"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(!DUNGEONS.some(x=>x.tier==="B")||!MONSTERS.some(x=>x.tier==="B"))issues.push("藍塔缺少受控B級內容");
 if(FIELDS.every(x=>tierRank(x.tier)>=tierRank("C")))issues.push("藍塔日常野外全部高階化");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
  stats:{zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length,b_tier_dungeons:DUNGEONS.filter(x=>x.tier==="B").length}};
}

DB.meta=DB.meta||{};
DB.meta.blue_tower_depth_revision=REV;
DB.blue_tower_kingdom.initial_audit=audit();
globalThis.runBlueTowerDepthAudit=audit;
globalThis.QUNLU_BLUE_TOWER=Object.freeze({version:REV,audit,zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/blue-tower-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();