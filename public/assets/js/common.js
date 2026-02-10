function escapeHtml(str){return (str ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fmtMonth(ym){ if(!ym) return ''; const [y,m]=ym.split('-'); return `${y}年${m}月`; }
function byDateDesc(a,b){ return (a.date < b.date) ? 1 : (a.date > b.date ? -1 : 0); }
async function loadPosts(){ const res = await fetch('./data/posts.json',{cache:'no-store'}); const posts = await res.json(); return posts; }
function getParam(name){ const u=new URL(location.href); return u.searchParams.get(name); }
