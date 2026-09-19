/* 群陸旅誌：統一名稱生成器 CURRENT-1.74.0
 * NAME-GENERATOR-3.0
 * 類型先行、正史查重、專用驗證、失敗不硬塞固定 fallback。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="NAME-GENERATOR-3.0", RELEASE="CURRENT-1.74.0";
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const ALIAS={person:"person",npc:"person",character:"person",settlement:"settlement",town:"settlement",city:"settlement",village:"settlement",location:"location",wild:"location",dungeon:"location",organization:"organization",org:"organization",faction:"organization",guild:"organization",discipline:"discipline",school:"discipline",style:"discipline",monster:"monster",creature:"monster",quest:"quest",mission:"quest",skill:"skill",ability:"skill",technique:"skill",equipment:"equipment",gear:"equipment",weapon:"equipment",armor:"equipment",item:"item",combat_class:"class",class:"class",job:"class"};
const MAX={person:12,settlement:14,location:18,organization:20,discipline:18,monster:18,quest:26,skill:16,equipment:24,item:24,class:12,generic:20};
const MODERN=["專案","模組","系統AI","人工智慧","研究所","處理器","伺服器","API","CPU","GPU","TODO","TBD","TEMP","測試名稱","暫定名稱","未命名"];
const BLOCKED=["升龍拳","strike","Strike","STRIKE"];
const GRAND={"無雙":"B","裁決":"B","降世":"B","天幕":"B","絕對零度":"B","終極":"A","極致":"A","萬法":"A","萬刃":"A","萬拳":"A","萬箭":"A","萬槍":"A","萬火":"A","萬冰":"A","主宰":"S","毀滅":"S"};
const SPECIALIZED={skill:{validator:"validateSkillName",generator:"suggestSkillName"},equipment:{validator:"validateEquipmentName",generator:"generateEquipmentName"},class:{validator:"validateCombatClassName",generator:"suggestCombatClassName"}};
const CULTURE=Object.freeze({
 asdale_west:{roots:["白石","灰橡","柳橋","松谷","河望","舊堡","鐘丘","綠岸"],org:["橋門","河盾","灰橡","鐘塔"],discipline:["守路","橋衛","河谷","邊地"]},
 valrek_imperial:{roots:["黑鐵","赤堡","高原","鷹門","北關","石冠"],org:["黑鐵","鷹旗","赤堡","帝冠"],discipline:["軍陣","重盾","槍列","鐵壁"]},
 elven:{roots:["銀葉","月林","星枝","晨露","森海","翠環"],org:["翠環","銀葉","星枝","月泉"],discipline:["林風","星行","月弓","古樹"]},
 dwarven:{roots:["石冠","深廳","熔爐","鐵砧","銅脊","礦門"],org:["鐵砧","石冠","深爐","盾岩"],discipline:["盾斧","戰鎚","符文","石壁"]},
 free_city:{roots:["河口","商橋","船塢","金衡","灰刃","舊港"],org:["金衡","河橋","灰帆","舊港"],discipline:["護商","決鬥","巷戰","航海"]},
 beast_steppe:{roots:["赤牙","風鬃","霜角","石圈","長草","獵旗"],org:["赤牙","風鬃","石圈","獵旗"],discipline:["騎獵","長矛","圖騰","摔鬥"]},
 dark_elf:{roots:["黑月","深庭","誓井","晶洞","幽谷","暮穴"],org:["黑月","誓井","暮晶","深庭"],discipline:["暗影","洞戰","決鬥","祕術"]},
 eastern_sword:{roots:["楓谷","雷峰","月渡","松原","白鷺","遠潮","石庭"],org:["楓谷","雷峰","白鷺","月渡"],discipline:["松風","遠雷","秋水","白鷺","月影"],person_parts:{start:["飛","真","千","隼","景","宗","一","信"],middle:["之","一","真","景"],end:["烈","葉","羽","人","齋","真","介","藏"]}}
});

const clean=v=>String(v==null?"":v).normalize("NFKC").trim();
const typeOf=v=>ALIAS[clean(v).toLowerCase()]||"generic";
const tierOf=v=>Object.prototype.hasOwnProperty.call(TIER,clean(v).toUpperCase())?clean(v).toUpperCase():"F";
const list=v=>Array.isArray(v)?v.map(clean).filter(Boolean):(v?[clean(v)].filter(Boolean):[]);
const choose=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
const uniq=a=>[...new Set((a||[]).map(clean).filter(Boolean))];
const key=v=>clean(v).replace(/[\s·・"'’‘“”「」『』()（）[\]【】{}<>《》_\-—–/／\\]/g,"").toLowerCase();
const protectedNames=()=>new Set([...(globalThis.QUNLU_NAMING_PROTECTED_NAMES||[]),"雷煌流","雷鳴流","柳生唯心流","柳生惟心流","名品武士刀「闇夜」"]);
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
function cultureProfile(c){const base=DB.naming_ai?.culture_sound_profiles?.[c]||{};const local=CULTURE[c]||CULTURE.asdale_west;const fallback=DB.naming_ai?.culture_sound_profiles?.asdale_west||{};return {...fallback,...base,person_parts:base.person_parts||local.person_parts||fallback.person_parts||{},place_roots:uniq([...list(base.place_roots),...list(local.roots)])}}
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
 if(t==="discipline"&&/流$/.test(s)&&!protectedNames().has(s)&&context.easternTradition!==true&&clean(culture)!=="eastern_sword")r.issues.push("『○○流』只用於東方劍術文化圈；其它文化改用劍術／戰技／學派／戰法");
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
function roots(context,p,culture="asdale_west"){const lex=CULTURE[culture]||CULTURE.asdale_west;return uniq([...list(context.roots),...list(context.historicRoots),...list(context.familyRoots),...list(context.themeRoots),...list(context.regionRoots),...list(context.terrainRoots),...list(context.industryRoots),...list(p.place_roots),...list(lex.roots)])}
function personCandidate(culture,context,attempt){
 const p=cultureProfile(culture),parts=p.person_parts||{},a=list(parts.start),m=list(parts.middle),z=list(parts.end);let out="";
 if(a.length&&z.length)out=choose(a)+((m.length&&attempt%4!==0)?choose(m):"")+choose(z);else{const syl=list(p.syllables).length?list(p.syllables):["阿","洛","維","爾","恩","德","薩","伊","蘭","菲"];const n=attempt%3===0?3:2;for(let i=0;i<n;i++)out+=choose(syl)}
 if(context.familyName&&context.includeFamily===true)out=clean(context.familyName)+"・"+out;return out;
}
function settlementSuffix(context={}){
 const k=clean(context.kind||context.locationKind||context.settlementKind).toLowerCase(),map={capital:["王都","都城","城"],city:["城"],town:["鎮","城"],village:["村","莊"],port:["港","灣港"],fortress:["要塞","堡"],mine:["礦鎮","礦坑"],forest:["林","森"],wetland:["沼","濕地"],mountain:["嶺","山"],plain:["原","平原"],coast:["灣","岬"],ruin:["遺跡","古墟"],dungeon:["洞窟","地窖","古堡","遺跡"],wild:["谷","林","原","丘","沼","灣","嶺"]};return choose(map[k]||["城","鎮","村","港","堡"]);
}
function settlementCandidate(type,culture,context){const p=cultureProfile(culture),lex=CULTURE[culture]||CULTURE.asdale_west,rs=roots(context,p,culture),root=clean(context.historicName||context.familyName||context.landmarkName)||choose(rs.length?rs:lex.roots),suffix=settlementSuffix({...context,kind:type==="location"?(context.kind||context.locationKind||"wild"):(context.kind||context.settlementKind)});return join(root,suffix)}
function organizationCandidate(culture,context){const p=cultureProfile(culture),lex=CULTURE[culture]||CULTURE.asdale_west,rs=uniq([...roots(context,p,culture),...list(context.symbolRoots),...list(lex.org)]),root=clean(context.patronName||context.locationName||context.landmarkName)||choose(rs),cat=clean(context.category||context.kind||context.function).toLowerCase();let ss=["公會","協會","同盟","議會"];if(/church|faith|relig|教會|宗教/.test(cat))ss=["教會","修會","聖堂議會"];else if(/knight|military|guard|騎士|軍/.test(cat))ss=["騎士團","守備團","戰團"];else if(/merchant|trade|商|航運/.test(cat))ss=["商會","行商同盟","航運公會"];else if(/academy|mage|學院|法師/.test(cat))ss=["學院","法師議會","術法公會"];else if(/thief|secret|黑市|密探|地下/.test(cat))ss=["兄弟會","密會","結社"];if(culture==="eastern_sword"&&/martial|sword|劍|武/.test(cat))ss=["道場","劍術館","門"];return join(root,choose(ss))}
function disciplineCandidate(culture,context){const p=cultureProfile(culture),lex=CULTURE[culture]||CULTURE.asdale_west,rs=uniq([...roots(context,p,culture),...list(context.motifs),...list(lex.discipline)]),root=clean(context.institutionName||context.regionName)||choose(rs),weapon=clean(context.weapon||context.weaponGroup),track=clean(context.track).toLowerCase(),eastern=culture==="eastern_sword"||context.easternTradition===true;let ss=["戰技","武技學派","戰法"];if(/劍|刀/.test(weapon))ss=eastern?["劍術","刀術","流"]:["劍術","劍學派","護手劍術"];else if(/槍|矛|戟/.test(weapon))ss=["槍術","長兵戰技","槍陣戰法"];else if(/弓|弩/.test(weapon))ss=["弓術","射術學派","獵射戰技"];else if(/拳|徒手|格鬥/.test(weapon))ss=["格鬥術","拳術","武鬥戰技"];if(/magic|魔法|hybrid|魔武/.test(track))ss=["術法","秘術學派","元素戰技","符文學派"];return join(root,choose(ss))}
function monsterCandidate(context){const e=clean(context.element),h=clean(context.habitat||context.terrain),trait=clean(context.trait||context.feature),species=clean(context.speciesName||context.species||context.familyName||context.family)||choose(["狼","熊","蜥","蛛","蠍","鷹","獸"]);if(context.unique===true||context.boss===true){const title=clean(context.epithet||context.title);if(title)return title+"・"+species}if(!e&&!trait)return h?join(h,species):species;const map={火:["熾痕","燼皮","炎脊"],水:["霜背","潮紋","冰晶"],風:["裂風","蒼翼","風翎"],地:["岩脊","石甲","砂背"],雷:["雷角","電紋","鳴雷"],生命:["翠葉","森靈","生息"],死亡:["枯骨","灰墓","亡息"],光明:["曙光","白耀"],黑暗:["黯影","夜紋","黑霧"]};return join(trait||choose(map[e]||[])||h,species)}
function questCandidate(context){const tier=tierOf(context.tier||"F"),loc=clean(context.locationName||context.regionName),target=clean(context.targetName||context.objectiveName),action=clean(context.action||context.questType)||"調查",story=clean(context.storyTitle||context.eventName);if(story&&TIER[tier]>=TIER.C)return story;if(target)return action+target;if(loc)return action+loc;return action+"委託"}
function itemCandidate(context){const material=clean(context.material),provenance=clean(context.regionName||context.provenance),purpose=clean(context.purpose||context.effectName),kind=clean(context.itemType||context.category)||"道具";if(material)return material+(purpose||"")+kind;if(provenance)return provenance+(purpose||"")+kind;return (purpose||"旅用")+kind}
function specializedCandidate(type,culture,context){const tier=tierOf(context.tier||"F");if(type==="skill"&&typeof globalThis.suggestSkillName==="function")return globalThis.suggestSkillName(context.familyId||context.family||"blade",tier,{...context,rejectNearDuplicate:true});if(type==="equipment"&&typeof globalThis.generateEquipmentName==="function")return globalThis.generateEquipmentName(context.category||context.catalogGroup||"武器",tier,{...context,culture});if(type==="class"&&typeof globalThis.suggestCombatClassName==="function")return globalThis.suggestCombatClassName(context.track||"physical",context.familyId||context.family||null,tier,context);return null}
function generateWorldNameV2(type="person",culture="asdale_west",context={}){
 const t=typeOf(type),used=usedSet(t,context),tries=Math.max(20,Math.min(160,Number(context.maxAttempts)||80));
 for(let attempt=0;attempt<tries;attempt++){
   let c=SPECIALIZED[t]?specializedCandidate(t,culture,context):t==="person"?personCandidate(culture,context,attempt):(t==="settlement"||t==="location")?settlementCandidate(t,culture,context):t==="organization"?organizationCandidate(culture,context):t==="discipline"?disciplineCandidate(culture,context):t==="monster"?monsterCandidate(context):t==="quest"?questCandidate(context):t==="item"?itemCandidate(context):personCandidate(culture,context,attempt);
   c=clean(c);if(!c||used.has(key(c)))continue;const checked=validateGeneratedNameV2(c,t,culture,{...context,rejectNearDuplicate:t==="skill"});if(checked.ok)return c;
 }
 if(context.fallback){const f=clean(context.fallback),checked=validateGeneratedNameV2(f,t,culture,context);if(checked.ok)return f}return null;
}
function reference(type="person",context={}){const t=typeOf(type);return{revision:REV,release:RELEASE,type:t,tier:tierOf(context.tier||"F"),max_length:MAX[t]||MAX.generic,protected_names:[...protectedNames()],culture_registers:Object.keys(CULTURE),specialized:SPECIALIZED[t]||null,rules:["先指定內容類型，再套用該類型文法與驗證器。","正式名稱先查CURRENT同類名稱；不得以空格、符號或弱修飾詞規避查重。","技能、裝備、戰鬥職業必須通過各自專用參照與效果／階級驗證。","人物、聚落、組織、流派、怪物與委託使用不同組合規則。","生成失敗回傳null；禁止固定人物名或固定聚落名fallback。","正史鎖定名稱只能引用，不能由生成器重新建立或覆寫。"]}}
function audit(){const issues=[],warnings=[];for(const fn of ["validateSkillName","suggestSkillName","validateEquipmentName","generateEquipmentName","validateCombatClassName","suggestCombatClassName"])if(typeof globalThis[fn]!=="function")issues.push("專用命名函式缺失:"+fn);for(const [name,type,label] of [["測試API","person","英文／現代術語"],["熔熔城","settlement","重複詞"],["未命名公會","organization","占位名稱"]])if(validateGeneratedNameV2(name,type,"asdale_west",{allowExisting:true}).ok)issues.push("驗證器未攔截:"+label);if(validateGeneratedNameV2("萬火焚天極致","skill","asdale_west",{tier:"F",allowExisting:true,skill:{tier:"F",element:"火",kind:"主動",damage_type:"magic"}}).ok)issues.push("低階技能未攔截高階稱號");if(validateGeneratedNameV2("雷煌流","discipline","eastern_sword",{}).ok)issues.push("正史鎖定名稱未阻止重新生成");if(validateGeneratedNameV2("松風流","discipline","asdale_west",{allowExisting:true}).ok)issues.push("西方文化未攔截○○流");if(!validateGeneratedNameV2("松風流","discipline","eastern_sword",{allowExisting:true,easternTradition:true}).ok)issues.push("東方文化錯誤攔截○○流");for(const t of ["person","settlement","location","organization","discipline","monster","quest","skill","equipment","class"])if(!Number.isFinite(MAX[t]))warnings.push("類型缺少長度規則:"+t);return{revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],stats:{canonical_names:namesFor("generic").length,protected_names:protectedNames().size,supported_types:Object.keys(MAX).length-1,fixed_fallback_removed:true,specialized_routes:Object.keys(SPECIALIZED).length}}}

DB.name_generator_system={version:REV,release:RELEASE,policy:"文化／地理／用途／歷史先行，正史查重與機制語義驗證後才輸出名稱。",supported_types:["person","settlement","location","organization","discipline","monster","quest","skill","equipment","item","class"],canonical_normalization:"NFKC＋移除空白與裝飾標點後查重",culture_registers:Object.keys(CULTURE),world_internal_name_separation:true,fixed_fallback:null,protected_names:[...protectedNames()],save_compatible:true};
DB.meta=DB.meta||{};DB.meta.name_generator_revision=REV;
const ai=(DB.management_ai||[]).find(x=>x?.id==="AI-NAMING");if(ai){ai.responsibility="依內容類型、文化圈、地區、階級與實際機制生成可讀且不重複的CURRENT名稱；技能、裝備、戰鬥職業轉交各自專用驗證器。";ai.inputs=Array.from(new Set([...(ai.inputs||[]),"name type/culture/region/tier/mechanics/existing canonical names",REV]));ai.validations=Array.from(new Set([...(ai.validations||[]),"名稱生成先決定內容類型再選文法。","查重採正規化比對，不得用空格、裝飾標點或弱修飾詞規避。","正史鎖定名稱只可引用，不可由生成器重建或覆寫。","候選無法通過驗證時回傳null，不得固定fallback為洛恩或河灣鎮。"])) ;ai.unified_naming_reference_function="nameGeneratorReference";ai.unified_naming_validation_function="validateGeneratedName";ai.unified_naming_generation_function="generateWorldName"}
const gen=(DB.generators||[]).find(x=>x?.id==="GEN-NAME");if(gen){gen.inputs=Array.from(new Set([...(gen.inputs||[]),"name type/culture/region/tier/mechanics/canonical registry",REV]));gen.constraints=Array.from(new Set([...(gen.constraints||[]),"所有新名稱先依內容類型選文法，再執行正規化查重。","人物、地點、組織、流派、怪物與委託不得共用單一音節拼接模板。","技能／裝備／戰鬥職業必須分流至專用命名驗證器。","候選失敗不得使用固定人物名／聚落名fallback。"])) ;gen.unified_reference_function="nameGeneratorReference";gen.unified_validation_function="validateGeneratedName";gen.unified_runtime_function="generateWorldName";gen.fixed_fallback_disabled=true}

globalThis.nameGeneratorReference=reference;
globalThis.validateGeneratedName=validateGeneratedNameV2;
globalThis.generateWorldName=generateWorldNameV2;
globalThis.runNameGeneratorAudit=audit;
globalThis.QUNLU_NAME_GENERATOR=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
})();