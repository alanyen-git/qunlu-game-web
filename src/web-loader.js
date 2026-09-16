(()=>{
  const overlay=document.createElement('div');
  overlay.id='webBootOverlay';
  overlay.setAttribute('role','status');
  overlay.textContent='群陸旅誌載入中…';
  Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'20000',display:'grid',placeItems:'center',background:'#071014',color:'#f3e2af',fontSize:'18px',fontWeight:'700'});
  document.body.appendChild(overlay);

  const cacheBust=()=>`v=${Date.now()}`;
  const fetchText=async url=>{
    const r=await fetch(`${url}?${cacheBust()}`,{cache:'no-store'});
    if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);
    return r.text();
  };
  const loadClassicScript=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=`${src}?${cacheBust()}`;
    s.async=false;
    s.onload=resolve;
    s.onerror=()=>reject(new Error(`無法載入 ${src}`));
    document.head.appendChild(s);
  });
  const executeClassic=(code,label)=>{
    const s=document.createElement('script');
    s.textContent=`${code}\n//# sourceURL=${label}`;
    document.head.appendChild(s);
  };
  const decodeGzipBase64=async paths=>{
    const parts=await Promise.all(paths.map(path=>fetchText(`web-dist/${path}`)));
    const b64=parts.join('').replace(/\s+/g,'');
    const raw=atob(b64);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    if(!('DecompressionStream' in window))throw new Error('此瀏覽器不支援網頁版解壓縮，請更新 Chrome／Brave。');
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };

  (async()=>{
    const manifestResponse=await fetch(`web-dist/chunks.json?${cacheBust()}`,{cache:'no-store'});
    if(!manifestResponse.ok)throw new Error(`chunks.json HTTP ${manifestResponse.status}`);
    const manifest=await manifestResponse.json();
    if(manifest.format!=='gzip-base64-chunks-v1')throw new Error('不支援的遊戲資料格式');

    const gameData=await decodeGzipBase64(manifest.game_data);
    executeClassic(gameData,'src/game-data.js');
    await loadClassicScript('src/data-patches.js');

    const runtime=await decodeGzipBase64(manifest.runtime);
    executeClassic(runtime,'src/runtime.js');
    await loadClassicScript('src/runtime-patches.js');
    await loadClassicScript('src/pwa.js');

    window.__QUNLU_WEB_READY__=true;
    overlay.remove();
  })().catch(error=>{
    console.error('Qunlu web boot failed',error);
    overlay.textContent=`群陸旅誌載入失敗：${error.message}。請重新整理頁面。`;
    overlay.style.padding='24px';
    overlay.style.textAlign='center';
  });
})();
