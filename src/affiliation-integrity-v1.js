(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE="CURRENT-1.69.2",REV="AFFILIATION-INTEGRITY-1.0";
const R={F:0,E:1,D:2,C:3,B:4,A:5,S:6};
const LEVEL={F:1,E:8,D:20,C:35,B:50,A:70,S:90};
const THRESH=[0,80,220,500,950,1600];
const EQUIP_TYPES=new Set(["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"]);

const game=()=>{try{return typeof G!=="undefined"?G:null}catch(e){return null}};
const rk=t=>R[String(t||"F")]??0;
const rows=(type)=>type==="organization"?(DB.world_organizations||[]):(DB.discipline_factions||[]);
const byId=(arr,id)=>(arr||[]).find(x=>x?.id===id)||null;
const aff=(type,id)=>byId(rows(type),id);
const itemBy=id=>byId(DB.items,id);
const skillBy=id=>byId(DB.shared_skills,id);
const uniq=(arr)=>new Set(arr).size===arr.length;
const validTier=t=>R[String(t||"")]!=null;
const validOwner=o=>!!o&&["organization","discipline"].includes(o.type)&&!!aff(o.type,o.id);

function progressContainer(type){
 const g=game();if(!g?.character)return null;
 if(type==="organization"){
  const s=typeof globalThis.orgState==="function"?globalThis.orgState():g.character.organizations;
  if(!s)return null;s.contribution=s.contribution&&typeof s.contribution==="object"?s.contribution:{};return s.contribution
 }
 const s=typeof globalThis.disciplineState==="function"?globalThis.disciplineState():g.character.disciplines;
 if(!s)return null;s.contribution=s.contribution&&typeof s.contribution==="object"?s.contribution:{};return s.contribution
}
function ensureMemberProgress(type,id){
 if(!id||!aff(type,id))return false;
 const c=progressContainer(type);if(!c)return false;
 if(!c[id]||typeof c[id]!=="object")c[id]={total:0,balance:0,rank:0,purchases:{},commissions:{}};
 return true
}
function repairProgress(p,today){
 let changed=false;
 const total=Math.max(0,Math.floor(Number(p.total)||0));if(p.total!==total){p.total=total;changed=true}
 const balance=Math.min(total,Math.max(0,Math.floor(Number(p.balance)||0)));if(p.balance!==balance){p.balance=balance;changed=true}
 const rank=Math.max(0,Math.min(5,Math.floor(Number(p.rank)||0)));if(p.rank!==rank){p.rank=rank;changed=true}
 if(!p.purchases||typeof p.purchases!=="object"){p.purchases={};changed=true}
 for(const [id,n] of Object.entries(p.purchases)){
  const fixed=Math.max(0,Math.floor(Number(n)||0));if(fixed!==n){p.purchases[id]=fixed;changed=true}
 }
 if(!p.commissions||typeof p.commissions!=="object"){p.commissions={};changed=true}
 for(const r of Object.values(p.commissions)){
  if(!r||typeof r!=="object")continue;
  if(r.status==="active"&&today>Number(r.deadlineDay||999999)){r.status="expired";changed=true}
 }
 const entries=Object.entries(p.commissions),active=entries.filter(([,r])=>r?.status==="active"),history=entries.filter(([,r])=>r?.status!=="active").sort((a,b)=>Number(b[1]?.completedDay||b[1]?.deadlineDay||0)-Number(a[1]?.completedDay||a[1]?.deadlineDay||0));
 if(history.length>60){p.commissions=Object.fromEntries([...active,...history.slice(0,60)]);changed=true}
 return changed
}
function repair(){
 const g=game(),repairs=[];if(!g?.character)return {changed:false,repairs};
 try{if(typeof globalThis.normalizeAffiliationMemberships==="function")globalThis.normalizeAffiliationMemberships()}catch(e){}
 const orgId=g.character.organizations?.membershipId||null,discId=g.character.disciplines?.membershipId||null;
 if(orgId&&ensureMemberProgress("organization",orgId))repairs.push("正式組織會員貢獻容器確認");
 if(discId&&ensureMemberProgress("discipline",discId))repairs.push("正式流派會員貢獻容器確認");
 const today=Number(g.worldTime?.day||1);let changed=false;
 for(const type of ["organization","discipline"]){
  const c=progressContainer(type);if(!c)continue;
  for(const p of Object.values(c))if(p&&typeof p==="object"&&repairProgress(p,today))changed=true
 }
 if(changed)repairs.push("貢獻值／委託歷史結構正規化");
 if(changed&&typeof globalThis.persist==="function")try{globalThis.persist()}catch(e){}
 return {changed,repairs:[...new Set(repairs)]}
}
function audit(){
 const issues=[],stats={organizations:0,disciplines:0,treasury_items:0,exclusive_equipment:0,exclusive_skills:0,active_commissions:0};
 const orgIds=(DB.world_organizations||[]).map(x=>x?.id).filter(Boolean),discIds=(DB.discipline_factions||[]).map(x=>x?.id).filter(Boolean);
 if(!uniq(orgIds))issues.push("組織ID重複");
 if(!uniq(discIds))issues.push("流派ID重複");
 const requiredApis=["openAffiliationHub","openAffiliationDonations","openAffiliationCommissions","openAffiliationTreasury","affiliationContributionProgress","affiliationScaleProfile","learnAffiliationTreasurySkill"];
 for(const fn of requiredApis)if(typeof globalThis[fn]!=="function")issues.push(`會員系統API缺失:${fn}`);

 for(const type of ["organization","discipline"]){
  for(const a of rows(type)){
   if(!a?.id)continue;
   if(a.joinable!==false)stats[type==="organization"?"organizations":"disciplines"]++;
   if(a.joinable===false)continue;
   if(!a.primary_facility||!DB.facilities?.[a.primary_facility])issues.push(`${a.id}:主要據點不存在/${a.primary_facility||"null"}`);
   if(type==="organization"){
    if(!(Number(a.min_join_level)>=1))issues.push(`${a.id}:加入等級異常`);
   }else{
    const contacts=Array.isArray(a.contact_location_ids)?a.contact_location_ids:[];
    if(!contacts.length)issues.push(`${a.id}:流派無正式接觸點`);
    for(const lid of contacts)if(!(DB.locations||[]).some(x=>x.id===lid))issues.push(`${a.id}:接觸點不存在/${lid}`);
    if(a.parent_org_id&&!byId(DB.world_organizations,a.parent_org_id))issues.push(`${a.id}:上級組織不存在/${a.parent_org_id}`);
    if(!validTier(a.training_tier_ceiling||a.tier||"F"))issues.push(`${a.id}:訓練層級異常`);
   }
   if(typeof globalThis.affiliationScaleProfile==="function"){
    const p=globalThis.affiliationScaleProfile(type,a.id);
    if(!p||!validTier(p.maxTier)||p.index!==rk(p.maxTier))issues.push(`${a.id}:規模profile異常`);
   }
  }
 }

 for(const d of DB.items||[]){
  const o=d?.affiliation_treasury_owner;if(!o)continue;stats.treasury_items++;
  if(!validOwner(o)){issues.push(`${d.id}:寶庫物品owner無效`);continue}
  if(!(Number(d.weight)>0))issues.push(`${d.id}:寶庫物品重量異常`);
  if(d.treasury_retired)continue;
  if(!(Number(d.treasury_cost)>0))issues.push(`${d.id}:寶庫兌換成本異常`);
  if(Number(d.treasury_rank)<0||Number(d.treasury_rank)>5)issues.push(`${d.id}:寶庫職位門檻異常`);
  const p=typeof globalThis.affiliationScaleProfile==="function"?globalThis.affiliationScaleProfile(o.type,o.id):null;
  if(p&&rk(d.tier)>p.index)issues.push(`${d.id}:物品層級${d.tier}超過勢力規模${p.maxTier}`);
  if(EQUIP_TYPES.has(d.type)){
   stats.exclusive_equipment++;
   if(!d.durability||Number(d.durability)<=0)issues.push(`${d.id}:限定裝備耐久異常`);
   if(["B","A","S"].includes(d.tier)&&Number(d.required_level||0)<LEVEL[d.tier]&&!d.sealed)issues.push(`${d.id}:高階裝備缺少前置／封印`);
  }
  const src=DB.content_link_index?.item_sources?.[d.id];
  if(!src||!(src.special_sources||[]).some(x=>String(x).startsWith("affiliation_treasury:")))issues.push(`${d.id}:寶庫來源索引缺失`)
 }
 const legacy=(DB.items||[]).filter(d=>/^AT-(?:ORG|DISC)-.*-(?:ACC|SIG)$/.test(String(d?.id||""))&&!d.treasury_retired);
 if(legacy.length)issues.push(`舊寶庫重複裝備仍啟用:${legacy.slice(0,5).map(x=>x.id).join("、")}`);

 for(const s of DB.shared_skills||[]){
  const o=s?.affiliation_skill_owner;if(!o)continue;stats.exclusive_skills++;
  if(!validOwner(o)){issues.push(`${s.id}:獨有技能owner無效`);continue}
  if(!validTier(s.tier))issues.push(`${s.id}:技能層級異常`);
  if(Number(s.max_level||10)!==10)issues.push(`${s.id}:技能等級上限非10`);
  if(!(Number(s.treasury_cost)>0))issues.push(`${s.id}:技能貢獻成本異常`);
  if(Number(s.treasury_rank)<0||Number(s.treasury_rank)>5)issues.push(`${s.id}:技能職位門檻異常`);
  const p=typeof globalThis.affiliationScaleProfile==="function"?globalThis.affiliationScaleProfile(o.type,o.id):null;
  if(p&&rk(s.tier)>p.index)issues.push(`${s.id}:技能層級${s.tier}超過勢力規模${p.maxTier}`);
  if(["B","A","S"].includes(s.tier)&&Number(s.required_level||0)<LEVEL[s.tier])issues.push(`${s.id}:高階技能角色等級前置不足`);
  if(s.kind==="被動"&&s.manual_battle_use!==false)issues.push(`${s.id}:被動技能可被手動施放`);
  if(["主動","輔助"].includes(s.kind)&&["physical","magic","hybrid"].includes(s.damage_type)&&!(Number(s.base_power_percent)>0))issues.push(`${s.id}:攻擊技能倍率缺失`)
 }

 const g=game();
 if(g?.character){
  const oid=g.character.organizations?.membershipId,did=g.character.disciplines?.membershipId;
  if(oid&&!aff("organization",oid))issues.push(`存檔組織會員ID不存在:${oid}`);
  if(did&&!aff("discipline",did))issues.push(`存檔流派會員ID不存在:${did}`);
  if((g.character.organizations?.memberships||[]).length>1)issues.push("存檔同時存在多個正式組織會員");
  if(oid&&(g.character.organizations?.memberships||[])[0]!==oid)issues.push("組織membershipId與memberships不同步");
  for(const type of ["organization","discipline"]){
   const c=progressContainer(type)||{};
   for(const [id,p] of Object.entries(c)){
    if(!aff(type,id))issues.push(`歷史貢獻引用不存在:${type}/${id}`);
    if(Number(p?.total||0)<0||Number(p?.balance||0)<0||Number(p?.balance||0)>Number(p?.total||0))issues.push(`貢獻值異常:${type}/${id}`);
    const rank=Math.max(0,Math.min(5,Number(p?.rank)||0));
    if(Number(p?.total||0)<THRESH[rank])issues.push(`職位高於累積貢獻:${type}/${id}`);
    for(const r of Object.values(p?.commissions||{})){
     if(r?.status==="active"){
      stats.active_commissions++;const t=r.task;
      if(!t?.id||!itemBy(t.itemId)||!(Number(t.target)>0)||!(Number(r.deadlineDay||t.deadlineDay)>0))issues.push(`進行中內部委託資料異常:${type}/${id}`)
     }
    }
   }
  }
  for(const s of g.character.skills||[])if(s?.affiliationExclusive&&s.id&&!skillBy(s.id))issues.push(`角色獨有技能來源缺失:${s.id}`)
 }

 const contribution=typeof globalThis.runAffiliationContributionAudit==="function"?globalThis.runAffiliationContributionAudit():null;
 if(contribution&&!contribution.pass)issues.push(...contribution.issues.map(x=>`貢獻子系統:${x}`));
 const treasury=typeof globalThis.runAffiliationTreasuryDepthAudit==="function"?globalThis.runAffiliationTreasuryDepthAudit():null;
 if(treasury&&!treasury.pass)issues.push(...treasury.issues.map(x=>`寶庫子系統:${x}`));

 return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats,contribution,treasury}
}

function patchFiveTurnAudit(){
 const base=globalThis.runGeneratorAudit;if(typeof base!=="function"||base.__affiliationIntegrityPatched)return;
 const wrapped=function(){
  const baseIssues=base.apply(this,arguments),result=audit();
  return [...(Array.isArray(baseIssues)?baseIssues:[]),...result.issues.map(x=>`組織／流派:${x}`)]
 };
 wrapped.__affiliationIntegrityPatched=true;globalThis.runGeneratorAudit=wrapped
}

DB.meta=DB.meta||{};DB.meta.affiliation_integrity_revision=REV;
DB.affiliation_integrity_system={version:REV,release:RELEASE,authority:"highest",save_compatible:true,destructive_repairs:false,scope:["組織會員","流派會員","聲望","貢獻","職位","內部委託","捐贈","規模","寶庫","獨有裝備","獨有技能","來源索引","五回合自檢","系統完整性"]};
if(Array.isArray(DB.integration_registry?.optimization_notes))DB.integration_registry.optimization_notes.push(`CURRENT-1.69.2／${REV}：最高權限稽核組織／流派全鏈路，並把異常接入五回合自檢。`);
patchFiveTurnAudit();
globalThis.repairAffiliationIntegrityState=repair;
globalThis.runAffiliationIntegrityAudit=audit;
DB.affiliation_integrity_system.initial_audit=audit();
})();
