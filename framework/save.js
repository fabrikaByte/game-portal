export class SaveStore {
  constructor(namespace = 'game-portal') { this.namespace = namespace; }
  key(name) { return `${this.namespace}:${name}`; }
  get(name, fallback = null) {
    try { const raw = localStorage.getItem(this.key(name)); return raw === null ? fallback : JSON.parse(raw); }
    catch { return fallback; }
  }
  set(name, value) { try { localStorage.setItem(this.key(name), JSON.stringify(value)); } catch {} }
  remove(name) { try { localStorage.removeItem(this.key(name)); } catch {} }
}
