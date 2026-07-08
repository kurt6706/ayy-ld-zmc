import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Check, 
  CheckCheck, 
  Users, 
  Shield, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';
import { 
  subscribeDirectMessages, 
  addDirectMessageDoc, 
  markDirectMessagesAsRead 
} from '../lib/firebaseService';

interface MessagesPanelProps {
  currentUser: any;
  users: any[];
}

export default function MessagesPanel({ currentUser, users }: MessagesPanelProps) {
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to direct messages
  useEffect(() => {
    const unsub = subscribeDirectMessages((msgs) => {
      setDirectMessages(msgs);
    });
    return () => unsub();
  }, []);

  // Sync / Auto-select redirect from Admin Panel or elsewhere
  useEffect(() => {
    const redirectUserId = localStorage.getItem('openChatWithUser');
    if (redirectUserId) {
      setActiveChatUserId(redirectUserId);
      setShowMobileList(false);
      localStorage.removeItem('openChatWithUser');
    }
  }, [users]);

  // Mark active chat messages as read
  useEffect(() => {
    if (currentUser && activeChatUserId) {
      markDirectMessagesAsRead(activeChatUserId, currentUser.id);
    }
  }, [activeChatUserId, directMessages, currentUser]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatUserId, directMessages]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-neutral-900/40 border border-neutral-800 rounded-lg shadow-2xl backdrop-blur-md">
        <MessageSquare className="w-16 h-16 text-brand mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-bebas tracking-widest text-white uppercase mb-2">Giriş Yapmalısınız</h2>
        <p className="text-gray-400 text-sm mb-6">
          Mesaj kutunuza ve üyeler arası özel mesajlaşma sistemine erişmek için lütfen önce giriş yapın.
        </p>
      </div>
    );
  }

  // Filter other users
  const otherUsers = users.filter((u) => u.id !== currentUser.id && u.status === 'approved');

  // Search users filter
  const filteredUsers = otherUsers.filter((u) => {
    const fullname = `${u.name || ''} ${u.surname || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullname.includes(search) || username.includes(search);
  });

  const activeChatUser = users.find((u) => u.id === activeChatUserId);

  // Filter messages for active chat
  const activeChatMessages = directMessages.filter((msg) => {
    return (
      (msg.senderId === currentUser.id && msg.receiverId === activeChatUserId) ||
      (msg.senderId === activeChatUserId && msg.receiverId === currentUser.id)
    );
  });

  // Calculate unread counts grouped by senderId
  const getUnreadCount = (senderId: string) => {
    return directMessages.filter(
      (m) => m.senderId === senderId && m.receiverId === currentUser.id && !m.read
    ).length;
  };

  // Format message time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUserId) return;

    const msgId = `dm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newMsg = {
      id: msgId,
      senderId: currentUser.id,
      senderName: `${currentUser.name || ''} ${currentUser.surname || ''}`.trim() || currentUser.username,
      receiverId: activeChatUserId,
      text: inputText.trim(),
      timestamp: Date.now(),
      read: false,
    };

    try {
      await addDirectMessageDoc(newMsg);
      setInputText('');
    } catch (err) {
      console.error('Error sending DM:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#111111]/90 border border-neutral-900 rounded-sm shadow-2xl h-[650px] flex overflow-hidden backdrop-blur-md">
        
        {/* Left Side: Users list */}
        <div className={`w-full md:w-80 border-r border-neutral-900 flex flex-col shrink-0 ${
          showMobileList ? 'block' : 'hidden md:flex'
        }`}>
          {/* List Header / Search */}
          <div className="p-4 border-b border-neutral-900 bg-black/40">
            <h3 className="font-bebas text-xl text-white tracking-widest uppercase mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand" /> SÜRÜCÜLER VE KULÜP
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Üye veya yönetici ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-2 pl-9 pr-4 text-xs font-sans text-white placeholder-neutral-500 focus:outline-none focus:border-brand transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* List Users Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/40 bg-black/10">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-xs text-neutral-500 font-sans">Eşleşen aktif üye bulunamadı.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const unread = getUnreadCount(user.id);
                const isActive = activeChatUserId === user.id;
                const initials = `${user.name?.charAt(0) || ''}${user.surname?.charAt(0) || ''}`.toUpperCase() || 'U';

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setActiveChatUserId(user.id);
                      setShowMobileList(false);
                    }}
                    className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                      isActive 
                        ? 'bg-neutral-900/60 border-l-2 border-brand' 
                        : 'hover:bg-neutral-900/30 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-brand font-bold text-xs font-mono">
                            {initials}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                      </div>

                      {/* Info */}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white font-sans truncate">{user.name} {user.surname}</p>
                          {user.role === 'admin' && (
                            <span className="bg-gold/10 text-gold border border-gold/20 text-[8px] font-bold px-1 rounded-sm shrink-0 flex items-center gap-0.5">
                              <Shield className="w-2 h-2" /> YNT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 truncate mt-0.5">{user.statusText || 'Yollarda...'}</p>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {unread > 0 && (
                      <span className="bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message pane */}
        <div className={`flex-1 flex flex-col bg-black/25 ${
          !showMobileList ? 'flex' : 'hidden md:flex'
        }`}>
          {activeChatUser ? (
            <>
              {/* Chat Pane Header */}
              <div className="p-4 border-b border-neutral-900 flex items-center justify-between bg-[#111]">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden text-gray-400 hover:text-white mr-1 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">{activeChatUser.name} {activeChatUser.surname}</h4>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold font-sans flex items-center gap-1">
                      {activeChatUser.role === 'admin' ? 'Yönetici' : 'Üye'} 
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> Çevrimiçi
                    </span>
                  </div>
                </div>

                <div className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AYMC GÜVENLİ MESAILAŞMA
                </div>
              </div>

              {/* Message List area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#090909]">
                {activeChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <MessageSquare className="w-12 h-12 text-neutral-800 mb-3" />
                    <p className="text-xs text-neutral-500">Henüz sohbet geçmişi yok. İlk özel mesajı gönderin!</p>
                  </div>
                ) : (
                  activeChatMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 text-xs font-sans whitespace-pre-wrap break-words shadow-md ${
                            isMe 
                              ? 'bg-brand text-white rounded-br-none rounded-sm' 
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none rounded-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[8px] text-neutral-500 font-mono">
                            <span>{formatTime(msg.timestamp)}</span>
                            {isMe && (
                              <span>
                                {msg.read ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-500 inline ml-0.5" />
                                ) : (
                                  <Check className="w-3 h-3 text-neutral-600 inline ml-0.5" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-black/65 border-t border-neutral-900 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Bir şeyler yazın..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-850 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand transition-colors font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-brand hover:bg-brand-dark disabled:opacity-40 text-white font-bold rounded-sm text-xs px-5 py-2.5 transition-all shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Gönder
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-16 h-16 text-neutral-800 mb-4 animate-bounce" />
              <h4 className="text-lg font-bebas text-white uppercase tracking-widest mb-1">MESAILAŞMA MERKEZİ</h4>
              <p className="text-neutral-500 text-xs font-sans max-w-sm">
                Kulüp üyeleri ve yöneticileriyle anlık ve güvenli özel mesajlaşmaya başlamak için soldaki listeden birini seçin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
