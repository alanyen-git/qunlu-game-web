/* 群陸旅誌：共用核心與程序註冊 CURRENT-1.85.2
 * QUNLU-CORE-1.0
 * 純工具層：不改遊戲規則、不改存檔格式，集中版本、階級、查找、去重與程序註冊。
 */
(()=>{
"use strict";

const FALLBACK_RELEASE="CURRENT-1.82.0";
const titleRelease=typeof document!=="undefined"
  ?(String(document.title||"").match(/CURRENT-\d+\.\d+\.\d+/)?.[0]||"")
  :"";
const RELEASE=String(globalThis.QUNLU_RELEASE_VERSION||titleRelease||FALLBACK_RELEASE);
const TIER_RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const modules=new Map();

function array(value){return Array.isArray(value)?value:[]}
function findById(list,id){return array(list).find(row=>row?.id===id)||null}
function db(){return globalThis.DB&&typeof globalThis.DB==="object"?globalThis.DB:null}
function itemById(id){return findById(db()?.items,id)}
function locationById(id){return findById(db()?.locations,id)}
function classById(id){return findById(db()?.combat_classes,id)}
function recipeById(id){return findById(db()?.recipes,id)}
function tierRank(tier){return TIER_RANK[String(tier||"F")]??0}
function number(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback}
function clamp(value,min,max){return Math.max(min,Math.min(max,number(value,min)))}
function clone(value){
  if(typeof structuredClone==="function"){
    try{return structuredClone(value)}catch(error){}
  }
  return value==null?value:JSON.parse(JSON.stringify(value));
}
function unique(values){return [...new Set(array(values))]}
function uniqueStrings(values,limit=Infinity){
  const out=[],seen=new Set();
  for(const value of array(values)){
    const text=String(value??"");
    if(!text||seen.has(text))continue;
    seen.add(text);out.push(text);
    if(out.length>=limit)break;
  }
  return out;
}
function game(){try{return typeof G!=="undefined"?G:null}catch(error){return null}}
function safeCall(fn,...args){try{return typeof fn==="function"?fn(...args):undefined}catch(error){return undefined}}
function release(fallback=FALLBACK_RELEASE){
  return String(globalThis.QUNLU_RELEASE_VERSION||titleRelease||db()?.meta?.current_version||fallback);
}
function registerModule(path,meta={}){
  const key=String(path||"").trim();
  if(!key)return null;
  const row=Object.freeze({
    path:key,
    domain:String(meta.domain||"misc"),
    revision:String(meta.revision||""),
    release:String(meta.release||release()),
    loaded_at:Date.now()
  });
  modules.set(key,row);
  return row;
}
function moduleSnapshot(){return [...modules.values()]}
function audit(){
  const issues=[];
  if(!/^CURRENT-\d+\.\d+\.\d+$/.test(release()))issues.push("發布版本格式異常");
  if(Object.keys(TIER_RANK).join("")!=="FEDCBAS")issues.push("F-S階級表異常");
  return {revision:"QUNLU-CORE-1.0",release:release(),pass:issues.length===0,issues,module_count:modules.size};
}

globalThis.QUNLU_RELEASE_VERSION=RELEASE;
globalThis.QUNLU_CORE=Object.freeze({
  version:"QUNLU-CORE-1.0",
  tierRankMap:TIER_RANK,
  array,findById,itemById,locationById,classById,recipeById,
  tierRank,number,clamp,clone,unique,uniqueStrings,game,safeCall,release,
  registerModule,moduleSnapshot,audit
});
globalThis.QUNLU_CORE.registerModule("src/bootstrap.js",{domain:"core",revision:"QUNLU-CORE-1.0",release:RELEASE});
})();