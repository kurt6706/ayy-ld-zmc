import React, { useState, useEffect } from 'react';
import { LogIn, User, Sparkles, MessageSquare, AlertCircle, Github } from 'lucide-react';
import { loginAnonymously, loginWithGoogle } from '../auth';
import { updateUserPresence } from '../firestore';
import { translateFirebaseError } from '../firebase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function Login({ onLoginSuccess, isLoading, setIsLoading }: LoginProps) {
  const [nickname, setNickname] = useState('');
  const [statusText, setStatusText] = useState('Yollarda...');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const gUser = await loginWithGoogle();
      await updateUserPresence(
        gUser.uid,
        gUser.displayName || 'Google Üyesi',
        gUser.email,
        gUser.photoURL,
        false,
        true,
        'Google ile Bağlandı'
      );
      onLoginSuccess(gUser);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(translateFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();

      if (data.url) {
        window.open(data.url, 'github_oauth_popup', 'width=600,height=700');
      } else {
        const ghUsername = prompt('GitHub kullanıcı adınızı girin (örnek: kduzlu):');
        if (ghUsername && ghUsername.trim()) {
          const userRes = await fetch(`/api/github/user/${encodeURIComponent(ghUsername.trim())}`);
          const ghUserData = await userRes.json();
          await processGithubLogin(ghUserData);
        } else {
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      const ghUsername = prompt('GitHub kullanıcı adınızı girin (örnek: kduzlu):');
      if (ghUsername && ghUsername.trim()) {
        const clean = ghUsername.trim();
        await processGithubLogin({
          id: clean,
          login: clean,
          name: clean,
          avatar_url: `https://github.com/${clean}.png`,
          html_url: `https://github.com/${clean}`,
        });
      } else {
        setIsLoading(false);
      }
    }
  };

  const processGithubLogin = async (ghUser: any) => {
    try {
      const cleanLogin = ghUser.login || 'github_user';
      const displayName = ghUser.name || cleanLogin;
      const avatarUrl = ghUser.avatar_url || `https://github.com/${cleanLogin}.png`;
      const uid = `github-${ghUser.id || cleanLogin}`;

      await updateUserPresence(
        uid,
        displayName,
        ghUser.email || `${cleanLogin}@users.noreply.github.com`,
        avatarUrl,
        false,
        true,
        `GitHub Üyesi (@${cleanLogin})`
      );

      onLoginSuccess({
        uid,
        displayName,
        email: ghUser.email || `${cleanLogin}@users.noreply.github.com`,
        photoURL: avatarUrl,
        providerId: 'github'
      });
    } catch (err: any) {
      setError(err.message || 'GitHub girişi tamamlanamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.githubUser) {
        await processGithubLogin(event.data.githubUser);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      fUser.displayName = nickname.trim();

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

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm shadow-lg cursor-pointer disabled:opacity-50 mb-3"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>GOOGLE İLE GİRİŞ YAP</span>
            </>
          )}
        </button>

        {/* GitHub Authentication Method */}
        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#24292e] hover:bg-[#1a1e22] border border-neutral-700 text-white text-xs font-sans font-bold tracking-widest uppercase transition-all rounded-sm shadow-lg cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Github className="w-4 h-4 text-white" />
              <span>GITHUB İLE GİRİŞ YAP</span>
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
