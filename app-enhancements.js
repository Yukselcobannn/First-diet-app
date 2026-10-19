(() => {
  const DAY_EVENT = 'iyibeslen:select-day';
  const dayInput = document.querySelector('#dayPicker');
  const previous = document.querySelector('#previousDay');
  const next = document.querySelector('#nextDay');
  const todayButton = document.querySelector('#jumpToday');
  const themeButton = document.querySelector('#themeToggle');

  const localDay = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const shiftDay = (amount) => {
    const date = new Date(`${dayInput.value || localDay(new Date())}T12:00:00`);
    date.setDate(date.getDate() + amount);
    chooseDay(localDay(date));
  };
  const chooseDay = (date) => {
    const max = localDay(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > max) return;
    window.dispatchEvent(new CustomEvent(DAY_EVENT, { detail: date }));
  };

  previous?.addEventListener('click', () => shiftDay(-1));
  next?.addEventListener('click', () => shiftDay(1));
  todayButton?.addEventListener('click', () => chooseDay(localDay(new Date())));
  dayInput?.addEventListener('change', () => chooseDay(dayInput.value));

  const themeKey = 'iyibeslen-theme-v1';
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    if (themeButton) {
      const dark = theme === 'dark';
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.textContent = dark ? '☀️ Açık görünüm' : '🌙 Koyu görünüm';
    }
  };
  let theme = 'light';
  try { theme = localStorage.getItem(themeKey) || 'light'; } catch { /* Tarayıcı depolaması kullanılamıyor. */ }
  applyTheme(theme);
  themeButton?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem(themeKey, theme); } catch { /* Görünüm tercihi bu oturumda uygulanır. */ }
  });
  window.addEventListener('iyibeslen:reset-theme', () => {
    theme = 'light';
    applyTheme(theme);
  });

  document.querySelector('#mealInput')?.setAttribute('enterkeyhint', 'done');

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const banner = document.querySelector('#updateBanner');
    const applyButton = document.querySelector('#applyUpdate');
    const dismissButton = document.querySelector('#dismissUpdate');
    let registration = null;
    let applyRequested = false;
    let reloaded = false;

    const offerUpdate = () => {
      if (banner) banner.hidden = false;
    };

    applyButton?.addEventListener('click', () => {
      const waiting = registration?.waiting;
      if (!waiting) return;
      applyRequested = true;
      applyButton.disabled = true;
      applyButton.textContent = 'Güncelleniyor…';
      waiting.postMessage({ type: 'SKIP_WAITING' });
    });
    dismissButton?.addEventListener('click', () => {
      if (banner) banner.hidden = true;
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (applyRequested && !reloaded) {
        reloaded = true;
        location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').then((reg) => {
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) offerUpdate();
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) offerUpdate();
          });
        });
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
})();
