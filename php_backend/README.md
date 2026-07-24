# AYMK Hostinger PHP API & MySQL Kurulum Rehberi

Bu klasör, **Ayyıldız Motosiklet Kulübü (AYMK)** web sitesinin Hostinger üzerindeki MySQL veritabanı ve PHP API backend dosyalarını içerir. Firebase tamamen kaldırılmıştır.

---

## 📁 Yükleme Dizini Yapısı (Hostinger cPanel / File Manager)

Hostinger `/public_html/` dizininizde aşağıdaki klasör yapısını oluşturun:

```
public_html/
├── api/
│   ├── config.php
│   ├── upload.php
│   ├── users.php
│   ├── news.php
│   ├── events.php
│   ├── routes.php
│   ├── forum.php
│   ├── gallery.php
│   ├── announcements.php
│   ├── messages.php
│   └── meetings.php
└── uploads/
    ├── images/
    └── videos/
```

> **Önemli İzinler:** `/public_html/uploads/images` ve `/public_html/uploads/videos` klasörlerine okuma/yazma (CHMOD 755 veya 777) izni veriniz.

---

## 🗄️ MySQL Veritabanı Kurulumu

1. Hostinger hPanel üzerinden yeni bir MySQL veritabanı ve kullanıcısı oluşturun.
2. phpMyAdmin'e girerek `schema.sql` dosyasındaki SQL komutlarını çalıştırın.
3. `public_html/api/config.php` dosyasını açıp veritabanı bilgilerinizi girin:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'veritabani_kullanici_adiniz');
define('DB_PASS', 'veritabani_sifreniz');
define('DB_NAME', 'veritabani_adiniz');
```

---

## 🚀 API Endpoint Listesi (https://aymk.org/api/)

| Endpoint | Açıklama |
|---|---|
| `POST /api/upload.php` | Fotoğraf (`/uploads/images`) veya video (`/uploads/videos`) yükler |
| `GET / POST /api/users.php` | Üye listesi, üyelik başvurusu, üye onay/silme |
| `GET / POST /api/news.php` | Haberler, duyurular, haber yorumları ve beğeniler |
| `GET / POST /api/events.php` | Sürüş etkinlikleri ve katılım durumları |
| `GET / POST /api/routes.php` | Sürüş rotaları |
| `GET / POST /api/forum.php` | Üye duvarı / forum gönderileri |
| `GET / POST /api/gallery.php` | Fotoğraf ve video galerisi |
| `GET / POST /api/messages.php` | Özel mesajlaşma |
| `GET / POST /api/announcements.php` | Resmi kulüp duyuruları |
| `GET / POST /api/meetings.php` | Online toplantı odası linkleri |
