import { GameEngine, GAME_STATES } from '../../framework/core.js';
import { Input } from '../../framework/input.js';
import { mountGameTemplate } from '../../framework/game-template.js';

const ui = mountGameTemplate(document.querySelector('#game-root'), {
  title: 'NEW 2D GAME',
  version: 'FOUNDATION ENGINE',
  instructions: 'وصف مختصر لطريقة اللعب.'
});

const input = new Input();
const canvas = ui.canvas;

// Add the new game's world objects and hooks here.
const engine = new GameEngine({ canvas, input, hooks: {
  reset(e) { /* reset game objects */ },
  update(dt, e) { /* game logic */ },
  draw(ctx, e) {
    ctx.clearRect(0, 0, e.width, e.height);
    ctx.fillStyle = '#102d4d';
    ctx.fillRect(0, 0, e.width, e.height);
  }
}});

function begin() {
  if ([GAME_STATES.START, GAME_STATES.GAME_OVER, GAME_STATES.WON].includes(engine.state)) engine.start();
}

ui.startBtn.addEventListener('click', begin);
ui.restartBtn.addEventListener('click', () => engine.restart());
ui.pauseBtn.addEventListener('click', () => {
  if (engine.state === GAME_STATES.PLAYING) engine.pause();
  else if (engine.state === GAME_STATES.PAUSED) engine.resume();
});
canvas.addEventListener('pointerdown', begin);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') begin();
  if (e.key.toLowerCase() === 'r') engine.restart();
  if (e.code === 'Space') {
    e.preventDefault();
    if (engine.state === GAME_STATES.PLAYING) engine.pause();
    else if (engine.state === GAME_STATES.PAUSED) engine.resume();
  }
});

engine.render();
