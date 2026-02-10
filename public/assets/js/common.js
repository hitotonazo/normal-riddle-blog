function escapeHtml(str){
  return (str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function fmtMonth(ym){
  // ym: YYYY-MM
  if(!ym) return "";
  const [y,m] = ym.split("-");
  return `${y}年${m}月`;
}
function byDateDesc(a,b){
  // Compare YYYY-MM
  return (a.date < b.date) ? 1 : (a.date > b.date ? -1 : 0);
}
async function loadPosts(){
  const res = await fetch("./data/posts.json", {cache:"no-store"});
  if(!res.ok) throw new Error("posts.jsonの読み込みに失敗しました");
  const posts = await res.json();
  // Normalize
  return posts.map(p => ({
    id: String(p.id),
    date: String(p.date),
    type: String(p.type || "front"),
    title: String(p.title || ""),
    body: String(p.body || ""),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    excerpt: String(p.excerpt || ""),
    readingTime: String(p.readingTime || "")
  }));
}
function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}
