/* 群陸旅誌：全配方素材／層級完整性 CURRENT-1.69.6
 * CRAFTING-RECIPE-INTEGRITY-2.0
 * 全面檢查成品語意、材料階級、核心素材階級與高階模板污染。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.6";
const REV="CRAFTING-RECIPE-INTEGRITY-2.0";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const MIN_CORE_RANK={F:0,E:0,D:1,C:1,B:3,A:4,S:5};
const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const recipeById=id=>(DB.recipes||[]).find(x=>x?.id===id)||null;
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const corrections=[];
const note=(id,kind,detail)=>corrections.push({id,kind,detail});

function setBase(id,pairs){
  const d=byId(id); if(!d?.craft_recipe)return;
  d.craft_recipe.base_materials=pairs.filter(([mid])=>byId(mid)).map(([mid,qty])=>({id:mid,qty}));
  note(id,"base_materials","重建基礎素材");
}
function setMonster(id,pairs){
  const d=byId(id); if(!d?.craft_recipe)return;
  d.craft_recipe.monster_components=pairs.filter(([mid])=>byId(mid)).map(([mid,qty])=>({id:mid,qty}));
  if(Array.isArray(d.monster_upgrade_components))d.monster_upgrade_components=d.craft_recipe.monster_components.map(x=>({...x}));
  note(id,"monster_components","移除模板污染並保留／改用符合成品主題的魔物素材");
}
function addBase(id,mid,qty=1){
  const d=byId(id),m=byId(mid); if(!d?.craft_recipe||!m)return;
  const rows=d.craft_recipe.base_materials||(d.craft_recipe.base_materials=[]);
  const found=rows.find(x=>x.id===mid);
  if(found)found.qty=Math.max(Number(found.qty||1),qty);
  else rows.push({id:mid,qty});
  note(id,"tier_anchor","補入符合層級與成品用途的核心素材："+m.name);
}
function rename(id,name){
  const d=byId(id); if(!d||d.name===name)return;
  note(id,"name_material_sync",d.name+" → "+name);
  d.name=name;
}
function replaceBaseMaterial(id,from,to){
  const d=byId(id); if(!d?.craft_recipe||!byId(to))return;
  let changed=false;
  d.craft_recipe.base_materials=(d.craft_recipe.base_materials||[]).map(m=>{
    if(m.id!==from)return m;
    changed=true; return {id:to,qty:m.qty};
  });
  if(changed)note(id,"material_sync",(byId(from)?.name||from)+" → "+byId(to).name);
}
function setCooking(id,requires){
  const r=recipeById(id); if(!r)return;
  r.requires={...requires};
  r.ingredients=[];
  r.profession="料理";
  note(id,"cooking_recipe","重建料理素材");
}
function addCooking(id,mid,qty=1){
  const r=recipeById(id),m=byId(mid); if(!r||!m)return;
  r.requires={...(r.requires||{})};
  r.requires[mid]=Math.max(Number(r.requires[mid]||0),qty);
  note(id,"cooking_tier_anchor","補入符合料理定位與層級的核心食材："+m.name);
}

/* 1. 明確超階素材：素材不得高於成品階級。 */
setBase("EQ31-015",[["MAT-CRAFT-02",2],["MAT-GEM-13",1]]);
setBase("EQ31-073",[["MAT-HERB-01",1],["MAT-ORE-16",1]]);
setBase("EQ31-074",[["MAT-HERB-01",1],["MAT-ORE-16",1]]);
setBase("P31-013",[["MAT31-HERB-19",1],["MAT-HERB-19",1]]);
setBase("P31-020",[["MAT-HERB-07",1],["MAT-HERB-04",1]]);
setBase("P31-023",[["MAT-HERB-14",1],["MAT-HERB-02",1]]);
setBase("P31-024",[["MAT-HERB-16",1],["MAT-HERB-04",1]]);
setBase("P31-029",[["MAT-HERB-14",1],["MAT-HERB-01",1]]);
setBase("P31-031",[["MAT-HERB-03",1],["MAT-HERB-18",1]]);

/* 2. 成品名稱與主材一致。成品階級低於名稱所指材料時，以不改戰力為原則修正名稱。 */
rename("EQ-IRON-SWORD","青銅旅行劍");
rename("EQ-IRON-DAGGER","青銅短刃");
rename("EQ-STEEL-SWORD","秘銀長劍");
rename("EQ-SHORT-BOW","橡木短弓");
rename("EQ-RUNE-SPEAR2","符文秘銀槍");
rename("EQ-MITHRIL-SWORD","受封印古龍星銀長劍");
rename("EQ-MITHRIL-STAFF","受封印古龍星導杖");
rename("EQ-STAR-SABER","受封印恆金星決鬥劍");
replaceBaseMaterial("EQ7-W22","MAT-ORE-20","MAT-ORE-21");
rename("EQ7-W23","受封印古樹戰弓");
rename("EQ7-W26","受封印星銀古龍劍");
rename("EQ7-W27","受封印古龍星導法杖");
rename("EQ7-A10","受封印精金龍鱗戰甲");
rename("EQ7-G04","牛頭戰護腕");
rename("EQ7-S05","巨魔革輕靴");
rename("EQ7-C04","晶絲披風");

/* 3. B～S 裝備：處理前版留下的人工候選；不再讓無關魔物素材成為通用模板。 */
setBase("EQ-ASTRAL-STAFF",[["MAT-CRAFT-05",2],["MAT-GEM-12",1]]);
setMonster("EQ-RUNE-SWORD",[]);
setMonster("EQ-OATH-SWORD",[["DROP-BE-20",1]]);
setMonster("EQ-SPIRIT-BOW",[["DROP-BE-21",1],["DROP-BE-24",1]]);
setMonster("EQ-ASTRAL-STAFF",[]);
setMonster("EQ-FINE-KATANA",[]);
setMonster("EQ-MITHRIL-SWORD",[["DROP-DR-16",1],["DROP-DR-28",1]]);
setMonster("EQ-MITHRIL-STAFF",[["DROP-DR-16",1],["DROP-DR-28",1]]);
setMonster("EQ-STAR-SABER",[["DROP-DR-16",1],["DROP-DR-28",1]]);
setMonster("EQ-DRAGON-KATANA",[["DROP-DR-08",1]]);
setMonster("EQ-TIME-STAFF",[]);
setMonster("EQ-HOLY-SWORD",[["DROP-BE-20",1],["DROP-BE-21",1]]);
setMonster("EQ-WILD-BOW",[["DROP-BE-21",1],["DROP-BE-24",1]]);
setMonster("EQ-ARCHMAGE-STAFF",[["DROP-DR-26",1]]);
setMonster("EQ-HEAVEN-SPEAR",[["DROP-DR-16",1]]);
setMonster("EQ-ASTRAL-BLADE",[["DROP-DR-26",1]]);
setMonster("EQ7-W21",[]);
setMonster("EQ7-W22",[]);
setMonster("EQ7-W23",[["DROP-BE-21",1],["DROP-BE-24",1]]);
setMonster("EQ7-W24",[["DROP-BE-20",1]]);
setMonster("EQ7-W26",[["DROP-DR-16",1],["DROP-DR-28",1]]);
setMonster("EQ7-W27",[["DROP-DR-16",1],["DROP-DR-26",1]]);
setMonster("EQ7-W28",[["DROP-BE-21",1],["DROP-BE-24",1],["DROP-GG-36",1]]);
setMonster("EQ7-W29",[["DROP-DE-24",1]]);
setMonster("EQ7-W30",[["DROP-BE-22",1],["DROP-BE-20",1]]);
setMonster("EQ7-W31",[["DROP-BE-22",1],["DROP-BE-20",1],["DROP-BE-21",1]]);
setBase("EQ7-W32",[["MAT-CRAFT-05",3],["MAT-GEM-12",1]]);
setMonster("EQ7-W32",[["DROP-DR-24",1],["DROP-DR-43",1]]);
setMonster("EQ7-W33",[["DROP-BE-21",1],["DROP-BE-24",1],["DROP-GG-36",1]]);
setMonster("EQ7-A10",[["DROP-DR-08",1]]);
setMonster("EQ10-SH07",[["DROP-BE-20",1]]);
for(const id of ["EQ10-H06","EQ10-B09","EQ10-G05","EQ10-FT05","EQ10-R06"])setMonster(id,[["DROP-DR-08",1]]);
setMonster("EQ10-N05",[["DROP-DR-15",1]]);
setMonster("EQ10-C04",[["DROP-DR-18",1]]);
setMonster("EQ10-M02",[["DROP-DR-26",1]]);

/* 4. 高頻煉金模板：把霜巨人冰鬚／不相干素材改為對應成品主題。 */
const ALCHEMY_MONSTER_FIXES={
  "P7-20":[["DROP-DR-21",1]],
  "PC-LIFE-14":[["DROP-BE-20",1]],
  "PC-LIFE-16":[["DROP-BE-27",1]],
  "PC-MANA-12":[],
  "PC-MANA-14":[],
  "PC-ATTR-18":[["DROP-DR-21",1]],
  "PC-ATTR-19":[["DROP-DR-18",1]],
  "PC-ATTR-20":[["DROP-DR-21",1]],
  "PC-RES-10":[],
  "PC-RES-13":[],
  "PC-RES-21":[["DROP-DR-08",1]],
  "PC-CLEAN-17":[["DROP-BE-20",1]],
  "PC-CLEAN-22":[],
  "PC-SPEC-09":[["DROP-UN-17",1]],
  "PC-SPEC-10":[["DROP-BE-29",1]],
  "PC-SPEC-11":[["DROP-UN-17",1]],
  "PC-SPEC-12":[["DROP-DR-21",1]],
  "PC-SPEC-15":[],
  "PC-SPEC-17":[["DROP-DE-06",1]],
  "PC-SPEC-23":[["DROP-BE-29",1]],
  "PC-SPEC-19":[["DROP-DR-22",1],["DROP-DR-28",1]],
  "PC-SPEC-20":[["DROP-BE-22",1]],
  "PC-SPEC-21":[["DROP-DR-29",1]]
};
for(const [id,parts] of Object.entries(ALCHEMY_MONSTER_FIXES))setMonster(id,parts);

/* 補回上述移除模板後仍需的同層級主題核心。 */
addBase("PC-MANA-12","MAT-GEM-12",1);
addBase("PC-MANA-14","MAT-GEM-12",1);
addBase("PC-RES-10","MAT-ORE-12",1);
addBase("PC-RES-13","MAT-ORE-12",1);
addBase("PC-CLEAN-22","MAT-HERB-12",1);
addBase("PC-SPEC-15","MAT-HERB-12",1);
addBase("PC-SPEC-20","MAT-HERB-12",1);
addBase("PC-SPEC-21","MAT-ORE-28",1);

/* 5. D～S 專業成品需要相稱核心素材。低階材料仍可作輔料。 */
function chooseAlchemyAnchor(d,minRank){
  const n=String(d.name||"");
  if(minRank<=1){
    if(/冰|寒/.test(n))return "MAT-HERB-23";
    if(/雷|疾風|迅|敏捷|銳|鷹眼|弓/.test(n))return "MAT-HERB-21";
    if(/清|解|咒|魅|祝福|淨化/.test(n))return "MAT31-HERB-07";
    if(/魔|術|法|以太/.test(n))return "MAT-HERB-07";
    return "MAT-HERB-06";
  }
  if(minRank===2){
    if(/冰|寒/.test(n))return "DROP-BE-03";
    if(/雷/.test(n))return "DROP-EL-05";
    if(/清|解|咒|聖|祝福|淨化/.test(n))return "MAT-HERB-27";
    if(/魔|術|法|以太/.test(n))return "MAT-HERB-16";
    if(/暗|夜|吸血/.test(n))return "MAT-HERB-26";
    return "MAT-HERB-03";
  }
  if(minRank===3){
    if(/龍/.test(n))return "DROP-DR-21";
    if(/聖|生命|恢復|治療|淨化/.test(n))return "DROP-BE-20";
    return "MAT-HERB-12";
  }
  if(minRank===4){
    if(/龍|古龍/.test(n))return "DROP-DR-22";
    if(/生命|聖|祝福|淨化/.test(n))return "DROP-BE-22";
    return "DROP-DR-29";
  }
  return "DROP-DR-24";
}
function recipeMaterialRows(d){return [...(d?.craft_recipe?.base_materials||[]),...(d?.craft_recipe?.monster_components||[])];}
for(const d of DB.items||[]){
  if(!d?.craft_recipe)continue;
  const tr=TIER_RANK[d.tier];
  if(tr==null||tr<2)continue;
  const minRank=MIN_CORE_RANK[d.tier]??0;
  const maxRank=Math.max(-1,...recipeMaterialRows(d).map(m=>TIER_RANK[byId(m.id)?.tier]??-1));
  if(maxRank>=minRank)continue;
  if(d.craft_recipe.profession==="藥劑"){
    const anchor=chooseAlchemyAnchor(d,minRank);
    if(anchor&&TIER_RANK[byId(anchor)?.tier]<=tr)addBase(d.id,anchor,1);
  }
}
/* S級暴風神弓需A級風暴核心；前面已補風暴巨人雷紋鬚。 */

/* 6. 料理：修空配方，並讓D～A料理至少有合理核心食材。 */
setCooking("R-STEW",{"I-RAWMEAT":1,"I-ROOT":1,"I-WATER":1});
const COOK_ANCHORS={
  "R-IRONSTEW":"MAT-FOOD-20",
  "R-SPICED":"MAT-FOOD-20",
  "R-ELF":"MAT31-FOOD-15",
  "R-MANA":"MAT-FOOD-06",
  "R-WAR":"MAT-FOOD-11",
  "R-SILVER":"MAT-HERB-12",
  "R-MINER-PLATE":"MAT31-FOOD-20",
  "R-RANGER-POT":"MAT31-FOOD-15",
  "R-SPELL-TEA":"MAT-HERB-16",
  "R-GUARD-BROTH":"MAT31-FOOD-20",
  "R-HUNTER-FEAST":"MAT-FOOD-11",
  "R-MAGE-DESSERT":"MAT-FOOD-06",
  "R-GOLDEN-STEW":"MAT-HERB-12",
  "R7-11":"MAT31-FOOD-20",
  "R7-12":"MAT31-FOOD-15",
  "R7-14":"MAT31-FOOD-20",
  "R7-15":"MAT31-HERB-07",
  "R7-16":"MAT31-FOOD-13",
  "R7-17":"MAT-HERB-16",
  "R7-18":"MAT31-FOOD-20",
  "R7-19":"MAT-FOOD-20",
  "R7-20":"MAT-FOOD-14",
  "R7-21":"MAT-HERB-16",
  "R7-24":"MAT-FOOD-12",
  "R7-25":"MAT-FOOD-19",
  "R7-26":"MAT-FOOD-19"
};
for(const [id,mid] of Object.entries(COOK_ANCHORS))addCooking(id,mid,1);

/* 7. 稽核：所有595專業配方＋59料理配方。 */
const METAL_NAME={
  "青銅":"MAT-ORE-16","黑鐵":"MAT-ORE-17","精鋼":"MAT-ORE-18","秘銀":"MAT-ORE-19",
  "精金":"MAT-ORE-20","殞鐵":"MAT-ORE-21","星銀":"MAT-ORE-22","恆金":"MAT-ORE-23"
};
function cookingReq(r){
  const req={...(r?.requires||{})};
  for(const m of r?.ingredients||[])if(m?.item_id)req[m.item_id]=(req[m.item_id]||0)+Math.max(1,Number(m.qty||1));
  return req;
}
function audit(){
  const issues=[];
  const push=(id,code,reason)=>issues.push({id,code,reason});
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r)continue;
    const tr=TIER_RANK[d.tier];
    const mats=recipeMaterialRows(d);
    if(!mats.length)push(d.id,"EMPTY_RECIPE","專業配方沒有任何素材");
    for(const m of mats){
      const md=byId(m?.id);
      if(!md){push(d.id,"MISSING_MATERIAL","素材不存在："+(m?.id||"空白"));continue;}
      if(!(Number(m?.qty)>0))push(d.id,"INVALID_QTY","素材數量無效："+md.name);
      if(tr!=null&&TIER_RANK[md.tier]>tr)push(d.id,"OVER_TIER",md.name+"["+md.tier+"]高於成品["+d.tier+"]");
    }
    if(tr>=2){
      const minRank=MIN_CORE_RANK[d.tier]??0;
      const maxRank=Math.max(-1,...mats.map(m=>TIER_RANK[byId(m.id)?.tier]??-1));
      if(maxRank<minRank)push(d.id,"CORE_TIER_TOO_LOW","最高核心素材僅到"+Object.keys(TIER_RANK).find(k=>TIER_RANK[k]===maxRank)+"，不足以支撐"+d.tier+"級成品");
    }
    const name=String(d.name||"");
    for(const [word,mid] of Object.entries(METAL_NAME)){
      if(!name.includes(word))continue;
      if(/銀紗/.test(name)&&word==="星銀")continue;
      const named=byId(mid);
      if(named&&TIER_RANK[named.tier]>tr){
        push(d.id,"NAME_TIER_CONFLICT",name+"的名稱材料"+word+"["+named.tier+"]高於成品["+d.tier+"]");
      }else if(!mats.some(m=>m.id===mid)){
        push(d.id,"NAME_MATERIAL_MISMATCH",name+"名稱含"+word+"但配方未使用"+named?.name);
      }
      break;
    }
  }

  for(const r of DB.recipes||[]){
    const out=byId(r?.result||r?.output?.item_id);
    if(!out||!(out.type==="料理"||out.inventory_group==="食物"||out.food_subtype))continue;
    const req=cookingReq(r),ids=Object.keys(req),tr=TIER_RANK[out.tier];
    if(!ids.length)push(r.id,"COOK_EMPTY","料理沒有食材");
    for(const id of ids){
      const md=byId(id);
      if(!md){push(r.id,"COOK_MISSING","料理素材不存在："+id);continue;}
      if(TIER_RANK[md.tier]>tr)push(r.id,"COOK_OVER_TIER",md.name+"["+md.tier+"]高於料理["+out.tier+"]");
    }
    if(tr>=2){
      const minRank=MIN_CORE_RANK[out.tier]??0;
      const maxRank=Math.max(-1,...ids.map(id=>TIER_RANK[byId(id)?.tier]??-1));
      if(maxRank<minRank)push(r.id,"COOK_CORE_TIER_TOO_LOW","料理核心素材層級不足");
    }
    const names=ids.map(id=>byId(id)?.name||id).join("、"),n=String(out.name||r.name||"");
    if(/肉/.test(n)&&!/魚肉/.test(n)&&!/肉/.test(names))push(r.id,"COOK_MEAT","名稱含肉但無肉材");
    if(/魚|河鮮/.test(n)&&!/魚/.test(names))push(r.id,"COOK_FISH","名稱含魚但無魚材");
    if(/菇/.test(n)&&!/菇/.test(names))push(r.id,"COOK_MUSHROOM","名稱含菇但無菇材");
    if(/莓/.test(n)&&!/莓/.test(names))push(r.id,"COOK_BERRY","名稱含莓但無莓材");
    if(/茶/.test(n)&&!ids.includes("I-WATER"))push(r.id,"COOK_TEA","茶飲缺水");
    if(/餅/.test(n)&&!/麥|粉/.test(names))push(r.id,"COOK_PIE","餅類缺穀粉");
  }
  return {pass:issues.length===0,issue_count:issues.length,issues};
}

const result=audit();
const counts=(DB.items||[]).filter(x=>x?.craft_recipe).reduce((m,x)=>(m[x.craft_recipe.profession]=(m[x.craft_recipe.profession]||0)+1,m),{});
const cookingCount=(DB.recipes||[]).filter(r=>{
  const out=byId(r?.result||r?.output?.item_id);
  return out&&(out.type==="料理"||out.inventory_group==="食物"||out.food_subtype);
}).length;

DB.crafting_recipe_integrity_v2={
  version:REV,
  release:RELEASE,
  professional_recipes:(DB.items||[]).filter(x=>x?.craft_recipe).length,
  cooking_recipes:cookingCount,
  profession_counts:counts,
  corrections,
  correction_count:corrections.length,
  corrected_unique:uniq(corrections.map(x=>x.id)).length,
  rules:[
    "任何素材階級不得高於成品階級。",
    "D/C級成品至少需E級以上核心素材；B級至少C級；A級至少B級；S級至少A級。低階材料仍可作輔料。",
    "名稱明確標示青銅、黑鐵、精鋼、秘銀、精金、殞鐵、星銀或恆金時，配方與成品階級必須與該材料一致。",
    "高階魔物素材只有在與成品主題、構造或效果有關時保留，不作跨類型通用模板。",
    "料理必須有食材，且名稱所指肉、魚、菇、莓、茶、餅等主材必須實際存在。"
  ],
  initial_audit:result,
  save_compatible:true
};

DB.crafting_data_integrity_system=DB.crafting_data_integrity_system||{};
DB.crafting_data_integrity_system.version="CRAFTING-DATA-INTEGRITY-1.0";
DB.crafting_data_integrity_system.tier_semantic_revision=REV;
DB.crafting_data_integrity_system.counts={...counts};
DB.crafting_data_integrity_system.issue_count=result.issues.filter(x=>!String(x.code).startsWith("COOK_")).length;
DB.crafting_data_integrity_system.issues=result.issues.filter(x=>!String(x.code).startsWith("COOK_")).map(x=>({id:x.id,reason:x.reason}));

DB.cooking_data_integrity_system=DB.cooking_data_integrity_system||{};
DB.cooking_data_integrity_system.version="COOKING-DATA-INTEGRITY-1.0";
DB.cooking_data_integrity_system.tier_semantic_revision=REV;
DB.cooking_data_integrity_system.semantic_issue_count=result.issues.filter(x=>String(x.code).startsWith("COOK_")).length;
DB.cooking_data_integrity_system.semantic_issues=result.issues.filter(x=>String(x.code).startsWith("COOK_")).map(x=>({id:x.id,reason:x.reason}));

DB.meta=DB.meta||{};
DB.meta.crafting_recipe_integrity_revision=REV;
globalThis.runCraftingRecipeIntegrityV2Audit=audit;
})();