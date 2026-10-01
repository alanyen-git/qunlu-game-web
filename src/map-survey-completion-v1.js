/* 群陸旅誌：全現行地點測繪補全 CURRENT-2.25.20
 * MAP-SURVEY-COMPLETION-2.0
 *
 * 既有手工測繪座標保持不變；所有後續新增的 DB.locations 若沒有座標，
 * 依行省圖冊錨點、世界區域幾何與 canonical links 建立穩定的區域路網座標。
 * 不使用 Math.random，不修改 links / hours，不宣稱現實測地學精度。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="MAP-SURVEY-COMPLETION-2.0";
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.25.20")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.25.20";
const AUTHORED_SOURCE="authored_regional_route_survey";
const DERIVED_SOURCE="derived_canonical_route_survey";
const AUTHORED_BASIS="canonical road graph + terrain anchors";
const DERIVED_BASIS="province atlas anchor + canonical links";
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const num=(v,d=0)=>Number.isFinite(+v)?+v:d;
const round1=v=>Math.round(v*10)/10;
const A=v=>Array.isArray(v)?v:[];
const PERF={full_refreshes:0,ensures:0,fast_hits:0};
let lastRowsRef=null,lastRowsLength=-1,lastCompletion=null;

const POINTS=Object.freeze({
  "L-WILLOW":[460,470],"L-PINE":[480,520],"L-LOVEN":[500,510],"L-STONEFORD":[525,535],
  "L-GREENHARBOR":[515,565],"L-WHITESTONE":[555,530],"L-GREYPEAK":[550,460],
  "L-WOOD":[468,458],"L-MEADOW":[470,505],"L-HILL":[520,510],"L-RIVER":[505,545],
  "L-MARSH":[530,575],"L-REED":[492,555],"L-QUARRY":[540,548],"L-PASS":[518,480],
  "L-OLDROAD":[490,525],"D-AQUEDUCT":[452,458],"D-WATCH":[528,500],"D-FLOODED":[498,558],
  "D-MARSH":[535,592],"D-MINE":[548,558],"D-SHRINE":[527,472],"D-CATACOMB":[492,542],
  "L-BIRCH":[470,488],"L-LOWFIELD":[458,500],"L-REDCLIFF":[532,530],"L-MISTWOOD":[488,540],
  "L-SALTFLAT":[438,625],"L-MOONLAKE":[524,586],"L-HIGHLAND":[520,442],"L-ASHGROVE":[542,492],
  "L-STARMOOR":[450,610],"D-BURROW":[476,494],"D-CELLAR":[455,512],"D-RED-CAVE":[538,538],
  "D-MIST-HUT":[493,552],"D-SALT-CRYPT":[440,642],"D-LAKE-GROTTO":[532,604],"D-WIND-TOMB":[518,455],
  "L-SELENBURG":[665,540],"L-WHITESTONE-RIVER":[565,548],"L-WHITESTONE-FIELDS":[565,515],
  "D-WHITESTONE-FORT":[570,560],"D-WHITESTONE-CISTERN":[570,535],"L-GREYPEAK-PINES":[545,445],
  "L-GREYPEAK-RIDGE":[558,478],"D-GREYPEAK-MINE":[565,445],"D-GREYPEAK-KEEP":[566,488],
  "L-START-DAWNGRAIN":[900,570],"L-DG-DEWFIELD":[890,558],"L-DG-PRAYERBROOK":[912,584],
  "D-DG-OLDCHANNEL":[884,574],"L-DG-PILGRIMORCHARD":[918,560],"D-DG-TITHECELLAR":[926,596],"D-DG-WAYSHRINE":[900,604],
  "L-START-MOSSMOON":[230,780],"L-MM-SILVERLEAF":[218,768],"L-MM-DEERSPRING":[246,795],
  "D-MM-ROOTSHRINE":[212,790],"L-MM-RESINGLADE":[248,762],"D-MM-HOLLOWOAK":[258,808],"D-MM-SPRINGVAULT":[262,780],
  "L-START-IRONPINE":[260,290],"L-IP-ANVILRIDGE":[248,278],"L-IP-BLACKVEIN":[276,304],
  "D-IP-OLDMINE":[244,310],"L-IP-COPPERCUT":[282,270],"D-IP-TOOLVAULT":[292,320],"D-IP-WATERADIT":[300,286],
  "L-START-WINDSPRING":[850,220],"L-WS-WHITEGRASS":[838,208],"L-WS-GOOSEFORD":[870,236],
  "D-WS-STONERING":[828,235],"L-WS-HERDSTONE":[882,204],"D-WS-SUPPLYCELLAR":[892,250],"D-WS-DRYWELL":[902,220],
  "L-START-TIDEBORN":[1450,960],"L-TB-SEAPINE":[1435,948],"L-TB-BLACKREEF":[1472,974],
  "D-TB-TIDECAVE":[1424,980],"L-TB-ROPEGRASS":[1482,940],"D-TB-WATCHCAVE":[1492,994],"D-TB-SALTVAULT":[1502,956]
});

function usablePoint(value){
 if(Array.isArray(value)&&Number.isFinite(+value[0])&&Number.isFinite(+value[1]))return {x:+value[0],y:+value[1]};
 if(value&&Number.isFinite(+value.x)&&Number.isFinite(+value.y))return {x:+value.x,y:+value.y};
 return null;
}
function existingPoint(row){
 for(const value of [row?.map_coordinates,row?.cartographic_coordinates,row?.map_position,row?.coordinates]){
  const p=usablePoint(value);if(p)return p;
 }
 if(Number.isFinite(+row?.map_x)&&Number.isFinite(+row?.map_y))return {x:+row.map_x,y:+row.map_y};
 return null;
}
function provinceAnchor(provinceId){
 const entry=A(DB.world_map_province_atlas?.entries).find(x=>x?.id===provinceId);
 const p=usablePoint(entry?.anchor);if(p)return p;
 const row=A(DB.province_region_maps).find(x=>x?.id===provinceId);
 const direct=usablePoint(row?.anchor)||usablePoint(row?.map_coordinates);if(direct)return direct;
 return regionAnchor(row?.world_region_id||row?.region_id);
}
function regionAnchor(regionId){
 const geoms=A(DB.world_geopolitical_map?.region_geometry).filter(g=>g?.region_id===regionId&&g.layer!=="subterranean");
 const points=geoms.flatMap(g=>A(g?.points)).filter(p=>Array.isArray(p)&&Number.isFinite(+p[0])&&Number.isFinite(+p[1]));
 if(!points.length)return null;
 return {x:points.reduce((s,p)=>s+ +p[0],0)/points.length,y:points.reduce((s,p)=>s+ +p[1],0)/points.length};
}
function canvasCenter(){
 const c=DB.world_geopolitical_map?.canvas||DB.world_map_province_atlas?.canvas||{width:1800,height:1100};
 return {x:num(c.width,1800)/2,y:num(c.height,1100)/2};
}
function mean(points){
 const ps=points.filter(Boolean);if(!ps.length)return null;
 return {x:ps.reduce((s,p)=>s+p.x,0)/ps.length,y:ps.reduce((s,p)=>s+p.y,0)/ps.length};
}
function stableRows(rows){
 const kind={town:0,wild:1,dungeon:2};
 return [...rows].sort((a,b)=>(kind[a?.kind]??3)-(kind[b?.kind]??3)||String(a?.id||"").localeCompare(String(b?.id||"")));
}
function groupKey(row){
 return row?.province_region_id||("REGION:"+(row?.world_region_id||row?.region_id||row?.political_entity_id||"UNASSIGNED"));
}
const OFFSETS=Object.freeze([
 [0,-1],[1,0],[0,1],[-1,0],[.72,-.72],[.72,.72],[-.72,.72],[-.72,-.72],
 [.38,-.92],[.92,-.38],[.92,.38],[.38,.92],[-.38,.92],[-.92,.38],[-.92,-.38],[-.38,-.92]
]);
function derivedPlacement(row,index,base,positioned){
 const linked=A(row?.links).map(e=>positioned.get(e?.to)).filter(Boolean);
 const origin=mean(linked)||base||canvasCenter();
 const kindRadius=row?.kind==="town"?30:row?.kind==="dungeon"?52:42;
 const ring=1+Math.floor(index/OFFSETS.length),off=OFFSETS[index%OFFSETS.length];
 const radius=kindRadius*ring;
 const canvas=DB.world_geopolitical_map?.canvas||DB.world_map_province_atlas?.canvas||{width:1800,height:1100};
 return {
  x:round1(clamp(origin.x+off[0]*radius,24,num(canvas.width,1800)-24)),
  y:round1(clamp(origin.y+off[1]*radius,24,num(canvas.height,1100)-24))
 };
}
function surveyValue(point,source,basis,verified){
 return {x:round1(point.x),y:round1(point.y),basis,source,revision:REV,verified:verified===true,precision:"regional_route"};
}

function refreshMapSurveyCompletion(){
 PERF.full_refreshes++;
 const rows=A(DB.locations),surveyed={},positioned=new Map(),authoredIds=[],preservedIds=[],derivedIds=[],knownByGroup=new Map();
 for(const row of rows){
  const authored=POINTS[row?.id];
  if(authored){
   const value=surveyValue({x:authored[0],y:authored[1]},AUTHORED_SOURCE,AUTHORED_BASIS,true);
   row.cartographic_coordinates=value;surveyed[row.id]=value;positioned.set(row.id,value);authoredIds.push(row.id);const key=groupKey(row);if(!knownByGroup.has(key))knownByGroup.set(key,[]);knownByGroup.get(key).push(value);continue;
  }
  const point=existingPoint(row);
  if(point){
   const current=row.cartographic_coordinates;
   const value=current&&Number.isFinite(+current.x)&&Number.isFinite(+current.y)
    ?current
    :surveyValue(point,"preserved_canonical_coordinate","existing canonical/sourced coordinate",true);
   row.cartographic_coordinates=value;surveyed[row.id]=value;positioned.set(row.id,value);preservedIds.push(row.id);const key=groupKey(row);if(!knownByGroup.has(key))knownByGroup.set(key,[]);knownByGroup.get(key).push(value);
  }
 }
 const groups=new Map();
 for(const row of rows)if(!positioned.has(row?.id)){
  const key=groupKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);
 }
 for(const [key,group] of groups){
  const provinceId=key.startsWith("REGION:")?null:key;
  const knownInGroup=knownByGroup.get(key)||[];
  const first=group[0],base=mean(knownInGroup)||provinceAnchor(provinceId)||regionAnchor(first?.world_region_id||first?.region_id)||canvasCenter();
  stableRows(group).forEach((row,index)=>{
   const point=derivedPlacement(row,index,base,positioned);
   const value=surveyValue(point,DERIVED_SOURCE,DERIVED_BASIS,false);
   row.cartographic_coordinates=value;surveyed[row.id]=value;positioned.set(row.id,value);derivedIds.push(row.id);
  });
 }
 const unresolved=rows.map(x=>x?.id).filter(id=>!positioned.has(id));
 DB.map_survey_completion={
  version:REV,release:RELEASE,status:unresolved.length?"incomplete":"complete_for_all_current_locations",
  projection:"fictional_atlas",coordinate_unit:"atlas",precision:"regional_route",
  sources:[AUTHORED_SOURCE,DERIVED_SOURCE,"preserved_canonical_coordinate"],
  basis:DERIVED_BASIS,
  non_geodetic_note:"區域路網測繪稿；衍生座標只用於遊戲圖面配置，不改旅行 hours、canonical links 或地點解鎖。",
  survey_scope:"all_current_DB.locations",
  surveyed_location_ids:Object.keys(surveyed),
  authored_location_ids:authoredIds,preserved_location_ids:preservedIds,derived_location_ids:derivedIds,
  authored_count:authoredIds.length,preserved_count:preservedIds.length,derived_count:derivedIds.length,
  location_count:Object.keys(surveyed).length,scope_location_count:rows.length,
  unresolved_location_ids:unresolved,excluded_location_count:0
 };
 DB.meta=DB.meta||{};
 DB.meta.map_survey_completion_revision=REV;
 DB.meta.map_survey_coordinate_policy="authored_or_canonical_or_province_anchor_plus_links";
 lastRowsRef=rows;lastRowsLength=rows.length;lastCompletion=DB.map_survey_completion;
 globalThis.QUNLU_MAP_SURVEY={revision:REV,source:DERIVED_BASIS,points:surveyed,locationCount:Object.keys(surveyed).length,unresolved:[...unresolved],stats:PERF};
 return DB.map_survey_completion;
}
function ensureMapSurveyCompletion(){
 PERF.ensures++;
 const rows=A(DB.locations),current=DB.map_survey_completion;
 if(rows===lastRowsRef&&rows.length===lastRowsLength&&current===lastCompletion&&current?.version===REV&&current?.status==="complete_for_all_current_locations"&&current?.location_count===rows.length&&!(current?.unresolved_location_ids||[]).length){PERF.fast_hits++;return current}
 return refreshMapSurveyCompletion();
}

globalThis.refreshMapSurveyCompletion=refreshMapSurveyCompletion;
globalThis.ensureMapSurveyCompletion=ensureMapSurveyCompletion;
refreshMapSurveyCompletion();
globalThis.QUNLU_CORE?.registerModule?.("src/map-survey-completion-v1.js",{domain:"world",revision:REV,release:RELEASE,location_count:DB.map_survey_completion.location_count,coordinate_policy:"authored_or_canonical_or_province_anchor_plus_links"});
})();
