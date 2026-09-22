"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const code=fs.readFileSync("src/runtime.js","utf8");
const equipmentRules=fs.readFileSync("src/equipment-eligibility-v2.js","utf8");
const extract=(from,to)=>{const a=code.indexOf(from),b=code.indexOf(to,a);assert.ok(a>=0&&b>a,"missing "+from);return code.slice(a,b)};
const equipCode=extract("function requirementEsc(v)","function equipOffhandFromInventory(");
const skillCode=extract("function skillPrereqCompareLine(","DB.meta.skill_learning_prereq_compare_revision");
const skillModalCode=extract("function showSkillLearningRequirements(","function skillUseRequirementText(");
const inventoryCode=extract("function openInventory()","function removeStatuses(");
const classCode=extract("function classTraining()","function classCombatTrack(");
const crossCode=extract("function guildBasicTraining()","function learnGuildBasic(");
const gear={id:"TEST-GEAR",name:"封印長劍",tier:"B",type:"主武器",weapon_profile:{hands:1},required_level:8,required_stats:{"力量":12},sealed:true};
const skill={id:"TEST-SKILL",name:"進階劍技",tier:"D",required_level:7,required_stats:{"力量":13}};
const G={turn:12,character:{level:4,stats:{"力量":9},moneySilver:1,combatGrade:"F",classId:"TEST-CLASS",currentFacility:"field",skills:[],inventory:[{id:"TEST-GEAR"}]}};
const DB={guild_training:{cross_profession_fee:35,primary_stat_requirement:12},skill_pools:{"TEST-CLASS":[skill]},shared_skills:[]};
let modal=null;const ctx=vm.createContext({G,DB,console,showModal:(title,body)=>{modal={title,body}},effectiveStat:k=>G.character.stats[k]||0,
 item:id=>id==="TEST-GEAR"?gear:null,isShieldItem:d=>d.catalog_subcategory==="盾牌",
 isOneHandedWeapon:d=>d.type==="主武器"&&d.weapon_profile?.hands===1,
 offhandEligible:d=>d.catalog_subcategory==="盾牌"||(d.type==="主武器"&&d.weapon_profile?.hands===1),
 mainIsTwoHanded:()=>true,findPoolSkillByKey:(cid,key)=>(DB.skill_pools[cid]||[]).find(x=>x.id===key),
 cls:cid=>cid==="TEST-CLASS"?{id:cid,primary:"力量",name:"劍士",weapon_group:"長劍"}:null,sharedSkill:id=>null,
 tierOrder:t=>({F:0,E:1,D:2,C:3,B:4,A:5,S:6})[t]||0});
vm.runInContext(equipmentRules,ctx);
vm.runInContext(equipCode+skillCode+skillModalCode,ctx);
const eq=vm.runInContext("equipmentRequirementState",ctx)(gear,true);
assert.deepEqual(Array.from(eq.missing),["力量","裝備解封","主手配置"]);
assert.equal(eq.checks.find(x=>x.label==="建議等級（非限制）")?.ok,true);
assert.match(eq.reason,/力量/);
vm.runInContext("showEquipmentRequirements(0,true)",ctx);
assert.match(modal.title,/封印長劍/);
assert.match(modal.body,/尚未符合 3 項條件/);
assert.match(modal.body,/建議等級（非限制）/);
assert.match(modal.body,/先卸下雙手主武器/);
const locked=vm.runInContext("equipmentActionButton",ctx)(eq,"equipFromInventory(0)",0,true,"裝備副手");
assert.match(locked,/showEquipmentRequirements\(0,true\)/);
assert.doesNotMatch(locked,/disabled/);
const high={...gear,id:"HIGH-TEST",tier:"B",sealed:false,required_level:45,required_stats:{"力量":16}};
G.character.stats.力量=18;
const highGate=vm.runInContext("equipmentRequirementState",ctx)(high);
assert.equal(highGate.ok,true,"low-level high-stat player can use unsealed B gear");
assert.equal(highGate.checks.find(x=>x.label==="建議等級（非限制）")?.ok,true);
assert.ok(vm.runInContext("equipmentRequirementState",ctx)(gear).missing.includes("裝備解封"),"sealed relic still requires unsealing");
G.character.stats.力量=10;G.character.classMastery=0;
const trained={...gear,id:"TRAIN-TEST",tier:"D",sealed:false,required_level:30,required_stats:{}};
assert.equal(vm.runInContext("equipmentRequirementState",ctx)(trained).ok,false,"undertrained sword user");
G.character.classMastery=50;
assert.equal(vm.runInContext("equipmentRequirementState",ctx)(trained).ok,true,"mastery reduces derived ability threshold");
G.character.classId="TEST-OTHER";
assert.equal(vm.runInContext("equipmentRequirementState",ctx)(trained).ok,false,"cross-class user cannot claim sword affinity");
G.character.classId="TEST-CLASS";G.character.stats.力量=18;G.character.classMastery=0;
const restricted={...high,id:"RESTRICTED",tier:"F",required_class_ids:["C-PRIEST"],required_stats:{}};
assert.ok(vm.runInContext("equipmentRequirementState",ctx)(restricted).missing.includes("指定職業"),"explicit class requirements are not discounted");
G.character.stats.力量=9;

const skillGate=vm.runInContext("skillLearningPrereqState",ctx)(skill,{mode:"class",fee:35,requireGuild:true});
assert.deepEqual(Array.from(skillGate.missing),["戰鬥職業階級","角色等級","力量（基礎屬性）","學費","學習地點"]);
vm.runInContext("showSkillLearningRequirements('class','TEST-SKILL')",ctx);
assert.match(modal.body,/尚未符合 4 項條件/);
assert.match(modal.body,/需求：Lv7｜目前：Lv4/);
assert.match(modal.body,/返回原列表/);
const cross=vm.runInContext("skillLearningPrereqState",ctx)({...skill,tier:"F",required_level:1,required_stats:{},cross_train_locked:true},{mode:"cross",fee:35,requireGuild:true});
assert.ok(cross.missing.includes("職業招牌技能"));
assert.match(inventoryCode,/equipmentActionButton\(og,/);
assert.match(classCode,/showSkillLearningRequirements\('class'/);
assert.match(crossCode,/showSkillLearningRequirements\('cross'/);
assert.doesNotMatch(classCode,/gate\.ok\?"class='good'":"disabled"/);
assert.doesNotMatch(crossCode,/r\.ok\?"class='good'":"disabled"/);
assert.equal(G.turn,12);
assert.equal(G.character.moneySilver,1);
assert.equal(G.character.inventory.length,1);
const version=JSON.parse(fs.readFileSync("version.json","utf8"));
const html=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
assert.equal(version.requirement_detail_revision,"REQUIREMENT-DETAIL-1.0");
assert.equal(version.equipment_eligibility_revision,"EQUIPMENT-ELIGIBILITY-2.0");
assert.match(html,new RegExp("src/runtime\\.js\\?v="+version.version.replaceAll(".","\\.")));
assert.ok(sw.includes('CACHE_PREFIX+"'+version.pwa_cache_revision+'"'));
console.log("requirement detail regression OK: comprehensive equipment gate, advisory level, special seals, skill checks, save-safe");
