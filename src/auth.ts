/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleAuthProvider } from './firebase';

const LOCAL_SESSION_KEY = 'aymc_active_session_user';

let currentSessionUser: any = (() => {
  try {
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

const listeners: Array<(user: any) => void> = [];

function notifyListeners(user: any) {
  listeners.forEach((cb) => cb(user));
}

// Google Sign-In
export async function loginWithGoogle(): Promise<any> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const user = result.user;
    const formattedUser = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Sürücü',
      email: user.email,
      photoURL: user.photoURL || '',
      isAnonymous: false,
      providerId: 'google.com'
    };
    currentSessionUser = formattedUser;
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(formattedUser));
    notifyListeners(formattedUser);
    return formattedUser;
  } catch (error: any) {
    console.error('Google login error:', error);
    throw error;
  }
}

// Anonymous / Guest Login
export async function loginAnonymously(): Promise<any> {
  try {
    let fUser: any = null;
    try {
      const res = await signInAnonymously(auth);
      fUser = res.user;
    } catch {
      // Fallback if anonymous auth is disabled on project
      fUser = {
        uid: `anon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        isAnonymous: true,
      };
    }

    const formattedUser = {
      uid: fUser.uid,
      displayName: fUser.displayName || 'Konuk Sürücü',
      isAnonymous: true,
      email: '',
      photoURL: '',
      providerId: 'anonymous'
    };
    currentSessionUser = formattedUser;
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(formattedUser));
    notifyListeners(formattedUser);
    return formattedUser;
  } catch (e: any) {
    console.error('Anonymous login error:', e);
    throw e;
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Signout error:', e);
  }
  currentSessionUser = null;
  localStorage.removeItem(LOCAL_SESSION_KEY);
  notifyListeners(null);
}

// Subscribe to Auth State
export function subscribeAuthState(callback: (user: any) => void) {
  listeners.push(callback);

  const unsubscribeFirebase = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      const formattedUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Sürücü',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        isAnonymous: fbUser.isAnonymous,
        providerId: fbUser.providerData[0]?.providerId || (fbUser.isAnonymous ? 'anonymous' : 'firebase')
      };
      currentSessionUser = formattedUser;
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(formattedUser));
      callback(formattedUser);
    } else {
      // Check local storage fallback session (e.g., custom username, github, etc.)
      callback(currentSessionUser);
    }
  });

  // Emit current state immediately
  callback(currentSessionUser);

  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
    unsubscribeFirebase();
  };
}

