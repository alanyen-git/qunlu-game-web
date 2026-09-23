"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const data=fs.readFileSync("src/trade-venues-data-v1.js","utf8");
const code=fs.readFileSync("src/trade-venues-runtime-v1.js","utf8");
const rows=[
 {id:"TEST-F",name:"低階劍",type:"主武器",catalog_group:"武器",tier:"F",value:50,durability:70},
 {id:"TEST-E",name:"優良長劍",type:"主武器",catalog_group:"武器",tier:"E",rarity:"優良",value:72,durability:80},
 {id:"TEST-D",name:"稀有長劍",type:"主武器",catalog_group:"武器",tier:"D",rarity:"稀有",value:185,durability:100},
 {id:"TEST-C",name:"秘銀長劍",type:"主武器",catalog_group:"武器",tier:"C",rarity:"精良",value:380,durability:115,set_id:"TEST-SET"},
 {id:"TEST-MAT",name:"稀有礦石",type:"素材",tier:"D",value:60,stackable:true},
 {id:"TEST-LOW",name:"雜草",type:"素材",tier:"F",value:1,stackable:true}
];
const G={
 meta:{characterId:"TEST"},turn:50,worldTime:{day:10,hour:12,minute:0},
 worldState:{},character:{locationId:"TOWN",currentFacility:"auction",inventory:[
  {id:"TEST-C",qty:1,durability:50,maxDurability:115},
  {id:"TEST-MAT",qty:4}
 ],moneySilver:20000,adventureRank:"C",combatGrade:"C",guildReputation:0}
};
const DB={meta:{},items:rows,locations:[{id:"TOWN",name:"省城",kind:"town",tier:"C",facilities:["auction"]}],
 facilities:{},political_entities:[],province_region_maps:[{capital_location_id:"TOWN"}]};
let modal=null;
const ctx=vm.createContext({DB,G,console,Math,Date,alert:()=>{},document:{},
 showModal:(title,body)=>{modal={title,body}},
 persist:()=>{},log:()=>{},addItem:(id,q=1,extra={})=>{G.character.inventory.push({id,qty:q,...extra})},
 removeItem:(id,q=1,index=null)=>{const arr=G.character.inventory,at=index==null?arr.findIndex(x=>x.id===id):index;if(at<0||arr[at].id!==id)return false;arr.splice(at,1);return true},
 beginTurn:()=>{G.turn++;return true},endTurn:()=>{},renderFacility:()=>{},
 shopBuyUnitPrice:d=>Math.ceil(d.value*1.15),shopSellUnitPrice:d=>Math.floor(d.value*.5),
 regionalItemMarketFactor:()=>1,itemTradeFlowFactor:()=>1
});
vm.runInContext("window=globalThis",ctx);
vm.runInContext(data,ctx);
vm.runInContext(code,ctx);
const {pricing}=vm.runInContext("QUNLU_TRADE_VENUES",ctx);
assert.ok(pricing,"pricing API exists");
const [f,e,d,c]=rows.slice(0,4).map(x=>pricing.auctionUnitReference(x));
assert.ok(f<e&&e<d&&d<c,JSON.stringify({f,e,d,c}));
assert.ok(e>=240&&d>=650&&c>=1800,"gear floor E/D/C");
assert.equal(pricing.isEquipment(rows[4]),false);
assert.equal(pricing.auctionQuote(rows[4],3,1).reference,pricing.auctionUnitReference(rows[4])*3);
assert.ok(pricing.auctionQuote(rows[2],1,8).start>=pricing.auctionGearMinimum(rows[2]));
assert.ok(pricing.auctionUnitReference(rows[3],G.character.inventory[0])<c,"damaged consigned gear discounted");
const state={listings:[
 {id:"NPC-LEGACY",itemId:"TEST-C",qty:1,startBid:200,currentBid:200,minIncrement:12,buyout:330,highest:"npc",playerEscrow:0},
 {id:"PLAYER-LEGACY",itemId:"TEST-D",qty:1,startBid:100,currentBid:145,minIncrement:10,buyout:200,highest:"player",playerEscrow:145},
 {id:"STACK-LEGACY",itemId:"TEST-MAT",qty:3,startBid:50,currentBid:50,minIncrement:3,buyout:85,highest:"npc",playerEscrow:0}
]};
pricing.repriceLegacyAuction(state);
assert.ok(state.listings[0].startBid>=pricing.auctionGearMinimum(rows[3]));
assert.ok(state.listings[0].buyout>state.listings[0].startBid);
assert.equal(state.listings[1].currentBid,145);
assert.equal(state.listings[1].buyout,200);
assert.ok(state.listings[2].startBid>=pricing.auctionQuote(rows[4],3,1).reference*.78);
vm.runInContext("openAuctionHouse()",ctx);
assert.ok(modal?.body.includes("拍賣參考"),"consignment UI uses auction reference");
const before=G.character.inventory[0].durability;
vm.runInContext("auctionConsign(0,0.9)",ctx);
const a=G.worldState.tradeVenues.auctions.TOWN.consignments[0];
assert.ok(a&&a.ask>=pricing.auctionGearMinimum(rows[3],{durability:before,maxDurability:115}));
assert.equal(a.durability,before);
G.worldTime.day=14;
vm.runInContext("openAuctionHouse()",ctx);
if(G.worldState.tradeVenues.auctions.TOWN.history[0]?.text.includes("流標")){
 const back=G.character.inventory.find(x=>x.id==="TEST-C");
 assert.equal(back?.durability,before,"unsold gear restores original durability");
}
const audit=vm.runInContext("runAuctionBlackMarketAudit()",ctx);
assert.equal(audit.pass,true,JSON.stringify(audit.issues));
const ver=JSON.parse(fs.readFileSync("version.json","utf8"));
assert.equal(ver.auction_equipment_pricing_revision,"AUCTION-GEAR-PRICE-1.0");
assert.match(ver.version,/^CURRENT-\d+\.\d+\.\d+$/);
const idx=fs.readFileSync("index.html","utf8"),sw=fs.readFileSync("sw.js","utf8");
assert.ok(idx.includes("src/trade-venues-runtime-v1.js?v="+ver.version));
assert.ok(sw.includes('CACHE_PREFIX+"'+ver.pwa_cache_revision+'"'));
console.log("auction pricing regression OK: tier floor, slot/quality, lot quantity, legacy bid escrow, consignment, durable return, audit");
