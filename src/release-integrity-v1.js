/* 群陸旅誌：正式發布完整性橋接 CURRENT-1.77.0
 * RELEASE-INTEGRITY-2.0
 * 將靜態資料完整性與先前在 runtime 載入前建立的配方稽核正式接回五回合自檢。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.72.1")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.72.1";
const REV="RELEASE-INTEGRITY-2.0";
const STATIC_COLLECTIONS=["items","monsters","locations","quest_templates","world_organizations","companion_species","party_member_templates","lore_records","faith_entities"];
function pushResult(issues,prefix,result){
  if(!result||result.pass!==false)return;
  for(const issue of result.issues||[]){
    const msg=typeof issue==="string"?issue:(issue?.reason?((issue.name||issue.id||"資料")+":"+issue.reason):JSON.stringify(issue));
    issues.push(prefix+msg);
  }
}
function staticAudit(){
  const issues=[];
  for(const key of STATIC_COLLECTIONS){
    const rows=Array.isArray(DB[key])?DB[key]:[];
    const seen=new Set();
    for(const row of rows){
      if(!row?.id){issues.push(key+":缺少ID");continue}
      if(seen.has(row.id))issues.push(key+":ID重複:"+row.id);
      seen.add(row.id);
    }
  }
  const itemIds=new Set((DB.items||[]).map(x=>x?.id).filter(Boolean));
  for(const d of DB.items||[]){
    if(!Number.isFinite(Number(d?.weight))||Number(d.weight)<0)issues.push("物品重量異常:"+(d?.id||d?.name||"unknown"));
    const r=d?.craft_recipe;
    if(!r)continue;
    for(const m of [...(r.base_materials||[]),...(r.monster_components||[])]){
      if(!itemIds.has(m?.id))issues.push("配方素材引用缺失:"+(d?.id||d?.name)+"->"+(m?.id||"empty"));
      if(!(Number(m?.qty)>0))issues.push("配方素材數量異常:"+(d?.id||d?.name)+"->"+(m?.id||"empty"));
    }
  }
  return [...new Set(issues)];
}
const STATIC_ISSUES=staticAudit();
function audit(){
  const issues=[...STATIC_ISSUES];
  if(typeof globalThis.runCraftingRecipeSemanticAudit==="function")pushResult(issues,"配方V1:",globalThis.runCraftingRecipeSemanticAudit());
  else issues.push("配方V1:稽核runtime缺失");
  if(typeof globalThis.runCraftingRecipeSemanticAuditV2==="function")pushResult(issues,"配方V2:",globalThis.runCraftingRecipeSemanticAuditV2());
  else issues.push("配方V2:稽核runtime缺失");
  if(typeof globalThis.runEquipmentRecipeBalanceAudit==="function")pushResult(issues,"裝備配方:",globalThis.runEquipmentRecipeBalanceAudit());
  else issues.push("裝備配方:稽核runtime缺失");
  if(typeof globalThis.runRecipeEconomyBalanceAudit==="function")pushResult(issues,"配方經濟:",globalThis.runRecipeEconomyBalanceAudit());
  else issues.push("配方經濟:稽核runtime缺失");
  if(typeof globalThis.runRecipeFinalizationAudit==="function")pushResult(issues,"配方最終:",globalThis.runRecipeFinalizationAudit());
  else issues.push("配方最終:稽核runtime缺失");
  if(typeof globalThis.runWaterSourceAudit==="function")pushResult(issues,"取水:",globalThis.runWaterSourceAudit());
  else issues.push("取水:稽核runtime缺失");
  if(typeof globalThis.runEquipmentNamingReferenceAudit==="function")pushResult(issues,"裝備命名:",globalThis.runEquipmentNamingReferenceAudit());
  else issues.push("裝備命名:稽核runtime缺失");
  if(typeof globalThis.runClassNamingReferenceAudit==="function")pushResult(issues,"職業命名:",globalThis.runClassNamingReferenceAudit());
  else issues.push("職業命名:稽核runtime缺失");
  if(typeof globalThis.runSkillNamingReferenceAudit==="function")pushResult(issues,"技能命名:",globalThis.runSkillNamingReferenceAudit());
  else issues.push("技能命名:稽核runtime缺失");
  if(typeof globalThis.runSkillMechanicsDepthAudit==="function")pushResult(issues,"技能機制:",globalThis.runSkillMechanicsDepthAudit());
  else issues.push("技能機制:稽核runtime缺失");
  if(typeof globalThis.runNameGeneratorAudit==="function")pushResult(issues,"統一命名:",globalThis.runNameGeneratorAudit());
  else issues.push("統一命名:稽核runtime缺失");
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{items:(DB.items||[]).length,monsters:(DB.monsters||[]).length,locations:(DB.locations||[]).length,companions:(DB.companion_species||[]).length,static_issue_count:STATIC_ISSUES.length}};
}
const base=globalThis.runGeneratorAudit;
if(typeof base==="function"&&!base.__releaseIntegrityPatched){
  const wrapped=function(){
    const previous=base.apply(this,arguments);
    const result=audit();
    return [...(Array.isArray(previous)?previous:[]),...result.issues.map(x=>"發布完整性:"+x)];
  };
  wrapped.__releaseIntegrityPatched=true;
  globalThis.runGeneratorAudit=wrapped;
}
DB.meta=DB.meta||{};
DB.meta.release_integrity_revision=REV;
DB.release_integrity_system={version:REV,release:RELEASE,scope:["ID唯一性","物品重量","製作素材引用","配方V1/V2","配方素材量／成本／成品價值平衡","鍛造／裁縫／附魔裝備物量、成對結構與材質語意","配方最終載入鎖定","取水資料","裝備命名參考與外部專名避讓","職業命名／系別／進階來源","技能命名／階級／元素／語義效果","技能機制／條件／連段／反擊／陷阱／群體支援runtime","統一名稱生成／正規化查重／固定fallback防護","五回合自檢橋接","程序載入清單與順序由PROGRAM-REGISTRY獨立稽核"],save_compatible:true,initial_audit:audit()};
globalThis.runReleaseIntegrityAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/release-integrity-v1.js",{domain:"finalization",revision:REV,release:RELEASE});
})();