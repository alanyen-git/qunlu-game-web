/* 群陸旅誌：配方素材量與成品價值平衡 CURRENT-1.71.5
 * RECIPE-ECONOMY-BALANCE-1.2
 * 全面檢查鍛造、裁縫、藥劑、附魔與料理的素材量、素材種類、素材成本與成品價值比例。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.71.5";
const REV="RECIPE-ECONOMY-BALANCE-1.2";
const MIN_QTY={
  "藥劑":{F:2,E:2,D:3,C:3,B:4,A:5,S:6},
  "裁縫":{F:1,E:2,D:2,C:3,B:4,A:5,S:6},
  "鍛造":{F:1,E:2,D:3,C:3,B:4,A:5,S:6},
  "附魔":{F:2,E:2,D:2,C:3,B:4,A:5,S:6}
};
const VALUE_RATIO_CAP={
  "藥劑":{F:4,E:7,D:8,C:10,B:12,A:15,S:18},
  "裁縫":{F:6,E:8,D:9,C:10,B:12,A:15,S:18},
  "鍛造":{F:6,E:8,D:9,C:10,B:12,A:15,S:18},
  "附魔":{F:6,E:8,D:9,C:10,B:12,A:15,S:18}
};
const COOK_MIN={F:2,E:2,D:3,C:4,B:5,A:6,S:7};
const COOK_CAP={F:5,E:5,D:6,C:8,B:10,A:15,S:18};
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};

const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const changes=[];
const note=(id,kind,detail)=>changes.push({id,kind,detail});
const itemValue=id=>Number(byId(id)?.value??byId(id)?.price??0);
const mats=r=>[...(r?.base_materials||[]),...(r?.monster_components||[])];
const qtySum=a=>(a||[]).reduce((n,m)=>n+Math.max(0,Number(m?.qty||0)),0);
const matCost=r=>mats(r).reduce((n,m)=>n+itemValue(m.id)*Math.max(0,Number(m.qty||0)),0);
const uniqueIds=a=>new Set((a||[]).map(m=>m?.id).filter(Boolean));

const CANONICAL_LOW_POTIONS={
  "P7-03":[["MAT-HERB-04",1],["I-MINT",1]],
  "P31-002":[["I-HERB",1],["MAT-HERB-05",1]],
  "P31-003":[["MAT-HERB-04",1],["I-MINT",1]],
  "P31-010":[["MAT-HERB-04",1],["MAT-HERB-18",1]],
  "P-ANTIDOTE-F":[["MAT-HERB-02",1],["MAT-HERB-19",1]],
  "P-MANA-F":[["MAT-HERB-04",1],["MAT-HERB-01",1]],
  "PC-MANA-01":[["MAT-HERB-04",1],["MAT-HERB-01",1]],
  "P-COOL-F":[["MAT-HERB-19",1],["MAT-HERB-20",1]],
  "P-STAM-F":[["MAT-HERB-18",1],["MAT-HERB-05",1]],
  "PC-CLEAN-04":[["MAT-HERB-04",1],["I-MINT",1]],
  "PC-CLEAN-19":[["MAT-HERB-04",1],["I-MINT",1]]
};

function setBase(id,pairs,reason){
  const d=byId(id),r=d?.craft_recipe;
  if(!r)return;
  const valid=(pairs||[]).filter(([mid])=>byId(mid)).map(([mid,qty])=>({id:mid,qty}));
  if(!valid.length)return;
  r.base_materials=valid;
  r.monster_components=[];
  if(Array.isArray(d.monster_ingredients))d.monster_ingredients=[];
  note(id,"canonical",reason)
}
function potionSupport(d,ids){
  const t=`${d?.name||""} ${d?.consumable_group||""} ${JSON.stringify(d?.use||{})} ${JSON.stringify(d?.buff||{})}`;
  const rank=TIER_RANK[d?.tier]??0;
  const pick=(...list)=>list.find(id=>{const m=byId(id);return m&&!ids.has(id)&&(TIER_RANK[m.tier]??99)<=rank})||null;
  const name=String(d?.name||"");
  if(/體力|活力|耐力|迅步|疾風|機動/.test(name))return pick("MAT-HERB-18","MAT-HERB-06","MAT-HERB-21","I-MINT");
  if(/魔力|法力|施法|奧術|凝神/.test(name))return pick("MAT-HERB-04","MAT-HERB-01","MAT-HERB-16","I-MINT");
  if(/清醒|醒神|睡眠|sleep|守夜|精神|恐懼|魅惑|混亂|鎮/.test(t))return pick("I-MINT","MAT-HERB-04","MAT-HERB-19");
  if(/止血|外傷|生命|回復|治療/.test(t))return pick("MAT-HERB-05","I-HERB","I-MINT");
  if(/毒|麻痺|paralysis|poison|淨化|異常解除/.test(t))return pick("MAT-HERB-19","MAT-HERB-02","I-MINT");
  if(/明目|感官|眼|命中/.test(t))return pick("MAT-HERB-18","MAT-HERB-05","I-MINT");
  if(/魔力|法力|施法|奧術|智力|凝神/.test(t))return pick("MAT-HERB-04","MAT-HERB-01","MAT-HERB-16","I-MINT");
  if(/體力|活力|戰士|攻擊|力量|防護|耐力|迅步|疾風|機動/.test(t))return pick("MAT-HERB-18","MAT-HERB-06","MAT-HERB-21");
  if(/抗性|耐熱|抗寒|抗雷|護甲/.test(t))return pick("MAT-HERB-19","MAT-HERB-04","I-MINT");
  return pick("I-MINT","MAT-HERB-05","MAT-HERB-19")
}
function bestCostAnchor(r){
  return mats(r).filter(m=>byId(m.id)).sort((a,b)=>itemValue(b.id)-itemValue(a.id))[0]||null
}
function raiseQtyTo(d,min){
  const r=d.craft_recipe,total=qtySum(mats(r));
  if(total>=min)return;
  const a=bestCostAnchor(r);
  if(!a)return;
  const add=min-total;
  a.qty=Math.max(1,Number(a.qty||1))+add;
  note(d.id,"minimum_quantity",`+${add}`)
}
function raiseCostToRatio(d,cap){
  const r=d.craft_recipe,value=Number(d.value??d.price??0);
  if(!(value>0)||!(cap>0))return;
  let cost=matCost(r),guard=0;
  while(cost>0&&value/cost>cap&&guard++<24){
    const list=mats(r).filter(m=>byId(m.id)).sort((a,b)=>itemValue(b.id)-itemValue(a.id));
    const a=list.find(m=>Number(m.qty||1)<6)||list[0];
    if(!a)break;
    a.qty=Math.max(1,Number(a.qty||1))+1;
    cost=matCost(r);
    note(d.id,"value_balance",`成品/素材價值比調整至<=${cap}`)
  }
}

function normalizeProfessional(){
for(const [id,pairs] of Object.entries(CANONICAL_LOW_POTIONS)){
  setBase(id,pairs,"低階藥劑語意與基本素材量修正")
}

for(const d of DB.items||[]){
  const r=d?.craft_recipe,prof=r?.profession;
  if(!r||!MIN_QTY[prof])continue;

  if(prof==="藥劑"){
    const all=mats(r),ids=uniqueIds(all);
    const rawPreparation=/藥草$|繃帶|藥膏|軟膏/.test(String(d.name||""));
    if(!rawPreparation&&ids.size<2){
      const sid=potionSupport(d,ids);
      if(sid){
        r.base_materials=Array.isArray(r.base_materials)?r.base_materials:[];
        r.base_materials.push({id:sid,qty:1});
        note(d.id,"semantic_support",byId(sid)?.name||sid)
      }
    }
  }

  raiseQtyTo(d,MIN_QTY[prof][d.tier]??1);
  raiseCostToRatio(d,VALUE_RATIO_CAP[prof][d.tier]??18)
}

}

function cookingOutput(r){return byId(r?.result||r?.output?.item_id)}
function isCooking(r){
  const o=cookingOutput(r);
  return !!o&&(o.type==="料理"||o.inventory_group==="食物"||!!o.food_subtype)
}
function cookReq(r){
  const out={...(r?.requires||{})};
  for(const m of r?.ingredients||[])if(m?.id)out[m.id]=(out[m.id]||0)+Math.max(1,Number(m.qty||1));
  return out
}
function cookCost(req,r){
  let n=0;
  for(const [id,q] of Object.entries(req||{}))n+=itemValue(id)*Number(q||0);
  n+=Number(r?.requires_any_food||0)*3;
  return n
}
function normalizeCooking(){
for(const r of DB.recipes||[]){
  if(!isCooking(r))continue;
  const o=cookingOutput(r),tier=r.tier||o.tier||"F",req=cookReq(r);
  let total=Object.values(req).reduce((n,q)=>n+Number(q||0),0)+Number(r.requires_any_food||0);
  const min=COOK_MIN[tier]??2;
  if(total<min){
    const id=Object.keys(req).sort((a,b)=>itemValue(b)-itemValue(a))[0];
    if(id){
      req[id]=Number(req[id]||0)+(min-total);
      note(r.id,"cook_minimum_quantity",`+${min-total}`);
      total=min
    }
  }
  const cap=COOK_CAP[tier]??18,value=Number(o.value??o.price??0);
  let cost=cookCost(req,r),guard=0;
  while(cost>0&&value/cost>cap&&guard++<20){
    const id=Object.keys(req).sort((a,b)=>itemValue(b)-itemValue(a))[0];
    if(!id)break;
    req[id]=Number(req[id]||0)+1;
    cost=cookCost(req,r);
    note(r.id,"cook_value_balance",`成品/素材價值比調整至<=${cap}`)
  }
  r.requires=req;
  r.ingredients=[]
}

}

function audit(){
  const issues=[];
  let professional=0,cooking=0;

  for(const [id,pairs] of Object.entries(CANONICAL_LOW_POTIONS)){
    const d=byId(id),r=d?.craft_recipe;
    if(!r){issues.push(`${id}:標準低階藥劑配方缺失`);continue}
    const expected=JSON.stringify(pairs.map(([mid,qty])=>({id:mid,qty})));
    const actual=JSON.stringify(r.base_materials||[]);
    if(actual!==expected)issues.push(`${id}:標準低階藥劑配方遭覆寫`);
    if((r.monster_components||[]).length)issues.push(`${id}:低階標準藥劑不應含魔物素材`)
  }

  for(const d of DB.items||[]){
    const r=d?.craft_recipe,prof=r?.profession;
    if(!r||!MIN_QTY[prof])continue;
    professional++;
    const all=mats(r),total=qtySum(all),cost=matCost(r),value=Number(d.value??d.price??0),cap=VALUE_RATIO_CAP[prof][d.tier]??18;
    for(const m of all){
      const md=byId(m?.id);
      if(md&&(TIER_RANK[md.tier]??99)>(TIER_RANK[d.tier]??-1))issues.push(`${d.id}:素材階級高於成品 ${md.name||md.id}[${md.tier}]>${d.tier}`)
    }
    if(total<(MIN_QTY[prof][d.tier]??1))issues.push(`${d.id}:${prof}素材總量不足/${total}`);
    if(prof==="藥劑"&&!/藥草$|繃帶|藥膏|軟膏/.test(String(d.name||""))&&uniqueIds(all).size<2)issues.push(`${d.id}:藥劑素材種類不足`);
    if(!(cost>0))issues.push(`${d.id}:素材成本為0`);
    else if(value>0&&value/cost>cap+1e-9)issues.push(`${d.id}:成品/素材價值比過高 ${(value/cost).toFixed(2)}>${cap}`)
  }

  for(const r of DB.recipes||[]){
    if(!isCooking(r))continue;
    cooking++;
    const o=cookingOutput(r),tier=r.tier||o.tier||"F",req=cookReq(r);
    const total=Object.values(req).reduce((n,q)=>n+Number(q||0),0)+Number(r.requires_any_food||0);
    const cost=cookCost(req,r),value=Number(o.value??o.price??0),cap=COOK_CAP[tier]??18;
    for(const id of Object.keys(req)){
      const md=byId(id);
      if(md&&(TIER_RANK[md.tier]??99)>(TIER_RANK[tier]??-1))issues.push(`${r.id}:料理素材階級高於成品 ${md.name||md.id}[${md.tier}]>${tier}`)
    }
    if(total<(COOK_MIN[tier]??2))issues.push(`${r.id}:料理素材總量不足/${total}`);
    if(!(cost>0))issues.push(`${r.id}:料理素材成本為0`);
    else if(value>0&&value/cost>cap+1e-9)issues.push(`${r.id}:料理成品/素材價值比過高 ${(value/cost).toFixed(2)}>${cap}`)
  }

  return {
    revision:REV,release:RELEASE,pass:issues.length===0,issues,
    stats:{
      professional,
      cooking,
      changed_unique:new Set(changes.map(x=>x.id)).size,
      change_events:changes.length
    }
  }
}

function normalize(){
  const start=changes.length;
  normalizeProfessional();
  normalizeCooking();
  const result=audit();
  return {pass:result.pass,issues:[...result.issues],stats:{...result.stats},change_events:changes.length-start}
}

normalize();
const result=audit();
DB.meta=DB.meta||{};
DB.meta.recipe_economy_balance_revision=REV;
DB.recipe_economy_balance_system={
  version:REV,
  release:RELEASE,
  policy:{
    minimum_material_quantity:MIN_QTY,
    max_output_material_value_ratio:VALUE_RATIO_CAP,
    cooking_minimum_quantity:COOK_MIN,
    cooking_max_value_ratio:COOK_CAP,
    potion_min_distinct_ingredients:2,
    canonical_low_potion_lock:true,
    final_load_repair_supported:true,
    support_material_tier_gate:true,
    product_name_semantic_priority:true
  },
  canonical_low_potions:CANONICAL_LOW_POTIONS,
  changed_unique:new Set(changes.map(x=>x.id)).size,
  change_events:changes.length,
  changes,
  audit:result,
  save_compatible:true
};
globalThis.runRecipeEconomyBalanceAudit=audit;
globalThis.runRecipeEconomyBalanceNormalize=normalize;
})();