/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Navigation, Search, CheckCircle2, Trash2 } from 'lucide-react';
import { Event } from '../types';
import { deleteEventDoc } from '../lib/firebaseService';

interface EventsProps {
  events: Event[];
  onToggleAttend: (id: string) => void;
  userAttendingList: string[]; // List of event IDs the user is attending
  currentUser?: any;
}

export default function Events({ events, onToggleAttend, userAttendingList, currentUser }: EventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const filteredEvents = events.filter((evt) => {
    // Search match
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Category match
    if (filter === 'all') return matchesSearch;
    if (filter === 'upcoming') return matchesSearch && (evt.status === 'upcoming' || evt.status === 'ongoing');
    if (filter === 'past') return matchesSearch && evt.status === 'past';
    return matchesSearch;
  });

  return (
    <div id="events-page" className="bg-transparent text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            KULÜP PROGRAMI
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            ETKİNLİKLER VE SÜRÜŞLER
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 tracking-wider max-w-2xl mx-auto">
            AYMC demir atlılarının yoldaki izleri. Kortejler, teknik buluşmalar ve kamp programlarımıza buradan katılabilirsiniz.
          </p>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Controls Bar: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-[#1a1a1a]/40 p-4 rounded-sm border border-neutral-900">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Etkinlik ara (Örn: Kamp, Şile)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-sm py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-black p-1 rounded-sm border border-neutral-800 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                filter === 'all' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              TÜMÜ
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                filter === 'upcoming' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              YAKLAŞANLAR
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-sm text-xs font-sans font-bold tracking-wider uppercase transition-all ${
                filter === 'past' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              GEÇMİŞ SÜRÜŞLER
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#1A1A1A]/20 border border-dashed border-neutral-800 rounded-sm">
            <p className="font-sans text-sm text-gray-400">Aramanıza uygun aktif kulüp etkinliği bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => {
              const isAttending = userAttendingList.includes(evt.id);

              return (
                <div
                  key={evt.id}
                  id={`event-card-${evt.id}`}
                  className="bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm overflow-hidden flex flex-col justify-between hover:border-brand/30 transition-all duration-300 group hover:-translate-y-1.5"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Admin Delete Action */}
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${evt.title}" etkinliğini silmek istediğinize emin misiniz?`)) {
                            try {
                              await deleteEventDoc(evt.id);
                            } catch (err: any) {
                              alert("Etkinlik silinemedi: " + err.message);
                            }
                          }
                        }}
                        title="Etkinliği Sil"
                        className="absolute top-4 left-4 p-2 rounded bg-red-950/95 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white transition-colors z-20 shadow-md cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-2.5 py-1 text-[10px] font-sans font-bold tracking-wider uppercase rounded-sm ${
                        evt.status === 'upcoming' 
                          ? 'bg-gold text-black' 
                          : evt.status === 'ongoing' 
                          ? 'bg-green-600 text-white animate-pulse'
                          : 'bg-neutral-800 text-gray-400'
                      }`}>
                        {evt.status === 'upcoming' ? 'Yaklaşan' : evt.status === 'ongoing' ? 'Sürüyor' : 'Kilitlendi / Tamamlandı'}
                      </span>
                    </div>
                    
                    {/* Dark gradient fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Floating Date Overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/75 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded-sm">
                      <Calendar className="w-4 h-4 text-brand" />
                      <span className="font-mono text-xs font-bold text-white">{evt.date}</span>
                    </div>
                  </div>

                  {/* Event Body */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bebas text-2xl text-white tracking-wider mb-2 group-hover:text-brand transition-colors">
                        {evt.title}
                      </h3>
                      <p className="font-sans text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">
                        {evt.description}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="space-y-3.5 border-t border-neutral-900 pt-5">
                      <div className="flex items-center text-xs font-sans text-gray-300">
                        <Clock className="w-4 h-4 text-gold mr-2.5" />
                        <span className="font-mono text-gray-400">{evt.time}</span>
                      </div>
                      <div className="flex items-center text-xs font-sans text-gray-300">
                        <MapPin className="w-4 h-4 text-brand mr-2.5" />
                        <span>{evt.location}</span>
                      </div>
                      <div className="flex items-center text-xs font-sans text-gray-300">
                        <Users className="w-4 h-4 text-gold mr-2.5" />
                        <span>{evt.attendeesCount + (isAttending ? 1 : 0)} Katılımcı</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button Actions */}
                  <div className="p-6 pt-0 grid grid-cols-2 gap-4">
                    {/* Google Maps Link */}
                    <a
                      href={evt.gmapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 px-3 py-3 border border-neutral-800 rounded-sm hover:bg-neutral-900 hover:border-gold/50 transition-all text-xs font-sans font-bold tracking-wider text-gold"
                    >
                      <Navigation className="w-3.5 h-3.5 text-gold" />
                      <span>HARİTADA AÇ</span>
                    </a>

                    {/* Join / Katıl CTA button */}
                    <button
                      onClick={() => onToggleAttend(evt.id)}
                      disabled={evt.status === 'past'}
                      className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-sm transition-all text-xs font-sans font-bold tracking-wider uppercase border ${
                        evt.status === 'past'
                          ? 'bg-neutral-900 border-neutral-900 text-gray-600 cursor-not-allowed'
                          : isAttending
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          : 'bg-brand border-brand text-white hover:bg-brand-dark'
                      }`}
                    >
                      {isAttending ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>KATILIYORSUNUZ</span>
                        </>
                      ) : (
                        <span>{evt.status === 'past' ? 'TAMAMLANDI' : 'SÜRÜŞE KATIL'}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
