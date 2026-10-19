# Ücretsiz uygulama bağlantısı ve kullanım

Uygulama GitHub Pages üzerinden ücretsiz yayınlanıyor:

**[Beslenme Günlüğüm’ü aç](https://yukselcobannn.github.io/First-diet-app/)**

Kaynak kodu, kendi GitHub hesabındaki [`First-diet-app` deposunda](https://github.com/Yukselcobannn/First-diet-app) herkese açıktır. Yayın `main` dalının kök klasöründen yapılır; bu dala gönderilen yeni sürümler Pages tarafından yayımlanır. Özel alan adı veya ücretli sunucu gerekmez.

## Telefonda uygulama gibi kullanma

- **Android:** Bağlantıyı Chrome'da aç. Uygulama yükleme düğmesi görünürse ona dokun; görünmezse `⋮ → Ana ekrana ekle` veya `Uygulamayı yükle` seç.
- **iPhone:** Bağlantıyı Safari'de aç, `Paylaş → Ana Ekrana Ekle` seç.

İlk açılışta profilini oluştur. Sonra ana ekrana eklenen simgeden tam ekran uygulama gibi açabilirsin.

## İlk kullanım

1. Uygulamayı açıp **Şimdi başla** ile yaş, boy, kilo, cinsiyet, hareket düzeyi ve hedef bilgilerini gir.
2. İstersen beslenme tercihini, alerjileri ve kaçınmak istediğin yiyecekleri ekle.
3. Ana ekranda yediğini veya içtiğini doğal dille yazıp **Öğün ekle** seç. Porsiyon belirtilmemişse uygulama varsayımını gösterir.
4. **Sana özel plan** bölümünden günlük veya haftalık örnek plan oluştur.
5. Üstteki tarih seçicisiyle geçmiş günleri görüntüleyip o güne öğün veya kilo kaydı ekleyebilir; sağ üstten koyu görünümü açabilirsin.

Hesaplamalar ve besin değerleri tahminidir; uygulama tıbbi öneri vermez. Sağlık durumun varsa kişisel hedefler için doktor veya diyetisyene danış.

Uygulama kabuğu çevrimdışı kullanım için önbelleğe alınır. İlk açılış ve kurulum için internet gerekir. Yeni sürüm yayımlandığında ekranda **Şimdi güncelle** bildirimi görünür; güncelleme seçildiğinde uygulama yenilenir, bu cihazdaki kayıtların korunur.

## Veri ve gizlilik

Kaynak kodu, GitHub kullanıcı adın ve commit geçmişi herkese görünür. Profil, öğün, kilo, alerji/tercih ve sağlık bildirimleri bu cihazdaki uygulama/tarayıcı depolamasına kaydedilir; uygulama kodu bu kayıtları GitHub'a veya başka bir uygulama sunucusuna göndermez ve cihazlar arasında eşitlemez. Bu yerel kayıtlar uygulama tarafından şifrelenmez; aynı cihaz veya tarayıcı profiline erişen biri görebilir. GitHub Pages ise ziyaretçilerin IP adreslerini güvenlik amacıyla kaydettiğini belirtir. Ayrıntı için uygulamadaki **Gizlilik ve uygulama bilgisi** sayfasını oku.

Tarayıcı verisini silmek veya uygulamayı kaldırmak yerel kayıtları silebilir. **Şifreli yedek indir** tüm profil, öğün, kilo, hedef ve sık kullanılan kayıtlarını AES-GCM ile korunan bir `.iyb` dosyasına aktarır; dosyayı başka telefonda **Şifreli yedeği geri yükle** ile açabilirsin. Parola yalnızca işlem sırasında cihazında kullanılır; uygulamaya kaydedilmez ve sunucuya gönderilmez. Parolayı unutursan dosya açılamaz; dosya ile parolayı ayrı ve güvenli sakla. **Yedek indir** seçeneği hâlâ şifresiz JSON oluşturur. Mevcut kayıtların varsa geri yüklemeden önce uygulama onları da aynı parola ile şifreli olarak indirir. Otomatik cihaz yedeği/senkronizasyonu yoktur. **Tüm verileri sil** uygulamanın bu tarayıcıdaki kayıtlarını ve görünüm tercihini siler; indirilmiş yedek dosyalarını ayrıca silmen gerekir.

GitHub Pages ücretsiz, statik barındırmadır; bu proje GitHub Free'de public depo gerektirir. Bu nedenle herkese açık kaynak koduna özel kullanıcı verisi, parola veya yedek ekleme. Uygulamaya girilen kişisel kayıtlar depoya eklenmez.
