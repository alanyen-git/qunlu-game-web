(function battleArtModule(){
  "use strict";
  const VERSION="BATTLE-ART-1.0";
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[ch]));
  function hash(text){let h=2166136261;for(const ch of String(text||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  const hsl=(h,s,l)=>`hsl(${Math.round((h+360)%360)} ${s}% ${l}%)`;
  const uri=svg=>"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
  const tierAccent=tier=>({F:"#a6b4c3",E:"#78bc7a",D:"#6aa7df",C:"#9a7ce0",B:"#e3b94f",A:"#ee8d57",S:"#f16c86"})[tier]||"#d9d9d9";

  function classArchetype(c){
    const text=[c?.name,c?.category,c?.combat_role,c?.weapon_group,c?.combat_track].filter(Boolean).join(" ");
    if(/弓|弩|遊俠|獵|射手/.test(text))return "ranger";
    if(/法|術|巫|魔導|咒|賢者|元素/.test(text))return "mage";
    if(/牧|神官|祭司|聖職|僧侶|德魯伊|治療/.test(text))return "priest";
    if(/盜|刺客|暗殺|忍|匕首|斥候/.test(text))return "rogue";
    if(/騎士|聖騎|守護|盾|重裝|坦/.test(text))return "guardian";
    if(/槍|矛|長兵/.test(text))return "lancer";
    if(/斧|錘|鎚|狂戰|鬥士/.test(text))return "brute";
    if(/吟遊|舞者|樂師/.test(text))return "bard";
    return "warrior";
  }

  function weaponSvg(group,seed,accent,metal){
    const flip=seed%2===0?1:-1,x=flip===1?184:56,t=`translate(${x} 184) scale(${flip} 1)`;
    if(/弓/.test(group||""))return `<g transform="${t}" stroke="${metal}" stroke-width="7" fill="none" stroke-linecap="round"><path d="M0 -86 Q54 0 0 86"/><path d="M0 -86 L18 0 L0 86" stroke-width="2"/><path d="M18 0 L66 -8" stroke="${accent}" stroke-width="4"/><path d="M66 -8 l-13 -7 l3 13 z" fill="${metal}" stroke="none"/></g>`;
    if(/弩/.test(group||""))return `<g transform="${t}" stroke="${metal}" stroke-width="7" fill="none"><path d="M-8 18 L45 0 L-8 -18"/><path d="M5 0 L72 0"/><path d="M28 -8 L28 18" stroke="${accent}"/></g>`;
    if(/法杖|杖|權杖/.test(group||""))return `<g transform="${t}"><path d="M0 -88 L0 90" stroke="${metal}" stroke-width="8" stroke-linecap="round"/><circle cy="-98" r="20" fill="${accent}" stroke="#f8e7b5" stroke-width="4"/><circle cy="-98" r="7" fill="#fff" opacity=".8"/></g>`;
    if(/槍|矛|長兵/.test(group||""))return `<g transform="${t}"><path d="M0 -104 L0 98" stroke="${metal}" stroke-width="7"/><path d="M0 -126 l-15 26 h30 z" fill="${accent}" stroke="#eee" stroke-width="3"/></g>`;
    if(/斧/.test(group||""))return `<g transform="${t}"><path d="M0 -70 L0 94" stroke="${metal}" stroke-width="9"/><path d="M-2 -76 q34 -18 53 4 q-12 35 -52 32z" fill="${accent}" stroke="#eee" stroke-width="3"/></g>`;
    if(/錘|鎚/.test(group||""))return `<g transform="${t}"><path d="M0 -55 L0 95" stroke="${metal}" stroke-width="9"/><rect x="-25" y="-92" width="55" height="38" rx="6" fill="${accent}" stroke="#eee" stroke-width="3"/></g>`;
    if(/匕首/.test(group||""))return `<g transform="${t}"><path d="M0 -55 L0 58" stroke="${metal}" stroke-width="7"/><path d="M0 -88 l-11 35 h22 z" fill="#e9eef6"/><path d="M-14 58 h28" stroke="${accent}" stroke-width="8"/></g>`;
    if(/徒手/.test(group||""))return `<g transform="${t}"><circle cy="-22" r="16" fill="${accent}" stroke="#e7edf5" stroke-width="4"/><path d="M-15 -22 q15 -24 30 0" fill="none" stroke="#f6d18b" stroke-width="4"/></g>`;
    return `<g transform="${t}"><path d="M0 -86 L0 76" stroke="${metal}" stroke-width="8"/><path d="M0 -126 l-13 42 h26 z" fill="#eef4ff" stroke="${accent}" stroke-width="3"/><path d="M-19 75 h38" stroke="${accent}" stroke-width="8"/></g>`;
  }

  function classSvg(c){
    const seed=hash(c?.id||c?.name||"class"),archetype=classArchetype(c);
    const baseHue=(seed+(archetype==="mage"?210:archetype==="priest"?45:archetype==="rogue"?285:0))%360;
    const primary=hsl(baseHue,50+(seed%25),35+(seed%14)),secondary=hsl(baseHue+35,45,22+(seed%12));
    const accent=tierAccent(c?.tier),skin=hsl(24+(seed%18),42,70+(seed%10)),hair=hsl(seed%55,28+(seed%30),14+(seed%28)),metal=hsl(210,14,64+(seed%15));
    const cape=/mage|priest|bard|guardian/.test(archetype),helm=archetype==="guardian"||((seed>>3)%5===0),hood=archetype==="rogue"||((seed>>5)%7===0),robe=/mage|priest|bard/.test(archetype),aura=/mage|priest/.test(archetype);
    const emblem=["✦","◆","☽","♢","✧","◇"][seed%6],eye=hsl(180+(seed%150),65,58);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" role="img" aria-label="${esc(c?.name||"職業")}立繪"><defs><radialGradient id="a"><stop stop-color="${accent}" stop-opacity=".38"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity=".45"/></filter></defs>${aura?`<ellipse cx="120" cy="166" rx="100" ry="118" fill="url(#a)"/>`:""}<g filter="url(#s)">${cape?`<path d="M77 145 Q48 204 64 276 Q119 296 181 276 Q191 205 163 145z" fill="${secondary}" stroke="${accent}" stroke-width="4"/>`:""}<ellipse cx="120" cy="276" rx="70" ry="11" fill="#000" opacity=".24"/><path d="M89 219 L82 273 Q97 282 111 272 L116 220z" fill="${secondary}" stroke="#17202b" stroke-width="4"/><path d="M151 219 L158 273 Q143 282 129 272 L124 220z" fill="${secondary}" stroke="#17202b" stroke-width="4"/><path d="M79 141 Q120 118 161 141 L170 226 Q121 248 70 226z" fill="url(#b)" stroke="${accent}" stroke-width="5"/>${robe?`<path d="M83 187 Q120 206 157 187 L173 244 Q120 265 66 244z" fill="${secondary}" opacity=".95"/>`:""}<path d="M83 151 Q53 170 58 211" fill="none" stroke="${skin}" stroke-width="16" stroke-linecap="round"/><path d="M157 151 Q187 170 182 211" fill="none" stroke="${skin}" stroke-width="16" stroke-linecap="round"/><circle cx="120" cy="96" r="53" fill="${skin}" stroke="${accent}" stroke-width="4"/>${hood?`<path d="M68 103 Q66 35 120 31 Q179 39 172 110 Q155 70 120 64 Q86 72 68 103z" fill="${secondary}" stroke="${accent}" stroke-width="5"/>`:helm?`<path d="M70 91 Q74 35 120 31 Q166 35 171 91 L155 76 L145 51 Q120 40 95 51 L85 76z" fill="${metal}" stroke="${accent}" stroke-width="5"/><path d="M83 88 H157" stroke="#24303d" stroke-width="9"/>`:`<path d="M68 91 Q70 33 120 30 Q170 32 173 94 Q157 69 144 58 Q109 76 78 65z" fill="${hair}" stroke="#111924" stroke-width="4"/>`}<ellipse cx="99" cy="105" rx="7" ry="9" fill="${eye}"/><ellipse cx="141" cy="105" rx="7" ry="9" fill="${eye}"/><circle cx="101" cy="102" r="2" fill="#fff"/><circle cx="143" cy="102" r="2" fill="#fff"/><path d="M108 127 Q120 135 132 127" fill="none" stroke="#7a3d3d" stroke-width="3" stroke-linecap="round"/><circle cx="120" cy="175" r="22" fill="${secondary}" stroke="${accent}" stroke-width="4"/><text x="120" y="183" text-anchor="middle" font-size="24" fill="${accent}" font-family="serif">${emblem}</text>${weaponSvg(c?.weapon_group||"",seed,accent,metal)}</g></svg>`;
    return {seed,archetype,primary,secondary,accent,uri:uri(svg)};
  }

  function monsterArchetype(m){
    const text=[m?.name,m?.category,(m?.ecology_profile?.tags||[]).join(" ")].filter(Boolean).join(" ");
    if(/軟泥|史萊姆|凝膠/.test(text))return "slime";
    if(/龍|飛龍|蜥蜴|蛇|爬蟲/.test(text))return "dragon";
    if(/不死|亡靈|骷髏|殭屍|幽靈|屍/.test(text))return "undead";
    if(/惡魔|魔鬼|深淵|地獄/.test(text))return "demon";
    if(/元素|魔像|魔法生物|精靈|妖精/.test(text))return "arcane";
    if(/植物|樹|藤|花|蕈/.test(text))return "plant";
    if(/蟲|蛛|蠍|甲蟲|蜂|蚊/.test(text))return "insect";
    if(/魚|水生|蟹|鯊|章魚|海/.test(text))return "aquatic";
    if(/哥布林|獸人|巨人|人型|盜匪|傭兵/.test(text))return "humanoid";
    if(/鳥|鷹|鴉|翼/.test(text))return "bird";
    return "beast";
  }

  function monsterSvg(m){
    const seed=hash(m?.id||m?.name||"monster"),archetype=monsterArchetype(m);
    const baseHue=(seed+(archetype==="undead"?185:archetype==="demon"?345:archetype==="plant"?95:archetype==="aquatic"?195:0))%360;
    const body=hsl(baseHue,38+(seed%34),30+(seed%22)),dark=hsl(baseHue+12,34,18+(seed%14)),light=hsl(baseHue-15,48,57+(seed%15)),accent=tierAccent(m?.tier);
    const eye=(archetype==="undead"||archetype==="demon")?"#ff6f62":archetype==="arcane"?"#8ce8ff":"#ffe38a",p=[];
    if(archetype==="slime")p.push(`<path d="M45 225 Q42 149 88 125 Q111 111 111 78 Q113 48 139 52 Q169 57 158 89 Q150 112 177 125 Q213 144 205 225 Q192 260 125 260 Q58 259 45 225z" fill="${body}" stroke="${accent}" stroke-width="7"/><ellipse cx="98" cy="176" rx="10" ry="13" fill="${eye}"/><ellipse cx="152" cy="176" rx="10" ry="13" fill="${eye}"/><path d="M101 211 Q125 225 150 209" fill="none" stroke="${dark}" stroke-width="5"/>`);
    else if(archetype==="dragon")p.push(`<path d="M60 205 Q41 154 74 121 Q94 101 102 67 Q123 35 150 58 Q170 76 160 107 Q199 126 210 176 Q214 225 183 247 Q130 273 77 244z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M75 143 L27 104 Q32 164 73 184zM171 137 L221 95 Q216 161 177 184z" fill="${dark}" stroke="${accent}" stroke-width="5"/><path d="M111 70 L95 29 L126 58 M145 65 L168 30 L158 79" fill="${light}" stroke="${accent}" stroke-width="4"/><ellipse cx="119" cy="114" rx="9" ry="7" fill="${eye}"/><ellipse cx="148" cy="111" rx="9" ry="7" fill="${eye}"/><path d="M179 228 Q220 243 227 277 Q195 263 161 244" fill="${body}" stroke="${accent}" stroke-width="6"/>`);
    else if(archetype==="undead")p.push(`<path d="M83 133 Q74 73 124 55 Q176 74 166 133 L180 229 Q153 257 124 254 Q92 256 68 229z" fill="${dark}" stroke="${accent}" stroke-width="6"/><circle cx="124" cy="102" r="48" fill="#d9d8c8" stroke="${accent}" stroke-width="6"/><ellipse cx="105" cy="101" rx="13" ry="16" fill="#1b2026"/><ellipse cx="145" cy="101" rx="13" ry="16" fill="#1b2026"/><circle cx="105" cy="102" r="5" fill="${eye}"/><circle cx="145" cy="102" r="5" fill="${eye}"/><path d="M111 128 H139 M116 139 v12 M126 139 v13 M136 139 v11" stroke="#4a4a45" stroke-width="4"/><path d="M85 175 H164 M91 194 H158 M99 214 H151" stroke="#d6d6c8" stroke-width="8"/>`);
    else if(archetype==="demon")p.push(`<path d="M61 219 Q44 149 84 111 Q82 58 124 48 Q168 55 166 111 Q207 143 191 220 Q169 259 125 260 Q80 260 61 219z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M92 77 Q61 26 45 58 Q53 99 91 106zM157 77 Q190 26 207 59 Q198 99 160 107z" fill="${dark}" stroke="${accent}" stroke-width="5"/><ellipse cx="104" cy="128" rx="9" ry="8" fill="${eye}"/><ellipse cx="146" cy="128" rx="9" ry="8" fill="${eye}"/><path d="M104 166 Q125 179 147 164" fill="none" stroke="#241414" stroke-width="6"/><path d="M111 166 l6 15 M138 166 l-6 15" stroke="#f4e9d2" stroke-width="4"/><path d="M59 176 L24 138 Q25 205 67 215 M190 176 L226 139 Q225 205 183 215" fill="${dark}" stroke="${accent}" stroke-width="5"/>`);
    else if(archetype==="plant")p.push(`<path d="M102 112 Q119 57 143 112 L164 229 Q146 263 123 263 Q96 260 78 229z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M118 102 Q76 81 69 42 Q107 48 126 82 Q142 38 180 32 Q176 79 142 105" fill="${light}" stroke="${accent}" stroke-width="6"/><ellipse cx="105" cy="164" rx="9" ry="11" fill="${eye}"/><ellipse cx="144" cy="164" rx="9" ry="11" fill="${eye}"/><path d="M82 210 Q43 208 27 246 M163 210 Q203 207 221 246" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>`);
    else if(archetype==="insect")p.push(`<ellipse cx="126" cy="176" rx="54" ry="78" fill="${body}" stroke="${accent}" stroke-width="7"/><circle cx="126" cy="91" r="40" fill="${dark}" stroke="${accent}" stroke-width="6"/><path d="M104 60 L82 22 M148 60 L171 22" stroke="${light}" stroke-width="5"/><path d="M84 150 L34 111 M81 184 L25 184 M87 216 L41 252 M168 150 L216 111 M171 184 L227 184 M166 216 L211 252" stroke="${dark}" stroke-width="11" stroke-linecap="round"/><ellipse cx="110" cy="91" rx="8" ry="11" fill="${eye}"/><ellipse cx="142" cy="91" rx="8" ry="11" fill="${eye}"/>`);
    else if(archetype==="aquatic")p.push(`<path d="M50 178 Q78 109 150 113 Q196 118 211 173 Q190 231 129 239 Q70 239 50 178z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M54 176 L17 131 Q7 181 19 226z" fill="${dark}" stroke="${accent}" stroke-width="5"/><path d="M125 117 Q145 78 174 91 L158 130z" fill="${light}" stroke="${accent}" stroke-width="5"/><circle cx="167" cy="158" r="9" fill="${eye}"/><path d="M183 187 Q195 193 206 185" fill="none" stroke="${dark}" stroke-width="5"/>`);
    else if(archetype==="humanoid")p.push(`<circle cx="124" cy="89" r="45" fill="${light}" stroke="${accent}" stroke-width="6"/><path d="M74 141 Q125 117 176 142 L183 235 Q127 260 67 235z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M75 157 Q42 172 43 219 M175 157 Q209 173 207 219" stroke="${light}" stroke-width="15" stroke-linecap="round"/><ellipse cx="108" cy="91" rx="8" ry="10" fill="${eye}"/><ellipse cx="143" cy="91" rx="8" ry="10" fill="${eye}"/><path d="M102 118 Q124 129 148 117" fill="none" stroke="${dark}" stroke-width="5"/><path d="M190 94 L190 246" stroke="${dark}" stroke-width="9"/><path d="M190 60 l-15 35 h30 z" fill="${accent}"/>`);
    else if(archetype==="bird")p.push(`<ellipse cx="126" cy="163" rx="52" ry="70" fill="${body}" stroke="${accent}" stroke-width="7"/><circle cx="127" cy="88" r="39" fill="${light}" stroke="${accent}" stroke-width="6"/><path d="M91 145 Q36 123 28 188 Q67 177 99 202 M161 145 Q216 122 224 188 Q184 177 154 202" fill="${dark}" stroke="${accent}" stroke-width="5"/><path d="M126 103 L160 115 L127 128z" fill="#e9b54e"/><circle cx="114" cy="86" r="7" fill="${eye}"/><circle cx="140" cy="86" r="7" fill="${eye}"/><path d="M108 226 L93 267 M144 226 L160 267" stroke="${dark}" stroke-width="7"/><path d="M80 271 H106 M148 271 H175" stroke="${dark}" stroke-width="6"/>`);
    else if(archetype==="arcane")p.push(`<circle cx="125" cy="160" r="74" fill="${body}" stroke="${accent}" stroke-width="8"/><circle cx="125" cy="160" r="49" fill="none" stroke="${light}" stroke-width="5" stroke-dasharray="10 8"/><path d="M125 61 L143 115 L198 114 L154 147 L170 203 L125 171 L80 203 L96 147 L52 114 L107 115z" fill="${dark}" stroke="${accent}" stroke-width="5"/><circle cx="125" cy="160" r="20" fill="${eye}"/><circle cx="125" cy="160" r="8" fill="#fff"/><circle cx="55" cy="80" r="13" fill="${accent}" opacity=".8"/><circle cx="199" cy="69" r="9" fill="${light}" opacity=".8"/>`);
    else p.push(`<path d="M53 205 Q50 147 88 120 Q104 74 139 75 Q171 79 178 120 Q210 149 198 207 Q183 248 127 253 Q73 251 53 205z" fill="${body}" stroke="${accent}" stroke-width="7"/><path d="M86 116 Q67 72 86 48 L110 91 M162 116 Q185 71 165 47 L143 91" fill="${dark}" stroke="${accent}" stroke-width="5"/><path d="M77 213 L55 269 M108 225 L99 274 M151 225 L160 274 M181 213 L202 269" stroke="${dark}" stroke-width="13" stroke-linecap="round"/><ellipse cx="112" cy="135" rx="8" ry="9" fill="${eye}"/><ellipse cx="151" cy="135" rx="8" ry="9" fill="${eye}"/><path d="M118 163 Q132 172 147 162" fill="none" stroke="${dark}" stroke-width="5"/><path d="M54 190 Q18 170 30 135" fill="none" stroke="${body}" stroke-width="15" stroke-linecap="round"/>`);
    const horn=(seed>>4)%3,spikes=(seed>>8)%4;
    for(let i=0;i<horn;i++)p.push(`<path d="M${83+i*72} 84 l${-12+i*24} -37 l20 28z" fill="${light}" stroke="${accent}" stroke-width="3"/>`);
    for(let i=0;i<spikes;i++)p.push(`<path d="M${70+i*38} 232 l12 28 l13 -31z" fill="${light}" opacity=".9"/>`);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 300" role="img" aria-label="${esc(m?.name||"怪物")}立繪"><defs><filter id="s"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".48"/></filter><radialGradient id="g"><stop stop-color="${accent}" stop-opacity=".3"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><ellipse cx="125" cy="164" rx="113" ry="125" fill="url(#g)"/><ellipse cx="125" cy="276" rx="78" ry="12" fill="#000" opacity=".28"/><g filter="url(#s)">${p.join("")}</g></svg>`;
    return {seed,archetype,body,dark,light,accent,uri:uri(svg)};
  }

  function genericPartyPortrait(role,name){
    return classSvg({id:`PARTY:${name||role}`,name:name||role||"隊友",tier:"F",combat_role:role||"冒險者",weapon_group:/ranged|弓|射/.test(role||"")?"弓":/caster|healer|法|術|治療/.test(role||"")?"法杖":/tank|盾|守/.test(role||"")?"長劍":"長劍",combat_track:/caster|healer|法|術|治療/.test(role||"")?"magic":"physical"}).uri;
  }
  function genericCompanionPortrait(name,kind){
    return monsterSvg({id:`COMP:${name||kind}`,name:name||kind||"夥伴",tier:"F",category:/summon|召喚/.test(kind||"")?"元素植物魔法生物系":"野獸動物系"}).uri;
  }
  function install(){
    if(typeof DB!=="object"||!DB)return;
    let classCount=0,monsterCount=0;const classUris=new Set(),monsterUris=new Set();
    for(const c of (DB.combat_classes||[])){const art=classSvg(c);c.art_profile={version:VERSION,type:"class",seed:art.seed,archetype:art.archetype,palette:{primary:art.primary,secondary:art.secondary,accent:art.accent},portrait_uri:art.uri,battle_sprite_uri:art.uri};c.portrait_svg=art.uri;c.battle_sprite_svg=art.uri;classUris.add(art.uri);classCount++}
    for(const m of (DB.monsters||[])){const art=monsterSvg(m);m.art_profile={version:VERSION,type:"monster",seed:art.seed,archetype:art.archetype,palette:{body:art.body,dark:art.dark,light:art.light,accent:art.accent},portrait_uri:art.uri,battle_sprite_uri:art.uri};m.portrait_svg=art.uri;m.battle_sprite_svg=art.uri;monsterUris.add(art.uri);monsterCount++}
    DB.battle_art_system={version:VERSION,style:"原創三頭身奇幻JRPG向量立繪；職業依武器/定位、怪物依生態分類與名稱建立差異化輪廓。",class_portrait_count:classCount,monster_portrait_count:monsterCount,unique_class_portraits:classUris.size,unique_monster_portraits:monsterUris.size,database_fields:["art_profile","portrait_svg","battle_sprite_svg"],runtime:"SVG data URI / offline-safe / no external image dependency"};
    if(DB.meta)DB.meta.battle_art_revision=VERSION;
  }
  function audit(){
    const missingClasses=(DB.combat_classes||[]).filter(x=>!x?.portrait_svg||x?.art_profile?.version!==VERSION).map(x=>x.id);
    const missingMonsters=(DB.monsters||[]).filter(x=>!x?.portrait_svg||x?.art_profile?.version!==VERSION).map(x=>x.id);
    return {pass:missingClasses.length===0&&missingMonsters.length===0,version:VERSION,classes:(DB.combat_classes||[]).length,monsters:(DB.monsters||[]).length,missingClasses,missingMonsters};
  }
  install();
  globalThis.QunluBattleArt={
    version:VERSION,
    classPortrait:id=>(DB.combat_classes||[]).find(x=>x.id===id)?.portrait_svg||genericPartyPortrait("warrior",id),
    monsterPortrait:id=>(DB.monsters||[]).find(x=>x.id===id)?.portrait_svg||monsterSvg({id,name:id,tier:"F",category:"野獸動物系"}).uri,
    partyPortrait:(role,name)=>genericPartyPortrait(role,name),
    companionPortrait:(name,kind)=>genericCompanionPortrait(name,kind),
    classSvg,monsterSvg,audit
  };
  globalThis.runBattleArtAudit=audit;
})();