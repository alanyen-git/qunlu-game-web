/* 群陸旅誌：晨律教國＋卡薩維爾自由城盟完整區域深化 CURRENT-2.03.0
 * DAWN-CASAVELLE-DEPTH-1.0
 * POL-004 / REG-04 與 POL-007 / REG-06+REG-07：
 * 政體、地方結構、城鎮、野外、地下城、怪物、素材、NPC、組織、經濟與活世界鉤子。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.03.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.03.0";
const REV="DAWN-CASAVELLE-DEPTH-1.0";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(k){DB[k]=Array.isArray(DB[k])?DB[k]:[];return DB[k]}
function row(k,id,idKey="id"){return (DB[k]||[]).find(x=>x?.[idKey]===id)||null}
function upsert(k,v,idKey="id"){const a=arr(k),i=a.findIndex(x=>x?.[idKey]===v[idKey]);if(i>=0)a[i]=v;else a.push(v);return v}
function loc(id){return row("locations",id)}
function addLink(a,b,h){const x=loc(a);if(!x||!loc(b))return;x.links=Array.isArray(x.links)?x.links:[];const old=x.links.find(e=>e?.to===b);if(old)old.hours=h;else x.links.push({to:b,hours:h})}
function twoWay(a,b,h){addLink(a,b,h);addLink(b,a,h)}
function econ(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return{prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}
function item(x,polity,regions,gatherable){return{id:x.id,name:x.name,kind:"material",type:"素材",catalog_group:"素材",stackable:true,category:x.category||"material",tier:x.tier||"E",weight:x.weight??0.2,
 value:x.price||12,base_price_copper:x.price||12,price_copper:x.price||12,rarity:x.rarity||"common",regional_origin_id:regions[0],regional_origin_ids:[...regions],
 source_region_ids:[...regions],source_polity_id:polity,wild_gather_eligible:!!gatherable?.has(x.id),
 economy_tags:x.tags||[],description:x.description||x.name+"是該地區受季節、配額與採集承載限制的地方素材。"}}
function monster(x,polity){
 const drops=[...(x.drops||[])],tags=[...(x.tags||["wildlife"])],damageByTier={F:[2,5],E:[5,10],D:[9,16],C:[14,23],B:[22,34]};
 const category=tags.includes("undead")?"不死系":tags.includes("construct")?"構裝體":"野獸與一般魔物系";
 return{id:x.id,name:x.name,tier:x.tier,role:x.role||"一般",lore_role:x.role||"一般",region:x.region||"",category,
  habitat:[...(x.habitat||[])],habitats:[...(x.habitat||[])],habitat_location_ids:[...(x.habitat||[])],
  hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??Math.max(2,Math.round((x.def||4)*.75)),accuracy:x.acc||70,initiative:x.init||10,
  damage:[...(x.damage||damageByTier[x.tier]||[2,5])],primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),
  description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,political_entity_id:polity,
  ecology_profile:{body_scale:x.scale||"medium",tags},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},
  loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:x.maxDrop||1}))};
}
function buildPolity(C){
 const regionSet=new Set(C.regionIds);
 const town=x=>{
  const base=clone(loc(x.id)||{});
  return Object.assign(base,{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:C.name,description:x.description,
   facilities:uniq([...(base.facilities||[]),...(x.facilities||[])]),links:Array.isArray(base.links)?base.links:[],safety_score:x.safety??89,
   safety_label:(x.safety??89)>=93?"安穩":(x.safety??89)>=86?"穩定":"警戒",risk:Math.max(2,100-(x.safety??89)),
   world_region_id:x.regionId,region_id:x.regionId,political_entity_id:C.polityId,polity_id:C.polityId,culture_id:C.cultureId,
   history_scope:C.name+"／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:C.realmId,
   local_authority:clone(x.authority),local_economy:clone(x.economy),depth_zone_id:x.zoneId});
 };
 const field=x=>{
  const base=clone(loc(x.id)||{}),ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{};
  const ep=clone(base.encounter_profile||ref.encounter_profile||{});
  Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,
   allow_demons:false,allow_undead:!!x.allowUndead,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"standard",preferred_monster_ids:[...(x.preferred||[])]});
  return Object.assign(base,{id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size||"地方區域",region:C.name,description:x.description,
   world_region_id:x.regionId,region_id:x.regionId,political_entity_id:C.polityId,polity_id:C.polityId,culture_id:C.cultureId,province_region_id:x.province,
   settlement_region_id:x.smap,realm_region_map_id:C.realmId,links:Array.isArray(base.links)?base.links:[],risk:x.risk??22,
   safety_score:x.safety??Math.max(20,100-(x.risk??22)),safety_label:(x.risk??22)<=15?"安穩":(x.risk??22)<=25?"普通":(x.risk??22)<=35?"警戒":"危險",encounter_profile:ep,
   tags:uniq([...(base.tags||[]),...(x.tags||[])]),gather:uniq([...(base.gather||[]),...(x.gather||[])]),mining:uniq([...(base.mining||[]),...(x.mining||[])]),
   woodcut:uniq([...(base.woodcut||[]),...(x.woodcut||[])]),fish:uniq([...(base.fish||[]),...(x.fish||[])]),hunt:uniq([...(base.hunt||[]),...(x.hunt||[])]),explore:x.explore||base.explore||[],
   resource_profile:{gather:x.gather||[],mining:x.mining||[],woodcut:x.woodcut||[],fish:x.fish||[],hunt:x.hunt||[]},
   preferred_monster_ids:x.preferred||[],resource_capacity:clone(x.resourceCapacity||base.resource_capacity||{forage:16,hunt:8,ore:5,wood:8,water:8}),
   resource_regen_hours:x.regen??48,hunt_requires_battle:true,depth_zone_id:x.zoneId});
 };
 const gatherable=new Set([...C.fields,...C.dungeons].flatMap(x=>[...(x.gather||[]),...(x.mining||[]),...(x.woodcut||[]),...(x.fish||[]),...(x.hunt||[])]));
 for(const x of C.materials)upsert("items",item(x,C.polityId,C.regionIds,gatherable));
 for(const x of C.towns)upsert("locations",town(x));
 for(const x of C.fields)upsert("locations",field({...x,kind:"wild"}));
 for(const x of C.dungeons)upsert("locations",field({...x,kind:"dungeon",zoneClass:"dungeon",allowMagical:true,space:x.space||"standard"}));
 for(const m of C.monsters)upsert("monsters",monster({...m,region:C.name},C.polityId));
 for(const n of C.npcs)upsert("regional_npc_archetypes",{id:n[0],name:n[1],role:n[2],tier:rank(n[5])>=rank("C")?"C":n[5],location_id:n[3],knowledge_scope:n[4],
   combat_tier_ceiling:n[5],organization_ids:n[6],services:["地方情報","委託引介"],description:n[7],region_id:loc(n[3])?.region_id||C.regionIds[0],polity_id:C.polityId,culture_id:C.cultureId});
 for(const o0 of C.orgs){
  if(o0.existing){
   const o=row("world_organizations",o0.id);if(!o)continue;
   o.contact_location_ids=uniq([...(o.contact_location_ids||[]),...(o0.contact_location_ids||[])]);
   o.associated_polity_ids=uniq([...(o.associated_polity_ids||[]),C.polityId]);
   o.depth_roles=uniq([...(o.depth_roles||[]),o0.role]);
   continue;
  }
  const o=upsert("world_organizations",{...o0,political_entity_id:C.polityId,region_id:loc(o0.base_location_id)?.region_id||C.regionIds[0]});
  o.scope=o.tier==="B"?"kingdom":"local_regional";o.category=o.kind;o.alignment=o.kind==="religious"?"light":"neutral";o.primary_facility=o.kind==="religious"?"church":"guild";
  o.min_join_level=Math.max(1,Number(o.min_join_level)||1);o.join_reputation=Number(o.join_reputation)||0;o.visibility="public";o.legal_status="legal";o.joinable=o.joinable!==false;
  o.mission_issuer=true;o.can_be_enemy=true;o.contact_location_ids=uniq([...(o.contact_location_ids||[]),o.base_location_id]);
  o.member_bonus=o.member_bonus||{id:"BONUS-"+o.id,text:C.name+"職能訓練",effects:o.kind==="religious"?{healingPower:4}:o.kind==="military"?{defense_pct:3}:{perception:3}};
  o.history=o.history||[C.history];o.history_summary=o.history_summary||o.history.join(" ");o.current_state=o.current_state||C.currentState;
  o.signature=o.signature||o.description;o.distinctive_features=o.distinctive_features||[o.description,C.orgDistinctive];
 }
 for(const h of C.hooks)upsert("regional_adventure_hooks",{id:h[0],title:h[1],premise:h[2],tier:h[3],region_id:h[4]||C.regionIds[0],polity_id:C.polityId});
 for(const e of C.life)upsert("regional_life_events",{id:e[0],name:e[1],text:e[2],region_id:e[3]||C.regionIds[0],polity_id:C.polityId});
 for(const l of C.lore)upsert("lore_records",{id:l[0],category:l[1],title:l[2],text:l[3],political_entity_id:C.polityId,region_ids:C.regionIds,visibility:"public"});
 for(const z of C.zones){
  const towns=C.towns.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=C.fields.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=C.dungeons.filter(x=>x.zoneId===z.id).map(x=>x.id);
  upsert("province_region_maps",{id:z.province,layer:"province_region",name:z.name,display_name:C.name+"・"+z.name,parent_realm_map_id:C.realmId,political_entity_id:C.polityId,
   world_region_id:z.regionId,world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,
   identity:z.role,depth_zone_id:z.id});
  upsert("settlement_region_maps",{id:z.smap,name:z.name+"區域圖",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",
   location_ids:[...towns,...wilds,...dungeons],role:z.role,depth_zone_id:z.id});
 }
 let realm=row("realm_region_maps",C.realmId);
 if(!realm)realm=upsert("realm_region_maps",{id:C.realmId,layer:"realm_region",political_entity_id:C.polityId,world_region_id:C.regionIds[0],name:C.name+"區域地圖",world_tier:C.worldTier});
 Object.assign(realm,{name:C.name+"區域地圖",display_name:C.name,political_entity_id:C.polityId,world_region_ids:uniq([...(realm.world_region_ids||[]),...C.regionIds]),
  core_region_id:C.coreRegionId,capital:C.capital,province_region_ids:C.zones.map(x=>x.province),regional_centers:C.centers,map_status:"playable_current",notes:C.mapNotes});
 for(const rid of C.regionIds){
  const r=row("world_regions",rid);if(r)Object.assign(r,C.regionUpdates[rid]||{map_status:"playable_current"});
 }
 const p=row("political_entities",C.polityId);
 if(p)Object.assign(p,{name:C.name,government_type:C.governmentType,capital:C.capital,map_status:"playable_current",world_tier:C.worldTier,current_title:C.currentTitle,top_office:C.currentTitle,
  ruling_structure:C.rulingStructure,legal_tradition:C.legalTradition,succession_method:C.succession,identity:C.identity,gameplay_role:C.gameplayRole,secondary_centers:C.centers.filter(x=>x!==C.capital),
  economic_base:C.economicBase,military_structure:C.military,current_tensions:C.tensions,internal_regions:C.zones.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier,region_id:x.regionId})),
  key_organization_ids:uniq([...(p.key_organization_ids||[]),...C.orgs.map(x=>x.id)])});
 const auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===C.polityId);
 if(auth){auth.top_office_ids=[C.offices[0].id];auth.office_nodes=clone(C.offices);auth.rival_power_centers=[...C.powerCenters];auth.player_interaction_summary=C.playerInteraction;auth.succession_method=C.succession;}
 for(const [a,b,h] of C.links)twoWay(a,b,h);
 const dossier={version:REV,release:RELEASE,political_entity_id:C.polityId,region_ids:C.regionIds,world_tier:C.worldTier,capital:C.capital,
  zone_ids:C.zones.map(x=>x.id),town_ids:C.towns.map(x=>x.id),wild_ids:C.fields.map(x=>x.id),dungeon_ids:C.dungeons.map(x=>x.id),monster_ids:C.monsters.map(x=>x.id),
  npc_ids:C.npcs.map(x=>x[0]),organization_ids:C.orgs.map(x=>x.id),material_ids:C.materials.map(x=>x.id),governance:C.governance,tier_model:C.tierModel,save_compatible:true};
 DB[C.dbKey]=dossier;
 return dossier;
}
function auditPolity(C){
 const issues=[],p=row("political_entities",C.polityId),rm=row("realm_region_maps",C.realmId);
 if(!p)issues.push(C.name+"政治體缺失");else{if(p.name!==C.name)issues.push(C.name+"名稱失步:"+p.name);if(p.capital!==C.capital)issues.push(C.name+"首都失步:"+p.capital)}
 if(!rm||rm.map_status!=="playable_current")issues.push(C.name+"區域地圖未啟用");
 for(const rid of C.regionIds)if(row("world_regions",rid)?.map_status!=="playable_current")issues.push(C.name+"世界區域未啟用:"+rid);
 for(const id of [...C.towns,...C.fields,...C.dungeons].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==C.polityId)issues.push("地點主權錯誤:"+id);if(!regionSetFor(C).has(l.region_id))issues.push("地點區域錯誤:"+id);for(const e of l.links||[])if(!loc(e.to))issues.push("道路引用缺失:"+id+"->"+e.to)}
 for(const m0 of C.monsters){const m=row("monsters",m0.id);if(!m){issues.push("怪物缺失:"+m0.id);continue}if(rank(m.tier)>rank(C.worldTier))issues.push("怪物超過政治體層級:"+m.id);if(m.near_town_eligible&&rank(m.tier)>rank("E"))issues.push("城鎮近郊怪物超階:"+m.id);if(m.loot_profile?.fallback_policy!=="none")issues.push("怪物fallback未關閉:"+m.id);for(const d of m.loot_materials||[])if(!row("items",d.id))issues.push("怪物掉落缺失:"+m.id+"->"+d.id)}
 for(const n of C.npcs){const x=row("regional_npc_archetypes",n[0]);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n[0]);if(x&&rank(x.combat_tier_ceiling)>rank("C"))issues.push("核心NPC一般戰力超過C級:"+n[0])}
 for(const o of C.orgs)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 for(const m of C.materials)if(!row("items",m.id))issues.push("素材缺失:"+m.id);
 const a=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===C.polityId);for(const o of C.offices)if(!a?.office_nodes?.some(x=>x.id===o.id))issues.push("政治權力節點缺失:"+o.id);
 return{pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:C.zones.length,towns:C.towns.length,wilds:C.fields.length,dungeons:C.dungeons.length,locations_total:C.towns.length+C.fields.length+C.dungeons.length,
  monsters:C.monsters.length,materials:C.materials.length,npcs:C.npcs.length,organizations:C.orgs.length,b_tier_dungeons:C.dungeons.filter(x=>x.tier==="B").length}};
}
const regionSetFor=C=>new Set(C.regionIds);

const DAWN={
 dbKey:"dawn_law_holy_state",polityId:"POL-004",regionIds:["REG-04"],coreRegionId:"REG-04",cultureId:"CUL-004",realmId:"RMAP-POL-004",name:"晨律教國",capital:"晨鐘聖城",worldTier:"B",governmentType:"神權政治",currentTitle:"晨律最高牧首",
 history:"晨律教國由環鐘湖修院、教區與朝聖道路逐步整合，最高牧首的權力受教律程序、樞機席與地方教區承載限制。",
 currentState:"目前重點是維持跨境教務、朝聖交通、救濟、醫療與加冕法統的可信度，同時避免把宗教權威誤作他國世俗行政權。",
 orgDistinctive:"宗教權威、行政職責、財務、醫療與武裝護衛分工，任何單一組織均不能代表全部教國權力。",
 zones:[
  {id:"DAWN-Z-01",name:"晨鐘聖座直轄區",tier:"B",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",seat:"L-DAWN-HOLYBELL",role:"最高牧首、樞機會議、教廷文書、外交、跨境教務與加冕正統中樞"},
  {id:"DAWN-Z-02",name:"環鐘湖教區",tier:"C",regionId:"REG-04",province:"PROV-DAWN-02",smap:"SMAP-DAWN-02",seat:"L-DAWN-LAKEWARD",role:"湖運、漁業、堤岸、水權與首都糧運"},
  {id:"DAWN-Z-03",name:"七律修院帶",tier:"C",regionId:"REG-04",province:"PROV-DAWN-03",smap:"SMAP-DAWN-03",seat:"L-DAWN-SEVENRULE",role:"抄寫、醫療、教育、藥圃與教士培訓"},
  {id:"DAWN-Z-04",name:"聖燭丘教區",tier:"C",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",seat:"L-DAWN-CANDLEHILL",role:"蜂蠟、油料、陶器、墓園與地方朝聖經濟"},
  {id:"DAWN-Z-05",name:"東橋朝聖區",tier:"C",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",seat:"L-DAWN-EASTBRIDGE",role:"白鐘河橋渡、聖曜與凡雷克方向朝聖與商旅"},
  {id:"DAWN-Z-06",name:"南湖濟貧區",tier:"C",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",seat:"L-DAWN-SOUTHHAVEN",role:"救濟院、平價糧倉、果園、病患轉運與民生供給"},
  {id:"DAWN-Z-07",name:"誓光邊教區",tier:"B",regionId:"REG-04",province:"PROV-DAWN-07",smap:"SMAP-DAWN-07",seat:"L-DAWN-OATHLIGHT",role:"西南丘道、教產邊界、騎士團訓練與受控古聖所"}
 ],
 towns:[
  {id:"L-DAWN-HOLYBELL",name:"晨鐘聖城",zoneId:"DAWN-Z-01",zone:"晨鐘聖座直轄區",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",tier:"B",size:"聖都／超大型城",safety:96,role:"晨律教國首都與最高牧首座",facilities:["inn","general","guild","tailor","alchemy","church","clinic","mageguild"],authority:{title:"晨律最高牧首／教廷國務院",tier:"AUTH-7"},economy:econ(90,"極繁榮",["朝聖","教廷行政","抄寫","醫療","跨境使節"],["節期住宿壓力","聖物與高階神術受嚴格許可"],1.10,1.20,1.32,1.28),description:"環鐘湖畔的白石聖都。最高牧首、樞機會議、教律法院與跨境使節院集中於此；其法統可影響聖曜帝國加冕，但不等於直接控制聖曜稅賦或軍隊。"},
  {id:"L-DAWN-SCRIBEWARD",name:"經卷城坊",zoneId:"DAWN-Z-01",zone:"晨鐘聖座直轄區",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",tier:"C",size:"聖都外環學坊",safety:94,role:"印寫、紙張、檔案與學舍",facilities:["inn","general","guild","tailor","clinic","church"],authority:{title:"聖座書記監",tier:"AUTH-4"},economy:econ(82,"繁榮",["紙張","墨料","抄寫","學舍"],["火災管制","檔案區限行"],1.05,1.17,1.16,1.18),description:"依附聖都形成的書記、裝幀與學舍區。"},
  {id:"L-DAWN-LAKEWARD",name:"湖鐘港",zoneId:"DAWN-Z-02",zone:"環鐘湖教區",regionId:"REG-04",province:"PROV-DAWN-02",smap:"SMAP-DAWN-02",tier:"C",size:"湖港城",safety:92,role:"湖運、漁市與北岸糧運",facilities:["inn","general","guild","blacksmith","tailor","clinic","church"],authority:{title:"環湖主教／湖港監",tier:"AUTH-4"},economy:econ(78,"興盛",["淡水魚","穀物","船運","蘆葦"],["暴雨水位","湖港倉容"],1.00,1.18,1.18,1.16),description:"環鐘湖最大的民用港城，供應首都魚貨、蘆葦與糧食。"},
  {id:"L-DAWN-SEVENRULE",name:"七律修院城",zoneId:"DAWN-Z-03",zone:"七律修院帶",regionId:"REG-04",province:"PROV-DAWN-03",smap:"SMAP-DAWN-03",tier:"C",size:"修院城",safety:95,role:"修院教育、醫療與藥圃中心",facilities:["inn","general","alchemy","church","clinic"],authority:{title:"七律總修院長",tier:"AUTH-5"},economy:econ(74,"穩定",["藥草","醫療","抄本","乳酪"],["土地受教產配額管理","節期人流"],.99,1.13,1.12,1.08),description:"七所歷史修院共同形成的教學與醫療聚落。"},
  {id:"L-DAWN-CANDLEHILL",name:"燭丘城",zoneId:"DAWN-Z-04",zone:"聖燭丘教區",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",tier:"C",size:"丘陵工藝城",safety:91,role:"蜂蠟、燈油、陶器與墓園服務",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"聖燭大主教",tier:"AUTH-5"},economy:econ(76,"興盛",["蜂蠟","燈油","陶器","石工"],["蜂群季節性","墓園用地管制"],1.02,1.15,1.15,1.14),description:"低丘間的工藝城，以蠟燭、油燈與墓碑石工聞名。"},
  {id:"L-DAWN-EASTBRIDGE",name:"曉橋城",zoneId:"DAWN-Z-05",zone:"東橋朝聖區",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"C",size:"橋關城",safety:90,role:"跨河朝聖、商旅檢查與驛站",facilities:["inn","general","guild","blacksmith","clinic","church"],authority:{title:"東橋主教／橋關監",tier:"AUTH-4"},economy:econ(80,"繁榮",["橋稅","旅店","車馬","朝聖用品"],["洪水封橋","節期排隊"],1.05,1.16,1.18,1.18),description:"白鐘河中游的重要石橋城，連接北方聖曜與東方商路。"},
  {id:"L-DAWN-PILGRIMREST",name:"白杖鎮",zoneId:"DAWN-Z-05",zone:"東橋朝聖區",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"D",size:"朝聖驛鎮",safety:91,role:"平價旅宿、獸醫與步行朝聖者補給",facilities:["inn","general","clinic","church"],authority:{title:"朝聖路監",tier:"AUTH-3"},economy:econ(61,"穩定",["住宿","乾糧","修鞋","驢馬"],["淡季需求低","道路受雨季影響"],1.00,1.05,1.04,1.04),description:"長途朝聖者最常使用的平價驛鎮。"},
  {id:"L-DAWN-SOUTHHAVEN",name:"慈穀城",zoneId:"DAWN-Z-06",zone:"南湖濟貧區",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",tier:"C",size:"濟貧糧倉城",safety:93,role:"公共糧倉、救濟與病患轉運",facilities:["inn","general","guild","tailor","alchemy","clinic","church"],authority:{title:"濟貧院總監",tier:"AUTH-4"},economy:econ(68,"穩定",["平價穀物","果品","醫療","慈善捐輸"],["安全庫存不可外賣","歉收時配給"],.96,1.20,1.08,.95),description:"以公共糧倉與大型救濟院著稱，繁榮度不高但社會承載力強。"},
  {id:"L-DAWN-ORCHARD",name:"晨梨鎮",zoneId:"DAWN-Z-06",zone:"南湖濟貧區",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",tier:"D",size:"果園鎮",safety:94,role:"果園、蜜蜂與病患療養",facilities:["inn","general","alchemy","clinic","church"],authority:{title:"果園教產監",tier:"AUTH-3"},economy:econ(60,"穩定",["果品","蜂蜜","藥草"],["霜害","教產輪作"],.98,1.08,1.02,1.00),description:"南湖緩坡上的果園與療養聚落。"},
  {id:"L-DAWN-OATHLIGHT",name:"誓光堡城",zoneId:"DAWN-Z-07",zone:"誓光邊教區",regionId:"REG-04",province:"PROV-DAWN-07",smap:"SMAP-DAWN-07",tier:"C",size:"邊教堡城",safety:91,role:"丘道、防務、教產邊界與騎士團駐地",facilities:["inn","general","guild","blacksmith","clinic","church"],authority:{title:"誓光主教／護教軍務監",tier:"AUTH-5"},economy:econ(69,"穩定",["石材","馬具","護送","丘地牧產"],["軍需優先","高階聖物禁售"],1.03,1.08,1.12,1.08),description:"控制西南丘道的堡城，負責教國邊界與受控古聖所外圍。"}
 ],
 fields:[
  {id:"L-DAWN-BELLSHORE",name:"晨鐘湖北岸",zoneId:"DAWN-Z-01",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",tier:"E",tags:["water"],template:"L-RIVER",aquatic:true,risk:15,gather:["DAWN-MAT-001","DAWN-MAT-002"],fish:["DAWN-MAT-007"],preferred:["MON-DAWN-001","MON-DAWN-003"],description:"聖都外的湖岸蘆帶與小型碼頭，採集受水位與禁採段限制。"},
  {id:"L-DAWN-SCRIBEFIELDS",name:"書院田圃",zoneId:"DAWN-Z-01",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",tier:"E",tags:["plains"],template:"L-LOWFIELD",risk:12,gather:["DAWN-MAT-004"],preferred:["MON-DAWN-002","MON-DAWN-004"],description:"供應書院與聖都的菜園、亞麻與草藥田。"},
  {id:"L-DAWN-REEDMARSH",name:"鐘蘆淺澤",zoneId:"DAWN-Z-02",regionId:"REG-04",province:"PROV-DAWN-02",smap:"SMAP-DAWN-02",tier:"D",tags:["water","wetland"],template:"L-RIVER",aquatic:true,risk:24,gather:["DAWN-MAT-002"],fish:["DAWN-MAT-007"],hunt:["DAWN-MAT-008"],preferred:["MON-DAWN-005","MON-DAWN-006","MON-DAWN-011"],description:"湖港外圍的蘆澤，雨季水道會改變。"},
  {id:"L-DAWN-LIMESTONEBANK",name:"白灰湖岸",zoneId:"DAWN-Z-02",regionId:"REG-04",province:"PROV-DAWN-02",smap:"SMAP-DAWN-02",tier:"D",tags:["hill","water"],template:"L-HILL",risk:21,mining:["DAWN-MAT-010"],preferred:["MON-DAWN-007","MON-DAWN-012"],description:"出產石灰岩與白色建材的小丘岸。"},
  {id:"L-DAWN-HERBGARDENS",name:"七律藥圃原",zoneId:"DAWN-Z-03",regionId:"REG-04",province:"PROV-DAWN-03",smap:"SMAP-DAWN-03",tier:"E",tags:["plains"],template:"L-LOWFIELD",risk:10,gather:["DAWN-MAT-003","DAWN-MAT-004"],preferred:["MON-DAWN-004","MON-DAWN-009"],description:"修院輪作藥圃，不對外無限採收。"},
  {id:"L-DAWN-QUIETWOOD",name:"靜誦林",zoneId:"DAWN-Z-03",regionId:"REG-04",province:"PROV-DAWN-03",smap:"SMAP-DAWN-03",tier:"D",tags:["forest"],template:"L-WOOD",risk:22,woodcut:["DAWN-MAT-009"],gather:["DAWN-MAT-005"],hunt:["DAWN-MAT-008"],preferred:["MON-DAWN-008","MON-DAWN-013"],description:"修院管理的薪材與藥材林，採伐採分區輪替。"},
  {id:"L-DAWN-WAXMEADOW",name:"燭蜂草甸",zoneId:"DAWN-Z-04",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",tier:"E",tags:["plains"],template:"L-LOWFIELD",risk:16,gather:["DAWN-MAT-006"],preferred:["MON-DAWN-009","MON-DAWN-010"],description:"蜂農與牧草共用的丘間草甸。"},
  {id:"L-DAWN-CANDLEQUARRY",name:"燭丘石場",zoneId:"DAWN-Z-04",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",tier:"D",tags:["hill"],template:"L-HILL",risk:25,mining:["DAWN-MAT-010","DAWN-MAT-011"],preferred:["MON-DAWN-012","MON-DAWN-015"],description:"出產石灰與黏土的舊採石帶，深坑有坍塌風險。"},
  {id:"L-DAWN-PILGRIMROAD",name:"白杖朝聖道",zoneId:"DAWN-Z-05",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"E",tags:["road","plains"],template:"L-LOWFIELD",risk:17,gather:["DAWN-MAT-001"],preferred:["MON-DAWN-002","MON-DAWN-014"],description:"有里程石、飲水點與巡路站的主朝聖道路。"},
  {id:"L-DAWN-BELLRIVER",name:"白鐘中游灘",zoneId:"DAWN-Z-05",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"D",tags:["water"],template:"L-RIVER",aquatic:true,risk:23,gather:["DAWN-MAT-012"],fish:["DAWN-MAT-007"],preferred:["MON-DAWN-006","MON-DAWN-016"],description:"橋城上下游的礫灘與支流水口。"},
  {id:"L-DAWN-CHARITYFIELDS",name:"慈穀公田",zoneId:"DAWN-Z-06",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",tier:"E",tags:["plains"],template:"L-LOWFIELD",risk:12,gather:["DAWN-MAT-014"],preferred:["MON-DAWN-001","MON-DAWN-002"],description:"為救濟糧倉保留的輪作公田，歉收年禁止商業採收。"},
  {id:"L-DAWN-PEARHILLS",name:"晨梨丘園",zoneId:"DAWN-Z-06",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",tier:"E",tags:["hill"],template:"L-HILL",risk:14,gather:["DAWN-MAT-013","DAWN-MAT-006"],preferred:["MON-DAWN-004","MON-DAWN-010"],description:"果園、蜂房與療養步道交錯的低丘。"},
  {id:"L-DAWN-OATHRIDGE",name:"誓光石脊",zoneId:"DAWN-Z-07",regionId:"REG-04",province:"PROV-DAWN-07",smap:"SMAP-DAWN-07",tier:"C",tags:["hill","mountain"],template:"L-HILL",risk:34,mining:["DAWN-MAT-015"],preferred:["MON-DAWN-017","MON-DAWN-020"],description:"邊教區最高的石脊，舊界碑與祭儀石散布其上。"},
  {id:"L-DAWN-GUARDWOOD",name:"護誓松林",zoneId:"DAWN-Z-07",regionId:"REG-04",province:"PROV-DAWN-07",smap:"SMAP-DAWN-07",tier:"D",tags:["forest","hill"],template:"L-WOOD",risk:28,woodcut:["DAWN-MAT-009"],hunt:["DAWN-MAT-008"],preferred:["MON-DAWN-013","MON-DAWN-018"],description:"騎士團巡路與教產林務共同管理的坡林。"}
 ],
 dungeons:[
  {id:"D-DAWN-FIRSTSANCTUM",name:"初晨地下聖所",zoneId:"DAWN-Z-01",regionId:"REG-04",province:"PROV-DAWN-01",smap:"SMAP-DAWN-01",tier:"B",size:"受控古聖所",template:"D-AQUEDUCT",risk:60,archetype:"sealed_sanctum",gather:["DAWN-MAT-016"],preferred:["MON-DAWN-022","MON-DAWN-024"],description:"晨鐘聖城最古老的地下禮儀層，只有完成教廷、公會與學術前置的B級隊伍可進入核心。"},
  {id:"D-DAWN-LAKECISTERN",name:"舊湖港蓄水窖",zoneId:"DAWN-Z-02",regionId:"REG-04",province:"PROV-DAWN-02",smap:"SMAP-DAWN-02",tier:"D",size:"地下蓄水道",template:"D-AQUEDUCT",aquatic:true,risk:30,gather:["DAWN-MAT-012"],preferred:["MON-DAWN-016","MON-DAWN-019"],description:"舊港區停用的蓄水與排洪系統。"},
  {id:"D-DAWN-SCRIPTORIUM",name:"封存抄經庫",zoneId:"DAWN-Z-03",regionId:"REG-04",province:"PROV-DAWN-03",smap:"SMAP-DAWN-03",tier:"C",size:"地下書庫",template:"D-AQUEDUCT",risk:37,archetype:"archive_vault",gather:["DAWN-MAT-005"],preferred:["MON-DAWN-021"],description:"修院封存的舊抄本、裝幀器具與守庫構裝所在。"},
  {id:"D-DAWN-OSSUARY",name:"燭丘舊骨堂",zoneId:"DAWN-Z-04",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",tier:"C",size:"墓園地下堂",template:"D-AQUEDUCT",risk:40,archetype:"ossuary",allowUndead:true,gather:["DAWN-MAT-011"],preferred:["MON-DAWN-023"],description:"歷代墓園擴建留下的地下骨堂，只有管理失序的區段會出現不死異常。"},
  {id:"D-DAWN-BRIDGEVAULT",name:"曉橋橋腹舊庫",zoneId:"DAWN-Z-05",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"C",size:"橋腹倉道",template:"D-AQUEDUCT",risk:35,archetype:"bridge_vault",gather:["DAWN-MAT-011"],preferred:["MON-DAWN-019","MON-DAWN-021"],description:"古橋內部的維修廊與關稅舊庫。"},
  {id:"D-DAWN-ALMSVAULT",name:"舊救濟糧窖",zoneId:"DAWN-Z-06",regionId:"REG-04",province:"PROV-DAWN-06",smap:"SMAP-DAWN-06",tier:"D",size:"地下糧窖群",template:"D-AQUEDUCT",risk:28,gather:["DAWN-MAT-014"],preferred:["MON-DAWN-014","MON-DAWN-020"],description:"早期救濟制度留下的多層石窖與通風井。"},
  {id:"D-DAWN-OATHCRYPT",name:"誓光封印墓室",zoneId:"DAWN-Z-07",regionId:"REG-04",province:"PROV-DAWN-07",smap:"SMAP-DAWN-07",tier:"B",size:"受控誓約墓室",template:"D-AQUEDUCT",risk:59,archetype:"sealed_crypt",allowUndead:true,gather:["DAWN-MAT-016"],preferred:["MON-DAWN-022","MON-DAWN-024"],description:"護教戰爭時期留下的封印墓室，B級核心層禁止未授權拆取聖物。"},
  {id:"D-DAWN-QUARRYCHAPEL",name:"石場廢禮拜堂",zoneId:"DAWN-Z-04",regionId:"REG-04",province:"PROV-DAWN-04",smap:"SMAP-DAWN-04",tier:"D",size:"小型地下禮拜堂",template:"D-AQUEDUCT",risk:31,gather:["DAWN-MAT-010"],preferred:["MON-DAWN-015","MON-DAWN-020"],description:"採石工人曾使用的地下祈禱所，現多處塌陷。"},
  {id:"D-DAWN-WAYFARER",name:"白杖舊避難所",zoneId:"DAWN-Z-05",regionId:"REG-04",province:"PROV-DAWN-05",smap:"SMAP-DAWN-05",tier:"D",size:"路下避難所",template:"D-AQUEDUCT",risk:29,gather:["DAWN-MAT-012"],preferred:["MON-DAWN-014","MON-DAWN-019"],description:"朝聖道早期的地下避難與糧儲設施。"}
 ],
 materials:[
  {id:"DAWN-MAT-001",name:"晨露草",tier:"F",weight:.08,price:7,tags:["herb"]},{id:"DAWN-MAT-002",name:"白鐘蘆芯",tier:"F",weight:.12,price:6,tags:["fiber"]},
  {id:"DAWN-MAT-003",name:"七律鼠尾草",tier:"E",weight:.06,price:18,tags:["herb","medicine"]},{id:"DAWN-MAT-004",name:"書院亞麻",tier:"F",weight:.18,price:8,tags:["fiber"]},
  {id:"DAWN-MAT-005",name:"靜誦樹脂",tier:"E",weight:.12,price:22,tags:["resin"]},{id:"DAWN-MAT-006",name:"聖燭蜂蠟",tier:"E",weight:.15,price:20,tags:["wax"]},
  {id:"DAWN-MAT-007",name:"環鐘湖鮮魚",tier:"F",weight:.65,price:10,tags:["food"]},{id:"DAWN-MAT-008",name:"湖丘獸皮",tier:"E",weight:.9,price:24,tags:["hide"]},
  {id:"DAWN-MAT-009",name:"護誓松木",tier:"E",weight:1.2,price:19,tags:["wood"]},{id:"DAWN-MAT-010",name:"晨鐘石灰岩",tier:"E",weight:1.4,price:14,tags:["stone"]},
  {id:"DAWN-MAT-011",name:"古鐘銅碎料",tier:"D",weight:.55,price:46,tags:["metal"]},{id:"DAWN-MAT-012",name:"白鐘河砂",tier:"E",weight:.7,price:15,tags:["mineral"]},
  {id:"DAWN-MAT-013",name:"晨梨乾",tier:"F",weight:.2,price:8,tags:["food"]},{id:"DAWN-MAT-014",name:"慈穀麥束",tier:"F",weight:.8,price:7,tags:["food"]},
  {id:"DAWN-MAT-015",name:"誓光頁岩",tier:"C",weight:1.1,price:64,tags:["stone","ritual"]},{id:"DAWN-MAT-016",name:"古聖所光晶屑",tier:"B",weight:.12,price:180,tags:["arcane","restricted"],rarity:"rare"}
 ],
 monsters:[
  {id:"MON-DAWN-001",name:"湖岸白兔",tier:"F",habitat:["L-DAWN-BELLSHORE","L-DAWN-CHARITYFIELDS"],hp:24,atk:8,def:4,near:true,drops:[],description:"湖岸與公田常見小型草食獸。"},
  {id:"MON-DAWN-002",name:"白杖田狐",tier:"F",habitat:["L-DAWN-SCRIBEFIELDS","L-DAWN-PILGRIMROAD","L-DAWN-CHARITYFIELDS"],hp:30,atk:9,def:4,near:true,drops:[],description:"沿田埂與朝聖道活動的狐狸。"},
  {id:"MON-DAWN-003",name:"鐘蘆小蟹",tier:"F",habitat:["L-DAWN-BELLSHORE"],hp:27,atk:8,def:7,near:true,tags:["aquatic"],drops:["DAWN-MAT-007"],description:"湖岸蘆帶常見甲殼生物。"},
  {id:"MON-DAWN-004",name:"果園刺鼬",tier:"F",habitat:["L-DAWN-SCRIBEFIELDS","L-DAWN-HERBGARDENS","L-DAWN-PEARHILLS"],hp:29,atk:9,def:5,near:true,drops:[],description:"會偷食果品與蜂巢的小獸。"},
  {id:"MON-DAWN-005",name:"蘆澤灰鷺",tier:"E",habitat:["L-DAWN-REEDMARSH"],hp:42,atk:13,def:5,drops:[],description:"大型涉禽，築巢季具攻擊性。"},
  {id:"MON-DAWN-006",name:"白鐘水蜥",tier:"E",habitat:["L-DAWN-REEDMARSH","L-DAWN-BELLRIVER"],hp:55,atk:16,def:10,element:"水",tags:["aquatic"],drops:[],description:"棲息河湖淺水的水蜥。"},
  {id:"MON-DAWN-007",name:"白灰岩鼬",tier:"E",habitat:["L-DAWN-LIMESTONEBANK"],hp:48,atk:15,def:8,drops:[],description:"活動於石灰岩縫隙的小型獵食獸。"},
  {id:"MON-DAWN-008",name:"靜誦角鹿",tier:"E",habitat:["L-DAWN-QUIETWOOD"],hp:60,atk:17,def:9,drops:["DAWN-MAT-008"],description:"修院林地常見的鹿獸。"},
  {id:"MON-DAWN-009",name:"藥圃鐘蛾",tier:"E",habitat:["L-DAWN-HERBGARDENS","L-DAWN-WAXMEADOW"],hp:40,atk:13,def:5,tags:["invertebrate"],drops:[],description:"受花香吸引的大型蛾類。"},
  {id:"MON-DAWN-010",name:"燭蜂群",tier:"E",habitat:["L-DAWN-WAXMEADOW","L-DAWN-PEARHILLS"],hp:46,atk:15,def:5,tags:["invertebrate"],drops:["DAWN-MAT-006"],description:"野化蜂群，巢受破壞時才會追擊。"},
  {id:"MON-DAWN-011",name:"蘆澤野豬",tier:"D",habitat:["L-DAWN-REEDMARSH"],hp:104,atk:28,def:17,drops:["DAWN-MAT-008"],description:"湖澤外圍常見大型野豬。"},
  {id:"MON-DAWN-012",name:"白灰石蜥",tier:"D",habitat:["L-DAWN-LIMESTONEBANK","L-DAWN-CANDLEQUARRY"],hp:96,atk:26,def:20,element:"地",drops:[],description:"厚鱗岩蜥，常伏於暖石。"},
  {id:"MON-DAWN-013",name:"護誓灰狼",tier:"D",habitat:["L-DAWN-QUIETWOOD","L-DAWN-GUARDWOOD"],hp:92,atk:27,def:15,drops:["DAWN-MAT-008"],description:"坡林狼群，冬季可能接近牧地。"},
  {id:"MON-DAWN-014",name:"朝聖道劫犬群",tier:"D",habitat:["L-DAWN-PILGRIMROAD","D-DAWN-WAYFARER","D-DAWN-ALMSVAULT"],hp:88,atk:25,def:14,drops:[],description:"由失散獵犬形成的野犬群。"},
  {id:"MON-DAWN-015",name:"石場甲蟲",tier:"D",habitat:["L-DAWN-CANDLEQUARRY","D-DAWN-QUARRYCHAPEL"],hp:108,atk:24,def:23,tags:["invertebrate"],drops:[],description:"甲殼厚重、啃食礦鹽的大型甲蟲。"},
  {id:"MON-DAWN-016",name:"河砂鰭蜥",tier:"D",habitat:["L-DAWN-BELLRIVER","D-DAWN-LAKECISTERN"],hp:95,atk:26,def:16,element:"水",tags:["aquatic"],drops:["DAWN-MAT-012"],description:"河灘與蓄水道中的兩棲魔獸。"},
  {id:"MON-DAWN-017",name:"誓光山貓",tier:"C",habitat:["L-DAWN-OATHRIDGE"],hp:142,atk:35,def:22,drops:["DAWN-MAT-008"],description:"石脊上的大型掠食獸。"},
  {id:"MON-DAWN-018",name:"護誓松熊",tier:"C",habitat:["L-DAWN-GUARDWOOD"],hp:185,atk:38,def:27,drops:["DAWN-MAT-008"],description:"深坡林中的大型熊獸。"},
  {id:"MON-DAWN-019",name:"舊渠泥甲獸",tier:"C",habitat:["D-DAWN-LAKECISTERN","D-DAWN-BRIDGEVAULT","D-DAWN-WAYFARER"],hp:160,atk:33,def:30,element:"地",drops:["DAWN-MAT-012"],description:"長年棲息舊水道的硬甲魔獸。"},
  {id:"MON-DAWN-020",name:"糧窖石齒鼠王",tier:"C",habitat:["D-DAWN-ALMSVAULT","D-DAWN-QUARRYCHAPEL"],hp:148,atk:34,def:20,drops:[],description:"地下窖群中形成領域的大型鼠獸。"},
  {id:"MON-DAWN-021",name:"守頁銅傀",tier:"C",habitat:["D-DAWN-SCRIPTORIUM","D-DAWN-BRIDGEVAULT"],hp:174,atk:36,def:32,tags:["construct"],drops:["DAWN-MAT-011"],description:"早期檔案與橋庫使用的守衛構裝。"},
  {id:"MON-DAWN-022",name:"聖所誓衛傀",tier:"B",role:"菁英",habitat:["D-DAWN-FIRSTSANCTUM","D-DAWN-OATHCRYPT"],hp:305,atk:52,def:42,element:"光",tags:["construct","arcane"],drops:["DAWN-MAT-016"],description:"只在受控B級聖所核心啟動的封存守衛。"},
  {id:"MON-DAWN-023",name:"失序骨堂守靈",tier:"C",habitat:["D-DAWN-OSSUARY"],hp:168,atk:35,def:25,element:"死亡",tags:["undead"],drops:[],description:"骨堂封條破損時才出現的局部不死異常。"},
  {id:"MON-DAWN-024",name:"初晨光印像",tier:"B",role:"首領",habitat:["D-DAWN-FIRSTSANCTUM","D-DAWN-OATHCRYPT"],hp:340,atk:55,def:40,mdef:46,element:"光",tags:["construct","arcane"],drops:["DAWN-MAT-016"],description:"古代禮儀封印形成的光性守衛，不進入一般遭遇表。"}
 ],
 npcs:[
  ["NPC-DAWN-001","瑟斐林三世","晨律最高牧首","L-DAWN-HOLYBELL","跨境教權、加冕法統、教國外交與最高教律","C",["ORG-DAWN-CURIA","ORG-020"],"現任最高牧首，強調加冕權是宗教法統工具，不是接管他國行政的授權。"],
  ["NPC-DAWN-002","艾瑟拉・維恩","首席樞機","L-DAWN-HOLYBELL","樞機議程、牧首選舉、教區平衡","D",["ORG-DAWN-CARDINAL"],"主持樞機會議與牧首選舉程序。"],
  ["NPC-DAWN-003","馬提歐・克萊恩","教廷國務卿","L-DAWN-HOLYBELL","外交照會、跨境教務、使節與條約","E",["ORG-DAWN-STATE"],"負責把宗教外交轉成可執行的文書與時程。"],
  ["NPC-DAWN-004","露琪亞・法恩","教律大法官","L-DAWN-HOLYBELL","教律、神職紀律、教產與跨法域爭議","D",["ORG-DAWN-CANON"],"區分教會紀律與他國世俗司法。"],
  ["NPC-DAWN-005","歐文・布魯姆","聖座財產總監","L-DAWN-SCRIBEWARD","教產、預算、修院配給與公共帳冊","F",["ORG-DAWN-TREASURY"],"要求救濟、修院與儀典預算分帳。"],
  ["NPC-DAWN-006","伊蓮・莫爾","聖座檔案長","L-DAWN-SCRIBEWARD","加冕紀錄、教令、歷代條約與抄本","F",["ORG-DAWN-STATE"],"擅長核對正本、抄本與後世傳聞。"],
  ["NPC-DAWN-007","阿德里克・湖鐘","環湖主教","L-DAWN-LAKEWARD","湖港、水權、漁民與北岸教區","E",["ORG-DAWN-CURIA"],"重視港口承載與漁業禁捕期。"],
  ["NPC-DAWN-008","米拉・桑恩","湖港總監","L-DAWN-LAKEWARD","船運、倉儲、魚市與堤岸","F",["ORG-DAWN-PILGRIM"],"掌握實際船期與倉位。"],
  ["NPC-DAWN-009","修女安蕾","七律總修院長","L-DAWN-SEVENRULE","修院教育、藥圃、醫療與教士培訓","E",["ORG-DAWN-HEALING"],"維持修院醫療與課程資源平衡。"],
  ["NPC-DAWN-010","托比亞・赫恩","修院醫療總長","L-DAWN-SEVENRULE","常見傷病、藥材、救濟與轉診","F",["ORG-DAWN-HEALING"],"優先使用可持續的基礎醫療。"],
  ["NPC-DAWN-011","賽西莉亞・燭冠","聖燭大主教","L-DAWN-CANDLEHILL","教區、工藝行會、墓園與節期","D",["ORG-DAWN-CURIA"],"協調工坊收入與墓園公共需求。"],
  ["NPC-DAWN-012","羅曼・維克","燭丘工藝監","L-DAWN-CANDLEHILL","蜂蠟、油燈、陶器與石材","F",["ORG-DAWN-TREASURY"],"以產量和存量而非無限供應管理市場。"],
  ["NPC-DAWN-013","尤里安・橋誓","東橋主教","L-DAWN-EASTBRIDGE","橋關、朝聖者、跨境教務與洪水應變","E",["ORG-DAWN-PILGRIM"],"熟悉聖曜與東方商路通行程序。"],
  ["NPC-DAWN-014","艾妲・沃特","橋關監","L-DAWN-EASTBRIDGE","通行證、車隊、橋稅與水位","F",["ORG-DAWN-PILGRIM"],"洪水前會限制重車上橋。"],
  ["NPC-DAWN-015","費利克斯・白杖","朝聖路總監","L-DAWN-PILGRIMREST","驛站、飲水點、路標與旅宿","E",["ORG-DAWN-PILGRIM"],"管理長途步行者最依賴的基礎設施。"],
  ["NPC-DAWN-016","瑪蓮娜・慈穀","濟貧院總監","L-DAWN-SOUTHHAVEN","糧倉、配給、病患轉運與冬季救濟","F",["ORG-DAWN-HEALING"],"不允許市場抽乾救濟安全庫存。"],
  ["NPC-DAWN-017","彼得・晨梨","教產農務監","L-DAWN-ORCHARD","果園、輪作、蜂房與療養院供應","F",["ORG-DAWN-TREASURY"],"以輪作和霜害預案維持供應。"],
  ["NPC-DAWN-018","伊薩克・誓光","誓光主教","L-DAWN-OATHLIGHT","邊教區、古聖所、教產界線與地方司法","D",["ORG-DAWN-CURIA"],"對受控遺跡實施分層許可。"],
  ["NPC-DAWN-019","卡珊卓・金曜","金曜騎士團聖座分團長","L-DAWN-OATHLIGHT","護教騎士、邊境護送與古聖所封鎖","C",["ORG-020"],"騎士團遵守自身章程，不取代地方主教與教廷法院。"],
  ["NPC-DAWN-020","萊納・石脊","邊教林務與礦務監","L-DAWN-OATHLIGHT","石脊採掘、坡林、道路與承載量","E",["ORG-DAWN-TREASURY"],"年度配額會依坍塌與林火風險調整。"],
  ["NPC-DAWN-021","薇若妮卡・晨印","加冕禮制學者","L-DAWN-HOLYBELL","歷代加冕、聖曜帝國法統與宗教外交","F",["ORG-DAWN-CARDINAL"],"能指出哪些儀式是必要法統，哪些只是後來習俗。"],
  ["NPC-DAWN-022","加布里爾・路燈","冒險者公會聖都聯絡官","L-DAWN-SCRIBEWARD","委託分級、地下城前置、跨境冒險者資格","E",["ORG-DAWN-STATE"],"負責把教國委託轉成符合冒險者等級的公開任務。"]
 ],
 orgs:[
  {id:"ORG-DAWN-CURIA",name:"晨律聖座議政院",kind:"religious",tier:"B",base_location_id:"L-DAWN-HOLYBELL",description:"最高牧首與主要高等神職協調教國、跨境教務與重大公共事務。"},
  {id:"ORG-DAWN-CARDINAL",name:"七席樞機會議",kind:"religious",tier:"B",base_location_id:"L-DAWN-HOLYBELL",description:"處理牧首選舉、教區平衡、重大教律與高階任命。"},
  {id:"ORG-DAWN-STATE",name:"教廷國務與使節院",kind:"government",tier:"B",base_location_id:"L-DAWN-HOLYBELL",description:"負責條約、跨境照會、加冕外交與外事文書。"},
  {id:"ORG-DAWN-CANON",name:"晨律教律法院",kind:"government",tier:"B",base_location_id:"L-DAWN-HOLYBELL",description:"審理教律、神職紀律、教產與教會內部司法。"},
  {id:"ORG-DAWN-TREASURY",name:"聖座教產與公庫署",kind:"civic",tier:"C",base_location_id:"L-DAWN-SCRIBEWARD",description:"管理教產、公共帳冊、修院配給、救濟預算與地方產出。"},
  {id:"ORG-DAWN-PILGRIM",name:"朝聖道路與橋港署",kind:"civic",tier:"C",base_location_id:"L-DAWN-EASTBRIDGE",description:"維護朝聖道、橋梁、驛站、湖港與飲水點。"},
  {id:"ORG-DAWN-HEALING",name:"七律醫療救濟院",kind:"religious",tier:"C",base_location_id:"L-DAWN-SEVENRULE",description:"統籌修院醫療、濟貧糧、藥草與跨區病患轉運。"},
  {id:"ORG-DAWN-GUARD",name:"聖座城防與護誓衛隊",kind:"military",tier:"C",base_location_id:"L-DAWN-HOLYBELL",description:"負責聖都城防、重要文書與聖座建築護衛，不取代騎士團跨區任務。"},
  {id:"ORG-020",existing:true,contact_location_ids:["L-DAWN-HOLYBELL","L-DAWN-OATHLIGHT"],role:"金曜騎士團總部級教國合作與護教分團"}
 ],
 offices:[
  {id:"POL-004-O1",title:"晨律最高牧首",authority_tier:"AUTH-7",authority_level:7,scope:"教國主權、跨境教務、正統加冕、最高教律與外交",appointment:"七席樞機會議依教律選舉並完成就座禮",rights:["AR-001","AR-002","AR-003","AR-005","AR-006"],reports_to:null},
  {id:"POL-004-O2",title:"首席樞機",authority_tier:"AUTH-6",authority_level:6,scope:"樞機議程、牧首選舉與高階任命程序",appointment:"樞機互選",rights:["AR-002","AR-005","AR-006"],reports_to:"POL-004-O1"},
  {id:"POL-004-O3",title:"教廷國務卿",authority_tier:"AUTH-5",authority_level:5,scope:"外交、使節、跨境教務行政與條約",appointment:"最高牧首任命並由樞機會議確認",rights:["AR-002","AR-003","AR-005"],reports_to:"POL-004-O1"},
  {id:"POL-004-O4",title:"教律大法官",authority_tier:"AUTH-5",authority_level:5,scope:"教律司法、神職紀律、教產法與法域衝突",appointment:"最高牧首提名、樞機會議確認",rights:["AR-005","AR-006"],reports_to:"POL-004-O1"},
  {id:"POL-004-O5",title:"大主教／主要教區長",authority_tier:"AUTH-5",authority_level:5,scope:"大型教區、地方教產、救濟與依法授權的行政",appointment:"教廷任命",rights:["AR-003","AR-005","AR-006"],reports_to:"POL-004-O1"},
  {id:"POL-004-O6",title:"主教／修院長",authority_tier:"AUTH-4",authority_level:4,scope:"地方教區、修院、教產與教務",appointment:"教廷或大主教依法任命",rights:["AR-003","AR-005","AR-006"],reports_to:"POL-004-O5"},
  {id:"POL-004-O7",title:"教產監／朝聖路監／濟貧院長",authority_tier:"AUTH-3",authority_level:3,scope:"專業公共行政、物資與地方服務",appointment:"對應教廷機構任命",rights:["AR-003","AR-005"],reports_to:"POL-004-O5"},
  {id:"POL-004-O8",title:"教區書記／執事／地方管事",authority_tier:"AUTH-2",authority_level:2,scope:"基層文書、教產、救濟與村社協調",appointment:"地方主教或修院任命",rights:["AR-003"],reports_to:"POL-004-O6"}
 ],
 powerCenters:["晨律最高牧首","七席樞機會議","主要大主教教區","教廷國務院","教律法院","金曜騎士團","大型修院與醫療救濟網"],
 playerInteraction:"低階玩家主要接觸朝聖路、修院、湖港、救濟院與地方教區；中階可處理跨教區文書、橋港與教產爭議；B級古聖所、加冕法統與最高教律案件必須有明確前置。",
 rulingStructure:"最高牧首同時是晨律信仰最高教權與教國主權者，但選舉、教律、財政、地方教區與公共服務由樞機會議、法院、國務院、大主教區及專業官署分掌；對外教權不等於取得外國世俗行政權。",
 legalTradition:"晨律教律、聖座令、教產法、城市與湖港章程並行；涉及他國世俗主權時以條約與法域分工作為邊界。",
 succession:"最高牧首非世襲，由具資格的七席樞機依教律選舉；空位期由樞機會議維持必要行政，但不得自行創設永久新權限。",
 identity:"大陸中央環鐘湖盆地的選舉神權教國，以晨鐘聖城、修院、醫療、朝聖道路與跨境教務維持影響力。",
 gameplayRole:"B級教國／宗教法統、跨境加冕、修院醫療、朝聖交通、教產經濟與受控古聖所探索",
 economicBase:["朝聖與旅宿","湖運與漁業","修院醫療","抄寫與教育","蜂蠟與燈油","公共糧倉","教產農業"],
 military:["聖座城防","護誓衛隊","地方城守","金曜騎士團合作分團","橋港守備"],
 tensions:["加冕權與他國世俗主權邊界","樞機與地方教區權責","救濟預算與儀典支出","朝聖季承載","湖運與洪水","受控聖物與地下遺構"],
 governance:"晨律最高牧首＋七席樞機會議＋教廷國務院／教律法院＋大主教教區＋修院與專業公共官署",
 tierModel:"教國B級；一般城鎮、朝聖與民生內容E～C；B級只在受控古聖所、封印墓室與最高法統事件出現。",
 centers:["晨鐘聖城","湖鐘港","七律修院城","燭丘城","曉橋城","慈穀城","誓光堡城"],
 mapNotes:"晨律教國沿用POL-004／REG-04。B級代表教國制度與受控高階聖所，不代表全境怪物或居民皆為B級；一般區域維持E～C。",
 regionUpdates:{"REG-04":{name:"環鐘湖教國盆地",map_status:"playable_current",recommended_tier:"B",playable_tier_band:"E～B",terrain:"環湖盆地、白鐘河中游、低丘、修院農地與朝聖道路",regional_identity:"晨鐘聖城、環鐘湖、修院網絡與朝聖橋道構成晨律教國核心。"}},
 links:[
  ["L-DAWN-HOLYBELL","L-DAWN-SCRIBEWARD",.5],["L-DAWN-HOLYBELL","L-DAWN-BELLSHORE",1],["L-DAWN-BELLSHORE","D-DAWN-FIRSTSANCTUM",1.3],
  ["L-DAWN-HOLYBELL","L-DAWN-LAKEWARD",2],["L-DAWN-LAKEWARD","L-DAWN-REEDMARSH",1],["L-DAWN-REEDMARSH","D-DAWN-LAKECISTERN",1.1],["L-DAWN-LAKEWARD","L-DAWN-LIMESTONEBANK",1.3],
  ["L-DAWN-LAKEWARD","L-DAWN-SEVENRULE",2.2],["L-DAWN-SEVENRULE","L-DAWN-HERBGARDENS",.8],["L-DAWN-HERBGARDENS","D-DAWN-SCRIPTORIUM",1.2],["L-DAWN-SEVENRULE","L-DAWN-QUIETWOOD",1.1],
  ["L-DAWN-SEVENRULE","L-DAWN-CANDLEHILL",2.4],["L-DAWN-CANDLEHILL","L-DAWN-WAXMEADOW",.8],["L-DAWN-CANDLEHILL","L-DAWN-CANDLEQUARRY",1],["L-DAWN-CANDLEQUARRY","D-DAWN-QUARRYCHAPEL",.8],["L-DAWN-CANDLEHILL","D-DAWN-OSSUARY",1],
  ["L-DAWN-HOLYBELL","L-DAWN-EASTBRIDGE",2.5],["L-DAWN-EASTBRIDGE","L-DAWN-PILGRIMREST",1.4],["L-DAWN-PILGRIMREST","L-DAWN-PILGRIMROAD",.7],["L-DAWN-PILGRIMROAD","D-DAWN-WAYFARER",.9],["L-DAWN-EASTBRIDGE","L-DAWN-BELLRIVER",.8],["L-DAWN-BELLRIVER","D-DAWN-BRIDGEVAULT",1],
  ["L-DAWN-HOLYBELL","L-DAWN-SOUTHHAVEN",2.6],["L-DAWN-SOUTHHAVEN","L-DAWN-ORCHARD",1],["L-DAWN-SOUTHHAVEN","L-DAWN-CHARITYFIELDS",.8],["L-DAWN-CHARITYFIELDS","D-DAWN-ALMSVAULT",1],
  ["L-DAWN-SOUTHHAVEN","L-DAWN-OATHLIGHT",2.8],["L-DAWN-OATHLIGHT","L-DAWN-OATHRIDGE",1.2],["L-DAWN-OATHRIDGE","D-DAWN-OATHCRYPT",1.1],["L-DAWN-OATHLIGHT","L-DAWN-GUARDWOOD",1]
 ],
 hooks:[
  ["HOOK-DAWN-01","加冕正本爭議","聖曜使團帶來互相矛盾的加冕文書副本，玩家需在聖座檔案、使節院與歷代抄本中核對正本。","C"],
  ["HOOK-DAWN-02","湖港禁捕線","漁民指控禁捕區劃錯，必須比對魚群、堤岸工程與地方糧價。","D"],
  ["HOOK-DAWN-03","七律藥圃短缺","修院常用藥草減產，需要找出土壤、水源或過量採集原因。","D"],
  ["HOOK-DAWN-04","骨堂封條鬆動","墓園舊骨堂出現局部不死異常，任務目標是修復封條而非掠奪墓葬。","C"],
  ["HOOK-DAWN-05","曉橋洪水預警","河水上升時必須協助分流朝聖者與商隊並保住橋基。","D"],
  ["HOOK-DAWN-06","慈穀安全庫存","商人高價求購救濟糧，玩家需查明是否涉及倒賣與配給漏洞。","D"],
  ["HOOK-DAWN-07","誓光界碑錯位","山雨造成教產界碑滑移，引發林權與採石權爭議。","C"],
  ["HOOK-DAWN-08","初晨聖所封門","受控古聖所監測出現異常，只有完成教廷、公會與學術前置的B級隊伍可進入。","B"]
 ],
 life:[
  ["LIFE-DAWN-01","大朝聖旬","聖都與曉橋旅宿需求大增，平價床位與飲水成為瓶頸。"],["LIFE-DAWN-02","環湖春汛","湖港與白鐘河提高警戒，部分低岸採集點暫停。"],
  ["LIFE-DAWN-03","七律藥圃輪作","藥材產量依輪作區切換，部分配方素材短期減少。"],["LIFE-DAWN-04","燭丘蜂季","蜂蠟與蜂蜜供應增加，但蜂群遭遇風險上升。"],
  ["LIFE-DAWN-05","教廷樞機會期","使節、書記與護衛需求上升，政治傳聞增多但正式決議只以文書為準。"],["LIFE-DAWN-06","慈穀冬儲","救濟院提高糧食安全庫存，市場可售數量下降。"],
  ["LIFE-DAWN-07","誓光巡防月","邊教丘道集中修繕與巡查，石材、馬料與短工需求增加。"],["LIFE-DAWN-08","加冕使節季","前往聖曜帝國的使節與禮制學者增加，跨境護送委託上升。"]
 ],
 lore:[
  ["LORE-DAWN-01","history","晨律教國的形成","晨律教國由環鐘湖多個修院、主教區與朝聖道路逐步整合，最高牧首制度晚於最早修院傳統。"],
  ["LORE-DAWN-02","politics","最高牧首是選舉職","最高牧首不是世襲君主，而由具資格的樞機依教律選舉；空位期間只維持必要行政。"],
  ["LORE-DAWN-03","law","跨境教權不等於外國行政權","晨律最高牧首可處理跨境教務與正統加冕，但不因此直接取得聖曜帝國稅賦、軍隊、封邑與普通世俗司法。"],
  ["LORE-DAWN-04","economy","教產不是無限資源","修院、果園、糧倉、蜂場與石場均有輪作、配額、安全庫存與公共用途。"],
  ["LORE-DAWN-05","society","朝聖道路是公共基礎設施","路標、飲水、廉價旅宿、橋梁與醫療讓宗教活動與一般商旅共享同一套交通網。"],
  ["LORE-DAWN-06","military","護教武裝受法定任務限制","聖座城防、地方守備與金曜騎士團各有不同法源，騎士團不自動取代教區行政。"]
 ]
};

const CAS={
 dbKey:"casavelle_free_city_league",polityId:"POL-007",regionIds:["REG-06","REG-07"],coreRegionId:"REG-07",cultureId:"CUL-007",realmId:"RMAP-POL-007",name:"卡薩維爾自由城盟",capital:"卡薩維爾",worldTier:"C",governmentType:"自由都市",currentTitle:"城盟議長",
 history:"卡薩維爾與維爾河成員城市以橋約、河港盟約、共同防務與商路互保形成城盟；共同機構只處理盟約授權事務，各城市保留市政自治。",
 currentState:"目前重點是維持河運、運河、關稅互認、共同巡防與城市自治的平衡，任何共同政策都受成員城授權與預算限制。",
 orgDistinctive:"共同機構、地方市政、行會與河運組織互相制衡，城盟議長不是成員城市的單一君主。",
 zones:[
  {id:"CAS-Z-01",name:"卡薩維爾議會盆地",tier:"C",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",seat:"L-CAS-CASAVELLE",role:"共同議會、商法庭、外交、信用與中央市場"},
  {id:"CAS-Z-02",name:"金橋商道區",tier:"C",regionId:"REG-07",province:"PROV-CAS-02",smap:"SMAP-CAS-02",seat:"L-CAS-GOLDBRIDGE",role:"橋關、車運、旅店、驛馬與北向商路"},
  {id:"CAS-Z-03",name:"紅瓦工坊區",tier:"C",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",seat:"L-CAS-REDTILE",role:"陶器、玻璃、染料、金工與行會工坊"},
  {id:"CAS-Z-04",name:"維爾港河海區",tier:"C",regionId:"REG-06",province:"PROV-CAS-04",smap:"SMAP-CAS-04",seat:"L-CAS-VIERPORT",role:"河海轉運、船塢、鹽貨與成員城自治"},
  {id:"CAS-Z-05",name:"三渠糧運區",tier:"C",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",seat:"L-CAS-THREECANAL",role:"運河、糧倉、磨坊、灌溉與平原農產"},
  {id:"CAS-Z-06",name:"南閘堤港區",tier:"C",regionId:"REG-06",province:"PROV-CAS-06",smap:"SMAP-CAS-06",seat:"L-CAS-SOUTHLOCK",role:"水閘、堤防、淺港、漁業與南向水路"},
  {id:"CAS-Z-07",name:"葡藤丘市區",tier:"C",regionId:"REG-07",province:"PROV-CAS-07",smap:"SMAP-CAS-07",seat:"L-CAS-VINECITY",role:"葡萄、果酒、旅店、丘陵農業與西南商隊"}
 ],
 towns:[
  {id:"L-CAS-CASAVELLE",name:"卡薩維爾",zoneId:"CAS-Z-01",zone:"卡薩維爾議會盆地",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"C",size:"城盟首府／大型自由城",safety:92,role:"共同議會、外交、商法與跨城金融清算中樞",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church","mageguild"],authority:{title:"城盟議長／卡薩維爾市議會",tier:"AUTH-5"},economy:econ(91,"極繁榮",["共同市場","商法","金融清算","行會","長途商隊"],["議會季住宿昂貴","共同預算須成員城同意"],1.10,1.30,1.34,1.36),description:"自由城盟共同議會所在地。城盟議長主持共同外交、防務與商路協調，但成員城市仍保留自己的市政、稅率與地方司法。"},
  {id:"L-CAS-WHITEWAREHOUSE",name:"白倉城",zoneId:"CAS-Z-01",zone:"卡薩維爾議會盆地",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"D",size:"倉儲衛星城",safety:90,role:"保稅倉、批發與車隊分流",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"白倉市議長",tier:"AUTH-4"},economy:econ(79,"興盛",["倉儲","批發","包裝","車隊"],["火災管制","倉位有限"],1.03,1.26,1.20,1.22),description:"首府外圍最大的保稅倉與批發聚落。"},
  {id:"L-CAS-GOLDBRIDGE",name:"金橋城",zoneId:"CAS-Z-02",zone:"金橋商道區",regionId:"REG-07",province:"PROV-CAS-02",smap:"SMAP-CAS-02",tier:"C",size:"橋關商城",safety:90,role:"北向橋關、車隊與驛馬市場",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"金橋市議長／橋關監",tier:"AUTH-4"},economy:econ(83,"繁榮",["橋稅","驛馬","車具","住宿"],["洪水改道","商隊尖峰壅塞"],1.05,1.18,1.20,1.20),description:"跨越主河道的石橋商城，是首府通往北方與中央大陸的關鍵路口。"},
  {id:"L-CAS-REDTILE",name:"紅瓦市",zoneId:"CAS-Z-03",zone:"紅瓦工坊區",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",tier:"C",size:"工坊城市",safety:89,role:"陶器、玻璃、染料與金工",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic"],authority:{title:"紅瓦市議長",tier:"AUTH-4"},economy:econ(85,"繁榮",["陶器","玻璃","染料","金工"],["燃料與礦砂配額","工坊火災風險"],1.04,1.22,1.25,1.22),description:"成片紅瓦屋頂與高窯煙囪構成城景，是城盟最重要的工藝中心。"},
  {id:"L-CAS-GLASSHILL",name:"玻璃丘鎮",zoneId:"CAS-Z-03",zone:"紅瓦工坊區",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",tier:"D",size:"窯業鎮",safety:88,role:"玻璃砂、石灰與小型窯場",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"窯業評議長",tier:"AUTH-3"},economy:econ(67,"穩定",["玻璃砂","石灰","瓶罐"],["木炭不足","採砂配額"],1.01,1.12,1.10,1.08),description:"低丘窯場與採砂坑密集的小鎮。"},
  {id:"L-CAS-VIERPORT",name:"維爾港",zoneId:"CAS-Z-04",zone:"維爾港河海區",regionId:"REG-06",province:"PROV-CAS-04",smap:"SMAP-CAS-04",tier:"C",size:"大型河海港",safety:89,role:"河海轉運、船塢、鹽貨與維爾諸城自治中心",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"維爾諸城議長／港務總監",tier:"AUTH-4"},economy:econ(89,"極繁榮",["河海轉運","船塢","鹽貨","魚市","保險"],["風暴與潮位","碼頭泊位有限"],1.08,1.28,1.30,1.32),description:"城盟第二政治中心，也是REG-06河海交通核心；維爾諸城保留高度自治。"},
  {id:"L-CAS-THREECANAL",name:"三渠城",zoneId:"CAS-Z-05",zone:"三渠糧運區",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",tier:"C",size:"運河糧運城",safety:91,role:"運河分流、糧倉、磨坊與農產交易",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"三渠市議長",tier:"AUTH-4"},economy:econ(80,"繁榮",["穀物","磨坊","運河","豆類"],["旱季水位","糧倉安全庫存"],.99,1.28,1.20,1.18),description:"三條人工水渠交會形成的糧運城市。"},
  {id:"L-CAS-MILLTIDE",name:"磨潮鎮",zoneId:"CAS-Z-05",zone:"三渠糧運區",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",tier:"D",size:"磨坊鎮",safety:92,role:"水磨、麵粉與農具維修",facilities:["inn","general","blacksmith","clinic"],authority:{title:"磨潮鎮議長",tier:"AUTH-3"},economy:econ(63,"穩定",["麵粉","磨坊","農具"],["枯水期產能下降"],.98,1.12,1.05,1.04),description:"依水磨與農業維修形成的運河鎮。"},
  {id:"L-CAS-SOUTHLOCK",name:"南閘城",zoneId:"CAS-Z-06",zone:"南閘堤港區",regionId:"REG-06",province:"PROV-CAS-06",smap:"SMAP-CAS-06",tier:"C",size:"水閘堤港城",safety:88,role:"水閘、堤防、漁業與南向駁船",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"南閘市議長／水務監",tier:"AUTH-4"},economy:econ(73,"興盛",["漁業","駁船","木材","水務"],["洪水風險","堤防維護成本"],1.02,1.16,1.16,1.12),description:"堤防與水閘環繞的低地港城。"},
  {id:"L-CAS-VINECITY",name:"葡藤市",zoneId:"CAS-Z-07",zone:"葡藤丘市區",regionId:"REG-07",province:"PROV-CAS-07",smap:"SMAP-CAS-07",tier:"C",size:"丘陵商市",safety:92,role:"葡萄、果酒、旅店與西南商路",facilities:["inn","general","guild","tailor","clinic"],authority:{title:"葡藤市議長",tier:"AUTH-4"},economy:econ(77,"興盛",["葡萄","果酒","旅宿","果乾"],["霜害","酒稅爭議"],1.03,1.17,1.15,1.14),description:"丘陵葡萄園與商旅客棧圍繞的成員城市。"}
 ],
 fields:[
  {id:"L-CAS-COUNCILMEADOW",name:"議會外環草地",zoneId:"CAS-Z-01",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"E",template:"L-LOWFIELD",risk:14,gather:["CAS-MAT-001"],preferred:["MON-CAS-001","MON-CAS-002"],description:"首府外的市場牲畜與商隊暫駐草地。"},
  {id:"L-CAS-WAREHOUSEDITCH",name:"白倉排水帶",zoneId:"CAS-Z-01",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"E",template:"L-RIVER",aquatic:true,risk:18,gather:["CAS-MAT-002"],preferred:["MON-CAS-003","MON-CAS-005"],description:"倉城外圍排水溝、蘆帶與低地。"},
  {id:"L-CAS-GOLDROAD",name:"金橋北商道",zoneId:"CAS-Z-02",regionId:"REG-07",province:"PROV-CAS-02",smap:"SMAP-CAS-02",tier:"D",template:"L-LOWFIELD",risk:23,gather:["CAS-MAT-001"],preferred:["MON-CAS-002","MON-CAS-009"],description:"高流量車隊道路，主要風險是獸害與交通事故。"},
  {id:"L-CAS-RIVERFORD",name:"金橋下游灘",zoneId:"CAS-Z-02",regionId:"REG-07",province:"PROV-CAS-02",smap:"SMAP-CAS-02",tier:"D",template:"L-RIVER",aquatic:true,risk:25,fish:["CAS-MAT-007"],gather:["CAS-MAT-010"],preferred:["MON-CAS-006","MON-CAS-011"],description:"橋下礫灘與支流匯口。"},
  {id:"L-CAS-GLASSSAND",name:"玻璃砂丘",zoneId:"CAS-Z-03",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",tier:"D",template:"L-HILL",risk:25,mining:["CAS-MAT-004","CAS-MAT-005"],preferred:["MON-CAS-007","MON-CAS-012"],description:"供窯業使用的淺層砂岩與石灰丘，採掘有年度配額。"},
  {id:"L-CAS-DYEFLATS",name:"染草平地",zoneId:"CAS-Z-03",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",tier:"E",template:"L-LOWFIELD",risk:16,gather:["CAS-MAT-003"],preferred:["MON-CAS-004","MON-CAS-008"],description:"種植與野生染料植物混合的工坊原料地。"},
  {id:"L-CAS-PORTMARSH",name:"維爾港蘆灣",zoneId:"CAS-Z-04",regionId:"REG-06",province:"PROV-CAS-04",smap:"SMAP-CAS-04",tier:"D",template:"L-RIVER",aquatic:true,risk:27,gather:["CAS-MAT-002"],fish:["CAS-MAT-007"],preferred:["MON-CAS-005","MON-CAS-013"],description:"港外蘆灣與潮濕泥灘。"},
  {id:"L-CAS-SHIPWOOD",name:"船材河林",zoneId:"CAS-Z-04",regionId:"REG-06",province:"PROV-CAS-04",smap:"SMAP-CAS-04",tier:"D",template:"L-WOOD",risk:28,woodcut:["CAS-MAT-009"],hunt:["CAS-MAT-008"],preferred:["MON-CAS-010","MON-CAS-014"],description:"供船塢與桶匠使用的河岸輪伐林。"},
  {id:"L-CAS-CANALFIELDS",name:"三渠輪作田",zoneId:"CAS-Z-05",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",tier:"E",template:"L-LOWFIELD",risk:13,gather:["CAS-MAT-006"],preferred:["MON-CAS-001","MON-CAS-004"],description:"運河灌溉的穀物與豆田。"},
  {id:"L-CAS-MILLBANK",name:"磨潮河堤",zoneId:"CAS-Z-05",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",tier:"D",template:"L-RIVER",aquatic:true,risk:22,gather:["CAS-MAT-010"],preferred:["MON-CAS-006","MON-CAS-015"],description:"水磨與堤岸交錯的河段。"},
  {id:"L-CAS-SOUTHREEDS",name:"南閘蘆原",zoneId:"CAS-Z-06",regionId:"REG-06",province:"PROV-CAS-06",smap:"SMAP-CAS-06",tier:"D",template:"L-RIVER",aquatic:true,risk:29,gather:["CAS-MAT-002"],fish:["CAS-MAT-007"],preferred:["MON-CAS-013","MON-CAS-016"],description:"水閘外大片蘆原與淺水汊。"},
  {id:"L-CAS-LEVEEWOODS",name:"堤外柳林",zoneId:"CAS-Z-06",regionId:"REG-06",province:"PROV-CAS-06",smap:"SMAP-CAS-06",tier:"D",template:"L-WOOD",risk:27,woodcut:["CAS-MAT-009"],hunt:["CAS-MAT-008"],preferred:["MON-CAS-010","MON-CAS-017"],description:"防風與護堤用的柳林帶。"},
  {id:"L-CAS-VINEHILLS",name:"葡藤丘園",zoneId:"CAS-Z-07",regionId:"REG-07",province:"PROV-CAS-07",smap:"SMAP-CAS-07",tier:"E",template:"L-HILL",risk:15,gather:["CAS-MAT-011","CAS-MAT-012"],preferred:["MON-CAS-002","MON-CAS-008"],description:"梯田式葡萄園與果樹丘。"},
  {id:"L-CAS-WESTTRACK",name:"西南商隊丘道",zoneId:"CAS-Z-07",regionId:"REG-07",province:"PROV-CAS-07",smap:"SMAP-CAS-07",tier:"D",template:"L-HILL",risk:26,gather:["CAS-MAT-013"],preferred:["MON-CAS-009","MON-CAS-018"],description:"通往西南市場的丘陵商隊道路。"}
 ],
 dungeons:[
  {id:"D-CAS-OLDCOUNCIL",name:"舊盟約地窖",zoneId:"CAS-Z-01",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"C",template:"D-AQUEDUCT",risk:39,gather:["CAS-MAT-015"],preferred:["MON-CAS-021"],description:"首府早期盟約廳下方的封存檔案與舊金庫通道。"},
  {id:"D-CAS-WAREHOUSESEWER",name:"白倉舊排水渠",zoneId:"CAS-Z-01",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"D",template:"D-AQUEDUCT",aquatic:true,risk:30,gather:["CAS-MAT-010"],preferred:["MON-CAS-015","MON-CAS-019"],description:"倉儲區停用的排水與滅火水道。"},
  {id:"D-CAS-BRIDGEPIER",name:"金橋古橋墩室",zoneId:"CAS-Z-02",regionId:"REG-07",province:"PROV-CAS-02",smap:"SMAP-CAS-02",tier:"C",template:"D-AQUEDUCT",risk:36,gather:["CAS-MAT-014"],preferred:["MON-CAS-020","MON-CAS-021"],description:"現橋下方更早期橋墩與維修廊。"},
  {id:"D-CAS-GLASSKILN",name:"廢玻璃窯群",zoneId:"CAS-Z-03",regionId:"REG-07",province:"PROV-CAS-03",smap:"SMAP-CAS-03",tier:"C",template:"D-AQUEDUCT",risk:38,gather:["CAS-MAT-004","CAS-MAT-016"],preferred:["MON-CAS-012","MON-CAS-022"],description:"火災後停用的地下窯室與料倉。"},
  {id:"D-CAS-DOCKVAULT",name:"維爾舊船渠",zoneId:"CAS-Z-04",regionId:"REG-06",province:"PROV-CAS-04",smap:"SMAP-CAS-04",tier:"C",template:"D-AQUEDUCT",aquatic:true,risk:41,gather:["CAS-MAT-014"],preferred:["MON-CAS-019","MON-CAS-023"],description:"舊式乾船塢下方的水門、鏈道與維修坑。"},
  {id:"D-CAS-CANALLOCK",name:"三渠封閉水門",zoneId:"CAS-Z-05",regionId:"REG-06",province:"PROV-CAS-05",smap:"SMAP-CAS-05",tier:"C",template:"D-AQUEDUCT",aquatic:true,risk:35,gather:["CAS-MAT-010"],preferred:["MON-CAS-020","MON-CAS-023"],description:"被新運河取代的舊水門與機械室。"},
  {id:"D-CAS-LEVEETUNNEL",name:"南閘堤心隧道",zoneId:"CAS-Z-06",regionId:"REG-06",province:"PROV-CAS-06",smap:"SMAP-CAS-06",tier:"C",template:"D-AQUEDUCT",risk:37,gather:["CAS-MAT-014"],preferred:["MON-CAS-017","MON-CAS-024"],description:"用於檢修堤體與排洪閘的狹長隧道。"},
  {id:"D-CAS-WINECELLAR",name:"葡藤舊酒窖城",zoneId:"CAS-Z-07",regionId:"REG-07",province:"PROV-CAS-07",smap:"SMAP-CAS-07",tier:"D",template:"D-AQUEDUCT",risk:29,gather:["CAS-MAT-012"],preferred:["MON-CAS-018","MON-CAS-022"],description:"多個老酒窖連成的地下通道。"},
  {id:"D-CAS-CHARTERARCHIVE",name:"城盟封印章庫",zoneId:"CAS-Z-01",regionId:"REG-07",province:"PROV-CAS-01",smap:"SMAP-CAS-01",tier:"C",template:"D-AQUEDUCT",risk:42,gather:["CAS-MAT-015"],preferred:["MON-CAS-021","MON-CAS-024"],description:"保存成員城最早特許狀與印模的高戒備地下檔案層。"}
 ],
 materials:[
  {id:"CAS-MAT-001",name:"商道車草",tier:"F",weight:.1,price:6,tags:["herb"]},{id:"CAS-MAT-002",name:"維爾蘆纖",tier:"F",weight:.14,price:7,tags:["fiber"]},
  {id:"CAS-MAT-003",name:"紅瓦染草",tier:"E",weight:.08,price:16,tags:["dye"]},{id:"CAS-MAT-004",name:"玻璃砂",tier:"E",weight:.8,price:14,tags:["mineral"]},
  {id:"CAS-MAT-005",name:"窯用石灰",tier:"E",weight:1.1,price:13,tags:["stone"]},{id:"CAS-MAT-006",name:"三渠穀束",tier:"F",weight:.8,price:7,tags:["food"]},
  {id:"CAS-MAT-007",name:"維爾河鮮魚",tier:"F",weight:.7,price:10,tags:["food"]},{id:"CAS-MAT-008",name:"河林獸皮",tier:"E",weight:.9,price:23,tags:["hide"]},
  {id:"CAS-MAT-009",name:"堤林柳木",tier:"E",weight:1.1,price:17,tags:["wood"]},{id:"CAS-MAT-010",name:"運河黏土",tier:"E",weight:.9,price:11,tags:["clay"]},
  {id:"CAS-MAT-011",name:"葡藤果串",tier:"F",weight:.35,price:9,tags:["food"]},{id:"CAS-MAT-012",name:"酒窖橡木塞料",tier:"E",weight:.15,price:18,tags:["wood"]},
  {id:"CAS-MAT-013",name:"丘道香草",tier:"E",weight:.07,price:15,tags:["herb"]},{id:"CAS-MAT-014",name:"舊橋鐵件",tier:"D",weight:.7,price:42,tags:["metal"]},
  {id:"CAS-MAT-015",name:"盟約封蠟碎片",tier:"C",weight:.05,price:58,tags:["archive"]},{id:"CAS-MAT-016",name:"彩窯晶砂",tier:"C",weight:.2,price:72,tags:["mineral","craft"]}
 ],
 monsters:[
  {id:"MON-CAS-001",name:"倉地灰兔",tier:"F",habitat:["L-CAS-COUNCILMEADOW","L-CAS-CANALFIELDS"],hp:24,atk:8,def:4,near:true,drops:[],description:"城外草地與農田常見小獸。"},
  {id:"MON-CAS-002",name:"商道赤狐",tier:"F",habitat:["L-CAS-COUNCILMEADOW","L-CAS-GOLDROAD","L-CAS-VINEHILLS"],hp:31,atk:9,def:4,near:true,drops:[],description:"跟隨商隊垃圾與田鼠活動的狐狸。"},
  {id:"MON-CAS-003",name:"排水溝蟹",tier:"F",habitat:["L-CAS-WAREHOUSEDITCH"],hp:28,atk:8,def:7,near:true,tags:["aquatic"],drops:["CAS-MAT-007"],description:"低地排水溝常見甲殼生物。"},
  {id:"MON-CAS-004",name:"穀田長尾鼬",tier:"E",habitat:["L-CAS-DYEFLATS","L-CAS-CANALFIELDS"],hp:44,atk:14,def:6,drops:[],description:"捕食田鼠的小型獵食獸。"},
  {id:"MON-CAS-005",name:"蘆灣水禽群",tier:"E",habitat:["L-CAS-WAREHOUSEDITCH","L-CAS-PORTMARSH"],hp:42,atk:13,def:5,tags:["aquatic"],drops:[],description:"聚集於蘆灣與港外淺灘。"},
  {id:"MON-CAS-006",name:"河灘水蜥",tier:"E",habitat:["L-CAS-RIVERFORD","L-CAS-MILLBANK"],hp:54,atk:16,def:10,element:"水",tags:["aquatic"],drops:[],description:"河岸常見水蜥。"},
  {id:"MON-CAS-007",name:"玻砂穴鼬",tier:"E",habitat:["L-CAS-GLASSSAND"],hp:48,atk:15,def:8,drops:[],description:"在採砂丘洞穴活動。"},
  {id:"MON-CAS-008",name:"葡藤刺鼬",tier:"E",habitat:["L-CAS-DYEFLATS","L-CAS-VINEHILLS"],hp:46,atk:15,def:7,drops:[],description:"會偷食葡萄與果品。"},
  {id:"MON-CAS-009",name:"商道野犬群",tier:"D",habitat:["L-CAS-GOLDROAD","L-CAS-WESTTRACK"],hp:88,atk:25,def:14,drops:[],description:"沿商路活動的野犬群。"},
  {id:"MON-CAS-010",name:"河林角鹿",tier:"D",habitat:["L-CAS-SHIPWOOD","L-CAS-LEVEEWOODS"],hp:96,atk:26,def:15,drops:["CAS-MAT-008"],description:"河林與堤外林帶常見鹿獸。"},
  {id:"MON-CAS-011",name:"橋下石甲龜",tier:"D",habitat:["L-CAS-RIVERFORD"],hp:110,atk:23,def:24,element:"地",drops:[],description:"主河道礫灘的大型龜獸。"},
  {id:"MON-CAS-012",name:"窯丘晶甲蟲",tier:"D",habitat:["L-CAS-GLASSSAND","D-CAS-GLASSKILN"],hp:105,atk:25,def:22,tags:["invertebrate"],drops:["CAS-MAT-016"],description:"會攝取礦砂形成晶質甲殼。"},
  {id:"MON-CAS-013",name:"蘆灣泥獺",tier:"D",habitat:["L-CAS-PORTMARSH","L-CAS-SOUTHREEDS"],hp:92,atk:27,def:14,tags:["aquatic"],drops:[],description:"大型半水生掠食獸。"},
  {id:"MON-CAS-014",name:"船材林灰狼",tier:"D",habitat:["L-CAS-SHIPWOOD"],hp:94,atk:28,def:15,drops:["CAS-MAT-008"],description:"輪伐林內的狼群。"},
  {id:"MON-CAS-015",name:"磨渠硬殼鼠",tier:"D",habitat:["L-CAS-MILLBANK","D-CAS-WAREHOUSESEWER"],hp:86,atk:24,def:18,drops:[],description:"依附磨坊與舊渠的大型鼠獸。"},
  {id:"MON-CAS-016",name:"南閘長吻魚蜥",tier:"C",habitat:["L-CAS-SOUTHREEDS"],hp:150,atk:34,def:23,element:"水",tags:["aquatic"],drops:["CAS-MAT-007"],description:"低地蘆原的大型水棲魔獸。"},
  {id:"MON-CAS-017",name:"堤林獠豬",tier:"C",habitat:["L-CAS-LEVEEWOODS","D-CAS-LEVEETUNNEL"],hp:165,atk:36,def:25,drops:["CAS-MAT-008"],description:"堤外林帶的大型野豬。"},
  {id:"MON-CAS-018",name:"丘道赤鬃貓",tier:"C",habitat:["L-CAS-WESTTRACK","D-CAS-WINECELLAR"],hp:145,atk:35,def:21,drops:[],description:"西南丘道附近的大型貓科魔獸。"},
  {id:"MON-CAS-019",name:"舊渠泥甲獸",tier:"C",habitat:["D-CAS-WAREHOUSESEWER","D-CAS-DOCKVAULT"],hp:162,atk:34,def:30,element:"地",drops:["CAS-MAT-010"],description:"長期棲息排水與船渠的硬甲魔獸。"},
  {id:"MON-CAS-020",name:"水門鏈齒傀",tier:"C",habitat:["D-CAS-BRIDGEPIER","D-CAS-CANALLOCK"],hp:175,atk:36,def:33,tags:["construct"],drops:["CAS-MAT-014"],description:"早期水門與橋梁使用的機械守衛。"},
  {id:"MON-CAS-021",name:"盟約守庫傀",tier:"C",habitat:["D-CAS-OLDCOUNCIL","D-CAS-BRIDGEPIER","D-CAS-CHARTERARCHIVE"],hp:182,atk:37,def:34,tags:["construct"],drops:["CAS-MAT-015"],description:"用於保護檔案與印庫的舊式構裝。"},
  {id:"MON-CAS-022",name:"廢窯熱晶獸",tier:"C",habitat:["D-CAS-GLASSKILN","D-CAS-WINECELLAR"],hp:158,atk:38,def:22,element:"火",drops:["CAS-MAT-016"],description:"吸收窯爐餘熱與晶砂形成的魔獸。"},
  {id:"MON-CAS-023",name:"深渠鐵鉗蟹",tier:"C",habitat:["D-CAS-DOCKVAULT","D-CAS-CANALLOCK"],hp:190,atk:37,def:36,element:"水",tags:["aquatic"],drops:["CAS-MAT-014"],description:"棲息深渠與舊船塢的大型甲殼魔獸。"},
  {id:"MON-CAS-024",name:"堤心鎖門傀",tier:"C",role:"首領",habitat:["D-CAS-LEVEETUNNEL","D-CAS-CHARTERARCHIVE"],hp:220,atk:41,def:38,tags:["construct"],drops:["CAS-MAT-014","CAS-MAT-015"],description:"高戒備設施的重型構裝守衛，僅在地下城內出現。"}
 ],
 npcs:[
  ["NPC-CAS-001","艾德蒙・瓦勒","城盟議長","L-CAS-CASAVELLE","共同外交、防務、商路協調與議會程序","D",["ORG-CAS-COUNCIL"],"主持共同議會，但沒有命令各成員城市所有內政的權力。"],
  ["NPC-CAS-002","伊莎貝拉・羅恩","卡薩維爾市議長","L-CAS-CASAVELLE","首府市政、地方稅、治安與公共工程","E",["ORG-CAS-COUNCIL"],"清楚區分首府市政與城盟共同職權。"],
  ["NPC-CAS-003","馬庫斯・費恩","城盟書記長","L-CAS-CASAVELLE","議案、表決、成員城授權與條約正本","F",["ORG-CAS-CHANCERY"],"所有共同政策都要能追溯到成員城授權。"],
  ["NPC-CAS-004","賽蓮娜・貝克","首席商法官","L-CAS-CASAVELLE","跨城商法、債契、行會與河運仲裁","E",["ORG-CAS-COURT"],"以特許、契約與港務紀錄裁判。"],
  ["NPC-CAS-005","托馬斯・懷特","白倉總監","L-CAS-WHITEWAREHOUSE","保稅倉、火災、倉位與批發市場","F",["ORG-CAS-CUSTOMS"],"將倉位與安全庫存視為硬限制。"],
  ["NPC-CAS-006","格雷・金橋","金橋市議長","L-CAS-GOLDBRIDGE","橋關、驛馬、道路與北向商隊","E",["ORG-CAS-ROAD"],"主張橋費必須對應實際維修成本。"],
  ["NPC-CAS-007","梅芙・艾倫","橋關監","L-CAS-GOLDBRIDGE","車隊、橋稅、洪水與通行證","F",["ORG-CAS-ROAD"],"掌握即時橋面容量與水位。"],
  ["NPC-CAS-008","奧斯卡・紅瓦","紅瓦市議長","L-CAS-REDTILE","工坊、窯業、行會與消防","E",["ORG-CAS-GUILDS"],"在工坊自由與城市消防之間維持平衡。"],
  ["NPC-CAS-009","莉亞・葛拉斯","玻璃工匠總監","L-CAS-GLASSHILL","玻璃砂、窯火、瓶罐與工坊學徒","F",["ORG-CAS-GUILDS"],"反對無限採砂破壞丘坡。"],
  ["NPC-CAS-010","雷蒙・維爾","維爾諸城議長","L-CAS-VIERPORT","REG-06成員城自治、河海交通與共同議會","D",["ORG-CAS-COUNCIL"],"維護維爾諸城在城盟內的自治席位。"],
  ["NPC-CAS-011","艾蜜莉・托恩","維爾港務總監","L-CAS-VIERPORT","泊位、船塢、潮位、鹽貨與港區治安","E",["ORG-CAS-RIVER"],"以泊位與潮汐決定實際吞吐量。"],
  ["NPC-CAS-012","哈洛德・奈許","船塢行會長","L-CAS-VIERPORT","船材、修船、桶具與工匠分配","F",["ORG-CAS-RIVER"],"依木材存量安排修船優先序。"],
  ["NPC-CAS-013","安妮塔・渠恩","三渠市議長","L-CAS-THREECANAL","運河、糧倉、灌溉與農市","E",["ORG-CAS-WATER"],"乾旱時優先協調飲水、灌溉與航運。"],
  ["NPC-CAS-014","伯恩・米勒","磨潮水磨監","L-CAS-MILLTIDE","水磨、麵粉、農具與水權","F",["ORG-CAS-WATER"],"熟悉每條支渠的水量分配。"],
  ["NPC-CAS-015","多蘿西・洛克","南閘市議長","L-CAS-SOUTHLOCK","堤防、水閘、漁業與南向駁船","E",["ORG-CAS-WATER"],"以堤防安全優先於短期商業收益。"],
  ["NPC-CAS-016","亨利・里德","堤防總監","L-CAS-SOUTHLOCK","堤體、排洪、柳林與緊急動員","F",["ORG-CAS-WATER"],"洪水季會限制地下隧道通行。"],
  ["NPC-CAS-017","克萊兒・維尼","葡藤市議長","L-CAS-VINECITY","葡萄、果酒、旅店與丘陵道路","E",["ORG-CAS-GUILDS"],"在酒稅與旅店競爭間維持地方財政。"],
  ["NPC-CAS-018","朱利安・馬爾","城盟巡防總監","L-CAS-CASAVELLE","共同商路巡防、護送與跨城追緝","C",["ORG-CAS-WATCH"],"只能依共同盟約處理跨城案件，不能任意越權接管地方警備。"],
  ["NPC-CAS-019","娜塔莉・柯德","行會席聯合代表","L-CAS-REDTILE","工坊、商人、勞務與議會行會席","F",["ORG-CAS-GUILDS"],"將不同產業意見帶入共同議會。"],
  ["NPC-CAS-020","菲利普・章印","城盟史檔官","L-CAS-CASAVELLE","城市特許、河港盟約、合併史與共同議會沿革","F",["ORG-CAS-CHANCERY"],"能辨認哪些權力屬共同授權、哪些仍屬地方自治。"]
 ],
 orgs:[
  {id:"ORG-CAS-COUNCIL",name:"卡薩維爾城盟共同議會",kind:"government",tier:"C",base_location_id:"L-CAS-CASAVELLE",description:"成員城市派代表處理共同外交、防務、商路、互認與預算。"},
  {id:"ORG-CAS-CHANCERY",name:"城盟書記與條約院",kind:"government",tier:"C",base_location_id:"L-CAS-CASAVELLE",description:"保存成員城授權、表決、特許與條約正本。"},
  {id:"ORG-CAS-COURT",name:"三港商法庭",kind:"government",tier:"C",base_location_id:"L-CAS-CASAVELLE",description:"處理跨城債契、河運、倉儲與商業仲裁。"},
  {id:"ORG-CAS-CUSTOMS",name:"城盟關稅互認署",kind:"civic",tier:"C",base_location_id:"L-CAS-WHITEWAREHOUSE",description:"維護共同貨單格式、保稅倉與成員城關稅互認。"},
  {id:"ORG-CAS-ROAD",name:"金橋道路與驛務局",kind:"civic",tier:"C",base_location_id:"L-CAS-GOLDBRIDGE",description:"維護橋梁、幹道、驛馬與車隊分流。"},
  {id:"ORG-CAS-GUILDS",name:"城盟行會席聯合院",kind:"civic",tier:"C",base_location_id:"L-CAS-REDTILE",description:"整合工坊、商人、旅店與勞務行會的共同議席。"},
  {id:"ORG-CAS-RIVER",name:"維爾河港務與船塢聯會",kind:"civic",tier:"C",base_location_id:"L-CAS-VIERPORT",description:"協調河海船期、船塢、泊位、船材與港區技術標準。"},
  {id:"ORG-CAS-WATER",name:"三渠南閘水務聯署",kind:"civic",tier:"C",base_location_id:"L-CAS-THREECANAL",description:"統籌跨城運河、水閘、堤防與旱澇應變。"},
  {id:"ORG-CAS-WATCH",name:"城盟商路巡防局",kind:"military",tier:"C",base_location_id:"L-CAS-CASAVELLE",description:"只處理共同商路、護送與跨城案件，各城市仍保有自己的警備。"}
 ],
 offices:[
  {id:"POL-007-O1",title:"城盟議長",authority_tier:"AUTH-5",authority_level:5,scope:"共同議會程序、共同外交、防務協調與盟約授權事項",appointment:"成員城市代表共同推舉，任期制",rights:["AR-002","AR-003","AR-005"],reports_to:null,notes:"不是成員城市的君主。"},
  {id:"POL-007-O2",title:"成員城市議長／市長",authority_tier:"AUTH-4",authority_level:4,scope:"各城市地方行政、地方稅、治安與公共工程",appointment:"依各城市特許制度產生",rights:["AR-003","AR-005"],reports_to:null,parallel_authority_ids:["POL-007-O1"]},
  {id:"POL-007-O3",title:"維爾諸城議長",authority_tier:"AUTH-4",authority_level:4,scope:"REG-06成員城共同協調與維爾港區域事務",appointment:"維爾成員城互選",rights:["AR-003","AR-005"],reports_to:"POL-007-O1"},
  {id:"POL-007-O4",title:"城盟書記長",authority_tier:"AUTH-4",authority_level:4,scope:"共同議案、授權、條約與表決紀錄",appointment:"共同議會任命",rights:["AR-003","AR-005"],reports_to:"POL-007-O1"},
  {id:"POL-007-O5",title:"首席商法官",authority_tier:"AUTH-4",authority_level:4,scope:"跨城商法、債契、河運與仲裁",appointment:"成員城提名、共同議會確認",rights:["AR-005"],reports_to:"POL-007-O1"},
  {id:"POL-007-O6",title:"行會席代表",authority_tier:"AUTH-3",authority_level:3,scope:"工坊、商會、河運與勞務團體議席",appointment:"合法行會依章程推派",rights:["AR-003"],reports_to:"POL-007-O1"},
  {id:"POL-007-O7",title:"港務監／橋關長／水務監",authority_tier:"AUTH-3",authority_level:3,scope:"專業公共行政與跨城基礎設施",appointment:"地方城市或共同機構依法任命",rights:["AR-003","AR-005"],reports_to:"POL-007-O2"},
  {id:"POL-007-O8",title:"市政官／巡防官／書記",authority_tier:"AUTH-2",authority_level:2,scope:"地方市政、治安與文書執行",appointment:"各城市任命",rights:["AR-003"],reports_to:"POL-007-O2"}
 ],
 powerCenters:["卡薩維爾共同議會","維爾諸城代表","各成員城市市議會","三港商法庭","大型行會席","維爾河港務聯會","三渠南閘水務聯署"],
 playerInteraction:"低階玩家主要接觸地方市政、行會、碼頭、運河與商路委託；中階會進入跨城商法、共同巡防與大型水務；所有C級地下設施與共同政治任務仍需成員城授權或公會資格。",
 rulingStructure:"卡薩維爾與維爾河成員城市共同組成城盟議會；城盟議長只主持共同外交、防務、商路、互認與共同預算，各城市保留市政、地方稅、一般司法與警備自治。",
 legalTradition:"城市特許、河港盟約、行會慣例、跨城商法與共同基礎設施協議並行；未明文授權的權力保留給成員城市。",
 succession:"城盟議長採任期制，由成員城市代表共同推舉；各城市依自身特許制度選出市議長或等效首長。",
 identity:"大陸中南部以河網、橋梁、運河與多城市自治構成的自由城盟，政治力量來自共同市場與可退出／修約的盟約授權，而非單一王朝。",
 gameplayRole:"C級自由城盟／跨城商貿、河運、行會政治、商法仲裁、運河水務與城市自治",
 economicBase:["河海轉運","保稅倉","糧運與磨坊","陶器與玻璃","船塢","果酒","橋關與商旅服務"],
 military:["各城市警備","共同商路巡防","港區守備","橋關守衛","水務緊急動員"],
 tensions:["共同權力與地方自治","關稅互認","REG-06與REG-07預算分配","水位與運河用水","港務泊位","行會席利益","糧倉安全庫存"],
 governance:"城盟議長＋成員城市議會＋維爾諸城代表＋商法庭／書記院＋行會席與專業基礎設施聯署",
 tierModel:"城盟C級；一般城郊E～D，C級內容集中於重要商路、舊水門、港渠、檔案與大型野外威脅。",
 centers:["卡薩維爾","維爾港","金橋城","紅瓦市","三渠城","南閘城","葡藤市"],
 mapNotes:"卡薩維爾自由城盟沿用POL-007，完整涵蓋REG-06與REG-07。兩區域不是中央直轄省，而是不同成員城市沿河網與商路形成的自治城市帶。",
 regionUpdates:{
  "REG-06":{name:"維爾河港渠平原",map_status:"playable_current",recommended_tier:"C",playable_tier_band:"E～C",terrain:"河網平原、港灣、運河、低地堤防與農田",regional_identity:"維爾港、三渠、南閘等成員城市構成城盟的河海與糧運腹地。"},
  "REG-07":{name:"卡薩維爾商路盆地",map_status:"playable_current",recommended_tier:"C",playable_tier_band:"E～C",terrain:"商道丘陵、城市化盆地、橋梁與葡萄丘",regional_identity:"卡薩維爾共同議會、金橋、紅瓦工坊與葡藤丘市構成城盟政治與工藝核心。"}
 },
 links:[
  ["L-CAS-CASAVELLE","L-CAS-WHITEWAREHOUSE",.8],["L-CAS-CASAVELLE","L-CAS-COUNCILMEADOW",.8],["L-CAS-WHITEWAREHOUSE","L-CAS-WAREHOUSEDITCH",.7],["L-CAS-WAREHOUSEDITCH","D-CAS-WAREHOUSESEWER",.8],["L-CAS-CASAVELLE","D-CAS-OLDCOUNCIL",1],["L-CAS-CASAVELLE","D-CAS-CHARTERARCHIVE",1],
  ["L-CAS-CASAVELLE","L-CAS-GOLDBRIDGE",2],["L-CAS-GOLDBRIDGE","L-CAS-GOLDROAD",.8],["L-CAS-GOLDBRIDGE","L-CAS-RIVERFORD",.8],["L-CAS-RIVERFORD","D-CAS-BRIDGEPIER",1],
  ["L-CAS-CASAVELLE","L-CAS-REDTILE",2.2],["L-CAS-REDTILE","L-CAS-GLASSHILL",1],["L-CAS-GLASSHILL","L-CAS-GLASSSAND",.7],["L-CAS-REDTILE","L-CAS-DYEFLATS",.8],["L-CAS-GLASSSAND","D-CAS-GLASSKILN",.9],
  ["L-CAS-CASAVELLE","L-CAS-VIERPORT",4],["L-CAS-VIERPORT","L-CAS-PORTMARSH",.8],["L-CAS-VIERPORT","L-CAS-SHIPWOOD",1.2],["L-CAS-PORTMARSH","D-CAS-DOCKVAULT",1],
  ["L-CAS-VIERPORT","L-CAS-THREECANAL",2],["L-CAS-THREECANAL","L-CAS-MILLTIDE",1],["L-CAS-THREECANAL","L-CAS-CANALFIELDS",.8],["L-CAS-MILLTIDE","L-CAS-MILLBANK",.7],["L-CAS-MILLBANK","D-CAS-CANALLOCK",1],
  ["L-CAS-THREECANAL","L-CAS-SOUTHLOCK",2.2],["L-CAS-SOUTHLOCK","L-CAS-SOUTHREEDS",.8],["L-CAS-SOUTHLOCK","L-CAS-LEVEEWOODS",1],["L-CAS-LEVEEWOODS","D-CAS-LEVEETUNNEL",1],
  ["L-CAS-CASAVELLE","L-CAS-VINECITY",2.5],["L-CAS-VINECITY","L-CAS-VINEHILLS",.8],["L-CAS-VINECITY","L-CAS-WESTTRACK",1],["L-CAS-VINEHILLS","D-CAS-WINECELLAR",1]
 ],
 hooks:[
  ["HOOK-CAS-01","共同預算缺口","維爾港與首府對新橋維修分攤比例爭執，玩家需核對貨流、使用量與舊盟約。","C","REG-07"],
  ["HOOK-CAS-02","白倉失火疑雲","保稅倉火警後多批貨單對不上，需分辨事故、保險詐欺與走私。","D","REG-07"],
  ["HOOK-CAS-03","金橋水位封路","洪水迫使橋關限制車流，商會要求例外放行高價貨物。","D","REG-07"],
  ["HOOK-CAS-04","紅瓦窯料短缺","玻璃砂配額被提早耗盡，必須查明過採、黑市或統計錯誤。","D","REG-07"],
  ["HOOK-CAS-05","維爾港泊位爭端","兩支大型商隊爭同一批深水泊位，商法庭要求依契約時序裁定。","C","REG-06"],
  ["HOOK-CAS-06","三渠爭水","旱季農田、磨坊與船運同時要求水量，玩家協助水務聯署實地測量。","C","REG-06"],
  ["HOOK-CAS-07","南閘堤心異響","堤體內舊構裝重新啟動，需在不破壞防洪結構下清理隧道。","C","REG-06"],
  ["HOOK-CAS-08","封印章庫異常","最早城盟特許狀封印庫觸發守衛，必須取得共同議會與成員城雙重授權進入。","C","REG-07"]
 ],
 life:[
  ["LIFE-CAS-01","春季商隊潮","金橋與首府住宿、驛馬和倉位價格上升。","REG-07"],["LIFE-CAS-02","維爾港風暴週","港區減少泊位並提高修船需求。","REG-06"],
  ["LIFE-CAS-03","三渠放水輪值","灌溉與航運依輪值表調整，部分支渠暫停船行。","REG-06"],["LIFE-CAS-04","紅瓦窯火季","玻璃、陶器產量上升，燃料與採砂配額變得緊張。","REG-07"],
  ["LIFE-CAS-05","共同議會季會","各成員城代表進入首府，旅宿、抄寫與護衛需求上升。","REG-07"],["LIFE-CAS-06","秋糧入倉","三渠與白倉大量接貨，糧價下降但倉位成為瓶頸。","REG-06"],
  ["LIFE-CAS-07","南閘汛期","水務聯署優先防洪，低地野外與地下隧道可能暫停開放。","REG-06"],["LIFE-CAS-08","葡藤收穫節","果酒、旅店與西南商隊需求上升。","REG-07"]
 ],
 lore:[
  ["LORE-CAS-01","history","城盟由盟約而不是征服形成","卡薩維爾與維爾河諸城因橋梁、河運、商法與共同巡防逐步形成自由城盟。"],
  ["LORE-CAS-02","politics","城盟議長不是共同君主","城盟議長只執行成員城明文授權的共同事務，各城市保留地方稅、一般司法與市政自治。"],
  ["LORE-CAS-03","law","未授權權力歸成員城市","共同機構的權力來源是城市特許與盟約；沒有共同條款時，案件回到所在地城市處理。"],
  ["LORE-CAS-04","economy","繁榮來自物流容量","城盟市場受泊位、倉位、橋面容量、水位、窯料與糧倉安全庫存限制，不能無限買賣。"],
  ["LORE-CAS-05","geography","REG-06與REG-07是一個政治體內的兩條城市帶","REG-07偏首府、橋路與工坊；REG-06偏河海港渠與糧運，兩者共同構成城盟。"],
  ["LORE-CAS-06","security","共同巡防不取代地方警備","城盟巡防只處理共同商路、護送與跨城案件，各城市仍有自己的治安體系。"]
 ]
};

const dawnData=buildPolity(DAWN);
const casData=buildPolity(CAS);
function runDawnLawDepthAudit(){return auditPolity(DAWN)}
function runCasavelleDepthAudit(){return auditPolity(CAS)}
DB.meta=DB.meta||{};DB.meta.dawn_casavelle_depth_revision=REV;
dawnData.initial_audit=runDawnLawDepthAudit();casData.initial_audit=runCasavelleDepthAudit();
globalThis.runDawnLawDepthAudit=runDawnLawDepthAudit;
globalThis.runCasavelleDepthAudit=runCasavelleDepthAudit;
globalThis.QUNLU_DAWN_CASAVELLE=Object.freeze({version:REV,dawn:dawnData,casavelle:casData,audit:()=>({pass:runDawnLawDepthAudit().pass&&runCasavelleDepthAudit().pass,dawn:runDawnLawDepthAudit(),casavelle:runCasavelleDepthAudit()})});
CORE?.registerModule?.("src/dawn-casavelle-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();