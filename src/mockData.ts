/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlacklistEntry, EntryCategory, VerificationStatus, ChatRoom, AppNotification } from './types';

export const INITIAL_ENTRIES: BlacklistEntry[] = [
  {
    id: 'ent-1',
    category: EntryCategory.EMPLOYER,
    name: 'BudMax Sp. z o.o. (Janusz Kowalski)',
    identifier: 'NIP: 5218938192',
    location: 'Warszawa, Mazowieckie',
    description: 'Niewypłacanie wynagrodzeń od 3 miesięcy dla ponad 8 pracowników budowlanych. Blokowanie kontaktów, ignorowanie pism od Państwowej Inspekcji Pracy (PIP). Pracodawca obiecuje przelewy "jutro" i unika spotkań.',
    reportedAt: '2026-05-12T14:30:00Z',
    reporterAlias: 'AnonimowyMurarz',
    status: VerificationStatus.VERIFIED,
    upvotes: 48,
    downvotes: 2,
    evidenceLinks: [
      'Protokół z kontroli PIP nr WA-392/26',
      'Wezwanie przedsądowe do zapłaty'
    ],
    resolved: false,
    views: 1250,
    comments: [
      {
        id: 'c-1',
        authorAlias: 'ZszarganeNerwy',
        text: 'Potwierdzam, pracowałem tam na przełomie marca i kwietnia. Do dziś nie dostałem ani grosza za nadgodziny. Sprawa jest w sądzie pracy.',
        isEncrypted: false,
        timestamp: '2026-05-13T09:15:00Z'
      },
      {
        id: 'c-2',
        authorAlias: 'InwestorZaniepokojony',
        text: 'Dzięki za ostrzeżenie. Planowaliśmy zlecić im wykończenie pawilonu, ale po tym wpisie rezygnujemy.',
        isEncrypted: false,
        timestamp: '2026-05-15T18:40:00Z'
      }
    ],
    disputes: [
      {
        id: 'disp-1',
        submittedAt: '2026-05-14T10:00:00Z',
        statement: 'Złożono odwołanie. BudMax twierdzi, że opóźnienie wynika ze zatoru płatniczego od generalnego wykonawcy i wszystkie należności zostaną uregulowane do końca przyszłego miesiąca.',
        evidenceLink: 'Oświadczenie_Zarządu_BudMax_Sygnowane.pdf',
        status: 'OPEN'
      }
    ]
  },
  {
    id: 'ent-2',
    category: EntryCategory.DEBTOR,
    name: 'Mariusz Wiśniewski - Usługi Transportowe',
    identifier: 'NIP: 8942839481',
    location: 'Wrocław, Dolnośląskie',
    totalDebtAmount: 34500,
    description: 'Nieuregulowane faktury za paliwo i serwis opon od października zeszłego roku. Komornik umorzył postępowanie ze względu na rzekomy brak majątku, podczas gdy dłużnik nadal operuje pojazdami zarejestrowanymi na członków rodziny.',
    reportedAt: '2026-06-01T10:15:00Z',
    reporterAlias: 'PaliwaSilesia_PL',
    status: VerificationStatus.UNDER_REVIEW,
    upvotes: 22,
    downvotes: 1,
    evidenceLinks: [
      'Wyrok Sądu Rejonowego we Wrocławiu (Sygn. akt VIII Gc 129/25)',
      'Postanowienie komornicze o bezskuteczności egzekucji'
    ],
    resolved: false,
    views: 840,
    comments: [
      {
        id: 'c-3',
        authorAlias: 'WulkanizatorŚląsk',
        text: 'U mnie też wisi 4000 zł za wymianę opon w naczepie. Typowy wyłudzacz, jeździ nowym Mercedesem, ale oficjalnie nie ma nic.',
        isEncrypted: false,
        timestamp: '2026-06-02T12:00:00Z'
      }
    ],
    disputes: []
  },
  {
    id: 'ent-3',
    category: EntryCategory.EMPLOYER,
    name: 'Agencja Marketingowa PinkPixel Studio',
    identifier: 'REGON: 382910394',
    location: 'Kraków, Małopolskie',
    description: 'Zatrudnianie studentów na darmowe, wielomiesięczne staże pod przykrywką "edukacji", a następnie zwalnianie ich tuż przed obiecanym podpisaniem umowy o pracę i zastępowanie kolejną falą stażystów. Wykorzystywanie autorskich projektów bez zapłaty.',
    reportedAt: '2026-06-10T11:00:00Z',
    reporterAlias: 'GrafikZPowolania',
    status: VerificationStatus.VERIFIED,
    upvotes: 56,
    downvotes: 4,
    evidenceLinks: [
      'Zrzuty ekranu rozmów na Slacku z poleceniami usunięcia logotypów stażystów',
      'Umowy stażowe o zerowej stawce'
    ],
    resolved: false,
    views: 1980,
    comments: [
      {
        id: 'c-4',
        authorAlias: 'KreatywnaOla',
        text: 'Niestety to prawda, tworzyłam dla nich identyfikację wizualną dla klienta z branży medycznej. Mój projekt poszedł na produkcję, a ja dostałam maila, że "nie spełniłam oczekiwań zespołu" i staż kończy się bez rekomendacji.',
        isEncrypted: false,
        timestamp: '2026-06-11T13:20:00Z'
      }
    ],
    disputes: []
  },
  {
    id: 'ent-4',
    category: EntryCategory.INDIVIDUAL,
    name: 'Krystian Kaczmarek',
    identifier: 'PESEL: Szyfrowany / Zgłoszony do KRD',
    location: 'Poznań, Wielkopolskie',
    totalDebtAmount: 8200,
    description: 'Wielokrotne wyłudzanie zaliczek na poczet prac remontowo-wykończeniowych (kładzenie płytek, gładzie). Pobiera gotówkę na "zakup materiałów", po czym znika z kluczami do mieszkania, nie odbiera telefonów i blokuje numery pokrzywdzonych.',
    reportedAt: '2026-06-14T16:45:00Z',
    reporterAlias: 'OszukanyInwestorPoznan',
    status: VerificationStatus.PENDING,
    upvotes: 14,
    downvotes: 0,
    evidenceLinks: [
      'Zgłoszenie na Komisariat Policji Poznań-Stare Miasto',
      'Pokwitowanie odbioru zaliczki na kwotę 5000 zł'
    ],
    resolved: false,
    views: 310,
    comments: [],
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
    id: 'room-bud',
    title: 'Sprawa: BudMax Sp. z o.o.',
    description: 'Bezpieczny, szyfrowany pokój dla poszkodowanych oraz świadków w sprawie BudMax. Konsultowanie wspólnego pozwu.',
    type: 'CASE_DISPUTE',
    targetEntryId: 'ent-1'
  },
  {
    id: 'room-pink',
    title: 'Weryfikacja: PinkPixel Studio',
    description: 'Wymiana dowodów, umów stażowych oraz korespondencji mailowej z PinkPixel w celu weryfikacji zgłoszenia.',
    type: 'CASE_DISPUTE',
    targetEntryId: 'ent-3'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'not-1',
    title: 'Nowy wpis zweryfikowany',
    message: 'Zgłoszenie „Agencja Marketingowa PinkPixel Studio” otrzymało status ZWERYFIKOWANE po dostarczeniu umów stażowych.',
    timestamp: '2026-06-15T09:00:00Z',
    isRead: false,
    type: 'NEW_ENTRY',
    linkToId: 'ent-3'
  },
  {
    id: 'not-2',
    title: 'Uruchomiono szyfrowany kanał',
    message: 'Nowy bezpieczny pokój „Sprawa: BudMax Sp. z o.o.” dedykowany dla wierzycieli i poszkodowanych pracowników został otwarty.',
    timestamp: '2026-06-16T14:45:00Z',
    isRead: false,
    type: 'SYSTEM',
    linkToId: 'room-bud'
  },
  {
    id: 'not-3',
    title: 'Odpowiedź na komentarz',
    message: 'Użytkownik GrafikZPowolania oznaczył Cię w bezpiecznym wątku pod wpisem PinkPixel Studio.',
    timestamp: '2026-06-17T18:20:00Z',
    isRead: true,
    type: 'CHAT_MESSAGE',
    linkToId: 'ent-3'
  }
];
