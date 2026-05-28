/**
 * Role & Permission Types
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string; // e.g., 'users', 'products', 'orders', 'roles'
  action: 'read' | 'create' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string; // Usually the numeric role value as string or a slug
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  roleValue: number;    // Maps to UserRole enum
  createdAt: Date;
  updatedAt: Date;
}

export const APP_PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users_view', name: 'Xem người dùng', description: 'Cho phép xem danh sách người dùng', module: 'users', action: 'read' },
  { id: 'users_manage', name: 'Quản lý người dùng', description: 'Cho phép thêm, sửa, xóa người dùng', module: 'users', action: 'manage' },

  // Role Management
  { id: 'roles_view', name: 'Xem vai trò', description: 'Cho phép xem danh sách vai trò', module: 'roles', action: 'read' },
  { id: 'roles_manage', name: 'Quản lý vai trò', description: 'Cho phép thêm, sửa, xóa vai trò và phân quyền', module: 'roles', action: 'manage' },

  // Product Management
  { id: 'products_view', name: 'Xem sản phẩm', description: 'Cho phép xem danh sách sản phẩm', module: 'products', action: 'read' },
  { id: 'products_manage', name: 'Quản lý sản phẩm', description: 'Cho phép thêm, sửa, xóa sản phẩm', module: 'products', action: 'manage' },

  // Order Management
  { id: 'orders_view', name: 'Xem đơn hàng', description: 'Cho phép xem danh sách đơn hàng', module: 'orders', action: 'read' },
  { id: 'orders_manage', name: 'Quản lý đơn hàng', description: 'Cho phép cập nhật trạng thái đơn hàng', module: 'orders', action: 'manage' },
];
