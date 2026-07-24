/**
 * Hostinger PHP API Helper Functions
 * Base Endpoint: VITE_PHP_API_URL (Defaults to https://aymk.org/api)
 */

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' ? process.env : {};

export const API_BASE_URL = 
  metaEnv?.VITE_PHP_API_URL || 
  procEnv?.VITE_PHP_API_URL || 
  'https://aymk.org/api';

/**
 * Generic fetch wrapper for Hostinger PHP API endpoints
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API Hatası [${response.status}]: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Perform a GET request to PHP API
 */
export async function apiGet<T = any>(endpoint: string, params?: Record<string, string>): Promise<T> {
  let queryStr = '';
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    queryStr = `?${searchParams.toString()}`;
  }
  return apiFetch<T>(`${endpoint}${queryStr}`, { method: 'GET' });
}

/**
 * Perform a POST request to PHP API
 */
export async function apiPost<T = any>(endpoint: string, body: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

// Specific API Endpoint Wrappers

export async function loginUser(credentials: { username: string; password?: string }) {
  return apiPost('/login.php', credentials);
}

export async function registerUser(userData: any) {
  return apiPost('/users.php?action=save', userData);
}

export async function getEvents() {
  return apiGet('/events.php?action=list');
}

export async function saveEvent(eventData: any) {
  return apiPost('/events.php?action=save', eventData);
}

export async function deleteEvent(eventId: string) {
  return apiPost('/events.php?action=delete', { id: eventId });
}

export async function getNews() {
  return apiGet('/news.php?action=list');
}

export async function getGallery() {
  return apiGet('/gallery.php?action=list');
}

export async function getForumPosts() {
  return apiGet('/forum.php?action=list');
}

export async function uploadMedia(file: File, type: 'image' | 'video' = 'image') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return apiPost('/upload.php', formData);
}
