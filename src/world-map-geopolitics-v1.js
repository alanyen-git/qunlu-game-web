/* 群陸旅誌：世界政治地圖地理骨架 CURRENT-1.88.0
 * WORLD-MAP-GEOPOLITICS-1.1
 * 在既有政治疆域底板上加入海岸、山脈、河川、湖泊、氣候帶、主要道路與國境關隘，
 * 並使政治疆界的形狀與說明受到天然屏障、分水嶺、河谷與交通控制點影響；不改旅行解鎖與存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.88.0")||"CURRENT-1.88.0";
const REV="WORLD-MAP-GEOPOLITICS-1.1";
const W=1800,H=1100;

/* 地表政治疆域：1.1版將原先大面積直線切割改成沿河谷、山脊、火山高地與交通走廊的折線。
 * 同一區域仍維持原region_id / political_entity_id，不破壞既有世界資料與存檔。
 */
const REGION_GEOMETRY=[
 {region_id:"REG-01",layer:"surface",points:[[300,590],[330,540],[360,485],[390,430],[435,445],[485,468],[550,500],[570,545],[590,600],[610,650],[565,680],[520,705],[470,720],[410,710],[355,700],[300,690]],label:[435,585]},
 {region_id:"REG-02",layer:"surface",points:[[770,340],[820,334],[890,330],[945,365],[1000,395],[1050,420],[1030,468],[1000,520],[955,525],[900,530],[820,540],[775,500],[730,460]],label:[890,430]},
 {region_id:"REG-03",layer:"surface",points:[[340,260],[400,266],[455,278],[505,295],[560,310],[605,275],[650,220],[690,255],[730,295],[770,340],[750,395],[730,460],[680,472],[620,485],[550,500],[500,480],[445,455],[390,430],[370,370],[355,315]],label:[555,375]},
 {region_id:"REG-04",layer:"surface",points:[[550,500],[620,485],[680,472],[730,460],[775,500],[820,540],[845,585],[875,620],[900,650],[865,675],[820,700],[775,650],[730,600],[690,625],[650,640],[610,650],[590,600],[570,545]],label:[735,575]},
 {region_id:"REG-05",layer:"surface",points:[[300,690],[355,700],[410,710],[470,720],[485,765],[500,815],[520,860],[475,885],[420,910],[350,930],[305,915],[265,895],[220,880],[245,845],[290,820],[350,800],[330,750]],label:[385,820]},
 {region_id:"REG-06",layer:"surface",points:[[610,650],[650,640],[690,625],[730,600],[775,650],[820,700],[805,750],[785,805],[760,850],[705,845],[650,838],[590,830],[610,800],[635,780],[670,760],[645,720]],label:[705,745]},
 {region_id:"REG-07",layer:"surface",points:[[470,720],[520,705],[565,680],[610,650],[645,720],[670,760],[635,780],[610,800],[590,830],[555,845],[520,860],[500,815],[485,765]],label:[565,760]},
 {region_id:"REG-08",layer:"surface",points:[[400,900],[445,884],[485,875],[520,870],[555,895],[590,920],[620,950],[600,995],[560,1040],[510,1028],[465,1020],[420,1010],[410,960]],label:[510,960],island:true},
 {region_id:"REG-09",layer:"surface",points:[[820,540],[900,530],[955,525],[1000,520],[1025,560],[1060,590],[1100,620],[1090,675],[1080,760],[1020,760],[960,758],[900,760],[900,710],[900,650],[875,620],[845,585]],label:[965,650]},
 {region_id:"REG-10",layer:"surface",points:[[120,910],[160,902],[205,897],[250,890],[290,920],[330,970],[305,1010],[260,1050],[210,1045],[165,1040],[130,1030],[115,980]],label:[220,975],island:true,nonstate:true},
 {region_id:"REG-11",layer:"surface",points:[[590,80],[650,85],[715,92],[770,96],[820,100],[842,150],[862,205],[890,260],[865,285],[830,312],[770,340],[730,295],[690,255],[650,220],[625,145]],label:[735,190]},
 {region_id:"REG-12",layer:"surface",points:[[820,100],[880,112],[950,125],[1020,138],[1110,150],[1130,200],[1150,260],[1180,350],[1135,365],[1085,385],[1050,420],[1000,395],[945,365],[890,330],[865,285],[890,260],[862,205],[842,150]],label:[1010,265]},
 {region_id:"REG-13",layer:"surface",points:[[300,70],[355,72],[420,74],[500,76],[590,80],[625,145],[650,220],[610,250],[560,310],[505,295],[455,278],[400,266],[340,260],[342,225],[340,190]],label:[465,175]},
 {region_id:"REG-14",layer:"surface",points:[[1120,360],[1180,350],[1225,342],[1285,336],[1350,330],[1370,390],[1390,455],[1420,570],[1385,610],[1345,650],[1300,690],[1245,665],[1190,645],[1100,620],[1130,570],[1160,520],[1190,470],[1150,415]],label:[1265,510]},
 {region_id:"REG-15",layer:"surface",points:[[1350,330],[1410,322],[1490,315],[1575,307],[1660,300],[1695,380],[1720,470],[1740,560],[1705,610],[1650,665],[1600,720],[1550,690],[1505,650],[1460,610],[1420,570],[1390,455],[1370,390]],label:[1535,500]},
 {region_id:"REG-16",layer:"surface",points:[[90,90],[145,85],[210,80],[300,70],[340,190],[342,225],[340,260],[320,275],[290,288],[260,300],[215,292],[160,282],[110,270],[100,210]],label:[205,170]},
 {region_id:"REG-17",layer:"surface",points:[[1000,380],[1050,370],[1120,360],[1150,415],[1190,470],[1160,520],[1130,570],[1100,620],[1060,590],[1025,560],[1000,520],[1012,470]],label:[1090,475],nonstate:true},
 {region_id:"REG-18",layer:"surface",points:[[80,270],[110,270],[160,282],[215,292],[260,300],[290,288],[320,275],[340,260],[355,315],[370,370],[390,430],[360,485],[330,540],[300,590],[245,595],[190,600],[90,610],[70,555],[55,450],[65,355]],label:[190,445]},
 {region_id:"REG-19",layer:"surface",points:[[55,610],[90,610],[190,600],[245,595],[300,590],[300,690],[330,750],[350,800],[290,820],[245,845],[220,880],[180,862],[130,840],[70,810],[62,745]],label:[190,720]},
 {region_id:"REG-20",layer:"surface",points:[[1080,760],[1140,735],[1210,710],[1300,690],[1345,650],[1385,610],[1420,570],[1460,610],[1505,650],[1550,690],[1600,720],[1575,790],[1550,860],[1500,970],[1410,988],[1320,1005],[1230,1020],[1160,980],[1090,940],[1020,900],[1040,845]],label:[1300,855],nonstate:true},
 {region_id:"REG-13",political_entity_id:"POL-020",layer:"subterranean",points:[[405,145],[455,142],[505,143],[555,145],[575,175],[600,215],[570,250],[535,285],[490,270],[445,255],[405,245],[390,220],[375,195]],label:[490,210],overlap:true}
];

const CAPITALS=[
 {political_entity_id:"POL-001",name:"瑟倫堡",type:"fixed",layer:"surface",x:430,y:575},
 {political_entity_id:"POL-002",name:"赫薩爾帝都",type:"fixed",layer:"surface",x:875,y:435},
 {political_entity_id:"POL-003",name:"聖冠城",type:"fixed",layer:"surface",x:555,y:375},
 {political_entity_id:"POL-004",name:"晨鐘聖城",type:"fixed",layer:"surface",x:730,y:575},
 {political_entity_id:"POL-005",name:"維薩城",type:"fixed",layer:"surface",x:405,y:810},
 {political_entity_id:"POL-006",name:"維爾港",type:"fixed",layer:"surface",x:700,y:745},
 {political_entity_id:"POL-007",name:"卡薩維爾",type:"fixed",layer:"surface",x:565,y:760},
 {political_entity_id:"POL-008",name:"金衡港",type:"fixed",layer:"surface",x:510,y:955},
 {political_entity_id:"POL-009",name:"灰刃城",type:"fixed",layer:"surface",x:965,y:650},
 {political_entity_id:"POL-011",name:"藍塔城",type:"fixed",layer:"surface",x:735,y:190},
 {political_entity_id:"POL-012",name:"瑟露維亞林冠庭",type:"fixed",layer:"surface",x:1010,y:265},
 {political_entity_id:"POL-013",name:"深砧王廳",type:"fixed",layer:"surface",x:465,y:175},
 {political_entity_id:"POL-014",name:"赤牙大營",type:"fixed",layer:"surface",x:1265,y:510},
 {political_entity_id:"POL-015",name:"大汗金帳（季節性位置）",canonical_capital:"無固定都城",type:"mobile_court",layer:"surface",x:1535,y:500,note:"僅為當季汗庭地圖錨點；不建立永久首都。"},
 {political_entity_id:"POL-016",name:"霜角石圈",type:"fixed",layer:"surface",x:205,y:170},
 {political_entity_id:"POL-018",name:"洛文城",type:"fixed",layer:"surface",x:190,y:445},
 {political_entity_id:"POL-019",name:null,type:"none",layer:"surface",note:"無主之地沒有被共同承認的固定首都。"},
 {political_entity_id:"POL-020",name:"黑月城",type:"fixed",layer:"subterranean",x:490,y:210}
];

const REGION_ADJACENCY={
 "REG-01":["REG-18","REG-03","REG-04","REG-07","REG-05","REG-19"],
 "REG-02":["REG-11","REG-12","REG-03","REG-04","REG-17"],
 "REG-03":["REG-13","REG-11","REG-02","REG-04","REG-01","REG-18"],
 "REG-04":["REG-03","REG-02","REG-01","REG-06","REG-09","REG-17"],
 "REG-05":["REG-19","REG-01","REG-07","REG-06","REG-08"],
 "REG-06":["REG-05","REG-07","REG-04","REG-08","REG-10"],
 "REG-07":["REG-01","REG-05","REG-06"],
 "REG-08":["REG-05","REG-06","REG-10"],
 "REG-09":["REG-04","REG-17","REG-14","REG-20"],
 "REG-10":["REG-06","REG-08","REG-20"],
 "REG-11":["REG-13","REG-03","REG-02","REG-12"],
 "REG-12":["REG-11","REG-02","REG-14"],
 "REG-13":["REG-16","REG-18","REG-03","REG-11"],
 "REG-14":["REG-12","REG-17","REG-09","REG-15","REG-20"],
 "REG-15":["REG-14","REG-20"],
 "REG-16":["REG-13","REG-18"],
 "REG-17":["REG-02","REG-04","REG-09","REG-14"],
 "REG-18":["REG-16","REG-13","REG-03","REG-01","REG-19"],
 "REG-19":["REG-18","REG-01","REG-05"],
 "REG-20":["REG-09","REG-14","REG-15","REG-10"]
};

/* 海岸線只描繪陸海邊界；島嶼仍保留自己的政治幾何。 */
const COASTLINES=[
 {id:"CST-01",name:"霧冠西岸",points:[[90,90],[70,180],[80,270],[65,355],[55,450],[70,555],[55,610],[62,745],[70,810],[130,840],[220,880],[350,930]],regions:["REG-16","REG-18","REG-19","REG-05"]},
 {id:"CST-02",name:"北冠海岸",points:[[90,90],[210,80],[300,70],[420,74],[590,80],[715,92],[820,100],[950,125],[1110,150]],regions:["REG-16","REG-13","REG-11","REG-12"]},
 {id:"CST-03",name:"東風海岸",points:[[1110,150],[1180,350],[1350,330],[1660,300],[1695,380],[1740,560],[1705,610],[1600,720]],regions:["REG-12","REG-14","REG-15"]},
 {id:"CST-04",name:"南曜海岸",points:[[1600,720],[1550,860],[1500,970],[1320,1005],[1230,1020],[1090,940],[1020,900],[760,850],[590,830],[520,860],[350,930]],regions:["REG-20","REG-06","REG-05"]},
 {id:"CST-05",name:"金衡島岸",closed:true,points:[[400,900],[445,884],[520,870],[590,920],[620,950],[560,1040],[465,1020],[420,1010]],regions:["REG-08"]},
 {id:"CST-06",name:"黑潮群島外緣",closed:true,points:[[120,910],[205,897],[250,890],[330,970],[260,1050],[165,1040],[130,1030]],regions:["REG-10"]}
];

const MOUNTAIN_RANGES=[
 {id:"MNT-01",name:"石冠大山脈",tier:"continental",points:[[275,95],[320,145],[340,205],[390,245],[455,278],[520,290],[575,270],[625,220]],regions:["REG-16","REG-13","REG-18","REG-03","REG-11"],barrier:"高"},
 {id:"MNT-02",name:"藍脊高地",tier:"major",points:[[650,220],[705,230],[770,250],[835,275],[900,305],[970,340],[1040,375]],regions:["REG-11","REG-12","REG-03","REG-02"],barrier:"中高"},
 {id:"MNT-03",name:"赤牙山牆",tier:"major",points:[[1115,365],[1160,410],[1190,470],[1240,515],[1300,560],[1360,600],[1420,620]],regions:["REG-17","REG-14","REG-20","REG-15"],barrier:"高"},
 {id:"MNT-04",name:"龍脊火山弧",tier:"major",points:[[1040,845],[1120,865],[1210,890],[1300,900],[1390,880],[1470,835],[1540,770]],regions:["REG-20"],barrier:"極高"},
 {id:"MNT-05",name:"霜角山地",tier:"regional",points:[[105,115],[145,150],[185,190],[225,235],[270,280]],regions:["REG-16","REG-18"],barrier:"中高"}
];

const RIVERS=[
 {id:"RIV-01",name:"瑟倫河",source:"石冠南麓",mouth:"霧冠西岸",points:[[520,285],[510,340],[500,395],[485,450],[500,515],[500,590],[475,650],[455,720],[430,790],[385,865]],regions:["REG-13","REG-03","REG-01","REG-05"],navigable_from:[500,590]},
 {id:"RIV-02",name:"白鐘河",source:"藍脊高地",mouth:"南曜海",points:[[700,255],[710,320],[720,390],[730,460],[745,530],[770,590],[820,650],[875,705],[955,750],[1040,785]],regions:["REG-03","REG-04","REG-09"],navigable_from:[770,590]},
 {id:"RIV-03",name:"維薩河",source:"中西丘陵",mouth:"西南海灣",points:[[470,650],[455,700],[440,750],[420,805],[390,850],[350,890]],regions:["REG-01","REG-05"],navigable_from:[440,750]},
 {id:"RIV-04",name:"赫薩爾河",source:"藍脊東麓",mouth:"龍脊灣",points:[[955,330],[975,380],[1000,430],[1020,485],[1045,535],[1080,585],[1140,625],[1210,665],[1280,700]],regions:["REG-12","REG-02","REG-17","REG-14","REG-20"],navigable_from:[1045,535]},
 {id:"RIV-05",name:"草海季流",source:"東部草原",mouth:"赤牙內灣",seasonal:true,points:[[1580,355],[1530,395],[1490,445],[1450,500],[1415,555],[1375,610],[1320,665]],regions:["REG-15","REG-14"],navigable_from:null}
];

const LAKES=[
 {id:"LAK-01",name:"環鐘湖",cx:748,cy:525,rx:45,ry:24,regions:["REG-04"],outflow:"RIV-02"},
 {id:"LAK-02",name:"鏡林湖",cx:1040,cy:315,rx:52,ry:28,regions:["REG-12"],outflow:"RIV-04"},
 {id:"LAK-03",name:"黑砧高湖",cx:505,cy:220,rx:36,ry:20,regions:["REG-13"],outflow:"RIV-01"}
];

const CLIMATE_BANDS=[
 {id:"CLM-01",name:"霜原高山帶",kind:"寒冷高山／苔原",regions:["REG-16","REG-13"],polygon:[[70,60],[650,55],[670,250],[520,320],[260,330],[60,280]],opacity:.23},
 {id:"CLM-02",name:"北部冷溫帶",kind:"冷涼針闊混林",regions:["REG-11","REG-12","REG-03"],polygon:[[560,70],[1160,120],[1210,390],[950,440],[700,390],[520,300]],opacity:.18},
 {id:"CLM-03",name:"西部海洋溫帶",kind:"濕潤海洋性／農牧",regions:["REG-18","REG-01","REG-19","REG-05"],polygon:[[40,250],[390,250],[590,520],[530,900],[250,960],[40,820]],opacity:.18},
 {id:"CLM-04",name:"中央溫帶河谷",kind:"溫帶大陸性／河谷",regions:["REG-02","REG-04","REG-06","REG-07","REG-09"],polygon:[[520,350],[1080,360],[1180,730],[820,890],[500,850],[470,570]],opacity:.16},
 {id:"CLM-05",name:"東部草海帶",kind:"半乾燥草原／季節風",regions:["REG-14","REG-15","REG-17"],polygon:[[1030,300],[1710,260],[1770,650],[1450,760],[1120,690]],opacity:.2},
 {id:"CLM-06",name:"南部暖濕與火山帶",kind:"暖溫帶沿海／火山雨影",regions:["REG-08","REG-10","REG-20"],polygon:[[80,820],[650,820],[900,760],[1050,720],[1630,690],[1540,1040],[90,1080]],opacity:.18}
];

const ROADS=[
 {id:"RD-01",name:"王冠大道",class:"royal",points:[[190,445],[275,470],[350,515],[430,575],[500,540],[555,500],[650,475],[730,460],[800,445],[875,435]],regions:["REG-18","REG-01","REG-03","REG-02"],strategic:"連接西部封建核心與帝國商路的全天候大道"},
 {id:"RD-02",name:"聖鐘大道",class:"pilgrim",points:[[555,375],[610,420],[665,485],[730,575],[810,610],[890,635],[965,650]],regions:["REG-03","REG-04","REG-09"],strategic:"朝聖、軍隊與糧運共用的中央幹道"},
 {id:"RD-03",name:"三港商路",class:"trade",points:[[430,575],[485,650],[565,760],[630,750],[700,745],[640,825],[570,900],[510,955]],regions:["REG-01","REG-07","REG-06","REG-08"],strategic:"河港、自由都市與南方海運的主要商道"},
 {id:"RD-04",name:"北脊礦路",class:"mountain",points:[[205,170],[275,190],[340,205],[405,190],[465,175],[550,180],[625,185],[735,190]],regions:["REG-16","REG-13","REG-11"],strategic:"沿山口與礦脈修築，控制石冠與藍塔之間的高價物資流"},
 {id:"RD-05",name:"東境汗路",class:"steppe",points:[[965,650],[1035,585],[1090,475],[1175,490],[1265,510],[1350,500],[1440,495],[1535,500]],regions:["REG-09","REG-17","REG-14","REG-15"],strategic:"草原騎隊、商旅與季節性汗庭共用的移動走廊"},
 {id:"RD-06",name:"龍脊南路",class:"frontier",points:[[965,650],[1045,700],[1080,760],[1170,805],[1280,830],[1400,820],[1500,900]],regions:["REG-09","REG-20"],strategic:"繞開火山核心的南部邊境補給線"}
];

const PASSES=[
 {id:"PASS-01",name:"石冠西門",x:340,y:260,regions:["REG-13","REG-18","REG-03"],controls:["MNT-01","RD-04"],importance:"王國、矮人與西境三方共同重視的山口"},
 {id:"PASS-02",name:"藍塔隘",x:650,y:220,regions:["REG-13","REG-11","REG-03"],controls:["MNT-01","MNT-02","RD-04"],importance:"北脊礦路的最高通行點"},
 {id:"PASS-03",name:"赤牙關",x:1190,y:470,regions:["REG-17","REG-14"],controls:["MNT-03","RD-05"],importance:"鐵旗邊原進入赤牙腹地的主要軍事關隘"},
 {id:"PASS-04",name:"龍脊北口",x:1300,y:690,regions:["REG-14","REG-20"],controls:["MNT-03","MNT-04","RD-06"],importance:"火山高地北側少數可供大型隊伍通行的缺口"},
 {id:"PASS-05",name:"霜角口",x:260,y:300,regions:["REG-16","REG-18"],controls:["MNT-05"],importance:"霜角高地南下西境的傳統隘口"},
 {id:"PASS-06",name:"東門隘",x:1000,y:520,regions:["REG-02","REG-17","REG-09"],controls:["RIV-04","RD-05"],importance:"帝國東南邊防與草原商路的稅關節點"}
];

/* 國境形成理由：只記錄具有明顯地理／交通成因的關鍵邊界；其餘維持地方性界標與歷史協定。 */
const BORDER_LOGIC=[
 {regions:["REG-13","REG-16"],type:"ridge",features:["MNT-01"],note:"以石冠大山脈主稜與高地分水嶺為界，僅霜角口周邊可穩定越境。"},
 {regions:["REG-13","REG-03"],type:"ridge",features:["MNT-01","PASS-01","PASS-02"],note:"山脊是主界線，石冠西門與藍塔隘形成少數可控的跨境孔道。"},
 {regions:["REG-11","REG-12"],type:"watershed",features:["MNT-02","LAK-02"],note:"藍脊高地與鏡林湖上游分水嶺構成北部政治分界。"},
 {regions:["REG-01","REG-03"],type:"river-valley",features:["RIV-01","RD-01"],note:"瑟倫河上游河谷兼具邊界與通道雙重作用；王冠大道沿可渡河地帶穿越。"},
 {regions:["REG-01","REG-04"],type:"river",features:["RIV-02","LAK-01"],note:"白鐘河與環鐘湖西側水系形成長期行政邊界，橋梁與渡口比直線界標更重要。"},
 {regions:["REG-04","REG-09"],type:"river-corridor",features:["RIV-02","RD-02"],note:"沿白鐘河下游分界，但聖鐘大道使兩側城鎮保持高流動性。"},
 {regions:["REG-17","REG-14"],type:"pass",features:["MNT-03","PASS-03","RD-05"],note:"赤牙山牆阻斷大部分邊界，赤牙關因此成為軍政、關稅與情報核心。"},
 {regions:["REG-14","REG-15"],type:"seasonal-corridor",features:["RIV-05","RD-05"],note:"缺乏永久高山屏障，以季節河、牧路與承認的冬夏營地劃分勢力範圍，邊界較具彈性。"},
 {regions:["REG-14","REG-20"],type:"mountain-pass",features:["MNT-03","MNT-04","PASS-04"],note:"赤牙山牆銜接龍脊火山高地，國境實際由少數可通行山口決定。"},
 {regions:["REG-15","REG-20"],type:"escarpment",features:["MNT-04"],note:"草海向火山高地急遽抬升的地形差形成自然南界，遊牧勢力通常止於可放牧坡地。"},
 {regions:["REG-16","REG-18"],type:"pass",features:["MNT-05","PASS-05"],note:"霜角山地使界線沿山腳與谷口彎折，霜角口控制主要南北往來。"},
 {regions:["REG-18","REG-19"],type:"coast-river",features:["CST-01","RIV-03"],note:"海岸濕地與維薩河支流共同形成西南界，聚落多沿較乾燥的堤地發展。"},
 {regions:["REG-02","REG-17"],type:"checkpoint",features:["RIV-04","PASS-06"],note:"赫薩爾河谷缺乏完整天然壁壘，因此東門隘與沿河稅關實際塑造國境控制線。"}
];

const POLITICAL_NOTES={
 "POL-001":"阿斯戴爾王國本土；POL-018洛文邊侯領是王冠封臣但保有獨立地圖區。西北界主要受瑟倫河谷與石冠山地交通限制。",
 "POL-013":"石冠氏族王國控制地表山口、主要山廳與礦道；REG-13更深層另有黑月深庭主權。地表邊界大多順山脊與礦路關口。",
 "POL-015":"疆域按主要季節牧路、草場與承認範圍呈現，不代表固定城牆式邊界；與南方火山高地的界線以可放牧坡地為準。",
 "POL-019":"邊界代表長期無穩定主權的斷境荒野，不代表統一政府有效控制；道路、河谷與補給點的實際影響高於紙面界線。",
 "POL-020":"地下主權層；與POL-013在部分深層礦脈存在爭議，不應畫成地表獨立國境。"
};

const regionById=id=>(DB.world_regions||[]).find(x=>x?.id===id)||null;
const polityById=id=>(DB.political_entities||[]).find(x=>x?.id===id)||null;
const geomForPolity=pid=>{
  if(pid==="POL-020")return REGION_GEOMETRY.find(x=>x.political_entity_id===pid);
  const p=polityById(pid);return p?REGION_GEOMETRY.find(x=>x.region_id===p.core_region_id&&x.layer==="surface"):null;
};
const capitalForPolity=pid=>CAPITALS.find(x=>x.political_entity_id===pid)||null;
const fmtPoints=pts=>(pts||[]).map(p=>p[0]+","+p[1]).join(" ");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function centroid(points){
 let x=0,y=0;if(!points?.length)return [0,0];
 for(const p of points){x+=p[0];y+=p[1]}
 return [Math.round(x/points.length),Math.round(y/points.length)];
}
function pointInPolygon(x,y,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
   const xi=points[i][0],yi=points[i][1],xj=points[j][0],yj=points[j][1];
   const hit=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi||1e-9)+xi);
   if(hit)inside=!inside;
 }
 return inside;
}
function colorForPolity(pid){
 const p=polityById(pid),n=Number(p?.index)||1;
 return "hsl("+((n*47)%360)+" 34% 31%)";
}
function polityIdForGeometry(g){
 if(g.political_entity_id)return g.political_entity_id;
 return regionById(g.region_id)?.political_entity_id||null;
}
function adjacentPolities(pid){
 const p=polityById(pid);if(!p)return [];
 if(pid==="POL-020")return ["POL-013"];
 const rids=REGION_ADJACENCY[p.core_region_id]||[];
 return [...new Set(rids.map(r=>regionById(r)?.political_entity_id).filter(Boolean))];
}
function adjacentNonstateRegions(pid){
 const p=polityById(pid);if(!p||pid==="POL-020")return [];
 return (REGION_ADJACENCY[p.core_region_id]||[]).filter(r=>!regionById(r)?.political_entity_id);
}
function featuresForRegion(rid){
 const rows=[];
 for(const [kind,list] of [["山脈",MOUNTAIN_RANGES],["河川",RIVERS],["湖泊",LAKES],["道路",ROADS],["關隘",PASSES],["海岸",COASTLINES]]){
   const names=list.filter(x=>(x.regions||[]).includes(rid)).map(x=>x.name);
   if(names.length)rows.push({kind,names});
 }
 return rows;
}
function climatesForRegion(rid){
 return CLIMATE_BANDS.filter(x=>(x.regions||[]).includes(rid));
}
function borderLogicForRegion(rid){
 return BORDER_LOGIC.filter(x=>x.regions.includes(rid));
}
function featureById(id){
 return [...COASTLINES,...MOUNTAIN_RANGES,...RIVERS,...LAKES,...ROADS,...PASSES].find(x=>x.id===id)||null;
}

for(const p of (DB.political_entities||[])){
 const cap=capitalForPolity(p.id),geom=geomForPolity(p.id),rid=p.id==="POL-020"?"REG-13":p.core_region_id;
 p.world_map_profile={
   revision:REV,
   geometry_region_id:rid,
   layer:geom?.layer||"surface",
   capital_type:cap?.type||"unknown",
   capital_point:cap&&Number.isFinite(cap.x)?{x:cap.x,y:cap.y}:null,
   adjacent_polity_ids:adjacentPolities(p.id),
   adjacent_nonstate_region_ids:adjacentNonstateRegions(p.id),
   climate_zone_ids:climatesForRegion(rid).map(x=>x.id),
   physical_feature_ids:featuresForRegion(rid).flatMap(x=>x.names),
   border_logic:borderLogicForRegion(rid).map(x=>({regions:x.regions,type:x.type,features:x.features,note:x.note})),
   sovereignty_note:POLITICAL_NOTES[p.id]||null
 };
}

DB.world_geopolitical_map={
 version:REV,release:RELEASE,
 canvas:{width:W,height:H,projection:"fictional_atlas",origin:"northwest",coordinate_unit:"atlas"},
 layers:[
   {id:"surface",name:"政治＋地形",description:"政治疆域與自然地理、道路、關隘同圖顯示。"},
   {id:"physical",name:"自然地理",description:"弱化政治填色，突出海岸、山脈、河川、湖泊、道路與關隘。"},
   {id:"climate",name:"氣候帶",description:"顯示主要氣候帶與自然地理骨架，協助理解農牧、聚落與交通。"},
   {id:"subterranean",name:"地下主權",description:"黑月深庭與石冠山脈的重疊主權；地下河與礦道仍可後續深化。"}
 ],
 region_geometry:REGION_GEOMETRY,
 capitals:CAPITALS,
 region_adjacency:REGION_ADJACENCY,
 coastlines:COASTLINES,
 mountain_ranges:MOUNTAIN_RANGES,
 rivers:RIVERS,
 lakes:LAKES,
 climate_bands:CLIMATE_BANDS,
 major_roads:ROADS,
 border_passes:PASSES,
 border_logic:BORDER_LOGIC,
 political_notes:POLITICAL_NOTES,
 design_rules:[
   "政治疆界優先沿山脊、分水嶺、主要河川、海岸與火山高地形成；只有缺乏天然屏障時才以歷史界標或協定補足。",
   "主要道路不是單純裝飾：道路穿越天然屏障的位置會形成關隘、稅關、橋頭堡與軍事爭奪點。",
   "河川可同時是邊界與交通線；可航行河段附近的政治控制密度通常高於偏遠直線邊界。",
   "封臣政體可以有自己的地圖區與首府；宗主關係另外標示，不把封臣疆域直接抹除。",
   "遊牧汗國使用季節性汗庭錨點；草原國境依牧路、季節河與可放牧坡地呈帶狀變動，不建立虛假的永久直線。",
   "無主之地沒有固定首都；道路、補給點與水源的事實控制比名義邊界更重要。",
   "地下主權使用獨立layer，不能與地表疆域面積直接比較。",
   "REG-10黑潮群島、REG-17鐵旗邊原、REG-20龍脊火山群維持非統一主權區，不誤升格為國家。"
 ],
 save_compatible:true
};
DB.world_map=DB.world_map||{};
DB.world_map.geopolitical_geometry_revision=REV;
DB.world_map.geopolitical_layers=["surface","physical","climate","subterranean"];
DB.world_map.physical_geography_revision=REV;
DB.meta=DB.meta||{};
DB.meta.world_geopolitical_map_revision=REV;
DB.meta.world_physical_geography_revision=REV;

function svgPolyline(points,attrs=""){
 return '<polyline points="'+fmtPoints(points)+'" fill="none" '+attrs+'></polyline>';
}
function renderPhysicalFeatures(parts,mode){
 if(mode==="climate"){
   for(const z of CLIMATE_BANDS){
     parts.push('<polygon points="'+fmtPoints(z.polygon)+'" fill="hsl('+((Number(z.id.slice(-2))*53)%360)+' 40% 42% / '+z.opacity+')" stroke="rgba(220,230,222,.18)" stroke-width="2"><title>'+esc(z.name+"｜"+z.kind)+'</title></polygon>');
     const p=centroid(z.polygon);
     parts.push('<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" fill="#d8dfd9" font-size="18" font-weight="700" pointer-events="none">'+esc(z.name)+'</text>');
   }
 }
 for(const c of COASTLINES){
   parts.push(svgPolyline(c.points,'stroke="#6e9eb5" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"'+(c.closed?'':'') ));
   if(c.closed)parts.push('<polygon points="'+fmtPoints(c.points)+'" fill="none" stroke="#6e9eb5" stroke-width="8"></polygon>');
 }
 for(const m of MOUNTAIN_RANGES){
   parts.push(svgPolyline(m.points,'stroke="#a79b83" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".78"'));
   const p=m.points[Math.floor(m.points.length/2)];
   parts.push('<text x="'+p[0]+'" y="'+(p[1]-14)+'" text-anchor="middle" fill="#d9d0bd" font-size="16" font-weight="700" pointer-events="none">▲ '+esc(m.name)+'</text>');
 }
 for(const r of RIVERS){
   parts.push(svgPolyline(r.points,'stroke="'+(r.seasonal?'#7090a0':'#79b5cf')+'" stroke-width="'+(r.seasonal?5:7)+'" stroke-linecap="round" stroke-linejoin="round"'+(r.seasonal?' stroke-dasharray="13 8"':'') ));
 }
 for(const l of LAKES){
   parts.push('<ellipse cx="'+l.cx+'" cy="'+l.cy+'" rx="'+l.rx+'" ry="'+l.ry+'" fill="#3d7288" stroke="#88bfd3" stroke-width="3"><title>'+esc(l.name)+'</title></ellipse>');
   parts.push('<text x="'+l.cx+'" y="'+(l.cy+5)+'" text-anchor="middle" fill="#e2f2f7" font-size="13" font-weight="700" pointer-events="none">'+esc(l.name)+'</text>');
 }
 for(const rd of ROADS){
   parts.push(svgPolyline(rd.points,'stroke="#d1b36a" stroke-width="'+(rd.class==="royal"?7:5)+'" stroke-dasharray="'+(rd.class==="mountain"?"7 6":"14 8")+'" stroke-linecap="round" stroke-linejoin="round" opacity=".9"'));
 }
 for(const p of PASSES){
   parts.push('<g onclick="openWorldMapPass(\''+p.id+'\')" style="cursor:pointer"><circle cx="'+p.x+'" cy="'+p.y+'" r="11" fill="#1b201e" stroke="#f0c96c" stroke-width="4"></circle><text x="'+p.x+'" y="'+(p.y-17)+'" text-anchor="middle" fill="#f0d899" font-size="14" font-weight="800">'+esc(p.name)+'</text></g>');
 }
}
function renderSurfaceSvg(mode="surface"){
 const parts=['<rect width="'+W+'" height="'+H+'" fill="#0d1c22"></rect>'];
 const physicalOnly=mode==="physical"||mode==="climate";
 if(mode==="climate")renderPhysicalFeatures(parts,"climate");
 for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
   const region=regionById(g.region_id),pid=polityIdForGeometry(g),p=polityById(pid);
   const fill=pid?colorForPolity(pid):"#2b3130";
   const dash=g.nonstate?"10 7":"";
   const click=pid?"openWorldMapPolityTerritory('"+pid+"')":"openWorldMapNonStateRegion('"+g.region_id+"')";
   parts.push('<polygon points="'+fmtPoints(g.points)+'" fill="'+fill+'" fill-opacity="'+(physicalOnly?".28":".72")+'" stroke="'+(physicalOnly?"#66736d":"#91a19a")+'" stroke-width="'+(physicalOnly?2:4)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' onclick="'+click+'" style="cursor:pointer"><title>'+esc((p?.name||region?.name||g.region_id)+(g.nonstate?"（非統一主權區）":""))+'</title></polygon>');
 }
 if(mode!=="climate")renderPhysicalFeatures(parts,mode);
 if(mode==="climate"){
   /* 氣候底圖先畫帶色，再重疊自然地理，避免河川與道路被遮住。 */
   const physical=[];
   renderPhysicalFeatures(physical,"physical");
   parts.push(...physical);
 }
 for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
   const region=regionById(g.region_id),pid=polityIdForGeometry(g),p=polityById(pid),lp=g.label||centroid(g.points);
   parts.push('<text x="'+lp[0]+'" y="'+lp[1]+'" text-anchor="middle" fill="#f0eee6" font-size="'+(physicalOnly?19:23)+'" font-weight="700" pointer-events="none">'+esc(p?.name||region?.name||g.region_id)+'</text>');
   if(!physicalOnly)parts.push('<text x="'+lp[0]+'" y="'+(lp[1]+27)+'" text-anchor="middle" fill="#b8c2bd" font-size="17" pointer-events="none">'+esc(region?.name||"")+'</text>');
 }
 for(const c of CAPITALS.filter(x=>x.layer==="surface"&&x.type!=="none")){
   const p=polityById(c.political_entity_id);if(!p)continue;
   const marker=c.type==="mobile_court"?"◆":"●";
   parts.push('<text x="'+c.x+'" y="'+c.y+'" text-anchor="middle" fill="#ffe09a" font-size="28" font-weight="900" onclick="openWorldMapPolityTerritory(\''+c.political_entity_id+'\')" style="cursor:pointer"><title>'+esc(c.name)+'</title>'+marker+'</text>');
   if(!physicalOnly)parts.push('<text x="'+c.x+'" y="'+(c.y+22)+'" text-anchor="middle" fill="#ffe09a" font-size="15" font-weight="700" pointer-events="none">'+esc(c.name)+'</text>');
 }
 const aria=mode==="physical"?"群陸旅誌世界自然地理圖":mode==="climate"?"群陸旅誌世界氣候地理圖":"群陸旅誌世界政治與地理地圖";
 return '<div style="overflow:auto;border:1px solid #36423d;border-radius:14px;background:#111714;padding:8px"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+aria+'" style="width:100%;min-width:760px;height:auto;display:block">'+parts.join("")+'</svg></div>';
}
function renderUndergroundSvg(){
 const base=REGION_GEOMETRY.find(x=>x.region_id==="REG-13"&&x.layer==="surface");
 const g=REGION_GEOMETRY.find(x=>x.political_entity_id==="POL-020");
 const c=capitalForPolity("POL-020"),p=polityById("POL-020"),r=regionById("REG-13");
 const bpts=base?base.points.map(([x,y])=>[(x-260)*3+180,(y-40)*3+120]):[];
 const gpts=g.points.map(([x,y])=>[(x-360)*3+180,(y-120)*3+120]);
 const cx=(c.x-360)*3+180,cy=(c.y-120)*3+120;
 return '<div style="overflow:auto;border:1px solid #36423d;border-radius:14px;background:#111714;padding:8px"><svg viewBox="0 0 1100 760" role="img" aria-label="石冠山脈地下主權示意" style="width:100%;min-width:680px;height:auto;display:block">'+
   '<polygon points="'+fmtPoints(bpts)+'" fill="#242b28" stroke="#69766f" stroke-width="5" stroke-dasharray="12 9"></polygon>'+
   '<text x="520" y="90" text-anchor="middle" fill="#b9c2bd" font-size="24">'+esc(r?.name||"石冠山脈")+'地表投影</text>'+
   '<polygon points="'+fmtPoints(gpts)+'" fill="'+colorForPolity("POL-020")+'" stroke="#d1b36a" stroke-width="6" onclick="openWorldMapPolityTerritory(\'POL-020\')" style="cursor:pointer"></polygon>'+
   '<text x="520" y="360" text-anchor="middle" fill="#f0eee6" font-size="30" font-weight="700">'+esc(p?.name||"黑月深庭")+'</text>'+
   '<text x="'+cx+'" y="'+cy+'" text-anchor="middle" fill="#f3d68a" font-size="34" font-weight="900">●</text>'+
   '<text x="'+cx+'" y="'+(cy+28)+'" text-anchor="middle" fill="#f3d68a" font-size="20" font-weight="700">'+esc(c?.name||"黑月城")+'</text>'+
   '</svg></div>';
}
function mapPolityRows(){
 return (DB.political_entities||[]).map(p=>{
   const c=capitalForPolity(p.id);
   const cap=c?.type==="none"?"無固定首都":c?.type==="mobile_court"?"季節性汗庭":c?.name||p.capital||"—";
   const layer=p.world_map_profile?.layer==="subterranean"?"地下":"地表";
   return '<div class="itemrow"><span><b>'+esc(p.name)+'</b> <span class="tier">'+esc(p.world_tier||"—")+'</span><br><span class="small">'+esc(p.government_type||"")+'｜'+layer+'｜首都／中樞：'+esc(cap)+'</span></span><button onclick="openWorldMapPolityTerritory(\''+p.id+'\')">疆域</button></div>';
 }).join("");
}
function atlasLegend(mode){
 if(mode==="subterranean")return '地表虛線＝石冠山脈投影；金線＝地下主權。';
 const climate=mode==="climate"?'　半透明色帶＝主要氣候帶。':'';
 return '<b style="color:#ffe09a">●</b> 固定首都　<b style="color:#ffe09a">◆</b> 季節性統治中樞　<span style="color:#a79b83">▲</span> 山脈　<span style="color:#79b5cf">━</span> 河川／湖泊　<span style="color:#d1b36a">┄</span> 主要道路　<b style="color:#f0c96c">○</b> 國境關隘　政治虛線＝非統一主權區。'+climate;
}
function openWorldMapAtlas(layer){
 layer=["surface","physical","climate","subterranean"].includes(layer)?layer:"surface";
 const title=layer==="surface"?"政治＋地形":layer==="physical"?"自然地理":layer==="climate"?"氣候帶":"地下主權";
 const body='<div class="card small"><b>世界地圖・地理骨架 1.1</b><br>政治疆域已依海岸、山脊、分水嶺、河谷、火山高地與交通孔道微調；道路穿越屏障的位置形成關隘與稅關，而非以任意直線切割國境。</div>'+
   '<div class="actions"><button'+(layer==="surface"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'surface\')">政治＋地形</button><button'+(layer==="physical"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'physical\')">自然地理</button><button'+(layer==="climate"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'climate\')">氣候帶</button><button'+(layer==="subterranean"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'subterranean\')">地下主權</button></div>'+
   (layer==="subterranean"?renderUndergroundSvg():renderSurfaceSvg(layer))+
   '<div class="card small"><b>圖例</b>：'+atlasLegend(layer)+'</div>'+
   (layer==="subterranean"?'':'<div class="card small"><b>疆界生成原則</b>：高山與分水嶺優先形成穩定國界；大河兼具邊界與交通功能；缺少天然屏障的草原／荒地則由牧路、季節河、補給點與關隘決定實際控制線。</div>')+
   '<h3>政治體疆域索引</h3>'+mapPolityRows();
 if(typeof showModal==="function")showModal("世界地圖・"+title,body);
}
function openWorldMapPolityTerritory(pid){
 const p=polityById(pid);if(!p)return;
 const c=capitalForPolity(pid),g=geomForPolity(pid),r=regionById(pid==="POL-020"?"REG-13":p.core_region_id);
 const rid=pid==="POL-020"?"REG-13":p.core_region_id;
 const ad=adjacentPolities(pid).map(x=>polityById(x)?.name).filter(Boolean);
 const ns=adjacentNonstateRegions(pid).map(x=>regionById(x)?.name).filter(Boolean);
 const cap=c?.type==="none"?"無固定首都":c?.type==="mobile_court"?(c.name+"；"+(c.note||"")):(c?.name||p.capital||"—");
 const note=POLITICAL_NOTES[pid]||r?.sovereignty_note||"";
 const relation=p.vassal_of?("宗主："+(polityById(p.vassal_of)?.name||p.vassal_of)):"獨立主權／特殊非國家區";
 const layer=g?.layer==="subterranean"?"地下主權":"地表疆域";
 const featureRows=featuresForRegion(rid).map(x=>'<b>'+esc(x.kind)+'</b>：'+esc(x.names.join("、"))).join("<br>");
 const climates=climatesForRegion(rid).map(x=>x.name+"（"+x.kind+"）").join("、");
 const borders=borderLogicForRegion(rid).map(x=>{
   const other=x.regions.find(q=>q!==rid);
   const otherName=polityById(regionById(other)?.political_entity_id)?.name||regionById(other)?.name||other;
   const fs=x.features.map(id=>featureById(id)?.name||id).join("、");
   return '<div style="margin-top:6px"><b>對 '+esc(otherName)+'</b>：'+esc(x.note)+'<br><span class="small">依據：'+esc(fs)+'</span></div>';
 }).join("");
 const body='<div class="card"><b>'+esc(p.name)+'</b> <span class="tier">'+esc(p.world_tier||"—")+'</span><br><span class="small">'+esc(p.government_type||"")+'｜'+esc(layer)+'｜'+esc(relation)+'</span></div>'+
   '<div class="card small"><b>疆域核心</b>：'+esc(r?.name||p.core_region_id)+'<br><b>首都／統治中樞</b>：'+esc(cap)+'<br><b>相鄰政治體</b>：'+esc(ad.join("、")||"無直接政治邊界")+(ns.length?'<br><b>相鄰非主權區</b>：'+esc(ns.join("、")):"")+(note?'<br><b>主權說明</b>：'+esc(note):"")+'</div>'+
   (g?.layer==="subterranean"?'':'<div class="card small"><b>自然與交通骨架</b><br>'+(featureRows||"目前無大型地理要素標記")+(climates?'<br><b>氣候</b>：'+esc(climates):"")+'</div>')+
   (borders?'<div class="card small"><b>國境形成原因</b>'+borders+'</div>':"")+
   '<div class="actions"><button onclick="openWorldMapAtlas(\''+(g?.layer==="subterranean"?"subterranean":"surface")+'\')">回地圖</button>'+(typeof openPolity==="function"?'<button onclick="openPolity(\''+p.id+'\')">政治體資料</button>':"")+(typeof openRealmRegionMap==="function"&&pid!=="POL-020"?'<button onclick="openRealmRegionMap(\'RMAP-'+p.id+'\')">區域層級</button>':"")+'</div>';
 if(typeof showModal==="function")showModal(p.name+"・疆域與地理",body);
}
function openWorldMapNonStateRegion(rid){
 const r=regionById(rid);if(!r)return;
 const neighbors=(REGION_ADJACENCY[rid]||[]).map(id=>regionById(id)?.name).filter(Boolean);
 const featureRows=featuresForRegion(rid).map(x=>'<b>'+esc(x.kind)+'</b>：'+esc(x.names.join("、"))).join("<br>");
 const climates=climatesForRegion(rid).map(x=>x.name+"（"+x.kind+"）").join("、");
 const borders=borderLogicForRegion(rid).map(x=>'<div style="margin-top:6px">'+esc(x.note)+'</div>').join("");
 const body='<div class="card"><b>'+esc(r.name)+'</b> <span class="tier">'+esc(r.recommended_tier||"—")+'</span><br><span class="small">非統一主權區｜'+esc(r.terrain||"")+'</span></div>'+
   '<div class="card small"><b>政治狀態</b>：'+esc(r.political_status||"非主權大區")+'<br><b>相鄰大區</b>：'+esc(neighbors.join("、")||"—")+'<br><b>說明</b>：'+esc(r.sovereignty_note||"沒有建立獲承認的統一主權政體。")+'</div>'+
   '<div class="card small"><b>自然與交通骨架</b><br>'+(featureRows||"目前無大型地理要素標記")+(climates?'<br><b>氣候</b>：'+esc(climates):"")+(borders?'<br><b>邊界／通道</b>'+borders:"")+'</div>'+
   '<div class="actions"><button onclick="openWorldMapAtlas(\'surface\')">回地圖</button>'+(typeof openLoreScope==="function"?'<button onclick="openLoreScope(\'region\',\''+rid+'\',\''+esc(r.name)+'・地方誌\')">地方誌</button>':"")+'</div>';
 if(typeof showModal==="function")showModal(r.name+"・非主權區",body);
}
function openWorldMapPass(id){
 const p=PASSES.find(x=>x.id===id);if(!p)return;
 const regionNames=p.regions.map(r=>regionById(r)?.name||r).join("、");
 const controls=p.controls.map(x=>featureById(x)?.name||x).join("、");
 const body='<div class="card"><b>'+esc(p.name)+'</b><br><span class="small">國境關隘／交通瓶頸</span></div><div class="card small"><b>涉及大區</b>：'+esc(regionNames)+'<br><b>控制要素</b>：'+esc(controls)+'<br><b>戰略意義</b>：'+esc(p.importance)+'</div><div class="actions"><button onclick="openWorldMapAtlas(\'surface\')">回地圖</button></div>';
 if(typeof showModal==="function")showModal(p.name,body);
}

const previousWorldMap=typeof globalThis.openWorldMapHierarchy==="function"?globalThis.openWorldMapHierarchy:null;
globalThis.openWorldMapHierarchy=function(){openWorldMapAtlas("surface")};
globalThis.openWorldMapAtlas=openWorldMapAtlas;
globalThis.openWorldMapPolityTerritory=openWorldMapPolityTerritory;
globalThis.openWorldMapNonStateRegion=openWorldMapNonStateRegion;
globalThis.openWorldMapPass=openWorldMapPass;
globalThis.QUNLU_PREVIOUS_WORLD_MAP_HIERARCHY=previousWorldMap;

function audit(){
 const issues=[];
 const polities=DB.political_entities||[];
 if(polities.length!==18)issues.push("政治體數量偏離CURRENT基準18："+polities.length);
 const regionIds=new Set((DB.world_regions||[]).map(x=>x.id));
 const geomSurface=new Map(REGION_GEOMETRY.filter(x=>x.layer==="surface").map(x=>[x.region_id,x]));
 for(let i=1;i<=20;i++){
   const rid="REG-"+String(i).padStart(2,"0");
   if(!regionIds.has(rid))issues.push("世界大區缺資料："+rid);
   if(!geomSurface.has(rid))issues.push("世界大區缺地表疆域："+rid);
 }
 const capMap=new Map(CAPITALS.map(x=>[x.political_entity_id,x]));
 for(const p of polities){
   const c=capMap.get(p.id);if(!c){issues.push("政治體缺首都策略："+p.id);continue}
   const g=geomForPolity(p.id);if(!g){issues.push("政治體缺疆域："+p.id);continue}
   if(c.type==="fixed"&&(!Number.isFinite(c.x)||!Number.isFinite(c.y)))issues.push("固定首都缺座標："+p.id);
   if(c.type==="fixed"&&c.name!==p.capital)issues.push("固定首都名稱與正史不一致："+p.id+" "+c.name+"!="+p.capital);
   if(c.type==="mobile_court"&&p.capital!=="無固定都城")issues.push("移動宮廷卻存在固定首都："+p.id);
   if(c.type==="none"&&p.capital!=="無固定都城")issues.push("無首都策略與正史不一致："+p.id);
   if(c.type!=="none"&&!pointInPolygon(c.x,c.y,g.points))issues.push("首都座標不在自身疆域："+p.id);
 }
 for(const [rid,neighbors] of Object.entries(REGION_ADJACENCY)){
   for(const n of neighbors)if(!(REGION_ADJACENCY[n]||[]).includes(rid))issues.push("邊界相鄰關係非對稱："+rid+"->"+n);
 }
 const uniqueCheck=(rows,label)=>{
   const ids=new Set();
   for(const x of rows){
     if(!x.id)issues.push(label+"缺ID");
     else if(ids.has(x.id))issues.push(label+"ID重複："+x.id);
     ids.add(x.id);
     for(const rid of x.regions||[])if(!regionIds.has(rid))issues.push(label+"引用未知大區："+x.id+"->"+rid);
   }
 };
 uniqueCheck(COASTLINES,"海岸");uniqueCheck(MOUNTAIN_RANGES,"山脈");uniqueCheck(RIVERS,"河川");uniqueCheck(LAKES,"湖泊");uniqueCheck(CLIMATE_BANDS,"氣候帶");uniqueCheck(ROADS,"道路");uniqueCheck(PASSES,"關隘");
 for(const b of BORDER_LOGIC){
   if(!Array.isArray(b.regions)||b.regions.length!==2)issues.push("國境成因缺雙邊："+JSON.stringify(b.regions));
   else{
     const [a,z]=b.regions;
     if(!(REGION_ADJACENCY[a]||[]).includes(z))issues.push("國境成因引用非相鄰大區："+a+"<->"+z);
   }
   for(const fid of b.features||[])if(!featureById(fid))issues.push("國境成因引用未知要素："+fid);
 }
 if(COASTLINES.length<6)issues.push("海岸線資料不足");
 if(MOUNTAIN_RANGES.length<5)issues.push("山脈資料不足");
 if(RIVERS.length<5)issues.push("河川資料不足");
 if(LAKES.length<3)issues.push("湖泊資料不足");
 if(CLIMATE_BANDS.length<6)issues.push("氣候帶資料不足");
 if(ROADS.length<6)issues.push("主要道路資料不足");
 if(PASSES.length<6)issues.push("國境關隘資料不足");
 if(BORDER_LOGIC.length<10)issues.push("國境地理成因覆蓋不足");
 if(polityById("POL-018")?.vassal_of!=="POL-001")issues.push("洛文邊侯領宗主關係遺失");
 if(!REGION_GEOMETRY.some(x=>x.political_entity_id==="POL-020"&&x.layer==="subterranean"))issues.push("黑月深庭地下主權層遺失");
 for(const rid of ["REG-10","REG-17","REG-20"])if(regionById(rid)?.political_entity_id)issues.push("非統一主權區被誤升格："+rid);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{
   political_entities:polities.length,
   surface_regions:REGION_GEOMETRY.filter(x=>x.layer==="surface").length,
   subterranean_polities:1,
   fixed_capitals:CAPITALS.filter(x=>x.type==="fixed").length,
   mobile_courts:CAPITALS.filter(x=>x.type==="mobile_court").length,
   no_capital_zones:CAPITALS.filter(x=>x.type==="none").length,
   coastlines:COASTLINES.length,mountain_ranges:MOUNTAIN_RANGES.length,rivers:RIVERS.length,lakes:LAKES.length,
   climate_bands:CLIMATE_BANDS.length,major_roads:ROADS.length,border_passes:PASSES.length,border_logic:BORDER_LOGIC.length
 }};
}
DB.world_geopolitical_map.initial_audit=audit();
globalThis.runWorldGeopoliticalMapAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/world-map-geopolitics-v1.js",{domain:"world",revision:REV,release:RELEASE});
})();