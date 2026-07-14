import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  CheckSquare, 
  Table, 
  MessageSquare, 
  Lock, 
  Key, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  FilePlus, 
  AlertCircle,
  FolderOpen,
  Users,
  UserPlus,
  Trash2,
  Presentation
} from 'lucide-react';
import { auth, googleAuthProvider, translateFirebaseError } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface WorkspacePanelProps {
  currentUser: any;
}

export default function WorkspacePanel({ currentUser }: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<'drive' | 'tasks' | 'calendar' | 'sheets' | 'slides' | 'chat' | 'contacts'>('drive');
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Workspace fetched data
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
 
  // Form input states
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Check backend authorization status on load or currentUser change
  useEffect(() => {
    checkAuthStatus();
  }, [currentUser]);

  const checkAuthStatus = async () => {
    if (!auth.currentUser) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/workspace/status', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuthorized(data.hasToken);
        if (data.hasToken) {
          fetchTabData(activeTab);
        }
      }
    } catch (err: any) {
      console.error('Error checking status:', err);
    }
  };

  const handleAuthorize = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Popup Google Sign In and request the required Workspace scopes
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error("Google access token could not be obtained.");
      }

      // 2. Register token to our backend Cloud SQL database
      const idToken = await result.user.getIdToken();
      const registerRes = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ accessToken })
      });

      if (!registerRes.ok) {
        const errText = await registerRes.text();
        throw new Error(`Failed to save OAuth token on backend: ${errText}`);
      }

      setAuthorized(true);
      fetchTabData(activeTab);
    } catch (err: any) {
      console.error(err);
      setError(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab: typeof activeTab) => {
    if (!auth.currentUser || !authorized) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      let url = '';
      if (tab === 'drive') url = '/api/drive/files';
      else if (tab === 'tasks') url = '/api/tasks';
      else if (tab === 'calendar') url = '/api/calendar/events';
      else if (tab === 'sheets') url = '/api/sheets';
      else if (tab === 'slides') url = '/api/slides';
      else if (tab === 'chat') url = '/api/chat/spaces';
      else if (tab === 'contacts') url = '/api/contacts';

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Veri yükleme başarısız oldu.');
      }

      const data = await res.json();
      if (tab === 'drive') setDriveFiles(data.files || []);
      else if (tab === 'tasks') setTasks(data.items || []);
      else if (tab === 'calendar') setCalendarEvents(data.items || []);
      else if (tab === 'sheets') setSheets(data.files || []);
      else if (tab === 'slides') setSlides(data.files || []);
      else if (tab === 'chat') {
        setChatSpaces(data.spaces || []);
        if (data.spaces && data.spaces.length > 0) {
          setSelectedSpaceId(data.spaces[0].name);
        }
      }
      else if (tab === 'contacts') {
        setContacts(data.connections || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Keep tab data in sync when switching tabs
  useEffect(() => {
    if (authorized) {
      fetchTabData(activeTab);
    }
  }, [activeTab, authorized]);

  // Handle Drive File Upload
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`,
          content: newFileContent
        })
      });
      if (res.ok) {
        setNewFileName('');
        setNewFileContent('');
        fetchTabData('drive');
      } else {
        const data = await res.json();
        setError(data.error || 'Dosya yüklenemedi.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Task Addition
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          notes: newTaskNotes,
          dueDate: newTaskDue
        })
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskNotes('');
        setNewTaskDue('');
        fetchTabData('tasks');
      } else {
        const data = await res.json();
        setError(data.error || 'Görev oluşturulamadı.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Event Addition
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventStart || !newEventEnd) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title: newEventTitle,
          description: newEventDesc,
          location: newEventLoc,
          startTime: newEventStart,
          endTime: newEventEnd
        })
      });
      if (res.ok) {
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventLoc('');
        setNewEventStart('');
        setNewEventEnd('');
        fetchTabData('calendar');
      } else {
        const data = await res.json();
        setError(data.error || 'Takvim etkinliği oluşturulamadı.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sheet Creation
  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ title: newSheetTitle })
      });
      if (res.ok) {
        setNewSheetTitle('');
        fetchTabData('sheets');
      } else {
        const data = await res.json();
        setError(data.error || 'Spreadsheet oluşturulamadı.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Slide Creation
  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ title: newSlideTitle })
      });
      if (res.ok) {
        setNewSlideTitle('');
        fetchTabData('slides');
      } else {
        const data = await res.json();
        setError(data.error || 'Sunum oluşturulamadı.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Chat Message Sending
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId || !chatMessageText.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          spaceId: selectedSpaceId,
          text: chatMessageText
        })
      });
      if (res.ok) {
        setChatMessageText('');
        setError(null);
        alert('Duyuru mesajı başarıyla Google Chat alanına gönderildi!');
      } else {
        const data = await res.json();
        setError(data.error || 'Duyuru gönderilemedi.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Contact Creation
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: newContactName,
          email: newContactEmail,
          phone: newContactPhone
        })
      });
      if (res.ok) {
        setNewContactName('');
        setNewContactEmail('');
        setNewContactPhone('');
        fetchTabData('contacts');
      } else {
        const data = await res.json();
        setError(data.error || 'Kişi eklenemedi.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Contact Deletion (With Mandatory User Confirmation)
  const handleDeleteContact = async (resourceName: string, name: string) => {
    const confirmed = window.confirm(
      `"${name}" kişisini Google Rehberinizden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const idToken = await auth.currentUser!.getIdToken();
      const res = await fetch(`/api/contacts?resourceName=${encodeURIComponent(resourceName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        fetchTabData('contacts');
      } else {
        const data = await res.json();
        setError(data.error || 'Kişi silinemedi.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-6 max-w-6xl mx-auto shadow-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
            Google Bulut & Workspace Entegrasyonu
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Kulüp sürüş planları, sürüş dökümanları ve görevlerini Google Cloud (PostgreSQL) ve Google Workspace servisleriyle yönetin.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {authorized ? (
            <span className="flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
              <Key className="w-3.5 h-3.5" /> Google Bağlı
            </span>
          ) : (
            <button
              onClick={handleAuthorize}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" /> {loading ? 'Bağlanıyor...' : 'Google ile Bağlan'}
            </button>
          )}

          <button
            onClick={() => fetchTabData(activeTab)}
            disabled={loading || !authorized}
            className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-35 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded mb-6 flex items-start gap-2.5 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Hata: </span> {error}
          </div>
        </div>
      )}

      {!authorized ? (
        <div className="text-center py-16 px-4 bg-neutral-950/30 border border-dashed border-neutral-800 rounded-lg">
          <Key className="w-14 h-14 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-200">Google Yetkilendirmesi Gerekli</h3>
          <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
            Sürüş takvimi, kulüp dökümanları (Google Drive & Sheets), görev listeleri ve Google Chat duyurularına erişmek için kulüp hesabınızı bağlayın.
          </p>
          <button
            onClick={handleAuthorize}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all active:scale-95"
          >
            <Lock className="w-4 h-4" /> Google Hesabını Yetkilendir
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Navigation */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-3 lg:pb-0 lg:pr-4">
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'drive' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <FileText className="w-4 h-4" /> Google Drive Belgeleri
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'tasks' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Kulüp Görevleri (Tasks)
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'calendar' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" /> Sürüş Takvimi (Calendar)
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'sheets' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Table className="w-4 h-4" /> Sürüş Raporları (Sheets)
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'slides' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Presentation className="w-4 h-4" /> Sürüş Sunumları (Slides)
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'chat' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Google Chat Duyuru
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'contacts' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Users className="w-4 h-4" /> Rehber (Contacts)
            </button>
          </div>

          {/* Active Tab Area */}
          <div className="lg:col-span-3 min-h-[400px]">
            {loading && driveFiles.length === 0 && tasks.length === 0 && calendarEvents.length === 0 && sheets.length === 0 && contacts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <span className="text-sm text-neutral-400">Veriler yükleniyor, lütfen bekleyin...</span>
              </div>
            )}

            {/* TAB: DRIVE */}
            {activeTab === 'drive' && (
              <div className="space-y-6">
                <form onSubmit={handleUploadFile} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <FilePlus className="w-3.5 h-3.5" /> Yeni Belge Yükle (.txt)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Dosya Adı (Örn: surus_rotasi_v1)"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newFileName.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-4 py-2 transition-colors active:scale-95"
                    >
                      {submitting ? 'Yükleniyor...' : 'Drive\'a Kaydet'}
                    </button>
                  </div>
                  <textarea
                    placeholder="Dosya içeriğini yazın..."
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Google Drive Dosyalarınız (PostgreSQL Önbellekli)</h3>
                  {driveFiles.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Google Drive'da dosya bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {driveFiles.map((file) => (
                        <div key={file.id} className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded flex items-center justify-between hover:border-neutral-700 transition-colors">
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="truncate">
                              <p className="text-sm font-medium text-neutral-200 truncate">{file.name}</p>
                              <p className="text-[10px] text-neutral-500 truncate">{file.mimeType}</p>
                            </div>
                          </div>
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-emerald-400 p-1"
                            title="Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <form onSubmit={handleAddTask} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Yeni Görev Ekle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Görev Başlığı"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Açıklama / Notlar"
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newTaskTitle.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-4 py-2 transition-colors active:scale-95 shrink-0"
                    >
                      {submitting ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Aktif Görev Listesi (PostgreSQL Veritabanı)</h3>
                  {tasks.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Hiç görev bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tasks.map((task) => (
                        <div key={task.id} className="bg-neutral-950/50 border border-neutral-800 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-start gap-2.5">
                            <CheckSquare className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-neutral-200">{task.title}</p>
                              {task.notes && <p className="text-xs text-neutral-400 mt-1">{task.notes}</p>}
                              {task.due && (
                                <p className="text-[10px] text-emerald-400/80 font-semibold mt-1">
                                  Bitiş Tarihi: {new Date(task.due).toLocaleDateString('tr-TR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 ${
                            task.status === 'completed' 
                              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-neutral-900 border border-neutral-700 text-neutral-400'
                          }`}>
                            {task.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <form onSubmit={handleAddEvent} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Yeni Sürüş Etkinliği Ekle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Etkinlik Adı (Sürüş Adı)"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Konum (Buluşma Noktası)"
                      value={newEventLoc}
                      onChange={(e) => setNewEventLoc(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Başlangıç Zamanı</label>
                      <input
                        type="datetime-local"
                        value={newEventStart}
                        onChange={(e) => setNewEventStart(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Bitiş Zamanı</label>
                      <input
                        type="datetime-local"
                        value={newEventEnd}
                        onChange={(e) => setNewEventEnd(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Sürüş Detayları / Güzergah Açıklaması"
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newEventTitle.trim() || !newEventStart || !newEventEnd}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-5 py-2 transition-colors active:scale-95 shrink-0"
                    >
                      {submitting ? 'Ekleniyor...' : 'Takvime Ekle'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Kulüp Sürüş Takvimi (Google Calendar & SQL Senkronize)</h3>
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Gelecek bir takvim etkinliği bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calendarEvents.map((ev) => (
                        <div key={ev.id} className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-neutral-200">{ev.summary}</p>
                              {ev.description && <p className="text-xs text-neutral-400 mt-1">{ev.description}</p>}
                              {ev.location && <p className="text-xs text-neutral-500 mt-1">📍 {ev.location}</p>}
                            </div>
                          </div>
                          
                          <div className="text-left md:text-right text-xs text-neutral-400 shrink-0">
                            <p className="font-semibold text-emerald-400">
                              {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString('tr-TR') : ev.start?.date}
                            </p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              Bitiş: {ev.end?.dateTime ? new Date(ev.end.dateTime).toLocaleString('tr-TR') : ev.end?.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SHEETS */}
            {activeTab === 'sheets' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateSheet} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Yeni Sürüş Katılım / Yakıt Takip Tablosu Oluştur</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="E-Tablo Adı (Örn: 2026_Yakit_Gider_Raporu)"
                      value={newSheetTitle}
                      onChange={(e) => setNewSheetTitle(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newSheetTitle.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-5 py-2 transition-colors active:scale-95 shrink-0"
                    >
                      {submitting ? 'Oluşturuluyor...' : 'E-Tablo Oluştur'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Kulüp Google E-Tabloları</h3>
                  {sheets.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Kulübe ait Google E-Tablo bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {sheets.map((sheet) => (
                        <div key={sheet.id} className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Table className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-200 truncate">{sheet.name}</p>
                              <p className="text-[10px] text-neutral-500">Google E-Tablolar Dökümanı</p>
                            </div>
                          </div>
                          
                          <a
                            href={sheet.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-emerald-400 p-2 rounded-lg transition-all"
                            title="Google Sheets'te Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SLIDES */}
            {activeTab === 'slides' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateSlide} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Yeni Kulüp Tanıtım / Sürüş Güzergah Sunumu Oluştur</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Sunum Adı (Örn: AYMC_Mugla_Tur_Tanitimi)"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newSlideTitle.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-5 py-2 transition-colors active:scale-95 shrink-0"
                    >
                      {submitting ? 'Oluşturuluyor...' : 'Sunum Oluştur'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Kulüp Google Slayt Sunumları</h3>
                  {slides.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Kulübe ait Google Slayt Sunumu bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {slides.map((slide) => (
                        <div key={slide.id} className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Presentation className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-200 truncate">{slide.name}</p>
                              <p className="text-[10px] text-neutral-500">Google Slaytlar Dökümanı</p>
                            </div>
                          </div>
                          
                          <a
                            href={slide.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-emerald-400 p-2 rounded-lg transition-all"
                            title="Google Slides'ta Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CHAT */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="bg-neutral-950/40 border border-neutral-800 p-5 rounded-lg space-y-4">
                  <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Google Chat Duyuru Alanı
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Aşağıdan Google Chat alanını seçerek tüm kulüp üyelerine anlık Google Chat duyurusu gönderebilirsiniz.
                  </p>

                  <form onSubmit={handleSendChatMessage} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Google Chat Kanalı (Alan)</label>
                      {chatSpaces.length === 0 ? (
                        <select className="w-full bg-neutral-900 border border-neutral-850 text-neutral-500 rounded px-3 py-2 text-sm focus:outline-none" disabled>
                          <option>Aktif Google Chat alanı bulunamadı</option>
                        </select>
                      ) : (
                        <select
                          value={selectedSpaceId}
                          onChange={(e) => setSelectedSpaceId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        >
                          {chatSpaces.map((space) => (
                            <option key={space.name} value={space.name}>
                              {space.displayName || space.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Duyuru Mesajı</label>
                      <textarea
                        placeholder="Google Chat alanına gönderilecek kulüp duyurusunu yazın..."
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !chatMessageText.trim() || chatSpaces.length === 0}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-lg text-sm px-4 py-2.5 transition-all shadow-md active:scale-[0.98]"
                    >
                      {submitting ? 'Gönderiliyor...' : 'Google Chat Duyurusu Paylaş'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <form onSubmit={handleAddContact} className="bg-neutral-950/40 border border-neutral-800 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> Google Rehberine Kişi / Üye Ekle
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="E-posta Adresi"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Telefon Numarası"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !newContactName.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded text-sm px-5 py-2 transition-colors active:scale-95"
                    >
                      {submitting ? 'Kaydediliyor...' : 'Rehbere Kaydet'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-300">Google Kişiler Rehberi ({contacts.length} Kişi)</h3>
                  {contacts.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/20 rounded border border-neutral-850">
                      <p className="text-sm text-neutral-500">Google Rehberinizde kayıtlı kişi bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contacts.map((contact) => {
                        const nameObj = contact.names && contact.names[0];
                        const name = nameObj ? nameObj.displayName : 'İsimsiz';
                        const emailObj = contact.emailAddresses && contact.emailAddresses[0];
                        const email = emailObj ? emailObj.value : 'E-posta Yok';
                        const phoneObj = contact.phoneNumbers && contact.phoneNumbers[0];
                        const phone = phoneObj ? phoneObj.value : 'Telefon Yok';
                        const photoObj = contact.photos && contact.photos[0];
                        const photoUrl = photoObj && !photoObj.default ? photoObj.url : null;

                        return (
                          <div key={contact.resourceName} className="bg-neutral-950/50 border border-neutral-800 p-3.5 rounded-lg flex items-center justify-between hover:border-neutral-700 transition-colors">
                            <div className="flex items-center gap-3 truncate min-w-0">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full shrink-0 object-cover border border-neutral-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full shrink-0 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="truncate">
                                <p className="text-sm font-semibold text-neutral-200 truncate">{name}</p>
                                <p className="text-xs text-neutral-400 truncate">{email}</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{phone}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteContact(contact.resourceName, name)}
                              className="text-neutral-500 hover:text-red-500 p-2 rounded transition-colors shrink-0"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
