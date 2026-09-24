"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const classId="CLASS-TEST";
const gradePower={E:114,D:128,C:143,B:158,A:180,S:210};
const skill=(grade)=>({id:"SK-TEST-"+grade,canonical_skill_id:"SK-TEST-"+grade,
 name:"試煉之刃"+grade,tier:grade,kind:"主動",display_type:"主動",damage_type:"physical",
 source_class:classId,base_power_percent:gradePower[grade],power_growth_percent_per_level:10,
 recommended_level:{E:8,D:16,C:28,B:42,A:60,S:80}[grade],
 resource:"stamina",resource_cost:7,scaling_stat:"physical",
 level_bonuses:{"6":{accuracy_bonus:5,text:"精準"},"10":{armor_pen_pct:10,text:"穿透"}}});
const skills=Object.fromEntries(["E","D","C","B","A","S"].map(t=>[t,skill(t)]));
const ordinary=Array.from({length:12},(_,i)=>({
 id:"TEST-ITEM-"+i,name:"普通競價品"+i,type:i%2?"主武器":"素材",
 catalog_group:i%2?"武器":"素材",tier:i%2?"D":"E",value:80+i*15,
 stackable:false,durability:80,weight:1
}));
const DB={meta:{current_version:"CURRENT-TEST"},items:ordinary,
 skill_pools:{[classId]:Object.values(skills)},
 combat_classes:[{id:classId,name:"測試劍客",tier:"B"}],
 locations:[{id:"TOWN",name:"行省測試城",kind:"town",tier:"C",facilities:[]}],
 facilities:{},province_region_maps:[{capital_location_id:"TOWN"}],political_entities:[],
 content_link_index:{item_sources:{}},guild_training:{primary_stat_requirement:16}};
const G={turn:23,meta:{characterId:"SKM-TEST"},worldTime:{day:1,hour:0,minute:0},
 worldState:{},character:{classId,combatGrade:"C",adventureRank:"C",locationId:"TOWN",
 currentFacility:"guild",guildReputation:50,level:50,stats:{STR:40},moneySilver:999999,
 classHistory:[],classExamHistory:[],skills:[],inventory:[]}};
const alerts=[],logs=[];let modal;
const ctx=vm.createContext({DB,G,console,Math,Date,JSON,structuredClone,
 document:{},alert:msg=>alerts.push(msg),log:(...args)=>logs.push(args),
 showModal:(title,body)=>{modal={title,body}},persist:()=>{},openCharacterSkills:()=>{},
 beginTurn:()=>true,endTurn:()=>{},renderFacility:()=>{},shopBuyUnitPrice:d=>Math.ceil(d.value*1.2),
 shopSellUnitPrice:d=>Math.ceil(d.value*.55),regionalItemMarketFactor:()=>1,itemTradeFlowFactor:()=>1,
 addItem:(id,qty=1)=>{const x=G.character.inventory.find(x=>x.id===id);
  if(x)x.qty+=qty;else G.character.inventory.push({id,qty})},
 removeItem:(id,qty=1,index=null)=>{const i=index==null?G.character.inventory.findIndex(x=>x.id===id):index;
  const x=G.character.inventory[i];if(!x||x.id!==id)return false;
  if(x.qty<=qty)G.character.inventory.splice(i,1);else x.qty-=qty;return true},
 useItem:()=>false,skillLearningPrereqState:(s,opt)=>({ok:true,checks:[],missing:[],html:""}),
 learnCombatSkill:ref=>{const s=DB.skill_pools[classId].find(s=>s.id===ref);if(!s)return false;
  G.character.skills.push({...s,mastery:1,skillXp:0});return true},
 classTraining:()=>{},openCharacter:()=>{}});
vm.runInContext("window=globalThis",ctx);
for(const file of ["src/trade-venues-data-v1.js","src/trade-venues-runtime-v1.js",
                    "src/trade-skill-manuscripts-v1.js"])
 vm.runInContext(fs.readFileSync(file,"utf8"),ctx,{filename:file});
const system=vm.runInContext("QUNLU_SKILL_MANUSCRIPTS",ctx);
const trade=vm.runInContext("QUNLU_TRADE_VENUES",ctx);
const byGrade=grade=>system.catalog.find(x=>x.grade===grade);
for(const grade of ["E","D"])assert.equal(byGrade(grade).fragment,false,grade+" complete book");
for(const grade of ["C","B","A","S"]){
 const rec=byGrade(grade),d=DB.items.find(x=>x.id===rec.itemId);
 assert(rec.fragment&&d.manuscript_fragment&&d.manuscript_multiplier===.6,grade+" fragment only");
 assert.equal(d.trade_venue_special_stock_only,true);
 assert(DB.content_link_index.item_sources[d.id].special_sources.includes("auction_rare_manuscript"));
}
const b=byGrade("B");
assert.equal(system.canStudy(b),"","C-grade player can study B fragment");
G.character.inventory.push({id:b.itemId,qty:1});
vm.runInContext("useItem(0)",ctx);
let partial=G.character.skills.find(x=>x.manuscript_fragment);
assert(partial,"B fragment learned");assert.equal(partial.base_power_percent,Math.round(skills.B.base_power_percent*.6*100)/100);
assert.equal(partial.power_growth_percent_per_level,6);
assert.equal(partial.level_bonuses["10"].armor_pen_pct,6);
vm.runInContext('learnCombatSkill("SK-TEST-B")',ctx);
assert.equal(G.character.skills.filter(x=>x.id===skills.B.id).length,0,"B full skill blocked without exam");
assert(alerts.length>0);
G.character.combatGrade="B";
assert.equal(system.canMentorB(skills.B),false,"B rank alone is insufficient");
G.character.classExamHistory.push({targetId:classId,targetGrade:"B"});
assert.equal(system.canMentorB(skills.B),true,"B grade, B exam, C-tier town and guild enable mentor");
partial.skillXp=95;partial.mastery=38;
vm.runInContext('learnCombatSkill("SK-TEST-B")',ctx);
assert.equal(G.character.skills.length,1,"upgrade replaces fragment without consuming extra slot");
assert.equal(G.character.skills[0].id,skills.B.id);
assert.equal(G.character.skills[0].skillXp,95,"original XP retained");
const c=byGrade("C");G.character.inventory.push({id:c.itemId,qty:1});
vm.runInContext("useItem(0)",ctx);
assert.equal(G.character.skills[1].base_power_percent,Math.round(skills.C.base_power_percent*.6*100)/100,"C fragment preserves exact 60% potency");
const e=byGrade("E");G.character.inventory.push({id:e.itemId,qty:1});
vm.runInContext("useItem(0)",ctx);
assert.equal(G.character.skills[2].base_power_percent,skills.E.base_power_percent);
assert.equal(system.audit().pass,true,JSON.stringify(system.audit().issues));
assert.equal(trade.audit().pass,true,JSON.stringify(trade.audit().issues));
G.character.currentFacility="auction";
vm.runInContext("openAuctionHouse()",ctx);
assert.equal(modal.title,"拍賣行");
const as=G.worldState.tradeVenues.auctions.TOWN;
assert((as.listings||[]).filter(x=>x.itemId.startsWith("IT-SKM-")).length<=1,"rare auction slot at most one");
as.listings=as.listings.filter(x=>!x.itemId.startsWith("IT-SKM-"));
let auctionHit=false;
for(let n=1;n<=500;n++){
 as.refreshAt=n;as.manuscriptCheckAt=null;
 if(system.addAuctionManuscript()){auctionHit=true;break}
}
assert(auctionHit,"some auction refreshes produce a rare manuscript");
assert.equal(as.listings.filter(x=>x.itemId.startsWith("IT-SKM-")).length,1);
assert.equal(system.addAuctionManuscript(),false,"same refresh cannot restock extra book");
for(let hour=0;hour<96;hour++){
 G.worldTime.day=Math.floor(hour/24)+1;G.worldTime.hour=hour%24;
 if(trade.blackWindow().open)break
}
assert(trade.blackWindow().open,"found open black market window");
G.character.currentFacility="tavern";
vm.runInContext("openBlackMarket()",ctx);
assert.equal(modal.title,"黑市");
const bs=G.worldState.tradeVenues.blackMarkets.TOWN;
assert.equal(Object.keys(bs.stock).filter(id=>id.startsWith("IT-SKM-")).length<=1,"rare black-market stock at most one");
assert(Object.keys(bs.stock).length>0);
console.log("skill manuscripts OK: complete E–D, C+ 60% fragments, B mentor exam, XP, venue rarity and audits");