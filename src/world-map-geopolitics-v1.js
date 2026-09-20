/* 群陸旅誌：世界政治地圖第一階段 CURRENT-1.87.0
 * WORLD-MAP-GEOPOLITICS-1.0
 * 建立世界地圖的政治疆域、首都位置、相鄰邊界與地下重疊主權；不改旅行解鎖與存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.87.0")||"CURRENT-1.87.0";
const REV="WORLD-MAP-GEOPOLITICS-1.0";
const W=1800,H=1100;

const REGION_GEOMETRY=[
 {region_id:"REG-01",layer:"surface",points:[[300,590],[390,430],[550,500],[610,650],[470,720],[300,690]],label:[430,590]},
 {region_id:"REG-02",layer:"surface",points:[[770,340],[890,330],[1050,420],[1000,520],[820,540],[730,460]],label:[885,435]},
 {region_id:"REG-03",layer:"surface",points:[[340,260],[560,310],[650,220],[770,340],[730,460],[550,500],[390,430]],label:[555,375]},
 {region_id:"REG-04",layer:"surface",points:[[550,500],[730,460],[820,540],[900,650],[820,700],[730,600],[610,650]],label:[735,575]},
 {region_id:"REG-05",layer:"surface",points:[[300,690],[470,720],[520,860],[350,930],[220,880],[350,800]],label:[385,820]},
 {region_id:"REG-06",layer:"surface",points:[[610,650],[730,600],[820,700],[760,850],[590,830],[670,760]],label:[700,745]},
 {region_id:"REG-07",layer:"surface",points:[[470,720],[610,650],[670,760],[590,830],[520,860]],label:[565,760]},
 {region_id:"REG-08",layer:"surface",points:[[400,900],[520,870],[620,950],[560,1040],[420,1010]],label:[510,960],island:true},
 {region_id:"REG-09",layer:"surface",points:[[820,540],[1000,520],[1100,620],[1080,760],[900,760],[900,650]],label:[965,650]},
 {region_id:"REG-10",layer:"surface",points:[[120,910],[250,890],[330,970],[260,1050],[130,1030]],label:[220,975],island:true,nonstate:true},
 {region_id:"REG-11",layer:"surface",points:[[590,80],[820,100],[890,260],[770,340],[650,220]],label:[735,190]},
 {region_id:"REG-12",layer:"surface",points:[[820,100],[1110,150],[1180,350],[1050,420],[890,330],[890,260]],label:[1010,265]},
 {region_id:"REG-13",layer:"surface",points:[[300,70],[590,80],[650,220],[560,310],[340,260],[340,190]],label:[465,175]},
 {region_id:"REG-14",layer:"surface",points:[[1120,360],[1350,330],[1420,570],[1300,690],[1100,620],[1190,470]],label:[1265,510]},
 {region_id:"REG-15",layer:"surface",points:[[1350,330],[1660,300],[1740,560],[1600,720],[1420,570]],label:[1535,500]},
 {region_id:"REG-16",layer:"surface",points:[[90,90],[300,70],[340,190],[260,300],[110,270]],label:[205,170]},
 {region_id:"REG-17",layer:"surface",points:[[1000,380],[1120,360],[1190,470],[1100,620],[1000,520]],label:[1090,475],nonstate:true},
 {region_id:"REG-18",layer:"surface",points:[[80,270],[260,300],[340,260],[390,430],[300,590],[90,610],[55,450]],label:[190,445]},
 {region_id:"REG-19",layer:"surface",points:[[55,610],[300,590],[300,690],[350,800],[220,880],[70,810]],label:[190,720]},
 {region_id:"REG-20",layer:"surface",points:[[1080,760],[1300,690],[1420,570],[1600,720],[1500,970],[1230,1020],[1020,900]],label:[1300,855],nonstate:true},
 {region_id:"REG-13",political_entity_id:"POL-020",layer:"subterranean",points:[[405,145],[555,145],[600,215],[535,285],[405,245],[375,195]],label:[490,210],overlap:true}
];

const CAPITALS=[
 {political_entity_id:"POL-001",name:"瑟倫堡",type:"fixed",layer:"surface",x:430,y:575},
 {political_entity_id:"POL-002",name:"赫薩爾帝都",type:"fixed",layer:"surface",x:875,y:435},
 {political_entity_id:"POL-003",name:"聖冠城",type:"fixed",layer:"surface",x:555,y:375},
 {political_entity_id:"POL-004",name:"晨鐘聖城",type:"fixed",layer:"surface",x:730,y:575},
 {political_entity_id:"POL-005",name:"維薩城",type:"fixed",layer:"surface",x:405,y:810},
 {political_entity_id:"POL-006",name:"維爾港",type:"fixed",layer:"surface",x:700,y:745},
 {political_entity_id:"POL-007",name:"卡薩維爾",type:"fixed",layer:"surface",x:565,y:760},
 {political_entity_id:"POL-008",name:"金衡港",type:"fixed",layer:"surface",x:510,y:955},
 {political_entity_id:"POL-009",name:"灰刃城",type:"fixed",layer:"surface",x:965,y:650},
 {political_entity_id:"POL-011",name:"藍塔城",type:"fixed",layer:"surface",x:735,y:190},
 {political_entity_id:"POL-012",name:"瑟露維亞林冠庭",type:"fixed",layer:"surface",x:1010,y:265},
 {political_entity_id:"POL-013",name:"深砧王廳",type:"fixed",layer:"surface",x:465,y:175},
 {political_entity_id:"POL-014",name:"赤牙大營",type:"fixed",layer:"surface",x:1265,y:510},
 {political_entity_id:"POL-015",name:"大汗金帳（季節性位置）",canonical_capital:"無固定都城",type:"mobile_court",layer:"surface",x:1535,y:500,note:"僅為當季汗庭地圖錨點；不建立永久首都。"},
 {political_entity_id:"POL-016",name:"霜角石圈",type:"fixed",layer:"surface",x:205,y:170},
 {political_entity_id:"POL-018",name:"洛文城",type:"fixed",layer:"surface",x:190,y:445},
 {political_entity_id:"POL-019",name:null,type:"none",layer:"surface",note:"無主之地沒有被共同承認的固定首都。"},
 {political_entity_id:"POL-020",name:"黑月城",type:"fixed",layer:"subterranean",x:490,y:210}
];

const REGION_ADJACENCY={
 "REG-01":["REG-18","REG-03","REG-04","REG-07","REG-05","REG-19"],
 "REG-02":["REG-11","REG-12","REG-03","REG-04","REG-17"],
 "REG-03":["REG-13","REG-11","REG-02","REG-04","REG-01","REG-18"],
 "REG-04":["REG-03","REG-02","REG-01","REG-06","REG-09","REG-17"],
 "REG-05":["REG-19","REG-01","REG-07","REG-06","REG-08"],
 "REG-06":["REG-05","REG-07","REG-04","REG-08","REG-10"],
 "REG-07":["REG-01","REG-05","REG-06"],
 "REG-08":["REG-05","REG-06","REG-10"],
 "REG-09":["REG-04","REG-17","REG-14","REG-20"],
 "REG-10":["REG-06","REG-08","REG-20"],
 "REG-11":["REG-13","REG-03","REG-02","REG-12"],
 "REG-12":["REG-11","REG-02","REG-14"],
 "REG-13":["REG-16","REG-18","REG-03","REG-11"],
 "REG-14":["REG-12","REG-17","REG-09","REG-15","REG-20"],
 "REG-15":["REG-14","REG-20"],
 "REG-16":["REG-13","REG-18"],
 "REG-17":["REG-02","REG-04","REG-09","REG-14"],
 "REG-18":["REG-16","REG-13","REG-03","REG-01","REG-19"],
 "REG-19":["REG-18","REG-01","REG-05"],
 "REG-20":["REG-09","REG-14","REG-15","REG-10"]
};

const POLITICAL_NOTES={
 "POL-001":"阿斯戴爾王國本土；POL-018洛文邊侯領是王冠封臣但保有獨立地圖區。",
 "POL-013":"石冠氏族王國控制地表山口、主要山廳與礦道；REG-13更深層另有黑月深庭主權。",
 "POL-015":"疆域按主要季節牧路與承認範圍呈現，不代表固定城牆式邊界。",
 "POL-019":"邊界代表長期無穩定主權的斷境荒野，不代表統一政府有效控制。",
 "POL-020":"地下主權層；與POL-013在部分深層礦脈存在爭議，不應畫成地表獨立國境。"
};

const regionById=id=>(DB.world_regions||[]).find(x=>x?.id===id)||null;
const polityById=id=>(DB.political_entities||[]).find(x=>x?.id===id)||null;
const geomForPolity=pid=>{
  if(pid==="POL-020")return REGION_GEOMETRY.find(x=>x.political_entity_id===pid);
  const p=polityById(pid);return p?REGION_GEOMETRY.find(x=>x.region_id===p.core_region_id&&x.layer==="surface"):null;
};
const capitalForPolity=pid=>CAPITALS.find(x=>x.political_entity_id===pid)||null;
const fmtPoints=pts=>(pts||[]).map(p=>p[0]+","+p[1]).join(" ");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function centroid(points){
 let x=0,y=0;if(!points?.length)return [0,0];
 for(const p of points){x+=p[0];y+=p[1]}
 return [Math.round(x/points.length),Math.round(y/points.length)];
}
function pointInPolygon(x,y,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
   const xi=points[i][0],yi=points[i][1],xj=points[j][0],yj=points[j][1];
   const hit=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi||1e-9)+xi);
   if(hit)inside=!inside;
 }
 return inside;
}
function colorForPolity(pid){
 const p=polityById(pid),n=Number(p?.index)||1;
 return "hsl("+((n*47)%360)+" 34% 31%)";
}
function polityIdForGeometry(g){
 if(g.political_entity_id)return g.political_entity_id;
 return regionById(g.region_id)?.political_entity_id||null;
}
function adjacentPolities(pid){
 const p=polityById(pid);if(!p)return [];
 if(pid==="POL-020")return ["POL-013"];
 const rids=REGION_ADJACENCY[p.core_region_id]||[];
 return [...new Set(rids.map(r=>regionById(r)?.political_entity_id).filter(Boolean))];
}
function adjacentNonstateRegions(pid){
 const p=polityById(pid);if(!p||pid==="POL-020")return [];
 return (REGION_ADJACENCY[p.core_region_id]||[]).filter(r=>!regionById(r)?.political_entity_id);
}

for(const p of (DB.political_entities||[])){
 const cap=capitalForPolity(p.id),geom=geomForPolity(p.id);
 p.world_map_profile={
   revision:REV,
   geometry_region_id:p.id==="POL-020"?"REG-13":p.core_region_id,
   layer:geom?.layer||"surface",
   capital_type:cap?.type||"unknown",
   capital_point:cap&&Number.isFinite(cap.x)?{x:cap.x,y:cap.y}:null,
   adjacent_polity_ids:adjacentPolities(p.id),
   adjacent_nonstate_region_ids:adjacentNonstateRegions(p.id),
   sovereignty_note:POLITICAL_NOTES[p.id]||null
 };
}

DB.world_geopolitical_map={
 version:REV,release:RELEASE,
 canvas:{width:W,height:H,projection:"fictional_atlas",origin:"northwest",coordinate_unit:"atlas"},
 layers:[
   {id:"surface",name:"地表疆域",description:"正式政治體、無統一主權區與主要海島大區。"},
   {id:"subterranean",name:"地下主權",description:"目前先標記黑月深庭與石冠山脈的重疊主權；後續再展開地下河、礦道與洞窟。"}
 ],
 region_geometry:REGION_GEOMETRY,
 capitals:CAPITALS,
 region_adjacency:REGION_ADJACENCY,
 political_notes:POLITICAL_NOTES,
 design_rules:[
   "疆域邊界是世界地圖層的長期政治控制／承認範圍，不代表每一寸土地都有相同統治密度。",
   "封臣政體可以有自己的地圖區與首府；宗主關係另外標示，不把封臣疆域直接抹除。",
   "遊牧汗國使用季節性汗庭錨點，不建立虛假的永久都城。",
   "無主之地沒有固定首都；地圖只標示長期無穩定主權的範圍。",
   "地下主權使用獨立layer，不能與地表疆域面積直接比較。",
   "REG-10黑潮群島、REG-17鐵旗邊原、REG-20龍脊火山群維持非統一主權區，不誤升格為國家。"
 ],
 save_compatible:true
};
DB.world_map=DB.world_map||{};
DB.world_map.geopolitical_geometry_revision=REV;
DB.world_map.geopolitical_layers=["surface","subterranean"];
DB.meta=DB.meta||{};
DB.meta.world_geopolitical_map_revision=REV;

function renderSurfaceSvg(){
 const parts=[];
 for(const g of REGION_GEOMETRY.filter(x=>x.layer==="surface")){
   const region=regionById(g.region_id),pid=polityIdForGeometry(g),p=polityById(pid);
   const fill=pid?colorForPolity(pid):"#2b3130";
   const dash=g.nonstate?"10 7":"";
   const click=pid?"openWorldMapPolityTerritory('"+pid+"')":"openWorldMapNonStateRegion('"+g.region_id+"')";
   parts.push('<polygon points="'+fmtPoints(g.points)+'" fill="'+fill+'" stroke="#91a19a" stroke-width="4"'+(dash?' stroke-dasharray="'+dash+'"':'')+' onclick="'+click+'" style="cursor:pointer"><title>'+esc((p?.name||region?.name||g.region_id)+(g.nonstate?"（非統一主權區）":""))+'</title></polygon>');
   const lp=g.label||centroid(g.points);
   parts.push('<text x="'+lp[0]+'" y="'+lp[1]+'" text-anchor="middle" fill="#f0eee6" font-size="23" font-weight="700" pointer-events="none">'+esc(p?.name||region?.name||g.region_id)+'</text>');
   parts.push('<text x="'+lp[0]+'" y="'+(lp[1]+27)+'" text-anchor="middle" fill="#b8c2bd" font-size="17" pointer-events="none">'+esc(region?.name||"")+'</text>');
 }
 for(const c of CAPITALS.filter(x=>x.layer==="surface"&&x.type!=="none")){
   const p=polityById(c.political_entity_id);if(!p)continue;
   const marker=c.type==="mobile_court"?"◆":"●";
   parts.push('<text x="'+c.x+'" y="'+c.y+'" text-anchor="middle" fill="#f3d68a" font-size="28" font-weight="900" onclick="openWorldMapPolityTerritory(\''+c.political_entity_id+'\')" style="cursor:pointer"><title>'+esc(c.name)+'</title>'+marker+'</text>');
   parts.push('<text x="'+c.x+'" y="'+(c.y+22)+'" text-anchor="middle" fill="#f3d68a" font-size="15" font-weight="700" pointer-events="none">'+esc(c.name)+'</text>');
 }
 return '<div style="overflow:auto;border:1px solid #36423d;border-radius:14px;background:#111714;padding:8px"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="群陸旅誌世界政治地圖・地表疆域" style="width:100%;min-width:760px;height:auto;display:block">'+parts.join("")+'</svg></div>';
}
function renderUndergroundSvg(){
 const base=REGION_GEOMETRY.find(x=>x.region_id==="REG-13"&&x.layer==="surface");
 const g=REGION_GEOMETRY.find(x=>x.political_entity_id==="POL-020");
 const c=capitalForPolity("POL-020"),p=polityById("POL-020"),r=regionById("REG-13");
 const bpts=base?base.points.map(([x,y])=>[(x-260)*3+180,(y-40)*3+120]):[];
 const gpts=g.points.map(([x,y])=>[(x-360)*3+180,(y-120)*3+120]);
 const cx=(c.x-360)*3+180,cy=(c.y-120)*3+120;
 return '<div style="overflow:auto;border:1px solid #36423d;border-radius:14px;background:#111714;padding:8px"><svg viewBox="0 0 1100 760" role="img" aria-label="石冠山脈地下主權示意" style="width:100%;min-width:680px;height:auto;display:block">'+
   '<polygon points="'+fmtPoints(bpts)+'" fill="#242b28" stroke="#69766f" stroke-width="5" stroke-dasharray="12 9"></polygon>'+
   '<text x="520" y="90" text-anchor="middle" fill="#b9c2bd" font-size="24">'+esc(r?.name||"石冠山脈")+'地表投影</text>'+
   '<polygon points="'+fmtPoints(gpts)+'" fill="'+colorForPolity("POL-020")+'" stroke="#d1b36a" stroke-width="6" onclick="openWorldMapPolityTerritory(\'POL-020\')" style="cursor:pointer"></polygon>'+
   '<text x="520" y="360" text-anchor="middle" fill="#f0eee6" font-size="30" font-weight="700">'+esc(p?.name||"黑月深庭")+'</text>'+
   '<text x="'+cx+'" y="'+cy+'" text-anchor="middle" fill="#f3d68a" font-size="34" font-weight="900">●</text>'+
   '<text x="'+cx+'" y="'+(cy+28)+'" text-anchor="middle" fill="#f3d68a" font-size="20" font-weight="700">'+esc(c?.name||"黑月城")+'</text>'+
   '</svg></div>';
}
function mapPolityRows(){
 return (DB.political_entities||[]).map(p=>{
   const c=capitalForPolity(p.id);
   const cap=c?.type==="none"?"無固定首都":c?.type==="mobile_court"?"季節性汗庭":c?.name||p.capital||"—";
   const layer=p.world_map_profile?.layer==="subterranean"?"地下":"地表";
   return '<div class="itemrow"><span><b>'+esc(p.name)+'</b> <span class="tier">'+esc(p.world_tier||"—")+'</span><br><span class="small">'+esc(p.government_type||"")+'｜'+layer+'｜首都／中樞：'+esc(cap)+'</span></span><button onclick="openWorldMapPolityTerritory(\''+p.id+'\')">疆域</button></div>';
 }).join("");
}
function openWorldMapAtlas(layer){
 layer=layer==="subterranean"?"subterranean":"surface";
 const body='<div class="card small"><b>世界政治地圖・第一階段</b><br>目前固定政治體疆域、首都／統治中樞位置、相鄰邊界與地下重疊主權。此層是世界誌與後續道路、城鎮、事件生成的地理底板，尚不代表所有區域都可立即旅行。</div>'+
   '<div class="actions"><button'+(layer==="surface"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'surface\')">地表疆域</button><button'+(layer==="subterranean"?' class="primary"':'')+' onclick="openWorldMapAtlas(\'subterranean\')">地下主權</button></div>'+
   (layer==="surface"?renderSurfaceSvg():renderUndergroundSvg())+
   '<div class="card small">圖例：<b style="color:#f3d68a">●</b> 固定首都　<b style="color:#f3d68a">◆</b> 季節性統治中樞　虛線疆域＝非統一主權區。POL-019斷境無主地依法無固定首都，因此不放置首都標記。</div>'+
   '<h3>政治體疆域索引</h3>'+mapPolityRows();
 if(typeof showModal==="function")showModal(layer==="surface"?"世界地圖・政治疆域":"世界地圖・地下主權",body);
}
function openWorldMapPolityTerritory(pid){
 const p=polityById(pid);if(!p)return;
 const c=capitalForPolity(pid),g=geomForPolity(pid),r=regionById(pid==="POL-020"?"REG-13":p.core_region_id);
 const ad=adjacentPolities(pid).map(x=>polityById(x)?.name).filter(Boolean);
 const ns=adjacentNonstateRegions(pid).map(x=>regionById(x)?.name).filter(Boolean);
 const cap=c?.type==="none"?"無固定首都":c?.type==="mobile_court"?(c.name+"；"+(c.note||"")):(c?.name||p.capital||"—");
 const note=POLITICAL_NOTES[pid]||r?.sovereignty_note||"";
 const relation=p.vassal_of?("宗主："+(polityById(p.vassal_of)?.name||p.vassal_of)):"獨立主權／特殊非國家區";
 const layer=g?.layer==="subterranean"?"地下主權":"地表疆域";
 const body='<div class="card"><b>'+esc(p.name)+'</b> <span class="tier">'+esc(p.world_tier||"—")+'</span><br><span class="small">'+esc(p.government_type||"")+'｜'+esc(layer)+'｜'+esc(relation)+'</span></div>'+
   '<div class="card small"><b>疆域核心</b>：'+esc(r?.name||p.core_region_id)+'<br><b>首都／統治中樞</b>：'+esc(cap)+'<br><b>相鄰政治體</b>：'+esc(ad.join("、")||"無直接政治邊界")+(ns.length?'<br><b>相鄰非主權區</b>：'+esc(ns.join("、")):"")+(note?'<br><b>主權說明</b>：'+esc(note):"")+'</div>'+
   '<div class="actions"><button onclick="openWorldMapAtlas(\''+(g?.layer==="subterranean"?"subterranean":"surface")+'\')">回地圖</button>'+(typeof openPolity==="function"?'<button onclick="openPolity(\''+p.id+'\')">政治體資料</button>':"")+(typeof openRealmRegionMap==="function"&&pid!=="POL-020"?'<button onclick="openRealmRegionMap(\'RMAP-'+p.id+'\')">區域層級</button>':"")+'</div>';
 if(typeof showModal==="function")showModal(p.name+"・疆域與首都",body);
}
function openWorldMapNonStateRegion(rid){
 const r=regionById(rid);if(!r)return;
 const neighbors=(REGION_ADJACENCY[rid]||[]).map(id=>regionById(id)?.name).filter(Boolean);
 const body='<div class="card"><b>'+esc(r.name)+'</b> <span class="tier">'+esc(r.recommended_tier||"—")+'</span><br><span class="small">非統一主權區｜'+esc(r.terrain||"")+'</span></div>'+
   '<div class="card small"><b>政治狀態</b>：'+esc(r.political_status||"非主權大區")+'<br><b>相鄰大區</b>：'+esc(neighbors.join("、")||"—")+'<br><b>說明</b>：'+esc(r.sovereignty_note||"沒有建立獲承認的統一主權政體。")+'</div>'+
   '<div class="actions"><button onclick="openWorldMapAtlas(\'surface\')">回地圖</button>'+(typeof openLoreScope==="function"?'<button onclick="openLoreScope(\'region\',\''+rid+'\',\''+esc(r.name)+'・地方誌\')">地方誌</button>':"")+'</div>';
 if(typeof showModal==="function")showModal(r.name+"・非主權區",body);
}

const previousWorldMap=typeof globalThis.openWorldMapHierarchy==="function"?globalThis.openWorldMapHierarchy:null;
globalThis.openWorldMapHierarchy=function(){openWorldMapAtlas("surface")};
globalThis.openWorldMapAtlas=openWorldMapAtlas;
globalThis.openWorldMapPolityTerritory=openWorldMapPolityTerritory;
globalThis.openWorldMapNonStateRegion=openWorldMapNonStateRegion;
globalThis.QUNLU_PREVIOUS_WORLD_MAP_HIERARCHY=previousWorldMap;

function audit(){
 const issues=[];
 const polities=DB.political_entities||[];
 if(polities.length!==18)issues.push("政治體數量偏離CURRENT基準18："+polities.length);
 const regionIds=new Set((DB.world_regions||[]).map(x=>x.id));
 const geomSurface=new Map(REGION_GEOMETRY.filter(x=>x.layer==="surface").map(x=>[x.region_id,x]));
 for(let i=1;i<=20;i++){
   const rid="REG-"+String(i).padStart(2,"0");
   if(!regionIds.has(rid))issues.push("世界大區缺資料："+rid);
   if(!geomSurface.has(rid))issues.push("世界大區缺地表疆域："+rid);
 }
 const capMap=new Map(CAPITALS.map(x=>[x.political_entity_id,x]));
 for(const p of polities){
   const c=capMap.get(p.id);if(!c){issues.push("政治體缺首都策略："+p.id);continue}
   const g=geomForPolity(p.id);if(!g){issues.push("政治體缺疆域："+p.id);continue}
   if(c.type==="fixed"&&(!Number.isFinite(c.x)||!Number.isFinite(c.y)))issues.push("固定首都缺座標："+p.id);
   if(c.type==="fixed"&&c.name!==p.capital)issues.push("固定首都名稱與正史不一致："+p.id+" "+c.name+"!="+p.capital);
   if(c.type==="mobile_court"&&p.capital!=="無固定都城")issues.push("移動宮廷卻存在固定首都："+p.id);
   if(c.type==="none"&&p.capital!=="無固定都城")issues.push("無首都策略與正史不一致："+p.id);
   if(c.type!=="none"&&!pointInPolygon(c.x,c.y,g.points))issues.push("首都座標不在自身疆域："+p.id);
 }
 for(const [rid,neighbors] of Object.entries(REGION_ADJACENCY)){
   for(const n of neighbors)if(!(REGION_ADJACENCY[n]||[]).includes(rid))issues.push("邊界相鄰關係非對稱："+rid+"->"+n);
 }
 if(polityById("POL-018")?.vassal_of!=="POL-001")issues.push("洛文邊侯領宗主關係遺失");
 if(!REGION_GEOMETRY.some(x=>x.political_entity_id==="POL-020"&&x.layer==="subterranean"))issues.push("黑月深庭地下主權層遺失");
 for(const rid of ["REG-10","REG-17","REG-20"])if(regionById(rid)?.political_entity_id)issues.push("非統一主權區被誤升格："+rid);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{political_entities:polities.length,surface_regions:REGION_GEOMETRY.filter(x=>x.layer==="surface").length,subterranean_polities:1,fixed_capitals:CAPITALS.filter(x=>x.type==="fixed").length,mobile_courts:CAPITALS.filter(x=>x.type==="mobile_court").length,no_capital_zones:CAPITALS.filter(x=>x.type==="none").length}};
}
DB.world_geopolitical_map.initial_audit=audit();
globalThis.runWorldGeopoliticalMapAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/world-map-geopolitics-v1.js",{domain:"world",revision:REV,release:RELEASE});
})();
