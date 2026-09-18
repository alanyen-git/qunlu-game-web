/* 群陸旅誌：全配方素材語意與層級完整性 CURRENT-1.69.6
 * CRAFTING-RECIPE-SEMANTIC-2.0
 * 在1.69.5語意稽核之上，治理高階模板素材、素材高於成品、料理空配方與高階成品低階素材失真。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.6";
const REV="CRAFTING-RECIPE-SEMANTIC-2.0";
const RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const MIN_CORE={F:0,E:0,D:1,C:1,B:3,A:4,S:5};
const byId=id=>(DB.items||[]).find(x=>x?.id===id)||null;
const changes=[];
const mark=(id,kind,detail)=>changes.push({id,kind,detail});
const pairs=a=>(a||[]).map(([id,qty=1])=>({id,qty}));
const item=id=>byId(id);
const craft=id=>item(id)?.craft_recipe||null;

function setBase(id,arr,reason){
  const r=craft(id);if(!r)return;
  r.base_materials=pairs(arr);if(reason)mark(id,"base_materials",reason);
}
function ensureBase(id,arr,reason){
  const r=craft(id);if(!r)return;
  const map=new Map((r.base_materials||[]).map(m=>[m.id,{id:m.id,qty:Math.max(1,Number(m.qty||1))}]));
  let changed=false;
  for(const [mid,qty=1] of arr||[])if(byId(mid)&&!map.has(mid)){map.set(mid,{id:mid,qty});changed=true}
  if(changed){r.base_materials=[...map.values()];if(reason)mark(id,"base_anchor",reason)}
}
function setMonster(id,arr,reason){
  const r=craft(id);if(!r)return;
  r.monster_components=pairs(arr);
  const d=item(id);if(d&&Array.isArray(d.monster_upgrade_components))d.monster_upgrade_components=pairs(arr);
  if(reason)mark(id,"monster_components",reason);
}
function removeMonster(id,mid,reason){
  const r=craft(id);if(!r)return;
  const before=(r.monster_components||[]).length;
  r.monster_components=(r.monster_components||[]).filter(m=>m.id!==mid);
  const d=item(id);if(d&&Array.isArray(d.monster_upgrade_components))d.monster_upgrade_components=d.monster_upgrade_components.filter(m=>m.id!==mid);
  if(before!==r.monster_components.length&&reason)mark(id,"monster_template_removed",reason);
}
function ensureMonster(id,arr,reason){
  const r=craft(id);if(!r)return;
  const map=new Map((r.monster_components||[]).map(m=>[m.id,{id:m.id,qty:Math.max(1,Number(m.qty||1))}]));
  let changed=false;
  for(const [mid,qty=1] of arr||[])if(byId(mid)&&!map.has(mid)){map.set(mid,{id:mid,qty});changed=true}
  if(changed){r.monster_components=[...map.values()];if(reason)mark(id,"monster_anchor",reason)}
}
function rename(id,name,reason){
  const d=item(id);if(!d||d.name===name)return;
  d.name=name;mark(id,"rename",reason||name);
}
function setProfession(id,profession,facility,reason){
  const r=craft(id);if(!r)return;
  if(r.profession!==profession||r.requires_facility!==facility){
    r.profession=profession;r.requires_facility=facility;mark(id,"profession",reason||profession);
  }
}
function setWeaponGroup(id,group){
  const d=item(id);if(!d)return;
  d.weapon_profile=d.weapon_profile||{};
  if(d.weapon_profile.group!==group){d.weapon_profile.group=group;mark(id,"weapon_group",group)}
}
const recipeRow=id=>(DB.recipes||[]).find(r=>r?.id===id)||null;
function cookReq(r){
  const req={...(r?.requires||{})};
  for(const m of r?.ingredients||[])if(m?.item_id)req[m.item_id]=(req[m.item_id]||0)+Math.max(1,Number(m.qty||1));
  return req;
}
function setCook(id,req,reason){
  const r=recipeRow(id);if(!r)return;
  r.requires={...req};r.ingredients=[];r.profession="料理";mark(id,"cooking_recipe",reason);
}
function ensureCook(id,add,reason){
  const r=recipeRow(id);if(!r)return;
  const req=cookReq(r);let changed=false;
  for(const [mid,qty] of Object.entries(add||{}))if(byId(mid)&&!(mid in req)){req[mid]=qty;changed=true}
  if(changed){r.requires=req;r.ingredients=[];r.profession="料理";mark(id,"cooking_anchor",reason)}
}

// 材質名稱與實際主材不符。
rename("EQ-IRON-SWORD","青銅旅行劍","F級配方實際以青銅製作，不再誤稱黑鐵");
rename("EQ-IRON-DAGGER","青銅短刃","F級配方實際以青銅製作，不再誤稱黑鐵");
setBase("EQ-STEEL-SWORD",[["MAT-ORE-18",3],["MAT-ORE-26",1]],"精鋼長劍改回精鋼錠主材");
rename("EQ-SHORT-BOW","橡木短弓","E級木弓不再誤稱精鋼短弓");
setBase("EQ-RUNE-SPEAR2",[["MAT-ORE-18",2],["MAT-SCR-10",1],["MAT-ORE-26",1]],"符文精鋼槍使用精鋼與符文石");
setProfession("EQ7-G04","鍛造","blacksmith","精鋼護腕改由鍛造製作");
setBase("EQ7-G04",[["MAT-ORE-18",1],["MAT-CRAFT-13",1]],"精鋼護腕補回精鋼主材");
setMonster("EQ7-G04",[],"移除精鋼護腕的毛皮模板");
rename("EQ7-S05","巨魔皮輕靴","配方以硬化皮革、蜘蛛絲與巨魔厚皮製作");
rename("EQ7-C04","晶絲披風","配方以寶石與絲材製作，不再誤稱秘銀絲");

// 高階裝備模板。
setBase("EQ-RUNE-SWORD",[["MAT-ORE-20",3],["MAT-ORE-26",1],["MAT-SCR-10",1]],"秘紋劍以精金與符文石製作");
setMonster("EQ-RUNE-SWORD",[],"移除獨角獸角／奇美拉角模板");
setBase("EQ-OATH-SWORD",[["MAT-ORE-20",3],["MAT-ORE-26",1],["MAT-GEM-12",1]],"守誓劍以精金與星辰石作媒介");
setMonster("EQ-OATH-SWORD",[],"移除獨角獸角／奇美拉角模板");
setBase("EQ-ASTRAL-STAFF",[["MAT-CRAFT-05",2],["MAT-GEM-12",1]],"星導杖改用古樹木材與星辰石");
setMonster("EQ-ASTRAL-STAFF",[],"移除武器模板魔物素材");
setWeaponGroup("EQ-ASTRAL-STAFF","法杖");
setMonster("EQ-FINE-KATANA",[],"名匠武士刀移除獨角獸角／奇美拉角模板");
setBase("EQ-MITHRIL-SWORD",[["MAT-ORE-19",3],["MAT-GEM-12",1],["MAT-ORE-26",1]],"秘銀長劍使用秘銀，星辰石作高階媒介");
setMonster("EQ-MITHRIL-SWORD",[],"移除古龍牙／龍骨髓模板");
setBase("EQ-MITHRIL-STAFF",[["MAT-CRAFT-05",2],["MAT-ORE-19",1],["MAT-GEM-12",1]],"秘銀法杖使用古樹木、秘銀與星辰石");
setMonster("EQ-MITHRIL-STAFF",[],"移除古龍牙／龍骨髓模板");
setBase("EQ-STAR-SABER",[["MAT-ORE-22",3],["MAT-ORE-28",1],["MAT-ORE-26",1]],"星銀決鬥劍改回星銀主材");
setMonster("EQ-STAR-SABER",[],"移除古龍／獨角獸通用模板");
setBase("EQ-TIME-STAFF",[["MAT-CRAFT-05",1],["MAT-GEM-12",1],["MAT-ORE-28",1]],"時序杖使用古樹木、星辰石與星塵");
setMonster("EQ-TIME-STAFF",[],"移除獨角獸／奇美拉模板");
setWeaponGroup("EQ-TIME-STAFF","法杖");
setMonster("EQ-ARCHMAGE-STAFF",[],"大魔導杖移除古龍牙／龍骨髓模板");
setMonster("EQ-HEAVEN-SPEAR",[],"天槍移除古龍牙／龍骨髓模板");
setMonster("EQ-ASTRAL-BLADE",[],"星界刃移除古龍／獨角獸模板");
setMonster("EQ7-W21",[],"精金長劍移除獨角獸／奇美拉模板");
setBase("EQ7-W22",[["MAT-ORE-21",3],["MAT-ORE-26",1]],"殞鐵戰鎚改用殞鐵錠");
setMonster("EQ7-W22",[],"移除獨角獸／奇美拉模板");
rename("EQ7-W23","受封印古樹戰弓","B級戰弓主材為古樹木，不再誤稱A級星銀");
setMonster("EQ7-W24",[["DROP-BE-20",1]],"生命法杖保留獨角獸角，移除奇美拉角");
rename("EQ7-W26","受封印星銀劍","A級武器依星銀主材命名");
setBase("EQ7-W26",[["MAT-ORE-22",3],["MAT-ORE-26",1]],"星銀劍使用星銀錠");
setMonster("EQ7-W26",[],"移除古龍模板");
rename("EQ7-W27","受封印星銀法杖","A級法杖加入星銀構件");
setBase("EQ7-W27",[["MAT-CRAFT-05",2],["MAT-GEM-12",1],["MAT-ORE-22",1]],"星銀法杖使用古樹木、星辰石與星銀");
setMonster("EQ7-W27",[],"移除古龍模板");
setMonster("EQ7-W29",[],"虛界短刃移除古龍模板");
setBase("EQ7-W32",[["MAT-CRAFT-05",2],["MAT-GEM-12",1],["MAT-ORE-28",1]],"夜星法杖使用古樹木、星辰石與星塵");
setMonster("EQ7-W32",[["DROP-DR-43",1]],"夜星法杖改用幽靈龍魂晶作A級夜系媒介");
setMonster("EQ7-W33",[["DROP-BE-21",1],["DROP-BE-24",1],["DROP-GG-36",1]],"暴風神弓加入A級風暴核心素材");
ensureMonster("EQ7-W34",[["DROP-DR-15",1]],"龍牙刃補入龍牙");
rename("EQ7-A10","受封印精金戰甲","B級戰甲依精金主材命名");
setMonster("EQ7-A10",[],"移除紅藍龍鱗通用模板");
setMonster("EQ10-N05",[["DROP-DR-15",1]],"龍牙項鍊改用龍牙");
setMonster("EQ10-C04",[["DROP-DR-18",1]],"龍翼披風改用龍翼膜");
setMonster("EQ10-M02",[],"傳承徽章移除古龍牙／龍晶模板");

// 素材不得高於成品。
setBase("EQ31-015",[["MAT-CRAFT-02",1],["MAT-GEM-13",1]],"D級藍塔術杖改用E級橡木＋D級魔力水晶");
setBase("EQ31-073",[["MAT-ORE-16",1],["MAT-HERB-01",1]],"F級扣環改用青銅與F級月光草");
setBase("EQ31-074",[["MAT-ORE-16",1],["MAT-HERB-01",1]],"F級護符改用青銅與F級月光草");
setBase("P31-013",[["MAT31-HERB-19",1]],"E級抗雷藥劑改用E級風鬃風草");
setBase("P31-020",[["MAT-HERB-07",1]],"E級術流藥劑改用E級幽光菇");
setBase("P31-023",[["MAT-HERB-22",1],["MAT-HERB-14",1]],"D級解咒藥劑改用黃金花＋巫術草");
setBase("P31-024",[["MAT-HERB-21",1],["MAT-HERB-18",1]],"D級破默藥劑改用四葉草＋迷迭香");
setBase("P31-029",[["MAT-HERB-22",1],["MAT-ORE-27",1]],"D級護界藥劑改用黃金花＋魔法粉塵");
setBase("P31-031",[["MAT-HERB-21",1],["MAT-HERB-18",1]],"D級銳眼藥劑改用四葉草＋迷迭香");

const POTION_ANCHORS={
"P-GUARD-D":[["MAT-HERB-11",1]],"P-CRIT-D":[["MAT-HERB-21",1]],"P-RESIST-D":[["MAT-HERB-21",1]],
"P7-13":[["MAT-HERB-16",1]],"P7-14":[["MAT-HERB-06",1]],"P7-15":[["MAT-HERB-16",1]],"P7-18":[["MAT-HERB-11",1]],
"PC-LIFE-09":[["MAT-HERB-13",1]],"PC-LIFE-15":[["MAT-HERB-13",1]],
"PC-ATTR-02":[["MAT-HERB-06",1]],"PC-ATTR-06":[["MAT-HERB-11",1]],"PC-ATTR-10":[["MAT-HERB-21",1]],
"PC-ATTR-13":[["MAT-HERB-06",1]],"PC-ATTR-14":[["MAT-HERB-21",1]],"PC-ATTR-15":[["MAT-HERB-16",1]],
"PC-RES-11":[["MAT-HERB-11",1]],"PC-RES-12":[["MAT-ORE-27",1]],"PC-RES-15":[["MAT-HERB-16",1]],
"PC-RES-16":[["MAT-HERB-11",1]],"PC-RES-22":[["MAT-HERB-06",1]],"PC-RES-23":[["MAT-HERB-06",1]],
"PC-CLEAN-11":[["MAT-HERB-22",1]],"PC-CLEAN-12":[["MAT-HERB-22",1]],"PC-CLEAN-14":[["MAT-FOOD-16",1]],
"PC-CLEAN-16":[["MAT-HERB-22",1]],"P31-025":[["MAT-HERB-22",1]],"P31-026":[["MAT-HERB-09",1]]
};
for(const [id,arr] of Object.entries(POTION_ANCHORS))ensureBase(id,arr,"補足成品層級與效果對應核心素材");

// 霜巨人冰鬚模板逐品項替換。
const FROST_SWAPS={
"P7-20":{base:[["MAT-GEM-12",1]]},"PC-LIFE-14":{monster:[["DROP-BE-20",1]]},"PC-LIFE-16":{monster:[["DROP-BE-27",1]]},
"PC-MANA-12":{base:[["MAT-GEM-12",1]]},"PC-MANA-14":{base:[["MAT-GEM-12",1]]},
"PC-ATTR-18":{monster:[["DROP-DR-21",1]]},"PC-ATTR-19":{monster:[["DROP-DR-20",1]]},
"PC-RES-10":{base:[["MAT-GEM-12",1]]},"PC-RES-13":{base:[["MAT-GEM-08",1],["MAT-GEM-12",1]]},
"PC-RES-21":{monster:[["DROP-DR-08",1]]},"PC-CLEAN-17":{monster:[["DROP-BE-20",1]]},
"PC-CLEAN-22":{monster:[["DROP-EL-12",1]]},"PC-SPEC-09":{monster:[["DROP-UN-17",1]]},
"PC-SPEC-10":{monster:[["DROP-BE-29",1]]},"PC-SPEC-11":{monster:[["DROP-UN-17",1]]},
"PC-SPEC-12":{monster:[["DROP-DR-21",1]]},"PC-SPEC-15":{base:[["MAT-HERB-12",1]]},
"PC-SPEC-17":{monster:[["DROP-DE-06",1]]},"PC-SPEC-23":{monster:[["DROP-BE-29",1]]}
};
for(const [id,fix] of Object.entries(FROST_SWAPS)){
  removeMonster(id,"DROP-GG-24","移除霜巨人冰鬚通用模板");
  if(fix.base)ensureBase(id,fix.base,"改用符合品項主題的B級核心素材");
  if(fix.monster)ensureMonster(id,fix.monster,"改用符合品項主題的B級魔物素材");
}

removeMonster("PC-MANA-06","DROP-UN-22","完全魔力藥水移除死靈粉塵模板");
ensureBase("PC-MANA-06",[["MAT-GEM-12",1]],"完全魔力藥水改用星辰石");
removeMonster("PC-ATTR-20","DROP-UN-22","龍智藥水移除死靈粉塵模板");
ensureMonster("PC-ATTR-20",[["DROP-DR-20",1]],"龍智藥水改用龍鬚");
removeMonster("PC-SPEC-19","DROP-BE-22","古龍精華移除獨角獸血模板");
ensureMonster("PC-SPEC-19",[["DROP-DR-22",1]],"古龍精華改用古龍血");
setMonster("PC-SPEC-20",[["DROP-EL-12",1]],"古樹精華改用古樹守衛素材");
ensureBase("PC-SPEC-20",[["MAT-HERB-12",1]],"古樹精華加入古樹嫩葉");
setMonster("PC-SPEC-21",[],"時緩藥水移除獨角獸血／金龍鱗模板");
ensureBase("PC-SPEC-21",[["MAT-GEM-12",1],["MAT-ORE-28",1]],"時緩藥水改用星辰石與星塵");

// 烈焰椒模板。
setBase("PC-THROW-05",[["MAT-CRAFT-19",1],["MAT-HERB-23",1]],"暴風雪瓶改用冰霜薄荷");
setMonster("PC-THROW-05",[["DROP-BE-03",1]],"暴風雪瓶加入冬狼冰牙");
setBase("PC-THROW-07",[["MAT-CRAFT-19",1],["MAT-HERB-25",1]],"雷鳴瓶改用雷鳴草");
setBase("PC-THROW-09",[["MAT-CRAFT-19",1]],"強酸瓶移除烈焰椒");
setBase("PC-THROW-10",[["MAT-CRAFT-19",1],["MAT-HERB-09",1]],"毒煙瓶改用毒傘菇");
setBase("PC-THROW-11",[["MAT-CRAFT-19",1],["MAT-HERB-09",1]],"致命毒煙瓶改用毒傘菇");
setBase("PC-THROW-12",[["MAT-CRAFT-19",1],["MAT-HERB-10",1]],"催眠粉瓶改用曼陀花");
setMonster("PC-THROW-12",[],"移除不相關模板");
setBase("PC-THROW-13",[["MAT-CRAFT-19",1],["MAT-HERB-14",1]],"混亂煙瓶改用巫術草");
setMonster("PC-THROW-13",[],"移除不相關模板");
setBase("PC-THROW-15",[["MAT-CRAFT-19",1],["MAT-HERB-25",1]],"麻痺粉改用雷鳴草");
setMonster("PC-THROW-15",[],"移除不相關模板");
setBase("PC-THROW-18",[["MAT-CRAFT-19",1],["MAT-HERB-22",1],["MAT-HERB-27",1]],"聖光炸彈改用光系草藥");
setBase("PC-OIL-05",[["MAT-CRAFT-19",1],["MAT-HERB-22",1]],"聖油改用黃金花");
setBase("PC-OIL-06",[["MAT-CRAFT-19",1],["MAT-HERB-26",1]],"暗蝕塗油改用暗影苔");
setBase("PC-OIL-07",[["MAT-CRAFT-19",1],["MAT-HERB-26",1]],"吸血塗油改用暗影苔");
setMonster("PC-OIL-07",[["DROP-UN-14",1]],"吸血塗油加入吸血鬼灰燼");
setBase("PC-OIL-08",[["MAT-CRAFT-19",1],["MAT-ORE-27",1]],"破甲塗油改用魔法粉塵");
setBase("PC-OIL-09",[["MAT-CRAFT-19",1],["MAT-HERB-14",1],["MAT-ORE-27",1]],"破魔塗油改用巫術草與魔法粉塵");
setBase("PC-OIL-10",[["MAT-CRAFT-19",1],["MAT-HERB-22",1]],"神聖之油改用黃金花");

// 料理語意與層級。
setCook("R-STEW",{"I-WATER":1,"I-ROOT":1,"I-MUSHROOM":1},"雜燴湯補回水、甜根與食用菇");
ensureCook("R-BERRY-POR",{"MAT-FOOD-03":1},"莓果麥粥補大麥粉");
setCook("R7-20",{"MAT-FOOD-11":1,"I-BERRY":1,"I-HERB":1},"鷹眼獵物盤改用獸肉而非鮮魚");
for(const r of DB.recipes||[]){
  const out=byId(r?.result||r?.output?.item_id);
  if(!out||!(out.type==="料理"||out.inventory_group==="食物"||out.food_subtype))continue;
  const n=String(out.name||r.name||"");
  if(/茶|湯|燉|粥|飲/.test(n)&&!Object.prototype.hasOwnProperty.call(cookReq(r),"I-WATER"))ensureCook(r.id,{"I-WATER":1},"液態料理補水");
}
const COOK_ANCHORS={
"R-IRONSTEW":{"MAT-FOOD-11":1},"R-SPICED":{"MAT-FOOD-20":1},"R-ELF":{"MAT31-FOOD-15":1},
"R-MANA":{"MAT-HERB-16":1},"R-WAR":{"MAT31-FOOD-20":1},"R-SILVER":{"MAT-HERB-13":1},
"R-MINER-PLATE":{"MAT-FOOD-11":1},"R-RANGER-POT":{"MAT-FOOD-11":1},"R-SPELL-TEA":{"MAT-HERB-16":1},
"R-GUARD-BROTH":{"MAT-FOOD-11":1},"R-HUNTER-FEAST":{"MAT-FOOD-11":1},"R-MAGE-DESSERT":{"MAT-FOOD-16":1},
"R-GOLDEN-STEW":{"MAT-FOOD-06":1},"R7-11":{"MAT31-FOOD-20":1},"R7-12":{"MAT31-FOOD-15":1},
"R7-14":{"MAT31-FOOD-20":1},"R7-15":{"MAT31-HERB-07":1},"R7-16":{"MAT31-FOOD-13":1},
"R7-17":{"MAT-HERB-16":1},"R7-18":{"MAT-FOOD-15":1},"R7-19":{"MAT-FOOD-20":1},
"R7-21":{"MAT-HERB-16":1},"R7-24":{"MAT-FOOD-14":1,"MAT-HERB-13":1},
"R7-25":{"MAT-FOOD-12":1,"MAT-HERB-24":1},"R7-26":{"MAT-FOOD-19":1}
};
for(const [id,add] of Object.entries(COOK_ANCHORS))ensureCook(id,add,"補入符合成品層級與名稱的核心食材");

function maxMaterialRank(arr){
  let max=-1;
  for(const m of arr||[]){const d=byId(m.id);if(d&&RANK[d.tier]>max)max=RANK[d.tier]}
  return max;
}
function audit(){
  const issues=[];
  const add=(id,name,code,detail)=>issues.push({id,name,code,detail});
  for(const d of DB.items||[]){
    const r=d?.craft_recipe;if(!r)continue;
    const mats=[...(r.base_materials||[]),...(r.monster_components||[])];
    if(!mats.length)add(d.id,d.name,"EMPTY_RECIPE","製作素材為空");
    for(const m of mats){
      const md=byId(m?.id);
      if(!md){add(d.id,d.name,"MISSING_MATERIAL",String(m?.id||"空白"));continue}
      if(!(Number(m.qty)>0))add(d.id,d.name,"INVALID_QTY",md.name);
      if(RANK[md.tier]>RANK[d.tier])add(d.id,d.name,"MATERIAL_ABOVE_PRODUCT",md.name+"["+md.tier+"] > "+d.tier);
    }
    const max=maxMaterialRank(mats),need=MIN_CORE[d.tier]??0;
    if(max<need)add(d.id,d.name,"CORE_TIER_TOO_LOW","最高素材階級不足");
    const materialNames=mats.map(m=>byId(m.id)?.name||"").join("、");
    if(r.profession==="鍛造")for(const word of ["青銅","黑鐵","精鋼","秘銀","精金","殞鐵","星銀","恆金"]){
      if(String(d.name).includes(word)&&!materialNames.includes(word))add(d.id,d.name,"NAMED_MATERIAL_MISMATCH",word+"成品未使用"+word+"素材");
    }
    if(/龍牙/.test(String(d.name))&&!/龍牙/.test(materialNames))add(d.id,d.name,"SIGNATURE_MATERIAL_MISMATCH","龍牙成品缺龍牙");
    if(/龍翼/.test(String(d.name))&&!/龍翼/.test(materialNames))add(d.id,d.name,"SIGNATURE_MATERIAL_MISMATCH","龍翼成品缺龍翼素材");
    if((r.monster_components||[]).some(m=>m.id==="DROP-GG-24")&&!/冰|霜|巨人/.test(String(d.name)))add(d.id,d.name,"FROST_GIANT_TEMPLATE","非冰霜主題仍含霜巨人冰鬚");
    if((r.base_materials||[]).some(m=>m.id==="MAT-HERB-24")&&!/火|炎|燃|烈焰|龍息|耐熱|戰意/.test(String(d.name)))add(d.id,d.name,"FIRE_PEPPER_TEMPLATE","非火系配方仍含烈焰椒模板");
  }
  for(const r of DB.recipes||[]){
    const out=byId(r?.result||r?.output?.item_id);
    if(!out||!(out.type==="料理"||out.inventory_group==="食物"||out.food_subtype))continue;
    const req=cookReq(r),mats=Object.keys(req).map(id=>({id,qty:req[id]})),names=mats.map(m=>byId(m.id)?.name||m.id).join("、"),n=String(out.name||r.name||"");
    if(!mats.length)add(r.id,n,"COOK_EMPTY","料理素材為空");
    for(const m of mats){
      const md=byId(m.id);
      if(!md)add(r.id,n,"COOK_MISSING_MATERIAL",m.id);
      else if(RANK[md.tier]>RANK[out.tier])add(r.id,n,"COOK_MATERIAL_ABOVE_PRODUCT",md.name+"["+md.tier+"] > "+out.tier);
    }
    if(maxMaterialRank(mats)<(MIN_CORE[out.tier]??0))add(r.id,n,"COOK_CORE_TIER_TOO_LOW","高階料理缺少足階核心食材");
    if(/麥/.test(n)&&!/麥|粉/.test(names))add(r.id,n,"COOK_NAME_GRAIN","名稱含麥但素材無穀物／麵粉");
    if(/菇/.test(n)&&!/菇/.test(names))add(r.id,n,"COOK_NAME_MUSHROOM","名稱含菇但素材無菇");
    if(/莓/.test(n)&&!/莓/.test(names))add(r.id,n,"COOK_NAME_BERRY","名稱含莓但素材無莓");
    if(/蜜/.test(n)&&!/蜜/.test(names))add(r.id,n,"COOK_NAME_HONEY","名稱含蜜但素材無蜂蜜／林蜜");
    if(/魚|河鮮/.test(n)&&!/魚|蝦|蟹/.test(names))add(r.id,n,"COOK_NAME_FISH","魚／河鮮料理缺水產");
    if(/肉|獵物/.test(n)&&!/魚肉/.test(n)&&!/肉/.test(names))add(r.id,n,"COOK_NAME_MEAT","肉類料理缺肉材");
    if(/根/.test(n)&&!/根/.test(names))add(r.id,n,"COOK_NAME_ROOT","根莖料理缺根材");
    if(/龍/.test(n)&&!/龍/.test(names))add(r.id,n,"COOK_NAME_DRAGON","龍系料理缺龍類食材");
    if(/茶|湯|燉|粥|飲/.test(n)&&!("I-WATER" in req)&&!/牛奶/.test(names))add(r.id,n,"COOK_LIQUID_NO_WATER","液態料理缺水");
  }
  return {pass:issues.length===0,issue_count:issues.length,issues};
}

const result=audit();
const uniqueChanged=[...new Set(changes.map(x=>x.id))];
DB.crafting_recipe_semantic_system_v2={
  version:REV,release:RELEASE,
  scope:{
    professional:(DB.items||[]).filter(x=>x?.craft_recipe).length,
    cooking:(DB.recipes||[]).filter(r=>{const o=byId(r?.result||r?.output?.item_id);return o&&(o.type==="料理"||o.inventory_group==="食物"||o.food_subtype)}).length
  },
  tier_policy:{
    material_must_not_exceed_product:true,
    minimum_core_tier:{F:"F",E:"F",D:"E",C:"E",B:"C",A:"B",S:"A"},
    rationale:"日常基材可低於成品，但高階成品必須具有足以支撐其世界層級的核心素材。"
  },
  changed_unique:uniqueChanged.length,
  change_events:changes.length,
  changes,
  audit:result,
  save_compatible:true
};
DB.crafting_recipe_semantic_system=DB.crafting_recipe_semantic_system||{};
DB.crafting_recipe_semantic_system.version=REV;
DB.crafting_recipe_semantic_system.release=RELEASE;
DB.crafting_recipe_semantic_system.review_candidates=[];
DB.crafting_recipe_semantic_system.final_audit=result;
DB.crafting_data_integrity_system=DB.crafting_data_integrity_system||{};
DB.crafting_data_integrity_system.semantic_revision=REV;
DB.crafting_data_integrity_system.issue_count=result.issues.filter(x=>!String(x.code).startsWith("COOK_")).length;
DB.crafting_data_integrity_system.issues=result.issues.filter(x=>!String(x.code).startsWith("COOK_"));
DB.cooking_data_integrity_system=DB.cooking_data_integrity_system||{};
DB.cooking_data_integrity_system.semantic_revision=REV;
DB.cooking_data_integrity_system.semantic_issue_count=result.issues.filter(x=>String(x.code).startsWith("COOK_")).length;
DB.cooking_data_integrity_system.semantic_issues=result.issues.filter(x=>String(x.code).startsWith("COOK_"));
DB.meta=DB.meta||{};
DB.meta.crafting_recipe_semantic_revision=REV;
globalThis.runCraftingRecipeSemanticAuditV2=audit;
})();