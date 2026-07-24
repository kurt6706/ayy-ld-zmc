/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Event, Route, BlogPost, UserPost, GalleryItem, Meeting } from '../types';
import { DEFAULT_EVENTS, DEFAULT_ROUTES, DEFAULT_BLOG, DEFAULT_GALLERY_ITEMS } from '../data';

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('aymc_service_channel') 
  : null;

function broadcast(type: string, payload?: any) {
  if (channel) {
    channel.postMessage({ type, payload });
  }
}

function getStoreItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`aymc_svc_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoreItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(`aymc_svc_${key}`, JSON.stringify(value));
    broadcast(key, value);
  } catch (err) {
    console.error('Error setting store item:', key, err);
  }
}

const listeners: Record<string, Set<Function>> = {};

function listenKey(key: string, callback: Function) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(callback);
  return () => {
    listeners[key]?.delete(callback);
  };
}

function notifyKey(key: string) {
  const data = getStoreItem(key, []);
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
    if (e.key && e.key.startsWith('aymc_svc_')) {
      const key = e.key.replace('aymc_svc_', '');
      notifyKey(key);
    }
  });
}

export async function testFirestoreConnection() {
  return true;
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
    avatarUrl: 'https://github.com/kduzlu.png',
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

export async function bootstrapDatabaseIfEmpty() {
  if (!localStorage.getItem('aymc_svc_users')) {
    setStoreItem('users', DEFAULT_USERS);
  }
  if (!localStorage.getItem('aymc_svc_events')) {
    setStoreItem('events', DEFAULT_EVENTS);
  }
  if (!localStorage.getItem('aymc_svc_routes')) {
    setStoreItem('routes', DEFAULT_ROUTES);
  }
  if (!localStorage.getItem('aymc_svc_blogPosts')) {
    setStoreItem('blogPosts', DEFAULT_BLOG);
  }
  if (!localStorage.getItem('aymc_svc_galleryItems')) {
    setStoreItem('galleryItems', DEFAULT_GALLERY_ITEMS);
  }
}

// USERS
export function subscribeUsers(onUpdate: (users: any[]) => void) {
  const users = getStoreItem('users', DEFAULT_USERS);
  onUpdate(users);
  return listenKey('users', (data: any[]) => onUpdate(data));
}

export async function addOrUpdateUser(user: any): Promise<void> {
  const users = getStoreItem<any[]>('users', DEFAULT_USERS);
  const idx = users.findIndex((u) => u.id === user.id);
  let updated: any[];
  if (idx !== -1) {
    updated = [...users];
    updated[idx] = { ...updated[idx], ...user };
  } else {
    updated = [...users, user];
  }
  setStoreItem('users', updated);
  notifyKey('users');
}

export async function deleteUserDoc(userId: string): Promise<void> {
  const users = getStoreItem<any[]>('users', DEFAULT_USERS);
  const updated = users.filter((u) => u.id !== userId);
  setStoreItem('users', updated);
  notifyKey('users');
}

// EVENTS
export function subscribeEvents(onUpdate: (events: Event[]) => void) {
  const events = getStoreItem('events', DEFAULT_EVENTS);
  onUpdate(events);
  return listenKey('events', (data: Event[]) => onUpdate(data));
}

export async function addOrUpdateEvent(event: Event): Promise<void> {
  const events = getStoreItem<Event[]>('events', DEFAULT_EVENTS);
  const idx = events.findIndex((e) => e.id === event.id);
  let updated: Event[];
  if (idx !== -1) {
    updated = [...events];
    updated[idx] = { ...updated[idx], ...event };
  } else {
    updated = [...events, event];
  }
  setStoreItem('events', updated);
  notifyKey('events');
}

export async function deleteEventDoc(eventId: string): Promise<void> {
  const events = getStoreItem<Event[]>('events', DEFAULT_EVENTS);
  const updated = events.filter((e) => e.id !== eventId);
  setStoreItem('events', updated);
  notifyKey('events');
}

// ROUTES
export function subscribeRoutes(onUpdate: (routes: Route[]) => void) {
  const routes = getStoreItem('routes', DEFAULT_ROUTES);
  onUpdate(routes);
  return listenKey('routes', (data: Route[]) => onUpdate(data));
}

export async function addOrUpdateRoute(route: Route): Promise<void> {
  const routes = getStoreItem<Route[]>('routes', DEFAULT_ROUTES);
  const idx = routes.findIndex((r) => r.id === route.id);
  let updated: Route[];
  if (idx !== -1) {
    updated = [...routes];
    updated[idx] = { ...updated[idx], ...route };
  } else {
    updated = [...routes, route];
  }
  setStoreItem('routes', updated);
  notifyKey('routes');
}

export async function deleteRouteDoc(routeId: string): Promise<void> {
  const routes = getStoreItem<Route[]>('routes', DEFAULT_ROUTES);
  const updated = routes.filter((r) => r.id !== routeId);
  setStoreItem('routes', updated);
  notifyKey('routes');
}

// BLOG POSTS
export function subscribeBlogPosts(onUpdate: (posts: BlogPost[]) => void) {
  const blogPosts = getStoreItem('blogPosts', DEFAULT_BLOG);
  onUpdate(blogPosts);
  return listenKey('blogPosts', (data: BlogPost[]) => onUpdate(data));
}

export async function addOrUpdateBlogPost(post: BlogPost): Promise<void> {
  const posts = getStoreItem<BlogPost[]>('blogPosts', DEFAULT_BLOG);
  const idx = posts.findIndex((p) => p.id === post.id);
  let updated: BlogPost[];
  if (idx !== -1) {
    updated = [...posts];
    updated[idx] = { ...updated[idx], ...post };
  } else {
    updated = [...posts, post];
  }
  setStoreItem('blogPosts', updated);
  notifyKey('blogPosts');
}

export async function deleteBlogPostDoc(postId: string): Promise<void> {
  const posts = getStoreItem<BlogPost[]>('blogPosts', DEFAULT_BLOG);
  const updated = posts.filter((p) => p.id !== postId);
  setStoreItem('blogPosts', updated);
  notifyKey('blogPosts');
}

// USER POSTS
export function subscribeUserPosts(onUpdate: (posts: UserPost[]) => void) {
  const userPosts = getStoreItem<UserPost[]>('userPosts', []);
  onUpdate(userPosts);
  return listenKey('userPosts', (data: UserPost[]) => onUpdate(data));
}

export async function addOrUpdateUserPost(post: UserPost): Promise<void> {
  const posts = getStoreItem<UserPost[]>('userPosts', []);
  const idx = posts.findIndex((p) => p.id === post.id);
  let updated: UserPost[];
  if (idx !== -1) {
    updated = [...posts];
    updated[idx] = { ...updated[idx], ...post };
  } else {
    updated = [post, ...posts];
  }
  setStoreItem('userPosts', updated);
  notifyKey('userPosts');
}

export async function deleteUserPostDoc(postId: string): Promise<void> {
  const posts = getStoreItem<UserPost[]>('userPosts', []);
  const updated = posts.filter((p) => p.id !== postId);
  setStoreItem('userPosts', updated);
  notifyKey('userPosts');
}

// GALLERY ITEMS
export function subscribeGalleryItems(onUpdate: (items: GalleryItem[]) => void) {
  const items = getStoreItem('galleryItems', DEFAULT_GALLERY_ITEMS);
  onUpdate(items);
  return listenKey('galleryItems', (data: GalleryItem[]) => onUpdate(data));
}

export async function addOrUpdateGalleryItem(item: GalleryItem): Promise<void> {
  const items = getStoreItem<GalleryItem[]>('galleryItems', DEFAULT_GALLERY_ITEMS);
  const idx = items.findIndex((i) => i.id === item.id);
  let updated: GalleryItem[];
  if (idx !== -1) {
    updated = [...items];
    updated[idx] = { ...updated[idx], ...item };
  } else {
    updated = [item, ...items];
  }
  setStoreItem('galleryItems', updated);
  notifyKey('galleryItems');
}

export async function deleteGalleryItemDoc(itemId: string): Promise<void> {
  const items = getStoreItem<GalleryItem[]>('galleryItems', DEFAULT_GALLERY_ITEMS);
  const updated = items.filter((i) => i.id !== itemId);
  setStoreItem('galleryItems', updated);
  notifyKey('galleryItems');
}

// ANNOUNCEMENTS
export function subscribeAnnouncements(onUpdate: (items: any[]) => void) {
  const announcements = getStoreItem<any[]>('announcements', []);
  onUpdate(announcements);
  return listenKey('announcements', (data: any[]) => onUpdate(data));
}

export async function addOrUpdateAnnouncement(announcement: any): Promise<void> {
  const announcements = getStoreItem<any[]>('announcements', []);
  const idx = announcements.findIndex((a) => a.id === announcement.id);
  let updated: any[];
  if (idx !== -1) {
    updated = [...announcements];
    updated[idx] = { ...updated[idx], ...announcement };
  } else {
    updated = [announcement, ...announcements];
  }
  setStoreItem('announcements', updated);
  notifyKey('announcements');
}

export async function deleteAnnouncementDoc(announcementId: string): Promise<void> {
  const announcements = getStoreItem<any[]>('announcements', []);
  const updated = announcements.filter((a) => a.id !== announcementId);
  setStoreItem('announcements', updated);
  notifyKey('announcements');
}

// DIRECT MESSAGES
export function subscribeDirectMessages(onUpdate: (msgs: any[]) => void) {
  const msgs = getStoreItem<any[]>('directMessages', []);
  onUpdate(msgs);
  return listenKey('directMessages', (data: any[]) => onUpdate(data));
}

export async function addDirectMessageDoc(message: any): Promise<void> {
  const msgs = getStoreItem<any[]>('directMessages', []);
  const updated = [...msgs, message];
  setStoreItem('directMessages', updated);
  notifyKey('directMessages');
}

export async function markDirectMessageAsRead(msgId: string): Promise<void> {
  const msgs = getStoreItem<any[]>('directMessages', []);
  const updated = msgs.map((m) => m.id === msgId ? { ...m, read: true } : m);
  setStoreItem('directMessages', updated);
  notifyKey('directMessages');
}

export async function markDirectMessagesAsRead(senderIdOrIds: string[] | string, receiverId?: string): Promise<void> {
  const msgs = getStoreItem<any[]>('directMessages', []);
  let updated: any[];
  if (receiverId && typeof senderIdOrIds === 'string') {
    updated = msgs.map((m) => (m.senderId === senderIdOrIds && m.receiverId === receiverId) ? { ...m, read: true } : m);
  } else {
    const ids = Array.isArray(senderIdOrIds) ? senderIdOrIds : [senderIdOrIds];
    updated = msgs.map((m) => ids.includes(m.id) ? { ...m, read: true } : m);
  }
  setStoreItem('directMessages', updated);
  notifyKey('directMessages');
}

// MEETINGS
export function subscribeMeetings(onUpdate: (meetings: Meeting[]) => void) {
  const meetings = getStoreItem<Meeting[]>('meetings', []);
  onUpdate(meetings);
  return listenKey('meetings', (data: Meeting[]) => onUpdate(data));
}

export async function addOrUpdateMeeting(meeting: Meeting): Promise<void> {
  const meetings = getStoreItem<Meeting[]>('meetings', []);
  const idx = meetings.findIndex((m) => m.id === meeting.id);
  let updated: Meeting[];
  if (idx !== -1) {
    updated = [...meetings];
    updated[idx] = { ...updated[idx], ...meeting };
  } else {
    updated = [meeting, ...meetings];
  }
  setStoreItem('meetings', updated);
  notifyKey('meetings');
}

export async function deleteMeetingDoc(meetingId: string): Promise<void> {
  const meetings = getStoreItem<Meeting[]>('meetings', []);
  const updated = meetings.filter((m) => m.id !== meetingId);
  setStoreItem('meetings', updated);
  notifyKey('meetings');
}
