(()=>{
  "use strict";
  const REVISION="RELEASE-VERSION-SYNC-1.2";
  const scriptVersion=typeof document!=="undefined"?String(document.currentScript?.dataset?.release||"").trim():"";
  const titleVersion=typeof document!=="undefined"?(String(document.title||"").match(/CURRENT-\d+\.\d+\.\d+/)?.[0]||""):"";
  const RELEASE_VERSION=scriptVersion||titleVersion||globalThis.DB?.meta?.current_version||"CURRENT-1.69.0";

  if(globalThis.DB?.meta){
    DB.meta.current_version=RELEASE_VERSION;
    DB.meta.release_version_sync_revision=REVISION;
  }

  if(typeof localGameVersion==="function"){
    localGameVersion=function(){return RELEASE_VERSION};
  }

  if(typeof migrateSave==="function"){
    const baseMigrateSave=migrateSave;
    migrateSave=function(){
      const result=baseMigrateSave();
      try{
        if(G?.meta)G.meta.version=RELEASE_VERSION;
      }catch(error){
        console.warn("release version save sync failed",error);
      }
      return result;
    };
  }

  globalThis.QUNLU_RELEASE_VERSION=RELEASE_VERSION;
})();
