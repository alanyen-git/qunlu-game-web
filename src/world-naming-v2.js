/*
 * 群陸旅誌世界命名一致性補丁：文化分區重構
 * WORLD-NAMING-3.0
 * 原則：只調整顯示名稱與其文字引用；不更動資料 ID、鍵值、規則、數值或存檔 schema。
 * 保護：雷煌流、雷鳴流及其既有關聯設定不做泛化改名；名品武士刀「闇夜」恢復並列入保護。
 */
(()=>{
  'use strict';
  const db=(typeof DB!=='undefined'&&DB)||(typeof window!=='undefined'&&window.QUNLU_DATA);
  if(!db||typeof db!=='object')return;

  const REVISION='WORLD-NAMING-3.0';
  const PROTECTED_TOKENS=Object.freeze(['雷煌流','雷鳴流','柳生唯心流','名品武士刀「闇夜」','闇夜']);

  const EXACT_RENAMES=Object.freeze({
    // 第一輪殘留的「雙名稱／斜線」與過度說明式名稱
    '狼裔獸人 / 沃夫金':'沃夫金',
    '犢頭人 / 彌諾陶洛斯裔':'彌諾陶裔',
    '獅裔獸人 / 萊昂尼':'萊昂尼',
    '野豬裔獸人 / 契古林':'野豬裔獸人',
    '鷹裔翼人 / 艾維安':'艾維安',
    '鹿裔半獸人 / 塞爾維':'塞爾維',
    '鳳凰血裔 / 菲尼克斯族':'菲尼克斯族',
    '龍裔 / 龍脈族':'龍裔',
    '邪魔裔 / 提夫林':'魔裔',
    '決鬥家 / 劍士':'劍士',
    '奧術師 / 巫師':'奧術法師',
    '雷角偽龍 / 亞龍':'雷角偽龍',
    '霜原白熊王 / 寒霜巨獸':'霜原白熊王',

    // 第一輪產生的語意或結構冗餘
    '三岔古驛站地下地牢':'三岔古驛站地窖',
    '霜石法老/古王之墓底層':'霜石古王墓底層',
    '廢棄鐵礦坑坑道':'廢棄鐵礦坑道',
    '第九階位古谷遺跡':'九階谷古遺跡',
    '潮汐之門城':'潮汐之門',
    '鐵熔熔砧城':'熔砧城',
    '翠綠枝庭王宮':'翠枝王庭',
    '萬帳游牧同盟領':'萬帳盟地',
    '霜壁要塞城':'霜壁要塞',
    '聖天衡平大教堂':'聖衡教會',
    '鏡輝王國大使館外交總署':'鏡輝王國使節院',
    '初階生命治療藥水':'初階治療藥水',
    '初階法力補充藥水':'初階法力藥水',

    // 第三輪：一般西方流派去模板化；東方劍術文化圈保留家系、道場、武士刀與「○○流」傳統
    '鐵旗守勢流':'鐵旗盾劍戰法',
    '霧徑聽息流':'霧徑獵行戰技',
    '碎浪繩鬥術':'碎浪救難戰技',
    '霜線獵槍術':'霜線獵槍戰技',
    '白塔護印術':'白塔護印法',

    // 第一輪仍帶有『流派』模板感的名稱
    '磐石守護流派':'磐石守衛劍術',
    '翠葉纏繞流派':'翠葉牽制戰技',
    '影柳護手劍流派':'影柳護手劍學派',
    '斷浪斬切流派':'斷浪劍術學派',
    '幻月殘影流派':'幻月游鬥學派',
    '逆潮巨劍流派':'逆潮巨劍學派',
    '玄鐵重錘流派':'玄鐵戰錘學派',
    '飛鶴刺擊流派':'飛鶴刺劍學派',
    '幻蛻步法流派':'幻蛻游鬥戰技',
    '熾蓮火焰劍流派':'熾蓮焰劍學派',
    '疾風獵手流派':'疾風獵手戰技',
    '鏡心反擊流派':'鏡心反擊劍術',
    '霜華凜冽流派':'霜華寒刃劍術',
    '名劍「吹雪・霜痕」':'名品武士刀「吹雪」',

    // 第一輪曾可能誤改的鎖定裝備：強制恢復
    '暗影長劍「永夜」':'名品武士刀「闇夜」',
    '霜痕長劍「暴雪」':'名品武士刀「吹雪」',
    '寶劍「金獅之咬」':'名品武士刀「玉獅子」',
    '狂雷斬魔大劍「雷鬼」':'名品武士刀「雷電鬼」',
    '夜紋精鋼護手劍':'夜紋精鋼武士刀',
    '溪楓精鋼弧刃彎刀':'溪楓精鋼武士刀',
    '鏡輝秘銀騎士長劍':'鏡京秘銀武士刀',
    '黑鐵雙手開鋒大劍':'黑鐵武士刀',
    '鏡輝星都・斯佩庫拉':'鏡京',
    '鏡輝王國使節院':'鏡京使節院',
    '柳生惟心流':'柳生唯心流',
    '白柳劍術學派':'柳生唯心流',
    '柳橋鎮鎮守官':'柳橋鎮守官',
    '松谷村村長':'松谷村長',
    '石渡鎮鎮長':'石渡鎮長',
    '白石城城務官':'白石城務官',
    '自由傭兵工會':'自由傭兵公會'
  });

  const REFERENCE_RENAMES=Object.freeze({
    // 僅處理具唯一性的舊專名，避免把一般詞彙（如戰士、法師、精靈）在敘述中過度替換。
    '伊爾凡現行政體':'伊爾凡大公國',
    '卡斯維爾現行政體':'卡斯維爾高地聯邦',
    '德魯安現行政體':'德魯安神聖教皇領',
    '月津現行政體':'月津自由港聯盟',
    '格魯瑪克現行政體':'格魯瑪克鐵血王國',
    '瓦恩現行政體':'瓦恩守護者邊境領',
    '索雷恩現行政體':'索雷恩選帝侯領',
    '赤砂現行政體':'赤砂部族大酋邦',
    '鐵脊現行政體':'鐵脊山脈聯合王國',
    '九階橋走私幫':'九階橋黑市走私公會',
    '黑玻璃密教':'黑琉璃神秘教團',
    '黯海魔紋議環':'黯海魔符長老會',
    '極北霜契分支':'霜誓極北兄弟會',
    '古龍巢界盟約':'古龍巢穴守護同盟',
    '赤羽涅槃議環':'朱羽涅槃評議會',
    '鎖舌社群':'封舌隱秘結社',
    '白棘修會':'白棘聖修士會',
    '聖衡教會':'聖衡教會',
    '靛星觀測院':'靛藍星辰皇家天文台',
    '鏡京藩使書契院':'鏡京使節院',
    '不動山流':'磐石守衛劍術',
    '千葉流':'翠葉牽制戰技',
    '天弦流':'蒼天星弦弓術學派',
    '影柳流':'影柳護手劍學派',
    '斷水流':'斷浪劍術學派',
    '朧月流':'幻月游鬥學派',
    '潮返流':'逆潮巨劍學派',
    '玄鐵流':'玄鐵戰錘學派',
    '白鶴流':'飛鶴刺劍學派',
    '空蟬流':'幻蛻游鬥戰技',
    '紅蓮流':'熾蓮焰劍學派',
    '蒼風流':'疾風獵手戰技',
    '鏡心流':'鏡心反擊劍術',
    '霜華流':'霜華寒刃劍術',
    '初階恢復藥劑':'初階治療藥水',
    '初階魔力恢復藥劑':'初階法力藥水',
    '北境驅寒藥劑':'北境抗寒靈藥',
    '月露退熱露':'月華退熱藥膏',
    '白棘回生藥劑':'白棘復生靈藥',
    '名品武士刀「吹雪」':'名品武士刀「吹雪」',
    '名品武士刀「玉獅子」':'名品武士刀「玉獅子」',
    '名品武士刀「雷電鬼」':'名品武士刀「雷電鬼」',
    '夜紋精鋼武士刀':'夜紋精鋼武士刀',
    '溪楓精鋼武士刀':'溪楓精鋼武士刀',
    '鏡京秘銀武士刀':'鏡京秘銀武士刀',
    '黑鐵武士刀':'黑鐵武士刀',
    '九脊天蠍':'九脊魔蠍',
    '雷角亞龍':'雷角偽龍',
    '地行亞龍':'地行龍蜥',
    '盲眼岩蟾':'巨型盲眼窟蟾',
    '岩翎鳳獸':'熔岩鳳凰獸',
    '聖衡誓羽獅鷲':'聖天誓羽獅鷲',
    '霜原白王':'霜原白熊王',
    '河望城':'綠河望城',
    '潮門城':'潮汐之門',
    '熔砧城':'熔砧城',
    '白鐘城':'白銀鐘樓城',
    '翠枝王庭':'翠枝王庭',
    '萬帳盟地':'萬帳盟地',
    '萬泉城':'萬泉綠洲城',
    '鏡京':'鏡京',
    '霜壁城':'霜壁要塞',
    '三岔古驛站地下庫':'三岔古驛站地窖',
    '霜石王墓下層':'霜石古王墓底層',
    '廢棄礦坑外圍礦道':'廢棄鐵礦坑道',
    '九階谷遺址':'九階谷古遺跡',
    '萬泉流砂地':'萬泉陷落流沙荒漠',
    '鏡浦火山裂地':'鏡浦火山地熱裂谷',
    '鐘丘灰霧谷':'霧丘灰霧迷谷',
  });

  const TEXT_RENAMES=Object.freeze({...REFERENCE_RENAMES,...EXACT_RENAMES});
  const TEXT_ENTRIES=Object.entries(TEXT_RENAMES).filter(([a,b])=>a&&b&&a!==b).sort((a,b)=>b[0].length-a[0].length);
  const escapeRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const TEXT_RE=TEXT_ENTRIES.length?new RegExp(TEXT_ENTRIES.map(([name])=>escapeRe(name)).join('|'),'g'):null;

  const stats={
    version:REVISION,
    changed:0,
    exactChanged:0,
    referenceChanged:0,
    protectedHits:0,
    byOldName:{},
    remainingSuspects:[]
  };
  const seen=new WeakSet();
  const NAME_KEY_RE=/(?:^|_)(?:name|title|label|display_name|display|short_name|long_name|alias|aliases|names)$/i;
  const INTERNAL_PATH_RE=/^DB\.(?:meta|management_ai|generators|program_registry_system|release_integrity_system|name_generator_system|world_naming_policy)(?:\.|\[|$)/;
  const SUSPECT_RULES=Object.freeze([
    ['slash-alternative',/\s[\/／]\s|\/|／/],
    ['placeholder',/(現行政體|未命名|暫定名稱|測試名稱|TODO|TBD|TEMP)/i],
    ['word-duplication',/(熔熔|坑坑|地下地牢|要塞城|之門城)/],
    ['martial-template',/(?:流派)$/]
  ]);

  function recordChange(oldName,kind){
    stats.changed+=1;
    if(kind==='exact')stats.exactChanged+=1;
    if(kind==='reference')stats.referenceChanged+=1;
    stats.byOldName[oldName]=(stats.byOldName[oldName]||0)+1;
  }

  function replaceKnown(value){
    if(typeof value!=='string'||!value)return value;
    if(PROTECTED_TOKENS.some(token=>value.includes(token)))return value;
    let next=value;
    const exact=EXACT_RENAMES[next];
    if(exact&&exact!==next){
      recordChange(next,'exact');
      next=exact;
    }
    if(!TEXT_RE)return next;
    return next.replace(TEXT_RE,match=>{
      const replacement=TEXT_RENAMES[match];
      if(!replacement||replacement===match)return match;
      recordChange(match,'reference');
      return replacement;
    });
  }

  function auditName(value,path){
    if(typeof value!=='string'||!value)return;
    if(INTERNAL_PATH_RE.test(path))return;
    if(PROTECTED_TOKENS.some(token=>value.includes(token))){
      stats.protectedHits+=1;
    }
    const reasons=[];
    for(const [code,re] of SUSPECT_RULES){if(re.test(value))reasons.push(code)}
    if(!reasons.length)return;
    if(PROTECTED_TOKENS.some(token=>value===token||value.includes(token))&&reasons.every(x=>x==='martial-template'||x==='east-asian-template'))return;
    if(stats.remainingSuspects.length<120)stats.remainingSuspects.push({path,value,reasons});
  }

  function walk(node,path='DB',parentKey=''){
    if(node==null)return;
    if(typeof node==='string'){
      auditName(node,path);
      return;
    }
    if(typeof node!=='object'||seen.has(node))return;
    seen.add(node);

    if(Array.isArray(node)){
      for(let i=0;i<node.length;i++){
        const value=node[i];
        const childPath=`${path}[${i}]`;
        if(typeof value==='string'){
          const next=replaceKnown(value);
          if(next!==value)node[i]=next;
          if(NAME_KEY_RE.test(parentKey))auditName(node[i],childPath);
        }else walk(value,childPath,parentKey);
      }
      return;
    }

    for(const [key,value] of Object.entries(node)){
      const childPath=`${path}.${key}`;
      if(typeof value==='string'){
        const next=replaceKnown(value);
        if(next!==value)node[key]=next;
        if(NAME_KEY_RE.test(key))auditName(node[key],childPath);
      }else if(value&&typeof value==='object'){
        walk(value,childPath,key);
      }
    }
  }

  walk(db);
  db.meta=db.meta||{};
  db.meta.world_naming_revision=REVISION;
  db.meta.naming_audit_round=3;
  db.meta.naming_philosophy='文化、地理、用途、歷史優先於華麗詞堆疊';
  db.world_naming_policy={
    version:REVISION,culture_first:true,internal_system_names_excluded:true,
    culture_registers:{
      asdale_west:'河流、橋梁、林地、舊堡、農產、家族史',
      valrek_imperial:'堡關、軍道、高原、軍團、帝國行政',
      elven:'林庭、古樹、水域、星路、祖源家名',
      dwarven:'深廳、礦門、熔爐、鐵砧、氏族工藝',
      free_city:'港務、橋關、船塢、市場、商館',
      beast_steppe:'草原、水源、石圈、牧路、氏族圖騰',
      dark_elf:'深庭、晶洞、誓井、家門、地下河',
      eastern_sword:'家系、道場、武士刀、山水地名與「○○流」師承'
    },
    rules:['世界內名稱與管理AI／生成器名稱分開治理。','人物先定文化與家系；地名先定地理與歷史；組織先定職能；流派先定文化與武器。','F/E級內容優先直觀實用名稱；B級以上題名需有正史、事件或唯一性來源。','東方劍術詞法只在東方文化或有明確交流來源時使用，不再自動西化。','阿斯戴爾西境避免無理由重複星、霜、銀、影等華麗萬用詞根。'],
    save_compatible:true
  };

  const report=Object.freeze({
    ...stats,
    remainingSuspectCount:stats.remainingSuspects.length,
    protectedTokens:[...PROTECTED_TOKENS],
    appliedAt:new Date().toISOString()
  });
  if(typeof window!=='undefined'){
    window.QUNLU_WORLD_NAMING_V2=report;
    window.QUNLU_WORLD_NAMING_LATEST=report;
  }
  if(typeof console!=='undefined'&&console.info)console.info('[QUNLU] WORLD-NAMING-3.0 applied',report);
})();
