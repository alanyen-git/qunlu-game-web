/*
 * 群陸旅誌 Runtime 補丁入口
 * 載入順序：runtime.js -> runtime-patches.js
 *
 * CURRENT-1.56.x：創角職業資訊補強。
 * 僅調整介面顯示，不修改角色、世界或存檔 schema。
 */
(()=>{
  const cleanSkillName=value=>String(value||"")
    .replace(/－通用（(?:物理|魔法)系）/g,"")
    .replace(/\s+/g," ")
    .trim();

  function ensureClassDetailNode(){
    const randomCount=document.getElementById("randomCount");
    if(!randomCount)return null;
    let detail=document.getElementById("classCreationDetails");
    if(detail)return detail;

    detail=document.createElement("div");
    detail.id="classCreationDetails";
    detail.className="small";
    detail.setAttribute("aria-live","polite");
    Object.assign(detail.style,{
      marginTop:"10px",
      paddingTop:"10px",
      borderTop:"1px solid rgba(255,255,255,.12)",
      display:"grid",
      gap:"7px",
      lineHeight:"1.65"
    });
    randomCount.insertAdjacentElement("afterend",detail);
    return detail;
  }

  function appendDetailRow(host,label,value){
    const row=document.createElement("div");
    const title=document.createElement("b");
    title.textContent=`${label}｜`;
    const text=document.createElement("span");
    text.textContent=value;
    row.append(title,text);
    host.appendChild(row);
  }

  function classSkillSummary(c){
    const pool=Array.isArray(DB?.skill_pools?.[c.id])?DB.skill_pools[c.id]:[];
    const unique=[];
    for(const skill of pool){
      const name=cleanSkillName(skill?.name);
      if(!name||unique.includes(name))continue;
      unique.push(name);
    }
    const signature=unique.filter(name=>!String(pool.find(s=>cleanSkillName(s?.name)===name)?.name||"").includes("通用"));
    const examples=(signature.length>=3?signature:unique).slice(0,4);
    const elements=[...new Set(pool.map(s=>s?.element).filter(Boolean))].slice(0,4);
    const core=c.combat_role||c.design_identity||c.category||"職業專屬戰鬥方式";
    const exampleText=examples.length?`代表技能包含${examples.join("、")}`:"技能會依職業技能池逐步解鎖";
    const elementText=elements.length?`；可延伸${elements.join("、")}等元素運用`:"";
    return `以${core}為核心，${exampleText}${elementText}。`;
  }

  function renderCreationClassDetails(){
    const host=ensureClassDetailNode();
    if(!host)return;
    host.replaceChildren();

    const classId=(typeof creation!=="undefined"&&creation)?creation.classId:null;
    const c=classId&&Array.isArray(DB?.combat_classes)
      ?DB.combat_classes.find(entry=>entry.id===classId)
      :null;
    if(!c){
      const hint=document.createElement("span");
      hint.textContent="選取職業後顯示職業介紹、專長武器、職業定位與技能特色。";
      host.appendChild(hint);
      return;
    }

    const category=c.category||c.combat_track_label||"戰鬥職業";
    const primary=c.primary?`，主能力為${c.primary}`:"";
    const resource=c.resource_type?`，主要戰鬥資源為${c.resource_type}`:"";
    const sealed=c.sealed?"目前高階能力處於封印狀態，需依職業前置條件逐步解封。":"";
    const intro=`${c.name}屬於${category}${primary}${resource}。${sealed}`;
    const weapon=c.weapon_group||"依職業裝備規則";
    const role=c.combat_role||c.design_identity||"依職業能力配置";

    appendDetailRow(host,"職業介紹",intro);
    appendDetailRow(host,"專長武器",weapon);
    appendDetailRow(host,"職業定位",role);
    appendDetailRow(host,"技能特色",classSkillSummary(c));
  }

  const originalSelectClass=window.selectClass;
  if(typeof originalSelectClass==="function"){
    window.selectClass=function(id){
      const result=originalSelectClass.apply(this,arguments);
      renderCreationClassDetails();
      return result;
    };
  }

  const originalRollClass=window.rollClass;
  if(typeof originalRollClass==="function"){
    window.rollClass=function(){
      const result=originalRollClass.apply(this,arguments);
      renderCreationClassDetails();
      return result;
    };
  }

  renderCreationClassDetails();
  window.renderCreationClassDetails=renderCreationClassDetails;
})();
