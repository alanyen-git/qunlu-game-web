/* 群陸旅誌：所有副職配方差異性治理 CURRENT-2.14.7
 * PROFESSION-RECIPE-DIFFERENTIATION-1.0
 * 鍛造／裁縫／藥劑／附魔／料理：修復同素材同效果、同階級數值互相取代及名稱與材料不符。
 * 只修有明確用途的成品，保留物品ID、既有存檔與已學配方。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const REV="PROFESSION-RECIPE-DIFFERENTIATION-1.0";
const RELEASE=globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.7";
const RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const idMap=new Map((DB.items||[]).map(x=>[x.id,x]));
const byId=id=>idMap.get(id)||null;
const changes=[],invalid=[];
const record=(id,domain,reason)=>changes.push({id,domain,reason});
const validMaterial=(id,tier)=>{const m=byId(id);return !!m&&RANK[m.tier]<=RANK[tier]};
function fix(id,p){
 const d=byId(id);
 if(!d){invalid.push("成品不存在："+id);return}
 const r=d.craft_recipe;
 if(!r){invalid.push("成品沒有製作配方："+id);return}
 if(p.base){
   if(p.base.some(([mid])=>!validMaterial(mid,d.tier))){invalid.push(id+"：替換素材不存在或超階");return}
   r.base_materials=p.base.map(([mid,qty])=>({id:mid,qty}));
 }
 if(p.add)for(const [mid,qty] of p.add){
   if(!validMaterial(mid,d.tier)){invalid.push(id+"：新增素材不存在或超階："+mid);continue}
   r.base_materials=r.base_materials||[];
   const old=r.base_materials.find(x=>x.id===mid);
   if(old)old.qty=Math.max(Number(old.qty)||1,qty);
   else r.base_materials.push({id:mid,qty});
 }
 if(p.profession){r.profession=p.profession;r.requires_facility=({鍛造:"blacksmith",裁縫:"tailor",藥劑:"alchemy",附魔:"enchanter"})[p.profession]}
 if(p.name)d.name=p.name;
 if(p.combat)d.combat={...(d.combat||{}),...p.combat};
 if(p.advanced){
   d.advanced_combat={...(d.advanced_combat||{}),...p.advanced};
   d.feature_tags=[...new Set([...(d.feature_tags||[]),p.feature_tag||"專業特色"])];
 }
 if(p.use)d.use={...(d.use||{}),...p.use};
 if(p.buff)d.buff={...(d.buff||{}),...p.buff};
 if(Number.isFinite(p.value))d.value=p.value;
 if(p.desc)d.desc=p.desc;
 if(p.feature)d.feature=p.feature;
 d.recipe_identity={version:REV,purpose:p.purpose||"專門用途",design_reason:p.reason||"與同階成品採取不同的素材及戰術用途"};
 d.recipe_differentiation_revision=REV;
 record(id,r.profession,p.reason||p.purpose||"差異化");
}

// 具備地區或職能名稱的裝備，必須在材料與至少一項有效能力上表現差異。
const GEAR={
 "EQ31-029":{add:[["MAT-CRAFT-06",2]],purpose:"布質巡路衣",reason:"補亞麻主材，保留通用巡路防護"},
 "EQ31-030":{combat:{defense:4,evasion:2},add:[["MAT31-CRAFT-02",1]],purpose:"河港水手靈活及防水",reason:"降低厚重防護、改善閃避並使用河港防水布"},
 "EQ31-031":{combat:{defense:6,evasion:0},add:[["MAT-CRAFT-18",1]],purpose:"邊民補強防護",reason:"增加繩束強化結構，偏重物理防護"},
 "EQ31-051":{combat:{accuracy:3},add:[["MAT-CRAFT-18",1]],purpose:"穩定長柄武器握持",reason:"補握槍束帶，突出命中"},
 "EQ31-052":{combat:{critRate:1},add:[["MAT-CRAFT-06",1]],purpose:"劍術精細操控",reason:"以亞麻襯層提升精細劍技的爆擊能力"},
 "EQ31-053":{combat:{evasion:1},add:[["MAT-CRAFT-07",1]],purpose:"騎乘穩定",reason:"羊毛內襯配合騎乘閃避"},
 "EQ31-059":{combat:{defense:3,evasion:1},add:[["MAT-CRAFT-18",1]],purpose:"高原軍靴抗衝擊",reason:"束帶加固，防禦高於普通騎靴"},
 "EQ31-060":{combat:{evasion:3},add:[["MAT-CRAFT-06",1]],purpose:"風鬃輕騎靴",reason:"輕薄內襯，偏重閃避"},
 "EQ31-061":{combat:{statusResist:2},add:[["MAT-CRAFT-07",1]],purpose:"雪地保暖",reason:"加入羊毛，提升寒地行動的基礎異常抗性"},
 "EQ7-W05":{combat:{critRate:2},add:[["MAT-CRAFT-12",1]],purpose:"獵刀精細切割",reason:"皮革止滑握柄與小幅爆擊差異"},
 "EQ7-R03":{combat:{magicPower:3},add:[["MAT-SCR-10",1]],purpose:"術士施法晶珠",reason:"以符文石作為施法媒介，提高魔法威力"},
 "EQ7-R04":{combat:{critRate:1,defense:3},add:[["MAT-ORE-02",1]],purpose:"守護徽飾",reason:"以銀礦作守護紋，從爆擊轉向防護"},
 "EQ31-035":{combat:{defense:7,evasion:2},add:[["MAT-CRAFT-18",1]],purpose:"獵皮甲",reason:"獵用繩束提升野外活動靈活度"},
 "EQ31-044":{combat:{accuracy:1},add:[["MAT-CRAFT-06",1]],purpose:"決鬥帽",reason:"輕薄亞麻內襯，提升決鬥命中"},
 "EQ31-045":{combat:{defense:2,evasion:1},add:[["MAT-CRAFT-12",1]],purpose:"獵首帶",reason:"獸皮內襯而非純決鬥帽抗性"},
 "EQ31-046":{add:[["MAT31-HERB-07",1]],purpose:"晨律禮儀護面",reason:"採用晨鐘白草輔助護面儀式"},
 "EQ31-047":{combat:{defense:4,statusResist:3,accuracy:2},add:[["MAT-CRAFT-13",1]],purpose:"灰刃輕半盔",reason:"皮革內襯，部分防護換取視野與命中"},
 "EQ31-049":{advanced:{carryCapacity:1},feature_tag:"勞作",add:[["MAT-CRAFT-06",1]],purpose:"工作負重",reason:"補亞麻襯層並提高勞作負重1"},
 "EQ31-050":{combat:{accuracy:2},add:[["MAT-CRAFT-18",1]],purpose:"河港繩工握持",reason:"使用繩索增加繩工精確度"},
 "EQ31-054":{name:"灰刃精鋼護腕",profession:"鍛造",base:[["MAT-ORE-18",2],["MAT-CRAFT-13",1]],combat:{defense:4,accuracy:2},purpose:"精鋼護腕",reason:"原件誤用蜘蛛絲線且列為裁縫，改由鍛造與精鋼主材製作"},
 "EQ31-055":{combat:{defense:2,accuracy:2,magicPower:3},add:[["MAT-GEM-13",1]],purpose:"藍塔術式手套",reason:"以魔力水晶導魔，維持裁縫絲質主材"},
 "EQ31-057":{add:[["MAT-CRAFT-06",1]],purpose:"柳橋行路靴",reason:"加亞麻透氣內襯，保留通用長途行走"},
 "EQ31-058":{combat:{evasion:2},add:[["MAT31-CRAFT-02",1]],purpose:"河岸防滑靴",reason:"增加河港防水布與閃避能力"},
 "EQ31-065":{add:[["MAT31-CRAFT-02",1]],purpose:"柳橋雨披",reason:"雨披加入防水布，不再與普通披風同材"},
 "EQ31-066":{combat:{evasion:1},add:[["MAT-CRAFT-18",1]],purpose:"河港短披風",reason:"以繩束方便行動，側重閃避"},
 "EQ31-068":{combat:{evasion:1},add:[["MAT-CRAFT-07",1]],purpose:"風鬃防風披風",reason:"羊毛保暖與風地閃避"},
 "EQ31-069":{combat:{defense:3,statusResist:2},add:[["MAT-CRAFT-07",1],["MAT31-CRAFT-02",1]],purpose:"霜角雪地披風",reason:"羊毛與防水布，寒地防護高於防風披風"},
 "EQ31-070":{combat:{magicDefense:7},add:[["MAT-GEM-13",1]],purpose:"藍塔抗術披風",reason:"晶石作抗法媒介，優先魔法防禦"},
 "EQ31-071":{combat:{statusResist:4},add:[["MAT31-HERB-07",1]],purpose:"晨律白紋披風",reason:"晨鐘白草作祝紋媒介，優先異常抗性"}
};
for(const [id,p]of Object.entries(GEAR))fix(id,p);

// 藥劑：同級產品必須在即效量、持續回復、混合資源、增益、價格或核心素材上有所不同。
// 正史低階配方之素材鎖定保留在 recipe-economy 模組，本層只更動額外效果。
const POTIONS={
 "P7-01":{use:{hp:6,stamina:4},purpose:"微量混合恢復",reason:"6HP及4SP，與8HP純生命藥水區分"},
 "P-MANA-F":{buff:{castSpeed:0.03,hours:1},purpose:"新手施法回復",reason:"10MP並短暫強化施法速度，保留既有標準材料"},
 "PC-CLEAN-19":{buff:{mana_regen:1,hours:1},purpose:"醒神與凝神",reason:"與清醒藥劑的異常抗性不同，額外提供1小時MP回復"},
 "P-STAM-E":{use:{stamina:20,thirst:-8},base:[["MAT-HERB-05",1],["MAT-HERB-18",1]],purpose:"行旅體力與補水",reason:"平價20SP及解渴8，以晨露花調配"},
 "P7-06":{use:{stamina:24},buff:{attackSpeed:0.04,hours:2},base:[["MAT-HERB-06",1],["MAT-HERB-18",1]],purpose:"戰鬥活力",reason:"以血棘草調成24SP加短暫攻速，與純耐力藥水區分"},
 "PC-MANA-02":{value:28,purpose:"平價魔力補給",reason:"18MP的價格由42下修28，不與中型魔力藥水同價"},
 "PC-MANA-03":{base:[["MAT-HERB-04",2],["MAT-HERB-01",2]],purpose:"中型即效魔力",reason:"28MP以加倍藥草用量調製"},
 "PC-MANA-07":{use:{mana:20},buff:{mana_regen:2,hours:2},add:[["MAT-HERB-05",1]],purpose:"魔力花蜜緩效",reason:"20MP加兩小時每小時2MP，花蜜加入晨露花"},
 "PC-MANA-09":{add:[["I-BERRY",1]],purpose:"魔力果露",reason:"魔力與SP混合補給，加入實際果實"},
 "P7-12":{use:{stamina:35},buff:{attackSpeed:0.06,hours:2},base:[["MAT-HERB-06",1],["MAT-HERB-21",1],["MAT-HERB-16",1]],purpose:"上級戰鬥活力",reason:"35SP配合攻速強化，與45SP純精力藥水區分"},
 "PC-MANA-08":{use:{mana:30},buff:{mana_regen:3,hours:3},add:[["MAT-HERB-03",1]],purpose:"星光花蜜緩效",reason:"30MP及3小時MP持續回復，加入星辰花"},
 "PC-MANA-10":{add:[["MAT-HERB-05",1]],purpose:"精靈露水雙資源",reason:"35MP加8SP，草藥加入晨露花"},
 "PC-MANA-11":{use:{mana:48},buff:{mana_regen:5,hours:3},add:[["MAT-HERB-03",1]],purpose:"月光之露緩效",reason:"48MP並持續回復，加入星辰花"},
 "PC-MANA-17":{add:[["MAT-HERB-18",1]],purpose:"靈氣混合恢復",reason:"雙資源補給加入迷迭香以區別純魔力藥水"},
 "PC-MANA-19":{add:[["I-WATER",1]],purpose:"魔力泉水解渴",reason:"補回實際泉水，保留MP與口渴雙效果"},
 "PC-MANA-12":{use:{mana:75},buff:{mana_regen:6,hours:3},add:[["MAT-HERB-03",1]],purpose:"星辰之露長效",reason:"75MP加持續回復，與90MP即效以太精華區別"},
 "P7-16":{use:{hp:54,regeneration:{combat_hp_per_round:12,combat_rounds:3,field_hp_per_hour:12,field_hours:3}},add:[["MAT-HERB-15",1]],purpose:"特級持續治療",reason:"54HP即效＋三回合各12HP，使用C級賢者草"},
 "P-GREATER-B":{buff:{statusResist:9,hours:2},add:[["MAT-HERB-15",1]],purpose:"高階復原兼異常抵抗",reason:"相較奇蹟復原的高即效量，提供兩小時抗異常增益"}
};
for(const [id,p]of Object.entries(POTIONS))fix(id,p);
fix("EQ31-074",{add:[["MAT-CRAFT-18",1]],purpose:"河港繩結護符",reason:"繩結護符實際使用河港繩索"});
fix("EQ31-075",{base:[["MAT-GEM-06",1],["MAT-ORE-02",1]],purpose:"銀岸誓戒",reason:"原配方錯用黑鐵，改回銀礦與白水晶"});
fix("EQ31-077",{name:"風鬃風紋環",purpose:"風屬紋章",reason:"不存在可採集的馬鬃材料，名稱改為與晶石金屬紋章一致"});
fix("EQ31-079",{add:[["MAT31-HERB-07",1]],purpose:"晨律白燈徽",reason:"加入晨鐘白草作祝儀媒材"});

// 料理：同食材製作的燉品需要呈現不同的營養與專長，保留飢餓／戰鬥原有能力。
function fixCook(recipeId,p){
 const r=(DB.recipes||[]).find(x=>x?.id===recipeId),d=byId(r?.result||r?.output?.item_id);
 if(!r||!d){invalid.push("料理不存在："+recipeId);return}
 const req={...(r.requires||{})};
 for(const [mid,qty]of p.add||[]){
  if(!validMaterial(mid,d.tier)){invalid.push(recipeId+"：料理素材不存在或超階："+mid);continue}
  req[mid]=Math.max(Number(req[mid]||0),qty);
 }
 r.requires=req;r.ingredients=[];
 if(p.use)d.use={...(d.use||{}),...p.use};
 if(p.combat)d.combat={...(d.combat||{}),...p.combat};
 if(p.desc)d.desc=p.desc;
 d.recipe_identity={version:REV,purpose:p.purpose,design_reason:p.reason};
 d.recipe_differentiation_revision=REV;
 record(recipeId,"料理",p.reason)
}
fixCook("R-IRONSTEW",{add:[["MAT-HERB-18",1]],use:{stamina:12},purpose:"礦工高能燉餐",reason:"以迷迭香燉肉補充12SP，區別偏抗性的採礦人燉盤"});
fixCook("R7-17",{add:[["MAT-HERB-04",1]],use:{mana:14},purpose:"秘法補魔料理",reason:"加入寧神花並恢復14MP，與魔劍士攻擊料理不同"});
fixCook("R7-21",{add:[["MAT-HERB-06",1]],use:{stamina:12},purpose:"魔劍士戰鬥料理",reason:"以血棘草恢復12SP，偏向物攻而非秘法燉鍋"});

// 完整資料庫差異性稽核：嚴格重複需沒有任何有效數值差異且採相同核心材料。
// 合理共用基礎材料但定位不同的鍛刀、護具及地區款式，不以同材直接當作錯誤。
function stable(value){
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,stable(v)]));
 return value;
}
function effectKey(d){
 return JSON.stringify(stable({use:d.use||null,buff:d.buff||null,combat:d.combat||null,advanced:d.advanced_combat||null,element:d.element_resistances||null,battle:d.battle_effect||null,oil:d.weapon_oil||null,revive:d.revive||null,food:d.food_effect||null,duration:d.duration||null}));
}
function ingredientKey(r){return [...new Set([...(r?.base_materials||[]),...(r?.monster_components||[])].map(m=>m.id).filter(Boolean))].sort().join("|")}
function cookIngredientKey(r){return [...new Set([...Object.keys(r.requires||{}),...(r.ingredients||[]).map(m=>m.item_id||m.id)].filter(Boolean))].sort().join("|")}
function directOnly(d,key){const u=d.use||{};return Number(u[key])>0&&Object.keys(u).length===1&&!d.buff&&!d.revive&&!d.battle_effect&&!d.weapon_oil}
function audit(){
 const issues=[...invalid],seen=new Map(),professional={鍛造:0,裁縫:0,藥劑:0,附魔:0},food=[];
 const pro=(DB.items||[]).filter(d=>d.craft_recipe&&Object.prototype.hasOwnProperty.call(professional,d.craft_recipe.profession));
 for(const d of pro){
   professional[d.craft_recipe.profession]++;
   const r=d.craft_recipe;
   const key=[r.profession,d.tier,d.type,d.weapon_profile?.group||"",ingredientKey(r),effectKey(d)].join("~~");
   const peer=seen.get(key);
   if(peer)issues.push("完全重複："+peer.id+"("+peer.name+")／"+d.id+"("+d.name+")：同階同材料同機制");
   else seen.set(key,d);
 }
 // 同材料、純HP/MP/SP並且價格不變的弱效配方，視為不合理被替代。
 for(let i=0;i<pro.length;i++){
  const a=pro[i];if(a.craft_recipe.profession!=="藥劑")continue;
  for(let j=i+1;j<pro.length;j++){
   const b=pro[j];if(b.craft_recipe.profession!=="藥劑"||a.tier!==b.tier||ingredientKey(a.craft_recipe)!==ingredientKey(b.craft_recipe))continue;
   for(const key of ["hp","mana","stamina"]){
    if(!directOnly(a,key)||!directOnly(b,key))continue;
    const x=Number(a.use[key]),y=Number(b.use[key]),ap=Number(a.value??a.price),bp=Number(b.value??b.price);
    if((x<y&&ap>=bp)||(y<x&&bp>=ap))issues.push("同素材同階藥劑效益倒掛："+a.id+"/"+b.id+"（"+key+"與價格）");
   }
  }
 }
 const rcp=(DB.recipes||[]).filter(r=>{const d=byId(r.result||r.output?.item_id);return d&&(d.type==="料理"||d.inventory_group==="食物"||!!d.food_subtype)});
 const cooks=new Map();
 for(const r of rcp){
   const d=byId(r.result||r.output?.item_id);
   const key=[d.tier,cookIngredientKey(r),effectKey(d)].join("~~");
   const prev=cooks.get(key);
   if(prev)issues.push("料理完全重複："+prev+"/"+r.id);
   else cooks.set(key,r.id);
 }
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,counts:{professional,cooking:rcp.length,professional_total:pro.length},changed_count:changes.length,changed_unique:new Set(changes.map(x=>x.id)).size,changes:changes.slice(0,70)};
}
DB.meta=DB.meta||{};
DB.meta.profession_recipe_differentiation_revision=REV;
DB.profession_recipe_differentiation_system={
 version:REV,release:RELEASE,scope:["鍛造","裁縫","藥劑","附魔","料理"],
 rules:["同階同材料同機制不允許完全重複","同材料純恢復藥劑不得出現高價弱效倒掛","商品名稱、核心材料、職能效果應互相對應","不改既有item ID、recipe ID、角色存檔及已學清單"],
 corrections:changes,save_compatible:true
};
globalThis.runProfessionRecipeDifferentiationAudit=audit;
DB.profession_recipe_differentiation_system.initial_audit=audit();
})();
