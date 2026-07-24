import { 
  signInAnonymously, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleAuthProvider, translateFirebaseError } from './firebase';

// Automatically log in anonymously if there is no session
export async function loginAnonymously(): Promise<User> {
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error: any) {
    console.warn("Anonymous authentication failed, using guest session:", error);
    const mockUser = {
      uid: 'guest-default-uid',
      displayName: 'Konuk Sürücü',
      isAnonymous: true,
      email: '',
      photoURL: '',
      phoneNumber: null,
      providerId: 'firebase',
      uid_mocked: true,
      emailVerified: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({}) as any,
      reload: async () => {},
      toJSON: () => ({}),
    } as unknown as User;
    return mockUser;
  }
}

// Log in via Google Popup
export async function loginWithGoogle(): Promise<User> {
  try {
    const credential = await signInWithPopup(auth, googleAuthProvider);
    return credential.user;
  } catch (error: any) {
    console.error("Google authentication failed:", error);
    throw new Error(translateFirebaseError(error));
  }
}

// Sign out current user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign out failed:", error);
    throw new Error(translateFirebaseError(error));
  }
}

// Subscribe to auth state changes
export function subscribeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  }, (error) => {
    console.error("Auth state subscription error:", error);
  });
}
