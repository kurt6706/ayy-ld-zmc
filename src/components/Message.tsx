import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Check, X, ShieldAlert, Play, Pause, Mic, Video, Image, Eye } from 'lucide-react';
import { ChatMessage } from '../types';
import { formatMessageTime, getDeterministicAvatar } from '../utils';
import { editMessageDoc, deleteMessageDoc } from '../firestore';

function CustomAudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-850 rounded-xl p-3 min-w-[220px] max-w-full">
      <button 
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-brand hover:bg-brand-dark flex items-center justify-center text-white transition-all shadow-md active:scale-95 shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden relative">
          <div 
            className="bg-brand h-full rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[9px] text-neutral-400 font-mono">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span className="flex items-center gap-1">
            <Mic className="w-2.5 h-2.5 text-neutral-500" /> Sesli Mesaj • {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomVideoPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-850 max-w-[240px] shadow-lg group/video cursor-pointer" onClick={togglePlay}>
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-auto object-cover max-h-[180px] rounded-xl"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100'}`}>
        <div className="w-12 h-12 rounded-full bg-brand/90 hover:bg-brand flex items-center justify-center text-white shadow-xl transition-transform active:scale-90">
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded font-mono pointer-events-none">
        <span className="flex items-center gap-1">
          <Video className="w-2.5 h-2.5 text-brand" /> Video Mesaj
        </span>
      </div>
    </div>
  );
}

function CustomImageMessage({ src }: { src: string }) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowLightbox(true)}
        className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-850 max-w-[240px] shadow-lg cursor-pointer group/image transition-all hover:scale-[1.01] active:scale-95"
      >
        <img 
          src={src} 
          alt="Paylaşılan Görsel" 
          className="w-full h-auto object-cover max-h-[180px] rounded-xl"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
          <div className="bg-brand/90 p-2 rounded-full text-white shadow-lg">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>

      {showLightbox && (
        <div 
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4"
        >
          <button 
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={src} 
            alt="Paylaşılan Görsel" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
}

interface MessageProps {
  key?: any;
  message: ChatMessage;
  currentUserUid: string;
  onActionError: (errStr: string) => void;
}

export default function Message({ message, currentUserUid, onActionError }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMe = message.senderUid === currentUserUid;

  // Handle saving the edited message
  const handleEditSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editText.trim() || editText.trim() === message.text) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await editMessageDoc(message.id, editText.trim());
      setIsEditing(false);
    } catch (err: any) {
      onActionError(err.message || 'Mesaj güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle soft deleting the message
  const handleDelete = async () => {
    if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      try {
        await deleteMessageDoc(message.id);
      } catch (err: any) {
        onActionError(err.message || 'Mesaj silinirken bir hata oluştu.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.text);
    }
  };

  // Select fallback avatar
  const avatarUrl = message.photoURL || getDeterministicAvatar(message.senderName);

  return (
    <div className={`flex items-start gap-3 w-full group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Sender Avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
        <img 
          src={avatarUrl} 
          alt={message.senderName} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Message Content Bubble */}
      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name & Meta */}
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-[11px] font-bold text-neutral-300 font-sans">
            {message.senderName}
          </span>
          {isMe && (
            <span className="text-[8px] font-sans text-brand/80 font-bold bg-brand/5 border border-brand/20 px-1 py-0.5 rounded-sm">
              Siz
            </span>
          )}
        </div>

        {/* Bubble */}
        <div className={`relative rounded-2xl text-xs font-sans shadow-md break-words whitespace-pre-wrap ${
          message.deleted
            ? 'px-4 py-3 bg-neutral-900/40 border border-neutral-900 text-neutral-600 italic rounded-tl-sm'
            : (!message.mediaType || message.mediaType === 'text')
              ? (isMe ? 'px-4 py-3 bg-brand text-white rounded-tr-sm' : 'px-4 py-3 bg-neutral-900 border border-neutral-850 text-neutral-200 rounded-tl-sm')
              : 'p-0 bg-transparent rounded-lg shadow-none'
        }`}>
          
          {isEditing ? (
            <form onSubmit={handleEditSave} className="flex flex-col gap-2 min-w-[200px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                maxLength={5000}
                className="w-full bg-black/40 border border-white/20 rounded-md p-2 text-white text-xs font-sans resize-none focus:outline-none focus:border-white transition-colors"
                rows={2}
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text);
                  }}
                  className="p-1 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded"
                  title="İptal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editText.trim()}
                  className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors hover:bg-emerald-500/10 rounded"
                  title="Kaydet"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : message.deleted ? (
            <div>
              <span>{message.text}</span>
            </div>
          ) : message.mediaType === 'audio' && message.audioUrl ? (
            <CustomAudioPlayer src={message.audioUrl} />
          ) : message.mediaType === 'video' && message.videoUrl ? (
            <CustomVideoPlayer src={message.videoUrl} />
          ) : message.mediaType === 'image' && message.imageUrl ? (
            <CustomImageMessage src={message.imageUrl} />
          ) : (
            <div>
              <span>{message.text}</span>
            </div>
          )}

          {/* Quick Action Overlay for current user's messages */}
          {isMe && !message.deleted && !isEditing && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-[#111] border border-neutral-800 rounded-md p-1 shadow-xl z-10 shrink-0">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditText(message.text);
                }}
                className="p-1 text-neutral-400 hover:text-white transition-colors rounded hover:bg-neutral-900"
                title="Düzenle"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-neutral-400 hover:text-red-500 transition-colors rounded hover:bg-neutral-900"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Message Timestamp & Indicators */}
        <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-neutral-500 font-mono">
          <span>
            {message.createdAt ? formatMessageTime(message.createdAt) : 'Gönderiliyor...'}
          </span>
          {message.edited && !message.deleted && (
            <span className="text-[8px] text-neutral-500 italic bg-neutral-900 px-1 py-0.5 rounded-sm">
              Düzenlendi
            </span>
          )}
          {message.deleted && (
            <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" /> Silindi
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
