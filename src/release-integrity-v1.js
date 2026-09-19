/* 群陸旅誌：正式發布完整性橋接 CURRENT-1.70.3
 * RELEASE-INTEGRITY-1.1
 * 將靜態資料完整性與先前在 runtime 載入前建立的配方稽核正式接回五回合自檢。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE="CURRENT-1.70.3";
const REV="RELEASE-INTEGRITY-1.1";
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
  if(typeof globalThis.runWaterSourceAudit==="function")pushResult(issues,"取水:",globalThis.runWaterSourceAudit());
  else issues.push("取水:稽核runtime缺失");
  if(typeof globalThis.runEquipmentNamingReferenceAudit==="function")pushResult(issues,"裝備命名:",globalThis.runEquipmentNamingReferenceAudit());
  else issues.push("裝備命名:稽核runtime缺失");
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
DB.release_integrity_system={version:REV,release:RELEASE,scope:["ID唯一性","物品重量","製作素材引用","配方V1/V2","取水資料","裝備命名參考與外部專名避讓","五回合自檢橋接"],save_compatible:true,initial_audit:audit()};
globalThis.runReleaseIntegrityAudit=audit;
})();