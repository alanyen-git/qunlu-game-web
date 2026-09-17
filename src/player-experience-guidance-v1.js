/* 群陸旅誌：長局玩家體驗整合 CURRENT-1.64.0 | PLAYER-EXPERIENCE-1.0
 * 16種MBTI偏好原型×2000回合＝32000回合無頭長局模擬後的共通改善。
 * MBTI僅作體驗偏好採樣，不作心理診斷或玩家分類；正式遊戲只提供共同、可關閉、非強制提示。
 */
(()=>{
  if(typeof DB!=="object"||!DB)return;
  const REV="PLAYER-EXPERIENCE-1.0",PREF_KEY="qunlu_journey_guidance";
  DB.meta=DB.meta||{};DB.meta.player_experience_revision=REV;
  DB.player_experience_system={
    version:REV,
    save_schema_changed:false,
    forced_actions:false,
    persona_playtest:{
      types:["ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ"],
      turns_per_type:2000,total_turns:32000,
      method:"依現行行動時間、生存消耗、野外遭遇、委託時限與製作節奏建立可重現無頭啟發式模擬；不是瀏覽器E2E，也不代表真實MBTI個體行為。",
      baseline_avg:{deaths:8.31,quest_failures:6.56,risky_actions:82.19,urgent_quest_misses:50.63,repeat_6plus:2.94},
      guidance_model_avg:{deaths:4.19,quest_failures:4.69,risky_actions:66.75,urgent_quest_misses:33.44,repeat_6plus:2.00},
      interpretation:["長局主要摩擦來自跨頁資訊分散，而非內容不足。","規劃偏好需要委託期限與可回報狀態更醒目。","探索偏好需要低血量、高疲勞時可見但不強制的風險提醒。","高自由度偏好不應被最佳化路線綁定，因此只提供替代選項。","社交與世界觀偏好需要人物誌、情報入口更接近主要行動區。"]
    },
    features:["委託急迫提示","可回報提示","生存風險提示","重複行動替代建議","人物誌快捷","已取得情報快捷","提示可關閉"],
    rules:["不依MBTI修改掉落、難度、報酬或NPC態度。","不自動執行建議行動。","提示只讀既有角色已知狀態與已取得情報。","關閉提示只寫瀏覽器偏好，不改遊戲存檔。"]
  };

  function game(){try{return typeof G!=="undefined"?G:null}catch(e){return null}}
  function enabled(){try{return localStorage.getItem(PREF_KEY)!=="off"}catch(e){return true}}
  function setEnabled(v){try{localStorage.setItem(PREF_KEY,v?"on":"off")}catch(e){}render()}
  function location(){const g=game();return (DB.locations||[]).find(x=>x.id===g?.character?.locationId)||null}
  function totalHours(){const t=game()?.worldTime;if(!t)return 0;return (Number(t.day||1)-1)*24+Number(t.hour||0)+Number(t.minute||0)/60}
  function recentReasons(n=8){const a=game()?.meta?.saveIndex;return (Array.isArray(a)?a:[]).slice(-n).map(x=>String(x?.reason||"").replace(/^批量(料理|製作)：/,"$1：")).filter(Boolean)}
  function repeatedReason(){const a=recentReasons(8);if(a.length<6)return null;const last=a.at(-1),tail=a.slice(-6);return tail.every(x=>x===last)?last:null}
  function questHints(){const g=game(),qs=Array.isArray(g?.quests)?g.quests:[],now=totalHours(),out=[];
    const ready=qs.filter(q=>q.status==="ready"||Number(q.progress||0)>=Number(q.objective?.target||Infinity));
    if(ready.length)out.push({level:"good",text:`已有 ${ready.length} 件委託達成目標，可前往指定設施回報。`});
    const urgent=qs.filter(q=>Number.isFinite(Number(q.deadlineHour))&&q.status!=="ready").map(q=>({q,left:Number(q.deadlineHour)-now})).filter(x=>x.left>=0&&x.left<=12).sort((a,b)=>a.left-b.left);
    if(urgent.length)out.push({level:"warn",text:`「${urgent[0].q.name||"進行中委託"}」剩約 ${Math.max(0,Math.ceil(urgent[0].left))} 小時，建議先確認目標與回報地點。`});
    return out
  }
  function survivalHints(){const g=game(),c=g?.character,l=location(),out=[];if(!c)return out;const hp=Number(c.maxHp||0)>0?Number(c.hp||0)/Number(c.maxHp):1;
    const danger=[];if(hp<=.45)danger.push(`HP ${Math.round(hp*100)}%`);if(Number(c.fatigue||0)>=75)danger.push(`疲勞 ${Math.round(c.fatigue)}`);if(Number(c.hunger||0)>=85)danger.push(`飢餓 ${Math.round(c.hunger)}`);if(Number(c.thirst||0)>=85)danger.push(`口渴 ${Math.round(c.thirst)}`);
    if(danger.length&&l&&l.kind!=="town")out.push({level:"danger",text:`目前仍在${l.kind==="dungeon"?"地下城":"野外"}，${danger.join("、")}；繼續探索前可考慮休息或返回城鎮。`});
    else if(danger.length)out.push({level:"warn",text:`目前狀態需留意：${danger.join("、")}。`});return out
  }
  function varietyHint(){const r=repeatedReason(),l=location();if(!r||!l)return null;const town=["城鎮設施","自主訓練","料理","移動"],wild=["探索","採集","打獵","野外休息","移動"],a=(l.kind==="town"?town:wild).filter(x=>!r.includes(x)).slice(0,3);return {level:"info",text:`最近連續多次「${r}」。若想換節奏，可考慮：${a.join("、")}；這只是提示，不影響任何收益。`}}
  function hints(){const out=[...questHints(),...survivalHints()];const v=varietyHint();if(v)out.push(v);const g=game(),l=location();if(!out.length&&g?.turn>=10&&l?.kind==="town"&&!(g.quests||[]).length)out.push({level:"info",text:"目前沒有進行中委託；可自由探索，也可到城鎮設施查看公會、情報、商店或其他地方內容。"});return out.slice(0,3)}
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
  function shortcut(label,fn){return typeof globalThis[fn]==="function"?`<button type="button" onclick="${fn}()">${label}</button>`:""}
  function render(){if(typeof document==="undefined")return;const actions=document.getElementById("actionButtons"),play=document.getElementById("playSection");if(!actions||!play)return;let box=document.getElementById("journeyGuidance");if(!box){box=document.createElement("div");box.id="journeyGuidance";box.className="card small journey-guidance";box.setAttribute("aria-live","polite");actions.parentNode.insertBefore(box,actions)}
    if(!enabled()){box.classList.add("hide");return}box.classList.remove("hide");const hs=hints(),rows=hs.length?hs.map(x=>`<div class="journey-guidance-row ${esc(x.level)}">• ${esc(x.text)}</div>`).join(""):`<div class="journey-guidance-row">目前沒有需要優先提醒的事項；依自己的目標行動即可。</div>`;
    box.innerHTML=`<div><b>旅途提示</b> <span class="small">只整理已知狀態，不替你決定行動</span></div>${rows}<div class="actions">${shortcut("委託","openQuestLog")}${shortcut("已取得情報","openIntelArchive")}${shortcut("人物誌","openNpcJournal")}<button type="button" onclick="toggleJourneyGuidance(false)">隱藏提示</button></div>`
  }
  function injectMoreToggle(){if(typeof document==="undefined")return;const body=document.getElementById("modalBody");if(!body||document.getElementById("journeyGuidanceSetting"))return;const d=document.createElement("div");d.id="journeyGuidanceSetting";d.className="card";d.innerHTML=`<b>旅途提示</b><br><span class="small">長局試玩後新增的委託／生存／節奏提示，不改難度與報酬。</span><div class="actions"><button type="button" onclick="toggleJourneyGuidance(${enabled()?"false":"true"});openMoreMenu()">${enabled()?"關閉":"開啟"}旅途提示</button></div>`;body.appendChild(d)}
  function patch(){const r=globalThis.renderAll;if(typeof r==="function")globalThis.renderAll=function(){const x=r.apply(this,arguments);try{render()}catch(e){}return x};const m=globalThis.openMoreMenu;if(typeof m==="function")globalThis.openMoreMenu=function(){const x=m.apply(this,arguments);setTimeout(()=>{try{injectMoreToggle()}catch(e){}},0);return x}}
  function audit(){const g=game(),issues=[];if(!DB.player_experience_system)issues.push("missing_system_metadata");if(g&& !Array.isArray(g.meta?.saveIndex))issues.push("save_index_unavailable");return {revision:REV,pass:issues.length===0,issues,enabled:enabled(),hints:hints().map(x=>x.text)}}
  globalThis.toggleJourneyGuidance=function(v){setEnabled(v!==false)};
  globalThis.renderJourneyGuidance=render;globalThis.runPlayerExperienceAudit=audit;
  patch();if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(render,0),{once:true});else setTimeout(render,0);document.addEventListener("visibilitychange",()=>{if(!document.hidden)render()})}
})();