
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
