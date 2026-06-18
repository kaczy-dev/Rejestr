import React, { useState, useMemo } from 'react';
import { BlacklistEntry, EntryCategory } from '../types';
import { MapPin, Filter, RotateCcw, Building2, Coins, Landmark } from 'lucide-react';

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
      let matched = false;

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
          matched = true;
          break;
        }
      }

      // If no matched hotspot, we could handle general stats, but for simplicity
      // we match key hubs
    });

    return stats;
  }, [entries]);

  const activeReportsTotal = entries.length;

  return (
    <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-4 shadow-md overflow-hidden relative">
      {/* Decorative background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-amber-500" />
            Geograficzny rozkład zgłoszeń
          </h4>
          <p className="text-[10px] text-gray-400">Interaktywna mapa incydentów w regionach Polski</p>
        </div>
        {selectedLocation && (
          <button
            onClick={() => onSelectLocation(null)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Dla całego kraju
          </button>
        )}
      </div>

      {/* Main Map Container */}
      <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-[#090a0d] border border-[#1f2127]">
        {/* Poland stylized map background as SVG */}
        <svg
          viewBox="0 0 300 290"
          className="w-full max-w-[280px] h-auto select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle grid reference lines underneath */}
          <line x1="150" y1="0" x2="150" y2="290" stroke="#ffffff03" strokeDasharray="3 3" />
          <line x1="0" y1="145" x2="300" y2="145" stroke="#ffffff03" strokeDasharray="3 3" />

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
                  className={`text-[8px] font-mono tracking-tighter transition-all font-semibold ${
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
        </svg>

        {/* Floating Tooltip Panel inside Map Container */}
        <div className="absolute bottom-2 left-2 right-2 bg-[#0c0d10]/95 border border-[#1f2127] rounded-xl p-2 h-14 flex items-center justify-between backdrop-blur-md">
          {hoveredHotspot ? (
            (() => {
              const stats = hotspotStats[hoveredHotspot.id] || { count: 0, debt: 0, employers: 0, debtors: 0, others: 0 };
              return (
                <div className="w-full flex items-center justify-between">
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
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-bold">
                  AKTYWNY FILTR
                </span>
                <span className="text-xs font-bold text-white">{selectedLocation}</span>
              </div>
              <button
                onClick={() => onSelectLocation(null)}
                className="text-[9px] font-bold text-gray-400 hover:text-amber-500 underline"
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
