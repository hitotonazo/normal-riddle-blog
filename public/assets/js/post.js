
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

  if(!document.getElementById('corruptedGateStyle')){
    const style = document.createElement('style');
    style.id = 'corruptedGateStyle';
    style.textContent = `
      .corrupted-gate-screen {
        min-height: calc(100vh - 220px);
        display: grid;
        place-items: center;
        background: #000;
        color: #f2f2f2;
      }
      .corrupted-gate-inner {
        width: min(100%, 560px);
        padding: 24px 20px;
      }
      .corrupted-label {
        font-size: 12px;
        color: #9a9a9a;
        margin-bottom: 12px;
      }
      .corrupted-question {
        font-size: clamp(24px, 4vw, 34px);
        font-weight: 700;
        line-height: 1.6;
        margin: 0 0 22px;
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
          0 0 12px rgba(255,255,255,0.45);
      }
      @keyframes corruptedGlitch {
        0% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
        20% { transform: translate(-7px, 1px) skewX(8deg); opacity: .88; }
        40% { transform: translate(8px, -1px) skewX(-10deg); opacity: 1; }
        60% { transform: translate(-5px, 0) skewX(6deg); opacity: .82; }
        80% { transform: translate(6px, 1px) skewX(-7deg); opacity: 1; }
        100% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
      }
      .corrupted-gate-form {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .corrupted-gate-form input {
        flex: 1 1 280px;
        min-width: 0;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.55);
        background: #060606;
        color: #fff;
        font-size: 16px;
      }
      .corrupted-submit {
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.92);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset;
        background: #0b0b0b;
        color: #fff;
        font-size: 15px;
        cursor: pointer;
      }
      .corrupted-msg {
        min-height: 1.5em;
        color: #c8c8c8;
        margin-bottom: 20px;
      }
      .corrupted-back-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.22);
        background: #111;
        color: #f2f2f2;
        text-decoration: none;
      }
      .true-end-screen {
        min-height: calc(100vh - 220px);
        background: #000;
        color: #f3f3f3;
        display: flex;
        justify-content: center;
        padding: 56px 20px;
      }
      .true-end-inner {
        width: min(100%, 760px);
      }
      .true-end-label {
        font-size: 12px;
        color: #9a9a9a;
        margin-bottom: 14px;
      }
      .true-end-title {
        font-size: clamp(24px, 4vw, 34px);
        line-height: 1.6;
        margin: 0 0 28px;
      }
      .true-end-body {
        line-height: 2.05;
        white-space: pre-wrap;
        font-size: 16px;
      }
      .true-end-actions {
        margin-top: 28px;
      }
    `;
    document.head.appendChild(style);
  }

  const q = wrap.querySelector('.corrupted-question-text');
  if (q) {
    setInterval(() => {
      q.classList.add('glitching');
      setTimeout(() => q.classList.remove('glitching'), 220);
    }, 1000);
  }

  const TRUE_END_TEXT = `私は、ウサギにはなりたくなかった。

ここまで読んできた人は、
きっとこう思っているはずだ。

私は速かった。
でも途中で止まった。

努力をしなくて、
才能に甘えて、
気づいたときには亀に抜かれていた。

そういう人間だった。

表のブログも、裏のブログも、
全部その話になるように書いた。

だから、そう思ったなら
それは間違いじゃない。

それが
ここまで読んだ人が辿り着く
いちばん自然な結論だから。

でも。

私は、ウサギにはなりたくなかった。

だから落ちた。

本当に落ちたわけじゃない。

落ちた「人間」になった。

自分の養父は
相沢 茂という人だった。

真面目な人だった。

朝は決まった時間に起きて、
決まった時間に働いて、
決まったように片付けをする。

言葉は多くなかったけれど、
誠実で、責任感の強い人だった。

そして
「若い人のためなら」という言葉に弱かった。

だから
千原 恒一という男に狙われた。

千原は、表では支援者だった。

困っている人を助ける人。
再出発を支援する人。
人を紹介する人。

そういう顔をしている。

それは嘘じゃない。

実際に助けてもいるし、
紹介もしている。

でも、その先が違う。

千原は
「詰んだ人間」を管理する。

借りを作る。
恩を作る。
秘密を作る。

そうすると人は
逆らえなくなる。

助けられた人間は
感謝しなければいけない。

感謝をすると
借りになる。

借りが増えると
人は黙る。

そして最後に
表に出ない処理を任される。

支援者であり、
同時に回収装置だった。

養父は
その仕組みの中に入った。

最初は小さな話だった。

一時的な立て替え。
形式だけの保証。
名義の使用。

全部合法だった。

全部、書類があった。

だから養父は疑わなかった。

真面目な人は
書類を信じる。

結果
失敗した案件の責任は
養父ひとりに集まった。

千原は
「助けようとした側」に残った。

養父は
借金を背負った。

誰にも言えずに。

そして
死んだ。

自分がそれを知ったのは
少し後だった。

最初は信じられなかった。

でも調べれば調べるほど
構造が見えてきた。

そして分かった。

千原は
成功している人間を支援しない。

対等な人間も支援しない。

彼が好むのは

社会的に弱い人間。
選択肢が少ない人間。
自尊心が折れている人間。

それでも
頭が回る人間。

つまり

使えるが
逆らえない人間。

だから自分は落ちた。

大学を中退した。

理由は語らなかった。

仕事も
続かなかったように見せた。

周囲は言った。

惜しい人だった。
プライドが高すぎた。
続かなかったんだろう。

全部、都合がよかった。

完全に
自己責任の物語が出来上がった。

その状態で
自分から千原の支援団体に近づいた。

行き場のない人間として。

紹介を受けて、
世話になって、
感謝して、
反論しない。

条件の悪い支援も
全部受け入れた。

理由はひとつ。

千原が
安全な駒だと思うため。

うまくいった。

千原は油断した。

学歴はあるが中退。
過去の栄光を引きずっている。
判断を誤った人間。

金も後ろ盾もない。

脅威ではない。

そう思った。

だから
内部の話をした。

養父の話も。
同じように壊された人の話も。

善意で壊された人間が
ひとりじゃないことも。

自分がやったことは
暴力じゃない。

捏造でもない。

ただ記録した。

千原の支援の構造を。

助けるという言葉の中で
人がどう壊れていくのかを。

それを外に出した。

復讐の本質は
千原を傷つけることじゃない。

千原が作った

「正しい支援者の物語」

それを壊すことだった。

でも。

ひとつだけ
最初から分かっていたことがある。

このやり方は
自分も壊す。

元の人生には戻れない。

養父と同じ側に
近づいていく。

それは
最初から分かっていた。

だから
あの言葉を書いた。

たすけて。

助けてほしかった。

復讐を
止めてほしかった。

もし止められないなら
せめて理解してほしかった。

自分が
どうしてここまで来たのかを。

それを託せる相手が
一人だけいた。

ぺいぽぴー。

君だ。

ここまで読んで

それでも
これはただの復讐だと思うなら
それでもいい。

でも
ひとつだけ言わせてほしい。

自分は
ウサギになりたくなかった。

速いから止まる
あの寓話のウサギでもなく。

そして

恩人を失った怒りのまま
火をつけてしまう
かちかち山のウサギにも。

あの話では
最後に悪いタヌキが罰を受ける。

だから
あれは物語になる。

でも
これは違う。

火をつけても
山は戻らない。

誰も戻らない。

だからこれは
寓話じゃない。

ただの復讐だ。

そして多分

誰も救われない。`;

  function renderResultScreen(title, bodyText){
    wrap.innerHTML = `
      <section class="true-end-screen" aria-label="結果画面">
        <div class="true-end-inner">
          <div class="true-end-label">結果</div>
          <h1 class="true-end-title">${title}</h1>
          <div class="true-end-body"></div>
          <div class="true-end-actions">
            <a class="corrupted-back-btn" href="/back">戻る</a>
          </div>
        </div>
      </section>
    `;
    const body = wrap.querySelector('.true-end-body');
    if(body) body.textContent = bodyText;
  }

  const form = wrap.querySelector('#corruptedGateForm');
  const input = wrap.querySelector('#corruptedAnswer');
  const msg = wrap.querySelector('#corruptedMsg');
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
        renderResultScreen('私はうさぎにはなりたくなかった。', 'ここで終わりです。');
        return;
      }
      if(data?.result === 'true'){
        renderResultScreen('私は、ウサギにはなりたくなかった。', TRUE_END_TEXT);
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

  const cfg = await loadSiteConfig();
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
