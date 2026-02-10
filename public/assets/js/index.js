(async () => {
  const listEl = document.querySelector("#postList");
  const tagEl = document.querySelector("#tagSelect");
  const qEl = document.querySelector("#q");
  const countEl = document.querySelector("#count");
  const resetBtn = document.querySelector("#resetBtn");

  const posts = (await loadPosts()).sort(byDateDesc);

  // Build tag list
  const tags = new Map();
  for(const p of posts){
    for(const t of p.tags){
      tags.set(t, (tags.get(t) || 0) + 1);
    }
  }
  const tagOptions = Array.from(tags.entries()).sort((a,b)=>a[0].localeCompare(b[0], "ja"));
  for(const [t,c] of tagOptions){
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = `${t} (${c})`;
    tagEl.appendChild(opt);
  }

  function match(p, q, tag){
    const ql = (q||"").trim().toLowerCase();
    const inText = !ql || (
      p.title.toLowerCase().includes(ql) ||
      p.excerpt.toLowerCase().includes(ql) ||
      p.body.toLowerCase().includes(ql)
    );
    const inTag = !tag || p.tags.includes(tag);
    return inText && inTag;
  }

  function render(){
    const q = qEl.value;
    const tag = tagEl.value;
    const filtered = posts.filter(p => match(p,q,tag));

    listEl.innerHTML = "";
    for(const p of filtered){
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="meta">
          <span>${escapeHtml(fmtMonth(p.date))}</span>
          ${p.readingTime ? `<span>${escapeHtml(p.readingTime)}</span>` : ""}
        </div>
        <div class="post-title">
          <a href="./post.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a>
        </div>
        ${p.excerpt ? `<div class="excerpt">${escapeHtml(p.excerpt)}</div>` : ""}
        <div class="tags">
          ${p.tags.map(t => `<a class="tag" href="./tags.html?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`).join("")}
        </div>
      `;
      listEl.appendChild(li);
    }
    countEl.textContent = `表示：${filtered.length}件`;
  }

  qEl.addEventListener("input", render);
  tagEl.addEventListener("change", render);
  resetBtn.addEventListener("click", () => { qEl.value=""; tagEl.value=""; render(); });

  render();
})();
