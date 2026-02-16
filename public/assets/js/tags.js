
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
  const postsAll = await loadPosts();
  const posts = postsAll.filter(p=>p.type==="front");
  const tagMap = new Map();
  posts.forEach(p=>p.tags.forEach(t=>tagMap.set(t,(tagMap.get(t)||0)+1)));
  const tags = Array.from(tagMap.entries()).map(([t,c])=>({t,c})).sort((a,b)=>a.t.localeCompare(b.t,'ja'));
  const wrap = document.querySelector("#tagWrap");
  wrap.innerHTML = "";
  for(const x of tags){
    const a = document.createElement("a");
    a.href = "./index.html?qtag=" + encodeURIComponent(x.t);
    a.textContent = `${x.t} (${x.c})`;
    wrap.appendChild(a);
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
})();
