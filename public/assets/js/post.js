
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


(async () => {
  const id = new URL(location.href).searchParams.get("id");
  const wrap = document.querySelector("#postWrap");
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
  document.title = `${p.title} | 手箱日記`;

  const mode = new URL(location.href).searchParams.get("mode");
  const isBack = (p.type === "back") || (mode === "back");
  if(isBack){
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
  archEl.innerHTML = "";
  for(const a of arch){
    const x = document.createElement("a");
    x.href = (p.type==="back" ? "./back.html?ym=" : "./index.html?ym=") + encodeURIComponent(a.ym);
    x.textContent = `${a.ym.replace("-", "年")}月`;
    archEl.appendChild(x);
  }
})();
