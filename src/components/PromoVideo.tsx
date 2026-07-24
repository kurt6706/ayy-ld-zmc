import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PromoVideo() {
  return (
    <section id="promo-video-section" className="bg-[#030303] py-12 border-b border-neutral-900/60 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-white uppercase">
              AYYILDIZ MC RESMİ TANITIM FİLMİ
            </span>
          </div>
          <h2 className="font-bebas text-3xl sm:text-5xl tracking-widest text-white">
            AYYILDIZ MOTOSİKLET KULÜBÜ
          </h2>
          <p className="font-sans text-xs text-gray-400 tracking-wider mt-2 max-w-lg mx-auto">
            Rüzgarın, kardeşliğin ve yolların asaletini anlatan resmi tanıtım videomuzu izleyin.
          </p>
        </div>

        <div className="relative group max-w-4xl mx-auto">
          {/* Glowing cinematic border */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-gold/10 to-brand/20 rounded-md blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative border border-neutral-800/80 rounded-md p-2 bg-neutral-950/60 backdrop-blur-md shadow-2xl">
            <div className="aspect-video w-full overflow-hidden rounded-sm bg-black relative">
              <iframe
                src="https://www.youtube.com/embed/mWcnzdCoULs?autoplay=0&rel=0&modestbranding=1"
                title="Ayyıldız Moto Kulüp Tanıtım Videosu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full shadow-inner"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
