/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, RadioTower, X, Lock } from 'lucide-react';

// Import all sub-components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Discipline from './components/Discipline';
import Events from './components/Events';
import RouteSystem from './components/RouteSystem';
import Blog from './components/Blog';
import WorkspacePanel from './components/WorkspacePanel';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import VoiceChannels from './components/VoiceChannels';
import PromoVideo from './components/PromoVideo';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Login from './components/Login';
import Chat from './components/Chat';
import VoiceRoom from './components/VoiceRoom';
import MessagesPanel from './components/MessagesPanel';
import Profile from './components/Profile';
import AISupportWidget from './components/AISupportWidget';
import MeetingRoom from './components/MeetingRoom';
import { IMAGES } from './data';

// Firebase operations
import { 
  bootstrapDatabaseIfEmpty, 
  subscribeUsers, 
  subscribeEvents, 
  subscribeRoutes, 
  subscribeBlogPosts, 
  subscribeUserPosts, 
  subscribeAnnouncements, 
  addOrUpdateUser, 
  deleteUserDoc,
  addOrUpdateEvent, 
  addOrUpdateRoute, 
  addOrUpdateBlogPost,
  deleteBlogPostDoc
} from './lib/firebaseService';
import { subscribeAuthState, logoutUser, loginAnonymously } from './auth';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Real-time Firestore sync states
  const [events, setEvents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Auth states
  const [chatUser, setChatUser] = useState<any | null>(null);
  const [memberUser, setMemberUser] = useState<any | null>(null);
  
  // Interactive UI states
  const [userAttendingList, setUserAttendingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);

  // Synchronize darkMode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Read cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_accepted');
    if (!consent) {
      setShowCookieConsent(true);
    }
  }, []);

  // Subscriptions setup
  useEffect(() => {
    // Keep track of firebase auth state for Chat and automatically sign in anonymously as fallback
    const unsubAuth = subscribeAuthState(async (user) => {
      if (user) {
        setChatUser(user);
      } else {
        try {
          const guestUser = await loginAnonymously();
          if (guestUser) {
            setChatUser(guestUser);
            if ((guestUser as any).uid_mocked) {
              setMemberUser({
                id: guestUser.uid,
                name: 'Konuk',
                surname: 'Sürücü',
                username: 'konuk',
                role: 'member',
                status: 'approved',
                statusText: 'Misafir',
                profile: {},
                privacy: {}
              });
            }
          }
        } catch (e) {
          console.warn("Auto anonymous sign-in failed:", e);
        }
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Support hash change routing for private messages or links
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/messages') {
        setActivePage('messages');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time Firestore subscriptions (runs on mount so users see content immediately)
  useEffect(() => {
    // Seed default collections if empty (errors are caught and ignored)
    bootstrapDatabaseIfEmpty().catch(err => console.warn("Database boot warning:", err));

    const unsubUsers = subscribeUsers((loadedUsers) => {
      setUsers(loadedUsers);
    });

    const unsubEvents = subscribeEvents((loadedEvents) => {
      setEvents(loadedEvents);
    });

    const unsubRoutes = subscribeRoutes((loadedRoutes) => {
      setRoutes(loadedRoutes);
    });

    const unsubBlog = subscribeBlogPosts((loadedPosts) => {
      setBlogPosts(loadedPosts);
    });

    const unsubUserPosts = subscribeUserPosts((loadedUserPosts) => {
      setUserPosts(loadedUserPosts);
    });

    const unsubAnnouncements = subscribeAnnouncements((loadedAnnouncements) => {
      setAnnouncements(loadedAnnouncements);
    });

    return () => {
      unsubUsers();
      unsubEvents();
      unsubRoutes();
      unsubBlog();
      unsubUserPosts();
      unsubAnnouncements();
    };
  }, []);

  // Synchronize Google / Firebase Auth state with memberUser details
  useEffect(() => {
    if (chatUser && !chatUser.isAnonymous && users.length > 0) {
      const found = users.find(u => 
        (u.googleId && u.googleId === chatUser.uid) || 
        (chatUser.email && u.email && u.email === chatUser.email)
      );
      if (found) {
        if (found.id !== chatUser.uid) {
          // Migrate user document ID to match their Firebase Auth UID
          const migratedUser = {
            ...found,
            id: chatUser.uid,
            googleId: chatUser.uid,
            email: chatUser.email || found.email || ''
          };
          
          const migrate = async () => {
            try {
              await deleteUserDoc(found.id);
              await addOrUpdateUser(migratedUser);
              setMemberUser(migratedUser);
            } catch (err) {
              console.error("Failed to migrate user document ID:", err);
            }
          };
          migrate();
        } else {
          setMemberUser(found);
        }
      } else {
        // Auto-create a user document for a first-time Google sign-in
        const isDefaultAdminEmail = chatUser.email === 'kduzlu@gmail.com' || chatUser.email === 'admin@ayyldzmotokulp.com';
        const newUser = {
          id: chatUser.uid,
          name: chatUser.displayName ? chatUser.displayName.split(' ')[0] : 'İsimsiz',
          surname: chatUser.displayName ? chatUser.displayName.split(' ').slice(1).join(' ') : '',
          username: chatUser.email || chatUser.uid,
          password: '',
          role: (isDefaultAdminEmail ? 'admin' : 'member') as 'admin' | 'member',
          status: 'approved',
          googleId: chatUser.uid,
          avatarUrl: chatUser.photoURL || '',
          email: chatUser.email || '',
          statusText: isDefaultAdminEmail ? 'Kurucu Üye / Töre Muhafızı' : 'Google Üyesi',
          profile: {},
          privacy: {}
        };
        const createGoogleUser = async () => {
          try {
            await addOrUpdateUser(newUser);
            setMemberUser(newUser);
          } catch (err) {
            console.error("Failed to auto-create Google user document:", err);
          }
        };
        createGoogleUser();
      }
    }
  }, [chatUser, users]);

  // Synchronize local username/password memberUser with current Firebase Auth UID (anonymous or otherwise)
  useEffect(() => {
    if (chatUser && memberUser && memberUser.id !== chatUser.uid) {
      if (memberUser.status === 'approved') {
        const migrateLocalSession = async () => {
          try {
            const migratedUser = {
              ...memberUser,
              id: chatUser.uid,
            };
            await addOrUpdateUser(migratedUser);
            setMemberUser(migratedUser);
            
            // Clean up old document if it wasn't a seeded account like 'admin-1' or 'member-1'
            if (memberUser.id !== 'admin' && memberUser.id !== 'admin-1' && !memberUser.id.startsWith('member-')) {
              await deleteUserDoc(memberUser.id).catch(err => console.warn("Cleanup old user doc ignored:", err));
            }
          } catch (err) {
            console.error("Failed to sync local user session to Firebase Auth UID:", err);
          }
        };
        migrateLocalSession();
      }
    }
  }, [chatUser, memberUser]);

  // Event & Blog Interactivity Handlers
  const handleToggleAttend = async (eventId: string) => {
    const isAttending = userAttendingList.includes(eventId);
    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        const countDiff = isAttending ? -1 : 1;
        const updated = {
          ...evt,
          attendeesCount: Math.max(0, (evt.attendeesCount || 0) + countDiff)
        };
        addOrUpdateEvent(updated);
        return updated;
      }
      return evt;
    });

    if (isAttending) {
      setUserAttendingList(userAttendingList.filter(item => item !== eventId));
    } else {
      setUserAttendingList([...userAttendingList, eventId]);
    }
  };

  const handleLikePost = async (postId: string) => {
    const updatedPosts = blogPosts.map((post) => {
      if (post.id === postId) {
        const updated = {
          ...post,
          likes: (post.likes || 0) + 1
        };
        addOrUpdateBlogPost(updated);
        return updated;
      }
      return post;
    });
  };

  const handleAddComment = async (postId: string, comment: any) => {
    const updatedPosts = blogPosts.map((post) => {
      if (post.id === postId) {
        const updated = {
          ...post,
          comments: [...(post.comments || []), comment]
        };
        addOrUpdateBlogPost(updated);
        return updated;
      }
      return post;
    });
  };

  const handleAddEvent = async (evt: any) => {
    await addOrUpdateEvent(evt);
  };

  const handleAddRoute = async (rt: any) => {
    await addOrUpdateRoute(rt);
  };

  const handleAddBlogPost = async (post: any) => {
    await addOrUpdateBlogPost(post);
  };

  const handleSetUsers = async (updatedUsers: any[]) => {
    setUsers(updatedUsers);
  };

  const handleChatLoginSuccess = (user: any) => {
    setChatUser(user);
  };

  const handleChatLogout = async () => {
    try {
      await logoutUser();
      setChatUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div 
      className="min-h-screen text-gray-100 selection:bg-brand selection:text-white transition-colors duration-300 flex flex-col relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 8, 0.65), rgba(5, 5, 8, 0.82)), url(${IMAGES.heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navbar Header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        currentUser={memberUser}
      />

      {/* Main Page Area */}
      <main className="flex-grow pt-20">
        
        {activePage === 'home' && (
          <>
            <PromoVideo />
            <Hero onDiscoverClick={() => {
              setActivePage('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
            <div className="bg-[#050505] border-b border-neutral-900/50 py-16">
            </div>
            <About />
          </>
        )}

        {activePage === 'about' && (
          <About />
        )}

        {activePage === 'discipline' && (
          <Discipline />
        )}

        {activePage === 'news' && (
          <Blog 
            posts={blogPosts} 
            onAddComment={handleAddComment} 
            onLikePost={handleLikePost} 
            currentUser={memberUser}
            onUpdateBlogPost={handleAddBlogPost}
            onDeleteBlogPost={async (id) => {
              if (window.confirm('Bu haberi tamamen silmek istediğinize emin misiniz?')) {
                await deleteBlogPostDoc(id);
              }
            }}
          />
        )}

        {activePage === 'workspace' && (
          <WorkspacePanel currentUser={memberUser} />
        )}

        {activePage === 'gallery' && (
          <Gallery currentUser={memberUser} setActivePage={setActivePage} />
        )}

        {activePage === 'voice' && (
          <VoiceChannels />
        )}

        {activePage === 'meeting' && (
          <MeetingRoom currentUser={memberUser} />
        )}

        {activePage === 'contact' && (
          <Contact />
        )}

        {activePage === 'messages' && (
          <MessagesPanel currentUser={memberUser} users={users} />
        )}

        {activePage === 'profile' && (
          memberUser ? (
            <Profile 
              currentUser={memberUser} 
              setCurrentUser={async (user) => {
                if (user === null) {
                  setMemberUser(null);
                  setChatUser(null);
                  await logoutUser();
                  setActivePage('home');
                } else {
                  setMemberUser(user);
                }
              }}
              users={users}
              setUsers={handleSetUsers}
              userPosts={userPosts}
              setActivePage={setActivePage}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 animate-fade-in">
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-8 text-center shadow-2xl">
                <Lock className="w-12 h-12 text-brand mx-auto mb-4 animate-pulse" />
                <h2 className="font-bebas text-2xl tracking-wider text-white mb-2">OTURUM AÇMANIZ GEREKLİ</h2>
                <p className="text-neutral-400 text-xs font-sans tracking-wide mb-6 uppercase">Profilinizi ve özel mesajlarınızı görüntülemek için lütfen üye girişi yapın.</p>
                <button
                  onClick={() => setActivePage('admin')}
                  className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-brand/20"
                >
                  ÜYE GİRİŞİ YAP
                </button>
              </div>
            </div>
          )
        )}

        {activePage === 'admin' && (
          <AdminPanel 
            onAddEvent={handleAddEvent}
            onAddRoute={handleAddRoute}
            onAddBlogPost={handleAddBlogPost}
            users={users}
            setUsers={handleSetUsers}
            currentUser={memberUser}
            setCurrentUser={async (user) => {
              if (user === null) {
                setMemberUser(null);
                setChatUser(null);
                await logoutUser();
              } else {
                setMemberUser(user);
              }
            }}
            userPosts={userPosts}
          />
        )}


      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-neutral-950 border border-neutral-900 p-4 rounded-sm shadow-2xl z-50 flex flex-col gap-3 font-sans">
          <p className="text-xs text-gray-400 leading-relaxed">
            AYMC web sitemizde size en iyi deneyimi sunmak için çerezleri kullanıyoruz. Sitemizi kullanarak çerez politikamızı kabul etmiş sayılırsınız.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                localStorage.setItem('cookie_consent_accepted', 'true');
                setShowCookieConsent(false);
              }}
              className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-brand/90 cursor-pointer"
            >
              Kabul Et
            </button>
          </div>
        </div>
      )}

      {/* 7/24 AI Club Support Chat Box */}
      <AISupportWidget />
    </div>
  );
}
