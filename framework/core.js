export const GAME_STATES = Object.freeze({
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WON: 'won',
  GAME_OVER: 'game-over'
});

export class GameEngine {
  constructor({ canvas, input = null, systems = {}, hooks = {} } = {}) {
    if (!canvas) throw new Error('GameEngine requires a canvas.');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('2D canvas context is unavailable.');
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
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.hooks.resize?.(this.width, this.height, this);
  }

  _resetRoundData() {
    this.score = 0;
    this.lives = 0;
    this.level = 1;
    this.combo = 0;
    this.elapsed = 0;
  }

  start() {
    if (this.state === GAME_STATES.PAUSED) {
      this.resume();
      return;
    }
    if (this.state === GAME_STATES.PLAYING) return;

    // START / GAME_OVER / WON always begin a clean round.
    this._resetRoundData();
    this.hooks.reset?.(this);
    this.state = GAME_STATES.PLAYING;
    this.running = true;
    this.lastTime = performance.now();
    this.hooks.start?.(this);

    if (!this._raf) {
      this._raf = requestAnimationFrame(t => this.loop(t));
    }
  }

  pause() {
    if (!this.running || this.state !== GAME_STATES.PLAYING) return;
    this.state = GAME_STATES.PAUSED;
    this.input?.clear?.();
    this.hooks.pause?.(this);
  }

  resume() {
    if (!this.running || this.state !== GAME_STATES.PAUSED) return;
    this.state = GAME_STATES.PLAYING;
    this.lastTime = performance.now();
    this.hooks.resume?.(this);
  }

  restart() {
    this._resetRoundData();
    this.state = GAME_STATES.START;
    this.running = true;
    this.input?.clear?.();
    this.hooks.reset?.(this);
    this.hooks.restart?.(this);
    this.render();
    if (!this._raf) {
      this.lastTime = performance.now();
      this._raf = requestAnimationFrame(t => this.loop(t));
    }
  }

  addScore(amount = 1) {
    const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    this.score = Math.max(0, this.score + safeAmount);
    this.bestScore = Math.max(this.bestScore, this.score);
    this.hooks.score?.(this.score, safeAmount, this);
  }

  setLives(value) {
    this.lives = Math.max(0, Math.floor(Number(value) || 0));
  }

  loseLife(amount = 1) {
    const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
    this.lives = Math.max(0, this.lives - safeAmount);
    this.hooks.lifeLost?.(this.lives, this);
    if (this.lives === 0) this.gameOver();
  }

  win() {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.state = GAME_STATES.WON;
    this.input?.clear?.();
    this.hooks.win?.(this);
  }

  gameOver() {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.state = GAME_STATES.GAME_OVER;
    this.input?.clear?.();
    this.hooks.gameOver?.(this);
  }

  loop(time) {
    if (!this.running) {
      this._raf = 0;
      return;
    }

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
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    window.removeEventListener('resize', this._resize);
    this.input?.clear?.();
  }
}
