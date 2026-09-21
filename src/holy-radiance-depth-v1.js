/* 群陸旅誌：聖曜帝國完整區域深化 CURRENT-2.02.0
 * HOLY-RADIANCE-DEPTH-1.0
 * POL-003 / REG-03：帝冠與跨境加冕教權、諸侯封邑、城鎮、野外、地下城、怪物、NPC、地方經濟與活世界鉤子。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.02.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.02.0";
const REV="HOLY-RADIANCE-DEPTH-1.0";
const POLITY_ID="POL-003",REGION_ID="REG-03",CULTURE_ID="CUL-003",REALM_ID="RMAP-POL-003";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(k){DB[k]=Array.isArray(DB[k])?DB[k]:[];return DB[k]}
function upsert(k,v,idKey="id"){const a=arr(k),i=a.findIndex(x=>x?.[idKey]===v[idKey]);if(i>=0)a[i]=v;else a.push(v);return v}
function row(k,id,idKey="id"){return (DB[k]||[]).find(x=>x?.[idKey]===id)||null}
function loc(id){return row("locations",id)}
function addLink(a,b,h){const x=loc(a);if(!x||!loc(b))return;x.links=Array.isArray(x.links)?x.links:[];const old=x.links.find(e=>e?.to===b);if(old)old.hours=h;else x.links.push({to:b,hours:h})}
function twoWay(a,b,h){addLink(a,b,h);addLink(b,a,h)}
function economy(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return{prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}
function town(x){
 const base=clone(loc(x.id)||{});
 return Object.assign(base,{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:"聖曜帝國",
  description:x.description,facilities:uniq([...(base.facilities||[]),...(x.facilities||[])]),links:Array.isArray(base.links)?base.links:[],
  safety_score:x.safety??89,safety_label:(x.safety??89)>=93?"安穩":(x.safety??89)>=86?"穩定":"警戒",risk:Math.max(2,100-(x.safety??89)),
  world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,
  history_scope:"聖曜帝國／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:REALM_ID,
  local_authority:clone(x.authority),local_economy:clone(x.economy),holy_radiance_zone_id:x.zoneId});
}
function field(x){
 const base=clone(loc(x.id)||{}),ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{};
 const ep=clone(base.encounter_profile||ref.encounter_profile||{});
 Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,
  allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"open",preferred_monster_ids:[...(x.preferred||[])]});
 return Object.assign(base,{id:x.id,name:x.name,kind:x.kind||base.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size,region:"聖曜帝國",description:x.description,
  links:Array.isArray(base.links)?base.links:[],risk:x.risk??20,safety_score:x.safety??Math.max(20,100-(x.risk??20)),safety_label:(x.risk??20)<=15?"安穩":(x.risk??20)<=25?"普通":(x.risk??20)<=35?"警戒":"危險",
  world_region_id:REGION_ID,region_id:REGION_ID,political_entity_id:POLITY_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID,province_region_id:x.province,settlement_region_id:x.smap,
  realm_region_map_id:REALM_ID,holy_radiance_zone_id:x.zoneId,tags:uniq([...(base.tags||[]),...(x.tags||[])]),gather:uniq([...(base.gather||[]),...(x.gather||[])]),
  mining:uniq([...(base.mining||[]),...(x.mining||[])]),woodcut:uniq([...(base.woodcut||[]),...(x.woodcut||[])]),fish:uniq([...(base.fish||[]),...(x.fish||[])]),hunt:uniq([...(base.hunt||[]),...(x.hunt||[])]),
  explore:x.explore||base.explore||[],encounter_profile:ep,resource_capacity:clone(x.resourceCapacity||base.resource_capacity||{forage:16,hunt:8,ore:5,water:8}),resource_regen_hours:x.regen??base.resource_regen_hours??48,hunt_requires_battle:true});
}
function dungeon(x){return field({...x,kind:"dungeon",zoneClass:"dungeon",space:x.space||"standard",allowMagical:true})}

const ZONES=[
 {id:"SUN-Z-01",name:"聖冠直轄領",tier:"B",province:"PROV-SUN-01",smap:"SMAP-SUN-01",seat:"L-SUN-CROWNCITY",role:"皇宮、御前議政、帝國法院、中央檔案、外交與加冕儀典中樞"},
 {id:"SUN-Z-02",name:"北鐘邊侯領",tier:"C",province:"PROV-SUN-02",smap:"SMAP-SUN-02",seat:"L-SUN-NORTHBELL",role:"白氈南界、邊境互市、騎巡與寒風草原防務"},
 {id:"SUN-Z-03",name:"曜穗王領",tier:"C",province:"PROV-SUN-03",smap:"SMAP-SUN-03",seat:"L-SUN-SUNWHEAT",role:"帝國北中部糧倉、羊毛、蜂蠟、農牧契約與秋收貢賦"},
 {id:"SUN-Z-04",name:"西冠大道領",tier:"C",province:"PROV-SUN-04",smap:"SMAP-SUN-04",seat:"L-SUN-WESTCROWN",role:"西向商路、驛站、木材、關稅與阿斯戴爾方向交通"},
 {id:"SUN-Z-05",name:"藍脊西麓侯領",tier:"C",province:"PROV-SUN-05",smap:"SMAP-SUN-05",seat:"L-SUN-BLUEPASS",role:"藍塔邊界、礦石、術式事故隔離與山口通行"},
 {id:"SUN-Z-06",name:"赫薩爾分水領",tier:"C",province:"PROV-SUN-06",smap:"SMAP-SUN-06",seat:"L-SUN-EASTFORD",role:"東南分水嶺、河渡、牲畜、凡雷克方向商路與邊界稅關"},
 {id:"SUN-Z-07",name:"白鐘修院帶",tier:"C",province:"PROV-SUN-07",smap:"SMAP-SUN-07",seat:"L-SUN-ABBEY",role:"修院、醫療、抄寫、朝聖路與晨律教國往來"},
 {id:"SUN-Z-08",name:"諸侯城堡帶",tier:"B",province:"PROV-SUN-08",smap:"SMAP-SUN-08",seat:"L-SUN-PRINCEHOLD",role:"大公與伯爵封邑、盟議會、城堡群、地方誓約法與帝國議會前置"}
];

const TOWNS=[
 {id:"L-SUN-CROWNCITY",name:"聖冠城",zoneId:"SUN-Z-01",zone:"聖冠直轄領",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"B",size:"帝都／超大型城",safety:96,role:"聖曜帝國首都、聖冠皇宮、御前議政院與中央法院所在地",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic","mageguild"],authority:{title:"聖冠皇帝／帝國宰相府",tier:"AUTH-7"},economy:economy(92,"極繁榮",["帝國行政","諸侯朝會","高階工坊","跨境使節","加冕與朝聖服務"],["高階軍備與聖物受許可","人口與儀典季推高物價"],1.10,1.23,1.35,1.31),description:"建於高丘與白石臺地上的帝都。皇宮、議政院、誓約法院、中央檔案院與大聖堂共同構成政治核心；加冕儀式需要跨境晨律最高牧首或其合法代表，但帝國日常行政不隸屬晨律教國。"},
 {id:"L-SUN-CROWNGATE",name:"金冠門城",zoneId:"SUN-Z-01",zone:"聖冠直轄領",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"C",size:"帝都外環城",safety:93,role:"帝都北門、驛站、商隊分流與工匠衛星城",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"金冠門城伯",tier:"AUTH-4"},economy:economy(82,"繁榮",["帝都外溢需求","驛運","皮革","馬具","工匠聚落"],["朝會期道路壅塞","高階貨品優先供帝都"],1.05,1.16,1.19,1.18),description:"帝都最繁忙的陸路門城，多數長途商隊在此拆車、換馬、繳納入城費並接受貨物檢查。"},
 {id:"L-SUN-NORTHBELL",name:"北鐘關",zoneId:"SUN-Z-02",zone:"北鐘邊侯領",province:"PROV-SUN-02",smap:"SMAP-SUN-02",tier:"C",size:"邊侯堡城",safety:91,role:"白氈南界主關、互市、騎巡與邊侯行政",facilities:["inn","general","guild","blacksmith","tailor","clinic","church"],authority:{title:"北鐘邊侯",tier:"AUTH-5"},economy:economy(70,"穩定",["馬匹互市","羊毛","邊境護送","皮革","穀物交換"],["寒潮封路","互市受兩國通行政策影響"],1.04,1.05,1.09,1.04),description:"面向白氈草海的邊關堡城。城外設有季節互市與牲畜檢疫場，守軍主要維持道路與邊界秩序，不把遊牧商旅視為預設敵人。"},
 {id:"L-SUN-SUNWHEAT",name:"曜穗城",zoneId:"SUN-Z-03",zone:"曜穗王領",province:"PROV-SUN-03",smap:"SMAP-SUN-03",tier:"C",size:"大型農商城",safety:93,role:"糧倉、磨坊、蜂蠟、羊毛與王領農政中心",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"曜穗大公／王領糧賦監",tier:"AUTH-5"},economy:economy(84,"繁榮",["穀物","蜂蠟","羊毛","啤酒","磨坊"],["歉收與霜害","秋收期倉儲壓力"],.97,1.24,1.22,1.21),description:"丘田與磨坊包圍的農業大城，秋收後大量糧車由此送往帝都、修院與北鐘邊關。"},
 {id:"L-SUN-VINEHILL",name:"葡陽鎮",zoneId:"SUN-Z-03",zone:"曜穗王領",province:"PROV-SUN-03",smap:"SMAP-SUN-03",tier:"D",size:"丘陵農鎮",safety:92,role:"果園、蜂房、葡萄與地方市集",facilities:["inn","general","guild","tailor","clinic"],authority:{title:"葡陽鎮代官",tier:"AUTH-3"},economy:economy(65,"穩定",["果品","蜂蜜","蜂蠟","葡萄酒","藥草"],["霜害","道路運力有限"],.99,1.08,1.04,1.05),description:"向陽丘陵上的農鎮，以果園、蜂房與小型葡萄園著名，是帝國中層農村經濟的代表。"},
 {id:"L-SUN-WESTCROWN",name:"西冠堡城",zoneId:"SUN-Z-04",zone:"西冠大道領",province:"PROV-SUN-04",smap:"SMAP-SUN-04",tier:"C",size:"大道堡城",safety:90,role:"西冠大道、驛政、木材與西向關稅中心",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"西冠大道伯",tier:"AUTH-5"},economy:economy(76,"興盛",["商隊","驛馬","銀橡木","關稅","修車工坊"],["道路泥濘季","西向局勢影響流量"],1.02,1.13,1.15,1.14),description:"西冠大道穿越丘陵的最大堡城，城牆之外是驛站、馬廄與木材堆場；帝國對西方的多數陸路文書在此核驗。"},
 {id:"L-SUN-BLUEPASS",name:"藍脊西關",zoneId:"SUN-Z-05",zone:"藍脊西麓侯領",province:"PROV-SUN-05",smap:"SMAP-SUN-05",tier:"C",size:"山麓關城",safety:89,role:"藍塔邊界、礦材、術式事故隔離與通行許可",facilities:["inn","general","guild","blacksmith","alchemy","clinic","mageguild"],authority:{title:"藍脊西侯／術式監察官",tier:"AUTH-5"},economy:economy(72,"穩定",["鐵晶","導晶砂","藥草","學術商旅","山口服務"],["高階術材配額","山口風雪與術式封鎖"],1.04,1.04,1.11,1.07),description:"帝國與藍塔魔導王國相接的山麓關城。邊界事故通常由雙方術式監察官與地方官共同處理，避免把研究事故直接升級成外交衝突。"},
 {id:"L-SUN-EASTFORD",name:"聖槍河門",zoneId:"SUN-Z-06",zone:"赫薩爾分水領",province:"PROV-SUN-06",smap:"SMAP-SUN-06",tier:"C",size:"河渡堡城",safety:90,role:"分水嶺河渡、東南商路、牲畜與凡雷克方向稅關",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"聖槍河門伯",tier:"AUTH-4"},economy:economy(74,"興盛",["河渡","牲畜","鹽貨","皮革","東南商旅"],["洪水季","邊界關稅變動"],1.01,1.11,1.13,1.12),description:"跨越分水支流的橋港堡城，是聖曜與凡雷克商人常用的轉運點，也負責大量牲畜檢疫。"},
 {id:"L-SUN-DAWNFORD",name:"曉渡鎮",zoneId:"SUN-Z-06",zone:"赫薩爾分水領",province:"PROV-SUN-06",smap:"SMAP-SUN-06",tier:"D",size:"河谷市鎮",safety:91,role:"磨坊、渡運、牧草與地方農產",facilities:["inn","general","guild","clinic"],authority:{title:"曉渡裁判官",tier:"AUTH-3"},economy:economy(61,"穩定",["磨坊","牧草","河魚","渡運"],["洪水","高階商品稀少"],.99,1.05,1.02,1.03),description:"分水支流旁的平民市鎮，以磨坊、渡船與牧草交易維生，地方任務偏向水利、獸害與商旅護送。"},
 {id:"L-SUN-ABBEY",name:"白鐘修院城",zoneId:"SUN-Z-07",zone:"白鐘修院帶",province:"PROV-SUN-07",smap:"SMAP-SUN-07",tier:"C",size:"修院城市",safety:95,role:"帝國修院、醫療、抄寫、朝聖與跨境教務協調中心",facilities:["inn","general","guild","alchemy","church","clinic","mageguild"],authority:{title:"白鐘主教伯／修院議會",tier:"AUTH-5"},economy:economy(78,"繁榮",["朝聖","抄寫","醫療","藥草","教育"],["教會規章限制部分交易","節期住宿吃緊"],1.03,1.12,1.16,1.13),description:"由大型修院、醫療院、抄經院與朝聖市集形成的城市。它屬聖曜帝國主權，教務則與晨律教國及晨律神系教會保持制度聯繫。"},
 {id:"L-SUN-PRINCEHOLD",name:"誓冠諸侯城",zoneId:"SUN-Z-08",zone:"諸侯城堡帶",province:"PROV-SUN-08",smap:"SMAP-SUN-08",tier:"B",size:"諸侯會議城／大型堡城",safety:94,role:"諸侯盟議、封邑代表、誓約仲裁與大型封臣會議",facilities:["inn","general","guild","blacksmith","tailor","alchemy","church","clinic"],authority:{title:"諸侯盟議長／城守",tier:"AUTH-6"},economy:economy(86,"繁榮",["盟議會期","高階封臣消費","馬匹","武具","法律服務"],["會期波動","軍械與聖物受身份限制"],1.08,1.17,1.25,1.22),description:"多條諸侯道路交會的城堡城市。帝國諸侯在此交換軍役、稅額、繼承與邊界議案；盟議可以牽制帝室，但不構成另一個獨立國家。"}
];

const FIELDS=[
 {id:"L-SUN-CROWNFIELDS",name:"聖冠御田",zoneId:"SUN-Z-01",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"E",size:"御田丘野",tags:["plains"],template:"L-LOWFIELD",risk:13,gather:["SUN-MAT-001","SUN-MAT-002"],hunt:["SUN-MAT-006"],preferred:["MON-SUN-001","MON-SUN-002","MON-SUN-004"],description:"供應帝都部分糧食與儀典用麥的直轄田野，巡田官以輪作、灌溉與獸害紀錄管理產量。"},
 {id:"L-SUN-HOLYOAK",name:"聖橡獵林",zoneId:"SUN-Z-01",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"D",size:"御用林地",tags:["forest"],template:"L-WOOD",risk:23,woodcut:["SUN-MAT-005"],hunt:["SUN-MAT-007"],preferred:["MON-SUN-006","MON-SUN-015","MON-SUN-019"],description:"帝都近郊受配額管理的橡林，部分林區供皇家狩獵與木材輪伐，私人不得無限採取。"},
 {id:"L-SUN-NORTHMOOR",name:"北鐘風原",zoneId:"SUN-Z-02",province:"PROV-SUN-02",smap:"SMAP-SUN-02",tier:"D",size:"冷涼草原",tags:["plains"],template:"L-LOWFIELD",risk:25,gather:["SUN-MAT-001"],hunt:["SUN-MAT-006"],preferred:["MON-SUN-005","MON-SUN-011","MON-SUN-016"],description:"北鐘關外的冷涼草原，帝國農牧地與白氈冬牧邊界以界石、河溝與季節協議區分。"},
 {id:"L-SUN-BELLUPLAND",name:"白鐘北岸草澤",zoneId:"SUN-Z-02",province:"PROV-SUN-02",smap:"SMAP-SUN-02",tier:"D",size:"河源草澤",tags:["plains","water","wetland"],template:"L-RIVER",aquatic:true,risk:24,gather:["SUN-MAT-003"],fish:["SUN-MAT-013"],preferred:["MON-SUN-003","MON-SUN-007","MON-SUN-024"],description:"白鐘河上游帝國一側的草澤與蘆岸，春融期水面擴張，渡點與採集地會暫時關閉。"},
 {id:"L-SUN-GOLDGRAIN",name:"金穗丘田",zoneId:"SUN-Z-03",province:"PROV-SUN-03",smap:"SMAP-SUN-03",tier:"E",size:"丘陵農田",tags:["plains"],template:"L-LOWFIELD",risk:14,gather:["SUN-MAT-002","SUN-MAT-004"],hunt:["SUN-MAT-006"],preferred:["MON-SUN-001","MON-SUN-002","MON-SUN-010"],description:"曜穗城外大片輪作田與蜂房帶，農忙季人流密集，野外威脅主要是小型獸害。"},
 {id:"L-SUN-SHEPHERD",name:"牧鐘緩坡",zoneId:"SUN-Z-03",province:"PROV-SUN-03",smap:"SMAP-SUN-03",tier:"E",size:"牧羊丘坡",tags:["plains","hill"],template:"L-HILL",risk:17,gather:["SUN-MAT-001"],hunt:["SUN-MAT-006"],preferred:["MON-SUN-005","MON-SUN-012"],description:"羊群與牧草輪換使用的丘坡，狼害季會臨時增加公會巡護委託。"},
 {id:"L-SUN-WESTROAD",name:"西冠古道",zoneId:"SUN-Z-04",province:"PROV-SUN-04",smap:"SMAP-SUN-04",tier:"D",size:"丘陵大道",tags:["road","hill"],template:"L-HILL",risk:22,gather:["SUN-MAT-010"],preferred:["MON-SUN-009","MON-SUN-012","MON-SUN-017"],description:"西冠大道旁的舊石路與驛站遺址，暴雨與車轍會周期性破壞路面。"},
 {id:"L-SUN-SILVERWOOD",name:"銀橡林",zoneId:"SUN-Z-04",province:"PROV-SUN-04",smap:"SMAP-SUN-04",tier:"D",size:"混合林",tags:["forest"],template:"L-WOOD",risk:26,woodcut:["SUN-MAT-005"],gather:[],hunt:["SUN-MAT-007"],preferred:["MON-SUN-006","MON-SUN-015","MON-SUN-019"],description:"銀灰樹皮的硬木林，樹脂與硬木是重要商品；林務官按年度區塊輪伐。"},
 {id:"L-SUN-BLUERIDGE",name:"藍脊西坡",zoneId:"SUN-Z-05",province:"PROV-SUN-05",smap:"SMAP-SUN-05",tier:"C",size:"高地石坡",tags:["hill","mountain"],template:"L-HILL",risk:33,mining:["SUN-MAT-009","SUN-MAT-017"],preferred:["MON-SUN-013","MON-SUN-020","MON-SUN-026"],description:"靠近藍脊分水嶺的石坡與礦脈，導晶類材料受嚴格配額，術式事故時整片區域會封鎖。"},
 {id:"L-SUN-STARSPRING",name:"星泉谷",zoneId:"SUN-Z-05",province:"PROV-SUN-05",smap:"SMAP-SUN-05",tier:"D",size:"山泉谷地",tags:["water","hill"],template:"L-RIVER",aquatic:true,risk:25,gather:["SUN-MAT-012"],mining:["SUN-MAT-008"],preferred:["MON-SUN-014","MON-SUN-013"],description:"山泉與細砂沉積形成的谷地，煉金與術式工匠會合法採取少量藍砂。"},
 {id:"L-SUN-DIVIDEPLATEAU",name:"分水台地",zoneId:"SUN-Z-06",province:"PROV-SUN-06",smap:"SMAP-SUN-06",tier:"C",size:"乾涼台地",tags:["plains","hill"],template:"L-HILL",risk:31,gather:["SUN-MAT-010"],hunt:["SUN-MAT-007"],preferred:["MON-SUN-016","MON-SUN-021"],description:"聖曜與凡雷克方向水系分界的高台，商路之外仍有大片牧地與風化石區。"},
 {id:"L-SUN-REDCLIFF",name:"赤崖牧場",zoneId:"SUN-Z-06",province:"PROV-SUN-06",smap:"SMAP-SUN-06",tier:"D",size:"紅岩牧坡",tags:["hill"],template:"L-HILL",risk:24,mining:["SUN-MAT-010","SUN-MAT-011"],hunt:["SUN-MAT-006"],preferred:["MON-SUN-012","MON-SUN-013"],description:"紅色岩層與草坡交錯的公用牧場，燧石可少量採集，但大型採石需地方許可。"},
 {id:"L-SUN-PILGRIMROAD",name:"白祈巡禮道",zoneId:"SUN-Z-07",province:"PROV-SUN-07",smap:"SMAP-SUN-07",tier:"E",size:"巡禮丘道",tags:["road","plains"],template:"L-LOWFIELD",risk:16,gather:["SUN-MAT-001","SUN-MAT-012"],preferred:["MON-SUN-004","MON-SUN-008"],description:"連接帝國修院、路旁小堂與南方教國方向的巡禮路，救濟站與路標維護良好。"},
 {id:"L-SUN-ABBEYORCHARD",name:"修院果園丘",zoneId:"SUN-Z-07",province:"PROV-SUN-07",smap:"SMAP-SUN-07",tier:"E",size:"果園與藥圃",tags:["plains","hill"],template:"L-LOWFIELD",risk:12,gather:["SUN-MAT-004","SUN-MAT-012"],preferred:["MON-SUN-004","MON-SUN-010"],description:"修院共同管理的果園、蜂房與藥圃，產出受季節與勞力限制，不是無限採集點。"},
 {id:"L-SUN-PRINCEWOOD",name:"諸侯松林",zoneId:"SUN-Z-08",province:"PROV-SUN-08",smap:"SMAP-SUN-08",tier:"C",size:"封邑林地",tags:["forest","hill"],template:"L-WOOD",risk:32,woodcut:["SUN-MAT-005"],gather:["SUN-MAT-016"],hunt:["SUN-MAT-007"],preferred:["MON-SUN-015","MON-SUN-019","MON-SUN-021"],description:"多個封邑交界的高大松橡林，獵權、伐木權與道路權常需要以誓約文書核對。"},
 {id:"L-SUN-BANNERFIELD",name:"誓旗丘地",zoneId:"SUN-Z-08",province:"PROV-SUN-08",smap:"SMAP-SUN-08",tier:"D",size:"會盟丘原",tags:["plains","hill"],template:"L-HILL",risk:27,gather:["SUN-MAT-014"],preferred:["MON-SUN-016","MON-SUN-018"],description:"歷代諸侯集結、閱兵與重申盟誓的丘陵地，散布大量界石、舊營地與廢棄旗臺。"}
];

const DUNGEONS=[
 {id:"D-SUN-CROWNTOMB",name:"初代聖冠地下墓",zoneId:"SUN-Z-01",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"B",size:"大型皇室墓廊",template:"D-AQUEDUCT",risk:58,archetype:"royal_tomb",gather:["SUN-MAT-018"],preferred:["MON-SUN-022","MON-SUN-025"],description:"帝都地下最古老的皇室墓廊之一，外層受皇家檔案院管理，深層只對具B級前置與帝冠許可的隊伍開放。"},
 {id:"D-SUN-OLDCITADEL",name:"斷冠古堡下層",zoneId:"SUN-Z-01",province:"PROV-SUN-01",smap:"SMAP-SUN-01",tier:"C",size:"古堡地下區",template:"D-AQUEDUCT",risk:39,archetype:"fortress_basement",gather:["SUN-MAT-014"],preferred:["MON-SUN-017","MON-SUN-021"],description:"帝國早期內戰留下的古堡地下層，現由城市守備與公會合作分段清理。"},
 {id:"D-SUN-NORTHWATCH",name:"北鐘舊烽燧",zoneId:"SUN-Z-02",province:"PROV-SUN-02",smap:"SMAP-SUN-02",tier:"D",size:"廢棄烽堡",template:"D-AQUEDUCT",risk:31,archetype:"fortress_ruin",gather:["SUN-MAT-010"],preferred:["MON-SUN-011","MON-SUN-017"],description:"舊邊界線留下的烽堡與地窖，曾用於存草料、箭矢與冬季信號油。"},
 {id:"D-SUN-TITHECELLAR",name:"王領舊什一倉",zoneId:"SUN-Z-03",province:"PROV-SUN-03",smap:"SMAP-SUN-03",tier:"D",size:"地下糧倉群",template:"D-AQUEDUCT",risk:29,archetype:"artificial_cellar",gather:["SUN-MAT-002"],preferred:["MON-SUN-008","MON-SUN-018"],description:"停用的石砌糧窖群，舊稅冊與倉道仍可見，鼠害、甲蟲與坍塌是主要威脅。"},
 {id:"D-SUN-WESTCRYPT",name:"西冠誓約地窟",zoneId:"SUN-Z-04",province:"PROV-SUN-04",smap:"SMAP-SUN-04",tier:"C",size:"誓約石窟",template:"D-AQUEDUCT",risk:38,archetype:"ritual_ruin",gather:["SUN-MAT-014"],preferred:["MON-SUN-017","MON-SUN-021"],description:"早期西方諸侯宣誓與存放契約副本的地窟，部分石門因地震變形而封閉。"},
 {id:"D-SUN-BLUESEAL",name:"西脊封印塔基",zoneId:"SUN-Z-05",province:"PROV-SUN-05",smap:"SMAP-SUN-05",tier:"B",size:"受控術式遺構",template:"D-AQUEDUCT",risk:61,archetype:"arcane_ruin",gather:["SUN-MAT-017"],preferred:["MON-SUN-020","MON-SUN-026"],description:"藍脊西側一座停用的封印塔基，保留跨境協議下的監測封條；只有取得雙方術式許可的B級隊伍能進入核心層。"},
 {id:"D-SUN-WATERVAULT",name:"星泉古渠",zoneId:"SUN-Z-05",province:"PROV-SUN-05",smap:"SMAP-SUN-05",tier:"C",size:"地下引水道",template:"D-AQUEDUCT",aquatic:true,risk:35,archetype:"waterway_ruin",gather:["SUN-MAT-008"],fish:["SUN-MAT-013"],preferred:["MON-SUN-014","MON-SUN-024"],description:"山泉舊引水道與蓄水室，部分通道被藍砂沉積與水生魔物占據。"},
 {id:"D-SUN-BELLFOUNDRY",name:"廢鑄鐘院",zoneId:"SUN-Z-06",province:"PROV-SUN-06",smap:"SMAP-SUN-06",tier:"C",size:"地下鑄造遺構",template:"D-AQUEDUCT",risk:37,archetype:"workshop_ruin",gather:["SUN-MAT-015"],preferred:["MON-SUN-022"],description:"曾為東部教堂鑄鐘的大型工坊，舊熔爐、銅料與機械搬運傀儡仍留在地下。"},
 {id:"D-SUN-ABBEYVAULT",name:"修院封存書庫",zoneId:"SUN-Z-07",province:"PROV-SUN-07",smap:"SMAP-SUN-07",tier:"C",size:"地下檔案書庫",template:"D-AQUEDUCT",risk:34,archetype:"archive_vault",gather:["SUN-MAT-016"],preferred:["MON-SUN-023"],description:"白鐘修院下方的舊檔案層，因潮氣、書蠹與失效守頁傀而封閉，進入需要修院書記院許可。"},
 {id:"D-SUN-OATHHALL",name:"諸侯盟誓舊廳",zoneId:"SUN-Z-08",province:"PROV-SUN-08",smap:"SMAP-SUN-08",tier:"C",size:"地下會盟廳",template:"D-AQUEDUCT",risk:41,archetype:"political_ruin",gather:["SUN-MAT-014","SUN-MAT-015"],preferred:["MON-SUN-021","MON-SUN-022"],description:"現諸侯城建立前使用的地下盟誓廳，牆上保留已失效的封邑界線與軍役條款，是政治史與契約任務的重要地點。"}
];

for(const x of TOWNS)upsert("locations",town(x));
for(const x of FIELDS)upsert("locations",field(x));
for(const x of DUNGEONS)upsert("locations",dungeon(x));

const EDGES=[
 ["L-SUN-CROWNCITY","L-SUN-CROWNGATE",1.1],["L-SUN-CROWNCITY","L-SUN-NORTHBELL",7.5],["L-SUN-CROWNCITY","L-SUN-SUNWHEAT",5],["L-SUN-CROWNCITY","L-SUN-WESTCROWN",6],["L-SUN-CROWNCITY","L-SUN-BLUEPASS",7],["L-SUN-CROWNCITY","L-SUN-EASTFORD",7.5],["L-SUN-CROWNCITY","L-SUN-ABBEY",5.5],["L-SUN-CROWNCITY","L-SUN-PRINCEHOLD",6],
 ["L-SUN-CROWNGATE","L-SUN-CROWNFIELDS",1],["L-SUN-CROWNCITY","L-SUN-HOLYOAK",1.8],["L-SUN-CROWNCITY","D-SUN-CROWNTOMB",1],["L-SUN-CROWNGATE","D-SUN-OLDCITADEL",1.6],
 ["L-SUN-NORTHBELL","L-SUN-NORTHMOOR",1.2],["L-SUN-NORTHBELL","L-SUN-BELLUPLAND",1.8],["L-SUN-NORTHMOOR","D-SUN-NORTHWATCH",1.5],
 ["L-SUN-SUNWHEAT","L-SUN-VINEHILL",2],["L-SUN-SUNWHEAT","L-SUN-GOLDGRAIN",1],["L-SUN-VINEHILL","L-SUN-SHEPHERD",1.2],["L-SUN-GOLDGRAIN","D-SUN-TITHECELLAR",1.4],
 ["L-SUN-WESTCROWN","L-SUN-WESTROAD",1],["L-SUN-WESTCROWN","L-SUN-SILVERWOOD",1.5],["L-SUN-WESTROAD","D-SUN-WESTCRYPT",1.7],
 ["L-SUN-BLUEPASS","L-SUN-BLUERIDGE",1.2],["L-SUN-BLUEPASS","L-SUN-STARSPRING",1.6],["L-SUN-BLUERIDGE","D-SUN-BLUESEAL",2],["L-SUN-STARSPRING","D-SUN-WATERVAULT",1.4],
 ["L-SUN-EASTFORD","L-SUN-DAWNFORD",1.8],["L-SUN-EASTFORD","L-SUN-DIVIDEPLATEAU",1.3],["L-SUN-DAWNFORD","L-SUN-REDCLIFF",1.1],["L-SUN-REDCLIFF","D-SUN-BELLFOUNDRY",1.5],
 ["L-SUN-ABBEY","L-SUN-PILGRIMROAD",.9],["L-SUN-ABBEY","L-SUN-ABBEYORCHARD",1.1],["L-SUN-ABBEY","D-SUN-ABBEYVAULT",.8],
 ["L-SUN-PRINCEHOLD","L-SUN-PRINCEWOOD",1.4],["L-SUN-PRINCEHOLD","L-SUN-BANNERFIELD",1.1],["L-SUN-BANNERFIELD","D-SUN-OATHHALL",1.4]
];
for(const e of EDGES)twoWay(e[0],e[1],e[2]);
if(loc("L-WF-SOUTHMART"))twoWay("L-SUN-NORTHBELL","L-WF-SOUTHMART",6.5);
if(loc("L-BLT-GATE"))twoWay("L-SUN-BLUEPASS","L-BLT-GATE",8);
if(loc("L-VRK-WESTCROWN"))twoWay("L-SUN-EASTFORD","L-VRK-WESTCROWN",10);

const ITEMS=[
 ["SUN-MAT-001","聖冠止血草","F",.08,8,"聖冠谷地常見止血草，只是配方原料，不直接替代完整藥劑。"],
 ["SUN-MAT-002","日紋麥","F",.16,5,"丘陵田地常見的耐寒麥種。"],
 ["SUN-MAT-003","白鐘蘆纖維","F",.12,7,"白鐘上游蘆草加工出的纖維。"],
 ["SUN-MAT-004","金曜蜂蠟","E",.12,14,"果園蜂房產出的蜂蠟，常用於封蠟、照明與藥膏。"],
 ["SUN-MAT-005","銀橡硬木","E",1.15,20,"西冠林地的硬木，採伐受輪伐配額限制。"],
 ["SUN-MAT-006","北原羊皮","E",.65,17,"北部牧地羊群與合法獵物的皮料。"],
 ["SUN-MAT-007","聖橡獸皮","D",.9,29,"御林與諸侯林中型獸類的耐磨皮料。"],
 ["SUN-MAT-008","星泉藍砂","D",.35,34,"星泉谷沉積的淡藍礦砂，可作低中階術式輔材。"],
 ["SUN-MAT-009","藍脊鐵晶","D",1.05,36,"藍脊西坡含晶鐵礦，採掘量受邊境協議限制。"],
 ["SUN-MAT-010","赤崖燧石","E",.22,11,"西冠與赤崖常見的硬質燧石。"],
 ["SUN-MAT-011","曜金黃鐵","D",.9,33,"帶金色光澤的黃鐵礦，主要作裝飾與一般金工。"],
 ["SUN-MAT-012","修院白芷","E",.08,16,"修院藥圃與山泉谷常見藥草。"],
 ["SUN-MAT-013","白鐘銀鱗","E",.18,16,"白鐘河魚與水獸的銀灰鱗片。"],
 ["SUN-MAT-014","誓約石片","D",.7,25,"舊界碑與會盟遺構中脫落的普通石材碎片；受保護碑文不得任意拆取。"],
 ["SUN-MAT-015","古鐘青銅","D",.95,31,"舊鑄鐘院殘留的青銅料與可回收構件。"],
 ["SUN-MAT-016","聖油樹脂","C",.2,58,"銀橡林與修院合法採集的高品質樹脂，用於封蠟、燈油與宗教工藝。"],
 ["SUN-MAT-017","封印導晶","C",.35,76,"受控術式遺構周邊可回收的導晶碎片，取得需要許可。"],
 ["SUN-MAT-018","聖冠墓璽碎片","B",.5,148,"初代聖冠墓深層守衛或封存器件留下的碎片，只能由受控B級探索取得。"]
].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],value:x[4],description:x[5]}));
const gatherable=new Set([...FIELDS,...DUNGEONS].flatMap(x=>[...(x.gather||[]),...(x.mining||[]),...(x.woodcut||[]),...(x.fish||[]),...(x.hunt||[])]));
for(const x of ITEMS)upsert("items",{...x,kind:"material",type:"素材",catalog_group:"素材",stackable:true,regional_origin_id:REGION_ID,wild_gather_eligible:gatherable.has(x.id)});

function mon(x){
 const drops=[...(x.drops||[])];
 return{id:x.id,name:x.name,tier:x.tier,lore_role:x.role||"一般",category:x.category||"野獸與一般魔物系",habitat:[...x.habitat],habitats:[...x.habitat],
  hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??x.def,accuracy:x.acc,initiative:x.init??10,damage:[...x.damage],primary_element:x.element||null,element:x.element||null,
  xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,
  ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},
  loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:1}))};
}
const MONSTERS=[
 {id:"MON-SUN-001",name:"丘田灰兔",tier:"F",habitat:["L-SUN-CROWNFIELDS","L-SUN-GOLDGRAIN"],hp:25,atk:8,def:4,acc:69,damage:[2,5],scale:"small",drops:["SUN-MAT-006"],near:true,description:"帝國農野常見小型獵物。"},
 {id:"MON-SUN-002",name:"金穗田狐",tier:"F",habitat:["L-SUN-CROWNFIELDS","L-SUN-GOLDGRAIN"],hp:30,atk:9,def:4,acc:72,init:13,damage:[2,6],scale:"small",drops:["SUN-MAT-006"],near:true,description:"捕食田鼠與小鳥的狐狸。"},
 {id:"MON-SUN-003",name:"白鐘蘆蟹",tier:"F",habitat:["L-SUN-BELLUPLAND"],hp:28,atk:8,def:7,acc:64,damage:[2,5],scale:"small",tags:["aquatic"],drops:["SUN-MAT-013"],near:true,description:"白鐘草澤常見甲殼生物。"},
 {id:"MON-SUN-004",name:"果園刺鼬",tier:"F",habitat:["L-SUN-PILGRIMROAD","L-SUN-ABBEYORCHARD"],hp:27,atk:9,def:5,acc:70,damage:[2,6],scale:"small",drops:[],near:true,description:"常在果園石牆與路旁草叢活動。"},
 {id:"MON-SUN-005",name:"北原牧犬群",tier:"E",habitat:["L-SUN-NORTHMOOR","L-SUN-SHEPHERD"],hp:48,atk:16,def:7,acc:74,damage:[5,10],scale:"small",drops:[],near:true,description:"少數失散牧犬形成的小群，對牲畜有威脅。"},
 {id:"MON-SUN-006",name:"聖橡角鹿",tier:"E",habitat:["L-SUN-HOLYOAK","L-SUN-SILVERWOOD"],hp:58,atk:17,def:9,acc:71,damage:[5,11],drops:["SUN-MAT-007"],description:"林地常見中型鹿獸，繁殖季具攻擊性。"},
 {id:"MON-SUN-007",name:"草澤水蜥",tier:"E",habitat:["L-SUN-BELLUPLAND"],hp:53,atk:16,def:10,acc:70,damage:[5,10],element:"水",tags:["aquatic"],drops:["SUN-MAT-013"],description:"棲息蘆澤與淺水地的水蜥。"},
 {id:"MON-SUN-008",name:"修院鐘蛾",tier:"E",habitat:["L-SUN-PILGRIMROAD","D-SUN-TITHECELLAR"],hp:41,atk:13,def:5,acc:73,init:14,damage:[4,8],scale:"small",tags:["invertebrate"],drops:[],near:true,description:"喜歡燈油與乾燥穀粉的大型蛾類。"},
 {id:"MON-SUN-009",name:"古道岩鼠",tier:"E",habitat:["L-SUN-WESTROAD"],hp:44,atk:14,def:6,acc:72,damage:[4,9],scale:"small",drops:[],near:true,description:"舊路基與驛站廢牆中的大型岩鼠。"},
 {id:"MON-SUN-010",name:"金曜蜂群",tier:"E",habitat:["L-SUN-GOLDGRAIN","L-SUN-ABBEYORCHARD"],hp:46,atk:15,def:5,acc:75,damage:[4,9],scale:"small",tags:["invertebrate"],drops:["SUN-MAT-004"],description:"野化蜂群，通常只有蜂巢遭破壞時攻擊。"},
 {id:"MON-SUN-011",name:"北鐘灰狼",tier:"D",habitat:["L-SUN-NORTHMOOR","D-SUN-NORTHWATCH"],hp:92,atk:27,def:15,acc:77,damage:[9,18],drops:["SUN-MAT-007"],description:"北部寒風草原與舊烽堡周邊狼群。"},
 {id:"MON-SUN-012",name:"赤崖野豬",tier:"D",habitat:["L-SUN-SHEPHERD","L-SUN-WESTROAD","L-SUN-REDCLIFF"],hp:105,atk:28,def:17,acc:70,damage:[10,19],drops:["SUN-MAT-007"],description:"丘陵農牧帶常見大型野豬。"},
 {id:"MON-SUN-013",name:"藍脊石蜥",tier:"D",habitat:["L-SUN-BLUERIDGE","L-SUN-STARSPRING","L-SUN-REDCLIFF"],hp:99,atk:26,def:20,acc:72,damage:[9,18],element:"地",drops:["SUN-MAT-009"],description:"厚鱗石蜥，常伏在礦坡與暖石上。"},
 {id:"MON-SUN-014",name:"星泉水獸",tier:"D",habitat:["L-SUN-STARSPRING","D-SUN-WATERVAULT"],hp:108,atk:27,def:18,acc:72,damage:[9,19],element:"水",tags:["aquatic"],drops:["SUN-MAT-013"],description:"山泉與古渠中的半水棲獸類。"},
 {id:"MON-SUN-015",name:"西冠灰熊",tier:"D",habitat:["L-SUN-HOLYOAK","L-SUN-SILVERWOOD","L-SUN-PRINCEWOOD"],hp:122,atk:30,def:18,acc:69,damage:[11,21],scale:"large",drops:["SUN-MAT-007"],description:"林地大型熊類，採伐季與冬眠前較易接近道路。"},
 {id:"MON-SUN-016",name:"誓旗角獸",tier:"D",habitat:["L-SUN-NORTHMOOR","L-SUN-DIVIDEPLATEAU","L-SUN-BANNERFIELD"],hp:111,atk:29,def:18,acc:71,damage:[10,20],drops:["SUN-MAT-007"],description:"台地與丘原遷移的角獸。"},
 {id:"MON-SUN-017",name:"舊堡巨蝠",tier:"D",habitat:["D-SUN-OLDCITADEL","D-SUN-NORTHWATCH","D-SUN-WESTCRYPT"],hp:84,atk:24,def:9,acc:80,init:16,damage:[8,16],scale:"small",drops:[],description:"古堡高處與地下空腔的大型蝠類。"},
 {id:"MON-SUN-018",name:"舊倉硬甲蟲",tier:"D",habitat:["D-SUN-TITHECELLAR","L-SUN-BANNERFIELD"],hp:90,atk:23,def:22,acc:68,damage:[8,16],tags:["invertebrate"],drops:[],description:"以腐穀與木屑為食的大型硬殼蟲。"},
 {id:"MON-SUN-019",name:"諸侯林巨狼",tier:"C",habitat:["L-SUN-HOLYOAK","L-SUN-SILVERWOOD","L-SUN-PRINCEWOOD"],hp:148,atk:36,def:19,acc:81,damage:[13,26],scale:"large",drops:["SUN-MAT-007"],description:"極少數大型狼，主要在獵物短缺或領域受擾時出現。"},
 {id:"MON-SUN-020",name:"藍脊界碑守衛",tier:"C",habitat:["L-SUN-BLUERIDGE","D-SUN-BLUESEAL"],hp:172,atk:37,def:30,acc:76,damage:[13,27],element:"地",tags:["construct"],drops:["SUN-MAT-017"],description:"舊邊境術式留下的石質守衛構裝。"},
 {id:"MON-SUN-021",name:"斷冠石像",tier:"C",habitat:["D-SUN-OLDCITADEL","D-SUN-WESTCRYPT","D-SUN-OATHHALL","L-SUN-DIVIDEPLATEAU"],hp:168,atk:36,def:29,acc:74,damage:[13,26],element:"地",tags:["construct"],drops:["SUN-MAT-014"],description:"古堡與盟誓遺構中的石製守衛。"},
 {id:"MON-SUN-022",name:"鑄鐘銅傀",tier:"C",habitat:["D-SUN-BELLFOUNDRY","D-SUN-OATHHALL","D-SUN-CROWNTOMB"],hp:165,atk:37,def:28,acc:75,damage:[13,27],tags:["construct"],drops:["SUN-MAT-015"],description:"由舊鑄造院搬運機械與儀典守衛改造而成的銅傀。"},
 {id:"MON-SUN-023",name:"抄經守頁傀",tier:"C",habitat:["D-SUN-ABBEYVAULT"],hp:145,atk:32,def:22,mdef:30,acc:79,damage:[11,24],element:"光",tags:["construct","arcane"],drops:["SUN-MAT-016"],description:"舊修院為保護書庫設置的符紙與木骨構裝，失去維護後仍按舊規則驅離闖入者。"},
 {id:"MON-SUN-024",name:"白鐘深潭河獸",tier:"C",habitat:["L-SUN-BELLUPLAND","D-SUN-WATERVAULT"],hp:157,atk:35,def:23,acc:76,damage:[12,25],element:"水",scale:"large",tags:["aquatic"],drops:["SUN-MAT-013"],description:"只在深水潭與古渠深層活動的大型河獸。"},
 {id:"MON-SUN-025",name:"初代聖冠墓守",tier:"B",role:"首領候選",habitat:["D-SUN-CROWNTOMB"],hp:344,atk:56,def:42,mdef:39,acc:83,damage:[20,41],element:"光",scale:"large",tags:["construct"],drops:["SUN-MAT-018"],description:"初代皇陵深層的封存守衛，只在具B級前置與皇室許可的探索中出現。"},
 {id:"MON-SUN-026",name:"西脊封印騎士傀",tier:"B",role:"菁英",habitat:["D-SUN-BLUESEAL"],hp:318,atk:54,def:43,mdef:41,acc:82,damage:[19,39],element:"光",scale:"large",tags:["construct","arcane"],drops:["SUN-MAT-017"],description:"封印塔基核心的重型守衛構裝，不會進入一般山麓遭遇表。"}
];
for(const m of MONSTERS)upsert("monsters",mon(m));

const NPCS=[
 ["NPC-SUN-001","奧雷里安七世","聖冠皇帝","L-SUN-CROWNCITY","帝國法統、諸侯盟議、加冕資格、外交與軍役","C",["ORG-SUN-CROWN"],"現任聖冠皇帝，重視讓帝冠合法性與封邑自治維持在可執行的制度框架內。"],
 ["NPC-SUN-002","艾德琳・瓦爾德","帝國宰相","L-SUN-CROWNCITY","中央行政、朝會議程、封邑文書與跨區協調","D",["ORG-SUN-CHANCERY"],"負責把皇帝與盟議達成的決議轉成能由地方執行的文書。"],
 ["NPC-SUN-003","赫伯特・洛恩","帝國大法官","L-SUN-CROWNCITY","誓約法、封邑上訴、教律邊界與司法衝突","D",["ORG-SUN-JUSTICE"],"堅持加冕、封臣誓約與普通民事案件必須使用不同法律程序。"],
 ["NPC-SUN-004","瑪蒂妲・索恩","御前財賦總監","L-SUN-CROWNCITY","直轄稅、帝都倉儲、諸侯貢賦與公共預算","E",["ORG-SUN-TITHE"],"把財賦視為糧倉、車隊與帳冊的系統，而非可無限抽取的數字。"],
 ["NPC-SUN-005","葛雷戈・晨盾","帝國軍務元帥","L-SUN-NORTHBELL","邊境聯防、封臣軍役、道路與軍需","C",["ORG-019","ORG-SUN-BORDER"],"協調常備守軍與封臣軍役，主張大型動員必須先確認糧草與道路。"],
 ["NPC-SUN-006","賽蓮娜・梅爾","加冕使節長","L-SUN-CROWNCITY","晨律教國、加冕禮制、外交照會與教權邊界","E",["ORG-SUN-CHANCERY"],"長期往返聖冠城與晨鐘聖城，熟悉哪些是宗教合法性、哪些是帝國主權。"],
 ["NPC-SUN-007","羅德里克・諾德","北鐘邊侯","L-SUN-NORTHBELL","白氈邊界、互市、騎巡與寒潮封路","C",["ORG-SUN-BORDER"],"以互市、檢疫與道路巡防維持北境，不把邊境治理簡化成永久戰爭。"],
 ["NPC-SUN-008","伊薇特・哈恩","北鐘互市監","L-SUN-NORTHBELL","馬匹、羊毛、穀物、邊關庫存與通行證","E",["ORG-SUN-BORDER"],"掌握邊市實際庫存與兩國季節商路。"],
 ["NPC-SUN-009","康拉德・菲爾德","曜穗大公","L-SUN-SUNWHEAT","糧賦、封邑法、農業水利與諸侯盟議","C",["ORG-099"],"是帝國主要農業諸侯之一，關注歉收時帝都徵糧與地方安全庫存的平衡。"],
 ["NPC-SUN-010","安娜・麥恩","曜穗糧賦監","L-SUN-SUNWHEAT","糧倉、磨坊、蜂房、價格與歉收預案","E",["ORG-SUN-TITHE"],"維持農糧安全庫存，拒絕把豐收年視為可無限收購。"],
 ["NPC-SUN-011","貝恩・路德","西冠大道伯","L-SUN-WESTCROWN","驛路、關稅、西向外交與道路工程","C",["ORG-SUN-ROAD"],"把道路視為帝國統合諸侯領最實際的公共工程。"],
 ["NPC-SUN-012","露西亞・格林","銀橡林務官","L-SUN-WESTCROWN","輪伐、林火、獵場與木材市場","D",["ORG-SUN-ROAD"],"以年度伐區和獵物統計控制銀橡林承載量。"],
 ["NPC-SUN-013","艾里克・藍岬","藍脊西侯","L-SUN-BLUEPASS","藍塔外交、山口、礦權與術式事故","C",["ORG-SUN-JUSTICE"],"負責帝國一側山口與邊界協議，重大術式事故會先封鎖現場再通知藍塔。"],
 ["NPC-SUN-014","米蕾雅・奎因","術式監察官","L-SUN-BLUEPASS","導晶採掘、封印、術式安全與事故調查","C",["ORG-SUN-JUSTICE"],"能區分魔法研究事故、走私與真正的敵對行動。"],
 ["NPC-SUN-015","奧斯溫・雷克","聖槍河門伯","L-SUN-EASTFORD","河渡、東南商路、牲畜與凡雷克邊務","C",["ORG-SUN-ROAD"],"維持渡橋與檢疫，與凡雷克地方官保持常態文書往來。"],
 ["NPC-SUN-016","芙蕾雅・沃特","曉渡水務裁判官","L-SUN-DAWNFORD","河權、磨坊、洪水與村社契約","E",["ORG-SUN-JUSTICE"],"專門處理磨坊水權與洪水後界線改變。"],
 ["NPC-SUN-017","馬提亞斯・白鐘","白鐘主教伯","L-SUN-ABBEY","帝國教區、修院財產、救濟與跨境教務","D",["ORG-SUN-ABBEY"],"同時受帝國封邑法與教會規章約束，但不代表晨律教國直接行政統治。"],
 ["NPC-SUN-018","艾莉絲・赫恩","白鐘醫療院長","L-SUN-ABBEY","醫療、藥草、救濟糧與朝聖者照護","F",["ORG-SUN-ABBEY"],"優先維持基礎醫療與救濟，不把所有疾病都交給高階神術。"],
 ["NPC-SUN-019","尤里安・德羅","諸侯盟議長","L-SUN-PRINCEHOLD","諸侯席次、軍役、稅額、繼承與盟誓","C",["ORG-099"],"主持議程而非凌駕其他諸侯；重大決議仍需符合帝國誓約與各席權限。"],
 ["NPC-SUN-020","羅莎琳・克爾","盟議書記長","L-SUN-PRINCEHOLD","議案、投票、封邑界線與歷次妥協","E",["ORG-099"],"對口頭傳聞與正式盟議紀錄保持嚴格區分。"],
 ["NPC-SUN-021","西格蒙・艾爾","晨盾騎士團帝國分團長","L-SUN-NORTHBELL","邊境護衛、巡路與騎士訓練","C",["ORG-019"],"晨盾騎士團在帝國的主要指揮官之一，團務仍受騎士團自身章程約束。"],
 ["NPC-SUN-022","奧菲莉亞・金曜","金曜騎士團帝國聯絡長","L-SUN-ABBEY","朝聖護衛、聖騎士任務與天穹神系節俗","C",["ORG-020"],"負責金曜騎士團與帝國修院、地方領主之間的任務協調。"],
 ["NPC-SUN-023","托馬斯・里恩","金冠門冒險者公會館主","L-SUN-CROWNGATE","帝都周邊委託、收購、道路與地下遺構","C",[],"熟悉帝都外環的低中階任務，會阻止新人跳過前置進入皇陵。"],
 ["NPC-SUN-024","伊蓮・史塔","帝國檔案院史官","L-SUN-CROWNCITY","皇統、加冕紀錄、封臣誓約與公開史料","F",["ORG-SUN-CHANCERY"],"清楚區分宗教敘事、帝室宣稱、諸侯版本與可核對文書。"]
].map(x=>({id:x[0],name:x[1],role:x[2],tier:rank(x[5])>=rank("C")?"C":x[5],location_id:x[3],knowledge_scope:x[4],combat_tier_ceiling:x[5],organization_ids:x[6],services:["地方情報","委託引介"],description:x[7],region_id:REGION_ID,polity_id:POLITY_ID,culture_id:CULTURE_ID}));
for(const n of NPCS)upsert("regional_npc_archetypes",n);

const ORGS=[
 {id:"ORG-SUN-CROWN",name:"帝國御前議政院",kind:"government",tier:"B",base_location_id:"L-SUN-CROWNCITY",description:"皇帝、宰相、主要直轄官與受召諸侯處理跨區行政、外交與重大帝國議案。"},
 {id:"ORG-SUN-CHANCERY",name:"聖冠宰相府",kind:"government",tier:"B",base_location_id:"L-SUN-CROWNCITY",description:"負責詔令、封邑文書、使節、加冕外交與中央行政流程。"},
 {id:"ORG-SUN-JUSTICE",name:"帝國誓約法院",kind:"government",tier:"B",base_location_id:"L-SUN-CROWNCITY",description:"處理誓約法、封邑上訴、跨領爭議與教律／世俗法邊界。"},
 {id:"ORG-SUN-ROAD",name:"西冠大道與驛政署",kind:"civic",tier:"C",base_location_id:"L-SUN-WESTCROWN",description:"維護帝國大道、橋梁、驛站、里程碑與主要商路。"},
 {id:"ORG-SUN-TITHE",name:"王領糧賦總署",kind:"civic",tier:"C",base_location_id:"L-SUN-SUNWHEAT",description:"管理直轄糧賦、公共倉儲、歉收安全庫存與帝都糧運。"},
 {id:"ORG-SUN-BORDER",name:"北鐘邊侯聯防署",kind:"military",tier:"C",base_location_id:"L-SUN-NORTHBELL",description:"協調北境守軍、騎巡、邊市檢疫與白氈方向道路安全。"},
 {id:"ORG-SUN-ABBEY",name:"帝國修院書記院",kind:"religious",tier:"C",base_location_id:"L-SUN-ABBEY",description:"維持修院檔案、醫療救濟、抄寫、教區文書與跨境教務聯絡。"},
 {id:"ORG-019",existing:true,contact_location_ids:["L-SUN-NORTHBELL","L-SUN-CROWNCITY"]},
 {id:"ORG-020",existing:true,contact_location_ids:["L-SUN-ABBEY","L-SUN-CROWNCITY"]},
 {id:"ORG-099",existing:true,contact_location_ids:["L-SUN-PRINCEHOLD","L-SUN-CROWNCITY"]}
];
for(const o0 of ORGS){
 let o=row("world_organizations",o0.id);
 if(o0.existing){
  if(!o)continue;
  o.contact_location_ids=uniq([...(o.contact_location_ids||[]),...(o0.contact_location_ids||[])]);
  o.associated_polity_ids=uniq([...(o.associated_polity_ids||[]),POLITY_ID]);
  o.holy_radiance_role=o.id==="ORG-019"?"北境與帝國護衛合作騎士團":o.id==="ORG-020"?"帝國修院與天穹信仰護衛合作騎士團":"帝國諸侯共同議政與誓約協調平台";
  continue;
 }
 o=upsert("world_organizations",{...o0,region_id:REGION_ID,political_entity_id:POLITY_ID});
 o.scope=o.tier==="B"?"kingdom":"local_regional";o.alignment=o.kind==="religious"?"light":"neutral";o.category=o.kind;o.primary_facility=o.kind==="religious"?"church":"guild";
 o.min_join_level=Math.max(1,Number(o.min_join_level)||1);o.join_reputation=Number(o.join_reputation)||0;o.visibility="public";o.legal_status="legal";o.joinable=true;o.mission_issuer=true;o.can_be_enemy=true;
 o.contact_location_ids=uniq([...(o.contact_location_ids||[]),o.base_location_id]);
 o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:"聖曜職能會員訓練",effects:{...(o.kind==="religious"?{healingPower:4}:o.kind==="military"?{defense_pct:3}:{perception:4})}};
 o.history=o.history||["聖曜帝國以誓約、封邑、道路、教務與中央文書整合各地，這些機構由長期職責逐步固定。"];
 o.history_summary=o.history_summary||o.history.join(" ");
 o.current_state=o.current_state||"目前重點是維持帝國法統、地方承載與跨境合作，權力受誓約、預算、道路與地方權限約束。";
 o.signature=o.signature||o.description;o.distinctive_features=o.distinctive_features||[o.description,"帝國法權與宗教合法性分開處理","組織職位不直接等於個人戰力"];
 o.institutional_culture=o.institutional_culture||"重視誓約、文書、證人、法定權限與可追查的責任鏈。";
}

upsert("regional_content_profiles",{id:"RCP-SUN-01",region_id:REGION_ID,polity_id:POLITY_ID,region_name:"聖曜帝國",recommended_tier:"E～B",
 identity:"由聖冠皇帝、直轄官署、諸侯封邑與跨境加冕教權共同形成的神聖帝國。皇權需要宗教加冕取得完整法統，但晨律教國不直接掌握帝國稅賦與軍隊。",
 terrain:"北中部高原緩坡、白鐘河源丘陵、農牧交界、藍脊西麓與城堡修院帶",
 common_exports:["穀物","蜂蠟","羊毛","硬木","石材","馬具","抄寫與法律服務"],common_imports:["草原馬匹","高階術材","海產","精密工藝品"],
 food_staples:["黑麥麵包","羊肉燉菜","蜂蜜餅","河魚湯","根菜","淡啤酒"],recurring_risks:["寒潮","春融洪水","封邑法律衝突","糧賦壓力","道路封閉","教權與帝權程序爭議","邊境互市波動"]});
upsert("regional_economy_profiles",{id:"ECO-SUN-01",region_id:REGION_ID,polity_id:POLITY_ID,exports:["穀物","羊毛","蜂蠟","硬木","石材","皮革","驛運服務"],imports:["草原馬匹","高階魔法材料","海產","精密術具"],
 notes:"帝國糧倉與商路規模大但不是無限市場。歉收、寒潮、朝會、軍役、修院節期、道路封閉與邊境政策都會改變庫存、價格與收購能力；高階聖物、軍械與導晶受身份或許可限制。"});

const HOOKS=[
 ["HOOK-SUN-01","失印的加冕文書","一份舊加冕副本在帝國檔案院與晨律教國版本間出現封印差異，需要查證抄本來源而非直接判定偽造。","C"],
 ["HOOK-SUN-02","北鐘失蹤馬隊","白氈互市後一批已登記馬匹沒有抵達北鐘關，需沿牧路、檢疫場與風原追查。","D"],
 ["HOOK-SUN-03","曜穗空倉","帳冊顯示糧食已入庫，但數座倉房實際存量不足，調查需涵蓋運損、鼠害、價格與官署責任。","D"],
 ["HOOK-SUN-04","銀橡越界伐木","西冠林務官發現封邑界線兩側都有超額砍伐，必須核對界碑、伐木印與木材流向。","D"],
 ["HOOK-SUN-05","藍脊封印漂移","西脊監測符出現異常，先封閉礦坡並確認是自然晶脈變化、舊構裝還是跨境術式事故。","C"],
 ["HOOK-SUN-06","河門兩國契約","聖曜與凡雷克商人對同一批牲畜的稅契解讀不同，需要依兩國關稅文書與實際檢疫紀錄調解。","C"],
 ["HOOK-SUN-07","修院封庫","舊書庫守頁傀重新啟動，修院要求保全文獻並找出維護中斷原因。","C"],
 ["HOOK-SUN-08","諸侯軍役爭議","兩位諸侯對同一古老軍役條款的兵額解讀不同，玩家需要查盟誓舊廳與歷代修約。","C"],
 ["HOOK-SUN-09","初代皇陵封門","聖冠墓深層封印出現裂痕，只有完成皇室、教會與公會三重前置的B級隊伍能進入。","B"],
 ["HOOK-SUN-10","西脊雙方封鎖","聖曜與藍塔同時封鎖一處舊塔基，必須取得雙方許可並釐清封印騎士傀啟動原因。","B"]
];
for(const h of HOOKS)upsert("regional_adventure_hooks",{id:h[0],title:h[1],premise:h[2],tier:h[3],region_id:REGION_ID,polity_id:POLITY_ID});
const LIFE=[
 ["LIFE-SUN-01","冬末加冕紀念週","聖冠城儀典與使節活動增加，住宿、蠟燭、織物與護衛需求上升。"],
 ["LIFE-SUN-02","北鐘春融封路","白鐘源地積雪融化，部分草澤與邊境道路暫停大型車隊通行。"],
 ["LIFE-SUN-03","曜穗播種期","農村委託轉向水渠、獸害、種糧與農具維修，冒險者高風險委託量短期下降。"],
 ["LIFE-SUN-04","西冠修路月","驛政署集中修橋鋪石，石材、木料與短工需求增加。"],
 ["LIFE-SUN-05","藍脊術材配額重算","年度晶礦測量後重新核發採掘額度，相關素材庫存與價格波動。"],
 ["LIFE-SUN-06","白鐘朝聖季","修院與巡禮道旅人增加，醫療、住宿與道路治安壓力上升。"],
 ["LIFE-SUN-07","諸侯盟議季會","各封邑代表進入誓冠諸侯城，政治傳聞、護衛與文書委託增加。"],
 ["LIFE-SUN-08","秋收貢賦期","曜穗與直轄領糧車大量進入帝都，倉儲與車隊容量成為市場瓶頸。"],
 ["LIFE-SUN-09","騎士團巡禮護送","晨盾與金曜騎士團在不同路線安排護送，地方公會可承接補給與前導任務。"],
 ["LIFE-SUN-10","寒潮預警","北方寒風南壓時，帝國優先保障燃料、糧食、馬料與道路救援。"]
];
for(const e of LIFE)upsert("regional_life_events",{id:e[0],name:e[1],text:e[2],region_id:REGION_ID,polity_id:POLITY_ID});

for(const z of ZONES){
 const towns=TOWNS.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=FIELDS.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=DUNGEONS.filter(x=>x.zoneId===z.id).map(x=>x.id);
 upsert("province_region_maps",{id:z.province,layer:"province_region",name:z.name,display_name:"聖曜帝國・"+z.name,parent_realm_map_id:REALM_ID,political_entity_id:POLITY_ID,world_region_id:REGION_ID,
  world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:z.role,holy_radiance_zone_id:z.id});
 upsert("settlement_region_maps",{id:z.smap,name:z.name+"區域圖",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",
  location_ids:[...towns,...wilds,...dungeons],role:z.role,holy_radiance_zone_id:z.id});
}
let realm=row("realm_region_maps",REALM_ID);
if(!realm)realm=upsert("realm_region_maps",{id:REALM_ID,layer:"realm_region",political_entity_id:POLITY_ID,world_region_id:REGION_ID,name:"聖曜帝國區域地圖",world_tier:"B"});
Object.assign(realm,{name:"聖曜帝國區域地圖",display_name:"聖曜帝國",political_entity_id:POLITY_ID,world_region_ids:uniq([...(realm.world_region_ids||[]),REGION_ID]),core_region_id:REGION_ID,capital:"聖冠城",
 province_region_ids:ZONES.map(x=>x.province),regional_centers:["聖冠城","北鐘關","曜穗城","西冠堡城","藍脊西關","聖槍河門","白鐘修院城","誓冠諸侯城"],map_status:"playable_current",
 notes:"聖曜帝國沿用POL-003／REG-03既有正史。帝國B級代表國家制度、軍事與受控高階內容的上限，不代表所有居民與野外都是B級；一般城郊與農牧區維持E～C，B級內容集中於受控皇陵與封印遺構。"});

const region=row("world_regions",REGION_ID);
if(region)Object.assign(region,{name:"聖冠谷地",map_status:"playable_current",recommended_tier:"B",playable_tier_band:"E～B",terrain:"北中部高原緩坡、白鐘河源丘陵、農牧交界、藍脊西麓、修院與城堡帶",
 regional_identity:"帝冠、封邑、修院與商路共同構成的北中部神聖帝國核心；北接白氈草海、東鄰藍脊與凡雷克方向、南近晨律教國。"});
const polity=row("political_entities",POLITY_ID);
if(polity){
 Object.assign(polity,{name:"聖曜帝國",government_type:"神聖帝國",capital:"聖冠城",map_status:"playable_current",world_tier:"B",current_title:"聖冠皇帝",top_office:"聖冠皇帝",
  ruling_structure:"聖冠皇帝掌帝國外交、軍事統帥、直轄領、中央任命與帝國法框架；諸侯依封邑誓約保有地方司法、稅役與軍役權。晨律最高牧首掌跨境教權與加冕認證，能影響皇帝完整法統，但不因此直接統治帝國稅賦、軍隊或世俗諸侯。",
  legal_tradition:"帝國誓約法、封邑法、地方習慣法、受承認教律與城市特許並行；跨權限案件由誓約法院與對應教務機構分別處理。",
  succession_method:"皇統以世襲順位為主；候位者先取得帝室與諸侯法定承認，完成晨律正統加冕後才取得完整『聖冠皇帝』法統。加冕延宕期間可由候位皇帝或攝政維持世俗行政。",
  identity:"大陸北中部的神聖帝國。帝冠、諸侯盟誓與跨境加冕教權彼此牽制；宗教合法性重要，但帝國不是晨律教國的附庸。",
  gameplay_role:"B級神聖帝國／加冕合法性、諸侯盟議、封邑誓約、北境互市、修院政治與受控聖墓探索",
  secondary_centers:["北鐘關","曜穗城","西冠堡城","藍脊西關","聖槍河門","白鐘修院城","誓冠諸侯城"],
  economic_base:["曜穗糧倉","羊毛與蜂蠟","西冠木材","白鐘河運","驛路與關稅","修院服務","藍脊低中階礦材"],
  military_structure:["帝國近衛","北鐘邊防","封臣軍役","城市守備","晨盾騎士團合作部隊","金曜騎士團護教分隊","道路與關隘守備"],
  current_tensions:["皇統與加冕程序","帝冠與諸侯權利","教律與世俗法邊界","北境互市與寒潮","藍脊術式安全","糧賦與地方安全庫存","騎士團跨境章程"],
  internal_regions:ZONES.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier})),
  external_institution_relations:[
   {name:"晨律教國／最高牧首",relation:"legitimation_partner",note:"掌正統加冕與跨境教務權；不直接擁有聖曜帝國稅賦、軍隊或封邑行政權。"},
   {name:"白氈汗國",relation:"trade_and_border",note:"北鐘互市以馬匹、羊毛、穀物與金屬工具交換為主，牧地與通行依季節協議調整。"},
   {name:"藍塔魔導王國",relation:"regulated_border",note:"以分水嶺、界碑與術式事故通報維持山口秩序。"},
   {name:"凡雷克帝國",relation:"trade_and_rivalry",note:"東南商路頻繁，關稅與外交競爭存在但不等於常態戰爭。"}
  ],
  key_organization_ids:uniq([...(polity.key_organization_ids||[]),...ORGS.map(x=>x.id)])});
}
const auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
if(auth){
 auth.top_office_ids=["POL-003-O1","POL-003-O2"];
 auth.office_nodes=[
  {id:"POL-003-O1",title:"聖冠皇帝",authority_tier:"AUTH-7",authority_level:7,scope:"帝國世俗主權、外交、軍事統帥、直轄領與最高任命",appointment:"皇統繼承＋諸侯法定承認＋晨律正統加冕",rights:["AR-001","AR-002","AR-003","AR-004","AR-005"],reports_to:null,parallel_authority_ids:["POL-003-O2"],notes:"完整聖冠法統需要加冕；世俗行政並不因此隸屬晨律教國。"},
  {id:"POL-003-O2",title:"晨律最高牧首（跨境加冕權）",authority_tier:"AUTH-7",authority_level:7,scope:"正統加冕、跨境教務、教律與神職認可",appointment:"依晨律教國與教會選舉／教律產生",rights:["AR-002","AR-005","AR-006"],reports_to:null,parallel_authority_ids:["POL-003-O1"],external_authority:true,notes:"可以承認、延後或拒絕加冕，但沒有聖曜帝國一般稅賦與軍事指揮權。"},
  {id:"POL-003-O3",title:"諸侯王／選侯大公",authority_tier:"AUTH-6",authority_level:6,scope:"大型封邑、諸侯盟議、軍役與繼承承認",appointment:"世襲或封邑法定繼承並受帝冠確認",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-003-O1",parallel_authority_ids:["POL-003-O4"],notes:"諸侯向帝冠負封臣義務，不直接向外國教國承擔世俗行政從屬。"},
  {id:"POL-003-O4",title:"主教伯／帝國教區主教",authority_tier:"AUTH-5",authority_level:5,scope:"教區、修院財產、教律與依法取得的封邑",appointment:"教會任命並按帝國封邑法確認世俗權利",rights:["AR-005","AR-006"],reports_to:"POL-003-O2",parallel_authority_ids:["POL-003-O3"],notes:"教務向教會體系負責；若兼有封邑，其世俗部分仍受帝國法與封邑誓約約束。"},
  {id:"POL-003-O5",title:"帝國宰相",authority_tier:"AUTH-6",authority_level:6,scope:"中央行政、詔令、使節與跨封邑協調",appointment:"皇帝任命並依帝國慣例受議政院確認",rights:["AR-003","AR-005"],reports_to:"POL-003-O1"},
  {id:"POL-003-O6",title:"帝國大法官",authority_tier:"AUTH-5",authority_level:5,scope:"誓約法、跨封邑上訴與權限衝突",appointment:"皇帝提名、諸侯盟議諮詢",rights:["AR-005"],reports_to:"POL-003-O1"},
  {id:"POL-003-O7",title:"邊侯／大公／伯爵",authority_tier:"AUTH-5",authority_level:5,scope:"封邑行政、地方稅役、守備與依法徵調",appointment:"世襲或帝冠授封",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-003-O3"},
  {id:"POL-003-O8",title:"王領總監／城伯",authority_tier:"AUTH-4",authority_level:4,scope:"直轄領、城市、道路、倉儲與地方司法",appointment:"皇帝、諸侯或合法地方章程任命",rights:["AR-003","AR-005"],reports_to:"POL-003-O5"},
  {id:"POL-003-O9",title:"郡守／地方裁判官",authority_tier:"AUTH-3",authority_level:3,scope:"郡邑、契約、治安與基層司法",appointment:"上級封邑或城市章程任命",rights:["AR-003","AR-005"],reports_to:"POL-003-O8"},
  {id:"POL-003-O10",title:"村長／莊園管事／驛政官",authority_tier:"AUTH-2",authority_level:2,scope:"村社、莊園、驛站與專業公共事務",appointment:"地方慣例或主管任命",rights:["AR-003"],reports_to:"POL-003-O9"}
 ];
 auth.rival_power_centers=["聖冠帝室","晨律最高牧首與跨境教權","諸侯盟議會","主教領與修院","晨盾／金曜等騎士團"];
 auth.player_interaction_summary="低階玩家主要接觸地方公會、村鎮、驛站、修院與封邑官；中階可介入邊侯、諸侯盟議與跨境教務；B級皇陵、封印塔基與最高加冕爭議需要明確前置。";
 auth.succession_method=polity?.succession_method||auth.succession_method;
}

const LORE=[
 ["LORE-SUN-01","history","聖曜帝國的帝冠形成","聖曜帝國約在紀元前190年前後形成目前可辨識的政治骨架。它不是單一建國日建立，而是皇統、諸侯盟誓、修院網絡與道路逐步固化。"],
 ["LORE-SUN-02","coronation","加冕是法統，不是行政隸屬","候位者需要晨律正統加冕才能取得完整聖冠皇帝法統；最高牧首可以影響加冕，但沒有因此取得帝國一般稅賦、軍隊與封邑行政權。"],
 ["LORE-SUN-03","politics","帝冠與諸侯盟誓","諸侯保留封邑內依法承認的司法、稅役與軍役權，皇帝則掌外交、共同防務、直轄領、最高任命與帝國法框架。"],
 ["LORE-SUN-04","law","教律與世俗法的邊界","神職任命、教義與教會紀律由教務體系處理；封邑、軍役、關稅、普通刑民事與城市章程主要屬帝國世俗法域。兼具主教與封臣身份者可能同時受兩套程序約束。"],
 ["LORE-SUN-05","economy","糧倉、道路與修院網","聖曜的國力來自曜穗糧倉、西冠大道、白鐘河源、修院醫療與諸侯城堡網絡；大型政治決策若沒有運輸與倉儲便無法執行。"],
 ["LORE-SUN-06","border","北鐘與白氈互市","北鐘邊侯領與白氈南界以季節互市、牲畜檢疫與邊界協議維持往來。寒潮、牧路或糧價會改變市場，但不自動導致戰爭。"],
 ["LORE-SUN-07","magic","藍脊術式安全","藍脊西麓與藍塔之間建立事故通報與採掘配額。導晶、封印構裝與舊塔基屬受控內容，普通旅人不能任意拆取。"],
 ["LORE-SUN-08","orders","兩大騎士團不是帝國私軍","晨盾與金曜騎士團可與聖曜政府合作，但各自仍受騎士團章程與信仰體系約束；合作不等於完全編入帝國常備軍。"],
 ["LORE-SUN-09","society","封邑身份與帝國身份並存","居民可同時認同帝國、諸侯領、城市、修院或村社。帝國統一主要表現在共同法統、道路、外交、防務與上訴框架。"],
 ["LORE-SUN-10","adventure","B級帝國不等於全境B級","聖曜能處理B級皇陵、封印與國家級危機，但普通田野、道路、修院果園與村鎮仍依真實生態維持F到C級風險。"]
];
const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{}),verify=verifyKeys.includes("verified")?"verified":(verifyKeys.includes("recorded")?"recorded":(verifyKeys[0]||"recorded"));
for(const l of LORE)upsert("lore_records",{id:l[0],category:l[1],title:l[2],text:l[3],scope_type:"polity",scope_id:POLITY_ID,verification:verify,era_id:"ERA-05",source_refs:[POLITY_ID,REGION_ID],tags:["聖曜帝國","區域深化"],common_knowledge:l[1]!=="adventure"});
if(polity){polity.lore_record_ids=Array.isArray(polity.lore_record_ids)?polity.lore_record_ids:[];for(const l of LORE)if(!polity.lore_record_ids.includes(l[0]))polity.lore_record_ids.push(l[0])}
if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}

DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
DB.content_link_index.location_content=DB.content_link_index.location_content&&typeof DB.content_link_index.location_content==="object"?DB.content_link_index.location_content:{};
DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
for(const l of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>loc(x.id)).filter(Boolean))DB.content_link_index.location_content[l.id]={
 facility_ids:[...(l.facilities||[])],gather_item_ids:uniq([...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[])]),fish_item_ids:[...(l.fish||[])],
 encounter_monster_ids:MONSTERS.filter(m=>m.habitat.includes(l.id)).map(m=>m.id),companion_species_ids:[],
 organization_ids:ORGS.filter(o=>o.base_location_id===l.id||(o.contact_location_ids||[]).includes(l.id)).map(o=>o.id),pantheon_ids:["PTH-01","PTH-05"]};
for(const it of ITEMS){
 const s=DB.content_link_index.item_sources[it.id]=DB.content_link_index.item_sources[it.id]||{};
 for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];
 for(const l0 of [...FIELDS,...DUNGEONS])if(uniq([...(l0.gather||[]),...(l0.mining||[]),...(l0.woodcut||[]),...(l0.fish||[]),...(l0.hunt||[])]).includes(it.id)&&!s.gather_locations.includes(l0.id))s.gather_locations.push(l0.id);
 for(const m of MONSTERS)if((m.drops||[]).includes(it.id)&&!s.monster_drops.includes(m.id))s.monster_drops.push(m.id);
}
for(const [id,src] of [["SUN-MAT-004","曜穗與修院合法蜂房"],["SUN-MAT-018","初代聖冠墓受控B級回收"]]){const s=DB.content_link_index.item_sources[id];if(s&&!s.special_sources.includes(src))s.special_sources.push(src)}

DB.holy_radiance_empire={version:REV,release:RELEASE,political_entity_id:POLITY_ID,region_id:REGION_ID,world_tier:"B",zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id),
 wild_ids:FIELDS.map(x=>x.id),dungeon_ids:DUNGEONS.map(x=>x.id),monster_ids:MONSTERS.map(x=>x.id),npc_ids:NPCS.map(x=>x.id),organization_ids:ORGS.map(x=>x.id),material_ids:ITEMS.map(x=>x.id),
 governance:{imperial:"聖冠皇帝＋御前議政院＋宰相府＋誓約法院",princely:"諸侯王／大公／邊侯＋諸侯盟議會",ecclesiastical:"晨律最高牧首掌跨境加冕與教務；主教領的世俗權仍受帝國封邑法約束",local:"城伯／郡守／裁判官／村長與莊園管事"},
 coronation_rule:"宗教加冕決定完整聖冠法統，不使晨律教國取得聖曜稅賦、軍隊或一般封邑行政權。",
 tier_model:"帝國B級；一般可遊玩內容E～C；B級集中於初代聖冠地下墓與西脊封印塔基等受控深層。",save_compatible:true};

function audit(){
 const issues=[],p=row("political_entities",POLITY_ID),r=row("world_regions",REGION_ID),rm=row("realm_region_maps",REALM_ID);
 if(!p)issues.push("聖曜政治體缺失");else{if(p.name!=="聖曜帝國")issues.push("聖曜政治體名稱失步:"+p.name);if(p.capital!=="聖冠城")issues.push("聖曜首都名稱失步:"+p.capital)}
 if(!r||r.map_status!=="playable_current")issues.push("REG-03未切換為可遊玩");
 if(!rm||rm.map_status!=="playable_current")issues.push("聖曜帝國區域地圖未啟用");
 if(ZONES.length!==8)issues.push("聖曜可遊玩區域應為8");
 if(TOWNS.length!==11)issues.push("聖曜城鎮應為11");
 if(FIELDS.length!==16)issues.push("聖曜野外應為16");
 if(DUNGEONS.length!==10)issues.push("聖曜地下城應為10");
 if(MONSTERS.length!==26)issues.push("聖曜怪物應為26");
 if(NPCS.length!==24)issues.push("聖曜核心NPC應為24");
 if(ORGS.length!==10)issues.push("聖曜組織整合清單應為10");
 if(ITEMS.length!==18)issues.push("聖曜區域素材應為18");
 for(const z of ZONES){const pr=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pr)issues.push("缺少區域地圖:"+z.name);if(!sm)issues.push("缺少聚落區域圖:"+z.name);const ids=sm?.location_ids||[];if(!ids.some(id=>loc(id)?.kind==="town"))issues.push("區域缺城鎮:"+z.name);if(!ids.some(id=>loc(id)?.kind==="wild"))issues.push("區域缺野外:"+z.name);if(!ids.some(id=>loc(id)?.kind==="dungeon"))issues.push("區域缺地下城:"+z.name)}
 for(const id of [...TOWNS,...FIELDS,...DUNGEONS].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==POLITY_ID||l.world_region_id!==REGION_ID)issues.push("地點主權錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 for(const m0 of MONSTERS){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(rank(m.tier)>rank("B"))issues.push("REG-03怪物超過B級:"+m.id);if(m.near_town_eligible&&rank(m.tier)>rank("E"))issues.push("城鎮近郊怪物超階:"+m.id);if(m.loot_profile?.fallback_policy!=="none")issues.push("怪物通用掉落fallback未關閉:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落缺失:"+m.id+"->"+d.id)}
 for(const n of NPCS){const x=row("regional_npc_archetypes",n.id);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n.id);if(x&&rank(x.combat_tier_ceiling)>rank("C"))issues.push("核心NPC一般戰力超過C級:"+n.id)}
 for(const o of ORGS)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===POLITY_ID);
 for(const id of ["POL-003-O1","POL-003-O2","POL-003-O3","POL-003-O4","POL-003-O5","POL-003-O6","POL-003-O7","POL-003-O8","POL-003-O9","POL-003-O10"])if(!a?.office_nodes?.some(x=>x.id===id))issues.push("政治權力節點缺失:"+id);
 if(a?.office_nodes?.find(x=>x.id==="POL-003-O3")?.reports_to!=="POL-003-O1")issues.push("諸侯王不應直接隸屬跨境教權");
 if(!a?.office_nodes?.find(x=>x.id==="POL-003-O2")?.external_authority)issues.push("晨律最高牧首跨境權限標記缺失");
 if(!DUNGEONS.some(x=>x.tier==="B")||!MONSTERS.some(x=>x.tier==="B"))issues.push("聖曜缺少受控B級內容");
 if(FIELDS.every(x=>rank(x.tier)>=rank("C")))issues.push("聖曜日常野外全部高階化");
 if(!p?.external_institution_relations?.some(x=>x.name==="晨律教國／最高牧首"&&x.relation==="legitimation_partner"))issues.push("跨境加冕教權關係缺失");
 return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:ZONES.length,towns:TOWNS.length,wilds:FIELDS.length,dungeons:DUNGEONS.length,monsters:MONSTERS.length,npcs:NPCS.length,organizations:ORGS.length,materials:ITEMS.length,b_tier_dungeons:DUNGEONS.filter(x=>x.tier==="B").length}};
}
DB.meta=DB.meta||{};DB.meta.holy_radiance_depth_revision=REV;DB.holy_radiance_empire.initial_audit=audit();
globalThis.runHolyRadianceDepthAudit=audit;
globalThis.QUNLU_HOLY_RADIANCE=Object.freeze({version:REV,audit,zone_ids:ZONES.map(x=>x.id),town_ids:TOWNS.map(x=>x.id)});
CORE?.registerModule?.("src/holy-radiance-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();