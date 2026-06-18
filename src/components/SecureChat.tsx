/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatRoom, CryptoKeyPair } from '../types';
import { generateMockKeyPair, encryptMessage } from '../cryptoUtils';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  Layers, 
  Terminal, 
  Database,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecureChatProps {
  rooms: ChatRoom[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  keyPair: CryptoKeyPair | null;
  onGenerateKeys: (alias: string) => void;
}

export default function SecureChat({
  rooms,
  selectedRoomId,
  onSelectRoom,
  keyPair,
  onGenerateKeys
}: SecureChatProps) {
  const [aliasInput, setAliasInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize rooms with standard mock conversation streams
  useEffect(() => {
    // Generate some initial messages for context
    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg-sys-1',
        roomId: 'room-gen',
        senderAlias: 'System',
        senderPublicKey: '',
        encryptedPayload: 'N/A',
        plainText: '🔐 Pokój ogólny zabezpieczony kluczem asymetrycznym RSA-4096. Wszystkie wpisy są chronione kryptograficznie.',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        isSystem: true
      },
      {
        id: 'msg-gen-1',
        roomId: 'room-gen',
        senderAlias: 'Obywatel_PIP',
        senderPublicKey: '0x8FA...92',
        encryptedPayload: 'E2EE:0x514654394056...[AES-256-GCM]',
        plainText: 'Warto pamiętać, że zgodnie z prawem możemy zgłaszać pracodawców do Inspekcji Pracy bez podawania swoich danych osobowych pracodawcy. PIP ma obowiązek zachować naszą tożsamość w tajemnicy.',
        timestamp: new Date(Date.now() - 17200000).toISOString(),
        isSystem: false
      },
      {
        id: 'msg-bud-1',
        roomId: 'room-bud',
        senderAlias: 'System',
        senderPublicKey: '',
        encryptedPayload: 'N/A',
        plainText: '🔔 Rozpoczęto dedykowany bezpieczny kanał dla poszkodowanych w sprawie BudMax Sp. z o.o.',
        timestamp: new Date(Date.now() - 25000000).toISOString(),
        isSystem: true
      },
      {
        id: 'msg-bud-2',
        roomId: 'room-bud',
        senderAlias: 'Sygnalista_BudMax1',
        senderPublicKey: '0x3AC...81',
        encryptedPayload: 'E2EE:0x892DAF102B...[AES-256-GCM]',
        plainText: 'Cześć wszystkim poszkodowanym. Mam kopie wszystkich moich pism odwoławczych do PIP oraz skany niepodpisanych list obecności. Chętnie udostępnię prawnikowi.',
        timestamp: new Date(Date.now() - 12000000).toISOString(),
        isSystem: false
      },
      {
        id: 'msg-bud-3',
        roomId: 'room-bud',
        senderAlias: 'InnyZszargany',
        senderPublicKey: '0x99A...1B',
        encryptedPayload: 'E2EE:0xAA23DF8930...[AES-256-GCM]',
        plainText: 'Świetnie, ja też mam wezwanie przedsądowe gotowe. Może uda się zrobić pozew zbiorowy? Na czacie nikt nas nie namierzy.',
        timestamp: new Date(Date.now() - 8000000).toISOString(),
        isSystem: false
      }
    ];

    setMessages(initialMsgs);
  }, []);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRoomId]);

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasInput.trim()) return;
    onGenerateKeys(aliasInput.trim());
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !keyPair) return;

    const { ciphertext } = encryptMessage(msgInput.trim(), keyPair.publicKey);

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      roomId: selectedRoomId,
      senderAlias: keyPair.alias,
      senderPublicKey: keyPair.publicKey.substring(27, 43) + '...',
      encryptedPayload: ciphertext,
      plainText: msgInput.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false
    };

    setMessages([...messages, userMessage]);
    
    // Automatically decrypt user's own sent message
    setDecryptedMap(prev => ({ ...prev, [userMessage.id]: true }));
    setMsgInput('');

    // Simulate an auto-reply after 4 seconds (from verification bot)
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: `m-bot-${Date.now()}`,
        roomId: selectedRoomId,
        senderAlias: 'Weryfikator_Bot',
        senderPublicKey: '0xSYSTEM-BOT-KEY',
        encryptedPayload: 'E2EE:0x7E3AB91C...[AES-256-GCM]',
        plainText: 'Wiadomość została zapisana w lokalnej pamięci. Twoje połączenie jest w pełni anonimowe i chronione protokołem E2EE.',
        timestamp: new Date().toISOString(),
        isSystem: false
      };
      setMessages(prev => [...prev, botResponse]);
    }, 2500);
  };

  const toggleDecryption = (msgId: string) => {
    setDecryptedMap(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const filteredMessages = messages.filter(m => m.roomId === selectedRoomId);

  return (
    <div id="secure-chat-container" className="flex flex-col h-[calc(100vh-170px)] sm:h-[calc(100vh-190px)] max-h-[750px] bg-[#0c0c0e] rounded-2xl border border-[#272a30] overflow-hidden">
      
      {/* ⚠️ Step 1: Lockout if no E2EE Key is generated */}
      {!keyPair ? (
        <div id="no-keypair" className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Generuj Tożsamość Kryptograficzną</h3>
            <p className="text-xs text-gray-400">
              Przed wejściem na zabezpieczony czat wygeneruj lokalny asymetryczny klucz RSA-4096. Twoje rozmowy będą w pełni bezpieczne.
            </p>
          </div>

          <form onSubmit={handleGenerateClick} className="w-full max-w-xs space-y-3.5">
            <input
              id="chat-alias"
              type="text"
              required
              placeholder="Wpisz unikalny alias (np. SygnalistaX)"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              className="w-full text-center bg-[#14151a] border border-[#272a30] rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-all placeholder-gray-500"
            />
            <button
              id="btn-generate-keys"
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
            >
              <Key className="w-4 h-4" />
              Generuj klucze E2EE
            </button>
          </form>
          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Metoda: RSA-4096 + AES-GCM (W przeglądarce)
          </div>
        </div>
      ) : (
        /* ✅ Step 2: Full interactive UI */
        <div id="authenticated-chat-view" className="flex-1 flex flex-col sm:flex-row h-full">
          
          {/* Rooms List (Sidebar) */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-[#1f2127] bg-[#0c0c0e] flex flex-col">
            <div className="p-3 border-b border-[#1f2127] flex items-center justify-between bg-[#0f1013]/50">
              <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider uppercase">Kanały Szyfrowane</span>
              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono">LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 sm:max-h-none max-h-36 flex sm:flex-col gap-1.5 sm:gap-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  id={`room-selector-${room.id}`}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 shrink-0 sm:shrink-1 ${
                    selectedRoomId === room.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-[#121318]/50 border-[#1f2127] text-gray-400 hover:text-gray-300'
                  }`}
                  style={{ minWidth: '160px' }}
                >
                  <span className="text-xs font-bold truncate block">{room.title}</span>
                  <span className="text-[9px] text-gray-500 truncate block sm:inline hidden">{room.description}</span>
                </button>
              ))}
            </div>
            
            {/* Identity display */}
            <div className="p-3 bg-[#0e0f12] border-t border-[#1f2127] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Twój klucz tożsamości:</span>
                <button 
                  id="btn-toggle-key-details"
                  onClick={() => setShowKeyDetails(!showKeyDetails)}
                  className="text-amber-500 hover:underline"
                >
                  {showKeyDetails ? 'Ukryj' : 'Pokaż'}
                </button>
              </div>
              <div className="flex items-center gap-1.5 bg-[#14151a] p-1.5 rounded-lg border border-[#212329]">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate font-mono">{keyPair.alias}</span>
              </div>
              {showKeyDetails && (
                <div id="raw-key-box" className="bg-[#0a0a0d] p-1.5 rounded-md border border-gray-800 font-mono text-[8px] text-gray-500 break-all max-h-24 overflow-y-auto">
                  {keyPair.publicKey}
                </div>
              )}
            </div>
          </div>

          {/* Active Chat pane */}
          <div className="flex-1 flex flex-col bg-[#0e0f12] h-full overflow-hidden">
            {/* Chat header info */}
            <div className="p-3 bg-[#0f1013] border-b border-[#1f2127] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">{activeRoom.title}</h4>
                <p className="text-[10px] text-gray-400">{activeRoom.description}</p>
              </div>
              <div className="flex items-center gap-1 bg-[#15171d] border border-emerald-500/20 px-2 py-1 rounded-lg text-[10px] text-emerald-400">
                <Lock className="w-3 h-3" />
                <span>E2EE ON</span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredMessages.map((msg) => {
                const isMe = msg.senderAlias === keyPair.alias;
                const isDecrypted = decryptedMap[msg.id];
                
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center py-2">
                      <span className="inline-block bg-[#161a22] border border-[#222938] text-[9px] font-mono text-cyan-400 px-3 py-1 rounded-full">
                        {msg.plainText}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                      <span className="font-bold text-amber-500 font-mono">{msg.senderAlias}</span>
                      <span className="text-[8px] bg-[#1a1c22]/50 px-1 py-0.2 rounded text-gray-500 font-mono">
                        {msg.senderPublicKey}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isMe 
                        ? 'bg-[#1f232d] border-[#313747] text-gray-100 rounded-br-none' 
                        : 'bg-[#15161c] border-[#20222a] text-gray-100 rounded-bl-none'
                    }`}>
                      {/* Interactive plaintext vs E2E decrypted toggle */}
                      {isDecrypted ? (
                        <p className="text-xs leading-relaxed break-words">{msg.plainText}</p>
                      ) : (
                        <div className="space-y-1.5 font-mono">
                          <p className="text-[10px] text-[#ef4444] break-all leading-tight">
                            {msg.encryptedPayload}
                          </p>
                          <div className="text-[8px] text-gray-500 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-red-500 animate-pulse" />
                            <span>Payload zaszyfrowany AES</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decrypt trigger */}
                    <div className="flex gap-2 items-center mt-1">
                      <button
                        id={`btn-decrypt-${msg.id}`}
                        onClick={() => toggleDecryption(msg.id)}
                        className="text-[9px] hover:underline flex items-center gap-1 font-mono text-[#a0aec0] bg-[#14151a] hover:bg-[#1a1c24] py-0.5 px-2 rounded border border-[#272a31]"
                      >
                        {isDecrypted ? (
                          <>
                            <EyeOff className="w-3 h-3 text-emerald-400" />
                            <span>Zaszyfruj</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-red-400 hover:text-emerald-400" />
                            <span>Deszyfruj kluczem lokalnym</span>
                          </>
                        )}
                      </button>
                      <span className="text-[8px] text-gray-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Action Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#0d0e12] border-t border-[#1f2127] flex gap-2">
              <input
                id="chat-message-input"
                type="text"
                required
                placeholder="Wpisz bezpieczną wiadomość..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                className="flex-1 bg-[#14151a] border border-[#272a30] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
              />
              <button
                id="btn-send-message"
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black px-4.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wyślij</span>
              </button>
            </form>

            {/* Debug Console Display */}
            <div className="px-3 py-1.5 bg-[#0a0a0c] border-t border-gray-900 flex items-center justify-between text-[8px] font-mono text-gray-500">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-amber-500" />
                <span>P2P TUNNEL STABLE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                <span>LOCAL KEYRING SECURE</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
