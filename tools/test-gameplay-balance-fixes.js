"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const runtime=fs.readFileSync("src/runtime.js","utf8");
const ecology=fs.readFileSync("src/quest-regional-ecology-v1.js","utf8");
const questStart=ecology.indexOf("function cooldown(t,town){");
const questEnd=ecology.indexOf("\nfunction validLocations",questStart);
assert.ok(questStart>=0&&questEnd>questStart,"quest cooldown function exists");
let currentHour=24;
let records=[{completedHour:0,templateId:"old-patrol",signature:"old-target",kind:"調查／巡查",townId:"town-a",provinceId:"region-a"}];
const cooldown=Function("hour","province","target","kind","history",ecology.slice(questStart,questEnd)+"; return cooldown;")(
 ()=>currentHour,()=> "region-a",t=>t.signature,t=>t.kind,()=>records
);
const town={id:"town-a"};
assert.match(cooldown({id:"new-patrol",signature:"new-target",kind:"調查／巡查"},town),/48小時/);
currentHour=49;
assert.equal(cooldown({id:"new-patrol",signature:"new-target",kind:"調查／巡查"},town),"");
currentHour=72;
assert.match(cooldown({id:"different",signature:"old-target",kind:"討伐／狩獵"},town),/相同目標正在冷卻/);
const start=runtime.indexOf("function facilityHeal(fid){");
const end=runtime.indexOf("\n\nfunction marketDayKey()",start);
assert.ok(start>=0&&end>start,"facility treatment handler exists");
const source=runtime.slice(start,end);
const player={hp:12,maxHp:40,moneySilver:10};
const member={hp:5,maxHp:30,statusEffects:["poison"]};
const context=vm.createContext({
 G:{character:player,statusEffects:["poison"]},
 DB:{faith_oaths:[],facilities:{church:{name:"教會"},clinic:{name:"診療所"}}},
 faithState:()=>({oathId:""}),
 partyMembers:()=>[member],
 partyMemberCombatStats:()=>({maxHp:30}),
 clamp:(x,min,max)=>Math.max(min,Math.min(max,x)),
 alert:x=>{},
 log:()=>{},
 persist:()=>{},
 renderFacility:()=>{}
});
vm.runInContext(source,context);
context.facilityHeal("church");
assert.equal(player.hp,40,"church restores player to full health");
assert.equal(member.hp,30,"church restores party members to full health");
assert.equal(player.moneySilver,5,"church keeps its five silver fee");
assert.deepEqual(Array.from(context.G.statusEffects),[],"church clears player status effects");
assert.deepEqual(Array.from(member.statusEffects),[],"church clears party status effects");
assert.match(ecology,/sameTown&&category==="調查／巡查"&&r.kind===category&&elapsed<48/);
assert.match(ecology,/recent_patrol_type:48/);
assert.match(ecology,/探索／巡查委託同城鎮48小時冷卻/);
console.log("church healing and exploration cooldown regression OK");
