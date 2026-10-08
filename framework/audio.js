export class AudioManager {
  constructor(storageKey = '2d-games-audio') {
    this.storageKey = storageKey;
    this.enabled = this.readEnabled();
    this.ctx = null;
  }

  readEnabled() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw === null ? true : raw !== '0';
    } catch { return true; }
  }

  saveEnabled() {
    try { localStorage.setItem(this.storageKey, this.enabled ? '1' : '0'); } catch {}
  }

  enable(value, { persist = true } = {}) {
    this.enabled = Boolean(value);
    if (persist) this.saveEnabled();
    return this.enabled;
  }

  toggle() {
    return this.enable(!this.enabled);
  }

  async unlock() {
    if (!this.enabled) return;
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch {}
  }

  beep({ frequency = 440, duration = .08, type = 'sine', volume = .035, slideTo = null } = {}) {
    if (!this.enabled) return;
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      if (Number.isFinite(slideTo)) osc.frequency.linearRampToValueAtTime(slideTo, now + duration);
      gain.gain.setValueAtTime(Math.max(.0001, volume), now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  coin() { this.beep({ frequency: 760, duration: .08, type: 'sine', volume: .045, slideTo: 1100 }); }
  hit() { this.beep({ frequency: 150, duration: .16, type: 'square', volume: .055, slideTo: 75 }); }
  pause() { this.beep({ frequency: 330, duration: .06, type: 'triangle', volume: .025 }); }
  resume() { this.beep({ frequency: 520, duration: .06, type: 'triangle', volume: .025 }); }
  start() { this.beep({ frequency: 520, duration: .06, type: 'sine', volume: .025, slideTo: 680 }); }
}
