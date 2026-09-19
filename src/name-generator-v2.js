/* 群陸旅誌：統一名稱生成器 CURRENT-1.70.6
 * NAME-GENERATOR-2.0
 * 類型先行、正史查重、專用驗證、失敗不硬塞固定 fallback。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="NAME-GENERATOR-2.0", RELEASE="CURRENT-1.70.6";
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const ALIAS={person:"person",npc:"person",character:"person",settlement:"settlement",town:"settlement",city:"settlement",village:"settlement",location:"location",wild:"location",dungeon:"location",organization:"organization",org:"organization",faction:"organization",guild:"organization",discipline:"discipline",school:"discipline",style:"discipline",monster:"monster",creature:"monster",quest:"quest",mission:"quest",skill:"skill",ability:"skill",technique:"skill",equipment:"equipment",gear:"equipment",weapon:"equipment",armor:"equipment",item:"item",combat_class:"class",class:"class",job:"class"};
const MAX={person:12,settlement:14,location:18,organization:20,discipline:18,monster:18,quest:26,skill:16,equipment:24,item:24,class:12,generic:20};
const MODERN=["專案","模組","系統AI","人工智慧","研究所","處理器","伺服器","API","CPU","GPU","TODO","TBD","TEMP","測試名稱","暫定名稱","未命名"];
const BLOCKED=["升龍拳","strike","Strike","STRIKE"];
const GRAND={"無雙":"B","裁決":"B","降世":"B","天幕":"B","絕對零度":"B","終極":"A","極致":"A","萬法":"A","萬刃":"A","萬拳":"A","萬箭":"A","萬槍":"A","萬火":"A","萬冰":"A","主宰":"S","毀滅":"S"};
const SPECIALIZED={skill:{validator:"validateSkillName",generator:"suggestSkillName"},equipment:{validator:"validateEquipmentName",generator:"generateEquipmentName"},class:{validator:"validateCombatClassName",generator:"suggestCombatClassName"}};

const clean=v=>String(v==null?"":v).normalize("NFKC").trim();
const typeOf=v=>ALIAS[clean(v).toLowerCase()]||"generic";
const tierOf=v=>Object.prototype.hasOwnProperty.call(TIER,clean(v).toUpperCase())?clean(v).toUpperCase():"F";
const list=v=>Array.isArray(v)?v.map(clean).filter(Boolean):(v?[clean(v)].filter(Boolean):[]);
const choose=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
const uniq=a=>[...new Set((a||[]).map(clean).filter(Boolean))];
const key=v=>clean(v).replace(/[\s·・"'’‘“”「」『』()（）[\]【】{}<>《》_\-—–/／\\]/g,"").toLowerCase();
const protectedNames=()=>new Set([...(globalThis.QUNLU_NAMING_PROTECTED_NAMES||[]),"雷煌流","雷鳴流","柳生惟心流","名品武士刀「闇夜」"]);
const names=rows=>(rows||[]).map(x=>clean(x&&x.name)).filter(Boolean);
function allSkills(){const out=[];for(const p of Object.values(DB.skill_pools||{}))for(const s of p||[])out.push(s);for(const s of DB.shared_skills||[])out.push(s);return out}
function namesFor(type){
 const t=typeOf(type);
 if(t==="skill")return names(allSkills());
 if(t==="equipment"||t==="item")return names(DB.items);
 if(t==="class")return names(DB.combat_classes);
 if(t==="person")return uniq([...names(DB.npcs),...names(DB.npc_profiles),...names(DB.party_member_templates),...names(DB.s_tier_combatants),...names(DB.eastern_sword_figures)]);
 if(t==="settlement"||t==="location")return uniq([...names(DB.locations),...names(DB.world_regions),...names(DB.political_entities)]);
 if(t==="organization")return uniq([...names(DB.world_organizations),...names(DB.faith_entities),...names(DB.regional_powers)]);
 if(t==="discipline")return names(DB.discipline_factions);
 if(t==="monster")return uniq([...names(DB.monsters),...names(DB.domestic_creatures),...names(DB.companion_species)]);
 if(t==="quest")return names(DB.quest_templates);
 return uniq([...names(DB.locations),...names(DB.world_regions),...names(DB.political_entities),...names(DB.world_organizations),...names(DB.discipline_factions),...names(DB.combat_classes),...names(DB.monsters),...names(DB.items),...names(DB.quest_templates),...names(allSkills())]);
}
function usedSet(type,context={}){return new Set([...namesFor(type),...list(context.usedNames)].map(key).filter(Boolean))}
function cultureProfile(c){return DB.naming_ai?.culture_sound_profiles?.[c]||DB.naming_ai?.culture_sound_profiles?.asdale_west||{}}
function mergeResult(dst,res,prefix){if(!res)return;for(const x of res.issues||[])dst.issues.push(prefix+x);for(const x of res.warnings||[])dst.warnings.push(prefix+x)}
function weakSkillKey(v){return key(v).replace(/^(初階|進階|高階|強化|精準|迅捷|疾速|狂暴|極限|終極)+/,"").replace(/(強化|改|式)$/,"")}
function nearSkill(name){const k=weakSkillKey(name);return k?allSkills().find(s=>clean(s?.name)!==clean(name)&&weakSkillKey(s?.name)===k):null}

function validateGeneratedNameV2(name,type="person",culture="asdale_west",context={}){
 const t=typeOf(type),s=clean(name),tier=tierOf(context.tier||context.skill?.tier||context.item?.tier||context.classData?.tier||"F");
 const r={ok:true,name:s,type:t,culture:clean(culture)||"asdale_west",tier,issues:[],warnings:[],revision:REV};
 if(!s)r.issues.push("空白名稱");
 const max=MAX[t]||MAX.generic;if([...s].length>max)r.issues.push("名稱過長:"+[...s].length+"/"+max);
 if(/[A-Za-z_]{3,}/.test(s))r.issues.push("正式中文名稱不得含英文識別字");
 if(/[<>{}[\]\\=]/.test(s))r.issues.push("名稱含程式／標記符號");
 if(/[\/／]/.test(s))r.issues.push("名稱不得使用斜線並列多個候選");
 for(const x of MODERN)if(s.includes(x))r.issues.push("含不合世界觀的現代／占位術語:"+x);
 for(const x of BLOCKED)if(s.includes(x))r.issues.push("不納入CURRENT生成詞庫:"+x);
 if(/(.)\1\1/.test(s))r.issues.push("出現三連重字");
 if(/(城城|鎮鎮|村村|港港|堡堡|塔塔|會會|團團|盟盟|術術|擊擊|斬斬|坑坑|熔熔|地下地牢|要塞城|之門城)/.test(s))r.issues.push("名稱存在重複詞或重複後綴");
 if(t==="person"){
   if(/(.)\1/.test(s))r.issues.push("人物名稱出現連續重字");
   if([...s].length>=3&&new Set([...s]).size<2)r.issues.push("人物音節過度重複");
   if([...s].length>=3&&s[0]===s[s.length-1])r.warnings.push("人物名稱首尾音節相同");
 }
 if(["skill","equipment","class"].includes(t))for(const [token,min] of Object.entries(GRAND))if(s.includes(token)&&TIER[tier]<TIER[min])r.issues.push(token+"至少需"+min+"級");
 if(t==="discipline"&&/流$/.test(s)&&!protectedNames().has(s)&&context.easternTradition!==true)r.issues.push("新流派使用『○○流』需明確標示easternTradition；一般流派改用劍術／戰技／學派");
 if(context.allowExisting!==true&&key(s)&&usedSet(t,context).has(key(s)))r.issues.push("與CURRENT同類正式名稱重複");
 if(protectedNames().has(s)&&context.allowExisting!==true)r.issues.push("名稱屬於鎖定正史名稱，不可由生成器重建或覆寫");
 if(t==="skill"){
   const near=nearSkill(s);if(near){const msg="與既有技能『"+near.name+"』僅有弱修飾差異，新增前需比較實際機制";context.rejectNearDuplicate===true?r.issues.push(msg):r.warnings.push(msg)}
   if(typeof globalThis.validateSkillName==="function")mergeResult(r,globalThis.validateSkillName(s,tier,{...context,skill:context.skill||context,allowExisting:context.allowExisting===true}),"技能:");
 }else if(t==="equipment"&&typeof globalThis.validateEquipmentName==="function"){
   mergeResult(r,globalThis.validateEquipmentName(s,context.category||context.catalogGroup||"武器",tier,{...context,allowExisting:context.allowExisting===true}),"裝備:");
 }else if(t==="class"&&typeof globalThis.validateCombatClassName==="function"){
   mergeResult(r,globalThis.validateCombatClassName(s,context.track||"physical",tier,{...context,allowExisting:context.allowExisting===true}),"職業:");
 }
 r.issues=[...new Set(r.issues)];r.warnings=[...new Set(r.warnings)];r.ok=r.issues.length===0;return r;
}

function join(a,b){let x=clean(a),y=clean(b);if(!x)return y;if(!y)return x;if(x.endsWith(y))return x;if(x.at(-1)===y[0])y=y.slice(1);return x+y}
function roots(context,p){return uniq([...list(context.roots),...list(context.themeRoots),...list(context.regionRoots),...list(context.terrainRoots),...list(p.place_roots)])}
function personCandidate(culture,context,attempt){
 const p=cultureProfile(culture),parts=p.person_parts||{},a=list(parts.start),m=list(parts.middle),z=list(parts.end);let out="";
 if(a.length&&z.length)out=choose(a)+((m.length&&attempt%4!==0)?choose(m):"")+choose(z);else{const syl=list(p.syllables).length?list(p.syllables):["阿","洛","維","爾","恩","德","薩","伊","蘭","菲"];const n=attempt%3===0?3:2;for(let i=0;i<n;i++)out+=choose(syl)}
 if(context.familyName&&context.includeFamily===true)out=clean(context.familyName)+"・"+out;return out;
}
function settlementSuffix(context={}){
 const k=clean(context.kind||context.locationKind||context.settlementKind).toLowerCase(),map={capital:["王都","都城","城"],city:["城"],town:["鎮","城"],village:["村","莊"],port:["港","灣港"],fortress:["要塞","堡"],mine:["礦鎮","礦坑"],forest:["林","森"],wetland:["沼","濕地"],mountain:["嶺","山"],plain:["原","平原"],coast:["灣","岬"],ruin:["遺跡","古墟"],dungeon:["洞窟","地窖","古堡","遺跡"],wild:["谷","林","原","丘","沼","灣","嶺"]};return choose(map[k]||["城","鎮","村","港","堡"]);
}
function settlementCandidate(type,culture,context){const p=cultureProfile(culture),rs=roots(context,p),root=choose(rs.length?rs:["河望","石橋","銀穗","晨潮","霧杉","赤岩","白鐘","翠枝","霜壁","星灣"]),suffix=settlementSuffix({...context,kind:type==="location"?(context.kind||context.locationKind||"wild"):(context.kind||context.settlementKind)});return join(root,suffix)}
function organizationCandidate(culture,context){const p=cultureProfile(culture),rs=roots(context,p),root=choose(rs.length?rs:["白塔","銀穗","赤岩","晨潮","灰門","翠枝","霜誓","星紋","鐵旗"]),cat=clean(context.category||context.kind).toLowerCase();let ss=["公會","協會","同盟","議會","兄弟會"];if(/church|faith|relig|教會|宗教/.test(cat))ss=["教會","修會","聖堂議會"];else if(/knight|military|guard|騎士|軍/.test(cat))ss=["騎士團","守備團","戰團"];else if(/merchant|trade|商/.test(cat))ss=["商會","行商同盟","商路公會"];else if(/academy|mage|學院|法師/.test(cat))ss=["學院","法師議會","術法公會"];return join(root,choose(ss))}
function disciplineCandidate(culture,context){const p=cultureProfile(culture),rs=uniq([...roots(context,p),...list(context.motifs)]),root=choose(rs.length?rs:["疾風","磐石","霜華","鏡心","斷浪","赤蓮","影柳","雷鳴","星弦"]),weapon=clean(context.weapon||context.weaponGroup),track=clean(context.track).toLowerCase();let ss=["戰技","武技學派","戰法"];if(/劍|刀/.test(weapon))ss=["劍術","刀術","劍學派","護手劍術"];else if(/槍|矛|戟/.test(weapon))ss=["槍術","長兵戰技","槍陣戰法"];else if(/弓|弩/.test(weapon))ss=["弓術","射術學派","獵射戰技"];else if(/拳|徒手|格鬥/.test(weapon))ss=["格鬥術","拳術","武鬥戰技"];if(/magic|魔法|hybrid|魔武/.test(track))ss=["術法","秘術學派","元素戰技","符文學派"];if(context.easternTradition===true&&context.preferRyu===true)ss.push("流");return join(root,choose(ss))}
function monsterCandidate(context){const e=clean(context.element),h=clean(context.habitat||context.terrain),trait=clean(context.trait||context.feature),map={火:["熾","燼","炎","赤焰"],水:["霜","潮","冰晶","深泉"],風:["疾風","雲","裂風","蒼翼"],地:["岩","玄石","裂地","砂脊"],雷:["雷角","電紋","紫電","鳴雷"],生命:["翠葉","森靈","繁枝","生息"],死亡:["枯骨","冥","灰墓","亡息"],光明:["聖輝","曙光","白耀"],黑暗:["黯影","夜紋","黑霧"]};const head=trait||choose(map[e]||[])||h||choose(["岩脊","霧林","荒原","河谷","洞窟"]),species=clean(context.speciesName||context.species||context.familyName||context.family)||choose(["狼","熊","蜥","蛛","蠍","鷹","獸"]);return join(head,species)}
function questCandidate(context){const loc=clean(context.locationName||context.regionName),target=clean(context.targetName||context.objectiveName),action=clean(context.action||context.questType)||"調查";if(loc&&target)return loc+"・"+target+action;if(target)return target+action;if(loc)return loc+"・"+action+"委託";return null}
function itemCandidate(context){const base=clean(context.material||context.regionName||context.provenance)||choose(["旅人","河谷","銀穗","赤岩","晨潮"]),purpose=clean(context.purpose||context.effectName),kind=clean(context.itemType||context.category)||"道具";return base+purpose+kind}
function specializedCandidate(type,context){const tier=tierOf(context.tier||"F");if(type==="skill"&&typeof globalThis.suggestSkillName==="function")return globalThis.suggestSkillName(context.familyId||context.family||"blade",tier,{...context,rejectNearDuplicate:true});if(type==="equipment"&&typeof globalThis.generateEquipmentName==="function")return globalThis.generateEquipmentName(context.category||context.catalogGroup||"武器",tier,context);if(type==="class"&&typeof globalThis.suggestCombatClassName==="function")return globalThis.suggestCombatClassName(context.track||"physical",context.familyId||context.family||null,tier,context);return null}
function generateWorldNameV2(type="person",culture="asdale_west",context={}){
 const t=typeOf(type),used=usedSet(t,context),tries=Math.max(20,Math.min(160,Number(context.maxAttempts)||80));
 for(let attempt=0;attempt<tries;attempt++){
   let c=SPECIALIZED[t]?specializedCandidate(t,context):t==="person"?personCandidate(culture,context,attempt):(t==="settlement"||t==="location")?settlementCandidate(t,culture,context):t==="organization"?organizationCandidate(culture,context):t==="discipline"?disciplineCandidate(culture,context):t==="monster"?monsterCandidate(context):t==="quest"?questCandidate(context):t==="item"?itemCandidate(context):personCandidate(culture,context,attempt);
   c=clean(c);if(!c||used.has(key(c)))continue;const checked=validateGeneratedNameV2(c,t,culture,{...context,rejectNearDuplicate:t==="skill"});if(checked.ok)return c;
 }
 if(context.fallback){const f=clean(context.fallback),checked=validateGeneratedNameV2(f,t,culture,context);if(checked.ok)return f}return null;
}
function reference(type="person",context={}){const t=typeOf(type);return{revision:REV,release:RELEASE,type:t,tier:tierOf(context.tier||"F"),max_length:MAX[t]||MAX.generic,protected_names:[...protectedNames()],specialized:SPECIALIZED[t]||null,rules:["先指定內容類型，再套用該類型文法與驗證器。","正式名稱先查CURRENT同類名稱；不得以空格、符號或弱修飾詞規避查重。","技能、裝備、戰鬥職業必須通過各自專用參照與效果／階級驗證。","人物、聚落、組織、流派、怪物與委託使用不同組合規則。","生成失敗回傳null；禁止固定人物名或固定聚落名fallback。","正史鎖定名稱只能引用，不能由生成器重新建立或覆寫。"]}}
function audit(){const issues=[],warnings=[];for(const fn of ["validateSkillName","suggestSkillName","validateEquipmentName","generateEquipmentName","validateCombatClassName","suggestCombatClassName"])if(typeof globalThis[fn]!=="function")issues.push("專用命名函式缺失:"+fn);for(const [name,type,label] of [["測試API","person","英文／現代術語"],["熔熔城","settlement","重複詞"],["未命名公會","organization","占位名稱"]])if(validateGeneratedNameV2(name,type,"asdale_west",{allowExisting:true}).ok)issues.push("驗證器未攔截:"+label);if(validateGeneratedNameV2("萬火焚天極致","skill","asdale_west",{tier:"F",allowExisting:true,skill:{tier:"F",element:"火",kind:"主動",damage_type:"magic"}}).ok)issues.push("低階技能未攔截高階稱號");if(validateGeneratedNameV2("雷煌流","discipline","asdale_west",{}).ok)issues.push("正史鎖定名稱未阻止重新生成");for(const t of ["person","settlement","location","organization","discipline","monster","quest","skill","equipment","class"])if(!Number.isFinite(MAX[t]))warnings.push("類型缺少長度規則:"+t);return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],stats:{canonical_names:namesFor("generic").length,protected_names:protectedNames().size,supported_types:Object.keys(MAX).length-1,fixed_fallback_removed:true,specialized_routes:Object.keys(SPECIALIZED).length}}}

DB.name_generator_system={version:REV,release:RELEASE,policy:"類型先行、正史查重、專用驗證、語義一致、失敗不硬塞fallback。",supported_types:["person","settlement","location","organization","discipline","monster","quest","skill","equipment","item","class"],canonical_normalization:"NFKC＋移除空白與裝飾標點後查重",fixed_fallback:null,protected_names:[...protectedNames()],save_compatible:true};
DB.meta=DB.meta||{};DB.meta.name_generator_revision=REV;
const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-NAMING");if(ai){ai.responsibility="依內容類型、文化圈、地區、階級與實際機制生成可讀且不重複的CURRENT名稱；技能、裝備、戰鬥職業轉交各自專用驗證器。";ai.inputs=Array.from(new Set([...(ai.inputs||[]),"name type/culture/region/tier/mechanics/existing canonical names",REV]));ai.validations=Array.from(new Set([...(ai.validations||[]),"名稱生成先決定內容類型再選文法。","查重採正規化比對，不得用空格、裝飾標點或弱修飾詞規避。","正史鎖定名稱只可引用，不可由生成器重建或覆寫。","候選無法通過驗證時回傳null，不得固定fallback為洛恩或河灣鎮。"])) ;ai.unified_naming_reference_function="nameGeneratorReference";ai.unified_naming_validation_function="validateGeneratedName";ai.unified_naming_generation_function="generateWorldName"}
const gen=(DB.generators||[]).find(x=>x?.id==="GEN-NAME");if(gen){gen.inputs=Array.from(new Set([...(gen.inputs||[]),"name type/culture/region/tier/mechanics/canonical registry",REV]));gen.constraints=Array.from(new Set([...(gen.constraints||[]),"所有新名稱先依內容類型選文法，再執行正規化查重。","人物、地點、組織、流派、怪物與委託不得共用單一音節拼接模板。","技能／裝備／戰鬥職業必須分流至專用命名驗證器。","候選失敗不得使用固定人物名／聚落名fallback。"])) ;gen.unified_reference_function="nameGeneratorReference";gen.unified_validation_function="validateGeneratedName";gen.unified_runtime_function="generateWorldName";gen.fixed_fallback_disabled=true}

globalThis.nameGeneratorReference=reference;
globalThis.validateGeneratedName=validateGeneratedNameV2;
globalThis.generateWorldName=generateWorldNameV2;
globalThis.runNameGeneratorAudit=audit;
globalThis.QUNLU_NAME_GENERATOR=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
})();