/* 群陸旅誌：世界層行省圖冊 CURRENT-2.22.0
 * WORLD-MAP-PROVINCE-ATLAS-1.1 / DARK-MEDIEVAL-ATLAS-1.0
 * 將既有行省資料投影回世界層：每個行省都有可追溯的政治體、王國級地圖、
 * 世界大區、首都、所在地點統計與鄰接行省。座標是世界圖上的「位置錨點」，
 * 不是新增的精確測量，也不改旅行解鎖、主權或存檔 schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.22.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.22.0";
const REV="WORLD-MAP-PROVINCE-ATLAS-1.1";
const TIER_COLOR={F:"#78a879",E:"#9ebd77",D:"#c4b276",C:"#d79a62",B:"#d87e70",A:"#c77fa4",S:"#ad86d6"};
const array=v=>Array.isArray(v)?v:[];
const find=(key,id)=>array(DB[key]).find(x=>x?.id===id)||null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sid=v=>String(v??"").replace(/[^a-zA-Z0-9_-]/g,"");
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const tierColor=t=>TIER_COLOR[String(t||"F").toUpperCase()]||TIER_COLOR.F;

function centroid(points){
 const ps=array(points).filter(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1]));
 if(!ps.length)return [900,550];
 return [ps.reduce((s,p)=>s+ +p[0],0)/ps.length,ps.reduce((s,p)=>s+ +p[1],0)/ps.length];
}
function regionAnchor(regionId){
 const geoms=array(DB.world_geopolitical_map?.region_geometry).filter(g=>g?.region_id===regionId&&g.layer!=="subterranean");
 return centroid(geoms.flatMap(g=>array(g.points)));
}
function directionVector(text){
 const s=String(text||"");
 const x=(s.includes("東")?1:0)-(s.includes("西")?1:0);
 const y=(s.includes("南")?1:0)-(s.includes("北")?1:0);
 const l=Math.hypot(x,y)||1;
 return [x/l,y/l];
}
function polityName(id){return find("political_entities",id)?.name||id||"未標註政治體"}
function realmName(id){return find("realm_region_maps",id)?.name||id||"未標註政體圖"}
function worldRegionName(id){return find("world_regions",id)?.name||id||"未標註世界大區"}
function locationName(id){return find("locations",id)?.name||id||"未標註地點"}

function buildAtlas(){
 const provinces=array(DB.province_region_maps),locations=array(DB.locations),npcs=array(DB.regional_npc_archetypes),dossierNpcs=array(DB.polity_dossier_records).flatMap(x=>array(x?.npcs));
 const grouped=new Map();
 for(const p of provinces){const key=p.world_region_id||p.region_id||"UNKNOWN";(grouped.get(key)||grouped.set(key,[]).get(key)).push(p)}
 const anchors=new Map(),entries=[];
 for(const [regionId,rows] of grouped){
   const base=regionAnchor(regionId),cols=Math.max(1,Math.min(4,Math.ceil(Math.sqrt(rows.length)))),rowsCount=Math.ceil(rows.length/cols);
   rows.forEach((p,index)=>{
     const col=index%cols,row=Math.floor(index/cols);
     const dx=(col-(cols-1)/2)*38,dy=(row-(rowsCount-1)/2)*38;
     const [vx,vy]=directionVector(p.orientation||p.position);
     const x=clamp(base[0]+dx+vx*18,40,1760),y=clamp(base[1]+dy+vy*18,40,1060);
     anchors.set(p.id,[x,y]);
   });
 }
 for(const p of provinces){
   const realm=find("realm_region_maps",p.parent_realm_map_id),world=find("world_regions",p.world_region_id||p.region_id);
   const locs=locations.filter(l=>l?.province_region_id===p.id);
   const towns=locs.filter(l=>l.kind==="town"),wilds=locs.filter(l=>l.kind==="wild"),dungeons=locs.filter(l=>l.kind==="dungeon");
   const regionalNpcs=npcs.filter(n=>n?.province_region_id===p.id||n?.location_id&&locs.some(l=>l.id===n.location_id));
   const dossierFixedNpcs=dossierNpcs.filter(n=>n?.province_region_id===p.id||n?.location_id&&locs.some(l=>l.id===n.location_id));
   const fixedNpcs=[...regionalNpcs,...dossierFixedNpcs].filter((n,i,a)=>n?.id&&!a.slice(0,i).some(x=>x.id===n.id));
   const sibling=provinces.filter(x=>x.parent_realm_map_id===p.parent_realm_map_id&&x.id!==p.id);
   const adjacentRegions=array(DB.world_geopolitical_map?.region_adjacency?.[p.world_region_id||p.region_id]);
   const neighbors=[...sibling.filter(x=>x.world_region_id===p.world_region_id),...provinces.filter(x=>x.id!==p.id&&adjacentRegions.includes(x.world_region_id))];
   const seen=new Set(),neighborIds=neighbors.map(x=>x.id).filter(id=>!seen.has(id)&&seen.add(id)).slice(0,12);
   const anchor=anchors.get(p.id)||regionAnchor(p.world_region_id||p.region_id);
   const capital=find("locations",p.capital_location_id);
   entries.push({
     id:p.id,name:p.name,display_name:p.display_name||p.name,political_entity_id:p.political_entity_id,
     political_entity_name:p.political_entity_id?polityName(p.political_entity_id):"非主權區",parent_realm_map_id:p.parent_realm_map_id,
     nonstate_region:p.nonstate_region===true,
     parent_realm_name:realmName(p.parent_realm_map_id),world_region_id:p.world_region_id||p.region_id||null,
     world_region_name:worldRegionName(p.world_region_id||p.region_id),world_tier:p.world_tier||p.tier||"F",
     tier:p.tier||p.world_tier||"F",capital_location_id:p.capital_location_id||null,
     capital_name:capital?.name||locationName(p.capital_location_id),position:p.position||null,
     orientation:p.orientation||null,anchor:{x:Math.round(anchor[0]*10)/10,y:Math.round(anchor[1]*10)/10,basis:"世界大區幾何中心＋同行省穩定間距"},
     location_counts:{towns:towns.length,wilds:wilds.length,dungeons:dungeons.length,total:locs.length},
     location_ids:{towns:towns.map(x=>x.id),wilds:wilds.map(x=>x.id),dungeons:dungeons.map(x=>x.id)},
     npc_count:fixedNpcs.length,npc_counts:{fixed_dossiers:dossierFixedNpcs.length,regional_archetypes:regionalNpcs.length},npc_ids:fixedNpcs.map(x=>x.id),npc_scope:"固定NPC檔案與已綁定所在地點的NPC原型",neighbor_province_ids:neighborIds,
     map_status:p.map_status||"playable_current",administrative_type:p.administrative_type||null,
     identity:p.identity||p.description||null,governance:p.governance||null,economy:p.economy_profile||p.economy||null,
     risks:p.recurring_risks||p.risks||[]
   });
 }
 const byPolity={};for(const e of entries){const key=e.political_entity_id||"NONSTATE";(byPolity[key]||(byPolity[key]=[])).push(e.id)}
 const byRegion={};for(const e of entries)(byRegion[e.world_region_id]||(byRegion[e.world_region_id]=[])).push(e.id);
 const atlas={version:REV,release:RELEASE,save_compatible:true,canvas:DB.world_geopolitical_map?.canvas||{width:1800,height:1100},scope:"world_province_index",entries,by_political_entity:byPolity,by_world_region:byRegion,design_rules:["行省只引用既有province_region_maps，不建立新的主權。","位置錨點以既有世界大區幾何與明確方位文字推導；未建精確測繪時不宣稱邊界。","首都、城鎮、野外、地下城與NPC統計均回指既有資料列，點擊後仍進入原本的王國／行省圖。","世界層只顯示已知資料；未知海外政治體不因索引生成旅行內容。"]};
 DB.world_map_province_atlas=atlas;DB.world_map=DB.world_map||{};DB.world_map.province_atlas_revision=REV;DB.world_map.province_atlas=atlas;DB.meta=DB.meta||{};DB.meta.world_map_province_atlas_revision=REV;
 return atlas;
}
const ATLAS=buildAtlas();
function entry(id){return ATLAS.entries.find(x=>x.id===id)||null}
function geometryForRegion(regionId){return array(DB.world_geopolitical_map?.region_geometry).filter(g=>g?.region_id===regionId&&g.layer!=="subterranean")}
function provinceSvg(){
 const W=num(ATLAS.canvas?.width,1800),H=num(ATLAS.canvas?.height,1100),parts=['<defs><pattern id="world-atlas-grain" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M0 11 L38 11 M0 29 L38 29" stroke="#665b3f" stroke-width=".8" opacity=".15"></path><path d="M10 0 L10 38 M28 0 L28 38" stroke="#fff4cf" stroke-width=".8" opacity=".18"></path></pattern></defs><rect width="'+W+'" height="'+H+'" fill="#c9bc8d"></rect><rect width="'+W+'" height="'+H+'" fill="url(#world-atlas-grain)" opacity=".7"></rect>'];
 for(let i=1;i<9;i++){const y=H*(i/9),wave=W*.06;parts.push('<path d="M 0 '+Math.round(y)+' Q '+Math.round(W*.22)+' '+Math.round(y-wave)+' '+Math.round(W*.48)+' '+Math.round(y)+' T '+W+' '+Math.round(y)+'" fill="none" stroke="#756946" stroke-width="2" opacity=".22"></path>')}
 const palette=new Map(),colors=["#6d8492","#927b69","#667f70","#8c7890","#887d57","#6e738e","#9b6f68","#5f8581"];
 for(const e of ATLAS.entries){if(!palette.has(e.political_entity_id))palette.set(e.political_entity_id,colors[palette.size%colors.length])}
 for(const g of geometryForRegion()){const pts=array(g.points).map(p=>p.join(",")).join(" ");const e=ATLAS.entries.find(x=>x.world_region_id===g.region_id);parts.push('<polygon points="'+pts+'" fill="'+(e?palette.get(e.political_entity_id):"#293739")+'" fill-opacity=".36" stroke="#73858a" stroke-width="3"><title>'+esc(worldRegionName(g.region_id))+'</title></polygon>')}
 const grouped=new Map();for(const e of ATLAS.entries){if(!grouped.has(e.parent_realm_map_id))grouped.set(e.parent_realm_map_id,[]);grouped.get(e.parent_realm_map_id).push(e)}
 for(const es of grouped.values())for(const e of es){for(const nid of e.neighbor_province_ids){const n=entry(nid);if(!n||e.id>n.id)continue;parts.push('<line x1="'+e.anchor.x+'" y1="'+e.anchor.y+'" x2="'+n.anchor.x+'" y2="'+n.anchor.y+'" stroke="#d8b875" stroke-width="2" stroke-dasharray="8 7" opacity=".72"></line>')}}
 const current=typeof G!=="undefined"?find("locations",G?.character?.locationId)?.province_region_id:null;
 for(const e of ATLAS.entries){const here=current===e.id,c=tierColor(e.world_tier);parts.push('<g class="world-province-marker" role="link" tabindex="0" onclick="openWorldMapProvinceDetails(\''+sid(e.id)+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openWorldMapProvinceDetails(\''+sid(e.id)+'\')}"><title>'+esc(e.name+"｜"+e.political_entity_name+"｜"+e.world_tier+"級")+'</title><circle cx="'+e.anchor.x+'" cy="'+e.anchor.y+'" r="'+(here?17:12)+'" fill="'+c+'" stroke="'+(here?"#fff1b2":"#1c292b")+'" stroke-width="'+(here?6:3)+'"></circle><text x="'+e.anchor.x+'" y="'+(e.anchor.y-18)+'" text-anchor="middle" fill="#f4e7bb" font-size="14" font-weight="900" pointer-events="none">'+esc(e.name)+'</text><text x="'+e.anchor.x+'" y="'+(e.anchor.y+29)+'" text-anchor="middle" fill="#d6e1dc" font-size="11" pointer-events="none">'+esc(e.political_entity_name+" · "+e.world_tier+"級")+'</text></g>')}
 parts.push('<g pointer-events="none"><path d="M1680 145 L1680 70" stroke="#f0eee6" stroke-width="6"></path><polygon points="1680,48 1665,82 1695,82" fill="#f0eee6"></polygon><text x="1680" y="178" text-anchor="middle" fill="#f0eee6" font-size="22" font-weight="900">北 N</text></g>');
 return '<div class="atlas-province-world-map regionmap-scroll" tabindex="0" aria-label="群陸旅誌世界行省定位圖"><svg class="regionmap-svg world-province-atlas-svg" data-map-art="dark-medieval-cartography" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="群陸旅誌世界行省定位圖" style="width:100%;min-width:760px;height:auto;display:block">'+parts.join("")+'</svg></div>';
}
function provinceRows(){
 const groups=new Map();for(const e of ATLAS.entries){if(!groups.has(e.political_entity_id))groups.set(e.political_entity_id,[]);groups.get(e.political_entity_id).push(e)}
 return [...groups.entries()].map(([pid,es])=>'<section class="world-province-group"><h3>'+esc(pid==="NONSTATE"?"非主權區":polityName(pid))+' <span class="small">'+es.length+'省</span></h3>'+es.map(e=>'<div class="itemrow"><span><b>'+esc(e.name)+'</b> <span class="tier">'+esc(e.world_tier)+'級</span><br><span class="small">'+esc(e.world_region_name)+'｜首都／中樞：'+esc(e.capital_name)+'｜城鎮 '+e.location_counts.towns+'・野外 '+e.location_counts.wilds+'・地下城 '+e.location_counts.dungeons+'｜NPC '+e.npc_count+'</span></span><button type="button" onclick="openWorldMapProvinceDetails(\''+sid(e.id)+'\')">行省資料</button></div>').join("")+'</section>').join("");
}
function openProvinceAtlas(){
 const current=typeof G!=="undefined"?find("locations",G?.character?.locationId)?.province_region_id:null;
 const body='<div class="atlas-art-ribbon"><span>WORLD PROVINCES</span><b>行省疆域定位圖</b><i>只顯示已建檔資料，不虛構邊界</i></div><div class="actions"><button type="button" class="primary" onclick="openWorldMapAtlas(\'province\')">行省定位圖</button><button type="button" onclick="openWorldMapAtlas(\'surface\')">回政治＋地形</button>'+(current?'<button type="button" onclick="openWorldMapProvinceDetails(\''+sid(current)+'\')">目前所在行省</button>':"")+'</div>'+provinceSvg()+'<div class="card small"><b>定位規則</b>：行省標記回指既有政治體、王國／政體圖與行省資料；座標是世界圖定位錨點，不代表新增精確邊界。金線虛線表示資料上的鄰接關係。</div><h3>世界行省索引（'+ATLAS.entries.length+'）</h3>'+provinceRows();
 if(typeof showModal==="function")showModal("世界地圖・行省定位",body);
}
function openWorldMapProvinceDetails(id){
 const e=entry(id);if(!e)return false;const links=e.neighbor_province_ids.map(x=>entry(x)).filter(Boolean).map(x=>'<button type="button" onclick="openWorldMapProvinceDetails(\''+sid(x.id)+'\')">'+esc(x.name)+'</button>').join("");
 const body='<div class="card"><b>'+esc(e.name)+'</b> <span class="tier">'+esc(e.world_tier)+'級</span><br><span class="small">'+esc(e.political_entity_name)+'｜'+esc(e.parent_realm_name)+'｜'+esc(e.world_region_name)+'</span></div><div class="card small"><b>首都／行省中樞</b>：'+esc(e.capital_name)+'<br><b>世界位置</b>：'+esc(e.position||"依世界大區幾何定位")+'<br><b>方位與鄰接</b>：'+esc(e.orientation||"未另建文字方位；以世界大區中心與資料鄰接定位")+'<br><b>行政型態</b>：'+esc(e.administrative_type||"行省級行政／服務區")+'</div><div class="card small"><b>下層資料</b>：城鎮 '+e.location_counts.towns+'、野外 '+e.location_counts.wilds+'、地下城 '+e.location_counts.dungeons+'、固定NPC '+e.npc_count+'<br><b>行省定位摘要</b>：'+esc(e.identity||"—")+(e.governance?'<br><b>治理摘要</b>：'+esc(e.governance):"")+(e.economy?'<br><b>經濟摘要</b>：'+esc(Array.isArray(e.economy)?e.economy.join("、"):e.economy):"")+'</div>'+(links?'<div class="card small"><b>資料鄰接行省</b><div class="actions">'+links+'</div></div>':"")+'<div class="actions"><button type="button" onclick="openWorldMapAtlas(\'province\')">回行省定位</button><button type="button" onclick="openRegionMapGraphic(\'province\',\''+sid(e.id)+'\')">開啟行省圖面</button><button type="button" onclick="openRegionMapGraphic(\'realm\',\''+sid(e.parent_realm_map_id)+'\')">開啟政治體圖面</button></div>';
 if(typeof showModal==="function")showModal(e.name+"・世界層行省資料",body);return true;
}
function injectEntryButton(){
 if(typeof document==="undefined")return;const el=document.querySelector?.("#modalBody");if(!el||el.dataset?.provinceAtlasInjected)return;
 const html='<div class="actions regionmap-head-actions"><button type="button" onclick="openWorldMapAtlas(\'province\')">世界行省定位</button></div>';
 if(typeof el.insertAdjacentHTML==="function")el.insertAdjacentHTML("afterbegin",html);else if("innerHTML" in el)el.innerHTML=html+el.innerHTML;
 if(el.dataset)el.dataset.provinceAtlasInjected="true";
}
const previousOpen=typeof globalThis.openWorldMapAtlas==="function"?globalThis.openWorldMapAtlas:null;
globalThis.openWorldMapProvinceAtlas=openProvinceAtlas;
globalThis.openWorldMapProvinceDetails=openWorldMapProvinceDetails;
globalThis.openWorldMapAtlas=function(layer){if(layer==="province"){openProvinceAtlas();return}if(previousOpen)previousOpen(layer);injectEntryButton()};
if(typeof globalThis.openWorldMapHierarchy!=="function")globalThis.openWorldMapHierarchy=()=>globalThis.openWorldMapAtlas("surface");
function audit(){
 const issues=[],ids=new Set();for(const e of ATLAS.entries){if(ids.has(e.id))issues.push("duplicate province "+e.id);ids.add(e.id);if((!e.political_entity_id&&!e.nonstate_region)||!e.parent_realm_map_id||!e.world_region_id)issues.push("incomplete hierarchy "+e.id);if(!e.capital_location_id)issues.push("missing capital "+e.id);if(!Number.isFinite(e.anchor?.x)||!Number.isFinite(e.anchor?.y))issues.push("missing anchor "+e.id)}
 const political=new Set(array(DB.political_entities).map(x=>x.id));for(const pid of political)if(!ATLAS.by_political_entity[pid]?.length&&pid!=="POL-017")issues.push("political entity missing province index "+pid);
 return {pass:issues.length===0,revision:REV,entries:ATLAS.entries.length,political_entities:Object.keys(ATLAS.by_political_entity).filter(x=>x!=="NONSTATE").length,nonstate_provinces:ATLAS.by_political_entity.NONSTATE?.length||0,issues};
}
DB.world_map_province_atlas.initial_audit=audit();globalThis.runWorldMapProvinceAtlasAudit=audit;globalThis.QUNLU_CORE?.registerModule?.("src/world-map-province-atlas-v1.js",{domain:"world",revision:REV,release:RELEASE});
})();
