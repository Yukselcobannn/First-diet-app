(() => {
  const app = window.IyiApp;
  if (!app) return;

  const $ = selector => document.querySelector(selector);
  const state = () => app.getState();
  const esc = app.escape;
  const foodDB = app.foodDB;
  const recipes = [
    { id: 'yogurt-oats', name: 'Yoğurtlu yulaf ve muz', emoji: '🥣', image: 'assets/recipes/yogurt-oats.svg', type: 'kahvalti', minutes: 5, diet: 'vegetarian', allergens: ['dairy', 'nuts'], ingredients: [['oats', 40], ['plainYogurt', 150], ['banana', 60], ['almonds', 6]], steps: ['Yulafı yoğurda karıştır.', 'Muzu dilimleyip üzerine ekle; bademle tamamla.'] },
    { id: 'egg-toast', name: 'Domatesli yumurta ve tam buğday ekmeği', emoji: '🍳', image: 'assets/recipes/egg-toast.svg', type: 'kahvalti', minutes: 12, diet: 'vegetarian', allergens: ['egg', 'gluten'], ingredients: [['egg', 100], ['wholeWheatBread', 60], ['tomato', 80], ['oliveOil', 5]], steps: ['Domatesi az yağla tavada yumuşat.', 'Yumurtayı ekleyip pişir; ekmekle servis et.'] },
    { id: 'chickpea-bulgur', name: 'Nohutlu bulgur kasesi', emoji: '🫘', image: 'assets/recipes/chickpea-bulgur.svg', type: 'ana', minutes: 15, diet: 'vegan', allergens: ['gluten'], ingredients: [['chickpeas', 120], ['bulgur', 120], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Pişmiş bulguru ve nohudu bir kasede birleştir.', 'Doğranmış sebzeleri ve zeytinyağını ekle.'] },
    { id: 'chicken-bulgur', name: 'Tavuklu bulgur tabağı', emoji: '🍗', image: 'assets/recipes/chicken-bulgur.svg', type: 'ana', minutes: 20, diet: 'omnivore', allergens: ['gluten'], ingredients: [['chickenBreast', 100], ['bulgur', 150], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Pişmiş tavuk ve bulguru tabağa al.', 'Domates, salatalık ve zeytinyağıyla servis et.'] },
    { id: 'lentil-bowl', name: 'Mercimekli sebze kasesi', emoji: '🥗', image: 'assets/recipes/lentil-bowl.svg', type: 'vegan', minutes: 20, diet: 'vegan', allergens: [], ingredients: [['lentils', 150], ['potato', 100], ['onion', 30], ['tomato', 60], ['oliveOil', 5]], steps: ['Sebzeleri doğrayıp yumuşayana kadar pişir.', 'Haşlanmış mercimeği ve zeytinyağını ekleyip ısıt.'] },
    { id: 'tuna-salad', name: 'Ton balıklı renkli salata', emoji: '🐟', image: 'assets/recipes/tuna-salad.svg', type: 'ana', minutes: 10, diet: 'pescatarian', allergens: ['fish'], ingredients: [['tuna', 100], ['lettuce', 50], ['tomato', 80], ['cucumber', 80], ['oliveOil', 5]], steps: ['Marul, domates ve salatalığı doğra.', 'Ton balığı ve zeytinyağıyla karıştır.'] }
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
  const pantryHas = (id, pantry) => { const food = foodFor(id); return !!food && pantry.some(term => [food.name, food.planName, ...food.terms].some(name => normalize(name).includes(term) || term.includes(normalize(name)))); };
  const pantryMatches = (recipe, pantry) => recipe.ingredients.filter(([id]) => pantryHas(id, pantry)).length;

  $('.leftcol').insertAdjacentHTML('beforeend', `
    <section class="home-flow" data-app-view="today" aria-labelledby="homeFlowTitle">
      <div class="home-flow-head"><div><span class="eyebrow">Günün akışı</span><h2 id="homeFlowTitle">Sade adımlar, düzenli takip</h2></div><span class="home-spark" aria-hidden="true">✳</span></div>
      <div class="home-flow-grid"><article class="home-next-card"><span class="mini-label">Sıradaki öğün</span><strong id="homeNextMeal">Öğün zamanını seçelim</strong><p id="homeNextMealNote">İlerlemene göre günün kalanını planla.</p><button class="secondary" data-focus-meal type="button">Öğün kaydı aç</button></article><article class="home-plan-card"><span class="mini-label">Bugünkü planın</span><strong id="homePlanTitle">Henüz günlük planın yok</strong><p id="homePlanNote">Tercih ve hedeflerine göre ücretsiz örnek oluştur.</p><button class="secondary" data-go-screen="plan" type="button">Planı görüntüle</button></article></div>
      <div class="home-week-strip"><span id="homeWeekCount">Bu hafta: henüz kayıt yok</span><button class="text-action" data-go-screen="progress" type="button">Haftalık özeti gör →</button><button class="text-action" data-go-screen="recipes" type="button">Tariflere göz at →</button></div>
    </section>
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
      <div class="recipe-controls"><input class="field" id="recipeSearch" type="search" placeholder="Tarif veya malzeme ara" aria-label="Tarif veya malzeme ara"><select class="field" id="recipeFilter" aria-label="Tarif türü"><option value="all">Tüm tarifler</option><option value="kahvalti">Kahvaltı</option><option value="ana">Ana öğün</option><option value="vegan">Bitkisel</option><option value="quick">15 dakika ve altı</option><option value="saved">Kaydettiklerim</option><option value="pantry">Evdekilerle tarifler</option></select></div>
      <form id="pantryForm" class="pantry-form"><label for="pantryInput">Evdeki malzemeler <span class="subtle">virgülle ayır</span></label><div><input class="field" id="pantryInput" maxlength="300" placeholder="Örn. nohut, domates, yoğurt"><button class="secondary" type="submit">Tarif bul</button></div><small>Yazdıklarından en az birini içeren tarifleri ve tarifte eksik kalan malzemeleri gösterir. Liste bu cihazda saklanır.</small></form>
      <div class="recipe-grid" id="recipeGrid"></div><p class="estimate">Porsiyon ve besin değerleri USDA FoodData Central genel verileriyle hesaplanan tahminlerdir. Yağ, marka ve pişirme farkı değişiklik yaratır. Alerjen eşleşmesi çapraz bulaşmayı veya ürün etiketini doğrulamaz.</p>
    </section>
    <section class="card habit-week-card" data-app-view="progress"><div class="card-head"><div><h3>Yaşam notlarının özeti</h3><span class="subtle">Son 7 gün · yalnızca doldurulan alanlar</span></div></div><div class="habit-week-summary" id="habitWeekSummary"></div><p class="estimate">Bu kayıtlar kilo veya beslenme sonucu hakkında tek başına çıkarım yaptırmaz.</p></section>
    <section class="card report-card" data-app-view="progress"><div class="card-head"><div><h3>Tarih aralığı raporu</h3><span class="subtle">Sadece gerçekten kaydedilen veriler</span></div><span aria-hidden="true">📊</span></div><div class="report-controls"><label>Başlangıç<input class="field" id="reportFrom" type="date"></label><label>Bitiş<input class="field" id="reportTo" type="date"></label><button class="secondary" id="reportRefresh" type="button">Raporu göster</button><button class="primary" id="reportExport" type="button">CSV indir</button></div><div id="reportSummary" class="report-summary" role="status" aria-live="polite"></div><p class="estimate">Öğün toplamı yalnızca kaydedilen öğünleri kapsar; eksik öğünler tamamlanmış gün gibi yorumlanmaz. CSV dosyası cihazında hazırlanır, uygulama sunucusuna gönderilmez. Dosya kişisel veriler içerebilir.</p></section>
  `);

  $('.rightcol').insertAdjacentHTML('beforeend', `
    <section class="card shopping-card" data-app-view="shopping"><div class="card-head"><div><h3>Alışveriş listem</h3><span class="subtle" id="shoppingCount">0 ürün</span></div><span>🛒</span></div>
      <form id="shoppingForm" class="shopping-form"><input class="field" id="shoppingName" maxlength="120" placeholder="Ürün ekle" required><input class="field" id="shoppingAmount" maxlength="40" placeholder="Miktar" aria-label="Miktar, isteğe bağlı"><button class="primary" type="submit">Ekle</button></form>
      <div class="shopping-list" id="shoppingList"></div><div class="data-actions"><button class="secondary tiny" id="clearCheckedShopping" type="button">Tamamlananları kaldır</button><button class="secondary tiny" id="clearShopping" type="button">Listeyi temizle</button></div>
      <p class="estimate">Tarifte “Alışveriş listesine ekle” seçeneği malzemeleri buraya ekler. Miktarları ve ürün adlarını düzenleyebilirsin.</p>
    </section>
  `);
  $('.leftcol').insertAdjacentHTML('afterbegin', `<section class="card profile-summary-card" data-app-view="profile"><div class="card-head"><div><h3>Profilin ve hedeflerin</h3><span class="subtle">Kişisel ayarların</span></div><button class="secondary tiny" id="profileEditButton" type="button">Düzenle</button></div><div id="profileSummary"></div><p class="estimate">Öğün, tarif favorisi, alışveriş listesi ve günlük yaşam notların bu tarayıcıda saklanır. Hesap, parola kurtarma ve cihazlar arasında eşitleme yok. Tarayıcı depolaması silinirse veriler kaybolabilir; düzenli yedek al.</p></section>`);
  $('.profile-summary-card').after($('.home-flow'));

  $('.leftcol').insertAdjacentHTML('beforeend', `
    <section class="card profile-hub" data-app-view="profile"><div class="card-head"><div><h3>Uygulama alanları</h3><span class="subtle">İhtiyacın olan bölüme geç</span></div><span aria-hidden="true">✦</span></div><div class="hub-grid">
      <button type="button" data-go-screen="welcome"><span>👋</span><b>Başlangıç</b><small>Profilini kur ve kişiselleştir</small></button><button type="button" data-go-screen="shopping"><span>🛒</span><b>Alışveriş listesi</b><small>Malzemelerini düzenle</small></button><button type="button" data-go-screen="notifications"><span>🔔</span><b>Hatırlatıcılar</b><small>Bu cihazda yerel bildirim</small></button><button type="button" data-go-screen="settings"><span>⚙️</span><b>Ayarlar</b><small>Görünüm ve veri seçenekleri</small></button><button type="button" data-go-screen="privacy"><span>🛡️</span><b>Gizlilik</b><small>Verilerin nerede saklanır?</small></button><button type="button" data-go-screen="help"><span>❔</span><b>Yardım</b><small>Sık sorulan sorular</small></button>
    </div></section>
    <section class="card utility-page" data-app-view="welcome"><div class="onboarding-art" aria-hidden="true"><span>🌿</span><span>🥗</span><span>✦</span></div><span class="eyebrow">Hoş geldin</span><h2>Beslenme düzenin, kendi ritminde.</h2><p>Hedeflerini tahmini olarak hesapla, yediklerini kaydet ve uygulanabilir bir örnek plan hazırla. Üyelik ve ücretli servis gerekmez.</p><div class="welcome-privacy-note"><b>Hesap açmadan kullan</b><span>Profilin ve kayıtların yalnızca bu cihazdaki tarayıcıda saklanır. Bu, çevrimdışı ve ücretsiz kullanım sağlar.</span></div><div class="utility-actions"><button class="primary" id="welcomeSetup" type="button">Profilimi kişiselleştir</button><button class="secondary" data-go-screen="privacy" type="button">Gizlilik bilgisi</button></div><p class="estimate">18 yaş ve üzeri yetişkinler içindir. Kalori ve besin değerleri tahmindir; sağlık durumlarında uzman görüşü al.</p></section>
    <section class="card utility-page" data-app-view="notifications"><div class="card-head"><div><h3>Yerel hatırlatıcı</h3><span class="subtle">İsteğe bağlı · bu cihazda</span></div><span aria-hidden="true">🔔</span></div><p>Seçtiğin saatte, uygulama bu cihazda açıksa öğün kaydı için bildirim gösterebilir. İşletim sistemi uygulamayı uykuya alırsa hatırlatma gecikebilir. Zamanlanmış bildirim hizmeti veya sunucu kullanılmaz.</p><form id="reminderForm" class="reminder-form"><label class="check-item"><input id="reminderEnabled" type="checkbox"> Günlük hatırlatıcıyı etkinleştir</label><label for="reminderTime">Saat</label><div class="reminder-row"><input id="reminderTime" class="field" type="time" value="19:00"><button class="primary" type="submit">Hatırlatıcıyı kaydet</button></div></form><div class="inline-status" id="reminderStatus" role="status" aria-live="polite">Hatırlatıcı kapalı.</div><p class="estimate">Bildirim izni yalnızca “Hatırlatıcıyı kaydet” düğmesine bastığında istenir. İzni daha sonra cihaz ayarlarından değiştirebilirsin.</p></section>
    <section class="card utility-page" data-app-view="settings"><div class="card-head"><div><h3>Ayarlar</h3><span class="subtle">Uygulamayı kendine göre düzenle</span></div><span aria-hidden="true">⚙️</span></div><div class="settings-list"><div><div><b>Görünüm</b><small>Aydınlık veya koyu tema</small></div><button class="secondary" id="settingsTheme" type="button">Görünümü değiştir</button></div><div><div><b>Hatırlatıcılar</b><small>Uygulama açıkken yerel bildirim</small></div><button class="secondary" data-go-screen="notifications" type="button">Düzenle</button></div><div class="tracking-setting"><fieldset><legend>Takip tercihleri</legend><label class="check-item"><input id="trackCalories" type="checkbox" checked> Kalori takibini göster</label><label class="check-item"><input id="trackProtein" type="checkbox" checked> Protein takibini göster</label><label class="check-item"><input id="trackWeight" type="checkbox" checked> Kilo takibini göster</label><small id="trackingStatus" role="status" aria-live="polite">Bu cihazdaki görünümü seç.</small></fieldset></div><div><div><b>Profil ve hedefler</b><small>Bilgilerini güncelle, hedefleri yeniden hesapla</small></div><button class="secondary" id="settingsProfile" type="button">Profili aç</button></div><div><div><b>Veri yedeği</b><small>Yedeği indir veya geri yükle</small></div><button class="secondary" id="settingsBackup" type="button">Yedek seçenekleri</button></div></div><p class="estimate">Bu uygulama hesabına bağlanmaz. Tema ve profil tercihleri bu cihazdaki tarayıcıda tutulur.</p></section>
    <section class="card utility-page" data-app-view="privacy"><div class="card-head"><div><h3>Gizlilik ve veri kullanımı</h3><span class="subtle">Açık ve anlaşılır bilgi</span></div><span aria-hidden="true">🛡️</span></div><div class="privacy-points"><article><b>Verilerin cihazında</b><p>Profil, öğün, kilo, su ve günlük notlar bu tarayıcının yerel depolamasında tutulur; uygulama kodu bunları uygulama sunucusuna göndermez.</p></article><article><b>Yedekleme senin kontrolünde</b><p>Şifreli yedek dosyası parolanla cihazında oluşturulur. Parola veya dosya uygulamaya gönderilmez. Tarayıcı verisini silmek yedeklenmemiş kayıtları silebilir.</p></article><article><b>İsteğe bağlı kaynak bağlantısı</b><p>USDA besin kaynağı bağlantısını açarsan yalnızca aranan genel gıda adı o dış siteye gider. Reklam veya analiz kodu yoktur.</p></article><article><b>Barındırma bilgisi</b><p>GitHub Pages, ziyaret isteklerinde IP adresini güvenlik amacıyla kaydedebilir. Uygulama günlüklerini kişisel profilinle eşleştirmez.</p></article></div><div class="utility-actions"><a class="secondary" href="./gizlilik.html">Ayrıntılı gizlilik metnini aç</a><button class="secondary" data-go-screen="settings" type="button">Ayarlar</button></div></section>
    <section class="card utility-page" data-app-view="help"><div class="card-head"><div><h3>Yardım ve kullanım</h3><span class="subtle">Kısa yanıtlar</span></div><span aria-hidden="true">❔</span></div><details class="help-item"><summary>Uygulamaya nasıl başlarım?</summary><p>Başlangıç bölümünden yaş, boy, kilo ve hareket düzeyini gir. E-posta veya hesap gerekmez; bilgiler bu tarayıcıda kalır.</p></details><details class="help-item"><summary>Kalori ve protein değerleri kesin mi?</summary><p>Hayır. Hedefler bir denklem ve hareket varsayımına dayanır; öğün değerleri genel gıda verisi ve porsiyon tahminidir. Ürün etiketi ve tartılmış miktar daha doğru sonuç verir.</p></details><details class="help-item"><summary>Telefon değiştirirsem kayıtlarım ne olur?</summary><p>Kayıtları eski cihazda şifreli yedekle, yeni cihazda aynı parolayla geri yükle. Parolayı unutursan şifreli yedeği açmak mümkün değildir.</p></details><details class="help-item"><summary>Hatırlatıcı uygulama kapalıyken çalışır mı?</summary><p>Garanti edilmez. Uygulama sunucu kullanmaz; işletim sistemi tarayıcıyı uykuya alabilir. Bildirimler ancak bu cihazın izinleri uygunsa ve uygulama etkin durumdaysa gösterilebilir.</p></details><details class="help-item"><summary>Alerjiler tariflerde nasıl ele alınır?</summary><p>Yazdığın kaçınılan gıda adları eşleştirilerek tarif filtrelenir. Bu, ürün etiketini veya çapraz bulaşmayı doğrulamaz; alerji varsa malzeme ve etiketleri ayrıca kontrol et.</p></details><div class="utility-actions"><button class="secondary" data-go-screen="privacy" type="button">Gizlilik bilgisi</button><button class="secondary" data-go-screen="welcome" type="button">Başlangıca dön</button></div></section>
  `);

  const helpPanel = document.querySelector('[data-app-view="help"]');
  if (helpPanel) {
    const helpSearch = document.createElement('label'); helpSearch.className = 'help-search'; helpSearch.innerHTML = '<span>Yardımda ara</span><input class="field" id="helpSearchInput" type="search" placeholder="Örn. yedek, alerji, hedef" aria-label="Yardım konularında ara">';
    const helpEmpty = document.createElement('p'); helpEmpty.className = 'empty'; helpEmpty.textContent = 'Bu ifadeyle eşleşen yardım başlığı yok.'; helpEmpty.hidden = true;
    helpPanel.insertBefore(helpSearch, helpPanel.querySelector('details')); helpPanel.insertBefore(helpEmpty, helpPanel.querySelector('details'));
    $('#helpSearchInput').addEventListener('input', () => {
      const query = normalize($('#helpSearchInput').value.trim()), items = [...helpPanel.querySelectorAll('details.help-item')]; let visible = 0;
      for (const item of items) { const show = !query || normalize(item.textContent).includes(query); item.hidden = !show; if (show) visible++; }
      helpEmpty.hidden = visible > 0;
    });
  }

  function renderRecipes() {
    const grid = $('#recipeGrid'), query = normalize($('#recipeSearch').value.trim()), filter = $('#recipeFilter').value, pantry = (state().pantryItems || []).map(normalize).filter(Boolean);
    if (document.activeElement !== $('#pantryInput')) $('#pantryInput').value = (state().pantryItems || []).join(', ');
    const visible = recipes.filter(recipe => {
      if (excluded(recipe)) return false;
      if (filter === 'quick' && recipe.minutes > 15) return false;
      if (filter === 'saved' && !(state().savedRecipes || []).includes(recipe.id)) return false;
      if (filter === 'vegan' && recipe.diet !== 'vegan') return false;
      if (filter === 'pantry' && (!pantry.length || !recipe.ingredients.some(([id]) => { const food = foodFor(id); return food && pantry.some(term => [food.name, food.planName, ...food.terms].some(name => normalize(name).includes(term) || term.includes(normalize(name)))); }))) return false;
      if (!['all', 'quick', 'saved', 'vegan', 'pantry'].includes(filter) && filter !== recipe.type) return false;
      const searchText = normalize(recipe.name + ' ' + recipe.ingredients.map(([id]) => foodFor(id)?.name || '').join(' '));
      return !query || searchText.includes(query);
    }).sort((a, b) => filter !== 'pantry' ? 0 : pantryMatches(b, pantry) - pantryMatches(a, pantry));
    $('#recipeCount').textContent = `${visible.length} tarif`;
    grid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('div'); empty.className = 'empty';
      empty.textContent = filter === 'pantry' && !pantry.length ? 'Önce evdeki malzemeleri yazıp “Tarif bul” düğmesine bas.' : state().profile && (state().profile.avoid || state().profile.diet !== 'none') ? 'Tercih ve kaçındığın gıdalara uygun tarif bulunamadı. Profil ayarlarını gözden geçirebilirsin.' : 'Eşleşen tarif bulunamadı.';
      grid.append(empty); return;
    }
    for (const recipe of visible) {
      const factor = portions[recipe.id] || 1, total = recipeTotal(recipe), card = document.createElement('article');
      card.className = 'recipe-tile';
      const ingredients = recipe.ingredients.map(([id, grams]) => `${foodFor(id)?.planName || foodFor(id)?.name || id} ${Math.round(grams * factor)} g`);
      const favorite = (state().savedRecipes || []).includes(recipe.id);
      const pantryNote = filter === 'pantry' ? `<p class="estimate pantry-match">Evinde var: ${esc(recipe.ingredients.filter(([id]) => pantryHas(id, pantry)).map(([id]) => foodFor(id)?.planName || foodFor(id)?.name || id).join(', '))}<br>Tarif için gereken diğer malzemeler: ${esc(recipe.ingredients.filter(([id]) => !pantryHas(id, pantry)).map(([id]) => foodFor(id)?.planName || foodFor(id)?.name || id).join(', ') || 'Yazdıkların yeterli görünüyor')}</p>` : '';
      card.innerHTML = `<div class="recipe-photo-wrap"><img class="recipe-photo" src="./${recipe.image}" alt="${esc(recipe.name)} için özgün yemek çizimi" loading="lazy" decoding="async" width="800" height="500"><span class="recipe-time">${recipe.minutes} dk</span></div><div class="recipe-body"><div class="recipe-title"><span class="recipe-emoji" aria-hidden="true">${recipe.emoji}</span><div><strong>${esc(recipe.name)}</strong><small>${recipe.type === 'kahvalti' ? 'Kahvaltı' : recipe.type === 'vegan' ? 'Bitkisel' : 'Ana öğün'} · ${recipe.diet === 'vegan' ? 'Vegan' : recipe.diet === 'vegetarian' ? 'Vejetaryen' : recipe.diet === 'pescatarian' ? 'Pesketaryen' : 'Genel'}</small></div><button class="icon-btn recipe-favorite" data-recipe="${recipe.id}" type="button" aria-label="${favorite ? 'Kaydedilenlerden çıkar' : 'Tarifi kaydet'}" aria-pressed="${favorite}">${favorite ? '★' : '☆'}</button></div><div class="recipe-nutrition"><span class="recipe-calories">~${Math.round(total.kcal * factor)} kcal</span> <span>·</span> <span class="recipe-protein">~${(total.protein * factor).toFixed(1)} g protein</span> <span>·</span> ${factor.toLocaleString('tr-TR')} porsiyon</div>${pantryNote}<label class="portion-control">Porsiyon <select class="field" data-portion="${recipe.id}"><option value="0.5" ${factor === .5 ? 'selected' : ''}>½</option><option value="1" ${factor === 1 ? 'selected' : ''}>1</option><option value="1.5" ${factor === 1.5 ? 'selected' : ''}>1½</option><option value="2" ${factor === 2 ? 'selected' : ''}>2</option><option value="3" ${factor === 3 ? 'selected' : ''}>3</option></select></label><div class="recipe-actions"><button class="secondary tiny recipe-detail" data-recipe="${recipe.id}" type="button">Tarif ayrıntısı</button><button class="primary tiny recipe-add-meal" data-recipe="${recipe.id}" type="button">Öğüne ekle</button></div></div>`;
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
      const recipe = recipes.find(item => item.id === button.dataset.recipe), factor = portions[recipe.id] || 1, data = state(); data.shoppingList = data.shoppingList || []; const previous = JSON.parse(JSON.stringify(data.shoppingList));
      for (const [id, grams] of recipe.ingredients) {
        const food = foodFor(id); if (!food) continue;
        const key = `food-${id}`, existing = data.shoppingList.find(item => item.id === key), amount = Math.round(grams * factor);
        if (existing) { const current = parseFloat(existing.amount); existing.amount = Number.isFinite(current) ? `${Math.round(current + amount)} g` : `${amount} g`; }
        else data.shoppingList.push({ id: key, name: food.planName || food.name, amount: `${amount} g`, checked: false });
      }
      if (app.save()) { renderShoppingList(); app.setScreen('shopping'); app.toast('Malzemeler alışveriş listene eklendi', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) { renderShoppingList(); app.toast('Tarif malzemeleri geri alındı'); } } }); }
    }));
    grid.querySelectorAll('.recipe-detail').forEach(button => button.addEventListener('click', () => showRecipeDetail(button.dataset.recipe)));
  }

  function showRecipeDetail(id) {
    const recipe = recipes.find(item => item.id === id), dialog = $('#recipeDetailDialog');
    if (!recipe || !dialog) return;
    const factor = portions[recipe.id] || 1, total = recipeTotal(recipe);
    $('#recipeDetailContent').innerHTML = `<img class="recipe-detail-photo" src="./${recipe.image}" alt="${esc(recipe.name)} için özgün yemek çizimi" width="800" height="500"><div class="recipe-detail-heading"><div><span class="eyebrow">${recipe.minutes} dakikada · ${recipe.diet === 'vegan' ? 'Bitkisel' : recipe.diet === 'vegetarian' ? 'Vejetaryen' : recipe.diet === 'pescatarian' ? 'Pesketaryen' : 'Genel tarif'}</span><h2 id="recipeDetailTitle">${esc(recipe.name)}</h2></div><strong><span class="recipe-calories">~${Math.round(total.kcal * factor)} kcal</span><br><span class="recipe-protein">~${(total.protein * factor).toFixed(1)} g protein</span></strong></div><p class="estimate">${factor.toLocaleString('tr-TR')} porsiyon · Genel USDA kayıtlarından ve yaklaşık gram miktarlarından hesaplanmıştır.</p><h3>Malzemeler</h3><ul class="recipe-detail-ingredients">${recipe.ingredients.map(([foodId, grams]) => `<li><span>${esc(foodFor(foodId)?.planName || foodFor(foodId)?.name || foodId)}</span><b>${Math.round(grams * factor)} g</b></li>`).join('')}</ul><h3>Hazırlanışı</h3><ol class="recipe-detail-steps">${recipe.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><p class="notice">Alerjen eşleşmesi çapraz bulaşmayı veya ürün etiketini doğrulamaz. Kullandığın ürünlerin etiketini ayrıca kontrol et.</p>`;
    $('#recipeDetailAdd').dataset.recipe = recipe.id;
    $('#recipeDetailShop').dataset.recipe = recipe.id;
    dialog.showModal();
  }

  document.body.insertAdjacentHTML('beforeend', `<dialog class="detail-dialog" id="recipeDetailDialog" aria-labelledby="recipeDetailTitle"><div class="detail-dialog-head"><span class="eyebrow">Tarif ayrıntısı</span><button class="icon-btn dialog-close" type="button" aria-label="Tarif ayrıntısını kapat">×</button></div><div id="recipeDetailContent"></div><div class="detail-dialog-actions"><button class="secondary" id="recipeDetailShop" type="button">Alışveriş listesine ekle</button><button class="primary" id="recipeDetailAdd" type="button">Bugüne öğün ekle</button></div></dialog><dialog class="detail-dialog meal-detail-dialog" id="mealDetailDialog" aria-labelledby="mealDetailTitle"><div class="detail-dialog-head"><span class="eyebrow">Öğün ayrıntısı</span><button class="icon-btn meal-dialog-close" type="button" aria-label="Öğün ayrıntısını kapat">×</button></div><div id="mealDetailContent"></div></dialog>`);
  $('#recipeDetailDialog').addEventListener('click', event => { if (event.target === $('#recipeDetailDialog')) $('#recipeDetailDialog').close(); });
  $('.dialog-close').addEventListener('click', () => $('#recipeDetailDialog').close());
  $('#recipeDetailAdd').addEventListener('click', () => { const button = $('#recipeDetailAdd'); $('#recipeDetailDialog').close(); document.querySelector(`.recipe-add-meal[data-recipe="${button.dataset.recipe}"]`)?.click(); });
  $('#recipeDetailShop').addEventListener('click', () => { const button = $('#recipeDetailShop'); $('#recipeDetailDialog').close(); document.querySelector(`.recipe-add-shopping[data-recipe="${button.dataset.recipe}"]`)?.click(); });
  $('.meal-dialog-close').addEventListener('click', () => $('#mealDetailDialog').close());
  $('#mealDetailDialog').addEventListener('click', event => { if (event.target === $('#mealDetailDialog')) $('#mealDetailDialog').close(); });

  function renderShoppingList() {
    const data = state(); data.shoppingList = data.shoppingList || [];
    const list = $('#shoppingList'); list.replaceChildren();
    $('#shoppingCount').textContent = `${data.shoppingList.filter(item => !item.checked).length} ürün kaldı`;
    $('#clearCheckedShopping').disabled = !data.shoppingList.some(item => item.checked);
    $('#clearShopping').disabled = data.shoppingList.length === 0;
    $('#shoppingForm button[type="submit"]').disabled = data.shoppingList.length >= 500;
    if (!data.shoppingList.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'Listen boş. Tariflerden malzeme ekleyebilir veya ürün yazabilirsin.'; list.append(empty); }
    data.shoppingList.forEach((item, index) => {
      const row = document.createElement('div'); row.className = 'shopping-row' + (item.checked ? ' is-checked' : '');
      row.innerHTML = `<input type="checkbox" data-shopping-check="${index}" aria-label="${esc(item.name)} alındı" ${item.checked ? 'checked' : ''}><input class="field shopping-item-name" data-shopping-name="${index}" aria-label="Ürün adı" maxlength="120" value="${esc(item.name)}"><input class="field shopping-item-amount" data-shopping-amount="${index}" aria-label="Miktar" maxlength="40" value="${esc(item.amount || '')}"><button class="icon-btn" data-shopping-delete="${index}" type="button" aria-label="${esc(item.name)} ürününü sil">×</button>`;
      list.append(row);
    });
    list.querySelectorAll('[data-shopping-check]').forEach(input => input.addEventListener('change', () => { data.shoppingList[Number(input.dataset.shoppingCheck)].checked = input.checked; if (app.save()) renderShoppingList(); }));
    list.querySelectorAll('[data-shopping-delete]').forEach(button => button.addEventListener('click', () => { const previous = JSON.parse(JSON.stringify(data.shoppingList)); data.shoppingList.splice(Number(button.dataset.shoppingDelete), 1); if (app.save()) { renderShoppingList(); app.toast('Ürün listeden kaldırıldı', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) { renderShoppingList(); app.toast('Ürün geri eklendi'); } } }); } }));
    list.querySelectorAll('[data-shopping-name],[data-shopping-amount]').forEach(input => input.addEventListener('change', () => {
      const index = Number(input.dataset.shoppingName ?? input.dataset.shoppingAmount), item = data.shoppingList[index]; if (!item) return;
      if (input.hasAttribute('data-shopping-name')) { const value = input.value.trim(); if (!value) { renderShoppingList(); app.toast('Ürün adı boş bırakılamaz'); return; } item.name = value; }
      else item.amount = input.value.trim().slice(0, 40);
      if (app.save()) renderShoppingList();
    }));
  }

  function renderPlanFreshness() {
    const result = $('#planResult'), button = $('#addPlanShopping'), data = state(), plan = data.lastPlan;
    result.querySelector('.plan-stale-notice')?.remove();
    const currentSignature = app.profileFingerprint(data.profile), stale = !!plan && (!data.planSignature || data.planSignature !== currentSignature);
    button.hidden = !plan || stale || !Array.isArray(data.planShoppingItems) || !data.planShoppingItems.length;
    if (stale) {
      const notice = document.createElement('div'); notice.className = 'notice plan-stale-notice'; notice.setAttribute('role', 'status');
      notice.textContent = 'Profilin, hedefin veya beslenme tercihlerin son plandan sonra değişti. Bu plan eski bilgileri yansıtabilir; alışverişe aktarmadan önce yeniden oluştur.';
      const regenerate = document.createElement('button'); regenerate.type = 'button'; regenerate.className = 'secondary tiny'; regenerate.textContent = 'Güncel plan oluştur'; regenerate.addEventListener('click', () => $('#makePlan').click());
      notice.append(document.createElement('br'), regenerate); result.prepend(notice);
    }
  }

  $('#addPlanShopping').addEventListener('click', () => {
    const data = state(); if (!data.lastPlan || data.planSignature !== app.profileFingerprint(data.profile)) { renderPlanFreshness(); app.toast('Önce güncel tercihlerinle plan oluştur'); return; }
    const previous = JSON.parse(JSON.stringify(data.shoppingList || [])), generated = (data.planShoppingItems || []).map(item => ({ id: `plan-generated-${item.id}`, name: item.name, amount: `${item.grams} g`, checked: false }));
    data.shoppingList = [...previous.filter(item => !String(item.id).startsWith('plan-generated-')), ...generated];
    if (!app.save()) return;
    renderShoppingList(); app.setScreen('shopping');
    app.toast('Plan malzemeleri alışveriş listene eklendi', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) { renderShoppingList(); app.toast('Alışveriş listesi önceki hâline döndü'); } } });
  });

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

  const reportDate = date => date.toLocaleDateString('sv-SE');
  function reportRange(notify = true) {
    const from = $('#reportFrom').value, to = $('#reportTo').value, today = new Date().toLocaleDateString('sv-SE');
    if (!from || !to || from > to || to > today) { if (notify) app.toast('Tarih aralığını kontrol et. Gelecek gün seçilemez.'); return null; }
    const days = Math.round((new Date(to + 'T12:00:00') - new Date(from + 'T12:00:00')) / 86400000) + 1;
    if (days > 3660) { if (notify) app.toast('Tek rapor en fazla 10 yılı kapsayabilir.'); return null; }
    return { from, to, days };
  }
  function reportRows(range) {
    const data = state(), rows = [];
    for (let offset = 0; offset < range.days; offset++) {
      const date = new Date(range.from + 'T12:00:00'); date.setDate(date.getDate() + offset); const key = reportDate(date);
      const meals = data.days?.[key] || [], target = data.dayTargets?.[key] || {}, habit = data.habits?.[key] || {};
      const calories = meals.reduce((sum, meal) => sum + (Number.isFinite(meal.kcal) ? meal.kcal : 0), 0), protein = meals.reduce((sum, meal) => sum + (Number.isFinite(meal.protein) ? meal.protein : 0), 0);
      if (meals.length) rows.push({ date:key, type:'Öğün toplamı', name:`${meals.length} kayıtlı öğün`, kcal:Math.round(calories), protein:Math.round(protein * 10) / 10, weight:'', details:meals.some(meal => meal.unknown || meal.requiresConfirm) ? 'Bazı öğünlerde doğrulama veya eksik bilgi var; değerler tahmini' : 'Yalnızca kaydedilen öğünler', targetKcal:target.kcal ?? '', targetProtein:target.protein ?? '' });
      for (const meal of meals) rows.push({ date:key, type:'Öğün', name:meal.name, kcal:meal.kcal, protein:meal.protein, weight:'', details:[meal.assumption, meal.source].filter(Boolean).join(' · ') || (meal.approx ? 'Tahmini değer' : ''), targetKcal:'', targetProtein:'' });
      if (Object.prototype.hasOwnProperty.call(data.weights || {}, key)) rows.push({ date:key, type:'Kilo', name:'Kilo kaydı', kcal:'', protein:'', weight:data.weights[key], details:'kg', targetKcal:'', targetProtein:'' });
      if (Object.keys(habit).length) rows.push({ date:key, type:'Yaşam notu', name:'Günlük not', kcal:'', protein:'', weight:'', details:[habit.sleep != null ? `Uyku ${habit.sleep} saat` : '', habit.activity != null ? `Hareket ${habit.activity} dk` : '', habit.hunger != null ? `Açlık ${habit.hunger}/5` : '', habit.mood ? `Ruh hâli ${({good:'iyi',neutral:'nötr',low:'zor'})[habit.mood] || 'kaydedildi'}` : ''].filter(Boolean).join(' · '), targetKcal:'', targetProtein:'' });
    }
    return rows;
  }
  function renderReport() {
    const range = reportRange(false); if (!range) { $('#reportSummary').textContent = 'Tarih aralığını kontrol et. Bitiş, başlangıçtan önce veya bugünden sonra olamaz.'; return; }
    const rows = reportRows(range), dayRows = rows.filter(row => row.type === 'Öğün toplamı'), sum = key => dayRows.reduce((value, row) => value + Number(row[key] || 0), 0), complete = dayRows.filter(row => !row.details.includes('eksik bilgi')).length;
    const avgKcal = dayRows.length ? Math.round(sum('kcal') / dayRows.length) : null, avgProtein = dayRows.length ? Math.round(sum('protein') / dayRows.length * 10) / 10 : null;
    $('#reportSummary').innerHTML = rows.length ? `<div><b>${rows.length.toLocaleString('tr-TR')}</b><span>kayıt</span></div><div><b>${dayRows.length}</b><span>öğünlü gün</span></div><div><b>${avgKcal == null ? '—' : `${avgKcal} kcal`}</b><span>öğün kaydedilen günlerin ortalaması</span></div><div><b>${avgProtein == null ? '—' : `${avgProtein} g`}</b><span>öğün kaydedilen günlerin ortalaması</span></div><small>${complete} öğün toplamı eksiksiz işaretli gün · kayıt olmayan günler ortalamaya katılmadı.</small>` : '<div class="empty">Bu tarih aralığında kayıt bulunamadı. Aralığı değiştirip tekrar deneyebilirsin.</div>';
  }
  function exportReport() {
    const range = reportRange(); if (!range) return;
    const rows = reportRows(range); if (!rows.length) { app.toast('Dışa aktarılacak kayıt bulunamadı.'); return; }
    const columns = [['Tarih','date'],['Kayıt türü','type'],['Açıklama','name'],['Kalori (kcal)','kcal'],['Protein (g)','protein'],['Kilo (kg)','weight'],['Not ve varsayımlar','details'],['O günkü kalori hedefi (kcal)','targetKcal'],['O günkü protein hedefi (g)','targetProtein']];
    const cell = value => { let text = String(value ?? ''); if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"','""')}"`; };
    const csv = '\uFEFF' + [columns.map(([label]) => cell(label)).join(','), ...rows.map(row => columns.map(([, key]) => cell(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })), link = document.createElement('a'); link.href = url; link.download = `iyibeslen-rapor-${range.from}-${range.to}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); app.toast('CSV raporu bu cihaza indirildi.');
  }
  const reportTo = $('#reportTo'), reportFrom = $('#reportFrom'), reportToday = new Date(), reportStart = new Date(reportToday); reportStart.setDate(reportStart.getDate() - 29);
  reportFrom.value = reportDate(reportStart); reportTo.value = reportDate(reportToday); reportTo.max = reportDate(reportToday); reportFrom.max = reportDate(reportToday);
  $('#reportRefresh').addEventListener('click', renderReport); $('#reportExport').addEventListener('click', exportReport);
  for (const input of [reportFrom, reportTo]) input.addEventListener('change', renderReport);
  renderReport();

  function renderProfileSummary() {
    const box = $('#profileSummary'), profile = state().profile;
    if (!profile) { box.innerHTML = '<p class="subtle">Henüz profil oluşturmadın. İstersen temel bilgilerini girerek yaklaşık günlük hedef alabilirsin.</p>'; return; }
    const goal = { lose: 'Yavaşça kilo vermek', maintain: 'Kiloyu korumak', gain: 'Kilo almak', muscle: 'Kas gelişimini desteklemek', balanced: 'Daha dengeli beslenmek', track: 'Yalnızca kayıt tutmak' }[profile.goal] || 'Takip modu';
    const diet = { none: 'Özel tercih yok', vegetarian: 'Vejetaryen', vegan: 'Vegan', pescatarian: 'Pesketaryen' }[profile.diet] || 'Özel tercih yok';
    const target = app.goalForDay(), tracking = state().trackingPreferences || { calories: true, protein: true, weight: true };
    const kcalText = tracking.calories === false ? 'Kalori takibi kapalı' : profile.goal === 'track' ? 'Kişisel hedef gösterilmiyor' : target ? `${Math.round(target.kcalMin ?? target.kcal)}–${Math.round(target.kcalMax ?? target.kcal)} kcal` : 'Kalori hedefi uzmanla belirlenmeli';
    const proteinLow = target?.proteinMin ?? target?.protein, proteinHigh = target?.proteinMax ?? target?.protein;
    const proteinText = tracking.protein === false ? 'Protein takibi kapalı' : profile.goal === 'track' ? 'Kişisel hedef gösterilmiyor' : proteinLow != null ? `${Math.round(proteinLow)}${proteinLow === proteinHigh ? '' : `–${Math.round(proteinHigh)}`} g protein` : 'Protein hedefi uzmanla belirlenmeli';
    const targetParts = [];
    if (tracking.calories !== false) targetParts.push(`<span class="profile-calorie-value">${esc(kcalText)}</span>`);
    if (tracking.protein !== false) targetParts.push(`<span class="profile-protein-value">${esc(proteinText)}</span>`);
    const targetSummary = targetParts.length ? targetParts.join(' · ') : 'Günlük hedef özetleri Ayarlar bölümünde kapalı.';
    const weightGoal = profile.targetWeight && ['lose', 'gain'].includes(profile.goal) ? `Hedef kilo: ${Number(profile.targetWeight).toLocaleString('tr-TR')} kg${profile.goalWeeks ? ` · tercih edilen süre ${profile.goalWeeks} hafta` : ''}${profile.milestoneWeight ? ` · ara hedef ${Number(profile.milestoneWeight).toLocaleString('tr-TR')} kg` : ''}` : '';
    box.innerHTML = `<div class="profile-facts"><span>${esc(profile.age)} yaş</span><span>${esc(profile.height)} cm</span><span class="profile-weight-fact">${esc(profile.weight)} kg</span><span>${esc(goal)}</span></div><p class="subtle">Beslenme: ${esc(diet)}${profile.avoid ? ` · Kaçındıkların: ${esc(profile.avoid)}` : ''}</p>${weightGoal ? `<p class="subtle">${esc(weightGoal)} · tahmini kontrol; kalori formülünü değiştirmez.</p>` : ''}<p class="subtle">Günlük hedef: ${targetSummary}</p>`;
  }

  window.addEventListener('iyibeslen:tracking-change', () => { renderProfileSummary(); renderHomeFlow(); });

  function renderHomeFlow() {
    const data = state(), date = app.getSelectedDate(), entries = data.days?.[date] || [], categories = new Set(entries.map(item => item.category));
    const slots = [
      { key: 'breakfast', label: 'Kahvaltı', before: 11 }, { key: 'lunch', label: 'Öğle yemeği', before: 16 },
      { key: 'dinner', label: 'Akşam yemeği', before: 21 }, { key: 'snack', label: 'Ara öğün', before: 24 }
    ];
    const hour = new Date().getHours(), remaining = slots.filter(slot => !categories.has(slot.key));
    const next = remaining.find(slot => hour < slot.before) || remaining[0];
    $('#homeNextMeal').textContent = next ? next.label : 'Bugünkü öğünlerin kaydedildi';
    $('#homeNextMealNote').textContent = next ? 'Yemek saati sana bağlı; istersen kaydını hazırla.' : 'İstersen bir içecek veya ara öğün de ekleyebilirsin.';
    const plan = data.lastPlan;
    if (plan?.period === 'day') {
      $('#homePlanTitle').textContent = 'Günlük örnek planın hazır';
      $('#homePlanNote').textContent = `Son plan · ${plan.date} · porsiyon ve değerler yaklaşık.`;
    } else if (plan?.period === 'week') {
      $('#homePlanTitle').textContent = '7 günlük planın hazır';
      $('#homePlanNote').textContent = `Son plan · ${plan.date} · günlük toplamları Plan bölümünde gör.`;
    } else {
      $('#homePlanTitle').textContent = data.profile ? 'Bugün için örnek plan oluştur' : 'Önce profilini tamamla';
      $('#homePlanNote').textContent = 'Hedef ve beslenme tercihlerinle ücretsiz bir örnek hazırla.';
    }
    const loggedDays = [];
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const day = new Date(`${date}T12:00:00`); day.setDate(day.getDate() - daysAgo);
      const key = day.toLocaleDateString('sv-SE'), meals = data.days?.[key] || [];
      if (meals.length) loggedDays.push({ complete: meals.every(item => !item.unknown) });
    }
    const complete = loggedDays.filter(day => day.complete).length;
    $('#homeWeekCount').textContent = loggedDays.length
      ? `Son 7 günde ${loggedDays.length} kayıtlı gün · ${complete} günün besin değerleri biliniyor`
      : 'Son 7 günde henüz öğün kaydı yok';
  }

  function showMealDetail(index) {
    const meal = state().days?.[app.getSelectedDate()]?.[index];
    if (!meal) return;
    const detail = $('#mealDetailContent');
    detail.innerHTML = `<span class="eyebrow">${esc(({ breakfast: 'Kahvaltı', lunch: 'Öğle yemeği', dinner: 'Akşam yemeği', snack: 'Ara öğün', other: 'Atıştırmalık / içecek' }[meal.category] || 'Öğün'))} · ${esc(app.getSelectedDate())}</span><h2 id="mealDetailTitle">${esc(meal.name)}</h2><div class="meal-detail-macros"><div class="meal-detail-calories"><span>Enerji</span><b>${meal.unknown ? 'Bilinmiyor' : `~${Math.round(meal.kcal)} kcal`}</b></div><div class="meal-detail-protein"><span>Protein</span><b>${meal.unknown ? 'Bilinmiyor' : `~${Number(meal.protein).toLocaleString('tr-TR')} g`}</b></div></div><div class="privacy-points"><article><b>Porsiyon ve hesap varsayımı</b><p>${esc(meal.assumption || 'Bu kayıt için ayrıca varsayım belirtilmemiş.')}</p></article><article><b>Besin kaynağı</b><p>${esc(meal.source || 'Özel veri kaynağı belirtilmedi; değer tahminidir.')}</p></article></div><p class="notice">Bu kayıt yaklaşık değer içerir. Porsiyon, ürün markası ve pişirme şekli sonucu değiştirebilir.</p>`;
    $('#mealDetailDialog').showModal();
  }

  const mealList = $('#mealList');
  const addMealDetailActions = () => mealList.querySelectorAll('.meal').forEach((row, index) => {
    const actions = row.querySelector('.meal-actions');
    if (!actions || actions.querySelector('.meal-detail')) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-btn meal-detail'; button.dataset.index = String(index); button.setAttribute('aria-label', 'Öğün ayrıntılarını göster'); button.textContent = 'ⓘ';
    button.addEventListener('click', () => showMealDetail(Number(button.dataset.index)));
    actions.append(button);
  });
  new MutationObserver(addMealDetailActions).observe(mealList, { childList: true });
  addMealDetailActions();

  document.addEventListener('click', event => {
    const route = event.target.closest('[data-go-screen]');
    if (route) app.setScreen(route.dataset.goScreen);
    if (event.target.closest('[data-focus-meal]')) { app.setScreen('today'); setTimeout(() => $('#mealInput').focus(), 120); }
  });

  $('#welcomeSetup').addEventListener('click', app.openProfile);
  $('#settingsTheme').addEventListener('click', () => $('#themeToggle').click());
  $('#settingsProfile').addEventListener('click', app.openProfile);
  $('#settingsBackup').addEventListener('click', () => { app.setScreen('profile'); setTimeout(() => $('#backup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); });

  const REMINDER_KEY = 'iyibeslen-reminder-v1';
  const loadReminder = () => { try { const value = JSON.parse(localStorage.getItem(REMINDER_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } };
  function renderReminder() {
    const reminder = loadReminder();
    $('#reminderEnabled').checked = reminder.enabled === true;
    $('#reminderTime').value = /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time || '') ? reminder.time : '19:00';
    $('#reminderStatus').textContent = !reminder.enabled ? 'Hatırlatıcı kapalı.' : ('Notification' in window && Notification.permission === 'granted' ? `Her gün ${reminder.time} için ayarlı · uygulama etkin olduğunda.` : 'Hatırlatıcı ayarlı; cihaz bildirim iznini kontrol et.');
  }
  $('#reminderForm').addEventListener('submit', async event => {
    event.preventDefault();
    const enabled = $('#reminderEnabled').checked, time = $('#reminderTime').value;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { $('#reminderStatus').textContent = 'Geçerli bir saat seç.'; return; }
    if (enabled) {
      if (!('Notification' in window) || !window.isSecureContext) { $('#reminderStatus').textContent = 'Bu tarayıcı yerel bildirimleri desteklemiyor. Hatırlatıcı kapalı kaldı.'; return; }
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      if (permission !== 'granted') { $('#reminderStatus').textContent = 'Bildirim izni verilmedi; hatırlatıcı kapalı kaldı.'; return; }
    }
    try { localStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled, time, lastDate: loadReminder().lastDate || '' })); renderReminder(); app.toast(enabled ? 'Yerel hatırlatıcı kaydedildi' : 'Hatırlatıcı kapatıldı'); }
    catch { $('#reminderStatus').textContent = 'Ayar kaydedilemedi. Tarayıcı depolama alanını kontrol et.'; }
  });
  renderReminder();
  window.setInterval(() => {
    const reminder = loadReminder(), now = new Date(), today = now.toLocaleDateString('sv-SE');
    if (!reminder.enabled || reminder.lastDate === today || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` !== reminder.time) return;
    const title = 'Beslenme günlüğün'; const options = { body: 'İstersen bugünkü öğün kaydını tamamla.', icon: './icons/icon-192.svg', tag: 'iyibeslen-daily-reminder' };
    if (navigator.serviceWorker?.controller) navigator.serviceWorker.ready.then(registration => registration.showNotification(title, options)).catch(() => new Notification(title, options));
    else new Notification(title, options);
    try { localStorage.setItem(REMINDER_KEY, JSON.stringify({ ...reminder, lastDate: today })); } catch {}
  }, 30000);
  window.addEventListener('iyibeslen:select-day', renderHomeFlow);
  window.addEventListener('iyibeslen:data-changed', renderHomeFlow);
  window.addEventListener('iyibeslen:reset-theme', renderHomeFlow);

  $('#recipeSearch').addEventListener('input', renderRecipes);
  $('#recipeFilter').addEventListener('change', renderRecipes);
  $('#pantryForm').addEventListener('submit', event => {
    event.preventDefault(); const data = state(), previous = [...(data.pantryItems || [])];
    const items = [...new Set($('#pantryInput').value.split(/[,;\n]/).map(value => value.trim().slice(0, 40)).filter(Boolean))].slice(0, 20);
    if (!items.length) { data.pantryItems = []; if (app.save()) { renderRecipes(); app.toast('Evdeki malzeme listesi temizlendi', { label: 'Geri al', run: () => { state().pantryItems = previous; if (app.save()) renderRecipes(); } }); } return; }
    data.pantryItems = items;
    if (app.save()) { $('#recipeFilter').value = 'pantry'; renderRecipes(); app.toast(`${items.length} malzeme kaydedildi · tarifler güncellendi`, { label: 'Geri al', run: () => { state().pantryItems = previous; if (app.save()) { renderRecipes(); app.toast('Malzeme listen geri alındı'); } } }); }
  });
  $('#shoppingForm').addEventListener('submit', event => {
    event.preventDefault(); const data = state(); data.shoppingList = data.shoppingList || [];
    if (data.shoppingList.length >= 500) { app.toast('Alışveriş listesi en fazla 500 ürün içerebilir.'); return; }
    const name = $('#shoppingName').value.trim();
    if (!name) { $('#shoppingName').focus(); app.toast('Listeye eklemek için ürün adını yaz.'); return; }
    const previous = JSON.parse(JSON.stringify(data.shoppingList));
    data.shoppingList.push({ id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, amount: $('#shoppingAmount').value.trim(), checked: false });
    if (app.save()) { $('#shoppingName').value = ''; $('#shoppingAmount').value = ''; renderShoppingList(); app.toast('Ürün eklendi', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) { renderShoppingList(); app.toast('Ürün eklemesi geri alındı'); } } }); }
  });
  $('#clearCheckedShopping').addEventListener('click', () => { const data = state(), previous = JSON.parse(JSON.stringify(data.shoppingList || [])); data.shoppingList = (data.shoppingList || []).filter(item => !item.checked); if (app.save()) { renderShoppingList(); app.toast('Tamamlanan ürünler kaldırıldı', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) renderShoppingList(); } }); } });
  $('#clearShopping').addEventListener('click', () => { const data = state(); if (!data.shoppingList?.length) return; if (confirm('Alışveriş listesindeki bütün ürünleri silmek istiyor musun?')) { const previous = JSON.parse(JSON.stringify(data.shoppingList)); data.shoppingList = []; if (app.save()) { renderShoppingList(); app.toast('Alışveriş listesi temizlendi', { label: 'Geri al', run: () => { state().shoppingList = previous; if (app.save()) { renderShoppingList(); app.toast('Alışveriş listesi geri yüklendi'); } } }); } } });
  $('#habitForm').addEventListener('submit', event => {
    event.preventDefault();
    const sleep = $('#habitSleep').value === '' ? null : Number($('#habitSleep').value), activity = $('#habitActivity').value === '' ? null : Number($('#habitActivity').value), hunger = $('#habitHunger').value === '' ? null : Number($('#habitHunger').value), mood = $('#habitMood').value;
    if ((sleep !== null && (!Number.isFinite(sleep) || sleep < 0 || sleep > 24)) || (activity !== null && (!Number.isInteger(activity) || activity < 0 || activity > 600)) || (hunger !== null && (!Number.isInteger(hunger) || hunger < 1 || hunger > 5))) { app.toast('Uyku, hareket veya açlık değerini belirtilen aralıkta kontrol et.'); return; }
    const record = {}; if (sleep !== null) record.sleep = sleep; if (activity !== null) record.activity = activity; if (hunger !== null) record.hunger = hunger; if (mood) record.mood = mood;
    const data = state(), key = app.getSelectedDate(); data.habits = data.habits || {};
    if (Object.keys(record).length) data.habits[key] = record; else delete data.habits[key];
    if (app.save()) { renderHabits(); app.toast('Günlük yaşam notları kaydedildi'); }
  });
  $('#profileEditButton').addEventListener('click', app.openProfile);
  window.addEventListener('iyibeslen:select-day', () => { renderHabits(); renderProfileSummary(); renderReport(); });
  window.addEventListener('iyibeslen:reset-theme', () => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); renderReport(); });
  window.addEventListener('iyibeslen:data-changed', () => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); renderPlanFreshness(); renderReport(); });
  $('#deleteData').addEventListener('click', () => setTimeout(() => { renderShoppingList(); renderRecipes(); renderHabits(); renderProfileSummary(); renderReport(); }, 0));

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
    const planShoppingItems = [];
    if (value.planShoppingItems != null) {
      if (!Array.isArray(value.planShoppingItems) || value.planShoppingItems.length > 200) return null;
      for (const item of value.planShoppingItems) {
        if (!isRecord(item) || typeof item.id !== 'string' || !foodDB.some(food => food.id === item.id) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || !Number.isInteger(item.grams) || item.grams < 1 || item.grams > 100000) return null;
        planShoppingItems.push({ id: item.id, name: item.name.trim(), grams: item.grams });
      }
    }
    const planSignature = typeof value.planSignature === 'string' && value.planSignature.length <= 32 ? value.planSignature : '';
    const pantryItems = [];
    if (value.pantryItems != null) {
      if (!Array.isArray(value.pantryItems) || value.pantryItems.length > 20 || value.pantryItems.some(item => typeof item !== 'string' || !item.trim() || item.length > 40)) return null;
      pantryItems.push(...[...new Set(value.pantryItems.map(item => item.trim()))]);
    }
    backup.savedRecipes = savedRecipes; backup.habits = habits; backup.shoppingList = shoppingList; backup.planShoppingItems = planShoppingItems; backup.planSignature = planSignature; backup.pantryItems = pantryItems;
    return backup;
  });
  app.registerSavedDataCheck(data => !!data && ((data.savedRecipes || []).length > 0 || Object.keys(data.habits || {}).length > 0 || (data.shoppingList || []).length > 0 || (data.planShoppingItems || []).length > 0 || (data.pantryItems || []).length > 0));
  const trackingKeys = [['trackCalories', 'calories'], ['trackProtein', 'protein'], ['trackWeight', 'weight']];
  const currentTracking = state().trackingPreferences || { calories: true, protein: true, weight: true };
  for (const [id, key] of trackingKeys) $(`#${id}`).checked = currentTracking[key] !== false;
  function updateTrackingStatus() {
    const prefs = state().trackingPreferences || {};
    const hidden = trackingKeys.filter(([, key]) => prefs[key] === false).map(([, key]) => ({ calories: 'kalori', protein: 'protein', weight: 'kilo' }[key]));
    $('#trackingStatus').textContent = hidden.length ? `${hidden.join(', ')} özetleri gizli. Eski kayıtların silinmez; yeniden açınca görünür.` : 'Kalori, protein ve kilo özeti gösteriliyor.';
    const savedPlan = $('.saved-plan-text'), planNotice = $('.saved-plan-hidden-notice');
    if (savedPlan) savedPlan.hidden = prefs.calories === false || prefs.protein === false;
    if ((prefs.calories === false || prefs.protein === false) && savedPlan && !planNotice) { const notice = document.createElement('p'); notice.className = 'estimate saved-plan-hidden-notice'; notice.textContent = 'Önceki plan özeti, kapalı besin takiplerinden değer gösterebileceği için gizlendi.'; $('#planResult').append(notice); }
    if (prefs.calories !== false && prefs.protein !== false) planNotice?.remove();
  }
  for (const [id, key] of trackingKeys) $(`#${id}`).addEventListener('change', () => {
    const previous = { ...(state().trackingPreferences || { calories: true, protein: true, weight: true }) };
    state().trackingPreferences = { ...previous, [key]: $(`#${id}`).checked };
    if (!app.save()) { state().trackingPreferences = previous; $(`#${id}`).checked = previous[key] !== false; return; }
    window.dispatchEvent(new CustomEvent('iyibeslen:tracking-change'));
    updateTrackingStatus();
    app.toast('Takip görünümü güncellendi. Kayıtların cihazında duruyor.');
  });
  updateTrackingStatus();
  renderRecipes(); renderShoppingList(); renderHabits(); renderProfileSummary(); renderHomeFlow(); renderPlanFreshness();
})();
