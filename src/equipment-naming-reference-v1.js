/* 群陸旅誌：裝備命名參考規則 CURRENT-1.70.3
 * EQUIPMENT-NAMING-REFERENCE-1.0
 * 由傳統西方奇幻／RPG命名語彙萃取通用文法，不保存或生成外部作品角色、神祇、地名等專有名稱。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="EQUIPMENT-NAMING-REFERENCE-1.0";
const RELEASE="CURRENT-1.70.3";
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const CATEGORY_ALIASES={
  weapon:"武器","武器":"武器",armor:"防具","防具":"防具",accessory:"飾品","飾品":"飾品"
};
const CATEGORIES=Object.freeze({
  武器:Object.freeze(["長劍","細劍","短劍","匕首","彎刀","手半劍","雙手大劍","巨劍","戰斧","巨斧","戰鎚","釘頭錘","連枷","長槍","戰戟","三叉戟","戰鐮","長弓","短弓","複合弓","手弩","重弩","法杖","魔杖","權杖"]),
  防具:Object.freeze(["頭盔","戰盔","冠冕","兜帽","面具","胸甲","板甲","重鎧","鎖子甲","皮甲","法袍","手套","護手","臂甲","護腿","戰靴","脛甲","圓盾","鳶盾","塔盾","大盾"]),
  飾品:Object.freeze(["指環","戒指","項鍊","護身符","吊墜","護心鏡","披風","斗篷","腰帶","束帶","徽章","聖物","奇物","護符"])
});
const TIER_MATERIALS=Object.freeze({
  F:Object.freeze(["青銅","鐵質","硬木","皮革"]),
  E:Object.freeze(["黑鐵","銀紋","硬化皮革","精製木"]),
  D:Object.freeze(["精鋼","魔獸革","符文鋼","水晶"]),
  C:Object.freeze(["秘銀","黑曜","龍骨","靈木"]),
  B:Object.freeze(["精金","龍鱗","高階魔晶"]),
  A:Object.freeze(["殞鐵","星銀"]),
  S:Object.freeze(["恆金"])
});
const MOTIFS=Object.freeze([
  "晨曦","暮影","灰燼","霜痕","雷紋","潮痕","裂風","月泉","赤岩","深林","銀穗","星砂","靜心","鷹眼","不屈","守望","巡獵","祈誓","熔脈"
]);
const ELEMENT_MOTIFS=Object.freeze({
  光明:["晨曦","聖光","輝耀"],黑暗:["暮影","幽影","夜紋"],火:["熾焰","熔脈","赤炎"],
  風:["疾風","裂風","逐風"],水:["潮痕","浪紋","月泉"],地:["磐石","赤岩","山衛"],
  雷:["雷紋","霆光","迅雷"],生命:["翠葉","生息","祈療"],死亡:["灰燼","亡息","魂痕"]
});
const EXTERNAL_TOKENS=Object.freeze([
  "阿斯塔里昂","影心","密斯特拉","冰風谷","柏德之門","上古卷軸","最終幻想","超時空之鑰","聖火降魔錄","歧路旅人","聖劍傳說"
]);
const CLAIMS=Object.freeze([
  {token:"破甲",ok:m=>Number(m.armorPenPct||m.armor_pen_pct||0)>0},
  {token:"破法",ok:m=>Number(m.magicPenPct||m.magic_pen_pct||0)>0},
  {token:"汲魂",ok:m=>Number(m.lifeSteal||m.life_steal||m.manaSteal||m.mana_steal||0)>0},
  {token:"匿形",ok:m=>Number(m.stealth||0)>0||m.invisibility===true},
  {token:"祈療",ok:m=>Number(m.healingPower||m.healing_power||0)>0},
  {token:"浮空",ok:m=>m.levitation===true||m.floating===true},
  {token:"反射",ok:m=>Number(m.reflectPct||m.reflect_pct||0)>0},
  {token:"免疫",ok:m=>m.immunity===true||Array.isArray(m.immunities)&&m.immunities.length>0}
]);
const GRAND_TOKENS=Object.freeze({
  "永恆":"A","魔王":"A","神諭":"A","創世":"S","滅世":"S","終極":"S","時光逆轉":"S","萬物樞紐":"S"
});

function clean(v){return String(v||"").trim()}
function tierOf(v){const t=clean(v).toUpperCase();return TIER_RANK[t]!=null?t:"F"}
function categoryOf(v){return CATEGORY_ALIASES[clean(v)]||"武器"}
function choose(arr){return arr[Math.floor(Math.random()*arr.length)]}
function itemNameSet(){return new Set((DB.items||[]).map(x=>clean(x?.name)).filter(Boolean))}
function mergedMechanics(ctx={}){
  return {...(ctx.combat||{}),...(ctx.advanced_combat||{}),...(ctx.mechanics||{})};
}
function semanticWords(ctx={}){
  const m=mergedMechanics(ctx),out=[];
  if(Number(m.armorPenPct||m.armor_pen_pct||0)>0)out.push("破甲");
  if(Number(m.magicPenPct||m.magic_pen_pct||0)>0)out.push("破法");
  if(Number(m.lifeSteal||m.life_steal||m.manaSteal||m.mana_steal||0)>0)out.push("汲魂");
  if(Number(m.healingPower||m.healing_power||0)>0)out.push("祈療");
  if(Number(m.stealth||0)>0||m.invisibility===true)out.push("匿影");
  if(Number(m.moveSpeed||m.move_speed||0)>0)out.push("逐風");
  if(Number(m.blockRate||m.block_rate||m.blockValue||m.block_value||0)>0)out.push("壁壘");
  if(Number(m.perception||0)>0)out.push("鷹眼");
  if(Number(m.statusResist||m.status_resist||0)>0)out.push("不屈");
  return out;
}
function motifPool(ctx={}){
  const e=clean(ctx.element);
  const ep=ELEMENT_MOTIFS[e]||[];
  return ep.length?[...ep,...MOTIFS]:[...MOTIFS];
}
function materialFor(tier,ctx={}){
  const explicit=clean(ctx.material);
  if(explicit)return explicit;
  const pool=TIER_MATERIALS[tier]||TIER_MATERIALS.F;
  return choose(pool);
}
function subtypeFor(category,ctx={}){
  const explicit=clean(ctx.subtype||ctx.type);
  if(explicit&&CATEGORIES[category].includes(explicit))return explicit;
  return choose(CATEGORIES[category]);
}
function validateEquipmentName(name,category="武器",tier="F",context={}){
  const s=clean(name),t=tierOf(tier),issues=[];
  if(!s)issues.push("空白名稱");
  if(s.length>24)issues.push("名稱過長");
  if(/[A-Za-z_]{3,}/.test(s))issues.push("含英文識別字");
  for(const token of EXTERNAL_TOKENS)if(s.includes(token))issues.push("外部作品專名:"+token);
  if(!context.allowExisting&&itemNameSet().has(s))issues.push("與CURRENT物品名稱重複");
  for(const [token,minTier] of Object.entries(GRAND_TOKENS)){
    if(s.includes(token)&&TIER_RANK[t]<TIER_RANK[minTier])issues.push(token+"至少需"+minTier+"級");
  }
  const mech=mergedMechanics(context);
  for(const rule of CLAIMS)if(s.includes(rule.token)&&!rule.ok(mech))issues.push(rule.token+"缺少對應實裝效果");
  if(/神器/.test(s)&&TIER_RANK[t]<TIER_RANK.A)issues.push("神器稱呼至少需A級");
  return {ok:issues.length===0,issues:[...new Set(issues)],name:s,category:categoryOf(category),tier:t,revision:REV};
}
function generateEquipmentName(category="武器",tier="F",context={}){
  const cat=categoryOf(category),t=tierOf(tier),subtype=subtypeFor(cat,context),used=new Set([...(context.usedNames||[]),...itemNameSet()]);
  const provenance=clean(context.provenance||context.regionName||context.factionName);
  const title=clean(context.uniqueTitle);
  const semantic=semanticWords(context);
  for(let attempt=0;attempt<80;attempt++){
    const material=materialFor(t,context),motif=choose(motifPool(context)),effect=semantic.length?choose(semantic):"";
    let base="";
    if(t==="F"){
      base=(attempt%2===0?material:(clean(context.role)||"旅人"))+subtype;
    }else if(t==="E"){
      base=attempt%2===0?motif+subtype:material+(effect||motif)+subtype;
    }else if(t==="D"||t==="C"){
      const head=provenance||motif;
      base=head+(effect||choose(motifPool(context)))+subtype;
    }else{
      const head=provenance||material||motif;
      base=head+(effect||motif)+subtype;
      if(title&&context.canonApproved===true)base+=`「${title}」`;
    }
    if(used.has(base))continue;
    const checked=validateEquipmentName(base,cat,t,context);
    if(checked.ok)return base;
  }
  const fallback=(clean(context.provenance)||materialFor(t,context))+subtype;
  const checked=validateEquipmentName(fallback,cat,t,{...context,allowExisting:false});
  return checked.ok?fallback:(materialFor(t,context)+subtype);
}

function audit(){
  const issues=[];
  const corpus=[...Object.values(CATEGORIES).flat(),...Object.values(TIER_MATERIALS).flat(),...MOTIFS,...Object.values(ELEMENT_MOTIFS).flat()];
  for(const token of EXTERNAL_TOKENS)if(corpus.some(x=>String(x).includes(token)))issues.push("生成詞庫混入外部專名:"+token);
  for(const d of DB.items||[]){
    const isEquipment=["武器","防具","飾品"].includes(d?.catalog_group)||["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"].includes(d?.type);
    if(!isEquipment)continue;
    for(const token of EXTERNAL_TOKENS)if(clean(d.name).includes(token))issues.push("CURRENT裝備含外部專名:"+(d.id||d.name)+":"+token);
  }
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{weapon_types:CATEGORIES.武器.length,armor_types:CATEGORIES.防具.length,accessory_types:CATEGORIES.飾品.length,external_tokens_blocked:EXTERNAL_TOKENS.length}};
}

DB.equipment_naming_reference={
  version:REV,release:RELEASE,
  source_policy:"僅萃取使用者提供的傳統奇幻RPG通用命名文法；外部作品人物、神祇、地名與專有名不得進入可生成詞庫。",
  categories:CATEGORIES,tier_materials:TIER_MATERIALS,motifs:MOTIFS,element_motifs:ELEMENT_MOTIFS,
  tier_rules:{
    F:"實用品：材質／職能＋裝備類型，避免史詩稱號。",
    E:"可加入單一自然意象、地域習慣或明確用途。",
    D:"可組合地域／材質＋一項功能或意象。",
    C:"可出現組織、流派、地域特色，但名稱仍須對應實際資料。",
    B:"稀有高階裝備；可使用較強烈意象，必須符合取得門檻與世界來源。",
    A:"傳奇級；稱號需有正史、組織、人物或事件來源。",
    S:"世界級唯一／極少數裝備；創世、滅世、時光等詞只允許在有正史與實裝效果時使用。"
  },
  semantic_rule:"破甲、破法、汲魂、祈療、匿形、浮空、反射、免疫等功能詞必須有對應可執行效果，名稱不得虛構能力。",
  unique_item_rule:"B級以上可使用題名；只有context.canonApproved=true且提供uniqueTitle時才生成引號題名。",
  blocked_external_tokens:EXTERNAL_TOKENS,
  save_compatible:true
};
DB.meta=DB.meta||{};
DB.meta.equipment_naming_revision=REV;

const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-NAMING");
if(ai){
  ai.responsibility="依文化圈、地區、層級與內容類型生成RPG風格名稱；裝備額外遵循材質、類型、機制語義與高階稱號門檻。";
  ai.inputs=Array.from(new Set([...(ai.inputs||[]),"equipment tier/material/subtype/mechanics",REV]));
  ai.validations=Array.from(new Set([...(ai.validations||[]),"裝備功能詞必須有對應實裝效果。","外部作品人物、神祇、地名與專有名稱不得進入生成詞庫。","F/E級裝備不得濫用創世、滅世、永恆、神器等高階稱號。"]));
}
const gen=(DB.generators||[]).find(x=>x?.id==="GEN-NAME");
if(gen){
  gen.inputs=Array.from(new Set([...(gen.inputs||[]),REV]));
  gen.constraints=Array.from(new Set([...(gen.constraints||[]),"裝備名稱依tier、材質、類型、地域與已實裝效果生成。","裝備不得直接照搬外部作品專名；功能詞需通過語義驗證。"]));
  gen.equipment_runtime_function="generateEquipmentName";
  gen.equipment_validation_function="validateEquipmentName";
}

globalThis.generateEquipmentName=generateEquipmentName;
globalThis.validateEquipmentName=validateEquipmentName;
globalThis.runEquipmentNamingReferenceAudit=audit;
globalThis.QUNLU_EQUIPMENT_NAMING=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
})();