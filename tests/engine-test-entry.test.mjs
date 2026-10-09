import assert from 'node:assert/strict';

const listeners = new Map();
const storage = new Map();
const makeElement = () => ({
  style: {setProperty(){}}, textContent:'', innerText:'', disabled:false, className:'',
  handlers:{}, addEventListener(name,fn){this.handlers[name]=fn;}, removeEventListener(name){delete this.handlers[name];},
  append(){}, replaceChildren(...children){this.children=children;}, setAttribute(){},
});
const ctx = new Proxy({}, {get(target,key){if(!(key in target)) target[key]=()=>{};return target[key];},set(target,key,value){target[key]=value;return true;}});
const canvas = Object.assign(makeElement(), {
  width:0,height:0,
  getContext:()=>ctx,
  getBoundingClientRect:()=>({left:0,top:0,width:960,height:540,right:960,bottom:540}),
  setPointerCapture(){},
});
const nodes = new Map();
for (const id of ['game','status','score','best','level','timer','extra','start','pause','restart','mute']) nodes.set(`#${id}`, id==='game' ? canvas : makeElement());
const root = makeElement();
root._html = '';
Object.defineProperty(root,'innerHTML',{get(){return this._html;},set(value){this._html=value;}});
root.querySelector = selector => nodes.get(selector) || null;
const documentMock = {
  hidden:false,
  querySelector(selector){return selector==='#game-root'?root:null;},
  createElement(){return makeElement();},
  addEventListener(name,fn){listeners.set(`document:${name}`,fn);},
  removeEventListener(name){listeners.delete(`document:${name}`);},
};
const windowMock = {
  devicePixelRatio:1,
  addEventListener(name,fn){listeners.set(`window:${name}`,fn);},
  removeEventListener(name){listeners.delete(`window:${name}`);},
};
globalThis.window=windowMock;
globalThis.document=documentMock;
globalThis.localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,val)=>storage.set(key,String(val)),removeItem:key=>storage.delete(key)};
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};

await import('../games/_engine-test/game.js?integration-test=1');
await new Promise(resolve=>setTimeout(resolve,50));
assert.equal(windowMock.__ENGINE_TEST_READY__,true,`Engine Test bootstrap failed: ${JSON.stringify(windowMock.__ENGINE_TEST_ERROR__)}`);
assert.equal(root._html.includes('class="game-shell"'),true,'Engine Test should mount a visible game shell');
assert.equal(typeof canvas.handlers.pointerdown,'function','Input should attach pointer controls');
assert.equal(typeof nodes.get('#start').handlers.click,'function','Start button should be wired');
assert.equal(typeof nodes.get('#pause').handlers.click,'function','Pause button should be wired');
const testEngine = windowMock.__ENGINE_TEST__.engine;
assert.equal(testEngine.state,'start');
nodes.get('#start').handlers.click();
assert.equal(testEngine.state,'playing','Start button actually starts the engine');
nodes.get('#pause').handlers.click();
assert.equal(testEngine.state,'paused','Pause button actually pauses the engine');
nodes.get('#pause').handlers.click();
assert.equal(testEngine.state,'playing','Pause button toggles back to resume');
nodes.get('#restart').handlers.click();
assert.equal(testEngine.state,'start','Restart button returns to start screen');
testEngine.destroy();
console.log('ENGINE_TEST_ENTRY_INTEGRATION=PASS');
