const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const source=fs.readFileSync("src/skill-mechanics-depth-v1.js","utf8");
assert.doesNotMatch(source,/const magic=\/冥想\|祈禱\|安息\|魔力\|奧術\|星\//,"resource recovery must not infer MP from the skill name");
assert.match(source,/最大體力/);
assert.match(source,/最大MP/);

const physical={id:"TEST-REST-PHY",name:"安息之歌",tier:"F",kind:"輔助",display_type:"輔助",damage_type:"buff",resource:"stamina",resource_cost:2};
const magic={id:"TEST-REST-MAG",name:"安息冥想",tier:"F",kind:"輔助",display_type:"輔助",damage_type:"buff",resource:"mana",resource_cost:2};
const DB={skill_pools:{TEST:[physical,magic]},shared_skills:[],items:[
  {id:"POTION-HP",name:"小型生命藥劑",type:"藥劑",use:{hp:20}},
  {id:"POTION-MP",name:"小型魔力藥劑",type:"藥劑",use:{mana:12}},
  {id:"POTION-SP",name:"小型體力藥劑",type:"藥劑",use:{stamina:10}}
],management_ai:[],meta:{},hard_rules:{}};
const context=vm.createContext({
  DB,
  console,
  QUNLU_CORE:{registerModule(){}},
  QUNLU_RELEASE_VERSION:"CURRENT-TEST",
  skillUsesMana:s=>(s.resource||"stamina")==="mana",
  G:null
});
vm.runInContext(source,context);

const physicalText=context.skillMechanicText(physical);
const magicText=context.skillMechanicText(magic);
assert.match(physicalText,/最大體力8%/);
assert.doesNotMatch(physicalText,/最大資源|最大MP/);
assert.match(magicText,/最大MP8%/);
assert.doesNotMatch(magicText,/最大資源|最大體力/);

const audit=context.runSkillMechanicsDepthAudit();
assert.equal(audit.stats.resource_terminology_issues,0);
assert.equal(audit.issues.filter(x=>/籠統資源|恢復資源未明確/.test(x)).length,0);

console.log("resource terminology regression OK: skill recovery labels follow resource field; item scan clear");
