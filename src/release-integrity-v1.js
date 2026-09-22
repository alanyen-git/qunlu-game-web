/* 群陸旅誌：正式發布完整性橋接 CURRENT-2.07.2
 * RELEASE-INTEGRITY-2.21
 * 將靜態資料完整性與先前在 runtime 載入前建立的配方稽核正式接回五回合自檢。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-2.07.2")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.07.2";
const REV="RELEASE-INTEGRITY-2.20";
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
  if(typeof globalThis.runCombatClassIdentityDepthAudit==="function")pushResult(issues,"戰鬥職業深化:",globalThis.runCombatClassIdentityDepthAudit());
  else issues.push("戰鬥職業深化:稽核runtime缺失");
  if(typeof globalThis.runTalentIdentityDepthAudit==="function")pushResult(issues,"天賦深化:",globalThis.runTalentIdentityDepthAudit());
  else issues.push("天賦深化:稽核runtime缺失");
  if(typeof globalThis.runSkillNamingReferenceAudit==="function")pushResult(issues,"技能命名:",globalThis.runSkillNamingReferenceAudit());
  else issues.push("技能命名:稽核runtime缺失");
  if(typeof globalThis.runSkillMechanicsDepthAudit==="function")pushResult(issues,"技能機制:",globalThis.runSkillMechanicsDepthAudit());
  else issues.push("技能機制:稽核runtime缺失");
  if(typeof globalThis.runCompanionIdentityDepthAudit==="function")pushResult(issues,"夥伴特色深化:",globalThis.runCompanionIdentityDepthAudit());
  else issues.push("夥伴特色深化:稽核runtime缺失");
  if(typeof globalThis.runCompanionSpeciesIdentityAudit==="function")pushResult(issues,"夥伴物種簽章:",globalThis.runCompanionSpeciesIdentityAudit());
  else issues.push("夥伴物種簽章:稽核runtime缺失");
  if(typeof globalThis.runOriginDepthAudit==="function")pushResult(issues,"角色出身:",globalThis.runOriginDepthAudit());
  else issues.push("角色出身:稽核runtime缺失");
  if(typeof globalThis.runAffiliationIdentityDepthAudit==="function")pushResult(issues,"組織流派深化:",globalThis.runAffiliationIdentityDepthAudit());
  else issues.push("組織流派深化:稽核runtime缺失");
  if(typeof globalThis.runPoliticalConsolidationAudit==="function")pushResult(issues,"政治體整併:",globalThis.runPoliticalConsolidationAudit());
  else issues.push("政治體整併:稽核runtime缺失");
  if(typeof globalThis.runPoliticalHierarchyDepthAudit==="function")pushResult(issues,"政治階層深化:",globalThis.runPoliticalHierarchyDepthAudit());
  else issues.push("政治階層深化:稽核runtime缺失");
  if(typeof globalThis.runStarterSettlementsAudit==="function")pushResult(issues,"新手村出生分配:",globalThis.runStarterSettlementsAudit());
  else issues.push("新手村出生分配:稽核runtime缺失");
  if(typeof globalThis.runAnweirDepthAudit==="function")pushResult(issues,"安威爾帝國深化:",globalThis.runAnweirDepthAudit());
  else issues.push("安威爾帝國深化:稽核runtime缺失");
  if(typeof globalThis.runSeruviaDepthAudit==="function")pushResult(issues,"瑟露維亞精靈王庭深化:",globalThis.runSeruviaDepthAudit());
  else issues.push("瑟露維亞精靈王庭深化:稽核runtime缺失");
  if(typeof globalThis.runBlackMoonDepthAudit==="function")pushResult(issues,"黑月深庭深化:",globalThis.runBlackMoonDepthAudit());
  else issues.push("黑月深庭深化:稽核runtime缺失");
  if(typeof globalThis.runBlackTideDepthAudit==="function")pushResult(issues,"黑潮群島深化:",globalThis.runBlackTideDepthAudit());
  else issues.push("黑潮群島深化:稽核runtime缺失");
  if(typeof globalThis.runTyervalonDepthAudit==="function")pushResult(issues,"泰爾瓦隆百族部落深化:",globalThis.runTyervalonDepthAudit());
  else issues.push("泰爾瓦隆百族部落深化:稽核runtime缺失");
  if(typeof globalThis.runBlueTowerDepthAudit==="function")pushResult(issues,"藍塔魔導王國深化:",globalThis.runBlueTowerDepthAudit());
  else issues.push("藍塔魔導王國深化:稽核runtime缺失");
  if(typeof globalThis.runVanrekDepthAudit==="function")pushResult(issues,"凡雷克帝國深化:",globalThis.runVanrekDepthAudit());
  else issues.push("凡雷克帝國深化:稽核runtime缺失");
  if(typeof globalThis.runGrayBladeDepthAudit==="function")pushResult(issues,"傭兵都市深化:",globalThis.runGrayBladeDepthAudit());
  else issues.push("傭兵都市深化:稽核runtime缺失");
  if(typeof globalThis.runFrostHornDepthAudit==="function")pushResult(issues,"霜角酋邦深化:",globalThis.runFrostHornDepthAudit());
  else issues.push("霜角酋邦深化:稽核runtime缺失");
  if(typeof globalThis.runWhiteFeltDepthAudit==="function")pushResult(issues,"白氈汗國深化:",globalThis.runWhiteFeltDepthAudit());
  else issues.push("白氈汗國深化:稽核runtime缺失");
  if(typeof globalThis.runHolyRadianceDepthAudit==="function")pushResult(issues,"聖曜帝國深化:",globalThis.runHolyRadianceDepthAudit());
  else issues.push("聖曜帝國深化:稽核runtime缺失");
  if(typeof globalThis.runWorldGeopoliticalMapAudit==="function")pushResult(issues,"世界政治地圖:",globalThis.runWorldGeopoliticalMapAudit());
  else issues.push("世界政治地圖:稽核runtime缺失");
  if(typeof globalThis.runAffiliationEntryGateAudit==="function")pushResult(issues,"勢力接觸門檻:",globalThis.runAffiliationEntryGateAudit());
  else issues.push("勢力接觸門檻:稽核runtime缺失");
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
DB.release_integrity_system={version:REV,release:RELEASE,scope:["ID唯一性","物品重量","製作素材引用","配方V1/V2","配方素材量／成本／成品價值平衡","鍛造／裁縫／附魔裝備物量、成對結構與材質語意","配方最終載入鎖定","取水資料","裝備命名參考與外部專名避讓","職業命名／系別／進階來源","戰鬥職業同質合併／戰術特色／實際職業修正／舊ID映射","天賦同質合併／特色軸／代價／武器條件／副職業差異／舊ID映射","技能命名／階級／元素／語義效果","技能機制／條件／連段／反擊／陷阱／群體支援runtime","角色出身合併／特色／側寫／舊存檔映射","組織／流派同質合併／世界4王國3地區2上限／歷史現況特色","16政治體修訂後完整政治階層／禮序與AUTH權能分離／榮譽稱號無自動統治權","6新手村／5個非阿斯戴爾政治體／種族出身職業加權出生／周邊F-E級區域","安威爾帝國7治理區／9城鎮／15野外／10地下城／24怪物／20核心NPC／礦權石律與深層主權分流","瑟露維亞精靈王庭7治理區／9城鎮／15野外／10地下城／24怪物／20核心NPC／森約、水權與聖域分流","黑月深庭7治理區／9地下聚落／15地下野外／10地下城／24怪物／16素材／20核心NPC／七大家門＋誓井議庭＋活世界事件鏈／地表與深層主權分流","斷境無主地6區帶／8聚落／14野外／9地下城／24怪物／18核心NPC／8地方組織／無中央主權互保治理","龍脊火山群6區帶／8聚落／14野外／10地下城／24怪物／18核心NPC／8地方組織／非主權火山承載治理","黑潮群島3大島＋5小島／城鎮野外地下城／18怪物／16核心NPC／王庭幕府地方權力鏈","泰爾瓦隆十二大圖騰席＋六大地帶／8城鎮／12野外／8地下城／20怪物／18核心NPC／百族分權治理","藍塔六大區域帶／8城鎮／12野外／8地下城／21怪物／18核心NPC／塔主議會與術式安全治理／一般區E-C與受控B級深層分流","凡雷克七大區域／10城鎮／14野外／10地下城／24怪物／22核心NPC／帝冠與舊王法雙層治理／一般區F-C與受控B級深層分流","灰刃六大區域／8城鎮／12野外／8地下城／22怪物／18核心NPC／武契議會與市議堂雙議軌／契約仲裁與受控C級南境深層","霜角六大火席／6治理區／8城鎮／12野外／8地下城／22怪物／18核心NPC／越冬與山口承載治理","白氈五大旗帳／6季牧區／8聚落／12野外／8地下城／22怪物／20核心NPC／季移汗庭、水泉與牧路治理","聖曜帝國8大封邑／11城鎮／16野外／10地下城／26怪物／24核心NPC／10組織／帝冠、諸侯盟議與跨境加冕教權雙軌治理","晨律教國7大教區／10城鎮／14野外／9地下城／24怪物／22核心NPC／選舉牧首、樞機、教律與跨境加冕權邊界","卡薩維爾城盟7大城市帶／10城鎮／14野外／9地下城／24怪物／20核心NPC／REG-06+REG-07成員城自治與共同議會","20大區政治疆域／海岸山河湖泊／氣候帶／主要道路／國境關隘／國境地理成因／首都座標／地下重疊主權地圖","高階組織／流派劇情性接觸／入門考核／舊存檔相容","統一名稱生成／正規化查重／固定fallback防護","五回合自檢橋接","夥伴光環條件觸發／21種專屬技能核心／復起救援／元素調律","20種物種簽章／光環效果差異／技能名稱唯一／物種附加行為","程序載入清單與順序由PROGRAM-REGISTRY獨立稽核"],save_compatible:true,initial_audit:audit()};
globalThis.runReleaseIntegrityAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/release-integrity-v1.js",{domain:"finalization",revision:REV,release:RELEASE});
})();