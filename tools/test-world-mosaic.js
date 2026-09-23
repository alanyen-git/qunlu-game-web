"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const code=fs.readFileSync("src/world-map-tile-atlas-v1.js","utf8");
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8");
const registry=fs.readFileSync("src/program-registry-v1.js","utf8"),style=fs.readFileSync("assets/css/game.css","utf8");
const ver=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.equal(ver.world_mosaic_revision,"WORLD-MOSAIC-ATLAS-1.0");
assert.ok(html.includes("src/world-map-tile-atlas-v1.js?v="+ver.version));
assert.ok(sw.includes('"./src/world-map-tile-atlas-v1.js"'));
assert.ok(registry.includes('"src/world-map-tile-atlas-v1.js"'));
assert.ok(style.includes(".world-mosaic-scroller")&&style.includes(".world-mosaic-province-card"));
const DB={
 meta:{},political_merge_map:{},
 world_regions:[
  {id:"REG-01",name:"蒼翠領",terrain:"森林和平原",political_entity_id:"POL-01",recommended_tier:"F"},
  {id:"REG-02",name:"霜原",political_entity_id:"POL-02",recommended_tier:"D"},
  {id:"REG-17",name:"荒原",political_entity_id:null,recommended_tier:"C"}
 ],
 political_entities:[{id:"POL-01",name:"蒼翠王國",world_tier:"D"},{id:"POL-02",name:"白銀王國",world_tier:"B"}],
 realm_region_maps:[{id:"RMAP-POL-01",political_entity_id:"POL-01",province_region_ids:["PR-01"]}],
 province_region_maps:[{id:"PR-01",name:"樹蔭行省",world_region_id:"REG-01",parent_realm_map_id:"RMAP-POL-01",all_settlement_ids:["L-01"],wild_location_ids:["L-02"]}],
 locations:[
  {id:"L-01",name:"葉鎮",world_region_id:"REG-01",kind:"town",tier:"F",links:[{to:"L-02",hours:2}]},
  {id:"L-02",name:"深林",world_region_id:"REG-01",kind:"wild",tier:"F",links:[{to:"L-01",hours:2}]}
 ],
 world_geopolitical_map:{
  canvas:{width:600,height:360},
  region_geometry:[
   {region_id:"REG-01",political_entity_id:"POL-01",layer:"surface",points:[[20,20],[250,20],[250,228],[20,228]],label:[135,120]},
   {region_id:"REG-02",political_entity_id:"POL-02",layer:"surface",points:[[255,30],[565,30],[565,310],[255,310]],label:[390,155]},
   {region_id:"REG-17",nonstate:true,layer:"surface",points:[[15,234],[246,234],[246,336],[15,336]],label:[132,292]},
   {region_id:"REG-02",political_entity_id:"POL-20",layer:"subterranean",points:[[295,100],[410,100],[410,200],[295,200]]}
  ],
  capitals:[{political_entity_id:"POL-01",name:"銀葉城",layer:"surface",type:"fixed",x:120,y:100}],
  mountain_ranges:[],
  major_roads:[{name:"葉之路",points:[[30,100],[200,110]]}],
  rivers:[{name:"銀溪",points:[[25,70],[100,180]]}],
  wilderness_maps:[{id:"WILD-01",name:"古樹交界",tier_min:"F",tier_max:"E",between_regions:["REG-01","REG-17"]}],
  region_adjacency:{"REG-01":["REG-02","REG-17"],"REG-02":["REG-01"],"REG-17":["REG-01"]}
 }
};
const G={turn:100,character:{locationId:"L-01",level:5,moneySilver:100,inventory:[]}};
let modal=null,legacy=null,core=[];
const context=vm.createContext({DB,G,console,
 showModal:(title,body)=>{modal={title,body}},
 openWorldMapAtlas:layer=>{legacy=layer},
 openWorldMapHierarchy:()=>{},
 openRegionMapGraphic:()=>{},
 openWorldMapWilderness:()=>{},
 QUNLU_CORE:{registerModule:(path,meta)=>core.push([path,meta])}
});
vm.runInContext(code,context,{filename:"src/world-map-tile-atlas-v1.js"});
function call(s){return vm.runInContext(s,context)}
const before=JSON.stringify(G);
assert.equal(call("openWorldMosaic()"),true);
assert.match(modal.title,/拼接圖面/);
assert.match(modal.body,/world-mosaic-svg/);
assert.match(modal.body,/mosaic-land-tile/);
assert.match(modal.body,/openWorldMosaicRegion\('REG-01'\)/);
assert.match(modal.body,/北 N/);
assert.match(modal.body,/地形拼圖/);
assert.match(modal.body,/目前所在區域/);
assert.match(modal.body,/詳細地理/);
assert.match(modal.body,/世界層級/);
assert.equal(call("QUNLU_WORLD_MOSAIC.regionAt(100,100)"),"REG-01");
assert.equal(call("QUNLU_WORLD_MOSAIC.regionAt(350,130)"),"REG-02");
assert.equal(call("QUNLU_WORLD_MOSAIC.regionAt(120,285)"),"REG-17");
assert.equal(call("QUNLU_WORLD_MOSAIC.regionAt(595,355)"),null);
assert.equal(call("openWorldMosaicRegion('REG-01')"),true);
assert.match(modal.title,/區域地圖/);
assert.match(modal.body,/王國級圖面/);
assert.match(modal.body,/樹蔭行省/);
assert.match(modal.body,/openRegionMapGraphic\('province','PR-01'\)/);
assert.match(modal.body,/已建檔的當地圖面/);
assert.match(modal.body,/古樹交界/);
assert.match(modal.body,/相鄰區域/);
assert.equal(call("openWorldMosaicRegion('REG-17')"),true);
assert.match(modal.body,/非統一主權區/);
assert.equal(call("openWorldMosaicRegion('REG-NO')"),false);
call("openWorldMosaic('tier')");
assert.match(modal.body,/aria-pressed="true" onclick="openWorldMosaic\('tier'\)"/);
call("openWorldMapAtlas('physical')");
assert.equal(legacy,"physical");
call("openWorldMapAtlas('surface')");
assert.match(modal.title,/拼接圖面/);
call("openWorldMapHierarchy()");
assert.match(modal.title,/拼接圖面/);
assert.equal(JSON.stringify(G),before,"map viewing should not change save state or turns");
const audit=call("runWorldMosaicAudit()");
assert.equal(audit.pass,true,JSON.stringify(audit.issues));
assert.equal(audit.stats.regions,3);
assert.ok(audit.stats.land_tiles>8);
assert.equal(core[0][0],"src/world-map-tile-atlas-v1.js");
const svg={style:{},closest:()=>({classList:{contains:()=>false}})},label={textContent:"100%"};
context.document={querySelector:s=>s==="#modalBody .world-mosaic-svg"?svg:null,getElementById:id=>id==="worldMosaicZoomLabel"?label:null};
call("changeWorldMosaicZoom(1)");
assert.equal(label.textContent,"125%");
call("changeWorldMosaicZoom(0)");
assert.equal(label.textContent,"100%");
console.log("world mosaic regression OK: three biome layers, clickable surface regions, province popup, nonstate, neighbors, responsive zoom, legacy atlas, save safety");
