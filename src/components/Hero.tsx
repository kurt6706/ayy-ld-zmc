/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDown, Shield, Award, Map, Navigation, MessageCircle } from 'lucide-react';
import { IMAGES } from '../data';

interface HeroProps {
  onDiscoverClick: () => void;
}

export default function Hero({ onDiscoverClick }: HeroProps) {
  return (
    <div
      id="hero-section"
      className="relative min-h-screen w-full flex flex-col justify-end pb-24 bg-black text-white overflow-hidden pt-20"
    >
      {/* Background Image Container with Ken Burns effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-pulse-slow scale-105 opacity-60"
          style={{ 
            backgroundImage: `url(${IMAGES.logo})`,
            animation: 'kenburns 30s ease-out infinite alternate'
          }}
        />
        {/* Cinematic Grid Lines Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        
        {/* Subtle Glowing Red Laser Line / Accent in background */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-60 z-20" />
      </div>

      {/* Floating Particle Simulation (CSS-based) */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-brand rounded-full animate-ping [animation-duration:4s]"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gold rounded-full animate-ping [animation-duration:6s]"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:5s]"></div>
      </div>

      {/* Hero Content - Moved down to prevent covering the background logo */}
      <div className="relative z-20 flex flex-col items-center justify-end text-center px-4 max-w-5xl mx-auto mt-auto">
        {/* Official Club Patch / Logo - Small icon removed since it's now the background */}
        
        {/* Badge Indicator */}
        <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 bg-brand/10 border border-brand/30 rounded-full">
          <Shield className="w-4 h-4 text-brand fill-brand/20" />
          <span className="font-sans text-[11px] font-bold tracking-[0.25em] text-white uppercase">
            GÜVEN • DİSİPLİN • KARDEŞLİK
          </span>
        </div>

        {/* Large Cinematic Heading */}
        <h1 
          id="hero-title"
          className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-none tracking-tight font-extrabold select-none mb-4"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
        >
          BİRLİKTE YOLA,
          <br />
          <span className="text-gradient bg-gradient-to-r from-brand via-brand to-gold bg-clip-text text-transparent">
            ONURLA GELECEĞE.
          </span>
        </h1>

        {/* Brand Name Subtitle */}
        <p className="font-sans text-lg sm:text-2xl tracking-[0.4em] font-medium text-white mb-1 uppercase">
          AYMC
        </p>
        <p className="font-sans text-sm sm:text-lg tracking-[0.2em] text-gold font-semibold uppercase mb-8">
          Ayyıldız Motosiklet Kulübü
        </p>

        {/* Premium Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mt-2">
          <button
            id="hero-cta-discover"
            onClick={onDiscoverClick}
            className="w-full sm:w-auto group relative px-8 py-4 bg-transparent border border-neutral-700 hover:border-white rounded-sm font-sans text-xs font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2 text-gray-300 group-hover:text-white font-semibold">
              <span>KULÜBÜ KEŞFET</span>
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
            </span>
          </button>

          <a
            href="https://www.instagram.com/aymk.mc/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group relative px-8 py-4 bg-brand border border-brand rounded-sm font-sans text-xs font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(179,0,0,0.6)] flex items-center justify-center space-x-2 text-white font-extrabold"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></span>
            <span className="relative z-10 flex items-center space-x-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>INSTAGRAM'DA TAKİP ET</span>
            </span>
          </a>

          <a
            href="https://motofamily.net/grup/69f0e0d96233d809aa130fe8"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group relative px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-sm font-sans text-xs font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 text-white font-extrabold"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></span>
            <span className="relative z-10 flex items-center space-x-2 text-gold group-hover:text-emerald-400">
              <Shield className="w-4 h-4 text-gold group-hover:text-emerald-400" />
              <span>MOTO FAMILY GRUBU</span>
            </span>
          </a>

          <a
            href="https://chat.whatsapp.com/H0gqUUPhYdtAwepoF3wAUB"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group relative px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-sm font-sans text-xs font-bold tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 text-white font-extrabold"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-850 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></span>
            <span className="relative z-10 flex items-center space-x-2 text-emerald-400">
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <span>WHATSAPP KATILIM İSTEĞİ</span>
            </span>
          </a>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer opacity-75 hover:opacity-100 transition-opacity" onClick={onDiscoverClick}>
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-1">KAYDIR</span>
        <div className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-duration:2s]" />
        </div>
      </div>

      {/* Inline styles for Ken Burns animation */}
      <style>{`
        @keyframes kenburns {
          0% {
            transform: scale(1.03) translate(0, 0);
          }
          50% {
            transform: scale(1.10) translate(-1%, -1%);
          }
          100% {
            transform: scale(1.03) translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}
