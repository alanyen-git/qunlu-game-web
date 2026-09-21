/* 群陸旅誌：CURRENT政治體整併與疆域正史修訂 CURRENT-1.96.1
 * POLITY-CONSOLIDATION-1.2
 * 保留洛文／維薩南境／維爾河既有整併，同步修訂北方、東北、西南政治布局；
 * 黑潮群島恢復為獨立主權政治體，金衡回復為獨立貿易自由島。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.96.1")||"CURRENT-1.96.1";
const REV="POLITY-CONSOLIDATION-1.2";
const MERGE=Object.freeze({"POL-005":"POL-001","POL-006":"POL-007","POL-018":"POL-001"});
const RETIRED=Object.freeze(Object.keys(MERGE));
const polity=id=>(DB.political_entities||[]).find(x=>x?.id===id)||null;
const region=id=>(DB.world_regions||[]).find(x=>x?.id===id)||null;
const profile=id=>(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===id)||null;
const realm=id=>(DB.realm_region_maps||[]).find(x=>x?.id===id)||null;

const oldPolities=Object.fromEntries(RETIRED.map(id=>[id,polity(id)]));
DB.political_entities=(DB.political_entities||[]).filter(x=>!RETIRED.includes(x?.id));
DB.polity_authority_profiles=(DB.polity_authority_profiles||[]).filter(x=>!RETIRED.includes(x?.polity_id));
DB.realm_region_maps=(DB.realm_region_maps||[]).filter(x=>!["RMAP-POL-005","RMAP-POL-006","RMAP-POL-018"].includes(x?.id));

function remap(value,seen=new WeakSet()){
 if(value==null)return value;
 if(typeof value==="string")return MERGE[value]||value;
 if(typeof value!=="object")return value;
 if(seen.has(value))return value;seen.add(value);
 if(Array.isArray(value)){for(let i=0;i<value.length;i++)value[i]=remap(value[i],seen);return value}
 for(const k of Object.keys(value))value[k]=remap(value[k],seen);
 return value;
}
remap(DB);

const p1=polity("POL-001"),p7=polity("POL-007"),p8=polity("POL-008");
const p12=polity("POL-012"),p13=polity("POL-013"),p14=polity("POL-014"),p15=polity("POL-015"),p16=polity("POL-016"),p19=polity("POL-019");

if(p1)Object.assign(p1,{
 merged_polity_ids:["POL-005","POL-018"],
 direct_region_ids:["REG-01","REG-05","REG-18"],
 identity:"阿斯戴爾王冠直轄中央王原、維薩南境與縮小後的西境河谷；洛文仍是西境行政中樞，但不再構成獨立主權。"
});
if(p7)Object.assign(p7,{
 name:"卡薩維爾自由城盟",government_type:"自由都市",world_tier:"C",current_title:"城盟議長",
 ruling_structure:"卡薩維爾與維爾河成員城市共同組成城盟議會；卡薩維爾主持共同外交、防務與主要商路協調，各成員城市保留市政自治。",
 legal_tradition:"城市特許、河港盟約與行會慣例",
 identity:"以卡薩維爾為政治中樞、維爾河城市群為商路腹地的自由城盟。",
 gameplay_role:"中立河港城盟／多城市補給與商貿樞紐",
 merged_region_ids:["REG-06","REG-07"],secondary_centers:["維爾港"]
});
if(p8)Object.assign(p8,{
 name:"金衡自由都市",government_type:"自由都市",core_region_id:"REG-08",capital:"金衡港",current_title:"首席商監",
 ruling_structure:"金衡島由大商館、港務行會與自由市民議席共同治理；首席商監主持財政、港務與對外商約。",
 legal_tradition:"商約、債契、自由港章程與港口慣例",
 identity:"獨立的貿易自由島，以深水港、中立商法、倉儲、保險與跨國商館維持繁榮；不對黑潮群島主張主權。",
 gameplay_role:"獨立貿易自由島／大型中立商貿樞紐",
 merged_region_ids:["REG-08"],secondary_centers:[]
});
if(p12)Object.assign(p12,{geographic_position:"大陸西南方"});
if(p13)Object.assign(p13,{
 name:"安威爾帝國",government_type:"帝國",current_title:"安威爾皇帝",top_office:"安威爾皇帝",
 ruling_structure:"安威爾皇室統合主要山廳與氏族領；大氏族王、礦脈領主與工坊議席組成帝國議會，皇權必須維持氏族與山廳承認。",
 legal_tradition:"帝國山律、氏族石律與工匠誓約",
 dominant_peoples:"矮人為主的山地多族群",
 identity:"坐落大陸西北方的山地帝國；礦脈、祖墓、山口與工坊權利共同構成帝國疆界。",
 gameplay_role:"西北高階山地帝國／礦業與工藝強權",
 succession_method:"皇位以皇統世襲為主，仍需帝國議會與主要氏族承認。",
 regalia:["安威爾帝冠","深砧皇璽"],geographic_position:"大陸西北方"
});
if(p14)Object.assign(p14,{
 name:"泰爾瓦隆百族部落",government_type:"部落聯盟",capital:"泰爾瓦隆大營",
 current_title:"百族大酋長",top_office:"百族大酋長",
 ruling_structure:"東北草原、丘陵與林緣的多族部落以百族會盟維持共同水源、獵場與戰時指揮；平時各部保留高度自治。",
 dominant_peoples:"多種族部落（獸族、半獸人、人類與邊境族群）",
 identity:"位於大陸東北方，以百族會盟、圖騰誓約、遷徙地與共同獵場維繫的多族部落共同體。",
 gameplay_role:"東北部落共同體／邊境貿易與戰團文化",
 regalia:["百族戰圖騰","會盟角"],geographic_position:"大陸東北方"
});
if(p15)Object.assign(p15,{
 name:"白氈汗國",government_type:"遊牧汗國",capital:"無固定都城",
 identity:"白氈汗廷位於聖曜帝國北方、霜角酋邦南方；季節牧路、馬群與水源比城牆更重要。",
 gameplay_role:"北中部遊牧汗國／草原交通與騎戰勢力",
 regalia:["白氈金印","馬尾旌旗"],geographic_position:"聖曜帝國北方、霜角酋邦南方"
});
if(p16)Object.assign(p16,{identity:"位於大陸最北側的高地酋邦，重視款待、血親、越冬倉儲與山口控制。",geographic_position:"大陸最北側"});
if(p19)Object.assign(p19,{identity:"介於西北安威爾帝國與西南瑟露維亞精靈王庭之間的破碎緩衝地；廢堡、商站、強盜據點與小聚落各自維持秩序。",geographic_position:"安威爾帝國與瑟露維亞精靈王庭之間"});

let p10=polity("POL-010");
if(!p10){
 p10={
  id:"POL-010",index:10,name:"黑潮群島",government_type:"皓月御國－黑潮幕府雙軌島國",core_region_id:"REG-10",capital:"黑潮京",
  current_title:"潮皇／征夷大將軍",founding_year:131,world_tier:"C",
  ruling_structure:"世襲潮皇與王庭維繫祭祀、法統、冊封與群島共同象徵；征夷大將軍與黑潮幕府掌握軍政、海防、稅務與諸島治理，諸島大名向黑潮幕府效忠並受皓月御國名義冊封。",
  legal_tradition:"王庭敕令、武家法、島領慣例、港灣法與船誓",
  dominant_peoples:"多種族海島社會",recognized_pantheon_ids:["PTH-04","PTH-08"],key_organization_ids:["ORG-044","ORG-045"],culture_id:"CUL-010",
  identity:"由三大島、五小島與周圍小型海島構成的獨立群島國；皓月御國提供超越武門更替的法統，黑潮幕府負責實際軍政。",
  vassal_of:null,map_status:"world_background",player_center_rule:"政體持續運作且不因玩家出現而自動改朝換代。",
  lore_record_ids:["LORE-C190-P010-01","LORE-C190-P010-02","LORE-C190-P010-03","LORE-C190-P010-04"],
  gameplay_role:"海島雙軌政體／海戰、武門政治與群島貿易",
  primary_authority_archetype_id:"AUT-013",secondary_authority_archetype_ids:[],
  succession_method:"潮皇依王統世襲；征夷大將軍原則上由主導武門繼承並取得皓月御國冊命與主要大名承認，兩條繼承線彼此獨立。",
  regalia:["潮鏡御璽","征海將軍印"],top_office:"潮皇／征夷大將軍",authority_profile_id:"POL-010",top_authority_tier:"AUTH-7",
  continental_status:"recognized_offshore_polity",polity_family:"DUAL_COURT_SHOGUNATE",geographic_position:"大陸東南外海大型群島"
 };
 DB.political_entities.push(p10);
}
DB.political_entities.sort((a,b)=>(Number(a?.index)||999)-(Number(b?.index)||999));

for(const [rid,patch] of Object.entries({
 "REG-05":{political_entity_id:"POL-001",political_status:"asdail_direct_southern_region",sovereignty_note:"維薩南境屬阿斯戴爾王國直轄，地方家族保留議政慣例但無獨立主權。"},
 "REG-06":{political_entity_id:"POL-007",political_status:"free_city_league_member_region",sovereignty_note:"維爾河諸城為卡薩維爾自由城盟成員區；地方市政自治保留，共同外交與防務由城盟統籌。"},
 "REG-07":{political_entity_id:"POL-007",political_status:"free_city_league_core",sovereignty_note:"卡薩維爾為自由城盟共同議會所在地。"},
 "REG-08":{political_entity_id:"POL-008",political_status:"independent_free_trade_island",sovereignty_note:"金衡為獨立貿易自由島，不隸屬任何大陸王國，也不對黑潮群島主張主權。"},
 "REG-10":{political_entity_id:"POL-010",political_status:"recognized_archipelago_polity",sovereignty_note:"黑潮群島為獲承認的獨立群島政治體；皓月御國維繫法統，征夷大將軍黑潮幕府掌實際軍政。"},
 "REG-18":{political_entity_id:"POL-001",political_status:"asdail_compact_western_region",sovereignty_note:"西境河谷仍由阿斯戴爾直接治理，但世界地圖疆域縮小為洛文周邊河谷、商路與聚落帶。"}
})){
 const r=region(rid);if(r)Object.assign(r,patch);
}

const ap1=profile("POL-001"),ap7=profile("POL-007"),ap8=profile("POL-008"),ap13=profile("POL-013");
if(ap1){
 ap1.office_nodes=ap1.office_nodes||[];
 if(!ap1.office_nodes.some(x=>x.id==="POL-001-O6"))ap1.office_nodes.push(
  {id:"POL-001-O6",title:"西境總督",authority_tier:"AUTH-5",authority_level:5,scope:"縮小後的西境河谷與洛文王領行政",appointment:"國王任命",rights:["AR-003","AR-004","AR-005","AR-011"],reports_to:"POL-001-O1",authority_archetype_id:"AUT-002",parallel_authority_ids:[],notes:"西境為王國直轄行政區，不是獨立封臣主權。"},
  {id:"POL-001-O7",title:"洛文城王領執政官",authority_tier:"AUTH-4",authority_level:4,scope:"洛文城與西境稅務",appointment:"西境總督提名、王室確認",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-001-O6",authority_archetype_id:null,parallel_authority_ids:[],notes:"王國西境的城市行政中樞。"},
  {id:"POL-001-O8",title:"西境鎮守官／港務官／村長",authority_tier:"AUTH-3",authority_level:3,scope:"西境聚落與港務",appointment:"王國西境署或地方慣例",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-001-O7",authority_archetype_id:null,parallel_authority_ids:[],notes:"沿用地方自治慣例，但主權直接歸阿斯戴爾王冠。"}
 );
}
if(ap7){
 ap7.office_nodes=ap7.office_nodes||[];
 const top=ap7.office_nodes.find(x=>x.id==="POL-007-O1");
 if(top){top.title="城盟議長";top.scope="卡薩維爾自由城盟";top.appointment="卡薩維爾與維爾河成員城市共同推舉";}
 if(!ap7.office_nodes.some(x=>x.id==="POL-007-O4"))ap7.office_nodes.push(
  {id:"POL-007-O4",title:"維爾諸城議長",authority_tier:"AUTH-4",authority_level:4,scope:"維爾河成員城市",appointment:"維爾諸城代表互選",rights:["AR-003","AR-005","AR-008","AR-011"],reports_to:"POL-007-O1",authority_archetype_id:null,parallel_authority_ids:[],notes:"代表維爾河城市群進入城盟議會。"}
 );
}
if(ap8){
 ap8.office_nodes=(ap8.office_nodes||[]).filter(x=>!["POL-008-O4","POL-008-O5"].includes(x?.id));
 const top=ap8.office_nodes.find(x=>x.id==="POL-008-O1");if(top)top.scope="金衡自由貿易島";
 ap8.rival_power_centers=["大商館","護航傭兵","港口行會"];
 ap8.player_interaction_summary="玩家在金衡主要面對自由港商法、稅關、商館信用與跨海貿易，不涉及對黑潮群島的宗主權。";
}
if(ap13){
 const top=ap13.office_nodes?.find(x=>x.id==="POL-013-O1");
 if(top){top.title="安威爾皇帝";top.scope="安威爾帝國";top.appointment="皇統繼承＋帝國議會與主要氏族承認";top.authority_tier="AUTH-7";top.authority_level=7;}
 ap13.succession_method=p13?.succession_method||ap13.succession_method;
 ap13.regalia=p13?.regalia||ap13.regalia;
}
DB.polity_authority_profiles=(DB.polity_authority_profiles||[]).filter(x=>x?.polity_id!=="POL-010");
DB.polity_authority_profiles.push({
 polity_id:"POL-010",hierarchy_version:"AUTHORITY-1.0",top_office_ids:["POL-010-O1","POL-010-O2"],
 office_nodes:[
  {id:"POL-010-O1",title:"潮皇",authority_tier:"AUTH-7",authority_level:7,scope:"皓月御國法統、祭祀、冊封與群島共同象徵",appointment:"王統世襲",rights:["AR-001","AR-006","AR-011"],reports_to:null,authority_archetype_id:null,parallel_authority_ids:["POL-010-O2"],notes:"具有最高法統與冊命權，但日常軍政通常由黑潮幕府執行。"},
  {id:"POL-010-O2",title:"征夷大將軍",authority_tier:"AUTH-7",authority_level:7,scope:"黑潮幕府軍政、海防、稅務與諸島統治",appointment:"主導武門繼承＋皓月御國冊命＋主要大名承認",rights:["AR-003","AR-004","AR-005","AR-008"],reports_to:null,authority_archetype_id:"AUT-013",parallel_authority_ids:["POL-010-O1"],notes:"實際行政與軍事最高權力中心；不得取代潮皇王統的法統角色。"},
  {id:"POL-010-O3",title:"諸島大名",authority_tier:"AUTH-5",authority_level:5,scope:"各主要島領與武家領",appointment:"家門繼承／黑潮幕府安堵",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-010-O2",authority_archetype_id:null,parallel_authority_ids:[],notes:"領地世襲受黑潮幕府確認，名義上亦受王庭冊封。"},
  {id:"POL-010-O4",title:"奉行／港代",authority_tier:"AUTH-4",authority_level:4,scope:"港務、司法、財政與地方行政",appointment:"黑潮幕府或大名任命",rights:["AR-003","AR-005","AR-008"],reports_to:"POL-010-O3",authority_archetype_id:null,parallel_authority_ids:[],notes:"依職掌分為海防、港務、財賦與裁判等奉行。"}
 ],
 rival_power_centers:["皓月御國","黑潮幕府評定所","諸島大名","大型船團與港商"],
 player_interaction_summary:"玩家通常先接觸港代、武家與島領；高階劇情才會進入黑潮幕府評定或皓月御國冊命層。",
 succession_method:p10.succession_method,regalia:p10.regalia,
 notes:"潮皇與征夷大將軍是平行頂層：前者提供世襲法統與儀禮正統，後者掌實際軍政；兩者不可合併成單一君主職。"
});

const rm1=realm("RMAP-POL-001"),rm7=realm("RMAP-POL-007"),rm8=realm("RMAP-POL-008"),rm13=realm("RMAP-POL-013"),rm14=realm("RMAP-POL-014"),rm15=realm("RMAP-POL-015");
if(rm1){rm1.vassal_polity_ids=[];rm1.direct_region_ids=["REG-01","REG-05","REG-18"];rm1.regional_centers=["瑟倫堡","洛文城","維薩城"];}
if(rm7){rm7.name="卡薩維爾自由城盟區域地圖";rm7.world_tier="C";rm7.direct_region_ids=["REG-06","REG-07"];rm7.secondary_center="維爾港";}
if(rm8){rm8.name="金衡自由都市區域地圖";rm8.direct_region_ids=["REG-08"];delete rm8.secondary_center;}
if(rm13){rm13.name="安威爾帝國區域地圖";}
if(rm14){rm14.name="泰爾瓦隆百族部落區域地圖";rm14.capital="泰爾瓦隆大營";}
if(rm15){rm15.name="白氈汗國區域地圖";}
DB.realm_region_maps=(DB.realm_region_maps||[]).filter(x=>x?.id!=="RMAP-POL-010");
DB.realm_region_maps.push({id:"RMAP-POL-010",layer:"realm_region",name:"黑潮群島區域地圖",political_entity_id:"POL-010",world_tier:"C",capital:"黑潮京",core_region_id:"REG-10",map_status:"macro_background",province_region_ids:[],vassal_polity_ids:[],direct_region_ids:["REG-10"],regional_centers:["黑潮京","黑潮灣"],notes:"三大島、五小島與周圍小型海島構成同一獨立群島國；皓月御國與黑潮幕府為平行頂層權力。"});
DB.realm_region_maps.sort((a,b)=>String(a?.id||"").localeCompare(String(b?.id||"")));

if(DB.world_map){
 DB.world_map.realm_region_map_ids=(DB.world_map.realm_region_map_ids||[]).filter(x=>!["RMAP-POL-005","RMAP-POL-006","RMAP-POL-018"].includes(x));
 if(!DB.world_map.realm_region_map_ids.includes("RMAP-POL-010"))DB.world_map.realm_region_map_ids.push("RMAP-POL-010");
 DB.world_map.regional_power_region_ids=(DB.world_map.regional_power_region_ids||[]).filter(x=>x!=="REG-10");
 DB.world_map.notes="CURRENT世界層：阿斯戴爾直轄西境與維薩南境；卡薩維爾自由城盟整合維爾河；金衡為獨立貿易自由島；黑潮群島為皓月御國－黑潮幕府雙軌的獨立海島政治體。";
}

const rp10=(DB.regional_powers||[]).find(x=>x?.id==="RP-010");
if(rp10)Object.assign(rp10,{
 name:"黑潮幕府",category:"黑潮群島軍政機構",recognized_sovereignty:false,leader_title:"征夷大將軍",base:"黑潮灣",
 parent_polity_id:"POL-010",restored_polity_id:"POL-010",
 structure:"黑潮幕府以征夷大將軍、老中評定、海防奉行與諸島大名構成軍政網絡；它是POL-010內部的實權政府，而不是另一個獨立國家。",
 authority_ceiling:"AUTH-7",political_role:"黑潮群島主權政治體內部的黑潮幕府軍政權力中心，與皓月御國形成法統／實權雙軌。"
});
if(rp10)delete rp10.legacy_polity_id;
const rpa10=(DB.regional_power_authority_profiles||[]).find(x=>x?.regional_power_id==="RP-010");
if(rpa10)Object.assign(rpa10,{top_office:"征夷大將軍",authority_tier:"AUTH-7",sovereign_rights:false,notes:"黑潮幕府擁有POL-010授權下的軍政實權；國家主權與法統仍屬POL-010整體，而非RP-010自身。"});
const rpr10=(DB.regional_power_relations||[]).find(x=>x?.b==="RP-010"||x?.a==="RP-010");
if(rpr10)Object.assign(rpr10,{a:"POL-010",b:"RP-010",score:92,state:"dual_government",reason:"皓月御國提供群島法統與冊封，黑潮幕府評定所掌握日常軍政；兩者是同一主權國家的平行權力層。"});

DB.retired_polity_aliases=DB.retired_polity_aliases||{};
DB.retired_polity_aliases["POL-010"]={status:"restored_as_polity",current_id:"POL-010",legacy_regional_power_id:"RP-010",legacy_name:"黑潮船長同盟"};
DB.political_merge_map={...(DB.political_merge_map||{}),...MERGE};

if(Array.isArray(DB.political_relations)&&!DB.political_relations.some(x=>[x?.a,x?.b].includes("POL-010")&&[x?.a,x?.b].includes("POL-008"))){
 DB.political_relations.push({a:"POL-008",b:"POL-010",score:12,state:"maritime_trade_rivalry",reason:"金衡依靠自由港金融與商館網絡，黑潮依靠群島航道與黑潮幕府海防；雙方既互市也競爭轉口、護航與海上影響力。",start_year:317,historical_basis:"黑潮主權校正後，雙方以平等政治體身分重訂海上商約。",relationship_tags:["外交","商路","競爭"],current_effects:["影響海運關稅、護航、通商與港口委託。"],escalation_triggers:["扣船","關稅衝突","海上私鬥"],deescalation_triggers:["共同護航","商約互惠","海盜仲裁"],verification:"current"});
}

const upsertLore=row=>{
 DB.lore_records=DB.lore_records||[];
 const i=DB.lore_records.findIndex(x=>x?.id===row.id);
 if(i>=0)DB.lore_records[i]=row;else DB.lore_records.push(row);
};
upsertLore({id:"LORE-C190-P010-01",scope_type:"polity",scope_id:"POL-010",category:"founding",title:"黑潮群島雙軌政體的形成",text:"黑潮諸島原有皓月御國法統、武門與船團多層秩序；紀元131年前後的海上法典與武門整合，使征夷大將軍黑潮幕府成為實際軍政中樞，而皓月御國持續維繫祭祀、冊封與群島共同法統。過往外國資料曾把黑潮幕府船團誤記為無主權的船長同盟。",verification:"recorded",era_id:"ERA-05",source_refs:["POL-010","RP-010","REG-10"],tags:["政治史","正史修訂"],common_knowledge:false});
upsertLore({id:"LORE-C190-P010-02",scope_type:"polity",scope_id:"POL-010",category:"governance",title:"黑潮群島的皓月御國與黑潮幕府",text:"潮皇依王統世襲，掌祭祀、冊封與法統；征夷大將軍掌海防、稅務、司法與諸島軍政。諸島大名在黑潮幕府安堵下治理島領，同時接受皓月御國名義冊封。兩條權力線互相需要，但不是單一職位。",verification:"current",era_id:"ERA-05",source_refs:["POL-010","RP-010"],tags:["政治文化","權力結構"],common_knowledge:false});
upsertLore({id:"LORE-C190-P010-03",scope_type:"polity",scope_id:"POL-010",category:"current_context",title:"黑潮群島・紀元317年",text:"黑潮群島目前是獲承認的獨立海島政治體，由三大島、五小島與周圍小型海島構成。皓月御國維持法統，黑潮幕府掌實際軍政；金衡自由都市是平等的外國貿易夥伴與競爭者。",verification:"current",era_id:"ERA-05",source_refs:["POL-010","REG-10","POL-008"],tags:["當代政治"],common_knowledge:false});
upsertLore({id:"LORE-C190-P010-04",scope_type:"polity",scope_id:"POL-010",category:"authority_structure",title:"黑潮群島的權力層級",text:"最高層由皓月御國與征夷大將軍黑潮幕府並立。潮皇掌法統、祭祀與冊命；大將軍掌軍政。其下為諸島大名、黑潮幕府老中與各類奉行，再下接武家、港代與島民社群。",verification:"current",era_id:"ERA-05",source_refs:["POL-010","RP-010"],tags:["政治體","權力層級"],common_knowledge:false});

const oldCurrent=(DB.lore_records||[]).find(x=>x?.id==="LORE-0315");
if(oldCurrent){oldCurrent.category="superseded_external_record";oldCurrent.verification="recorded";oldCurrent.text="舊外國資料曾把黑潮幕府船團誤判為沒有統一主權的『黑潮船長同盟』；CURRENT正史已由POL-010黑潮群島的皓月御國－黑潮幕府雙軌制度取代此判讀。";}

if(DB.continental_political_order){
 const cpo=DB.continental_political_order;
 const governed=(DB.political_entities||[]).filter(x=>x?.continental_status!=="recognized_nonstate_zone");
 const nonstate=(DB.political_entities||[]).filter(x=>x?.continental_status==="recognized_nonstate_zone");
 const rpids=(DB.regional_powers||[]).map(x=>x.id);
 cpo.recognized_mainland_polity_ids=(DB.political_entities||[]).filter(x=>x?.continental_status==="recognized_mainland_polity").map(x=>x.id);
 cpo.recognized_mainland_polity_count=cpo.recognized_mainland_polity_ids.length;
 cpo.governed_polity_count=governed.length;
 cpo.nonstate_political_zone_count=nonstate.length;
 cpo.regional_power_ids=rpids;cpo.regional_power_count=rpids.length;
 cpo.political_unit_count=governed.length+nonstate.length+rpids.length;
 cpo.political_blocks={...(cpo.political_blocks||{}),maritime_island_polities:["POL-008","POL-010"]};
 cpo.rules=(cpo.rules||[]).filter(x=>!String(x).includes("黑潮群島屬金衡")&&!String(x).includes("卡薩維爾－維爾河")).concat([
  "黑潮群島（POL-010）是獨立主權政治體；RP-010僅代表其內部黑潮幕府軍政機構，不得再次當作外部國家。",
  "金衡自由都市（POL-008）是獨立貿易自由島，只控制REG-08，不擁有REG-10黑潮群島。",
  "卡薩維爾與維爾河成員城市共同構成卡薩維爾自由城盟（POL-007）。",
  "洛文與維薩南境屬阿斯戴爾王國直轄；西境河谷在世界地圖的面積已縮小。"
 ]);
}

if(DB.political_system){
 DB.political_system.version="POLITY-1.4";DB.political_system.entity_count=DB.political_entities.length;
 DB.political_system.rules=(DB.political_system.rules||[]).filter(x=>!String(x).includes("黑潮群島已納入金衡")&&!String(x).includes("黑潮船長同盟與鐵旗")&&!String(x).includes("卡薩維爾－維爾河")).concat([
  "洛文邊侯領與維薩林貴族共和國仍退出CURRENT政治名錄，現為阿斯戴爾王國直轄區域。",
  "維爾河城市群與卡薩維爾共同構成卡薩維爾自由城盟。",
  "黑潮群島恢復為POL-010獨立主權政治體；皓月御國掌法統、黑潮幕府掌軍政。",
  "金衡自由都市為獨立貿易自由島，不再擁有黑潮群島。"
 ]);
}
if(DB.authority_system){
 DB.authority_system.version="AUTHORITY-1.3";
 DB.authority_system.polity_profile_count=DB.polity_authority_profiles.length;
}
if(DB.integration_registry?.counts){
 DB.integration_registry.counts.political_entities=DB.political_entities.length;
 DB.integration_registry.counts.polity_authority_profiles=DB.polity_authority_profiles.length;
 DB.integration_registry.counts.realm_region_maps=DB.realm_region_maps.length;
}
if(Array.isArray(DB.integration_registry?.optimization_notes))DB.integration_registry.optimization_notes.push(RELEASE+"／"+REV+"：政治版圖再推演；安威爾帝國西北、泰爾瓦隆百族部落東北、白氈汗國位於霜角與聖曜之間、精靈王庭西南、斷境置於安威爾與精靈王庭間；黑潮群島恢復獨立主權，金衡回復獨立貿易自由島。");

DB.canon_retcons=DB.canon_retcons||[];
if(!DB.canon_retcons.some(x=>x?.version==="CURRENT-1.90.0"&&String(x?.replacement||"").includes("黑潮群島"))){
 DB.canon_retcons.push({
  version:"CURRENT-1.90.0",
  retired_assumption:"金衡自由都市對黑潮群島擁有主權；石冠氏族王國、赤牙部族聯盟、風鬃汗國與舊地圖位置仍為CURRENT正史。",
  replacement:"石冠氏族王國更名安威爾帝國並移至西北；赤牙部族聯盟更名泰爾瓦隆百族部落並移至東北；風鬃汗國更名白氈汗國並位於霜角南、聖曜北；精靈王庭移西南；斷境置於精靈王庭與安威爾之間；卡薩維爾城盟改名；西境河谷縮小；黑潮群島成為皓月御國－黑潮幕府雙軌的獨立主權體，金衡成為獨立貿易自由島。",
  reason:"讓政治體數量、相對地理、海島主權與疆域結構符合最新世界設計。",
  save_compatibility:"保留POL-005→POL-001、POL-006→POL-007、POL-018→POL-001；POL-010由legacy alias恢復為CURRENT政治體，RP-010保留為其黑潮幕府軍政內部勢力。"
 });
}

function rewrite(v){
 if(v==null)return v;
 if(typeof v==="string")return v
  .replaceAll("卡薩維爾－維爾河自由城盟","卡薩維爾自由城盟")
  .replaceAll("石冠氏族王國","安威爾帝國")
  .replaceAll("赤牙部族聯盟","泰爾瓦隆百族部落")
  .replaceAll("赤牙部落聯盟","泰爾瓦隆百族部落")
  .replaceAll("風鬃汗國","白氈汗國")
  .replaceAll("洛文邊侯領","阿斯戴爾西境")
  .replaceAll("維薩林貴族共和國","阿斯戴爾維薩南境")
  .replaceAll("維爾河城邦同盟","卡薩維爾自由城盟");
 if(typeof v!=="object")return v;
 if(Array.isArray(v)){for(let i=0;i<v.length;i++)v[i]=rewrite(v[i]);return v}
 for(const k of Object.keys(v))v[k]=rewrite(v[k]);
 return v;
}
for(const x of [DB.locations,DB.dialogue_database?.records,DB.intel_database?.records,DB.regional_content_profiles,DB.regional_npc_archetypes,DB.regional_adventure_hooks,DB.regional_life_events,DB.regional_economy_profiles,DB.generator_material_packs,DB.management_ai])if(x)rewrite(x);

if(DB.history_entity_index&&typeof DB.history_entity_index==="object"){
 DB.history_entity_index["POL-010"]=[...new Set([...(DB.history_entity_index["POL-010"]||[]),...(DB.history_entity_index["RP-010"]||[]),...(DB.history_entity_index["REG-10"]||[])])];
}
if(DB.historical_relationship_index&&typeof DB.historical_relationship_index==="object"){
 DB.historical_relationship_index["polity:POL-010"]=[...new Set([...(DB.historical_relationship_index["polity:POL-010"]||[]),...(DB.historical_relationship_index["regional_power:RP-010"]||[])])];
}
if(DB.lore_system&&typeof DB.lore_system==="object")DB.lore_system.record_count=(DB.lore_records||[]).length;

if(Array.isArray(DB.lore_records)){
 const rebuilt={};
 for(const r of DB.lore_records){
   const key=String(r.scope_type||"world")+":"+String(r.scope_id||"global");
   (rebuilt[key]||(rebuilt[key]=[])).push(r.id);
 }
 DB.lore_query_index=rebuilt;
}

function audit(){
 const issues=[];
 const active=new Set((DB.political_entities||[]).map(x=>x.id));
 if(active.size!==16)issues.push("CURRENT政治體應為16："+active.size);
 for(const id of RETIRED)if(active.has(id))issues.push("已整併政治體仍在CURRENT名錄："+id);
 for(const [rid,pid] of Object.entries({"REG-05":"POL-001","REG-06":"POL-007","REG-07":"POL-007","REG-08":"POL-008","REG-10":"POL-010","REG-18":"POL-001"}))if(region(rid)?.political_entity_id!==pid)issues.push("主權歸屬錯誤："+rid+"->"+region(rid)?.political_entity_id);
 if((DB.polity_authority_profiles||[]).length!==16)issues.push("政治權力profile應為16："+(DB.polity_authority_profiles||[]).length);
 if((DB.realm_region_maps||[]).some(x=>["RMAP-POL-005","RMAP-POL-006","RMAP-POL-018"].includes(x.id)))issues.push("舊政治體區域地圖仍啟用");
 if(!realm("RMAP-POL-010"))issues.push("黑潮群島區域地圖缺失");
 if(polity("POL-007")?.name!=="卡薩維爾自由城盟")issues.push("卡薩維爾自由城盟名稱未更新");
 if(polity("POL-013")?.name!=="安威爾帝國")issues.push("安威爾帝國名稱未更新");
 if(polity("POL-014")?.name!=="泰爾瓦隆百族部落")issues.push("泰爾瓦隆百族部落名稱未更新");
 if(polity("POL-015")?.name!=="白氈汗國")issues.push("白氈汗國名稱未更新");
 if(!profile("POL-001")?.office_nodes?.some(x=>x.id==="POL-001-O6"))issues.push("阿斯戴爾西境直轄官署缺失");
 if(!profile("POL-007")?.office_nodes?.some(x=>x.id==="POL-007-O4"))issues.push("維爾城盟官署缺失");
 if(!profile("POL-010")?.office_nodes?.some(x=>x.id==="POL-010-O1")||!profile("POL-010")?.office_nodes?.some(x=>x.id==="POL-010-O2"))issues.push("黑潮王庭／黑潮幕府雙軌官署缺失");
 if((DB.regional_powers||[]).find(x=>x.id==="RP-010")?.parent_polity_id!=="POL-010")issues.push("RP-010未降為黑潮內部黑潮幕府機構");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{political_entities:active.size,authority_profiles:(DB.polity_authority_profiles||[]).length,realm_maps:(DB.realm_region_maps||[]).length}};
}
DB.political_consolidation_system={version:REV,release:RELEASE,merge_map:{...MERGE},audit:audit(),save_compatible:true};
DB.meta=DB.meta||{};DB.meta.political_consolidation_revision=REV;
globalThis.runPoliticalConsolidationAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/political-consolidation-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();