import React, { useState } from 'react';
import { LogIn, User, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { loginAnonymously, loginWithGoogle } from '../auth';
import { updateProfile } from 'firebase/auth';
import { updateUserPresence } from '../firestore';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function Login({ onLoginSuccess, isLoading, setIsLoading }: LoginProps) {
  const [nickname, setNickname] = useState('');
  const [statusText, setStatusText] = useState('Yollarda...');
  const [error, setError] = useState('');

  const handleAnonymousLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Lütfen sohbete başlamak için bir rumuz (takma ad) girin.');
      return;
    }
    if (nickname.length < 3) {
      setError('Rumuz en az 3 karakterden oluşmalıdır.');
      return;
    }
    if (nickname.length > 25) {
      setError('Rumuz en fazla 25 karakter olabilir.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Perform anonymous login
      const fUser = await loginAnonymously();
      
      // Set display name in auth profile
      if (fUser && !(fUser as any).uid_mocked) {
        await updateProfile(fUser, {
          displayName: nickname.trim(),
          photoURL: '' // empty so we use default deterministic avatar
        });
      }

      // Update active user presence
      await updateUserPresence(
        fUser.uid,
        nickname.trim(),
        null,
        null,
        true,
        true,
        statusText.trim() || 'Hızlı Sürücü'
      );

      onLoginSuccess(fUser);
    } catch (err: any) {
      setError(err.message || 'Anonim giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const fUser = await loginWithGoogle();

      // Update active user presence
      await updateUserPresence(
        fUser.uid,
        fUser.displayName || 'Google Kullanıcısı',
        fUser.email,
        fUser.photoURL,
        false,
        true,
        'Yollarda...'
      );

      onLoginSuccess(fUser);
    } catch (err: any) {
      setError(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-[#0c0c0c] border border-neutral-900 rounded-lg shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      
      {/* Premium Red Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand"></div>

      {/* App Logo & Header */}
      <div className="text-center mb-8 pt-2">
        <div className="inline-flex p-3 bg-brand/10 border border-brand/20 rounded-full text-brand mb-4 shadow-[0_0_15px_rgba(179,0,0,0.15)] animate-pulse">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bebas tracking-widest text-white uppercase mb-1">Grup Sohbetine Giriş</h2>
        <p className="text-neutral-500 text-xs font-sans uppercase tracking-widest">
          Gerçek Zamanlı Sohbet Odası
        </p>
      </div>

      {/* Error Announcement */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/40 rounded-sm flex items-start gap-2 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-sans leading-relaxed">{error}</span>
        </div>
      )}

      {/* Main Forms */}
      <div className="space-y-6">
        
        {/* Nickname / Anonymous login form */}
        <form onSubmit={handleAnonymousLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">
              Rumuz / Takma Ad
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Örn: RüzgarSürücüsü"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
                className="w-full bg-black border border-neutral-800 rounded-sm py-3 pl-10 pr-4 text-sm font-sans text-white placeholder-neutral-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all disabled:opacity-50"
              />
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">
              Durum Mesajı (İsteğe Bağlı)
            </label>
            <input
              type="text"
              placeholder="Örn: Sürüyor, Meşgul, Boşta..."
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              disabled={isLoading}
              className="w-full bg-black border border-neutral-800 rounded-sm py-3 px-4 text-sm font-sans text-white placeholder-neutral-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold font-sans py-3.5 tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(179,0,0,0.25)] hover:shadow-[0_4px_20px_rgba(179,0,0,0.4)]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Rumuzla Bağlan
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-neutral-600 text-[10px] uppercase font-bold tracking-wider">
            veya
          </span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* Google Authentication Method */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-neutral-500/30 border-t-neutral-300 rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.256.61 4.47 1.637l2.43-2.43C17.385 1.54 14.945 0 12.24 0 6.033 0 1 5.033 1 11.24s5.033 11.24 11.24 11.24c5.895 0 10.864-4.223 10.864-11.24 0-.668-.063-1.314-.177-1.955H12.24z" />
              </svg>
              <span>GOOGLE İLE GİRİŞ YAP</span>
            </>
          )}
        </button>

      </div>

      {/* Safety info footer */}
      <div className="text-center mt-8 text-[10px] text-neutral-600 font-sans tracking-wide">
        KVKK ve Gizlilik Politikası otomatik olarak kabul edilmiş sayılır.
      </div>

    </div>
  );
}
