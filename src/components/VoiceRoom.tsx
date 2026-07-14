import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Radio, 
  X, 
  Users, 
  Disc, 
  Wifi, 
  Headphones, 
  CornerDownRight, 
  CircleDot,
  RadioTower,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Key,
  Shield,
  Settings,
  Sliders,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  LogOut,
  Info,
  Bike,
  Moon,
  Coffee,
  Crown,
  Star,
  Flag
} from 'lucide-react';
import { VoiceChannel, VoiceMember, User } from '../types';
import { 
  joinVoiceChannel, 
  leaveVoiceChannel, 
  updateVoiceState, 
  sendVoicePacket, 
  subscribeVoicePresence, 
  subscribeVoicePackets,
  subscribeVoiceChannels,
  createVoiceChannel,
  deleteVoiceChannel,
  editVoiceChannel,
  setServerMutedState,
  kickUserFromVoice,
  moveUserToChannel
} from '../firestore';
import { subscribeUsers } from '../lib/firebaseService';

interface VoiceRoomProps {
  currentUser: any;
  onClose: () => void;
}

interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'danger';
}

// Default/Fallback static voice channels
const DEFAULT_CHANNELS: VoiceChannel[] = [
  { id: 'genel-sohbet', name: '🔴 GENEL SOHBET', description: 'Tüm kulüp üyeleri sohbet alanı', icon: 'Radio', isStatic: true },
  { id: 'uzun-yol-ekibi', name: '🏍️ UZUN YOL EKİBİ', description: 'Yoldaki aktif sürüş koordinasyonu', icon: 'Ride', isStatic: true },
  { id: 'gece-surusu', name: '🌙 GECE SÜRÜŞÜ', description: 'Gece sürüş ekibi haberleşme', icon: 'Moon', isStatic: true },
  { id: 'etkinlik-hazirligi', name: '🏁 ETKİNLİK HAZIRLIĞI', description: 'Yaklaşan etkinlik planlaması', icon: 'Flag', isStatic: true },
  { id: 'misafir-odasi', name: '☕ MİSAFİR ODASI', description: 'Kulüp misafirleri ve serbest alan', icon: 'Coffee', isStatic: true },
  { id: 'moderator', name: '🛡️ MODERATÖR', description: 'Sadece moderatörler girebilir', icon: 'Shield', roleRestriction: 'moderator', isStatic: true },
  { id: 'kulup-yonetimi', name: '👑 KULÜP YÖNETİMİ', description: 'Yönetim ekibi toplantı kanalı', icon: 'Crown', roleRestriction: 'admin', isStatic: true },
  { id: 'yonetim-kurulu', name: '👑 YÖNETİM KURULU', description: 'Yönetim Kurulu resmi toplantı odası', icon: 'Star', roleRestriction: 'admin', isStatic: true }
];

const getChannelIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Ride':
    case 'Bike':
      return <Bike className="w-4.5 h-4.5 shrink-0" />;
    case 'Moon':
      return <Moon className="w-4.5 h-4.5 shrink-0" />;
    case 'Coffee':
      return <Coffee className="w-4.5 h-4.5 shrink-0" />;
    case 'Shield':
      return <Shield className="w-4.5 h-4.5 shrink-0" />;
    case 'Crown':
      return <Crown className="w-4.5 h-4.5 shrink-0" />;
    case 'Star':
      return <Star className="w-4.5 h-4.5 shrink-0" />;
    case 'Flag':
      return <Flag className="w-4.5 h-4.5 shrink-0" />;
    case 'Radio':
    default:
      return <Radio className="w-4.5 h-4.5 shrink-0" />;
  }
};

// Synth audio feedback for TeamSpeak / Walkie-Talkie walkie squelches
const playSynthSound = (type: 'click-on' | 'click-off' | 'join' | 'leave' | 'mute' | 'unmute' | 'error' | 'admin') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'click-on') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'click-off') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'join') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'leave') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.setValueAtTime(659.25, now + 0.07);
      osc.frequency.setValueAtTime(523.25, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'mute' || type === 'unmute') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'mute' ? 350 : 700, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'admin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1100, now + 0.08);
      osc.frequency.setValueAtTime(1320, now + 0.16);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    console.warn("Synth sound blocked/unsupported:", e);
  }
};

export default function VoiceRoom({ currentUser, onClose }: VoiceRoomProps) {
  // User profiles list from Firestore
  const [usersList, setUsersList] = useState<User[]>([]);
  
  // Channels and Presence States
  const [activeChannelId, setActiveChannelId] = useState<string | null>(() => {
    return localStorage.getItem('aymc_voice_last_channel') || null;
  });
  const [dbChannels, setDbChannels] = useState<VoiceChannel[]>([]);
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  // Microphone Settings & Web Audio API Controls
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('aymc_voice_muted') === 'true';
  });
  const [isDeafened, setIsDeafened] = useState<boolean>(() => {
    return localStorage.getItem('aymc_voice_deafened') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [continuousMic, setContinuousMic] = useState<boolean>(() => {
    return localStorage.getItem('aymc_voice_vox_mode') === 'true';
  });
  const [inputGain, setInputGain] = useState<number>(() => {
    const saved = localStorage.getItem('aymc_voice_input_gain');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  const [autoGainControl, setAutoGainControl] = useState<boolean>(true);
  const [voxThreshold, setVoxThreshold] = useState<number>(15); // Vox sensitivity (0-100)
  const [liveVolume, setLiveVolume] = useState<number>(0); // Bouncing volume level (0-100)
  const [error, setError] = useState<string | null>(null);

  // Layout and Menu toggles
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCreateChannel, setShowCreateChannel] = useState<boolean>(false);
  const [selectedMemberActions, setSelectedMemberActions] = useState<string | null>(null); // For admin context menus
  const [channelPasswordInput, setChannelPasswordInput] = useState<{ channelId: string; passwordRequired: string } | null>(null);
  const [typedPassword, setTypedPassword] = useState<string>('');

  // Channel Form States (Admin)
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newChannelDesc, setNewChannelDesc] = useState<string>('');
  const [newChannelPass, setNewChannelPass] = useState<string>('');
  const [newChannelRole, setNewChannelRole] = useState<string>('');
  const [newChannelIcon, setNewChannelIcon] = useState<string>('Radio');

  // Media Capture Audio Refs
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voicePacketsUnsubRef = useRef<(() => void) | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playedPacketsRef = useRef<Set<string>>(new Set());
  const prevMembersRef = useRef<VoiceMember[]>([]);

  // Web Audio Analyser Refs for Volume Metering
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const voxActiveRef = useRef<boolean>(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const myUid = currentUser.uid || currentUser.id || '';
  const myUserObj = usersList.find(u => u.id === myUid);
  const myRole = myUserObj?.role || currentUser.role || 'member';
  const isAdmin = myRole === 'admin';

  // Format timestamp for system logs
  const getLogTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  // Add system log line helper
  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'danger' = 'info') => {
    const newLog: SystemLog = {
      id: Math.random().toString(),
      timestamp: getLogTime(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 40)); // Keep last 40 entries
  };

  // Combine static predefined channels and dynamic channels from Firestore
  const allChannels = [...DEFAULT_CHANNELS, ...dbChannels];

  // Subscribe to Users to match roles and exact names
  useEffect(() => {
    const unsub = subscribeUsers((loadedUsers) => {
      setUsersList(loadedUsers);
    });
    return () => unsub();
  }, []);

  // Subscribe to dynamic voice channels
  useEffect(() => {
    const unsub = subscribeVoiceChannels((channels) => {
      setDbChannels(channels);
    });
    return () => unsub();
  }, []);

  // Subscribe to active voice channel presences and generate real-time events logs
  useEffect(() => {
    const unsub = subscribeVoicePresence((activeMembers) => {
      // Analyze differences to trigger logs and sounds
      if (prevMembersRef.current.length > 0) {
        activeMembers.forEach(member => {
          const prev = prevMembersRef.current.find(m => m.uid === member.uid);
          // Case 1: Joined a channel
          if (member.activeChannelId && (!prev || prev.activeChannelId !== member.activeChannelId)) {
            const chName = allChannels.find(c => c.id === member.activeChannelId)?.name || 'Kanal';
            addLog(`➔ ${member.displayName} "${chName}" odasına bağlandı.`, member.role === 'admin' ? 'danger' : 'info');
            if (member.role === 'admin' && member.activeChannelId === activeChannelId) {
              playSynthSound('admin');
            }
          }
          // Case 2: Muted state changed
          if (prev && prev.activeChannelId === member.activeChannelId && member.activeChannelId === activeChannelId) {
            if (prev.isMuted !== member.isMuted) {
              addLog(`🎙️ ${member.displayName} mikrofonunu ${member.isMuted ? 'kapattı' : 'açtı'}.`, member.isMuted ? 'warn' : 'success');
            }
          }
        });

        prevMembersRef.current.forEach(prev => {
          const cur = activeMembers.find(m => m.uid === prev.uid);
          // Case 3: Left channel
          if (prev.activeChannelId && (!cur || !cur.activeChannelId)) {
            const chName = allChannels.find(c => c.id === prev.activeChannelId)?.name || 'Kanal';
            addLog(`➔ ${prev.displayName} "${chName}" odasından ayrıldı.`, 'warn');
          }
        });
      }
      
      prevMembersRef.current = activeMembers;
      setMembers(activeMembers);

      // Self Check: Forced admin server mutes or moves
      const me = activeMembers.find(m => m.uid === myUid);
      if (me) {
        if (me.isServerMuted && !isMuted) {
          setIsMuted(true);
          addLog("⚠️ Sunucu tarafından susturuldunuz!", "danger");
          playSynthSound('error');
          cleanupMedia();
        }
        if (me.activeChannelId !== activeChannelId) {
          setActiveChannelId(me.activeChannelId);
          if (me.activeChannelId) {
            addLog(`⚠️ Bir yönetici sizi yeni bir odaya taşıdı.`, "warn");
            playSynthSound('join');
          } else {
            addLog(`⚠️ Sunucudan bağlantınız kesildi.`, "warn");
            playSynthSound('leave');
            cleanupMedia();
          }
        }
      }
    });

    return () => {
      unsub();
      leaveVoiceChannel(myUid);
      cleanupMedia();
    };
  }, [currentUser, activeChannelId, isMuted, allChannels.length]);

  // Clean up recording streams and analysis loop
  const cleanupMedia = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsSpeaking(false);
    voxActiveRef.current = false;
    setLiveVolume(0);
  };

  // Play audio packets from subscription
  useEffect(() => {
    if (voicePacketsUnsubRef.current) {
      voicePacketsUnsubRef.current();
      voicePacketsUnsubRef.current = null;
    }

    if (!activeChannelId || isDeafened) {
      cleanupMedia();
      return;
    }

    voicePacketsUnsubRef.current = subscribeVoicePackets(activeChannelId, (packet) => {
      // Ignore own voice
      if (packet.senderUid === myUid) return;

      if (playedPacketsRef.current.has(packet.id)) return;
      playedPacketsRef.current.add(packet.id);

      try {
        const audio = new Audio(packet.audioData);
        audio.volume = inputGain; // Set client-side listening volume
        audio.play().catch(e => {
          console.warn("Autoplay blocked:", e);
        });
      } catch (err) {
        console.error("Voice packet playback error:", err);
      }
    });

    return () => {
      if (voicePacketsUnsubRef.current) {
        voicePacketsUnsubRef.current();
      }
    };
  }, [activeChannelId, isDeafened, currentUser, inputGain]);

  // Sync state to Firestore presence
  useEffect(() => {
    const name = currentUser.displayName || 'Anonim';
    const photo = currentUser.photoURL || null;

    if (activeChannelId) {
      joinVoiceChannel(myUid, name, photo, activeChannelId, myRole);
      updateVoiceState(myUid, {
        isMuted,
        isDeafened,
        isSpeaking
      });
    } else {
      leaveVoiceChannel(myUid);
    }
  }, [activeChannelId, isMuted, isDeafened, isSpeaking, currentUser, myRole]);

  // Local storage state saving
  useEffect(() => {
    localStorage.setItem('aymc_voice_muted', isMuted ? 'true' : 'false');
    localStorage.setItem('aymc_voice_deafened', isDeafened ? 'true' : 'false');
    localStorage.setItem('aymc_voice_vox_mode', continuousMic ? 'true' : 'false');
    localStorage.setItem('aymc_voice_input_gain', inputGain.toString());
    if (activeChannelId) {
      localStorage.setItem('aymc_voice_last_channel', activeChannelId);
    } else {
      localStorage.removeItem('aymc_voice_last_channel');
    }
  }, [isMuted, isDeafened, continuousMic, inputGain, activeChannelId]);

  // Audio Signal Analysis & Volume Metering
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      const analyzeVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        
        const average = sum / dataArrayRef.current.length;
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        setLiveVolume(normalizedVol);

        // Dynamic Voice Activation Detection (VOX Mode)
        if (continuousMic && !isMuted) {
          if (normalizedVol > voxThreshold) {
            // Volume is above threshold, speak instantly!
            if (!voxActiveRef.current) {
              voxActiveRef.current = true;
              setIsSpeaking(true);
              startTransmitting(stream);
            }
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
              silenceTimeoutRef.current = null;
            }
          } else {
            // Below threshold, start silence grace timeout (1.5 seconds) to avoid immediate cuts
            if (voxActiveRef.current && !silenceTimeoutRef.current) {
              silenceTimeoutRef.current = setTimeout(() => {
                voxActiveRef.current = false;
                setIsSpeaking(false);
                stopTransmitting();
              }, 1500);
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(analyzeVolume);
      };

      analyzeVolume();
    } catch (e) {
      console.warn("Failed to setup mic signal analyser:", e);
    }
  };

  // Convert Voice Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start micro recording & transmission
  const startTransmitting = (stream: MediaStream) => {
    try {
      voiceChunksRef.current = [];
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          voiceChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (voiceChunksRef.current.length > 0 && activeChannelId && !isMuted) {
          const voiceBlob = new Blob(voiceChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          try {
            const base64Data = await blobToBase64(voiceBlob);
            const myName = currentUser.displayName || 'Anonim';
            await sendVoicePacket(activeChannelId, myUid, myName, base64Data);
          } catch (err) {
            console.error("Voice packet send failure:", err);
          }
        }
      };

      mediaRecorder.start();

      // Automatically chop packets every 3 seconds to keep VOIP delivery super quick and responsive
      speakingTimerRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start();
        }
      }, 3000);

    } catch (e) {
      console.error("Transmitting capture setup failed:", e);
    }
  };

  const stopTransmitting = () => {
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Manual Trigger: PTT or Mic Lock
  const startVoiceCapture = async () => {
    if (!activeChannelId) {
      setError("Bağlantı bulunamadı. Lütfen önce bir odaya katılın.");
      return;
    }
    if (isMuted || isDeafened) {
      setError("Mikrofonunuz kapalı!");
      return;
    }

    try {
      cleanupMedia();
      playSynthSound('click-on');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl
        } 
      });
      
      streamRef.current = stream;
      setupAudioAnalysis(stream);

      if (!continuousMic) {
        setIsSpeaking(true);
        startTransmitting(stream);
      }
      
      setError(null);
    } catch (err) {
      console.error("Mic stream request failed:", err);
      setError("Mikrofonunuza erişilemedi. Lütfen sistem izinlerinizi kontrol edin.");
      playSynthSound('error');
    }
  };

  const stopVoiceCapture = () => {
    if (!isSpeaking && !continuousMic) return;
    playSynthSound('click-off');
    cleanupMedia();
  };

  // Keyboard binding for Push-to-Talk (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' && activeChannelId && !isSpeaking && !continuousMic && !isMuted) {
        e.preventDefault();
        startVoiceCapture();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpeaking && !continuousMic) {
        e.preventDefault();
        stopVoiceCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeChannelId, isSpeaking, continuousMic, isMuted, echoCancellation, noiseSuppression, autoGainControl]);

  // Handle Channel Join Actions (Role / Password checks)
  const handleJoinChannel = (channel: VoiceChannel) => {
    if (activeChannelId === channel.id) return;

    // 1. Role Restricted Odam
    if (channel.roleRestriction) {
      if (channel.roleRestriction === 'admin' && myRole !== 'admin') {
        setError(`"${channel.name}" odasına giriş engellendi. Sadece KULÜP YÖNETİCİLERİ katılabilir.`);
        playSynthSound('error');
        return;
      }
      if (channel.roleRestriction === 'moderator' && myRole !== 'admin' && myRole !== 'moderator') {
        setError(`"${channel.name}" odasına giriş engellendi. Sadece MODERATÖRLER katılabilir.`);
        playSynthSound('error');
        return;
      }
    }

    // 2. Password Restricted Odam
    if (channel.password && myRole !== 'admin') {
      setChannelPasswordInput({ channelId: channel.id, passwordRequired: channel.password });
      setTypedPassword('');
      setError(null);
      return;
    }

    // Join OK
    playSynthSound('join');
    setActiveChannelId(channel.id);
    setError(null);
    addLog(`"${channel.name}" odasına giriş yaptınız.`, "success");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelPasswordInput) return;

    if (typedPassword === channelPasswordInput.passwordRequired) {
      playSynthSound('join');
      setActiveChannelId(channelPasswordInput.channelId);
      const chName = allChannels.find(c => c.id === channelPasswordInput.channelId)?.name || 'Kanal';
      addLog(`"${chName}" şifreli odasına giriş yaptınız.`, "success");
      setChannelPasswordInput(null);
      setError(null);
    } else {
      setError("Hatalı oda şifresi! Erişim reddedildi.");
      playSynthSound('error');
    }
  };

  const handleDisconnect = () => {
    if (!activeChannelId) return;
    
    playSynthSound('leave');
    leaveVoiceChannel(myUid);
    addLog(`"${allChannels.find(c => c.id === activeChannelId)?.name}" odasından ayrıldınız.`, "warn");
    setActiveChannelId(null);
    cleanupMedia();
  };

  const toggleMute = () => {
    // Prevent unmuting if server muted
    const myPresence = members.find(m => m.uid === myUid);
    if (myPresence?.isServerMuted && isMuted) {
      setError("Yönetici tarafından susturulduğunuz için sesinizi açamazsınız.");
      playSynthSound('error');
      return;
    }

    const nextVal = !isMuted;
    setIsMuted(nextVal);
    playSynthSound(nextVal ? 'mute' : 'unmute');
    if (nextVal) {
      cleanupMedia();
    }
  };

  const toggleDeafen = () => {
    const nextVal = !isDeafened;
    setIsDeafened(nextVal);
    playSynthSound(nextVal ? 'mute' : 'unmute');
    if (nextVal) {
      setIsMuted(true);
      cleanupMedia();
    } else {
      // Restore mic if not server muted
      const myPresence = members.find(m => m.uid === myUid);
      if (!myPresence?.isServerMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleToggleContinuousMic = () => {
    const newVal = !continuousMic;
    setContinuousMic(newVal);
    playSynthSound('mute');
    cleanupMedia();
    if (newVal) {
      addLog("🎙️ Ses Aktivasyonu (VOX) modu etkinleştirildi.", "info");
    } else {
      addLog("🎙️ Bas-Konuş (Spacebar) modu etkinleştirildi.", "info");
    }
  };

  // ADMIN ACTIONS: Channel management
  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newId = `ch-${Date.now()}`;
    const newChannel: VoiceChannel = {
      id: newId,
      name: newChannelName.trim().toUpperCase(),
      description: newChannelDesc.trim(),
      icon: newChannelIcon,
      password: newChannelPass.trim() || undefined,
      roleRestriction: newChannelRole || undefined,
      isLocked: !!newChannelPass.trim(),
      isStatic: false
    };

    await createVoiceChannel(newChannel);
    addLog(`👑 Yeni oda oluşturuldu: "${newChannel.name}"`, "success");
    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelPass('');
    setNewChannelRole('');
    setShowCreateChannel(false);
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (window.confirm(`"${name}" sesli odasını tamamen silmek istediğinize emin misiniz?`)) {
      await deleteVoiceChannel(id);
      addLog(`👑 Oda silindi: "${name}"`, "warn");
    }
  };

  // Fetch channel members helper
  const getChannelMembers = (channelId: string) => {
    return members.filter(m => m.activeChannelId === channelId);
  };

  const renderChannel = (channel: VoiceChannel) => {
    const isMeInThis = activeChannelId === channel.id;
    const channelMembers = getChannelMembers(channel.id);
    const hasMembers = channelMembers.length > 0;
    
    // Custom theme colors for different channels
    const isOfficial = channel.roleRestriction === 'admin' || channel.roleRestriction === 'moderator' || channel.id === 'moderator' || channel.id === 'kulup-yonetimi' || channel.id === 'yonetim-kurulu';
    
    return (
      <div 
        key={channel.id} 
        className={`border rounded-xl transition-all duration-300 overflow-hidden ${
          isMeInThis 
            ? 'border-brand/70 bg-brand/5 shadow-[0_0_15px_rgba(239,68,68,0.15)] border-l-4 border-l-brand' 
            : hasMembers
              ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:border-emerald-400'
              : isOfficial
                ? 'border-amber-900/40 bg-amber-950/10 hover:border-amber-700/60'
                : 'border-neutral-900 bg-[#0c0c0c]/90 hover:border-neutral-850 hover:bg-neutral-900/60'
        }`}
      >
        {/* Channel summary item row */}
        <div 
          onClick={() => handleJoinChannel(channel)}
          className="px-4 py-3.5 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            {/* Dynamic styled channel icon box */}
            <div className={`p-2.5 rounded-lg transition-all duration-300 ${
              isMeInThis 
                ? 'bg-brand text-white scale-105 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                : hasMembers
                  ? 'bg-emerald-950/60 border border-emerald-500/35 text-emerald-400'
                  : isOfficial
                    ? 'bg-amber-950/60 border border-amber-900/35 text-amber-500'
                    : 'bg-neutral-950 border border-neutral-900 text-neutral-400 group-hover:text-brand group-hover:border-brand/40'
            }`}>
              {getChannelIcon(channel.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-[13px] md:text-sm font-bold tracking-wide transition-colors ${
                  isMeInThis 
                    ? 'text-white' 
                    : hasMembers
                      ? 'text-emerald-300 group-hover:text-emerald-200'
                      : 'text-neutral-200 group-hover:text-white'
                }`}>
                  {channel.name}
                </h4>
                {isMeInThis && (
                  <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded font-mono uppercase font-semibold tracking-wider animate-pulse">
                    BAĞLISINIZ
                  </span>
                )}
                {channel.password && (
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/35" title="Şifreli Kanal">
                    <Lock className="w-2.5 h-2.5" />
                    <span className="font-mono font-bold">ŞİFRELİ</span>
                  </span>
                )}
                {channel.roleRestriction && (
                  <span className="flex items-center gap-0.5 text-[9px] text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-900/35" title="Yetkili Özel Kanalı">
                    <Shield className="w-2.5 h-2.5" />
                    <span className="font-mono font-bold uppercase">{channel.roleRestriction}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{channel.description}</p>
            </div>
          </div>

          {/* Participant count counter & Admin controls */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isAdmin && !channel.isStatic && (
              <button
                onClick={() => handleDeleteChannel(channel.id, channel.name)}
                className="p-1.5 rounded text-neutral-500 hover:bg-neutral-900 hover:text-red-450 transition-colors cursor-pointer"
                title="Odayı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {/* Active members count pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono shadow-inner transition-colors ${
              isMeInThis
                ? 'bg-brand/20 border border-brand/35 text-white'
                : hasMembers
                  ? 'bg-emerald-950/60 border border-emerald-500/35 text-emerald-300 font-bold'
                  : 'bg-neutral-950 border border-neutral-900 text-neutral-450'
            }`}>
              <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>{channelMembers.length}</span>
            </div>
          </div>
        </div>

        {/* Member nested list inside this channel */}
        {channelMembers.length > 0 && (
          <div className="bg-black/45 border-t border-neutral-900 px-4 py-2.5 space-y-2">
            {channelMembers.map((member) => {
              const isMe = member.uid === myUid;
              const hasAdminPrivilege = member.role === 'admin';
              const hasModPrivilege = member.role === 'moderator';
              
              return (
                <div 
                  key={member.uid} 
                  className="relative flex flex-col"
                >
                  <div className="flex items-center justify-between py-1.5 bg-black/10 border-b border-neutral-900/35 last:border-0 rounded px-1.5 hover:bg-neutral-900/30 transition-all duration-150">
                    <div className="flex items-center gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                      
                      {/* Speaking glowing animation circle status */}
                      <div className="relative">
                        <span className={`w-3.5 h-3.5 rounded-full block border ${
                          member.isSpeaking
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse'
                            : member.isDeafened
                              ? 'bg-neutral-800 border-neutral-700'
                              : member.isMuted
                                ? 'bg-amber-600 border-amber-500'
                                : 'bg-neutral-600 border-neutral-500'
                        }`} />
                        {member.isSpeaking && (
                          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
                        )}
                      </div>

                      {/* Avatar or profile image snippet if uploaded */}
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-4.5 h-4.5 rounded-full object-cover border border-neutral-850" 
                        />
                      ) : null}

                      {/* Member Name display */}
                      <span className={`text-[11px] md:text-xs flex items-center gap-1.5 ${isMe ? 'text-brand font-bold' : 'text-neutral-300'}`}>
                        {member.displayName}
                        {hasAdminPrivilege ? (
                          <span className="text-[8px] border border-red-900 bg-red-950/45 text-red-400 px-1 py-0.2 rounded-sm uppercase tracking-wider font-semibold font-mono">ADMİN 👑</span>
                        ) : hasModPrivilege ? (
                          <span className="text-[8px] border border-amber-900 bg-amber-950/45 text-amber-400 px-1 py-0.2 rounded-sm uppercase tracking-wider font-semibold font-mono">MOD 🛡️</span>
                        ) : null}
                        {isMe && <span className="text-[8px] font-mono text-neutral-500 uppercase font-semibold">(Siz)</span>}
                      </span>
                    </div>

                    {/* Controls trigger actions (Server mutes, moving) */}
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      {member.isSpeaking && (
                        <div className="flex gap-1 items-center justify-center h-5 px-2 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px] font-mono uppercase tracking-widest border border-emerald-500/25">
                          <CircleDot className="w-2 h-2 animate-ping" /> KONUŞUYOR
                        </div>
                      )}
                      {member.isMuted && (
                        <MicOff className="w-3.5 h-3.5 text-amber-500" title="Mikrofon Kapatıldı" />
                      )}
                      {member.isDeafened && (
                        <Headphones className="w-3.5 h-3.5 text-red-500" title="Hoparlör Kapatıldı" />
                      )}
                      {member.isServerMuted && (
                        <span className="text-[8px] font-bold border border-red-900 bg-red-950/80 text-red-400 px-1 rounded-sm uppercase tracking-wider" title="Yönetici Tarafından Susturulmuş">SUSTURULDU</span>
                      )}

                      {/* Admin actions dots helper */}
                      {isAdmin && !isMe && (
                        <button
                          onClick={() => {
                            setSelectedMemberActions(selectedMemberActions === member.uid ? null : member.uid);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${selectedMemberActions === member.uid ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-800 text-neutral-400'}`}
                          title="Yönetici Menüsü"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Admin contextual controls popup slide-out */}
                  {selectedMemberActions === member.uid && (
                    <div className="p-2.5 mt-1 mx-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5 text-[10px] shadow-lg animate-fade-in relative z-10 font-sans">
                      <div className="text-neutral-400 font-semibold border-b border-neutral-850 pb-1 mb-1 tracking-wider uppercase">YÖNETİCİ KOMUTLARI:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Server mute / unmute */}
                        <button
                          onClick={async () => {
                            await setServerMutedState(member.uid, !member.isServerMuted);
                            addLog(`👑 ${member.displayName} isimli kullanıcı sunucu tarafından ${!member.isServerMuted ? 'susturuldu' : 'konuşması açıldı'}.`, "warn");
                            setSelectedMemberActions(null);
                          }}
                          className={`py-1 rounded font-semibold transition-colors cursor-pointer text-center uppercase tracking-wider ${
                            member.isServerMuted 
                              ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900' 
                              : 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-900'
                          }`}
                        >
                          {member.isServerMuted ? 'Sesi Geri Ver' : 'Sunucu Sustur'}
                        </button>

                        {/* Kick from Voice */}
                        <button
                          onClick={async () => {
                            await kickUserFromVoice(member.uid);
                            addLog(`👑 ${member.displayName} sunucu ses odalarından atıldı.`, "danger");
                            setSelectedMemberActions(null);
                          }}
                          className="py-1 rounded font-semibold bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-center uppercase tracking-wider cursor-pointer border border-neutral-700"
                        >
                          Bağlantı Kes / At
                        </button>
                      </div>

                      {/* Move to another room */}
                      <div className="pt-1.5 border-t border-neutral-850/60 mt-1">
                        <span className="block text-neutral-400 text-[9px] mb-1 font-semibold uppercase tracking-wider">ODAYA TAŞI:</span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {allChannels.filter(c => c.id !== member.activeChannelId).map((destCh) => (
                            <button
                              key={destCh.id}
                              onClick={async () => {
                                await moveUserToChannel(member.uid, destCh.id);
                                addLog(`👑 ${member.displayName} odasından "${destCh.name}" odasına taşındı.`, "info");
                                setSelectedMemberActions(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 hover:text-white border border-neutral-850 text-[9px] text-neutral-400 cursor-pointer"
                            >
                              {destCh.name.replace(/[^\w\sğüşöçıİĞÜŞÖÇ]/gi, '').trim().substring(0, 15)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 font-sans text-neutral-200 select-none border-l border-neutral-900/65 overflow-hidden">
      
      {/* Top Main Panel Header */}
      <div className="bg-[#0a0a0a]/90 border-b border-neutral-900 px-4 py-3 flex justify-between items-center shrink-0 shadow-lg relative">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="absolute -inset-0.5 rounded-full bg-brand/55 animate-ping opacity-60"></span>
            <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/40 flex items-center justify-center relative">
              <RadioTower className="w-5 h-5 text-brand animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-bebas text-lg tracking-wider text-white flex items-center gap-1.5 leading-none">
              AYMC CANLI TELSİZ <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-sm font-sans tracking-normal uppercase">TS-VOIP</span>
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono tracking-widest mt-0.5 uppercase">AYYILDIZ MOTO KULÜBÜ</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Settings gear toggle */}
          <button 
            onClick={() => {
              setShowSettings(!showSettings);
              setShowCreateChannel(false);
            }} 
            className={`p-2 rounded-md transition-colors cursor-pointer ${showSettings ? 'bg-brand/20 text-brand' : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'}`}
            title="Telsiz ve Ses Ayarları"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-white hover:bg-neutral-900 p-2 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Network Connection Info Bar */}
      <div className="bg-neutral-950 px-4 py-2 flex items-center justify-between text-[10px] font-mono border-b border-neutral-900 text-neutral-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> 
          SUNUCU: <span className="text-white">AYMC-VOIP-NODE-V4</span>
        </span>
        <span className="text-neutral-500 bg-neutral-900/60 border border-neutral-850 px-1.5 py-0.5 rounded">
          {activeChannelId ? `AKTİF ODADA` : 'BAĞLI DEĞİL'}
        </span>
      </div>

      {/* Content Scroller Layout */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
        
        {/* Error overlay bar */}
        {error && (
          <div className="m-3 bg-red-950/40 border border-red-800/45 rounded-lg p-3 text-[11px] text-red-300 flex items-start gap-2.5 animate-fade-in relative z-20 shadow-lg font-sans">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Hata Bildirimi</span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. CHANNEL PASSWORD OVERLAY SCREEN */}
        {channelPasswordInput && (
          <div className="absolute inset-0 bg-neutral-950/95 z-30 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm border border-neutral-800 bg-neutral-900/60 backdrop-blur-md rounded-xl p-5 shadow-2xl relative">
              <button 
                onClick={() => setChannelPasswordInput(null)} 
                className="absolute top-3 right-3 text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-center mb-4">
                <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2.5 text-amber-500">
                  <Key className="w-5 h-5" />
                </div>
                <h4 className="font-bebas text-lg text-white uppercase tracking-wider">ŞİFRELİ SELSİZ ODASI</h4>
                <p className="text-[11px] text-neutral-400 mt-1 font-sans">Katılmak istediğiniz kanal şifre korumalıdır. Lütfen şifreyi giriniz.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <input 
                  type="password"
                  placeholder="Kanal Şifresi..."
                  required
                  value={typedPassword}
                  onChange={(e) => setTypedPassword(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-850 focus:border-brand/50 text-white placeholder-neutral-500 text-xs px-3 py-2.5 rounded-md text-center tracking-widest outline-none"
                  autoFocus
                />
                <div className="flex gap-2 font-bebas">
                  <button
                    type="button"
                    onClick={() => setChannelPasswordInput(null)}
                    className="flex-1 py-2 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-750 text-sm tracking-wider cursor-pointer"
                  >
                    VAZGEÇ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded bg-brand text-white hover:bg-brand/90 text-sm tracking-wider cursor-pointer"
                  >
                    KANALA GİR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. ADMIN CREATE CHANNEL DIALOG */}
        {showCreateChannel && (
          <div className="absolute inset-0 bg-neutral-950/95 z-30 p-4 overflow-y-auto animate-fade-in">
            <div className="border border-neutral-800 bg-neutral-900/60 backdrop-blur-md rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bebas text-md text-brand tracking-widest uppercase flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5" /> YENİ SES KANALI OLUŞTUR
                </h4>
                <button onClick={() => setShowCreateChannel(false)} className="text-neutral-500 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateChannelSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">KANAL ADI</label>
                  <input 
                    type="text"
                    required
                    maxLength={32}
                    placeholder="Örn: AKŞAM TURU GRUBU"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full bg-black/50 border border-neutral-850 px-3 py-2 rounded text-white focus:border-brand/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">AÇIKLAMA</label>
                  <input 
                    type="text"
                    maxLength={100}
                    placeholder="Sürüş ve rota koordinasyon odası"
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    className="w-full bg-black/50 border border-neutral-850 px-3 py-2 rounded text-white focus:border-brand/40 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">ODA ŞİFRESİ (İSTEĞE BAĞLI)</label>
                    <input 
                      type="password"
                      placeholder="Şifresiz"
                      value={newChannelPass}
                      onChange={(e) => setNewChannelPass(e.target.value)}
                      className="w-full bg-black/50 border border-neutral-850 px-3 py-2 rounded text-white focus:border-brand/40 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">YETKİ KISITLAMASI</label>
                    <select
                      value={newChannelRole}
                      onChange={(e) => setNewChannelRole(e.target.value)}
                      className="w-full bg-black/50 border border-neutral-850 px-3 py-2 rounded text-neutral-300 focus:border-brand/40 outline-none cursor-pointer"
                    >
                      <option value="">KISITLAMA YOK</option>
                      <option value="moderator">YALNIZCA MODERATÖR + ADMİN</option>
                      <option value="admin">YALNIZCA YÖNETİCİLER</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 font-bebas tracking-widest">KANAL SİMGESİ</label>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {['Radio', 'Ride', 'Moon', 'Coffee', 'Shield'].map((icName) => (
                      <button
                        key={icName}
                        type="button"
                        onClick={() => setNewChannelIcon(icName)}
                        className={`py-1.5 rounded text-[10px] font-bebas uppercase tracking-wider border ${
                          newChannelIcon === icName 
                            ? 'bg-brand/20 border-brand text-white' 
                            : 'bg-black/40 border-neutral-850 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {icName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 font-bebas">
                  <button
                    type="button"
                    onClick={() => setShowCreateChannel(false)}
                    className="flex-1 py-2 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-750 text-sm tracking-wider"
                  >
                    VAZGEÇ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand text-white rounded hover:bg-brand/90 text-sm tracking-wider"
                  >
                    ODA OLUŞTUR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. SETTINGS & TESTING CONTROL DASHBOARD PANEL */}
        {showSettings ? (
          <div className="p-4 space-y-4 animate-fade-in flex-1 bg-black/10">
            <div className="border border-neutral-850 bg-[#090909]/80 backdrop-blur-md rounded-xl p-4 space-y-3">
              <h4 className="font-bebas text-md tracking-wider text-brand flex items-center gap-1.5 border-b border-neutral-850 pb-2">
                <Sliders className="w-4.5 h-4.5" /> MİKROFON & SES SİNYALİ AYARLARI
              </h4>

              {/* MIC LEVEL BAR (Live Web Audio API meter!) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span>MİKROFON SİNYAL SEVİYESİ:</span>
                  <span className={`${liveVolume > 50 ? 'text-amber-500' : 'text-emerald-400'} font-bold`}>{liveVolume}%</span>
                </div>
                <div className="w-full bg-black border border-neutral-850 h-3 rounded overflow-hidden flex gap-0.5 p-0.5">
                  <div 
                    className="h-full bg-emerald-500 rounded-sm shadow-[0_0_8px_#10b981] transition-all duration-75"
                    style={{ width: `${liveVolume}%` }}
                  />
                </div>
                <span className="text-[9px] text-neutral-500 leading-none">Konuşurken yeşil barın yükseldiğini doğrulayın.</span>
              </div>

              {/* Sound mode chooser (PTT vs Vox) */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">KONUŞMA TETİKLEME YÖNTEMİ</label>
                <div className="grid grid-cols-2 gap-2 font-bebas text-xs">
                  <button 
                    onClick={handleToggleContinuousMic}
                    className={`py-2 rounded border transition-all cursor-pointer ${
                      continuousMic 
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                        : 'bg-black/50 border-neutral-850 text-neutral-400 hover:text-white'
                    }`}
                  >
                    SES AKTİVASYON (VOX)
                  </button>
                  <button 
                    onClick={handleToggleContinuousMic}
                    className={`py-2 rounded border transition-all cursor-pointer ${
                      !continuousMic 
                        ? 'bg-brand/20 border-brand text-white' 
                        : 'bg-black/50 border-neutral-850 text-neutral-400 hover:text-white'
                    }`}
                  >
                    BAS-KONUŞ (SPACEBAR)
                  </button>
                </div>
              </div>

              {/* Vox sensitivity threshold slider */}
              {continuousMic && (
                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                    <span>VOX DUYARLILIK EŞİĞİ:</span>
                    <span className="text-white font-bold">{voxThreshold}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="60" 
                    value={voxThreshold}
                    onChange={(e) => setVoxThreshold(parseInt(e.target.value))}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
                    <span>HASSAS (2)</span>
                    <span>SAĞIR (60)</span>
                  </div>
                </div>
              )}

              {/* Audio hardware processing filters */}
              <div className="space-y-2 border-t border-neutral-850/60 pt-3">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">DONANIMSAL SES SÜZGEÇLERİ</label>
                
                <div className="space-y-2 text-[11px] font-sans">
                  {/* Echo cancellation */}
                  <label className="flex items-center justify-between cursor-pointer text-neutral-300 hover:text-white">
                    <span>Eko Önleme (Echo Cancellation)</span>
                    <input 
                      type="checkbox" 
                      checked={echoCancellation}
                      onChange={(e) => {
                        setEchoCancellation(e.target.checked);
                        cleanupMedia();
                      }}
                      className="w-4 h-4 rounded border-neutral-850 text-brand focus:ring-brand bg-black"
                    />
                  </label>

                  {/* Noise suppression */}
                  <label className="flex items-center justify-between cursor-pointer text-neutral-300 hover:text-white">
                    <span>Gürültü Bastırma (Noise Suppression)</span>
                    <input 
                      type="checkbox" 
                      checked={noiseSuppression}
                      onChange={(e) => {
                        setNoiseSuppression(e.target.checked);
                        cleanupMedia();
                      }}
                      className="w-4 h-4 rounded border-neutral-850 text-brand focus:ring-brand bg-black"
                    />
                  </label>

                  {/* AGC */}
                  <label className="flex items-center justify-between cursor-pointer text-neutral-300 hover:text-white">
                    <span>Otomatik Kazanç Ayarı (AGC)</span>
                    <input 
                      type="checkbox" 
                      checked={autoGainControl}
                      onChange={(e) => {
                        setAutoGainControl(e.target.checked);
                        cleanupMedia();
                      }}
                      className="w-4 h-4 rounded border-neutral-850 text-brand focus:ring-brand bg-black"
                    />
                  </label>
                </div>
              </div>

              {/* Listening Playback gain level */}
              <div className="space-y-1.5 border-t border-neutral-850/60 pt-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span>DİNLEME SES SEVİYESİ (ÇIKIŞ):</span>
                  <span className="text-white font-bold">{Math.round(inputGain * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2.5" 
                  step="0.1"
                  value={inputGain}
                  onChange={(e) => setInputGain(parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-brand hover:bg-brand/90 text-white font-bebas text-sm rounded shadow transition-all cursor-pointer"
              >
                KAYDET VE KAPAT
              </button>
            </div>
          </div>
        ) : (
          /* 4. CHANNELS & MEMBERS LISTING TREE VIEW */
          <div className="p-4 space-y-4 flex-1 flex flex-col">
            
            {/* Admin Channel creation button header */}
            {isAdmin && (
              <button 
                onClick={() => {
                  setShowCreateChannel(true);
                  setShowSettings(false);
                }}
                className="w-full py-2 border border-dashed border-neutral-850 hover:border-brand/40 bg-[#090909]/40 hover:bg-brand/5 text-[11px] font-bebas tracking-widest text-neutral-400 hover:text-brand rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> YENİ SES KANALI OLUŞTUR (YÖNETİCİ)
              </button>
            )}

            {/* Channels Hierarchy Tree Layout */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {/* Category 1: Yönetim & Özel Odalar */}
              {allChannels.some(c => c.roleRestriction || c.id === 'moderator' || c.id === 'kulup-yonetimi' || c.id === 'yonetim-kurulu') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1 text-[10px] font-extrabold tracking-wider text-red-500 uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    👑 KULÜP YÖNETİMİ & YETKİLİ KANALLARI
                  </div>
                  <div className="space-y-2.5">
                    {allChannels
                      .filter(c => c.roleRestriction || c.id === 'moderator' || c.id === 'kulup-yonetimi' || c.id === 'yonetim-kurulu')
                      .map((channel) => renderChannel(channel))
                    }
                  </div>
                </div>
              )}

              {/* Category 2: Genel Sohbet & Sürüş Odaları */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  🏍️ SOHBET VE SÜRÜŞ KANALLARI
                </div>
                <div className="space-y-2.5">
                  {allChannels
                    .filter(c => !(c.roleRestriction || c.id === 'moderator' || c.id === 'kulup-yonetimi' || c.id === 'yonetim-kurulu'))
                    .map((channel) => renderChannel(channel))
                  }
                </div>
              </div>

              {/* Hide the duplicate rendering loop */}
              <div className="hidden">
                {allChannels.map((channel) => {
                const isMeInThis = activeChannelId === channel.id;
                const channelMembers = getChannelMembers(channel.id);
                
                return (
                  <div 
                    key={channel.id} 
                    className={`border rounded-xl transition-all overflow-hidden ${
                      isMeInThis 
                        ? 'border-brand/35 bg-brand/5/10 shadow-[inset_0_1px_4px_rgba(179,0,0,0.15)] bg-neutral-900/40' 
                        : 'border-neutral-900 bg-[#090909]/60 hover:border-neutral-800/70'
                    }`}
                  >
                    {/* Channel summary item row */}
                    <div 
                      onClick={() => handleJoinChannel(channel)}
                      className="px-3.5 py-3 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isMeInThis ? 'bg-brand/10 text-brand' : 'bg-neutral-950 border border-neutral-900 text-neutral-400 group-hover:text-brand'
                        }`}>
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-xs font-bold tracking-wide transition-colors ${
                              isMeInThis ? 'text-brand' : 'text-neutral-200 group-hover:text-brand'
                            }`}>
                              {channel.name}
                            </h4>
                            {channel.password && (
                              <Lock className="w-3 h-3 text-neutral-500" title="Şifreli Kanal" />
                            )}
                            {channel.roleRestriction && (
                              <Shield className="w-3 h-3 text-neutral-400" title="Sadece Yetkililer" />
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">{channel.description}</p>
                        </div>
                      </div>

                      {/* Participant count counter & Admin controls */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isAdmin && !channel.isStatic && (
                          <button
                            onClick={() => handleDeleteChannel(channel.id, channel.name)}
                            className="p-1 rounded text-neutral-500 hover:bg-neutral-900 hover:text-red-400 transition-colors cursor-pointer"
                            title="Odayı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-900 px-2 py-0.5 rounded text-[10px] text-neutral-400 font-mono shadow-inner">
                          <Users className="w-3 h-3 text-neutral-500" />
                          {channelMembers.length}
                        </div>
                      </div>
                    </div>

                    {/* Member nested list inside this channel */}
                    {channelMembers.length > 0 && (
                      <div className="bg-black/45 border-t border-neutral-900 px-4 py-2 space-y-1.5">
                        {channelMembers.map((member) => {
                          const isMe = member.uid === myUid;
                          const hasAdminPrivilege = member.role === 'admin';
                          const hasModPrivilege = member.role === 'moderator';
                          
                          return (
                            <div 
                              key={member.uid} 
                              className="relative flex flex-col"
                            >
                              <div className="flex items-center justify-between py-1 bg-black/10 border-b border-neutral-900/35 last:border-0 rounded px-1 hover:bg-neutral-900/30 transition-all duration-150">
                                <div className="flex items-center gap-2.5">
                                  <CornerDownRight className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                                  
                                  {/* Speaking glowing animation circle status */}
                                  <div className="relative">
                                    <span className={`w-3 h-3 rounded-full block border ${
                                      member.isSpeaking
                                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse'
                                        : member.isDeafened
                                          ? 'bg-neutral-800 border-neutral-700'
                                          : member.isMuted
                                            ? 'bg-amber-600 border-amber-500'
                                            : 'bg-neutral-600 border-neutral-500'
                                    }`} />
                                    {member.isSpeaking && (
                                      <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
                                    )}
                                  </div>

                                  {/* Avatar or profile image snippet if uploaded */}
                                  {member.photoURL ? (
                                    <img 
                                      src={member.photoURL} 
                                      alt="" 
                                      referrerPolicy="no-referrer"
                                      className="w-4 h-4 rounded-full object-cover border border-neutral-800" 
                                    />
                                  ) : null}

                                  {/* Member Name display */}
                                  <span className={`text-[11px] flex items-center gap-1.5 ${isMe ? 'text-brand font-bold' : 'text-neutral-300'}`}>
                                    {member.displayName}
                                    {hasAdminPrivilege ? (
                                      <span className="text-[8px] border border-red-900 bg-red-950/45 text-red-400 px-1 py-0.2 rounded-sm uppercase tracking-wider font-semibold font-mono">ADMİN 👑</span>
                                    ) : hasModPrivilege ? (
                                      <span className="text-[8px] border border-amber-900 bg-amber-950/45 text-amber-400 px-1 py-0.2 rounded-sm uppercase tracking-wider font-semibold font-mono">MOD 🛡️</span>
                                    ) : null}
                                    {isMe && <span className="text-[8px] font-mono text-neutral-500 uppercase font-semibold">(Siz)</span>}
                                  </span>
                                </div>

                                {/* Controls trigger actions (Server mutes, moving) */}
                                <div className="flex items-center gap-1 text-neutral-500">
                                  {member.isSpeaking && (
                                    <div className="flex gap-0.5 items-center justify-center h-4.5 px-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-mono uppercase tracking-widest border border-emerald-500/25">
                                      <CircleDot className="w-2 h-2 animate-ping" /> KONUŞUYOR
                                    </div>
                                  )}
                                  {member.isMuted && (
                                    <MicOff className="w-3 h-3 text-amber-500" title="Mikrofon Kapatıldı" />
                                  )}
                                  {member.isDeafened && (
                                    <Headphones className="w-3 h-3 text-red-500" title="Hoparlör Kapatıldı" />
                                  )}
                                  {member.isServerMuted && (
                                    <span className="text-[8px] font-bold border border-red-900 bg-red-950/80 text-red-400 px-1 rounded-sm uppercase tracking-wider" title="Yönetici Tarafından Susturulmuş">SUSTURULDU</span>
                                  )}

                                  {/* Admin actions dots helper */}
                                  {isAdmin && !isMe && (
                                    <button
                                      onClick={() => {
                                        setSelectedMemberActions(selectedMemberActions === member.uid ? null : member.uid);
                                      }}
                                      className={`p-1 rounded cursor-pointer transition-colors ${selectedMemberActions === member.uid ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-800 text-neutral-400'}`}
                                      title="Yönetici Menüsü"
                                    >
                                      <SlidersHorizontal className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Admin contextual controls popup slide-out */}
                              {selectedMemberActions === member.uid && (
                                <div className="p-2 mt-1 mx-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5 text-[10px] shadow-lg animate-fade-in relative z-10 font-sans">
                                  <div className="text-neutral-400 font-semibold border-b border-neutral-850 pb-1 mb-1 tracking-wider uppercase">YÖNETİCİ KOMUTLARI:</div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {/* Server mute / unmute */}
                                    <button
                                      onClick={async () => {
                                        await setServerMutedState(member.uid, !member.isServerMuted);
                                        addLog(`👑 ${member.displayName} isimli kullanıcı sunucu tarafından ${!member.isServerMuted ? 'susturuldu' : 'konuşması açıldı'}.`, "warn");
                                        setSelectedMemberActions(null);
                                      }}
                                      className={`py-1 rounded font-semibold transition-colors cursor-pointer text-center uppercase tracking-wider ${
                                        member.isServerMuted 
                                          ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900' 
                                          : 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-900'
                                      }`}
                                    >
                                      {member.isServerMuted ? 'Sesi Geri Ver' : 'Sunucu Sustur'}
                                    </button>

                                    {/* Kick from Voice */}
                                    <button
                                      onClick={async () => {
                                        await kickUserFromVoice(member.uid);
                                        addLog(`👑 ${member.displayName} sunucu ses odalarından atıldı.`, "danger");
                                        setSelectedMemberActions(null);
                                      }}
                                      className="py-1 rounded font-semibold bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-center uppercase tracking-wider cursor-pointer border border-neutral-700"
                                    >
                                      Bağlantı Kes / At
                                    </button>
                                  </div>

                                  {/* Move to another room */}
                                  <div className="pt-1.5 border-t border-neutral-850/60 mt-1">
                                    <span className="block text-neutral-400 text-[9px] mb-1 font-semibold uppercase tracking-wider">ODAYA TAŞI:</span>
                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                      {allChannels.filter(c => c.id !== member.activeChannelId).map((destCh) => (
                                        <button
                                          key={destCh.id}
                                          onClick={async () => {
                                            await moveUserToChannel(member.uid, destCh.id);
                                            addLog(`👑 ${member.displayName} odasından "${destCh.name}" odasına taşındı.`, "info");
                                            setSelectedMemberActions(null);
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 hover:text-white border border-neutral-850 text-[9px] text-neutral-400 cursor-pointer"
                                        >
                                          {destCh.name.replace(/[^\w\sğüşöçıİĞÜŞÖÇ]/gi, '').trim().substring(0, 15)}...
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. TS-STYLE COLLAPSIBLE SYSTEM LOG (OLAY GÜNLÜĞÜ) */}
      {!showSettings && !showCreateChannel && !channelPasswordInput && (
        <div className="shrink-0 bg-neutral-950 border-t border-neutral-900 relative">
          <div className="bg-[#090909] px-4 py-2 border-b border-neutral-950 flex items-center justify-between text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
            <span>SİSTEM EVENT GÜNLÜĞÜ (SES TELSİZ LOG)</span>
            <button 
              onClick={() => setLogs([])}
              className="hover:text-white text-[8px] px-1 bg-black border border-neutral-900 rounded"
              title="Temizle"
            >
              TEMİZLE
            </button>
          </div>
          <div className="h-16 overflow-y-auto px-4 py-2 space-y-1 font-mono text-[9px] leading-relaxed select-text custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-neutral-600 text-center py-2">Telsiz olay günlüğü boş.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="truncate">
                  <span className="text-neutral-500 mr-1.5">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warn' ? 'text-amber-500' :
                    log.type === 'danger' ? 'text-red-500 font-semibold' :
                    'text-neutral-400'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. BOTTOM AUDIO CONTROLS BAR (MUTE, DEAFEN, TALK TRIGGER) */}
      <div className="bg-[#090909] border-t border-neutral-900 p-4 shrink-0 flex flex-col gap-3.5 relative z-10 shadow-2xl">
        {activeChannelId ? (
          <>
            {/* Connection established state info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                BAĞLANTI AKTİF • {allChannels.find(c => c.id === activeChannelId)?.name}
              </div>
              <button 
                onClick={handleDisconnect}
                className="px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer font-bebas shadow-md"
              >
                TELSİZİ KAPAT / BAĞLANTIYI KES
              </button>
            </div>

            {/* PUSH-TO-TALK TALK KEYBOARD OR VOX TRIGGER BUTTON */}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isMuted}
                onMouseDown={() => {
                  if (!continuousMic) startVoiceCapture();
                }}
                onMouseUp={() => {
                  if (!continuousMic) stopVoiceCapture();
                }}
                onMouseLeave={() => {
                  if (!continuousMic && isSpeaking) stopVoiceCapture();
                }}
                onTouchStart={() => {
                  if (!continuousMic) startVoiceCapture();
                }}
                onTouchEnd={() => {
                  if (!continuousMic) stopVoiceCapture();
                }}
                className={`flex-1 h-13 rounded-lg font-bebas text-md tracking-wider uppercase flex items-center justify-center gap-2 transition-all select-none border shadow-md ${
                  isMuted 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                    : isSpeaking
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse'
                      : 'bg-brand hover:bg-brand/90 border-brand/50 hover:border-brand text-white hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                }`}
              >
                <Mic className={`w-4.5 h-4.5 ${isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} />
                {isSpeaking 
                  ? "İLETİLİYOR • BIRAKIN" 
                  : continuousMic 
                    ? "SES AKTİVASYONU ETKİN" 
                    : "BAS-KONUŞ (SPACEBAR)"
                }
              </button>

              {/* Vox toggle mini icon shortcut */}
              <button
                type="button"
                onClick={handleToggleContinuousMic}
                disabled={isMuted}
                className={`w-13 h-13 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  continuousMic
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
                    : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-800'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title="Ses Aktivasyonu (VOX) ve Bas-Konuş Modları Arasında Geçiş Yap"
              >
                <Disc className={`w-4 h-4 ${continuousMic && isSpeaking ? 'animate-spin' : ''}`} />
                <span className="text-[7.5px] font-mono tracking-tighter uppercase">{continuousMic ? 'VOX' : 'BAS'}</span>
              </button>
            </div>

            {/* Speaking animated visualizer soundwave */}
            {isSpeaking && (
              <div className="flex justify-between items-center bg-black/60 border border-emerald-500/20 rounded-md py-1.5 px-3 animate-fade-in">
                <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">SES DALGASI AKTİF SİNYALİ</div>
                <div className="flex gap-0.75 h-3.5 items-end">
                  <div className="w-0.75 bg-emerald-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-0.75 bg-emerald-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-0.75 bg-emerald-500 rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-0.75 bg-emerald-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-0.75 bg-emerald-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-3 text-center space-y-1.5 shadow-inner">
            <Radio className="w-8 h-8 text-neutral-800 mx-auto animate-pulse" />
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              AYMC Sesli Telsiz sistemine bağlanmak için yukarıda listelenmiş olan ses kanallarından birine tıklayarak lobiye katılın.
            </p>
          </div>
        )}

        {/* Toolbar Buttons for state control */}
        <div className="flex items-center justify-around border-t border-neutral-900/60 pt-3 text-neutral-400">
          <button 
            type="button"
            onClick={toggleMute}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer ${
              isMuted ? 'text-amber-500 bg-amber-500/10 border border-amber-500/15 px-2.5' : 'hover:text-white border border-transparent'
            }`}
            title={isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-[8px] font-mono uppercase tracking-wider font-semibold">Mikrofon</span>
          </button>

          <button 
            type="button"
            onClick={toggleDeafen}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer ${
              isDeafened ? 'text-red-500 bg-red-500/10 border border-red-500/15 px-2.5' : 'hover:text-white border border-transparent'
            }`}
            title={isDeafened ? 'Hoparlörü Aç' : 'Hoparlörü Kapat'}
          >
            {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[8px] font-mono uppercase tracking-wider font-semibold">Kulaklık</span>
          </button>

          <div className="text-[9px] text-neutral-500 font-sans text-right max-w-[150px] uppercase tracking-wider leading-relaxed">
            Masaüstünde Bas-Konuş için <kbd className="bg-neutral-900 border border-neutral-850 px-1 rounded text-neutral-300 font-mono">SPACE</kbd> tuşu kullanılabilir.
          </div>
        </div>
      </div>
    </div>
  );
}
