import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderUid: string;
  createdAt: any; // Can be Timestamp or serverTimestamp() object or Date or number
  photoURL?: string;
  edited?: boolean;
  deleted?: boolean;
  mediaType?: 'text' | 'audio' | 'video' | 'image';
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface ChatUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  statusText?: string;
  lastSeen?: number; // timestamp
  isOnline?: boolean;
}

export interface TypingState {
  uid: string;
  name: string;
  isTyping: boolean;
  timestamp: number;
}

export interface VoiceChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  password?: string;
  roleRestriction?: string; // 'admin' | 'member' etc.
  isLocked?: boolean;
  isStatic?: boolean;
}

export interface VoiceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  activeChannelId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  lastActiveTime: number;
  isServerMuted?: boolean;
  role?: string;
}

export type Theme = 'light' | 'dark';

// --- ORIGINAL APPLICATION TYPES PRESERVED TO PREVENT COMPILE ISSUES ---

export interface UserProfileData {
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  maritalStatus?: string;
  hometown?: string;
  motoBrand?: string;
  motoModel?: string;
  motoYear?: string;
  bloodType?: string;
  emergencyContacts?: string;
  phoneNumbers?: string;
}

export interface UserProfilePrivacy {
  age?: boolean;
  height?: boolean;
  weight?: boolean;
  gender?: boolean;
  maritalStatus?: boolean;
  hometown?: boolean;
  motoBrand?: boolean;
  motoModel?: boolean;
  motoYear?: boolean;
  bloodType?: boolean;
  emergencyContacts?: boolean;
  phoneNumbers?: boolean;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  password?: string;
  role: 'admin' | 'member';
  status?: 'pending' | 'approved' | 'rejected';
  profile?: UserProfileData;
  privacy?: UserProfilePrivacy;
  avatarUrl?: string;
  statusText?: string;
  googleId?: string;
  email?: string;
}

export interface UserPost {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  coordinates: string; // for map marker
  status: 'upcoming' | 'ongoing' | 'past';
  attendeesCount: number;
  description: string;
  routeLink?: string;
  gmapsLink: string;
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  estimatedHours: number;
  roadCondition: 'Premium Asfalt' | 'Virajlı / Dar' | 'Manzaralı / Virajlı' | 'Stabilize / Macera';
  fuelRate: number; // Liters per 100km
  stops: string[];
  gpsUrl: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  elevation: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: 'Duyuru' | 'Sürüş Günlüğü' | 'Teknik Bilgi' | 'Sosyal Sorumluluk';
  date: string;
  author: string;
  tags: string[];
  comments: BlogComment[];
  likes: number;
}

export interface BlogComment {
  id: string;
  author: string;
  text: string;
  date: string;
}



export interface ClubRule {
  id: string;
  category: 'Genel' | 'Sürüş' | 'Konvoy' | 'Güvenlik';
  title: string;
  description: string;
}

export interface HandSignal {
  id: string;
  name: string;
  description: string;
  icon: string; // symbol or name for layout rendering
}

export interface MembershipApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  emergencyContact: string;
  motorcycleModel: string;
  licenseClass: string;
  photoUrl?: string;
  kvkkApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: string;
  description: string;
  date: string;
  type: 'image' | 'video';
  uploadedBy?: string;
  uploaderUid?: string;
  fileName?: string;
  storagePath?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  reason: string;
  time: string;
  link: string;
  createdAt: number;
  createdByName?: string;
  status: 'active' | 'completed';
}

