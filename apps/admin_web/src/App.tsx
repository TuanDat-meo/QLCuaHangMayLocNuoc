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
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route Component với RBAC
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra vai trò nếu có yêu cầu
  if (allowedRoles && userRole !== null && userRole !== undefined && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  useEffect(() => {
    initializeFirebase();
  }, []);

  const { isAuthenticated, isLoading, user } = useAuth();

  if (!isFirebaseConfigured()) {
    return <FirebaseSetupGuide />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f6ff]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#00459a] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#00459a] font-black animate-pulse uppercase tracking-widest text-[10px]">KHỞI TẠO HỆ THỐNG...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                userRole={user?.role}
                allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} // Chỉ Admin & Manager được quản lý nhân sự
              >
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} userRole={user?.role}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                userRole={user?.role}
                allowedRoles={[UserRole.ADMIN]} // Chỉ Admin tuyệt đối được vào Cài đặt hệ thống
              >
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontWeight: 'bold' } }} />
      </div>
    </Router>
  );
};

export default App;
