/* 群陸旅誌：拍賣行／黑市靜態資料 CURRENT-2.09.0
 * TRADE-VENUES-DATA-1.0
 * 拍賣行只配置於省級行政中心與國都；黑市憑證納入正式物品資料，供runtime資格檢核。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.09.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.09.0";
const REV="TRADE-VENUES-DATA-1.0";
const AUCTION_ID="auction";
const BADGE_ID="IT-BM-GRAY-SIGIL";
const PASS_ID="IT-BM-NIGHT-PASS";
const rows=key=>Array.isArray(DB[key])?DB[key]:[];
const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];

function upsertItem(row){
 const i=rows("items").findIndex(x=>x?.id===row.id);
 if(i>=0)DB.items[i]=Object.assign({},DB.items[i],row);
 else DB.items.push(row);
}
function capitalIdSet(){
 const ids=new Set();
 for(const p of rows("province_region_maps"))if(p?.capital_location_id)ids.add(p.capital_location_id);
 for(const r of rows("realm_region_maps"))for(const id of [r?.capital_location_id,r?.capital])if(id)ids.add(id);
 for(const p of rows("political_entities"))for(const id of [p?.capital_location_id,p?.capital])if(id)ids.add(id);
 return ids
}
function isAuctionSettlement(l,capitals=capitalIdSet()){
 if(!l||l.kind!=="town")return false;
 if(capitals.has(l.id))return true;
 /* 僅在舊資料完全沒有行政地圖時，才允許用明確文字標記回退；不以F-S層級推測城市行政級別。 */
 const hasProvinceMaps=rows("province_region_maps").some(x=>x?.capital_location_id);
 if(hasProvinceMaps)return false;
 return /省會|省級|首都|王都|帝都|國都/.test([l.size,l.political_role,l.settlement_class].filter(Boolean).join(" "))
}

DB.facilities=DB.facilities&&typeof DB.facilities==="object"?DB.facilities:{};
DB.facilities[AUCTION_ID]=Object.assign({},DB.facilities[AUCTION_ID]||{}, {
 id:AUCTION_ID,name:"拍賣行",shop:false,trade_venue:true,public_access:true,
 description:"由地方特許商會維持的公開競價市場，只設於省級行政中心、國都與同等級城市。"
});

upsertItem({
 id:BADGE_ID,name:"灰印徽章",kind:"credential",type:"憑證",catalog_group:"其他",stackable:false,tier:"D",weight:.02,value:0,
 trade_credential:"black_market_badge",not_sellable:true,not_auctionable:true,
 description:"地下掮客認得的灰色印記。持有者可在黑市開市時證明接觸資格；不代表任何公開法律身分。"
});
upsertItem({
 id:PASS_ID,name:"無燈市入場券",kind:"credential",type:"憑證",catalog_group:"其他",stackable:true,tier:"E",weight:.01,value:0,
 trade_credential:"black_market_pass",not_sellable:true,not_auctionable:true,
 description:"只在特定地下交易圈流通的短期入場憑證。黑市仍須處於開市時段才可使用。"
});

const capitals=capitalIdSet();
let auctionCityCount=0;
for(const l of rows("locations")){
 l.facilities=uniq(l.facilities||[]);
 const eligible=isAuctionSettlement(l,capitals);
 if(eligible){if(!l.facilities.includes(AUCTION_ID))l.facilities.push(AUCTION_ID);auctionCityCount++}
 else if(l.facilities.includes(AUCTION_ID))l.facilities=l.facilities.filter(x=>x!==AUCTION_ID);
}

DB.meta=DB.meta||{};
DB.meta.trade_venues_data_revision=REV;
DB.trade_venue_system=Object.assign({},DB.trade_venue_system||{}, {
 version:"TRADE-VENUES-1.0",release:RELEASE,
 auction:{
  facility_id:AUCTION_ID,refresh_hours:24,listing_hours:48,listing_fee_rate:.02,commission_rate:.08,
  bid_increment_rate:.06,npc_listing_min:6,npc_listing_max:10,
  placement_rule:"只在province_region_maps.capital_location_id、國都或同級明確行政中心設置；不得僅以世界F-S層級推測。"
 },
 black_market:{
  cycle_hours:96,min_window_hours:8,max_window_hours:14,fame_threshold:12,heat_limit:100,
  access_kinds:["story","quest","encounter","intel","badge","pass","fame"],credential_item_ids:[BADGE_ID,PASS_ID],
  principle:"黑市不是固定設施；各聚落開市時段不同，且必須先取得劇情、委託、奇遇、地下情報、徽章／入場券或足夠名聲之一的接觸資格。"
 },
 save_compatible:true,auction_city_count:auctionCityCount
});

function audit(){
 const issues=[],caps=capitalIdSet();
 if(!DB.facilities?.[AUCTION_ID])issues.push("拍賣行設施資料缺失");
 for(const id of [BADGE_ID,PASS_ID])if(!rows("items").some(x=>x?.id===id))issues.push("黑市憑證缺失:"+id);
 for(const l of rows("locations"))if((l.facilities||[]).includes(AUCTION_ID)&&!isAuctionSettlement(l,caps))issues.push("非省級城市誤設拍賣行:"+(l.name||l.id));
 for(const p of rows("province_region_maps")){
  const l=rows("locations").find(x=>x?.id===p?.capital_location_id);
  if(l?.kind==="town"&&!(l.facilities||[]).includes(AUCTION_ID))issues.push("省級行政中心缺拍賣行:"+(l.name||l.id));
 }
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],auction_city_count:rows("locations").filter(x=>(x.facilities||[]).includes(AUCTION_ID)).length,save_compatible:true}
}

globalThis.QUNLU_TRADE_VENUE_DATA={version:REV,release:RELEASE,auctionFacilityId:AUCTION_ID,badgeItemId:BADGE_ID,passItemId:PASS_ID,isAuctionSettlement,audit};
globalThis.runTradeVenueDataAudit=audit;
CORE?.registerModule?.("src/trade-venues-data-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();
