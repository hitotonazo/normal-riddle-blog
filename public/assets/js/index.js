
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
  const cfg = await loadConfig();

  // Top hero (red frame area) comes from R2 (public) via config.json.
  // If you don't set it, the page would fall back to the bundled cover.svg.
  try {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') === 'back' ? 'back' : 'front';
    const heroKey = mode === 'back' ? cfg.assets?.ui?.topHeroBack : cfg.assets?.ui?.topHeroFront;
    const heroUrl = resolveAssetUrl(cfg, heroKey);
    const heroImg = document.getElementById('heroImg');
    if (heroImg && heroUrl) heroImg.src = heroUrl;
  } catch (_) {
    // ignore
  }
  const postsAll = await loadPosts();
  const posts = postsAll.filter(p=>p.type==="front").sort(byDateAsc);

  const list = document.querySelector("#timeline");
  list.innerHTML = "";
  for(const p of posts){
    const li = document.createElement("li");
    li.className = "t-item";
    const day = fmtDayFromId(p.id);
    const month = fmtMonthShort(p.date);
    li.innerHTML = `
      <div class="datebox">
        <div class="day">${escapeHtml(day)}</div>
        <div class="month">${escapeHtml(month)}</div>
        <div class="vline"></div>
      </div>
      <div class="postcard">
        <div class="row">
          <div style="flex:1">
            <div class="pmeta"><span>${escapeHtml(fmtYM(p.date))}</span>${p.readingTime?`<span>${escapeHtml(p.readingTime)}</span>`:""}</div>
            <h2 class="ptitle"><a href="./post.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h2>
            ${p.excerpt?`<div class="excerpt">${escapeHtml(p.excerpt)}</div>`:""}
            <div class="tags">${p.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          </div>
          <div class="thumb" style="background-image:url(${escapeHtml(joinUrl((cfg.assets&&cfg.assets.baseUrl)||"", `blog-assets/thumbnails/${p.date}.png`))})"></div>
        </div>
      </div>
    `;

    // thumbnail
    const thumbImg = li.querySelector('.thumbimg');
    const thumbsDir = cfg.assets?.paths?.thumbnails || 'blog-assets/thumbnails';
    if (thumbImg) {
      const thumbUrl = absUrl(`${thumbsDir}/${p.date}.png`);
      setImgSrcWithFallback(thumbImg, thumbUrl, p.date);
    }
    list.appendChild(li);
  }

  const arch = buildArchive(posts);
  const archEl = document.querySelector("#archiveList");
  archEl.innerHTML = "";
  for(const a of arch){
    const x = document.createElement("a");
    x.href = "./index.html?ym=" + encodeURIComponent(a.ym);
    x.textContent = `${a.ym.replace("-", "年")}月`;
    archEl.appendChild(x);
  }

  const params = new URL(location.href).searchParams;
  const ym = params.get("ym");
  const qtag = params.get("qtag");
  const note = document.querySelector("#filterNote");
  if(ym){
    note.textContent = `${fmtYM(ym)} の記事`;
    Array.from(list.children).forEach(li=>{
      const meta = li.querySelector(".pmeta span")?.textContent || "";
      if(meta !== fmtYM(ym)) li.style.display = "none";
    });
  } else if(qtag){
    note.textContent = `タグ「${qtag}」`;
    Array.from(list.children).forEach(li=>{
      const tags = Array.from(li.querySelectorAll(".tag")).map(x=>x.textContent);
      if(!tags.includes(qtag)) li.style.display = "none";
    });
  } else {
    note.textContent = "";
  }
})();
