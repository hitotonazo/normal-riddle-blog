
// Back blog: 2-character "bit pairs" flip + noisy blur jitter.
(function(){
  if(!document.body.classList.contains("back")) return;

  const rand = (a,b)=> a + Math.random()*(b-a);

  function splitToPairs(el){
    // Only split if it has a single text node (or no children)
    // Preserve existing HTML if complex (skip)
    if(!el) return;
    if(el.dataset && el.dataset.paired === "1") return;

    // If element has element children, try to split only pure-text nodes by wrapping inside a span
    // For simplicity, handle the common cases: <a>text</a>, <span>text</span>, or plain text.
    const target = (el.tagName === "A" || el.children.length===0) ? el : null;
    if(!target){
      // if single child and it's an <a>, split that
      if(el.children.length===1 && el.children[0].tagName === "A" && el.childNodes.length===1){
        splitToPairs(el.children[0]);
      }
      return;
    }

    const text = target.textContent || "";
    // Avoid splitting empty / whitespace-only
    if(!text.trim()){
      if(el.dataset) el.dataset.paired = "1";
      return;
    }

    // Replace with spans
    target.textContent = "";
    for(let i=0;i<text.length;i+=2){
      const chunk = text.slice(i, i+2);
      const sp = document.createElement("span");
      sp.className = "bitpair";
      sp.textContent = chunk;
      target.appendChild(sp);
    }
    if(el.dataset) el.dataset.paired = "1";
    if(target.dataset) target.dataset.paired = "1";
  }

  // Targets: split text into 2-char chunks
  const candidates = Array.from(document.querySelectorAll(
    ".ptitle, .ptitle a, .excerpt, .article, .pmeta span, .tag, .breadcrumb a"
  ));
  candidates.forEach(splitToPairs);

  function collectPairs(){
    return Array.from(document.querySelectorAll(".bitpair"));
  }

  function jitter(){
    // light positional jitter for containers (keeps layout mostly stable)
    const containers = Array.from(document.querySelectorAll(".ptitle, .excerpt, .pmeta, .breadcrumb, .article"));
    for(const el of containers){
      const x = rand(-0.8, 0.8);
      const y = rand(-0.5, 0.5);
      const r = rand(-0.2, 0.2);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }
  }

  function flipPairsOnce(){
    const pairs = collectPairs();
    if(!pairs.length) return;

    // choose 2-10 pairs to flip each time
    const count = Math.max(2, Math.min(10, Math.floor(rand(2, 10.9))));
    const picks = new Set();
    for(let i=0;i<count;i++){
      picks.add(pairs[Math.floor(Math.random()*pairs.length)]);
    }

    for(const sp of picks){
      if(!sp) continue;
      const mode = "spinZ";
      sp.classList.add("weird", mode);
      setTimeout(()=>{
        sp.classList.remove("weird", mode);
      }, Math.floor(rand(180, 420)));
    }
  }

  function noiseBurst(){
    const pairs = collectPairs();
    if(!pairs.length) return;

    // choose 1-4 spans to "noise"
    const count = Math.max(1, Math.min(4, Math.floor(rand(1, 4.6))));
    const picks = new Set();
    for(let i=0;i<count;i++){
      picks.add(pairs[Math.floor(Math.random()*pairs.length)]);
    }

    for(const sp of picks){
      if(!sp) continue;
      sp.classList.add("noise");
      // revert quickly
      setTimeout(()=>{
        sp.classList.remove("noise");
      }, Math.floor(rand(160, 520)));
    }
  }

  // initial
  jitter();

  // baseline
  setInterval(jitter, 1700);
  // flips and noise (staggered)
  setInterval(flipPairsOnce, 900);
  setInterval(noiseBurst, 650);

})();
