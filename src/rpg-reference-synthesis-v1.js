/* 群陸旅誌：經典RPG參考綜合深化 CURRENT-2.10.0
 * RPG-REFERENCE-SYNTHESIS-1.0
 * 將 references/wikipedia-rpg 的抽象設計模式接入既有資料庫：
 * 多解委託、NPC互動、知識邊界、隊友協同、活世界因果、技能熟練節點。
 * 不複製外部IP專名／劇情／角色／數值，不建立第二套戰鬥或經濟系統，不改存檔schema。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-2.10.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.10.0";
const REV="RPG-REFERENCE-SYNTHESIS-1.0";
const TIER_RANK=Object.freeze({F:0,E:1,D:2,C:3,B:4,A:5,S:6});
const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
const text=v=>String(v??"");
const includesAny=(s,words)=>words.some(w=>s.includes(w));
const classifyTier=t=>TIER_RANK[String(t||"F").toUpperCase()]??0;

const SOURCE_PATTERNS=Object.freeze({
 dnd:["分層角色資料","統一檢定語言","前置條件圖","世界裁定"],
 bg3:["條件→檢定→結果→世界狀態","多解遭遇","隊友記憶"],
 final_fantasy:["清楚職能","資源循環","區域化魔法文化"],
 elder_scrolls:["技能使用式成長","派系任務鏈","角色知識邊界","非線性探索"],
 chrono_trigger:["長期因果","世界狀態版本","隊伍協同"],
 fire_emblem:["關係支援","條件式職業晉升","失敗後果"],
 octopath:["職業影響NPC互動","多主角個人線","弱點後集中爆發"],
 mana:["原創系列母題","地域變體共用底層規則"]
});

function skillKind(skill){
 const k=text(skill?.kind).toLowerCase(),n=text(skill?.name);
 if(/heal|support|buff|debuff|utility/.test(k)||includesAny(n,["治療","回復","淨化","祝福","護盾","鼓舞","強化","削弱"]))return "support";
 if(/passive/.test(k)||includesAny(n,["精通","心得","體魄","感知","專精"]))return "passive";
 if(includesAny(n,["陷阱","標記","煙幕","結界","圖騰","召喚"]))return "setup";
 return "attack";
}
function skillMastery(skill){
 const kind=skillKind(skill),tags=uniq([...(skill?.mechanic_tags||[]),...(skill?.tags||[])]);
 const base={source:"abstract-rpg-patterns",level6:null,level10:null,anti_grind:"同一低風險目標重複操作不應成為主要熟練來源；高於合理頻率時由既有技能經驗機制遞減。"};
 if(kind==="attack"){
  base.level6={theme:"戰術深化",effect_design:tags.length?"強化既有「"+tags.slice(0,2).join("／")+"」特色，而非單純提高傷害":"增加條件式命中、破勢、追擊或資源回收之一"};
  base.level10={theme:"流派完成",effect_design:"在符合職業戰鬥循環時觸發質變效果；避免無條件常駐倍增"};
 }else if(kind==="support"){
  base.level6={theme:"支援穩定",effect_design:"改善持續時間、範圍、淨化／保護可靠度或資源效率之一"};
  base.level10={theme:"團隊協同",effect_design:"加入隊友條件或危急狀態下的額外效果，不以純數值膨脹為主"};
 }else if(kind==="setup"){
  base.level6={theme:"布置效率",effect_design:"降低前置成本或提高場地／標記／召喚的可控性"};
  base.level10={theme:"連鎖完成",effect_design:"讓後續技能、隊友或環境互動取得額外戰術收益"};
 }else{
  base.level6={theme:"專精辨識",effect_design:"讓被動專長在特定情境更鮮明，不改成全能加成"};
  base.level10={theme:"宗師特性",effect_design:"提供玩法規則層的便利或條件式轉化，保留反制與限制"};
 }
 return base;
}
function applySkillMastery(){
 let count=0;
 const pools=[];
 if(DB.skill_pools&&typeof DB.skill_pools==="object")for(const list of Object.values(DB.skill_pools))if(Array.isArray(list))pools.push(list);
 if(Array.isArray(DB.shared_skills))pools.push(DB.shared_skills);
 for(const list of pools)for(const skill of list){
  if(!skill||typeof skill!=="object")continue;
  skill.mastery_design=Object.assign(skill.mastery_design||{},skillMastery(skill));
  count++;
 }
 return count;
}

function classProgressionDesign(c){
 const rank=classifyTier(c?.tier),profile=c?.identity_profile||c?.combat_identity||c?.identity||{};
 const tags=uniq(profile.mechanic_tags||c?.mechanic_tags||[]);
 const previous=uniq(c?.progression_from||[]);
 const gates=[];
 if(rank>=1)gates.push("需要合理前置職業／導師／組織來源之一");
 if(rank>=3)gates.push("C級以上需具有實戰紀錄或流派認可，物理系鬥氣遵守既有C級規則");
 if(rank>=4)gates.push("B級以上必須存在明確前置、傳承、考核或受限取得來源");
 if(rank>=5)gates.push("A級以上不得只靠等級自動取得，需世界事件／高階組織／師承或同級難度成果");
 if(rank>=6)gates.push("S級保持世界稀有上限，不以一般商店、隨機教師或低階任務直接提供");
 return {
  previous_class_ids:previous,
  progression_gates:gates,
  tactical_loop:text(profile.battle_loop||c?.battle_loop||"依職業既有技能循環"),
  identity_tags:tags,
  build_rule:"新增技能優先補強既有職能循環、反制面或隊伍協同，不用換名技能重複同一攻防百分比。"
 };
}
function applyClassProgression(){
 let count=0;
 for(const c of DB.combat_classes||[]){
  c.reference_progression=Object.assign(c.reference_progression||{},classProgressionDesign(c));
  count++;
 }
 return count;
}

function npcText(n){return [n?.name,n?.role,n?.title,n?.occupation,n?.profession,n?.background,n?.type,n?.description].map(text).join(" ")}
function npcRoutes(n){
 const s=npcText(n),routes=[];
 const add=(id,label,gate,risk="low")=>{if(!routes.some(x=>x.id===id))routes.push({id,label,gate,risk})};
 add("talk","交談／觀察","基礎互動","low");
 if(includesAny(s,["商","店","販","行商","拍賣","市場"]))add("trade","交易／議價","所在地市場與NPC庫存","low");
 if(includesAny(s,["學者","學院","法師","研究","祭司","牧師","教士","書記","情報","斥候","獵人"]))add("inquire","打聽／專業詢問","知識、名聲、職業或合理情報來源","medium");
 if(includesAny(s,["工匠","鍛造","鐵匠","裁縫","煉金","料理","藥師"]))add("profession","專業服務／請教","對應副職業、費用、材料或關係","low");
 if(includesAny(s,["傭兵","冒險者","護衛","斥候","獵人","騎士","戰士"]))add("challenge","切磋／實力證明","等級、名聲或任務前置","medium");
 if(includesAny(s,["首領","領主","官","議員","長老","隊長","教宗","主教","王","侯","公爵"]))add("petition","正式交涉／請願","禮儀、身分、名聲、組織關係","medium");
 if(includesAny(s,["黑市","地下","走私","密探","盜賊","刺客"]))add("underworld","地下接觸","憑證、奇遇、劇情、名聲或秘密情報","high");
 return routes;
}
function applyNpcInteractions(){
 let count=0;
 for(const key of ["regional_npc_archetypes","npc_personality_profiles","named_npcs","npcs"]){
  for(const n of Array.isArray(DB[key])?DB[key]:[]){
   if(!n||typeof n!=="object")continue;
   n.reference_interactions=npcRoutes(n);
   n.knowledge_boundary={
    rule:"NPC只能提供其職業、地區、組織、親歷事件或可靠消息來源可合理得知的資訊。",
    confidence_levels:["親歷／職責內","可靠轉述","傳聞／推測","未知"],
    forbid_global_omniscience:true
   };
   count++;
  }
 }
 return count;
}

function questBlob(q){return [q?.name,q?.title,q?.description,q?.kind,q?.type,q?.objective,q?.category,...(q?.tags||[])].map(text).join(" ")}
function questApproaches(q){
 const s=questBlob(q),routes=[];
 const add=(id,label,why)=>{if(!routes.some(x=>x.id===id))routes.push({id,label,why})};
 if(includesAny(s,["採集","素材","藥草","礦","狩獵","調查","探索","尋找"]))add("exploration","探索／調查","以地圖、野外技能、追蹤或採集完成核心步驟");
 if(includesAny(s,["討伐","擊敗","怪物","護衛","戰鬥","清剿"]))add("combat","戰鬥／護衛","以正面戰鬥、伏擊、準備或隊伍配置解決威脅");
 if(includesAny(s,["交涉","談判","說服","情報","打聽","商","送達","護送"]))add("social","交涉／情報","以名聲、關係、情報、金錢或社交檢定改變處理方式");
 if(includesAny(s,["製作","鍛造","料理","煉金","修理","加工"]))add("profession","副職業／製作","以對應副職、配方、材料與品質要求解決問題");
 if(!routes.length){add("investigation","調查","先取得可靠資訊再決定處理方式");add("direct","直接處理","沿既有任務目標完成");}
 if(routes.length===1)add("supporting","準備／支援","透過補給、情報、隊友或環境準備降低主要路線風險");
 return {
  routes,
  fail_forward:"非致命失敗優先留下代價、時間、名聲、資源或世界狀態後果，而不是無條件重置。",
  consequence_axes:["城鎮狀態","NPC關係","組織名聲","市場供需","傳聞","後續委託"],
  canonical_objective_preserved:true
 };
}
function applyQuestApproaches(){
 let count=0;
 for(const key of ["quest_templates","shop_quests","story_quests","guild_quests"]){
  for(const q of Array.isArray(DB[key])?DB[key]:[]){
   if(!q||typeof q!=="object")continue;
   q.reference_resolution=questApproaches(q);
   count++;
  }
 }
 return count;
}

function locationProfile(l){
 const facilities=uniq(l?.facilities||[]),rank=classifyTier(l?.tier),kind=text(l?.kind);
 const size=text(l?.settlement_size||l?.scale||l?.size||"");
 let access="地方";
 if(includesAny(size,["省","都","大型","首都","國都"])||facilities.length>=7)access="省級";
 else if(includesAny(size,["城","中型"])||facilities.length>=4)access="城鎮";
 else if(kind==="wild"||kind==="dungeon")access="野外";
 const knowledge=access==="省級"?"可接觸跨區域正式情報，但高階秘密仍需前置":access==="城鎮"?"以地方、商路、鄰近區域資訊為主":access==="野外"?"以地形、生態、遺跡與目擊資訊為主":"以聚落與周邊日常情報為主";
 return {
  access_scale:access,
  world_tier_rank:rank,
  knowledge_scope:knowledge,
  content_rule:"地區規模越小，組織／流派、技能教師、裝備藥劑、拍賣與高階服務越少；不可只因世界層級高就自動生成完整城市服務。",
  regional_identity_axes:["政治治理","主要產業","資源／生態","信仰／文化","治安／地下社會","交通位置"]
 };
}
function applyLocations(){let count=0;for(const l of DB.locations||[]){if(!l||typeof l!=="object")continue;l.reference_content_profile=Object.assign(l.reference_content_profile||{},locationProfile(l));count++}return count}

const ROLE_SYNERGY=Object.freeze({
 tank:{partners:["healer","ranged","caster"],setup:"吸收威脅／護衛",payoff:"讓後排獲得安全輸出或施法窗口"},
 frontline:{partners:["support","healer","ranged"],setup:"建立正面壓力",payoff:"由隊友補強續航或處理被牽制目標"},
 healer:{partners:["tank","frontline","hybrid"],setup:"穩定血線／淨化",payoff:"延長前線交換與高風險戰術的可持續時間"},
 ranged:{partners:["tank","scout","support"],setup:"保持距離／標記",payoff:"集中處理被控場、破勢或暴露弱點的目標"},
 scout:{partners:["ranged","frontline","specialist"],setup:"偵查／伏擊／標記",payoff:"提供先手、情報或陷阱窗口"},
 caster:{partners:["tank","support","hybrid"],setup:"施加元素／控制",payoff:"隊友利用控制與元素狀態形成連鎖"},
 hybrid:{partners:["frontline","caster","healer"],setup:"依敵方弱點補位",payoff:"在物理、魔法與支援間完成缺口"},
 support:{partners:["frontline","ranged","caster"],setup:"增益／補給／節奏支援",payoff:"放大專職角色的既有特色"},
 specialist:{partners:["scout","support","hybrid"],setup:"機關／情報／特殊環境處理",payoff:"開啟一般隊伍沒有的解法"}
});
function applyPartySynergy(){
 let count=0;
 for(const t of DB.party_member_templates||[]){
  const role=text(t?.role||"specialist"),s=ROLE_SYNERGY[role]||ROLE_SYNERGY.specialist;
  t.reference_synergy={
   preferred_partner_roles:s.partners,
   setup:s.setup,
   payoff:s.payoff,
   unlock_conditions:["共同冒險與羈絆達標","雙方相關技能可形成合理前後手","裝備／元素／站位條件成立時才啟用"],
   rule:"協同效果應改變選擇或節奏，不應只是無條件攻防百分比疊加。"
  };
  count++;
 }
 return count;
}

function worldCausality(){
 const target=DB.live_world_system||DB.world_autonomy_system||DB.world_event_system||{};
 const design={
  revision:"WORLD-CAUSALITY-DESIGN-1.0",
  event_chain_fields:["cause","trigger","visible_signs","active_effects","npc_reactions","market_effects","resolution","aftermath","recovery_or_escalation"],
  state_memory:["城鎮狀態","NPC記憶","派系狀態","市場供需","傳聞可靠度","地區危險度"],
  rule:"世界事件完成後保留痕跡與後果；不得把城鎮、NPC、市場與傳聞無條件重置為事件前狀態。",
  rumor_rule:"傳聞應標記來源、可靠度、時效與角色是否有合理取得途徑。"
 };
 target.reference_causality=Object.assign(target.reference_causality||{},design);
 if(!DB.live_world_system&&!DB.world_autonomy_system&&!DB.world_event_system)DB.reference_live_world_design=target;
 return design;
}

function appendPartySynergyCard(){
 const original=globalThis.openPartyMemberProfile;
 if(typeof original!=="function"||original.__referenceSynthesisPatched)return false;
 const wrapped=function(uid){
  const out=original.apply(this,arguments);
  try{
   const party=typeof globalThis.partyMembers==="function"?globalThis.partyMembers():[];
   const member=party.find?.(x=>x?.uid===uid);
   const template=(DB.party_member_templates||[]).find(x=>x?.id===member?.templateId);
   const syn=template?.reference_synergy,body=document.getElementById("modalBody");
   if(syn&&body&&!body.querySelector("[data-reference-synergy]")){
    const card=document.createElement("div");card.className="card";card.dataset.referenceSynergy="1";
    card.innerHTML="<b>隊伍協同</b><br><span class=\"small\">適合搭配｜"+syn.preferred_partner_roles.join("、")+"<br>前置｜"+syn.setup+"<br>收益｜"+syn.payoff+"<br>原則｜"+syn.rule+"</span>";
    const actions=body.querySelector(".actions");if(actions)body.insertBefore(card,actions);else body.appendChild(card);
   }
  }catch(error){console.warn("reference teammate synergy decorate failed",error)}
  return out;
 };
 wrapped.__referenceSynthesisPatched=true;
 globalThis.openPartyMemberProfile=wrapped;
 return true;
}

const stats={
 skills:applySkillMastery(),
 classes:applyClassProgression(),
 npcs:applyNpcInteractions(),
 quests:applyQuestApproaches(),
 locations:applyLocations(),
 party_templates:applyPartySynergy()
};
const causality=worldCausality();
const uiPartySynergy=appendPartySynergyCard();

DB.rpg_reference_synthesis_system={
 version:REV,release:RELEASE,
 source_index:"references/wikipedia-rpg/sources.json",
 source_policy:{abstract_patterns_only:true,copy_ip_proper_nouns:false,project_rules_take_precedence:true},
 pillars:[
  "多解委託與失敗後果","NPC職業／身分式互動","角色與NPC知識來源邊界",
  "技能Lv6／Lv10質變設計","隊友協同與羈絆前置","世界事件因果記憶","地區規模與內容可及性"
 ],
 reference_patterns:SOURCE_PATTERNS,
 stats,world_causality:causality,save_schema_changed:false
};
DB.meta=DB.meta||{};
DB.meta.rpg_reference_synthesis_revision=REV;
if(DB.integration_registry?.optimization_notes)DB.integration_registry.optimization_notes.push(
 "CURRENT-2.10.0／RPG-REFERENCE-SYNTHESIS-1.0：將新RPG參考庫抽象規則接回既有任務、NPC、地區、技能、隊友與活世界資料，不複製外部IP專名、不改存檔schema。"
);

function audit(){
 const issues=[];
 if(stats.classes!==(DB.combat_classes||[]).length)issues.push("戰鬥職業參考深化數量不一致");
 for(const c of DB.combat_classes||[])if(!c?.reference_progression?.build_rule)issues.push("職業缺少深化規則:"+(c?.id||c?.name||"unknown"));
 for(const t of DB.party_member_templates||[])if(!t?.reference_synergy?.rule)issues.push("隊友缺少協同設計:"+(t?.id||t?.name||"unknown"));
 for(const l of DB.locations||[])if(!l?.reference_content_profile?.content_rule)issues.push("地區缺少內容可及性規則:"+(l?.id||l?.name||"unknown"));
 if(!causality?.event_chain_fields?.length)issues.push("活世界因果欄位未建立");
 if(DB.rpg_reference_synthesis_system?.source_policy?.copy_ip_proper_nouns!==false)issues.push("外部IP專名保護失效");
 return {version:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats,save_schema_changed:false};
}
globalThis.runRpgReferenceSynthesisAudit=audit;
globalThis.QUNLU_RPG_REFERENCE_SYNTHESIS={version:REV,release:RELEASE,audit,questApproaches,npcRoutes,locationProfile,skillMastery};
CORE?.registerModule?.("src/rpg-reference-synthesis-v1.js",{domain:"survival",revision:REV,release:RELEASE});
})();