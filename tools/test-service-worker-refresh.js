#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

class Response{
  constructor(body,ok=true){this.body=body;this.ok=ok;this.status=ok?200:503;}
  clone(){return new Response(this.body,this.ok);}
}
const origin="https://qunlu.example/";
const url=x=>new URL(typeof x==="string"?x:x.url,origin).href;
const stores=new Map(),events=new Map(),requests=[];
let online=true,failInstall=false;
function bucket(name){
  if(!stores.has(name))stores.set(name,new Map());
  const data=stores.get(name);
  return {
    async addAll(paths){
      if(failInstall)throw Error("precache rejected");
      for(const path of paths)data.set(url(path),new Response("offline:"+url(path)));
    },
    async match(request,{ignoreSearch=false}={}){
      const key=url(request);
      if(data.has(key))return data.get(key).clone();
      if(ignoreSearch){
        const target=new URL(key);
        for(const [old,response] of data){
          const cached=new URL(old);
          if(cached.origin===target.origin&&cached.pathname===target.pathname)return response.clone();
        }
      }
      return undefined;
    },
    async put(request,response){data.set(url(request),response.clone());}
  };
}
const caches={
  open:async name=>bucket(name),
  keys:async()=>[...stores.keys()],
  delete:async name=>stores.delete(name),
  async match(request,options){
    for(const name of stores.keys()){
      const result=await bucket(name).match(request,options);
      if(result)return result;
    }
    return undefined;
  }
};
const self={
  location:{origin:new URL(origin).origin},
  addEventListener:(type,fn)=>events.set(type,fn),
  skipWaiting:async()=>{},
  clients:{claim:async()=>{}}
};
const context=vm.createContext({self,caches,URL,
  fetch:async(request,options={})=>{
    requests.push({url:url(request),cache:options.cache});
    if(!online)throw Error("offline");
    return new Response("fresh:"+url(request));
  }
});
vm.runInContext(fs.readFileSync("sw.js","utf8"),context,{filename:"sw.js"});
const cacheName=vm.runInContext("CACHE_NAME",context);
const core=vm.runInContext("CORE",context);
async function retrieve(resource,mode="same-origin",method="GET"){
  let promise;
  events.get("fetch")({
    request:{url:url(resource),mode,method},
    respondWith(result){promise=result;}
  });
  return promise?await promise:null;
}
(async()=>{
  assert.equal(cacheName,"qunlu-pwa-v162");
  assert(core.includes("./src/runtime.js"));
  let install;
  events.get("install")({waitUntil(p){install=p;}});
  await install;
  assert(stores.get(cacheName).has(url("./src/runtime.js")));
  stores.set("qunlu-pwa-v160",new Map([["old",new Response("stale")]]));
  let activate;
  events.get("activate")({waitUntil(p){activate=p;}});
  await activate;
  assert(!stores.has("qunlu-pwa-v160"));

  const js=url("./src/runtime.js?v=CURRENT-2.14.8");
  await bucket(cacheName).put({url:js},new Response("stale-js"));
  const freshJs=await retrieve(js);
  assert.equal(freshJs.body,"fresh:"+js,"script must refresh despite matching URL");
  assert.equal(requests.at(-1).cache,"no-cache");
  online=false;
  assert.equal((await retrieve(js)).body,"fresh:"+js,"script must work offline");
  online=true;

  const css=url("./assets/css/game.css?v=CURRENT-2.14.8");
  await bucket(cacheName).put({url:css},new Response("stale-css"));
  assert.equal((await retrieve(css)).body,"fresh:"+css,"style must refresh");
  assert.equal(requests.at(-1).cache,"no-cache");

  const image=url("./icons/icon-192.png");
  const callsBefore=requests.length;
  assert.equal((await retrieve(image)).body,"offline:"+image,"images stay cache-first");
  assert.equal(requests.length,callsBefore);
  online=false;
  assert((await retrieve("./assets/css/game.css?v=UNSEEN")).body.includes("game.css"),"offline pre-cache fallback");
  await retrieve("./version.json");
  assert.equal(requests.at(-1).cache,"no-store","release check must bypass HTTP cache");
  assert.equal(await retrieve(js,"same-origin","POST"),null);
  assert.equal(await retrieve("https://other.example/src/runtime.js"),null);

  failInstall=true;
  let rejected;
  events.get("install")({waitUntil(p){rejected=p;}});
  await assert.rejects(rejected,/precache rejected/,"failed install must preserve old worker");
  const release=JSON.parse(fs.readFileSync("version.json","utf8")).version;
  assert(fs.readFileSync("src/pwa.js","utf8").includes("sw.js?v="+release+"-REFRESH-1"),"PWA registration must use new SW");
  console.log("service worker refresh OK: online JS/CSS, offline fallback, image cache, failed install, registration");
})().catch(error=>{console.error(error);process.exitCode=1;});
