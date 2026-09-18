/* 群陸旅誌：取水點與容器閉環 CURRENT-1.65.6
 * WATER-SOURCE-1.0
 * 地點水源 -> 容器 -> 取水 -> I-WATER -> 料理／飲用
 */
(()=>{
  "use strict";
  if(typeof DB!=="object"||!DB)return;

  const REVISION="WATER-SOURCE-1.0";
  const WATER_ITEM_ID="I-WATER";
  const FOLD_BUCKET_ID="I-FOLD-BUCKET";
  const CONTAINER_RE=/折疊水桶|水桶|提桶|水袋|水囊|水壺|皮囊|水罐/;
  const SAFE_WATER_RE=/河|溪|泉|湖|瀑|水道|水渠|蓄水|水庫|井|水脈|潭|澗|渡口/;
  const UNSAFE_WATER_RE=/海|潮|鹽|沼|濕地|泥濘|黑水|污水|腐水|毒水|死水|熔|岩漿|硫磺/;

  DB.meta=DB.meta||{};
  DB.meta.water_source_revision=REVISION;

  function ensureBucketDefinition(){
    let bucket=(DB.items||[]).find(d=>d&&CONTAINER_RE.test(String(d.name||""))&&/桶/.test(String(d.name||"")));
    if(!bucket){
      bucket={
        id:FOLD_BUCKET_ID,name:"折疊水桶",tier:"F",type:"道具",inventory_group:"道具",
        weight:0.45,value:6,water_container:true,container_capacity:3,tool_effect:"water_collect",
        acquisition_sources:["shop"],wild_gather_eligible:false,gather_tool:null,
        description:"以防水布與薄木圈製成的旅行水桶，可折疊收納；用於水井、溪流與泉眼取水。",
        economic_role:"一般雜貨店→旅行取水工具"
      };
      DB.items=Array.isArray(DB.items)?DB.items:[];
      DB.items.push(bucket);
      try{if(typeof IDX!=="undefined"&&IDX?.item)IDX.item.set(bucket.id,bucket)}catch(e){}
    }else{
      bucket.water_container=true;
      bucket.container_capacity=Math.max(3,Number(bucket.container_capacity||0));
      bucket.tool_effect=bucket.tool_effect||"water_collect";
    }

    const general=DB.facilities?.general;
    if(general){
      general.stock=Array.isArray(general.stock)?general.stock:[];
      if(!general.stock.includes(bucket.id))general.stock.push(bucket.id);
    }
    return bucket;
  }

  const bucketDefinition=ensureBucketDefinition();

  function sourceTemplateFor(l){
    if(!l)return null;
    if(l.water_source===false)return null;
    if(l.water_source&&typeof l.water_source==="object"&&l.water_source.enabled!==false){
      return {
        location_id:l.id,
        name:l.water_source.name||"取水點",
        kind:l.water_source.kind||"freshwater",
        potable:l.water_source.potable!==false,
        capacity:Math.max(1,Number(l.water_source.capacity||12)),
        regen_per_hour:Math.max(.1,Number(l.water_source.regen_per_hour||2)),
        per_action:Math.max(1,Number(l.water_source.per_action||3)),
        time_hours:Math.max(.1,Number(l.water_source.time_hours||.5))
      };
    }

    const text=`${l.name||""} ${l.description||l.desc||l.flavor||""}`;
    if(l.kind==="town"){
      const portLike=/港|海|潮/.test(text);
      return {location_id:l.id,name:portLike?"公共蓄水槽":"公共水井",kind:portLike?"cistern":"well",potable:true,capacity:40,regen_per_hour:8,per_action:3,time_hours:.35};
    }
    if(UNSAFE_WATER_RE.test(text))return null;
    if(!SAFE_WATER_RE.test(text))return null;

    if(l.kind==="wild"){
      const name=/泉/.test(text)?"天然泉眼":/溪|澗/.test(text)?"溪流取水點":/河|渡口/.test(text)?"河岸取水點":/湖|潭/.test(text)?"湖潭取水點":"天然淡水點";
      return {location_id:l.id,name,kind:"freshwater",potable:true,capacity:18,regen_per_hour:3,per_action:3,time_hours:.5};
    }
    if(l.kind==="dungeon"){
      const name=/蓄水|水庫|井/.test(text)?"地下蓄水池":/泉|水脈/.test(text)?"地下泉眼":"地下淡水點";
      return {location_id:l.id,name,kind:"dungeon_freshwater",potable:true,capacity:10,regen_per_hour:1.25,per_action:2,time_hours:.65};
    }
    return null;
  }

  function rebuildWaterSourcePoints(){
    const rows=[];
    for(const l of (DB.locations||[])){
      const s=sourceTemplateFor(l);
      if(!s)continue;
      l.water_source={enabled:true,...s};
      rows.push({...s});
    }
    DB.water_source_points=rows;
    DB.water_source_system={
      version:REVISION,
      water_item_id:WATER_ITEM_ID,
      bucket_item_id:bucketDefinition?.id||FOLD_BUCKET_ID,
      source_count:rows.length,
      rules:[
        "城鎮提供公共水井或蓄水槽；河流、溪流、泉眼、湖潭等淡水地形可形成野外取水點。",
        "海水、潮池、沼澤、污染水、黑水與熔岩相關地點不會直接產出可飲用清水。",
        "取水需要折疊水桶、水桶、水袋、水壺等可用容器；容器不會在取水時被消耗。",
        "每個取水點具有容量與每小時恢復量，不建立無限瞬時資源。",
        "取水會消耗遊戲時間並取得既有 I-WATER，與料理配方及口渴系統直接串接。"
      ]
    };
    return rows;
  }

  rebuildWaterSourcePoints();

  function waterSourceAt(locationId){
    const l=(DB.locations||[]).find(x=>x?.id===locationId);
    return l?.water_source?.enabled!==false?l?.water_source:null;
  }

  function waterState(){
    if(typeof G==="undefined"||!G)return null;
    G.worldState=G.worldState&&typeof G.worldState==="object"?G.worldState:{};
    G.worldState.waterSources=G.worldState.waterSources&&typeof G.worldState.waterSources==="object"?G.worldState.waterSources:{};
    return G.worldState.waterSources;
  }

  function currentGameHour(){
    try{return typeof totalHours==="function"?Number(totalHours()||0):0}catch(e){return 0}
  }

  function waterNode(source){
    if(!source)return null;
    const state=waterState();if(!state)return null;
    const now=currentGameHour(),key=source.location_id;
    if(!state[key]){
      state[key]={current:source.capacity,max:source.capacity,regen_per_hour:source.regen_per_hour,lastHour:now,regenCarry:0};
    }
    const node=state[key];
    node.max=Math.max(1,Number(source.capacity||node.max||1));
    node.regen_per_hour=Math.max(.1,Number(source.regen_per_hour||node.regen_per_hour||1));
    node.current=Math.max(0,Math.min(node.max,Number(node.current??node.max)));
    const last=Number.isFinite(Number(node.lastHour))?Number(node.lastHour):now;
    const elapsed=Math.max(0,now-last);
    if(elapsed>0&&node.current<node.max){
      const exact=Number(node.regenCarry||0)+elapsed*node.regen_per_hour;
      const gain=Math.floor(exact);
      node.regenCarry=exact-gain;
      if(gain>0)node.current=Math.min(node.max,node.current+gain);
    }
    node.lastHour=now;
    return node;
  }

  function containerCapacity(){
    if(typeof G==="undefined"||!G?.character?.inventory)return {capacity:0,name:null};
    let best={capacity:0,name:null};
    for(const x of G.character.inventory){
      if(x?.id===WATER_ITEM_ID)continue;
      let d=null;try{d=typeof item==="function"?item(x.id):null}catch(e){}
      if(!d)d=(DB.items||[]).find(v=>v?.id===x.id);
      const name=String(d?.name||"");
      const marked=d?.water_container===true||d?.tool_effect==="water_collect";
      if(!marked&&!CONTAINER_RE.test(name))continue;
      let cap=Math.max(1,Number(d?.container_capacity||0));
      if(/折疊水桶|水桶|提桶/.test(name))cap=Math.max(cap,3);
      else if(/水袋|水囊|水壺|皮囊|水罐/.test(name))cap=Math.max(cap,1);
      if(cap>best.capacity)best={capacity:cap,name:name||"容器"};
    }
    return best;
  }

  function currentWaterSource(){
    if(typeof G==="undefined"||!G?.character)return null;
    return waterSourceAt(G.character.locationId);
  }

  function syncWaterSourceUI(){
    if(typeof document==="undefined"||typeof G==="undefined"||!G?.character)return;
    const source=currentWaterSource();
    const locTop=document.getElementById("locTop");
    if(locTop){
      locTop.querySelectorAll("[data-water-source-badge]").forEach(n=>n.remove());
      if(source){
        const badge=document.createElement("span");
        badge.dataset.waterSourceBadge="1";
        badge.className="small";
        badge.textContent=`｜取水點：${source.name}`;
        locTop.appendChild(badge);
      }
    }

    const box=document.getElementById("actionButtons");
    if(!box)return;
    box.querySelectorAll("[data-water-source-action]").forEach(n=>n.remove());
    if(!source||!G.character.alive)return;
    const node=waterNode(source),container=containerCapacity();
    const button=document.createElement("button");
    button.type="button";
    button.dataset.waterSourceAction="1";
    if(!node||node.current<1){
      button.disabled=true;
      button.textContent=`取水（${source.name}・恢復中）`;
    }else{
      button.textContent=container.capacity>0?`取水（${source.name}）`:`取水（需水桶／水袋）`;
      button.addEventListener("click",takeWaterAtSource);
    }
    box.appendChild(button);
  }

  function takeWaterAtSource(){
    if(typeof G==="undefined"||!G?.character)return;
    const source=currentWaterSource();
    if(!source){alert("此地沒有可安全取用的淡水點。");return}
    const container=containerCapacity();
    if(container.capacity<=0){alert("需要折疊水桶、水桶、水袋或水壺等容器才能取水。");return}
    const node=waterNode(source);
    if(!node||node.current<1){alert("這個取水點目前水量不足，稍後會逐步恢復。");syncWaterSourceUI();return}
    const qty=Math.max(1,Math.min(Math.floor(node.current),Math.floor(source.per_action||3),Math.floor(container.capacity)));
    if(typeof beginTurn==="function"&&!beginTurn("取水"))return;
    node.current=Math.max(0,node.current-qty);
    node.lastHour=currentGameHour();
    if(typeof addItem==="function")addItem(WATER_ITEM_ID,qty);
    if(typeof log==="function")log("取水",`在${source.name}使用${container.name}取得清水×${qty}；水源剩餘 ${Math.floor(node.current)}/${node.max}。`,"ok");
    if(typeof endTurn==="function")endTurn(Number(source.time_hours||.5));
    else{try{persist?.()}catch(e){};try{renderAll?.()}catch(e){}}
  }

  function runWaterSourceAudit(){
    const points=Array.isArray(DB.water_source_points)?DB.water_source_points:[];
    const towns=(DB.locations||[]).filter(l=>l?.kind==="town");
    const missingTowns=towns.filter(l=>!waterSourceAt(l.id)).map(l=>l.name||l.id);
    let waterItem=null;try{waterItem=typeof item==="function"?item(WATER_ITEM_ID):null}catch(e){}
    if(!waterItem)waterItem=(DB.items||[]).find(x=>x?.id===WATER_ITEM_ID);
    const bucket=(DB.items||[]).find(d=>d?.water_container===true||d?.tool_effect==="water_collect"||CONTAINER_RE.test(String(d?.name||"")));
    return {
      revision:REVISION,
      pass:!!waterItem&&!!bucket&&points.length>0&&missingTowns.length===0,
      source_count:points.length,
      town_count:towns.length,
      missing_towns:missingTowns,
      water_item_present:!!waterItem,
      container_present:!!bucket
    };
  }

  if(typeof renderActions==="function"&&!globalThis.__WATER_SOURCE_ACTION_PATCHED){
    const baseRenderActions=renderActions;
    renderActions=function(){
      const result=baseRenderActions.apply(this,arguments);
      try{syncWaterSourceUI()}catch(e){console.warn("water source ui",e)}
      return result;
    };
    globalThis.__WATER_SOURCE_ACTION_PATCHED=true;
  }

  if(typeof runAudit==="function"&&!globalThis.__WATER_SOURCE_AUDIT_PATCHED){
    const baseRunAudit=runAudit;
    runAudit=function(){
      const result=baseRunAudit.apply(this,arguments);
      const audit=runWaterSourceAudit();
      if(!audit.pass&&typeof log==="function"){
        const issues=[];
        if(!audit.water_item_present)issues.push("I-WATER缺失");
        if(!audit.container_present)issues.push("取水容器缺失");
        if(audit.missing_towns.length)issues.push(`城鎮取水點缺失：${audit.missing_towns.slice(0,6).join("、")}`);
        log("五回合自檢",`取水系統異常：${issues.join("；")}`,"danger");
      }
      return result;
    };
    globalThis.__WATER_SOURCE_AUDIT_PATCHED=true;
  }

  globalThis.takeWaterAtSource=takeWaterAtSource;
  globalThis.currentWaterSource=currentWaterSource;
  globalThis.runWaterSourceAudit=runWaterSourceAudit;
  globalThis.rebuildWaterSourcePoints=rebuildWaterSourcePoints;

  if(typeof window!=="undefined")window.addEventListener("load",()=>setTimeout(syncWaterSourceUI,200),{once:true});
})();
