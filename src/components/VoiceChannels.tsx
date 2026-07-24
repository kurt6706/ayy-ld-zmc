/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, ExternalLink, HelpCircle, Shield, Info } from 'lucide-react';

export default function VoiceChannels() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const voiceAppUrl = 'https://kurt-mc-biker-voice-channels-73982233019.europe-west2.run.app';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="voice-channels-container">
      {/* Header section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-[11px] font-extrabold uppercase tracking-widest font-mono mb-4 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          Canlı Sesli Telsiz Sistemi
        </div>
        <h1 className="font-bebas text-5xl md:text-6xl tracking-widest text-white mb-3">
          AYMC <span className="text-brand">SESLİ TELSIZ</span> ODALARI
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-gray-400 font-sans tracking-wide leading-relaxed">
          Ayyıldız Moto Kulübü üyeleri ve dostları için hazırlanmış gerçek zamanlı, düşük gecikmeli sesli telsiz kanalları. Tarayıcınızdan doğrudan mikrofon yetkisi vererek katılabilirsiniz.
        </p>
      </div>

      {/* Info Notice Banner */}
      <div className="bg-[#0b0b0b] border border-neutral-850 rounded-lg p-4 mb-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-brand/10 text-brand rounded-md shrink-0 mt-0.5 sm:mt-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-sans font-extrabold tracking-wider text-white uppercase">Mikrofon ve Erişim Yetkilendirmesi</h3>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              Sesli kanallara katılmak için tarayıcınızın mikrofon izni penceresinde <strong className="text-brand">"İzin Ver"</strong> butonuna tıklamanız gerekmektedir.
            </p>
          </div>
        </div>
        <a
          href={voiceAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-brand text-neutral-300 hover:text-white border border-neutral-800 hover:border-brand/40 text-xs font-extrabold uppercase tracking-wider rounded transition-all shrink-0 hover:scale-[1.02]"
        >
          Yeni Sekmede Aç
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Iframe Viewport Container */}
      <div className="relative bg-[#050505] border border-neutral-850 rounded-xl overflow-hidden shadow-2xl h-[78vh] min-h-[550px] max-h-[850px] flex flex-col">
        {/* Iframe Loading Placeholder */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070707] z-10 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-brand border-neutral-800 animate-spin"></div>
            <div className="text-center">
              <p className="text-sm font-sans font-bold text-gray-300 uppercase tracking-widest animate-pulse">AYMC Telsiz Sunucusu Yükleniyor...</p>
              <p className="text-xs text-gray-500 font-mono mt-1">Lütfen bekleyin.</p>
            </div>
          </div>
        )}

        {/* Embedded Iframe Application */}
        <iframe
          src={voiceAppUrl}
          title="AYMC Biker Voice Channels"
          className="w-full h-full border-none flex-1"
          onLoad={() => setIframeLoaded(true)}
          allow="microphone; camera; display-capture; autoplay; clipboard-write; encrypted-media;"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Helper FAQ Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#080808] border border-neutral-900 rounded-lg p-5">
          <h4 className="text-xs font-sans font-extrabold tracking-wider text-brand uppercase mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Sesim Gitmiyor, Ne Yapmalıyım?
          </h4>
          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            Tarayıcınızın adres çubuğunun sol kısmında bulunan kilit simgesine (site ayarları) tıklayın. "Mikrofon" seçeneğinin "İzin Verildi" konumunda olduğundan emin olun. Sorun devam ederse sayfayı yenileyin veya üstteki "Yeni Sekmede Aç" butonuyla uygulamayı doğrudan ziyaret edin.
          </p>
        </div>

        <div className="bg-[#080808] border border-neutral-900 rounded-lg p-5">
          <h4 className="text-xs font-sans font-extrabold tracking-wider text-neutral-300 uppercase mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-gray-500" />
            Kurallar ve Adab-ı Muaşeret
          </h4>
          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            AYMC telsiz ve ses kanalları kulüp içi hiyerarşi, saygı, kardeşlik ve disiplin kurallarına tabidir. Lütfen konuşmalarınızda nezaket kurallarına dikkat ediniz ve gereksiz kanal gürültüsü oluşturmayınız.
          </p>
        </div>
      </div>
    </div>
  );
}
