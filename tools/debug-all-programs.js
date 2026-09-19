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

let auditNames=[];
try{
  auditNames=vm.runInContext('Object.getOwnPropertyNames(globalThis).filter(k=>/^run[A-Za-z0-9_$]*Audit/.test(k)&&typeof globalThis[k]==="function").sort()',context);
}catch(error){problems.push("cannot enumerate audits: "+error)}
const auditReport=[];
const stateRequiredAuditNames=new Set(["runAudit","runGeneratorAudit"]);
for(const name of auditNames){
  if(stateRequiredAuditNames.has(name)){auditReport.push({name,skipped:"requires active game state"});continue}
  try{
    const result=vm.runInContext(`globalThis[${JSON.stringify(name)}]()`,context,{timeout:15000});
    const compact={name,pass:result?.pass};
    if(Array.isArray(result?.issues))compact.issues=result.issues.slice(0,20);
    if(result?.stats)compact.stats=result.stats;
    auditReport.push(compact);
    if(result&&result.pass===false)problems.push(`${name}: audit failed: ${JSON.stringify(result.issues||[]).slice(0,2000)}`);
  }catch(error){
    auditReport.push({name,error:String(error?.stack||error)});
    problems.push(`${name}: audit threw: ${error?.stack||error}`);
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
console.log(`DEBUG OK: ${report.loaded}/${report.programs} programs loaded; ${report.audits} audits executed; DB=${report.final_db_version}`);
if(report.warnings.length)console.log(`Warnings: ${report.warnings.length} (see DEBUG_ALL_PROGRAMS.json)`);
