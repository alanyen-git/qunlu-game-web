#!/usr/bin/env node
"use strict";
/* Regression: category chips filter exclusively without changing original item indices or saves. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/runtime.js","utf8");
const start=source.indexOf("function inventoryCategory(d){"),end=source.indexOf("function removeStatuses(",start);
assert(start>0&&end>start,"current inventory renderer missing");
const entries=[
 ["weapon","訓練劍","主武器",1],
 ["potion","小型生命藥水","藥劑",3],
 ["food","燉肉","料理",2],
 ["ingredient","小麥","食材",4],
 ["supply","火把","補給",2],
 ["tool","礦鎬","工具",1],
 ["material","精鋼礦石","素材",321],
 ["book","遠行者手冊","書籍",1],
 ["misc","紀念徽章","雜項",1]
];
const items=Object.fromEntries(entries.map(([id,name,type])=>[id,{id,name,type,tier:"F",weight:0.1}]));
const character={inventory:entries.map(([id,,,qty])=>({id,qty}))};
const page={title:"",html:""},focused=[];
let saved=0;
const sandbox={
 G:{character},DB:{},console,
 item:id=>items[id],tierOrder:()=>0,calcWeight:()=>42,combatStats:()=>({carryCapacity:90}),
 sharedCarryCapacityBonus:()=>({teammates:{total:12},companions:{total:5}}),
 itemStatsText:()=>"",inventoryComparisonItem:()=>null,
 canEquipItem:()=>({ok:true}),isShieldItem:()=>false,isOneHandedWeapon:()=>false,
 equipmentActionButton:()=>'<button type="button">裝備</button>',
 showModal:(title,html)=>{page.title=title;page.html=html;},
 persist:()=>{saved++;},
 requestAnimationFrame:fn=>fn(),
 document:{querySelector:()=>({focus:()=>focused.push("category")})}
};
vm.createContext(sandbox);
vm.runInContext(source.slice(start,end),sandbox,{filename:"inventory-runtime.js"});
const call=(name,...args)=>vm.runInContext(name,sandbox)(...args);
const selected=()=>vm.runInContext("inventoryCategoryFilter",sandbox);
const categories=()=>Array.from(vm.runInContext("inventoryCategoryChips",sandbox));
const rows=()=>[...page.html.matchAll(/<div class="inventory-item-head">([^<]+) <span/g)].map(m=>m[1].trim());
const choose=label=>{const n=categories().indexOf(label);assert(n>=0,"missing category "+label);call("setInventoryCategory",n);};
call("openInventory");
assert.equal(page.title,"背包");
assert.equal(rows().length,entries.length,"default All must display every stack");
assert(page.html.includes('role="group" aria-label="背包物品分類"'));
assert(page.html.includes('onclick="setInventoryCategory(-1)"'));
assert(page.html.includes("全部 336"),"All count includes all quantities");
assert(page.html.includes("素材 321"),"chip quantity must show total qty, not stacks");
assert(page.html.includes('aria-pressed="true" onclick="setInventoryCategory(-1)"'));
for(const [category,name] of [["裝備","訓練劍"],["藥劑／消耗品","小型生命藥水"],["食物","燉肉"],["食材","小麥"],["補給","火把"],["工具","礦鎬"],["素材","精鋼礦石"],["書籍／卷軸／符文","遠行者手冊"],["其他","紀念徽章"]]){
 choose(category);
 assert.deepEqual(rows(),[name],"category must hide all other items: "+category);
 assert(page.html.includes('class="inventory-chip active"'),"selected chip must be active");
 assert(page.html.includes('role="status"'),"filter status missing");
}
choose("食材");
assert(page.html.includes('onclick="dropItem(3)"'),"filtered row must use original inventory index");
assert(!page.html.includes("燉肉"),"food cannot appear inside ingredients filter");
assert.equal(saved,0,"filtering cannot modify saves");
call("organizeInventory");
assert.equal(saved,1,"organize action must still persist");
assert.equal(selected(),"食材","filter should survive sorting");
assert.deepEqual(rows(),["小麥"],"filter should survive sorting");
call("setInventoryCategory",-1);
assert.equal(selected(),"全部");
assert.equal(rows().length,entries.length,"All restores every category");
choose("素材");
character.inventory=character.inventory.filter(x=>x.id!=="material");
call("openInventory");
assert.equal(selected(),"全部","missing category should reset to All after last stack is removed");
assert.equal(rows().length,entries.length-1);
character.inventory=[];
call("openInventory");
assert(page.html.includes("背包為空。"),"empty inventory hint missing");
assert(focused.length>0,"keyboard focus should return to selected chip");
console.log("inventory category buttons OK: exclusive filters, food vs ingredients, counts, original item indices, sort persistence, empty state, no save writes");
