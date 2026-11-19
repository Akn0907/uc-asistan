# Üç Asistan

Tek bir soruyu Google Gemini'ye gönderen yerel web uygulaması. ChatGPT ve Claude kartları daha sonra eklenmek üzere boş tutulur.

## Başlatma

1. Proje klasörünü bilgisayarına indir veya GitHub'dan klonla.
2. `.env.example` dosyasını `.env` adıyla kopyala.
3. Google AI Studio'dan kendi Gemini API anahtarını alıp `.env` içindeki `GEMINI_API_KEY` alanına ekle.
4. Windows'ta `Baslat.cmd` dosyasına çift tıkla; sunucu hazır olduğunda `http://localhost:3000` adresini aç.

Node.js kurulu bir terminalde proje klasöründen `npm start` komutuyla da başlatabilirsin.

## Anahtar ve kullanım ücreti

Bu uygulama API anahtarı içermez ve anahtarları GitHub'a yüklemez. Her kullanıcı kendi Gemini API anahtarını kendi `.env` dosyasına ekler. API kotası, ücretsiz kullanım sınırları ve olası ücretler doğrudan kullanıcının Google hesabına aittir. Bu projede kullanıcı hesabı, kredi bakiyesi veya ödeme sistemi bulunmaz.

`.env` dosyanı paylaşma veya GitHub'a gönderme. Depoda yalnızca boş `.env.example` şablonu bulunur.

## Diğer asistanlar

ChatGPT ve Claude şu an bağlı değildir; arayüzdeki kartlar boş yer tutucudur. Bu sürüm yalnızca Gemini'ye istek gönderir.


