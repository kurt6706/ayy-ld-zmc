import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Mic, Camera, Image, Trash2, X, Check, RefreshCw, RadioTower } from 'lucide-react';
import { setTypingStatus } from '../firestore';

interface MessageInputProps {
  currentUser: any;
  onSendMessage: (text: string, mediaType?: 'text' | 'audio' | 'video' | 'image', mediaUrl?: string) => Promise<void>;
  onOpenVoice?: () => void;
}

const POPULAR_EMOJIS = ['👍', '❤️', '😂', '🔥', '🏍️', '🏁', '🙏', '😮', '😢', '🌟', '👏', '🎉'];

export default function MessageInput({ currentUser, onSendMessage, onOpenVoice }: MessageInputProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Audio recording states
  const [audioRecording, setAudioRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Camera modal states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Media Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Auto-grow textarea height
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputText]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (currentUser) {
      const name = currentUser.displayName || 'Anonim';
      const uid = currentUser.uid || currentUser.id || '';
      
      setTypingStatus(uid, name, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(uid, name, false);
      }, 2500);
    }
  };

  // Submit standard text message
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageToSend = inputText.trim();
    
    try {
      setIsSending(true);
      
      if (currentUser) {
        const uid = currentUser.uid || currentUser.id || '';
        const name = currentUser.displayName || 'Anonim';
        setTypingStatus(uid, name, false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      await onSendMessage(messageToSend, 'text');
      setInputText('');
      setShowEmojis(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Input send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // --- HELPER FOR MEDIA ---
  const blobToBase64 = (blob: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setRecordingDuration(0);
  };

  // --- AUDIO ACTIONS ---
  const startAudioRecording = async () => {
    try {
      cleanupRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

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
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        if (audioChunksRef.current.length > 0) {
          try {
            setIsSending(true);
            const base64Data = await blobToBase64(audioBlob);
            await onSendMessage('🎤 Sesli Mesaj', 'audio', base64Data);
          } catch (err) {
            console.error('Error sending audio message:', err);
            alert('Ses kaydı gönderilemedi.');
          } finally {
            setIsSending(false);
          }
        }
      };

      setRecordingDuration(0);
      mediaRecorder.start();
      setAudioRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 15) { // 15 seconds limit
            stopAudioRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Mikrofon erişimi engellendi veya cihaz bulunamadı.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && audioRecording) {
      mediaRecorderRef.current.stop();
      setAudioRecording(false);
      cleanupRecording();
    }
  };

  const cancelAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null; // Do not trigger send
      mediaRecorderRef.current.stop();
    }
    setAudioRecording(false);
    cleanupRecording();
  };

  // --- GALLERY ACTIONS ---
  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    // Limit size to ~1MB to ensure Firestore limits are respected in Base64 encoding
    if (file.size > 1.2 * 1024 * 1024) {
      alert('Görsel boyutu çok büyük (Maksimum 1.2MB).');
      return;
    }

    try {
      setIsSending(true);
      const base64Data = await blobToBase64(file);
      await onSendMessage('📷 Görsel', 'image', base64Data);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Görsel gönderilemedi.');
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset
      }
    }
  };

  // --- CAMERA ACTIONS ---
  useEffect(() => {
    if (showCameraModal && cameraPreviewRef.current && !capturedPhoto) {
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: false 
      })
      .then(stream => {
        streamRef.current = stream;
        if (cameraPreviewRef.current) {
          cameraPreviewRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Error opening camera stream:', err);
        alert('Kamera erişimi reddedildi.');
        setShowCameraModal(false);
      });
    }

    return () => {
      if (!showCameraModal) {
        cleanupRecording();
      }
    };
  }, [showCameraModal, capturedPhoto]);

  const capturePhoto = () => {
    if (!cameraPreviewRef.current) return;
    
    const video = cameraPreviewRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw mirrored frame for selfie-style
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% compression
      setCapturedPhoto(dataUrl);
    }

    // Stop camera stream immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const sendCapturedPhoto = async () => {
    if (!capturedPhoto) return;
    try {
      setIsSending(true);
      await onSendMessage('📷 Fotoğraf', 'image', capturedPhoto);
      setShowCameraModal(false);
      setCapturedPhoto(null);
    } catch (err) {
      console.error('Error sending captured photo:', err);
      alert('Fotoğraf gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

  const closeCameraModal = () => {
    setShowCameraModal(false);
    setCapturedPhoto(null);
    cleanupRecording();
  };

  // Clean up typing status and timers if component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      cleanupRecording();
      if (currentUser) {
        const uid = currentUser.uid || currentUser.id || '';
        const name = currentUser.displayName || 'Anonim';
        setTypingStatus(uid, name, false);
      }
    };
  }, [currentUser]);

  return (
    <div className="relative border-t border-neutral-900 bg-[#0a0a0a] p-4 shrink-0">
      
      {/* Hidden File Input for Gallery */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Quick Emojis Shelf */}
      {showEmojis && !audioRecording && (
        <div className="absolute bottom-[72px] left-4 right-4 bg-[#111111] border border-neutral-850 rounded-lg p-3 shadow-2xl z-20 flex flex-wrap gap-2 animate-fade-in">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg p-1.5 hover:bg-neutral-800 rounded-sm active:scale-90 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative border border-neutral-850 rounded-lg bg-neutral-950 focus-within:border-brand/60 transition-all overflow-hidden flex flex-col p-2">
          
          {/* Text Input area or Recording status */}
          <div className="w-full">
            {audioRecording ? (
              <div className="w-full bg-neutral-950 rounded-sm py-3 px-4 min-h-[44px] flex items-center justify-between text-xs text-red-400 font-sans animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 block animate-ping"></span>
                  SES KAYDEDİLİYOR • {recordingDuration}s / 15s
                </span>
                <button 
                  type="button"
                  onClick={cancelAudioRecording}
                  className="text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-sm transition-all"
                >
                  VAZGEÇ
                </button>
              </div>
            ) : (
              <div className="relative w-full">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  maxLength={5000}
                  placeholder="Bir şeyler yazın (Shift+Enter yeni satır)..."
                  className="w-full bg-transparent border-0 rounded-sm py-2 px-3 text-xs font-sans text-white placeholder-neutral-600 focus:outline-none focus:ring-0 transition-all resize-none custom-scrollbar min-h-[40px] max-h-[120px]"
                />
                {inputText.length > 1000 && (
                  <span className="absolute right-3 bottom-1.5 text-[9px] font-mono text-neutral-600">
                    {inputText.length}/5000
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Toolbar containing action buttons & send */}
          {!audioRecording && (
            <div className="flex items-center justify-between border-t border-neutral-900/50 pt-2 px-1 mt-1">
              {/* Media Buttons Row */}
              <div className="flex items-center gap-2">
                {/* Toggle Emojis Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all ${
                    showEmojis 
                      ? 'bg-brand/10 border-brand text-brand' 
                      : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-750'
                  }`}
                  title="Emoji Ekle"
                >
                  <Smile className="w-4.5 h-4.5" />
                </button>

                {/* Audio Recording Button */}
                <button
                  type="button"
                  onClick={audioRecording ? stopAudioRecording : startAudioRecording}
                  className="flex items-center justify-center w-8 h-8 rounded-md border bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-750 transition-all"
                  title="Sesli Mesaj Kaydet"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                {/* Camera Snapshot Button */}
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-md border bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-750 transition-all"
                  title="Fotoğraf Çek ve Gönder"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>

                {/* Gallery Image Chooser Button */}
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  className="flex items-center justify-center w-8 h-8 rounded-md border bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-750 transition-all"
                  title="Galeriden Görsel Seç"
                >
                  <Image className="w-4.5 h-4.5" />
                </button>

                {/* TeamSpeak Live Voice Shortcut Button */}
                {onOpenVoice && (
                  <button
                    type="button"
                    onClick={onOpenVoice}
                    className="flex items-center justify-center w-8 h-8 rounded-md border bg-brand/15 border-brand/35 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer relative"
                    title="AYMC Telsiz (Canlı Konuşma)"
                  >
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping border border-black"></span>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black"></span>
                    <RadioTower className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="bg-brand hover:bg-brand-dark disabled:opacity-45 text-white w-8 h-8 rounded-md flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(179,0,0,0.2)]"
                title="Mesajı Gönder"
              >
                {isSending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4 -ml-0.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* CAMERA SNAPSHOT MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-900 rounded-lg p-5 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand"></div>
            
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-bebas text-lg tracking-wider text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand" /> FOTOĞRAF ÇEK
              </h3>
              <button 
                onClick={closeCameraModal}
                disabled={isSending}
                className="p-1 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-45"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Preview / Captured Photo */}
            <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-lg overflow-hidden border border-neutral-850 flex items-center justify-center shadow-inner">
              {!capturedPhoto ? (
                <video 
                  ref={cameraPreviewRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover transform -scale-x-100" 
                />
              ) : (
                <img 
                  src={capturedPhoto} 
                  alt="Yakalanan Fotoğraf" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Controls */}
            <div className="w-full flex flex-col items-center gap-3 mt-5">
              {isSending ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
                  <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-widest animate-pulse">FOTOĞRAF GÖNDERİLİYOR...</span>
                </div>
              ) : !capturedPhoto ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-sans font-bold text-xs tracking-wider uppercase transition-all rounded-full flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" /> FOTOĞRAFI ÇEK
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-all rounded-full flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> YENİDEN ÇEK
                  </button>
                  <button
                    type="button"
                    onClick={sendCapturedPhoto}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-all rounded-full flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                  >
                    <Check className="w-4 h-4" /> GÖNDER
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
