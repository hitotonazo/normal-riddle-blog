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
