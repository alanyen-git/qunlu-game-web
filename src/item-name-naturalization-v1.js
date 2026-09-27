/* 群陸旅誌：道具與藥劑名稱自然化 CURRENT-2.25.10
 * ITEM-NAME-NATURALIZATION-1.1
 *
 * 非裝備物品依用途分流命名：藥劑看效果，料理看主要食材，
 * 卷軸看功能，工具／鑰匙／素材保留可辨識的實物名稱。
 * 組織、地區、流派與取得方式只保留在資料欄位，不直接串入正式名稱。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!Array.isArray(DB.items))return;

const REV="ITEM-NAME-NATURALIZATION-1.1";
const TIERS={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const BAD=/(?:傳承裝|誓徽|兄弟會|黑市|深井|戰吼|寶庫限定|組織裝備|流派裝備|勢力寶庫|組織／流派|組織／地區)/;
const SEPARATORS=/[・·／/]/;
const MOTIFS=["晨露","月泉","白棘","星砂","楓痕","霜痕","雷紋","潮痕","裂風","深林","銀穗","赤岩","靜心","守望","巡獵","松風","秋水","遠雷","白鷺","薄雲","曙光","長夜","星河","白虹","照夜","逐星","青燈","暮影","灰燼"];
const LOW_TIER_MOTIFS=Object.freeze([...MOTIFS]);
const TIER_PREFIX={F:"小型",E:"標準",D:"強效",C:"高效",B:"濃縮",A:"精製",S:"至純"};

function text(v){return String(v==null?"":v).normalize("NFKC").trim()}
function hash(v){let h=2166136261;for(const ch of String(v||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(list,seed,step=0){return list[(hash(seed)+step)%list.length]}
function tierOf(v){const t=text(v).toUpperCase();return TIERS[t]!=null?t:"F"}
function tierRank(v){return TIERS[tierOf(v)]}
function stripLowTierMotifs(value){
  let s=text(value);
  for(const token of LOW_TIER_MOTIFS)s=s.split(token).join("");
  return s.replace(/\s+/g," ").trim();
}
function allText(d){return [d?.name,d?.description,d?.desc,d?.feature,d?.consumable_group,d?.material_group,d?.utility_effect].map(text).join(" ")}
function effectText(d){return JSON.stringify(d?.use||d?.effect||d?.effects||d?.mechanics||"")+" "+allText(d)}
function isEquipment(d){
  const equipmentTypes=["主武器","副武器","頭盔","盔甲","手套","鞋子","披風","飾品","戒指","耳環","項鍊","護符","護身符","腰帶","徽章","晶珠","盾牌"];
  return !!d&&(d.kind==="equipment"||["武器","防具","飾品"].includes(d.catalog_group)||equipmentTypes.includes(text(d.type))||d.weapon_profile||d.equipment_slot);
}
function isItem(d){return !!d&&!isEquipment(d)}
function familyOf(d){
  const type=text(d?.type),group=text(d?.catalog_group),inventory=text(d?.inventory_group),sub=text(d?.consumable_group||d?.material_group),rawName=text(d?.name);
  if(type==="藥劑")return "potion";
  if(type==="料理"||inventory==="食物")return "food";
  if(type==="食材")return "ingredient";
  if(type==="草藥素材"||/草藥|植物/.test(sub))return "herb";
  if(type==="礦石")return "ore";
  if(type==="寶石素材")return "gem";
  if(type==="魔物素材")return "monster_material";
  if(type==="工藝素材")return "craft";
  if(type==="卷軸")return "scroll";
  if(type==="符文")return "rune";
  if(type==="書籍")return "book";
  if(type==="鑰匙")return "key";
  if(type==="工具")return "tool";
  if(type==="補給")return "supply";
  if(type==="消耗品")return "consumable";
  if(type==="任務道具")return "quest";
  if(type==="寶藏")return "treasure";
  if(text(d?.craft_recipe?.profession)==="藥劑")return "potion";
  if(/藥水|藥油|藥劑|靈藥|煎藥/.test(rawName))return "potion";
  if(group==="消耗品")return "consumable";
  return "other";
}
function recipeMaterialText(d){
  const rows=[...(d?.craft_recipe?.base_materials||[]),...(d?.craft_recipe?.monster_components||[])];
  return rows.map(m=>{const item=(DB.items||[]).find(x=>x?.id===m?.id);return text(item?.name||m?.name||m?.id)}).join(" ");
}
function recipeFor(d){
  return (DB.recipes||[]).find(r=>text(r?.result||r?.output?.item_id)===text(d?.id))||null;
}
function recipeTextFor(d){
  const r=recipeFor(d);if(!r)return "";
  const ids=[...Object.keys(r.requires||{}),...(r.ingredients||[]).map(x=>x?.item_id||x?.id)].filter(Boolean);
  const names=ids.map(id=>text((DB.items||[]).find(x=>x?.id===id)?.name||id));
  return [text(r.name),...names].join(" ");
}
function recipeHasWater(d){
  const r=recipeFor(d);if(!r)return false;
  const ids=Object.keys(r.requires||{}).concat((r.ingredients||[]).map(x=>x?.item_id||x?.id));
  return ids.includes("I-WATER")||/水|牛奶/.test(recipeTextFor(d));
}
function semanticSource(d){
  const source=[text(d?.name),recipeMaterialText(d),text(d?.purpose),text(d?.effect_name),text(d?.material),text(d?.material_tag)].join(" ");
  return source.replace(BADg(),"").replace(SEPARATORS," ").replace(/\s+/g," ").trim();
}
function BADg(){return /(?:傳承裝|誓徽|兄弟會|黑市|深井|戰吼|寶庫限定|組織裝備|流派裝備|勢力寶庫|組織／流派|組織／地區)/g}
function oldSemantic(d){return semanticSource(d).replace(/^(?:受封印|標準|一般|初階|進階|高階|強化|精製|特製|定製|改製|改良)+/g,"").trim()}
function potionBase(d){
  const s=effectText(d),g=text(d?.consumable_group),id=text(d?.id),tier=tierOf(d?.tier),prefix=TIER_PREFIX[tier],recipeText=recipeMaterialText(d)+" "+recipeTextFor(d);
  if(/烈焰椒|MAT-HERB-24/.test(recipeText))return prefix+"抗火藥水";
  if(/解毒|毒|中毒/.test(s+g))return prefix+"解毒藥水";
  if(/詛咒|解咒/.test(s+g))return prefix+"解咒藥水";
  if(/淨化|異常|疾病|狀態/.test(s+g))return prefix+"淨化藥水";
  if(/火|炎|燃燒/.test(s+g))return prefix+"抗火藥水";
  if(/冰|寒|霜/.test(s+g))return prefix+"抗寒藥水";
  if(/雷|電/.test(s+g))return prefix+"抗雷藥水";
  if(/酸|腐蝕/.test(s+g))return prefix+"抗蝕藥水";
  if(/隱身|潛行/.test(s+g))return prefix+"隱身藥水";
  if(/夜視|感官|視野/.test(s+g))return prefix+"夜視藥水";
  if(/水下|呼吸/.test(s+g))return prefix+"水息藥水";
  if(/退熱|驅寒|體溫/.test(s+g))return prefix+"調溫藥水";
  if(/精神|清醒|恐懼|意志/.test(s+g))return prefix+"清醒藥水";
  if(/航行|水手|海/.test(s+g))return prefix+"航行藥水";
  if(/旅行|旅途|移動|速度|機動/.test(s+g))return prefix+"行旅藥水";
  if(/力量|攻擊|強化攻擊|might/i.test(s+g+id))return prefix+"力量藥水";
  if(/迅捷|速度|急速|haste/i.test(s+g+id))return prefix+"迅捷藥水";
  if(/專注|命中|施法|focus/i.test(s+g+id))return prefix+"專注藥水";
  if(/防禦|硬化|護甲|格擋|guard/i.test(s+g+id))return prefix+"鐵壁藥水";
  if(/抗性|抗毒|抗魔/.test(s+g))return prefix+"抗性藥水";
  if(/火焰|火傷|燃燒|灼熱/.test(s+g))return prefix+"火焰藥油";
  if(/毒刃|塗油|投擲|中毒/.test(s+g))return prefix+"毒刃藥油";
  if(/魔力|法力|mana|mp/i.test(s+g+id))return prefix+"法力藥水";
  if(/精力|體力|耐力|活力|stamina/i.test(s+g+id))return prefix+"活力藥水";
  if(/口渴|補水|飲水|thirst/i.test(s+g+id))return prefix+"補水藥水";
  if(/hp|生命|治療|恢復|回生|healing/i.test(s+g+id))return prefix+"治療藥水";
  return prefix+"調和靈藥";
}
function foodBase(d){
  const old=oldSemantic(d),recipe=recipeFor(d),recipeText=recipeTextFor(d),s=(recipeText||old||recipeMaterialText(d)+" "+effectText(d)).replace(/\s+/g," "),hasWater=recipeHasWater(d),pie=/餅|派|pie/i.test(old+" "+text(recipe?.name));
  if(/茶/.test(s))return hasWater?"草本茶":"草本點心";
  if(/菇|菌/.test(s))return hasWater?"野菇燉湯":(pie?"野菇餅":"香煎野菇");
  if(/魚|蝦|蟹|水產|河鮮/.test(s))return hasWater?"鮮魚湯":"香煎鮮魚";
  if(/肉|獵物|獸肉|雞肉/.test(s))return hasWater?"獵人燉肉":(/乾|臘|燻/.test(s)?"燻香肉乾":"香煎獵肉");
  if(/莓/.test(s))return "莓果甜點";
  if(/蘋果|果實|水果|果/.test(s))return hasWater?"果香飲":"果香點心";
  if(/蜜/.test(s))return "蜂蜜點心";
  if(/麥|粉|穀/.test(s))return /餅/.test(s)?"麥香餅":"麥香麵包";
  if(/乳酪|奶|乳/.test(s))return "熟成乳酪";
  if(/湯|羹|燉/.test(s))return "香草燉湯";
  return "旅人餐包";
}
function scrollBase(d){
  const s=effectText(d)+" "+oldSemantic(d);
  if(/傳送|return_town/.test(s))return "返城卷軸";
  if(/鑑定|inspect_inventory/.test(s))return "鑑定卷軸";
  if(/詛咒|解咒/.test(s))return "解咒卷軸";
  if(/復甦|復活|revive/.test(s))return "復甦卷軸";
  if(/召喚|summon/.test(s))return "召喚卷軸";
  if(/火球|火焰/.test(s))return "火球卷軸";
  if(/閃電|雷擊/.test(s))return "閃電卷軸";
  if(/治癒|治療|heal/.test(s))return "治癒卷軸";
  return /符文/.test(s)?"符文石":"空白卷軸";
}
function simpleBase(d,family){
  const oldRaw=oldSemantic(d),old=tierRank(d?.tier)<=3?stripLowTierMotifs(oldRaw):oldRaw,s=effectText(d),id=text(d?.id);
  if(family==="key")return /骷髏|骨/.test(old)?"骷髏鑰匙":/魔法|秘/.test(old)?"魔法鑰匙":/金/.test(old)?"金鑰匙":/銀/.test(old)?"銀鑰匙":/鐵/.test(old)?"鐵鑰匙":"舊鑰匙";
  if(family==="tool")return /鎬|採礦|mining/i.test(old+id)?"鐵鎬":/伐木|木材|wood/i.test(old+id)?"伐木斧":/釣|魚|fish/i.test(old+id)?"釣竿":/火把|torch/i.test(old+id)?"火把":/油燈|燈油|lantern/i.test(old+id)?"油燈":/開鎖|lockpick/i.test(old+id)?"開鎖工具組":old||"旅用工具";
  if(family==="supply")return /補水|水袋|飲水|thirst/i.test(old+s+id)?"行旅水袋":/柴|木柴|firewood/i.test(old+id)?"乾柴束":/燈油|lantern/i.test(old+id)?"燈油":/鹽/.test(old+id)?"旅用鹽包":/蠟布|防雨/.test(old+id)?"防雨蠟布":/弓弦/.test(old+id)?"備用弓弦":/帳/.test(old+id)?"簡易帳布":/炭/.test(old+id)?"小型炭包":/護足/.test(old+id)?"護足布條":"行旅補給包";
  if(family==="rune")return /火|炎/.test(old+s)?"火焰符文":/寒|冰|霜/.test(old+s)?"寒冰符文":/雷|電/.test(old+s)?"雷光符文":/風/.test(old+s)?"疾風符文":"符文石";
  if(family==="scroll"||family==="book")return scrollBase(d);
  if(family==="ore")return /礦石$|礦砂$|錠$|錠塊$/.test(old)?old:old+"礦";
  if(family==="gem")return /晶/.test(old)?old:old+"寶石";
  if(family==="herb")return old.replace(/草藥素材|草藥/g,"")||"野生藥草";
  if(family==="monster_material"||family==="craft"||family==="ingredient")return old||"一般素材";
  if(family==="treasure")return /箱|匣|盒/.test(old)?old:"古代寶匣";
  if(family==="quest")return old||"任務憑證";
  if(family==="consumable")return /鹽糖|補給|口糧/.test(old)?"鹽糖補給包":old||"旅用消耗品";
  return old||"旅用道具";
}
function candidate(d,family,index){
  const tier=tierOf(d?.tier),rank=tierRank(tier),seed=String(d?.id||index),motif=pick(MOTIFS,seed),motif2=pick(MOTIFS,seed,7);
  if(rank<=3){
    const base=family==="potion"?potionBase(d):family==="food"?foodBase(d):family==="scroll"||family==="book"?scrollBase(d):simpleBase(d,family);
    const cleanBase=stripLowTierMotifs(base)||base;
    return [cleanBase,"標準"+cleanBase,"改良"+cleanBase,"精製"+cleanBase,"輕量"+cleanBase,"普通"+cleanBase];
  }
  if(family==="potion"){
    const base=potionBase(d);return [base,motif+base.replace(/^小型|^標準|^強效|^高效|^濃縮|^精製|^至純/,""),motif+pick(["清","和","露","精華"],seed,3)+base.replace(/^小型|^標準|^強效|^高效|^濃縮|^精製|^至純/,""),motif+motif2+base.replace(/^小型|^標準|^強效|^高效|^濃縮|^精製|^至純/,"")];
  }
  if(family==="food"){
    const base=foodBase(d);return [base,motif+base,motif+pick(["香","燉","甜","脆"],seed,2)+base,motif+motif2+base];
  }
  if(family==="scroll"||family==="book")return [scrollBase(d),motif+scrollBase(d),motif2+scrollBase(d)];
  const base=simpleBase(d,family),variant=pick(["精製","改良","輕量","標準","古式","新製"],seed,5);return [base,motif+base,motif2+base,base+motif,motif+variant+base,motif+motif2+base];
}
function validate(name,family,used){
  const s=text(name),issues=[];
  if(!s)issues.push("空白名稱");
  if(s.length>24)issues.push("名稱過長");
  if(BAD.test(s))issues.push("來源硬拼詞");
  if(SEPARATORS.test(s))issues.push("來源串接符號");
  if(/[A-Za-z_]{3,}/.test(s))issues.push("英文識別字");
  if(/(.)\1\1/.test(s))issues.push("重複字");
  if(used.has(s))issues.push("名稱重複");
  return {ok:issues.length===0,issues};
}
function naturalize(){
  const rows=(DB.items||[]).filter(isItem),used=new Set((DB.items||[]).filter(isEquipment).map(d=>text(d.name)).filter(Boolean)),changes=[],families={};
  for(const d of rows){
    const old=text(d.name),family=familyOf(d);families[family]=(families[family]||0)+1;
    const candidates=candidate(d,family,changes.length);
    let name=candidates.find(x=>validate(x,family,used).ok);
    if(!name){
      const suffix=family==="potion"?"靈藥":family==="food"?"旅人餐":family==="scroll"?"卷軸":family==="rune"?"符文":family==="key"?"鑰匙":family==="tool"?"工具":family==="supply"?"補給":family==="monster_material"?"素材":"道具";
      const fallbackBase=family==="potion"?potionBase(d):simpleBase(d,family);
      const lowTier=tierRank(d?.tier)<=3,base=lowTier?(stripLowTierMotifs(fallbackBase)||suffix):(pick(MOTIFS,String(d.id||""))+suffix);
      name=base;
      const variants=lowTier?["標準","改良","精製","輕量","普通"]:[];
      let n=0;while(used.has(name)&&n<variants.length)name=variants[n++]+base;
      while(used.has(name))name=base+"（"+(n++ +2)+"）";
    }
    used.add(name);
    if(old!==name){
      d.previous_names=Array.isArray(d.previous_names)?d.previous_names:[];
      if(old&&!d.previous_names.includes(old))d.previous_names.push(old);
      d.name=name;changes.push({id:d.id,from:old,to:name});
    }
    d.name_style=REV;
  }
  DB.meta=DB.meta||{};
  DB.meta.item_name_naturalization_revision=REV;
  DB.item_name_naturalization={version:REV,changed:changes.length,total:rows.length,families,rule:"F～C級藥劑、料理、卷軸、工具與素材不加入意象；藥劑依效果、料理依食材、卷軸依功能、工具與素材依實物；B級以上才可使用單一意象；來源組織／地區／流派不進正式名稱",changed_ids:changes.slice(0,32).map(x=>x.id)};
  return DB.item_name_naturalization;
}
function audit(){
  const rows=(DB.items||[]).filter(isItem),seen=new Set(),issues=[];
  for(const d of rows){
    const name=text(d.name);
    if(!name)issues.push("空白物品名稱:"+d.id);
    if(BAD.test(name))issues.push("來源硬拼詞:"+d.id+":"+name);
    if(SEPARATORS.test(name))issues.push("來源串接符號:"+d.id+":"+name);
    if(tierRank(d?.tier)<=3&&LOW_TIER_MOTIFS.some(token=>name.includes(token)))issues.push("C級以下不得使用意象:"+d.id+":"+name);
    if(seen.has(name))issues.push("非裝備名稱重複:"+name);
    seen.add(name);
    if(familyOf(d)==="potion"&&!/(藥水|藥油|靈藥)/.test(name))issues.push("藥劑類型詞異常:"+d.id+":"+name);
  }
  const potionRows=rows.filter(d=>familyOf(d)==="potion");
  return {revision:REV,pass:issues.length===0,issues:[...new Set(issues)],stats:{total:rows.length,unique:seen.size,potions:potionRows.length,changed:DB.item_name_naturalization?.changed||0,families:DB.item_name_naturalization?.families||{}}};
}
const result=naturalize();
DB.name_generator_system=DB.name_generator_system||{};
DB.name_generator_system.item_naturalization_revision=REV;
DB.name_generator_system.item_name_source_policy="F～C級不加入意象；藥劑依效果、料理依主要食材、卷軸依功能、工具／鑰匙／素材保留實物辨識度；B級以上才可使用單一意象；來源名稱不直接串接。";
globalThis.runItemNameNaturalization=naturalize;
globalThis.runItemNameNaturalizationAudit=audit;
globalThis.QUNLU_ITEM_NAME_NATURALIZATION={revision:REV,result,audit:audit()};
if(typeof addEventListener==="function")addEventListener("load",()=>setTimeout(()=>{
  const refreshed=naturalize();
  globalThis.QUNLU_ITEM_NAME_NATURALIZATION={revision:REV,result:refreshed,audit:audit()};
},0));
globalThis.QUNLU_CORE?.registerModule?.("src/item-name-naturalization-v1.js",{domain:"item",revision:REV,release:globalThis.QUNLU_CORE?.release?.()});
})();
