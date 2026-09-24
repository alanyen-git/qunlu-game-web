#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const moduleText=fs.readFileSync("src/front-back-formation-v1.js","utf8");
const runtime=fs.readFileSync("src/runtime.js","utf8");
const targeting=fs.readFileSync("src/skill-targeting-v1.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));
let weapon={name:"鐵劍",weapon_profile:{group:"劍",range:1.5}},attackCount=0,skillCount=0,menuCount=0,saved=0;
const ch={name:"旅人",classId:"C1",hp:120,maxHp:120,skills:[
 {name:"斬擊",damage_type:"physical",target_pattern:"single"},
 {name:"火球術",damage_type:"magic",target_pattern:"single"},
 {name:"背襲",damage_type:"physical",target_pattern:"single"}
],adventureParty:{name:"測試團",members:[{uid:"guard-1",templateId:"T1"},{uid:"healer-1",templateId:"T2"}]}};
const G={character:ch,battle:null},DB={combat_classes:[{id:"C1",combat_role_formation:{position:"front"}}],party_member_templates:[
 {id:"T1",name:"盾衛",role:"tank"},{id:"T2",name:"治癒者",role:"healer"}
],management_ai:[],meta:{}};
const ctx=vm.createContext({console,G,DB,mainWeaponData:()=>weapon,activeCompanionInstance:()=>null,
 persist(){saved++},renderAll(){},battleLog(){},battleSkillMenu(){menuCount++},
 battleGeneralAttack(){attackCount++},battleUseSkill(){skillCount++},
 openAdventureParty(){},showModal(name,html){ctx.modal={name,html}}});
ctx.globalThis=ctx;
vm.runInContext(moduleText,ctx,{filename:"src/front-back-formation-v1.js"});
const F=ctx.QUNLU_FRONT_BACK_FORMATION;assert(F,"formation module is registered");
assert.equal(F.audit().pass,true);
const enemies=Array.from({length:6},(_,i)=>({id:"E"+i,battleId:"enemy-"+i,name:"敵"+i,hp:20,maxHp:20,range:1.5}));
const party=[{uid:"guard-1",role:"tank",name:"盾衛",hp:90,maxHp:90,guarding:false},
 {uid:"healer-1",role:"healer",name:"治癒者",hp:55,maxHp:55,guarding:false}];
const b=G.battle={active:true,enemies,enemy:enemies[3],party,companion:null,log:[]};
F.initBattle(b);
assert.equal(F.rowOf("self"),"front");
assert.equal(F.rowOf("party:guard-1"),"front");
assert.equal(F.rowOf("party:healer-1"),"back");
assert.equal(F.enemyRow(enemies[0]),"front");
assert.equal(F.enemyRow(enemies[3]),"back");
assert.equal(F.canPlayerHit(null,enemies[3]),false,"melee cannot bypass front");
assert.equal(F.canPlayerHit(ch.skills[1],enemies[3]),true,"magic can target rear");
assert.equal(F.canPlayerHit(ch.skills[2],enemies[3]),true,"rear-access special attack");
assert.equal(F.playerTargets(ch.skills[0]).length,3,"melee only has front targets");
ctx.battleGeneralAttack();
assert.equal(attackCount,0,"blocked strike must not spend a turn");
ctx.battleUseSkill(0,"self");
assert.equal(skillCount,0,"blocked skill must not spend a turn");
assert.equal(menuCount,1,"blocked skill returns to selection");
ctx.battleUseSkill(1,"self");assert.equal(skillCount,1,"magic can hit rear");
weapon={name:"木弓",weapon_profile:{group:"弓",range:7}};
assert.equal(F.canPlayerHit(null,enemies[3]),true,"ranged equipment can hit rear");
ctx.battleGeneralAttack();assert.equal(attackCount,1);
weapon={name:"鐵劍",weapon_profile:{group:"劍",range:1.5}};
enemies.slice(0,3).forEach(e=>e.hp=0);
assert.equal(F.canPlayerHit(null,enemies[3]),true,"rear accessible when front defeated");
enemies.slice(0,3).forEach(e=>e.hp=20);
ctx.openPartyFormation();
assert.match(ctx.modal.html,/調整隊形|前排/);
assert.equal(ctx.setPartyFormationPosition("self","back"),true);
assert.equal(saved,1,"formation adjustment persists");
assert.equal(F.rowOf("self"),"front","battle formation remains locked until next battle");
F.initBattle(b);
assert.equal(F.rowOf("self"),"back","updated formation applies at next battle");
assert.equal(F.rowOf("party:guard-1"),"front");
assert.equal(F.audit().pass,true);
const melee={name:"山賊",range:1.5};
const remote={name:"弓兵",range:7};
const targetList=[{type:"player",weight:100},{type:"party",unit:party[0],weight:120},{type:"party",unit:party[1],weight:80}];
const filtered=F.filterEnemyTargets(melee,targetList);
assert.equal(filtered.length,1,"enemy melee may only reach the ally front row");
assert.equal(filtered[0].unit.uid,"guard-1");
assert.equal(F.filterEnemyTargets(remote,targetList).length,3,"enemy ranged can attack rear");
party[0].guarding=true;
const intercepted=F.interceptEnemyAttack({type:"party",unit:party[1]},remote);
assert.equal(intercepted.unit.uid,"guard-1","front guardian intercepts ranged attack");
assert.equal(party[0].guarding,false,"guardian intercept is consumed");
assert.equal(F.interceptEnemyAttack({type:"player"},melee).type,"player","melee rear interception cannot fire");
assert.equal(ctx.setPartyFormationPosition("party:guard-1","back"),false,"last front-row ally cannot move away");
const current=ch.adventureParty.formationPositions;
assert.equal(current["self"],"back");assert.equal(current["party:guard-1"],"front");
assert.match(runtime,/QUNLU_FRONT_BACK_FORMATION\?\.filterEnemyTargets/);
assert.match(runtime,/QUNLU_FRONT_BACK_FORMATION\?\.interceptEnemyAttack/);
assert.match(runtime,/QUNLU_FRONT_BACK_FORMATION\?\.chooseAllyEnemy/);
assert.match(targeting,/QUNLU_FRONT_BACK_FORMATION\?\.canPlayerHit/);
assert(index.includes("src/front-back-formation-v1.js?v="+version.version));
assert(sw.includes("./src/front-back-formation-v1.js"));
assert.equal(version.front_back_formation_revision,"FRONT-BACK-FORMATION-1.0");
console.log("front/back formation regression OK: melee, ranged, magic, special, ally AI, interception, UI, save migration");
