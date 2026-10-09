/* Engine Test entry point. Dynamic imports intentionally keep startup failures visible. */
const root = document.querySelector('#game-root');

function showBootError(error) {
  window.__ENGINE_TEST_FAILED__ = true;
  window.__ENGINE_TEST_ERROR__ = {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack || ''
  };
  const panel = document.createElement('section');
  panel.style.cssText = 'max-width:900px;margin:24px auto;padding:20px;border:1px solid #ef4444;border-radius:14px;background:#250d17;color:#ffe4e6;font:14px/1.6 system-ui;direction:ltr;overflow-wrap:anywhere';
  const title = document.createElement('h2');
  title.textContent = 'Engine Test failed to start';
  const message = document.createElement('p');
  message.textContent = `${window.__ENGINE_TEST_ERROR__.name}: ${window.__ENGINE_TEST_ERROR__.message}`;
  const details = document.createElement('pre');
  details.textContent = window.__ENGINE_TEST_ERROR__.stack;
  details.style.cssText = 'white-space:pre-wrap;font-size:12px;max-height:45vh;overflow:auto';
  panel.append(title, message, details);
  if (root) root.replaceChildren(panel);
  else document.body.append(panel);
}

async function boot() {
  try {
    const [core, inputModule, saveModule, particleModule, shakeModule, collision, shell, infra] = await Promise.all([
      import('../../framework/core.js'),
      import('../../framework/input.js'),
      import('../../framework/save.js'),
      import('../../framework/particles.js'),
      import('../../framework/screen-shake.js'),
      import('../../framework/collision.js'),
      import('../../ui/game-shell.js'),
      import('../../framework/index.js')
    ]);

    const { GameEngine, GAME_STATES, clamp } = core;
    const { Input } = inputModule;
    const { SaveStore } = saveModule;
    const { Particles } = particleModule;
    const { ScreenShake } = shakeModule;
    const { hit } = collision;
    const { mountGameShell, syncShell, bindShell } = shell;
    const { EventBus, TimerManager, DebugMetrics, ErrorReporter } = infra;

    const ui = mountGameShell(root, {
      title: 'Engine Test Lab',
      tagline: 'INTERNAL FOUNDATION TEST',
      controls: 'الأسهم / WASD / الماوس / اللمس • اجمع الأهداف وتجنب الحواجز • اختبر الإيقاف وإعادة اللعب والصوت والحفظ',
      theme: '#60a5fa',
      labels: { extra: 'الاختبار' }
    });
    const events = new EventBus();
    const timers = new TimerManager();
    const metrics = new DebugMetrics();
    const errors = new ErrorReporter();
    const input = new Input();
    input.attach(ui.canvas);
    const save = new SaveStore('engine-test');
    const particles = new Particles();
    const shake = new ScreenShake();
    const player = { x: 470, y: 440, w: 28, h: 28 };
    let coin = { x: 280, y: 180, r: 12 };
    const wall = { x: 660, y: 360, w: 40, h: 110 };
    let invulnerable = 0;

    function reset(engine) {
      player.x = 470;
      player.y = 440;
      coin = { x: 280 + Math.random() * 400, y: 130 + Math.random() * 280, r: 12 };
      wall.x = 620 + Math.random() * 160;
      invulnerable = 0;
      particles.clear();
      engine.setLives(3);
    }

    const engine = new GameEngine({
      canvas: ui.canvas,
      input,
      config: { lives: 3, levelEvery: 250 },
      audio: ui.audio,
      particles,
      shake,
      save,
      events,
      timers,
      metrics,
      hooks: {
        reset,
        update(dt, currentEngine) {
          const v = input.vector();
          player.x = clamp(player.x + v.x * 310 * dt, 30, 902);
          player.y = clamp(player.y + v.y * 310 * dt, 30, 482);
          if (input.pointer.active && !input.down('w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright')) {
            player.x += (input.pointer.x - (player.x + 14)) * Math.min(1, dt * 6);
            player.y += (input.pointer.y - (player.y + 14)) * Math.min(1, dt * 6);
          }
          invulnerable = Math.max(0, invulnerable - dt);
          if (Math.hypot(player.x + 14 - coin.x, player.y + 14 - coin.y) < 25) {
            currentEngine.addScore(50);
            ui.audio.coin();
            particles.burst(coin.x, coin.y, 16, { color: '#ffd34d' });
            coin.x = 80 + Math.random() * 800;
            coin.y = 80 + Math.random() * 340;
          }
          if (hit(player, wall, 4) && invulnerable <= 0) {
            invulnerable = 0.9;
            currentEngine.loseLife();
            ui.audio.hit();
            shake.trigger(8, 0.18);
          }
          syncShell(ui, currentEngine, `best ${Math.floor(currentEngine.bestScore)}`);
        },
        draw(ctx, currentEngine) {
          ctx.fillStyle = '#07111f';
          ctx.fillRect(0, 0, 960, 540);
          ctx.strokeStyle = '#17385a';
          for (let x = 20; x < 960; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 540); ctx.stroke();
          }
          for (let y = 20; y < 540; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke();
          }
          ctx.fillStyle = '#ffd34d';
          ctx.beginPath(); ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
          ctx.fillStyle = invulnerable > 0 ? '#ffffff' : '#60a5fa';
          ctx.fillRect(player.x, player.y, player.w, player.h);
          particles.draw(ctx);
          if (currentEngine.state !== GAME_STATES.PLAYING) {
            ctx.fillStyle = 'rgba(1,7,16,.72)';
            ctx.fillRect(0, 0, 960, 540);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '900 38px system-ui';
            ctx.fillText(currentEngine.state === GAME_STATES.START ? 'ENGINE TEST LAB' : currentEngine.state.toUpperCase(), 480, 250);
            ctx.font = '16px system-ui';
            ctx.fillText('اختبار المحرك الداخلي', 480, 282);
            ctx.textAlign = 'start';
          }
        }
      }
    });

    bindShell(ui, engine);
    engine.render();
    // Expose a test-only debug handle for automated Engine Test checks.
    window.__ENGINE_TEST__ = { engine, input, ui, events, timers, metrics, errors };
    window.__ENGINE_TEST_READY__ = true;
    window.__ENGINE_INFRA_READY__ = { events: !!events, timers: !!timers, metrics: !!metrics, errorReporter: !!errors };
  } catch (error) {
    showBootError(error);
  }
}

boot();
