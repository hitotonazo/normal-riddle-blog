
// Applies a gentle-but-unsettling "wrongness" to text on back.html without breaking the layout.
(function(){
  if(!document.body.classList.contains("back")) return;

  const targets = Array.from(document.querySelectorAll(".ptitle, .excerpt, .pmeta, .tag, .breadcrumb, .article"));
  const rand = (a,b)=> a + Math.random()*(b-a);

  // baseline jitter (rare updates)
  function jitter(){
    for(const el of targets){
      const x = rand(-0.8, 0.8);
      const y = rand(-0.5, 0.5);
      const r = rand(-0.2, 0.2);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }
  }

  // occasional flips (brief, then revert)
  function flipOnce(){
    // choose a few elements to flip
    const count = Math.max(1, Math.min(4, Math.floor(rand(1, 4.8))));
    const picks = [];
    for(let i=0;i<count;i++){
      const el = targets[Math.floor(Math.random()*targets.length)];
      if(el && !picks.includes(el)) picks.push(el);
    }

    for(const el of picks){
      // pick a flip style
      const modes = ["flipX", "flipY", "flipXY", "tilt"];
      const mode = modes[Math.floor(Math.random()*modes.length)];
      el.classList.add("weird", mode);
      // revert quickly
      setTimeout(()=>{
        el.classList.remove("weird", mode);
      }, Math.floor(rand(220, 520)));
    }
  }

  jitter();
  setInterval(jitter, 1600);          // slow baseline movement
  setInterval(flipOnce, 2400);        // occasional flips
})();
