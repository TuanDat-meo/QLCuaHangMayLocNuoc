import React from 'react';
import {
  Bell, CheckCircle2, Package, Calendar, Zap, Info,
  Clock, ChevronRight
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const getNotifIcon = (type: string, isRead: boolean) => {
    const iconSize = 20;
    const baseClass = `w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${!isRead ? 'shadow-lg scale-110' : 'opacity-60'}`;

    switch (type) {
      case 'order':
        return (
          <div className={`${baseClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`}>
            <Package size={iconSize} />
          </div>
        );
      case 'maintenance':
        return (
          <div className={`${baseClass} bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400`}>
            <Calendar size={iconSize} />
          </div>
        );
      case 'system':
        return (
          <div className={`${baseClass} bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400`}>
            <Zap size={iconSize} />
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
            <Info size={iconSize} />
          </div>
        );
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight flex items-center gap-3 uppercase">
            Trung tâm thông báo
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-3 py-1 rounded-full font-black animate-pulse">
                {unreadCount} MỚI
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Theo dõi các cập nhật quan trọng từ hệ thống AquaCare</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black text-[#00459a] dark:text-blue-400 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <CheckCircle2 size={16} />
            Đánh dấu tất cả
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Tất cả', 'Đơn hàng', 'Bảo trì', 'Hệ thống'].map((filter, i) => (
          <button
            key={filter}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              i === 0
                ? 'bg-[#0b1c30] text-white border-[#0b1c30] dark:bg-white dark:text-[#0b1c30] dark:border-white shadow-md'
                : 'bg-white dark:bg-[#1e293b] text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.nid}
              onClick={() => !notif.is_read && markAsRead(notif.nid)}
              className={`group relative bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-6 border transition-all cursor-pointer flex gap-6 items-start ${
                !notif.is_read
                  ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/5 shadow-lg shadow-blue-900/5'
                  : 'border-slate-50 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {!notif.is_read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#00459a] dark:bg-blue-400 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              )}

              {getNotifIcon(notif.type, notif.is_read)}

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className={`text-base leading-tight ${!notif.is_read ? 'font-black text-[#0b1c30] dark:text-white' : 'font-bold text-slate-600 dark:text-slate-400'}`}>
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                    <Clock size={12} />
                    {formatDate(notif.created_at)}
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-4 ${!notif.is_read ? 'text-slate-700 dark:text-slate-300 font-bold' : 'text-slate-500 dark:text-slate-500 font-medium'}`}>
                  {notif.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      notif.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      notif.type === 'maintenance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}>
                      {notif.type}
                    </span>
                    {notif.related_id && (
                      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                        #{notif.related_id.substring(0, 8).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <button className="text-[#00459a] dark:text-blue-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem chi tiết
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-24 text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-slate-200 dark:text-slate-800" size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-300 dark:text-slate-700 mb-2 uppercase tracking-widest">Hộp thư trống</h3>
            <p className="text-slate-400 dark:text-slate-600 font-bold text-sm">Bạn không có thông báo mới nào.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
            Hệ thống lưu giữ 50 bản tin gần nhất
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
