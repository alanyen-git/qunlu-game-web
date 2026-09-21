/* 群陸旅誌：泰爾瓦隆百族部落完整區域深化 CURRENT-1.96.4
 * TYERVALON-DEPTH-1.0
 * POL-014 / REG-14：百族會盟、政治結構、六大地帶、城鎮、野外、地下城、怪物、NPC與地方循環。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.96.4")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.96.4";
const REV="TYERVALON-DEPTH-1.0";
const POLITY_ID="POL-014",REGION_ID="REG-14",CULTURE_ID="CUL-014",REALM_ID="RMAP-POL-014";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(k){DB[k]=Array.isArray(DB[k])?DB[k]:[];return DB[k]}
function upsert(k,r,idKey="id"){const a=arr(k),i=a.findIndex(x=>x?.[idKey]===r[idKey]);if(i>=0)a[i]=r;else a.push(r);return r}
function row(k,id,idKey="id"){return (DB[k]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function link(a,b,h){const x=loc(a);if(!x||!loc(b))return;x.links=Array.isArray(x.links)?x.links:[];const old=x.links.find(e=>e?.to===b);if(old)old.hours=h;else x.links.push({to:b,hours:h})}
function twoWay(a,b,h){link(a,b,h);link(b,a,h)}
function eco(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return{prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}

const TRIBES=[
 {id:"TV-TRIBE-01",name:"赤鬃部",totem:"赤鬃獅",people:"獸族、人類與混居氏族",territory:"南麓赤坡",specialty:["重步戰團","皮革","山麓放牧"]},
 {id:"TV-TRIBE-02",name:"青角部",totem:"青角巨鹿",people:"半獸人、獸族與草原人類",territory:"西關風門",specialty:["關隘守備","馱獸","商路護衛"]},
 {id:"TV-TRIBE-03",name:"岩牙部",totem:"岩牙野豬",people:"半獸人、山地人類與矮人客族",territory:"南麓石地",specialty:["築壘","採石","盾陣"]},
 {id:"TV-TRIBE-04",name:"白羽部",totem:"白羽鷹",people:"人類、鳥族與邊境混居族群",territory:"東岸雷台",specialty:["斥候","遠射","傳訊"]},
 {id:"TV-TRIBE-05",name:"河蹄部",totem:"河蹄鹿",people:"人類、獸族與河谷氏族",territory:"季流河谷",specialty:["渡運","水源管理","牧草"]},
 {id:"TV-TRIBE-06",name:"燼爪部",totem:"燼爪蜥",people:"蜥族、獸族與南麓居民",territory:"龍脊北麓",specialty:["耐熱採集","山洞踏查","火地工藝"]},
 {id:"TV-TRIBE-07",name:"霧狐部",totem:"霧尾狐",people:"人類、獸族與林緣氏族",territory:"林緣霧谷",specialty:["藥草","追蹤","林地協商"]},
 {id:"TV-TRIBE-08",name:"黑槲部",totem:"黑槲樹",people:"多族薩滿家系與林緣住民",territory:"霧槲林緣",specialty:["祖火祭儀","木作","口述史"]},
 {id:"TV-TRIBE-09",name:"金羚部",totem:"金角羚",people:"草原人類、獸族與遊牧氏族",territory:"北泉草海",specialty:["畜牧","皮毛","季節遷牧"]},
 {id:"TV-TRIBE-10",name:"風蛇部",totem:"長風蛇",people:"多族馴獸師與商旅氏族",territory:"會盟心原",specialty:["馴獸","車隊","情報傳遞"]},
 {id:"TV-TRIBE-11",name:"灰狼部",totem:"灰原狼",people:"獸族、人類與獵戶氏族",territory:"北泉與西關之間",specialty:["巡獵","邊境警戒","野外救援"]},
 {id:"TV-TRIBE-12",name:"星鹿部",totem:"星角鹿",people:"多族記錄官、調停者與牧民氏族",territory:"會盟心原",specialty:["會盟記錄","調停","季節曆"]}
];
const ZONES=[
 {id:"TV-ZONE-01",name:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",tier:"C",seat:"L-TV-GREATCAMP",type:"共同會盟地",identity:"政治、互市與共同誓約核心；土地不歸單一部族。",economy:["會盟服務","牲畜交易","工藝","跨境商貿"],risks:["會盟季物價波動","跨部爭議"]},
 {id:"TV-ZONE-02",name:"西關風門",province:"PROV-TV-02",smap:"SMAP-TV-02",tier:"D",seat:"L-TV-WESTGATE",type:"邊境關隘與互市帶",identity:"東北百族商道進入泰爾瓦隆的主要門戶。",economy:["關市","護衛","馱運","修具"],risks:["商路劫掠","強風封道","跨境摩擦"]},
 {id:"TV-ZONE-03",name:"北泉草海",province:"PROV-TV-03",smap:"SMAP-TV-03",tier:"D",seat:"L-TV-SPRINGRING",type:"泉地牧區",identity:"分散泉眼串成的北部牧區；水權與輪牧是治理核心。",economy:["牧畜","皮革","乳酪","藥草"],risks:["旱季缺水","踩踏","牧地爭議"]},
 {id:"TV-ZONE-04",name:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",tier:"D",seat:"L-TV-THUNDERPLATEAU",type:"高草原與季流河谷",identity:"雷暴高地、渡運與東向巡查區。",economy:["渡運","獸角","草藥","獸皮"],risks:["雷暴","河谷暴漲","大型角獸"]},
 {id:"TV-ZONE-05",name:"南麓赤坡",province:"PROV-TV-05",smap:"SMAP-TV-05",tier:"C",seat:"L-TV-REDSLOPE",type:"龍脊北麓邊地",identity:"與龍脊火山高地相接的乾熱山麓。",economy:["石材","耐熱素材","皮革","牧畜"],risks:["地熱裂隙","落石","火地魔物"]},
 {id:"TV-ZONE-06",name:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",tier:"D",seat:"L-TV-MISTEDGE",type:"草原林緣過渡帶",identity:"藥草、木作、狩獵配額與林緣協議區。",economy:["藥草","木作","狩獵","蜂蜜"],risks:["濃霧","林獸越界","採伐爭議"]}
];

function town(x){return{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,size:x.size,region:"泰爾瓦隆百族部落",description:x.description,facilities:[...(x.facilities||[])],links:[],safety_score:x.safety??88,safety_label:"安穩",risk:Math.max(3,100-(x.safety??88)),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,history_scope:"泰爾瓦隆百族部落／"+x.zoneName,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,tribal_zone_id:x.zoneId,local_authority:clone(x.authority),local_economy:clone(x.economy)}}
const TOWNS=[
 {id:"L-TV-GREATCAMP",name:"泰爾瓦隆大營",tier:"C",size:"大型會盟城營",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",role:"百族共同政治中樞／大酋長牙帳／百族會盟所在地",description:"固定會盟地上的大型城營。中央牙帳、十二圖騰席、祖火壇與議事環全年存在，外圍營區隨季節伸縮；它是正式首府，但不是石牆宮殿型城市。",facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","church","clinic"],safety:94,authority:{office_title:"百族大酋長／會盟長席",authority_tier:"AUTH-6",jurisdiction:"共同外交、會盟秩序、跨部爭議與戰時統合"},economy:eco(80,"繁榮",["大型互市","牲畜","工藝","會盟服務"],["會盟季人口暴增","部分糧鐵仰賴西向商路"],1,1.18,1.22,1.20)},
 {id:"L-TV-HEARTHMARKET",name:"百火市",tier:"D",size:"常設市鎮",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",role:"常設交易鎮／工匠與外商居留地",description:"大營南側常設市鎮，由多部共同維護火塘區、畜欄、工棚與外商街。",facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","clinic"],safety:91,authority:{office_title:"百火市監",authority_tier:"AUTH-3",jurisdiction:"市集秤量、外商登記、畜欄與火場安全"},economy:eco(75,"繁榮",["皮革","工藝","藥草","外來貨"],["商隊到貨波動","高階裝備有限"],1,1.12,1.14,1.16)},
 {id:"L-TV-WESTGATE",name:"百族西關",tier:"D",size:"關城與互市鎮",zoneId:"TV-ZONE-02",zoneName:"西關風門",province:"PROV-TV-02",smap:"SMAP-TV-02",role:"西境主關／商道互市與安全檢查",description:"山牆缺口中的關城與互市鎮，商隊在此登記、換馱獸、修車與取得草原路況。",facilities:["guild","general","blacksmith","tailor","tavern","inn","clinic"],safety:90,authority:{office_title:"百族西關守",authority_tier:"AUTH-4",jurisdiction:"關隘、互市、商隊登記與邊境警戒"},economy:eco(73,"繁榮",["關市","護衛","馱獸","修具"],["強風封道","跨境事件"],1,1.08,1.12,1.13)},
 {id:"L-TV-SPRINGRING",name:"泉環鎮",tier:"D",size:"牧鎮",zoneId:"TV-ZONE-03",zoneName:"北泉草海",province:"PROV-TV-03",smap:"SMAP-TV-03",role:"水權、畜產與季節市集中心",description:"數口大泉圍成的牧鎮，公共水池與石槽由多部共同維護；泉量記錄與輪牧表是地方治理核心。",facilities:["guild","general","blacksmith","tailor","tavern","inn","clinic"],safety:89,authority:{office_title:"北泉水牧長",authority_tier:"AUTH-3",jurisdiction:"公共泉眼、牧地輪替、獸群衛生與旱季配水"},economy:eco(65,"穩健",["牲畜","乳酪","皮毛","草藥"],["旱季限制","金屬與藥劑依賴商路"],1.01,1,.98,1)},
 {id:"L-TV-THUNDERPLATEAU",name:"雷台鎮",tier:"D",size:"高原鎮",zoneId:"TV-ZONE-04",zoneName:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",role:"東部守望與獵場管理中心",description:"建在避開雷擊主脊的高原緩坡，風旗、接地石柱與守望臺環繞鎮區。",facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn"],safety:87,authority:{office_title:"雷台守望長",authority_tier:"AUTH-3",jurisdiction:"巡查、雷暴警報、獵場界線與傳訊"},economy:eco(61,"穩健",["獸角","皮革","藥草","傳訊"],["雷暴中斷道路","木材較少"],1.02,.95,.94,.96)},
 {id:"L-TV-RIVERFORD",name:"季流渡",tier:"E",size:"渡口鎮",zoneId:"TV-ZONE-04",zoneName:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",role:"季流河谷渡運與獵場補給",description:"沿季流河穩定淺灘形成的小鎮；枯水期車渡、漲水期纜渡。",facilities:["guild","general","tavern","inn","clinic"],safety:84,authority:{office_title:"季流渡頭",authority_tier:"AUTH-2",jurisdiction:"渡運、水位記錄、河岸牧草與救援"},economy:eco(52,"普通",["渡運","魚獲","牧草","旅行補給"],["洪水停渡","工坊少"],1.03,.88,.86,.90)},
 {id:"L-TV-REDSLOPE",name:"赤坡寨",tier:"D",size:"山麓寨鎮",zoneId:"TV-ZONE-05",zoneName:"南麓赤坡",province:"PROV-TV-05",smap:"SMAP-TV-05",role:"龍脊北麓警戒與素材集散地",description:"赤褐山坡上的寨鎮，低矮石牆用來擋落石與獸群；南方巡隊從此監看龍脊北口。",facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","clinic"],safety:82,authority:{office_title:"赤坡寨主",authority_tier:"AUTH-4",jurisdiction:"山口警戒、採石、火地素材與避難動員"},economy:eco(58,"穩健",["石材","耐熱素材","皮革"],["耕作弱","水源少","採集風險高"],1.03,.92,.94,.94)},
 {id:"L-TV-MISTEDGE",name:"霧林口",tier:"D",size:"林緣鎮",zoneId:"TV-ZONE-06",zoneName:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",role:"林緣協議、藥草、木作與巡獵中心",description:"草原與疏林交界聚落，採伐輪區、林緣石標與藥草棚比防牆更醒目。",facilities:["guild","general","blacksmith","tailor","alchemy","tavern","inn","clinic"],safety:88,authority:{office_title:"霧林協議長",authority_tier:"AUTH-3",jurisdiction:"採伐、採藥、狩獵配額與林緣救援"},economy:eco(67,"穩健",["藥草","木作","蜂蜜","獸皮"],["霧季交通慢","採伐狩獵輪區限制"],1,1.03,1.02,1.01)}
];
for(const x of TOWNS)upsert("locations",town(x));

function field(x){const gather=[...(x.gather||[])],hunt=[...(x.hunt||[])],fish=[...(x.fish||[])],mining=[...(x.mining||[])],woodcut=[...(x.woodcut||[])];return{id:x.id,name:x.name,kind:"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"泰爾瓦隆百族部落",description:x.description,risk:x.risk??18,encounter:.22,links:[],gather,hunt,fish,explore:clone(x.explore||[]),encounter_tags:[...(x.tags||[])],ecology_zone:x.zone||"frontier",encounter_profile:{zone:x.zone||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:true,allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:"open_wild",space_class:"open",preferred_monster_ids:[...(x.preferred||[])]},resource_profile:{forage:gather,mining,woodcut,hunt,fish},safety_score:x.safety??72,safety_label:(x.safety??72)>=80?"較安全":"需警戒",world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,history_scope:"泰爾瓦隆百族部落／"+x.zoneName,political_role:"共享獵場／牧地／採集地",province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,tribal_zone_id:x.zoneId,hunt_requires_battle:true}}
const FIELDS=[
 {id:"L-TV-HEARTGRASS",name:"會盟大草原",tier:"E",size:"開闊草原",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",zone:"town_outskirts",tags:["plains","steppe"],safety:84,description:"共同草場，會盟季作臨時營區與牲畜圈地，平時依輪牧規則開放。",gather:["I-HERB","I-ROOT"],hunt:["I-RAWMEAT"],preferred:["MON-TV-001","MON-TV-003","MON-TV-005"],explore:[["輪牧界樁",25],["舊火塘",20],["商隊車轍",20],["草藥坡",20],["遠望丘",15]]},
 {id:"L-TV-SEASONALRIVER",name:"百族季流河",tier:"E",size:"季節河谷",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",zone:"frontier",tags:["water","plains"],aquatic:true,safety:77,description:"雨季迅速擴張、旱季剩深潭的季節河道；公共取水點受水草議庭規範。",gather:["I-HERB","I-MINT"],fish:["I-RAWFISH"],preferred:["MON-TV-002","MON-TV-015"],explore:[["公共取水點",25],["枯水灘",20],["深潭",20],["舊渡標",20],["牧草地",15]]},
 {id:"L-TV-WINDSCAR",name:"西關風裂谷",tier:"D",size:"風蝕峽谷",zoneId:"TV-ZONE-02",zoneName:"西關風門",province:"PROV-TV-02",smap:"SMAP-TV-02",zone:"frontier",tags:["mountain","steppe"],safety:66,description:"強側風與碎石坡迫使商隊走固定線，高處常見大型飛鳥。",gather:["I-HERB"],mining:["I-ORE-BRONZE"],preferred:["MON-TV-004","MON-TV-010"],explore:[["避風石壁",25],["舊烽樁",20],["碎石坡",20],["商隊歇腳灣",20],["巢壁",15]]},
 {id:"L-TV-TRADEHILLS",name:"商道石丘",tier:"E",size:"低石丘",zoneId:"TV-ZONE-02",zoneName:"西關風門",province:"PROV-TV-02",smap:"SMAP-TV-02",zone:"frontier",tags:["plains","mountain"],safety:76,description:"百族商道兩側低矮石丘，散布里程石、臨時獸欄與護衛營火點。",gather:["I-HERB","I-ROOT"],mining:["I-ORE-BRONZE"],hunt:["I-RAWMEAT"],preferred:["MON-TV-004","MON-TV-006"],explore:[["里程石",25],["馱獸水槽",20],["護衛營火",20],["石丘獸穴",20],["舊車輪堆",15]]},
 {id:"L-TV-NORTHPASTURE",name:"北泉馬原",tier:"D",size:"泉地草海",zoneId:"TV-ZONE-03",zoneName:"北泉草海",province:"PROV-TV-03",smap:"SMAP-TV-03",zone:"frontier",tags:["plains","water"],safety:72,description:"泉環鎮以北牧地，泉眼由石槽與引水溝串聯，獸群也會吸引大型掠食者。",gather:["I-HERB","I-ROOT"],hunt:["I-RAWMEAT"],preferred:["MON-TV-001","MON-TV-005","MON-TV-007"],explore:[["馬群飲水槽",25],["泉眼石圈",20],["牧人高臺",20],["獠豬泥坑",20],["風乾草堆",15]]},
 {id:"L-TV-MUGWORT",name:"白蒿灘",tier:"E",size:"乾草原",zoneId:"TV-ZONE-03",zoneName:"北泉草海",province:"PROV-TV-03",smap:"SMAP-TV-03",zone:"frontier",tags:["plains","steppe"],safety:78,description:"白蒿草覆蓋的休牧緩坡，也是常用藥草採集區。",gather:["I-HERB","I-MINT","I-ROOT"],hunt:["I-RAWMEAT"],preferred:["MON-TV-003","MON-TV-007"],explore:[["蒿草坡",30],["休牧界標",20],["野狐穴",20],["採藥棚",15],["風蝕土臺",15]]},
 {id:"L-TV-THUNDERSTEPPE",name:"雷台高草原",tier:"D",size:"高草原",zoneId:"TV-ZONE-04",zoneName:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",zone:"deep_wild",tags:["plains","storm"],safety:62,description:"孤立石柱頻遭雷擊的高草原，巡隊以風旗與獸群反應判斷暴風。",gather:["I-HERB"],hunt:["I-RAWMEAT"],preferred:["MON-TV-008","MON-TV-009"],explore:[["接地石柱",25],["雷擊焦痕",20],["角獸踏徑",20],["風旗臺",20],["高草窪",15]]},
 {id:"L-TV-EASTRIVER",name:"東岸季流谷",tier:"D",size:"河谷草地",zoneId:"TV-ZONE-04",zoneName:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",zone:"frontier",tags:["water","plains"],aquatic:true,safety:70,description:"季流渡上下游河谷，淺灘與切岸會隨雨季改變。",gather:["I-HERB","I-MINT"],fish:["I-RAWFISH"],preferred:["MON-TV-002","MON-TV-015"],explore:[["纜渡石樁",25],["草洲",20],["急彎切岸",20],["魚潭",20],["洪水高痕",15]]},
 {id:"L-TV-REDSTONE",name:"赤坡玄石地",tier:"D",size:"乾熱石坡",zoneId:"TV-ZONE-05",zoneName:"南麓赤坡",province:"PROV-TV-05",smap:"SMAP-TV-05",zone:"frontier",tags:["mountain","dry"],safety:64,description:"玄武岩與碎石坡交錯的乾熱地帶，甲蜥常藏在石縫。",gather:["I-HERB"],mining:["I-ORE-BRONZE","I-ORE-IRON"],preferred:["MON-TV-006","MON-TV-011"],explore:[["玄石脊",25],["熔岩縫",20],["採石棚",20],["蜥穴",20],["山口風標",15]]},
 {id:"L-TV-DRAGONFOOTHILL",name:"龍脊北麓",tier:"C",size:"火山山麓",zoneId:"TV-ZONE-05",zoneName:"南麓赤坡",province:"PROV-TV-05",smap:"SMAP-TV-05",zone:"deep_wild",tags:["mountain","volcanic"],safety:50,description:"泰爾瓦隆南界高風險山麓，只有標記路線開放採集，地熱異常即封路。",gather:["I-HERB"],mining:["I-ORE-IRON"],hunt:["I-RAWMEAT"],preferred:["MON-TV-008","MON-TV-012","MON-TV-020"],explore:[["北口界碑",25],["熱風裂隙",20],["灰翼獸巢坡",20],["封路旗",20],["舊熔岩臺",15]]},
 {id:"L-TV-OAKEDGE",name:"霧槲林緣",tier:"E",size:"疏林草地",zoneId:"TV-ZONE-06",zoneName:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",zone:"frontier",tags:["forest","plains"],safety:76,description:"黑槲與草地交錯的林緣，採伐採輪區制，古樹與祭記樹不得砍伐。",gather:["I-HERB","I-MINT","I-MUSHROOM","I-BERRY"],woodcut:["I-BRANCH"],hunt:["I-RAWMEAT"],preferred:["MON-TV-013","MON-TV-014"],explore:[["輪採木標",25],["古槲保留區",20],["蜂巢林",20],["霧狐足跡",20],["採藥棚",15]]},
 {id:"L-TV-GAMEPATH",name:"霧谷獸徑",tier:"D",size:"林谷獵場",zoneId:"TV-ZONE-06",zoneName:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",zone:"deep_wild",tags:["forest","valley"],safety:61,description:"深入霧谷的獸徑與溪溝，固定時段開放狩獵以保護繁殖地。",gather:["I-HERB","I-MUSHROOM"],woodcut:["I-BRANCH"],hunt:["I-RAWMEAT"],preferred:["MON-TV-013","MON-TV-014"],explore:[["巡獵記號",25],["霧溪",20],["獸群擦樹",20],["獵棚",20],["封養界線",15]]}
];
for(const x of FIELDS)upsert("locations",field(x));

function dungeon(x){const gather=[...(x.gather||[])],mining=[...(x.mining||[])];return{id:x.id,name:x.name,kind:"dungeon",tier:x.tier,world_tier:x.tier,size:x.size,region:"泰爾瓦隆百族部落",description:x.description,risk:x.risk??32,encounter:.34,links:[],gather,explore:clone(x.explore||[]),encounter_tags:["dungeon",...(x.tags||[])],ecology_zone:"dungeon",encounter_profile:{zone:"dungeon",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:true,allow_demons:false,allow_undead:!!x.allowUndead,allow_aquatic:!!x.aquatic,archetype:x.archetype||"ruins",space_class:"standard",preferred_monster_ids:[...(x.preferred||[])]},resource_profile:{forage:gather,mining,woodcut:[],hunt:[],fish:[]},safety_score:x.safety??45,safety_label:"危險",world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,history_scope:"泰爾瓦隆百族部落／"+x.zoneName,political_role:"部落遺構／試煉地／危險地下區",province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,tribal_zone_id:x.zoneId,hunt_requires_battle:true}}
const DUNGEONS=[
 {id:"D-TV-OATHCIRCLE",name:"古誓石圈地窟",tier:"C",size:"石圈地下祭室",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",tags:["ruins","ritual"],archetype:"ritual_ruins",risk:35,safety:42,description:"比現代百族會盟更古老的地下祭室，外層由會盟與薩滿共同管理，深層仍有古老構裝守衛。",gather:["I-MUSHROOM"],preferred:["MON-TV-016","MON-TV-017"],explore:[["十二槽石環",25],["誓刻走道",20],["封閉祭室",20],["石守座",20],["深層誓門",15]]},
 {id:"D-TV-GRANARY",name:"舊冬糧窖",tier:"E",size:"地下儲藏窖",zoneId:"TV-ZONE-01",zoneName:"會盟心原",province:"PROV-TV-01",smap:"SMAP-TV-01",tags:["cellar"],archetype:"cellar",risk:20,safety:62,description:"舊會盟時代的地下糧窖與冷藏坑，部分通道因坍塌停用。",gather:["I-MUSHROOM"],preferred:["MON-TV-001","MON-TV-002"],explore:[["通風井",25],["舊糧槽",25],["坍塌岔道",20],["冷藏坑",15],["排水溝",15]]},
 {id:"D-TV-OLDWATCH",name:"西關舊烽堡",tier:"D",size:"廢棄山堡",zoneId:"TV-ZONE-02",zoneName:"西關風門",province:"PROV-TV-02",smap:"SMAP-TV-02",tags:["ruins","fortress"],archetype:"fortress",risk:30,safety:48,description:"舊商道改線後棄用的石砌烽堡，風道穿過半塌塔樓。",mining:["I-ORE-BRONZE"],preferred:["MON-TV-004","MON-TV-010"],explore:[["半塌烽塔",25],["弓窗廊",20],["風井",20],["舊馬房",20],["封石地窖",15]]},
 {id:"D-TV-SUNKWELL",name:"北泉沉井",tier:"D",size:"地下泉洞",zoneId:"TV-ZONE-03",zoneName:"北泉草海",province:"PROV-TV-03",smap:"SMAP-TV-03",tags:["water","cave"],archetype:"water_cave",aquatic:true,risk:29,safety:50,description:"廢棄大泉下方的石灰岩洞，雨季低層會淹沒。",gather:["I-MUSHROOM"],preferred:["MON-TV-002","MON-TV-007","MON-TV-015"],explore:[["沉井石梯",25],["地下泉池",25],["乾季側洞",20],["水量刻痕",15],["低層暗河",15]]},
 {id:"D-TV-STORMCAVE",name:"雷擊石窟",tier:"C",size:"雷晶洞窟",zoneId:"TV-ZONE-04",zoneName:"東岸雷台",province:"PROV-TV-04",smap:"SMAP-TV-04",tags:["cave","storm"],archetype:"elemental_cave",risk:36,safety:40,description:"雷暴沿含礦岩脈放電形成的石窟，採掘受配額與天候封鎖。",mining:["I-ORE-IRON"],preferred:["MON-TV-009","MON-TV-018"],explore:[["玻璃化岩壁",25],["雷晶裂隙",20],["接地銅樁",20],["封採標牌",20],["深層鳴洞",15]]},
 {id:"D-TV-HOTWIND",name:"灼風洞",tier:"C",size:"火山風洞",zoneId:"TV-ZONE-05",zoneName:"南麓赤坡",province:"PROV-TV-05",smap:"SMAP-TV-05",tags:["cave","volcanic"],archetype:"volcanic_cave",risk:38,safety:38,description:"龍脊北麓地熱風洞，熱風會隨氣壓突然增強，赤坡寨以旗色封鎖危險時段。",mining:["I-ORE-IRON"],preferred:["MON-TV-011","MON-TV-012"],explore:[["熱風口",25],["冷凝石廊",20],["甲蜥巢",20],["封鎖旗樁",20],["深層熔痕",15]]},
 {id:"D-TV-ANCESTORTOMB",name:"林緣祖墓",tier:"C",size:"氏族合葬墓窟",zoneId:"TV-ZONE-06",zoneName:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",tags:["tomb","ritual"],archetype:"tomb",allowUndead:true,risk:34,safety:43,description:"數個古老氏族共用的合葬墓窟，現只開放外圍祭道，異常時由祖火薩滿庭封線。",gather:["I-MUSHROOM"],preferred:["MON-TV-017","MON-TV-019"],explore:[["外祭道",25],["骨符牆",20],["家系刻石",20],["封線木牌",20],["深墓門",15]]},
 {id:"D-TV-MISTRAVINE",name:"霧谷裂隙遺構",tier:"D",size:"裂谷石室群",zoneId:"TV-ZONE-06",zoneName:"林緣霧谷",province:"PROV-TV-06",smap:"SMAP-TV-06",tags:["ruins","valley"],archetype:"ruins",allowUndead:true,risk:31,safety:47,description:"獸徑谷下方暴露的石室與裂隙，入口不穩，需固定繩路後進入。",gather:["I-MUSHROOM"],preferred:["MON-TV-013","MON-TV-019","MON-TV-020"],explore:[["裂谷繩路",25],["斷裂石室",20],["舊壁畫",20],["獸骨堆",20],["深層風穴",15]]}
];
for(const x of DUNGEONS)upsert("locations",dungeon(x));

const ITEMS=[
 ["TV-MAT-001","草原小獸筋","F",.08,5,"小型草原獸類的韌筋。"],["TV-MAT-002","泉蟹甲片","F",.22,8,"泉地甲殼獸的薄甲片。"],
 ["TV-MAT-003","風犬皮","E",.55,17,"草原野犬的耐風短毛皮。"],["TV-MAT-004","長角獸角片","E",.32,18,"草原有角獸的角片。"],
 ["TV-MAT-005","北泉獠豬硬皮","D",.85,30,"大型獠豬的厚皮。"],["TV-MAT-006","風裂硬羽","D",.12,25,"大型飛鳥的硬羽。"],
 ["TV-MAT-007","赤坡甲蜥鱗","D",.38,32,"乾熱地甲蜥的硬鱗。"],["TV-MAT-008","灼紋腺","C",.18,64,"大型火地蜥獸的熱腺組織。"],
 ["TV-MAT-009","霧狐尾絨","E",.08,20,"林緣狐獸的細絨。"],["TV-MAT-010","季流鱗膜","D",.20,29,"大型鱗鰻的柔韌鱗膜。"],
 ["TV-MAT-011","古誓核心片","C",.48,78,"古誓構裝守衛的刻紋核心殘片。"],["TV-MAT-012","雷晶碎片","C",.24,72,"雷擊石窟形成的晶化礦片。"],
 ["TV-MAT-013","祖墓骨符片","D",.12,34,"受管制研究用的受損古墓骨符碎片。"]
].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],value:x[4],description:x[5]}));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID});

function mon(x){const drops=[...(x.drops||[])];return{id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:1,ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},loot_materials:drops.map((id,i)=>({id,chance:Math.max(.18,.44-i*.08),min:1,max:1}))}}
const MONSTERS=[
 {id:"MON-TV-001",name:"蒿草跳鼠",tier:"F",habitat:["L-TV-HEARTGRASS","L-TV-NORTHPASTURE","D-TV-GRANARY"],hp:24,atk:8,def:4,acc:67,damage:[2,5],scale:"small",tags:["wildlife","small_intruder"],drops:["TV-MAT-001"],near:true,description:"草原與糧窖常見的小型齧獸。"},
 {id:"MON-TV-002",name:"泉地泥蟹",tier:"F",habitat:["L-TV-SEASONALRIVER","L-TV-EASTRIVER","D-TV-SUNKWELL"],hp:30,atk:10,def:8,acc:65,damage:[3,6],element:"水",scale:"small",tags:["aquatic","invertebrate","small_intruder"],drops:["TV-MAT-002"],near:true,description:"泉池與季流淺灘的小型甲殼獸。"},
 {id:"MON-TV-003",name:"草原尖耳狐",tier:"E",habitat:["L-TV-HEARTGRASS","L-TV-MUGWORT"],hp:43,atk:15,def:6,acc:76,init:14,damage:[5,9],scale:"small",drops:["TV-MAT-009"],description:"以鼠類和小鳥為食的草原狐獸。"},
 {id:"MON-TV-004",name:"風背野犬",tier:"E",habitat:["L-TV-WINDSCAR","L-TV-TRADEHILLS","D-TV-OLDWATCH"],hp:52,atk:18,def:7,acc:75,damage:[6,11],drops:["TV-MAT-003"],description:"適應強風與碎石坡的野犬。"},
 {id:"MON-TV-005",name:"鐵蹄草鹿",tier:"E",habitat:["L-TV-HEARTGRASS","L-TV-NORTHPASTURE"],hp:58,atk:17,def:9,acc:70,damage:[6,11],drops:["TV-MAT-004"],description:"蹄質厚硬的草原鹿。"},
 {id:"MON-TV-006",name:"石丘鬣蜥",tier:"E",habitat:["L-TV-TRADEHILLS","L-TV-REDSTONE"],hp:55,atk:17,def:11,acc:69,damage:[6,10],element:"地",drops:["TV-MAT-007"],description:"在石丘與乾熱坡地活動的鬣蜥。"},
 {id:"MON-TV-007",name:"北泉獠豬",tier:"D",habitat:["L-TV-NORTHPASTURE","L-TV-MUGWORT","D-TV-SUNKWELL"],hp:105,atk:28,def:16,acc:71,damage:[10,19],scale:"large",tags:["wildlife","large_wildlife"],drops:["TV-MAT-005"],description:"泉地大型獠豬，護幼或爭水時危險。"},
 {id:"MON-TV-008",name:"長角奔羊",tier:"D",habitat:["L-TV-THUNDERSTEPPE","L-TV-DRAGONFOOTHILL"],hp:84,atk:24,def:12,acc:73,damage:[8,16],drops:["TV-MAT-004"],description:"高草原與山麓的長角獸。"},
 {id:"MON-TV-009",name:"雷鬃角獸",tier:"D",habitat:["L-TV-THUNDERSTEPPE","D-TV-STORMCAVE"],hp:108,atk:29,def:15,acc:74,damage:[10,20],element:"雷",scale:"large",tags:["wildlife","magical_ecology"],drops:["TV-MAT-004","TV-MAT-012"],description:"長期棲息雷暴高地的角獸。"},
 {id:"MON-TV-010",name:"風裂禿鷲",tier:"D",habitat:["L-TV-WINDSCAR","D-TV-OLDWATCH"],hp:76,atk:24,def:8,acc:81,init:16,damage:[8,16],element:"風",drops:["TV-MAT-006"],description:"利用峽谷上升氣流滑翔的大型食腐鳥。"},
 {id:"MON-TV-011",name:"赤坡甲蜥",tier:"D",habitat:["L-TV-REDSTONE","D-TV-HOTWIND"],hp:96,atk:25,def:20,acc:70,damage:[9,17],element:"地",drops:["TV-MAT-007"],description:"厚鱗甲蜥能在乾熱石坡長時間活動。"},
 {id:"MON-TV-012",name:"灼息岩蜥",tier:"C",role:"菁英",habitat:["L-TV-DRAGONFOOTHILL","D-TV-HOTWIND"],hp:155,atk:37,def:23,acc:76,damage:[13,26],element:"火",scale:"large",tags:["wildlife","magical_ecology","large_wildlife"],drops:["TV-MAT-007","TV-MAT-008"],description:"受龍脊地熱影響的大型蜥獸。"},
 {id:"MON-TV-013",name:"霧林獵狼",tier:"D",habitat:["L-TV-OAKEDGE","L-TV-GAMEPATH","D-TV-MISTRAVINE"],hp:88,atk:27,def:11,acc:80,init:15,damage:[9,18],drops:["TV-MAT-003"],description:"林緣大型狼獸，以小群追獵。"},
 {id:"MON-TV-014",name:"霧尾狐",tier:"E",habitat:["L-TV-OAKEDGE","L-TV-GAMEPATH"],hp:46,atk:15,def:7,acc:78,init:15,damage:[5,9],element:"風",scale:"small",drops:["TV-MAT-009"],description:"毛色在濕霧裡不易辨識的狐獸。"},
 {id:"MON-TV-015",name:"季流鱗鰻",tier:"D",habitat:["L-TV-SEASONALRIVER","L-TV-EASTRIVER","D-TV-SUNKWELL"],hp:82,atk:25,def:9,acc:78,damage:[9,17],element:"水",tags:["aquatic"],drops:["TV-MAT-010"],description:"雨季沿季流河上溯的大型鱗鰻。"},
 {id:"MON-TV-016",name:"會盟石守",tier:"D",habitat:["D-TV-OATHCIRCLE"],hp:116,atk:28,def:24,acc:72,damage:[10,20],element:"地",tags:["construct"],drops:["TV-MAT-011"],description:"古誓石圈外層的構裝守衛。"},
 {id:"MON-TV-017",name:"古誓圖騰衛",tier:"C",role:"菁英",habitat:["D-TV-OATHCIRCLE","D-TV-ANCESTORTOMB"],hp:168,atk:38,def:28,acc:77,damage:[13,27],element:"地",scale:"large",tags:["construct"],drops:["TV-MAT-011"],description:"古老圖騰構裝，防護完整。"},
 {id:"MON-TV-018",name:"雷擊岩偶",tier:"C",role:"菁英",habitat:["D-TV-STORMCAVE"],hp:152,atk:36,def:26,acc:75,damage:[12,25],element:"雷",scale:"large",tags:["construct","magical_ecology"],drops:["TV-MAT-012"],description:"雷能累積過高時活躍的岩偶。"},
 {id:"MON-TV-019",name:"祖墓骨獵",tier:"D",habitat:["D-TV-ANCESTORTOMB","D-TV-MISTRAVINE"],hp:90,atk:27,def:14,acc:74,damage:[9,18],element:"死亡",tags:["undead"],drops:["TV-MAT-013"],description:"受損墓區偶發甦動的守墓遺骸。"},
 {id:"MON-TV-020",name:"龍脊灰翼獸",tier:"C",role:"菁英",habitat:["L-TV-DRAGONFOOTHILL","D-TV-MISTRAVINE"],hp:142,atk:35,def:18,acc:82,init:17,damage:[12,24],element:"風",scale:"large",tags:["wildlife","large_wildlife"],drops:["TV-MAT-006"],description:"棲息龍脊北坡與裂谷的大型翼獸。"}
];
for(const x of MONSTERS)upsert("monsters",mon(x));

const NPCS=[
 ["NPC-TV-001","哈爾克．赤鬃","百族大酋長","B","L-TV-GREATCAMP","百族外交、會盟決議、戰時統合與跨部爭議","ORG-TV-MOOT","高階會盟劇情／外交引介"],
 ["NPC-TV-002","薩雅．星鹿","會盟長席","C","L-TV-GREATCAMP","十二圖騰席議程、提案、投票與會盟記錄","ORG-TV-MOOT","會盟文書／部族引介"],
 ["NPC-TV-003","烏穆．黑槲","祖火大薩滿","C","L-TV-GREATCAMP","祖火祭儀、誓約見證、古石圈與口述史","ORG-TV-ANCESTORFIRE","祭儀見證／遺構引介"],
 ["NPC-TV-004","格羅恩．岩牙","戰角大統領","B","L-TV-GREATCAMP","共同戰團、邊境動員、山口防衛與補給","ORG-TV-WARHORN","戰團委託／邊防情報"],
 ["NPC-TV-005","艾芮．河蹄","水草裁議長","C","L-TV-HEARTHMARKET","泉眼、河谷、牧地、獵場與季節輪替","ORG-TV-WATERGRASS","水草裁議／通行資訊"],
 ["NPC-TV-006","托爾加．青角","百族西關守","C","L-TV-WESTGATE","西關、商道、互市與邊境警戒","ORG-TV-WESTPASS","通關／護衛委託"],
 ["NPC-TV-007","雷安．白羽","商道監","D","L-TV-WESTGATE","商隊流量、馱運價格、路況與外來商品","ORG-TV-WESTPASS","商路情報／貨運委託"],
 ["NPC-TV-008","梅雅．霧狐","林緣藥草師","D","L-TV-MISTEDGE","林緣藥草、霧谷路線、採集配額與調劑","ORG-TV-ANCESTORFIRE","藥草收購／調劑"],
 ["NPC-TV-009","巴爾德．金羚","百泉牧團首領","D","L-TV-SPRINGRING","牧群、泉量、獸醫與輪牧","ORG-TV-HERDERS","畜產交易／巡牧"],
 ["NPC-TV-010","赫格．灰狼","草原巡獵隊長","C","L-TV-SPRINGRING","怪物足跡、獸群、狩獵配額與搜救","ORG-TV-RANGERS","討伐／狩獵情報"],
 ["NPC-TV-011","伊薩．風蛇","馴獸師","D","L-TV-HEARTHMARKET","馱獸、草原坐騎、獸具與長途車隊","ORG-TV-HERDERS","馱獸照護／獸具"],
 ["NPC-TV-012","達魯．燼爪","赤坡寨主","C","L-TV-REDSLOPE","龍脊北麓、火地素材、封路與南部警戒","ORG-TV-WARHORN","山口委託／火地情報"],
 ["NPC-TV-013","索雅．河蹄","季流渡頭","E","L-TV-RIVERFORD","季流水位、纜渡、河岸路線與洪水救援","ORG-TV-WATERGRASS","渡運／河谷情報"],
 ["NPC-TV-014","尼姆．黑槲","圖騰工匠","D","L-TV-HEARTHMARKET","木石圖騰、皮革、骨角工藝與修復","ORG-TV-CRAFT","工藝修復／素材鑑定"],
 ["NPC-TV-015","凱爾．星鹿","百火市商議代表","D","L-TV-HEARTHMARKET","市場價格、外商、牲畜交易與倉儲","ORG-TV-WESTPASS","市場情報／商旅委託"],
 ["NPC-TV-016","歐蘭．白羽","冒險者公會泰爾瓦隆支部長","C","L-TV-GREATCAMP","委託、地下城、怪物分布與冒險者資格","", "冒險者委託／收購櫃檯"],
 ["NPC-TV-017","維卡．青角","雷台守望長","D","L-TV-THUNDERPLATEAU","雷暴預警、東部巡查、風旗與傳訊","ORG-TV-RANGERS","天候情報／巡查委託"],
 ["NPC-TV-018","莉亞．霧狐","會盟記錄官","D","L-TV-GREATCAMP","部族名冊、共同誓約、裁議與疆界記錄","ORG-TV-MOOT","正史查詢／會盟檔案"]
].map(x=>({id:x[0],name:x[1],role:x[2],tier:x[3],location_id:x[4],knowledge_scope:x[5],organization_ids:x[6]?[x[6]]:[],services:x[7].split("／"),combat_tier_ceiling:x[3],description:x[1]+"負責"+x[5]+"；其職權受百族會盟與地方分權規則約束。"}));
for(const x of NPCS)upsert("regional_npc_archetypes",{...x,region_id:REGION_ID,polity_id:POLITY_ID});

const ORGS=[
 ["ORG-TV-MOOT","百族會盟","government","C","L-TV-GREATCAMP","十二大圖騰席與眾部族代表共同議事，處理外交、共同法與跨部爭議。"],
 ["ORG-TV-WARHORN","戰角營","military","C","L-TV-GREATCAMP","會盟授權時統合各部戰團；平時維持聯絡、演訓、山口警戒與救災。"],
 ["ORG-TV-ANCESTORFIRE","祖火薩滿庭","ritual","C","L-TV-GREATCAMP","跨部族的誓約見證、祭儀、古史與遺構管理機構。"],
 ["ORG-TV-WATERGRASS","水草議庭","civic","D","L-TV-HEARTHMARKET","處理公共泉眼、牧地輪替、獵場、渡口與旱季配水爭議。"],
 ["ORG-TV-WESTPASS","西關互市會","trade","D","L-TV-WESTGATE","協調通關、秤量、護衛、馱運與到貨資訊。"],
 ["ORG-TV-RANGERS","草原巡獵隊","ranger","D","L-TV-SPRINGRING","負責足跡、獸群、狩獵配額、失蹤搜救與危險區封線。"],
 ["ORG-TV-HERDERS","百泉牧團","civilian","D","L-TV-SPRINGRING","跨部合作管理大型牧群、泉槽、獸醫、防疫與季節遷牧。"],
 ["ORG-TV-CRAFT","圖騰工匠盟","craft","D","L-TV-HEARTHMARKET","木作、皮革、骨角、石刻與修具工匠的跨部行會。"]
].map(x=>({id:x[0],name:x[1],kind:x[2],tier:x[3],region_id:REGION_ID,base_location_id:x[4],description:x[5]}));
for(const x of ORGS)upsert("world_organizations",x);

const HOOKS=[
 ["HOOK-TV-01","少了一面水旗","北泉公共泉眼輪牧旗被移動，兩個牧團都主張使用期未結束；需查泉量、記錄與移旗者。","E"],
 ["HOOK-TV-02","風裂谷的空車","商道巡隊發現貨物完整、馱獸失蹤的空車，需沿風裂谷辨認足跡。","D"],
 ["HOOK-TV-03","雷台提前封路","雷台比往年提早封閉高草原，需調查雷擊、獸群反應與風旗記錄。","D"],
 ["HOOK-TV-04","赤坡熱風異常","灼風洞熱風週期改變，需確認地熱、阻塞或大型魔物活動。","C"],
 ["HOOK-TV-05","祖墓封線","林緣祖墓骨符受損，需保全記錄並確認失竊與異常活動範圍。","C"],
 ["HOOK-TV-06","會盟席位爭議","成長中的小部族要求脫離原席團獨立發言，需查履約、公共負擔與既有承諾。","D"],
 ["HOOK-TV-07","季流改道","暴雨讓上游改道，舊牧界變成沙洲，水草議庭需重畫使用線。","E"],
 ["HOOK-TV-08","巡獵隊的停獵令","霧谷暫停狩獵，需調查繁殖地、獸群數量與替代供應。","D"]
];
for(const x of HOOKS)upsert("regional_adventure_hooks",{id:x[0],title:x[1],premise:x[2],tier:x[3],region_id:REGION_ID,polity_id:POLITY_ID});
const LIFE=[
 ["LIFE-TV-01","百族大會盟","大營外圍人口暴增，牲畜、住宿、修具與情報交易升溫。"],
 ["LIFE-TV-02","分水日","旱季前公開泉量與各牧團用水次序。"],["LIFE-TV-03","換牧季","牧團依草場承載量與泉水調整路線。"],
 ["LIFE-TV-04","西關大市","西向商隊集中抵達，進口精鐵、穀物與布匹增加。"],["LIFE-TV-05","雷台封旗","強雷暴期封閉部分高草原與石窟。"],
 ["LIFE-TV-06","南麓熱風季","地熱風增強時縮短採集時段並增加撤離點。"],["LIFE-TV-07","霧谷輪採","採藥、採木與狩獵依輪區開放，採過區段封養。"],
 ["LIFE-TV-08","戰角演訓","定期跨部聯絡與救災演訓，不等同戰爭動員。"]
];
for(const x of LIFE)upsert("regional_life_events",{id:x[0],name:x[1],text:x[2],region_id:REGION_ID,polity_id:POLITY_ID});

for(const z of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=FIELDS.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=DUNGEONS.filter(x=>x.zoneId===z.id).map(x=>x.id);
 upsert("province_region_maps",{id:z.province,layer:"province_region",name:z.name,display_name:"泰爾瓦隆・"+z.name,administrative_type:z.type,parent_realm_map_id:REALM_ID,political_entity_id:POLITY_ID,world_region_id:REGION_ID,world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,economy:[...z.economy],recurring_risks:[...z.risks],identity:z.identity,tribal_zone_id:z.id});
 upsert("settlement_region_maps",{id:z.smap,name:z.name+"區域",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",location_ids:[...towns,...wilds,...dungeons],role:z.identity,tribal_zone_id:z.id});
}
const EDGES=[
 ["L-TV-GREATCAMP","L-TV-HEARTHMARKET",.6],["L-TV-GREATCAMP","L-TV-WESTGATE",8],["L-TV-GREATCAMP","L-TV-SPRINGRING",7],["L-TV-GREATCAMP","L-TV-THUNDERPLATEAU",10],["L-TV-GREATCAMP","L-TV-REDSLOPE",9],["L-TV-GREATCAMP","L-TV-MISTEDGE",8.5],
 ["L-TV-THUNDERPLATEAU","L-TV-RIVERFORD",3],["L-TV-HEARTHMARKET","L-TV-HEARTGRASS",1],["L-TV-HEARTHMARKET","L-TV-SEASONALRIVER",1.4],["L-TV-GREATCAMP","D-TV-OATHCIRCLE",2.2],["L-TV-HEARTHMARKET","D-TV-GRANARY",1.1],
 ["L-TV-WESTGATE","L-TV-WINDSCAR",1.4],["L-TV-WESTGATE","L-TV-TRADEHILLS",1.1],["L-TV-WESTGATE","D-TV-OLDWATCH",2.1],["L-TV-SPRINGRING","L-TV-NORTHPASTURE",1.2],["L-TV-SPRINGRING","L-TV-MUGWORT",1.5],["L-TV-SPRINGRING","D-TV-SUNKWELL",1.8],
 ["L-TV-THUNDERPLATEAU","L-TV-THUNDERSTEPPE",1.4],["L-TV-RIVERFORD","L-TV-EASTRIVER",1],["L-TV-THUNDERPLATEAU","D-TV-STORMCAVE",2.8],["L-TV-REDSLOPE","L-TV-REDSTONE",1.1],["L-TV-REDSLOPE","L-TV-DRAGONFOOTHILL",2.4],["L-TV-REDSLOPE","D-TV-HOTWIND",2.1],
 ["L-TV-MISTEDGE","L-TV-OAKEDGE",1],["L-TV-MISTEDGE","L-TV-GAMEPATH",1.8],["L-TV-MISTEDGE","D-TV-ANCESTORTOMB",2],["L-TV-GAMEPATH","D-TV-MISTRAVINE",1.2]
];for(const e of EDGES)twoWay(e[0],e[1],e[2]);

upsert("regional_content_profiles",{id:"RCP-TV-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"泰爾瓦隆百族部落",recommended_tier:"E～C",identity:"十二大圖騰席是主要議事骨架，中小部族透過席團與地方議庭參與；大酋長掌共同外交與戰時統合，各部保留高度自治。",terrain:"半乾燥草原、泉地、季流河谷、低山牆、雷暴台地、龍脊北麓與林緣霧谷",common_exports:["牲畜","皮革","獸角","藥草","木作","石材"],common_imports:["精鐵","穀物","高階藥劑","精製布匹"],food_staples:["烤肉","乾肉","乳酪","根莖","薄餅","香草湯"],recurring_risks:["旱季水源壓力","雷暴","獸群遷徙","山口封路","跨部牧地爭議"]});
upsert("regional_economy_profiles",{id:"ECO-TV-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["牲畜","皮革","角材","藥草","木作","石材"],imports:["精鐵","穀物","高階藥劑","精製布"],notes:"大營、百火市、西關與牧鎮以季節市集互補；水源、草場與採集輪區實際限制產出。"});

const realm=row("realm_region_maps",REALM_ID);
if(realm){realm.province_region_ids=ZONES.map(x=>x.province);realm.regional_centers=["泰爾瓦隆大營","百火市","百族西關","泉環鎮","雷台鎮","赤坡寨","霧林口"];realm.map_status="playable_current";realm.tribal_zones=ZONES.map(x=>({id:x.id,name:x.name,type:x.type}));realm.notes="六大可遊玩地帶是地理與治理分區，不是封建領地或獨立國家。";}
const polity=row("political_entities",POLITY_ID);
if(polity){
 polity.capital="泰爾瓦隆大營";polity.secondary_centers=["百火市","百族西關","泉環鎮","雷台鎮","赤坡寨","霧林口"];
 polity.tribal_structure={great_totem_seats:12,major_tribal_blocs:TRIBES.map(x=>x.name),representation_rule:"十二大圖騰席是主要議事骨架；中小部族透過席團、共同誓約與地方議庭參與，不以十二席等同全部百族。",grand_chief_rule:"百族大酋長由會盟承認，掌共同外交、跨部危機與授權下戰時統合，不直接占有各部牧地、水源或氏族司法。",war_power_rule:"戰角營只有在會盟授權或共同防衛條件成立時取得跨部指揮權。"};
 polity.economic_base=["牧畜","皮革","獸角工藝","藥草","木作","石材","商道互市"];polity.military_structure=["各部常備戰團","戰角營共同動員","草原巡獵隊","西關守備","雷台與南麓守望網"];
 polity.current_tensions=["旱季水權與輪牧","大部族席次與小部族發言權","商道收益與邊防成本","龍脊封路與高價素材需求","林緣採伐狩獵配額"];polity.gameplay_role="東北百族會盟／部族政治、水源牧地治理、互市、巡獵、山口與遺構探索";
}
const auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(auth){
 auth.office_nodes=Array.isArray(auth.office_nodes)?auth.office_nodes:[];
 const nodes=[
  {id:"POL-014-D1",title:"百族大酋長",authority_tier:"AUTH-6",authority_level:6,scope:"共同外交、跨部危機與授權下戰時統合",appointment:"百族會盟承認",rights:["AR-003","AR-004","AR-005","AR-008"],reports_to:null,notes:"不是世襲君主，也不直接占有各部資源。"},
  {id:"POL-014-D2",title:"會盟長席",authority_tier:"AUTH-5",authority_level:5,scope:"圖騰席議程、共同文書與決議程序",appointment:"圖騰席推舉",rights:["AR-003","AR-005","AR-008"],reports_to:"POL-014-D1"},
  {id:"POL-014-D3",title:"十二大圖騰酋長",authority_tier:"AUTH-5",authority_level:5,scope:"主要席團協調與會盟表決",appointment:"各部依自身制度產生",rights:["AR-003","AR-004","AR-005"],reports_to:null,notes:"十二席不等於全部百族。"},
  {id:"POL-014-D4",title:"水草裁議長",authority_tier:"AUTH-4",authority_level:4,scope:"泉眼、輪牧、獵場與渡口爭議",appointment:"水草議庭推舉",rights:["AR-003","AR-005"],reports_to:"POL-014-D2"},
  {id:"POL-014-D5",title:"戰角大統領",authority_tier:"AUTH-5",authority_level:5,scope:"授權期間的共同戰團與災害動員",appointment:"會盟指定",rights:["AR-003","AR-004"],reports_to:"POL-014-D1",notes:"跨部指揮權有條件與期限。"},
  {id:"POL-014-D6",title:"祖火大薩滿",authority_tier:"AUTH-4",authority_level:4,scope:"共同祭儀、誓約見證、古史與受保護遺構",appointment:"薩滿庭推舉",rights:["AR-005","AR-008"],reports_to:null},
  {id:"POL-014-D7",title:"部族酋長",authority_tier:"AUTH-4",authority_level:4,scope:"各部內部治理、牧地、氏族協調與地方戰團",appointment:"依各部傳統",rights:["AR-003","AR-004","AR-005"],reports_to:null},
  {id:"POL-014-D8",title:"氏族首領",authority_tier:"AUTH-3",authority_level:3,scope:"氏族營地、家戶與日常爭議",appointment:"氏族推舉／傳統承認",rights:["AR-003","AR-005"],reports_to:"POL-014-D7"},
  {id:"POL-014-D9",title:"百族西關守",authority_tier:"AUTH-4",authority_level:4,scope:"西關、互市、商旅登記與邊境安全",appointment:"會盟任命",rights:["AR-003","AR-004","AR-005","AR-008"],reports_to:"POL-014-D2"}
 ];
 for(const n of nodes){const i=auth.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)auth.office_nodes[i]=n;else auth.office_nodes.push(n)}
 auth.rival_power_centers=["百族大酋長牙帳","十二大圖騰席","水草議庭","祖火薩滿庭","戰角營","各部族酋長與地方氏族"];
 auth.player_interaction_summary="低階主要接觸氏族首領、公會、巡獵隊、牧團與地方議庭；中階進入圖騰席、水草議庭與戰角營；全體會盟保留給跨部議題。";
}
const LORE=[
 ["LORE-TV-01","politics","百族不等於十二族","十二大圖騰席是主要議事骨架，不是全部部族名單；中小部族透過席團、誓約與地方議庭參與。"],
 ["LORE-TV-02","politics","大酋長的權力邊界","大酋長代表共同外交、重大危機與授權下戰時統合；各部日常治理仍保留自治。"],
 ["LORE-TV-03","law","水草法","水源、牧地與獵場不是無限資源；泉量、季節、牲畜數、休牧期與既有記錄共同決定額度。"],
 ["LORE-TV-04","military","戰角只在必要時響","只有會盟授權或共同防衛條件成立時，戰角營才取得跨部指揮權。"],
 ["LORE-TV-05","economy","季節市場網","商隊、換牧、旱季與雷暴會改變庫存和價格，任何城鎮都沒有無限供貨與無限收購。"],
 ["LORE-TV-06","geography","六大地帶","會盟心原、西關風門、北泉草海、東岸雷台、南麓赤坡與林緣霧谷是治理與地理分區，不是六個國家。"],
 ["LORE-TV-07","society","多族共同體","泰爾瓦隆沒有單一種族壟斷所有部族；獸族、半獸人、人類與其他邊境族群共同構成百族。"],
 ["LORE-TV-08","history","會盟記錄與口述史","傳說可被尊重，但要成為現行法律或疆界依據仍需可查驗的會盟程序。"]
];
for(const x of LORE)upsert("lore_records",{id:x[0],category:x[1],title:x[2],text:x[3],scope_type:"polity",scope_id:POLITY_ID});
if(polity){polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];for(const x of LORE)if(!polity.lore_record_ids.includes(x[0]))polity.lore_record_ids.push(x[0])}

DB.content_link_index=DB.content_link_index||{};DB.content_link_index.location_content=DB.content_link_index.location_content||{};
for(const l of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>loc(x.id)).filter(Boolean))DB.content_link_index.location_content[l.id]={facility_ids:[...(l.facilities||[])],gather_item_ids:[...(l.gather||[])],fish_item_ids:[...(l.fish||[])],encounter_monster_ids:MONSTERS.filter(m=>m.habitat.includes(l.id)).map(m=>m.id),companion_species_ids:[],organization_ids:ORGS.filter(o=>o.base_location_id===l.id).map(o=>o.id),pantheon_ids:[]};


/* 後載入區域資料符合現行組織／世界誌／聚落schema。 */
{
 const facilityByOrg={"ORG-TV-MOOT":"guild","ORG-TV-WARHORN":"guild","ORG-TV-ANCESTORFIRE":"church","ORG-TV-WATERGRASS":"guild","ORG-TV-WESTPASS":"general","ORG-TV-RANGERS":"guild","ORG-TV-HERDERS":"general","ORG-TV-CRAFT":"blacksmith"};
 for(const t of TOWNS){const x=loc(t.id);if(x)x.settlement_world_tier=x.tier}
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(x&&rank(x.combat_tier_ceiling)>rank("C"))x.combat_tier_ceiling="C"}
 for(const o0 of ORGS){
  const o=row("world_organizations",o0.id);if(!o)continue;
  o.political_entity_id=POLITY_ID;o.scope="地方／區域";o.alignment=o.alignment||"neutral";
  o.primary_facility=facilityByOrg[o.id]||"guild";o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;o.min_join_level=Math.max(1,Number(o.min_join_level)||1);
  const bonusByKind={government:{statusResist:4},military:{initiative_pct:4},ritual:{healingPower:4},civic:{carryCapacity:5},trade:{perception:3},ranger:{perception:4},civilian:{moveSpeed:3},craft:{craft_success:4}};
  o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"百族職能會員訓練",effects:{...(bonusByKind[o.kind]||{perception:3})}};
  o.contact_location_ids=[...new Set([...(o.contact_location_ids||[]),o.base_location_id].filter(Boolean))];
  o.history=Array.isArray(o.history)&&o.history.length?o.history:["由百族共同生活的實際需求逐步形成，先有慣例與共同責任，後才固定名稱與議事程序。"];
  o.history_summary=o.history_summary||o.history.join(" ");
  o.current_state=o.current_state||"目前維持跨部協調與地方自治的平衡，優先處理能被共同記錄與查驗的公共事務。";
  o.signature=o.signature||({government:"百族共同議事",military:"授權式跨部動員",ritual:"祖火誓約見證",civic:"水草資源裁議",trade:"西關互市協調",ranger:"生態巡獵與搜救",civilian:"牧群與泉地協作",craft:"圖騰與實用工藝"}[o.kind]||"百族地方協作");
  o.distinctive_features=Array.isArray(o.distinctive_features)&&o.distinctive_features.length?o.distinctive_features:[o.signature,"跨部合作但不取消部族自治","以水源、牧地、商道與季節承載量約束實際運作"];
  o.institutional_culture=o.institutional_culture||"重視見證、使用記錄、季節條件與各部共同承擔。";
  o.strategic_tension=o.strategic_tension||"共同治理需求與部族自治、資源承載量之間持續需要協商。";
 }
 const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{});
 const verify=verifyKeys.includes("verified")?"verified":(verifyKeys[0]||"verified");
 for(const l of LORE){const x=row("lore_records",l[0]);if(x&&!x.verification)x.verification=verify}
 if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}
}

DB.tyervalon_confederacy={version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,structure:"十二大圖騰席＋中小部族席團＋地方氏族；六大地理治理區",great_totem_seats:TRIBES.map(x=>clone(x)),zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),governance:{common_center:"泰爾瓦隆大營／百族會盟",executive_role:"百族大酋長執行共同決議並代表共同外交",local_autonomy:"各部與氏族在共同誓約、水草法與跨部決議範圍內保留高度自治",war_rule:"戰角大統領的跨部指揮權只在會盟授權或共同防衛時生效",resource_rule:"泉眼、牧地、獵場與林地具有承載量、輪替與封養規則"},save_compatible:true};

function audit(){
 const issues=[],p=row("political_entities",POLITY_ID);
 if(!p)issues.push("泰爾瓦隆政治體缺失");else{if(p.name!=="泰爾瓦隆百族部落")issues.push("政治體名稱失步:"+p.name);if(p.capital!=="泰爾瓦隆大營")issues.push("首府名稱失步:"+p.capital)}
 if(TRIBES.length!==12)issues.push("主要圖騰席應為12席");if(ZONES.length!==6)issues.push("治理區應為6區");if(TOWNS.length!==8)issues.push("核心城鎮應為8處");if(FIELDS.length!==12)issues.push("野外應為12處");if(DUNGEONS.length!==8)issues.push("地下城應為8處");if(MONSTERS.length!==20)issues.push("怪物應為20種");if(NPCS.length!==18)issues.push("核心NPC應為18名");if(ORGS.length!==8)issues.push("區域組織應為8個");
 for(const z of ZONES){const pm=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pm)issues.push("治理區地圖缺失:"+z.name);if(!sm)issues.push("區域地圖缺失:"+z.name);const ids=sm?.location_ids||[];if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺城鎮:"+z.name);if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺野外:"+z.name);if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺地下城:"+z.name)}
 for(const id of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 for(const m0 of MONSTERS){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(rank(m.tier)>rank("C"))issues.push("REG-14怪物超過C級:"+m.id);if(!(m.habitat||[]).some(id=>loc(id)))issues.push("怪物棲地缺失:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落缺失:"+m.id+"->"+d.id)}
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id)}
 for(const o of ORGS)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);for(const id of ["POL-014-D1","POL-014-D3","POL-014-D4","POL-014-D5","POL-014-D6","POL-014-D9"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(row("realm_region_maps",REALM_ID)?.province_region_ids?.length!==6)issues.push("區域地圖未完整掛載六大地帶");
 return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{great_totem_seats:TRIBES.length,zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length}};
}
DB.meta=DB.meta||{};DB.meta.tyervalon_depth_revision=REV;DB.tyervalon_confederacy.initial_audit=audit();
globalThis.runTyervalonDepthAudit=audit;
globalThis.QUNLU_TYERVALON=Object.freeze({version:REV,audit,tribe_ids:TRIBES.map(x=>x.id),zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/tyervalon-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();