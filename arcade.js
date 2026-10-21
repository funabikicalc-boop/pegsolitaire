// ゲームセンター共通の部品（電飾・確認モーダル・カットイン演出）
// arcade.css とセットで使う
const Arcade = (() => {
  // 金枠の電飾を並べる（角は丸いので各辺の内側だけに置く）
  function buildLights(lightsEl, perSide = 10) {
    const points = [];
    for (let i = 0; i < perSide; i++) points.push([(i + 0.5) / perSide, 0]);
    for (let i = 0; i < perSide; i++) points.push([1, (i + 0.5) / perSide]);
    for (let i = 0; i < perSide; i++) points.push([1 - (i + 0.5) / perSide, 1]);
    for (let i = 0; i < perSide; i++) points.push([0, 1 - (i + 0.5) / perSide]);

    const colors = ['#ff6fb5', '#5ff3ff', '#ffe066'];
    points.forEach(([x, y], i) => {
      const led = document.createElement('i');
      led.className = 'led';
      led.style.left = `calc(6px + (100% - 12px) * ${x})`;
      led.style.top = `calc(6px + (100% - 12px) * ${y})`;
      led.style.setProperty('--d', `${-(i / points.length) * 1.6}s`);
      led.style.setProperty('--led', colors[i % colors.length]);
      lightsEl.appendChild(led);
    });
  }

  // 確認モーダル。OK で onOk を呼ぶ（onOk を渡さなければ OK だけのお知らせ）
  let confirmEl = null;

  function ensureConfirm() {
    if (confirmEl) return confirmEl;
    confirmEl = document.createElement('div');
    confirmEl.className = 'modal-overlay';
    confirmEl.innerHTML = `
      <div class="confirm" role="dialog" aria-modal="true">
        <h2></h2>
        <p></p>
        <div class="confirm-actions">
          <button class="cancel-btn">やめる</button>
          <button class="slot-btn"></button>
        </div>
      </div>`;
    document.body.appendChild(confirmEl);
    confirmEl.querySelector('.cancel-btn').addEventListener('click', closeConfirm);
    confirmEl.addEventListener('click', (e) => {
      if (e.target === confirmEl) closeConfirm();
    });
    return confirmEl;
  }

  function showConfirm({ title, text, okLabel, okColor, onOk }) {
    const modal = ensureConfirm();
    modal.querySelector('h2').textContent = title;
    modal.querySelector('p').textContent = text;
    const okBtn = modal.querySelector('.slot-btn');
    okBtn.textContent = okLabel;
    okBtn.className = `slot-btn ${okColor}`;
    modal.querySelector('.confirm-actions').classList.toggle('single', !onOk);
    modal.classList.add('show');

    okBtn.onclick = () => {
      closeConfirm();
      if (onOk) onOk();
    };
  }

  function closeConfirm() {
    if (confirmEl) confirmEl.classList.remove('show');
  }

  // 画面中央付近（targetEl の中心）にカットインを出す
  function banner(targetEl, title, { sub = '', fever = false } = {}) {
    // 前のカットインが残っていたら消して、文字が重ならないようにする
    document.querySelectorAll('.fx-banner').forEach(el => el.remove());
    const rect = targetEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'fx-banner' + (fever ? ' fever' : '');
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = (rect.top + rect.height / 2) + 'px';
    el.innerHTML = `<div class="burst"></div><div class="fx-text"></div>` + (sub ? `<div class="fx-sub"></div>` : '');
    el.querySelector('.fx-text').textContent = title;
    if (sub) el.querySelector('.fx-sub').textContent = sub;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), fever ? 2000 : 1200);
  }

  // 画面フラッシュと、真珠・金貨を降らせる
  function shower(count = 36) {
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    for (let i = 0; i < count; i++) {
      const pearl = document.createElement('div');
      const size = 8 + Math.random() * 12;
      pearl.className = 'pearl' + (i % 3 === 0 ? ' gold' : '');
      pearl.style.left = (Math.random() * 100) + 'vw';
      pearl.style.width = size + 'px';
      pearl.style.height = size + 'px';
      pearl.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      pearl.style.animationDelay = (Math.random() * 0.6) + 's';
      document.body.appendChild(pearl);
      setTimeout(() => pearl.remove(), 3400);
    }
  }

  return { buildLights, showConfirm, closeConfirm, banner, shower };
})();
