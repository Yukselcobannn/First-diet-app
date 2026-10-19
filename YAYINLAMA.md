# Ücretsiz yayınlama

Uygulama statik bir PWA olarak hazırlanmıştır. Bir sunucu veya mağaza hesabı gerektirmez. Ücretsiz GitHub Pages yayını için GitHub Free hesabı ve **public (herkese açık)** bir depo gerekir.

## GitHub Pages'e yükleme

1. GitHub'da `iyi-beslen` gibi bir adla yeni bir **public** depo oluştur.
2. Bu klasördeki `index.html`, `manifest.webmanifest`, `service-worker.js` ve `icons/` klasörünü depo köküne yükle. Klasör yapısını koru.
3. Depoda **Settings → Pages** bölümünü aç.
4. **Build and deployment → Deploy from a branch** seç; dal olarak `main`, klasör olarak `/(root)` belirleyip kaydet.
5. Yayın tamamlanınca Pages bölümünde verilen `https://kullanici-adin.github.io/iyi-beslen/` adresini aç.

GitHub Pages, GitHub Free hesaplarında public depolardan yayın yapabilir. Özel alan adı almak zorunlu değildir; ücretsiz `github.io` adresi yeterlidir.

## Telefona ekleme

- **Android:** Yayın adresini Chrome'da aç, menüden **Uygulamayı yükle** veya **Ana ekrana ekle** seç.
- **iPhone:** Adresi Safari'de aç, **Paylaş → Ana Ekrana Ekle** seç.

Service worker uygulama kabuğunu önbelleğe alır; ilk ziyaret ve kurulum için internet gerekir.

## Veri ve gizlilik

Depodaki uygulama kodu herkese açık olur. Profilin, öğünlerin ve kilon bu uygulamada cihazındaki tarayıcı depolamasında tutulur; GitHub'a yüklenmez ve başka cihazlarla eşitlenmez. Tarayıcı verisini silmek veya başka cihaza geçmek kayıtları etkileyebilir; uygulamadaki dışa aktarma seçeneğiyle yedek al.
