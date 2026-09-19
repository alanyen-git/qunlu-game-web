#!/usr/bin/env node
"use strict";

const fs=require("fs");
const vm=require("vm");
const crypto=require("crypto");

const root=process.cwd();
const read=file=>fs.readFileSync(file,"utf8");
const version=JSON.parse(read("version.json"));
const html=read("index.html");
const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/g)].map(m=>m[1]).filter(x=>x.startsWith("src/"));
const programPaths=scripts.map(x=>x.split("?")[0]);

const problems=[];
const warnings=[];
const loadReport=[];
const consoleErrors=[];
const queuedTimeouts=[];
const windowListeners=new Map();
const documentListeners=new Map();
const elements=new Map();

function addListener(map,type,fn){
  if(typeof fn!=="function")return;
  const list=map.get(type)||[];
  list.push(fn);map.set(type,list);
}
function fire(map,type,event={}){
  for(const fn of map.get(type)||[]){
    try{fn({type,...event})}catch(error){problems.push(`event ${type}: ${error.stack||error}`)}
  }
}
function makeClassList(){
  const set=new Set();
  return {
    add(...v){v.forEach(x=>set.add(String(x)))},
    remove(...v){v.forEach(x=>set.delete(String(x)))},
    contains(v){return set.has(String(v))},
    toggle(v,force){const k=String(v);if(force===true){set.add(k);return true}if(force===false){set.delete(k);return false}if(set.has(k)){set.delete(k);return false}set.add(k);return true},
    toString(){return [...set].join(" ")}
  };
}
function makeElement(tag="div",id=""){
  const attrs=new Map(),children=[];
  const el={
    tagName:String(tag).toUpperCase(),id:String(id||""),style:{},dataset:{},classList:makeClassList(),
    className:"",textContent:"",innerHTML:"",value:"",checked:false,disabled:false,hidden:false,
    isConnected:true,children,parentNode:null,ownerDocument:null,
    appendChild(child){if(child){child.parentNode=this;children.push(child)}return child},
    append(...nodes){for(const node of nodes)this.appendChild(node)},
    prepend(...nodes){for(const node of [...nodes].reverse()){if(node){node.parentNode=this;children.unshift(node)}}},
    replaceChildren(...nodes){children.length=0;this.append(...nodes)},
    insertAdjacentElement(position,node){return this.appendChild(node)},
    insertAdjacentHTML(){},
    setAttribute(k,v){attrs.set(String(k),String(v));if(k==="id")this.id=String(v)},
    getAttribute(k){return attrs.has(String(k))?attrs.get(String(k)):null},
    removeAttribute(k){attrs.delete(String(k))},
    addEventListener(type,fn){addListener(this.__listeners||(this.__listeners=new Map()),type,fn)},
    removeEventListener(){},
    dispatchEvent(event){fire(this.__listeners||new Map(),event?.type||"event",event);return true},
    querySelector(selector){return documentStub.querySelector(selector)},
    querySelectorAll(){return []},
    closest(){return null},
    matches(){return false},
    focus(){},
    click(){this.dispatchEvent({type:"click",target:this})},
    remove(){this.isConnected=false},
    scrollIntoView(){},
    cloneNode(){return makeElement(tag,id)},
    getContext(){return {clearRect(){},fillRect(){},drawImage(){},fillText(){},measureText(){return {width:0}},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},save(){},restore(){}}},
    getBoundingClientRect(){return {x:0,y:0,width:320,height:44,top:0,left:0,right:320,bottom:44}}
  };
  return el;
}
function byId(id){
  if(!elements.has(id)){
    const el=makeElement("div",id);el.ownerDocument=documentStub;elements.set(id,el);
  }
  return elements.get(id);
}

const documentStub={
  title:`群陸旅誌 ${version.version}`,
  readyState:"complete",
  visibilityState:"visible",
  activeElement:null,
  currentScript:null,
  scripts:[],
  body:null,head:null,documentElement:null,
  createElement(tag){const el=makeElement(tag);el.ownerDocument=this;return el},
  createTextNode(text){return {nodeType:3,textContent:String(text),parentNode:null}},
  getElementById(id){return byId(id)},
  querySelector(selector){
    const s=String(selector||"");
    if(/^#[A-Za-z][\w-]*$/.test(s))return byId(s.slice(1));
    return null;
  },
  querySelectorAll(){return []},
  addEventListener(type,fn){addListener(documentListeners,type,fn)},
  removeEventListener(){},
  dispatchEvent(event){fire(documentListeners,event?.type||"event",event);return true}
};
documentStub.body=makeElement("body","body");
documentStub.head=makeElement("head","head");
documentStub.documentElement=makeElement("html","html");

const storage=new Map();
const localStorage={
  getItem:k=>storage.has(String(k))?storage.get(String(k)):null,
  setItem:(k,v)=>storage.set(String(k),String(v)),
  removeItem:k=>storage.delete(String(k)),
  clear:()=>storage.clear(),
  key:i=>[...storage.keys()][i]??null,
  get length(){return storage.size}
};

const quietConsole={
  log(){},info(){},debug(){},
  warn(...args){warnings.push(args.map(String).join(" "))},
  error(...args){consoleErrors.push(args.map(String).join(" "))}
};

let timerId=0;
const sandbox={
  console:quietConsole,
  document:documentStub,
  localStorage,
  sessionStorage:localStorage,
  navigator:{
    userAgent:"qunlu-headless-debug",
    language:"zh-TW",
    serviceWorker:{register:async()=>({update:async()=>null})}
  },
  location:{href:"https://example.invalid/qunlu-game-web/index.html",protocol:"https:",origin:"https://example.invalid",pathname:"/qunlu-game-web/index.html",reload(){}},
  history:{pushState(){},replaceState(){},back(){}},
  performance:{now:()=>0},
  crypto:crypto.webcrypto,
  URL,URLSearchParams,
  TextEncoder,TextDecoder,
  structuredClone,
  atob:s=>Buffer.from(String(s),"base64").toString("binary"),
  btoa:s=>Buffer.from(String(s),"binary").toString("base64"),
  Blob:global.Blob,
  FormData:global.FormData,
  fetch:async()=>({ok:false,status:404,json:async()=>({}),text:async()=>"",clone(){return this}}),
  alert(){},confirm(){return true},prompt(){return ""},
  requestAnimationFrame:fn=>{if(typeof fn==="function")queuedTimeouts.push(fn);return ++timerId},
  cancelAnimationFrame(){},
  setTimeout(fn){if(typeof fn==="function")queuedTimeouts.push(fn);return ++timerId},
  clearTimeout(){},
  setInterval(){return ++timerId},
  clearInterval(){},
  MutationObserver:class{observe(){}disconnect(){}takeRecords(){return[]}},
  ResizeObserver:class{observe(){}unobserve(){}disconnect(){}},
  IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},
  Event:class{constructor(type,init={}){this.type=type;Object.assign(this,init)}preventDefault(){}stopPropagation(){}},
  CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail}preventDefault(){}stopPropagation(){}},
  HTMLElement:class{},
  Node:class{},
  CSS:{escape:s=>String(s)},
  getComputedStyle:()=>({display:"block",visibility:"visible"}),
  innerWidth:390,innerHeight:844,devicePixelRatio:1
};
sandbox.window=sandbox;
sandbox.self=sandbox;
sandbox.globalThis=sandbox;
sandbox.addEventListener=(type,fn)=>addListener(windowListeners,type,fn);
sandbox.removeEventListener=()=>{};
sandbox.dispatchEvent=event=>{fire(windowListeners,event?.type||"event",event);return true};

const context=vm.createContext(sandbox);

documentStub.scripts=scripts.map(src=>({src:`https://example.invalid/qunlu-game-web/${src}`,dataset:{release:version.version}}));

for(let i=0;i<programPaths.length;i++){
  const file=programPaths[i];
  if(!fs.existsSync(file)){problems.push(`missing program: ${file}`);continue}
  documentStub.currentScript=documentStub.scripts[i];
  const started=process.hrtime.bigint();
  try{
    vm.runInContext(read(file),context,{filename:file,timeout:15000});
    const elapsed=Number(process.hrtime.bigint()-started)/1e6;
    let dbVersion=null;
    try{dbVersion=vm.runInContext('typeof DB==="object" ? DB.meta?.current_version ?? null : null',context)}catch(error){}
    loadReport.push({file,ok:true,ms:+elapsed.toFixed(2),dbVersion});
    if(i>1 && dbVersion && dbVersion!==version.version)problems.push(`${file}: release drift ${dbVersion} != ${version.version}`);
  }catch(error){
    const elapsed=Number(process.hrtime.bigint()-started)/1e6;
    loadReport.push({file,ok:false,ms:+elapsed.toFixed(2),error:String(error?.stack||error)});
    problems.push(`${file}: load failed: ${error?.stack||error}`);
  }
}

fire(windowListeners,"load",{target:sandbox});
for(let i=0;i<Math.min(500,queuedTimeouts.length);i++){
  const fn=queuedTimeouts[i];
  try{fn()}catch(error){problems.push(`deferred callback: ${error?.stack||error}`)}
}
if(queuedTimeouts.length>500)warnings.push(`deferred callback queue truncated: ${queuedTimeouts.length}`);

const statefulReport=[];
function statefulStep(name,fn){
  const started=process.hrtime.bigint();
  try{
    const detail=fn();
    statefulReport.push({name,pass:true,ms:+(Number(process.hrtime.bigint()-started)/1e6).toFixed(2),detail});
    return detail;
  }catch(error){
    const message=String(error?.stack||error);
    statefulReport.push({name,pass:false,ms:+(Number(process.hrtime.bigint()-started)/1e6).toFixed(2),error:message});
    problems.push(\`stateful \${name}: \${message}\`);
    return null;
  }
}
function ctx(code,timeout=15000){return vm.runInContext(code,context,{timeout})}

let baselineState=null;
statefulStep("official_character_creation",()=>{
  const detail=ctx(\`(()=>{
    Math.random=()=>0.3141592653589793;
    if(typeof renderAll==="function")renderAll=()=>{};
    if(typeof showModal==="function")showModal=()=>{};
    if(typeof closeModal==="function")closeModal=()=>{};
    if(typeof syncBodyScrollLock==="function")syncBodyScrollLock=()=>{};
    const race=(DB.races||[]).find(x=>x?.id&&x.id!=="R-ORC")||(DB.races||[])[0];
    const origin=(DB.origins||[]).find(x=>x?.id)||(DB.origins||[])[0];
    const klass=(DB.combat_classes||[]).find(x=>x?.tier==="F"&&item(x.starter_weapon_id||x.weapon))||(DB.combat_classes||[])[0];
    if(!race||!origin||!klass)throw new Error("找不到可用的正式建角資料");
    creation.race=race.id;creation.raceSubtype=null;creation.origin=origin.id;creation.element="火";creation.classId=klass.id;
    document.getElementById("nameInput").value="總測試角色";
    createCharacter();
    if(!G?.character?.id||G.character.level!==1||G.meta?.version!==QUNLU_RELEASE_VERSION)throw new Error("正式建角後核心狀態異常");
    const saved=localStorage.getItem("chronicle_save");
    if(!saved)throw new Error("正式建角未產生自動存檔");
    return {characterId:G.character.id,classId:G.character.classId,raceId:G.character.raceId,originId:G.character.originId,saveBytes:saved.length};
  })()\`);
  baselineState=ctx("structuredClone(G)");
  return detail;
});

statefulStep("save_roundtrip",()=>{
  if(!baselineState)throw new Error("缺少建角基準狀態");
  return ctx(\`(()=>{
    persist();
    const raw=localStorage.getItem("chronicle_save");
    if(!raw)throw new Error("persist未寫入chronicle_save");
    const parsed=JSON.parse(raw);
    if(parsed?.meta?.characterId!==G.meta.characterId)throw new Error("存檔characterId round-trip不一致");
    if(parsed?.character?.id!==G.character.id)throw new Error("角色ID round-trip不一致");
    return {bytes:raw.length,turn:parsed.turn,version:parsed.meta.version};
  })()\`);
});

statefulStep("legacy_save_migration",()=>{
  if(!baselineState)throw new Error("缺少建角基準狀態");
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);
    G.meta.version="CURRENT-1.57.0";
    delete G.character.abilityPointEntitlement;
    delete G.worldState.localMarkets;
    migrateSave();
    if(G.meta.version!==QUNLU_RELEASE_VERSION)throw new Error("舊存檔未升至目前版本");
    if(!G.character||!G.worldState||!Array.isArray(G.character.inventory))throw new Error("舊存檔遷移破壞核心欄位");
    return {version:G.meta.version,level:G.character.level,inventory:G.character.inventory.length};
  })()\`);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

statefulStep("five_turn_full_audit",()=>{
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);
    G.turn=4;
    G.pendingOrganizationEncounter=null;G.pendingPartyOpportunity=null;G.pendingPetOpportunity=null;G.pendingAdventureEvent=null;
    if(!beginTurn("最高權限總測試・第5回合"))throw new Error("beginTurn遭非預期阻擋");
    endTurn(.1);
    if(G.turn!==5)throw new Error("第5回合未正確推進");
    if(!G.lastAudit)throw new Error("第5回合未觸發runAudit");
    if((G.lastAudit.issues||[]).length)throw new Error("第5回合自檢失敗:"+G.lastAudit.issues.slice(0,12).join("｜"));
    return {turn:G.turn,auditIssues:G.lastAudit.issues.length,saveIndex:G.meta.saveIndex.length};
  })()\`,30000);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

statefulStep("battle_lifecycle",()=>{
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);
    const enemy=(DB.monsters||[]).filter(x=>x?.tier==="F"&&Number(x.hp)>0).sort((a,b)=>(a.initiative||0)-(b.initiative||0))[0];
    if(!enemy)throw new Error("找不到F級戰鬥測試敵人");
    const oldAgi=G.character.stats["敏捷"]||10;
    G.character.stats["敏捷"]=999;
    startBattle(enemy,"最高權限總測試");
    if(!G.battle?.active||G.battle.enemy?.id!==enemy.id)throw new Error("startBattle未建立有效戰鬥");
    finishBattle("測試撤退");
    if(G.battle!==null)throw new Error("finishBattle未清理戰鬥狀態");
    G.character.stats["敏捷"]=oldAgi;
    return {enemy:enemy.id,alive:G.character.alive};
  })()\`,30000);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

statefulStep("death_revival_cycle",()=>{
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);
    const enemy=(DB.monsters||[]).find(x=>x?.tier==="F"&&Number(x.hp)>0);
    if(!enemy)throw new Error("找不到復活測試敵人");
    const before=normalizeRevivalState().remaining;
    handleBattleDefeat(enemy);
    if(G.character.alive||G.character.hp!==0||!G.pendingRevival)throw new Error("戰敗未建立死亡／待復活狀態");
    reviveAtChurch();
    const after=normalizeRevivalState().remaining;
    if(!G.character.alive||G.character.hp<=0||G.pendingRevival!==null)throw new Error("教會復活未恢復有效角色狀態");
    if(after!==before-1)throw new Error(\`復活次數扣除異常:\${before}->\${after}\`);
    return {before,after,locationId:G.character.locationId,hp:G.character.hp};
  })()\`,30000);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

statefulStep("crafting_transaction",()=>{
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);
    G.pendingOrganizationEncounter=null;G.pendingPartyOpportunity=null;G.pendingPetOpportunity=null;G.pendingAdventureEvent=null;
    const candidate=(DB.items||[]).find(d=>{
      const r=d?.craft_recipe,sid=DB.crafting_system?.profession_subjob?.[r?.profession],fid=r?.requires_facility;
      return d?.tier==="F"&&r&&sid&&fid&&d.recipe_access==="public"&&craftRecipeMaterials(d).length>0&&
        (DB.locations||[]).some(l=>(l.facilities||[]).includes(fid));
    });
    if(!candidate)throw new Error("找不到可進行F級製作交易測試的公開配方");
    const r=candidate.craft_recipe,sid=DB.crafting_system.profession_subjob[r.profession],fid=r.requires_facility;
    const place=(DB.locations||[]).find(l=>(l.facilities||[]).includes(fid));
    let job=G.character.subjobs.find(x=>x.id===sid);
    if(!job){
      if(G.character.subjobs.length>=2)G.character.subjobs=G.character.subjobs.slice(0,1);
      job={id:sid,grade:"F",xp:0,source:"總測試"};G.character.subjobs.push(job);
    }
    job.grade="F";G.character.level=Math.max(G.character.level,Number(candidate.recipe_level||1));
    G.character.locationId=place.id;G.character.currentFacility=fid;syncResourceCaps(false);
    const mats=craftRecipeMaterials(candidate);
    for(const m of mats)addItem(m.id,m.qty+2);
    const before=Object.fromEntries(mats.map(m=>[m.id,inventoryQty(m.id)])),turn=G.turn;
    const original=openCrafting;openCrafting=()=>{};
    craftItemBatch(candidate.id,1);
    openCrafting=original;
    const after=Object.fromEntries(mats.map(m=>[m.id,inventoryQty(m.id)]));
    if(G.turn!==turn+1)throw new Error("製作未正確消耗1回合");
    for(const m of mats)if(after[m.id]!==before[m.id]-m.qty)throw new Error(\`製作扣料異常:\${m.id} \${before[m.id]}->\${after[m.id]}\`);
    return {item:candidate.id,profession:r.profession,facility:fid,materials:mats.length,turn:G.turn};
  })()\`,30000);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

statefulStep("market_buy_sell_transaction",()=>{
  context.__baselineState=structuredClone(baselineState);
  const detail=ctx(\`(()=>{
    G=structuredClone(__baselineState);G.character.moneySilver=100000;
    let pick=null;
    for(const [fid,f] of Object.entries(DB.facilities||{})){
      const place=(DB.locations||[]).find(l=>(l.facilities||[]).includes(fid));
      if(!place||!Array.isArray(f?.stock))continue;
      G.character.locationId=place.id;G.character.currentFacility=fid;
      for(const id of f.stock){
        const d=item(id);if(!d||d.tier!=="F"||!canSellTo(fid,d))continue;
        const stock=marketStockQty(fid,d),price=shopBuyUnitPrice(d);
        if(stock>0&&price<10000){pick={fid,place,d,stock,price};break}
      }
      if(pick)break;
    }
    if(!pick)throw new Error("找不到可完成買賣閉環的F級商店商品");
    const {fid,place,d}=pick;G.character.locationId=place.id;G.character.currentFacility=fid;
    const originalBuy=shopBuy,originalSell=shopSell;shopBuy=()=>{};shopSell=()=>{};
    const beforeQty=inventoryQty(d.id),beforeMoney=G.character.moneySilver,beforeStock=marketStockQty(fid,d);
    buyItem(fid,d.id,pick.price);
    const afterBuyQty=inventoryQty(d.id),afterBuyMoney=G.character.moneySilver,afterBuyStock=marketStockQty(fid,d);
    if(afterBuyQty!==beforeQty+1||afterBuyMoney>=beforeMoney||afterBuyStock!==beforeStock-1)throw new Error("商店購買交易狀態不一致");
    const idx=G.character.inventory.findIndex(x=>x.id===d.id);
    const market=marketFacilityState(fid);market.budgetRemaining=Math.max(market.budgetRemaining,100000);
    const beforeSellMoney=G.character.moneySilver,beforeBudget=market.budgetRemaining;
    sellItem(fid,idx,shopSellUnitPrice(d));
    shopBuy=originalBuy;shopSell=originalSell;
    if(inventoryQty(d.id)!==beforeQty||G.character.moneySilver<=beforeSellMoney||market.budgetRemaining>=beforeBudget)throw new Error("商店出售交易狀態不一致");
    return {facility:fid,item:d.id,buyPrice:pick.price,sellPrice:shopSellUnitPrice(d),stockBefore:beforeStock,stockAfter:afterBuyStock};
  })()\`,30000);
  ctx("G=structuredClone(__baselineState)");
  return detail;
});

if(baselineState)ctx("G=structuredClone(__baselineState)");


let auditNames=[];
try{
  auditNames=vm.runInContext('Object.getOwnPropertyNames(globalThis).filter(k=>/^run[A-Za-z0-9_$]*Audit/.test(k)&&typeof globalThis[k]==="function").sort()',context);
}catch(error){problems.push("cannot enumerate audits: "+error)}
const auditReport=[];
for(const name of auditNames){
  try{
    if(name==="runAudit"){
      vm.runInContext("runAudit()",context,{timeout:30000});
      const issues=vm.runInContext("Array.isArray(G?.lastAudit?.issues)?G.lastAudit.issues:[]",context);
      const compact={name,pass:issues.length===0,issues:issues.slice(0,20),stateful:true};
      auditReport.push(compact);
      if(issues.length)problems.push(\`\${name}: audit failed: \${JSON.stringify(issues).slice(0,2000)}\`);
      continue;
    }
    if(name==="runGeneratorAudit"){
      const issues=vm.runInContext("runGeneratorAudit()",context,{timeout:30000});
      const list=Array.isArray(issues)?issues:[];
      const compact={name,pass:list.length===0,issues:list.slice(0,20),stateful:true};
      auditReport.push(compact);
      if(list.length)problems.push(\`\${name}: audit failed: \${JSON.stringify(list).slice(0,2000)}\`);
      continue;
    }
    const result=vm.runInContext(\`globalThis[\${JSON.stringify(name)}]()\`,context,{timeout:15000});
    const compact={name,pass:result?.pass};
    if(Array.isArray(result?.issues))compact.issues=result.issues.slice(0,20);
    if(result?.stats)compact.stats=result.stats;
    auditReport.push(compact);
    if(result&&result.pass===false)problems.push(\`\${name}: audit failed: \${JSON.stringify(result.issues||[]).slice(0,2000)}\`);
  }catch(error){
    auditReport.push({name,error:String(error?.stack||error)});
    problems.push(\`\${name}: audit threw: \${error?.stack||error}\`);
  }
}

let finalVersion=null;
try{finalVersion=vm.runInContext('typeof DB==="object" ? DB.meta?.current_version ?? null : null',context)}catch(error){}
if(finalVersion!==version.version)problems.push(`final DB version mismatch: ${finalVersion} != ${version.version}`);

let registry=null;
try{registry=vm.runInContext('typeof runProgramRegistryAudit==="function" ? runProgramRegistryAudit() : null',context)}catch(error){}
if(!registry?.pass)problems.push(`program registry failed: ${JSON.stringify(registry?.issues||[])}`);

if(consoleErrors.length)problems.push("console.error during initialization: "+consoleErrors.join(" | "));

const slow=loadReport.filter(x=>x.ok&&x.ms>500).sort((a,b)=>b.ms-a.ms);
const report={
  version:version.version,
  programs:programPaths.length,
  loaded:loadReport.filter(x=>x.ok).length,
  failed:loadReport.filter(x=>!x.ok).length,
  audits:auditReport.length,
  stateful_tests:statefulReport.length,
  stateful_passed:statefulReport.filter(x=>x.pass).length,
  stateful_report:statefulReport,
  problems:[...new Set(problems)],
  warnings:[...new Set(warnings)].slice(0,100),
  slow_modules:slow.slice(0,10),
  load_report:loadReport,
  audit_report:auditReport,
  final_db_version:finalVersion
};
fs.writeFileSync("DEBUG_ALL_PROGRAMS.json",JSON.stringify(report,null,2)+"\n");

if(report.problems.length){
  console.error(`DEBUG FAILED: ${report.problems.length} problem(s)`);
  for(const issue of report.problems)console.error(" - "+issue);
  process.exit(1);
}
console.log(`DEBUG OK: ${report.loaded}/${report.programs} programs loaded; ${report.stateful_passed}/${report.stateful_tests} stateful tests; ${report.audits} audits executed; DB=${report.final_db_version}`);
if(report.warnings.length)console.log(`Warnings: ${report.warnings.length} (see DEBUG_ALL_PROGRAMS.json)`);
