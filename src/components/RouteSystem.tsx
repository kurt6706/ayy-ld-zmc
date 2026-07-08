/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Route, Fuel, Clock, Milestone, ShieldAlert, Navigation, MapPin, Gauge } from 'lucide-react';
import { Route as RouteType } from '../types';

interface RouteSystemProps {
  routes: RouteType[];
}

export default function RouteSystem({ routes }: RouteSystemProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [fuelPrice, setFuelPrice] = useState<number>(45.5); // Current Turkish fuel price in TL per liter
  const [bikeConsumption, setBikeConsumption] = useState<number>(5.2); // Default bike consumption L/100km

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Calculations
  const calculatedLiters = selectedRoute ? ((selectedRoute.distanceKm * bikeConsumption) / 100).toFixed(1) : '0.0';
  const calculatedCost = selectedRoute ? (parseFloat(calculatedLiters) * fuelPrice).toFixed(0) : '0';

  if (!selectedRoute) {
    return (
      <div className="bg-[#050505] text-white py-24 text-center">
        <p className="font-sans">Lütfen rota ekleyin.</p>
      </div>
    );
  }

  return (
    <div id="routes-page" className="bg-[#050505] text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.3em] text-brand uppercase block mb-3">
            NAVİGASYON VE PLANLAMA
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-widest uppercase">
            ROTA SİSTEMİ VE PLANLAYICI
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 tracking-wider max-w-2xl mx-auto">
            AYMC yol kaptanları tarafından test edilmiş, güvenlik derecelendirmesi yapılmış, mola noktaları belirlenmiş resmi sürüş rotalarımız.
          </p>
          <div className="w-24 h-1 bg-brand mx-auto mt-4 rounded-full" />
        </div>

        {/* Route Selector Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          
          {/* Left Column: Selector & Details */}
          <div className="lg:col-span-5 bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="font-bebas text-xl text-white tracking-wider uppercase block border-b border-neutral-800 pb-3">
                ROTA SEÇİNİZ
              </span>

              {/* Selection Dropdown */}
              <div className="relative">
                <select
                  id="route-selector"
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-sm py-3 px-4 text-sm font-sans text-white focus:outline-none focus:border-brand cursor-pointer appearance-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-black text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gold font-bold">▼</div>
              </div>

              {/* Route Summary Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-neutral-900">
                <div className="text-center">
                  <Milestone className="w-5 h-5 text-brand mx-auto mb-1.5" />
                  <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Mesafe</p>
                  <p className="font-bebas text-lg text-white mt-0.5 tracking-wider">{selectedRoute.distanceKm} KM</p>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 text-gold mx-auto mb-1.5" />
                  <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Tahmini Süre</p>
                  <p className="font-bebas text-lg text-white mt-0.5 tracking-wider">{selectedRoute.estimatedHours} Saat</p>
                </div>
                <div className="text-center">
                  <Gauge className="w-5 h-5 text-brand mx-auto mb-1.5" />
                  <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Zorluk</p>
                  <p className={`font-bebas text-lg mt-0.5 tracking-wider ${
                    selectedRoute.difficulty === 'Zor' ? 'text-brand' : selectedRoute.difficulty === 'Orta' ? 'text-gold' : 'text-emerald-500'
                  }`}>{selectedRoute.difficulty}</p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-sans border-b border-neutral-900 pb-2">
                  <span className="text-gray-400">Yol Durumu / Tipi</span>
                  <span className="text-white font-semibold">{selectedRoute.roadCondition}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans border-b border-neutral-900 pb-2">
                  <span className="text-gray-400">Rakım Aralığı</span>
                  <span className="text-white font-semibold">{selectedRoute.elevation}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans border-b border-neutral-900 pb-2">
                  <span className="text-gray-400">Başlangıç Noktası</span>
                  <span className="text-gold font-semibold">{selectedRoute.startPoint}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans border-b border-neutral-900 pb-2">
                  <span className="text-gray-400">Varış Noktası</span>
                  <span className="text-brand font-semibold">{selectedRoute.endPoint}</span>
                </div>
              </div>

              {/* Pit Stops / Mola Noktaları */}
              <div className="space-y-3">
                <p className="font-bebas text-sm text-gold tracking-wider uppercase">MOLA VE DURAK NOKTALARI</p>
                <div className="space-y-2">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-3 text-xs bg-black/60 p-2.5 rounded-sm border border-neutral-900/60">
                      <div className="w-5 h-5 rounded-full bg-brand/10 border border-brand/40 text-brand flex items-center justify-center font-mono text-[10px] font-bold">
                        {index + 1}
                      </div>
                      <span className="font-sans text-gray-300 font-medium">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GPS Launch Action */}
            <div className="pt-6">
              <a
                href={selectedRoute.gpsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-brand border border-brand text-white font-sans text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-brand-dark transition-all duration-300"
              >
                <Navigation className="w-4 h-4 fill-white" />
                <span>GPS NAVİGASYONU BAŞLAT</span>
              </a>
            </div>
          </div>

          {/* Right Column: Live Fuel Calculator & Map Frame */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* Map Frame Overlay with elegant custom styles */}
            <div className="relative rounded-sm overflow-hidden border border-neutral-900 bg-neutral-900/40 p-2 h-[340px]">
              {/* Actual Google Maps Styled Embed (uses dark filter) */}
              <iframe
                id="route-gmap-iframe"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRoute.name + ' ' + selectedRoute.endPoint)}&t=m&z=10&output=embed&iwloc=near`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%) grayscale(40%)' }}
                allowFullScreen={false}
                loading="lazy"
                title="AYMC Route Map"
              ></iframe>
              <div className="absolute bottom-6 right-6 p-2 bg-black/90 backdrop-blur-md border border-brand/30 rounded-sm pointer-events-none">
                <span className="font-sans text-[9px] tracking-widest text-brand font-bold uppercase flex items-center">
                  <MapPin className="w-3 h-3 text-brand mr-1 animate-pulse" />
                  KULÜP RESMİ SÜRÜŞ HARİTASI
                </span>
              </div>
            </div>

            {/* Fuel Consumption / Cost Calculator (Yakıt Hesaplama) */}
            <div className="bg-[#1A1A1A]/80 border border-neutral-900 rounded-sm p-6 sm:p-8">
              <span className="font-bebas text-lg text-white tracking-wider uppercase block border-b border-neutral-800 pb-3 flex items-center">
                <Fuel className="w-5 h-5 text-brand mr-2" />
                DİNAMİK YAKIT VE MALİYET HESAPLAMA
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">
                      Motosiklet Tüketimi (Lt / 100 Km)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="2"
                        max="15"
                        value={bikeConsumption}
                        onChange={(e) => setBikeConsumption(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs text-gray-500">Lt</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans font-bold tracking-wider text-gray-400 uppercase mb-2">
                      Litre Akaryakıt Fiyatı (TL / Lt)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="10"
                        max="100"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black border border-neutral-800 rounded-sm py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs text-gray-500">TL</span>
                    </div>
                  </div>
                </div>

                {/* Outputs Display (Matches Mockup aesthetics) */}
                <div className="bg-black/45 p-6 rounded-sm border border-neutral-900 flex flex-col justify-between">
                  <div className="border-b border-neutral-900 pb-4">
                    <span className="font-sans text-[10px] text-gray-500 tracking-wider uppercase font-bold block">Gereken Toplam Yakıt</span>
                    <span className="font-mono text-3xl font-extrabold text-white">{calculatedLiters}</span>
                    <span className="font-sans text-xs text-gray-400 ml-1.5 font-semibold">Litre</span>
                  </div>
                  <div className="pt-4">
                    <span className="font-sans text-[10px] text-gray-500 tracking-wider uppercase font-bold block">Tahmini Yakıt Gideri</span>
                    <span className="font-mono text-3xl font-extrabold text-gold">{calculatedCost}</span>
                    <span className="font-sans text-xs text-gold ml-1.5 font-bold">TL</span>
                  </div>
                </div>
              </div>

              {/* Safety notice disclaimer */}
              <div className="mt-5 flex items-start space-x-2 text-[10px] text-gray-500 leading-normal">
                <ShieldAlert className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                <span>Hesaplanan değerler ortalama şartlara göredir. Rüzgar, yol eğimi ve sürüş hızı yakıt tüketimini değiştirebilir. Kortej düzeninde yola çıkmadan deponuzu tam dolu tutunuz.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
