/* 群陸旅誌：冒險團前後排編成
 * ADVENTURE-PARTY-FORMATION-1.0
 * 以既有角色、隊友與夥伴資料為來源；新增欄位採向後相容的可選欄位。
 */
(()=>{
  "use strict";

  const REV="ADVENTURE-PARTY-FORMATION-1.0";
  const FRONT="front",BACK="back";
  const POSITIONS=[FRONT,BACK];
  const LABEL={[FRONT]:"前排",[BACK]:"後排"};
  const KIND_LABEL={player:"角色",party:"隊友",companion:"夥伴"};

  const esc=value=>String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");

  function state(){return globalThis.G?.character||null}
  function validPosition(value){return POSITIONS.includes(value)}
  function positionText(value){return LABEL[validPosition(value)?value:FRONT]||LABEL[FRONT]}
  function species(instance){return typeof globalThis.companionSpecies==="function"?globalThis.companionSpecies(instance?.speciesId):null}
  function template(member){return typeof globalThis.partyTemplate==="function"?globalThis.partyTemplate(member?.templateId):null}

  function defaultPlayerPosition(){
    const family=typeof globalThis.playerRoleFamily==="function"?globalThis.playerRoleFamily():"frontline";
    return ["ranged","healer","caster","support"].includes(family)?BACK:FRONT
  }

  function defaultPartyPosition(member){
    const role=template(member)?.role||"frontline";
    return ["ranged","healer","caster","support"].includes(role)?BACK:FRONT
  }

  function defaultCompanionPosition(instance){
    return species(instance)?.companion_kind==="summon"?BACK:FRONT
  }

  function ensureFormationState(){
    const c=state();
    if(!c)return false;
    let changed=false;
    if(!validPosition(c.battlefield_position)){c.battlefield_position=defaultPlayerPosition();changed=true}
    const party=typeof globalThis.partyMembers==="function"?globalThis.partyMembers():(c.adventureParty?.members||[]);
    for(const member of party||[])if(!validPosition(member?.battlefield_position)){
      member.battlefield_position=defaultPartyPosition(member);changed=true
    }
    for(const companion of (Array.isArray(c.companions)?c.companions:[]))if(!validPosition(companion?.battlefield_position)){
      companion.battlefield_position=defaultCompanionPosition(companion);changed=true
    }
    return changed
  }

  function companionKindLabel(instance){
    const sp=species(instance);
    if(sp?.companion_kind==="summon")return "召喚獸";
    if(sp?.companion_kind==="contract")return "契約獸";
    return "寵物";
  }

  function formationUnits(){
    const c=state();if(!c)return [];
    ensureFormationState();
    const out=[{
      kind:"player",uid:"player",name:c.name||"主角",category:"角色",
      detail:`Lv${Number(c.level||1)}｜${typeof globalThis.cls==="function"?(globalThis.cls(c.classId)?.name||c.classId||"未知職業"):c.classId||"未知職業"}`,
      position:c.battlefield_position,active:true
    }];
    const p=typeof globalThis.adventureParty==="function"?globalThis.adventureParty():c.adventureParty;
    for(const member of (p?.members||[])){
      const t=template(member);if(!t)continue;
      out.push({
        kind:"party",uid:member.uid,name:t.name||member.uid,category:"隊友",
        detail:`Lv${Number(member.level||1)}｜${t.role_label||t.role||"隊伍AI"}`,
        position:member.battlefield_position,active:true
      });
    }
    for(const companion of (Array.isArray(c.companions)?c.companions:[])){
      const sp=species(companion);if(!sp)continue;
      out.push({
        kind:"companion",uid:companion.uid,name:sp.name||companion.uid,category:companionKindLabel(companion),
        detail:`Lv${Number(companion.level||1)}｜${c.activeCompanionId===companion.uid?"出戰中":"待命"}`,
        position:companion.battlefield_position,active:c.activeCompanionId===companion.uid
      });
    }
    return out
  }

  function positionButton(unit,position){
    const active=unit.position===position;
    return `<button type="button" class="${active?"primary":""}" data-formation-kind="${esc(unit.kind)}" data-formation-uid="${esc(unit.uid)}" data-formation-position="${position}" aria-pressed="${active?"true":"false"}"${active?" disabled":""}>${LABEL[position]}</button>`;
  }

  function editorHtml(){
    const units=formationUnits();
    const rows=units.map(unit=>`<div class="party-formation-row">
      <div class="party-formation-unit"><b>${esc(unit.name)}</b> <span class="tier">${esc(unit.category)}</span><br><span class="small">${esc(unit.detail)}｜目前${positionText(unit.position)}${unit.kind==="companion"&&!unit.active?"｜待命夥伴，設為出戰後套用":""}</span></div>
      <div class="party-formation-buttons">${positionButton(unit,FRONT)}${positionButton(unit,BACK)}</div>
    </div>`).join("");
    return `<section class="card party-formation-editor" data-party-formation-editor>
      <b>戰鬥站位</b><br>
      <span class="small">前排較容易承受敵方直接攻擊；後排降低被點名機率。站位會保存在角色、隊友與夥伴資料中，舊存檔會自動補上預設位置。</span>
      <div class="party-formation-list">${rows||"<div class=\"small\">目前沒有可編成的隊伍成員。</div>"}</div>
    </section>`;
  }

  function refreshAdventurePartyEditor(){
    const body=document.getElementById("modalBody");if(!body)return;
    body.querySelector("[data-party-formation-editor]")?.remove();
    body.insertAdjacentHTML("afterbegin",editorHtml());
    const editor=body.querySelector("[data-party-formation-editor]");
    editor?.querySelectorAll("button[data-formation-position]").forEach(button=>button.addEventListener("click",()=>setBattlefieldPosition(button.dataset.formationKind,button.dataset.formationUid,button.dataset.formationPosition)));
  }

  function unitName(kind,uid){
    return formationUnits().find(x=>x.kind===kind&&x.uid===uid)?.name||KIND_LABEL[kind]||"成員"
  }

  function setBattlefieldPosition(kind,uid,position){
    if(!POSITIONS.includes(position))return;
    const c=state();if(!c)return;
    ensureFormationState();
    let target=null;
    if(kind==="player")target=c;
    else if(kind==="party")target=(c.adventureParty?.members||[]).find(x=>x.uid===uid);
    else if(kind==="companion")target=(c.companions||[]).find(x=>x.uid===uid);
    if(!target)return;
    if(target.battlefield_position===position)return;
    target.battlefield_position=position;
    if(typeof globalThis.persist==="function")globalThis.persist();
    if(typeof globalThis.log==="function")globalThis.log("隊形",`${unitName(kind,uid)}調整至${LABEL[position]}。`);
    if(typeof globalThis.openAdventureParty==="function")globalThis.openAdventureParty();
  }

  function decorateBattleFormationState(){
    const c=state(),battle=globalThis.G?.battle;
    if(!c||!battle?.active)return false;
    ensureFormationState();
    c.battlefield_position=c.battlefield_position||FRONT;
    if(Array.isArray(battle.party))for(const member of battle.party){
      const saved=(c.adventureParty?.members||[]).find(x=>x.uid===member.uid);
      member.battlefield_position=saved?.battlefield_position||FRONT;
    }
    if(battle.companion){
      const saved=(c.companions||[]).find(x=>x.uid===battle.companion.uid);
      battle.companion.battlefield_position=saved?.battlefield_position||FRONT;
    }
    battle.player_battlefield_position=c.battlefield_position;
    return true
  }

  function decorateBattleCards(){
    const body=document.getElementById("battleBody"),allies=body?.querySelector(".battle-allies");
    if(!allies||!globalThis.G?.battle?.active)return;
    const battle=globalThis.G.battle;
    const cards=[...allies.children].filter(node=>node.classList?.contains("battleunit"));
    const add=(node,position)=>{
      if(!node||!validPosition(position))return;
      let label=node.querySelector("[data-battle-position]");
      if(!label){label=document.createElement("div");label.className="small battle-position-label";label.dataset.battlePosition="1";node.appendChild(label)}
      label.textContent=`站位：${positionText(position)}`;
    };
    add(cards[0],globalThis.G.character?.battlefield_position);
    (battle.party||[]).forEach((member,index)=>add(cards[index+1],member.battlefield_position));
    if(battle.companion)add(cards[1+(battle.party||[]).length],battle.companion.battlefield_position);
  }

  function installStyle(){
    if(document.getElementById("partyFormationStyle"))return;
    const style=document.createElement("style");style.id="partyFormationStyle";
    style.textContent=`
      .party-formation-editor{border-color:rgba(214,174,94,.42);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(214,174,94,.055))}
      .party-formation-list{display:grid;gap:8px;margin-top:10px}
      .party-formation-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,.10)}
      .party-formation-row:first-child{border-top:0;padding-top:2px}
      .party-formation-unit{min-width:0;line-height:1.45}
      .party-formation-buttons{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
      .party-formation-buttons button{min-width:58px;min-height:40px}
      .battle-position-label{color:#e9cf91;margin-top:3px}
      @media(max-width:480px){.party-formation-row{grid-template-columns:1fr}.party-formation-buttons{justify-content:flex-start}.party-formation-buttons button{flex:1 1 80px}}
    `;
    document.head.appendChild(style);
  }

  function audit(){
    const c=state(),issues=[];
    if(c){
      ensureFormationState();
      if(!validPosition(c.battlefield_position))issues.push("角色站位無效");
      for(const member of c.adventureParty?.members||[])if(!validPosition(member.battlefield_position))issues.push(`隊友站位無效:${member.uid||member.templateId}`);
      for(const companion of c.companions||[])if(!validPosition(companion.battlefield_position))issues.push(`夥伴站位無效:${companion.uid||companion.speciesId}`);
    }
    return {version:REV,pass:issues.length===0,issues,positions:[FRONT,BACK],save_compatible:true};
  }

  if(typeof document!=="undefined")installStyle();
  const originalOpenAdventureParty=globalThis.openAdventureParty;
  if(typeof originalOpenAdventureParty==="function"){
    globalThis.openAdventureParty=function(){
      const result=originalOpenAdventureParty.apply(this,arguments);
      try{refreshAdventurePartyEditor()}catch(error){console.warn("party formation editor failed",error)}
      return result;
    };
  }

  const originalMigrateSave=globalThis.migrateSave;
  if(typeof originalMigrateSave==="function")globalThis.migrateSave=function(){const result=originalMigrateSave.apply(this,arguments);ensureFormationState();return result};

  const originalStartBattle=globalThis.startBattle;
  if(typeof originalStartBattle==="function")globalThis.startBattle=function(){const result=originalStartBattle.apply(this,arguments);if(decorateBattleFormationState()&&typeof globalThis.renderBattle==="function")globalThis.renderBattle();return result};

  const originalRenderBattle=globalThis.renderBattle;
  if(typeof originalRenderBattle==="function")globalThis.renderBattle=function(){const result=originalRenderBattle.apply(this,arguments);decorateBattleFormationState();decorateBattleCards();return result};

  const originalCombatStats=globalThis.combatStats;
  if(typeof originalCombatStats==="function")globalThis.combatStats=function(){const result=originalCombatStats.apply(this,arguments),battle=globalThis.G?.battle;if(result&&battle?.active){const p=globalThis.G.character?.battlefield_position;const multiplier=p===BACK ? .68 : 1.28;result.threat=Math.round(Number(result.threat||0)*multiplier);result.formation_threat_multiplier=multiplier}return result};

  const originalPartyThreatTargets=globalThis.partyThreatTargets;
  if(typeof originalPartyThreatTargets==="function")globalThis.partyThreatTargets=function(){return originalPartyThreatTargets.apply(this,arguments).map(entry=>{const p=entry?.unit?.battlefield_position;const multiplier=p===BACK ? .70 : 1.25;return {...entry,weight:Math.max(1,Math.round(Number(entry.weight||1)*multiplier))}})};

  globalThis.setBattlefieldPosition=setBattlefieldPosition;
  globalThis.runAdventurePartyFormationAudit=audit;
  globalThis.QUNLU_ADVENTURE_PARTY_FORMATION={version:REV,ensureFormationState,formationUnits,setBattlefieldPosition,audit,positions:POSITIONS};
  if(globalThis.DB){
    DB.meta=DB.meta||{};
    DB.meta.adventure_party_formation_revision=REV;
    DB.adventure_party_formation_system={version:REV,positions:[FRONT,BACK],members:["角色","隊友","寵物／契約獸","召喚獸"],battle_effect:"前後排影響敵方直接鎖定權重",save_compatible:true};
  }
  globalThis.QUNLU_CORE?.registerModule?.("src/adventure-party-formation-v1.js",{domain:"combat",revision:REV,release:globalThis.QUNLU_RELEASE_VERSION||"CURRENT-2.25.10"});
})();
