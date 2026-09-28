#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/map-scene-v2.js","utf8");
const runtime=fs.readFileSync("src/runtime.js","utf8");
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8"),registry=fs.readFileSync("src/program-registry-v1.js","utf8");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));

assert.match(source,/MAP-SCENE-2\.2/);
assert.match(source,/continuous-canvas/);
assert.match(runtime,/Object\.defineProperty\(globalThis,"G"/);
assert.match(html,/src\/map-survey-completion-v1\.js\?v=CURRENT-2\.25\.13/);
assert.match(html,/src\/map-scene-v2\.js\?v=CURRENT-2\.25\.13/);
assert.doesNotMatch(html,/src\/witcher-map-core-v1\.js/);
assert.ok(sw.includes('"./src/map-scene-v2.js"'));
assert.ok(!sw.includes('"./src/witcher-map-core-v1.js"'));
assert.ok(registry.includes('"src/map-scene-v2.js"'));
assert.ok(!registry.includes('"src/witcher-map-core-v1.js"'));
assert.equal(version.map_scene_revision,"MAP-SCENE-2.2");
assert.equal(version.map_scene.legacy_renderer_active,false);
assert.equal(version.pwa_cache_revision,"v191");

const DB={meta:{current_version:"CURRENT-2.25.13"},world_geopolitical_map:{canvas:{width:900,height:560},region_geometry:[
 {region_id:"REG-1",layer:"surface",political_entity_id:"POL-1",points:[[20,20],[620,20],[620,430],[20,430]]}
],mountain_ranges:[{id:"MT-1",name:"長脊",regions:["REG-1"],points:[[70,90],[300,130],[520,100]]}],rivers:[{id:"RV-1",name:"銀河",regions:["REG-1"],points:[[150,30],[260,220],[220,420]]}],lakes:[],major_roads:[{id:"RD-1",name:"王道",regions:["REG-1"],points:[[80,300],[550,260]]}],border_passes:[{id:"PASS-1",name:"北隘",regions:["REG-1"],map_coordinates:[500,105]}],capitals:[{id:"CAP-1",name:"蒼翠城",political_entity_id:"POL-1",x:320,y:220}]},
 world_regions:[{id:"REG-1",name:"蒼翠領",political_entity_id:"POL-1"}],political_entities:[{id:"POL-1",name:"蒼翠王國"}],
 realm_region_maps:[{id:"RMAP-1",name:"蒼翠王國圖",political_entity_id:"POL-1",province_region_ids:["PR-1"]}],
 province_region_maps:[{id:"PR-1",name:"河谷行省",parent_realm_map_id:"RMAP-1",political_entity_id:"POL-1",world_region_id:"REG-1",world_tier:"C"}],
 locations:[
  {id:"T-1",name:"河谷城",kind:"town",tier:"C",province_region_id:"PR-1",realm_region_map_id:"RMAP-1",map_coordinates:[320,220],links:[{to:"W-1",hours:2}]},
  {id:"W-1",name:"銀穗野",kind:"wild",tier:"D",province_region_id:"PR-1",realm_region_map_id:"RMAP-1",cartographic_coordinates:{x:390,y:250,basis:"test"},links:[{to:"T-1",hours:2}]},
  {id:"T-2",name:"遠城",kind:"town",tier:"C",province_region_id:"PR-1",realm_region_map_id:"RMAP-1",links:[]}
 ]};
DB.map_survey_completion={version:"MAP-SURVEY-COMPLETION-1.0",status:"complete_for_current_playable_locations",location_count:3,unresolved_location_ids:[]};
let modal=null,travelled=null,registered=[];
const ctx=vm.createContext({DB,G:{character:{locationId:"T-1"}},console,
 showModal:(title,body)=>{modal={title,body}},travel:(id,hours,meta)=>{travelled={id,hours,meta};return true},
 setTimeout:()=>0,requestAnimationFrame:()=>0,
 QUNLU_CORE:{release:v=>v,registerModule:(p,m)=>registered.push([p,m]),registerAudit(){}}
});
vm.runInContext(source,ctx,{filename:"src/map-scene-v2.js"});
const call=code=>vm.runInContext(code,ctx);
assert.equal(call("runMapSceneV2Audit().pass"),true);
assert.equal(call("runMapSceneV2Audit().renderer"),"continuous-canvas");
assert.equal(call("openMapScene('world')"),true);
assert.match(modal.body,/data-map-scene="2\.2"/);
assert.match(modal.body,/mapsceneCanvas/);
assert.match(modal.body,/蒼翠王國圖/);
assert.doesNotMatch(modal.body,/witcher-map-shell|regionmap-province|world-mosaic/);
assert.equal(call("openRegionMapGraphic('province','PR-1')"),true);
assert.match(modal.body,/河谷城/);
assert.match(modal.body,/銀穗野/);
assert.doesNotMatch(modal.body,/待測繪/);
assert.equal(call("openRegionMapGraphic('realm','RMAP-1')"),true);
assert.match(modal.body,/data-map-level="realm"/);
assert.match(modal.body,/所轄行省/);
assert.match(modal.body,/政治體疆域圖面/);
assert.equal(call("openMapScene('realm')"),true);
assert.match(modal.body,/蒼翠王國圖/);
assert.equal(call("openRegionMapGraphic('province','PR-1')"),true);
assert.match(modal.body,/data-map-level="province"/);
assert.match(modal.body,/行省地形圖面/);
assert.equal(call("openMapScene('province')"),true);
assert.match(modal.body,/河谷行省/);
assert.equal(call("openMap()"),true);
assert.match(modal.body,/data-map-level="local"/);
assert.match(modal.body,/當地測繪圖面/);
assert.match(modal.body,/相鄰道路/);
assert.equal(call("openMapScene('local')"),true);
assert.match(modal.body,/河谷城/);
assert.equal(call("mapSceneTravel('W-1')"),true);
assert.equal(JSON.stringify(travelled),JSON.stringify({id:"W-1",hours:2}),"local map travel uses the canonical direct-link travel path for wild/dungeon targets");
travelled=null;
assert.equal(call("mapSceneTravel('T-2')"),false);
assert.equal(travelled,null);
assert.equal(registered[0][0],"src/map-scene-v2.js");
assert.equal(call("DB.meta.witcher_map_core_active"),false);
console.log("MAP-SCENE-2.2 regression OK: political/province/local layers, completed route survey, canonical geometry and direct-link travel");
