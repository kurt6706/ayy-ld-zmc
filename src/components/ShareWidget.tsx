/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, QrCode, X, ExternalLink, Send, MessageSquare } from 'lucide-react';

export function ShareWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    // Determine current URL safely on the client side
    setSiteUrl(window.location.href);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Link kopyalanamadı:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ayyıldız Motosiklet Kulübü',
          text: 'Ayyıldız Motosiklet Kulübü resmi web sitesine göz atın!',
          url: siteUrl,
        });
      } catch (err) {
        console.log('Paylaşım iptal edildi veya başarısız:', err);
      }
    } else {
      handleCopy();
    }
  };

  // Generate QR Code URL using api.qrserver.com
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(siteUrl || 'https://aymc.org')}&color=ffffff&bgcolor=171717&qzone=2`;

  return (
    <>
      {/* Floating Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Web Sitesini Paylaş & QR Kodu Göster"
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_4px_24px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        <span className="absolute right-16 bg-neutral-900 text-red-400 border border-red-500/30 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
          Siteyi Paylaş & QR Kod
        </span>
        <span className="absolute inset-0 rounded-full bg-red-600/40 animate-ping opacity-75"></span>
        <Share2 className="w-6 h-6 relative z-10" />
      </button>

      {/* Share Modal Backdrop / Dialog */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg p-6 relative shadow-2xl overflow-hidden scale-95 md:scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-red-500" />
                <h3 className="font-bebas text-2xl text-white tracking-widest uppercase">KOLAY PAYLAŞIM</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 p-6 rounded-lg mb-6 relative z-10 shadow-inner group">
              <div className="relative w-48 h-48 bg-neutral-900 border border-neutral-800 rounded-md p-2 flex items-center justify-center overflow-hidden">
                <img 
                  src={qrCodeUrl} 
                  alt="AYMC QR Code" 
                  className="w-full h-full object-contain filter brightness-110 contrast-125 select-none"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <p className="font-sans text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-4 text-center">
                Mobil cihazınızdan taratıp hızlıca giriş yapın
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 relative z-10">
              {/* Copy URL Input & Button */}
              <div className="flex items-center bg-black border border-neutral-800 rounded-sm overflow-hidden p-1">
                <input 
                  type="text" 
                  readOnly 
                  value={siteUrl}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-gray-400 focus:outline-none select-all overflow-ellipsis whitespace-nowrap"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-neutral-900 hover:bg-neutral-800 text-gray-300 hover:text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>KOPYALANDI</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>KOPYALA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Social Shares */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Ayyıldız Motosiklet Kulübü resmi web sitesi: ' + siteUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 transition-colors text-emerald-400 rounded-sm text-xs font-sans font-bold tracking-wider uppercase"
                >
                  <MessageSquare className="w-4 h-4 fill-emerald-400/10" />
                  <span>WHATSAPP</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent('Ayyıldız Motosiklet Kulübü resmi web sitesi')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 bg-sky-600/10 border border-sky-500/20 hover:bg-sky-600/20 transition-colors text-sky-400 rounded-sm text-xs font-sans font-bold tracking-wider uppercase"
                >
                  <Send className="w-4 h-4" />
                  <span>TELEGRAM</span>
                </a>
              </div>

              {/* Native System Share */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-sm text-xs font-sans font-bold tracking-widest uppercase mt-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>DİĞER SEÇENEKLER</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
