import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, RefreshCw, Radio, Shield, HelpCircle, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  { text: "Telsiz nasıl kullanılır? 📻", id: "telsiz" },
  { text: "Nasıl üye olunur? 👤", id: "uye_ol" },
  { text: "Bizi neden seçmelisiniz? 🤝", id: "neden_sec" },
  { text: "Sürüş disiplin kuralları nelerdir? 📜", id: "disiplin" },
  { text: "Fermuar düzeni sürüşü nedir? 🏍️", id: "fermuar" },
  { text: "Aday üyelik ne kadar sürer? ⏳", id: "aday_sure" },
  { text: "Telsiz frekansı nedir? 📡", id: "frekans" }
];

export default function AISupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Selam dostum! 🏍️ Ayyıldız Moto Kulübü Canlı Destek hattına hoş geldin.\n\nKulübümüz, kurallarımız, telsiz kullanımı veya üyelik şartları hakkında aklına takılan her şeyi bana sorabilirsin. Sana yol göstermek için 7/24 buradayım!\n\nYolun açık, rüzgarın bol, tekerin düz bassın! 🦅",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Show a pulsating indicator on the widget button to welcome users initially
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 1) {
        setHasNewMessage(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Map message history to send to Gemini endpoint
      // Limit history to last 6 messages to keep requests fast and lean
      const history = messages
        .slice(-6)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch('/api/gemini/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: history
        })
      });

      if (!res.ok) {
        throw new Error('Support API response error');
      }

      const data = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || "Üzgünüm, şu an bağlantıda bir rüzgar kesintisi oldu. Lütfen tekrar sorabilir misin?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI support error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: "Yol durumunda geçici bir engel var! 🚧 (Yapay zeka asistanı sunucuya erişemedi). Sorunu hemen çözmek için gaz açıyoruz. Lütfen birazdan tekrar dene veya bize diğer kanallardan ulaş!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Selam dostum! 🏍️ Sohbet geçmişini sıfırladık. Kulübümüz, kurallarımız, telsiz kullanımı veya üyelik şartları hakkında yeni sorularını bekliyorum. Tekerin düz bassın! 🦅",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[99]">
        <button
          id="ai-support-fab"
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewMessage(false);
          }}
          className={`relative p-3 md:p-4 rounded-full shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center group ${
            isOpen 
              ? 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800' 
              : 'bg-brand hover:bg-brand-dark text-white hover:scale-110 shadow-brand/20'
          }`}
          title="7/24 AI Kulüp Desteği"
        >
          {isOpen ? (
            <X className="w-5 h-5 md:w-6 md:h-6 animate-fade-in" />
          ) : (
            <>
              <Bot className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
              <Sparkles className="w-3 h-3 text-gold absolute top-2 right-2 animate-pulse" />
            </>
          )}

          {/* New message tooltip or pulse */}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] text-black font-extrabold items-center justify-center">1</span>
            </span>
          )}

          {/* Mini helper tooltip on hover */}
          {!isOpen && (
            <div className="hidden md:block absolute right-16 bg-neutral-950 border border-neutral-800 text-white text-[10px] font-sans font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              7/24 YAPAY ZEKA DESTEĞİ
            </div>
          )}
        </button>
      </div>

      {/* Chat Window Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-support-window"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-[4.5rem] right-4 md:bottom-24 md:right-6 w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[99] animate-fade-in"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-950 via-brand-dark/10 to-neutral-950 border-b border-neutral-900 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center relative">
                  <Bot className="w-5 h-5 text-brand" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950 animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bebas text-lg tracking-wider text-white flex items-center gap-1.5">
                    AYYILDIZ CANLI DESTEK
                    <span className="text-[9px] bg-brand/20 text-brand px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-widest">AI 7/24</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-sans tracking-wide uppercase flex items-center gap-1">
                    <span>Kulüp Yapay Zeka Asistanı</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-900/50 cursor-pointer"
                  title="Sohbeti Sıfırla"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-900/50 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body & Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(ellipse_at_center,rgba(179,0,0,0.02),transparent)]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-brand" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div
                        className={`p-3 rounded-2xl text-xs font-sans leading-relaxed whitespace-pre-line tracking-wide ${
                          msg.role === 'user'
                            ? 'bg-brand text-white rounded-tr-none'
                            : 'bg-neutral-900/80 border border-neutral-850 text-neutral-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-neutral-600 mt-1 px-1 font-sans">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing/Loading State */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 animate-spin">
                      <RefreshCw className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div className="flex flex-col">
                      <div className="p-3 bg-neutral-900/80 border border-neutral-850 text-neutral-400 rounded-2xl rounded-tl-none text-xs font-sans flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span className="text-[10px] ml-1 font-sans font-bold tracking-widest uppercase">Yol bilgisayarı hesaplıyor...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Clicks - Presets */}
            <div className="p-3 border-t border-neutral-900 bg-neutral-950/40">
              <p className="text-[9px] text-neutral-500 font-sans font-extrabold tracking-wider uppercase mb-2 px-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-gold" />
                <span>HIZLI SORULAR</span>
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto custom-scrollbar">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleSend(q.text)}
                    disabled={isLoading}
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-850 hover:border-brand/40 text-neutral-300 hover:text-white rounded-lg text-[10px] font-sans font-medium tracking-wide transition-colors cursor-pointer text-left shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 border-t border-neutral-900 bg-neutral-950 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Mesajınızı yazın..."
                disabled={isLoading}
                className="flex-1 bg-neutral-900 border border-neutral-850 focus:border-brand/50 text-white rounded-xl px-3.5 py-2 text-xs font-sans focus:outline-none transition-all placeholder:text-neutral-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-brand hover:bg-brand-dark text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-neutral-900 disabled:text-neutral-700 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
