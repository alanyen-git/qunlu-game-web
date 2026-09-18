/*
 * 群陸旅誌 CURRENT-1.65.3
 * 阿斯戴爾內容整合相容層。
 * 載入順序：game-data.js -> data-patches.js -> asdail-depth-v2.js -> 本檔 -> runtime.js
 * 目的：把區域擴充資料正規化到 CURRENT schema，不關閉任何自檢。
 */
(()=>{
  if(typeof DB!=="object"||!DB)return;
  const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[t]??0);
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  const add=(arr,row)=>{if(Array.isArray(arr)&&row?.id&&!arr.some(x=>x?.id===row.id))arr.push(row)};
  const isAsd=x=>!!x&&(String(x.id||"").startsWith("ASD")||x.region_id==="REG-ASD-01"||x.world_region_id==="REG-ASD-01");
  const itemBy=id=>(DB.items||[]).find(x=>x.id===id);
  const locBy=id=>(DB.locations||[]).find(x=>x.id===id);
  const monBy=id=>(DB.monsters||[]).find(x=>x.id===id);

  // 1) 地圖 schema、安全度、城鎮設施與採集層級。
  const safetyFor=l=>{
    if(l.kind==="town")return {F:95,E:93,D:91,C:89,B:87,A:85,S:83}[l.tier]??90;
    if(l.kind==="dungeon")return {F:62,E:54,D:44,C:34,B:24,A:16,S:10}[l.tier]??40;
    return {F:82,E:72,D:60,C:48,B:36,A:24,S:14}[l.tier]??60;
  };
  const safetyLabel=n=>n>=90?"高度安全":n>=75?"安全":n>=60?"需警戒":n>=45?"危險":n>=30?"高危險":"極高危險";
  const facilityMap=s=>{
    const out=[];
    if(/冒險者|公會櫃檯|公會辦事處/.test(s))out.push("guild");
    if(/教會|教堂/.test(s))out.push("church");
    if(/鍛造|鐵匠|工坊|修車/.test(s))out.push("blacksmith");
    if(/酒館/.test(s))out.push("tavern");
    if(/藥草|煉金/.test(s))out.push("alchemy");
    if(/救護|醫療|傷兵/.test(s))out.push("clinic");
    if(/驛站/.test(s))out.push("inn");
    if(/市場|市集|交易|商路|糧價|海關|鹽場|糧倉|蜂農|亞麻倉|礦材/.test(s))out.push("general");
    return out
  };
  for(const l of DB.locations||[]){
    if(!isAsd(l))continue;
    l.world_region_id=l.world_region_id||l.region_id||"REG-ASD-01";
    l.province_region_id=l.province_region_id||l.province_id||null;
    if(l.kind==="town")l.settlement_world_tier=l.settlement_world_tier||l.world_tier||l.tier;
    if(!Number.isFinite(l.safety_score))l.safety_score=safetyFor(l);
    if(!l.safety_label)l.safety_label=safetyLabel(l.safety_score);
    l.encounter_profile=l.encounter_profile||{};
    l.encounter_profile.max_tier=l.encounter_profile.max_tier||l.tier;
    l.encounter_tags=uniq([...(l.encounter_tags||[]),l.id,l.encounter_profile.zone]);
    if(l.kind==="town"&&Array.isArray(l.facilities)){
      const original=[...l.facilities];
      const canonical=uniq(original.flatMap(x=>DB.facilities?.[x]?[x]:facilityMap(String(x))));
      l.local_facilities=uniq([...(l.local_facilities||[]),...original.filter(x=>!DB.facilities?.[x])]);
      l.facilities=canonical.length?canonical:["guild","general"];
    }
    if(Array.isArray(l.gather)){
      l.gather=uniq(l.gather).filter(id=>{
        const d=itemBy(id);
        return !d||rank(d.tier)<=rank(l.tier);
      });
      for(const id of l.gather){const d=itemBy(id);if(d&&isAsd(d)&&d.wild_gather_eligible!==true)d.wild_gather_eligible=true}
    }
  }

  // 區域特定任務來源：礦粉可採集、舊軍牌可在舊堡搜索。
  const sourceAdds={
    "ASD-DUNGEON-RED-FURNACE":["ITEM-ASD-RED-OREDUST"],
    "ASD-DUNGEON-GRAY-FORT":["ITEM-ASD-GRAY-IDOL"]
  };
  for(const [lid,ids] of Object.entries(sourceAdds)){
    const l=locBy(lid);if(!l)continue;l.gather=uniq([...(l.gather||[]),...ids]);
    for(const id of ids){const d=itemBy(id);if(d)d.wild_gather_eligible=true}
  }

  // 2) 四層地圖層級欄位正規化。
  for(const m of DB.province_region_maps||[]){
    if(m.region_id!=="REG-ASD-01"&&!String(m.id||"").startsWith("PROV-ASD"))continue;
    m.parent_realm_map_id=m.parent_realm_map_id||"MAP-ASD-01";
    m.capital_location_id=m.capital_location_id||m.hub_id||null;
  }
  for(const m of DB.settlement_region_maps||[]){
    if(!String(m.id||"").startsWith("SET-ASD"))continue;
    m.parent_province_region_id=m.parent_province_region_id||m.province_id||null;
    m.center_location_id=m.center_location_id||m.location_id||null;
    m.location_ids=uniq([...(m.location_ids||[]),m.location_id,m.center_location_id]);
  }

  // 3) 固定 NPC 與對話：保留 canonical dialogue_database.records，不再覆寫為陣列。
  const npcRows=(DB.regional_npc_archetypes||[]).filter(x=>String(x.id||"").startsWith("NPC-ASD"));
  for(const n of npcRows)n.region_id=n.region_id||"REG-ASD-01";
  if(DB.dialogue_database&&Array.isArray(DB.dialogue_database.records)){
    const speaker=new Map(npcRows.map(x=>[x.id,x]));
    const extra=[...(DB.npc_dialogues||[])];
    for(const d of extra){
      if(!String(d.id||"").startsWith("DIA-ASD")||DB.dialogue_database.records.some(x=>x.id===d.id))continue;
      DB.dialogue_database.records.push({...d});
    }
    for(const d of DB.dialogue_database.records){
      if(!String(d.id||"").startsWith("DIA-ASD"))continue;
      const n=speaker.get(d.speaker_id);
      d.facility=d.facility||"guild";
      d.speaker_role=d.speaker_role||n?.role||"阿斯戴爾居民";
      d.tier_ceiling=d.tier_ceiling||"C";
      d.time_tag=d.time_tag||"day";
      d.weight=Number.isFinite(d.weight)?d.weight:1;
      d.world_region_id=d.world_region_id||"REG-ASD-01";
    }
  }

  // 4) 組織與流派採 CURRENT 會員加成 schema。
  const orgEffect=o=>{
    if(o.kind==="trade")return {buy_price_pct:-2};
    if(o.kind==="craft")return {craft_success:2};
    if(o.kind==="military")return {defense_pct:2};
    if(o.kind==="ranger")return {perception:3};
    if(o.kind==="medical")return {healingPower:3};
    if(String(o.kind).includes("religious"))return {statusResist:3};
    return {quest_reward_pct:2}
  };
  const orgFacility=o=>{
    if(o.kind==="craft")return String(o.name).includes("煉金")?"alchemy":"blacksmith";
    if(o.kind==="medical")return "clinic";
    if(String(o.kind).includes("religious"))return "church";
    return "guild"
  };
  for(const o of DB.world_organizations||[]){
    if(!String(o.id||"").startsWith("ORG-ASD"))continue;
    o.alignment=o.alignment||"neutral";
    o.primary_facility=o.primary_facility||orgFacility(o);
    if(o.joinable==null)o.joinable=true;
    if(o.mission_issuer==null)o.mission_issuer=true;
    if(o.can_be_enemy==null)o.can_be_enemy=true;
    if(!o.member_bonus?.id)o.member_bonus={id:`MB-${o.id}`,text:`${o.name}正式成員的地方協作加成。`,effects:orgEffect(o)};
  }
  const asdLore=(DB.lore_records||[]).filter(x=>String(x.id||"").includes("ASD")).map(x=>x.id);
  for(const d of DB.discipline_factions||[]){
    if(!String(d.id||"").startsWith("DISC-ASD"))continue;
    d.primary_facility=d.primary_facility||(String(d.name).includes("護印")?"church":"guild");
    d.contact_location_ids=uniq([...(d.contact_location_ids||[]),d.base_location_id]);
    if(!(d.lore_record_ids||[]).length&&asdLore.length)d.lore_record_ids=[asdLore[rank(d.tier)%asdLore.length]];
    if(!d.member_bonus?.id){
      const b=d.bonus||{},effects={};
      if(Number.isFinite(b.accuracy))effects.accuracy=b.accuracy;
      if(Number.isFinite(b.evasion))effects.evasion=b.evasion;
      if(Number.isFinite(b.defense))effects.defense_pct=b.defense;
      if(Number.isFinite(b.guard_effectiveness))effects.blockRate=Math.max(1,Math.round(b.guard_effectiveness/2));
      if(Number.isFinite(b.rescue_effectiveness))effects.healingPower=Math.max(1,Math.round(b.rescue_effectiveness/2));
      if(Number.isFinite(b.large_monster_damage))effects.armorPenPct=Math.max(1,Math.round(b.large_monster_damage/2));
      if(Number.isFinite(b.status_resist))effects.statusResist=b.status_resist;
      if(Number.isFinite(b.undead_defense))effects.magic_defense_pct=Math.max(1,Math.round(b.undead_defense/2));
      d.member_bonus={id:`MB-${d.id}`,text:`${d.name}正式研習加成。`,effects};
    }
  }

  // 5) 怪物棲地與掉落 profile。顯式 habitat 是作者指定棲地，不應被舊 biome tag 丟棄。
  for(const m of DB.monsters||[]){
    if(!String(m.id||"").startsWith("MON-ASD"))continue;
    m.habitats=uniq([...(m.habitats||[]),...(m.habitat||[])]);
    m.ecology_profile=m.ecology_profile||{body_scale:"medium",tags:[]};
    m.loot_profile={...(m.loot_profile||{}),version:"LOOT-ECOLOGY-1.0",fallback_policy:"none"};
    if(!Array.isArray(m.loot_materials))m.loot_materials=[];
    if(m.encounter_enabled==null)m.encounter_enabled=true;
  }

  // 6) 新版委託語意。hunt 為合法討伐目標；搜索/採樣不應被誤當無限採集物。
  const roadWolf=monBy("LEGACY-MON-002");
  if(roadWolf)roadWolf.habitats=uniq([...(roadWolf.habitats||[]),"ASD-WILD-CROWNROAD"]);
  const quest=id=>(DB.quest_templates||[]).find(x=>x.id===id);
  for(const q of DB.quest_templates||[]){
    if(!String(q.id||"").includes("ASD"))continue;
    if(q.objective?.kind==="action"&&!q.objective.action)q.objective.action="探索";
  }
  const mistQ=quest("Q158-ASD-MIST-LANTERN");
  if(mistQ)mistQ.objective={kind:"action",action:"探索",location_id:"ASD-WILD-MISTPINE",target:2,required_item_id:"ITEM-ASD-MIST-LANTERN"};
  const basaltQ=quest("Q1582-ASD-BASALT-SAMPLE");
  if(basaltQ)basaltQ.objective={kind:"action",action:"探索",location_id:"ASD2-WILD-BASALTHOLLOW",target:2};
  const wetlandEvent=(DB.adventure_event_templates||[]).find(x=>x.id==="AE158-ASD-WETLAND-LIGHT");
  if(wetlandEvent)wetlandEvent.reward={reputation:1,event_clock:1};
  const mistEvent=(DB.adventure_event_templates||[]).find(x=>x.id==="AE158-ASD-MIST-BELL");
  if(mistEvent)mistEvent.reward={reputation:1,event_clock:1};

  // 7) 世界誌：補 verification/scope/index。
  const verifyLevels=Object.keys(DB.lore_system?.verification_levels||{});
  const verifiedKey=["verified","recorded","confirmed","official"].find(x=>verifyLevels.includes(x))||verifyLevels[0];
  const uncertainKey=["unverified","rumor","unknown","oral_tradition"].find(x=>verifyLevels.includes(x))||verifiedKey;
  DB.lore_query_index=DB.lore_query_index||{};
  for(const r of DB.lore_records||[]){
    if(!String(r.id||"").includes("ASD"))continue;
    if(!verifyLevels.includes(r.verification)){
      const uncertain=/傳聞|rumor|unknown|待核/i.test(String(r.status||""));
      r.verification=uncertain?uncertainKey:verifiedKey;
    }
    r.scope_type=r.scope_type||"region";
    r.scope_id=r.scope_id||"REG-ASD-01";
    const k=`${r.scope_type}:${r.scope_id}`;
    DB.lore_query_index[k]=uniq([...(DB.lore_query_index[k]||[]),r.id]);
  }

  // 8) 世界史：依年份自動掛回既有時代/細分時期，並建立地區歷史索引。
  const eras=DB.historical_eras||[],periods=DB.historical_subperiods||[];
  const asdTimeline=[];
  for(const e of DB.world_timeline||[]){
    if(!String(e.id||"").includes("ASD"))continue;
    const er=eras.find(x=>e.year>=x.start_year&&e.year<=x.end_year);
    const pr=periods.find(x=>e.year>=x.start_year&&e.year<=x.end_year);
    if(er)e.era_id=er.id;if(pr)e.subperiod_id=pr.id;
    asdTimeline.push(e.id);
  }
  DB.history_entity_index=DB.history_entity_index||{};
  DB.history_entity_index["REG-ASD-01"]=uniq([...(DB.history_entity_index["REG-ASD-01"]||[]),...asdTimeline]);

  // 9) 區域生成素材包：阿斯戴爾最少 2 微歷史、2 民俗、5 傳聞。
  DB.local_historical_incidents=DB.local_historical_incidents||[];
  DB.regional_folklore=DB.regional_folklore||[];
  DB.regional_rumors=DB.regional_rumors||[];
  const localHist=[
    {id:"LOCAL-HIST-ASD-01",region_id:"REG-ASD-01",year:214,title:"王冠大道第一次全線重標",summary:"王室與地方領主統一里程、橋樑與驛站標記，降低糧運與軍令誤送。",verification:"recorded",world_scale:false},
    {id:"LOCAL-HIST-ASD-02",region_id:"REG-ASD-01",year:286,title:"灰門冬季封徑令",summary:"一次長雪季造成山徑傷亡後，灰門建立季節封徑、烽火與救護交接制度。",verification:"recorded",world_scale:false}
  ];
  const folklore=[
    {id:"FOLK-ASD-01",region_id:"REG-ASD-01",title:"第三聲鐘不追人",text:"霧杉獵人說聽見第三聲鐘時應留在繩標內；這更像長年形成的迷霧安全守則。",verification:"oral_tradition"},
    {id:"FOLK-ASD-02",region_id:"REG-ASD-01",title:"潮線上的第二個繩結",text:"碎浪救難員會在安全繩末端多打一個結，提醒後來者不要把未知繩路當成官方路線。",verification:"oral_tradition"}
  ];
  const rumors=[
    {id:"RUMOR-ASD-01",region_id:"REG-ASD-01",theme:"道路",public_claim:"有人說王冠大道夜裡會自己改變里程；巡路人認為多半是舊路標被移動。",reliability:"低"},
    {id:"RUMOR-ASD-02",region_id:"REG-ASD-01",theme:"糧運",public_claim:"銀穗糧倉近期夜間加派守衛，商人猜測與短期糧價波動有關。",reliability:"中"},
    {id:"RUMOR-ASD-03",region_id:"REG-ASD-01",theme:"北境",public_claim:"灰門以北的烽火曾在無巡邏回報時點亮一次，原因尚未確認。",reliability:"低"},
    {id:"RUMOR-ASD-04",region_id:"REG-ASD-01",theme:"礦務",public_claim:"赤岩部分礦脈被臨時封存，官方理由是熱壓與支柱安全檢查。",reliability:"中"},
    {id:"RUMOR-ASD-05",region_id:"REG-ASD-01",theme:"海岸",public_claim:"碎浪外礁退潮後偶爾會露出舊石構，但救難隊禁止未登記的單獨潛入。",reliability:"中"}
  ];
  for(const x of localHist)add(DB.local_historical_incidents,x);
  for(const x of folklore)add(DB.regional_folklore,x);
  for(const x of rumors)add(DB.regional_rumors,x);
  DB.generator_material_packs=DB.generator_material_packs||[];
  let pack=DB.generator_material_packs.find(x=>x.region_id==="REG-ASD-01");
  if(!pack){
    pack={id:"MATPACK-ASD-01",region_id:"REG-ASD-01",festival_ids:[],local_history_ids:[],folklore_ids:[],rumor_ids:[],quest_motifs:["商路巡查","地方救難","礦務安全","封鎖區許可"],exploration_motifs:["王冠大道","霧杉深林","赤岩熔窟","碎浪潮岸"]};
    DB.generator_material_packs.push(pack);
  }
  pack.festival_ids=uniq([...(pack.festival_ids||[]),...(DB.cultural_festivals||[]).filter(x=>x.region_id==="REG-ASD-01").map(x=>x.id)]);
  pack.local_history_ids=uniq([...(pack.local_history_ids||[]),...localHist.map(x=>x.id)]);
  pack.folklore_ids=uniq([...(pack.folklore_ids||[]),...folklore.map(x=>x.id)]);
  pack.rumor_ids=uniq([...(pack.rumor_ids||[]),...rumors.map(x=>x.id)]);

  // 10) 來源索引改為增量重建，擴充物品不再被舊版固定筆數判定為異常。
  DB.content_link_index=DB.content_link_index||{};
  const validItemIds=new Set((DB.items||[]).map(x=>x.id));
  const src=DB.content_link_index.item_sources=DB.content_link_index.item_sources||{};
  for(const id of Object.keys(src))if(!validItemIds.has(id))delete src[id];
  for(const d of DB.items||[]){
    const s=src[d.id]=src[d.id]||{};
    for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=uniq(s[k]||[]);
  }
  for(const [fid,f] of Object.entries(DB.facilities||{}))for(const id of f.stock||[])if(src[id])src[id].shops=uniq([...src[id].shops,fid]);
  for(const l of DB.locations||[])for(const id of l.gather||[])if(src[id])src[id].gather_locations=uniq([...src[id].gather_locations,l.id]);
  for(const m of DB.monsters||[])for(const d of m.loot_materials||[])if(src[d.id])src[d.id].monster_drops=uniq([...src[d.id].monster_drops,m.id]);
  for(const r of DB.recipes||[]){
    for(const d of r.ingredients||[])if(src[d.item_id])src[d.item_id].recipe_inputs=uniq([...src[d.item_id].recipe_inputs,r.id]);
    if(r.output?.item_id&&src[r.output.item_id])src[r.output.item_id].recipe_outputs=uniq([...src[r.output.item_id].recipe_outputs,r.id]);
  }
  for(const d of DB.items||[]){
    const s=src[d.id],has=["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"].some(k=>s[k]?.length);
    if(!has&&String(d.id||"").includes("ASD"))s.special_sources=["regional_content:REG-ASD-01"];
  }
  DB.content_link_index.location_content=DB.content_link_index.location_content||{};
  for(const l of DB.locations||[]){
    if(!isAsd(l))continue;
    const x=DB.content_link_index.location_content[l.id]=DB.content_link_index.location_content[l.id]||{};
    x.encounter_monster_ids=uniq([...(x.encounter_monster_ids||[]),...(DB.monsters||[]).filter(m=>(m.habitat||[]).includes(l.id)||(m.habitats||[]).includes(l.id)).map(m=>m.id)]);
  }

  // 11) INTEGRATION-3.0 計數同步實際 CURRENT 資料。
  if(DB.integration_registry?.counts){
    DB.integration_registry.counts.lore_records=(DB.lore_records||[]).length;
    DB.integration_registry.counts.dialogue=(DB.dialogue_database?.records||[]).length;
    DB.integration_registry.counts.intel=(DB.intel_database?.records||[]).length;
    DB.integration_registry.counts.quest_templates=(DB.quest_templates||[]).length;
    DB.integration_registry.counts.adventure_event_templates=(DB.adventure_event_templates||[]).length;
  }
  DB.asdail_integration_system={
    version:"ASDAIL-INTEGRATION-1.0",
    release:"CURRENT-1.65.3",
    region_id:"REG-ASD-01",
    policy:"normalize_expansion_schema_without_disabling_audits"
  };
})();
