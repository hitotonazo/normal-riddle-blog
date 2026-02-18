// Back (裏) index page: load hero + render only posts where type === "back"
// Depends on common.js (loadConfig, loadPosts, resolveAssetUrl)

function getEl(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatJPMonth(yyyyMM) {
  // yyyy-MM -> yyyy年MM月
  const [y, m] = String(yyyyMM).split('-');
  if (!y || !m) return yyyyMM;
  return `${y}年${m}月`;
}

function buildPostUrl(post) {
  // Use the shared post.html and pass mode=back so post.js can style accordingly if implemented.
  const url = new URL('./post.html', window.location.href);
  url.searchParams.set('id', post.id);
  url.searchParams.set('mode', 'back');
  return url.toString();
}

function svgPlaceholderDataUrl(label) {
  const text = label || 'image';
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">
    <rect width="100%" height="100%" fill="#1a2130" />
    <rect x="12" y="12" width="296" height="216" rx="16" ry="16" fill="#0f141e" stroke="#2a3140" />
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#9aa6bb" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

function createTimelineItem(post, config) {
  const li = document.createElement('li');
  li.className = 't-item';

  const [, m] = String(post.date || '').split('-');
  const day = String(post.id || '').split('-')[2] || '01';

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = (parseInt(m, 10) || 1) - 1;
  const monthShort = monthNames[Math.max(0, Math.min(11, mi))];

  // Thumbnails follow the same convention as the front page: blog-assets/thumbnails/YYYY-MM.png
  // (Back posts in posts.json typically don't carry an explicit thumbnail field.)
  const thumbUrl = resolveAssetUrl(config, `blog-assets/thumbnails/${post.date}.png`);
  const thumbFallback = svgPlaceholderDataUrl('image');

  const url = buildPostUrl(post);
  const tagsHtml = (post.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');

  li.innerHTML = `
    <div class="datebox">
      <div class="day">${escapeHtml(day)}</div>
      <div class="month">${escapeHtml(monthShort || '')}</div>
      <div class="vline"></div>
    </div>
    <div class="postcard">
      <div class="row">
        <div style="flex:1;min-width:0">
          <div class="pmeta">${escapeHtml(post.date || '')}${post.readingTime ? ' ・ ' + escapeHtml(post.readingTime) : ''}</div>
          <h2 class="ptitle"><a href="${escapeHtml(url)}">${escapeHtml(post.title || '')}</a></h2>
          <div class="excerpt">${escapeHtml(post.excerpt || '')}</div>
          <div class="tags">${tagsHtml}</div>
        </div>
        <a class="thumb" href="${escapeHtml(url)}" aria-label="open">
          <img class="thumbimg" src="${escapeHtml(thumbUrl)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${escapeHtml(thumbFallback)}'">
        </a>
      </div>
    </div>
  `.trim();

  return li;
}

function renderArchiveList(posts) {
  // Group by yyyy-MM
  const byMonth = new Map();
  for (const p of posts) {
    if (!p.date) continue;
    const key = p.date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }
  const months = Array.from(byMonth.keys()).sort((a, b) => (a < b ? 1 : -1));

  const list = getEl('archiveList');
  if (!list) return;
  list.innerHTML = '';

  for (const key of months) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#m-${key}`;
    a.textContent = formatJPMonth(key);
    li.appendChild(a);
    list.appendChild(li);
  }
}

function addMonthAnchors(timelineEl, posts) {
  // Insert invisible anchors for month jump
  const seen = new Set();
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const key = (p.date || '').slice(0, 7);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const anchor = document.createElement('div');
    anchor.id = `m-${key}`;
    anchor.style.position = 'relative';
    anchor.style.top = '-80px';
    anchor.style.height = '1px';

    // Insert before the first post of that month
    const firstLi = timelineEl.children[i];
    timelineEl.insertBefore(anchor, firstLi);
  }
}

async function initBack() {
  const heroImg = getEl('heroImg');
  const profileImg = getEl('profileImg');
  const timeline = getEl('timeline');

  const config = await loadConfig();

  // Hero
  if (heroImg) {
    const ui = (config && config.assets && config.assets.ui) ? config.assets.ui : {};
    const heroKey = ui.topHeroBack || ui.backHero || ui.heroBack || 'assets/img/cover.svg';
    heroImg.src = resolveAssetUrl(config, heroKey);
    heroImg.alt = 'cover';
  }

  // Profile
  if (profileImg) {
    const ui = (config && config.assets && config.assets.ui) ? config.assets.ui : {};
    const profKey = ui.backProfile || ui.profileBack || ui.profile || '';
    if (profKey) profileImg.src = resolveAssetUrl(config, profKey);
  }

  // Posts
  const allPosts = await loadPosts();
  const posts = (allPosts || [])
    .filter(p => (p.type || 'front') === 'back')
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  if (!timeline) return;
  timeline.innerHTML = '';

  // Render
  for (const p of posts) {
    timeline.appendChild(createTimelineItem(p, config));
  }

  // Anchors + archive
  addMonthAnchors(timeline, posts);
  renderArchiveList(posts);
}

document.addEventListener('DOMContentLoaded', () => {
  initBack().catch((e) => {
    console.error('[back] init failed', e);
  });
});
