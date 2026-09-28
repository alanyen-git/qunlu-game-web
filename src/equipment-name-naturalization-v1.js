/* 群陸旅誌：裝備名稱自然化 CURRENT-2.25.11
 * EQUIPMENT-NAME-NATURALIZATION-1.1
 *
 * 參考傳統RPG常見的命名層次：F～E級看材質與部位，D～C級看材質與用途，
 * 高階以短題名搭配裝備類型。組織、地區、流派與取得方式保留在資料欄位，
 * 不再直接串入每一件裝備的名稱。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="EQUIPMENT-NAME-NATURALIZATION-1.1";
const TIERS={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const TIER_MATERIALS={
  F:["鐵製","木製","皮革","青銅"],E:["黑鐵","硬化皮革","精製木","銀紋"],
  D:["精鋼","符文鋼","魔獸革","水晶"],C:["秘銀","黑曜","龍骨","靈木"],
  B:["精金","龍鱗","高階魔晶"],A:["殞鐵","星銀"],S:["恆金"]
};
const MOTIFS=["晨曦","暮影","灰燼","霜痕","雷紋","潮痕","裂風","月泉","赤岩","深林","銀穗","星砂","靜心","守望","巡獵","松風","秋水","遠雷","白鷺","薄雲","楓痕","夕潮","蒼雷","曙光","長夜","星河","白虹","月蝕","照夜","逐星"];
const LOW_TIER_MOTIFS=Object.freeze([...MOTIFS]);
const VARIANTS=["精工","改製","輕量","重鑄","軍規","術式","古式","新製","特製","定製","改良","標準"];
const BAD=/(?:傳承裝|誓徽|兄弟會|黑市|深井|戰吼|寶庫限定|組織裝備|流派裝備)/;

function text(v){return String(v==null?"":v).normalize("NFKC").replace(/[・·]/g,"").trim()}
function hash(v){let h=2166136261;for(const ch of String(v||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(list,seed,step=0){return list[(hash(seed)+step)%list.length]}
function tierOf(v){const t=text(v).toUpperCase();return TIERS[t]!=null?t:"F"}
function mechanics(d){return {...(d?.combat||{}),...(d?.advanced_combat||{}),...(d?.mechanics||{})}}
function isEquipment(d){return !!d&&(d.kind==="equipment"||["武器","防具","飾品"].includes(d.catalog_group)||["主武器","副武器","頭盔","盔甲","手套","鞋子","披風","飾品","戒指","耳環","項鍊","護符","護身符","腰帶","徽章","晶珠","盾牌"].includes(text(d.type))||d.weapon_profile||d.equipment_slot)}
function sourceName(d){return text((Array.isArray(d?.previous_names)&&d.previous_names[0])||d?.name)}
function plainSourceName(d){
  const s=sourceName(d);
  if(!s||BAD.test(s)||LOW_TIER_MOTIFS.some(token=>s.includes(token))||/[・·／/]/.test(s))return "";
  return s;
}

function slotOf(d){
  const raw=text(d?.type||d?.equipment_slot||"");
  if(["頭盔","盔甲","手套","鞋子","披風","飾品"].includes(raw))return raw;
  const old=text(d?.name);
  if(raw==="盾牌"||/盾/.test(old))return "主武器";
  if(d?.catalog_group==="防具"&&Number(mechanics(d).blockRate||0)>0)return "主武器";
  return "主武器";
}

function materialLabel(raw){
  const map=[
    [/恆金/,"恆金"],[/星銀/,"星銀"],[/殞鐵/,"殞鐵"],[/精金/,"精金"],[/秘銀/,"秘銀"],
    [/黑曜/,"黑曜"],[/龍鱗/,"龍鱗"],[/龍骨/,"龍骨"],[/符文鋼/,"符文鋼"],[/精鋼|鋼製|鋼/,"精鋼"],
    [/黑鐵|鐵質|鐵/,"黑鐵"],[/青銅|銅/,"青銅"],[/木|木材/,"木製"],[/皮|革|獸皮/,"皮革"],
    [/布|絲|織物|法衣/,"布質"],[/水晶|晶/,"水晶"],[/銀/,"白銀"]
  ];
  for(const [re,value] of map)if(re.test(raw))return value;
  return "";
}

function materialOf(d,slot){
  const raw=text(d?.material||d?.craft_material||d?.material_tag||"");
  // 以配方的實際主材優先，避免資料上的舊材質標籤把成品名稱寫錯。
  const recipe=d?.craft_recipe;
  if(recipe){
    const recipeText=[...(recipe.base_materials||[]),...(recipe.monster_components||[])].map(m=>{
      const item=(DB.items||[]).find(x=>x?.id===m?.id);
      return text(item?.name||m?.name||m?.id||"");
    }).join(" ");
    const fromRecipe=materialLabel(recipeText);
    if(fromRecipe)return fromRecipe;
  }
  const fromData=materialLabel(raw);
  if(fromData)return fromData;
  const group=d?.catalog_group||"";
  const defaults=slot==="主武器"?(group==="防具"?["木製","黑鐵","精鋼"]:["鐵製","黑鐵","精鋼"]):slot==="飾品"?["銅製","銀紋","水晶"]:["皮革","黑鐵","精鋼"];
  return pick(defaults,String(d?.id||""));
}

function weaponType(d){
  const old=sourceName(d),group=text(d?.weapon_profile?.group||d?.weapon_type||d?.catalog_subcategory||"");
  if(d?.offhand_profile?.kind==="shield"||d?.equip_slot==="offhand"||/盾/.test(old+" "+group+" "+text(d?.description)))return "盾牌";
  if(group&&group!=="盾牌"&&d?.catalog_group==="武器"){
    if(/武士刀/.test(group))return "武士刀";
    if(/法杖|魔杖|權杖|咒杖|術杖|法器/.test(group))return "法杖";
    if(/弓/.test(group))return "長弓";
    if(/弩/.test(group))return "弩";
    if(/槍|矛/.test(group))return "長槍";
    if(/斧錘|鎚|錘/.test(group))return "戰鎚";
    if(/斧/.test(group))return "戰斧";
    if(/匕首|短刃/.test(group))return "短刃";
    if(/鞭/.test(group))return "長鞭";
    if(/劍/.test(group))return "長劍";
  }
  if(Number(mechanics(d).blockRate||0)>Number(mechanics(d).attack||0)&&Number(mechanics(d).defense||0)>0)return "盾牌";
  if(/武士刀/.test(old)||/武士刀/.test(group))return "武士刀";
  if(/法杖|魔杖|權杖|咒杖|術杖|法器/.test(old)||/法杖/.test(group))return "法杖";
  if(/長弓|短弓|複合弓|戰弓|弓/.test(old)||/弓/.test(group))return "長弓";
  if(/重弩|手弩|弩/.test(old)||/弩/.test(group))return "弩";
  if(/長槍|戰戟|三叉戟|槍|矛/.test(old)||/長槍/.test(group))return "長槍";
  if(/戰鎚|鎚|錘|釘頭/.test(old)||/斧錘/.test(group))return "戰鎚";
  if(/斧/.test(old))return "戰斧";
  if(/匕首|短刃|飛刀/.test(old)||/匕首/.test(group))return "短刃";
  if(/拳|拳甲/.test(old))return "拳甲";
  if(/鞭/.test(old))return "長鞭";
  return "長劍";
}

function armorType(d,slot){
  const old=sourceName(d);
  const profession=text(d?.craft_recipe?.profession);
  if(profession==="鍛造"){
    if(slot==="頭盔")return "面盔";
    if(slot==="盔甲")return "板甲";
    if(slot==="手套")return "護手";
    if(slot==="鞋子")return "戰靴";
  }
  if(slot==="頭盔")return /兜帽|帽|面罩|面具/.test(old)?"兜帽":/冠|額環/.test(old)?"冠冕":"頭盔";
  if(slot==="盔甲")return /法袍|長袍|法衣|道服/.test(old)?"法袍":/鎖/.test(old)?"鎖甲":/板|重鎧|鎧/.test(old)?"板甲":/皮|革|毛皮/.test(old)?"皮甲":"胸甲";
  if(slot==="手套")return /拳|護腕|護指/.test(old)?"護腕":"護手";
  if(slot==="鞋子")return /靴|脛|護腿/.test(old)?"戰靴":"鞋子";
  if(slot==="披風")return /斗篷|披肩/.test(old)?"斗篷":"披風";
  return "護具";
}

function accessoryType(d){
  const old=sourceName(d),m=mechanics(d);
  if(/戒|環/.test(old)||Number(m.critRate||0)>0&&Number(m.defense||0)===0)return "戒指";
  if(/項鍊|項鏈|吊墜/.test(old))return "項鍊";
  if(/徽|徽章|印/.test(old))return "徽章";
  if(/珠|晶珠/.test(old))return "晶珠";
  if(/帶|束帶|腰/.test(old))return "腰帶";
  return Number(m.magicPower||0)>0?"護符":"護身符";
}

function typeOf(d,slot){
  if(slot==="主武器")return weaponType(d);
  if(slot==="飾品")return accessoryType(d);
  return armorType(d,slot);
}

function effectOf(d,slot){
  const m=mechanics(d);
  if(Number(m.armorPenPct||m.armor_pen_pct||0)>0)return "破甲";
  if(Number(m.magicPenPct||m.magic_pen_pct||0)>0)return "破法";
  if(Number(m.lifeSteal||m.life_steal||0)>0)return "汲魂";
  if(Number(m.healingPower||m.healing_power||0)>0)return "祈療";
  if(Number(m.stealth||0)>1)return "匿影";
  if(Number(m.moveSpeed||m.move_speed||0)>1||Number(m.evasion||0)>3)return "疾行";
  if(Number(m.blockRate||m.block_rate||m.blockValue||m.block_value||0)>5)return "壁壘";
  if(Number(m.statusResist||m.status_resist||0)>3)return "守護";
  if(Number(m.magicPower||0)>5||Number(m.castSpeed||m.cast_speed||0)>0.08)return "術式";
  if(Number(m.critRate||m.crit_rate||0)>3)return "銳鋒";
  if(Number(m.attack||0)>0&&Number(m.accuracy||0)>4)return "精準";
  if(Number(m.defense||0)>8||Number(m.magicDefense||0)>8)return "堅壁";
  return "";
}

function lowEffectOf(d){
  const m=mechanics(d);
  if(Number(m.armorPenPct||m.armor_pen_pct||0)>0)return "破甲";
  if(Number(m.magicPenPct||m.magic_pen_pct||0)>0)return "破法";
  if(Number(m.attack||0)>0&&Number(m.accuracy||0)>4)return "精準";
  if(Number(m.blockRate||m.block_rate||m.blockValue||m.block_value||0)>5)return "格擋";
  if(Number(m.statusResist||m.status_resist||0)>3)return "抗性";
  if(Number(m.magicPower||0)>5||Number(m.castSpeed||m.cast_speed||0)>0.08)return "魔力";
  if(Number(m.moveSpeed||m.move_speed||0)>1||Number(m.evasion||0)>3)return "迅捷";
  if(Number(m.defense||0)>8||Number(m.magicDefense||0)>8)return "防禦";
  return "";
}

function makeCandidate(d,slot,idx,used){
  const tier=tierOf(d?.tier),rank=TIERS[tier],seed=String(d?.id||idx),mat=materialOf(d,slot)||"",kind=typeOf(d,slot),motif=pick(MOTIFS,seed),effect=effectOf(d,slot),lowEffect=lowEffectOf(d),variant=pick(VARIANTS,seed,3);
  const candidates=[];
  const source=plainSourceName(d);
  if(rank<=1)candidates.push(source,source&&variant+source,mat&&mat+kind,mat&&mat+variant+kind,variant+mat+kind);
  else if(rank<=3)candidates.push(source,source&&variant+source,mat&&mat+(lowEffect||"")+kind,mat&&mat+kind,lowEffect&&lowEffect+kind,mat&&mat+variant+kind,variant+mat+kind);
  else candidates.push((effect?motif+effect:motif)+kind,motif+kind,mat&&mat+kind,mat&&mat+motif+kind,motif+variant+kind,variant+motif+kind,mat&&mat+variant+kind,motif+variant+(effect||"")+kind,variant+(effect||"")+kind);
  for(const c of candidates){
    const name=c.replace(/之(?=劍|弓|杖|甲|靴|戒|符|披風|盾)/g,"");
    if(!name||name.length>24||used.has(name)||BAD.test(name)||(rank<=3&&LOW_TIER_MOTIFS.some(token=>name.includes(token))))continue;
    const checked=typeof validateEquipmentName==="function"?validateEquipmentName(name,"武器",tier,{...d,allowExisting:true}):{ok:true};
    if(checked.ok)return name;
  }
  for(let n=0;n<VARIANTS.length*4;n++){
    const v=VARIANTS[(hash(seed)+n)%VARIANTS.length];
    const name=rank<=3?(n<VARIANTS.length?mat+v+kind:n<VARIANTS.length*2?v+mat+kind:mat+v+(n%2?"式":"款")+kind):(n<VARIANTS.length?motif+v+kind:n<VARIANTS.length*2?v+motif+kind:motif+v+(n%2?"式":"款")+kind);
    if(!used.has(name)&&name.length<=24&&!BAD.test(name)&&(rank>3||!LOW_TIER_MOTIFS.some(token=>name.includes(token))))return name;
  }
  const base=rank<=3?mat+kind:motif+kind;
  if(!used.has(base))return base;
  for(let n=2;n<1000;n++){
    const numbered=base+"（"+n+"）";
    if(!used.has(numbered)&&numbered.length<=24)return numbered;
  }
  return base+"（"+hash(seed)%997+"）";
}

function naturalize(){
  const rows=(DB.items||[]).filter(isEquipment),used=new Set(),changes=[];
  for(const d of rows){
    const old=text(d.name),slot=slotOf(d),name=makeCandidate(d,slot,changes.length,used);
    used.add(name);
    if(old!==name){
      d.previous_names=Array.isArray(d.previous_names)?d.previous_names:[];
      if(old&&!d.previous_names.includes(old))d.previous_names.push(old);
      changes.push({id:d.id,from:old,to:name});d.name=name
    }
    d.name_style=REV;
  }
  DB.meta=DB.meta||{};
  DB.meta.equipment_name_naturalization_revision=REV;
  DB.equipment_name_naturalization={version:REV,changed:changes.length,total:rows.length,rule:"F～E級材質＋部位；D～C級材質＋實際功能＋部位；B級以上才可使用單一意象；來源組織、地區、流派不進裝備全名",changed_ids:changes.slice(0,24).map(x=>x.id)};
  return DB.equipment_name_naturalization;
}

function audit(){
  const rows=(DB.items||[]).filter(isEquipment),seen=new Set(),issues=[];
  for(const d of rows){
    const name=text(d.name);
    if(!name)issues.push("空白裝備名稱:"+d.id);
    if(BAD.test(name))issues.push("來源硬拼詞:"+d.id+":"+name);
    if(/[・·／/]/.test(name))issues.push("來源串接符號:"+d.id+":"+name);
    if(TIERS[tierOf(d?.tier)]<=3&&LOW_TIER_MOTIFS.some(token=>name.includes(token)))issues.push("C級以下不得使用意象:"+d.id+":"+name);
    if(seen.has(name))issues.push("裝備名稱重複:"+name);
    seen.add(name);
  }
  return {revision:REV,pass:issues.length===0,issues:[...new Set(issues)],stats:{total:rows.length,unique:seen.size}};
}

const result=naturalize();
DB.equipment_naming_reference=DB.equipment_naming_reference||{};
DB.equipment_naming_reference.naturalization_revision=REV;
DB.equipment_naming_reference.naming_source_policy="F～E級採材質與部位；D～C級採材質、已實裝功能與部位；B級以上才採單一意象或已實裝效果；組織、地區、流派與取得方式不直接串入名稱。";
globalThis.naturalizeEquipmentName=(d)=>makeCandidate(d,slotOf(d),0,new Set());
globalThis.runEquipmentNameNaturalization=naturalize;
globalThis.runEquipmentNameNaturalizationAudit=audit;
globalThis.QUNLU_EQUIPMENT_NAME_NATURALIZATION={revision:REV,result,audit:audit()};
if(typeof addEventListener==="function")addEventListener("load",()=>setTimeout(()=>{
  const refreshed=naturalize();
  globalThis.QUNLU_EQUIPMENT_NAME_NATURALIZATION={revision:REV,result:refreshed,audit:audit()};
},0));
globalThis.QUNLU_CORE?.registerModule?.("src/equipment-name-naturalization-v1.js",{domain:"equipment",revision:REV,release:globalThis.QUNLU_CORE?.release?.()});
})();
