import React from 'react';
import {
  Bell, CheckCircle2, Package, Calendar, Zap, Info,
  Trash2, Filter, Clock, ChevronRight
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { AppNotification } from '../../types/notification';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const getNotifIcon = (type: string, isRead: boolean) => {
    const iconSize = 20;
    const baseClass = `w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${!isRead ? 'shadow-lg scale-110' : 'opacity-60'}`;

    switch (type) {
      case 'order':
        return (
          <div className={`${baseClass} bg-blue-50 text-blue-600`}>
            <Package size={iconSize} />
          </div>
        );
      case 'maintenance':
        return (
          <div className={`${baseClass} bg-amber-50 text-amber-600`}>
            <Calendar size={iconSize} />
          </div>
        );
      case 'system':
        return (
          <div className={`${baseClass} bg-purple-50 text-purple-600`}>
            <Zap size={iconSize} />
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-slate-50 text-slate-600`}>
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight flex items-center gap-3">
            Trung tâm thông báo
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[12px] px-3 py-1 rounded-full font-black">
                {unreadCount} MỚI
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-semibold mt-2">Theo dõi các cập nhật quan trọng từ hệ thống AquaCare</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-[#00459a] uppercase tracking-widest hover:border-[#00459a] hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
          >
            <CheckCircle2 size={16} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter Bar (Placeholder for future expansion) */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button className="px-5 py-2.5 bg-[#00459a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Tất cả</button>
        <button className="px-5 py-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap hover:bg-slate-50 transition-all">Đơn hàng</button>
        <button className="px-5 py-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap hover:bg-slate-50 transition-all">Bảo trì</button>
        <button className="px-5 py-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap hover:bg-slate-50 transition-all">Hệ thống</button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.nid}
              onClick={() => !notif.is_read && markAsRead(notif.nid)}
              className={`group relative bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border transition-all cursor-pointer flex gap-6 items-start ${
                !notif.is_read
                  ? 'border-blue-100 bg-blue-50/10'
                  : 'border-slate-50 hover:border-slate-200'
              }`}
            >
              {!notif.is_read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#00459a] rounded-r-full shadow-[0_0_15px_rgba(0,69,154,0.5)]" />
              )}

              {getNotifIcon(notif.type, notif.is_read)}

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className={`text-base leading-tight ${!notif.is_read ? 'font-black text-[#0b1c30]' : 'font-bold text-slate-600'}`}>
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                    <Clock size={12} />
                    {formatDate(notif.created_at)}
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-4 ${!notif.is_read ? 'text-slate-700 font-semibold' : 'text-slate-500 font-medium'}`}>
                  {notif.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      notif.type === 'order' ? 'bg-blue-100 text-blue-700' :
                      notif.type === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {notif.type}
                    </span>
                    {notif.related_id && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                        #{notif.related_id.substring(0, 8)}
                      </span>
                    )}
                  </div>

                  <button className="text-[#00459a] flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Chi tiết
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-slate-200" size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2 uppercase tracking-widest">Hộp thư trống</h3>
            <p className="text-slate-400 font-bold text-sm">Bạn chưa có thông báo nào từ hệ thống.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Hiển thị tối đa 50 thông báo gần nhất
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
