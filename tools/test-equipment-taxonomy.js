#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const specs=[["單手劍","短劍",1],["雙手劍","雙手劍",2],["單手斧","戰斧",1],["雙手斧","巨斧",2],["單手鎚","戰錘",1],["雙手鎚","戰鎚",2],["單手法杖","法杖",1],["雙手法杖","祈禱杖",2]];
const rows=specs.map(([kind,word,h],i)=>({id:"W"+i,name:"測試"+word,type:"主武器",catalog_group:"武器",weapon_profile:{hands:h,group:kind.includes("劍")?"長劍":kind.includes("法杖")?"法杖":"斧錘"}}));
rows.push({id:"S",name:"圓盾",type:"副武器",catalog_subcategory:"盾牌",combat:{attack:8}});
rows.push({id:"K",name:"遠雷武士刀",type:"主武器",catalog_group:"武器",weapon_profile:{hands:2,group:"長劍"}});
rows.push({id:"M",name:"秘銀礦",type:"礦石",material_group:"礦石與金屬素材"});
rows.push({id:"P",name:"生命藥水",type:"藥劑",consumable_group:"生命回復"});
rows.push({id:"B",name:"劍術技能殘本",type:"書籍",kind:"skill_fragment"});
rows.push({id:"F",name:"小麥",type:"食材"});
rows.push({id:"G",name:"灰門握鐵護手",type:"手套",catalog_group:"防具"});
const ctx=vm.createContext({DB:{items:rows,meta:{}},console});
vm.runInContext(fs.readFileSync("src/equipment-taxonomy-v1.js","utf8"),ctx);
for(let i=0;i<specs.length;i++){
 assert.equal(rows[i].catalog_subcategory,specs[i][0]);
 assert.equal(rows[i].weapon_profile.hands,specs[i][2]);
 assert(ctx.itemTradeTypeText(rows[i]).includes(specs[i][0]));
}
const shield=rows.find(x=>x.id==="S");
assert.equal(shield.catalog_group,"防具");assert.equal(Number(shield.combat.attack||0),0);assert(shield.combat.defense>0);
assert(ctx.itemTradeTypeText(shield).includes("裝備／防具／盾牌"));
assert(!rows.find(x=>x.id==="K").catalog_subcategory?.includes("劍"));
for(const [id,prefix] of [["M","素材／"],["P","道具／藥劑"],["B","道具／技能殘本"],["F","素材／食材"]])assert(ctx.itemTradeTypeText(rows.find(x=>x.id===id)).startsWith(prefix));
assert.equal(rows.find(x=>x.id==="G").name,"灰門鐵護手");
const snapshot=JSON.stringify(rows);ctx.runEquipmentTaxonomyNormalize();
assert.equal(JSON.stringify(rows),snapshot);assert(ctx.runEquipmentTaxonomyAudit().pass,JSON.stringify(ctx.runEquipmentTaxonomyAudit().issues));
for(const p of ["src/market-economy-v2.js","src/trade-venues-runtime-v1.js"])assert(fs.readFileSync(p,"utf8").includes("tradeKindHtml(d)"),p);
console.log("裝備分類／盾牌／命名／交易類別測試通過");

