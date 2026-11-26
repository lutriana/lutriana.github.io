/*
  FX — playful motion & interactions
  - Titles split into letters: they rise in on scroll, hop on hover
    and lean away from the cursor when it passes near.
  - Sparkle trail + cursor ring that grows over links.
  - 3D tilt on windows/cards, parallax stickers in the hero.
  - Draggable desktop folders (click still opens them).
  - Terminal types itself, arrows draw themselves, click = star burst.
  Everything that moves is skipped with prefers-reduced-motion,
  and mouse-only effects are skipped on touch screens.
*/
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const COLORS = ['#5F8FC4', '#FF8AE6', '#F6C445', '#8FB6E6', '#B77EE3'];

  /* ---------- 1. Split titles into letters ---------- */
  const titles = document.querySelectorAll('.hero-hi, .display');
  const letters = [];

  titles.forEach((title) => {
    const text = title.textContent.trim().replace(/\s+/g, ' ');
    title.setAttribute('aria-label', text);
    title.textContent = '';
    let i = 0;

    text.split(' ').forEach((word, w, words) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      wordEl.setAttribute('aria-hidden', 'true');

      [...word].forEach((char) => {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', i++);
        const inner = document.createElement('span');
        inner.className = 'ch-in';
        inner.textContent = char;
        ch.appendChild(inner);
        wordEl.appendChild(ch);
        letters.push(inner);

        // hop on hover
        ch.addEventListener('mouseenter', () => {
          ch.classList.remove('hop');
          void ch.offsetWidth; // restart animation
          ch.classList.add('hop');
        });
        ch.addEventListener('animationend', () => ch.classList.remove('hop'));
      });

      title.appendChild(wordEl);
      if (w < words.length - 1) title.appendChild(document.createTextNode(' '));
    });

    title.classList.add('split');
  });

  // letters rise in when the title scrolls into view
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    titles.forEach((t) => io.observe(t));
  } else {
    titles.forEach((t) => t.classList.add('is-in'));
  }

  /* ---------- 2. Terminal types itself ---------- */
  const terminal = document.querySelector('.terminal');
  if (terminal && !reduce) {
    const lines = [...terminal.querySelectorAll('p')];
    const caret = terminal.querySelector('.caret');
    const plan = lines.map((p) => {
      const prompt = p.querySelector('.prompt');
      const text = [...p.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      return { p, prompt, text };
    });

    lines.forEach((p) => { p.style.visibility = 'hidden'; });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      await sleep(500);
      for (const { p, prompt, text } of plan) {
        p.textContent = '';
        p.style.visibility = 'visible';
        if (prompt) {
          p.appendChild(prompt);
          const node = document.createTextNode('');
          p.appendChild(node);
          if (caret) p.appendChild(caret);
          for (const char of ' ' + text) {
            node.textContent += char;
            await sleep(45 + Math.random() * 60);
          }
          await sleep(260);
        } else {
          p.textContent = text;
          if (caret) p.appendChild(caret);
          await sleep(220);
        }
      }
    })();
  }

  /* ---------- 3. Arrows draw themselves ---------- */
  document.querySelectorAll('.arrow path').forEach((path) => path.setAttribute('pathLength', '1'));

  if (reduce || !finePointer) return;

  /* ---------- 4. Cursor ring + sparkle trail ---------- */
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  let mx = -100, my = -100, rx = -100, ry = -100;
  let lastSpark = 0;
  let dirty = true;
  window.addEventListener('scroll', () => { dirty = true; }, { passive: true });
  const GLYPHS = ['✦', '★', '♡', '✧', '·'];

  const spawnSpark = (x, y, burst = false) => {
    const s = document.createElement('span');
    s.className = 'spark' + (burst ? ' spark--burst' : '');
    s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = burst ? 50 + Math.random() * 60 : 10 + Math.random() * 20;
    s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--dy', (Math.sin(angle) * dist + (burst ? 0 : 24)) + 'px');
    s.style.setProperty('--rot', (Math.random() * 240 - 120) + 'deg');
    s.style.fontSize = (burst ? 14 : 10) + Math.random() * 10 + 'px';
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  };

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dirty = true;
    const now = performance.now();
    if (now - lastSpark > 45) {
      lastSpark = now;
      spawnSpark(mx, my);
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    for (let k = 0; k < 10; k++) spawnSpark(e.clientX, e.clientY, true);
  });

  document.addEventListener('pointerover', (e) => {
    ring.classList.toggle('is-link', !!e.target.closest('a, button, .folder, .dock-tile'));
  });
  document.addEventListener('pointerleave', () => ring.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => ring.classList.remove('is-hidden'));

  /* ---------- 5. Letters lean away from the cursor ---------- */
  const RADIUS = 130;
  const visibleTitles = new Set();
  const tio = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visibleTitles.add(e.target) : visibleTitles.delete(e.target)));
  });
  titles.forEach((t) => tio.observe(t));

  const pushLetters = () => {
    visibleTitles.forEach((title) => {
      title.querySelectorAll('.ch-in').forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS) {
          const f = (1 - d / RADIUS) ** 2;
          const scale = Math.min(r.height / 100, 1.4);
          el.style.setProperty('--x', (dx / (d || 1)) * f * 26 * scale + 'px');
          el.style.setProperty('--y', (dy / (d || 1)) * f * 26 * scale + 'px');
          el.style.setProperty('--r', (dx > 0 ? 1 : -1) * f * 18 + 'deg');
          el.classList.add('is-near');
        } else if (el.classList.contains('is-near')) {
          el.style.setProperty('--x', '0px');
          el.style.setProperty('--y', '0px');
          el.style.setProperty('--r', '0deg');
          el.classList.remove('is-near');
        }
      });
    });
  };

  /* ---------- 6. Hero parallax ---------- */
  const hero = document.querySelector('.hero');
  const layers = [
    ['.hero-hi', -14], ['.hero-intro', 12], ['.sticker--heart', 28], ['.sticker--rocket', -30], ['.dock', 6],
  ].map(([sel, depth]) => [document.querySelector(sel), depth]).filter(([el]) => el);

  const parallax = () => {
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    const px = (mx / window.innerWidth - 0.5);
    const py = (my / window.innerHeight - 0.5);
    layers.forEach(([el, depth]) => {
      el.style.translate = `${px * depth}px ${py * depth}px`;
    });
  };

  /* ---------- 7. 3D tilt ---------- */
  const tiltEls = document.querySelectorAll('.hero-window, .mock, .box, .device, .mail-window, .notes-card, .paper-note, .polaroid');
  tiltEls.forEach((el) => {
    el.classList.add('tilt');
    if (el.parentElement) el.parentElement.style.perspective = '900px';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const angle = Math.min(Math.hypot(x, y) * 22, 12);
      el.style.rotate = `${-y} ${x} 0 ${angle}deg`;
      el.style.setProperty('--glare-x', (x + 0.5) * 100 + '%');
      el.style.setProperty('--glare-y', (y + 0.5) * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.rotate = ''; });
  });

  /* ---------- 8. Magnetic buttons ---------- */
  document.querySelectorAll('.send-btn, .project-link, .status-btn, .nav-link').forEach((el) => {
    el.classList.add('magnetic');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.3}px ${(e.clientY - r.top - r.height / 2) * 0.4}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  /* ---------- 9. Draggable desktop folders ---------- */
  document.querySelectorAll('.folder').forEach((folder) => {
    let startX, startY, originX, originY, dragging = false, moved = false;

    folder.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const parent = folder.offsetParent.getBoundingClientRect();
      const r = folder.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      originX = r.left - parent.left;
      originY = r.top - parent.top;
      dragging = true;
      moved = false;
      folder.setPointerCapture(e.pointerId);
    });

    folder.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) {
        moved = true;
        folder.classList.add('is-dragging');
        folder.style.right = 'auto';
        folder.style.bottom = 'auto';
      }
      folder.style.left = originX + dx + 'px';
      folder.style.top = originY + dy + 'px';
    });

    const end = () => {
      dragging = false;
      folder.classList.remove('is-dragging');
    };
    folder.addEventListener('pointerup', end);
    folder.addEventListener('pointercancel', end);

    // a drag is not a click
    folder.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        moved = false;
      }
    });
    folder.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- main loop ---------- */
  const loop = () => {
    rx += (mx - rx) * 0.2;
    ry += (my - ry) * 0.2;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    if (dirty) {
      dirty = false;
      pushLetters();
      parallax();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
