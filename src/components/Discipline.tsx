/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, HelpCircle, Download, CheckSquare, Award, AlertTriangle, Users, Compass } from 'lucide-react';
import { CLUB_RULES, HAND_SIGNALS } from '../data';

export default function Discipline() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Genel' | 'Sürüş' | 'Konvoy' | 'Güvenlik'>('All');

  const filteredRules = selectedCategory === 'All'
    ? CLUB_RULES
    : CLUB_RULES.filter((rule) => rule.category === selectedCategory);

  const downloadRulesDocument = () => {
    // Generate a beautiful formatted text decree for the motorcycle club rules
    const header = `==================================================
           AYYILDIZ MOTOSİKLET KULÜBÜ (AYMC)
             RESMİ DİSİPLİN VE SÜRÜŞ YÖNETMELİĞİ
==================================================
Yayın Tarihi: 2026-07-06
Yürürlük No: AYMC-2026-V1
Onaylayan: AYMC Genel Disiplin Kurulu Başkanlığı

Motto: "Birlikte Yola, Onurla Geleceğe!"

Bu belge, Ayyıldız Motosiklet Kulübü üyelerinin yollarda,
toplantılarda ve tüm sosyal platformlarda uymakla yükümlü 
olduğu genel disiplin ve güvenlik kurallarını içerir.

--------------------------------------------------
I. TEMEL KULÜP YASALARI
--------------------------------------------------
`;

    let content = '';
    CLUB_RULES.forEach((rule, idx) => {
      content += `[${idx + 1}] Kategori: ${rule.category.toUpperCase()} - Başlık: ${rule.title}
    Açıklama: ${rule.description}\n\n`;
    });

    const handSignalsText = `--------------------------------------------------
II. KONVOY EL İŞARETLERİ VE SÜRÜŞ DİSİPLİNİ
--------------------------------------------------
`;
    let signalsContent = '';
    HAND_SIGNALS.forEach((sig) => {
      signalsContent += `• İşaret: ${sig.name} (${sig.icon})
  Prosedür: ${sig.description}\n\n`;
    });

    const footer = `--------------------------------------------------
Yelek ve patch taşıyan her kardeşimiz bu kuralları peşinen
kabul etmiş ve saygı duyacağını beyan etmiştir. Kuralların
ihlali durumunda Disiplin Komitesi kararı esastır.

"Kardeşlik, Sadakat, Onur."
==================================================`;

    const fullText = `${header}${content}${handSignalsText}${signalsContent}${footer}`;
    
    // Create element and download
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AYMC_Disiplin_ve_Surus_Yonetmeligi.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="discipline-page" className="bg-transparent text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            ONUR KANUNLARI
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            DİSİPLİN VE SÜRÜŞ KURALLARI
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 tracking-wider max-w-2xl mx-auto">
            Ayyıldız patch\'ini taşımak büyük bir sorumluluktur. Kulübümüzü ayakta tutan mutlak hiyerarşi, saygı, kardeşlik ve sürüş kurallarımızdır.
          </p>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Action button to download rules */}
        <div className="flex justify-center mb-12">
          <button
            id="download-rules-btn"
            onClick={downloadRulesDocument}
            className="flex items-center space-x-3 px-8 py-4 bg-transparent border border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 font-sans text-xs font-bold tracking-widest uppercase rounded-sm"
          >
            <Download className="w-4 h-4" />
            <span>RESMİ YÖNETMELİĞİ İNDİR (PDF / TXT)</span>
          </button>
        </div>

        {/* Three Grid Section: Rules Category filters, Rules list, Convoy Arranger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-stretch">
          
          {/* Rules Category & List (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-900 pb-4 gap-4">
              <span className="font-bebas text-xl text-white tracking-wider uppercase">
                RESMİ TÜZÜK VE KURALLAR
              </span>
              
              {/* Internal filters */}
              <div className="flex flex-wrap gap-1 bg-black p-1 rounded-sm border border-neutral-800">
                {(['All', 'Genel', 'Sürüş', 'Güvenlik'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-sans font-bold tracking-wider uppercase transition-all ${
                      selectedCategory === cat ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'TÜMÜ' : cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules Accordion-like structure */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-black/60 p-5 rounded-sm border-l-4 border-l-brand border border-neutral-900 hover:border-neutral-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bebas text-lg text-white tracking-wider uppercase">{rule.title}</span>
                    <span className="px-2 py-0.5 bg-neutral-900 text-gold text-[9px] font-mono tracking-widest rounded-sm uppercase">
                      {rule.category}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Convoy Formation Arranger (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-bebas text-xl text-white tracking-wider uppercase block border-b border-neutral-900 pb-4">
                İNTERAKTİF KONVOY DÜZENİ
              </span>
              <p className="font-sans text-xs text-gray-400 leading-relaxed">
                Kortej güvenliği için fermuar (zig-zag) dizilimi kullanılır. Aşağıda bir AYMC konvoyunun şematik hiyerarşisi gösterilmiştir. Rollerin üzerine gelerek detayları öğrenebilirsiniz:
              </p>

              {/* Graphical Convoy Visualizer (Highly Premium CSS design) */}
              <div className="bg-black p-6 rounded-sm border border-neutral-900 flex flex-col items-center space-y-3 relative overflow-hidden py-8">
                
                {/* Lane Dividers */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 border-r border-dashed border-neutral-800" />

                {/* 1. Road Captain / Leader */}
                <div className="relative z-10 w-44 bg-brand/10 border border-brand text-brand rounded-sm p-2 text-center group cursor-help transition-all hover:bg-brand hover:text-white">
                  <p className="font-bebas text-xs tracking-wider uppercase font-bold">1. ROAD CAPTAIN (Yol Kaptanı)</p>
                  <p className="font-sans text-[8px] text-gray-400 group-hover:text-white tracking-wide mt-0.5">Konvoyu yönetir, hızı ayarlar.</p>
                </div>

                {/* Vertical spacer */}
                <div className="h-4" />

                {/* 2 & 3: Zig Zag pattern */}
                <div className="w-full flex justify-between px-4">
                  {/* Left Rider (Novice/New) */}
                  <div className="relative z-10 w-5/12 bg-neutral-900/90 border border-neutral-800 text-white rounded-sm p-2 text-center group cursor-help hover:border-gold/50">
                    <p className="font-bebas text-[10px] text-gold tracking-wider uppercase">2. YENİ SÜRÜCÜ / ÇAYLAK</p>
                    <p className="font-sans text-[8px] text-gray-400 tracking-wide mt-0.5">Güvenlik için önde sol tarafta sürer.</p>
                  </div>

                  {/* Right Rider (Experienced) */}
                  <div className="relative z-10 w-5/12 bg-neutral-900/90 border border-neutral-800 text-white rounded-sm p-2 text-center group cursor-help hover:border-gold/50">
                    <p className="font-bebas text-[10px] text-white tracking-wider uppercase">3. DENEYİMLİ ÜYE</p>
                    <p className="font-sans text-[8px] text-gray-400 tracking-wide mt-0.5">Fermuar düzeninde sağda konumlanır.</p>
                  </div>
                </div>

                <div className="h-4" />

                {/* 4 & 5: Zig Zag pattern */}
                <div className="w-full flex justify-between px-4">
                  <div className="relative z-10 w-5/12 bg-neutral-900/90 border border-neutral-800 text-white rounded-sm p-2 text-center group cursor-help hover:border-gold/50">
                    <p className="font-bebas text-[10px] text-white tracking-wider uppercase">4. TAM KLIŞ ÜYE</p>
                    <p className="font-sans text-[8px] text-gray-400 tracking-wide mt-0.5">Takip mesafesini korur, solda sürer.</p>
                  </div>

                  <div className="relative z-10 w-5/12 bg-neutral-900/90 border border-neutral-800 text-white rounded-sm p-2 text-center group cursor-help hover:border-gold/50">
                    <p className="font-bebas text-[10px] text-white tracking-wider uppercase">5. SÜRÜŞ DESTEK</p>
                    <p className="font-sans text-[8px] text-gray-400 tracking-wide mt-0.5">Fermuar düzeninde sağda sürer.</p>
                  </div>
                </div>

                <div className="h-4" />

                {/* 6. Sweeper / Sweeper Captain */}
                <div className="relative z-10 w-44 bg-gold/10 border border-gold text-gold rounded-sm p-2 text-center group cursor-help transition-all hover:bg-gold hover:text-black">
                  <p className="font-bebas text-xs tracking-wider uppercase font-bold">6. SWEEPER (Artçı Kaptan)</p>
                  <p className="font-sans text-[8px] text-gray-400 group-hover:text-black tracking-wide mt-0.5">Konvoyu arkadan korur, geride kalanları toplar.</p>
                </div>

              </div>
            </div>

            {/* Alert warnings */}
            <div className="mt-6 flex items-start space-x-3 text-[10px] text-gray-500 bg-black p-3 rounded-sm border border-neutral-900">
              <AlertTriangle className="w-4 h-4 text-brand shrink-0 mt-0.5 animate-pulse" />
              <span>Konvoy düzeninde öndeki motoru geçmek, gruptan kopmak veya izinsiz şerit değiştirmek kesinlikle yasaktır ve doğrudan uyarı puanı olarak işlenir.</span>
            </div>
          </div>

        </div>

        {/* Hand Signals / El İşaretleri Grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="font-sans text-[10px] tracking-widest text-brand font-bold uppercase block mb-1">GÖRSEL İLETİŞİM</span>
            <h3 className="font-bebas text-2xl sm:text-4xl tracking-wider text-white">YOLDAKİ SESSİZ DİLİMİZ</h3>
            <p className="font-sans text-xs text-gray-400 mt-1 max-w-xl mx-auto">Kask içi interkom arızasında veya acil durumlarda yolda konvoy içinde kullanılan resmi el işaretlerimiz.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {HAND_SIGNALS.map((sig) => (
              <div
                key={sig.id}
                className="bg-[#1A1A1A]/50 border border-neutral-900 p-5 rounded-sm text-center flex flex-col justify-between items-center hover:border-brand/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-3xl mb-4 text-white shadow-inner">
                  {sig.icon}
                </div>
                <div>
                  <h4 className="font-bebas text-base text-white tracking-wider uppercase mb-1.5">{sig.name}</h4>
                  <p className="font-sans text-[10px] text-gray-400 leading-relaxed">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founding Members List */}
        <div>
          <div className="text-center mb-10">
            <span className="font-sans text-[10px] tracking-widest text-brand font-bold uppercase block mb-1">AYMC HİYERARŞİSİ</span>
            <h3 className="font-bebas text-2xl sm:text-4xl tracking-wider text-white">KURUCU ÜYELER VE YÖNETİM KURULU</h3>
            <p className="font-sans text-xs text-gray-400 mt-1 max-w-xl mx-auto">Kulübümüzün temellerini atan, yönetim ve disiplin kadrosunda görev alan kurucu üyelerimiz.</p>
          </div>

          <div className="bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'SÜLEYMAN BAŞOL', role: 'BAŞKAN' },
                { name: 'MELİH BAŞOL', role: 'BAŞKAN YARDIMCISI' },
                { name: 'AKİF CAN ALTUN', role: 'YOL KAPTANI' },
                { name: 'BUKET ŞİMŞEK', role: 'SEKRETER' },
                { name: 'MELEK DOĞANAY', role: 'KADIN GÜCÜ BAŞKANI' },
                { name: 'KURTULUŞ DÜZLÜ', role: 'DİSİPLİN KURULU BAŞKANI / SWEEPER ARTÇI BAŞKAN' },
              ].map((member, idx) => (
                <div key={idx} className="bg-black/60 border border-neutral-900 p-4 rounded-sm flex items-center space-x-4">
                  <div className="w-10 h-10 shrink-0 bg-neutral-900 rounded-sm flex items-center justify-center border border-neutral-800">
                    <span className="font-bebas text-lg text-gold">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{member.name}</h4>
                    <p className="font-sans text-[10px] text-brand uppercase font-bold tracking-widest mt-0.5">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
