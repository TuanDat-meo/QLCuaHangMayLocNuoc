/**
 * Authentication Types & Interfaces - Aligned with AquaCare Business Roles
 */

export enum UserRole {
  ADMIN = 1,          // Quản trị viên: Toàn quyền, Báo cáo tài chính, Phê duyệt đặc biệt
  COORDINATOR = 2,    // Điều phối: Tiếp nhận đơn, xác nhận, sắp xếp lịch KTV
  ACCOUNTANT = 6,     // Kế toán: Kiểm soát COD, xác nhận hóa đơn, báo cáo tài chính
  TECHNICIAN = 4,     // Kỹ thuật viên: Nhận phiếu việc, cập nhật trạng thái, xác nhận COD
  CUSTOMER = 5,       // Khách hàng: Mua hàng, theo dõi KTV, quản lý bảo hành
  STAFF = 3,          // Nhân viên nghiệp vụ chung
  PENDING = 0         // Chờ duyệt
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  isVerified: boolean;
  status: 'active' | 'pending' | 'blocked' | 'resigned';
  source: 'admin_web' | 'customer_app' | 'technician_app';
  // Salary fields
  baseSalary?: number;
  commissionPerOrder?: number;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber: string;
  role?: UserRole | null;
  source?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
