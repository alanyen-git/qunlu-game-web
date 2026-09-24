/* 群陸旅誌：配方最終載入鎖定 CURRENT-1.71.8
 * RECIPE-FINALIZATION-1.1
 * 所有內容模組載入後，再次正規化配方素材量、種類與價值比，防止後載入模組覆寫既有平衡。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE=globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.7";
const REV="RECIPE-FINALIZATION-1.1";

function audit(){
  const issues=[];
  if(typeof globalThis.runEquipmentRecipeBalanceAudit==="function"){
    const e=globalThis.runEquipmentRecipeBalanceAudit();
    if(e?.pass===false)for(const x of e.issues||[])issues.push("裝備配方:"+String(x));
  }else issues.push("裝備配方稽核runtime缺失");
  if(typeof globalThis.runRecipeEconomyBalanceAudit!=="function"){
    issues.push("配方經濟稽核runtime缺失");
  }else{
    const r=globalThis.runRecipeEconomyBalanceAudit();
    if(r?.pass===false)for(const x of r.issues||[])issues.push(typeof x==="string"?x:JSON.stringify(x));
  }
  if(typeof globalThis.runHealingPotionDifferentiationAudit==="function"){
    const h=globalThis.runHealingPotionDifferentiationAudit();
    if(h?.pass===false)for(const x of h.issues||[])issues.push("藥劑差異性:"+String(x));
  }else issues.push("藥劑差異性稽核runtime缺失");
  if(typeof globalThis.runProfessionRecipeDifferentiationAudit==="function"){
    const d=globalThis.runProfessionRecipeDifferentiationAudit();
    if(d?.pass===false)for(const x of d.issues||[])issues.push("副職配方差異性:"+String(x));
  }else issues.push("副職配方差異性稽核runtime缺失");
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)]}
}

let equipment_normalization=null,normalization=null;
if(typeof globalThis.runEquipmentRecipeBalanceNormalize==="function")equipment_normalization=globalThis.runEquipmentRecipeBalanceNormalize();
if(typeof globalThis.runRecipeEconomyBalanceNormalize==="function")normalization=globalThis.runRecipeEconomyBalanceNormalize();

const result=audit();
DB.meta=DB.meta||{};
DB.meta.recipe_finalization_revision=REV;
DB.recipe_finalization_system={
  version:REV,
  release:RELEASE,
  rule:"所有內容模組完成後依序執行裝備結構配方與配方經濟正規化；最終稽核未通過時由發布完整性與部署流程阻擋。",
  equipment_normalization,
  normalization,
  differentiation:DB.profession_recipe_differentiation_system?.initial_audit||null,
  initial_audit:result,
  save_compatible:true
};
globalThis.runRecipeFinalizationAudit=audit;
})();
