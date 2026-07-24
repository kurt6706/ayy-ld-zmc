/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Shield, 
  Lock, 
  Instagram, 
  Search,
  Home,
  Info,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Radio,
  Cloud,
  Phone,
  ChevronRight,
  User,
  Video
} from 'lucide-react';
import { IMAGES } from '../data';
import { subscribeDirectMessages } from '../lib/firebaseService';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentUser?: any;
}

export default function Navbar({ activePage, setActivePage, darkMode, setDarkMode, currentUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadDms, setUnreadDms] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadDms(0);
      return;
    }
    const unsub = subscribeDirectMessages((msgs) => {
      const count = msgs.filter((m) => m.receiverId === currentUser.id && !m.read).length;
      setUnreadDms(count);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseNavItems = [
    { id: 'home', label: 'Ana Sayfa', shortLabel: 'Ana Sayfa', icon: Home },
    { id: 'about', label: 'Hakkımızda', shortLabel: 'Hakkımızda', icon: Info },
    { id: 'discipline', label: 'Disiplin Kuralları', shortLabel: 'Disiplin', icon: FileText },
    { id: 'news', label: 'Haberler & Blog', shortLabel: 'Haberler', icon: Newspaper },
    { id: 'gallery', label: 'Medya Galerisi', shortLabel: 'Galeri', icon: ImageIcon },
    { id: 'voice', label: 'Sesli Telsiz', shortLabel: 'Telsiz', icon: Radio },
    { id: 'meeting', label: 'Toplantı Odası', shortLabel: 'Toplantı', icon: Video },
    { id: 'workspace', label: 'Bulut Entegrasyonu', shortLabel: 'Bulut', icon: Cloud },
    { id: 'contact', label: 'İletişim Hattı', shortLabel: 'İletişim', icon: Phone },
  ];

  const navItems = currentUser 
    ? [...baseNavItems, { id: 'profile', label: 'Profilim', shortLabel: 'Profilim', icon: User }]
    : baseNavItems;

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`"${searchQuery}" için arama yakında aktif olacaktır!`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#060606]/95 border-b border-neutral-900/85 backdrop-blur-md py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div
              id="navbar-logo"
              className="flex items-center space-x-3 cursor-pointer group shrink-0"
              onClick={() => handleNavClick('home')}
            >
              {/* Real Logo Image */}
              <div className="w-11 h-11 rounded-full overflow-hidden border border-neutral-800 bg-black flex items-center justify-center shadow-lg shadow-brand/10 transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={IMAGES.logo} 
                  alt="AYMC Logo" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="text-left">
                <span className="block font-bebas text-xl md:text-2xl tracking-widest text-white group-hover:text-brand transition-colors duration-300">
                  AYMC
                </span>
                <span className="block font-sans text-[8px] md:text-[9px] tracking-widest text-neutral-400 font-extrabold group-hover:text-white transition-colors duration-300 uppercase">
                  AYYILDIZ MOTO KULÜP
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              <div className="flex items-center space-x-1 bg-neutral-950/40 border border-neutral-900/50 rounded-full px-2 py-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3 py-1.5 rounded-full text-[11px] font-sans font-extrabold tracking-widest uppercase transition-all duration-300 ${
                      activePage === item.id
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    {item.shortLabel}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 pl-3 border-l border-neutral-800">
                {/* Expandable Desktop Search Button */}
                <div className="relative flex items-center">
                  {searchOpen ? (
                    <form onSubmit={handleSearchSubmit} className="flex items-center animate-fade-in">
                      <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#0b0b0b] border border-neutral-800 text-white text-[11px] font-sans font-bold uppercase tracking-wider rounded-full pl-3 pr-8 py-1.5 focus:border-brand focus:outline-none w-36 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="absolute right-2.5 text-neutral-500 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="p-2 rounded-full text-neutral-400 hover:text-white transition-all hover:bg-neutral-900 cursor-pointer"
                      title="Sitede Ara"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  id="theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full text-neutral-400 hover:text-white transition-all hover:bg-neutral-900 cursor-pointer animate-fade-in"
                  title={darkMode ? 'Açık Tema' : 'Karanlık Tema'}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
                
                {currentUser ? (
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`relative p-1 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      activePage === 'profile'
                        ? 'border-brand bg-brand/10 shadow-lg shadow-brand/10'
                        : 'border-neutral-800 hover:border-neutral-600 bg-neutral-950'
                    }`}
                    title="Profilim & Mesajlarım"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-neutral-900">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-neutral-300" />
                      )}
                    </div>
                    {unreadDms > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-[8px] font-sans font-extrabold text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                        {unreadDms}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 border transition-all rounded-full text-[10px] font-sans font-extrabold tracking-widest uppercase cursor-pointer ${
                      activePage === 'admin'
                        ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <Lock className="w-3 h-3 text-brand" />
                    <span>ÜYE GİRİŞİ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tablet Navigation (Compact Layout for MD screens) */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {currentUser && (
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`relative p-1 mr-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    activePage === 'profile'
                      ? 'border-brand bg-brand/10'
                      : 'border-neutral-800 bg-neutral-950'
                  }`}
                  title="Profilim"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-neutral-900">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                  {unreadDms > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-[8px] font-sans font-extrabold text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                      {unreadDms}
                    </span>
                  )}
                </button>
              )}
              
              <div className="flex items-center space-x-1 bg-neutral-950/40 border border-neutral-900/50 rounded-full px-1.5 py-1">
                {navItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2.5 py-1.5 rounded-full text-[10px] font-sans font-extrabold tracking-widest uppercase transition-all duration-300 ${
                      activePage === item.id
                        ? 'bg-brand text-white shadow shadow-brand/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    {item.shortLabel}
                  </button>
                ))}
              </div>

              <button
                id="menu-btn-tablet"
                onClick={() => setIsOpen(true)}
                className="ml-2 p-2 rounded-full bg-brand/10 border border-brand/20 text-white hover:bg-brand hover:text-white transition-colors animate-pulse"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Actions Header */}
            <div className="flex md:hidden items-center space-x-2">
              {currentUser && (
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`relative p-1 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    activePage === 'profile'
                      ? 'border-brand bg-brand/10'
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                  title="Profilim"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-neutral-950">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-neutral-300" />
                    )}
                  </div>
                  {unreadDms > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand text-[7px] font-sans font-bold text-white rounded-full flex items-center justify-center shadow-md">
                      {unreadDms}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-neutral-900/50 border border-neutral-800/80 text-neutral-400 hover:text-white transition-colors"
                title={darkMode ? 'Açık Tema' : 'Karanlık Tema'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              
              <button
                id="menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full bg-brand/10 border border-brand/20 text-white hover:text-brand focus:outline-none transition-all duration-300"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/85 z-[90] md:flex transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Solid Left Side Drawer / Sidebar Menu (Highly polished for mobile) */}
      <div
        id="full-nav-menu"
        className={`fixed top-0 left-0 h-full w-[310px] max-w-[85vw] bg-[#090909] border-r border-neutral-900 shadow-[15px_0_40px_rgba(0,0,0,0.95)] z-[100] transition-transform duration-300 ease-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-neutral-900/60 flex items-center justify-between bg-[#050505]/95">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
              <img 
                src={IMAGES.logo} 
                alt="AYMC Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="text-left">
              <span className="block font-bebas text-xl tracking-widest text-white">AYMC</span>
              <span className="block font-sans text-[8px] tracking-widest text-neutral-500 font-extrabold uppercase">AYYILDIZ MOTO KULÜP</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-750 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar inside Mobile Menu */}
        <div className="px-5 pt-4 bg-[#090909]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="SİTEDE GÖRSEL, HABER ARA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-850 text-white text-[10px] font-sans font-bold uppercase tracking-widest rounded-lg pl-10 pr-4 py-3 focus:border-brand focus:outline-none transition-colors"
            />
          </form>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-4 bg-[#090909] custom-scrollbar">
          <div className="space-y-1.5">
            <p className="text-[9px] font-sans font-extrabold text-neutral-500 uppercase tracking-widest pl-2 mb-3">Menü Kategorileri</p>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg text-[11px] font-sans font-extrabold tracking-widest uppercase transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-brand/10 border border-brand/20 text-brand shadow-md shadow-brand/5'
                      : 'text-neutral-300 hover:bg-neutral-900/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${isActive ? 'bg-brand/15 text-brand' : 'bg-neutral-950 text-neutral-500'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'text-brand translate-x-0.5' : 'text-neutral-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-[#050505] border-t border-neutral-900 space-y-3 shrink-0">
          <div className="flex flex-col space-y-2">
            <a
              href="https://www.instagram.com/aymk.mc/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 bg-[#bc1888]/5 border border-[#bc1888]/15 hover:bg-[#bc1888]/10 transition-all text-[#ff7ebd] rounded-lg text-[10px] font-sans font-extrabold tracking-wider uppercase"
            >
              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4" />
                <span>INSTAGRAM'DA TAKİP ET</span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#bc1888]" />
            </a>
            
            <a
              href="https://motofamily.net/grup/69f0e0d96233d809aa130fe8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 bg-emerald-950/20 border border-emerald-500/10 hover:bg-emerald-950/30 transition-all text-emerald-400 rounded-lg text-[10px] font-sans font-extrabold tracking-wider uppercase"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>MOTO FAMILY KULÜP GRUBU</span>
              </div>
              <ChevronRight className="w-3 h-3 text-emerald-600" />
            </a>

            {currentUser ? (
              <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-neutral-800 bg-neutral-900 shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-[10px] font-extrabold text-white truncate leading-none uppercase">
                      {currentUser.name} {currentUser.surname}
                    </p>
                    <p className="text-[8px] text-neutral-500 uppercase font-sans font-bold mt-1">Oturum Açık</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="px-2.5 py-1.5 bg-brand text-white hover:bg-brand-dark rounded text-[9px] font-extrabold tracking-wider uppercase transition-colors shrink-0"
                >
                  PROFiL
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-[10px] font-sans font-extrabold tracking-widest uppercase border transition-all cursor-pointer ${
                  activePage === 'admin'
                    ? 'bg-brand border-brand text-white shadow-lg'
                    : 'bg-neutral-900 border-neutral-850 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-brand" />
                <span>ÜYE GİRİŞ PANELİ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
