# AYMC (Ayyıldız Moto Kulüp) Resmi Web Platformu

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

Bu proje, **Ayyıldız Moto Kulüp (AYMC)** için özel olarak tasarlanmış, en üst düzey (premium) seviyede kurumsal ve sosyal bir web platformudur. BMW Motorrad, Ducati, Tesla ve Apple web estetiklerinden ilham alınarak tasarlanan arayüz, ziyaretçiye ilk 3 saniyede **Prestij**, **Güven**, **Disiplin**, **Kardeşlik** ve **Milli Değerler** hissini sarsılmaz bir şekilde aşılamayı hedefler.

---

## 🎨 Tasarım Estetiği & Renk Paleti

Projenin görsel kimliği, motosiklet yeleği (patch) asaletini ve kurumsal saygınlığı yansıtan beş temel renkten oluşur:

*   **Ana Renk (Ayyıldız Crimson):** `#B30000` (Bayrak asaletini ve sürüş tutkusunu temsil eder)
*   **Derin Siyah (Stealth Matte):** `#050505` (Motor gövdeleri ve asfalttan ilham alan şık arka plan)
*   **Koyu Gri (Titanium):** `#1A1A1A` (Kartlar ve hiyerarşik katmanlar)
*   **Altın (Gold Accent):** `#C8A94C` (Kıdem, rütbe ve onurun simgesi)
*   **Saf Beyaz (Platinum):** `#FFFFFF` (Üstün okunabilirlik ve kontrast)

### ✍️ Tipografi Pairing
*   **Başlıklar (Display Type):** `Bebas Neue` (Agresif, dik duruşlu, okunaklı ve maskülen bir motorcu karakteri)
*   **Alt Yazılar & Gövde Metni:** `Montserrat` (Kurumsal, modern, okunaklı, geometrik sans-serif)

---

## 🛠️ Teknolojik Altyapı & Özellikler

Proje, modern ve performans odaklı bir yığın (stack) ile sıfır hata prensibine bağlı kalarak geliştirilmiştir:

1.  **Vite + React (v19) & TypeScript:** Modüler bileşen mimarisi ile son derece hızlı, tip güvenli ve performanslı bir altyapı.
2.  **Tailwind CSS (v4.0):** Sıfır harici CSS dosyası karmaşası, tamamen optimize edilmiş ve responsive tasarım.
3.  **Dinamik Rota & Yakıt Hesaplayıcı:** Sürücülerin motosiklet tüketim oranı ve güncel akaryakıt litre fiyatını girerek toplam yolculuk maliyetini ve gereken yakıt hacmini canlı hesaplayabildiği interaktif panel.
4.  **İnteraktif Konvoy Simülatörü:** Sürüş güvenliği için fermuar (zig-zag) dizilimini ve Yol Kaptanı (Road Captain), Artçı (Sweeper) rollerini şematik gösteren etkileşimli modül.
5.  **Online Üyelik Sihirbazı:** Drag-and-drop fotoğraf yükleme önizlemesi, ehliyet sınıfları, kan grubu ve acil durum kişisi girdileri içeren, KVKK uyumlu başvuru akışı.
6.  **Şifreli Yönetici Paneli:** `aymc` şifresiyle korunan, sayaç istatistiklerini (üye, şehir, km, etkinlik) canlı güncelleyen, aday başvurularını onaylayıp reddeden, yeni etkinlik, rota, haber veya galeri görseli eklemeyi sağlayan uçtan uca senkronize komuta merkezi.
7.  **Masonry Galeri & Gelişmiş Işık Kutusu (Lightbox):** Kategori filtrelerine (Drone, Sürüş, Kamp) sahip, otomatik oynatmalı slayt gösterisi destekli Instagram benzeri geçiş hissiyatı sunan galeri motoru.
8.  **SEO & JSON-LD:** Arama motorları için optimize edilmiş meta etiketleri, Open Graph sosyal kart entegrasyonu ve schema.org uyumlu yapılandırılmış veri işaretlemeleri.

---

## 📂 Klasör Yapısı

```text
/src
├── assets/             # Kulüp için üretilmiş yüksek kaliteli cinematic görsel varlıklar
├── components/         # Modüler, bağımsız kullanıcı arayüzü bileşenleri
│   ├── Navbar.tsx      # Shrink-on-scroll özellikli akıllı menü ve Dark Mode anahtarı
│   ├── Hero.tsx        # Ken Burns efektli tam ekran banner ve canlı sayaçlar
│   ├── About.tsx       # Kuruluş hikayesi, misyon, vizyon ve 4 temel ilke kartları
│   ├── Discipline.tsx  # Kulüp tüzüğü, el işaretleri ve yönetmelik PDF/TXT indiricisi
│   ├── Events.tsx      # Google Maps entegrasyonlu ve katılımcı sayaçlı sürüş kartları
│   ├── RouteSystem.tsx # Rota seçici, mola durakları ve Yakıt Hesaplama robotu
│   ├── Gallery.tsx     # Masonry grid ve gelişmiş slayt gösterili Lightbox
│   ├── Blog.tsx        # Canlı arama, yorum ekleme ve beğenme mekanizmalı haber akışı
│   ├── Contact.tsx     # İletişim formu, Clubhouse koordinatları ve WhatsApp yönlendiricisi
│   ├── MembershipForm.tsx # Fotoğraf önizlemeli ve KVKK onaylı online başvuru formu
│   ├── AdminPanel.tsx  # Şifre korumalı tam yetkili kontrol merkezi
│   └── Footer.tsx      # Hızlı linkler ve kurumsal telif bilgileri
├── App.tsx             # Global state yönetimi ve sanal Hash Router mimarisi
├── data.ts             # Kulübe dair gerçekçi önceden doldurulmuş veriler
├── types.ts            # Tip ve arayüz tanımlamaları
└── index.css           # Tailwind v4 entegrasyonu, özel kaydırma çubukları ve animasyonlar
```

---

## 🚀 Kurulum ve Başlatma

Projeyi yerel makinenizde çalıştırmak son derece basittir. Node.js yüklü olduğundan emin olun ve şu adımları izleyin:

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın (Port: 3000)
```bash
npm run dev
```

### 3. Üretim Sürümü Alın (Build)
```bash
npm run build
```

---

## 🔒 Yönetim Paneli Giriş Bilgileri
*   **Giriş Sayfası:** Navbar'ın sağ üst köşesindeki **YÖNETİM** butonu veya mobildeki menüden ulaşılabilir.
*   **Erişim Şifresi:** `aymc` (Küçük harflerle)

---

## 📜 Lisans
Bu proje Ayyıldız Motosiklet Kulübü resmi temsil dökümanıdır. Kodlar ve tasarımlar MIT Lisansı kapsamında koruma altındadır.

"Kardeşlik, Sadakat, Onur."
**AYMC Genel Sekreterliği - 2026**
