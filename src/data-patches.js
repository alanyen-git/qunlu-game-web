/*
 * 群陸旅誌資料補丁入口
 * CURRENT-1.57.0：成年怪物威脅平衡補丁（含既有內容深化包）
 * 載入順序：game-data.js -> data-patches.js -> runtime.js
 */
(()=>{
  const appendUnique=(key,rows)=>{
    DB[key]=Array.isArray(DB[key])?DB[key]:[];
    const ids=new Set(DB[key].map(x=>x&&x.id).filter(Boolean));
    for(const row of rows)if(row&&row.id&&!ids.has(row.id)){DB[key].push(row);ids.add(row.id)}
  };
  const questDefaults={
  "time_limit_hours": 96,
  "base_time_limit_hours": 96,
  "target_spawn_boost": 0,
  "completion_grace_hours": 24,
  "generator_validation": "接取前驗證目標存在、可達地點可產生目標，且時限覆蓋往返、操作與安全緩衝。"
};
  const facilityDefaults={
  "time_limit_hours": 72,
  "base_time_limit_hours": 72,
  "completion_grace_hours": 24,
  "target_spawn_boost": 0,
  "source_type": "facility"
};
  appendUnique("quest_templates",[
  {
    "id": "Q155-WHITESTONE-GRAIN",
    "name": "白石丘冬糧盤點",
    "tier": "F",
    "min_level": 1,
    "max_level": 7,
    "type": "採集",
    "description": "白石丘農帶準備交付救濟糧，公會需要少量耐藏穀物核對品質。",
    "objective": {
      "kind": "gather",
      "item_id": "MAT-FOOD-05",
      "target": 4,
      "consume_on_turnin": true
    },
    "reward": [
      10,
      17
    ],
    "recommended_locations": [
      "L-WHITESTONE-FIELDS"
    ],
    "xp_reward": 12
  },
  {
    "id": "Q155-RIVER-WATCH",
    "name": "白石河中游水標巡查",
    "tier": "E",
    "min_level": 4,
    "max_level": 13,
    "type": "巡查",
    "description": "近期水位反覆，請確認中游兩處水標與纜繩樁是否仍可使用。",
    "objective": {
      "kind": "patrol",
      "location_id": "L-WHITESTONE-RIVER",
      "target": 2,
      "checkpoints": [
        "舊纜繩樁",
        "北岸水位石"
      ]
    },
    "reward": [
      24,
      40
    ],
    "recommended_locations": [
      "L-WHITESTONE-RIVER"
    ],
    "xp_reward": 28
  },
  {
    "id": "Q155-REDCLIFF-ORE",
    "name": "赤岩礦脈比對",
    "tier": "E",
    "min_level": 5,
    "max_level": 14,
    "type": "採集",
    "description": "鐵匠行會要比對赤岩坡地表層礦色，請帶回少量赤紋礦樣。",
    "objective": {
      "kind": "gather",
      "item_id": "MAT-ORE-24",
      "target": 2,
      "consume_on_turnin": true
    },
    "reward": [
      26,
      42
    ],
    "recommended_locations": [
      "L-REDCLIFF"
    ],
    "xp_reward": 28
  },
  {
    "id": "Q155-GREYPEAK-GLOW",
    "name": "灰峰幽光菇補給",
    "tier": "E",
    "min_level": 5,
    "max_level": 14,
    "type": "採集",
    "description": "灰峰獵徑的夜間標記需要幽光菇汁，請從灰峰松林採集合格樣本。",
    "objective": {
      "kind": "gather",
      "item_id": "MAT-HERB-07",
      "target": 2,
      "consume_on_turnin": true
    },
    "reward": [
      25,
      41
    ],
    "recommended_locations": [
      "L-GREYPEAK-PINES"
    ],
    "xp_reward": 28
  },
  {
    "id": "Q155-QUARRY-SURVEY",
    "name": "黑石採坑邊坡複查",
    "tier": "E",
    "min_level": 5,
    "max_level": 14,
    "type": "偵察",
    "description": "採坑停工後仍有落石聲，請完成兩次外圍探索並標出不穩定邊坡。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "L-QUARRY",
      "target": 2
    },
    "reward": [
      28,
      45
    ],
    "recommended_locations": [
      "L-QUARRY"
    ],
    "xp_reward": 28
  },
  {
    "id": "Q155-CISTERN-SURVEY",
    "name": "地下蓄水道水門檢查",
    "tier": "E",
    "min_level": 6,
    "max_level": 15,
    "type": "偵察",
    "description": "白石城擔心水門卡死，請進入地下蓄水道確認兩段閘門。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-WHITESTONE-CISTERN",
      "target": 2
    },
    "reward": [
      30,
      48
    ],
    "recommended_locations": [
      "D-WHITESTONE-CISTERN"
    ],
    "xp_reward": 28
  },
  {
    "id": "Q155-HIGHLAND-PATROL",
    "name": "風牧高地牧道巡查",
    "tier": "D",
    "min_level": 10,
    "max_level": 26,
    "type": "巡查",
    "description": "高地牧群轉場前需要確認避風石圈與南坡水槽，請完成兩處巡查。",
    "objective": {
      "kind": "patrol",
      "location_id": "L-HIGHLAND",
      "target": 2,
      "checkpoints": [
        "避風石圈",
        "南坡水槽"
      ]
    },
    "reward": [
      52,
      84
    ],
    "recommended_locations": [
      "L-HIGHLAND"
    ],
    "xp_reward": 65
  },
  {
    "id": "Q155-MIST-HUT",
    "name": "霧林獵舍陷阱清查",
    "tier": "D",
    "min_level": 11,
    "max_level": 27,
    "type": "偵察",
    "description": "舊獵舍周圍疑有失控陷阱，請進行兩次探索並記錄安全路線。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-MIST-HUT",
      "target": 2
    },
    "reward": [
      56,
      88
    ],
    "recommended_locations": [
      "D-MIST-HUT"
    ],
    "xp_reward": 65
  },
  {
    "id": "Q155-SALT-CRYPT",
    "name": "鹽風墓室外環測繪",
    "tier": "D",
    "min_level": 12,
    "max_level": 28,
    "type": "偵察",
    "description": "鹽蝕讓墓室外環結構不穩，請完成兩次探索，禁止擅動葬具。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-SALT-CRYPT",
      "target": 2
    },
    "reward": [
      58,
      92
    ],
    "recommended_locations": [
      "D-SALT-CRYPT"
    ],
    "xp_reward": 65
  },
  {
    "id": "Q155-GREYPEAK-GEM",
    "name": "灰峰舊礦紅寶石樣本",
    "tier": "D",
    "min_level": 12,
    "max_level": 28,
    "type": "採集",
    "description": "灰峰礦務所要確認舊鐵礦是否混有紅寶石伴生層，請帶回一枚樣本。",
    "objective": {
      "kind": "gather",
      "item_id": "MAT-GEM-01",
      "target": 1,
      "consume_on_turnin": true
    },
    "reward": [
      62,
      96
    ],
    "recommended_locations": [
      "D-GREYPEAK-MINE"
    ],
    "xp_reward": 65
  },
  {
    "id": "Q155-SUNKEN-FORT",
    "name": "沉橋舊堡通道勘查",
    "tier": "D",
    "min_level": 13,
    "max_level": 29,
    "type": "偵察",
    "description": "白石城準備封閉危險通道，請完成兩次探索並標記可撤退路線。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-WHITESTONE-FORT",
      "target": 2
    },
    "reward": [
      60,
      95
    ],
    "recommended_locations": [
      "D-WHITESTONE-FORT"
    ],
    "xp_reward": 65
  },
  {
    "id": "Q155-ASHGROVE",
    "name": "灰燼林地火痕調查",
    "tier": "C",
    "min_level": 20,
    "max_level": 42,
    "type": "偵察",
    "description": "灰燼林地出現不合季節的新火痕，請完成三次探索並區分自然火與人為火。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "L-ASHGROVE",
      "target": 3
    },
    "reward": [
      108,
      158
    ],
    "recommended_locations": [
      "L-ASHGROVE"
    ],
    "xp_reward": 140
  },
  {
    "id": "Q155-STARMOOR",
    "name": "星落荒原界碑復核",
    "tier": "C",
    "min_level": 21,
    "max_level": 43,
    "type": "巡查",
    "description": "荒原舊界碑可能因地表位移偏離，請依序確認三處標記。",
    "objective": {
      "kind": "patrol",
      "location_id": "L-STARMOOR",
      "target": 3,
      "checkpoints": [
        "西側碎碑",
        "中央黑石標",
        "東緣風蝕柱"
      ]
    },
    "reward": [
      112,
      164
    ],
    "recommended_locations": [
      "L-STARMOOR"
    ],
    "xp_reward": 140
  },
  {
    "id": "Q155-WIND-TOMB",
    "name": "高地風墓外層記錄",
    "tier": "C",
    "min_level": 22,
    "max_level": 44,
    "type": "偵察",
    "description": "學者只委託記錄風墓外層構造，不得進行破壞性挖掘。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-WIND-TOMB",
      "target": 3
    },
    "reward": [
      118,
      170
    ],
    "recommended_locations": [
      "D-WIND-TOMB"
    ],
    "xp_reward": 140
  },
  {
    "id": "Q155-GREYPEAK-KEEP",
    "name": "邊牆廢堡警戒圖",
    "tier": "C",
    "min_level": 23,
    "max_level": 45,
    "type": "偵察",
    "description": "邊境守軍需要更新廢堡警戒圖，請完成三次探索並確認退路。",
    "objective": {
      "kind": "action",
      "action": "探索",
      "location_id": "D-GREYPEAK-KEEP",
      "target": 3
    },
    "reward": [
      122,
      178
    ],
    "recommended_locations": [
      "D-GREYPEAK-KEEP"
    ],
    "xp_reward": 140
  }
].map(q=>({...questDefaults,...q})));
  appendUnique("shop_quests",[
  {
    "id": "SQ155-ALC-MUSHROOM",
    "facility": "alchemy",
    "name": "乾燥菇材急缺",
    "tier": "F",
    "min_level": 1,
    "max_level": 8,
    "reward": [
      9,
      15
    ],
    "desc": "煉金店需要一批可乾燥處理的普通蘑菇。",
    "objective": {
      "kind": "gather",
      "item_id": "I-MUSHROOM",
      "target": 3,
      "consume_on_turnin": true
    },
    "recommended_locations": [
      "L-WOOD",
      "D-AQUEDUCT",
      "D-CELLAR"
    ],
    "xp_reward": 12
  },
  {
    "id": "SQ155-ALC-GLOW",
    "facility": "alchemy",
    "name": "幽光菇液補單",
    "tier": "E",
    "min_level": 5,
    "max_level": 15,
    "reward": [
      24,
      39
    ],
    "desc": "夜行藥劑的底液不足，需要兩份幽光菇樣本。",
    "objective": {
      "kind": "gather",
      "item_id": "MAT-HERB-07",
      "target": 2,
      "consume_on_turnin": true
    },
    "recommended_locations": [
      "L-MISTWOOD",
      "L-GREYPEAK-PINES"
    ],
    "xp_reward": 28
  },
  {
    "id": "SQ155-CH-HERB",
    "facility": "church",
    "name": "救助室草藥補充",
    "tier": "F",
    "min_level": 1,
    "max_level": 8,
    "reward": [
      9,
      15
    ],
    "desc": "教會救助室需要補充可處理擦傷的普通止血草。",
    "objective": {
      "kind": "gather",
      "item_id": "I-HERB",
      "target": 4,
      "consume_on_turnin": true
    },
    "recommended_locations": [
      "L-WOOD",
      "L-RIVER",
      "L-LOWFIELD"
    ],
    "xp_reward": 12
  },
  {
    "id": "SQ155-CH-BANDAGE",
    "facility": "church",
    "name": "旅人救濟繃帶",
    "tier": "F",
    "min_level": 1,
    "max_level": 8,
    "reward": [
      8,
      14
    ],
    "desc": "長途旅人增加，教會需要乾淨繃帶補充救濟箱。",
    "objective": {
      "kind": "item",
      "item_id": "I-BANDAGE",
      "target": 3,
      "consume_on_turnin": true
    },
    "recommended_locations": [],
    "xp_reward": 12
  }
].map(q=>({...facilityDefaults,...q,turnin_facility:q.facility})));
  appendUnique("adventure_event_templates",[
  {
    "id": "AE155-GRAYOAK-MARKER",
    "name": "倒伏的林徑標樁",
    "tier": "F",
    "kinds": [
      "wild"
    ],
    "zones": [
      "town_outskirts"
    ],
    "location_ids": [
      "L-WOOD",
      "L-BIRCH"
    ],
    "stat": "力量",
    "dc": 10,
    "text": "林徑標樁被雨水沖倒，岔路上的腳印已開始混在一起。",
    "success": "你重新立穩標樁，並把危險岔路用枯枝封住。",
    "fail": "濕土撐不住標樁，你只來得及留下臨時記號。",
    "reward": {
      "money": [
        2,
        4
      ],
      "reputation": 1
    },
    "failure": {
      "fatigue": 2
    }
  },
  {
    "id": "AE155-RIVER-GAUGE",
    "name": "失準的河岸水標",
    "tier": "F",
    "kinds": [
      "wild"
    ],
    "zones": [
      "town_outskirts"
    ],
    "location_ids": [
      "L-RIVER",
      "L-WHITESTONE-RIVER"
    ],
    "stat": "智力",
    "dc": 11,
    "text": "河岸水標被漂木撞歪，照著它判斷水位可能誤導渡河者。",
    "success": "你比對舊刻痕修正角度，並把異常記錄交給巡河人。",
    "fail": "水流妨礙測量，你只能先掛上警示布條。",
    "reward": {
      "money": [
        2,
        5
      ],
      "event_clock": 1
    }
  },
  {
    "id": "AE155-FIELD-DITCH",
    "name": "堵塞的田間水溝",
    "tier": "F",
    "kinds": [
      "wild"
    ],
    "zones": [
      "town_outskirts"
    ],
    "location_ids": [
      "L-LOWFIELD",
      "L-WHITESTONE-FIELDS"
    ],
    "stat": "體力",
    "dc": 10,
    "text": "枯葉和淤泥堵住水溝，水正慢慢漫向低田。",
    "success": "你清開最窄的一段，積水重新流回支渠。",
    "fail": "淤泥比預想更深，只能通知附近農戶處理。",
    "reward": {
      "item_pool": [
        "I-BREAD",
        "I-BERRY"
      ],
      "item_qty": [
        1,
        2
      ]
    },
    "failure": {
      "fatigue": 3
    }
  },
  {
    "id": "AE155-QUARRY-LEDGER",
    "name": "採坑邊的濕帳頁",
    "tier": "E",
    "kinds": [
      "wild"
    ],
    "zones": [
      "town_outskirts"
    ],
    "location_ids": [
      "L-QUARRY",
      "L-REDCLIFF"
    ],
    "stat": "智力",
    "dc": 12,
    "text": "石縫裡卡著幾頁被雨浸濕的採料帳，仍看得見車次與礦色記號。",
    "success": "你整理出可辨識的紀錄，交給地方礦務人員核對。",
    "fail": "墨跡化開太嚴重，只能辨認出日期。",
    "reward": {
      "money": [
        4,
        8
      ],
      "event_clock": 1
    }
  },
  {
    "id": "AE155-MARSH-LANTERN",
    "name": "沼地廢棄引路燈",
    "tier": "E",
    "kinds": [
      "wild"
    ],
    "zones": [
      "town_outskirts"
    ],
    "location_ids": [
      "L-MARSH"
    ],
    "stat": "意志",
    "dc": 12,
    "text": "蘆葦間掛著一盞熄滅的引路燈，燈座旁有近期踩踏痕跡。",
    "success": "你確認這是採藥人留下的撤退標記，並補上乾燥燈芯。",
    "fail": "霧氣遮住足跡方向，你沒有離開安全地面。",
    "reward": {
      "item_pool": [
        "I-HERB",
        "I-MINT"
      ],
      "item_qty": [
        1,
        2
      ],
      "event_clock": 1
    },
    "failure": {
      "fatigue": 2
    }
  },
  {
    "id": "AE155-PASS-ROPE",
    "name": "山徑斷裂的扶繩",
    "tier": "D",
    "kinds": [
      "wild"
    ],
    "zones": [
      "frontier"
    ],
    "location_ids": [
      "L-PASS",
      "L-GREYPEAK-RIDGE"
    ],
    "stat": "敏捷",
    "dc": 13,
    "text": "一段扶繩被落石割斷，狹窄轉角只剩鬆動的木樁。",
    "success": "你利用舊繩重新打結固定，至少能讓下一隊安全通過。",
    "fail": "木樁承重不足，你改以石堆標出危險處。",
    "reward": {
      "money": [
        6,
        10
      ],
      "reputation": 1
    },
    "failure": {
      "fatigue": 4
    }
  },
  {
    "id": "AE155-OLDROAD-STONE",
    "name": "古王道里程石",
    "tier": "D",
    "kinds": [
      "wild"
    ],
    "zones": [
      "frontier"
    ],
    "location_ids": [
      "L-OLDROAD"
    ],
    "stat": "智力",
    "dc": 13,
    "text": "半埋的里程石露出兩行舊刻字，方向和現行道路略有偏差。",
    "success": "你辨認出它指向已廢棄的渡口，留下可供公會查證的拓記。",
    "fail": "刻字磨損嚴重，你沒有把猜測當成史實。",
    "reward": {
      "event_clock": 1,
      "skill_xp_gain": 5
    }
  },
  {
    "id": "AE155-MOONLAKE-NET",
    "name": "纏住水鳥的廢網",
    "tier": "E",
    "kinds": [
      "wild"
    ],
    "zones": [
      "frontier"
    ],
    "location_ids": [
      "L-MOONLAKE"
    ],
    "stat": "敏捷",
    "dc": 12,
    "text": "舊漁網纏在蘆葦根部，一隻水鳥正努力掙脫。",
    "success": "你割開打結處放走水鳥，也收起會繼續傷害動物的廢網。",
    "fail": "水鳥先自行掙脫飛走，你只能清理岸邊剩餘網線。",
    "reward": {
      "item_pool": [
        "I-RAWFISH"
      ],
      "item_qty": [
        1,
        1
      ],
      "reputation": 1
    }
  },
  {
    "id": "AE155-ASHGROVE-EMBER",
    "name": "尚有餘溫的灰坑",
    "tier": "C",
    "kinds": [
      "wild"
    ],
    "zones": [
      "deep_wild"
    ],
    "location_ids": [
      "L-ASHGROVE"
    ],
    "stat": "智力",
    "dc": 15,
    "text": "灰坑表面已冷，深處卻仍有餘溫，周圍沒有正常營火留下的食物殘渣。",
    "success": "你辨認出多次覆土的痕跡，記下風向與腳印供後續調查。",
    "fail": "灰層彼此混雜，你只確定這不是今天留下的火。",
    "reward": {
      "event_clock": 1,
      "skill_xp_gain": 7
    },
    "failure": {
      "fatigue": 3
    }
  },
  {
    "id": "AE155-STARMOOR-GLASS",
    "name": "荒原風蝕玻璃片",
    "tier": "C",
    "kinds": [
      "wild"
    ],
    "zones": [
      "deep_wild"
    ],
    "location_ids": [
      "L-STARMOOR"
    ],
    "stat": "幸運",
    "dc": 15,
    "text": "黑砂間露出一片被高熱熔融又風蝕的玻璃狀薄片。",
    "success": "你在不破壞周邊地層的前提下取下小樣，記錄原位。",
    "fail": "薄片一觸即碎，你只留下圖記。",
    "reward": {
      "money": [
        8,
        12
      ],
      "event_clock": 1
    }
  },
  {
    "id": "AE155-AQUEDUCT-GATE",
    "name": "卡死的舊水門",
    "tier": "E",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-AQUEDUCT",
      "D-WHITESTONE-CISTERN"
    ],
    "stat": "力量",
    "dc": 12,
    "text": "鏽蝕水門卡在半開位置，水流讓地面越來越滑。",
    "success": "你清掉轉軸碎石，讓水門回到可控的位置。",
    "fail": "機構太脆弱，你停止施力並標出危險點。",
    "reward": {
      "money": [
        4,
        8
      ],
      "reputation": 1
    },
    "failure": {
      "fatigue": 3
    }
  },
  {
    "id": "AE155-WATCH-RECORDS",
    "name": "牆縫裡的巡夜簿",
    "tier": "E",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-WATCH",
      "D-WHITESTONE-FORT"
    ],
    "stat": "智力",
    "dc": 12,
    "text": "石牆夾層中塞著殘破巡夜簿，最後幾頁只剩輪值符號。",
    "success": "你依墨色與紙張順序復原出最後一段值勤紀錄。",
    "fail": "紙張一碰就剝落，你停止翻動以免毀損。",
    "reward": {
      "event_clock": 1,
      "skill_xp_gain": 4
    }
  },
  {
    "id": "AE155-MINE-SUPPORT",
    "name": "發出裂聲的舊支柱",
    "tier": "D",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-MINE",
      "D-GREYPEAK-MINE"
    ],
    "stat": "意志",
    "dc": 14,
    "text": "礦道木柱傳出細碎裂聲，落塵正從橫樑接縫滑下。",
    "success": "你辨認受力方向，繞開危險段並留下清楚標記。",
    "fail": "你無法確認哪一根先斷，只能立刻後撤。",
    "reward": {
      "event_clock": 1,
      "skill_xp_gain": 6
    },
    "failure": {
      "fatigue": 4
    }
  },
  {
    "id": "AE155-SALT-OFFERING",
    "name": "鹽殼下的祭盤",
    "tier": "D",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-SALT-CRYPT"
    ],
    "stat": "意志",
    "dc": 14,
    "text": "石盤被厚鹽殼覆蓋，只露出與現代禮儀不同的排列痕跡。",
    "success": "你只做非破壞性記錄，沒有擅自移動任何葬祭物。",
    "fail": "鹽殼太脆，你放棄清理以免破壞原貌。",
    "reward": {
      "reputation": 1,
      "event_clock": 1
    }
  },
  {
    "id": "AE155-WIND-BELLS",
    "name": "無風自響的石片",
    "tier": "C",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-WIND-TOMB",
      "D-SHRINE"
    ],
    "stat": "智力",
    "dc": 15,
    "text": "薄石片懸在狹縫中，氣流通過時發出彼此呼應的低聲。",
    "success": "你找出聲音來自隱蔽風道，排除立即性的超自然威脅。",
    "fail": "回聲來源太多，你沒有深入狹縫冒險。",
    "reward": {
      "event_clock": 1,
      "skill_xp_gain": 7
    }
  },
  {
    "id": "AE155-CATACOMB-MARKS",
    "name": "重複出現的封門記號",
    "tier": "C",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-CATACOMB"
    ],
    "stat": "意志",
    "dc": 15,
    "text": "數道封門記號年代不同，卻都刻意避開同一塊石板。",
    "success": "你分辨出記號先後，確認石板後方應暫時視為危險區。",
    "fail": "年代與刻法互相矛盾，你沒有貿然解除封門。",
    "reward": {
      "reputation": 1,
      "event_clock": 1,
      "skill_xp_gain": 6
    }
  },
  {
    "id": "AE155-MIST-HUT-TRAP",
    "name": "鏽死的獵舍機括",
    "tier": "D",
    "kinds": [
      "dungeon"
    ],
    "zones": [
      "dungeon"
    ],
    "location_ids": [
      "D-MIST-HUT"
    ],
    "stat": "敏捷",
    "dc": 14,
    "text": "門框下藏著老舊機括，繩索雖腐爛，金屬彈臂仍帶張力。",
    "success": "你卸掉張力並把零件集中，避免後來者誤觸。",
    "fail": "機括突然鬆脫，你及時退開但耗了不少力氣。",
    "reward": {
      "money": [
        6,
        10
      ],
      "reputation": 1
    },
    "failure": {
      "fatigue": 5
    }
  }
]);
  appendUnique("regional_rumors",[
  {
    "id": "RUMOR-155-01",
    "region_id": "REG-18",
    "theme": "水路",
    "public_claim": "白石河中游的舊水標比去年偏了一掌，有船夫懷疑河床正在改道。",
    "reliability": "中",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-02",
    "region_id": "REG-18",
    "theme": "礦務",
    "public_claim": "灰峰舊鐵礦最近有人在廢礦車上發現紅色晶屑，但礦務所還沒確認來源。",
    "reliability": "低",
    "truth_mode": "contested",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-03",
    "region_id": "REG-18",
    "theme": "道路",
    "public_claim": "風裂山徑有兩段扶繩被割斷，究竟是落石還是人為仍沒有定論。",
    "reliability": "中",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-04",
    "region_id": "REG-18",
    "theme": "商路",
    "public_claim": "綠灣鎮的鹽車改走北線後，柳橋鎮的醃肉價錢可能會短期上揚。",
    "reliability": "中",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-05",
    "region_id": "REG-18",
    "theme": "遺跡",
    "public_claim": "古王道殘段的里程石似乎指向一座已不在地圖上的渡口。",
    "reliability": "低",
    "truth_mode": "exaggerated",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-06",
    "region_id": "REG-18",
    "theme": "生態",
    "public_claim": "霧松林的幽光菇今年提早出現，採藥人認為與連日濕冷有關。",
    "reliability": "中",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-07",
    "region_id": "REG-18",
    "theme": "治安",
    "public_claim": "沉橋舊堡附近的腳印不像固定營地，更像幾支小隊輪流借道。",
    "reliability": "低",
    "truth_mode": "contested",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-08",
    "region_id": "REG-18",
    "theme": "民生",
    "public_claim": "白石丘農帶正在補修水溝，近期會增加短工與運糧委託。",
    "reliability": "高",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-09",
    "region_id": "REG-18",
    "theme": "祭俗",
    "public_claim": "鹽風墓室外有人留下新鮮花束，但附近村落沒人承認是自己送的。",
    "reliability": "低",
    "truth_mode": "contested",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  },
  {
    "id": "RUMOR-155-10",
    "region_id": "REG-18",
    "theme": "天候",
    "public_claim": "風牧高地的牧人說今年側風轉早，轉場時間可能提前。",
    "reliability": "中",
    "truth_mode": "plausible",
    "source_pool": [
      "酒館",
      "旅店",
      "市場",
      "守衛",
      "公會",
      "商隊",
      "獵人",
      "地方居民"
    ],
    "verification": "rumor",
    "generator_uses": [
      "NPC對話",
      "情報系統",
      "探索提示",
      "委託前置線索",
      "錯誤情報"
    ],
    "rule": "傳聞只能成為可調查線索，不得直接改寫CURRENT canonical狀態。"
  }
]);
  appendUnique("regional_life_events",[
  {
    "id": "RLE-155-01",
    "region_id": "REG-18",
    "kind": "river_maintenance",
    "name": "白石河水標巡檢",
    "text": "船夫、巡河人與地方工匠共同核對水位石、纜繩樁與淺灘變化。",
    "impact": "增加水路巡查、修繕與短途護送委託；不保證河道永久安全。"
  },
  {
    "id": "RLE-155-02",
    "region_id": "REG-18",
    "kind": "forest_rotation",
    "name": "灰橡林採集輪休",
    "text": "巡林者依採集壓力輪流封閉小片林地，讓草藥與幼木恢復。",
    "impact": "部分資源點短期減產，其它合法採集區需求提高。"
  },
  {
    "id": "RLE-155-03",
    "region_id": "REG-18",
    "kind": "mine_inspection",
    "name": "灰峰舊礦安全複查",
    "text": "礦務人員重新標示塌陷區、舊支柱與可通行礦道。",
    "impact": "生成測繪、礦樣與撤退路線委託，不直接恢復大規模採礦。"
  },
  {
    "id": "RLE-155-04",
    "region_id": "REG-18",
    "kind": "pasture_shift",
    "name": "風牧高地轉場期",
    "text": "牧群依風向與水草狀況在高地石圈間移動。",
    "impact": "增加牧道巡查、失物與野獸驅離事件。"
  },
  {
    "id": "RLE-155-05",
    "region_id": "REG-18",
    "kind": "caravan_pressure",
    "name": "北線商隊改道",
    "text": "山徑落石或河道水位會讓商隊在柳橋、白石與灰峰之間改走替代線。",
    "impact": "地區進口價格小幅波動，補給委託依市場飽和度調整。"
  },
  {
    "id": "RLE-155-06",
    "region_id": "REG-18",
    "kind": "ruin_preservation",
    "name": "地方遺構封存週",
    "text": "學者、公會與地方守衛暫時限制破壞性挖掘，只接受記錄與測繪。",
    "impact": "遺跡探索偏向非破壞調查，稀有物不因活動無限產出。"
  }
]);
  appendUnique("cultural_festivals",[
  {
    "id": "FEST-155-01",
    "name": "白石河定標日",
    "culture_id": "CUL-018",
    "region_id": "REG-18",
    "season": "春季",
    "timing": "春中",
    "public": true,
    "activities": [
      "巡河人重畫水標",
      "橋工檢查繩樁",
      "居民在河岸交換乾糧"
    ],
    "gameplay_hooks": [
      "水路巡查",
      "修繕材料",
      "失物與短途護送"
    ],
    "rule": "節慶只改變地方活動與有限供需，不保證大型事件。"
  },
  {
    "id": "FEST-155-02",
    "name": "灰峰熄爐夜",
    "culture_id": "CUL-018",
    "region_id": "REG-18",
    "season": "冬季",
    "timing": "冬初",
    "public": true,
    "activities": [
      "工匠輪流熄爐檢修",
      "礦工追悼事故亡者",
      "行會公開安全紀錄"
    ],
    "gameplay_hooks": [
      "礦道測繪",
      "工具修繕",
      "地方史與工匠對話"
    ],
    "rule": "紀念活動不得被生成器改寫為神蹟或全境災變。"
  }
]);
  appendUnique("local_historical_incidents",[
  {
    "id": "LOCAL-HIST-155-01",
    "region_id": "REG-18",
    "year": 146,
    "title": "白石河第二次改標",
    "summary": "連續兩年春洪使中游淺灘移位，地方船夫與橋工共同重設水標。",
    "verification": "recorded",
    "world_scale": false,
    "generator_uses": [
      "地方誌",
      "NPC閒談",
      "遺跡線索",
      "區域委託",
      "節慶／紀念日"
    ],
    "rule": "地方微歷史不自動升格為影響全大陸的重大事件。"
  },
  {
    "id": "LOCAL-HIST-155-02",
    "region_id": "REG-18",
    "year": 233,
    "title": "灰峰礦道封閉令",
    "summary": "一次支柱連鎖倒塌後，礦務所封閉三條深層舊道，僅保留外環巡檢。",
    "verification": "recorded",
    "world_scale": false,
    "generator_uses": [
      "地方誌",
      "NPC閒談",
      "遺跡線索",
      "區域委託",
      "節慶／紀念日"
    ],
    "rule": "地方微歷史不自動升格為影響全大陸的重大事件。"
  },
  {
    "id": "LOCAL-HIST-155-03",
    "region_id": "REG-18",
    "year": 271,
    "title": "沉橋舊堡退役",
    "summary": "新商路與河橋完工後，沉橋舊堡失去常駐守軍，只保留季節性巡查。",
    "verification": "recorded",
    "world_scale": false,
    "generator_uses": [
      "地方誌",
      "NPC閒談",
      "遺跡線索",
      "區域委託",
      "節慶／紀念日"
    ],
    "rule": "地方微歷史不自動升格為影響全大陸的重大事件。"
  },
  {
    "id": "LOCAL-HIST-155-04",
    "region_id": "REG-18",
    "year": 309,
    "title": "風牧高地石圈修復",
    "summary": "牧戶與灰峰工匠修復三座避風石圈，重新建立高地轉場路線。",
    "verification": "recorded",
    "world_scale": false,
    "generator_uses": [
      "地方誌",
      "NPC閒談",
      "遺跡線索",
      "區域委託",
      "節慶／紀念日"
    ],
    "rule": "地方微歷史不自動升格為影響全大陸的重大事件。"
  }
]);
  appendUnique("regional_folklore",[
  {
    "id": "FOLK-155-01",
    "region_id": "REG-18",
    "title": "灰峰會記住敲擊聲",
    "text": "老礦工說同一處若連敲三次仍沒有回音，就代表山體正在『吞聲』，其實多半是提醒新人注意鬆軟岩層。",
    "verification": "oral_tradition",
    "generator_uses": [
      "酒館閒談",
      "兒童故事",
      "旅行警告",
      "地方奇遇",
      "錯誤線索／真線索混合"
    ],
    "truth_rule": "傳說本身可存在，但不得自動把超自然解釋視為客觀事實。"
  },
  {
    "id": "FOLK-155-02",
    "region_id": "REG-18",
    "title": "風牧石圈不留空位",
    "text": "牧人過夜會在石圈入口留一塊小石，表示仍有人在外巡看，後來被說成是替風靈保留座位。",
    "verification": "oral_tradition",
    "generator_uses": [
      "酒館閒談",
      "兒童故事",
      "旅行警告",
      "地方奇遇",
      "錯誤線索／真線索混合"
    ],
    "truth_rule": "傳說本身可存在，但不得自動把超自然解釋視為客觀事實。"
  },
  {
    "id": "FOLK-155-03",
    "region_id": "REG-18",
    "title": "鹽風花束",
    "text": "有人說無名花束會替迷路者記住歸途，也有人認為只是祭掃者不願暴露家族關係。",
    "verification": "oral_tradition",
    "generator_uses": [
      "酒館閒談",
      "兒童故事",
      "旅行警告",
      "地方奇遇",
      "錯誤線索／真線索混合"
    ],
    "truth_rule": "傳說本身可存在，但不得自動把超自然解釋視為客觀事實。"
  },
  {
    "id": "FOLK-155-04",
    "region_id": "REG-18",
    "title": "里程石背面的路",
    "text": "孩童相信古王道里程石背後藏著另一條路；巡路人則說那只是教孩子不要離開正面可見的官道。",
    "verification": "oral_tradition",
    "generator_uses": [
      "酒館閒談",
      "兒童故事",
      "旅行警告",
      "地方奇遇",
      "錯誤線索／真線索混合"
    ],
    "truth_rule": "傳說本身可存在，但不得自動把超自然解釋視為客觀事實。"
  }
]);

  const pack=(DB.generator_material_packs||[]).find(x=>x.region_id==="REG-18");
  if(pack){
    const merge=(key,ids)=>pack[key]=[...new Set([...(pack[key]||[]),...ids])];
    merge("festival_ids",["FEST-155-01","FEST-155-02"]);
    merge("local_history_ids",["LOCAL-HIST-155-01","LOCAL-HIST-155-02","LOCAL-HIST-155-03","LOCAL-HIST-155-04"]);
    merge("folklore_ids",["FOLK-155-01","FOLK-155-02","FOLK-155-03","FOLK-155-04"]);
    merge("rumor_ids",["RUMOR-155-01","RUMOR-155-02","RUMOR-155-03","RUMOR-155-04","RUMOR-155-05","RUMOR-155-06","RUMOR-155-07","RUMOR-155-08","RUMOR-155-09","RUMOR-155-10"]);
    pack.quest_motifs=[...new Set([...(pack.quest_motifs||[]),"非破壞測繪","水路巡檢","礦道安全","季節轉場"])];
    pack.exploration_motifs=[...new Set([...(pack.exploration_motifs||[]),"河岸水標","高地石圈","封閉礦道","退役邊堡"])];
  }

  DB.content_depth_system={
    version:"CONTENT-DEPTH-1.0",
    release:"CURRENT-1.55.0",
    focus_region:"REG-18",
    counts:{guild_quests:15,facility_quests:4,location_events:17,rumors:10,life_events:6,festivals:2,local_histories:4,folklore:4},
    rules:[
      "地點奇遇必須通過location_ids、kind、zone與tier四重篩選。",
      "新增委託只引用既有物品與可達地點，回報仍受市場飽和度與每日收購資金限制。",
      "地方傳聞與民俗不得自動升格為正史；非破壞性調查優先於遺跡掠奪。",
      "內容補丁只追加唯一ID，不重建角色、不清空localStorage、不改既有存檔schema。"
    ],
    save_schema_changed:false,
    existing_save_compatible:true
  };
  DB.meta.current_version="CURRENT-1.55.0";
  DB.meta.content_depth_revision="CONTENT-DEPTH-1.0";
  // MONSTER-THREAT-1.0：成年普通敵人與弱小生物威脅分層。
  const monsterThreatBaseline={"F":{"hp":34,"attack":12,"defense":5,"accuracy":68,"damage":[4,8]},"E":{"hp":48,"attack":16,"defense":8,"accuracy":70,"damage":[5,10]},"D":{"hp":72,"attack":21,"defense":11,"accuracy":72,"damage":[7,14]},"C":{"hp":105,"attack":28,"defense":16,"accuracy":74,"damage":[10,20]},"B":{"hp":155,"attack":38,"defense":23,"accuracy":77,"damage":[13,27]},"A":{"hp":220,"attack":50,"defense":30,"accuracy":80,"damage":[17,35]},"S":{"hp":320,"attack":65,"defense":38,"accuracy":83,"damage":[22,45]}};
  const harmlessMonsterIds=new Set(["MON14-001","MON14-025","MON14-026","MON14-022","LEGACY-MON-001","LEGACY-MON-009","MON14-030","MON14-180"]);
  const harmlessMonsterNames=new Set(["野兔","幼年山羊","貓頭鷹"]);
  for(const monster of DB.monsters||[]){
    const base=monsterThreatBaseline[monster.tier];
    if(!base)continue;
    const harmless=harmlessMonsterIds.has(monster.id)||harmlessMonsterNames.has(monster.name);
    if(harmless){
      monster.threat_profile="harmless";
      monster.harmless_at_level_1=true;
      continue;
    }
    const eliteOrBoss=monster.lore_role==="菁英"||monster.lore_role==="高階首領"||["C","B","A","S"].includes(monster.tier);
    monster.threat_profile=eliteOrBoss?"elite_or_boss":"standard_adult";
    monster.harmless_at_level_1=false;
    monster.hp=Math.max(Number(monster.hp||0),base.hp);
    monster.attack=Math.max(Number(monster.attack||0),base.attack);
    monster.defense=Math.max(Number(monster.defense||0),base.defense);
    monster.accuracy=Math.max(Number(monster.accuracy||0),base.accuracy);
    const oldDamage=Array.isArray(monster.damage)?monster.damage:[0,0];
    monster.damage=[Math.max(Number(oldDamage[0]||0),base.damage[0]),Math.max(Number(oldDamage[1]||0),base.damage[1])];
  }
  DB.monster_threat_balance={
    version:"MONSTER-THREAT-1.0",
    release:"CURRENT-1.57.0",
    total_monsters:(DB.monsters||[]).length,
    harmless_level_1_ids:[...harmlessMonsterIds],
    harmless_level_1_names:[...harmlessMonsterNames],
    baselines:monsterThreatBaseline,
    rules:[
      "野兔、幼年山羊、貓頭鷹等弱小或非戰鬥生物可維持低威脅。",
      "成年普通敵人即使位於F級，也必須能對穿戴起始裝備的1級角色造成可感知傷害。",
      "怪物威脅依階級遞增；C級以上維持菁英／首領級，不得出現在低階普通遭遇。",
      "只提高怪物資料基線，不修改角色初始數值、戰鬥公式、存檔結構、掉落規則或生態棲地限制。"
    ],
    changed_by_tier:{"F":14,"E":36,"D":45,"B":43,"C":47,"A":13,"S":4},
    harmless_count:8
  };
  DB.meta.current_version="CURRENT-1.57.0";
  DB.meta.monster_threat_revision="MONSTER-THREAT-1.0";

})();
