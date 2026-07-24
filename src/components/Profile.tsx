/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MessageSquare, 
  Edit3, 
  Plus, 
  Trash2, 
  LogOut, 
  Check, 
  Image as ImageIcon, 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  Unlock,
  Radio,
  BookOpen,
  Shield
} from 'lucide-react';
import { UserPost } from '../types';
import { IMAGES } from '../data';
import { 
  addOrUpdateUserPost, 
  deleteUserPostDoc, 
  addOrUpdateUser, 
  subscribeDirectMessages 
} from '../lib/firebaseService';
import { auth, googleAuthProvider, translateFirebaseError } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import MessagesPanel from './MessagesPanel';

interface ProfileProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  users: any[];
  setUsers: (users: any[]) => void;
  userPosts: UserPost[];
  setUserPosts?: (posts: UserPost[]) => void;
  setActivePage?: (page: string) => void;
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
        const MAX_SIZE = 250;
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
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
};

export default function Profile({ 
  currentUser, 
  setCurrentUser, 
  users, 
  setUsers, 
  userPosts,
  setUserPosts,
  setActivePage
}: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'messages'>('info');
  const [memberView, setMemberView] = useState<'view' | 'edit'>('view');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Edit Own Profile fields
  const [ownName, setOwnName] = useState(currentUser?.name || '');
  const [ownSurname, setOwnSurname] = useState(currentUser?.surname || '');
  const [ownUsername, setOwnUsername] = useState(currentUser?.username || '');
  const [ownPassword, setOwnPassword] = useState(currentUser?.password || '');
  const [profData, setProfData] = useState<any>(currentUser?.profile || {});
  const [profPrivacy, setProfPrivacy] = useState<any>(currentUser?.privacy || {});
  const [successMsg, setSuccessMsg] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setOwnName(currentUser.name || '');
      setOwnSurname(currentUser.surname || '');
      setOwnUsername(currentUser.username || '');
      setOwnPassword(currentUser.password || '');
      setProfData(currentUser.profile || {});
      setProfPrivacy(currentUser.privacy || {});
    }
  }, [currentUser]);

  // Subscribe to DMs to calculate unread badge
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeDirectMessages((msgs) => {
      const count = msgs.filter(
        (m) => m.receiverId === currentUser.id && !m.read
      ).length;
      setUnreadCount(count);
    });
    return () => unsub();
  }, [currentUser]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const foundUser = users?.find(
      (u) => u.username === username && u.password === password
    );
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
      // Reset form
      setUsername('');
      setPassword('');
    } else {
      // Check if username already exists
      const usernameExists = users?.some((u) => u.username === username);
      if (usernameExists) {
        setLoginError('Kullanıcı adı veya şifre hatalı.');
        return;
      }
      // Auto-register as pending member
      const newUser = {
        id: `user-${Date.now()}`,
        name: username,
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

  const handleGoogleLogin = async () => {
    try {
      setLoginError('');
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fUser = result.user;
      
      let foundUser = users.find(
        (u) => u.googleId === fUser.uid || u.email === fUser.email || u.username === fUser.email
      );
      const isDefaultAdminEmail = 
        fUser.email === 'kduzlu@gmail.com' || fUser.email === 'admin@ayyldzmotokulp.com';
      
      if (foundUser) {
        if (!foundUser.googleId || !foundUser.avatarUrl || !foundUser.email || (isDefaultAdminEmail && foundUser.role !== 'admin')) {
          const updated = {
            ...foundUser,
            googleId: fUser.uid,
            email: fUser.email || foundUser.email || '',
            avatarUrl: fUser.photoURL || foundUser.avatarUrl || '',
            role: isDefaultAdminEmail ? 'admin' : foundUser.role,
            statusText: isDefaultAdminEmail ? 'Kurucu Üye / Töre Muhafızı' : (foundUser.statusText || 'Google Üyesi')
          };
          await addOrUpdateUser(updated);
          foundUser = updated;
        }
        if (foundUser.status === 'pending') {
          setLoginError('Hesabınız yönetici onayı bekliyor.');
          await auth.signOut();
          return;
        }
        if (foundUser.status === 'rejected') {
          setLoginError('Hesabınız reddedildi.');
          await auth.signOut();
          return;
        }
        setCurrentUser(foundUser);
      } else {
        const newUser = {
          id: fUser.uid,
          name: fUser.displayName ? fUser.displayName.split(' ')[0] : 'İsimsiz',
          surname: fUser.displayName ? fUser.displayName.split(' ').slice(1).join(' ') : '',
          username: fUser.email || fUser.uid,
          password: '',
          role: isDefaultAdminEmail ? 'admin' : 'member',
          status: 'approved',
          googleId: fUser.uid,
          avatarUrl: fUser.photoURL || '',
          email: fUser.email || '',
          statusText: isDefaultAdminEmail ? 'Kurucu Üye / Töre Muhafızı' : 'Google Üyesi',
          profile: {},
          privacy: {}
        };
        await addOrUpdateUser(newUser);
        setCurrentUser(newUser);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setLoginError(translateFirebaseError(error));
    }
  };

  const handleUpdateOwnProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownName || !ownSurname || !ownUsername) {
      setLoginError('Ad, soyad ve kullanıcı adı alanları zorunludur.');
      return;
    }
    const exists = users?.some(
      (u) => u.username === ownUsername && u.id !== currentUser.id
    );
    if (exists) {
      setLoginError('Bu kullanıcı adı başka bir hesap tarafından kullanılıyor.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: ownName,
      surname: ownSurname,
      username: ownUsername,
      password: ownPassword ? ownPassword : currentUser.password,
      profile: profData,
      privacy: profPrivacy
    };
    
    try {
      await addOrUpdateUser(updatedUser);
      setCurrentUser(updatedUser);
      setMemberView('view');
      triggerSuccess('Profiliniz başarıyla güncellendi.');
    } catch (err: any) {
      setLoginError(`Profil güncellenemedi: ${err.message || err}`);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fUser = result.user;
      
      const exists = users.some(
        (u) => u.googleId === fUser.uid && u.id !== currentUser.id
      );
      if (exists) {
        alert("Bu Google hesabı zaten başka bir üyeliğe bağlı.");
        return;
      }

      const updatedUser = {
        ...currentUser,
        googleId: fUser.uid,
        email: fUser.email || currentUser.email || '',
        avatarUrl: currentUser.avatarUrl || fUser.photoURL || ''
      };
      setCurrentUser(updatedUser);
      await addOrUpdateUser(updatedUser);
      alert("Google hesabınız başarıyla bağlandı!");
    } catch (err: any) {
      alert("Bağlantı başarısız: " + translateFirebaseError(err));
    }
  };

  // Login screen if not authenticated
  if (!currentUser) {
    return (
      <div id="profile-login-screen" className="bg-transparent text-white min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#111111]/90 border border-neutral-900 rounded-sm p-8 shadow-2xl relative backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand"></div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand rounded-full border-4 border-black flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Lock className="w-8 h-8 fill-white/10" />
          </div>

          <div className="text-center mt-8 mb-6">
            <h3 className="font-bebas text-3xl tracking-widest text-white uppercase">PROFİL & MESAJLAR</h3>
            <p className="font-sans text-[11px] text-gray-500 uppercase tracking-widest font-semibold mt-1">
              Profilinizi görüntülemek ve mesajlaşmak için giriş yapın
            </p>
            <div className="w-12 h-0.5 bg-brand mx-auto mt-2.5" />
          </div>

          {loginError && (
            <div className="bg-red-950/40 border border-red-500 text-red-200 p-3 rounded-sm text-xs font-sans mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Hesabınız yoksa bilgileri doldurarak otomatik başvuru yapabilirsiniz.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand border border-brand text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors rounded-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>GİRİŞ YAP / BAŞVUR</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-4 text-neutral-600 text-[10px] uppercase font-bold tracking-wider">veya</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0e0e0e] hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-sans font-bold tracking-widest uppercase hover:text-white transition-all rounded-sm"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.256.61 4.47 1.637l2.43-2.43C17.385 1.54 14.945 0 12.24 0 6.033 0 1 5.033 1 11.24s5.033 11.24 11.24 11.24c5.895 0 10.864-4.223 10.864-11.24 0-.668-.063-1.314-.177-1.955H12.24z"/>
              </svg>
              <span>GOOGLE İLE GİRİŞ YAP</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Upper Tab Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-8">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`font-bebas text-2xl tracking-wider pb-2 relative transition-colors ${
              activeTab === 'info' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <span>PROFiL BiLGiLERiM</span>
            {activeTab === 'info' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`font-bebas text-2xl tracking-wider pb-2 relative transition-colors flex items-center gap-2 ${
              activeTab === 'messages' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <span>ÖZEL MESAJLARIM</span>
            {unreadCount > 0 && (
              <span className="bg-brand text-white font-sans text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {unreadCount}
              </span>
            )}
            {activeTab === 'messages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {setActivePage && (
            <button
              onClick={() => setActivePage('admin')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark border border-brand text-white transition-all text-xs font-sans font-bold uppercase rounded-sm shadow-md cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>YÖNETİM PANELİ</span>
            </button>
          )}

          <button
            onClick={() => setCurrentUser(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900/40 border border-neutral-800 text-neutral-400 hover:text-white transition-colors text-xs font-sans font-bold uppercase rounded-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-brand" />
            <span>GÜVENLİ ÇIKIŞ</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 p-4 rounded-sm text-sm font-sans mb-6 flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Info Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Avatar & Fast status Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111111]/80 border border-neutral-900 p-6 rounded-sm flex flex-col items-center">
              
              {/* Photo Area */}
              <div className="relative group w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-neutral-800 bg-black flex items-center justify-center">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <ImageIcon className="w-6 h-6 text-white mb-1" />
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
                          setCurrentUser(updatedUser);
                          await addOrUpdateUser(updatedUser);
                          triggerSuccess('Profil fotoğrafı güncellendi.');
                        } catch (err: any) {
                          alert('Profil fotoğrafı güncellenemedi: ' + err.message);
                        }
                      }
                    }} 
                  />
                </label>
              </div>

              <h3 className="font-bebas text-2xl text-white uppercase tracking-widest text-center">
                {currentUser.name} {currentUser.surname}
              </h3>
              
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-[10px] bg-brand/10 text-brand border border-brand/20 px-2.5 py-1 rounded-sm uppercase tracking-widest font-extrabold">
                  {currentUser.role === 'admin' ? 'YÖNETİCİ' : 'KULÜP ÜYESİ'}
                </span>
                
                {currentUser.googleId ? (
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                    Google Bağlantılı
                  </div>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="flex items-center gap-1 bg-black border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider transition-all"
                  >
                    Google Bağla
                  </button>
                )}
              </div>

              {setActivePage && (
                <button
                  onClick={() => setActivePage('admin')}
                  className="w-full mt-4 py-2.5 bg-neutral-900 hover:bg-brand border border-neutral-800 hover:border-brand text-neutral-200 hover:text-white rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-sm"
                >
                  <Shield className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                  <span>YÖNETİM PANELİNE GİT</span>
                </button>
              )}

              {/* Status Update Textarea */}
              <div className="w-full border-t border-neutral-900 mt-6 pt-6">
                <h4 className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">DURUMUNU GÜNCELLE</h4>
                <div className="flex flex-col space-y-2">
                  <textarea 
                    placeholder="Şu an ne yapıyorsun? Diğer üyelerin göreceği bir durum güncellemesi yaz..."
                    className="w-full bg-black border border-neutral-800 rounded-sm p-3 text-xs text-white focus:outline-none focus:border-brand transition-colors resize-none h-20"
                    id="profile-status-textarea"
                  ></textarea>
                  <button 
                    onClick={async () => {
                      const el = document.getElementById('profile-status-textarea') as HTMLTextAreaElement;
                      if(el && el.value.trim()) {
                        const val = el.value.trim();
                        const updatedUser = { ...currentUser, statusText: val };
                        setCurrentUser(updatedUser);
                        
                        // Create persistent instant post
                        const newPost: UserPost = {
                          id: `post-${Date.now()}`,
                          userId: currentUser.id,
                          authorName: `${currentUser.name} ${currentUser.surname || ''}`.trim(),
                          text: val,
                          timestamp: Date.now()
                        };
                        await addOrUpdateUserPost(newPost);
                        if (setUserPosts) {
                          setUserPosts([newPost, ...userPosts]);
                        }

                        el.value = '';
                        triggerSuccess('Durumunuz ve anlık paylaşımınız güncellendi.');
                      }
                    }}
                    className="self-end bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    GÜNCELLE
                  </button>
                </div>
              </div>

              {/* Current active status */}
              <div className="w-full border-t border-neutral-900 mt-4 pt-4 text-center">
                <h4 className="font-sans text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">GÜNCEL DURUM</h4>
                <p className="text-white text-xs italic break-words px-2">
                  {currentUser.statusText ? `"${currentUser.statusText}"` : 'Henüz bir durum paylaşmadınız.'}
                </p>
              </div>

            </div>
          </div>

          {/* Details / Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {memberView === 'view' ? (
              <div className="bg-[#111111]/80 border border-neutral-900 p-6 sm:p-8 rounded-sm">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-widest uppercase">PROFİL DETAYLARIM</h3>
                    <p className="font-sans text-xs text-neutral-400">Üye veri kartınız ve yol detaylarınız.</p>
                  </div>
                  <button
                    onClick={() => setMemberView('edit')}
                    className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-sans font-bold text-neutral-300 hover:text-white hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>PROFİLİ DÜZENLE</span>
                  </button>
                </div>

                {/* Base credential fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6 bg-black/20 p-4 rounded-sm border border-neutral-900">
                  <div>
                    <span className="block text-[10px] text-neutral-500 uppercase font-sans font-bold">Ad Soyad</span>
                    <span className="text-sm font-semibold text-white">{currentUser.name} {currentUser.surname}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-500 uppercase font-sans font-bold">Kullanıcı Adı</span>
                    <span className="text-sm font-semibold text-white font-mono">{currentUser.username}</span>
                  </div>
                </div>

                {/* Custom Profile fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {PROFILE_FIELDS.map((field) => {
                    const value = currentUser.profile?.[field.key];
                    const isHidden = currentUser.privacy?.[field.key];
                    return (
                      <div key={field.key} className="border-b border-neutral-900/60 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-500 uppercase font-sans font-bold">{field.label}</span>
                          {isHidden && (
                            <span className="text-[8px] text-neutral-500 bg-neutral-900/80 border border-neutral-850 px-1.5 py-0.5 rounded-sm uppercase font-sans font-bold">
                              Gizli
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-white block mt-1">
                          {value || <span className="text-neutral-600 italic">Belirtilmedi</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status history log in own profile */}
                <div className="mt-8 border-t border-neutral-900 pt-6">
                  <h4 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">GEÇMİŞ PAYLAŞIMLARIM</h4>
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {userPosts.filter(p => p.userId === currentUser.id).length === 0 ? (
                      <p className="text-xs text-neutral-500 font-sans italic">Henüz geçmiş paylaşımınız bulunmuyor.</p>
                    ) : (
                      userPosts.filter(p => p.userId === currentUser.id).map(p => (
                        <div key={p.id} className="bg-black/30 border border-neutral-900 p-3 rounded-sm flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs text-neutral-300 break-words">{p.text}</p>
                            <span className="text-[9px] text-neutral-500 font-mono mt-1 block">
                              {new Date(p.timestamp).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <button 
                            onClick={async () => {
                              if(confirm('Bu paylaşımı silmek istediğinize emin misiniz?')) {
                                await deleteUserPostDoc(p.id);
                                if (setUserPosts) {
                                  setUserPosts(userPosts.filter(x => x.id !== p.id));
                                }
                                triggerSuccess('Paylaşım silindi.');
                              }
                            }}
                            className="text-neutral-500 hover:text-brand transition-colors p-1"
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
            ) : (
              <div className="bg-[#111111]/80 border border-neutral-900 p-6 sm:p-8 rounded-sm">
                <div className="border-b border-neutral-900 pb-4 mb-6">
                  <h3 className="font-bebas text-2xl text-white tracking-widest uppercase">PROFİLİ GÜNCELLE</h3>
                  <p className="font-sans text-xs text-neutral-400">Genel bilgilerinizi ve üye detaylarınızı güncelleyin.</p>
                </div>

                <form onSubmit={handleUpdateOwnProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-2">Adı</label>
                      <input
                        type="text"
                        required
                        value={ownName}
                        onChange={(e) => setOwnName(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-2">Soyadı</label>
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
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-2">Kullanıcı Adı</label>
                      <input
                        type="text"
                        required
                        value={ownUsername}
                        onChange={(e) => setOwnUsername(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-2">Şifre (Değiştirmek İçin Düzenleyin)</label>
                      <input
                        type="password"
                        value={ownPassword}
                        onChange={(e) => setOwnPassword(e.target.value)}
                        placeholder="Şifreyi gizlemek veya değiştirmek için girin..."
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-900 pt-6">
                    <h4 className="font-sans text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4">ÜYE KART DETAYLARI VE GİZLİLİK</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PROFILE_FIELDS.map((field) => (
                        <div key={field.key} className="bg-black/10 border border-neutral-900 p-3.5 rounded-sm flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <label className="block text-[10px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-1.5">{field.label}</label>
                            <input
                              type="text"
                              value={profData[field.key] || ''}
                              onChange={(e) => setProfData({...profData, [field.key]: e.target.value})}
                              placeholder={`${field.label} girin...`}
                              className="w-full bg-black border border-neutral-850 rounded-sm py-1.5 px-3 text-xs font-sans text-white focus:outline-none focus:border-brand"
                            />
                          </div>
                          <div className="flex flex-col items-center shrink-0">
                            <label className="text-[8px] font-sans font-bold tracking-wider text-neutral-500 uppercase mb-1">Gizli</label>
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
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => setMemberView('view')}
                      className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:text-white rounded-sm text-xs font-sans font-bold uppercase transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand text-white hover:bg-brand-dark rounded-sm text-xs font-sans font-bold uppercase transition-colors"
                    >
                      KAYDET VE GÜNCELLE
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Messages Tab Content */}
      {activeTab === 'messages' && (
        <div className="animate-fade-in">
          <MessagesPanel currentUser={currentUser} users={users} />
        </div>
      )}

    </div>
  );
}
