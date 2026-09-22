const CACHE_PREFIX="qunlu-pwa-";
const CACHE_NAME=CACHE_PREFIX+"v135";
const CORE=[
  "./",
  "./index.html",
  "./version.json",
  "./manifest.webmanifest",
  "./assets/css/game.css",
  "./src/bootstrap.js",
  "./src/game-data.js",
  "./src/data-patches.js",
  "./src/origin-depth-v1.js",
  "./src/combat-class-identity-depth-v1.js",
  "./src/talent-identity-depth-v1.js",
  "./src/asdail-depth-v2.js",
  "./src/asdail-narrative-depth-v1.js",
  "./src/asdail-integration-v1.js",
  "./src/affiliation-identity-depth-v1.js",
  "./src/political-consolidation-v1.js",
  "./src/political-hierarchy-depth-v1.js",
  "./src/starter-settlements-v1.js",
  "./src/anweir-seruvia-depth-v1.js",
  "./src/black-moon-depth-v1.js",
  "./src/black-tide-depth-v1.js",
  "./src/tyervalon-depth-v1.js",
  "./src/blue-tower-depth-v1.js",
  "./src/vanrek-depth-v1.js",
  "./src/gray-blade-depth-v1.js",
  "./src/frost-horn-depth-v1.js",
  "./src/white-felt-depth-v1.js",
  "./src/holy-radiance-depth-v1.js",
  "./src/dawn-casavelle-depth-v1.js",
  "./src/boundary-dragonspine-depth-v1.js",
  "./src/alchemy-healing-recipe-v1.js",
  "./src/equipment-depth-v1.js",
  "./src/crafting-recipe-semantic-v1.js",
  "./src/crafting-recipe-semantic-v2.js",
  "./src/equipment-recipe-balance-v1.js",
  "./src/recipe-economy-balance-v1.js",
  "./src/trade-venues-data-v1.js",
  "./src/runtime.js",
  "./src/asdail-narrative-runtime-v1.js",
  "./src/companion-growth-v1.js",
  "./src/crafting-success-v2.js",
  "./src/market-economy-v2.js",
  "./src/trade-venues-runtime-v1.js",
  "./src/world-autonomy-v1.js",
  "./src/runtime-patches.js",
  "./src/affiliation-contribution-v1.js",
  "./src/affiliation-entry-gate-v1.js",
  "./src/affiliation-treasury-depth-v2.js",
  "./src/world-autonomy-v2.js",
  "./src/world-map-geopolitics-v1.js",
  "./src/npc-depth-v1.js",
  "./src/npc-depth-v2.js",
  "./src/dungeon-depth-v2.js",
  "./src/combat-class-progression-v1.js",
  "./src/class-skill-optimization-v1.js",
  "./src/class-skill-passive-compat-v1.js",
  "./src/class-naming-reference-v1.js",
  "./src/skill-naming-reference-v1.js",
  "./src/skill-mechanics-depth-v1.js",
  "./src/system-integrity-v2.js",
  "./src/affiliation-integrity-v1.js",
  "./src/player-experience-guidance-v1.js",
  "./src/world-naming-v1.js",
  "./src/world-naming-v2.js",
  "./src/world-naming-protection-v1.js",
  "./src/equipment-naming-reference-v1.js",
  "./src/name-generator-v2.js",
  "./src/water-source-v1.js",
  "./src/companion-aura-v1.js",
  "./src/companion-unique-skill-v1.js",
  "./src/companion-identity-depth-v1.js",
  "./src/companion-species-identity-v1.js",
  "./src/adventure-party-teammate-depth-v1.js",
  "./src/rpg-reference-synthesis-v1.js",
  "./src/recipe-finalization-v1.js",
  "./src/release-integrity-v1.js",
  "./src/release-version-sync-v1.js",
  "./src/pwa.js",
  "./src/program-registry-v1.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE))
      .catch(()=>null)
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function cachePut(request,response){
  if(!response||!response.ok)return response;
  const cache=await caches.open(CACHE_NAME);
  cache.put(request,response.clone()).catch(()=>{});
  return response;
}

async function networkFirst(request,{ignoreSearchFallback=false}={}){
  try{
    const fresh=await fetch(request,{cache:"no-store"});
    return await cachePut(request,fresh);
  }catch(error){
    const cached=await caches.match(request);
    if(cached)return cached;
    if(ignoreSearchFallback){
      const fallback=await caches.match(request,{ignoreSearch:true});
      if(fallback)return fallback;
    }
    throw error;
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  try{
    const fresh=await fetch(request);
    return await cachePut(request,fresh);
  }catch(error){
    const fallback=await caches.match(request,{ignoreSearch:true});
    if(fallback)return fallback;
    throw error;
  }
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  const isNavigation=request.mode==="navigate";
  const isVersion=url.pathname.endsWith("/version.json");
  const isStatic=/\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$/i.test(url.pathname);

  if(isNavigation){
    event.respondWith((async()=>{
      try{return await networkFirst(request)}
      catch(error){
        const shell=await caches.match("./index.html");
        if(shell)return shell;
        throw error;
      }
    })());
    return;
  }

  if(isVersion){
    event.respondWith(networkFirst(request,{ignoreSearchFallback:true}));
    return;
  }

  if(isStatic){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request,{ignoreSearchFallback:true}));
});
