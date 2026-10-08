/** Shared responsive game shell. */
import { AudioManager } from './audio.js';

export function mountGameTemplate(root, {
  title = '2D GAME', version = 'FOUNDATION ENGINE', backHref = '../../index.html', labels = {},
  instructions = 'التحكم: الأسهم / WASD — اسحب على اللعبة للتحرك. اجمع الدائرة وتجنب الحاجز.'
} = {}) {
  if (!root) throw new Error('Game template root is required.');
  const text = { back:'← العودة',score:'النتيجة',lives:'الأرواح',best:'الأفضل',level:'المستوى',state:'الحالة',start:'ابدأ اللعبة',pause:'إيقاف مؤقت',resume:'متابعة',restart:'إعادة اللعب',ready:'جاهز',soundOn:'الصوت',soundOff:'كتم',...labels };
  root.innerHTML = `
    <div class="game-shell">
      <header class="game-topbar">
        <a class="game-back" href="${backHref}">${text.back}</a>
        <div class="game-title-wrap"><span class="game-kicker">${version}</span><h1>${title}</h1></div>
        <span class="game-status" id="status">${text.ready}</span>
      </header>
      <section class="game-hud" aria-label="Game status">
        <div class="hud-card"><span>${text.score}</span><strong id="score">0</strong></div>
        <div class="hud-card"><span>${text.lives}</span><strong id="lives">3</strong></div>
        <div class="hud-card"><span>${text.best}</span><strong id="best">0</strong></div>
        <div class="hud-card"><span>${text.level}</span><strong id="level">1</strong></div>
        <div class="hud-card hud-state"><span>${text.state}</span><strong id="state">START</strong></div>
      </section>
      <section class="game-stage">
        <div class="canvas-wrap"><canvas id="game" aria-label="${title}"></canvas></div>
        <div class="game-actions" aria-label="Game actions">
          <button type="button" id="startBtn">${text.start}</button>
          <button type="button" id="pauseBtn">${text.pause}</button>
          <button type="button" id="restartBtn">${text.restart}</button>
          <button type="button" id="muteBtn" aria-pressed="false">${text.soundOn}</button>
        </div>
      </section>
      <p class="game-instructions" id="instructions">${instructions}</p>
    </div>`;

  const audio = new AudioManager();
  const muteBtn = root.querySelector('#muteBtn');
  const syncAudio = () => { muteBtn.textContent = audio.enabled ? text.soundOn : text.soundOff; muteBtn.setAttribute('aria-pressed', String(!audio.enabled)); };
  muteBtn.addEventListener('click', () => { audio.toggle(); syncAudio(); audio.unlock(); });
  syncAudio();
  return { root, canvas:root.querySelector('#game'),status:root.querySelector('#status'),score:root.querySelector('#score'),lives:root.querySelector('#lives'),best:root.querySelector('#best'),level:root.querySelector('#level'),state:root.querySelector('#state'),startBtn:root.querySelector('#startBtn'),pauseBtn:root.querySelector('#pauseBtn'),restartBtn:root.querySelector('#restartBtn'),muteBtn,instructions:root.querySelector('#instructions'),audio };
}
