import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  LogOut, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Bell, 
  BellOff, 
  Edit3, 
  Smile,
  Check,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { ChatMessage, ChatUser, TypingState, Theme } from '../types';
import { 
  subscribeMessages, 
  sendMessageDoc, 
  subscribeActiveUsers, 
  subscribeTypingStates, 
  updateUserPresence 
} from '../firestore';
import { logoutUser } from '../auth';
import { formatMessageTime, getDeterministicAvatar } from '../utils';
import Message from './Message';
import MessageInput from './MessageInput';

interface ChatProps {
  currentUser: any;
  onLogoutSuccess: () => void;
  onClose?: () => void;
  onOpenVoice?: () => void;
}

export default function Chat({ currentUser, onLogoutSuccess, onClose, onOpenVoice }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingState[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Theme & Notifications state
  const [theme, setTheme] = useState<Theme>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusText, setNewStatusText] = useState(currentUser?.statusText || 'Yollarda...');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a retro synthesizer ping sound on new message
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5 note
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio notification failed:", e);
    }
  };

  // Monitor navigator online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError('');
      setSuccess('Yeniden çevrimiçi oldunuz! Bağlantı kuruldu.');
      setTimeout(() => setSuccess(''), 3000);
      triggerPresenceUpdate(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setError('Bağlantı kesildi. Çevrimdışı moda geçildi, mesajlar otomatik senkronize edilecek.');
      triggerPresenceUpdate(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Handle updates of user presence when tabs close
  const triggerPresenceUpdate = (status: boolean, textStatus?: string) => {
    if (currentUser) {
      updateUserPresence(
        currentUser.uid,
        currentUser.displayName || 'Anonim',
        currentUser.email || null,
        currentUser.photoURL || null,
        currentUser.isAnonymous,
        status,
        textStatus || newStatusText
      );
    }
  };

  // Setup heartbeat for user online presence
  useEffect(() => {
    triggerPresenceUpdate(true);
    
    // Heartbeat every 45 seconds to keep presence fresh
    const heartbeat = setInterval(() => {
      triggerPresenceUpdate(true);
    }, 45000);

    // Mark offline on cleanup/unmount
    return () => {
      clearInterval(heartbeat);
      triggerPresenceUpdate(false);
    };
  }, [currentUser, newStatusText]);

  // Subscribe to Firestore collections in real-time
  useEffect(() => {
    if (!currentUser) return;

    // Messages subscription
    const unsubscribeMsgs = subscribeMessages(
      (loadedMsgs) => {
        // Play notification sound on incoming messages from others
        if (loadedMsgs.length > 0 && messages.length > 0) {
          const lastLoaded = loadedMsgs[loadedMsgs.length - 1];
          const lastCurrent = messages[messages.length - 1];
          if (lastLoaded.id !== lastCurrent.id && lastLoaded.senderUid !== currentUser.uid) {
            playNotificationSound();
          }
        }
        setMessages(loadedMsgs);
      },
      (errStr) => {
        setError(errStr);
      }
    );

    // Active Users subscription
    const unsubscribeUsers = subscribeActiveUsers((loadedUsers) => {
      setActiveUsers(loadedUsers);
    });

    // Typing States subscription
    const unsubscribeTyping = subscribeTypingStates((loadedTyping) => {
      // Exclude current user from typing indicators
      const othersTyping = loadedTyping.filter(t => t.uid !== currentUser.uid);
      setTypingUsers(othersTyping);
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeUsers();
      unsubscribeTyping();
    };
  }, [currentUser, messages.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle sending message doc
  const handleSendMessage = async (text: string, mediaType?: 'text' | 'audio' | 'video' | 'image', mediaUrl?: string) => {
    try {
      setError('');
      await sendMessageDoc(
        text,
        currentUser.displayName || 'Anonim',
        currentUser.uid,
        currentUser.photoURL || undefined,
        mediaType,
        mediaType === 'audio' ? mediaUrl : undefined,
        mediaType === 'video' ? mediaUrl : undefined,
        mediaType === 'image' ? mediaUrl : undefined
      );
    } catch (err: any) {
      setError(err.message || 'Mesaj gönderilemedi.');
      throw err;
    }
  };

  // Sign out current user
  const handleSignOut = async () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      try {
        await triggerPresenceUpdate(false);
        await logoutUser();
        onLogoutSuccess();
      } catch (err: any) {
        setError(err.message || 'Çıkış başarısız oldu.');
      }
    }
  };

  // Update Status Text handler
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      triggerPresenceUpdate(true, newStatusText.trim());
      setSuccess('Durum mesajınız güncellendi!');
      setShowStatusModal(false);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err: any) {
      setError(err.message || 'Durum güncellenemedi.');
    }
  };

  const handleActionError = (errStr: string) => {
    setError(errStr);
    setTimeout(() => setError(''), 5000);
  };

  const onlineMembers = activeUsers.filter(u => u.isOnline);
  const offlineMembers = activeUsers.filter(u => !u.isOnline);

  return (
    <div className={`flex h-full w-full transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-neutral-50 text-neutral-800'
    }`}>
      
      {/* 1. SIDEBAR (Collapsible Drawer) */}
      <div className={`absolute inset-y-0 left-0 z-40 w-64 shrink-0 border-r transition-transform duration-300 ${
        theme === 'dark' 
          ? 'bg-[#090909] border-neutral-900' 
          : 'bg-white border-neutral-200'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Sidebar Header */}
          <div className="p-5 border-b border-neutral-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand/10 p-2 rounded-full border border-brand/20">
                <Sparkles className="w-4 h-4 text-brand animate-pulse" />
              </div>
              <div>
                <h1 className="font-bebas text-xl tracking-wider text-brand">SOHBET ODASI</h1>
                <p className="text-[9px] font-sans text-neutral-500 uppercase tracking-widest">
                  Ayyıldız Grup Sohbeti
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-neutral-800/25 rounded transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Active / Online Users List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            
            {/* Online Users */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
                Çevrimiçi ({onlineMembers.length})
              </h3>
              
              <div className="space-y-2">
                {onlineMembers.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic font-sans pl-1">Sadece siz varsınız.</p>
                ) : (
                  onlineMembers.map((u) => {
                    const fallback = getDeterministicAvatar(u.displayName);
                    return (
                      <div 
                        key={u.uid} 
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-900/30 transition-all group"
                      >
                        <div className="relative">
                          <img 
                            src={u.photoURL || fallback} 
                            alt={u.displayName} 
                            className="w-8 h-8 rounded-full border border-neutral-800 object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090909]"></span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-200 truncate group-hover:text-white transition-colors">{u.displayName}</p>
                          {u.statusText && <p className="text-[10px] text-neutral-500 truncate">{u.statusText}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Offline Users */}
            {offlineMembers.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-600 block"></span>
                  Son Çevrimdışı ({offlineMembers.length})
                </h3>
                
                <div className="space-y-2">
                  {offlineMembers.map((u) => {
                    const fallback = getDeterministicAvatar(u.displayName);
                    return (
                      <div 
                        key={u.uid} 
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-900/10 transition-all opacity-60"
                      >
                        <img 
                          src={u.photoURL || fallback} 
                          alt={u.displayName} 
                          className="w-8 h-8 rounded-full border border-neutral-850 object-cover filter grayscale" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-400 truncate">{u.displayName}</p>
                          <p className="text-[9px] text-neutral-600 font-mono">
                            {u.lastSeen ? `${formatMessageTime(u.lastSeen)}` : 'Çevrimdışı'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Current User Profile Card */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-neutral-900 bg-black/45' : 'border-neutral-200 bg-neutral-100'
          }`}>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={currentUser.photoURL || getDeterministicAvatar(currentUser.displayName || 'Kullanıcı')} 
                  alt={currentUser.displayName} 
                  className="w-9 h-9 rounded-full border border-neutral-800 object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-brand truncate">
                    {currentUser.displayName || 'Kullanıcı'}
                  </h4>
                  <p className="text-[9px] text-neutral-400 font-medium truncate italic max-w-[130px]">
                    "{newStatusText}"
                  </p>
                </div>
              </div>
              
              {/* Trigger Status modal */}
              <button
                onClick={() => setShowStatusModal(true)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-850/50 rounded transition-colors"
                title="Durumunu Güncelle"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-sans text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-sm border border-neutral-850 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              SOHBETİ KAPAT
            </button>
          </div>

        </div>
      </div>

      {/* OVERLAY FOR SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
        ></div>
      )}

      {/* 2. CHAT STREAM / MAIN PANEL */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Main Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          theme === 'dark' ? 'border-neutral-900 bg-[#070707]' : 'border-neutral-200 bg-white shadow-sm'
        }`}>
          
          <div className="flex items-center gap-3">
            {/* Menu trigger */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-sm"
              title="Kullanıcıları Göster"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-sans font-extrabold uppercase tracking-widest text-brand">GENEL GRUP SOHBETİ</h2>
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm">
                    <Wifi className="w-2.5 h-2.5" /> AKTİF
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm animate-pulse">
                    <WifiOff className="w-2.5 h-2.5" /> ÇEVRİMDIŞI
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                {onlineMembers.length + 1} Sürücü Çevrimiçi
              </p>
            </div>
          </div>

          {/* Quick Actions (Sound toggler, Theme toggler, Close) */}
          <div className="flex items-center gap-2">
            
            {/* Audio notification toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-sm border transition-all hidden sm:block ${
                soundEnabled 
                  ? 'bg-neutral-950 border-neutral-850 text-brand' 
                  : 'bg-neutral-950 border-neutral-850 text-neutral-600'
              }`}
              title={soundEnabled ? "Bildirim Sesini Kapat" : "Bildirim Sesini Aç"}
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-neutral-950 border border-neutral-850 text-neutral-300 hover:text-white rounded-sm transition-all hidden sm:block"
              title={theme === 'dark' ? "Açık Tema" : "Karanlık Tema"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Close Chat widget */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-brand/10 border border-brand/20 text-brand hover:bg-brand hover:text-white rounded-sm transition-all"
                title="Sohbeti Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

        {/* Dynamic Warning and Success Banners */}
        {error && (
          <div className="bg-red-950/20 border-b border-red-900/30 p-2.5 px-4 flex items-center justify-between text-xs text-red-400 shrink-0 animate-fade-in z-10">
            <span className="font-sans font-medium">{error}</span>
            <button onClick={() => setError('')} className="p-0.5 hover:bg-red-500/10 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/20 border-b border-emerald-900/30 p-2.5 px-4 flex items-center justify-between text-xs text-emerald-400 shrink-0 animate-fade-in z-10">
            <span className="font-sans font-medium">{success}</span>
            <button onClick={() => setSuccess('')} className="p-0.5 hover:bg-emerald-500/10 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. MESSAGES FLOW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/10">
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <div className="p-4 bg-brand/5 border border-brand/10 rounded-full mb-3 text-brand/60">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-sm font-sans font-medium">Sohbet odasına hoş geldiniz!</p>
              <p className="text-xs font-sans text-neutral-600 mt-1 max-w-xs">
                Yol hikayelerini paylaşmak veya diğer sürücülerle sohbet etmek için ilk mesajı siz gönderin!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <Message 
                  key={msg.id} 
                  message={msg} 
                  currentUserUid={currentUser.uid}
                  onActionError={handleActionError}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. LIVE TYPING FEEDBACK BAR */}
        <div className={`px-5 py-1.5 text-[10px] font-sans font-medium h-7 flex items-center gap-1.5 transition-opacity duration-300 ${
          typingUsers.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex space-x-1.5">
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span className="text-neutral-500">
            {typingUsers.map(u => u.name).join(', ')} yazıyor...
          </span>
        </div>

        {/* 5. TEXT INPUT CONTAINER */}
        <MessageInput 
          currentUser={currentUser} 
          onSendMessage={handleSendMessage} 
          onOpenVoice={onOpenVoice}
        />

      </div>

      {/* 6. STATUS UPDATE MODAL (Popup dialog) */}
      {showStatusModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-50 animate-fade-in p-4">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-neutral-900 rounded-lg p-5 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bebas text-lg tracking-wider text-white">DURUMUNU GÜNCELLE</h3>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="p-1 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-sans">
                  Şu an ne yapıyorsun?
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="Örn: Sürüyor, Kampta, Çay İçiyor..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-3 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 hover:border-neutral-750 text-neutral-400 hover:text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-all rounded-sm"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-all rounded-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  KAYDET
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
