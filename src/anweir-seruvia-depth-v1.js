/* 群陸旅誌：安威爾帝國＋瑟露維亞精靈王庭完整區域深化 CURRENT-2.04.0
 * ANWEIR-SERUVIA-DEPTH-1.0
 * POL-013 / REG-13 與 POL-012 / REG-12：
 * 政體、權力結構、城鎮、野外、地下城、怪物、素材、NPC、組織、經濟與活世界鉤子。
 * REG-19 斷境無主地維持獨立緩衝區，不納入任一政治體。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.04.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.04.0";
const REV="ANWEIR-SERUVIA-DEPTH-1.0";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(k){DB[k]=Array.isArray(DB[k])?DB[k]:[];return DB[k]}
function row(k,id,idKey="id"){return (DB[k]||[]).find(x=>x?.[idKey]===id)||null}
function upsert(k,v,idKey="id"){const a=arr(k),i=a.findIndex(x=>x?.[idKey]===v[idKey]);if(i>=0)a[i]=Object.assign(a[i],v);else a.push(v);return i>=0?a[i]:v}
function loc(id){return row("locations",id)}
function addLink(a,b,h){const x=loc(a);if(!x||!loc(b))return;x.links=Array.isArray(x.links)?x.links:[];const old=x.links.find(e=>e?.to===b);if(old)old.hours=h;else x.links.push({to:b,hours:h})}
function twoWay(a,b,h){addLink(a,b,h);addLink(b,a,h)}
function econ(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return{prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}
function itemRow(x,C,gatherable){return{id:x.id,name:x.name,kind:"material",type:"素材",catalog_group:"素材",stackable:true,category:x.category||"material",tier:x.tier||"E",weight:x.weight??0.2,
 value:x.price||12,base_price_copper:x.price||12,price_copper:x.price||12,rarity:x.rarity||"common",regional_origin_id:C.regionId,regional_origin_ids:[C.regionId],
 source_region_ids:[C.regionId],source_polity_id:C.polityId,wild_gather_eligible:gatherable.has(x.id),economy_tags:x.tags||[],
 description:x.description||x.name+"是"+C.name+"受季節、配額與資源承載限制的地方素材。"}}
function monsterRow(x,C){
 const drops=[...(x.drops||[])],tags=[...(x.tags||["wildlife"])],damageByTier={F:[2,5],E:[5,10],D:[9,17],C:[14,25],B:[22,38]};
 return{id:x.id,name:x.name,tier:x.tier,role:x.role||"一般",lore_role:x.role||"一般",region:C.name,category:tags.includes("construct")?"構裝體":tags.includes("plant")?"植物系":tags.includes("spirit")?"精靈系":"野獸與一般魔物系",
  habitat:[...(x.habitat||[])],habitats:[...(x.habitat||[])],habitat_location_ids:[...(x.habitat||[])],hp:x.hp,attack:x.atk,defense:x.def,
  magicDefense:x.mdef??Math.max(2,Math.round((x.def||4)*.8)),accuracy:x.acc||70,initiative:x.init||10,damage:[...(x.damage||damageByTier[x.tier]||[2,5])],
  primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),description:x.description,
  near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,political_entity_id:C.polityId,
  ecology_profile:{body_scale:x.scale||"medium",tags},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:drops},
  loot_materials:drops.map((id,i)=>({id,chance:Math.max(.16,(x.lootChance??.44)-i*.08),min:1,max:x.maxDrop||1}))};
}
function buildPolity(C){
 const town=x=>{
  const base=clone(loc(x.id)||{});
  return Object.assign(base,{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:C.name,description:x.description,
   facilities:uniq([...(base.facilities||[]),...(x.facilities||[])]),links:Array.isArray(base.links)?base.links:[],safety_score:x.safety??89,
   safety_label:(x.safety??89)>=93?"安穩":(x.safety??89)>=86?"穩定":"警戒",risk:Math.max(2,100-(x.safety??89)),world_region_id:C.regionId,region_id:C.regionId,
   political_entity_id:C.polityId,polity_id:C.polityId,culture_id:C.cultureId,history_scope:C.name+"／"+x.zone,political_role:x.role,
   province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:C.realmId,local_authority:clone(x.authority),local_economy:clone(x.economy),depth_zone_id:x.zoneId});
 };
 const field=x=>{
  const base=clone(loc(x.id)||{}),ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{},ep=clone(base.encounter_profile||ref.encounter_profile||{});
  Object.assign(ep,{zone:x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:!!x.allowMagical,
   allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"standard",preferred_monster_ids:[...(x.preferred||[])]});
  return Object.assign(base,{id:x.id,name:x.name,kind:x.kind||"wild",tier:x.tier,world_tier:x.tier,size:x.size||"地方區域",region:C.name,description:x.description,
   world_region_id:C.regionId,region_id:C.regionId,political_entity_id:C.polityId,polity_id:C.polityId,culture_id:C.cultureId,province_region_id:x.province,
   settlement_region_id:x.smap,realm_region_map_id:C.realmId,links:Array.isArray(base.links)?base.links:[],risk:x.risk??22,
   safety_score:x.safety??Math.max(20,100-(x.risk??22)),safety_label:(x.risk??22)<=15?"安穩":(x.risk??22)<=25?"普通":(x.risk??22)<=35?"警戒":"危險",
   encounter_profile:ep,tags:uniq([...(base.tags||[]),...(x.tags||[])]),gather:uniq([...(base.gather||[]),...(x.gather||[])]),
   mining:uniq([...(base.mining||[]),...(x.mining||[])]),woodcut:uniq([...(base.woodcut||[]),...(x.woodcut||[])]),fish:uniq([...(base.fish||[]),...(x.fish||[])]),
   hunt:uniq([...(base.hunt||[]),...(x.hunt||[])]),explore:x.explore||base.explore||[],preferred_monster_ids:x.preferred||[],
   resource_capacity:clone(x.resourceCapacity||base.resource_capacity||{forage:16,hunt:8,ore:5,wood:8,water:8}),resource_regen_hours:x.regen??base.resource_regen_hours??48,
   hunt_requires_battle:true,depth_zone_id:x.zoneId,access_rule:x.accessRule||null});
 };
 const gatherable=new Set([...C.fields,...C.dungeons].flatMap(x=>[...(x.gather||[]),...(x.mining||[]),...(x.woodcut||[]),...(x.fish||[]),...(x.hunt||[])]));
 for(const x of C.materials)upsert("items",itemRow(x,C,gatherable));
 for(const x of C.towns)upsert("locations",town(x));
 for(const x of C.fields)upsert("locations",field({...x,kind:"wild"}));
 for(const x of C.dungeons)upsert("locations",field({...x,kind:"dungeon",zoneClass:"dungeon",allowMagical:true,space:x.space||"standard"}));
 for(const x of C.monsters)upsert("monsters",monsterRow(x,C));
 for(const n of C.npcs)upsert("regional_npc_archetypes",{id:n[0],name:n[1],role:n[2],tier:rank(n[5])>=rank("C")?"C":n[5],location_id:n[3],knowledge_scope:n[4],
  combat_tier_ceiling:n[5],organization_ids:n[6],services:["地方情報","委託引介"],description:n[7],region_id:C.regionId,polity_id:C.polityId,culture_id:C.cultureId});
 for(const o0 of C.orgs){
  const o=upsert("world_organizations",{...o0,political_entity_id:C.polityId,region_id:C.regionId,scope:o0.tier==="B"?"kingdom":"local_regional",category:o0.kind,
   alignment:o0.kind==="religious"?"light":"neutral",primary_facility:o0.kind==="religious"?"church":"guild",min_join_level:1,join_reputation:0,visibility:"public",legal_status:"legal",
   joinable:o0.joinable!==false,mission_issuer:true,can_be_enemy:true,contact_location_ids:uniq([...(o0.contact_location_ids||[]),o0.base_location_id]),
   member_bonus:o0.member_bonus||{id:"BONUS-"+o0.id,text:C.name+"職能訓練",effects:o0.kind==="military"?{defense_pct:3}:o0.kind==="craft"?{craftSuccess:3}:{perception:3}},
   history:o0.history||[C.history],history_summary:(o0.history||[C.history]).join(" "),current_state:o0.current_state||C.currentState,
   signature:o0.signature||o0.description,distinctive_features:o0.distinctive_features||[o0.description,C.orgDistinctive]});
  o.associated_polity_ids=uniq([...(o.associated_polity_ids||[]),C.polityId]);
 }
 for(const h of C.hooks)upsert("regional_adventure_hooks",{id:h[0],title:h[1],premise:h[2],tier:h[3],region_id:C.regionId,polity_id:C.polityId});
 for(const e of C.life)upsert("regional_life_events",{id:e[0],name:e[1],text:e[2],region_id:C.regionId,polity_id:C.polityId});
 const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{}),verify=verifyKeys.includes("verified")?"verified":(verifyKeys.includes("recorded")?"recorded":(verifyKeys[0]||"recorded"));
 for(const l of C.lore)upsert("lore_records",{id:l[0],category:l[1],title:l[2],text:l[3],scope_type:"polity",scope_id:C.polityId,verification:verify,era_id:"ERA-05",
  source_refs:[C.polityId,C.regionId],tags:[C.name,"區域深化"],common_knowledge:true,political_entity_id:C.polityId,region_ids:[C.regionId],visibility:"public"});
 for(const z of C.zones){
  const towns=C.towns.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=C.fields.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=C.dungeons.filter(x=>x.zoneId===z.id).map(x=>x.id);
  upsert("province_region_maps",{id:z.province,layer:"province_region",name:z.name,display_name:C.name+"・"+z.name,parent_realm_map_id:C.realmId,political_entity_id:C.polityId,
   world_region_id:C.regionId,world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:z.role,depth_zone_id:z.id});
  upsert("settlement_region_maps",{id:z.smap,name:z.name+"區域圖",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",
   location_ids:[...towns,...wilds,...dungeons],role:z.role,depth_zone_id:z.id});
 }
 let realm=row("realm_region_maps",C.realmId);
 if(!realm)realm=upsert("realm_region_maps",{id:C.realmId,layer:"realm_region",political_entity_id:C.polityId,world_region_id:C.regionId,name:C.name+"區域地圖",world_tier:C.worldTier});
 Object.assign(realm,{name:C.name+"區域地圖",display_name:C.name,political_entity_id:C.polityId,world_region_ids:[C.regionId],core_region_id:C.regionId,capital:C.capital,
  province_region_ids:C.zones.map(x=>x.province),regional_centers:[...C.centers],map_status:"playable_current",notes:C.mapNotes});
 const region=row("world_regions",C.regionId);if(region)Object.assign(region,C.regionUpdate);
 const polity=row("political_entities",C.polityId);
 if(polity)Object.assign(polity,{name:C.name,government_type:C.governmentType,capital:C.capital,map_status:"playable_current",world_tier:C.worldTier,current_title:C.currentTitle,top_office:C.topOffice,
  ruling_structure:C.rulingStructure,legal_tradition:C.legalTradition,succession_method:C.succession,identity:C.identity,gameplay_role:C.gameplayRole,secondary_centers:C.centers.filter(x=>x!==C.capital),
  economic_base:C.economicBase,military_structure:C.military,current_tensions:C.tensions,internal_regions:C.zones.map(x=>({id:x.id,name:x.name,role:x.role,tier:x.tier})),
  key_organization_ids:uniq([...(polity.key_organization_ids||[]),...C.orgs.map(x=>x.id)]),external_relations:C.externalRelations});
 let auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===C.polityId);
 if(!auth){auth={polity_id:C.polityId,hierarchy_version:"AUTHORITY-1.0",office_nodes:[]};arr("polity_authority_profiles").push(auth)}
 auth.top_office_ids=[C.offices[0].id];auth.office_nodes=C.offices.map(clone);auth.rival_power_centers=[...C.powerCenters];auth.player_interaction_summary=C.playerInteraction;auth.succession_method=C.succession;
 upsert("regional_content_profiles",{id:"RCP-"+C.code,region_id:C.regionId,polity_id:C.polityId,region_name:C.name,recommended_tier:"F～B",identity:C.identity,terrain:C.regionUpdate.terrain,
  common_exports:C.exports,common_imports:C.imports,food_staples:C.foods,recurring_risks:C.recurringRisks});
 upsert("regional_economy_profiles",{id:"ECO-"+C.code,region_id:C.regionId,polity_id:C.polityId,exports:C.exports,imports:C.imports,notes:C.economyNotes});
 for(const [a,b,h] of C.links)twoWay(a,b,h);
 DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
 DB.content_link_index.location_content=DB.content_link_index.location_content&&typeof DB.content_link_index.location_content==="object"?DB.content_link_index.location_content:{};
 DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
 for(const l of [...C.towns,...C.fields,...C.dungeons].map(x=>loc(x.id)).filter(Boolean))DB.content_link_index.location_content[l.id]={
  facility_ids:[...(l.facilities||[])],gather_item_ids:uniq([...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[])]),fish_item_ids:[...(l.fish||[])],
  encounter_monster_ids:C.monsters.filter(m=>(m.habitat||[]).includes(l.id)).map(m=>m.id),organization_ids:C.orgs.filter(o=>o.base_location_id===l.id||(o.contact_location_ids||[]).includes(l.id)).map(o=>o.id)};
 for(const it of C.materials){const s=DB.content_link_index.item_sources[it.id]=DB.content_link_index.item_sources[it.id]||{};for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];
  for(const l0 of [...C.fields,...C.dungeons])if(uniq([...(l0.gather||[]),...(l0.mining||[]),...(l0.woodcut||[]),...(l0.fish||[]),...(l0.hunt||[])]).includes(it.id)&&!s.gather_locations.includes(l0.id))s.gather_locations.push(l0.id);
  for(const m of C.monsters)if((m.drops||[]).includes(it.id)&&!s.monster_drops.includes(m.id))s.monster_drops.push(m.id);
 }
 const system={version:REV,release:RELEASE,political_entity_id:C.polityId,region_id:C.regionId,world_tier:C.worldTier,zone_ids:C.zones.map(x=>x.id),town_ids:C.towns.map(x=>x.id),
  wild_ids:C.fields.map(x=>x.id),dungeon_ids:C.dungeons.map(x=>x.id),monster_ids:C.monsters.map(x=>x.id),npc_ids:C.npcs.map(x=>x[0]),organization_ids:C.orgs.map(x=>x.id),material_ids:C.materials.map(x=>x.id),
  governance:C.governance,tier_model:C.tierModel,save_compatible:true};
 DB[C.systemKey]=system;return system;
}
function auditPolity(C){
 const issues=[],p=row("political_entities",C.polityId),rm=row("realm_region_maps",C.realmId),r=row("world_regions",C.regionId),auth=(DB.polity_authority_profiles||[]).find(x=>x?.polity_id===C.polityId);
 if(!p||p.name!==C.name)issues.push("政治體名稱失步:"+C.polityId);
 if(p?.capital!==C.capital)issues.push("首都失步:"+C.name);
 if(!rm||rm.map_status!=="playable_current")issues.push("國域地圖未啟用:"+C.name);
 if(!r||r.map_status!=="playable_current")issues.push("大區未啟用:"+C.regionId);
 if(C.zones.length!==7)issues.push(C.name+"治理區應為7");
 if(C.towns.length!==9)issues.push(C.name+"城鎮應為9");
 if(C.fields.length!==15)issues.push(C.name+"野外應為15");
 if(C.dungeons.length!==10)issues.push(C.name+"地下城應為10");
 if(C.monsters.length!==24)issues.push(C.name+"怪物應為24");
 if(C.npcs.length!==20)issues.push(C.name+"核心NPC應為20");
 if(C.orgs.length!==8)issues.push(C.name+"組織應為8");
 if(C.materials.length!==16)issues.push(C.name+"素材應為16");
 for(const id of [...C.towns,...C.fields,...C.dungeons].map(x=>x.id)){const l=loc(id);if(!l){issues.push("地點缺失:"+id);continue}if(l.political_entity_id!==C.polityId||l.region_id!==C.regionId)issues.push("地點主權錯誤:"+id);if(l.kind!=="town"&&l.hunt_requires_battle!==true)issues.push("野外打獵未鎖戰鬥:"+id)}
 for(const z of C.zones){const pr=row("province_region_maps",z.province),sm=row("settlement_region_maps",z.smap);if(!pr||!sm)issues.push("區域地圖缺失:"+z.name)}
 for(const m of C.monsters){const x=row("monsters",m.id);if(!x)issues.push("怪物缺失:"+m.id);else{if(rank(x.tier)>rank("B"))issues.push("怪物超過B級:"+m.id);if(x.near_town_eligible&&rank(x.tier)>rank("E"))issues.push("城鎮近郊怪物超階:"+m.id);if(x.loot_profile?.fallback_policy!=="none")issues.push("掉落fallback未關閉:"+m.id);for(const d of x.loot_materials||[])if(!row("items",d.id))issues.push("掉落素材缺失:"+m.id+"->"+d.id)}}
 for(const n of C.npcs){const x=row("regional_npc_archetypes",n[0]);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n[0]);if(x&&rank(x.combat_tier_ceiling)>rank("C"))issues.push("核心NPC一般戰力超過C級:"+n[0])}
 for(const o of C.orgs)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 for(const o of C.offices)if(!auth?.office_nodes?.some(x=>x.id===o.id))issues.push("政治權力節點缺失:"+o.id);
 if(!C.dungeons.some(x=>x.tier==="B")||!C.monsters.some(x=>x.tier==="B"))issues.push(C.name+"缺少受控B級內容");
 if(C.fields.some(x=>rank(x.tier)>rank("C")))issues.push(C.name+"一般野外出現B級以上");
 if(C.towns.some(x=>x.tier==="B"&&x.id!==C.capitalId))issues.push(C.name+"非首都城鎮不應以B級常態化");
 if((DB.locations||[]).some(x=>x?.depth_zone_id?.startsWith(C.zonePrefix)&&x?.region_id==="REG-19"))issues.push(C.name+"內容誤吞併斷境REG-19");
 for(const sid of C.starterIds)if(!loc(sid))issues.push("既有新手區節點缺失:"+sid);
 return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:C.zones.length,towns:C.towns.length,wilds:C.fields.length,dungeons:C.dungeons.length,monsters:C.monsters.length,npcs:C.npcs.length,organizations:C.orgs.length,materials:C.materials.length,b_tier_dungeons:C.dungeons.filter(x=>x.tier==="B").length}};
}

const ANWEIR={
 code:"ANW-01",systemKey:"anweir_empire",zonePrefix:"ANW-Z-",name:"安威爾帝國",polityId:"POL-013",regionId:"REG-13",cultureId:"CUL-013",realmId:"RMAP-POL-013",worldTier:"B",capital:"深砧王廳",capitalId:"L-ANW-DEEPANVIL",
 governmentType:"帝國",currentTitle:"安威爾皇帝",topOffice:"安威爾皇帝",
 governance:"安威爾皇帝＋帝國石冠議會＋大氏族王／山廳領主＋礦律法院／工坊議席＋關門與坑道官署",
 tierModel:"帝國B級；一般城鎮與山地F～C；B級只存在初代皇爐與深界封印廊等受控深層，不進入普通野外遭遇。",
 history:"安威爾由冠脊諸山廳、氏族礦權與大型工坊在長期共同防務、礦道維護與商路協議中形成帝國。",
 currentState:"帝國正在平衡礦脈壓力、工坊燃料、氏族席次、南門通行與更深層黑月主權的邊界安全。",
 orgDistinctive:"礦權、爐權、坑道維護與氏族責任必須能追溯到石律與登記簿。",
 identity:"大陸西北方、以矮人為主的多族群山地帝國。皇室統合山廳、氏族、礦脈與工坊，但礦權、祖墓、爐權與山口義務仍受帝國石律及各氏族合法權利限制。",
 gameplayRole:"B級山地工業帝國／礦業、鍛造、氏族政治、山口商路、深層主權邊界與古代工坊探索",
 rulingStructure:"安威爾皇帝掌共同外交、帝國軍令、南門與主要幹道、皇領礦廳及中央任命；帝國石冠議會由大氏族王、主要山廳、礦脈領主與工坊議席構成，對皇統承認、跨廳礦權、共同工程與大規模動員具有法定權限。",
 legalTradition:"帝國山律、氏族石律、礦脈登記法、工匠誓約與山廳習慣法並行；地下所有權依入口、礦脈登記、維護責任與歷史石契判定，不能只看地表疆界。",
 succession:"皇位以皇統世襲為主，候位者必須取得帝國石冠議會與主要氏族法定承認；未完成承認前可由攝政維持行政，但不得永久重劃氏族礦權。",
 economicBase:["黑鐵與精鋼冶煉","石材與建築構件","工具與武具","礦道運輸","高山木材","山羊畜產","西海崖海運"],
 military:["帝國盾衛","山廳戰團","南門關軍","坑道守備","工兵與礦道救援隊","氏族依法定額提供的軍役"],
 tensions:["皇室與大氏族議席","礦脈配額與枯竭風險","爐火燃料與林地輪伐","南門商路安全","深層黑月主權爭議","舊礦事故與工匠責任"],
 centers:["深砧王廳","冠脊南門堡","鐵松村","黑脈城","七爐市","海鎚港","雪砧鎮","石律城","深界堡"],
 exports:["黑鐵","精鋼工具","石材","鍛造品","機械零件","硬木","山地皮革"],imports:["穀物","藥草","鹽","布匹","海產","高階煉金材料"],foods:["黑麥硬餅","燻羊肉","根菜燉鍋","礦鹽湯","黑啤","硬乳酪"],
 recurringRisks:["礦坑坍塌","瓦斯與粉塵","暴雪封山","山口落石","礦權糾紛","燃料短缺","深層構裝失控"],
 economyNotes:"礦脈不是無限資源。每個採掘區受礦層品位、坑道安全、支撐木、排水、勞力、運輸與帝國配額限制；大工坊的收購預算與爐期也限制市場吞吐。",
 externalRelations:[
  {name:"斷境無主地",relation:"buffer_frontier",note:"帝國南界止於冠脊與裂脊北段；REG-19不是安威爾領土。"},
  {name:"黑月深庭",relation:"subterranean_sovereignty_dispute",note:"僅在REG-13更深層礦脈存在重疊與爭議；地表仍屬安威爾，不把黑月深庭畫成地表國境。"},
  {name:"阿斯戴爾王國",relation:"trade_route",note:"西冠大道與安威爾南門是主要貿易通路。"},
  {name:"瑟露維亞精靈王庭",relation:"indirect_trade",note:"雙方由斷境無主地隔開，往來主要依西南林境路與中立商站。"}
 ],
 regionUpdate:{name:"安威爾山地",map_status:"playable_current",recommended_tier:"B",playable_tier_band:"F～B",terrain:"冠脊高山、冰蝕谷、礦脈山廳、西北海崖、針葉林與多層礦道",regional_identity:"安威爾皇室、氏族山廳、礦脈工坊與南門商路共同形成的西北山地帝國；更深地層另有黑月深庭主權爭議。"},
 mapNotes:"POL-013／REG-13沿用既有世界地圖。地表完整屬安威爾帝國；POL-020只在REG-13的subterranean層保留既有重疊主權。REG-19斷境維持獨立無主緩衝地。",
 zones:[
  {id:"ANW-Z-01",name:"深砧皇領",tier:"B",province:"PROV-ANW-01",smap:"SMAP-ANW-01",seat:"L-ANW-DEEPANVIL",role:"皇座、帝國石冠議會、中央檔案、礦權登記與大型工坊中樞"},
  {id:"ANW-Z-02",name:"冠脊南門領",tier:"C",province:"PROV-ANW-02",smap:"SMAP-ANW-02",seat:"L-ANW-SOUTHGATE",role:"安威爾南門、商路、關稅、山口防務與斷境方向交通"},
  {id:"ANW-Z-03",name:"鐵松外廳",tier:"F",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",seat:"L-START-IRONPINE",role:"新人可接觸的外圍礦木村、低階採掘、山坡採集與礦道訓練區"},
  {id:"ANW-Z-04",name:"黑脈工礦廳",tier:"C",province:"PROV-ANW-04",smap:"SMAP-ANW-04",seat:"L-ANW-BLACKVEIN",role:"黑鐵礦、排水、冶煉、礦車路網與工坊原料"},
  {id:"ANW-Z-05",name:"西海崖山廳",tier:"C",province:"PROV-ANW-05",smap:"SMAP-ANW-05",seat:"L-ANW-SEAHAMMER",role:"海崖港、索道、鹽貨、船運與西岸採石"},
  {id:"ANW-Z-06",name:"雪砧高嶺",tier:"C",province:"PROV-ANW-06",smap:"SMAP-ANW-06",seat:"L-ANW-SNOWANVIL",role:"高山牧地、寒地礦材、雪崩監測與北冠山徑"},
  {id:"ANW-Z-07",name:"深界礦廊",tier:"B",province:"PROV-ANW-07",smap:"SMAP-ANW-07",seat:"L-ANW-DEEPWARD",role:"上層帝國礦道與更深黑月主權之間的封印、測界、救援與受控探索帶"}
 ],
 towns:[
  {id:"L-ANW-DEEPANVIL",name:"深砧王廳",zoneId:"ANW-Z-01",zone:"深砧皇領",province:"PROV-ANW-01",smap:"SMAP-ANW-01",tier:"B",size:"帝都山廳／超大型地下城邦",safety:96,role:"安威爾首都、皇座、石冠議會與中央礦權檔案所在地",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic","church"],authority:{title:"安威爾皇帝／石冠議會",tier:"AUTH-7"},economy:econ(91,"極繁榮",["帝國行政","大型鍛造","礦權交易","工匠學院","跨區商隊"],["高階礦材配額","爐期與燃料限制","深層區需許可"],1.09,1.20,1.32,1.28),description:"沿巨大花崗岩穹頂與古礦柱擴展的山中帝都。皇廳、議會環廳、礦權檔案庫與七座大型公共爐構成核心，城市依通風、排水與運輸容量限制人口與產能。"},
  {id:"L-ANW-STONELAW",name:"石律城",zoneId:"ANW-Z-01",zone:"深砧皇領",province:"PROV-ANW-01",smap:"SMAP-ANW-01",tier:"C",size:"法務與工匠城",safety:94,role:"礦契、工坊爭議、工程驗收與氏族仲裁",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"帝國礦律大法官",tier:"AUTH-5"},economy:econ(80,"繁榮",["礦契","工程驗收","工具交易","書記服務"],["案件與工程期造成波動"],1.04,1.10,1.18,1.16),description:"以刻滿判例與礦契的石碑大道聞名，許多跨氏族礦權、事故責任與工坊契約在此審理。"},
  {id:"L-ANW-SOUTHGATE",name:"冠脊南門堡",zoneId:"ANW-Z-02",zone:"冠脊南門領",province:"PROV-ANW-02",smap:"SMAP-ANW-02",tier:"C",size:"大型山關堡城",safety:92,role:"西冠大道與西南林境路北端的關隘、商檢與山口防務",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"南門大關守",tier:"AUTH-5"},economy:econ(75,"興盛",["關稅","馱運","商隊維修","山路補給"],["風雪與落石","斷境局勢"],1.05,1.08,1.14,1.11),description:"控制安威爾南側最重要的大型車隊山口；堡城之外即逐步轉為破碎邊地，帝國巡邏不宣稱REG-19主權。"},
  {id:"L-START-IRONPINE",name:"鐵松村",zoneId:"ANW-Z-03",zone:"鐵松外廳",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"F",size:"新手礦木村",safety:91,role:"低階礦木採集、新手公會委託與外圍山路補給",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"鐵松村議事長／礦路監",tier:"AUTH-2"},economy:econ(72,"穩定",["青銅與黑鐵淺礦","工具維修","木料"],["食糧與藥材依賴輸入","採掘壓力"],1.01,1.04,1.07,1.06),description:"沿用既有新手村；只開放低階淺礦、林坡與已標記礦道，較高品位礦層由山廳封鎖。"},
  {id:"L-ANW-BLACKVEIN",name:"黑脈城",zoneId:"ANW-Z-04",zone:"黑脈工礦廳",province:"PROV-ANW-04",smap:"SMAP-ANW-04",tier:"C",size:"大型工礦城",safety:90,role:"黑鐵礦、礦車、排水與初煉中心",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"黑脈山廳王／總坑道監",tier:"AUTH-5"},economy:econ(84,"繁榮",["黑鐵","焦炭","礦車","初煉錠"],["礦層品位下降","排水與支撐成本"],1.03,1.17,1.23,1.21),description:"多層坑道與地面冶煉臺連成的工礦城，產量以礦層品位、坑道支撐和排水能力計算，不允許無限採掘。"},
  {id:"L-ANW-SEVENFORGE",name:"七爐市",zoneId:"ANW-Z-04",zone:"黑脈工礦廳",province:"PROV-ANW-04",smap:"SMAP-ANW-04",tier:"C",size:"工坊城市",safety:92,role:"精煉、工具、武具、機械零件與工匠議席中心",facilities:["inn","general","guild","blacksmith","tailor","alchemy","clinic"],authority:{title:"七爐工坊議長",tier:"AUTH-4"},economy:econ(87,"繁榮",["精鋼加工","工具","武具","機械零件"],["燃料與爐期","高階訂單資格"],1.08,1.16,1.27,1.24),description:"七個大型爐區與數百小工坊組成的城市，工坊排程、燃料和熟練工數量決定可交付產能。"},
  {id:"L-ANW-SEAHAMMER",name:"海鎚港",zoneId:"ANW-Z-05",zone:"西海崖山廳",province:"PROV-ANW-05",smap:"SMAP-ANW-05",tier:"C",size:"海崖港城",safety:89,role:"西海崖吊運港、鹽貨與外來糧食入口",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"海崖港侯／索道監",tier:"AUTH-4"},economy:econ(78,"興盛",["海運","鹽","石材","索道貨運"],["暴風與崖道容量"],1.04,1.11,1.17,1.15),description:"港區位於海崖下方，貨物靠升降臺與盤山道送入高地；暴風時整套物流會顯著降載。"},
  {id:"L-ANW-SNOWANVIL",name:"雪砧鎮",zoneId:"ANW-Z-06",zone:"雪砧高嶺",province:"PROV-ANW-06",smap:"SMAP-ANW-06",tier:"D",size:"高山鎮",safety:88,role:"高山牧業、寒地巡路與雪崩觀測",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"雪砧山廳伯",tier:"AUTH-4"},economy:econ(60,"穩定",["山羊","皮革","寒地礦材","嚮導"],["暴雪","短生產季"],1.06,.93,1.00,.96),description:"位於樹線以上的大型山鎮，冬季以封路與越冬庫存優先，稀有寒地礦物按年度勘採配額開放。"},
  {id:"L-ANW-DEEPWARD",name:"深界堡",zoneId:"ANW-Z-07",zone:"深界礦廊",province:"PROV-ANW-07",smap:"SMAP-ANW-07",tier:"C",size:"地下前哨堡",safety:87,role:"深層測界、救援、封印與黑月方向聯絡／警戒",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"深界總監",tier:"AUTH-5"},economy:econ(55,"受限",["救援","測繪","支撐工事","受控礦材"],["主權爭議","補給昂貴","封印區資格"],1.12,.75,.90,.78),description:"位於安威爾可持續維護的上層深礦盡頭。再往下即進入爭議深層，所有隊伍必須登記目的、補給與回程時間。"}
 ],
 fields:[
  {id:"L-ANW-CROWNRIDGE",name:"冠脊皇道坡",zoneId:"ANW-Z-01",province:"PROV-ANW-01",smap:"SMAP-ANW-01",tier:"D",template:"L-HILL",tags:["mountain","road"],risk:23,mining:["ANW-MAT-001"],hunt:["ANW-MAT-007"],preferred:["MON-ANW-006","MON-ANW-010"],description:"帝都外圍經整修的高山道路與採石坡，仍受落石與山獸影響。"},
  {id:"L-ANW-GOATPLATEAU",name:"皇領岩羊臺地",zoneId:"ANW-Z-01",province:"PROV-ANW-01",smap:"SMAP-ANW-01",tier:"E",template:"L-HILL",tags:["mountain"],risk:18,gather:["ANW-MAT-006"],hunt:["ANW-MAT-007"],preferred:["MON-ANW-001","MON-ANW-005"],description:"靠近帝都的高地牧場與岩羊活動區，狩獵配額依季節調整。"},
  {id:"L-ANW-SOUTHSLOPE",name:"南門碎石坡",zoneId:"ANW-Z-02",province:"PROV-ANW-02",smap:"SMAP-ANW-02",tier:"D",template:"L-HILL",tags:["mountain","road"],risk:27,gather:["ANW-MAT-006"],mining:["ANW-MAT-002"],preferred:["MON-ANW-009","MON-ANW-012"],description:"山口外側的碎石坡與商旅避風牆，春融期落石頻繁。"},
  {id:"L-ANW-PINERAVINE",name:"關門冷杉谷",zoneId:"ANW-Z-02",province:"PROV-ANW-02",smap:"SMAP-ANW-02",tier:"D",template:"L-WOOD",tags:["forest","mountain"],risk:25,woodcut:["ANW-MAT-005"],hunt:["ANW-MAT-008"],preferred:["MON-ANW-007","MON-ANW-011"],description:"受輪伐管理的冷杉谷，供應坑道支撐木與關堡燃料。"},
  {id:"L-IP-ANVILRIDGE",name:"砧風坡",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"F",template:"L-HILL",tags:["mountain"],risk:18,mining:["I-ORE-BRONZE"],preferred:["MON-ANW-001","MON-ANW-002"],description:"既有新手採礦坡；只開放青銅級與少量低品位礦露頭。"},
  {id:"L-IP-BLACKVEIN",name:"黑脈溪谷",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"F",template:"L-RIVER",tags:["mountain","water"],aquatic:true,risk:17,gather:["I-HERB"],preferred:["MON-ANW-002","MON-ANW-003"],description:"既有冷溪谷，承擔村落用水、洗礦與小型木運。"},
  {id:"L-IP-COPPERCUT",name:"銅痕採石坡",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"F",template:"L-HILL",tags:["mountain"],risk:18,mining:["I-ORE-BRONZE"],preferred:["MON-ANW-001","MON-ANW-004"],description:"既有新手採石坡，高價礦脈維持封鎖。"},
  {id:"L-ANW-BLACKORE",name:"黑脈主礦坡",zoneId:"ANW-Z-04",province:"PROV-ANW-04",smap:"SMAP-ANW-04",tier:"C",template:"L-HILL",tags:["mountain","mine"],risk:33,mining:["ANW-MAT-002","ANW-MAT-003"],preferred:["MON-ANW-013","MON-ANW-017"],resourceCapacity:{ore:10,hunt:3,forage:3},regen:72,description:"黑脈城外主礦帶，採掘量依安全支撐、礦車運力與年度配額控制。"},
  {id:"L-ANW-FORGEWOOD",name:"爐木輪伐林",zoneId:"ANW-Z-04",province:"PROV-ANW-04",smap:"SMAP-ANW-04",tier:"D",template:"L-WOOD",tags:["forest"],risk:24,woodcut:["ANW-MAT-005"],gather:["ANW-MAT-006"],preferred:["MON-ANW-007","MON-ANW-014"],regen:60,description:"專供工礦廳支撐木與部分爐火的輪伐林，每年依生長量關閉部分伐區。"},
  {id:"L-ANW-SEACLIFF",name:"西海風鑿崖",zoneId:"ANW-Z-05",province:"PROV-ANW-05",smap:"SMAP-ANW-05",tier:"D",template:"L-HILL",tags:["coast","mountain"],risk:28,mining:["ANW-MAT-004"],gather:["ANW-MAT-012"],preferred:["MON-ANW-008","MON-ANW-015"],description:"海鎚港上方的海風石崖，採石與崖藥採集都受風速限制。"},
  {id:"L-ANW-TIDECAVE",name:"潮鑿岩灣",zoneId:"ANW-Z-05",province:"PROV-ANW-05",smap:"SMAP-ANW-05",tier:"D",template:"L-RIVER",tags:["coast","water"],aquatic:true,risk:26,fish:["ANW-MAT-013"],gather:["ANW-MAT-012"],preferred:["MON-ANW-008","MON-ANW-016"],description:"海崖下的潮間岩灣，退潮採集窗口很短，風暴前會封閉。"},
  {id:"L-ANW-SNOWFIELD",name:"雪砧風原",zoneId:"ANW-Z-06",province:"PROV-ANW-06",smap:"SMAP-ANW-06",tier:"D",template:"L-HILL",tags:["mountain","snow"],risk:30,gather:["ANW-MAT-009"],hunt:["ANW-MAT-007"],preferred:["MON-ANW-010","MON-ANW-018"],description:"樹線以上的雪原與岩坡，寒風本身就是主要風險。"},
  {id:"L-ANW-CRYSTALRIDGE",name:"寒晶脊",zoneId:"ANW-Z-06",province:"PROV-ANW-06",smap:"SMAP-ANW-06",tier:"C",template:"L-HILL",tags:["mountain","snow"],risk:36,mining:["ANW-MAT-010"],preferred:["MON-ANW-018","MON-ANW-020"],resourceCapacity:{ore:5,forage:3,hunt:3},regen:96,description:"只有短季開放的寒晶礦脊，所有採掘隊需攜帶雪崩信標。"},
  {id:"L-ANW-DEEPFRINGE",name:"深界上層礦廊",zoneId:"ANW-Z-07",province:"PROV-ANW-07",smap:"SMAP-ANW-07",tier:"C",template:"L-HILL",tags:["cave","mine"],risk:38,mining:["ANW-MAT-011"],preferred:["MON-ANW-019","MON-ANW-021"],description:"仍由安威爾維護的最深常規礦廊，界標之外不得自行追脈。"},
  {id:"L-ANW-ECHOCHASM",name:"回音斷層廊",zoneId:"ANW-Z-07",province:"PROV-ANW-07",smap:"SMAP-ANW-07",tier:"C",template:"L-HILL",tags:["cave"],risk:40,gather:["ANW-MAT-014"],preferred:["MON-ANW-021","MON-ANW-022"],accessRule:"需深界堡登記",description:"天然斷層與舊礦廊交錯的測界區，部分回音被用來監測更深層施工活動。"}
 ],
 dungeons:[
  {id:"D-ANW-FIRSTFORGE",name:"初代皇爐地下環",zoneId:"ANW-Z-01",province:"PROV-ANW-01",smap:"SMAP-ANW-01",tier:"B",template:"D-AQUEDUCT",risk:58,tags:["cave","ruins"],mining:["ANW-MAT-015"],preferred:["MON-ANW-023"],accessRule:"B級前置＋帝國工坊與皇領許可",description:"封存於帝都下方的初代皇爐維修環，只在研究或重大修復時開放。"},
  {id:"D-ANW-SOUTHCRYPT",name:"南門舊防坑",zoneId:"ANW-Z-02",province:"PROV-ANW-02",smap:"SMAP-ANW-02",tier:"D",template:"D-AQUEDUCT",risk:34,tags:["cave","ruins"],mining:["ANW-MAT-001"],preferred:["MON-ANW-012","MON-ANW-017"],description:"舊關堡下的防禦坑道，部分區段因坍塌與廢構裝封閉。"},
  {id:"D-IP-OLDMINE",name:"舊礦支坑",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"E",template:"D-AQUEDUCT",risk:18,tags:["cave","mine"],mining:["I-ORE-BRONZE","I-ORE-IRON"],preferred:["MON-ANW-004","MON-ANW-005"],description:"既有新手礦坑，只開放淺層。"},
  {id:"D-IP-TOOLVAULT",name:"封存工具庫",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"E",template:"D-AQUEDUCT",risk:17,tags:["cave","ruins"],mining:["I-ORE-BRONZE"],preferred:["MON-ANW-004","MON-ANW-006"],description:"既有地下工具庫與失修吊具區。"},
  {id:"D-IP-WATERADIT",name:"排水橫坑",zoneId:"ANW-Z-03",province:"PROV-START-13",smap:"SMAP-START-IRONPINE",tier:"E",template:"D-AQUEDUCT",risk:18,tags:["cave","water"],aquatic:true,mining:["I-ORE-IRON"],preferred:["MON-ANW-003","MON-ANW-005"],description:"既有礦山排水橫坑，需注意積水與坍落。"},
  {id:"D-ANW-DEEPFURNACE",name:"黑脈廢熔爐",zoneId:"ANW-Z-04",province:"PROV-ANW-04",smap:"SMAP-ANW-04",tier:"C",template:"D-AQUEDUCT",risk:45,tags:["cave","ruins"],mining:["ANW-MAT-003"],preferred:["MON-ANW-019","MON-ANW-021"],description:"舊礦層深處停用的熔爐與運礦井，殘熱與機械守衛仍在。"},
  {id:"D-ANW-CLIFFMINE",name:"海崖斷索礦窟",zoneId:"ANW-Z-05",province:"PROV-ANW-05",smap:"SMAP-ANW-05",tier:"D",template:"D-AQUEDUCT",risk:39,tags:["cave","coast"],mining:["ANW-MAT-004"],preferred:["MON-ANW-015","MON-ANW-016"],description:"一座因主索斷裂而停採的海崖礦窟，潮氣與落石使修復困難。"},
  {id:"D-ANW-SNOWVAULT",name:"雪砧封雪倉",zoneId:"ANW-Z-06",province:"PROV-ANW-06",smap:"SMAP-ANW-06",tier:"C",template:"D-AQUEDUCT",risk:44,tags:["cave","snow","ruins"],gather:["ANW-MAT-009"],preferred:["MON-ANW-020","MON-ANW-022"],description:"古老高山儲備庫被冰層封住多年，近期因融冰露出新通道。"},
  {id:"D-ANW-BORDERSEAL",name:"深界石契封廊",zoneId:"ANW-Z-07",province:"PROV-ANW-07",smap:"SMAP-ANW-07",tier:"B",template:"D-AQUEDUCT",risk:61,tags:["cave","ruins"],gather:["ANW-MAT-016"],preferred:["MON-ANW-024"],accessRule:"B級前置＋深界測界令；不得越過黑月主權界標",description:"歷代石契與封印構裝共同標示的深層邊界廊，只允許有明確任務的高階隊伍進入。"},
  {id:"D-ANW-LOSTSHAFT",name:"第九失聯豎井",zoneId:"ANW-Z-07",province:"PROV-ANW-07",smap:"SMAP-ANW-07",tier:"C",template:"D-AQUEDUCT",risk:49,tags:["cave","mine"],mining:["ANW-MAT-011"],preferred:["MON-ANW-019","MON-ANW-022"],accessRule:"需深界救援署核准",description:"因地層錯動失聯的舊豎井，探索目標以救援、測量與封閉危險支坑為主。"}
 ],
 materials:[
  ["ANW-MAT-001","冠脊花崗岩","E",1.8,18,"耐壓石材，常用於坑道與堡牆。"],["ANW-MAT-002","黑脈鐵礦","D",1.4,34,"安威爾常見黑鐵礦石。"],
  ["ANW-MAT-003","精鋼礦砂","C",.8,72,"需配額的高品位精鋼原料。"],["ANW-MAT-004","海崖青石","D",1.6,28,"耐鹽風建築石。"],
  ["ANW-MAT-005","坑道冷杉木","E",1.0,20,"作為支撐木與工坊燃材。"],["ANW-MAT-006","高山苦根","E",.15,16,"高地可食兼藥用根莖。"],
  ["ANW-MAT-007","岩羊皮","E",.7,22,"高山岩羊皮革。"],["ANW-MAT-008","灰熊脂","D",.4,32,"林地大型獸類脂材。"],
  ["ANW-MAT-009","雪砧苔","D",.12,30,"寒地藥材。"],["ANW-MAT-010","寒晶碎片","C",.25,84,"短季開採的寒性晶礦。"],
  ["ANW-MAT-011","深層鳴鐵","C",.9,96,"受測界限制的深層共鳴礦。"],["ANW-MAT-012","崖縫鹽草","E",.12,18,"海崖鹽霧帶植物。"],
  ["ANW-MAT-013","西海岩魚","E",.5,20,"海鎚港附近岩灣漁獲。"],["ANW-MAT-014","回音石片","C",.35,66,"斷層廊聲學測界用礦材。"],
  ["ANW-MAT-015","古爐耐火磚片","B",.6,150,"初代皇爐受控回收材料。"],["ANW-MAT-016","石契封印片","B",.25,170,"深界封廊受控回收的歷史封印構件。"]
 ].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],price:x[4],description:x[5]})),
 monsters:[
  {id:"MON-ANW-001",name:"砧風岩兔",tier:"F",habitat:["L-IP-ANVILRIDGE","L-IP-COPPERCUT"],hp:27,atk:8,def:5,drops:["ANW-MAT-007"],near:true,description:"新手山坡常見小型獵物。"},
  {id:"MON-ANW-002",name:"鐵松坡鼠",tier:"F",habitat:["L-IP-ANVILRIDGE","L-IP-BLACKVEIN"],hp:29,atk:9,def:4,near:true,description:"以種子與礦區糧屑為食。"},
  {id:"MON-ANW-003",name:"黑脈溪蟹",tier:"F",habitat:["L-IP-BLACKVEIN","D-IP-WATERADIT"],hp:31,atk:8,def:8,element:"水",tags:["aquatic"],near:true,description:"冷溪與排水橫坑常見甲殼獸。"},
  {id:"MON-ANW-004",name:"淺坑礦鼠",tier:"E",habitat:["L-IP-COPPERCUT","D-IP-OLDMINE","D-IP-TOOLVAULT"],hp:46,atk:14,def:7,near:true,description:"會啃咬木架與糧袋的大型礦鼠。"},
  {id:"MON-ANW-005",name:"鐵松岩羊",tier:"E",habitat:["L-ANW-GOATPLATEAU","D-IP-OLDMINE","D-IP-WATERADIT"],hp:54,atk:16,def:10,drops:["ANW-MAT-007"],near:true,description:"熟悉陡坡的小型岩羊。"},
  {id:"MON-ANW-006",name:"冠脊石貂",tier:"E",habitat:["L-ANW-CROWNRIDGE","D-IP-TOOLVAULT"],hp:48,atk:15,def:8,description:"岩縫與道路石牆附近活動。"},
  {id:"MON-ANW-007",name:"冷杉灰狼",tier:"D",habitat:["L-ANW-PINERAVINE","L-ANW-FORGEWOOD"],hp:94,atk:27,def:15,drops:["ANW-MAT-008"],description:"受林地獵物量影響的狼群。"},
  {id:"MON-ANW-008",name:"海崖翼蜥",tier:"D",habitat:["L-ANW-SEACLIFF","L-ANW-TIDECAVE"],hp:88,atk:27,def:14,init:15,description:"沿上升氣流滑翔的海崖爬獸。"},
  {id:"MON-ANW-009",name:"南門碎岩豬",tier:"D",habitat:["L-ANW-SOUTHSLOPE"],hp:108,atk:29,def:19,drops:["ANW-MAT-008"],description:"會翻動碎石尋找根莖的大型野豬。"},
  {id:"MON-ANW-010",name:"冠脊大角羊",tier:"D",habitat:["L-ANW-CROWNRIDGE","L-ANW-SNOWFIELD"],hp:102,atk:28,def:18,drops:["ANW-MAT-007"],description:"高地大型角羊。"},
  {id:"MON-ANW-011",name:"杉谷灰熊",tier:"D",habitat:["L-ANW-PINERAVINE","L-ANW-FORGEWOOD"],hp:126,atk:31,def:19,drops:["ANW-MAT-008"],description:"林谷大型熊獸。"},
  {id:"MON-ANW-012",name:"舊關岩蝠",tier:"D",habitat:["L-ANW-SOUTHSLOPE","D-ANW-SOUTHCRYPT"],hp:82,atk:25,def:9,init:16,description:"舊關坑道與石縫的大型蝠類。"},
  {id:"MON-ANW-013",name:"黑脈甲蜥",tier:"C",habitat:["L-ANW-BLACKORE"],hp:154,atk:35,def:28,element:"地",drops:["ANW-MAT-002"],description:"厚甲礦坡蜥獸，會吞食含鐵碎石。"},
  {id:"MON-ANW-014",name:"爐木獠鹿",tier:"C",habitat:["L-ANW-FORGEWOOD"],hp:148,atk:36,def:23,drops:["ANW-MAT-007"],description:"輪伐林深處的大型角獸。"},
  {id:"MON-ANW-015",name:"風鑿岩甲獸",tier:"C",habitat:["L-ANW-SEACLIFF","D-ANW-CLIFFMINE"],hp:165,atk:35,def:31,element:"地",drops:["ANW-MAT-004"],description:"以石屑與鹽分為食的厚甲魔獸。"},
  {id:"MON-ANW-016",name:"潮窟鐵鉗蟹",tier:"C",habitat:["L-ANW-TIDECAVE","D-ANW-CLIFFMINE"],hp:170,atk:36,def:32,element:"水",tags:["aquatic"],drops:["ANW-MAT-013"],description:"海崖洞穴的大型甲殼魔獸。"},
  {id:"MON-ANW-017",name:"礦車斷軸傀",tier:"C",habitat:["L-ANW-BLACKORE","D-ANW-SOUTHCRYPT"],hp:175,atk:36,def:33,tags:["construct"],drops:["ANW-MAT-001"],description:"失修礦車與防禦構件組成的舊式傀儡。"},
  {id:"MON-ANW-018",name:"雪砧霜狼",tier:"C",habitat:["L-ANW-SNOWFIELD","L-ANW-CRYSTALRIDGE"],hp:152,atk:38,def:22,element:"水",drops:["ANW-MAT-009"],description:"高山寒地大型狼。"},
  {id:"MON-ANW-019",name:"深礦鳴甲獸",tier:"C",habitat:["L-ANW-DEEPFRINGE","D-ANW-DEEPFURNACE","D-ANW-LOSTSHAFT"],hp:178,atk:38,def:31,element:"地",drops:["ANW-MAT-011"],description:"以低頻鳴響感知坑道的大型地下獸。"},
  {id:"MON-ANW-020",name:"寒晶脊石傀",tier:"C",habitat:["L-ANW-CRYSTALRIDGE","D-ANW-SNOWVAULT"],hp:184,atk:37,def:35,element:"水",tags:["construct"],drops:["ANW-MAT-010"],description:"舊採礦設施遺留的寒地構裝。"},
  {id:"MON-ANW-021",name:"古爐搬運傀",tier:"C",habitat:["L-ANW-DEEPFRINGE","L-ANW-ECHOCHASM","D-ANW-DEEPFURNACE"],hp:188,atk:39,def:35,tags:["construct"],drops:["ANW-MAT-014"],description:"仍執行搬運與驅離指令的古代工坊構裝。"},
  {id:"MON-ANW-022",name:"斷層晶背獸",tier:"C",habitat:["L-ANW-ECHOCHASM","D-ANW-SNOWVAULT","D-ANW-LOSTSHAFT"],hp:173,atk:39,def:30,element:"地",drops:["ANW-MAT-014"],description:"會把礦晶嵌入背甲的深層獸。"},
  {id:"MON-ANW-023",name:"初代皇爐守衛",tier:"B",role:"首領",habitat:["D-ANW-FIRSTFORGE"],hp:350,atk:57,def:45,mdef:41,acc:83,tags:["construct"],drops:["ANW-MAT-015"],description:"初代皇爐深層重型守衛，只在許可探索中啟動。"},
  {id:"MON-ANW-024",name:"深界石契監守傀",tier:"B",role:"首領",habitat:["D-ANW-BORDERSEAL"],hp:338,atk:56,def:46,mdef:43,acc:82,tags:["construct"],drops:["ANW-MAT-016"],description:"維持歷史封廊與主權界標的重型構裝，不進入普通坑道。"}
 ],
 npcs:[
  ["NPC-ANW-001","哈德里克・安威爾","安威爾皇帝","L-ANW-DEEPANVIL","帝國法統、共同軍令、山廳承認、南門與深界政策","C",["ORG-ANW-CROWN"],"現任皇帝，權力建立在石冠議會與主要氏族承認上。"],
  ["NPC-ANW-002","芙蕾妲・石書","帝國大宰衡","L-ANW-DEEPANVIL","中央行政、跨山廳工程、預算與詔令","D",["ORG-ANW-CHANCERY"],"把大型政策拆成可由各山廳執行的工程與物資計畫。"],
  ["NPC-ANW-003","博倫・刻律","礦律大法官","L-ANW-STONELAW","礦契、坑道事故、氏族石律與工程責任","D",["ORG-ANW-LAW"],"堅持礦權必須同時記錄維護義務與安全責任。"],
  ["NPC-ANW-004","吉妲・七爐","工坊議席長","L-ANW-SEVENFORGE","工坊爐期、工匠資格、武具與大型訂單","E",["ORG-ANW-FORGE"],"代表大型與中型工坊進入帝國議政。"],
  ["NPC-ANW-005","多爾恩・黑脈","黑脈山廳王","L-ANW-BLACKVEIN","黑脈礦權、排水、工人與地方軍役","C",["ORG-ANW-MINE"],"主張礦產收入必須先覆蓋坑道安全與復育。"],
  ["NPC-ANW-006","瑪格妲・鉚釘","總坑道監","L-ANW-BLACKVEIN","支撐、通風、排水、礦車與事故封坑","D",["ORG-ANW-MINE"],"有權因安全直接停採危險坑道。"],
  ["NPC-ANW-007","赫姆・南門","南門大關守","L-ANW-SOUTHGATE","山口、防務、關稅與斷境通行","C",["ORG-ANW-GATE"],"只把帝國巡邏延伸到合法控制線，不宣稱斷境主權。"],
  ["NPC-ANW-008","露妲・風索","商檢監","L-ANW-SOUTHGATE","商隊、馱獸、關稅、危險品與道路容量","E",["ORG-ANW-GATE"],"風雪時會按道路承載量限制車隊。"],
  ["NPC-ANW-009","卡爾・鐵松","鐵松村議事長","L-START-IRONPINE","新手委託、淺礦、木料與村落庫存","E",["ORG-ANW-MINE"],"維持新手區只產出合理低階資源。"],
  ["NPC-ANW-010","伊娜・短鎚","鐵松鍛工","L-START-IRONPINE","基礎鍛造、修理、礦料品質與工具","E",["ORG-ANW-FORGE"],"優先教新人辨認礦材而非追求高階產出。"],
  ["NPC-ANW-011","布蘭・海鎚","海崖港侯","L-ANW-SEAHAMMER","港務、索道、鹽貨與外來糧食","C",["ORG-ANW-ROAD"],"把暴風、泊位與索道載重列入港務決策。"],
  ["NPC-ANW-012","米拉・高索","海崖吊運監","L-ANW-SEAHAMMER","升降臺、盤山道、貨損與港區安全","E",["ORG-ANW-ROAD"],"知道每條索道的維修狀態與最大載重。"],
  ["NPC-ANW-013","斯文・雪砧","雪砧山廳伯","L-ANW-SNOWANVIL","越冬、牧地、寒晶配額與北冠巡路","C",["ORG-ANW-ROAD"],"冬季政策優先保障糧食與道路。"],
  ["NPC-ANW-014","艾拉・白鑿","雪崩觀測官","L-ANW-SNOWANVIL","雪層、山路、寒晶採掘窗口與救援","E",["ORG-ANW-RESCUE"],"會因雪層風險暫停高價礦材採掘。"],
  ["NPC-ANW-015","格林・深界","深界總監","L-ANW-DEEPWARD","深層測界、黑月聯絡、封印與救援","C",["ORG-ANW-DEEPWARD"],"把主權界標與人員安全放在礦產價值之前。"],
  ["NPC-ANW-016","塔莉・回聲","深界測繪師","L-ANW-DEEPWARD","礦廊測量、回音定位、失聯豎井與撤離路線","D",["ORG-ANW-DEEPWARD"],"維護可撤離路線與最新測繪圖。"],
  ["NPC-ANW-017","羅卡・紅鬚","帝國盾衛統領","L-ANW-DEEPANVIL","帝都防務、共同動員、山廳軍役與工兵","C",["ORG-ANW-CROWN"],"大型動員前會先核算道路、糧秣與坑道容量。"],
  ["NPC-ANW-018","貝妲・灰木","輪伐林務長","L-ANW-SEVENFORGE","支撐木、爐材、林火與輪伐配額","E",["ORG-ANW-FORGE"],"拒絕用短期爐產量換取林地崩潰。"],
  ["NPC-ANW-019","奧姆・石印","皇室檔案官","L-ANW-STONELAW","皇統、石契、礦權、氏族承認與歷史邊界","F",["ORG-ANW-CHANCERY"],"能區分口述祖傳與可核對的正式石契。"],
  ["NPC-ANW-020","赫妲・火鉗","冒險者公會山區聯絡官","L-ANW-SOUTHGATE","山地委託、失聯救援、礦道清理與高階前置","C",[],"會阻止未具資格的隊伍進入B級皇爐或深界封廊。"]
 ],
 orgs:[
  {id:"ORG-ANW-CROWN",name:"安威爾石冠御前院",kind:"government",tier:"B",base_location_id:"L-ANW-DEEPANVIL",description:"皇帝與主要中央官署處理共同外交、軍令、皇領與跨山廳事務。"},
  {id:"ORG-ANW-CHANCERY",name:"帝國石書宰衡院",kind:"government",tier:"B",base_location_id:"L-ANW-DEEPANVIL",description:"管理詔令、礦契正本、山廳協議、工程預算與使節文書。"},
  {id:"ORG-ANW-LAW",name:"安威爾礦律法院",kind:"government",tier:"B",base_location_id:"L-ANW-STONELAW",description:"審理跨氏族礦權、坑道事故、工坊契約與石律上訴。"},
  {id:"ORG-ANW-FORGE",name:"七爐工坊聯席",kind:"craft",tier:"C",base_location_id:"L-ANW-SEVENFORGE",description:"協調大型爐期、工匠資格、燃料與跨工坊技術標準。"},
  {id:"ORG-ANW-MINE",name:"帝國礦脈與坑道署",kind:"civic",tier:"C",base_location_id:"L-ANW-BLACKVEIN",description:"管理採掘配額、通風排水、礦車、停坑與礦山救援。"},
  {id:"ORG-ANW-GATE",name:"冠脊南門關務署",kind:"military",tier:"C",base_location_id:"L-ANW-SOUTHGATE",description:"負責南門防務、商檢、危險品與斷境方向交通。"},
  {id:"ORG-ANW-ROAD",name:"山道索運與驛務局",kind:"civic",tier:"C",base_location_id:"L-ANW-SEAHAMMER",description:"維護盤山道、索道、驛站、雪路與海崖貨運。"},
  {id:"ORG-ANW-DEEPWARD",name:"深界測界與救援署",kind:"military",tier:"B",base_location_id:"L-ANW-DEEPWARD",description:"維護深層界標、救援路線、封印廊與黑月方向事故聯絡。"}
 ],
 offices:[
  {id:"POL-013-O1",title:"安威爾皇帝",authority_tier:"AUTH-7",authority_level:7,scope:"帝國共同主權、外交、軍令、皇領與中央任命",appointment:"皇統繼承＋帝國石冠議會與主要氏族承認",rights:["AR-001","AR-002","AR-003","AR-004","AR-005"],reports_to:null},
  {id:"POL-013-O2",title:"石冠議會大議長",authority_tier:"AUTH-6",authority_level:6,scope:"皇統承認、跨山廳礦權、共同工程與大規模動員程序",appointment:"大氏族王、主要山廳與工坊議席依法互選",rights:["AR-003","AR-005"],reports_to:null,parallel_authority_ids:["POL-013-O1"]},
  {id:"POL-013-O3",title:"大氏族王／大山廳王",authority_tier:"AUTH-5",authority_level:5,scope:"主要氏族與山廳的土地、礦權、地方司法及軍役",appointment:"氏族祖法繼承或推舉＋帝國承認",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-013-O1"},
  {id:"POL-013-O4",title:"帝國大宰衡",authority_tier:"AUTH-6",authority_level:6,scope:"中央行政、跨廳工程、預算與詔令",appointment:"皇帝任命並受石冠議會監督",rights:["AR-003","AR-005"],reports_to:"POL-013-O1"},
  {id:"POL-013-O5",title:"礦律大法官",authority_tier:"AUTH-5",authority_level:5,scope:"礦契、事故責任、氏族石律與跨廳上訴",appointment:"皇帝提名、議會確認",rights:["AR-005"],reports_to:"POL-013-O1"},
  {id:"POL-013-O6",title:"礦脈領主／工坊議席",authority_tier:"AUTH-4",authority_level:4,scope:"合法礦區或大型工坊的生產、勞務與契約",appointment:"礦契、氏族權利或工坊章程產生",rights:["AR-003"],reports_to:"POL-013-O3"},
  {id:"POL-013-O7",title:"關門大守／總坑道監／深界總監",authority_tier:"AUTH-4",authority_level:4,scope:"關隘、坑道安全、測界與專業公共行政",appointment:"中央或山廳依法任命",rights:["AR-003","AR-005"],reports_to:"POL-013-O4"},
  {id:"POL-013-O8",title:"山廳執政官／氏族長老／工坊長",authority_tier:"AUTH-3",authority_level:3,scope:"地方市政、氏族內務與工坊執行",appointment:"地方章程或氏族制度產生",rights:["AR-003"],reports_to:"POL-013-O3"},
  {id:"POL-013-O9",title:"坑道監／村長／驛政官",authority_tier:"AUTH-2",authority_level:2,scope:"村社、坑道、驛站與基層公共事務",appointment:"上級官署或地方慣例任命",rights:["AR-003"],reports_to:"POL-013-O8"}
 ],
 powerCenters:["安威爾皇室","帝國石冠議會","大氏族王與山廳","七爐工坊聯席","礦律法院","深界測界署"],
 playerInteraction:"低階玩家主要從鐵松村、南門與普通礦區接觸採集、救援、護路與修復；中階可處理跨山廳礦契與深礦事故；B級皇爐與深界石契封廊必須具備明確前置與官方許可。",
 links:[
  ["L-ANW-DEEPANVIL","L-ANW-STONELAW",1],["L-ANW-DEEPANVIL","L-ANW-CROWNRIDGE",1],["L-ANW-CROWNRIDGE","D-ANW-FIRSTFORGE",1.2],
  ["L-ANW-DEEPANVIL","L-ANW-SOUTHGATE",5],["L-ANW-SOUTHGATE","L-ANW-SOUTHSLOPE",.8],["L-ANW-SOUTHGATE","L-ANW-PINERAVINE",1],["L-ANW-SOUTHSLOPE","D-ANW-SOUTHCRYPT",1],
  ["L-ANW-SOUTHGATE","L-START-IRONPINE",3.5],["L-START-IRONPINE","L-IP-ANVILRIDGE",1.2],["L-START-IRONPINE","L-IP-BLACKVEIN",1.5],["L-START-IRONPINE","L-IP-COPPERCUT",1.4],
  ["L-ANW-DEEPANVIL","L-ANW-BLACKVEIN",3],["L-ANW-BLACKVEIN","L-ANW-SEVENFORGE",1.2],["L-ANW-BLACKVEIN","L-ANW-BLACKORE",1],["L-ANW-SEVENFORGE","L-ANW-FORGEWOOD",1],["L-ANW-BLACKORE","D-ANW-DEEPFURNACE",1.3],
  ["L-ANW-DEEPANVIL","L-ANW-SEAHAMMER",6],["L-ANW-SEAHAMMER","L-ANW-SEACLIFF",.8],["L-ANW-SEAHAMMER","L-ANW-TIDECAVE",1],["L-ANW-SEACLIFF","D-ANW-CLIFFMINE",1.2],
  ["L-ANW-DEEPANVIL","L-ANW-SNOWANVIL",5.5],["L-ANW-SNOWANVIL","L-ANW-SNOWFIELD",1],["L-ANW-SNOWFIELD","L-ANW-CRYSTALRIDGE",1.5],["L-ANW-CRYSTALRIDGE","D-ANW-SNOWVAULT",1],
  ["L-ANW-BLACKVEIN","L-ANW-DEEPWARD",4],["L-ANW-DEEPWARD","L-ANW-DEEPFRINGE",.8],["L-ANW-DEEPFRINGE","L-ANW-ECHOCHASM",1],["L-ANW-DEEPFRINGE","D-ANW-LOSTSHAFT",1.2],["L-ANW-ECHOCHASM","D-ANW-BORDERSEAL",1.5]
 ],
 hooks:[
  ["HOOK-ANW-01","失落的礦權石契","兩個氏族都拿出看似有效的舊石契，玩家需比對坑道位置、維護紀錄與歷代判例。","C"],
  ["HOOK-ANW-02","南門雪崩封路","商隊被堵在山口兩側，必須先完成雪層評估與救援，再決定貨運優先序。","D"],
  ["HOOK-ANW-03","黑脈排水逆流","主礦坑排水量突然下降，需要查明堵塞、設備失效或地下水改道。","C"],
  ["HOOK-ANW-04","七爐燃料短缺","工坊訂單增加但輪伐林不能超採，需重新分配爐期與燃料。","C"],
  ["HOOK-ANW-05","海鎚斷索","暴風損壞主索道，港內糧食堆積而高地缺糧，需保護工程隊修復。","D"],
  ["HOOK-ANW-06","寒晶失蹤配額","一批登記寒晶未進入公庫，調查需追查採掘、雪崩與黑市三種可能。","C"],
  ["HOOK-ANW-07","第九豎井求救聲","封閉豎井傳出規律敲擊，救援署要求先確認結構安全再下井。","C"],
  ["HOOK-ANW-08","石契封廊異動","深界封印構裝重新啟動，必須在不越過黑月主權界標的前提下找出原因。","B"]
 ],
 life:[
  ["LIFE-ANW-01","春融排水季","各礦廳優先清淤與檢查支撐，採掘量暫降。"],["LIFE-ANW-02","七爐大爐期","精煉產出上升，但木炭、礦石與運輸價格同步增加。"],
  ["LIFE-ANW-03","南門商隊月","關堡旅宿、馱獸與修車需求增加。"],["LIFE-ANW-04","高嶺封雪","雪砧部分野外與寒晶脊停止開放。"],
  ["LIFE-ANW-05","石冠議會季會","各氏族、山廳與工坊代表進入帝都，法律與住宿服務吃緊。"],["LIFE-ANW-06","輪伐換區","爐木林關閉舊伐區並開放下一輪區塊。"],
  ["LIFE-ANW-07","海崖風暴週","海鎚港降低吊運量，糧食與鹽價短暫波動。"],["LIFE-ANW-08","深界封廊檢修","深界署暫停非必要探索並徵召測繪與工兵。"]
 ],
 lore:[
  ["LORE-ANW-01","politics","皇帝不是所有礦脈的私人地主","安威爾皇帝掌共同主權與皇領，但合法氏族礦權、山廳權與工坊章程受帝國石律保護。"],
  ["LORE-ANW-02","law","礦權包含維護責任","持有礦脈權利者同時承擔支撐、排水、事故與封坑義務，不能只取礦而把風險留給公共體系。"],
  ["LORE-ANW-03","geography","斷境不是安威爾南方行省","帝國南界止於冠脊與裂脊北段，REG-19斷境無主地維持沒有穩定主權的緩衝地。"],
  ["LORE-ANW-04","sovereignty","黑月深庭只重疊更深地下層","REG-13地表屬安威爾；黑月深庭的主權爭議存在於更深層礦脈與通道，不能畫成地表獨立疆域。"],
  ["LORE-ANW-05","economy","爐火受燃料與礦脈承載限制","安威爾工業強大但不是無限生產；礦層品位、支撐木、爐期、熟練工、運輸與安全配額共同限制產量。"],
  ["LORE-ANW-06","adventure","B級帝國不代表每條礦道都是B級","鐵松村和普通礦坡仍是F～D級，B級只集中於初代皇爐與深界封印等受控內容。"]
 ],
 starterIds:["L-START-IRONPINE","L-IP-ANVILRIDGE","L-IP-BLACKVEIN","L-IP-COPPERCUT","D-IP-OLDMINE","D-IP-TOOLVAULT","D-IP-WATERADIT"]
};

const SERUVIA={
 code:"SER-01",systemKey:"seruvia_elven_court",zonePrefix:"SER-Z-",name:"瑟露維亞精靈王庭",polityId:"POL-012",regionId:"REG-12",cultureId:"CUL-012",realmId:"RMAP-POL-012",worldTier:"B",capital:"瑟露維亞林冠庭",capitalId:"L-SER-CROWNCANOPY",
 governmentType:"精靈王庭",currentTitle:"林冠王",topOffice:"林冠王",
 governance:"林冠王＋林冠長老議會＋王族與林地侯＋森約法院／巡林總署＋地方樹庭與聚落議事",
 tierModel:"王庭B級；一般林地與聚落F～C；B級只集中於初林根殿與月井內庭等受控古代聖域，不進入普通野外遭遇。",
 history:"瑟露維亞由西南古林的王族盟誓、長老議庭、林地守護與水源樹契逐步形成王庭；統治建立在維護森林承載與聚落自治的長期義務上。",
 currentState:"王庭正處理北界斷境壓力、林木採集配額、海林貿易、古樹病害與深林聖域開放尺度。",
 orgDistinctive:"林權、水權與採集權都附帶復育、巡護與季節封養責任。",
 identity:"位於大陸西南古林、以精靈為主並容納林地居民與外來商旅的王庭。林冠王維持外交、防務與王庭法統，長老議會、林地侯、樹庭與聚落議事共同限制中央權力；森林被治理而不是被視為無限資源。",
 gameplayRole:"B級精靈王庭／古林治理、長壽政治、巡林、生態採集、弓術與樹工、海林貿易、古代根殿與月井探索",
 rulingStructure:"林冠王掌王庭外交、共同防務、王領與高階任命；林冠長老議會確認繼承、古林長期規劃與聖域開放，林地侯和地方樹庭管理各自林區、水源、聚落與巡護。王族身份本身不自動取得地方統治權。",
 legalTradition:"王庭敕令、森約法、水源樹契、地方樹庭慣例與古林禁採條款並行；採集、伐木、獵權和水權以季節配額、復育義務與聖域邊界共同判定。",
 succession:"王族依法定繼承序提出候位者，必須經林冠長老議會確認其誓約、守林義務與法定資格後登位；王儲身份不等於已掌王權。",
 economicBase:["藥草與樹脂","配額硬木與精細木工","果園與蜂蜜","染料與纖維","弓具","海岸漁產","醫療與植物學"],
 military:["林冠衛隊","銀葉巡林團","林地侯守備","長弓手","樹庭斥候","海林岸衛","災害與林火應變隊"],
 tensions:["王庭與地方林權","北界斷境安全","採集需求與封養配額","古樹病害","外來金屬與鹽依賴","海岸商貿與聖林安靜","深林聖域開放"],
 centers:["瑟露維亞林冠庭","苔月村","銀葉門","鹿泉鎮","月霧城","星潮港","白鹿丘","琥珀枝城","森書學庭"],
 exports:["藥草","樹脂","精細木工","弓具","蜂蜜","染料","乾果","醫療服務"],imports:["鐵器","鹽","穀物","礦物顏料","玻璃","大型石材"],foods:["堅果麵餅","香草燉菇","莓果乾","鹿泉魚湯","蜂蜜果酒","栗實粥"],
 recurringRisks:["林火","古樹病害","濃霧迷途","洪水與倒木","越界採集","斷境盜匪","聖域構裝失控"],
 economyNotes:"林地資源採配額與封養制。藥草、樹脂、獵物與硬木都有採集上限及恢復週期；高品質木材以輪選、自然倒木與指定修枝為主，市場庫存不會因玩家購買而無限刷新。",
 externalRelations:[
  {name:"斷境無主地",relation:"buffer_frontier",note:"北界以古林嶺、灰河南段與林緣雙門為界；REG-19不是瑟露維亞領土。"},
  {name:"安威爾帝國",relation:"indirect_trade",note:"雙方由斷境隔開，西南林境路與中立商站承擔大部分合法往來。"},
  {name:"阿斯戴爾王國",relation:"forest_coast_trade",note:"東北側與REG-05在丘陵林線及南岸河口相接，往來以木工、藥材、鹽與穀物為主。"}
 ],
 regionUpdate:{name:"瑟露維亞森海",map_status:"playable_current",recommended_tier:"B",playable_tier_band:"F～B",terrain:"古老闊葉林、霧谷、丘陵、溪河、南岸海林與巨大根系地貌",regional_identity:"西南古林王庭；北界受古林嶺與斷境灰河約束，東北接阿斯戴爾南境，南側面向南曜海。"},
 mapNotes:"POL-012／REG-12沿用既有西南疆域與首都錨點。北側REG-19斷境維持無主緩衝地；與安威爾沒有連續直接國境。",
 zones:[
  {id:"SER-Z-01",name:"林冠王領",tier:"B",province:"PROV-SER-01",smap:"SMAP-SER-01",seat:"L-SER-CROWNCANOPY",role:"王庭、長老議會、森約法院、外交、學術與林冠衛隊中樞"},
  {id:"SER-Z-02",name:"苔月林緣",tier:"F",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",seat:"L-START-MOSSMOON",role:"新人可接觸的林緣村、藥草、溪谷與受管理的小型古根遺構"},
  {id:"SER-Z-03",name:"銀葉北境",tier:"C",province:"PROV-SER-03",smap:"SMAP-SER-03",seat:"L-SER-SILVERGATE",role:"古林嶺、林緣雙門、斷境方向巡護與北界商旅"},
  {id:"SER-Z-04",name:"鹿泉中谷",tier:"C",province:"PROV-SER-04",smap:"SMAP-SER-04",seat:"L-SER-DEERSPRING",role:"水源、果園、魚產、林地農業與內河聚落"},
  {id:"SER-Z-05",name:"月霧古林",tier:"B",province:"PROV-SER-05",smap:"SMAP-SER-05",seat:"L-SER-MOONMIST",role:"深林巡護、古樹醫療、聖域外環與王庭植物學"},
  {id:"SER-Z-06",name:"星潮海林",tier:"C",province:"PROV-SER-06",smap:"SMAP-SER-06",seat:"L-SER-STARTIDE",role:"南岸港、海林、漁產、鹽貨與沿岸對外貿易"},
  {id:"SER-Z-07",name:"琥珀丘林園",tier:"C",province:"PROV-SER-07",smap:"SMAP-SER-07",seat:"L-SER-AMBERBRANCH",role:"樹脂、蜂房、染料、果園、細木工與東北丘陵交通"}
 ],
 towns:[
  {id:"L-SER-CROWNCANOPY",name:"瑟露維亞林冠庭",zoneId:"SER-Z-01",zone:"林冠王領",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"B",size:"王都／巨樹城",safety:97,role:"瑟露維亞首都、林冠王、長老議會與森約法院所在地",facilities:["inn","general","guild","tailor","alchemy","clinic","church","mageguild"],authority:{title:"林冠王／林冠長老議會",tier:"AUTH-6"},economy:econ(88,"極繁榮",["王庭行政","藥草","精細木工","植物學","外交"],["聖木與高階材料受配額","金屬與鹽依賴輸入"],1.08,1.17,1.25,1.23),description:"多層樹橋、石基與活木建築圍繞數株巨樹形成的王都。林冠庭的高密度生活依賴嚴格水務、落葉堆肥與木材維護制度，而非無限制改造古林。"},
  {id:"L-SER-FORESTSCRIPT",name:"森書學庭",zoneId:"SER-Z-01",zone:"林冠王領",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"C",size:"學術林城",safety:95,role:"植物學、歷史檔案、療癒研究與森約法學",facilities:["inn","general","guild","alchemy","clinic","mageguild"],authority:{title:"森書院長／王庭學官",tier:"AUTH-4"},economy:econ(76,"興盛",["學術","醫療","抄寫","藥材鑑定"],["研究材料採集受配額"],1.04,1.08,1.15,1.13),description:"書庫、標本園與療癒院散布在林冠庭外圍，是王庭記錄古樹、藥草與長期森林變化的知識中心。"},
  {id:"L-START-MOSSMOON",name:"苔月村",zoneId:"SER-Z-02",zone:"苔月林緣",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"F",size:"新手林緣村",safety:93,role:"低階藥草、樹脂、溪谷與新手巡林委託",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"苔月村樹庭／巡林代表",tier:"AUTH-2"},economy:econ(64,"穩定",["藥草","樹脂","林下採集"],["重貨物流弱","金屬與鹽需輸入","採伐配額"],1.01,1.05,1.03,1.02),description:"沿用既有新手村；採集地採配額與輪休，避免新手區被設計成無限藥草與木材來源。"},
  {id:"L-SER-SILVERGATE",name:"銀葉門",zoneId:"SER-Z-03",zone:"銀葉北境",province:"PROV-SER-03",smap:"SMAP-SER-03",tier:"C",size:"北境林門城",safety:91,role:"斷境方向巡護、商檢、失蹤調查與林緣雙門防務",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"銀葉林地侯／北境巡林總監",tier:"AUTH-5"},economy:econ(69,"穩定",["巡林補給","樹脂","皮革","中立商旅"],["斷境局勢","道路季節中斷"],1.04,1.00,1.07,1.03),description:"北界古林嶺下的主要入口，王庭巡護線止於合法界標，不把斷境視為可任意執法的領土。"},
  {id:"L-SER-DEERSPRING",name:"鹿泉鎮",zoneId:"SER-Z-04",zone:"鹿泉中谷",province:"PROV-SER-04",smap:"SMAP-SER-04",tier:"C",size:"溪谷林鎮",safety:94,role:"水源、果園、魚產與中谷水務",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"鹿泉水庭長",tier:"AUTH-4"},economy:econ(74,"興盛",["果品","河魚","蜂蜜","藥草"],["洪水與水源保護限制"],.99,1.13,1.12,1.10),description:"多條清泉匯流的溪谷城鎮，飲水優先於磨坊、灌溉與商業用水。"},
  {id:"L-SER-WHITEDEER",name:"白鹿丘",zoneId:"SER-Z-04",zone:"鹿泉中谷",province:"PROV-SER-04",smap:"SMAP-SER-04",tier:"D",size:"丘林市鎮",safety:92,role:"果園、蜂房、草藥園與巡林馬鹿牧育",facilities:["inn","general","guild","tailor","clinic"],authority:{title:"白鹿丘樹庭長",tier:"AUTH-3"},economy:econ(66,"穩定",["果品","蜂蜜","乾果","藥草"],["花期與霜害"],.98,1.10,1.05,1.06),description:"林間丘地與小型果園交錯，採集與狩獵都依繁殖季封養。"},
  {id:"L-SER-MOONMIST",name:"月霧城",zoneId:"SER-Z-05",zone:"月霧古林",province:"PROV-SER-05",smap:"SMAP-SER-05",tier:"C",size:"深林守護城",safety:93,role:"古樹醫療、深林巡護、聖域前置與植物病害處理",facilities:["inn","general","guild","tailor","alchemy","clinic","mageguild"],authority:{title:"月霧林地侯／古樹醫官",tier:"AUTH-5"},economy:econ(70,"穩定",["高品質藥材","植物學","樹脂","巡護服務"],["聖林禁採","濃霧與通行限制"],1.07,.91,1.08,.98),description:"靠近古林深處但仍屬日常可居住範圍，所有通往聖域的道路都經資格與生態狀態檢查。"},
  {id:"L-SER-STARTIDE",name:"星潮港",zoneId:"SER-Z-06",zone:"星潮海林",province:"PROV-SER-06",smap:"SMAP-SER-06",tier:"C",size:"海林港城",safety:90,role:"南岸海運、漁產、鹽與外來金屬入口",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"星潮港侯／岸衛統領",tier:"AUTH-4"},economy:econ(79,"興盛",["海運","漁獲","鹽","外來鐵器","木工"],["風暴","港位有限","聖林木材禁運"],1.05,1.15,1.18,1.17),description:"森林幾乎延伸到海崖與灣岸的港城，外來金屬與鹽多由此進入王庭。"},
  {id:"L-SER-AMBERBRANCH",name:"琥珀枝城",zoneId:"SER-Z-07",zone:"琥珀丘林園",province:"PROV-SER-07",smap:"SMAP-SER-07",tier:"C",size:"工藝丘林城",safety:92,role:"樹脂、染料、蜂蠟、精細木工與東北丘陵商路",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"琥珀枝林侯／工藝議庭",tier:"AUTH-4"},economy:econ(82,"繁榮",["樹脂","染料","蜂蠟","木工","弓具"],["硬木採集配額","外來金屬成本"],1.06,1.14,1.20,1.18),description:"以自然倒木、指定修枝與樹脂採取為原料的工藝城市，生產不以清砍森林為前提。"}
 ],
 fields:[
  {id:"L-SER-CROWNWOOD",name:"林冠外環古林",zoneId:"SER-Z-01",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"D",template:"L-WOOD",tags:["forest"],risk:22,gather:["SER-MAT-001","SER-MAT-004"],woodcut:["SER-MAT-006"],preferred:["MON-SER-006","MON-SER-009"],description:"王都外環受巡林隊管理的古林，木材以自然倒木與指定修枝為主。"},
  {id:"L-SER-ARCHIVEGROVE",name:"森書標本林",zoneId:"SER-Z-01",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"E",template:"L-WOOD",tags:["forest"],risk:14,gather:["SER-MAT-002","SER-MAT-003"],preferred:["MON-SER-001","MON-SER-004"],description:"學庭管理的研究林，只開放低衝擊採樣。"},
  {id:"L-MM-SILVERLEAF",name:"銀葉林緣",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"F",template:"L-WOOD",tags:["forest"],risk:16,gather:["I-HERB","I-MINT"],preferred:["MON-SER-001","MON-SER-002"],description:"既有新手林地，維持低階藥草與小型獸類。"},
  {id:"L-MM-DEERSPRING",name:"鹿泉溪谷",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"F",template:"L-RIVER",tags:["forest","water"],aquatic:true,risk:15,gather:["I-BERRY"],fish:["I-RAWFISH"],preferred:["MON-SER-002","MON-SER-003"],description:"既有林間泉谷，水質與採集量受季節控制。"},
  {id:"L-MM-RESINGLADE",name:"琥脂林間地",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"F",template:"L-WOOD",tags:["forest"],risk:14,gather:["I-HERB","I-MUSHROOM"],woodcut:["I-BRANCH"],preferred:["MON-SER-001","MON-SER-004"],description:"既有新手採集地，樹脂與藥草遵守地方配額。"},
  {id:"L-SER-NORTHRIDGE",name:"古林嶺南坡",zoneId:"SER-Z-03",province:"PROV-SER-03",smap:"SMAP-SER-03",tier:"D",template:"L-HILL",tags:["forest","hill"],risk:28,gather:["SER-MAT-001"],hunt:["SER-MAT-008"],preferred:["MON-SER-010","MON-SER-013"],description:"北界山林轉換帶，能遠望斷境但不越過王庭界標。"},
  {id:"L-SER-GRAYRIVERWOOD",name:"灰河南林",zoneId:"SER-Z-03",province:"PROV-SER-03",smap:"SMAP-SER-03",tier:"C",template:"L-RIVER",tags:["forest","water"],aquatic:true,risk:34,gather:["SER-MAT-003"],fish:["SER-MAT-010"],preferred:["MON-SER-014","MON-SER-017"],description:"斷境灰河南段王庭一側的濕林，洪水會改變可通行路徑。"},
  {id:"L-SER-DEERORCHARD",name:"鹿泉果林",zoneId:"SER-Z-04",province:"PROV-SER-04",smap:"SMAP-SER-04",tier:"E",template:"L-WOOD",tags:["forest"],risk:16,gather:["SER-MAT-005"],hunt:["SER-MAT-008"],preferred:["MON-SER-005","MON-SER-007"],description:"以果樹、蜂房與林下作物為主的半人工林地。"},
  {id:"L-SER-CLEARBROOK",name:"清弦溪網",zoneId:"SER-Z-04",province:"PROV-SER-04",smap:"SMAP-SER-04",tier:"D",template:"L-RIVER",tags:["forest","water"],aquatic:true,risk:23,gather:["SER-MAT-002"],fish:["SER-MAT-010"],preferred:["MON-SER-008","MON-SER-012"],description:"多支溪流與濕地交錯，水庭依流量調整捕魚與引水。"},
  {id:"L-SER-MOONFOG",name:"月霧深林外環",zoneId:"SER-Z-05",province:"PROV-SER-05",smap:"SMAP-SER-05",tier:"C",template:"L-WOOD",tags:["forest","mist"],risk:36,gather:["SER-MAT-011","SER-MAT-012"],preferred:["MON-SER-015","MON-SER-019"],description:"聖域之外的深林緩衝區，濃霧與古樹根網讓迷途風險很高。"},
  {id:"L-SER-HEARTROOT",name:"心根丘",zoneId:"SER-Z-05",province:"PROV-SER-05",smap:"SMAP-SER-05",tier:"C",template:"L-HILL",tags:["forest","hill"],risk:38,gather:["SER-MAT-012"],preferred:["MON-SER-019","MON-SER-021"],accessRule:"需月霧城巡林許可",description:"巨大根系隆起形成的丘地，只允許研究、救援與巡護隊伍深入。"},
  {id:"L-SER-TIDEFOREST",name:"星潮海林",zoneId:"SER-Z-06",province:"PROV-SER-06",smap:"SMAP-SER-06",tier:"D",template:"L-WOOD",tags:["forest","coast"],risk:25,gather:["SER-MAT-009"],fish:["SER-MAT-010"],preferred:["MON-SER-011","MON-SER-016"],description:"鹽霧森林與潮間灣交錯的海岸地帶。"},
  {id:"L-SER-SEAGLASSCOVE",name:"海鏡灣",zoneId:"SER-Z-06",province:"PROV-SER-06",smap:"SMAP-SER-06",tier:"D",template:"L-RIVER",tags:["coast","water"],aquatic:true,risk:24,gather:["SER-MAT-009"],fish:["SER-MAT-010"],preferred:["MON-SER-011","MON-SER-018"],description:"港外淺灣與潮池，風暴後會短期封閉。"},
  {id:"L-SER-AMBERGROVE",name:"琥珀樹脂林",zoneId:"SER-Z-07",province:"PROV-SER-07",smap:"SMAP-SER-07",tier:"D",template:"L-WOOD",tags:["forest"],risk:22,gather:["SER-MAT-004","SER-MAT-005"],woodcut:["SER-MAT-006"],preferred:["MON-SER-007","MON-SER-013"],regen:60,description:"採脂與精細木工原料林，樹脂採取會輪休單株避免傷樹。"},
  {id:"L-SER-DYERHILLS",name:"染霞丘林",zoneId:"SER-Z-07",province:"PROV-SER-07",smap:"SMAP-SER-07",tier:"D",template:"L-HILL",tags:["forest","hill"],risk:24,gather:["SER-MAT-007"],hunt:["SER-MAT-008"],preferred:["MON-SER-010","MON-SER-020"],description:"富含染料植物與果木的丘陵，是往阿斯戴爾南境方向的內陸路帶。"}
 ],
 dungeons:[
  {id:"D-SER-ROOTPALACE",name:"初林根殿",zoneId:"SER-Z-01",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"B",template:"D-AQUEDUCT",risk:58,tags:["forest","cave","ruins"],gather:["SER-MAT-015"],preferred:["MON-SER-023"],accessRule:"B級前置＋王庭與長老議會研究許可",description:"林冠庭下方被古根包覆的早期王庭遺構，平時封閉。"},
  {id:"D-SER-ARCHIVEVAULT",name:"森書根庫",zoneId:"SER-Z-01",province:"PROV-SER-01",smap:"SMAP-SER-01",tier:"C",template:"D-AQUEDUCT",risk:42,tags:["forest","ruins"],gather:["SER-MAT-011"],preferred:["MON-SER-020","MON-SER-021"],description:"學庭舊標本庫與根系維修廊，部分自動守護設施失去維護。"},
  {id:"D-MM-ROOTSHRINE",name:"根門舊祠",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"E",template:"D-AQUEDUCT",risk:16,tags:["forest","cave","ruins"],gather:["I-MUSHROOM","I-HERB"],preferred:["MON-SER-003","MON-SER-004"],description:"既有新手樹根遺構。"},
  {id:"D-MM-HOLLOWOAK",name:"空心古橡下層",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"E",template:"D-AQUEDUCT",risk:15,tags:["forest","cave"],gather:["I-MUSHROOM"],preferred:["MON-SER-002","MON-SER-005"],description:"既有空心古橡根穴。"},
  {id:"D-MM-SPRINGVAULT",name:"鹿泉石蓄室",zoneId:"SER-Z-02",province:"PROV-START-12",smap:"SMAP-START-MOSSMOON",tier:"E",template:"D-AQUEDUCT",risk:16,tags:["forest","water","ruins"],aquatic:true,fish:["I-RAWFISH"],preferred:["MON-SER-003","MON-SER-008"],description:"既有林間古蓄水室。"},
  {id:"D-SER-TWINGATE",name:"林緣雙門舊廊",zoneId:"SER-Z-03",province:"PROV-SER-03",smap:"SMAP-SER-03",tier:"C",template:"D-AQUEDUCT",risk:44,tags:["forest","ruins"],gather:["SER-MAT-001"],preferred:["MON-SER-017","MON-SER-020"],description:"古林嶺下方的舊防務通道，部分出口朝向斷境但均以界標封閉。"},
  {id:"D-SER-WATEROATH",name:"鹿泉水誓庫",zoneId:"SER-Z-04",province:"PROV-SER-04",smap:"SMAP-SER-04",tier:"D",template:"D-AQUEDUCT",risk:36,tags:["water","ruins"],aquatic:true,gather:["SER-MAT-002"],preferred:["MON-SER-012","MON-SER-018"],description:"保存歷代水權、引渠與旱年分水紀錄的古老蓄水庫。"},
  {id:"D-SER-MOONWELL",name:"月井內庭",zoneId:"SER-Z-05",province:"PROV-SER-05",smap:"SMAP-SER-05",tier:"B",template:"D-AQUEDUCT",risk:62,tags:["forest","ruins"],gather:["SER-MAT-016"],preferred:["MON-SER-024"],accessRule:"B級前置＋王庭聖域許可；禁止採伐活體古木",description:"深林聖域中的封閉內庭，古代根系構裝只允許少量研究與修復隊伍進入。"},
  {id:"D-SER-TIDEVAULT",name:"星潮沉木船渠",zoneId:"SER-Z-06",province:"PROV-SER-06",smap:"SMAP-SER-06",tier:"C",template:"D-AQUEDUCT",risk:43,tags:["coast","water","ruins"],aquatic:true,gather:["SER-MAT-009"],preferred:["MON-SER-016","MON-SER-018"],description:"被樹根與泥沙掩埋的舊船渠，潮汐會改變可通行區域。"},
  {id:"D-SER-AMBERCELLAR",name:"琥珀枝舊樹窖",zoneId:"SER-Z-07",province:"PROV-SER-07",smap:"SMAP-SER-07",tier:"C",template:"D-AQUEDUCT",risk:41,tags:["forest","ruins"],gather:["SER-MAT-004"],preferred:["MON-SER-020","MON-SER-022"],description:"古老樹脂與染料儲藏窖，因根系侵入而形成多層通道。"}
 ],
 materials:[
  ["SER-MAT-001","銀葉草","E",.08,18,"林緣常見的止血與調和草材。"],["SER-MAT-002","鹿泉薄荷","E",.06,17,"清涼水岸藥草。"],
  ["SER-MAT-003","霧苔","D",.08,28,"濕林與灰河岸常見的吸水苔。"],["SER-MAT-004","琥珀樹脂","D",.2,34,"受輪採管理的工藝與藥劑樹脂。"],
  ["SER-MAT-005","林冠蜂蠟","E",.2,22,"果林蜂房產物。"],["SER-MAT-006","月紋硬木","D",.9,48,"只由自然倒木與指定修枝取得的硬木。"],
  ["SER-MAT-007","染霞葉","D",.1,30,"製作天然染料的丘林植物。"],["SER-MAT-008","白鹿皮","E",.65,25,"依法定狩獵配額取得的皮革。"],
  ["SER-MAT-009","星潮鹽藻","E",.12,18,"海林潮池常見藻材。"],["SER-MAT-010","鹿泉銀鱒","E",.5,24,"溪谷與海林河口的食用魚。"],
  ["SER-MAT-011","古樹藥菌","C",.12,66,"只在受管理深林採集的珍稀菌材。"],["SER-MAT-012","月霧花粉","C",.05,72,"月霧外環短季花粉。"],
  ["SER-MAT-013","林守角片","C",.25,76,"大型林獸自然脫落或合法討伐後取得。"],["SER-MAT-014","森約符木","C",.18,82,"舊守護構裝回收的符文木片。"],
  ["SER-MAT-015","初林根晶","B",.22,155,"初林根殿受控回收材料。"],["SER-MAT-016","月井星露晶","B",.18,175,"月井內庭受控研究產物，不可一般採集。"]
 ].map(x=>({id:x[0],name:x[1],tier:x[2],weight:x[3],price:x[4],description:x[5]})),
 monsters:[
  {id:"MON-SER-001",name:"苔月林兔",tier:"F",habitat:["L-MM-SILVERLEAF","L-MM-RESINGLADE","L-SER-ARCHIVEGROVE"],hp:25,atk:8,def:4,drops:["SER-MAT-008"],near:true,description:"林緣常見小型獵物。"},
  {id:"MON-SER-002",name:"鹿泉紅松鼠",tier:"F",habitat:["L-MM-SILVERLEAF","L-MM-DEERSPRING","D-MM-HOLLOWOAK"],hp:27,atk:8,def:4,near:true,description:"採食堅果與野果的小獸。"},
  {id:"MON-SER-003",name:"泉谷葉蛙",tier:"F",habitat:["L-MM-DEERSPRING","D-MM-ROOTSHRINE","D-MM-SPRINGVAULT"],hp:26,atk:8,def:5,element:"水",tags:["aquatic"],near:true,description:"林泉與濕根附近的小型蛙獸。"},
  {id:"MON-SER-004",name:"琥脂甲蟲",tier:"E",habitat:["L-MM-RESINGLADE","L-SER-ARCHIVEGROVE","D-MM-ROOTSHRINE"],hp:44,atk:14,def:9,tags:["invertebrate"],drops:["SER-MAT-004"],near:true,description:"取食樹脂與腐木的大型甲蟲。"},
  {id:"MON-SER-005",name:"白鹿幼群",tier:"E",habitat:["L-SER-DEERORCHARD","D-MM-HOLLOWOAK"],hp:53,atk:15,def:9,drops:["SER-MAT-008"],near:true,description:"受狩獵季管理的林鹿群。"},
  {id:"MON-SER-006",name:"林冠羽狐",tier:"E",habitat:["L-SER-CROWNWOOD"],hp:47,atk:15,def:8,init:14,description:"會攀爬低枝捕食小獸的林狐。"},
  {id:"MON-SER-007",name:"果林刺鼬",tier:"D",habitat:["L-SER-DEERORCHARD","L-SER-AMBERGROVE"],hp:88,atk:25,def:14,description:"會翻找蜂房與果園的大型鼬獸。"},
  {id:"MON-SER-008",name:"清弦水蜥",tier:"D",habitat:["L-SER-CLEARBROOK","D-MM-SPRINGVAULT"],hp:94,atk:26,def:16,element:"水",tags:["aquatic"],drops:["SER-MAT-010"],description:"溪網中的中型水蜥。"},
  {id:"MON-SER-009",name:"林冠角鹿",tier:"D",habitat:["L-SER-CROWNWOOD"],hp:100,atk:28,def:17,drops:["SER-MAT-008"],description:"王都外環林地的大型鹿獸。"},
  {id:"MON-SER-010",name:"古林嶺灰狼",tier:"D",habitat:["L-SER-NORTHRIDGE","L-SER-DYERHILLS"],hp:95,atk:28,def:15,drops:["SER-MAT-008"],description:"北界與丘林常見狼群。"},
  {id:"MON-SER-011",name:"星潮海貂",tier:"D",habitat:["L-SER-TIDEFOREST","L-SER-SEAGLASSCOVE"],hp:90,atk:26,def:14,tags:["aquatic"],description:"能在潮池與樹根間活動的半水生獸。"},
  {id:"MON-SER-012",name:"溪網甲龜",tier:"D",habitat:["L-SER-CLEARBROOK","D-SER-WATEROATH"],hp:112,atk:24,def:24,element:"地",description:"溪流石灘的大型甲龜。"},
  {id:"MON-SER-013",name:"銀葉獠豬",tier:"C",habitat:["L-SER-NORTHRIDGE","L-SER-AMBERGROVE"],hp:160,atk:36,def:25,drops:["SER-MAT-013"],description:"北界與樹脂林的大型野豬。"},
  {id:"MON-SER-014",name:"灰河霧獺",tier:"C",habitat:["L-SER-GRAYRIVERWOOD"],hp:150,atk:35,def:22,element:"水",tags:["aquatic"],drops:["SER-MAT-010"],description:"洪水林中的大型半水獸。"},
  {id:"MON-SER-015",name:"月霧影貓",tier:"C",habitat:["L-SER-MOONFOG"],hp:145,atk:38,def:20,init:16,drops:["SER-MAT-013"],description:"利用濃霧接近獵物的大型貓科魔獸。"},
  {id:"MON-SER-016",name:"海林長吻蜥",tier:"C",habitat:["L-SER-TIDEFOREST","D-SER-TIDEVAULT"],hp:162,atk:36,def:25,element:"水",tags:["aquatic"],description:"海林河口的大型水棲爬獸。"},
  {id:"MON-SER-017",name:"北門根甲獸",tier:"C",habitat:["L-SER-GRAYRIVERWOOD","D-SER-TWINGATE"],hp:172,atk:35,def:31,element:"地",drops:["SER-MAT-013"],description:"會利用盤根作為掩護的厚甲林獸。"},
  {id:"MON-SER-018",name:"星潮銀背龜",tier:"C",habitat:["L-SER-SEAGLASSCOVE","D-SER-WATEROATH","D-SER-TIDEVAULT"],hp:178,atk:34,def:34,element:"水",tags:["aquatic"],description:"大型水龜，潮季會進入河口。"},
  {id:"MON-SER-019",name:"心根苔甲獸",tier:"C",habitat:["L-SER-MOONFOG","L-SER-HEARTROOT"],hp:175,atk:37,def:30,element:"地",drops:["SER-MAT-011"],description:"深林根丘活動的大型苔甲獸。"},
  {id:"MON-SER-020",name:"森約木衛",tier:"C",habitat:["L-SER-DYERHILLS","D-SER-ARCHIVEVAULT","D-SER-TWINGATE","D-SER-AMBERCELLAR"],hp:180,atk:36,def:32,tags:["construct"],drops:["SER-MAT-014"],description:"古老巡林與設施守護構裝。"},
  {id:"MON-SER-021",name:"根庫守頁藤傀",tier:"C",habitat:["L-SER-HEARTROOT","D-SER-ARCHIVEVAULT"],hp:160,atk:34,def:25,mdef:32,tags:["construct","plant"],drops:["SER-MAT-011"],description:"由藤木與符葉構成的舊書庫守衛。"},
  {id:"MON-SER-022",name:"樹窖琥脂傀",tier:"C",habitat:["D-SER-AMBERCELLAR"],hp:168,atk:36,def:29,tags:["construct"],drops:["SER-MAT-004","SER-MAT-014"],description:"舊樹脂庫的封存構裝。"},
  {id:"MON-SER-023",name:"初林根殿守護者",tier:"B",role:"首領",habitat:["D-SER-ROOTPALACE"],hp:342,atk:55,def:43,mdef:46,acc:83,tags:["construct","plant"],drops:["SER-MAT-015"],description:"初林根殿深層守護構裝，只在王庭許可的B級探索中出現。"},
  {id:"MON-SER-024",name:"月井星紋古衛",tier:"B",role:"首領",habitat:["D-SER-MOONWELL"],hp:336,atk:54,def:42,mdef:48,acc:84,element:"光",tags:["construct"],drops:["SER-MAT-016"],description:"月井內庭的古代守衛，不會離開聖域進入普通森林。"}
 ],
 npcs:[
  ["NPC-SER-001","艾爾希雅・瑟露維亞","林冠王","L-SER-CROWNCANOPY","王庭法統、外交、共同防務、聖域與林權長期政策","C",["ORG-SER-CROWN"],"現任林冠王，重大林權與聖域決策需依法經長老議會程序。"],
  ["NPC-SER-002","伊瑟蘭・銀枝","林冠長老議長","L-SER-CROWNCANOPY","繼承確認、古林長期規劃、聖域開放與議會程序","D",["ORG-SER-ELDERS"],"主持議會但不取代林冠王或地方樹庭。"],
  ["NPC-SER-003","瑟芮雅・森契","森約大法官","L-SER-CROWNCANOPY","林權、水權、採集、越界與樹契爭議","D",["ORG-SER-LAW"],"判案會同時檢查使用權與復育義務。"],
  ["NPC-SER-004","費倫・青弦","林冠衛隊長","L-SER-CROWNCANOPY","王都防務、共同動員與重大護送","C",["ORG-SER-CROWN"],"共同防務不等於接管各林地侯的日常巡護。"],
  ["NPC-SER-005","梅莉絲・森書","森書院長","L-SER-FORESTSCRIPT","植物學、史檔、醫療與古樹病害","E",["ORG-SER-SCHOLARS"],"長期記錄林地變化以支援王庭配額。"],
  ["NPC-SER-006","艾琳・苔月","苔月村樹庭長","L-START-MOSSMOON","新手委託、採集配額、溪谷與村落庫存","E",["ORG-SER-RANGERS"],"維持新手區採集量與復育節奏。"],
  ["NPC-SER-007","洛安・銀葉","北境林地侯","L-SER-SILVERGATE","古林嶺、斷境方向、商旅與北界防務","C",["ORG-SER-RANGERS"],"巡護隊的法定執法線止於王庭國界。"],
  ["NPC-SER-008","西蕾・霧徑","北境巡林總監","L-SER-SILVERGATE","界標、失蹤、越界採集與林火","C",["ORG-SER-RANGERS"],"重視足跡與實地證據，不把斷境所有事件歸咎單一勢力。"],
  ["NPC-SER-009","艾維安・鹿泉","鹿泉水庭長","L-SER-DEERSPRING","水權、果園、漁獲與洪水","E",["ORG-SER-WATER"],"旱季會優先飲水與生態基流。"],
  ["NPC-SER-010","芙蘿拉・白鹿","白鹿丘園務長","L-SER-WHITEDEER","果園、蜂房、獵季與藥草園","E",["ORG-SER-WATER"],"以授粉與繁殖季調整採集及狩獵。"],
  ["NPC-SER-011","露妮雅・月霧","月霧林地侯","L-SER-MOONMIST","深林巡護、聖域外環與古樹醫療","C",["ORG-SER-SANCTUARY"],"聖域開放以生態與安全條件為先。"],
  ["NPC-SER-012","塞利恩・綠脈","古樹醫官","L-SER-MOONMIST","樹病、根系、水分與深林復育","E",["ORG-SER-SANCTUARY"],"會封閉遭病害或壓力過高的採集區。"],
  ["NPC-SER-013","娜維雅・星潮","星潮港侯","L-SER-STARTIDE","港務、海防、鹽、鐵器與外貿","C",["ORG-SER-COAST"],"把外來金屬供應與王庭生態規則分開管理。"],
  ["NPC-SER-014","提爾・浪枝","海林岸衛統領","L-SER-STARTIDE","海岸巡防、風暴、救難與潮區封鎖","C",["ORG-SER-COAST"],"風暴前會優先封閉海鏡灣與沉木船渠。"],
  ["NPC-SER-015","米芮・琥珀枝","琥珀枝林侯","L-SER-AMBERBRANCH","樹脂、工藝、丘林商路與配額","C",["ORG-SER-CRAFT"],"支持工藝出口但反對透支硬木林。"],
  ["NPC-SER-016","歐蘿・染霞","工藝議庭長","L-SER-AMBERBRANCH","染料、木工、弓具與工匠標準","E",["ORG-SER-CRAFT"],"優先使用自然倒木與可再生材料。"],
  ["NPC-SER-017","瑪維爾・清弦","王庭水務記錄官","L-SER-DEERSPRING","河網流量、旱年分水、魚群與水質","F",["ORG-SER-WATER"],"用多年水文記錄避免短期用水決策破壞溪流。"],
  ["NPC-SER-018","艾奧・根語","聖域守門人","L-SER-MOONMIST","月井、初林根殿、研究資格與聖域規則","C",["ORG-SER-SANCTUARY"],"不因冒險者聲望高就跳過B級聖域前置。"],
  ["NPC-SER-019","賽芙・葉史","王庭史檔官","L-SER-FORESTSCRIPT","王族、長老議會、樹契、邊界與公開史料","F",["ORG-SER-SCHOLARS"],"清楚區分傳說、王庭宣稱與可核對記錄。"],
  ["NPC-SER-020","洛瑞安・遠徑","冒險者公會林境聯絡官","L-SER-SILVERGATE","林地委託、失蹤者、野外清理與高階前置","C",[],"會先確認巡林許可與生態限制，再核發深林任務。"]
 ],
 orgs:[
  {id:"ORG-SER-CROWN",name:"瑟露維亞林冠王庭院",kind:"government",tier:"B",base_location_id:"L-SER-CROWNCANOPY",description:"處理共同外交、防務、王領與中央任命。"},
  {id:"ORG-SER-ELDERS",name:"林冠長老議會",kind:"government",tier:"B",base_location_id:"L-SER-CROWNCANOPY",description:"確認王位繼承、古林長期政策、聖域開放與跨林地重大森約。"},
  {id:"ORG-SER-LAW",name:"王庭森約法院",kind:"government",tier:"B",base_location_id:"L-SER-CROWNCANOPY",description:"處理林權、水權、採集配額、越界與地方樹契上訴。"},
  {id:"ORG-SER-RANGERS",name:"銀葉巡林總署",kind:"military",tier:"C",base_location_id:"L-SER-SILVERGATE",description:"維護北界、巡林、火防、失蹤搜救與野外承載紀錄。"},
  {id:"ORG-SER-WATER",name:"鹿泉水庭聯署",kind:"civic",tier:"C",base_location_id:"L-SER-DEERSPRING",description:"管理溪網、水權、魚群、旱年分水與洪水應變。"},
  {id:"ORG-SER-SANCTUARY",name:"月霧聖域守護庭",kind:"civic",tier:"B",base_location_id:"L-SER-MOONMIST",description:"管理深林聖域、古樹醫療、研究前置與封養區。"},
  {id:"ORG-SER-COAST",name:"星潮海林岸衛署",kind:"military",tier:"C",base_location_id:"L-SER-STARTIDE",description:"維護海岸、港區、救難、風暴封鎖與海林環境。"},
  {id:"ORG-SER-CRAFT",name:"琥珀枝工藝議庭",kind:"craft",tier:"C",base_location_id:"L-SER-AMBERBRANCH",description:"協調樹脂、染料、精細木工、弓具與可持續材料標準。"}
 ],
 offices:[
  {id:"POL-012-O1",title:"林冠王",authority_tier:"AUTH-6",authority_level:6,scope:"王庭法統、外交、共同防務、王領與最高任命",appointment:"王族法定繼承＋林冠長老議會確認",rights:["AR-001","AR-002","AR-003","AR-004","AR-005"],reports_to:null},
  {id:"POL-012-O2",title:"林冠長老議長",authority_tier:"AUTH-5",authority_level:5,scope:"繼承確認、古林長期規劃、聖域開放與議會程序",appointment:"長老議會依法互選",rights:["AR-003","AR-005"],reports_to:null,parallel_authority_ids:["POL-012-O1"]},
  {id:"POL-012-O3",title:"王儲／星裔繼承人",authority_tier:"AUTH-5",authority_level:5,scope:"法定繼承順位與受委任王庭任務",appointment:"王族繼承序＋議會資格確認",rights:[],reports_to:"POL-012-O1",notes:"未登位前不自動取得林冠王完整權力。"},
  {id:"POL-012-O4",title:"林地侯／守林領主",authority_tier:"AUTH-4",authority_level:4,scope:"地方林區、聚落、水源、巡護與依法授予的林權",appointment:"世襲、王庭授領或地方法定承認",rights:["AR-003","AR-004","AR-005"],reports_to:"POL-012-O1"},
  {id:"POL-012-O5",title:"森約大法官",authority_tier:"AUTH-5",authority_level:5,scope:"林權、水權、採集、越界與森約上訴",appointment:"林冠王提名、長老議會確認",rights:["AR-005"],reports_to:"POL-012-O1"},
  {id:"POL-012-O6",title:"守林將軍／巡林總監",authority_tier:"AUTH-4",authority_level:4,scope:"共同巡林、防務、林火、救援與邊界執行",appointment:"王庭依法任命",rights:["AR-003","AR-004"],reports_to:"POL-012-O1"},
  {id:"POL-012-O7",title:"樹庭長／水庭長／港侯",authority_tier:"AUTH-3",authority_level:3,scope:"地方聚落、水務、港務與公共採集規則",appointment:"地方制度產生並受王庭法承認",rights:["AR-003","AR-005"],reports_to:"POL-012-O4"},
  {id:"POL-012-O8",title:"林地守護者／學官／工藝議席",authority_tier:"AUTH-2",authority_level:2,scope:"專業巡護、研究、工藝與公共事務",appointment:"主管機構或地方樹庭任命",rights:["AR-003"],reports_to:"POL-012-O7"},
  {id:"POL-012-O9",title:"村庭代表／巡林人／水務記錄員",authority_tier:"AUTH-1",authority_level:1,scope:"村社、巡護、採集登記與基層公共服務",appointment:"地方推選或主管任命",rights:["AR-003"],reports_to:"POL-012-O7"}
 ],
 powerCenters:["林冠王室","林冠長老議會","主要林地侯","森約法院","銀葉巡林總署","月霧聖域守護庭","地方樹庭與水庭"],
 playerInteraction:"低階玩家主要從苔月村、鹿泉與普通巡林委託接觸採集、獸害、水務與搜救；中階可處理北界、林權與古樹病害；B級初林根殿與月井內庭需要王庭、長老議會或聖域守護庭的明確前置。",
 links:[
  ["L-SER-CROWNCANOPY","L-SER-FORESTSCRIPT",1],["L-SER-CROWNCANOPY","L-SER-CROWNWOOD",1],["L-SER-FORESTSCRIPT","L-SER-ARCHIVEGROVE",.8],["L-SER-ARCHIVEGROVE","D-SER-ARCHIVEVAULT",1],["L-SER-CROWNWOOD","D-SER-ROOTPALACE",1.5],
  ["L-SER-CROWNCANOPY","L-START-MOSSMOON",4.5],["L-START-MOSSMOON","L-MM-SILVERLEAF",1],["L-START-MOSSMOON","L-MM-DEERSPRING",1.4],["L-START-MOSSMOON","L-MM-RESINGLADE",1.3],
  ["L-SER-CROWNCANOPY","L-SER-SILVERGATE",5],["L-SER-SILVERGATE","L-SER-NORTHRIDGE",1],["L-SER-SILVERGATE","L-SER-GRAYRIVERWOOD",1.4],["L-SER-NORTHRIDGE","D-SER-TWINGATE",1.2],
  ["L-SER-CROWNCANOPY","L-SER-DEERSPRING",3],["L-SER-DEERSPRING","L-SER-WHITEDEER",1.5],["L-SER-DEERSPRING","L-SER-DEERORCHARD",.8],["L-SER-DEERSPRING","L-SER-CLEARBROOK",1],["L-SER-CLEARBROOK","D-SER-WATEROATH",1],
  ["L-SER-CROWNCANOPY","L-SER-MOONMIST",4],["L-SER-MOONMIST","L-SER-MOONFOG",1],["L-SER-MOONFOG","L-SER-HEARTROOT",1.4],["L-SER-HEARTROOT","D-SER-MOONWELL",1.2],
  ["L-SER-CROWNCANOPY","L-SER-STARTIDE",6],["L-SER-STARTIDE","L-SER-TIDEFOREST",1],["L-SER-STARTIDE","L-SER-SEAGLASSCOVE",.8],["L-SER-TIDEFOREST","D-SER-TIDEVAULT",1.2],
  ["L-SER-CROWNCANOPY","L-SER-AMBERBRANCH",4],["L-SER-AMBERBRANCH","L-SER-AMBERGROVE",.8],["L-SER-AMBERBRANCH","L-SER-DYERHILLS",1],["L-SER-AMBERGROVE","D-SER-AMBERCELLAR",1]
 ],
 hooks:[
  ["HOOK-SER-01","北界失蹤巡林隊","巡林隊在界標附近失去聯絡，需確認是林獸、倒木、斷境人群還是越界事件。","C"],
  ["HOOK-SER-02","苔月採脂超額","樹脂產量帳冊與實際樹傷不符，調查需分辨黑市、錯記或外來採集。","E"],
  ["HOOK-SER-03","鹿泉水位下降","上游泉量異常減少，水庭要求同時檢查自然變化與人為引水。","D"],
  ["HOOK-SER-04","白鹿丘失衡花期","授粉季提前導致蜂房與果園錯配，玩家協助搬運蜂箱並調查氣候原因。","D"],
  ["HOOK-SER-05","月霧古樹病斑","數株古樹出現相同病斑，需採樣、追查水土並避免為取樣過度傷樹。","C"],
  ["HOOK-SER-06","星潮港鐵器短缺","風暴延誤外來鐵器船期，工匠與岸衛爭用有限庫存。","D"],
  ["HOOK-SER-07","琥珀枝染料爭議","兩家工坊都聲稱擁有同一片染霞丘的採集時段，需要核對樹庭配額。","C"],
  ["HOOK-SER-08","月井內庭甦醒","古衛重新啟動，王庭要求先判明是聖域週期、損壞還是外力干擾。","B"]
 ],
 life:[
  ["LIFE-SER-01","銀葉萌芽季","低階藥草增加，但部分林區為保護新芽限制踩踏。"],["LIFE-SER-02","白鹿封獵期","繁殖季停止部分狩獵委託，皮革供應下降。"],
  ["LIFE-SER-03","鹿泉春水","溪網擴張，魚產增加但部分小徑被淹。"],["LIFE-SER-04","月霧長霧週","深林可視距離下降，巡林任務增加。"],
  ["LIFE-SER-05","林冠長老季會","王庭旅宿、抄寫與護衛需求上升。"],["LIFE-SER-06","琥珀採脂輪休","一批樹區停止採脂並轉入復育。"],
  ["LIFE-SER-07","星潮風暴季","港口減少泊位，鐵器與鹽價格可能上升。"],["LIFE-SER-08","古樹健康普查","巡林與學庭共同檢查病害，部分深林暫停採集。"]
 ],
 lore:[
  ["LORE-SER-01","politics","林冠王與長老議會互相制衡","林冠王掌外交與共同防務；長老議會確認繼承、長期古林政策與聖域開放，兩者都不能任意剝奪合法地方樹庭權利。"],
  ["LORE-SER-02","law","採集權必須附帶復育義務","森約法把伐木、採脂、狩獵和水權視為可持續使用權，而不是對自然資源的無限制所有權。"],
  ["LORE-SER-03","geography","斷境不是王庭北方領地","瑟露維亞北界止於古林嶺與灰河南段，REG-19斷境維持無穩定主權的緩衝地。"],
  ["LORE-SER-04","economy","精靈長壽不等於資源無限","長期規劃反而使王庭更重視輪採、封養、樹齡與水文；市場供應會受季節與恢復時間限制。"],
  ["LORE-SER-05","society","王族身份不自帶地方統治權","王族親王、公主與王儲若沒有官職、封地或議會授權，不自動取得地方課稅、司法或巡林指揮權。"],
  ["LORE-SER-06","adventure","B級王庭不代表普通森林都是B級","苔月村、果林、溪網與海林仍維持F～D級，B級只集中於初林根殿與月井內庭等受控聖域。"]
 ],
 starterIds:["L-START-MOSSMOON","L-MM-SILVERLEAF","L-MM-DEERSPRING","L-MM-RESINGLADE","D-MM-ROOTSHRINE","D-MM-HOLLOWOAK","D-MM-SPRINGVAULT"]
};

const anwSystem=buildPolity(ANWEIR),serSystem=buildPolity(SERUVIA);
if(Array.isArray(DB.lore_records)){const rebuilt={};for(const x of DB.lore_records){const k=String(x.scope_type||"world")+":"+String(x.scope_id||"global");(rebuilt[k]||(rebuilt[k]=[])).push(x.id)}DB.lore_query_index=rebuilt}
function runAnweirDepthAudit(){return auditPolity(ANWEIR)}
function runSeruviaDepthAudit(){return auditPolity(SERUVIA)}
DB.meta=DB.meta||{};DB.meta.anweir_seruvia_depth_revision=REV;
anwSystem.initial_audit=runAnweirDepthAudit();serSystem.initial_audit=runSeruviaDepthAudit();
globalThis.runAnweirDepthAudit=runAnweirDepthAudit;
globalThis.runSeruviaDepthAudit=runSeruviaDepthAudit;
globalThis.QUNLU_ANWEIR_SERUVIA=Object.freeze({version:REV,anweir:anwSystem,seruvia:serSystem,audit:()=>({pass:runAnweirDepthAudit().pass&&runSeruviaDepthAudit().pass,anweir:runAnweirDepthAudit(),seruvia:runSeruviaDepthAudit()})});
CORE?.registerModule?.("src/anweir-seruvia-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();