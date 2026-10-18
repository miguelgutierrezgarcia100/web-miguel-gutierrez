(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Textos que genera JavaScript ---------- */
  const STR = {
    en: {
      title: 'Miguel Gutiérrez García · Software Engineer & Developer',
      description: 'Miguel Gutiérrez García, software engineer and developer. Stack, projects, game development and contact.',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      copied: 'Email copied',
    },
    es: {
      title: 'Miguel Gutiérrez García · Ingeniero y Desarrollador de Software',
      description: 'Miguel Gutiérrez García, ingeniero y desarrollador de software. Tecnologías, proyectos, videojuegos y contacto.',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      copied: 'Email copiado',
    },
  };
  const t = (key) => (STR[root.lang] || STR.en)[key];

  /* ---------- Menú móvil ---------- */
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
  };
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Idioma (EN por defecto, ES opcional) ---------- */
  const metaDescription = document.querySelector('meta[name="description"]');
  const applyLang = (lang) => {
    root.lang = lang;
    document.title = t('title');
    metaDescription.setAttribute('content', t('description'));
    navToggle.setAttribute('aria-label', t(nav.classList.contains('is-open') ? 'closeMenu' : 'openMenu'));
    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
    // Atributos traducibles: data-en-aria-label / data-es-aria-label, data-en-alt / data-es-alt...
    const prefix = `data-${lang}-`;
    document.querySelectorAll('[data-l10n]').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith(prefix)) el.setAttribute(attr.name.slice(prefix.length), attr.value);
      });
    });
  };
  applyLang(root.lang === 'es' ? 'es' : 'en');

  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      applyLang(lang);
      try { localStorage.setItem('lang', lang); } catch (e) {}
      // Si se entró con ?lang=xx, mantener la URL coherente
      try {
        const url = new URL(location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.set('lang', lang);
          history.replaceState(null, '', url);
        }
      } catch (e) {}
    });
  });

  /* ---------- Tema claro / oscuro ---------- */
  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Enlace activo según la sección visible ---------- */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Aparición suave de las secciones ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    // Pequeño escalonado entre tarjetas hermanas
    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty('--delay', Math.min(i, 5) * 60 + 'ms');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Copiar email ---------- */
  const toast = document.querySelector('[data-toast]');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  };
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-copied');
        showToast(t('copied'));
        setTimeout(() => btn.classList.remove('is-copied'), 2000);
      } catch (e) {
        window.location.href = 'mailto:' + btn.dataset.copy;
      }
    });
  });

  /* ---------- Año del pie ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
