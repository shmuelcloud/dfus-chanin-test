/* Hamburger menu */
function toggleMenu(){
  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('mobileNav');
  if(!btn || !nav) return;
  var open = nav.classList.toggle('open');
  btn.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
// Close menu on nav link click
document.addEventListener('DOMContentLoaded', function(){
  var links = document.querySelectorAll('.mobile-nav a');
  links.forEach(function(a){
    a.addEventListener('click', function(){
      var nav = document.getElementById('mobileNav');
      var btn = document.getElementById('hamburger');
      if(nav) nav.classList.remove('open');
      if(btn) btn.classList.remove('open');
      document.body.style.overflow = '';
    });
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
