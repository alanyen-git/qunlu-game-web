"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const rows=[
 {id:"BM-F-GEAR",name:"粗鐵劍",type:"主武器",catalog_group:"武器",tier:"F",value:50,durability:70},
 {id:"BM-D-GEAR",name:"精良劍",type:"主武器",catalog_group:"武器",tier:"D",rarity:"稀有",value:185,durability:100},
 {id:"BM-C-GEAR",name:"秘銀劍",type:"主武器",catalog_group:"武器",tier:"C",value:380,durability:115},
 {id:"BM-B-GEAR",name:"附魔大劍",type:"主武器",catalog_group:"武器",tier:"B",enchanted:true,value:900,durability:140},
 {id:"BM-D-RARE",name:"稀有礦石",type:"素材",tier:"D",rarity:"稀有",value:60,stackable:true},
 {id:"BM-E-RARE",name:"秘藏藥草",type:"素材",tier:"E",rarity:"珍稀",value:50,stackable:true},
 {id:"BM-D-COMMON",name:"常見礦石",type:"素材",tier:"D",value:60,stackable:true},
 {id:"BM-F-COMMON",name:"普通獸皮",type:"素材",tier:"F",value:45,stackable:true},
 {id:"BM-LOW",name:"雜草",type:"素材",tier:"F",value:1,stackable:true}
];
const G={meta:{characterId:"BM-TEST"},turn:50,worldTime:{day:1,hour:0,minute:0},worldState:{},
 character:{locationId:"TOWN",currentFacility:"tavern",inventory:[{id:"BM-D-GEAR",qty:1,durability:80,maxDurability:100}],
 moneySilver:50000,adventureRank:"C",combatGrade:"C",guildReputation:24}};
const DB={meta:{},items:rows,locations:[{id:"TOWN",name:"測試城",kind:"town",tier:"D",facilities:[]}],
 facilities:{},province_region_maps:[],political_entities:[]};
let modal=null;
const ctx=vm.createContext({DB,G,console,Math,Date,alert:()=>{},document:{},
 showModal:(title,body)=>{modal={title,body}},persist:()=>{},log:()=>{},
 addItem:(id,qty=1,extra={})=>{G.character.inventory.push({id,qty,...extra})},
 removeItem:(id,qty=1,index=null)=>{const at=index==null?G.character.inventory.findIndex(x=>x.id===id):index;if(at<0||G.character.inventory[at].id!==id)return false;G.character.inventory.splice(at,1);return true},
 beginTurn:()=>true,endTurn:()=>{},renderFacility:()=>{},
 shopBuyUnitPrice:d=>Math.ceil(d.value*1.15),shopSellUnitPrice:d=>Math.floor(d.value*.5),
 regionalItemMarketFactor:()=>1,itemTradeFlowFactor:()=>1});
vm.runInContext("window=globalThis",ctx);
for(const f of ["src/trade-venues-data-v1.js","src/trade-venues-runtime-v1.js"])vm.runInContext(fs.readFileSync(f,"utf8"),ctx,{filename:f});
const mod=vm.runInContext("QUNLU_TRADE_VENUES",ctx),p=mod.pricing;
assert(p.blackMarketUnitReference(rows[1])>=Math.ceil(p.auctionGearMinimum(rows[1])*1.65));
assert(p.blackMarketUnitReference(rows[3])>p.blackMarketUnitReference(rows[2]));
assert(p.blackMarketSellPrice(rows[1])>Math.floor(rows[1].value*.5));
assert(p.blackMarketSellPrice(rows[1])<p.blackMarketUnitReference(rows[1]));
assert(p.blackMarketUnitReference(rows[4])>p.blackMarketUnitReference(rows[6]));
assert(p.blackMarketSellPrice(rows[4])>Math.floor(rows[4].value*.5));
assert.equal(mod.tradeVenueEligible(rows[8],"black_market","sell"),false);
assert(p.blackMarketSellPrice(rows[1],{durability:40,maxDurability:100})<=p.blackMarketSellPrice(rows[1]));
let open=false;
for(let h=0;h<96;h++){G.worldTime.day=Math.floor(h/24)+1;G.worldTime.hour=h%24;if(mod.blackWindow().open){open=true;break}}
assert(open,"black market open window found");
vm.runInContext("openBlackMarket()",ctx);
assert.equal(modal?.title,"黑市");
const state=G.worldState.tradeVenues.blackMarkets.TOWN;
assert.equal(state.priceModel,"BLACK-MARKET-PRICING-2.0");
assert(Object.keys(state.stock).length>=5,"finite generated stock");
assert(!state.stock["BM-LOW"],"low-value goods excluded");
const maxOffer=Math.max(...Object.keys(state.stock).map(id=>p.blackMarketSellPrice(rows.find(d=>d.id===id))));
assert(state.budget>=2*maxOffer,"broker can cover two high-value offers");
for(const id of Object.keys(state.stock))assert(state.prices[id]>=p.blackMarketUnitReference(rows.find(d=>d.id===id)));
const first=Object.keys(state.stock)[0];
state.prices[first]=1;state.budget=1;state.priceModel="TRADE-VENUES-RUNTIME-1.2";
vm.runInContext("openBlackMarket()",ctx);
assert(state.prices[first]>=p.blackMarketUnitReference(rows.find(d=>d.id===first)),"legacy stock repriced");
assert(state.budget>1,"legacy budget upgraded");
const upgradedPrice=state.prices[first],upgradedBudget=state.budget;
vm.runInContext("openBlackMarket()",ctx);
assert.equal(state.prices[first],upgradedPrice,"repricing only once");
assert.equal(state.budget,upgradedBudget,"budget never repeatedly refilled");
const paid=p.blackMarketSellPrice(rows[1],G.character.inventory[0]);
const previousMoney=G.character.moneySilver,previousBudget=state.budget;
vm.runInContext("blackMarketSell(0)",ctx);
assert.equal(G.character.moneySilver-previousMoney,paid,"actual sale uses durability-adjusted price");
assert.equal(previousBudget-state.budget,paid,"limited budget deducted");
assert.equal(G.character.inventory.length,0,"item consumed once");
const audit=vm.runInContext("runAuctionBlackMarketAudit()",ctx);
assert.equal(audit.pass,true,JSON.stringify(audit.issues));
assert.equal(vm.runInContext("runTradeVenueDataAudit()",ctx).pass,true,"data audit");
const ver=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.equal(ver.black_market_pricing_revision,"BLACK-MARKET-PRICING-2.0");
assert.equal(ver.pwa_cache_revision,(fs.readFileSync("sw.js","utf8").match(/CACHE_PREFIX\+"([^"]+)"/)||[])[1],"SW快取與發布資訊同步");
console.log("black market pricing regression OK: tier, rarity, durability, finite budget, legacy repricing, actual sale, low-value gate");
