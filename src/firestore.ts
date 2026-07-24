/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ChatMessage, ChatUser, TypingState, VoiceChannel, VoiceMember } from './types';

// Helper for local storage backup
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`aymc_fs_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(`aymc_fs_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Local cache error:', err);
  }
}

// Verification check
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (err) {
    console.warn('Firestore verification notice:', err);
    return false;
  }
}

// 1. CHAT MESSAGES
export function subscribeMessages(
  onUpdate: (messages: ChatMessage[]) => void, 
  onError?: (errStr: string) => void
) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  
  return onSnapshot(q, (snapshot) => {
    const msgs: ChatMessage[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text || '',
        senderName: data.senderName || 'İsimsiz',
        senderUid: data.senderUid || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : (data.createdAt || Date.now()),
        photoURL: data.photoURL || '',
        edited: !!data.edited,
        deleted: !!data.deleted,
        mediaType: data.mediaType || 'text',
        audioUrl: data.audioUrl || '',
        videoUrl: data.videoUrl || '',
        imageUrl: data.imageUrl || ''
      };
    });
    setLocalItem('messages', msgs);
    onUpdate(msgs);
  }, (error) => {
    console.error('Messages Firestore error:', error);
    if (onError) onError(error.message);
    const cached = getLocalItem<ChatMessage[]>('messages', []);
    onUpdate(cached);
  });
}

export async function sendMessageDoc(
  text: string, 
  senderName: string, 
  senderUid: string, 
  photoURL?: string,
  mediaType?: 'text' | 'audio' | 'video' | 'image',
  audioUrl?: string,
  videoUrl?: string,
  imageUrl?: string
): Promise<string> {
  const msgData = {
    text: text.trim(),
    senderName,
    senderUid,
    createdAt: Date.now(),
    photoURL: photoURL || '',
    edited: false,
    deleted: false,
    mediaType: mediaType || 'text',
    audioUrl: audioUrl || '',
    videoUrl: videoUrl || '',
    imageUrl: imageUrl || ''
  };

  try {
    const docRef = await addDoc(collection(db, 'messages'), msgData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'messages');
    return '';
  }
}

export async function editMessageDoc(messageId: string, newText: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      text: newText.trim(),
      edited: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
  }
}

export async function deleteMessageDoc(messageId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      text: 'Bu mesaj silindi.',
      deleted: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `messages/${messageId}`);
  }
}

// 2. ACTIVE USER PRESENCE
export async function updateUserPresence(
  uid: string, 
  displayName: string, 
  email: string | null,
  photoURL: string | null,
  isAnonymous: boolean,
  isOnline: boolean,
  statusText?: string
): Promise<void> {
  if (!uid) return;
  const userData: Partial<ChatUser> = {
    uid,
    displayName: displayName || 'İsimsiz',
    email: email || null,
    photoURL: photoURL || null,
    isAnonymous: !!isAnonymous,
    statusText: statusText || (isOnline ? 'Çevrimiçi' : 'Çevrimdışı'),
    lastSeen: Date.now(),
    isOnline
  };

  try {
    await setDoc(doc(db, 'activeUsers', uid), userData, { merge: true });
  } catch (error) {
    console.warn('Presence update error:', error);
  }
}

export function subscribeActiveUsers(onUpdate: (users: ChatUser[]) => void) {
  return onSnapshot(collection(db, 'activeUsers'), (snapshot) => {
    const now = Date.now();
    const usersList: ChatUser[] = snapshot.docs.map(d => {
      const u = d.data() as ChatUser;
      return {
        ...u,
        isOnline: u.isOnline && (now - (u.lastSeen || 0) < 180000)
      };
    });
    usersList.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return (a.displayName || '').localeCompare(b.displayName || '');
    });
    setLocalItem('activeUsersMap', usersList);
    onUpdate(usersList);
  }, (err) => {
    console.warn('Active users error:', err);
    onUpdate(getLocalItem<ChatUser[]>('activeUsersMap', []));
  });
}

// 3. TYPING STATUS
export async function setTypingStatus(uid: string, name: string, isTyping: boolean): Promise<void> {
  if (!uid) return;
  try {
    if (isTyping) {
      await setDoc(doc(db, 'typingState', uid), {
        uid,
        name,
        isTyping: true,
        timestamp: Date.now()
      });
    } else {
      await deleteDoc(doc(db, 'typingState', uid));
    }
  } catch (e) {
    console.warn('Typing state error:', e);
  }
}

export function subscribeTypingStates(onUpdate: (typingUsers: TypingState[]) => void) {
  return onSnapshot(collection(db, 'typingState'), (snapshot) => {
    const now = Date.now();
    const activeTyping: TypingState[] = snapshot.docs
      .map(d => d.data() as TypingState)
      .filter(t => t.isTyping && (now - (t.timestamp || 0) < 8000));
    onUpdate(activeTyping);
  }, (err) => {
    console.warn('Typing status error:', err);
    onUpdate([]);
  });
}

// 4. VOICE SYSTEM
export async function joinVoiceChannel(
  uid: string,
  displayName: string,
  photoURL: string | null,
  channelId: string,
  role?: string
): Promise<void> {
  if (!uid) return;
  const presence: VoiceMember = {
    uid,
    displayName,
    photoURL: photoURL || undefined,
    activeChannelId: channelId,
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
    lastActiveTime: Date.now(),
    role: role || 'member'
  };

  try {
    await setDoc(doc(db, 'voicePresence', uid), presence);
  } catch (e) {
    console.warn('Voice join error:', e);
  }
}

export async function leaveVoiceChannel(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'voicePresence', uid));
  } catch (e) {
    console.warn('Voice leave error:', e);
  }
}

export async function updateVoiceState(
  uid: string,
  states: { isMuted?: boolean; isDeafened?: boolean; isSpeaking?: boolean }
): Promise<void> {
  if (!uid) return;
  try {
    await updateDoc(doc(db, 'voicePresence', uid), {
      ...states,
      lastActiveTime: Date.now()
    });
  } catch (e) {
    console.warn('Voice state update error:', e);
  }
}

export async function sendVoicePacket(
  channelId: string,
  senderUid: string,
  senderName: string,
  audioBase64: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'voicePackets'), {
      channelId,
      senderUid,
      senderName,
      audioData: audioBase64,
      timestamp: Date.now()
    });
  } catch (e) {
    console.warn('Send voice packet error:', e);
  }
}

export function subscribeVoicePresence(onUpdate: (members: VoiceMember[]) => void) {
  return onSnapshot(collection(db, 'voicePresence'), (snapshot) => {
    const now = Date.now();
    const members: VoiceMember[] = snapshot.docs
      .map(d => d.data() as VoiceMember)
      .filter(m => now - (m.lastActiveTime || 0) < 300000);
    onUpdate(members);
  }, (err) => {
    console.warn('Voice presence error:', err);
    onUpdate([]);
  });
}

export function subscribeVoicePackets(
  channelId: string,
  onNewPacket: (packet: { id: string; senderUid: string; senderName: string; audioData: string }) => void
) {
  const q = query(collection(db, 'voicePackets'), orderBy('timestamp', 'desc'), limit(1));
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        if (data.channelId === channelId) {
          onNewPacket({
            id: change.doc.id,
            senderUid: data.senderUid,
            senderName: data.senderName,
            audioData: data.audioData
          });
        }
      }
    });
  });
}

const DEFAULT_VOICE_CHANNELS: VoiceChannel[] = [
  { id: 'genel-sohbet', name: '🔊 Genel Sohbet Odası', description: 'Tüm kulüp üyeleri için serbest sohbet odası.', icon: 'Radio' },
  { id: 'surus-ekibi', name: '🏍️ Sürüş Ekibi (Telsiz Frekansı)', description: 'Aktif sürüş esnasındaki yol kaptanları ve gruptakiler için.', icon: 'Radio' },
  { id: 'yonetim-kurulu', name: '🛡️ Yönetim & Töre Konseyi', description: 'Sadece yetkili ve kule yöneticileri için özel kanal.', icon: 'Lock', roleRestriction: 'admin', isLocked: true }
];

export function subscribeVoiceChannels(onUpdate: (channels: VoiceChannel[]) => void) {
  return onSnapshot(collection(db, 'voiceChannels'), (snapshot) => {
    if (snapshot.empty) {
      onUpdate(DEFAULT_VOICE_CHANNELS);
      return;
    }
    const channels: VoiceChannel[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as VoiceChannel));
    onUpdate(channels);
  }, (err) => {
    console.warn('Voice channels subscribe error:', err);
    onUpdate(DEFAULT_VOICE_CHANNELS);
  });
}

export async function createVoiceChannel(channelObj: VoiceChannel): Promise<void> {
  try {
    await setDoc(doc(db, 'voiceChannels', channelObj.id), channelObj);
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `voiceChannels/${channelObj.id}`);
  }
}

export async function deleteVoiceChannel(channelId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'voiceChannels', channelId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `voiceChannels/${channelId}`);
  }
}

export async function editVoiceChannel(channelId: string, updates: Partial<VoiceChannel>): Promise<void> {
  try {
    await updateDoc(doc(db, 'voiceChannels', channelId), updates);
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `voiceChannels/${channelId}`);
  }
}

export async function setServerMutedState(uid: string, isServerMuted: boolean): Promise<void> {
  if (!uid) return;
  try {
    await updateDoc(doc(db, 'voicePresence', uid), {
      isServerMuted,
      isMuted: isServerMuted ? true : false,
      lastActiveTime: Date.now()
    });
  } catch (e) {
    console.warn('Server mute error:', e);
  }
}

export async function kickUserFromVoice(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'voicePresence', uid));
  } catch (e) {
    console.warn('Kick voice error:', e);
  }
}

export async function moveUserToChannel(uid: string, channelId: string): Promise<void> {
  if (!uid) return;
  try {
    await updateDoc(doc(db, 'voicePresence', uid), {
      activeChannelId: channelId,
      lastActiveTime: Date.now()
    });
  } catch (e) {
    console.warn('Move user error:', e);
  }
}
