import assert from 'node:assert/strict';
import { GameEngine, GAME_STATES, clamp } from '../framework/core.js';
import { Input } from '../framework/input.js';
import { hit, circle, pointInRect } from '../framework/collision.js';
import { Body2D, moveAndCollide } from '../framework/physics-2d.js';

const listeners = new Map();
globalThis.window = { devicePixelRatio:1, addEventListener:(k,f)=>listeners.set(k,f), removeEventListener:(k,f)=>listeners.delete(k) };
globalThis.document = { hidden:false, addEventListener:()=>{} };
globalThis.performance = { now:()=>1000 };
let rafCalls=0; globalThis.requestAnimationFrame = ()=>{rafCalls++;return rafCalls};
globalThis.cancelAnimationFrame = ()=>{};

const ctx = { setTransform(){}, fillRect(){}, save(){}, restore(){}, translate(){}, scale(){} };
const canvas = { width:0,height:0, getContext:()=>ctx, getBoundingClientRect:()=>({width:960,height:540}) };
let scoreEvents=0;
const e = new GameEngine({canvas, config:{lives:2}, hooks:{score:()=>scoreEvents++}});
assert.equal(e.state, GAME_STATES.START);
e.start(); assert.equal(e.state,GAME_STATES.PLAYING);
e.addScore(100); assert.equal(e.score,100); assert.equal(e.bestScore,100); assert.equal(scoreEvents,1);
e.addScore(-200); assert.equal(e.score,0);
e.loseLife(); assert.equal(e.lives,1); e.loseLife(); assert.equal(e.state,GAME_STATES.GAME_OVER);
e.restart(); assert.equal(e.state,GAME_STATES.START); e.start(); e.win(); assert.equal(e.state,GAME_STATES.WON);
assert.equal(clamp(9,0,5),5); assert.equal(clamp(-1,0,5),0);
assert.equal(hit({x:0,y:0,w:10,h:10},{x:5,y:5,w:10,h:10}),true);
assert.equal(circle({x:0,y:0,r:5},{x:7,y:0,r:3}),true);
assert.equal(pointInRect({x:5,y:5},{x:0,y:0,w:10,h:10}),true);

const input = new Input();
input.keys.add('arrowleft'); input.keys.add('s');
const v=input.vector(); assert.ok(Math.abs(v.x+Math.SQRT1_2)<1e-12); assert.ok(Math.abs(v.y-Math.SQRT1_2)<1e-12);
input.clear(); assert.equal(input.vector().x,0); assert.equal(input.vector().y,0);
const fastBody=new Body2D({x:0,y:0,w:10,h:10,gravity:0});fastBody.vx=1_000_000;const thinWall={x:50,y:0,w:1,h:50};const contacts=moveAndCollide(fastBody,[thinWall],0.05);assert.ok(contacts>0&&fastBody.right<=thinWall.x+1e-9);
const floor={x:-100,y:20,w:200,h:10};const grounded=new Body2D({x:0,y:10,w:10,h:10,gravity:0});moveAndCollide(grounded,[floor],.016);assert.equal(grounded.onGround,true);moveAndCollide(grounded,[floor],.016);assert.equal(grounded.onGround,true);
input.setLogicalSize(1920,1080);input.setViewport({scale:2,offsetX:10,offsetY:20});assert.equal(input.logicalWidth,1920);assert.equal(input.logicalHeight,1080);assert.deepEqual(input.viewport,{scale:2,offsetX:10,offsetY:20});
input.destroy(); e.destroy();
console.log('ENGINE_CORE_TESTS=PASS');
