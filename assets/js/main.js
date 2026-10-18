(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Textos que genera JavaScript ---------- */
  const STR = {
    en: {
      title: 'Miguel Gutiérrez García · Software Developer & Engineer',
      description: 'Miguel Gutiérrez García, software developer and engineer. Stack, projects, game development and contact.',
      copied: 'Email copied',
    },
    es: {
      title: 'Miguel Gutiérrez García · Desarrollador e Ingeniero de Software',
      description: 'Miguel Gutiérrez García, desarrollador e ingeniero de software. Tecnologías, proyectos, videojuegos y contacto.',
      copied: 'Email copiado',
    },
  };
  const t = (key) => (STR[root.lang] || STR.en)[key];

  /* ---------- Idioma (EN por defecto, ES opcional) ---------- */
  const metaDescription = document.querySelector('meta[name="description"]');
  const applyLang = (lang) => {
    root.lang = lang;
    document.title = t('title');
    metaDescription.setAttribute('content', t('description'));
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

  /* ---------- Aparición suave de las secciones ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
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
