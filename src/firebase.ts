/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure local compatibility layer replacing Firebase completely

export const db: any = {
  type: 'local'
};

export const auth: any = {
  currentUser: null,
  signOut: async () => {},
  onAuthStateChanged: (cb: any) => {
    cb(null);
    return () => {};
  }
};

export const storage: any = {};
export const googleAuthProvider: any = {};

export function translateFirebaseError(error: any): string {
  if (!error) return 'Bilinmeyen bir hata oluştu.';
  const message = typeof error === 'string' ? error : (error.message || '');
  return message || 'Bir hata oluştu.';
}

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
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn('Local Storage Notice:', error, operationType, path);
}
