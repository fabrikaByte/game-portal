/** Shared keyboard + touch/swipe + mouse pointer input. */
export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.touch = { left: false, right: false, up: false, down: false };
    this.mouse = { active: false, x: 0, y: 0, down: false };
    this.target = target;
    this.touchPointerId = null;
    this.touchStart = { x: 0, y: 0 };
    this.touchThreshold = 18;
    this.touchPulseMs = 140;
    this.touchPulseTimer = null;

    this.onKeyDown = (e) => {
      const key = String(e.key || '').toLowerCase();
      const code = String(e.code || '').toLowerCase();
      this.keys.add(key); this.keys.add(code);
      if (this.isGameControlEvent(key, code)) e.preventDefault();
    };
    this.onKeyUp = (e) => {
      const key = String(e.key || '').toLowerCase();
      const code = String(e.code || '').toLowerCase();
      this.keys.delete(key); this.keys.delete(code);
    };
    this.onBlur = () => this.clear();
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('blur', this.onBlur);
    this.onVisibility = () => { if (document.hidden) this.clear(); };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  attachPointer(element, { mouse = true, touch = true } = {}) {
    if (!element) return;
    element.style.touchAction = 'none';
    this.pointerElement = element;

    this.onPointerDown = (e) => {
      if (e.pointerType === 'mouse') {
        if (!mouse || e.button !== 0) return;
        this.mouse.down = true;
        this.updateMouse(e);
        return;
      }
      if (!touch) return;
      this.touchPointerId = e.pointerId;
      this.touchStart.x = e.clientX;
      this.touchStart.y = e.clientY;
      this.clearTouch();
      try { element.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    };

    this.onPointerMove = (e) => {
      if (e.pointerType === 'mouse') {
        if (!mouse) return;
        this.updateMouse(e);
        return;
      }
      if (e.pointerId !== this.touchPointerId) return;
      const dx = e.clientX - this.touchStart.x;
      const dy = e.clientY - this.touchStart.y;
      if (Math.hypot(dx, dy) < this.touchThreshold) return;
      this.clearTouch();
      if (Math.abs(dx) >= Math.abs(dy)) this.pulse(dx > 0 ? 'right' : 'left');
      else this.pulse(dy > 0 ? 'down' : 'up');
      this.touchStart.x = e.clientX; this.touchStart.y = e.clientY;
      e.preventDefault();
    };

    this.onPointerUp = (e) => {
      if (e.pointerType === 'mouse') { this.mouse.down = false; return; }
      if (e.pointerId !== this.touchPointerId) return;
      this.touchPointerId = null;
      e.preventDefault();
    };
    this.onPointerCancel = (e) => {
      if (e.pointerType === 'mouse') { this.mouse.down = false; return; }
      if (e.pointerId === this.touchPointerId) this.touchPointerId = null;
    };

    element.addEventListener('pointerdown', this.onPointerDown, { passive: false });
    element.addEventListener('pointermove', this.onPointerMove, { passive: false });
    element.addEventListener('pointerup', this.onPointerUp, { passive: false });
    element.addEventListener('pointercancel', this.onPointerCancel, { passive: false });
    element.addEventListener('lostpointercapture', () => { this.touchPointerId = null; });
  }

  attachTouch(element) { this.attachPointer(element, { mouse: false, touch: true }); }

  updateMouse(e) {
    if (!this.pointerElement) return;
    const rect = this.pointerElement.getBoundingClientRect();
    this.mouse.x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.mouse.y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    this.mouse.active = true;
  }

  mousePosition() { return this.mouse.active ? { x: this.mouse.x, y: this.mouse.y } : null; }
  isMouseDown() { return this.mouse.down; }

  pulse(direction) {
    this.clearTouch(); this.setTouch(direction, true);
    clearTimeout(this.touchPulseTimer);
    this.touchPulseTimer = setTimeout(() => this.clearTouch(), this.touchPulseMs);
  }

  isGameControlEvent(key, code) {
    return [
      'arrowleft','arrowright','arrowup','arrowdown','space','a','d','w','s','ص','ش','س','ي','p','ح','r','enter'
    ].includes(key) || [
      'keya','keyd','keyw','keys','arrowleft','arrowright','arrowup','arrowdown','space','keyp','keyr','enter'
    ].includes(code);
  }

  isDown(...keys) { return keys.some(k => this.keys.has(String(k).toLowerCase())); }
  setTouch(direction, value) { if (direction in this.touch) this.touch[direction] = Boolean(value); }
  clearTouch() { for (const direction of Object.keys(this.touch)) this.touch[direction] = false; }
  clear() { this.keys.clear(); this.clearTouch(); this.touchPointerId = null; this.mouse.down = false; clearTimeout(this.touchPulseTimer); this.touchPulseTimer = null; }
  left() { return this.isDown('arrowleft','keya','a','ش') || this.touch.left; }
  right() { return this.isDown('arrowright','keyd','d','ي') || this.touch.right; }
  up() { return this.isDown('arrowup','keyw','w','ص') || this.touch.up; }
  down() { return this.isDown('arrowdown','keys','s','س') || this.touch.down; }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibility);
    clearTimeout(this.touchPulseTimer);
    this.pointerElement?.removeEventListener('pointerdown', this.onPointerDown);
    this.pointerElement?.removeEventListener('pointermove', this.onPointerMove);
    this.pointerElement?.removeEventListener('pointerup', this.onPointerUp);
    this.pointerElement?.removeEventListener('pointercancel', this.onPointerCancel);
    this.clear();
  }
}
