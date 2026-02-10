
(function(){
  const KEY = "takumi_bgm";
  const prefersOn = (localStorage.getItem(KEY) ?? "on") === "on";

  // Decide track by page mode
  const isBack = document.body.classList.contains("back") ||
                 location.pathname.endsWith("/back.html") ||
                 (location.pathname.endsWith("/post.html") && (new URL(location.href)).searchParams.get("mode")==="back");

  const src = isBack ? "./assets/bgm/back.wav" : "./assets/bgm/front.wav";

  // Create audio
  const audio = document.createElement("audio");
  audio.src = src;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = isBack ? 0.20 : 0.24;

  // Button (exists in topbar)
  const btn = document.getElementById("bgmToggle");
  const setLabel = (on)=>{
    if(!btn) return;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "BGM: ON" : "BGM: OFF";
  };

  let enabled = prefersOn;
  setLabel(enabled);

  // Try to play after first user gesture (autoplay policy friendly)
  const tryPlay = async ()=>{
    if(!enabled) return;
    try{
      await audio.play();
      setLabel(true);
    }catch(e){
      // keep enabled, but need another gesture. show subtle hint by keeping label ON.
    }
  };

  const gesture = ()=>{
    window.removeEventListener("pointerdown", gesture, {capture:true});
    window.removeEventListener("keydown", gesture, {capture:true});
    window.removeEventListener("scroll", gesture, {capture:true});
    tryPlay();
  };
  window.addEventListener("pointerdown", gesture, {capture:true, once:true});
  window.addEventListener("keydown", gesture, {capture:true, once:true});
  window.addEventListener("scroll", gesture, {capture:true, once:true});

  // Toggle
  if(btn){
    btn.addEventListener("click", async ()=>{
      enabled = !enabled;
      localStorage.setItem(KEY, enabled ? "on" : "off");
      if(enabled){
        tryPlay();
      }else{
        audio.pause();
        setLabel(false);
      }
    });
  }

  // expose for debugging
  window.__takumiBgm = audio;
})();
