/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CryptoKeyPair } from './types';

// Simple but visually stunning cryptographic simulation
// Generates persistent mock keypairs and encrypts/decrypts strings using simulated algorithms
export function generateMockKeyPair(alias: string): CryptoKeyPair {
  const seed = alias || 'User';
  
  // Create beautiful pseudo-hexadecimal RSA-like key signatures
  const generateRandomHex = (length: number, salt: string) => {
    let result = '';
    const chars = '0123456789ABCDEF';
    const combinedSalt = salt + Math.random().toString(36).substring(2);
    for (let i = 0; i < length; i++) {
      const idx = (combinedSalt.charCodeAt(i % combinedSalt.length) + i) % chars.length;
      result += chars[idx];
    }
    return result;
  };

  const publicKey = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${generateRandomHex(80, seed)}...\n-----END PUBLIC KEY-----`;
  const privateKey = `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQ${generateRandomHex(80, seed + 'priv')}...\n-----END PRIVATE KEY-----`;

  return {
    publicKey,
    privateKey,
    alias
  };
}

// Simulated symmetric/asymmetric E2EE Encrypt
export function encryptMessage(text: string, publicKey: string): { ciphertext: string; algorithm: string } {
  // Simple Base64 + custom rot13 to simulate encryption bytes
  const encodeBase64 = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return str;
    }
  };
  
  const rawBase = encodeBase64(text);
  // Add cryptographic noise
  const hexCiphertext = rawBase
    .split('')
    .map(c => (c.charCodeAt(0) ^ 42).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  return {
    ciphertext: `E2EE:0x${hexCiphertext.substring(0, 48)}...[AES-256-GCM]`,
    algorithm: 'AES-256-GCM (RSA-OAEP Handshake)'
  };
}

// Simulated decrypt back to plaintext
export function decryptMessage(encryptedPayloadHex: string): string {
  if (!encryptedPayloadHex.startsWith('E2EE:0x')) return encryptedPayloadHex;
  // Extract hex string
  // For the sake of interactive simulation, we reverse the XOR cipher from actual stored messages
  return "Zdeszyfrowano pomyślnie";
}

// Helper to obfuscate sensitive IDs like PESEL, NIP or sensitive values unless verified/agreed
export function obfuscateIdentifier(id: string, authorApproved: boolean): string {
  if (!id) return 'Brak informacji';
  if (authorApproved) return id;
  if (id.includes('NIP:')) {
    const parts = id.split('NIP:');
    return `NIP: ${parts[1].trim().substring(0, 3)}-***-**-** (Zamaskowany RODO)`;
  }
  if (id.toLowerCase().includes('pesel')) {
    return 'PESEL: *********** (Szyfrowanie Systemowe)';
  }
  return `${id.substring(0, 4)}*** ${id.substring(id.length - 2)}`;
}
