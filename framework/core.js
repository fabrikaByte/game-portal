export const GAME_STATES = Object.freeze({ START: 'start', PLAYING: 'playing', PAUSED: 'paused', WON: 'won', GAME_OVER: 'game-over' });

export class GameEngine {
  constructor({ canvas, input = null, systems = {}, hooks = {} } = {}) {
    if (!canvas) throw new Error('GameEngine requires a canvas.');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.state = GAME_STATES.START;
    this.running = false;
    this.lastTime = 0;
    this.elapsed = 0;
    this.score = 0;
    this.bestScore = 0;
    this.lives = 0;
    this.level = 1;
    this.combo = 0;
    this.hooks = hooks;
    this.systems = systems;
    this._raf = 0;
    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.hooks.resize?.(this.width, this.height);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.state = GAME_STATES.PLAYING;
    this.lastTime = performance.now();
    this.hooks.start?.(this);
    this._raf = requestAnimationFrame(t => this.loop(t));
  }

  pause() {
    if (!this.running || this.state !== GAME_STATES.PLAYING) return;
    this.state = GAME_STATES.PAUSED;
    this.hooks.pause?.(this);
  }

  resume() {
    if (!this.running || this.state !== GAME_STATES.PAUSED) return;
    this.state = GAME_STATES.PLAYING;
    this.lastTime = performance.now();
    this.hooks.resume?.(this);
  }

  restart() {
    this.score = 0;
    this.lives = 0;
    this.level = 1;
    this.combo = 0;
    this.elapsed = 0;
    this.state = GAME_STATES.START;
    this.hooks.reset?.(this);
  }

  addScore(amount = 1) {
    this.score += amount;
    this.bestScore = Math.max(this.bestScore, this.score);
    this.hooks.score?.(this.score, amount, this);
  }

  setLives(value) { this.lives = Math.max(0, Math.floor(value)); }
  loseLife(amount = 1) {
    this.lives = Math.max(0, this.lives - amount);
    this.hooks.lifeLost?.(this.lives, this);
    if (this.lives === 0) this.gameOver();
  }
  win() { if (this.state === GAME_STATES.PLAYING) { this.state = GAME_STATES.WON; this.hooks.win?.(this); } }
  gameOver() { if (this.state === GAME_STATES.PLAYING) { this.state = GAME_STATES.GAME_OVER; this.hooks.gameOver?.(this); } }

  loop(time) {
    if (!this.running) return;
    const dt = Math.min(Math.max((time - this.lastTime) / 1000, 0), 0.05);
    this.lastTime = time;
    if (this.state === GAME_STATES.PLAYING) {
      this.elapsed += dt;
      this.hooks.update?.(dt, this);
      this.systems.particles?.update?.(dt);
    }
    this.render();
    this._raf = requestAnimationFrame(t => this.loop(t));
  }

  render() {
    this.hooks.draw?.(this.ctx, this);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._resize);
  }
}
