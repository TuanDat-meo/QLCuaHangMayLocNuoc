/**
 * Sidebar Navigation Component
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
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Tổng quan',
      href: '/dashboard',
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: 'Duyệt thành viên',
      href: '/users',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Sản phẩm',
      href: '/products',
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Đơn hàng',
      href: '/orders',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Kỹ thuật viên',
      href: '/technicians',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Lịch hẹn',
      href: '/schedule',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      label: 'Thiết bị',
      href: '/devices',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Bảo hành',
      href: '/warranty',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Khách hàng',
      href: '/customers',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Báo cáo',
      href: '/reports',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Cài đặt',
      href: '/settings',
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-slate-100 transition-all duration-300 ease-in-out flex flex-col z-30 shadow-sm`}
    >
      {/* Logo Section */}
      <div className="flex items-center h-20 px-6 overflow-hidden border-b border-slate-50">
        <div className="flex items-center gap-3 min-w-max">
          <div className="w-10 h-10 bg-[#00459a] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl">A</span>
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#0b1c30] leading-tight uppercase tracking-tighter">Aquacare</span>
              <span className="text-[10px] font-bold text-[#00459a] tracking-widest uppercase">Admin Panel</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 relative ${
                active
                  ? 'bg-[#00459a] text-white shadow-lg shadow-blue-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-[#00459a]'
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>

              {isOpen && (
                <span className="flex-1 whitespace-nowrap font-bold text-sm">
                  {item.label}
                </span>
              )}

              {active && isOpen && (
                <ChevronRight className="w-4 h-4 text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Preview */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-[#00459a] font-black text-xs shadow-sm uppercase">
             AD
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-black text-[#0b1c30] truncate uppercase tracking-tighter">Administrator</span>
              <span className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-widest">Online</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
