/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { 
  BlacklistEntry, 
  EntryCategory, 
  VerificationStatus, 
  ChatRoom, 
  AppNotification, 
  CryptoKeyPair 
} from './types';
import { 
  INITIAL_ENTRIES, 
  INITIAL_ROOMS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';
import { generateMockKeyPair } from './cryptoUtils';

// Helper component for Recharts Custom Tooltip
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121318] border border-[#272a30] p-2 rounded-xl shadow-lg">
        <p className="text-[10px] text-gray-400 font-mono">{payload[0].payload.label}</p>
        <p className="text-xs font-bold text-[#f59e0b]">{`Ilość zgłoszeń: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Import subcomponents
import AddEntryModal from './components/AddEntryModal';
import EntryDetails from './components/EntryDetails';
import SecureChat from './components/SecureChat';
import NotificationsPanel from './components/NotificationsPanel';
import InteractiveIncidentMap from './components/InteractiveIncidentMap';

// Icons
import { 
  Search, 
  Menu, 
  SlidersHorizontal, 
  Plus, 
  Layers, 
  FileText,
  VolumeX, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  Lock, 
  MessageSquare, 
  Bell, 
  BookOpen, 
  ArrowUpRight, 
  ShieldCheck, 
  Users,
  Coins,
  Calculator,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Building2,
  Trash2,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  Link,
  Download,
  Upload,
  Database,
  Copy,
  Check,
  Share2,
  X
} from 'lucide-react';

export default function App() {
  // Navigation / Tabs state
  // "entries" | "chat" | "notifications" | "legal-guide" 
  const [activeTab, setActiveTab] = useState<'entries' | 'chat' | 'notifications' | 'legal-guide'>('entries');
  
  // App core states
  const [entries, setEntries] = useState<BlacklistEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ros_entries_v1');
      return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
    } catch {
      return INITIAL_ENTRIES;
    }
  });
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    try {
      const saved = localStorage.getItem('ros_rooms_v1');
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('ros_notifications_v1');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [cryptKeyPair, setCryptKeyPair] = useState<CryptoKeyPair | null>(null);
  
  // Selection and interaction state
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-gen');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL'); // ALL, EMPLOYER, DEBTOR, INDIVIDUAL
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // ALL, VERIFIED, UNDER_REVIEW, PENDING
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);
  
  // Modals status
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [appTipsDismissed, setAppTipsDismissed] = useState(false);

  // Backup & Import states (QoL)
  const [isCopyingFeedback, setIsCopyingFeedback] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonContent, setImportJsonContent] = useState('');
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);

  // Share states (QoL)
  const [sharingEntry, setSharingEntry] = useState<BlacklistEntry | null>(null);
  const [copyShareUrlFeedback, setCopyShareUrlFeedback] = useState(false);

  // QoL Legal subtabs
  const [legalSubTab, setLegalSubTab] = useState<'handbook' | 'calculator' | 'demand-builder'>('handbook');

  // QoL Interest calculator states
  const [calcDebt, setCalcDebt] = useState<number>(12500);
  const [calcDueDate, setCalcDueDate] = useState<string>('2026-02-15');
  const [calcIsCommercial, setCalcIsCommercial] = useState<boolean>(true);

  // QoL Demand letter states
  const [letterCreditor, setLetterCreditor] = useState<string>('Jan Kowalski');
  const [letterDebtor, setLetterDebtor] = useState<string>('UczciwyInwestor Sp. z o.o.');
  const [letterDebtorAddress, setLetterDebtorAddress] = useState<string>('ul. Przemysłowa 8A, 61-512 Poznań');
  const [letterAmount, setLetterAmount] = useState<string>('12500');
  const [letterTitle, setLetterTitle] = useState<string>('Niewypłacona faktura FV/2026/03 za usługi transportowe');
  const [letterDueDateDays, setLetterDueDateDays] = useState<string>('7');
  const [copyLetterFeedback, setCopyLetterFeedback] = useState<boolean>(false);

  // Watched state setup (Follow / watch feature)
  const [watchedEntryIds, setWatchedEntryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watched_entries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Expanded inline preview states
  const [expandedEntryIds, setExpandedEntryIds] = useState<string[]>([]);

  // Toggle follow/watch handler
  const handleToggleWatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchedEntryIds(prev => {
      const isWatched = prev.includes(id);
      const next = isWatched ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('watched_entries', JSON.stringify(next));
      return next;
    });

    // Create a dynamic notification when watching an entry
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const isWatched = watchedEntryIds.includes(id);
      const watchNotify: AppNotification = {
        id: `sys-watch-${Date.now()}`,
        title: isWatched ? 'Przestałeś obserwować wpis' : 'Rozpoczęto obserwowanie wpisu',
        message: isWatched 
          ? `Wpis "${entry.name}" został usunięty z Twojej listy obserwowanych.`
          : `Wpis "${entry.name}" został dodany do Twojej listy obserwowanych. Będziesz otrzymywać powiadomienia o nowych aktualizacjach i spłatach długu.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications(prev => [watchNotify, ...prev]);
    }
  };

  // Toggle inline expand handler
  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEntryIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Auto-save whenever core lists change to persist data transparently in LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ros_entries_v1', JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving entries', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem('ros_rooms_v1', JSON.stringify(rooms));
    } catch (e) {
      console.error('Error saving rooms', e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('ros_notifications_v1', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications', e);
    }
  }, [notifications]);

  // QoL: Export raw data as downloadable JSON backup file
  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify(entries, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'kopia_zapasowa_ros.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      const finishNotify: AppNotification = {
        id: `sys-export-${Date.now()}`,
        title: 'Wyeksportowano bazę ROS',
        message: 'Pomyślnie pobrano plik kopii zapasowej danych (kopia_zapasowa_ros.json) z bieżącymi wpisami.',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications(prev => [finishNotify, ...prev]);
    } catch {
      alert('Nie udało się utworzyć pliku kopii zapasowej.');
    }
  };

  // QoL: Copy state JSON code representation directly to user clipboard
  const handleCopyClipboardBackup = () => {
    try {
      const dataStr = JSON.stringify(entries, null, 2);
      navigator.clipboard.writeText(dataStr).then(() => {
        setIsCopyingFeedback(true);
        setTimeout(() => setIsCopyingFeedback(false), 2000);

        const copyNotify: AppNotification = {
          id: `sys-copy-${Date.now()}`,
          title: 'Skopiowano bazę do schowka',
          message: 'Kompletna paczka danych dłużników i firm została zapisana w schowku systemowym w formacie JSON.',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'SYSTEM'
        };
        setNotifications(prev => [copyNotify, ...prev]);
      });
    } catch {
      alert('Nie udało się skopiować danych.');
    }
  };

  // QoL: Validate and import external backup data
  const handleImportBackup = () => {
    try {
      if (!importJsonContent.trim()) {
        setImportErrorMsg('Wklej najpierw poprawną zawartość JSON!');
        return;
      }
      const parsed = JSON.parse(importJsonContent);
      if (!Array.isArray(parsed)) {
        setImportErrorMsg('Dociążany backup musi być tablicą [] obiektów zgłoszeń (JSON array).');
        return;
      }
      
      // Basic check for mandatory structures to prevent app crash
      const isValid = parsed.every(entry => {
        return entry && typeof entry === 'object' && 'id' in entry && 'name' in entry && 'category' in entry;
      });

      if (!isValid) {
        setImportErrorMsg('Nieprawidłowy schemat danych. Obiekty muszą zawierać pola: id, name, category.');
        return;
      }

      setEntries(parsed);
      setImportJsonContent('');
      setImportErrorMsg(null);
      setIsImportOpen(false);

      const importNotify: AppNotification = {
        id: `sys-import-${Date.now()}`,
        title: 'Przywrócono bazę danych ROS',
        message: `Pomyślnie zaimportowano ${parsed.length} podmiotów z zewnętrznego pliku kopii zapasowej. Dane zostały zapisane.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications(prev => [importNotify, ...prev]);
    } catch (err: any) {
      setImportErrorMsg(`Błąd składni JSON: ${err.message || err}`);
    }
  };

  // QoL: Reset Database back to factory template defaults
  const handleResetToDefault = () => {
    if (confirm('Czy na pewno chcesz przywrócić domyślne, symulowane wpisy demo? Wszystkie Twoje niestandardowe wpisy zostaną usunięte.')) {
      setEntries(INITIAL_ENTRIES);
      localStorage.removeItem('ros_entries_v1');
      
      const resetNotify: AppNotification = {
        id: `sys-reset-${Date.now()}`,
        title: 'Przywrócono stan fabryczny',
        message: 'Baza zgłoszeń została zresetowana do domyślnych bezpiecznych danych demonstracyjnych ROS.',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications(prev => [resetNotify, ...prev]);
    }
  };

  // Initialize secure cryptographic pair on app load to have dynamic, responsive experience
  useEffect(() => {
    // We can auto-initialize an E2EE pair or let the user generate to maintain simulation immersion
    const savedKeys = localStorage.getItem('transparency_tracker_keys');
    if (savedKeys) {
      setCryptKeyPair(JSON.parse(savedKeys));
    }
  }, []);

  // Check for 'entry' or 'id' in URL search query on mount and auto-select/expand (QoL)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const entryId = params.get('entry') || params.get('id');
      if (entryId) {
        const found = entries.find(e => e.id === entryId || e.id.toLowerCase() === entryId.toLowerCase() || e.id.endsWith(entryId));
        if (found) {
          setSelectedEntryId(found.id);
          setActiveTab('entries');
          setExpandedEntryIds(prev => prev.includes(found.id) ? prev : [...prev, found.id]);
        }
      }
    } catch (e) {
      console.error('Error handling direct link route', e);
    }
  }, [entries]);

  const handleGenerateKeyPair = (alias: string) => {
    const freshPair = generateMockKeyPair(alias);
    setCryptKeyPair(freshPair);
    localStorage.setItem('transparency_tracker_keys', JSON.stringify(freshPair));
    
    // Create systems notify
    const keyNotify: AppNotification = {
      id: `sys-not-${Date.now()}`,
      title: 'Wygenerowano klucze E2EE',
      message: `Pomyślnie utworzono asymetryczną parę dla aliasu ${alias}. Twój klucz publiczny został rozgłoszony do zaufanych węzłów sieci Transparency Tracker.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'SYSTEM'
    };
    setNotifications(prev => [keyNotify, ...prev]);
  };

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  // Get report trends for the last 30 days (by weeks)
  const getWeeklyTrendData = () => {
    // Current base study time anchored at system local time (Jun 17, 2026)
    const now = new Date('2026-06-17T21:47:54-07:00').getTime();
    
    let w1Count = 0; // 30-22 days ago
    let w2Count = 0; // 21-15 days ago
    let w3Count = 0; // 14-8 days ago
    let w4Count = 0; // last 7 days

    entries.forEach(entry => {
      const entryTime = new Date(entry.reportedAt).getTime();
      const diffDays = (now - entryTime) / (1000 * 60 * 60 * 24);

      if (diffDays >= 0 && diffDays <= 30) {
        if (diffDays <= 7) {
          w4Count++;
        } else if (diffDays <= 14) {
          w3Count++;
        } else if (diffDays <= 21) {
          w2Count++;
        } else {
          w1Count++;
        }
      } else if (diffDays < 0) {
        // Fallback for simulated reports whose timestamp is in the future relative to the anchor
        w4Count++;
      }
    });

    return [
      { name: 'Tydz 1', raporty: w1Count + 1, label: '30 do 22 dni temu' },
      { name: 'Tydz 2', raporty: w2Count + 2, label: '21 do 15 dni temu' },
      { name: 'Tydz 3', raporty: w3Count + 3, label: '14 do 8 dni temu' },
      { name: 'Tydz 4', raporty: w4Count + 2, label: 'Ostatnie 7 dni' },
    ];
  };

  // Filter logic
  const filteredEntries = entries.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'ALL' || 
      (selectedCategory === 'WATCHED' ? watchedEntryIds.includes(item.id) : item.category === selectedCategory);

    const matchesStatus = 
      selectedStatus === 'ALL' || item.status === selectedStatus;

    const matchesLocation = 
      !selectedLocationFilter || item.location.toLowerCase().includes(selectedLocationFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  // Calculate sum numbers for the dashboard stats
  const totalVerifiedEmployers = entries.filter(e => e.category === EntryCategory.EMPLOYER && e.status === VerificationStatus.VERIFIED).length;
  const totalOutstandingDebts = entries
    .filter(e => e.totalDebtAmount)
    .reduce((acc, current) => acc + (current.totalDebtAmount || 0), 0);

  // Actions
  const handleAddNewEntry = (entry: BlacklistEntry) => {
    setEntries([entry, ...entries]);
    
    // Also push a real-time notification
    const alert: AppNotification = {
      id: `alert-${Date.now()}`,
      title: `Zgłoszono podmiot: ${entry.name}`,
      message: `Do rejestru dodano nowe zgłoszenie w kategorii ${entry.category === EntryCategory.EMPLOYER ? 'PRACODAWCA' : 'DŁUŻNIK'} z lokalizacji ${entry.location}. Trwa wstępna weryfikacja.`,
      timestamp: entry.reportedAt,
      isRead: false,
      type: 'NEW_ENTRY',
      linkToId: entry.id
    };
    setNotifications([alert, ...notifications]);
  };

  const handleVoteEntry = (id: string, isUpvote: boolean) => {
    setEntries(prevEntries => 
      prevEntries.map(e => {
        if (e.id === id) {
          return {
            ...e,
            upvotes: isUpvote ? e.upvotes + 1 : e.upvotes,
            downvotes: !isUpvote ? e.downvotes + 1 : e.downvotes,
          };
        }
        return e;
      })
    );
  };

  const handleAddCommentToEntry = (entryId: string, text: string, alias: string) => {
    setEntries(prevEntries => 
      prevEntries.map(e => {
        if (e.id === entryId) {
          return {
            ...e,
            comments: [
              ...e.comments,
              {
                id: `c-${Date.now()}`,
                authorAlias: alias,
                text,
                isEncrypted: false,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return e;
      })
    );
  };

  const handleOpenDispute = (entryId: string, statement: string) => {
    setEntries(prevEntries => 
      prevEntries.map(e => {
        if (e.id === entryId) {
          return {
            ...e,
            status: VerificationStatus.UNDER_REVIEW,
            disputes: [
              ...e.disputes,
              {
                id: `disp-${Date.now()}`,
                submittedAt: new Date().toISOString(),
                statement,
                status: 'OPEN'
              }
            ]
          };
        }
        return e;
      })
    );

    // Notify of dispute update
    const dispAlert: AppNotification = {
      id: `disp-not-${Date.now()}`,
      title: 'Rozpoczęto procedurę sporu',
      message: `Zgłoszenie id ${entryId} zostało oznaczone jako "W TRAKCIE SPORU" po wniesieniu oficjalnego odwołania przez przedstawiciela podmiotu.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'DISPUTE_UPDATE',
      linkToId: entryId
    };
    setNotifications(prev => [dispAlert, ...prev]);
  };

  const handleJoinSecureChat = (entryId: string, roomTitle: string) => {
    // Check if room already exists
    const existingRoom = rooms.find(r => r.targetEntryId === entryId);
    if (existingRoom) {
      setSelectedRoomId(existingRoom.id);
    } else {
      const newRoom: ChatRoom = {
        id: `room-${Date.now()}`,
        title: roomTitle,
        description: `Szyfrowany kanał sprawdzający dowody i ustalenia w toku sprawy i podważania wpisu ${entryId}.`,
        type: 'CASE_DISPUTE',
        targetEntryId: entryId
      };
      setRooms([...rooms, newRoom]);
      setSelectedRoomId(newRoom.id);
    }
    // Jump to chat tab
    setActiveTab('chat');
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSimulateNewNotification = () => {
    const randomFirms = [
      'JanuszTrans Transport Krajowy',
      'Horyzont IT Solutions',
      'StalBud Adam Małysz',
      'Gastronomia Starówka SC'
    ];
    const cityList = ['Warszawa', 'Kraków', 'Łódź', 'Gdańsk', 'Szczecin'];
    const selectedFirm = randomFirms[Math.floor(Math.random() * randomFirms.length)];
    const selectedCity = cityList[Math.floor(Math.random() * cityList.length)];
    const id = `ent-${Date.now()}`;

    // Add list entry dynamically
    const simulatedEntry: BlacklistEntry = {
      id,
      category: Math.random() > 0.5 ? EntryCategory.EMPLOYER : EntryCategory.DEBTOR,
      name: selectedFirm,
      identifier: 'NIP: ' + Math.floor(1000000000 + Math.random() * 9000000000),
      location: `${selectedCity}, Polska`,
      description: 'Zgłoszenie automatyczne od lokalnego zrzeszenia podwykonawców. Brak kontaktu telefonicznego, uchylanie się od płatności za dostarczone materiały i półprodukty budowlane.',
      totalDebtAmount: Math.random() > 0.5 ? Math.floor(10000 + Math.random() * 80000) : undefined,
      reportedAt: new Date().toISOString(),
      reporterAlias: 'Sygnalista_Automatyczny',
      status: VerificationStatus.PENDING,
      upvotes: 2,
      downvotes: 0,
      evidenceLinks: ['Zgłoszenie zbiorcze sygn: 2026/A-399'],
      resolved: false,
      comments: [],
      disputes: [],
      views: 7
    };

    setEntries(prev => [simulatedEntry, ...prev]);

    const simNotify: AppNotification = {
      id: `alert-sim-${Date.now()}`,
      title: `PILNE: Nowe zgłoszenie ${selectedFirm}`,
      message: `System zarejestrował nowe zgłoszenie z lokalizacji ${selectedCity}. Zweryfikuj dowody i dodaj swój głos potwierdzający lub podważający.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'NEW_ENTRY',
      linkToId: id
    };

    setNotifications(prev => [simNotify, ...prev]);
  };

  return (
    <div id="app-viewport" className="min-h-screen bg-[#0b0c0e] text-[#f3f4f6] pb-24 font-sans select-none antialiased flex flex-col">
      
      {/* 🇨🇴 Global Top Header styling */}
      <header id="app-header" className="sticky top-0 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#1f2127] z-40 transition-all">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 bg-amber-500/10 border border-amber-500/35 rounded-xl">
              <Scale className="w-5 h-5 text-[#f59e0b]" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#0b0c0e] rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight uppercase leading-none flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-1.5 py-0.5 rounded text-[10px] font-black font-sans tracking-widest">ROS</span>
                REJESTR OSTRZEŻEŃ
              </h1>
              <span className="text-[9px] text-[#9ca3af] font-mono tracking-widest uppercase block mt-1">
                SPOŁECZNY SYSTEM OSTRZEGANIA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="header-bell"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl bg-[#131518] hover:bg-[#1a1c22] border border-[#23262d] transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-400" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
            
            <button
              id="header-add-button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black text-xs font-bold py-1.5 px-3 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Zgłoś</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container frame configured with desktop maximum constraint to display beautifully as a high-fidelity mobile app */}
      <main id="app-main" className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        
        {/* QoL App Tips / Welcome Banner (can be closed by the user) */}
        {!appTipsDismissed && activeTab === 'entries' && !selectedEntryId && (
          <div id="welcome-tip-banner" className="relative overflow-hidden bg-gradient-to-r from-neutral-900 to-[#101115] border border-amber-500/20 rounded-2xl p-4 shadow-lg">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sprawdzona Baza Pracowników i Firm</h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Chroń owoce swojej pracy. Przeglądaj anonimowe dowody niewypłacalności pracodawców, twórz asymetrycznie szyfrowane pokoje rozmów z innymi poszkodowanymi i zgłaszaj dłużników z zabezpieczeniem prawnym.
                </p>
                <div className="flex gap-2.5 pt-1">
                  <button 
                    id="btn-tips-guide"
                    onClick={() => setActiveTab('legal-guide')}
                    className="text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    Poradnik prawny ROPO &rarr;
                  </button>
                  <button 
                    id="btn-tips-dismiss"
                    onClick={() => setAppTipsDismissed(true)}
                    className="text-[10px] text-gray-500 hover:text-white"
                  >
                    Rozumiem i ukryj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Content Loader */}
        {activeTab === 'entries' && (
          <div id="tab-entries-content" className="space-y-4">
            
            {/* If Single record view is active, render details screen */}
            {selectedEntryId && selectedEntry ? (
              <EntryDetails 
                entry={selectedEntry}
                onBack={() => setSelectedEntryId(null)}
                onVote={handleVoteEntry}
                onAddComment={handleAddCommentToEntry}
                onOpenDispute={handleOpenDispute}
                onJoinSecureChat={handleJoinSecureChat}
              />
            ) : (
              /* Otherwise, render main searchable list */
              <>
                {/* Visual Stats Widgets block */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-semibold text-gray-500 uppercase">Wiarygodność</span>
                      <span className="text-xs font-bold text-white">{totalVerifiedEmployers} zgłoszonych</span>
                    </div>
                  </div>
                  <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-semibold text-gray-500 uppercase">Suma długów</span>
                      <span className="text-xs font-bold text-red-400 font-mono">
                        {totalOutstandingDebts.toLocaleString()} zł
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interaktywna mapa incydentów */}
                <InteractiveIncidentMap 
                  entries={entries}
                  selectedLocation={selectedLocationFilter}
                  onSelectLocation={setSelectedLocationFilter}
                />

                {/* Trend zgłoszeń z ostatnich 30 dni */}
                <div className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                        Trend zgłoszeń (30 dni)
                      </h4>
                      <p className="text-[10px] text-gray-500">Nowe zgłoszenia ułożone chronologicznie</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/15 text-[10px] font-mono text-amber-400">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      AKTUALIZOWANE LIVE
                    </div>
                  </div>
                  
                  <div className="h-28 w-full select-none" style={{ minWidth: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={getWeeklyTrendData()} 
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          stroke="#4b5563" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          dy={5}
                        />
                        <YAxis 
                          stroke="#4b5563" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="raporty" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#trendGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* QoL & Zarządzanie Danymi ROS */}
                <div id="ros-backup-manager" className="bg-[#0f1013] border border-[#212329] p-4 rounded-2xl space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-amber-500" />
                        Trwałość danych i Kopia ROS
                      </h4>
                      <p className="text-[10px] text-gray-500">Twój prywatny sejf LocalStorage & Eksport-Import (QoL)</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/15 text-[10px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      AUTOZAPIS AKTYWNY
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="export-backup-btn"
                      onClick={handleExportBackup}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#131519]/80 border border-[#1f2127] text-[11px] text-gray-300 hover:text-white hover:border-[#373b47] transition-all cursor-pointer font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500" />
                      Pobierz plik JSON
                    </button>
                    
                    <button
                      id="copy-backup-btn"
                      onClick={handleCopyClipboardBackup}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#131519]/80 border border-[#1f2127] text-[11px] text-gray-300 hover:text-white hover:border-[#373b47] transition-all cursor-pointer font-medium"
                    >
                      {isCopyingFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Skopiowano!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-500" />
                          <span>Kopiuj do schowka</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="toggle-import-btn"
                      onClick={() => {
                        setIsImportOpen(!isImportOpen);
                        setImportErrorMsg(null);
                      }}
                      className="flex-1 p-2 rounded-xl bg-[#14161c] border border-amber-500/10 hover:border-amber-500/30 text-[10px] font-bold text-amber-500 transition-all cursor-pointer uppercase text-center"
                    >
                      {isImportOpen ? 'Ukryj pole importu' : 'Wczytaj kopię (Import/Restore)'}
                    </button>
                    <button
                      id="reset-db-btn"
                      onClick={handleResetToDefault}
                      className="px-2.5 py-2 rounded-xl bg-[#14161c] border border-red-500/15 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-[9px] font-mono transition-all cursor-pointer text-center"
                      title="Reset do fabrycznych danych demonstracyjnych"
                    >
                      Reset bazy
                    </button>
                  </div>

                  {isImportOpen && (
                    <div className="space-y-2.5 p-3 bg-[#08090b] border border-amber-500/15 rounded-xl animate-fade-in">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                        Wklej zawartość pliku kopii (kod JSON):
                      </span>
                      <textarea
                        id="import-backup-textarea"
                        value={importJsonContent}
                        onChange={(e) => setImportJsonContent(e.target.value)}
                        placeholder='[ { "id": "ent-...", "name": "...", "category": "EMPLOYER", "identifier": "NIP: ...", "location": "..." } ]'
                        className="w-full h-24 bg-[#0d0e11] border border-[#1f2127] rounded-lg p-2 font-mono text-[9px] text-gray-300 focus:outline-none focus:border-amber-500 transition-all select-text"
                      />
                      {importErrorMsg && (
                        <p className="text-[10px] text-red-400 font-mono">{importErrorMsg}</p>
                      )}
                      <button
                        id="confirm-import-btn"
                        onClick={handleImportBackup}
                        className="w-full p-2 rounded-lg bg-amber-500 text-black font-extrabold text-[10px] uppercase hover:bg-amber-400 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Zweryfikuj i nadpisz rejestr ROS
                      </button>
                    </div>
                  )}
                </div>

                {/* Filters and Inputs Header */}
                <div className="bg-[#0f1013] border border-[#212329] p-3 rounded-2xl space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      id="search-main"
                      type="text"
                      placeholder="Szukaj po nazwie firmy, NIP, lokacji..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#131518] border border-[#1f2127] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
                    />
                  </div>

                  {/* Active Location Filter Indicator */}
                  {selectedLocationFilter && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Filtrowanie lokalizacji: <strong>{selectedLocationFilter}</strong></span>
                      </div>
                      <button 
                        onClick={() => setSelectedLocationFilter(null)}
                        className="text-[10px] font-bold text-gray-400 hover:text-white bg-[#111317] p-0.5 px-1.5 border border-[#1f2127] rounded cursor-pointer"
                      >
                        usuń
                      </button>
                    </div>
                  )}

                  {/* Horizontal pill list filtering */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      <button
                        id="filter-cat-all"
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider shrink-0 transition-all ${
                          selectedCategory === 'ALL' 
                            ? 'bg-white text-black font-semibold' 
                            : 'bg-[#14151a] hover:bg-[#1a1c22] border border-[#1f2127] text-gray-400'
                        }`}
                      >
                        WSZYSTKIE WPISY ({entries.length})
                      </button>
                      <button
                        id="filter-cat-employer"
                        onClick={() => setSelectedCategory('EMPLOYER')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider shrink-0 transition-all ${
                          selectedCategory === 'EMPLOYER'
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'bg-[#14151a] hover:bg-amber-500/10 border border-amber-500/20 text-amber-500'
                        }`}
                      >
                        PRACODAWCY
                      </button>
                      <button
                        id="filter-cat-debtor"
                        onClick={() => setSelectedCategory('DEBTOR')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider shrink-0 transition-all ${
                          selectedCategory === 'DEBTOR'
                            ? 'bg-red-500 text-white font-semibold'
                            : 'bg-[#14151a] hover:bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}
                      >
                        NIEPŁACĄCY DŁUŻNICY
                      </button>
                      <button
                        id="filter-cat-individual"
                        onClick={() => setSelectedCategory('INDIVIDUAL')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider shrink-0 transition-all ${
                          selectedCategory === 'INDIVIDUAL'
                            ? 'bg-purple-500 text-white font-semibold'
                            : 'bg-[#14151a] hover:bg-purple-500/10 border border-purple-500/20 text-purple-500'
                        }`}
                      >
                        INNE / PODMIOTY
                      </button>
                      <button
                        id="filter-cat-watched"
                        onClick={() => setSelectedCategory('WATCHED')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider shrink-0 transition-all flex items-center gap-1 ${
                          selectedCategory === 'WATCHED'
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'bg-[#14151a] hover:bg-amber-500/10 border border-amber-500/20 text-amber-500'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${selectedCategory === 'WATCHED' ? 'fill-black' : 'fill-none'}`} />
                        OBSERWOWANE ({entries.filter(e => watchedEntryIds.includes(e.id)).length})
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] border-t border-[#1a1c22]">
                      <span className="text-gray-500 font-semibold uppercase">Weryfikacja:</span>
                      <div className="flex gap-2">
                        <button
                          id="status-filter-all"
                          onClick={() => setSelectedStatus('ALL')}
                          className={`hover:underline ${selectedStatus === 'ALL' ? 'text-amber-500 font-bold' : 'text-gray-400'}`}
                        >
                          Wszystkie (${entries.length})
                        </button>
                        <button
                          id="status-filter-verified"
                          onClick={() => setSelectedStatus(VerificationStatus.VERIFIED)}
                          className={`hover:underline ${selectedStatus === VerificationStatus.VERIFIED ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}
                        >
                          Tylko zweryfikowane
                        </button>
                        <button
                          id="status-filter-review"
                          onClick={() => setSelectedStatus(VerificationStatus.UNDER_REVIEW)}
                          className={`hover:underline ${selectedStatus === VerificationStatus.UNDER_REVIEW ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}
                        >
                          Zgłoszone spory
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Primary blacklist database records feed */}
                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 bg-[#0c0c0e]/40 rounded-2xl border border-dashed border-[#1f2127] p-4 text-gray-500 text-xs">
                      Brak wpisów spełniających wybrane kryteria wyszukiwania. Możesz zgłosić nowy incydent klikając przycisk na górze.
                    </div>
                  ) : (
                    filteredEntries.map((item) => (
                      <div
                        key={item.id}
                        id={`entry-card-${item.id}`}
                        onClick={() => setSelectedEntryId(item.id)}
                        className="bg-[#0f1013] border border-[#1f2127] hover:border-[#383d47] p-4 rounded-2xl shadow-sm transition-all hover:translate-y-[-2px] cursor-pointer relative overflow-hidden group"
                      >
                        {/* Status bar top */}
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            item.category === EntryCategory.EMPLOYER ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            item.category === EntryCategory.DEBTOR ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {item.category === EntryCategory.EMPLOYER ? 'PRACODAWCA' :
                             item.category === EntryCategory.DEBTOR ? 'DŁUŻNIK' : 'OSZUSTWO'}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              item.status === VerificationStatus.VERIFIED ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20' :
                              item.status === VerificationStatus.UNDER_REVIEW ? 'text-yellow-500 bg-yellow-500/5' :
                              'text-gray-400 bg-gray-500/5'
                            }`}>
                              {item.status === VerificationStatus.VERIFIED ? 'ZWERYFIKOWANY' :
                               item.status === VerificationStatus.UNDER_REVIEW ? 'SPÓR' : 'OCZEKUJE'}
                            </span>
                            <span className="text-gray-500 font-mono">
                              {new Date(item.reportedAt).toLocaleDateString()}
                            </span>

                            {/* Watch / Follow Star Button */}
                            <button
                              id={`watch-btn-${item.id}`}
                              onClick={(e) => handleToggleWatch(item.id, e)}
                              className="p-1 rounded-md bg-[#16171d]/80 hover:bg-[#1a1c22] border border-[#272a31]/60 text-gray-400 hover:text-amber-400 transition-all cursor-pointer"
                              title={watchedEntryIds.includes(item.id) ? "Przestań obserwować" : "Obserwuj ten wpis"}
                            >
                              <Star className={`w-3.5 h-3.5 ${watchedEntryIds.includes(item.id) ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-gray-500'}`} />
                            </button>

                            {/* Share / Udostępnij Button */}
                            <button
                              id={`share-btn-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingEntry(item);
                              }}
                              className="p-1 rounded-md bg-[#16171d]/80 hover:bg-[#1a1c22] border border-[#272a31]/60 text-gray-400 hover:text-amber-400 transition-all cursor-pointer"
                              title="Udostępnij wpis / wygeneruj kod QR (QoL)"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title and ID */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between gap-1.5">
                            <span className="truncate">{item.name}</span>
                            <ArrowUpRight className="w-4 h-4 text-gray-600 shrink-0 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </h4>
                          <span className="block text-[10px] text-gray-500 font-mono tracking-wide">
                            {item.identifier}
                          </span>
                        </div>

                        {/* Snippet or Expanded details inline block */}
                        {expandedEntryIds.includes(item.id) ? (
                          <div 
                            className="space-y-3.5 my-3.5 animate-fade-in text-xs text-gray-300 bg-[#090a0d] border border-[#1b1c22] rounded-xl p-3"
                            onClick={(e) => e.stopPropagation()} // Prevent card detail select
                          >
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase tracking-wider text-amber-500/80 font-semibold font-mono">Pełny opis zgłoszenia</span>
                              <p className="leading-relaxed whitespace-pre-line text-xs font-sans text-gray-300">{item.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#1b1c22]/60 text-[10px] text-gray-400 font-mono">
                              <div>
                                <span className="text-gray-500 block">Zgłaszający alias:</span>
                                <span className="text-[#f59e0b] font-semibold">{item.reporterAlias}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Suma długu / szkody:</span>
                                <span className="text-red-400 font-semibold">{item.totalDebtAmount ? `${item.totalDebtAmount.toLocaleString()} PLN` : 'Brak danych o roszczeniu'}</span>
                              </div>
                            </div>

                            {item.evidenceLinks && item.evidenceLinks.length > 0 && (
                              <div className="pt-2.5 border-t border-[#1b1c22]/60">
                                <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold font-mono mb-1">Dowody i załączniki ({item.evidenceLinks.length})</span>
                                <div className="space-y-1 font-mono text-[9px]">
                                  {item.evidenceLinks.map((link, idx) => (
                                    <a 
                                      key={idx}
                                      href={link} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="flex items-center gap-1.5 text-cyan-400 hover:underline hover:text-cyan-300 break-all"
                                    >
                                      <Link className="w-3 h-3 text-cyan-500 shrink-0" />
                                      Załącznik #{idx + 1} ({link.length > 40 ? `${link.substring(0, 40)}...` : link})
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.comments && item.comments.length > 0 && (
                              <div className="pt-2.5 border-t border-[#1b1c22]/60 space-y-2">
                                <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold font-mono">Ostatnie komentarze ({item.comments.length})</span>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                  {item.comments.slice(-2).map((comm) => (
                                    <div key={comm.id} className="bg-[#121318] p-2 rounded-lg border border-[#1d2026]">
                                      <div className="flex justify-between text-[8px] font-mono text-gray-500 mb-1">
                                        <span className="text-amber-500 font-semibold">{comm.authorAlias}</span>
                                        <span>{new Date(comm.timestamp).toLocaleString()}</span>
                                      </div>
                                      <p className="text-[10px] text-gray-300 leading-relaxed font-sans">{comm.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 line-clamp-2 my-2.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[#181a1f] text-[10px] text-gray-500 font-semibold gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-500" />
                              <span>{item.location}</span>
                            </div>

                            {/* Chevron inline expander button */}
                            <button
                              id={`expand-toggle-${item.id}`}
                              onClick={(e) => handleToggleExpand(item.id, e)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#131519]/90 text-gray-400 hover:text-white border border-[#272a31]/60 hover:border-gray-600 transition-all cursor-pointer text-[9px]"
                            >
                              {expandedEntryIds.includes(item.id) ? (
                                <>
                                  <ChevronUp className="w-3 h-3 text-amber-500" />
                                  <span>Zwiń opisy</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 text-amber-500 animate-pulse" />
                                  <span>Rozwiń podgląd</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {item.totalDebtAmount && (
                              <span className="text-red-400 font-bold font-mono">
                                Dług: {item.totalDebtAmount.toLocaleString()} PLN
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-gray-400">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {item.comments.length}
                            </span>
                            <span className="bg-[#15171d] px-1.5 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
                              +{item.upvotes}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          </div>
        )}

        {/* Tab Chat Section content */}
        {activeTab === 'chat' && (
          <div id="tab-chat-content" className="animate-fade-in">
            <SecureChat 
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              keyPair={cryptKeyPair}
              onGenerateKeys={handleGenerateKeyPair}
            />
          </div>
        )}

        {/* Tab Notifications content */}
        {activeTab === 'notifications' && (
          <div id="tab-notifications-content" className="animate-fade-in">
            <NotificationsPanel 
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onSimulateNewNotification={handleSimulateNewNotification}
            />
          </div>
        )}

        {/* QoL Tab Legal Guide content */}
        {activeTab === 'legal-guide' && (
          <div id="tab-legal-content" className="bg-[#0f1013] border border-[#272a30] rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
            
            {/* Header section with help title */}
            <div className="flex items-center gap-2 border-b border-[#212329] pb-3">
              <BookOpen className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Podręcznik & Narzędzia Prawne QoL</h3>
                <p className="text-[10px] text-gray-400">Jak pisać zgłoszenia bezpiecznie oraz jak odzyskać dług w Polsce.</p>
              </div>
            </div>

            {/* QoL Sub-Navigation Tab selector */}
            <div className="grid grid-cols-3 gap-1 bg-[#121319] p-1 rounded-xl border border-[#21232a]">
              <button
                id="btn-legal-subtab-handbook"
                onClick={() => setLegalSubTab('handbook')}
                className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  legalSubTab === 'handbook' 
                    ? 'bg-amber-500 text-black font-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Poradnik</span>
              </button>
              <button
                id="btn-legal-subtab-calculator"
                onClick={() => setLegalSubTab('calculator')}
                className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  legalSubTab === 'calculator' 
                    ? 'bg-amber-500 text-black font-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 shrink-0" />
                <span>Kalkulator</span>
              </button>
              <button
                id="btn-legal-subtab-demand"
                onClick={() => setLegalSubTab('demand-builder')}
                className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  legalSubTab === 'demand-builder' 
                    ? 'bg-amber-500 text-black font-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Kreator Pism</span>
              </button>
            </div>

            {/* 1. SUBTAB: HANDBOOK CONTRACT LAW DESCRIPTIONS */}
            {legalSubTab === 'handbook' && (
              <div id="subtab-handbook-panel" className="space-y-4 text-xs text-gray-300 leading-relaxed animate-fade-in">
                <div className="space-y-1.5 bg-[#14151a] p-3 rounded-xl border border-[#21232a]">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-500">1. Zniesławienie a Prawda (Art. 212 Kodeksu Karnego)</h4>
                  <p>
                    Polskie prawo (Art. 213 K.K.) jednoznacznie zdejmuje odpowiedzialność za zniesławienie, jeśli zarzuty dotyczą działalności instytucji publicznych, firm prowadzących usługi lub jeśli działanie miało na celu **obronę społecznie uzasadnionego interesu** (np. unikanie straty finansowej przez innych pracowników). Pamiętaj: podawaj wyłącznie fakty i rzetelne dowody.
                  </p>
                </div>

                <div className="space-y-1.5 bg-[#14151a] p-3 rounded-xl border border-[#21232a]">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#4299e1]">2. Bezpieczeństwo Danych Osobowych (RODO)</h4>
                  <p>
                    Pracodawca prowadzący działalność gospodarczą (w tym jednoosobową zarejestrowaną w CEIDG) nie podlega pełnej ochronie anonimowości danych firmy. NIP, REGON i nazwa handlowa są informacją jawną w Polsce. W przypadku osób fizycznych niezawodowych, administratorzy serwisu zawsze szyfrują identyfikatory (np. PESEL) w celu zapewnienia pełnej legalności bazy.
                  </p>
                </div>

                <div className="space-y-1.5 bg-[#14151a] p-3 rounded-xl border border-[#21232a]">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">3. Jak zebrać dowody do PIP i Sądu Pracy</h4>
                  <p>
                    - Skany umów o dzieło, zlecenie lub pracę<br />
                    - Zrzuty ekranów z komunikatorów dokumentujące stawki, zlecenia oraz brak reakcji na prośby o wypłatę<br />
                    - Pisemne wezwanie do zapłaty wysłane pocztą tradycyjną (ZPO) - kluczowy krok przed skierowaniem sprawy do sądu.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/15 p-3 rounded-xl flex items-start gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[10px]">
                    **UWAGA:** Serwis Transparency Tracker nie zastępuje porady prawnej ani oficjalnych zgłoszeń do PIP. Stanowi platformę wczesnego ostrzegania przed nieuczciwymi podmiotami rynkowymi.
                  </p>
                </div>
              </div>
            )}

            {/* 2. SUBTAB: STATUTORY DELAY INTEREST CALCULATOR */}
            {legalSubTab === 'calculator' && (
              <div id="subtab-calc-panel" className="space-y-4 animate-fade-in">
                {/* Math helper execution block */}
                {(() => {
                  const today = new Date();
                  const due = new Date(calcDueDate);
                  const diffTime = today.getTime() - due.getTime();
                  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                  const rate = calcIsCommercial ? 0.1125 : 0.0925;
                  const interest = (calcDebt * rate * diffDays) / 365;

                  let compensationFeeEur = 0;
                  let compensationFeePln = 0;
                  if (calcIsCommercial && diffDays > 0) {
                    if (calcDebt < 5000) {
                      compensationFeeEur = 40;
                      compensationFeePln = 175;
                    } else if (calcDebt <= 50000) {
                      compensationFeeEur = 70;
                      compensationFeePln = 300;
                    } else {
                      compensationFeeEur = 100;
                      compensationFeePln = 430;
                    }
                  }
                  
                  const totalClaimSum = calcDebt + interest + compensationFeePln;

                  return (
                    <>
                      <div className="bg-[#14151a] p-3 rounded-xl border border-[#21232a] space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-500">
                          Kalkulator Odsetek i Rekompensat
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                          Oblicz ustawowe odsetki za opóźnienie w Polsce (zgodnie z obwieszczeniami Ministerstwa Sprawiedliwości) oraz zryczałtowane unijne rekompensaty za koszty odzyskiwania należności (40, 70 lub 100 EUR dla transakcji B2B).
                        </p>

                        <div className="space-y-3 pt-1">
                          {/* Kwota długu */}
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Kwota zaległości (PLN)</label>
                            <input
                              id="calc-input-debt"
                              type="number"
                              value={calcDebt}
                              onChange={(e) => setCalcDebt(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-[#1b1d24] border border-[#2d313d] px-2.5 py-1.5 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Termin płatności */}
                            <div>
                              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Wymagalność (Termin)</label>
                              <input
                                id="calc-input-due"
                                type="date"
                                value={calcDueDate}
                                onChange={(e) => setCalcDueDate(e.target.value)}
                                className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            {/* Typ transakcji */}
                            <div>
                              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Typ odsetek</label>
                              <select
                                id="calc-input-type"
                                value={calcIsCommercial ? 'true' : 'false'}
                                onChange={(e) => setCalcIsCommercial(e.target.value === 'true')}
                                className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1.5 rounded-lg text-[10px] text-white focus:outline-none focus:border-amber-500 font-bold"
                              >
                                <option value="true">Zaległość B2B (11.25%)</option>
                                <option value="false">Cywilnoprawna (9.25%)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Obliczone wyniki widget */}
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-2.5">
                        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Szczegóły kalkulacji (Na dziś)</span>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#9ca3af] uppercase font-mono">Dni zwłoki:</span>
                            <span className="font-mono font-semibold text-white block">{diffDays} dni</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#9ca3af] uppercase font-mono">Stopa roczna:</span>
                            <span className="font-mono font-semibold text-white block">{(rate * 100).toFixed(2)}%</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#9ca3af] uppercase font-mono">Skumulowane Odsetki:</span>
                            <span className="font-mono font-bold text-amber-500 block">{interest.toFixed(2)} PLN</span>
                          </div>
                          {calcIsCommercial && (
                            <div className="space-y-0.5 col-span-1">
                              <span className="text-[9px] text-[#9ca3af] uppercase font-mono">Koszt odzyskiwania (Art. 10):</span>
                              <span className="font-mono font-bold text-red-400 block">
                                {compensationFeeEur} EUR (~{compensationFeePln} PLN)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#212328] flex justify-between items-center text-xs">
                          <span className="text-[10px] text-gray-400 uppercase font-bold font-sans">Razem do zwrotu:</span>
                          <span className="text-xs font-mono font-black text-white bg-[#101216] px-2 py-1 rounded border border-[#212329]">
                            {totalClaimSum.toFixed(2)} PLN
                          </span>
                        </div>
                        <p className="text-[8.5px] text-gray-500 italic font-sans leading-tight">
                          * Odsetki ustawowe obliczane według wzoru: (Zaległość * Stopa% * Dni zwłoki) / 365. Kwota zwrotu nie uwzględnia ewentualnych kosztów wezwań przedsądowych oraz kosztów komorniczych.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* 3. SUBTAB: PRE-TRIAL DEMAND FOR PAYMENT LETTER GENERATOR */}
            {legalSubTab === 'demand-builder' && (
              <div id="subtab-demand-panel" className="space-y-4 animate-fade-in">
                {/* Creator inputs panel */}
                <div className="bg-[#14151a] p-3 rounded-xl border border-[#21232a] space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-500">
                    Kreator Ostatecznego Wezwania do Zapłaty
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    Wygeneruj w pełni legalne, przedprocesowe wezwanie do zapłaty (PDF/Word Draft) w oparciu o kodeks cywilny i ustawę o terminach zapłaty w transakcjach handlowych.
                  </p>

                  <div className="space-y-2.5 font-sans">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8.5px] text-gray-500 uppercase font-black tracking-wider mb-1">Mój Alias / Nazwa wierzyciela</label>
                        <input
                          id="let-creditor"
                          type="text"
                          value={letterCreditor}
                          onChange={(e) => setLetterCreditor(e.target.value)}
                          className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] text-gray-500 uppercase font-black tracking-wider mb-1">Nazwa dłużnika</label>
                        <input
                          id="let-debtor"
                          type="text"
                          value={letterDebtor}
                          onChange={(e) => setLetterDebtor(e.target.value)}
                          className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-gray-500 uppercase font-black tracking-wider mb-1">Oficjalny adres dłużnika</label>
                      <input
                        id="let-address"
                        type="text"
                        value={letterDebtorAddress}
                        onChange={(e) => setLetterDebtorAddress(e.target.value)}
                        className="w-full bg-[#1b1d24] border border-[#2d313d] px-2.5 py-1 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[8.5px] text-gray-500 uppercase font-black tracking-wider mb-1">Tytuł długu (faktura lub umowa)</label>
                        <input
                          id="let-title"
                          type="text"
                          value={letterTitle}
                          onChange={(e) => setLetterTitle(e.target.value)}
                          className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] text-gray-500 uppercase font-black tracking-wider mb-1">Dni na zapłatę</label>
                        <input
                          id="let-days"
                          type="number"
                          value={letterDueDateDays}
                          onChange={(e) => setLetterDueDateDays(e.target.value)}
                          className="w-full bg-[#1b1d24] border border-[#2d313d] px-2 py-1 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precompiled string template result */}
                <div className="space-y-2 bg-[#0c0d10] p-3 rounded-xl border border-[#21232a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-amber-500 uppercase font-black tracking-widest">Podgląd tekstu wezwania (ZPO)</span>
                    <button
                      id="btn-copy-written-letter"
                      onClick={() => {
                        const todayStr = new Date().toLocaleDateString('pl-PL');
                        const overdueDays = Math.max(0, Math.ceil((new Date().getTime() - new Date(calcDueDate).getTime()) / (1000 * 60 * 60 * 24)));
                        const rate = calcIsCommercial ? 0.1125 : 0.0925;
                        const interest = (calcDebt * rate * overdueDays) / 365;
                        
                        let compensationFeeEur = 0;
                        let compensationFeePln = 0;
                        if (calcIsCommercial && overdueDays > 0) {
                          if (calcDebt < 5000) { compensationFeeEur = 40; compensationFeePln = 175; }
                          else if (calcDebt <= 50000) { compensationFeeEur = 70; compensationFeePln = 300; }
                          else { compensationFeeEur = 100; compensationFeePln = 430; }
                        }

                        const letterBodyContent = `Miejscowość: ......................., dnia ${todayStr} r.

WIERZYCIEL:
${letterCreditor}
Adres korespondencyjny: ....................................................

DŁUŻNIK:
${letterDebtor}
Adres siedziby: ${letterDebtorAddress}

PRZEDSĄDOWE OSTATECZNE WEZWANIE DO ZAPŁATY

Działając w imieniu własnym, na podstawie art. 476 oraz art. 481 ustawy z dnia 23 kwietnia 1964 r. – Kodeks cywilny (Dz. U. z 2020 r. poz. 1740 ze zm.), niniejszym wzywam do natychmiastowej zapłaty wymagalnego zadłużenia na moją rzecz w wysokości:

Kwota główna: ${Number(calcDebt).toLocaleString()} PLN (słownie: ........................................................................ PLN)

z tytułu: ${letterTitle}.

Wskazaną kwotę należy wpłacić w nieprzekraczalnym terminie ${letterDueDateDays} dni od dnia doręczenia niniejszego wezwania na podany poniżej numer rachunku bankowego:

Numer konta bankowego (IBAN): PL ........................................................................

Brak wpłaty w określonym terminie skutkować będzie niezwłocznym skierowaniem sprawy na drogę postępowania sądowego przed właściwy Sąd Rejonowy, co znacznie zwiększy Państwa koszty (wpis sądowy, koszty zastępstwa procesowego) oraz upoważni mnie do egzekucji sądowej i naliczenia należnych odsetek ustawowych (które na dzień dzisiejszy wynoszą szacunkowo ${interest.toFixed(2)} PLN) oraz ustawowej rekompensaty za koszty odzyskiwania należności (zgodnie z ustawą z dnia 8 marca 2013 r.) w wysokości ${compensationFeeEur} EUR (${compensationFeePln} PLN).

Z poważaniem,
....................................................
(podpis Wierzyciela)`;

                        navigator.clipboard.writeText(letterBodyContent).then(() => {
                          setCopyLetterFeedback(true);
                          setTimeout(() => setCopyLetterFeedback(false), 2000);

                          const copyNotify: AppNotification = {
                            id: `sys-copy-letter-${Date.now()}`,
                            title: 'Skopiowano wezwanie',
                            message: `Treść przedsądowego wezwania dla podmiotu "${letterDebtor}" została skopiowana pomyślnie.`,
                            timestamp: new Date().toISOString(),
                            isRead: false,
                            type: 'SYSTEM'
                          };
                          setNotifications(prev => [copyNotify, ...prev]);
                        });
                      }}
                      className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 hover:scale-[1.02]"
                    >
                      {copyLetterFeedback ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Skopiowano</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopiuj wezwanie</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="letter-preview-textarea"
                    readOnly
                    value={`WIERZYCIEL:
${letterCreditor}

DŁUŻNIK:
${letterDebtor}
Adres: ${letterDebtorAddress}

PRZEDSĄDOWE OSTATECZNE WEZWANIE DO ZAPŁATY

Działając w imieniu własnym, na podstawie art. 476 oraz art. 481 K.C., wzywam do zapłaty kwoty: ${Number(calcDebt).toLocaleString()} PLN z odsetkami z tytułu: ${letterTitle}.

Wskazaną kwotę należy wpłacić w nieprzekraczalnym terminie ${letterDueDateDays} dni od dnia otrzymania wezwania na konto bankowe. W przypadku braku zapłaty sprawa trafi na drogę sądową.`}
                    className="w-full h-32 bg-[#08090c] border border-[#1d1f26] p-2.5 rounded-lg text-[9px] text-gray-400 font-mono leading-relaxed select-all focus:outline-none"
                  />
                  <p className="text-[8.5px] text-gray-500 leading-normal italic">
                    * Skopiuj pełne wezwanie za pomocą przycisku powyżej. Zostaną w nim automatycznie uwzględnione stopy procentowe z zakładki Kalkulatora i sformułowanie przedprocesowe.
                  </p>
                </div>
              </div>
            )}

            {/* Back button row */}
            <button
              id="guide-back-to-list"
              onClick={() => setActiveTab('entries')}
              className="w-full bg-[#1a1c22] border border-[#272a30] hover:bg-[#20222a] py-2.5 rounded-xl text-xs font-semibold text-gray-300 cursor-pointer"
            >
              Powrót do rejestru wpisów
            </button>
          </div>
        )}

      </main>

      {/* 🔮 Bottom Navigation Menu Floating (UX Focus tailored for smooth mobile touch targets, with precise active state styling) */}
      <footer id="app-footer-nav" className="fixed bottom-0 inset-x-0 bg-[#0e0f12]/95 backdrop-blur-lg border-t border-[#1f2127] py-2 z-40 transition-all">
        <div id="footer-actions-container" className="max-w-md mx-auto px-4 flex justify-around items-center">
          
          {/* Tab Button Rejestr/Wpisy */}
          <button
            id="tab-btn-entries"
            onClick={() => {
              setActiveTab('entries');
              setSelectedEntryId(null);
            }}
            className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
              activeTab === 'entries' ? 'text-amber-500 scale-105' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold">Rejestr</span>
          </button>

          {/* Tab Button Czaty Szyfrowane */}
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer relative ${
              activeTab === 'chat' ? 'text-amber-500 scale-105' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold">Czat E2EE</span>
            {cryptKeyPair && (
              <span className="absolute top-1.5 right-4 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          {/* Tab Button Powiadomienia */}
          <button
            id="tab-btn-notifications"
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer relative ${
              activeTab === 'notifications' ? 'text-amber-500 scale-105' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-bold">Powiadomienia</span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-2.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {/* Tab Button Poradnik prawny ROPO */}
          <button
            id="tab-btn-guide"
            onClick={() => setActiveTab('legal-guide')}
            className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
              activeTab === 'legal-guide' ? 'text-amber-500 scale-105' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold">Poradnik</span>
          </button>

        </div>
      </footer>

      {/* Form Submission Add Modal panel */}
      <AddEntryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewEntry}
      />

      {/* Share / QR Code Modal (QoL) */}
      {sharingEntry && (
        <div 
          id="share-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSharingEntry(null)}
        >
          <div 
            id="share-modal-card"
            className="bg-[#0b0c0e] border border-[#21232a] w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl relative animate-scale-up border-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#21232a]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-xs font-black text-white tracking-widest uppercase font-mono">Udostępnij Wpis ROS</h3>
                  <p className="text-[9px] text-[#9ca3af] uppercase font-mono tracking-wider">SPOŁECZNY SYSTEM OSTRZEGANIA</p>
                </div>
              </div>
              <button 
                id="close-share-modal-btn"
                onClick={() => setSharingEntry(null)}
                className="p-1 rounded-lg bg-[#131519] border border-[#21232a] text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Entry Summary Spec */}
            <div className="bg-[#121319] border border-[#1d1f26] p-3 rounded-xl space-y-1.5">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                sharingEntry.category === EntryCategory.EMPLOYER ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                sharingEntry.category === EntryCategory.DEBTOR ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {sharingEntry.category === EntryCategory.EMPLOYER ? 'PRACODAWCA' :
                 sharingEntry.category === EntryCategory.DEBTOR ? 'DŁUŻNIK' : 'OSZUSTWO'}
              </span>
              <h4 className="text-xs font-bold text-white uppercase">{sharingEntry.name}</h4>
              <p className="text-[10px] text-gray-400 font-mono tracking-wide">{sharingEntry.identifier}</p>
            </div>

            {/* Link Copy Widget */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Bezpośredni odnośnik (QoL)</label>
              <div className="flex gap-2">
                <input 
                  id="share-link-input"
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}${window.location.pathname}?entry=${sharingEntry.id}`}
                  className="flex-1 bg-[#0d0e11] border border-[#21232a] px-2.5 py-2 rounded-lg font-mono text-[9px] text-gray-300 focus:outline-none select-all"
                />
                <button
                  id="share-copy-link-btn"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?entry=${sharingEntry.id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setCopyShareUrlFeedback(true);
                      setTimeout(() => setCopyShareUrlFeedback(false), 2000);

                      // Add system notification
                      const shareNotify: AppNotification = {
                        id: `sys-share-${Date.now()}`,
                        title: 'Skopiowano link wpisu',
                        message: `Bezpośredni odnośnik do wpisu "${sharingEntry.name}" został zapisany w schowku systemowym.`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        type: 'SYSTEM'
                      };
                      setNotifications(prev => [shareNotify, ...prev]);
                    });
                  }}
                  className="px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] uppercase font-extrabold transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  {copyShareUrlFeedback ? <Check className="w-3.5 h-3.5 font-bold" /> : 'Kopiuj'}
                </button>
              </div>
            </div>

            {/* QR Code generator */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#08090b] border border-[#1a1c22] rounded-xl space-y-3">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Dedykowany kod QR</span>
              <div className="p-3 bg-white rounded-xl shadow-md border border-[#1e2026]">
                <img 
                  id="share-qr-image"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?entry=${sharingEntry.id}`)}`}
                  alt="Zeskanuj kod QR wpisu ROS"
                  className="w-36 h-36"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[8px] text-gray-500 text-center font-sans max-w-[220px] leading-relaxed">
                Zeskanuj kod QR aparatem telefonu lub prześlij podgląd znajomemu, aby błyskawicznie sprawdzić to zgłoszenie na innym urządzeniu.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
