/* 群陸旅誌：角色出身深化 CURRENT-1.78.0
 * ORIGIN-DEPTH-1.0
 * 合併高度同質出身，以核心出身＋背景側寫保留差異；補齊特色、代價、動機、人脈與故事鉤子。
 */
(()=>{
"use strict";
if(typeof DB!=="object"||!DB||!Array.isArray(DB.origins))return;
const CORE=globalThis.QUNLU_CORE;
const RELEASE=CORE?.release?.("CURRENT-1.78.0")||globalThis.QUNLU_RELEASE_VERSION||"CURRENT-1.78.0";
const REV="ORIGIN-DEPTH-1.0";
const PRE_COUNT=DB.origins.length;
const PRE_WEIGHT=DB.origins.reduce((s,x)=>s+Number(x?.weight||1),0);

const MERGES=Object.freeze({
  "O-MONASTERY":"O-ACOLYTE",
  "O-CLERICAPP":"O-ACOLYTE",
  "O-MERC":"O-SOLDIERCHILD",
  "O-RANGERAPP":"O-SCOUT",
  "O-SAGEAPP":"O-SCHOLAR",
  "O-MINOR-HEIR":"O-NOBLE-ORTHO"
});
const LEGACY_FACETS=Object.freeze({
  "O-MONASTERY":"temple_ward",
  "O-CLERICAPP":"cleric_apprentice",
  "O-MERC":"mercenary_camp",
  "O-RANGERAPP":"ranger_apprentice",
  "O-SAGEAPP":"sage_disciple",
  "O-MINOR-HEIR":"manor_heir",
  "O-CHURCH":"temple_acolyte"
});
const DEFAULT_FACETS=Object.freeze({
  "O-ACOLYTE":"temple_acolyte",
  "O-SOLDIERCHILD":"garrison_family",
  "O-SCOUT":"military_scout",
  "O-SCHOLAR":"scholar_household",
  "O-NOBLE-ORTHO":"courtly_branch"
});

const PROFILES={
"O-FARM":{
 name:"田野農戶",description:"在農田、牲畜與季節循環裡長大，知道一頓飯背後需要多少土地、勞力與等待。",
 signature:"能從土壤、作物、牲畜與天候判斷一地的民生狀況。",burden:"現金與城市人脈薄弱，專長也高度受地區與季節影響。",drive:"想證明維持日常的人，也能靠實際本事走得比傳奇更遠。",social_access:"村社、磨坊、糧商、地方農務與趕集圈",distinctive_axis:"季節—收成—土地",hooks:["歉收時是否回援故里","糧商壓價時要站在哪一邊"],tags:["農務","季節","民生"]},
"O-HUNTER":{
 name:"山林獵戶",description:"不是只會射箭，而是靠足跡、風向、棲地與獵物習性在野外做判斷。",
 signature:"能用足跡、糞痕、折枝與風向拼回野獸的行動。",burden:"對都市制度與上層社交較陌生，也容易低估人比野獸更難預測。",drive:"追求一次比一次更乾淨的判斷，而不是靠運氣豪賭。",social_access:"獵戶、樵夫、皮匠、守林人與山路嚮導",distinctive_axis:"獸跡—風向—獵場",hooks:["熟悉獵場突然失去獸跡","禁獵令與村落生計發生衝突"],tags:["追蹤","野獸","森林"]},
"O-FISHER":{
 name:"水岸漁戶",description:"成長在河岸、湖港或海灣，生活節奏由水位、潮汐與風向決定。",
 signature:"懂讀潮、讀風、判斷小艇與漁具真正能承受的極限。",burden:"收入與安全高度受天候支配，離水域越遠越難發揮專長。",drive:"希望把對水域的直覺變成能穿越陌生河海的本事。",social_access:"漁戶、渡口、魚販、碼頭腳夫與小船主",distinctive_axis:"潮汐—水路—風況",hooks:["漁獲驟減是否代表水域異變","風暴後漂來不屬於本地的殘骸"],tags:["水路","潮汐","漁業"]},
"O-SMITH":{
 name:"鍛坊學徒",description:"在火爐、鐵砧與磨輪旁成長，熟悉武具從材料到磨耗的日常。",
 signature:"能從聲音、刃口與磨痕看出武具快要出什麼問題。",burden:"離開工坊後多半只能診斷與保養，無法憑空完成正式鍛造。",drive:"想從修好別人的工具，走到打造真正屬於自己的作品。",social_access:"鐵匠、礦商、修具鋪、傭兵與工坊學徒",distinctive_axis:"材料—火候—磨耗",hooks:["師傅留下未完成的工件","一批材料的品質與帳面不符"],tags:["鍛造","材料","工坊"]},
"O-TAVERN":{
 name:"酒館幫工",description:"從端盤、記帳與收拾醉客開始，學會在人聲最雜的地方辨認誰值得記住。",
 signature:"記得誰和誰同桌、什麼消息只在特定商隊出現後才流傳。",burden:"聽到的消息多卻真假混雜，把笑談當情報會付出代價。",drive:"想把被動聽故事的人生，變成自己真正走過的旅程。",social_access:"旅人、商隊、冒險者、地方熟客與表演者",distinctive_axis:"客流—傳聞—人情",hooks:["老客人突然失約","同一則傳聞在三桌人口中版本完全不同"],tags:["傳聞","待客","人群"]},
"O-MERCHANT":{
 name:"行商家學",description:"在貨單、秤重、議價與長途商路中長大，知道商品價格其實是風險的另一種說法。",
 signature:"對價差、貨物品質、運輸成本與談判底線特別敏感。",burden:"容易被視為凡事先談利益，也可能因家族舊帳被牽連。",drive:"想證明自己能看懂的不是數字，而是數字背後的人與路。",social_access:"行商、貨棧、公證人、車隊、攤商與地方市集",distinctive_axis:"價差—契約—商路",hooks:["家族舊欠款重新找上門","低價貨源背後疑似有人被壓榨"],tags:["交易","商路","契約"]},
"O-STREET":{
 name:"街巷求生者",description:"在城市邊緣靠觀察、退路與人群縫隙活下來，沒有制度保護就自己學會規則。",
 signature:"進陌生街區時先找出口、視線死角與真正控制秩序的人。",burden:"低社會地位與舊地緣使正式機構更容易先懷疑你。",drive:"想把只能躲開麻煩的本事，變成有能力選擇自己去向。",social_access:"攤販、腳夫、孤兒群、廉價旅店與地下消息圈",distinctive_axis:"視線—出口—人群",hooks:["昔日同伴捲入地下糾紛","熟悉街區被新的勢力接管"],tags:["求生","街巷","底層"]},
"O-ACOLYTE":{
 name:"神殿養成者",description:"由神殿或修院體系養成，識字、照護與禮儀是生活技能，而非單純宗教標籤。",
 signature:"熟悉照護、儀式準備與基層宗教機構真正如何運轉。",burden:"制度責任、教義與眼前需要幫助的人不一定永遠一致。",drive:"想確認自己究竟是在守教條、守人，還是能找到兩者共存的方法。",social_access:"修道院、神殿、施粥所、基層神職與病患家屬",distinctive_axis:"照護—禮儀—制度",hooks:["神殿命令與救助需求衝突","舊院舍寄來一封只寫了一半的求援信"],tags:["宗教","照護","識字"],weight:25,silver:26,starter_subjobs:[],learnable_subjobs:["SJ-SCROLL"],tendencies:["照護","禮儀","閱讀"],knowledge:["宗教","基礎照護"],class_bias:["C-CLERIC","C9-PRIEST"],
 facets:[
  {id:"temple_ward",name:"修道院收養",weight:9,note:"把修院當作家，熟悉共同生活、照料與抄寫。",knowledge:["修院生活"],starter_subjobs:["SJ-MEDIC"],flags:["temple_ward"]},
  {id:"temple_acolyte",name:"神殿侍役",weight:9,note:"從祭儀準備、接待信眾與日常雜務理解神殿制度。",knowledge:["神殿規矩"],flags:["temple_acolyte"]},
  {id:"cleric_apprentice",name:"牧師見習",weight:7,note:"接受過更直接的祈禱與照護訓練，但仍沒有正式神職資格。",knowledge:["基礎醫療"],starter_subjobs:["SJ-MEDIC"],flags:["cleric_apprentice","not_formal_clergy"]}
 ]},
"O-HIGHLAND":{
 name:"高地山民",description:"成長於寒冷高地與陡峭山路，距離、坡度和天候是每天都要計算的成本。",
 signature:"耐寒、耐走，會用地形與雲勢判斷山路何時開始不安全。",burden:"熟悉的是稀疏聚落與山地互助，對大型都市制度較生疏。",drive:"想知道高地之外的世界，是否也能用同樣踏實的方法讀懂。",social_access:"山村、牧戶、嚮導、驛路與高地獵戶",distinctive_axis:"坡地—寒冷—負重",hooks:["舊山道因崩塌斷絕","冬季物資隊遲遲未到"],tags:["山地","耐寒","路線"]},
"O-NOMAD":{
 name:"荒原遊牧者",description:"跟著人群、牲畜與水源移動，習慣把路線當成活著的知識而不是地圖上的線。",
 signature:"擅長找水、辨向、估算長距離行程與補給節奏。",burden:"缺少固定後援，在重視地契與戶籍的地區容易被當外人。",drive:"想把族群口傳的路線連成一張真正屬於自己的世界圖。",social_access:"遊牧部族、商隊、水井守望者與邊地市集",distinctive_axis:"水源—星向—遷徙",hooks:["傳統水源被新勢力占用","一條祖輩熟知的路線突然不再安全"],tags:["遷徙","尋水","荒原"]},
"O-PIRATECHILD":{
 name:"海盜船團出身",description:"在船板、碼頭與灰色交易中長大，懂得海上生活，但不等於天生罪犯。",
 signature:"熟悉繩結、甲板分工、港口黑話與不寫在契約上的交易規矩。",burden:"可疑聲譽會讓海關、守衛與正規商會更警戒。",drive:"想決定自己要繼承船團的生活方式，還是只留下真正有用的本事。",social_access:"水手、碼頭、黑市掮客、小船主與沿岸酒館",distinctive_axis:"甲板—繩結—灰色交易",hooks:["舊船團的旗號重新出現","某港口仍把你列在舊名冊上"],tags:["船務","港口","黑市"]},
"O-CIRCUS":{
 name:"巡演雜技者",description:"跟著巡演團在城鎮間移動，以平衡、節奏與臨場反應換取下一頓飯。",
 signature:"能在狹窄、高處與眾目睽睽下保持身體控制與表情。",burden:"缺少穩定社會身分，巡演團的人情債也常跨城追來。",drive:"想知道自己的技巧離開掌聲後，是否仍有真正的價值。",social_access:"表演團、集市、旅店、工棚與地方節慶",distinctive_axis:"平衡—節奏—觀眾",hooks:["舊團員失蹤卻留下演出道具","地方權貴要求一場不能拒絕的表演"],tags:["表演","平衡","巡演"]},

"O-FALLEN":{
 name:"失勢貴族",description:"仍懂禮儀、家系與上層社會規矩，卻已沒有足以支撐身分的財產與權力。",
 signature:"知道一個姓氏能開哪些門，也知道失去資產後那些門會多快關上。",burden:"舊債、舊敵與過時的人情會隨家名一起找上門。",drive:"想證明自己剩下的不是姓氏，而是離開家產後仍能成立的能力。",social_access:"舊家臣、地方貴族、債主、公證人與禮儀圈",distinctive_axis:"家徽—舊債—失勢",hooks:["家族舊產即將被拍賣","多年未聯絡的家臣帶來一份舊契約"],tags:["貴族","失勢","家系"]},
"O-ILLEGIT":{
 name:"無繼承權貴裔",description:"具有貴族血緣卻沒有正式繼承權，從小就知道『被承認』與『有名分』並不是同一件事。",
 signature:"對上層禮儀與下層目光都敏感，擅長讀懂身份差距造成的語氣變化。",burden:"血緣能帶來關係，卻不能保證權利，任何家族爭端都可能把你當工具。",drive:"想建立一個不必依附誰承認才成立的身分。",social_access:"旁支家臣、侍從、僕役、地方貴族與私下家系消息",distinctive_axis:"血緣—名分—察言",hooks:["本家突然要求你公開表態","有人拿出能證明血緣的新文件"],tags:["貴族","私生","名分"]},
"O-NOBLE-ORTHO":{
 name:"地方領主子弟",description:"受過完整禮儀與基礎管理教育，真正學到的不是排場，而是領地如何靠糧、租、道路與人情運轉。",
 signature:"理解莊園、稅賦、治安與地方人情之間彼此牽動的關係。",burden:"家族期待與地方利益不會因你出門冒險就消失。",drive:"想證明自己理解的治理不只存在於書房和家宴。",social_access:"地方官吏、莊園管事、家臣、地主與鄉紳",distinctive_axis:"莊園—稅賦—責任",hooks:["家中要求返鄉處理租佃爭議","領地一項舊特權正被地方居民質疑"],tags:["貴族","管理","地方政治"],weight:6,tendencies:["禮儀","管理","地方政治"],class_bias:["C9-KNIGHT","C9-TACTSCHOLAR"],
 facets:[
  {id:"courtly_branch",name:"正統家系子弟",weight:4,note:"更熟悉禮法、家宴與貴族往來，但實際領地責任較輕。",knowledge:["貴族禮儀"],flags:["noble"]},
  {id:"manor_heir",name:"小莊園順位繼承人",weight:2,note:"責任比權力更早到來，熟悉租佃、帳冊與地方協調。",knowledge:["地方稅務","領地常識"],flags:["noble","minor_heir"]}
 ]},
"O-EXILED-BRANCH":{
 name:"流亡王族旁支",description:"出身與舊王室有遠親關係的旁支家系，因政變或戰亂離鄉，但沒有王位正統性。",
 signature:"熟悉舊王朝史、貴族禮節與如何在不安全的地方降低身分可見度。",burden:"名字本身就是政治風險；血緣不是合法繼承權，也可能只帶來追查。",drive:"想把家族史從命運枷鎖變成自己能選擇如何使用的知識。",social_access:"流亡家臣、舊王朝研究者、貴族圈與政治難民",distinctive_axis:"舊王朝—藏名—政治風險",hooks:["有人聲稱代表舊家臣來接觸","地方勢力試圖利用你的姓氏"],tags:["流亡","王族旁支","政治"],flags:["exiled_royal_branch","no_throne_claim"]},
"O-SQUIRE":{
 name:"騎士侍從",description:"從馬匹、鎧甲、行李與勤務開始學習騎士生活，知道榮譽背後其實是一大堆責任。",
 signature:"熟悉武具照料、營地紀律、馬匹與正式武備流程。",burden:"你仍是侍從，不因熟悉騎士生活就自動取得騎士資格。",drive:"想知道自己追求的是騎士稱號，還是那套值得保留的責任感。",social_access:"騎士家族、馬房、武具師、侍從與地方守備",distinctive_axis:"馬匹—鎧甲—紀律",hooks:["昔日侍奉的騎士失蹤","一件交由你保養的家徽武具出現在黑市"],tags:["騎士","侍從","武備"]},
"O-PALADIN-NOVICE":{
 name:"聖堂武備見習",description:"在聖堂接受武備與誓約教育，知道誓言如何約束行為，但尚未具備正式聖騎士資格。",
 signature:"把戰鬥紀律與宗教誓約一起思考，熟悉聖堂勤務與武備規範。",burden:"資格尚未完成；任何神聖名號都不能取代正式認證與實際行動。",drive:"想確認自己能不能在沒有儀式光環時，仍守得住曾經學過的原則。",social_access:"聖堂、教會武備庫、神職騎士與見習團",distinctive_axis:"誓約—武備—資格",hooks:["見習誓約要求你避開一項捷徑","昔日教官對一樁事件給出相反命令"],tags:["聖堂","武備","誓約"],flags:["not_formally_paladin"]},
"O-SPYCHILD":{
 name:"密探家系子弟",description:"家人從事情報工作，耳濡目染學會低調觀察、暗號與辨識說詞漏洞。",
 signature:"不靠神祕直覺，而是記住細節、比對說詞與注意誰刻意不被看見。",burden:"長期把資訊分級會讓信任變得困難，也可能被家人的舊工作牽連。",drive:"想決定情報能力是拿來控制別人，還是避免自己再次被蒙在鼓裡。",social_access:"低階文書、驛站、密探家屬、傳令與灰色情報圈",distinctive_axis:"暗號—觀察—信任",hooks:["家人留下無法解讀的舊暗號","陌生人知道只有家中才使用的聯絡習慣"],tags:["情報","暗號","觀察"]},

"O-SOLDIERCHILD":{
 name:"軍旅子弟",description:"在營地、駐地或傭兵團邊緣長大，真正熟悉的是隊伍怎麼吃、走、守與撤。",
 signature:"懂行軍、哨戒、補給與風險評估，會先想隊伍能不能安全回來。",burden:"容易把陌生人與陌生地先當成風險表，而不是故事。",drive:"想把從別人戰爭旁學到的本事，變成自己選擇如何使用的能力。",social_access:"士兵、營地商販、車隊、傭兵與地方守備",distinctive_axis:"營地—路線—風險",hooks:["舊駐地的戰友家屬求助","曾熟悉的傭兵旗號出現在不該出現的地方"],tags:["軍旅","行軍","補給"],weight:19,silver:35,tendencies:["行軍","警戒","風險評估"],class_bias:["C-WAR","C-RNG"],
 facets:[
  {id:"garrison_family",name:"駐軍家屬",weight:10,note:"更熟悉正規軍紀、換哨、駐地補給與軍營人情。",knowledge:["軍營","行軍"],flags:["garrison_family"]},
  {id:"mercenary_camp",name:"傭兵團隨營",weight:9,note:"更熟悉契約價碼、臨時營地、護運與不穩定雇主。",knowledge:["傭兵行規","商路危險"],flags:["mercenary_camp"]}
 ]},
"O-VETERAN":{
 name:"退役老兵",description:"真正服過數年兵役並離隊，帶著比同齡人更多的實戰經驗，也帶著無法假裝不存在的舊傷。",
 signature:"知道何時該壓上、何時該撤、何時隊伍只是因恐慌而亂掉。",burden:"舊傷、疲勞與戰場記憶會實際限制持續作戰。",drive:"想證明離開軍隊之後，自己的價值不只剩下『以前打過仗』。",social_access:"退伍軍人、軍需商、舊部隊與地方守備",distinctive_axis:"實戰節奏—舊傷—撤退",hooks:["舊部隊的名冊出現死亡紀錄矛盾","昔日戰友要求重走一條失敗撤退路線"],tags:["老兵","實戰","舊傷"]},
"O-DESERTER":{
 name:"離營逃兵",description:"因恐懼、命令衝突或絕境離開軍隊，知道軍務，也知道被軍務追著走是什麼感覺。",
 signature:"熟悉哨戒漏洞、追查節奏、行軍痕跡與如何避開軍方視線。",burden:"逃兵污名是真實社會代價；不同地區對此可能有截然不同法律後果。",drive:"想證明離開一支軍隊的那一天，不必決定自己往後每一天。",social_access:"逃兵、邊地旅店、地下嚮導與少數同情的舊軍人",distinctive_axis:"哨戒—追查—污名",hooks:["舊部隊派人追查你的去向","當年離營原因出現新的證據"],tags:["逃兵","追查","軍務"]},
"O-GLADIATOR":{
 name:"逃脫角鬥奴",description:"曾被迫在競技場或地下鬥場戰鬥，學會的不是華麗招式，而是在被觀看時活下來。",
 signature:"擅長讀對手節奏、承受壓力，也知道觀眾情緒如何改變一場鬥爭。",burden:"逃奴身分與低社會地位可能被舊主人、鬥場或執法人員利用。",drive:"想把第一次真正由自己決定的戰鬥，用在值得的地方。",social_access:"鬥場雜役、奴工、地下賭客、武器修理者與逃亡者",distinctive_axis:"近戰—痛覺—觀眾",hooks:["昔日鬥場懸賞重新出現","曾一起被關押的人如今替鬥場工作"],tags:["角鬥","逃奴","地下社會"]},
"O-SCOUT":{
 name:"邊境斥候",description:"受過前出偵察、辨路與回報訓練；重點不是獨自逞強，而是把可靠情報帶回來。",
 signature:"會把地形、足跡、視線、路況與撤退線整理成可供隊伍使用的情報。",burden:"長時間單獨判斷容易形成過度戒備，也不代表能應付所有未知地形。",drive:"想證明一條正確情報能救的人，比一次漂亮擊殺更多。",social_access:"邊境哨所、巡林人、嚮導、獵戶與傳令",distinctive_axis:"地形—隱蔽—回報",hooks:["熟悉巡線出現無法解釋的空白","一份斥候報告與官方地圖互相矛盾"],tags:["偵察","地形","邊境"],weight:13,tendencies:["偵察","追蹤","辨路"],class_bias:["C-SCOUT","C-RNG"],
 facets:[
  {id:"military_scout",name:"軍方斥候",weight:6,note:"更熟悉傳令、前哨、軍用地圖與規範化回報。",knowledge:["地形","軍務"],flags:["military_scout"]},
  {id:"ranger_apprentice",name:"巡林客學徒",weight:7,note:"更熟悉林地巡查、追蹤、人獸衝突與邊境小徑。",knowledge:["邊境","森林"],flags:["ranger_apprentice"]}
 ]},
"O-MONSTERHUNTER":{
 name:"魔物獵手學徒",description:"接受過以魔物生態、痕跡與準備工作為核心的危險訓練，仍只是學徒而不是百科全書。",
 signature:"面對已知魔物時會先問棲地、食性、弱點與需要帶什麼，而不是先拔武器。",burden:"知識只涵蓋真正學過或接觸過的目標，未知魔物仍然未知。",drive:"想從照著前人筆記準備，走到能留下可靠筆記給下一個人。",social_access:"獵魔人、藥材商、標本商、邊境公會與獵戶",distinctive_axis:"生態—弱點—準備",hooks:["師門筆記記載一種本地不該出現的痕跡","委託方刻意隱瞞魔物的活動範圍"],tags:["魔物","狩獵","準備"],flags:["apprentice_only"]},

"O-DRUIDCHILD":{
 name:"林環養成者",description:"在森林聚落或德魯伊圈長大，熟悉的是自然循環、採集節制與哪些地方不該隨便動手。",
 signature:"能把採集、棲地、季節和生物彼此影響放在同一張圖裡思考。",burden:"自然禁忌與城鎮需求可能衝突，熟悉森林也不代表熟悉每片荒野。",drive:"想找到人類生活與自然循環不必永遠互相犧牲的方法。",social_access:"林地聚落、德魯伊圈、採集者、藥草師與獵戶",distinctive_axis:"循環—採集—棲地",hooks:["長期採集點突然枯竭","林環禁地出現人為施工痕跡"],tags:["自然","採集","森林"]},
"O-ELFRAISED":{
 name:"精靈社群養成者",description:"不論原本種族，由精靈社群撫養，學到的是文化、禮節與生活節奏，不會因此改寫種族。",
 signature:"理解部分精靈禮節、森林生活與以更長時間尺度看事情的習慣。",burden:"你對精靈文化的熟悉來自養育經驗，不等於自動被所有精靈視為自己人。",drive:"想在養育自己的文化與原本身分之間建立不靠血統證明的歸屬。",social_access:"精靈聚落、林地商旅、弓匠與文化中介者",distinctive_axis:"文化—森林—外來身分",hooks:["養育社群要求你代為傳話","外界把你誤認成精靈政治代表"],tags:["精靈文化","森林","養育"]},
"O-DRAGONRAISED":{
 name:"龍族守養者",description:"極罕見地由具理性的龍族或亞龍守護者照料過一段童年；這是養育經驗，不是血統證明。",
 signature:"熟悉部分龍族禮節、山地生活與在巨大力量面前保持分寸的習慣。",burden:"經驗太罕見，說出口常被當成誇大、異端或可利用的關係；也不因此擁有龍血。",drive:"想弄清楚守護自己的存在究竟留下了責任、債，還是只有記憶。",social_access:"山地守望者、少數龍族研究者、亞龍聚落與隱居者",distinctive_axis:"守養—山地—龍族禮節",hooks:["守養者多年後第一次傳來訊息","有人要求你證明與龍族的關係"],tags:["龍族","養育","山地"],flags:["dragon_raised","no_blood_assumption"]},
"O-SCHOLAR":{
 name:"典籍家學者",description:"在書房、抄本與文書工作中長大，最擅長的不是記很多，而是知道一條說法從哪裡來。",
 signature:"善於找出典、做索引、比對版本並把『知道』和『猜測』分開。",burden:"書本知識容易落後現地狀況，離開文獻來源後必須承認不知道。",drive:"想把整理別人留下的知識，走到能親自驗證並留下可靠紀錄。",social_access:"抄寫員、學者、檔案庫、書商與私人藏書圈",distinctive_axis:"出典—索引—辨偽",hooks:["一份常用史料被證明有後世增補","老師留下的索引指向不存在的館藏"],tags:["學術","文獻","辨偽"],weight:12,starter_subjobs:["SJ-SCROLL"],learnable_subjobs:["SJ-ENCHANT"],tendencies:["閱讀","抄寫","辨偽"],knowledge:["歷史","文獻"],class_bias:["C9-TACTSCHOLAR","C-MAG"],
 facets:[
  {id:"scholar_household",name:"學者家學",weight:8,note:"從家庭書房與文書工作建立穩定的閱讀、抄寫與查證習慣。",knowledge:["歷史","文獻"],flags:["scholar_household"]},
  {id:"sage_disciple",name:"賢者弟子",weight:4,note:"更熟悉一對一指導、魔法理論與把問題拆到原理層處理。",knowledge:["魔法理論","古文"],flags:["sage_disciple"]}
 ]},
"O-ACADEMY":{
 name:"法術學院生",description:"曾在正式法術學院就讀，熟悉課程、考核、術式安全與同儕競爭。",
 signature:"能用系統化術理說明法術為什麼應該這樣運作，也知道學院如何判定合格。",burden:"理論與制度經驗很強，卻可能高估標準環境在野外的適用性。",drive:"想證明自己不只是會通過考試，而是真的能讓知識在現場成立。",social_access:"學院生、導師、圖書館、法術材料商與校友",distinctive_axis:"課程—術理—學院人脈",hooks:["昔日研究小組的成果被他人署名","學院發布與你記憶不一致的事故公告"],tags:["魔法","學院","術理"]},
"O-EXILED-MAGE":{
 name:"被逐法術學徒",description:"因違規、研究爭議或危險實驗被逐出學院；留下的是制度紀錄，不代表掌握禁術。",
 signature:"既懂基礎術理，也知道哪些規章曾經限制自己、哪些是真的安全底線。",burden:"學院紀錄會影響師承、人脈與可信度；被逐不等於獲得任何高階能力。",drive:"想釐清自己當年越線是因為傲慢、誤會，還是制度真的有問題。",social_access:"前同窗、地下材料商、邊緣研究者與少數仍願意往來的導師",distinctive_axis:"術理—違規紀錄—自證",hooks:["當年事故出現新證詞","學院要求交回一件其實不在你手上的研究物"],tags:["魔法","放逐","學院"],flags:["academy_exile","no_forbidden_mastery"]},
"O-ALC":{
 name:"煉金工房學徒",description:"在藥草、蒸餾器與坩堝旁長大，知道配比、純度與安全紀錄比『神奇效果』更重要。",
 signature:"能辨認常見素材狀態、操作污染風險與配比是否合理。",burden:"專長依賴工具、素材與乾淨環境，缺一樣都不能只靠天分補上。",drive:"想把會照配方操作，磨成能理解每一步為什麼存在。",social_access:"煉金工房、藥草商、醫療所、玻璃器具商與素材採集者",distinctive_axis:"配比—純度—安全",hooks:["一批常用素材出現異常純度","舊工房配方被人改掉關鍵註記"],tags:["煉金","素材","安全"]},
"O-BARDAPP":{
 name:"遊吟藝徒",description:"跟著流浪藝人旅行，學會表演，也學會同一件事在不同地方會被唱成完全不同版本。",
 signature:"能用表演打開話題，並注意傳聞在跨地區流動時如何被改寫。",burden:"故事容易變形，受歡迎不等於可信；名聲也可能比本人先抵達下一座城。",drive:"想留下既好聽又不必靠謊言撐起來的故事。",social_access:"藝人、旅店、節慶、市集與地方說書人",distinctive_axis:"表演—版本—傳聞",hooks:["一首關於你的歌先於你傳到陌生城鎮","師父教過的曲子藏有不尋常地名"],tags:["表演","傳聞","旅行"]},
"O-ASTROAPP":{
 name:"星曆觀測學徒",description:"以星圖、曆法與長期觀測為學習核心，知道預測首先來自記錄，而不是神祕斷言。",
 signature:"善於校對時間、季節與天象紀錄，能分辨觀測與解讀之間的差距。",burden:"天象能提供線索，不會替你保證命運；過度解讀反而最危險。",drive:"想知道長期記錄究竟能解釋多少世界變化，又有哪些永遠只能保持未知。",social_access:"觀星台、曆官、航海者、抄寫員與學術圈",distinctive_axis:"星圖—時間—長期記錄",hooks:["星表出現連續數年的微小偏差","地方預言引用了一個錯誤曆日"],tags:["星象","曆法","觀測"]},

"O-CURSEDCHILD":{
 name:"厄兆之子",description:"出生時伴隨不祥徵兆或家族詛咒傳聞；這是社會對你的解讀，不是已證實的超自然事實。",
 signature:"長期處在猜疑裡，使你特別擅長分辨真正危險與他人投射的恐懼。",burden:"污名本身就能造成實際傷害，即使『詛咒』從未被證明。",drive:"想找到一個不需要靠證明自己無辜才能活下去的位置。",social_access:"邊緣宗教人士、民間解厄者、受排斥者與地方傳聞圈",distinctive_axis:"厄兆—污名—自我定義",hooks:["多年未發生的厄兆傳聞重新流行","有人宣稱掌握證明詛咒存在的物證"],tags:["厄兆","污名","傳聞"],flags:["curse_rumor"]},
"O-DEMONLINE":{
 name:"魔血傳聞家系",description:"家族傳說中帶有稀薄魔族祖源；若種族資料沒有證實，就只是一項家系傳聞與魔力傾向。",
 signature:"熟悉家族如何保存、隱瞞或利用一段被人害怕的祖源故事。",burden:"外界偏見可能把傳聞當事實；背景本身不會改寫種族或自動授予魔族能力。",drive:"想決定要查證、隱藏，還是讓這段家史失去支配自己的力量。",social_access:"家族長輩、禁忌史料、邊緣術士與家系研究者",distinctive_axis:"祖源傳說—黑暗親和—偏見",hooks:["不同家族支系保存互相矛盾的族譜","有人願高價購買你的家系資料"],tags:["家系","魔族傳聞","偏見"],flags:["demon_lineage_rumor"]},
"O-DRAGONLINE":{
 name:"龍血傳聞家系",description:"家族保存遠古龍族血緣傳說；是否真有血脈必須由種族資料與後續可靠證據驗證。",
 signature:"熟悉家族中的龍族傳說、象徵與和山地生活相連的習慣。",burden:"傳說容易招來崇拜、覬覦與誤判；背景不等於已確認龍血。",drive:"想知道自己追的是血統真相，還是家族用來理解自己的故事。",social_access:"家族長輩、山地聚落、龍族史研究者與血統傳聞圈",distinctive_axis:"血統傳說—山地—驗證",hooks:["一件家傳物被判定年代不符","陌生研究者拿著另一份龍血族譜上門"],tags:["家系","龍族傳聞","山地"],flags:["dragon_lineage_rumor"]},
"O-SLAVE":{
 name:"脫逃奴役者",description:"曾長期受人控制，剛獲自由或逃離束縛，最熟悉的是在幾乎沒有資源時保住自己。",
 signature:"對命令語氣、控制手段、監視習慣與最低限度生存特別敏感。",burden:"物資、社會身分與可信任人脈都很少，舊控制者也可能仍在尋找你。",drive:"想把『活下來』之後的人生第一次真正改寫成自己的選擇。",social_access:"底層勞工、逃亡者、廉價旅店與地下救助網",distinctive_axis:"控制—求生—自由",hooks:["另一名逃亡者帶來舊主人的消息","某地法律仍承認舊契約的效力"],tags:["奴役","逃亡","底層"],flags:["escaped_slave","low_social_status"]},
"O-AVENGER":{
 name:"私仇追索者",description:"重要關係遭受嚴重損失，因此沿著一條私人仇怨旅行；這條線不會自動等同世界主線。",
 signature:"擅長抓住零碎線索、記住相關人物並持續追查同一件事。",burden:"長期鎖定單一目標容易形成隧道視野，讓不相關的人也被捲進來。",drive:"想知道真正需要的是報復、真相，還是讓傷害不再繼續。",social_access:"舊鄰里、賞金消息、地方執法與私人線人",distinctive_axis:"線索—仇怨—底線",hooks:["關鍵嫌疑人出現與你記憶矛盾的不在場證據","受害者家屬不支持你的追索方式"],tags:["私仇","追查","執念"],flags:["personal_vendetta","no_forced_mainplot"]},
"O-SURVIVOR":{
 name:"災變倖存者",description:"曾從村落襲擊、魔物災害或戰亂中生還；真正留下的是對預警、撤離與失去的記憶。",
 signature:"遇到危機時會本能注意出口、補給、弱者位置與最壞情況。",burden:"風險敏感能救命，也可能讓你對相似場景過度戒備。",drive:"想讓自己當年僥倖活下來的經驗，下一次能成為別人的準備。",social_access:"災民、救援者、地方教會、難民營與重建工匠",distinctive_axis:"預警—避難—倖存記憶",hooks:["當年災變出現新的幸存者","熟悉的災害徵兆在另一地重現"],tags:["災害","避難","倖存"],flags:["survivor","no_unique_survivor"]},
"O-OMEN":{
 name:"地方預兆牽涉者",description:"地方占卜或古老預兆曾提到與你相似的特徵；內容模糊且地方性，不代表救世主或世界主角。",
 signature:"比一般人更熟悉別人如何把模糊預兆投射到一個具體的人身上。",burden:"即使預兆不可靠，他人的期待、恐懼與利用仍會造成真實後果。",drive:"想決定自己的選擇是否能和別人替你寫好的解讀分開。",social_access:"地方神殿、占卜者、傳說研究者與相信預兆的民眾",distinctive_axis:"模糊預兆—地方信仰—投射",hooks:["預兆出現互相衝突的新版本","某地把與你相似的人當成另一種象徵"],tags:["預兆","地方傳說","信仰"],flags:["regional_omen_only","not_chosen_one","no_forced_mainplot"]},
"O-PENITENT":{
 name:"自願贖罪者",description:"曾犯下嚴重過錯或造成傷害，主動離開原生活圈尋求補償；贖罪不保證被原諒。",
 signature:"做決定時會特別注意代價由誰承擔，也願意做沒有掌聲的補償工作。",burden:"過去不會因努力改變就消失，受害者也沒有義務接受你的贖罪。",drive:"想把『後悔』變成可被驗證的長期行動。",social_access:"宗教救助、苦役工作、受害者周邊與願意接納改過者的團體",distinctive_axis:"過錯—補償—界線",hooks:["受害者家屬提出你無法輕易做到的要求","過去事件被第三方拿來勒索"],tags:["贖罪","責任","過去"],flags:["seeking_redemption"]},
"O-FAITHLESS":{
 name:"離教神職者",description:"曾接受神職教育，後來因事件失去信仰或離開教會；熟悉教義，不代表仍接受它。",
 signature:"理解神殿制度、教義語言與照護工作，也能看見其中理想與現實的落差。",burden:"舊同僚、舊誓言與現在的懷疑會反覆衝突；離教也不等於遭神明詛咒。",drive:"想確認離開一套信念之後，自己仍願意守住哪些事情。",social_access:"前神職、病患、神殿文書、懷疑者與宗教辯論圈",distinctive_axis:"教義內知—懷疑—照護",hooks:["昔日教會要求你作證","一位舊信徒仍把你當成神職者求助"],tags:["宗教","離教","懷疑"],flags:["former_clergy"]},
"O-WANDER":{
 name:"失憶流浪者",description:"記憶殘缺，只保留基本生活能力與零碎技能；不預設隱藏王族、神器或世界級身分。",
 signature:"擅長從當下線索重新建立生活規律，也更願意承認不知道自己過去是誰。",burden:"缺少穩定人脈、可驗證履歷與過去脈絡，任何自稱認識你的人都需要核實。",drive:"想決定自己要找回多少過去，又有多少人生可以從現在開始建立。",social_access:"旅店、救助所、道路商隊與偶然認出你的人",distinctive_axis:"殘片—適應—未知",hooks:["陌生人用另一個名字叫你","隨身舊物與某地檔案出現可驗證連結"],tags:["失憶","漂泊","未知"],flags:["amnesia","no_secret_royalty","no_forced_mainplot"]}
};

const mergedIds=new Set(Object.keys(MERGES));
DB.origins=DB.origins.filter(row=>row&&!mergedIds.has(row.id)).map(row=>{
  const p=PROFILES[row.id];
  if(!p)return row;
  const out={...row,...p};
  out.flags=[...new Set([...(row.flags||[]),...(p.flags||[])])];
  out.knowledge=[...new Set([...(p.knowledge||row.knowledge||[])])];
  out.tendencies=[...new Set([...(p.tendencies||row.tendencies||[])])];
  out.tags=[...new Set([...(p.tags||[])])];
  out.hooks=[...new Set([...(p.hooks||[])])];
  if(Array.isArray(p.facets))out.facets=p.facets.map(x=>({...x}));
  return out;
});

DB.origin_system=DB.origin_system&&typeof DB.origin_system==="object"?DB.origin_system:{};
DB.origin_system.version=REV;
DB.origin_system.core_count=DB.origins.length;
DB.origin_system.category_counts=DB.origins.reduce((acc,x)=>(acc[x.category]=(acc[x.category]||0)+1,acc),{});
DB.origin_system.legacy_origin_map={...(DB.origin_system.legacy_origin_map||{}),...MERGES};
DB.origin_system.legacy_origin_facets={...(DB.origin_system.legacy_origin_facets||{}),...LEGACY_FACETS};
DB.origin_system.default_facets={...(DB.origin_system.default_facets||{}),...DEFAULT_FACETS};
DB.origin_system.merge_map={...MERGES};
DB.origin_system.depth_fields=["signature","burden","drive","social_access","distinctive_axis","hooks","tags","facets"];
DB.origin_system.rules=[
  "出身先以核心archetype決定生活經驗，再以背景側寫保留同一生活圈內的差異；側寫不得假裝成另一個高階身分。",
  "高度同質出身不再重複占用隨機池；合併後權重等於舊項權重總和，維持原本出現率分布。",
  "每個出身都必須同時描述特色、代價、行動動機、人脈接觸與至少兩個故事鉤子，禁止只換名稱與能力值。",
  "出身可以提供知識來源、人脈與最多1個F級起始副職業，但不直接授予高階戰力、世界主線資格或未驗證秘密。",
  "龍血、魔血、詛咒與預兆若無其他canonical資料支持，一律維持傳聞／社會解讀，不擅自改寫種族、能力或命運。",
  "舊存檔被合併的originId必須映射到核心出身，並盡可能以originFacetId保留原本背景側寫。"
];

function audit(){
  const issues=[];
  const expected=44;
  const ids=new Set(),names=new Set();
  if(DB.origins.length!==expected)issues.push("核心出身數量應為44，實際"+DB.origins.length);
  for(const id of Object.keys(MERGES))if(DB.origins.some(x=>x.id===id))issues.push("已合併出身仍存在："+id);
  for(const row of DB.origins){
    if(!row?.id){issues.push("出身缺ID");continue}
    if(ids.has(row.id))issues.push("出身ID重複："+row.id);ids.add(row.id);
    if(!row.name)issues.push("出身缺名稱："+row.id);
    else if(names.has(row.name))issues.push("出身名稱重複："+row.name);else names.add(row.name);
    for(const field of ["signature","burden","drive","social_access","distinctive_axis"]){
      if(!String(row[field]||"").trim())issues.push(row.id+"缺少"+field);
    }
    if(!Array.isArray(row.hooks)||row.hooks.length<2)issues.push(row.id+"故事鉤子不足2個");
  }
  for(const [oldId,newId] of Object.entries(MERGES)){
    if(!ids.has(newId))issues.push("舊出身映射目標不存在："+oldId+"->"+newId);
    const facetId=LEGACY_FACETS[oldId],target=DB.origins.find(x=>x.id===newId);
    if(facetId&&!(target?.facets||[]).some(x=>x.id===facetId))issues.push("舊出身側寫不存在："+oldId+"->"+facetId);
  }
  for(const [id,facetId] of Object.entries(DEFAULT_FACETS)){
    const target=DB.origins.find(x=>x.id===id);
    if(!(target?.facets||[]).some(x=>x.id===facetId))issues.push("預設側寫不存在："+id+"->"+facetId);
  }
  const postWeight=DB.origins.reduce((s,x)=>s+Number(x?.weight||1),0);
  if(PRE_COUNT>=50&&Math.abs(postWeight-PRE_WEIGHT)>.001)issues.push("合併後隨機總權重改變："+PRE_WEIGHT+"->"+postWeight);
  return {revision:REV,release:RELEASE,pass:issues.length===0,issues:[...new Set(issues)],stats:{previous_count:PRE_COUNT,canonical_count:DB.origins.length,merged_count:Object.keys(MERGES).length,weight_before:PRE_WEIGHT,weight_after:postWeight,categories:{...DB.origin_system.category_counts}}};
}

DB.meta=DB.meta||{};
DB.meta.origin_depth_revision=REV;
DB.origin_depth_system={version:REV,release:RELEASE,canonical_count:DB.origins.length,merged_count:Object.keys(MERGES).length,merge_map:{...MERGES},save_compatible:true,initial_audit:audit()};
globalThis.runOriginDepthAudit=audit;
CORE?.registerModule?.("src/origin-depth-v1.js",{domain:"data",revision:REV,release:RELEASE});
})();
