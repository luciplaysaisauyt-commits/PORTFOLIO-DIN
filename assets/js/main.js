/* ============================================================
   MAIN.JS — shared across all pages
   ============================================================ */
(() => {

  const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    || ('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0);

  // ── PAGE ENTER ANIMATION HOOK ──
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
  });

  // ── LOAD HEADER ──
  // Определяем правильный путь к header.html
  // (страницы в /portfolio/ должны брать ../header.html)
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const headerPath = depth > 1 ? '../header.html' : 'header.html';

  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch(headerPath)
      .then(r => r.text())
      .then(html => {
        headerPlaceholder.outerHTML = html;  // заменяем placeholder целиком
        initNav();
      })
      .catch(() => {
        // Если fetch не сработал — пробуем /header.html (абсолютный)
        fetch('/header.html')
          .then(r => r.text())
          .then(html => { document.getElementById('header-placeholder').outerHTML = html; initNav(); });
      });
  } else {
    initNav();
  }

  function initNav() {
    // ── MOBILE MENU ──
    const burger      = document.getElementById('burger');
    const mobileMenu  = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');

    if (burger && mobileMenu)
      burger.addEventListener('click', () => mobileMenu.classList.add('open'));
    if (mobileClose && mobileMenu)
      mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    if (mobileMenu)
      mobileMenu.addEventListener('click', e => {
        if (e.target === mobileMenu) mobileMenu.classList.remove('open');
      });

    // ── NAV SHRINK ON SCROLL ──
    const nav = document.getElementById('topnav');
    if (nav) {
      // iOS fix: принудительно держим fixed через translateZ
      nav.style.webkitTransform = 'translateZ(0)';
      nav.style.transform = 'translateZ(0)';

      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Выставляем CSS переменную --navH
      const setNavH = () => {
        document.documentElement.style.setProperty('--navH', nav.offsetHeight + 'px');
      };
      setNavH();
      window.addEventListener('resize', setNavH);
    }

    // ── ACTIVE NAV LINK ──
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu a, .mobile-menu-links a').forEach(link => {
      link.classList.remove('active');
      const href     = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      if (!linkPage) return;
      if (linkPage === page) { link.classList.add('active'); return; }
      if (
        (page === '' || page === 'index.html') &&
        (linkPage === 'index.html' || href === '/' || href === '../' || href === './')
      ) link.classList.add('active');
    });
  }

  // ── CONTACT FORM POPUP ──
  const form       = document.getElementById('contactForm');
  const popup      = document.getElementById('popup');
  const popupClose = document.getElementById('popupClose');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.send-btn');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = {
        firstName: document.getElementById('firstName').value,
        lastName:  document.getElementById('lastName').value,
        email:     document.getElementById('email').value,
        message:   document.getElementById('message').value
      };

      const EMAILJS_PUBLIC_KEY  = 'mJztgAOONni1NaDaq';
      const EMAILJS_SERVICE_ID  = 'service_ewg5w2n';
      const EMAILJS_TEMPLATE_ID = 'template_ce4qo7t';
      const TG_BOT_TOKEN        = '8249291699:AAFCpn9TC5wOHHL5RJbGVubgMCyOL3lu4T4';
      const TG_CHAT_ID          = '1525265767';

      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID, template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: { ...data }
          })
        });

        const tgText = `New message!\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: tgText })
        });

        form.reset();
        if (popup) popup.classList.add('show');
      } catch {
        alert('Connection error. Check your internet.');
      } finally {
        btn.innerHTML = `Send Message <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
        btn.disabled = false;
      }
    });
  }

  if (popupClose && popup) {
    popupClose.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', e => { if (e.target === popup) popup.classList.remove('show'); });
  }

  // ── NEWSLETTER ──
  const nlForm  = document.getElementById('newsletterForm');
  const nlEmail = document.getElementById('newsletterEmail');
  if (nlForm) {
    nlForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = nlEmail ? nlEmail.value : '';
      if (email) {
        await fetch(`https://api.telegram.org/bot8249291699:AAFCpn9TC5wOHHL5RJbGVubgMCyOL3lu4T4/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '1525265767', text: `📧 New subscriber: ${email}` })
        });
      }
      if (nlEmail) nlEmail.value = '';
    });
  }

  // ── FADE-UP (.fu -> .vis) ──
  const fuEls = document.querySelectorAll('.fu');
  if (fuEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05 });

    fuEls.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('vis');
      } else {
        io.observe(el);
      }
    });
  }

  // ── COUNTER ANIMATION ──
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();
    const isFloat = target % 1 !== 0;
    function tick(now) {
      const p   = Math.min((now - start) / dur, 1);
      const val = (1 - Math.pow(1 - p, 3)) * target;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterEls = document.querySelectorAll('[data-target]');
  if (counterEls.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cio.observe(el));
  }

  // ── CUSTOM CURSOR ──
  const cursor     = document.getElementById('dinCursor');
  const cursorRing = document.getElementById('dinCursorRing');
  if (cursor && cursorRing && !isTouch) {
    let mx = -999, my = -999, rx = -999, ry = -999, moved = false;
    cursor.style.cssText    = 'left:-999px;top:-999px;opacity:0';
    cursorRing.style.cssText = 'left:-999px;top:-999px;opacity:0';

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
      if (!moved) { moved = true; cursor.style.opacity = '1'; cursorRing.style.opacity = '1'; }
    });
    (function animRing() {
      rx += (mx - rx) * 0.09; ry += (my - ry) * 0.09;
      cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  // ── CASE SUBNAV ──
  (() => {
    const subnav = document.querySelector('[data-case-subnav]');
    if (!subnav) return;
    document.body.classList.add('has-case-subnav');

    const setSubnavH = () =>
      document.documentElement.style.setProperty('--caseSubnavH', subnav.offsetHeight + 'px');
    setSubnavH();
    window.addEventListener('resize', setSubnavH);

    const subLinks = subnav.querySelectorAll("a[href^='#']");
    const sections = document.querySelectorAll('.case-section[id]');

    if (subLinks.length && sections.length) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          subLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        });
      }, { threshold: 0.2 }).observe
      ;
      sections.forEach(s => {
        new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            subLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
          });
        }, { threshold: 0.2 }).observe(s);
      });
    }

    subLinks.forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href?.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navH'))  || 0;
        const subH  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--caseSubnavH')) || 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - subH - 24, behavior: 'smooth' });
      });
    });
  })();

  // ── VISIT NOTIFICATION ──
  (async () => {
    const page   = window.location.pathname;
    const ref    = document.referrer ? `\nОткуда: ${document.referrer}` : '\nОткуда: прямой заход';
    const device = /Mobi|Android/i.test(navigator.userAgent) ? '📱 Мобильный' : '🖥 Десктоп';
    const lang   = navigator.language || '—';
    const time   = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const text   = `👁 Новый посетитель!\n\nСтраница: ${page}\n${ref}\nУстройство: ${device}\nЯзык: ${lang}\nВремя (МСК): ${time}`;
    await fetch(`https://api.telegram.org/bot8249291699:AAFCpn9TC5wOHHL5RJbGVubgMCyOL3lu4T4/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: '1525265767', text })
    });
  })();

})();


/* ============================================================
   LIGHTBOX
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const modal    = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');
  if (!modal || !modalImg) return;

  const openModal = (src, alt = '') => {
    modalImg.src = src; modalImg.alt = alt;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.style.overflow = '';
  };

  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const target = e.target.closest('[data-lightbox]');
    if (!target) return;
    if (target.tagName === 'IMG') { openModal(target.currentSrc || target.src, target.alt); return; }
    const src = target.getAttribute('data-src') || target.getAttribute('href');
    if (src) openModal(src, target.getAttribute('aria-label') || '');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Кликабельные изображения
  document.querySelectorAll('.screen-card img, .ba-card img, .hero-img-wrap img, .uikit-img img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openModal(img.src, img.alt));
  });

  window.openLightbox = src => {
    const full = (src.startsWith('/') || src.startsWith('http')) ? src : '/images/clm/' + src;
    if (modalImg && modal) openModal(full);
  };
});


/* ============================================================
   SCROLL REVEAL + PROGRESS BAR
   ============================================================ */
(() => {
  // Progress bar
  const bar = document.getElementById('progressBar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) bar.style.width = (window.scrollY / total * 100) + '%';
    }, { passive: true });
  }

  // [data-reveal]
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); ro.unobserve(e.target); } });
  }, { threshold: 0.07 });
  document.querySelectorAll('[data-reveal]').forEach(el => ro.observe(el));
})();


/* ============================================================
   MUSIC PLAYER
   ============================================================ */
(() => {
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic  = document.getElementById('bgMusic');
  if (!musicBtn || !bgMusic) return;

  const NS = 'bgmusic';
  const LS = {
    get(k, fb = null) { try { const v = localStorage.getItem(`${NS}:${k}`); return v ?? fb; } catch { return fb; } },
    set(k, v)         { try { localStorage.setItem(`${NS}:${k}`, String(v)); } catch {} }
  };

  const playlist = [
    {
      title: 'Piano I',
      sources: [
        '/assets/music/videoplayback_2.flac',
        '/assets/music/videoplayback_1.m4a',
        '/assets/music/videoplayback_1.mp3'
      ]
    }
  ];

  let currentTrack = Math.max(0, Math.min(parseInt(LS.get('trackIndex', '0'), 10) || 0, playlist.length - 1));
  const savedTime  = parseFloat(LS.get('time', '0')) || 0;
  const wasPlaying = LS.get('playing', 'false') === 'true';

  const TARGET_VOL = 0.12;
  const FADE_MS    = 250;
  bgMusic.volume   = 0;
  bgMusic.preload  = 'metadata';

  function setTrack(index) {
    index = (index + playlist.length) % playlist.length;
    currentTrack = index;
    bgMusic.pause();
    bgMusic.removeAttribute('src');
    while (bgMusic.firstChild) bgMusic.removeChild(bgMusic.firstChild);
    playlist[index].sources.forEach(src => {
      const s = document.createElement('source');
      s.src = src;
      if (src.endsWith('.flac')) s.type = 'audio/flac';
      if (src.endsWith('.m4a'))  s.type = 'audio/mp4';
      if (src.endsWith('.mp3'))  s.type = 'audio/mpeg';
      bgMusic.appendChild(s);
    });
    LS.set('trackIndex', index);
    LS.set('time', 0);
    try { bgMusic.load(); } catch {}
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: playlist[index].title || 'Music' });
    }
  }

  function fadeTo(target, ms = FADE_MS) {
    return new Promise(resolve => {
      const start = performance.now(), from = bgMusic.volume, diff = target - from;
      function step(t) {
        const p = Math.min(1, (t - start) / ms);
        bgMusic.volume = from + diff * p;
        if (p < 1) requestAnimationFrame(step); else { bgMusic.volume = target; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  function updateBtn(playing) {
    musicBtn.textContent = playing ? '🔊' : '🎵';
    musicBtn.classList.toggle('playing', playing);
  }

  async function safePlay() {
    try { await bgMusic.play(); await fadeTo(TARGET_VOL); updateBtn(true); LS.set('playing', true); return true; }
    catch { updateBtn(false); LS.set('playing', false); return false; }
  }

  bgMusic.addEventListener('loadedmetadata', () => {
    if (savedTime > 0 && savedTime < (bgMusic.duration || Infinity)) bgMusic.currentTime = savedTime;
  }, { once: true });

  bgMusic.addEventListener('canplay', async () => {
    if (wasPlaying) await safePlay(); else updateBtn(false);
  }, { once: true });

  let lastSave = 0;
  bgMusic.addEventListener('timeupdate', () => {
    const now = performance.now();
    if (now - lastSave > 900 && !bgMusic.paused) { LS.set('time', bgMusic.currentTime); lastSave = now; }
  });

  bgMusic.addEventListener('ended', async () => {
    LS.set('time', 0); setTrack(currentTrack + 1);
    try { await bgMusic.play(); updateBtn(true); } catch { updateBtn(false); }
  });

  musicBtn.addEventListener('click', async () => {
    if (bgMusic.paused) await safePlay();
    else { await fadeTo(0); bgMusic.pause(); updateBtn(false); LS.set('playing', false); }
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play',  async () => { if (bgMusic.paused) await safePlay(); });
    navigator.mediaSession.setActionHandler('pause', async () => { await fadeTo(0); bgMusic.pause(); updateBtn(false); LS.set('playing', false); });
  }

  setTrack(currentTrack);
})();