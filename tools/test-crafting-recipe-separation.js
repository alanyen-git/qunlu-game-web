"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/runtime.js","utf8");
const a=source.indexOf("function recipeKnown(d){"),b=source.indexOf("function consumeIngredient(id,qty){",a);
const c=source.indexOf("const ALCHEMY_CRAFT_CATEGORY_ORDER="),d=source.indexOf("}function pantheon(",c);
assert(a>=0&&b>a&&c>=0&&d>c);
const make=(id,facility,access,tier="F")=>({id,name:id,tier,type:"藥劑",recipe_id:"R-"+id,recipe_access:access,recipe_level:1,value:60,craft_recipe:{profession:facility==="alchemy"?"藥劑":"鍛造",requires_facility:facility},consumable_group:"生命回復"});
const items=[make("KNOWN","alchemy","trainer"),make("PUBLIC","alchemy","public"),make("UNLEARNED","alchemy","trainer"),make("D-LOCKED","alchemy","trainer","D"),make("SPECIAL","alchemy","special","E"),make("B-HIDDEN","alchemy","trainer","B"),make("SMITH-KNOWN","blacksmith","trainer"),make("SMITH-NEW","blacksmith","trainer")];
const G={character:{locationId:"LOC",currentFacility:"alchemy",moneySilver:100,level:5,knownRecipes:["R-KNOWN","R-SMITH-KNOWN"],subjobs:[{id:"AL",grade:"F",xp:0},{id:"SM",grade:"F",xp:0}]}};
const ctx={console,G,DB:{items,recipes:[],meta:{},facilities:{alchemy:{name:"煉金店"},blacksmith:{name:"鐵匠鋪"}},crafting_system:{facility_profession:{alchemy:"藥劑",blacksmith:"鍛造"},profession_subjob:{藥劑:"AL",鍛造:"SM"}}},CRAFT_CATEGORY_STATE:{},
loc:()=>({tier:"D"}),tierOrder:t=>["F","E","D","C","B","A","S"].indexOf(t),
subjobForProfession:p=>G.character.subjobs.find(x=>x.id===(p==="藥劑"?"AL":"SM")),sub:id=>({name:id}),
item:id=>items.find(x=>x.id===id),craftingRecipeMatchesFacility:(x,f)=>x.craft_recipe?.requires_facility===f,currentFacilityAllowsCrafting:f=>f===G.character.currentFacility,
itemListCategories:xs=>[...new Set(xs.map(x=>x.type))],itemListCategoryLabel:x=>x.type,
tierGroupedItemRows:(xs,fn,empty)=>xs.map(fn).join("")||empty,worldTierItemSort:(x,y)=>["F","E","D","C","B","A","S"].indexOf(x.tier)-["F","E","D","C","B","A","S"].indexOf(y.tier),
craftResultLine:x=>x.name,craftMaterialText:()=>"",craftingMissing:()=>[],craftTimeHours:()=>1,craftMaxBatch:()=>10,
showModal:(title,html)=>{ctx.html=html},alert:x=>{throw Error(x)},closeModal:()=>{},beginTurn:()=>true,log:()=>{},endTurn:()=>{},renderFacility:()=>{},
craftSuccessChance:()=>90,craftItemBatch:()=>null,openCooking:()=>null,cookBatch:()=>null};
vm.createContext(ctx);vm.runInContext(source.slice(a,b),ctx);vm.runInContext(source.slice(c,d+1),ctx);
const original=vm.runInContext("openCrafting",ctx);
vm.runInContext(fs.readFileSync("src/crafting-success-v2.js","utf8"),ctx);
const render=vm.runInContext("openCrafting",ctx),training=vm.runInContext("openCraftRecipeTraining",ctx),learn=vm.runInContext("learnCraftRecipe",ctx);
assert.notEqual(render,original,"late override missing");
const names=()=>[...ctx.html.matchAll(/<b>([^<]+)<\/b> <span class="tier">/g)].map(x=>x[1]);
render("alchemy");assert.deepEqual(names(),["KNOWN","PUBLIC"]);assert(ctx.html.includes("學習配方 3"));assert(!ctx.html.includes("learnCraftRecipe("));
training("alchemy");assert.deepEqual(names(),["UNLEARNED","SPECIAL","D-LOCKED"]);assert(ctx.html.includes("需要副職業D級"));assert(ctx.html.includes("特殊來源"));assert(!ctx.html.includes("B-HIDDEN"));
learn("D-LOCKED");learn("SPECIAL");assert.equal(G.character.knownRecipes.length,2);
const money=G.character.moneySilver;learn("UNLEARNED");assert(G.character.knownRecipes.includes("R-UNLEARNED"));assert(G.character.moneySilver<money);
assert.deepEqual(names(),["KNOWN","PUBLIC","UNLEARNED"]);assert(ctx.html.includes("學習配方 2"));
training("alchemy");assert.deepEqual(names(),["SPECIAL","D-LOCKED"]);
G.character.currentFacility="blacksmith";render("blacksmith");assert.deepEqual(names(),["SMITH-KNOWN"]);assert(ctx.html.includes("學習配方 1"));
training("blacksmith");assert.deepEqual(names(),["SMITH-NEW"]);
console.log("crafting recipe separation regression OK: late override; known vs unlearned; locked and special; all professions");
