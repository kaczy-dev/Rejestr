/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlacklistEntry, EntryCategory, VerificationStatus, ChatRoom, AppNotification } from './types';

export const INITIAL_ENTRIES: BlacklistEntry[] = [
  {
    id: 'ent-1',
    category: EntryCategory.DEBTOR,
    name: 'Krzysztof Matan',
    identifier: 'NIP: 5210394857',
    location: 'Gdańsk, Pomorskie',
    totalDebtAmount: 4000,
    description: 'Niewywiązanie się z montażu instalacji klimatyzacyjnej po pobraniu zaliczki.',
    reportedAt: '2026-05-12T14:30:00Z',
    reporterAlias: 'OszukanyKlimatyzacja',
    status: VerificationStatus.VERIFIED,
    upvotes: 24,
    downvotes: 1,
    evidenceLinks: [
      'Pokwitowanie pobrania zaliczki 4000 zł',
      'Wezwanie przedsądowe do zapłaty'
    ],
    resolved: false,
    views: 450,
    comments: [
      {
        id: 'c-1',
        authorAlias: 'PoszkodowanyGda',
        text: 'Niestety u mnie to samo. Wziął zaliczkę i zniknął. Prace nie zostały rozpoczęte.',
        isEncrypted: false,
        timestamp: '2026-05-13T09:15:00Z'
      }
    ],
    disputes: []
  },
  {
    id: 'ent-2',
    category: EntryCategory.DEBTOR,
    name: 'Łukasz Rudzki',
    identifier: 'NIP: 9512839482',
    location: 'Warszawa, Mazowieckie',
    totalDebtAmount: 55555,
    description: 'Nieuregulowane faktury VAT za podwykonawstwo budowlane i prace elewacyjne.',
    reportedAt: '2026-06-01T10:15:00Z',
    reporterAlias: 'PodwykonawcaWawa',
    status: VerificationStatus.VERIFIED,
    upvotes: 42,
    downvotes: 2,
    evidenceLinks: [
      'Wyrok Sądu Okręgowego w Warszawie (Sygn. akt XX Gc 412/26)',
      'Faktura VAT nieopłacona na kwotę 55 555 zł'
    ],
    resolved: false,
    views: 890,
    comments: [
      {
        id: 'c-2',
        authorAlias: 'Tynkarz_Stolica',
        text: 'Uczciwie odradzam współpracę. Do dzisiaj nie rozliczył u nas etapów prac na Elewacji.',
        isEncrypted: false,
        timestamp: '2026-06-02T12:00:00Z'
      }
    ],
    disputes: []
  },
  {
    id: 'ent-3',
    category: EntryCategory.DEBTOR,
    name: 'Długi Krzysztof',
    identifier: 'NIP: 6271928472',
    location: 'Katowice, Śląskie',
    totalDebtAmount: 90000,
    description: 'Zaległości za wyłudzenie hurtowych ilości materiałów budowlanych oraz brak wypłat dla pracowników.',
    reportedAt: '2026-06-10T11:00:00Z',
    reporterAlias: 'HurtowniaKato',
    status: VerificationStatus.UNDER_REVIEW,
    upvotes: 56,
    downvotes: 3,
    evidenceLinks: [
      'Potwierdzenia odbioru towarów z hurtowni',
      'Zgłoszenia pracowników do PIP'
    ],
    resolved: false,
    views: 1250,
    comments: [
      {
        id: 'c-3',
        authorAlias: 'MajsterKato',
        text: 'Facet jest nieuchwytny. Brak wypłat dla pracowników fizycznych oraz wyłudzone materiały.',
        isEncrypted: false,
        timestamp: '2026-06-11T13:20:00Z'
      }
    ],
    disputes: []
  }
];

export const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: 'room-gen',
    title: 'Kanał Ogólny Bezpieczeństwa',
    description: 'Dyskusje o prawach pracownika, zapobieganiu oszustwom i procedurach windykacyjnych w Polsce.',
    type: 'GENERAL',
  },
  {
    id: 'room-matan',
    title: 'Sprawa: Krzysztof Matan',
    description: 'Szyfrowany pokój dla poszkodowanych w sprawach niezwróconych zaliczek przez Krzysztofa Matana.',
    type: 'CASE_DISPUTE',
    targetEntryId: 'ent-1'
  },
  {
    id: 'room-rudzki',
    title: 'Weryfikacja długu: Łukasz Rudzki',
    description: 'Wymiana dowodów, niezapłaconych faktur i postępowań komorniczych wobec Łukasza Rudzkiego.',
    type: 'CASE_DISPUTE',
    targetEntryId: 'ent-2'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'not-1',
    title: 'Nowy wpis zweryfikowany',
    message: 'Wpis „Łukasz Rudzki” otrzymał status ZWERYFIKOWANE.',
    timestamp: '2026-06-15T09:00:00Z',
    isRead: false,
    type: 'NEW_ENTRY',
    linkToId: 'ent-2'
  },
  {
    id: 'not-2',
    title: 'Uruchomiono szyfrowany kanał',
    message: 'Nowy bezpieczny pokój „Sprawa: Krzysztof Matan” został otwarty.',
    timestamp: '2026-06-16T14:45:00Z',
    isRead: false,
    type: 'SYSTEM',
    linkToId: 'room-matan'
  }
];
