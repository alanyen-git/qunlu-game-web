"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const code=fs.readFileSync("src/runtime.js","utf8");
const get=(a,b)=>code.slice(code.indexOf(a),code.indexOf(b,code.indexOf(a)));
const funcs=get("function closeBattleSkillPopup()","function enemyElementResistance");
const cast=get("function battleUseSkill(","function battleDefend()");
const targets=get("function battleChooseSkill(","function skillMasteryMultiplier");
const popupFns=get("function battleSupportTargets()","function skillMasteryMultiplier");
const elements=new Map();
const element=id=>{
  if(!elements.has(id))elements.set(id,{classList:{hidden:true,contains(c){return c==="hide"?this.hidden:false},add(c){if(c==="hide")this.hidden=true},remove(c){if(c==="hide")this.hidden=false}},textContent:"",innerHTML:"",scrollTop:0,focus(){},isConnected:true});
  return elements.get(id);
};
const state={active:true,party:[{name:"隊友",hp:20,maxHp:25,statusEffects:[]}],companion:null};
const heal={name:"治癒術",kind:"輔助",damage_type:"heal",resource:"mana",stamina_cost:3};
const attack={name:"斬擊",kind:"主動",damage_type:"physical",resource:"stamina",stamina_cost:2};
const G={battle:state,character:{name:"主角",skills:[heal,attack],mana:10,stamina:10,hp:20,maxHp:25,statusEffects:[]}};
const ctx={G,console,document:{activeElement:{isConnected:true,focus(){}}},battleSkillPopupStage:"closed",battleSelectedSkillIndex:null,battleSkillLastFocus:null,$:id=>element(id),
 normalizeSkillXp(){},skillUsesMana:s=>s.resource==="mana",skillResourceCost:s=>s.stamina_cost,
 skillUseTypeLabel:s=>s.kind,skillLevel(){return 1},skillXpProgressText(){return "0/10"},skillDescriptionText:s=>s.name,skillLevelBonus(){return 0},setUIHTML:(el,s)=>el.innerHTML=s,
 closeBattleSkillPopup:null,battleSkillMenu:null,battleChooseSkill:null,battleConfirmSkillTarget:null,battleUseSkill:null,
};
vm.createContext(ctx);
vm.runInContext("let battleSkillPopupStage='closed',battleSelectedSkillIndex=null,battleSkillLastFocus=null;"+funcs+popupFns,ctx);
const body=element("#battleSkillPopupBody"),title=element("#battleSkillPopupTitle");
ctx.battleSkillMenu();
assert.equal(title.textContent,"選擇技能");
assert.match(body.innerHTML,/battleChooseSkill\(0\)/);
assert.equal(vm.runInContext("battleSkillPopupStage",ctx),"list");
vm.runInContext("battleChooseSkill(0)",ctx);
assert.match(title.textContent,/治癒術/);
assert.match(body.innerHTML,/返回技能列表/);
assert.match(body.innerHTML,/battleConfirmSkillTarget\(0,'party:0'\)/);
assert.equal(G.character.mana,10);
ctx.battleSkillMenu();
assert.equal(title.textContent,"選擇技能");
assert.match(body.innerHTML,/battleChooseSkill\(1\)/);
assert.doesNotMatch(body.innerHTML,/battleConfirmSkillTarget/);
vm.runInContext("battleChooseSkill(0)",ctx);
ctx.closeBattleSkillPopup();
ctx.battleSkillMenu();
assert.equal(title.textContent,"選擇技能");
vm.runInContext("battleChooseSkill(0)",ctx);
vm.runInContext("battleChooseSkill(1)",ctx);
assert.match(title.textContent,/治癒術/);
assert.match(cast,/battleSkillPopupStage!=="committing"/);
assert.match(targets,/battleSelectedSkillIndex!==index/);
assert.match(code,/function startBattle\(monster,context\)\{\s*closeBattleSkillPopup\(\)/);
const html=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8"),ver=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.equal(ver.version,"CURRENT-2.12.2");assert.equal(ver.pwa_cache_revision,"v133");
assert.match(html,/src\/runtime\.js\?v=CURRENT-2\.12\.2-BATTLE-SKILL2/);
assert.match(sw,/CACHE_PREFIX\+"v133"/);
console.log("battle skill popup regression OK: list on reopen, target back, no premature cast, stale selection rejected");
