(async () => {
  const tag = getParam("tag") || "";
  const titleEl = document.querySelector("#tagTitle");
  const listEl = document.querySelector("#tagList");
  const posts = (await loadPosts()).sort(byDateDesc);

  titleEl.textContent = tag ? `タグ：${tag}` : "タグ一覧";

  if(!tag){
    // List all tags
    const map = new Map();
    for(const p of posts){
      for(const t of p.tags) map.set(t, (map.get(t)||0)+1);
    }
    const all = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0], "ja"));
    listEl.innerHTML = all.map(([t,c]) => `
      <li>
        <div class="post-title"><a href="./tags.html?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a></div>
        <div class="meta">${c}件</div>
      </li>
    `).join("");
    return;
  }

  const filtered = posts.filter(p => p.tags.includes(tag));
  listEl.innerHTML = filtered.map(p => `
    <li>
      <div class="meta"><span>${escapeHtml(fmtMonth(p.date))}</span></div>
      <div class="post-title"><a href="./post.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></div>
      ${p.excerpt ? `<div class="excerpt">${escapeHtml(p.excerpt)}</div>` : ""}
    </li>
  `).join("");
})();
