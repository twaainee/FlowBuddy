function toggleNav() {
  document.getElementById('nav-drawer')?.classList.toggle('open');
}

document.addEventListener('click', (event) => {
  const drawer = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer || !hamburger) return;

  if (!hamburger.contains(event.target) && !drawer.contains(event.target)) {
    drawer.classList.remove('open');
  }
});

// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
});
