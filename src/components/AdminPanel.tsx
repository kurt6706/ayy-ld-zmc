/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, LayoutDashboard, Users, Calendar, Plus, RefreshCw, LogOut, Check, X, FileText, Map, Image, Edit3, Trash2, ArrowLeft, MessageSquare, Image as ImageIcon, UploadCloud, Play, Info, UserPlus, CheckCircle, Github } from 'lucide-react';
import { Event, Route, BlogPost, UserPost, GalleryItem } from '../types';
import { IMAGES } from '../data';
import { addOrUpdateUserPost, deleteUserPostDoc, addOrUpdateUser, deleteUserDoc, addOrUpdateGalleryItem } from '../lib/firebaseService';
import { translateFirebaseError } from '../firebase';

interface AdminPanelProps {
  onAddEvent: (evt: Event) => void;
  onAddRoute: (rt: Route) => void;
  onAddBlogPost: (post: BlogPost) => void;
  users?: any[];
  setUsers?: (users: any[]) => void;
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
  userPosts?: UserPost[];
}

const PROFILE_FIELDS = [
  { key: 'age', label: 'Yaş' },
  { key: 'height', label: 'Boy' },
  { key: 'weight', label: 'Kilo' },
  { key: 'gender', label: 'Cinsiyet' },
  { key: 'maritalStatus', label: 'Medeni Hali' },
  { key: 'hometown', label: 'Nereli' },
  { key: 'motoBrand', label: 'Motor Markası' },
  { key: 'motoModel', label: 'Motor Modeli' },
  { key: 'motoYear', label: 'Motor Yılı' },
  { key: 'bloodType', label: 'Kan Grubu' },
  { key: 'emergencyContacts', label: 'Acil Durumda Aranacak Kişiler' },
  { key: 'phoneNumbers', label: 'Telefon Numaraları' },
];

const resizeAvatar = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 250; // Keep avatars beautifully small and extremely lightweight
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Resim yüklenirken hata oluştu.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
};

const resizeGalleryImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1000; // Beautiful gallery dimensions & extremely lightweight
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Resim yüklenirken hata oluştu.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
};

export default function AdminPanel({
  onAddEvent,
  onAddRoute,
  onAddBlogPost,
  users = [],
  setUsers = () => {},
  currentUser,
  setCurrentUser = () => {},
  userPosts = [],
}: AdminPanelProps) {
  // Authentication & Member Sign-Up State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auth Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMotorcycle, setRegMotorcycle] = useState('');
  const [regBloodType, setRegBloodType] = useState('0 Rh+');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#register' || window.location.hash === '#uye-ol') {
        setAuthMode('register');
      } else if (window.location.hash === '#login' || window.location.hash === '#giris') {
        setAuthMode('login');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccessMsg('');

    if (!regUsername.trim() || !regPassword.trim()) {
      setLoginError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }

    if (regPassword.length < 4) {
      setLoginError('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    const usernameExists = users?.some(u => u.username?.toLowerCase() === regUsername.trim().toLowerCase());
    if (usernameExists) {
      setLoginError('Bu kullanıcı adı zaten kullanılmaktadır. Lütfen farklı bir kullanıcı adı seçin.');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: regName.trim() || regUsername.trim(),
      surname: regSurname.trim() || '',
      username: regUsername.trim(),
      email: regEmail.trim() || '',
      password: regPassword.trim(),
      role: 'member',
      status: 'pending',
      motorcycle: regMotorcycle.trim(),
      bloodType: regBloodType,
      phone: regPhone.trim(),
      githubUsername: regUsername.trim(),
      githubUrl: `https://github.com/${regUsername.trim()}`,
      avatarUrl: `https://github.com/${regUsername.trim()}.png`,
      profile: {
        motoBrand: regMotorcycle.trim(),
        bloodType: regBloodType,
        phoneNumbers: regPhone.trim(),
      },
      privacy: {}
    };

    try {
      await addOrUpdateUser(newUser);
      if (setUsers && users) {
        setUsers([...users, newUser]);
      }
      setRegSuccessMsg('Üyelik başvurunuz başarıyla oluşturuldu! Yönetici onayından sonra kullanıcı adınız ve şifrenizle giriş yapabilirsiniz.');
      setRegName('');
      setRegSurname('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegMotorcycle('');
      setRegPhone('');
    } catch (err: any) {
      setLoginError('Kayıt oluşturulurken bir hata oluştu: ' + (err.message || err));
    }
  };

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'add-event' | 'add-blog' | 'add-route' | 'create-user' | 'list-users' | 'pending-users' | 'edit-user' | 'upload-media'>('list-users');

  // Media Upload States for Gallery
  const [mediaUploadType, setMediaUploadType] = useState<'file' | 'instagram' | 'youtube'>('file');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [mediaUploadStatus, setMediaUploadStatus] = useState('Yükleniyor...');
  const [mediaErrorMsg, setMediaErrorMsg] = useState('');
  const [mediaSuccessMsg, setMediaSuccessMsg] = useState('');
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaDescription, setMediaDescription] = useState('');
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB

  // Input states for Add Event
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtImage, setEvtImage] = useState(IMAGES.coastalTour);
  const [successMsg, setSuccessMsg] = useState('');

  const [memberView, setMemberView] = useState<'dashboard' | 'edit-profile' | 'member-directory' | 'view-profile'>('dashboard');
  const [ownName, setOwnName] = useState('');
  const [ownSurname, setOwnSurname] = useState('');
  const [ownUsername, setOwnUsername] = useState('');
  const [ownPassword, setOwnPassword] = useState('');

  // Input states for Add Blog
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState<'Duyuru' | 'Sürüş Günlüğü' | 'Teknik Bilgi' | 'Sosyal Sorumluluk'>('Duyuru');
  const [blogTags, setBlogTags] = useState('');
  const [blogImage, setBlogImage] = useState<string>('');
  const [isCompressingBlogImage, setIsCompressingBlogImage] = useState<boolean>(false);

  // Input states for Add Route
  const [rtName, setRtName] = useState('');
  const [rtStart, setRtStart] = useState('');
  const [rtEnd, setRtEnd] = useState('');
  const [rtDistance, setRtDistance] = useState<number>(100);
  const [rtHours, setRtHours] = useState<number>(2);
  const [rtDifficulty, setRtDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Kolay');
  const [rtRoad, setRtRoad] = useState<'Premium Asfalt' | 'Virajlı / Dar' | 'Manzaralı / Virajlı' | 'Stabilize / Macera'>('Premium Asfalt');
  const [rtStops, setRtStops] = useState('');



  // Input states for Create/Edit User
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserSurname, setNewUserSurname] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');
  const [newUsernameField, setNewUsernameField] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [profData, setProfData] = useState<any>({});
  const [profPrivacy, setProfPrivacy] = useState<any>({});
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  // User list filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users?.find(u => u.username === username && u.password === password);
    if (foundUser) {
      if (foundUser.status === 'pending') {
        setLoginError('Hesabınız yönetici onayı bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.');
        return;
      }
      if (foundUser.status === 'rejected') {
        setLoginError('Hesabınız reddedildi.');
        return;
      }
      setCurrentUser(foundUser);
      setLoginError('');
      // Reset form
      setUsername('');
      setPassword('');
    } else {
      // Check if username already exists to avoid duplicate registrations on typo
      const usernameExists = users?.some(u => u.username === username);
      if (usernameExists) {
        setLoginError('Kullanıcı adı veya şifre hatalı.');
        return;
      }
      // Auto-register as pending member
      const newUser = {
        id: `user-${Date.now()}`,
        name: username, // Initially name is username
        surname: '',
        username: username,
        password: password,
        role: 'member',
        status: 'pending',
        profile: {},
        privacy: {}
      };
      
      if (setUsers && users) {
        setUsers([...users, newUser]);
        setLoginError('Hesabınız başarıyla oluşturuldu. Yöneticinin onaylaması bekleniyor.');
        setUsername('');
        setPassword('');
      } else {
        setLoginError('Kayıt oluşturulamadı.');
      }
    }
  };

  const processGithubUserLogin = async (ghUser: {
    id: string;
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    html_url?: string;
    bio?: string;
  }) => {
    try {
      setLoginError('');
      const cleanLogin = ghUser.login.trim();
      const isDefaultAdmin = cleanLogin.toLowerCase() === 'kduzlu' || ghUser.email === 'kduzlu@gmail.com' || cleanLogin.toLowerCase() === 'admin';
      
      let foundUser = users.find(u => 
        (u.githubUsername && u.githubUsername.toLowerCase() === cleanLogin.toLowerCase()) || 
        (u.username && u.username.toLowerCase() === cleanLogin.toLowerCase()) || 
        (ghUser.email && u.email === ghUser.email)
      );

      const avatarUrl = ghUser.avatar_url || `https://github.com/${cleanLogin}.png`;
      const githubUrl = ghUser.html_url || `https://github.com/${cleanLogin}`;

      if (foundUser) {
        const updated = {
          ...foundUser,
          githubUsername: cleanLogin,
          githubUrl: githubUrl,
          avatarUrl: avatarUrl || foundUser.avatarUrl || `https://github.com/${cleanLogin}.png`,
          email: ghUser.email || foundUser.email || `${cleanLogin}@users.noreply.github.com`,
          role: isDefaultAdmin ? 'admin' : foundUser.role,
          status: isDefaultAdmin ? 'approved' : foundUser.status,
          statusText: isDefaultAdmin ? 'Kurucu Üye / Töre Muhafızı' : (foundUser.statusText || `GitHub Üyesi (@${cleanLogin})`),
        };
        await addOrUpdateUser(updated);
        foundUser = updated;

        if (foundUser.status === 'pending') {
          setLoginError('Üyelik başvurunuz alındı. Yönetici onayından sonra giriş yapabilirsiniz.');
          return;
        }
        if (foundUser.status === 'rejected') {
          setLoginError('Başvurunuz reddedilmiştir.');
          return;
        }
        setCurrentUser(foundUser);
      } else {
        const newUser = {
          id: `github-${ghUser.id || Date.now()}`,
          name: ghUser.name ? ghUser.name.split(' ')[0] : cleanLogin,
          surname: ghUser.name && ghUser.name.split(' ').length > 1 ? ghUser.name.split(' ').slice(1).join(' ') : '',
          username: cleanLogin,
          password: '',
          role: isDefaultAdmin ? 'admin' : 'member',
          status: 'approved',
          githubUsername: cleanLogin,
          githubUrl: githubUrl,
          avatarUrl: avatarUrl,
          email: ghUser.email || `${cleanLogin}@users.noreply.github.com`,
          statusText: isDefaultAdmin ? 'Kurucu Üye / Töre Muhafızı' : `GitHub Üyesi (@${cleanLogin})`,
          bio: ghUser.bio || 'GitHub Kulüp Sürücüsü',
          profile: {
            motoBrand: 'Motosiklet Tutkunu',
            bloodType: '0 Rh+',
          },
          privacy: {}
        };
        await addOrUpdateUser(newUser);
        if (setUsers) {
          setUsers([...users, newUser]);
        }
        setCurrentUser(newUser);
      }
    } catch (err: any) {
      console.error("GitHub Login error:", err);
      setLoginError('GitHub girişi gerçekleştirilirken bir hata oluştu.');
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoginError('');
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();

      if (data.url) {
        window.open(data.url, 'github_oauth_popup', 'width=600,height=700');
      } else {
        const ghUsername = prompt('GitHub kullanıcı adınızı girin (örnek: kduzlu):');
        if (ghUsername && ghUsername.trim()) {
          const userRes = await fetch(`/api/github/user/${encodeURIComponent(ghUsername.trim())}`);
          const ghUserData = await userRes.json();
          await processGithubUserLogin(ghUserData);
        }
      }
    } catch (err: any) {
      console.error("GitHub auth error:", err);
      const ghUsername = prompt('GitHub kullanıcı adınızı girin (örnek: kduzlu):');
      if (ghUsername && ghUsername.trim()) {
        const clean = ghUsername.trim();
        await processGithubUserLogin({
          id: clean,
          login: clean,
          name: clean,
          avatar_url: `https://github.com/${clean}.png`,
          html_url: `https://github.com/${clean}`,
          bio: 'GitHub Sürücüsü'
        });
      }
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.githubUser) {
        await processGithubUserLogin(event.data.githubUser);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [users]);

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        setMediaErrorMsg('Dosya boyutu 300MB\'dan küçük olmalıdır.');
        return;
      }
      setSelectedMediaFile(file);
      setMediaErrorMsg('');
      setMediaSuccessMsg('');
    }
  };

  const handleMediaUpload = async () => {
    if (currentUser?.role !== 'admin') {
      setMediaErrorMsg('Yalnızca yöneticiler galeriye medya ekleyebilir.');
      return;
    }

    if (mediaUploadType === 'youtube') {
      if (!youtubeUrl) {
        setMediaErrorMsg('Lütfen geçerli bir YouTube linki giriniz.');
        return;
      }
      if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        setMediaErrorMsg('Lütfen geçerli bir YouTube (youtube.com veya youtu.be) linki girdiğinizden emin olun.');
        return;
      }
      setIsUploadingMedia(true);
      setMediaErrorMsg('');
      setMediaSuccessMsg('');
      try {
        const fileId = `gallery-yt-${Date.now()}`;
        const newItem: GalleryItem = {
          id: fileId,
          url: youtubeUrl,
          category: 'Videolar',
          description: mediaDescription || 'YouTube Video Paylaşımı',
          date: new Date().toISOString(),
          type: 'video',
          uploadedBy: currentUser?.displayName || currentUser?.name || 'Üye',
          uploaderUid: currentUser?.id || currentUser?.uid || 'guest-user',
        };

        await addOrUpdateGalleryItem(newItem);
        setMediaSuccessMsg('YouTube linki başarıyla eklendi ve galeride yayınlandı.');
        setYoutubeUrl('');
        setMediaDescription('');
      } catch (error: any) {
        console.error('YouTube link add error:', error);
        setMediaErrorMsg(error.message || 'YouTube linki eklenirken bir hata oluştu.');
      } finally {
        setIsUploadingMedia(false);
      }
      return;
    }

    if (mediaUploadType === 'instagram') {
      if (!instagramUrl) {
        setMediaErrorMsg('Lütfen geçerli bir Instagram linki giriniz.');
        return;
      }
      if (!instagramUrl.includes('instagram.com')) {
        setMediaErrorMsg('Lütfen geçerli bir Instagram (instagram.com) linki girdiğinizden emin olun.');
        return;
      }
      setIsUploadingMedia(true);
      setMediaErrorMsg('');
      setMediaSuccessMsg('');
      try {
        const fileId = `gallery-ig-${Date.now()}`;
        const newItem: GalleryItem = {
          id: fileId,
          url: instagramUrl,
          category: 'Videolar',
          description: mediaDescription || 'Instagram Paylaşımı',
          date: new Date().toISOString(),
          type: 'video',
          uploadedBy: currentUser?.displayName || currentUser?.name || 'Üye',
          uploaderUid: currentUser?.id || currentUser?.uid || 'guest-user',
        };

        await addOrUpdateGalleryItem(newItem);
        setMediaSuccessMsg('Instagram linki başarıyla eklendi ve galeride yayınlandı.');
        setInstagramUrl('');
        setMediaDescription('');
      } catch (error: any) {
        console.error('Instagram link add error:', error);
        setMediaErrorMsg(error.message || 'Instagram linki eklenirken bir hata oluştu.');
      } finally {
        setIsUploadingMedia(false);
      }
      return;
    }

    if (!selectedMediaFile) return;

    setIsUploadingMedia(true);
    setMediaErrorMsg('');
    setMediaSuccessMsg('');
    setMediaUploadProgress(0);
    setMediaUploadStatus('Yükleme başlatılıyor...');

    const file = selectedMediaFile;
    const fileType = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|flv|3gp|mpeg)$/i.test(file.name) ? 'video' : 'image';
    const fileId = `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (fileType === 'image') {
      try {
        setMediaUploadStatus('Görsel sıkıştırılıyor ve optimize ediliyor...');
        setMediaUploadProgress(15);
        
        // Compress & resize image client-side for maximum reliability and ultra-fast upload in sandbox environment
        const base64Data = await resizeGalleryImage(file);
        setMediaUploadProgress(60);
        setMediaUploadStatus('Galeride yayınlanıyor...');

        const newItem: GalleryItem = {
          id: fileId,
          url: base64Data,
          category: 'Fotoğraflar',
          description: mediaDescription || file.name,
          date: new Date().toISOString(),
          type: 'image',
          uploadedBy: currentUser?.displayName || currentUser?.name || 'Üye',
          uploaderUid: currentUser?.id || currentUser?.uid || 'guest-user',
        };

        await addOrUpdateGalleryItem(newItem);
        
        setMediaUploadProgress(100);
        setMediaSuccessMsg('Fotoğraf başarıyla yüklendi ve galeride yayınlandı.');
        setSelectedMediaFile(null);
        setMediaDescription('');
        setMediaUploadProgress(0);
      } catch (error: any) {
        console.error('Image base64 upload error:', error);
        setMediaErrorMsg(error.message || 'Görsel işlenirken veya yüklenirken bir hata oluştu.');
      } finally {
        setIsUploadingMedia(false);
      }
      return;
    }

    // Video Upload (Direct Base64 upload for files up to 20MB to completely bypass CORS/Sandbox blocks)
    if (file.size > 20 * 1024 * 1024) {
      setMediaErrorMsg('Video boyutu en fazla 20 MB olabilir. Lütfen daha küçük bir video dosyası seçin veya YouTube/Instagram linki ekleme özelliğini kullanın!');
      setIsUploadingMedia(false);
      return;
    }

    setMediaUploadStatus('Video okunuyor ve optimize ediliyor...');
    setMediaUploadProgress(20);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Video dosyası okunamadı.'));
        reader.readAsDataURL(file);
      });

      setMediaUploadProgress(60);
      setMediaUploadStatus('Galeride yayınlanıyor...');

      const newItem: GalleryItem = {
        id: fileId,
        url: base64Data,
        category: 'Videolar',
        description: mediaDescription || file.name,
        date: new Date().toISOString(),
        type: 'video',
        uploadedBy: currentUser?.displayName || currentUser?.name || 'Üye',
        uploaderUid: currentUser?.id || currentUser?.uid || 'guest-user',
      };

      await addOrUpdateGalleryItem(newItem);
      
      setMediaUploadProgress(100);
      setMediaSuccessMsg('Video başarıyla yüklendi ve galeride yayınlandı.');
      setSelectedMediaFile(null);
      setMediaDescription('');
      setMediaUploadProgress(0);
    } catch (error: any) {
      console.error('Video base64 upload error:', error);
      setMediaErrorMsg(error.message || 'Video işlenirken veya yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserSurname || !newUsernameField || !newUserPassword) {
      setLoginError('Tüm alanları doldurunuz.');
      return;
    }
    const exists = users?.some(u => u.username === newUsernameField);
    if (exists) {
      setLoginError('Bu kullanıcı adı zaten mevcut.');
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: newUserName,
      surname: newUserSurname,
      username: newUsernameField,
      password: newUserPassword,
      role: newUserRole,
      status: 'approved'
    };
    const saveUser = async () => {
      try {
        await addOrUpdateUser(newUser);
        triggerSuccess(`Kullanıcı "${newUsernameField}" başarıyla oluşturuldu.`);
      } catch (err: any) {
        setLoginError(`Kullanıcı oluşturulamadı: ${err.message || err}`);
      }
    };
    saveUser();
    // reset form
    setNewUserName('');
    setNewUserSurname('');
    setNewUsernameField('');
    setNewUserPassword('');
    setNewUserRole('member');
  };

  const handleEditUserClick = (u: any) => {
    setEditingUserId(u.id);
    setNewUserName(u.name);
    setNewUserSurname(u.surname);
    setNewUsernameField(u.username);
    setNewUserPassword(u.password || '');
    setNewUserRole(u.role);
    setProfData(u.profile || {});
    setProfPrivacy(u.privacy || {});
    setActiveTab('edit-user');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserSurname || !newUsernameField) {
      setLoginError('Ad, soyad ve kullanıcı adı alanları zorunludur.');
      return;
    }
    const exists = users?.some(u => u.username === newUsernameField && u.id !== editingUserId);
    if (exists) {
      setLoginError('Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.');
      return;
    }
    const originalUser = users?.find(u => u.id === editingUserId);
    if (originalUser) {
      const updatedUser = {
        ...originalUser,
        name: newUserName,
        surname: newUserSurname,
        username: newUsernameField,
        password: newUserPassword ? newUserPassword : originalUser.password,
        role: newUserRole,
        profile: profData,
        privacy: profPrivacy
      };
      
      const saveUpdate = async () => {
        try {
          await addOrUpdateUser(updatedUser);
          triggerSuccess(`Kullanıcı bilgileri güncellendi.`);
          setActiveTab('list-users');
        } catch (err: any) {
          setLoginError(`Güncelleme başarısız: ${err.message || err}`);
        }
      };
      saveUpdate();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      try {
        await deleteUserDoc(userId);
        triggerSuccess('Kullanıcı sistemden silindi.');
      } catch (err: any) {
        alert('Kullanıcı silinemedi: ' + err.message);
      }
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleEditOwnProfileClick = () => {
    setOwnName(currentUser.name);
    setOwnSurname(currentUser.surname);
    setOwnUsername(currentUser.username);
    setOwnPassword(currentUser.password || '');
    setProfData(currentUser.profile || {});
    setProfPrivacy(currentUser.privacy || {});
    setMemberView('edit-profile');
  };

  const handleUpdateOwnProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownName || !ownSurname || !ownUsername) {
      setLoginError('Ad, soyad ve kullanıcı adı alanları zorunludur.');
      return;
    }
    const exists = users?.some(u => u.username === ownUsername && u.id !== currentUser.id);
    if (exists) {
      setLoginError('Bu kullanıcı adı başka bir hesap tarafından kullanılıyor.');
      return;
    }
    if (setCurrentUser) {
      const updatedUser = {
        ...currentUser,
        name: ownName,
        surname: ownSurname,
        username: ownUsername,
        password: ownPassword ? ownPassword : currentUser.password,
        profile: profData,
        privacy: profPrivacy
      };
      
      const saveProfile = async () => {
        try {
          await addOrUpdateUser(updatedUser);
          setCurrentUser(updatedUser);
          setMemberView('dashboard');
          triggerSuccess('Profiliniz başarıyla güncellendi.');
        } catch (err: any) {
          setLoginError(`Profil güncellenemedi: ${err.message || err}`);
        }
      };
      saveProfile();
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDate || !evtLocation || !evtDescription) return;

    const newEvt: Event = {
      id: `evt-${Date.now()}`,
      title: evtTitle,
      image: evtImage,
      date: evtDate,
      time: evtTime || '10:00',
      location: evtLocation,
      coordinates: '41.0082, 28.9784',
      status: 'upcoming',
      attendeesCount: 15,
      description: evtDescription,
      gmapsLink: `https://maps.google.com/?q=${encodeURIComponent(evtLocation)}`
    };

    onAddEvent(newEvt);
    triggerSuccess(`"${evtTitle}" etkinliği başarıyla eklendi! Etkinlikler sayfasından kontrol edebilirsiniz.`);
    
    // reset form
    setEvtTitle('');
    setEvtDate('');
    setEvtTime('');
    setEvtLocation('');
    setEvtDescription('');
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogSummary || !blogContent) return;

    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: blogTitle,
      summary: blogSummary,
      content: blogContent,
      image: blogImage || IMAGES.heroBg,
      category: blogCategory,
      date: new Date().toISOString().split('T')[0],
      author: 'AYMC Yönetim Kurulu',
      tags: blogTags.split(',').map(t => t.trim()).filter(Boolean),
      comments: [],
      likes: 1
    };

    onAddBlogPost(newPost);
    triggerSuccess(`"${blogTitle}" haberi başarıyla paylaşıldı! Haberler sekmesinden okuyabilirsiniz.`);

    // reset form
    setBlogTitle('');
    setBlogSummary('');
    setBlogContent('');
    setBlogTags('');
    setBlogImage('');
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtName || !rtStart || !rtEnd) return;

    const newRt: Route = {
      id: `route-${Date.now()}`,
      name: rtName,
      startPoint: rtStart,
      endPoint: rtEnd,
      distanceKm: rtDistance,
      estimatedHours: rtHours,
      roadCondition: rtRoad,
      fuelRate: 5.0,
      stops: rtStops.split(',').map(s => s.trim()).filter(Boolean),
      gpsUrl: `https://maps.google.com/?saddr=${encodeURIComponent(rtStart)}&daddr=${encodeURIComponent(rtEnd)}`,
      difficulty: rtDifficulty,
      elevation: '100m - 500m'
    };

    onAddRoute(newRt);
    triggerSuccess(`"${rtName}" rotası başarıyla eklendi! Rotalar ve Yakıt Planlayıcı sayfasında listelendi.`);

    // reset form
    setRtName('');
    setRtStart('');
    setRtEnd('');
    setRtStops('');
  };



  const renderProfileFields = () => {
    return (
      <div className="space-y-4">
        <h4 className="font-bebas text-xl text-white uppercase tracking-wider mt-8 mb-4 border-b border-neutral-900 pb-2">Genişletilmiş Profil Bilgileri</h4>
        {PROFILE_FIELDS.map(field => (
          <div key={field.key} className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">{field.label}</label>
              <input
                type="text"
                value={profData[field.key] || ''}
                onChange={(e) => setProfData({...profData, [field.key]: e.target.value})}
                className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                placeholder={`${field.label} giriniz...`}
              />
            </div>
            <div className="flex flex-col items-center justify-center pt-6 px-2">
              <label className="text-[10px] font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Gizli</label>
              <input
                type="checkbox"
                checked={profPrivacy[field.key] || false}
                onChange={(e) => setProfPrivacy({...profPrivacy, [field.key]: e.target.checked})}
                className="w-4 h-4 rounded-sm border-neutral-800 text-brand focus:ring-brand accent-brand cursor-pointer"
                title="Diğer üyelerden gizle"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Login & Sign Up View
  if (!currentUser) {
    return (
      <div id="admin-login-screen" className="bg-transparent text-white min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full bg-[#1A1A1A] border border-neutral-900 rounded-sm p-6 sm:p-8 shadow-2xl relative">
          {/* Top emblem */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand rounded-full border-4 border-black flex items-center justify-center text-white shadow-lg shadow-brand/20">
            {authMode === 'login' ? <Lock className="w-8 h-8 fill-white/10" /> : <UserPlus className="w-8 h-8 fill-white/10" />}
          </div>

          <div className="text-center mt-8 mb-6">
            <h3 className="font-bebas text-3xl tracking-widest text-white uppercase">
              {authMode === 'login' ? 'SİSTEM GİRİŞİ' : 'SİTEYE ÜYE OL'}
            </h3>
            <p className="font-sans text-[11px] text-gray-500 uppercase tracking-widest font-semibold mt-1">
              {authMode === 'login' ? 'Üye veya Yönetici Girişi' : 'Ayyıldız Motor Kulübü Üyelik Başvurusu'}
            </p>
            <div className="w-12 h-0.5 bg-brand mx-auto mt-2.5" />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-black p-1 border border-neutral-850 rounded-sm mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(''); setRegSuccessMsg(''); }}
              className={`py-2.5 text-[11px] font-sans font-extrabold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                authMode === 'login' ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-brand" />
              <span>GİRİŞ YAP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setLoginError(''); setRegSuccessMsg(''); }}
              className={`py-2.5 text-[11px] font-sans font-extrabold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                authMode === 'register' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>SİTEYE ÜYE OL</span>
            </button>
          </div>

          {loginError && (
            <div className="bg-red-950/40 border border-red-500 text-red-200 p-3 rounded-sm text-xs font-sans mb-4">
              {loginError}
            </div>
          )}

          {regSuccessMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-200 p-4 rounded-sm text-xs font-sans mb-4 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Başvurunuz Başarıyla Alındı!</span>
              </div>
              <p className="leading-relaxed">{regSuccessMsg}</p>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setRegSuccessMsg(''); }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10px] tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                GİRİŞ EKRANINA GİT
              </button>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınız..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-3 px-4 text-sm font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreniz..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Admin test bilgileri: Kullanıcı adı <span className="text-gold font-bold">admin</span>, Şifre <span className="text-gold font-bold">password</span></p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm cursor-pointer shadow-lg shadow-brand/20"
              >
                <Unlock className="w-4 h-4" />
                <span>GİRİŞ YAP</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-neutral-600 text-[10px] uppercase font-bold tracking-wider">veya</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#24292e] hover:bg-[#1a1e22] border border-neutral-700 text-white text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm cursor-pointer shadow-lg shadow-black/40"
              >
                <Github className="w-4 h-4 text-white" />
                <span>GITHUB İLE GİRİŞ YAP</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#24292e] hover:bg-[#1a1e22] border border-neutral-700 text-white text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm cursor-pointer shadow-lg shadow-black/40 mb-3"
              >
                <Github className="w-4 h-4 text-white" />
                <span>GITHUB İLE HIZLI ÜYE OL</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-neutral-500 text-[10px] uppercase font-bold tracking-wider">veya Formu Doldurun</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Adınız</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Adınız..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Soyadınız</label>
                  <input
                    type="text"
                    value={regSurname}
                    onChange={(e) => setRegSurname(e.target.value)}
                    placeholder="Soyadınız..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Kullanıcı Adı / GitHub Kullanıcı Adı (*)</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Giriş ve GitHub profiliniz için..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Şifre (*)</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="En az 4 karakter..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-mono text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Motosiklet Modeli</label>
                  <input
                    type="text"
                    value={regMotorcycle}
                    onChange={(e) => setRegMotorcycle(e.target.value)}
                    placeholder="Örn: Yamaha MT-07"
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Kan Grubu</label>
                  <select
                    value={regBloodType}
                    onChange={(e) => setRegBloodType(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  >
                    <option value="0 Rh+">0 Rh+</option>
                    <option value="0 Rh-">0 Rh-</option>
                    <option value="A Rh+">A Rh+</option>
                    <option value="A Rh-">A Rh-</option>
                    <option value="B Rh+">B Rh+</option>
                    <option value="B Rh-">B Rh-</option>
                    <option value="AB Rh+">AB Rh+</option>
                    <option value="AB Rh-">AB Rh-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm cursor-pointer shadow-lg shadow-brand/20 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>KULÜBE ÜYE OL (BAŞVUR)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // If Member view
  if (currentUser.role === 'member') {
    return (
      <div id="member-dashboard-screen" className="bg-transparent text-white min-h-screen py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header toolbar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-900 pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-sans text-[10px] tracking-widest text-emerald-400 font-bold uppercase">OTURUM AÇIK</span>
              </div>
              <h2 className="font-bebas text-4xl text-white tracking-widest uppercase">Hoş Geldin, {currentUser.name}</h2>
            </div>
  
            <div className="flex items-center space-x-3">
              {memberView === 'dashboard' ? (
                <>
                  {currentUser.status !== 'pending' && (
                    <button
                      onClick={() => setMemberView('member-directory')}
                      className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>DİĞER ÜYELERİ GÖR</span>
                    </button>
                  )}
                  <button
                    onClick={handleEditOwnProfileClick}
                    className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>PROFİLİ DÜZENLE</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMemberView('dashboard')}
                  className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>GERİ DÖN</span>
                </button>
              )}
              <button
                onClick={() => setCurrentUser?.(null)}
                className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-brand" />
                <span>KİLİTLE VE ÇIK</span>
              </button>
            </div>
          </div>
  
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 p-4 rounded-sm text-sm font-sans mb-6 flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>{successMsg}</span>
            </div>
          )}

          {memberView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Member Card */}
              <div className="md:col-span-1 bg-[#1A1A1A] border border-neutral-900 p-6 rounded-sm flex flex-col items-center">
                <div className="relative group w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-neutral-800 bg-black flex items-center justify-center">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Image className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase">Foto Değiştir</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if(file) {
                          try {
                            const compressedBase64 = await resizeAvatar(file);
                            const updatedUser = { ...currentUser, avatarUrl: compressedBase64 };
                            setCurrentUser?.(updatedUser);
                            await addOrUpdateUser(updatedUser);
                            setSuccessMsg('Profil fotoğrafı güncellendi.');
                            setTimeout(() => setSuccessMsg(''), 3000);
                          } catch (err: any) {
                            alert('Profil fotoğrafı güncellenemedi: ' + err.message);
                          }
                        }
                      }} 
                    />
                  </label>
                </div>
                <h3 className="font-bebas text-2xl text-white uppercase tracking-widest text-center">{currentUser.name} {currentUser.surname}</h3>
                <span className="text-[10px] bg-brand/10 text-brand border border-brand/20 px-2 py-1 rounded-sm uppercase tracking-widest font-bold mt-2">
                  {currentUser.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}
                </span>

                {currentUser.githubUsername && (
                  <div className="flex items-center gap-1.5 mt-4 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    GitHub Bağlantılı (@{currentUser.githubUsername})
                  </div>
                )}

                {currentUser.status === 'pending' && (
                  <p className="text-brand text-xs font-bold text-center mt-6">Hesabınız yönetici onayı bekliyor. Onaylandıktan sonra diğer üyelere erişebilirsiniz.</p>
                )}
              </div>

              {/* Status Update & Feed */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#1A1A1A] border border-neutral-900 p-6 rounded-sm">
                  <h4 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">DURUM PAYLAŞ</h4>
                  <div className="flex flex-col space-y-3">
                    <textarea 
                      placeholder="Şu an ne yapıyorsun? Bir durum güncellemesi veya anlık paylaşım yap..."
                      className="w-full bg-black border border-neutral-800 rounded-sm p-4 text-sm text-white focus:outline-none focus:border-brand transition-colors resize-none h-24"
                      id="status-textarea"
                    ></textarea>
                    <button 
                      onClick={async () => {
                        const el = document.getElementById('status-textarea') as HTMLTextAreaElement;
                        if(el && el.value.trim()) {
                          const val = el.value.trim();
                          const updatedUser = { ...currentUser, statusText: val };
                          setCurrentUser?.(updatedUser);
                          if(setUsers) setUsers(users?.map(u => u.id === currentUser.id ? updatedUser : u));
                          
                          // Create and store a persistent instant post
                          const newPost: UserPost = {
                            id: `post-${Date.now()}`,
                            userId: currentUser.id,
                            authorName: `${currentUser.name} ${currentUser.surname || ''}`.trim(),
                            text: val,
                            timestamp: Date.now()
                          };
                          await addOrUpdateUserPost(newPost);

                          el.value = '';
                          setSuccessMsg('Durum ve anlık paylaşımınız yayınlandı.');
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }
                      }}
                      className="self-end bg-brand hover:bg-red-700 text-white px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      PAYLAŞ
                    </button>
                  </div>
                </div>

                {/* Current Status Box with History */}
                <div className="bg-[#1A1A1A] border border-neutral-900 p-6 rounded-sm">
                  <h4 className="font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GÜNCEL DURUMUNUZ</h4>
                  <p className="text-white text-base italic mb-6">
                    {currentUser.statusText ? `"${currentUser.statusText}"` : 'Henüz bir durum paylaşmadınız.'}
                  </p>

                  <h4 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-t border-neutral-900 pt-4">GEÇMİŞ PAYLAŞIMLARINIZ</h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {userPosts.filter(p => p.userId === currentUser.id).length === 0 ? (
                      <p className="text-xs text-gray-500 font-sans">Henüz geçmiş paylaşımınız bulunmuyor.</p>
                    ) : (
                      userPosts.filter(p => p.userId === currentUser.id).map(p => (
                        <div key={p.id} className="bg-black/45 border border-neutral-950 p-3 rounded-sm flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs text-gray-300 break-words">{p.text}</p>
                            <span className="text-[10px] text-gray-600 font-mono mt-1 block">
                              {new Date(p.timestamp).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <button 
                            onClick={async () => {
                              if(confirm('Bu paylaşımı silmek istediğinize emin misiniz?')) {
                                await deleteUserPostDoc(p.id);
                                triggerSuccess('Paylaşım silindi.');
                              }
                            }}
                            className="text-gray-500 hover:text-brand transition-colors p-1"
                            title="Paylaşımı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {memberView === 'member-directory' && (
            <div className="bg-[#1A1A1A] border border-neutral-900 p-8 rounded-sm">
              <h3 className="font-bebas text-2xl text-white mb-6 uppercase">DİĞER ÜYELER</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users?.filter(u => u.status === 'approved' || !u.status).map(u => (
                  <div key={u.id} className="bg-black border border-neutral-800 p-6 rounded-sm flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-800 bg-neutral-900 mb-4 flex-shrink-0 flex items-center justify-center">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={`${u.name} Profil`} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-600" />
                      )}
                    </div>

                    <h4 className="font-bebas text-xl text-white tracking-widest">{u.name} {u.surname}</h4>
                    <p className="text-[10px] text-brand font-bold font-sans mb-3 uppercase tracking-widest">{u.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}</p>
                    
                    {u.statusText && (
                      <p className="text-xs text-gray-400 italic mb-4 line-clamp-2">"{u.statusText}"</p>
                    )}

                    <div className="mt-auto w-full pt-4 border-t border-neutral-800/50">
                      <button
                        onClick={() => {
                          setViewingUser(u);
                          setMemberView('view-profile');
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase rounded-sm z-10 relative"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>PROFİLİ İNCELE</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {memberView === 'view-profile' && viewingUser && (
            <div className="bg-[#1A1A1A] border border-neutral-900 p-8 rounded-sm">
              <button 
                onClick={() => setMemberView('member-directory')}
                className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ÜYE LİSTESİNE DÖN</span>
              </button>

              <div className="flex items-center space-x-4 mb-8 border-b border-neutral-900 pb-6">
                <div className="w-16 h-16 overflow-hidden bg-neutral-900 border-2 border-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                  {viewingUser.avatarUrl ? (
                    <img src={viewingUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bebas text-3xl text-white tracking-widest uppercase">{viewingUser.name} {viewingUser.surname}</h3>
                  <p className="text-sm text-brand font-bold font-sans uppercase tracking-widest">{viewingUser.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}</p>
                  {viewingUser.statusText && (
                    <p className="text-sm text-gray-400 italic mt-1">"{viewingUser.statusText}"</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {PROFILE_FIELDS.map(field => {
                  // Only show if the user didn't hide it OR if current user is admin OR if looking at own profile
                  const isHidden = viewingUser.privacy && viewingUser.privacy[field.key];
                  const isAdmin = currentUser.role === 'admin';
                  const isSelf = viewingUser.id === currentUser.id;
                  const canView = !isHidden || isAdmin || isSelf;

                  if (!canView) return null;

                  const value = viewingUser.profile && viewingUser.profile[field.key];
                  if (!value) return null;

                  return (
                    <div key={field.key} className="bg-black border border-neutral-800 p-4 rounded-sm">
                      <p className="text-[10px] font-sans font-bold text-gray-500 tracking-wider uppercase mb-1">{field.label}</p>
                      <p className="text-sm font-sans text-white">{value}</p>
                    </div>
                  );
                })}
              </div>
              
              {(!viewingUser.profile || Object.keys(viewingUser.profile).length === 0) && (
                <p className="text-gray-500 text-sm font-sans italic text-center py-8">Kullanıcı henüz profil bilgilerini doldurmamış veya tüm bilgileri gizli.</p>
              )}

              {/* Dynamic User Instant Posts Section */}
              <div className="mt-8 border-t border-neutral-900 pt-8">
                <h4 className="font-bebas text-2xl text-white tracking-wider uppercase mb-4">ANLIK PAYLAŞIMLARI</h4>
                <div className="space-y-4">
                  {userPosts.filter(p => p.userId === viewingUser.id).length === 0 ? (
                    <p className="text-gray-500 text-sm font-sans italic">Kullanıcı henüz bir anlık paylaşım yapmamış.</p>
                  ) : (
                    userPosts.filter(p => p.userId === viewingUser.id).map(p => (
                      <div key={p.id} className="bg-black border border-neutral-850 p-5 rounded-sm flex flex-col space-y-2">
                        <p className="text-sm font-sans text-gray-200 leading-relaxed whitespace-pre-wrap">{p.text}</p>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(p.timestamp).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {memberView === 'edit-profile' && (
            <div className="bg-[#1A1A1A] border border-neutral-900 p-8 rounded-sm">
              <h3 className="font-bebas text-2xl text-white mb-6 uppercase">Profil Bilgilerimi Düzenle</h3>
              <form onSubmit={handleUpdateOwnProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Adı</label>
                    <input
                      type="text"
                      required
                      value={ownName}
                      onChange={(e) => setOwnName(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Soyadı</label>
                    <input
                      type="text"
                      required
                      value={ownSurname}
                      onChange={(e) => setOwnSurname(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Adı (Giriş İçin)</label>
                    <input
                      type="text"
                      required
                      value={ownUsername}
                      onChange={(e) => setOwnUsername(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
                    <input
                      type="text"
                      value={ownPassword}
                      onChange={(e) => setOwnPassword(e.target.value)}
                      placeholder="Gizli kalması için boş bırakın..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-brand placeholder-gray-600"
                    />
                  </div>
                </div>

                {renderProfileFields()}

                {loginError && (
                  <div className="bg-red-950/40 border border-red-500 text-red-200 p-3 rounded-sm text-xs font-sans">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex items-center justify-center space-x-2 py-3 px-6 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>GÜNCELLE</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-screen" className="bg-transparent text-white min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-900 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-neutral-800 bg-black flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Image className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[7px] text-white font-bold uppercase">Değiştir</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if(file) {
                      try {
                        const compressedBase64 = await resizeAvatar(file);
                        const updatedUser = { ...currentUser, avatarUrl: compressedBase64 };
                        setCurrentUser?.(updatedUser);
                        await addOrUpdateUser(updatedUser);
                        setSuccessMsg('Profil fotoğrafı güncellendi.');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      } catch (err: any) {
                        alert('Profil fotoğrafı güncellenemedi: ' + err.message);
                      }
                    }
                  }} 
                />
              </label>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-sans text-[10px] tracking-widest text-emerald-400 font-bold uppercase">OTURUM AÇIK</span>
              </div>
              <h2 className="font-bebas text-4xl text-white tracking-widest uppercase">YÖNETİM KOMUTA MERKEZİ</h2>
            </div>
          </div>

          <button
            onClick={() => setCurrentUser?.(null)}
            className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-brand" />
            <span>KİLİTLE VE ÇIK</span>
          </button>
        </div>

        {/* Global Toast Success Message */}
        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-200 p-4 rounded-sm text-xs font-sans mb-8 flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Workspace Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Sidebar Tabs (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-4 h-max space-y-1">
            <button
              onClick={() => setActiveTab('add-blog')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                activeTab === 'add-blog' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>DUYURU / HABER PAYLAŞ</span>
            </button>


            <button
              onClick={() => setActiveTab('create-user')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                activeTab === 'create-user' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>SİSTEME ÜYE EKLE</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('list-users'); setUserStatusFilter('all'); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                activeTab === 'list-users' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>ÜYE LİSTESİ</span>
              </div>
              {users?.filter(u => u.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 bg-brand text-white rounded-full font-mono text-[9px] font-bold">
                  {users?.filter(u => u.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('upload-media')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                activeTab === 'upload-media' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>GALERİYE MEDYA YÜKLE</span>
            </button>
          </div>

          {/* Active Workspace Panel Content (lg:col-span-9) */}
          <div className="lg:col-span-9 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8">
            
            {/* TAB: CREATE USER */}
            {activeTab === 'create-user' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">SİSTEME YENİ ÜYE EKLE</h3>
                  <p className="font-sans text-xs text-gray-400">Kulübe katılan veya yetki vermek istediğiniz yeni bir üye hesabı oluşturun. Bu hesap bilgileriyle sisteme giriş yapabileceklerdir.</p>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-6 pt-4 border-t border-neutral-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Adı</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Soyadı</label>
                      <input
                        type="text"
                        required
                        value={newUserSurname}
                        onChange={(e) => setNewUserSurname(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Adı (Sisteme Giriş İçin)</label>
                      <input
                        type="text"
                        required
                        value={newUsernameField}
                        onChange={(e) => setNewUsernameField(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Şifre</label>
                      <input
                        type="text"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Yetkisi</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    >
                      <option value="member">Kulüp Üyesi (Standart Yetki)</option>
                      <option value="admin">Sistem Yöneticisi (Admin Paneli Erişimi)</option>
                    </select>
                  </div>

                  {loginError && (
                    <div className="bg-red-950/40 border border-red-500 text-red-200 p-3 rounded-sm text-xs font-sans mb-4">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>KULLANICIYI OLUŞTUR VE YETKİLENDİR</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB: VIEW MEMBER PROFILE (ADMIN) */}
            {activeTab === 'view-profile' as any && viewingUser && (
              <div className="space-y-6">
                <button 
                  onClick={() => setActiveTab('list-users')}
                  className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ÜYE LİSTESİNE DÖN</span>
                </button>

                <div className="flex items-center space-x-4 mb-8 border-b border-neutral-900 pb-6">
                  <div className="w-16 h-16 overflow-hidden bg-neutral-900 border-2 border-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                    {viewingUser.avatarUrl ? (
                      <img src={viewingUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bebas text-3xl text-white tracking-widest uppercase">{viewingUser.name} {viewingUser.surname}</h3>
                    <p className="text-sm text-brand font-bold font-sans uppercase tracking-widest">{viewingUser.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}</p>
                    {viewingUser.statusText && (
                      <p className="text-sm text-gray-400 italic mt-1">"{viewingUser.statusText}"</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {PROFILE_FIELDS.map(field => {
                    const value = viewingUser.profile && viewingUser.profile[field.key];
                    if (!value) return null;

                    return (
                      <div key={field.key} className="bg-black border border-neutral-850 p-4 rounded-sm">
                        <p className="text-[10px] font-sans font-bold text-gray-500 tracking-wider uppercase mb-1">{field.label}</p>
                        <p className="text-sm font-sans text-white">{value}</p>
                      </div>
                    );
                  })}
                </div>
                
                {(!viewingUser.profile || Object.keys(viewingUser.profile).length === 0) && (
                  <p className="text-gray-500 text-sm font-sans italic text-center py-8">Kullanıcı henüz profil bilgilerini doldurmamış.</p>
                )}

                {/* Dynamic User Instant Posts Section */}
                <div className="mt-8 border-t border-neutral-900 pt-8">
                  <h4 className="font-bebas text-2xl text-white tracking-wider uppercase mb-4">ANLIK PAYLAŞIMLARI</h4>
                  <div className="space-y-4">
                    {userPosts.filter(p => p.userId === viewingUser.id).length === 0 ? (
                      <p className="text-gray-500 text-sm font-sans italic">Kullanıcı henüz bir anlık paylaşım yapmamış.</p>
                    ) : (
                      userPosts.filter(p => p.userId === viewingUser.id).map(p => (
                        <div key={p.id} className="bg-black border border-neutral-850 p-5 rounded-sm flex flex-col space-y-2">
                          <p className="text-sm font-sans text-gray-200 leading-relaxed whitespace-pre-wrap">{p.text}</p>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(p.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LIST USERS */}
            {activeTab === 'list-users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-neutral-900 pb-4">
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">SİSTEM ÜYELERİ LİSTESİ</h3>
                    <p className="font-sans text-xs text-gray-400">Sisteme kayıtlı tüm kullanıcıları, yetki seviyelerini ve bilgilerini buradan görüntüleyebilirsiniz.</p>
                  </div>
                  <div className="bg-neutral-900 px-3 py-1.5 rounded-sm">
                    <span className="font-mono text-xs text-brand font-bold">{users?.length || 0}</span>
                    <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest ml-2">KAYITLI ÜYE</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="İsme veya kullanıcı adına göre ara..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as 'all' | 'approved' | 'pending')}
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors appearance-none"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="approved">Onaylı Üyeler</option>
                      <option value="pending">Onay Bekleyenler</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-900">
                        <th className="py-4 px-4 font-sans text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ad Soyad</th>
                        <th className="py-4 px-4 font-sans text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kullanıcı Adı</th>
                        <th className="py-4 px-4 font-sans text-[10px] font-bold text-gray-500 uppercase tracking-widest">Yetki / Rol</th>
                        <th className="py-4 px-4 font-sans text-[10px] font-bold text-gray-500 uppercase tracking-widest">Durum</th>
                        <th className="py-4 px-4 font-sans text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/50">
                      {users && users.filter(u => {
                        const matchesSearch = (u.name + ' ' + u.surname).toLowerCase().includes(userSearchQuery.toLowerCase()) || u.username.toLowerCase().includes(userSearchQuery.toLowerCase());
                        const status = u.status || 'approved';
                        const matchesFilter = userStatusFilter === 'all' || status === userStatusFilter;
                        return matchesSearch && matchesFilter;
                      }).length > 0 ? (
                        users.filter(u => {
                          const matchesSearch = (u.name + ' ' + u.surname).toLowerCase().includes(userSearchQuery.toLowerCase()) || u.username.toLowerCase().includes(userSearchQuery.toLowerCase());
                          const status = u.status || 'approved';
                          const matchesFilter = userStatusFilter === 'all' || status === userStatusFilter;
                          return matchesSearch && matchesFilter;
                        }).map((u) => (
                          <tr key={u.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-sans text-sm text-white font-medium">{u.name} {u.surname}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-xs text-gray-400">{u.username}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-2 py-1 rounded-sm font-sans text-[10px] font-bold tracking-wider uppercase ${
                                u.role === 'admin' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-brand/10 text-brand border border-brand/20'
                              }`}>
                                {u.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-2 py-1 rounded-sm font-sans text-[10px] font-bold tracking-wider uppercase ${
                                (u.status || 'approved') === 'approved' ? 'bg-emerald-900/30 text-emerald-500 border border-emerald-900/50' : 'bg-orange-900/30 text-orange-500 border border-orange-900/50'
                              }`}>
                                {(u.status || 'approved') === 'approved' ? 'ONAYLI' : 'BEKLEYEN'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {u.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      if(setUsers) {
                                        setUsers(users.map(user => user.id === u.id ? { ...user, status: 'approved' } : user));
                                        setSuccessMsg(`${u.username} onaylandı.`);
                                        setTimeout(() => setSuccessMsg(''), 3000);
                                      }
                                    }}
                                    className="text-emerald-500 hover:text-white transition-colors p-1"
                                    title="Onayla"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setViewingUser(u);
                                    setActiveTab('view-profile' as any);
                                  }}
                                  className="text-gray-400 hover:text-white transition-colors p-1"
                                  title="Profili İncele"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    localStorage.setItem('openChatWithUser', u.id);
                                    window.location.hash = '#/messages';
                                  }}
                                  className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                                  title="Mesaj Gönder"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditUserClick(u)}
                                  className="text-gray-400 hover:text-brand transition-colors p-1"
                                  title="Düzenle"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {u.username !== 'admin' && u.username !== 'kurt' && ( // Prevent deleting default admin
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center">
                            <p className="font-sans text-xs text-gray-500">Henüz onaylı kullanıcı bulunmamaktadır.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: EDIT USER */}
            {activeTab === 'edit-user' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <button onClick={() => setActiveTab('list-users')} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">KULLANICI BİLGİLERİNİ DÜZENLE</h3>
                    <p className="font-sans text-xs text-gray-400">Üyenin profili üzerinde düzeltmeler yapabilir veya yetkisini değiştirebilirsiniz.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-6 pt-4 border-t border-neutral-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Adı</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Soyadı</label>
                      <input
                        type="text"
                        required
                        value={newUserSurname}
                        onChange={(e) => setNewUserSurname(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Adı (Sisteme Giriş İçin)</label>
                      <input
                        type="text"
                        required
                        value={newUsernameField}
                        onChange={(e) => setNewUsernameField(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Yeni Şifre (Değiştirmek için doldurun)</label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-brand placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {renderProfileFields()}

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kullanıcı Yetkisi</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    >
                      <option value="member">Kulüp Üyesi (Standart Yetki)</option>
                      <option value="admin">Sistem Yöneticisi (Admin Paneli Erişimi)</option>
                    </select>
                  </div>

                  {loginError && (
                    <div className="bg-red-950/40 border border-red-500 text-red-200 p-3 rounded-sm text-xs font-sans mb-4">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>DEĞİŞİKLİKLERİ KAYDET</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: ADD EVENT FORM */}
            {activeTab === 'add-event' && (
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">YENİ KULÜP ETKİNLİĞİ OLUŞTUR</h3>
                  <p className="font-sans text-xs text-gray-400">Oluşturduğunuz sürüş, Etkinlikler sayfasında anında listelenecektir.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Etkinlik Başlığı</label>
                    <input
                      type="text"
                      required
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      placeholder="Örn: Toroslar Kar Kampı Korteji..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Grup Konumu (Bölge/İl)</label>
                    <input
                      type="text"
                      required
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      placeholder="Örn: Antalya - Fethiye..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Sürüş Tarihi</label>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Toplanma Saati</label>
                    <input
                      type="time"
                      required
                      value={evtTime}
                      onChange={(e) => setEvtTime(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Seçili Kapak Görseli</label>
                  <select
                    value={evtImage}
                    onChange={(e) => setEvtImage(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                  >
                    <option value={IMAGES.coastalTour}>Sahil Korteji Görseli (Drone)</option>
                    <option value={IMAGES.campingEvent}>Çadır Ateş Kamp Görseli</option>
                    <option value={IMAGES.heroBg}>Dağ Sürüş Korteji Görseli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Sürüş Güvenlik ve Rota Detayları</label>
                  <textarea
                    required
                    rows={4}
                    value={evtDescription}
                    onChange={(e) => setEvtDescription(e.target.value)}
                    placeholder="Sürüş planı, kuralları ve mola yerlerini buraya giriniz..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-900 text-right">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors ml-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ETKİNLİĞİ YAYINLA</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: ADD BLOG POST */}
            {activeTab === 'add-blog' && (
              <form onSubmit={handleCreateBlog} className="space-y-6">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">DUYURU VEYA HABER YAYINLA</h3>
                  <p className="font-sans text-xs text-gray-400">Duyurular ve makaleler Haberler sekmesinde yayınlanır.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Başlık</label>
                    <input
                      type="text"
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Duyuru başlığı..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kategori</label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value as any)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Duyuru">Duyuru</option>
                      <option value="Sürüş Günlüğü">Sürüş Günlüğü</option>
                      <option value="Teknik Bilgi">Teknik Bilgi</option>
                      <option value="Sosyal Sorumluluk">Sosyal Sorumluluk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Kısa Özet</label>
                  <input
                    type="text"
                    required
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                    placeholder="Listede görünecek tek cümlelik özet..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Etiketler (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    placeholder="Örn: duyuru, kortej, kask, surus..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Görsel Yükleme */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase">Haber Görseli Ekle</label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <div className="border-2 border-dashed border-neutral-800 hover:border-brand/40 rounded-xl p-6 transition-all bg-neutral-950 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsCompressingBlogImage(true);
                            try {
                              const compressedBase64 = await resizeGalleryImage(file);
                              setBlogImage(compressedBase64);
                            } catch (err) {
                              console.error(err);
                              alert('Görsel sıkıştırılamadı. Lütfen başka bir resim seçin.');
                            } finally {
                              setIsCompressingBlogImage(false);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <div className="space-y-2 pointer-events-none">
                          <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-500 group-hover:text-brand transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                            {isCompressingBlogImage ? 'Görsel İşleniyor...' : 'Tıkla veya Sürükle Bırak'}
                          </div>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">JPG, PNG - Otomatik Sıkıştırılır</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-4 flex items-center justify-center bg-neutral-950 rounded-xl border border-neutral-900 p-2 overflow-hidden min-h-[120px] relative">
                      {blogImage ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={blogImage}
                            alt="Haber Görseli Önizleme"
                            className="w-full h-full max-h-[120px] object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setBlogImage('')}
                            className="absolute top-1 right-1 bg-black/80 hover:bg-red-600/90 text-white rounded-full p-1.5 transition-colors border border-white/10 z-20 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-[9px] text-neutral-600 font-extrabold uppercase tracking-widest">Görsel Seçilmedi</div>
                          <div className="text-[8px] text-neutral-700 uppercase mt-1">Varsayılan görsel kullanılacak</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">İçerik Yazısı</label>
                  <textarea
                    required
                    rows={6}
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Haber veya duyuru makale içeriğini buraya yazınız..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-900 text-right">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors ml-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>HABERİ PAYLAŞ</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: ADD ROUTE */}
            {activeTab === 'add-route' && (
              <form onSubmit={handleCreateRoute} className="space-y-6">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">YENİ NAVİGASYON ROTASI EKLE</h3>
                  <p className="font-sans text-xs text-gray-400">Rotalar, Rotalar ve Yakıt Planlayıcı sekmesinde listelenir.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Rota Adı</label>
                    <input
                      type="text"
                      required
                      value={rtName}
                      onChange={(e) => setRtName(e.target.value)}
                      placeholder="Örn: Kapadokya Güneş Sürüşü..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Yol Tipi / Durumu</label>
                    <select
                      value={rtRoad}
                      onChange={(e) => setRtRoad(e.target.value as any)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Premium Asfalt">Premium Asfalt</option>
                      <option value="Virajlı / Dar">Virajlı / Dar</option>
                      <option value="Manzaralı / Virajlı">Manzaralı / Virajlı</option>
                      <option value="Stabilize / Macera">Stabilize / Macera</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Başlangıç Noktası (Şehir/İlçe)</label>
                    <input
                      type="text"
                      required
                      value={rtStart}
                      onChange={(e) => setRtStart(e.target.value)}
                      placeholder="Kadıköy..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Varış Noktası (Şehir/İlçe)</label>
                    <input
                      type="text"
                      required
                      value={rtEnd}
                      onChange={(e) => setRtEnd(e.target.value)}
                      placeholder="Ağva..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Toplam Mesafe (KM)</label>
                    <input
                      type="number"
                      required
                      value={rtDistance}
                      onChange={(e) => setRtDistance(parseInt(e.target.value) || 0)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Tahmini Süre (Saat)</label>
                    <input
                      type="number"
                      required
                      value={rtHours}
                      onChange={(e) => setRtHours(parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Zorluk Seviyesi</label>
                  <select
                    value={rtDifficulty}
                    onChange={(e) => setRtDifficulty(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="Kolay">Kolay</option>
                    <option value="Orta">Orta</option>
                    <option value="Zor">Zor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Mola İstasyonları (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    value={rtStops}
                    onChange={(e) => setRtStops(e.target.value)}
                    placeholder="Örn: Ömerli Opet, Şile Meydan, Teke..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-900 text-right">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors ml-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ROTAYI KAYDET</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB: UPLOAD MEDIA */}
            {activeTab === 'upload-media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">GALERİYE MEDYA EKLE</h3>
                  <p className="font-sans text-xs text-gray-400">Yönetim komuta merkezinden galeriye fotoğraf veya video yükleyin ya da YouTube / Instagram video linki ekleyin.</p>
                </div>

                <div className="flex border-b border-neutral-900 pb-2 gap-4">
                  <button
                    onClick={() => {
                      setMediaUploadType('file');
                      setMediaErrorMsg('');
                      setMediaSuccessMsg('');
                    }}
                    className={`pb-2 text-xs font-sans font-bold tracking-wider uppercase border-b-2 transition-all ${
                      mediaUploadType === 'file' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Dosya Yükle
                  </button>
                  <button
                    onClick={() => {
                      setMediaUploadType('youtube');
                      setMediaErrorMsg('');
                      setMediaSuccessMsg('');
                    }}
                    className={`pb-2 text-xs font-sans font-bold tracking-wider uppercase border-b-2 transition-all ${
                      mediaUploadType === 'youtube' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    YouTube Linki Ekle
                  </button>
                  <button
                    onClick={() => {
                      setMediaUploadType('instagram');
                      setMediaErrorMsg('');
                      setMediaSuccessMsg('');
                    }}
                    className={`pb-2 text-xs font-sans font-bold tracking-wider uppercase border-b-2 transition-all ${
                      mediaUploadType === 'instagram' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Instagram Linki Ekle
                  </button>
                </div>

                <div className="space-y-6 pt-2">
                  <div>
                    <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Medya Açıklaması / Başlık (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={mediaDescription}
                      onChange={(e) => setMediaDescription(e.target.value)}
                      placeholder="Medya hakkında kısa bir not veya başlık..."
                      className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand placeholder-neutral-600 transition-colors"
                      disabled={isUploadingMedia}
                    />
                  </div>

                  {mediaUploadType === 'file' ? (
                    <>
                      <div>
                        <input
                          type="file"
                          ref={mediaFileInputRef}
                          onChange={handleMediaFileChange}
                          accept="image/*,video/*"
                          className="hidden"
                          disabled={isUploadingMedia}
                        />
                        <button
                          onClick={() => mediaFileInputRef.current?.click()}
                          disabled={isUploadingMedia}
                          className="w-full py-12 border-2 border-dashed border-neutral-800 rounded-sm flex flex-col items-center justify-center text-gray-400 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-black cursor-pointer"
                        >
                          <UploadCloud className="w-10 h-10 mb-4 text-brand" />
                          <span className="font-sans font-bold text-sm mb-1 px-4 text-center truncate max-w-full">
                            {selectedMediaFile ? selectedMediaFile.name : "Dosya Seçin"}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 text-center max-w-sm leading-relaxed block mt-1">
                            Fotoğraflar: Sınırsız Boyut (Otomatik Sıkıştırılır) <br />
                            Videolar: Maksimum 20 MB (Daha büyükleri için YouTube veya Instagram Linki sekmesini kullanın)
                          </span>
                        </button>
                      </div>

                      {selectedMediaFile && (
                        <div className="p-4 bg-black rounded-sm border border-neutral-900 text-xs font-mono text-gray-400 flex flex-col gap-1.5">
                          <div><span className="text-brand font-bold">DOSYA ADI:</span> {selectedMediaFile.name}</div>
                          <div><span className="text-brand font-bold">DOSYA TÜRÜ:</span> {selectedMediaFile.type || 'Bilinmiyor'}</div>
                          <div><span className="text-brand font-bold">DOSYA BOYUTU:</span> {(selectedMediaFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                          <div>
                            <span className="text-brand font-bold">YÜKLEME KATEGORİSİ:</span>{' '}
                            {selectedMediaFile.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|flv|3gp|mpeg)$/i.test(selectedMediaFile.name) ? (
                              <span className="text-emerald-400 font-bold">VİDEOLAR</span>
                            ) : (
                              <span className="text-blue-400 font-bold">FOTOĞRAFLAR</span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : mediaUploadType === 'youtube' ? (
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">YouTube Video Linki (Video, Shorts veya Canlı Yayın)</label>
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Örn: https://www.youtube.com/watch?v=mWcnzdCoULs veya https://youtu.be/..."
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand placeholder-neutral-600 transition-colors"
                        disabled={isUploadingMedia}
                      />
                      <p className="text-[10px] text-gray-500 mt-2">Kopyaladığınız YouTube video veya Shorts linkini buraya yapıştırarak galeriye "Videolar" sekmesinden anında yansıtabilirsiniz.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">Instagram Linki (Reels veya Gönderi)</label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="Örn: https://www.instagram.com/reel/DZGnwZQopr5/"
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand placeholder-neutral-600 transition-colors"
                        disabled={isUploadingMedia}
                      />
                      <p className="text-[10px] text-gray-500 mt-2">Kopyaladığınız Reels veya Gönderi linkini buraya yapıştırarak galeriye "Videolar" sekmesinden anında yansıtabilirsiniz.</p>
                    </div>
                  )}

                  {isUploadingMedia && mediaUploadType === 'file' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-gray-400">
                        <span>{mediaUploadStatus}</span>
                        <span>%{mediaUploadProgress}</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand h-full transition-all duration-300" 
                          style={{ width: `${mediaUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {mediaErrorMsg && (
                    <div className="bg-red-950/40 border border-red-500 text-red-200 p-4 rounded-sm text-xs font-sans flex items-center space-x-2">
                      <Info className="w-4 h-4 text-red-400" />
                      <span>{mediaErrorMsg}</span>
                    </div>
                  )}

                  {mediaSuccessMsg && (
                    <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-200 p-4 rounded-sm text-xs font-sans flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{mediaSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    onClick={handleMediaUpload}
                    disabled={isUploadingMedia || (mediaUploadType === 'file' ? !selectedMediaFile : mediaUploadType === 'youtube' ? !youtubeUrl : !instagramUrl)}
                    className="w-full py-4 bg-brand hover:bg-brand/90 text-white font-sans font-bold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs tracking-widest uppercase cursor-pointer"
                  >
                    {isUploadingMedia ? 'İŞLENİYOR...' : (mediaUploadType === 'file' ? 'YÜKLE VE YAYINLA' : 'LİNKİ EKLE VE YAYINLA')}
                  </button>
                </div>
              </div>
            )}



          </div>

        </div>

      </div>
    </div>
  );
}
