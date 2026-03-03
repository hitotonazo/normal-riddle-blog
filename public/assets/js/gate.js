(function(){
  const KEY = "takumi_gate_step"; // session
  const getStep = () => {
    try { return parseInt(sessionStorage.getItem(KEY) || "0", 10) || 0; } catch(e){ return 0; }
  };
  const setStep = (n) => { try { sessionStorage.setItem(KEY, String(n)); } catch(e){} };

  // Step 1: takumi icon click
  function bindProfile(){
    const img = document.getElementById("profileImg");
    if(!img) return;
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      setStep(1);
      // subtle feedback: small shake class if exists
      try{ document.body.classList.add("gate-step1"); setTimeout(()=>document.body.classList.remove("gate-step1"), 250); }catch(e){}
    }, {passive:true});
  }

  // Step 2: BGM click (ON/OFF either)
  function bindBgm(){
    const btn = document.getElementById("bgmToggle");
    if(!btn) return;
    btn.addEventListener("click", () => {
      const s = getStep();
      if(s >= 1) setStep(2);
    }, {capture:true}); // capture so it fires even if other handlers stopPropagation
  }

  // Step 3: font size large button click
  function bindFont(){
    document.addEventListener("click", (e) => {
      const t = e.target;
      if(!(t instanceof Element)) return;
      const btn = t.closest(".font-btn");
      if(!btn) return;
      if(btn.getAttribute("data-font") !== "lg") return;
      const s = getStep();
      if(s >= 2) setStep(3);
    }, true);
  }

  // Step 4: click any thumbnail (index timeline)
  function bindThumb(){
    function goPost(id){
      if(!id) return;
      const url = new URL(location.href);
      // keep relative base
      const base = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^\/]*$/, "");
      location.href = base + "post.html?id=" + encodeURIComponent(id);
    }

    document.addEventListener("click", (e) => {
      const t = e.target;
      if(!(t instanceof Element)) return;
      const thumb = t.closest(".thumb.gate-thumb");
      if(!thumb) return;

      const postId = thumb.getAttribute("data-post-id");
      const s = getStep();
      if(s >= 3){
        e.preventDefault();
        e.stopPropagation();
        setStep(0);
        // go back blog
        const url = new URL(location.href);
        const base = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^\/]*$/, "");
        location.href = base + "back.html";
        return;
      }
      // normal: thumbnail opens the post
      e.preventDefault();
      e.stopPropagation();
      goPost(postId);
    }, true);

    // keyboard support
    document.addEventListener("keydown", (e) => {
      const active = document.activeElement;
      if(!(active instanceof Element)) return;
      if(!active.classList.contains("gate-thumb")) return;
      if(e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      active.click();
    });
  }

  bindProfile();
  bindBgm();
  bindFont();
  bindThumb();
})();
