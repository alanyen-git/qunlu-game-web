#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const globalThis={QUNLU_RELEASE_VERSION:"CURRENT-2.25.21"};
globalThis.globalThis=globalThis;
const ctx=vm.createContext({globalThis,console});
vm.runInContext(fs.readFileSync("src/game-data.js","utf8"),ctx);
vm.runInContext(fs.readFileSync("src/data-patches.js","utf8"),ctx);
vm.runInContext(fs.readFileSync("src/equipment-taxonomy-v1.js","utf8"),ctx);
vm.runInContext("globalThis.TEST_DB=DB",ctx);
const DB=globalThis.TEST_DB;

assert.equal(DB.meta.item_role_taxonomy_revision,"ITEM-ROLE-TAXONOMY-1.0");
const roleItems=DB.items.filter(d=>d.taxonomy_role);
assert(roleItems.length>=49,`正規化通用道具不足：${roleItems.length}`);
for(const d of roleItems){
  assert(d.material_group==null,`${d.id}仍含material_group`);
  assert(d.core_material==null,`${d.id}仍含core_material`);
  assert(d.core_material_index==null,`${d.id}仍含core_material_index`);
  assert(!globalThis.itemTradeTypeText(d).startsWith("素材／"),`${d.id}交易類別仍是素材`);
}

const expected={
  "MAT-UTIL-08":["tool","工具","道具／工具"],
  "MAT-UTIL-09":["tool","工具","道具／工具"],
  "MAT-UTIL-10":["tool","工具","道具／工具"],
  "MAT-UTIL-01":["key","任務／寶物","道具／鑰匙"],
  "MAT-UTIL-16":["treasure","任務／寶物","道具／寶物"],
  "MAT-UTIL-19":["quest","任務／寶物","道具／任務道具"],
  "MAT-SCR-10":["rune","書籍／卷軸／符文","道具／符文"]
};
for(const [id,[role,inventory,label]] of Object.entries(expected)){
  const d=DB.items.find(x=>x.id===id);assert(d,id);
  assert.equal(d.taxonomy_role,role,id);assert.equal(d.inventory_group,inventory,id);assert.equal(globalThis.itemTradeTypeText(d),label,id);
}

const tools=new Set(DB.items.filter(d=>d.taxonomy_role==="tool").map(d=>d.id));
for(const q of [...(DB.quests||[]),...(DB.authority_requests||[])]){
  const o=q.objective||{};
  if(["gather","item"].includes(o.kind)&&o.consume_on_turnin!==false)assert(!tools.has(o.item_id),`${q.id}把工具當成交付素材`);
}
for(const l of DB.locations||[])for(const id of [...(l.gather||[]),...(l.mining||[]),...(l.woodcut||[])])assert(!tools.has(id),`${l.id}把工具放入資源池`);

const runtime=fs.readFileSync("src/runtime.js","utf8");
const categoryBlock=runtime.slice(runtime.indexOf("function itemListCategoryLabel"),runtime.indexOf("function worldTierItemSort"));
assert(categoryBlock.indexOf('d.tool_effect')<categoryBlock.indexOf('d.material_group'),"商店分類沒有先判定工具");
assert(categoryBlock.indexOf('d.knowledge_tag')<categoryBlock.indexOf('d.material_group'),"商店分類沒有先判定知識道具");
assert(runtime.includes('["任務","任務道具","寶藏","鑰匙"]'),"任務道具分類未涵蓋任務道具");
assert(runtime.includes('d.material_group&&!explicitNonMaterial'),"玩家說明仍可能顯示非素材的舊素材群組");
console.log(`通用道具分類回歸測試通過：${roleItems.length}筆非素材道具，工具不進素材委託／資源池`);
