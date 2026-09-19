/* 群陸旅誌：技能命名與語義參考 CURRENT-1.71.1
 * SKILL-NAMING-REFERENCE-1.0
 * 將使用者提供的大型技能名稱清單萃取為15類核心語彙，並補CURRENT九元素所需2類延伸，共17類技能參照與效果驗證規則。
 * 不直接批量新增換皮技能；新增技能仍必須符合CURRENT技能欄位、階級、職業、元素與實際runtime效果。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="SKILL-NAMING-REFERENCE-1.1";
const RELEASE="CURRENT-1.71.1";
const TIER_RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const VALID_TIERS=new Set(Object.keys(TIER_RANK));
const VALID_KINDS=new Set(["主動","輔助","被動"]);
const VALID_DAMAGE=new Set(["physical","magic","hybrid","heal","cleanse","buff","debuff","passive"]);
const VALID_ELEMENTS=new Set([null,"","光明","黑暗","火","風","水","地","雷","生命","死亡"]);
const ELEMENT_ALIASES=Object.freeze({"光":"光明","暗":"黑暗"});

const FAMILIES=Object.freeze({
  blade:Object.freeze({label:"刃術與劍法",track:"physical",weapons:["長劍","短劍","匕首","武士刀"],schools:["劍技","刀術"],verbs:["斬","刺","劈","挑","格檔","招架","反擊"],motifs:["疾風","殘影","破甲","裂地","破空","十字"]}),
  heavy:Object.freeze({label:"巨兵與鎚斧",track:"physical",weapons:["斧錘","大劍","巨斧","戰鎚","盾牌"],schools:["重武器","戰士","盾技"],verbs:["砸","劈","掃","衝","震","粉碎"],motifs:["碎骨","破甲","震地","崩山","破盾","壓制"]}),
  polearm:Object.freeze({label:"槍矛與長兵",track:"physical",weapons:["長槍","戰戟","長柄武器"],schools:["槍術","長兵"],verbs:["刺","突","掃","挑","投","攔截"],motifs:["裂空","穿雲","破陣","龍牙","槍陣","貫穿"]}),
  archery:Object.freeze({label:"弓術與弩藝",track:"physical",weapons:["弓","弩"],schools:["弓技","弩技"],verbs:["射","狙擊","連射","拋射"],motifs:["精準","鷹眼","穿透","破甲","箭雨","追蹤"]}),
  assassination:Object.freeze({label:"匕首與暗殺",track:"physical",weapons:["匕首","短劍","投擲武器"],schools:["暗殺","潛行"],verbs:["背刺","伏擊","割喉","飛刀","影襲"],motifs:["潛行","毒刃","弱點","煙幕","閃避","斷筋"]}),
  unarmed:Object.freeze({label:"徒手與格鬥",track:"physical",weapons:["徒手","拳套","棍"],schools:["格鬥","武僧"],verbs:["拳","踢","掌","摔","擒拿","肘擊"],motifs:["連擊","卸力","破防","震波","護體","點穴"]}),
  defense:Object.freeze({label:"防禦與戰術架式",track:"physical",weapons:["盾牌","任意"],schools:["盾技","戰術"],verbs:["格檔","招架","援護","閃避","指揮"],motifs:["姿態","架式","壁壘","陣型","殿後","迎擊"]}),
  rage:Object.freeze({label:"野性與怒氣",track:"physical",weapons:["斧錘","大劍","徒手"],schools:["狂戰","野性"],verbs:["狂暴","怒吼","衝鋒","撕裂","踐踏"],motifs:["怒火","嗜血","不屈","荒野","巨力","死戰"]}),
  elemental_general:Object.freeze({label:"泛元素術式",track:"magic",schools:["元素","元素法術"],verbs:["元素","元素彈","元素衝擊","元素洪流"],motifs:["共鳴","結界","爆發","引導","融合"]}),
  sacred_life:Object.freeze({label:"神聖與生命",track:"magic",elements:["光明","生命"],schools:["神聖","治療","生命"],verbs:["聖光","治癒","祝福","淨化","祈禱"],motifs:["護佑","結界","恢復","裁決","復甦","庇護"]}),
  fire:Object.freeze({label:"火焰與熱能",track:"magic",element:"火",schools:["火焰"],verbs:["火球","爆炎","烈焰","熔岩","灼熱"],motifs:["飛彈","風暴","新星","護盾","結界","烙印"]}),
  frost:Object.freeze({label:"冰霜與寒氣",track:"magic",element:"水",schools:["冰霜"],verbs:["冰箭","寒冰","霜凍","冰晶","冰封"],motifs:["射線","風暴","新星","護盾","地刺","枷鎖"]}),
  storm:Object.freeze({label:"雷霆與疾風",track:"magic",elements:["雷","風"],schools:["雷電","風"],verbs:["雷擊","閃電","風刃","旋風","真空"],motifs:["風暴","射線","護盾","鎖鏈","新星","結界"]}),
  earth_nature:Object.freeze({label:"大地與植物",track:"magic",elements:["地","生命"],schools:["大地","自然"],verbs:["地刺","落石","藤蔓","棘刺","樹根"],motifs:["護甲","石牆","流沙","滋養","囚籠","復甦"]}),
  shadow_necro:Object.freeze({label:"暗影、死靈與詛咒",track:"magic",elements:["黑暗","死亡"],schools:["暗影","死靈","詛咒"],verbs:["暗影","骨矛","召喚","詛咒","汲取"],motifs:["腐朽","瘟疫","靈魂","怨靈","枷鎖","凋零"]}),
  mind_arcane:Object.freeze({label:"心靈、幻術與奧術",track:"magic",schools:["奧術","幻術","心靈","時空"],verbs:["奧術","幻影","念力","心靈","符文"],motifs:["飛彈","衝擊","護盾","反制","鏡像","迷宮"]}),
  spellblade:Object.freeze({label:"魔武雙修與元素刃擊",track:"hybrid",weapons:["長劍","武士刀","長槍","弓","徒手"],schools:["魔劍","符文","元素武技"],verbs:["斬","刺","拳","箭","槍"],motifs:["元素附刃","烈焰","寒冰","雷霆","疾風","奧術","暗影"]})
});

const GRAND_TOKENS=Object.freeze({
  "終極":"A","極致":"A","萬法":"A","萬刃":"A","萬拳":"A","萬箭":"A","萬槍":"A","萬火":"A","萬冰":"A",
  "主宰":"S","毀滅":"S","無雙":"B","裁決":"B","降世":"B","天幕":"B","絕對零度":"B"
});
const EXTERNAL_OR_BAD_TOKENS=Object.freeze(["升龍拳","strike","Strike","STRIKE"]);
const EFFECT_RULES=Object.freeze([
  {token:"破甲",ok:s=>Number(s?.armor_pen_pct||s?.level_bonuses?.["10"]?.armor_pen_pct||0)>0},
  {token:"穿甲",ok:s=>Number(s?.armor_pen_pct||s?.level_bonuses?.["10"]?.armor_pen_pct||0)>0},
  {token:"破法",ok:s=>Number(s?.magic_pen_pct||s?.level_bonuses?.["10"]?.magic_pen_pct||0)>0},
  {token:"麻痺",ok:s=>s?.status==="paralysis"||Number(s?.paralysis_chance||0)>0},
  {token:"中毒",ok:s=>s?.status==="poison"||Number(s?.poison_chance||0)>0},
  {token:"毒",ok:s=>s?.status==="poison"||/毒/.test(String(s?.effect_text||""))||Number(s?.poison_chance||0)>0},
  {token:"燃燒",ok:s=>s?.status==="burn"},
  {token:"冰封",ok:s=>["freeze","slow"].includes(s?.status)||s?.element==="水"},
  {token:"定身",ok:s=>["root","bind","stun"].includes(s?.status)},
  {token:"眩暈",ok:s=>s?.status==="stun"},
  {token:"恐懼",ok:s=>s?.status==="fear"},
  {token:"魅惑",ok:s=>s?.status==="charm"},
  {token:"沉默",ok:s=>s?.status==="silence"},
  {token:"混亂",ok:s=>s?.status==="confusion"},
  {token:"石化",ok:s=>s?.status==="petrify"},
  {token:"治癒",ok:s=>s?.damage_type==="heal"||Number(s?.healingPower||0)>0},
  {token:"療癒",ok:s=>s?.damage_type==="heal"||Number(s?.healingPower||0)>0},
  {token:"召喚",ok:s=>!!s?.summon_id||!!s?.summon_profile||/召喚/.test(String(s?.effect_text||s?.desc||""))},
  {token:"吸血",ok:s=>Number(s?.lifeSteal||s?.life_steal||0)>0||/吸血/.test(String(s?.effect_text||s?.desc||""))},
  {token:"汲取",ok:s=>Number(s?.lifeSteal||s?.life_steal||s?.manaSteal||s?.mana_steal||0)>0||/汲取/.test(String(s?.effect_text||s?.desc||""))},
  {token:"反射",ok:s=>Number(s?.reflectPct||s?.reflect_pct||0)>0||/反射/.test(String(s?.effect_text||s?.desc||""))},
  {token:"隱形",ok:s=>s?.invisibility===true||Number(s?.stealth||0)>0||/隱形/.test(String(s?.effect_text||s?.desc||""))}
]);

function clean(v){return String(v||"").trim()}
function canonicalElement(v){
  if(v==null)return null;
  const t=clean(v);if(!t)return "";
  return ELEMENT_ALIASES[t]||t
}
function normalizeElementAliases(){
  let normalized=0,saveChanged=false;
  const apply=s=>{
    if(!s||s.element==null)return;
    const before=s.element,after=canonicalElement(before);
    if(after!==before){s.element=after;normalized++;return true}
    return false
  };
  for(const pool of Object.values(DB.skill_pools||{}))for(const s of pool||[])apply(s);
  for(const s of DB.shared_skills||[])apply(s);
  if(typeof G!=="undefined"&&G?.character?.skills){
    for(const s of G.character.skills||[])if(apply(s))saveChanged=true;
    if(saveChanged&&typeof persist==="function")persist()
  }
  return normalized
}
const NORMALIZED_ELEMENT_ALIAS_COUNT=normalizeElementAliases();
function tierOf(v){const t=clean(v).toUpperCase();return VALID_TIERS.has(t)?t:"F"}
function allSkills(){
  const out=[];
  for(const [classId,pool] of Object.entries(DB.skill_pools||{}))for(const s of pool||[])out.push(Object.assign({classId},s));
  for(const s of DB.shared_skills||[])out.push(Object.assign({classId:"shared"},s));
  return out;
}
function skillKey(s){return clean(s?.canonical_skill_id||s?.id||[s?.name,s?.tier,s?.source_class].join("|"))}
function inferFamily(skill={}){
  const s=[skill.name,skill.school,skill.family,(skill.weapon_requirements||[]).join(" "),skill.element].filter(Boolean).join(" ");
  const ordered=[
    ["spellblade",/魔劍|附刃|元素.*(?:斬|刺|拳|箭|槍)|(?:烈焰|寒冰|雷霆|疾風).*(?:斬|刺|拳|箭|槍)/],
    ["blade",/劍|刀|斬|刃|居合|招架/],
    ["heavy",/巨斧|戰斧|重斧|巨鎚|重鎚|戰鎚|碎骨|崩山|重劈/],
    ["polearm",/長槍|長矛|戰戟|槍術|投槍|標槍|槍陣/],
    ["archery",/弓|弩|箭|矢|射擊|狙擊/],
    ["assassination",/匕首|暗殺|背刺|潛行|飛刀|煙幕|毒刃/],
    ["unarmed",/徒手|拳|掌|踢|擒拿|摔|肘|武僧/],
    ["defense",/盾|防禦|格檔|招架|援護|陣型|姿態|架式|壁壘/],
    ["rage",/狂暴|怒氣|怒火|野性|嗜血|怒吼/],
    ["sacred_life",/聖光|神聖|治癒|療癒|祝福|祈禱|淨化|生命|復甦|庇護/],
    ["elemental_general",/元素|星芒|星光|星軌|星落|占星/],
    ["fire",/火|炎|熔岩|灰燼/],
    ["frost",/冰|霜|寒/],
    ["storm",/雷|電|風|真空|龍捲/],
    ["earth_nature",/地|岩|石|藤|棘|樹|自然|森林/],
    ["shadow_necro",/暗影|死靈|骨|詛咒|靈魂|瘟疫|死亡|深淵|怨靈/],
    ["mind_arcane",/奧術|秘術|幻術|心靈|念力|符文|夢|時空|鏡像/]
  ];
  const hit=ordered.find(x=>x[1].test(s));
  return hit?hit[0]:null;
}
function validateSkillName(name,tier="F",context={}){
  const s=clean(name),t=tierOf(tier),issues=[],warnings=[];
  if(!s)issues.push("空白技能名稱");
  if(s.length>16)warnings.push("技能名稱偏長");
  if(/[A-Za-z_]{3,}/.test(s))issues.push("中文正式技能名稱不得混入英文識別字");
  for(const token of EXTERNAL_OR_BAD_TOKENS)if(s.includes(token))issues.push("不納入CURRENT生成詞庫:"+token);
  for(const [token,minTier] of Object.entries(GRAND_TOKENS))if(s.includes(token)&&TIER_RANK[t]<TIER_RANK[minTier])issues.push(token+"至少需"+minTier+"級");
  const model=context.skill||context;
  for(const rule of EFFECT_RULES)if(s.includes(rule.token)&&!rule.ok(model))issues.push(rule.token+"名稱缺少對應實裝效果");
  const modelElement=canonicalElement(model.element);
  if(/(?:火|炎|熔岩)/.test(s)&&modelElement&&modelElement!=="火")warnings.push("名稱為火系但element不是火");
  if(/(?:冰|霜|寒)/.test(s)&&modelElement&&modelElement!=="水")warnings.push("名稱為冰霜系但element不是水");
  if(/(?:雷|電)/.test(s)&&modelElement&&modelElement!=="雷")warnings.push("名稱為雷系但element不是雷");
  if(/(?:疾風|狂風|旋風|龍捲|真空|風刃|風切|風行|風之|風輪|風壁)/.test(s)&&modelElement&&modelElement!=="風")warnings.push("名稱為風系但element不是風");
  if(context.allowExisting!==true&&allSkills().some(x=>clean(x.name)===s&&tierOf(x.tier)===t))warnings.push("CURRENT已有同名同階技能，新增前應先查重");
  return {ok:issues.length===0,name:s,tier:t,issues:[...new Set(issues)],warnings:[...new Set(warnings)],revision:REV};
}
function referenceFor(familyId,tier="F"){
  const id=FAMILIES[familyId]?familyId:"blade",f=FAMILIES[id];
  return Object.assign({family_id:id,tier:tierOf(tier)},f);
}
function suggestSkillName(familyId,tier="F",context={}){
  const f=FAMILIES[familyId]||FAMILIES.blade,t=tierOf(tier),used=new Set(allSkills().map(x=>clean(x.name)));
  const verbs=f.verbs||[],motifs=f.motifs||[],forms=[];
  if(TIER_RANK[t]<=1){
    for(const v of verbs){forms.push(v,v+"擊",v+"術");}
  }else{
    for(const m of motifs)for(const v of verbs)forms.push(m+v);
  }
  for(const raw of forms){
    const name=raw.replace(/擊擊$/,"擊").replace(/術術$/,"術");
    if(!name||used.has(name))continue;
    const check=validateSkillName(name,t,Object.assign({},context,{allowExisting:true}));
    if(check.ok)return name;
  }
  return null;
}
function audit(){
  const issues=[],warnings=[],skills=allSkills(),seenCanonical=new Map(),nameTier=new Map();
  for(const s of skills){
    if(!VALID_TIERS.has(clean(s.tier).toUpperCase()))issues.push("技能階級無效:"+skillKey(s));
    if(!VALID_KINDS.has(s.kind||s.display_type))issues.push("技能類型無效:"+skillKey(s));
    if(s.damage_type&&!VALID_DAMAGE.has(s.damage_type))issues.push("技能damage_type無效:"+skillKey(s)+":"+s.damage_type);
    if(!VALID_ELEMENTS.has(canonicalElement(s.element??null)))issues.push("技能元素無效:"+skillKey(s)+":"+s.element);
    if(s.skill_level_cap!=null&&Number(s.skill_level_cap)!==10)issues.push("技能等級上限不是10:"+skillKey(s));
    const cid=clean(s.canonical_skill_id);
    if(cid){
      const prev=seenCanonical.get(cid);
      if(prev&&clean(prev.name)!==clean(s.name))issues.push("canonical_skill_id名稱衝突:"+cid);
      else seenCanonical.set(cid,s);
    }
    const nt=clean(s.name)+"|"+tierOf(s.tier);
    nameTier.set(nt,(nameTier.get(nt)||0)+1);
    if(!inferFamily(s))warnings.push("技能尚未歸入參照家族:"+skillKey(s)+"("+s.name+")");
    const checked=validateSkillName(s.name,s.tier,{skill:s,allowExisting:true});
    for(const w of checked.warnings)warnings.push(skillKey(s)+":"+w);
    for(const e of checked.issues){
      if(/英文識別字|不納入CURRENT/.test(e))issues.push(skillKey(s)+":"+e);
      else warnings.push(skillKey(s)+":"+e);
    }
  }
  const duplicateNameTier=[...nameTier.entries()].filter(x=>x[1]>1).length;
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],stats:{skills:skills.length,families:Object.keys(FAMILIES).length,duplicate_name_tier_groups:duplicateNameTier,canonical_ids:seenCanonical.size}};
}

DB.skill_naming_reference={
  version:REV,release:RELEASE,
  source_policy:"使用者提供的大型技能清單萃取15類核心語彙；另依CURRENT九元素補泛元素與神聖／生命2類。僅作動作結構與效果語義參考，不批量建立換皮技能。",
  families:FAMILIES,
  rules:[
    "技能名稱必須對應實際技能資料；破甲、麻痺、中毒、治癒、召喚、汲取、反射、隱形等詞不可只作裝飾。",
    "F/E級優先使用斬、刺、射擊、格檔、火球、冰箭等直觀名稱；高階才逐步使用無雙、裁決、萬法、主宰等稱號。",
    "同名同階技能新增前先查canonical_skill_id、技能家族與實際效果，避免只改名稱的重複技能。",
    "元素名稱須與CURRENT九元素一致：光明、黑暗、火、風、水、地、雷、生命、死亡；舊資料光／暗會自動正規化為光明／黑暗，冰霜歸水元素。",
    "主動／輔助／被動、物理／魔法／混合／治療／淨化／增益／減益必須由資料欄位決定，不由名稱猜測。",
    "技能等級上限維持10；Lv6與Lv10里程碑由既有技能成長系統管理。",
    "明顯外部作品招式或混入英文殘字的候選名稱不得加入CURRENT生成詞庫。"
  ],
  grand_tokens:GRAND_TOKENS,
  blocked_tokens:EXTERNAL_OR_BAD_TOKENS,
  element_aliases:ELEMENT_ALIASES,
  normalized_element_alias_count:NORMALIZED_ELEMENT_ALIAS_COUNT,
  save_compatible:true
};
DB.meta=DB.meta||{};
DB.meta.skill_naming_reference_revision=REV;

const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-SKILL");
if(ai){
  ai.responsibility="初始2技能、最多10技能、超額需遺忘；新增／學習技能須先查重並驗證名稱、技能家族、階級與實裝效果一致。";
  ai.inputs=Array.from(new Set([...(ai.inputs||[]),"skill family/name/tier/kind/damage/element/status/effect",REV]));
  ai.validations=Array.from(new Set([...(ai.validations||[]),
    "技能名稱功能詞必須對應實裝效果。",
    "元素技能名稱必須符合九元素資料。",
    "不得新增只有名稱不同、機制高度重複的換皮技能。",
    "高階稱號不得下放至低階技能。",
    "外部作品專屬招式與英文殘字不得進入正式技能名稱。"
  ]));
  ai.naming_reference_function="skillNamingReference";
  ai.naming_validation_function="validateSkillName";
}
const gen=(DB.generators||[]).find(x=>x?.id==="GEN-NAME");
if(gen){
  gen.inputs=Array.from(new Set([...(gen.inputs||[]),REV]));
  gen.constraints=Array.from(new Set([...(gen.constraints||[]),
    "技能命名先指定技能家族、tier、kind、damage_type、element與實裝效果。",
    "技能名中的破甲、控制、召喚、治療、汲取等語義必須通過資料驗證。"
  ]));
  gen.skill_reference_function="skillNamingReference";
  gen.skill_validation_function="validateSkillName";
  gen.skill_suggestion_function="suggestSkillName";
}

globalThis.skillNamingReference=referenceFor;
globalThis.validateSkillName=validateSkillName;
globalThis.suggestSkillName=suggestSkillName;
globalThis.runSkillNamingReferenceAudit=audit;
globalThis.QUNLU_SKILL_NAMING=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
})();