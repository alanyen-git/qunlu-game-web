/* 群陸旅誌：灰刃自由都市完整區域深化 CURRENT-1.99.1
 * GRAY-BLADE-DEPTH-1.0
 * POL-009 / REG-09：武契議會、市政雙議軌、契約法、軍需工坊、城鎮、野外、地下城、怪物、NPC與地方循環。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.99.1")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.99.1";
const REV="GRAY-BLADE-DEPTH-1.0";
const POLITY_ID="POL-009",REGION_ID="REG-09",CULTURE_ID="CUL-009",REALM_ID="RMAP-POL-009";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const tierRank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(key){DB[key]=Array.isArray(DB[key])?DB[key]:[];return DB[key]}
function upsert(key,value,idKey="id"){const a=arr(key),i=a.findIndex(x=>x?.[idKey]===value[idKey]);if(i>=0)a[i]=value;else a.push(value);return value}
function row(key,id,idKey="id"){return (DB[key]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,hours){const from=loc(a);if(!from||!loc(b))return;from.links=Array.isArray(from.links)?from.links:[];const old=from.links.find(x=>x?.to===b);if(old)old.hours=hours;else from.links.push({to:b,hours})}
function twoWay(a,b,hours){addLink(a,b,hours);addLink(b,a,hours)}
function economy(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return {prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}
function town(x){return {id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:"灰刃自由都市",description:x.description,facilities:[...(x.facilities||[])],links:[],safety_score:x.safety??88,safety_label:x.safetyLabel||"安穩",risk:Math.max(2,100-(x.safety??88)),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,history_scope:"灰刃自由都市／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,local_authority:clone(x.authority),local_economy:clone(x.economy),gray_blade_zone_id:x.zoneId}}
function field(x){
 const ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{};
 const ep=clone(ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,allow_demons:false,allow_undead:!!x.allowUndead,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"open",preferred_monster_ids:[...(x.preferred||[])]});
 return {id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"灰刃自由都市",description:x.description,links:[],risk:x.risk??18,safety_score:x.safety??Math.max(20,100-(x.risk??18)),safety_label:x.safetyLabel||((x.risk??18)<=15?"安穩":(x.risk??18)<=25?"普通":(x.risk??18)<=35?"警戒":"危險"),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,gray_blade_zone_id:x.zoneId,tags:[...(x.tags||[])],gather:[...(x.gather||[])],mining:[...(x.mining||[])],woodcut:[...(x.woodcut||[])],fish:[...(x.fish||[])],hunt:[...(x.hunt||[])],explore:[...(x.explore||[])],encounter_profile:ep,resource_capacity:clone(x.resourceCapacity||{forage:14,hunt:8,ore:6}),resource_regen_hours:x.regen??48,hunt_requires_battle:true};
}
function dungeon(x){return field({...x,kind:"dungeon",zoneClass:"dungeon",space:x.space||"standard"})}

const ZONES=[
 {id:"GB-Z-01",name:"灰刃城核心區",tier:"C",province:"PROV-GB-01",smap:"SMAP-GB-01",seat:"L-GB-GRAYBLADE",role:"武契議會、市議堂、契約法院、冒險者與傭兵登記、主要工坊與中央市場"},
 {id:"GB-Z-02",name:"北灰脊工礦帶",tier:"D",province:"PROV-GB-02",smap:"SMAP-GB-02",seat:"L-GB-IRONPASS",role:"石材、鐵料、採石、山路守備與北向陸路"},
 {id:"GB-Z-03",name:"東白鐘河渡帶",tier:"D",province:"PROV-GB-03",smap:"SMAP-GB-03",seat:"L-GB-CROSSFORD",role:"河渡、農牧、糧運、橋稅與東北商路"},
 {id:"GB-Z-04",name:"南武契原",tier:"D",province:"PROV-GB-04",smap:"SMAP-GB-04",seat:"L-GB-CAMPMARCH",role:"傭兵團駐營、演訓、馬匹、皮革與南向道路前站"},
 {id:"GB-Z-05",name:"西三岔商路帶",tier:"D",province:"PROV-GB-05",smap:"SMAP-GB-05",seat:"L-GB-BLADECROSS",role:"車隊轉運、倉儲、修車、驛馬與西向商路"},
 {id:"GB-Z-06",name:"龍脊北麓前哨帶",tier:"C",province:"PROV-GB-06",smap:"SMAP-GB-06",seat:"L-GB-EMBERPOST",role:"火山灰原、礦路、南境警戒與龍脊非主權區接觸前線"}
];

const TOWNS=[
 {id:"L-GB-GRAYBLADE",name:"灰刃城",zoneId:"GB-Z-01",zone:"灰刃城核心區",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"C",size:"大型自由都市",safety:94,role:"灰刃自由都市首都與唯一主權中樞",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic","mageguild"],authority:{title:"武契議會／市議堂",tier:"AUTH-5"},economy:economy(88,"高度繁榮",["跨境傭兵契約","兵器護具修造","車隊轉運","旅宿","仲裁與登記服務"],["戰事季軍需價格波動","外來武裝人口管理成本高"],1.06,1.20,1.28,1.28),description:"位於白鐘河下游丘陵與南向大道交會處的自由都市。城內不是由單一傭兵團統治，而是由武契議會、市議堂、工坊與公民席共同維持契約法、市場秩序與對外防務。大型武裝團體必須登記責任人、兵力、武器與駐紮期限。"},
 {id:"L-GB-ARSENALWARD",name:"灰爐坊區",zoneId:"GB-Z-01",zone:"灰刃城核心區",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"D",size:"工坊衛星城區",safety:91,role:"兵器修造、護具、車具與軍需檢驗中心",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"軍需監／工坊席議員",tier:"AUTH-3"},economy:economy(82,"繁榮",["鍛造","裁縫護具","車具","修理","軍需檢驗"],["高階軍械依材料與執照限量","火災與粉塵風險"],1.04,1.18,1.19,1.15),description:"灰刃城外環的大型工坊街與倉場。工坊可接民用與合法武契訂單，但市政禁止未登記團體囤積攻城器材。"},
 {id:"L-GB-IRONPASS",name:"鐵隘鎮",zoneId:"GB-Z-02",zone:"北灰脊工礦帶",province:"PROV-GB-02",smap:"SMAP-GB-02",tier:"D",size:"山口工礦鎮",safety:89,role:"北灰脊採石、鐵料與山路檢查",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"北脊區監",tier:"AUTH-3"},economy:economy(69,"穩健",["石材","鐵礦","工具修造","山路服務"],["耕地少","雨季落石","高階礦材不在本區自然產出"],.99,1.03,1.02,1.01),description:"卡在灰脊低山口的工礦鎮，管理輪採礦場與採石區。礦脈以黑鐵以下常用材料為主，不會無限產出高階礦石。"},
 {id:"L-GB-CROSSFORD",name:"白橋鎮",zoneId:"GB-Z-03",zone:"東白鐘河渡帶",province:"PROV-GB-03",smap:"SMAP-GB-03",tier:"E",size:"河渡商鎮",safety:92,role:"白鐘河下游渡橋、磨坊與糧運",facilities:["inn","general","guild","blacksmith","alchemy","church","clinic"],authority:{title:"白橋河務官",tier:"AUTH-3"},economy:economy(72,"繁榮",["橋渡","麵粉","河魚","糧運","農具"],["春汛","橋面維修","軍需車隊會排擠民用運力"],.98,1.10,1.08,1.10),description:"白鐘河下游的重要石橋聚落，替灰刃城提供穀物、河魚與東向交通，也是外來武裝進城前常見的登記檢查點。"},
 {id:"L-GB-CAMPMARCH",name:"營原鎮",zoneId:"GB-Z-04",zone:"南武契原",province:"PROV-GB-04",smap:"SMAP-GB-04",tier:"D",size:"軍營服務鎮",safety:87,role:"合法傭兵團輪駐、馬匹、皮革與演訓補給",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"駐契監",tier:"AUTH-3"},economy:economy(74,"繁榮",["馬匹","皮革","乾糧","修具","傭兵服務"],["大型傭兵團輪替造成物價波動","演訓區有封鎖時段"],1.02,1.10,1.12,1.14),description:"城南大草原上的常設服務鎮，周圍營地由不同傭兵團輪流承租。駐契監負責核對兵力、武器、期限與違約責任。"},
 {id:"L-GB-REDBANNER",name:"赤旗驛",zoneId:"GB-Z-04",zone:"南武契原",province:"PROV-GB-04",smap:"SMAP-GB-04",tier:"E",size:"大道驛鎮",safety:84,role:"南向大道換馬、護衛集結與商旅補給",facilities:["inn","general","guild","blacksmith"],authority:{title:"南路驛長",tier:"AUTH-2"},economy:economy(60,"穩健",["驛馬","乾糧","護衛媒合","車具修理"],["龍脊灰季道路不穩","大型商隊造成短期缺貨"],1.01,.96,.95,1.00),description:"通往龍脊北麓前最後一座大型驛站，商隊會在此重新編組護衛與確認南路狀況。"},
 {id:"L-GB-BLADECROSS",name:"刃岔鎮",zoneId:"GB-Z-05",zone:"西三岔商路帶",province:"PROV-GB-05",smap:"SMAP-GB-05",tier:"E",size:"商路轉運鎮",safety:90,role:"西向車隊、倉儲與道路分流",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"三岔商路監",tier:"AUTH-3"},economy:economy(76,"繁榮",["倉儲","車隊","修車","護衛契約","西向貨運"],["雨季道路泥濘","盜匪會轉移到支線"],1.00,1.12,1.12,1.15),description:"三條陸路交叉的轉運鎮，倉庫與車場比民宅更醒目。商人可自行雇護衛，但必須使用登記契約。"},
 {id:"L-GB-EMBERPOST",name:"灰燼哨鎮",zoneId:"GB-Z-06",zone:"龍脊北麓前哨帶",province:"PROV-GB-06",smap:"SMAP-GB-06",tier:"D",size:"邊境前哨鎮",safety:80,role:"龍脊北麓警戒、礦路與救援前站",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"南境守備官",tier:"AUTH-4"},economy:economy(63,"穩健",["礦路服務","護送","火山玻璃","救援補給"],["火山灰季","非主權區風險","高階素材取得受地圖層級限制"],1.04,.94,.98,1.00),description:"建在南向緩坡的石牆前哨鎮，主要任務是觀察龍脊灰季、護送採礦車隊與救援誤入非主權區的人員。"}
];
for(const x of TOWNS)upsert("locations",town(x));

const FIELDS=[
 {id:"L-GB-ASHGATE",name:"灰門丘地",zoneId:"GB-Z-01",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"E",size:"城郊丘地",tags:["plains","hill"],zoneClass:"town_outskirts",template:"L-HILL",risk:11,gather:["I-HERB","I-BERRY"],hunt:["GB-MAT-006"],preferred:["MON-GB-001","MON-GB-002"],explore:[["灰門巡路",25],["低丘果叢",20],["舊演武樁",20],["雨水溝",20],["界碑",15]],description:"灰刃城東南外圍的低丘與農路，巡防密度高，主要威脅是小型野獸。"},
 {id:"L-GB-CONTRACTROAD",name:"武契大道外環",zoneId:"GB-Z-01",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"E",size:"大道外環",tags:["road","plains"],zoneClass:"town_outskirts",template:"L-LOWFIELD",risk:12,gather:["I-HERB"],hunt:["GB-MAT-006"],preferred:["MON-GB-002","MON-GB-003"],explore:[["契約公告柱",20],["車隊停靠場",25],["巡防哨",20],["舊石渠",20],["廢棄營位",15]],description:"大型傭兵與商隊進城前的外環大道，設有駐紮區、公告柱與登記點。"},
 {id:"L-GB-GRAYRIDGE",name:"北灰脊",zoneId:"GB-Z-02",province:"PROV-GB-02",smap:"SMAP-GB-02",tier:"D",size:"低山岩脊",tags:["mountain","hill"],zoneClass:"frontier",template:"L-HILL",risk:23,mining:["I-ORE-IRON","GB-MAT-004"],gather:["I-HERB"],hunt:["GB-MAT-007"],preferred:["MON-GB-006","MON-GB-007"],explore:[["灰岩稜線",25],["巡礦路",20],["廢石棚",20],["岩羊坡",20],["風口",15]],description:"灰刃北方低山岩脊，礦點小而分散，城府以輪採制度控制採掘。"},
 {id:"L-GB-QUARRYFIELDS",name:"黑石採場",zoneId:"GB-Z-02",province:"PROV-GB-02",smap:"SMAP-GB-02",tier:"E",size:"管理採石區",tags:["mountain","plains"],zoneClass:"frontier",template:"L-HILL",risk:16,mining:["GB-MAT-003","I-ORE-IRON"],preferred:["MON-GB-004","MON-GB-006"],explore:[["輪採坑",30],["石料坡",20],["吊架",20],["排水渠",15],["舊坑封條",15]],description:"供應城牆、道路與工坊的採石區，以季度配額分區開採。"},
 {id:"L-GB-WHITEBELLBANK",name:"白鐘河灘",zoneId:"GB-Z-03",province:"PROV-GB-03",smap:"SMAP-GB-03",tier:"E",size:"河岸濕地",tags:["water","plains"],zoneClass:"frontier",template:"L-RIVER",aquatic:true,risk:13,gather:["GB-MAT-001","I-MINT"],fish:["GB-MAT-005"],preferred:["MON-GB-003","MON-GB-008"],explore:[["蘆葦河灘",25],["橋下淺灣",25],["舊渡樁",20],["磨坊支渠",15],["洪水標",15]],description:"白橋上下游的河灘、蘆葦與磨坊支渠，春汛期間地形會改變。"},
 {id:"L-GB-EASTMEADOW",name:"東岸牧草地",zoneId:"GB-Z-03",province:"PROV-GB-03",smap:"SMAP-GB-03",tier:"F",size:"農牧平地",tags:["plains"],zoneClass:"town_outskirts",template:"L-LOWFIELD",risk:8,gather:["I-HERB","I-ROOT"],hunt:["GB-MAT-006"],preferred:["MON-GB-001","MON-GB-002"],explore:[["牧草田",30],["灌溉溝",20],["農棚",20],["小獸洞",15],["河堤路",15]],description:"白橋附近低風險農牧地，適合初階採集與小型獵物委託。"},
 {id:"L-GB-MUSTERPLAIN",name:"武契演訓原",zoneId:"GB-Z-04",province:"PROV-GB-04",smap:"SMAP-GB-04",tier:"D",size:"大草原演訓區",tags:["plains","road"],zoneClass:"frontier",template:"L-LOWFIELD",risk:19,gather:["I-HERB"],hunt:["GB-MAT-007"],preferred:["MON-GB-005","MON-GB-009"],explore:[["標旗演訓地",25],["騎隊繞場",20],["廢箭靶",20],["水槽",20],["臨時營壘",15]],description:"合法傭兵團使用的輪值演訓區，民間可通行區與封閉區以旗標區分。"},
 {id:"L-GB-SOUTHHEATH",name:"南路石楠荒地",zoneId:"GB-Z-04",province:"PROV-GB-04",smap:"SMAP-GB-04",tier:"D",size:"石楠荒地",tags:["plains","hill"],zoneClass:"frontier",template:"L-HILL",risk:24,gather:["GB-MAT-002","I-BERRY"],hunt:["GB-MAT-007"],preferred:["MON-GB-009","MON-GB-010"],explore:[["石楠坡",25],["舊營火圈",20],["商路石標",20],["乾溪",20],["狼徑",15]],description:"營原以南乾燥荒地，商路之外狼群與野豬活動較多。"},
 {id:"L-GB-CARAVANHILLS",name:"三岔車丘",zoneId:"GB-Z-05",province:"PROV-GB-05",smap:"SMAP-GB-05",tier:"E",size:"商路丘陵",tags:["road","hill"],zoneClass:"frontier",template:"L-HILL",risk:14,gather:["I-HERB","I-BERRY"],hunt:["GB-MAT-006"],preferred:["MON-GB-002","MON-GB-011"],explore:[["車轍丘",25],["換馬棚",20],["護衛石亭",20],["雨水池",20],["支線岔口",15]],description:"刃岔鎮西側起伏不大的丘陵，三條車路分流。"},
 {id:"L-GB-SALTWINDROAD",name:"鹽風南支路",zoneId:"GB-Z-05",province:"PROV-GB-05",smap:"SMAP-GB-05",tier:"D",size:"南西商路",tags:["road","plains"],zoneClass:"frontier",template:"L-LOWFIELD",risk:21,gather:["GB-MAT-002"],hunt:["GB-MAT-007"],preferred:["MON-GB-011","MON-GB-012"],explore:[["風蝕路碑",25],["低矮石牆",20],["商旅井",20],["廢車軸",20],["高坡望點",15]],description:"連接西方商路與南部鹽風丘的支線，風大且遮蔽物少。"},
 {id:"L-GB-EMBERFOOTHILLS",name:"灰燼北麓",zoneId:"GB-Z-06",province:"PROV-GB-06",smap:"SMAP-GB-06",tier:"D",size:"火山緩坡",tags:["mountain","hill"],zoneClass:"frontier",template:"L-HILL",risk:27,mining:["GB-MAT-008","I-ORE-IRON"],gather:["GB-MAT-009"],preferred:["MON-GB-013","MON-GB-014"],explore:[["火山灰坡",25],["玄武岩脊",20],["礦路標樁",20],["避灰石棚",20],["熱氣裂口",15]],description:"龍脊火山群北面的灰色緩坡，仍在灰刃巡防可達範圍內。"},
 {id:"L-GB-BLACKGLASSVALE",name:"黑玻璃谷",zoneId:"GB-Z-06",province:"PROV-GB-06",smap:"SMAP-GB-06",tier:"C",size:"火山谷地",tags:["mountain","volcanic"],zoneClass:"deep_wild",template:"L-HILL",risk:34,mining:["GB-MAT-008","GB-MAT-010"],gather:["GB-MAT-009"],preferred:["MON-GB-014","MON-GB-015","MON-GB-016"],explore:[["黑玻璃坡",25],["熔岩舊溝",20],["蒸氣孔",20],["倒塌礦棚",20],["南界警戒樁",15]],description:"靠近非主權龍脊地帶的高風險谷地，灰刃只維持北側巡邏線。"}
];
const DUNGEONS=[
 {id:"D-GB-OLDCISTERN",name:"灰刃舊蓄水層",zoneId:"GB-Z-01",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"E",size:"城市地下水道",tags:["dungeon","ruins","water"],archetype:"waterway_ruin",aquatic:true,risk:19,gather:["I-MUSHROOM"],fish:["GB-MAT-005"],preferred:["MON-GB-008","MON-GB-017"],explore:[["舊蓄水池",30],["石渠",25],["維修孔",20],["封閉支道",15],["沉積室",10]],description:"舊城區擴建後停用的蓄水層，市政定期委託清理水生魔物與堵塞物。"},
 {id:"D-GB-SEALEDARSENAL",name:"封存軍需庫",zoneId:"GB-Z-01",province:"PROV-GB-01",smap:"SMAP-GB-01",tier:"C",size:"地下軍需庫",tags:["dungeon","ruins"],archetype:"fortress_basement",risk:32,preferred:["MON-GB-018","MON-GB-019"],explore:[["驗印門",25],["器械廊",20],["乾燥庫",20],["構裝維修間",20],["深層封庫",15]],description:"前代戰爭後封存的城市軍需庫，只有契約法院與軍需監共同簽發許可時才開放深層。"},
 {id:"D-GB-SLATEMINE",name:"斷層舊礦坑",zoneId:"GB-Z-02",province:"PROV-GB-02",smap:"SMAP-GB-02",tier:"D",size:"舊鐵礦坑",tags:["dungeon","mine","cave"],archetype:"mine",risk:28,mining:["GB-MAT-004","I-ORE-IRON"],gather:["I-MUSHROOM"],preferred:["MON-GB-006","MON-GB-020"],explore:[["舊斜井",25],["排水槽",20],["木支架",20],["斷層面",20],["封閉深井",15]],description:"因斷層移動與排水成本停採的舊礦，外層仍由礦務官定期檢查。"},
 {id:"D-GB-DROWNEDTOLL",name:"沉沒舊稅關",zoneId:"GB-Z-03",province:"PROV-GB-03",smap:"SMAP-GB-03",tier:"D",size:"半淹石造關站",tags:["dungeon","ruins","water"],archetype:"waterway_ruin",aquatic:true,risk:25,fish:["GB-MAT-005"],preferred:["MON-GB-008","MON-GB-021"],explore:[["淹水大廳",25],["舊帳房",20],["橋墩暗室",20],["泥沙走廊",20],["河底缺口",15]],description:"白鐘河改道後被棄用的石造稅關，部分樓層沉入河床；洪水季不開放。"},
 {id:"D-GB-SIEGETUNNELS",name:"舊圍城坑道",zoneId:"GB-Z-04",province:"PROV-GB-04",smap:"SMAP-GB-04",tier:"D",size:"戰爭地道",tags:["dungeon","ruins"],archetype:"fortress_basement",risk:29,preferred:["MON-GB-010","MON-GB-018"],explore:[["舊壕溝口",25],["支撐坑道",20],["封石段",20],["棄置器械",20],["敵軍舊出口",15]],description:"歷史圍城戰留下的地下坑道，未測繪區可能有殘存陷阱與失效構裝。"},
 {id:"D-GB-CARAVANVAULT",name:"三岔地下貨窖",zoneId:"GB-Z-05",province:"PROV-GB-05",smap:"SMAP-GB-05",tier:"E",size:"地下倉窖",tags:["dungeon","ruins"],archetype:"warehouse_basement",risk:20,preferred:["MON-GB-004","MON-GB-017"],gather:["I-MUSHROOM"],explore:[["石階貨窖",30],["舊酒庫",20],["崩落隔牆",20],["鼠道",15],["封存契箱",15]],description:"舊商館群留下的地下貨窖，數座相連後形成迷宮，廢區由公會定期清理。"},
 {id:"D-GB-CINDERBASTION",name:"灰燼舊堡",zoneId:"GB-Z-06",province:"PROV-GB-06",smap:"SMAP-GB-06",tier:"C",size:"火山前線廢堡",tags:["dungeon","ruins","mountain"],archetype:"fortress",risk:36,preferred:["MON-GB-014","MON-GB-019","MON-GB-022"],mining:["GB-MAT-008"],explore:[["外牆缺口",25],["灰埋兵舍",20],["烽火塔",20],["地下補給室",20],["南門封鎖線",15]],description:"早期監視龍脊道路的前哨堡，火山灰災後廢棄，如今只開放北半部受控探索。"},
 {id:"D-GB-EMBERGALLERY",name:"赤熱岩廊",zoneId:"GB-Z-06",province:"PROV-GB-06",smap:"SMAP-GB-06",tier:"C",size:"天然熔岩洞",tags:["dungeon","cave","volcanic"],archetype:"natural_cave",risk:39,mining:["GB-MAT-010"],preferred:["MON-GB-015","MON-GB-016","MON-GB-022"],explore:[["冷卻熔岩管",25],["赤熱裂隙",20],["黑玻璃壁",20],["蒸氣廳",20],["深層斷口",15]],description:"黑玻璃谷下方的熔岩管與熱裂隙，只允許C級隊伍在有火山季情報時進入。"}
];
for(const x of FIELDS)upsert("locations",field(x));
for(const x of DUNGEONS)upsert("locations",dungeon(x));

const ROUTES=[
 ["L-GB-GRAYBLADE","L-GB-ARSENALWARD",.6],["L-GB-GRAYBLADE","L-GB-ASHGATE",.8],["L-GB-ASHGATE","L-GB-CONTRACTROAD",.8],["L-GB-GRAYBLADE","D-GB-OLDCISTERN",.5],["L-GB-ARSENALWARD","D-GB-SEALEDARSENAL",.6],
 ["L-GB-GRAYBLADE","L-GB-IRONPASS",4.5],["L-GB-IRONPASS","L-GB-GRAYRIDGE",1.3],["L-GB-IRONPASS","L-GB-QUARRYFIELDS",1.0],["L-GB-GRAYRIDGE","D-GB-SLATEMINE",1.4],
 ["L-GB-GRAYBLADE","L-GB-CROSSFORD",3.5],["L-GB-CROSSFORD","L-GB-WHITEBELLBANK",.8],["L-GB-CROSSFORD","L-GB-EASTMEADOW",.7],["L-GB-WHITEBELLBANK","D-GB-DROWNEDTOLL",1.1],
 ["L-GB-GRAYBLADE","L-GB-CAMPMARCH",3.8],["L-GB-CAMPMARCH","L-GB-REDBANNER",2.0],["L-GB-CAMPMARCH","L-GB-MUSTERPLAIN",1.0],["L-GB-REDBANNER","L-GB-SOUTHHEATH",1.2],["L-GB-MUSTERPLAIN","D-GB-SIEGETUNNELS",1.3],
 ["L-GB-GRAYBLADE","L-GB-BLADECROSS",4.0],["L-GB-BLADECROSS","L-GB-CARAVANHILLS",1.0],["L-GB-CARAVANHILLS","L-GB-SALTWINDROAD",1.6],["L-GB-BLADECROSS","D-GB-CARAVANVAULT",.6],
 ["L-GB-REDBANNER","L-GB-EMBERPOST",3.6],["L-GB-EMBERPOST","L-GB-EMBERFOOTHILLS",1.2],["L-GB-EMBERFOOTHILLS","L-GB-BLACKGLASSVALE",2.0],["L-GB-EMBERFOOTHILLS","D-GB-CINDERBASTION",1.5],["L-GB-BLACKGLASSVALE","D-GB-EMBERGALLERY",1.4]
];
for(const x of ROUTES)twoWay(x[0],x[1],x[2]);

const ITEMS=[
 ["GB-MAT-001","白鐘蘆芯","F",.08,7,"白鐘河灘常見植物纖維，可作繩結、填充與一般調劑輔料。"],["GB-MAT-002","鹽風石楠","E",.08,11,"南部乾燥丘地常見石楠，主要作香草與一般藥劑輔材。"],["GB-MAT-003","灰脊建築石","E",1.4,16,"北灰脊常見耐磨石材，供城牆、道路與工坊使用。"],["GB-MAT-004","灰脊鐵石","D",1.0,29,"北灰脊有限礦脈產出的含鐵礦石，採掘受輪採配額限制。"],["GB-MAT-005","白鐘河鱗","E",.15,14,"白鐘河魚與小型水獸的常用鱗材。"],["GB-MAT-006","草原小獸皮","F",.22,8,"城郊兔狐等小型獵物的普通皮料。"],["GB-MAT-007","荒原厚皮","D",.75,27,"南武契原與荒地中型獸類的耐磨皮料。"],["GB-MAT-008","黑玻璃片","D",.35,33,"火山玻璃碎片，可作切削、裝飾與部分術式基材。"],["GB-MAT-009","耐灰苦草","D",.10,22,"火山灰坡生長的苦味耐熱植物，不具直接治療效果。"],["GB-MAT-010","赤脈玄武石","C",1.2,64,"黑玻璃谷深處的含熱礦石，只在受控C級地點有限取得。"],["GB-MAT-011","契印銅片","E",.05,10,"報廢契約印記熔回的銅片，主要作工藝與文書封印材料。"],["GB-MAT-012","舊構裝齒片","D",.30,36,"舊軍需庫與圍城坑道構裝拆解出的標準齒片。"],["GB-MAT-013","火山甲殼","C",.80,62,"龍脊北麓大型甲獸的耐熱甲殼，只能由戰鬥掉落取得。"],["GB-MAT-014","灰刃軍械芯","C",.45,88,"封存軍需構裝的核心零件，屬受監管戰利品與研究材料。"]
].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],value:x[4],description:x[5]}));
const gatherable=new Set([...FIELDS,...DUNGEONS].flatMap(x=>[...(x.gather||[]),...(x.mining||[]),...(x.fish||[])]));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID,wild_gather_eligible:gatherable.has(x.id)});
DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
const civicSource=DB.content_link_index.item_sources["GB-MAT-011"]=DB.content_link_index.item_sources["GB-MAT-011"]||{};
for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])civicSource[k]=Array.isArray(civicSource[k])?civicSource[k]:[];
if(!civicSource.special_sources.includes("civic_recycling:L-GB-GRAYBLADE"))civicSource.special_sources.push("civic_recycling:L-GB-GRAYBLADE");

function mon(x){
 const drops=[...(x.drops||[])];
 return {id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:x.category||"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],hp:x.hp,attack:x.atk,defense:x.def,mdef:x.mdef??x.def,magicDefense:x.mdef??x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:1}))};
}
const MONSTERS=[
 {id:"MON-GB-001",name:"灰丘野兔",tier:"F",habitat:["L-GB-ASHGATE","L-GB-EASTMEADOW"],hp:25,atk:8,def:4,acc:68,damage:[2,5],scale:"small",drops:["GB-MAT-006"],near:true,description:"灰刃城郊與東岸草地常見的小型獵物。"},
 {id:"MON-GB-002",name:"商路赤狐",tier:"F",habitat:["L-GB-ASHGATE","L-GB-CONTRACTROAD","L-GB-EASTMEADOW","L-GB-CARAVANHILLS"],hp:29,atk:9,def:4,acc:72,init:13,damage:[2,6],scale:"small",drops:["GB-MAT-006"],near:true,description:"常在道路邊尋找小獸與商旅廢棄食物，通常避人。"},
 {id:"MON-GB-003",name:"河蘆蟹",tier:"F",habitat:["L-GB-WHITEBELLBANK","L-GB-CONTRACTROAD"],hp:28,atk:8,def:7,acc:65,damage:[2,5],scale:"small",tags:["aquatic"],drops:["GB-MAT-005"],near:true,description:"白鐘河灘常見的小型甲殼生物。"},
 {id:"MON-GB-004",name:"採場岩鼠",tier:"E",habitat:["L-GB-QUARRYFIELDS","D-GB-CARAVANVAULT"],hp:45,atk:13,def:7,acc:73,damage:[4,8],scale:"small",drops:[],near:true,description:"採石棚、貨窖與石縫中常見的大型岩鼠。"},
 {id:"MON-GB-005",name:"原野牧犬",tier:"E",habitat:["L-GB-MUSTERPLAIN"],hp:51,atk:16,def:8,acc:75,damage:[5,10],scale:"small",drops:[],near:true,description:"少數失散或野化的牧犬會在演訓原外圍結群。"},
 {id:"MON-GB-006",name:"灰脊岩羊",tier:"E",habitat:["L-GB-GRAYRIDGE","L-GB-QUARRYFIELDS","D-GB-SLATEMINE"],hp:58,atk:17,def:11,acc:69,damage:[6,11],drops:["GB-MAT-007"],description:"北灰脊常見的大型山羊，受驚時會以角撞擊。"},
 {id:"MON-GB-007",name:"灰脊野豬",tier:"D",habitat:["L-GB-GRAYRIDGE"],hp:98,atk:27,def:16,acc:70,damage:[9,18],drops:["GB-MAT-007"],description:"低山林坡中的大型野豬，對採礦者和運料牲畜具威脅。"},
 {id:"MON-GB-008",name:"白鐘水蜥",tier:"E",habitat:["L-GB-WHITEBELLBANK","D-GB-OLDCISTERN","D-GB-DROWNEDTOLL"],hp:54,atk:16,def:10,acc:71,damage:[5,10],element:"水",tags:["aquatic","wildlife"],drops:["GB-MAT-005"],description:"白鐘河支流與舊水道常見的半水棲蜥獸。"},
 {id:"MON-GB-009",name:"南原灰狼",tier:"D",habitat:["L-GB-MUSTERPLAIN","L-GB-SOUTHHEATH"],hp:92,atk:26,def:13,acc:78,damage:[9,17],drops:["GB-MAT-007"],description:"避開常設營地、活動於演訓原外圍的狼群。"},
 {id:"MON-GB-010",name:"荒地獠豬",tier:"D",habitat:["L-GB-SOUTHHEATH","D-GB-SIEGETUNNELS"],hp:106,atk:29,def:17,acc:70,damage:[10,19],drops:["GB-MAT-007"],description:"南路荒地大型野豬，偶爾進入舊坑道避雨。"},
 {id:"MON-GB-011",name:"車丘鬣犬",tier:"E",habitat:["L-GB-CARAVANHILLS","L-GB-SALTWINDROAD"],hp:55,atk:17,def:8,acc:76,damage:[5,11],drops:[],description:"會尾隨車隊尋找殘食，飢餓時可能襲擊落單牲畜。"},
 {id:"MON-GB-012",name:"鹽風角蜥",tier:"D",habitat:["L-GB-SALTWINDROAD"],hp:88,atk:24,def:19,acc:70,damage:[8,17],element:"地",drops:["GB-MAT-007"],description:"乾燥石灰丘地的厚鱗蜥獸。"},
 {id:"MON-GB-013",name:"灰坡火蜥",tier:"D",habitat:["L-GB-EMBERFOOTHILLS"],hp:95,atk:27,def:18,acc:72,damage:[9,18],element:"火",drops:["GB-MAT-008"],description:"活動於火山灰坡與暖岩附近的蜥獸。"},
 {id:"MON-GB-014",name:"玄武甲獸",tier:"D",habitat:["L-GB-EMBERFOOTHILLS","L-GB-BLACKGLASSVALE","D-GB-CINDERBASTION"],hp:121,atk:29,def:25,acc:67,damage:[10,20],element:"地",scale:"large",drops:["GB-MAT-013"],description:"龍脊北麓常見的大型厚甲獸。"},
 {id:"MON-GB-015",name:"黑玻璃獵蜥",tier:"C",habitat:["L-GB-BLACKGLASSVALE","D-GB-EMBERGALLERY"],hp:154,atk:37,def:22,acc:79,damage:[13,26],element:"火",drops:["GB-MAT-008"],description:"棲息黑玻璃谷深處的敏捷獵食者。"},
 {id:"MON-GB-016",name:"赤脈岩獸",tier:"C",habitat:["L-GB-BLACKGLASSVALE","D-GB-EMBERGALLERY"],hp:171,atk:39,def:31,acc:72,damage:[14,28],element:"地",scale:"large",drops:["GB-MAT-010"],description:"以熱岩與礦脈區為巢的大型岩質魔物。"},
 {id:"MON-GB-017",name:"舊渠硬殼蟲",tier:"E",habitat:["D-GB-OLDCISTERN","D-GB-CARAVANVAULT"],hp:56,atk:15,def:14,acc:66,damage:[5,9],tags:["invertebrate"],drops:[],description:"潮濕地下結構中常見的大型甲蟲。"},
 {id:"MON-GB-018",name:"舊式巡庫構裝",tier:"D",habitat:["D-GB-SEALEDARSENAL","D-GB-SIEGETUNNELS"],hp:110,atk:28,def:24,acc:73,damage:[10,20],tags:["construct"],drops:["GB-MAT-012"],description:"前代軍需設施留下的標準巡衛構裝。"},
 {id:"MON-GB-019",name:"重盾軍械構裝",tier:"C",habitat:["D-GB-SEALEDARSENAL","D-GB-CINDERBASTION"],hp:178,atk:37,def:34,acc:73,damage:[13,27],tags:["construct"],drops:["GB-MAT-014"],description:"封存軍需庫與舊堡的重型守衛構裝。"},
 {id:"MON-GB-020",name:"斷層石蜥",tier:"D",habitat:["D-GB-SLATEMINE"],hp:96,atk:25,def:20,acc:72,damage:[9,18],element:"地",drops:["GB-MAT-004"],description:"舊礦坑斷層帶棲息的厚鱗石蜥。"},
 {id:"MON-GB-021",name:"沉關河獸",tier:"D",habitat:["D-GB-DROWNEDTOLL"],hp:116,atk:28,def:20,acc:72,damage:[10,20],element:"水",scale:"large",tags:["aquatic"],drops:["GB-MAT-005"],description:"棲息淹水稅關深處的大型河獸。"},
 {id:"MON-GB-022",name:"灰堡熔甲獸",tier:"C",role:"首領候選",habitat:["D-GB-CINDERBASTION","D-GB-EMBERGALLERY"],hp:188,atk:41,def:32,mdef:27,acc:75,damage:[15,30],element:"火",scale:"large",drops:["GB-MAT-013","GB-MAT-010"],lootChance:.38,description:"在火山洞與舊堡深處活動的大型耐熱甲獸，是灰刃南境公開委託中的高階威脅之一。"}
];
for(const x of MONSTERS)upsert("monsters",mon(x));

const ORGS=[
 {id:"ORG-GB-WARPACT",name:"灰刃武契議會",kind:"government",tier:"C",base_location_id:"L-GB-GRAYBLADE",description:"主要武契團、市議席、工坊與公民代表共同處理城市防務、外來武裝登記、戰時總契約與對外安全協議。"},
 {id:"ORG-GB-CIVIC",name:"灰刃市議堂",kind:"government",tier:"C",base_location_id:"L-GB-GRAYBLADE",description:"主管稅務、道路、市場、公共工程、市籍與日常行政，與武契議會分掌民政與防務。"},
 {id:"ORG-GB-COURT",name:"契約仲裁院",kind:"civic",tier:"C",base_location_id:"L-GB-GRAYBLADE",description:"處理傭兵契約、商路護衛、違約、損害與跨團體仲裁。"},
 {id:"ORG-GB-ARSENAL",name:"灰爐軍需工坊聯席",kind:"craft",tier:"C",base_location_id:"L-GB-ARSENALWARD",description:"兵器、護具、車具與修造工坊的聯席組織，負責軍需規格、工期、材料與危險品存放規則。"},
 {id:"ORG-GB-ROAD",name:"三岔商路署",kind:"civic",tier:"D",base_location_id:"L-GB-BLADECROSS",description:"維護西向與南向商路、驛馬、橋涵、車隊登記與道路警訊。"},
 {id:"ORG-GB-RIVER",name:"白鐘河務會",kind:"civic",tier:"D",base_location_id:"L-GB-CROSSFORD",description:"管理橋渡、水磨、春汛、河岸工程與糧運時段。"},
 {id:"ORG-GB-WARDEN",name:"南境守備隊",kind:"military",tier:"C",base_location_id:"L-GB-EMBERPOST",description:"負責灰燼哨、龍脊北麓巡防、救援與南境警戒，不對龍脊非主權區宣稱統治。"},
 {id:"ORG-GB-MUSTER",name:"登記武契團聯絡會",kind:"mercenary",tier:"C",base_location_id:"L-GB-CAMPMARCH",description:"合法傭兵團的聯絡與自律平台，負責營位輪替、戰傷救助、失蹤回報與共同演訓協調。"}
];
const bonusByKind={government:{statusResist:3},civic:{carryCapacity:3},craft:{craft_success:2},military:{defense_pct:2},mercenary:{accuracy:3}};
for(const base of ORGS){
 const o=upsert("world_organizations",{...base,region_id:REGION_ID,political_entity_id:POLITY_ID});
 o.scope=o.tier==="C"?"kingdom":"local_regional";o.alignment="neutral";o.category=o.kind;o.primary_facility=o.kind==="craft"?"blacksmith":"guild";o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"灰刃職能會員訓練",effects:{...(bonusByKind[o.kind]||{perception:3})}};o.min_join_level=Math.max(1,Number(o.min_join_level)||1);o.join_reputation=Number(o.join_reputation)||0;o.visibility="public";o.legal_status="legal";o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;o.contact_location_ids=[...new Set([...(o.contact_location_ids||[]),o.base_location_id].filter(Boolean))];o.history=o.history?.length?o.history:["灰刃從戰時聚落轉型為自由都市後，將私人武裝、工坊、道路與仲裁需求逐步納入可登記、可追責的城市機構。"];o.history_summary=o.history.join(" ");o.current_state=o.current_state||"目前以維持城市中立、契約可信度與南東商路安全為首要目標。";o.signature=o.signature||"契約登記、責任可追溯與武裝權力受市法約束";o.distinctive_features=o.distinctive_features||[o.signature,"不以單一傭兵團控制整座城市","組織層級不等同成員個人戰力"];o.institutional_culture=o.institutional_culture||"重視書面契約、押印、責任人、物資清單與期限。";o.strategic_tension=o.strategic_tension||"武裝效率、商業自由與市民公共安全之間需要持續平衡。";
}

const NPCS=[
 ["NPC-GB-001","艾德琳・沃斯","武契議長","C","L-GB-GRAYBLADE","對外防務、武契團、總契約、城防與外交安全協議","C",["ORG-GB-WARPACT"],["城市主線","高階武契引介"],"由多方推舉的現任武契議長，堅持戰時權力必須有期限、責任人與可追查契約。"],
 ["NPC-GB-002","馬提亞斯・柯恩","市議長","C","L-GB-GRAYBLADE","民政、稅務、市籍、道路與市場","D",["ORG-GB-CIVIC"],["市政委託","市籍與市場資訊"],"主張灰刃必須先是一座能長期生活的城市，才是一個能僱傭軍隊的城市。"],
 ["NPC-GB-003","賽拉・諾恩","首席契約仲裁官","C","L-GB-GRAYBLADE","契約法、違約、護衛責任、損害與戰利品歸屬","E",["ORG-GB-COURT"],["契約仲裁","法律查詢"],"處理最棘手的武契與商約爭議，先查原件、見證、期限與交付條件。"],
 ["NPC-GB-004","布蘭・葛雷沃","軍需總監","C","L-GB-ARSENALWARD","兵器護具、軍需庫、危險品、工坊與封存構裝","D",["ORG-GB-ARSENAL"],["軍械鑑定","工坊委託"],"不允許以緊急軍令跳過材料、庫存和安全程序。"],
 ["NPC-GB-005","露西亞・海爾","冒險者公會灰刃館主","C","L-GB-GRAYBLADE","區域委託、地下城、怪物、收購與隊伍資格","C",[],["冒險者委託","收購櫃檯"],"把傭兵武契與冒險者委託嚴格區分，避免玩家被當成無限制私人軍隊。"],
 ["NPC-GB-006","托馬・韋德","北脊礦務官","D","L-GB-IRONPASS","輪採礦場、採石、礦路與坍塌","D",["ORG-GB-CIVIC"],["採礦配額","礦區委託"],"把礦場分成開採、養護與封閉區，拒絕讓市場需求突破安全上限。"],
 ["NPC-GB-007","米菈・芬奇","白橋河務官","D","L-GB-CROSSFORD","橋渡、春汛、糧運與水磨","E",["ORG-GB-RIVER"],["河務委託","糧運資訊"],"每次春汛前優先檢查橋墩、堤岸與磨坊支渠。"],
 ["NPC-GB-008","凱斯・羅恩","營原駐契監","D","L-GB-CAMPMARCH","傭兵團登記、營位、演訓、兵力與武器申報","C",["ORG-GB-MUSTER"],["武契登記","演訓委託"],"熟記各團最近一次申報兵力，對不願留下責任人的武裝團體特別警惕。"],
 ["NPC-GB-009","艾娜・莫爾","戰傷醫師","D","L-GB-CAMPMARCH","戰傷、營地衛生、撤離與康復","F",["ORG-GB-MUSTER"],["醫療","救護委託"],"把傭兵傷患視為需要長期照護的人，而不是消耗品。"],
 ["NPC-GB-010","柯爾・貝里","三岔商路監","D","L-GB-BLADECROSS","車隊、倉儲、護衛契約、西向道路與驛馬","D",["ORG-GB-ROAD"],["商路委託","道路情報"],"習慣用車轍、驛站紀錄和貨物交接時間判斷問題發生在哪一段。"],
 ["NPC-GB-011","娜迪亞・索爾","倉儲商會代表","D","L-GB-BLADECROSS","貨價、倉租、保管、短缺與車隊供需","F",["ORG-GB-ROAD"],["市場情報","倉儲委託"],"對戰事季的短期暴漲與真正供應不足分得很清楚。"],
 ["NPC-GB-012","霍恩・瓦克","南境守備官","C","L-GB-EMBERPOST","龍脊北麓、火山灰季、巡防、失蹤與救援","C",["ORG-GB-WARDEN"],["南境委託","警戒情報"],"把撤退路線與補水點看得和敵情同樣重要。"],
 ["NPC-GB-013","莉亞・佩斯","灰燼哨藥劑師","D","L-GB-EMBERPOST","火山灰、耐熱草、呼吸道刺激與野外調劑","F",["ORG-GB-WARDEN"],["藥草收購","調劑委託"],"明確說明耐灰苦草只是配方材料，不宣稱它本身能治療嚴重傷病。"],
 ["NPC-GB-014","尤利安・鐵槌","灰爐鍛造總匠","C","L-GB-ARSENALWARD","武器、護甲、車具、工時與材料","D",["ORG-GB-ARSENAL"],["鍛造","軍需檢驗"],"把每件裝備拆成材料、工時、熱處理和用途，不接受只靠名號提高等級。"],
 ["NPC-GB-015","菲歐娜・艾克","自由市民席代表","D","L-GB-GRAYBLADE","市籍、租屋、物價、居民申訴與公共安全","F",["ORG-GB-CIVIC"],["市民引介","民生委託"],"長期要求武契團承擔駐紮造成的損害、噪音與道路維修費。"],
 ["NPC-GB-016","德里克・凡恩","老兵仲介","D","L-GB-CAMPMARCH","退役傭兵、護衛工作、團隊信用與戰場傳聞","C",["ORG-GB-MUSTER"],["護衛媒合","老兵情報"],"只替有明確雇主、路線與報酬的工作介紹人手，不替匿名私鬥招兵。"],
 ["NPC-GB-017","伊莎・洛克","封庫書記官","D","L-GB-ARSENALWARD","舊軍需庫、庫存帳冊、印記與構裝維護紀錄","F",["ORG-GB-COURT","ORG-GB-ARSENAL"],["封庫檔案","文書委託"],"能從數十年前的庫存變更與驗印差異找出軍需失蹤時間點。"],
 ["NPC-GB-018","赫伯特・席恩","南路測路員","D","L-GB-REDBANNER","南向道路、火山灰、車輪負荷、橋涵與替代路線","E",["ORG-GB-ROAD"],["道路勘查","護送情報"],"每次南行都更新坡度、積灰、輪轍和可用水點，地圖比傳聞更可靠。"]
].map(x=>({id:x[0],name:x[1],role:x[2],tier:x[3],location_id:x[4],knowledge_scope:x[5],combat_tier_ceiling:x[6],organization_ids:x[7],services:x[8],description:x[9]}));
for(const n of NPCS)upsert("regional_npc_archetypes",{...n,region_id:REGION_ID,polity_id:POLITY_ID});

const DIALOGUES=[
 ["DIA-GB-001","NPC-GB-001","武契","兵力可以租用，城市的主權不能。總契約一定要寫明期限、責任與撤回條件。"],["DIA-GB-002","NPC-GB-002","市政","灰刃若只有武器和營地，不會撐過三個冬天。水、路、稅、市場才讓人真正留下來。"],["DIA-GB-003","NPC-GB-003","仲裁","先拿契約原件。誰承諾了什麼、何時交付、誰簽字，比酒館故事重要。"],["DIA-GB-004","NPC-GB-004","軍需","軍令不能讓鐵料憑空出現，也不能讓封存構裝跳過檢驗。"],["DIA-GB-005","NPC-GB-005","委託","討伐、護送、調查是冒險者委託；替私人團體打一場沒有市法授權的戰爭，不是。"],["DIA-GB-006","NPC-GB-006","礦務","礦坑今天多挖一層，明年可能就少一條能走的巷道。輪採不是浪費。"],["DIA-GB-007","NPC-GB-007","春汛","橋還在不代表能過重車。先量水位，再決定今天放多少糧車。"],["DIA-GB-008","NPC-GB-008","駐契","把兵力、武器、營位和離城日寫清楚，我就能讓你進營原。"],["DIA-GB-009","NPC-GB-010","商路","失蹤一輛車不一定是盜匪；先問它最後在哪個驛站換過馬。"],["DIA-GB-010","NPC-GB-012","南境","火山灰落得厚時，不打仗也能死人。護目、補水、撤路先準備。"],["DIA-GB-011","NPC-GB-014","鍛造","好裝備是材料和工序做出來的，不是名字喊得夠大聲。"],["DIA-GB-012","NPC-GB-015","市民","武契團租的是營地，不是整條街。弄壞路面就該照契約修。"]
];
for(const d of DIALOGUES)upsert("npc_dialogues",{id:d[0],speaker_id:d[1],topic:d[2],text:d[3],region_id:REGION_ID});

const HOOKS=[
 ["HOOK-GB-01","消失的押印副本","一份大型護衛契約的市政副本與傭兵團副本出現差異，需要追查書記、印記與修改時間。","D"],["HOOK-GB-02","春汛橋限載","白橋水位暴漲，糧車仍排隊要求過橋；玩家需協助查橋墩、分流車隊與清理河獸。","E"],["HOOK-GB-03","越界採礦","北灰脊封養坑出現新車轍，礦務官要求查明是誤入、偷採還是偽造配額。","D"],["HOOK-GB-04","演訓失蹤隊","一支登記傭兵小隊在演訓原失聯，駐契監先要求核對最後旗位與坑道入口。","D"],["HOOK-GB-05","三岔空車","數輛空貨車準時抵達刃岔鎮，但貨物與護衛在前一站後失去紀錄。","D"],["HOOK-GB-06","舊軍需庫驗印異常","封存軍需庫的一枚驗印比帳冊記錄晚了二十年，仲裁院與軍需監共同要求調查。","C"],["HOOK-GB-07","灰季救援","龍脊北麓突發火山灰，南境守備隊需要護送採礦工與商隊撤回灰燼哨。","D"],["HOOK-GB-08","黑玻璃谷甲獸","玄武甲獸群改變遷徙路線，可能與熱裂隙擴大有關，而不是單純數量暴增。","C"],["HOOK-GB-09","違約的勝利","一支武契團完成討伐卻造成超出授權範圍的民宅損失，契約法院需要現場證據與責任判定。","C"],["HOOK-GB-10","退役名冊","老兵仲介發現有人利用已退役傭兵身分重複領取護衛預付款，玩家需核對名冊與實際行蹤。","D"]
].map(x=>({id:x[0],title:x[1],premise:x[2],tier:x[3]}));
for(const h of HOOKS)upsert("regional_adventure_hooks",{...h,region_id:REGION_ID,polity_id:POLITY_ID});

const LIFE=[
 ["LIFE-GB-01","武契登記季","大型傭兵團更新年度登記，營原與灰刃城的文書、住宿、修具需求上升。"],["LIFE-GB-02","春汛限載","白橋按水位限制重車過橋，糧運與軍需需要分時通行。"],["LIFE-GB-03","北脊輪採交接","礦區切換開採與封養分區，部分礦材供應下降、道路維護需求上升。"],["LIFE-GB-04","南路灰季","火山灰增加，灰燼哨提高補水、護目與道路勘查需求，黑玻璃谷可能暫時封閉。"],["LIFE-GB-05","三岔商旅會","西向與南向車隊集中轉運，旅宿與護衛需求上升，但道路與倉儲容易飽和。"],["LIFE-GB-06","退役結算期","一批季節性傭兵契約結束，仲裁、醫療、退役安置與短期工作媒合增加。"],["LIFE-GB-07","城市總點驗","武契議會與市議堂共同點驗城防物資，不代表全面動員；不合格裝備會退回工坊。"],["LIFE-GB-08","道路修繕月","灰刃優先修補被重車與營地使用損壞的道路，部分區段改道並提高車隊行程時間。"]
].map(x=>({id:x[0],name:x[1],text:x[2]}));
for(const e of LIFE)upsert("regional_life_events",{...e,region_id:REGION_ID,polity_id:POLITY_ID});

const LORE=[
 ["LORE-GB-01","history","灰刃城的自由化","灰刃最初是軍路與商路交會的武裝聚落。長期戰事結束後，居民把臨時軍令改造成有期限、有登記、有仲裁的武契制度，城市逐步形成自由都市。"],["LORE-GB-02","politics","雙議軌治理","武契議會掌防務、外來武裝與總契約；市議堂掌民政、稅務、市場與公共工程。重大戰時稅與長期動員需要雙方共同同意。"],["LORE-GB-03","law","契約不能高於市法","私人契約可約定報酬、期限、護衛與損害責任，但不能合法化綁架、私刑、無授權徵收或對市民的任意暴力。"],["LORE-GB-04","military","傭兵城市不等於傭兵統治","灰刃有大量傭兵與武裝工坊，但主權屬自由都市本身。任何武契團的駐紮、招募與武器存放都受登記與期限限制。"],["LORE-GB-05","economy","戰事季的價格","大型護衛或邊境衝突會提高鐵料、皮革、乾糧、馬匹與旅宿需求，但市場庫存仍受實際產地、道路與工期限制。"],["LORE-GB-06","geography","灰刃的十字路口","REG-09位於中央核心、凡雷克方向、鐵旗邊原、龍脊火山群與西向自由城盟商路之間；繁榮主要來自陸路節點。"]
].map(x=>({id:x[0],category:x[1],title:x[2],text:x[3],scope_type:"polity",scope_id:POLITY_ID,verification:"recorded",era_id:"ERA-05",source_refs:[POLITY_ID,REGION_ID],tags:["灰刃自由都市"],common_knowledge:true}));
for(const l of LORE)upsert("lore_records",{...l,region_id:REGION_ID,political_entity_id:POLITY_ID});
DB.lore_query_index=DB.lore_query_index&&typeof DB.lore_query_index==="object"?DB.lore_query_index:{};
const loreIndexKey="polity:"+POLITY_ID;
DB.lore_query_index[loreIndexKey]=Array.isArray(DB.lore_query_index[loreIndexKey])?DB.lore_query_index[loreIndexKey]:[];
for(const l of LORE)if(!DB.lore_query_index[loreIndexKey].includes(l.id))DB.lore_query_index[loreIndexKey].push(l.id);

upsert("regional_content_profiles",{id:"RCP-GB-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"灰刃自由都市",recommended_tier:"F～C",identity:"以契約可信度、傭兵登記、軍需工坊與陸路轉運維持繁榮的C級自由都市。武裝力量很多，但任何私人武力都必須受市法、契約法院與駐紮規則約束。",terrain:"白鐘河下游、東南丘陵、南向草原、灰脊低山與龍脊北麓火山緩坡",common_exports:["兵器與護具修造","車具","護衛服務","石材","皮革","陸路轉運"],common_imports:["糧食","優質木材","高階礦材","海產","稀有藥材"],food_staples:["黑麥餅","燉豆","鹽肉","河魚","洋蔥湯"],recurring_risks:["戰事季軍需擠壓民用市場","春汛","商路伏擊","傭兵團違約","火山灰季"]});
upsert("regional_economy_profiles",{id:"ECO-GB-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["軍需修造","護衛服務","石材","皮革","車具","轉運服務"],imports:["糧食","木材","高階礦材","海產","稀有藥材"],notes:"灰刃不是無限軍需市場。工坊產能、礦石、皮革、馬匹、道路與倉儲都有上限；大型武契會推高局部需求，也可能讓民用商品短期缺貨。"});

for(const zone of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===zone.id).map(x=>x.id),wilds=FIELDS.filter(x=>x.zoneId===zone.id).map(x=>x.id),dungeons=DUNGEONS.filter(x=>x.zoneId===zone.id).map(x=>x.id);
 upsert("province_region_maps",{id:zone.province,layer:"province_region",name:zone.name,display_name:"灰刃自由都市・"+zone.name,parent_realm_map_id:REALM_ID,political_entity_id:POLITY_ID,world_region_id:REGION_ID,world_tier:zone.tier,map_status:"playable_current",capital_location_id:zone.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:zone.role});
 upsert("settlement_region_maps",{id:zone.smap,name:zone.name+"區域圖",parent_province_region_id:zone.province,center_location_id:zone.seat,world_tier:zone.tier,map_status:"playable_current",location_ids:[...towns,...wilds,...dungeons],role:zone.role,gray_blade_zone_id:zone.id});
}
let realm=row("realm_region_maps",REALM_ID);
if(!realm)realm=upsert("realm_region_maps",{id:REALM_ID,layer:"realm_region",political_entity_id:POLITY_ID,world_region_id:REGION_ID,name:"灰刃自由都市區域圖",world_tier:"C",map_status:"playable_current"});
realm.province_region_ids=ZONES.map(x=>x.province);realm.regional_centers=["灰刃城","灰爐坊區","鐵隘鎮","白橋鎮","營原鎮","刃岔鎮","灰燼哨鎮"];realm.map_status="playable_current";realm.notes="灰刃分為城市核心、北灰脊、白鐘河渡、南武契原、西三岔商路與龍脊北麓六大玩法區。整體C級；日常城郊F～E，D級集中於邊郊與一般地下城，C級集中於封存軍需與龍脊北麓深層。";

const region=row("world_regions",REGION_ID);
if(region)Object.assign(region,{map_status:"playable_current",recommended_tier:"C",playable_tier_band:"F～C",terrain:"白鐘河下游丘陵、南向草原、北灰脊與龍脊北麓火山緩坡",regional_identity:"以灰刃城為核心的陸路自由都市圈；傭兵、工坊與商隊密集，但私人武裝受契約登記、市法與駐紮期限約束。"});
const polity=row("political_entities",POLITY_ID);
if(polity)Object.assign(polity,{name:"灰刃自由都市",government_type:"自由都市",capital:"灰刃城",map_status:"playable_current",world_tier:"C",current_title:"武契議長",secondary_centers:["灰爐坊區","鐵隘鎮","白橋鎮","營原鎮","刃岔鎮","灰燼哨鎮"],ruling_structure:"武契議會處理防務、外來武裝、傭兵總契約與對外安全協議；市議堂處理民政、稅務、市場、市籍與公共工程；契約仲裁院獨立處理違約、損害與跨團體爭議。長期動員、戰時特別稅與城防總契約需雙議軌共同授權。",legal_tradition:"自由都市章程、武契法、商路護衛契約、工坊規章、仲裁判例與市民法",identity:"位於大陸東南內陸交通節點的C級自由都市，以可信契約、可追責的私人武力、軍需修造與跨境陸路轉運聞名；它不是任何傭兵團的私人領地。",gameplay_role:"C級自由都市／傭兵契約、冒險者委託、軍需工坊、商路護衛、仲裁調查與龍脊北麓探索",economic_base:["軍需修造","商路轉運","護衛契約","石材與鐵料","旅宿","馬匹與車具"],military_structure:["城市守備","登記武契團","南境守備隊","緊急市民守望","工坊軍需支援"],current_tensions:["武契議會與市議堂權限平衡","傭兵團自主與公共安全","戰事季軍需擠壓民生","南境龍脊風險","跨境商路責任"],citizenship_model:{full_citizen:"自由市民具完整市籍與依法參與市政的權利",registered_mercenary:"登記傭兵可依法受僱與駐紮，但不因持武自動取得市政權",resident:"登記居民受市法保護並履行居住與納稅義務",honorary:"榮譽市民不自動取得投票或武契議席"},contract_rules:["私人契約不得凌駕市法","大型武裝團體必須登記責任人、兵力、武器與駐紮期限","戰利品歸屬須依任務與契約條款","對市民與公共設施造成的超額損害須負賠償責任","緊急動員必須有期限並接受事後仲裁與帳目審核"],internal_regions:ZONES.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier})),key_organization_ids:[...new Set([...(polity.key_organization_ids||[]),...ORGS.map(x=>x.id)])]});

const authority=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(authority){
 authority.office_nodes=Array.isArray(authority.office_nodes)?authority.office_nodes:[];
 const extra=[
  {id:"POL-009-D1",title:"武契議長",authority_tier:"AUTH-5",authority_level:5,scope:"防務、對外安全協議、武契團登記與城市總契約",appointment:"主要武契團、市議席與工坊代表依法推舉",rights:["AR-003","AR-004","AR-005"],reports_to:null,notes:"不是軍閥終身職；任期、罷免與權限受城市章程限制。"},
  {id:"POL-009-D2",title:"市議長",authority_tier:"AUTH-5",authority_level:5,scope:"民政、財政、市場、市籍、道路與公共工程",appointment:"市議會選舉",rights:["AR-003","AR-005","AR-007"],reports_to:null,notes:"與武契議長平行，重大動員與特別稅需共同授權。"},
  {id:"POL-009-D3",title:"首席契約仲裁官",authority_tier:"AUTH-4",authority_level:4,scope:"契約、損害、違約、戰利品與跨團體仲裁",appointment:"市議堂與武契議會共同提名、仲裁席確認",rights:["AR-005","AR-007"],reports_to:null},
  {id:"POL-009-D4",title:"軍需總監",authority_tier:"AUTH-3",authority_level:3,scope:"軍需規格、封存庫、危險品與大型工坊採購",appointment:"市議堂任命並受武契議會監督",rights:["AR-003","AR-005"],reports_to:"POL-009-D2"},
  {id:"POL-009-D5",title:"區監／河務官／商路監",authority_tier:"AUTH-3",authority_level:3,scope:"地方道路、橋渡、礦務、營地與市場行政",appointment:"市議堂依法任命",rights:["AR-003","AR-005"],reports_to:"POL-009-D2"},
  {id:"POL-009-D6",title:"駐契監",authority_tier:"AUTH-3",authority_level:3,scope:"傭兵團營位、兵力、武器與期限登記",appointment:"武契議會任命",rights:["AR-003","AR-004"],reports_to:"POL-009-D1"},
  {id:"POL-009-D7",title:"南境守備官",authority_tier:"AUTH-4",authority_level:4,scope:"龍脊北麓巡防、救援與灰燼哨防務",appointment:"武契議會提名、市議堂確認預算",rights:["AR-003","AR-004"],reports_to:"POL-009-D1"},
  {id:"POL-009-D8",title:"工坊席／武契席／市民席議員",authority_tier:"AUTH-3",authority_level:3,scope:"依席次參與市政、軍需或武契規則制定",appointment:"依城市章程由合法選區或團體推派／選舉",rights:["AR-005","AR-007"],reports_to:null}
 ];
 for(const n of extra){const i=authority.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)authority.office_nodes[i]=n;else authority.office_nodes.push(n)}
 authority.rival_power_centers=["武契議會","市議堂","契約仲裁院","灰爐工坊聯席","登記武契團","商路與河務機構"];
 authority.player_interaction_summary="低階玩家接觸城郊採集、白橋河務、商路護衛與公會委託；D級可接觸礦區、傭兵營地與舊坑道；C級封存軍需庫、黑玻璃谷與高階武契需要聲望、許可或明確契約前置。";
}

DB.gray_blade_free_city={version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,playable_zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),material_ids:ITEMS.map(x=>x.id),governance:{top:"武契議會＋市議堂雙議軌",judicial:"契約仲裁院",defense:"城市守備＋登記武契團＋南境守備隊",local:"區監／河務官／商路監／駐契監"},tier_model:"自由都市C級；一般生活與新手周邊F～E；D級集中於邊郊與一般地下城；C級集中於封存軍需與龍脊北麓深層。",save_compatible:true};

function audit(){
 const issues=[],p=row("political_entities",POLITY_ID),r=row("world_regions",REGION_ID),rm=row("realm_region_maps",REALM_ID);
 if(!p)issues.push("灰刃政治體缺失");else if(p.name!=="灰刃自由都市")issues.push("灰刃政治體名稱失步");
 if(p&&p.capital!=="灰刃城")issues.push("灰刃首都名稱失步");
 if(!r||r.map_status!=="playable_current")issues.push("REG-09未切換為可遊玩");
 if(!rm||rm.map_status!=="playable_current")issues.push("灰刃區域地圖未啟用");
 if(ZONES.length!==6)issues.push("灰刃可遊玩區域應為6");if(TOWNS.length!==8)issues.push("灰刃城鎮應為8");if(FIELDS.length!==12)issues.push("灰刃野外應為12");if(DUNGEONS.length!==8)issues.push("灰刃地下城應為8");
 for(const z of ZONES){const pr=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pr)issues.push("缺少區域地圖:"+z.name);if(!sm)issues.push("缺少聚落區域圖:"+z.name);const ids=sm?.location_ids||[];if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺城鎮:"+z.name);if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺野外:"+z.name);if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺地下城:"+z.name)}
 for(const id of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 if(MONSTERS.length!==22)issues.push("灰刃怪物應為22種");
 for(const m0 of MONSTERS){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(tierRank(m.tier)>tierRank("C"))issues.push("REG-09怪物超過C級:"+m.id);if(m.near_town_eligible&&tierRank(m.tier)>tierRank("E"))issues.push("城鎮近郊怪物超階:"+m.id);if(m.loot_profile?.fallback_policy!=="none")issues.push("怪物通用掉落fallback未關閉:"+m.id);if(!(m.habitat||[]).some(id=>loc(id)))issues.push("怪物棲地缺失:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落素材缺失:"+m.id+"->"+d.id)}
 if(NPCS.length!==18)issues.push("灰刃核心NPC應為18名");
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id);if(x&&tierRank(x.combat_tier_ceiling)>tierRank("C"))issues.push("NPC戰力超過灰刃上限:"+n.id)}
 for(const o of ORGS)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);for(const id of ["POL-009-D1","POL-009-D2","POL-009-D3","POL-009-D4","POL-009-D6","POL-009-D7"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(!DUNGEONS.some(x=>x.tier==="C")||!MONSTERS.some(x=>x.tier==="C"))issues.push("灰刃缺少受控C級內容");
 if(!FIELDS.some(x=>x.tier==="F"))issues.push("灰刃缺少F級日常野外");
 if((p?.government_type||"")!=="自由都市")issues.push("灰刃政體應為自由都市");
 if(!String(p?.ruling_structure||"").includes("武契議會")||!String(p?.ruling_structure||"").includes("市議堂"))issues.push("灰刃雙議軌治理描述缺失");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length,c_tier_dungeons:DUNGEONS.filter(x=>x.tier==="C").length}};
}
DB.meta=DB.meta||{};DB.meta.gray_blade_depth_revision=REV;DB.gray_blade_free_city.initial_audit=audit();
globalThis.runGrayBladeDepthAudit=audit;
globalThis.QUNLU_GRAY_BLADE=Object.freeze({version:REV,audit,zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/gray-blade-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();