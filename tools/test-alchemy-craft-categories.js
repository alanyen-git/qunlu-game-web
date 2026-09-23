/* Regression: alchemy category buttons must show only one recipe purpose. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const src=fs.readFileSync("src/runtime.js","utf8");
const begin=src.indexOf("const ALCHEMY_CRAFT_CATEGORY_ORDER=");
const end=src.indexOf("}function pantheon(",begin);
assert(begin>=0&&end>begin,"missing alchemy crafting runtime");
const moduleSrc=src.slice(begin,end+1);
const items=[
 {id:"HEAL",name:"生命藥水",tier:"F",type:"藥劑",consumable_group:"生命回復",use:{hp:20}},
 {id:"DAMAGE",name:"爆裂藥瓶",tier:"F",type:"藥劑",battle_effect:{damage:20}},
 {id:"CURE",name:"解毒藥水",tier:"F",type:"藥劑",use:{conditions:["poison"]}},
 {id:"BUFF",name:"力量藥水",tier:"F",type:"藥劑",buff:{attack:2}},
 {id:"SPECIAL",name:"神祕催化劑",tier:"F",type:"藥劑"}
].map(d=>({...d,craft_recipe:{profession:"藥劑",requires_facility:"alchemy"}}));
const state={};
const sandbox={
 DB:{items,facilities:{alchemy:{name:"煉金工坊"}},crafting_system:{facility_profession:{alchemy:"藥劑"}}},
 G:{character:{locationId:"TEST",currentFacility:"alchemy",level:1,subjobs:[{id:"AL",grade:"F",xp:0}]}},
 CRAFT_CATEGORY_STATE:state,
 currentFacilityAllowsCrafting:()=>true,loc:()=>({tier:"F"}),tierOrder:()=>0,
 subjobForProfession:()=>({id:"AL",grade:"F",xp:0}),sub:()=>({name:"煉金師"}),
 craftingRecipeMatchesFacility:(d,fid)=>d.craft_recipe?.requires_facility===fid,
 craftingRecipeVisible:()=>true,recipeKnown:()=>true,recipeCanLearn:()=>false,
 itemListCategories:()=>["藥劑"],itemListCategoryLabel:()=>"藥劑",
 tierGroupedItemRows:(list,fn,empty)=>list.map(fn).join("")||empty,
 worldTierItemSort:()=>0,craftResultLine:d=>d.name,craftMaterialText:()=>"材料",
 craftingMissing:()=>[],craftSuccessChance:()=>90,craftTimeHours:()=>1,
 craftMaxBatch:()=>10,recipeLearnFee:()=>4,showModal:(title,html)=>{sandbox.lastHtml=html},
 alert:msg=>{throw Error(msg)}
};
vm.createContext(sandbox);
vm.runInContext(moduleSrc,sandbox,{filename:"alchemy-runtime-slice.js"});
const category=vm.runInContext("alchemyRecipeCategory",sandbox);
assert.deepEqual(items.map(category),["恢復","傷害","異常恢復","增益","特殊"]);
const render=vm.runInContext("openCrafting",sandbox);
const extract=()=>[...sandbox.lastHtml.matchAll(/<b>([^<]+)<\/b> <span class="tier">/g)].map(x=>x[1]);
render("alchemy");
assert.equal(state.alchemy,"恢復");
assert.deepEqual(extract(),["生命藥水"]);
assert(!sandbox.lastHtml.includes("onclick=\"openCrafting('alchemy','全部')\""),"alchemy must not expose All");
for(const [tab,id] of [["傷害","爆裂藥瓶"],["異常恢復","解毒藥水"],["增益","力量藥水"],["特殊","神祕催化劑"]]){
 render("alchemy",tab);assert.equal(state.alchemy,tab);assert.deepEqual(extract(),[id],tab);
}
render("alchemy","全部");
assert.equal(state.alchemy,"特殊","invalid All must not expose all recipes");
assert.deepEqual(extract(),["神祕催化劑"]);
render("alchemy","恢復");
render("alchemy");
assert.deepEqual(extract(),["生命藥水"],"selection should persist");
console.log("alchemy craft category regression OK: five single-purpose tabs, no all, selection retained");
