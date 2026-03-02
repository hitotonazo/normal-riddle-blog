(function(){
  const KEY = "takumi_font";
  const DEFAULT = "md"; // sm | md | lg

  function apply(size){
    const s = (size==="sm"||size==="md"||size==="lg") ? size : DEFAULT;
    document.documentElement.setAttribute("data-font", s);
    try{ localStorage.setItem(KEY, s); }catch(e){}
    document.querySelectorAll(".font-btn").forEach(btn=>{
      const on = btn.getAttribute("data-font") === s;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function init(){
    let saved = DEFAULT;
    try{ saved = localStorage.getItem(KEY) || DEFAULT; }catch(e){}
    apply(saved);

    document.querySelectorAll(".font-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        apply(btn.getAttribute("data-font") || DEFAULT);
      });
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();
