/* 群陸旅誌：裝備分類與商貿名稱正規化 EQUIPMENT-TAXONOMY-1.0 */
(()=>{"use strict";
if(typeof DB!=="object"||!Array.isArray(DB.items))return;
const REV="EQUIPMENT-TAXONOMY-1.0",RELEASE=globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.15.1";
const NAME_FIX={"灰門握鐵護手":"灰門鐵護手","灰門駐地戰靴":"灰門戰靴","鷹眼銅鏡墜":"鷹眼鏡墜","赤岩鍛脈戒":"赤岩鍛造戒"};
const REPEAT=/(晨曦|暮影|灰燼|霜痕|雷紋|潮痕|裂風|月泉|赤岩|深林|銀穗|星砂|靜心|鷹眼|不屈|守望|巡獵|祈誓|熔脈)\1/g;
const FAMILIES=["劍","斧","鎚","法杖"];
function isShield(d){return !!d&&(d.catalog_subcategory==="盾牌"||d.type==="盾牌"||((d.type==="主武器"||d.type==="副武器"||d.catalog_group==="防具")&&/盾(?:牌)?$/.test(String(d.name||""))))}
function family(d){
 const s=String(d.name||"")+" "+String(d.catalog_subcategory||"");
 if(/武士刀/.test(s))return null;
 if(/法杖|魔杖|權杖|祈禱杖|秘杖|法器/.test(s))return "法杖";
 if(/斧/.test(s))return "斧";
 if(/[錘鎚]/.test(s))return "鎚";
 if(/劍/.test(s))return "劍";
 const g=String(d.weapon_profile?.group||"");
 if(g==="法杖")return "法杖";
 if(g==="長劍"||g==="劍")return "劍";
 return null;
}
function hands(d){
 const name=String(d.name||"");
 if(/雙手|巨劍|大劍|巨斧|重型法杖/.test(name))return 2;
 if(/單手/.test(name))return 1;
 const h=Number(d.weapon_profile?.hands);
 if(h===1||h===2)return h;
 return /巨|重/.test(name)&&Number(d.weight)>=3?2:1;
}
function normalizeItem(d){
 if(!d||!d.id)return;
 if(isShield(d)){
  d.catalog_group="防具";d.catalog_subcategory="盾牌";
  d.combat=d.combat&&typeof d.combat==="object"?d.combat:{};
  const old=Number(d.combat.attack||0);
  if(old!==0){
   if(!(Number(d.combat.defense)>0))d.combat.defense=Math.max(1,Math.round(Math.abs(old)*.65));
   delete d.combat.attack;
  }
  if(d.advanced_combat)delete d.advanced_combat.attack;
  return;
 }
 if(d.type!=="主武器"&&d.catalog_group!=="武器")return;
 const f=family(d);if(!FAMILIES.includes(f))return;
 d.weapon_profile=d.weapon_profile&&typeof d.weapon_profile==="object"?d.weapon_profile:{};
 const h=hands(d);d.weapon_profile.hands=h;d.weapon_family=f;
 d.weapon_handedness=h===2?"雙手":"單手";
 d.catalog_group="武器";d.catalog_subcategory=d.weapon_handedness+f;
}
function normalize(){
 const names=new Set(DB.items.map(x=>String(x?.name||"")).filter(Boolean));
 const result={total:DB.items.length,renamed:0,shieldsFixed:0,weaponsUpdated:0};
 for(const d of DB.items){
  if(!d||!d.id)continue;
  const old=String(d.name||""),newName=NAME_FIX[old]||old.replace(REPEAT,"$1").replace(/護手手套/g,"護手").replace(/戰靴靴/g,"戰靴");
  if(newName!==old&&!names.has(newName)){
   names.delete(old);names.add(newName);
   d.previous_names=Array.isArray(d.previous_names)?d.previous_names:[];
   if(!d.previous_names.includes(old))d.previous_names.push(old);
   d.name=newName;result.renamed++;
  }
  const prior=d.catalog_subcategory,attack=Number(d.combat?.attack||0);
  normalizeItem(d);
  if(isShield(d)&&attack!==0)result.shieldsFixed++;
  if(d.weapon_family&&prior!==d.catalog_subcategory)result.weaponsUpdated++;
 }
 return result;
}
const label=(v,f)=>{const s=String(v||"").trim();return s&&s.length<=24?s:f};
function typeText(d){
 if(!d)return "道具／未分類";
 if(isShield(d)||(d.type==="主武器"||d.catalog_group==="武器")&&!d.weapon_family)normalizeItem(d);
 const t=String(d.type||""),g=String(d.catalog_group||""),s=String(d.catalog_subcategory||"");
 if(isShield(d))return "裝備／防具／盾牌";
 if(g==="武器"||t==="主武器"||t==="副武器")return "裝備／武器／"+label(s||d.weapon_profile?.group,"其他武器");
 if(g==="防具"||["盔甲","頭盔","手套","鞋子","護腿","護腕"].includes(t))return "裝備／防具／"+label(s&&!/特色/.test(s)?s:t,"其他防具");
 if(g==="飾品"||["飾品","披風","項鍊","戒指"].includes(t))return "裝備／飾品／"+label(s&&!/特色/.test(s)?s:t,"飾品");
 if(t==="食材"||d.inventory_group==="食材")return "素材／食材";
 if(["素材","草藥素材","工藝素材","礦石","魔物素材","寶石素材","藥草"].includes(t)||g==="素材"||d.material_group||d.monster_drop_core)return "素材／"+label(d.material_group||s||t,"一般素材");
 if(t==="藥劑"||d.consumable_group)return "道具／藥劑／"+label(d.consumable_group||s,"藥劑");
 if(/技能.*(?:書|殘本)/.test(String(d.name||""))||/manuscript|skill.?book|skill.?fragment/i.test(String(d.kind||"")))return "道具／"+(/殘本/.test(String(d.name||""))?"技能殘本":"技能書");
 if(["卷軸","書籍","符文"].includes(t)||d.knowledge_tag)return "道具／"+label(t||"書籍","書籍");
 if(["料理","食物"].includes(t)||d.inventory_group==="食物")return "道具／食物／"+label(t,"料理");
 if(t==="憑證"||d.trade_credential)return "道具／交易憑證";
 if(t==="工具"||d.tool_effect)return "道具／工具";
 return "道具／"+label(t||s||g,"其他");
}
function audit(){
 const issues=[],stats={single:0,double:0,shields:0};
 for(const d of DB.items){
  if(!d)continue;
  if(isShield(d)){
   stats.shields++;
   if(Number(d.combat?.attack||0)||Number(d.advanced_combat?.attack||0))issues.push("盾牌仍含攻擊："+d.id);
   if(d.catalog_group!=="防具"||d.catalog_subcategory!=="盾牌")issues.push("盾牌分類異常："+d.id);
  }else if((d.type==="主武器"||d.catalog_group==="武器")&&FAMILIES.includes(family(d))){
   const h=Number(d.weapon_profile?.hands);
   if(![1,2].includes(h)||d.catalog_subcategory!==(h===2?"雙手":"單手")+family(d))issues.push("武器單雙手不一致："+d.id);
   else stats[h===2?"double":"single"]++;
  }
  if(REPEAT.test(String(d.name||"")))issues.push("名稱修飾重複："+d.id);
  REPEAT.lastIndex=0;
 }
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:issues.slice(0,50),stats,save_compatible:true};
}
const stats=normalize();DB.meta=DB.meta||{};DB.meta.equipment_taxonomy_revision=REV;
DB.equipment_taxonomy_system={version:REV,release:RELEASE,stats,save_compatible:true,handed_families:FAMILIES,shield_rule:"盾牌僅提供防禦、格擋、抗性；盾擊由技能處理。",trade_labels:"裝備／道具／素材及細項"};
globalThis.itemTradeTypeText=typeText;
globalThis.runEquipmentTaxonomyNormalize=normalize;globalThis.runEquipmentTaxonomyAudit=audit;
globalThis.QUNLU_EQUIPMENT_TAXONOMY={version:REV,typeText,audit};
globalThis.QUNLU_CORE?.registerModule?.("src/equipment-taxonomy-v1.js",{domain:"finalization",revision:REV,release:RELEASE});
})();
