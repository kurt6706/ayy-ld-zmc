import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, translateFirebaseError } from './firebase';
import { ChatMessage, ChatUser, TypingState } from './types';

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
          deleted: !!data.deleted
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
  photoURL?: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      senderName,
      senderUid,
      createdAt: serverTimestamp(),
      photoURL: photoURL || '',
      edited: false,
      deleted: false
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
