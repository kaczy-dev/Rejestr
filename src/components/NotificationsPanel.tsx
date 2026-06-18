/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppNotification } from '../types';
import { Bell, BellOff, Check, AlertTriangle, MessageSquare, ShieldAlert, Zap, Radio } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSimulateNewNotification: () => void;
}

export default function NotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSimulateNewNotification
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div id="notifications-panel" className="space-y-4">
      
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-[#0f1013] border border-[#272a30] p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Centrum Powiadomień</h3>
            <p className="text-xs text-gray-400">Aktualizacje w rejestrach sporu i zgłoszeń live.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-simulate-notif"
            onClick={onSimulateNewNotification}
            className="bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[#f59e0b] text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1"
          >
            <Radio className="w-3.5 h-3.5" />
            Symuluj nowy wpis
          </button>
          
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-read"
              onClick={onMarkAllRead}
              className="bg-[#1a1c22] border border-[#272a30] text-gray-300 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-colors hover:bg-[#22252c]"
            >
              Odczytaj wszystkie
            </button>
          )}
        </div>
      </div>

      {/* List items */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-[#0c0c0e]/30 p-6 rounded-2xl border border-dashed border-[#1f2127]">
            <BellOff className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Brak nowych wiadomości w panelu.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              id={`notif-${notif.id}`}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                notif.isRead 
                  ? 'bg-[#0f1013]/60 border-[#1c1d23] opacity-75' 
                  : 'bg-[#12141a] border-amber-500/25 shadow-mdShadow shadow-amber-500/5'
              }`}
            >
              {/* Icon selectors based on category */}
              <div className="mt-0.5 shrink-0">
                {notif.type === 'NEW_ENTRY' && (
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/25">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {notif.type === 'CHAT_MESSAGE' && (
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
                {notif.type === 'DISPUTE_UPDATE' || notif.type === 'SYSTEM' && (
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Msg Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold leading-none ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] font-mono text-gray-500">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-normal">
                  {notif.message}
                </p>
                
                {/* Actions row */}
                <div className="flex justify-between items-center pt-1.5 text-[10px]">
                  <span className="text-gray-500 font-mono">Kanał powiadomień</span>
                  {!notif.isRead && (
                    <button
                      id={`btn-read-single-${notif.id}`}
                      onClick={() => onMarkRead(notif.id)}
                      className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-0.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Oznacz jako przeczytane</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Advisory security box */}
      <div className="bg-[#101115] p-3.5 border border-[#1f2127] rounded-2xl flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-400 space-y-1">
          <span className="font-semibold text-white block">Real-time alerts via SSE & Service Worker</span>
          <p>
            Wszystkie powiadomienia są szyfrowane metodą "zero-knowledge". Nikt poza zalogowanymi i zweryfikowanymi stronami nie może podejrzeć celu powiadomień.
          </p>
        </div>
      </div>

    </div>
  );
}
