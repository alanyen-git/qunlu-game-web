/* 群陸旅誌：拍賣場／黑市稀有技能書、殘本與導師考核
 * SKILL-MANUSCRIPT-1.0；動態書冊資料不寫入角色主檔，既有存檔維持相容。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.items)||!DB.skill_pools)return;
const REV="SKILL-MANUSCRIPT-1.0";
const CORE=globalThis.QUNLU_CORE;
const R={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const GRADES=["F","E","D","C","B","A","S"];
const BASE_VALUES={E:600,D:1700,C:5200,B:16000,A:48000,S:144000};
const chance={auction:22,black_market:28};
const rows=[],byItem=new Map(),seen=new Set();
const tv=()=>globalThis.QUNLU_TRADE_VENUES||null;
const game=()=>typeof G!=="undefined"?G:null;
const rank=t=>R[String(t||"F")]??0;
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function hash(v){let h=2166136261;for(const ch of String(v)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function clone(v){return JSON.parse(JSON.stringify(v))}
function skillKey(s){return String(s?.canonical_skill_id||s?.id||"")}
function item(id){return DB.items.find(x=>x?.id===id)||null}
function town(){return DB.locations?.find(x=>x?.id===game()?.character?.locationId)||null}
function gameHours(){const t=game()?.worldTime||{};return (Number(t.day||1)-1)*24+Number(t.hour||0)+Number(t.minute||0)/60}
function tradeState(){return game()?.worldState?.tradeVenues||null}
function eligible(s){return !!s&&["E","D","C","B","A","S"].includes(s.tier)&&!s.learn_only_via_upgrade&&!!skillKey(s)}
function registerSource(id){
 DB.content_link_index=DB.content_link_index||{};
 const sources=DB.content_link_index.item_sources=DB.content_link_index.item_sources||{};
 const row=sources[id]=sources[id]||{};
 for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])row[k]=Array.isArray(row[k])?row[k]:[];
 for(const label of ["auction_rare_manuscript","black_market_rare_manuscript"])if(!row.special_sources.includes(label))row.special_sources.push(label);
}
for(const [cid,pool] of Object.entries(DB.skill_pools)){
 if(!Array.isArray(pool))continue;
 const owner=DB.combat_classes?.find(c=>c.id===cid);
 for(const s of pool){
  if(!eligible(s))continue;
  const key=cid+"|"+skillKey(s);if(seen.has(key))continue;seen.add(key);
  const fragment=rank(s.tier)>=rank("C"),id="IT-SKM-"+hash(key).toString(36)+"-"+hash(skillKey(s)+"|"+cid).toString(36);
  const name=s.name+(fragment?"・殘本":"・技能書");
  const d={
   id,name,tier:s.tier,kind:"skill_book",type:"技能書",catalog_group:"書籍／卷軸／符文",
   rarity:rank(s.tier)>=4?"珍稀":"稀有",weight:.45,value:BASE_VALUES[s.tier],
   stackable:false,trade_luxury:true,trade_venue_special_stock_only:true,
   utility_effect:"learn_skill_manuscript",manuscript_skill_id:skillKey(s),manuscript_source_class:cid,
   manuscript_grade:s.tier,manuscript_fragment:fragment,manuscript_multiplier:fragment?.6:1,
   description:(owner?.name||"職業")+"的"+s.tier+"級「"+s.name+"」"+(fragment?"不完整傳抄；研讀只能發揮原技能60%威力，不具完整傳承資格。":"完整技法記錄；須達成原職業及學習條件。")
  };
  if(!item(id))DB.items.push(d);
  registerSource(id);
  const rec={itemId:id,skill:s,classId:cid,grade:s.tier,fragment};
  rows.push(rec);byItem.set(id,rec)
 }
}
function canStudy(rec){
 const c=game()?.character;
 if(!c)return "尚未建立角色";
 const base=rec?.skill;if(!base)return "技能資料不存在";
 const ownClass=c.classId===rec.classId||(c.classHistory||[]).some(x=>x.id===rec.classId);
 if(!ownClass)return "尚未取得「"+(DB.combat_classes?.find(x=>x.id===rec.classId)?.name||rec.classId)+"」職業傳承";
 const required=rec.fragment?Math.max(0,rank(rec.grade)-1):rank(rec.grade);
 if(rank(c.combatGrade)<required)return "實際職業階級不足，需達"+GRADES[required]+"級";
 const level=Math.max(1,Number(base.required_level)||1);
 if(Number(c.level||1)<level)return "角色等級需達Lv"+level;
 for(const [key,value] of Object.entries({...base.prereq,...base.required_stats})){
  if(Number.isFinite(Number(value))&&Number(c.stats?.[key]||0)<Number(value))return key+"需達"+value;
 }
 if(base.required_stat){
  const need=Number(base.required_stat_value??base.required_stat_requirement??DB.guild_training?.primary_stat_requirement??0);
  if(need>0&&Number(c.stats?.[base.required_stat]||0)<need)return base.required_stat+"需達"+need
 }
 const original=skillKey(base);
 if((c.skills||[]).some(s=>skillKey(s)===original&&!s.manuscript_fragment))return "已習得此完整技能";
 if((c.skills||[]).some(s=>s.manuscript_fragment&&s.manuscript_original_skill_id===original&&s.manuscript_source_class===rec.classId))return "已研讀同一技能殘本";
 if((c.skills||[]).length>=10)return "技能欄已滿（10/10）";
 return "";
}
function reduceNumericFields(obj,keys){
 for(const key of keys)if(Number.isFinite(Number(obj?.[key])))obj[key]=Math.round(Number(obj[key])*.6*100)/100
}
function learned(rec,fragment=rec.fragment){
 const s=clone(rec.skill);s.type="戰鬥";s.skillXp=0;s.mastery=1;
 if(!fragment)return s;
 const original=skillKey(rec.skill);
 s.id="SK-MAN-FRAG-"+hash(rec.classId+"|"+original).toString(36);
 s.canonical_skill_id=s.id;s.name=rec.skill.name+"（殘本）";
 s.manuscript_fragment=true;s.manuscript_multiplier=.6;
 s.manuscript_original_skill_id=original;s.manuscript_source_class=rec.classId;
 reduceNumericFields(s,["base_power_percent","power_growth_percent_per_level","power","magicPower","defense","magicDefense","accuracy","evasion","critRate","critDamage","blockRate","statusResist","shield","status_chance"]);
 if(s.support_percent_effects)reduceNumericFields(s.support_percent_effects,Object.keys(s.support_percent_effects));
 if(s.support_percent_growth_per_level)reduceNumericFields(s.support_percent_growth_per_level,Object.keys(s.support_percent_growth_per_level));
 if(s.debuff)reduceNumericFields(s.debuff,Object.keys(s.debuff));
 for(const effect of Object.values(s.level_bonuses||{}))if(effect&&typeof effect==="object")reduceNumericFields(effect,Object.keys(effect));
 /* 技能機制由既有引擎依縮減後的欄位重算，避免沿用完整版本的快取。 */
 delete s.mechanics;
 s.effect_text="不完整傳抄：此技能僅發揮完整版本60%威力；同一招式不重複學習。";
 s.desc=s.effect_text;return s
}
function study(invIndex){
 const c=game()?.character,x=c?.inventory?.[invIndex],rec=x&&byItem.get(x.id);
 if(!rec)return false;
 const reason=canStudy(rec);if(reason){globalThis.alert?.(reason);return false}
 if(typeof globalThis.beginTurn==="function"&&!globalThis.beginTurn("研讀技能書"))return false;
 if(!globalThis.removeItem?.(x.id,1,invIndex)){globalThis.endTurn?.(0);return false}
 c.skills=Array.isArray(c.skills)?c.skills:[];
 const s=learned(rec);c.skills.push(s);
 globalThis.log?.("技能",("研讀"+(rec.fragment?"殘本":"完整技能書")+"：習得"+s.name+"［"+rec.grade+"］"+(rec.fragment?"，威力為原版60%。":"。")),"ok");
 if(typeof globalThis.endTurn==="function")globalThis.endTurn(2);else globalThis.persist?.();
 globalThis.openCharacterSkills?.();return true
}
function passedBExam(c,cid){
 return (c?.classExamHistory||[]).some(e=>e.targetId===cid&&e.targetGrade==="B")
}
function canMentorB(s,c=game()?.character){
 if(!s||s.tier!=="B")return true;
 const cid=s.source_class||c?.classId;
 return !!c&&c.currentFacility==="guild"&&rank(c.combatGrade)>=rank("B")&&
   rank(town()?.tier)>=rank("C")&&passedBExam(c,cid)
}
function mentorReason(s){
 const c=game()?.character;
 if(!c||c.currentFacility!=="guild")return "完整B級技能只能在冒險者公會由導師傳授";
 if(rank(c.combatGrade)<rank("B"))return "實際戰鬥職業需達B級";
 if(rank(town()?.tier)<rank("C"))return "需前往C級以上城鎮公會尋找導師";
 return "須先完成本職B級考核（實戰與委託回報），再由導師傳授"
}
function replaceFragment(s){
 const c=game()?.character,original=skillKey(s);
 const i=(c?.skills||[]).findIndex(x=>x.manuscript_fragment&&x.manuscript_original_skill_id===original&&x.manuscript_source_class===(s.source_class||c.classId));
 if(i<0)return false;
 if(typeof globalThis.beginTurn==="function"&&!globalThis.beginTurn("導師補完技能傳承"))return false;
 const old=c.skills[i],next=clone(s);
 next.type="戰鬥";next.skillXp=Number(old.skillXp||0);next.mastery=Number(old.mastery||1);
 c.skills.splice(i,1,next);
 globalThis.log?.("導師傳授","完成"+s.name+"［"+s.tier+"］傳承，取代殘本並保留技能經驗值。","ok");
 if(typeof globalThis.endTurn==="function")globalThis.endTurn(3);else globalThis.persist?.();
 globalThis.openCharacterSkills?.();return true
}
function selectBook(l,venue,seed){
 const cap=venue==="auction"?Math.min(6,Math.max(2,rank(l?.tier)+1)):
  Math.min(6,Math.max(rank(l?.tier)+2,rank(game()?.character?.adventureRank)+1,rank(game()?.character?.combatGrade)+1));
 const available=rows.filter(x=>rank(x.grade)<=cap);
 if(!available.length)return null;
 const roll=hash(seed+"|tier")%100;
 const tier=roll<53?"E":roll<80?"D":roll<93?"C":roll<98?"B":roll<100?"A":"S";
 let pool=available.filter(x=>x.grade===tier);
 if(!pool.length)pool=available.filter(x=>rank(x.grade)<=rank(tier));
 if(!pool.length)pool=available;
 const cid=game()?.character?.classId;
 const focus=pool.filter(x=>x.classId===cid);
 if(focus.length&&hash(seed+"|focus")%100<65)pool=focus;
 return pool[hash(seed+"|pick")%pool.length]||null
}
function addAuctionManuscript(){
 const g=game(),l=town(),s=tradeState()?.auctions?.[l?.id];
 if(!s||!(Number(s.refreshAt)>0)||s.manuscriptCheckAt===s.refreshAt)return false;
 s.manuscriptCheckAt=s.refreshAt;
 if((s.listings||[]).some(x=>byItem.has(x.itemId)))return false;
 const seed=hash(l.id+"|auction-manuscript|"+s.refreshAt);
 if(seed%100>=chance.auction)return false;
 const rec=selectBook(l,"auction",String(seed));if(!rec)return false;
 const d=item(rec.itemId),quote=tv()?.pricing?.auctionQuote?.(d,1,seed);
 if(!quote)return false;
 const now=gameHours();s.listings.push({
  id:"AUC-SKM-"+l.id+"-"+seed.toString(36),itemId:d.id,qty:1,
  startBid:quote.start,currentBid:quote.start,minIncrement:quote.increment,buyout:quote.buyout,
  highest:"npc",playerEscrow:0,competition:40+seed%26,
  priceModel:tv()?.version||REV,expiresAt:now+18+((seed>>>11)%31)
 });
 globalThis.persist?.();return true
}
function addBlackManuscript(){
 const g=game(),l=town(),win=tv()?.blackWindow?.(),s=tradeState()?.blackMarkets?.[l?.id];
 if(!win?.open||!s?.generated||s.windowKey!==win.key||s.manuscriptWindowKey===win.key)return false;
 s.manuscriptWindowKey=win.key;
 if(Object.keys(s.stock||{}).some(id=>byItem.has(id)))return false;
 const seed=hash(win.key+"|black-manuscript");
 if(seed%100>=chance.black_market)return false;
 const rec=selectBook(l,"black_market",String(seed));if(!rec)return false;
 const d=item(rec.itemId);s.stock[d.id]=1;
 s.prices[d.id]=tv()?.pricing?.blackMarketBuyQuote?.(d,seed)||Math.ceil(d.value*1.8);
 s.budget=Math.max(Number(s.budget)||0,Math.ceil(tv()?.pricing?.blackMarketBudget?.(l,s.stock)||0));
 globalThis.persist?.();return true
}
const originalAuction=globalThis.openAuctionHouse;
if(typeof originalAuction==="function")globalThis.openAuctionHouse=function(){
 const result=originalAuction.apply(this,arguments);
 if(game()?.character?.currentFacility==="auction"&&addAuctionManuscript())return originalAuction.apply(this,arguments);
 return result
};
const originalBlack=globalThis.openBlackMarket;
if(typeof originalBlack==="function")globalThis.openBlackMarket=function(){
 const result=originalBlack.apply(this,arguments);
 if(addBlackManuscript())return originalBlack.apply(this,arguments);
 return result
};
const originalUse=globalThis.useItem;
if(typeof originalUse==="function")globalThis.useItem=function(i){
 if(byItem.has(game()?.character?.inventory?.[i]?.id))return study(i);
 return originalUse.apply(this,arguments)
};
const originalGate=globalThis.skillLearningPrereqState;
if(typeof originalGate==="function")globalThis.skillLearningPrereqState=function(s,opt={}){
 const state=originalGate.apply(this,arguments);
 if(s?.tier!=="B"||opt.mode!=="class"||canMentorB(s))return state;
 const reason=mentorReason(s);
 const check={label:"B級導師考核",need:"完成B級考核並於C級以上城鎮公會受教",current:reason,ok:false,shortfall:reason};
 state.checks.push(check);state.missing.push(check.label);state.ok=false;
 state.html+='<br><span class="bad">'+esc(check.label)+"："+esc(reason)+"</span>";
 return state
};
const originalLearn=globalThis.learnCombatSkill;
if(typeof originalLearn==="function")globalThis.learnCombatSkill=function(ref){
 const c=game()?.character,pool=DB.skill_pools?.[c?.classId]||[];
 const s=pool.find(x=>skillKey(x)===String(ref)||x.id===ref);
 if(s?.tier==="B"&&!canMentorB(s)){globalThis.alert?.(mentorReason(s));return false}
 if(s&&c?.currentFacility==="guild"){
  const fragment=(c.skills||[]).find(x=>x.manuscript_fragment&&x.manuscript_original_skill_id===skillKey(s)&&x.manuscript_source_class===(s.source_class||c.classId));
  if(fragment){
   const gate=globalThis.skillLearningPrereqState?.(s,{mode:"class",requireGuild:true});
   const blocker=(gate?.checks||[]).filter(x=>x.label!=="技能欄"&&!x.ok);
   if(blocker.length){globalThis.alert?.("尚未達成："+blocker.map(x=>x.label).join("、"));return false}
   return replaceFragment(s)
  }
 }
 return originalLearn.apply(this,arguments)
};
const originalTraining=globalThis.classTraining;
if(typeof originalTraining==="function")globalThis.classTraining=function(){
 const result=originalTraining.apply(this,arguments);
 if(typeof document!=="undefined"&&document.getElementById){
  const body=document.getElementById("modalBody");
  if(body&&!body.querySelector?.("[data-manuscript-mentor]")){
   const note=document.createElement("div");note.className="card small";note.dataset.manuscriptMentor="1";
   note.textContent="高階技能書：E～D級可能取得完整本；C級以上流通的只有60%威力殘本。完整B級技能必須完成本職B級考核，再到C級以上城鎮公會接受導師傳授；已研讀殘本可保留XP補完。";
   body.prepend(note)
  }
 }
 return result
};
function audit(){
 const issues=[],ids=new Set();
 for(const rec of rows){
  if(ids.has(rec.itemId))issues.push("技能書ID重複："+rec.itemId);
  ids.add(rec.itemId);
  const d=item(rec.itemId);
  if(!d||!d.trade_venue_special_stock_only)issues.push("技能書未納入稀有貨源："+rec.itemId);
  if(rank(rec.grade)>=3&&(!rec.fragment||!d.manuscript_fragment||d.manuscript_multiplier!==.6))issues.push("C級以上不是60%殘本："+rec.itemId);
  if(rank(rec.grade)<3&&(rec.fragment||d.manuscript_fragment))issues.push("E～D技能書誤標殘本："+rec.itemId)
 }
 return {revision:REV,pass:issues.length===0,issues,registered:rows.length,full:rows.filter(x=>!x.fragment).length,fragment:rows.filter(x=>x.fragment).length,save_compatible:true}
}
DB.meta=DB.meta||{};DB.meta.skill_manuscript_revision=REV;
DB.skill_manuscript_system={revision:REV,auction_refresh_chance_pct:chance.auction,black_market_window_chance_pct:chance.black_market,complete_book_grades:["E","D"],fragment_grades:["C","B","A","S"],fragment_power_ratio:.6,b_complete_requires_exam:true,b_mentor_min_town_tier:"C",save_compatible:true};
globalThis.runSkillManuscriptAudit=audit;
globalThis.studySkillManuscript=study;
globalThis.QUNLU_SKILL_MANUSCRIPTS={version:REV,audit,catalog:rows,learned,canStudy,canMentorB,selectBook,addAuctionManuscript,addBlackManuscript};
CORE?.registerModule?.("src/trade-skill-manuscripts-v1.js",{domain:"progression",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.14.9"});
})();