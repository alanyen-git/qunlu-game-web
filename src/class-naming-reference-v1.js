/* 群陸旅誌：戰鬥職業命名與進階參考 CURRENT-1.70.4
 * CLASS-NAMING-REFERENCE-1.0
 * 將使用者提供的傳統奇幻RPG職業樹萃取為三大戰鬥路線、23個職業家族與五階進階語法。
 * 原則：職業名稱描述戰鬥方式／能力來源；官職、爵位、宗教位階、生活職業與種族身份不得直接取代戰鬥職業。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="CLASS-NAMING-REFERENCE-1.0";
const RELEASE="CURRENT-1.70.4";
const TIER_RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const STAGE_BY_TIER=Object.freeze({F:1,E:2,D:3,C:3,B:4,A:4,S:5});
const STAGES=Object.freeze({
  1:Object.freeze({name:"基礎",tiers:["F"],meaning:"可作創角或最低階正式戰鬥職業；名稱應直白描述核心武器或戰鬥方式。"}),
  2:Object.freeze({name:"進階",tiers:["E"],meaning:"由基礎職業延伸的明確戰鬥方向；開始形成裝備、資源或定位差異。"}),
  3:Object.freeze({name:"專精",tiers:["D","C"],meaning:"形成獨立機制、元素、武器或戰術專精；不得只靠華麗稱號區分。"}),
  4:Object.freeze({name:"大師",tiers:["B","A"],meaning:"高階傳承與大師級職業；需有前置職業、師承／組織或特殊資格。"}),
  5:Object.freeze({name:"傳奇",tiers:["S"],meaning:"世界級稀有戰鬥道路；不得只因等級足夠自動取得。"})
});
const TRACKS=Object.freeze({
  physical:Object.freeze({
    label:"物理系",
    families:Object.freeze([
      Object.freeze({id:"warrior_guard",label:"戰士／重裝步兵",roots:["戰士","劍士","決鬥者","重裝兵","盾衛"],weapons:["長劍","大劍","盾牌"],roles:["近戰輸出","前衛防護"]}),
      Object.freeze({id:"berserker_wild",label:"狂戰／荒野戰士",roots:["狂戰士","荒野勇士","巨獸獵手","投斧手","圖騰勇士"],weapons:["斧錘","大劍","投擲武器"],roles:["近戰爆發","破甲"]}),
      Object.freeze({id:"ranger_archery",label:"遊俠／弓術",roots:["獵人","遊俠","追蹤者","神射手","弩手"],weapons:["弓","弩","雙持"],roles:["遠程輸出","偵察"]}),
      Object.freeze({id:"rogue_assassin",label:"盜賊／刺客",roots:["盜賊","刺客","密探","飛刀手","潛行者"],weapons:["匕首","短劍","投擲武器"],roles:["爆發","潛行","情報"]}),
      Object.freeze({id:"monk_brawler",label:"武僧／格鬥",roots:["武僧","格鬥家","拳師","擒拿手","棍僧"],weapons:["徒手","拳套","棍"],roles:["近戰連擊","控制"]}),
      Object.freeze({id:"knight_cavalry",label:"騎士／槍騎",roots:["騎士","槍騎士","重騎士","守護騎士","游擊騎兵"],weapons:["長槍","長劍","盾牌"],roles:["衝鋒","前衛防護"]}),
      Object.freeze({id:"siege_crossbow_tactics",label:"弩手／攻城戰術",roots:["弩手","重弩手","工兵","軍旗手","戰術家"],weapons:["弩","長柄武器"],roles:["遠程壓制","戰術支援"]})
    ])
  }),
  magic:Object.freeze({
    label:"魔法系",
    families:Object.freeze([
      Object.freeze({id:"elemental",label:"元素法術",roots:["元素法師","火焰法師","寒霜法師","雷霆法師","風術士","地術士"],roles:["魔法輸出","控場"]}),
      Object.freeze({id:"sacred",label:"神聖／治療",roots:["牧師","神官","治癒者","驅魔人","祈禱師"],roles:["治療支援","淨化","結界"]}),
      Object.freeze({id:"necromancy_warlock",label:"死靈／邪術",roots:["死靈法師","邪術師","縛靈師","靈魂術士","瘟疫法師"],roles:["召喚","削弱","持續傷害"]}),
      Object.freeze({id:"arcane_illusion",label:"奧術／幻術",roots:["奧術師","符文學者","力場法師","幻術師","夢境術士"],roles:["控場","奧術輸出","幻象"]}),
      Object.freeze({id:"time_astrology",label:"時序／占星",roots:["時序術士","占星術士","星辰法師","空間法師","重力法師"],roles:["控場","預判","位移"]}),
      Object.freeze({id:"nature_shaman",label:"德魯伊／薩滿",roots:["德魯伊","薩滿","森林守護者","元素薩滿","巫醫"],roles:["自然術法","治療支援","召靈"]}),
      Object.freeze({id:"summoning",label:"召喚／契約",roots:["召喚師","契約師","幻獸使","元素召喚者","縛契術士"],roles:["召喚","支援","控場"]}),
      Object.freeze({id:"bardic",label:"吟遊／音律",roots:["吟遊詩人","戰歌吟唱者","音律法師","共振法師","樂師"],roles:["戰術支援","控制","增益"]})
    ])
  }),
  hybrid:Object.freeze({
    label:"魔武雙修",
    families:Object.freeze([
      Object.freeze({id:"spellblade",label:"魔法劍士",roots:["魔劍士","元素劍士","符文劍士","幻影劍士","奧術騎士"],roles:["魔武輸出","近戰施法"]}),
      Object.freeze({id:"paladin",label:"聖騎／神聖武士",roots:["聖騎士","誓約守護者","審判騎士","戰鬥牧師","聖光游俠"],roles:["前衛防護","治療支援","魔武輸出"]}),
      Object.freeze({id:"dark_knight",label:"暗黑騎士／邪刃",roots:["暗黑騎士","死亡騎士","詛咒劍士","暗影刺客","噬魂劍士"],roles:["魔武輸出","削弱","吸取"]}),
      Object.freeze({id:"battlemage_spellbreaker",label:"戰法／破法",roots:["戰鬥法師","破法者","禁魔衛士","武裝秘術師","結界盾衛"],roles:["近戰施法","反制","防護"]}),
      Object.freeze({id:"arcane_archer",label:"魔弓／奧術獵人",roots:["魔弓手","元素箭手","詛咒弩手","奧術獵手","影獵手"],roles:["遠程魔武","追蹤","削弱"]}),
      Object.freeze({id:"shifter_dragonblood",label:"變形／龍脈",roots:["變形者","荒野守衛","龍脈武士","龍鱗衛士","獸血勇士"],roles:["變形戰鬥","近戰強化"]}),
      Object.freeze({id:"elemental_monk",label:"元素武僧",roots:["元素武僧","烈焰拳師","寒霜掌師","氣勁武僧","金剛僧"],roles:["近戰連擊","元素強化"]}),
      Object.freeze({id:"redmage_dancer",label:"雙修法師／戰舞",roots:["戰鬥舞者","舞劍士","元素舞者","赤魔導士","雙修法師"],roles:["魔武支援","快速施法","近戰施法"]})
    ])
  })
});

const AUTHORITY_TOKENS=Object.freeze(["教皇","大主教","大元帥","元帥","國王","王后","王子","公爵","侯爵","伯爵","子爵","男爵","領主","城主","衛隊長","隊長","指揮官","情報頭子"]);
const LIVELIHOOD_EXACT=new Set(["工匠","鎖匠","商人","廚師","鐵匠","裁縫師","藥劑師","農夫","礦工","漁夫","木匠"]);
const FIREARM_TOKENS=Object.freeze(["火槍","手槍","雙槍","重炮","重砲","砲台","炮台","魔導槍","槍砲","銃"]);
const LEGENDARY_TOKENS=Object.freeze(["武神","化身","主宰","帝王","無上","終極","萬法","萬物","世界之王"]);
const SPECIES_IDENTITY_TOKENS=Object.freeze(["狼人","吸血鬼","龍裔","龍血","龍脈","妖精","精靈","魔族"]);
const SAFE_TRACKS=new Set(Object.keys(TRACKS));

function clean(v){return String(v||"").trim()}
function tierOf(v){const t=clean(v).toUpperCase();return TIER_RANK[t]!=null?t:"F"}
function stageForTier(tier){return STAGE_BY_TIER[tierOf(tier)]||1}
function trackOf(v){
  const s=clean(v).toLowerCase();
  if(["physical","物理","物理系"].includes(s))return"physical";
  if(["magic","魔法","魔法系"].includes(s))return"magic";
  if(["hybrid","魔武","魔武雙修"].includes(s))return"hybrid";
  return"physical";
}
function familyById(id){
  for(const [track,data] of Object.entries(TRACKS)){
    const family=data.families.find(x=>x.id===id);
    if(family)return{track,...family};
  }
  return null;
}
function existingNames(){return new Set((DB.combat_classes||[]).map(x=>clean(x?.name)).filter(Boolean))}
function inferFamily(c){
  const name=clean(c?.name),track=trackOf(c?.combat_track||c?.combat_track_label);
  const families=TRACKS[track]?.families||[];
  const scores=families.map(f=>{
    let score=0;
    for(const root of f.roots){
      const stem=root.replace(/大師|宗師|師|士|者|手|家|官|騎士|法師|術士|戰士/g,"");
      if(name.includes(root))score+=5;
      else if(stem.length>=2&&name.includes(stem))score+=2;
    }
    const wg=clean(c?.weapon_group);
    if(wg&&f.weapons?.some(w=>wg.includes(w)||w.includes(wg)))score+=2;
    return [f,score];
  }).sort((a,b)=>b[1]-a[1]);
  return scores[0]?.[1]>0?scores[0][0].id:null;
}
function classNameDescriptor(name){
  const s=clean(name);
  const authority=AUTHORITY_TOKENS.filter(x=>s.includes(x));
  const firearm=FIREARM_TOKENS.filter(x=>s.includes(x));
  const legendary=LEGENDARY_TOKENS.filter(x=>s.includes(x));
  const species=SPECIES_IDENTITY_TOKENS.filter(x=>s.includes(x));
  return {name:s,authority,firearm,legendary,species,livelihood:LIVELIHOOD_EXACT.has(s)};
}
function validateCombatClassName(name,track="physical",tier="F",context={}){
  const s=clean(name),t=tierOf(tier),tr=trackOf(track),issues=[],warnings=[];
  if(!s)issues.push("空白職業名稱");
  if(s.length>12)warnings.push("名稱偏長，建議縮短為可辨識的戰鬥職稱");
  if(/[A-Za-z_]{3,}/.test(s))issues.push("正式中文職業名稱不得含英文識別字");
  const d=classNameDescriptor(s);
  if(d.authority.length&&context.allowAuthorityTitle!==true)issues.push("官職／爵位／宗教位階不可直接當戰鬥職業:"+d.authority.join("、"));
  if(d.livelihood&&context.allowCombatizedLivelihood!==true)issues.push("生活職業不可直接當戰鬥職業");
  if(d.firearm.length&&context.firearmAllowed!==true)issues.push("目前世界觀未開放火器職業:"+d.firearm.join("、"));
  if(d.legendary.length&&stageForTier(t)<5)issues.push("傳奇級稱號僅允許S級正式傳承:"+d.legendary.join("、"));
  if(d.species.length&&context.lineagePrerequisite!==true)warnings.push("含種族／血統詞，需在正式職業資料中設定血統或種族前置");
  if(!context.allowExisting&&existingNames().has(s))issues.push("與CURRENT正式職業名稱重複");
  if(!SAFE_TRACKS.has(tr))issues.push("未知戰鬥系別");
  return {ok:issues.length===0,name:s,track:tr,tier:t,stage:stageForTier(t),stage_name:STAGES[stageForTier(t)].name,issues:[...new Set(issues)],warnings:[...new Set(warnings)],revision:REV};
}
function referenceFor(track="physical",familyId=null,tier="F"){
  const tr=trackOf(track),stage=stageForTier(tier),families=TRACKS[tr]?.families||[];
  const selected=familyId?families.filter(x=>x.id===familyId):families;
  return {track:tr,track_label:TRACKS[tr].label,tier:tierOf(tier),stage,stage_name:STAGES[stage].name,stage_rule:STAGES[stage].meaning,families:selected};
}
function suggestCombatClassName(track="physical",familyId=null,tier="F",context={}){
  const tr=trackOf(track),family=familyById(familyId)||TRACKS[tr].families[0],used=new Set([...(context.usedNames||[]),...existingNames()]);
  const stage=stageForTier(tier);
  const prefixes={
    1:["","見習","初階"],
    2:["","高階","精銳"],
    3:["","專精","戰術","秘傳"],
    4:["宗師","高階","大師級"],
    5:["傳奇","至高"]
  }[stage]||[""];
  for(const root of family.roots){
    for(const prefix of prefixes){
      const candidate=(prefix+root).replace(/^初階(?=戰士|獵人|牧師|法師|遊俠|盜賊|武僧)/,"");
      if(!candidate||used.has(candidate))continue;
      const check=validateCombatClassName(candidate,tr,tier,context);
      if(check.ok)return candidate;
    }
  }
  return null;
}

for(const c of DB.combat_classes||[]){
  c.progression_stage=stageForTier(c.tier);
  c.progression_stage_name=STAGES[c.progression_stage].name;
  if(!c.naming_reference_family)c.naming_reference_family=inferFamily(c);
}

const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-NAMING");
if(ai){
  ai.inputs=Array.from(new Set([...(ai.inputs||[]),"combat class track/tier/progression/family",REV]));
  ai.validations=Array.from(new Set([...(ai.validations||[]),
    "戰鬥職業名稱必須描述戰鬥方式、武器、魔法來源或戰術定位；不得只用官職、爵位、宗教位階或生活職業充當職業。",
    "物理／魔法／魔武雙修三系須與職業資源、技能與裝備專長一致。",
    "五階職業語法映射CURRENT世界階級：F=基礎、E=進階、D/C=專精、B/A=大師、S=傳奇。",
    "B級以上職業名稱若含血統、組織、誓約或特殊傳承詞，必須存在相應前置資格。"
  ]));
}
const gen=(DB.generators||[]).find(x=>x?.id==="GEN-NAME");
if(gen){
  gen.inputs=Array.from(new Set([...(gen.inputs||[]),REV]));
  gen.constraints=Array.from(new Set([...(gen.constraints||[]),
    "戰鬥職業命名須先選系別、職業家族與CURRENT tier，再產生名稱。",
    "教皇、大元帥、領主、衛隊長等身份／官職不可直接生成為戰鬥職業。",
    "火槍、手槍、重砲、砲台等火器職業在世界觀未明確開放前禁止生成。"
  ]));
  gen.combat_class_reference_function="classNamingReference";
  gen.combat_class_validation_function="validateCombatClassName";
  gen.combat_class_suggestion_function="suggestCombatClassName";
}

function audit(){
  const issues=[],warnings=[],ids=new Set(),classes=DB.combat_classes||[];
  for(const c of classes){
    if(!c?.id){issues.push("職業缺少ID:"+(c?.name||"unknown"));continue}
    if(ids.has(c.id))issues.push("職業ID重複:"+c.id);ids.add(c.id);
    if(!SAFE_TRACKS.has(c.combat_track))issues.push("職業系別異常:"+c.id+":"+(c.combat_track||"empty"));
    if(c.progression_stage!==stageForTier(c.tier))issues.push("職業進階階段錯置:"+c.id);
    if(c.selectable&&tierOf(c.tier)!=="F")issues.push("創角可選職業不是F級:"+c.id);
    for(const prev of c.progression_from||[]){
      const p=classes.find(x=>x.id===prev);
      if(!p)issues.push("職業進階來源缺失:"+c.id+"->"+prev);
      else if(TIER_RANK[tierOf(p.tier)]>=TIER_RANK[tierOf(c.tier)])issues.push("職業進階來源未低於目標階級:"+c.id+"<-"+prev);
    }
    if(tierOf(c.tier)!=="F"&&!(c.progression_from||[]).length)warnings.push("尚未建立明確progression_from:"+c.id+"("+c.name+")");
    const d=classNameDescriptor(c.name);
    if(d.authority.length)warnings.push("現有職業名稱含身份／官職詞，建議人工複核:"+c.id+"("+c.name+")");
    if(d.firearm.length)warnings.push("現有職業名稱含火器詞，需確認世界觀:"+c.id+"("+c.name+")");
  }
  const counts={physical:0,magic:0,hybrid:0};
  for(const c of classes)if(counts[c.combat_track]!=null)counts[c.combat_track]++;
  return {
    revision:REV,release:RELEASE,pass:issues.length===0,
    issues:[...new Set(issues)],warnings:[...new Set(warnings)],
    stats:{classes:classes.length,...counts,families:Object.values(TRACKS).reduce((n,x)=>n+x.families.length,0),progression_linked:classes.filter(x=>(x.progression_from||[]).length).length}
  };
}

DB.combat_class_naming_reference={
  version:REV,release:RELEASE,
  source_policy:"使用者提供之經典RPG職業樹只作通用職業語彙、職能與進階結構參考；不以外部作品專屬職業名稱或設定作為CURRENT正史。",
  tracks:TRACKS,stages:STAGES,stage_by_tier:STAGE_BY_TIER,
  naming_rules:[
    "先決定物理／魔法／魔武雙修，再決定職業家族與CURRENT階級。",
    "名稱優先描述武器、戰法、魔法來源、元素、戰術或契約；避免只靠『大師、王、主宰』堆疊強度感。",
    "官職、爵位、宗教位階屬社會身份；若角色同時具有戰鬥職業，兩者分欄記錄。",
    "工匠、鎖匠等生活技能身份維持副職業／生活職業，不直接塞進戰鬥職業樹。",
    "種族、血統、契約、誓約型職業可存在，但必須有明確前置資料，不可只因名稱看起來高階就取得。",
    "火器與近現代機械職業預設封鎖；世界觀未正式建立火藥／魔導槍械科技前不得生成。"
  ],
  authority_tokens:AUTHORITY_TOKENS,
  firearm_tokens:FIREARM_TOKENS,
  legendary_tokens:LEGENDARY_TOKENS,
  save_compatible:true
};
DB.meta=DB.meta||{};
DB.meta.class_naming_reference_revision=REV;

globalThis.classNamingReference=referenceFor;
globalThis.validateCombatClassName=validateCombatClassName;
globalThis.suggestCombatClassName=suggestCombatClassName;
globalThis.runClassNamingReferenceAudit=audit;
globalThis.QUNLU_CLASS_NAMING=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
})();