/**
 * Main Layout Component with Sidebar Navigation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminChatBubble from '../chat/AdminChatBubble';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      {/* Sidebar - Now receives toggle function */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content - Removed container class to allow full width */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Chat Bubble - Hiển thị ở tất cả các trang admin */}
      <AdminChatBubble />
    </div>
  );
};

export default MainLayout;
