/* 群陸旅誌：全製作配方語意完整性 CURRENT-1.69.5
 * CRAFTING-RECIPE-SEMANTIC-1.0
 * 稽核並修正鍛造／裁縫／藥劑／附魔／料理的通用模板素材污染。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.5";
const REV="CRAFTING-RECIPE-SEMANTIC-1.0";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const corrections=[];
const record=(d,kind,detail)=>corrections.push({id:d?.id||"unknown",name:d?.name||"",tier:d?.tier||"",kind,detail});

const matClass=id=>{
  const d=byId(id)||{},n=String(d.name||"");
  if(d.type==="食材")return "food";
  if(d.type==="草藥素材"||id==="I-HERB"||id==="I-MINT")return "herb";
  if(d.type==="寶石素材")return "gem";
  if(d.type==="礦石")return /粉塵|粉末/.test(n)?"magic_powder":"metal";
  if(d.type==="工藝素材"){
    if(/木|板|枝/.test(n))return "wood";
    if(/布|麻|絲|線|毛|皮|革|繩|纖維|帆/.test(n))return "soft";
    return "craft";
  }
  if(d.type==="魔物素材"){
    if(/皮|毛|絲|翼膜|鱗|羽/.test(n))return "monster_soft";
    if(/核心|核|晶|護符|圖騰|魔/.test(n))return "monster_magic";
    return "monster";
  }
  if(d.type==="符文")return "rune";
  return d.type||"other";
};

const SOFT_RE=/披風|披肩|斗篷|法衣|法袍|長袍|道服|兜帽|冠帶|軟靴|短靴|靜步靴|踏浪靴|皮甲|皮衣|獵甲|戰衣|護指|護腕|手套|靴|影織|銀紗/;
const HARD_RE=/鎖子|板甲|重甲|壁甲|壁盔|面盔|戰盔|鋼甲|鐵甲|護甲|戰靴|脛甲|握鐵|熔脈盔|熔脈重甲|熔脈護手|熔脈戰靴|鱗甲|札甲|環甲|層甲|拳護/;
const softTier={
 F:{cloth:[["MAT-CRAFT-10",1]],leather:[["MAT-CRAFT-12",1]]},
 E:{cloth:[["MAT-CRAFT-08",1],["MAT-CRAFT-10",1]],leather:[["MAT-CRAFT-13",1]]},
 D:{cloth:[["MAT-CRAFT-11",1],["MAT-CRAFT-09",1]],leather:[["MAT-CRAFT-13",2],["MAT-CRAFT-09",1]]},
 C:{cloth:[["MAT-CRAFT-11",2],["MAT-CRAFT-09",1]],leather:[["MAT-CRAFT-13",2],["MAT-CRAFT-09",1]]},
 B:{cloth:[["MAT-CRAFT-14",1],["MAT-CRAFT-11",2]],leather:[["MAT-CRAFT-14",2]]},
 A:{cloth:[["MAT-CRAFT-15",1],["MAT-CRAFT-11",2]],leather:[["MAT-CRAFT-15",2]]},
 S:{cloth:[["MAT-CRAFT-15",2],["MAT-CRAFT-11",2]],leather:[["MAT-CRAFT-15",2]]}
};
const bowTier={
 F:[["MAT-CRAFT-01",1],["MAT-CRAFT-18",1]],
 E:[["MAT-CRAFT-02",1],["MAT-CRAFT-08",1]],
 D:[["MAT-CRAFT-02",2],["MAT-CRAFT-09",1]],
 C:[["MAT-CRAFT-04",1],["MAT-CRAFT-09",1]],
 B:[["MAT-CRAFT-05",1],["MAT-CRAFT-09",2]],
 A:[["MAT-CRAFT-05",1],["MAT-CRAFT-09",2]],
 S:[["MAT-CRAFT-05",2],["MAT-CRAFT-09",2]]
};
const staffTier={
 F:[["MAT-CRAFT-01",1]],
 E:[["MAT-CRAFT-02",1],["MAT-GEM-06",1]],
 D:[["MAT-CRAFT-02",1],["MAT-GEM-13",1]],
 C:[["MAT-CRAFT-04",1],["MAT-GEM-13",1]],
 B:[["MAT-CRAFT-05",1],["MAT-GEM-12",1]],
 A:[["MAT-CRAFT-05",1],["MAT-GEM-12",1],["MAT-ORE-28",1]],
 S:[["MAT-CRAFT-05",2],["MAT-GEM-12",1],["MAT-ORE-28",1]]
};

function mergeBase(d,pairs,dropClasses){
  const old=d.craft_recipe?.base_materials||[];
  const keep=old.filter(m=>!dropClasses.includes(matClass(m.id)));
  const map=new Map(keep.map(m=>[m.id,{id:m.id,qty:Math.max(1,Number(m.qty||1))}]));
  for(const [id,qty] of pairs||[])if(byId(id))map.set(id,{id,qty});
  d.craft_recipe.base_materials=[...map.values()];
}
const leatherLike=n=>/皮|靴|手套|護腕|護指|獵|行旅/.test(n)&&!/袍|披風|披肩|斗篷|兜帽|冠帶|法衣/.test(n);

function normalizeCraftItems(){
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r)continue;
    const n=String(d.name||"");
    let cls=(r.base_materials||[]).map(m=>matClass(m.id));
    const clearlyHard=HARD_RE.test(n);
    const clearlySoft=SOFT_RE.test(n)&&!clearlyHard;

    if(r.profession==="裁縫"&&!cls.some(x=>x==="soft"||x==="monster_soft")){
      if(clearlyHard){
        r.profession="鍛造";
        r.requires_facility="blacksmith";
        record(d,"profession_to_forge","金屬重裝由裁縫改回鍛造");
      }else if(clearlySoft||d.type==="披風"){
        const kind=leatherLike(n)?"leather":"cloth";
        mergeBase(d,softTier[d.tier]?.[kind]||softTier.F[kind],["metal","wood","craft"]);
        record(d,"textile_base","裁縫補回布／皮／纖維主素材");
      }
    }

    if(r.profession==="鍛造"&&clearlySoft){
      r.profession="裁縫";
      r.requires_facility="tailor";
      const kind=leatherLike(n)?"leather":"cloth";
      mergeBase(d,softTier[d.tier]?.[kind]||softTier.F[kind],["metal","wood","craft"]);
      record(d,"profession_to_tailor","軟裝由鍛造改為裁縫並重建主素材");
    }

    const isBow=d.weapon_profile?.group==="弓"||((/弓|弩/.test(n))&&d.type==="主武器");
    if(isBow){
      cls=(r.base_materials||[]).map(m=>matClass(m.id));
      if(!cls.includes("wood")||!cls.includes("soft")){
        mergeBase(d,bowTier[d.tier]||bowTier.F,["metal","wood","soft","craft"]);
        record(d,"bow_base","弓類補回木材與弦材");
      }
    }

    const isStaff=d.weapon_profile?.group==="法杖"||((/杖|法器/.test(n))&&Number(d.combat?.magicPower||0)>Number(d.combat?.attack||0));
    if(isStaff){
      cls=(r.base_materials||[]).map(m=>matClass(m.id));
      const needsMagic=d.tier!=="F";
      if(!cls.includes("wood")||(needsMagic&&!cls.some(x=>["gem","rune","magic_powder"].includes(x)))){
        mergeBase(d,staffTier[d.tier]||staffTier.F,["metal","wood","soft","craft","gem","magic_powder"]);
        record(d,"staff_base","法杖補回木材與魔法媒材");
      }
    }

    if(r.profession==="藥劑"){
      const slimeThemed=/黏|膠|酸|軟泥|史萊姆|金屬黏/.test(n+" "+String(d.desc||""));
      if(!slimeThemed){
        const before=(r.monster_components||[]).length;
        r.monster_components=(r.monster_components||[]).filter(m=>byId(m.id)?.source_family!=="黏獸");
        if(Array.isArray(d.monster_ingredients))d.monster_ingredients=d.monster_ingredients.filter(m=>byId(m.id)?.source_family!=="黏獸");
        const removed=before-r.monster_components.length;
        if(removed>0)record(d,"slime_template_removed","移除"+removed+"個無語意黏獸素材");
      }
    }
  }

  const eq=(DB.items||[]).filter(d=>["鍛造","裁縫","附魔"].includes(d?.craft_recipe?.profession));
  const freq={};
  for(const d of eq)for(const m of d.craft_recipe.monster_components||[])freq[m.id]=(freq[m.id]||0)+1;
  const familyWords=["黏獸","泥怪","魔像","哥布林","獸人","豺狼","狗頭","蜥蜴","食人魔","巨魔","牛頭","羊頭","巨人","狼","熊","蜘蛛","獨角獸","奇美拉","獅鷲","龍","吸血鬼","巫妖","怨靈","幽魂","元素","惡魔","天使"];
  const thematic=(d,m)=>{
    const md=byId(m.id)||{},tx=String(d.name||"")+" "+String(d.material||"")+" "+String(d.feature||"");
    if(md.source_family&&tx.includes(md.source_family))return true;
    for(const w of familyWords)if(String(md.name||"").includes(w)&&tx.includes(w))return true;
    const g=d.weapon_profile?.group||"";
    if(/羽|絲/.test(String(md.name||""))&&g==="弓")return true;
    if(/皮|毛|絲|翼膜|鱗/.test(String(md.name||""))&&(d.craft_recipe.profession==="裁縫"||SOFT_RE.test(String(d.name||""))))return true;
    if(/核心|晶/.test(String(md.name||""))&&Number(d.combat?.magicPower||0)>0&&freq[m.id]<8)return true;
    return false;
  };
  for(const d of eq){
    if(!["F","E","D","C"].includes(d.tier))continue;
    const before=(d.craft_recipe.monster_components||[]).length;
    d.craft_recipe.monster_components=(d.craft_recipe.monster_components||[]).filter(m=>freq[m.id]<5||thematic(d,m));
    if(Array.isArray(d.monster_upgrade_components))d.monster_upgrade_components=d.monster_upgrade_components.filter(m=>freq[m.id]<5||thematic(d,m));
    const removed=before-d.craft_recipe.monster_components.length;
    if(removed>0)record(d,"monster_template_removed","移除"+removed+"個高頻且無主題關聯魔物素材");
  }

  const hunt=byId("P31-021");
  if(hunt?.craft_recipe&&hunt.tier==="E"&&(hunt.craft_recipe.base_materials||[]).some(m=>m.id==="MAT-HERB-15")){
    hunt.craft_recipe.base_materials=hunt.craft_recipe.base_materials.map(m=>m.id==="MAT-HERB-15"?{id:"MAT-HERB-21",qty:Math.max(1,Number(m.qty||1))}:m);
    record(hunt,"tier_material","獵手集中藥劑：賢者草[C]改為四葉草[E]");
  }
}

const COOK_FIXES={
  "R-PIE":{"I-MUSHROOM":2,"MAT-FOOD-03":1},
  "R-MEAT-PIE":{"I-RAWMEAT":1,"MAT-FOOD-03":1,"I-ROOT":1},
  "R7-13":{"I-WATER":1,"I-MINT":1,"MAT-HERB-16":1},
  "R7-15":{"I-WATER":1,"I-ROOT":1,"I-MINT":1,"MAT-HERB-20":1},
  "R7-23":{"I-WATER":2,"MAT-HERB-03":1,"MAT-HERB-12":1,"MAT-FOOD-16":1}
};
function normalizeCooking(){
  for(const [id,requires] of Object.entries(COOK_FIXES)){
    const r=(DB.recipes||[]).find(x=>x?.id===id);
    if(!r)continue;
    r.requires={...requires};
    r.ingredients=[];
    r.profession="料理";
    const out=byId(r.result||r.output?.item_id);
    record(out||{id,name:r.name,tier:r.tier},"cooking_semantic","修正名稱與實際食材錯配");
  }
}

function audit(){
  const issues=[],review=[];
  const add=(d,code,reason)=>issues.push({id:d?.id||"unknown",name:d?.name||"",code,reason});
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r)continue;
    const n=String(d.name||""),base=r.base_materials||[],mon=r.monster_components||[],cls=base.map(m=>matClass(m.id));
    const expected={鍛造:"blacksmith",裁縫:"tailor",藥劑:"alchemy",附魔:"enchanter"}[r.profession];
    if(!expected)add(d,"UNKNOWN_PROFESSION","未知專業:"+(r.profession||"空白"));
    else if(r.requires_facility!==expected)add(d,"FACILITY_MISMATCH","設施:"+(r.requires_facility||"空白")+"→"+expected);
    if(!base.length&&!mon.length)add(d,"EMPTY_RECIPE","製作素材為空");
    for(const m of [...base,...mon]){
      const md=byId(m?.id);
      if(!md)add(d,"MISSING_MATERIAL","素材不存在:"+(m?.id||"空白"));
      if(!(Number(m?.qty)>0))add(d,"INVALID_QTY","素材數量無效:"+(m?.id||"空白"));
      if(md&&TIER_RANK[md.tier]>TIER_RANK[d.tier]+1)add(d,"OVER_TIER",md.name+"["+md.tier+"]高於成品["+d.tier+"]超過一級");
    }
    if(r.profession==="裁縫"&&!cls.some(x=>x==="soft"||x==="monster_soft"))add(d,"TAILOR_NO_TEXTILE","裁縫沒有布／皮／纖維主素材");
    if(r.profession==="鍛造"&&SOFT_RE.test(n)&&!HARD_RE.test(n))add(d,"SOFTGEAR_WRONG_PROF","明顯軟裝仍標為鍛造");
    const isBow=d.weapon_profile?.group==="弓"||((/弓|弩/.test(n))&&d.type==="主武器");
    if(isBow&&(!cls.includes("wood")||!cls.includes("soft")))add(d,"BOW_MATERIAL","弓類缺木材或弦材");
    const isStaff=d.weapon_profile?.group==="法杖"||((/杖|法器/.test(n))&&Number(d.combat?.magicPower||0)>Number(d.combat?.attack||0));
    if(isStaff&&(!cls.includes("wood")||(d.tier!=="F"&&!cls.some(x=>["gem","rune","magic_powder"].includes(x)))))add(d,"STAFF_MATERIAL","法杖缺木材或魔法媒材");
    if(r.profession==="藥劑"&&!/黏|膠|酸|軟泥|史萊姆|金屬黏/.test(n+" "+String(d.desc||""))&&mon.some(m=>byId(m.id)?.source_family==="黏獸"))add(d,"SLIME_TEMPLATE","一般藥劑仍綁黏獸素材");
  }

  for(const r of DB.recipes||[]){
    const out=byId(r?.result||r?.output?.item_id);
    if(!out||!(out.type==="料理"||out.inventory_group==="食物"||out.food_subtype))continue;
    const req={...(r.requires||{})};
    for(const m of r.ingredients||[])if(m?.item_id)req[m.item_id]=(req[m.item_id]||0)+Math.max(1,Number(m.qty||1));
    const names=Object.keys(req).map(id=>byId(id)?.name||id).join("、");
    const outName=String(out.name||r.name||"");
    if(/餅/.test(outName)&&!/麥|粉/.test(names))add(out,"COOK_PIE_GRAIN","餅類缺少穀物／麵粉");
    if(/茶/.test(outName)){
      if(!("I-WATER" in req))add(out,"COOK_TEA_WATER","茶飲缺水");
      if(/生肉|獸肉|雞肉|鮮魚|深海魚|蟹肉/.test(names))add(out,"COOK_TEA_PROTEIN","茶飲混入肉／魚模板素材");
    }
    for(const id of Object.keys(req))if(!byId(id))add(out,"COOK_MISSING_MATERIAL","料理素材不存在:"+id);
  }

  const eq=(DB.items||[]).filter(d=>["鍛造","裁縫","附魔"].includes(d?.craft_recipe?.profession));
  const freq={};
  for(const d of eq)for(const m of d.craft_recipe.monster_components||[])freq[m.id]=(freq[m.id]||0)+1;
  for(const d of eq){
    if(!["B","A","S"].includes(d.tier))continue;
    for(const m of d.craft_recipe.monster_components||[])if((freq[m.id]||0)>=5)review.push({id:d.id,name:d.name,tier:d.tier,material_id:m.id,material_name:byId(m.id)?.name||m.id,reason:"高階特殊配方共用高頻魔物媒材；保留為稀有催化劑，不自動判定污染"});
  }
  return {pass:issues.length===0,issues,review_candidates:review};
}

normalizeCraftItems();
normalizeCooking();
const result=audit();
const uniqueCorrected=uniq(corrections.map(x=>x.id));
const correctionCounts=corrections.reduce((m,x)=>(m[x.kind]=(m[x.kind]||0)+1,m),{});

DB.crafting_recipe_semantic_system={
  version:REV,release:RELEASE,
  scope:["鍛造","裁縫","藥劑","附魔","料理"],
  rules:[
    "低階常規藥劑不得因通用模板而強制綁定黏獸素材；酸液、黏膠、軟泥等主題配方例外。",
    "裁縫成品至少需要布、皮、纖維或合理魔物皮毛；明顯金屬重裝改回鍛造。",
    "弓類必須具備木材與弦材；法杖至少具備木材，E級以上另需魔法媒材。",
    "F-C級裝備的高頻魔物素材若與成品主題無關，視為模板污染並移除；B-A-S級稀有催化劑僅列人工檢視候選，不自動移除。",
    "料理名稱與實際食材需一致；餅類須含穀粉，茶飲須含水且不可混入肉魚模板。"
  ],
  corrected_ids:uniqueCorrected,
  correction_count:corrections.length,
  correction_counts:correctionCounts,
  corrections,
  review_candidates:result.review_candidates,
  initial_audit:{pass:result.pass,issue_count:result.issues.length,issues:result.issues},
  save_compatible:true
};

DB.crafting_data_integrity_system=DB.crafting_data_integrity_system||{version:"CRAFTING-DATA-INTEGRITY-1.0"};
DB.crafting_data_integrity_system.version="CRAFTING-DATA-INTEGRITY-1.0";
DB.crafting_data_integrity_system.semantic_revision=REV;
DB.crafting_data_integrity_system.counts=(DB.items||[]).filter(x=>x?.craft_recipe).reduce((m,x)=>(m[x.craft_recipe.profession]=(m[x.craft_recipe.profession]||0)+1,m),{鍛造:0,裁縫:0,藥劑:0,附魔:0});
DB.crafting_data_integrity_system.issue_count=result.issues.length;
DB.crafting_data_integrity_system.issues=[...result.issues];

DB.cooking_data_integrity_system=DB.cooking_data_integrity_system||{version:"COOKING-DATA-INTEGRITY-1.0"};
DB.cooking_data_integrity_system.version="COOKING-DATA-INTEGRITY-1.0";
DB.cooking_data_integrity_system.semantic_revision=REV;
DB.cooking_data_integrity_system.corrected_recipe_ids=uniq([...(DB.cooking_data_integrity_system.corrected_recipe_ids||[]),...Object.keys(COOK_FIXES)]);
DB.cooking_data_integrity_system.semantic_issue_count=result.issues.filter(x=>String(x.code||"").startsWith("COOK_")).length;
DB.cooking_data_integrity_system.semantic_issues=result.issues.filter(x=>String(x.code||"").startsWith("COOK_"));

DB.meta=DB.meta||{};
DB.meta.crafting_recipe_semantic_revision=REV;
globalThis.runCraftingRecipeSemanticAudit=audit;
})();