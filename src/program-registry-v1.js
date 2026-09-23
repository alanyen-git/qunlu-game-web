/* 群陸旅誌：現行程序清單與載入完整性 CURRENT-2.12.0
 * PROGRAM-REGISTRY-1.28
 * 單一來源記錄正式入口所需的所有 src 程序，並把載入順序納入五回合自檢。
 */
(()=>{
"use strict";
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.12.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.12.0";
const REV="PROGRAM-REGISTRY-1.28";

const GROUPS=Object.freeze({
  core:["src/bootstrap.js"],
  data:[
    "src/game-data.js","src/data-patches.js","src/origin-depth-v1.js","src/combat-class-identity-depth-v1.js","src/talent-identity-depth-v1.js","src/asdail-depth-v2.js","src/asdail-narrative-depth-v1.js","src/asdail-integration-v1.js","src/affiliation-identity-depth-v1.js","src/political-consolidation-v1.js","src/political-hierarchy-depth-v1.js","src/starter-settlements-v1.js","src/anweir-seruvia-depth-v1.js","src/black-moon-depth-v1.js","src/black-tide-depth-v1.js","src/tyervalon-depth-v1.js","src/blue-tower-depth-v1.js","src/vanrek-depth-v1.js","src/gray-blade-depth-v1.js","src/frost-horn-depth-v1.js","src/white-felt-depth-v1.js","src/holy-radiance-depth-v1.js","src/dawn-casavelle-depth-v1.js","src/boundary-dragonspine-depth-v1.js",
    "src/alchemy-healing-recipe-v1.js","src/equipment-depth-v1.js","src/crafting-recipe-semantic-v1.js",
    "src/crafting-recipe-semantic-v2.js","src/equipment-recipe-balance-v1.js","src/recipe-economy-balance-v1.js","src/trade-venues-data-v1.js","src/equipment-eligibility-v2.js"
  ],
  runtime:[
    "src/runtime.js","src/asdail-narrative-runtime-v1.js","src/companion-growth-v1.js","src/crafting-success-v2.js","src/market-economy-v2.js","src/trade-venues-runtime-v1.js",
    "src/world-autonomy-v1.js","src/runtime-patches.js"
  ],
  world:[
    "src/affiliation-contribution-v1.js","src/affiliation-entry-gate-v1.js","src/affiliation-treasury-depth-v2.js","src/world-autonomy-v2.js","src/world-map-geopolitics-v1.js","src/region-map-graphics-v1.js","src/world-map-tile-atlas-v1.js",
    "src/npc-depth-v1.js","src/npc-depth-v2.js","src/dungeon-depth-v2.js"
  ],
  progression:[
    "src/combat-class-progression-v1.js","src/class-skill-optimization-v1.js","src/class-skill-passive-compat-v1.js","src/class-naming-reference-v1.js",
    "src/skill-naming-reference-v1.js","src/skill-mechanics-depth-v1.js","src/system-integrity-v2.js","src/affiliation-integrity-v1.js",
    "src/player-experience-guidance-v1.js"
  ],
  naming:[
    "src/world-naming-v1.js","src/world-naming-v2.js","src/world-naming-protection-v1.js",
    "src/equipment-naming-reference-v1.js","src/name-generator-v2.js"
  ],
  survival:[
    "src/water-source-v1.js","src/companion-aura-v1.js","src/companion-unique-skill-v1.js","src/companion-identity-depth-v1.js","src/companion-species-identity-v1.js","src/adventure-party-teammate-depth-v1.js","src/rpg-reference-synthesis-v1.js"
  ],
  finalization:[
    "src/quest-regional-ecology-v1.js","src/recipe-finalization-v1.js","src/release-integrity-v1.js","src/release-version-sync-v1.js",
    "src/pwa.js","src/program-registry-v1.js"
  ]
});
const EXPECTED=Object.freeze(Object.values(GROUPS).flat());
const EXPECTED_SET=new Set(EXPECTED);

function cleanSrc(src){
  const raw=String(src||"");
  if(!raw)return "";
  try{
    const u=new URL(raw,typeof location!=="undefined"?location.href:"https://example.invalid/");
    const marker="/src/";
    const at=u.pathname.lastIndexOf(marker);
    return at>=0?"src/"+u.pathname.slice(at+marker.length):u.pathname.replace(/^\//,"");
  }catch(error){
    return raw.split("?")[0].replace(/^\.\//,"");
  }
}
function loadedPrograms(){
  if(typeof document==="undefined")return [];
  return [...document.scripts].map(s=>cleanSrc(s.src)).filter(x=>x.startsWith("src/"));
}
function duplicateValues(values){
  const seen=new Set(),dupes=new Set();
  for(const v of values){if(seen.has(v))dupes.add(v);seen.add(v)}
  return [...dupes];
}
function audit(){
  const issues=[];
  const duplicateExpected=duplicateValues(EXPECTED);
  if(duplicateExpected.length)issues.push("程序清單重複:"+duplicateExpected.join("、"));
  if(!CORE)issues.push("共用核心未載入:src/bootstrap.js");

  const loaded=loadedPrograms();
  if(loaded.length){
    const loadedSet=new Set(loaded);
    const missing=EXPECTED.filter(x=>!loadedSet.has(x));
    const extra=loaded.filter(x=>!EXPECTED_SET.has(x));
    if(missing.length)issues.push("入口缺少程序:"+missing.join("、"));
    if(extra.length)issues.push("入口存在未登錄程序:"+[...new Set(extra)].join("、"));
    const duplicates=duplicateValues(loaded);
    if(duplicates.length)issues.push("入口重複載入:"+duplicates.join("、"));
    if(!missing.length&&!extra.length&&!duplicates.length&&loaded.length===EXPECTED.length){
      for(let i=0;i<EXPECTED.length;i++){
        if(loaded[i]!==EXPECTED[i]){
          issues.push(`程序載入順序錯誤:${i+1} 預期 ${EXPECTED[i]} 實際 ${loaded[i]||"缺失"}`);
          break;
        }
      }
    }
  }

  const critical=[
    ["資料庫",()=>typeof DB==="object"&&Array.isArray(DB.items)],
    ["遊戲runtime",()=>typeof globalThis.persist==="function"],
    ["配方最終稽核",()=>typeof globalThis.runRecipeFinalizationAudit==="function"],
    ["系統完整性",()=>typeof globalThis.runSystemIntegrityAudit==="function"],
    ["取水稽核",()=>typeof globalThis.runWaterSourceAudit==="function"],
    ["統一命名",()=>typeof globalThis.runNameGeneratorAudit==="function"],
    ["技能機制深化",()=>typeof globalThis.runSkillMechanicsDepthAudit==="function"],
    ["角色出身深化",()=>typeof globalThis.runOriginDepthAudit==="function"],
    ["戰鬥職業深化",()=>typeof globalThis.runCombatClassIdentityDepthAudit==="function"],
    ["天賦深化",()=>typeof globalThis.runTalentIdentityDepthAudit==="function"],
    ["夥伴特色深化",()=>typeof globalThis.runCompanionIdentityDepthAudit==="function"],
    ["夥伴物種簽章",()=>typeof globalThis.runCompanionSpeciesIdentityAudit==="function"],
    ["冒險團隊友深化",()=>typeof globalThis.runAdventurePartyTeammateDepthAudit==="function"],
    ["RPG參考綜合深化",()=>typeof globalThis.runRpgReferenceSynthesisAudit==="function"&&globalThis.runRpgReferenceSynthesisAudit().pass],
    ["交易場靜態資料",()=>typeof globalThis.runTradeVenueDataAudit==="function"],
    ["拍賣行／黑市",()=>typeof globalThis.runAuctionBlackMarketAudit==="function"],
    ["組織流派深化",()=>typeof globalThis.runAffiliationIdentityDepthAudit==="function"],
    ["政治體整併",()=>typeof globalThis.runPoliticalConsolidationAudit==="function"],
    ["政治階層深化",()=>typeof globalThis.runPoliticalHierarchyDepthAudit==="function"],
    ["新手村出生分配",()=>typeof globalThis.runStarterSettlementsAudit==="function"],
    ["安威爾帝國深化",()=>typeof globalThis.runAnweirDepthAudit==="function"],
    ["瑟露維亞精靈王庭深化",()=>typeof globalThis.runSeruviaDepthAudit==="function"],
    ["黑月深庭深化",()=>typeof globalThis.runBlackMoonDepthAudit==="function"],
    ["斷境無主地深化",()=>typeof globalThis.runBoundaryDepthAudit==="function"&&globalThis.runBoundaryDepthAudit().pass],
    ["龍脊火山群深化",()=>typeof globalThis.runDragonspineDepthAudit==="function"&&globalThis.runDragonspineDepthAudit().pass],
    ["黑潮群島深化",()=>typeof globalThis.runBlackTideDepthAudit==="function"],
    ["泰爾瓦隆百族部落深化",()=>typeof globalThis.runTyervalonDepthAudit==="function"],
    ["藍塔魔導王國深化",()=>typeof globalThis.runBlueTowerDepthAudit==="function"],
    ["傭兵都市深化",()=>typeof globalThis.runGrayBladeDepthAudit==="function"],
    ["霜角酋邦深化",()=>typeof globalThis.runFrostHornDepthAudit==="function"],
    ["白氈汗國深化",()=>typeof globalThis.runWhiteFeltDepthAudit==="function"],
    ["聖曜帝國深化",()=>typeof globalThis.runHolyRadianceDepthAudit==="function"],
    ["晨律教國深化",()=>typeof globalThis.runDawnLawDepthAudit==="function"&&globalThis.runDawnLawDepthAudit().pass],
    ["卡薩維爾城盟深化",()=>typeof globalThis.runCasavelleDepthAudit==="function"&&globalThis.runCasavelleDepthAudit().pass],
    ["世界政治地圖",()=>typeof globalThis.runWorldGeopoliticalMapAudit==="function"],
    ["三級區域圖面",()=>typeof globalThis.runRegionMapGraphicsAudit==="function"&&globalThis.runRegionMapGraphicsAudit().pass],
    ["原創拼接世界地圖",()=>typeof globalThis.runWorldMosaicAudit==="function"&&globalThis.runWorldMosaicAudit().pass],
    ["高階勢力接觸門檻",()=>typeof globalThis.runAffiliationEntryGateAudit==="function"],
    ["發布完整性",()=>typeof globalThis.runReleaseIntegrityAudit==="function"],
    ["阿斯戴爾劇情深化",()=>typeof globalThis.runAsdailNarrativeAudit==="function"&&globalThis.runAsdailNarrativeAudit().pass],
    ["活世界循環",()=>typeof globalThis.runLiveWorldAudit==="function"&&globalThis.runLiveWorldAudit().pass]
  ];
  for(const [name,test] of critical){let ok=false;try{ok=!!test()}catch(error){}if(!ok)issues.push("關鍵程序不可用:"+name)}

  if(globalThis.DB?.meta?.current_version&&String(DB.meta.current_version)!==String(RELEASE)){
    issues.push(`資料庫版本不同步:${DB.meta.current_version}!=${RELEASE}`);
  }
  return {
    revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],
    stats:{expected:EXPECTED.length,loaded:loaded.length,groups:Object.fromEntries(Object.entries(GROUPS).map(([k,v])=>[k,v.length]))}
  };
}

if(CORE?.registerModule)CORE.registerModule("src/program-registry-v1.js",{domain:"finalization",revision:REV,release:RELEASE});
if(globalThis.DB?.meta){
  DB.meta.program_registry_revision=REV;
  DB.program_registry_system={version:REV,release:RELEASE,groups:GROUPS,expected_programs:EXPECTED,save_compatible:true};
}

const baseGeneratorAudit=globalThis.runGeneratorAudit;
if(typeof baseGeneratorAudit==="function"&&!baseGeneratorAudit.__programRegistryPatched){
  const wrapped=function(){
    const previous=baseGeneratorAudit.apply(this,arguments);
    const result=audit();
    return [...(Array.isArray(previous)?previous:[]),...result.issues.map(x=>"程序整理:"+x)];
  };
  wrapped.__programRegistryPatched=true;
  globalThis.runGeneratorAudit=wrapped;
}
globalThis.QUNLU_PROGRAM_GROUPS=GROUPS;
globalThis.QUNLU_ACTIVE_PROGRAMS=EXPECTED;
globalThis.runProgramRegistryAudit=audit;
if(globalThis.DB?.program_registry_system)DB.program_registry_system.initial_audit=audit();
})();