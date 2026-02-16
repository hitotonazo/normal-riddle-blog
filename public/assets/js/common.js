
function escapeHtml(str){
  return (str ?? "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function fmtYM(ym){ if(!ym) return ""; const [y,m]=ym.split("-"); return `${y}年${m}月`; }
function fmtMonthShort(ym){
  if(!ym) return "";
  const m = parseInt(ym.split("-")[1],10);
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[Math.max(1,Math.min(12,m))-1];
}
function fmtDayFromId(id){
  const parts=String(id||"").split("-");
  const d = parts.length>=3 ? parts[2] : "01";
  return String(d).padStart(2,"0");
}
function byDateAsc(a,b){
  if(a.date !== b.date) return a.date > b.date ? 1 : -1;
  return a.id > b.id ? 1 : -1;
}
function byDateDesc(a,b){
  if(a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.id < b.id ? 1 : -1;
}
async function loadPosts(){
  const res = await fetch("./data/posts.json",{cache:"no-store"});
  if(!res.ok) throw new Error("posts.jsonの読み込みに失敗しました");
  const posts = await res.json();
  return posts.map(p => ({
    id:String(p.id), date:String(p.date), type:String(p.type||"front"),
    title:String(p.title||""), body:String(p.body||""),
    tags:Array.isArray(p.tags)?p.tags.map(String):[],
    excerpt:String(p.excerpt||""), readingTime:String(p.readingTime||"")
  }));
}
function buildArchive(posts){
  const map = new Map();
  posts.forEach(p=>{ if(p.date) map.set(p.date,(map.get(p.date)||0)+1); });
  return Array.from(map.entries()).map(([ym,count])=>({ym,count})).sort((a,b)=>a.ym > b.ym ? 1 : -1);
}


async function loadConfig(){
  try{
    const res = await fetch("./data/config.json",{cache:"no-store"});
    if(!res.ok) return {};
    return await res.json();
  }catch(e){ return {}; }
}
function joinUrl(base, path){
  if(!base) return path;
  return base.replace(/\/+$/,"") + "/" + path.replace(/^\/+/, "");
}
