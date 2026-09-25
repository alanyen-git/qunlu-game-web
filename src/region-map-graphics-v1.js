/* 群陸旅誌：王國／行省／當地三級圖面 CURRENT-2.15.2
 * REGION-MAP-GRAPHICS-1.3
 * 王國使用既有正史疆域座標；未建立地理座標的行省與地方使用實際links路網示意，
 * 不推造城鎮方位、不改旅行權限、不寫入存檔。
 */
(()=>{
"use strict";
const REV="REGION-MAP-GRAPHICS-1.3";
const TIER_COLOR={F:"#79ae79",E:"#9ec47d",D:"#c3b778",C:"#d8a565",B:"#dd8876",A:"#ca83a6",S:"#b68ee5"};
const D=()=>typeof DB!=="undefined"?DB:null;
const player=()=>typeof G!=="undefined"?G?.character:null;
const array=v=>Array.isArray(v)?v:[];
const find=(key,id)=>array(D()?.[key]).find(x=>x?.id===id)||null;
const loc=id=>find("locations",id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeId=v=>String(v??"").replace(/[^a-zA-Z0-9_-]/g,"");
const num=(v,alt=0)=>Number.isFinite(Number(v))?Number(v):alt;
const coord=n=>Math.round(num(n)*10)/10;
const tier=l=>l?.kind==="town"?(l.settlement_world_tier||l.tier||"F"):(l?.tier||"F");
const color=l=>TIER_COLOR[tier(l)]||TIER_COLOR.F;
const kind=k=>({town:"城鎮",wild:"野外",dungeon:"地下城"})[k]||"地點";
const go=(level,id)=>"openRegionMapGraphic('"+level+"','"+safeId(id)+"')";
const detail=id=>"openMapLocationDetail('"+safeId(id)+"')";
const linkLabel=h=>Number.isFinite(Number(h))?esc(h)+" 小時":"時間未建檔";
function shortestRoadRoute(fromId,toId){
 if(!fromId||!toId)return null;if(fromId===toId)return {path:[fromId],hours:0};
 const dist=new Map([[fromId,0]]),prev=new Map(),open=new Set([fromId]);
 while(open.size){let at=null,best=Infinity;for(const id of open){if(dist.get(id)<best){at=id;best=dist.get(id)}}if(at===toId)break;open.delete(at);
  for(const edge of array(loc(at)?.links)){const next=loc(edge.to),hours=Number(edge.hours);if(!next||!Number.isFinite(hours)||hours<0)continue;const cost=best+hours;if(cost<(dist.get(edge.to)??Infinity)){dist.set(edge.to,cost);prev.set(edge.to,at);open.add(edge.to)}}
 }
 if(!dist.has(toId))return null;const path=[toId];while(path[0]!==fromId){const parent=prev.get(path[0]);if(!parent)return null;path.unshift(parent)}return {path,hours:dist.get(toId)}
}
function activateRegionMapNode(id){
 const l=loc(id),c=player();if(!l)return false;
 if(l.kind==="town"&&c?.locationId!==id){const route=shortestRoadRoute(c?.locationId,id);if(route&&typeof globalThis.travel==="function")return globalThis.travel(id,route.hours,{mapRoute:true,path:route.path})}
 return typeof globalThis.openMapLocationDetail==="function"?globalThis.openMapLocationDetail(id):false
}
globalThis.travelMapRoute=id=>{const l=loc(id),c=player(),route=shortestRoadRoute(c?.locationId,id);if(l?.kind!=="town"||!route||c?.locationId===id)return false;return globalThis.travel(id,route.hours,{mapRoute:true,path:route.path})};

let ZOOM=1,FIT_MODE=true;
const shell=(svg,note)=>{ZOOM=1;FIT_MODE=true;return '<div class="regionmap-toolbar actions" role="group" aria-label="地圖縮放"><button type="button" onclick="changeRegionMapZoom(-1)" aria-label="縮小地圖">－</button><button type="button" class="regionmap-zoom-level" id="regionmapZoomLevel" onclick="resetRegionMapView()" title="點按還原100%縮放" aria-label="目前縮放比例，點按還原100%">100%</button><button type="button" onclick="changeRegionMapZoom(1)" aria-label="放大地圖">＋</button><button type="button" class="regionmap-fit" onclick="fitRegionMapView()" aria-label="將整張地圖縮放至可完整顯示">完整顯示</button></div><div class="regionmap-scroll" tabindex="0" aria-label="地圖可上下左右捲動；點完整顯示可看完整圖">'+svg+'</div><div class="regionmap-legend small">按「完整顯示」可看到整張圖；點百分比還原100%，放大後可上下左右滑動。<br>'+note+'</div>'};
const svgStart=(w,h,label,view)=>'<svg class="regionmap-svg" viewBox="'+(view||"0 0 "+w+" "+h)+'" role="img" aria-label="'+esc(label)+'" xmlns="http://www.w3.org/2000/svg"><rect x="'+(view?view.split(" ")[0]:"0")+'" y="'+(view?view.split(" ")[1]:"0")+'" width="'+(view?view.split(" ")[2]:w)+'" height="'+(view?view.split(" ")[3]:h)+'" fill="#101b1b"></rect>';
const poly=points=>array(points).filter(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])).map(p=>coord(p[0])+","+coord(p[1])).join(" ");
const label=(x,y,value,size=15)=>'<text x="'+coord(x)+'" y="'+coord(y)+'" text-anchor="middle" fill="#f3f0d8" font-size="'+size+'" font-weight="700" pointer-events="none">'+esc(value)+'</text>';
const pointName=(text,max=13)=>Array.from(String(text||"")).slice(0,max).join("")+(Array.from(String(text||"")).length>max?"…":"");
function mapElements(){
 if(typeof document==="undefined")return null;
 const svg=document.querySelector("#modalBody .regionmap-svg"),scroll=svg?.closest(".regionmap-scroll");
 return svg&&scroll?{svg,scroll}:null;
}
function applyZoom(value,fitMode=false){
 const els=mapElements();if(!els)return;
 const {svg,scroll}=els;
 const baseWidth=Math.max(660,scroll.clientWidth-16);
 ZOOM=Math.max(.15,Math.min(2.5,Number(value)||1));FIT_MODE=fitMode;
 svg.style.width=Math.round(baseWidth*ZOOM)+"px";
 svg.style.minWidth="0";
 svg.style.maxWidth="none";
 svg.style.height="auto";
 svg.dataset.mapZoom=String(ZOOM);
 svg.dataset.fitMode=fitMode?"true":"false";
 const counter=document.getElementById("regionmapZoomLevel");
 if(counter)counter.textContent=Math.round(ZOOM*100)+"%";
 scroll.scrollLeft=0;scroll.scrollTop=0;
}
function fitZoom(){
 const els=mapElements();if(!els)return;
 const {svg,scroll}=els,vb=svg.viewBox.baseVal;
 if(!vb?.width||!vb?.height)return;
 const viewportHeight=globalThis.visualViewport?.height||globalThis.innerHeight||700;
 const mobile=(globalThis.innerWidth||700)<=620;
 const budgetHeight=Math.min(viewportHeight*(mobile ? .38 : .56),mobile?440:610);
 const baseWidth=Math.max(660,scroll.clientWidth-16);
 const fit=Math.min(1,(scroll.clientWidth-18)/baseWidth,budgetHeight*vb.width/(baseWidth*vb.height));
 applyZoom(Math.max(.15,fit),true);
}
function scheduleFit(){
 if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>fitZoom());
 else fitZoom();
}
function changeZoom(step,reset=false){
 const els=mapElements();if(!els)return;
 const current=Number(els.svg.dataset.mapZoom)||ZOOM;
 const delta=current<.75 ? .10 : .25;
 applyZoom(reset?1:current+step*delta,false);
}

function setKindFilter(kind){
 if(typeof document==="undefined")return;
 const root=document.getElementById("modalBody");if(!root)return;
 const selected=["town","wild","dungeon"].includes(kind)?kind:"all";
 for(const node of root.querySelectorAll(".regionmap-province .regionmap-node")){
  node.style.opacity=selected==="all"||node.dataset.mapKind===selected?"1":".18";
  node.style.pointerEvents=selected==="all"||node.dataset.mapKind===selected?"auto":"none";
 }
 for(const road of root.querySelectorAll(".regionmap-province .regionmap-road")){
  road.style.opacity=selected==="all"||road.dataset.fromKind===selected||road.dataset.toKind===selected?".72":".1";
 }
 for(const section of root.querySelectorAll(".regionmap-category"))section.hidden=selected!=="all"&&section.dataset.mapKind!==selected;
 for(const button of root.querySelectorAll("[data-regionmap-filter]")){
  const yes=button.dataset.regionmapFilter===selected;button.classList.toggle("primary",yes);button.setAttribute("aria-pressed",String(yes));
 }
}
function currentAction(l){
 const c=player(),current=loc(c?.locationId);if(!current||!l||current.id===l.id)return "";
 if(l.kind==="town"){const route=shortestRoadRoute(current.id,l.id);return route?'<button type="button" onclick="travelMapRoute(\''+safeId(l.id)+'\')">前往 '+esc((route.path.length-1)+' 段路・'+route.hours.toFixed(1)+' 小時')+'</button>':""}
 const edge=array(current.links).find(x=>x.to===l.id);return edge?'<button type="button" onclick="travel(\''+safeId(l.id)+'\','+num(edge.hours,1)+')">前往 '+linkLabel(edge.hours)+'</button>':""
}
function rowsToButtons(rows,level){
 return rows.map(x=>'<div class="itemrow"><span><b>'+esc(x.name||x.id)+'</b> <span class="tier">'+esc(x.world_tier||x.tier||"—")+'</span></span><button type="button" onclick="'+go(level,x.id)+'">圖面顯示</button></div>').join("");
}
function realmGraphic(realmId){
 const r=find("realm_region_maps",realmId),db=D(),geo=db?.world_geopolitical_map;
 if(!r||!geo)return false;
 const pid=r.political_entity_id,p=find("political_entities",pid),merged=db.political_merge_map||{};
 const canonical=v=>merged[v]||v;
 const same=g=>canonical(g.political_entity_id||find("world_regions",g.region_id)?.political_entity_id)===pid;
 const layer=pid==="POL-020"?"subterranean":"surface";
 const geoms=array(geo.region_geometry).filter(g=>g?.layer===layer&&!g.nonstate&&same(g));
 const provinces=array(r.province_region_ids).map(id=>find("province_region_maps",id)).filter(Boolean);
 const linkBack='<div class="actions"><button type="button" onclick="openRealmRegionMap(\''+safeId(r.id)+'\')">返回區域清單</button><button type="button" onclick="openWorldMapAtlas(\''+(layer==="surface"?"surface":"subterranean")+'\')">世界圖面</button></div>';
 if(!geoms.length){
  showModal((p?.name||r.name)+"・王國級圖面",linkBack+'<div class="card small">本政體尚無精確疆域幾何資料；以下保留已建檔的行省入口，不補造位置。</div>'+rowsToButtons(provinces,"province"));
  return true;
 }
 const points=geoms.flatMap(g=>array(g.points)).filter(q=>Array.isArray(q)&&Number.isFinite(+q[0])&&Number.isFinite(+q[1]));
 if(!points.length)return false;
 const minX=Math.min(...points.map(q=>+q[0]))-48,maxX=Math.max(...points.map(q=>+q[0]))+48;
 const minY=Math.min(...points.map(q=>+q[1]))-48,maxY=Math.max(...points.map(q=>+q[1]))+48;
 const vb=[coord(minX),coord(minY),coord(maxX-minX),coord(maxY-minY)].join(" ");
 const ridSet=new Set(geoms.map(g=>g.region_id));
 const parts=[svgStart(900,600,(p?.name||r.name)+"正史疆域",vb)];
 // 這些地理線僅在圖庫確認關聯到本國大區時繪製；位置沿用世界圖庫。
 for(const [key,stroke,width,dash] of [["mountain_ranges","#ac9c80",7,""],["rivers","#79b9d0",5,""],["major_roads","#d5b66f",4,' stroke-dasharray="9 7"']]){
  for(const f of array(geo[key]).filter(x=>array(x.regions).some(id=>ridSet.has(id)))){
   if(!array(f.points).length)continue;
   parts.push('<polyline points="'+poly(f.points)+'" fill="none" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"'+dash+' opacity=".82"><title>'+esc(f.name)+'</title></polyline>');
  }
 }
 for(const g of geoms){
  parts.push('<polygon points="'+poly(g.points)+'" fill="#47735b" fill-opacity=".66" stroke="#d3d6b8" stroke-width="3"><title>'+esc(find("world_regions",g.region_id)?.name||p?.name||g.region_id)+'</title></polygon>');
 }
 const cap=array(geo.capitals).find(c=>c.political_entity_id===pid&&Number.isFinite(+c.x)&&Number.isFinite(+c.y));
 if(cap){
  parts.push('<circle cx="'+coord(cap.x)+'" cy="'+coord(cap.y)+'" r="9" fill="#efd68c" stroke="#232d25" stroke-width="3"></circle>');
  parts.push(label(cap.x,cap.y-17,cap.name||p?.capital||"統治中樞",Math.max(11,Math.min(20,(maxX-minX)/22))));
 }
 // 行省點落在既有大區幾何中心；沒有對應幾何時只保留清單，不推造位置。
 const provinceByRegion=new Map(provinces.filter(x=>x.world_region_id).map(x=>[x.world_region_id,x]));
 for(const g of geoms){
  const province=provinceByRegion.get(g.region_id),coords=array(g.points).filter(q=>Array.isArray(q)&&Number.isFinite(+q[0])&&Number.isFinite(+q[1]));
  if(!province||!coords.length)continue;
  const cx=coords.reduce((a,q)=>a+ +q[0],0)/coords.length,cy=coords.reduce((a,q)=>a+ +q[1],0)/coords.length;
  parts.push('<g class="regionmap-node" role="link" tabindex="0" onclick="'+go("province",province.id)+'"><title>'+esc(province.name+"｜行省所在大區")+'</title><circle cx="'+coord(cx)+'" cy="'+coord(cy)+'" r="10" fill="#e9bc64" stroke="#273027" stroke-width="3"></circle>'+label(cx,cy-15,province.name,14)+'</g>');
 }
 // 北向固定與世界圖相同；不要把省份清單的順序偽裝成地理位置。
 const nx=maxX-30,ny=minY+20;
 parts.push('<path d="M '+coord(nx)+' '+coord(ny+45)+' L '+coord(nx)+' '+coord(ny+4)+'" stroke="#e7e8d5" stroke-width="3"></path>');
 parts.push('<path d="M '+coord(nx-8)+' '+coord(ny+12)+' L '+coord(nx)+' '+coord(ny)+' L '+coord(nx+8)+' '+coord(ny+12)+' Z" fill="#e7e8d5"></path>');
 parts.push(label(nx,ny+63,"北 N",13));
 parts.push("</svg>");
 const note="實線為正史疆域｜金點為首都／統治中樞｜褐線山脈、藍線河流、虛金線道路；行省精確邊界尚未建檔，不以假座標呈現。";
 const body=linkBack+'<div class="card small"><b>'+esc(p?.name||r.name)+'</b>｜'+esc(p?.government_type||"")+'｜'+esc(r.world_tier||p?.world_tier||"—")+'級</div>'+shell(parts.join(""),note)+'<h3>所轄行省</h3>'+(rowsToButtons(provinces,"province")||'<div class="card small">尚無行省級圖面資料。</div>');
 showModal((p?.name||r.name)+"・王國級圖面",body);scheduleFit();
 return true;
}
function provinceLocations(p){
 const groups=[
  ["town",p.all_settlement_ids||[p.capital_location_id,...array(p.peer_city_ids),...array(p.subordinate_settlement_ids)]],
  ["wild",p.wild_location_ids],["dungeon",p.dungeon_location_ids]
 ];
 const taken=new Set(),out=[];
 for(const [type,ids] of groups)for(const id of array(ids)){
  if(taken.has(id))continue;
  const row=loc(id);if(!row)continue;taken.add(id);
  out.push({...row,mapType:["town","wild","dungeon"].includes(row.kind)?row.kind:type});
 }
 return out;
}
function provinceGraphic(provinceId){
 const p=find("province_region_maps",provinceId);if(!p)return false;
 const nodes=provinceLocations(p),columns=["town","wild","dungeon"],xBy={town:155,wild:475,dungeon:795},pos=new Map();
 const nmax=Math.max(1,...columns.map(k=>nodes.filter(n=>n.mapType===k).length));
 const h=Math.max(430,nmax*88+96);
 for(const k of columns){
  const rows=nodes.filter(n=>n.mapType===k);
  rows.forEach((n,i)=>pos.set(n.id,{x:xBy[k],y:(i+1)*h/(rows.length+1)}));
 }
 const parts=[svgStart(960,h,p.name+"行省路網示意").replace('class="regionmap-svg"','class="regionmap-svg regionmap-province"')],seen=new Set();
 for(const n of nodes)for(const edge of array(n.links)){
  const a=pos.get(n.id),b=pos.get(edge.to),key=[n.id,edge.to].sort().join("|");
  if(!a||!b||seen.has(key)||n.id===edge.to)continue;seen.add(key);
  parts.push('<line class="regionmap-road" data-from-kind="'+esc(n.mapType)+'" data-to-kind="'+esc(nodes.find(x=>x.id===edge.to)?.mapType||"")+'" x1="'+coord(a.x)+'" y1="'+coord(a.y)+'" x2="'+coord(b.x)+'" y2="'+coord(b.y)+'" stroke="#8c997f" stroke-width="2.2" opacity=".72"><title>'+esc(n.name+" ↔ "+(loc(edge.to)?.name||edge.to))+'</title></line>');
 }
 for(const k of columns)parts.push(label(xBy[k],31,kind(k),24));
 for(const n of nodes){
  const pt=pos.get(n.id),isHere=player()?.locationId===n.id,c=color(n),id=safeId(n.id);
  parts.push('<g role="link" tabindex="0" class="regionmap-node" data-map-kind="'+esc(n.mapType)+'" onclick="'+(n.mapType==="town"?"activateRegionMapNode('"+id+"')":detail(id))+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+(n.mapType==="town"?"activateRegionMapNode('"+id+"')":detail(id))+'}"><title>'+esc(n.name+"｜"+kind(n.mapType)+"｜"+tier(n))+'</title><rect x="'+coord(pt.x-112)+'" y="'+coord(pt.y-26)+'" width="224" height="56" rx="13" fill="'+(isHere?"#314d36":"#20312b")+'" stroke="'+(isHere?"#f2cf7b":c)+'" stroke-width="'+(isHere?4:2)+'"></rect>'+label(pt.x,pt.y-3,pointName(n.name),16)+label(pt.x,pt.y+17,tier(n)+(isHere?"｜目前位置":""),12)+'</g>');
 }
 parts.push("</svg>");
 const grouped=columns.map(k=>{
  const values=nodes.filter(n=>n.mapType===k);
  return '<section class="regionmap-category" data-map-kind="'+k+'"><h3>'+kind(k)+'（'+values.length+'）</h3>'+values.map(n=>'<div class="itemrow"><span><b>'+esc(n.name)+'</b> <span class="tier">'+esc(tier(n))+'</span></span><div class="actions"><button type="button" onclick="'+detail(n.id)+'">地點資料</button>'+currentAction(n)+'</div></div>').join("")+'</section>';
 }).join("");
 const realm=find("realm_region_maps",p.parent_realm_map_id),back=realm?'<button type="button" onclick="'+go("realm",realm.id)+'">王國級圖面</button>':"";
 const body='<div class="actions"><button type="button" onclick="openProvinceRegionMap(\''+safeId(p.id)+'\')">返回行省清單</button>'+back+'</div><div class="card small"><b>'+esc(p.name)+'</b>｜'+esc(p.administrative_type||"")+'｜已建檔地點 '+nodes.length+'</div>'+
  '<div class="regionmap-filters actions" role="group" aria-label="地圖分類"><button type="button" class="primary" data-regionmap-filter="all" aria-pressed="true" onclick="setRegionMapKindFilter(\'all\')">全部</button><button type="button" data-regionmap-filter="town" aria-pressed="false" onclick="setRegionMapKindFilter(\'town\')">城鎮</button><button type="button" data-regionmap-filter="wild" aria-pressed="false" onclick="setRegionMapKindFilter(\'wild\')">野外</button><button type="button" data-regionmap-filter="dungeon" aria-pressed="false" onclick="setRegionMapKindFilter(\'dungeon\')">地下城</button></div>'+shell(parts.join(""),"依城鎮／野外／地下城分欄的路網示意。篩選只影響顯示，不改變通行權限；線段只代表資料庫中已建檔道路。只有角色目前位置直接相連的地點才會出現「前往」。")+
  (nodes.length?grouped:'<div class="card small">本行省尚無已建立的可玩地點。</div>');
 showModal(p.name+"・行省級圖面",body);scheduleFit();return true;
}
function localGraphic(locationId){
 const l=loc(locationId);if(!l)return false;
 const links=array(l.links).map(edge=>({...edge,target:loc(edge.to)})).filter(x=>x.target);
 const half=Math.ceil(links.length/2),h=Math.max(450,half*78+124),center={x:450,y:h/2};
 const parts=[svgStart(900,h,l.name+"周邊道路示意")];
 const placed=links.map((e,i)=>({e,x:i%2===0?167:733,y:(Math.floor(i/2)+1)*h/(half+1)}));
 for(const {e,x,y} of placed){
  parts.push('<path d="M 450 '+coord(center.y)+' L '+coord(x)+' '+coord(y)+'" fill="none" stroke="#9ca889" stroke-width="3" stroke-linecap="round"></path>');
  parts.push(label((center.x+x)/2,(center.y+y)/2-9,(Number.isFinite(Number(e.hours))?e.hours+"h":"道路"),13));
 }
 for(const {e,x,y} of placed){
  const n=e.target,id=safeId(n.id),c=color(n),isHere=player()?.locationId===id;
  parts.push('<g class="regionmap-node" role="link" tabindex="0" onclick="'+(n.kind==="town"?"activateRegionMapNode('"+id+"')":detail(id))+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+(n.kind==="town"?"activateRegionMapNode('"+id+"')":detail(id))+'}"><title>'+esc(n.name+"｜"+kind(n.kind)+"｜"+tier(n))+'</title><rect x="'+coord(x-115)+'" y="'+coord(y-26)+'" width="230" height="55" rx="12" fill="'+(isHere?"#344b37":"#24352e")+'" stroke="'+(isHere?"#f2cf7b":c)+'" stroke-width="2.5"></rect>'+label(x,y-3,pointName(n.name),16)+label(x,y+17,kind(n.kind)+" "+tier(n),12)+'</g>');
 }
 const here=player()?.locationId===l.id;
 parts.push('<circle cx="450" cy="'+coord(center.y)+'" r="56" fill="#355743" stroke="#efd38a" stroke-width="4"></circle>');
 parts.push(label(450,center.y-7,pointName(l.name,10),17));
 parts.push(label(450,center.y+17,(here?"你的位置｜":"中心｜")+tier(l),12));
 parts.push("</svg>");
 const back=l.province_region_id?'<button type="button" onclick="'+go("province",l.province_region_id)+'">行省級圖面</button>':"";
 const rows=links.map(e=>'<div class="itemrow"><span><b>'+esc(e.target.name)+'</b> <span class="tier">'+esc(tier(e.target))+'</span><br><span class="small">'+kind(e.target.kind)+'｜'+linkLabel(e.hours)+'</span></span><div class="actions"><button type="button" onclick="'+detail(e.target.id)+'">地點資料</button>'+currentAction(e.target)+'</div></div>').join("");
 const body='<div class="actions"><button type="button" onclick="'+detail(l.id)+'">返回地點資料</button>'+back+'</div><div class="card small"><b>'+esc(l.name)+'</b>｜'+kind(l.kind)+'｜安全度 '+esc(l.safety_score??"未建檔")+'/100｜直連道路 '+links.length+'</div>'+
  shell(parts.join(""),"中央為檢視地點；線段為此地點確實登記的外出路線，標示單程旅行時間。此圖為路網示意，未建檔的道路與隱藏區域不會捏造顯示。")+
  '<h3>已知直連地點</h3>'+(rows||'<div class="card small">尚無已建檔的直連道路。</div>');
 showModal(l.name+"・當地圖面",body);scheduleFit();return true;
}
function open(level,id){
 if(typeof showModal!=="function")return false;
 if(level==="realm")return realmGraphic(id);
 if(level==="province")return provinceGraphic(id);
 if(level==="local")return localGraphic(id);
 return false;
}
function audit(){
 const db=D(),issues=[];
 if(!db?.world_geopolitical_map?.region_geometry)issues.push("世界正史疆域圖缺失");
 if(!Array.isArray(db?.realm_region_maps))issues.push("王國／政體級圖資料缺失");
 if(!Array.isArray(db?.province_region_maps))issues.push("行省級圖資料缺失");
 if(!Array.isArray(db?.locations))issues.push("當地圖資料缺失");
 if(typeof globalThis.openRegionMapGraphic!=="function")issues.push("三級圖面入口缺失");
 return {revision:REV,pass:!issues.length,issues,save_compatible:true};
}
globalThis.openRegionMapGraphic=open;
globalThis.changeRegionMapZoom=step=>changeZoom(Number(step)||0);
globalThis.resetRegionMapView=()=>changeZoom(0,true);
globalThis.fitRegionMapView=fitZoom;
if(typeof globalThis.addEventListener==="function")globalThis.addEventListener("resize",()=>{const els=mapElements();if(els?.svg.dataset.fitMode==="true")scheduleFit()});
globalThis.setRegionMapKindFilter=setKindFilter;
globalThis.runRegionMapGraphicsAudit=audit;
if(D()?.meta)D().meta.region_map_graphics_revision=REV;
globalThis.QUNLU_CORE?.registerModule?.("src/region-map-graphics-v1.js",{domain:"world",revision:REV});
})();
