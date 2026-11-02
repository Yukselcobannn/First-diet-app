# Sıfır maliyet taahhüdü

Bu proje, geliştiren kişi ve kullanıcılar için temel kullanımda ücret istemeden çalışacak şekilde tasarlanmıştır. Ücretli bir araç, abonelik veya ücret riski doğurabilecek deneme hesabı eklenmeden önce bu belge ve uygulama akışı yeniden değerlendirilir; açık kullanıcı onayı olmadan böyle bir bağımlılık eklenmez.

## Bugünkü teknik yapı

| İşlev | Nasıl çalışır? | Maliyet / sınır |
| --- | --- | --- |
| Uygulama ve kaynak kodu | GitHub Pages ile public GitHub deposundan statik dosya yayını | GitHub Free'de public depolar için ücretsizdir. Depo ve kaynak kodu herkese açıktır. |
| Profil, hedefler, öğünler ve raporlar | Tarayıcının `localStorage` alanında, kullanıcının cihazında | Sunucu, hesap veya bulut veritabanı yoktur. Tarayıcı verisi silinirse kayıtlar kaybolabilir. |
| Çevrimdışı kullanım | Service Worker ile uygulama dosyaları ve yerel besin listesi önbelleğe alınır | İlk yükleme ve yeni sürümü alma için internet gerekir. Temel takip sonrasında bağlantısız çalışır. |
| Kalori, protein, plan ve rapor | Uygulama içindeki JavaScript hesapları ve yerel besin tablosu | API çağrısı veya kullanım başına ücret yoktur. |
| Yerel beslenme asistanı | Kullanıcı açıkça etkinleştirirse uygulamadaki kayıtları ve tarif listesini cihazda işleyen kural tabanlı yardımcı | Varsayılan olarak kapalıdır. Harici model, yapay zekâ API'si veya sohbet sunucusu yoktur. Sohbet geçmişi saklanmaz; izin kapatılabilir. |
| Besin verisi | Uygulama içinde yer alan, USDA FoodData Central SR Legacy genel kayıtlarından seçilmiş küçük tablo | USDA'ya canlı arama yapılmaz; değerler yaklaşık ve sınırlı listedir. |
| Yedekleme | Dosya doğrudan kullanıcının cihazına indirilir; şifreli seçenek Web Crypto ile cihazda çalışır | Bulut eşitleme yoktur. Kullanıcı dosyasını kendisi güvenli saklar. |
| Hatırlatmalar | Tarayıcının yerel bildirim izni ve uygulama içi hatırlatmalar | Bildirim sunucusu veya ücretli gönderim hizmeti yoktur. Tarayıcı/işletim sistemi kısıtları olabilir. |

## Bilerek eklenmeyen hizmetler

- Ödeme altyapısı, kredi kartı, abonelik, deneme paketi veya uygulama içi satın alma
- Ücretli ya da ücretsiz kota sonrasında ücret doğurabilecek yapay zekâ, barkod, analiz veya besin arama API'si
- Firebase, Supabase veya başka bir bulut veritabanı; hesap açma ve cihazlar arası otomatik eşitleme
- Reklam ağı, davranış analitiği, takip pikseli ve üçüncü taraf oturum izleme
- Özel alan adı, ücretli sunucu, ücretli uygulama mağazası üyeliği veya zorunlu lisans

Bu yüzden barkodla arama, fotoğraftan tanıma, bulut eşitleme ve sunucudan anlık bildirim gibi hizmetler temel uygulamada yoktur. Yerel asistan; kullanıcı açıkça etkinleştirdikten sonra günlük özet, protein durumu, evdeki malzemelerle eşleşen tarif fikri, su kaydı ve günlük/haftalık plan oluşturma önerisi sunar. Kural tabanlıdır; dil modeli gibi davranmaz ve bilgi uydurmaz. Temel akışı güçlendirmek için yeni özellik gerektiğinde önce yerel, açık kaynaklı ve çevrimdışı bir yol araştırılır.

## Yayın şekli ve sınırlar

Uygulama Android ve iPhone'da tarayıcıdan ana ekrana eklenebilen bir PWA'dır. Play Store ve App Store'da yer alma bu proje için kullanılmaz; her iki mağaza da geliştirici üyeliği gerektirebilir. Yayın adresi GitHub'ın `github.io` alan adını kullanır; özel alan adı satın alınmaz.

GitHub Pages, GitHub Free'de public depolar için kullanılabilir. GitHub'ın yayımladığı güncel kullanım sınırları arasında site ve kaynak depo için 1 GB öneri/sınır, aylık 100 GB yumuşak bant genişliği sınırı, saatte 10 derleme ve 10 dakikalık derleme zaman aşımı vardır. Pages ticari işlem, e-ticaret veya ağırlıklı olarak ticari SaaS hizmeti için tasarlanmamıştır. Bu uygulama ödeme kabul etmez ve kullanıcı hesabı işletmez. GitHub bu şartları değiştirebilir veya sınır aşımında yayını kısıtlayabilir; böyle bir durumda ücretli hizmete geçilmeyecek, uygulama indirildiği cihazda çevrimdışı kullanılmaya devam edecek ve yalnızca ücretsiz bir yayın alternatifi değerlendirilir.

GitHub Pages ziyaretlerde IP adresini güvenlik amacıyla kaydedebilir. Bu, uygulamanın kişisel beslenme kayıtlarını GitHub'a göndermesi değildir; uygulama verisi tarayıcıda kalır. Ayrıntılar için uygulamadaki gizlilik sayfasına bak.

## Kontrol listesi

Yeni bir bağımlılık eklenmeden önce şu koşullar aranır:

1. Temel uygulama onsuz da çalışabiliyor mu?
2. Tamamen ücretsiz, açık kaynaklı veya cihazda çalışan bir alternatif var mı?
3. Ücretsiz katman, kredi kartı veya süre sonunda ücret riski içeriyor mu?
4. Kullanıcı verisi hangi tarafa gider ve kullanıcı bunu açıkça seçebilir mi?
5. Bu belge, gizlilik metni ve uygulama içi açıklamalar güncellendi mi?

Bu maddelerden biri olumsuzsa özellik eklenmez. Ücretli bir seçenek ancak kullanıcı açıkça onay verirse ayrıca değerlendirilir.

## Resmî kaynaklar

- [GitHub Pages ve GitHub Free erişimi](https://docs.github.com/en/pages/getting-started-with-github-pages)
- [GitHub Pages kullanım sınırları](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Pages'in ziyaretçi IP kaydı açıklaması](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
