import assert from 'node:assert/strict';
import { Input } from '../framework/input.js';

const windowHandlers = new Map();
const documentHandlers = new Map();
globalThis.window = {
  addEventListener: (name, fn) => windowHandlers.set(name, fn),
  removeEventListener: name => windowHandlers.delete(name),
};
globalThis.document = {
  hidden: false,
  addEventListener: (name, fn) => documentHandlers.set(name, fn),
  removeEventListener: name => documentHandlers.delete(name),
};
const canvasHandlers = new Map();
const canvas = {
  style: {},
  getBoundingClientRect: () => ({ left: 100, top: 50, width: 500, height: 360, right: 600, bottom: 410 }),
  addEventListener: (name, fn) => canvasHandlers.set(name, fn),
  removeEventListener: name => canvasHandlers.delete(name),
  setPointerCapture: () => {},
};
const input = new Input();
input.attach(canvas);
input.setLogicalSize(960, 540);
const scale = Math.min(500 / 960, 360 / 540);
input.setViewport({ scale, offsetX: (500 - 960 * scale) / 2, offsetY: (360 - 540 * scale) / 2 });
canvasHandlers.get('pointerdown')({clientX:350,clientY:230,pointerType:'mouse',button:0,pointerId:1});
assert(Math.abs(input.pointer.x - 480) < 1e-9 && Math.abs(input.pointer.y - 270) < 1e-9, 'letterboxed pointer maps to logical center');
assert.equal(input.pointer.down, true);
canvasHandlers.get('pointerleave')({pointerType:'mouse',buttons:0});
assert.equal(input.pointer.active, false, 'pointer leaving canvas stops stale mouse-follow movement');
input._kd({key:'d',code:'KeyD',preventDefault(){}});
assert.equal(input.pressed('d'), true);
assert.equal(input.vector().x, 1);
input.endFrame();
assert.equal(input.pressed('d'), false, 'just-pressed input clears at end of frame');
assert.equal(input.down('d'), true, 'held key remains down after just-pressed reset');
input.clear();
assert.deepEqual(input.vector(), {x:0,y:0});
input.keys.add('d'); input.just.add('d'); windowHandlers.get('blur')();
assert.equal(input.down('d'), false, 'blur clears held controls');
input.keys.add('d'); document.hidden=true; documentHandlers.get('visibilitychange')();
assert.equal(input.down('d'), false, 'hidden tab clears held controls'); document.hidden=false;
input.destroy();
console.log('INPUT_REGRESSION_TESTS=PASS');
