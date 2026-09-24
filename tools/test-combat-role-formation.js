"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const families=[
 ["聖盾守護","guardian"],["重裝前衛","heavy"],["狂戰","berserker"],
 ["東方刃術","duelist"],["長槍","lancer"],["長弓","sniper"],
 ["弓術","marksman"],["獵人","hunter"],["遊俠","ranger"],
 ["斥候","scout"],["機關獵手","trapper"],["刺客","assassin"],
 ["雙持","skirmisher"],["武僧","monk"],["聖療","healer"],
 ["戰禱","battle_healer"],["聖武","paladin"],["戰術","support"],
 ["召喚","summoner"],["火元素","fire"],["雷元素","storm"],
 ["水／寒冰","frost"],["地元素","geo"],["咒術","curse"],
 ["幻術","controller"],["奧術","mage"],["魔武","spellblade"]
];
const grades=["E","D","C","B"];
const pools={};
const classes=families.map(([family,expected],i)=>{
 const id="ROLE-"+i,magic=/mage|fire|storm|frost|geo|curse|controller|summoner|healer|support/.test(expected);
 const cls={id,name:family+"職",tier:"F",selectable:true,combat_track:magic?"magic":"physical",combat_identity:{family,signature:family+"職",mechanic_tags:["專精"],strengths:["優勢"],tradeoffs:["弱點"]}};
 const pool=[{id:id+"-F",name:"招牌",tier:"F",kind:"主動",damage_type:magic?"magic":"physical",base_power_percent:105,class_signature:true}];
 grades.forEach((grade,j)=>{
  pool.push({id:"SK-CTSE-"+id+"-"+grade+"-A",name:family+grade+"戰技",tier:grade,kind:"主動",damage_type:magic?"magic":"physical",
   base_power_percent:[114,128,143,158][j],target_pattern:["single","row","random","all"][j],target_count:j===2?3:undefined,
   allow_repeat:j===2,requires_class_exam:grade==="B"});
  pool.push({id:"SK-CTSE-"+id+"-"+grade+"-U",name:family+grade+"戰術",tier:grade,kind:"輔助",
   damage_type:expected==="healer"?"heal":"buff",target_pattern:expected==="healer"&&j>=2?"all_allies":"single",effect_text:"原始戰術",requires_class_exam:grade==="B"});
 });
 pools[id]=pool;return cls;
});
const DB={combat_classes:classes,skill_pools:pools,meta:{},management_ai:[{id:"AI-CLASS",inputs:[],validations:[]},{id:"AI-SKILL",inputs:[],validations:[]}]};
const original=JSON.stringify(pools);
const G={character:{classId:classes[0].id,skills:[]}};
const context=vm.createContext({DB,G,console,structuredClone,skillMechanicsFor:s=>s.mechanics||{version:"TEST",profile:"base",traits:[]},persist(){context.writes++},writes:0});
context.globalThis=context;
context.migrateSave=()=>123;
context.createCharacter=()=>true;
context.startBattle=()=>true;
vm.runInContext(fs.readFileSync("src/combat-role-formation-v1.js","utf8"),context,{filename:"src/combat-role-formation-v1.js"});
const api=context.QUNLU_COMBAT_ROLE_FORMATION;
assert.ok(api,"戰鬥職業編成API缺失");
const audit=context.runCombatRoleFormationAudit();
assert.equal(audit.pass,true,audit.issues.join("\n"));
assert.equal(audit.stats.classes,27);
assert.equal(Object.keys(audit.stats.roles).length,27);
const skill=(id,grade,type)=>DB.skill_pools[id].find(s=>s.id==="SK-CTSE-"+id+"-"+grade+"-"+type);
for(let i=0;i<classes.length;i++){
 const c=classes[i],expected=families[i][1],cfg=c.combat_role_formation;
 assert.equal(cfg.role,expected,c.id+"角色定位錯誤");
 assert.ok(["front","back","flex"].includes(cfg.position));
 for(const grade of grades){
  const atk=skill(c.id,grade,"A"),util=skill(c.id,grade,"U");
  assert.equal(atk.target_pattern,cfg.attack_patterns[grade]);
  assert.equal(atk.mechanics.class_role,expected);
  assert.ok(atk.mechanics.traits.length>0,c.id+grade+"缺少可執行招牌機制");
  assert.ok(atk.base_power_percent>=60&&atk.base_power_percent<=225,c.id+grade+"範圍威力超限");
  assert.equal(util.requires_class_exam,grade==="B");
  assert.equal(atk.requires_class_exam,grade==="B");
  assert.ok(util.effect_text.includes("本職定位")||expected==="guardian"&&grade==="B");
 }
 assert.ok(c.combat_identity.team_synergy&&c.combat_identity.formation_weakness);
}
const id=classes.find(c=>c.combat_role_formation.role==="fire").id;
const attack=skill(id,"D","A");
assert.equal(attack.target_pattern,"cross");
assert.ok(attack.mechanics.traits.includes("searing"));
assert.equal(skill(classes.find(c=>c.combat_role_formation.role==="guardian").id,"B","U").target_pattern,"ally_row");
assert.ok(skill(classes.find(c=>c.combat_role_formation.role==="assassin").id,"B","A").mechanics.traits.includes("execute"));
assert.ok(skill(classes.find(c=>c.combat_role_formation.role==="monk").id,"B","A").mechanics.traits.includes("combo"));
assert.ok(skill(classes.find(c=>c.combat_role_formation.role==="healer").id,"C","U").mechanics.traits.includes("group_heal"));
const saved={...JSON.parse(JSON.stringify(attack)),target_pattern:"single",skillXp:255,mastery:78};
G.character.classId=id;G.character.skills=[saved];
assert.equal(context.migrateSave(),123);
assert.equal(saved.target_pattern,"cross");
assert.equal(saved.skillXp,255);
assert.equal(saved.mastery,78);
assert.equal(context.writes,0,"讀取存檔或顯示不應額外消耗回合");
const once=JSON.stringify(DB.skill_pools);
vm.runInContext(fs.readFileSync("src/combat-role-formation-v1.js","utf8"),context,{filename:"src/combat-role-formation-v1.js/replay"});
assert.equal(JSON.stringify(DB.skill_pools),once,"重複初始化不得疊加倍率與機制");
assert.notEqual(JSON.stringify(DB.skill_pools),original);
console.log("combat role formation regression OK: 27 roles, 27 classes × E–B attacks and tactics, pattern/power, mechanics, migration, replay");
