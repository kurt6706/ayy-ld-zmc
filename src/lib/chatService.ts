import { sendMessageDoc, editMessageDoc, deleteMessageDoc, subscribeMessages } from '../firestore';

export interface ChatMessage {
  id?: string;
  userId: string;
  displayName: string;
  photoURL: string;
  email: string;
  message: string;
  createdAt: any;
  edited: boolean;
  deleted: boolean;
}

export const sendMessage = async (messageText: string, senderOverride?: any) => {
  if (!messageText.trim()) return;
  if (messageText.length > 5000) throw new Error("Mesaj 5000 karakterden uzun olamaz.");
  
  const user = senderOverride;
  if (!user) throw new Error("Oturum açmadan mesaj gönderemezsiniz.");

  const displayName = user.displayName || `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'İsimsiz Kullanıcı';
  const senderUid = user.id || user.uid || 'unknown';
  const photoURL = user.photoURL || user.avatarUrl || '';

  await sendMessageDoc(messageText, displayName, senderUid, photoURL, 'text');
};

export const addSystemMessage = async (text: string, userId: string) => {
  await sendMessageDoc(text, 'SİSTEM', 'system', '', 'text');
};

export const listenMessages = (callback: (messages: ChatMessage[]) => void) => {
  return subscribeMessages((msgs) => {
    const mapped: ChatMessage[] = msgs.map((m) => ({
      id: m.id,
      userId: m.senderUid,
      displayName: m.senderName,
      photoURL: m.photoURL || '',
      email: '',
      message: m.text,
      createdAt: m.createdAt,
      edited: !!m.edited,
      deleted: !!m.deleted
    }));
    callback(mapped);
  });
};

export const deleteMessage = async (messageId: string, currentUser?: any) => {
  if (!currentUser) throw new Error("Yetkisiz işlem.");
  await deleteMessageDoc(messageId);
};

export const editMessage = async (messageId: string, newMessage: string, currentUser?: any) => {
  if (!currentUser) throw new Error("Yetkisiz işlem.");
  if (!newMessage.trim() || newMessage.length > 5000) throw new Error("Geçersiz mesaj formatı.");

  await editMessageDoc(messageId, newMessage);
};
