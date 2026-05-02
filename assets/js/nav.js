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
