/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EntryCategory {
  EMPLOYER = 'EMPLOYER',   // Pracodawca
  DEBTOR = 'DEBTOR',       // Dłużnik
  INDIVIDUAL = 'INDIVIDUAL' // Osoba prywatna / Inny podmiot
}

export enum VerificationStatus {
  VERIFIED = 'VERIFIED',       // Zweryfikowane
  PENDING = 'PENDING',         // Oczekujące na weryfikację
  UNDER_REVIEW = 'UNDER_REVIEW' // W trakcie analizy / Spór
}

export interface Comment {
  id: string;
  authorAlias: string;
  text: string;
  isEncrypted: boolean;
  timestamp: string;
}

export interface DisputeRequest {
  id: string;
  submittedAt: string;
  statement: string;
  evidenceLink?: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
}

export interface BlacklistEntry {
  id: string;
  category: EntryCategory;
  name: string;
  identifier: string; // NIP, REGON, PESEL, lub "Brak danych"
  location: string; // Miasto, Województwo
  description: string;
  totalDebtAmount?: number; // Jeśli dłużnik
  reportedAt: string;
  reporterAlias: string;
  status: VerificationStatus;
  upvotes: number; // Liczba głosów potwierdzających
  downvotes: number; // Liczba głosów negujących
  evidenceLinks: string[];
  resolved: boolean;
  comments: Comment[];
  disputes: DisputeRequest[];
  views: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderAlias: string;
  senderPublicKey: string;
  encryptedPayload: string; // Szyfrogram (Base64/Hex)
  plainText: string; // Zdeszyfrowana wiadomość (dostępna tylko lokalnie w przeglądarce odbiorcy)
  timestamp: string;
  isSystem: boolean;
}

export interface ChatRoom {
  id: string;
  title: string;
  description: string;
  type: 'GENERAL' | 'CASE_DISPUTE' | 'SECURE_CHANNEL';
  targetEntryId?: string; // Powiązany wpis (jeśli dotyczy sporu)
  unreadCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'NEW_ENTRY' | 'CHAT_MESSAGE' | 'DISPUTE_UPDATE' | 'SYSTEM';
  linkToId?: string; // ID wpisu lub czatu
}

export interface CryptoKeyPair {
  publicKey: string;
  privateKey: string;
  alias: string;
}
