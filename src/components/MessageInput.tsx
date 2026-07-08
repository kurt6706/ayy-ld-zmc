import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { setTypingStatus } from '../firestore';

interface MessageInputProps {
  currentUser: any;
  onSendMessage: (text: string) => Promise<void>;
}

// Popular and classic quick emojis for chat
const POPULAR_EMOJIS = ['👍', '❤️', '😂', '🔥', '🏍️', '🏁', '🙏', '😮', '😢', '🌟', '👏', '🎉'];

export default function MessageInput({ currentUser, onSendMessage }: MessageInputProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-grow textarea height
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputText]);

  // Set typing status logic
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (currentUser) {
      // Trigger typing status on Firestore
      const name = currentUser.displayName || 'Anonim';
      const uid = currentUser.uid || currentUser.id || '';
      
      setTypingStatus(uid, name, true);

      // Debounce to clear typing indicator after 2.5 seconds of silence
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(uid, name, false);
      }, 2500);
    }
  };

  // Submit handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageToSend = inputText.trim();
    
    try {
      setIsSending(true);
      
      // Reset typing status immediately
      if (currentUser) {
        const uid = currentUser.uid || currentUser.id || '';
        const name = currentUser.displayName || 'Anonim';
        setTypingStatus(uid, name, false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      await onSendMessage(messageToSend);
      setInputText('');
      setShowEmojis(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Input send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter to Send (Shift+Enter to write new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Append emoji to text input
  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Clean up typing status if component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (currentUser) {
        const uid = currentUser.uid || currentUser.id || '';
        const name = currentUser.displayName || 'Anonim';
        setTypingStatus(uid, name, false);
      }
    };
  }, [currentUser]);

  return (
    <div className="relative border-t border-neutral-900 bg-[#0a0a0a] p-4 shrink-0">
      
      {/* Quick Emojis Shelf */}
      {showEmojis && (
        <div className="absolute bottom-[72px] left-4 right-4 bg-[#111111] border border-neutral-850 rounded-lg p-3 shadow-2xl z-20 flex flex-wrap gap-2 animate-fade-in">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg p-1.5 hover:bg-neutral-800 rounded-sm active:scale-90 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        
        {/* Toggle Emojis Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`flex items-center justify-center w-11 h-11 rounded-sm border transition-all ${
            showEmojis 
              ? 'bg-brand/10 border-brand text-brand' 
              : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-750'
          }`}
          title="Emoji Ekle"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            maxLength={5000}
            placeholder="Bir şeyler yazın (Shift+Enter yeni satır)..."
            className="w-full bg-neutral-950 border border-neutral-850 rounded-sm py-3 px-4 pr-12 text-xs font-sans text-white placeholder-neutral-600 focus:outline-none focus:border-brand transition-all resize-none custom-scrollbar min-h-[44px] max-h-[120px]"
          />
          
          {/* Characters limit counter if typing significantly */}
          {inputText.length > 1000 && (
            <span className="absolute right-3 bottom-3 text-[9px] font-mono text-neutral-600">
              {inputText.length}/5000
            </span>
          )}
        </div>

        {/* Send message trigger */}
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-brand hover:bg-brand-dark disabled:opacity-45 text-white w-11 h-11 rounded-sm flex items-center justify-center transition-all shrink-0 shadow-[0_4px_15px_rgba(179,0,0,0.2)]"
          title="Mesajı Gönder"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4.5 h-4.5 -ml-0.5" />
          )}
        </button>

      </form>
    </div>
  );
}
