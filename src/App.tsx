/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

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
import Footer from './components/Footer';
import Login from './components/Login';
import Chat from './components/Chat';

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
  addOrUpdateEvent, 
  addOrUpdateRoute, 
  addOrUpdateBlogPost
} from './lib/firebaseService';
import { subscribeAuthState, logoutUser } from './auth';

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
    // 1. Seed default collections if empty
    bootstrapDatabaseIfEmpty();

    // 2. Real-time Firestore subscriptions
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

    // 3. Keep track of firebase auth state for Chat
    const unsubAuth = subscribeAuthState((user) => {
      setChatUser(user);
    });

    return () => {
      unsubUsers();
      unsubEvents();
      unsubRoutes();
      unsubBlog();
      unsubUserPosts();
      unsubAnnouncements();
      unsubAuth();
    };
  }, []);

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
    for (const u of updatedUsers) {
      const existing = users.find(ex => ex.id === u.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(u)) {
        await addOrUpdateUser(u);
      }
    }
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
    <div className="min-h-screen bg-black text-gray-100 selection:bg-brand selection:text-white transition-colors duration-300 flex flex-col">
      {/* Navbar Header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-grow pt-20">
        
        {activePage === 'home' && (
          <>
            <Hero onDiscoverClick={() => {
              setActivePage('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
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
          />
        )}

        {activePage === 'workspace' && (
          <WorkspacePanel currentUser={memberUser} />
        )}

        {activePage === 'contact' && (
          <Contact />
        )}

        {activePage === 'admin' && (
          <AdminPanel 
            onAddEvent={handleAddEvent}
            onAddRoute={handleAddRoute}
            onAddBlogPost={handleAddBlogPost}
            users={users}
            setUsers={handleSetUsers}
            currentUser={memberUser}
            setCurrentUser={setMemberUser}
            userPosts={userPosts}
          />
        )}

      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Utilities */}

      {/* Floating Chat Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => {
            setIsChatOpen(true);
          }}
          title="Canlı Grup Sohbeti"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-brand hover:bg-brand/90 text-white rounded-full shadow-[0_4px_24px_rgba(179,0,0,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
        >
          <span className="absolute right-16 bg-neutral-900 text-brand border border-brand/30 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
            Sohbete Katılın
          </span>
          <span className="absolute inset-0 rounded-full bg-brand/40 animate-ping opacity-75 pointer-events-none"></span>
          <MessageSquare className="w-7 h-7 relative z-10" />
        </button>
      )}

      {/* Floating Chat Window (Widget) */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] h-[70dvh] sm:h-[550px] max-h-[700px] bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="flex-1 overflow-hidden relative">
            {chatUser ? (
              <Chat 
                currentUser={chatUser} 
                onLogoutSuccess={handleChatLogout} 
                onClose={() => setIsChatOpen(false)} 
              />
            ) : (
              <div className="h-full flex flex-col relative bg-[#050505]">
                <div className="bg-[#090909] border-b border-neutral-900 p-4 flex justify-between items-center shrink-0">
                   <h3 className="text-brand font-bebas tracking-wider text-xl">SOHBET GİRİŞİ</h3>
                   <button onClick={() => setIsChatOpen(false)} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                   <Login onLoginSuccess={handleChatLoginSuccess} isLoading={isLoading} setIsLoading={setIsLoading} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
