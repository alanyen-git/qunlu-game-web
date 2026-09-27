#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const data=fs.readFileSync("src/game-data.js","utf8");
const starter=fs.readFileSync("src/starter-settlements-v1.js","utf8");
const survey=fs.readFileSync("src/map-survey-completion-v1.js","utf8");
const ctx=vm.createContext({console,globalThis:null,QUNLU_CORE:{release:v=>v,registerModule(){}}});
ctx.globalThis=ctx;
vm.runInContext(data+";globalThis.DB=DB;",ctx,{filename:"src/game-data.js",timeout:20000});
vm.runInContext(starter,ctx,{filename:"src/starter-settlements-v1.js",timeout:20000});
const linksBefore=JSON.stringify(ctx.DB.locations.map(x=>[x.id,x.links]));
vm.runInContext(survey,ctx,{filename:"src/map-survey-completion-v1.js"});
const db=ctx.DB,completion=db.map_survey_completion;
assert.equal(completion.status,"complete_for_current_playable_locations");
assert.equal(completion.location_count,db.locations.length);
assert.equal(JSON.stringify(completion.unresolved_location_ids),"[]");
assert.equal(completion.location_count,83);
for(const row of db.locations){
  const p=row.cartographic_coordinates;
  assert.ok(p&&Number.isFinite(p.x)&&Number.isFinite(p.y),"missing survey point "+row.id);
  assert.equal(p.source,"authored_regional_route_survey");
  assert.equal(p.precision,"regional_route");
}
assert.equal(JSON.stringify(db.locations.map(x=>[x.id,x.links])),linksBefore,"survey layer must not change canonical travel links");
assert.equal(survey.includes("Math.random"),false);
assert.equal(survey.includes("seeded("),false);
assert.equal(survey.includes("centroid("),false);
console.log("MAP-SURVEY-COMPLETION-1.0 regression OK: 83/83 current atlas locations have fixed route-survey coordinates; links and save-compatible travel data unchanged");
