/* 群陸旅誌：正史名稱保護層 CURRENT-1.74.0 / NAMING-PROTECTION-2.0 */
(()=>{
  'use strict';
  if(typeof DB!=="object"||!DB)return;

  const REVISION="NAMING-PROTECTION-2.0";
  const CANONICAL="柳生唯心流";
  const LEGACY_NAMES=new Set(["柳生惟心流","白柳劍術學派"]);
  const seen=new WeakSet();
  let restored=0,readOnlySkipped=0;

  function normalize(value){
    if(typeof value!=="string")return value;
    let next=value;
    for(const oldName of LEGACY_NAMES){
      if(next.includes(oldName))next=next.split(oldName).join(CANONICAL);
    }
    return next;
  }

  function assignNormalized(node,key,value){
    const next=normalize(value);
    if(next===value)return;
    const descriptor=Object.getOwnPropertyDescriptor(node,key);
    if(descriptor&&descriptor.writable===false&&typeof descriptor.set!=="function"){readOnlySkipped+=1;return}
    try{
      node[key]=next;
      if(node[key]===next)restored+=1;
      else readOnlySkipped+=1;
    }catch(error){readOnlySkipped+=1}
  }

  function walk(node){
    if(!node||typeof node!=="object"||seen.has(node))return;
    seen.add(node);
    if(Array.isArray(node)){
      for(let i=0;i<node.length;i++){
        if(typeof node[i]==="string")assignNormalized(node,i,node[i]);
        else walk(node[i]);
      }
      return;
    }
    for(const key of Object.keys(node)){
      if(typeof node[key]==="string")assignNormalized(node,key,node[key]);
      else walk(node[key]);
    }
  }

  walk(DB);
  DB.meta=DB.meta||{};
  DB.meta.naming_protection_revision=REVISION;
  DB.meta.protected_naming=Array.isArray(DB.meta.protected_naming)?DB.meta.protected_naming:[];
  if(!DB.meta.protected_naming.includes(CANONICAL))DB.meta.protected_naming.push(CANONICAL);

  globalThis.QUNLU_NAMING_PROTECTED_NAMES=Object.freeze([
    "雷煌流","雷鳴流",CANONICAL,"名品武士刀「闇夜」"
  ]);
  globalThis.QUNLU_NAMING_PROTECTION=Object.freeze({
    version:REVISION,canonical:CANONICAL,restored,read_only_skipped:readOnlySkipped,protected:true
  });
})();
