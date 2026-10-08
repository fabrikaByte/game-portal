import { GameEngine, GAME_STATES } from '../../framework/core.js';
import { Input } from '../../framework/input.js';
import { rectsOverlap, clamp } from '../../framework/collision.js';
import { Particles } from '../../framework/particles.js';
import { SaveStore } from '../../framework/save.js';
import { mountGameTemplate } from '../../framework/game-template.js';

const ui = mountGameTemplate(document.querySelector('#game-root'), {
  title: 'Foundation Engine Test',
  version: 'Foundation Engine — v1.4',
  instructions: 'التحكم: الأسهم / WASD — حرّك بالماوس أو اسحب على اللعبة. اجمع الدائرة وتجنب الحاجز. Space / P للإيقاف، و R لإعادة الجولة.'
});

const canvas = ui.canvas;
const input = new Input();
const particles = new Particles();
const audio = ui.audio;
const save = new SaveStore('engine-test');
const player = { x: 80, y: 220, width: 34, height: 34, speed: 300 };
const coin = { x: 500, y: 250, size: 18 };
const obstacle = { x: 700, y: 180, width: 45, height: 180, vx: -130 };

function worldScale(engine) { return clamp(engine.width / 900, 0.72, 1.15); }
function syncWorldScale(engine) {
  const s = worldScale(engine);
  player.width = 34 * s; player.height = 34 * s; player.speed = 300 * s;
  coin.size = 18 * s;
  obstacle.width = 45 * s; obstacle.height = 180 * s; obstacle.vx = -130 * s;
}
function resetPlayer(engine) {
  player.x = 80 * worldScale(engine);
  player.y = Math.max(8, engine.height / 2 - player.height / 2);
}
function obstacleHitbox() {
  const insetX = Math.min(6 * worldScale(engineRef), obstacle.width * .18);
  const insetY = Math.min(5 * worldScale(engineRef), obstacle.height * .08);
  return { x: obstacle.x + insetX, y: obstacle.y + insetY, width: Math.max(1, obstacle.width - insetX * 2), height: Math.max(1, obstacle.height - insetY * 2) };
}
let engineRef = null;
let invulnerable = 0;

function randomCoin(engine) {
  coin.x = 80 + Math.random() * Math.max(1, engine.width - 160);
  coin.y = 60 + Math.random() * Math.max(1, engine.height - 120);
}

function resetWorld(engine) {
  syncWorldScale(engine);
  resetPlayer(engine);
  randomCoin(engine);
  obstacle.x = engine.width + 100 * worldScale(engine);
  obstacle.y = 30 + Math.random() * Math.max(1, engine.height - obstacle.height - 60);
  obstacle.vx = -130 * worldScale(engine);
  invulnerable = 0;
  engine.setLives(3);
}

const engine = new GameEngine({
  canvas,
  input,
  systems: { particles },
  hooks: {
    resize(width, height, e) { syncWorldScale(e); },
    reset: resetWorld,

    start: e => {
      ui.state.textContent = e.state.toUpperCase();
    },

    update(dt, e) {
      if (input.isDown('p')) e.pause();

      let dx = (input.right() ? 1 : 0) - (input.left() ? 1 : 0);
      let dy = (input.down() ? 1 : 0) - (input.up() ? 1 : 0);
      const len = Math.hypot(dx, dy) || 1;

      const mouse = input.mousePosition();
      if (mouse) {
        const targetX = mouse.x - player.width / 2;
        const targetY = mouse.y - player.height / 2;
        const maxStep = player.speed * 1.45 * dt;
        const mx = clamp(targetX - player.x, -maxStep, maxStep);
        const my = clamp(targetY - player.y, -maxStep, maxStep);
        player.x += mx; player.y += my;
      } else {
        player.x += (dx / len) * player.speed * dt;
        player.y += (dy / len) * player.speed * dt;
      }
      player.x = clamp(player.x, 0, e.width - player.width);
      player.y = clamp(player.y, 0, e.height - player.height);

      obstacle.x += obstacle.vx * dt;
      if (obstacle.x < -obstacle.width - 10) {
        obstacle.x = e.width + 80 * worldScale(e);
        obstacle.y = 30 + Math.random() * Math.max(1, e.height - obstacle.height - 60);
      }

      if (invulnerable > 0) invulnerable -= dt;

      const c = {
        x: coin.x - coin.size,
        y: coin.y - coin.size,
        width: coin.size * 2,
        height: coin.size * 2
      };

      if (rectsOverlap(player, c)) {
        e.addScore(10);
        particles.burst(coin.x, coin.y, 18);
        audio.coin();
        randomCoin(e);
      }

      const hitbox = obstacleHitbox();
      if (invulnerable <= 0 && rectsOverlap(player, hitbox)) {
        invulnerable = .9;
        e.loseLife();
        audio.hit();
        if (e.state === GAME_STATES.GAME_OVER) return;
        resetPlayer(e);
      }

      e.level = 1 + Math.floor(e.score / 50);
    },

    draw(ctx, e) {
      ctx.clearRect(0, 0, e.width, e.height);

      ctx.fillStyle = '#102d4d';
      ctx.fillRect(0, 0, e.width, e.height);

      ctx.globalAlpha = .12;
      for (let x = 0; x < e.width; x += 40) {
        for (let y = 0; y < e.height; y += 40) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#ffd54a';
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff5964';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      ctx.fillStyle = invulnerable > 0 ? '#9fb7ff' : '#62d7ff';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      particles.draw(ctx);

      if (e.state !== GAME_STATES.PLAYING) {
        ctx.fillStyle = 'rgba(0,0,0,.62)';
        ctx.fillRect(0, 0, e.width, e.height);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '700 34px system-ui';

        const title =
          e.state === GAME_STATES.START ? 'ENGINE TEST READY' :
          e.state === GAME_STATES.PAUSED ? 'PAUSED' :
          e.state === GAME_STATES.GAME_OVER ? 'GAME OVER' :
          'YOU WIN';

        ctx.fillText(title, e.width / 2, e.height / 2 - 10);
        ctx.font = '18px system-ui';
        ctx.fillText(
          e.state === GAME_STATES.PAUSED
            ? 'Space / P to resume'
            : 'Enter or tap to start a new round',
          e.width / 2,
          e.height / 2 + 30
        );
        ctx.textAlign = 'left';
      }

      ui.score.textContent = Math.floor(e.score);
      ui.lives.textContent = e.lives;
      ui.best.textContent = Math.max(e.bestScore, save.get('best', 0));
      ui.level.textContent = e.level;
      ui.state.textContent = e.state.toUpperCase();
      ui.status.textContent = e.state === GAME_STATES.PLAYING ? 'PLAYING' : e.state.toUpperCase();
      ui.pauseBtn.textContent = e.state === GAME_STATES.PAUSED ? 'متابعة' : 'إيقاف مؤقت';
      ui.pauseBtn.disabled = e.state !== GAME_STATES.PLAYING && e.state !== GAME_STATES.PAUSED;
      ui.startBtn.disabled = e.state === GAME_STATES.PLAYING;
    },

    score(s) {
      const best = save.get('best', 0);
      if (s > best) save.set('best', s);
    },

    gameOver(e) {
      save.set('best', Math.max(save.get('best', 0), e.score));
    }
  }
});
engineRef = engine;

input.attachPointer(canvas, { mouse: true, touch: true });

function beginFromInput() {
  if (
    engine.state === GAME_STATES.START ||
    engine.state === GAME_STATES.GAME_OVER ||
    engine.state === GAME_STATES.WON
  ) {
    audio.unlock();
    audio.start();
    engine.start();
  }
}

canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  beginFromInput();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') beginFromInput();

  if (e.key.toLowerCase() === 'r') {
    engine.restart();
  }

  if (e.code === 'Space' || e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'ح') {
    e.preventDefault();
    if (engine.state === GAME_STATES.PAUSED) { audio.resume(); engine.resume(); }
    else if (engine.state === GAME_STATES.PLAYING) { audio.pause(); engine.pause(); }
  }
});

ui.startBtn.addEventListener('click', beginFromInput);
ui.restartBtn.addEventListener('click', () => engine.restart());
ui.pauseBtn.addEventListener('click', () => {
  if (engine.state === GAME_STATES.PLAYING) { audio.pause(); engine.pause(); }
  else if (engine.state === GAME_STATES.PAUSED) { audio.resume(); engine.resume(); }
});

engine.bestScore = save.get('best', 0);
engine.resize();
engine.render();
