import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Lock,
  User,
  Palette,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const settingsSections = [
    {
      id: 'appearance',
      title: 'Giao diện & Trải nghiệm',
      description: 'Tùy chỉnh cách hiển thị của hệ thống theo sở thích của bạn.',
      icon: <Palette className="text-[#00459a]" size={20} />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
              theme === 'light'
                ? 'border-[#00459a] bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'light' ? 'bg-[#00459a] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Sun size={24} />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase tracking-widest text-[#0b1c30] dark:text-white">Chế độ Sáng</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Light Mode</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-400 bg-blue-900/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Moon size={24} />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase tracking-widest text-[#0b1c30] dark:text-white">Chế độ Tối</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Dark Mode</p>
            </div>
          </button>

          <div className="flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Monitor size={24} />
            </div>
            <div className="text-center">
              <p className="font-black text-xs uppercase tracking-widest text-slate-400">Theo hệ thống</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">System Default</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      description: 'Quản lý cách bạn nhận thông báo về đơn hàng và hệ thống.',
      icon: <Bell className="text-amber-500" size={20} />,
      content: (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
            <div>
              <p className="text-sm font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Thông báo trình duyệt</p>
              <p className="text-xs text-slate-400 font-medium">Nhận thông báo ngay cả khi không mở tab</p>
            </div>
            <div className="w-12 h-6 bg-[#00459a] rounded-full relative p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
            <div>
              <p className="text-sm font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Email định kỳ</p>
              <p className="text-xs text-slate-400 font-medium">Báo cáo tổng kết đơn hàng hàng tuần qua email</p>
            </div>
            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow-sm" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Bảo mật',
      description: 'Cấu hình các lớp bảo mật cho tài khoản quản trị.',
      icon: <Shield className="text-emerald-500" size={20} />,
      content: (
        <div className="space-y-4 mt-4">
          <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Thay đổi mật khẩu</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác thực 2 yếu tố (2FA)</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="text-[#00459a]" size={28} />
          Cài đặt hệ thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quản lý cấu hình cá nhân và thiết lập hệ thống chuyên sâu</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {settingsSections.map((section) => (
          <div key={section.id} className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">{section.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{section.description}</p>
                </div>
              </div>

              <div className="pt-2">
                {section.content}
              </div>
            </div>
          </div>
        ))}

        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AquaCare Admin v2.1.0 • Phiên bản chuyên nghiệp</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
