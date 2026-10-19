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
})();
