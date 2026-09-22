/* 群陸旅誌：冒險團隊友資料深化 CURRENT-2.08.0
 * ADVENTURE-PARTY-TEAMMATE-DEPTH-1.0
 * 深化既有冒險團隊友，提供穩定人物側寫與可查看的完整資料頁；不改存檔 schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.party_member_templates))return;

const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.08.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.08.0";
const REV="ADVENTURE-PARTY-TEAMMATE-DEPTH-1.0";
const ROLE=Object.freeze({
 frontline:["前排主攻","單手劍、長劍、斧鎚等近戰武器","中甲／重甲","護送、正面突破、近距離警戒","維持正面壓力並持續輸出","高防禦或遠距牽制會降低效率"],
 tank:["前排承傷","盾牌、單手武器、重型兵器","重甲","護衛、守點、危險區域前探","隊伍生命偏低時優先護衛並吸引威脅","直接輸出較低，依賴隊友收尾"],
 healer:["後排治療","法杖、聖器、輕型自衛武器","布甲／輕甲","急救、傷勢判讀、行軍照護","生命低於約68%時優先治療最低生命比例目標","被近戰壓迫時較脆弱"],
 ranged:["後排射手","弓、弩與投射武器","輕甲／中甲","遠距觀察、獵跡、警戒線建立","保持距離並利用命中優勢輸出","狹窄地形與近身戰會壓縮輸出"],
 scout:["側翼機動","匕首、短劍、輕弓","輕甲","偵查、潛行、追蹤、陷阱辨識","以高命中與機動攻擊，高骰值可追加傷害","正面承傷能力有限"],
 caster:["後排施法","法杖、魔導器、法術媒介","布甲／輕甲","魔法辨識、儀式支援、異常現象判讀","以魔法攻擊為主，持續壓制低魔防目標","站位受壓時戰力下降明顯"],
 hybrid:["中排彈性","近戰武器與施法媒介混合","輕甲／中甲","多用途支援、臨場補位、混合威脅處理","比較敵方防禦，在物理與魔法間切換","單一專項通常不如純職能隊友"],
 support:["中後排支援","輕武器、法器、工具","輕甲／中甲","補給整備、士氣維持、臨場支援","主人生命偏低時先支援恢復，再回到攻擊","直接爆發與單挑能力較弱"],
 specialist:["特殊站位","依專長配置的工具與武器","依任務需求配置","情報、機關、特殊環境與任務技能","以專業牽制與任務支援為主要價值","離開專長情境時正面戰力普通"]
});
const PERSONALITY=["沉著寡言","外冷內熱","爽朗直接","謹慎細心","好奇健談","務實克制","自律嚴謹","隨和幽默","警覺敏銳","溫和可靠","競爭心強","耐心觀察"];
const VALUE=["守諾與責任","同伴安全","自由與選擇","技藝精進","知識與真相","公平交易","榮譽與名聲","保護弱者","家族與故鄉","探索未知","務實生存","信念與傳承"];
const HABIT=["守夜前會先整理裝備","休息前會確認撤退路線","會重新分類消耗品","喜歡記錄地形與天氣","常在營火旁保養武器","進城會先打聽補給與治安","會檢查隊伍飲水與乾糧","出發前會重讀委託條件","陌生區域先觀察人流與足跡","會記錄沿途聽到的傳聞"];
const SOCIAL=["先觀察再表態，建立信任後才談私事","重視清楚分工，也能配合臨時變化","偏好直接溝通，不喜歡含糊危險","對新人保持距離，共患難後會迅速熟悉","擅長緩和爭執，但不替別人做決定","習慣用行動證明可靠，少做空泛承諾"];

function clamp(v,a,b){v=Number(v);return Math.max(a,Math.min(b,Number.isFinite(v)?v:a))}
function hash(s){let h=2166136261;for(const ch of String(s||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(a,h,n){return a[(h+n)%a.length]}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function template(id){return typeof partyTemplate==="function"?partyTemplate(id):(DB.party_member_templates||[]).find(x=>x?.id===id)||null}
function members(){return typeof partyMembers==="function"?partyMembers():[]}
function profile(t){
 if(!t)return null;
 if(t.teammate_profile?.revision===REV)return t.teammate_profile;
 const h=hash(t.id||t.name),r=ROLE[t.role]||ROLE.specialist;
 const cls=(t.class_affinity_ids||[]).map(id=>(DB.combat_classes||[]).find(x=>x?.id===id)?.name||id);
 const sub=(t.subjob_affinity_ids||[]).map(id=>(DB.subjobs||[]).find(x=>x?.id===id)?.name||id);
 const goals={
  "軍旅":"尋找紀律穩定、值得長期合作的隊伍","信仰":"在旅途中實踐信念並保護需要幫助的人",
  "魔法學術":"蒐集實地魔法資料並驗證研究","平民／冒險者":"靠可靠冒險收入改善生活並累積名聲",
  "工匠":"尋找稀有材料並精進製作技藝","商旅":"建立跨地區人脈與安全商路",
  "傭兵／漂泊":"擺脫短期雇傭的不確定並尋找可信隊伍","異族／特殊":"追尋與自身背景或特殊能力有關的答案",
  "學術／情報":"把零散情報整理成能改變判斷的知識"
 };
 t.teammate_profile={revision:REV,personality:pick(PERSONALITY,h,3),value:pick(VALUE,h,11),social:pick(SOCIAL,h,17),habit:pick(HABIT,h,29),goal:goals[t.background]||"在冒險中累積經驗、資源與可信任的人脈",position:r[0],weapon:r[1],armor:r[2],field:r[3],priority:r[4],risk:r[5],classes:cls,subjobs:sub};
 return t.teammate_profile
}
for(const t of DB.party_member_templates)profile(t);

function bond(v){
 v=clamp(v,0,100);
 if(v>=90)return ["生死與共","已建立極高默契，願意在危險時互相承擔風險"];
 if(v>=75)return ["戰友","已形成穩定戰鬥默契與明確分工"];
 if(v>=50)return ["信任","願意分享更多判斷並接受臨場調整"];
 if(v>=25)return ["可靠同伴","多次合作後已建立基本信賴"];
 if(v>=10)return ["同行者","正在熟悉彼此習慣與戰鬥節奏"];
 return ["初識","仍以任務合作與基本禮節為主"]
}
function need(lv){lv=Math.max(1,Number(lv||1));return Math.round(45+lv*22+lv*lv*2.2)}
function stats(m){
 if(typeof partyMemberCombatStats==="function")return partyMemberCombatStats(m);
 const t=template(m?.templateId),b=t?.base_stats||{},s=1+(Math.max(1,Number(m?.level||1))-1)*.035,k=1+clamp(m?.bond||0,0,100)/700;
 return {maxHp:Math.round((b.hp||1)*s*k),attack:Math.round((b.attack||0)*s*k),magic:Math.round((b.magic||0)*s*k),defense:Math.round((b.defense||0)*s*k),accuracy:Math.round(b.accuracy||0),evasion:Math.round(b.evasion||0),speed:Math.round(b.speed||0)}
}
function ai(t){return DB.adventure_party_system?.ai_profiles?.[t.role]||profile(t).priority}
function live(uid){return members().find(x=>x?.uid===uid)||null}

function openPartyMemberProfile(uid){
 const m=live(uid),p=typeof adventureParty==="function"?adventureParty():null;if(!m||!p)return openAdventureParty();
 const t=template(m.templateId),d=profile(t),s=stats(m),bs=bond(m.bond),list=members(),i=list.findIndex(x=>x.uid===uid);
 const maxLv=Number(G?.character?.level||m.level),xp=m.level>=maxLv?"主人等級上限":String(Number(m.xp||0))+"/"+need(m.level);
 const classes=d.classes.length?d.classes.join("、"):"依職能配置",subjobs=d.subjobs.length?d.subjobs.join("、"):"無固定副職傾向";
 const turns=Math.max(0,Number(G?.turn||0)-Number(m.joinedTurn||0));
 const bonus=(clamp(m.bond||0,0,100)/7).toFixed(1);
 const html=[
  '<div class="profile-card"><div class="profile-name">'+esc(t.name)+'</div>',
  '<div class="profile-row"><span class="profile-key">種族／背景</span><span class="profile-value">'+esc(t.race)+'｜'+esc(t.background)+'</span></div>',
  '<div class="profile-row"><span class="profile-key">階級／等級</span><span class="profile-value"><span class="tier">'+esc(t.tier)+'</span>｜Lv'+m.level+'</span></div>',
  '<div class="profile-row"><span class="profile-key">定位</span><span class="profile-value">'+esc(t.role_label)+'｜'+esc(d.position)+'</span></div>',
  '<div class="profile-row"><span class="profile-key">加入來源</span><span class="profile-value">'+esc(m.source||"未知")+'</span></div>',
  '<div class="profile-row"><span class="profile-key">同行</span><span class="profile-value">約 '+turns+' 回合</span></div></div>',
  '<div class="card"><b>人物側寫</b><br><span class="small">個性｜'+esc(d.personality)+'<br>重視｜'+esc(d.value)+'<br>相處方式｜'+esc(d.social)+'<br>個人目標｜'+esc(d.goal)+'<br>旅途習慣｜'+esc(d.habit)+'</span></div>',
  '<div class="card"><b>職業與專長</b><br><span class="small">職業傾向｜'+esc(classes)+'<br>副職傾向｜'+esc(subjobs)+'<br>偏好武器｜'+esc(d.weapon)+'<br>偏好護甲｜'+esc(d.armor)+'<br>野外專長｜'+esc(d.field)+'</span></div>',
  '<div class="card"><b>AI戰術資料</b><br><span class="small">行動邏輯｜'+esc(ai(t))+'<br>優先行為｜'+esc(d.priority)+'<br>戰術弱點｜'+esc(d.risk)+'</span></div>',
  '<div class="grid3"><div class="card"><b>HP</b><br>'+Math.round(m.hp)+'/'+Math.round(s.maxHp)+'</div><div class="card"><b>物攻</b><br>'+Math.round(s.attack)+'</div><div class="card"><b>魔攻</b><br>'+Math.round(s.magic)+'</div><div class="card"><b>防禦</b><br>'+Math.round(s.defense)+'</div><div class="card"><b>命中</b><br>'+Math.round(s.accuracy)+'%</div><div class="card"><b>閃避</b><br>'+Math.round(s.evasion)+'%</div><div class="card"><b>速度</b><br>'+Math.round(s.speed)+'</div><div class="card"><b>XP</b><br>'+esc(xp)+'</div><div class="card"><b>羈絆</b><br>'+Number(m.bond||0).toFixed(1)+'%</div></div>',
  '<div class="card"><b>關係｜'+esc(bs[0])+'</b><br><span class="small">'+esc(bs[1])+'<br>現行羈絆公式約提供 +'+bonus+'% 的生命、攻擊、魔法與防禦成長倍率；隊友等級不高於主人。</span></div>'
 ];
 const prev=list[(i-1+list.length)%list.length],next=list[(i+1)%list.length];
 html.push('<div class="actions"><button onclick="openAdventureParty()">返回冒險團</button>'+(list.length>1?'<button onclick="openPartyMemberProfile(\''+esc(prev.uid)+'\')">上一位</button><button onclick="openPartyMemberProfile(\''+esc(next.uid)+'\')">下一位</button>':'')+'</div>');
 showModal("隊友資料・"+t.name,html.join(""))
}

function openPartyCandidateProfile(id,place){
 const t=template(id);if(!t)return;
 const d=profile(t),b=t.base_stats||{},classes=d.classes.length?d.classes.join("、"):"依職能配置",subjobs=d.subjobs.length?d.subjobs.join("、"):"無固定副職傾向";
 const html='<div class="profile-card"><div class="profile-name">'+esc(t.name)+'</div><div class="profile-row"><span class="profile-key">種族／背景</span><span class="profile-value">'+esc(t.race)+'｜'+esc(t.background)+'</span></div><div class="profile-row"><span class="profile-key">階級／定位</span><span class="profile-value"><span class="tier">'+esc(t.tier)+'</span>｜'+esc(t.role_label)+'</span></div><div class="profile-row"><span class="profile-key">最低等級</span><span class="profile-value">Lv'+Number(t.min_player_level||1)+'</span></div></div><div class="card"><b>人物側寫</b><br><span class="small">'+esc(d.personality)+'｜重視'+esc(d.value)+'<br>'+esc(d.social)+'<br>目標｜'+esc(d.goal)+'</span></div><div class="card"><b>職業與戰術</b><br><span class="small">職業傾向｜'+esc(classes)+'<br>副職傾向｜'+esc(subjobs)+'<br>武器｜'+esc(d.weapon)+'<br>護甲｜'+esc(d.armor)+'<br>野外專長｜'+esc(d.field)+'<br>AI｜'+esc(ai(t))+'<br>優先行為｜'+esc(d.priority)+'<br>弱點｜'+esc(d.risk)+'</span></div><div class="grid3"><div class="card"><b>基礎HP</b><br>'+Math.round(b.hp||0)+'</div><div class="card"><b>基礎物攻</b><br>'+Math.round(b.attack||0)+'</div><div class="card"><b>基礎魔攻</b><br>'+Math.round(b.magic||0)+'</div><div class="card"><b>基礎防禦</b><br>'+Math.round(b.defense||0)+'</div><div class="card"><b>基礎命中</b><br>'+Math.round(b.accuracy||0)+'%</div><div class="card"><b>基礎閃避</b><br>'+Math.round(b.evasion||0)+'%</div></div><div class="actions"><button onclick="openRecruitTeammates(\''+esc(place||"guild")+'\')">返回招募</button></div>';
 showModal("招募資料・"+t.name,html)
}

const baseParty=typeof openAdventureParty==="function"?openAdventureParty:null;
if(baseParty){
 openAdventureParty=function(){
  try{
   const p=adventureParty();
   if(!p)return showModal("冒險團",'<div class="card"><b>目前沒有正式冒險團</b><br><span class="small">前往冒險者公會或酒館招募至少1名隊友。招募候選可先查看完整資料。</span></div>');
   const rows=members().map(m=>{const t=template(m.templateId),d=profile(t),bs=bond(m.bond),leader=p.leader===m.uid?" <span class=\'tier\'>領隊</span>":"";return '<div class="card"><b>'+esc(t.name)+'</b> <span class="tier">'+esc(t.tier)+'</span>［'+esc(t.race)+'／'+esc(t.role_label)+'］'+leader+'<br><span class="small">Lv'+m.level+'｜HP '+Math.round(m.hp)+'/'+Math.round(m.maxHp)+'｜羈絆 '+Number(m.bond||0).toFixed(1)+'%・'+esc(bs[0])+'<br>'+esc(d.personality)+'｜'+esc(d.position)+'｜'+esc(d.field)+'</span><div class="actions"><button class="good" onclick="openPartyMemberProfile(\''+esc(m.uid)+'\')">查看資料</button>'+(p.mode==="self-led"?'<button class="bad" onclick="dismissPartyMember(\''+esc(m.uid)+'\')">請其離隊</button>':'')+'</div></div>'}).join("");
   const leader=p.mode==="self-led"?"你是領隊":"領隊："+partyLeaderName();
   showModal("冒險團",'<div class="card"><b>'+esc(p.name)+'</b><br>'+esc(leader)+'｜編制 '+(1+members().length)+'/5<br><span class="small">每名NPC隊友都有獨立等級、XP、HP、羈絆與AI。點「查看資料」可看人物側寫、專長、戰術邏輯與即時數值。</span></div>'+rows+'<div class="actions"><button class="bad" onclick="leaveAdventureParty()">離開／解散冒險團</button></div>');
  }catch(error){console.warn("adventure party teammate depth fallback",error);return baseParty.apply(this,arguments)}
 };
 globalThis.openAdventureParty=openAdventureParty
}

function decorateRecruit(place){
 const list=G?.recruitOfferCache?.[place]?.list,body=document.getElementById("modalBody");if(!Array.isArray(list)||!body)return;
 const cards=[...body.querySelectorAll(".card")];
 for(const t of list){
  const card=cards.find(x=>String(x.querySelector("b")?.textContent||"").trim()===String(t.name||"").trim()),actions=card?.querySelector(".actions");
  if(!actions||actions.querySelector("[data-teammate-profile]"))continue;
  const btn=document.createElement("button");btn.type="button";btn.textContent="查看資料";btn.dataset.teammateProfile=t.id;btn.addEventListener("click",()=>openPartyCandidateProfile(t.id,place));actions.prepend(btn)
 }
}
const baseRecruit=typeof openRecruitTeammates==="function"?openRecruitTeammates:null;
if(baseRecruit){
 openRecruitTeammates=function(place="guild"){const out=baseRecruit.apply(this,arguments);try{decorateRecruit(place)}catch(error){console.warn("recruit teammate profile decorate failed",error)}return out};
 globalThis.openRecruitTeammates=openRecruitTeammates
}

function audit(){
 const issues=[],valid=new Set(Object.keys(ROLE));
 for(const t of DB.party_member_templates){const p=profile(t);if(!t?.id||!t?.name)issues.push("隊友模板識別缺失");if(!valid.has(t?.role))issues.push("隊友角色定位未覆蓋:"+(t?.name||t?.id)+"/"+t?.role);if(!p?.personality||!p?.goal||!p?.priority||!p?.field)issues.push("隊友深化資料不完整:"+(t?.name||t?.id))}
 try{for(const m of members()){if(!template(m?.templateId))issues.push("現行冒險團隊友模板遺失:"+m?.templateId);if(!m?.uid)issues.push("現行冒險團隊友UID缺失")}}catch(error){issues.push("冒險團現況稽核失敗")}
 return {version:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],template_count:DB.party_member_templates.length,profile_view:true,save_schema_changed:false}
}

DB.adventure_party_teammate_depth_system={version:REV,release:RELEASE,template_count:DB.party_member_templates.length,profile_sections:["基本資料","人物側寫","職業與專長","AI戰術資料","即時戰鬥數值","羈絆與成長"],save_schema_changed:false};
DB.meta=DB.meta||{};
DB.meta.adventure_party_teammate_depth_revision=REV;
if(DB.integration_registry?.optimization_notes)DB.integration_registry.optimization_notes.push("CURRENT-2.08.0／ADVENTURE-PARTY-TEAMMATE-DEPTH-1.0：冒險團隊友新增穩定人物側寫、職業／副職傾向、偏好裝備、野外專長、AI戰術與完整資料頁；已入隊與招募候選都能查看資料，不改存檔schema。");
globalThis.openPartyMemberProfile=openPartyMemberProfile;
globalThis.openPartyCandidateProfile=openPartyCandidateProfile;
globalThis.runAdventurePartyTeammateDepthAudit=audit;
globalThis.QUNLU_ADVENTURE_PARTY_TEAMMATE_DEPTH={version:REV,release:RELEASE,audit,profile,bond};
CORE?.registerModule?.("src/adventure-party-teammate-depth-v1.js",{domain:"survival",revision:REV,release:RELEASE});
})();