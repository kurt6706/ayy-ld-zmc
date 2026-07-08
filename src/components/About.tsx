/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Users, Compass, Award, Star, Flame, Map, Zap, Crown, Heart, FileText, Gavel } from 'lucide-react';
import { IMAGES } from '../data';

export default function About() {
  const principles = [
    {
      title: 'Kardeşlik',
      icon: <Users className="w-6 h-6 text-brand" />,
      desc: 'Biz sadece yan yana motor süren insanlar değiliz; yollarda kader birliği yapmış, sevinci ve tasayı paylaşan, birbirine sarsılmaz bağlarla bağlı özbeöz kardeşleriz.'
    },
    {
      title: 'Saygı',
      icon: <Star className="w-6 h-6 text-gold" />,
      desc: 'Toplum değerlerine, çevreye, trafik kurallarına ve en önemlisi kulüp hiyerarşisine tam ve koşulsuz saygı gösteririz. Yeleğimiz, vakarımızın simgesidir.'
    },
    {
      title: 'Disiplin',
      icon: <Shield className="w-6 h-6 text-brand" />,
      desc: 'Sürüşte, kortejde, kulüp binasında ve sosyal yaşamda yüksek disiplin kuralları geçerlidir. Kurallara bağlılık gücümüzün ve ciddiyetimizin temelidir.'
    },
    {
      title: 'Güvenlik',
      icon: <Compass className="w-6 h-6 text-gold" />,
      desc: 'Motosiklet tutkumuz akılcı güvenlik kurallarıyla yönetilir. Tam ekipmansız asla yola çıkmaz, riskli ve kontrolsüz sürüşleri kulübümüzden uzak tutarız.'
    }
  ];

  const founders = [
    {
      name: 'SÜLEYMAN BAŞOL',
      title: 'KURUCU GENEL BAŞKAN / PRESIDENT',
      image: '',
      roleIcon: <Crown className="w-10 h-10 text-yellow-500" />,
      iconBg: 'bg-yellow-950/30 border-yellow-500/30 text-yellow-500 shadow-yellow-500/10',
      bio: 'Ayyıldız Motosiklet Kulübü Genel Başkanı. Kulübün vizyonunu belirleyen, sarsılmaz tüzük ilkelerini ve kardeşlik bağlarını yöneten en üst düzey liderimiz.',
      badges: [
        {
          name: 'ALTIN CROWN BRÖVESİ',
          desc: 'Kurucu genel başkanlık ve konsey liderliği patch\'i.',
          icon: <Crown className="w-4 h-4 text-yellow-500" />,
          color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
        },
        {
          name: 'DEMİR ATLI (IRON RIDER)',
          desc: '100.000+ Km üzerinde uzun yol ve sınır sürüşü kıdem brövesi.',
          icon: <Zap className="w-4 h-4 text-red-500" />,
          color: 'border-red-500/30 text-red-500 bg-red-500/5'
        },
        {
          name: 'MİLLİ SAYGI (PATRIOT)',
          desc: 'Milli değerlere ve şanlı bayrağımıza adanmışlık onuru.',
          icon: <Shield className="w-4 h-4 text-emerald-500" />,
          color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
        }
      ]
    },
    {
      name: 'MELİH BAŞOL',
      title: 'KURUCU BAŞKAN YARDIMCISI / VICE PRESIDENT',
      roleIcon: <Award className="w-10 h-10 text-slate-300" />,
      iconBg: 'bg-slate-900/40 border-slate-500/30 text-slate-300 shadow-slate-500/10',
      bio: 'Kortej düzeni, ulusal ve uluslararası organizasyon planlamaları ile kulübümüzün operasyonel koordinasyonundan sorumlu lider.',
      badges: [
        {
          name: 'GÜMÜŞ KANAT BRÖVESİ',
          desc: 'Başkan yardımcılığı ve yüksek yürütme yetki nişanı.',
          icon: <Award className="w-4 h-4 text-slate-300" />,
          color: 'border-slate-300/30 text-slate-300 bg-slate-300/5'
        },
        {
          name: 'OPERASYON LİDERİ',
          desc: 'Turlar arası kusursuz organizasyonel yönetim yetkisi.',
          icon: <Zap className="w-4 h-4 text-sky-400" />,
          color: 'border-sky-500/30 text-sky-400 bg-sky-500/5'
        },
        {
          name: 'GECE KARTALI (NIGHT RIDER)',
          desc: 'Zorlu koşullarda üst düzey gece turları liderlik nişanı.',
          icon: <Flame className="w-4 h-4 text-orange-400" />,
          color: 'border-orange-500/30 text-orange-400 bg-orange-500/5'
        }
      ]
    },
    {
      name: 'BUKET ŞİMŞEK',
      title: ' SEKRETER / SECRETARY',
      roleIcon: <FileText className="w-10 h-10 text-amber-500" />,
      iconBg: 'bg-amber-950/20 border-amber-500/30 text-amber-500 shadow-amber-500/10',
      bio: 'Resmi yazışmalar, üye kayıtları, idari yönetim ve Moto Family dijital entegrasyon koordinatörlüğü başkanı.',
      badges: [
        {
          name: 'ALTIN KALEM NİŞANI',
          desc: 'Kulübün idari disiplin ve resmi temsil brövesi.',
          icon: <Award className="w-4 h-4 text-amber-500" />,
          color: 'border-amber-500/30 text-amber-500 bg-amber-500/5'
        },
        {
          name: 'SADAKAT BRÖVESİ (LOYALTY)',
          desc: 'Ayyıldız tüzüğüne ve töresine bağlılık nişanı.',
          icon: <Star className="w-4 h-4 text-yellow-400" />,
          color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
        },
        {
          name: 'İLETİŞİM BAŞKANLIĞI',
          desc: 'Kulüpler arası diplomasi ve dijital platform yöneticisi.',
          icon: <Compass className="w-4 h-4 text-cyan-400" />,
          color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
        }
      ]
    },
    {
      name: 'AKİF CAN ALTINOK',
      title: 'YOL KAPTANI / ROAD CAPTAIN',
      roleIcon: <Compass className="w-10 h-10 text-emerald-400" />,
      iconBg: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
      bio: 'Sürüş rotalarının güvenliğini planlayan, kortej hızını, nizamını ve emniyet tedbirlerini en üst düzeyde denetleyen baş yetkili.',
      badges: [
        {
          name: 'YOL LİDERİ (ROAD MASTER)',
          desc: 'Kortej başı sürüş liderliği ve kusursuz yön yetkisi.',
          icon: <Map className="w-4 h-4 text-emerald-400" />,
          color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
        },
        {
          name: 'GÜVENLİK MUHAFIZI',
          desc: 'Sürüş esnasında can emniyeti ve tam ekipman denetleyicisi.',
          icon: <Shield className="w-4 h-4 text-red-400" />,
          color: 'border-red-500/30 text-red-400 bg-red-500/5'
        },
        {
          name: 'SÜRESİZ SÜRÜŞ KISTASI',
          desc: 'Her türlü yol ve iklim şartında 50.000+ Km lider sürüş tecrübesi.',
          icon: <Zap className="w-4 h-4 text-blue-400" />,
          color: 'border-blue-500/30 text-blue-400 bg-blue-500/5'
        }
      ]
    },
    {
      name: 'MELEK DOĞANAY',
      title: 'KADIN GÜCÜ  / LADIES POWER',
      roleIcon: <Heart className="w-10 h-10 text-pink-400" />,
      iconBg: 'bg-pink-950/20 border-pink-500/30 text-pink-400 shadow-pink-500/10',
      bio: 'Ayyıldız Kadın Gücü yapılanmasının başkanı, kadın üyelerin koordinasyonu ve sosyal sorumluluk projelerinin baş yöneticisi.',
      badges: [
        {
          name: 'KADIN GÜCÜ NİŞANI',
          desc: 'Kadın gücü ve dayanışmasını yollarda temsil eden resmi bröve.',
          icon: <Star className="w-4 h-4 text-pink-400" />,
          color: 'border-pink-500/30 text-pink-400 bg-pink-500/5'
        },
        {
          name: 'SÜRÜŞ COCH\'U',
          desc: 'Yeni kadın sürücülerin ve aday üyelerin eğitimi ve adaptasyonu.',
          icon: <Compass className="w-4 h-4 text-purple-400" />,
          color: 'border-purple-500/30 text-purple-400 bg-purple-500/5'
        },
        {
          name: 'TOPLUMSAL ETKİ',
          desc: 'AYMC adına yürütülen tüm sosyal sorumluluk ve yardım kampanyaları.',
          icon: <Flame className="w-4 h-4 text-orange-400" />,
          color: 'border-orange-500/30 text-orange-400 bg-orange-500/5'
        }
      ]
    },
    {
      name: 'KURTULUŞ DÜZLÜ',
      title: 'DİSİPLİN KURULU BAŞKANI & SWEEPER ARTÇI BAŞKAN',
      roleIcon: <Gavel className="w-10 h-10 text-red-500" />,
      iconBg: 'bg-red-950/20 border-red-500/30 text-red-500 shadow-red-500/10',
      bio: 'Kulübün tavizsiz iç disiplin ve töre muhafızı. Aynı zamanda sürüşlerde koordinasyonu sağlayan swapper artçıların lideri.',
      badges: [
        {
          name: 'DİSİPLİN MUHAFIZI (SERGEANT)',
          desc: 'Kulüp içi düzen, saygı ve mutlak hiyerarşinin koruyucusu brövesi.',
          icon: <Shield className="w-4 h-4 text-red-500" />,
          color: 'border-red-500/30 text-red-500 bg-red-500/5'
        },
        {
          name: 'SWAPPER ARTÇI LİDERİ',
          desc: 'Sürüş esnasında artçı emniyeti ve hızlı müdahale koordinasyonu.',
          icon: <Flame className="w-4 h-4 text-yellow-500" />,
          color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
        },
        {
          name: 'ONUR VE SAKADAT',
          desc: 'Yelek ve renklerimizin onurunu her yolda taşıyan ömür boyu üyelik nişanı.',
          icon: <Award className="w-4 h-4 text-amber-500" />,
          color: 'border-amber-500/30 text-amber-500 bg-amber-500/5'
        }
      ]
    }
  ];

  return (
    <div id="about-page" className="bg-[#050505] text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-20">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            HAKKIMIZDA
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            AYYILDIZ MOTO KULÜP
          </h2>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Founding Story and Image Side-by-Side (Matches Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-bebas text-2xl sm:text-3xl text-gold tracking-wider uppercase block">
              Kuruluş Hikayemiz
            </span>
            <p className="font-sans text-gray-300 leading-relaxed text-sm sm:text-base">
              Ayyıldız Moto Kulüp (AYMC), şanlı bayrağımızın asaletinden ve motosiklet tutkusundan güç alarak, köklü bir disiplin ve kardeşlik bilinciyle kurulmuştur. Amacımız; yalnızca motosiklet sürmek değil, Türk motosiklet kültürünü dünyadaki en saygın seviyeye çıkarmak, yollarda can güvenliğini ve yüksek sürüş tekniğini egemen kılmaktır.
            </p>
            <p className="font-sans text-gray-300 leading-relaxed text-sm sm:text-base">
              Milli değerlerimizi, disiplinimizi ve vatan sevgimizi her kilometrede onurla taşırken; sarsılmaz bir bağla bağlı olan kardeşlerimizle birlikte sadece dünü değil, yarınları da inşa ediyoruz. Kulübümüz, her rütbeden ve her kesimden vatansever motorcunun bir araya gelerek tek bir yürek haline geldiği, güven ve saygının mutlak kural olduğu elit bir kuruluştur.
            </p>
            
            {/* Mission & Vision Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-sm bg-[#1A1A1A] border-l-4 border-brand">
                <span className="font-bebas text-lg text-white tracking-wider uppercase block mb-2">Misyonumuz</span>
                <p className="font-sans text-xs text-gray-400 leading-relaxed">
                  Güvenli ve disiplinli sürüş tekniklerini yaygınlaştırarak, vatan sevgisi ve milli değerler çerçevesinde sarsılmaz bir kardeşlik topluluğu sürdürmek.
                </p>
              </div>
              <div className="p-5 rounded-sm bg-[#1A1A1A] border-l-4 border-gold">
                <span className="font-bebas text-lg text-white tracking-wider uppercase block mb-2">Vizyonumuz</span>
                <p className="font-sans text-xs text-gray-400 leading-relaxed">
                  Ulusal ve uluslararası arenada disiplini, vizyonu ve saygınlığıyla örnek gösterilen, Türk motosikletçiliğinin en prestijli lider kulübü olmak.
                </p>
              </div>
            </div>
          </div>

          {/* Large Image Column (Matches Back Patch Layout) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-gold/20 rounded-md blur-xl opacity-40 -z-10" />
            <div className="relative border border-neutral-800 rounded-sm p-2 bg-neutral-900/40">
              <img
                src={IMAGES.logo}
                alt="AYMC Resmi Patch"
                className="w-full h-auto rounded-sm transition-all duration-700 object-cover aspect-square shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/90 backdrop-blur-md border border-gold/20 rounded-sm text-center">
                <p className="font-bebas text-lg tracking-wider text-white">"ONUR, DİSİPLİN VE SADAKAT"</p>
                <p className="font-sans text-[10px] tracking-widest text-gold uppercase mt-1">AYMC RESMİ PATCH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parallax Quote Section */}
        <div className="relative rounded-sm overflow-hidden py-20 px-8 text-center bg-cover bg-fixed bg-center mb-24" style={{ backgroundImage: `url(${IMAGES.heroBg})` }}>
          <div className="absolute inset-0 bg-black/85" />
          <div className="relative z-10 max-w-4xl mx-auto space-y-4">
            <span className="font-bebas text-3xl sm:text-5xl tracking-widest text-gradient bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent italic">
              "KORKULARIMIZLA DEĞİL, DEĞERLERİMİZLE SÜRERİZ."
            </span>
            <div className="w-16 h-0.5 bg-brand mx-auto mt-2" />
            <p className="font-sans text-xs tracking-[0.25em] text-gray-400 uppercase mt-4">
              Ayyıldız Moto Kulüp Genel Yönetim Konseyi
            </p>
          </div>
        </div>

        {/* Club Principles Grid (Kardeşlik, Saygı, Disiplin, Güvenlik) */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="font-bebas text-2xl sm:text-4xl tracking-wider text-white">KULÜBÜMÜZÜN DÖRT TEMEL DİREĞİ</h3>
            <p className="font-sans text-xs text-gray-400 tracking-wider mt-1">Sarsılmaz inançlarla yoldayız</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((pr, index) => (
              <div 
                key={index} 
                className="p-8 bg-[#1A1A1A]/60 border border-neutral-900 rounded-sm hover:border-brand/40 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="p-3 bg-black rounded-sm inline-block mb-6 border border-neutral-800 group-hover:border-brand/30 transition-colors">
                  {pr.icon}
                </div>
                <h4 className="font-bebas text-xl text-white tracking-widest uppercase mb-3 group-hover:text-gold transition-colors">
                  {pr.title}
                </h4>
                <p className="font-sans text-xs text-gray-400 leading-relaxed">
                  {pr.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Founding Members & Brooches (Kurucu Üyeler ve Bröveleri) */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-2">
              KIDEMLİ KADRO
            </span>
            <h3 className="font-bebas text-2xl sm:text-4xl tracking-wider text-white uppercase">
              KURUCU ÜYELER VE RESMİ BRÖVELERİ
            </h3>
            <p className="font-sans text-xs text-gray-400 tracking-wider mt-1">
              Ayyıldız ruhunu yaşatan, kulübün temellerini atan sarsılmaz öncülerimiz
            </p>
            <div className="w-16 h-0.5 bg-brand mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {founders.map((founder, idx) => (
              <div 
                key={idx} 
                className="bg-[#111111] border border-neutral-900 rounded-sm p-6 flex flex-col relative overflow-hidden group hover:border-brand/30 transition-all duration-500 hover:-translate-y-1 shadow-xl"
              >
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors duration-500" />
                
                {/* Profile Emblem Symbol & Meta */}
                <div className="flex items-center space-x-4 mb-6">
                  {founder.image ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500/30 bg-neutral-900 flex-shrink-0 relative shadow-lg transition-transform duration-500 group-hover:scale-110">
                      <img 
                        src={founder.image} 
                        alt={founder.name} 
                        className="w-full h-full object-cover filter brightness-95" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ) : (
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative shadow-lg ${founder.iconBg} transition-transform duration-500 group-hover:scale-110`}>
                      {founder.roleIcon}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bebas text-2xl text-white tracking-widest">{founder.name}</h4>
                    <span className="inline-block text-[10px] text-gold font-bold font-sans uppercase tracking-widest leading-none">
                      {founder.title}
                    </span>
                  </div>
                </div>

                {/* Bio text */}
                <p className="font-sans text-xs text-gray-400 leading-relaxed mb-6 border-l-2 border-brand/50 pl-3">
                  {founder.bio}
                </p>

                {/* Badges / Brooches (Bröveler) */}
                <div className="mt-auto pt-6 border-t border-neutral-900">
                  <span className="block font-bebas text-xs tracking-widest text-gold mb-3 uppercase">
                    RESMİ KULÜP BRÖVELERİ (BROŞLAR)
                  </span>
                  
                  <div className="space-y-3">
                    {founder.badges.map((badge, bIdx) => (
                      <div 
                        key={bIdx}
                        className={`flex items-start space-x-3 p-2.5 rounded-sm border ${badge.color} hover:bg-white/5 transition-all duration-300`}
                      >
                        <div className="p-1.5 bg-black/40 rounded-sm border border-neutral-800/50 flex-shrink-0">
                          {badge.icon}
                        </div>
                        <div>
                          <span className="block font-bebas text-xs tracking-wider text-white uppercase leading-tight">
                            {badge.name}
                          </span>
                          <p className="font-sans text-[10px] text-gray-400 leading-normal mt-0.5">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moto Family Partnership Section */}
        <div id="moto-family-partnership" className="mt-24 p-8 sm:p-12 bg-gradient-to-r from-[#1A1A1A]/80 to-[#111111]/90 border border-neutral-900 rounded-sm relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-sans font-bold tracking-widest uppercase">
                  RESMİ ORTAKLIK ANLAŞMASI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="font-bebas text-3xl sm:text-5xl text-white tracking-widest uppercase">
                MOTO FAMILY DİJİTAL ENTEGRASYONU
              </h3>
              <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">
                Ayyıldız Motosiklet Kulübü (AYMC), Türkiye'nin en disiplinli ve prestijli motosiklet topluluklarını bir araya getiren dijital platformu <strong>Moto Family</strong>'nin resmi üyesidir. Bu özel anlaşma kapsamında kulübümüzün turları, üye katılım takipleri ve resmi grup duyuruları Moto Family üzerindeki kulüp sayfamızdan senkronize edilmektedir.
              </p>
              <p className="font-sans text-xs text-gray-500">
                AYMC yelekli üyelerinin ve adaylarımızın aşağıdaki resmi bağlantıyı kullanarak topluluğumuza katılması, kulüp içi koordinasyon açısından son derece önemlidir.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex flex-col items-stretch">
              <div className="p-6 bg-black/50 border border-neutral-800 rounded-sm text-center">
                <span className="block font-sans text-[10px] text-gold font-bold tracking-widest uppercase mb-1">MOTO FAMILY RESMİ GRUBU</span>
                <span className="block font-bebas text-2xl text-white tracking-wider uppercase mb-4">Ayyıldız Motosiklet Kulübü</span>
                <a
                  href="https://motofamily.net/grup/69f0e0d96233d809aa130fe8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black transition-all w-full rounded-sm font-sans text-xs font-bold tracking-widest uppercase"
                >
                  <span>MOTO FAMILY'DE KATILIN</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
