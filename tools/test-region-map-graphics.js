"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8");
const moduleSource=fs.readFileSync("src/region-map-graphics-v1.js","utf8");
const runtimeSource=fs.readFileSync("src/runtime.js","utf8");
const css=fs.readFileSync("assets/css/game.css","utf8");
assert.equal(version.map_graphics_revision,"REGION-MAP-GRAPHICS-1.4");
assert.ok(html.includes('src/region-map-graphics-v1.js?v='+version.version));
assert.ok(sw.includes('"./src/region-map-graphics-v1.js"'));
assert.ok(css.includes(".regionmap-scroll")&&css.includes(".regionmap-toolbar")&&css.includes(".regionmap-category[hidden]"));
const DB={
 meta:{},political_merge_map:{},
 world_regions:[{id:"REG-01",political_entity_id:"POL-01",name:"翠河平原"}],
 political_entities:[{id:"POL-01",name:"測試王國",government_type:"王國",capital:"首都",world_tier:"D"}],
 realm_region_maps:[{id:"RMAP-POL-01",political_entity_id:"POL-01",province_region_ids:["P1"],world_tier:"D",name:"測試王國區域"}],
 province_region_maps:[{id:"P1",name:"翠河行省",administrative_type:"行省",parent_realm_map_id:"RMAP-POL-01",all_settlement_ids:["T1","T2"],wild_location_ids:["W1"],dungeon_location_ids:["D1"]}],
 locations:[
  {id:"T1",name:"柳鎮",kind:"town",tier:"F",settlement_world_tier:"F",safety_score:90,province_region_id:"P1",links:[{to:"W1",hours:2}]},
  {id:"T2",name:"河口城",kind:"town",tier:"E",settlement_world_tier:"E",safety_score:88,province_region_id:"P1",links:[]},
  {id:"W1",name:"蒼葉森林",kind:"wild",tier:"F",safety_score:60,province_region_id:"P1",links:[{to:"T1",hours:2},{to:"D1",hours:4}]},
  {id:"D1",name:"洞窟",kind:"dungeon",tier:"E",safety_score:35,province_region_id:"P1",links:[{to:"W1",hours:4}]}
 ],
 world_geopolitical_map:{
  region_geometry:[{region_id:"REG-01",layer:"surface",political_entity_id:"POL-01",points:[[100,100],[360,100],[360,350],[100,350]],label:[220,220]}],
  capitals:[{political_entity_id:"POL-01",name:"首都",x:220,y:180}],
  mountain_ranges:[{name:"西嶺",regions:["REG-01"],points:[[120,115],[130,260]]}],
  rivers:[{name:"翠河",regions:["REG-01"],points:[[250,120],[270,310]]}],
  major_roads:[{name:"中央大道",regions:["REG-01"],points:[[150,170],[330,170]]}]
 }
};
const G={turn:11,character:{locationId:"T1",inventory:[],moneySilver:25}};
let modal=null,register=[];
const context=vm.createContext({DB,G,console,showModal:(title,body)=>{modal={title,body}},QUNLU_CORE:{registerModule:(path,meta)=>register.push({path,meta})}});
vm.runInContext(moduleSource,context,{filename:"src/region-map-graphics-v1.js"});
const open=(type,id)=>vm.runInContext("openRegionMapGraphic("+JSON.stringify(type)+","+JSON.stringify(id)+")",context);
const openMapSource=runtimeSource.match(/function openMap\(\)\s*\{[\s\S]*?\n\}/)?.[0];
assert.ok(openMapSource,"default map entry exists");
let entryCall=null;
const entryContext=vm.createContext({G:{character:{locationId:"T1"}},openRegionMapGraphic:(level,id)=>{entryCall={level,id};return true},mapHierarchyForLocation(){throw new Error("local map should open first")}});
vm.runInContext(openMapSource+";openMap()",entryContext);
assert.deepEqual(entryCall,{level:"local",id:"T1"},"map opens at current location with direct roads");
assert.equal(open("realm","RMAP-POL-01"),true);
assert.match(modal.title,/王國級圖面/);
assert.match(modal.body,/測試王國/);
assert.match(modal.body,/正史疆域/);
assert.match(modal.body,/<polygon/);
assert.match(modal.body,/北 N/);
assert.match(modal.body,/openRegionMapGraphic\('province','P1'\)/);
assert.equal(open("province","P1"),true);
assert.match(modal.title,/行省級圖面/);
assert.match(modal.body,/regionmap-province/);
assert.match(modal.body,/atlas-map-layout/);
assert.match(modal.body,/atlas-level-nav/);
assert.match(modal.body,/regionmap-road/);
assert.match(modal.body,/setRegionMapKindFilter/);
assert.match(modal.body,/data-map-kind="dungeon"/);
assert.match(modal.body,/前往 2 小時/);
assert.ok(!modal.body.includes("前往 4 小時"),"distant route is not directly reachable");
assert.equal(open("local","T1"),true);
assert.match(modal.title,/當地圖面/);
assert.match(modal.body,/蒼葉森林/);
assert.match(modal.body,/前往 2 小時/);
assert.match(modal.body,/changeRegionMapZoom/);
assert.ok(!modal.body.includes("河口城"),"unlinked town must not appear on local diagram");
const prev=JSON.stringify(G);
assert.equal(open("realm","unknown"),false);
assert.equal(open("province","unknown"),false);
assert.equal(open("local","unknown"),false);
assert.equal(JSON.stringify(G),prev,"view-only graphics must not change saved game state");
G.character.locationId="T2";
assert.equal(open("local","T1"),true);
assert.ok(!modal.body.includes("前往 2 小時"),"viewing from another location cannot grant travel");
const a=vm.runInContext("runRegionMapGraphicsAudit()",context);
assert.equal(a.pass,true,JSON.stringify(a.issues));
assert.equal(register[0]?.path,"src/region-map-graphics-v1.js");
// Simulate controls without a browser; filtering is display-only.
const createEl=dataset=>({dataset,style:{},hidden:false,ariaPressed:null,classList:{toggle(){ }},setAttribute(name,value){if(name==="aria-pressed")this.ariaPressed=value}});
const towns=createEl({mapKind:"town"}),wild=createEl({mapKind:"wild"});
const road=createEl({fromKind:"town",toKind:"wild"}),cats=[createEl({mapKind:"town"}),createEl({mapKind:"wild"})];
const buttons=["all","town","wild","dungeon"].map(regionmapFilter=>createEl({regionmapFilter}));
const scroll={clientWidth:676,scrollLeft:0,scrollTop:0};
const svg={style:{},dataset:{},closest:selector=>selector===".regionmap-scroll"?scroll:null},counter={textContent:"100%"};
const root={querySelectorAll(selector){return {
 ".regionmap-province .regionmap-node":[towns,wild],
 ".regionmap-province .regionmap-road":[road],
 ".regionmap-category":cats,
 "[data-regionmap-filter]":buttons
}[selector]||[]}};
context.document={querySelector(selector){return selector==="#modalBody .regionmap-svg"?svg:null},getElementById(id){return id==="modalBody"?root:id==="regionmapZoomLevel"?counter:null}};
vm.runInContext("setRegionMapKindFilter('wild')",context);
assert.equal(towns.style.opacity,".18");
assert.equal(wild.style.opacity,"1");
assert.equal(cats[0].hidden,true);
assert.equal(cats[1].hidden,false);
assert.equal(buttons[2].ariaPressed,"true");
vm.runInContext("changeRegionMapZoom(1)",context);
assert.equal(counter.textContent,"125%");
assert.equal(svg.style.width,"825px");
vm.runInContext("resetRegionMapView()",context);
assert.equal(counter.textContent,"100%");
assert.equal(svg.style.width,"660px");
console.log("region map graphics regression OK: realm atlas, provincial links/filter, local travel gating, zoom, save safety");
