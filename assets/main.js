/* Shared site behaviour: scroll-reveal animations */
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!els.length || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('in'); obs.unobserve(entry.target); }
    });
  }, {threshold:0.12});
  els.forEach(function(el){ obs.observe(el); });
})();
