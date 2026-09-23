"use strict";
/* Regression: blacksmith/tailor/enchanter/alchemy each have purpose tabs; only learned recipes appear in crafting. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("src/runtime.js","utf8");
const base=source.indexOf("function recipeKnown(d){"),baseEnd=source.indexOf("function consumeIngredient(id,qty){",base);
const category=source.indexOf("const ALCHEMY_CRAFT_CATEGORY_ORDER="),categoryEnd=source.indexOf("}function pantheon(",category);
assert(base>=0&&baseEnd>base&&category>=0&&categoryEnd>category,"runtime snippets missing");
const specs={
 blacksmith:{profession:"鍛造",default:"武器",items:[["武器","鐵劍","主武器"],["盾牌","鐵盾","盾牌"],["防具","鐵甲","盔甲"],["飾品","鍛銀戒","飾品"],["工具／其他","工具","道具"]],unknown:["未學鐵劍","主武器"]},
 tailor:{profession:"裁縫",default:"衣甲",items:[["衣甲","旅人衣","盔甲"],["頭盔","布帽","頭盔"],["手套","皮手套","手套"],["鞋靴","皮靴","鞋子"],["披風","旅人披風","披風"],["飾品","絲繩戒","飾品"]],unknown:["未學布帽","頭盔"]},
 enchanter:{profession:"附魔",default:"武器附魔",items:[["武器附魔","附魔劍","主武器"],["盾牌附魔","附魔盾","盾牌"],["防具附魔","附魔護甲","盔甲"],["飾品附魔","附魔戒","飾品"],["飾品附魔","附魔披風","披風"]],unknown:["未學附魔鎧甲","盔甲"]},
 alchemy:{profession:"藥劑",default:"恢復",items:[["恢復","生命藥水","藥劑",{consumable_group:"生命回復",use:{hp:20}}],["傷害","爆裂藥瓶","藥劑",{battle_effect:{damage:20}}]],unknown:["未學爆裂藥瓶","藥劑",{battle_effect:{damage:15}}]}
};
const items=[],known=[];
for(const [fid,def] of Object.entries(specs)){
 def.items.forEach(([cat,name,type,extra],n)=>{
  const id=fid+"-"+n;items.push({id,name,tier:"F",type,recipe_access:"trainer",recipe_id:"RECIPE-"+id,recipe_level:1,
   craft_recipe:{requires_facility:fid,profession:def.profession},...(extra||{})});
  known.push("RECIPE-"+id);
 });
 const [name,type,extra]=def.unknown;
 items.push({id:fid+"-unknown",name,tier:"F",type,recipe_access:"trainer",recipe_id:"RECIPE-"+fid+"-unknown",recipe_level:1,
  craft_recipe:{requires_facility:fid,profession:def.profession},...(extra||{})});
}
const subs=Object.fromEntries(Object.entries(specs).map(([fid,v])=>[v.profession,{id:"SUB-"+fid,grade:"F",xp:0}]));
const G={character:{locationId:"TEST",currentFacility:"blacksmith",level:5,moneySilver:250,knownRecipes:known,
 subjobs:Object.values(subs)}};
const DB={items,recipes:[],meta:{},facilities:Object.fromEntries(Object.keys(specs).map(fid=>[fid,{name:fid}])),
 crafting_system:{facility_profession:Object.fromEntries(Object.entries(specs).map(([fid,def])=>[fid,def.profession])),
  profession_subjob:Object.fromEntries(Object.entries(specs).map(([fid,def])=>[def.profession,"SUB-"+fid]))}};
const sandbox={console,DB,G,CRAFT_CATEGORY_STATE:{},
 loc:()=>({tier:"D"}),tierOrder:t=>["F","E","D","C","B","A","S"].indexOf(t),
 subjobForProfession:p=>subs[p]||null,sub:id=>({name:id}),
 craftingRecipeMatchesFacility:(d,fid)=>d.craft_recipe?.requires_facility===fid,
 currentFacilityAllowsCrafting:fid=>fid===G.character.currentFacility,
 itemListCategoryLabel:d=>d.type,itemListCategories:ds=>[...new Set(ds.map(d=>d.type))],
 worldTierItemSort:(a,b)=>a.name.localeCompare(b.name,"zh-Hant"),
 tierGroupedItemRows:(ds,fn,empty)=>ds.map(fn).join("")||empty,
 craftResultLine:d=>d.name,craftMaterialText:()=>"材料",
 craftingMissing:()=>[],craftTimeHours:()=>1,craftMaxBatch:()=>10,
 showModal:(title,html)=>{sandbox.title=title;sandbox.html=html},
 alert:msg=>{throw Error(msg)},craftSuccessChance:()=>90,craftItemBatch:()=>null,cookBatch:()=>null,openCooking:()=>null};
vm.createContext(sandbox);
vm.runInContext(source.slice(base,baseEnd),sandbox,{filename:"known-and-training-runtime.js"});
vm.runInContext(source.slice(category,categoryEnd+1),sandbox,{filename:"category-runtime.js"});
const baseRenderer=vm.runInContext("openCrafting",sandbox);
vm.runInContext(fs.readFileSync("src/crafting-success-v2.js","utf8"),sandbox,{filename:"final-crafting-success-override.js"});
const render=vm.runInContext("openCrafting",sandbox);
assert.notEqual(render,baseRenderer,"regression must test FINAL renderer");
const labels=()=>[...sandbox.html.matchAll(/<b>([^<]+)<\/b> <span class="tier">/g)].map(m=>m[1]);
const tabs=fid=>[...sandbox.html.matchAll(new RegExp('onclick="openCrafting\\(\\x27'+fid+'\\x27,\\x27([^\\x27]+)\\x27\\)"','g'))].map(m=>m[1]);
const training=vm.runInContext("openCraftRecipeTraining",sandbox);
for(const [fid,def] of Object.entries(specs)){
 G.character.currentFacility=fid;
 render(fid);
 assert.equal(sandbox.CRAFT_CATEGORY_STATE[fid],def.default,"wrong default "+fid);
 const types=[...new Set(def.items.map(x=>x[0]))];
 assert.deepEqual(tabs(fid),types,"incorrect category tabs "+fid);
 assert(!tabs(fid).includes("全部"),fid+" should not show All");
 for(const cat of types){
  render(fid,cat);
  assert.deepEqual(labels(),def.items.filter(x=>x[0]===cat).map(x=>x[1]).sort((a,b)=>a.localeCompare(b,"zh-Hant")),fid+" category "+cat);
  assert(!sandbox.html.includes(def.unknown[0]),"unknown recipe leaked "+fid);
 }
 assert(sandbox.html.includes("學習配方 1"),fid+" missing learning button count");
 training(fid);
 assert.deepEqual(labels(),[def.unknown[0]],fid+" training list");
 render(fid,"全部");
 assert(!tabs(fid).includes("全部"),fid+" must ignore mixed All");
}
G.character.currentFacility="enchanter";
const saved=[...G.character.knownRecipes];
G.character.knownRecipes=G.character.knownRecipes.filter(id=>!id.startsWith("RECIPE-enchanter-"));
render("enchanter");
assert.equal(labels().length,0,"no known recipes must show empty production");
assert(sandbox.html.includes("學習配方 6"),"all unknown should still be discoverable");
training("enchanter");
assert.equal(labels().length,6);
G.character.knownRecipes=saved;
console.log("crafting profession tabs regression OK: 4 facilities; 5 blacksmith, 6 tailor, 4 enchanter, 2 alchemy categories; training isolated; empty recipes handled");
