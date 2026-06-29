/* Hamburger menu */
function toggleMenu(){
  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('mobileNav');
  if(!btn || !nav) return;
  var open = nav.classList.toggle('open');
  btn.classList.toggle('open', open);
}
document.addEventListener('DOMContentLoaded', function(){
  // Close on link click
  document.querySelectorAll('.mobile-nav a').forEach(function(a){
    a.addEventListener('click', function(){
      var nav = document.getElementById('mobileNav');
      var btn = document.getElementById('hamburger');
      if(nav) nav.classList.remove('open');
      if(btn) btn.classList.remove('open');
    });
  });
  // Close when clicking outside
  document.addEventListener('click', function(e){
    var nav = document.getElementById('mobileNav');
    var btn = document.getElementById('hamburger');
    if(!nav || !nav.classList.contains('open')) return;
    if(!nav.contains(e.target) && e.target !== btn && !btn.contains(e.target)){
      nav.classList.remove('open');
      btn.classList.remove('open');
    }
  });
});

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
