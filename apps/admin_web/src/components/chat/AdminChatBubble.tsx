/**
 * AdminChatBubble - Bong bóng chat nổi dành cho admin
 * Hiển thị số tin chưa đọc, click để mở panel chat
 * Có toast popup khi có khách hàng mới nhắn
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AdminChatPanel from './AdminChatPanel';

const AdminChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUnreadRef = useRef(0);

  // Animate badge khi có tin nhắn mới
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && !isOpen) {
      setIsAnimating(true);
      const t = setTimeout(() => setIsAnimating(false), 1000);

      // Hiện toast
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToastMsg(`${unreadCount} tin nhắn chưa đọc từ khách hàng`);
      toastTimerRef.current = setTimeout(() => setToastMsg(null), 4000);

      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
    return undefined;
  }, [unreadCount, isOpen]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const handleOpen = () => {
    setIsOpen(o => !o);
    if (!isOpen) {
      setToastMsg(null); // Ẩn toast khi mở panel
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toastMsg && !isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50"
          style={{ animation: 'slideLeftIn 0.3s ease-out' }}
        >
          <div className="bg-[#0b1c30] text-white text-xs px-4 py-3 rounded-2xl shadow-2xl max-w-[220px] cursor-pointer"
            onClick={handleOpen}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="font-black text-[11px]">Tin nhắn mới</span>
            </div>
            <p className="text-gray-300 text-[10px] leading-relaxed">{toastMsg}</p>
            <p className="text-blue-400 text-[10px] mt-1 font-bold">Nhấn để xem →</p>
          </div>
          {/* Arrow pointing to bubble */}
          <div className="absolute right-5 -bottom-2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #0b1c30',
            }}
          />
        </div>
      )}

      {/* Floating bubble button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="admin-chat-bubble"
          onClick={handleOpen}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-gray-600 scale-95'
              : 'bg-gradient-to-br from-[#00459a] to-[#0061d5] hover:scale-110 hover:shadow-[0_0_30px_rgba(0,69,154,0.5)]'
          } ${isAnimating ? 'animate-bounce' : ''}`}
          title={isOpen ? 'Đóng hộp thư' : `Chat với khách hàng${unreadCount > 0 ? ` (${unreadCount} tin mới)` : ''}`}
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}

          {/* Unread badge */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Pulse ring khi có tin chưa đọc */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute inset-0 rounded-full bg-[#00459a] animate-ping opacity-20" />
          )}
        </button>

        {/* Tooltip khi không mở và có tin */}
        {!isOpen && unreadCount > 0 && !toastMsg && (
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg animate-fade-in">
            {unreadCount} khách hàng đang chờ
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800" />
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[720px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          style={{
            animation: 'slideUpIn 0.2s ease-out',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,69,154,0.1)',
          }}
        >
          <AdminChatPanel
            onClose={() => setIsOpen(false)}
            onUnreadChange={handleUnreadChange}
          />
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideLeftIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminChatBubble;
