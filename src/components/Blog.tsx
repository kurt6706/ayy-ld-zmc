/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Calendar, User, MessageSquare, Heart, Share2, CornerDownRight, Send, ArrowLeft, Link2, Edit, Trash2, X, Plus, Upload } from 'lucide-react';
import { BlogPost, BlogComment } from '../types';

interface BlogProps {
  posts: BlogPost[];
  onAddComment: (postId: string, comment: BlogComment) => void;
  onLikePost: (postId: string) => void;
  currentUser?: any | null;
  onUpdateBlogPost?: (post: BlogPost) => void;
  onDeleteBlogPost?: (postId: string) => void;
}

const resizeBlogImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Resim yüklenirken hata oluştu.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
};

export default function Blog({ posts, onAddComment, onLikePost, currentUser, onUpdateBlogPost, onDeleteBlogPost }: BlogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TÜMÜ');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // New comment input fields
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Edit blog post states
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'Duyuru' | 'Sürüş Günlüğü' | 'Teknik Bilgi' | 'Sosyal Sorumluluk'>('Duyuru');
  const [editTags, setEditTags] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isCompressingEditImage, setIsCompressingEditImage] = useState(false);

  const startEditing = (post: BlogPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditSummary(post.summary);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditTags(post.tags.join(', '));
    setEditImage(post.image);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !onUpdateBlogPost) return;

    const updatedPost: BlogPost = {
      ...editingPost,
      title: editTitle,
      summary: editSummary,
      content: editContent,
      category: editCategory,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      image: editImage
    };

    onUpdateBlogPost(updatedPost);
    setEditingPost(null);
  };

  const renderEditModal = () => {
    if (!editingPost) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
          <button
            type="button"
            onClick={() => setEditingPost(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <h3 className="font-bebas text-3xl text-white tracking-wider uppercase">HABERİ DÜZENLE</h3>
            <p className="font-sans text-xs text-gray-400">Bu haberin tüm detaylarını gerçek zamanlı olarak güncelleyebilirsiniz.</p>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Başlık</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                >
                  <option value="Duyuru">Duyuru</option>
                  <option value="Sürüş Günlüğü">Sürüş Günlüğü</option>
                  <option value="Teknik Bilgi">Teknik Bilgi</option>
                  <option value="Sosyal Sorumluluk">Sosyal Sorumluluk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kısa Özet</label>
              <input
                type="text"
                required
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Etiketler (Virgülle Ayırın)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
              />
            </div>

            {/* Görsel Düzenleme */}
            <div className="space-y-2">
              <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase">Haber Görselini Değiştir</label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <div className="border-2 border-dashed border-neutral-800 hover:border-brand/40 rounded-xl p-6 transition-all bg-neutral-900 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsCompressingEditImage(true);
                        try {
                          const compressedBase64 = await resizeBlogImage(file);
                          setEditImage(compressedBase64);
                        } catch (err) {
                          console.error(err);
                          alert('Görsel sıkıştırılamadı. Lütfen başka bir resim seçin.');
                        } finally {
                          setIsCompressingEditImage(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-10 h-10 bg-neutral-950 rounded-full flex items-center justify-center mx-auto text-neutral-500 group-hover:text-brand transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        {isCompressingEditImage ? 'Görsel İşleniyor...' : 'Yeni Görsel Seç veya Sürükle'}
                      </div>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest">JPG, PNG - Otomatik Sıkıştırılır</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-4 flex items-center justify-center bg-neutral-900 rounded-xl border border-neutral-850 p-2 overflow-hidden min-h-[120px] relative">
                  {editImage ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={editImage}
                        alt="Haber Görseli Önizleme"
                        className="w-full h-full max-h-[120px] object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setEditImage('')}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-red-600/90 text-white rounded-full p-1.5 transition-colors border border-white/10 z-20 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-[9px] text-neutral-600 font-extrabold uppercase tracking-widest">Görsel Yok</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">İçerik Yazısı</label>
              <textarea
                required
                rows={8}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-900">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-5 py-2.5 bg-neutral-900 text-gray-400 text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:text-white transition-colors cursor-pointer"
              >
                İPTAL
              </button>
              <button
                type="submit"
                disabled={isCompressingEditImage}
                className="px-5 py-2.5 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                KAYDET
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const categories = ['TÜMÜ', 'DUYURU', 'SÜRÜŞ GÜNLÜĞÜ', 'TEKNİK BİLGİ', 'SOSYAL SORUMLULUK'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'TÜMÜ') return matchesSearch;

    // Normalize Turkish characters to prevent locale-specific casing errors
    const normalizeString = (str: string) => {
      return str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'c')
        .toLowerCase();
    };

    return matchesSearch && normalizeString(post.category) === normalizeString(selectedCategory);
  });

  const activePost = posts.find((p) => p.id === activePostId);

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    const newComment: BlogComment = {
      id: `comment-${Date.now()}`,
      author: commentAuthor,
      text: commentText,
      date: new Date().toISOString().split('T')[0]
    };

    onAddComment(postId, newComment);
    setCommentAuthor('');
    setCommentText('');
  };

  const handleShareClick = async (postId: string) => {
    const postUrl = `${window.location.origin}?page=news&post=${postId}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        // Fallback for iframe environments
        const textArea = document.createElement("textarea");
        textArea.value = postUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error("Fallback copy failed", error);
        }
        textArea.remove();
      }
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optional: fallback to alert if everything fails
      alert(`Bağlantı: ${postUrl}`);
    }
  };

  if (activePost) {
    return (
      <div id="blog-reader-page" className="bg-transparent text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              onClick={() => setActivePostId(null)}
              className="flex items-center space-x-2 text-gold hover:text-white transition-colors text-xs font-sans font-bold tracking-wider uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>TÜM HABERLERE DÖN</span>
            </button>

            {currentUser?.role === 'admin' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => startEditing(activePost)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-gold hover:text-black text-gold text-xs font-sans font-bold uppercase rounded-sm border border-neutral-800 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>DÜZENLE</span>
                </button>
                {onDeleteBlogPost && (
                  <button
                    onClick={() => {
                      onDeleteBlogPost(activePost.id);
                      setActivePostId(null);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-red-600 hover:text-white text-red-500 text-xs font-sans font-bold uppercase rounded-sm border border-neutral-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>SİL</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-8">
            <span className="px-2.5 py-1 bg-brand text-white text-[10px] font-sans font-bold tracking-wider uppercase rounded-sm">
              {activePost.category}
            </span>
            <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wide leading-tight">
              {activePost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-sans border-b border-neutral-900 pb-4">
              <div className="flex items-center">
                <User className="w-4 h-4 text-brand mr-1.5" />
                <span>{activePost.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gold mr-1.5" />
                <span>{activePost.date}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 text-brand mr-1.5" />
                <span>{activePost.comments.length} Yorum</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 text-gold mr-1.5" />
                <span>{activePost.likes} Beğeni</span>
              </div>
            </div>
          </div>

          {/* Article Banner */}
          <div className="rounded-sm overflow-hidden border border-neutral-900 h-80 sm:h-[400px] mb-8">
            <img
              src={activePost.image}
              alt={activePost.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="font-sans text-gray-200 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {activePost.content}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-neutral-900 pb-8">
            {activePost.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-[#1A1A1A] border border-neutral-800 text-[10px] font-sans text-gray-400 rounded-sm">
                #{tag}
              </span>
            ))}
          </div>

          {/* Share & Like Footer Actions */}
          <div className="flex justify-between items-center bg-[#1A1A1A]/50 border border-neutral-900 p-5 rounded-sm mb-12">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLikePost(activePost.id)}
                className="flex items-center space-x-2 text-gray-300 hover:text-brand transition-colors text-xs font-sans font-bold"
              >
                <Heart className="w-5 h-5 fill-brand/10 text-brand" />
                <span>BEĞEN ({activePost.likes})</span>
              </button>

              <button
                onClick={() => handleShareClick(activePost.id)}
                className="flex items-center space-x-2 text-gray-300 hover:text-gold transition-colors text-xs font-sans font-bold"
              >
                <Share2 className="w-5 h-5 text-gold" />
                <span>PAYLAŞ</span>
              </button>
            </div>

            {copiedPostId === activePost.id && (
              <span className="font-sans text-[11px] text-gold font-bold tracking-wider uppercase animate-pulse">
                BAĞLANTI KOPYALANDI!
              </span>
            )}
          </div>

          {/* Comments Feed Section */}
          <div className="space-y-8">
            <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center border-b border-neutral-900 pb-3">
              <MessageSquare className="w-5 h-5 text-brand mr-2" />
              YORUMLAR ({activePost.comments.length})
            </h3>

            {/* Comment List */}
            {activePost.comments.length === 0 ? (
              <p className="font-sans text-xs text-gray-500 italic">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            ) : (
              <div className="space-y-4">
                {activePost.comments.map((comm) => (
                  <div key={comm.id} className="bg-[#1a1a1a]/40 p-5 rounded-sm border border-neutral-900 flex items-start space-x-4">
                    <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center font-bebas text-brand font-bold shrink-0">
                      {comm.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs font-bold text-white">{comm.author}</span>
                        <span className="font-mono text-[10px] text-gray-500">{comm.date}</span>
                      </div>
                      <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment form */}
            <form onSubmit={(e) => handleCommentSubmit(e, activePost.id)} className="bg-[#1A1A1A]/80 p-6 rounded-sm border border-neutral-900 space-y-4">
              <span className="font-bebas text-sm text-gold tracking-wider uppercase block">BİR YORUM BIRAKIN</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız..."
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="Yorumunuzu buraya yazınız..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>GÖNDER</span>
              </button>
            </form>
          </div>

        </div>
        {renderEditModal()}
      </div>
    );
  }

  return (
    <div id="blog-list-page" className="bg-transparent text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            GÜNCEL AKIŞ
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            HABERLER VE DUYURULAR
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 tracking-wider max-w-2xl mx-auto">
            Kulübümüzden son haberler, sürüş günlükleri, duyurular ve güvenli sürüş tekniklerine dair teknik dökümanlar.
          </p>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-[#1A1A1A]/40 p-4 rounded-sm border border-neutral-900">
          
          {/* Categories Tab Scroll */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-[10px] sm:text-xs font-sans font-bold tracking-wider uppercase rounded-sm transition-all border ${
                  selectedCategory === cat
                    ? 'bg-brand border-brand text-white'
                    : 'bg-black border-neutral-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Yazı, etiket veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-[#1A1A1A]/20 border border-dashed border-neutral-800 rounded-sm">
            <p className="font-sans text-sm text-gray-400">Aradığınız kriterlere uygun blog yazısı bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                id={`blog-card-${post.id}`}
                className="bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm overflow-hidden flex flex-col justify-between hover:border-brand/30 transition-all duration-300 group hover:-translate-y-1.5"
              >
                {/* Post Cover image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category label */}
                  <div className="absolute top-4 left-4 z-10 flex items-center justify-between w-[calc(100%-2rem)]">
                    <span className="px-2 py-0.5 bg-brand text-white text-[9px] font-sans font-bold tracking-wider uppercase rounded-sm">
                      {post.category}
                    </span>
                    {currentUser?.role === 'admin' && (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startEditing(post)}
                          className="p-1.5 bg-black/80 hover:bg-gold hover:text-black text-gold rounded-full transition-colors border border-neutral-800 cursor-pointer"
                          title="Duyuruyu Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteBlogPost && (
                          <button
                            onClick={() => onDeleteBlogPost(post.id)}
                            className="p-1.5 bg-black/80 hover:bg-red-600 hover:text-white text-red-500 rounded-full transition-colors border border-neutral-800 cursor-pointer"
                            title="Duyuruyu Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Body info */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Date and Author */}
                    <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-sans mb-3">
                      <span className="font-mono">{post.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-gold">{post.author}</span>
                    </div>

                    <h3 className="font-bebas text-2xl text-white tracking-wide mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                      {post.title}
                    </h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">
                      {post.summary}
                    </p>
                  </div>

                  {/* Share, Comments and Likes counts */}
                  <div className="flex items-center justify-between border-t border-neutral-900 pt-5 text-gray-500 text-[11px] font-sans">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        {post.comments.length}
                      </span>
                      <span className="flex items-center text-brand">
                        <Heart className="w-3.5 h-3.5 mr-1 fill-brand/10" />
                        {post.likes}
                      </span>
                    </div>

                    {/* Action button to open full view */}
                    <button
                      onClick={() => setActivePostId(post.id)}
                      className="text-gold font-bold hover:text-white transition-colors uppercase tracking-wider"
                    >
                      OKU →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
      {renderEditModal()}
    </div>
  );
}
