/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, ChatUser, TypingState, VoiceChannel, VoiceMember } from './types';

// Real-time local reactive store with BroadcastChannel synchronization
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('aymc_realtime_channel') 
  : null;

function broadcast(type: string, payload?: any) {
  if (channel) {
    channel.postMessage({ type, payload });
  }
}

// Helper to manage reactive local storage items
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
    broadcast(key, value);
  } catch (err) {
    console.error('Error saving local item:', key, err);
  }
}

// Store listeners
const listeners: Record<string, Set<Function>> = {};

function listenKey(key: string, callback: Function) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(callback);
  return () => {
    listeners[key]?.delete(callback);
  };
}

function notifyKey(key: string) {
  const data = getLocalItem(key, []);
  listeners[key]?.forEach((cb) => cb(data));
}

if (channel) {
  channel.onmessage = (event) => {
    if (event.data && event.data.type) {
      notifyKey(event.data.type);
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('aymc_fs_')) {
      const key = e.key.replace('aymc_fs_', '');
      notifyKey(key);
    }
  });
}

// Verification check
export async function verifyFirestoreConnection(): Promise<boolean> {
  return true;
}

// Subscribe to messages in real-time
export function subscribeMessages(onUpdate: (messages: ChatMessage[]) => void, onError?: (errStr: string) => void) {
  const fetchMessages = () => {
    const msgs = getLocalItem<ChatMessage[]>('messages', []);
    onUpdate(msgs);
  };
  fetchMessages();
  return listenKey('messages', (msgs: ChatMessage[]) => onUpdate(msgs));
}

// Send a new message
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
  const msgs = getLocalItem<ChatMessage[]>('messages', []);
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
  const updated = [...msgs, newMsg];
  setLocalItem('messages', updated);
  notifyKey('messages');
  return newMsg.id;
}

// Edit an existing message
export async function editMessageDoc(messageId: string, newText: string): Promise<void> {
  const msgs = getLocalItem<ChatMessage[]>('messages', []);
  const updated = msgs.map((m) => m.id === messageId ? { ...m, text: newText.trim(), edited: true } : m);
  setLocalItem('messages', updated);
  notifyKey('messages');
}

// Delete an existing message
export async function deleteMessageDoc(messageId: string): Promise<void> {
  const msgs = getLocalItem<ChatMessage[]>('messages', []);
  const updated = msgs.map((m) => m.id === messageId ? { ...m, text: 'Bu mesaj silindi.', deleted: true } : m);
  setLocalItem('messages', updated);
  notifyKey('messages');
}

// Update presence state of a user
export async function updateUserPresence(
  uid: string, 
  displayName: string, 
  email: string | null,
  photoURL: string | null,
  isAnonymous: boolean,
  isOnline: boolean,
  statusText?: string
): Promise<void> {
  const activeUsers = getLocalItem<Record<string, ChatUser>>('activeUsersMap', {});
  activeUsers[uid] = {
    uid,
    displayName: displayName || 'İsimsiz',
    email: email || null,
    photoURL: photoURL || null,
    isAnonymous: !!isAnonymous,
    statusText: statusText || (isOnline ? 'Çevrimiçi' : 'Çevrimdışı'),
    lastSeen: Date.now(),
    isOnline
  };
  setLocalItem('activeUsersMap', activeUsers);
  notifyKey('activeUsersMap');
}

// Subscribe to active/online users
export function subscribeActiveUsers(onUpdate: (users: ChatUser[]) => void) {
  const processAndEmit = () => {
    const activeMap = getLocalItem<Record<string, ChatUser>>('activeUsersMap', {});
    const now = Date.now();
    const usersList: ChatUser[] = Object.values(activeMap).map((u) => ({
      ...u,
      isOnline: u.isOnline && (now - (u.lastSeen || 0) < 180000)
    }));
    usersList.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return (a.displayName || '').localeCompare(b.displayName || '');
    });
    onUpdate(usersList);
  };

  processAndEmit();
  return listenKey('activeUsersMap', () => processAndEmit());
}

// Set typing status
export async function setTypingStatus(uid: string, name: string, isTyping: boolean): Promise<void> {
  const typingMap = getLocalItem<Record<string, TypingState>>('typingMap', {});
  if (isTyping) {
    typingMap[uid] = { uid, name, isTyping: true, timestamp: Date.now() };
  } else {
    delete typingMap[uid];
  }
  setLocalItem('typingMap', typingMap);
  notifyKey('typingMap');
}

// Subscribe to typing status
export function subscribeTypingStates(onUpdate: (typingUsers: TypingState[]) => void) {
  const emit = () => {
    const typingMap = getLocalItem<Record<string, TypingState>>('typingMap', {});
    const now = Date.now();
    const activeTyping = Object.values(typingMap).filter((t) => t.isTyping && (now - (t.timestamp || 0) < 8000));
    onUpdate(activeTyping);
  };
  emit();
  return listenKey('typingMap', () => emit());
}

// --- VOICE SYSTEM FUNCTIONS ---

export async function joinVoiceChannel(
  uid: string,
  displayName: string,
  photoURL: string | null,
  channelId: string,
  role?: string
): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  presenceMap[uid] = {
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
  setLocalItem('voicePresenceMap', presenceMap);
  notifyKey('voicePresenceMap');
}

export async function leaveVoiceChannel(uid: string): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  delete presenceMap[uid];
  setLocalItem('voicePresenceMap', presenceMap);
  notifyKey('voicePresenceMap');
}

export async function updateVoiceState(
  uid: string,
  states: { isMuted?: boolean; isDeafened?: boolean; isSpeaking?: boolean }
): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  if (presenceMap[uid]) {
    presenceMap[uid] = {
      ...presenceMap[uid],
      ...states,
      lastActiveTime: Date.now()
    };
    setLocalItem('voicePresenceMap', presenceMap);
    notifyKey('voicePresenceMap');
  }
}

export async function sendVoicePacket(
  channelId: string,
  senderUid: string,
  senderName: string,
  audioBase64: string
): Promise<void> {
  const packet = {
    id: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    channelId,
    senderUid,
    senderName,
    audioData: audioBase64,
    timestamp: Date.now()
  };
  broadcast('voice_packet', packet);
}

export function subscribeVoicePresence(onUpdate: (members: VoiceMember[]) => void) {
  const emit = () => {
    const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
    const now = Date.now();
    const activeMembers = Object.values(presenceMap).filter((m) => now - (m.lastActiveTime || 0) < 300000);
    onUpdate(activeMembers);
  };
  emit();
  return listenKey('voicePresenceMap', () => emit());
}

export function subscribeVoicePackets(
  channelId: string,
  onNewPacket: (packet: { id: string; senderUid: string; senderName: string; audioData: string }) => void
) {
  if (!channel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'voice_packet') {
      const pkt = event.data.payload;
      if (pkt && pkt.channelId === channelId) {
        onNewPacket({
          id: pkt.id,
          senderUid: pkt.senderUid,
          senderName: pkt.senderName,
          audioData: pkt.audioData
        });
      }
    }
  };
  channel.addEventListener('message', handler);
  return () => {
    channel.removeEventListener('message', handler);
  };
}

const DEFAULT_VOICE_CHANNELS: VoiceChannel[] = [
  { id: 'genel-sohbet', name: '🔊 Genel Sohbet Oodası', description: 'Tüm kulüp üyeleri için serbest sohbet odası.', icon: 'Radio' },
  { id: 'surus-ekibi', name: '🏍️ Sürüş Ekibi (Telsiz Frekansı)', description: 'Aktif sürüş esnasındaki yol kaptanları ve gruptakiler için.', icon: 'Radio' },
  { id: 'yonetim-kurulu', name: '🛡️ Yönetim & Töre Konseyi', description: 'Sadece yetkili ve kule yöneticileri için özel kanal.', icon: 'Lock', roleRestriction: 'admin', isLocked: true }
];

export function subscribeVoiceChannels(onUpdate: (channels: VoiceChannel[]) => void) {
  const emit = () => {
    const channels = getLocalItem<VoiceChannel[]>('voiceChannelsList', DEFAULT_VOICE_CHANNELS);
    onUpdate(channels);
  };
  emit();
  return listenKey('voiceChannelsList', () => emit());
}

export async function createVoiceChannel(channelObj: VoiceChannel): Promise<void> {
  const channels = getLocalItem<VoiceChannel[]>('voiceChannelsList', DEFAULT_VOICE_CHANNELS);
  const updated = [...channels, { ...channelObj, isStatic: false }];
  setLocalItem('voiceChannelsList', updated);
  notifyKey('voiceChannelsList');
}

export async function deleteVoiceChannel(channelId: string): Promise<void> {
  const channels = getLocalItem<VoiceChannel[]>('voiceChannelsList', DEFAULT_VOICE_CHANNELS);
  const updated = channels.filter((c) => c.id !== channelId);
  setLocalItem('voiceChannelsList', updated);
  notifyKey('voiceChannelsList');
}

export async function editVoiceChannel(channelId: string, updates: Partial<VoiceChannel>): Promise<void> {
  const channels = getLocalItem<VoiceChannel[]>('voiceChannelsList', DEFAULT_VOICE_CHANNELS);
  const updated = channels.map((c) => c.id === channelId ? { ...c, ...updates } : c);
  setLocalItem('voiceChannelsList', updated);
  notifyKey('voiceChannelsList');
}

export async function setServerMutedState(uid: string, isServerMuted: boolean): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  if (presenceMap[uid]) {
    presenceMap[uid] = {
      ...presenceMap[uid],
      isServerMuted,
      isMuted: isServerMuted ? true : presenceMap[uid].isMuted,
      lastActiveTime: Date.now()
    };
    setLocalItem('voicePresenceMap', presenceMap);
    notifyKey('voicePresenceMap');
  }
}

export async function kickUserFromVoice(uid: string): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  if (presenceMap[uid]) {
    presenceMap[uid] = {
      ...presenceMap[uid],
      activeChannelId: null,
      isSpeaking: false,
      lastActiveTime: Date.now()
    };
    setLocalItem('voicePresenceMap', presenceMap);
    notifyKey('voicePresenceMap');
  }
}

export async function moveUserToChannel(uid: string, channelId: string): Promise<void> {
  const presenceMap = getLocalItem<Record<string, VoiceMember>>('voicePresenceMap', {});
  if (presenceMap[uid]) {
    presenceMap[uid] = {
      ...presenceMap[uid],
      activeChannelId: channelId,
      lastActiveTime: Date.now()
    };
    setLocalItem('voicePresenceMap', presenceMap);
    notifyKey('voicePresenceMap');
  }
}
