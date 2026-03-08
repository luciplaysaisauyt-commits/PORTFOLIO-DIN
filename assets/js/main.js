/* ============================================================
   MAIN.JS — shared across all pages
   ============================================================ */
(() => {

  const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ── PAGE ENTER ANIMATION HOOK ──
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
  });

  // ── LOAD HEADER ──
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch('header.html')
      .then(r => r.text())
      .then(html => {
        headerPlaceholder.innerHTML = html;

        // ── MOBILE MENU (после загрузки хедера) ──
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
          const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
          window.addEventListener('scroll', onScroll);
          onScroll();
        }

        // ── ACTIVE NAV LINK ──
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.menu a, .mobile-menu-links a').forEach(link => {
          link.classList.remove('active');
          const href = link.getAttribute('href') || '';
          const linkPage = href.split('/').pop();
          if (!linkPage) return;
          if (linkPage === page) { link.classList.add('active'); return; }
          if (
            (page === '' || page === 'index.html') &&
            (linkPage === 'index.html' || href === '/' || href === '../' || href === './')
          ) {
            link.classList.add('active');
          }
        });
      });
  } else {
    // Хедер уже в HTML (не через placeholder)
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

    const nav = document.getElementById('topnav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
      window.addEventListener('scroll', onScroll);
      onScroll();
    }

    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu a, .mobile-menu-links a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      if (!linkPage) return;
      if (linkPage === page) { link.classList.add('active'); return; }
      if (
        (page === '' || page === 'index.html') &&
        (linkPage === 'index.html' || href === '/' || href === '../' || href === './')
      ) {
        link.classList.add('active');
      }
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
            service_id:  EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id:     EMAILJS_PUBLIC_KEY,
            template_params: {
              firstName: data.firstName,
              lastName:  data.lastName,
              email:     data.email,
              message:   data.message
            }
          })
        });

        const tgText = `New message from your site!\n\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: tgText })
        });

        form.reset();
        if (popup) popup.classList.add('show');

      } catch (err) {
        alert('Connection error. Check your internet.');
      } finally {
        btn.innerHTML = `Send Message <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
        btn.disabled = false;
      }
    });
  }

  if (popupClose && popup) {
    popupClose.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', e => {
      if (e.target === popup) popup.classList.remove('show');
    });
  }

  // ── NEWSLETTER ──
  const nlForm  = document.getElementById('newsletterForm');
  const nlEmail = document.getElementById('newsletterEmail');
  if (nlForm) {
    nlForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = nlEmail ? nlEmail.value : '';
      if (email) {
        const TG_BOT_TOKEN = '8249291699:AAFCpn9TC5wOHHL5RJbGVubgMCyOL3lu4T4';
        const TG_CHAT_ID   = '1525265767';
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: `📧 New subscriber: ${email}` })
        });
      }
      if (nlEmail) nlEmail.value = '';
    });
  }

  // ── SCROLL-TO-TOP ──
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── FADE-UP (.fu -> .vis) ──
const fuEls = document.querySelectorAll('.fu');
if (fuEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  fuEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('vis'); // уже видно — сразу показать
    } else {
      io.observe(el);
    }
  });
}

  // ── FADE-UP (.fade-up -> .visible) ──
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io2.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io2.observe(el));
  }

  // ── COUNTER ANIMATION ──
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();
    const isFloat= target % 1 !== 0;
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
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cio.observe(el));
  }

  // ── CUSTOM CURSOR ──
  const cursor     = document.getElementById('dinCursor');
  const cursorRing = document.getElementById('dinCursorRing');
  if (cursor && cursorRing && !isTouch) {
    let mx = -999, my = -999, rx = -999, ry = -999;
    let moved = false;

    cursor.style.left = '-999px';
    cursor.style.top  = '-999px';
    cursorRing.style.left = '-999px';
    cursorRing.style.top  = '-999px';
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      if (!moved) {
        moved = true;
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    });

    (function animRing() {
      rx += (mx - rx) * 0.09;
      ry += (my - ry) * 0.09;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  /* ============================================================
   CASE SUBNAV UNIVERSAL
   ============================================================ */
  (() => {
    const nav = document.getElementById("topnav");

    const setNavH = () => {
      if (!nav) return;
      document.documentElement.style.setProperty("--navH", nav.offsetHeight + "px");
    };

    setNavH();
    window.addEventListener("resize", setNavH);

    const subnav = document.querySelector("[data-case-subnav]");
    if (!subnav) return;

    document.body.classList.add("has-case-subnav");

    const setSubnavH = () => {
      document.documentElement.style.setProperty("--caseSubnavH", subnav.offsetHeight + "px");
    };

    setSubnavH();
    window.addEventListener("resize", setSubnavH);

    const subLinks = subnav.querySelectorAll("a[href^='#']");
    const sections = document.querySelectorAll(".case-section[id]");

    if (subLinks.length && sections.length) {
      const secObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          subLinks.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("href") === "#" + id);
          });
        });
      }, { threshold: 0.2 });

      sections.forEach((s) => secObs.observe(s));
    }

    subLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navH")) || 0;
        const subH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--caseSubnavH")) || 0;

        const offset = navH + subH + 24;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  })();

  window.caseSubscribe = function(form){
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');

    if (!input || !btn) return;

    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = 'rgba(255,80,80,0.7)';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }

    input.value = '';
    const orig = btn.textContent;
    btn.textContent = 'Done ✓';
    btn.style.background = 'rgba(34,197,94,0.95)';
    btn.style.borderColor = 'rgba(34,197,94,0.95)';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 2500);
  };

  // ── VISIT NOTIFICATION ──
  (async () => {
    const TG_BOT_TOKEN = '8249291699:AAFCpn9TC5wOHHL5RJbGVubgMCyOL3lu4T4';
    const TG_CHAT_ID   = '1525265767';

    const pag   = window.location.pathname;
    const ref    = document.referrer ? `\nОткуда: ${document.referrer}` : '\nОткуда: прямой заход';
    const device = /Mobi|Android/i.test(navigator.userAgent) ? '📱 Мобильный' : '🖥 Десктоп';
    const lang   = navigator.language || '—';
    const time   = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    const text = `👁 Новый посетитель!\n\nСтраница: ${page}\n${ref}\nУстройство: ${device}\nЯзык: ${lang}\nВремя (МСК): ${time}`;

    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
    });
  })();

})();


/* ============================================================
   LIGHTBOX
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');
  if (!modal || !modalImg) return;

  const openModal = (src, alt = '') => {
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) { closeModal(); return; }

    const target = e.target.closest('[data-lightbox]');
    if (!target) return;

    if (target.tagName === 'IMG') {
      openModal(target.currentSrc || target.src, target.alt || '');
      return;
    }

    const src = target.getAttribute('data-src') || target.getAttribute('href');
    if (src) openModal(src, target.getAttribute('aria-label') || '');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

// Mark JS as loaded
document.documentElement.classList.add('js-ready');

// nav height CSS var
const nav = document.getElementById('topnav');
if (nav) {
  const setNavH = () => {
    document.documentElement.style.setProperty('--navH', nav.offsetHeight + 'px');
  };
  setNavH();
  window.addEventListener('resize', setNavH);
}

(() => {
  // progress bar
  const bar = document.getElementById('progressBar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      bar.style.width = (window.scrollY / total * 100) + '%';
    }, { passive: true });
  }

  // scroll reveal
  const ro = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('revealed');
      ro.unobserve(e.target);
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('[data-reveal]').forEach((el) => ro.observe(el));

  // subnav + toc active state
  const tocLinks = document.querySelectorAll('.case-toc a');
  const subLinks = document.querySelectorAll('.subnav-pill a, .case-subnav-pill a');

  if (tocLinks.length || subLinks.length) {
    const secObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        [...tocLinks, ...subLinks].forEach((l) => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.case-section[id]').forEach((s) => secObs.observe(s));
  }

  // lightbox
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');

  if (modal && modalImg) {
    document.querySelectorAll('.screen-card img, .ba-card img, .hero-img-wrap img, .uikit-img img').forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      });
    });

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  window.openLightbox = function (src) {
    const full = (src.startsWith('/') || src.startsWith('http')) ? src : '/images/clm/' + src;
    if (modalImg && modal) {
      modalImg.src = full;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }
  };


 // ── MUSIC PLAYLIST (enhanced) ─────────────────────────────────────────────
(() => {
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic  = document.getElementById('bgMusic');
  if (!musicBtn || !bgMusic) return;

  // Namespace для storage
  const NS = 'bgmusic';
  const LS = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(`${NS}:${key}`); return v ?? fallback; }
      catch { return fallback; }
    },
    set(key, val) { try { localStorage.setItem(`${NS}:${key}`, String(val)); } catch {} },
    del(key)      { try { localStorage.removeItem(`${NS}:${key}`); } catch {} }
  };

  // Плейлист: каждый трек может иметь несколько источников (flac/m4a/mp3)
  // Браузер сам возьмёт первый поддерживаемый.
  const playlist = [
    {
      title: 'Piano I',
      sources: [
        '/assets/music/videoplayback_2.flac', // Hi‑Fi для Chrome/Firefox
        '/assets/music/videoplayback_1.m4a',  // Fallback для Safari/iOS
        '/assets/music/videoplayback_1.mp3'   // Универсальный fallback
      ]
    }
    // Можешь добавить ещё треки по этому же шаблону
  ];

  // ── State
  let currentTrack = parseInt(LS.get('trackIndex', '0'), 10) || 0;
  currentTrack = Math.max(0, Math.min(currentTrack, playlist.length - 1));
  const savedTime  = parseFloat(LS.get('time', '0')) || 0;
  const wasPlaying = LS.get('playing', 'false') === 'true';

  // ── Audio defaults
  const TARGET_VOL = 0.12;  // целевая громкость
  const FADE_MS    = 250;   // длительность fade in/out
  bgMusic.volume   = 0;     // начнём с 0 для фейда
  bgMusic.preload  = 'metadata';

  // Установить источники для текущего трека
  function setTrack(index) {
    index = (index + playlist.length) % playlist.length;
    currentTrack = index;

    // Сброс источников
    bgMusic.pause();
    bgMusic.removeAttribute('src');
    while (bgMusic.firstChild) bgMusic.removeChild(bgMusic.firstChild);

    const track = playlist[index];
    track.sources.forEach(src => {
      const s = document.createElement('source');
      s.src = src;
      // Пропишем типы (полезно для некоторых серверов/браузеров)
      if (src.endsWith('.flac')) s.type = 'audio/flac';
      if (src.endsWith('.m4a'))  s.type = 'audio/mp4';
      if (src.endsWith('.mp3'))  s.type = 'audio/mpeg';
      bgMusic.appendChild(s);
    });

    // Обнулим прогресс для нового трека
    LS.set('trackIndex', index);
    LS.set('time', 0);

    try { bgMusic.load(); } catch {}
    // Обновим Media Session заголовок (если поддерживается)
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Music', artist: '—', album: '—'
      });
    }
  }

  // Плавная смена громкости
  function fadeTo(target, ms = FADE_MS) {
    return new Promise(resolve => {
      const start = performance.now();
      const from  = bgMusic.volume;
      const diff  = target - from;
      function step(t) {
        const p = Math.min(1, (t - start) / ms);
        bgMusic.volume = from + diff * p;
        if (p < 1) requestAnimationFrame(step);
        else { bgMusic.volume = target; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  // Safe play (ловим автоплей-ограничения)
  async function safePlay() {
    try {
      await bgMusic.play();
      await fadeTo(TARGET_VOL);
      updateBtnUI(true);
      LS.set('playing', true);
      return true;
    } catch {
      updateBtnUI(false);
      LS.set('playing', false);
      return false;
    }
  }

  function updateBtnUI(isPlaying) {
    musicBtn.textContent = isPlaying ? '🔊' : '🎵';
    musicBtn.classList.toggle('playing', isPlaying);
    musicBtn.setAttribute('aria-pressed', String(isPlaying));
  }

  // ── События
  bgMusic.addEventListener('loadedmetadata', () => {
    if (savedTime > 0 && savedTime < (bgMusic.duration || Infinity)) {
      bgMusic.currentTime = savedTime;
    }
  }, { once: true });

  bgMusic.addEventListener('canplay', async () => {
    if (wasPlaying) await safePlay();
    else updateBtnUI(false);
  }, { once: true });

  // Сохраняем позицию с троттлингом по timeupdate
  let lastSave = 0;
  bgMusic.addEventListener('timeupdate', () => {
    const now = performance.now();
    if (now - lastSave > 900 && !bgMusic.paused) {
      LS.set('time', bgMusic.currentTime);
      LS.set('trackIndex', currentTrack);
      lastSave = now;
    }
  });

  // Следующий трек по окончанию (зациклит единственный трек)
  bgMusic.addEventListener('ended', async () => {
    LS.set('time', 0);
    setTrack(currentTrack + 1);
    try { await bgMusic.play(); updateBtnUI(true); } catch { updateBtnUI(false); }
  });

  // Play/Pause
  musicBtn.addEventListener('click', async () => {
    if (bgMusic.paused) await safePlay();
    else {
      await fadeTo(0);
      bgMusic.pause();
      updateBtnUI(false);
      LS.set('playing', false);
    }
  });

  // Media Session (кнопки на гарнитуре/локскрине)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play',  async () => { if (bgMusic.paused) await safePlay(); });
    navigator.mediaSession.setActionHandler('pause', async () => { await fadeTo(0); bgMusic.pause(); updateBtnUI(false); LS.set('playing', false); });
    navigator.mediaSession.setActionHandler('previoustrack', async () => {
      LS.set('time', 0); setTrack(currentTrack - 1);
      try { await bgMusic.play(); updateBtnUI(true); } catch {}
    });
    navigator.mediaSession.setActionHandler('nexttrack', async () => {
      LS.set('time', 0); setTrack(currentTrack + 1);
      try { await bgMusic.play(); updateBtnUI(true); } catch {}
    });
  }

  // Инициализация
  setTrack(currentTrack);
})();

// ── Scroll Reveal (все страницы) ──
(function () {
  const fuEls = document.querySelectorAll('.fu');
  if (!fuEls.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    fuEls.forEach(el => io.observe(el));
  } else {
    fuEls.forEach(el => el.classList.add('vis'));
  }
})();


})();