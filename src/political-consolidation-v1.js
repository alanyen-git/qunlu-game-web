/* 群陸旅誌：CURRENT政治體整併 CURRENT-1.89.0
 * POLITY-CONSOLIDATION-1.0
 * 將洛文與維薩南境納入阿斯戴爾直轄、維爾河與卡薩維爾合併、黑潮群島納入金衡。
 * 舊政治體ID只保留為存檔／歷史遷移別名，不再出現在CURRENT政治名錄。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.89.0")||"CURRENT-1.89.0";
const REV="POLITY-CONSOLIDATION-1.0";
const MERGE=Object.freeze({"POL-005":"POL-001","POL-006":"POL-007","POL-018":"POL-001"});
const RETIRED=new Set(Object.keys(MERGE));
const uniq=(...xs)=>[...new Set(xs.flat().filter(Boolean))];
const polity=id=>(DB.political_entities||[]).find(x=>x.id===id);
const region=id=>(DB.world_regions||[]).find(x=>x.id===id);
const profile=id=>(DB.polity_authority_profiles||[]).find(x=>x.polity_id===id);

const old005=polity("POL-005"),old006=polity("POL-006"),old018=polity("POL-018");
const p1=polity("POL-001"),p7=polity("POL-007"),p8=polity("POL-008");

if(p1)Object.assign(p1,{
 identity:"王冠以中央王原為核心，並直接治理西境洛文與維薩南境；騎士封邑、河谷商路與地方議政傳統共同支撐王權。",
 recognized_pantheon_ids:uniq(p1.recognized_pantheon_ids,old005?.recognized_pantheon_ids,old018?.recognized_pantheon_ids),
 key_organization_ids:uniq(p1.key_organization_ids,old005?.key_organization_ids,old018?.key_organization_ids),
 lore_record_ids:uniq(p1.lore_record_ids,old005?.lore_record_ids,old018?.lore_record_ids),
 gameplay_role:"主要王國勢力／中央王原、西境與維薩南境直轄",
 merged_region_ids:["REG-01","REG-05","REG-18"],
 regional_centers:["瑟倫堡","洛文城","維薩城"],
 consolidation_note:"洛文邊侯領與維薩林貴族共和國不再作為CURRENT獨立政治體；其土地與地方制度納入阿斯戴爾王國直轄行政。"
});
if(p7)Object.assign(p7,{
 name:"卡薩維爾－維爾河自由城盟",world_tier:"C",current_title:"城盟議長",
 ruling_structure:"卡薩維爾市議堂與維爾河諸城議會共同組成城盟議會；卡薩維爾主持外交與盟約，維爾港主管河海商路、橋關與共同防務。",
 legal_tradition:"城市特許、行會慣例與維爾河共同盟約",
 recognized_pantheon_ids:uniq(p7.recognized_pantheon_ids,old006?.recognized_pantheon_ids),
 key_organization_ids:uniq(p7.key_organization_ids,old006?.key_organization_ids),
 lore_record_ids:uniq(p7.lore_record_ids,old006?.lore_record_ids),
 identity:"由卡薩維爾自由都市與維爾河城邦網合併形成的河港自由城盟，以自治城市、橋路、港務與共同護航維持統一主權。",
 gameplay_role:"中立河港自由城盟／跨區補給與護航網",
 succession_method:"卡薩維爾與維爾河諸城代表依盟約推舉城盟議長；各成員城市保留地方市政，但外交、防務與跨城關稅由城盟議會統籌。",
 regalia:uniq(p7.regalia,["維爾盟約印章","橋城之槌"]),top_office:"城盟議長",
 civic_specialization:"river_city_league",
 government_note:"主權類型仍歸自由都市體系，但已由單一都市擴展為卡薩維爾與維爾河諸城組成的自由城盟。",
 merged_region_ids:["REG-06","REG-07"],secondary_centers:["維爾港"],associated_culture_ids:["CUL-006","CUL-007"]
});
if(p8)Object.assign(p8,{
 ruling_structure:"金衡市議堂由大商館、港務行會、市民代表與黑潮群島自治船長席共同構成；首席商監主持財政、海防與對外商務。",
 key_organization_ids:uniq(p8.key_organization_ids,["ORG-044","ORG-045"]),
 identity:"金衡港以商館與深水港為核心，主權延伸至黑潮群島；島上船長社群保留停泊、分贓與港灣自治慣例，但外交與主權歸金衡。",
 gameplay_role:"大型商貿中立勢力／黑潮群島海上自治領",
 government_note:"自由都市本土與黑潮群島採一體主權、分區自治；黑潮船長議會是內部海上自治勢力，不再構成外部主權競爭者。",
 merged_region_ids:["REG-08","REG-10"],secondary_centers:["黑潮灣"],associated_culture_ids:["CUL-008","CUL-010"]
});

/* 先移除被整併的CURRENT主資料，避免後續ID重映造成重複主鍵。 */
DB.political_entities=(DB.political_entities||[]).filter(x=>!RETIRED.has(x.id));
DB.polity_authority_profiles=(DB.polity_authority_profiles||[]).filter(x=>!RETIRED.has(x.polity_id));
DB.realm_region_maps=(DB.realm_region_maps||[]).filter(x=>!["RMAP-POL-005","RMAP-POL-006"].includes(x.id));

/* 所有精確外鍵改指向新的CURRENT主權體；歷史索引的object key保留，供舊檔／史料查詢。 */
function remap(v){
 if(typeof v==="string")return MERGE[v]||v;
 if(Array.isArray(v)){
   const a=v.map(remap);
   return a.every(x=>typeof x==="string")?[...new Set(a)]:a;
 }
 if(v&&typeof v==="object")for(const k of Object.keys(v))v[k]=remap(v[k]);
 return v;
}
remap(DB);

/* 舊洛文官署轉為阿斯戴爾王國的西境直轄官署。 */
const OFFICE_MAP={"POL-018-O1":"POL-001-O6","POL-018-O2":"POL-001-O7","POL-018-O3":"POL-001-O8","POL-018-O4":"POL-001-O9"};
for(const l of DB.locations||[]){
 const a=l?.local_authority;
 if(a){
   for(const k of ["profile_office_id","reports_to_office_id"])if(OFFICE_MAP[a[k]])a[k]=OFFICE_MAP[a[k]];
   if(a.polity_id==="POL-001"){
     a.title=String(a.title||"").replaceAll("邊侯府","王國西境署").replaceAll("邊侯","西境總督");
     a.reports_to=String(a.reports_to||"").replaceAll("洛文城執政官","洛文城王領執政官").replaceAll("西境邊侯","西境總督");
   }
 }
 if(l.political_entity_id==="POL-001"&&typeof l.history_scope==="string")l.history_scope=l.history_scope.replaceAll("洛文邊侯領","阿斯戴爾西境");
}

const ap1=profile("POL-001"),ap7=profile("POL-007"),ap8=profile("POL-008");
if(ap1){
 ap1.office_nodes=ap1.office_nodes||[];
 ap1.office_nodes.push(
  {id:"POL-001-O6",title:"西境總督",authority_tier:"AUTH-5",authority_level:5,scope:"西境河谷與洛文王領行政",appointment:"國王任命",rights:["AR-003","AR-004","AR-005","AR-011"],reports_to:"POL-001-O1",authority_archetype_id:"AUT-002",parallel_authority_ids:[],notes:"取代舊洛文邊侯主權層；此職為王國直轄行政官，不是獨立封臣君主。"},
  {id:"POL-001-O7",title:"洛文城王領執政官",authority_tier:"AUTH-4",authority_level:4,scope:"洛文城與西境稅務",appointment:"西境總督提名、王室確認",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-001-O6",authority_archetype_id:null,parallel_authority_ids:[],notes:"王國西境的城市行政中樞。"},
  {id:"POL-001-O8",title:"西境鎮守官／港務官／村長",authority_tier:"AUTH-3",authority_level:3,scope:"西境聚落與港務",appointment:"王國西境署或地方慣例",rights:["AR-003","AR-005","AR-011"],reports_to:"POL-001-O7",authority_archetype_id:null,parallel_authority_ids:[],notes:"沿用地方自治慣例，但主權直接歸阿斯戴爾王冠。"},
  {id:"POL-001-O9",title:"西境巡林隊長／稅吏／騎士",authority_tier:"AUTH-2",authority_level:2,scope:"地方執行",appointment:"王國西境署任命",rights:["AR-005"],reports_to:"POL-001-O8",authority_archetype_id:null,parallel_authority_ids:[],notes:""},
  {id:"POL-001-O10",title:"維薩南境議政官",authority_tier:"AUTH-4",authority_level:4,scope:"維薩南境與銀岸丘國",appointment:"國王任命並諮詢地方家族議席",rights:["AR-003","AR-005","AR-008","AR-011"],reports_to:"POL-001-O2",authority_archetype_id:null,parallel_authority_ids:[],notes:"保留維薩地方家族議政傳統，但不具有共和國主權。"}
 );
}
if(ap7){
 ap7.office_nodes=ap7.office_nodes||[];
 const top=ap7.office_nodes.find(x=>x.id==="POL-007-O1");
 if(top){top.title="城盟議長";top.scope="卡薩維爾與維爾河自由城盟";top.appointment="城盟議會推舉";}
 ap7.office_nodes.push(
  {id:"POL-007-O4",title:"維爾諸城議長",authority_tier:"AUTH-4",authority_level:4,scope:"維爾河成員城市",appointment:"維爾諸城代表互選",rights:["AR-003","AR-005","AR-008","AR-011"],reports_to:"POL-007-O1",authority_archetype_id:null,parallel_authority_ids:[],notes:"代表維爾河城市群進入城盟議會。"},
  {id:"POL-007-O5",title:"維爾港務長／橋關監",authority_tier:"AUTH-3",authority_level:3,scope:"維爾港、橋路與共同關務",appointment:"城盟議會任命",rights:["AR-008","AR-011"],reports_to:"POL-007-O4",authority_archetype_id:null,parallel_authority_ids:[],notes:""}
 );
}
if(ap8){
 ap8.office_nodes=ap8.office_nodes||[];
 ap8.office_nodes.push(
  {id:"POL-008-O4",title:"黑潮島務議長／船長席",authority_tier:"AUTH-4",authority_level:4,scope:"黑潮群島自治事務",appointment:"自治港灣與登記船長推舉，須由金衡市議堂確認",rights:["AR-003","AR-008","AR-011"],reports_to:"POL-008-O1",authority_archetype_id:null,parallel_authority_ids:[],notes:"自治權不包含獨立外交與主權宣告。"},
  {id:"POL-008-O5",title:"港灣自治船長",authority_tier:"AUTH-3",authority_level:3,scope:"黑潮單一港灣與登記船團",appointment:"島務議會依船長法典認可",rights:["AR-008","AR-011"],reports_to:"POL-008-O4",authority_archetype_id:null,parallel_authority_ids:[],notes:""}
 );
}

/* CURRENT主權歸屬。 */
Object.assign(region("REG-05")||{},{political_entity_id:"POL-001",political_status:"asdail_direct_southern_region",sovereignty_note:"維薩林舊共和制度已取消；銀岸丘國現為阿斯戴爾王國維薩南境，地方家族保留議政慣例但無獨立主權。"});
Object.assign(region("REG-06")||{},{political_entity_id:"POL-007",political_status:"free_city_league_member_region",sovereignty_note:"維爾河諸城與卡薩維爾合併為同一自由城盟；地方市政自治保留，外交與共同防務由城盟統籌。"});
Object.assign(region("REG-07")||{},{political_entity_id:"POL-007",political_status:"free_city_league_core",sovereignty_note:"卡薩維爾為城盟首府與共同議會所在地。"});
Object.assign(region("REG-08")||{},{political_entity_id:"POL-008",political_status:"goldscale_core_islands",sovereignty_note:"金衡港為自由都市本土與黑潮群島共同主權中樞。"});
Object.assign(region("REG-10")||{},{political_entity_id:"POL-008",political_status:"goldscale_chartered_autonomy",regional_power_ids:["RP-010"],sovereignty_note:"黑潮群島已納入金衡自由都市主權；黑潮群島船長議會改為受特許的海上自治勢力，不具獨立外交與國家法統。"});
Object.assign(region("REG-18")||{},{political_entity_id:"POL-001",political_status:"asdail_direct_western_region",sovereignty_note:"洛文邊侯領已取消；西境河谷改由阿斯戴爾王國西境總督與洛文城王領執政官直接治理。"});

if(DB.loven_region_dossier){
 DB.loven_region_dossier.political_entity_id="POL-001";
 DB.loven_region_dossier.summary="角色從柳橋鎮開始；西境河谷由阿斯戴爾王國直接治理，以洛文城為王領行政中樞，地方社會、商路、信仰與行會仍保留西境特色。";
}

/* 合併後同一主權體之間不再保留外交關係。 */
DB.political_relations=(DB.political_relations||[]).filter(x=>x.a!==x.b);
const relationMap=new Map();
for(const r of DB.political_relations){
 const key=[r.a,r.b].sort().join("|"),prev=relationMap.get(key);
 if(!prev||Math.abs(Number(r.score||0))>Math.abs(Number(prev.score||0)))relationMap.set(key,r);
}
DB.political_relations=[...relationMap.values()];

/* 世界→政治體區域層同步縮減。 */
const realm=id=>(DB.realm_region_maps||[]).find(x=>x.id===id);
const rm1=realm("RMAP-POL-001"),rm7=realm("RMAP-POL-007"),rm8=realm("RMAP-POL-008");
if(rm1){rm1.vassal_polity_ids=[];rm1.direct_region_ids=["REG-01","REG-05","REG-18"];rm1.regional_centers=["瑟倫堡","洛文城","維薩城"];}
if(rm7){rm7.name="卡薩維爾－維爾河自由城盟區域地圖";rm7.world_tier="C";rm7.direct_region_ids=["REG-06","REG-07"];rm7.secondary_center="維爾港";}
if(rm8){rm8.name="金衡自由都市與黑潮群島區域地圖";rm8.direct_region_ids=["REG-08","REG-10"];rm8.secondary_center="黑潮灣";}
if(DB.world_map){
 DB.world_map.realm_region_map_ids=(DB.world_map.realm_region_map_ids||[]).filter(x=>!["RMAP-POL-005","RMAP-POL-006"].includes(x));
 DB.world_map.regional_power_region_ids=(DB.world_map.regional_power_region_ids||[]).filter(x=>x!=="REG-10");
 DB.world_map.notes="世界層顯示CURRENT已知政治／地理大區；阿斯戴爾含西境與維薩南境、卡薩維爾與維爾河為同一自由城盟、金衡主權延伸至黑潮群島。";
}

/* 黑潮從外部區域勢力改為金衡內部自治勢力。 */
const rp10=(DB.regional_powers||[]).find(x=>x.id==="RP-010");
if(rp10)Object.assign(rp10,{
 name:"黑潮群島船長議會",category:"金衡海上自治勢力",
 structure:"黑潮主要港灣與登記船長依船長法典維持停泊、分贓、俘虜交換與港灣自治；其自治由金衡自由都市特許保障，但外交、關稅總則與主權歸金衡市議堂。",
 political_role:"金衡自由都市旗下的海上自治勢力，管理黑潮港灣與船團，不具有獨立主權。",parent_polity_id:"POL-008"
});
const rpr=(DB.regional_power_relations||[]).find(x=>x.a==="POL-008"&&x.b==="RP-010");
if(rpr)Object.assign(rpr,{score:64,state:"chartered_autonomy",reason:"黑潮群島船長議會接受金衡主權與海上特許，以自治港灣與船團席位換取共同海防、商路准入與法律承認。"});

/* 舊ID只保留為明確遷移別名。 */
DB.retired_polity_aliases=DB.retired_polity_aliases||{};
Object.assign(DB.retired_polity_aliases,{
 "POL-005":{status:"merged_into_polity",current_id:"POL-001",legacy_name:"維薩林貴族共和國"},
 "POL-006":{status:"merged_into_polity",current_id:"POL-007",legacy_name:"維爾河城邦同盟"},
 "POL-018":{status:"merged_into_polity",current_id:"POL-001",legacy_name:"洛文邊侯領"}
});
DB.political_merge_map={...MERGE};

if(DB.continental_political_order)Object.assign(DB.continental_political_order,{
 version:"CONTINENT-POLITY-1.2",
 recognized_mainland_polity_count:14,
 recognized_mainland_polity_ids:(DB.political_entities||[]).filter(x=>x.id!=="POL-019"&&x.continental_status==="recognized_mainland_polity").map(x=>x.id),
 nonstate_high_risk_regions:["REG-20","REG-17"],political_unit_count:17,governed_polity_count:14,
 nonstate_political_zone_count:1,nonstate_political_zone_ids:["POL-019"],regional_power_count:2,regional_power_ids:["RP-010","RP-017"],
 political_blocks:{
  human_dynastic:["POL-001","POL-002","POL-003","POL-004"],
  urban_trade_and_military:["POL-007","POL-008","POL-009","POL-011"],
  long_lived_and_subterranean:["POL-012","POL-013","POL-020"],
  tribal_steppe_highland:["POL-014","POL-015","POL-016"],
  nonstate_frontier:["POL-019"],regional_powers:["RP-010","RP-017"]
 }
});
if(DB.continental_political_order){
 DB.continental_political_order.rules=(DB.continental_political_order.rules||[]).filter(x=>!String(x).includes("黑潮")).concat([
  "黑潮群島屬金衡自由都市主權；船長議會保留港灣自治，但不得被生成器重新升格為獨立國家。",
  "洛文與維薩南境屬阿斯戴爾王國直轄區域；舊政治體ID只作存檔與歷史索引。"
 ]);
}
if(DB.political_system){
 DB.political_system.version="POLITY-1.3";DB.political_system.entity_count=DB.political_entities.length;
 DB.political_system.rules=(DB.political_system.rules||[]).filter(x=>!String(x).includes("黑潮船長同盟")).concat([
  "洛文邊侯領與維薩林貴族共和國已退出CURRENT政治名錄，現為阿斯戴爾王國直轄區域。",
  "維爾河城邦同盟已與卡薩維爾合併為卡薩維爾－維爾河自由城盟。",
  "黑潮群島已納入金衡自由都市主權，黑潮群島船長議會只保留海上自治權。"
 ]);
}
if(DB.authority_system)DB.authority_system.polity_profile_count=DB.polity_authority_profiles.length;
if(DB.integration_registry){
 DB.integration_registry.counts.political_entities=DB.political_entities.length;
 DB.integration_registry.counts.authority_profiles=DB.polity_authority_profiles.length;
 DB.integration_registry.counts.realm_region_maps=DB.realm_region_maps.length;
 DB.integration_registry.health_targets.political_authority_profiles=DB.polity_authority_profiles.length+"/"+DB.political_entities.length;
 DB.integration_registry.optimization_notes.push("CURRENT-1.89.0／"+REV+"：退役POL-005、POL-006、POL-018並建立存檔遷移別名；阿斯戴爾直轄西境與維薩南境、卡薩維爾整合維爾河、金衡納入黑潮群島。");
}

DB.canon_retcons=DB.canon_retcons||[];
DB.canon_retcons.push({
 version:"CURRENT-1.89.0",
 retired_assumption:"洛文邊侯領與維薩林貴族共和國為CURRENT獨立政治體；維爾河與卡薩維爾分列；黑潮群島不屬任何主權國家。",
 replacement:"洛文與維薩南境納入阿斯戴爾直轄；維爾河與卡薩維爾合併為自由城盟；黑潮群島納入金衡自由都市主權並保留船長自治。",
 reason:"降低主大陸政治體數量並讓疆界、交通與行政層級更集中清楚。",
 save_compatibility:"POL-005→POL-001、POL-006→POL-007、POL-018→POL-001；POL-010仍保留RP-010歷史遷移別名。"
});

/* CURRENT-facing文字同步；正史時間線與史料仍可保留舊政體名稱作前身稱呼。 */
function rewrite(v){
 if(typeof v==="string")return v
  .replaceAll("洛文邊侯領","阿斯戴爾西境")
  .replaceAll("維薩林貴族共和國","阿斯戴爾維薩南境")
  .replaceAll("維爾河城邦同盟","卡薩維爾－維爾河自由城盟")
  .replaceAll("省域擴充不改寫POL-018封臣地位。","省域擴充不得重新建立洛文獨立主權。")
  .replaceAll("衝突時以POL-018與HISTORY-2.0為準。","衝突時以POL-001直轄西境設定與HISTORY-2.0為準。")
  .replaceAll("20個已知政治體皆有制度與核心地理脈絡","15個CURRENT政治體皆有制度與核心地理脈絡")
  .replaceAll("REG-10無政治體歸屬","REG-10歸POL-008");
 if(Array.isArray(v)){for(let i=0;i<v.length;i++)v[i]=rewrite(v[i]);return v;}
 if(v&&typeof v==="object")for(const k of Object.keys(v))v[k]=rewrite(v[k]);
 return v;
}
for(const x of [DB.locations,DB.dialogue_database?.records,DB.intel_database?.records,DB.regional_content_profiles,DB.regional_npc_archetypes,DB.regional_adventure_hooks,DB.regional_life_events,DB.regional_economy_profiles,DB.generator_material_packs,DB.management_ai])if(x)rewrite(x);

function audit(){
 const issues=[];
 const active=new Set((DB.political_entities||[]).map(x=>x.id));
 if(active.size!==15)issues.push("CURRENT政治體應為15："+active.size);
 for(const id of RETIRED)if(active.has(id))issues.push("已整併政治體仍在CURRENT名錄："+id);
 for(const [rid,pid] of Object.entries({"REG-05":"POL-001","REG-06":"POL-007","REG-07":"POL-007","REG-08":"POL-008","REG-10":"POL-008","REG-18":"POL-001"}))if(region(rid)?.political_entity_id!==pid)issues.push("主權歸屬錯誤："+rid+"->"+region(rid)?.political_entity_id);
 if((DB.polity_authority_profiles||[]).length!==15)issues.push("政治權力profile應為15："+(DB.polity_authority_profiles||[]).length);
 if((DB.realm_region_maps||[]).some(x=>["RMAP-POL-005","RMAP-POL-006"].includes(x.id)))issues.push("舊政治體區域地圖仍啟用");
 if(!profile("POL-001")?.office_nodes?.some(x=>x.id==="POL-001-O6"))issues.push("阿斯戴爾西境直轄官署缺失");
 if(!profile("POL-007")?.office_nodes?.some(x=>x.id==="POL-007-O4"))issues.push("維爾城盟官署缺失");
 if(!profile("POL-008")?.office_nodes?.some(x=>x.id==="POL-008-O4"))issues.push("黑潮自治官署缺失");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,stats:{political_entities:active.size,authority_profiles:(DB.polity_authority_profiles||[]).length,realm_maps:(DB.realm_region_maps||[]).length}};
}
DB.political_consolidation_system={version:REV,release:RELEASE,merge_map:{...MERGE},audit:audit(),save_compatible:true};
DB.meta=DB.meta||{};DB.meta.political_consolidation_revision=REV;
globalThis.runPoliticalConsolidationAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/political-consolidation-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();
