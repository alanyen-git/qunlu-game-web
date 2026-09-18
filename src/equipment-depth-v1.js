/* 群陸旅誌：特色裝備與可變件數套裝 CURRENT-1.68.0
 * EQUIPMENT-DEPTH-1.0
 * +72 equipment: 32 set pieces (3/5/8-piece sets) + 40 standalone feature/stat items.
 */
(()=>{
  if(typeof DB!=="object"||!DB)return;
  const TIERS={F:{lv:1,rarity:"普通",value:28,dur:65,mat:"MAT-ORE-16"},E:{lv:8,rarity:"優良",value:72,dur:80,mat:"MAT-ORE-17"},D:{lv:20,rarity:"稀有",value:185,dur:100,mat:"MAT-ORE-18"},C:{lv:35,rarity:"精良",value:380,dur:115,mat:"MAT-ORE-19"}};
  const itemIds=new Set((DB.items||[]).map(x=>x.id));
  const add=x=>{if(!itemIds.has(x.id)){DB.items.push(x);itemIds.add(x.id)}};
  const slotCategory=t=>t==="主武器"?"武器":(t==="披風"||t==="飾品"?"飾品":"防具");
  const profession=t=>["披風","手套","鞋子","頭盔","盔甲"].includes(t)?"裁縫":"鍛造";
  const subcat=t=>({主武器:"特色武器",頭盔:"特色頭盔",盔甲:"特色護甲",手套:"特色護手",鞋子:"特色靴鞋",披風:"特色披風",飾品:"特色飾品"}[t]||"特色裝備");
  const weaponProfiles={
    長劍:{group:"長劍",range:1.2,armor_pen_pct:4,hands:1},斧:{group:"斧錘",range:1.25,armor_pen_pct:7,hands:1},
    長槍:{group:"長槍",range:2.2,armor_pen_pct:7,hands:2},弓:{group:"弓",range:26,armor_pen_pct:5,hands:2,required_dex:10},
    匕首:{group:"匕首",range:.9,armor_pen_pct:3,hands:1,required_dex:10},法杖:{group:"法杖",range:13,armor_pen_pct:2,hands:2},
    武士刀:{group:"長劍",range:1.25,armor_pen_pct:5,hands:2,required_dex:11},錘:{group:"斧錘",range:1.2,armor_pen_pct:6,hands:1}
  };
  function make(def){
    const t=TIERS[def.tier],type=def.type,prof=profession(type),weapon=type==="主武器";
    const out={
      id:def.id,name:def.name,tier:def.tier,type,weight:def.weight??(weapon?1.5:type==="盔甲"?3.2:type==="頭盔"?.65:type==="披風"?.45:type==="飾品"?.06:.38),
      value:def.value??t.value,durability:def.durability??(type==="飾品"?100:t.dur),combat:{...(def.combat||{})},
      catalog_group:slotCategory(type),catalog_subcategory:def.subcategory||subcat(type),equipment_slot:type==="飾品"?"飾品":type,
      required_level:t.lv,rarity:t.rarity,material:def.material||({F:"黑鐵／皮革",E:"黑鐵／優質素材",D:"精鋼／魔法素材",C:"秘銀級素材"}[def.tier]),
      monster_upgrade_components:[],advanced_combat:{...(def.advanced||{})},element_resistances:{...(def.resist||{})},
      feature:def.feature||"",feature_tags:def.tags||[],set_id:def.set_id||null,
      craft_recipe:{profession:prof,grade:def.tier,base_materials:[{id:t.mat,qty:def.tier==="C"?2:1}],monster_components:[],requires_facility:prof==="裁縫"?"tailor":"blacksmith"},
      acquisition_sources:["craft","loot"],wild_gather_eligible:false,gather_tool:null,
      recipe_id:"CR-"+def.id,recipe_access:def.tier==="F"?"public":def.tier==="C"?"special":"trainer",recipe_level:t.lv,
      recipe_time_hours:{F:1,E:1.5,D:2.5,C:4}[def.tier],economic_role:"特色製作／戰利品→使用／交易"
    };
    if(weapon)out.weapon_profile={...(weaponProfiles[def.weapon||"長劍"]||weaponProfiles.長劍),...(def.weapon_profile||{})};
    return out
  }

  const sets=[
    {id:"SET-ASH-WAYFARER",name:"灰燼旅人",tier:"E",pieces:["EQX-ASH-BLADE","EQX-ASH-CLOAK","EQX-ASH-CHARM"],bonuses:[
      {pieces:2,combat:{defense:2,statusResist:2},description:"防禦+2、狀態抗性+2"},
      {pieces:3,advanced_combat:{hpRegen:.4,carryCapacity:2},description:"HP回復+0.4/時、負重+2kg"}
    ]},
    {id:"SET-TIDE-HUNTER",name:"潮痕獵手",tier:"D",pieces:["EQX-TIDE-SPEAR","EQX-TIDE-BOOTS","EQX-TIDE-RING"],bonuses:[
      {pieces:2,combat:{accuracy:3,evasion:2},description:"命中+3、閃避+2"},
      {pieces:3,advanced_combat:{perception:6,initiative:3},description:"感知+6、先攻+3"}
    ]},
    {id:"SET-GRAY-WALL",name:"灰門壁壘",tier:"D",pieces:["EQX-GRAY-SWORD","EQX-GRAY-HELM","EQX-GRAY-ARMOR","EQX-GRAY-GLOVE","EQX-GRAY-BOOT"],bonuses:[
      {pieces:3,combat:{defense:5,blockRate:4},description:"防禦+5、格擋+4"},
      {pieces:5,combat:{statusResist:4},advanced_combat:{poise:10,critResist:4},description:"抗性+4、韌性+10、爆擊抗性+4"}
    ]},
    {id:"SET-MOON-OATH",name:"月泉祈誓",tier:"C",pieces:["EQX-MOON-STAFF","EQX-MOON-HOOD","EQX-MOON-ROBE","EQX-MOON-GLOVE","EQX-MOON-CHARM"],bonuses:[
      {pieces:3,combat:{magicPower:6,magicDefense:4},description:"魔法威力+6、魔防+4"},
      {pieces:5,combat:{statusResist:5},advanced_combat:{healingPower:15,manaRegen:.6},description:"抗性+5、治療效果+15%、MP回復+0.6/時"}
    ]},
    {id:"SET-MIST-STRIDER",name:"霧杉逐風",tier:"C",pieces:["EQX-MIST-BOW","EQX-MIST-HOOD","EQX-MIST-ARMOR","EQX-MIST-GLOVE","EQX-MIST-BOOT","EQX-MIST-CLOAK","EQX-MIST-RING","EQX-MIST-CHARM"],bonuses:[
      {pieces:3,combat:{accuracy:4,evasion:3},description:"命中+4、閃避+3"},
      {pieces:5,combat:{critRate:4,attackSpeed:.04},advanced_combat:{stealth:8,perception:8},description:"爆擊+4、攻速+0.04、潛行+8、感知+8"},
      {pieces:8,stats:{敏捷:2},advanced_combat:{moveSpeed:8,armorPenPct:6,initiative:5},description:"敏捷+2、移速+8、破甲+6%、先攻+5"}
    ]},
    {id:"SET-RED-VEIN",name:"赤岩熔脈",tier:"C",pieces:["EQX-RED-AXE","EQX-RED-HELM","EQX-RED-ARMOR","EQX-RED-GLOVE","EQX-RED-BOOT","EQX-RED-CLOAK","EQX-RED-RING","EQX-RED-CHARM"],bonuses:[
      {pieces:3,combat:{attack:6,defense:4},description:"攻擊+6、防禦+4"},
      {pieces:5,combat:{blockRate:5,statusResist:4},advanced_combat:{poise:12},description:"格擋+5、抗性+4、韌性+12"},
      {pieces:8,stats:{力量:2,體力:2},advanced_combat:{armorPenPct:7,critResist:5},description:"力量+2、體質+2、破甲+7%、爆擊抗性+5"}
    ]}
  ];
  DB.equipment_sets=Array.isArray(DB.equipment_sets)?DB.equipment_sets:[];
  const setIds=new Set(DB.equipment_sets.map(x=>x.id));for(const s of sets)if(!setIds.has(s.id))DB.equipment_sets.push(s);

  const setPieces=[
    ["EQX-ASH-BLADE","灰燼短劍","E","主武器",{attack:8,accuracy:3},{initiative:2},"長劍","低重量與先攻強化。","SET-ASH-WAYFARER"],
    ["EQX-ASH-CLOAK","灰燼行旅披風","E","披風",{evasion:2,statusResist:2},{stealth:3},"", "旅行與隱蔽兼用。","SET-ASH-WAYFARER"],
    ["EQX-ASH-CHARM","灰燼護行符","E","飾品",{magicDefense:3,statusResist:3},{carryCapacity:1},"","提升長途生存與負重。","SET-ASH-WAYFARER"],
    ["EQX-TIDE-SPEAR","潮痕獵槍","D","主武器",{attack:13,accuracy:4},{perception:3},"長槍","長距離近戰與感知強化。","SET-TIDE-HUNTER"],
    ["EQX-TIDE-BOOTS","潮痕踏浪靴","D","鞋子",{evasion:4},{moveSpeed:4},"","提高機動。","SET-TIDE-HUNTER"],
    ["EQX-TIDE-RING","潮痕觀潮戒","D","飾品",{accuracy:3,critRate:2},{perception:4},"","提高觀察與精準。","SET-TIDE-HUNTER"],
    ["EQX-GRAY-SWORD","灰門守備劍","D","主武器",{attack:12,defense:2},{poise:3},"長劍","守勢近戰。","SET-GRAY-WALL"],
    ["EQX-GRAY-HELM","灰門壁盔","D","頭盔",{defense:5,statusResist:2},{critResist:2},"","降低爆擊風險。","SET-GRAY-WALL"],
    ["EQX-GRAY-ARMOR","灰門壁甲","D","盔甲",{defense:15,evasion:-2},{poise:9,moveSpeed:-3},"","重甲與韌性。","SET-GRAY-WALL"],
    ["EQX-GRAY-GLOVE","灰門握鐵護手","D","手套",{defense:3,accuracy:2},{blockValue:3},"","提高格擋效益。","SET-GRAY-WALL"],
    ["EQX-GRAY-BOOT","灰門駐地戰靴","D","鞋子",{defense:3,evasion:1},{poise:4},"","穩固站位。","SET-GRAY-WALL"],
    ["EQX-MOON-STAFF","月泉祈禱杖","C","主武器",{magicPower:12,magicDefense:3,castSpeed:.06},{healingPower:7},"法杖","治療與施法專精。","SET-MOON-OATH"],
    ["EQX-MOON-HOOD","月泉銀紗兜帽","C","頭盔",{magicDefense:5,statusResist:3},{manaRegen:.2},"","穩定精神與回魔。","SET-MOON-OATH"],
    ["EQX-MOON-ROBE","月泉誓約法衣","C","盔甲",{defense:7,magicDefense:11},{healingPower:5},"","偏重魔防與治療。","SET-MOON-OATH"],
    ["EQX-MOON-GLOVE","月泉祝禱手套","C","手套",{magicPower:4,accuracy:2},{statusAccuracy:4},"","提高術式命中。","SET-MOON-OATH"],
    ["EQX-MOON-CHARM","月泉祈誓墜飾","C","飾品",{magicPower:4,statusResist:4},{manaRegen:.25},"","強化法力循環。","SET-MOON-OATH"],
    ["EQX-MIST-BOW","霧杉逐風弓","C","主武器",{attack:14,accuracy:8,critRate:4},{perception:5},"弓","高命中遠程武器。","SET-MIST-STRIDER"],
    ["EQX-MIST-HOOD","霧杉尋跡兜帽","C","頭盔",{accuracy:3,evasion:3},{perception:5},"","偵察與追跡。","SET-MIST-STRIDER"],
    ["EQX-MIST-ARMOR","霧杉獵影皮甲","C","盔甲",{defense:9,evasion:5},{stealth:5},"","輕裝潛行。","SET-MIST-STRIDER"],
    ["EQX-MIST-GLOVE","霧杉控弦手套","C","手套",{accuracy:4,critRate:2},{initiative:2},"","射擊節奏。","SET-MIST-STRIDER"],
    ["EQX-MIST-BOOT","霧杉無聲靴","C","鞋子",{evasion:5,attackSpeed:.03},{moveSpeed:4,stealth:4},"","高速潛行。","SET-MIST-STRIDER"],
    ["EQX-MIST-CLOAK","霧杉藏跡披風","C","披風",{evasion:4,statusResist:2},{stealth:7},"","大幅提高潛行。","SET-MIST-STRIDER"],
    ["EQX-MIST-RING","霧杉鷹目戒","C","飾品",{accuracy:4,critRate:2},{perception:5},"","強化感知。","SET-MIST-STRIDER"],
    ["EQX-MIST-CHARM","霧杉風痕護符","C","飾品",{evasion:3,critRate:2},{moveSpeed:3},"","提高機動。","SET-MIST-STRIDER"],
    ["EQX-RED-AXE","赤岩熔脈戰斧","C","主武器",{attack:18,critRate:3},{armorPenPct:5,poise:3},"斧","重擊與破甲。","SET-RED-VEIN"],
    ["EQX-RED-HELM","赤岩熔脈盔","C","頭盔",{defense:6,statusResist:2},{poise:5},"","提高韌性。","SET-RED-VEIN"],
    ["EQX-RED-ARMOR","赤岩熔脈重甲","C","盔甲",{defense:18,evasion:-3},{poise:12,moveSpeed:-4},"","極重防護。","SET-RED-VEIN"],
    ["EQX-RED-GLOVE","赤岩熔脈護手","C","手套",{attack:3,defense:4},{blockValue:4},"","攻防兼具。","SET-RED-VEIN"],
    ["EQX-RED-BOOT","赤岩熔脈戰靴","C","鞋子",{defense:4},{poise:6,critResist:2},"","穩定重甲姿勢。","SET-RED-VEIN"],
    ["EQX-RED-CLOAK","赤岩爐火披肩","C","披風",{defense:3,statusResist:3},{critResist:2},"","抗衝擊披肩。","SET-RED-VEIN"],
    ["EQX-RED-RING","赤岩鍛脈戒","C","飾品",{attack:3,defense:2},{armorPenPct:2},"","附帶破甲。","SET-RED-VEIN"],
    ["EQX-RED-CHARM","赤岩爐心護符","C","飾品",{statusResist:4,magicDefense:3},{poise:3},"","防護與韌性。","SET-RED-VEIN"]
  ];
  for(const p of setPieces){
    const [id,name,tier,type,combat,advanced,weapon,feature,set_id]=p;
    add(make({id,name,tier,type,combat,advanced,weapon:weapon||undefined,feature,set_id,tags:["套裝","附加屬性"]}))
  }

  const standalone=[
    ["EQX-S01","裂風細劍","E","主武器",{attack:8,accuracy:4,attackSpeed:.04},{initiative:2},"長劍","快速出手與先攻"],
    ["EQX-S02","沉鐵破甲劍","D","主武器",{attack:14,accuracy:2},{armorPenPct:5},"長劍","偏重破甲"],
    ["EQX-S03","河衛鉤斧","D","主武器",{attack:15,critRate:2},{blockValue:3},"斧","兼顧防禦反制"],
    ["EQX-S04","白石獵槍","E","主武器",{attack:9,accuracy:3},{perception:3},"長槍","偵察用長兵"],
    ["EQX-S05","銀穗長弓","D","主武器",{attack:12,accuracy:7,critRate:2},{perception:4},"弓","高命中遠程"],
    ["EQX-S06","夜梟短弓","E","主武器",{attack:8,accuracy:4,attackSpeed:.04},{stealth:3},"弓","潛行射擊"],
    ["EQX-S07","灰影雙刃","D","主武器",{attack:11,accuracy:4,critRate:4},{stealth:4},"匕首","爆擊與潛行"],
    ["EQX-S08","術式刻刀","E","主武器",{attack:6,magicPower:4,accuracy:3},{statusAccuracy:3},"匕首","近距離術式輔助"],
    ["EQX-S09","雷紋武士刀","C","主武器",{attack:16,accuracy:5,critRate:4},{initiative:4},"武士刀","先攻型雙手刀"],
    ["EQX-S10","潮鳴法杖","D","主武器",{magicPower:10,magicDefense:3,castSpeed:.05},{manaRegen:.25},"法杖","法力循環"],
    ["EQX-S11","明燈牧杖","D","主武器",{magicPower:8,magicDefense:4},{healingPower:9},"法杖","治療增幅"],
    ["EQX-S12","沉鐘戰錘","C","主武器",{attack:17,defense:2},{poise:6,armorPenPct:4},"錘","重擊與韌性"],
    ["EQX-S13","斷脊長槍","C","主武器",{attack:16,accuracy:4},{armorPenPct:6},"長槍","高破甲長兵"],
    ["EQX-S14","星砂秘杖","C","主武器",{magicPower:13,castSpeed:.07},{magicPenPct:6,statusAccuracy:4},"法杖","法穿與術式命中"],
    ["EQX-S15","獵王重弓","C","主武器",{attack:15,accuracy:8,critRate:4},{perception:6},"弓","遠距精準"],
    ["EQX-S16","巷戰短刃","F","主武器",{attack:6,accuracy:3,attackSpeed:.03},{initiative:1},"匕首","低階快速武器"],

    ["EQX-A01","測風兜帽","E","頭盔",{evasion:2,accuracy:2},{perception:3},"","感知與閃避"],
    ["EQX-A02","沉思冠帶","D","頭盔",{magicDefense:4,statusResist:4},{manaRegen:.15},"","施法者防護"],
    ["EQX-A03","荊皮獵甲","E","盔甲",{defense:7,evasion:2},{stealth:3},"","獵人輕甲"],
    ["EQX-A04","鏡片法衣","D","盔甲",{defense:6,magicDefense:8},{magicPenPct:2},"","魔防與法穿"],
    ["EQX-A05","山衛層甲","C","盔甲",{defense:16,statusResist:3},{poise:9,critResist:3},"","重防護"],
    ["EQX-A06","精準護指","E","手套",{accuracy:3,critRate:1},{perception:2},"","精準強化"],
    ["EQX-A07","符文織手套","D","手套",{magicPower:4,castSpeed:.03},{statusAccuracy:4},"","術式命中"],
    ["EQX-A08","破甲拳護","C","手套",{attack:3,accuracy:2},{armorPenPct:3},"","近戰破甲"],
    ["EQX-A09","踏風短靴","E","鞋子",{evasion:3},{moveSpeed:3},"","移動速度"],
    ["EQX-A10","巡夜靜步靴","D","鞋子",{evasion:4},{stealth:5},"","潛行移動"],
    ["EQX-A11","鐵根戰靴","C","鞋子",{defense:4},{poise:7,critResist:2},"","站穩與抗爆"],
    ["EQX-A12","霧紗披風","E","披風",{evasion:2,statusResist:2},{stealth:4},"","隱蔽防護"],
    ["EQX-A13","學者星圖披肩","D","披風",{magicPower:3,magicDefense:3},{manaRegen:.2,perception:2},"","法力與感知"],
    ["EQX-A14","守望長披風","C","披風",{defense:3,statusResist:4},{perception:5,critResist:2},"","守望與抗性"],

    ["EQX-J01","鷹眼銅鏡墜","E","飾品",{accuracy:3},{perception:4},"","高感知"],
    ["EQX-J02","靜心銀戒","E","飾品",{magicDefense:2,statusResist:3},{manaRegen:.15},"","回魔與抗性"],
    ["EQX-J03","山脈負重扣","D","飾品",{defense:2},{carryCapacity:5},"","提高負重"],
    ["EQX-J04","血石獵戒","D","飾品",{attack:2,critRate:2},{lifeSteal:2},"","少量生命偷取"],
    ["EQX-J05","祈療聖徽","D","飾品",{magicPower:2,statusResist:3},{healingPower:8},"","治療效果"],
    ["EQX-J06","風步腳環","D","飾品",{evasion:2},{moveSpeed:3,initiative:2},"","移速與先攻"],
    ["EQX-J07","破法黑曜戒","C","飾品",{magicPower:3},{magicPenPct:5,statusAccuracy:3},"","法穿與異常命中"],
    ["EQX-J08","不屈徽記","C","飾品",{defense:2,statusResist:5},{poise:5,critResist:4},"","抗性與韌性"],
    ["EQX-J09","獵跡琥珀墜","C","飾品",{accuracy:3,critRate:2},{perception:6,stealth:3},"","偵察飾品"],
    ["EQX-J10","急流指環","C","飾品",{attackSpeed:.03,castSpeed:.03},{initiative:3},"","雙速與先攻"]
  ];
  for(const p of standalone){
    const [id,name,tier,type,combat,advanced,weapon,feature]=p;
    add(make({id,name,tier,type,combat,advanced,weapon:weapon||undefined,feature,tags:["特色裝備","附加屬性"]}))
  }

  const equipment=(DB.items||[]).filter(x=>["武器","防具","飾品"].includes(x.catalog_group)||["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"].includes(x.type));
  const counts={武器:0,防具:0,飾品:0};
  for(const d of equipment){if(d.catalog_group in counts)counts[d.catalog_group]++}
  DB.equipment_system=DB.equipment_system||{};
  DB.equipment_system.core_count=equipment.length;
  DB.equipment_system.catalog_counts=counts;
  DB.equipment_system.set_rule="套裝總件數與啟動門檻由資料定義，不限制3/5/8；目前實裝3、5、8件套裝。";
  if(DB.item_material_design_system)DB.item_material_design_system.equipment_core_count=equipment.length;
  if(DB.item_catalog_system){DB.item_catalog_system.current_total=(DB.items||[]).length;DB.item_catalog_system.current_equipment=equipment.length}
  DB.equipment_depth_system={
    version:"EQUIPMENT-DEPTH-1.0",release:"CURRENT-1.68.0",added_items:72,set_piece_count:32,standalone_count:40,
    set_counts:{three_piece:2,five_piece:2,eight_piece:2,total:6},
    rules:[
      "套裝件數不寫死；任何正整數件數與門檻都可由equipment_sets資料定義。",
      "套裝只計算實際裝備中的指定不同部件，不因同一飾品重複裝備而重複計件。",
      "特色裝備優先使用現有可執行戰鬥欄位，不建立只有敘述沒有runtime效果的假特效。",
      "新增裝備以F～C為主，不新增A/S裝備，避免高階裝備通膨。"
    ]
  };
  DB.meta=DB.meta||{};DB.meta.equipment_depth_revision="EQUIPMENT-DEPTH-1.0";
})();