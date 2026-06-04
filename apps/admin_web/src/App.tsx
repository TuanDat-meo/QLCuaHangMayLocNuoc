import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { initializeFirebase, isFirebaseConfigured } from './services/authService';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types/auth';

// Import Layouts
import { MainLayout } from './components/layouts';

// Import Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import FirebaseSetupGuide from './components/FirebaseSetupGuide';

// Import Pages
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import CustomersPage from './pages/customers/CustomersPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import TechniciansPage from './pages/technicians/TechniciansPage';
import SettingsPage from './pages/settings/SettingsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import DevicesPage from './pages/devices/DevicesPage';
import ReportsPage from './pages/reports/ReportsPage';

// Placeholder cho các chức năng cũ đang khôi phục
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-10 text-center">
    <h1 className="text-2xl font-black uppercase text-slate-400">{title}</h1>
    <p className="mt-2 text-slate-500 font-medium">Chức năng này đang được đồng bộ hóa dữ liệu...</p>
  </div>
);

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole?: UserRole | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  isLoading,
  userRole,
  allowedRoles,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f6ff]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#00459a] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#00459a] font-black animate-pulse uppercase tracking-widest text-[10px]">ĐANG KIỂM TRA QUYỀN TRUY CẬP...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && userRole !== null && userRole !== undefined && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  useEffect(() => { initializeFirebase(); }, []);
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!isFirebaseConfigured()) return <FirebaseSetupGuide />;
  if (isLoading) return null;

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
          <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />

          {/* CÁC TRANG CHỨC NĂNG - ĐÃ KHÔI PHỤC ĐẦY ĐỦ */}
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}><DashboardPage /></ProtectedRoute>} />

          <Route path="/orders" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]}><OrdersPage /></ProtectedRoute>} />

          <Route path="/schedule" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}><PlaceholderPage title="Lịch làm việc" /></ProtectedRoute>} />

          <Route path="/technicians" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}><TechniciansPage /></ProtectedRoute>} />

          <Route path="/products" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]}><ProductsPage /></ProtectedRoute>} />

          <Route path="/customers" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR, UserRole.ACCOUNTANT]}><CustomersPage /></ProtectedRoute>} />

          <Route path="/warranty" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}><PlaceholderPage title="Quản lý Bảo hành" /></ProtectedRoute>} />

          <Route path="/devices" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}><DevicesPage /></ProtectedRoute>} />

          <Route path="/reports" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT]}><ReportsPage /></ProtectedRoute>} />

          <Route path="/audit-logs" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN]}><AuditLogsPage /></ProtectedRoute>} />

          <Route path="/users" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN]}><UsersPage /></ProtectedRoute>} />

          <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role} allowedRoles={[UserRole.ADMIN]}><SettingsPage /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}><ProfilePage /></ProtectedRoute>} />

          <Route path="/notifications" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}><NotificationsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

export default App;
