(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.3",REV="AFFILIATION-TREASURY-DEPTH-2.2";
const R={F:0,E:1,D:2,C:3,B:4,A:5,S:6},TIERS=["F","E","D","C","B","A","S"];
const LEVEL={F:1,E:8,D:20,C:35,B:50,A:70,S:90};
const RANK_REQ={F:0,E:1,D:2,C:3,B:4,A:5,S:5};
const ITEM_COST={F:90,E:160,D:280,C:450,B:700,A:1050,S:1500};
const SKILL_COST={F:120,E:220,D:360,C:550,B:800,A:1200,S:1700};
const SCALE=[
 {tier:"F",label:"小型／單一據點",equip:2,skills:2},
 {tier:"E",label:"地方型",equip:3,skills:2},
 {tier:"D",label:"城鎮／專門型",equip:4,skills:3},
 {tier:"C",label:"區域型",equip:5,skills:4},
 {tier:"B",label:"大型／國家級",equip:6,skills:5},
 {tier:"A",label:"跨國型",equip:7,skills:6},
 {tier:"S",label:"世界級",equip:7,skills:7}
];
const ORG_TITLES={
 "冒險與探索":["協力成員","正式幹員","資深幹員","分隊長","地區執事","評議員"],
 "軍事與武力":["新進隊員","正式隊員","精銳隊員","小隊長","戰團官","指揮議席"],
 "黑暗與地下":["外圍聯絡人","許可成員","內線幹員","執行者","掌事","核心座席"],
 "商業與貿易":["學徒會員","正式會員","資深會員","行會幹事","商站主管","理事"],
 "魔法與學術":["見習研究員","正式研究員","資深研究員","導師","首席研究員","評議員"],
 "王權／種族／職人":["協力成員","正式成員","資深成員","執事","地區代表","核心議員"]
};
const DISC_TITLES={physical:["外門門人","正式門人","內門門人","教習","師範","傳承席"],magic:["見習學員","正式學員","研究門人","導師","首席導師","傳承議席"]};
const GENERIC=["見習成員","正式成員","資深成員","幹事","地區主管","核心議席"];

const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const rk=t=>R[String(t||"F")]??0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const find=(arr,id)=>(arr||[]).find(x=>x?.id===id)||null;
const org=id=>typeof worldOrg==="function"?worldOrg(id):find(DB.world_organizations,id);
const disc=id=>typeof disciplineFor==="function"?disciplineFor(id):find(DB.discipline_factions,id);
const itemBy=id=>typeof item==="function"?item(id):find(DB.items,id);
const aff=(type,id)=>type==="organization"?org(id):disc(id);
const affName=(type,id)=>aff(type,id)?.name||id;
const safe=v=>String(v||"X").replace(/[^A-Za-z0-9-]/g,"-").slice(0,58);
const deep=v=>JSON.parse(JSON.stringify(v));

function member(type,id){
 try{return type==="organization"?orgState().membershipId===id:disciplineState().membershipId===id}catch(e){return false}
}
function contact(type,id){
 const a=aff(type,id),fid=a?.primary_facility,fn=DB.facilities?.[fid]?.name||fid||"指定據點";
 if(!a)return {ok:false,text:"資料不存在"};
 if(type==="organization"){const ok=G?.character?.currentFacility===fid;return {ok,text:ok?`目前位於${fn}`:`需到${fn}辦理`}}
 const lids=a.contact_location_ids||[],at=!lids.length||lids.includes(G?.character?.locationId),ok=at&&G?.character?.currentFacility===fid;
 const places=lids.slice(0,3).map(x=>(typeof loc==="function"?loc(x):find(DB.locations,x))?.name||x).join("、");
 return {ok,text:ok?"目前位於正式接觸點":`需到${places||"正式接觸地"}的${fn}辦理`}
}
function pstate(type,id){
 if(typeof globalThis.affiliationContributionProgress==="function")return globalThis.affiliationContributionProgress(type,id);
 const s=type==="organization"?orgState():disciplineState();s.contribution=s.contribution||{};return s.contribution[id]||(s.contribution[id]={total:0,balance:0,rank:0,purchases:{},commissions:{}})
}
function titles(type,a){return type==="discipline"?(DISC_TITLES[a?.track]||DISC_TITLES.physical):(ORG_TITLES[a?.category]||GENERIC)}
function explicitScale(a){
 for(const k of ["scale_tier","organization_scale_tier","discipline_scale_tier","size_tier"]){const v=String(a?.[k]||"").toUpperCase();if(R[v]!=null)return R[v]}
 const text=[a?.scale,a?.size,a?.scope,a?.jurisdiction,a?.influence_scope].filter(Boolean).join(" ").toLowerCase();
 if(/世界|world|global/.test(text))return 6;
 if(/跨國|國際|international|transnational|continental|大陸/.test(text))return 5;
 if(/國家|王國|帝國|national|kingdom|empire/.test(text))return 4;
 if(/區域|行省|省級|regional|province|provincial/.test(text))return 3;
 if(/城鎮|城市|city|town|專門/.test(text))return 2;
 if(/地方|local|郡|領地|county/.test(text))return 1;
 if(/小型|單一據點|cell|small/.test(text))return 0;
 return null
}
function scaleProfile(type,a){
 let n=explicitScale(a);
 if(n==null)n=rk(a?.tier||a?.training_tier_ceiling||"F");
 const contacts=type==="discipline"?(a?.contact_location_ids||[]).length:0;
 if(contacts>=20)n=Math.max(n,5);else if(contacts>=10)n=Math.max(n,4);else if(contacts>=5)n=Math.max(n,3);else if(contacts>=3)n=Math.max(n,2);
 n=clamp(n,0,6);
 return {...SCALE[n],index:n,maxTier:TIERS[n]}
}
function tierAt(i,count,maxRank){
 if(maxRank<=0)return "F";
 if(count<=1)return TIERS[maxRank];
 const n=Math.min(maxRank,Math.round(i*maxRank/Math.max(1,count-1)));
 return TIERS[n]
}
function archetype(type,a){
 const t=[a?.name,a?.description,a?.kind,a?.category,a?.track].filter(Boolean).join(" ");
 if(type==="discipline")return a?.track==="magic"?"magic":/盾|守|護/.test(t)?"guard":/弓|獵|霧|游/.test(t)?"ranger":"martial";
 if(a?.category==="魔法與學術"||/魔法|法師|秘術|學院|術士/.test(t))return "magic";
 if(a?.category==="軍事與武力"||/軍|守備|騎士|武力|戰團/.test(t))return "guard";
 if(a?.category==="冒險與探索"||/獵|林務|斥候|探索/.test(t))return "ranger";
 if(a?.category==="黑暗與地下"||/地下|暗|盜|密探|刺客/.test(t))return "shadow";
 if(/medical|醫|救護|治療|教會|聖/.test(t))return "medical";
 if(/craft|鍛造|工匠|工坊|煉金/.test(t))return "craft";
 if(a?.category==="商業與貿易"||/trade|商|貿易|行會|聯盟/.test(t))return "trade";
 return "martial"
}
function elementOf(a){
 const t=[a?.name,a?.description,a?.specialty].filter(Boolean).join(" ");
 for(const [re,e] of [[/光|聖/,"光"],[/暗|影|夜/,"暗"],[/火|炎|熔/,"火"],[/風|霧|嵐/,"風"],[/水|潮|海|冰|霜/,"水"],[/地|岩|石/,"地"],[/雷|電/,"雷"],[/生命|森|林|治療/,"生命"],[/死亡|死靈|亡/,"死亡"]])if(re.test(t))return e;
 return null
}
function weaponGroup(type,a,arc){
 if(type==="discipline"&&(a?.requirements?.weapon_types||[]).length){
  const x=a.requirements.weapon_types[0];
  if(/短刃/.test(x))return "匕首";if(/武士刀/.test(x))return "武士刀";if(/弓/.test(x))return "弓";if(/槍/.test(x))return "長槍";if(/斧|錘/.test(x))return "斧錘";if(/盾/.test(x))return "長劍"
 }
 if(arc==="magic"||arc==="medical")return "法杖";
 if(arc==="ranger")return "弓";
 if(arc==="shadow")return "匕首";
 return "長劍"
}
function wprof(g){
 if(g==="法杖")return {group:"法杖",range:13,armor_pen_pct:2,hands:2};
 if(g==="弓")return {group:"弓",range:26,armor_pen_pct:5,hands:2,required_dex:10};
 if(g==="長槍")return {group:"長槍",range:2.2,armor_pen_pct:7,hands:2};
 if(g==="匕首")return {group:"匕首",range:.9,armor_pen_pct:3,hands:1,required_dex:10};
 if(g==="斧錘")return {group:"斧錘",range:1.2,armor_pen_pct:6,hands:1};
 if(g==="武士刀")return {group:"長劍",range:1.25,armor_pen_pct:5,hands:2,required_dex:11};
 return {group:"長劍",range:1.2,armor_pen_pct:4,hands:1}
}
function equipmentSlots(profile){
 const all=["主武器","飾品","披風","盔甲","鞋子","頭盔","手套"];
 return all.slice(0,profile.equip)
}
function equipName(slot,arc){
 const m={
  主武器:{magic:"秘典法杖",medical:"救誓法杖",ranger:"獵行長弓",shadow:"影行短刃",guard:"守誓長劍",martial:"傳承戰刃",trade:"護商長劍",craft:"工坊戰錘"},
  飾品:{magic:"奧秘徽戒",medical:"救護誓徽",ranger:"尋跡徽記",shadow:"隱行戒印",guard:"守備徽章",martial:"傳武徽記",trade:"商旅印戒",craft:"匠師徽記"},
  披風:{magic:"星紋披風",medical:"救護披風",ranger:"尋徑披風",shadow:"無聲披風",guard:"戰團披風",martial:"行武披風",trade:"遠商披風",craft:"工坊披肩"},
  盔甲:{magic:"術式護衣",medical:"護救輕甲",ranger:"獵行皮甲",shadow:"隱行輕甲",guard:"壁壘戰甲",martial:"傳承戰甲",trade:"護商鎖甲",craft:"工坊護甲"},
  鞋子:{magic:"咒步靴",medical:"救援長靴",ranger:"追跡靴",shadow:"無聲靴",guard:"穩陣戰靴",martial:"踏陣靴",trade:"商路長靴",craft:"工坊厚靴"},
  頭盔:{magic:"秘儀頭冠",medical:"救護面罩",ranger:"遠望兜帽",shadow:"匿影兜帽",guard:"壁壘戰盔",martial:"傳武額甲",trade:"護隊盔",craft:"匠師護目盔"},
  手套:{magic:"導魔手套",medical:"精療手套",ranger:"控弦護手",shadow:"迅刃手套",guard:"握盾護手",martial:"戰技護手",trade:"護運手套",craft:"鍛作護手"}
 };
 return m[slot]?.[arc]||m[slot]?.martial||"特製裝備"
}
function equipStats(slot,arc,tier){
 const n=3+rk(tier)*4,magic=arc==="magic"||arc==="medical";
 if(slot==="主武器")return magic?{combat:{magicPower:n+4,accuracy:2+rk(tier)},advanced_combat:{manaRegen:.1+rk(tier)*.05,statusAccuracy:1+rk(tier)}}:{combat:{attack:n+4,accuracy:2+rk(tier)},advanced_combat:{initiative:1+rk(tier),armorPenPct:2+rk(tier)}};
 if(slot==="盔甲")return {combat:{defense:n+4,magicDefense:Math.max(1,Math.round(n*.45)),statusResist:1+rk(tier)},advanced_combat:{poise:3+rk(tier)*2}};
 if(slot==="頭盔")return {combat:{defense:n,magicDefense:Math.max(1,Math.round(n*.4)),statusResist:2+rk(tier)},advanced_combat:{perception:2+rk(tier)}};
 if(slot==="手套")return {combat:magic?{magicPower:Math.max(1,Math.round(n*.5)),accuracy:2+rk(tier)}:{attack:Math.max(1,Math.round(n*.5)),accuracy:2+rk(tier)},advanced_combat:{initiative:1+rk(tier)}};
 if(slot==="鞋子")return {combat:{defense:Math.max(1,Math.round(n*.55)),evasion:2+rk(tier)},advanced_combat:{moveSpeed:2+rk(tier)}};
 if(slot==="披風")return {combat:{magicDefense:Math.max(1,Math.round(n*.55)),evasion:2+rk(tier),statusResist:1+rk(tier)},advanced_combat:{stealth:arc==="shadow"||arc==="ranger"?3+rk(tier):1,perception:2+rk(tier)}};
 return {combat:magic?{magicDefense:2+rk(tier)*2,statusResist:2+rk(tier)}:{defense:2+rk(tier)*2,statusResist:2+rk(tier)},advanced_combat:{perception:1+rk(tier)}}
}
function makeEquip(type,a,profile,slot,i){
 const tier=tierAt(i,profile.equip,profile.index),arc=archetype(type,a),g=weaponGroup(type,a,arc),stats=equipStats(slot,arc,tier),prefix=`ATD-${type==="organization"?"ORG":"DISC"}-${safe(a.id)}`;
 const out={id:`${prefix}-EQ-${i+1}`,name:`${a.name}・${equipName(slot,arc)}`,tier,type:slot,weight:slot==="盔甲"?3.4:slot==="主武器"?1.8:slot==="鞋子"?.8:slot==="頭盔"?.7:slot==="披風"?.5:slot==="手套"?.4:.08,value:1,durability:85+rk(tier)*12,
  ...stats,catalog_group:slot==="主武器"?"武器":slot==="飾品"||slot==="披風"?"飾品":"防具",catalog_subcategory:"組織／流派獨有裝備",equipment_slot:slot,required_level:LEVEL[tier],rarity:"寶庫限定",
  feature:`${a.name}依自身規模與傳承製作的內部限定裝備。`,affiliation_treasury_owner:{type,id:a.id},affiliation_scale_tier:profile.tier,scale_managed:true,acquisition_sources:["affiliation_treasury"],wild_gather_eligible:false,
  treasury_rank:RANK_REQ[tier],treasury_cost:ITEM_COST[tier]+i*35,treasury_limit:1};
 if(slot==="主武器")out.weapon_profile=wprof(g);
 return out
}
function skillSuffix(arc,i){
 const pools={
  magic:["秘式射流","法環護持","奧理共鳴","封式干涉","高階術式","大師共鳴","終式顯化"],
  medical:["急救術式","護生結界","救護本能","淨化處置","高階治癒","生命守則","大師回生術"],
  guard:["先鋒擊","穩陣式","守勢本能","破勢喝止","戰團重擊","壁壘心法","統御終式"],
  ranger:["精準射擊","尋跡架勢","獵手本能","牽制射法","穿隙重射","遠望心法","終式追獵"],
  shadow:["迅影擊","無聲架勢","暗行本能","失衡干涉","影襲重擊","冷靜殺機","終式斷影"],
  trade:["護商反擊","商旅戒備","遠行本能","隊列牽制","護運重擊","行會紀律","大商路守則"],
  craft:["鍛勢重擊","工坊架勢","匠師本能","破甲敲擊","精鍛重擊","工藝心法","大師鍛勢"],
  martial:["傳承斬","應戰架勢","武門本能","破勢技","奧義重擊","傳承心法","終式奧義"]
 };
 return (pools[arc]||pools.martial)[i]||`秘傳${i+1}式`
}
function makeSkill(type,a,profile,i){
 const tier=tierAt(i,profile.skills,profile.index),arc=archetype(type,a),element=elementOf(a),id=`ATS-${type==="organization"?"ORG":"DISC"}-${safe(a.id)}-${i+1}`,name=`${a.name}・${skillSuffix(arc,i)}`,magic=arc==="magic"||arc==="medical",r=rk(tier),activeBase={id,name,tier,school:a.name,affiliation_skill_owner:{type,id:a.id},affiliation_scale_tier:profile.tier,treasury_rank:RANK_REQ[tier],treasury_cost:SKILL_COST[tier]+i*45,required_level:LEVEL[tier],max_level:10,exclusive:true,element};
 const phase=i%7;
 if(arc==="medical"){
  if(phase===0||phase===4||phase===6)return {...activeBase,kind:"輔助",display_type:"輔助",damage_type:"heal",scaling_stat:"magic",base_power_percent:112+r*8,power_growth_percent_per_level:2+r*.2,resource:"mana",resource_cost:4+r,target:"ally",effect_text:`${a.name}的限定治療術。`};
  if(phase===3)return {...activeBase,kind:"輔助",display_type:"輔助",damage_type:"cleanse",resource:"mana",resource_cost:4+r,cleanse_count:1,cleanse_exclusions:["poison","hunger","thirst","fatigue"],effect_text:"清除可淨化負面效果；不包含中毒、飢餓、口渴與疲勞。"};
  if(phase===2||phase===5)return {...activeBase,kind:"被動",display_type:"被動",manual_battle_use:false,magicDefense:2+r,statusResist:2+r,passive_growth_per_level:.015,effect_text:`${a.name}的救護訓練形成常駐防護。`};
  return {...activeBase,kind:"輔助",display_type:"輔助",damage_type:"buff",resource:"mana",resource_cost:3+r,magicDefense:2+r,statusResist:2+r,support_duration:"battle",effect_text:"提升魔法防禦與異常抗性。"}
 }
 if(phase===2||phase===5){
  const p=magic?{magicPower:2+r,magicDefense:1+r,statusResist:1+r}:{power:2+r,defense:1+r,accuracy:1+r};
  return {...activeBase,kind:"被動",display_type:"被動",manual_battle_use:false,...p,passive_growth_per_level:.015,effect_text:`${a.name}內部傳承的常駐心法。`}
 }
 if(phase===1){
  return magic?{...activeBase,kind:"輔助",display_type:"輔助",damage_type:"buff",resource:"mana",resource_cost:3+r,magicPower:2+r,magicDefense:2+r,statusResist:1+r,support_duration:"battle",effect_text:"提升魔法攻擊、魔防與異常抗性。"}:
   {...activeBase,kind:"輔助",display_type:"輔助",damage_type:"buff",resource:"stamina",resource_cost:3+r,power:2+r,defense:2+r,accuracy:1+r,support_duration:"battle",effect_text:"提升物理攻擊、防禦與命中。"}
 }
 if(phase===3){
  return {...activeBase,kind:"輔助",display_type:"輔助",damage_type:"debuff",resource:magic?"mana":"stamina",resource_cost:4+r,debuff:{accuracy:-(2+r),defense:-(2+r)},status:r>=3?"slow":null,status_chance:45+r*5,status_rounds:2,effect_text:"削弱敵方命中與防禦。"}
 }
 const high=phase===4||phase===6,base={F:100,E:110,D:122,C:136,B:152,A:172,S:196}[tier]||100;
 return {...activeBase,kind:"主動",display_type:"主動",damage_type:magic?"magic":"physical",scaling_stat:magic?"magic":"physical",base_power_percent:base+(high?12:0),power_growth_percent_per_level:2+r*.35,resource:magic?"mana":"stamina",resource_cost:Math.max(3,3+r+(high?2:0)),accuracy:high?2+r:1+r,target:"enemy",effect_text:`造成${magic?"魔法":"物理"}攻擊力百分比傷害。`}
}
let ITEM_IDS=new Set(),SKILL_IDS=new Set();
function ensureContent(){
 DB.items=Array.isArray(DB.items)?DB.items:[];DB.shared_skills=Array.isArray(DB.shared_skills)?DB.shared_skills:[];
 const itemIds=new Set(DB.items.map(x=>x?.id)),skillIds=new Set(DB.shared_skills.map(x=>x?.id)),items=[],skills=[];
 for(const [type,list] of [["organization",DB.world_organizations||[]],["discipline",DB.discipline_factions||[]]]){
  for(const a of list){
   if(!a?.id||a.joinable===false)continue;
   const profile=scaleProfile(type,a);a.treasury_scale={tier:profile.tier,label:profile.label,max_item_tier:profile.maxTier,equipment_count:profile.equip,skill_count:profile.skills,revision:REV};
   equipmentSlots(profile).forEach((slot,i)=>items.push(makeEquip(type,a,profile,slot,i)));
   for(let i=0;i<profile.skills;i++)skills.push(makeSkill(type,a,profile,i));
  }
 }
 ITEM_IDS=new Set(items.map(x=>x.id));SKILL_IDS=new Set(skills.map(x=>x.id));
 for(const x of items)if(!itemIds.has(x.id)){DB.items.push(x);itemIds.add(x.id)}
 for(const x of skills)if(!skillIds.has(x.id)){DB.shared_skills.push(x);skillIds.add(x.id)}
 for(const d of DB.items||[]){
  const owner=d?.affiliation_treasury_owner;if(!owner||ITEM_IDS.has(d.id))continue;
  const a=aff(owner.type,owner.id);if(!a)continue;
  if(/^AT-(?:ORG|DISC)-.*-(?:ACC|SIG)$/.test(String(d.id||""))){
   d.treasury_retired=true;d.treasury_retired_reason="已由規模化獨有裝備取代；既有持有品保留，不再提供新兌換。";continue
  }
  const cap=scaleProfile(owner.type,a).index;
  if(rk(d.tier)>cap)d.tier=TIERS[cap];
  d.affiliation_scale_tier=TIERS[cap]
 }
}
function ensureSources(){
 DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
 DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
 for(const id of ITEM_IDS){
  const d=find(DB.items,id),s=DB.content_link_index.item_sources[id]||{shops:[],gather_locations:[],monster_drops:[],recipe_inputs:[],recipe_outputs:[],special_sources:[]};
  for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];
  const tag=`affiliation_treasury:${d.affiliation_treasury_owner.type}:${d.affiliation_treasury_owner.id}:scale-${d.affiliation_scale_tier}`;
  if(!s.special_sources.includes(tag))s.special_sources.push(tag);DB.content_link_index.item_sources[id]=s
 }
}
function knownSkill(id){return (G?.character?.skills||[]).some(s=>(s.id||s.canonical_skill_id)===id)}
function skillStatGate(s){
 const stat=s.scaling_stat==="magic"?"智力":s.scaling_stat==="physical"?"力量":"意志",need=10+rk(s.tier)*2;
 return {stat,need,ok:Number(G?.character?.stats?.[stat]||0)>=need}
}
function skillText(s){
 if(typeof skillDescriptionText==="function")return skillDescriptionText(s);
 return s.effect_text||s.description||"組織／流派限定技能。"
}
function titleFor(type,a,rank){return titles(type,a)[rank]||GENERIC[rank]||`第${rank+1}階`}
function costWithDiscount(base,rank){const d=rank>=5?.10:rank>=3?.05:0;return Math.max(1,Math.ceil(Number(base||1)*(1-d)))}
function renderItemRow(type,id,d,p,z,c){
 const need=Number(d.treasury_rank||0),owned=Number(p.purchases?.[d.id]||0),lim=Number(d.treasury_limit||1),cost=costWithDiscount(d.treasury_cost,z.rank),ok=z.rank>=need&&owned<lim&&p.balance>=cost&&c.ok;
 const stat=typeof itemStatsText==="function"?itemStatsText(d):(d.feature||d.description||d.type);
 const reason=ok?"兌換":z.rank<need?`需職位：${titleFor(type,aff(type,id),need)}`:owned>=lim?"已達上限":p.balance<cost?`貢獻不足 ${p.balance}/${cost}`:c.text;
 return `<div class="itemrow"><span><b>${esc(d.name)}</b> <span class="tier">${esc(d.tier)}</span><br><span class="small">${stat}<br>規模層級 ${esc(d.affiliation_scale_tier||d.tier)}｜需求：${esc(titleFor(type,aff(type,id),need))}｜${cost}貢獻${lim<999?`｜${owned}/${lim}`:""}</span></span><button ${ok?"class='good'":"disabled"} onclick="exchangeAffiliationTreasuryItem('${type}','${esc(id)}','${esc(d.id)}')">${esc(reason)}</button></div>`
}
function renderSkillRow(type,id,s,p,z,c){
 const a=aff(type,id),need=Number(s.treasury_rank||0),cost=costWithDiscount(s.treasury_cost,z.rank),known=knownSkill(s.id),sg=skillStatGate(s);
 const generic=typeof skillLearningPrereqState==="function"?skillLearningPrereqState(s,{mode:"treasury",requireGuild:false}):{ok:Number(G?.character?.level||1)>=Number(s.required_level||1)&&(G?.character?.skills||[]).length<10,html:"",missing:[]};
 const curTitle=titleFor(type,a,z.rank),needTitle=titleFor(type,a,need),rankOk=z.rank>=need,statCurrent=Number(G?.character?.stats?.[sg.stat]||0),balanceOk=Number(p.balance||0)>=cost;
 const line=typeof skillPrereqCompareLine==="function"?skillPrereqCompareLine:(label,req,cur,ok,short="")=>`<span class="${ok?"ok":"bad"}">${label}：需求 ${req}｜目前 ${cur}${!ok&&short?`｜尚差 ${short}`:""}</span>`;
 const extra=[
  line("職位",needTitle,curTitle,rankOk,rankOk?"":"尚未晉升"),
  line(`${sg.stat}（基礎屬性）`,sg.need,statCurrent,sg.ok,sg.ok?"":sg.need-statCurrent),
  line("可用貢獻",cost,Number(p.balance||0),balanceOk,balanceOk?"":cost-Number(p.balance||0)),
  line("研習地點","正式據點",c.text,c.ok,c.ok?"":"需返回指定據點")
 ];
 const knownLine=line("技能狀態","尚未學會",known?"已學會":"尚未學會",!known,known?"不可重複研習":"");
 const compare=[generic.html,...extra,knownLine].filter(Boolean).join("<br>");
 const ok=!known&&generic.ok&&rankOk&&sg.ok&&balanceOk&&c.ok;
 const missing=[...generic.missing,...(!rankOk?["職位"]:[]),...(!sg.ok?[sg.stat]:[]),...(!balanceOk?["貢獻"]:[]),...(!c.ok?["研習地點"]:[]),...(known?["已學會"]:[])];
 return `<div class="itemrow"><span><b>${esc(s.name)}</b> <span class="tier">${esc(s.tier)}</span> <span class="small">獨有技能</span><br><span class="small">${skillText(s)}<br>規模層級 ${esc(s.affiliation_scale_tier)}<br><b>前置條件（角色目前狀態）</b><br>${compare}</span></span><button ${ok?"class='good'":"disabled"} onclick="learnAffiliationTreasurySkill('${type}','${esc(id)}','${esc(s.id)}')">${esc(ok?"研習":missing.join("＋"))}</button></div>`
}
function openTreasury(type,id){
 const a=aff(type,id);if(!a||!member(type,id))return alert("只有正式成員可以使用寶庫。");
 const p=pstate(type,id);p.purchases=p.purchases||{};const z={rank:Math.max(0,Math.min(5,Number(p.rank)||0))},c=contact(type,id),profile=scaleProfile(type,a);
 const owned=(DB.items||[]).filter(d=>d?.affiliation_treasury_owner?.type===type&&d.affiliation_treasury_owner.id===id&&!d.treasury_retired);
 const eq=owned.filter(d=>["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"].includes(d.type)).sort((x,y)=>rk(x.tier)-rk(y.tier)||String(x.name).localeCompare(String(y.name),"zh-Hant"));
 const supply=owned.filter(d=>!eq.includes(d)).sort((x,y)=>rk(x.tier)-rk(y.tier)||String(x.name).localeCompare(String(y.name),"zh-Hant"));
 const skills=(DB.shared_skills||[]).filter(s=>s?.affiliation_skill_owner?.type===type&&s.affiliation_skill_owner.id===id).sort((x,y)=>rk(x.tier)-rk(y.tier));
 const eqHtml=eq.map(d=>renderItemRow(type,id,d,p,z,c)).join("")||"<div class='card small'>目前沒有獨有裝備。</div>";
 const skHtml=skills.map(s=>renderSkillRow(type,id,s,p,z,c)).join("")||"<div class='card small'>目前沒有獨有技能。</div>";
 const spHtml=supply.map(d=>renderItemRow(type,id,d,p,z,c)).join("")||"<div class='card small'>目前沒有其它寶庫物資。</div>";
 showModal(`${esc(a.name)}・寶庫`,`<div class="card"><b>${esc(profile.label)}</b>｜規模層級 <span class="tier">${profile.tier}</span>｜最高寶庫層級 <span class="tier">${profile.maxTier}</span><br><span class="small">目前職位：${esc(titleFor(type,a,z.rank))}｜可用貢獻 ${p.balance}<br>此規模配置：獨有裝備 ${profile.equip} 種、獨有技能 ${profile.skills} 種。組織／流派規模越大，寶庫種類與最高層級越高；B級以上仍需高職位、角色等級與能力前置。<br>${esc(c.text)}</span></div><h3>獨有裝備</h3>${eqHtml}<h3>獨有技能</h3>${skHtml}<h3>補給／教範／其它</h3>${spHtml}<div class="actions"><button onclick="openAffiliationHub('${type}','${esc(id)}')">上一頁</button></div>`)
}
function learnSkill(type,id,skillId){
 if(!member(type,id))return;const c=contact(type,id);if(!c.ok)return alert(c.text);
 const s=find(DB.shared_skills,skillId),a=aff(type,id),p=pstate(type,id);if(!s||s.affiliation_skill_owner?.type!==type||s.affiliation_skill_owner?.id!==id)return;
 const rank=Math.max(0,Math.min(5,Number(p.rank)||0)),need=Number(s.treasury_rank||0),cost=costWithDiscount(s.treasury_cost,rank),sg=skillStatGate(s);
 if(knownSkill(skillId))return alert("已學會此獨有技能。");
 if(rank<need)return alert(`需要職位：${titleFor(type,a,need)}。`);
 if(Number(G.character.level||1)<Number(s.required_level||1))return alert(`需要角色Lv${s.required_level}。`);
 if(!sg.ok)return alert(`${sg.stat}需要${sg.need}。`);
 if((G.character.skills||[]).length>=10)return alert("技能已達10個上限，請先遺忘技能。");
 if(Number(p.balance||0)<cost)return alert("可用貢獻不足。");
 p.balance-=cost;const learned={...deep(s),type:"戰鬥",mastery:1,skillXp:0,affiliationExclusive:true};
 if(typeof normalizeSkillXp==="function")normalizeSkillXp(learned);G.character.skills.push(learned);persist();
 log("寶庫技能",`${affName(type,id)}：以${cost}貢獻研習「${s.name}」［${s.tier}］。`,"ok");openTreasury(type,id)
}
function patchSync(){
 const base=globalThis.syncRuntimeIndexesAndMetadata;if(typeof base!=="function"||base.__affTreasuryDepth)return;
 const w=function(){const out=base.apply(this,arguments);ensureSources();return out};w.__affTreasuryDepth=true;globalThis.syncRuntimeIndexesAndMetadata=w
}
function audit(){
 const issues=[],stats={organizations:0,disciplines:0,equipment:ITEM_IDS.size,skills:SKILL_IDS.size,scale_counts:{}};
 for(const [type,list] of [["organization",DB.world_organizations||[]],["discipline",DB.discipline_factions||[]]])for(const a of list){
  if(!a?.id||a.joinable===false)continue;stats[type==="organization"?"organizations":"disciplines"]++;
  const p=scaleProfile(type,a);stats.scale_counts[p.tier]=(stats.scale_counts[p.tier]||0)+1;
  const e=(DB.items||[]).filter(x=>x?.scale_managed&&x.affiliation_treasury_owner?.type===type&&x.affiliation_treasury_owner.id===a.id);
  const s=(DB.shared_skills||[]).filter(x=>x?.affiliation_skill_owner?.type===type&&x.affiliation_skill_owner.id===a.id);
  if(e.length!==p.equip)issues.push(`${a.id}:獨有裝備${e.length}/${p.equip}`);
  if(s.length!==p.skills)issues.push(`${a.id}:獨有技能${s.length}/${p.skills}`);
  if(e.some(x=>rk(x.tier)>p.index)||s.some(x=>rk(x.tier)>p.index))issues.push(`${a.id}:寶庫層級超過規模${p.tier}`)
 }
 for(const id of ITEM_IDS)if(!(DB.content_link_index?.item_sources?.[id]?.special_sources||[]).length)issues.push(`來源索引缺失:${id}`);
 const legacyActive=(DB.items||[]).filter(d=>/^AT-(?:ORG|DISC)-.*-(?:ACC|SIG)$/.test(String(d?.id||""))&&!d.treasury_retired);
 if(legacyActive.length)issues.push(`舊寶庫裝備仍可兌換:${legacyActive.slice(0,6).map(x=>x.id).join("、")}`);
 return {revision:REV,release:RELEASE,pass:issues.length===0,issues,stats}
}

DB.meta=DB.meta||{};DB.meta.affiliation_treasury_depth_revision=REV;
DB.affiliation_treasury_depth_system={version:REV,release:RELEASE,save_compatible:true,scale:SCALE.map(x=>({...x})),rules:[
 "寶庫最高層級與獨有裝備／技能數量由組織、流派規模決定。",
 "規模優先讀明確scale/size欄位，其次讀scope/jurisdiction，再以既有tier及接觸據點數保底。",
 "小型勢力不生成高階寶庫；大型、跨國與世界級勢力才可能提供B/A/S級限定內容。",
 "B級以上技能仍需職位、角色等級、能力值與技能槽前置，不因加入大型組織直接解鎖。",
 "所有獨有技能使用既有技能XP Lv1-10與Lv6/Lv10里程碑runtime。","獨有技能研習比照副職業學習逐條顯示職位、角色等級、基礎屬性、技能欄、貢獻與據點的需求／目前值。","舊版誓徽／傳承裝僅保留既有持有品，不再與規模化裝備重複供應。"
]};
if(Array.isArray(DB.integration_registry?.optimization_notes))DB.integration_registry.optimization_notes.push(`CURRENT-1.69.3／${REV}：寶庫依勢力規模擴充數種獨有裝備與技能，規模越大種類與最高層級越高。`);
ensureContent();try{if(typeof syncRuntimeIndexesAndMetadata==="function")syncRuntimeIndexesAndMetadata()}catch(e){}ensureSources();patchSync();
globalThis.openAffiliationTreasury=openTreasury;
globalThis.learnAffiliationTreasurySkill=learnSkill;
globalThis.affiliationScaleProfile=(type,id)=>{const a=aff(type,id);return a?scaleProfile(type,a):null};
globalThis.runAffiliationTreasuryDepthAudit=audit;
DB.affiliation_treasury_depth_system.initial_audit=audit();
})();
