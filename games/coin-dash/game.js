import { Game } from "../../framework/game.js";
import { Input } from "../../framework/input.js";
import { AudioManager } from "../../framework/audio.js";
import { rectanglesOverlap } from "../../framework/collision.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = new Input();
const audio = new AudioManager();
const engine = new Game(canvas);
const $ = id => document.getElementById(id);
const BEST_KEY = "coin-dash-best-score-v1";
let state;

function reset() {
  state = {
    started: false, over: false, score: 0, coins: 0, lives: 3, level: 1,
    combo: 0, best: Number(localStorage.getItem(BEST_KEY) || 0),
    player: { x: 375, y: 420, w: 50, h: 32, speed: 360 },
    coin: { x: 250, y: 120, r: 13 },
    enemies: [], spawn: 0, roadOffset: 0, shake: 0, particles: [],
    invulnerable: 0, flash: 0, coinPulse: 0
  };
  for (let i = 0; i < 2; i++) spawnEnemy(i * 180);
  updateHUD();
}

function rand(a, b) { return Math.random() * (b - a) + a; }

function spawnEnemy(offset = 0) {
  const lane = [195, 325, 455, 585][Math.floor(Math.random() * 4)];
  state.enemies.push({
    x: lane, y: -80 - offset, w: 48, h: 70,
    speed: rand(180, 245) + state.level * 12,
    type: Math.random() < .25 ? "truck" : "car"
  });
}

function updateHUD() {
  $("score").textContent = `النقاط: ${Math.floor(state.score)}`;
  $("coins").textContent = `🪙 ${state.coins}`;
  $("lives").textContent = "❤️".repeat(state.lives) + "🖤".repeat(3 - state.lives);
  $("level").textContent = `المستوى: ${state.level}`;
  $("combo").textContent = state.combo > 1 ? `🔥 كومبو ×${state.combo}` : "🔥 كومبو ×1";
  $("best").textContent = `🏆 الأفضل: ${Math.max(state.best, Math.floor(state.score))}`;
}

function particle(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x, y, vx: rand(-120, 120), vy: rand(-150, 20),
      life: rand(.3, .65), size: rand(2, 5)
    });
  }
}

function collectCoin() {
  state.coins++;
  state.combo = Math.min(10, state.combo + 1);
  state.score += Math.round(100 * (1 + state.combo * .1));
  state.coin.x = rand(175, 625);
  state.coin.y = rand(80, 320);
  state.coinPulse = .35;
  particle(state.coin.x, state.coin.y, 14);
  audio.beep(620 + state.combo * 20, .06, "sine");
}

function endGame() {
  state.over = true;
  state.started = false;
  state.best = Math.max(state.best, Math.floor(state.score));
  localStorage.setItem(BEST_KEY, String(state.best));
  $("finalScore").textContent = `النتيجة: ${Math.floor(state.score)} • العملات: ${state.coins}`;
  $("finalBest").textContent = `🏆 أفضل نتيجة: ${state.best}`;
  $("gameOver").classList.remove("hidden");
  audio.beep(110, .25, "sawtooth", .04);
  updateHUD();
}

function hit() {
  if (state.invulnerable > 0) return;
  state.lives--;
  state.combo = 0;
  state.invulnerable = 1.15;
  state.shake = .28;
  state.flash = .22;
  particle(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, 18);
  audio.beep(90, .12, "square", .04);
  if (state.lives <= 0) endGame();
}

engine.update = function(dt) {
  if (!state.started || state.over) return;

  const p = state.player;
  if (input.left()) p.x -= p.speed * dt;
  if (input.right()) p.x += p.speed * dt;
  p.x = Math.max(155, Math.min(645 - p.w, p.x));

  state.roadOffset = (state.roadOffset + 220 * dt) % 80;
  state.spawn -= dt;
  if (state.spawn <= 0) {
    spawnEnemy();
    state.spawn = Math.max(.42, 1.1 - state.level * .035);
  }

  for (const e of state.enemies) e.y += e.speed * dt;
  state.enemies = state.enemies.filter(e => e.y < 550);

  const coinBox = {
    x: state.coin.x - state.coin.r,
    y: state.coin.y - state.coin.r,
    w: state.coin.r * 2,
    h: state.coin.r * 2
  };
  if (rectanglesOverlap(p, coinBox)) collectCoin();

  for (const e of state.enemies) {
    if (rectanglesOverlap(p, e)) {
      e.y = 650;
      hit();
      break;
    }
  }

  state.level = 1 + Math.floor(state.coins / 5);
  state.score += dt * (10 + state.level * 2);
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  state.shake = Math.max(0, state.shake - dt);
  state.flash = Math.max(0, state.flash - dt);
  state.coinPulse = Math.max(0, state.coinPulse - dt);

  for (const q of state.particles) {
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.vy += 280 * dt;
    q.life -= dt;
  }
  state.particles = state.particles.filter(q => q.life > 0);
  updateHUD();
};

function drawCar(x, y, w, h, player = false, blink = false) {
  if (blink && Math.floor(state.invulnerable * 14) % 2 === 0) return;
  ctx.fillStyle = player ? "#38bdf8" : "#ef4444";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = player ? "#e0f2fe" : "#bae6fd";
  ctx.fillRect(x + 7, y + 10, w - 14, 16);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x + 5, y + h - 7, 10, 5);
  ctx.fillRect(x + w - 15, y + h - 7, 10, 5);
  if (player) {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(x + 5, y + 3, 10, 4);
    ctx.fillRect(x + w - 15, y + 3, 10, 4);
  }
}

engine.render = function() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const sx = W / 800, sy = H / 500;
  ctx.setTransform(sx, 0, 0, sy, 0, 0);
  ctx.clearRect(0, 0, 800, 500);

  let offsetX = 0, offsetY = 0;
  if (state.shake > 0) {
    offsetX = rand(-5, 5) * state.shake / .28;
    offsetY = rand(-4, 4) * state.shake / .28;
  }
  ctx.save();
  ctx.translate(offsetX, offsetY);

  const bg = ctx.createLinearGradient(0, 0, 0, 500);
  bg.addColorStop(0, "#0b1222");
  bg.addColorStop(1, "#172033");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 800, 500);

  ctx.fillStyle = "#334155";
  ctx.fillRect(140, 0, 520, 500);
  ctx.fillStyle = "#111827";
  ctx.fillRect(150, 0, 500, 500);

  ctx.fillStyle = "#475569";
  ctx.fillRect(150, 0, 7, 500);
  ctx.fillRect(643, 0, 7, 500);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 5;
  ctx.setLineDash([28, 28]);
  ctx.lineDashOffset = -state.roadOffset;
  ctx.beginPath();
  ctx.moveTo(300, 0); ctx.lineTo(300, 500);
  ctx.moveTo(500, 0); ctx.lineTo(500, 500);
  ctx.stroke();
  ctx.setLineDash([]);

  const coinScale = 1 + Math.sin(state.coinPulse * 18) * .15;
  ctx.save();
  ctx.translate(state.coin.x, state.coin.y);
  ctx.scale(coinScale, coinScale);
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  for (const e of state.enemies) drawCar(e.x, e.y, e.w, e.h, false);
  drawCar(state.player.x, state.player.y, state.player.w, state.player.h, true, state.invulnerable > 0);

  for (const q of state.particles) {
    ctx.globalAlpha = Math.max(0, q.life / .65);
    ctx.fillStyle = "#fde047";
    ctx.fillRect(q.x, q.y, q.size, q.size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(248,113,113,${state.flash / .22 * .18})`;
    ctx.fillRect(0, 0, 800, 500);
  }
};

function start() {
  audio.unlock();
  state.started = true;
  state.over = false;
  $("startScreen").classList.add("hidden");
  $("pauseScreen").classList.add("hidden");
}

$("startBtn").onclick = start;
$("restart").onclick = () => { reset(); start(); };
$("resumeBtn").onclick = () => { state.started = true; $("pauseScreen").classList.add("hidden"); };
$("pauseBtn").onclick = () => {
  if (!state.started || state.over) return;
  state.started = false;
  $("pauseScreen").classList.remove("hidden");
};

let swipeStartX = null;
let swipeStartY = null;
let activePointerId = null;
const SWIPE_THRESHOLD = 24;

function clearSwipe() {
  swipeStartX = null;
  swipeStartY = null;
  activePointerId = null;
  input.clearTouch();
}

canvas.addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  activePointerId = e.pointerId;
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
  canvas.setPointerCapture?.(e.pointerId);
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("pointermove", e => {
  if (activePointerId !== e.pointerId || swipeStartX === null || swipeStartY === null) return;
  const dx = e.clientX - swipeStartX;
  const dy = e.clientY - swipeStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
  input.clearTouch();
  if (Math.abs(dx) >= Math.abs(dy)) input.setTouch(dx < 0 ? "left" : "right", true);
  else input.setTouch(dy < 0 ? "up" : "down", true);
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("pointerup", e => { if (activePointerId === e.pointerId) clearSwipe(); });
canvas.addEventListener("pointercancel", e => { if (activePointerId === e.pointerId) clearSwipe(); });
canvas.addEventListener("lostpointercapture", clearSwipe);
window.addEventListener("blur", clearSwipe);

reset();
engine.start();
