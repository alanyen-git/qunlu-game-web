(()=>{
  "use strict";
  const SCALE=2;
  const scaleNumber=value=>{
    const n=Number(value);
    return Number.isFinite(n)?Math.round(n*SCALE*100)/100:value;
  };
  const scaleObjectKeys=(obj,keys)=>{
    if(!obj||obj.__combatScaleV2)return;
    for(const key of keys)if(Number.isFinite(Number(obj[key])))obj[key]=scaleNumber(obj[key]);
    if(Array.isArray(obj.damage))obj.damage=obj.damage.map(scaleNumber);
    Object.defineProperty(obj,"__combatScaleV2",{value:true,enumerable:false});
  };
  const install=()=>{
    if(typeof DB!=="object"||!DB||DB.combat_number_scale?.version==="COMBAT-NUMBER-SCALE-2.0")return;
    for(const monster of (DB.monsters||[]))scaleObjectKeys(monster,["hp","attack","defense","magicDefense"]);
    for(const species of (DB.companion_species||[]))scaleObjectKeys(species?.base_stats,["hp","attack","magic","defense"]);
    for(const member of (DB.party_member_templates||[]))scaleObjectKeys(member?.base_stats,["hp","attack","magic","defense"]);
    DB.combat_number_scale={
      version:"COMBAT-NUMBER-SCALE-2.0",
      multiplier:SCALE,
      policy:"核心絕對戰鬥數值×2；機率、百分比、速度、射程、抗性、破甲與負重不縮放。",
      scaled_player:["HP","SP","MP","物理攻擊","魔法攻擊","物理防禦","魔法防禦","HP回復","MP回復"],
      scaled_enemy:["HP","物理攻擊","物理防禦","魔法防禦","固定傷害區間"],
      scaled_allies:["HP","物理攻擊","魔法攻擊","物理防禦"],
      preserved_ratios:["命中","閃避","爆擊率","爆擊傷害%","攻速","施法速度","格擋率","格擋減傷%","元素抗性","狀態抗性","破甲%","移動速度","射程"],
      proof:[
        "線性傷害：2A−0.45×2D = 2×(A−0.45D)，故核心傷害約×2。",
        "生命同步×2，因此 HP／每回合傷害比近似不變，平均擊殺回合數不因單純放大數字而改變。",
        "MP/SP同步×2，技能固定消耗也在runtime同步×2，因此可施放次數近似不變。",
        "魔攻與治療同步×2、固定藥劑回復同步×2，因此治療占最大HP比例近似不變。",
        "命中、閃避、爆擊、格擋、抗性、速度等百分比或機率型數值維持原值，避免上限溢位。"
      ],
      monster_records_scaled:(DB.monsters||[]).length,
      companion_records_scaled:(DB.companion_species||[]).length,
      party_records_scaled:(DB.party_member_templates||[]).length
    };
    if(DB.meta){
      DB.meta.combat_number_scale="COMBAT-NUMBER-SCALE-2.0";
      DB.meta.combat_number_multiplier=SCALE;
    }
  };
  globalThis.QUNLU_COMBAT_NUMBER_SCALE=SCALE;
  globalThis.qunluCombatScale=value=>{
    const n=Number(value);
    return Number.isFinite(n)?Math.round(n*SCALE*100)/100:value;
  };
  install();
})();