
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



  function fixBackHeaderLinks(){
    // In back mode, make header "トップ/記事一覧" go to back index
    const links = Array.from(document.querySelectorAll('.navrow a.navitem'));
    for(const a of links){
      const t = (a.textContent || '').trim();
      if(t === 'トップ' || t === '記事一覧'){
        a.setAttribute('href','./back.html');
      }
    }
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
  
  // Password-gated corrupted entry (works even on direct URL)
  if(p && p.special === "password"){
    const ans = prompt("パスワードを入力してください。\n設問：へびとうまの間にある昔話");
    if(ans === null){ location.href = "./back.html"; return; }
    const a = String(ans).trim();
    const show = (kind, text)=>{
      wrap.innerHTML = `
        <div class="article-card">
          <div class="pmeta"><span>${escapeHtml(p.displayDate || p.date || "")}</span></div>
          <h1 class="ptitle" style="margin-top:10px">${escapeHtml(p.title || "（破損）")}</h1>
          <div class="post-hero">
            <img class="post-hero-img" src="${escapeHtml(p.image || p.thumbnail || "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%221200%22%20height%3D%22800%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23000%22/%3E%3C/svg%3E")}" alt=""/>
          </div>
          <div class="article" style="margin-top:14px;white-space:pre-wrap">${escapeHtml(text)}</div>
          <div class="notice"><a href="./back.html">← 記事一覧へ</a></div>
        </div>
      `;
    };
    if(a === "うさぎとかめ"){
      show("BAD END", "私はうさぎにはなりたくなかった。");
    }else if(a === "かちかち山"){
      show("TRUE END", "私はうさぎにはなりたくなかった。しかし養父を死に追いやった千原をどうしても許せない・・・");
    }else{
      alert("違います。");
      location.reload();
    }
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

  const backUrl = (p.type === "back") ? "./back.html" : "./index.html";

  const cfg = await loadConfig();
    const baseAssets = (cfg.assets && cfg.assets.baseUrl) ? cfg.assets.baseUrl : "";
    const heroUrl = joinUrl(baseAssets, `blog-assets/images/${p.date}.png`);


  wrap.innerHTML = `
    <div class="article-card">
      <div class="pmeta"><span>${escapeHtml(fmtYM(p.date))}</span>${p.readingTime?`<span>${escapeHtml(p.readingTime)}</span>`:""}</div>
      <h1 class="ptitle" style="margin-top:10px">${escapeHtml(p.title)}</h1>
      <div class="post-hero">
        <img class="post-hero-img" src="${escapeHtml(heroUrl)}" alt="" onerror="this.closest('.post-hero').style.display='none'" />
      </div>
      ${isBack ? "" : `<div class="tags">${p.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`}
      <div class="article" style="margin-top:14px">${escapeHtml(String(p.body || '').replace(/\\n/g, '\n'))}</div>
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
