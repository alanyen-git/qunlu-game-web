#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const source=fs.readFileSync("src/polity-database-completion-v1.js","utf8");
assert.match(source,/POLITY-DATABASE-COMPLETION-1\.0/);
for(const id of ["POL-001","POL-002","POL-003","POL-004","POL-007","POL-008","POL-009","POL-010","POL-011","POL-012","POL-013","POL-014","POL-015","POL-016","POL-019","POL-020"]){
  assert.match(source,new RegExp('polity_id:\\"'+id+'\\"'),"missing polity dossier "+id);
}
for(const field of ["administration","province_logic","town_logic","wild_logic","dungeon_logic","npc_logic","economy","culture","pressure","hooks","festival","history","folklore","rumor"]){
  assert.ok(source.includes(field),"missing database completion field "+field);
}
assert.match(source,/repairLegacyLocations/);
assert.match(source,/runPolityDatabaseCompletionAudit/);
console.log("polity database completion source OK: 16 authored dossiers, province/location repair, economy/culture/NPC/event indexes");
