/* 群陸旅誌：天賦深化 CURRENT-1.82.0
 * TALENT-IDENTITY-DEPTH-1.0
 * 合併高度同質天賦、建立特色軸與代價；武器專精改為實際裝備條件生效，副職業天賦改為專業差異化。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.talents))return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.82.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.82.0";
const REV="TALENT-IDENTITY-DEPTH-1.0";
const PRE_COUNT=DB.talents.length;
const uniq=a=>[...new Set(Array.isArray(a)?a:[])];

const MERGES=Object.freeze({
  "TAL-033":"TAL-041",
  "TAL-036":"TAL-066",
  "TAL-046":"TAL-045",
  "TAL-047":"TAL-045",
  "TAL-049":"TAL-045",
  "TAL-056":"TAL-016",
  "TAL-057":"TAL-019",
  "TAL-058":"TAL-017",
  "TAL-061":"TAL-018",
  "TAL-062":"TAL-052",
  "TAL-063":"TAL-041",
  "TAL-095":"TAL-094",
  "TAL-096":"TAL-094",
  "TAL-098":"TAL-097"
});

const PATCH={
  "TAL-016":{
    name:"旺盛血氣",
    description:"力量+1、體力+1；HP自然回復+0.25/時，疲勞累積降低5%。特色是長途續航，不直接提高瞬間爆發。",
    effects:{stats:{力量:1,體力:1},special:{hpRegenPerHour:.25},survival:{fatigueRate:.95}},
    identity:{signature:"用體能恢復換取長途續航。",playstyle:"適合長時間探索、連續戰鬥與缺乏休息資源的旅程。",tradeoff:"對單次爆發與命中沒有直接幫助。",distinctive_axis:"恢復—疲勞—長途"}
  },
  "TAL-017":{
    name:"輕身步法",
    description:"敏捷+1、閃避+2%、移動速度+5、先攻+2。靠位置與先手生存，而不是堆高防禦。",
    effects:{stats:{敏捷:1},combat:{evasion:2},special:{moveSpeed:5,initiative:2}},
    identity:{signature:"先移動、再避開最危險的交換。",playstyle:"偏好高速、游擊、拉開距離與搶先手。",tradeoff:"不增加護甲、格擋或生命值。",distinctive_axis:"先手—位移—迴避"}
  },
  "TAL-018":{
    name:"定心抗壓",
    description:"意志+2、異常抗性+4%、爆擊抗性+3%。重點是承受控制與突發壓力。",
    effects:{stats:{意志:2},combat:{statusResist:4},special:{critResist:3}},
    identity:{signature:"在控制與重擊壓力下維持行動。",playstyle:"適合前線、神職與需要穩定施術的角色。",tradeoff:"沒有直接輸出增幅。",distinctive_axis:"意志—抗控—抗爆"}
  },
  "TAL-019":{
    name:"魔力循環",
    description:"智力+1、意志+1、最大MP+5、MP回復+0.25/時。偏重續航而非單次法術威力。",
    effects:{stats:{智力:1,意志:1},special:{maxMana:5,manaRegen:.25}},
    identity:{signature:"把魔力池與自然回復連成穩定循環。",playstyle:"適合長戰、治療與頻繁使用低中耗魔技能。",tradeoff:"不直接增加施法爆發。",distinctive_axis:"容量—回復—續航"}
  },
  "TAL-041":{
    name:"守勢反擊",
    description:"防禦+2、格擋率+4%、格擋減傷+6%；防禦姿態承受攻擊後反擊4點傷害，攻速-0.02×。",
    effects:{combat:{defense:2,blockRate:4,attackSpeed:-.02},special:{blockValue:6,counterDamage:4}},
    identity:{signature:"用守勢換取穩定反擊窗口。",playstyle:"主動進入防守，吸收攻擊後再回敬傷害。",tradeoff:"攻擊節奏較慢，離開守勢後收益下降。",distinctive_axis:"格擋—承傷—反擊"}
  },
  "TAL-045":{
    name:"異種獵手",
    description:"感知+4；對不死、惡魔、龍與大型巨人類敵人的攻擊傷害基值+3。廣度較高，但低於單一物種極端特攻。",
    effects:{special:{perception:4},target_bonus:{categories:["不死系","惡魔與深淵地獄系","龍與亞龍爬蟲系","哥布林獸人巨人系"],name_keywords:[],damage:3}},
    identity:{signature:"用辨識危險種的知識換取跨類型獵殺能力。",playstyle:"先辨識敵種，再利用共同弱點與行動模式作戰。",tradeoff:"對一般人形與普通野獸沒有特攻。",distinctive_axis:"辨識—準備—異種"}
  },
  "TAL-052":{
    name:"施法專注",
    description:"魔法攻擊+2、詠唱速度+0.03×、異常命中+4。強調穩定完成術式與讓效果確實命中。",
    effects:{combat:{magicPower:2,castSpeed:.03},special:{statusAccuracy:4}},
    identity:{signature:"把施法精度、速度與效果命中集中在同一節奏。",playstyle:"適合法師、神職與控制型施術者。",tradeoff:"不增加MP容量與物理生存。",distinctive_axis:"詠唱—精度—術式"}
  },
  "TAL-066":{
    name:"破綻捕捉",
    description:"爆擊率+3%、爆擊傷害+10%、感知+5。強項是讀取破綻，不是無條件堆高爆傷。",
    effects:{combat:{critRate:3,critDamage:10},special:{perception:5}},
    identity:{signature:"先看懂對手，再把短暫破綻轉成爆擊。",playstyle:"適合刺客、遊俠與依靠精準窗口的混合職。",tradeoff:"不提升基本攻擊與防禦。",distinctive_axis:"觀察—破綻—爆擊"}
  },
  "TAL-076":{
    name:"爐火手感",
    description:"鍛造熟練取得+12%、成功率+6%、製作時間-3%。偏重火候穩定與失敗控制。",
    effects:{subjob:{ids:["SJ-SMITH"],xpRate:.12,success:6,timeReduction:.03}},
    identity:{signature:"穩住火候與敲擊節奏。",playstyle:"降低鍛造失敗並稍微縮短工序。",tradeoff:"熟練成長速度不如純研究型天賦。",distinctive_axis:"火候—敲擊—穩定"}
  },
  "TAL-077":{
    name:"鍛造精研",
    description:"鍛造熟練取得+20%、成功率+9%、製作時間-6%。偏重高階工序的一致性。",
    effects:{subjob:{ids:["SJ-SMITH"],xpRate:.20,success:9,timeReduction:.06}},
    identity:{signature:"用工序紀律提高高階鍛造成品率。",playstyle:"適合長期投入鍛造與批量製作。",tradeoff:"不提供野外採集或戰鬥加成。",distinctive_axis:"工序—鍛造—一致性"}
  },
  "TAL-078":{
    name:"織材巧手",
    description:"裁縫熟練取得+10%、成功率+4%、製作時間-7%。強項是快速而精準的細工。",
    effects:{subjob:{ids:["SJ-TAILOR"],xpRate:.10,success:4,timeReduction:.07}},
    identity:{signature:"以手感和裁切順序縮短細工作業。",playstyle:"更快完成布衣、皮件與輕裝製作。",tradeoff:"成功率提升低於鍛造與藥劑專精。",distinctive_axis:"裁切—縫製—速度"}
  },
  "TAL-079":{
    name:"精裁技法",
    description:"裁縫熟練取得+18%、成功率+7%、製作時間-12%。",
    effects:{subjob:{ids:["SJ-TAILOR"],xpRate:.18,success:7,timeReduction:.12}},
    identity:{signature:"把版型、受力與縫線安排成高效率流程。",playstyle:"適合大量製作輕裝與高工序衣物。",tradeoff:"不增加重裝或武器製作能力。",distinctive_axis:"版型—受力—精裁"}
  },
  "TAL-080":{
    name:"煉金感知",
    description:"智力+1；煉金熟練取得+12%、成功率+4%，採集檢定+1。特色是從素材狀態反推配比。",
    effects:{stats:{智力:1},subjob:{ids:["SJ-ALCHEMY"],xpRate:.12,success:4,timeReduction:0},action_bonus:{採集:1}},
    identity:{signature:"先辨素材狀態，再決定配比。",playstyle:"採集與煉金之間形成完整素材判讀循環。",tradeoff:"製作速度沒有額外優勢。",distinctive_axis:"素材—配比—判讀"}
  },
  "TAL-081":{
    name:"煉金解析",
    description:"煉金熟練取得+22%、成功率+7%、作業時間-5%、異常命中+2。",
    effects:{subjob:{ids:["SJ-ALCHEMY"],xpRate:.22,success:7,timeReduction:.05},special:{statusAccuracy:2}},
    identity:{signature:"理解反應原理並把藥性轉成可控效果。",playstyle:"偏研究、熟練成長與異常效果應用。",tradeoff:"製作速度只小幅提升。",distinctive_axis:"反應—解析—藥性"}
  },
  "TAL-082":{
    name:"藥劑調配",
    description:"藥劑熟練取得+12%、成功率+5%，毒素抗性+3%。熟悉劑量與污染風險。",
    effects:{subjob:{ids:["SJ-POTION"],xpRate:.12,success:5,timeReduction:0},special:{poisonResist:3}},
    identity:{signature:"以劑量與純度控制降低調配風險。",playstyle:"兼顧藥劑製作與毒性環境適應。",tradeoff:"不增加一般煉金與附魔效率。",distinctive_axis:"劑量—純度—毒性"}
  },
  "TAL-083":{
    name:"藥性調和",
    description:"藥劑熟練取得+20%、成功率+8%、製作時間-6%、治療效果+5%。",
    effects:{subjob:{ids:["SJ-POTION"],xpRate:.20,success:8,timeReduction:.06},special:{healingBonus:.05}},
    identity:{signature:"把配方穩定性與療效理解連在一起。",playstyle:"適合治療型角色兼修藥劑製作。",tradeoff:"沒有戰鬥輸出增幅。",distinctive_axis:"調和—療效—穩定"}
  },
  "TAL-084":{
    name:"附魔感知",
    description:"附魔熟練取得+12%、成功率+5%、最大MP+2。對魔力流向更敏感。",
    effects:{subjob:{ids:["SJ-ENCHANT"],xpRate:.12,success:5,timeReduction:0},special:{maxMana:2}},
    identity:{signature:"感覺魔力如何沿著裝備結構流動。",playstyle:"兼顧附魔成功率與少量魔力容量。",tradeoff:"作業速度沒有提升。",distinctive_axis:"魔力流—載體—附著"}
  },
  "TAL-085":{
    name:"附魔精研",
    description:"附魔熟練取得+20%、成功率+8%、製作時間-6%、魔法穿透+1%。",
    effects:{subjob:{ids:["SJ-ENCHANT"],xpRate:.20,success:8,timeReduction:.06},special:{magicPierce:1}},
    identity:{signature:"理解附魔如何穿過材質與抗性。",playstyle:"偏高階附魔與魔法穿透應用。",tradeoff:"不提高物理製作能力。",distinctive_axis:"刻印—材質—穿透"}
  },
  "TAL-086":{
    name:"捲軸抄寫",
    description:"智力+1；捲軸熟練取得+12%、成功率+5%、製作時間-4%。",
    effects:{stats:{智力:1},subjob:{ids:["SJ-SCROLL"],xpRate:.12,success:5,timeReduction:.04}},
    identity:{signature:"以正確筆序與術式結構降低抄寫錯誤。",playstyle:"適合學術型角色快速建立捲軸製作能力。",tradeoff:"不直接增加法術傷害。",distinctive_axis:"筆序—術式—抄寫"}
  },
  "TAL-087":{
    name:"符文筆法",
    description:"捲軸熟練取得+20%、成功率+7%、作業時間-10%；法術MP消耗-1。",
    effects:{subjob:{ids:["SJ-SCROLL"],xpRate:.20,success:7,timeReduction:.10},special:{spellCostReduction:1}},
    identity:{signature:"把符文壓縮成更省魔力的施術路徑。",playstyle:"製作捲軸同時改善日常施法資源效率。",tradeoff:"不提高法術威力或治療量。",distinctive_axis:"符文—壓縮—省魔"}
  },
  "TAL-088":{
    name:"烹飪手感",
    description:"烹飪熟練取得+10%、料理成功率+5%；飢餓累積降低5%。",
    effects:{subjob:{ids:["SJ-COOK"],xpRate:.10,success:5,timeReduction:0},survival:{hungerRate:.95}},
    identity:{signature:"懂得讓有限食材更耐吃、更穩定。",playstyle:"偏旅途補給與日常生存。",tradeoff:"不提升其他製作成功率。",distinctive_axis:"火候—營養—補給"}
  },
  "TAL-089":{
    name:"旅廚技法",
    description:"烹飪熟練取得+18%、成功率+7%、料理時間-10%；飢餓累積降低10%、疲勞累積降低3%。",
    effects:{subjob:{ids:["SJ-COOK"],xpRate:.18,success:7,timeReduction:.10},survival:{hungerRate:.90,fatigueRate:.97}},
    identity:{signature:"把料理變成長途隊伍的補給管理。",playstyle:"適合長距離探索與頻繁露營。",tradeoff:"對短戰與瞬間輸出沒有幫助。",distinctive_axis:"料理—補給—旅途"}
  },
  "TAL-090":{
    name:"醫術直覺",
    description:"醫術熟練取得+15%、治療效果+5%；以快速判斷傷勢為強項。",
    effects:{subjob:{ids:["SJ-MEDIC"],xpRate:.15,success:0,timeReduction:0},special:{healingBonus:.05}},
    identity:{signature:"先判斷傷勢優先序，再投入有限治療資源。",playstyle:"偏救急、治療與隊伍續航。",tradeoff:"不提升攻擊或製作速度。",distinctive_axis:"診斷—救急—治療"}
  },
  "TAL-091":{
    name:"戰地醫術",
    description:"醫術熟練取得+25%、治療效果+10%、異常抗性+2%。能在壓力下維持救治。",
    effects:{subjob:{ids:["SJ-MEDIC"],xpRate:.25,success:0,timeReduction:0},special:{healingBonus:.10},combat:{statusResist:2}},
    identity:{signature:"在危險環境中保持治療效率。",playstyle:"前線救急與持續支援。",tradeoff:"個人輸出提升很低。",distinctive_axis:"前線—救急—穩定"}
  },
  "TAL-092":{
    name:"修理巧手",
    description:"修理熟練取得+15%；具備修理副職業時裝備磨耗降低15%。",
    effects:{subjob:{ids:["SJ-REPAIR"],xpRate:.15,success:0,timeReduction:0,durabilityLossReduction:.15}},
    identity:{signature:"從磨痕提早看出裝備失效徵兆。",playstyle:"降低長途冒險的裝備消耗。",tradeoff:"不增加新裝備的製作成功率。",distinctive_axis:"磨耗—保養—壽命"}
  },
  "TAL-093":{
    name:"裝備維護",
    description:"修理熟練取得+25%；裝備磨耗降低25%、修理費-15%。",
    effects:{subjob:{ids:["SJ-REPAIR"],xpRate:.25,success:0,timeReduction:0,durabilityLossReduction:.25,serviceDiscount:.15}},
    identity:{signature:"把保養、修復與成本控制整合成長期維護。",playstyle:"高頻戰鬥與長途旅行的經濟型天賦。",tradeoff:"不直接提升戰鬥數值。",distinctive_axis:"維護—耐久—成本"}
  },
  "TAL-094":{
    name:"工坊通才",
    description:"所有已取得副職業熟練取得+6%、製作成功率+2%、作業時間-3%。廣而不深。",
    effects:{subjob:{all:true,xpRate:.06,success:2,timeReduction:.03}},
    identity:{signature:"快速理解不同工坊的共同流程。",playstyle:"適合多副職業角色，提供低幅度全面效率。",tradeoff:"任何單一專業都弱於專門天賦。",distinctive_axis:"通才—流程—適應"}
  },
  "TAL-097":{
    name:"野外取材",
    description:"所有已取得副職業熟練取得+5%；採集檢定+2、打獵檢定+1。重點是把野外資源帶回製作循環。",
    effects:{subjob:{all:true,xpRate:.05},action_bonus:{採集:2,打獵:1}},
    identity:{signature:"辨認可採、可用、值得帶走的素材。",playstyle:"探索與製作之間的橋接型天賦。",tradeoff:"工坊內成功率沒有直接提升。",distinctive_axis:"辨材—採集—製作"}
  },
  "TAL-099":{
    name:"水域採獵",
    description:"釣魚檢定+3、打獵檢定+1；專長集中在水岸與漁獵。",
    effects:{action_bonus:{釣魚:3,打獵:1}},
    identity:{signature:"讀水勢、魚訊與岸邊獸跡。",playstyle:"水岸探索與食材取得。",tradeoff:"離開水域後大部分優勢消失。",distinctive_axis:"水勢—魚訊—岸獵"}
  }
};

const merged=new Set(Object.keys(MERGES));
DB.talents=DB.talents.filter(t=>t&&!merged.has(t.id)).map(t=>{
  const patch=PATCH[t.id]||{};
  const out={...t,...patch};
  out.effects=patch.effects?JSON.parse(JSON.stringify(patch.effects)):JSON.parse(JSON.stringify(t.effects||{}));
  const weaponGroups=t.preferred?.weapon_groups;
  const baseIdentity={
    signature:String(out.description||"").split("。")[0]||out.name,
    playstyle:out.category==="角色能力"?"塑造角色基礎傾向，讓能力配置形成明確長項。":
      out.category==="戰鬥專精"?"改變角色在戰鬥中的優先行動與交換方式。":
      out.category==="戰鬥素質"?"強化特定戰鬥情境，而非無條件提高所有數值。":
      "改變專業工作的效率、風險或旅途循環。",
    tradeoff:out.category==="角色能力"?"占用有限天賦槽，無法同時取得所有能力傾向。":
      out.category==="副職業專精"?"專業越集中，對其他副職業的幫助越有限。":
      "只在符合其戰術情境時最有價值。",
    distinctive_axis:out.exclusive_group||out.category
  };
  out.identity={...baseIdentity,...(patch.identity||out.identity||{})};
  if(Array.isArray(weaponGroups)&&weaponGroups.length){
    out.identity.activation={weapon_groups:[...weaponGroups]};
    out.identity.tradeoff="只有實際裝備對應武器群時，戰鬥效果才生效。";
    out.identity.distinctive_axis="武器條件—"+weaponGroups.join("／");
  }
  return out;
});

const byId=new Map(DB.talents.map(t=>[t.id,t]));
const evolutions={
  "TAL-001":"TAL-070","TAL-002":"TAL-072","TAL-003":"TAL-071","TAL-010":"TAL-073","TAL-011":"TAL-074",
  "TAL-016":"TAL-067","TAL-017":"TAL-034","TAL-019":"TAL-068","TAL-029":"TAL-041","TAL-094":"TAL-100",
  "TAL-076":"TAL-077","TAL-078":"TAL-079","TAL-080":"TAL-081","TAL-082":"TAL-083","TAL-084":"TAL-085",
  "TAL-086":"TAL-087","TAL-088":"TAL-089","TAL-090":"TAL-091","TAL-092":"TAL-093"
};
for(const [from,to] of Object.entries(evolutions)){
  if(byId.has(from)&&byId.has(to)){
    byId.get(from).evolution_to=to;
    byId.get(to).evolution_from=from;
  }
}

DB.talent_merge_map={...(DB.talent_merge_map||{}),...MERGES};
DB.talent_system=DB.talent_system&&typeof DB.talent_system==="object"?DB.talent_system:{};
DB.talent_system.version=REV;
DB.talent_system.core_count=DB.talents.length;
DB.talent_system.category_counts=DB.talents.reduce((m,t)=>(m[t.category]=(m[t.category]||0)+1,m),{});
DB.talent_system.merge_map={...MERGES};
DB.talent_system.depth_fields=["signature","playstyle","tradeoff","distinctive_axis","activation","evolution_to","evolution_from"];
DB.talent_system.selection_rule="依種族、職業、實際武器傾向、出身與副職業建立候選池；同exclusive_group不重複抽取。";
DB.talent_system.rules=[
  "天賦數量不再以湊滿100筆為目標；只有能形成不同玩法、條件、代價或成長路線的項目才保留為canonical天賦。",
  "高度同質的格擋、爆擊、恢復、移動、異種特攻與通用工坊效率天賦已合併；舊TAL-ID透過merge map遷移。",
  "武器專精必須以角色目前實際裝備的武器群為生效條件，換武器會同步失去或恢復該專精效果。",
  "副職業天賦必須呈現專業差異：鍛造重穩定、裁縫重效率、煉金重素材與藥性、藥劑重調和、附魔重魔力流、捲軸重術式、料理重補給、醫術重救急、修理重耐久。",
  "同一成長線的E級與D級天賦以evolution_from/evolution_to連結，視為進階而不是重複項。",
  "每個canonical天賦都必須有signature、playstyle、tradeoff與distinctive_axis；不得只換名稱後複製攻防百分比。",
  "角色仍最多持有2個天賦；合併造成舊存檔天賦重疊時，runtime會去重並補足合法候選。",
  "天賦不得直接授予高階職業、B級以上裝備、世界主線資格或憑空生成材料。"
];

DB.meta=DB.meta||{};
DB.meta.talent_revision=REV;
DB.meta.talent_depth_revision=REV;
DB.meta.talent_overhaul=DB.talents.length+" canonical talents with identity, merge migration, weapon activation and profession differentiation";
DB.hard_rules=DB.hard_rules||{};
DB.hard_rules.talent_core_count=DB.talents.length;
DB.hard_rules.talent_identity_required=true;
DB.hard_rules.talent_weapon_specialization_requires_equipped_weapon=true;
DB.hard_rules.talent_no_padding_for_count=true;
if(DB.system_audit_registry?.hard_targets)DB.system_audit_registry.hard_targets.talent_count=DB.talents.length;
if(DB.system_audit_registry?.fixes)DB.system_audit_registry.fixes.talent_core_restructured=DB.talents.length;

function fingerprint(t){
  const e=t.effects||{};
  return JSON.stringify({
    category:t.category,tier:t.tier,effects:e,
    activation:t.identity?.activation||null,
    required:t.required||null
  });
}
function audit(){
  const issues=[];
  const ids=new Set(),names=new Set(),fps=new Map();
  if(PRE_COUNT<100)issues.push("深化前天賦基準不足100筆:"+PRE_COUNT);
  if(DB.talents.length!==86)issues.push("合併後canonical天賦數應為86，實際"+DB.talents.length);
  for(const oldId of Object.keys(MERGES))if(DB.talents.some(t=>t.id===oldId))issues.push("已合併天賦仍存在:"+oldId);
  for(const [oldId,newId] of Object.entries(MERGES))if(!byId.has(newId))issues.push("舊天賦映射目標不存在:"+oldId+"->"+newId);
  for(const t of DB.talents){
    if(!t?.id){issues.push("天賦缺ID");continue}
    if(ids.has(t.id))issues.push("天賦ID重複:"+t.id);ids.add(t.id);
    if(names.has(t.name))issues.push("天賦名稱重複:"+t.name);names.add(t.name);
    for(const k of ["signature","playstyle","tradeoff","distinctive_axis"])if(!String(t.identity?.[k]||"").trim())issues.push(t.id+"缺少特色欄位:"+k);
    const fp=fingerprint(t);
    if(fps.has(fp))issues.push("仍有完全同質天賦:"+fps.get(fp)+" / "+t.id); else fps.set(fp,t.id);
    if(t.preferred?.weapon_groups?.length&&!t.identity?.activation?.weapon_groups?.length)issues.push("武器專精未設定裝備條件:"+t.id);
  }
  const cats=DB.talent_system.category_counts||{};
  for(const name of ["角色能力","戰鬥專精","戰鬥素質","副職業專精"])if(!(cats[name]>0))issues.push("天賦分類缺失:"+name);
  const starter=DB.talents.filter(t=>t.starter_eligible!==false);
  if(starter.length<30)issues.push("創角天賦候選過少:"+starter.length);
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{previous_count:PRE_COUNT,canonical_count:DB.talents.length,merged_count:Object.keys(MERGES).length,starter_count:starter.length,categories:{...cats},identity_coverage:DB.talents.filter(t=>t.identity).length}};
}

globalThis.canonicalTalentId=id=>DB.talent_merge_map?.[id]||id;
globalThis.runTalentIdentityDepthAudit=audit;
globalThis.QUNLU_TALENT_IDENTITY=Object.freeze({revision:REV,release:RELEASE,audit:audit()});
DB.talent_identity_system={version:REV,release:RELEASE,canonical_count:DB.talents.length,merged_count:Object.keys(MERGES).length,merge_map:{...MERGES},save_compatible:true,initial_audit:audit()};
CORE?.registerModule?.("src/talent-identity-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();