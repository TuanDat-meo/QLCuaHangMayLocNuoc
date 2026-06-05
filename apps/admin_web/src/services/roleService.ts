import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { getDb } from './authService';
import { Role, Permission, APP_PERMISSIONS } from '../types/role';

const ROLES_COLLECTION = 'roles';

const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && value.seconds) return new Date(value.seconds * 1000);
  return new Date(value) || new Date();
};

export const getAllPermissions = (): Permission[] => {
  return APP_PERMISSIONS;
};

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const db = getDb();
    const q = query(collection(db, ROLES_COLLECTION), orderBy('roleValue', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        permissions: data.permissions || [],
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Role;
    });
  } catch (error) {
    console.error("[RoleService] Error fetching roles:", error);
    throw error;
  }
};

export const createRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const db = getDb();
  const roleId = roleData.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');

  const roleRef = doc(db, ROLES_COLLECTION, roleId);
  const newRole = {
    ...roleData,
    permissions: roleData.permissions || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(roleRef, newRole);
  return roleId;
};

export const updateRole = async (roleId: string, roleData: Partial<Role>): Promise<void> => {
  const db = getDb();
  const roleRef = doc(db, ROLES_COLLECTION, roleId);
  const cleanData = { ...roleData };
  delete (cleanData as any).id;
  delete (cleanData as any).createdAt;
  delete (cleanData as any).updatedAt;

  return await updateDoc(roleRef, {
    ...cleanData,
    updatedAt: serverTimestamp()
  });
};

export const toggleRolePermission = async (roleId: string, permissionId: string, hasPermission: boolean): Promise<void> => {
  const db = getDb();
  const roleRef = doc(db, ROLES_COLLECTION, roleId);

  return await updateDoc(roleRef, {
    permissions: hasPermission ? arrayRemove(permissionId) : arrayUnion(permissionId),
    updatedAt: serverTimestamp()
  });
};

export const deleteRole = async (roleId: string): Promise<void> => {
  const db = getDb();
  return await deleteDoc(doc(db, ROLES_COLLECTION, roleId));
};

export const seedStandardRoles = async (): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);

  const standardRoles = [
    {
      id: 'admin',
      name: 'Quản trị viên',
      description: 'Toàn quyền hệ thống, báo cáo tài chính, phê duyệt đặc biệt',
      roleValue: 1,
      permissions: ['users_manage', 'roles_manage', 'audit_view', 'settings_manage', 'orders_manage', 'orders_dispatch', 'schedule_view', 'finance_cod', 'finance_reports', 'inventory_manage', 'task_execute', 'warranty_approve']
    },
    {
      id: 'coordinator',
      name: 'Điều phối',
      description: 'Tiếp nhận đơn, xác nhận khách, sắp xếp lịch KTV',
      roleValue: 2,
      permissions: ['orders_manage', 'orders_dispatch', 'schedule_view']
    },
    {
      id: 'staff',
      name: 'Nhân viên nghiệp vụ',
      description: 'Xử lý đơn hàng và hỗ trợ khách hàng chung',
      roleValue: 3,
      permissions: ['orders_manage', 'schedule_view']
    },
    {
      id: 'accountant',
      name: 'Kế toán',
      description: 'Kiểm soát COD, xác nhận hóa đơn, báo cáo tài chính',
      roleValue: 6,
      permissions: ['finance_cod', 'finance_reports', 'inventory_manage']
    },
    {
      id: 'technician',
      name: 'Kỹ thuật',
      description: 'Nhận phiếu việc, cập nhật tiến độ, xác nhận COD',
      roleValue: 4,
      permissions: ['task_execute', 'warranty_approve']
    }
  ];

  const timestamp = serverTimestamp();

  standardRoles.forEach(role => {
    const roleRef = doc(db, ROLES_COLLECTION, role.id);
    batch.set(roleRef, {
      name: role.name,
      description: role.description,
      roleValue: role.roleValue,
      permissions: role.permissions,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  });

  await batch.commit();
};
