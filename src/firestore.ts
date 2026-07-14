import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot, 
  serverTimestamp, 
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, translateFirebaseError, handleFirestoreError, OperationType } from './firebase';
import { ChatMessage, ChatUser, TypingState, VoiceChannel, VoiceMember } from './types';

// Verification check: Verifies connection by fetching a single document from messages
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    const q = query(collection(db, 'messages'), limit(1));
    await getDocs(q);
    return true;
  } catch (error: any) {
    console.error("Firestore connection verification failed:", error);
    throw new Error(translateFirebaseError(error));
  }
}

// Subscribe to messages in real-time
export function subscribeMessages(onUpdate: (messages: ChatMessage[]) => void, onError: (errStr: string) => void) {
  try {
    const q = query(
      collection(db, 'messages'), 
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text || '',
          senderName: data.senderName || 'Anonim',
          senderUid: data.senderUid || '',
          createdAt: data.createdAt,
          photoURL: data.photoURL || '',
          edited: !!data.edited,
          deleted: !!data.deleted,
          mediaType: data.mediaType || 'text',
          audioUrl: data.audioUrl || '',
          videoUrl: data.videoUrl || '',
          imageUrl: data.imageUrl || ''
        });
      });
      onUpdate(messages);
    }, (error) => {
      console.error("Error subscribing to messages:", error);
      onError(translateFirebaseError(error));
    });
  } catch (error: any) {
    onError(translateFirebaseError(error));
    return () => {};
  }
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
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      senderName,
      senderUid,
      createdAt: serverTimestamp(),
      photoURL: photoURL || '',
      edited: false,
      deleted: false,
      mediaType: mediaType || 'text',
      audioUrl: audioUrl || '',
      videoUrl: videoUrl || '',
      imageUrl: imageUrl || ''
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Failed to send message:", error);
    throw new Error(translateFirebaseError(error));
  }
}

// Edit an existing message
export async function editMessageDoc(messageId: string, newText: string): Promise<void> {
  try {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, {
      text: newText.trim(),
      edited: true
    });
  } catch (error: any) {
    console.error("Failed to edit message:", error);
    throw new Error(translateFirebaseError(error));
  }
}

// Delete an existing message (Soft delete for preserving history visuals)
export async function deleteMessageDoc(messageId: string): Promise<void> {
  try {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, {
      text: 'Bu mesaj silindi.',
      deleted: true
    });
  } catch (error: any) {
    console.error("Failed to delete message:", error);
    throw new Error(translateFirebaseError(error));
  }
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
  try {
    const docRef = doc(db, 'activeUsers', uid);
    await setDoc(docRef, {
      uid,
      displayName,
      email,
      photoURL,
      isAnonymous,
      isOnline,
      statusText: statusText || (isOnline ? 'Çevrimiçi' : 'Çevrimdışı'),
      lastSeen: Date.now()
    }, { merge: true });
  } catch (error: any) {
    console.error("Failed to update user presence:", error);
    // Silent fail in background is preferred for UX
  }
}

// Subscribe to active/online users
export function subscribeActiveUsers(onUpdate: (users: ChatUser[]) => void) {
  const q = collection(db, 'activeUsers');
  return onSnapshot(q, (snapshot) => {
    const users: ChatUser[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Keep users that were updated in the last 2 minutes as online, or if they have explicit isOnline
      const isActuallyOnline = data.isOnline && (Date.now() - (data.lastSeen || 0) < 120000);
      users.push({
        uid: data.uid,
        displayName: data.displayName || 'İsimsiz',
        email: data.email || null,
        photoURL: data.photoURL || null,
        isAnonymous: !!data.isAnonymous,
        statusText: data.statusText || '',
        lastSeen: data.lastSeen || Date.now(),
        isOnline: isActuallyOnline
      });
    });
    // Sort online first, then by display name
    users.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
    onUpdate(users);
  }, (error) => {
    console.error("Error subscribing to active users:", error);
  });
}

// Set typing status
export async function setTypingStatus(uid: string, name: string, isTyping: boolean): Promise<void> {
  try {
    const docRef = doc(db, 'typingState', uid);
    if (isTyping) {
      await setDoc(docRef, {
        uid,
        name,
        isTyping,
        timestamp: Date.now()
      });
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Failed to set typing status:", error);
  }
}

// Subscribe to typing status of active users
export function subscribeTypingStates(onUpdate: (typingUsers: TypingState[]) => void) {
  const q = collection(db, 'typingState');
  return onSnapshot(q, (snapshot) => {
    const typingList: TypingState[] = [];
    const now = Date.now();
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only keep updates within the last 8 seconds to prevent stuck typing indicators
      if (data.isTyping && (now - (data.timestamp || 0) < 8000)) {
        typingList.push({
          uid: data.uid,
          name: data.name || 'Biri',
          isTyping: data.isTyping,
          timestamp: data.timestamp
        });
      }
    });
    onUpdate(typingList);
  }, (error) => {
    console.error("Error subscribing to typing states:", error);
  });
}

// --- TEAMSPEAK VOICE SYSTEM FUNCTIONS ---

// Join voice channel
export async function joinVoiceChannel(
  uid: string,
  displayName: string,
  photoURL: string | null,
  channelId: string,
  role?: string
): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await setDoc(docRef, {
      uid,
      displayName,
      photoURL: photoURL || null,
      activeChannelId: channelId,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      lastActiveTime: Date.now(),
      role: role || 'member'
    }, { merge: true });
  } catch (error) {
    console.error("Failed to join voice channel:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Leave voice channel
export async function leaveVoiceChannel(uid: string): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to leave voice channel:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Set mute/deafen/speaking state
export async function updateVoiceState(
  uid: string,
  states: { isMuted?: boolean; isDeafened?: boolean; isSpeaking?: boolean }
): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await setDoc(docRef, {
      ...states,
      lastActiveTime: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to update voice state:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Send a live audio voice packet (for Walkie-Talkie TeamSpeak transmission)
export async function sendVoicePacket(
  channelId: string,
  senderUid: string,
  senderName: string,
  audioBase64: string
): Promise<void> {
  const path = 'voicePackets';
  try {
    await addDoc(collection(db, 'voicePackets'), {
      channelId,
      senderUid,
      senderName,
      audioData: audioBase64,
      timestamp: Date.now() // Precise client timestamp for instant filtering
    });
  } catch (error) {
    console.error("Failed to send voice packet:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to active voice channel participants
export function subscribeVoicePresence(onUpdate: (members: VoiceMember[]) => void) {
  const path = 'voicePresence';
  const q = collection(db, 'voicePresence');
  return onSnapshot(q, (snapshot) => {
    const members: VoiceMember[] = [];
    const now = Date.now();
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Filter out stale users who haven't updated in 5 minutes
      if (now - (data.lastActiveTime || 0) < 300000) {
        members.push({
          uid: data.uid,
          displayName: data.displayName || 'İsimsiz',
          photoURL: data.photoURL || undefined,
          activeChannelId: data.activeChannelId || null,
          isMuted: !!data.isMuted,
          isDeafened: !!data.isDeafened,
          isSpeaking: !!data.isSpeaking,
          lastActiveTime: data.lastActiveTime || now,
          isServerMuted: !!data.isServerMuted,
          role: data.role || 'member'
        });
      }
    });
    onUpdate(members);
  }, (error) => {
    console.error("Error subscribing to voice presence:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Subscribe to real-time voice packets in a channel
// We only watch for packets created AFTER the subscription starts
export function subscribeVoicePackets(
  channelId: string,
  onNewPacket: (packet: { id: string; senderUid: string; senderName: string; audioData: string }) => void
) {
  const path = 'voicePackets';
  const startTime = Date.now() - 1000; // allow 1 second leeway for immediate delivery
  const q = query(
    collection(db, 'voicePackets'),
    where('channelId', '==', channelId),
    where('timestamp', '>', startTime)
  );
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        onNewPacket({
          id: change.doc.id,
          senderUid: data.senderUid,
          senderName: data.senderName,
          audioData: data.audioData
        });
      }
    });
  }, (error) => {
    console.error("Error subscribing to voice packets:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Subscribe to dynamic voice channels list from Firestore
export function subscribeVoiceChannels(onUpdate: (channels: VoiceChannel[]) => void) {
  const path = 'voiceChannels';
  const q = collection(db, 'voiceChannels');
  return onSnapshot(q, (snapshot) => {
    const channels: VoiceChannel[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      channels.push({
        id: data.id || doc.id,
        name: data.name || 'İsimsiz Oda',
        description: data.description || '',
        icon: data.icon || 'Radio',
        password: data.password || undefined,
        roleRestriction: data.roleRestriction || undefined,
        isLocked: !!data.isLocked,
        isStatic: !!data.isStatic
      });
    });
    onUpdate(channels);
  }, (error) => {
    console.error("Error subscribing to voice channels:", error);
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Create a dynamic voice channel
export async function createVoiceChannel(channel: VoiceChannel): Promise<void> {
  const path = `voiceChannels/${channel.id}`;
  try {
    const docRef = doc(db, 'voiceChannels', channel.id);
    await setDoc(docRef, {
      ...channel,
      isStatic: false
    });
  } catch (error) {
    console.error("Failed to create voice channel:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a dynamic voice channel
export async function deleteVoiceChannel(channelId: string): Promise<void> {
  const path = `voiceChannels/${channelId}`;
  try {
    const docRef = doc(db, 'voiceChannels', channelId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to delete voice channel:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Edit a dynamic voice channel
export async function editVoiceChannel(channelId: string, updates: Partial<VoiceChannel>): Promise<void> {
  const path = `voiceChannels/${channelId}`;
  try {
    const docRef = doc(db, 'voiceChannels', channelId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Failed to edit voice channel:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Mute/unmute user server-side by Admin
export async function setServerMutedState(uid: string, isServerMuted: boolean): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await setDoc(docRef, {
      isServerMuted,
      isMuted: isServerMuted ? true : false, // Force mute
      lastActiveTime: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to set server mute state:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Kick user from voice channel by Admin
export async function kickUserFromVoice(uid: string): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await updateDoc(docRef, {
      activeChannelId: null,
      isSpeaking: false,
      lastActiveTime: Date.now()
    });
  } catch (error) {
    console.error("Failed to kick user from voice:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Move user to another voice channel by Admin
export async function moveUserToChannel(uid: string, channelId: string): Promise<void> {
  const path = `voicePresence/${uid}`;
  try {
    const docRef = doc(db, 'voicePresence', uid);
    await updateDoc(docRef, {
      activeChannelId: channelId,
      lastActiveTime: Date.now()
    });
  } catch (error) {
    console.error("Failed to move user to channel:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
