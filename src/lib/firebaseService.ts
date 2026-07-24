/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Event, Route, BlogPost, UserPost, GalleryItem, Meeting } from '../types';
import { DEFAULT_EVENTS, DEFAULT_ROUTES, DEFAULT_BLOG, DEFAULT_GALLERY_ITEMS } from '../data';

// Connection Test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test completed successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration (client is offline).");
    } else {
      console.warn("Connection test completed (might be offline or initial setup).", error);
    }
  }
}

// Automatic database bootstrapping
export async function bootstrapDatabaseIfEmpty() {
  try {
    // 1. Check & Bootstrap Users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log("Seeding default admin and member users...");
      const defaultAdmin = {
        id: 'admin-1',
        name: 'Kurtuluş',
        surname: 'Düzlü',
        username: 'kurt',
        password: 'kurt123',
        role: 'admin',
        status: 'approved',
        statusText: 'Kurucu Üye / Töre Muhafızı',
        avatarUrl: '',
        profile: {},
        privacy: {}
      };
      await setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin);

      const testAdmin = {
        id: 'admin-default',
        name: 'Yönetici',
        surname: 'Sistem',
        username: 'admin',
        password: 'password',
        role: 'admin',
        status: 'approved',
        statusText: 'Sistem Yöneticisi',
        avatarUrl: '',
        profile: {},
        privacy: {}
      };
      await setDoc(doc(db, 'users', testAdmin.id), testAdmin);

      const defaultMember1 = {
        id: 'member-1',
        name: 'Alperen',
        surname: 'Kaya',
        username: 'alperen',
        password: '123',
        role: 'member',
        status: 'approved',
        statusText: 'Yol Kaptanı',
        avatarUrl: '',
        profile: {},
        privacy: {}
      };
      await setDoc(doc(db, 'users', defaultMember1.id), defaultMember1);

      const defaultMember2 = {
        id: 'member-2',
        name: 'Asena',
        surname: 'Yılmaz',
        username: 'asena',
        password: '123',
        role: 'member',
        status: 'approved',
        statusText: 'Halkla İlişkiler Sorumlusu',
        avatarUrl: '',
        profile: {},
        privacy: {}
      };
      await setDoc(doc(db, 'users', defaultMember2.id), defaultMember2);
    }

    // 2. Check & Bootstrap Events
    const eventsSnap = await getDocs(collection(db, 'events'));
    if (eventsSnap.empty) {
      console.log("Seeding default events...");
      const batch = writeBatch(db);
      DEFAULT_EVENTS.forEach((evt) => {
        const docRef = doc(db, 'events', evt.id);
        batch.set(docRef, evt);
      });
      await batch.commit();
    }

    // 3. Check & Bootstrap Routes
    const routesSnap = await getDocs(collection(db, 'routes'));
    if (routesSnap.empty) {
      console.log("Seeding default routes...");
      const batch = writeBatch(db);
      DEFAULT_ROUTES.forEach((rt) => {
        const docRef = doc(db, 'routes', rt.id);
        batch.set(docRef, rt);
      });
      await batch.commit();
    }

    // 4. Check & Bootstrap Blog Posts
    const blogSnap = await getDocs(collection(db, 'blogPosts'));
    if (blogSnap.empty) {
      console.log("Seeding default blog posts...");
      const batch = writeBatch(db);
      DEFAULT_BLOG.forEach((post) => {
        const docRef = doc(db, 'blogPosts', post.id);
        batch.set(docRef, post);
      });
      await batch.commit();
    }

    // 5. Check & Bootstrap Gallery Items
    const gallerySnap = await getDocs(collection(db, 'galleryItems'));
    if (gallerySnap.empty) {
      console.log("Seeding default gallery items...");
      const batch = writeBatch(db);
      DEFAULT_GALLERY_ITEMS.forEach((item) => {
        const docRef = doc(db, 'galleryItems', item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    } else {
      // Ensure specific default items are written if missing
      const batch = writeBatch(db);
      let needsCommit = false;
      DEFAULT_GALLERY_ITEMS.forEach((item) => {
        const exists = gallerySnap.docs.some(doc => doc.id === item.id);
        if (!exists) {
          const docRef = doc(db, 'galleryItems', item.id);
          batch.set(docRef, item);
          needsCommit = true;
        }
      });
      if (needsCommit) {
        console.log("Updating missing default gallery items in Firestore...");
        await batch.commit();
      }
    }
  } catch (error) {
    console.warn("Database bootstrapping warning (using default client-side data):", error);
  }
}

const DEFAULT_USERS = [
  {
    id: 'admin-1',
    name: 'Kurtuluş',
    surname: 'Düzlü',
    username: 'kurt',
    password: 'kurt123',
    role: 'admin',
    status: 'approved',
    statusText: 'Kurucu Üye / Töre Muhafızı',
    avatarUrl: '',
    profile: {},
    privacy: {}
  },
  {
    id: 'admin-default',
    name: 'Yönetici',
    surname: 'Sistem',
    username: 'admin',
    password: 'password',
    role: 'admin',
    status: 'approved',
    statusText: 'Sistem Yöneticisi',
    avatarUrl: '',
    profile: {},
    privacy: {}
  },
  {
    id: 'member-1',
    name: 'Alperen',
    surname: 'Kaya',
    username: 'alperen',
    password: '123',
    role: 'member',
    status: 'approved',
    statusText: 'Yol Kaptanı',
    avatarUrl: '',
    profile: {},
    privacy: {}
  },
  {
    id: 'member-2',
    name: 'Asena',
    surname: 'Yılmaz',
    username: 'asena',
    password: '123',
    role: 'member',
    status: 'approved',
    statusText: 'Halkla İlişkiler Sorumlusu',
    avatarUrl: '',
    profile: {},
    privacy: {}
  }
];

// Subscriptions for real-time Sync

export function subscribeUsers(onUpdate: (users: any[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    
    // Save to localStorage as a robust local backup
    try {
      if (list.length > 0) {
        localStorage.setItem('aymc_users_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Failed to save users backup to localStorage:", e);
    }

    onUpdate(list.length > 0 ? list : DEFAULT_USERS);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'users');
    
    // Fallback to localStorage backup if available
    let localUsers: any[] = [];
    try {
      const stored = localStorage.getItem('aymc_users_backup');
      if (stored) {
        localUsers = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to read users backup from localStorage:", e);
    }
    
    onUpdate(localUsers.length > 0 ? localUsers : DEFAULT_USERS);
  });
}

export function subscribeEvents(onUpdate: (events: Event[]) => void) {
  return onSnapshot(collection(db, 'events'), (snapshot) => {
    const list: Event[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id } as Event);
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'events');
    onUpdate(DEFAULT_EVENTS);
  });
}

export function subscribeRoutes(onUpdate: (routes: Route[]) => void) {
  return onSnapshot(collection(db, 'routes'), (snapshot) => {
    const list: Route[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id } as Route);
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'routes');
    onUpdate(DEFAULT_ROUTES);
  });
}

export function subscribeBlogPosts(onUpdate: (posts: BlogPost[]) => void) {
  return onSnapshot(collection(db, 'blogPosts'), (snapshot) => {
    const list: BlogPost[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id } as BlogPost);
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'blogPosts');
    onUpdate(DEFAULT_BLOG);
  });
}

// Removed chatMessages functions

// CRUD Operations with clean Error Wrapping

export async function addOrUpdateUser(user: any) {
  // Save to localStorage backup first so it is immediately available
  try {
    const stored = localStorage.getItem('aymc_users_backup');
    let localUsers: any[] = stored ? JSON.parse(stored) : [...DEFAULT_USERS];
    const index = localUsers.findIndex((x: any) => x.id === user.id);
    if (index > -1) {
      localUsers[index] = user;
    } else {
      localUsers.push(user);
    }
    localStorage.setItem('aymc_users_backup', JSON.stringify(localUsers));
  } catch (e) {
    console.warn("Failed to save user to localStorage backup:", e);
  }

  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function deleteUserDoc(userId: string) {
  // Delete from localStorage backup first
  try {
    const stored = localStorage.getItem('aymc_users_backup');
    if (stored) {
      let localUsers = JSON.parse(stored);
      localUsers = localUsers.filter((x: any) => x.id !== userId);
      localStorage.setItem('aymc_users_backup', JSON.stringify(localUsers));
    }
  } catch (e) {
    console.warn("Failed to delete user from localStorage backup:", e);
  }

  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}

export async function addOrUpdateEvent(event: Event) {
  try {
    await setDoc(doc(db, 'events', event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
  }
}

export async function deleteEventDoc(eventId: string) {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
  }
}

export async function addOrUpdateRoute(route: Route) {
  try {
    await setDoc(doc(db, 'routes', route.id), route);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `routes/${route.id}`);
  }
}

export async function deleteRouteDoc(routeId: string) {
  try {
    await deleteDoc(doc(db, 'routes', routeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `routes/${routeId}`);
  }
}

export async function addOrUpdateBlogPost(post: BlogPost) {
  try {
    await setDoc(doc(db, 'blogPosts', post.id), post);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `blogPosts/${post.id}`);
  }
}

export async function deleteBlogPostDoc(postId: string) {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `blogPosts/${postId}`);
  }
}

// Removed addChatMessageDoc

export function subscribeUserPosts(onUpdate: (posts: UserPost[]) => void) {
  return onSnapshot(collection(db, 'userPosts'), (snapshot) => {
    const list: UserPost[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id } as UserPost);
    });
    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'userPosts');
    onUpdate([]);
  });
}

export async function addOrUpdateUserPost(post: UserPost) {
  try {
    await setDoc(doc(db, 'userPosts', post.id), post);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `userPosts/${post.id}`);
  }
}

export async function deleteUserPostDoc(postId: string) {
  try {
    await deleteDoc(doc(db, 'userPosts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `userPosts/${postId}`);
  }
}

export function subscribeDirectMessages(onUpdate: (messages: any[]) => void) {
  return onSnapshot(collection(db, 'directMessages'), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    // Sort by timestamp ascending
    list.sort((a, b) => a.timestamp - b.timestamp);
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'directMessages');
    onUpdate([]);
  });
}

export async function addDirectMessageDoc(message: any) {
  try {
    await setDoc(doc(db, 'directMessages', message.id), message);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `directMessages/${message.id}`);
  }
}

export async function markDirectMessagesAsRead(senderId: string, receiverId: string) {
  try {
    const qSnap = await getDocs(collection(db, 'directMessages'));
    const batch = writeBatch(db);
    let updated = false;
    qSnap.forEach((d) => {
      const data = d.data();
      if (data.senderId === senderId && data.receiverId === receiverId && !data.read) {
        batch.update(doc(db, 'directMessages', d.id), { read: true });
        updated = true;
      }
    });
    if (updated) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error marking DMs as read:", error);
  }
}

export function subscribeAnnouncements(onUpdate: (announcements: any[]) => void) {
  return onSnapshot(collection(db, 'announcements'), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    // Sort by date/timestamp descending
    list.sort((a, b) => {
      const timeA = a.timestamp || new Date(a.date).getTime() || 0;
      const timeB = b.timestamp || new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'announcements');
    onUpdate([
      { id: 'ann-1', title: 'Ayyıldız Moto Kulüp', content: 'Kulübümüzün resmi web sitesine hoş geldiniz. Sitemiz şu anda aktif olarak kullanılmaktadır.', date: '2026-07-17', important: true }
    ]);
  });
}

export async function addOrUpdateAnnouncement(announcement: any) {
  try {
    await setDoc(doc(db, 'announcements', announcement.id), announcement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `announcements/${announcement.id}`);
  }
}

export async function deleteAnnouncementDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
  }
}

// Gallery subscriptions & operations
export function subscribeGalleryItems(onUpdate: (items: GalleryItem[]) => void) {
  return onSnapshot(collection(db, 'galleryItems'), (snapshot) => {
    const list: GalleryItem[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...(doc.data() as GalleryItem), id: doc.id });
    });
    // Sort descending by date (or created timestamp)
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Save to localStorage as a robust local backup
    try {
      if (list.length > 0) {
        localStorage.setItem('aymc_gallery_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Failed to save gallery backup to localStorage:", e);
    }
    
    onUpdate(list.length > 0 ? list : DEFAULT_GALLERY_ITEMS);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'galleryItems');
    
    // Load from localStorage backup if available
    let localItems: GalleryItem[] = [];
    try {
      const stored = localStorage.getItem('aymc_gallery_backup');
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to read gallery backup from localStorage:", e);
    }
    
    if (localItems && localItems.length > 0) {
      onUpdate(localItems);
    } else {
      onUpdate(DEFAULT_GALLERY_ITEMS);
    }
  });
}

export async function addOrUpdateGalleryItem(item: GalleryItem) {
  // Save to localStorage first so it's immediately available locally!
  try {
    const stored = localStorage.getItem('aymc_gallery_backup');
    let localItems: GalleryItem[] = stored ? JSON.parse(stored) : [...DEFAULT_GALLERY_ITEMS];
    const index = localItems.findIndex((x: GalleryItem) => x.id === item.id);
    if (index > -1) {
      localItems[index] = item;
    } else {
      localItems.unshift(item);
    }
    localStorage.setItem('aymc_gallery_backup', JSON.stringify(localItems));
  } catch (e) {
    console.warn("Failed to save item to localStorage gallery backup:", e);
  }

  try {
    await setDoc(doc(db, 'galleryItems', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `galleryItems/${item.id}`);
  }
}

export async function deleteGalleryItemDoc(id: string) {
  // Delete from localStorage first!
  try {
    const stored = localStorage.getItem('aymc_gallery_backup');
    if (stored) {
      let localItems = JSON.parse(stored);
      localItems = localItems.filter((x: GalleryItem) => x.id !== id);
      localStorage.setItem('aymc_gallery_backup', JSON.stringify(localItems));
    }
  } catch (e) {
    console.warn("Failed to delete item from localStorage gallery backup:", e);
  }

  try {
    await deleteDoc(doc(db, 'galleryItems', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `galleryItems/${id}`);
  }
}

// Meeting (Toplantı) subscriptions & operations
export function subscribeMeetings(onUpdate: (meetings: Meeting[]) => void) {
  return onSnapshot(collection(db, 'meetings'), (snapshot) => {
    const list: Meeting[] = [];
    snapshot.forEach((doc) => {
      list.push({ ...(doc.data() as Meeting), id: doc.id });
    });
    // Sort descending by createdAt
    list.sort((a, b) => b.createdAt - a.createdAt);
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'meetings');
    onUpdate([]);
  });
}

export async function addOrUpdateMeeting(meeting: Meeting) {
  try {
    await setDoc(doc(db, 'meetings', meeting.id), meeting);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `meetings/${meeting.id}`);
  }
}

export async function deleteMeetingDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'meetings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `meetings/${id}`);
  }
}





