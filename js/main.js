document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Dark/Light Mode)
  //    The initial theme is applied by the small inline script in <head>
  //    so the page never flashes light before switching to dark.
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  const updateToggleLabel = () => {
    const isDark = htmlElement.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  updateToggleLabel();

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      /* storage blocked: theme still switches for this visit */
    }
    updateToggleLabel();
  });

  // 2. Mobile Navigation Toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const setMenu = (open) => {
    navMenu.classList.toggle('active', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };

  hamburger.addEventListener('click', () => {
    setMenu(!navMenu.classList.contains('active'));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      setMenu(false);
      hamburger.focus();
    }
  });
});
