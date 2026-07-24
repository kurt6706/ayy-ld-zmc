/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Local Session Management (Firebase completely removed)

const AUTH_KEY = 'aymc_active_session_user';

let currentSessionUser: any = (() => {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

const listeners: Array<(user: any) => void> = [];

function notifyListeners() {
  listeners.forEach((cb) => cb(currentSessionUser));
}

// Automatically log in anonymously
export async function loginAnonymously(): Promise<any> {
  if (currentSessionUser) {
    return currentSessionUser;
  }
  const anonUser = {
    uid: `anon-${Date.now()}`,
    displayName: 'Konuk Sürücü',
    isAnonymous: true,
    email: '',
    photoURL: '',
    providerId: 'local'
  };
  currentSessionUser = anonUser;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(anonUser));
  } catch (e) {
    console.error(e);
  }
  notifyListeners();
  return anonUser;
}

// Sign out current user
export async function logoutUser(): Promise<void> {
  currentSessionUser = null;
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error(e);
  }
  notifyListeners();
}

// Subscribe to auth state changes
export function subscribeAuthState(callback: (user: any) => void) {
  listeners.push(callback);
  callback(currentSessionUser);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export async function loginWithGoogle(): Promise<any> {
  throw new Error("Google ile giriş sistemi kaldırılmıştır. Lütfen GitHub veya Kullanıcı Adı ile giriş yapın.");
}
