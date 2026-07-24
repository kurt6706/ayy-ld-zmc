/**
 * Hostinger MySQL PHP API Integration Service
 * Base API Endpoint: https://aymk.org/api/
 * Upload Paths: /public_html/uploads/images & /public_html/uploads/videos
 */

import { Event, Route, BlogPost, UserPost, GalleryItem, Meeting, User } from '../types';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' ? process.env : {};

export const PHP_API_BASE = metaEnv?.VITE_PHP_API_URL || procEnv?.VITE_PHP_API_URL || 'https://aymk.org/api';

async function fetchJson<T>(url: string, options: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn(`PHP API response not OK [${res.status}] for ${url}`);
      return fallback;
    }
    const data = await res.json();
    return (data.data || data) as T;
  } catch (err) {
    console.warn(`PHP API fetch error for ${url}:`, err);
    return fallback;
  }
}

async function postJson<T>(url: string, body: any): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      return { success: false, error: result.error || `HTTP ${res.status}` };
    }
    return { success: true, data: result.data || result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucu bağlantı hatası' };
  }
}

/**
 * Upload Image or Video to Hostinger Server
 * Images -> /public_html/uploads/images
 * Videos -> /public_html/uploads/videos
 */
export async function uploadMediaToHostinger(file: File, type: 'image' | 'video'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const res = await fetch(`${PHP_API_BASE}/upload.php`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Yükleme başarısız oldu (${res.status})`);
    }

    const data = await res.json();
    if (data.url) {
      return data.url;
    } else if (data.filePath) {
      return `https://aymk.org/${data.filePath.replace(/^\/?public_html\//, '')}`;
    }
    throw new Error(data.error || 'Yükleme URL bilgisi alınamadı');
  } catch (err) {
    console.warn("Hostinger upload warning, using local ObjectURL or Base64 fallback:", err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// ================= API CALLS =================

export async function apiGetUsers(): Promise<User[]> {
  return fetchJson<User[]>(`${PHP_API_BASE}/users.php?action=list`, {}, []);
}

export async function apiSaveUser(user: Partial<User>): Promise<{ success: boolean; error?: string }> {
  return postJson(`${PHP_API_BASE}/users.php?action=save`, user);
}

export async function apiDeleteUser(userId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/users.php?action=delete`, { id: userId });
}

export async function apiGetEvents(): Promise<Event[]> {
  return fetchJson<Event[]>(`${PHP_API_BASE}/events.php?action=list`, {}, []);
}

export async function apiSaveEvent(event: Event): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/events.php?action=save`, event);
}

export async function apiDeleteEvent(eventId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/events.php?action=delete`, { id: eventId });
}

export async function apiGetRoutes(): Promise<Route[]> {
  return fetchJson<Route[]>(`${PHP_API_BASE}/routes.php?action=list`, {}, []);
}

export async function apiSaveRoute(route: Route): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/routes.php?action=save`, route);
}

export async function apiDeleteRoute(routeId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/routes.php?action=delete`, { id: routeId });
}

export async function apiGetBlogPosts(): Promise<BlogPost[]> {
  return fetchJson<BlogPost[]>(`${PHP_API_BASE}/news.php?action=list`, {}, []);
}

export async function apiSaveBlogPost(post: BlogPost): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/news.php?action=save`, post);
}

export async function apiDeleteBlogPost(postId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/news.php?action=delete`, { id: postId });
}

export async function apiGetUserPosts(): Promise<UserPost[]> {
  return fetchJson<UserPost[]>(`${PHP_API_BASE}/forum.php?action=list`, {}, []);
}

export async function apiSaveUserPost(post: UserPost): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/forum.php?action=save`, post);
}

export async function apiDeleteUserPost(postId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/forum.php?action=delete`, { id: postId });
}

export async function apiGetGalleryItems(): Promise<GalleryItem[]> {
  return fetchJson<GalleryItem[]>(`${PHP_API_BASE}/gallery.php?action=list`, {}, []);
}

export async function apiSaveGalleryItem(item: GalleryItem): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/gallery.php?action=save`, item);
}

export async function apiDeleteGalleryItem(itemId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/gallery.php?action=delete`, { id: itemId });
}

export async function apiGetAnnouncements(): Promise<any[]> {
  return fetchJson<any[]>(`${PHP_API_BASE}/announcements.php?action=list`, {}, []);
}

export async function apiSaveAnnouncement(announcement: any): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/announcements.php?action=save`, announcement);
}

export async function apiDeleteAnnouncement(announcementId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/announcements.php?action=delete`, { id: announcementId });
}

export async function apiGetDirectMessages(): Promise<any[]> {
  return fetchJson<any[]>(`${PHP_API_BASE}/messages.php?action=list`, {}, []);
}

export async function apiSendDirectMessage(msg: any): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/messages.php?action=send`, msg);
}

export async function apiGetMeetings(): Promise<Meeting[]> {
  return fetchJson<Meeting[]>(`${PHP_API_BASE}/meetings.php?action=list`, {}, []);
}

export async function apiSaveMeeting(meeting: Meeting): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/meetings.php?action=save`, meeting);
}

export async function apiDeleteMeeting(meetingId: string): Promise<{ success: boolean }> {
  return postJson(`${PHP_API_BASE}/meetings.php?action=delete`, { id: meetingId });
}
