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
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from './authService';
import { Role, Permission, APP_PERMISSIONS } from '../types/role';

const ROLES_COLLECTION = 'roles';

/**
 * Lấy tất cả quyền hạn có sẵn trong hệ thống
 */
export const getAllPermissions = (): Permission[] => {
  return APP_PERMISSIONS;
};

/**
 * Lấy danh sách tất cả vai trò từ Firestore
 */
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      } as Role;
    });
  } catch (error) {
    console.error("[RoleService] Error fetching roles:", error);
    throw error;
  }
};

/**
 * Tạo vai trò mới
 */
export const createRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const db = getDb();
    const roleId = roleData.name.toLowerCase().replace(/\s+/g, '_');
    const roleRef = doc(db, ROLES_COLLECTION, roleId);

    const newRole = {
      ...roleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(roleRef, newRole);
    return roleId;
  } catch (error) {
    console.error("[RoleService] Error creating role:", error);
    throw error;
  }
};

/**
 * Cập nhật vai trò
 */
export const updateRole = async (roleId: string, roleData: Partial<Role>): Promise<void> => {
  try {
    const db = getDb();
    const roleRef = doc(db, ROLES_COLLECTION, roleId);

    await updateDoc(roleRef, {
      ...roleData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("[RoleService] Error updating role:", error);
    throw error;
  }
};

/**
 * Xóa vai trò
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const db = getDb();
    await deleteDoc(doc(db, ROLES_COLLECTION, roleId));
  } catch (error) {
    console.error("[RoleService] Error deleting role:", error);
    throw error;
  }
};

/**
 * Gán quyền cho vai trò
 */
export const assignPermissionsToRole = async (roleId: string, permissions: string[]): Promise<void> => {
  return updateRole(roleId, { permissions });
};
