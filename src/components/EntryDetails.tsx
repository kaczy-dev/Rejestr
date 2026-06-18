/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlacklistEntry, VerificationStatus, EntryCategory, Comment } from '../types';
import { obfuscateIdentifier } from '../cryptoUtils';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Eye, 
  MessageSquare, 
  ShieldAlert, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowLeft, 
  Lock, 
  FileText,
  User,
  Plus,
  Send
} from 'lucide-react';

interface EntryDetailsProps {
  entry: BlacklistEntry;
  onBack: () => void;
  onVote: (id: string, isUpvote: boolean) => void;
  onAddComment: (entryId: string, commentText: string, authorAlias: string) => void;
  onOpenDispute: (entryId: string, statement: string) => void;
  onJoinSecureChat: (entryId: string, roomTitle: string) => void;
}

export default function EntryDetails({ 
  entry, 
  onBack, 
  onVote, 
  onAddComment, 
  onOpenDispute,
  onJoinSecureChat
}: EntryDetailsProps) {
  const [newComment, setNewComment] = useState('');
  const [commentAlias, setCommentAlias] = useState('');
  const [disputeStatement, setDisputeStatement] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [voted, setVoted] = useState<'UP' | 'DOWN' | null>(null);

  const handleVoteClick = (isUpvote: boolean) => {
    if (voted) return; // Prevent double voting in session
    onVote(entry.id, isUpvote);
    setVoted(isUpvote ? 'UP' : 'DOWN');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(entry.id, newComment.trim(), commentAlias.trim() || 'Sygnalista_Lokalny');
    setNewComment('');
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeStatement.trim()) return;
    onOpenDispute(entry.id, disputeStatement.trim());
    setDisputeStatement('');
    setShowDisputeForm(false);
  };

  return (
    <div id="entry-details-panel" className="pb-16 animate-fade-in">
      {/* Back button */}
      <div className="flex justify-between items-center mb-4">
        <button
          id="btn-details-back"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#a0aec0] hover:text-white transition-colors bg-[#14151a] border border-[#272a30] py-1.5 px-3 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do listy</span>
        </button>
        <span className="text-[11px] font-mono text-gray-500 bg-[#0f1013] border border-[#212329] px-2 py-0.5 rounded-md">
          ID: {entry.id}
        </span>
      </div>

      {/* Main Card */}
      <div id="details-main-card" className="bg-[#0f1013] border border-[#272a30] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#212329] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                entry.category === EntryCategory.EMPLOYER ? 'bg-amber-500/15 text-amber-500 border border-amber-500/35' :
                entry.category === EntryCategory.DEBTOR ? 'bg-red-500/15 text-red-500 border border-red-500/35' :
                'bg-purple-500/15 text-purple-500 border border-purple-500/35'
              }`}>
                {entry.category === EntryCategory.EMPLOYER ? 'PRACODAWCA' :
                 entry.category === EntryCategory.DEBTOR ? 'DŁUŻNIK' : 'INNE OSZUSTWO'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                entry.status === VerificationStatus.VERIFIED ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/35' :
                entry.status === VerificationStatus.UNDER_REVIEW ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/35' :
                'bg-gray-500/15 text-gray-400 border border-gray-500/25'
              }`}>
                {entry.status === VerificationStatus.VERIFIED && <CheckCircle2 className="w-3 h-3" />}
                {entry.status === VerificationStatus.UNDER_REVIEW && <Clock className="w-3 h-3" />}
                {entry.status === VerificationStatus.VERIFIED ? 'ZWERYFIKOWANY' :
                 entry.status === VerificationStatus.UNDER_REVIEW ? 'SPÓR / ANALIZA' : 'NIEZWERYFIKOWANY'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {entry.name}
            </h2>
          </div>
          <div className="text-right">
            {entry.totalDebtAmount && (
              <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-right">
                <span className="block text-[10px] text-gray-400 font-semibold">KWOTA ROSZCZENIA</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  {entry.totalDebtAmount.toLocaleString()} PLN
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#14151a] p-3 rounded-xl border border-[#21232a]">
          <div className="flex items-center gap-2 text-gray-300">
            <Building2 className="w-4 h-4 text-[#8a98a8]" />
            <div>
              <span className="block text-[9px] text-gray-500 font-semibold uppercase">Identyfikator publiczny</span>
              <span className="font-mono">{obfuscateIdentifier(entry.identifier, false)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-[#8a98a8]" />
            <div>
              <span className="block text-[9px] text-gray-500 font-semibold uppercase">Miejsce działalności</span>
              <span>{entry.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <User className="w-4 h-4 text-[#8a98a8]" />
            <div>
              <span className="block text-[9px] text-gray-500 font-semibold uppercase">Zgłoszono przez</span>
              <span className="font-mono text-[#f59e0b]">{entry.reporterAlias}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Eye className="w-4 h-4 text-[#8a98a8]" />
            <div>
              <span className="block text-[9px] text-gray-500 font-semibold uppercase">Wyświetlenia karty</span>
              <span>{entry.views + 1} odsłon</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Szczegółowy opis incydentu</span>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-[#121318] p-3 rounded-xl border border-[#1e2025]">
            {entry.description}
          </p>
        </div>

        {/* Evidence list with Lock indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Dołączona dokumentacja i dowody ({entry.evidenceLinks.length})
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span>Szyfrowanie SHA-256</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {entry.evidenceLinks.map((evidence, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#121318] p-2 rounded-lg border border-[#21232a] text-xs">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-mono text-[10px] text-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-300 truncate font-mono">{evidence}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voting row */}
        <div className="flex gap-2 pt-3 border-t border-[#212329]">
          <button
            id="vote-thumbs-up"
            disabled={voted !== null}
            onClick={() => handleVoteClick(true)}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              voted === 'UP'
                ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 scale-[0.98]'
                : voted !== null
                ? 'bg-[#15171c] border-[#1e2025] text-gray-600 cursor-not-allowed'
                : 'bg-emerald-950/20 border-emerald-500/45 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Potwierdzam zarzuty ({entry.upvotes + (voted === 'UP' ? 1 : 0)})</span>
          </button>
          
          <button
            id="vote-thumbs-down"
            disabled={voted !== null}
            onClick={() => handleVoteClick(false)}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              voted === 'DOWN'
                ? 'bg-red-500/25 border-red-500 text-red-300 scale-[0.98]'
                : voted !== null
                ? 'bg-[#15171c] border-[#1e2025] text-gray-600 cursor-not-allowed'
                : 'bg-red-950/20 border-red-500/45 text-red-400 hover:bg-red-500/10'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Podważam ({entry.downvotes + (voted === 'DOWN' ? 1 : 0)})</span>
          </button>
        </div>

        {/* Dispute initiation */}
        <div className="bg-amber-950/20 border border-amber-900/50 p-3 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-white">Jesteś przedstawicielem tego podmiotu?</h4>
            <p className="text-[11px] text-gray-400 leading-snug">
              Jeśli oświadczenie zawiera nieprawdę, uważasz je za bezzasadne lub należność została uregulowana, możesz otworzyć oficjalną procedurę sporu.
            </p>
            {!showDisputeForm ? (
              <button
                id="btn-trigger-dispute"
                onClick={() => setShowDisputeForm(true)}
                className="text-[10px] font-bold text-amber-500 hover:underline pt-1 block"
              >
                Uruchom procedurę odwoławczą &rarr;
              </button>
            ) : (
              <form onSubmit={handleDisputeSubmit} className="space-y-2 mt-2 pt-2 border-t border-amber-950">
                <textarea
                  id="dispute-statement-box"
                  required
                  rows={2}
                  placeholder="Wvpisz oświadczenie obronne lub dowody spłaty..."
                  value={disputeStatement}
                  onChange={(e) => setDisputeStatement(e.target.value)}
                  className="w-full bg-[#121318] border border-amber-900/60 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    id="btn-close-dispute"
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="text-[10px] bg-[#1a1c22] border border-[#272a30] text-gray-300 py-1 px-2.5 rounded-lg"
                  >
                    Anuluj
                  </button>
                  <button
                    id="btn-send-dispute"
                    type="submit"
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-black font-semibold py-1 px-2.5 rounded-lg"
                  >
                    Zgłoś spór (Weryfikacja Mod)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* E2EE Join action chat */}
        <div id="join-secure-banner" className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              Szyfrowany Pokój Rozmów (E2EE)
            </div>
            <p className="text-[11px] text-gray-400">
              Dołącz do bezpiecznego i anonimowego kanału rozmów z innymi poszkodowanymi w sprawie {entry.name}.
            </p>
          </div>
          <button
            id="btn-join-secure-chat"
            onClick={() => onJoinSecureChat(entry.id, `Sprawa: ${entry.name.split(' ')[0]}`)}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold py-1.5 px-3 rounded-xl transition-all"
          >
            Wejdź do czatu &rarr;
          </button>
        </div>

      </div>

      {/* Disputes History */}
      {entry.disputes.length > 0 && (
        <div className="bg-[#0f1013] border border-amber-500/30 rounded-2xl p-4 mb-4 space-y-2.5">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Zarejestrowane spory / Odwołania ({entry.disputes.length})
          </h3>
          <div className="space-y-2">
            {entry.disputes.map((dispute) => (
              <div key={dispute.id} className="bg-[#15171c]/50 p-2.5 rounded-xl border border-[#21232a] text-xs">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Złożono: {new Date(dispute.submittedAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-amber-400">STATUS: {dispute.status}</span>
                </div>
                <p className="text-gray-200 text-xs italic">
                  &ldquo;{dispute.statement}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Discussion Group */}
      <div id="comments-section" className="bg-[#0f1013] border border-[#272a30] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#212329] pb-3">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          Komentarze społeczności ({entry.comments.length})
        </h3>

        {/* Comments stream */}
        {entry.comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            Brak komentarzy. Bądź pierwszą osobą, która doda konstruktywną opinię.
          </div>
        ) : (
          <div className="space-y-3">
            {entry.comments.map((comment) => (
              <div key={comment.id} id={`comment-node-${comment.id}`} className="bg-[#121318] p-3 rounded-xl border border-[#21232a] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    {comment.authorAlias}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-2.5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              id="comment-alias-input"
              type="text"
              placeholder="Twój pseudonim (np. KamieńSygnal)"
              value={commentAlias}
              onChange={(e) => setCommentAlias(e.target.value)}
              className="bg-[#15171c] border border-[#252831] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
            />
            <span className="text-[11px] text-gray-500 self-center hidden sm:inline">
              * Podany alias będzie widoczny obok Twojego komentarza.
            </span>
          </div>
          <div className="flex gap-2">
            <input
              id="comment-text-input"
              type="text"
              required
              placeholder="Dodaj komentarz dotyczący weryfikacji lub spłaty..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#15171c] border border-[#252831] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 transition-colors"
            />
            <button
              id="comment-submit-button"
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-black px-4 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dodaj</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
