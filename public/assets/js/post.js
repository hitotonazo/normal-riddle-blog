(async () => {
  const id = getParam("id");
  const wrap = document.querySelector("#postWrap");
  if(!id){
    wrap.innerHTML = `<div class="card">記事IDが指定されていません。<br><a href="./index.html">一覧へ戻る</a></div>`;
    return;
  }

  const posts = await loadPosts();
  const p = posts.find(x => x.id === id);
  if(!p){
    wrap.innerHTML = `<div class="card">記事が見つかりませんでした。<br><a href="./index.html">一覧へ戻る</a></div>`;
    return;
  }

  document.title = `${p.title} | 記録`;

  wrap.innerHTML = `
    <article class="card">
      <div class="meta">
        <span>${escapeHtml(fmtMonth(p.date))}</span>
        ${p.readingTime ? `<span>${escapeHtml(p.readingTime)}</span>` : ""}
      </div>
      <h1 class="h1">${escapeHtml(p.title)}</h1>
      <div class="tags">
        ${p.tags.map(t => `<a class="tag" href="./tags.html?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`).join("")}
      </div>
      <hr>
      <div class="article">${escapeHtml(p.body)}</div>
      <hr>
      <div class="notice"><a href="./index.html">← 記事一覧へ</a></div>
    </article>
  `;
})();
