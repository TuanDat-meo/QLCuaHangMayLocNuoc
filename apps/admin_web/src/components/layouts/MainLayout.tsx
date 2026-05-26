/**
 * Main Layout Component with Sidebar Navigation
 * Implements the design system from DESIGN.md
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';

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
      // Even if logout fails, redirect to login
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-surface">
          <div className="container mx-auto px-container-margin py-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
