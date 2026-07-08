import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App gracefully
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase App initialization failed:", error);
}

export const db = getFirestore(app!, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app!);
export const googleAuthProvider = new GoogleAuthProvider();

// Enable multi-tab offline support for Firestore (strongly requested!)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore offline persistence failed-precondition: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore offline persistence unimplemented in this browser.");
    }
  });
} catch (err) {
  console.warn("Could not enable offline support:", err);
}

// Map Firebase Error codes to user-friendly Turkish descriptions
export function translateFirebaseError(error: any): string {
  if (!error) return 'Bilinmeyen bir hata oluştu.';
  
  const errorCode = error.code || error.message || '';
  
  if (errorCode.includes('permission-denied') || errorCode.includes('insufficient permissions')) {
    return 'Yetki Hatası: Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz. Lütfen giriş yaptığınızdan emin olun.';
  }
  if (errorCode.includes('failed-precondition')) {
    return 'Yapılandırma Hatası: İşlem öncesi gerekli koşullar sağlanamadı.';
  }
  if (errorCode.includes('not-found')) {
    return 'Bulunamadı: İstenen kayıt veya doküman mevcut değil.';
  }
  if (errorCode.includes('auth/network-request-failed') || errorCode.includes('unavailable') || errorCode.includes('network')) {
    return 'Bağlantı Hatası: Ağ bağlantısı kurulamadı. Çevrimdışı modda olabilirsiniz.';
  }
  if (errorCode.includes('auth/invalid-credential')) {
    return 'Giriş Hatası: Geçersiz kimlik bilgileri.';
  }
  if (errorCode.includes('auth/user-disabled')) {
    return 'Giriş Hatası: Bu kullanıcı hesabı askıya alınmıştır.';
  }
  if (errorCode.includes('auth/popup-closed-by-user')) {
    return 'Giriş İptal Edildi: Google giriş penceresi kapatıldı.';
  }
  
  return `Bir hata oluştu: ${error.message || errorCode}`;
}

// --- PRESERVED BACKWARD COMPATIBLE EXPORTS ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
