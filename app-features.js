(() => {
  const app = window.IyiApp;
  if (!app) return;

  const $ = selector => document.querySelector(selector);
  const state = () => app.getState();
  const esc = app.escape;
  const foodDB = app.foodDB;
  const recipes = [
    { id: 'yogurt-oats', name: 'Yoğurtlu yulaf ve muz', emoji: '🥣', type: 'kahvalti', minutes: 5, diet: 'vegetarian', allergens: ['dairy', 'nuts'], ingredients: [['oats', 40], ['plainYogurt', 150], ['banana', 60], ['almonds', 6]], steps: ['Yulafı yoğurda karıştır.', 'Muzu dilimleyip üzerine ekle; bademle tamamla.'] },
    { id: 'egg-toast', name: 'Domatesli yumurta ve tam buğday ekmeği', emoji: '🍳', type: 'kahvalti', minutes: 12, diet: 'vegetarian', allergens: ['egg', 'gluten'], ingredients: [['egg', 100], ['wholeWheatBread', 60], ['tomato', 80], ['oliveOil', 5]], steps: ['Domatesi az yağla tavada yumuşat.', 'Yumurtayı ekleyip pişir; ekmekle servis et.'] },
    { id: 'chickpea-bulgur', name: 'Nohutlu bulgur kasesi', emoji: '🫘', type: 'ana', minutes: 15, diet: 'vegan', allergens: ['gluten'], ingredients: [['chickpeas', 120], ['bulgur', 120], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Pişmiş bulguru ve nohudu bir kasede birleştir.', 'Doğranmış sebzeleri ve zeytinyağını ekle.'] },
    { id: 'chicken-bulgur', name: 'Tavuklu bulgur tabağı', emoji: '🍗', type: 'ana', minutes: 20, diet: 'omnivore', allergens: ['gluten'], ingredients: [['chickenBreast', 100], ['bulgur', 150], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Pişmiş tavuk ve bulguru tabağa al.', 'Domates, salatalık ve zeytinyağıyla servis et.'] },
    { id: 'lentil-bowl', name: 'Mercimekli sebze kasesi', emoji: '🥗', type: 'vegan', minutes: 20, diet: 'vegan', allergens: [], ingredients: [['lentils', 150], ['potato', 100], ['onion', 30], ['tomato', 60], ['oliveOil', 5]], steps: ['Sebzeleri doğrayıp yumuşayana kadar pişir.', 'Haşlanmış mercimeği ve zeytinyağını ekleyip ısıt.'] },
    { id: 'tuna-salad', name: 'Ton balıklı renkli salata', emoji: '🐟', type: 'ana', minutes: 10, diet: 'pescatarian', allergens: ['fish'], ingredients: [['tuna', 100], ['lettuce', 50], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Marul, domates ve salatalığı doğra.', 'Ton balığı ve zeytinyağıyla karıştır.'] }
  ];
  const portions = {};
  const foodFor = id => foodDB.find(food => food.id === id);
  const normalize = value => String(value || '').toLocaleLowerCase('tr').replaceAll('ı', 'i');
  const recipeTotal = recipe => recipe.ingredients.reduce((total, [id, grams]) => {
    const food = foodFor(id);
    if (food) { total.kcal += food.kcal100 * grams / 100; total.protein += food.protein100 * grams / 100; }
    return total;
  }, { kcal: 0, protein: 0 });

  function excluded(recipe) {
    const profile = state().profile;
    if (!profile) return false;
    if (profile.diet === 'vegan' && recipe.diet !== 'vegan') return true;
    if (profile.diet === 'vegetarian' && !['vegan', 'vegetarian'].includes(recipe.diet)) return true;
    if (profile.diet === 'pescatarian' && !['vegan', 'vegetarian', 'pescatarian'].includes(recipe.diet)) return true;
    const aliases = [
      [/sut|yogurt|peynir/, 'dairy'], [/fistik|fistig|findik|badem|kuruyemis/, 'nuts'], [/gluten|bugday|ekmek/, 'gluten'],
      [/yumurta/, 'egg'], [/balik|ton baligi|somon/, 'fish'], [/soya|tofu/, 'soy']
    ];
    const avoid = String(profile.avoid || '').split(/[,;|]/).map(normalize).filter(Boolean);
    return avoid.some(term => {
      const match = aliases.find(([pattern]) => pattern.test(term));
      if (match && recipe.allergens.includes(match[1])) return true;
      if (recipe.allergens.some(allergen => normalize(allergen) === term)) return true;
      return recipe.ingredients.some(([id]) => {
        const food = foodFor(id);
        return food && [food.name, food.planName, ...food.terms].some(name => normalize(name).includes(term));
      });
    });
  }

  $('.leftcol').insertAdjacentHTML('beforeend', `
    <section class="card habit-card" data-app-view="today">
      <div class="card-head"><div><h3>Günlük yaşam notları</h3><span class="subtle">İsteğe bağlı · kendi gözlemlerin</span></div><span class="tag">Bu cihazda</span></div>
      <form id="habitForm" class="habit-form">
        <label>Uyku <span class="subtle">saat</span><input class="field" id="habitSleep" type="number" min="0" max="24" step="0.5" placeholder="Örn. 7,5"></label>
        <label>Hareket <span class="subtle">dakika</span><input class="field" id="habitActivity" type="number" min="0" max="600" step="5" placeholder="Örn. 30"></label>
        <label>Açlık hissi <span class="subtle">1–5</span><select class="field" id="habitHunger"><option value="">Kaydetmek istemiyorum</option><option value="1">1 · Çok az</option><option value="2">2 · Az</option><option value="3">3 · Orta</option><option value="4">4 · Fazla</option><option value="5">5 · Çok fazla</option></select></label>
        <label>Ruh hâli<select class="field" id="habitMood"><option value="">Kaydetmek istemiyorum</option><option value="good">İyi</option><option value="neutral">Nötr</option><option value="low">Zor bir gün</option></select></label>
        <button class="secondary" type="submit">Günlük notları kaydet</button>
      </form><p class="estimate">Uyku, hareket ve his kayıtları sağlık ölçümü değildir. Doldurmadığın alanları boş bırakabilirsin.</p>
    </section>
    <section class="card recipe-card" data-app-view="recipes">
      <div class="card-head"><div><h3>Kolay tarifler</h3><span class="subtle">Çevrimdışı · yaklaşık değerler</span></div><span class="tag" id="recipeCount">6 tarif</span></div>
      <div class="recipe-controls"><input class="field" id="recipeSearch" type="search" placeholder="Tarif veya malzeme ara" aria-label="Tarif veya malzeme ara"><select class="field" id="recipeFilter" aria-label="Tarif türü"><option value="all">Tüm tarifler</option><option value="kahvalti">Kahvaltı</option><option value="ana">Ana öğün</option><option value="vegan">Bitkisel</option><option value="quick">15 dakika ve altı</option><option value="saved">Kaydettiklerim</option></select></div>
      <div class="recipe-grid" id="recipeGrid"></div><p class="estimate">Porsiyon ve besin değerleri USDA FoodData Central genel verileriyle hesaplanan tahminlerdir. Yağ, marka ve pişirme farkı değişiklik yaratır. Alerjen eşleşmesi çapraz bulaşmayı veya ürün etiketini doğrulamaz.</p>
    </section>
    <section class="card habit-week-card" data-app-view="progress"><div class="card-head"><div><h3>Yaşam notlarının özeti</h3><span class="subtle">Son 7 gün · yalnızca doldurulan alanlar</span></div></div><div class="habit-week-summary" id="habitWeekSummary"></div><p class="estimate">Bu kayıtlar kilo veya beslenme sonucu hakkında tek başına çıkarım yaptırmaz.</p></section>
  `);
  $('.rightcol').insertAdjacentHTML('beforeend', `
    <section class="card shopping-card" data-app-view="plan"><div class="card-head"><div><h3>Alışveriş listem</h3><span class="subtle" id="shoppingCount">0 ürün</span></div><span>🛒</span></div>
      <form id="shoppingForm" class="shopping-form"><input class="field" id="shoppingName" maxlength="120" placeholder="Ürün ekle" required><input class="field" id="shoppingAmount" maxlength="40" placeholder="Miktar" aria-label="Miktar, isteğe bağlı"><button class="primary" type="submit">Ekle</button></form>
      <div class="shopping-list" id="shoppingList"></div><div class="data-actions"><button class="secondary tiny" id="clearCheckedShopping" type="button">Tamamlananları kaldır</button><button class="secondary tiny" id="clearShopping" type="button">Listeyi temizle</button></div>
      <p class="estimate">Tarifte “Alışveriş listesine ekle” seçeneği malzemeleri buraya ekler. Miktarları ve ürün adlarını düzenleyebilirsin.</p>
    </section>
  `);
  $('.leftcol').insertAdjacentHTML('afterbegin', `<section class="card profile-summary-card" data-app-view="profile"><div class="card-head"><div><h3>Profilin ve hedeflerin</h3><span class="subtle">Kişisel ayarların</span></div><button class="secondary tiny" id="profileEditButton" type="button">Düzenle</button></div><div id="profileSummary"></div><p class="estimate">Öğün, tarif favorisi, alışveriş listesi ve günlük yaşam notların bu tarayıcıda saklanır. Hesap, parola kurtarma ve cihazlar arasında eşitleme yok. Tarayıcı depolaması silinirse veriler kaybolabilir; düzenli yedek al.</p></section>`);

  function renderRecipes() {
    const grid = $('#recipeGrid'), query = normalize($('#recipeSearch').value.trim()), filter = $('#recipeFilter').value;
    const visible = recipes.filter(recipe => {
      if (excluded(recipe)) return false;
      if (filter === 'quick' && recipe.minutes > 15) return false;
      if (filter === 'saved' && !(state().savedRecipes || []).includes(recipe.id)) return false;
      if (filter === 'vegan' && recipe.diet !== 'vegan') return false;
      if (!['all', 'quick', 'saved', 'vegan'].includes(filter) && filter !== recipe.type) return false;
      const searchText = normalize(recipe.name + ' ' + recipe.ingredients.map(([id]) => foodFor(id)?.name || '').join(' '));
      return !query || searchText.includes(query);
    });
    $('#recipeCount').textContent = `${visible.length} tarif`;
    grid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('div'); empty.className = 'empty';
      empty.textContent = state().profile && (state().profile.avoid || state().profile.diet !== 'none') ? 'Tercih ve kaçındığın gıdalara uygun tarif bulunamadı. Profil ayarlarını gözden geçirebilirsin.' : 'Eşleşen tarif bulunamadı.';
      grid.append(empty); return;
    }
    for (const recipe of visible) {
      const factor = portions[recipe.id] || 1, total = recipeTotal(recipe), card = document.createElement('article');
      card.className = 'recipe-tile';
      const ingredients = recipe.ingredients.map(([id, grams]) => `${foodFor(id)?.planName || foodFor(id)?.name || id} ${Math.round(grams * factor)} g`);
      const favorite = (state().savedRecipes || []).includes(recipe.id);
      card.innerHTML = `<div class="recipe-title"><span class="recipe-emoji">${recipe.emoji}</span><div><strong>${esc(recipe.name)}</strong><small>${recipe.type === 'kahvalti' ? 'Kahvaltı' : recipe.type === 'vegan' ? 'Bitkisel' : 'Ana öğün'} · ${recipe.minutes} dk · ${recipe.diet === 'vegan' ? 'Vegan' : recipe.diet === 'vegetarian' ? 'Vejetaryen' : recipe.diet === 'pescatarian' ? 'Pesketaryen' : 'Genel'}</small></div><button class="icon-btn recipe-favorite" data-recipe="${recipe.id}" type="button" aria-label="${favorite ? 'Kaydedilenlerden çıkar' : 'Tarifi kaydet'}">${favorite ? '★' : '☆'}</button></div><div class="recipe-nutrition">~${Math.round(total.kcal * factor)} kcal <span>·</span> ~${(total.protein * factor).toFixed(1)} g protein <span>·</span> ${factor.toLocaleString('tr-TR')} porsiyon</div><label class="portion-control">Porsiyon <select class="field" data-portion="${recipe.id}"><option value="0.5" ${factor === .5 ? 'selected' : ''}>½</option><option value="1" ${factor === 1 ? 'selected' : ''}>1</option><option value="1.5" ${factor === 1.5 ? 'selected' : ''}>1½</option><option value="2" ${factor === 2 ? 'selected' : ''}>2</option><option value="3" ${factor === 3 ? 'selected' : ''}>3</option></select></label><ul class="recipe-ingredients">${ingredients.map(item => `<li>${esc(item)}</li>`).join('')}</ul><details class="recipe-steps"><summary>Hazırlanışı</summary><ol>${recipe.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></details><div class="recipe-actions"><button class="secondary tiny recipe-add-meal" data-recipe="${recipe.id}" type="button">Bugüne öğün ekle</button><button class="secondary tiny recipe-add-shopping" data-recipe="${recipe.id}" type="button">Alışveriş listesine ekle</button></div>`;
      grid.append(card);
    }
    grid.querySelectorAll('[data-portion]').forEach(select => select.addEventListener('change', () => { portions[select.dataset.portion] = Number(select.value); renderRecipes(); }));
    grid.querySelectorAll('.recipe-favorite').forEach(button => button.addEventListener('click', () => {
      const data = state(), id = button.dataset.recipe; data.savedRecipes = data.savedRecipes || [];
      data.savedRecipes = data.savedRecipes.includes(id) ? data.savedRecipes.filter(item => item !== id) : [...data.savedRecipes, id];
      if (app.save()) renderRecipes();
    }));
    grid.querySelectorAll('.recipe-add-meal').forEach(button => button.addEventListener('click', () => {
      const recipe = recipes.find(item => item.id === button.dataset.recipe), factor = portions[recipe.id] || 1, total = recipeTotal(recipe);
      const ingredients = recipe.ingredients.map(([id, grams]) => `${foodFor(id)?.planName || id} ${Math.round(grams * factor)} g`).join(', ');
      if (app.saveMeal({ name: `${recipe.name} · ${ingredients}`, kcal: Math.round(total.kcal * factor), protein: +(total.protein * factor).toFixed(1), category: recipe.type === 'kahvalti' ? 'breakfast' : 'lunch', emoji: recipe.emoji, approx: true, requiresConfirm: false, assumption: `Tarif porsiyonu yaklaşık ${factor.toLocaleString('tr-TR')}; malzemeler: ${ingredients}. Pişirme yağı, marka ve tarif farkı dahil değil.`, source: 'USDA FoodData Central SR Legacy · bileşen toplamı ve yaklaşık gramlar.' })) {
        app.setScreen('today'); app.toast('Tarif bugünün öğünlerine eklendi · tahmini');
      }
    }));
    grid.querySelectorAll('.recipe-add-shopping').forEach(button => button.addEventListener('click', () => {
      const recipe = recipes.find(item => item.id === button.dataset.recipe), factor = portions[recipe.id] || 1, data = state(); data.shoppingList = data.shoppingList || [];
      for (const [id, grams] of recipe.ingredients) {
        const food = foodFor(id); if (!food) continue;
        const key = `food-${id}`, existing = data.shoppingList.find(item => item.id === key), amount = Math.round(grams * factor);
        if (existing) { const current = parseFloat(existing.amount); existing.amount = Number.isFinite(current) ? `${Math.round(current + amount)} g` : `${amount} g`; }
        else data.shoppingList.push({ id: key, name: food.planName || food.name, amount: `${amount} g`, checked: false });
      }
      if (app.save()) { renderShoppingList(); app.setScreen('plan'); }
    }));
  }

  function renderShoppingList() {
    const data = state(); data.shoppingList = data.shoppingList || [];
    const list = $('#shoppingList'); list.replaceChildren();
    $('#shoppingCount').textContent = `${data.shoppingList.filter(item => !item.checked).length} ürün kaldı`;
    if (!data.shoppingList.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'Listen boş. Tariflerden malzeme ekleyebilir veya ürün yazabilirsin.'; list.append(empty); }
    data.shoppingList.forEach((item, index) => {
      const row = document.createElement('div'); row.className = 'shopping-row' + (item.checked ? ' is-checked' : '');
      row.innerHTML = `<input type="checkbox" data-shopping-check="${index}" aria-label="${esc(item.name)} alındı" ${item.checked ? 'checked' : ''}><input class="field shopping-item-name" data-shopping-name="${index}" aria-label="Ürün adı" maxlength="120" value="${esc(item.name)}"><input class="field shopping-item-amount" data-shopping-amount="${index}" aria-label="Miktar" maxlength="40" value="${esc(item.amount || '')}"><button class="icon-btn" data-shopping-delete="${index}" type="button" aria-label="${esc(item.name)} ürününü sil">×</button>`;
      list.append(row);
    });
    list.querySelectorAll('[data-shopping-check]').forEach(input => input.addEventListener('change', () => { data.shoppingList[Number(input.dataset.shoppingCheck)].checked = input.checked; if (app.save()) renderShoppingList(); }));
    list.querySelectorAll('[data-shopping-delete]').forEach(button => button.addEventListener('click', () => { data.shoppingList.splice(Number(button.dataset.shoppingDelete), 1); if (app.save()) renderShoppingList(); }));
    list.querySelectorAll('[data-shopping-name],[data-shopping-amount]').forEach(input => input.addEventListener('change', () => {
      const index = Number(input.dataset.shoppingName ?? input.dataset.shoppingAmount), item = data.shoppingList[index]; if (!item) return;
      if (input.hasAttribute('data-shopping-name')) { const value = input.value.trim(); if (!value) { renderShoppingList(); app.toast('Ürün adı boş bırakılamaz'); return; } item.name = value; }
      else item.amount = input.value.trim().slice(0, 40);
      if (app.save()) renderShoppingList();
    }));
  }

  function renderHabits() {
    const data = state(), key = app.getSelectedDate(), record = data.habits?.[key] || {};
    for (const [id, field] of [['habitSleep', 'sleep'], ['habitActivity', 'activity'], ['habitHunger', 'hunger'], ['habitMood', 'mood']]) {
      const element = $('#' + id); if (document.activeElement !== element) element.value = record[field] ?? '';
    }
    const rows = [];
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) { const date = new Date(key + 'T12:00:00'); date.setDate(date.getDate() - daysAgo); const item = data.habits?.[date.toLocaleDateString('sv-SE')]; if (item) rows.push(item); }
    const mean = values => values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : '—';
    const sleep = rows.map(row => Number(row.sleep)).filter(Number.isFinite), activity = rows.map(row => Number(row.activity)).filter(Number.isFinite), hunger = rows.map(row => Number(row.hunger)).filter(Number.isFinite), moods = rows.map(row => row.mood).filter(Boolean);
    $('#habitWeekSummary').innerHTML = `<div><span>Uyku ortalaması</span><strong>${sleep.length ? mean(sleep) + ' saat' : '—'}</strong><small>${sleep.length} kayıtlı gün</small></div><div><span>Hareket</span><strong>${activity.length ? mean(activity) + ' dk' : '—'}</strong><small>${activity.length} kayıtlı gün ortalaması</small></div><div><span>Ruh hâli notu</span><strong>${moods.length ? `${moods.filter(value => value === 'good').length} iyi · ${moods.length} kayıt` : '—'}</strong><small>Değerlendirme veya tanı değildir</small></div><div><span>Açlık hissi ortalaması</span><strong>${hunger.length ? mean(hunger) + ' / 5' : '—'}</strong><small>${hunger.length} kayıtlı gün</small></div>`;
  }

  function renderProfileSummary() {
    const box = $('#profileSummary'), profile = state().profile;
    if (!profile) { box.innerHTML = '<p class="subtle">Henüz profil oluşturmadın. İstersen temel bilgilerini girerek yaklaşık günlük hedef alabilirsin.</p>'; return; }
    const goal = { lose: 'Kilo vermek', maintain: 'Kiloyu korumak', gain: 'Kilo almak' }[profile.goal] || 'Takip modu';
    const diet = { none: 'Özel tercih yok', vegetarian: 'Vejetaryen', vegan: 'Vegan', pescatarian: 'Pesketaryen' }[profile.diet] || 'Özel tercih yok';
    const target = app.goalForDay();
    box.innerHTML = `<div class="profile-facts"><span>${esc(profile.age)} yaş</span><span>${esc(profile.height)} cm</span><span>${esc(profile.weight)} kg</span><span>${esc(goal)}</span></div><p class="subtle">Beslenme: ${esc(diet)}${profile.avoid ? ` · Kaçındıkların: ${esc(profile.avoid)}` : ''}</p><p class="subtle">Günlük hedef: ${target ? `${Math.round(target.kcalMin ?? target.kcal)}–${Math.round(target.kcalMax ?? target.kcal)} kcal · ${target.protein ?? '—'} g protein (${target.mult} g/kg)` : 'Bu profil için otomatik hedef hesaplanmıyor; uzmanla belirle.'}</p>`;
  }

  $('#recipeSearch').addEventListener('input', renderRecipes);
  $('#recipeFilter').addEventListener('change', renderRecipes);
  $('#shoppingForm').addEventListener('submit', event => {
    event.preventDefault(); const data = state(); data.shoppingList = data.shoppingList || [];
    if (data.shoppingList.length >= 500) return;
    data.shoppingList.push({ id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: $('#shoppingName').value.trim(), amount: $('#shoppingAmount').value.trim(), checked: false });
    if (app.save()) { $('#shoppingName').value = ''; $('#shoppingAmount').value = ''; renderShoppingList(); }
  });
  $('#clearCheckedShopping').addEventListener('click', () => { const data = state(); data.shoppingList = (data.shoppingList || []).filter(item => !item.checked); if (app.save()) renderShoppingList(); });
  $('#clearShopping').addEventListener('click', () => { const data = state(); if (!data.shoppingList?.length) return; if (confirm('Alışveriş listesindeki bütün ürünleri silmek istiyor musun?')) { data.shoppingList = []; if (app.save()) renderShoppingList(); } });
  $('#habitForm').addEventListener('submit', event => {
    event.preventDefault();
    const sleep = $('#habitSleep').value === '' ? null : Number($('#habitSleep').value), activity = $('#habitActivity').value === '' ? null : Number($('#habitActivity').value), hunger = $('#habitHunger').value === '' ? null : Number($('#habitHunger').value), mood = $('#habitMood').value;
    if ((sleep !== null && (!Number.isFinite(sleep) || sleep < 0 || sleep > 24)) || (activity !== null && (!Number.isInteger(activity) || activity < 0 || activity > 600)) || (hunger !== null && (!Number.isInteger(hunger) || hunger < 1 || hunger > 5))) return;
    const record = {}; if (sleep !== null) record.sleep = sleep; if (activity !== null) record.activity = activity; if (hunger !== null) record.hunger = hunger; if (mood) record.mood = mood;
    const data = state(), key = app.getSelectedDate(); data.habits = data.habits || {};
    if (Object.keys(record).length) data.habits[key] = record; else delete data.habits[key];
    if (app.save()) { renderHabits(); app.toast('Günlük yaşam notları kaydedildi'); }
  });
  $('#profileEditButton').addEventListener('click', app.openProfile);
  window.addEventListener('iyibeslen:select-day', () => { renderHabits(); renderProfileSummary(); });
  window.addEventListener('iyibeslen:reset-theme', () => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); });
  window.addEventListener('iyibeslen:data-changed', () => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); });
  $('#deleteData').addEventListener('click', () => setTimeout(() => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); }, 0));

  app.registerBackupExtension((value, backup) => {
    const isRecord = item => item && typeof item === 'object' && !Array.isArray(item);
    const dateKey = key => typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(new Date(key + 'T12:00:00').getTime()) && new Date(key + 'T12:00:00').toLocaleDateString('sv-SE') === key;
    let savedRecipes = [];
    if (value.savedRecipes != null) {
      if (!Array.isArray(value.savedRecipes) || value.savedRecipes.length > recipes.length || value.savedRecipes.some(id => !recipes.some(recipe => recipe.id === id))) return null;
      savedRecipes = [...new Set(value.savedRecipes)];
    }
    const habits = {};
    if (value.habits != null) {
      if (!isRecord(value.habits) || Object.keys(value.habits).length > 3650) return null;
      for (const [key, item] of Object.entries(value.habits)) {
        if (!dateKey(key) || !isRecord(item)) return null;
        const row = {};
        if (item.sleep != null) { if (typeof item.sleep !== 'number' || !Number.isFinite(item.sleep) || item.sleep < 0 || item.sleep > 24) return null; row.sleep = item.sleep; }
        if (item.activity != null) { if (!Number.isInteger(item.activity) || item.activity < 0 || item.activity > 600) return null; row.activity = item.activity; }
        if (item.hunger != null) { if (!Number.isInteger(item.hunger) || item.hunger < 1 || item.hunger > 5) return null; row.hunger = item.hunger; }
        if (item.mood != null) { if (!['good', 'neutral', 'low'].includes(item.mood)) return null; row.mood = item.mood; }
        habits[key] = row;
      }
    }
    const shoppingList = [];
    if (value.shoppingList != null) {
      if (!Array.isArray(value.shoppingList) || value.shoppingList.length > 500) return null;
      for (const item of value.shoppingList) {
        if (!isRecord(item) || typeof item.id !== 'string' || item.id.length > 120 || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || typeof (item.amount ?? '') !== 'string' || String(item.amount || '').length > 40 || typeof item.checked !== 'boolean') return null;
        shoppingList.push({ id: item.id, name: item.name.trim(), amount: item.amount || '', checked: item.checked });
      }
    }
    backup.savedRecipes = savedRecipes; backup.habits = habits; backup.shoppingList = shoppingList;
    return backup;
  });
  app.registerSavedDataCheck(data => !!data && ((data.savedRecipes || []).length > 0 || Object.keys(data.habits || {}).length > 0 || (data.shoppingList || []).length > 0));
  renderRecipes(); renderShoppingList(); renderHabits(); renderProfileSummary();
})();
