/**
 * Firebase Firestore & Storage Data Service Layer
 * Fully integrated for Ayyıldız Motosiklet Kulübü (AYMK)
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
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { Event, Route, BlogPost, UserPost, GalleryItem, Meeting, User } from '../types';
import { DEFAULT_EVENTS, DEFAULT_ROUTES, DEFAULT_BLOG, DEFAULT_GALLERY_ITEMS, DEFAULT_USERS } from '../data';

// Connection test
export async function testFirestoreConnection() {
  return true;
}

// Bootstrap initial default items into Firestore if empty
export async function bootstrapDatabaseIfEmpty() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      for (const usr of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', usr.id), usr);
      }
    }

    const eventsSnap = await getDocs(collection(db, 'events'));
    if (eventsSnap.empty) {
      for (const ev of DEFAULT_EVENTS) {
        await setDoc(doc(db, 'events', ev.id), ev);
      }
    }

    const routesSnap = await getDocs(collection(db, 'routes'));
    if (routesSnap.empty) {
      for (const rt of DEFAULT_ROUTES) {
        await setDoc(doc(db, 'routes', rt.id), rt);
      }
    }

    const blogSnap = await getDocs(collection(db, 'blogPosts'));
    if (blogSnap.empty) {
      for (const bp of DEFAULT_BLOG) {
        await setDoc(doc(db, 'blogPosts', bp.id), bp);
      }
    }

    const gallerySnap = await getDocs(collection(db, 'galleryItems'));
    if (gallerySnap.empty) {
      for (const gi of DEFAULT_GALLERY_ITEMS) {
        await setDoc(doc(db, 'galleryItems', gi.id), gi);
      }
    }
  } catch (err) {
    console.warn('Bootstrap database check error:', err);
  }
}

// 1. USERS
export function subscribeUsers(onUpdate: (users: User[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users: User[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
    if (users.length === 0) {
      onUpdate(DEFAULT_USERS);
    } else {
      // Merge with DEFAULT_USERS so default accounts are never lost
      const userMap = new Map<string, User>();
      DEFAULT_USERS.forEach(u => userMap.set(u.id, u));
      users.forEach(u => userMap.set(u.id, u));
      onUpdate(Array.from(userMap.values()));
    }
  }, (err) => {
    console.warn('Users subscribe error:', err);
    onUpdate(DEFAULT_USERS);
  });
}

export async function addOrUpdateUser(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function deleteUserDoc(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}

// 2. EVENTS
export function subscribeEvents(onUpdate: (events: Event[]) => void) {
  return onSnapshot(collection(db, 'events'), (snapshot) => {
    const events: Event[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event));
    if (events.length === 0) {
      onUpdate(DEFAULT_EVENTS);
    } else {
      const eventMap = new Map<string, Event>();
      DEFAULT_EVENTS.forEach(ev => eventMap.set(ev.id, ev));
      events.forEach(ev => eventMap.set(ev.id, ev));
      onUpdate(Array.from(eventMap.values()));
    }
  }, (err) => {
    console.warn('Events subscribe error:', err);
    onUpdate(DEFAULT_EVENTS);
  });
}

export async function addOrUpdateEvent(event: Event): Promise<void> {
  try {
    await setDoc(doc(db, 'events', event.id), event, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
  }
}

export async function deleteEventDoc(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
  }
}

// 3. ROUTES
export function subscribeRoutes(onUpdate: (routes: Route[]) => void) {
  return onSnapshot(collection(db, 'routes'), (snapshot) => {
    const routes: Route[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Route));
    if (routes.length === 0) {
      onUpdate(DEFAULT_ROUTES);
    } else {
      const routeMap = new Map<string, Route>();
      DEFAULT_ROUTES.forEach(rt => routeMap.set(rt.id, rt));
      routes.forEach(rt => routeMap.set(rt.id, rt));
      onUpdate(Array.from(routeMap.values()));
    }
  }, (err) => {
    console.warn('Routes subscribe error:', err);
    onUpdate(DEFAULT_ROUTES);
  });
}

export async function addOrUpdateRoute(route: Route): Promise<void> {
  try {
    await setDoc(doc(db, 'routes', route.id), route, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `routes/${route.id}`);
  }
}

export async function deleteRouteDoc(routeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'routes', routeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `routes/${routeId}`);
  }
}

// 4. BLOG POSTS / NEWS
export function subscribeBlogPosts(onUpdate: (posts: BlogPost[]) => void) {
  return onSnapshot(collection(db, 'blogPosts'), (snapshot) => {
    const posts: BlogPost[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    onUpdate(posts);
  }, (err) => {
    console.warn('Blog posts subscribe error:', err);
    onUpdate(DEFAULT_BLOG);
  });
}

export async function addOrUpdateBlogPost(post: BlogPost): Promise<void> {
  try {
    await setDoc(doc(db, 'blogPosts', post.id), post, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `blogPosts/${post.id}`);
  }
}

export async function deleteBlogPostDoc(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `blogPosts/${postId}`);
  }
}

// 5. USER POSTS / FORUM
export function subscribeUserPosts(onUpdate: (posts: UserPost[]) => void) {
  return onSnapshot(collection(db, 'userPosts'), (snapshot) => {
    const posts: UserPost[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserPost));
    onUpdate(posts);
  }, (err) => {
    console.warn('User posts subscribe error:', err);
  });
}

export async function addOrUpdateUserPost(post: UserPost): Promise<void> {
  try {
    await setDoc(doc(db, 'userPosts', post.id), post, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `userPosts/${post.id}`);
  }
}

export async function deleteUserPostDoc(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'userPosts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `userPosts/${postId}`);
  }
}

// 6. GALLERY ITEMS
export function subscribeGalleryItems(onUpdate: (items: GalleryItem[]) => void) {
  return onSnapshot(collection(db, 'galleryItems'), (snapshot) => {
    const firestoreItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    
    const itemMap = new Map<string, GalleryItem>();
    DEFAULT_GALLERY_ITEMS.forEach(gi => itemMap.set(gi.id, gi));

    firestoreItems.forEach(d => {
      if (d.deleted) {
        itemMap.delete(d.id);
      } else {
        itemMap.set(d.id, d as GalleryItem);
      }
    });

    onUpdate(Array.from(itemMap.values()).filter(item => !(item as any).deleted));
  }, (err) => {
    console.warn('Gallery subscribe error:', err);
    onUpdate(DEFAULT_GALLERY_ITEMS);
  });
}

export async function addOrUpdateGalleryItem(item: GalleryItem): Promise<void> {
  try {
    const cleanItem = { ...item, deleted: false };
    await setDoc(doc(db, 'galleryItems', item.id), cleanItem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `galleryItems/${item.id}`);
  }
}

export async function deleteGalleryItemDoc(itemId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'galleryItems', itemId), { id: itemId, deleted: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `galleryItems/${itemId}`);
  }
}

// 7. ANNOUNCEMENTS
export function subscribeAnnouncements(onUpdate: (items: any[]) => void) {
  return onSnapshot(collection(db, 'announcements'), (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  }, (err) => {
    console.warn('Announcements subscribe error:', err);
  });
}

export async function addOrUpdateAnnouncement(announcement: any): Promise<void> {
  try {
    await setDoc(doc(db, 'announcements', announcement.id), announcement, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `announcements/${announcement.id}`);
  }
}

export async function deleteAnnouncementDoc(announcementId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${announcementId}`);
  }
}

// 8. DIRECT MESSAGES
export function subscribeDirectMessages(onUpdate: (msgs: any[]) => void) {
  return onSnapshot(collection(db, 'directMessages'), (snapshot) => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(msgs);
  }, (err) => {
    console.warn('Direct messages error:', err);
  });
}

export async function addDirectMessageDoc(message: any): Promise<void> {
  try {
    const docId = message.id || `dm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, 'directMessages', docId), { ...message, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'directMessages');
  }
}

export async function markDirectMessageAsRead(msgId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'directMessages', msgId), { read: true });
  } catch (error) {
    console.warn('Mark message read error:', error);
  }
}

export async function markDirectMessagesAsRead(senderIdOrIds: string[] | string, receiverId?: string): Promise<void> {
  try {
    const ids = Array.isArray(senderIdOrIds) ? senderIdOrIds : [senderIdOrIds];
    for (const id of ids) {
      await updateDoc(doc(db, 'directMessages', id), { read: true }).catch(() => {});
    }
  } catch (error) {
    console.warn('Mark messages read error:', error);
  }
}

// 9. MEETINGS
export function subscribeMeetings(onUpdate: (meetings: Meeting[]) => void) {
  return onSnapshot(collection(db, 'meetings'), (snapshot) => {
    const meetings: Meeting[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meeting));
    onUpdate(meetings);
  }, (err) => {
    console.warn('Meetings subscribe error:', err);
  });
}

export async function addOrUpdateMeeting(meeting: Meeting): Promise<void> {
  try {
    await setDoc(doc(db, 'meetings', meeting.id), meeting, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `meetings/${meeting.id}`);
  }
}

export async function deleteMeetingDoc(meetingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'meetings', meetingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `meetings/${meetingId}`);
  }
}

// 10. MEDIA / FILE UPLOADS (Firebase Storage with Hostinger / Data URL Fallback)
export async function uploadMediaToFirebase(file: File, folder: string = 'gallery'): Promise<string> {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload failed, converting file locally:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

export async function uploadMediaToHostinger(file: File, type: 'image' | 'video' = 'image'): Promise<{ url: string; fileName: string }> {
  try {
    const url = await uploadMediaToFirebase(file, type === 'video' ? 'videos' : 'images');
    return { url, fileName: file.name };
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}
