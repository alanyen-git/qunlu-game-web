/* Regression: exercise actual renderer AFTER production success overrides runtime. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const runtime=fs.readFileSync("src/runtime.js","utf8");
const start=runtime.indexOf("const ALCHEMY_CRAFT_CATEGORY_ORDER=");
const stop=runtime.indexOf("}function pantheon(",start);
assert(start>=0&&stop>start,"missing runtime category classifier");
const runtimeSlice=runtime.slice(start,stop+1);
const purposes=[
 ["恢復","生命藥水",{consumable_group:"生命回復",use:{hp:20}}],
 ["傷害","爆裂藥瓶",{battle_effect:{damage:20}}],
 ["異常恢復","解毒藥水",{use:{conditions:["poison"]}}],
 ["增益","力量藥水",{buff:{attack:2}}],
 ["特殊","神祕催化劑",{}]
];
const alchemy=purposes.flatMap(([cat,base,fields],idx)=>Array.from({length:18},(_,n)=>({
 id:"AL-"+idx+"-"+n,name:base+(n+1),tier:"F",type:"藥劑",
 ...fields,craft_recipe:{profession:"藥劑",requires_facility:"alchemy"}
})));
const blacksmith={id:"BLACKSMITH",name:"鐵劍",tier:"F",type:"主武器",craft_recipe:{profession:"鍛造",requires_facility:"blacksmith"}};
const state={};
const sandbox={
 console,
 DB:{
  items:[...alchemy,blacksmith],recipes:[],meta:{},
  facilities:{alchemy:{name:"煉金店"},blacksmith:{name:"鐵匠鋪"}},
  crafting_system:{facility_profession:{alchemy:"藥劑",blacksmith:"鍛造"},profession_subjob:{藥劑:"AL",鍛造:"SMITH"}}
 },
 G:{character:{locationId:"TEST",currentFacility:"alchemy",level:1,subjobs:[{id:"AL",grade:"F",xp:0}]}},
 CRAFT_CATEGORY_STATE:state,craftSuccessChance:()=>90,craftItemBatch:()=>null,cookBatch:()=>null,openCooking:()=>null,
 currentFacilityAllowsCrafting:()=>true,loc:()=>({tier:"F"}),tierOrder:()=>0,
 subjobForProfession:p=>({id:p==="鍛造"?"SMITH":"AL",grade:"F",xp:0}),
 sub:id=>({name:id==="SMITH"?"鍛造師":"煉金師"}),
 craftingRecipeMatchesFacility:(d,fid)=>d.craft_recipe?.requires_facility===fid,
 craftingRecipeVisible:()=>true,recipeKnown:()=>true,recipeCanLearn:()=>false,craftingLearningCandidates:()=>[],
 itemListCategories:list=>[...new Set(list.map(d=>d.type==="主武器"?"武器":"藥劑"))],
 itemListCategoryLabel:d=>d.type==="主武器"?"武器":"藥劑",
 tierGroupedItemRows:(list,fn,empty)=>list.map(fn).join("")||empty,
 worldTierItemSort:()=>0,craftResultLine:d=>d.name,craftMaterialText:()=>"材料",
 craftingMissing:()=>[],craftTimeHours:()=>1,
 craftMaxBatch:()=>10,recipeLearnFee:()=>4,
 showModal:(title,html)=>{sandbox.lastTitle=title;sandbox.lastHtml=html},
 alert:msg=>{throw Error(msg)}
};
vm.createContext(sandbox);
vm.runInContext(runtimeSlice,sandbox,{filename:"runtime-category-slice.js"});
const baseRenderer=vm.runInContext("openCrafting",sandbox);
const classify=vm.runInContext("alchemyRecipeCategory",sandbox);
assert.deepEqual(purposes.map(([,name,fields])=>classify({...fields,name})),purposes.map(([cat])=>cat));
vm.runInContext(fs.readFileSync("src/crafting-success-v2.js","utf8"),sandbox,{filename:"crafting-success-v2.js"});
const render=vm.runInContext("openCrafting",sandbox);
assert.notEqual(render,baseRenderer,"must test final overridden renderer");
const rows=()=>[...sandbox.lastHtml.matchAll(/<b>([^<]+)<\/b> <span class="tier">/g)].map(x=>x[1]);
const tabs=()=>[...sandbox.lastHtml.matchAll(/onclick="openCrafting\('alchemy','([^']+)'\)"/g)].map(x=>x[1]);
render("alchemy");
assert.equal(state.alchemy,"恢復");
assert.equal(rows().length,18,"default recovery must show 18 out of 90 recipes");
assert(rows().every(x=>x.startsWith("生命藥水")));
assert.deepEqual(tabs(),purposes.map(([cat])=>cat));
assert(!sandbox.lastHtml.includes("openCrafting('alchemy','全部')"),"alchemy must not expose All");
for(const [cat,name] of purposes){
 render("alchemy",cat);
 assert.equal(state.alchemy,cat);
 assert.equal(rows().length,18,cat+" must display its own 18 recipes");
 assert(rows().every(x=>x.startsWith(name)),cat+" includes unrelated recipes");
 assert(sandbox.lastHtml.includes(cat+" 18"),cat+" tab count wrong");
}
render("alchemy","全部");
assert.equal(state.alchemy,"特殊","invalid All must not bypass filtering");
assert.equal(rows().length,18);
render("alchemy","恢復");render("alchemy");
assert.equal(rows().length,18,"category selection lost between redraws");
sandbox.G.character.currentFacility="blacksmith";
render("blacksmith");
assert(sandbox.lastHtml.includes("openCrafting('blacksmith','武器')"),"blacksmith should use its weapon-only category");
assert(!sandbox.lastHtml.includes("openCrafting('blacksmith','全部')"),"blacksmith should not show a mixed All list");
assert.deepEqual(rows(),["鐵劍"]);
console.log("alchemy effective renderer regression OK: late override, 90 recipes -> five single-purpose tabs, no All, categorized blacksmith");
