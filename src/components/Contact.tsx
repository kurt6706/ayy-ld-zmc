/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, Check, ShieldAlert } from 'lucide-react';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);

    try {
      // 1. Find receiver admin id
      let receiverId = 'admin-1'; // Default seeded admin ID for Kurtuluş Düzlü
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', 'kduzlu@gmail.com'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        receiverId = querySnapshot.docs[0].id;
      } else {
        // Fallback to username kurt
        const qKurt = query(usersRef, where('username', '==', 'kurt'));
        const kurtSnap = await getDocs(qKurt);
        if (!kurtSnap.empty) {
          receiverId = kurtSnap.docs[0].id;
        }
      }

      // 2. Generate a unique senderId for the guest based on email
      const cleanedEmail = email.trim().toLowerCase();
      const guestSenderId = `guest-${cleanedEmail.replace(/[^a-zA-Z0-9]/g, '-')}`;

      // 3. Save direct message to Firestore
      const msgId = `dm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      await setDoc(doc(db, 'directMessages', msgId), {
        id: msgId,
        senderId: guestSenderId,
        senderName: name.trim(),
        senderEmail: cleanedEmail,
        receiverId: receiverId,
        text: `Konu: ${subject.trim() || 'İletişim Formu Mesajı'}\nE-posta: ${cleanedEmail}\n\nMesaj:\n${message.trim()}`,
        timestamp: Date.now(),
        read: false
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      // Fallback to mailto link if Firestore write fails
      const mailtoLink = `mailto:kduzlu@gmail.com?subject=${encodeURIComponent(subject || 'İletişim Formu Mesajı')}&body=${encodeURIComponent(`Gönderen: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`)}`;
      window.location.href = mailtoLink;
      
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-page" className="bg-transparent text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            BİZE ULAŞIN
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            İLETİŞİM VE GENEL MERKEZ
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 tracking-wider max-w-2xl mx-auto">
            AYMC Genel Sekreterliği veya şubelerimizle iletişime geçin. Soru, iş birliği veya kurumsal destek taleplerinizi iletebilirsiniz.
          </p>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Info & Form Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-16">
          
          {/* Left Column: Contact details (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="font-bebas text-xl text-white tracking-wider uppercase block border-b border-neutral-900 pb-3">
                İLETİŞİM BİLGİLERİ
              </span>

              {/* Detail 1 */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-brand/10 border border-brand/30 text-brand rounded-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bebas text-sm tracking-wider text-white uppercase">AYMC GENEL MERKEZ / KULÜP EVİ</h4>
                  <p className="font-sans text-xs text-gray-400 mt-1 leading-relaxed">
                    <strong className="text-white">Ayyıldız Moto Kulüp</strong>
                  </p>
                  <p className="font-sans text-[11px] text-gray-500 mt-1">
                    Kulüp evimize kolayca ulaşmak için haritalarda aratabilir veya aşağıdaki yol tarifi bağlantısını kullanabilirsiniz.
                  </p>
                  <a
                    href="https://maps.app.goo.gl/fhkHWUCZGbX2nCa8A?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-[11px] font-sans font-bold tracking-wider text-brand hover:text-brand-dark transition-colors uppercase mt-2"
                  >
                    <span>GOOGLE MAPS NAVİGASYON BİLGİSİ</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Detail 2 */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 border border-gold/30 text-gold rounded-sm shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bebas text-sm tracking-wider text-white uppercase">KULÜP TELEFON HATTI</h4>
                  <p className="font-mono text-xs text-gray-400 mt-1">
                    0542 829 35 61
                  </p>
                </div>
              </div>

              {/* Detail 3 */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-brand/10 border border-brand/30 text-brand rounded-sm shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bebas text-sm tracking-wider text-white uppercase">E-POSTA ADRESİ</h4>
                  <p className="font-mono text-xs text-gray-400 mt-1 hover:text-brand transition-colors">
                    info@aymc.org.tr
                  </p>
                </div>
              </div>

              {/* WhatsApp direct CTA */}
              <div className="pt-4 border-t border-neutral-900">
                <a
                  href="https://chat.whatsapp.com/H0gqUUPhYdtAwepoF3wAUB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2.5 px-4 py-3 bg-emerald-950/40 border border-emerald-500 text-emerald-400 rounded-sm hover:bg-emerald-500 hover:text-white transition-all text-xs font-sans font-bold tracking-widest uppercase"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-400 group-hover:fill-white animate-pulse" />
                  <span>WHATSAPP KATILMA İSTEĞİ GÖNDER</span>
                </a>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-start space-x-2 text-[10px] text-gray-500 bg-black p-3 rounded-sm border border-neutral-900">
              <ShieldAlert className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>Yelekli kulüp üyelerimiz dışındaki misafirlerimizin kulüp merkez binamıza (Clubhouse) yapacağı ziyaretlerde önceden bildirimde bulunması rica olunur.</span>
            </div>
          </div>

          {/* Right Column: Contact Message Form (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8">
            <span className="font-bebas text-xl text-white tracking-wider uppercase block border-b border-neutral-900 pb-4 mb-6">
              BİZE MESAJ GÖNDERİN
            </span>

            {success && (
              <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-200 p-4 rounded-sm text-xs font-sans mb-6 flex items-center space-x-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mesajınız başarıyla iletilmiştir. Genel Sekreterliğimiz en kısa sürede size geri dönüş yapacaktır.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1.5">Adınız Soyadınız</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1.5">E-Posta Adresiniz</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta..."
                    className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1.5">Konu</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Hangi konuda bilgi almak istersiniz?..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-1.5">Mesajınız</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesaj içeriğinizi buraya detaylıca yazınız..."
                  className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-brand text-white text-xs font-sans font-bold tracking-wider uppercase rounded-sm hover:bg-brand-dark transition-colors cursor-pointer ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'GÖNDERİLİYOR...' : 'MESAJI GÖNDER'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Embedded map & navigation of headquarters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#111111] border border-neutral-900 rounded-sm p-6 sm:p-8">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-brand uppercase block">
              NAVİGASYON VE ULAŞIM BİLGİSİ
            </span>
            <h3 className="font-bebas text-3xl text-white tracking-wider uppercase">
              AYYILDIZ MOTO KULÜP
            </h3>
            <p className="font-sans text-xs text-gray-400 leading-relaxed">
              Kulüp evimiz Ankara'nın en kolay ulaşılabilir noktalarından birinde yer almaktadır. Motosikletinizle veya şahsi aracınızla yapacağınız sürüşlerde, doğrudan Google Maps navigasyon bilgilerini kullanarak kapımıza kadar sorunsuz şekilde gelebilirsiniz.
            </p>
            
            <div className="space-y-2 pt-2 border-t border-neutral-900 text-xs font-sans text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                <span><strong className="text-white">Hedef Adı:</strong> Ayyıldız Moto Kulüp</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                <span><strong className="text-white">Güzergah:</strong> Google Maps üzerinde kayıtlı resmi konum.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                <span><strong className="text-white">Otopark:</strong> Kulüp evimizin önünde motosikletlere özel güvenli park alanı mevcuttur.</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://maps.app.goo.gl/fhkHWUCZGbX2nCa8A?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-brand hover:bg-brand-dark text-white font-sans text-xs font-bold tracking-widest uppercase rounded-sm transition-all"
              >
                <span>GOOGLE MAPS'TE AÇ VE NAVİGASYONU BAŞLAT</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 h-[300px] rounded-sm overflow-hidden border border-neutral-950 bg-black relative flex items-center justify-center group">
            <div className="absolute inset-0 bg-neutral-900/10 opacity-60 mix-blend-overlay"></div>
            {/* Dark Styled Google Maps Map Embed or interactive placeholder linking directly */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3005.1092787754333!2d29.0203!3d41.0504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAzJDAxLjQiTiAyOcKwMDEnMTMuMSJF!5e0!3m2!1str!2str!4v1655000000000!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%) grayscale(40%)' }}
              allowFullScreen={false}
              loading="lazy"
              title="Ayyıldız Moto Kulüp Konumu"
              className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-60 transition-opacity"
            ></iframe>
            <div className="relative z-10 text-center p-6 bg-black/80 border border-neutral-900 rounded-sm max-w-sm mx-4 space-y-3">
              <h4 className="font-bebas text-lg text-white tracking-widest uppercase">YOL TARİFİ VE HARİTA</h4>
              <p className="font-sans text-[11px] text-gray-400">Haritada canlı görmek ve cep telefonunuzdan yol tarifi almak için tıklayın.</p>
              <a
                href="https://maps.app.goo.gl/fhkHWUCZGbX2nCa8A?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-sm font-sans text-[10px] font-bold tracking-widest uppercase transition-colors"
              >
                HARİTADA GÖRÜNTÜLE
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
