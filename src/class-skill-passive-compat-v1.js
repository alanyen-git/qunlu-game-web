/* 群陸旅誌：職業／技能被動相容修正 CURRENT-1.64.0 | CLASS-SKILL-PASSIVE-COMPAT-1.0 */
(()=>{
  if(typeof DB!=="object"||!DB)return;
  const REV="CLASS-SKILL-PASSIVE-COMPAT-1.0";
  const PASSIVE_GROWTH=.015;
  DB.meta=DB.meta||{};
  DB.meta.class_skill_passive_compat_revision=REV;

  const isPassive=s=>!!s&&(s.kind==="被動"||s.display_type==="被動");
  function normalizePassive(s){
    if(!isPassive(s))return false;
    let changed=false;
    if(s.display_type!=="被動"){s.display_type="被動";changed=true}
    if(s.manual_battle_use!==false){s.manual_battle_use=false;changed=true}
    if(!Number.isFinite(Number(s.passive_growth_per_level))){s.passive_growth_per_level=PASSIVE_GROWTH;changed=true}
    s.level_bonuses=s.level_bonuses&&typeof s.level_bonuses==="object"?s.level_bonuses:{};
    if(!s.level_bonuses["6"]){s.level_bonuses["6"]={passive_multiplier_bonus:.04,text:"常駐效果額外提升4%"};changed=true}
    if(!s.level_bonuses["10"]){s.level_bonuses["10"]={passive_multiplier_bonus:.06,text:"常駐效果再提升6%"};changed=true}
    return changed;
  }
  function apply(){
    let dataRepairs=0,saveRepairs=0;
    for(const list of Object.values(DB.skill_pools||{}))for(const s of (Array.isArray(list)?list:[]))if(normalizePassive(s))dataRepairs++;
    for(const s of (DB.shared_skills||[]))if(normalizePassive(s))dataRepairs++;
    try{
      if(typeof G!=="undefined"&&Array.isArray(G?.character?.skills)){
        for(const s of G.character.skills)if(normalizePassive(s))saveRepairs++;
        if(saveRepairs&&typeof globalThis.persist==="function")globalThis.persist();
      }
    }catch(e){}
    DB.class_skill_passive_compat={revision:REV,data_repairs:dataRepairs,save_repairs:saveRepairs,save_schema_changed:false};
    return {revision:REV,dataRepairs,saveRepairs};
  }
  function audit(){
    const issues=[];
    const scan=(s,scope)=>{if(!isPassive(s))return;if(s.display_type!=="被動")issues.push(`${scope}:${s.name||s.id||"未命名"}:display_type`);if(s.manual_battle_use!==false)issues.push(`${scope}:${s.name||s.id||"未命名"}:manual_battle_use`);if(!Number.isFinite(Number(s.passive_growth_per_level)))issues.push(`${scope}:${s.name||s.id||"未命名"}:passive_growth`);if(!s.level_bonuses?.["6"]||!s.level_bonuses?.["10"])issues.push(`${scope}:${s.name||s.id||"未命名"}:milestones`)};
    for(const [cid,list] of Object.entries(DB.skill_pools||{}))for(const s of (Array.isArray(list)?list:[]))scan(s,cid);
    for(const s of (DB.shared_skills||[]))scan(s,"shared");
    try{for(const s of (typeof G!=="undefined"&&Array.isArray(G?.character?.skills)?G.character.skills:[]))scan(s,"save")}catch(e){}
    return {revision:REV,pass:issues.length===0,issues};
  }
  apply();
  globalThis.applyClassSkillPassiveCompat=apply;
  globalThis.runClassSkillPassiveCompatAudit=audit;
})();
