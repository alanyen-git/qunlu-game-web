/* 群陸旅誌：組織／流派劇情接觸與入門考核 CURRENT-1.85.0
 * AFFILIATION-ENTRY-GATE-1.0
 * 高階勢力由「知道名稱」與「正式接觸」分離；劇情／委託／奇遇／情報累積接觸證據，通過考核後才能加入。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.85.0";
const REV="AFFILIATION-ENTRY-GATE-1.0";
const TIER_RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const GATE=Object.freeze({
 F:{evidence:0,exam:false,dc:0,cooldown:0,hours:0},
 E:{evidence:0,exam:true,dc:9,cooldown:1,hours:.5},
 D:{evidence:1,exam:true,dc:11,cooldown:1,hours:.75},
 C:{evidence:2,exam:true,dc:13,cooldown:2,hours:1},
 B:{evidence:3,exam:true,dc:15,cooldown:2,hours:1.25},
 A:{evidence:4,exam:true,dc:17,cooldown:3,hours:1.5},
 S:{evidence:5,exam:true,dc:19,cooldown:3,hours:2}
});
const EVIDENCE_LABEL=Object.freeze({story:"劇情",quest:"委託",encounter:"奇遇",intel:"情報",referral:"引介／對話",exploration:"調查／探索",event:"世界事件"});
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const day=()=>Number(globalThis.G?.worldTime?.day||1);
const turn=()=>Number(globalThis.G?.turn||0);
const validTier=t=>Object.prototype.hasOwnProperty.call(TIER_RANK,String(t||""));

function org(id){return typeof globalThis.worldOrg==="function"?globalThis.worldOrg(id):(DB.world_organizations||[]).find(x=>x?.id===id)||null}
function disc(id){return typeof globalThis.disciplineFor==="function"?globalThis.disciplineFor(id):(DB.discipline_factions||[]).find(x=>x?.id===id)||null}
function aff(type,id){return type==="organization"?org(id):disc(id)}
function tierFromLevel(level){const n=Number(level||1);return n>=80?"S":n>=65?"A":n>=50?"B":n>=35?"C":n>=20?"D":n>=8?"E":"F"}
function accessTier(type,a){
 if(!a)return "F";
 const explicit=[a.entry_tier,a.access_tier,a.membership_tier,a.tier].find(validTier);
 if(explicit)return String(explicit);
 if(type==="discipline"&&validTier(a.training_tier_ceiling))return String(a.training_tier_ceiling);
 return tierFromLevel(type==="organization"?(a.min_join_level||a.min_level):(a.min_level||1));
}
function profile(type,a){
 const tier=accessTier(type,a),rule=GATE[tier]||GATE.F;
 return {type,id:a?.id||null,tier,evidence_required:rule.evidence,exam_required:rule.exam,exam_dc:rule.dc,reattempt_days:rule.cooldown,exam_hours:rule.hours,narrative_required:rule.evidence>0};
}
function sourceKind(source){
 const s=String(source||"");
 if(/劇情|主線|支線|story|narrative/i.test(s))return "story";
 if(/委託|契約|任務|quest|commission|contract/i.test(s))return "quest";
 if(/奇遇|遭遇|encounter|adventure/i.test(s))return "encounter";
 if(/情報|線索|intel|rumou?r|傳聞/i.test(s))return "intel";
 if(/引介|介紹|對話|推薦|referral|dialogue/i.test(s))return "referral";
 if(/調查|探索|investigat|explor/i.test(s))return "exploration";
 if(/世界事件|事件鏈|world.?event/i.test(s))return "event";
 return null;
}
function root(){
 const c=globalThis.G?.character;if(!c)return null;
 c.affiliationEntry=c.affiliationEntry&&typeof c.affiliationEntry==="object"?c.affiliationEntry:{};
 const r=c.affiliationEntry;r.version=REV;r.organization=r.organization&&typeof r.organization==="object"?r.organization:{};r.discipline=r.discipline&&typeof r.discipline==="object"?r.discipline:{};
 migrate(r,c);return r;
}
function blankState(){return {evidence:[],contactUnlocked:false,contactUnlockedBy:null,exam:{status:"pending",attempts:0,lastAttemptDay:null,nextAttemptDay:0,passedDay:null,passedTurn:null}}}
function normalizeState(s){
 s=s&&typeof s==="object"?s:blankState();
 s.evidence=Array.isArray(s.evidence)?s.evidence.slice(-12):[];
 s.contactUnlocked=!!s.contactUnlocked;s.contactUnlockedBy=s.contactUnlockedBy||null;
 s.exam=s.exam&&typeof s.exam==="object"?s.exam:{};
 s.exam.status=s.exam.status==="passed"?"passed":"pending";
 s.exam.attempts=Math.max(0,Math.floor(Number(s.exam.attempts)||0));
 s.exam.nextAttemptDay=Math.max(0,Math.floor(Number(s.exam.nextAttemptDay)||0));
 return s;
}
function migrate(r,c){
 if(r.migration===REV)return;
 const orgKnown=new Set(c.organizations?.discovered||[]),orgMember=c.organizations?.membershipId||null;
 const discKnown=new Set(c.disciplines?.discovered||[]),discMember=c.disciplines?.membershipId||null;
 for(const [type,rows,known,member] of [["organization",DB.world_organizations||[],orgKnown,orgMember],["discipline",DB.discipline_factions||[],discKnown,discMember]]){
  for(const a of rows){
   if(!a?.id)continue;const p=profile(type,a);if(TIER_RANK[p.tier]<1)continue;
   const bucket=r[type],s=normalizeState(bucket[a.id]);bucket[a.id]=s;
   if(known.has(a.id)||member===a.id){s.contactUnlocked=true;s.contactUnlockedBy=s.contactUnlockedBy||"legacy_discovery"}
   if(member===a.id){s.exam.status="passed";s.exam.passedDay=s.exam.passedDay??day();s.exam.passedTurn=s.exam.passedTurn??turn()}
  }
 }
 r.migration=REV;r.migratedAtTurn=turn();
}
function state(type,id){
 const a=aff(type,id),r=root();if(!a||!r)return null;
 const bucket=r[type],s=normalizeState(bucket[a.id]);bucket[a.id]=s;return s;
}
function evidenceContextKey(type,id,kind,label){
 const facility=String(globalThis.G?.character?.currentFacility||"none"),loc=String(globalThis.G?.character?.locationId||"none");
 return `${kind}:${type}:${id}:D${day()}:T${turn()}:${facility}:${loc}:${String(label||"").slice(0,36)}`;
}
function evidenceReady(type,id){
 const a=aff(type,id),p=profile(type,a),s=state(type,id);if(!a||!s)return false;
 return s.evidence.length>=p.evidence_required;
}
function unlockContact(type,id,why="劇情性接觸"){
 const a=aff(type,id),s=state(type,id);if(!a||!s||s.contactUnlocked)return false;
 const p=profile(type,a);if(s.evidence.length<p.evidence_required)return false;
 s.contactUnlocked=true;s.contactUnlockedBy=why;
 if(type==="organization"&&typeof RAW.discoverOrganization==="function")RAW.discoverOrganization(a.id);
 if(type==="discipline"&&typeof RAW.discoverDiscipline==="function")RAW.discoverDiscipline(a.id,why);
 try{globalThis.discoverScopeLore?.(type,a.id,why)}catch(e){}
 try{globalThis.persist?.()}catch(e){}
 try{globalThis.log?.(type==="organization"?"組織接觸":"流派接觸",`你已取得「${a.name}」的正式接觸資格；仍需符合基本條件並通過${p.tier}級入門考核才能加入。`,"ok")}catch(e){}
 return true;
}
function noteEvidence(type,id,{kind=null,key=null,label=null,source=null}={}){
 const a=aff(type,id);if(!a)return false;const p=profile(type,a);if(p.evidence_required<=0)return false;
 const s=state(type,a.id);if(!s||s.contactUnlocked)return false;
 const k=kind||sourceKind(source);if(!k)return false;
 const evidenceKey=String(key||evidenceContextKey(type,a.id,k,label||source||k));
 if(s.evidence.some(x=>x?.key===evidenceKey))return false;
 s.evidence.push({key:evidenceKey,kind:k,label:String(label||source||EVIDENCE_LABEL[k]||k).slice(0,90),turn:turn(),day:day()});
 if(s.evidence.length>12)s.evidence=s.evidence.slice(-12);
 try{globalThis.log?.("接觸線索",`${a.name}：取得${EVIDENCE_LABEL[k]||k}線索（${Math.min(s.evidence.length,p.evidence_required)}/${p.evidence_required}）。`,"ok")}catch(e){}
 if(evidenceReady(type,a.id))unlockContact(type,a.id,`${EVIDENCE_LABEL[k]||k}累積`);
 try{globalThis.persist?.()}catch(e){}
 return true;
}
function hasContact(type,id){
 const a=aff(type,id);if(!a)return false;const p=profile(type,a);if(p.evidence_required<=0)return true;
 const s=state(type,a.id);return !!s?.contactUnlocked;
}
function examPassed(type,id){
 const a=aff(type,id);if(!a)return false;const p=profile(type,a);if(!p.exam_required)return true;
 return state(type,a.id)?.exam?.status==="passed";
}
function memberId(type){
 if(type==="organization")return globalThis.G?.character?.organizations?.membershipId||null;
 return globalThis.G?.character?.disciplines?.membershipId||null;
}
function basicExamReason(type,a){
 if(!globalThis.G?.character)return "尚未進入遊戲";
 if(!hasContact(type,a.id))return "尚未取得正式接觸";
 const active=memberId(type);if(active&&active!==a.id)return `需先退出${aff(type,active)?.name||"目前勢力"}`;
 if(type==="organization"){
  if(a.joinable===false)return "不可加入";
  if((G.character.level||1)<Number(a.min_join_level||1))return `需要Lv${a.min_join_level||1}`;
  const rep=Number(G.character.organizations?.reputation?.[a.id]||0),need=Number(a.join_reputation||0);if(rep<need)return `需要組織聲望${need}`;
  if(a.primary_facility&&G.character.currentFacility!==a.primary_facility)return `需在${DB.facilities?.[a.primary_facility]?.name||a.primary_facility}接受考核`;
 }else{
  const s=G.character.disciplines||{};
  if((G.character.level||1)<Number(a.min_level||1))return `需要Lv${a.min_level||1}`;
  if(a.primary_facility&&G.character.currentFacility!==a.primary_facility)return `需在${DB.facilities?.[a.primary_facility]?.name||a.primary_facility}接受考核`;
  if(Array.isArray(a.contact_location_ids)&&a.contact_location_ids.length&&!a.contact_location_ids.includes(G.character.locationId))return "目前所在地沒有正式接觸點";
  if(typeof globalThis.disciplineClassCompatible==="function"&&!globalThis.disciplineClassCompatible(a))return "目前戰鬥職業與此流派訓練方向不相容";
  const need=Number(DB.discipline_bonus_system?.minimum_mastery_to_join||10),m=Number(s.mastery?.[a.id]||0);if(m<need)return `基礎研習需達${need}%`;
 }
 return "";
}
function examModifier(type,a){
 const c=G.character,min=Number(type==="organization"?(a.min_join_level||1):(a.min_level||1));
 let mod=clamp(Math.floor(((c.level||1)-min)/8),-2,4);
 if(type==="organization"){
  mod+=clamp(Math.floor(Number(c.organizations?.reputation?.[a.id]||0)/20),-2,3);
  mod+=clamp(Math.floor(Number(c.guildReputation||0)/30),0,2);
 }else{
  mod+=clamp(Math.floor(Number(c.disciplines?.mastery?.[a.id]||0)/20),0,4);
  mod+=clamp(Math.floor(Number(c.disciplines?.reputation?.[a.id]||0)/25),-2,3);
 }
 return clamp(mod,-3,7);
}
function examStatusText(type,a){
 const p=profile(type,a),s=state(type,a.id);if(!p.exam_required)return "無需額外考核";
 if(s?.exam?.status==="passed")return "已通過";
 if(Number(s?.exam?.nextAttemptDay||0)>day())return `未通過；第${s.exam.nextAttemptDay}日後可再考`;
 return "尚未通過";
}
function entranceExam(type,id){
 const a=aff(type,id);if(!a)return;const p=profile(type,a),s=state(type,a.id);if(!p.exam_required){return type==="organization"?globalThis.attemptJoinOrganization?.(id):globalThis.joinDiscipline?.(id)}
 if(s.exam.status==="passed"){alert("入門考核已通過，可直接辦理正式加入。");return}
 const reason=basicExamReason(type,a);if(reason){alert(reason);return}
 if(Number(s.exam.nextAttemptDay||0)>day()){alert(`考核冷卻中，第${s.exam.nextAttemptDay}日後可再次挑戰。`);return}
 try{globalThis.closeModal?.()}catch(e){}
 if(typeof globalThis.beginTurn==="function"&&!globalThis.beginTurn(`${a.name}入門考核`))return;
 const roll=typeof globalThis.rollD20==="function"?globalThis.rollD20():1+Math.floor(Math.random()*20),mod=examModifier(type,a),total=roll+mod,pass=total>=p.exam_dc;
 s.exam.attempts=(s.exam.attempts||0)+1;s.exam.lastAttemptDay=day();
 if(pass){
  s.exam.status="passed";s.exam.passedDay=day();s.exam.passedTurn=turn();s.exam.nextAttemptDay=0;
  try{globalThis.log?.("入門考核",`${a.name}［${p.tier}］：D20 ${roll}${mod>=0?"+":""}${mod}=${total}，達成DC${p.exam_dc}，考核通過。現在可以正式加入。`,"ok")}catch(e){}
 }else{
  s.exam.status="pending";s.exam.nextAttemptDay=day()+p.reattempt_days;
  try{globalThis.log?.("入門考核",`${a.name}［${p.tier}］：D20 ${roll}${mod>=0?"+":""}${mod}=${total}，未達DC${p.exam_dc}；第${s.exam.nextAttemptDay}日後可再考。`)}catch(e){}
 }
 if(typeof globalThis.endTurn==="function")globalThis.endTurn(p.exam_hours||.5);else{try{globalThis.persist?.()}catch(e){}}
 if(type==="organization")globalThis.openOrganization?.(a.id);else globalThis.openDiscipline?.(a.id);
}
function directJoinOrganization(a){
 if(a.joinable===false){alert("不可加入");return}
 const c=G.character,s=c.organizations||(c.organizations={membershipId:null,memberships:[],formerMemberships:[],reputation:{},discovered:[]});
 if(s.membershipId&&s.membershipId!==a.id){alert(`需先退出${org(s.membershipId)?.name||"目前組織"}`);return}
 if((c.level||1)<Number(a.min_join_level||1)){alert(`需要Lv${a.min_join_level||1}`);return}
 const rep=Number(s.reputation?.[a.id]||0),need=Number(a.join_reputation||0);if(rep<need){alert(`需要組織聲望${need}`);return}
 s.reputation=s.reputation||{};s.membershipId=a.id;s.memberships=[a.id];s.reputation[a.id]=clamp(rep+5,-100,100);
 if(!s.discovered?.includes(a.id)){s.discovered=Array.isArray(s.discovered)?s.discovered:[];s.discovered.push(a.id)}
 try{globalThis.discoverScopeLore?.("organization",a.id,"通過考核加入組織")}catch(e){}
 try{globalThis.persist?.()}catch(e){}
 try{globalThis.log?.("組織",`你通過入門考核並正式加入${a.name}，啟用「${a.member_bonus?.name||"組織加成"}」：${typeof globalThis.affiliationBonusText==="function"?globalThis.affiliationBonusText(a.member_bonus):(a.member_bonus?.text||"生效")}。`,"ok")}catch(e){}
 globalThis.openOrganization?.(a.id);
}
function attemptJoin(type,id){
 const a=aff(type,id);if(!a)return;const p=profile(type,a);
 if(TIER_RANK[p.tier]===0)return type==="organization"?RAW.attemptJoinOrganization?.apply(this,[id]):RAW.joinDiscipline?.apply(this,[id]);
 if(!hasContact(type,a.id)){alert(`尚未取得${a.name}的正式接觸；需透過劇情、委託、奇遇、可靠情報或引介累積線索。`);return}
 if(!examPassed(type,a.id)){alert(`需先通過${p.tier}級入門考核（DC${p.exam_dc}）。`);return}
 if(type==="organization")return directJoinOrganization(a);
 return RAW.joinDiscipline?.apply(this,[id]);
}
function evidenceListHtml(s,p){
 if(p.evidence_required<=0)return "不要求劇情性接觸線索。";
 const rows=(s?.evidence||[]).slice(-p.evidence_required).map(x=>`${EVIDENCE_LABEL[x.kind]||x.kind}：${esc(x.label)}`);
 return rows.length?rows.map(x=>`• ${x}`).join("<br>"):"尚未取得有效線索。";
}
function teaser(type,a){
 const p=profile(type,a),s=state(type,a.id),n=Math.min(s?.evidence?.length||0,p.evidence_required),kind=type==="organization"?"組織":"流派";
 const publicKnown=type==="organization"?(a.visibility==="public"&&a.legal_status==="legal"):(a.discovery!=="hidden_restricted");
 if(!publicKnown&&!n){alert(`你目前只有模糊傳聞，尚無可靠來源能確認這個${kind}。`);return}
 const generic=a.signature||a.specialty||a.description||"只有零碎傳聞，尚未取得正式引介。";
 globalThis.showModal?.(`${a.name}・接觸線索`,`<div class="card"><b>${esc(a.name)}</b> <span class="tier">${p.tier}</span><br><span class="small">${esc(generic)}</span></div><div class="card"><b>正式接觸進度 ${n}/${p.evidence_required}</b><br><span class="small">${evidenceListHtml(s,p)}<br><br>高階${kind}不因查閱名錄就視為已建立聯絡。需要從相關劇情、完成委託、奇遇、可靠情報、調查或可信引介中累積實際關係。</span></div><div class="card small">取得正式接觸後，還需符合角色等級／聲望／研習等基本條件，並通過${p.tier}級入門考核（DC${p.exam_dc}）才能加入。</div>`);
}
function gateCard(type,a){
 const p=profile(type,a);if(TIER_RANK[p.tier]===0)return "";const s=state(type,a.id),n=Math.min(s.evidence.length,p.evidence_required),reason=basicExamReason(type,a),cool=Number(s.exam.nextAttemptDay||0)>day(),passed=examPassed(type,a.id);
 const btn=passed?"<span class='ok'><b>入門考核已通過</b></span>":`<button ${reason||cool?"disabled":""} onclick="takeAffiliationEntranceExam('${type}','${esc(a.id)}')">${cool?`第${s.exam.nextAttemptDay}日後可再考`:reason?esc(reason):`參加入門考核・DC${p.exam_dc}`}</button>`;
 return `<div class="card" data-affiliation-entry-gate="1"><b>${p.tier}級接觸／加入門檻</b><br><span class="small">正式接觸：${p.evidence_required?`${n}/${p.evidence_required} 筆劇情性線索`:"公開接觸"}｜考核：${examStatusText(type,a)}<br>${p.evidence_required?evidenceListHtml(s,p)+"<br>":""}考核修正會參考角色資格，以及${type==="organization"?"組織聲望／公會信用":"流派研習度／流派聲望"}。</span><div class="actions">${btn}</div></div>`;
}
function patchJoinButton(type,a){
 const body=typeof document!=="undefined"?document.getElementById("modalBody"):null;if(!body)return;
 const needle=type==="organization"?`attemptJoinOrganization('${a.id}')`:`joinDiscipline('${a.id}')`;
 for(const b of body.querySelectorAll("button")){
  if(!String(b.getAttribute("onclick")||"").includes(needle))continue;
  const p=profile(type,a);
  if(!examPassed(type,a.id)){b.disabled=true;b.textContent=`需先通過${p.tier}級入門考核`}
  else b.textContent="正式加入（考核已通過）";
 }
}
function injectCard(type,a){
 const body=typeof document!=="undefined"?document.getElementById("modalBody"):null;if(!body||body.querySelector("[data-affiliation-entry-gate]"))return;
 const html=gateCard(type,a);if(html)body.insertAdjacentHTML("afterbegin",html);patchJoinButton(type,a);
}

const RAW={
 discoverOrganization:globalThis.discoverOrganization,
 discoverDiscipline:globalThis.discoverDiscipline,
 openOrganization:globalThis.openOrganization,
 openDiscipline:globalThis.openDiscipline,
 openOrganizationContracts:globalThis.openOrganizationContracts,
 studyDiscipline:globalThis.studyDiscipline,
 attemptJoinOrganization:globalThis.attemptJoinOrganization,
 joinDiscipline:globalThis.joinDiscipline,
 recordIntel:globalThis.recordIntel,
 resolveOrganizationEncounter:globalThis.resolveOrganizationEncounter,
 resolveAdventureEvent:globalThis.resolveAdventureEvent,
 turnInQuest:globalThis.turnInQuest
};
let context=null;

if(typeof RAW.discoverOrganization==="function")globalThis.discoverOrganization=function(id,source=""){
 const a=org(id);if(!a)return false;const p=profile("organization",a);if(TIER_RANK[p.tier]<2)return RAW.discoverOrganization.apply(this,arguments);
 if(hasContact("organization",a.id))return RAW.discoverOrganization(a.id);
 const ctx=context,kind=ctx?.kind||sourceKind(source);if(kind)noteEvidence("organization",a.id,{kind,key:ctx?.key,label:ctx?.label||source,source});
 return hasContact("organization",a.id)?RAW.discoverOrganization(a.id):false;
};
if(typeof RAW.discoverDiscipline==="function")globalThis.discoverDiscipline=function(id,source="接觸"){
 const a=disc(id);if(!a)return false;const p=profile("discipline",a);if(TIER_RANK[p.tier]<2)return RAW.discoverDiscipline.apply(this,arguments);
 if(hasContact("discipline",a.id))return RAW.discoverDiscipline(a.id,source);
 const ctx=context,kind=ctx?.kind||sourceKind(source);if(kind)noteEvidence("discipline",a.id,{kind,key:ctx?.key,label:ctx?.label||source,source});
 return hasContact("discipline",a.id)?RAW.discoverDiscipline(a.id,source):false;
};
if(typeof RAW.openOrganization==="function")globalThis.openOrganization=function(id){
 const a=org(id);if(!a)return;const p=profile("organization",a);if(TIER_RANK[p.tier]>=2&&!hasContact("organization",a.id)&&memberId("organization")!==a.id)return teaser("organization",a);
 const out=RAW.openOrganization.apply(this,arguments);injectCard("organization",a);return out;
};
if(typeof RAW.openDiscipline==="function")globalThis.openDiscipline=function(id){
 const a=disc(id);if(!a)return;const p=profile("discipline",a);if(TIER_RANK[p.tier]>=2&&!hasContact("discipline",a.id)&&memberId("discipline")!==a.id)return teaser("discipline",a);
 const out=RAW.openDiscipline.apply(this,arguments);injectCard("discipline",a);return out;
};
if(typeof RAW.openOrganizationContracts==="function")globalThis.openOrganizationContracts=function(id){const a=org(id);if(a&&profile("organization",a).narrative_required&&!hasContact("organization",a.id)){teaser("organization",a);return}return RAW.openOrganizationContracts.apply(this,arguments)};
if(typeof RAW.studyDiscipline==="function")globalThis.studyDiscipline=function(id){const a=disc(id);if(a&&profile("discipline",a).narrative_required&&!hasContact("discipline",a.id)){teaser("discipline",a);return}return RAW.studyDiscipline.apply(this,arguments)};
if(typeof RAW.attemptJoinOrganization==="function")globalThis.attemptJoinOrganization=function(id){return attemptJoin("organization",id)};
if(typeof RAW.joinDiscipline==="function")globalThis.joinDiscipline=function(id){return attemptJoin("discipline",id)};

if(typeof RAW.recordIntel==="function")globalThis.recordIntel=function(id){
 const row=(DB.intel_database?.records||[]).find(x=>x?.id===id)||Object.values(globalThis.G?.intelBoardCache||{}).flat().find(x=>x?.id===id)||null;
 const prev=context;context={kind:"intel",key:`intel:${id}`,label:row?.category?`${row.category}情報`:`情報 ${id}`};
 try{return RAW.recordIntel.apply(this,arguments)}finally{context=prev}
};
if(typeof RAW.resolveOrganizationEncounter==="function")globalThis.resolveOrganizationEncounter=function(engage){
 const e=globalThis.G?.pendingOrganizationEncounter?{...G.pendingOrganizationEncounter}:null,out=RAW.resolveOrganizationEncounter.apply(this,arguments);
 if(engage&&e?.organizationId)noteEvidence("organization",e.organizationId,{kind:"encounter",key:`org-encounter:${e.organizationId}:${e.id||e.createdTurn||turn()}`,label:e.name||"組織奇遇"});
 return out;
};
if(typeof RAW.resolveAdventureEvent==="function")globalThis.resolveAdventureEvent=function(choice){
 const ev=globalThis.G?.pendingAdventureEvent?{...G.pendingAdventureEvent}:null,t=ev?(DB.adventure_event_templates||[]).find(x=>x?.id===ev.templateId):null;
 const out=RAW.resolveAdventureEvent.apply(this,arguments);if(choice==="leave"||!ev)return out;
 const oid=t?.organization_id||t?.organizationId||ev.organization_id||ev.organizationId,did=t?.discipline_id||t?.disciplineId||ev.discipline_id||ev.disciplineId;
 if(oid)noteEvidence("organization",oid,{kind:"encounter",key:`adventure:${ev.id||ev.templateId}:${oid}`,label:t?.name||ev.name||"相關奇遇"});
 if(did)noteEvidence("discipline",did,{kind:"encounter",key:`adventure:${ev.id||ev.templateId}:${did}`,label:t?.name||ev.name||"相關奇遇"});
 return out;
};
if(typeof RAW.turnInQuest==="function")globalThis.turnInQuest=function(id){
 const q=(globalThis.G?.quests||[]).find(x=>x?.id===id),snap=q&&q.status==="ready"?{id:q.id,name:q.name,organizationId:q.organizationId,disciplineId:q.disciplineId||q.discipline_id,sourceType:q.sourceType,sourceId:q.sourceId}:null;
 const out=RAW.turnInQuest.apply(this,arguments),completed=!!snap&&!(globalThis.G?.quests||[]).some(x=>x?.id===id);
 if(completed){
  if(snap.organizationId)noteEvidence("organization",snap.organizationId,{kind:"quest",key:`quest:${snap.id}`,label:snap.name||"完成組織委託"});
  if(snap.disciplineId)noteEvidence("discipline",snap.disciplineId,{kind:"quest",key:`quest:${snap.id}`,label:snap.name||"完成流派委託"});
 }
 return out;
};

function annotateData(){
 for(const [type,rows] of [["organization",DB.world_organizations||[]],["discipline",DB.discipline_factions||[]]])for(const a of rows){if(!a?.id)continue;const p=profile(type,a);a.entry_gate_profile={tier:p.tier,evidence_required:p.evidence_required,exam_required:p.exam_required,exam_dc:p.exam_dc,reattempt_days:p.reattempt_days,rule:p.narrative_required?"先由劇情／委託／奇遇／情報等建立正式接觸，再通過考核加入":p.exam_required?"公開接觸，但須通過入門考核才能加入":"低階公開加入規則"}}
}
function audit(){
 const issues=[],stats={organizations:0,disciplines:0,gated_d_plus:0,exam_e_plus:0};
 for(const [type,rows] of [["organization",DB.world_organizations||[]],["discipline",DB.discipline_factions||[]]])for(const a of rows){
  if(!a?.id||a.joinable===false)continue;stats[type==="organization"?"organizations":"disciplines"]++;
  const p=profile(type,a),r=TIER_RANK[p.tier];if(r>=1){stats.exam_e_plus++;if(!p.exam_required)issues.push(`${type}:${a.id}:E級以上缺少入門考核`)}
  if(r>=2){stats.gated_d_plus++;if(p.evidence_required!==r-1)issues.push(`${type}:${a.id}:${p.tier}級接觸線索門檻異常/${p.evidence_required}`)}
  if(!a.entry_gate_profile||a.entry_gate_profile.tier!==p.tier)issues.push(`${type}:${a.id}:entry_gate_profile缺失或不同步`);
 }
 if(!(GATE.D.evidence<GATE.C.evidence&&GATE.C.evidence<GATE.B.evidence&&GATE.B.evidence<GATE.A.evidence&&GATE.A.evidence<GATE.S.evidence))issues.push("高階接觸線索門檻未隨層級遞增");
 if(!(GATE.E.dc<GATE.D.dc&&GATE.D.dc<GATE.C.dc&&GATE.C.dc<GATE.B.dc&&GATE.B.dc<GATE.A.dc&&GATE.A.dc<GATE.S.dc))issues.push("入門考核DC未隨層級遞增");
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,stats};
}
annotateData();
DB.meta=DB.meta||{};DB.meta.affiliation_entry_gate_revision=REV;
DB.affiliation_entry_gate_system={version:REV,release:RELEASE,save_compatible:true,tier_rules:Object.fromEntries(Object.entries(GATE).map(([k,v])=>[k,{...v}])),contact_sources:["劇情","委託","奇遇","情報","引介／對話","調查／探索","世界事件"],rules:["知道名稱不等於正式接觸。","E級以上加入前需通過入門考核。","D級以上正式接觸需累積劇情性證據，D/C/B/A/S依序為1/2/3/4/5筆。","考核失敗有短期冷卻，層級越高考核越嚴格。","舊存檔已接觸勢力保留接觸資格；既有正式會員視為已通過考核。"]};
const baseAudit=globalThis.runGeneratorAudit;
if(typeof baseAudit==="function"&&!baseAudit.__affiliationEntryGatePatched){const wrapped=function(){const prev=baseAudit.apply(this,arguments),r=audit();return [...(Array.isArray(prev)?prev:[]),...r.issues.map(x=>"勢力接觸門檻:"+x)]};wrapped.__affiliationEntryGatePatched=true;globalThis.runGeneratorAudit=wrapped}

globalThis.affiliationEntryProfile=(type,id)=>{const a=aff(type,id);return a?profile(type,a):null};
globalThis.affiliationEntryState=state;
globalThis.recordAffiliationEntryEvidence=noteEvidence;
globalThis.takeAffiliationEntranceExam=entranceExam;
globalThis.runAffiliationEntryGateAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/affiliation-entry-gate-v1.js",{domain:"world",revision:REV,release:RELEASE});
})();