/**
 * Role & Permission Types - Aligned with AquaCare Business Requirements
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'manage' | 'approve' | 'finance';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  roleValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export const APP_PERMISSIONS: Permission[] = [
  // HỆ THỐNG & NHÂN SỰ (Admin)
  { id: 'users_manage', name: 'Quản lý nhân sự', description: 'Thêm, sửa, khóa tài khoản nhân viên', module: 'Nhân sự', action: 'manage' },
  { id: 'roles_manage', name: 'Phân quyền hệ thống', description: 'Cấu hình vai trò và bộ quyền hạn', module: 'Nhân sự', action: 'manage' },
  { id: 'audit_view', name: 'Xem nhật ký hệ thống', description: 'Đối soát lịch sử thao tác của nhân viên', module: 'Hệ thống', action: 'read' },
  { id: 'settings_manage', name: 'Cài đặt hệ thống', description: 'Cấu hình giá, danh mục và tham số chung', module: 'Hệ thống', action: 'manage' },

  // ĐIỀU PHỐI (Coordinator)
  { id: 'orders_manage', name: 'Tiếp nhận đơn hàng', description: 'Xác nhận đơn hàng và cập nhật thông tin khách', module: 'Điều phối', action: 'manage' },
  { id: 'orders_dispatch', name: 'Điều phối KTV', description: 'Sắp xếp lịch làm việc và giao việc cho KTV', module: 'Điều phối', action: 'manage' },
  { id: 'schedule_view', name: 'Xem lịch làm việc', description: 'Theo dõi lịch trình di chuyển của KTV', module: 'Điều phối', action: 'read' },

  // KẾ TOÁN (Accountant)
  { id: 'finance_cod', name: 'Tất toán COD', description: 'Xác nhận dòng tiền COD do KTV nộp về', module: 'Tài chính', action: 'finance' },
  { id: 'finance_reports', name: 'Báo cáo doanh thu', description: 'Xem biểu đồ doanh thu và báo cáo tài chính', module: 'Tài chính', action: 'read' },
  { id: 'inventory_manage', name: 'Quản lý kho', description: 'Kiểm soát nhập xuất và tồn kho sản phẩm', module: 'Sản phẩm', action: 'manage' },

  // KỸ THUẬT (Technician)
  { id: 'task_execute', name: 'Thực hiện nhiệm vụ', description: 'Cập nhật tiến độ tại hiện trường qua App KTV', module: 'Kỹ thuật', action: 'update' },
  { id: 'warranty_approve', name: 'Phê duyệt bảo hành', description: 'Duyệt các khiếu nại hoặc yêu cầu bảo hành đặc biệt', module: 'Kỹ thuật', action: 'approve' },
];
