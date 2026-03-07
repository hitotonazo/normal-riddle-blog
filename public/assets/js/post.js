function svgPlaceholderDataUrl(label){
  const safe = (label || 'image').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180">
    <rect width="100%" height="100%" fill="#f2f2f2"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="14">${safe}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function setImgSrcWithFallback(imgEl, src, label){
  if(!imgEl) return;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = svgPlaceholderDataUrl(label);
  };
  imgEl.src = src;
}

async function loadSiteConfig(){
  try{
    const res = await fetch('./data/config.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('config fetch failed');
    return await res.json();
  }catch(e){
    return {};
  }
}

async function loadConfig(){
  return await loadSiteConfig();
}

function joinUrl(base, rel){
  if(!base) return rel || '';
  if(!rel) return base;
  return base.replace(/\/+$/, '') + '/' + rel.replace(/^\/+/, '');
}

function applyUiImages(cfg, mode){
  const base = (cfg && cfg.assets && cfg.assets.baseUrl) ? cfg.assets.baseUrl : '';
  const ui = (cfg && cfg.assets && cfg.assets.ui) ? cfg.assets.ui : {};
  const heroPath = (mode === 'back') ? ui.backHero : ui.frontHero;
  const profPath = (mode === 'back') ? ui.backProfile : ui.frontProfile;

  const heroImg = document.getElementById('heroImg');
  if(heroImg && heroPath){ heroImg.src = joinUrl(base, heroPath); }

  const profImg = document.getElementById('profileImg');
  if(profImg && profPath){ profImg.src = joinUrl(base, profPath); }
}

async function verifyCorruptedAnswer(answer){
  const res = await fetch('/api/check-answer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ answer })
  });
  if(!res.ok) throw new Error('verification failed');
  return await res.json();
}

function renderCorruptedGate(wrap, p){
  if(!document.getElementById('corruptedGateStyle')){
    const style = document.createElement('style');
    style.id = 'corruptedGateStyle';
    style.textContent = `
      .corrupted-gate-screen {
        min-height: 62vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 20px;
        background: #000;
      }
      .corrupted-gate-inner {
        width: min(100%, 560px);
        display: flex;
        flex-direction: column;
        gap: 18px;
        color: #f2f2f2;
      }
      .corrupted-label {
        font-size: 12px;
        color: #9a9a9a;
        letter-spacing: 0.14em;
      }
      .corrupted-question {
        margin: 0;
        font-size: clamp(26px, 4vw, 38px);
        font-weight: 700;
        line-height: 1.55;
        color: #fff;
      }
      .corrupted-question-text {
        position: relative;
        display: inline-block;
      }
      .corrupted-question-text.glitching {
        animation: corruptedGlitch 0.22s steps(2, end) 1;
        text-shadow:
          -4px 0 rgba(255,255,255,0.95),
           4px 0 rgba(255,255,255,0.75),
           0 0 12px rgba(255,255,255,0.35);
      }
      @keyframes corruptedGlitch {
        0%   { transform: translate(0, 0) skewX(0deg); opacity: 1; }
        20%  { transform: translate(-7px, 1px) skewX(8deg); opacity: .92; }
        40%  { transform: translate(8px, -1px) skewX(-10deg); opacity: 1; }
        60%  { transform: translate(-5px, 0) skewX(6deg); opacity: .88; }
        80%  { transform: translate(5px, 1px) skewX(-7deg); opacity: 1; }
        100% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
      }
      .corrupted-gate-form {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .corrupted-gate-form input {
        flex: 1 1 260px;
        min-width: 0;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.35);
        background: #0d0d0d;
        color: #f2f2f2;
        font-size: 16px;
      }
      .corrupted-submit {
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.92);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset;
        background: #111;
        color: #f2f2f2;
        font-size: 15px;
        cursor: pointer;
      }
      .corrupted-msg {
        min-height: 1.5em;
        font-size: 14px;
        color: #b8b8b8;
      }
      .corrupted-back-wrap {
        margin-top: 6px;
      }
      .corrupted-back-btn {
        display: inline-flex;
        width: fit-content;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid #2c2c2c;
        background: #111;
        color: #f2f2f2;
        font-size: 15px;
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);
  }

  wrap.innerHTML = `
    <section class="corrupted-gate-screen" aria-label="設問画面">
      <div class="corrupted-gate-inner">
        <div class="corrupted-label">設問</div>
        <h1 class="corrupted-question">
          へびとうまの間にある
          <span class="corrupted-question-text" data-text="寓話">寓話</span>
        </h1>

        <form id="corruptedGateForm" class="corrupted-gate-form" novalidate>
          <input
            id="corruptedAnswer"
            type="text"
            autocomplete="off"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            placeholder="パスワードを入力"
          />
          <button type="submit" class="corrupted-submit">送信</button>
        </form>

        <div id="corruptedMsg" class="notice corrupted-msg" aria-live="polite"></div>

        <div class="corrupted-back-wrap">
          <a class="corrupted-back-btn" href="/back">戻る</a>
        </div>
      </div>
    </section>
  `;

  const q = wrap.querySelector('.corrupted-question-text');
  if(q){
    setInterval(() => {
      q.classList.add('glitching');
      setTimeout(() => q.classList.remove('glitching'), 220);
    }, 1000);
  }

  const form = document.getElementById('corruptedGateForm');
  const input = document.getElementById('corruptedAnswer');
  const msg = document.getElementById('corruptedMsg');
  if(input) input.focus();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const answer = String(input?.value || '').trim();
    if(!answer){
      if(msg) msg.textContent = '入力してください。';
      return;
    }
    try{
      const data = await verifyCorruptedAnswer(answer);
      if(data?.result === 'bad'){
        wrap.innerHTML = `
          <section class="corrupted-gate-screen" aria-label="結果画面">
            <div class="corrupted-gate-inner">
              <div class="corrupted-label">結果</div>
              <div class="corrupted-question">私はうさぎにはなりたくなかった。</div>
              <div class="corrupted-back-wrap">
                <a class="corrupted-back-btn" href="/back">戻る</a>
              </div>
            </div>
          </section>
        `;
        return;
      }
      if(data?.result === 'true'){
        wrap.innerHTML = `
          <section class="corrupted-gate-screen" aria-label="結果画面">
            <div class="corrupted-gate-inner">
              <div class="corrupted-label">結果</div>
              <div class="corrupted-question">私はうさぎにはなりたくなかった。しかし養父を死に追いやった千原をどうしても許せない・・・</div>
              <div class="corrupted-back-wrap">
                <a class="corrupted-back-btn" href="/back">戻る</a>
              </div>
            </div>
          </section>
        `;
        return;
      }
      if(msg) msg.textContent = '違います。';
    }catch(err){
      if(msg) msg.textContent = '認証に失敗しました。';
    }
  });
}

function fixBackHeaderLinks(){
  const links = Array.from(document.querySelectorAll('.navrow a.navitem, .breadcrumb a'));
  for(const a of links){
    const t = (a.textContent || '').trim();
    if(t === 'トップ' || t === '記事一覧'){
      a.setAttribute('href', '/back');
    }
  }
}

function renderArticleBody(body, isBack){
  const normalized = String(body || '').replace(/\n/g, '\n').replace(/\r\n?/g, '\n').trim();
  if(!normalized) return '';

  if(!isBack){
    return `<div class="article" style="margin-top:14px">${escapeHtml(normalized)}</div>`;
  }

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<p>${escapeHtml(s).replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `<div class="article article-back" style="margin-top:14px">${paragraphs}</div>`;
}

(async () => {
  const id = new URL(location.href).searchParams.get('id');
  const wrap = document.querySelector('#postWrap');
  if(!wrap){ return; }
  if(!id){
    wrap.innerHTML = `<div class="article-card">記事IDが指定されていません。<div class="notice"><a href="./index.html">一覧へ</a></div></div>`;
    return;
  }

  const posts = await loadPosts();
  const p = posts.find(x => x.id === id);
  if(!p){
    wrap.innerHTML = `<div class="article-card">記事が見つかりませんでした。<div class="notice"><a href="./index.html">一覧へ</a></div></div>`;
    return;
  }

  if(p && p.special === 'password') {
    document.title = `${p.title} | 手箱日記`;
    renderCorruptedGate(wrap, p);
    return;
  }

  document.title = `${p.title} | 手箱日記`;

  const mode = new URL(location.href).searchParams.get('mode');
  const isBack = (p.type === 'back') || (mode === 'back');
  if(isBack){
    fixBackHeaderLinks();
    document.body.classList.add('back');
    if(!document.querySelector('link[href="./assets/css/back.css"]')){
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = './assets/css/back.css';
      document.head.appendChild(l);
    }
    if(!document.querySelector('script[src="./assets/js/glitch.js"]')){
      const sc = document.createElement('script');
      sc.src = './assets/js/glitch.js';
      document.body.appendChild(sc);
    }
  }

  const backUrl = (p.type === 'back') ? '/back' : '/index.html';

  const cfg = await loadConfig();
  const baseAssets = (cfg.assets && cfg.assets.baseUrl) ? cfg.assets.baseUrl : '';
  const heroUrl = p.image || joinUrl(baseAssets, `blog-assets/images/${p.date}.png`);

  wrap.innerHTML = `
    <div class="article-card">
      <div class="pmeta"><span>${escapeHtml(fmtYM(p.date))}</span>${p.readingTime ? `<span>${escapeHtml(p.readingTime)}</span>` : ''}</div>
      <h1 class="ptitle" style="margin-top:10px">${escapeHtml(p.title)}</h1>
      <div class="post-hero">
        <img class="post-hero-img" src="${escapeHtml(heroUrl)}" alt="" onerror="this.closest('.post-hero').style.display='none'" />
      </div>
      ${isBack ? '' : `<div class="tags">${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`}
      ${renderArticleBody(p.body || '', isBack)}
      <div class="notice"><a href="${backUrl}">← 記事一覧へ</a></div>
    </div>
  `;

  const sameType = posts.filter(x => x.type === p.type);
  const arch = buildArchive(sameType);
  const archEl = document.querySelector('#archiveList');
  if(archEl){
    archEl.innerHTML = '';
  }
  for(const a of arch){
    const x = document.createElement('a');
    x.href = (p.type === 'back' ? './back.html?ym=' : './index.html?ym=') + encodeURIComponent(a.ym);
    x.textContent = `${a.ym.replace('-', '年')}月`;
    if(archEl) archEl.appendChild(x);
  }
})();
