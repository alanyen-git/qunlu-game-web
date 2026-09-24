/* 群陸旅誌：生命回復藥劑配方完整性 CURRENT-1.72.1
 * ALCHEMY-HEALING-RECIPE-1.3
 * 修正低階生命回復品被通用魔物素材模板誤綁黏獸凝膠／核心。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.4";
const REV="ALCHEMY-HEALING-RECIPE-1.3";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const clone=x=>JSON.parse(JSON.stringify(x));
const uniq=a=>[...new Set(Array.isArray(a)?a:[])];

const FORMULAS={
  "P-HEAL-F":[["I-HERB",2],["I-MINT",1]],
  "P-HEAL-E":[["I-HERB",1],["MAT-HERB-05",1],["I-MINT",1]],
  "P-HEAL-D":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-06",1]],
  "P7-01":[["I-HERB",1],["I-MINT",1]],
  "P7-05":[["I-HERB",1],["MAT-HERB-06",1],["MAT-HERB-18",1]],
  "P7-11":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-18",1]],
  "PC-LIFE-01":[["I-HERB",1],["I-MINT",1]],
  "PC-LIFE-02":[["I-HERB",2],["MAT-HERB-05",1]],
  "PC-LIFE-03":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-05",1]],
  "PC-LIFE-06":[["MAT-HERB-06",2]],
  "PC-LIFE-07":[["MAT-HERB-02",1],["MAT-HERB-05",1],["I-MINT",1]],
  "PC-LIFE-08":[["MAT-HERB-03",1],["MAT-HERB-05",1],["MAT-HERB-02",1]],
  "PC-LIFE-10":[["I-HERB",1],["I-MINT",1],["MAT-CRAFT-19",1]],
  "PC-LIFE-11":[["I-BANDAGE",1],["I-HERB",1]],
  "PC-LIFE-12":[["I-HERB",2],["MAT-HERB-05",1],["MAT-CRAFT-19",1]]
};

const DESCRIPTIONS={
  "P-HEAL-F":"使用更多止血草製作的加量初階恢復藥劑，立即恢復10HP。",
  "P-HEAL-E":"成本較低的常規恢復藥劑，立即恢復24HP；中型生命藥水則適合急救。",
  "P-HEAL-D":"星辰花與血棘草調製的長效療癒藥劑：立即30HP，戰鬥後續3回合各8HP。",
  "P7-01":"微量混合藥劑，立即恢復6HP與4SP。",
  "P7-11":"以迷迭香補強的上級綜合恢復藥劑，立即恢復42HP與18SP。",
  "P7-05":"以血棘草與迷迭香穩定療效；先恢復12HP，戰鬥中再連續3回合各恢復8HP，非戰鬥則持續3小時每小時恢復8HP。",
  "PC-LIFE-01":"以河岸止血草與林薄荷調製的基礎生命藥水；不需要魔物素材。",
  "PC-LIFE-02":"以濃縮止血草與晨露花調製的即效生命藥水；一次恢復32HP，適合緊急治療。",
  "PC-LIFE-03":"以止血草、星辰花與晨露花調製的高效生命藥水。",
  "PC-LIFE-06":"經挑選、乾燥與調製的高級藥草，可直接用於簡易治療。",
  "PC-LIFE-07":"以花性草藥與林薄荷調成的治癒花蜜。",
  "PC-LIFE-08":"以星辰花、晨露花與太陽草調成的高濃度花蜜。",
  "PC-LIFE-10":"以止血草、林薄荷及油脂研成的外用療傷膏；恢復7HP並解除流血。",
  "PC-LIFE-11":"以乾淨繃帶包覆止血草製成的止血繃帶。",
  "PC-LIFE-12":"以止血草、晨露花與油脂製成的治療軟膏；恢復16HP並解除流血。"
};

function normalize(){
  const changed=[];
  for(const [id,parts] of Object.entries(FORMULAS)){
    const d=byId(id);if(!d?.craft_recipe)continue;
    d.craft_recipe.base_materials=parts.map(([mid,qty])=>({id:mid,qty}));
    d.craft_recipe.monster_components=[];
    d.monster_ingredients=[];
    d.recipe_logic="herbal_healing";
    d.recipe_revision=REV;
    d.acquisition_sources=uniq([...(d.acquisition_sources||[]),"craft"]);
    if(DESCRIPTIONS[id])d.desc=DESCRIPTIONS[id];
    changed.push(id)
  }
  const commonE=byId("P-HEAL-E");if(commonE)commonE.value=32;
  const sustainedD=byId("P-HEAL-D");
  if(sustainedD){sustainedD.use={...(sustainedD.use||{}),hp:30,regeneration:{combat_hp_per_round:8,combat_rounds:3,field_hp_per_hour:8,field_hours:3}};sustainedD.recipe_logic="sustained_starflower_healing"}
  const hybridD=byId("P7-11");if(hybridD){hybridD.use={...(hybridD.use||{}),hp:42,stamina:18};hybridD.recipe_logic="hybrid_healing_stamina"}
  for(const id of ["PC-LIFE-10","PC-LIFE-12"]){const d=byId(id);if(d)d.use={...(d.use||{}),conditions:["bleed"]}}
  const sustained=byId("P7-05");
  if(sustained){
    sustained.use={...(sustained.use||{}),hp:12,regeneration:{combat_hp_per_round:8,combat_rounds:3,field_hp_per_hour:8,field_hours:3}};
    sustained.recipe_logic="sustained_bloodthorn_healing";
    sustained.recipe_revision=REV;
  }
  const f=byId("P7-01");if(f){f.use={...(f.use||{}),hp:6,stamina:4};f.recipe_logic="micro_hybrid"}
  const instant=byId("PC-LIFE-02");
  if(instant){instant.use={...(instant.use||{}),hp:32};instant.recipe_logic="instant_life_healing"}
  return changed
}

function slimeComponent(m){
  const d=byId(m?.id);
  return /^DROP-SG-/.test(String(m?.id||""))||d?.source_family==="黏獸"
}

function audit(){
  const issues=[],details=[];
  for(const [id,parts] of Object.entries(FORMULAS)){
    const d=byId(id);
    if(!d){issues.push(`配方成品不存在:${id}`);continue}
    if(d.consumable_group!=="生命回復")issues.push(`${id}:非生命回復分類`);
    if(!d.craft_recipe||d.craft_recipe.profession!=="藥劑")issues.push(`${id}:藥劑配方缺失`);
    const base=d.craft_recipe?.base_materials||[],mon=d.craft_recipe?.monster_components||[];
    if(mon.some(slimeComponent)||(d.monster_ingredients||[]).some(slimeComponent))issues.push(`${id}:仍含黏獸素材`);
    for(const [mid,qty] of parts){
      const md=byId(mid),got=base.find(x=>x.id===mid);
      if(!md)issues.push(`${id}:素材不存在/${mid}`);
      if(!got||Number(got.qty)!==qty)issues.push(`${id}:素材數量錯誤/${mid}`);
      if(md&&TIER_RANK[md.tier]>TIER_RANK[d.tier])issues.push(`${id}:素材超階/${md.name}`);
    }
    details.push({id,name:d.name,tier:d.tier,materials:base.map(x=>({id:x.id,name:byId(x.id)?.name||x.id,qty:x.qty})),monster_components:mon.length})
  }
  const polluted=(DB.items||[]).filter(d=>d?.consumable_group==="生命回復"&&TIER_RANK[d.tier]<=TIER_RANK.D&&
    ([...(d.craft_recipe?.monster_components||[]),...(d.monster_ingredients||[])]).some(slimeComponent));
  if(polluted.length)issues.push(`F-D生命回復品仍含黏獸素材:${polluted.map(x=>x.id).slice(0,12).join("、")}`);
  const small=byId("PC-LIFE-01");
  const expected=JSON.stringify([{id:"I-HERB",qty:1},{id:"I-MINT",qty:1}]);
  if(JSON.stringify(small?.craft_recipe?.base_materials||[])!==expected)issues.push("小型生命藥水基礎配方未鎖定為止血草＋林薄荷");
  const instant=byId("PC-LIFE-02"),sustained=byId("P7-05");
  const rg=sustained?.use?.regeneration;
  if(Number(instant?.use?.hp)!==32||instant?.use?.regeneration)issues.push("中型生命藥水應為32HP即效，不得附加持續恢復");
  if(Number(sustained?.use?.hp)!==12||Number(rg?.combat_hp_per_round)!==8||Number(rg?.combat_rounds)!==3||Number(rg?.field_hp_per_hour)!==8||Number(rg?.field_hours)!==3)issues.push("強化恢復藥劑持續恢復機制缺失");
  const matIds=id=>new Set((byId(id)?.craft_recipe?.base_materials||[]).map(m=>m.id));
  const pairA=matIds("PC-LIFE-02"),pairB=matIds("P7-05");
  if([...pairA].some(id=>pairB.has(id))&&pairA.size===pairB.size&&[...pairA].every(id=>pairB.has(id)))issues.push("即效與持續恢復藥劑使用相同素材模板");
  const life=(DB.items||[]).filter(d=>d?.craft_recipe?.profession==="藥劑"&&d.consumable_group==="生命回復"&&["F","E","D"].includes(d.tier));
  const review_candidates=[];
  for(let i=0;i<life.length;i++)for(let j=i+1;j<life.length;j++){
    const x=life[i],y=life[j];if(x.tier!==y.tier||x.id==="P7-05"||y.id==="P7-05")continue;
    if(!Number(x.use?.hp)||!Number(y.use?.hp)||x.use?.regeneration||y.use?.regeneration)continue;
    const a=(x.craft_recipe?.base_materials||[]).map(m=>m.id).sort().join("|"),b=(y.craft_recipe?.base_materials||[]).map(m=>m.id).sort().join("|");
    if(a&&a===b&&Math.abs(x.use.hp-y.use.hp)/Math.max(x.use.hp,y.use.hp)<=.35)review_candidates.push({ids:[x.id,y.id],names:[x.name,y.name],tier:x.tier,reason:"相同素材與即效治療類型，數值差距不超過35%；待進一步區分用途"});
  }
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues,changed_ids:Object.keys(FORMULAS),details,review_candidates}
}

DB.meta=DB.meta||{};
DB.meta.alchemy_healing_recipe_revision=REV;
DB.alchemy_healing_recipe_system={
  version:REV,
  release:RELEASE,
  scope:"F-D級生命回復品",
  rule:"低階常規生命回復品以草藥／醫療素材為主，不強制綁定黏獸或其它魔物素材；真正特殊的高階藥劑仍可使用有設定意義的魔物材料。",
  canonical_small_life_potion:{id:"PC-LIFE-01",materials:[{id:"I-HERB",qty:1},{id:"I-MINT",qty:1}]},
  differentiation:{instant:"PC-LIFE-02",sustained:"P7-05",stacking:"同類持續恢復重用時刷新，不疊加"},
  save_compatible:true
};
normalize();
globalThis.runAlchemyHealingRecipeAudit=audit;
DB.alchemy_healing_recipe_system.initial_audit=audit();
globalThis.runHealingPotionDifferentiationAudit=audit;
})();
