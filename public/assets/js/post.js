
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
  imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = svgPlaceholderDataUrl(label); };
  imgEl.src = src;
}
async function loadSiteConfig(){
  try{
    const res = await fetch("./data/config.json", {cache:"no-store"});
    if(!res.ok) throw new Error("config fetch failed");
    return await res.json();
  }catch(e){
    return {};
  }
}
function joinUrl(base, rel){
  if(!base) return rel || "";
  if(!rel) return base;
  return base.replace(/\/+$/,"") + "/" + rel.replace(/^\/+/, "");
}
function applyUiImages(cfg, mode){
  const base = (cfg && cfg.assets && cfg.assets.baseUrl) ? cfg.assets.baseUrl : "";
  const ui = (cfg && cfg.assets && cfg.assets.ui) ? cfg.assets.ui : {};
  const heroPath = (mode === "back") ? ui.backHero : ui.frontHero;
  const profPath = (mode === "back") ? ui.backProfile : ui.frontProfile;

  const heroImg = document.getElementById("heroImg");
  if(heroImg && heroPath){ heroImg.src = joinUrl(base, heroPath); }

  const profImg = document.getElementById("profileImg");
  if(profImg && profPath){ profImg.src = joinUrl(base, profPath); }
}



async function verifyCorruptedAnswer(answer){
  const res = await fetch('/api/check-answer', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ answer })
  });
  if(!res.ok) throw new Error('verification failed');
  return await res.json();
}

function renderCorruptedGate(wrap, p){
  document.body.className = 'corrupted-page';
  document.body.innerHTML = `
    <main class="corrupted-page-wrap">
      <section class="corrupted-panel" aria-label="設問">
        <div class="corrupted-question-label">設問</div>
        <div class="corrupted-question">へびとうまの間にある昔話</div>
        <form id="corruptedGateForm" class="corrupted-gate-form" autocomplete="off">
          <input id="corruptedAnswer" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="パスワードを入力" />
          <button type="submit">送信</button>
        </form>
        <div id="corruptedMsg" class="corrupted-msg" aria-live="polite"></div>
        <a class="corrupted-back-btn" href="/back">裏ブログのトップへ戻る</a>
      </section>
    </main>
  `;

  if(!document.getElementById('corruptedGateStyle')){
    const style = document.createElement('style');
    style.id = 'corruptedGateStyle';
    style.textContent = `
      html, body.corrupted-page {
        margin: 0;
        min-height: 100%;
        background: #000;
        color: #e8e8e8;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Noto Sans JP", sans-serif;
      }
      body.corrupted-page {
        min-height: 100vh;
      }
      .corrupted-page-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
      }
      .corrupted-panel {
        width: min(100%, 560px);
        display: flex;
        flex-direction: column;
        gap: 18px;
        align-items: stretch;
      }
      .corrupted-question-label {
        font-size: 13px;
        color: #9a9a9a;
        letter-spacing: 0.12em;
      }
      .corrupted-question {
        font-size: clamp(22px, 4vw, 30px);
        font-weight: 700;
        line-height: 1.6;
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
        border: 1px solid #2c2c2c;
        background: #0d0d0d;
        color: #f2f2f2;
        font-size: 16px;
      }
      .corrupted-gate-form button,
      .corrupted-back-btn {
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid #2c2c2c;
        background: #111;
        color: #f2f2f2;
        font-size: 15px;
        text-decoration: none;
      }
      .corrupted-gate-form button {
        cursor: pointer;
      }
      .corrupted-msg {
        min-height: 1.5em;
        font-size: 14px;
        color: #b8b8b8;
      }
      .corrupted-back-btn {
        display: inline-flex;
        width: fit-content;
      }
    `;
    document.head.appendChild(style);
  }

  const form = document.getElementById('corruptedGateForm');
  const input = document.getElementById('corruptedAnswer');
  const msg = document.getElementById('corruptedMsg');
  if(input) input.focus();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const answer = String(input?.value || '').trim();
    if(!answer){ if(msg) msg.textContent = '入力してください。'; return; }
    try{
      const data = await verifyCorruptedAnswer(answer);
      if(data?.result === 'bad'){
        document.body.innerHTML = `
          <main class="corrupted-page-wrap">
            <section class="corrupted-panel">
              <div class="corrupted-question-label">結果</div>
              <div class="corrupted-question">私はうさぎにはなりたくなかった。</div>
              <a class="corrupted-back-btn" href="/back">裏ブログのトップへ戻る</a>
            </section>
          </main>
        `;
        return;
      }
      if(data?.result === 'true'){
        document.body.innerHTML = `
          <main class="corrupted-page-wrap">
            <section class="corrupted-panel">
              <div class="corrupted-question-label">結果</div>
              <div class="corrupted-question">私はうさぎにはなりたくなかった。しかし養父を死に追いやった千原をどうしても許せない・・・</div>
              <a class="corrupted-back-btn" href="/back">裏ブログのトップへ戻る</a>
            </section>
          </main>
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
    // In back mode, make header "トップ/記事一覧" go to back index
    const links = Array.from(document.querySelectorAll('.navrow a.navitem, .breadcrumb a'));
    for(const a of links){
      const t = (a.textContent || '').trim();
      if(t === 'トップ' || t === '記事一覧'){
        a.setAttribute('href','/back');
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
  const id = new URL(location.href).searchParams.get("id");
  const wrap = document.querySelector("#postWrap");
  if(!wrap){ return; }
  if(!id){
    wrap.innerHTML = `<div class="article-card">記事IDが指定されていません。<div class="notice"><a href="./index.html">一覧へ</a></div></div>`;
    return;
  }
  const posts = await loadPosts();
  const p = posts.find(x=>x.id===id);
  if(!p){
    wrap.innerHTML = `<div class="article-card">記事が見つかりませんでした。<div class="notice"><a href="./index.html">一覧へ</a></div></div>`;
    return;
  }
  if(p && p.special === "password") {
    document.title = `${p.title} | 手箱日記`;
    renderCorruptedGate(wrap, p);
    return;
  }

  document.title = `${p.title} | 手箱日記`;

  const mode = new URL(location.href).searchParams.get("mode");
  const isBack = (p.type === "back") || (mode === "back");
  if(isBack){
    fixBackHeaderLinks();
    document.body.classList.add("back");
    // load back.css if not present
    if(!document.querySelector('link[href="./assets/css/back.css"]')){
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "./assets/css/back.css";
      document.head.appendChild(l);
    }
    // load glitch.js (text weirdness) if not present
    if(!document.querySelector('script[src="./assets/js/glitch.js"]')){
      const sc = document.createElement("script");
      sc.src = "./assets/js/glitch.js";
      document.body.appendChild(sc);
    }
  }

  const backUrl = (p.type === "back") ? "/back" : "/index.html";

  const cfg = await loadConfig();
    const baseAssets = (cfg.assets && cfg.assets.baseUrl) ? cfg.assets.baseUrl : "";
    const heroUrl = p.image || joinUrl(baseAssets, `blog-assets/images/${p.date}.png`);


  wrap.innerHTML = `
    <div class="article-card">
      <div class="pmeta"><span>${escapeHtml(fmtYM(p.date))}</span>${p.readingTime?`<span>${escapeHtml(p.readingTime)}</span>`:""}</div>
      <h1 class="ptitle" style="margin-top:10px">${escapeHtml(p.title)}</h1>
      <div class="post-hero">
        <img class="post-hero-img" src="${escapeHtml(heroUrl)}" alt="" onerror="this.closest('.post-hero').style.display='none'" />
      </div>
      ${isBack ? "" : `<div class="tags">${p.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`}
      ${renderArticleBody(p.body || '', isBack)}
      <div class="notice"><a href="${backUrl}">← 記事一覧へ</a></div>
    </div>
  `;

  // sidebar archive based on same type
  const sameType = posts.filter(x=>x.type===p.type);
  const arch = buildArchive(sameType);
  const archEl = document.querySelector("#archiveList");
  if(archEl){
    archEl.innerHTML = "";
  }
  for(const a of arch){
    const x = document.createElement("a");
    x.href = (p.type==="back" ? "./back.html?ym=" : "./index.html?ym=") + encodeURIComponent(a.ym);
    x.textContent = `${a.ym.replace("-", "年")}月`;
    if(archEl) archEl.appendChild(x);
  }
})();
