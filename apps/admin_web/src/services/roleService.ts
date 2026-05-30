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
  writeBatch
} from 'firebase/firestore';
import { getDb } from './authService';
import { Role, Permission, APP_PERMISSIONS } from '../types/role';

const ROLES_COLLECTION = 'roles';

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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      } as Role;
    });
  } catch (error) {
    console.error("[RoleService] Error fetching roles:", error);
    throw error;
  }
};

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
    throw error;
  }
};

/**
 * Khởi tạo danh sách vai trò chuẩn theo yêu cầu nghiệp vụ AquaCare của bạn
 */
export const seedStandardRoles = async () => {
  const db = getDb();
  const batch = writeBatch(db);

  const standardRoles = [
    {
      id: 'admin',
      name: 'Quản trị viên (Admin)',
      roleValue: 1,
      description: 'Nắm toàn quyền kiểm soát hệ thống. Phân quyền cho nhân viên, quản lý danh mục sản phẩm và giá. Theo dõi các báo cáo tài chính, biểu đồ doanh thu và quản lý cấu hình hệ thống. Phê duyệt các yêu cầu bảo hành đặc biệt hoặc khiếu nại từ khách hàng.',
      permissions: APP_PERMISSIONS.map(p => p.id)
    },
    {
      id: 'coordinator',
      name: 'Nhân viên Điều phối',
      roleValue: 2,
      description: 'Điều phối: Tiếp nhận đơn hàng, gọi điện xác nhận và sắp xếp lịch làm việc cho KTV trên bản đồ số.',
      permissions: ['orders_view', 'orders_manage', 'orders_dispatch', 'tech_view']
    },
    {
      id: 'technician',
      name: 'Kỹ thuật viên',
      roleValue: 4,
      description: 'Sử dụng app kỹ thuật viên để nhận phiếu việc (lắp đặt/bảo trì). Xem thông tin khách hàng và vị trí trên bản đồ. Cập nhật trạng thái công việc: "Đang đến", "Đang xử lý", "Hoàn thành", "Sự cố". Chụp ảnh xác nhận, quét mã QR kích hoạt bảo hành và thu COD.',
      permissions: ['orders_view', 'tech_view']
    },
    {
      id: 'accountant',
      name: 'Kế toán hệ thống',
      roleValue: 6,
      description: 'Kế toán: Kiểm soát dòng tiền từ các đơn hàng COD do KTV nộp về, xác nhận hóa đơn, quản lý chi phí nhập hàng và xuất các báo cáo tài chính định kỳ cho Admin.',
      permissions: ['orders_view', 'finance_cod', 'finance_reports']
    },
    {
      id: 'customer',
      name: 'Khách hàng',
      roleValue: 5,
      description: 'Sử dụng app khách hàng để tìm kiếm, xem thông số và đặt mua. Theo dõi lịch trình di chuyển của KTV. Quản lý thiết bị đã mua, tra cứu bảo hành. Nhận thông báo nhắc bảo trì và gửi yêu cầu sửa chữa.',
      permissions: ['orders_view']
    }
  ];

  standardRoles.forEach(role => {
    const roleRef = doc(db, ROLES_COLLECTION, role.id);
    batch.set(roleRef, {
      ...role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
};

export const updateRole = async (roleId: string, roleData: Partial<Role>): Promise<void> => {
  const db = getDb();
  const roleRef = doc(db, ROLES_COLLECTION, roleId);
  return await updateDoc(roleRef, { ...roleData, updatedAt: serverTimestamp() });
};

export const deleteRole = async (roleId: string): Promise<void> => {
  const db = getDb();
  return await deleteDoc(doc(db, ROLES_COLLECTION, roleId));
};
