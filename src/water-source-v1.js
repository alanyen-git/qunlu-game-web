/* 群陸旅誌：取水點、取水工具、水袋守恆與來源索引同步 CURRENT-1.66.1
 * WATER-SOURCE-1.1
 * 地點水源 -> 取水工具 -> 空水袋 -> 裝滿水袋(I-WATER) -> 飲用／料理 -> 空水袋
 */
(()=>{
  "use strict";
  if(typeof DB!=="object"||!DB)return;

  const REVISION="WATER-SOURCE-1.3";
  const WATER_ITEM_ID="I-WATER";
  const EMPTY_BAG_DEFAULT_ID="I-WATER-BAG-EMPTY";
  const FOLD_BUCKET_ID="I-FOLD-BUCKET";
  const COLLECTION_TOOL_RE=/折疊水桶|汲水桶|提桶|水桶/;
  const EMPTY_BAG_RE=/空水袋|空水囊/;
  const SAFE_WATER_RE=/河|溪|泉|湖|瀑|水道|水渠|蓄水|水庫|井|水脈|潭|澗|渡口/;
  const UNSAFE_WATER_RE=/海|潮|鹽|沼|濕地|泥濘|黑水|污水|腐水|毒水|死水|熔|岩漿|硫磺/;

  DB.meta=DB.meta||{};
  DB.meta.water_source_revision=REVISION;

  function dbItem(id){
    try{if(typeof item==="function"){const d=item(id);if(d)return d}}catch(e){}
    return (DB.items||[]).find(x=>x?.id===id)||null;
  }

  function registerItem(d){
    if(!d?.id)return;
    DB.items=Array.isArray(DB.items)?DB.items:[];
    if(!(DB.items||[]).some(x=>x?.id===d.id))DB.items.push(d);
    try{if(typeof IDX!=="undefined"&&IDX?.item)IDX.item.set(d.id,d)}catch(e){}
  }

  function addGeneralStock(id){
    const general=DB.facilities?.general;
    if(!general)return;
    general.stock=Array.isArray(general.stock)?general.stock:[];
    if(!general.stock.includes(id))general.stock.push(id);
  }

  function ensureBucketDefinition(){
    let bucket=(DB.items||[]).find(d=>d&&COLLECTION_TOOL_RE.test(String(d.name||"")));
    if(!bucket){
      bucket={
        id:FOLD_BUCKET_ID,name:"折疊水桶",tier:"F",type:"道具",inventory_group:"道具",
        weight:0.45,value:6,water_collection_tool:true,collection_capacity:3,tool_effect:"water_collect",
        acquisition_sources:["shop"],wild_gather_eligible:false,gather_tool:null,
        description:"以防水布與薄木圈製成的旅行水桶，可折疊收納；用於水井、溪流與泉眼汲水，本身不作為長途儲水容器。",
        economic_role:"一般雜貨店→旅行取水工具"
      };
      registerItem(bucket);
    }else{
      bucket.water_collection_tool=true;
      bucket.water_container=false;
      bucket.collection_capacity=Math.max(3,Number(bucket.collection_capacity||bucket.container_capacity||0));
      delete bucket.container_capacity;
      bucket.tool_effect=bucket.tool_effect||"water_collect";
      if(!String(bucket.description||"").includes("空水袋")){
        bucket.description=(String(bucket.description||"").replace(/\s+$/,"")+" 取到的水必須裝入空水袋。").trim();
      }
    }
    addGeneralStock(bucket.id);
    return bucket;
  }

  function ensureEmptyBagDefinition(){
    let bag=(DB.items||[]).find(d=>d&&EMPTY_BAG_RE.test(String(d.name||"")));
    if(!bag){
      bag={
        id:EMPTY_BAG_DEFAULT_ID,name:"空水袋",tier:"F",type:"道具",inventory_group:"道具",
        weight:0.08,value:1,water_storage_container:true,container_state:"empty",
        capacity_units:1,acquisition_sources:["shop"],wild_gather_eligible:false,gather_tool:null,
        description:"可重複使用的皮製水袋。取水時每裝一份清水會消耗一個空水袋；飲用或料理用水後會留下空水袋。",
        economic_role:"一般雜貨店→裝水／重複使用"
      };
      registerItem(bag);
    }else{
      bag.water_storage_container=true;
      bag.container_state="empty";
      bag.capacity_units=Math.max(1,Number(bag.capacity_units||1));
      if(!String(bag.description||"").includes("重複")){
        bag.description=(String(bag.description||"").replace(/\s+$/,"")+" 可重複裝水使用。").trim();
      }
    }
    addGeneralStock(bag.id);
    return bag;
  }

  const bucketDefinition=ensureBucketDefinition();
  const emptyBagDefinition=ensureEmptyBagDefinition();
  const EMPTY_BAG_ID=emptyBagDefinition.id;

  function ensureFilledWaterSemantics(){
    const water=dbItem(WATER_ITEM_ID);
    if(!water)return null;
    water.water_storage_container=true;
    water.container_state="filled";
    water.container_return_id=EMPTY_BAG_ID;
    water.capacity_units=1;
    water.refill_source="freshwater_point";
    return water;
  }
  const waterDefinition=ensureFilledWaterSemantics();

  const uniqList=values=>[...new Set((Array.isArray(values)?values:[]).filter(Boolean))];

  function syncContentLinkItemSources(){
    DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
    const old=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
    const validIds=new Set((DB.items||[]).map(d=>d?.id).filter(Boolean));
    const src={};

    for(const d of DB.items||[]){
      if(!d?.id)continue;
      src[d.id]={
        shops:[],
        gather_locations:[],
        monster_drops:[],
        recipe_inputs:[],
        recipe_outputs:[],
        special_sources:uniqList(old[d.id]?.special_sources||[])
      };
    }

    for(const [fid,f] of Object.entries(DB.facilities||{})){
      for(const id of f?.stock||[])if(src[id])src[id].shops=uniqList([...src[id].shops,fid]);
    }
    for(const l of DB.locations||[]){
      for(const id of l?.gather||[])if(src[id])src[id].gather_locations=uniqList([...src[id].gather_locations,l.id]);
    }
    for(const m of DB.monsters||[]){
      for(const drop of m?.loot_materials||[])if(drop?.id&&src[drop.id])src[drop.id].monster_drops=uniqList([...src[drop.id].monster_drops,m.id]);
    }

    for(const recipe of DB.recipes||[]){
      const rid=recipe?.id||`recipe:${recipe?.name||"unnamed"}`;
      for(const ing of recipe?.ingredients||[])if(ing?.item_id&&src[ing.item_id])src[ing.item_id].recipe_inputs=uniqList([...src[ing.item_id].recipe_inputs,rid]);
      for(const id of Object.keys(recipe?.requires||{}))if(src[id])src[id].recipe_inputs=uniqList([...src[id].recipe_inputs,rid]);
      const out=recipe?.output?.item_id||recipe?.result||null;
      if(out&&src[out])src[out].recipe_outputs=uniqList([...src[out].recipe_outputs,rid]);
    }

    for(const d of DB.items||[]){
      const cr=d?.craft_recipe;if(!d?.id||!cr)continue;
      const rid=d.recipe_id||`craft:${d.id}`;
      for(const ing of [...(cr.base_materials||[]),...(cr.monster_components||[])])if(ing?.id&&src[ing.id])src[ing.id].recipe_inputs=uniqList([...src[ing.id].recipe_inputs,rid]);
      src[d.id].recipe_outputs=uniqList([...src[d.id].recipe_outputs,rid]);
    }

    const water=src[WATER_ITEM_ID];
    if(water)water.special_sources=uniqList([...water.special_sources,"water_source"]);

    const structuralSources=new Set(["shop","cook","craft","monster_drop","gather"]);
    for(const d of DB.items||[]){
      if(!d?.id||!src[d.id])continue;
      for(const declared of d.acquisition_sources||[]){
        if(!structuralSources.has(declared))src[d.id].special_sources=uniqList([...src[d.id].special_sources,`declared:${declared}`]);
      }
    }

    DB.content_link_index.item_sources=src;
    DB.meta.content_link_item_source_count=Object.keys(src).length;
    return {
      item_count:validIds.size,
      index_count:Object.keys(src).length,
      blank_ids:Object.entries(src).filter(([,s])=>!["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"].some(k=>(s[k]||[]).length)).map(([id])=>id)
    };
  }

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
      empty_bag_item_id:EMPTY_BAG_ID,
      collection_tool_id:bucketDefinition?.id||FOLD_BUCKET_ID,
      source_count:rows.length,
      container_conservation:true,
      rules:[
        "城鎮提供公共水井或蓄水槽；河流、溪流、泉眼、湖潭等淡水地形可形成野外取水點。",
        "海水、潮池、沼澤、污染水、黑水與熔岩相關地點不會直接產出可飲用清水。",
        "折疊水桶／水桶是取水工具，不是可憑空生成的儲水容器。",
        "每取得1份 I-WATER 必須先消耗1個空水袋；沒有空水袋時不能取水。",
        "飲用 I-WATER 或把 I-WATER 用於料理後，會退回同數量的空水袋。",
        "取水點具有容量與每小時恢復量，不建立無限瞬時資源。"
      ]
    };
    return rows;
  }

  rebuildWaterSourcePoints();
  syncContentLinkItemSources();

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

  function inventoryQuantity(id){
    if(typeof G==="undefined"||!G?.character?.inventory)return 0;
    if(typeof inventoryQty==="function")try{return Number(inventoryQty(id)||0)}catch(e){}
    return G.character.inventory.reduce((n,x)=>n+(x?.id===id?Number(x.qty||1):0),0);
  }

  function collectionTool(){
    if(typeof G==="undefined"||!G?.character?.inventory)return null;
    let best=null;
    for(const x of G.character.inventory){
      const d=dbItem(x?.id);if(!d)continue;
      const marked=d.water_collection_tool===true||d.tool_effect==="water_collect"||COLLECTION_TOOL_RE.test(String(d.name||""));
      if(!marked)continue;
      const capacity=Math.max(1,Number(d.collection_capacity||3));
      if(!best||capacity>best.capacity)best={id:d.id,name:d.name||"取水工具",capacity};
    }
    return best;
  }

  function emptyBagCount(){return inventoryQuantity(EMPTY_BAG_ID)}

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

    const node=waterNode(source),tool=collectionTool(),bags=emptyBagCount();
    const button=document.createElement("button");
    button.type="button";
    button.dataset.waterSourceAction="1";

    if(!node||node.current<1){
      button.disabled=true;
      button.textContent=`取水（${source.name}・恢復中）`;
    }else if(!tool){
      button.textContent="取水（需要折疊水桶）";
      button.addEventListener("click",takeWaterAtSource);
    }else if(bags<1){
      button.textContent="取水（需要空水袋）";
      button.addEventListener("click",takeWaterAtSource);
    }else{
      button.textContent=`取水（${source.name}｜空水袋 ${bags}）`;
      button.addEventListener("click",takeWaterAtSource);
    }
    box.appendChild(button);
  }

  function takeWaterAtSource(){
    if(typeof G==="undefined"||!G?.character)return;
    const source=currentWaterSource();
    if(!source){alert("此地沒有可安全取用的淡水點。");return}

    const tool=collectionTool();
    if(!tool){alert("需要折疊水桶或其他取水工具才能取水。");return}

    const bags=emptyBagCount();
    if(bags<=0){alert("需要空水袋才能裝水。取水不會憑空增加水袋。");return}

    const node=waterNode(source);
    if(!node||node.current<1){alert("這個取水點目前水量不足，稍後會逐步恢復。");syncWaterSourceUI();return}

    const qty=Math.max(1,Math.min(
      Math.floor(node.current),
      Math.floor(source.per_action||3),
      Math.floor(tool.capacity||3),
      Math.floor(bags)
    ));

    if(typeof beginTurn==="function"&&!beginTurn("取水"))return;

    let removed=false;
    if(typeof removeItem==="function")removed=removeItem(EMPTY_BAG_ID,qty);
    if(!removed){
      if(typeof log==="function")log("取水","空水袋數量變動，取水取消。","danger");
      if(typeof endTurn==="function")endTurn(0);
      return;
    }

    node.current=Math.max(0,node.current-qty);
    node.lastHour=currentGameHour();
    if(typeof addItem==="function")addItem(WATER_ITEM_ID,qty);

    if(typeof log==="function"){
      log("取水",`在${source.name}使用${tool.name}，將 ${qty} 個空水袋裝滿；取得清水×${qty}。空水袋剩餘 ${emptyBagCount()}，水源剩餘 ${Math.floor(node.current)}/${node.max}。`,"ok");
    }

    if(typeof endTurn==="function")endTurn(Number(source.time_hours||.5));
    else{try{persist?.()}catch(e){};try{renderAll?.()}catch(e){}}
  }

  function returnEmptyBags(qty,reason){
    qty=Math.max(0,Math.floor(Number(qty)||0));if(qty<=0)return 0;
    if(typeof addItem==="function")addItem(EMPTY_BAG_ID,qty);
    if(typeof log==="function"&&reason)log("水袋",`${reason}；留下空水袋×${qty}。`,"");
    return qty;
  }

  if(typeof useItem==="function"&&!globalThis.__WATER_BAG_USE_PATCHED){
    const baseUseItem=useItem;
    useItem=function(index){
      const before=inventoryQuantity(WATER_ITEM_ID);
      const target=(typeof G!=="undefined"&&G?.character?.inventory)?G.character.inventory[index]:null;
      const isWater=target?.id===WATER_ITEM_ID;
      const result=baseUseItem.apply(this,arguments);
      if(isWater){
        const after=inventoryQuantity(WATER_ITEM_ID),used=Math.max(0,before-after);
        if(used>0){
          returnEmptyBags(used,"飲用水袋中的清水");
          try{persist?.()}catch(e){}
          try{renderAll?.()}catch(e){}
          try{openInventory?.()}catch(e){}
        }
      }
      return result;
    };
    globalThis.__WATER_BAG_USE_PATCHED=true;
  }

  if(typeof consumeIngredient==="function"&&!globalThis.__WATER_BAG_INGREDIENT_PATCHED){
    const baseConsumeIngredient=consumeIngredient;
    consumeIngredient=function(id,qty){
      const before=id===WATER_ITEM_ID?inventoryQuantity(WATER_ITEM_ID):0;
      const result=baseConsumeIngredient.apply(this,arguments);
      if(id===WATER_ITEM_ID){
        const after=inventoryQuantity(WATER_ITEM_ID),used=Math.max(0,before-after);
        if(used>0)returnEmptyBags(used,null);
      }
      return result;
    };
    globalThis.__WATER_BAG_INGREDIENT_PATCHED=true;
  }

  function runWaterSourceAudit(){
    const points=Array.isArray(DB.water_source_points)?DB.water_source_points:[];
    const towns=(DB.locations||[]).filter(l=>l?.kind==="town");
    const missingTowns=towns.filter(l=>!waterSourceAt(l.id)).map(l=>l.name||l.id);
    const water=dbItem(WATER_ITEM_ID);
    const emptyBag=dbItem(EMPTY_BAG_ID);
    const bucket=(DB.items||[]).find(d=>d?.water_collection_tool===true||d?.tool_effect==="water_collect"||COLLECTION_TOOL_RE.test(String(d?.name||"")));
    const lifecycleOk=water?.container_return_id===EMPTY_BAG_ID&&emptyBag?.container_state==="empty";
    const linkAudit=syncContentLinkItemSources();
    return {
      revision:REVISION,
      pass:!!water&&!!emptyBag&&!!bucket&&lifecycleOk&&points.length>0&&missingTowns.length===0&&linkAudit.index_count===linkAudit.item_count,
      source_count:points.length,
      town_count:towns.length,
      missing_towns:missingTowns,
      water_item_present:!!water,
      empty_bag_present:!!emptyBag,
      collection_tool_present:!!bucket,
      container_lifecycle_ok:lifecycleOk,
      item_source_index_count:linkAudit.index_count,
      item_count:linkAudit.item_count,
      blank_item_source_ids:linkAudit.blank_ids
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
        if(!audit.empty_bag_present)issues.push("空水袋缺失");
        if(!audit.collection_tool_present)issues.push("取水工具缺失");
        if(!audit.container_lifecycle_ok)issues.push("水袋空／滿轉換異常");
        if(audit.item_source_index_count!==audit.item_count)issues.push(`物品來源索引數量異常：${audit.item_source_index_count}/${audit.item_count}`);
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
  globalThis.waterEmptyBagId=EMPTY_BAG_ID;
  globalThis.syncContentLinkItemSources=syncContentLinkItemSources;

  if(typeof window!=="undefined")window.addEventListener("load",()=>setTimeout(syncWaterSourceUI,200),{once:true});
})();
