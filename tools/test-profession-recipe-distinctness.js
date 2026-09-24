#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const sandbox={console,structuredClone,setTimeout,clearTimeout};
vm.createContext(sandbox);
const data=[
"src/game-data.js","src/data-patches.js",
"src/asdail-depth-v2.js","src/asdail-narrative-depth-v1.js","src/asdail-integration-v1.js",
"src/alchemy-healing-recipe-v1.js","src/equipment-depth-v1.js",
"src/crafting-recipe-semantic-v1.js","src/crafting-recipe-semantic-v2.js",
"src/equipment-recipe-balance-v1.js","src/recipe-economy-balance-v1.js",
"src/profession-recipe-differentiation-v1.js","src/recipe-finalization-v1.js"
];
for(const path of data)vm.runInContext(fs.readFileSync(path,"utf8"),sandbox,{filename:path,timeout:30000});
const get=vm.runInContext("id=>DB.items.find(x=>x.id===id)",sandbox);
const report=sandbox.runProfessionRecipeDifferentiationAudit();
for(const [name,result] of Object.entries({
 semantic:sandbox.runCraftingRecipeSemanticAuditV2(),
 equipment:sandbox.runEquipmentRecipeBalanceAudit(),
 economy:sandbox.runRecipeEconomyBalanceAudit(),
 healing:sandbox.runAlchemyHealingRecipeAudit(),
 differentiation:report,
 finalization:sandbox.runRecipeFinalizationAudit()
}))assert.equal(result.pass,true,name+": "+JSON.stringify(result.issues).slice(0,1400));
assert.equal(report.counts.professional_total,595);
assert.equal(report.counts.cooking,59);
assert.equal(report.counts.professional.鍛造,231);
assert.equal(report.counts.professional.裁縫,115);
assert.equal(report.counts.professional.藥劑,241);
assert.equal(report.counts.professional.附魔,8);
assert(report.changed_unique>=50,"too few differentiated products");
const ingr=d=>(d.craft_recipe.base_materials||[]).map(x=>x.id).sort();
const heal=get("PC-LIFE-02"),sustain=get("P7-05"),dheal=get("P-HEAL-D");
assert.equal(heal.use.hp,32);
assert.equal(sustain.use.hp,12);
assert.equal(dheal.use.hp,30);
assert.equal(dheal.use.regeneration.combat_hp_per_round,8);
assert.notDeepEqual(ingr(heal),ingr(get("P-HEAL-E")));
assert.notDeepEqual(ingr(heal),ingr(dheal));
assert.equal(get("P7-11").use.stamina,18);
assert(get("PC-LIFE-12").use.conditions.includes("bleed"));
assert.equal(get("P7-01").use.stamina,4);
assert.equal(get("PC-MANA-02").value,28);
assert.equal(get("PC-MANA-03").use.mana,28);
assert.equal(get("PC-MANA-07").buff.mana_regen,2);
assert.equal(get("P7-16").use.regeneration.combat_rounds,3);
assert.equal(get("P-GREATER-B").buff.statusResist,9);
assert.equal(get("P7-06").buff.attackSpeed,.04);
const forged=get("EQ31-054"),tailored=get("EQ31-055");
assert.equal(forged.craft_recipe.profession,"鍛造");
assert(ingr(forged).includes("MAT-ORE-18"));
assert.equal(tailored.craft_recipe.profession,"裁縫");
assert(ingr(tailored).includes("MAT-GEM-13"));
assert.equal(get("EQ7-W05").combat.critRate,2);
assert(ingr(get("EQ31-030")).includes("MAT31-CRAFT-02"));
assert(ingr(get("EQ31-075")).includes("MAT-ORE-02"));
assert(ingr(get("EQ31-074")).includes("MAT-CRAFT-18"));
assert.equal(get("EQ31-077").name,"風鬃風紋環");
const recipe=id=>vm.runInContext("DB.recipes.find(x=>x.id==="+JSON.stringify(id)+")",sandbox);
assert(recipe("R-IRONSTEW").requires["MAT-HERB-18"]>0);
assert(recipe("R7-17").requires["MAT-HERB-04"]>0);
assert(recipe("R7-21").requires["MAT-HERB-06"]>0);
assert.equal(get("F-IRON-STEW").use.stamina,12);
assert.equal(get("F7-17").use.mana,14);
assert.equal(get("F7-21").use.stamina,12);
// The production runtime must apply the newly introduced higher-tier regeneration, not just display its description.
const runtime=fs.readFileSync("src/runtime.js","utf8");
const a=runtime.indexOf("function applyConsumable(d){"),b=runtime.indexOf("function useItem(i){",a);
const c=runtime.indexOf("function tickBattleEffects(){"),e=runtime.indexOf("function enemyHasStatus(",c);
assert(a>=0&&b>a&&c>=0&&e>c);
const character={hp:20,maxHp:200,mana:0,maxMana:100,stamina:0,maxStamina:100,buffs:[],toxicity:0};
sandbox.G={character,battle:{active:true}};
sandbox.clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
sandbox.combatStats=()=>({healingPower:100});
sandbox.removeStatuses=()=>{};
sandbox.battleLog=()=>{};
vm.runInContext(runtime.slice(a,b)+runtime.slice(c,e),sandbox,{filename:"production-consumable-regression.js"});
const apply=vm.runInContext("applyConsumable",sandbox),tick=vm.runInContext("tickBattleEffects",sandbox);
assert.equal(apply(dheal).ok,true);
assert.equal(character.hp,50);
for(let i=0;i<3;i++)tick();
assert.equal(character.hp,74);
assert.equal(sandbox.G.battle.playerRegeneration,null);
character.hp=20;
assert.equal(apply(get("P7-16")).ok,true);
for(let i=0;i<3;i++)tick();
assert.equal(character.hp,110);
sandbox.G.battle=null;character.buffs=[];
apply(sustain);apply(dheal);
assert.equal(character.buffs.filter(b=>b.regen_source==="healing_potion").length,1,"field regen stacks unexpectedly");
console.log("profession recipe differentiation OK: 595 professional + 59 cooking; all five professions audited; "+report.changed_unique+" corrected targets; seven legacy audits passed; tiered regeneration combat/field passed");
