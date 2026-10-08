export class AudioManager {
  constructor() { this.enabled = true; this.ctx = null; }
  enable(value) { this.enabled = Boolean(value); }
  beep({ frequency = 440, duration = .08, type = 'sine', volume = .035 } = {}) {
    if (!this.enabled) return;
    try {
      this.ctx ||= new AudioContext();
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = type; osc.frequency.value = frequency; gain.gain.value = volume;
      osc.connect(gain).connect(this.ctx.destination); osc.start();
      gain.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }
}
