/*
 * 群陸旅誌世界命名一致性補丁
 * WORLD-NAMING-1.2
 * 原則：僅調整顯示名稱值，不更動資料 ID、規則、數值與引用鍵。
 * 鎖定：雷煌流、雷鳴流除技能名稱外，所有相關資料保持原樣。
 */
(()=>{
  'use strict';
  const db=(typeof DB!=='undefined'&&DB)||(typeof window!=='undefined'&&window.QUNLU_DATA);
  if(!db||typeof db!=='object')return;

  const PROTECTED_STYLE_NAMES=Object.freeze(['雷煌流','雷鳴流']);
  const SKILL_KEY_RE=/(?:skill|skills|ability|abilities|technique|techniques|move|moves|技能|招式|技法)/i;

  const SKILL_RENAMES=Object.freeze({
    '一念斷隙':'閃隙割裂',
    '三段封路':'三重截道阻擊',
    '無影藏矢':'幻影匿矢',
    '不動山返斬':'磐石反擊斬',
    '千葉縛枝':'荊棘纏繞',
    '天弦騎斬':'聖天騎戰擊',
    '心眼':'靈覺洞察',
    '斷水護線':'截流架勢',
    '朧月替影':'月影虛像',
    '柳風卸勢':'柔風化勁',
    '潮返甲板步':'浪潮步法',
    '玄鐵破甲':'破甲重鎚擊',
    '白鶴穿雲':'疾雲突刺',
    '空蟬脫位':'褪殼遁影',
    '紅蓮連迫':'熾蓮連擊',
    '鏡心返照':'鏡壁反制',
    '雷鳴直進':'迅雷衝鋒'
  });

  const NAME_RENAMES=Object.freeze({
    // 政體
    '伊爾凡現行政體':'伊爾凡大公國',
    '卡斯維爾現行政體':'卡斯維爾高地聯邦',
    '德魯安現行政體':'德魯安神聖教皇領',
    '月津現行政體':'月津自由港聯盟',
    '格魯瑪克現行政體':'格魯瑪克鐵血王國',
    '瓦恩現行政體':'瓦恩守護者邊境領',
    '索雷恩現行政體':'索雷恩選帝侯領',
    '赤砂現行政體':'赤砂部族大酋邦',
    '鐵脊現行政體':'鐵脊山脈聯合王國',

    // 種族
    '獸人狼族':'狼裔獸人 / 沃夫金',
    '獸人（牛族）':'犢頭人 / 彌諾陶洛斯裔',
    '獸人（獅族）':'獅裔獸人 / 萊昂尼',
    '獸人（野豬族）':'野豬裔獸人 / 契古林',
    '獸人（鷹族）':'鷹裔翼人 / 艾維安',
    '獸人（鹿族）':'鹿裔半獸人 / 塞爾維',
    '真鳳':'鳳凰血裔 / 菲尼克斯族',
    '真龍':'龍裔 / 龍脈族',
    '矮人':'山丘矮人',
    '精靈':'森之精靈',
    '魔族':'邪魔裔 / 提夫林',

    // 戰鬥職業
    '劍客':'決鬥家 / 劍士',
    '弓手':'神射手',
    '德魯伊':'荒野德魯伊',
    '戰士':'悍勇戰士',
    '斥候':'游俠斥候',
    '法師':'奧術師 / 巫師',
    '祭司':'聖職牧師',

    // 魔法系譜
    '光明術式':'輝光系法術',
    '死亡術式':'死靈系法術',
    '元素術式（火/水/風/地/雷）':'塑能與自然系法術',
    '黑暗術式':'暗影系法術',

    // 組織與派系
    '九階橋走私幫':'九階橋黑市走私公會',
    '黑玻璃密教':'黑琉璃神秘教團',
    '黯海魔紋議環':'黯海魔符長老會',
    '極北霜契分支':'霜誓極北兄弟會',
    '古龍巢界盟約':'古龍巢穴守護同盟',
    '赤羽涅槃議環':'朱羽涅槃評議會',
    '鎖舌社群':'封舌隱秘結社',
    '白棘修會':'白棘聖修士會',
    '聖衡教會':'聖天衡平大教堂',
    '靛星觀測院':'靛藍星辰皇家天文台',
    '鏡京藩使書契院':'鏡京使節院',

    // 武術流派（雷煌流、雷鳴流刻意排除）
    '不動山流':'磐石守護流派',
    '千葉流':'翠葉纏繞流派',
    '天弦流':'蒼天星弦弓術學派',
    '影柳流':'影柳護手劍流派',
    '斷水流':'斷浪斬切流派',
    '朧月流':'幻月殘影流派',
    '潮返流':'逆潮巨劍流派',
    '玄鐵流':'玄鐵重錘流派',
    '白鶴流':'飛鶴刺擊流派',
    '空蟬流':'幻蛻步法流派',
    '紅蓮流':'熾蓮火焰劍流派',
    '蒼風流':'疾風獵手流派',
    '鏡心流':'鏡心反擊流派',
    '霜華流':'霜華凜冽流派',

    // 藥劑與消耗品
    '初階恢復藥劑':'初階生命治療藥水',
    '初階魔力恢復藥劑':'初階法力補充藥水',
    '北境驅寒藥劑':'北境抗寒靈藥',
    '月露退熱露':'月華退熱藥膏',
    '白棘回生藥劑':'白棘復生靈藥',

    // 裝備
    '名品武士刀「吹雪」':'名品武士刀「吹雪」',
    '名品武士刀「玉獅子」':'名品武士刀「玉獅子」',
    '名品武士刀「闇夜」':'名品武士刀「闇夜」',
    '名品武士刀「雷電鬼」':'名品武士刀「雷電鬼」',
    '夜紋精鋼武士刀':'夜紋精鋼武士刀',
    '溪楓精鋼武士刀':'溪楓精鋼武士刀',
    '鏡京秘銀武士刀':'鏡京秘銀武士刀',
    '黑鐵武士刀':'黑鐵武士刀',

    // 怪物
    '九脊天蠍':'九脊魔蠍',
    '雷角亞龍':'雷角偽龍 / 亞龍',
    '地行亞龍':'地行龍蜥',
    '盲眼岩蟾':'巨型盲眼窟蟾',
    '岩翎鳳獸':'熔岩鳳凰獸',
    '聖衡誓羽獅鷲':'聖天誓羽獅鷲',
    '霜原白王':'霜原白熊王 / 寒霜巨獸',

    // 城鎮與主城
    '河望城':'綠河望城',
    '潮門城':'潮汐之門城',
    '熔砧城':'鐵熔熔砧城',
    '白鐘城':'白銀鐘樓城',
    '翠枝王庭':'翠綠枝庭王宮',
    '萬帳盟地':'萬帳游牧同盟領',
    '萬泉城':'萬泉綠洲城',
    '鏡京':'鏡京',
    '霜壁城':'霜壁要塞城',

    // 地下城
    '三岔古驛站地下庫':'三岔古驛站地下地牢',
    '霜石王墓下層':'霜石法老/古王之墓底層',
    '廢棄礦坑外圍礦道':'廢棄鐵礦坑坑道',
    '九階谷遺址':'第九階位古谷遺跡',

    // 險地
    '萬泉流砂地':'萬泉陷落流沙荒漠',
    '鏡浦火山裂地':'鏡浦火山地熱裂谷',
    '鐘丘灰霧谷':'霧丘灰霧迷谷',

    ...SKILL_RENAMES
  });

  const stats={version:'WORLD-NAMING-1.2',changed:0,skillChanged:0,protectedRecords:0,protectedBranches:0,readOnlySkipped:0,byOldName:{}};
  const seen=new WeakMap();

  const protectedText=value=>typeof value==='string'&&PROTECTED_STYLE_NAMES.some(name=>value.includes(name));
  const protectedKey=key=>PROTECTED_STYLE_NAMES.some(name=>String(key).includes(name));
  const isProtectedRecord=node=>{
    if(!node||typeof node!=='object'||Array.isArray(node))return false;
    return Object.entries(node).some(([key,value])=>protectedKey(key)||(typeof value!=='object'&&protectedText(String(value??''))));
  };
  const markSeen=(node,mode)=>{
    const bit=mode==='regular'?1:mode==='protected'?2:4;
    const prior=seen.get(node)||0;
    if(prior&bit)return true;
    seen.set(node,prior|bit);
    return false;
  };
  const recordChange=(oldName,isSkill)=>{
    stats.changed+=1;
    if(isSkill)stats.skillChanged+=1;
    stats.byOldName[oldName]=(stats.byOldName[oldName]||0)+1;
  };
  const replaceExact=(value,map)=>{
    if(typeof value!=='string')return value;
    const next=map[value];
    return next&&next!==value?next:value;
  };
  const assignReplacement=(node,key,value,map,isSkill)=>{
    const next=replaceExact(value,map);
    if(next===value)return;
    const descriptor=Object.getOwnPropertyDescriptor(node,key);
    if(descriptor&&descriptor.writable===false&&typeof descriptor.set!=="function"){stats.readOnlySkipped+=1;return}
    try{
      node[key]=next;
      if(node[key]===next)recordChange(value,isSkill);
      else stats.readOnlySkipped+=1;
    }catch(error){stats.readOnlySkipped+=1}
  };

  const walk=(node,mode='regular')=>{
    if(!node||typeof node!=='object'||markSeen(node,mode))return;

    if(mode==='regular'&&isProtectedRecord(node)){
      stats.protectedRecords+=1;
      walk(node,'protected');
      return;
    }

    if(Array.isArray(node)){
      for(let i=0;i<node.length;i++){
        const value=node[i];
        if(typeof value==='string'){
          if(mode==='regular')assignReplacement(node,i,value,NAME_RENAMES,false);
          else if(mode==='skill')assignReplacement(node,i,value,SKILL_RENAMES,true);
        }else if(value&&typeof value==='object'){
          walk(value,mode);
        }
      }
      return;
    }

    for(const [key,value] of Object.entries(node)){
      if(mode==='regular'&&protectedKey(key)){
        stats.protectedBranches+=1;
        if(value&&typeof value==='object')walk(value,'protected');
        continue;
      }

      if(mode==='protected'){
        if(SKILL_KEY_RE.test(key)){
          if(typeof value==='string')assignReplacement(node,key,value,SKILL_RENAMES,true);
          else if(value&&typeof value==='object')walk(value,'skill');
        }else if(value&&typeof value==='object'){
          // 僅向下尋找技能分支；保護模式不修改其他欄位。
          walk(value,'protected');
        }
        continue;
      }

      if(mode==='skill'){
        if(typeof value==='string')node[key]=replaceExact(value,SKILL_RENAMES,true);
        else if(value&&typeof value==='object')walk(value,'skill');
        continue;
      }

      if(typeof value==='string')assignReplacement(node,key,value,NAME_RENAMES,Object.prototype.hasOwnProperty.call(SKILL_RENAMES,value));
      else if(value&&typeof value==='object')walk(value,'regular');
    }
  };

  walk(db,'regular');
  const report=Object.freeze({...stats,protectedStyles:[...PROTECTED_STYLE_NAMES],appliedAt:new Date().toISOString()});
  if(typeof window!=='undefined')window.QUNLU_WORLD_NAMING=report;
  if(typeof console!=='undefined'&&console.info)console.info('[QUNLU] WORLD-NAMING-1.2 applied',report);
})();
