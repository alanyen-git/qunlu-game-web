/* 群陸旅誌：白氈汗國完整區域深化 CURRENT-2.01.0
 * WHITE-FELT-DEPTH-1.0
 * POL-015 / REG-15：季移汗庭、五大旗帳、牧路水源、季市、城鎮、野外、地下城、怪物、NPC與地方循環。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.01.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.01.0";
const REV="WHITE-FELT-DEPTH-1.0";
const POLITY_ID="POL-015",REGION_ID="REG-15",CULTURE_ID="CUL-015",REALM_ID="RMAP-POL-015";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(key){DB[key]=Array.isArray(DB[key])?DB[key]:[];return DB[key]}
function upsert(key,value,idKey="id"){const a=arr(key),i=a.findIndex(x=>x?.[idKey]===value[idKey]);if(i>=0)a[i]=value;else a.push(value);return value}
function row(key,id,idKey="id"){return (DB[key]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,hours){const from=loc(a);if(!from||!loc(b))return;from.links=Array.isArray(from.links)?from.links:[];const old=from.links.find(x=>x?.to===b);if(old)old.hours=hours;else from.links.push({to:b,hours})}
function twoWay(a,b,hours){addLink(a,b,hours);addLink(b,a,hours)}
function town(x){
 const base=clone(loc(x.id)||{});
 return Object.assign(base,{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:"白氈汗國",description:x.description,facilities:uniq([...(base.facilities||[]),...(x.facilities||[])]),links:Array.isArray(base.links)?base.links:[],safety_score:x.safety??88,safety_label:(x.safety??88)>=90?"安穩":(x.safety??88)>=84?"穩定":"警戒",risk:Math.max(2,100-(x.safety??88)),world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,history_scope:"白氈汗國／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,local_authority:clone(x.authority),local_economy:clone(x.economy),white_felt_zone_id:x.zoneId,seasonal_settlement:!!x.seasonal});
}
function field(x){
 const base=clone(loc(x.id)||{});
 const ref=loc(x.template)||loc("L-LOWFIELD")||loc("L-HILL")||loc("L-WOOD")||{};
 const ep=clone(base.encounter_profile||ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"open",preferred_monster_ids:[...(x.preferred||[])]});
 return Object.assign(base,{id:x.id,name:x.name,kind:x.kind||base.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"白氈汗國",description:x.description,links:Array.isArray(base.links)?base.links:[],risk:x.risk??18,safety_score:x.safety??Math.max(20,100-(x.risk??18)),safety_label:(x.risk??18)<=15?"安穩":(x.risk??18)<=25?"普通":(x.risk??18)<=35?"警戒":"危險",world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,white_felt_zone_id:x.zoneId,tags:uniq([...(base.tags||[]),...(x.tags||[])]),gather:uniq([...(base.gather||[]),...(x.gather||[])]),mining:uniq([...(base.mining||[]),...(x.mining||[])]),woodcut:uniq([...(base.woodcut||[]),...(x.woodcut||[])]),fish:uniq([...(base.fish||[]),...(x.fish||[])]),hunt:uniq([...(base.hunt||[]),...(x.hunt||[])]),explore:(x.explore||base.explore||[]),encounter_profile:ep,resource_capacity:clone(x.resourceCapacity||base.resource_capacity||{forage:14,hunt:8,ore:4,water:10}),resource_regen_hours:x.regen??base.resource_regen_hours??72,hunt_requires_battle:true});
}
function dungeon(x){return field({...x,kind:"dungeon",zoneClass:"dungeon",space:x.space||"standard"})}

const BANNERS=[
 {id:"WF-BANNER-01",name:"白馬旗帳",seat:"L-WF-COURT",specialty:"汗庭護衛、良馬育種、外交與大會主持",identity:"大汗直屬旗帳與近畿牧團的核心；權威來自汗庭職責，不等於占有全汗國牧地。"},
 {id:"WF-BANNER-02",name:"黑鷹旗帳",seat:"L-WF-NORTHMART",specialty:"北境巡騎、霜角商路、遠距偵察",identity:"負責北氈牧路與霜角南口方向的路況、驛站與邊境救援。"},
 {id:"WF-BANNER-03",name:"青河旗帳",seat:"L-WF-GOOSEMARKET",specialty:"河岸牧場、漁獵、渡口與蘆草地",identity:"依白鐘河上游與季節濕地移牧，最重視水量、渡口和春汛情報。"},
 {id:"WF-BANNER-04",name:"赤原旗帳",seat:"L-WF-SOUTHMART",specialty:"南界季市、穀物輸入、商旅護送",identity:"與聖曜帝國往來最密切，掌握南部大型市集和多條冬營補給線。"},
 {id:"WF-BANNER-05",name:"灰狼旗帳",seat:"L-WF-EASTWATCH",specialty:"東部丘陵、藍脊邊界、牧群護衛",identity:"沿藍脊西麓活動，負責山麓水源、狼害與法師領地邊界的實務協調。"}
];
const ZONES=[
 {id:"WF-Z-01",name:"汗庭季牧圈",type:"汗庭共同牧區",tier:"C",province:"PROV-WF-01",smap:"SMAP-WF-01",seat:"L-WF-COURT",economy:["良馬","乳製品","外交市集","皮革"],risks:["汗庭移營","大型集會壓力","草場超載"],identity:"大汗庭依春夏秋冬輪換數個傳統營地，政治中心會移動但法統與文書系統保持連續。"},
 {id:"WF-Z-02",name:"北風牧道",type:"北境旗帳區",tier:"D",province:"PROV-WF-02",smap:"SMAP-WF-02",seat:"L-WF-NORTHMART",economy:["驛馬","皮毛","霜角互市","引路"],risks:["寒潮","斷水","牧路壅塞"],identity:"通往霜角南口的北部牧路與驛站鏈，冬季風雪與泉眼結冰會直接改變路線。"},
 {id:"WF-Z-03",name:"白草泉原",type:"新手牧泉區",tier:"E",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",seat:"L-START-WINDSPRING",economy:["羊毛","皮革","基礎畜牧","泉眼補給"],risks:["旱季缺水","小型掠食獸"],identity:"以風泉村為固定補給點的低階牧區；既有白草牧野、雁回河灘與石圈舊營全部保留並納入汗國正式地圖。"},
 {id:"WF-Z-04",name:"雁河西岸",type:"河岸旗帳區",tier:"D",province:"PROV-WF-04",smap:"SMAP-WF-04",seat:"L-WF-GOOSEMARKET",economy:["河魚","蘆草","渡運","河岸牧場"],risks:["春汛","河灘改道","濕地疫病"],identity:"白鐘河上游西岸與季節濕地構成的移牧帶，春汛前後牧地邊界會重新劃定。"},
 {id:"WF-Z-05",name:"東丘牧界",type:"藍脊邊界區",tier:"D",province:"PROV-WF-05",smap:"SMAP-WF-05",seat:"L-WF-EASTWATCH",economy:["山羊","燧石","藥草","邊境護送"],risks:["狼害","坡地落石","邊界誤入"],identity:"草海向藍脊高地抬升的丘陵過渡區，牧民與藍塔領地依分水嶺、石標和泉眼劃界。"},
 {id:"WF-Z-06",name:"南界商牧帶",type:"南境季市區",tier:"D",province:"PROV-WF-06",smap:"SMAP-WF-06",seat:"L-WF-SOUTHMART",economy:["羊毛","穀物轉運","馬匹","鹽與布匹"],risks:["市集擁擠","走私","冬牧競爭"],identity:"接近聖曜帝國的南部草原，固定季市與冬營較多，是汗國輸入穀物、布匹與金屬工具的重要地帶。"}
];
const TOWNS=[
 {id:"L-WF-COURT",name:"白氈大汗庭",zoneId:"WF-Z-01",zone:"汗庭季牧圈",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"C",size:"大型季移帳城",safety:94,seasonal:true,role:"大汗駐帳、五旗會議、外交與全汗國文書中樞",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic"],authority:{title:"白氈大汗／五旗議帳",tier:"AUTH-6"},economy:{prosperity_score:70,prosperity_label:"繁榮",market_price_mult:1.02,stock_mult:1.08,market_budget_mult:1.13,liquidity_mult:1.12,drivers:["汗庭需求","良馬","大型季市","外交商隊"],constraints:["汗庭季移","固定倉儲有限","草場承載量"]},description:"由數千頂帳幕、可拆木台、車帳與牲畜圈構成的季移政治中心。汗庭每季依法定牧路移營；它是首要政治中心，但白氈汗國仍沒有永久首都。"},
 {id:"L-WF-GOLDENWHEEL",name:"金轅市",zoneId:"WF-Z-01",zone:"汗庭季牧圈",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"D",size:"固定商驛鎮",safety:91,role:"汗庭季移圈內的固定倉儲、工匠與商隊轉運點",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic"],authority:{title:"金轅市監",tier:"AUTH-3"},economy:{prosperity_score:67,prosperity_label:"穩健",market_price_mult:1.01,stock_mult:1.1,market_budget_mult:1.08,liquidity_mult:1.09,drivers:["車輪木作","帳具","皮革","倉儲"],constraints:["高階金屬需輸入","汗庭遠離時交易量下降"]},description:"建立在傳統交叉牧路上的固定市鎮，提供汗庭離開後仍不中斷的倉儲、修車與跨旗帳交易。"},
 {id:"L-WF-NORTHMART",name:"北氈驛",zoneId:"WF-Z-02",zone:"北風牧道",province:"PROV-WF-02",smap:"SMAP-WF-02",tier:"D",size:"北境驛市",safety:87,role:"霜角方向驛站、北境巡騎與互市前站",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"北路驛長",tier:"AUTH-4"},economy:{prosperity_score:55,prosperity_label:"穩定",market_price_mult:1.06,stock_mult:.92,market_budget_mult:.96,liquidity_mult:.94,drivers:["驛馬","皮毛","引路","北境互市"],constraints:["寒潮封路","泉眼冬季結冰"]},description:"北氈牧路上最重要的固定驛市之一，往霜角的商隊在此分批、補馬、核對風雪與水源情報。"},
 {id:"L-START-WINDSPRING",name:"風泉村",zoneId:"WF-Z-03",zone:"白草泉原",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",tier:"F",size:"小型牧泉村",safety:93,role:"新手出生補給村、泉眼管理與基礎巡牧",facilities:["guild","general","blacksmith","tavern","inn","church"],authority:{title:"風泉營長",tier:"AUTH-2"},economy:{prosperity_score:48,prosperity_label:"偏弱",market_price_mult:1.04,stock_mult:.82,market_budget_mult:.82,liquidity_mult:.78,drivers:["馬匹","羊毛","皮革"],constraints:["固定市場小","金屬與藥劑依賴輸入","旱季水源不穩"]},description:"既有新手聚落正式納入白草泉原；村民管理泉眼、低階牧路與公會巡牧，新角色出生與既有存檔位置保持不變。"},
 {id:"L-WF-MARELAKE",name:"乳泉營",zoneId:"WF-Z-03",zone:"白草泉原",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",tier:"E",size:"半固定牧營",safety:88,role:"乳畜、乾酪、幼畜照料與旱季備水",facilities:["inn","general","guild","clinic"],authority:{title:"乳泉營長",tier:"AUTH-2"},economy:{prosperity_score:44,prosperity_label:"有限",market_price_mult:1.03,stock_mult:.85,market_budget_mult:.82,liquidity_mult:.8,drivers:["乳酪","羊毛","幼畜"],constraints:["旱季縮營","藥材供應少"]},description:"環繞一口不易乾涸的淺泉形成的半固定牧營，以乳畜與幼畜照料支援周邊季節牧隊。"},
 {id:"L-WF-GOOSEMARKET",name:"雁河市",zoneId:"WF-Z-04",zone:"雁河西岸",province:"PROV-WF-04",smap:"SMAP-WF-04",tier:"D",size:"河岸市鎮",safety:89,role:"渡口、河岸季市、漁獲與蘆草交易",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic"],authority:{title:"雁河渡市長",tier:"AUTH-3"},economy:{prosperity_score:62,prosperity_label:"穩健",market_price_mult:1,stock_mult:1.02,market_budget_mult:1.04,liquidity_mult:1.06,drivers:["渡運","魚貨","蘆草","河岸牧場"],constraints:["春汛改道","橋渡承載有限"]},description:"白鐘河上游固定渡點旁形成的市場，河道安全與春汛水位會直接決定每日可通過的商隊和牲畜數量。"},
 {id:"L-WF-EASTWATCH",name:"藍脊牧關",zoneId:"WF-Z-05",zone:"東丘牧界",province:"PROV-WF-05",smap:"SMAP-WF-05",tier:"D",size:"山麓牧關",safety:86,role:"東部邊界、泉眼石標、狼害巡查與山麓交易",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"東丘牧界官",tier:"AUTH-4"},economy:{prosperity_score:52,prosperity_label:"穩定",market_price_mult:1.04,stock_mult:.91,market_budget_mult:.92,liquidity_mult:.9,drivers:["山羊","燧石","藥草","護送"],constraints:["坡地道路窄","高階術具受藍塔管制"]},description:"藍脊西麓的固定牧關，以分水嶺、界石與共同泉眼記錄維持白氈與藍塔邊界日常秩序。"},
 {id:"L-WF-SOUTHMART",name:"南帳市",zoneId:"WF-Z-06",zone:"南界商牧帶",province:"PROV-WF-06",smap:"SMAP-WF-06",tier:"D",size:"大型季市鎮",safety:90,role:"聖曜方向的穀物、布匹、鹽與馬匹交易中心",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic"],authority:{title:"南帳市監",tier:"AUTH-4"},economy:{prosperity_score:73,prosperity_label:"繁榮",market_price_mult:.99,stock_mult:1.12,market_budget_mult:1.18,liquidity_mult:1.17,drivers:["馬匹","羊毛","穀物轉運","布匹","鹽"],constraints:["市期波動","南北邊境政策","冬牧競爭"]},description:"汗國南界最穩定的固定市場。牲畜、羊毛與皮革向南換取穀物、布匹、鹽和金屬工具，庫存會隨市期與邊境通行實際波動。"}
];
const FIELDS=[
 {id:"L-WF-GOLDENGRASS",name:"金草會牧原",zoneId:"WF-Z-01",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"E",size:"開闊草原",tags:["plains"],template:"L-LOWFIELD",risk:15,gather:["WF-MAT-001","WF-MAT-003"],hunt:["WF-MAT-006"],preferred:["MON-WF-001","MON-WF-005","MON-WF-011"],explore:[["會牧界旗",25],["短草坡",25],["舊帳圈",20],["旱季水槽",15],["馬蹄路",15]],description:"汗庭周邊輪流開放的共同牧地；大型會盟後會暫時封養，避免集中牲畜把草根踩死。"},
 {id:"L-WF-HORSEBASIN",name:"馬湖淺盆",zoneId:"WF-Z-01",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"D",size:"季節水盆地",tags:["plains","water"],template:"L-RIVER",aquatic:true,risk:21,gather:["WF-MAT-004"],fish:["I-RAWFISH"],hunt:["WF-MAT-008"],preferred:["MON-WF-002","MON-WF-012","MON-WF-016"],explore:[["季節水面",25],["馬群飲水點",20],["蘆岸",20],["鹽痕地",20],["巡騎樁",15]],description:"雨水充足時形成淺湖，枯水期縮成數個水眼；飲水順序由水泉裁議會依牧群數量安排。"},
 {id:"L-WF-NORTHROAD",name:"北氈長路",zoneId:"WF-Z-02",province:"PROV-WF-02",smap:"SMAP-WF-02",tier:"D",size:"北境牧路",tags:["plains","road"],template:"L-LOWFIELD",risk:23,gather:["WF-MAT-001"],hunt:["WF-MAT-007"],preferred:["MON-WF-005","MON-WF-014","MON-WF-018"],explore:[["里程氈旗",25],["驛火坑",20],["凍泉槽",20],["商隊車轍",20],["北風丘",15]],description:"連接北氈驛與霜角南口方向的長距離牧路，寒潮時會分段封閉而不是強行維持全年通行。"},
 {id:"L-WF-FROSTFOOT",name:"霜腳草坡",zoneId:"WF-Z-02",province:"PROV-WF-02",smap:"SMAP-WF-02",tier:"E",size:"冷涼草坡",tags:["plains","hill"],template:"L-HILL",risk:18,gather:["WF-MAT-003"],hunt:["WF-MAT-006","WF-MAT-007"],preferred:["MON-WF-001","MON-WF-005","MON-WF-009"],explore:[["霜草帶",25],["岩背風穴",20],["兔徑",20],["舊狼柵",20],["積雪凹地",15]],description:"草海北緣的冷涼坡地，冬季草量快速下降，牧隊必須依配額南撤。"},
 {id:"L-WS-WHITEGRASS",name:"白草牧野",zoneId:"WF-Z-03",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",tier:"F",size:"草原",tags:["plains"],template:"L-LOWFIELD",risk:12,gather:["I-HERB","WF-MAT-001"],hunt:["WF-MAT-006"],preferred:["MON-WF-001","MON-WF-003","MON-WF-006"],description:"既有新手草原保留；牧群、野兔與小型掠食獸共享水草，採集與狩獵受新手區承載量限制。"},
 {id:"L-WS-GOOSEFORD",name:"雁回河灘",zoneId:"WF-Z-03",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",tier:"F",size:"季節河灘",tags:["plains","water"],template:"L-RIVER",aquatic:true,risk:13,gather:["WF-MAT-004"],fish:["I-RAWFISH"],preferred:["MON-WF-002","MON-WF-007"],description:"既有河灘保留；候鳥、牧隊與新手旅人共享補水點，雨季水位與旱季裸灘會改變可用資源。"},
 {id:"L-WF-REEDRIVER",name:"長蘆河灣",zoneId:"WF-Z-04",province:"PROV-WF-04",smap:"SMAP-WF-04",tier:"D",size:"蘆葦河灣",tags:["water","wetland"],template:"L-RIVER",aquatic:true,risk:22,gather:["WF-MAT-004"],fish:["I-RAWFISH"],hunt:["WF-MAT-006"],preferred:["MON-WF-002","MON-WF-007","MON-WF-015"],explore:[["高蘆帶",25],["舊渡樁",20],["魚窩",20],["洪水泥線",20],["雁群沙洲",15]],description:"白鐘河上游彎曲形成的濕地河灣，春汛時部分牧地會封閉，漁獲也有季節配額。"},
 {id:"L-WF-SALTMEADOW",name:"鹽草低地",zoneId:"WF-Z-04",province:"PROV-WF-04",smap:"SMAP-WF-04",tier:"D",size:"鹽化草甸",tags:["plains","wetland"],template:"L-LOWFIELD",risk:25,gather:["WF-MAT-003","WF-MAT-005"],hunt:["WF-MAT-008"],preferred:["MON-WF-011","MON-WF-016","MON-WF-020"],explore:[["鹽花泥地",25],["野牛足痕",20],["牧鹽草叢",20],["乾季裂紋",20],["舊取鹽坑",15]],description:"河漫低地蒸發留下鹽花，既是野生草獸補鹽地，也是受配額管理的小型河鹽來源。"},
 {id:"L-WF-BLUEFOOTHILL",name:"藍脊西麓",zoneId:"WF-Z-05",province:"PROV-WF-05",smap:"SMAP-WF-05",tier:"D",size:"石質丘陵",tags:["hill","mountain"],template:"L-HILL",risk:26,mining:["WF-MAT-010"],gather:["WF-MAT-001"],hunt:["WF-MAT-011"],preferred:["MON-WF-008","MON-WF-013","MON-WF-017"],explore:[["分水嶺石標",25],["燧石坡",20],["山羊道",20],["風化塔基",20],["小泉眼",15]],description:"藍脊高地向草海下落的石質丘陵，燧石可少量採取，但不得越過藍塔領地的山脊界標。"},
 {id:"L-WF-EASTSTEPPE",name:"灰狼東原",zoneId:"WF-Z-05",province:"PROV-WF-05",smap:"SMAP-WF-05",tier:"C",size:"邊境草原",tags:["plains","hill"],template:"L-LOWFIELD",risk:32,gather:["WF-MAT-001"],hunt:["WF-MAT-007","WF-MAT-008"],preferred:["MON-WF-014","MON-WF-019","MON-WF-021"],explore:[["巡騎界旗",25],["狼群路",20],["荒帳遺跡",20],["山麓乾谷",20],["遠望石台",15]],description:"灰狼旗帳最東側的巡牧原，大型掠食獸與邊界距離使此地維持C級受控威脅。"},
 {id:"L-WF-SOUTHPASTURE",name:"南帳冬牧原",zoneId:"WF-Z-06",province:"PROV-WF-06",smap:"SMAP-WF-06",tier:"E",size:"冬季牧原",tags:["plains"],template:"L-LOWFIELD",risk:17,gather:["WF-MAT-001","WF-MAT-003"],hunt:["WF-MAT-006"],preferred:["MON-WF-001","MON-WF-006","MON-WF-011"],explore:[["冬營圈",25],["乾草堆",20],["商旅路標",20],["井欄",20],["羊群坡",15]],description:"南界較溫和的冬季牧地，使用權依旗帳與年度水草狀況輪替，不是永久私有農田。"},
 {id:"L-WF-BELLSOURCE",name:"鐘源泉帶",zoneId:"WF-Z-06",province:"PROV-WF-06",smap:"SMAP-WF-06",tier:"D",size:"河源泉草地",tags:["water","plains"],template:"L-RIVER",aquatic:true,risk:20,gather:["WF-MAT-004"],fish:["I-RAWFISH"],preferred:["MON-WF-002","MON-WF-007","MON-WF-015"],explore:[["泉眼石槽",25],["南路橋基",20],["河源草甸",20],["商隊洗馬處",20],["水位刻石",15]],description:"白鐘河上游多股泉水匯合之處，水權由固定刻石與季節流量共同決定。"}
];
const DUNGEONS=[
 {id:"D-WF-KHANMOUND",name:"古汗丘陵墓",zoneId:"WF-Z-01",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"C",size:"古代丘陵墓",tags:["dungeon","ruins"],archetype:"tomb",allowMagical:true,risk:35,gather:["WF-MAT-014"],preferred:["MON-WF-022","MON-WF-013"],explore:[["石馬門",25],["封土甬道",20],["車輪紋壁",20],["陪葬庫",20],["石衛室",15]],description:"早期汗王的封土丘陵墓，受汗庭史官與誓儀所共同保護；開放區與封存區嚴格分離。"},
 {id:"D-WF-SKYVAULT",name:"天風石庫",zoneId:"WF-Z-01",province:"PROV-WF-01",smap:"SMAP-WF-01",tier:"D",size:"舊汗庭石庫",tags:["dungeon","ruins","cave"],archetype:"artificial_ruin",risk:27,gather:["WF-MAT-014"],preferred:["MON-WF-010","MON-WF-017"],explore:[["石庫坡道",25],["舊車帳槽",20],["乾糧室",20],["通風井",20],["封門銅片",15]],description:"固定岩層下的舊式公共物資庫，後因路線變動停用，現作為中低階勘查遺構。"},
 {id:"D-WF-NORTHBARROW",name:"北路石塚",zoneId:"WF-Z-02",province:"PROV-WF-02",smap:"SMAP-WF-02",tier:"D",size:"北境石塚群",tags:["dungeon","ruins"],archetype:"tomb",risk:29,gather:["WF-MAT-014"],preferred:["MON-WF-010","MON-WF-018"],explore:[["風蝕石塚",25],["舊驛火室",20],["封石縫",20],["獸穴側道",20],["北路刻記",15]],description:"歷代北路護送者與巡騎留下的石塚群，部分空洞被野獸利用，並非所有墓室都對冒險者開放。"},
 {id:"D-WS-STONERING",name:"石圈舊營",zoneId:"WF-Z-03",province:"PROV-START-15",smap:"SMAP-START-WINDSPRING",tier:"E",size:"半地下舊營",tags:["dungeon","ruins","plains","cave"],archetype:"artificial_ruin",risk:17,gather:["I-HERB","I-BRANCH","I-ORE-BRONZE"],preferred:["MON-WF-003","MON-WF-010"],description:"既有新手遺構保留；廢棄石圈下連著儲藏坑與避風地道，是風泉公會固定低階巡查點。"},
 {id:"D-WF-RIVERFORT",name:"雁河舊渡堡",zoneId:"WF-Z-04",province:"PROV-WF-04",smap:"SMAP-WF-04",tier:"D",size:"廢棄渡堡",tags:["dungeon","ruins","water"],archetype:"fort_ruin",aquatic:true,risk:30,gather:["WF-MAT-014"],preferred:["MON-WF-015","MON-WF-020"],explore:[["斷橋門",25],["水淹庫房",20],["渡稅石",20],["半塌箭樓",20],["河底暗門",15]],description:"舊時固定渡口留下的低矮石堡，河道改向後廢棄，春汛會淹沒底層。"},
 {id:"D-WF-SALTCAVE",name:"鹽草地窟",zoneId:"WF-Z-04",province:"PROV-WF-04",smap:"SMAP-WF-04",tier:"D",size:"乾燥地下鹽穴",tags:["dungeon","cave"],archetype:"cave",risk:28,mining:["WF-MAT-005"],preferred:["MON-WF-012","MON-WF-017"],explore:[["白鹽壁",25],["乾裂穴道",20],["獸舔痕",20],["舊取鹽籃",20],["低窄深穴",15]],description:"鹽化地下水留下的天然地窟，取鹽量受水泉裁議會年度配額限制。"},
 {id:"D-WF-EASTRUIN",name:"藍脊界塔遺址",zoneId:"WF-Z-05",province:"PROV-WF-05",smap:"SMAP-WF-05",tier:"C",size:"山麓界塔遺址",tags:["dungeon","ruins","mountain"],archetype:"tower_ruin",allowMagical:true,risk:36,mining:["WF-MAT-010"],preferred:["MON-WF-017","MON-WF-021","MON-WF-022"],explore:[["界塔基座",25],["碎裂符石",20],["風井",20],["崩塌樓梯",20],["封閉觀測室",15]],description:"比現代邊界更古老的石塔遺構，殘留少量防護構裝體與不穩定術式痕跡。"},
 {id:"D-WF-SOUTHCISTERN",name:"南界古蓄水窖",zoneId:"WF-Z-06",province:"PROV-WF-06",smap:"SMAP-WF-06",tier:"D",size:"地下蓄水設施",tags:["dungeon","ruins","water"],archetype:"waterway_ruin",aquatic:true,risk:26,gather:["WF-MAT-004"],preferred:["MON-WF-007","MON-WF-013","MON-WF-015"],explore:[["石槽入口",25],["沉沙池",20],["舊水尺",20],["維修側道",20],["封閉主窖",15]],description:"南方商牧帶早期為旱年建造的地下蓄水窖，部分通道仍有水但不再作主要飲水源。"}
];
const ITEMS=[
 {id:"WF-MAT-001",name:"草海香草",tier:"F",weight:0.08,value:7,description:"草海常見可食兼藥用香草，採集區需輪替。"},
 {id:"WF-MAT-002",name:"白絨羊毛",tier:"F",weight:0.35,value:18,description:"白氈羊群的主要纖維素材，來自季節剪毛而非野外無限採集。"},
 {id:"WF-MAT-003",name:"牧鹽草",tier:"F",weight:0.12,value:9,description:"耐鹽乾草，可作低階藥草與牲畜補鹽。"},
 {id:"WF-MAT-004",name:"長蘆根",tier:"F",weight:0.15,value:8,description:"河岸蘆草根莖，可食用也可用於簡易調劑。"},
 {id:"WF-MAT-005",name:"河鹽晶",tier:"E",weight:0.4,value:24,description:"鹽化河漫地與地下鹽穴的低階鹽晶，採取受配額限制。"},
 {id:"WF-MAT-006",name:"草原兔皮",tier:"F",weight:0.25,value:12,description:"小型草獸皮毛。"},
 {id:"WF-MAT-007",name:"灰狼皮",tier:"E",weight:1.8,value:42,description:"草原狼類的耐磨皮張。"},
 {id:"WF-MAT-008",name:"巨角鹿骨",tier:"E",weight:1.2,value:38,description:"大型草食獸自然脫角或狩獵所得骨角材。"},
 {id:"WF-MAT-009",name:"馬鬃束",tier:"F",weight:0.18,value:15,description:"梳理與修剪戰馬、馱馬所得的韌性纖維。"},
 {id:"WF-MAT-010",name:"藍脊燧石",tier:"E",weight:0.55,value:21,description:"東丘常見硬質燧石，可作打火與低階工具。"},
 {id:"WF-MAT-011",name:"岩蜥鱗",tier:"E",weight:0.4,value:27,description:"山麓岩蜥的粗硬鱗片。"},
 {id:"WF-MAT-012",name:"風脊巨鷲羽",tier:"D",weight:0.3,value:58,description:"大型草原猛禽的長羽，可作箭羽與工藝。"},
 {id:"WF-MAT-013",name:"地穴蟲甲",tier:"D",weight:0.7,value:46,description:"地穴大型節肢魔物的硬質外殼。"},
 {id:"WF-MAT-014",name:"古帳銅片",tier:"D",weight:0.18,value:52,description:"古汗庭遺構中的刻記銅片，受文物規則與回收登記限制。"}
];
const MONSTERS=[
 {id:"MON-WF-001",name:"草原兔",tier:"F",habitat:["L-WF-GOLDENGRASS","L-WF-FROSTFOOT","L-WS-WHITEGRASS","L-WF-SOUTHPASTURE"],hp:18,atk:4,def:2,acc:64,damage:[1,3],drops:["WF-MAT-006"],near:true,description:"常見小型草獸，受驚後高速逃竄。"},
 {id:"MON-WF-002",name:"灰雁",tier:"F",habitat:["L-WF-HORSEBASIN","L-WS-GOOSEFORD","L-WF-REEDRIVER","L-WF-BELLSOURCE"],hp:16,atk:4,def:2,acc:62,damage:[1,3],drops:[],near:true,description:"沿季節河與淺湖遷徙的普通候鳥。"},
 {id:"MON-WF-003",name:"風鼠",tier:"F",habitat:["L-WS-WHITEGRASS","D-WS-STONERING"],hp:20,atk:5,def:2,acc:66,damage:[1,4],drops:[],near:true,description:"會鑽入舊營地與乾糧窖的小型齧齒獸。"},
 {id:"MON-WF-004",name:"沙背小蜥",tier:"F",habitat:["L-WF-GOLDENGRASS","L-WF-SOUTHPASTURE"],hp:22,atk:5,def:3,acc:64,damage:[1,4],drops:["WF-MAT-011"],near:true,description:"伏在乾燥草根與石縫間的小型蜥類。"},
 {id:"MON-WF-005",name:"草原狼",tier:"E",habitat:["L-WF-GOLDENGRASS","L-WF-NORTHROAD","L-WF-FROSTFOOT"],hp:48,atk:11,def:6,acc:70,damage:[4,9],drops:["WF-MAT-007"],near:false,description:"成群巡獵的草原掠食者，會優先試探落單牲畜。"},
 {id:"MON-WF-006",name:"灰原狐",tier:"E",habitat:["L-WS-WHITEGRASS","L-WF-SOUTHPASTURE"],hp:38,atk:9,def:5,acc:72,damage:[3,7],drops:["WF-MAT-006"],near:true,description:"靠近牧營覓食的小型掠食獸。"},
 {id:"MON-WF-007",name:"蘆澤蛇",tier:"E",habitat:["L-WS-GOOSEFORD","L-WF-REEDRIVER","L-WF-BELLSOURCE","D-WF-SOUTHCISTERN"],hp:42,atk:10,def:5,acc:71,damage:[3,8],drops:[],near:false,description:"棲息河灘蘆葦與淺水石槽的伏擊蛇類。"},
 {id:"MON-WF-008",name:"野化盤羊",tier:"E",habitat:["L-WF-BLUEFOOTHILL"],hp:58,atk:12,def:8,acc:65,damage:[5,10],drops:["WF-MAT-008"],near:false,description:"山麓野化羊群，受到逼迫時會以角衝撞。"},
 {id:"MON-WF-009",name:"短牙野豬",tier:"E",habitat:["L-WF-FROSTFOOT"],hp:64,atk:13,def:8,acc:64,damage:[5,11],drops:[],near:false,description:"草坡灌叢中的雜食獸，護幼期特別危險。"},
 {id:"MON-WF-010",name:"地窖甲蟲",tier:"E",habitat:["D-WF-SKYVAULT","D-WF-NORTHBARROW","D-WS-STONERING"],hp:52,atk:10,def:10,acc:63,damage:[4,8],drops:["WF-MAT-013"],description:"在乾糧殘渣與朽木間繁殖的硬甲蟲。"},
 {id:"MON-WF-011",name:"巨角草鹿",tier:"D",habitat:["L-WF-GOLDENGRASS","L-WF-SALTMEADOW","L-WF-SOUTHPASTURE"],hp:92,atk:18,def:11,acc:68,damage:[7,14],drops:["WF-MAT-008"],description:"草海大型草食獸，遷徙期公鹿攻擊性高。"},
 {id:"MON-WF-012",name:"鹽穴岩蜥",tier:"D",habitat:["L-WF-HORSEBASIN","D-WF-SALTCAVE"],hp:84,atk:17,def:13,acc:70,damage:[7,13],drops:["WF-MAT-011"],description:"會舔食鹽晶的厚鱗蜥類。"},
 {id:"MON-WF-013",name:"藍脊岩蜥",tier:"D",habitat:["L-WF-BLUEFOOTHILL","D-WF-KHANMOUND","D-WF-SOUTHCISTERN"],hp:96,atk:19,def:15,acc:69,damage:[8,15],drops:["WF-MAT-011"],description:"山麓大型岩蜥，擅長伏在碎石坡。"},
 {id:"MON-WF-014",name:"荒原鬣犬",tier:"D",habitat:["L-WF-NORTHROAD","L-WF-EASTSTEPPE"],hp:88,atk:20,def:10,acc:73,damage:[8,15],drops:["WF-MAT-007"],description:"善於追逐疲弱獵物的群居掠食獸。"},
 {id:"MON-WF-015",name:"河灘泥怪",tier:"D",habitat:["L-WF-REEDRIVER","L-WF-BELLSOURCE","D-WF-RIVERFORT","D-WF-SOUTHCISTERN"],hp:104,atk:16,def:14,acc:64,damage:[7,14],drops:[],description:"由濕地魔力與腐殖泥形成的低階黏性魔物，不屬亡靈。"},
 {id:"MON-WF-016",name:"草海角牛",tier:"D",habitat:["L-WF-HORSEBASIN","L-WF-SALTMEADOW"],hp:122,atk:22,def:16,acc:65,damage:[9,17],drops:["WF-MAT-008"],description:"大型野生牛類，爭奪鹽草地時會衝擊入侵者。"},
 {id:"MON-WF-017",name:"地穴巨蟲",tier:"D",habitat:["L-WF-BLUEFOOTHILL","D-WF-SKYVAULT","D-WF-SALTCAVE","D-WF-EASTRUIN"],hp:98,atk:19,def:14,acc:68,damage:[8,15],drops:["WF-MAT-013"],description:"在乾燥洞穴與遺構下層築巢的節肢魔物。"},
 {id:"MON-WF-018",name:"北風巨鷲",tier:"D",habitat:["L-WF-NORTHROAD","D-WF-NORTHBARROW"],hp:86,atk:21,def:9,acc:76,damage:[8,16],drops:["WF-MAT-012"],description:"利用北風巡獵的巨型猛禽。"},
 {id:"MON-WF-019",name:"荒原巨狼",tier:"C",habitat:["L-WF-EASTSTEPPE"],hp:168,atk:31,def:20,acc:78,damage:[12,22],drops:["WF-MAT-007"],description:"東原少見的大型狼種，通常由巡騎發布警示後才開放討伐。"},
 {id:"MON-WF-020",name:"鹽地厚甲牛",tier:"C",habitat:["L-WF-SALTMEADOW","D-WF-RIVERFORT"],hp:188,atk:30,def:25,acc:68,damage:[12,23],drops:["WF-MAT-008"],description:"適應鹽化低地的厚皮大型草獸，受驚時極具衝擊力。"},
 {id:"MON-WF-021",name:"風穴翼蜥",tier:"C",habitat:["L-WF-EASTSTEPPE","D-WF-EASTRUIN"],hp:154,atk:30,def:19,acc:80,damage:[11,22],drops:["WF-MAT-011"],description:"能沿強風短距滑翔的山麓蜥類。"},
 {id:"MON-WF-022",name:"古墓石衛",tier:"C",habitat:["D-WF-KHANMOUND","D-WF-EASTRUIN"],hp:178,atk:28,def:28,acc:70,damage:[11,21],drops:["WF-MAT-014"],tags:["construct"],description:"古代遺構中仍能啟動的石製守衛構裝體，不屬亡靈。"}
];
const NPCS=[
 ["NPC-WF-001","阿勒坦．白馬","白氈大汗","C","L-WF-COURT","共同外交、五旗協調、汗庭移營與戰時授權","ORG-WF-COURT","汗庭引介／國事委託"],
 ["NPC-WF-002","賽因．白馬","白馬旗王","C","L-WF-COURT","汗庭護衛、良馬、會盟秩序","ORG-WF-COURT","旗帳情報／馬政"],
 ["NPC-WF-003","哈達．黑鷹","黑鷹旗王","C","L-WF-NORTHMART","北境牧路、霜角互市、遠距巡騎","ORG-WF-RIDERS","北境情報／護送"],
 ["NPC-WF-004","青婭．青河","青河旗王","C","L-WF-GOOSEMARKET","河岸牧地、渡口、水權與春汛","ORG-WF-WATER","渡運／水況情報"],
 ["NPC-WF-005","巴圖．赤原","赤原旗王","C","L-WF-SOUTHMART","南界季市、穀物輸入與商旅安全","ORG-WF-MARKET","市場情報／護送"],
 ["NPC-WF-006","烏恩．灰狼","灰狼旗王","C","L-WF-EASTWATCH","藍脊邊界、東原巡牧與大型掠食獸","ORG-WF-RIDERS","邊界情報／討伐"],
 ["NPC-WF-007","托日根．金轅","汗庭右相","C","L-WF-COURT","議帳程序、外使、五旗文書與決議執行","ORG-WF-COURT","政治檔案／外交引介"],
 ["NPC-WF-008","娜仁．白紙","汗庭史錄官","D","L-WF-COURT","汗統、盟誓、牧界與季移記錄","ORG-WF-COURT","正史查詢／檔案"],
 ["NPC-WF-009","額爾赫．長路","牧路總監","D","L-WF-NORTHMART","牧路開閉、驛站、草況與道路承載","ORG-WF-ROAD","路況／驛站委託"],
 ["NPC-WF-010","蘇荷．泉石","水泉裁議官","D","L-WF-GOOSEMARKET","泉眼、河灘、水槽與旱年分水規則","ORG-WF-WATER","水權資訊／調查"],
 ["NPC-WF-011","朝克．青鬃","馬政總管","D","L-WF-GOLDENWHEEL","戰馬、馱馬、育種、馬具與疫病隔離","ORG-WF-HORSE","馬匹交易／馬具"],
 ["NPC-WF-012","其木格．北風","北路驛長","D","L-WF-NORTHMART","補馬、風雪、北境商隊與霜角聯絡","ORG-WF-ROAD","驛站／互市情報"],
 ["NPC-WF-013","塔娜．風泉","風泉營長","E","L-START-WINDSPRING","新手巡牧、泉眼、村務與低階公會委託","ORG-WF-HERDS","新手委託／地方情報"],
 ["NPC-WF-014","博洛．乳泉","牧群師","E","L-WF-MARELAKE","幼畜、乳畜、剪毛與牧群健康","ORG-WF-HERDS","畜牧／素材收購"],
 ["NPC-WF-015","伊蘭．雁河","雁河渡市長","D","L-WF-GOOSEMARKET","渡口、魚市、春汛與橋渡承載","ORG-WF-MARKET","渡運／交易"],
 ["NPC-WF-016","薩日．鹽草","河鹽商","D","L-WF-GOOSEMARKET","河鹽配額、牧鹽草、季市庫存","","素材交易／市價情報"],
 ["NPC-WF-017","烏蘭．界石","東丘牧界官","D","L-WF-EASTWATCH","藍脊石標、共同泉眼與邊境糾紛","ORG-WF-RIDERS","邊境委託／引路"],
 ["NPC-WF-018","敏珠．南帳","南帳市監","D","L-WF-SOUTHMART","南界稅則、聖曜商隊、糧布與冬營","ORG-WF-MARKET","季市／商旅委託"],
 ["NPC-WF-019","其其格．草露","草海藥草師","D","L-WF-SOUTHMART","草海香草、蘆根、牧鹽草與低階調劑","","藥草收購／調劑"],
 ["NPC-WF-020","艾倫．遠轅","冒險者公會白氈聯絡官","C","L-WF-GOLDENWHEEL","冒險委託、地下城、怪物、生態限額與收購櫃檯","","冒險者委託／收購櫃檯"]
].map(x=>({id:x[0],name:x[1],role:x[2],tier:x[3],location_id:x[4],knowledge_scope:x[5],organization_ids:x[6]?[x[6]]:[],services:x[7].split("／"),combat_tier_ceiling:x[3],description:x[1]+"負責"+x[5]+"；政治地位、旗帳身分與個人戰力分開計算。"}));
const ORGS=[
 ["ORG-WF-COURT","汗庭議帳","government","C","L-WF-COURT","大汗、五旗與汗庭官署處理共同外交、跨旗爭議、季移路線與授權動員。"],
 ["ORG-WF-RIDERS","汗國巡騎","military","C","L-WF-NORTHMART","維護長距離牧路、邊界偵察、狼害通報、救援與有限共同防衛。"],
 ["ORG-WF-WATER","水泉裁議會","civic","D","L-WF-GOOSEMARKET","依季節流量、牧群規模與歷年界石裁定泉眼、河灘與水槽的使用順序。"],
 ["ORG-WF-HERDS","牧群總帳","civilian","D","L-START-WINDSPRING","彙整草況、牲畜疫病、剪毛、輪牧與幼畜保護資訊。"],
 ["ORG-WF-HORSE","馬政署","craft","D","L-WF-GOLDENWHEEL","管理驛馬、戰馬血統、馬具標準、隔離檢疫與汗庭公用馬匹。"],
 ["ORG-WF-ROAD","北氈牧路驛站會","civilian","D","L-WF-NORTHMART","共同維護驛火、飲水槽、里程氈旗與北氈牧路的開閉情報。"],
 ["ORG-WF-MARKET","草海季市聯會","trade","D","L-WF-SOUTHMART","協調固定季市、市期、商隊容量、秤量規則與跨境貨物流。"],
 ["ORG-WF-RITES","天幕誓儀所","ritual","D","L-WF-COURT","主持旗帳盟誓、汗庭大會禮儀、古汗陵保護與公共誓約見證。"]
].map(x=>({id:x[0],name:x[1],kind:x[2],tier:x[3],region_id:REGION_ID,base_location_id:x[4],description:x[5]}));
const HOOKS=[
 ["HOOK-WF-01","汗庭春營地少了一口井","春季移營前勘查發現傳統井水突然下降，必須確認淤塞、過度取水或地下水位變化。","E"],
 ["HOOK-WF-02","北氈驛失去三面路旗","寒潮將至，三段牧路的風向旗同時失蹤；驛站要求先恢復路標再放行商隊。","D"],
 ["HOOK-WF-03","雁群提前改道","候鳥突然避開雁河西岸，水泉裁議會擔心河水污染或上游生態異常。","D"],
 ["HOOK-WF-04","五旗馬印被仿造","季市出現仿造公用驛馬烙印，可能牽涉偷馬、走私或帳冊舞弊。","D"],
 ["HOOK-WF-05","藍脊界塔重新亮起","廢棄界塔夜間出現規律微光，東丘巡騎要求在不越界的前提下調查。","C"],
 ["HOOK-WF-06","古汗陵封石鬆動","暴雨後古汗陵外層封土塌陷，誓儀所需要冒險者先排除魔物與構裝體風險。","C"],
 ["HOOK-WF-07","南帳糧車延誤","約定北運的穀物商隊遲到，汗庭不能把尚未抵達的糧食算入冬營庫存。","D"],
 ["HOOK-WF-08","灰狼群越過輪牧線","大型狼群追逐野鹿進入幼畜牧區，需驅離、追蹤並確認是否有更強魔物逼迫牠們遷移。","D"]
];
const LIFE=[
 ["LIFE-WF-01","春移汗庭","大汗庭依草況、水位與傳統順序拆帳移營，政治服務與大型市場跟著移動。"],
 ["LIFE-WF-02","剪毛季","白絨羊集中剪毛，羊毛供應短期上升，但不代表全年都有同量庫存。"],
 ["LIFE-WF-03","分泉議日","旱季前各旗帳申報牧群數量，水泉裁議會重新分配泉眼與水槽使用時段。"],
 ["LIFE-WF-04","雁河春汛","河灘牧地暫停使用，渡口運能下降，魚群與蘆草採集區重新標記。"],
 ["LIFE-WF-05","北路開驛","霜角方向風雪減弱後逐站恢復驛火與商旅通行，北方貨物流量回升。"],
 ["LIFE-WF-06","南帳大市","馬匹、羊毛、皮革向南交換穀物、布匹、鹽與金屬工具，市場庫存快速變動。"],
 ["LIFE-WF-07","秋季封草","冬牧地在入冬前暫停放牧，以保留根系與乾草量給寒季使用。"],
 ["LIFE-WF-08","巡狼週","東部與北部巡騎集中記錄狼群與大型掠食獸位置，必要時發布討伐或封路。"]
];
const LORE=[
 ["LORE-WF-01","politics","汗國沒有永久首都","白氈大汗庭是季移政治中心，會依法定牧路移動；金轅市等固定市鎮維持文書、倉儲與交易連續性。"],
 ["LORE-WF-02","politics","大汗不能任意收走牧地","大汗主持共同外交、跨旗裁決與授權動員；旗帳、千戶與營帳仍保有日常牧地與家戶治理權。"],
 ["LORE-WF-03","law","水權比直線國界更實際","草海內部許多邊界依泉眼、季節河、牧路與界石運作；旱年會按既定程序調整使用時段。"],
 ["LORE-WF-04","economy","牲畜與市場都不是無限資源","馬匹、羊毛、肉類與皮革受繁殖、剪毛、草料、疫病和牧場承載量限制；季市也有實際庫存與收購預算。"],
 ["LORE-WF-05","military","巡騎不等於全民隨時總動員","汗國巡騎負責路線、偵察與邊境反應；跨五旗的大規模動員需汗庭議帳授權，除非共同防衛條件已成立。"],
 ["LORE-WF-06","geography","北氈牧路是南北生命線","北氈牧路連接霜角南口、汗庭與聖曜方向；寒潮、枯泉和大型集會都會改變可通行容量。"],
 ["LORE-WF-07","society","旗帳是政治共同體而非單一家族","五大旗帳包含多個氏族、千戶、附屬營帳與專職人員；旗王不能把所有成員視為私人家臣。"],
 ["LORE-WF-08","knowledge","最新草況必須靠近期情報","草場、水位、獸群與牧路每季改變；NPC與玩家只能依巡騎、牧民、驛站或實地調查取得合理資訊。"]
];

for(const x of TOWNS)upsert("locations",town(x));
for(const x of FIELDS)upsert("locations",field(x));
for(const x of DUNGEONS)upsert("locations",dungeon(x));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID,wild_gather_eligible:["WF-MAT-001","WF-MAT-003","WF-MAT-004"].includes(x.id)});
function mon(x){
 const drops=[...(x.drops||[])];
 return {id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:(x.tags||[]).includes("construct")?"構裝體":"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:1,ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},loot_materials:drops.map((id,i)=>({id,chance:Math.max(.18,.44-i*.08),min:1,max:1}))};
}
for(const x of MONSTERS)upsert("monsters",mon(x));
for(const x of NPCS)upsert("regional_npc_archetypes",{...x,region_id:REGION_ID,polity_id:POLITY_ID});
for(const x of ORGS)upsert("world_organizations",x);
for(const x of HOOKS)upsert("regional_adventure_hooks",{id:x[0],title:x[1],premise:x[2],tier:x[3],region_id:REGION_ID,polity_id:POLITY_ID});
for(const x of LIFE)upsert("regional_life_events",{id:x[0],name:x[1],text:x[2],region_id:REGION_ID,polity_id:POLITY_ID});
for(const x of LORE)upsert("lore_records",{id:x[0],category:x[1],title:x[2],text:x[3],scope_type:"polity",scope_id:POLITY_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,era_id:"ERA-05",source_refs:[POLITY_ID,REGION_ID],tags:["白氈汗國"],common_knowledge:true});

for(const z of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=FIELDS.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=DUNGEONS.filter(x=>x.zoneId===z.id).map(x=>x.id);
 const oldP=row("province_region_maps",z.province)||{},oldS=row("settlement_region_maps",z.smap)||{};
 upsert("province_region_maps",Object.assign({},oldP,{id:z.province,layer:"province_region",name:z.name,display_name:"白氈・"+z.name,administrative_type:z.type,parent_realm_map_id:REALM_ID,political_entity_id:POLITY_ID,world_region_id:REGION_ID,world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:uniq([...(oldP.all_settlement_ids||[]),...towns]),wild_location_ids:uniq([...(oldP.wild_location_ids||[]),...wilds]),dungeon_location_ids:uniq([...(oldP.dungeon_location_ids||[]),...dungeons]),economy:[...z.economy],recurring_risks:[...z.risks],identity:z.identity,white_felt_zone_id:z.id}));
 upsert("settlement_region_maps",Object.assign({},oldS,{id:z.smap,name:z.name+"區域",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",location_ids:uniq([...(oldS.location_ids||[]),...towns,...wilds,...dungeons]),role:z.identity,white_felt_zone_id:z.id}));
}
const EDGES=[
 ["L-WF-COURT","L-WF-GOLDENWHEEL",1.2],["L-WF-COURT","L-WF-NORTHMART",8],["L-WF-COURT","L-START-WINDSPRING",7],["L-WF-COURT","L-WF-GOOSEMARKET",7.5],["L-WF-COURT","L-WF-EASTWATCH",8],["L-WF-COURT","L-WF-SOUTHMART",9],
 ["L-WF-GOLDENWHEEL","L-WF-GOLDENGRASS",1],["L-WF-COURT","L-WF-HORSEBASIN",1.5],["L-WF-GOLDENWHEEL","D-WF-SKYVAULT",1.8],["L-WF-COURT","D-WF-KHANMOUND",2.5],
 ["L-WF-NORTHMART","L-WF-NORTHROAD",1],["L-WF-NORTHMART","L-WF-FROSTFOOT",1.4],["L-WF-NORTHROAD","D-WF-NORTHBARROW",1.7],
 ["L-START-WINDSPRING","L-WF-MARELAKE",2.3],["L-WF-MARELAKE","L-WS-WHITEGRASS",1.1],["L-START-WINDSPRING","L-WS-GOOSEFORD",1.6],["L-WS-WHITEGRASS","D-WS-STONERING",1.8],
 ["L-WF-GOOSEMARKET","L-WF-REEDRIVER",1],["L-WF-GOOSEMARKET","L-WF-SALTMEADOW",1.5],["L-WF-REEDRIVER","D-WF-RIVERFORT",1.5],["L-WF-SALTMEADOW","D-WF-SALTCAVE",1.4],
 ["L-WF-EASTWATCH","L-WF-BLUEFOOTHILL",1.1],["L-WF-EASTWATCH","L-WF-EASTSTEPPE",1.8],["L-WF-BLUEFOOTHILL","D-WF-EASTRUIN",1.7],
 ["L-WF-SOUTHMART","L-WF-SOUTHPASTURE",1],["L-WF-SOUTHMART","L-WF-BELLSOURCE",1.4],["L-WF-BELLSOURCE","D-WF-SOUTHCISTERN",1.5]
];for(const e of EDGES)twoWay(e[0],e[1],e[2]);
if(loc("L-FH-SOUTHPASS"))twoWay("L-WF-NORTHMART","L-FH-SOUTHPASS",7.5);

upsert("regional_content_profiles",{id:"RCP-WF-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"白氈汗國",recommended_tier:"F～C",identity:"霜角南方、聖曜北方的季移遊牧汗國；以白氈大汗、五大旗帳、汗庭官署、水泉裁議、千戶百戶與固定季市共同維持草海秩序。",terrain:"寒溫帶草原、緩丘、白鐘河上游、季節濕地、藍脊西麓與南部冬牧地",common_exports:["馬匹","羊毛","皮革","乳酪","牲畜","引路服務"],common_imports:["穀物","布匹","精製鐵器","鹽","高階藥劑"],food_staples:["乳酪","酸乳","風乾肉","麵餅","河魚","根莖湯"],recurring_risks:["旱季枯泉","寒潮封路","草場超載","春汛","狼害","牧地爭議","牲畜疫病"]});
upsert("regional_economy_profiles",{id:"ECO-WF-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["馬匹","羊毛","皮革","乳製品","牲畜","河魚"],imports:["穀物","布匹","鹽","金屬工具","高階藥材"],notes:"白氈經濟由牲畜繁殖、季節剪毛、草料、水源、市期與跨境商路共同限制。泉眼、牧地、鹽地、河漁、獵物與商鋪庫存皆有容量與恢復週期，不存在無限供應。"});

let realm=row("realm_region_maps",REALM_ID);
if(!realm)realm=upsert("realm_region_maps",{id:REALM_ID,layer:"realm_region",name:"白氈汗國區域地圖",display_name:"白氈汗國",political_entity_id:POLITY_ID,world_region_ids:[REGION_ID],province_region_ids:[],map_status:"playable_current",world_tier:"C"});
realm.name="白氈汗國區域地圖";realm.display_name="白氈汗國";realm.political_entity_id=POLITY_ID;realm.world_region_ids=uniq([...(realm.world_region_ids||[]),REGION_ID]);realm.province_region_ids=ZONES.map(x=>x.province);realm.regional_centers=["白氈大汗庭（季節移營）","金轅市","北氈驛","風泉村","乳泉營","雁河市","藍脊牧關","南帳市"];realm.map_status="playable_current";realm.banner_zones=ZONES.map(x=>({id:x.id,name:x.name,type:x.type}));realm.capital="無固定都城";realm.mobile_court="白氈大汗庭";realm.notes="六大地帶是季節牧區、旗帳治理與固定市鎮網絡，不是獨立國家；白氈汗國沒有永久首都，汗庭沿法定季牧圈移動。";

const polity=row("political_entities",POLITY_ID);
if(polity){
 Object.assign(polity,{capital:"無固定都城",government_type:"遊牧汗國",current_title:"白氈大汗",top_office:"白氈大汗",current_court:"白氈大汗庭（季節移營）",ruling_structure:"白氈大汗與五大旗帳在汗庭議帳處理共同外交、跨旗爭議、牧路、水源、季市與大型動員；千戶、百戶與營帳處理日常牧地和家戶治理。汗庭季移，但法令、史錄與使節制度保持連續。",legal_tradition:"旗帳盟誓、牧界石、水泉裁議、季市約法、驛路慣例與共同防衛條款",succession_method:"大汗候選出自汗族具資格支系，但必須獲五大旗帳主要代表與汗庭高級官署公開承認；不是單純長子自動繼位。",geographic_position:"霜角酋邦南方、聖曜帝國北方",identity:"位於北中部草海的季移遊牧汗國，以五大旗帳、季節牧路、水源裁議、馬群、固定季市與移動汗庭維繫政治共同體。",gameplay_role:"北中部遊牧汗國／騎戰、牧路、水權、跨境互市、草原生態與遺構探索",secondary_centers:["金轅市","北氈驛","風泉村","雁河市","藍脊牧關","南帳市"],economic_base:["馬匹","羊毛","牲畜","皮革","乳製品","河岸漁產","南北互市"],military_structure:["汗庭護衛","五旗巡騎","千戶百戶牧團武裝","北境與東境巡路","汗庭授權的共同動員"],current_tensions:["旱季水權","冬牧地容量","汗庭季移路線","北方霜角互市","南方糧布輸入","東部藍脊邊界","狼害與大型草獸","五旗發言權與汗權平衡"]});
 polity.banner_structure={major_banners:BANNERS.map(x=>x.name),representation_rule:"五大旗帳是共同政治骨架，各旗內仍包含多個氏族、千戶、百戶與附屬營帳。",great_khan_rule:"大汗掌共同外交、跨旗裁議與議帳授權下的大型動員，不直接占有所有牧地、水源、牲畜或家戶。",seasonal_court_rule:"汗庭依法定春夏秋冬營地移動；固定市鎮與史錄官維持制度連續，不能把當季座標誤判為永久首都。",resource_rule:"牧地、泉眼、河灘、鹽地與冬草都受季節承載、輪牧、封養和旱年規則限制。"};
 polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];for(const x of LORE)if(!polity.lore_record_ids.includes(x[0]))polity.lore_record_ids.push(x[0]);
}
const auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(auth){
 auth.office_nodes=Array.isArray(auth.office_nodes)?auth.office_nodes:[];
 const nodes=[
  {id:"POL-015-D1",title:"白氈大汗",authority_tier:"AUTH-6",authority_level:6,scope:"共同外交、跨旗裁議、汗庭季移與授權動員",appointment:"具資格汗族候選取得五旗與汗庭主要官署承認",rights:["AR-003","AR-004","AR-005","AR-008"],reports_to:null,notes:"不是草海全部土地與牲畜的私人所有者。"},
  {id:"POL-015-D2",title:"五大旗王",authority_tier:"AUTH-5",authority_level:5,scope:"主要旗帳、共同議案、跨旗牧地與危機表決",appointment:"各旗依自身傳統與汗庭承認產生",rights:["AR-003","AR-004","AR-005"],reports_to:null},
  {id:"POL-015-D3",title:"汗庭右相",authority_tier:"AUTH-5",authority_level:5,scope:"議帳程序、共同文書、外使與決議執行",appointment:"大汗提名、議帳確認",rights:["AR-003","AR-005","AR-008","AR-011"],reports_to:"POL-015-D1"},
  {id:"POL-015-D4",title:"牧路總監",authority_tier:"AUTH-4",authority_level:4,scope:"牧路、驛站、草況與季節通行",appointment:"汗庭任命",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-015-D3"},
  {id:"POL-015-D5",title:"水泉裁議官",authority_tier:"AUTH-4",authority_level:4,scope:"泉眼、河灘、水槽、旱年分水與水權爭議",appointment:"五旗與地方代表共同推舉",rights:["AR-003","AR-005"],reports_to:"POL-015-D3"},
  {id:"POL-015-D6",title:"馬政總管",authority_tier:"AUTH-4",authority_level:4,scope:"公用驛馬、戰馬、育種、馬具與疫病隔離",appointment:"汗庭任命",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-015-D3"},
  {id:"POL-015-D7",title:"邊帳將軍",authority_tier:"AUTH-4",authority_level:4,scope:"巡騎、邊境警戒與已授權的共同防衛",appointment:"大汗與相關旗王共同任命",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-015-D1"},
  {id:"POL-015-D8",title:"千戶長",authority_tier:"AUTH-3",authority_level:3,scope:"大型牧團、地方巡守與旗內行政",appointment:"旗帳制度產生",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-015-D2"},
  {id:"POL-015-D9",title:"百戶長／營帳長",authority_tier:"AUTH-2",authority_level:2,scope:"日常牧群、營地、水槽與家戶爭議",appointment:"地方傳統推舉／承認",rights:["AR-003","AR-005"],reports_to:"POL-015-D8"}
 ];
 for(const n of nodes){const i=auth.office_nodes.findIndex(x=>x.id===n.id);if(i>=0)auth.office_nodes[i]=n;else auth.office_nodes.push(n)}
 auth.rival_power_centers=["白氈大汗席","五大旗帳","水泉裁議會","馬政署","大型季市與驛站網"];
 auth.player_interaction_summary="低階主要接觸營帳長、風泉公會、驛站與牧群總帳；中階可進入水權、巡騎、旗帳與大型季市委託；大汗與五旗議帳層級保留給跨區域與外交事件。";
}

DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
DB.content_link_index.location_content=DB.content_link_index.location_content&&typeof DB.content_link_index.location_content==="object"?DB.content_link_index.location_content:{};
DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
for(const l of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>loc(x.id)).filter(Boolean))DB.content_link_index.location_content[l.id]={facility_ids:[...(l.facilities||[])],gather_item_ids:uniq([...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[])]),fish_item_ids:[...(l.fish||[])],encounter_monster_ids:MONSTERS.filter(m=>m.habitat.includes(l.id)).map(m=>m.id),companion_species_ids:[],organization_ids:ORGS.filter(o=>o.base_location_id===l.id).map(o=>o.id),pantheon_ids:[]};
for(const it of ITEMS){
 const s=DB.content_link_index.item_sources[it.id]=DB.content_link_index.item_sources[it.id]||{};
 for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];
 for(const l0 of [...FIELDS,...DUNGEONS])if(uniq([...(l0.gather||[]),...(l0.mining||[]),...(l0.woodcut||[]),...(l0.fish||[]),...(l0.hunt||[])]).includes(it.id)&&!s.gather_locations.includes(l0.id))s.gather_locations.push(l0.id);
 for(const m of MONSTERS)if((m.drops||[]).includes(it.id)&&!s.monster_drops.includes(m.id))s.monster_drops.push(m.id);
}
for(const [itemId,source] of [["WF-MAT-002","白氈羊群季節剪毛"],["WF-MAT-009","馬政署與牧群梳理"]]){const s=DB.content_link_index.item_sources[itemId];if(s&&!s.special_sources.includes(source))s.special_sources.push(source)}

{
 const facilityByOrg={"ORG-WF-COURT":"guild","ORG-WF-RIDERS":"guild","ORG-WF-WATER":"guild","ORG-WF-HERDS":"guild","ORG-WF-HORSE":"blacksmith","ORG-WF-ROAD":"inn","ORG-WF-MARKET":"general","ORG-WF-RITES":"church"};
 const bonusByKind={government:{statusResist:4},military:{moveSpeed:3},civic:{perception:4},civilian:{carryCapacity:5},craft:{craft_success:4},trade:{perception:3},ritual:{healingPower:3}};
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(x&&rank(x.combat_tier_ceiling)>rank("C"))x.combat_tier_ceiling="C"}
 for(const o0 of ORGS){
  const o=row("world_organizations",o0.id);if(!o)continue;
  o.political_entity_id=POLITY_ID;o.scope="地方／區域";o.alignment=o.alignment||"neutral";o.primary_facility=facilityByOrg[o.id]||"guild";o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;o.min_join_level=Math.max(1,Number(o.min_join_level)||1);o.join_reputation=Number(o.join_reputation)||0;o.visibility="public";o.legal_status="legal";
  o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"白氈職能會員訓練",effects:{...(bonusByKind[o.kind]||{perception:3})}};
  o.contact_location_ids=uniq([...(o.contact_location_ids||[]),o.base_location_id]);
  o.history=Array.isArray(o.history)&&o.history.length?o.history:["白氈的共同機構由長距離移牧、水源爭議、驛路、季市與跨旗協作逐步形成；其權力來自明確職責而不是單純血統。"];
  o.history_summary=o.history_summary||o.history.join(" ");o.current_state=o.current_state||"目前重點是維持牧路通行、水源公平、牲畜健康、市場容量與五旗協調。";
  o.signature=o.signature||({government:"季移汗庭與五旗議帳",military:"巡騎、牧路與快速邊境反應",civic:"水源與承載量裁議",civilian:"輪牧、驛站與牧群健康",craft:"馬匹、馬具與檢疫",trade:"有限庫存的季節市集",ritual:"公共盟誓與古汗陵保護"}[o.kind]||"白氈公共職責");
  o.distinctive_features=Array.isArray(o.distinctive_features)&&o.distinctive_features.length?o.distinctive_features:[o.signature,"政治中心可移動但制度連續","水源與牧場承載量高於固定地界"];
  o.institutional_culture=o.institutional_culture||"重視近期草況、可核對牧群數、路線情報、公開盟誓與跨旗責任。";o.strategic_tension=o.strategic_tension||"汗庭統合與旗帳自治、短期牲畜收益與長期草場承載、水源公平與大型市集需求之間持續協商。";
 }
 const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{});const verify=verifyKeys.includes("verified")?"verified":(verifyKeys[0]||"verified");
 for(const l of LORE){const x=row("lore_records",l[0]);if(x&&!x.verification)x.verification=verify}
 if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}
}

DB.white_felt_khanate={version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,structure:"白氈大汗＋五大旗帳＋汗庭官署＋千戶百戶與季節營帳；六大季牧／商牧地帶",major_banners:BANNERS.map(x=>clone(x)),zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),governance:{common_center:"白氈大汗庭（季節移營）",executive_role:"大汗代表汗國對外並執行議帳授權的共同決議",banner_autonomy:"五旗及其千戶、百戶保留日常牧地、家戶與地方秩序",war_rule:"跨五旗大型動員需汗庭議帳授權或共同防衛條件成立",resource_rule:"牧地、泉眼、河灘、鹽地、牲畜與季市庫存皆受季節容量、輪牧、封養與實際補給限制"},seasonal_court:{permanent_capital:false,court_name:"白氈大汗庭",rule:"依春夏秋冬法定牧圈移營；固定市鎮承接倉儲、文書與跨季服務"},save_compatible:true};

function audit(){
 const issues=[],p=row("political_entities",POLITY_ID);
 if(!p)issues.push("白氈政治體缺失");else{if(p.name!=="白氈汗國")issues.push("政治體名稱失步:"+p.name);if(p.capital!=="無固定都城")issues.push("白氈不應建立永久首都:"+p.capital)}
 if(BANNERS.length!==5)issues.push("主要旗帳應為5帳");if(ZONES.length!==6)issues.push("治理區應為6區");if(TOWNS.length!==8)issues.push("核心聚落應為8處");if(FIELDS.length!==12)issues.push("野外應為12處");if(DUNGEONS.length!==8)issues.push("地下城應為8處");if(MONSTERS.length!==22)issues.push("怪物應為22種");if(NPCS.length!==20)issues.push("核心NPC應為20名");if(ORGS.length!==8)issues.push("區域組織應為8個");if(ITEMS.length!==14)issues.push("區域素材應為14種");
 for(const z of ZONES){const pm=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pm)issues.push("治理區地圖缺失:"+z.name);if(!sm)issues.push("區域地圖缺失:"+z.name);const ids=sm?.location_ids||[];if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺聚落:"+z.name);if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺野外:"+z.name);if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺地下城:"+z.name)}
 for(const id of uniq([...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id))){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 for(const m0 of MONSTERS){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(rank(m.tier)>rank("C"))issues.push("REG-15一般怪物超過C級:"+m.id);if(!(m.habitat||[]).some(id=>loc(id)))issues.push("怪物棲地缺失:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落缺失:"+m.id+"->"+d.id)}
 for(const it of ITEMS){const s=DB.content_link_index?.item_sources?.[it.id];if(!s||(!(s.gather_locations||[]).length&&!(s.monster_drops||[]).length&&!(s.special_sources||[]).length))issues.push("素材來源缺失:"+it.id)}
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id)}
 for(const o of ORGS)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);for(const id of ["POL-015-D1","POL-015-D2","POL-015-D4","POL-015-D5","POL-015-D6","POL-015-D7"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(row("realm_region_maps",REALM_ID)?.province_region_ids?.length!==6)issues.push("區域地圖未完整掛載六大地帶");
 if(!loc("L-START-WINDSPRING")||loc("L-START-WINDSPRING")?.starter_cluster_id!=="L-START-WINDSPRING")issues.push("風泉村新手既有ID／出生叢集未保留");
 return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{major_banners:BANNERS.length,zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length}};
}
DB.meta=DB.meta||{};DB.meta.white_felt_depth_revision=REV;DB.white_felt_khanate.initial_audit=audit();
globalThis.runWhiteFeltDepthAudit=audit;
globalThis.QUNLU_WHITE_FELT=Object.freeze({version:REV,audit,banner_ids:BANNERS.map(x=>x.id),zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/white-felt-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();