#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/witcher-map-core-v1.js","utf8");
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8"),registry=fs.readFileSync("src/program-registry-v1.js","utf8");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.match(source,/WITCHER-MAP-CORE-1\.0/);
assert.match(html,/src\/witcher-map-core-v1\.js\?v=CURRENT-2\.23\.1/);
assert.ok(sw.includes('"./src/witcher-map-core-v1.js"'));
assert.ok(registry.includes('"src/witcher-map-core-v1.js"'));
const DB={
 meta:{current_version:"CURRENT-2.23.1"},
 world_geopolitical_map:{canvas:{width:900,height:560},region_geometry:[
  {region_id:"REG-1",layer:"surface",political_entity_id:"POL-1",points:[[20,20],[420,20],[420,300],[20,300]]}
 ],mountain_ranges:[],rivers:[],major_roads:[]},
 world_regions:[{id:"REG-1",name:"蒼翠領",political_entity_id:"POL-1"}],
 political_entities:[{id:"POL-1",name:"蒼翠王國"}],
 realm_region_maps:[{id:"RMAP-1",name:"蒼翠王國圖",political_entity_id:"POL-1",province_region_ids:["PR-1"]}],
 province_region_maps:[{id:"PR-1",name:"河谷行省",parent_realm_map_id:"RMAP-1",political_entity_id:"POL-1",world_region_id:"REG-1",world_tier:"C"}],
 locations:[
  {id:"T-1",name:"河谷城",kind:"town",tier:"C",province_region_id:"PR-1",links:[{to:"W-1",hours:2}]},
  {id:"W-1",name:"銀穗野",kind:"wild",tier:"D",province_region_id:"PR-1",links:[{to:"T-1",hours:2}]}
 ]
};
let modal=null,travelled=null,registered=[];
const ctx=vm.createContext({DB,G:{character:{locationId:"T-1"}},console,
 showModal:(title,body)=>{modal={title,body}},
 openMapLocationDetail:id=>{travelled={id,detail:true};return true},
 travel:(id,hours,meta)=>{travelled={id,hours,meta};return true},
 QUNLU_CORE:{release:v=>v,registerModule:(p,m)=>registered.push([p,m])}
});
vm.runInContext(source,ctx,{filename:"src/witcher-map-core-v1.js"});
const call=code=>vm.runInContext(code,ctx);
assert.equal(call("runWitcherMapCoreAudit().pass"),true);
assert.equal(call("openWitcherMap('world')"),true);
assert.match(modal.body,/witcher-map-shell/);
assert.match(modal.body,/蒼翠王國圖/);
assert.doesNotMatch(modal.body,/world-mosaic|atlas-screen/);
assert.equal(call("openRegionMapGraphic('realm','RMAP-1')"),true);
assert.match(modal.body,/河谷行省/);
assert.equal(call("openRegionMapGraphic('province','PR-1')"),true);
assert.match(modal.body,/銀穗野/);
assert.equal(call("openMap()"),true);
assert.match(modal.body,/data-map-level="local"/);
assert.equal(call("openMapLocationDetail('W-1')"),true);
assert.match(modal.body,/data-map-level="local"/);
assert.equal(call("openProvinceCategoryMap('PR-1','wild')"),true);
assert.match(modal.body,/data-map-level="province"/);
assert.equal(call("witcherMapTravel('T-1')"),true);
assert.equal(travelled,null);
assert.equal(registered[0][0],"src/witcher-map-core-v1.js");
assert.equal(call("DB.meta.witcher_map_old_entrypoints_replaced"),true);
console.log("witcher map core regression OK: four-layer new renderer, legacy entry replacement, data-safe hierarchy and travel compatibility");
