document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;

  // 1. Theme (initial theme is applied by the inline script in <head>)
  const themeToggle = document.getElementById('theme-toggle');

  const updateToggleLabel = () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  updateToggleLabel();

  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    updateToggleLabel();
  });

  // 2. Mobile menu (the menu-bar links become a dropdown)
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  const setMenu = (open) => {
    navMenu.classList.toggle('active', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };

  hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
  document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      setMenu(false);
      hamburger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      setMenu(false);
    }
  });

  // 3. Menu-bar clock, macOS style: "Thu 26 Nov 10:30"
  const clock = document.getElementById('clock');
  const tick = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    clock.textContent = `${day.replace(',', '')} ${time}`;
    clock.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 15000);

  // 3b. Battery: real level where the browser exposes it (Chromium), else 100 %
  const pct = document.getElementById('battery-pct');
  const level = document.getElementById('battery-level');
  const showBattery = (value, charging) => {
    const p = Math.round(value * 100);
    pct.textContent = `${p} %`;
    level.style.width = `${Math.max(p, 8)}%`;
    pct.parentElement.classList.toggle('is-charging', charging);
  };
  if (navigator.getBattery) {
    navigator.getBattery().then((b) => {
      const update = () => showBattery(b.level, b.charging);
      update();
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
    }).catch(() => {});
  }

  // 3b. Dock scroll hint: on narrow screens the dock scrolls sideways,
  // so fade the edges that hide icons and show an arrow while there's more
  const dock = document.querySelector('.dock');
  const dockList = dock && dock.querySelector('ul');
  const dockMore = dock && dock.querySelector('.dock-more');
  if (dockList) {
    const updateDock = () => {
      const max = dockList.scrollWidth - dockList.clientWidth;
      dock.classList.toggle('can-left', dockList.scrollLeft > 2);
      dock.classList.toggle('can-right', dockList.scrollLeft < max - 2);
    };
    dockList.addEventListener('scroll', updateDock, { passive: true });
    window.addEventListener('resize', updateDock);
    window.addEventListener('load', updateDock);
    updateDock();
    if (dockMore) {
      dockMore.addEventListener('click', () => {
        dockList.scrollBy({ left: dockList.clientWidth * 0.7, behavior: 'smooth' });
      });
    }
  }

  // 4. Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // 5. Reveal on scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-visible'));
  }
});
