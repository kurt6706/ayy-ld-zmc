import React, { useState, useEffect } from 'react';
import { X, Trash2, Image as ImageIcon, Play, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../types';
import { subscribeGalleryItems, addOrUpdateGalleryItem, deleteGalleryItemDoc } from '../lib/firebaseService';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

interface GalleryProps {
  currentUser: any | null;
  setActivePage: (page: string) => void;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

export default function Gallery({ currentUser }: GalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'FOTOĞRAFLAR' | 'VİDEOLAR'>('FOTOĞRAFLAR');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeGalleryItems((items) => {
      setGalleryItems(items);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = currentUser?.role === 'admin' || (() => {
    if (!currentUser) return false;
    const name = (currentUser.name || '').toLowerCase().trim();
    const surname = (currentUser.surname || '').toLowerCase().trim();
    const fullName = `${name} ${surname}`.trim();
    const displayName = (currentUser.displayName || '').toLowerCase().trim();
    const username = (currentUser.username || '').toLowerCase().trim();

    // Check for "melek doganay", "kurtulus duzlu", and "kurt" as managers/admins
    const isMelek = (fullName.includes('melek') && (fullName.includes('doğanay') || fullName.includes('doganay') || surname.includes('doğanay') || surname.includes('doganay'))) || displayName.includes('melek') || name.includes('melek');
    const isKurtulus = (fullName.includes('kurtuluş') && (fullName.includes('düzlü') || fullName.includes('duzlu') || surname.includes('düzlü') || surname.includes('duzlu'))) || displayName.includes('kurtuluş') || name.includes('kurtuluş') || username === 'kurt';
    const isKurt = name === 'kurt' || username === 'kurt' || displayName === 'kurt';

    return isMelek || isKurtulus || isKurt;
  })();

  const handleEditSave = async () => {
    if (!editingItem) return;
    if (!isAdmin) {
      alert('Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.');
      return;
    }
    try {
      await addOrUpdateGalleryItem(editingItem);
      setEditingItem(null);
    } catch (error) {
      console.error('Edit error:', error);
      alert('Kaydedilirken hata oluştu.');
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!isAdmin) {
      alert('Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.');
      return;
    }
    if (window.confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
      try {
        await deleteGalleryItemDoc(item.id);
        if (item.storagePath) {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef).catch(console.error); // Ignore storage delete errors
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Silinirken hata oluştu.');
      }
    }
  };

  // Backwards compatibility with previous categories
  // Display images under Fotoğraflar tab, videos under Videolar tab
  const images = galleryItems.filter(item => item.category !== 'Videolar' && (item.type === 'image' || !item.type));
  const videos = galleryItems.filter(item => item.category === 'Videolar' || item.type === 'video');

  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => 
          prev !== null && prev < images.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => 
          prev !== null && prev > 0 ? prev - 1 : images.length - 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, images.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="gallery-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="font-bebas text-5xl text-white tracking-wider mb-2">MEDYA GALERİSİ</h2>
          <p className="text-gray-400 font-sans">Kulüp etkinliklerimizden özel kareler ve videolar.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Tabs for Fotoğraflar vs Videolar */}
          <div className="flex space-x-2 bg-neutral-950 p-1 rounded-full border border-neutral-850 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('FOTOĞRAFLAR')}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'FOTOĞRAFLAR' 
                  ? 'bg-brand text-black shadow-lg shadow-brand/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Fotoğraflar ({images.length})
            </button>
            <button
              onClick={() => setActiveTab('VİDEOLAR')}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'VİDEOLAR' 
                  ? 'bg-brand text-black shadow-lg shadow-brand/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" /> Videolar ({videos.length})
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {activeTab === 'FOTOĞRAFLAR' ? (
          <div>
            <h3 className="text-3xl font-bebas text-white tracking-wider mb-6 flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-brand" /> TÜM FOTOĞRAFLAR
            </h3>
            
            {images.length === 0 ? (
              <div className="py-20 text-center bg-neutral-900/50 border border-neutral-800 rounded-xl">
                <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Fotoğraf Bulunamadı</h3>
                <p className="text-gray-400">Henüz galeriye bir fotoğraf yüklenmemiş.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item, index) => (
                  <div 
                    key={item.id} 
                    onClick={() => setActiveLightboxIndex(index)}
                    className="relative group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl aspect-square cursor-pointer"
                  >
                    <img 
                      src={item.url} 
                      alt={item.description}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold mb-1 truncate">{item.description || 'İsimsiz İçerik'}</h4>
                      <div className="flex items-center gap-2 text-gray-300 text-xs font-mono mb-3">
                        <span className="truncate">{item.category || 'Fotoğraflar'}</span>
                        <span>•</span>
                        <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">Yükleyen: {item.uploadedBy || 'Üye'}</span>
                        {isAdmin && (
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 bg-neutral-800/80 text-white hover:bg-brand hover:text-black rounded-md transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item)}
                              className="p-1.5 bg-red-900/80 text-white hover:bg-red-600 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-3xl font-bebas text-white tracking-wider mb-6 flex items-center gap-3">
              <Play className="w-8 h-8 text-brand" /> TÜM VİDEOLAR
            </h3>

            {videos.length === 0 ? (
              <div className="py-20 text-center bg-neutral-900/50 border border-neutral-800 rounded-xl">
                <Play className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Video Bulunamadı</h3>
                <p className="text-gray-400">Henüz galeriye bir video yüklenmemiş.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(item => {
                  const isInstagram = item.url.includes('instagram.com');
                  const isYouTube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
                  const ytEmbedUrl = isYouTube ? getYouTubeEmbedUrl(item.url) : null;

                  return (
                    <div 
                      key={item.id} 
                      className={`relative group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl flex flex-col justify-between ${
                        isInstagram ? 'aspect-[3/4] md:max-w-md mx-auto w-full' : 'aspect-video'
                      }`}
                    >
                      <div className="w-full h-full relative bg-black flex-1">
                        {isInstagram ? (
                          <iframe
                            src={`${item.url.split('?')[0].endsWith('/') ? item.url.split('?')[0] : item.url.split('?')[0] + '/'}embed`}
                            className="w-full h-full border-0 rounded-t-2xl"
                            allowFullScreen
                            allow="encrypted-media"
                            scrolling="no"
                          />
                        ) : isYouTube && ytEmbedUrl ? (
                          <iframe
                            src={ytEmbedUrl}
                            title={item.description || 'YouTube Video'}
                            className="w-full h-full border-0 rounded-t-2xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : item.url.match(/\.(jpg|jpeg|png|webp)/i) ? (
                          <div className="relative w-full h-full group/play">
                            <img 
                              src={item.url} 
                              alt={item.description}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/play:bg-black/50 transition-colors">
                              <div className="w-16 h-16 rounded-full bg-brand/90 flex items-center justify-center text-black shadow-lg shadow-brand/30 transform group-hover/play:scale-110 transition-transform">
                                <Play className="w-8 h-8 fill-black" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video 
                            src={item.url} 
                            controls
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {isAdmin && (
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-10">
                            <button 
                              onClick={() => setEditingItem(item)}
                              className="p-2 bg-neutral-800/80 text-white hover:bg-brand hover:text-black rounded-lg transition-colors backdrop-blur-sm"
                              title="Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item)}
                              className="p-2 bg-red-900/80 text-white hover:bg-red-600 rounded-lg transition-colors backdrop-blur-sm"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-[#111] border-t border-neutral-850">
                        <h4 className="text-white font-bold mb-1 truncate">{item.description || 'İsimsiz Video'}</h4>
                        <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.category || 'Videolar'}</span>
                            <span>•</span>
                            <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 truncate max-w-[120px]">Yükleyen: {item.uploadedBy || 'Üye'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-neutral-800 rounded-2xl max-w-lg w-full p-8 relative">
            <button 
              onClick={() => setEditingItem(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-neutral-900 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 font-bebas tracking-wider">
              <Edit3 className="w-7 h-7 text-brand" /> İÇERİĞİ DÜZENLE
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kategori / Dosya Türü</label>
                <select
                  value={editingItem.category === 'Videolar' || editingItem.type === 'video' ? 'Videolar' : 'Fotoğraflar'}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    setEditingItem({
                      ...editingItem,
                      category: selectedVal,
                      type: selectedVal === 'Videolar' ? 'video' : 'image'
                    });
                  }}
                  className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand"
                >
                  <option value="Fotoğraflar">Fotoğraflar</option>
                  <option value="Videolar">Videolar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 font-sans">Açıklama / Başlık</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleEditSave}
                  className="flex-1 py-4 bg-brand text-black font-bold rounded-xl hover:bg-brand/90 transition-colors cursor-pointer"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 sm:p-6 text-white select-none z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand" />
                <span className="font-sans font-bold text-xs tracking-wider uppercase">FOTOĞRAF GÖRÜNTÜLEYİCİ</span>
                <span className="text-neutral-500 font-mono text-xs">({activeLightboxIndex + 1} / {images.length})</span>
              </div>
              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 bg-neutral-900/80 hover:bg-neutral-850 hover:text-brand text-gray-400 rounded-full transition-all cursor-pointer"
                title="Kapat (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="absolute left-4 sm:left-6 md:left-8 z-10 p-3 bg-neutral-900/60 hover:bg-neutral-900 text-white rounded-full transition-all border border-neutral-800 hover:border-brand/40 group cursor-pointer"
                title="Önceki (Sol Yön Tuşu)"
              >
                <ChevronLeft className="w-6 h-6 group-hover:text-brand transition-colors" />
              </button>

              {/* Image Container with scale-up motion animation */}
              <motion.div
                key={activeLightboxIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[70vh] sm:max-h-[75vh] md:max-h-[80vh] flex items-center justify-center"
              >
                <img
                  src={images[activeLightboxIndex]?.url}
                  alt={images[activeLightboxIndex]?.description}
                  className="max-w-full max-h-[70vh] sm:max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 sm:right-6 md:right-8 z-10 p-3 bg-neutral-900/60 hover:bg-neutral-900 text-white rounded-full transition-all border border-neutral-800 hover:border-brand/40 group cursor-pointer"
                title="Sonraki (Sağ Yön Tuşu)"
              >
                <ChevronRight className="w-6 h-6 group-hover:text-brand transition-colors" />
              </button>
            </div>

            {/* Bottom Info Bar */}
            <div 
              className="p-6 text-center select-none z-10 bg-gradient-to-t from-black/80 to-transparent border-t border-neutral-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-sans">
                {images[activeLightboxIndex]?.description || 'İsimsiz İçerik'}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-400 font-mono">
                <span className="text-brand font-sans font-bold">{images[activeLightboxIndex]?.category || 'Fotoğraflar'}</span>
                <span className="text-neutral-700">•</span>
                <span>Yükleyen: {images[activeLightboxIndex]?.uploadedBy || 'Üye'}</span>
                <span className="text-neutral-700">•</span>
                <span>{new Date(images[activeLightboxIndex]?.date).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
