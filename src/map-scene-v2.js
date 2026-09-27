/* 群陸旅誌：連續世界地圖場景 CURRENT-2.25.6
 * MAP-SCENE-2.2 / CARTOGRAPHIC-SCENE-1.0
 * 獨立 canvas 圖面核心。只繪製有 canonical 幾何或明確測繪座標的資料；
 * 目前可玩地點由 MAP-SURVEY-COMPLETION-1.0 補齊固定區域路網測繪稿。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="MAP-SCENE-2.2";
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.25.6")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.25.6";
const A=v=>Array.isArray(v)?v:[];
const find=(key,id)=>A(DB[key]).find(x=>x?.id===id)||null;
const loc=id=>find("locations",id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=v=>String(v??"").replace(/[^a-zA-Z0-9_-]/g,"");
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const player=()=>globalThis.G?.character||null;
const currentLocation=()=>loc(player()?.locationId);
const geo=()=>DB.world_geopolitical_map||{};
const kinds={town:"城鎮",wild:"野外",dungeon:"地下城"};
const layerNames={world:"世界",realm:"政治體／王國",province:"行省",local:"當地"};
const filters={town:"城鎮",wild:"野外",dungeon:"地下城",capital:"中樞",pass:"關隘"};
const state={level:"world",id:null,filter:"all",zoom:1,panX:0,panY:0,selected:null,showLegend:true,hits:[],mounted:false,pointers:new Map(),pinch:null};

function worldGeometries(){return A(geo().region_geometry).filter(g=>g?.layer!=="subterranean"&&A(g.points).length>2)}
function region(id){return find("world_regions",id)}
function polity(id){return find("political_entities",id)}
function realm(id){return find("realm_region_maps",id)}
function province(id){return find("province_region_maps",id)}
function polityIdOfGeometry(g){return g?.political_entity_id||region(g?.region_id)?.political_entity_id||null}
function realmForPolity(pid){return A(DB.realm_region_maps).find(r=>r?.political_entity_id===pid)||null}
function provinceLocations(id){return A(DB.locations).filter(l=>l?.province_region_id===id)}
function locationTier(l){return l?.kind==="town"?(l.settlement_world_tier||l.tier||"F"):(l?.world_tier||l?.tier||"F")}
function settlementMap(id){return find("settlement_region_maps",id)}
function provinceAtlasEntry(id){return A(DB.world_map_province_atlas?.entries).find(x=>x?.id===id)||null}
function provinceForLocation(l){
 if(!l)return null;
 const direct=province(l.province_region_id);if(direct)return direct;
 const realmId=l.realm_region_map_id||l.realm_id;
 const parent=realm(realmId);
 return A(DB.province_region_maps).find(p=>(parent?p.parent_realm_map_id===parent.id:p.political_entity_id===l.political_entity_id)&&(
   p.capital_location_id===l.id||A(p.subordinate_settlement_ids).includes(l.id)||A(p.location_ids).includes(l.id)
 ))||null;
}
function realmForLocation(l){
 if(!l)return null;
 const direct=realm(l.realm_region_map_id||l.realm_id);if(direct)return direct;
 const p=provinceForLocation(l),byProvince=realm(p?.parent_realm_map_id);if(byProvince)return byProvince;
 return realmForPolity(l.political_entity_id||region(l.world_region_id||l.region_id)?.political_entity_id);
}
function localLocations(id){
 const center=loc(id);if(!center)return [];
 const ids=new Set([center.id,...A(center.links).map(e=>e?.to).filter(Boolean)]);
 return [...ids].map(loc).filter(Boolean);
}
function pointList(points){return A(points).filter(p=>Array.isArray(p)&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])).map(p=>[+p[0],+p[1]])}
function centroid(points){const ps=pointList(points);return ps.length?{x:ps.reduce((s,p)=>s+p[0],0)/ps.length,y:ps.reduce((s,p)=>s+p[1],0)/ps.length}:null}
function boundsFor(geoms){
 const ps=A(geoms).flatMap(g=>pointList(g.points));
 if(!ps.length)return {x:0,y:0,w:num(geo().canvas?.width,1800),h:num(geo().canvas?.height,1100)};
 const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),pad=55;
 return {x:Math.min(...xs)-pad,y:Math.min(...ys)-pad,w:Math.max(180,Math.max(...xs)-Math.min(...xs)+pad*2),h:Math.max(140,Math.max(...ys)-Math.min(...ys)+pad*2)};
}
function sceneGeometries(){
 if(state.level==="world")return worldGeometries();
 let pid=null,rid=null;
 if(state.level==="realm")pid=realm(state.id)?.political_entity_id||null;
 if(state.level==="province"){const p=province(state.id);pid=p?.political_entity_id||null;rid=p?.world_region_id||p?.region_id||null}
 if(state.level==="local"){const l=loc(state.id),p=province(l?.province_region_id);pid=p?.political_entity_id||l?.political_entity_id||null;rid=p?.world_region_id||l?.world_region_id||null}
 const byRegion=rid?worldGeometries().filter(g=>g.region_id===rid):[];
 return byRegion.length?byRegion:worldGeometries().filter(g=>polityIdOfGeometry(g)===pid);
}
function explicitPoint(row){
 if(!row)return null;
 const candidates=[row.map_coordinates,row.cartographic_coordinates,row.map_position,row.coordinates];
 for(const c of candidates){
  if(Array.isArray(c)&&Number.isFinite(+c[0])&&Number.isFinite(+c[1]))return {x:+c[0],y:+c[1],basis:"canonical"};
  if(c&&Number.isFinite(+c.x)&&Number.isFinite(+c.y)&&(c.verified===true||c.basis||c.source))return {x:+c.x,y:+c.y,basis:c.basis||c.source};
 }
 if(Number.isFinite(+row.map_x)&&Number.isFinite(+row.map_y))return {x:+row.map_x,y:+row.map_y,basis:"canonical"};
 return null;
}
function visibleFeatures(key,geoms=sceneGeometries()){
 const ids=new Set(geoms.map(g=>g.region_id));
 return A(geo()[key]).filter(f=>A(f.regions).some(id=>ids.has(id))||key==="capitals"&&geoms.some(g=>polityIdOfGeometry(g)===f.political_entity_id));
}
function unmappedLocations(){
 if(state.level!=="province"&&state.level!=="local")return [];
 if(state.level==="province"){
  const p=province(state.id);return provinceLocations(p?.id).filter(l=>!explicitPoint(l));
 }
 return localLocations(state.id).filter(l=>!explicitPoint(l));
}
function mappedLocations(){
 if(state.level!=="province"&&state.level!=="local")return [];
 const rows=state.level==="province"?provinceLocations(state.id):localLocations(state.id);
 return rows.map(l=>({row:l,point:explicitPoint(l)})).filter(x=>x.point);
}
function featureAllowed(kind){return state.filter==="all"||state.filter===kind}
function roadRoute(fromId,toId){
 const edge=A(loc(fromId)?.links).find(e=>e?.to===toId&&Number.isFinite(+e.hours)&&+e.hours>=0);
 return edge?{path:[fromId,toId],hours:+edge.hours}:null;
}
function travelTo(id){
 const from=currentLocation(),target=loc(id);if(!from||!target||from.id===target.id)return false;
 const route=roadRoute(from.id,target.id);if(!route)return false;
 if(typeof globalThis.travel!=="function")return false;
 // 當地圖的路線已由所在地 links 驗證；野外／地下城不能套用只給城鎮跨段旅行的 mapRoute 模式。
 // 交回一般 travel 入口，讓主 runtime 依同一條 canonical 直連道路完成移動與存檔。
 return globalThis.travel(target.id,route.hours);
}

function title(){
 if(state.level==="world")return "群陸世界地圖";
 if(state.level==="realm")return realm(state.id)?.name||"政治體地圖";
 if(state.level==="province")return province(state.id)?.name||"行省地圖";
 return loc(state.id)?.name||"當地地圖";
}
function hierarchyIds(){
 const l=currentLocation();return {local:l,province:provinceForLocation(l),realm:realmForLocation(l)};
}
function tabs(){
 const h=hierarchyIds();
 const item=(level,label,enabled)=>'<button type="button" class="mapscene-tab '+(state.level===level?'is-active':'')+'" '+(enabled?'onclick="openMapScene(\''+level+'\')"':'disabled')+'><small>'+({world:"01",realm:"02",province:"03",local:"04"})[level]+'</small><span>'+label+'</span></button>';
 return '<nav class="mapscene-tabs" aria-label="角色所在位置地圖層級">'+item("world","世界",true)+item("realm","所在政治體",!!h.realm)+item("province","所在行省",!!h.province)+item("local","所在當地",!!h.local)+'</nav>';
}
function filterButtons(){
 const values=state.level==="world"||state.level==="realm"?["all","capital","pass"]:["all","town","wild","dungeon"];
 return values.map(k=>'<button type="button" class="'+(state.filter===k?'is-active':'')+'" onclick="setMapSceneFilter(\''+k+'\')">'+(k==="all"?"全部":filters[k])+'</button>').join("");
}
function indexRows(){
 let rows=[];
 if(state.level==="world")rows=A(DB.realm_region_maps).filter(r=>r?.political_entity_id).map(r=>({id:r.id,name:r.name,meta:polity(r.political_entity_id)?.name||"政治體",action:"openMapScene('realm','"+safe(r.id)+"')"}));
 if(state.level==="realm")rows=A(DB.province_region_maps).filter(p=>p?.parent_realm_map_id===state.id).map(p=>({id:p.id,name:p.name,meta:(p.world_tier||p.tier||"—")+"級｜"+(p.map_status||"資料區"),action:"openMapScene('province','"+safe(p.id)+"')"}));
 if(state.level==="province")rows=provinceLocations(state.id).filter(l=>state.filter==="all"||l.kind===state.filter).map(l=>({id:l.id,name:l.name,meta:(kinds[l.kind]||"地點")+"｜"+locationTier(l)+"級"+(explicitPoint(l)?"｜已測繪":"｜資料待補"),action:"openMapScene('local','"+safe(l.id)+"')"}));
 if(state.level==="local")rows=A(loc(state.id)?.links).map(e=>({edge:e,row:loc(e.to)})).filter(x=>x.row).map(x=>({id:x.row.id,name:x.row.name,meta:(kinds[x.row.kind]||"地點")+"｜"+num(x.edge.hours).toFixed(1)+" 小時",action:"openMapScene('local','"+safe(x.row.id)+"')",travel:roadRoute(currentLocation()?.id,x.row.id)}));
 return rows.map(x=>'<div class="mapscene-index-row"><button type="button" onclick="'+x.action+'"><b>'+esc(x.name)+'</b><small>'+esc(x.meta)+'</small></button>'+(x.travel?'<button type="button" class="mapscene-travel" onclick="mapSceneTravel(\''+safe(x.id)+'\')">前往</button>':'')+'</div>').join("")||'<div class="mapscene-empty">目前層級沒有可驗證資料。</div>';
}
function layerSummary(){
 if(state.level==="world")return '<span>世界正史圖庫</span><b>'+A(DB.realm_region_maps).filter(x=>x?.political_entity_id).length+' 個政治體索引</b><i>點選中樞進入政治體級</i>';
 if(state.level==="realm"){const r=realm(state.id),ps=A(DB.province_region_maps).filter(x=>x?.parent_realm_map_id===r?.id);return '<span>政治體疆域圖面</span><b>'+ps.length+' 個行省索引</b><i>行省錨點只作行政定位，不代表精確測量</i>'}
 if(state.level==="province"){const p=province(state.id),ls=provinceLocations(p?.id),mapped=ls.filter(x=>explicitPoint(x)).length;return '<span>行省地形圖面</span><b>'+ls.length+' 個地點 · '+mapped+' 個已測繪</b><i>座標採 canonical／區域路網測繪稿</i>'}
 const l=loc(state.id),links=A(l?.links).filter(x=>loc(x.to)),surveyed=localLocations(state.id).filter(x=>explicitPoint(x)).length;return '<span>當地測繪圖面</span><b>'+links.length+' 條已建道路連線 · '+surveyed+' 個已測繪節點</b><i>所有目前可玩直連節點均有固定測繪座標</i>';
}
function legend(){
 return '<div class="mapscene-legend"><h3>圖例</h3><div><i class="ms-key ms-town"></i>城鎮／中樞</div><div><i class="ms-key ms-wild"></i>野外</div><div><i class="ms-key ms-dungeon"></i>地下城</div><div><i class="ms-line ms-road"></i>已建道路</div><div><i class="ms-line ms-river"></i>河川／湖泊</div><div><i class="ms-line ms-border"></i>疆域界線</div><p>可玩地點已完成固定區域路網測繪；座標用於連續圖面與點擊，不宣稱現實測地學精度。</p></div>';
}
function render(){
 const unknown=unmappedLocations().length;
 const note=state.level==="world"||state.level==="realm"?"疆域、河湖、山脈、道路與關隘均讀取世界正史圖庫。":unknown?"目前仍有"+unknown+"個可見地點缺少固定測繪座標；道路連線與旅行規則仍完全依 canonical links。":"目前可玩地點均已納入固定區域路網測繪稿；道路連線仍完全依 canonical links。";
 return '<div class="mapscene-shell" data-map-scene="2.2" data-map-level="'+state.level+'">'+tabs()+'<header class="mapscene-header"><div><span class="mapscene-kicker">CARTOGRAPHIC FIELD ATLAS · MAP‑SCENE 2.2</span><h2>'+esc(title())+'</h2><p>'+esc(note)+'</p></div><div class="mapscene-zoom"><button type="button" aria-label="縮小" onclick="zoomMapScene(-1)">−</button><output id="mapsceneZoom">'+Math.round(state.zoom*100)+'%</output><button type="button" aria-label="放大" onclick="zoomMapScene(1)">＋</button><button type="button" onclick="resetMapSceneView()">置中</button></div></header><div class="mapscene-layer-summary" data-map-layer-summary="'+state.level+'">'+layerSummary()+'</div><div class="mapscene-filter" role="group" aria-label="地標篩選">'+filterButtons()+'</div><div class="mapscene-layout"><section class="mapscene-stage" id="mapsceneStage"><canvas id="mapsceneCanvas" aria-label="'+esc(title())+'互動圖面"></canvas><div class="mapscene-compass" aria-hidden="true"><b>N</b><i></i></div><div class="mapscene-scale" id="mapsceneScale">拖曳平移・滾輪／雙指縮放</div></section><aside class="mapscene-sidebar">'+legend()+'<div class="mapscene-index-head"><h3>'+({world:"已知政治體",realm:"所轄行省",province:"行省地點",local:"相鄰道路"})[state.level]+'</h3>'+(unknown?'<span>'+unknown+' 資料待補</span>':'')+'</div><div class="mapscene-index">'+indexRows()+'</div></aside></div><footer class="mapscene-footer">旅行權限仍為 reachable_only：只有目前地點 links 中存在的直連道路可移動，並使用原始 hours。地圖顯示不會解鎖路線。</footer></div>';
}

function seeded(seed){let x=seed|0;return ()=>{x=(x*1664525+1013904223)|0;return (x>>>0)/4294967296}}
function hash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function path(ctx,points,close=false){const ps=pointList(points);if(!ps.length)return;ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i][0],ps[i][1]);if(close&&ctx.closePath)ctx.closePath()}
function pointInPolygon(x,y,points){let inside=false,ps=pointList(points);for(let i=0,j=ps.length-1;i<ps.length;j=i++){const a=ps[i],b=ps[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1]||1e-8)+a[0]))inside=!inside}return inside}
function scenePointInside(x,y,geoms){return geoms.some(g=>pointInPolygon(x,y,g.points))}
function setDash(ctx,a){if(typeof ctx.setLineDash==="function")ctx.setLineDash(a)}
function drawPolyline(ctx,f,color,width,dash=[]){const ps=pointList(f.points);if(ps.length<2)return;ctx.save();path(ctx,ps);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin="round";ctx.lineCap="round";setDash(ctx,dash);ctx.stroke();ctx.restore()}
function drawTerrain(ctx,b,geoms){
 ctx.fillStyle="#263d3c";ctx.fillRect(b.x,b.y,b.w,b.h);
 for(const g of geoms){path(ctx,g.points,true);ctx.fillStyle="#9a8c67";ctx.fill();ctx.strokeStyle="#e6dfc4";ctx.lineWidth=2;setDash(ctx,[7,6]);ctx.stroke();setDash(ctx,[])}
 const rnd=seeded(hash(geoms.map(g=>g.region_id).join("|")+state.level));
 const count=Math.min(1700,Math.max(320,Math.round(b.w*b.h/1800*Math.min(1.55,state.zoom))));
 for(let i=0;i<count;i++){
  const x=b.x+rnd()*b.w,y=b.y+rnd()*b.h;if(!scenePointInside(x,y,geoms))continue;
  const forest=rnd()>.52;
  ctx.globalAlpha=.18+rnd()*.22;ctx.strokeStyle=forest?"#263c2d":"#5d5135";ctx.fillStyle=forest?"#314936":"#695b38";ctx.lineWidth=.7;
  if(forest){ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x-3,y+3);ctx.lineTo(x+3,y+3);if(ctx.closePath)ctx.closePath();ctx.fill()}
  else{ctx.beginPath();ctx.moveTo(x-4,y-2);ctx.lineTo(x+4,y+2);ctx.stroke()}
 }
 ctx.globalAlpha=1;
 for(let i=0;i<18;i++){const y=b.y+(i+.4)*b.h/18;ctx.strokeStyle="rgba(62,49,31,.12)";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(b.x,y);for(let j=1;j<=12;j++)ctx.lineTo(b.x+b.w*j/12,y+Math.sin(i*3+j)*8);ctx.stroke()}
}
function drawWater(ctx){
 for(const f of visibleFeatures("rivers")){drawPolyline(ctx,f,"rgba(29,49,47,.55)",7);drawPolyline(ctx,f,"#8eb1ac",3)}
 for(const l of visibleFeatures("lakes")){ctx.beginPath();if(ctx.ellipse)ctx.ellipse(+l.cx,+l.cy,+l.rx,+l.ry,0,0,Math.PI*2);else ctx.arc(+l.cx,+l.cy,Math.max(+l.rx,+l.ry),0,Math.PI*2);ctx.fillStyle="#567c79";ctx.fill();ctx.strokeStyle="#bdd1c6";ctx.lineWidth=1.2;ctx.stroke()}
}
function drawTerrainFeatures(ctx){
 for(const f of visibleFeatures("mountain_ranges")){drawPolyline(ctx,f,"rgba(45,39,29,.6)",9);drawPolyline(ctx,f,"#c3b28e",2)}
 for(const f of visibleFeatures("major_roads")){drawPolyline(ctx,f,"rgba(48,35,21,.75)",7);drawPolyline(ctx,f,"#d7b47a",2.4,[7,5])}
}
function drawLocalRoutes(ctx){
 if(state.level!=="local")return;
 const center=loc(state.id),from=explicitPoint(center);if(!center||!from)return;
 for(const edge of A(center.links)){
  const target=loc(edge?.to),to=explicitPoint(target);if(!target||!to)continue;
  drawPolyline(ctx,{points:[[from.x,from.y],[to.x,to.y]]},"rgba(47,35,22,.82)",6);
  drawPolyline(ctx,{points:[[from.x,from.y],[to.x,to.y]]},"#e2c27d",2.2,[9,6]);
 }
}
function label(ctx,text,x,y,size=13,align="center"){
 const s=Math.max(.05,state.paintScale||1);ctx.save();ctx.font=`700 ${size/s}px Georgia, serif`;ctx.textAlign=align;ctx.textBaseline="middle";ctx.lineWidth=3.5/s;ctx.strokeStyle="rgba(29,24,18,.78)";if(ctx.strokeText)ctx.strokeText(String(text),x,y);ctx.fillStyle="#f0e7cc";ctx.fillText(String(text),x,y);ctx.restore();
}
function addHit(row,point,kind,level){state.hits.push({row,point,kind,level,r:14})}
function drawFeatureLabels(ctx,geoms){
 for(const g of geoms){const c=centroid(g.points),r=region(g.region_id);if(c&&r)label(ctx,r.name,c.x,c.y,Math.max(13,18/state.zoom))}
 if(state.zoom<1.05)return;
 for(const key of ["rivers","mountain_ranges","major_roads"]){for(const f of visibleFeatures(key,geoms)){const ps=pointList(f.points),p=ps[Math.floor(ps.length/2)];if(p&&f.name)label(ctx,f.name,p[0],p[1]-7,9)}}
}
function drawMarker(ctx,row,p,kind,level){
 if(!featureAllowed(kind))return;const color={town:"#e4c86f",wild:"#70a777",dungeon:"#a76854",capital:"#e4c86f",pass:"#cf814f"}[kind]||"#ddd";
 const s=Math.max(.05,state.paintScale||1);ctx.save();ctx.fillStyle=color;ctx.strokeStyle="#202a25";ctx.lineWidth=2.2/s;
 if(kind==="town"||kind==="capital"){
  const size=(kind==="capital"?8:6)/s;ctx.fillRect(p.x-size,p.y-size,size*2,size*2);ctx.strokeRect?.(p.x-size,p.y-size,size*2,size*2);
  if(state.zoom>=1.2){ctx.fillRect(p.x-size-7/s,p.y+2/s,5/s,5/s);ctx.fillRect(p.x+size+2/s,p.y-4/s,4/s,6/s);ctx.fillRect(p.x-2/s,p.y-size-7/s,5/s,4/s)}
 }else if(kind==="dungeon"){
  ctx.beginPath();ctx.moveTo(p.x,p.y-7/s);ctx.lineTo(p.x+7/s,p.y);ctx.lineTo(p.x,p.y+7/s);ctx.lineTo(p.x-7/s,p.y);ctx.closePath?.();ctx.fill();ctx.stroke();
 }else{ctx.beginPath();ctx.arc(p.x,p.y,5.5/s,0,Math.PI*2);ctx.fill();ctx.stroke()}
 ctx.restore();label(ctx,row.name||row.id,p.x,p.y-14/s,10);addHit(row,p,kind,level);
}
function drawMarkers(ctx,geoms){
 state.hits=[];
 if(state.level==="world"){
  const seen=new Set();for(const r of A(DB.realm_region_maps)){const pid=r?.political_entity_id;if(!pid||seen.has(pid))continue;const gs=geoms.filter(g=>polityIdOfGeometry(g)===pid),c=centroid(gs.flatMap(g=>g.points));if(!c)continue;seen.add(pid);drawMarker(ctx,r,c,"capital","realm")}
 }else if(state.level==="realm"){
  const r=realm(state.id);for(const p of A(DB.province_region_maps).filter(x=>x.parent_realm_map_id===r?.id)){const atlas=provinceAtlasEntry(p.id),gs=geoms.filter(g=>g.region_id===(p.world_region_id||p.region_id)),c=atlas?.anchor?{x:+atlas.anchor.x,y:+atlas.anchor.y}:centroid(gs.flatMap(g=>g.points));if(c)drawMarker(ctx,p,c,"capital","province")}
 }
 if(state.level==="world"||state.level==="realm")for(const c of visibleFeatures("capitals",geoms)){if(Number.isFinite(+c.x)&&Number.isFinite(+c.y))drawMarker(ctx,c,{x:+c.x,y:+c.y},"capital","realm")}
 for(const p of visibleFeatures("border_passes",geoms)){const q=explicitPoint(p)||Number.isFinite(+p.x)&&Number.isFinite(+p.y)&&{x:+p.x,y:+p.y};if(q)drawMarker(ctx,p,q,"pass",state.level)}
 for(const x of mappedLocations())drawMarker(ctx,x.row,x.point,x.row.kind,"local");
}
function paint(){
 if(typeof document==="undefined")return false;const canvas=document.getElementById("mapsceneCanvas"),stage=document.getElementById("mapsceneStage");if(!canvas||!stage||typeof canvas.getContext!=="function")return false;
 const ctx=canvas.getContext("2d");if(!ctx)return false;const rect=stage.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1),w=Math.max(320,Math.round(rect.width||900)),h=Math.max(360,Math.round(rect.height||620));
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px"}
 if(ctx.setTransform)ctx.setTransform(dpr,0,0,dpr,0,0);else if(ctx.scale)ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
 const geoms=sceneGeometries(),b=boundsFor(geoms),fit=Math.min(w/b.w,h/b.h)*.92,scale=fit*state.zoom,ox=(w-b.w*scale)/2-b.x*scale+state.panX,oy=(h-b.h*scale)/2-b.y*scale+state.panY;
 state.paintScale=scale;ctx.save();if(ctx.translate)ctx.translate(ox,oy);if(ctx.scale)ctx.scale(scale,scale);drawTerrain(ctx,b,geoms);drawWater(ctx);drawTerrainFeatures(ctx);drawLocalRoutes(ctx);drawFeatureLabels(ctx,geoms);drawMarkers(ctx,geoms);ctx.restore();
 state.transform={scale,ox,oy,w,h};const out=document.getElementById("mapsceneZoom");if(out)out.textContent=Math.round(state.zoom*100)+"%";return true;
}
function activateHit(clientX,clientY){
 const canvas=document.getElementById("mapsceneCanvas"),t=state.transform;if(!canvas||!t)return;const r=canvas.getBoundingClientRect(),x=(clientX-r.left-t.ox)/t.scale,y=(clientY-r.top-t.oy)/t.scale;
 let best=null,dist=Infinity;for(const h of state.hits){const d=Math.hypot(x-h.point.x,y-h.point.y);if(d<dist&&d<18/t.scale){best=h;dist=d}}
 if(!best)return;if(best.level==="realm"){const id=best.row.id||realmForPolity(best.row.political_entity_id)?.id;if(id)open("realm",id)}else if(best.level==="province")open("province",best.row.id);else if(best.level==="local")open("local",best.row.id);
}
function mount(){
 state.mounted=true;if(typeof document==="undefined")return false;const canvas=document.getElementById("mapsceneCanvas"),stage=document.getElementById("mapsceneStage");if(!canvas||!stage)return false;let drag=null,moved=false;
 canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture?.(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===1){drag={x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};moved=false}else if(state.pointers.size===2){const ps=[...state.pointers.values()];state.pinch={distance:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),zoom:state.zoom}}});
 canvas.addEventListener("pointermove",e=>{if(!state.pointers.has(e.pointerId))return;state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===2&&state.pinch){const ps=[...state.pointers.values()],d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);state.zoom=clamp(state.pinch.zoom*d/Math.max(1,state.pinch.distance),.65,5);moved=true;paint()}else if(drag){state.panX=drag.px+e.clientX-drag.x;state.panY=drag.py+e.clientY-drag.y;moved=moved||Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5;paint()}});
 const end=e=>{state.pointers.delete(e.pointerId);if(!moved&&drag)activateHit(e.clientX,e.clientY);if(state.pointers.size<2)state.pinch=null;if(!state.pointers.size)drag=null};canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
 canvas.addEventListener("wheel",e=>{e.preventDefault();state.zoom=clamp(state.zoom*(e.deltaY>0?.88:1.14),.65,5);paint()},{passive:false});
 if(typeof ResizeObserver==="function")new ResizeObserver(()=>paint()).observe(stage);paint();return true;
}
function show(){if(typeof globalThis.showModal!=="function")return false;globalThis.showModal(title(),render());if(typeof requestAnimationFrame==="function")requestAnimationFrame(mount);else if(typeof setTimeout==="function")setTimeout(mount,0);return true}
function open(level,id){
 const valid=["world","realm","province","local"].includes(level)?level:"world";
 const current=currentLocation();
 if(valid==="realm"&&!id)id=realmForLocation(current)?.id||null;
 if(valid==="province"&&!id)id=provinceForLocation(current)?.id||null;
 if(valid==="local"&&!id)id=current?.id||null;
 if(valid==="world"){state.level="world";state.id=null}
 else if(valid==="realm"&&(realm(id)||realmForPolity(id))){state.level=valid;state.id=realm(id)?.id||realmForPolity(id)?.id}
 else if(valid==="province"&&province(id)){state.level=valid;state.id=id}
 else if(valid==="local"&&loc(id)){state.level=valid;state.id=id}
 else return false;
 state.filter="all";state.zoom=1;state.panX=0;state.panY=0;state.selected=null;return show();
}
function setFilter(filter){state.filter=["all","town","wild","dungeon","capital","pass"].includes(filter)?filter:"all";const root=typeof document!=="undefined"&&document.querySelector?.(".mapscene-shell");if(root)show();return true}
function zoom(step){state.zoom=clamp(state.zoom+(Number(step)||0)*.25,.65,5);paint();return true}
function reset(){state.zoom=1;state.panX=0;state.panY=0;paint();return true}
function audit(){
 const issues=[];if(!worldGeometries().length)issues.push("canonical world geometry missing");if(!A(DB.realm_region_maps).length)issues.push("realm data missing");if(!A(DB.province_region_maps).length)issues.push("province data missing");
 const unsafe=A(DB.locations).filter(l=>explicitPoint(l)&&(!Number.isFinite(explicitPoint(l).x)||!Number.isFinite(explicitPoint(l).y)));if(unsafe.length)issues.push("invalid surveyed coordinates");
 const survey=DB.map_survey_completion||{};if(survey.status!=="complete_for_current_playable_locations")issues.push("playable location survey completion missing");
 if((survey.unresolved_location_ids||[]).length)issues.push("unresolved surveyed location ids:"+survey.unresolved_location_ids.slice(0,200).join(","));
 return {revision:REV,pass:!issues.length,issues,renderer:"continuous-canvas",hierarchy:"world→realm→province→local",coordinate_policy:"canonical_or_sourced_or_authored_regional_route_survey",survey_revision:survey.version||null,surveyed_location_count:Number(survey.location_count||0),travel_visibility:"reachable_only",save_compatible:true,legacy_renderer_active:false};
}

globalThis.openMapScene=open;globalThis.setMapSceneFilter=setFilter;globalThis.zoomMapScene=zoom;globalThis.resetMapSceneView=reset;globalThis.mapSceneTravel=travelTo;globalThis.runMapSceneV2Audit=audit;
globalThis.openWorldMapAtlas=()=>open("world");globalThis.openWorldMapHierarchy=()=>open("world");globalThis.openRegionMapGraphic=(level,id)=>open(level,id);globalThis.openRealmRegionMap=id=>open("realm",id);globalThis.openProvinceRegionMap=id=>open("province",id);
globalThis.openSettlementRegionMap=id=>{const sm=settlementMap(id);if(sm?.center_location_id&&loc(sm.center_location_id))return open("local",sm.center_location_id);if(sm?.parent_province_region_id)return open("province",sm.parent_province_region_id);const l=loc(id);return l?open("local",l.id):false};globalThis.openMap=()=>{const l=currentLocation();return l?open("local",l.id):open("world")};globalThis.openMapLocationDetail=id=>open("local",id);
globalThis.openProvinceCategoryMap=(id,kind)=>{const ok=open("province",id);if(ok&&["town","wild","dungeon"].includes(kind)){state.filter=kind;return show()}return ok};globalThis.openProvinceTerrainMap=globalThis.openProvinceCategoryMap;
globalThis.openWorldMapProvinceAtlas=()=>open("world");globalThis.openWorldMapProvinceDetails=id=>open("province",id);globalThis.openWorldMapWilderness=id=>loc(id)?open("local",id):open("world");globalThis.openWorldMapPass=()=>open("world");
globalThis.openWorldMapPolityTerritory=pid=>{const r=realmForPolity(pid);return r?open("realm",r.id):open("world")};globalThis.openWorldMapNonStateRegion=rid=>{const r=A(DB.realm_region_maps).find(x=>x.world_region_id===rid||A(x.world_region_ids).includes(rid));return r?open("realm",r.id):open("world")};
// 舊版函式只保留為相容轉接名稱；正式載入不再包含舊 renderer。
globalThis.openWitcherMap=open;globalThis.witcherMapTravel=travelTo;globalThis.setWitcherMapFilter=setFilter;globalThis.changeWitcherMapZoom=zoom;
DB.meta=DB.meta||{};DB.meta.map_scene_revision=REV;DB.meta.map_renderer="continuous-canvas";DB.meta.witcher_map_core_active=false;DB.meta.map_scene_coordinate_policy="canonical_or_sourced_or_authored_regional_route_survey";
globalThis.QUNLU_CORE?.registerModule?.("src/map-scene-v2.js",{domain:"world",revision:REV,release:RELEASE,renderer:"continuous-canvas",legacy_renderer_active:false});
globalThis.QUNLU_CORE?.registerAudit?.("runMapSceneV2Audit",audit);
})();
