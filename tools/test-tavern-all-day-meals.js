const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const data=vm.createContext({});
vm.runInContext(fs.readFileSync("src/game-data.js","utf8"),data,{filename:"src/game-data.js"});
const meal=vm.runInContext("JSON.parse(JSON.stringify(DB.meal_service_system))",data);
const source=fs.readFileSync("src/runtime-patches.js","utf8");
const start=source.lastIndexOf("/* TAVERN-ALL-DAY-1.0");
assert(start>=0,"missing tavern patch");
const patch=source.slice(start);
const events=[],view={title:"",body:""};
const state={
  DB:{meal_service_system:meal,facilities:{tavern:{name:"酒館"},inn:{name:"旅館"}}},
  G:{worldTime:{hour:0,minute:0},character:{currentFacility:"tavern",moneySilver:100,hunger:80,thirst:40,fatigue:30,hp:20,maxHp:60}},
  openMealService(fid){events.push("original-open:"+fid);return fid},
  eatFacilityMeal(fid){events.push("original-eat:"+fid);return fid},
  renderFacility(fid){events.push("original-render:"+fid);return fid},
  showModal(title,body){view.title=title;view.body=body},
  closeModal(){events.push("close")},
  beginTurn(reason){events.push("begin:"+reason);return true},
  endTurn(hours){events.push("end:"+hours)},
  log(tag,message){events.push(tag+":"+message)},
  runGeneratorAudit(){return []},
  console
};
vm.createContext(state);
vm.runInContext(patch,state,{filename:"tavern-all-day-patch"});
const periods=["breakfast","lunch","dinner"],inn=meal.venues.inn,tavern=meal.venues.tavern;
let count=0;
for(const period of periods)(tavern[period]||[]).forEach((m,i)=>{
  const reference=inn[period][i].price;
  assert(m.price>=reference*1.1-1e-9&&m.price<=reference*1.2+1e-9,period+"/"+m.name+" premium");
  assert.equal(m.price,Math.floor(m.price),"silver integer price");
  assert.equal(m.inn_reference_price,reference);
  count++;
});
assert.equal(count,9);
for(const [hour,minute] of [[0,0],[3,10],[10,45],[14,45],[22,30],[23,59]]){
  state.G.worldTime={hour,minute};
  state.openMealService("tavern");
  assert(view.title.includes("全天供餐"),hour+":"+minute+" title");
  for(const period of periods)for(const m of tavern[period])assert(view.body.includes(m.name),hour+":"+minute+" missing "+m.name);
}
const money=state.G.character.moneySilver,first=tavern.breakfast[0];
state.eatFacilityMeal("tavern","breakfast",first.id);
assert.equal(state.G.character.moneySilver,money-first.price);
assert.equal(state.G.character.hunger,80-first.hunger);
assert.equal(state.G.character.thirst,40-first.thirst);
assert.equal(state.G.character.fatigue,30-first.fatigue);
assert(events.includes("end:0.5"));
const turns=events.filter(x=>x.startsWith("begin:")).length;
state.G.character.moneySilver=first.price-1;
state.eatFacilityMeal("tavern","breakfast",first.id);
assert.equal(events.filter(x=>x.startsWith("begin:")).length,turns,"insufficient money should not consume turn");
assert.equal(state.openMealService("inn"),"inn","inn UI should delegate unchanged");
assert.equal(state.eatFacilityMeal("inn","breakfast","MEAL-I-B-01"),"inn","inn meal should delegate unchanged");
assert.deepEqual(Array.from(state.runGeneratorAudit()),[]);
console.log("tavern all-day meals OK: 9 premium prices; 6 off-hour visits; payment, recovery and inn delegation");
