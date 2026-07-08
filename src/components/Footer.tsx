/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Phone, MapPin, Shield, MessageCircle } from 'lucide-react';
import { IMAGES } from '../data';

interface FooterProps {
  setActivePage: (page: string) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (page: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-black text-gray-400 border-t border-neutral-900/60 pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Red ambient bottom row separator */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        
        {/* Brand Information Column (md:col-span-4) */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleLinkClick('home')}>
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-black font-sans lowercase tracking-tight">aymc</span>
            </div>
            <div>
              <span className="block font-bebas text-xl tracking-wider text-white">AYMC</span>
              <span className="block font-sans text-[9px] tracking-widest text-gold font-bold uppercase">AYYILDIZ MOTOSİKLET KULÜBÜ</span>
            </div>
          </div>
          <p className="font-sans text-xs text-gray-500 leading-relaxed pt-2">
            Şanlı Türk bayrağımızın onuruyla, sarsılmaz kardeşlik bağlarımız, yüksek sürüş disiplinimiz ve sarsılmaz ilkelerimizle yollardayız. "Birlikte Yola, Onurla Geleceğe."
          </p>
        </div>

        {/* Quick Links Column (md:col-span-3) */}
        <div className="md:col-span-3 space-y-4">
          <span className="font-bebas text-sm text-white tracking-wider uppercase block">KULÜP BAĞLANTILARI</span>
          <ul className="space-y-2 text-xs font-sans font-medium">
            <li>
              <button onClick={() => handleLinkClick('home')} className="hover:text-brand transition-colors text-left">Ana Sayfa</button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('about')} className="hover:text-brand transition-colors text-left">Hakkımızda</button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('discipline')} className="hover:text-brand transition-colors text-left">Disiplin Kuralları</button>
            </li>
          </ul>
        </div>

        {/* Quick Links Column 2 (md:col-span-2) */}
        <div className="md:col-span-2 space-y-4">
          <span className="font-bebas text-sm text-white tracking-wider uppercase block">SAYFALAR</span>
          <ul className="space-y-2 text-xs font-sans font-medium">
            <li>
              <button onClick={() => handleLinkClick('news')} className="hover:text-brand transition-colors text-left">Haberler & Blog</button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('contact')} className="hover:text-brand transition-colors text-left">İletişim</button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('membership')} className="hover:text-brand transition-colors text-left">Üyelik Başvurusu</button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('admin')} className="hover:text-brand transition-colors text-left">Yönetim Girişi</button>
            </li>
          </ul>
        </div>

        {/* Social Channels and Contacts (md:col-span-3) */}
        <div className="md:col-span-3 space-y-5">
          <span className="font-bebas text-sm text-white tracking-wider uppercase block">DİJİTAL BAĞLANTILAR</span>
          
          {/* Instagram Highlight Button */}
          <a
            href="https://www.instagram.com/aymk.mc/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-sm hover:border-brand/50 group transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#e6683c] group-hover:to-[#bc1888] group-hover:text-white transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div>
              <span className="block text-[11px] font-sans font-bold tracking-wider text-white uppercase group-hover:text-brand transition-colors">RESMİ INSTAGRAM</span>
              <span className="block text-[10px] font-mono text-gray-500">@aymk.mc</span>
            </div>
          </a>

          {/* Moto Family Highlight Button */}
          <a
            href="https://motofamily.net/grup/69f0e0d96233d809aa130fe8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-sm hover:border-emerald-500/50 group transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] font-sans font-bold tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">MOTO FAMILY GRUBU</span>
              <span className="block text-[10px] font-mono text-gray-500">AYMC Sayfası</span>
            </div>
          </a>

          {/* WhatsApp Group Highlight Button */}
          <a
            href="https://chat.whatsapp.com/H0gqUUPhYdtAwepoF3wAUB"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-sm hover:border-emerald-500/50 group transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <MessageCircle className="w-4 h-4 fill-emerald-400 group-hover:fill-black" />
            </div>
            <div>
              <span className="block text-[11px] font-sans font-bold tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">WHATSAPP KATILMA İSTEĞİ</span>
              <span className="block text-[10px] font-mono text-gray-500">AYMC Chat Grubu</span>
            </div>
          </a>

          {/* Regular Contact Info */}
          <div className="space-y-2 text-xs font-mono text-gray-500 pt-1">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-brand" />
              <span>0542 829 35 61</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-gold" />
              <span>info@aymc.org.tr</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright row */}
      <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-sans text-gray-600 font-semibold">
        <p>© {currentYear} Ayyıldız Motosiklet Kulübü (AYMC). Tüm Hakları Saklıdır.</p>
        <div className="flex items-center space-x-4">
          <span className="hover:text-white cursor-pointer transition-colors">Tüzük</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer transition-colors">Gizlilik Sözleşmesi</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer transition-colors">KVKK Onay Metni</span>
        </div>
      </div>
    </footer>
  );
}
