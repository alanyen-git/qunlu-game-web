/* 群陸旅誌：拍賣行／黑市runtime CURRENT-2.09.1
 * TRADE-VENUES-RUNTIME-1.0
 * 公開拍賣競價、玩家寄售、地下市場不定期窗口、前置資格與市場供需串接。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.09.1")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.09.1";
const REV="TRADE-VENUES-RUNTIME-1.0";
const DATA=globalThis.QUNLU_TRADE_VENUE_DATA||{};
const SYS=DB.trade_venue_system||{};
const AUC=SYS.auction||{};
const BM=SYS.black_market||{};
const AUCTION_ID=AUC.facility_id||"auction";
const BADGE_ID=DATA.badgeItemId||BM.credential_item_ids?.[0]||"IT-BM-GRAY-SIGIL";
const PASS_ID=DATA.passItemId||BM.credential_item_ids?.[1]||"IT-BM-NIGHT-PASS";
const TIER={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const UNDERGROUND_RE=/黑市|地下交易|暗市|走私|密運|掮客|暗號|灰市|無燈|灰印|私貨|禁售|地下商/i;
const RAW={
 renderFacility:typeof globalThis.renderFacility==="function"?globalThis.renderFacility:null,
 turnInQuest:typeof globalThis.turnInQuest==="function"?globalThis.turnInQuest:null,
 resolveAdventureEvent:typeof globalThis.resolveAdventureEvent==="function"?globalThis.resolveAdventureEvent:null,
 recordIntel:typeof globalThis.recordIntel==="function"?globalThis.recordIntel:null,
 canSellTo:typeof globalThis.canSellTo==="function"?globalThis.canSellTo:null
};
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const rank=t=>TIER[String(t||"F")]??0;
const tiers=["F","E","D","C","B","A","S"];
function hash(v){let h=2166136261;for(const ch of String(v??"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function itemData(id){return (DB.items||[]).find(x=>x?.id===id)||null}
function locationData(id=G?.character?.locationId){return (DB.locations||[]).find(x=>x?.id===id)||null}
function totalGameHours(){const t=G?.worldTime||{};return (Number(t.day||1)-1)*24+Number(t.hour||0)+Number(t.minute||0)/60}
function invQty(id){return (G?.character?.inventory||[]).reduce((n,x)=>n+(x?.id===id?Number(x.qty||1):0),0)}
function grantItem(id,qty=1){for(let i=0;i<qty;i++)if(typeof globalThis.addItem==="function")globalThis.addItem(id)}
function removeOne(id,index=null){return typeof globalThis.removeItem==="function"?globalThis.removeItem(id,1,index):false}
function save(){try{globalThis.persist?.()}catch(e){}}
function journal(tag,msg,cl=""){try{globalThis.log?.(tag,msg,cl)}catch(e){}}
function marketBuy(d){try{return Math.max(1,Number(globalThis.shopBuyUnitPrice?.(d))||0)}catch(e){return Math.max(1,Math.ceil((d?.value||1)*1.15))}}
function marketSell(d){try{return Math.max(1,Number(globalThis.shopSellUnitPrice?.(d))||0)}catch(e){return Math.max(1,Math.floor((d?.value||1)*.5))}}
function begin(reason){return typeof globalThis.beginTurn==="function"?globalThis.beginTurn(reason):true}
function finish(hours){if(typeof globalThis.endTurn==="function")globalThis.endTurn(hours);else save()}
function root(){
 G.worldState=G.worldState||{};
 G.worldState.tradeVenues=G.worldState.tradeVenues&&typeof G.worldState.tradeVenues==="object"?G.worldState.tradeVenues:{};
 const r=G.worldState.tradeVenues;r.version=REV;r.auctions=r.auctions&&typeof r.auctions==="object"?r.auctions:{};r.blackMarkets=r.blackMarkets&&typeof r.blackMarkets==="object"?r.blackMarkets:{};
 G.character.blackMarketAccess=G.character.blackMarketAccess&&typeof G.character.blackMarketAccess==="object"?G.character.blackMarketAccess:{};
 const a=G.character.blackMarketAccess;a.version=REV;a.evidence=Array.isArray(a.evidence)?a.evidence.slice(-24):[];a.passWindows=a.passWindows&&typeof a.passWindows==="object"?a.passWindows:{};
 return r
}
function accessRoot(){root();return G.character.blackMarketAccess}
function recordTrade(d,qty,source){
 if(!d||!G?.worldState)return;
 G.worldState.itemMarketTradeLedger=Array.isArray(G.worldState.itemMarketTradeLedger)?G.worldState.itemMarketTradeLedger:[];
 const l=locationData();
 G.worldState.itemMarketTradeLedger.push({hour:totalGameHours(),locationId:G.character.locationId,regionId:l?.world_region_id||l?.region_id||"unknown",itemId:d.id,qty:Number(qty)||0,source});
 if(G.worldState.itemMarketTradeLedger.length>300)G.worldState.itemMarketTradeLedger=G.worldState.itemMarketTradeLedger.slice(-300)
}
function auctionEligible(l=locationData()){return typeof DATA.isAuctionSettlement==="function"?DATA.isAuctionSettlement(l):(l?.kind==="town"&&(l.facilities||[]).includes(AUCTION_ID))}
function auctionLevelLabel(l=locationData()){
 if((DB.political_entities||[]).some(p=>[p?.capital,p?.capital_location_id].includes(l?.id)))return "國都級城市";
 if((DB.realm_region_maps||[]).some(p=>[p?.capital,p?.capital_location_id].includes(l?.id)))return "國都／大區首府";
 return "省級城市"
}
function auctionState(lid=G.character.locationId){
 const r=root();
 r.auctions[lid]=r.auctions[lid]&&typeof r.auctions[lid]==="object"?r.auctions[lid]:{refreshAt:0,listings:[],consignments:[],history:[]};
 const s=r.auctions[lid];s.listings=Array.isArray(s.listings)?s.listings:[];s.consignments=Array.isArray(s.consignments)?s.consignments:[];s.history=Array.isArray(s.history)?s.history.slice(0,30):[];return s
}
function auctionCandidates(l){
 const cap=Math.min(6,Math.max(2,rank(l?.tier||"F")+1));
 return (DB.items||[]).filter(d=>d?.id&&Number(d.value)>0&&!d.not_auctionable&&!d.trade_credential&&rank(d.tier)<=cap&&!["憑證"].includes(d.type))
}
function seededUnique(pool,count,seed){
 const work=[...pool],out=[];let x=hash(seed);
 while(work.length&&out.length<count){x=Math.imul(x^0x9e3779b9,1664525)+1013904223>>>0;out.push(work.splice(x%work.length,1)[0])}
 return out
}
function settleAuction(s=auctionState()){
 const now=totalGameHours();let changed=false;
 const live=[];
 for(const a of s.listings){
  if(Number(a.expiresAt)>now){live.push(a);continue}
  changed=true;
  if(a.highest==="player"&&a.playerEscrow>0){grantItem(a.itemId,a.qty||1);const d=itemData(a.itemId);recordTrade(d,-(a.qty||1),"auction_win");s.history.unshift({time:now,text:`得標 ${d?.name||a.itemId} ×${a.qty||1}，成交${a.currentBid}銀。`});journal("拍賣行",`得標 ${d?.name||a.itemId} ×${a.qty||1}，成交${a.currentBid}銀。`,"ok")}
 }
 s.listings=live;
 const consign=[];
 for(const a of s.consignments){
  if(Number(a.expiresAt)>now){consign.push(a);continue}
  changed=true;const d=itemData(a.itemId),sold=(hash(a.id+"|settle")%100)<Number(a.saleChance||0);
  if(sold){const net=Math.max(1,Math.floor(a.ask*(1-(AUC.commission_rate??.08))));G.character.moneySilver+=net;recordTrade(d,1,"auction_consignment");s.history.unshift({time:now,text:`寄售成交 ${d?.name||a.itemId}，實收${net}銀。`});journal("拍賣行",`寄售成交 ${d?.name||a.itemId}，扣除佣金後實收${net}銀。`,"ok")}
  else{grantItem(a.itemId,1);s.history.unshift({time:now,text:`寄售流標 ${d?.name||a.itemId}，物品已退回。`});journal("拍賣行",`寄售 ${d?.name||a.itemId} 流標，物品已退回。`)}
 }
 s.consignments=consign;if(s.history.length>30)s.history.length=30;if(changed)save();return changed
}
function refreshAuction(s=auctionState(),l=locationData()){
 settleAuction(s);const now=totalGameHours();
 if(s.refreshAt>now&&s.listings.length)return;
 const min=AUC.npc_listing_min??6,max=AUC.npc_listing_max??10,target=min+(hash(`${l.id}|${Math.floor(now/24)}`)%Math.max(1,max-min+1));
 const need=Math.max(0,target-s.listings.length),pool=auctionCandidates(l).filter(d=>!s.listings.some(x=>x.itemId===d.id));
 for(const [i,d] of seededUnique(pool,need,`${l.id}|auction|${Math.floor(now/24)}`).entries()){
  const base=marketBuy(d),seed=hash(`${l.id}|${d.id}|${Math.floor(now/24)}|${i}`),qty=d.stackable?1+(seed%3):1;
  const start=Math.max(1,Math.ceil(base*(.78+(seed%13)/100))),increment=Math.max(1,Math.ceil(start*(AUC.bid_increment_rate??.06))),buyout=Math.max(start+increment,Math.ceil(base*(1.06+((seed>>>8)%18)/100)));
  s.listings.push({id:`AUC-${l.id}-${Math.floor(now)}-${seed.toString(36)}`,itemId:d.id,qty,startBid:start,currentBid:start,minIncrement:increment,buyout,highest:"npc",playerEscrow:0,competition:28+((seed>>>12)%34),expiresAt:now+18+((seed>>>18)%31)})
 }
 s.refreshAt=now+(AUC.refresh_hours??24);save()
}
function auctionTimeLeft(a){const h=Math.max(0,a.expiresAt-totalGameHours());return h<1?`${Math.max(1,Math.ceil(h*60))}分`:`${Math.ceil(h)}小時`}
function openAuctionHouse(){
 const l=locationData();if(!auctionEligible(l)||G.character.currentFacility!==AUCTION_ID){globalThis.showModal?.("拍賣行",`<div class="card small">此地不是省級行政中心以上城市，沒有正式拍賣行。</div>`);return}
 const s=auctionState();refreshAuction(s,l);settleAuction(s);
 const listings=s.listings.slice().sort((a,b)=>rank(itemData(a.itemId)?.tier)-rank(itemData(b.itemId)?.tier)||a.currentBid-b.currentBid);
 const rows=listings.map(a=>{const d=itemData(a.itemId),player=a.highest==="player",bid=a.currentBid+a.minIncrement,buyDue=a.buyout-(player?a.playerEscrow:0);return `<div class="itemrow"><span><b>${esc(d?.name||a.itemId)}</b> <span class="tier">${esc(d?.tier||"F")}</span> ×${a.qty||1}<br><span class="small">目前${a.currentBid}銀｜直購${a.buyout}銀｜剩餘${auctionTimeLeft(a)}${player?"｜你目前最高價":""}</span></span><span>${player?`<button disabled>最高價 ${a.currentBid}</button>`:`<button ${G.character.moneySilver>=bid?"":"disabled"} onclick="auctionBid('${esc(a.id)}')">出價${bid}</button>`}<button ${G.character.moneySilver>=buyDue?"":"disabled"} onclick="auctionBuyout('${esc(a.id)}')">直購</button></span></div>`}).join("")||"<div class='card small'>目前沒有公開拍品。</div>";
 const inv=(G.character.inventory||[]).map((x,i)=>[x,i,itemData(x.id)]).filter(([, ,d])=>d&&Number(d.value)>0&&!d.not_auctionable&&!d.trade_credential).slice(0,30);
 const consign=inv.map(([x,i,d])=>{const base=marketBuy(d);return `<div class="itemrow"><span>${esc(d.name)} <span class="tier">${esc(d.tier)}</span> ×${x.qty||1}<br><span class="small">參考公開零售 ${base}銀；刊登費2%，成交再收8%佣金。</span></span><span><button onclick="auctionConsign(${i},0.9)">快售</button><button onclick="auctionConsign(${i},1.1)">標準</button><button onclick="auctionConsign(${i},1.35)">高價</button></span></div>`}).join("")||"<div class='card small'>背包沒有可寄售物品。</div>";
 const pending=s.consignments.map(a=>`<div class="small">• ${esc(itemData(a.itemId)?.name||a.itemId)}｜開價${a.ask}銀｜約${auctionTimeLeft(a)}後結算</div>`).join("")||"<div class='small'>目前沒有進行中的寄售。</div>";
 globalThis.showModal?.("拍賣行",`<div class="card"><b>${esc(l.name)}・${auctionLevelLabel(l)}</b><br><span class="small">正式拍賣行只存在於省級城市及以上。NPC拍品每24小時補充；競價資金採保證金制，得標後物品自動入庫。</span></div><h3>公開拍品</h3>${rows}<h3>我的寄售</h3><div class="card">${pending}</div>${consign}<div class="actions"><button onclick="openFacilities()">離開拍賣行</button></div>`,`openAuctionHouse()`)
}
function findAuctionListing(id){const s=auctionState();settleAuction(s);return [s,s.listings.find(x=>x.id===id)]}
function auctionBid(id){
 if(G.character.currentFacility!==AUCTION_ID||!auctionEligible())return;const [s,a]=findAuctionListing(id);if(!a||a.highest==="player")return;
 const bid=a.currentBid+a.minIncrement;if(G.character.moneySilver<bid)return;if(!begin("拍賣競價"))return;
 G.character.moneySilver-=bid;const counter=(hash(`${a.id}|${G.turn}|${bid}`)%100)<a.competition;
 if(counter){const counterBid=Math.min(a.buyout-1,bid+a.minIncrement);G.character.moneySilver+=bid;a.currentBid=Math.max(bid,counterBid);a.highest="npc";a.playerEscrow=0;journal("拍賣行",`${itemData(a.itemId)?.name||a.itemId}：你出價${bid}銀後遭其他買家加價。`)}
 else{a.currentBid=bid;a.highest="player";a.playerEscrow=bid;journal("拍賣行",`${itemData(a.itemId)?.name||a.itemId}：目前由你以${bid}銀領先。`,"ok")}
 finish(.1);openAuctionHouse()
}
function auctionBuyout(id){
 if(G.character.currentFacility!==AUCTION_ID||!auctionEligible())return;const [s,a]=findAuctionListing(id);if(!a)return;
 const held=a.highest==="player"?Number(a.playerEscrow||0):0,due=Math.max(0,a.buyout-held);if(G.character.moneySilver<due)return;if(!begin("拍賣直購"))return;
 G.character.moneySilver-=due;grantItem(a.itemId,a.qty||1);recordTrade(itemData(a.itemId),-(a.qty||1),"auction_buyout");s.listings=s.listings.filter(x=>x.id!==a.id);s.history.unshift({time:totalGameHours(),text:`直購 ${itemData(a.itemId)?.name||a.itemId} ×${a.qty||1}，成交${a.buyout}銀。`});journal("拍賣行",`直購 ${itemData(a.itemId)?.name||a.itemId} ×${a.qty||1}，成交${a.buyout}銀。`,"ok");finish(.15);openAuctionHouse()
}
function auctionConsign(index,mult=1.1){
 if(G.character.currentFacility!==AUCTION_ID||!auctionEligible())return;const x=G.character.inventory?.[index],d=x&&itemData(x.id);if(!d||d.not_auctionable||d.trade_credential)return;
 const s=auctionState(),base=marketBuy(d),ask=Math.max(1,Math.ceil(base*clamp(mult,.8,1.5))),fee=Math.max(1,Math.ceil(ask*(AUC.listing_fee_rate??.02)));if(G.character.moneySilver<fee)return;if(!begin("拍賣寄售"))return;
 if(!removeOne(d.id,index)){finish(0);return}G.character.moneySilver-=fee;const chance=mult<=.95?84:mult<=1.15?62:34,now=totalGameHours(),seed=hash(`${G.meta?.characterId}|${d.id}|${G.turn}|${index}`);
 s.consignments.push({id:`CON-${G.turn}-${seed.toString(36)}`,itemId:d.id,ask,fee,saleChance:chance,createdAt:now,expiresAt:now+(AUC.listing_hours??48)});journal("拍賣行",`寄售 ${d.name}，開價${ask}銀，刊登費${fee}銀。`,"ok");finish(.2);openAuctionHouse()
}

function noteEvidence(kind,key,label,silent=false){
 const a=accessRoot(),k=String(kind||"intel"),id=String(key||`${k}:${label||"線索"}`);if(a.evidence.some(x=>x.key===id))return false;
 a.evidence.push({key:id,kind:k,label:String(label||k).slice(0,100),turn:Number(G.turn||0),hour:totalGameHours()});if(a.evidence.length>24)a.evidence=a.evidence.slice(-24);
 if(!silent)journal("地下線索",`取得黑市接觸線索：${esc(label||k)}。`,"ok");save();return true
}
function fameScore(){
 const c=G.character,vals=[Number(c.guildReputation||0)];
 for(const obj of [c.organizations?.reputation,c.politicalStanding,c.disciplines?.reputation,c.faith?.standing])for(const v of Object.values(obj||{}))vals.push(Number(v)||0);
 return Math.max(0,...vals)
}
function credential(kind){return kind==="badge"?invQty(BADGE_ID)>0:invQty(PASS_ID)>0}
function syncDerivedEvidence(){
 const a=accessRoot();
 for(const q of (G.questHistory||[]))if(q?.status==="完成"&&rank(q.tier)>=rank("D"))noteEvidence("quest",`quest:${q.id}`,`完成${q.tier}級委託「${q.name}」`,true);
 for(const e of (G.worldState?.integratedEvents||[])){
  if(/story|narrative|plot|scenario/i.test(String(e?.type||""))||UNDERGROUND_RE.test(String(e?.summary||"")))noteEvidence("story",`event:${e.id||e.turn}:${e.type}`,e.summary||"劇情接觸",true)
 }
 for(const k of (G.knownIntel||[])){
  const rec=(DB.intel_database?.records||[]).find(x=>x?.id===k.id),txt=k.textSnapshot||rec?.text||"";
  if(UNDERGROUND_RE.test(txt))noteEvidence("intel",`intel:${k.id}`,txt,true)
 }
 if(a.evidence.length>24)a.evidence=a.evidence.slice(-24)
}
function blackWindow(lid=G.character.locationId,at=totalGameHours()){
 const cycleHours=BM.cycle_hours??96,cycle=Math.floor(at/cycleHours),seed=hash(`${lid}|black-market|${cycle}`),duration=(BM.min_window_hours??8)+(seed%((BM.max_window_hours??14)-(BM.min_window_hours??8)+1)),room=Math.max(1,cycleHours-duration-6),start=cycle*cycleHours+3+((seed>>>6)%room),end=start+duration;
 return {key:`${lid}|${cycle}|${Math.floor(start)}`,cycle,start,end,duration,open:at>=start&&at<end}
}
function blackState(win=blackWindow()){
 const r=root(),lid=G.character.locationId;
 r.blackMarkets[lid]=r.blackMarkets[lid]&&typeof r.blackMarkets[lid]==="object"?r.blackMarkets[lid]:{};
 const holder=r.blackMarkets[lid];
 if(holder.windowKey!==win.key){holder.windowKey=win.key;holder.stock={};holder.prices={};holder.heat=0;holder.budget=0;holder.burned=false;holder.generated=false}
 return holder
}
function blackGate(win=blackWindow()){
 syncDerivedEvidence();const a=accessRoot(),f=fameScore(),windowPass=!!a.passWindows?.[win.key];
 const paths=[];if(credential("badge"))paths.push("灰印徽章");if(a.evidence.length)paths.push(`地下線索${a.evidence.length}筆`);if(f>=(BM.fame_threshold??12))paths.push(`名聲${f}`);if(windowPass)paths.push("本次開市已驗票");if(credential("pass"))paths.push("無燈市入場券");
 const via=credential("badge")?"badge":a.evidence.length?"evidence":f>=(BM.fame_threshold??12)?"fame":windowPass?"window_pass":credential("pass")?"pass":null;
 return {ok:!!via,via,paths,fame:f,evidence:a.evidence.length,hasBadge:credential("badge"),hasPass:credential("pass"),windowPass}
}
function blackKnown(){const a=accessRoot();syncDerivedEvidence();return a.evidence.length>0||credential("badge")||credential("pass")||fameScore()>=(BM.fame_threshold??12)}
function consumeWindowPass(win,gate){
 if(gate.via!=="pass"||gate.windowPass)return true;const a=accessRoot();if(!removeOne(PASS_ID))return false;a.passWindows[win.key]=true;
 const keys=Object.keys(a.passWindows);if(keys.length>8)for(const k of keys.slice(0,keys.length-8))delete a.passWindows[k];journal("黑市","無燈市入場券已核銷，本次開市期間可重複進出。","ok");return true
}
function grantCredential(kind,source="地下線索"){
 const id=kind==="badge"?BADGE_ID:PASS_ID,d=itemData(id);if(!d)return false;if(kind==="badge"&&invQty(id)>0)return false;grantItem(id,1);journal("地下憑證",`取得「${d.name}」：${source}。`,"ok");save();return true
}
function blackCandidates(l){
 const playerRank=Math.max(rank(G.character.adventureRank||"F"),rank(G.character.combatGrade||"F")),cap=Math.min(6,Math.max(rank(l?.tier||"F")+2,playerRank+1));
 return (DB.items||[]).filter(d=>d?.id&&Number(d.value)>0&&!d.trade_credential&&!d.not_auctionable&&rank(d.tier)<=cap&&d.type!=="憑證")
}
function generateBlackStock(win=blackWindow(),s=blackState(win)){
 if(s.generated)return s;const l=locationData(),pool=blackCandidates(l),count=5+(hash(win.key)%4),picks=seededUnique(pool,count,win.key+"|stock");
 s.stock={};s.prices={};for(const [i,d] of picks.entries()){const seed=hash(`${win.key}|${d.id}|${i}`);s.stock[d.id]=d.stackable?1+(seed%2):1;s.prices[d.id]=Math.max(1,Math.ceil(marketBuy(d)*(1.18+((seed>>>8)%43)/100)))}
 s.budget=Math.max(180,Math.round((rank(l?.tier||"F")+1)*340+fameScore()*12));s.generated=true;save();return s
}
function blackMarketSellPrice(d){return Math.max(1,Math.floor(marketSell(d)*1.15))}
function openBlackMarketContact(){
 const l=locationData(),win=blackWindow(),gate=blackGate(win),s=blackState(win),status=win.open&&!s.burned?"開市中":s.burned?"本次接頭已因風險過高中止":"目前沒有開市暗號";
 const req=["完成D級以上委託","成功奇遇／特殊接觸","取得地下劇情或情報線索","持有灰印徽章或無燈市入場券",`任一主要名聲達 ${BM.fame_threshold??12}`].map(x=>`<div class="small">• ${x}</div>`).join("");
 globalThis.showModal?.("地下交易接頭",`<div class="card"><b>${esc(l?.name||"此地")}｜${status}</b><br><span class="small">黑市不是固定設施；各聚落約每四日出現一次不同的8–14小時交易窗口，實際時段由當地暗號決定。</span></div><div class="card"><b>目前資格</b><br><span class="small">${gate.ok?`可接觸｜${esc(gate.paths.join("、"))}`:`尚未取得接觸資格｜目前名聲 ${gate.fame}/${BM.fame_threshold??12}`}</span></div><div class="card"><b>可取得資格的來源</b>${req}</div><div class="actions">${win.open&&!s.burned&&gate.ok?`<button class="good" onclick="openBlackMarket()">依暗號入場</button>`:""}<button onclick="renderFacility('${esc(G.character.currentFacility||"tavern")}')">返回</button></div>`)
}
function openBlackMarket(){
 const l=locationData(),win=blackWindow(),s=blackState(win),gate=blackGate(win);if(!blackKnown()||!gate.ok||!win.open||s.burned){openBlackMarketContact();return}if(!consumeWindowPass(win,gate)){openBlackMarketContact();return}generateBlackStock(win,s);
 const rows=Object.entries(s.stock).filter(([,q])=>q>0).map(([id,q])=>{const d=itemData(id),p=s.prices[id];return `<div class="itemrow"><span><b>${esc(d?.name||id)}</b> <span class="tier">${esc(d?.tier||"F")}</span> ×${q}<br><span class="small">地下溢價｜本次庫存有限</span></span><span>${p}銀 <button ${G.character.moneySilver>=p?"":"disabled"} onclick="blackMarketBuy('${esc(id)}')">購買</button></span></div>`}).join("")||"<div class='card small'>本次貨源已清空。</div>";
 const sell=(G.character.inventory||[]).map((x,i)=>[x,i,itemData(x.id)]).filter(([, ,d])=>d&&Number(d.value)>0&&!d.trade_credential&&!d.not_sellable).slice(0,24).map(([x,i,d])=>{const p=blackMarketSellPrice(d),ok=s.budget>=p;return `<div class="itemrow"><span>${esc(d.name)} ×${x.qty||1}</span><span>${p}銀 <button ${ok?"":"disabled"} onclick="blackMarketSell(${i})">出售1</button></span></div>`}).join("")||"<div class='card small'>沒有適合交給地下掮客的物品。</div>";
 globalThis.showModal?.("黑市",`<div class="card"><b>${esc(l.name)}・不定期地下交易</b><br><span class="small">資格：${esc(blackGate(win).paths.join("、"))}｜風險熱度 ${Math.round(s.heat)}/${BM.heat_limit??100}｜掮客剩餘資金 ${Math.round(s.budget)}銀。交易越多，本次接頭越可能提前結束。</span></div><h3>地下貨源</h3>${rows}<h3>地下收購</h3>${sell}<div class="actions"><button onclick="openBlackMarketContact()">離開黑市</button></div>`,`openBlackMarket()`)
}
function blackMarketBuy(id){
 const win=blackWindow(),s=blackState(win),gate=blackGate(win),d=itemData(id),qty=Number(s.stock?.[id]||0),p=Number(s.prices?.[id]||0);if(!win.open||s.burned||!gate.ok||qty<1||!d||G.character.moneySilver<p)return;if(!begin("黑市購買"))return;
 G.character.moneySilver-=p;s.stock[id]=qty-1;grantItem(id,1);recordTrade(d,-.45,"black_market_buy");s.heat=clamp(Number(s.heat||0)+8+rank(d.tier)*4,0,140);if(s.heat>=(BM.heat_limit??100)){s.burned=true;journal("黑市","交易動靜過大，掮客提前切斷本次接頭。","warnText")}else journal("黑市",`以${p}銀取得 ${d.name}。`,"ok");finish(.15);s.burned?openBlackMarketContact():openBlackMarket()
}
function blackMarketSell(index){
 const win=blackWindow(),s=blackState(win),gate=blackGate(win),x=G.character.inventory?.[index],d=x&&itemData(x.id);if(!win.open||s.burned||!gate.ok||!d||d.trade_credential||d.not_sellable)return;const p=blackMarketSellPrice(d);if(s.budget<p)return;if(!begin("黑市出售"))return;
 if(!removeOne(d.id,index)){finish(0);return}s.budget-=p;G.character.moneySilver+=p;recordTrade(d,.5,"black_market_sell");s.heat=clamp(Number(s.heat||0)+5+rank(d.tier)*2,0,140);if(s.heat>=(BM.heat_limit??100)){s.burned=true;journal("黑市","收貨後風聲變緊，本次接頭立即散場。","warnText")}else journal("黑市",`出售 ${d.name}，取得${p}銀。`,"ok");finish(.12);s.burned?openBlackMarketContact():openBlackMarket()
}
function decorateBlackMarketButton(fid){
 if(!["tavern","inn","general","guild"].includes(fid)||locationData()?.kind!=="town"||!blackKnown())return;
 const body=document.getElementById("modalBody");if(!body||body.querySelector("[data-black-market-contact]"))return;const actions=body.querySelector(".actions");if(!actions)return;
 const win=blackWindow(),s=blackState(win),gate=blackGate(win),b=document.createElement("button");b.type="button";b.dataset.blackMarketContact="1";b.textContent=win.open&&!s.burned&&gate.ok?"黑市接頭・開市中":"地下交易接頭";if(win.open&&!s.burned&&gate.ok)b.className="good";b.addEventListener("click",()=>win.open&&!s.burned&&blackGate(win).ok?openBlackMarket():openBlackMarketContact());actions.appendChild(b)
}
function maybeGrantFromEvidence(){
 const a=accessRoot(),kinds=new Set(a.evidence.map(x=>x.kind));if(kinds.size>=3&&!credential("badge"))grantCredential("badge","累積三種不同地下接觸來源")
}

if(RAW.renderFacility){
 globalThis.renderFacility=function(fid){if(fid===AUCTION_ID)return openAuctionHouse();const out=RAW.renderFacility.apply(this,arguments);try{decorateBlackMarketButton(fid)}catch(e){console.warn("black market button decorate failed",e)}return out}
}
if(RAW.canSellTo){globalThis.canSellTo=function(fid,d){if(d?.trade_credential||d?.not_sellable)return false;return RAW.canSellTo.apply(this,arguments)}}
if(RAW.turnInQuest){
 globalThis.turnInQuest=function(id){const q=(G.quests||[]).find(x=>x.id===id),before=!!q,out=RAW.turnInQuest.apply(this,arguments),done=before&&q&&!(G.quests||[]).some(x=>x.id===id);
  if(done&&rank(q.tier)>=rank("D")){noteEvidence("quest",`quest:${q.id}`,`完成${q.tier}級委託「${q.name}」`);if(rank(q.tier)>=rank("C")||(hash(q.id+"|pass")%100)<24)grantCredential("pass",`委託「${q.name}」的地下引介`);maybeGrantFromEvidence()}return out}
}
if(RAW.resolveAdventureEvent){
 globalThis.resolveAdventureEvent=function(choice){const ev=G.pendingAdventureEvent?{...G.pendingAdventureEvent}:null,t=ev?(DB.adventure_event_templates||[]).find(x=>x?.id===ev.templateId):null,before=(G.worldState?.integratedEvents||[]).length,out=RAW.resolveAdventureEvent.apply(this,arguments);
  if(choice!=="leave"&&ev){const fresh=(G.worldState?.integratedEvents||[]).slice(0,Math.max(1,(G.worldState?.integratedEvents||[]).length-before+1)).find(x=>x?.type==="adventure_event"&&x?.data?.templateId===ev.templateId);if(fresh?.data?.success){noteEvidence("encounter",`encounter:${ev.id}`,`奇遇「${t?.name||ev.name}」`);if(rank(t?.tier||"F")>=rank("C")||(hash(ev.id+"|pass")%100)<18)grantCredential("pass",`奇遇「${t?.name||ev.name}」取得的暗號`);maybeGrantFromEvidence()}}return out}
}
if(RAW.recordIntel){
 globalThis.recordIntel=function(id){const cached=Object.values(G.intelBoardCache||{}).flat().find(v=>v?.id===id),rec=(DB.intel_database?.records||[]).find(x=>x?.id===id)||cached,text=String(rec?.text||"");const out=RAW.recordIntel.apply(this,arguments);if(rec&&UNDERGROUND_RE.test(text)){noteEvidence("intel",`intel:${id}`,text);maybeGrantFromEvidence()}return out}
}

function audit(){
 const issues=[],dataAudit=typeof globalThis.runTradeVenueDataAudit==="function"?globalThis.runTradeVenueDataAudit():null;if(dataAudit?.pass===false)issues.push(...dataAudit.issues.map(x=>"靜態:"+x));
 if(typeof globalThis.openAuctionHouse!=="function")issues.push("拍賣行入口未註冊");
 if(typeof globalThis.openBlackMarket!=="function")issues.push("黑市入口未註冊");
 if(!Number.isFinite(Number(BM.fame_threshold)))issues.push("黑市名聲門檻缺失");
 if((BM.min_window_hours??0)<1||(BM.cycle_hours??0)<(BM.max_window_hours??0))issues.push("黑市開市週期設定異常");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],auction_city_count:(DB.locations||[]).filter(x=>(x.facilities||[]).includes(AUCTION_ID)).length,black_market_access_kinds:BM.access_kinds||[],save_compatible:true}
}

globalThis.openAuctionHouse=openAuctionHouse;globalThis.auctionBid=auctionBid;globalThis.auctionBuyout=auctionBuyout;globalThis.auctionConsign=auctionConsign;
globalThis.openBlackMarket=openBlackMarket;globalThis.openBlackMarketContact=openBlackMarketContact;globalThis.blackMarketBuy=blackMarketBuy;globalThis.blackMarketSell=blackMarketSell;
globalThis.grantBlackMarketCredential=grantCredential;globalThis.noteBlackMarketEvidence=noteEvidence;globalThis.runAuctionBlackMarketAudit=audit;
globalThis.QUNLU_TRADE_VENUES={version:REV,release:RELEASE,audit,auctionEligible,blackWindow,blackGate,fameScore,noteEvidence,grantCredential};
DB.meta=DB.meta||{};DB.meta.trade_venues_runtime_revision=REV;
CORE?.registerModule?.("src/trade-venues-runtime-v1.js",{domain:"runtime",revision:REV,release:RELEASE});
})();
