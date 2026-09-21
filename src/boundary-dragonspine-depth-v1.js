/* 群陸旅誌：斷境無主地＋龍脊火山群完整區域深化 CURRENT-2.05.0
 * BOUNDARY-DRAGONSPINE-DEPTH-1.0
 * REG-19 / POL-019 與 REG-20：
 * 非國家區域治理、聚落、野外、地下城、怪物、素材、NPC、地方組織、經濟與活世界鉤子。
 * 原則：斷境不建立統一中央主權；龍脊不建立政治體或首都。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.locations))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.05.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.05.0";
const REV="BOUNDARY-DRAGONSPINE-DEPTH-1.0";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const rank=t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6}[String(t||"F")]??0);
function arr(k){DB[k]=Array.isArray(DB[k])?DB[k]:[];return DB[k]}
function row(k,id,key="id"){return (DB[k]||[]).find(x=>x?.[key]===id)||null}
function upsert(k,v,key="id"){const a=arr(k),i=a.findIndex(x=>x?.[key]===v[key]);if(i>=0)a[i]=Object.assign(a[i],v);else a.push(v);return i>=0?a[i]:v}
function loc(id){return row("locations",id)}
function link(a,b,h){const x=loc(a);if(!x||!loc(b))return;x.links=Array.isArray(x.links)?x.links:[];const old=x.links.find(e=>e?.to===b);if(old)old.hours=h;else x.links.push({to:b,hours:h})}
function twoWay(a,b,h){link(a,b,h);link(b,a,h)}
function econ(score,label,drivers,constraints,price=1,stock=1,budget=1,liquidity=1){return{prosperity_score:score,prosperity_label:label,market_price_mult:price,stock_mult:stock,market_budget_mult:budget,liquidity_mult:liquidity,drivers:[...drivers],constraints:[...constraints]}}
function material(x,C,gatherable){return{id:x[0],name:x[1],kind:"material",type:"素材",catalog_group:"素材",stackable:true,category:x[6]||"material",tier:x[2],weight:x[3],value:x[4],base_price_copper:x[4],price_copper:x[4],rarity:rank(x[2])>=rank("B")?"rare":rank(x[2])>=rank("C")?"uncommon":"common",regional_origin_id:C.regionId,regional_origin_ids:[C.regionId],source_region_ids:[C.regionId],source_polity_id:C.polityId||null,wild_gather_eligible:gatherable.has(x[0]),economy_tags:x[7]||[],description:x[5]}}
function monster(x,C){
 const dmg={F:[2,5],E:[5,10],D:[9,17],C:[14,25],B:[22,38]};
 return{id:x.id,name:x.name,tier:x.tier,role:x.role||"一般",lore_role:x.role||"一般",region:C.name,category:(x.tags||[]).includes("construct")?"構裝體":(x.tags||[]).includes("plant")?"植物系":(x.tags||[]).includes("elemental")?"元素系":"野獸與一般魔物系",habitat:[...(x.habitat||[])],habitats:[...(x.habitat||[])],habitat_location_ids:[...(x.habitat||[])],hp:x.hp,attack:x.atk,defense:x.def,magicDefense:x.mdef??Math.max(2,Math.round((x.def||4)*.8)),accuracy:x.acc||70,initiative:x.init||10,damage:[...(x.damage||dmg[x.tier]||[2,5])],primary_element:x.element||null,element:x.element||null,xp_reward:({F:10,E:18,D:34,C:58,B:96}[x.tier]||12),description:x.description,near_town_eligible:!!x.near,encounter_enabled:true,encounter_weight:x.weight||1,political_entity_id:C.polityId||null,ecology_profile:{body_scale:x.scale||"medium",tags:[...(x.tags||["wildlife"])]},loot_profile:{version:"LOOT-ECOLOGY-1.0",fallback_policy:"none",allowed_material_ids:[...(x.drops||[])]},loot_materials:(x.drops||[]).map((id,i)=>({id,chance:Math.max(.14,(x.lootChance??.42)-i*.08),min:1,max:x.maxDrop||1}))}
}
function town(x,C){
 const base=clone(loc(x.id)||{});
 return Object.assign(base,{id:x.id,name:x.name,kind:"town",tier:x.tier,world_tier:x.tier,settlement_world_tier:x.tier,size:x.size,region:C.name,description:x.description,facilities:uniq([...(base.facilities||[]),...(x.facilities||[])]),links:Array.isArray(base.links)?base.links:[],safety_score:x.safety,safety_label:x.safety>=85?"穩定":x.safety>=75?"警戒":"危險",risk:Math.max(5,100-x.safety),world_region_id:C.regionId,region_id:C.regionId,political_entity_id:C.polityId||null,polity_id:C.polityId||null,culture_id:C.cultureId||null,history_scope:C.name+"／"+x.zone,political_role:x.role,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:C.realmId,local_authority:clone(x.authority),local_economy:clone(x.economy),depth_zone_id:x.zoneId,nonstate_settlement:true})
}
function field(x,C,kind="wild"){
 const base=clone(loc(x.id)||{}),ref=loc(x.template)||loc("L-HILL")||loc("L-WOOD")||{},ep=clone(base.encounter_profile||ref.encounter_profile||{});
 Object.assign(ep,{zone:kind==="dungeon"?"dungeon":x.zoneClass||"frontier",max_tier:x.tier,strict_habitat:true,no_constraint_relaxation:true,allow_magical_ecology:true,allow_demons:false,allow_undead:false,allow_aquatic:!!x.aquatic,archetype:x.archetype||"open_wild",space_class:x.space||"standard",preferred_monster_ids:[...(x.preferred||[])]});
 return Object.assign(base,{id:x.id,name:x.name,kind,tier:x.tier,world_tier:x.tier,size:x.size||"地方區域",region:C.name,description:x.description,world_region_id:C.regionId,region_id:C.regionId,political_entity_id:C.polityId||null,polity_id:C.polityId||null,culture_id:C.cultureId||null,province_region_id:x.province,settlement_region_id:x.smap,realm_region_map_id:C.realmId,links:Array.isArray(base.links)?base.links:[],risk:x.risk,safety_score:Math.max(12,100-x.risk),safety_label:x.risk<=20?"普通":x.risk<=35?"警戒":"危險",encounter_profile:ep,tags:uniq([...(base.tags||[]),...(x.tags||[])]),gather:uniq([...(base.gather||[]),...(x.gather||[])]),mining:uniq([...(base.mining||[]),...(x.mining||[])]),woodcut:uniq([...(base.woodcut||[]),...(x.woodcut||[])]),fish:uniq([...(base.fish||[]),...(x.fish||[])]),hunt:uniq([...(base.hunt||[]),...(x.hunt||[])]),explore:x.explore||base.explore||[],preferred_monster_ids:[...(x.preferred||[])],resource_capacity:clone(x.capacity||base.resource_capacity||{forage:14,hunt:7,ore:6,wood:5,water:5}),resource_regen_hours:x.regen??base.resource_regen_hours??60,hunt_requires_battle:true,depth_zone_id:x.zoneId,access_rule:x.accessRule||null,environment_hazards:[...(x.hazards||[])]})
}
function build(C){
 const gatherable=new Set([...C.fields,...C.dungeons].flatMap(x=>[...(x.gather||[]),...(x.mining||[]),...(x.woodcut||[]),...(x.fish||[]),...(x.hunt||[])]));
 for(const x of C.materials)upsert("items",material(x,C,gatherable));
 for(const x of C.towns)upsert("locations",town(x,C));
 for(const x of C.fields)upsert("locations",field(x,C,"wild"));
 for(const x of C.dungeons)upsert("locations",field({...x,zoneClass:"dungeon"},C,"dungeon"));
 for(const x of C.monsters)upsert("monsters",monster(x,C));
 for(const n of C.npcs)upsert("regional_npc_archetypes",{id:n[0],name:n[1],role:n[2],tier:n[5],location_id:n[3],knowledge_scope:n[4],combat_tier_ceiling:n[5],organization_ids:[...(n[6]||[])],services:[...(n[8]||["地方情報","委託引介"])],description:n[7],region_id:C.regionId,polity_id:C.polityId||null,culture_id:C.cultureId||null,nonstate_context:true});
 for(const o0 of C.orgs)upsert("world_organizations",{...o0,political_entity_id:C.polityId||null,associated_polity_ids:C.polityId?[C.polityId]:[],region_id:C.regionId,scope:"local_regional",category:o0.kind,alignment:"neutral",primary_facility:o0.primary_facility||"guild",min_join_level:1,join_reputation:0,visibility:"public",legal_status:"customary",joinable:o0.joinable!==false,mission_issuer:true,can_be_enemy:o0.can_be_enemy!==false,contact_location_ids:uniq([...(o0.contact_location_ids||[]),o0.base_location_id]),member_bonus:o0.member_bonus||{id:"BONUS-"+o0.id,text:o0.name+"地方訓練",effects:{perception:2}},history:o0.history||[C.history],history_summary:(o0.history||[C.history]).join(" "),current_state:o0.current_state||C.currentState,signature:o0.signature||o0.description,distinctive_features:o0.distinctive_features||[o0.description,C.identity]});
 for(const h of C.hooks)upsert("regional_adventure_hooks",{id:h[0],title:h[1],premise:h[2],tier:h[3],region_id:C.regionId,polity_id:C.polityId||null,state_keys:h[4]||[],investigation_required:true});
 for(const e of C.life)upsert("regional_life_events",{id:e[0],name:e[1],text:e[2],region_id:C.regionId,polity_id:C.polityId||null,state_effects:e[3]||{}});
 const verifyKeys=Object.keys(DB.lore_system?.verification_levels||{}),verify=verifyKeys.includes("verified")?"verified":(verifyKeys.includes("recorded")?"recorded":(verifyKeys[0]||"recorded"));
 for(const l of C.lore)upsert("lore_records",{id:l[0],category:l[1],title:l[2],text:l[3],scope_type:"region",scope_id:C.regionId,verification:verify,era_id:"ERA-05",source_refs:[C.regionId,...(C.polityId?[C.polityId]:[])],tags:[C.name,"區域深化","非國家區域"],common_knowledge:true,political_entity_id:C.polityId||null,region_ids:[C.regionId],visibility:"public"});
 for(const z of C.zones){
  const towns=C.towns.filter(x=>x.zoneId===z.id).map(x=>x.id),wilds=C.fields.filter(x=>x.zoneId===z.id).map(x=>x.id),dungeons=C.dungeons.filter(x=>x.zoneId===z.id).map(x=>x.id);
  upsert("province_region_maps",{id:z.province,layer:"province_region",name:z.name,display_name:C.name+"・"+z.name,parent_realm_map_id:C.realmId,political_entity_id:C.polityId||null,world_region_id:C.regionId,world_tier:z.tier,map_status:"playable_current",capital_location_id:z.seat,all_settlement_ids:towns,wild_location_ids:wilds,dungeon_location_ids:dungeons,identity:z.role,depth_zone_id:z.id,nonstate_region:true});
  upsert("settlement_region_maps",{id:z.smap,name:z.name+"區域圖",parent_province_region_id:z.province,center_location_id:z.seat,world_tier:z.tier,map_status:"playable_current",location_ids:[...towns,...wilds,...dungeons],role:z.role,depth_zone_id:z.id,nonstate_region:true});
 }
 let rm=row("realm_region_maps",C.realmId);
 if(!rm)rm=upsert("realm_region_maps",{id:C.realmId,layer:"realm_region",political_entity_id:C.polityId||null,world_region_id:C.regionId,name:C.name+"區域地圖"});
 Object.assign(rm,{name:C.name+"區域地圖",display_name:C.name,political_entity_id:C.polityId||null,world_region_ids:[C.regionId],core_region_id:C.regionId,capital:null,province_region_ids:C.zones.map(x=>x.province),regional_centers:[...C.centers],world_tier:C.worldTier,map_status:"playable_current",notes:C.mapNotes,nonstate_region:true});
 const reg=row("world_regions",C.regionId);if(reg)Object.assign(reg,{...C.regionUpdate,map_status:"playable_current",nonstate:true,sovereignty_status:C.sovereignty});
 if(C.polityId){
  const p=row("political_entities",C.polityId);
  if(p)Object.assign(p,{name:C.name,government_type:"無穩定中央主權",capital:null,current_title:"無",top_office:"無",ruling_structure:C.rulingStructure,legal_tradition:C.legalTradition,identity:C.identity,gameplay_role:C.gameplayRole,world_tier:C.worldTier,sovereignty_status:"fragmented_nonstate_buffer",secondary_centers:[...C.centers],key_organization_ids:uniq([...(p.key_organization_ids||[]),...C.orgs.map(x=>x.id)]),external_relations:C.externalRelations});
 }
 upsert("regional_content_profiles",{id:C.profileId,region_id:C.regionId,polity_id:C.polityId||null,region_name:C.name,recommended_tier:C.tierBand,identity:C.identity,terrain:C.regionUpdate.terrain,common_exports:C.exports,common_imports:C.imports,food_staples:C.foods,recurring_risks:C.risks,nonstate_region:true});
 upsert("regional_economy_profiles",{id:C.econId,region_id:C.regionId,polity_id:C.polityId||null,exports:C.exports,imports:C.imports,notes:C.economyNotes,market_constraints:C.marketConstraints});
 for(const [a,b,h] of C.links)twoWay(a,b,h);
 DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
 DB.content_link_index.location_content=DB.content_link_index.location_content&&typeof DB.content_link_index.location_content==="object"?DB.content_link_index.location_content:{};
 DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
 for(const l of [...C.towns,...C.fields,...C.dungeons].map(x=>loc(x.id)).filter(Boolean))DB.content_link_index.location_content[l.id]={facility_ids:[...(l.facilities||[])],gather_item_ids:uniq([...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[])]),fish_item_ids:[...(l.fish||[])],encounter_monster_ids:C.monsters.filter(m=>(m.habitat||[]).includes(l.id)).map(m=>m.id),organization_ids:C.orgs.filter(o=>o.base_location_id===l.id||(o.contact_location_ids||[]).includes(l.id)).map(o=>o.id)};
 for(const it of C.materials){const id=it[0],s=DB.content_link_index.item_sources[id]=DB.content_link_index.item_sources[id]||{};for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];for(const l0 of [...C.fields,...C.dungeons])if(uniq([...(l0.gather||[]),...(l0.mining||[]),...(l0.woodcut||[]),...(l0.fish||[]),...(l0.hunt||[])]).includes(id)&&!s.gather_locations.includes(l0.id))s.gather_locations.push(l0.id);for(const m of C.monsters)if((m.drops||[]).includes(id)&&!s.monster_drops.includes(m.id))s.monster_drops.push(m.id)}
 const state={id:"STATE-"+C.code,region_id:C.regionId,version:REV,axes:clone(C.stateAxes),event_chains:clone(C.eventChains),rumor_rules:{verified_only_for_canon:true,local_knowledge_only:true,expire_when_resolved:true},npc_reaction_rules:{scarcity:"商人降低庫存、提高收購選擇性，不產生無限貨源",danger:"聚落縮短營業與旅行時段，救援／護送委託增加",route_closed:"跨區商品庫存下降，地方替代品需求上升",recovery:"資源恢復率逐步回升，不瞬間補滿"}};
 upsert("regional_state_profiles",state);
 const system={version:REV,release:RELEASE,region_id:C.regionId,political_entity_id:C.polityId||null,world_tier:C.worldTier,tier_band:C.tierBand,nonstate:true,sovereignty:C.sovereignty,zone_ids:C.zones.map(x=>x.id),settlement_ids:C.towns.map(x=>x.id),wild_ids:C.fields.map(x=>x.id),dungeon_ids:C.dungeons.map(x=>x.id),monster_ids:C.monsters.map(x=>x.id),npc_ids:C.npcs.map(x=>x[0]),organization_ids:C.orgs.map(x=>x.id),material_ids:C.materials.map(x=>x[0]),state_profile_id:state.id,save_compatible:true};
 DB[C.systemKey]=system;return system
}
function audit(C){
 const issues=[];
 if(C.towns.length!==8)issues.push(C.name+"聚落應為8");
 if(C.fields.length!==14)issues.push(C.name+"野外應為14");
 if(C.monsters.length!==24)issues.push(C.name+"怪物應為24");
 if(C.npcs.length!==18)issues.push(C.name+"核心NPC應為18");
 if(C.orgs.length!==8)issues.push(C.name+"地方組織應為8");
 if(C.materials.length!==16)issues.push(C.name+"素材應為16");
 if(C.zones.length!==6)issues.push(C.name+"區域帶應為6");
 if(C.dungeons.length!==C.expectedDungeons)issues.push(C.name+"地下城數量失步");
 for(const x of [...C.towns,...C.fields,...C.dungeons]){const l=loc(x.id);if(!l){issues.push("地點缺失:"+x.id);continue}if(l.region_id!==C.regionId)issues.push("地點REG失步:"+x.id);if((C.polityId||null)!==(l.political_entity_id||null))issues.push("地點主權標記錯誤:"+x.id);if(l.kind!=="town"&&l.hunt_requires_battle!==true)issues.push("野外打獵未鎖戰鬥:"+x.id)}
 for(const m of C.monsters){const x=row("monsters",m.id);if(!x)issues.push("怪物缺失:"+m.id);else{if(rank(x.tier)>rank("B"))issues.push("怪物超過B級:"+m.id);if(x.near_town_eligible&&rank(x.tier)>rank("E"))issues.push("近聚落怪物超階:"+m.id);if(x.loot_profile?.fallback_policy!=="none")issues.push("掉落fallback未關閉:"+m.id);for(const d of x.loot_materials||[])if(!row("items",d.id))issues.push("掉落素材缺失:"+m.id+"->"+d.id)}}
 for(const n of C.npcs){const x=row("regional_npc_archetypes",n[0]);if(!x||!loc(x.location_id))issues.push("NPC所在地缺失:"+n[0]);if(x&&rank(x.combat_tier_ceiling)>rank("C"))issues.push("一般NPC戰力超C:"+n[0])}
 for(const o of C.orgs)if(!row("world_organizations",o.id))issues.push("組織缺失:"+o.id);
 for(const z of C.zones)if(!row("province_region_maps",z.province)||!row("settlement_region_maps",z.smap))issues.push("區域地圖缺失:"+z.id);
 if(!row("regional_state_profiles","STATE-"+C.code))issues.push("活世界狀態檔缺失");
 if(C.regionId==="REG-19"&&row("political_entities","POL-019")?.capital)issues.push("斷境不得建立首都");
 if(C.regionId==="REG-20"&&(C.polityId||null)!==null)issues.push("龍脊不得建立政治體");
 return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{zones:C.zones.length,settlements:C.towns.length,wilds:C.fields.length,dungeons:C.dungeons.length,monsters:C.monsters.length,npcs:C.npcs.length,organizations:C.orgs.length,materials:C.materials.length}}
}

const BOUNDARY={
 code:"BND-19",systemKey:"boundary_no_mans_land_depth",name:"斷境無主地",regionId:"REG-19",polityId:"POL-019",cultureId:null,realmId:"RMAP-REG-19",profileId:"RCP-BND-19",econId:"ECO-BND-19",worldTier:"C",tierBand:"E～B",expectedDungeons:9,sovereignty:"fragmented_nonstate_buffer",
 history:"斷境原是山地礦道、灰河渡口、舊堡與商路驛站的拼接地帶。多次邊界變動、礦脈枯竭與道路崩毀後，沒有任何一方能長期維持全域行政，地方遂以棚市公議、渡口互保、救援誓約與短期武裝契約維持最低秩序。",
 currentState:"北段依賴安威爾南門商路，南段依賴瑟露維亞林緣補給；灰河水位、礦谷坍塌、盜匪與傭兵競逐會直接改變道路、物價、救援與聚落安全。",
 identity:"安威爾帝國與瑟露維亞精靈王庭之間的破碎緩衝走廊。沒有共同承認的首都、王室或中央政府；各聚落靠地方公議、商旅互保、救援隊與短期契約自保，外國巡邏線均止於各自合法國境。",
 gameplayRole:"E～B級非國家邊境沙盒／商旅護送、拾礦、廢堡探索、灰河渡運、失蹤調查、地方自治與多方利益衝突",
 rulingStructure:"不存在全域統治機關。北口棚市、灰河渡、斷堡、拾礦鎮與雙門驛各自維持地方規約；跨聚落事務多靠斷境互保公議臨時協調，沒有永久稅制、常備國軍或可代表全域的最高官職。",
 legalTradition:"地方公議章程、商隊保證金、渡口水路慣例、救援優先條款、拾礦先占登記與見證契約並存；任何組織的規約只在其實際維持服務與安全的範圍內有效。",
 regionUpdate:{name:"斷境無主地",recommended_tier:"C",playable_tier_band:"E～B",terrain:"斷境裂脊、灰河礫谷、廢礦、碎石坡、疏林、海風峭壁與舊堡道路",regional_identity:"無中央主權的西部狹長緩衝地，北接安威爾冠脊南門、南接瑟露維亞銀葉北境。"},
 mapNotes:"REG-19沿用既有斷境灰河、斷境裂脊、西南林境路與斷境雙門。所有聚落均為地方自治／互保據點，不建立新國家或首都。",
 centers:["北口棚市","灰河渡","斷堡聚落","拾礦鎮","裂脊驛","西崖棚鎮","百帳營","雙門驛"],
 exports:["回收金屬","低中階礦材","皮革","石材","舊構件","商旅服務"],imports:["糧食","藥品","木材","鹽","工具","織物"],foods:["硬餅","燻肉","灰河魚湯","豆麥粥","乾果","鹽根菜"],risks:["盜匪轉移","礦坑坍塌","灰河暴漲","落石","道路封閉","傭兵衝突","物資短缺","假情報"],
 economyNotes:"斷境市場以小庫存、現貨與保證金為主。拾礦、回收、獵物和灰河漁獲都有區域容量；道路中斷會立刻壓低收購預算並拉高進口品價格，不允許商人無限收購。",
 marketConstraints:["各聚落市場預算獨立","高階礦材只在受控深層少量出現","同一廢墟不可無限刷新回收物","道路封閉會影響庫存與價格","打獵必須進入戰鬥"],
 externalRelations:[{name:"安威爾帝國",relation:"northern_border",note:"冠脊南門堡之外才進入斷境；安威爾巡邏不取得REG-19主權。"},{name:"瑟露維亞精靈王庭",relation:"southern_border",note:"銀葉門與古林嶺北側為界；王庭巡林不把斷境視為本國林地。"},{name:"阿斯戴爾王國",relation:"eastern_trade",note:"東側支路與縮小後西境河谷、南境丘陵進行補給與商貿。"}],
 zones:[
  {id:"BND-Z-01",name:"冠脊北口帶",tier:"D",province:"PROV-BND-01",smap:"SMAP-BND-01",seat:"L-BND-NORTHMARKET",role:"安威爾南門外的車隊轉運、邊境公告與低階救援"},
  {id:"BND-Z-02",name:"灰河礦谷",tier:"C",province:"PROV-BND-02",smap:"SMAP-BND-02",seat:"L-BND-GRAYFORD",role:"灰河渡運、廢礦、拾礦、河谷農圃與水位管理"},
  {id:"BND-Z-03",name:"斷堡走廊",tier:"C",province:"PROV-BND-03",smap:"SMAP-BND-03",seat:"L-BND-BROKENKEEP",role:"舊堡、道路互保、傭兵契約與中段商隊安全"},
  {id:"BND-Z-04",name:"裂脊高地",tier:"B",province:"PROV-BND-04",smap:"SMAP-BND-04",seat:"L-BND-RIDGEPOST",role:"高風險裂脊、舊礦道、救援瞭望與受控深層探索"},
  {id:"BND-Z-05",name:"西崖風口",tier:"C",province:"PROV-BND-05",smap:"SMAP-BND-05",seat:"L-BND-WESTCLIFF",role:"海風峭壁、鹽棚、漁獲、崖道與西側補給"},
  {id:"BND-Z-06",name:"雙門南境",tier:"C",province:"PROV-BND-06",smap:"SMAP-BND-06",seat:"L-BND-TWINGATE",role:"古林嶺北緣、南向商旅、難民救助與瑟露維亞邊界接觸"}
 ],
 towns:[
  {id:"L-BND-NORTHMARKET",name:"北口棚市",zoneId:"BND-Z-01",zone:"冠脊北口帶",province:"PROV-BND-01",smap:"SMAP-BND-01",tier:"E",size:"邊境棚市",safety:83,role:"南門外中立交易與車隊重編",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"棚市公議／夜巡值首",tier:"AUTH-2"},economy:econ(57,"普通",["車隊","修具","旅宿","邊境交易"],["無大型倉儲","依賴北方糧貨"],1.04,.93,.89,.93),description:"安威爾南門外第一個不屬帝國的常設棚市。商隊在此拆分大型車列、改雇本地引路人並登記失蹤聯絡人。"},
  {id:"L-BND-GRAYFORD",name:"灰河渡",zoneId:"BND-Z-02",zone:"灰河礦谷",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"D",size:"河渡聚落",safety:80,role:"灰河主要渡口、水位記錄與河谷交易",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"渡首聯議",tier:"AUTH-3"},economy:econ(61,"穩定",["渡運","河魚","拾礦","補水"],["洪水停渡","河岸耕地少"],1.01,1.00,.96,1.00),description:"木石混合橋、纜渡與高腳倉沿灰河兩岸延伸；渡首只管理水路、橋梁和公共倉，不統治整個斷境。"},
  {id:"L-BND-MINERREST",name:"拾礦鎮",zoneId:"BND-Z-02",zone:"灰河礦谷",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"D",size:"廢礦服務鎮",safety:76,role:"拾礦登記、工具維修、舊礦救援",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"拾礦公簿會",tier:"AUTH-2"},economy:econ(59,"普通",["回收金屬","工具維修","礦路嚮導"],["礦層不穩","高品質礦材稀少"],1.02,.91,.88,.92),description:"居民靠檢查已廢礦區、回收支架金屬與少量殘脈維生；所有深坑都按坍塌風險輪流封鎖。"},
  {id:"L-BND-BROKENKEEP",name:"斷堡聚落",zoneId:"BND-Z-03",zone:"斷堡走廊",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"D",size:"舊堡聚落",safety:78,role:"中段商路、互保契約與公共倉",facilities:["inn","general","guild","blacksmith","tailor","clinic"],authority:{title:"斷堡公議",tier:"AUTH-3"},economy:econ(63,"穩定",["護送","倉儲","修車","皮革"],["武裝人口多","道路局勢波動"],1.04,.96,.98,1.02),description:"居民把倒塌堡壘可用部分改成公共倉、醫帳與夜巡塔，牆外營地隨商季擴張。"},
  {id:"L-BND-RIDGEPOST",name:"裂脊驛",zoneId:"BND-Z-04",zone:"裂脊高地",province:"PROV-BND-04",smap:"SMAP-BND-04",tier:"C",size:"高地救援驛",safety:73,role:"裂脊嚮導、救援、氣候與路況觀測",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"裂脊救援值首",tier:"AUTH-3"},economy:econ(52,"普通",["嚮導","救援","礦樣","耐候裝備"],["補給昂貴","道路常封"],1.10,.82,.86,.88),description:"石棚、繩橋倉與訊號塔構成的小型驛站，靠互保費和救援契約維持，不收全域稅。"},
  {id:"L-BND-WESTCLIFF",name:"西崖棚鎮",zoneId:"BND-Z-05",zone:"西崖風口",province:"PROV-BND-05",smap:"SMAP-BND-05",tier:"D",size:"海崖棚鎮",safety:79,role:"崖道、鹽貨、小型漁獲與風暴避難",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"崖棚互保會",tier:"AUTH-2"},economy:econ(55,"普通",["鹽","乾魚","繩具","海崖運輸"],["港灣狹小","風暴頻繁"],1.03,.94,.89,.92),description:"貼著海崖階地搭建的棚屋與吊籃碼頭，風暴時全鎮優先維護繩橋、蓄水與避難窖。"},
  {id:"L-BND-CARAVANCAMP",name:"百帳營",zoneId:"BND-Z-03",zone:"斷堡走廊",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"E",size:"季節商旅營",safety:75,role:"商隊集結、牲口交換與臨時市集",facilities:["inn","general","guild"],authority:{title:"當季帳首會",tier:"AUTH-2"},economy:econ(54,"季節繁榮",["商旅","馱獸","乾糧","護衛媒合"],["淡水有限","非商季人口驟減"],1.05,.88,.86,.95),description:"不是永久城市，而是沿安全水井形成的季節性帳篷群；規模隨道路安全與商季增減。"},
  {id:"L-BND-TWINGATE",name:"雙門驛",zoneId:"BND-Z-06",zone:"雙門南境",province:"PROV-BND-06",smap:"SMAP-BND-06",tier:"D",size:"林緣石驛",safety:82,role:"古林嶺北緣補給、失蹤登記與南向轉運",facilities:["inn","general","guild","tailor","alchemy","clinic"],authority:{title:"雙門驛議",tier:"AUTH-3"},economy:econ(60,"穩定",["南北轉運","藥草","皮革","救援"],["不可越界伐採王庭森林","雨季道路易斷"],1.02,.98,.95,.99),description:"位在斷境雙門北側、尚未進入瑟露維亞主權林地的石驛。王庭與斷境救援者在此交換失蹤者資訊，但不設共同政府。"}
 ],
 fields:[
  {id:"L-BND-NORTHSCREE",name:"冠脊碎石坡",zoneId:"BND-Z-01",province:"PROV-BND-01",smap:"SMAP-BND-01",tier:"E",template:"L-HILL",tags:["mountain","scree"],risk:20,gather:["BND-MAT-001"],mining:["BND-MAT-003"],preferred:["MON-BND-001","MON-BND-003"],hazards:["落石","低溫"],description:"北口外的碎石坡與舊路基，低階採集仍需避開安威爾界標。"},
  {id:"L-BND-WINDROAD",name:"北風舊商路",zoneId:"BND-Z-01",province:"PROV-BND-01",smap:"SMAP-BND-01",tier:"E",template:"L-HILL",tags:["road","mountain"],risk:19,gather:["BND-MAT-002"],hunt:["BND-MAT-007"],preferred:["MON-BND-002","MON-BND-004"],description:"被風蝕路碑標出的舊商路，旅人多在日落前抵達棚市。"},
  {id:"L-BND-GRAYBANK",name:"灰河礫岸",zoneId:"BND-Z-02",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"D",template:"L-RIVER",tags:["river","gravel"],aquatic:true,risk:25,gather:["BND-MAT-004"],fish:["BND-MAT-008"],preferred:["MON-BND-005","MON-BND-006"],hazards:["暴漲","流石"],description:"灰河中段礫岸與回水灣，洪水後地形常改變。"},
  {id:"L-BND-OLDTAILINGS",name:"舊礦尾砂谷",zoneId:"BND-Z-02",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"D",template:"L-HILL",tags:["mine","badlands"],risk:29,mining:["BND-MAT-003","BND-MAT-005"],preferred:["MON-BND-007","MON-BND-009"],hazards:["塌陷","粉塵"],description:"廢礦尾砂與殘脈混雜，拾礦人依標線輪區進入，禁止無限翻採。"},
  {id:"L-BND-KEEPROAD",name:"斷堡石道",zoneId:"BND-Z-03",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"D",template:"L-HILL",tags:["road","ruins"],risk:27,gather:["BND-MAT-002"],hunt:["BND-MAT-007"],preferred:["MON-BND-008","MON-BND-010"],description:"舊堡間殘存的石鋪道路，是中段最可靠的車隊路。"},
  {id:"L-BND-THORNSTEPPE",name:"刺草風原",zoneId:"BND-Z-03",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"D",template:"L-LOWFIELD",tags:["plains","dry"],risk:30,gather:["BND-MAT-006"],hunt:["BND-MAT-007"],preferred:["MON-BND-010","MON-BND-011"],description:"雨影形成的乾草坡，適合中型獵物，也常被流動武裝利用。"},
  {id:"L-BND-RIFTRIDGE",name:"裂脊主稜",zoneId:"BND-Z-04",province:"PROV-BND-04",smap:"SMAP-BND-04",tier:"C",template:"L-HILL",tags:["mountain","rift"],risk:42,mining:["BND-MAT-010","BND-MAT-011"],preferred:["MON-BND-013","MON-BND-016"],hazards:["崩崖","強風","迷路"],description:"斷境最高風險的地表稜線，舊礦井與天然裂谷交錯。"},
  {id:"L-BND-COLDVENT",name:"冷風裂谷",zoneId:"BND-Z-04",province:"PROV-BND-04",smap:"SMAP-BND-04",tier:"C",template:"L-HILL",tags:["rift","cave"],risk:45,gather:["BND-MAT-012"],preferred:["MON-BND-015","MON-BND-017"],hazards:["失溫","落石"],description:"地下冷風沿裂隙湧出，霧氣遮蔽深谷；只有標記路線適合通行。"},
  {id:"L-BND-WESTCLIFFROAD",name:"西崖繩道路",zoneId:"BND-Z-05",province:"PROV-BND-05",smap:"SMAP-BND-05",tier:"D",template:"L-HILL",tags:["coast","cliff"],risk:31,gather:["BND-MAT-009"],preferred:["MON-BND-012","MON-BND-014"],hazards:["崖風","落石"],description:"沿峭壁固定的木棧、石階與繩橋，風季時部分路段封閉。"},
  {id:"L-BND-TIDECOVE",name:"灰潮小灣",zoneId:"BND-Z-05",province:"PROV-BND-05",smap:"SMAP-BND-05",tier:"D",template:"L-RIVER",tags:["coast","water"],aquatic:true,risk:26,gather:["BND-MAT-009"],fish:["BND-MAT-008"],preferred:["MON-BND-006","MON-BND-012"],description:"狹窄礫灘與潮池提供有限漁獲，是西崖棚鎮的主要蛋白來源。"},
  {id:"L-BND-SOUTHBRUSH",name:"南境疏林",zoneId:"BND-Z-06",province:"PROV-BND-06",smap:"SMAP-BND-06",tier:"D",template:"L-WOOD",tags:["forest","frontier"],risk:28,gather:["BND-MAT-013","BND-MAT-014"],hunt:["BND-MAT-007"],preferred:["MON-BND-018","MON-BND-019"],description:"由乾燥灌木逐步轉為瑟露維亞濕林的生態過渡帶，採木不可跨越王庭界標。"},
  {id:"L-BND-TWINGATEPASS",name:"雙門北坡",zoneId:"BND-Z-06",province:"PROV-BND-06",smap:"SMAP-BND-06",tier:"C",template:"L-HILL",tags:["mountain","forest"],risk:35,gather:["BND-MAT-014"],preferred:["MON-BND-019","MON-BND-020"],description:"斷境雙門北側狹坡，南向商隊在此等待王庭邊境放行。"},
  {id:"L-BND-GRAYMARSH",name:"灰河南澤",zoneId:"BND-Z-06",province:"PROV-BND-06",smap:"SMAP-BND-06",tier:"D",template:"L-RIVER",tags:["wetland","water"],aquatic:true,risk:30,gather:["BND-MAT-013"],fish:["BND-MAT-008"],preferred:["MON-BND-018","MON-BND-021"],description:"灰河南段濕地與倒木水道，雨季常與林緣溪流連成一片。"},
  {id:"L-BND-LOSTROAD",name:"無印岔路群",zoneId:"BND-Z-03",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"C",template:"L-HILL",tags:["road","badlands"],risk:38,gather:["BND-MAT-006"],preferred:["MON-BND-011","MON-BND-022"],description:"多條舊礦路與軍道失去路標後形成的岔路群，假路標與伏擊比魔物更危險。"}
 ],
 dungeons:[
  {id:"D-BND-NORTHCULVERT",name:"北口舊涵道",zoneId:"BND-Z-01",province:"PROV-BND-01",smap:"SMAP-BND-01",tier:"D",template:"D-AQUEDUCT",risk:31,tags:["ruins","cave"],gather:["BND-MAT-002"],preferred:["MON-BND-009","MON-BND-023"],description:"舊關道排水涵洞連成的小型地下網，部分被坍方切斷。"},
  {id:"D-BND-GRAYMINE",name:"灰河失水礦",zoneId:"BND-Z-02",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"C",template:"D-AQUEDUCT",risk:43,tags:["mine","cave"],mining:["BND-MAT-005","BND-MAT-010"],preferred:["MON-BND-013","MON-BND-015"],description:"排水系統失修的深礦，雨季會突然灌水。"},
  {id:"D-BND-SUNKENWORKS",name:"沉軌工場",zoneId:"BND-Z-02",province:"PROV-BND-02",smap:"SMAP-BND-02",tier:"C",template:"D-AQUEDUCT",risk:41,tags:["mine","ruins"],mining:["BND-MAT-011"],preferred:["MON-BND-017","MON-BND-023"],description:"舊礦車維修工場因地層下陷成為多層遺構。"},
  {id:"D-BND-BROKENKEEP",name:"斷堡地下層",zoneId:"BND-Z-03",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"C",template:"D-AQUEDUCT",risk:40,tags:["ruins","fortress"],gather:["BND-MAT-015"],preferred:["MON-BND-020","MON-BND-023"],description:"斷堡公議只使用地表可修復區，地下舊兵站仍有失效機關與封閉倉。"},
  {id:"D-BND-WAYVAULT",name:"無印路庫",zoneId:"BND-Z-03",province:"PROV-BND-03",smap:"SMAP-BND-03",tier:"C",template:"D-AQUEDUCT",risk:44,tags:["ruins","road"],gather:["BND-MAT-015"],preferred:["MON-BND-022","MON-BND-023"],description:"埋在道路邊坡下的舊補給庫，入口常被假路標掩飾。"},
  {id:"D-BND-DEEPRIFT",name:"裂脊深井",zoneId:"BND-Z-04",province:"PROV-BND-04",smap:"SMAP-BND-04",tier:"B",template:"D-AQUEDUCT",risk:62,tags:["mine","rift","cave"],mining:["BND-MAT-016"],preferred:["MON-BND-024"],accessRule:"B級前置＋裂脊救援隊路況許可",hazards:["缺氧","垂直墜落","岩層活動"],description:"沿天然裂谷向下延伸的古井與礦道，只在地層監測穩定時開放受控探索。"},
  {id:"D-BND-WINDCRYPT",name:"風蝕石窟",zoneId:"BND-Z-04",province:"PROV-BND-04",smap:"SMAP-BND-04",tier:"C",template:"D-AQUEDUCT",risk:47,tags:["cave","mountain"],gather:["BND-MAT-012"],preferred:["MON-BND-016","MON-BND-021"],description:"強風沿石灰裂隙切出的天然洞群，聲音容易造成距離誤判。"},
  {id:"D-BND-CLIFFCAVES",name:"西崖潮蝕洞",zoneId:"BND-Z-05",province:"PROV-BND-05",smap:"SMAP-BND-05",tier:"C",template:"D-AQUEDUCT",risk:42,tags:["coast","water","cave"],aquatic:true,gather:["BND-MAT-009"],preferred:["MON-BND-012","MON-BND-021"],description:"只有低潮能完整通行的海蝕洞，風暴前必須撤離。"},
  {id:"D-BND-TWINGATEVAULT",name:"雙門舊界庫",zoneId:"BND-Z-06",province:"PROV-BND-06",smap:"SMAP-BND-06",tier:"B",template:"D-AQUEDUCT",risk:59,tags:["ruins","mountain"],gather:["BND-MAT-016"],preferred:["MON-BND-024"],accessRule:"B級前置＋雙門驛與瑟露維亞邊境共同確認不涉及越界",description:"古老界標倉與岩門機關埋在山腹中；其存在不構成任何一方新增領土主張。"}
 ],
 materials:[
  ["BND-MAT-001","風稜苦草","E",.08,18,"北口石縫生長的耐寒藥草。"],["BND-MAT-002","灰脊苔繩","E",.12,17,"可搓製簡易繩帶的韌苔。"],
  ["BND-MAT-003","殘脈黑鐵","D",.9,34,"廢礦殘脈回收的黑鐵礦。"],["BND-MAT-004","灰河止血蘆","D",.1,29,"礫岸與淺灘可採的藥用蘆草。"],
  ["BND-MAT-005","舊礦黃銅件","D",.45,31,"從合法回收區拆出的舊機件。"],["BND-MAT-006","刺原纖維","E",.15,19,"乾草原常見的耐磨纖維。"],
  ["BND-MAT-007","斷境獸皮","D",.65,30,"依法定獵量取得的中型獸皮。"],["BND-MAT-008","灰河石鱒","E",.48,22,"灰河可食用魚類。"],
  ["BND-MAT-009","西崖鹽藻","D",.12,27,"海崖潮池的耐鹽藻材。"],["BND-MAT-010","裂脊鐵晶","C",.35,68,"裂脊深處少量形成的高品質鐵晶。"],
  ["BND-MAT-011","黑紋支架鋼","C",.8,72,"舊深礦支架回收後可重煉的鋼材。"],["BND-MAT-012","冷風石菌","C",.1,63,"冷風裂谷石壁上的耐寒菌材。"],
  ["BND-MAT-013","南澤水苔","D",.08,26,"灰河南澤吸水性強的水苔。"],["BND-MAT-014","銀緣灌葉","D",.07,31,"南境林緣常見的調和草材。"],
  ["BND-MAT-015","舊堡刻印銅片","C",.22,76,"舊堡與路庫回收的有編號銅片。"],["BND-MAT-016","裂界石晶","B",.2,165,"受控深層裂隙形成的稀有石晶，禁止一般露天採集。"]
 ],
 monsters:[
  {id:"MON-BND-001",name:"碎坡岩兔",tier:"F",habitat:["L-BND-NORTHSCREE"],hp:25,atk:8,def:5,near:true,description:"北口碎石坡常見小型獵物。"},
  {id:"MON-BND-002",name:"風路灰狐",tier:"F",habitat:["L-BND-WINDROAD"],hp:28,atk:9,def:5,near:true,description:"會沿商路尋找殘食的小型狐獸。"},
  {id:"MON-BND-003",name:"冠脊石蜥",tier:"E",habitat:["L-BND-NORTHSCREE"],hp:46,atk:14,def:10,drops:["BND-MAT-003"],near:true,description:"藏在黑鐵碎岩間的厚鱗蜥。"},
  {id:"MON-BND-004",name:"風原短角羊",tier:"E",habitat:["L-BND-WINDROAD"],hp:50,atk:15,def:9,drops:["BND-MAT-007"],near:true,description:"適應強風坡地的野羊。"},
  {id:"MON-BND-005",name:"灰河礫蟹",tier:"E",habitat:["L-BND-GRAYBANK"],hp:48,atk:14,def:12,tags:["aquatic"],near:true,description:"藏身河礫間的大型淡水甲殼獸。"},
  {id:"MON-BND-006",name:"灰潮水獺",tier:"E",habitat:["L-BND-GRAYBANK","L-BND-TIDECOVE"],hp:52,atk:15,def:8,tags:["aquatic"],drops:["BND-MAT-008"],near:true,description:"灰河與海崖小灣活動的半水生獸。"},
  {id:"MON-BND-007",name:"尾砂甲鼠",tier:"D",habitat:["L-BND-OLDTAILINGS"],hp:88,atk:24,def:17,drops:["BND-MAT-005"],description:"以礦渣洞穴為巢的大型甲鼠。"},
  {id:"MON-BND-008",name:"斷堡鬃犬",tier:"D",habitat:["L-BND-KEEPROAD"],hp:92,atk:27,def:14,drops:["BND-MAT-007"],description:"在舊堡道路附近成群活動的野犬。"},
  {id:"MON-BND-009",name:"坑風蝠",tier:"D",habitat:["L-BND-OLDTAILINGS","D-BND-NORTHCULVERT"],hp:78,atk:25,def:12,init:15,description:"棲息舊涵道與礦坑的群居蝠獸。"},
  {id:"MON-BND-010",name:"刺原獠豬",tier:"D",habitat:["L-BND-KEEPROAD","L-BND-THORNSTEPPE"],hp:104,atk:29,def:18,drops:["BND-MAT-007"],description:"在刺草坡掘食根莖的大型野豬。"},
  {id:"MON-BND-011",name:"無印荒狼",tier:"D",habitat:["L-BND-THORNSTEPPE","L-BND-LOSTROAD"],hp:98,atk:30,def:15,drops:["BND-MAT-007"],description:"習慣尾隨商隊的灰狼群。"},
  {id:"MON-BND-012",name:"西崖鹽背蜥",tier:"D",habitat:["L-BND-WESTCLIFFROAD","L-BND-TIDECOVE","D-BND-CLIFFCAVES"],hp:96,atk:27,def:19,description:"適應鹽霧峭壁的大型蜥獸。"},
  {id:"MON-BND-013",name:"裂脊鳴甲獸",tier:"C",habitat:["L-BND-RIFTRIDGE","D-BND-GRAYMINE"],hp:170,atk:37,def:31,element:"地",drops:["BND-MAT-010"],description:"以低鳴感知裂隙與腳步的厚甲岩獸。"},
  {id:"MON-BND-014",name:"崖風翼貓",tier:"C",habitat:["L-BND-WESTCLIFFROAD"],hp:145,atk:39,def:20,init:17,description:"善用上升氣流躍過峭壁的貓科魔獸。"},
  {id:"MON-BND-015",name:"冷谷盲蜥",tier:"C",habitat:["L-BND-COLDVENT","D-BND-GRAYMINE"],hp:158,atk:36,def:26,drops:["BND-MAT-012"],description:"長期生活於冷風裂谷與地下水道的盲蜥。"},
  {id:"MON-BND-016",name:"裂脊角岩羊",tier:"C",habitat:["L-BND-RIFTRIDGE","D-BND-WINDCRYPT"],hp:162,atk:38,def:27,drops:["BND-MAT-007"],description:"能在斷崖間跳躍的大型山羊獸。"},
  {id:"MON-BND-017",name:"沉軌鐵殼獸",tier:"C",habitat:["L-BND-COLDVENT","D-BND-SUNKENWORKS"],hp:178,atk:36,def:34,drops:["BND-MAT-011"],description:"把廢棄金屬碎片黏附在外殼上的地下獸。"},
  {id:"MON-BND-018",name:"南澤霧獺",tier:"D",habitat:["L-BND-SOUTHBRUSH","L-BND-GRAYMARSH"],hp:102,atk:28,def:17,tags:["aquatic"],description:"濕林與南澤活動的半水獸。"},
  {id:"MON-BND-019",name:"雙門灰狼",tier:"C",habitat:["L-BND-SOUTHBRUSH","L-BND-TWINGATEPASS"],hp:150,atk:38,def:22,drops:["BND-MAT-007"],description:"只在古林界標以北活動的大型狼群。"},
  {id:"MON-BND-020",name:"舊界石衛",tier:"C",habitat:["L-BND-TWINGATEPASS","D-BND-BROKENKEEP"],hp:184,atk:35,def:35,tags:["construct"],drops:["BND-MAT-015"],description:"來源不明的舊式石質守衛，部分仍依失效界標巡行。"},
  {id:"MON-BND-021",name:"灰河石甲龜",tier:"C",habitat:["L-BND-GRAYMARSH","D-BND-WINDCRYPT","D-BND-CLIFFCAVES"],hp:190,atk:34,def:38,element:"地",description:"厚甲大型龜獸，會沿水系遷移。"},
  {id:"MON-BND-022",name:"岔路掘穴獸",tier:"C",habitat:["L-BND-LOSTROAD","D-BND-WAYVAULT"],hp:165,atk:38,def:28,description:"在舊路基下挖掘洞穴，常造成突然塌陷。"},
  {id:"MON-BND-023",name:"舊礦鉚接傀",tier:"C",habitat:["D-BND-NORTHCULVERT","D-BND-SUNKENWORKS","D-BND-BROKENKEEP","D-BND-WAYVAULT"],hp:180,atk:36,def:33,tags:["construct"],drops:["BND-MAT-015"],description:"由舊礦與軍路維修構件拼接而成的失效傀儡。"},
  {id:"MON-BND-024",name:"裂界深岩衛",tier:"B",role:"首領",habitat:["D-BND-DEEPRIFT","D-BND-TWINGATEVAULT"],hp:350,atk:56,def:45,mdef:42,acc:84,element:"地",tags:["construct"],drops:["BND-MAT-016"],description:"深層古代石衛，只出現在受控B級遺構，不進入普通商路。"}
 ],
 npcs:[
  ["NPC-BND-001","伊薇・北風","北口棚市公議代表","L-BND-NORTHMARKET","北口市集、安威爾方向商隊與公共夜巡","E",["ORG-BND-MUTUAL"],"熟悉棚市規約，但沒有代表整個斷境的權力。"],
  ["NPC-BND-002","多恩・繩鉤","北口修路匠","L-BND-NORTHMARKET","碎石坡、橋索、車軸與落石封路","E",["ORG-BND-GUIDES"],"會依路況關閉捷徑，不以玩家需求無限開路。"],
  ["NPC-BND-003","莎芮・灰渡","灰河渡首","L-BND-GRAYFORD","渡船、橋梁、水位與河岸公共倉","D",["ORG-BND-RIVER"],"只管渡運與水路公共事務。"],
  ["NPC-BND-004","洛克・石簿","拾礦公簿員","L-BND-MINERREST","拾礦登記、封坑、殘脈與事故名冊","E",["ORG-BND-SALVAGE"],"優先核對採區與事故紀錄。"],
  ["NPC-BND-005","米拉・鐵燈","礦坑救援長","L-BND-MINERREST","坍塌、通風、救援與深坑封鎖","C",["ORG-BND-RESCUE"],"沒有安全繩、通風與回報線就不批准深入。"],
  ["NPC-BND-006","哈爾・斷牆","斷堡公議值首","L-BND-BROKENKEEP","公共倉、夜巡、護送與武裝停留規則","D",["ORG-BND-MUTUAL"],"依當季威脅協調巡邏，不建立常備國軍。"],
  ["NPC-BND-007","賽拉・黑契","商旅契約見證人","L-BND-BROKENKEEP","護送、保證金、違約與貨損見證","E",["ORG-BND-CARAVAN"],"只見證契約，不替任何勢力宣稱司法主權。"],
  ["NPC-BND-008","柯恩・百帳","當季帳首","L-BND-CARAVANCAMP","商季營位、井水、馱獸與臨時交易","E",["ORG-BND-CARAVAN"],"營地規模隨商季與道路安全變化。"],
  ["NPC-BND-009","芮克・裂風","裂脊救援值首","L-BND-RIDGEPOST","裂脊路況、失蹤、繩橋與B級深井前置","C",["ORG-BND-RESCUE"],"寧願取消探索也不在地層活動期放隊伍下井。"],
  ["NPC-BND-010","菲雅・冷石","裂谷藥師","L-BND-RIDGEPOST","失溫、跌傷、石菌與高地藥品","D",["ORG-BND-MEDIC"],"熟悉高地救護與有限藥品庫存。"],
  ["NPC-BND-011","烏索・鹽帆","西崖互保會首","L-BND-WESTCLIFF","風暴、繩道、小灣與鹽貨","D",["ORG-BND-CLIFF"],"風暴預警時先撤吊籃與漁船。"],
  ["NPC-BND-012","妮姆・潮石","西崖水手","L-BND-WESTCLIFF","潮窗、海蝕洞、漁獲與岸邊救援","E",["ORG-BND-CLIFF"],"知道潮蝕洞的可通行時段。"],
  ["NPC-BND-013","莉瑟・雙門","雙門驛議代表","L-BND-TWINGATE","南向商旅、界標、失蹤者與王庭邊界聯絡","D",["ORG-BND-MUTUAL"],"明確區分斷境互保與瑟露維亞主權。"],
  ["NPC-BND-014","艾德・綠紋","南境採藥人","L-BND-TWINGATE","南澤藥草、季節水位與林緣界標","E",["ORG-BND-MEDIC"],"拒絕跨界採集王庭封養林。"],
  ["NPC-BND-015","塔沃・舊路","斷境引路人","L-BND-BROKENKEEP","舊商路、假路標、盜匪轉移與營地","C",["ORG-BND-GUIDES"],"情報會標注日期，不把過期路況當現在事實。"],
  ["NPC-BND-016","梅娜・白布","流動醫帳主事","L-BND-CARAVANCAMP","商旅傷病、藥材交換、難民救助","E",["ORG-BND-MEDIC"],"醫帳庫存會隨道路中斷下降。"],
  ["NPC-BND-017","格雷・無印","互保巡夜隊長","L-BND-BROKENKEEP","夜巡、失竊、武裝衝突與護衛輪值","C",["ORG-BND-MUTUAL"],"只在簽署互保的聚落與道路值勤。"],
  ["NPC-BND-018","蘇雅・河頁","灰河記錄員","L-BND-GRAYFORD","水位、洪水、橋損、漁獲與渡運量","F",["ORG-BND-RIVER"],"用多年水位紀錄決定是否停渡。"]
 ],
 orgs:[
  {id:"ORG-BND-MUTUAL",name:"斷境聚落互保公議",kind:"civic",tier:"C",base_location_id:"L-BND-BROKENKEEP",contact_location_ids:["L-BND-NORTHMARKET","L-BND-GRAYFORD","L-BND-TWINGATE"],description:"各聚落可自願加入的互保協調網，只處理救援、夜巡、公共倉與道路警訊，沒有全域主權。",member_bonus:{id:"BONUS-ORG-BND-MUTUAL",text:"互保路標識讀",effects:{perception:3}}},
  {id:"ORG-BND-RIVER",name:"灰河渡運聯議",kind:"civic",tier:"D",base_location_id:"L-BND-GRAYFORD",description:"協調渡船、橋梁、水位、河岸倉與洪水停渡。",member_bonus:{id:"BONUS-ORG-BND-RIVER",text:"灰河水路訓練",effects:{perception:2}}},
  {id:"ORG-BND-SALVAGE",name:"拾礦與回收公簿會",kind:"craft",tier:"C",base_location_id:"L-BND-MINERREST",description:"登記可進入廢礦、回收批次與封坑狀態，避免同一遺址被無限翻採。",member_bonus:{id:"BONUS-ORG-BND-SALVAGE",text:"回收辨材",effects:{carryCapacity:4}}},
  {id:"ORG-BND-RESCUE",name:"裂脊救援誓隊",kind:"civic",tier:"C",base_location_id:"L-BND-RIDGEPOST",description:"維護繩橋、救援線、失蹤名冊與深井開放時段。",member_bonus:{id:"BONUS-ORG-BND-RESCUE",text:"高地救援",effects:{perception:3}}},
  {id:"ORG-BND-CARAVAN",name:"百帳商旅互助會",kind:"trade",tier:"C",base_location_id:"L-BND-CARAVANCAMP",description:"協調商季營位、保證金、馱獸與護衛媒合。",member_bonus:{id:"BONUS-ORG-BND-CARAVAN",text:"商旅估價",effects:{perception:2}}},
  {id:"ORG-BND-GUIDES",name:"無印引路人會",kind:"civilian",tier:"C",base_location_id:"L-BND-NORTHMARKET",description:"維護路況、路標日期、危險岔路與嚮導責任紀錄。",member_bonus:{id:"BONUS-ORG-BND-GUIDES",text:"斷境辨路",effects:{perception:4}}},
  {id:"ORG-BND-CLIFF",name:"西崖棚戶互保會",kind:"civic",tier:"D",base_location_id:"L-BND-WESTCLIFF",description:"負責繩道、潮窗、蓄水、風暴避難與小型碼頭。",member_bonus:{id:"BONUS-ORG-BND-CLIFF",text:"崖岸避險",effects:{defense_pct:2}}},
  {id:"ORG-BND-MEDIC",name:"斷境流動醫帳聯社",kind:"civilian",tier:"C",base_location_id:"L-BND-TWINGATE",contact_location_ids:["L-BND-CARAVANCAMP","L-BND-RIDGEPOST"],description:"以流動醫帳、藥材交換與傷患轉送維持跨聚落救護。",member_bonus:{id:"BONUS-ORG-BND-MEDIC",text:"野外救護",effects:{perception:2}}}
 ],
 links:[
  ["L-BND-NORTHMARKET","L-BND-NORTHSCREE",1],["L-BND-NORTHMARKET","L-BND-WINDROAD",1.2],["L-BND-NORTHSCREE","D-BND-NORTHCULVERT",1.1],
  ["L-BND-NORTHMARKET","L-BND-GRAYFORD",4],["L-BND-GRAYFORD","L-BND-GRAYBANK",.8],["L-BND-GRAYFORD","L-BND-MINERREST",1.4],["L-BND-MINERREST","L-BND-OLDTAILINGS",1],["L-BND-OLDTAILINGS","D-BND-GRAYMINE",1.2],["L-BND-MINERREST","D-BND-SUNKENWORKS",1.1],
  ["L-BND-GRAYFORD","L-BND-BROKENKEEP",3.5],["L-BND-BROKENKEEP","L-BND-CARAVANCAMP",1],["L-BND-BROKENKEEP","L-BND-KEEPROAD",.8],["L-BND-BROKENKEEP","L-BND-THORNSTEPPE",1.1],["L-BND-BROKENKEEP","L-BND-LOSTROAD",1.4],["L-BND-BROKENKEEP","D-BND-BROKENKEEP",.7],["L-BND-LOSTROAD","D-BND-WAYVAULT",1],
  ["L-BND-BROKENKEEP","L-BND-RIDGEPOST",3.2],["L-BND-RIDGEPOST","L-BND-RIFTRIDGE",1.2],["L-BND-RIDGEPOST","L-BND-COLDVENT",1],["L-BND-RIFTRIDGE","D-BND-DEEPRIFT",1.5],["L-BND-COLDVENT","D-BND-WINDCRYPT",1.2],
  ["L-BND-BROKENKEEP","L-BND-WESTCLIFF",4.2],["L-BND-WESTCLIFF","L-BND-WESTCLIFFROAD",.8],["L-BND-WESTCLIFF","L-BND-TIDECOVE",.7],["L-BND-TIDECOVE","D-BND-CLIFFCAVES",1],
  ["L-BND-BROKENKEEP","L-BND-TWINGATE",4.5],["L-BND-TWINGATE","L-BND-SOUTHBRUSH",.9],["L-BND-TWINGATE","L-BND-TWINGATEPASS",1],["L-BND-TWINGATE","L-BND-GRAYMARSH",1.1],["L-BND-TWINGATEPASS","D-BND-TWINGATEVAULT",1.2],
  ["L-BND-NORTHMARKET","L-ANW-SOUTHGATE",2],["L-BND-TWINGATE","L-SER-SILVERGATE",2.5]
 ],
 hooks:[
  ["HOOK-BND-01","灰河突然封渡","連日融雪讓灰河上漲；先核對水位、橋腳與上游落石，再決定修橋、改道或停運。","D",["grayriver_level","route_access"]],
  ["HOOK-BND-02","假路標把商隊引離石道","多支商隊在同一岔路失聯，需比對新舊路標、腳印與護衛口供。","C",["road_integrity","bandit_pressure"]],
  ["HOOK-BND-03","拾礦鎮殘脈爭議","兩批拾礦人都宣稱先登記同一殘脈，公簿與實際標樁互相矛盾。","D",["salvage_pressure","local_trust"]],
  ["HOOK-BND-04","裂脊深井回聲改變","救援隊發現深井回聲與風壓異常，必須先判斷地層活動再開放B級探索。","B",["rift_stability","deep_access"]],
  ["HOOK-BND-05","百帳營糧價急升","北路封閉使乾糧短缺；調查是正常缺貨、囤積還是商隊被截。","D",["route_access","food_stock"]],
  ["HOOK-BND-06","西崖繩橋斷裂","風暴後主要繩橋毀損，小灣漁獲與鹽貨無法送出。","D",["cliff_route","food_stock"]],
  ["HOOK-BND-07","雙門失蹤者名冊不符","斷境與王庭兩側的入境記錄少了一人，需查清是否迷路、偷渡或記錄錯誤。","C",["south_border","local_trust"]],
  ["HOOK-BND-08","斷堡地下傳出鉚擊聲","舊堡地下機關重新活動，先封鎖民用區再追查是哪一段構裝甦醒。","C",["ruin_activity","settlement_safety"]]
 ],
 life:[
  ["LIFE-BND-01","北路商季","北口棚市與百帳營擴張，糧貨與護衛需求同時上升。 ",{trade_flow:2,food_stock:-1}],
  ["LIFE-BND-02","灰河高水期","渡運減班、河魚區變動，救援與修橋委託增加。 ",{grayriver_level:2,route_access:-1}],
  ["LIFE-BND-03","拾礦輪封","部分尾砂谷與舊礦暫停回收，殘脈價格上升。 ",{salvage_pressure:-1,ore_stock:-1}],
  ["LIFE-BND-04","裂脊落石週","高地路線關閉，裂脊驛只接受救援與必要補給。 ",{rift_stability:-2,route_access:-1}],
  ["LIFE-BND-05","互保公議季會","各聚落交換失蹤、路況與物價紀錄，但不產生中央政權。 ",{local_trust:1}],
  ["LIFE-BND-06","西崖風暴潮","棚鎮撤船、封繩道，乾魚與鹽貨供給短降。 ",{cliff_route:-2,food_stock:-1}],
  ["LIFE-BND-07","南境霧季","雙門與南澤旅行速度下降，迷途與搜救事件增加。 ",{south_border:-1}],
  ["LIFE-BND-08","道路平安月","若威脅下降，商隊恢復但庫存只逐步回補。 ",{trade_flow:1,route_access:1}]
 ],
 lore:[
  ["LORE-BND-01","politics","斷境沒有被共同承認的中央政府","聚落公議與互保組織只在實際服務範圍內有效，不能代表REG-19對外行使完整主權。"],
  ["LORE-BND-02","geography","斷境是狹長破碎走廊","裂脊、灰河與舊礦谷使大軍與大型行政體系難以長期維持。"],
  ["LORE-BND-03","law","互保契約不是國法","商旅與聚落依保證金、見證與救援條款降低風險，但沒有單一最高法院。"],
  ["LORE-BND-04","economy","廢墟與殘脈不是無限資源","每個回收點都有可回收量、坍塌風險與輪封週期，市場預算也受道路狀態限制。"],
  ["LORE-BND-05","border","安威爾與瑟露維亞都不擁有斷境","兩國合法執法線止於各自邊界；跨境合作需靠聯絡與個案協議。"],
  ["LORE-BND-06","adventure","高階內容集中深井與舊界庫","一般商路維持E～C級；B級威脅不會隨機出現在棚市附近。"]
 ],
 stateAxes:{route_access:0,grayriver_level:0,bandit_pressure:0,salvage_pressure:0,rift_stability:0,food_stock:0,local_trust:0,south_border:0,cliff_route:0,ruin_activity:0,settlement_safety:0},
 eventChains:[
  {id:"CHAIN-BND-ROAD",name:"斷境道路失衡鏈",stages:["路標異常","商隊失聯","地方缺貨","護送與調查","路線恢復或長期改道"],feeds:["委託","市場","NPC反應","傳聞"]},
  {id:"CHAIN-BND-RIVER",name:"灰河水位鏈",stages:["上游雨雪變化","水位上升","停渡／橋損","救援修復","漁獲與運輸恢復"],feeds:["旅行","市場","採集","救援"]},
  {id:"CHAIN-BND-RIFT",name:"裂脊地層鏈",stages:["風壓異常","落石增加","深井封鎖","測繪探索","重新開放或永久封存"],feeds:["地下城","素材","NPC","世界狀態"]}
 ]
};

const DRAGON={
 code:"DRG-20",systemKey:"dragonspine_volcanic_depth",name:"龍脊火山群",regionId:"REG-20",polityId:null,cultureId:null,realmId:"RMAP-REG-20",profileId:"RCP-DRG-20",econId:"ECO-DRG-20",worldTier:"B",tierBand:"D～B",expectedDungeons:10,sovereignty:"unclaimed_hazard_region",
 history:"龍脊是一條由多座休眠、間歇活動與殘破火山構成的高地弧。北方部落、灰刃商路、南岸航海者與採礦隊都曾建立前哨，但火山灰、缺水、毒氣與道路改道讓任何勢力都無法把全區轉化為穩定領土。",
 currentState:"北麓交通增加、黑曜石與硫礦價格走高，但赤泉水量、灰季、地震群與熔岩管氣體濃度限制常住人口與採掘規模。",
 identity:"大陸東南部的非主權火山高地。沒有首都或統一政治體；聚落是補給站、礦站、泉地公議與救援前哨，周邊政治體只維持各自邊界與通往龍脊的道路。",
 gameplayRole:"D～B級火山探索區／灰季生存、地熱、礦產、黑曜石、硫礦、熔岩洞、地震、火地魔物與跨境補給競爭",
 rulingStructure:"不存在統一統治。北口路棚、赤泉集、黑玻璃礦站、南路石營與東風火灣各自依水源、道路與生產維持地方規約；救援協議可跨聚落運作，但不等於主權。",
 legalTradition:"泉水優先、避難共享、礦站安全、封路旗、採區配額與救援優先是最常被承認的慣例；高風險洞穴開放取決於地熱監測與實際救援能力。",
 regionUpdate:{name:"龍脊火山群",recommended_tier:"B",playable_tier_band:"D～B",terrain:"火山弧、灰原、玄武岩臺地、黑曜石谷、赤泉盆地、熔岩管、硫煙裂谷與東南海崖",regional_identity:"非主權火山高地；北接泰爾瓦隆與灰刃前哨，西北接中央南境，東南面海。"},
 mapNotes:"REG-20沿用既有龍脊火山弧、龍脊北口、龍脊南路與北麓灰原；新增的聚落皆為前哨／自由據點，不建立POL-020之外的新政治體，POL-020仍只指安威爾地下的黑月深庭。",
 centers:["北口風柵","灰燼路棚","赤泉集","黑玻璃礦站","南路石營","硫煙站","熔灣棚港","東風火灣"],
 exports:["火山玻璃","玄武岩","硫礦","耐熱草材","地熱鹽","少量高階火地礦晶"],imports:["飲水","糧食","木材","藥品","織物","精密工具"],foods:["硬餅","燻肉","乾豆","赤泉根菜","鹽魚乾","耐熱薯"],risks:["灰季","地震","毒氣","缺水","地熱噴發","熔岩管崩塌","火地魔物","道路中斷"],
 economyNotes:"龍脊高價素材受火山活動、氣體濃度、採區安全、飲水與搬運能力共同限制。礦站與商站都有庫存和現金預算，不允許因高價格形成無限採礦或無限收購。",
 marketConstraints:["飲水是第一承載限制","B級礦晶只存在受控深層","灰季會中止部分市場與採區","黑曜石與硫礦採區有恢復／輪封週期","打獵必須進入戰鬥"],
 externalRelations:[{name:"泰爾瓦隆百族部落",relation:"north_pass",note:"赤坡寨與龍脊北麓是北側主要接觸線；泰爾瓦隆不宣稱火山群全域主權。"},{name:"傭兵都市",relation:"northwest_road",note:"灰燼哨鎮是西北補給與救援前站，龍脊南路進入REG-20後轉為非主權道路。"},{name:"黑潮群島",relation:"maritime_neighbor",note:"東南海岸可見往返群島的海船，但火灣聚落不因此受黑潮主權統治。"}],
 zones:[
  {id:"DRG-Z-01",name:"龍脊北口",tier:"C",province:"PROV-DRG-01",smap:"SMAP-DRG-01",seat:"L-DRG-NORTHPASS",role:"北向通道、封路旗、商旅與救援前站"},
  {id:"DRG-Z-02",name:"北麓灰原",tier:"C",province:"PROV-DRG-02",smap:"SMAP-DRG-02",seat:"L-DRG-ASHROAD",role:"灰原商路、玄武岩、灰季觀測與馱運"},
  {id:"DRG-Z-03",name:"赤泉盆地",tier:"C",province:"PROV-DRG-03",smap:"SMAP-DRG-03",seat:"L-DRG-REDSHSPRING",role:"主要常年水源、療養、農圃與地熱生活"},
  {id:"DRG-Z-04",name:"黑曜主脊",tier:"B",province:"PROV-DRG-04",smap:"SMAP-DRG-04",seat:"L-DRG-OBSIDIAN",role:"黑曜石、深層火山遺構、B級受控探索與高風險採礦"},
  {id:"DRG-Z-05",name:"龍脊南路",tier:"C",province:"PROV-DRG-05",smap:"SMAP-DRG-05",seat:"L-DRG-SOUTHROAD",role:"南向補給線、熔岩臺地、硫礦與避難石營"},
  {id:"DRG-Z-06",name:"東風火山岸",tier:"C",province:"PROV-DRG-06",smap:"SMAP-DRG-06",seat:"L-DRG-EASTFIREBAY",role:"海風火山崖、小型棚港、漁獲、風暴與灰潮"}
 ],
 towns:[
  {id:"L-DRG-NORTHPASS",name:"北口風柵",zoneId:"DRG-Z-01",zone:"龍脊北口",province:"PROV-DRG-01",smap:"SMAP-DRG-01",tier:"D",size:"山口路棚",safety:78,role:"北口封路、商旅檢查與避灰前站",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"北口路棚公議",tier:"AUTH-3"},economy:econ(56,"普通",["護送","修具","路況情報"],["飲水有限","灰季封路"],1.08,.88,.88,.91),description:"木柵、石棚與大型風向旗構成的北口據點；旗色代表灰量、風向與可通行路段。"},
  {id:"L-DRG-ASHROAD",name:"灰燼路棚",zoneId:"DRG-Z-02",zone:"北麓灰原",province:"PROV-DRG-02",smap:"SMAP-DRG-02",tier:"D",size:"灰原驛棚",safety:76,role:"馱運、避灰、玄武岩轉運與車隊維修",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"灰路值首",tier:"AUTH-2"},economy:econ(58,"普通",["馱運","玄武岩","車具"],["灰塵磨損","水需外運"],1.06,.92,.90,.93),description:"位於較穩定玄武岩臺地上的驛棚群，以封閉式水槽與避灰屋維持商旅。"},
  {id:"L-DRG-REDSHSPRING",name:"赤泉集",zoneId:"DRG-Z-03",zone:"赤泉盆地",province:"PROV-DRG-03",smap:"SMAP-DRG-03",tier:"C",size:"地熱泉聚落",safety:84,role:"龍脊主要淡水、醫療、農圃與補給中心",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"赤泉水議",tier:"AUTH-3"},economy:econ(68,"穩定",["泉水","藥浴","根菜","補給"],["泉量優先生活用水","硫氣週期"],1.04,1.03,1.04,1.04),description:"建立在冷泉與可控溫泉交界的最大常住聚落；水議以飲水優先原則限制工坊與旅宿用水。"},
  {id:"L-DRG-OBSIDIAN",name:"黑玻璃礦站",zoneId:"DRG-Z-04",zone:"黑曜主脊",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"C",size:"高地礦站",safety:70,role:"黑曜石、火山玻璃、深層探測與礦難救援",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"黑玻璃礦站聯議",tier:"AUTH-3"},economy:econ(65,"高風險繁榮",["黑曜石","礦樣","嚮導"],["高地危險","採區配額","水昂貴"],1.12,.82,.96,.97),description:"礦棚沿冷卻熔岩脊分散設置，所有採掘面都有氣體、震動與撤離路線紀錄。"},
  {id:"L-DRG-SOUTHROAD",name:"南路石營",zoneId:"DRG-Z-05",zone:"龍脊南路",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"D",size:"石砌補給營",safety:77,role:"南路補給、避難、馱獸與硫礦轉運",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"南路營議",tier:"AUTH-2"},economy:econ(57,"普通",["護送","硫礦","馱運"],["毒氣風向","缺木"],1.07,.90,.88,.91),description:"低矮石屋可抵擋落灰與強風，屋頂集水槽是全營最重要的公共設施。"},
  {id:"L-DRG-SULFURPOST",name:"硫煙站",zoneId:"DRG-Z-05",zone:"龍脊南路",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"C",size:"採硫前站",safety:69,role:"硫氣監測、採區輪封與防毒裝備維修",facilities:["inn","general","guild","blacksmith","alchemy","clinic"],authority:{title:"硫煙監測會",tier:"AUTH-3"},economy:econ(62,"高風險",["硫礦","防護裝備","監測"],["毒氣","採區輪封"],1.14,.78,.91,.92),description:"以風袋、試紙、鳥籠與簡易術式共同監測氣體；風向不利時整站停採。"},
  {id:"L-DRG-LAVACOVE",name:"熔灣棚港",zoneId:"DRG-Z-06",zone:"東風火山岸",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"D",size:"黑岩棚港",safety:75,role:"小型海運、漁獲、海水取鹽與沿岸救援",facilities:["inn","general","guild","blacksmith","clinic"],authority:{title:"熔灣棚戶會",tier:"AUTH-2"},economy:econ(59,"普通",["漁獲","鹽","短程海運"],["港小","灰潮與風暴"],1.03,.95,.91,.94),description:"在古熔岩入海形成的凹灣搭建小型棧橋，海況好時可補充龍脊的糧食與木材。"},
  {id:"L-DRG-EASTFIREBAY",name:"東風火灣",zoneId:"DRG-Z-06",zone:"東風火山岸",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"D",size:"海崖聚落",safety:73,role:"東風海岸航標、地震觀測與外海補給",facilities:["inn","general","guild","alchemy","clinic"],authority:{title:"火灣航標議",tier:"AUTH-2"},economy:econ(60,"普通",["航標","海鹽","漁獲","地震觀測"],["補給船受季風影響"],1.04,.93,.92,.94),description:"海崖上的航標與棚屋可觀察火山灰是否吹向外海；不屬黑潮群島或任何大陸國家。"}
 ],
 fields:[
  {id:"L-DRG-NORTHASH",name:"北口灰坡",zoneId:"DRG-Z-01",province:"PROV-DRG-01",smap:"SMAP-DRG-01",tier:"D",template:"L-HILL",tags:["volcanic","mountain"],risk:30,gather:["DRG-MAT-001"],mining:["DRG-MAT-003"],preferred:["MON-DRG-001","MON-DRG-004"],hazards:["落灰","熱風"],description:"龍脊北口內側的火山灰與玄武岩坡。"},
  {id:"L-DRG-WINDGAP",name:"熱風鞍部",zoneId:"DRG-Z-01",province:"PROV-DRG-01",smap:"SMAP-DRG-01",tier:"C",template:"L-HILL",tags:["volcanic","pass"],risk:36,gather:["DRG-MAT-002"],preferred:["MON-DRG-005","MON-DRG-008"],hazards:["陣風","地熱裂隙"],description:"北口少數可供大型隊伍穿越的鞍部，地熱風會突然增強。"},
  {id:"L-DRG-ASHPLAIN",name:"長灰原",zoneId:"DRG-Z-02",province:"PROV-DRG-02",smap:"SMAP-DRG-02",tier:"D",template:"L-LOWFIELD",tags:["volcanic","ash"],risk:31,gather:["DRG-MAT-001"],hunt:["DRG-MAT-007"],preferred:["MON-DRG-002","MON-DRG-006"],description:"厚薄不一的灰層覆蓋舊熔岩臺地，腳印可留數日。"},
  {id:"L-DRG-BASALTFIELD",name:"玄武岩柱原",zoneId:"DRG-Z-02",province:"PROV-DRG-02",smap:"SMAP-DRG-02",tier:"C",template:"L-HILL",tags:["volcanic","rock"],risk:35,mining:["DRG-MAT-003","DRG-MAT-004"],preferred:["MON-DRG-007","MON-DRG-010"],description:"冷卻節理形成密集石柱，採石量受道路搬運能力限制。"},
  {id:"L-DRG-REDBASIN",name:"赤泉外環",zoneId:"DRG-Z-03",province:"PROV-DRG-03",smap:"SMAP-DRG-03",tier:"D",template:"L-HILL",tags:["spring","volcanic"],risk:24,gather:["DRG-MAT-005","DRG-MAT-006"],preferred:["MON-DRG-003","MON-DRG-009"],description:"冷泉、溫泉與耐熱灌叢交錯，是龍脊少數可穩定採集食藥材的地帶。"},
  {id:"L-DRG-STEAMMARSH",name:"蒸汽濕地",zoneId:"DRG-Z-03",province:"PROV-DRG-03",smap:"SMAP-DRG-03",tier:"C",template:"L-RIVER",tags:["wetland","volcanic","water"],aquatic:true,risk:35,gather:["DRG-MAT-006"],preferred:["MON-DRG-009","MON-DRG-012"],hazards:["熱水","霧氣"],description:"地下熱水與冷溪交會形成的濕地，部分水池不可直接飲用。"},
  {id:"L-DRG-OBSIDIANRIDGE",name:"黑曜主稜",zoneId:"DRG-Z-04",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"C",template:"L-HILL",tags:["volcanic","mountain"],risk:45,mining:["DRG-MAT-008","DRG-MAT-010"],preferred:["MON-DRG-013","MON-DRG-016"],hazards:["玻璃碎坡","地震"],description:"大面積黑曜石與熔結岩裸露的主稜，採掘面必須保留安全通道。"},
  {id:"L-DRG-CALDERARIM",name:"沉火口外環",zoneId:"DRG-Z-04",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"B",template:"L-HILL",tags:["volcanic","caldera"],risk:55,mining:["DRG-MAT-012"],preferred:["MON-DRG-018","MON-DRG-020"],accessRule:"C級以上隊伍＋火山監測許可；核心B級地帶另需前置",hazards:["火山氣體","落石","地震"],description:"大型舊火口的外環稜線，日常不開放自由採集。"},
  {id:"L-DRG-SOUTHPLATEAU",name:"南路熔岩臺",zoneId:"DRG-Z-05",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"D",template:"L-HILL",tags:["volcanic","road"],risk:32,gather:["DRG-MAT-002"],mining:["DRG-MAT-004"],preferred:["MON-DRG-011","MON-DRG-014"],description:"龍脊南路跨越的冷卻熔岩臺，是南向車隊最穩定的地面。"},
  {id:"L-DRG-SULFURRIFT",name:"硫煙裂谷",zoneId:"DRG-Z-05",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"C",template:"L-HILL",tags:["volcanic","rift"],risk:46,mining:["DRG-MAT-009"],preferred:["MON-DRG-015","MON-DRG-019"],hazards:["毒氣","熱地"],description:"多個噴氣孔沿裂谷分布，採硫作業按風向輪區。"},
  {id:"L-DRG-BLACKCOAST",name:"黑熔海岸",zoneId:"DRG-Z-06",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"D",template:"L-RIVER",tags:["coast","volcanic","water"],aquatic:true,risk:30,gather:["DRG-MAT-011"],fish:["DRG-MAT-013"],preferred:["MON-DRG-017","MON-DRG-021"],description:"黑色熔岩崖、礫灘與潮池相間的東風海岸。"},
  {id:"L-DRG-ASHCOAST",name:"灰潮灣岸",zoneId:"DRG-Z-06",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"C",template:"L-RIVER",tags:["coast","ash","water"],aquatic:true,risk:36,gather:["DRG-MAT-011"],fish:["DRG-MAT-013"],preferred:["MON-DRG-021","MON-DRG-022"],hazards:["灰潮","崖風"],description:"灰季時火山灰進入海灣形成混濁潮帶，漁場會暫時遷移。"},
  {id:"L-DRG-GLASSVALLEY",name:"黑玻璃長谷",zoneId:"DRG-Z-04",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"C",template:"L-HILL",tags:["volcanic","valley"],risk:43,mining:["DRG-MAT-008"],preferred:["MON-DRG-013","MON-DRG-023"],description:"舊熔岩流冷卻後留下的黑玻璃谷，是主要礦站採區之一。"},
  {id:"L-DRG-REDCLIFF",name:"赤崖風臺",zoneId:"DRG-Z-06",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"C",template:"L-HILL",tags:["coast","volcanic"],risk:39,gather:["DRG-MAT-014"],preferred:["MON-DRG-017","MON-DRG-022"],description:"富含鐵氧化物的紅色海崖，可觀察外海風向與灰雲。"}
 ],
 dungeons:[
  {id:"D-DRG-WINDTUBE",name:"北口風鳴熔管",zoneId:"DRG-Z-01",province:"PROV-DRG-01",smap:"SMAP-DRG-01",tier:"C",template:"D-AQUEDUCT",risk:43,tags:["volcanic","cave"],gather:["DRG-MAT-002"],preferred:["MON-DRG-008","MON-DRG-015"],description:"貫穿山口的舊熔岩管，氣壓變化會產生低鳴。"},
  {id:"D-DRG-ASHVAULT",name:"灰埋驛庫",zoneId:"DRG-Z-02",province:"PROV-DRG-02",smap:"SMAP-DRG-02",tier:"C",template:"D-AQUEDUCT",risk:40,tags:["ruins","ash"],gather:["DRG-MAT-014"],preferred:["MON-DRG-010","MON-DRG-023"],description:"多次落灰掩埋的舊驛補給庫。"},
  {id:"D-DRG-STEAMGROTTO",name:"赤泉蒸汽窟",zoneId:"DRG-Z-03",province:"PROV-DRG-03",smap:"SMAP-DRG-03",tier:"C",template:"D-AQUEDUCT",risk:42,tags:["volcanic","water","cave"],aquatic:true,gather:["DRG-MAT-006"],preferred:["MON-DRG-012","MON-DRG-019"],description:"熱泉地下支流形成的蒸汽洞，水位與溫度每天都會變化。"},
  {id:"D-DRG-OLDPUMP",name:"舊泉泵室",zoneId:"DRG-Z-03",province:"PROV-DRG-03",smap:"SMAP-DRG-03",tier:"D",template:"D-AQUEDUCT",risk:34,tags:["ruins","water"],gather:["DRG-MAT-005"],preferred:["MON-DRG-009","MON-DRG-023"],description:"前代聚落留下的抽水與分流泵室，部分水道仍可修復。"},
  {id:"D-DRG-OBSIDIANMAZE",name:"黑曜裂廳",zoneId:"DRG-Z-04",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"B",template:"D-AQUEDUCT",risk:63,tags:["volcanic","cave"],mining:["DRG-MAT-015"],preferred:["MON-DRG-024"],accessRule:"B級前置＋黑玻璃礦站與火山監測員共同許可",hazards:["玻璃刃壁","地震","缺氧"],description:"黑曜石脈與天然裂廳構成的深層迷宮，地震後路線可能永久改變。"},
  {id:"D-DRG-HEARTCALDERA",name:"龍心沉火窟",zoneId:"DRG-Z-04",province:"PROV-DRG-04",smap:"SMAP-DRG-04",tier:"B",template:"D-AQUEDUCT",risk:67,tags:["volcanic","caldera","cave"],mining:["DRG-MAT-016"],preferred:["MON-DRG-024"],accessRule:"B級前置＋低活動期限定開放",hazards:["高溫","毒氣","岩層活動"],description:"沉火口下方仍保有高地熱的深層洞窟，是龍脊最危險的受控探索點。"},
  {id:"D-DRG-SULFURCAVERN",name:"黃煙礦窟",zoneId:"DRG-Z-05",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"C",template:"D-AQUEDUCT",risk:49,tags:["volcanic","cave"],mining:["DRG-MAT-009"],preferred:["MON-DRG-015","MON-DRG-019"],hazards:["毒氣"],description:"硫礦沿裂縫沉積的天然礦窟，只在風向與氣體濃度安全時進入。"},
  {id:"D-DRG-SOUTHLAVATUBE",name:"南路長熔管",zoneId:"DRG-Z-05",province:"PROV-DRG-05",smap:"SMAP-DRG-05",tier:"C",template:"D-AQUEDUCT",risk:45,tags:["volcanic","cave"],gather:["DRG-MAT-014"],preferred:["MON-DRG-014","MON-DRG-020"],description:"沿南路地下延伸的長熔岩管，是暴灰時的緊急避難路，但內部並不完全安全。"},
  {id:"D-DRG-TIDECAVE",name:"黑熔潮洞",zoneId:"DRG-Z-06",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"C",template:"D-AQUEDUCT",risk:44,tags:["coast","water","cave"],aquatic:true,gather:["DRG-MAT-011"],preferred:["MON-DRG-021","MON-DRG-022"],description:"海浪侵蝕古熔岩形成的潮洞，只有低潮能深入。"},
  {id:"D-DRG-FIRELIGHTHOUSE",name:"東風舊火標臺",zoneId:"DRG-Z-06",province:"PROV-DRG-06",smap:"SMAP-DRG-06",tier:"C",template:"D-AQUEDUCT",risk:41,tags:["ruins","coast"],gather:["DRG-MAT-014"],preferred:["MON-DRG-017","MON-DRG-023"],description:"曾用火山玻璃反射火光的舊航標臺，地下維修層已被灰與鹽霧侵蝕。"}
 ],
 materials:[
  ["DRG-MAT-001","灰原耐熱草","D",.08,29,"可在薄灰土層生長的耐熱藥草。"],["DRG-MAT-002","熱風石苔","D",.1,31,"地熱風口周圍的耐熱苔類。"],
  ["DRG-MAT-003","龍脊玄武岩","D",1.2,30,"火山臺地常見的堅硬石材。"],["DRG-MAT-004","孔隙熔岩石","D",.8,28,"輕質多孔火山石，可作耐熱建材。"],
  ["DRG-MAT-005","赤泉礦鹽","D",.18,34,"赤泉蒸發後回收的礦物鹽。"],["DRG-MAT-006","蒸汽藥蕨","C",.1,62,"溫泉濕地的藥用蕨類。"],
  ["DRG-MAT-007","灰鬃獸皮","D",.75,38,"合法狩獵火山麓獸類取得的耐磨皮。"],["DRG-MAT-008","黑曜火山玻璃","C",.45,72,"黑玻璃長谷可控採區出產的火山玻璃。"],
  ["DRG-MAT-009","黃煙硫晶","C",.3,69,"硫煙裂谷與礦窟輪封採集的硫晶。"],["DRG-MAT-010","赤鐵熔結石","C",.55,76,"富鐵火山岩與熔結凝灰岩。"],
  ["DRG-MAT-011","黑岸鹽藻","D",.1,28,"黑熔海岸潮池中的耐灰鹽藻。"],["DRG-MAT-012","火口磁石","C",.35,88,"沉火口外環少量可採的磁性火山石。"],
  ["DRG-MAT-013","熔灣銀鯖","D",.52,32,"東風火山岸常見食用海魚。"],["DRG-MAT-014","火標陶片","C",.18,64,"舊路棚與航標遺構回收的耐熱陶片。"],
  ["DRG-MAT-015","黑曜心晶","B",.22,178,"黑曜裂廳受控採得的高純火山玻璃晶。"],["DRG-MAT-016","龍心地熱晶","B",.2,195,"龍心沉火窟極少量形成的高地熱晶體。"]
 ],
 monsters:[
  {id:"MON-DRG-001",name:"灰坡火蜥",tier:"E",habitat:["L-DRG-NORTHASH"],hp:48,atk:15,def:10,element:"火",near:true,description:"會躲在溫熱岩縫中的火蜥。"},
  {id:"MON-DRG-002",name:"長灰沙兔",tier:"E",habitat:["L-DRG-ASHPLAIN"],hp:44,atk:13,def:8,near:true,description:"能在薄灰層挖洞的小型獸。"},
  {id:"MON-DRG-003",name:"赤泉岩蛙",tier:"E",habitat:["L-DRG-REDBASIN"],hp:50,atk:14,def:11,element:"水",tags:["aquatic"],near:true,description:"棲息冷熱交界泉池的厚皮蛙獸。"},
  {id:"MON-DRG-004",name:"北口玄甲蜥",tier:"D",habitat:["L-DRG-NORTHASH"],hp:96,atk:28,def:22,drops:["DRG-MAT-007"],description:"玄武岩色厚甲蜥獸。"},
  {id:"MON-DRG-005",name:"熱風翼蛇",tier:"D",habitat:["L-DRG-WINDGAP"],hp:86,atk:29,def:14,init:16,element:"風",description:"利用熱氣流滑翔的蛇形魔獸。"},
  {id:"MON-DRG-006",name:"灰鬃踏獸",tier:"D",habitat:["L-DRG-ASHPLAIN"],hp:112,atk:31,def:20,drops:["DRG-MAT-007"],description:"以群體踏過灰原尋找根莖的大型獸。"},
  {id:"MON-DRG-007",name:"柱原石角獸",tier:"D",habitat:["L-DRG-BASALTFIELD"],hp:118,atk:30,def:24,element:"地",drops:["DRG-MAT-003"],description:"會以角撞擊玄武岩柱尋找礦鹽。"},
  {id:"MON-DRG-008",name:"風鳴洞火蝠",tier:"C",habitat:["L-DRG-WINDGAP","D-DRG-WINDTUBE"],hp:142,atk:37,def:19,init:17,element:"火",description:"棲息高溫熔岩管的群居蝠獸。"},
  {id:"MON-DRG-009",name:"赤泉蒸甲龜",tier:"D",habitat:["L-DRG-REDBASIN","L-DRG-STEAMMARSH","D-DRG-OLDPUMP"],hp:120,atk:27,def:28,element:"水",description:"會利用溫熱泥地保溫的厚甲龜。"},
  {id:"MON-DRG-010",name:"玄武岩掘獸",tier:"C",habitat:["L-DRG-BASALTFIELD","D-DRG-ASHVAULT"],hp:168,atk:38,def:31,element:"地",description:"能沿破碎玄武岩挖掘洞穴的大型獸。"},
  {id:"MON-DRG-011",name:"南臺赤尾蜥",tier:"D",habitat:["L-DRG-SOUTHPLATEAU"],hp:105,atk:29,def:20,element:"火",drops:["DRG-MAT-007"],description:"南路熔岩臺常見的中型火蜥。"},
  {id:"MON-DRG-012",name:"蒸霧長足獸",tier:"C",habitat:["L-DRG-STEAMMARSH","D-DRG-STEAMGROTTO"],hp:158,atk:36,def:25,element:"水",description:"以長足跨越熱泥池的濕地獸。"},
  {id:"MON-DRG-013",name:"黑曜刃背獸",tier:"C",habitat:["L-DRG-OBSIDIANRIDGE","L-DRG-GLASSVALLEY"],hp:172,atk:40,def:29,drops:["DRG-MAT-008"],description:"背部附著火山玻璃片的高地獸。"},
  {id:"MON-DRG-014",name:"熔臺灰角羊",tier:"C",habitat:["L-DRG-SOUTHPLATEAU","D-DRG-SOUTHLAVATUBE"],hp:155,atk:37,def:25,drops:["DRG-MAT-007"],description:"能在高溫岩臺尋找稀疏植物的山羊獸。"},
  {id:"MON-DRG-015",name:"黃煙盲蜥",tier:"C",habitat:["L-DRG-SULFURRIFT","D-DRG-WINDTUBE","D-DRG-SULFURCAVERN"],hp:164,atk:38,def:27,element:"火",drops:["DRG-MAT-009"],description:"對硫氣耐受的地下盲蜥。"},
  {id:"MON-DRG-016",name:"磁脊石甲獸",tier:"C",habitat:["L-DRG-OBSIDIANRIDGE"],hp:184,atk:36,def:37,element:"地",drops:["DRG-MAT-012"],description:"外甲混有磁性礦物的大型岩獸。"},
  {id:"MON-DRG-017",name:"火灣崖翼蜥",tier:"C",habitat:["L-DRG-BLACKCOAST","L-DRG-REDCLIFF","D-DRG-FIRELIGHTHOUSE"],hp:148,atk:39,def:21,init:17,description:"在海崖上利用風勢滑翔的翼蜥。"},
  {id:"MON-DRG-018",name:"沉火口赤甲獸",tier:"C",habitat:["L-DRG-CALDERARIM"],hp:188,atk:41,def:34,element:"火",description:"活動於沉火口外環的大型甲獸。"},
  {id:"MON-DRG-019",name:"硫煙晶背蟲",tier:"C",habitat:["L-DRG-SULFURRIFT","D-DRG-STEAMGROTTO","D-DRG-SULFURCAVERN"],hp:160,atk:37,def:30,tags:["invertebrate"],drops:["DRG-MAT-009"],description:"背甲沉積硫晶的大型節肢魔物。"},
  {id:"MON-DRG-020",name:"熔管熱甲獸",tier:"C",habitat:["L-DRG-CALDERARIM","D-DRG-SOUTHLAVATUBE"],hp:176,atk:39,def:32,element:"火",description:"長期棲息高溫熔岩管的厚甲獸。"},
  {id:"MON-DRG-021",name:"黑岸熔背龜",tier:"C",habitat:["L-DRG-BLACKCOAST","L-DRG-ASHCOAST","D-DRG-TIDECAVE"],hp:190,atk:35,def:39,tags:["aquatic"],description:"會在黑岩潮池與淺海間活動的大型龜獸。"},
  {id:"MON-DRG-022",name:"灰潮長吻蜥",tier:"C",habitat:["L-DRG-ASHCOAST","L-DRG-REDCLIFF","D-DRG-TIDECAVE"],hp:170,atk:38,def:27,tags:["aquatic"],description:"灰季常靠近海岸捕食受驚魚群。"},
  {id:"MON-DRG-023",name:"舊火標陶衛",tier:"C",habitat:["L-DRG-GLASSVALLEY","D-DRG-ASHVAULT","D-DRG-OLDPUMP","D-DRG-FIRELIGHTHOUSE"],hp:178,atk:36,def:34,tags:["construct"],drops:["DRG-MAT-014"],description:"以耐熱陶與金屬構成的舊維修守衛。"},
  {id:"MON-DRG-024",name:"龍心熔岩古衛",tier:"B",role:"首領",habitat:["D-DRG-OBSIDIANMAZE","D-DRG-HEARTCALDERA"],hp:365,atk:58,def:46,mdef:44,acc:85,element:"火",tags:["construct","elemental"],drops:["DRG-MAT-015","DRG-MAT-016"],description:"深層火山遺構的高熱守衛，只在受控B級探索中出現。"}
 ],
 npcs:[
  ["NPC-DRG-001","卡姆・風旗","北口路棚值首","L-DRG-NORTHPASS","北口風向、封路旗、商旅與撤離","D",["ORG-DRG-ROAD"],"依灰雲與地震紀錄決定是否封路。"],
  ["NPC-DRG-002","瑟娜・石輪","北口車匠","L-DRG-NORTHPASS","車輪、耐灰罩、馱具與玄武岩路面","E",["ORG-DRG-ROAD"],"知道不同灰厚對車隊速度的影響。"],
  ["NPC-DRG-003","霍恩・灰棚","灰路值首","L-DRG-ASHROAD","灰原路況、避灰屋、水槽與馱運","D",["ORG-DRG-CARAVAN"],"遇到灰季會優先保留水給旅人與馱獸。"],
  ["NPC-DRG-004","芙拉・赤泉","赤泉水議首席","L-DRG-REDSHSPRING","泉量、飲水、農圃、旅宿與公共浴池","D",["ORG-DRG-WATER"],"飲水永遠優先於工坊與浴場。"],
  ["NPC-DRG-005","伊森・白汽","地熱醫師","L-DRG-REDSHSPRING","燙傷、硫氣、熱衰竭與泉療","E",["ORG-DRG-MEDIC"],"能分辨可療養泉與不可接觸的熱水池。"],
  ["NPC-DRG-006","多拉・黑玻璃","礦站聯議代表","L-DRG-OBSIDIAN","採區、配額、礦價與深層前置","C",["ORG-DRG-MINERS"],"拒絕在震群期間為高價礦石冒險開採。"],
  ["NPC-DRG-007","格安・聽岩","火山監測員","L-DRG-OBSIDIAN","地震、氣體、溫度、沉火口與深層通行","C",["ORG-DRG-OBSERVE"],"所有B級深層開放都需參考監測資料。"],
  ["NPC-DRG-008","奈拉・玻刃","黑曜石工匠","L-DRG-OBSIDIAN","黑曜石分級、切削、工具與傷害防護","D",["ORG-DRG-MINERS"],"高純材料有批次與來源紀錄。"],
  ["NPC-DRG-009","烏姆・石屋","南路營議值首","L-DRG-SOUTHROAD","南路補給、集水、避難屋與馱獸","D",["ORG-DRG-CARAVAN"],"灰季會限制非必要車隊。"],
  ["NPC-DRG-010","賽夫・黃煙","硫煙監測長","L-DRG-SULFURPOST","硫氣、風向、採區輪封與防毒裝備","C",["ORG-DRG-SULFUR"],"採硫量由安全窗決定，不由市場價格決定。"],
  ["NPC-DRG-011","梅亞・濾布","硫煙藥師","L-DRG-SULFURPOST","呼吸道刺激、濾布、藥劑與撤離","E",["ORG-DRG-MEDIC"],"維持有限防毒用品庫存。"],
  ["NPC-DRG-012","巴洛・熔灣","棚港船首","L-DRG-LAVACOVE","潮汐、棧橋、漁船與補給船","D",["ORG-DRG-COAST"],"灰潮與東風過強時會封港。"],
  ["NPC-DRG-013","伊娜・鹽火","熔灣漁戶代表","L-DRG-LAVACOVE","漁場、海鹽、灰潮與食物庫存","E",["ORG-DRG-COAST"],"會因灰潮移動漁場而不是無限捕撈同一海灣。"],
  ["NPC-DRG-014","洛恩・火標","東風航標議代表","L-DRG-EASTFIREBAY","航標、外海風向、灰雲與地震觀測","D",["ORG-DRG-COAST"],"對黑潮航線熟悉，但不受黑潮幕府任命。"],
  ["NPC-DRG-015","希芮・震筆","地震記錄員","L-DRG-EASTFIREBAY","震感、崖裂、潮位與火山灰日期","F",["ORG-DRG-OBSERVE"],"把居民口述與儀器紀錄分開標註。"],
  ["NPC-DRG-016","塔克・長繩","龍脊救援隊長","L-DRG-REDSHSPRING","跨區救援、熔管撤離、傷患轉送","C",["ORG-DRG-RESCUE"],"要求每支深入隊伍留下回程時限與路線。"],
  ["NPC-DRG-017","米菈・灰帳","商旅調度員","L-DRG-ASHROAD","跨境商隊、灰季延誤、貨價與補給","E",["ORG-DRG-CARAVAN"],"會把路況變化反映到貨期與庫存。"],
  ["NPC-DRG-018","艾朵・赤蕨","耐熱植物採集師","L-DRG-REDSHSPRING","赤泉植物、蒸汽蕨與採集輪休","E",["ORG-DRG-WATER"],"只採成熟區並保留復育帶。"]
 ],
 orgs:[
  {id:"ORG-DRG-ROAD",name:"龍脊北口路棚聯議",kind:"civic",tier:"C",base_location_id:"L-DRG-NORTHPASS",description:"維護北口風旗、封路、避灰屋與商旅撤離。",member_bonus:{id:"BONUS-ORG-DRG-ROAD",text:"灰季辨路",effects:{perception:3}}},
  {id:"ORG-DRG-WATER",name:"赤泉水議",kind:"civic",tier:"C",base_location_id:"L-DRG-REDSHSPRING",description:"管理冷泉、飲水優先、農圃、浴池與泉量監測。",member_bonus:{id:"BONUS-ORG-DRG-WATER",text:"泉地生存",effects:{perception:2}}},
  {id:"ORG-DRG-MINERS",name:"黑玻璃礦站聯議",kind:"craft",tier:"B",base_location_id:"L-DRG-OBSIDIAN",description:"管理黑曜石採區、配額、深層路線與礦難責任。",member_bonus:{id:"BONUS-ORG-DRG-MINERS",text:"火山辨材",effects:{carryCapacity:5}}},
  {id:"ORG-DRG-OBSERVE",name:"龍脊火山觀測會",kind:"scholarly",tier:"B",base_location_id:"L-DRG-OBSIDIAN",contact_location_ids:["L-DRG-EASTFIREBAY"],description:"記錄地震、氣體、溫度、灰雲與地熱變化，提供深層開放依據。",member_bonus:{id:"BONUS-ORG-DRG-OBSERVE",text:"地熱觀測",effects:{perception:4}}},
  {id:"ORG-DRG-CARAVAN",name:"南北灰路商旅會",kind:"trade",tier:"C",base_location_id:"L-DRG-ASHROAD",contact_location_ids:["L-DRG-SOUTHROAD"],description:"協調水槽、馱運、貨期與灰季改道。",member_bonus:{id:"BONUS-ORG-DRG-CARAVAN",text:"灰路補給",effects:{carryCapacity:4}}},
  {id:"ORG-DRG-SULFUR",name:"硫煙採區監測會",kind:"craft",tier:"C",base_location_id:"L-DRG-SULFURPOST",description:"依風向與氣體濃度輪封採硫區。",member_bonus:{id:"BONUS-ORG-DRG-SULFUR",text:"毒氣辨識",effects:{perception:3}}},
  {id:"ORG-DRG-COAST",name:"東風火灣棚戶聯社",kind:"civic",tier:"C",base_location_id:"L-DRG-EASTFIREBAY",contact_location_ids:["L-DRG-LAVACOVE"],description:"維護航標、棚港、漁場輪休、風暴救援與外海補給。",member_bonus:{id:"BONUS-ORG-DRG-COAST",text:"火灣航路",effects:{perception:3}}},
  {id:"ORG-DRG-RESCUE",name:"龍脊跨區救援隊",kind:"civic",tier:"C",base_location_id:"L-DRG-REDSHSPRING",contact_location_ids:["L-DRG-NORTHPASS","L-DRG-SOUTHROAD"],description:"協調火山傷患、失蹤、熔管撤離與跨聚落救援。",member_bonus:{id:"BONUS-ORG-DRG-RESCUE",text:"火地救援",effects:{defense_pct:2}}}
 ],
 links:[
  ["L-DRG-NORTHPASS","L-DRG-NORTHASH",.8],["L-DRG-NORTHPASS","L-DRG-WINDGAP",1.1],["L-DRG-WINDGAP","D-DRG-WINDTUBE",1],
  ["L-DRG-NORTHPASS","L-DRG-ASHROAD",2.5],["L-DRG-ASHROAD","L-DRG-ASHPLAIN",.8],["L-DRG-ASHROAD","L-DRG-BASALTFIELD",1.2],["L-DRG-ASHROAD","D-DRG-ASHVAULT",.9],
  ["L-DRG-ASHROAD","L-DRG-REDSHSPRING",3],["L-DRG-REDSHSPRING","L-DRG-REDBASIN",.7],["L-DRG-REDSHSPRING","L-DRG-STEAMMARSH",1],["L-DRG-STEAMMARSH","D-DRG-STEAMGROTTO",1.2],["L-DRG-REDSHSPRING","D-DRG-OLDPUMP",.8],
  ["L-DRG-REDSHSPRING","L-DRG-OBSIDIAN",3.5],["L-DRG-OBSIDIAN","L-DRG-OBSIDIANRIDGE",.9],["L-DRG-OBSIDIAN","L-DRG-GLASSVALLEY",1],["L-DRG-OBSIDIANRIDGE","L-DRG-CALDERARIM",1.5],["L-DRG-OBSIDIANRIDGE","D-DRG-OBSIDIANMAZE",1.4],["L-DRG-CALDERARIM","D-DRG-HEARTCALDERA",1.6],
  ["L-DRG-REDSHSPRING","L-DRG-SOUTHROAD",3.2],["L-DRG-SOUTHROAD","L-DRG-SULFURPOST",1.4],["L-DRG-SOUTHROAD","L-DRG-SOUTHPLATEAU",.8],["L-DRG-SULFURPOST","L-DRG-SULFURRIFT",.8],["L-DRG-SULFURRIFT","D-DRG-SULFURCAVERN",1],["L-DRG-SOUTHPLATEAU","D-DRG-SOUTHLAVATUBE",1.1],
  ["L-DRG-SOUTHROAD","L-DRG-LAVACOVE",4],["L-DRG-LAVACOVE","L-DRG-EASTFIREBAY",2],["L-DRG-LAVACOVE","L-DRG-BLACKCOAST",.7],["L-DRG-EASTFIREBAY","L-DRG-ASHCOAST",.8],["L-DRG-EASTFIREBAY","L-DRG-REDCLIFF",1],["L-DRG-BLACKCOAST","D-DRG-TIDECAVE",1],["L-DRG-REDCLIFF","D-DRG-FIRELIGHTHOUSE",1],
  ["L-DRG-NORTHPASS","L-TV-REDSLOPE",3],["L-DRG-NORTHPASS","L-TV-DRAGONFOOTHILL",2],["L-DRG-ASHROAD","L-GB-EMBERPOST",4]
 ],
 hooks:[
  ["HOOK-DRG-01","北口封路旗轉黑","觀測會偵測到震群與落灰增加；先確認風向、路面與熔管氣壓，再決定封鎖範圍。","C",["ash_load","seismicity","north_route"]],
  ["HOOK-DRG-02","赤泉流量下降","主要冷泉出水量下降，水議要求先排除管道堵塞、地震改道與人為截水。","C",["water_supply","seismicity"]],
  ["HOOK-DRG-03","黑玻璃採區出現新裂縫","高價礦層附近出現裂縫；採礦、封鎖或測繪的選擇會影響礦價與安全。","C",["mine_access","seismicity"]],
  ["HOOK-DRG-04","龍心沉火窟升溫","深層測溫連續上升，B級探索必須先完成多點觀測與撤離線確認。","B",["deep_heat","deep_access"]],
  ["HOOK-DRG-05","硫煙站多人咳嗽","採區人員同時出現呼吸症狀，需查濾布、風向、氣體濃度與是否違規延長工時。","C",["gas_risk","sulfur_output"]],
  ["HOOK-DRG-06","灰潮逼近棚港","灰雲往海上飄移，漁場與補給船可能同時受影響。","D",["ash_load","coast_access","food_stock"]],
  ["HOOK-DRG-07","南路避難屋水槽見底","大型商隊提前到達造成用水緊張，需調度而不能生成無限水源。","D",["water_supply","south_route"]],
  ["HOOK-DRG-08","舊火標臺重新反光","無人操作的舊反射構件在夜間轉向，調查需分辨風力、構裝故障或地下震動。","C",["ruin_activity","seismicity"]]
 ],
 life:[
  ["LIFE-DRG-01","灰季開始","北口與南路縮短通行時段，水與濾布需求上升。 ",{ash_load:2,north_route:-1,south_route:-1}],
  ["LIFE-DRG-02","赤泉豐水月","泉量回升，旅宿與農圃可短期增加配額。 ",{water_supply:2}],
  ["LIFE-DRG-03","黑曜輪封","部分採區休整與重新測繪，火山玻璃庫存下降。 ",{mine_access:-1}],
  ["LIFE-DRG-04","震群週","熔岩管、崖路與深層地城暫停一般探索。 ",{seismicity:2,deep_access:-2}],
  ["LIFE-DRG-05","硫煙順風窗","採硫站短期開放較多作業班次，但仍受總配額。 ",{gas_risk:-1,sulfur_output:1}],
  ["LIFE-DRG-06","東風漁季","棚港漁獲增加，灰潮則可能讓漁場提前結束。 ",{food_stock:1,coast_access:1}],
  ["LIFE-DRG-07","跨區救援演練","路棚、水議與棚港共同演練撤離，不形成中央政府。 ",{rescue_readiness:2}],
  ["LIFE-DRG-08","低活動期","若震動與氣體持續下降，高階地區可依前置有限開放。 ",{deep_heat:-1,deep_access:1}]
 ],
 lore:[
  ["LORE-DRG-01","politics","龍脊沒有政治體或首都","火山群的聚落只維持水源、道路、礦站與救援規約，沒有可代表REG-20的中央政府。"],
  ["LORE-DRG-02","geography","龍脊是一整條火山弧","北口、主脊、南路與東風海岸由不同年代熔岩、火山灰與斷層共同塑造。"],
  ["LORE-DRG-03","survival","水源比礦石更重要","常住人口首先受飲水、灰塵與補給限制，高價礦產不能消除環境承載上限。"],
  ["LORE-DRG-04","economy","火山素材不是無限採集","礦站依震動、氣體、採面穩定與運輸能力輪封採區；商站也有收購預算。"],
  ["LORE-DRG-05","border","鄰國前哨不等於吞併","泰爾瓦隆赤坡寨、灰刃灰燼哨鎮只維持各自主權區與通路，不把REG-20納入本國。"],
  ["LORE-DRG-06","adventure","B級內容集中黑曜裂廳與龍心沉火窟","一般聚落與道路維持D～C級，B級首領不會離開受控深層。"]
 ],
 stateAxes:{ash_load:0,seismicity:0,north_route:0,south_route:0,water_supply:0,mine_access:0,deep_heat:0,deep_access:0,gas_risk:0,sulfur_output:0,coast_access:0,food_stock:0,ruin_activity:0,rescue_readiness:0},
 eventChains:[
  {id:"CHAIN-DRG-ASH",name:"灰季循環",stages:["灰雲增厚","道路縮時","聚落濾水與濾布消耗","商路改道","灰量下降後漸進恢復"],feeds:["旅行","市場","NPC反應","委託"]},
  {id:"CHAIN-DRG-QUAKE",name:"震群深層鏈",stages:["微震增多","裂縫／氣體異常","深層封鎖","觀測與救援","有限重開或永久封存"],feeds:["地下城","採礦","世界狀態","傳聞"]},
  {id:"CHAIN-DRG-WATER",name:"赤泉承載鏈",stages:["泉量下降","生活配水","旅宿／工坊限額","查明原因","逐步回補"],feeds:["城鎮狀態","市場","NPC","生產"]}
 ]
};

const boundarySystem=build(BOUNDARY),dragonSystem=build(DRAGON);
const boundaryAudit=()=>audit(BOUNDARY),dragonAudit=()=>audit(DRAGON);
DB.meta=DB.meta||{};
DB.meta.boundary_dragonspine_depth_revision=REV;
DB.nonstate_region_depth_system={version:REV,release:RELEASE,regions:["REG-19","REG-20"],rules:["非國家區域不得自動生成中央政府／首都","聚落權力只作用於實際服務與安全範圍","資源受容量、輪封與恢復週期限制","打獵必須進入戰鬥","B級威脅只存在明確前置深層","傳聞必須經調查才能轉為正史資訊"],boundary:boundarySystem,dragonspine:dragonSystem,save_compatible:true,initial_audits:{boundary:boundaryAudit(),dragonspine:dragonAudit()}};
globalThis.runBoundaryDepthAudit=boundaryAudit;
globalThis.runDragonspineDepthAudit=dragonAudit;
globalThis.QUNLU_CORE?.registerModule?.("src/boundary-dragonspine-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();