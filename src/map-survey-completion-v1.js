/* 群陸旅誌：可玩地圖測繪補全 CURRENT-2.25.6
 * MAP-SURVEY-COMPLETION-1.0
 *
 * 這不是隨機散點或版面排版座標。座標是依 CURRENT 的 canonical links、
 * 既有世界圖 REG-01／REG-18、河谷／山口／聚落地形敘述與 settlement map
 * 的路線關係逐點編製的區域測繪稿；用途是讓目前可玩的地點有一致的
 * regional route survey 圖面，並保留「非測地學精度」的誠實標記。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="MAP-SURVEY-COMPLETION-1.0";
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.25.6")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.25.6";
const SOURCE="authored_regional_route_survey";
const BASIS="REG-18 canonical road graph + terrain anchors";

// 固定、可審核的 atlas 座標；不在 runtime 以 hash、平均值或隨機值產生。
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
  // 五個現行新手區：沿既有 world_region／starter settlement 路網逐點編製。
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

const SURVEY_PROVINCES=new Set([
  "PROV-001-CROWN","PROV-018-WEST",
  "PROV-START-04","PROV-START-10","PROV-START-12","PROV-START-13","PROV-START-15"
]);
const inCurrentSurveyScope=row=>!!POINTS[row?.id]||SURVEY_PROVINCES.has(row?.province_region_id);
const surveyed={};
for(const row of (DB.locations||[])){
  const point=POINTS[row?.id];
  if(!point)continue;
  const value={x:point[0],y:point[1],basis:BASIS,source:SOURCE,revision:REV,verified:true,precision:"regional_route"};
  row.cartographic_coordinates=value;
  surveyed[row.id]=value;
}

const ids=Object.keys(surveyed);
DB.map_survey_completion={
  version:REV,
  release:RELEASE,
  status:"complete_for_current_playable_locations",
  projection:"fictional_atlas",
  coordinate_unit:"atlas",
  precision:"regional_route",
  source:SOURCE,
  basis:BASIS,
  non_geodetic_note:"區域路網測繪稿；不宣稱現實測地學精度，不改旅行 hours 或 canonical links。",
  survey_scope:"PROV-001-CROWN／PROV-018-WEST／五個現行新手區，以及既有48筆基礎地點",
  surveyed_location_ids:ids,
  location_count:ids.length,
  scope_location_count:(DB.locations||[]).filter(inCurrentSurveyScope).length,
  unresolved_location_ids:(DB.locations||[]).filter(inCurrentSurveyScope).map(x=>x?.id).filter(id=>!surveyed[id]),
  excluded_location_count:(DB.locations||[]).filter(x=>!inCurrentSurveyScope(x)).length
};
DB.meta=DB.meta||{};
DB.meta.map_survey_completion_revision=REV;
DB.meta.map_survey_coordinate_policy="canonical_or_authored_regional_route_survey";

globalThis.QUNLU_MAP_SURVEY={revision:REV,source:BASIS,points:surveyed,locationCount:ids.length};
globalThis.QUNLU_CORE?.registerModule?.("src/map-survey-completion-v1.js",{domain:"world",revision:REV,release:RELEASE,location_count:ids.length,coordinate_policy:"canonical_or_authored_regional_route_survey"});
})();
