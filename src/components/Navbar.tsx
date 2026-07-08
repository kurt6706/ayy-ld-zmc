/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Shield, Lock, Instagram, Search } from 'lucide-react';
import { IMAGES } from '../data';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenChat: () => void;
}

export default function Navbar({ activePage, setActivePage, darkMode, setDarkMode, onOpenChat }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'about', label: 'Hakkımızda' },
    { id: 'discipline', label: 'Disiplin Kuralları' },
    { id: 'news', label: 'Haberler' },
    { id: 'chat', label: 'Canlı Sohbet' },
    { id: 'workspace', label: 'Bulut Entegrasyonu' },
    { id: 'contact', label: 'İletişim' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'chat') {
      onOpenChat();
      setIsOpen(false);
      return;
    }
    setActivePage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/95 dark:bg-[#050505]/95 shadow-lg shadow-black/10 py-3 border-b border-brand/20 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/85 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="navbar-logo"
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            {/* Real Logo Image */}
            <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-800 bg-black flex items-center justify-center shadow-lg shadow-brand/10 transition-transform duration-300 group-hover:scale-110">
              <img src={IMAGES.logo} alt="AYMC Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="block font-bebas text-2xl tracking-widest text-white group-hover:text-brand transition-colors duration-300 animate-pulse-slow">
                AYMC
              </span>
              <span className="block font-sans text-[10px] tracking-widest text-gray-400 font-semibold group-hover:text-gold transition-colors duration-300">
                AYYILDIZ MOTO KULÜP
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-sans font-bold tracking-wider uppercase transition-colors ${
                  activePage === item.id
                    ? 'text-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center space-x-3 pl-6 border-l border-neutral-800">
              <button
                onClick={() => alert('Arama özelliği yakında eklenecek!')}
                className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                title="Sitede Ara"
              >
                <Search className="w-4 h-4" />
              </button>
              
              <button
                id="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                title={darkMode ? 'Açık Tema' : 'Karanlık Tema'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => handleNavClick('admin')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white transition-colors rounded-sm text-xs font-bold tracking-wider uppercase"
              >
                <Lock className="w-3 h-3" />
                <span>GİRİŞ</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => alert('Arama özelliği yakında eklenecek!')}
              className="p-2 rounded-full bg-neutral-900/60 border border-neutral-800 text-gray-400 hover:text-white transition-colors hover:bg-neutral-800 cursor-pointer"
              title="Sitede Ara"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              id="theme-toggle-mobile"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-neutral-900/60 border border-neutral-800 text-gold hover:text-white transition-colors hover:bg-neutral-800 cursor-pointer"
              title={darkMode ? 'Açık Tema' : 'Karanlık Tema'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              id="menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-sm bg-brand/10 border border-brand/20 text-white hover:text-brand focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/75 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Solid Left Side Drawer / Sidebar Menu */}
      <div
        id="full-nav-menu"
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0c0c0c] border-r border-neutral-800 shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-50 md:hidden transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
              <img src={IMAGES.logo} alt="AYMC Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="block font-bebas text-xl tracking-widest text-white">AYMC</span>
              <span className="block font-sans text-[9px] tracking-widest text-gray-500 font-bold">AYYILDIZ MOTO KULÜP</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-sm bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items - Soldan Aşağıya Alt Alta */}
        <div className="flex-1 overflow-y-auto py-6 px-5 space-y-4 bg-[#0a0a0a]">
          <p className="text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest pl-1">Menü Navigasyonu</p>
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-3 rounded-md text-sm font-sans font-bold tracking-wider uppercase transition-all flex items-center justify-between cursor-pointer ${
                  activePage === item.id
                    ? 'bg-brand/15 border-l-4 border-brand text-brand pl-4'
                    : 'text-neutral-300 hover:bg-neutral-900/60 hover:text-white hover:pl-4'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${activePage === item.id ? 'bg-brand' : 'bg-transparent'}`}></span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer with Search, Theme, Socials, Admin Login */}
        <div className="p-5 bg-[#070707] border-t border-neutral-900 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                alert('Arama özelliği yakında eklenecek!');
              }}
              className="flex items-center justify-center space-x-2 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Sitede Ara</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center space-x-2 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{darkMode ? 'Açık Tema' : 'Karanlık'}</span>
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <a
              href="https://www.instagram.com/aymk.mc/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 bg-[#bc1888]/10 border border-[#bc1888]/30 hover:bg-[#bc1888]/20 transition-colors text-[#ff7ebd] rounded-md text-xs font-sans font-bold tracking-wider uppercase"
            >
              <Instagram className="w-4 h-4" />
              <span>INSTAGRAM (@aymk.mc)</span>
            </a>
            <a
              href="https://motofamily.net/grup/69f0e0d96233d809aa130fe8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 bg-emerald-950/45 border border-emerald-500/20 hover:bg-emerald-900/40 transition-colors text-emerald-400 rounded-md text-xs font-sans font-bold tracking-wider uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>MOTO FAMILY KULÜP GRUBU</span>
            </a>
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-md text-xs font-sans font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-brand border-brand text-white'
                  : 'bg-neutral-900 border-neutral-800 text-gold hover:bg-neutral-850'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>GİRİŞ YAP / YÖNETİCİ</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
