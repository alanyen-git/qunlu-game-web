/* 群陸旅誌：裝備能力／職業綜合適性 EQUIPMENT-ELIGIBILITY-2.0
 * required_level 僅作建議；明文指定屬性、職業與專屬封印不打折。
 */
(()=>{
"use strict";
const REV="EQUIPMENT-ELIGIBILITY-2.0",GRADE={F:0,E:1,D:2,C:3,B:4,A:5,S:6},BASE={F:0,E:10,D:12,C:14,B:16,A:18,S:20};
const num=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const list=x=>Array.isArray(x)?x:(x==null||x===""?[]:[x]);
const rank=x=>GRADE[String(x||"F").toUpperCase()]??0;
const label=x=>x==="體力"?"體質":x;
function profile(d){
 const kind=[d.weapon_profile?.group,d.catalog_subcategory,d.name].filter(Boolean).join(" ");
 const weight=num(d.weight),hands=num(d.weapon_profile?.hands,1);
 if(d.catalog_subcategory==="盾牌")return {main:"力量",secondary:weight>=3?"體力":null,heavy:weight>=3,kind:"盾牌"};
 if(d.type==="主武器"){
  if(/法杖|魔杖|權杖|法器|祈禱杖|秘杖/.test(kind))return {main:"智力",secondary:"意志",kind:"法杖"};
  if(/弓|弩/.test(kind))return {main:"敏捷",secondary:weight>=3?"力量":null,kind:"弓弩"};
  if(/匕首|細劍|短劍|飛刀/.test(kind))return {main:"敏捷",kind:"輕刃"};
  if(/武士刀/.test(kind))return {main:"敏捷",secondary:"力量",kind:"武士刀"};
  if(/長槍|槍|矛|戟/.test(kind))return {main:"力量",secondary:"敏捷",kind:"長柄"};
  if(/大劍|巨劍|巨斧|戰鎚|戰錘|重錘|重斧/.test(kind)||weight>=3.5)
   return {main:"力量",secondary:"體力",heavy:true,kind:"重型武器"};
  return {main:"力量",kind:hands>=2?"雙手武器":"近戰武器"};
 }
 if(d.type==="盔甲"){
  if(/法袍|法衣|祭袍|祈誓/.test(kind)||weight<=1.4&&num(d.combat?.magicDefense)>num(d.combat?.defense))
   return {main:"意志",secondary:num(d.combat?.magicPower)>0?"智力":null,kind:"法衣"};
  if(/重甲|板甲|重鎧|壁甲|戰甲/.test(kind)||weight>=4)
   return {main:"力量",secondary:"體力",heavy:true,kind:"重甲"};
  return {main:"體力",kind:"護甲"};
 }
 if(["頭盔","手套","鞋子"].includes(d.type))return weight>=2.5?{main:"力量",kind:"重型護具"}:null;
 if(["披風","飾品"].includes(d.type)){
  const arcane=num(d.combat?.magicPower)>0||num(d.combat?.magicDefense)>0||
   num(d.advanced_combat?.manaRegen)>0||num(d.advanced_combat?.healingPower)>0||
   Object.values(d.element_resistances||{}).some(x=>num(x)>0);
  return arcane&&rank(d.tier)>=2?{main:"意志",kind:"魔法飾物"}:null;
 }
 return null;
}
function affinity(d,p,cl){
 if(!p||!cl)return false;
 const weapon=String(cl.weapon_group||cl.combat_identity?.weapon_identity||"");
 const role=String(cl.name||"")+" "+String(cl.combat_identity?.family||"")+" "+String(cl.category||"");
 if(d.type==="主武器"||d.catalog_subcategory==="盾牌"){
  const group=String(d.weapon_profile?.group||"");
  if(group&&weapon.includes(group))return true;
  const words={
   法杖:["法杖","魔杖","權杖"],弓弩:["弓","弩"],輕刃:["匕首","短劍","細劍","雙刃"],
   武士刀:["武士刀","東方","刀"],長柄:["長槍","槍","矛","戟"],
   重型武器:["大劍","巨劍","巨斧","斧","錘","鎚"],雙手武器:["雙手","大劍","長劍"],
   近戰武器:["長劍","單手","劍","斧","錘","鎚"],盾牌:["盾"]
  }[p.kind]||[];
  return words.some(w=>weapon.includes(w))||
   p.kind==="法杖"&&/法師|術士|牧師|賢者|祭司/.test(role)&&/杖|法器/.test(weapon);
 }
 if(p.kind==="重甲"||p.kind==="重型護具")return /戰士|盾|騎士|守衛|重裝/.test(role);
 if(p.kind==="法衣")return /法師|術士|牧師|祭司|賢者|療術/.test(role);
 if(p.kind==="護甲")return /戰士|遊俠|獵人|騎士|守衛|斥候/.test(role);
 return false;
}
function evaluate(d,opt={}){
 const c=opt.character||{},cl=opt.classRow||null;
 const read=typeof opt.statValue==="function"?opt.statValue:k=>num(c.stats?.[k]);
 const checks=[],add=(name,need,current,ok,shortfall="")=>checks.push({label:name,need,current,ok:!!ok,shortfall:ok?"":String(shortfall||"")});
 if(!d)return {ok:false,checks:[{label:"物品",need:"有效裝備",current:"資料不存在",ok:false,shortfall:"重新開啟背包"}],missing:["物品"],reason:"裝備資料不存在"};
 if(num(d.required_level)>1)add("建議等級（非限制）","Lv"+d.required_level,"Lv"+(c.level||1)+"；僅供強度參考",true);
 const p=profile(d),base=BASE[String(d.tier||"F").toUpperCase()]??0,fit=affinity(d,p,cl);
 const mastery=Math.max(0,num(c.classMastery));
 const training=fit?(1+(mastery>=40?1:0)+(mastery>=75?1:0)+(rank(c.combatGrade)>=rank(d.tier)?1:0)):0;
 if(p)add("職業／熟練適性","對應專長可降低推定能力需求",fit?
  "專長相符・熟練"+mastery.toFixed(0)+"%（需求-"+training+"）":"跨職使用・依完整能力值判定",true);
 const stats={};
 if(p&&base>0){
  stats[p.main]=Math.max(8,base+(p.heavy?2:0)-training);
  if(p.secondary)stats[p.secondary]=Math.max(8,base-2+(p.heavy?1:0)-training);
 }
 for(const [k,v] of Object.entries(d.required_stats||{}))stats[k]=Math.max(num(stats[k]),num(v));
 for(const [s,v] of Object.entries(stats)){
  const need=Math.max(0,Math.ceil(v)),current=num(read(s));
  add(label(s),need,current,current>=need,current>=need?"":need-current);
 }
 const classes=list(d.required_class_ids||d.required_classes||d.required_class);
 if(classes.length){
  const candidates=[c.classId,cl?.id,cl?.name,...list(cl?.merged_legacy_ids)];
  const ok=classes.some(k=>candidates.includes(k));
  add("指定職業",classes.join("／"),cl?.name||c.classId||"未就職",ok,"需要對應職業資格");
 }
 if(d.required_combat_grade){
  const ok=rank(c.combatGrade)>=rank(d.required_combat_grade);
  add("戰鬥職業階級",d.required_combat_grade,c.combatGrade||"F",ok,"提升戰鬥職業階級");
 }
 if(d.required_mastery!=null){
  const need=num(d.required_mastery),ok=mastery>=need;
  add("指定職業熟練",need+"%",mastery+"%",ok,(need-mastery)+"%");
 }
 const races=list(d.required_race_ids||d.required_races);
 if(races.length)add("種族資格",races.join("／"),c.raceId||"未知",races.includes(c.raceId),"需要對應種族");
 const talents=list(d.required_talent_ids||d.required_talents);
 if(talents.length){
  const missing=talents.filter(t=>!list(c.talents).includes(t));
  add("指定天賦",talents.join("／"),missing.length?"尚缺 "+missing.join("、"):"已具備",!missing.length,"取得所需天賦");
 }
 if(d.sealed&&rank(d.tier)>=4){
  const freed=list(c.unsealedEquipmentIds).includes(d.id)||list(c.equipmentAttunements).includes(d.id);
  add("裝備解封","取得裝備的解封／認主資格",freed?"已解封":"尚未解封",freed,"完成裝備專屬解封");
 }
 const missing=checks.filter(x=>!x.ok);
 return {ok:missing.length===0,checks,missing:missing.map(x=>x.label),
  reason:missing.length?"需要"+missing[0].label+"："+missing[0].need+"（目前"+missing[0].current+"）":"",
  profile:p,affinity:fit,training};
}
function summary(d){
 if(!d)return "";
 const p=profile(d),base=BASE[String(d.tier||"F").toUpperCase()]??0,hints=[];
 if(p&&base>0)hints.push("能力基準："+label(p.main)+(base+(p.heavy?2:0))+
   (p.secondary?"、"+label(p.secondary)+(base-2+(p.heavy?1:0)):"")+"（專長可降低）");
 const fixed=Object.entries(d.required_stats||{}).map(([k,v])=>label(k)+v);
 if(fixed.length)hints.push("固定能力要求："+fixed.join("、"));
 if(list(d.required_class_ids||d.required_classes||d.required_class).length)hints.push("限定職業資格");
 if(d.required_combat_grade)hints.push("職業階級："+d.required_combat_grade+"級");
 if(d.sealed&&rank(d.tier)>=4)hints.push("需專屬解封");
 return hints.join("｜");
}
if(globalThis.DB&&typeof DB==="object"){
 DB.meta=DB.meta||{};DB.meta.equipment_eligibility_revision=REV;
 DB.equipment_eligibility_system={revision:REV,level_role:"advisory_only",base_ability_by_tier:BASE,
  training:"職業專長、職業熟練度、職業階級僅降低推定需求；固定要求和專屬資格不可折抵",
  special_locks:["required_class_ids","required_combat_grade","required_mastery","required_race_ids","required_talent_ids","sealed"],save_compatible:true};
}
globalThis.QUNLU_EQUIPMENT_RULES=Object.freeze({revision:REV,profile,affinity,evaluate,summary});
globalThis.QUNLU_CORE?.registerModule?.("src/equipment-eligibility-v2.js",{domain:"data",revision:REV});
})();