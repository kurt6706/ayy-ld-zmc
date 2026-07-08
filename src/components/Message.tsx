import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';
import { formatMessageTime, getDeterministicAvatar } from '../utils';
import { editMessageDoc, deleteMessageDoc } from '../firestore';

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
        <div className={`relative px-4 py-3 rounded-2xl text-xs font-sans shadow-md break-words whitespace-pre-wrap ${
          message.deleted
            ? 'bg-neutral-900/40 border border-neutral-900 text-neutral-600 italic rounded-tl-sm'
            : isMe
              ? 'bg-brand text-white rounded-tr-sm'
              : 'bg-neutral-900 border border-neutral-850 text-neutral-200 rounded-tl-sm'
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
