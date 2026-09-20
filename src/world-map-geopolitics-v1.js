/* 群陸旅誌：世界政治地圖地理骨架 CURRENT-1.90.0
 * WORLD-MAP-GEOPOLITICS-1.3
 * 在既有政治疆域底板上加入海岸、山脈、河川、湖泊、氣候帶、主要道路與國境關隘，
 * 並使政治疆界的形狀與說明受到天然屏障、分水嶺、河谷與交通控制點影響；不改旅行解鎖與存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.90.0")||"CURRENT-1.90.0";
const REV="WORLD-MAP-GEOPOLITICS-1.3";
const W=1800,H=1100;

/* 地表政治疆域：1.1版將原先大面積直線切割改成沿河谷、山脊、火山高地與交通走廊的折線。
 * 同一區域仍維持原region_id / political_entity_id，不破壞既有世界資料與存檔。
 */
const REGION_GEOMETRY=[
 {region_id:"REG-01",layer:"surface",points:[[520,430],[610,420],[650,390],[710,440],[800,460],[790,530],[760,600],[700,660],[640,700],[580,680],[510,625],[560,610],[590,555],[600,500],[570,455]],label:[665,535]},
 {region_id:"REG-02",layer:"surface",points:[[1040,410],[1110,380],[1190,390],[1260,430],[1290,500],[1260,570],[1200,620],[1120,630],[1080,580],[1050,510],[1000,460]],label:[1145,500]},
 {region_id:"REG-03",layer:"surface",points:[[610,300],[740,285],[830,300],[920,310],[1010,300],[1050,350],[1040,410],[1000,460],[900,470],[800,460],[710,440],[650,390]],label:[835,385]},
 {region_id:"REG-04",layer:"surface",points:[[790,530],[900,470],[1000,460],[1050,510],[1080,580],[1040,650],[960,700],[880,690],[820,630],[760,600]],label:[930,585]},
 {region_id:"REG-05",layer:"surface",points:[[420,650],[470,590],[510,625],[580,680],[640,700],[650,760],[610,820],[540,850],[460,830],[420,780],[470,700]],label:[535,750]},
 {region_id:"REG-06",layer:"surface",points:[[650,760],[680,780],[740,800],[800,780],[850,740],[880,690],[960,700],[980,760],[940,820],[880,860],[810,870],[730,850],[670,820]],label:[820,810]},
 {region_id:"REG-07",layer:"surface",points:[[580,680],[640,700],[700,660],[760,600],[820,630],[880,690],[850,740],[800,780],[740,800],[680,780],[650,760]],label:[745,715]},
 {region_id:"REG-08",layer:"surface",points:[[900,930],[940,910],[985,920],[1015,950],[1008,995],[980,1030],[935,1035],[900,1010],[885,970]],label:[950,975],island:true},
 {region_id:"REG-09",layer:"surface",points:[[1040,650],[1080,580],[1120,630],[1200,620],[1300,600],[1360,650],[1350,720],[1300,780],[1220,810],[1140,790],[1080,750],[960,700]],label:[1175,705]},
 {region_id:"REG-10",layer:"surface",points:[[1400,900],[1460,885],[1520,900],[1560,940],[1550,990],[1500,1020],[1440,1010],[1390,970]],label:[1480,955],island:true,island_class:"major"},
 {region_id:"REG-10",layer:"surface",points:[[1600,900],[1650,890],[1700,920],[1720,970],[1690,1020],[1630,1030],[1580,990],[1585,940]],island:true,island_class:"major",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1230,930],[1280,910],[1335,925],[1360,970],[1335,1015],[1280,1030],[1235,1000],[1215,960]],island:true,island_class:"major",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1140,875],[1170,865],[1195,885],[1185,915],[1150,920]],island:true,island_class:"minor",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1360,1030],[1390,1025],[1410,1050],[1390,1075],[1360,1065]],island:true,island_class:"minor",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1555,1035],[1580,1030],[1600,1055],[1580,1080],[1555,1070]],island:true,island_class:"minor",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1710,845],[1740,840],[1760,860],[1745,885],[1715,880]],island:true,island_class:"minor",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1080,980],[1110,970],[1135,990],[1120,1020],[1090,1015]],island:true,island_class:"minor",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1198,855],[1208,848],[1218,858],[1208,870]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1345,900],[1355,892],[1365,902],[1354,914]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1420,1040],[1432,1034],[1440,1046],[1428,1058]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1535,890],[1545,882],[1556,892],[1544,904]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1620,1050],[1630,1044],[1640,1056],[1628,1066]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1740,1000],[1750,992],[1762,1002],[1752,1014]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-10",layer:"surface",points:[[1125,940],[1135,934],[1145,944],[1134,954]],island:true,island_class:"islet",show_label:false},
 {region_id:"REG-11",layer:"surface",points:[[1030,165],[1120,150],[1210,160],[1300,190],[1340,250],[1320,320],[1260,360],[1190,390],[1110,380],[1040,410],[1050,350],[1010,300],[1080,260],[1090,205]],label:[1185,270]},
 {region_id:"REG-12",layer:"surface",points:[[70,690],[150,670],[210,650],[270,690],[350,700],[420,650],[470,700],[460,780],[420,860],[350,930],[270,960],[180,950],[110,900],[70,820]],label:[270,810]},
 {region_id:"REG-13",layer:"surface",points:[[90,150],[150,125],[230,120],[310,135],[390,170],[470,220],[500,280],[470,350],[420,410],[340,430],[260,415],[180,380],[120,320],[85,245]],label:[285,275]},
 {region_id:"REG-14",layer:"surface",points:[[1300,190],[1390,150],[1490,135],[1590,145],[1680,180],[1730,240],[1720,330],[1680,410],[1600,460],[1510,470],[1430,440],[1360,390],[1320,320],[1340,250]],label:[1520,300]},
 {region_id:"REG-15",layer:"surface",points:[[620,155],[700,145],[735,145],[800,160],[880,165],[940,145],[1030,165],[1090,205],[1080,260],[1010,300],[920,310],[830,300],[740,285],[660,250]],label:[850,225]},
 {region_id:"REG-16",layer:"surface",points:[[690,55],[760,40],[850,42],[930,58],[965,100],[940,145],[880,165],[800,160],[735,145],[700,110]],label:[825,100]},
 {region_id:"REG-17",layer:"surface",points:[[1260,360],[1320,320],[1360,390],[1430,440],[1410,510],[1370,570],[1300,600],[1260,570],[1290,500],[1260,430],[1190,390]],label:[1325,465],nonstate:true},
 {region_id:"REG-18",layer:"surface",points:[[470,440],[520,430],[570,455],[600,500],[590,555],[560,610],[510,625],[470,590],[450,540],[480,510]],label:[525,530]},
 {region_id:"REG-19",layer:"surface",points:[[180,405],[260,415],[340,430],[420,410],[470,440],[480,510],[450,580],[420,650],[350,700],[270,690],[210,650],[170,580],[150,500]],label:[310,545]},
 {region_id:"REG-20",layer:"surface",points:[[1360,650],[1410,570],[1510,470],[1600,460],[1680,410],[1740,470],[1760,560],[1740,650],[1700,720],[1650,790],[1580,850],[1490,880],[1400,850],[1350,780],[1350,720]],label:[1560,680],nonstate:true},
 {region_id:"REG-13",political_entity_id:"POL-020",layer:"subterranean",points:[[210,205],[260,190],[320,195],[380,220],[410,270],[390,325],[340,360],[280,350],[225,320],[195,265]],label:[300,275],overlap:true}
];

const CAPITALS=[
 {political_entity_id:"POL-001",name:"瑟倫堡",type:"fixed",layer:"surface",x:665,y:540},
 {political_entity_id:"POL-002",name:"赫薩爾帝都",type:"fixed",layer:"surface",x:1145,y:500},
 {political_entity_id:"POL-003",name:"聖冠城",type:"fixed",layer:"surface",x:835,y:385},
 {political_entity_id:"POL-004",name:"晨鐘聖城",type:"fixed",layer:"surface",x:930,y:580},
 {political_entity_id:"POL-007",name:"卡薩維爾",type:"fixed",layer:"surface",x:745,y:720},
 {political_entity_id:"POL-008",name:"金衡港",type:"fixed",layer:"surface",x:950,y:975},
 {political_entity_id:"POL-009",name:"灰刃城",type:"fixed",layer:"surface",x:1175,y:700},
 {political_entity_id:"POL-010",name:"黑潮京",type:"fixed",layer:"surface",x:1480,y:955},
 {political_entity_id:"POL-011",name:"藍塔城",type:"fixed",layer:"surface",x:1185,y:270},
 {political_entity_id:"POL-012",name:"瑟露維亞林冠庭",type:"fixed",layer:"surface",x:270,y:815},
 {political_entity_id:"POL-013",name:"深砧王廳",type:"fixed",layer:"surface",x:285,y:270},
 {political_entity_id:"POL-014",name:"泰爾瓦隆大營",type:"fixed",layer:"surface",x:1520,y:300},
 {political_entity_id:"POL-015",name:"白氈大汗庭（季節性位置）",canonical_capital:"無固定都城",type:"mobile_court",layer:"surface",x:850,y:225,note:"僅為當季汗庭地圖錨點；白氈汗國不建立永久首都。"},
 {political_entity_id:"POL-016",name:"霜角石圈",type:"fixed",layer:"surface",x:825,y:100},
 {political_entity_id:"POL-019",name:null,type:"none",layer:"surface",note:"斷境無主地沒有被共同承認的固定首都。"},
 {political_entity_id:"POL-020",name:"黑月城",type:"fixed",layer:"subterranean",x:300,y:275}
];

const REGION_ADJACENCY={
 "REG-01":["REG-18","REG-03","REG-04","REG-07","REG-05"],
 "REG-02":["REG-11","REG-03","REG-04","REG-17","REG-09"],
 "REG-03":["REG-15","REG-11","REG-02","REG-04","REG-01"],
 "REG-04":["REG-03","REG-02","REG-01","REG-07","REG-09"],
 "REG-05":["REG-18","REG-19","REG-01","REG-07","REG-06","REG-12"],
 "REG-06":["REG-05","REG-07","REG-09","REG-08"],
 "REG-07":["REG-01","REG-05","REG-06","REG-04"],
 "REG-08":["REG-06","REG-10"],
 "REG-09":["REG-04","REG-02","REG-17","REG-20","REG-06"],
 "REG-10":["REG-08","REG-20"],
 "REG-11":["REG-15","REG-03","REG-02","REG-14","REG-17"],
 "REG-12":["REG-19","REG-05"],
 "REG-13":["REG-19","REG-18"],
 "REG-14":["REG-11","REG-17","REG-20"],
 "REG-15":["REG-16","REG-03","REG-11"],
 "REG-16":["REG-15"],
 "REG-17":["REG-11","REG-14","REG-02","REG-09","REG-20"],
 "REG-18":["REG-13","REG-19","REG-01","REG-05"],
 "REG-19":["REG-13","REG-18","REG-12","REG-05"],
 "REG-20":["REG-14","REG-17","REG-09","REG-10"]
};

const COASTLINES=[
 {id:"CST-01",name:"西冠海岸",points:[[90,150],[85,245],[120,320],[150,500],[70,690],[70,820],[110,900],[180,950],[270,960]],regions:["REG-13","REG-19","REG-12"]},
 {id:"CST-02",name:"北冠海岸",points:[[90,150],[150,125],[230,120],[390,170],[620,155],[690,55],[850,42],[965,100],[1090,205],[1300,190],[1490,135],[1680,180]],regions:["REG-13","REG-15","REG-16","REG-11","REG-14"]},
 {id:"CST-03",name:"東風海岸",points:[[1680,180],[1730,240],[1720,330],[1680,410],[1740,470],[1760,560],[1740,650],[1700,720],[1580,850]],regions:["REG-14","REG-20"]},
 {id:"CST-04",name:"南曜海岸",points:[[1580,850],[1490,880],[1360,650],[1300,780],[1220,810],[980,760],[940,820],[810,870],[650,760],[610,820],[540,850],[420,860],[350,930],[270,960]],regions:["REG-20","REG-09","REG-06","REG-05","REG-12"]},
 {id:"CST-05",name:"金衡自由島岸",closed:true,points:[[900,930],[940,910],[985,920],[1015,950],[1008,995],[980,1030],[935,1035],[900,1010],[885,970]],regions:["REG-08"]},
 {id:"CST-BT01",name:"黑潮第一大島岸",closed:true,points:[[1400,900],[1460,885],[1520,900],[1560,940],[1550,990],[1500,1020],[1440,1010],[1390,970]],regions:["REG-10"]},
 {id:"CST-BT02",name:"黑潮第二大島岸",closed:true,points:[[1600,900],[1650,890],[1700,920],[1720,970],[1690,1020],[1630,1030],[1580,990],[1585,940]],regions:["REG-10"]},
 {id:"CST-BT03",name:"黑潮第三大島岸",closed:true,points:[[1230,930],[1280,910],[1335,925],[1360,970],[1335,1015],[1280,1030],[1235,1000],[1215,960]],regions:["REG-10"]},
 {id:"CST-BT04",name:"黑潮第一小島岸",closed:true,points:[[1140,875],[1170,865],[1195,885],[1185,915],[1150,920]],regions:["REG-10"]},
 {id:"CST-BT05",name:"黑潮第二小島岸",closed:true,points:[[1360,1030],[1390,1025],[1410,1050],[1390,1075],[1360,1065]],regions:["REG-10"]},
 {id:"CST-BT06",name:"黑潮第三小島岸",closed:true,points:[[1555,1035],[1580,1030],[1600,1055],[1580,1080],[1555,1070]],regions:["REG-10"]},
 {id:"CST-BT07",name:"黑潮第四小島岸",closed:true,points:[[1710,845],[1740,840],[1760,860],[1745,885],[1715,880]],regions:["REG-10"]},
 {id:"CST-BT08",name:"黑潮第五小島岸",closed:true,points:[[1080,980],[1110,970],[1135,990],[1120,1020],[1090,1015]],regions:["REG-10"]}
];

const MOUNTAIN_RANGES=[
 {id:"MNT-01",name:"安威爾冠脊",tier:"continental",points:[[120,190],[180,220],[240,260],[300,300],[360,340],[420,380],[470,420]],regions:["REG-13","REG-19","REG-18"],barrier:"高"},
 {id:"MNT-02",name:"藍脊高地",tier:"major",points:[[1030,190],[1100,230],[1170,270],[1240,315],[1300,360]],regions:["REG-11","REG-02","REG-17"],barrier:"中高"},
 {id:"MNT-03",name:"泰爾瓦隆東北山牆",tier:"major",points:[[1370,205],[1430,250],[1490,300],[1550,350],[1610,405]],regions:["REG-14","REG-20"],barrier:"高"},
 {id:"MNT-04",name:"龍脊火山弧",tier:"major",points:[[1370,700],[1430,730],[1500,750],[1570,730],[1640,690],[1700,620]],regions:["REG-20"],barrier:"極高"},
 {id:"MNT-05",name:"霜角北嶺",tier:"regional",points:[[720,80],[780,75],[840,90],[900,115],[940,145]],regions:["REG-16","REG-15"],barrier:"中高"},
 {id:"MNT-06",name:"瑟露維亞古林嶺",tier:"regional",points:[[130,760],[190,730],[260,720],[330,735],[400,770]],regions:["REG-12","REG-19"],barrier:"中"}
];

const RIVERS=[
 {id:"RIV-01",name:"瑟倫河",source:"安威爾冠脊東南麓",mouth:"南曜海",points:[[430,390],[470,440],[520,500],[560,560],[590,620],[600,690],[570,760],[540,830]],regions:["REG-13","REG-18","REG-01","REG-05"],navigable_from:[560,560]},
 {id:"RIV-02",name:"白鐘河",source:"白氈草海南緣",mouth:"中央南海",points:[[850,285],[850,340],[860,400],[880,470],[910,540],[930,610],[960,700]],regions:["REG-15","REG-03","REG-04","REG-09"],navigable_from:[910,540]},
 {id:"RIV-03",name:"維薩河",source:"西境丘陵",mouth:"西南海灣",points:[[500,500],[480,560],[470,620],[455,690],[440,760],[420,830]],regions:["REG-18","REG-05"],navigable_from:[470,620]},
 {id:"RIV-04",name:"赫薩爾河",source:"藍脊高地",mouth:"龍脊灣",points:[[1190,350],[1180,410],[1190,470],[1210,530],[1250,590],[1300,650],[1380,700]],regions:["REG-11","REG-02","REG-17","REG-09","REG-20"],navigable_from:[1250,590]},
 {id:"RIV-05",name:"百族季流",source:"泰爾瓦隆東北草原",mouth:"東南海",seasonal:true,points:[[1600,210],[1580,270],[1560,330],[1530,390],[1510,470],[1490,540],[1460,610]],regions:["REG-14","REG-20"],navigable_from:null}
];

const LAKES=[
 {id:"LAK-01",name:"環鐘湖",cx:910,cy:505,rx:45,ry:24,regions:["REG-04"],outflow:"RIV-02"},
 {id:"LAK-02",name:"鏡塔湖",cx:1160,cy:305,rx:50,ry:27,regions:["REG-11"],outflow:"RIV-04"},
 {id:"LAK-03",name:"黑砧高湖",cx:300,cy:285,rx:38,ry:21,regions:["REG-13"],outflow:"RIV-01"}
];

const CLIMATE_BANDS=[
 {id:"CLM-01",name:"極北霜原帶",kind:"寒冷高山／苔原",regions:["REG-16","REG-15"],polygon:[[600,25],[1000,25],[1120,200],[1030,315],[690,300],[590,170]],opacity:.23},
 {id:"CLM-02",name:"西北山地冷溫帶",kind:"高山針林／礦脈",regions:["REG-13","REG-19","REG-18"],polygon:[[60,100],[510,110],[610,470],[470,650],[140,620],[50,350]],opacity:.18},
 {id:"CLM-03",name:"西南古林海洋帶",kind:"濕潤海洋性／古林",regions:["REG-12","REG-05"],polygon:[[40,620],[500,600],[680,850],[520,1040],[80,1030],[30,800]],opacity:.18},
 {id:"CLM-04",name:"中央河谷溫帶",kind:"溫帶大陸性／河谷",regions:["REG-01","REG-02","REG-03","REG-04","REG-06","REG-07","REG-09"],polygon:[[480,300],[1320,300],[1400,820],[650,910],[420,660]],opacity:.16},
 {id:"CLM-05",name:"東北草海季風帶",kind:"半乾燥草原／季節風",regions:["REG-14","REG-17"],polygon:[[1260,120],[1760,120],[1790,650],[1370,670],[1190,390]],opacity:.2},
 {id:"CLM-06",name:"南海群島暖濕帶",kind:"暖溫帶海洋性／季風島嶼",regions:["REG-08","REG-10","REG-20"],polygon:[[840,820],[1780,800],[1790,1090],[850,1090]],opacity:.18}
];

const ROADS=[
 {id:"RD-01",name:"西冠大道",class:"royal",points:[[285,270],[370,360],[470,470],[525,530],[665,540],[760,500],[835,385]],regions:["REG-13","REG-19","REG-18","REG-01","REG-03"],strategic:"連接西北安威爾、斷境邊緣、西境與中央王原的主要陸路。"},
 {id:"RD-02",name:"聖鐘大道",class:"pilgrim",points:[[835,385],[870,450],[900,520],[930,580],[1040,650],[1175,700]],regions:["REG-03","REG-04","REG-09"],strategic:"朝聖、軍隊與糧運共用的中央幹道。"},
 {id:"RD-03",name:"三港商路",class:"trade",points:[[665,540],[700,620],[745,720],[820,810],[900,900],[950,975]],regions:["REG-01","REG-07","REG-06","REG-08"],strategic:"卡薩維爾城盟通往金衡自由港的陸海轉運主軸。"},
 {id:"RD-04",name:"北氈牧路",class:"steppe",points:[[825,100],[840,160],[850,225],[845,300],[835,385]],regions:["REG-16","REG-15","REG-03"],strategic:"霜角南下白氈汗國與聖曜帝國的季節牧路與使節路。"},
 {id:"RD-05",name:"東北百族商道",class:"frontier",points:[[1145,500],[1260,470],[1325,465],[1420,400],[1520,300]],regions:["REG-02","REG-17","REG-14"],strategic:"連接帝國邊防、鐵旗軍鎮與泰爾瓦隆百族部落的商旅與軍事走廊。"},
 {id:"RD-06",name:"龍脊南路",class:"frontier",points:[[1175,700],[1270,720],[1360,700],[1460,720],[1560,680],[1650,620]],regions:["REG-09","REG-20"],strategic:"繞開火山核心的南部補給線。"},
 {id:"RD-07",name:"西南林境路",class:"frontier",points:[[285,270],[300,400],[310,545],[290,680],[270,815]],regions:["REG-13","REG-19","REG-12"],strategic:"穿越斷境，連接安威爾西北山地與瑟露維亞西南古林的危險陸路。"}
];

const PASSES=[
 {id:"PASS-01",name:"安威爾南門",x:455,y:420,regions:["REG-13","REG-18"],controls:["MNT-01","RD-01"],importance:"西北帝國山地進入阿斯戴爾西境的主要關門。"},
 {id:"PASS-02",name:"藍塔隘",x:1230,y:355,regions:["REG-11","REG-02"],controls:["MNT-02","RIV-04"],importance:"藍脊高地與赫薩爾河上游的學術、礦產與軍事通道。"},
 {id:"PASS-03",name:"百族西關",x:1360,y:390,regions:["REG-14","REG-17"],controls:["MNT-03","RD-05"],importance:"鐵旗邊原進入泰爾瓦隆腹地的主要軍政、關稅與情報關隘。"},
 {id:"PASS-04",name:"龍脊北口",x:1450,y:570,regions:["REG-14","REG-20"],controls:["MNT-03","MNT-04"],importance:"東北草原與火山高地之間少數可供大型隊伍通行的缺口。"},
 {id:"PASS-05",name:"霜角南口",x:850,y:155,regions:["REG-16","REG-15"],controls:["MNT-05","RD-04"],importance:"霜角酋邦南下白氈汗國的唯一主要高地通道。"},
 {id:"PASS-06",name:"東門隘",x:1270,y:430,regions:["REG-02","REG-17"],controls:["RIV-04","RD-05"],importance:"赫薩爾帝國東境與鐵旗邊原之間的稅關與軍事節點。"},
 {id:"PASS-07",name:"斷境雙門",x:300,y:685,regions:["REG-19","REG-12"],controls:["MNT-06","RD-07"],importance:"斷境進入瑟露維亞精靈王庭的林緣狹口；商旅需依補給點與季節安全狀況通行。"}
];

const BORDER_LOGIC=[
 {regions:["REG-16","REG-15"],type:"mountain-pass",features:["MNT-05","PASS-05","RD-04"],note:"霜角酋邦居最北，高地山脊將其與南側白氈汗國分開，主要往來集中於霜角南口。"},
 {regions:["REG-15","REG-03"],type:"seasonal-corridor",features:["RD-04","RIV-02"],note:"白氈汗國位於聖曜帝國北方；國境依冬夏牧地、白鐘河上游與固定市集帶劃分。"},
 {regions:["REG-15","REG-11"],type:"watershed",features:["MNT-02"],note:"白氈草海東緣受藍脊高地分水嶺限制，牧路與法師領地在山麓交界。"},
 {regions:["REG-13","REG-19"],type:"ridge-frontier",features:["MNT-01","RD-07"],note:"安威爾帝國南界沿冠脊支脈與舊礦道收束；其南側即斷境無主地。"},
 {regions:["REG-19","REG-12"],type:"forest-frontier",features:["MNT-06","PASS-07","RD-07"],note:"斷境位於安威爾與瑟露維亞之間；古林嶺與林緣狹口構成精靈王庭北界。"},
 {regions:["REG-13","REG-18"],type:"mountain-pass",features:["MNT-01","PASS-01","RD-01"],note:"安威爾西北山地與縮小後西境河谷以山口相接，帝國山門控制主要通行。"},
 {regions:["REG-18","REG-01"],type:"river-valley",features:["RIV-01","RD-01"],note:"西境河谷已縮成洛文周邊狹長行政帶，瑟倫河谷直接銜接阿斯戴爾中央王原。"},
 {regions:["REG-03","REG-11"],type:"ridge",features:["MNT-02"],note:"聖曜東北界與藍塔高地以分水嶺和塔區界碑區分。"},
 {regions:["REG-11","REG-14"],type:"highland-steppe",features:["MNT-02","MNT-03"],note:"藍塔高地向東轉為泰爾瓦隆東北草原，兩側以高地脊線與季節市集確認邊界。"},
 {regions:["REG-14","REG-17"],type:"pass",features:["MNT-03","PASS-03","RD-05"],note:"泰爾瓦隆西界受東北山牆約束，百族西關控制鐵旗邊原的主要入口。"},
 {regions:["REG-14","REG-20"],type:"mountain-pass",features:["MNT-03","MNT-04","PASS-04"],note:"泰爾瓦隆南界銜接龍脊火山高地，實際國境由可放牧坡地與少數山口決定。"},
 {regions:["REG-02","REG-17"],type:"checkpoint",features:["RIV-04","PASS-06","RD-05"],note:"赫薩爾河谷缺乏完整天然壁壘，因此東門隘與沿河稅關塑造國境控制線。"},
 {regions:["REG-04","REG-09"],type:"river-corridor",features:["RIV-02","RD-02"],note:"白鐘河下游既是行政分界也是交通主軸，橋梁與渡口形成高密度控制點。"},
 {regions:["REG-05","REG-12"],type:"forest-coast",features:["MNT-06","CST-04"],note:"阿斯戴爾維薩南境與瑟露維亞西南古林在丘陵林線與南岸河口交界。"},
 {regions:["REG-08","REG-10"],type:"maritime-border",features:["CST-05","CST-BT03"],note:"金衡自由島與黑潮群島隔海相望，雙方以航道、燈塔與商約界定海上執法範圍，互不主張對方領土。"}
];

const POLITICAL_NOTES={
 "POL-001":"阿斯戴爾王國主權涵蓋中央王原、維薩南境與縮小後的西境河谷；洛文城為西境行政中樞而非獨立首都。",
 "POL-007":"卡薩維爾與維爾河成員城市構成卡薩維爾自由城盟；卡薩維爾為共同議會所在地，維爾港維持河海交通與成員城自治。",
 "POL-008":"金衡自由都市只控制REG-08金衡自由島；其為獨立貿易自由島，與黑潮群島是平等外國關係。",
 "POL-010":"黑潮群島是獨立主權政治體；三大島、五小島及周圍小型海島共同受潮皇王庭法統與征海大將軍幕府軍政體制統合。",
 "POL-012":"瑟露維亞精靈王庭已移至大陸西南方，以古林、丘陵與南岸作為天然疆界。",
 "POL-013":"安威爾帝國位於大陸西北方，控制主要山廳、礦道與山口；REG-13更深層另有黑月深庭主權。",
 "POL-014":"泰爾瓦隆百族部落位於大陸東北方，疆域依共同獵場、水源、草原與東北山牆形成。",
 "POL-015":"白氈汗國位於霜角酋邦南方、聖曜帝國北方；邊界按季節牧路、水源與市集帶變動。",
 "POL-016":"霜角酋邦位於大陸最北側，南下主要依賴霜角南口。",
 "POL-019":"斷境無主地位於安威爾帝國與瑟露維亞精靈王庭之間，形成無穩定主權的破碎緩衝帶。",
 "POL-020":"地下主權層；與安威爾帝國在REG-13部分深層礦脈存在爭議，不應畫成地表獨立國境。"
};

const ARCHIPELAGO_PROFILES={
 "REG-10":{political_entity_id:"POL-010",major_islands:3,minor_islands:5,surrounding_islets:7,structure:"三大島＋五小島＋周圍小型海島",sovereignty:"independent"}
};

const regionById=id=>(DB.world_regions||[]).find(x=>x?.id===id)||null;
const polityById=id=>(DB.political_entities||[]).find(x=>x?.id===id)||null;
const geomsForPolity=pid=>{
  if(pid==="POL-020")return REGION_GEOMETRY.filter(x=>x.political_entity_id===pid);
  return REGION_GEOMETRY.filter(x=>x.layer==="surface"&&polityIdForGeometry(x)===pid);
};
const geomForPolity=pid=>{
  const p=polityById(pid),all=geomsForPolity(pid);
  return pid==="POL-020"?all[0]:(all.find(x=>x.region_id===p?.core_region_id)||all[0]||null);
};
const regionIdsForPolity=pid=>[...new Set(geomsForPolity(pid).filter(x=>x.layer==="surface").map(x=>x.region_id))];
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
 const own=new Set(regionIdsForPolity(pid)),out=new Set();
 for(const rid of own)for(const n of REGION_ADJACENCY[rid]||[]){
   const np=regionById(n)?.political_entity_id;
   if(np&&np!==pid)out.add(np);
 }
 return [...out];
}
function adjacentNonstateRegions(pid){
 if(!polityById(pid)||pid==="POL-020")return [];
 const own=new Set(regionIdsForPolity(pid)),out=new Set();
 for(const rid of own)for(const n of REGION_ADJACENCY[rid]||[])if(!regionById(n)?.political_entity_id)out.add(n);
 return [...out];
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
 const pidRegionIds=p.id==="POL-020"?["REG-13"]:regionIdsForPolity(p.id);
 p.world_map_profile={
   revision:REV,
   geometry_region_id:rid,
   geometry_region_ids:pidRegionIds,
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
   {id:"subterranean",name:"地下主權",description:"黑月深庭與安威爾西北山地的重疊主權；地下河與礦道仍可後續深化。"}
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
   "CURRENT主權以實際政治整併後的外國界為準；已取消的洛文、維薩林與維爾河舊政體只保留行政／歷史區域，不再繪成國界。",
   "遊牧汗國使用季節性汗庭錨點；草原國境依牧路、季節河與可放牧坡地呈帶狀變動，不建立虛假的永久直線。",
   "無主之地沒有固定首都；道路、補給點與水源的事實控制比名義邊界更重要。",
   "地下主權使用獨立layer，不能與地表疆域面積直接比較。",
   "REG-10黑潮群島屬POL-008金衡自由都市；REG-17鐵旗邊原與REG-20龍脊火山群維持非統一主權區。",
   "地圖固定標示北方；座標原點仍位於西北，畫面上方即北方。"
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
function renderClimateBands(parts){
 for(const z of CLIMATE_BANDS){
   parts.push('<polygon points="'+fmtPoints(z.polygon)+'" fill="hsl('+((Number(z.id.slice(-2))*53)%360)+' 40% 42% / '+z.opacity+')" stroke="rgba(220,230,222,.18)" stroke-width="2"><title>'+esc(z.name+"｜"+z.kind)+'</title></polygon>');
   const p=centroid(z.polygon);
   parts.push('<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" fill="#d8dfd9" font-size="18" font-weight="700" pointer-events="none">'+esc(z.name)+'</text>');
 }
}
function renderPhysicalFeatures(parts,mode){
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
function renderNorthMarker(parts){
 parts.push('<g aria-label="北方" pointer-events="none"><path d="M1680 150 L1680 72" stroke="#f0eee6" stroke-width="6" stroke-linecap="round"></path><polygon points="1680,48 1665,82 1695,82" fill="#f0eee6"></polygon><text x="1680" y="182" text-anchor="middle" fill="#f0eee6" font-size="22" font-weight="900">北 N</text></g>');
}
function renderSurfaceSvg(mode="surface"){
 const parts=['<rect width="'+W+'" height="'+H+'" fill="#0d1c22"></rect>'];
 const physicalOnly=mode==="physical"||mode==="climate";
 if(mode==="climate")renderClimateBands(parts);
 for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
   const region=regionById(g.region_id),pid=polityIdForGeometry(g),p=polityById(pid);
   const fill=pid?colorForPolity(pid):"#2b3130";
   const dash=g.nonstate?"10 7":"";
   const click=pid?"openWorldMapPolityTerritory('"+pid+"')":"openWorldMapNonStateRegion('"+g.region_id+"')";
   parts.push('<polygon points="'+fmtPoints(g.points)+'" fill="'+fill+'" fill-opacity="'+(physicalOnly?".28":".72")+'" stroke="'+(physicalOnly?"#66736d":"#91a19a")+'" stroke-width="'+(physicalOnly?2:4)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' onclick="'+click+'" style="cursor:pointer"><title>'+esc((p?.name||region?.name||g.region_id)+(g.nonstate?"（非統一主權區）":""))+'</title></polygon>');
 }
 renderPhysicalFeatures(parts,mode);
 renderNorthMarker(parts);
 for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
   const region=regionById(g.region_id),pid=polityIdForGeometry(g),lp=g.label||centroid(g.points);
   parts.push('<text x="'+lp[0]+'" y="'+lp[1]+'" text-anchor="middle" fill="'+(physicalOnly?"#e7e6df":"#c9d0cc")+'" font-size="'+(physicalOnly?18:16)+'" font-weight="700" pointer-events="none">'+esc(region?.name||g.region_id)+'</text>');
 }
 if(!physicalOnly){
   const grouped=new Map();
   for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
     const pid=polityIdForGeometry(g);if(!pid)continue;
     if(!grouped.has(pid))grouped.set(pid,[]);
     grouped.get(pid).push(...g.points);
   }
   for(const [pid,points] of grouped){
     const p=polityById(pid);if(!p)continue;
     const lp=centroid(points);
     parts.push('<text x="'+lp[0]+'" y="'+(lp[1]+24)+'" text-anchor="middle" fill="#fff4d0" font-size="'+(points.length>30?25:22)+'" font-weight="900" pointer-events="none">'+esc(p.name)+'</text>');
   }
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
 const bpts=base?base.points.map(([x,y])=>[(x-60)*1.8+100,(y-80)*1.8+80]):[];
 const gpts=g.points.map(([x,y])=>[(x-60)*1.8+100,(y-80)*1.8+80]);
 const cx=(c.x-60)*1.8+100,cy=(c.y-80)*1.8+80;
 return '<div style="overflow:auto;border:1px solid #36423d;border-radius:14px;background:#111714;padding:8px"><svg viewBox="0 0 1100 760" role="img" aria-label="安威爾西北山地地下主權示意" style="width:100%;min-width:680px;height:auto;display:block">'+
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
 if(mode==="subterranean")return '地表虛線＝安威爾西北山地投影；金線＝地下主權。';
 const climate=mode==="climate"?'　半透明色帶＝主要氣候帶。':'';
 return '<b style="color:#ffe09a">●</b> 固定首都　<b style="color:#ffe09a">◆</b> 季節性統治中樞　<span style="color:#a79b83">▲</span> 山脈　<span style="color:#79b5cf">━</span> 河川／湖泊　<span style="color:#d1b36a">┄</span> 主要道路　<b style="color:#f0c96c">○</b> 國境關隘　政治虛線＝非統一主權區。'+climate;
}
function openWorldMapAtlas(layer){
 layer=["surface","physical","climate","subterranean"].includes(layer)?layer:"surface";
 const title=layer==="surface"?"政治＋地形":layer==="physical"?"自然地理":layer==="climate"?"氣候帶":"地下主權";
 const body='<div class="card small"><b>世界地圖・地理骨架 1.3</b><br>政治版圖已依CURRENT-1.90.0重推：安威爾西北、泰爾瓦隆東北、霜角最北、白氈位於霜角與聖曜之間、精靈王庭西南、斷境置於安威爾與精靈王庭之間；西境河谷縮小，金衡與黑潮分別為獨立島國／自由島，地圖右上固定標示北方。</div>'+
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
 const territoryRegionIds=pid==="POL-020"?["REG-13"]:regionIdsForPolity(pid);
 const territoryNames=territoryRegionIds.map(x=>regionById(x)?.name).filter(Boolean);
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
   '<div class="card small"><b>疆域核心</b>：'+esc(r?.name||p.core_region_id)+'<br><b>所轄大區</b>：'+esc(territoryNames.join("、")||r?.name||"—")+'<br><b>首都／統治中樞</b>：'+esc(cap)+'<br><b>相鄰政治體</b>：'+esc(ad.join("、")||"無直接政治邊界")+(ns.length?'<br><b>相鄰非主權區</b>：'+esc(ns.join("、")):"")+(note?'<br><b>主權說明</b>：'+esc(note):"")+'</div>'+
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
 if(polities.length!==16)issues.push("政治體數量偏離CURRENT基準16："+polities.length);
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
   if(c.type!=="none"&&!geomsForPolity(p.id).some(x=>pointInPolygon(c.x,c.y,x.points)))issues.push("首都座標不在自身疆域："+p.id);
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
 for(const id of ["POL-005","POL-006","POL-018"])if(polityById(id))issues.push("已整併政治體仍出現在地圖："+id);
 if(regionById("REG-10")?.political_entity_id!=="POL-010")issues.push("黑潮群島未建立獨立POL-010主權");
 const bt=REGION_GEOMETRY.filter(x=>x.layer==="surface"&&x.region_id==="REG-10");
 if(bt.filter(x=>x.island_class==="major").length!==3)issues.push("黑潮群島大島數量不是3");
 if(bt.filter(x=>x.island_class==="minor").length!==5)issues.push("黑潮群島小島數量不是5");
 if(bt.filter(x=>x.island_class==="islet").length<5)issues.push("黑潮群島周圍小型海島不足");
 if(REGION_GEOMETRY.filter(x=>x.layer==="surface"&&x.region_id==="REG-08").length!==1)issues.push("金衡自由島不應與黑潮合併幾何");
 const c16=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-16")?.points||[]),c15=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-15")?.points||[]),c03=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-03")?.points||[]),c13=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-13")?.points||[]),c14=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-14")?.points||[]),c12=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-12")?.points||[]),c19=centroid(REGION_GEOMETRY.find(x=>x.layer==="surface"&&x.region_id==="REG-19")?.points||[]);
 if(!(c16[1]<c15[1]&&c15[1]<c03[1]))issues.push("霜角／白氈／聖曜南北順序錯誤");
 if(c13[0]>500||c13[1]>450)issues.push("安威爾帝國未位於大陸西北方");
 if(c14[0]<1250||c14[1]>500)issues.push("泰爾瓦隆百族部落未位於大陸東北方");
 if(c12[0]>500||c12[1]<650)issues.push("瑟露維亞精靈王庭未位於大陸西南方");
 if(!(c19[1]>c13[1]&&c19[1]<c12[1]))issues.push("斷境無主地未置於安威爾與精靈王庭之間");
 if(!REGION_GEOMETRY.some(x=>x.political_entity_id==="POL-020"&&x.layer==="subterranean"))issues.push("黑月深庭地下主權層遺失");
 for(const rid of ["REG-17","REG-20"])if(regionById(rid)?.political_entity_id)issues.push("非統一主權區被誤升格："+rid);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{
   political_entities:polities.length,
   surface_regions:new Set(REGION_GEOMETRY.filter(x=>x.layer==="surface").map(x=>x.region_id)).size,
   surface_polygons:REGION_GEOMETRY.filter(x=>x.layer==="surface").length,
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