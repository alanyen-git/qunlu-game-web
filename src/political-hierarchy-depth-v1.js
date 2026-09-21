/* 群陸旅誌：政治階層深化 CURRENT-1.90.0
 * POLITICAL-HIERARCHY-DEPTH-1.2
 * 將政治禮序、法定權能、官職、爵位與榮譽身分分離，並為每種CURRENT政治體建立可查詢的完整階層。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB)return;

const RELEASE=globalThis.QUNLU_CORE?.release?.("CURRENT-1.90.0")||"CURRENT-1.90.0";
const REV="POLITICAL-HIERARCHY-DEPTH-1.2";

const RANK_CLASSES=Object.freeze({
  sovereign:{label:"主權位",governing_default:true,hereditary_default:false},
  dynastic:{label:"王族／繼承身分",governing_default:false,hereditary_default:true},
  high_nobility:{label:"高位封建爵位",governing_default:true,hereditary_default:true},
  nobility:{label:"封建爵位",governing_default:true,hereditary_default:true},
  knightly:{label:"騎士身分",governing_default:false,hereditary_default:false},
  civic_mandate:{label:"市政公職",governing_default:true,hereditary_default:false},
  civic_seat:{label:"議席／代表",governing_default:true,hereditary_default:false},
  citizen:{label:"公民身分",governing_default:false,hereditary_default:false},
  clerical:{label:"神職權位",governing_default:true,hereditary_default:false},
  arcane:{label:"奧術權位",governing_default:true,hereditary_default:false},
  clan:{label:"氏族／部族權位",governing_default:true,hereditary_default:false},
  military:{label:"軍政權位",governing_default:true,hereditary_default:false},
  administrative:{label:"受任官職",governing_default:true,hereditary_default:false},
  honorary:{label:"純榮譽身分",governing_default:false,hereditary_default:false},
  de_facto:{label:"事實勢力位階",governing_default:false,hereditary_default:false}
});

function n(title,rankClass,authorityTier,extra={}){
  const base=RANK_CLASSES[rankClass]||RANK_CLASSES.honorary;
  return {
    title,rank_class:rankClass,authority_tier:authorityTier,
    governing_default:extra.governing_default??base.governing_default,
    hereditary:extra.hereditary??base.hereditary_default,
    territorial:extra.territorial??false,
    track:extra.track||"main",
    acquisition:extra.acquisition||null,
    rights_note:extra.rights_note||null,
    note:extra.note||""
  };
}

const TEMPLATES=Object.freeze({
  "封建王國":[
    n("{top}","sovereign","AUTH-6",{territorial:true,hereditary:true,acquisition:"王室繼承＋諸侯承認／加冕",rights_note:"完整國家主權"}),
    n("王儲／王太子","dynastic","AUTH-5",{hereditary:true,acquisition:"依法統指定或出生序列",note:"繼承順位不等於現任統治權。"}),
    n("親王","dynastic","AUTH-5",{hereditary:true,territorial:false,acquisition:"王族血統或國王冊封",note:"禮序高，但沒有封地／官職時不自動取得地方統治權。"}),
    n("公爵","high_nobility","AUTH-5",{territorial:true,acquisition:"世襲封爵／王權冊封"}),
    n("侯爵","high_nobility","AUTH-4",{territorial:true,acquisition:"世襲封爵／邊境軍功冊封"}),
    n("伯爵","nobility","AUTH-4",{territorial:true,acquisition:"世襲封爵／王權冊封"}),
    n("子爵","nobility","AUTH-3",{territorial:true,acquisition:"世襲或上級貴族分封"}),
    n("男爵","nobility","AUTH-3",{territorial:true,acquisition:"世襲或領主分封"}),
    n("稱號騎士","knightly","AUTH-2",{acquisition:"君主／領主正式授勳",rights_note:"僅在另有封地或職務時取得公共權能"}),
    n("榮譽騎士","honorary","AUTH-1",{acquisition:"表彰功績",rights_note:"無自動課稅、司法、徵役或封地權",note:"純榮譽，不建立世襲封建鏈。"})
  ],
  "帝國":[
    n("{top}","sovereign","AUTH-7",{territorial:true,hereditary:true,acquisition:"帝室繼承＋加冕／帝國承認"}),
    n("皇太子／皇儲","dynastic","AUTH-6",{hereditary:true,acquisition:"帝室法統",note:"繼承資格不等於現任主權。"}),
    n("親王／藩王","dynastic","AUTH-6",{hereditary:true,territorial:true,acquisition:"帝室血統或皇帝冊封"}),
    n("大公","high_nobility","AUTH-6",{territorial:true,acquisition:"皇帝冊封／大領邦世襲"}),
    n("公爵","high_nobility","AUTH-5",{territorial:true}),
    n("侯爵","high_nobility","AUTH-4",{territorial:true}),
    n("伯爵","nobility","AUTH-4",{territorial:true}),
    n("子爵","nobility","AUTH-3",{territorial:true}),
    n("男爵","nobility","AUTH-3",{territorial:true}),
    n("帝國騎士","knightly","AUTH-2",{acquisition:"帝國或領邦授勳"}),
    n("榮譽騎士","honorary","AUTH-1",{acquisition:"帝國表彰",rights_note:"不自動取得領地與官職"})
  ],
  "神聖帝國":[
    n("{top}","sovereign","AUTH-7",{territorial:true,hereditary:true,track:"secular",acquisition:"皇位繼承＋宗教加冕"}),
    n("教皇／大教長","clerical","AUTH-7",{track:"clerical",acquisition:"高等神職選舉",note:"與皇帝形成平行法統，不是皇帝的普通下級。"}),
    n("選帝侯／諸侯王","high_nobility","AUTH-6",{territorial:true,acquisition:"世襲／法統特許"}),
    n("大公","high_nobility","AUTH-6",{territorial:true}),
    n("公爵","high_nobility","AUTH-5",{territorial:true}),
    n("主教侯／侯爵","high_nobility","AUTH-4",{territorial:true,track:"mixed",note:"可能來自神職領或世俗封地。"}),
    n("伯爵","nobility","AUTH-4",{territorial:true}),
    n("自由領主／子爵","nobility","AUTH-3",{territorial:true}),
    n("帝國騎士","knightly","AUTH-2"),
    n("榮譽護教騎士","honorary","AUTH-1",{rights_note:"榮譽身分，不自帶神職司法或封建領地"})
  ],
  "神權政治":[
    n("{top}","clerical","AUTH-7",{acquisition:"高等神職選舉＋教律／神諭確認",rights_note:"教國最高宗教與世俗法統"}),
    n("樞機／紅衣主教","clerical","AUTH-6",{acquisition:"教廷任命或高等教士選任"}),
    n("大主教","clerical","AUTH-5",{territorial:true,acquisition:"教廷任命"}),
    n("主教","clerical","AUTH-4",{territorial:true}),
    n("修院長／教區長","clerical","AUTH-3"),
    n("司鐸／神官","clerical","AUTH-2",{governing_default:false}),
    n("執事／教會書記","administrative","AUTH-1",{governing_default:false}),
    n("聖騎士團長","military","AUTH-5",{track:"military",acquisition:"教會任命",note:"軍事權與教階平行，非所有教士的上級。"}),
    n("聖騎士","knightly","AUTH-2",{track:"military"}),
    n("榮譽護教士","honorary","AUTH-1",{rights_note:"不自動取得教會裁判、教區或軍令權"})
  ],
  "貴族共和國":[
    n("{top}","civic_mandate","AUTH-6",{acquisition:"貴族議席輪值／選舉"}),
    n("元老／大家族家主","civic_seat","AUTH-5",{hereditary:true,acquisition:"家族繼承＋議席資格"}),
    n("高階議員","civic_seat","AUTH-4",{acquisition:"貴族議會推舉"}),
    n("城區執政官","civic_mandate","AUTH-4",{acquisition:"議會任命"}),
    n("市議員","civic_seat","AUTH-3",{acquisition:"特許階層選舉／推舉"}),
    n("財務監／司法官","administrative","AUTH-3",{acquisition:"執政機構任命"}),
    n("公民官／書記官","administrative","AUTH-2"),
    n("自由市民","citizen","AUTH-1",{governing_default:false,acquisition:"取得市籍"}),
    n("榮譽市民","honorary","AUTH-0",{acquisition:"共和國表彰",rights_note:"預設無議席、投票、課稅或任命權"})
  ],
  "城邦聯盟":[
    n("{top}","civic_mandate","AUTH-5",{acquisition:"成員城邦輪值／推舉",rights_note:"只處理共同盟約事務"}),
    n("盟約議員／城邦代表","civic_seat","AUTH-4",{acquisition:"各城派任"}),
    n("各城城主／市議長","civic_mandate","AUTH-4",{territorial:true,acquisition:"依各城制度"}),
    n("城邦議員","civic_seat","AUTH-3"),
    n("港務長／橋關監","administrative","AUTH-3"),
    n("市政官／巡防官","administrative","AUTH-2"),
    n("自由市民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽同盟市民","honorary","AUTH-0",{rights_note:"不自動取得任一城邦的投票或公職資格"})
  ],
  "自由都市":[
    n("{top}","civic_mandate","AUTH-5",{acquisition:"市議堂推舉／城市特許"}),
    n("市議長","civic_mandate","AUTH-5",{acquisition:"市議會選舉",note:"若最高職位本身即為議長，此級與最高職位合併。"}),
    n("資深議員","civic_seat","AUTH-4",{acquisition:"選舉／行會席／特許席"}),
    n("市議員","civic_seat","AUTH-3",{acquisition:"選舉／代表席"}),
    n("行會代表／商館代表","civic_seat","AUTH-3",{track:"corporate",acquisition:"所屬團體推派"}),
    n("市政官／稅關長","administrative","AUTH-3",{acquisition:"議會任命"}),
    n("自由市民","citizen","AUTH-1",{governing_default:false,acquisition:"取得完整市籍"}),
    n("登記居民／外來市民","citizen","AUTH-0",{governing_default:false,acquisition:"居住／納稅登記"}),
    n("榮譽市民","honorary","AUTH-0",{acquisition:"市議會表彰",rights_note:"預設無投票、議席、司法、稅務或軍令權"})
  ],
  "魔導王國":[
    n("{top}","arcane","AUTH-6",{acquisition:"塔主議會推選／王國法統"}),
    n("大塔主","arcane","AUTH-5",{territorial:true,acquisition:"塔系繼承／議會承認"}),
    n("塔主","arcane","AUTH-5",{territorial:true}),
    n("首席法師／學院院長","arcane","AUTH-4"),
    n("高階導師","arcane","AUTH-3"),
    n("導師／監造法師","arcane","AUTH-2"),
    n("認證法師","arcane","AUTH-1",{governing_default:false}),
    n("學徒／研究員","citizen","AUTH-0",{governing_default:false}),
    n("榮譽賢者","honorary","AUTH-0",{rights_note:"學術榮譽，不自帶禁咒審批或塔區統治權"})
  ],
  "精靈王庭":[
    n("{top}","sovereign","AUTH-6",{territorial:true,hereditary:true,acquisition:"王族繼承＋長老議會確認"}),
    n("王儲／星裔繼承人","dynastic","AUTH-5",{hereditary:true}),
    n("王族親王／公主","dynastic","AUTH-5",{hereditary:true,governing_default:false}),
    n("月之議會長老","civic_seat","AUTH-5",{acquisition:"資歷、學識與議會承認"}),
    n("林地侯／守林領主","high_nobility","AUTH-4",{territorial:true}),
    n("守林將軍／大法師","military","AUTH-4",{track:"service"}),
    n("林地守護者","administrative","AUTH-2"),
    n("王庭自由民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽林友","honorary","AUTH-0",{rights_note:"不自動取得王庭議席或聖林管理權"})
  ],
  "矮人氏族王國":[
    n("{top}","sovereign","AUTH-7",{acquisition:"氏族王議會依祖法推舉"}),
    n("王儲／王座候選人","dynastic","AUTH-6",{hereditary:false,acquisition:"氏族支持＋祖法資格"}),
    n("氏族王","clan","AUTH-5",{territorial:true,hereditary:true}),
    n("符文領主","clan","AUTH-4",{territorial:true}),
    n("鍛造大師／礦脈領主","administrative","AUTH-4",{territorial:true}),
    n("氏族長老","clan","AUTH-3"),
    n("盾衛隊長／礦工頭","military","AUTH-2"),
    n("自由氏族民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽氏族友人","honorary","AUTH-0",{rights_note:"不取得礦權、爐權或氏族表決權"})
  ],
  "部落聯盟":[
    n("{top}","clan","AUTH-6",{acquisition:"部落會盟、戰誓與聲望承認"}),
    n("戰誓繼承人","dynastic","AUTH-5",{hereditary:false,acquisition:"會盟承認",note:"不是固定血統王儲。"}),
    n("圖騰大酋長","clan","AUTH-5"),
    n("部族酋長","clan","AUTH-4",{territorial:true}),
    n("氏族首領","clan","AUTH-3",{territorial:true}),
    n("薩滿／戰團長","clan","AUTH-3",{track:"ritual_or_military"}),
    n("戰士首領／獵首","military","AUTH-2"),
    n("自由族民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽客卿","honorary","AUTH-0",{rights_note:"受保護與禮遇，但不自動取得會盟表決權"})
  ],
  "遊牧汗國":[
    n("{top}","sovereign","AUTH-6",{acquisition:"汗族法統＋庫里爾台／會盟承認"}),
    n("汗子／王子","dynastic","AUTH-5",{hereditary:true,governing_default:false}),
    n("左右翼王／諸汗","high_nobility","AUTH-5",{territorial:true}),
    n("萬戶長","military","AUTH-5",{territorial:true}),
    n("千戶長","military","AUTH-4",{territorial:true}),
    n("百戶長","military","AUTH-3"),
    n("十戶長","military","AUTH-2"),
    n("那可兒／親衛","knightly","AUTH-2",{governing_default:false}),
    n("自由牧民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽賓客","honorary","AUTH-0",{rights_note:"不自動取得牧地、軍戶或汗廷議事權"})
  ],
  "幕府雙軌島國":[
    n("潮皇","sovereign","AUTH-7",{territorial:true,hereditary:true,track:"court",acquisition:"王統世襲＋王庭儀禮",rights_note:"法統、祭祀與冊命；日常軍政通常由幕府執行"}),
    n("皇嗣／王族","dynastic","AUTH-6",{hereditary:true,track:"court",governing_default:false,note:"王統繼承身分不等於幕府軍政權。"}),
    n("征夷大將軍","military","AUTH-7",{territorial:true,hereditary:true,track:"shogunate",acquisition:"主導武門繼承＋王庭冊命＋主要大名承認",rights_note:"幕府實際軍政最高職"}),
    n("幕府老中／評定眾","administrative","AUTH-5",{track:"shogunate",acquisition:"大將軍任命"}),
    n("諸島大名","high_nobility","AUTH-5",{territorial:true,hereditary:true,track:"domain",acquisition:"家門繼承＋幕府安堵"}),
    n("奉行／港代","administrative","AUTH-4",{track:"service",acquisition:"幕府或大名任命"}),
    n("家臣武士／船侍","knightly","AUTH-2",{track:"service",acquisition:"武家主從契約／授職"}),
    n("自由島民／町人","citizen","AUTH-1",{governing_default:false}),
    n("榮譽御客","honorary","AUTH-0",{rights_note:"受王庭或幕府禮遇，不自動取得島領、軍令或冊封權"})
  ],
  "酋長制":[
    n("{top}","clan","AUTH-5",{acquisition:"氏族會盟／長老承認"}),
    n("大氏族酋長","clan","AUTH-4",{territorial:true}),
    n("谷地酋長","clan","AUTH-3",{territorial:true}),
    n("圖騰祭司長","clan","AUTH-3",{track:"ritual"}),
    n("戰團長","military","AUTH-3"),
    n("家族長","clan","AUTH-2"),
    n("自由族民","citizen","AUTH-1",{governing_default:false}),
    n("榮譽客卿","honorary","AUTH-0",{rights_note:"不自動取得谷地土地、祭儀或部族裁決權"})
  ],
  "公爵領／侯國":[
    n("{top}","high_nobility","AUTH-5",{territorial:true,hereditary:true,acquisition:"世襲／宗主冊封"}),
    n("侯嗣／領地繼承人","dynastic","AUTH-4",{hereditary:true,governing_default:false}),
    n("伯爵","nobility","AUTH-4",{territorial:true}),
    n("子爵","nobility","AUTH-3",{territorial:true}),
    n("男爵","nobility","AUTH-3",{territorial:true}),
    n("城守／鎮守官","administrative","AUTH-3",{acquisition:"邊侯任命"}),
    n("稱號騎士","knightly","AUTH-2",{acquisition:"正式授勳"}),
    n("榮譽騎士","honorary","AUTH-1",{rights_note:"無自動封地、徵役與司法權"}),
    n("自由民","citizen","AUTH-0",{governing_default:false})
  ],
  "無主之地":[
    n("{top}","de_facto","AUTH-3",{acquisition:"武力、資源或臨時盟約",note:"不是合法世襲主權。"}),
    n("黑市主持／賞金仲介","de_facto","AUTH-2",{track:"economic",note:"只在自己的交易網與人脈中有影響。"}),
    n("團伙首領／營地頭目","de_facto","AUTH-2",{territorial:true}),
    n("武裝骨幹／據點副手","de_facto","AUTH-1"),
    n("居民代表／水源看守","de_facto","AUTH-1"),
    n("無隸屬居民","citizen","AUTH-0",{governing_default:false,note:"不存在統一市籍或共同法統。"})
  ],
  "黑暗精靈母系氏族城邦":[
    n("{top}","sovereign","AUTH-6",{territorial:true,hereditary:false,acquisition:"母系家門競逐＋誓井議庭承認"}),
    n("誓井議庭長席","civic_seat","AUTH-5",{acquisition:"高位家門推舉"}),
    n("高位主母","clan","AUTH-5",{territorial:true,hereditary:true}),
    n("家門主母／家主","clan","AUTH-4",{territorial:true,hereditary:true}),
    n("武技長／術法長","administrative","AUTH-3",{track:"house_service"}),
    n("家門代理人／密探長","administrative","AUTH-3",{track:"house_service"}),
    n("礦道監領／水脈守衛","administrative","AUTH-2"),
    n("認證家民","citizen","AUTH-1",{governing_default:false}),
    n("附庸／受保護居民","citizen","AUTH-0",{governing_default:false}),
    n("榮譽盟客","honorary","AUTH-0",{rights_note:"不自動取得家門血統、議庭席位或地下領地權"})
  ]
});

const FREE_CITY_OVERRIDES=Object.freeze({
 "POL-007":[
   n("城盟議長","civic_mandate","AUTH-5",{acquisition:"卡薩維爾與維爾河諸城代表共同推舉"}),
   n("維爾諸城議長","civic_mandate","AUTH-4",{acquisition:"維爾河成員城市代表互選"}),
   n("資深議員","civic_seat","AUTH-4"),
   n("市議員","civic_seat","AUTH-3"),
   n("行會席代表","civic_seat","AUTH-3",{track:"guild"}),
   n("河港監／橋關長","administrative","AUTH-3"),
   n("自由市民","citizen","AUTH-1",{governing_default:false}),
   n("登記居民","citizen","AUTH-0",{governing_default:false}),
   n("榮譽市民","honorary","AUTH-0",{rights_note:"無自動投票、議席、司法、稅務或軍令權"})
 ],
 "POL-008":[
   n("首席商監","civic_mandate","AUTH-5",{acquisition:"商館出資、信用與市議堂選舉"}),
   n("商議會議長","civic_mandate","AUTH-5"),
   n("大商館議員","civic_seat","AUTH-5",{track:"merchant"}),
   n("資深議員","civic_seat","AUTH-4"),
   n("市議員","civic_seat","AUTH-3"),
   n("港務總監／市場監","administrative","AUTH-4"),
   n("商籍市民","citizen","AUTH-1",{governing_default:false}),
   n("自由市民","citizen","AUTH-1",{governing_default:false}),
   n("榮譽市民","honorary","AUTH-0",{rights_note:"無自動商館席位、投票權或關稅權"})
 ],
 "POL-009":[
   n("武契議長","civic_mandate","AUTH-5",{acquisition:"主要武契團、市議席與工坊代表推舉"}),
   n("市議長","civic_mandate","AUTH-5"),
   n("武契議員","civic_seat","AUTH-4",{track:"mercenary"}),
   n("資深議員","civic_seat","AUTH-4"),
   n("市議員","civic_seat","AUTH-3"),
   n("契約仲裁官／軍需監","administrative","AUTH-3"),
   n("登記傭兵市民","citizen","AUTH-1",{governing_default:false}),
   n("自由市民","citizen","AUTH-1",{governing_default:false}),
   n("榮譽市民","honorary","AUTH-0",{rights_note:"無自動武契表決、傭兵指揮或市政權"})
 ]
});

function clone(v){return JSON.parse(JSON.stringify(v))}
function fillTitle(raw,polity){
  return String(raw||"").replace(/\{top\}/g,polity?.top_office||polity?.current_title||"最高統治者");
}
function buildLadder(polity,rows){
  return rows.map((row,i)=>{
    const x=clone(row);
    x.id=`${polity.id}-R${String(i+1).padStart(2,"0")}`;
    x.title=fillTitle(x.title,polity);
    x.precedence=i+1;
    x.is_honorary=x.rank_class==="honorary";
    x.is_office=["sovereign","civic_mandate","civic_seat","clerical","arcane","clan","military","administrative","de_facto"].includes(x.rank_class);
    x.is_title=["dynastic","high_nobility","nobility","knightly","honorary"].includes(x.rank_class);
    x.governing_default=!!x.governing_default&&!x.is_honorary;
    if(x.is_honorary){
      x.hereditary=false;x.territorial=false;
      x.governing_default=false;
    }
    return x;
  });
}

const polityById=new Map((DB.political_entities||[]).map(x=>[x.id,x]));
const profileById=new Map((DB.polity_authority_profiles||[]).map(x=>[x.polity_id,x]));
for(const polity of (DB.political_entities||[])){
  const profile=profileById.get(polity.id);if(!profile)continue;
  const source=FREE_CITY_OVERRIDES[polity.id]||TEMPLATES[polity.government_type];
  if(!source)continue;
  profile.rank_ladder=buildLadder(polity,source);
  profile.hierarchy_depth_revision=REV;
  profile.hierarchy_model={
    precedence_is_not_authority:true,
    title_is_not_office:true,
    honorary_has_no_automatic_public_rights:true,
    dynastic_status_has_no_automatic_governing_rights:true,
    combat_power_independent:true
  };
}

DB.political_rank_classes=clone(RANK_CLASSES);
DB.political_hierarchy_templates=Object.fromEntries(Object.entries(TEMPLATES).map(([k,v])=>[k,clone(v)]));
DB.political_hierarchy_depth_system={
  version:REV,release:RELEASE,
  covered_government_types:Object.keys(TEMPLATES),
  covered_polities:(DB.polity_authority_profiles||[]).filter(x=>Array.isArray(x.rank_ladder)&&x.rank_ladder.length).length,
  distinctions:[
    "政治禮序與AUTH法定權能分離。",
    "王族／繼承身分不因血統自動取得現任統治權。",
    "爵位只有在對應封地、官職或特許存在時才能行使公共權能。",
    "稱號騎士屬正式授勳身分，但公共權能仍取決於是否另授封地／官職。",
    "榮譽騎士、榮譽市民與其他honorary身分預設沒有課稅、司法、軍令、任命、議席或投票權。",
    "同一政治體可同時存在主權鏈與平行宗教、奧術、軍政、行會權力。",
    "所有政治階層與F–S戰鬥力、冒險者階級、職業等級保持獨立。"
  ]
};
if(DB.authority_system&&typeof DB.authority_system==="object"){
  DB.authority_system.version="AUTHORITY-1.2";
  DB.authority_system.hierarchy_depth_revision=REV;
  DB.authority_system.rank_class_count=Object.keys(RANK_CLASSES).length;
  DB.authority_system.rank_ladder_profile_count=DB.political_hierarchy_depth_system.covered_polities;
  DB.authority_system.canonical_source="authority_archetypes + polity_authority_profiles.office_nodes + polity_authority_profiles.rank_ladder + authority_rights_catalog";
  DB.authority_system.rules=Array.from(new Set([...(DB.authority_system.rules||[]),
    "政治禮序rank_ladder不得直接取代office_nodes法定權力鏈；同爵位在不同政體可有不同實權。",
    "榮譽身分不得自動取得公共統治權；正式冊封、任命、選舉或特許必須另有事件與存檔紀錄。"
  ]));
}
if(DB.political_system&&typeof DB.political_system==="object"){
  DB.political_system.hierarchy_depth_revision=REV;
  DB.political_system.rules=Array.from(new Set([...(DB.political_system.rules||[]),
    "政治體必須同時維持法定權力鏈與社會／政治禮序；兩者不可用單一AUTH數字互相替代。",
    "封建爵位、宗教教階、市政議席、氏族位階與純榮譽身分需以rank_class明確區分。"
  ]));
}
if(DB.hard_rules&&typeof DB.hard_rules==="object"){
  DB.hard_rules.political_rank_precedence_not_authority=true;
  DB.hard_rules.honorary_political_titles_no_automatic_rights=true;
  DB.hard_rules.dynastic_title_no_automatic_governing_rights=true;
  DB.hard_rules.political_hierarchy_depth_revision=REV;
}

function audit(){
  const issues=[];
  const allowed=new Set(Object.keys(RANK_CLASSES));
  const polities=DB.political_entities||[];
  const profiles=DB.polity_authority_profiles||[];
  const coveredTypes=new Set(Object.keys(TEMPLATES));
  for(const p of polities){
    const prof=profiles.find(x=>x.polity_id===p.id);
    if(!prof){issues.push("政治體缺權力profile:"+p.id);continue}
    if(coveredTypes.has(p.government_type)&&(!Array.isArray(prof.rank_ladder)||prof.rank_ladder.length<6))issues.push("政治階層過薄:"+p.id);
    const ids=new Set();
    for(const r of (prof.rank_ladder||[])){
      if(ids.has(r.id))issues.push("政治階層ID重複:"+r.id);ids.add(r.id);
      if(!allowed.has(r.rank_class))issues.push("政治階層類型無效:"+p.id+"/"+r.title);
      if(!/^AUTH-[0-7]$/.test(r.authority_tier||""))issues.push("政治階層AUTH無效:"+p.id+"/"+r.title);
      if(r.is_honorary&&(r.governing_default||r.hereditary||r.territorial))issues.push("榮譽身分錯帶統治／世襲／領地:"+p.id+"/"+r.title);
    }
  }
  const feudal=profiles.find(x=>x.polity_id==="POL-001")?.rank_ladder||[];
  for(const title of ["國王","親王","公爵","侯爵","伯爵","子爵","男爵","稱號騎士","榮譽騎士"])if(!feudal.some(x=>x.title.includes(title)))issues.push("封建王國階層缺失:"+title);
  for(const pid of ["POL-007","POL-008","POL-009"]){
    const rows=profiles.find(x=>x.polity_id===pid)?.rank_ladder||[];
    for(const title of ["議長","議員","榮譽市民"])if(!rows.some(x=>x.title.includes(title)))issues.push("自由都市階層缺失:"+pid+"/"+title);
    const honorary=rows.find(x=>x.title==="榮譽市民");if(honorary?.governing_default)issues.push("榮譽市民誤具統治權:"+pid);
  }
  const blackTide=profiles.find(x=>x.polity_id==="POL-010")?.rank_ladder||[];
  for(const title of ["潮皇","征夷大將軍","諸島大名"])if(!blackTide.some(x=>x.title.includes(title)))issues.push("黑潮雙軌階層缺失:"+title);
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{polities:polities.length,covered_profiles:DB.political_hierarchy_depth_system.covered_polities,government_types:Object.keys(TEMPLATES).length,rank_classes:Object.keys(RANK_CLASSES).length}};
}
DB.political_hierarchy_depth_system.audit=audit();
globalThis.runPoliticalHierarchyDepthAudit=audit;
globalThis.QUNLU_CORE?.registerModule?.("src/political-hierarchy-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});

if(Array.isArray(DB.integration_registry?.optimization_notes))DB.integration_registry.optimization_notes.push(RELEASE+"／"+REV+"：16個CURRENT政治體新增完整政治／社會階序；封建王國細分國王、王儲／親王、公侯伯子男、稱號騎士、榮譽騎士；自由都市細分最高市政職、議長、資深議員／議員、市政官、市民與榮譽市民，並將禮序與實際AUTH權能分離。");
})();