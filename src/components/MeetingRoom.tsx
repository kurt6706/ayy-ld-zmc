import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  ExternalLink, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Wifi, 
  Volume2, 
  Mic, 
  Camera, 
  Users,
  Info
} from 'lucide-react';

export default function MeetingRoom() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
    setIframeLoaded(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 animate-fade-in font-sans transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#050505] p-4 max-w-none' : ''}`}>
      
      {/* HEADER SECTION - Hide when in full screen to maximize space */}
      {!isFullscreen && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-sans font-extrabold tracking-widest text-brand uppercase mb-3">
            <Video className="w-3.5 h-3.5 animate-pulse" />
            <span>Sanal Karargah & Canlı Toplantı</span>
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-wider text-white mb-2">
            AYYILDIZ MOTOSİKLET KULÜBÜ MECLİS ODASI
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm max-w-2xl mx-auto uppercase tracking-wider leading-relaxed">
            Kulüp üyeleri ve yönetim kurulu toplantıları için kesintisiz canlı yayın, sesli brifing ve ortak karar merkezimiz.
          </p>
        </div>
      )}

      {/* WORKSPACE DECK */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isFullscreen ? 'h-full grid-rows-[auto_1fr]' : ''}`}>
        
        {/* LEFT PANEL: Quick Controls & Status */}
        {!isFullscreen && (
          <div className="lg:col-span-3 space-y-5">
            {/* Realtime Status Indicator */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold text-neutral-500 tracking-wider uppercase">Bağlantı Durumu</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              
              <h3 className="text-base font-bold text-white tracking-wide mb-1 flex items-center gap-2 uppercase">
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                CANLI YAYIN AKTİF
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium tracking-wide uppercase leading-relaxed mb-5">
                Toplantı odası şu anda bağlantıya hazır durumdadır. Kameralı ve mikrofonlu katılım sağlayabilirsiniz.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleReload}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-neutral-800 hover:border-brand/40 bg-neutral-900/40 hover:bg-neutral-900 rounded-xl text-[10px] font-sans font-extrabold tracking-widest text-neutral-300 hover:text-white transition-all cursor-pointer uppercase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  YAYINI YENİLE / RESET
                </button>

                <a
                  href="https://ayy-ld-z-moto-kl-p.ai.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand/10 hover:bg-brand/20 border border-brand/20 rounded-xl text-[10px] font-sans font-extrabold tracking-widest text-brand hover:text-brand-light transition-all cursor-pointer uppercase"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  YENİ SEKMEDE AÇ
                </a>
              </div>
            </div>

            {/* Quick Access Guidelines */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-neutral-900 pb-2.5">
                <ShieldCheck className="w-4 h-4 text-brand" />
                KATILIM REHBERİ
              </h4>
              <div className="space-y-4 text-[10px] text-neutral-400 leading-relaxed uppercase font-medium">
                <div className="flex gap-2">
                  <Camera className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">KAMERA & MİKROFON</span>
                    Tarayıcınız izin istediğinde "İzin Ver" butonuna tıklayarak yayına katılabilirsiniz.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Mic className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">GİRİŞ DİSİPLİNİ</span>
                    Odaya ilk giriş yaptığınızda mikrofonunuzu kapalı tutmaya özen gösteriniz.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Users className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">TOPLU KATILIM</span>
                    Yönetim kurulu kararları, haftalık sürüş planlamaları ve üye mülakatları burada yapılır.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANEL: Embedded Meeting Portal Frame */}
        <div className={`${isFullscreen ? 'col-span-12 h-full' : 'lg:col-span-9'} flex flex-col h-[650px] bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative`}>
          
          {/* Frame Top Navigation Bar */}
          <div className="bg-neutral-950 border-b border-neutral-900 px-4 py-3 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40 inline-block"></span>
              </div>
              <span className="text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest ml-2 truncate max-w-[200px] sm:max-w-none">
                https://ayy-ld-z-moto-kl-p.ai.studio/
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-[9px] font-sans font-bold text-neutral-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                title={isFullscreen ? "Küçült" : "Tam Ekran Yap"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Küçült</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>Genişlet</span>
                  </>
                )}
              </button>

              <a
                href="https://ayy-ld-z-moto-kl-p.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 border border-brand/20 rounded-lg text-[9px] font-sans font-bold text-brand uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Yeni Sekmede Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Core Iframe Workspace */}
          <div className="flex-1 w-full bg-[#050505] relative overflow-hidden">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-20 space-y-4">
                <div className="w-10 h-10 border-4 border-t-brand border-neutral-850 rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-xs font-sans font-extrabold text-white uppercase tracking-widest mb-1 animate-pulse">
                    Toplantı Odasına Bağlanılıyor...
                  </p>
                  <p className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider">
                    Sanal Karargah Yükleniyor, Lütfen Bekleyin
                  </p>
                </div>
              </div>
            )}
            
            <iframe
              key={reloadKey}
              src="https://ayy-ld-z-moto-kl-p.ai.studio/"
              className="w-full h-full border-0 absolute inset-0"
              allow="camera; microphone; display-capture; autoplay; encrypted-media; clipboard-write;"
              onLoad={() => setIframeLoaded(true)}
              title="Ayyıldız Moto Kulüp Sanal Karargahı"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
