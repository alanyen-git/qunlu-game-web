#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/world-map-province-atlas-v1.js","utf8");
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8");
const registry=fs.readFileSync("src/program-registry-v1.js","utf8"),version=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.match(source,/WORLD-MAP-PROVINCE-ATLAS-1\.1/);
assert.match(html,/src\/world-map-province-atlas-v1\.js\?v=CURRENT-2.25.15/);
assert.ok(sw.includes('"./src/world-map-province-atlas-v1.js"'));
assert.ok(registry.includes('"src/world-map-province-atlas-v1.js"'));
assert.equal(version.world_map_province_atlas_revision,"WORLD-MAP-PROVINCE-ATLAS-1.1");
assert.equal(version.world_map_province_atlas.entries,149);
const DB={meta:{current_version:"CURRENT-2.25.15"},political_entities:[{id:"POL-01",name:"蒼翠王國"}],world_regions:[{id:"REG-01",name:"蒼翠領"}],realm_region_maps:[{id:"RMAP-POL-01",name:"蒼翠王國圖",political_entity_id:"POL-01"}],province_region_maps:[
 {id:"PR-01",name:"河谷行省",political_entity_id:"POL-01",parent_realm_map_id:"RMAP-POL-01",world_region_id:"REG-01",world_tier:"C",tier:"C",capital_location_id:"T-01",orientation:"中央河谷東側",subordinate_settlement_ids:["T-01"],wild_location_ids:["W-01"],dungeon_location_ids:["D-01"]},
 {id:"PR-02",name:"北林行省",political_entity_id:"POL-01",parent_realm_map_id:"RMAP-POL-01",world_region_id:"REG-01",world_tier:"D",tier:"D",capital_location_id:"T-02",orientation:"王都北方山口",subordinate_settlement_ids:["T-02"],wild_location_ids:[],dungeon_location_ids:[]}
],locations:[
 {id:"T-01",name:"河谷城",kind:"town",province_region_id:"PR-01"},{id:"W-01",name:"銀穗野",kind:"wild",province_region_id:"PR-01"},{id:"D-01",name:"舊水窖",kind:"dungeon",province_region_id:"PR-01"},{id:"T-02",name:"北林鎮",kind:"town",province_region_id:"PR-02"}
],regional_npc_archetypes:[{id:"NPC-01",location_id:"T-01",role:"水務官"}],world_geopolitical_map:{canvas:{width:600,height:360},region_geometry:[{region_id:"REG-01",layer:"surface",points:[[20,20],[300,20],[300,260],[20,260]]}],region_adjacency:{"REG-01":[]}}};
const G={character:{locationId:"T-01"}};let modal=null,registered=[];
const context=vm.createContext({DB,G,console,showModal:(title,body)=>{modal={title,body}},document:{querySelector:()=>null},QUNLU_CORE:{release:v=>v,registerModule:(p,m)=>registered.push([p,m])}});
vm.runInContext(source,context,{filename:"src/world-map-province-atlas-v1.js"});
const call=code=>vm.runInContext(code,context);
const atlas=call("DB.world_map_province_atlas");
assert.equal(atlas.entries.length,2);
assert.equal(atlas.entries[0].capital_name,"河谷城");
assert.equal(JSON.stringify(atlas.entries[0].location_counts),JSON.stringify({towns:1,wilds:1,dungeons:1,total:3}));
assert.equal(atlas.entries[0].npc_count,1);
assert.equal(call("runWorldMapProvinceAtlasAudit().pass"),true);
assert.equal(call("openWorldMapProvinceAtlas()"),undefined);
assert.match(modal.title,/行省定位/);assert.match(modal.body,/河谷行省/);assert.match(modal.body,/openWorldMapProvinceDetails\('PR-01'\)/);
assert.equal(call("openWorldMapProvinceDetails('PR-01')"),true);
assert.match(modal.body,/開啟行省圖面/);assert.match(modal.body,/首都／行省中樞/);assert.match(modal.body,/城鎮 1、野外 1、地下城 1/);
assert.equal(registered[0][0],"src/world-map-province-atlas-v1.js");
console.log("world province atlas regression OK: 149-entry release metadata, hierarchical anchors, capital/location/NPC index, clickable world layer and audit");
