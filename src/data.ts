/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Event, Route, BlogPost, GalleryItem, ClubRule, HandSignal, MembershipApplication } from './types';

// Let's reference our custom generated images
export const IMAGES = {
  heroBg: '/images/aymc_cortege_bg.jpg',
  riderBack: '/images/aymc_rider_back_1783386132808.jpg',
  coastalTour: '/images/aymc_coastal_tour_1783386147711.jpg',
  campingEvent: '/images/aymc_camping_event_1783386160862.jpg',
  logo: '/images/aymc_logo_final.jpg',
};

export const DEFAULT_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Şile - Ağva Sahil Sürüşü',
    image: IMAGES.coastalTour,
    date: '2026-07-15',
    time: '08:30',
    location: 'İstanbul - Şile',
    coordinates: '41.1750, 29.6122',
    status: 'upcoming',
    attendeesCount: 42,
    description: 'Yaz sezonunun en heyecanlı sahil sürüşü! İstanbul çıkışlı rotamızda, virajlı orman yollarından geçerek Ağva sahilinde geleneksel kulüp kahvaltımızı yapacağız. Güvenli sürüş kuralları ve konvoy düzeni tam disiplinle uygulanacaktır.',
    routeLink: 'route-1',
    gmapsLink: 'https://maps.google.com/?q=Sile,Istanbul,Turkey'
  },
  {
    id: 'evt-2',
    title: 'Bolu Abant Doğa Sürüşü & Kampı',
    image: IMAGES.campingEvent,
    date: '2026-08-01',
    time: '07:00',
    location: 'Bolu - Abant Gölü',
    coordinates: '40.6052, 31.2800',
    status: 'upcoming',
    attendeesCount: 58,
    description: 'Doğanın kalbinde 2 gün sürecek çadır kampı ve eşsiz sürüş rotası. Abant Gölü etrafında sürüş yapacak, akşam ateş başında milli değerlerimizi ve kardeşliğimizi pekiştireceğimiz keyifli sohbetler edeceğiz. Kamp ekipmanları ve acil durum kitleri zorunludur.',
    routeLink: 'route-2',
    gmapsLink: 'https://maps.google.com/?q=Abant,Bolu,Turkey'
  },
  {
    id: 'evt-3',
    title: 'Geleneksel Zafer Sürüşü (30 Ağustos)',
    image: IMAGES.heroBg,
    date: '2026-08-30',
    time: '09:00',
    location: 'Ankara - Anıtkabir',
    coordinates: '39.9250, 32.8369',
    status: 'upcoming',
    attendeesCount: 150,
    description: 'Milli birlik ve gururumuzu yollarda temsil ediyoruz. İstanbul, İzmir, Eskişehir ve diğer illerden katılan kolluklarımızla Ankara Anıtkabir ziyareti için yola çıkıyoruz. Şanlı bayrağımız eşliğinde saygı ve disiplin çerçevesinde görkemli bir kortej oluşturacağız.',
    routeLink: 'route-3',
    gmapsLink: 'https://maps.google.com/?q=Anitkabir,Ankara,Turkey'
  }
];

export const DEFAULT_ROUTES: Route[] = [
  {
    id: 'route-1',
    name: 'Karadeniz Sahil & Orman Rotası',
    startPoint: 'Kadıköy',
    endPoint: 'Ağva',
    distanceKm: 125,
    estimatedHours: 2.5,
    roadCondition: 'Virajlı / Dar',
    fuelRate: 5.2,
    stops: ['Ömerli', 'Şile Merkez', 'Teke Köyü'],
    gpsUrl: 'https://maps.google.com/?saddr=Kadikoy,Istanbul&daddr=Sile&da2=Agva',
    difficulty: 'Orta',
    elevation: '50m - 280m'
  },
  {
    id: 'route-2',
    name: 'Batı Karadeniz Geçidi',
    startPoint: 'Ümraniye Otoban',
    endPoint: 'Abant Gölü',
    distanceKm: 260,
    estimatedHours: 4.0,
    roadCondition: 'Premium Asfalt',
    fuelRate: 4.8,
    stops: ['Düzce Dinlenme Tesisi', 'Bolu Dağı Geçidi'],
    gpsUrl: 'https://maps.google.com/?saddr=Umraniye,Istanbul&daddr=Abant+Golu,Bolu',
    difficulty: 'Kolay',
    elevation: '100m - 1350m'
  },
  {
    id: 'route-3',
    name: 'Ata\'mızın Yolunda (Kortej Rotası)',
    startPoint: 'Tuzla Mehmetçik Vakfı',
    endPoint: 'Ankara Anıtkabir',
    distanceKm: 420,
    estimatedHours: 5.5,
    roadCondition: 'Premium Asfalt',
    fuelRate: 5.5,
    stops: ['Düzce Kop Dağı', 'Kızılcahamam Rampa'],
    gpsUrl: 'https://maps.google.com/?saddr=Tuzla&daddr=Anitkabir,Ankara',
    difficulty: 'Kolay',
    elevation: '80m - 1100m'
  }
];

export const DEFAULT_BLOG: BlogPost[] = [];

export const CLUB_RULES: ClubRule[] = [
  { id: 'r-1', category: 'Genel', title: 'Saygı ve Hiyerarşi', description: 'Her kulüp üyesi, kendisinden yaşça büyük veya kulüpte rütbece kıdemli olan kardeşlerine, yelek taşıma onuruna ve kulüp hiyerarşisine tam saygı duymakla yükümlüdür.' },
  { id: 'r-2', category: 'Genel', title: 'Milli Değerlere Bağlılık', description: 'Türk bayrağına, cumhuriyete, vatanın bölünmez bütünlüğüne ve kutsal milli değerlerimize her ortamda can pahasına sahip çıkılır ve saygısızlık edilmesine müsaade edilmez.' },
  { id: 'r-3', category: 'Sürüş', title: 'Tam Ekipman Zorunluluğu', description: 'Kask, korumalı ceket, motosiklet eldiveni, korumalı pantolon ve bot olmadan sürüş kortejine katılmak kesinlikle yasaktır.' },
  { id: 'r-4', category: 'Sürüş', title: 'Alkol ve Zararlı Madde Toleransı', description: 'Sürüş öncesinde veya sürüş esnasında alkol veya uyuşturucu/uyarıcı herhangi bir madde tüketmek derhal kulüpten ihraç sebebidir. Sıfır tolerans kuralı geçerlidir.' },
  { id: 'r-5', category: 'Konvoy', title: 'Fermuar Düzeni ve Takip Mesafesi', description: 'Kortej, yol ve trafik şartlarına uygun olarak fermuar (zig-zag) düzeninde ilerler. Öncelik her zaman öndeki motorun güvenlik alanındadır.' },
  { id: 'r-6', category: 'Güvenlik', title: 'Grup Lideri ve Artçı Talimatları', description: 'Sürüşte "Road Captain" (Yol Kaptanı) ve "Sweeper" (Artçı Kaptan) talimatlarına koşulsuz riayet edilir. Solama kuralları dışına çıkılmaz.' }
];

export const HAND_SIGNALS: HandSignal[] = [
  { id: 's-1', name: 'Tek Sıra Düzeni', description: 'Yol daraldığında veya tehlike anında kol yukarı kaldırılır ve işaret parmağı ile tek gösterilir. Tüm konvoy tek sıraya geçer.', icon: '☝️' },
  { id: 's-2', name: 'İkili Fermuar Düzeni', description: 'Yol genişlediğinde kol kaldırılır ve iki parmak gösterilir. Konvoy standart fermuar düzenine geri döner.', icon: '✌️' },
  { id: 's-3', name: 'Yavaşla', description: 'Kol yana doğru uzatılır ve avuç içi yere bakacak şekilde aşağı yukarı hareket ettirilir. Arkadakilerin yavaşlaması istenir.', icon: '👋' },
  { id: 's-4', name: 'Yol Engeli / Çukur', description: 'Yoldaki çukur, taş veya engel için sol ayak veya sağ ayak o yönde uzatılır. Arkadaki sürücülerin engelden kaçması sağlanır.', icon: '🦶' },
  { id: 's-5', name: 'Dur', description: 'Kol yukarı kaldırılır, avuç içi açık ve öne bakar şekilde sabit tutulur. Konvoyun acilen durması istenir.', icon: '✋' },
  { id: 's-6', name: 'Yakıt Alımı', description: 'Sol el ile depo işaret edilir veya başparmak ağıza götürülür. Bir sonraki istasyonda durulacağı belirtilir.', icon: '⛽' }
];

export const INITIAL_APPLICATIONS: MembershipApplication[] = [
  {
    id: 'app-1',
    fullName: 'Caner Öztürk',
    email: 'caner@aymc.org',
    phone: '0532 111 22 33',
    bloodType: 'A Rh(+)',
    emergencyContact: 'Aylin Öztürk (Eşi) - 0532 111 22 34',
    motorcycleModel: 'Honda Africa Twin CRF1100',
    licenseClass: 'A Class',
    status: 'pending',
    kvkkApproved: true,
    date: '2026-07-05'
  },
  {
    id: 'app-2',
    fullName: 'Bora Yalçın',
    email: 'bora@aymc.org',
    phone: '0555 444 55 66',
    bloodType: '0 Rh(-)',
    emergencyContact: 'Ahmet Yalçın (Babası) - 0555 444 55 67',
    motorcycleModel: 'BMW R1250 GS Adventure',
    licenseClass: 'A Class',
    status: 'approved',
    kvkkApproved: true,
    date: '2026-07-01'
  }
];
