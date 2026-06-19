/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BlacklistEntry, EntryCategory } from '../types';
import { 
  MapPin, 
  RotateCcw, 
  Building2, 
  Coins, 
  Landmark, 
  ZoomIn, 
  ZoomOut, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff
} from 'lucide-react';

interface InteractiveIncidentMapProps {
  entries: BlacklistEntry[];
  selectedLocation: string | null;
  onSelectLocation: (location: string | null) => void;
}

interface MapHotspot {
  id: string;
  name: string;
  region: string;
  x: number; // SVG coordinate x (0-300)
  y: number; // SVG coordinate y (0-300)
  matchKeywords: string[];
}

const POLAND_HOTSPOTS: MapHotspot[] = [
  { id: 'warszawa', name: 'Warszawa', region: 'Mazowieckie', x: 215, y: 135, matchKeywords: ['warszaw', 'mazowieck'] },
  { id: 'wroclaw', name: 'Wrocław', region: 'Dolnośląskie', x: 95, y: 195, matchKeywords: ['wrocł', 'dolnośląsk', 'dolnoslask'] },
  { id: 'krakow', name: 'Kraków', region: 'Małopolskie', x: 175, y: 245, matchKeywords: ['krak', 'małopolsk', 'malopolsk'] },
  { id: 'poznan', name: 'Poznań', region: 'Wielkopolskie', x: 90, y: 125, matchKeywords: ['pozna', 'wielkopolsk'] },
  { id: 'gdansk', name: 'Gdańsk', region: 'Pomorskie', x: 145, y: 40, matchKeywords: ['gdań', 'gdans', 'pomorsk'] },
  { id: 'szczecin', name: 'Szczecin', region: 'Zachodniopomorskie', x: 35, y: 70, matchKeywords: ['szcze', 'zachod'] },
  { id: 'lodz', name: 'Łódź', region: 'Łódzkie', x: 155, y: 155, matchKeywords: ['łódź', 'lodz', 'łódzk'] },
  { id: 'lublin', name: 'Lublin', region: 'Lubelskie', x: 255, y: 185, matchKeywords: ['lubli', 'lubel'] },
  { id: 'bialystok', name: 'Białystok', region: 'Podlaskie', x: 260, y: 85, matchKeywords: ['biały', 'bialy', 'podlas'] },
  { id: 'katowice', name: 'Katowice', region: 'Śląskie', x: 145, y: 235, matchKeywords: ['katow', 'śląs', 'slas'] },
  { id: 'rzeszow', name: 'Rzeszów', region: 'Podkarpackie', x: 235, y: 250, matchKeywords: ['rzesz', 'podkarp'] }
];

export default function InteractiveIncidentMap({
  entries,
  selectedLocation,
  onSelectLocation
}: InteractiveIncidentMapProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<MapHotspot | null>(null);
  
  // Zooming & Panning states (QoL)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Map visibility toggle (QoL)
  const [isMapVisible, setIsMapVisible] = useState<boolean>(true);

  // Compute stats for each hotspot based on the entries array
  const hotspotStats = useMemo(() => {
    const stats: Record<string, {
      count: number;
      debt: number;
      employers: number;
      debtors: number;
      others: number;
    }> = {};

    // Initialize stats
    POLAND_HOTSPOTS.forEach(h => {
      stats[h.id] = { count: 0, debt: 0, employers: 0, debtors: 0, others: 0 };
    });

    // Populate stats from entries
    entries.forEach(entry => {
      const locLower = (entry.location || '').toLowerCase();

      // Find best hotspot match
      for (const h of POLAND_HOTSPOTS) {
        if (h.matchKeywords.some(keyword => locLower.includes(keyword))) {
          stats[h.id].count += 1;
          if (entry.totalDebtAmount) {
            stats[h.id].debt += entry.totalDebtAmount;
          }
          if (entry.category === EntryCategory.EMPLOYER) {
            stats[h.id].employers += 1;
          } else if (entry.category === EntryCategory.DEBTOR) {
            stats[h.id].debtors += 1;
          } else {
            stats[h.id].others += 1;
          }
          break;
        }
      }
    });

    return stats;
  }, [entries]);

  // Zoom control mechanics
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.25, 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Directional Pan mechanics
  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 40 / zoomLevel; // scale step based on zoom level
    setPanOffset(prev => {
      let x = prev.x;
      let y = prev.y;
      if (direction === 'up') y += step;
      if (direction === 'down') y -= step;
      if (direction === 'left') x += step;
      if (direction === 'right') x -= step;

      // Constrain within map limits based on scale
      const limit = (zoomLevel - 1) * 80;
      return {
        x: Math.min(Math.max(x, -limit), limit),
        y: Math.min(Math.max(y, -limit), limit)
      };
    });
  };

  return (
    <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-4 shadow-md overflow-hidden relative">
      {/* Decorative background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Header with quick map view toggle */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-amber-500" />
            Geograficzny rozkład zgłoszeń
          </h4>
          <p className="text-[10px] text-gray-400">Interaktywna mapa incydentów w regionach Polski</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Eye Icon Visibility Toggle */}
          <button
            type="button"
            id="btn-toggle-map"
            onClick={() => setIsMapVisible(prev => !prev)}
            title={isMapVisible ? "Ukryj interaktywną mapę" : "Pokaż interaktywną mapę"}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#121318] hover:bg-[#1a1c22] border border-[#21232a] text-[9.5px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {isMapVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Ukryj mapę</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Pokaż mapę</span>
              </>
            )}
          </button>

          {selectedLocation && (
            <button
              onClick={() => onSelectLocation(null)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Resetuj
            </button>
          )}
        </div>
      </div>

      {/* Main Map Container or Collapsed View */}
      {isMapVisible ? (
        <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-[#090a0d] border border-[#1f2127] overflow-hidden min-h-[290px]">
          
          {/* Zoom & Pan floating controller box at upper right */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5">
            {/* Zoom Action Hub */}
            <div className="flex flex-col bg-[#0c0d10]/95 border border-[#1f2126] rounded-lg p-1 shadow-2xl backdrop-blur-md">
              <button
                type="button"
                id="map-zoom-in"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                title="Przybliż"
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="map-zoom-out"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                title="Oddal"
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  id="map-zoom-reset"
                  onClick={handleResetZoom}
                  title="Przywróć standardowy widok"
                  className="p-1 rounded text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 active:scale-90 transition-all cursor-pointer border-t border-[#1a1c22]/80 mt-1 pt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Micro D-PAD directional scrolling when zoomed */}
            {zoomLevel > 1 && (
              <div className="flex flex-col bg-[#0c0d10]/95 border border-[#1f2126] rounded-lg p-1 shadow-2xl backdrop-blur-md items-center animate-fade-in">
                <span className="text-[6.5px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-0.5 select-none text-center">Nawigacja</span>
                <div className="grid grid-cols-3 gap-0.5 max-w-[50px]">
                  <div />
                  <button
                    type="button"
                    onClick={() => handlePan('up')}
                    title="Przesuń w górę"
                    className="p-0.5 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3 mx-auto" />
                  </button>
                  <div />
                  
                  <button
                    type="button"
                    onClick={() => handlePan('left')}
                    title="Przesuń w lewo"
                    className="p-0.5 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3 mx-auto" />
                  </button>
                  <div className="flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-amber-500/50" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePan('right')}
                    title="Przesuń w prawo"
                    className="p-0.5 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 mx-auto" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => handlePan('down')}
                    title="Przesuń w dół"
                    className="p-0.5 rounded text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3 mx-auto" />
                  </button>
                  <div />
                </div>
              </div>
            )}
          </div>

          {/* Poland stylized map background as SVG with dynamic coordinate zooming and panning */}
          <svg
            viewBox="0 0 300 290"
            className="w-full max-w-[280px] h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle grid reference lines underneath */}
            <line x1="150" y1="0" x2="150" y2="290" stroke="#ffffff03" strokeDasharray="3 3" />
            <line x1="0" y1="145" x2="300" y2="145" stroke="#ffffff03" strokeDasharray="3 3" />

            {/* Transformed Group applying translation and scale center point calculations */}
            <g 
              transform={`translate(${150 - 150 * zoomLevel + panOffset.x}, ${145 - 145 * zoomLevel + panOffset.y}) scale(${zoomLevel})`}
              className="transition-transform duration-300 ease-out"
            >
              {/* Stylized Poland Border Path */}
              <path
                d="M 145 15 
                   C 165 15, 185 25, 205 32 
                   C 225 38, 245 40, 260 45 
                   C 265 65, 275 85, 280 110 
                   C 285 135, 275 160, 285 185 
                   C 275 205, 265 225, 255 245 
                   C 240 260, 225 275, 200 280 
                   C 175 285, 145 280, 125 275 
                   C 105 270, 85 260, 65 245 
                   C 45 230, 35 210, 25 190 
                   C 15 170, 20 150, 15 130 
                   C 10 110, 25 90, 35 70 
                   C 50 60, 70 50, 95 40 
                   C 115 30, 130 15, 145 15 Z"
                fill="#111317"
                stroke="#1d2025"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all"
              />

              {/* Glowing boundary element */}
              <path
                d="M 145 15 
                   C 165 15, 185 25, 205 32 
                   C 225 38, 245 40, 260 45 
                   C 265 65, 275 85, 280 110 
                   C 285 135, 275 160, 285 185 
                   C 275 205, 265 225, 255 245 
                   C 240 260, 225 275, 200 280 
                   C 175 285, 145 280, 125 275 
                   C 105 270, 85 260, 65 245 
                   C 45 230, 35 210, 25 190 
                   C 15 170, 20 150, 15 130 
                   C 10 110, 25 90, 35 70 
                   C 50 60, 70 50, 95 40 
                   C 115 30, 130 15, 145 15 Z"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeOpacity="0.08"
                strokeLinejoin="round"
              />

              {/* Hotspots representation */}
              {POLAND_HOTSPOTS.map((hotspot) => {
                const stats = hotspotStats[hotspot.id] || { count: 0, debt: 0 };
                const isSelected = selectedLocation?.toLowerCase().includes(hotspot.name.toLowerCase());
                const hasIncidents = stats.count > 0;

                return (
                  <g
                    key={hotspot.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      onSelectLocation(hotspot.name);
                    }}
                    onMouseEnter={() => setHoveredHotspot(hotspot)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                  >
                    {/* Ping animation effect for active incidents */}
                    {hasIncidents && (
                      <circle
                        cx={hotspot.x}
                        cy={hotspot.y}
                        r={isSelected ? "14" : "10"}
                        className="fill-amber-500/20 animate-ping opacity-60"
                      />
                    )}

                    {/* Outer interactive circle */}
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r={isSelected ? "12" : "8"}
                      className={`transition-all duration-300 ${
                        isSelected 
                          ? 'fill-amber-500/30 stroke-amber-500 stroke-2'
                          : 'fill-[#171920] stroke-[#2d323f] group-hover:stroke-gray-400'
                      }`}
                    />

                    {/* Core indicator dot */}
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r="3.5"
                      className={`transition-all ${
                        isSelected 
                          ? 'fill-amber-400' 
                          : hasIncidents 
                            ? 'fill-red-400 border border-black' 
                            : 'fill-gray-600'
                      }`}
                    />

                    {/* City visual label if count is high or on hover */}
                    <text
                      x={hotspot.x}
                      y={hotspot.y - 12}
                      textAnchor="middle"
                      className={`text-[8.5px] font-mono tracking-tighter transition-all font-semibold select-none ${
                        isSelected 
                          ? 'fill-amber-400 font-bold opacity-100'
                          : hasIncidents 
                            ? 'fill-gray-300 opacity-90' 
                            : 'fill-gray-500 opacity-40 group-hover:opacity-100'
                      }`}
                    >
                      {hotspot.name} {hasIncidents && `(${stats.count})`}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip Panel inside Map Container */}
          <div className="absolute bottom-2 left-2 right-2 bg-[#0c0d10]/95 border border-[#1f2127] rounded-xl p-2 h-14 flex items-center justify-between backdrop-blur-md">
            {hoveredHotspot ? (
              (() => {
                const stats = hotspotStats[hoveredHotspot.id] || { count: 0, debt: 0, employers: 0, debtors: 0, others: 0 };
                return (
                  <div className="w-full flex items-center justify-between animate-fade-in text-left">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] uppercase font-bold text-white tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {hoveredHotspot.name} <span className="text-gray-500 font-normal">({hoveredHotspot.region})</span>
                      </span>
                      <div className="flex gap-3 text-[9px] text-gray-400">
                        <span className="flex items-center gap-0.5 font-mono">
                          <Building2 className="w-2.5 h-2.5 text-amber-500/70" /> {stats.employers} firm
                        </span>
                        <span className="flex items-center gap-0.5 font-mono">
                          <Coins className="w-2.5 h-2.5 text-red-500/70" /> {stats.debtors} dłuż.
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-semibold">Suma długu</span>
                      <span className="text-[11px] font-bold text-red-400 font-mono">{stats.debt.toLocaleString()} zł</span>
                    </div>
                  </div>
                );
              })()
            ) : selectedLocation ? (
              <div className="w-full flex items-center justify-between text-left animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-bold">
                    AKTYWNY FILTR
                  </span>
                  <span className="text-xs font-bold text-white">{selectedLocation}</span>
                </div>
                <button
                  onClick={() => onSelectLocation(null)}
                  className="text-[9px] font-bold text-gray-400 hover:text-amber-500 underline cursor-pointer"
                >
                  Pokaż wszystkie kraje
                </button>
              </div>
            ) : (
              <div className="w-full text-center py-1 text-gray-400 text-[9px] flex items-center justify-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500/50 animate-bounce" />
                <span>Najedź lub kliknij punkt na mapie, aby sprawdzić i przefiltrować podmioty</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Map Placeholder with Beautiful Quick Action to Re-Enable */
        <div 
          onClick={() => setIsMapVisible(true)}
          className="group relative flex flex-col items-center justify-center p-6 py-10 rounded-xl bg-[#090a0d] hover:bg-[#0c0d11] border border-[#1f2127]/80 hover:border-amber-500/30 transition-all duration-300 cursor-pointer text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 border border-amber-500/10 group-hover:border-amber-500/25 flex items-center justify-center transition-all">
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-200 block uppercase tracking-wider">
              Mapa regionów jest zwinięta
            </span>
            <p className="text-[9px] text-gray-400 max-w-[280px] mx-auto leading-normal">
              Ukryłeś wizualizację geograficzną, aby zmaksymalizować wolne miejsce na ekrany bazy danych dłużników. Kliknij tutaj, aby natychmiast ją otworzyć.
            </p>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 text-[8.5px] uppercase font-bold tracking-widest text-[#090a0d] bg-amber-500 rounded group-hover:bg-amber-400 group-active:scale-95 transition-all shadow-lg font-mono"
          >
            ROZWIŃ INTERAKTYWNĄ MAPĘ
          </button>
        </div>
      )}

      {/* Mini Regional Statistics Badge Slider */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#14151a]/80 p-2 rounded-xl text-center border border-[#1d2025]">
          <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Warszawa</span>
          <span className="text-xs font-bold text-gray-200 font-mono">
            {hotspotStats['warszawa']?.count || 0} zgł.
          </span>
        </div>
        <div className="bg-[#14151a]/80 p-2 rounded-xl text-center border border-[#1d2025]">
          <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Wrocław</span>
          <span className="text-xs font-bold text-gray-200 font-mono">
            {hotspotStats['wroclaw']?.count || 0} zgł.
          </span>
        </div>
        <div className="bg-[#14151a]/80 p-2 rounded-xl text-center border border-[#1d2025]">
          <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Kraków</span>
          <span className="text-xs font-bold text-gray-200 font-mono">
            {hotspotStats['krakow']?.count || 0} zgł.
          </span>
        </div>
      </div>
    </div>
  );
}
