"use strict";
/* Cooking category / learning / legacy save regression using the FINAL production renderer. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/runtime.js","utf8"),production=fs.readFileSync("src/crafting-success-v2.js","utf8");
const begin=source.indexOf("function cookingOutputItem(r){"),end=source.indexOf("function getMissingMaterials(r){",begin);
assert(begin>=0&&end>begin,"cooking runtime slice missing");
assert(source.includes("knownCookingRecipes:cookingLegacyKnownRecipes")||source.includes("c.knownCookingRecipes=cookingLegacyKnownRecipes(c)"),"old save migration missing");
assert(source.includes("knownRecipes:[],knownCookingRecipes:[]"),"fresh characters need empty known recipe state");
const kinds=[
 ["主食","麥香麵包","主食"],
 ["肉類","山豬烤肉","肉類"],
 ["魚鮮","河鮮炙魚","魚鮮"],
 ["湯品","蘑菇濃湯","湯品"],
 ["蔬果","野菜沙拉","蔬果"],
 ["飲品","薄荷涼水","飲品"],
 ["甜點","莓果蛋糕","甜點"],
 ["其他","旅人雜燴","特殊"]
];
const items=kinds.map(([cat,name,sub],n)=>({id:"OUT-"+n,name,tier:"F",type:"料理",food_subtype:sub,value:30}));
items.push({id:"OUT-TRAIN",name:"蜜香麥飲",tier:"E",type:"料理",food_subtype:"飲品",value:45});
items.push({id:"OUT-SPECIAL",name:"秘製龍肉排",tier:"E",type:"料理",food_subtype:"肉類",value:45});
items.push({id:"OUT-LOCKED",name:"王室燴飯",tier:"D",type:"料理",food_subtype:"主食",value:60});
items.push({id:"OUT-UNKNOWN",name:"試作薄荷涼水",tier:"F",type:"料理",food_subtype:"飲品",value:10});
const recipes=kinds.map(([cat,name],n)=>({id:"R-"+n,name,tier:"F",result:"OUT-"+n,profession:"料理",cook_grade:null,requires:{MAT:1}}));
recipes.push({id:"R-TRAIN",name:"蜜香麥飲",tier:"E",result:"OUT-TRAIN",profession:"料理",cook_grade:"F",requires:{MAT:1}});
recipes.push({id:"R-SPECIAL",name:"秘製龍肉排",tier:"E",result:"OUT-SPECIAL",profession:"料理",cook_grade:"F",recipe_access:"special",requires:{MAT:1}});
recipes.push({id:"R-LOCKED",name:"王室燴飯",tier:"D",result:"OUT-LOCKED",profession:"料理",cook_grade:"D",requires:{MAT:1}});
recipes.push({id:"R-UNKNOWN",name:"試作薄荷涼水",tier:"F",result:"OUT-UNKNOWN",profession:"料理",recipe_access:"trainer",cook_grade:"F",requires:{MAT:1}});
const G={character:{locationId:"TEST",level:10,moneySilver:100,subjobs:[{id:"SJ-COOK",grade:"F",xp:0}],
 knownCookingRecipes:[],knownRecipes:[],inventory:[]}};
const item=id=>items.find(d=>d.id===id);
let modal={title:"",html:""},message="";
const context={
 console,G,DB:{recipes,items,meta:{},crafting_system:{profession_subjob:{料理:"SJ-COOK"}}},
 IDX:{recipe:new Map(recipes.map(r=>[r.id,r]))},item,loc:()=>({tier:"D"}),sub:()=>({name:"烹飪師"}),
 tierOrder:t=>["F","E","D","C","B","A","S"].indexOf(t),
 worldTierItemSort:(a,b)=>a.tier.localeCompare(b.tier)||a.name.localeCompare(b.name,"zh-Hant"),
 tierGroupedItemRows:(rs,fn,empty)=>rs.length?rs.map(fn).join(""):empty,
 cookingMaterialText:()=>"需要素材：測試",craftResultLine:r=>r?.name||"無",
 showModal:(title,html)=>{modal={title,html}},alert:msg=>{message=msg},
 closeModal:()=>{},beginTurn:()=>true,endTurn:()=>{},log:()=>{},
 craftSuccessChance:()=>90,craftItemBatch:()=>null,cookBatch:()=>null,
};
vm.createContext(context);
vm.runInContext(source.slice(begin,end),context,{filename:"cooking-base.js"});
const get=key=>vm.runInContext(key,context);
const baseRenderer=get("openCooking");
const classify=get("cookingCategoryLabel");
for(let n=0;n<kinds.length;n++)assert.equal(classify(recipes[n]),kinds[n][0]);
const legacy=get("cookingLegacyKnownRecipes");
const previous=legacy({subjobs:[{id:"SJ-COOK",grade:"F"}]});
assert(previous.includes("R-TRAIN"),"legacy grade F could cook E recipes and must retain them");
assert(!previous.includes("R-LOCKED"),"legacy unavailable high grade cannot be granted");
assert(previous.includes("R-SPECIAL"),"legacy available special recipe remains accessible");
vm.runInContext(production,context,{filename:"crafting-success-v2.js"});
const render=get("openCooking"),training=get("openCookingRecipeTraining"),learn=get("learnCookingRecipe"),known=get("cookingRecipeKnown");
assert.notEqual(render,baseRenderer,"last-loaded renderer must be tested");
const names=()=>[...modal.html.matchAll(/<b>([^<]+)<\/b> <span class="tier">/g)].map(x=>x[1]);
const buttons=()=>[...modal.html.matchAll(/onclick="openCooking\('([^']+)'\)"/g)].map(x=>x[1]);
render();
assert.deepEqual(buttons(),kinds.map(x=>x[0]),"eight distinct cooking category tabs");
assert.deepEqual(names(),["麥香麵包"],"initial cooking should display only the first learned category");
assert(!modal.html.includes("openCooking('全部')"));
assert(modal.html.includes("學習配方 4"),"learning count must cover accessible unknown recipes");
for(const [category,name] of kinds){
 render(category);
 assert.deepEqual(names(),[name],category+" leaked recipes");
}
render("飲品");render();
assert.deepEqual(names(),["薄荷涼水"],"selection must persist");
training();
assert.deepEqual(names().sort(),["蜜香麥飲","秘製龍肉排","王室燴飯","試作薄荷涼水"].sort(),"training list missing unknown recipes");
assert(modal.html.includes("需要烹飪D級"),"unmet subjob grade should display");
assert(modal.html.includes("特殊來源"),"special acquisition information missing");
assert(!modal.html.includes("麥香麵包"),"learned recipe shown under training");
learn("R-SPECIAL");learn("R-LOCKED");
assert.equal(G.character.knownCookingRecipes.length,0,"locked or special recipe was learned");
message="";
get("cookBatch")("R-TRAIN",1);
assert(message.includes("尚未學會"),"direct cooking bypass should be blocked");
const silver=G.character.moneySilver;
learn("R-TRAIN");
assert(known(recipes[8]),"learned recipe status did not persist");
assert(G.character.moneySilver<silver,"learning should charge silver");
assert.deepEqual(names(),["蜜香麥飲"],"newly learned recipe should open its cooking category");
assert(modal.html.includes("學習配方 3"),"learning count should update");
training();
assert(!names().includes("蜜香麥飲"),"learned recipe remains in training");
const migrated=legacy({subjobs:[{id:"SJ-COOK",grade:"F"}]});
G.character.knownCookingRecipes=migrated;
render("肉類");assert(names().includes("秘製龍肉排"),"migration did not preserve previously usable recipe");
G.character.knownCookingRecipes=[];G.character.subjobs=[];
render("飲品");
assert.deepEqual(names(),["薄荷涼水"],"new character should retain F public recipe without subjob");
assert(modal.html.includes("學習配方 1"),"untrained character should see only visible F trainer recipes, with locked requirements");
console.log("cooking tabs/learning regression OK: eight categories, isolated known/unknown, late override, batch gate, legacy saves, F starters");
