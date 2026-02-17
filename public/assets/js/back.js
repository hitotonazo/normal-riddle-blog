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

function createTimelineItem(post, config) {
  const li = document.createElement('li');
  li.className = 't-item';

  const [y, m] = String(post.date || '').split('-');
  const monthShort = m || '';
  const day = String(post.id || '').split('-')[2] || '';

  const thumbRel = post.thumbnail || '';
  const thumb = thumbRel ? resolveAssetUrl(config, thumbRel) : '';

  li.innerHTML = `
    <div class="datebox">
      <div class="d-day">${escapeHtml(day)}</div>
      <div class="d-month">${escapeHtml(monthShort ? monthShort : '')}</div>
    </div>
    <div class="postcard">
      <a class="postlink" href="${escapeHtml(buildPostUrl(post))}">
        <div class="postmeta">
          <div class="meta-top">
            <span class="meta-date">${escapeHtml(post.date || '')}</span>
            <span class="meta-read">${escapeHtml(post.readingTime || '')}</span>
          </div>
          <div class="posttitle">${escapeHtml(post.title || '')}</div>
          <div class="postexcerpt">${escapeHtml(post.excerpt || '')}</div>
          <div class="posttags">
            ${(post.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        ${thumb ? `<img class="thumb" src="${escapeHtml(thumb)}" alt="">` : ''}
      </a>
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
