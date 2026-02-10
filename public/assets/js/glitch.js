
// Back blog: 2-character units spin (Z-axis) + noisy blur jitter.
// Works even when posts are rendered after page load (rescans periodically).
(function(){
  if(!document.body.classList.contains("back")) return;

  const rand = (a,b)=> a + Math.random()*(b-a);

  function splitToPairs(el){
    if(!el) return;
    if(el.dataset && el.dataset.paired === "1") return;

    // If element contains other elements (complex), try to split a single <a> child, else skip.
    if(el.children && el.children.length){
      if(el.children.length===1 && el.children[0].tagName==="A"){
        splitToPairs(el.children[0]);
      }
      if(el.dataset) el.dataset.paired="1";
      return;
    }

    const text = el.textContent || "";
    if(!text.trim()){
      if(el.dataset) el.dataset.paired="1";
      return;
    }

    el.textContent = "";
    for(let i=0;i<text.length;i+=2){
      const chunk = text.slice(i, i+2);
      const sp = document.createElement("span");
      sp.className = "bitpair";
      sp.textContent = chunk;
      el.appendChild(sp);
    }
    if(el.dataset) el.dataset.paired = "1";
  }

  function rescan(){
    const candidates = Array.from(document.querySelectorAll(
      ".ptitle, .ptitle a, .excerpt, .article, .pmeta span, .breadcrumb a"
    ));
    candidates.forEach(splitToPairs);
  }

  function collectPairs(){
    return Array.from(document.querySelectorAll(".bitpair"));
  }

  function jitter(){
    const containers = Array.from(document.querySelectorAll(".ptitle, .excerpt, .pmeta, .breadcrumb, .article"));
    for(const el of containers){
      const x = rand(-0.8, 0.8);
      const y = rand(-0.5, 0.5);
      const r = rand(-0.2, 0.2);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }
  }

  function spinPairsOnce(){
    const pairs = collectPairs();
    if(!pairs.length) return;
    const count = Math.max(2, Math.min(10, Math.floor(rand(2, 10.9))));
    const picks = new Set();
    for(let i=0;i<count;i++){
      picks.add(pairs[Math.floor(Math.random()*pairs.length)]);
    }
    for(const sp of picks){
      if(!sp) continue;
      sp.classList.add("weird", "spinZ");
      setTimeout(()=>{ sp.classList.remove("weird","spinZ"); }, Math.floor(rand(180, 420)));
    }
  }

  function noiseBurst(){
    const pairs = collectPairs();
    if(!pairs.length) return;
    const count = Math.max(1, Math.min(4, Math.floor(rand(1, 4.6))));
    const picks = new Set();
    for(let i=0;i<count;i++){
      picks.add(pairs[Math.floor(Math.random()*pairs.length)]);
    }
    for(const sp of picks){
      if(!sp) continue;
      sp.classList.add("noise");
      setTimeout(()=>{ sp.classList.remove("noise"); }, Math.floor(rand(160, 520)));
    }
  }

  // initial + periodic rescan (supports async rendered content)
  rescan();
  setInterval(rescan, 800);

  jitter();
  setInterval(jitter, 1700);
  setInterval(spinPairsOnce, 900);
  setInterval(noiseBurst, 650);
})();
