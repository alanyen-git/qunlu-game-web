(()=>{
"use strict";

const REVISION="DUNGEON-DEPTH-2.0";
const EQUIPMENT_TYPES=new Set(["主武器","頭盔","盔甲","手套","鞋子","披風","飾品"]);
const TYPE_LABELS={
 corridor:"通道／探索區",
 combat:"怪物盤據區",
 trap:"機關陷阱房",
 treasure:"財寶房",
 equipment:"裝備房",
 special:"地下城奇遇",
 elite:"精英怪物房",
 stairs:"深層入口",
 boss:"Boss 房"
};
const TYPE_ICONS={corridor:"◇",combat:"⚔",trap:"⚠",treasure:"◆",equipment:"▣",special:"✦",elite:"★",stairs:"▼",boss:"♛"};
const MAP_NAMES=["外環廊道","風化石室","斷層回廊","沉降中層","封鎖深層","古代核心","異質地脈層","深淵前庭","核心禁區","最深封印層","失落底層","終末核心"];
const ROOM_NAMES={
 corridor:["殘破回廊","側廳岔路","石柱長廊","風化甬道","潮濕轉角"],
 combat:["獸痕廳","守衛廊","巢穴間","伏擊長廊","碎骨廳"],
 trap:["壓板機關室","落石陷阱房","毒針迴廊","符文警戒室","錯位石門房"],
 treasure:["封存財寶室","舊遠征補給庫","貢品間","沉箱室","失落收藏室"],
 equipment:["軍械封存室","廢棄武具庫","守備裝備間","鍛造遺庫","封蠟兵器房"],
 special:["異常回音室","殘留儀式間","古代記號室","失落營地","地脈交會室"],
 elite:["精英巢室","守層者前哨","強敵盤據廳","深層獵場","古代守衛間"],
 stairs:["向下階梯","深層裂口","沉降梯井","封印升降井","內環入口"],
 boss:["最深處王座間","核心守門廳","封印主室","地下城心臟","終端祭壇"]
};

const PROFILES={
 F:{floors:[2,3],rooms:[4,5],trapDc:10,npcChance:.02,eliteScale:1.18,bossScale:1.55,respawn:18,weights:{corridor:24,combat:26,trap:12,treasure:12,equipment:7,special:11,elite:8}},
 E:{floors:[3,4],rooms:[4,5],trapDc:11,npcChance:.05,eliteScale:1.22,bossScale:1.65,respawn:24,weights:{corridor:20,combat:27,trap:13,treasure:12,equipment:8,special:11,elite:9}},
 D:{floors:[4,5],rooms:[4,6],trapDc:12,npcChance:.09,eliteScale:1.28,bossScale:1.78,respawn:36,weights:{corridor:17,combat:28,trap:14,treasure:11,equipment:9,special:11,elite:10}},
 C:{floors:[5,6],rooms:[5,6],trapDc:13,npcChance:.15,eliteScale:1.34,bossScale:1.92,respawn:48,weights:{corridor:14,combat:29,trap:15,treasure:10,equipment:9,special:11,elite:12}},
 B:{floors:[6,7],rooms:[5,7],trapDc:15,npcChance:.23,eliteScale:1.42,bossScale:2.08,respawn:72,weights:{corridor:11,combat:29,trap:16,treasure:9,equipment:9,special:12,elite:14}},
 A:{floors:[7,9],rooms:[5,7],trapDc:17,npcChance:.33,eliteScale:1.52,bossScale:2.28,respawn:120,weights:{corridor:9,combat:29,trap:17,treasure:8,equipment:8,special:12,elite:17}},
 S:{floors:[9,12],rooms:[6,8],trapDc:19,npcChance:.44,eliteScale:1.65,bossScale:2.55,respawn:168,weights:{corridor:7,combat:28,trap:18,treasure:7,equipment:7,special:12,elite:21}}
};

const SPECIALS=[
 {id:"DS-ECHO",min:"F",name:"前代遠征記號",stat:"智力",dc:10,text:"牆面留下前代探索者的路標與危險符號。",success:"你辨讀出安全路線，附近房間的輪廓被標記。",fail:"符號年代過久，只能確認這裡曾有其他隊伍活動。",effect:"reveal"},
 {id:"DS-LOST-CAMP",min:"E",name:"失落遠征營地",stat:"意志",dc:11,text:"一處被匆忙放棄的營地仍留有乾燥繃帶、繩索與筆記。",success:"你整理出可用補給並降低疲勞。",fail:"可用物資大多已腐壞，只留下零碎紀錄。",effect:"rest"},
 {id:"DS-SEAL",min:"D",name:"失衡封印節點",stat:"智力",dc:13,text:"地面封印線持續閃爍，似乎仍與最深處守衛相連。",success:"你重新導正一部分封印，最深處 Boss 的力量將被削弱。",fail:"你沒有破壞封印，但也無法改變其流向。",effect:"weakenBoss"},
 {id:"DS-LEY",min:"C",name:"流動魔力脈",stat:"意志",dc:14,text:"裸露地脈讓空氣充滿不穩定魔力，短暫接觸可能獲得洞察，也可能造成反噬。",success:"你穩定吸收一小段魔力流，恢復部分 MP 並得到探索心得。",fail:"魔力脈突然偏移，你及時抽身但更加疲勞。",effect:"mana"},
 {id:"DS-RELIC",min:"B",name:"封存遺物台",stat:"幸運",dc:16,text:"石台上留有被多層防護包覆的遺物殘片，價值與風險都難以判定。",success:"你安全取下一份可交易的遺物材料。",fail:"防護層自動封閉，這次無法取得任何東西。",effect:"treasure"},
 {id:"DS-VOID",min:"A",name:"異質空間裂隙",stat:"意志",dc:18,text:"空間短暫重疊，遠處似乎映出不同樓層與其他探索隊的殘影。",success:"你從重疊視野掌握後續道路與競爭者動向。",fail:"視野扭曲使你短暫失去方向，疲勞上升。",effect:"revealDeep"}
];

function rangeInt(a,b){return a+rand(Math.max(1,b-a+1))}
function tierProfile(t){return PROFILES[t]||PROFILES.F}
function ensureState(){
 if(typeof G==="undefined"||!G)return null;
 G.dungeonRuns=G.dungeonRuns&&typeof G.dungeonRuns==="object"?G.dungeonRuns:{};
 G.pendingDungeonEvent=G.pendingDungeonEvent||null;
 G.pendingDungeonBattle=G.pendingDungeonBattle||null;
 return G.dungeonRuns
}
function currentDungeon(){
 if(typeof G==="undefined"||!G?.character)return null;
 const l=loc(G.character.locationId);
 return l?.kind==="dungeon"?l:null
}
function weightedRoom(weights){
 const pairs=Object.entries(weights).map(([k,v])=>[k,v]);
 return weightedPick(pairs)
}
function roomName(type){const p=ROOM_NAMES[type]||ROOM_NAMES.corridor;return p[rand(p.length)]}
function requiredTypesForTier(t){
 const base=["trap","treasure","equipment","special","elite"];
 if(tierOrder(t)>=3)base.push("elite");
 if(tierOrder(t)>=4)base.push("trap","special");
 return base
}
function buildDungeonRun(l){
 const p=tierProfile(l.tier),totalFloors=rangeInt(p.floors[0],p.floors[1]);
 const required=requiredTypesForTier(l.tier).slice();
 const floors=[];
 for(let f=1;f<=totalFloors;f++){
   const roomCount=rangeInt(p.rooms[0],p.rooms[1]),rooms=[];
   for(let r=1;r<=roomCount;r++){
     let type;
     if(f===totalFloors&&r===roomCount)type="boss";
     else if(r===roomCount)type="stairs";
     else if(required.length)type=required.shift();
     else type=weightedRoom(p.weights);
     rooms.push({
       id:"DROOM-"+f+"-"+r,
       floor:f,
       order:r,
       type,
       name:roomName(type),
       revealed:r===1&&f===1,
       cleared:false,
       npcChecked:false,
       entered:false
     });
   }
   floors.push({index:f,mapName:MAP_NAMES[Math.min(MAP_NAMES.length-1,f-1)],revealed:f===1,rooms});
 }
 return {
   version:REVISION,
   locationId:l.id,
   locationName:l.name,
   tier:l.tier,
   createdTurn:G.turn||0,
   createdHour:typeof totalHours==="function"?totalHours():0,
   totalFloors,
   currentFloor:1,
   floors,
   completed:false,
   bossDefeated:false,
   bossWeakened:false,
   cooperationBonus:0,
   rivalPressure:0,
   npcMeetings:0,
   clearedRooms:0,
   completedAtHour:null
 }
}
function getRun(l=currentDungeon(),create=true){
 if(!l)return null;ensureState();
 let run=G.dungeonRuns[l.id];
 if(!run&&create){run=buildDungeonRun(l);G.dungeonRuns[l.id]=run;persist()}
 return run||null
}
function currentFloor(run){return run?.floors?.find(x=>x.index===run.currentFloor)||null}
function nextRoom(run){
 const floor=currentFloor(run);
 return floor?.rooms?.find(x=>!x.cleared)||null
}
function revealAround(run,room,count=2){
 const floor=run.floors.find(x=>x.index===room.floor);if(!floor)return;
 const i=floor.rooms.findIndex(x=>x.id===room.id);
 for(let n=i;n<Math.min(floor.rooms.length,i+count+1);n++)floor.rooms[n].revealed=true
}
function revealNextFloor(run){
 const floor=run.floors.find(x=>x.index===run.currentFloor);
 if(floor){floor.revealed=true;if(floor.rooms[0])floor.rooms[0].revealed=true}
}
function markRoomCleared(run,room){
 if(!room.cleared){room.cleared=true;run.clearedRooms=(run.clearedRooms||0)+1}
 revealAround(run,room,1);
 if(room.type==="stairs"){
   run.currentFloor=Math.min(run.totalFloors,room.floor+1);
   revealNextFloor(run);
   log("地下城","找到通往第 "+run.currentFloor+" 層的道路。","ok")
 }
 if(room.type==="boss"){
   run.bossDefeated=true;run.completed=true;run.completedAtHour=typeof totalHours==="function"?totalHours():0;
   log("地下城","最深處 Boss 已被擊敗，"+run.locationName+" 本輪探索完成。","ok")
 }
 persist()
}
function dungeonCapTier(l){
 return Math.min(tierOrder(l?.tier||"F"),tierOrder(typeof playerAdventureTier==="function"?playerAdventureTier():"F"))
}
function safeTreasurePool(l){
 const cap=dungeonCapTier(l);
 return (DB.items||[]).filter(d=>{
   if(!d||d.sealed||d.unique||EQUIPMENT_TYPES.has(d.type))return false;
   if(tierOrder(d.tier)>cap)return false;
   const src=d.acquisition_sources||[];
   return src.includes("loot")||src.includes("exploration")||src.includes("dungeon")
 })
}
function equipmentPool(l){
 const cap=dungeonCapTier(l);
 return (DB.items||[]).filter(d=>d&&!d.sealed&&!d.unique&&EQUIPMENT_TYPES.has(d.type)&&tierOrder(d.tier)<=cap)
}
function grantTreasure(l,quality=1){
 const p=tierProfile(l.tier),cap=typeof adventureEventMoneyCap==="function"?adventureEventMoneyCap(l,l.tier):20;
 const money=Math.max(3,Math.round(cap*(.25+Math.random()*.35)*quality));
 G.character.moneySilver+=money;
 const got=[money+"銀"];
 const pool=safeTreasurePool(l);
 if(pool.length&&Math.random()<Math.min(.75,.28+.08*tierOrder(l.tier)+.12*(quality-1))){
   const d=pool[rand(pool.length)],qty=Math.max(1,Math.min(2,Math.round(quality)));
   addItem(d.id,qty);got.push(d.name+"×"+qty)
 }
 return got
}
function grantEquipment(l,boss=false){
 const pool=equipmentPool(l);if(!pool.length)return null;
 const cap=dungeonCapTier(l);
 const preferred=pool.filter(d=>tierOrder(d.tier)>=Math.max(0,cap-(boss?1:2)));
 const d=(preferred.length?preferred:pool)[rand((preferred.length?preferred:pool).length)];
 const durability=Math.max(1,Math.round((d.durability||100)*(boss?.72:.48+Math.random()*.22)));
 addItem(d.id,1,{durability});
 return d
}
function dungeonEnemyBase(l){
 let pool=[];
 try{pool=encounterCandidates(l)||[]}catch(e){}
 if(!pool.length)pool=(DB.monsters||[]).filter(m=>tierOrder(m.tier)<=tierOrder(l.tier));
 if(!pool.length)return null;
 const best=Math.max(...pool.map(m=>tierOrder(m.tier)));
 const shortlist=pool.filter(m=>tierOrder(m.tier)>=Math.max(0,best-1));
 return shortlist[rand(shortlist.length)]
}
function dungeonEnemy(l,kind){
 const base=dungeonEnemyBase(l);if(!base)return null;
 const p=tierProfile(l.tier),scale=kind==="boss"?p.bossScale:p.eliteScale;
 const weaken=kind==="boss"&&getRun(l,false)?.bossWeakened?.90:1;
 const name=(kind==="boss"?"守層首領・":"菁英・")+base.name;
 return {
   ...base,
   name,
   tier:l.tier,
   hp:Math.max(2,Math.round((base.hp||30)*scale*weaken)),
   attack:Math.max(2,Math.round((base.attack||10)*(1+(scale-1)*.62)*weaken)),
   defense:Math.max(0,Math.round((base.defense||4)*(1+(scale-1)*.5)*weaken)),
   magicDefense:Math.max(0,Math.round((base.magicDefense||base.defense||4)*(1+(scale-1)*.5)*weaken)),
   accuracy:Math.min(95,Math.round((base.accuracy||68)+(kind==="boss"?5:3))),
   initiative:Math.round((base.initiative||10)+(kind==="boss"?3:1)),
   xp_reward:Math.max(base.xp_reward||0,Math.round((DB.progression_system?.monster_xp_by_tier?.[l.tier]||12)*(kind==="boss"?2.4:1.45))),
   dungeon_variant:kind
 }
}
function startDungeonBattle(run,room,kind){
 const l=loc(run.locationId),enemy=dungeonEnemy(l,kind);
 if(!enemy){log("地下城","此房間的敵人資料無法建立，已視為空房。");markRoomCleared(run,room);return false}
 G.pendingDungeonBattle={locationId:l.id,floor:room.floor,roomId:room.id,kind,enemyBaseId:enemy.id,turn:G.turn};
 startBattle(enemy,kind==="boss"?"地下城Boss":kind==="elite"?"地下城精英":"地下城遭遇");
 return true
}
function dungeonTrap(run,room){
 const l=loc(run.locationId),p=tierProfile(l.tier),roll=rollD20(),mod=Math.floor((effectiveStat("敏捷")-10)/2)+Math.floor((combatStats().perception-35)/24),total=roll+mod;
 log("地下城機關","D20 "+roll+(mod>=0?"+":"")+mod+"="+total+"，DC "+p.trapDc+"。");
 if(total>=p.trapDc){
   log("地下城機關","你察覺「"+room.name+"」的觸發方式並安全通過。","ok")
 }else{
   const dmg=Math.max(2,Math.round((6+tierOrder(l.tier)*5)*(0.75+Math.random()*.5)));
   G.character.hp=Math.max(0,G.character.hp-dmg);G.character.fatigue=clamp(G.character.fatigue+3+tierOrder(l.tier),0,120);
   log("地下城機關","觸發「"+room.name+"」，受到 "+dmg+" 傷害並增加疲勞。","danger");
   if(G.character.hp<=0&&typeof handleBattleDefeat==="function")handleBattleDefeat({name:room.name})
 }
 markRoomCleared(run,room)
}
function dungeonTreasure(run,room){
 const l=loc(run.locationId),got=grantTreasure(l,1);
 log("地下城財寶",room.name+"：取得 "+got.join("、")+"。","ok");markRoomCleared(run,room)
}
function dungeonEquipment(run,room){
 const l=loc(run.locationId),roll=rollD20(),dc=10+tierOrder(l.tier),mod=Math.floor((effectiveStat("幸運")-10)/2),total=roll+mod;
 if(total>=dc){
   const d=grantEquipment(l,false);
   if(d)log("地下城裝備",room.name+"：找到可修復的 "+d.name+"［"+d.tier+"］。","ok");
   else log("地下城裝備",room.name+"：沒有找到適合目前層級的可用裝備。")
 }else log("地下城裝備",room.name+"：D20 "+roll+(mod>=0?"+":"")+mod+"="+total+"，可用武具已嚴重損壞。");
 markRoomCleared(run,room)
}
function dungeonCorridor(run,room){
 const l=loc(run.locationId);
 const t=checkRoll("敏捷","探索");
 const note=room.name+"："+(t>=14?"找到明確路標與近期活動痕跡。":"只確認到零碎足跡與舊標記。");
 recordExplorationIntel(l.id,note,t);log("地下城探索",note,t>=14?"ok":"");markRoomCleared(run,room)
}
function specialTemplate(id){return SPECIALS.find(x=>x.id===id)||null}
function specialCandidates(l){
 return SPECIALS.filter(x=>tierOrder(x.min)<=tierOrder(l.tier))
}
function queueSpecial(run,room){
 const l=loc(run.locationId),pool=specialCandidates(l),t=pool[rand(pool.length)];
 G.pendingDungeonEvent={kind:"special",locationId:l.id,floor:room.floor,roomId:room.id,templateId:t.id,turn:G.turn};
 persist()
}
function makeNpcTeam(l){
 const tier=l.tier,rank=tierOrder(tier);
 const leaders=["赤棘","銀燈","灰隼","遠鐘","黑杉","晨潮","白槍","琥珀","暮風","青砦"];
 const styles=["探索隊","討伐隊","遺跡調查隊","傭兵小隊","公會遠征隊","學院護衛隊"];
 const goals=["尋找最深層通路","追蹤精英魔物","回收遺跡資料","尋找失聯隊員","競逐首領戰利品","測繪地下城地圖"];
 return {name:leaders[rand(leaders.length)]+styles[rand(styles.length)],tier,size:Math.min(6,2+Math.floor(rank/2)+rand(3)),goal:goals[rand(goals.length)]}
}
function maybeQueueNpc(run,room){
 if(room.npcChecked)return false;room.npcChecked=true;
 const l=loc(run.locationId),p=tierProfile(l.tier);
 if(Math.random()>=p.npcChance)return false;
 run.npcMeetings=(run.npcMeetings||0)+1;
 G.pendingDungeonEvent={kind:"npc",locationId:l.id,floor:room.floor,roomId:room.id,team:makeNpcTeam(l),turn:G.turn};
 persist();return true
}
function eventRoom(run,event){
 const floor=run?.floors?.find(x=>x.index===event.floor);
 return floor?.rooms?.find(x=>x.id===event.roomId)||null
}
function openPendingDungeonEvent(){
 ensureState();const ev=G.pendingDungeonEvent;if(!ev)return;
 const run=G.dungeonRuns?.[ev.locationId],room=eventRoom(run,ev),l=loc(ev.locationId);
 if(!run||!room||!l){G.pendingDungeonEvent=null;persist();return}
 if(ev.kind==="npc"){
   const team=ev.team;
   showModal("地下城・遭遇其他冒險團",
     '<div class="card"><b>'+team.name+'</b> <span class="tier">'+team.tier+'</span>｜'+team.size+'人<br><span class="small">目標：'+team.goal+'。高階地下城中，其他 NPC 團隊更常與你競爭路線、情報與戰利品，也可能暫時合作。</span></div>'+
     '<div class="actions"><button class="good" onclick="resolveDungeonEvent(\'cooperate\')">提議合作</button><button class="warn" onclick="resolveDungeonEvent(\'compete\')">競爭路線</button><button onclick="resolveDungeonEvent(\'avoid\')">保持距離</button></div>');
   return
 }
 const t=specialTemplate(ev.templateId);if(!t)return;
 showModal("地下城奇遇・"+t.name,
   '<div class="card"><b>'+room.name+'</b> <span class="tier">'+l.tier+'</span><br><span class="small">'+t.text+'</span></div>'+
   '<div class="actions"><button class="good" onclick="resolveDungeonEvent(\'engage\')">調查／處理</button><button onclick="resolveDungeonEvent(\'leave\')">略過</button></div>')
}
function resolveNpcEvent(ev,run,room,choice){
 const l=loc(ev.locationId),team=ev.team,p=tierProfile(l.tier);
 if(choice==="avoid"){log("地下城NPC","你與 "+team.name+" 保持距離，雙方各自前進。");return}
 const roll=rollD20();
 if(choice==="cooperate"){
   const mod=Math.floor((effectiveStat("魅力")-10)/2)+(G.character.guildReputation||0)>=20?2:0;
   const total=roll+mod,dc=10+tierOrder(l.tier);
   if(total>=dc){
     run.cooperationBonus=Math.min(3,(run.cooperationBonus||0)+1);revealAround(run,room,2);
     G.character.fatigue=clamp(G.character.fatigue-4,0,120);
     log("地下城NPC","與 "+team.name+" 協議成功（D20 "+total+"／DC"+dc+"）；交換地圖、短暫整補，並獲得後續房間情報。","ok")
   }else log("地下城NPC","合作交涉未成立（D20 "+total+"／DC"+dc+"），對方選擇維持各自行動。")
 }else{
   const mod=Math.floor((effectiveStat("敏捷")-10)/2)+Math.floor((combatStats().perception-35)/25),total=roll+mod,dc=11+tierOrder(l.tier);
   if(total>=dc){
     const got=grantTreasure(l,.65);run.rivalPressure=Math.max(0,(run.rivalPressure||0)-1);
     log("地下城NPC","你搶先掌握路線（D20 "+total+"／DC"+dc+"），在競爭中先取得 "+got.join("、")+"。","ok")
   }else{
     run.rivalPressure=(run.rivalPressure||0)+1;G.character.fatigue=clamp(G.character.fatigue+5,0,120);
     log("地下城NPC",team.name+" 搶先一步（D20 "+total+"／DC"+dc+"），你為追趕路線增加疲勞。","warnText")
   }
 }
}
function resolveSpecialEvent(ev,run,room,choice){
 const t=specialTemplate(ev.templateId),l=loc(ev.locationId);if(!t)return;
 if(choice==="leave"){log("地下城奇遇","你略過「"+t.name+"」。");return}
 const roll=rollD20(),mod=Math.floor((effectiveStat(t.stat)-10)/2),total=roll+mod,dc=t.dc+tierOrder(l.tier)*.35;
 if(total>=dc){
   if(t.effect==="reveal")revealAround(run,room,3);
   if(t.effect==="rest")G.character.fatigue=clamp(G.character.fatigue-10,0,120);
   if(t.effect==="weakenBoss")run.bossWeakened=true;
   if(t.effect==="mana"){G.character.mana=clamp(G.character.mana+Math.round(G.character.maxMana*.2),0,G.character.maxMana);const s=(G.character.skills||[]).find(x=>skillLevel(x)<10);if(s)gainSkillXp(s,5,"地下城奇遇")}
   if(t.effect==="treasure"){const got=grantTreasure(l,1.25);log("地下城奇遇","遺物台額外取得 "+got.join("、")+"。","ok")}
   if(t.effect==="revealDeep"){for(const f of run.floors.slice(run.currentFloor-1,run.currentFloor+1)){f.revealed=true;(f.rooms||[]).slice(0,3).forEach(x=>x.revealed=true)}}
   log("地下城奇遇",t.name+"：D20 "+roll+(mod>=0?"+":"")+mod+"="+total+"，成功。"+t.success,"ok")
 }else{
   G.character.fatigue=clamp(G.character.fatigue+(tierOrder(l.tier)>=3?5:2),0,120);
   log("地下城奇遇",t.name+"：D20 "+roll+(mod>=0?"+":"")+mod+"="+total+"，未成功。"+t.fail)
 }
}
function resolveDungeonEvent(choice){
 ensureState();const ev=G.pendingDungeonEvent;if(!ev)return;
 const run=G.dungeonRuns?.[ev.locationId],room=eventRoom(run,ev);
 if(!run||!room){G.pendingDungeonEvent=null;closeModal();persist();return}
 if(ev.kind==="npc")resolveNpcEvent(ev,run,room,choice);else resolveSpecialEvent(ev,run,room,choice);
 G.pendingDungeonEvent=null;markRoomCleared(run,room);closeModal();persist();renderAll()
}
function bossVictoryReward(run){
 const l=loc(run.locationId),p=tierProfile(l.tier),got=grantTreasure(l,1.6);
 if(Math.random()<Math.min(.72,.22+tierOrder(l.tier)*.08)){
   const d=grantEquipment(l,true);if(d)got.push(d.name+"［"+d.tier+"］")
 }
 if(run.cooperationBonus>0)got.push("合作地圖紀錄");
 log("Boss 戰利品","最深處寶箱：取得 "+got.join("、")+"。","ok")
}
function resolveRoom(run,room){
 const l=loc(run.locationId);room.revealed=true;room.entered=true;revealAround(run,room,1);
 if(maybeQueueNpc(run,room)){return {pending:true,hours:1.15}}
 switch(room.type){
   case "corridor":dungeonCorridor(run,room);return {hours:1.0};
   case "combat":return {battle:startDungeonBattle(run,room,"normal"),hours:1.25};
   case "trap":dungeonTrap(run,room);return {hours:1.1};
   case "treasure":dungeonTreasure(run,room);return {hours:1.0};
   case "equipment":dungeonEquipment(run,room);return {hours:1.0};
   case "special":queueSpecial(run,room);return {pending:true,hours:1.2};
   case "elite":return {battle:startDungeonBattle(run,room,"elite"),hours:1.4};
   case "stairs":log("地下城探索","找到「"+room.name+"」。","ok");markRoomCleared(run,room);return {hours:.8};
   case "boss":return {battle:startDungeonBattle(run,room,"boss"),hours:1.6};
   default:markRoomCleared(run,room);return {hours:1}
 }
}
function completedCooldown(run,l){
 if(!run?.completed)return 0;
 const elapsed=(typeof totalHours==="function"?totalHours():0)-(run.completedAtHour||0);
 return Math.max(0,tierProfile(l.tier).respawn-elapsed)
}
function startNewDungeonRun(){
 const l=currentDungeon();if(!l)return;
 ensureState();const old=G.dungeonRuns[l.id],remain=completedCooldown(old,l);
 if(remain>0){alert("地下城尚未重整，約還需要 "+Math.ceil(remain)+" 小時。");return}
 G.dungeonRuns[l.id]=buildDungeonRun(l);G.pendingDungeonEvent=null;G.pendingDungeonBattle=null;closeModal();persist();renderAll();openDungeonMap()
}
function actDungeonExplore(){
 const l=currentDungeon();if(!l)return;
 ensureState();
 let run=getRun(l,true);
 if(run.completed){
   const remain=completedCooldown(run,l);
   if(remain>0){log("地下城","本輪已攻略完成；地下城約 "+Math.ceil(remain)+" 小時後才會重新形成完整探索資源。");openDungeonMap();return}
   showModal("地下城已重整",'<div class="card small">這座地下城已經重新形成可探索路線。開始新一輪後會重新生成內部樓層與房間，但世界地圖位置不變。</div><div class="actions"><button class="good" onclick="startNewDungeonRun()">開始新一輪遠征</button><button onclick="openDungeonMap()">查看舊紀錄</button></div>');
   return
 }
 if(!beginTurn("地下城探索"))return;
 run=getRun(l,true);const room=nextRoom(run);
 if(!room){log("地下城","目前樓層沒有可繼續探索的房間。");endTurn(.5);return}
 log("地下城地圖","第 "+room.floor+"/"+run.totalFloors+" 層・"+TYPE_LABELS[room.type]+"：發現「"+room.name+"」。","ok");
 const result=resolveRoom(run,room)||{};
 updateQuestProgress("action",{action:"探索",location_id:l.id});
 updateQuestProgress("patrol",{location_id:l.id});
 endTurn(result.hours||1.2);
 if(result.pending)openPendingDungeonEvent()
}
function openDungeonMap(){
 const l=currentDungeon();if(!l){alert("目前不在地下城。");return}
 const run=getRun(l,true),profile=tierProfile(l.tier),remain=completedCooldown(run,l);
 const floors=run.floors.map(f=>{
   const rooms=f.rooms.map(r=>{
     const known=r.revealed||r.cleared||f.index<run.currentFloor;
     const label=known?(TYPE_ICONS[r.type]+" "+r.name+(r.cleared?" ✓":"")):"？ 未探索區域";
     return '<div class="small">'+label+'</div>'
   }).join("");
   return '<div class="card"><b>第 '+f.index+' 層・'+f.mapName+'</b>'+(!f.revealed&&f.index>run.currentFloor?' <span class="small">（尚未抵達）</span>':'')+'<div style="margin-top:8px">'+rooms+'</div></div>'
 }).join("");
 const status=run.completed?"已攻略完成":("目前第 "+run.currentFloor+" 層｜已清理 "+run.clearedRooms+" 房");
 const cooldown=run.completed&&remain>0?'<div class="card small">地下城重整剩餘：約 '+Math.ceil(remain)+' 小時。重整前不會重複產生 Boss 與完整寶藏。</div>':"";
 showModal(l.name+"・地下城多地圖",
   '<div class="card"><b>'+status+'</b><br><span class="small">'+l.tier+'級地下城｜'+run.totalFloors+'張內部地圖｜Boss 固定在最深層。NPC 團隊基礎遭遇率 '+Math.round(profile.npcChance*100)+'%；越高世界層級越常出現競爭或合作。</span></div>'+cooldown+floors+
   (run.completed&&remain<=0?'<div class="actions"><button class="good" onclick="startNewDungeonRun()">開始新一輪遠征</button></div>':""))
}
function dungeonAuditIssues(){
 const issues=[];
 if(!DB.dungeon_depth_system||DB.dungeon_depth_system.version!==REVISION)issues.push("地下城深化系統版本缺失");
 for(const l of DB.locations||[]){
   if(l.kind!=="dungeon")continue;
   if(!PROFILES[l.tier])issues.push("地下城層級無設定:"+l.name)
 }
 if(typeof G!=="undefined"&&G){
   ensureState();
   for(const [id,run] of Object.entries(G.dungeonRuns||{})){
     const l=loc(id);if(!l||l.kind!=="dungeon"){issues.push("地下城存檔孤兒:"+id);continue}
     if(!Array.isArray(run.floors)||!run.floors.length)issues.push("地下城樓層缺失:"+l.name);
     const bosses=(run.floors||[]).flatMap(f=>f.rooms||[]).filter(r=>r.type==="boss");
     if(bosses.length!==1)issues.push("Boss房數量異常:"+l.name)
   }
 }
 return issues
}

DB.dungeon_depth_system={
 version:REVISION,
 mode:"multi_map",
 world_tier_profiles:PROFILES,
 room_types:Object.keys(TYPE_LABELS),
 features:["依世界層級產生多張地下城內部地圖","機關陷阱房","財寶房","裝備房","地下城專屬奇遇","精英怪物","最深處Boss房","高階地下城NPC團隊競爭／合作","完成後依層級重整冷卻","地下城進度寫入既有本機存檔"],
 rules:[
   "世界地圖的地下城 location ID 保持不變，內部樓層使用獨立可存檔狀態。",
   "最深層固定且僅有一個 Boss 房；Boss 未擊敗前不得標記本輪完成。",
   "寶藏與裝備獎勵受地下城層級及角色可承受層級雙重限制，不直接越階。",
   "高階地下城提高 NPC 團隊遭遇率，但合作與競爭結果仍由 D20 與角色能力決定。",
   "地下城完成後有重整時間，避免無限重複刷取 Boss 與寶藏。"
 ],
 npc_team_chance:Object.fromEntries(Object.entries(PROFILES).map(([k,v])=>[k,v.npcChance])),
 save_compatible:true
};
DB.meta.dungeon_depth_revision=REVISION;
if(DB.integration_registry?.optimization_notes)DB.integration_registry.optimization_notes.push("CURRENT-1.67.0／DUNGEON-DEPTH-2.0：地下城改為依世界層級生成多樓層地圖，加入陷阱、財寶、裝備、專屬奇遇、精英、最深處Boss與高階NPC團隊競合；既有地點ID與舊存檔原地相容。");

ensureState();

const baseActExplore=globalThis.actExplore;
if(typeof baseActExplore==="function"){
 globalThis.actExplore=function(){
   const l=currentDungeon();
   if(l)return actDungeonExplore();
   return baseActExplore()
 }
}
const baseBeginTurn=globalThis.beginTurn;
if(typeof baseBeginTurn==="function"){
 globalThis.beginTurn=function(reason){
   ensureState();
   if(G?.pendingDungeonEvent){openPendingDungeonEvent();return false}
   return baseBeginTurn(reason)
 }
}
const baseRenderActions=globalThis.renderActions;
if(typeof baseRenderActions==="function"){
 globalThis.renderActions=function(){
   baseRenderActions();
   const l=currentDungeon(),box=document.querySelector("#actionButtons");if(!box)return;
   box.querySelectorAll("[data-dungeon-extra]").forEach(x=>x.remove());
   if(!l)return;
   const run=getRun(l,true);
   const first=[...box.querySelectorAll("button")].find(b=>b.textContent.trim()==="探索");
   if(first)first.textContent=run.completed?"地下城紀錄":"地下城探索";
   const map=document.createElement("button");map.type="button";map.dataset.dungeonExtra="map";map.textContent="地下城地圖 "+run.currentFloor+"/"+run.totalFloors;map.onclick=openDungeonMap;box.appendChild(map);
   if(G.pendingDungeonEvent){
     const pending=document.createElement("button");pending.type="button";pending.dataset.dungeonExtra="pending";pending.className="warn";pending.textContent="處理地下城事件";pending.onclick=openPendingDungeonEvent;box.appendChild(pending)
   }
 }
}
const baseFinishBattle=globalThis.finishBattle;
if(typeof baseFinishBattle==="function"){
 globalThis.finishBattle=function(result){
   const pending=G?.pendingDungeonBattle?{...G.pendingDungeonBattle}:null;
   const boss=result==="勝利"&&pending?.kind==="boss";
   baseFinishBattle(result);
   if(!pending)return;
   const run=G?.dungeonRuns?.[pending.locationId],floor=run?.floors?.find(x=>x.index===pending.floor),room=floor?.rooms?.find(x=>x.id===pending.roomId);
   if(result==="勝利"&&run&&room){
     markRoomCleared(run,room);
     if(boss)bossVictoryReward(run)
   }else if(result!=="勝利"&&run&&room){
     room.revealed=true;log("地下城",room.name+" 尚未清理，可在狀態允許時再次挑戰。")
   }
   G.pendingDungeonBattle=null;persist();renderAll()
 }
}
const baseRunAudit=globalThis.runAudit;
if(typeof baseRunAudit==="function"){
 globalThis.runAudit=function(){
   const result=baseRunAudit();
   const issues=dungeonAuditIssues();
   if(issues.length)log("五回合自檢","地下城系統："+issues.join("、"),"danger");
   return result
 }
}

globalThis.openDungeonMap=openDungeonMap;
globalThis.openPendingDungeonEvent=openPendingDungeonEvent;
globalThis.resolveDungeonEvent=resolveDungeonEvent;
globalThis.startNewDungeonRun=startNewDungeonRun;
globalThis.dungeonAuditIssues=dungeonAuditIssues;
})();