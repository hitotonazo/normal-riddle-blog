
// Applies a gentle "wrongness" to text on back.html without breaking readability.
(function(){
  if(!document.body.classList.contains("back")) return;

  const targets = Array.from(document.querySelectorAll(".ptitle, .excerpt, .pmeta, .tag, .breadcrumb"));
  const rand = (a,b)=> a + Math.random()*(b-a);

  function tick(){
    for(const el of targets){
      // small jitter and micro-rotate
      const x = rand(-0.6, 0.6);
      const y = rand(-0.4, 0.4);
      const r = rand(-0.15, 0.15);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }
  }
  tick();
  // update occasionally, not constantly (keeps CPU low)
  setInterval(tick, 1400);
})();
