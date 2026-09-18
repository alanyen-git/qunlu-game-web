(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const REV="AFFILIATION-CONTRIBUTION-1.0", RELEASE="CURRENT-1.69.0";
const THRESH=[0,80,220,500,950,1600];
const TIER_RANK={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const DON_BASE={F:2,E:4,D:8,C:16,B:32,A:56,S:90};
const QUEST_REWARD={F:18,E:26,D:38,C:54,B:76,A:104,S:140};
const ORG_TITLES={
 "冒險與探索":["協力成員","正式幹員","資深幹員","分隊長","地區執事","評議員"],
 "軍事與武力":["新進隊員","正式隊員","精銳隊員","小隊長","戰團官","指揮議席"],
 "黑暗與地下":["外圍聯絡人","許可成員","內線幹員","執行者","掌事","核心座席"],
 "商業與貿易":["學徒會員","正式會員","資深會員","行會幹事","商站主管","理事"],
 "魔法與學術":["見習研究員","正式研究員","資深研究員","導師","首席研究員","評議員"],
 "王權／種族／職人":["協力成員","正式成員","資深成員","執事","地區代表","核心議員"]
};
const DISC_TITLES={
 physical:["外門門人","正式門人","內門門人","教習","師範","傳承席"],
 magic:["見習學員","正式學員","研究門人","導師","首席導師","傳承議席"]
};
const GENERIC=["見習成員","正式成員","資深成員","幹事","地區主管","核心議席"];
const TOKENS=["火","炎","雷","風","水","潮","冰","霜","土","岩","光","聖","暗","影","毒","霧","林","獸","龍","星","月","王冠","灰門","赤岩","鐵","鋼","秘銀","弓","劍","槍","盾","斧","錘","煉金","治療","藥","魔法","符文","狩獵","守備","護衛","工匠","商","糧","海","山"];

const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const tierRank=t=>TIER_RANK[String(t||"F")]??0;
const find=(a,id)=>(a||[]).find(x=>x?.id===id)||null;
const orgBy=id=>typeof worldOrg==="function"?worldOrg(id):find(DB.world_organizations,id);
const discBy=id=>typeof disciplineFor==="function"?disciplineFor(id):find(DB.discipline_factions,id);
const itemBy=id=>typeof item==="function"?item(id):find(DB.items,id);
const aff=(type,id)=>type==="organization"?orgBy(id):discBy(id);
const affName=(type,id)=>aff(type,id)?.name||id;

function isMember(type,id){
 try{return type==="organization"?orgState().membershipId===id:disciplineState().membershipId===id}catch(e){return false}
}
function store(type){
 if(!G?.character)return {};
 const s=type==="organization"?orgState():disciplineState();
 s.contribution=s.contribution&&typeof s.contribution==="object"?s.contribution:{};
 return s.contribution
}
function progress(type,id){
 const s=store(type),p=s[id]&&typeof s[id]==="object"?s[id]:(s[id]={});
 p.total=Math.max(0,Math.floor(Number(p.total)||0));
 p.balance=Math.max(0,Math.floor(Number(p.balance)||0));
 p.rank=Math.max(0,Math.min(5,Math.floor(Number(p.rank)||0)));
 p.purchases=p.purchases&&typeof p.purchases==="object"?p.purchases:{};
 p.commissions=p.commissions&&typeof p.commissions==="object"?p.commissions:{};
 return p
}
function titles(type,a){
 return type==="discipline"?(DISC_TITLES[a?.track]||DISC_TITLES.physical):(ORG_TITLES[a?.category]||GENERIC)
}
function pos(type,id){
 const a=aff(type,id),p=progress(type,id),ts=titles(type,a),r=Math.min(5,p.rank);
 return {rank:r,title:ts[r]||GENERIC[r],nextTitle:ts[r+1]||null,next:THRESH[r+1]??null}
}
function contact(type,id){
 const a=aff(type,id),fid=a?.primary_facility,fn=DB.facilities?.[fid]?.name||fid||"指定據點";
 if(!a)return {ok:false,text:"資料不存在"};
 if(type==="organization"){
  const ok=G?.character?.currentFacility===fid;
  return {ok,text:ok?`目前位於${fn}`:`需到${fn}辦理`}
 }
 const lids=a.contact_location_ids||[],at=!lids.length||lids.includes(G?.character?.locationId);
 const ok=at&&G?.character?.currentFacility===fid;
 const places=lids.slice(0,3).map(x=>(typeof loc==="function"?loc(x):find(DB.locations,x))?.name||x).join("、");
 return {ok,text:ok?"目前位於正式接觸點":`需到${places||"正式接觸地"}的${fn}辦理`}
}
function grant(type,id,n,why){
 if(!isMember(type,id))return 0;
 n=Math.max(0,Math.floor(Number(n)||0));if(!n)return 0;
 const p=progress(type,id);p.total+=n;p.balance+=n;
 if(typeof persist==="function")persist();
 if(typeof log==="function")log(type==="organization"?"組織貢獻":"流派貢獻",`${affName(type,id)}：${why||"貢獻"} +${n}（可用 ${p.balance}／累積 ${p.total}）。`,"ok");
 return n
}

function kind(d){
 if(!d)return "其他";
 if(d.catalog_group==="武器"||d.type==="主武器"||d.kind==="weapon")return "武器";
 if(d.catalog_group==="防具"||["盔甲","頭盔","手套","鞋子","盾牌"].includes(d.type)||d.kind==="armor")return "防具";
 if(d.catalog_group==="飾品"||["飾品","披風"].includes(d.type))return "飾品";
 if(d.type==="藥劑"||d.kind==="consumable"||d.consumable_group)return "藥劑";
 if(["卷軸","符文","書籍"].includes(d.type)||d.knowledge_tag)return "知識";
 if(["素材","草藥素材","工藝素材","礦石","魔物素材","寶石素材"].includes(d.type)||d.kind==="material"||d.material_group)return "素材";
 if(["補給","工具","道具"].includes(d.type)||d.kind==="tool"||d.tool_effect)return "工具";
 if(["料理","食物","食材"].includes(d.type)||d.kind==="food"||["食物","食材"].includes(d.inventory_group))return "食物";
 return d.type||d.kind||"其他"
}
function canDonate(type,a,d){
 if(!d||d.affiliation_treasury_owner||["鑰匙","任務"].includes(d.type)||["key_item","quest"].includes(d.kind))return false;
 const k=kind(d);
 if(type==="discipline")return a?.track==="magic"?["武器","防具","飾品","藥劑","知識","素材","工具"].includes(k):["武器","防具","飾品","藥劑","素材","工具","食物"].includes(k);
 if(a?.category==="商業與貿易")return Number(d.value??d.price??0)>0&&k!=="其他";
 if(a?.category==="軍事與武力")return ["武器","防具","飾品","藥劑","素材","工具","食物"].includes(k);
 if(a?.category==="魔法與學術"||a?.category==="黑暗與地下")return ["武器","防具","飾品","藥劑","知識","素材","工具"].includes(k);
 return ["武器","防具","飾品","藥劑","知識","素材","工具","食物"].includes(k)
}
function distinctive(type,a,d){
 const at=[a?.name,a?.description,a?.specialty,a?.institutional_culture,a?.kind,a?.category,a?.family,(a?.requirements?.weapon_types||[]).join(" ")].filter(Boolean).join(" ");
 const it=[d?.name,d?.type,d?.catalog_subcategory,d?.material,d?.material_group,d?.feature,d?.description,d?.weapon_profile?.group].filter(Boolean).join(" ");
 if(TOKENS.some(t=>at.includes(t)&&it.includes(t)))return true;
 const k=kind(d);
 if(type==="organization"){
  if(a?.category==="軍事與武力"&&["武器","防具"].includes(k))return true;
  if(a?.category==="魔法與學術"&&["藥劑","知識"].includes(k))return true;
  if(String(a?.kind||"")==="medical"&&k==="藥劑")return true;
  if(String(a?.kind||"")==="craft"&&["素材","工具"].includes(k))return true
 }else{
  if(k==="武器"&&(a?.requirements?.weapon_types||[]).some(w=>it.includes(w)))return true;
  if(a?.track==="magic"&&["知識","藥劑"].includes(k))return true
 }
 return false
}
function donationValue(type,a,d){
 const base=DON_BASE[d?.tier]||2,econ=Math.min(12,Math.floor(Math.sqrt(Math.max(0,Number(d?.value??d?.price??0)))/3));
 return Math.max(1,base+econ)*(distinctive(type,a,d)?2:1)
}
function stableHash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(a,s){return a.length?a[stableHash(s)%a.length]:null}

function affTier(a){
 const t=a?.tier||a?.training_tier_ceiling;if(TIER_RANK[t]!=null)return tierRank(t)>4?"B":t;
 const lv=Number(a?.min_join_level||a?.min_level||1);return lv>=50?"B":lv>=35?"C":lv>=20?"D":lv>=8?"E":"F"
}
function weaponProfile(group){
 if(/法杖|杖/.test(group))return {group:"法杖",range:13,armor_pen_pct:2,hands:2};
 if(/弓/.test(group))return {group:"弓",range:26,armor_pen_pct:5,hands:2,required_dex:10};
 if(/槍/.test(group))return {group:"長槍",range:2.2,armor_pen_pct:7,hands:2};
 if(/匕|短刃/.test(group))return {group:"匕首",range:.9,armor_pen_pct:3,hands:1,required_dex:10};
 if(/斧|錘/.test(group))return {group:"斧錘",range:1.2,armor_pen_pct:6,hands:1};
 return {group:"長劍",range:1.2,armor_pen_pct:4,hands:1}
}
function treasury(type,a){
 const t=affTier(a),r=tierRank(t),base=4+r*4,prefix=(type==="organization"?"ORG":"DISC")+"-"+String(a.id).replace(/[^A-Za-z0-9-]/g,"-").slice(0,55);
 const magical=type==="discipline"?a.track==="magic":a.category==="魔法與學術";
 const group=magical?"法杖":(a?.requirements?.weapon_types?.[0]||(/弓|射手/.test(a.name||"")?"弓":"長劍"));
 const common={tier:t,value:1,affiliation_treasury_owner:{type,id:a.id},acquisition_sources:["affiliation_treasury"],wild_gather_eligible:false};
 const signatureType=(type==="organization"&&a.category==="冒險與探索")?"披風":(type==="organization"&&a.category==="王權／種族／職人")?"盔甲":"主武器";
 const sig={...common,id:`AT-${prefix}-SIG`,name:`${a.name}・傳承裝`,type:signatureType,weight:signatureType==="盔甲"?3.2:signatureType==="披風"?.5:1.7,durability:90+r*10,
  combat:magical?{magicPower:base+5,magicDefense:Math.max(2,Math.round(base*.5)),statusResist:Math.max(1,Math.round(base*.3))}:{attack:base+5,defense:Math.max(1,Math.round(base*.35)),accuracy:Math.max(1,Math.round(base*.35))},
  advanced_combat:magical?{manaRegen:.2+r*.05,statusAccuracy:2+r}:{initiative:2+r,armorPenPct:2+r},
  catalog_group:signatureType==="主武器"?"武器":signatureType==="披風"?"飾品":"防具",catalog_subcategory:"勢力／流派寶庫特有",equipment_slot:signatureType,required_level:{F:1,E:8,D:20,C:35,B:50}[t]||1,rarity:"寶庫限定",feature:`${a.name}內部寶庫限定裝備。`,treasury_rank:4,treasury_cost:650,treasury_limit:1};
 if(signatureType==="主武器")sig.weapon_profile=weaponProfile(group);
 return [
  {...common,id:`AT-${prefix}-SUP`,name:`${a.name}・行旅補給`,type:"補給",weight:.25,use:{stamina:8+r*3,hunger:-8,thirst:-10},treasury_rank:0,treasury_cost:20,treasury_limit:999,description:`${a.name}成員標準補給。`},
  {...common,id:`AT-${prefix}-POT`,name:`${a.name}・秘製藥劑`,type:"藥劑",weight:.12,use:magical?{mana:18+r*8,hp:8+r*4}:{hp:20+r*8,stamina:8+r*3},toxicity:4,treasury_rank:1,treasury_cost:55,treasury_limit:999,description:`${a.name}內部配方藥劑。`},
  {...common,id:`AT-${prefix}-ACC`,name:`${a.name}・誓徽`,type:"飾品",weight:.06,durability:100,combat:magical?{magicDefense:3+r*2,statusResist:2+r}:{defense:3+r*2,statusResist:2+r},advanced_combat:{perception:1+r},catalog_group:"飾品",catalog_subcategory:"勢力／流派寶庫特有",equipment_slot:"飾品",required_level:{F:1,E:8,D:20,C:35,B:50}[t]||1,rarity:"寶庫限定",treasury_rank:2,treasury_cost:220,treasury_limit:1},
  {...common,id:`AT-${prefix}-SCR`,name:`${a.name}・研修教範卷`,type:"卷軸",weight:.05,utility_effect:"skill_xp_scroll",skill_xp:32+r*12,knowledge_tag:`${a.name}研修`,treasury_rank:3,treasury_cost:360,treasury_limit:3,description:"使用後可選擇一項未滿Lv10技能獲得技能XP。"},
  sig
 ]
}
let TREASURY_IDS=new Set();
function ensureTreasury(){
 DB.items=Array.isArray(DB.items)?DB.items:[];
 const ids=new Set(DB.items.map(x=>x?.id).filter(Boolean)),made=[];
 for(const o of DB.world_organizations||[])if(o?.id&&o.joinable!==false)made.push(...treasury("organization",o));
 for(const d of DB.discipline_factions||[])if(d?.id&&d.joinable!==false)made.push(...treasury("discipline",d));
 TREASURY_IDS=new Set(made.map(x=>x.id));
 for(const d of made)if(!ids.has(d.id)){DB.items.push(d);ids.add(d.id)}
}
function ensureSources(){
 DB.content_link_index=DB.content_link_index&&typeof DB.content_link_index==="object"?DB.content_link_index:{};
 DB.content_link_index.item_sources=DB.content_link_index.item_sources&&typeof DB.content_link_index.item_sources==="object"?DB.content_link_index.item_sources:{};
 for(const id of TREASURY_IDS){
  const d=find(DB.items,id),s=DB.content_link_index.item_sources[id]||{shops:[],gather_locations:[],monster_drops:[],recipe_inputs:[],recipe_outputs:[],special_sources:[]};
  for(const k of ["shops","gather_locations","monster_drops","recipe_inputs","recipe_outputs","special_sources"])s[k]=Array.isArray(s[k])?s[k]:[];
  const tag=`affiliation_treasury:${d?.affiliation_treasury_owner?.type}:${d?.affiliation_treasury_owner?.id}`;
  if(!s.special_sources.includes(tag))s.special_sources.push(tag);
  DB.content_link_index.item_sources[id]=s
 }
}

function summary(type,id){
 if(!isMember(type,id))return "";
 const p=progress(type,id),z=pos(type,id),next=z.next==null?"最高職位":`下一職位 ${z.nextTitle}：累積 ${z.next}`;
 return `<div class="card" data-affiliation-member-card="1"><b>${type==="organization"?"組織":"流派"}會員進度</b><br><span class="small">職位：<b>${esc(z.title)}</b>｜累積貢獻 ${p.total}｜可用貢獻 ${p.balance}<br>${esc(next)}</span><div class="actions"><button class="good" onclick="openAffiliationHub('${type}','${esc(id)}')">貢獻／職位／寶庫</button></div></div>`
}
function appendSummary(type,id){
 const body=document.getElementById("modalBody");if(!body||!isMember(type,id)||body.querySelector("[data-affiliation-member-card]"))return;
 body.insertAdjacentHTML("afterbegin",summary(type,id))
}
function openHub(type,id){
 const a=aff(type,id);if(!a)return;
 if(!isMember(type,id)){alert("只有已正式加入的組織／流派才會開啟貢獻值系統。");return}
 const p=progress(type,id),z=pos(type,id),c=contact(type,id),next=z.next==null?"已達目前最高職位。":`下一職位：${z.nextTitle}，累積貢獻需 ${z.next}（尚差 ${Math.max(0,z.next-p.total)}）。`;
 const can=z.next!=null&&p.total>=z.next&&c.ok,back=type==="organization"?`openOrganization('${esc(id)}')`:`openDiscipline('${esc(id)}')`;
 showModal(`${esc(a.name)}・內部貢獻`,`<div class="card"><b>${esc(z.title)}</b><br><span class="small">累積貢獻 <b>${p.total}</b>｜可用貢獻 <b>${p.balance}</b><br>${esc(next)}<br>${esc(c.text)}</span></div><div class="card small">聲望代表對外關係；貢獻代表正式成員的內部服務紀錄。升職看累積貢獻；寶庫只扣可用貢獻，因此兌換不會造成降職。</div><div class="actions"><button ${can?"class='good'":"disabled"} onclick="promoteAffiliation('${type}','${esc(id)}')">${z.next==null?"已達最高職位":p.total>=z.next?(c.ok?"申請升職":esc(c.text)):`需累積 ${z.next}`}</button><button onclick="openAffiliationCommissions('${type}','${esc(id)}')">內部委託</button><button onclick="openAffiliationDonations('${type}','${esc(id)}')">物資捐贈</button><button onclick="openAffiliationTreasury('${type}','${esc(id)}')">寶庫兌換</button><button onclick="${back}">返回</button></div>`)
}
function promote(type,id){
 if(!isMember(type,id))return;
 const c=contact(type,id),p=progress(type,id),z=pos(type,id);
 if(!c.ok){alert(c.text);return}if(z.next==null||p.total<z.next)return;
 p.rank++;persist();log(type==="organization"?"組織升職":"流派升職",`${affName(type,id)}：晉升為「${pos(type,id).title}」。`,"ok");openHub(type,id)
}
function donationRows(type,id){
 const a=aff(type,id),out=[];
 for(let i=0;i<(G?.character?.inventory||[]).length;i++){const x=G.character.inventory[i],d=itemBy(x?.id);if(canDonate(type,a,d))out.push({i,x,d,qty:Math.max(1,Number(x.qty)||1),double:distinctive(type,a,d),unit:donationValue(type,a,d)})}
 return out.sort((x,y)=>(y.double-x.double)||(tierRank(y.d.tier)-tierRank(x.d.tier)))
}
function openDonations(type,id){
 const a=aff(type,id);if(!a||!isMember(type,id))return;
 const c=contact(type,id),rows=donationRows(type,id).map(r=>`<div class="itemrow"><span><b>${esc(r.d.name)}</b> <span class="tier">${esc(r.d.tier||"F")}</span> ×${r.qty}${r.double?" <span class='ok'>特色契合×2</span>":""}<br><span class="small">${esc(kind(r.d))}｜每件 +${r.unit} 貢獻</span></span><span><button ${c.ok?"":"disabled"} onclick="donateAffiliationItem('${type}','${esc(id)}',${r.i},1)">捐1</button>${r.qty>1?` <button ${c.ok?"":"disabled"} onclick="donateAffiliationItem('${type}','${esc(id)}',${r.i},${r.qty})">全捐</button>`:""}</span></div>`).join("")||"<div class='card small'>背包中目前沒有符合需求的物品。</div>";
 showModal(`${esc(a.name)}・物資捐贈`,`<div class="card small">只收符合組織／流派用途的正常物資；任務物品、鑰匙與寶庫限定品不收。符合傳承、用途或特色者以 <b>2倍貢獻</b> 計算。<br>${esc(c.text)}</div>${rows}<div class="actions"><button onclick="openAffiliationHub('${type}','${esc(id)}')">上一頁</button></div>`)
}
function donate(type,id,index,qty){
 if(!isMember(type,id))return;const c=contact(type,id);if(!c.ok){alert(c.text);return}
 const x=G.character.inventory[index],d=itemBy(x?.id),a=aff(type,id);if(!x||!canDonate(type,a,d))return;
 const take=Math.max(1,Math.min(Math.max(1,Number(x.qty)||1),Math.floor(Number(qty)||1))),gain=donationValue(type,a,d)*take;
 if(!removeItem(d.id,take,index))return;grant(type,id,gain,`捐贈 ${d.name}×${take}${distinctive(type,a,d)?"（特色契合×2）":""}`);openDonations(type,id)
}

function commissionPool(type,a){
 const cap=tierRank(affTier(a));
 return (DB.items||[]).filter(d=>canDonate(type,a,d)&&!d.affiliation_treasury_owner&&tierRank(d.tier||"F")<=cap&&Number(d.value??d.price??0)>0&&((d.acquisition_sources||[]).some(x=>x!=="affiliation_treasury")||d.craft_recipe))
}
function dailyTasks(type,id){
 const a=aff(type,id),day=Number(G?.worldTime?.day||1),pool=commissionPool(type,a);if(!pool.length)return [];
 const special=pool.filter(d=>distinctive(type,a,d)),out=[];
 for(let s=0;s<3;s++){const d=pick(s===0&&special.length?special:pool,`${type}|${id}|${day}|${s}`);if(!d)continue;const target=1+Math.min(4,tierRank(d.tier)+s),reward=Math.round((QUEST_REWARD[d.tier]||18)*(distinctive(type,a,d)?1.25:1));out.push({id:`AC-${String(id).replace(/\W/g,"-")}-${day}-${s}-${String(d.id).replace(/\W/g,"-")}`,itemId:d.id,target,reward,distinctive:distinctive(type,a,d),label:s===0?"特色物資徵集":s===1?"日常補給徵集":"後勤補充",deadlineDay:day+3})}
 return out
}
function records(type,id){
 const p=progress(type,id),today=Number(G?.worldTime?.day||1);for(const r of Object.values(p.commissions))if(r?.status==="active"&&today>Number(r.deadlineDay||999999))r.status="expired";return p.commissions
}
function openCommissions(type,id){
 const a=aff(type,id);if(!a||!isMember(type,id))return;const c=contact(type,id),rs=records(type,id),tasks=dailyTasks(type,id);
 const rows=tasks.map(t=>{const d=itemBy(t.itemId),r=rs[t.id],have=inventoryQty(t.itemId);let action=r?.status==="completed"?"<button disabled>已完成</button>":r?.status==="expired"?"<button disabled>已逾期</button>":r?.status==="active"?`<button ${c.ok&&have>=t.target?"class='good'":"disabled"} onclick="turnInAffiliationCommission('${type}','${esc(id)}','${esc(t.id)}')">${have>=t.target?(c.ok?"交付":"需回據點"):`持有 ${have}/${t.target}`}</button>`:`<button ${c.ok?"":"disabled"} onclick="acceptAffiliationCommission('${type}','${esc(id)}','${esc(t.id)}')">${c.ok?"接取":esc(c.text)}</button>`;return `<div class="card"><b>${esc(t.label)}｜${esc(d?.name||t.itemId)}×${t.target}</b>${t.distinctive?" <span class='ok'>特色需求</span>":""}<br><span class="small">貢獻 +${t.reward}｜接取後3日內交付｜目前持有 ${have}</span><div class="actions">${action}</div></div>`}).join("")||"<div class='card small'>今日沒有可生成的內部物資委託。</div>";
 showModal(`${esc(a.name)}・內部委託`,`<div class="card small">只向正式成員開放；完成後取得貢獻值並小幅提升聲望。<br>${esc(c.text)}</div>${rows}<div class="actions"><button onclick="openAffiliationHub('${type}','${esc(id)}')">上一頁</button></div>`)
}
function acceptCommission(type,id,taskId){
 if(!isMember(type,id))return;const c=contact(type,id);if(!c.ok)return alert(c.text);const t=dailyTasks(type,id).find(x=>x.id===taskId);if(!t)return;
 const rs=records(type,id);if(Object.values(rs).filter(x=>x?.status==="active").length>=3)return alert("同一組織／流派最多同時進行3個內部委託。");
 rs[t.id]={task:{...t},deadlineDay:t.deadlineDay,status:"active"};persist();log("內部委託",`接受${affName(type,id)}「${t.label}」。`,"ok");openCommissions(type,id)
}
function turnInCommission(type,id,taskId){
 if(!isMember(type,id))return;const c=contact(type,id);if(!c.ok)return alert(c.text);const r=records(type,id)[taskId];if(!r||r.status!=="active")return;const t=r.task,have=inventoryQty(t.itemId);if(have<t.target)return alert(`需要 ${itemBy(t.itemId)?.name||t.itemId} ×${t.target}。`);
 if(!consumeIngredient(t.itemId,t.target))return;r.status="completed";if(type==="organization")changeOrgRep(id,1);else{const s=disciplineState();s.reputation[id]=Math.max(-100,Math.min(100,(s.reputation[id]||0)+1))}grant(type,id,t.reward,`完成內部委託「${t.label}」`);persist();openCommissions(type,id)
}
function treasuryList(type,id){return (DB.items||[]).filter(d=>d?.affiliation_treasury_owner?.type===type&&d.affiliation_treasury_owner.id===id).sort((a,b)=>(a.treasury_rank||0)-(b.treasury_rank||0))}
function discount(rank){return rank>=5?.10:rank>=3?.05:0}
function openTreasury(type,id){
 const a=aff(type,id);if(!a||!isMember(type,id))return;const p=progress(type,id),z=pos(type,id),c=contact(type,id);
 const rows=treasuryList(type,id).map(d=>{const need=Number(d.treasury_rank||0),owned=Number(p.purchases[d.id]||0),lim=Number(d.treasury_limit||1),cost=Math.max(1,Math.ceil(Number(d.treasury_cost||1)*(1-discount(z.rank)))),ok=z.rank>=need&&owned<lim&&p.balance>=cost&&c.ok,stat=typeof itemStatsText==="function"?itemStatsText(d):(d.description||d.type),reason=ok?"兌換":z.rank<need?`需職位：${titles(type,a)[need]}`:owned>=lim?"已達上限":p.balance<cost?`貢獻不足 ${p.balance}/${cost}`:c.text;return `<div class="itemrow"><span><b>${esc(d.name)}</b> <span class="tier">${esc(d.tier)}</span><br><span class="small">${stat}<br>需求職位：${esc(titles(type,a)[need])}｜${cost}貢獻${lim<999?`｜已兌換 ${owned}/${lim}`:""}</span></span><button ${ok?"class='good'":"disabled"} onclick="exchangeAffiliationTreasuryItem('${type}','${esc(id)}','${esc(d.id)}')">${esc(reason)}</button></div>`}).join("");
 showModal(`${esc(a.name)}・寶庫`,`<div class="card"><b>${esc(z.title)}</b>｜可用貢獻 ${p.balance}<br><span class="small">職位決定可兌換層級；兌換只扣可用貢獻，不扣累積貢獻。${discount(z.rank)?`目前享有${Math.round(discount(z.rank)*100)}%減免。`:""}<br>${esc(c.text)}</span></div>${rows}<div class="actions"><button onclick="openAffiliationHub('${type}','${esc(id)}')">上一頁</button></div>`)
}
function exchange(type,id,itemId){
 if(!isMember(type,id))return;const c=contact(type,id);if(!c.ok)return alert(c.text);const d=itemBy(itemId),p=progress(type,id),z=pos(type,id);if(!d||d.affiliation_treasury_owner?.id!==id)return;
 const need=Number(d.treasury_rank||0),owned=Number(p.purchases[itemId]||0),lim=Number(d.treasury_limit||1),cost=Math.max(1,Math.ceil(Number(d.treasury_cost||1)*(1-discount(z.rank))));
 if(z.rank<need||owned>=lim||p.balance<cost)return;p.balance-=cost;p.purchases[itemId]=owned+1;addItem(itemId);persist();log("寶庫",`${affName(type,id)}：以${cost}貢獻兌換「${d.name}」。`,"ok");openTreasury(type,id)
}

function patchView(name,type,getId){
 const base=globalThis[name];if(typeof base!=="function"||base.__affcon)return;
 const w=function(){const out=base.apply(this,arguments);try{const id=getId.apply(null,arguments);if(id)appendSummary(type,id)}catch(e){}return out};w.__affcon=true;globalThis[name]=w
}
function patch(){
 patchView("openOrganization","organization",id=>id);patchView("openDiscipline","discipline",id=>id);
 const od=globalThis.openWorldOrganizations;if(typeof od==="function"&&!od.__affcon){const w=function(){const out=od.apply(this,arguments);try{const id=orgState().membershipId;if(id)appendSummary("organization",id)}catch(e){}return out};w.__affcon=true;globalThis.openWorldOrganizations=w}
 const dd=globalThis.openDisciplineDirectory;if(typeof dd==="function"&&!dd.__affcon){const w=function(){const out=dd.apply(this,arguments);try{const id=disciplineState().membershipId;if(id)appendSummary("discipline",id)}catch(e){}return out};w.__affcon=true;globalThis.openDisciplineDirectory=w}
 for(const [name,type] of [["attemptJoinOrganization","organization"],["joinDiscipline","discipline"]]){const base=globalThis[name];if(typeof base==="function"&&!base.__affcon){const w=function(id){const was=isMember(type,id),out=base.apply(this,arguments);if(!was&&isMember(type,id)){progress(type,id);persist()}return out};w.__affcon=true;globalThis[name]=w}}
 const tq=globalThis.turnInQuest;if(typeof tq==="function"&&!tq.__affcon){const w=function(id){const q=G?.quests?.find(x=>x.id===id),oid=q?.organizationId,ok=!!(q&&oid&&isMember("organization",oid)&&q.status==="ready"),tier=q?.tier||"F",qn=q?.name||"組織契約",out=tq.apply(this,arguments);if(ok&&q&&!G?.quests?.some(x=>x.id===id))grant("organization",oid,QUEST_REWARD[tier]||18,`完成正式組織契約「${qn}」`);return out};w.__affcon=true;globalThis.turnInQuest=w}
 const sync=globalThis.syncRuntimeIndexesAndMetadata;if(typeof sync==="function"&&!sync.__affcon){const w=function(){const out=sync.apply(this,arguments);ensureSources();return out};w.__affcon=true;globalThis.syncRuntimeIndexesAndMetadata=w}
}
function audit(){
 const issues=[];for(const o of DB.world_organizations||[])if(o?.id&&o.joinable!==false&&treasuryList("organization",o.id).length<5)issues.push(`組織寶庫不足:${o.id}`);for(const d of DB.discipline_factions||[])if(d?.id&&d.joinable!==false&&treasuryList("discipline",d.id).length<5)issues.push(`流派寶庫不足:${d.id}`);for(const id of TREASURY_IDS)if(!(DB.content_link_index?.item_sources?.[id]?.special_sources||[]).length)issues.push(`寶庫來源缺失:${id}`);return {revision:REV,release:RELEASE,pass:issues.length===0,issues,treasury_item_count:TREASURY_IDS.size}
}

DB.meta=DB.meta||{};DB.meta.affiliation_contribution_revision=REV;
DB.affiliation_contribution_system={version:REV,release:RELEASE,save_compatible:true,thresholds:[...THRESH],rules:["只有已正式加入的組織或流派才開啟貢獻值。","聲望與貢獻分離；升職看累積貢獻，寶庫扣可用貢獻。","符合特色的捐贈物資貢獻值2倍。","每個可加入組織與流派都有獨有寶庫。"]};
if(Array.isArray(DB.integration_registry?.optimization_notes))DB.integration_registry.optimization_notes.push(`CURRENT-1.69.0／${REV}：新增會員貢獻、六階職位、內部委託、特色捐贈2倍與專屬寶庫。`);
ensureTreasury();try{syncRuntimeIndexesAndMetadata()}catch(e){}ensureSources();patch();

globalThis.openAffiliationHub=openHub;
globalThis.promoteAffiliation=promote;
globalThis.openAffiliationDonations=openDonations;
globalThis.donateAffiliationItem=donate;
globalThis.openAffiliationCommissions=openCommissions;
globalThis.acceptAffiliationCommission=acceptCommission;
globalThis.turnInAffiliationCommission=turnInCommission;
globalThis.openAffiliationTreasury=openTreasury;
globalThis.exchangeAffiliationTreasuryItem=exchange;
globalThis.affiliationContributionProgress=progress;
globalThis.runAffiliationContributionAudit=audit;
DB.affiliation_contribution_system.initial_audit=audit();
})();
