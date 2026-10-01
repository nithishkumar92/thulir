// Shared navbar behaviour for every page: scroll shadow and mobile menu.
(function () {
  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (!navbar || !hamburger || !navLinks) return;

  function setMenu(open) {
    hamburger.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger.addEventListener('click', function () {
    setMenu(!navLinks.classList.contains('active'));
  });

  // Close on outside click, link click, Escape, or when resized to desktop
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) setMenu(false);
  });
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) setMenu(false);
  });
})();
