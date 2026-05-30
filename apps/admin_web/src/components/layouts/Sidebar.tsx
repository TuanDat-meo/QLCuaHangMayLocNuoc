/**
 * Sidebar Navigation Component - Full Features with RBAC
 */

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  BarChart3,
  Zap,
  Calendar,
  Smartphone,
  Shield,
  ShoppingCart,
  ShieldCheck,
  Menu,
  Activity,
  ClipboardCheck,
  Database
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles?: UserRole[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Tổng quan',
      href: '/dashboard',
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Đơn hàng',
      href: '/orders',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Lịch làm việc',
      href: '/schedule',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR]
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Kỹ thuật viên',
      href: '/technicians',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR]
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Sản phẩm & Kho',
      href: '/products',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Khách hàng',
      href: '/customers',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Bảo hành',
      href: '/warranty',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR]
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: 'Thiết bị lắp đặt',
      href: '/devices',
      roles: [UserRole.ADMIN, UserRole.COORDINATOR]
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Thống kê & Báo cáo',
      href: '/reports',
      roles: [UserRole.ADMIN, UserRole.ACCOUNTANT]
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Lịch sử hệ thống',
      href: '/audit-logs',
      roles: [UserRole.ADMIN]
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: 'Quản lý nhân sự',
      href: '/users',
      roles: [UserRole.ADMIN]
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Cài đặt hệ thống',
      href: '/settings',
      roles: [UserRole.ADMIN]
    },
  ];

  const filteredItems = navItems.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-24'} bg-white dark:bg-[#1e293b] border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col z-30 shadow-xl`}>
      <div className="flex items-center h-20 px-6 overflow-hidden border-b border-slate-50 dark:border-slate-800">
        <button onClick={onToggle} className="flex items-center gap-3 min-w-max hover:opacity-80 transition-opacity outline-none group">
          <div className="w-12 h-12 bg-[#00459a] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            {isOpen ? <span className="text-white font-black text-2xl">A</span> : <Menu className="text-white w-6 h-6" />}
          </div>
          {isOpen && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-[#0b1c30] dark:text-white uppercase tracking-tighter leading-none">Aquacare</span>
              <span className="text-[9px] font-bold text-[#00459a] dark:text-blue-400 tracking-widest uppercase mt-1">Admin Center</span>
            </div>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} to={item.href} className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative ${active ? 'bg-[#00459a] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#00459a]'}`}>
              <div className={`flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</div>
              {isOpen && <span className="flex-1 whitespace-nowrap font-black text-[11px] uppercase tracking-wider">{item.label}</span>}
              {!isOpen && active && <div className="absolute left-0 w-1 h-8 bg-[#00459a] rounded-r-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-[#00459a] font-black text-xs shadow-sm">
             {user?.displayName?.charAt(0).toUpperCase() || 'AD'}
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[10px] font-black text-[#0b1c30] dark:text-white truncate uppercase">{user?.displayName}</span>
              <span className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Online
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
