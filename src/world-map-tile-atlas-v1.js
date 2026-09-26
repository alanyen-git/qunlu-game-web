/* 群陸旅誌：原創拼接式世界地圖 CURRENT-2.16.0
 * WORLD-MOSAIC-ATLAS-1.2
 * 參考經典格狀地圖的瀏覽方式；幾何/道路/地名完全沿用群陸正史，
 * 不使用第三方遊戲貼圖；未具地理座標的行省不虛構地理位置。
 */
(()=>{
"use strict";
const REV="WORLD-MOSAIC-ATLAS-1.1",TILE=56;
const BIOMES=Object.freeze({
 forest:{name:"森林",fills:["#4d7950","#537f51","#416b49","#588051"],ink:"#b3d49a"},
 plains:{name:"平原",fills:["#83a464","#91ae6d","#80a15e","#9cb678"],ink:"#dbe6a8"},
 hills:{name:"丘陵",fills:["#84965a","#8f9d60","#7f9258","#a0a770"],ink:"#d3d29a"},
 mountain:{name:"山岳",fills:["#827d72","#999080","#746f6c","#aba393"],ink:"#e1d8c2"},
 snow:{name:"雪原",fills:["#abb9b8","#d1dcd8","#c1d0cb","#b8c6c0"],ink:"#f3f6eb"},
 steppe:{name:"草原",fills:["#aca465","#beb474","#a69e5c","#c5b87a"],ink:"#e8d6a1"},
 desert:{name:"沙地",fills:["#c5a577","#d7b984","#bd9b70","#e0c393"],ink:"#f2dbac"},
 coast:{name:"海岸",fills:["#6e9f81","#7ead89","#689681","#82b29c"],ink:"#d4e8bc"},
 lava:{name:"火山",fills:["#705b59","#86615a","#665753","#996c5d"],ink:"#e7ad7c"},
 marsh:{name:"濕地",fills:["#597d68","#6b8f75","#537a74","#6a9180"],ink:"#b8d5b0"}
});
const REG_BIOME=Object.freeze({
 "REG-01":"plains","REG-02":"plains","REG-03":"hills","REG-04":"hills",
 "REG-05":"forest","REG-06":"coast","REG-07":"plains","REG-08":"coast",
 "REG-09":"hills","REG-10":"coast","REG-11":"mountain","REG-12":"forest",
 "REG-13":"mountain","REG-14":"steppe","REG-15":"steppe","REG-16":"snow",
 "REG-17":"desert","REG-18":"hills","REG-19":"mountain","REG-20":"lava"
});
const RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6},THREAT=["#89ae80","#b4c477","#d0c473","#daa76b","#cb8873","#bf7485","#ad80ae"];
const arr=v=>Array.isArray(v)?v:[];
const db=()=>typeof DB==="object"&&DB?DB:null;
const geo=()=>db()?.world_geopolitical_map||null;
const get=(key,id)=>arr(db()?.[key]).find(x=>x?.id===id)||null;
const clean=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=v=>String(v??"").replace(/[^a-zA-Z0-9_-]/g,"");
const val=n=>Number.isFinite(Number(n))?Number(n):0;
const n1=n=>Math.round(n*10)/10;
const hash=(x,y,seed=0)=>{let h=Math.imul(x+57,92837111)^Math.imul(y+181,689287499)^Math.imul(seed+23,283923481);h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0};
const polity=id=>get("political_entities",id);
const reg=id=>get("world_regions",id);
const fmtPoints=pts=>arr(pts).map(q=>n1(q[0])+","+n1(q[1])).join(" ");
let BASE=null,CURRENT_MODE="terrain",ZOOM=1,SELECTED=null;
const LEGACY_ATLAS=typeof globalThis.openWorldMapAtlas==="function"?globalThis.openWorldMapAtlas:null;
const LEGACY_HIERARCHY=typeof globalThis.openWorldMapHierarchy==="function"?globalThis.openWorldMapHierarchy:null;
function shapes(){
 const g=geo();if(!g)return [];
 return arr(g.region_geometry).filter(x=>x?.layer==="surface"&&arr(x.points).length>=3).map(x=>{
  const px=x.points.map(p=>val(p[0])),py=x.points.map(p=>val(p[1]));
  return {raw:x,id:x.region_id,minX:Math.min(...px),maxX:Math.max(...px),minY:Math.min(...py),maxY:Math.max(...py)};
 });
}
function pointInPolygon(x,y,points){
 let inside=false;const n=points.length;
 for(let i=0,j=n-1;i<n;j=i++){
  const a=points[i],b=points[j],x1=+a[0],y1=+a[1],x2=+b[0],y2=+b[1];
  if((y1>y)!==(y2>y) && x<(x2-x1)*(y-y1)/(y2-y1)+x1)inside=!inside;
 }
 return inside;
}
function regionAt(x,y,list=shapes()){
 for(const p of list){
  if(x<p.minX||x>p.maxX||y<p.minY||y>p.maxY)continue;
  if(pointInPolygon(x,y,p.raw.points))return p.id;
 }
 return null;
}
function allTiles(){
 const g=geo();if(!g)return [];
 if(BASE?.geometry===g.region_geometry&&BASE?.width===g.canvas?.width)return BASE.tiles;
 const width=Math.max(300,val(g.canvas?.width)||1800),height=Math.max(300,val(g.canvas?.height)||1100);
 const all=shapes(),out=[];
 const cols=Math.ceil(width/TILE),rows=Math.ceil(height/TILE);
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x=col*TILE,y=row*TILE,dx=Math.min(TILE,width-x),dy=Math.min(TILE,height-y);
  let id=regionAt(x+dx/2,y+dy/2,all);
  if(!id){for(const q of [[.23,.23],[.77,.23],[.23,.77],[.77,.77]]){id=regionAt(x+dx*q[0],y+dy*q[1],all);if(id)break}}
  out.push({x,y,w:dx,h:dy,col,row,id,hsh:hash(col,row)});
 }
 BASE={geometry:g.region_geometry,width,height,tiles:out};
 return out;
}
function regionNames(){return [...new Set(shapes().map(g=>g.id))]}
function mainPolity(id){
 if(shapes().some(x=>x.id===id&&x.raw.nonstate))return null;
 const g=shapes().find(x=>x.id===id&&!x.raw.nonstate);
 const source=g?.raw.political_entity_id||reg(id)?.political_entity_id;
 return polity(db()?.political_merge_map?.[source]||source);
}
function biomeOf(id){
 if(REG_BIOME[id])return REG_BIOME[id];
 const r=reg(id),p=mainPolity(id);
 const v=[r?.terrain,r?.geography_profile?.terrain,p?.world_map_profile?.geography_profile?.terrain].filter(Boolean).join(" ");
 return /火山|熔岩|硫磺/.test(v)?"lava":/雪|凍|冰|霜/.test(v)?"snow":/沙|鹽鹼|荒漠/.test(v)?"desert":/山|嶺|高原/.test(v)?"mountain":/濕地|沼|蘆/.test(v)?"marsh":/森林|古林|樹|密林/.test(v)?"forest":/島|海岸|港灣/.test(v)?"coast":/草原|牧/.test(v)?"steppe":/丘/.test(v)?"hills":"plains";
}
function regionTier(id){return reg(id)?.recommended_tier||reg(id)?.world_tier||mainPolity(id)?.world_tier||"—"}
function terrainTile(tile,mode,focus){
 const {x,y,w,h,col,row,id,hsh}=tile,cx=x+w/2,cy=y+h/2;
 const dim=focus&&id!==focus;
 if(!id){
  const water=["#1d4260","#204b6a","#234f6c","#20465e"][hsh%4];
  return '<g class="mosaic-ocean-tile"><rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+Math.max(1,w-2)+'" height="'+Math.max(1,h-2)+'" rx="3" fill="'+water+'"></rect>'+(hsh%3===0?'<path d="M '+n1(x+9)+' '+n1(y+15)+' q 11 -5 20 0 m -9 13 q 12 -4 23 0" fill="none" stroke="#75a6af" stroke-opacity=".30" stroke-width="2"></path>':"")+'</g>';
 }
 const b=BIOMES[biomeOf(id)]||BIOMES.plains,t=regionTier(id),pid=mainPolity(id)?.id;
 const color=mode==="tier"?THREAT[Math.max(0,RANK[t]??0)]:mode==="political"&&pid?"hsl("+(hash(pid.length,id.length,pid.charCodeAt(pid.length-1))%360)+" 33% "+(40+hsh%7)+"%)":b.fills[hsh%4];
 const texture=mode==="terrain"?tileTexture(biomeOf(id),x,y,w,h,hsh,b.ink):"";
 return '<g class="mosaic-land-tile'+(dim?' mosaic-dim':'')+'" data-region="'+safe(id)+'" role="button" aria-label="'+clean(reg(id)?.name||id)+'・開啟區域圖" onclick="openWorldMosaicRegion(\''+safe(id)+'\')" style="cursor:pointer">'+
  '<title>'+clean((reg(id)?.name||id)+"｜"+b.name+"｜"+t+"級")+"；點選展開區域圖</title>"+
  '<rect class="mosaic-land-square" x="'+(x+1.2)+'" y="'+(y+1.2)+'" width="'+Math.max(1,w-2.4)+'" height="'+Math.max(1,h-2.4)+'" rx="3" fill="'+color+'" stroke="#e3d9a4" stroke-opacity=".16" stroke-width=".8"></rect>'+
  texture+(hsh%8===0?'<path d="M '+n1(x+2)+' '+n1(y+h-4)+' l '+n1(Math.max(5,w/2))+' 0" stroke="#f1e1a0" stroke-opacity=".17" stroke-width="2"></path>':"")+'</g>';
}
function tileTexture(kind,x,y,w,h,hsh,ink){
 const cx=x+w/2,cy=y+h/2,o=hsh%4,scale=.8+hsh%5*.09;
 const forest=()=>'<path d="M '+n1(cx-17)+' '+n1(cy+12)+' l 9 -26 9 26 Z M '+n1(cx+2)+' '+n1(cy+15)+' l 10 -33 10 33 Z" fill="'+ink+'" fill-opacity=".35" stroke="#294938" stroke-opacity=".54" stroke-width="2"></path><path d="M '+n1(cx-8)+' '+n1(cy-8)+' v -12 M '+n1(cx+12)+' '+n1(cy-8)+' v -13" stroke="#234734" stroke-opacity=".32" stroke-width="2"></path>';
 if(kind==="forest")return forest();
 if(kind==="mountain")return '<path d="M '+n1(cx-20)+' '+n1(cy+14)+' l 17 -35 16 35 Z M '+n1(cx+1)+' '+n1(cy+14)+' l 15 -23 16 23 Z" fill="'+ink+'" fill-opacity=".65" stroke="#4b4846" stroke-opacity=".7" stroke-width="2"></path><path d="M '+n1(cx-11)+' '+n1(cy-6)+' l 8 -15 7 15 -7 -3 Z" fill="#eee8d7" fill-opacity=".68"></path>';
 if(kind==="snow")return '<path d="M '+n1(cx-21)+' '+n1(cy+16)+' l 22 -28 23 28 Z" fill="#eef5ed" fill-opacity=".75" stroke="#899da3" stroke-width="2"></path><path d="M '+n1(cx-5)+' '+n1(cy-18)+' l 5 -6 5 6 M '+n1(cx-2)+' '+n1(cy-24)+' v 13" stroke="#f9fdfc" stroke-width="2"></path>';
 if(kind==="lava")return '<path d="M '+n1(cx-20)+' '+n1(cy+17)+' l 18 -30 20 30 Z" fill="#534342" stroke="#c59071" stroke-width="2"></path><path d="M '+n1(cx-6)+' '+n1(cy-14)+' q -5 11 2 12 t -1 17 l 8 -14 -3 -13" fill="#e39157"></path>';
 if(kind==="desert")return '<path d="M '+n1(x+5)+' '+n1(cy+8)+' Q '+n1(cx-3)+' '+n1(cy-21)+' '+n1(x+w-5)+' '+n1(cy+8)+' M '+n1(x+5)+' '+n1(cy+18)+' Q '+n1(cx+9)+' '+n1(cy+1)+' '+n1(x+w-5)+' '+n1(cy+20)+'" fill="none" stroke="'+ink+'" stroke-opacity=".8" stroke-width="4"></path>';
 if(kind==="coast")return '<path d="M '+n1(x+7)+' '+n1(cy-7)+' Q '+n1(cx)+' '+n1(cy-19)+' '+n1(x+w-6)+' '+n1(cy-2)+' M '+n1(x+8)+' '+n1(cy+10)+' Q '+n1(cx)+' '+n1(cy-1)+' '+n1(x+w-7)+' '+n1(cy+13)+'" fill="none" stroke="#cfe6bd" stroke-opacity=".50" stroke-width="3"></path>';
 if(kind==="marsh")return '<path d="M '+n1(x+7)+' '+n1(cy)+' q 7 -7 14 0 t 14 0 M '+n1(x+8)+' '+n1(cy+10)+' q 7 -7 14 0 t 14 0 M '+n1(cx)+' '+n1(cy+13)+' v -23 m -7 16 l 7 -9 7 7" fill="none" stroke="'+ink+'" stroke-opacity=".60" stroke-width="2"></path>';
 if(kind==="hills")return '<path d="M '+n1(x+6)+' '+n1(y+h-9)+' q 12 -27 24 -8 q 10 -38 21 6" fill="none" stroke="'+ink+'" stroke-opacity=".75" stroke-width="5"></path>';
 if(kind==="steppe")return '<path d="M '+n1(cx-17)+' '+n1(cy+13)+' l -2 -13 m 2 10 l 8 -16 M '+n1(cx+12)+' '+n1(cy+15)+' l 4 -25 m -4 19 l -7 -14 M '+n1(cx-22)+' '+n1(cy+21)+' q 18 -6 39 -1" fill="none" stroke="'+ink+'" stroke-opacity=".6" stroke-width="3"></path>';
 return '<path d="M '+n1(cx-18)+' '+n1(cy+12)+' q 8 -8 17 0 q 11 -13 20 -2 M '+n1(cx-10)+' '+n1(cy-12)+' l 2 -7 m 10 10 l 3 -7 m 11 17 l 3 -10" fill="none" stroke="'+ink+'" stroke-opacity=".62" stroke-width="3"></path>';
}
function selectedBounds(id){
 const g=geo(),items=shapes().filter(x=>x.id===id);
 if(!items.length)return {x:0,y:0,w:g?.canvas?.width||1800,h:g?.canvas?.height||1100};
 const x1=Math.min(...items.map(x=>x.minX)),y1=Math.min(...items.map(x=>x.minY));
 const x2=Math.max(...items.map(x=>x.maxX)),y2=Math.max(...items.map(x=>x.maxY));
 return {x:Math.max(0,x1-90),y:Math.max(0,y1-90),w:Math.min(val(g.canvas?.width)||1800,x2+90)-Math.max(0,x1-90),h:Math.min(val(g.canvas?.height)||1100,y2+90)-Math.max(0,y1-90)};
}
function atlasSvg(mode="terrain",focus=null){
 const g=geo();if(!g)return '<div class="card small">世界地理資料尚未載入。</div>';
 const bounds=focus?selectedBounds(focus):{x:0,y:0,w:val(g.canvas?.width)||1800,h:val(g.canvas?.height)||1100};
 const shapesInView=shapes().filter(s=>s.maxX>=bounds.x&&s.minX<=bounds.x+bounds.w&&s.maxY>=bounds.y&&s.minY<=bounds.y+bounds.h);
 const tiles=allTiles().filter(t=>t.x+t.w>=bounds.x&&t.y+t.h>=bounds.y&&t.x<=bounds.x+bounds.w&&t.y<=bounds.y+bounds.h);
 const parts=['<svg class="world-mosaic-svg" viewBox="'+[bounds.x,bounds.y,bounds.w,bounds.h].map(n1).join(" ")+'" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="'+clean(focus?(reg(focus)?.name||focus)+"區域拼接地圖":"群陸原創拼接世界圖")+'"><defs><linearGradient id="mosaicSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#142e47"></stop><stop offset="55%" stop-color="#234b65"></stop><stop offset="100%" stop-color="#112e45"></stop></linearGradient></defs><rect x="0" y="0" width="'+n1(val(g.canvas?.width)||1800)+'" height="'+n1(val(g.canvas?.height)||1100)+'" fill="url(#mosaicSea)"></rect>'];
 for(const t of tiles)parts.push(terrainTile(t,mode,focus));
 // 小島輪廓以正史polygon補繪，避免格狀採樣吞沒細小島嶼。
 for(const s of shapesInView){
  const isSmall=s.raw.island_class==="minor"||s.raw.island_class==="islet";
  const active=!focus||focus===s.id;
  parts.push('<polygon points="'+fmtPoints(s.raw.points)+'" fill="'+(isSmall?(BIOMES[biomeOf(s.id)]||BIOMES.coast).fills[1]:"none")+'" fill-opacity="'+(isSmall?(active?".87":".38"):"0")+'" stroke="'+(s.id===focus?"#f4d18c":"#d3dab9")+'" stroke-width="'+(isSmall?2.5:3)+'" stroke-opacity="'+(active?".84":".31")+'" stroke-dasharray="'+(s.raw.nonstate?"13 8":"none")+'" pointer-events="'+(isSmall?"all":"none")+'"'+(isSmall?' onclick="openWorldMosaicRegion(\''+safe(s.id)+'\')" style="cursor:pointer"':'')+'><title>'+clean(reg(s.id)?.name||s.id)+'</title></polygon>');
 }
 if(mode!=="political"){
  for(const road of arr(g.major_roads)){
   if(!arr(road.points).length)continue;
   parts.push('<polyline points="'+fmtPoints(road.points)+'" fill="none" stroke="#e8c783" stroke-width="3.3" stroke-dasharray="9 7" stroke-linejoin="round" opacity=".65" pointer-events="none"><title>'+clean(road.name)+'</title></polyline>');
  }
  for(const river of arr(g.rivers)){
   if(!arr(river.points).length)continue;
   parts.push('<polyline points="'+fmtPoints(river.points)+'" fill="none" stroke="#8ed1eb" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" opacity=".83" pointer-events="none"><title>'+clean(river.name)+'</title></polyline>');
  }
 }
 for(const capital of arr(g.capitals).filter(c=>c?.layer==="surface"&&c.type!=="none"&&Number.isFinite(+c.x)&&Number.isFinite(+c.y))){
  const pid=capital.political_entity_id,shape=shapes().find(s=>s.raw.political_entity_id===pid&&pointInPolygon(+capital.x,+capital.y,s.raw.points));
  const id=shape?.id||regionAt(+capital.x,+capital.y);
  if(!id)continue;
  if(focus&&id!==focus)continue;
  parts.push('<g class="world-mosaic-capital" onclick="openWorldMosaicRegion(\''+safe(id)+'\')" style="cursor:pointer"><title>'+clean(capital.name||"統治中樞")+'</title><circle cx="'+n1(+capital.x)+'" cy="'+n1(+capital.y)+'" r="16" fill="#2c3930" stroke="#f3d98e" stroke-width="3.5"></circle><text x="'+n1(+capital.x)+'" y="'+n1(+capital.y+6)+'" text-anchor="middle" fill="#ffe7a4" font-size="22">'+(capital.type==="mobile_court"?"◆":"★")+'</text></g>');
 }
 const labeled=new Set();
 for(const s of shapesInView){
  if(labeled.has(s.id)||s.raw.show_label===false)continue;labeled.add(s.id);
  const at=s.raw.label||[(s.minX+s.maxX)/2,(s.minY+s.maxY)/2],active=!focus||s.id===focus;
  parts.push('<text x="'+n1(at[0])+'" y="'+n1(at[1])+'" text-anchor="middle" paint-order="stroke" stroke="#17281b" stroke-width="5" stroke-linejoin="round" font-size="'+(focus&&s.id===focus?29:22)+'" font-weight="900" fill="'+(active?"#fff3c9":"#a0b2ad")+'" opacity="'+(active?"1":".5")+'" pointer-events="none">'+clean(reg(s.id)?.name||s.id)+'</text>');
 }
 if(!focus){
  parts.push('<g pointer-events="none"><path d="M 1710 98 L 1710 40 M1699 52 L1710 36 L1721 52" stroke="#fff0be" stroke-width="5" fill="none"></path><text x="1710" y="117" fill="#fff0be" text-anchor="middle" font-size="21" font-weight="900">北 N</text></g>');
 }
 parts.push("</svg>");return parts.join("");
}
function show(title,body){
 if(typeof globalThis.showModal!=="function")return false;
 globalThis.showModal(title,body);return true;
}
function zoom(step){
 if(typeof document==="undefined")return;
 const el=document.querySelector("#modalBody .world-mosaic-svg");
 const output=document.getElementById("worldMosaicZoomLabel");if(!el)return;
 ZOOM=step===0?1:Math.min(2.25,Math.max(.75,ZOOM+step*.25));
 const minWidth=el.closest(".world-mosaic-scroller")?.classList.contains("world-mosaic-cropped")?690:1160;
 el.style.width=Math.round(ZOOM*100)+"%";
 el.style.minWidth=Math.round(minWidth*ZOOM)+"px";
 if(output)output.textContent=Math.round(ZOOM*100)+"%";
}
function zoomToolbar(){
 ZOOM=1;
 return '<div class="world-mosaic-zoom actions"><button type="button" onclick="changeWorldMosaicZoom(-1)" aria-label="縮小世界地圖">－</button><output id="worldMosaicZoomLabel">100%</output><button type="button" onclick="changeWorldMosaicZoom(1)" aria-label="放大世界地圖">＋</button><button type="button" onclick="changeWorldMosaicZoom(0)">重設</button></div>';
}
function worldIndex(){
 const rows=regionNames().map(id=>{
  const r=reg(id),p=mainPolity(id),biome=BIOMES[biomeOf(id)];
  return '<button type="button" class="world-mosaic-region-entry" onclick="openWorldMosaicRegion(\''+safe(id)+'\')"><span class="world-mosaic-entry-dot" style="background:'+biome.fills[1]+'"></span><span><b>'+clean(r?.name||id)+'</b><small>'+clean(p?.name||"非統一主權區")+'｜'+clean(biome.name)+'</small></span><span class="tier">'+clean(regionTier(id))+'</span></button>';
 }).join("");
 return '<details class="world-mosaic-directory"><summary>依名稱尋找區域（'+regionNames().length+'）</summary><div class="world-mosaic-index">'+rows+'</div></details>';
}
function modes(mode){
 const options=[["terrain","地形拼圖"],["political","政治區域"],["tier","世界層級"]];
 return '<div class="world-mosaic-modes actions" role="group" aria-label="地圖圖層">'+options.map(([id,label])=>'<button type="button"'+(mode===id?' class="primary" aria-pressed="true"':' aria-pressed="false"')+' onclick="openWorldMosaic(\''+id+'\')">'+label+'</button>').join("")+'</div>';
}
function worldPoliticalIndex(){
 const merge=db()?.political_merge_map||{},canonical=id=>merge[id]||id,entries=new Map(),entities=arr(db()?.political_entities);
 for(const p of entities){
  if(!p?.id)continue;
  const key=canonical(p.id);if(!entries.has(key))entries.set(key,{p,regionId:null});
 }
 for(const id of regionNames()){
  const p=mainPolity(id);if(!p)continue;
  const row=entries.get(canonical(p.id))||{p,regionId:null};
  row.regionId=row.regionId||id;entries.set(canonical(p.id),row);
 }
 return [...entries.values()].sort((a,b)=>String(a.p.name||"").localeCompare(String(b.p.name||""))).map(({p,regionId})=>{
  const cap=arr(geo()?.capitals).find(c=>canonical(c.political_entity_id)===canonical(p.id)&&c.layer!=="subterranean");
  const region=regionId?reg(regionId):null;
  return '<button type="button" class="atlas-polity-row"'+(regionId?' onclick="openWorldMosaicRegion(\''+safe(regionId)+'\')"':' disabled')+'><span class="atlas-polity-symbol">✦</span><span class="atlas-polity-copy"><b>'+clean(p.name||p.id)+'</b><small>'+clean(cap?.name||p.capital||"首都座標尚未建檔")+' · '+clean(region?.name||"未標示區域")+'</small></span><span class="atlas-polity-tier">'+clean(p.world_tier||"—")+'</span></button>';
 }).join("");
}
function worldLevelNavigation(){
 const current=get("locations",(typeof G!=="undefined"?G?.character?.locationId:null)),province=get("province_region_maps",current?.province_region_id);
 const realm=province?get("realm_region_maps",province.parent_realm_map_id):arr(db()?.realm_region_maps).find(x=>x.political_entity_id===current?.political_entity_id);
 const btn=(id,label,action,enabled)=>'<button type="button" class="atlas-level-tab'+(id==="world"?' is-active':'')+'"'+(enabled?' onclick="'+action+'"':' disabled')+'><span class="atlas-level-index">'+({world:"01",realm:"02",province:"03",local:"04"}[id])+'</span>'+label+'</button>';
 return '<nav class="atlas-level-nav" aria-label="地圖層級">'+btn("world","世界地圖","openWorldMosaic('political')",true)+btn("realm","王國／政體圖",realm?'openRegionMapGraphic(\'realm\',\''+safe(realm.id)+'\')':"",!!realm)+btn("province","行省圖",province?'openRegionMapGraphic(\'province\',\''+safe(province.id)+'\')':"",!!province)+btn("local","當地圖",current?'openRegionMapGraphic(\'local\',\''+safe(current.id)+'\')':"",!!current)+'</nav>';
}
function openMosaic(mode){
 if(!geo())return show("世界地圖",'<div class="card small">世界圖庫尚未載入，請稍後重新整理。</div>');
 CURRENT_MODE=["terrain","political","tier"].includes(mode)?mode:"political";SELECTED=null;
 const world=geo(),names=regionNames(),current=get("locations",(typeof G!=="undefined"?G?.character?.locationId:null));
 const currentRegion=current?.world_region_id?'<div class="atlas-world-current"><span class="atlas-current-pulse"></span><div><small>目前所在地</small><b>'+clean(current.name||"未命名地點")+'</b><span>'+clean(reg(current.world_region_id)?.name||current.world_region_id)+'</span></div><button type="button" onclick="openWorldMosaicRegion(\''+safe(current.world_region_id)+'\')">定位</button></div>':'';
 const body='<div class="atlas-world-screen">'+worldLevelNavigation()+'<div class="atlas-world-heading"><div><span class="atlas-kicker">THE CONTINENTAL ATLAS · '+names.length+' REGIONS</span><h2>群陸・世界總圖</h2><p>依政治疆域、首都、地形與世界層級檢視各地。</p></div><div class="atlas-compass" aria-label="北方">N<span>✦</span></div></div>'+
  '<div class="atlas-world-grid"><section class="atlas-world-map-panel"><div class="atlas-world-controls">'+modes(CURRENT_MODE)+zoomToolbar()+'</div><div class="world-mosaic-scroller atlas-world-paper" tabindex="0" aria-label="可縮放與捲動的群陸世界地圖">'+atlasSvg(CURRENT_MODE)+'</div><div class="world-mosaic-legend"><span><i class="wm-key wm-forest"></i>森林／平原</span><span><i class="wm-key wm-mountain"></i>山岳／高地</span><span><i class="wm-key wm-water"></i>海域與河川</span><span><i class="wm-key wm-gold"></i>首都／統治中樞</span></div></section>'+
  '<aside class="atlas-world-sidebar">'+currentRegion+'<section class="atlas-world-directory"><div class="atlas-dossier-kicker">政治體與首都</div><div class="atlas-world-polity-list">'+worldPoliticalIndex()+'</div></section><details class="world-mosaic-directory atlas-region-directory"><summary>全部區域（'+names.length+'）</summary><div class="atlas-world-polity-list">'+worldIndex()+'</div></details><div class="atlas-world-actions">'+(current?.world_region_id?'<button type="button" onclick="openWorldMosaicRegion(\''+safe(current.world_region_id)+'\')">定位目前區域</button>':"")+'<button type="button" onclick="openWorldMapLegacy(\'surface\')">詳細地理／道路</button><button type="button" onclick="openWorldMapLegacy(\'subterranean\')">地下世界</button></div><p class="atlas-world-note">點選地圖上的區域或右側政體，可查看疆域、首都、相鄰區與下層圖面。</p></aside></div><div class="atlas-world-foot">地圖沿用群陸既有地理資料；未建檔的行省與地方位置不會臆測繪製。</div></div>';
 return show("世界地圖・拼接圖面｜政治圖冊",body);
}
function polityProvinces(id,p){
 const dbv=db(),same=arr(dbv?.province_region_maps).filter(x=>x.world_region_id===id);
 if(same.length)return {items:same,precise:true};
 if(!p)return {items:[],precise:false};
 const all=arr(dbv.realm_region_maps).filter(r=>r.political_entity_id===p.id).flatMap(r=>arr(r.province_region_ids).map(pid=>get("province_region_maps",pid)).filter(Boolean));
 const byPolity=arr(dbv.province_region_maps).filter(pr=>pr.political_entity_id===p.id);
 const unique=[...new Map([...all,...byPolity].map(x=>[x.id,x])).values()];
 return {items:unique,precise:false};
}
function previewArt(p,i,biome){
 const colors=BIOMES[biome]?.fills||BIOMES.plains.fills;
 const parts=['<svg aria-hidden="true" viewBox="0 0 240 105" preserveAspectRatio="xMidYMid slice" class="world-mosaic-province-art">'];
 for(let row=0;row<3;row++)for(let col=0;col<7;col++){
  const h=hash(col,row,i+21),type=(biome==="lava"&&h%4===0)?"lava":biome;
  parts.push('<rect x="'+(col*35)+'" y="'+(row*35)+'" width="34" height="34" rx="2" fill="'+colors[h%colors.length]+'"></rect>');
  if(h%3===0)parts.push(tileTexture(type,col*35,row*35,34,34,h,BIOMES[biome]?.ink||"#ded9b5"));
 }
 parts.push('</svg>');return parts.join("");
}
/* 正史地點索引：只有明確world_region_id或行省歸屬的地點可以入圖。 */
function regionalLocations(rid){
 const data=db(),provs=arr(data?.province_region_maps).filter(pr=>pr.world_region_id===rid);
 const pids=new Set(provs.map(pr=>pr.id)),assigned=new Set();
 for(const pr of provs){
  for(const key of ["all_settlement_ids","wild_location_ids","dungeon_location_ids","peer_city_ids","subordinate_settlement_ids"])
   for(const id of arr(pr[key]))assigned.add(id);
  if(pr.capital_location_id)assigned.add(pr.capital_location_id);
 }
 const seen=new Set();
 return arr(data?.locations).filter(l=>{
  if(!l?.id||seen.has(l.id)||!["town","wild","dungeon"].includes(l.kind))return false;
  if(l.world_region_id!==rid&&(l.world_region_id||!(pids.has(l.province_region_id)||assigned.has(l.id))))return false;
  seen.add(l.id);return true;
 }).sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"));
}
function placeButton(l){
 const kind=l.kind==="wild"?"wild":l.kind==="dungeon"?"dungeon":"town";
 const glyph=kind==="wild"?"♣":kind==="dungeon"?"◆":"⌂";
 const tier=l.kind==="town"?(l.settlement_world_tier||l.tier||"—"):(l.tier||"—");
 return '<button type="button" class="wm-place wm-'+kind+'" onclick="openRegionMapGraphic(\'local\',\''+safe(l.id)+'\')" title="'+clean(l.name)+'｜開啟當地圖面"><span aria-hidden="true">'+glyph+'</span><span class="wm-place-name">'+clean(l.name)+'</span><span class="tier">'+clean(tier)+'</span></button>';
}
function crossButton(z){
 return '<button type="button" class="wm-place wm-cross" onclick="openWorldMapWilderness(\''+safe(z.id)+'\')"><span aria-hidden="true">♧</span><span class="wm-place-name">'+clean(z.name)+'</span><span class="tier">'+clean(z.tier_min||"—")+'～'+clean(z.tier_max||"—")+'</span></button>';
}
function mapLabels(places,cross){
 const wilds=places.filter(l=>l.kind==="wild"),dungeons=places.filter(l=>l.kind==="dungeon");
 const borders=arr(cross).filter(z=>!wilds.some(l=>l.id===z.id||l.name===z.name));
 if(!wilds.length&&!dungeons.length&&!borders.length)return '<div class="wm-no-label small">尚無已建檔的野外或地下城名稱。</div>';
 const row=(title,items,render)=>items.length?'<section class="wm-label-group"><b>'+title+'（'+items.length+'）</b><div>'+items.map(render).join("")+'</div></section>':"";
 return '<details class="wm-map-labels" open><summary>圖內地點標籤（'+(wilds.length+dungeons.length+borders.length)+'）</summary><div class="wm-label-body"><p class="small">按名稱開啟對應地圖；此名稱板不代表地點精確座標。</p>'+
 row("野外地圖",wilds,placeButton)+row("地下城",dungeons,placeButton)+row("跨境野外",borders,crossButton)+'</div></details>';
}
function placeSections(places){
 return '<h3>已建檔的當地圖面</h3><div class="wm-place-groups">'+[["town","城鎮"],["wild","野外地圖"],["dungeon","地下城"]].map(([kind,title])=>{
  const rows=places.filter(l=>l.kind===kind);
  return '<section class="wm-place-group wm-group-'+kind+'"><h4>'+title+'（'+rows.length+'）</h4><div class="wm-place-list">'+
    (rows.length?rows.map(placeButton).join(""):'<span class="small">本區尚無已建檔的'+title+'。</span>')+'</div></section>';
 }).join("")+'</div>';
}
function regionDetail(id){
 if(!regionNames().includes(id))return false;
 SELECTED=id;
 const r=reg(id),p=mainPolity(id),g=geo(),b=BIOMES[biomeOf(id)]||BIOMES.plains;
 const realm=arr(db()?.realm_region_maps).find(x=>x.political_entity_id===p?.id);
 const provinces=polityProvinces(id,p),wild=arr(g.wilderness_maps).filter(x=>arr(x.between_regions).includes(id));
 const curr=get("locations",typeof G!=="undefined"?G?.character?.locationId:null);
 const here=curr?.world_region_id===id?'<span class="world-mosaic-here">◆ 目前所在區域</span>':"";
 const provinceList=provinces.items.map((pr,i)=>{
  const count=arr(pr.all_settlement_ids).length+arr(pr.wild_location_ids).length+arr(pr.dungeon_location_ids).length;
  return '<button class="world-mosaic-province-card" type="button" onclick="openRegionMapGraphic(\'province\',\''+safe(pr.id)+'\')">'+previewArt(pr,i,biomeOf(id))+'<span class="wm-province-info"><b>'+clean(pr.display_name||pr.name)+'</b><small>'+clean(pr.administrative_type||"行省級區域")+'｜'+clean(pr.world_tier||"—")+'級｜地點 '+count+'</small><span class="wm-province-open">開啟行省圖面 →</span></span></button>';
 }).join("");
 const wilderness=wild.map(z=>'<button type="button" onclick="openWorldMapWilderness(\''+safe(z.id)+'\')">'+clean(z.name)+' '+clean(z.tier_min||"—")+'～'+clean(z.tier_max||"—")+'</button>').join("");
 const places=regionalLocations(id);
 const neighbors=arr(g.region_adjacency?.[id]).filter(x=>regionNames().includes(x)).map(rid=>'<button type="button" onclick="openWorldMosaicRegion(\''+safe(rid)+'\')">'+clean(reg(rid)?.name||rid)+'</button>').join("");
 const toolbar='<div class="world-mosaic-dialog-nav actions"><button type="button" class="primary" onclick="openWorldMosaic(\''+CURRENT_MODE+'\')">← 返回世界拼圖</button>'+(realm?'<button type="button" onclick="openRegionMapGraphic(\'realm\',\''+safe(realm.id)+'\')">王國級圖面</button>':"")+'</div>';
 const note=provinces.precise?"已確認屬於本區域的行省":"以下為相關政體所轄行省；正史未提供各行省精確地理界線，僅提供已建檔的圖面入口。";
 const info=(r?.terrain?'<b>地形：</b>'+clean(r.terrain)+'<br>':"")+(r?.political_status?'<b>政治：</b>'+clean(r.political_status)+'<br>':"");
 const body=toolbar+'<div class="world-mosaic-region-hero"><div><span class="world-mosaic-kicker">區域圖面 / '+clean(id)+'</span><h3>'+clean(r?.name||id)+'</h3><div class="small">'+clean(p?.name||"非統一主權區")+'｜'+clean(b.name)+'｜世界層級 '+clean(regionTier(id))+'</div></div>'+here+'</div>'+
   zoomToolbar()+'<div class="wm-map-stage"><div class="world-mosaic-scroller world-mosaic-cropped" tabindex="0" aria-label="'+clean(r?.name||id)+'區域地形圖">'+atlasSvg("terrain",id)+'</div>'+mapLabels(places,wild)+'</div>'+
   '<div class="world-mosaic-region-layout"><section><div class="card small">'+info+'此處為正史區域地貌與疆域放大圖；實際城鎮位置如未建檔，不使用推測座標。</div><h3>行省／地方區域</h3><p class="small">'+note+'</p><div class="world-mosaic-provinces">'+(provinceList||'<div class="card small">此區域尚無可玩的行省圖面，可使用王國地圖或地方誌。</div>')+'</div>'+
   placeSections(places)+'</section>'+
   '<aside class="world-mosaic-region-aside">'+(wild.length?'<h3>跨境野外</h3><div class="actions">'+wilderness+'</div>':"")+(neighbors?'<h3>相鄰區域</h3><div class="actions">'+neighbors+'</div>':"")+
   '<h3>其他資料</h3><div class="actions">'+(p?'<button type="button" onclick="openWorldMapPolityTerritory(\''+safe(p.id)+'\')">政治體與疆域</button>':"")+(typeof globalThis.openLoreScope==="function"?'<button type="button" onclick="openLoreScope(\'region\',\''+safe(id)+'\',\''+clean((r?.name||id)+"・地方誌").replace(/'/g,"&#39;")+'\')">地方誌</button>':"")+'</div></aside></div>';
 return show((r?.name||id)+"・區域地圖",'<div class="atlas-world-region-screen">'+worldLevelNavigation()+body+'</div>');
}
function audit(){
 const issues=[],g=geo();if(!g?.canvas?.width||!g?.canvas?.height)issues.push("世界地圖尺寸遺失");
 const ids=regionNames();if(!ids.length)issues.push("地表區域幾何資料空白");
 if(!arr(g?.region_geometry).some(x=>x.layer==="subterranean"))issues.push("地下主權圖層遺失");
 if(typeof globalThis.openWorldMosaic!=="function"||typeof globalThis.openWorldMosaicRegion!=="function")issues.push("拼接世界圖互動入口缺失");
 const tiles=allTiles(),covered=new Set(tiles.map(x=>x.id).filter(Boolean));
 for(const id of ids){
  if(!reg(id))issues.push("圖面指向不存在的宏觀區域："+id);
  const rs=shapes().filter(x=>x.id===id);
  if(!covered.has(id)&&!rs.some(x=>x.raw.island_class==="minor"||x.raw.island_class==="islet"))issues.push("地表區域未有可點選圖塊："+id);
 }
 return {revision:REV,pass:issues.length===0,issues:[...new Set(issues)],stats:{regions:ids.length,tiles:tiles.length,land_tiles:tiles.filter(x=>x.id).length},save_compatible:true};
}
globalThis.openWorldMosaic=openMosaic;
globalThis.openWorldMosaicRegion=regionDetail;
globalThis.openWorldMapLegacy=layer=>typeof LEGACY_ATLAS==="function"?LEGACY_ATLAS(layer||"surface"):false;
globalThis.openWorldMapHierarchy=()=>openMosaic("political");
globalThis.openWorldMapAtlas=layer=>["physical","climate","wilderness","subterranean"].includes(layer)?globalThis.openWorldMapLegacy(layer):openMosaic(layer==="political"?"political":layer==="tier"?"tier":"terrain");
globalThis.changeWorldMosaicZoom=zoom;
globalThis.runWorldMosaicAudit=audit;
globalThis.QUNLU_WORLD_MOSAIC=Object.freeze({revision:REV,tiles:allTiles,regionAt,regionNames,regionalLocations,selectedRegion:()=>SELECTED,legacyHierarchy:LEGACY_HIERARCHY});
if(db()?.meta)db().meta.world_mosaic_revision=REV;
globalThis.QUNLU_CORE?.registerModule?.("src/world-map-tile-atlas-v1.js",{domain:"world",revision:REV});
})();