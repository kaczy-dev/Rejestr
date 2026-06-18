/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EntryCategory, VerificationStatus, BlacklistEntry } from '../types';
import { ShieldCheck, AlertTriangle, Scale, Plus, Trash2, X, PlusCircle, Sparkles, Search, RefreshCw, Building2 } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newEntry: BlacklistEntry) => void;
}

export default function AddEntryModal({ isOpen, onClose, onAdd }: AddEntryModalProps) {
  const [category, setCategory] = useState<EntryCategory>(EntryCategory.EMPLOYER);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [location, setLocation] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [description, setDescription] = useState('');
  const [reporterAlias, setReporterAlias] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [evidenceList, setEvidenceList] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  // Simulated GUS/REGON database lookup states (QoL)
  const [isSearchingGus, setIsSearchingGus] = useState(false);
  const [gusError, setGusError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGusLookup = () => {
    // Extract only digits from identifier
    const digits = identifier.replace(/\D/g, '');
    if (!digits || digits.length < 9) {
      setGusError('Wpisz poprawny NIP lub REGON (min. 9 cyfr)');
      return;
    }

    setIsSearchingGus(true);
    setGusError(null);

    // Simulate GUS API delay
    setTimeout(() => {
      const nip = digits.substring(0, 10);
      
      // Known Polish enterprise templates:
      const polishComps: Record<string, { name: string; location: string; identifier: string }> = {
        '5250007135': { name: 'Poczta Polska Spółka Akcyjna', location: 'Warszawa, Mazowieckie', identifier: 'NIP: 5250007135' },
        '5260251649': { name: 'KGHM Polska Miedź S.A. Centrala', location: 'Lubin, Dolnośląskie', identifier: 'NIP: 5260251649' },
        '7740001454': { name: 'Polski Koncern Naftowy ORLEN S.A.', location: 'Płock, Mazowieckie', identifier: 'NIP: 7740001454' },
        '5260001246': { name: 'Powszechny Zakład Ubezpieczeń S.A. (PZU)', location: 'Warszawa, Mazowieckie', identifier: 'NIP: 5260001246' },
        '5251621715': { name: 'Orange Polska Spółka Akcyjna', location: 'Warszawa, Mazowieckie', identifier: 'NIP: 5251621715' },
        '5260001090': { name: 'mBank S.A. Centrala krajowa', location: 'Warszawa, Mazowieckie', identifier: 'NIP: 5260001090' },
        '5218938192': { name: 'BudMax Sp. z o.o.', location: 'Warszawa, Mazowieckie', identifier: 'NIP: 5218938192' },
        '8942839481': { name: 'Mariusz Wiśniewski - Usługi Transportowe', location: 'Wrocław, Dolnośląskie', identifier: 'NIP: 8942839481' },
      };

      if (polishComps[nip]) {
        const found = polishComps[nip];
        setName(found.name);
        setLocation(found.location);
        setIdentifier(found.identifier);
        setIsSearchingGus(false);
        return;
      }

      // Procedurally generate realistic Polish business names as a high fidelity simulation!
      const prefixes = ['FHU Partner-Bud', 'ZUH Trans-Pol', 'Klinkier-Mar', 'Bud-Tech-Service', 'Kargo-Silesia Logistics', 'Inwest-Grup', 'Alfa-Logistik', 'Sigma Trade Sp. z o.o.', 'Eko-Energia', 'Gastronomia Starówka'];
      const middles = ['Sp. z o.o.', 'S.C.', 'Andrzej Nowak', 'Robert Kaczmarek', 'Spółka Cywilna', 'Group Sp. z o.o.'];
      const cities = [
        { city: 'Kraków, Małopolskie' },
        { city: 'Warszawa, Mazowieckie' },
        { city: 'Poznań, Wielkopolskie' },
        { city: 'Wrocław, Dolnośląskie' },
        { city: 'Gdańsk, Pomorskie' },
        { city: 'Katowice, Śląskie' },
        { city: 'Łódź, Łódzkie' },
        { city: 'Lublin, Lubelskie' }
      ];

      const dVal = parseInt(digits.substring(0, 5)) || Math.floor(Math.random() * 100);
      const index1 = dVal % prefixes.length;
      const index2 = (dVal + 3) % middles.length;
      const index3 = (dVal + 7) % cities.length;

      const generatedName = `${prefixes[index1]} ${middles[index2]}`;
      const selectedCity = cities[index3].city;

      setName(generatedName);
      setLocation(selectedCity);
      setIdentifier(`NIP: ${digits}`);
      setIsSearchingGus(false);
    }, 1200);
  };

  const handleAddEvidence = () => {
    if (evidenceInput.trim()) {
      setEvidenceList([...evidenceList, evidenceInput.trim()]);
      setEvidenceInput('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, i) => i !== index));
  };

  const handleQuickPrefill = () => {
    const templates = [
      {
        category: EntryCategory.EMPLOYER,
        name: 'Trans-Pol Logistyka Sp. z o.o.',
        identifier: 'NIP: 5258904322',
        location: 'Warszawa, Mazowieckie',
        debtAmount: '',
        description: 'Firma odmawia wypłaty wynagrodzeń za godziny nadliczbowe z umowy zlecenia za ostatnie 3 miesiące. Utrudniony kontakt z prezesem spółki, brak odpowiedzi na wezwania.',
        reporterAlias: 'Sygnalista_Kierowca',
        evidences: ['https://drive.google.com/file/d/umowa_zlecenie_ros', 'https://images.unsplash.com/photo-sc-unpaid']
      },
      {
        category: EntryCategory.DEBTOR,
        name: 'PPHU Stal-Bud Robert Nowicki',
        identifier: 'NIP: 7291804231',
        location: 'Kraków, Małopolskie',
        debtAmount: '38500',
        description: 'Dług z tytułu niezapłaconych faktur za dostawę profili stalowych z lutego br. Podmiot nie reaguje na monity, telefon wyłączony.',
        reporterAlias: 'HurtowniaMarek',
        evidences: ['https://rejestry.gov.pl/stalbud_monitoring', 'https://imgur.com/faktura_stal_rozliczenie']
      },
      {
        category: EntryCategory.INDIVIDUAL,
        name: 'Agencja Rekrutacyjna Work-Fast SC',
        identifier: 'NIP: 8992098471',
        location: 'Gdańsk, Pomorskie',
        debtAmount: '',
        description: 'Pobieranie kaucji 200 PLN za rzekome badania lekarskie przed rozpoczęciem pracy za granicą. Kontakt urywa się po wpłaceniu środków na podany numer konta.',
        reporterAlias: 'Poszkodowany_Zleceniobiorca',
        evidences: ['https://wykop.pl/znalezisko/workfast_uwaga', 'https://drive.google.com/potwierdzenie_przelewu']
      }
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setCategory(randomTemplate.category);
    setName(randomTemplate.name);
    setIdentifier(randomTemplate.identifier);
    setLocation(randomTemplate.location);
    setDebtAmount(randomTemplate.debtAmount);
    setDescription(randomTemplate.description);
    setReporterAlias(randomTemplate.reporterAlias);
    setEvidenceList(randomTemplate.evidences);
    setAgreedToTerms(true);
    setTermsError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setTermsError('Musisz potwierdzić odpowiedzialność prawną za składane oświadczenia.');
      return;
    }

    const cleanEntry: BlacklistEntry = {
      id: `ent-${Date.now()}`,
      category,
      name: name.trim() || 'Nieznany podmiot',
      identifier: identifier.trim() || 'Nie podano identyfikatora (NIP/PESEL)',
      location: location.trim() || 'Cała Polska',
      description: description.trim(),
      totalDebtAmount: category === EntryCategory.DEBTOR && debtAmount ? parseFloat(debtAmount) : undefined,
      reportedAt: new Date().toISOString(),
      reporterAlias: reporterAlias.trim() || 'AnonimowySygnalista',
      status: VerificationStatus.PENDING,
      upvotes: 1,
      downvotes: 0,
      evidenceLinks: evidenceList.length > 0 ? evidenceList : ['Oświadczenie zgłaszającego (Weryfikacja w toku)'],
      resolved: false,
      comments: [],
      disputes: [],
      views: 12
    };

    onAdd(cleanEntry);
    
    // Reset form state
    setName('');
    setIdentifier('');
    setLocation('');
    setDebtAmount('');
    setDescription('');
    setReporterAlias('');
    setEvidenceList([]);
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <div id="add-entry-backdrop" className="fixed inset-0 min-h-screen bg-black/85 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div id="add-entry-modal" className="relative w-full max-w-lg bg-[#0f1013] border border-[#272a30] rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#1f2127]">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#f59e0b]" />
              Zgłoś wpis do rejestru
            </h3>
            <p className="text-xs text-gray-400 mt-1">Zgłoś nieuczciwe praktyki, niepłacenie pensji lub długi.</p>
          </div>
          <button 
            id="close-add-modal"
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 bg-[#1a1c22] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          
          {/* Szybki Prefill helper */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <div className="text-[10px]">
                <span className="font-bold text-amber-500 block">Szybkie autouzupełnianie (QoL)</span>
                <span className="text-gray-400 block text-[9px] leading-tight">Automatycznie wygeneruj realistyczny, polski blankiet próbny</span>
              </div>
            </div>
            <button
              id="btn-quick-prefill"
              type="button"
              onClick={handleQuickPrefill}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              Wypełnij
            </button>
          </div>

          {/* Typ Zgłoszenia Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Typ Zgłoszenia</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="type-employer"
                type="button"
                onClick={() => setCategory(EntryCategory.EMPLOYER)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${
                  category === EntryCategory.EMPLOYER 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                    : 'bg-[#15171c] border-[#252831] text-gray-400 hover:text-gray-300'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Pracodawca</span>
              </button>
              <button
                id="type-debtor"
                type="button"
                onClick={() => setCategory(EntryCategory.DEBTOR)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${
                  category === EntryCategory.DEBTOR 
                    ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                    : 'bg-[#15171c] border-[#252831] text-gray-400 hover:text-gray-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Dłużnik</span>
              </button>
              <button
                id="type-individual"
                type="button"
                onClick={() => setCategory(EntryCategory.INDIVIDUAL)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-1 ${
                  category === EntryCategory.INDIVIDUAL 
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' 
                    : 'bg-[#15171c] border-[#252831] text-gray-400 hover:text-gray-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Inne oszustwo</span>
              </button>
            </div>
          </div>

          {/* Nazwa Podmiotu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Nazwa firmy / Imię i Nazwisko
            </label>
            <input
              id="input-name"
              type="text"
              required
              placeholder="np. BudMax Sp. z o.o. lub Jan Kowalski (Remonty)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Identyfikator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Identyfikator (NIP / REGON)</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  id="input-identifier"
                  type="text"
                  placeholder="np. NIP: 5218938192"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="flex-1 min-w-0 bg-[#15171c] border border-[#252831] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors font-mono"
                />
                <button
                  id="btn-gus-lookup"
                  type="button"
                  onClick={handleGusLookup}
                  disabled={isSearchingGus}
                  className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900/50 disabled:text-amber-700 text-black text-[10px] uppercase font-black transition-all flex items-center justify-center shrink-0 cursor-pointer hover:scale-[1.02]"
                  title="Pobierz dane rejestrowe z GUS / CEIDG"
                >
                  {isSearchingGus ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-0.5"><Search className="w-2.5 h-2.5" />GUS</span>
                  )}
                </button>
              </div>
              {gusError && (
                <span className="block text-[8px] text-red-500 mt-1 font-mono leading-tight bg-red-500/5 border border-red-500/10 px-1.5 py-0.5 rounded">
                  {gusError}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Lokalizacja (Miasto)
              </label>
              <input
                id="input-location"
                type="text"
                required
                placeholder="np. Poznań, Wielkopolskie"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Kwota Zadłużenia - tylko dla Dłużników */}
          {category === EntryCategory.DEBTOR && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Kwota zadłużenia (PLN)
              </label>
              <input
                id="input-debt"
                type="number"
                placeholder="np. 15000"
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                className="w-full bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500 transition-colors"
              />
            </div>
          )}

          {/* Opis Procederu */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Opis zdarzenia / Uzasadnienie wpisu
            </label>
            <textarea
              id="input-description"
              required
              rows={4}
              placeholder="Opisz dokładnie sytuację: brak płatności, nieotrzymanie umów, brak kontaktu. Im dokładniejszy opis, tym szybsza weryfikacja."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors resize-none"
            />
          </div>

          {/* Twój Alias */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Twój pseudonim (Zostanie zaszyfrowany/ukryty)
            </label>
            <input
              id="input-alias"
              type="text"
              placeholder="np. PoszkodowanyKierowca (Anonimowy w widoku publicznym)"
              value={reporterAlias}
              onChange={(e) => setReporterAlias(e.target.value)}
              className="w-full bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Dodaj linki / dowody */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Linki do dowodów / Sygnatury spraw (Opcjonalnie)
            </label>
            <p className="text-[11px] text-gray-400 mb-2">Zrzuty ekranu, protokoły PIP, wezwania przedsądowe, wyroki sądu itp.</p>
            <div className="flex gap-2">
              <input
                id="input-evidence"
                type="text"
                placeholder="np. Sygnatura sprawy WA-392/26 lu dysk google"
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                className="flex-1 bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
              />
              <button
                id="btn-add-evidence"
                type="button"
                onClick={handleAddEvidence}
                className="bg-[#272a30] text-white hover:bg-[#343841] px-3 rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj</span>
              </button>
            </div>

            {evidenceList.length > 0 && (
              <div className="mt-2 space-y-1.5 bg-[#14151a] p-2 rounded-xl border border-[#21232a]">
                {evidenceList.map((item, index) => (
                  <div key={index} id={`evidence-item-${index}`} className="flex justify-between items-center text-xs text-gray-300 py-1 px-2 bg-[#1b1c22] rounded-lg">
                    <span className="truncate max-w-[80vw] font-mono">{item}</span>
                    <button
                      id={`remove-evidence-${index}`}
                      type="button"
                      onClick={() => handleRemoveEvidence(index)}
                      className="text-red-400 hover:text-red-300 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zabezpieczenie Prawne RODO */}
          <div className="bg-[#101014] border border-amber-500/20 p-3 rounded-xl">
            <div className="flex items-start gap-2.5">
              <input
                id="checkbox-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setTermsError('');
                }}
                className="mt-0.5 rounded cursor-pointer accent-amber-500"
              />
              <div className="text-xs text-gray-300">
                Poświadczam pod odpowiedzialnością karną (Art. 212 K.K.), że podane informacje oraz zarzuty są prawdziwe i poparte dowodami. Rozumiem, że administrator chroni dane osobowe zgodnie z RODO i ujawnia je tylko na wniosek uprawnionych organów.
              </div>
            </div>
            {termsError && (
              <p className="text-[11px] text-red-400 mt-2 font-semibold">{termsError}</p>
            )}
          </div>

        </form>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[#1f2127] flex gap-2">
          <button
            id="btn-cancel-modal"
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#1a1c22] border border-[#272a30] hover:bg-[#20222a] py-2.5 rounded-xl text-xs font-semibold text-gray-300"
          >
            Anuluj
          </button>
          <button
            id="btn-submit-modal"
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            Zgłoś wpis
          </button>
        </div>

      </div>
    </div>
  );
}
