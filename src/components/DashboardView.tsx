/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { BlacklistEntry, EntryCategory, VerificationStatus } from '../types';
import {
  BarChart3,
  PieChart as PieIcon,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Layers,
  MapPin,
  TrendingUp,
  RefreshCw,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  entries: BlacklistEntry[];
  onSelectEntry: (id: string) => void;
}

export default function DashboardView({ entries, onSelectEntry }: DashboardViewProps) {
  // Filters local to the Dashboard for deep analysis
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string | null>(null);

  // Helper: extract region name from location string (e.g. "Gdańsk, Pomorskie" -> "Pomorskie")
  const getRegion = (location: string) => {
    if (!location) return 'Nieokreślone';
    const parts = location.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  };

  // Filtered dataset for charts
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (selectedCategoryFilter !== 'ALL' && e.category !== selectedCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [entries, selectedCategoryFilter]);

  // General Metrics / KPI calculation
  const stats = useMemo(() => {
    const totalClaims = filteredEntries.length;
    const totalDebt = filteredEntries.reduce((acc, e) => acc + (e.totalDebtAmount || 0), 0);
    const avgClaim = totalClaims > 0 ? Math.round(totalDebt / totalClaims) : 0;
    
    // Max individual debt
    const maxClaim = filteredEntries.reduce((max, e) => {
      const amt = e.totalDebtAmount || 0;
      return amt > max ? amt : max;
    }, 0);

    // Verification rates
    const verifiedEntries = filteredEntries.filter(e => e.status === VerificationStatus.VERIFIED);
    const verifiedDebt = verifiedEntries.reduce((acc, e) => acc + (e.totalDebtAmount || 0), 0);
    const verificationRate = totalDebt > 0 ? Math.round((verifiedDebt / totalDebt) * 100) : 0;

    return {
      totalClaims,
      totalDebt,
      avgClaim,
      maxClaim,
      verificationRate,
      verifiedCount: verifiedEntries.length
    };
  }, [filteredEntries]);

  // 1. Recharts BarChart data: Debt distribution across different regions
  const regionalDebtData = useMemo(() => {
    const regionsMap: { [key: string]: { name: string; debt: number; count: number } } = {};

    filteredEntries.forEach(entry => {
      const region = getRegion(entry.location);
      const debt = entry.totalDebtAmount || 0;
      if (!regionsMap[region]) {
        regionsMap[region] = { name: region, debt: 0, count: 0 };
      }
      regionsMap[region].debt += debt;
      regionsMap[region].count += 1;
    });

    return Object.values(regionsMap).sort((a, b) => b.debt - a.debt);
  }, [filteredEntries]);

  // 2. Recharts PieChart data: Debt distribution by Verification Status
  const statusDebtData = useMemo(() => {
    const statusMap = {
      [VerificationStatus.VERIFIED]: { name: 'Zweryfikowane', value: 0, color: '#10b981', polish: 'Zweryfikowane' },
      [VerificationStatus.UNDER_REVIEW]: { name: 'W trakcie weryfikacji', value: 0, color: '#f59e0b', polish: 'Weryfikowane' },
      [VerificationStatus.PENDING]: { name: 'Oczekujące', value: 0, color: '#ef4444', polish: 'Oczekujące' },
    };

    filteredEntries.forEach(entry => {
      const debt = entry.totalDebtAmount || 0;
      const status = entry.status;
      if (statusMap[status]) {
        statusMap[status].value += debt;
      }
    });

    return Object.values(statusMap).filter(item => item.value > 0);
  }, [filteredEntries]);

  // Filter entries of the clicked/selected region
  const regionSpecificEntries = useMemo(() => {
    if (!selectedRegionFilter) return [];
    return filteredEntries.filter(e => getRegion(e.location) === selectedRegionFilter);
  }, [filteredEntries, selectedRegionFilter]);

  // Chart Custom Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#121318] border border-amber-500/20 p-3 rounded-xl shadow-2xl space-y-1 font-sans">
          <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase font-bold">{data.name}</p>
          <p className="text-sm font-black text-amber-400">{data.debt.toLocaleString()} PLN</p>
          <div className="flex justify-between text-[9px] text-gray-500 gap-4 mt-0.5 pt-0.5 border-t border-[#1f2127]">
            <span>Liczba dłużników:</span>
            <span className="text-white font-bold">{data.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = stats.totalDebt > 0 ? ((data.value / stats.totalDebt) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#121318] border border-[#272a30] p-3 rounded-xl shadow-2xl space-y-1 font-sans">
          <p className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ color: data.color }}>{data.name}</p>
          <p className="text-xs font-black text-white">{data.value.toLocaleString()} PLN</p>
          <p className="text-[9px] text-gray-400 font-mono">Udział w długu: <span className="text-white font-bold">{pct}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      {/* View Header */}
      <div className="bg-[#0f1013] border border-[#1f2127] p-4 rounded-2xl flex flex-col gap-1.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/35 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wide">
                Interaktywny Panel Analiz (Recharts)
              </h2>
              <p className="text-[10px] text-gray-400">Analiza dystrybucji długu krajowego, wskaźniki wiarygodności i geolokalizacja.</p>
            </div>
          </div>
          <span className="text-[8px] px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono font-black uppercase">
            LIVE STATS
          </span>
        </div>

        {/* Categories Tab selector */}
        <div className="flex items-center gap-1.5 mt-2.5 bg-[#121318] p-1 rounded-xl border border-[#212328]/80">
          <button
            onClick={() => {
              setSelectedCategoryFilter('ALL');
              setSelectedRegionFilter(null);
            }}
            className={`flex-1 text-[9px] py-1.5 px-2 rounded-lg font-bold tracking-wider transition-all cursor-pointer ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-amber-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            WSZYSTKO ({entries.length})
          </button>
          <button
            onClick={() => {
              setSelectedCategoryFilter(EntryCategory.DEBTOR);
              setSelectedRegionFilter(null);
            }}
            className={`flex-1 text-[9px] py-1.5 px-2 rounded-lg font-bold tracking-wider transition-all cursor-pointer ${
              selectedCategoryFilter === EntryCategory.DEBTOR
                ? 'bg-amber-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            DŁUŻNICY
          </button>
          <button
            onClick={() => {
              setSelectedCategoryFilter(EntryCategory.EMPLOYER);
              setSelectedRegionFilter(null);
            }}
            className={`flex-1 text-[9px] py-1.5 px-2 rounded-lg font-bold tracking-wider transition-all cursor-pointer ${
              selectedCategoryFilter === EntryCategory.EMPLOYER
                ? 'bg-amber-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            PRACODAWCY
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Total Debt Card */}
        <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-red-500/5 rounded-full blur-lg" />
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Suma Roszczeń</span>
            <Coins className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-base font-black text-white font-mono break-all block">
              {stats.totalDebt.toLocaleString()}
            </span>
            <span className="text-[8px] text-gray-400 font-mono uppercase">PLN ŁĄCZNIE</span>
          </div>
        </div>

        {/* Verification Rate Card */}
        <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg" />
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Wsk. Weryfikacji</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-base font-black text-emerald-400 font-mono block">
              {stats.verificationRate}%
            </span>
            <span className="text-[8px] text-gray-400 font-mono uppercase">
              {stats.verifiedCount} Z {stats.totalClaims} SPRAWDZONYCH
            </span>
          </div>
        </div>

        {/* Avg Claim Card */}
        <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Średnie roszczenie</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-sm font-black text-white font-mono block">
              {stats.avgClaim.toLocaleString()} PLN
            </span>
            <span className="text-[8px] text-gray-400 font-mono uppercase">ŚREDNIA SPRAW</span>
          </div>
        </div>

        {/* Max Claim Card */}
        <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Rekordowe Roszczenie</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-sm font-black text-amber-400 font-mono block">
              {stats.maxClaim.toLocaleString()} PLN
            </span>
            <span className="text-[8px] text-gray-400 font-mono uppercase">MAKSMYMALNE</span>
          </div>
        </div>

      </div>

      {/* Main Bar Chart: Debt by Region */}
      <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Rozkład zadłużenia wg Województw
            </h3>
            <p className="text-[9px] text-gray-400">Kliknij na słupek regionu, aby pokazać listę dłużników z danej strefy.</p>
          </div>
          {selectedRegionFilter && (
            <button
              onClick={() => setSelectedRegionFilter(null)}
              className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold hover:bg-amber-500/20 active:scale-95 cursor-pointer transition-all"
            >
              Resetuj filtr regionu
            </button>
          )}
        </div>

        {regionalDebtData.length === 0 ? (
          <div className="h-36 flex items-center justify-center border border-dashed border-[#1f2127] rounded-xl text-[10px] text-gray-500 font-mono">
            Brak danych do wyświetlenia dla wybranej kategorii.
          </div>
        ) : (
          <div className="h-44 w-full select-none" id="dashboard-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalDebtData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                onClick={(data) => {
                  if (data && data.activeLabel) {
                    setSelectedRegionFilter(String(data.activeLabel));
                  }
                }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={8.5}
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis
                  stroke="#4b5563"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                <Bar
                  dataKey="debt"
                  name="Suma Długu"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {regionalDebtData.map((entry, index) => {
                    const isSelected = selectedRegionFilter === entry.name;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isSelected ? '#38bdf8' : 'url(#barGradient)'}
                        stroke={isSelected ? '#0ea5e9' : 'transparent'}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Pie Chart status & details of region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Verification Status Distribution */}
        <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-3.5 shadow-md">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-amber-500" />
              Podział długu wg statusu prawnego
            </h3>
            <p className="text-[9px] text-gray-400">Wiarygodność i stopień prawny zabezpieczeń w zł.</p>
          </div>

          {statusDebtData.length === 0 ? (
            <div className="h-32 flex items-center justify-center border border-dashed border-[#1f2127] rounded-xl text-[10px] text-gray-500 font-mono">
              Brak danych statusów długu.
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5">
              {/* Pie Component */}
              <div className="h-28 w-28 shrink-0 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={statusDebtData}
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={44}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDebtData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends details */}
              <div className="flex-1 space-y-1.5 font-mono text-[9.5px]">
                {statusDebtData.map((item, idx) => {
                  const percent = stats.totalDebt > 0 ? ((item.value / stats.totalDebt) * 100).toFixed(0) : 0;
                  return (
                    <div key={idx} className="flex items-start gap-1.5 p-1 rounded hover:bg-white/2 cursor-default">
                      <span className="w-2 h-2 rounded mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-white font-bold">
                          <span className="truncate pr-1 text-gray-400 font-sans font-semibold">{item.name}</span>
                          <span>{percent}%</span>
                        </div>
                        <span className="text-[8px] text-gray-500 block">{item.value.toLocaleString()} PLN</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Detail Card or Filter outcome */}
        <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl flex flex-col justify-between shadow-md min-h-[148px]">
          {selectedRegionFilter ? (
            <div className="space-y-2.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Województwo: {selectedRegionFilter}
                </div>
                <p className="text-[9px] text-[#9ca3af] mt-0.5">Sprawy zlokalizowane w tym regionie ({regionSpecificEntries.length}):</p>
                
                <div className="mt-2 space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {regionSpecificEntries.map(e => (
                    <div 
                      key={e.id}
                      onClick={() => onSelectEntry(e.id)}
                      className="group flex justify-between items-center bg-[#15171d] hover:bg-[#1f2229] border border-[#212429] p-2 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-white truncate block group-hover:text-amber-400 transition-colors">
                          {e.name}
                        </span>
                        <span className="text-[8px] text-gray-500 font-mono">
                          {e.identifier}
                        </span>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1 pl-2">
                        <span className="text-[9.5px] font-mono font-bold text-red-400">
                          {e.totalDebtAmount ? `${e.totalDebtAmount.toLocaleString()} PLN` : 'Brak kwoty'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[8px] text-gray-500 font-mono italic leading-none pt-2 border-t border-[#1a1c22]">
                Wybierz dowolną sprawę powyżej, aby przejść do dowodów i dyskusji.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 my-auto space-y-2">
              <Info className="w-7 h-7 text-gray-500/70" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-300 block uppercase tracking-wide">Szczegóły Regionalne</span>
                <p className="text-[9px] text-gray-500 max-w-[210px] mx-auto leading-normal">
                  Kliknij pojedynczy słupek na wykresie województw, aby zobaczyć szczegóły dłużników i spraw z danej lokalizacji.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Summary insights / Educational legal breakdown */}
      <div className="bg-[#101115] border border-amber-500/10 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-sm">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[9.5px] font-black text-white uppercase tracking-wider block">Wskazówki dla Wierzyciela</span>
          <p className="text-[9px] text-gray-400 leading-normal">
            Pamiętaj, że odsetki ustawowe w Polsce (RP) naliczane są od dnia następującego po dniu wymagalności roszczenia. Wykresy w bazie ROS aktualizują się w czasie rzeczywistym po zatwierdzeniu wpisu przez moderatorów.
          </p>
        </div>
      </div>
    </div>
  );
}
