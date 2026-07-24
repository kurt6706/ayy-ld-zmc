/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure local compatibility layer replacing Firebase Admin completely

export const adminAuth: any = {
  verifyIdToken: async (token: string) => {
    return {
      uid: token || 'user-admin',
      email: 'admin@aymc.org.tr',
      name: 'Yönetici'
    };
  }
};

export const getApps = () => [];
export const initializeApp = () => ({});
