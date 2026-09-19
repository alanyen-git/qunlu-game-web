/* 群陸旅誌：裝備配方物量與語意平衡 CURRENT-1.71.6
 * EQUIPMENT-RECIPE-BALANCE-1.0
 * 檢查鍛造、裁縫、附魔的成品體積、結構素材、素材成本與名稱／材質語意。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.71.6";
const REV="EQUIPMENT-RECIPE-BALANCE-1.0";
const PROF={鍛造:"blacksmith",裁縫:"tailor",附魔:"enchanter"};
const TARGET={
  body:{F:2,E:3,D:3,C:4,B:5,A:6,S:7},
  shield:{F:2,E:3,D:3,C:4,B:5,A:6,S:7},
  twohand:{F:2,E:3,D:3,C:4,B:5,A:6,S:7},
  cape:{F:2,E:2,D:3,C:4,B:5,A:6,S:7}
};

const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const changes=[];
const note=(id,kind,detail)=>changes.push({id,kind,detail});
const itemValue=id=>Number(byId(id)?.value??byId(id)?.price??0);
const mats=d=>[...(d?.craft_recipe?.base_materials||[]),...(d?.craft_recipe?.monster_components||[])];
const qty=d=>mats(d).reduce((n,m)=>n+Math.max(0,Number(m?.qty||0)),0);
const cost=d=>mats(d).reduce((n,m)=>n+itemValue(m.id)*Math.max(0,Number(m?.qty||0)),0);

function setRecipe(id,profession,base,monster,reason){
  const d=byId(id);if(!d?.craft_recipe)return;
  d.craft_recipe.profession=profession;
  d.craft_recipe.requires_facility=PROF[profession];
  d.craft_recipe.base_materials=(base||[]).filter(([mid])=>byId(mid)).map(([mid,q])=>({id:mid,qty:q}));
  d.craft_recipe.monster_components=(monster||[]).filter(([mid])=>byId(mid)).map(([mid,q])=>({id:mid,qty:q}));
  if(Array.isArray(d.monster_upgrade_components))d.monster_upgrade_components=d.craft_recipe.monster_components.map(x=>({...x}));
  note(id,"semantic_override",reason);
}
function rename(id,name,reason){
  const d=byId(id);if(!d||d.name===name)return;
  d.name=name;note(id,"rename",reason);
}

function applySemanticOverrides(){
  rename("EQ-OAK-STAFF","松木法杖","F級名稱與可取得松木主材一致");
  setRecipe("EQ-OAK-STAFF","鍛造",[["MAT-CRAFT-03",2]],[],"基礎法杖不再由一份木材完成");

  rename("EQ7-W02","松木長槍","F級名稱與可取得松木主材一致");
  setRecipe("EQ7-W02","鍛造",[["MAT-CRAFT-03",1],["MAT-ORE-16",1]],[],"長槍改為木柄＋青銅槍頭");
  setRecipe("EQ7-W03","鍛造",[["MAT-CRAFT-03",1],["MAT-ORE-16",1]],[],"硬木戰錘補回木材結構");
  setRecipe("EQ10-SH01","鍛造",[["MAT-CRAFT-03",2],["MAT-CRAFT-12",1]],[],"木盾改為木板結構＋皮革束帶");
  setRecipe("EQ-PADDED-COAT","裁縫",[["MAT-CRAFT-10",2],["MAT-CRAFT-12",1]],[],"補強旅行甲改由裁縫，以厚布＋皮革製作");

  setRecipe("EQ10-B07","裁縫",[["MAT31-CRAFT-12",2],["MAT-CRAFT-09",1]],[["DROP-EL-16",1]],"德魯伊藤蔓甲移除精鋼模板，改用纖維、絲線與荊棘魔藤");
  setRecipe("EQ10-L01","裁縫",[["MAT-CRAFT-12",1]],[],"冒險腰帶依皮革設定改由裁縫");
  setRecipe("EQ10-L03","裁縫",[["MAT-CRAFT-13",2],["MAT-GEM-13",1]],[["DROP-SG-12",1]],"盜賊腰帶以皮革為結構，保留魔力媒材");
  setRecipe("EQ10-L02","裁縫",[["MAT-CRAFT-13",2],["MAT-CRAFT-09",1],["MAT-GEM-08",1]],[["DROP-SG-05",1]],"巨力腰帶以皮革為結構，保留高階媒材");
  setRecipe("EQ10-N01","鍛造",[["MAT-CRAFT-03",1],["MAT-ORE-25",1]],[],"木石護身符改用木材＋石材");

  setRecipe("EQ31-009","鍛造",[["MAT31-CRAFT-04",1],["MAT-ORE-17",1],["MAT-CRAFT-12",1]],[],"赤牙獵矛補回硬木槍身");
  setRecipe("EQ31-025","鍛造",[["MAT31-CRAFT-04",2],["MAT-CRAFT-13",1]],[],"西境獵衛盾依硬木設定改用木料＋皮革束帶");
  setRecipe("EQ31-032","裁縫",[["MAT-CRAFT-13",3],["MAT-CRAFT-08",1]],[],"西境硬皮短甲改由裁縫並使用硬化皮革");
  setRecipe("EQ31-041","裁縫",[["MAT-CRAFT-12",2]],[],"柳橋皮帽改用皮革");
  setRecipe("EQ31-044","裁縫",[["MAT-CRAFT-13",2],["MAT-CRAFT-08",1]],[],"銀岸決鬥帽依硬化皮革設定改由裁縫");
  setRecipe("EQ31-045","裁縫",[["MAT-CRAFT-13",2],["MAT-CRAFT-08",1]],[],"赤牙獵首帶依獸皮設定改由裁縫");
  setRecipe("EQ31-039","裁縫",[["MAT31-CRAFT-12",2],["MAT-CRAFT-09",2]],[],"瑟露維亞林紋甲補入森海纖維，不再只有蜘蛛絲線");
  setRecipe("EQ31-034","裁縫",[["MAT-CRAFT-08",2],["MAT-CRAFT-10",1]],[],"銀岸旅裝依絲布設定改用絲線＋麻布");
  setRecipe("EQ31-067","裁縫",[["MAT-CRAFT-07",2],["MAT-CRAFT-08",1]],[],"銀岸旅行披肩依羊毛設定補回羊毛");

  setRecipe("EQ-BONE-WAND","鍛造",[["MAT-CRAFT-02",1],["MAT-CRAFT-16",1],["MAT-GEM-06",1]],[],"骨木咒杖補回骨材、木材與法術媒材");
  setRecipe("EQ31-076","附魔",[["MAT-CRAFT-16",1],["MAT-GEM-06",1]],[],"赤牙骨墜補回骨材，保留白水晶媒材");
}

function category(d){
  if(d?.type==="盔甲")return "body";
  if(d?.offhand_profile?.kind==="shield"||/盾牌/.test(String(d?.catalog_subcategory||"")))return "shield";
  if(d?.type==="主武器"&&Number(d?.weapon_profile?.hands||1)>=2)return "twohand";
  if(d?.type==="披風")return "cape";
  return null;
}
function anchor(d){
  const base=d?.craft_recipe?.base_materials||[];
  const name=m=>String(byId(m.id)?.name||"");
  if(d?.craft_recipe?.profession==="裁縫")return base.find(m=>/布|絲|線|毛|皮|革|纖|繩|帆/.test(name(m)))||base[0]||null;
  if(/木/.test(String(d?.material||"")+" "+String(d?.name||"")))return base.find(m=>/木|板|枝/.test(name(m)))||base[0]||null;
  return base.find(m=>/錠|礦|木|板|布|皮|革/.test(name(m)))||base[0]||null;
}
function fallbackSupport(d,ids){
  const pick=(...list)=>list.find(id=>byId(id)&&!ids.has(id))||null;
  const c=category(d),n=String(d?.name||"");
  if(d?.craft_recipe?.profession==="裁縫")return pick(d.tier==="F"?"MAT-CRAFT-06":"MAT-CRAFT-08","MAT-CRAFT-12","MAT-CRAFT-09");
  if(c==="shield"||c==="body")return pick("MAT-CRAFT-13","MAT-CRAFT-12","MAT-ORE-26");
  if(c==="twohand"&&/槍|戟/.test(n))return pick("MAT-CRAFT-04","MAT-CRAFT-02","MAT-CRAFT-03","MAT-ORE-26");
  if(c==="twohand")return pick("MAT-ORE-26","MAT-CRAFT-13","MAT-CRAFT-12");
  return null;
}

function normalizePhysical(){
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r||!PROF[r.profession])continue;
    const c=category(d),target=c?(TARGET[c]?.[d.tier]??1):1;
    let total=qty(d);
    while(total<target){
      const a=anchor(d),out=Number(d.value??d.price??0);
      if(a){
        const next=cost(d)+itemValue(a.id);
        if(!(out>0)||next<=out){
          a.qty=Math.max(1,Number(a.qty||1))+1;
          total++;
          note(d.id,"physical_quantity",c+" "+(total-1)+"→"+total);
          continue;
        }
      }
      const ids=new Set(mats(d).map(m=>m.id)),sid=fallbackSupport(d,ids);
      if(!sid)break;
      r.base_materials=Array.isArray(r.base_materials)?r.base_materials:[];
      r.base_materials.push({id:sid,qty:1});
      total++;
      note(d.id,"physical_support",byId(sid)?.name||sid);
    }
  }
}

function audit(){
  const issues=[];
  let equipment=0;
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r||!PROF[r.profession])continue;
    equipment++;
    const names=mats(d).map(m=>String(byId(m.id)?.name||"")).join("、");
    const material=String(d.material||"");
    const c=category(d),target=c?(TARGET[c]?.[d.tier]??1):1,total=qty(d);
    if(c&&total<target)issues.push(d.id+":"+c+"素材總量不足 "+total+"<"+target);
    if(cost(d)>Number(d.value??d.price??0)&&Number(d.value??d.price??0)>0)issues.push(d.id+":素材成本高於成品價值 "+cost(d)+">"+Number(d.value??d.price??0));
    if(/木材|硬木/.test(material)&&!/木|板|枝/.test(names))issues.push(d.id+":木材設定但配方無木材");
    if(/皮革|獸皮|毛皮/.test(material)&&!/皮|革|毛/.test(names))issues.push(d.id+":皮革設定但配方無皮革");
    if(/自然素材/.test(material)&&!/木|枝|樹|藤|纖|皮|革|絲/.test(names))issues.push(d.id+":自然素材成品缺自然結構素材");
    if(/骨/.test(String(d.name||""))&&!/骨/.test(names))issues.push(d.id+":名稱含骨但配方無骨材");
  }
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{equipment,changed_unique:new Set(changes.map(x=>x.id)).size,change_events:changes.length}};
}

function normalize(){
  const start=changes.length;
  applySemanticOverrides();
  normalizePhysical();
  const result=audit();
  return {pass:result.pass,issues:[...result.issues],stats:{...result.stats},change_events:changes.length-start};
}

normalize();
const result=audit();
DB.meta=DB.meta||{};
DB.meta.equipment_recipe_balance_revision=REV;
DB.equipment_recipe_balance_system={
  version:REV,release:RELEASE,
  target_quantity:TARGET,
  rules:[
    "大型裝備依成品體積設定最低素材量；身甲、盾牌、雙手武器與披風不得只沿用通用一單位模板。",
    "提高素材量時優先增加既有結構主材；若主材成本會高於成品價值，才補入符合部位用途的次要結構素材。",
    "材質標示為木材、硬木、皮革、獸皮、毛皮、自然素材或名稱明示骨材時，配方必須存在對應結構素材。",
    "不為追求數量任意加入不相關魔物素材；特殊魔物素材仍由既有語意規則治理。"
  ],
  changes,
  audit:result,
  save_compatible:true
};
globalThis.runEquipmentRecipeBalanceNormalize=normalize;
globalThis.runEquipmentRecipeBalanceAudit=audit;
})();