/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Calendar, User, MessageSquare, Heart, Share2, CornerDownRight, Send, ArrowLeft, Link2 } from 'lucide-react';
import { BlogPost, BlogComment } from '../types';

interface BlogProps {
  posts: BlogPost[];
  onAddComment: (postId: string, comment: BlogComment) => void;
  onLikePost: (postId: string) => void;
}

export default function Blog({ posts, onAddComment, onLikePost }: BlogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TÜMÜ');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // New comment input fields
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

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

  const handleShareClick = (postId: string) => {
    const postUrl = `${window.location.origin}/#/haberler/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  if (activePost) {
    return (
      <div id="blog-reader-page" className="bg-[#050505] text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Action */}
          <button
            onClick={() => setActivePostId(null)}
            className="flex items-center space-x-2 text-gold hover:text-white transition-colors text-xs font-sans font-bold tracking-wider uppercase mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>TÜM HABERLERE DÖN</span>
          </button>

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
      </div>
    );
  }

  return (
    <div id="blog-list-page" className="bg-[#050505] text-white py-24 px-4 sm:px-6 lg:px-8">
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
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2 py-0.5 bg-brand text-white text-[9px] font-sans font-bold tracking-wider uppercase rounded-sm">
                      {post.category}
                    </span>
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
    </div>
  );
}
