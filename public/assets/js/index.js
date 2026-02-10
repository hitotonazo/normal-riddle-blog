
(async () => {
  const postsAll = await loadPosts();
  const posts = postsAll.filter(p=>p.type==="front").sort(byDateDesc);

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
          <div class="thumb">image</div>
        </div>
      </div>
    `;
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
