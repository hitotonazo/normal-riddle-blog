
(function(){
  const KEY = "takumi_bgm";
  const prefersOn = (localStorage.getItem(KEY) ?? "on") === "on";

  const isBack = document.body.classList.contains("back") ||
    location.pathname.endsWith("/back.html") ||
    (location.pathname.endsWith("/post.html") && (new URL(location.href)).searchParams.get("mode")==="back");

  // Default local files (fallback)
  const localFront = "./assets/bgm/front.wav";
  const localBack  = "./assets/bgm/back.wav";

  // Read config (allows R2 / remote URLs)
  async function loadConfig(){
    try{
      const res = await fetch("./data/config.json", {cache:"no-store"});
      if(!res.ok) throw new Error("no config");
      return await res.json();
    }catch(e){
      return {};
    }
  }

  function resolveSrc(cfg){
    const bgm = (cfg && cfg.bgm) ? cfg.bgm : cfg || {};
    // 1) explicit URLs win
    const frontUrl = bgm.frontUrl || bgm.front || "";
    const backUrl  = bgm.backUrl  || bgm.back  || "";
    if(isBack && backUrl) return backUrl;
    if(!isBack && frontUrl) return frontUrl;

    // 2) baseUrl + filenames (R2 recommended)
    const baseUrl = (bgm.baseUrl || "").replace(/\/+$/,"");
    if(baseUrl){
      return isBack ? `${baseUrl}/back.mp3` : `${baseUrl}/front.mp3`;
    }

    // 3) fallback local
    return isBack ? localBack : localFront;
  }

  const audio = document.createElement("audio");
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = isBack ? 0.20 : 0.24;

  const btn = document.getElementById("bgmToggle");
  const setLabel = (on)=>{
    if(!btn) return;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "BGM: ON" : "BGM: OFF";
  };

  let enabled = prefersOn;
  setLabel(enabled);

  async function init(){
    const cfg = await loadConfig();
    audio.src = resolveSrc(cfg);
  }

  async function tryPlay(){
    if(!enabled) return;
    try{ await audio.play(); }catch(e){ /* needs gesture */ }
  }

  const gesture = ()=>{
    window.removeEventListener("pointerdown", gesture, {capture:true});
    window.removeEventListener("keydown", gesture, {capture:true});
    window.removeEventListener("scroll", gesture, {capture:true});
    tryPlay();
  };
  window.addEventListener("pointerdown", gesture, {capture:true, once:true});
  window.addEventListener("keydown", gesture, {capture:true, once:true});
  window.addEventListener("scroll", gesture, {capture:true, once:true});

  if(btn){
    btn.addEventListener("click", async ()=>{
      enabled = !enabled;
      localStorage.setItem(KEY, enabled ? "on" : "off");
      if(enabled){
        await tryPlay();
      }else{
        audio.pause();
      }
      setLabel(enabled);
    });
  }

  init().then(()=>{
    if(enabled) setLabel(true);
  });

  window.__takumiBgm = audio;
})();
