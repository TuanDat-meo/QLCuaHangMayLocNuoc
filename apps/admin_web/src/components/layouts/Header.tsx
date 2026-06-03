/**
 * Header Component - Refined (Removed redundant search and toggle)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, User, LogOut, ChevronDown,
  Settings as SettingsIcon, Package, Zap, Calendar,
  Info, Moon, Sun, Palette, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useNotifications } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';

interface UserInfo {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

interface HeaderProps {
  user?: UserInfo | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifMenuOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="text-blue-500" size={16} />;
      case 'maintenance': return <Calendar className="text-amber-500" size={16} />;
      case 'system': return <Zap className="text-purple-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  return (
    <header className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between h-20 px-8 gap-4">

        {/* Left Section - Breadcrumbs or Page Info could go here */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hệ thống quản trị</p>
            <h2 className="text-sm font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">AquaCare Admin Professional</h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* 1. Quick Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${settingsMenuOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-[#00459a] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              title="Cài đặt nhanh"
            >
              <SettingsIcon className={`w-5 h-5 ${settingsMenuOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
            </button>

            {settingsMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="p-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-black text-[#0b1c30] dark:text-white text-[10px] uppercase tracking-[0.2em]">Cài đặt nhanh</h3>
                </div>

                <div className="p-5 space-y-6">
                  {/* Theme Switcher */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Palette size={12} className="text-[#00459a]" />
                      Giao diện hệ thống
                    </p>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-[#00459a] shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        <Sun size={14} />
                        <span className="text-[10px] font-black uppercase">Sáng</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        <Moon size={14} />
                        <span className="text-[10px] font-black uppercase">Tối</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                    <Link
                      to="/settings"
                      onClick={() => setSettingsMenuOpen(false)}
                      className="flex items-center justify-between w-full p-2 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-[#00459a] dark:hover:text-white transition-colors uppercase tracking-widest"
                    >
                      <span>Cấu hình chi tiết</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className={`p-2.5 rounded-xl transition-all relative ${notifMenuOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-[#00459a] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#0f172a] flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="p-5 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-[#0b1c30] dark:text-white text-[10px] uppercase tracking-widest">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[9px] font-black text-[#00459a] dark:text-blue-400 hover:underline uppercase tracking-tighter"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.nid}
                        onClick={() => !notif.is_read && markAsRead(notif.nid)}
                        className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4 ${!notif.is_read ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.is_read ? 'bg-white dark:bg-slate-800 shadow-sm border border-border-base/50' : 'bg-slate-50 dark:bg-slate-900'}`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight mb-1 ${!notif.is_read ? 'font-black text-[#0b1c30] dark:text-white' : 'font-semibold text-slate-500 dark:text-slate-400'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 font-medium">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-1.5 h-1.5 bg-[#00459a] dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Bell className="text-slate-100 dark:text-slate-800 mx-auto mb-3 opacity-20" size={48} />
                      <p className="text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-widest">Không có thông báo mới</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800">
                    <Link to="/notifications" onClick={() => setNotifMenuOpen(false)} className="text-[10px] font-black text-slate-500 hover:text-[#00459a] dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
                      Xem tất cả
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1 md:mx-2 hidden sm:block" />

          {/* 3. User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-3 p-1 rounded-2xl transition-all ${userMenuOpen ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black overflow-hidden shadow-sm border-2 border-white dark:border-slate-700">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <div className="hidden lg:block text-left pr-2">
                <p className="text-xs font-black text-[#0b1c30] dark:text-white leading-none uppercase truncate max-w-[100px]">{user?.displayName || 'Admin'}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">Hệ thống: Online</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-300 mr-2 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#00459a] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20">
                      {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-black text-[#0b1c30] dark:text-white truncate uppercase">{user?.displayName}</p>
                       <p className="text-[10px] text-slate-400 truncate font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/50">
                    <ShieldCheck size={12} />
                    Xác thực hệ thống
                  </div>
                </div>

                <div className="p-3">
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#00459a] dark:hover:text-white transition-all">
                    <User className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#00459a] dark:hover:text-white transition-all">
                    <SettingsIcon className="w-4 h-4" />
                    Cài đặt
                  </Link>
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <button
                    onMouseDown={handleLogoutMouseDown}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Đăng xuất an toàn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
