import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

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
  
  const user = senderOverride || auth.currentUser;
  if (!user) throw new Error("Oturum açmadan mesaj gönderemezsiniz.");

  const messagesRef = collection(db, "messages");
  await addDoc(messagesRef, {
    userId: user.id || user.uid || 'unknown',
    displayName: user.displayName || `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'İsimsiz Kullanıcı',
    photoURL: user.photoURL || user.avatarUrl || '',
    email: user.email || user.username || '',
    message: messageText.trim(),
    createdAt: serverTimestamp(),
    edited: false,
    deleted: false
  });
};

export const addSystemMessage = async (text: string, userId: string) => {
  const messagesRef = collection(db, "messages");
  await addDoc(messagesRef, {
    userId: 'system',
    displayName: 'SİSTEM',
    photoURL: '',
    email: '',
    message: text,
    createdAt: serverTimestamp(),
    edited: false,
    deleted: false,
    targetUserId: userId // optional field just to note who it's for
  });
};

export const listenMessages = (callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    console.error("Firebase dinleme hatası:", error);
    throw error;
  });
};

export const deleteMessage = async (messageId: string, currentUser?: any) => {
  const user = currentUser || auth.currentUser;
  if (!user) throw new Error("Yetkisiz işlem.");
  await updateDoc(doc(db, "messages", messageId), {
    deleted: true,
    message: "Bu mesaj silinmiştir."
  });
};

export const editMessage = async (messageId: string, newMessage: string, currentUser?: any) => {
  const user = currentUser || auth.currentUser;
  if (!user) throw new Error("Yetkisiz işlem.");
  if (!newMessage.trim() || newMessage.length > 5000) throw new Error("Geçersiz mesaj formatı.");

  await updateDoc(doc(db, "messages", messageId), {
    message: newMessage.trim(),
    edited: true
  });
};
