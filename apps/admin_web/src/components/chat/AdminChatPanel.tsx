/**
 * AdminChatPanel - Panel chat nổi dành cho admin
 * Hiển thị danh sách conversations và khung chat realtime
 * Có âm thanh & browser notification khi tin nhắn mới đến
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribeToActiveSessions,
  subscribeToClosedSessions,
  subscribeToMessages,
  sendAdminMessage,
  markSessionReadByAdmin,
  assignAdminToSession,
  closeSession,
  ChatSession,
  ChatMessage,
} from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';

interface AdminChatPanelProps {
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

type TabType = 'waiting' | 'active' | 'closed';

const STATUS_LABEL: Record<string, string> = {
  bot: '🤖 Bot',
  waiting: '⏳ Chờ',
  active: '🟢 Đang chat',
  closed: '✅ Đã đóng',
};

// ─── Web Audio API: tạo âm thanh notification ──────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      osc.type = 'sine';
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(880, 0, 0.12);
    playTone(1100, 0.15, 0.12);
    playTone(1320, 0.3, 0.18);

    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    // Bỏ qua nếu trình duyệt không hỗ trợ
  }
}

// ─── Browser Notification ───────────────────────────────────────────────────
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const opts: NotificationOptions = {
      body,
      icon: '/favicon.ico',
      tag: 'admin-chat',
    };
    new Notification(title, opts);
  }
}

// ────────────────────────────────────────────────────────────────────────────

const AdminChatPanel: React.FC<AdminChatPanelProps> = ({ onClose, onUnreadChange }) => {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [closedSessions, setClosedSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [tab, setTab] = useState<TabType>('waiting');
  const [isSending, setIsSending] = useState(false);
  const [newMessageFlash, setNewMessageFlash] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lưu previous unread để phát hiện tin mới
  const prevTotalUnreadRef = useRef(0);
  const prevWaitingCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // Xin permission notification khi mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Subscribe tới sessions đang active/waiting/bot
  useEffect(() => {
    const unsub = subscribeToActiveSessions((sessions) => {
      setActiveSessions(sessions);
      const totalUnread = sessions.reduce((sum, s) => sum + (s.unreadByAdmin || 0), 0);
      onUnreadChange(totalUnread);

      const waitingCount = sessions.filter(s => s.status === 'waiting').length;

      // Phát hiện tin mới (bỏ qua lần load đầu)
      if (!isFirstLoadRef.current) {
        if (totalUnread > prevTotalUnreadRef.current) {
          playNotificationSound();
          setNewMessageFlash(true);
          setTimeout(() => setNewMessageFlash(false), 1500);

          // Browser notification
          const newSession = sessions.find(s => (s.unreadByAdmin || 0) > 0);
          if (newSession) {
            showBrowserNotification(
              `💬 Tin nhắn mới từ ${newSession.customerName || 'Khách hàng'}`,
              newSession.lastMessage || 'Có tin nhắn mới'
            );
          }
        }
        // Phát hiện session waiting mới
        if (waitingCount > prevWaitingCountRef.current) {
          playNotificationSound();
          showBrowserNotification(
            '🔔 Khách hàng mới đang chờ hỗ trợ',
            `${waitingCount} khách hàng đang chờ được kết nối`
          );
          // Auto-switch sang tab waiting
          setTab('waiting');
        }
      } else {
        isFirstLoadRef.current = false;
      }

      prevTotalUnreadRef.current = totalUnread;
      prevWaitingCountRef.current = waitingCount;
    });
    return () => unsub();
  }, [onUnreadChange]);

  // Subscribe tới sessions đã đóng
  useEffect(() => {
    const unsub = subscribeToClosedSessions((sessions) => {
      setClosedSessions(sessions);
    });
    return () => unsub();
  }, []);

  // Subscribe tin nhắn của session đang chọn
  useEffect(() => {
    if (!selectedSession) { setMessages([]); return; }
    const unsub = subscribeToMessages(selectedSession.id, setMessages);
    markSessionReadByAdmin(selectedSession.id).catch(console.error);
    return () => unsub();
  }, [selectedSession?.id]);

  // Tự cuộn xuống cuối khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input khi chọn session
  useEffect(() => {
    if (selectedSession && selectedSession.status !== 'closed') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedSession?.id]);

  const handleSelectSession = useCallback((session: ChatSession) => {
    setSelectedSession(session);
    markSessionReadByAdmin(session.id).catch(console.error);
    // Nếu session đang waiting, admin nhận chat
    if (session.status === 'waiting' && user) {
      assignAdminToSession(session.id, user.uid, user.displayName || 'Admin').catch(console.error);
    }
  }, [user]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedSession || !user) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await sendAdminMessage(
        selectedSession.id,
        text,
        user.uid,
        user.displayName || 'Admin'
      );
    } catch (err) {
      console.error('Send error:', err);
      setInputText(text); // khôi phục nếu lỗi
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleClose = async (sessionId: string) => {
    if (!window.confirm('Đóng cuộc trò chuyện này?')) return;
    await closeSession(sessionId);
    if (selectedSession?.id === sessionId) setSelectedSession(null);
  };

  const displayedSessions = tab === 'closed'
    ? closedSessions
    : activeSessions.filter(s => tab === 'waiting'
        ? s.status === 'waiting' || s.status === 'bot'
        : s.status === 'active');

  const waitingCount = activeSessions.filter(s => s.status === 'waiting').length;
  const activeCount = activeSessions.filter(s => s.status === 'active').length;

  return (
    <div className={`flex h-full transition-all duration-300 ${newMessageFlash ? 'ring-2 ring-blue-400' : ''}`}>
      {/* LEFT: Session list */}
      <div className="w-72 flex flex-col border-r border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00459a] to-[#0061d5]">
          <div>
            <h2 className="text-white font-black text-sm">💬 Hộp thư hỗ trợ</h2>
            <p className="text-blue-200 text-xs mt-0.5">{activeSessions.length} cuộc hội thoại</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white text-lg leading-none"
          >×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          {([
            { key: 'waiting', label: 'Chờ', count: waitingCount, urgent: waitingCount > 0 },
            { key: 'active', label: 'Đang chat', count: activeCount, urgent: false },
            { key: 'closed', label: 'Đã đóng', count: 0, urgent: false },
          ] as Array<{ key: TabType; label: string; count: number; urgent: boolean }>).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-bold relative transition-colors ${
                tab === t.key
                  ? 'text-[#00459a] border-b-2 border-[#00459a]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-black ${
                  t.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {displayedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <span className="text-3xl mb-2">🎉</span>
              <p className="text-xs text-center">Không có cuộc hội thoại nào</p>
            </div>
          ) : (
            displayedSessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`w-full text-left px-3 py-3 border-b border-gray-100 transition-all hover:bg-white ${
                  selectedSession?.id === session.id
                    ? 'bg-blue-50 border-l-4 border-l-[#00459a]'
                    : session.status === 'waiting'
                    ? 'bg-amber-50 border-l-4 border-l-amber-400'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        session.status === 'waiting'
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                          : 'bg-gradient-to-br from-[#00459a] to-[#0061d5]'
                      }`}>
                        <span className="text-white font-black text-xs">
                          {(session.customerName || 'K')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{session.customerName || 'Khách hàng'}</p>
                        <p className="text-[10px] text-gray-400">{STATUS_LABEL[session.status]}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 truncate pl-10">{session.lastMessage}</p>
                  </div>
                  {session.unreadByAdmin > 0 && (
                    <span className="bg-red-500 text-white text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-black flex-shrink-0 mt-1 animate-pulse">
                      {session.unreadByAdmin}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-6xl mb-4">💬</span>
            <p className="text-sm font-bold text-gray-500">Chọn một cuộc hội thoại</p>
            <p className="text-xs text-gray-400 mt-1">để bắt đầu trả lời khách hàng</p>
            {waitingCount > 0 && (
              <div className="mt-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-center max-w-[200px]">
                <p className="text-xs font-black text-amber-700">⏳ {waitingCount} khách đang chờ!</p>
                <p className="text-[10px] text-amber-600 mt-1">Nhấn vào tab "Chờ" để hỗ trợ</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  selectedSession.status === 'waiting'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-[#00459a] to-[#0061d5]'
                }`}>
                  <span className="text-white font-black text-sm">
                    {(selectedSession.customerName || 'K')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">{selectedSession.customerName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedSession.status === 'active' ? 'bg-green-400' :
                      selectedSession.status === 'waiting' ? 'bg-amber-400 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    <p className="text-xs text-gray-400">{STATUS_LABEL[selectedSession.status]}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedSession.status === 'waiting' && user && (
                  <button
                    onClick={() => assignAdminToSession(selectedSession.id, user.uid, user.displayName || 'Admin')}
                    className="text-xs text-white bg-green-500 hover:bg-green-600 font-bold px-3 py-1 rounded-xl transition-colors"
                  >
                    ✋ Nhận chat
                  </button>
                )}
                {selectedSession.status !== 'closed' && (
                  <button
                    onClick={() => handleClose(selectedSession.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded border border-red-200 hover:border-red-400 transition-colors"
                  >
                    Đóng chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/30 to-white">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-20 text-gray-300 text-xs">
                  Chưa có tin nhắn
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.senderType !== 'admin' && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 ${
                      msg.senderType === 'bot'
                        ? 'bg-purple-100'
                        : 'bg-gradient-to-br from-[#00459a] to-[#0061d5]'
                    }`}>
                      <span className="text-xs">{msg.senderType === 'bot' ? '🤖' : '👤'}</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.senderType === 'admin' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.senderType !== 'admin' && (
                      <span className="text-[10px] text-gray-400 mb-1 ml-1">
                        {msg.senderType === 'bot' ? 'AquaBot' : selectedSession.customerName}
                      </span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                      msg.senderType === 'admin'
                        ? 'bg-gradient-to-r from-[#00459a] to-[#0061d5] text-white rounded-br-sm'
                        : msg.senderType === 'bot'
                        ? 'bg-purple-50 border border-purple-100 text-purple-800 rounded-bl-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-gray-300 mt-1 mx-1">
                      {msg.createdAt instanceof Date
                        ? msg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply templates */}
            {selectedSession.status === 'active' && (
              <div className="px-3 py-2 border-t border-gray-50 bg-gray-50/50 flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  'Xin chào! Tôi có thể giúp gì cho bạn? 😊',
                  'Vui lòng chờ tôi kiểm tra ạ.',
                  'Cảm ơn bạn đã liên hệ AquaCare!',
                  'Tôi sẽ sắp xếp kỹ thuật viên trong 24h.',
                ].map((template, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(template)}
                    className="flex-shrink-0 text-[10px] bg-white border border-gray-200 text-gray-600 rounded-full px-2.5 py-1 hover:border-[#00459a] hover:text-[#00459a] transition-colors whitespace-nowrap"
                  >
                    {template.length > 28 ? template.slice(0, 28) + '…' : template}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            {selectedSession.status !== 'closed' ? (
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00459a] focus:bg-white transition-colors"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending}
                    className="px-4 py-2 bg-gradient-to-r from-[#00459a] to-[#0061d5] text-white text-xs font-bold rounded-xl disabled:opacity-50 hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    {isSending ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    {isSending ? '...' : 'Gửi'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
                ✅ Cuộc trò chuyện đã kết thúc
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;
