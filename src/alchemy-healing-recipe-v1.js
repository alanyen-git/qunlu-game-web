/* 群陸旅誌：生命回復藥劑配方完整性 CURRENT-1.69.4
 * ALCHEMY-HEALING-RECIPE-1.0
 * 修正低階生命回復品被通用魔物素材模板誤綁黏獸凝膠／核心。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.4";
const REV="ALCHEMY-HEALING-RECIPE-1.0";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const clone=x=>JSON.parse(JSON.stringify(x));
const uniq=a=>[...new Set(Array.isArray(a)?a:[])];

const FORMULAS={
  "P-HEAL-F":[["I-HERB",1],["I-MINT",1]],
  "P-HEAL-E":[["I-HERB",2],["MAT-HERB-05",1]],
  "P-HEAL-D":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-05",1]],
  "P7-01":[["I-HERB",1],["I-MINT",1]],
  "P7-05":[["I-HERB",2],["MAT-HERB-05",1]],
  "P7-11":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-05",1]],
  "PC-LIFE-01":[["I-HERB",1],["I-MINT",1]],
  "PC-LIFE-02":[["I-HERB",2],["MAT-HERB-05",1]],
  "PC-LIFE-03":[["I-HERB",2],["MAT-HERB-03",1],["MAT-HERB-05",1]],
  "PC-LIFE-06":[["MAT-HERB-06",2]],
  "PC-LIFE-07":[["MAT-HERB-02",1],["MAT-HERB-05",1],["I-MINT",1]],
  "PC-LIFE-08":[["MAT-HERB-03",1],["MAT-HERB-05",1],["MAT-HERB-02",1]],
  "PC-LIFE-10":[["I-HERB",1],["I-MINT",1]],
  "PC-LIFE-11":[["I-BANDAGE",1],["I-HERB",1]],
  "PC-LIFE-12":[["I-HERB",2],["MAT-HERB-05",1]]
};

const DESCRIPTIONS={
  "PC-LIFE-01":"以河岸止血草與林薄荷調製的基礎生命藥水；不需要魔物素材。",
  "PC-LIFE-02":"以濃縮止血草與晨露花調製的進階生命藥水。",
  "PC-LIFE-03":"以止血草、星辰花與晨露花調製的高效生命藥水。",
  "PC-LIFE-06":"經挑選、乾燥與調製的高級藥草，可直接用於簡易治療。",
  "PC-LIFE-07":"以花性草藥與林薄荷調成的治癒花蜜。",
  "PC-LIFE-08":"以星辰花、晨露花與太陽草調成的高濃度花蜜。",
  "PC-LIFE-10":"以止血草與林薄荷研成的外用療傷膏。",
  "PC-LIFE-11":"以乾淨繃帶包覆止血草製成的止血繃帶。",
  "PC-LIFE-12":"以濃縮止血草與晨露花製成的治療軟膏。"
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
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues,changed_ids:Object.keys(FORMULAS),details}
}

DB.meta=DB.meta||{};
DB.meta.alchemy_healing_recipe_revision=REV;
DB.alchemy_healing_recipe_system={
  version:REV,
  release:RELEASE,
  scope:"F-D級生命回復品",
  rule:"低階常規生命回復品以草藥／醫療素材為主，不強制綁定黏獸或其它魔物素材；真正特殊的高階藥劑仍可使用有設定意義的魔物材料。",
  canonical_small_life_potion:{id:"PC-LIFE-01",materials:[{id:"I-HERB",qty:1},{id:"I-MINT",qty:1}]},
  save_compatible:true
};
normalize();
globalThis.runAlchemyHealingRecipeAudit=audit;
DB.alchemy_healing_recipe_system.initial_audit=audit();
})();
