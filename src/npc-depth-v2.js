/* 群陸旅誌：NPC 深化第二階段 CURRENT-1.63.0
 * NPC-DEPTH-2.0
 * 情報傳播／工作圈口碑／短期議程／服務可用性／跨NPC連鎖反應
 */
(()=>{
  if(typeof DB!=="object"||!DB)return;

  const RELEASE="CURRENT-1.63.0";
  const REVISION="NPC-DEPTH-2.0";
  const CFG={
    heartbeat_ms:30000,
    propagation_interval_hours:6,
    max_catchup_ticks:24,
    knowledge_limit:12,
    event_limit:80,
    seen_event_limit:220,
    knowledge_max_age_hours:168,
    intel_interaction_hours:.05,
    crisis_override_hours:2,
    crisis_override_cooldown_hours:12,
    min_share_affinity:18,
    min_share_confidence:.32
  };

  const DOMAIN_INTERESTS={
    roads:["infrastructure","north","general"],
    legal:["law","infrastructure","general"],
    notary:["law","food","ore","coast"],
    agriculture:["food","river","general"],
    river:["river","food","wetland"],
    grain:["food","river","general"],
    transport:["ore","infrastructure","general"],
    mining:["ore","law","general"],
    frontier:["north","infrastructure","general"],
    medicine:["medical","north","general"],
    rescue:["coast","medical","general"],
    records:["coast","law","general"],
    forge:["ore","law","general"],
    alchemy:["medical","wetland","general"],
    relief:["food","north","general"],
    wetland:["wetland","river","general"],
    infrastructure:["infrastructure","law","general"],
    customs:["coast","law","ore","general"]
  };

  const DECISION_STYLE={
    roads:"先確認封鎖範圍、替代道路與通行紀錄，再決定是否擴大管制。",
    legal:"先區分事實、證詞與推測，再處理程序與權限。",
    notary:"先核對重量、貨單、印記與交付條件，不以口頭說法取代證據。",
    agriculture:"先保住蜂群與耕地的長期恢復能力，再談短期產量。",
    river:"先看水位、雨量與上下游影響，避免只解決單一聚落的問題。",
    grain:"先比對實際庫存、重量與到貨節點，再決定出庫或限量。",
    transport:"先判斷道路與車況是否能安全完成運送，再計算修理與延誤成本。",
    mining:"先驗樣本與來源合法性，再決定材料是否能進入高階流程。",
    frontier:"先建立預警與撤離順序，再考慮追擊或深入偵查。",
    medicine:"先依檢傷、保暖與撤離可能性排序，不把英雄式冒險放在救治之前。",
    rescue:"先確認潮位、風勢、繩索與撤退窗口，再讓人員進入危險區。",
    records:"先保存原始紀錄與可驗證片段，寧可保留未知也不補寫結論。",
    forge:"先檢查材料資格、工法與火候，再決定是否值得投入高階資源。",
    alchemy:"先確認純度、劑量與副作用範圍，再說明藥劑能做與不能做的事。",
    relief:"先找出真正缺糧的地方與弱勢人口，再分配有限供應。",
    wetland:"先測量可重複驗證的現象，未經許可不把未知區域當成既定事實。",
    infrastructure:"先拆成結構、供水、交通與權限鏈，避免單點修復造成連鎖故障。",
    customs:"先核對來源、貨單與風險層級，優先攔真正危險的貨物而不是全面阻塞貿易。"
  };

  const TOPIC_LABEL={
    infrastructure:"道路與基礎設施",
    law:"契約、封印與查驗",
    food:"糧食與民生供應",
    river:"河谷、水閘與灌溉",
    ore:"礦材、鍛造與運輸",
    north:"北境守備與寒害",
    medical:"醫療、救護與藥劑",
    coast:"沿岸、潮汐與海關",
    wetland:"夜鏡沼與測繪",
    player:"玩家工作紀錄",
    general:"一般工作動態"
  };

  DB.meta=DB.meta||{};
  DB.meta.current_version=globalThis.QUNLU_RELEASE_VERSION||DB.meta.current_version||RELEASE;
  DB.meta.npc_depth_revision=REVISION;
  DB.npc_depth_phase2_system={
    version:REVISION,
    dimensions:["事件情報","消息可信度","工作圈傳播","玩家口碑","短期處置議程","勤務可用性","跨NPC協作"],
    rules:[
      "NPC只接收與自身職務、所在地或既有人際關係有關的資訊，不具全知視角。",
      "世界事件先形成個別情報，再沿既有NPC關係網有限傳播；每次轉述都降低可信度。",
      "玩家協助、相關委託完成與失敗會先由直接關係人記住，再可能形成工作圈口碑。",
      "工作圈口碑與第一階段的直接信任分離，不額外提高商店、報酬或資格上限。",
      "重大事件可短暫改變NPC目前勤務內容，但不取代疲勞休整，也不讓NPC瞬間跨地圖傳送。",
      "NPC會明確區分已確認消息、高可信消息、工作傳聞與未核實情報。"
    ],
    save_schema_changed:false,
    compatible_with:["NPC-DEPTH-1.0","WORLD-AUTONOMY-2.0","MARKET-PRICE-SYNC-2.0"]
  };

  function game(){return typeof G!=="undefined"?G:null}
  function nowHour(){return typeof totalHours==="function"?Number(totalHours()||0):0}
  function clampN(v,a,b){return typeof clamp==="function"?clamp(v,a,b):Math.max(a,Math.min(b,Number(v||0)))}
  function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
  function profiles(){return Array.isArray(DB.npc_personality_profiles)?DB.npc_personality_profiles:[]}
  function profile(id){return profiles().find(x=>x.npc_id===id)||null}
  function npcRow(id){return (DB.regional_npc_archetypes||[]).find(x=>x.id===id)||null}
  function npcName(id){return npcRow(id)?.name||id}
  function locationRow(id){return typeof loc==="function"?loc(id):(DB.locations||[]).find(x=>x.id===id)}
  function locationName(id){return locationRow(id)?.name||id||"未知地點"}
  function relationEdges(id){return (DB.npc_relationship_edges||[]).filter(e=>e.a===id||e.b===id)}
  function otherNpc(edge,id){return edge.a===id?edge.b:edge.a}
  function stage1(id){return typeof globalThis.ensureNpcDepthState==="function"?globalThis.ensureNpcDepthState(id):null}
  function currentNpc(id){return typeof globalThis.worldNpcCurrentState==="function"?globalThis.worldNpcCurrentState(id):null}

  function rootState(){
    const g=game();if(!g?.worldState)return null;
    g.worldState.npcDepth2=g.worldState.npcDepth2&&typeof g.worldState.npcDepth2==="object"?g.worldState.npcDepth2:{};
    const r=g.worldState.npcDepth2;
    r.version=REVISION;
    r.npcs=r.npcs&&typeof r.npcs==="object"?r.npcs:{};
    r.events=Array.isArray(r.events)?r.events:[];
    r.seenWorldEvents=Array.isArray(r.seenWorldEvents)?r.seenWorldEvents:[];
    r.seenNpcEvents=Array.isArray(r.seenNpcEvents)?r.seenNpcEvents:[];
    r.appliedPlayerEvents=Array.isArray(r.appliedPlayerEvents)?r.appliedPlayerEvents:[];
    if(!Number.isFinite(Number(r.lastPropagationHour)))r.lastPropagationHour=nowHour();
    if(!Number.isFinite(Number(r.lastPersistMs)))r.lastPersistMs=Date.now();
    return r;
  }

  function ensureNpc2(id){
    const r=rootState(),p=profile(id);if(!r||!p)return null;
    let s=r.npcs[id];
    if(!s||typeof s!=="object")s=r.npcs[id]={id,knowledge:[],playerImpression:0,directPlayerEvidence:0,heardPlayerEvidence:0,lastIntelHour:-999,lastDutyHour:-999,agenda:null,lastAvailability:"",lastPropagationHour:-999};
    s.knowledge=Array.isArray(s.knowledge)?s.knowledge:[];
    s.playerImpression=clampN(Number(s.playerImpression||0),-50,50);
    return s;
  }

  function rememberSeen(arr,id){
    if(!id||arr.includes(id))return;
    arr.unshift(id);if(arr.length>CFG.seen_event_limit)arr.length=CFG.seen_event_limit;
  }

  function eventKey(prefix,e,index=0){
    return String(e?.id||`${prefix}-${Math.round(Number(e?.hour||0)*100)}-${index}-${String(e?.type||"")}-${String(e?.summary||"").slice(0,42)}`);
  }

  function eventTopics(e){
    const text=`${e?.type||""} ${e?.summary||""} ${JSON.stringify(e?.data||{})}`;
    const out=[];
    const add=t=>{if(!out.includes(t))out.push(t)};
    if(/道路|工務|舊城|鑄幣|水道|封鎖|橋|城牆|交通/.test(text))add("infrastructure");
    if(/公證|仲裁|封印|貨單|海關|走私|契約|查驗|證據/.test(text))add("law");
    if(/糧|蜂|農|花田|月磨|歉收|救濟|麵包|亞麻/.test(text))add("food");
    if(/河|雨|水閘|渠|灌溉|水位/.test(text))add("river");
    if(/礦|赤鐵|玄武|車軸|鍛造|礦材|精鋼/.test(text))add("ore");
    if(/北境|北望|霜|寒|雪|烽火|狼|雪線|守備/.test(text))add("north");
    if(/傷|醫|藥|救護|檢傷|中毒|病患/.test(text))add("medical");
    if(/海|沿岸|潮|礁|黎明港|救難|沉潮|船/.test(text))add("coast");
    if(/夜鏡|濕地|倒影|測繪|沼/.test(text))add("wetland");
    if(!out.length)add("general");
    return out;
  }

  function eventSeverity(e){
    const text=`${e?.type||""} ${e?.summary||""}`;
    if(/失控|中斷|超載|撤離|失事|崩|襲|佔領|危急|死亡|斷糧|嚴重/.test(text))return 3;
    if(/延誤|強風|寒|異常|警戒|枯竭|缺糧|封鎖|雷雨|狼|風險/.test(text))return 2;
    return 1;
  }

  function confidenceLabel(v){
    v=Number(v||0);
    if(v>=.9)return "已確認";
    if(v>=.72)return "高度可信";
    if(v>=.5)return "工作傳聞";
    return "未核實";
  }

  function impressionLabel(v){
    v=Number(v||0);
    if(v>=16)return "工作圈普遍肯定";
    if(v>=6)return "工作圈評價偏正面";
    if(v<=-16)return "工作圈明顯警戒";
    if(v<=-6)return "工作圈有所保留";
    return "尚未形成明確口碑";
  }

  function topicLabel(t){return TOPIC_LABEL[t]||t||TOPIC_LABEL.general}

  function pushPhase2Event(type,summary,data={}){
    const r=rootState();if(!r)return;
    r.events.unshift({id:`NPCD2-${Math.round(nowHour()*10)}-${Math.random().toString(36).slice(2,7)}`,hour:nowHour(),time:typeof timeText==="function"?timeText():"",type,summary,data});
    if(r.events.length>CFG.event_limit)r.events.length=CFG.event_limit;
  }

  function knowledgeScore(k){
    const age=Math.max(0,nowHour()-Number(k.lastHour??k.hour??0));
    const fresh=Math.max(.2,1-age/CFG.knowledge_max_age_hours);
    return Number(k.severity||1)*Number(k.confidence||0)*fresh;
  }

  function addKnowledge(id,k,opt={}){
    const s=ensureNpc2(id);if(!s)return false;
    const originId=String(k.originId||k.id||"");if(!originId)return false;
    const existing=s.knowledge.find(x=>x.originId===originId);
    const confidence=clampN(Number(k.confidence??.7),.05,1);
    if(existing){
      if(confidence>Number(existing.confidence||0)){existing.confidence=confidence;existing.lastHour=nowHour();existing.sourceNpcId=opt.sourceNpcId||existing.sourceNpcId;existing.sourceKind=opt.sourceKind||existing.sourceKind}
      return false;
    }
    const row={
      originId,
      topic:k.topic||"general",
      summary:String(k.summary||""),
      severity:clampN(Number(k.severity||1),1,3),
      confidence,
      sourceNpcId:opt.sourceNpcId||k.sourceNpcId||null,
      sourceKind:opt.sourceKind||k.sourceKind||"public",
      firstHour:nowHour(),
      lastHour:nowHour(),
      playerRelated:!!k.playerRelated,
      reputationDelta:Number(k.reputationDelta||0)
    };
    s.knowledge.unshift(row);
    s.knowledge.sort((a,b)=>knowledgeScore(b)-knowledgeScore(a));
    if(s.knowledge.length>CFG.knowledge_limit)s.knowledge.length=CFG.knowledge_limit;
    if(row.playerRelated&&row.reputationDelta){
      const scale=opt.direct?1:Math.max(.2,Math.min(.65,confidence*.55));
      s.playerImpression=clampN(s.playerImpression+row.reputationDelta*scale,-50,50);
      if(opt.direct)s.directPlayerEvidence=Number(s.directPlayerEvidence||0)+1;else s.heardPlayerEvidence=Number(s.heardPlayerEvidence||0)+1;
    }
    return true;
  }

  function interestedNpcIds(topics){
    const ids=[];
    for(const p of profiles()){
      const wanted=DOMAIN_INTERESTS[p.domain]||["general"];
      if(topics.some(t=>wanted.includes(t)||t==="general"&&wanted.includes("general")))ids.push(p.npc_id);
    }
    return ids;
  }

  function ingestWorldEvent(e,key){
    const topics=eventTopics(e),severity=eventSeverity(e),targets=interestedNpcIds(topics);
    for(const id of targets){
      const p=profile(id),topic=topics.find(t=>(DOMAIN_INTERESTS[p?.domain]||[]).includes(t))||topics[0]||"general";
      addKnowledge(id,{originId:key,topic,summary:e.summary||"世界局勢發生變化。",severity,confidence:.92},{sourceKind:"public",direct:true});
    }
    if(severity>=3&&targets.length)pushPhase2Event("world_intel",`${targets.length}名相關NPC開始處理：${String(e.summary||"重大世界事件")}`,{originId:key,topics,targets});
  }

  function playerEventDelta(type){
    if(type==="player_help")return 4;
    if(type==="quest_complete")return 6;
    if(type==="quest_fail")return -5;
    return 0;
  }

  function ingestNpcEvent(e,key){
    const type=String(e?.type||"").replace(/^npc_/,""),npcId=e?.data?.npcId||null,delta=playerEventDelta(type);
    if(!npcId||!delta)return;
    const r=rootState();if(r.appliedPlayerEvents.includes(key))return;
    rememberSeen(r.appliedPlayerEvents,key);
    const text=type==="player_help"?`${npcName(npcId)}記得玩家曾主動協助工作。`:type==="quest_complete"?`${npcName(npcId)}確認玩家完成了一項相關委託。`:`${npcName(npcId)}記得玩家有一項相關委託未完成。`;
    addKnowledge(npcId,{originId:key,topic:"player",summary:text,severity:Math.abs(delta)>=5?2:1,confidence:1,playerRelated:true,reputationDelta:delta},{sourceKind:"direct",direct:true});
    pushPhase2Event("player_reputation",text,{npcId,delta,originId:key});
  }

  function ingestNewEvents(){
    const r=rootState();if(!r)return false;let changed=false;
    const worldEvents=Array.isArray(game()?.worldState?.worldAutonomy2?.events)?game().worldState.worldAutonomy2.events:[];
    const seenW=new Set(r.seenWorldEvents);
    worldEvents.slice().reverse().forEach((e,i)=>{const key=eventKey("W",e,i);if(seenW.has(key))return;rememberSeen(r.seenWorldEvents,key);seenW.add(key);if(String(e?.type||"").startsWith("npc_"))return;ingestWorldEvent(e,key);changed=true});
    const npcEvents=Array.isArray(game()?.worldState?.npcDepth?.events)?game().worldState.npcDepth.events:[];
    const seenN=new Set(r.seenNpcEvents);
    npcEvents.slice().reverse().forEach((e,i)=>{const key=eventKey("N",e,i);if(seenN.has(key))return;rememberSeen(r.seenNpcEvents,key);seenN.add(key);ingestNpcEvent(e,key);changed=true});
    return changed;
  }

  function shareMultiplier(edge,sourceId,targetId){
    const affinity=Number(edge?.affinity||0);if(affinity<CFG.min_share_affinity)return 0;
    const a=currentNpc(sourceId),b=currentNpc(targetId),same=!!(a?.locationId&&a.locationId===b?.locationId);
    const relation=Math.min(.83,.58+affinity/220);
    return relation*(same?1:.82);
  }

  function propagateOneTick(){
    const ids=profiles().map(p=>p.npc_id);let changed=false;
    for(const sourceId of ids){
      const source=ensureNpc2(sourceId);if(!source)continue;
      const items=source.knowledge.filter(k=>nowHour()-Number(k.lastHour||0)<=CFG.knowledge_max_age_hours&&Number(k.confidence||0)>=.45).slice(0,6);
      if(!items.length)continue;
      for(const edge of relationEdges(sourceId)){
        const targetId=otherNpc(edge,sourceId),mult=shareMultiplier(edge,sourceId,targetId);if(mult<=0)continue;
        for(const k of items){
          const c=Number(k.confidence||0)*mult;if(c<CFG.min_share_confidence)continue;
          const added=addKnowledge(targetId,{...k,confidence:c},{sourceKind:"colleague",sourceNpcId:sourceId,direct:false});
          if(added)changed=true;
        }
      }
    }
    return changed;
  }

  function currentAgenda(id){
    const n=ensureNpc2(id),p=profile(id),concern=typeof globalThis.npcConcern==="function"?globalThis.npcConcern(id):null;
    if(!n||!p)return {severity:0,topic:"general",text:"沒有可確認的短期議程。",source:"none"};
    const top=n.knowledge.filter(k=>nowHour()-Number(k.lastHour||0)<=CFG.knowledge_max_age_hours).sort((a,b)=>knowledgeScore(b)-knowledgeScore(a))[0];
    if(top&&knowledgeScore(top)>=1.05)return {severity:top.severity,topic:top.topic,text:top.summary,confidence:top.confidence,source:"knowledge",originId:top.originId};
    if(concern&&Number(concern.severity||0)>0)return {severity:Number(concern.severity||0),topic:(DOMAIN_INTERESTS[p.domain]||["general"])[0],text:concern.text,confidence:1,source:"concern"};
    return {severity:0,topic:(DOMAIN_INTERESTS[p.domain]||["general"])[0],text:p.concern||"維持日常工作。",confidence:1,source:"baseline"};
  }

  function availability(id){
    const st=currentNpc(id),s1=stage1(id),agenda=currentAgenda(id),activity=String(st?.activity||"");
    if(!st)return {code:"unknown",label:"行程未知",detail:"目前無法確認位置與勤務。"};
    if(/休息|休整|晚禱/.test(activity))return {code:"off",label:"休息／非勤務時段",detail:"只處理真正緊急的事情。"};
    if(Number(s1?.stress||0)>=85||Number(s1?.energy||100)<=15)return {code:"limited",label:"僅處理緊急事項",detail:"壓力或精力已接近負荷上限。"};
    if(/巡查|巡邏|巡救|測繪|抽查|救援|地下|外礁|雪線|巡田/.test(activity))return {code:"field",label:"外勤中",detail:"人在工作地點，但不適合長時間交談。"};
    if(Number(agenda.severity||0)>=3)return {code:"priority",label:"高優先勤務",detail:`正在集中處理「${topicLabel(agenda.topic)}」。`};
    return {code:"normal",label:"正常勤務",detail:"可進行一般交談與工作詢問。"};
  }

  function maybeApplyCrisisDuty(id){
    const n=ensureNpc2(id),s1=stage1(id),st=currentNpc(id),agenda=currentAgenda(id);if(!n||!s1||!st)return false;
    if(Number(agenda.severity||0)<3||Number(agenda.confidence||1)<.72)return false;
    if(Number(s1.stress||0)>=80||Number(s1.energy||100)<25)return false;
    if(Number(s1.overrideUntilHour||0)>nowHour())return false;
    if(nowHour()-Number(n.lastDutyHour||-999)<CFG.crisis_override_cooldown_hours)return false;
    if(/休息|休整|晚禱/.test(String(st.activity||"")))return false;
    s1.overrideUntilHour=nowHour()+CFG.crisis_override_hours;
    s1.overrideLocationId=st.locationId;
    s1.overrideActivity=`協調處置：${topicLabel(agenda.topic)}`;
    n.lastDutyHour=nowHour();
    pushPhase2Event("duty_override",`${npcName(id)}暫時調整勤務，優先處理${topicLabel(agenda.topic)}。`,{npcId:id,topic:agenda.topic});
    return true;
  }

  function refreshAgendas(){
    let changed=false;
    for(const p of profiles()){
      const s=ensureNpc2(p.npc_id);if(!s)continue;
      const next=currentAgenda(p.npc_id),before=JSON.stringify(s.agenda||null);s.agenda=next;if(JSON.stringify(next)!==before)changed=true;
      const a=availability(p.npc_id);if(s.lastAvailability!==a.code){s.lastAvailability=a.code;changed=true}
      if(maybeApplyCrisisDuty(p.npc_id))changed=true;
    }
    return changed;
  }

  function runPropagationCatchup(){
    const r=rootState();if(!r)return false;
    const due=Math.floor(Math.max(0,nowHour()-Number(r.lastPropagationHour||nowHour()))/CFG.propagation_interval_hours),ticks=Math.min(due,CFG.max_catchup_ticks);let changed=false;
    for(let i=0;i<ticks;i++)if(propagateOneTick())changed=true;
    if(due>0){r.lastPropagationHour=Number(r.lastPropagationHour||nowHour())+due*CFG.propagation_interval_hours;changed=true}
    return changed;
  }

  function nearbyForInteraction(id){
    const g=game(),st=currentNpc(id);return !!(g?.character&&st?.locationId===g.character.locationId&&!g.character.battle);
  }

  function bestKnowledge(id){
    const n=ensureNpc2(id);return n?.knowledge?.filter(k=>nowHour()-Number(k.lastHour||0)<=CFG.knowledge_max_age_hours).sort((a,b)=>knowledgeScore(b)-knowledgeScore(a))[0]||null;
  }

  function npcAskIntel(id){
    npcDepth2Heartbeat("intel");
    if(!nearbyForInteraction(id)){if(typeof alert==="function")alert("這名NPC目前不在你所在的位置，無法當面詢問消息。");return}
    const a=availability(id);if(a.code==="off"){if(typeof alert==="function")alert("對方目前在休息或非勤務時段，不會處理一般情報詢問。");return}
    const s1=stage1(id),n=ensureNpc2(id),p=profile(id);if(!n||!p)return;
    if(typeof beginTurn==="function"&&!beginTurn(`向${npcName(id)}詢問近期消息`))return;
    if(typeof endTurn==="function")endTurn(CFG.intel_interaction_hours);
    n.lastIntelHour=nowHour();
    const k=bestKnowledge(id),agenda=currentAgenda(id);let text="";
    if(!k||Number(s1?.familiarity||0)<3){
      text=`${npcName(id)}只談目前正在處理的工作：${agenda.text}`;
    }else{
      const sourceName=k.sourceNpcId&&Number(s1?.trust||0)>=25?`，來源與${npcName(k.sourceNpcId)}的工作往來有關`:"";
      text=`${confidenceLabel(k.confidence)}：${k.summary}${sourceName}。`;
      if(Number(s1?.trust||0)<10)text+=` 對方沒有進一步說明來源。`;
    }
    if(typeof persist==="function")try{persist()}catch(e){}
    if(typeof globalThis.openNpcProfile==="function")globalThis.openNpcProfile(id,text);
  }

  function networkRelationSummary(id){
    const edges=relationEdges(id).slice().sort((a,b)=>Math.abs(Number(b.affinity||0))-Math.abs(Number(a.affinity||0)));
    if(!edges.length)return "沒有已建檔的固定工作關係。";
    const e=edges[0],other=otherNpc(e,id);return `${npcName(other)}｜${e.type}｜${e.note}`;
  }

  function profileCardHtml(id){
    const p=profile(id),n=ensureNpc2(id),s1=stage1(id),st=currentNpc(id),agenda=currentAgenda(id),a=availability(id);if(!p||!n)return "";
    const intel=n.knowledge.filter(k=>nowHour()-Number(k.lastHour||0)<=CFG.knowledge_max_age_hours);
    return `<div class="card" data-npc-depth2-card="1"><b>第二階段・社會脈絡</b><br><span class="small">勤務狀態：${esc(a.label)}｜${esc(a.detail)}<br>短期議程：${esc(agenda.text)}<br>處理習慣：${esc(DECISION_STYLE[p.domain]||"先核對能確認的資訊，再決定下一步。")}<br>工作圈對你的評價：${esc(impressionLabel(n.playerImpression))}（${Math.round(n.playerImpression)}）<br>目前掌握 ${intel.length} 則近期工作情報；消息會依關係網傳播並逐次降低可信度。<br>主要工作關係：${esc(networkRelationSummary(id))}</span></div><div class="actions" data-npc-depth2-actions="1">${nearbyForInteraction(id)&&a.code!=="off"?`<button onclick="npcAskIntel('${id}')">詢問近期消息</button>`:""}<button onclick="openNpcNetwork('${id}')">查看人物網絡</button></div>`;
  }

  function decorateNpcProfile(id){
    if(typeof document==="undefined")return;
    const body=document.getElementById("modalBody");if(!body||body.querySelector("[data-npc-depth2-card]"))return;
    body.insertAdjacentHTML("beforeend",profileCardHtml(id));
  }

  function decorateJournal(){
    if(typeof document==="undefined")return;
    const body=document.getElementById("modalBody");if(!body||body.querySelector("[data-npc-depth2-journal]"))return;
    const r=rootState(),recent=(r?.events||[]).slice(0,3).map(e=>`<div class="small">${esc(e.time||"")}｜${esc(e.summary)}</div>`).join("")||"<div class='small'>尚無第二階段人物事件。</div>";
    const card=document.createElement("div");card.className="card";card.dataset.npcDepth2Journal="1";card.innerHTML=`<b>人物社會脈絡</b>${recent}<div class="actions"><button type="button" onclick="openNpcNetwork()">開啟人物網絡</button></div>`;body.insertBefore(card,body.firstChild);
  }

  function openNpcNetwork(focusId=null){
    npcDepth2Heartbeat("network");const g=game();if(!g)return;
    const known=profiles().map(p=>p.npc_id).filter(id=>stage1(id)?.discovered);
    known.sort((a,b)=>{if(a===focusId)return -1;if(b===focusId)return 1;const aa=currentNpc(a)?.locationId===g.character?.locationId?0:1,bb=currentNpc(b)?.locationId===g.character?.locationId?0:1;return aa-bb||npcName(a).localeCompare(npcName(b),"zh-Hant")});
    const rows=known.map(id=>{const row=npcRow(id),st=currentNpc(id),n=ensureNpc2(id),agenda=currentAgenda(id),a=availability(id),near=st?.locationId===g.character?.locationId;return `<div class="itemrow"><span><b>${esc(row?.name||id)}</b>${near?"｜<b>在附近</b>":""}<br><span class="small">${esc(row?.role||"")}｜${esc(locationName(st?.locationId))}・${esc(a.label)}<br>${esc(impressionLabel(n?.playerImpression||0))}｜議程：${esc(agenda.text)}</span></span><button onclick="openNpcProfile('${id}')">人物誌</button></div>`}).join("")||"<div class='card small'>尚未實際認識任何固定NPC；人物網絡不會提前揭露未遇見人物。</div>";
    const r=rootState(),events=(r?.events||[]).slice(0,6).map(e=>`<div class="small">${esc(e.time||"")}｜${esc(e.summary)}</div>`).join("")||"<div class='small'>尚無近期人物連鎖事件。</div>";
    if(typeof showModal==="function")showModal("人物網絡",`<div class="card small">此頁只顯示你已實際遇見的固定NPC。直接信任沿用人物誌；這裡的「工作圈評價」來自可追溯的協助、委託與人際傳播，兩者分開計算。</div>${rows}<div class="card"><b>近期人物連鎖</b>${events}</div>`);
  }

  function patchModal(){
    if(globalThis.__NPC_DEPTH2_MODAL_PATCHED||typeof globalThis.showModal!=="function")return;
    const original=globalThis.showModal;
    globalThis.showModal=function(title){const result=original.apply(this,arguments);setTimeout(()=>{
      const t=String(title||"");
      if(t==="人物誌")decorateJournal();
      else if(/・人物誌$/.test(t)){
        const name=t.replace(/・人物誌$/,"");const row=(DB.regional_npc_archetypes||[]).find(x=>x.name===name&&profile(x.id));if(row)decorateNpcProfile(row.id);
      }
    },0);return result};
    globalThis.__NPC_DEPTH2_MODAL_PATCHED=true;
  }

  function patchMoreMenu(){
    if(globalThis.__NPC_DEPTH2_MENU_PATCHED||typeof globalThis.openMoreMenu!=="function")return;
    const original=globalThis.openMoreMenu;
    globalThis.openMoreMenu=function(){const result=original.apply(this,arguments);setTimeout(()=>{const grid=typeof document!=="undefined"?document.querySelector("#modalBody .more-grid"):null;if(grid&&!grid.querySelector("[data-npc-depth2]")){const b=document.createElement("button");b.className="more-card";b.dataset.npcDepth2="1";b.innerHTML='<span class="more-icon">◎</span><span>人物網絡</span>';b.addEventListener("click",()=>openNpcNetwork());grid.appendChild(b)}},0);return result};
    globalThis.__NPC_DEPTH2_MENU_PATCHED=true;
  }

  function recordManualPlayerEvent(type,npcId,summary,delta){
    const r=rootState();if(!r||!npcId)return;
    const key=`MANUAL-${type}-${npcId}-${Math.round(nowHour()*100)}`;
    ingestNpcEvent({id:key,type,data:{npcId},summary},key);
  }

  function patchQuestFailure(){
    if(globalThis.__NPC_DEPTH2_QUEST_FAIL_PATCHED||typeof globalThis.applyQuestPenalty!=="function")return;
    const original=globalThis.applyQuestPenalty;
    globalThis.applyQuestPenalty=function(q,reason){
      const templateId=q?.templateId||q?.template_id||q?.id,patron=DB.npc_quest_patrons?.[templateId]||null,name=q?.name||"委託";
      const result=original.apply(this,arguments);
      if(patron)recordManualPlayerEvent("quest_fail",patron,`${npcName(patron)}記得玩家的「${name}」因${reason||"失敗"}未完成。`,-5);
      return result;
    };
    globalThis.__NPC_DEPTH2_QUEST_FAIL_PATCHED=true;
  }

  function selfCheck(){
    const checks=[];
    checks.push({id:"profiles",pass:profiles().length>=18,value:profiles().length});
    checks.push({id:"stage1_api",pass:typeof globalThis.ensureNpcDepthState==="function"&&typeof globalThis.worldNpcCurrentState==="function"});
    checks.push({id:"relation_edges",pass:Array.isArray(DB.npc_relationship_edges)&&DB.npc_relationship_edges.length>=16,value:DB.npc_relationship_edges?.length||0});
    checks.push({id:"quest_patrons",pass:!!DB.npc_quest_patrons&&Object.keys(DB.npc_quest_patrons).length>=20,value:Object.keys(DB.npc_quest_patrons||{}).length});
    checks.push({id:"version",pass:DB.meta?.npc_depth_revision===REVISION,value:DB.meta?.npc_depth_revision});
    return {revision:REVISION,pass:checks.every(x=>x.pass),checks};
  }

  function initialize(){
    DB.meta.current_version=globalThis.QUNLU_RELEASE_VERSION||DB.meta.current_version||RELEASE;DB.meta.npc_depth_revision=REVISION;
    const g=game();if(!g?.worldState)return false;
    g.meta=g.meta||{};g.meta.version=RELEASE;rootState();for(const p of profiles())ensureNpc2(p.npc_id);
    patchModal();patchMoreMenu();patchQuestFailure();ingestNewEvents();runPropagationCatchup();refreshAgendas();return true;
  }

  function npcDepth2Heartbeat(reason="interval"){
    const g=game();if(!g?.worldState||!g?.character)return false;initialize();
    const r=rootState(),changed=[ingestNewEvents(),runPropagationCatchup(),refreshAgendas()].some(Boolean);
    if(changed&&Date.now()-Number(r.lastPersistMs||0)>=60000&&typeof persist==="function"){r.lastPersistMs=Date.now();try{persist()}catch(e){}}
    return changed;
  }

  globalThis.ensureNpcDepth2State=ensureNpc2;
  globalThis.npcDepth2Heartbeat=npcDepth2Heartbeat;
  globalThis.npcDepth2Availability=availability;
  globalThis.npcDepth2Agenda=currentAgenda;
  globalThis.npcAskIntel=npcAskIntel;
  globalThis.openNpcNetwork=openNpcNetwork;
  globalThis.runNpcDepth2SelfCheck=selfCheck;
  globalThis.NPC_DEPTH2_CONFIG=Object.freeze({...CFG});

  initialize();
  if(typeof document!=="undefined")document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>npcDepth2Heartbeat("visible"),120)});
  if(typeof window!=="undefined")window.addEventListener("focus",()=>setTimeout(()=>npcDepth2Heartbeat("focus"),120));
  setInterval(()=>npcDepth2Heartbeat("interval"),CFG.heartbeat_ms);
  setTimeout(()=>npcDepth2Heartbeat("startup"),180);
})();
