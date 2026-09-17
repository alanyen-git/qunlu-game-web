(()=>{
  "use strict";
  const RELEASE_VERSION="CURRENT-1.64.2";

  if(globalThis.DB?.meta){
    DB.meta.current_version=RELEASE_VERSION;
    DB.meta.release_version_sync_revision="RELEASE-VERSION-SYNC-1.0";
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
