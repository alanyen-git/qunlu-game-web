/* 群陸旅誌：配方最終載入鎖定 CURRENT-1.71.7
 * RECIPE-FINALIZATION-1.0
 * 所有內容模組載入後，再次正規化配方素材量、種類與價值比，防止後載入模組覆寫既有平衡。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE="CURRENT-1.71.7";
const REV="RECIPE-FINALIZATION-1.0";

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
  rule:"所有內容模組完成後再執行一次配方經濟正規化；最終稽核未通過時由發布完整性與部署流程阻擋。",
  equipment_normalization,
  normalization,
  initial_audit:result,
  save_compatible:true
};
globalThis.runRecipeFinalizationAudit=audit;
})();
