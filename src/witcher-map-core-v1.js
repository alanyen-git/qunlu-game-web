/* 群陸旅誌：全新世界地圖核心 CURRENT-2.23.0
 * WITCHER-MAP-CORE-1.0 / FOUR-LAYER-ATLAS-1.0
 * 這是全新的地圖 UI、渲染器與互動核心；舊地圖資料仍由既有資料模組提供，
 * 不刪除 canonical ID、不改旅行權限、不改存檔 schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const REV="WITCHER-MAP-CORE-1.0";
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.23.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.23.0";
const A=v=>Array.isArray(v)?v:[];
const db=()=>DB;
const find=(key,id)=>A(db()[key]).find(x=>x?.id===id)||null;
const loc=id=>find("locations",id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=v=>String(v??"").replace(/[^a-zA-Z0-9_-]/g,"");
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const player=()=>globalThis.G?.character||null;
const currentLocation=()=>loc(player()?.locationId);
const mapNames={world:"世界",realm:"政治體／王國",province:"行省",local:"城鎮／當地"};
const tierColor={F:"#6f9b72",E:"#9eb56d",D:"#c7ae69",C:"#d28b55",B:"#c86e5f",A:"#b65f81",S:"#8d6bc4"};
const polityColors=["#627b69","#8c765d","#687f82","#866b77","#9a8159","#617a70","#8c6660","#6e7090"];
const state={level:"world",id:null,filter:"all",zoom:1};
function worldGeometry(){return A(db().world_geopolitical_map?.region_geometry).filter(g=>g?.layer!=="subterranean"&&A(g.points).length>2)}
function polityOfGeometry(g){return g?.political_entity_id||find("world_regions",g?.region_id)?.political_entity_id||null}
function geometryForPolity(pid){return worldGeometry().filter(g=>polityOfGeometry(g)===pid)}
function pointsOf(gs){return A(gs).flatMap(g=>A(g.points)).filter(p=>Array.isArray(p)&&p.length>1&&Number.isFinite(+p[0])&&Number.isFinite(+p[1]))}
function centroid(points){const ps=A(points);if(!ps.length)return null;return {x:ps.reduce((s,p)=>s+n(p[0]),0)/ps.length,y:ps.reduce((s,p)=>s+n(p[1]),0)/ps.length}}
function realmRows(){return A(db().realm_region_maps).filter(x=>x?.political_entity_id||x?.world_region_id)}
function provinceRows(id){return A(db().province_region_maps).filter(x=>!id||x.parent_realm_map_id===id)}
function provinceLocations(p){return A(db().locations).filter(x=>x?.province_region_id===p?.id)}
function locationKindLabel(k){return ({town:"城鎮",wild:"野外",dungeon:"地下城"})[k]||"地點"}
function tier(x){return x?.kind==="town"?(x.settlement_world_tier||x.tier||"F"):(x?.world_tier||x?.tier||"F")}
function regionName(id){return find("world_regions",id)?.name||id||"未標註大區"}
function polityName(id){return find("political_entities",id)?.name||id||"未標註政治體"}
function realmName(id){return find("realm_region_maps",id)?.name||id||"未標註政體圖"}
function roadRoute(fromId,toId){
 if(!fromId||!toId)return null;if(fromId===toId)return {path:[fromId],hours:0};
 const dist=new Map([[fromId,0]]),prev=new Map(),open=new Set([fromId]);
 while(open.size){let at=null,best=Infinity;for(const id of open){if(dist.get(id)<best){at=id;best=dist.get(id)}}if(at===toId)break;open.delete(at);
  for(const edge of A(loc(at)?.links)){const next=loc(edge.to),hours=n(edge.hours);if(!next||hours<0)continue;const cost=best+hours;if(cost<(dist.get(edge.to)??Infinity)){dist.set(edge.to,cost);prev.set(edge.to,at);open.add(edge.to)}}
 }
 if(!dist.has(toId))return null;const path=[toId];while(path[0]!==fromId){const p=prev.get(path[0]);if(!p)return null;path.unshift(p)}return {path,hours:dist.get(toId)};
}
function travelTo(id){
 const target=loc(id),from=currentLocation();if(!target)return false;
 if(target.kind==="town"&&from&&from.id!==target.id){const route=roadRoute(from.id,target.id);if(!route)return false;if(typeof globalThis.travel==="function")return globalThis.travel(target.id,route.hours,{mapRoute:true,path:route.path})}
 if(typeof globalThis.openMapLocationDetail==="function")return globalThis.openMapLocationDetail(target.id);
 return false;
}
function svgStart(w,h,label){
 return '<svg class="witcher-map-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="witcher-paper" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 12H40M0 31H40" stroke="#58482d" stroke-width=".8" opacity=".16"></path><path d="M9 0V40M29 0V40" stroke="#fff2c8" stroke-width=".8" opacity=".16"></path></pattern><filter id="witcher-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#2d2417" flood-opacity=".38"></feDropShadow></filter></defs><rect width="'+w+'" height="'+h+'" fill="#cbbd8d"></rect><rect width="'+w+'" height="'+h+'" fill="url(#witcher-paper)" opacity=".75"></rect>';
}
function topography(w,h){
 const out=[];for(let i=1;i<8;i++){const y=Math.round(h*i/8),wave=Math.round(w*.06);out.push('<path d="M0 '+y+' Q '+Math.round(w*.22)+' '+(y-wave)+' '+Math.round(w*.48)+' '+y+' T '+w+' '+y+'" fill="none" stroke="#6f5d3d" stroke-width="2" opacity=".2"></path>')}
 for(let i=0;i<5;i++){const x=120+i*235;out.push('<path d="M '+x+' 175 l 26 -50 l 26 50 l -16 -12 l -10 30 l -10 -30 z" fill="#554f3a" opacity=".18"></path>')}
 return out.join("");
}
function featureLines(key,regions){
 const set=new Set(regions||[]),features=A(db().world_geopolitical_map?.[key]);return features.filter(f=>!set.size||A(f.regions).some(id=>set.has(id))).map(f=>{const pts=A(f.points).map(p=>n(p[0])+","+n(p[1])).join(" ");return pts?'<polyline points="'+pts+'" fill="none" stroke="'+(key==="rivers"?"#4f8990":key==="major_roads"?"#8f6436":"#665a3b")+'" stroke-width="'+(key==="major_roads"?"5":"4")+'" stroke-linecap="round" stroke-linejoin="round"'+(key==="major_roads"?' stroke-dasharray="13 9"':"")+' opacity=".78"><title>'+esc(f.name||key)+'</title></polyline>':""}).join("");
}
function worldSvg(){
 const w=Math.max(1200,n(db().world_geopolitical_map?.canvas?.width)||1800),h=Math.max(700,n(db().world_geopolitical_map?.canvas?.height)||1100),geoms=worldGeometry(),realms=realmRows(),byPolity=new Map(),parts=[svgStart(w,h,"群陸旅誌・世界地圖"),topography(w,h),featureLines("mountain_ranges"),featureLines("rivers"),featureLines("major_roads")];
 for(const g of geoms){const pid=polityOfGeometry(g);if(pid&&!byPolity.has(pid))byPolity.set(pid,polityColors[byPolity.size%polityColors.length]);const pts=A(g.points).map(p=>n(p[0])+","+n(p[1])).join(" ");parts.push('<polygon points="'+pts+'" fill="'+(byPolity.get(pid)||"#8a8066")+'" fill-opacity=".52" stroke="#55442d" stroke-width="3" filter="url(#witcher-shadow)"><title>'+esc(regionName(g.region_id))+'</title></polygon>')}
 for(const r of realms){const anchor=centroid(pointsOf(geometryForPolity(r.political_entity_id)));if(!anchor)continue;parts.push('<g class="witcher-map-marker witcher-map-realm" tabindex="0" role="link" onclick="openWitcherMap(\'realm\',\''+safe(r.id)+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openWitcherMap(\'realm\',\''+safe(r.id)+'\')}"><circle cx="'+anchor.x+'" cy="'+anchor.y+'" r="15" fill="#bd8742" stroke="#342718" stroke-width="4"></circle><path d="M '+(anchor.x-8)+' '+(anchor.y+4)+' L '+anchor.x+' '+(anchor.y-8)+' L '+(anchor.x+8)+' '+(anchor.y+4)+'" fill="none" stroke="#fff0bd" stroke-width="2"></path><text x="'+anchor.x+'" y="'+(anchor.y-24)+'" text-anchor="middle">'+esc(realmName(r.id))+'</text></g>')}
 const cx=w-70;parts.push('<g class="witcher-map-compass"><circle cx="'+cx+'" cy="74" r="35" fill="#d9c999" fill-opacity=".78" stroke="#5a452c" stroke-width="2"></circle><path d="M '+cx+' 48 L '+(cx+8)+' 78 L '+cx+' 70 L '+(cx-8)+' 78 Z" fill="#6b3f32"></path><text x="'+cx+'" y="38" text-anchor="middle">N</text></g></svg>');return parts.join("");
}
function realmSvg(id){
 const realm=find("realm_region_maps",id);if(!realm)return "";const w=Math.max(1200,n(db().world_geopolitical_map?.canvas?.width)||1800),h=Math.max(700,n(db().world_geopolitical_map?.canvas?.height)||1100),geoms=geometryForPolity(realm.political_entity_id),provinces=provinceRows(id),regions=geoms.map(x=>x.region_id),parts=[svgStart(w,h,realmName(id)+"・政治體地圖"),topography(w,h),featureLines("mountain_ranges",regions),featureLines("rivers",regions),featureLines("major_roads",regions)];
 for(const g of geoms){const pts=A(g.points).map(p=>n(p[0])+","+n(p[1])).join(" ");parts.push('<polygon points="'+pts+'" fill="#839078" fill-opacity=".72" stroke="#493d29" stroke-width="4"><title>'+esc(regionName(g.region_id))+'</title></polygon>')}
 for(const p of provinces){const anchor=centroid(pointsOf(geoms.filter(g=>g.region_id===p.world_region_id)));if(!anchor)continue;const c=tierColor[p.world_tier||p.tier]||tierColor.F;parts.push('<g class="witcher-map-marker witcher-map-province" tabindex="0" role="link" onclick="openWitcherMap(\'province\',\''+safe(p.id)+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openWitcherMap(\'province\',\''+safe(p.id)+'\')}"><circle cx="'+anchor.x+'" cy="'+anchor.y+'" r="12" fill="'+c+'" stroke="#392b1d" stroke-width="3"></circle><text x="'+anchor.x+'" y="'+(anchor.y-18)+'" text-anchor="middle">'+esc(p.name)+'</text></g>')}
 parts.push('</svg>');return parts.join("");
}
function provinceSvg(id){
 const p=find("province_region_maps",id);if(!p)return "";const nodes=provinceLocations(p),w=1200,h=Math.max(650,Math.ceil(nodes.length/3)*100+180),columns={town:200,wild:600,dungeon:1000},positions=new Map();
 for(const kind of ["town","wild","dungeon"]){const rows=nodes.filter(x=>x.kind===kind);rows.forEach((x,i)=>positions.set(x.id,{x:columns[kind],y:150+i*100}))}
 const parts=[svgStart(w,h,p.name+"・行省地圖"),topography(w,h)];
 for(const node of nodes)for(const edge of A(node.links)){const a=positions.get(node.id),b=positions.get(edge.to);if(!a||!b||node.id>edge.to)continue;parts.push('<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#805a32" stroke-width="5" stroke-dasharray="14 9" opacity=".75"><title>'+esc(node.name+" ↔ "+(loc(edge.to)?.name||edge.to))+'</title></line>')}
 for(const [kind,x] of Object.entries(columns))parts.push('<text class="witcher-map-column-title" x="'+x+'" y="74" text-anchor="middle">'+locationKindLabel(kind)+'</text>');
 for(const node of nodes){const pt=positions.get(node.id),c=tierColor[tier(node)]||tierColor.F;if(!pt)continue;const action=node.kind==="town"?"witcherMapTravel('"+safe(node.id)+"')":"openMapLocationDetail('"+safe(node.id)+"')";parts.push('<g class="witcher-map-marker witcher-map-location witcher-kind-'+safe(node.kind)+'" data-map-kind="'+safe(node.kind)+'" tabindex="0" role="link" onclick="'+action+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+action+'}"><rect x="'+(pt.x-118)+'" y="'+(pt.y-28)+'" width="236" height="56" rx="8" fill="#e5d6a7" stroke="'+c+'" stroke-width="4"></rect><text x="'+pt.x+'" y="'+(pt.y-3)+'" text-anchor="middle">'+esc(node.name)+'</text><text x="'+pt.x+'" y="'+(pt.y+18)+'" text-anchor="middle" class="witcher-marker-sub">'+locationKindLabel(node.kind)+"・"+esc(tier(node))+"級"+'</text></g>')}
 return parts.join("")+"</svg>";
}
function localSvg(id){
 const center=loc(id);if(!center)return "";const links=A(center.links).map(e=>({edge:e,target:loc(e.to)})).filter(x=>x.target),w=1100,h=680,cx=550,cy=340,parts=[svgStart(w,h,center.name+"・當地地圖"),topography(w,h)];
 links.forEach((x,i)=>{const angle=-Math.PI/2+(Math.PI*2*i/Math.max(1,links.length)),pt={x:cx+Math.cos(angle)*350,y:cy+Math.sin(angle)*220};x.pt=pt;parts.push('<line x1="'+cx+'" y1="'+cy+'" x2="'+pt.x+'" y2="'+pt.y+'" stroke="#805a32" stroke-width="5" stroke-dasharray="14 9" opacity=".8"><title>'+esc(x.edge.hours+" 小時")+'</title></line>')});
 for(const x of links){const t=x.target,c=tierColor[tier(t)]||tierColor.F,action=t.kind==="town"?"witcherMapTravel('"+safe(t.id)+"')":"openMapLocationDetail('"+safe(t.id)+"')";parts.push('<g class="witcher-map-marker witcher-map-location" tabindex="0" role="link" onclick="'+action+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+action+'}"><rect x="'+(x.pt.x-115)+'" y="'+(x.pt.y-27)+'" width="230" height="54" rx="8" fill="#e5d6a7" stroke="'+c+'" stroke-width="4"></rect><text x="'+x.pt.x+'" y="'+(x.pt.y-3)+'" text-anchor="middle">'+esc(t.name)+'</text><text x="'+x.pt.x+'" y="'+(x.pt.y+17)+'" text-anchor="middle" class="witcher-marker-sub">'+locationKindLabel(t.kind)+"・"+esc(tier(t))+"級"+'</text></g>')}
 parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="70" fill="#8d6239" stroke="#382717" stroke-width="5"></circle><text x="'+cx+'" y="'+(cy-4)+'" text-anchor="middle" fill="#fff0bf">'+esc(center.name)+'</text><text x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle" fill="#fff0bf" class="witcher-marker-sub">目前位置・'+esc(tier(center))+"級"+'</text></svg>');return parts.join("");
}
function mapSvg(){if(state.level==="world")return worldSvg();if(state.level==="realm")return realmSvg(state.id);if(state.level==="province")return provinceSvg(state.id);return localSvg(state.id)}
function breadcrumbs(){
 const current=state.level==="world"?null:state.level==="realm"?find("realm_region_maps",state.id):state.level==="province"?find("province_region_maps",state.id):loc(state.id),realm=state.level==="province"?find("realm_region_maps",current?.parent_realm_map_id):state.level==="local"?find("realm_region_maps",find("province_region_maps",current?.province_region_id)?.parent_realm_map_id):null;
 return '<div class="witcher-breadcrumbs"><button onclick="openWitcherMap(\'world\')">世界</button>'+(realm?'<span>›</span><button onclick="openWitcherMap(\'realm\',\''+safe(realm.id)+'\')">'+esc(realmName(realm.id))+'</button>':"")+(state.level==="province"||state.level==="local"?'<span>›</span><button onclick="openWitcherMap(\'province\',\''+safe(state.level==="province"?state.id:current?.province_region_id)+'\')">行省</button>':"")+(state.level==="local"?'<span>›</span><b>'+esc(current?.name||"")+'</b>':"")+'</div>';
}
function sidebar(){
 const cur=currentLocation();let rows=[];
 if(state.level==="world")rows=realmRows().map(r=>{const anchor=centroid(pointsOf(geometryForPolity(r.political_entity_id)));return '<button class="witcher-index-row" onclick="openWitcherMap(\'realm\',\''+safe(r.id)+'\')"><b>'+esc(realmName(r.id))+'</b><small>'+esc(polityName(r.political_entity_id))+(anchor?"":"｜未定位，僅列索引")+'</small></button>'}).join("");
 if(state.level==="realm")rows=provinceRows(state.id).map(p=>'<button class="witcher-index-row" onclick="openWitcherMap(\'province\',\''+safe(p.id)+'\')"><b>'+esc(p.name)+'</b><small>'+esc(p.world_tier||p.tier||"—")+'級｜'+esc(p.orientation||"行省資料")+'</small></button>').join("");
 if(state.level==="province"){const p=find("province_region_maps",state.id);rows=provinceLocations(p).filter(x=>state.filter==="all"||x.kind===state.filter).map(x=>'<button class="witcher-index-row" onclick="openWitcherMap(\'local\',\''+safe(x.id)+'\')"><b>'+esc(x.name)+'</b><small>'+locationKindLabel(x.kind)+'｜'+esc(tier(x))+'級'+(x.id===cur?.id?"｜目前位置":"")+'</small></button>').join("")}
 if(state.level==="local"){const l=loc(state.id);rows=A(l?.links).map(e=>loc(e.to)).filter(Boolean).map(x=>'<button class="witcher-index-row" onclick="openWitcherMap(\'local\',\''+safe(x.id)+'\')"><b>'+esc(x.name)+'</b><small>'+locationKindLabel(x.kind)+'｜'+esc(tier(x))+'級</small></button>').join("")}
 return '<aside class="witcher-map-sidebar"><div class="witcher-sidebar-title">'+(state.level==="world"?"已知政治體／王國":state.level==="realm"?"所轄行省":state.level==="province"?"行省地點":"鄰近地點")+'</div><div class="witcher-index-list">'+(rows||'<div class="witcher-empty">沒有可驗證的下層資料。<br>系統不推造位置或行政區。</div>')+'</div>'+(state.level==="province"?'<div class="witcher-filter-row"><button class="'+(state.filter==="all"?"active":"")+'" onclick="setWitcherMapFilter(\'all\')">全部</button><button class="'+(state.filter==="town"?"active":"")+'" onclick="setWitcherMapFilter(\'town\')">城鎮</button><button class="'+(state.filter==="wild"?"active":"")+'" onclick="setWitcherMapFilter(\'wild\')">野外</button><button class="'+(state.filter==="dungeon"?"active":"")+'" onclick="setWitcherMapFilter(\'dungeon\')">地下</button></div>':"")+'</aside>';
}
function render(){
 const title=state.level==="world"?"群陸旅誌・世界地圖":state.level==="realm"?realmName(state.id):state.level==="province"?(find("province_region_maps",state.id)?.name||"行省地圖"):((loc(state.id)?.name||"當地地圖"));
 const tabs=["world","realm","province","local"].map((level,i)=>'<button class="witcher-layer-tab '+(state.level===level?"active":"")+'" onclick="'+(level==="world"?"openWitcherMap(\'world\')":"")+'"><span>0'+(i+1)+'</span>'+mapNames[level]+'</button>').join("");
 const filterNote=state.level==="province"?"野外與地下城歸屬本行省；位置只依已建道路與資料關聯呈現。":state.level==="local"?"道路線段只表示已建檔連結，不代表未驗證的精確測繪。":"世界位置使用既有疆域與座標；沒有座標的資料只列於索引。";
 return '<div class="witcher-map-shell" data-map-level="'+state.level+'">'+breadcrumbs()+'<div class="witcher-map-heading"><div><span class="witcher-map-kicker">DARK MEDIEVAL FIELD ATLAS</span><h2>'+esc(title)+'</h2><p>'+esc(filterNote)+'</p></div><div class="witcher-map-controls"><button onclick="changeWitcherMapZoom(-1)">−</button><output>'+Math.round(state.zoom*100)+'%</output><button onclick="changeWitcherMapZoom(1)">＋</button></div></div><nav class="witcher-layer-tabs" aria-label="地圖層級">'+tabs+'</nav><div class="witcher-map-layout"><section class="witcher-map-stage"><div class="witcher-map-scroll" tabindex="0">'+mapSvg()+'</div></section>'+sidebar()+'</div><div class="witcher-map-footer">點選標記進入下一層；城鎮可依既有道路旅行。新地圖核心不修改角色存檔。</div></div>';
}
function show(){if(typeof globalThis.showModal!=="function")return false;const title=state.level==="world"?"世界地圖":state.level==="realm"?realmName(state.id):state.level==="province"?"行省地圖":"當地地圖";globalThis.showModal(title,render());return true}
function open(level,id){
 const valid=["world","realm","province","local"].includes(level)?level:"world";
 if(valid==="world"){state.level="world";state.id=null}
 else if(valid==="realm"&&find("realm_region_maps",id)){state.level=valid;state.id=id}
 else if(valid==="province"&&find("province_region_maps",id)){state.level=valid;state.id=id}
 else if(valid==="local"&&loc(id)){state.level=valid;state.id=id}
 else return false;
 state.filter="all";state.zoom=1;return show();
}
function setFilter(filter){state.filter=["all","town","wild","dungeon"].includes(filter)?filter:"all";return show()}
function zoom(delta){state.zoom=Math.max(.75,Math.min(2.1,state.zoom+(Number(delta)||0)*.25));return show()}
function audit(){
 const issues=[];if(typeof globalThis.showModal!=="function")issues.push("showModal missing");if(!A(db().realm_region_maps).length)issues.push("realm data missing");if(!A(db().province_region_maps).length)issues.push("province data missing");if(!A(db().locations).length)issues.push("location data missing");
 return {revision:REV,pass:!issues.length,issues,save_compatible:true,hierarchy:"world→realm→province→local",old_map_data_preserved:true};
}
globalThis.openWitcherMap=open;globalThis.witcherMapTravel=travelTo;globalThis.setWitcherMapFilter=setFilter;globalThis.changeWitcherMapZoom=zoom;globalThis.runWitcherMapCoreAudit=audit;
globalThis.openWorldMapAtlas=()=>open("world");
globalThis.openWorldMapHierarchy=()=>open("world");
globalThis.openRegionMapGraphic=(level,id)=>open(level,id);
globalThis.openRealmRegionMap=id=>open("realm",id);
globalThis.openProvinceRegionMap=id=>open("province",id);
globalThis.openSettlementRegionMap=id=>{const l=loc(id);return l?.province_region_id?open("province",l.province_region_id):open("local",id)};
DB.meta=DB.meta||{};DB.meta.witcher_map_core_revision=REV;DB.meta.witcher_map_old_entrypoints_replaced=true;
globalThis.QUNLU_CORE?.registerModule?.("src/witcher-map-core-v1.js",{domain:"world",revision:REV,release:RELEASE,old_entrypoints_replaced:true});
globalThis.QUNLU_CORE?.registerAudit?.("runWitcherMapCoreAudit",audit);
})();
