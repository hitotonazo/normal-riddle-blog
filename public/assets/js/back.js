// back.js (for /back.html)
(async () => {
  try {
    const heroEl = document.getElementById('heroImg');
    if (!heroEl) return;

    // Load config (same-origin)
    const cfg = await (typeof loadConfig === 'function'
      ? loadConfig()
      : fetch('/data/config.json', { cache: 'no-store' }).then(r => r.json())
    );

    const heroPath = cfg?.assets?.ui?.topHeroBack || cfg?.assets?.ui?.backHero || '';
    const heroUrl = (typeof resolveAssetUrl === 'function')
      ? resolveAssetUrl(cfg, heroPath)
      : (cfg?.assets?.baseUrl ? cfg.assets.baseUrl.replace(/\/+$/,'') + '/' + heroPath.replace(/^\/+/, '') : heroPath);

    if (heroUrl) {
      heroEl.alt = '';
      heroEl.decoding = 'async';
      heroEl.loading = 'eager';
      heroEl.src = heroUrl;
      // helpful debug
      console.info('[back] heroImg src =', heroUrl);
    } else {
      console.warn('[back] hero image path is empty. Check /data/config.json assets.ui.topHeroBack');
    }
  } catch (e) {
    console.error('[back] failed to set hero image', e);
  }
})();
