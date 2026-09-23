/* 群陸旅誌：全生產製作成功率與煉金用途分類 CURRENT-2.13.5
 * PRODUCTION-CRAFT-SUCCESS-2.0
 * 鍛造／裁縫／藥劑／附魔／料理統一由能力、天賦、副職業階級與熟練等級、配方難度共同決定成功率。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.71.2";
const REV="PRODUCTION-CRAFT-SUCCESS-2.1";
const PROFILE={
  鍛造:{sid:"SJ-SMITH",primary:"力量",secondary:"敏捷"},
  裁縫:{sid:"SJ-TAILOR",primary:"敏捷",secondary:"智力"},
  藥劑:{sid:"SJ-POTION",primary:"智力",secondary:"意志"},
  煉金:{sid:"SJ-ALCHEMY",primary:"智力",secondary:"意志"},
  附魔:{sid:"SJ-ENCHANT",primary:"智力",secondary:"意志"},
  卷軸:{sid:"SJ-SCROLL",primary:"智力",secondary:"意志"},
  料理:{sid:"SJ-COOK",primary:"敏捷",secondary:"智力"}
};
const SUBJOB_LEVEL_XP=[0,60,140,260,420,650,950,1300,1700,2150];
const round1=n=>Math.round(Number(n||0)*10)/10;
const sign=n=>Number(n)>=0?"+":"";

function productionSubjobLevel(j){
  if(!j)return 0;
  const xp=Math.max(0,Number(j.xp||0));
  let lv=1;
  for(let i=1;i<SUBJOB_LEVEL_XP.length;i++)if(xp>=SUBJOB_LEVEL_XP[i])lv=i+1;
  return Math.min(10,lv)
}

function productionCraftingSuccessBreakdown(prof,tier,j=null,sid=null){
  const p=PROFILE[prof]||PROFILE.料理;
  sid=sid||j?.id||p.sid;
  const trained=!!j;
  const primary=typeof effectiveStat==="function"?effectiveStat(p.primary):10;
  const secondary=typeof effectiveStat==="function"?effectiveStat(p.secondary):10;
  const luck=typeof effectiveStat==="function"?effectiveStat("幸運"):10;
  const abilityBonus=primary*1.15+secondary*.45;
  const luckBonus=luck*.35;
  const trainedBonus=trained?8:0;
  const gradeBonus=trained&&typeof tierOrder==="function"?tierOrder(j.grade||"F")*4:0;
  const level=productionSubjobLevel(j);
  const levelBonus=trained?Math.max(0,level-1)*1.25:0;
  const talentBonus=typeof talentSubjobBonus==="function"?Number(talentSubjobBonus(sid,"success")||0):0;
  const affiliationBonus=typeof affiliationEffects==="function"?Number(affiliationEffects()?.craft_success||0):0;
  const difficulty=typeof tierOrder==="function"?tierOrder(tier||"F")*6.5:0;
  const raw=46+abilityBonus+luckBonus+trainedBonus+gradeBonus+levelBonus+talentBonus+affiliationBonus-difficulty;
  const chance=typeof clamp==="function"?Math.round(clamp(raw,20,95)):Math.round(Math.max(20,Math.min(95,raw)));
  return {
    profession:prof,tier:tier||"F",sid,
    chance,
    primary:{name:p.primary,value:primary,weight:1.15},
    secondary:{name:p.secondary,value:secondary,weight:.45},
    luck:{name:"幸運",value:luck,weight:.35},
    ability_bonus:round1(abilityBonus),
    luck_bonus:round1(luckBonus),
    trained_bonus:trainedBonus,
    grade:j?.grade||null,
    grade_bonus:round1(gradeBonus),
    subjob_level:level,
    subjob_xp:Number(j?.xp||0),
    level_bonus:round1(levelBonus),
    talent_bonus:round1(talentBonus),
    affiliation_bonus:round1(affiliationBonus),
    difficulty_penalty:round1(difficulty),
    min_chance:20,max_chance:95
  }
}

function productionCraftingSuccessText(b){
  if(!b)return "";
  const skill=b.grade? `${b.grade}級／熟練Lv${b.subjob_level}` : "未取得副職業";
  const talent=b.talent_bonus?`｜天賦 ${sign(b.talent_bonus)}${b.talent_bonus}`:"";
  const affiliation=b.affiliation_bonus?`｜組織 ${sign(b.affiliation_bonus)}${b.affiliation_bonus}`:"";
  return `${b.primary.name}${b.primary.value}＋${b.secondary.name}${b.secondary.value}＋幸運${b.luck.value}｜${skill}${talent}${affiliation}｜配方難度 -${b.difficulty_penalty}`;
}

craftSuccessChance=function(d,j){
  if(!d?.craft_recipe)return 0;
  return productionCraftingSuccessBreakdown(d.craft_recipe.profession,d.tier,j,j?.id).chance
};

craftItemBatch=function(itemId,count=1){
  count=Math.max(1,Math.min(10,Number(count)||1));
  const d=item(itemId),r=d?.craft_recipe,j=d&&subjobForProfession(r?.profession),fid=r?.requires_facility;
  if(!d||!r||!j){alert("缺少對應副職業。");return}
  if(!craftingRecipeMatchesFacility(d,fid)){alert("此配方的專業／設施分類異常，已禁止製作。");return}
  if(!currentFacilityAllowsCrafting(fid)){alert(`必須在${DB.facilities?.[fid]?.name||"對應製作設施"}內才能製作。`);return}
  if(!recipeKnown(d)){alert("尚未學會此配方。");return}
  if(tierOrder(j.grade)<tierOrder(d.tier)){alert(`副職業階級不足，需要${d.tier}級。`);return}
  if(G.character.level<(d.recipe_level||1)){alert(`需要角色Lv${d.recipe_level}。`);return}
  const missing=craftingMissingBatch(d,count);
  if(missing.length){alert("批量材料不足："+missing.map(x=>`${item(x.id)?.name||x.id} ${x.have}/${x.need}`).join("、"));return}
  closeModal();
  if(!beginTurn(`批量製作：${d.name}×${count}`))return;
  let success=0,fail=0,chanceSum=0,firstChance=null,lastChance=null;
  for(let n=0;n<count;n++){
    const b=productionCraftingSuccessBreakdown(r.profession,d.tier,j,j.id);
    const chance=b.chance;
    if(firstChance==null)firstChance=chance;
    lastChance=chance;
    chanceSum+=chance;
    const ok=1+rand(100)<=chance;
    for(const x of craftRecipeMaterials(d))consumeIngredient(x.id,x.qty);
    if(ok){addItem(d.id,1);success++}else fail++;
    gainSubjobXp(DB.crafting_system.profession_subjob[r.profession],(tierOrder(d.tier)+1)*8)
  }
  const avg=Math.round(chanceSum/count);
  const changed=firstChance!==lastChance?`｜批次中成功率 ${firstChance}%→${lastChance}%`:"";
  log("製作",`${d.name}×${count}：成功${success}、失敗${fail}（平均成功率${avg}%${changed}）。`,success?"ok":"danger");
  endTurn(craftTimeHours(d,j)*count);
  openCrafting(fid)
};

openCrafting=function(fid,category=null){
  const prof=DB.crafting_system.facility_profession[fid];if(!prof)return;
  if(!currentFacilityAllowsCrafting(fid)){alert("必須先進入對應製作設施。");return}
  const locTier=loc(G.character.locationId).tier,j=subjobForProfession(prof);
  const base=(DB.items||[]).filter(d=>craftingRecipeMatchesFacility(d,fid)&&tierOrder(d.tier)<=tierOrder(locTier)&&craftingRecipeVisible(d,j)&&recipeKnown(d));
  const trainable=craftingLearningCandidates(fid,j);
  // Purpose classification must survive this module overriding runtime.openCrafting.
   const {options,defaultCategory,categoryOf}=craftingCategoryPlan(fid,base);
  if(category&&options.includes(category))CRAFT_CATEGORY_STATE[fid]=category;
  const selected=options.includes(CRAFT_CATEGORY_STATE[fid])?CRAFT_CATEGORY_STATE[fid]:defaultCategory;
  CRAFT_CATEGORY_STATE[fid]=selected;
  const tabs=options.map(cat=>{
   const count=base.filter(d=>categoryOf(d)===cat).length;
   return `<button type="button" aria-pressed="${cat===selected}" ${cat===selected?'class="primary"':""} onclick="openCrafting('${fid}','${cat}')">${cat} ${count}</button>`
  }).join("");
  const all=base.filter(d=>categoryOf(d)===selected).sort(worldTierItemSort);
  const rows=tierGroupedItemRows(all,d=>{
    const known=recipeKnown(d),canLearn=!known&&recipeCanLearn(d),missing=craftingMissing(d),b=j?productionCraftingSuccessBreakdown(prof,d.tier,j,j.id):null,chance=b?.chance||0,maxBatch=known?craftMaxBatch(d,10):0;
    const mats=craftMaterialText(d,true);
    const gradeOk=j&&tierOrder(j.grade)>=tierOrder(d.tier),canCraft=gradeOk&&G.character.level>=(d.recipe_level||1);
    const chanceLine=b?`成功率約${chance}%｜${productionCraftingSuccessText(b)}`:"缺少對應副職業";
    return `<div class="itemrow"><span><b>${d.name}</b> <span class="tier">${d.tier}</span><br><span class="small">${craftResultLine(d)}<br>${mats}<br>${known?`${chanceLine}<br>${craftTimeHours(d,j)}小時｜可連做${maxBatch}次`:`配方：${d.recipe_access==="special"?"特殊來源":d.recipe_access==="trainer"?"師傅教授":"公開"}`}${missing.length?`｜缺料${missing.length}種`:""}</span></span><span>${canLearn?`<button onclick="learnCraftRecipe('${d.id}')">學配方 ${recipeLearnFee(d)}銀</button>`:""} ${known?`<span class="craft-batch"><button ${canCraft&&maxBatch>=1?"":"disabled"} onclick="craftItemBatch('${d.id}',1)">製作1</button><button ${canCraft&&maxBatch>=5?"":"disabled"} onclick="craftItemBatch('${d.id}',5)">×5</button><button ${canCraft&&maxBatch>=10?"":"disabled"} onclick="craftItemBatch('${d.id}',10)">×10</button></span>`:""}</span></div>`
  },"此類別沒有可用配方。");
  const sj=j?`${sub(j.id).name}［${j.grade}］ 熟練Lv${productionSubjobLevel(j)}｜XP ${j.xp||0}`:"尚未取得對應副職業";
  showModal(`${DB.facilities[fid].name}・製作`,`<div class="card small">${sj}<br>製作清單只顯示已學會的配方；未學配方請至「學習配方」查看。成功率＝能力值＋幸運＋副職業階級／熟練Lv＋天賦＋組織加成－配方難度。</div><h3>製作類別</h3><div class="small">依成品類型分類｜目前僅顯示「${selected}」的配方。</div><div class="actions craft-category-tabs" role="group" aria-label="製作類別">${tabs}</div>${rows}<div class="actions"><button onclick="openCraftRecipeTraining('${fid}')">學習配方 ${trainable.length}</button><button onclick="renderFacility('${fid}')">上一頁</button></div>`,`openCrafting('${fid}','${selected}')`)
};

function cookingSuccessBreakdown(r){
  const j=G.character.subjobs.find(x=>x.id==="SJ-COOK")||null;
  return productionCraftingSuccessBreakdown("料理",r?.tier||"F",j,"SJ-COOK")
}

cookBatch=function(rid,count=1){
  count=Math.max(1,Math.min(10,Number(count)||1));
  const r=IDX.recipe.get(rid);if(!r)return;
  if(!isCookingRecipe(r)){alert("此配方不是料理配方，無法從料理介面製作。");return}
  const j=G.character.subjobs.find(x=>x.id==="SJ-COOK")||null;
  if(tierOrder(r.tier||"F")>0&&!j){alert("E級以上料理需要烹飪副職業。");return}
  if(r.cook_grade&&(!j||tierOrder(j.grade)<tierOrder(r.cook_grade))){alert(`烹飪副職業階級不足，需要${r.cook_grade}級。`);return}
  const miss=cookingMissingBatch(r,count);
  if(miss.length){alert("批量材料不足："+miss.map(x=>`${x.id==="ANY_FOOD"?"任意食材":item(x.id)?.name||x.id} ${x.have}/${x.need}`).join("、"));return}
  closeModal();
  if(!beginTurn(`批量料理：${r.name}×${count}`))return;
  let success=0,fail=0,chanceSum=0,firstChance=null,lastChance=null;
  for(let n=0;n<count;n++){
    const b=cookingSuccessBreakdown(r),chance=b.chance;
    if(firstChance==null)firstChance=chance;
    lastChance=chance;
    chanceSum+=chance;
    if(r.requires)for(const [id,q] of Object.entries(r.requires))consumeIngredient(id,q);
    if(r.requires_any_food)consumeAnyFood(r.requires_any_food);
    if(1+rand(100)<=chance){addItem(r.result||r.output?.item_id);success++}else fail++;
    if(j)gainSubjobXp("SJ-COOK",(tierOrder(r.tier||"F")+1)*6)
  }
  const avg=Math.round(chanceSum/count),changed=firstChance!==lastChance?`｜批次中成功率 ${firstChance}%→${lastChance}%`:"";
  log("料理",`${r.name}×${count}：成功${success}、失敗${fail}（平均成功率${avg}%${changed}）。`,success?"ok":"danger");
  const red=clamp(talentSubjobBonus("SJ-COOK","timeReduction"),0,.35);
  endTurn(Math.max(.25,Math.round(count*(1-red)*100)/100));
  openCooking()
};

openCooking=function(){
  const j=G.character.subjobs.find(x=>x.id==="SJ-COOK")||null,rank=j?.grade||null;
  let list=DB.recipes.filter(r=>isCookingRecipe(r)&&(!r.cook_grade||(rank&&tierOrder(rank)>=tierOrder(r.cook_grade))));
  const status=j?`${sub("SJ-COOK")?.name||"烹飪"}［${j.grade}］ 熟練Lv${productionSubjobLevel(j)}｜XP ${j.xp||0}`:"未取得烹飪副職業：僅可製作F級基礎料理";
  let b=`<div class="card small">${status}<br>成功率＝敏捷＋智力＋幸運＋烹飪階級／熟練Lv＋天賦＋組織加成－配方難度；最低20%、最高95%。</div>`+
  list.map(r=>{
    const result=cookingOutputItem(r),s=cookingSuccessBreakdown(r);
    return `<div class="itemrow"><span><b>${r.name}</b> <span class="tier">${r.tier}</span>
    <br><span class="small">${craftResultLine(result)}<br>${cookingMaterialText(r,true)}<br>成功率約${s.chance}%｜${productionCraftingSuccessText(s)}</span></span>
    <span class="craft-batch"><button onclick="cookBatch('${r.id}',1)">製作1</button><button onclick="cookBatch('${r.id}',5)">×5</button><button onclick="cookBatch('${r.id}',10)">×10</button></span></div>`
  }).join("");
  showModal("料理",b,"openCooking()")
};

function runProductionCraftingSuccessAudit(){
  const issues=[];
  if(DB.production_crafting_success_system?.version!==REV)issues.push("全製作成功率系統版本異常");
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r)continue;
    if(!PROFILE[r.profession])issues.push(`製作成功率缺專業能力映射:${d.id}/${r.profession}`);
    if(!DB.crafting_system?.profession_subjob?.[r.profession])issues.push(`製作成功率缺副職業映射:${d.id}/${r.profession}`)
  }
  for(const r of DB.recipes||[]){
    if(typeof isCookingRecipe==="function"&&!isCookingRecipe(r))continue;
    const out=r.result||r.output?.item_id;
    if(out&&!["F","E","D","C","B","A","S"].includes(r.tier||item(out)?.tier||"F"))issues.push(`料理層級無效:${r.id}`)
  }
  for(const j of G?.character?.subjobs||[]){
    const lv=productionSubjobLevel(j);
    if(lv<1||lv>10)issues.push(`副職業熟練Lv異常:${j.id}/${lv}`)
  }
  return issues
}

DB.meta=DB.meta||{};
DB.meta.production_crafting_success_revision=REV;
DB.hard_rules=DB.hard_rules||{};
DB.hard_rules.production_success_rate_all_crafting=true;
DB.hard_rules.production_success_factors=["能力值","幸運","天賦","副職業階級","副職業熟練Lv","配方階級","組織加成"];
DB.crafting_system=DB.crafting_system||{};
DB.crafting_system.version="CRAFTING-1.12";
DB.crafting_system.success_revision=REV;
DB.crafting_system.recipe_visibility_revision="CRAFTING-RECIPE-VISIBILITY-1.0";
DB.crafting_system.recipe_visibility={max_future_tier_gap:2,hide_unlearned_from_tier:"D",known_recipe_still_subject_to_future_gap:true,trainer_learning_separate_view:true};
DB.crafting_system.subjob_level_cap=10;
DB.crafting_system.subjob_level_xp=[...SUBJOB_LEVEL_XP];
DB.crafting_system.rules=[...(DB.crafting_system.rules||[]).filter(x=>!String(x).includes("成功率")&&!String(x).includes("製作清單")), "所有生產製作皆有獨立成功率；能力、幸運、對應天賦、副職業階級與熟練Lv提高成功率，配方階級提高難度。","製作清單最多顯示高於對應副職業2個階級的配方；D級以上未學配方不顯示，師傅可教授配方改由獨立學習清單呈現。"];
DB.production_crafting_success_system={
  version:REV,release:RELEASE,
  scope:["鍛造","裁縫","藥劑","附魔","料理"],
  future_profiles:["煉金","卷軸"],
  chance_range:[20,95],
  subjob_level_cap:10,
  subjob_level_xp:[...SUBJOB_LEVEL_XP],
  formula:{
    base:46,
    primary_stat_multiplier:1.15,
    secondary_stat_multiplier:.45,
    luck_multiplier:.35,
    trained_bonus:8,
    grade_bonus_per_tier:4,
    subjob_level_bonus_per_level:1.25,
    recipe_tier_penalty:6.5,
    talent:"talentSubjobBonus(success)",
    affiliation:"affiliationEffects().craft_success"
  },
  ability_profiles:PROFILE,
  failure_rule:"每次失敗仍消耗該次完整配方材料；不產生成品；仍取得實作副職業XP。",
  batch_rule:"批量1/5/10逐次擲定；批次途中副職業升階或熟練Lv提升，後續嘗試立即套用新成功率。",
  recipe_visibility:{max_future_tier_gap:2,hide_unlearned_from_tier:"D",trainer_learning_separate_view:true},
  save_compatible:true
};

globalThis.productionSubjobLevel=productionSubjobLevel;
globalThis.productionCraftingSuccessBreakdown=productionCraftingSuccessBreakdown;
globalThis.productionCraftingSuccessText=productionCraftingSuccessText;
globalThis.cookingSuccessBreakdown=cookingSuccessBreakdown;
globalThis.runProductionCraftingSuccessAudit=runProductionCraftingSuccessAudit;

if(typeof runGeneratorAudit==="function"){
  const baseRunGeneratorAudit=runGeneratorAudit;
  runGeneratorAudit=function(){
    const base=baseRunGeneratorAudit();
    return [...(Array.isArray(base)?base:[]),...runProductionCraftingSuccessAudit()]
  }
}
})();
