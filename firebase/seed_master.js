/**
 * SCRIPT SEED DỮ LIỆU TỔNG HỢP (MASTER SEED) - HỆ THỐNG AQUACARE
 * Đồng bộ cấu trúc với Type/Interface mới nhất trên Admin Web
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

// 1. Khởi tạo Firebase Admin
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.endsWith('.json') && !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f));
if (!keyFile) {
  console.error('❌ Không tìm thấy file JSON chứng thực (serviceAccountKey.json) trong thư mục firebase/');
  process.exit(1);
}

const serviceAccount = require(path.join(__dirname, keyFile));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ══════════════════════════════════════════════════════════════
// 2. DATA CƠ BẢN (ROLES, SUPPLIERS, PRODUCTS)
// ══════════════════════════════════════════════════════════════
const UserRole = {
  ADMIN: 1,
  COORDINATOR: 2,
  ACCOUNTANT: 6,
  TECHNICIAN: 4,
  CUSTOMER: 5,
  STAFF: 3
};

const suppliers = [
  { id: 'sup_karofi', name: 'TẬP ĐOÀN KAROFI VIỆT NAM', phone: '19006418', email: 'info@karofi.com', status: 'Active' },
  { id: 'sup_kangaroo', name: 'TẬP ĐOÀN GIA DỤNG KANGAROO', phone: '1900555566', email: 'contact@kangaroo.vn', status: 'Active' },
  { id: 'sup_aosmith', name: 'A. O. SMITH VIETNAM', phone: '18001228', email: 'hotline@aosmith.com.vn', status: 'Active' }
];

const products = [
  { id: 'prod_ka_k9i', tenSanPham: 'Máy lọc nước Karofi K9I-1', sku: 'KA-K9I', giaBan: 5490000, tonKho: 12, thoiGianBaoHanh: 24, trangThai: 'Active' },
  { id: 'prod_ka_l612', tenSanPham: 'Karofi Livotec 612', sku: 'KA-L612', giaBan: 5890000, tonKho: 18, thoiGianBaoHanh: 24, trangThai: 'Active' },
  { id: 'prod_kg_10a3', tenSanPham: 'Kangaroo KG10A3 Nóng Lạnh', sku: 'KG-10A3', giaBan: 6990000, tonKho: 8, thoiGianBaoHanh: 12, trangThai: 'Active' },
  { id: 'prod_loi_123_ka', tenSanPham: 'Bộ 3 lõi lọc thô Karofi 1-2-3', sku: 'LL-KA-123', giaBan: 350000, tonKho: 120, thoiGianBaoHanh: 0, trangThai: 'Active' }
];

// ══════════════════════════════════════════════════════════════
// 3. NGƯỜI DÙNG (USERS)
// ══════════════════════════════════════════════════════════════
const users = [
  // Khách hàng
  { uid: 'cus_001', email: 'khachhang1@gmail.com', password: 'Password123', displayName: 'Trần Thị Mai', phoneNumber: '+84912345678', role: UserRole.CUSTOMER, status: 'active', source: 'customer_app' },
  { uid: 'cus_002', email: 'khachhang2@gmail.com', password: 'Password123', displayName: 'Lê Văn Tám', phoneNumber: '+84905123456', role: UserRole.CUSTOMER, status: 'active', source: 'customer_app' },
  { uid: 'huyy5725_id', email: 'huyy5725@gmail.com', password: 'huy123', displayName: 'Nguyễn Huy (huyy5725)', phoneNumber: '+84987654321', role: UserRole.CUSTOMER, status: 'active', source: 'customer_app' },
  
  // Kỹ thuật viên
  { uid: 'tech_hcm_001', email: 'hung.tech@aquacare.com', password: 'Password123', displayName: 'Nguyễn Văn Hùng', phoneNumber: '+84901234567', role: UserRole.TECHNICIAN, status: 'active', source: 'admin_web', isAvailable: true, khuVuc: 'Quận 1, TP.HCM' },
  { uid: 'tech_hcm_002', email: 'son.tech@aquacare.com', password: 'Password123', displayName: 'Trần Thanh Sơn', phoneNumber: '+84902345678', role: UserRole.TECHNICIAN, status: 'active', source: 'admin_web', isAvailable: true, khuVuc: 'Quận 7, TP.HCM' },
  { uid: 'tech_hn_001', email: 'nam.tech@aquacare.com', password: 'Password123', displayName: 'Lê Hoàng Nam', phoneNumber: '+84912345679', role: UserRole.TECHNICIAN, status: 'active', source: 'admin_web', isAvailable: true, khuVuc: 'Cầu Giấy, Hà Nội' }
];

// ══════════════════════════════════════════════════════════════
// 4. ĐƠN HÀNG (ORDERS)
// ══════════════════════════════════════════════════════════════
const getRandomDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 8) + 8, Math.floor(Math.random() * 60), 0); // 08:00 - 16:00
  return d;
};

const orders = [
  {
    id: 'ORD-MASTER-001',
    customerName: 'Anh Tuấn - Cầu Giấy',
    phoneNumber: '0912345678',
    provinceCode: 1, districtCode: 5, wardCode: 15,
    street: 'Số 15 Duy Tân',
    address: 'Số 15 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    productName: 'Karofi K9I-1',
    totalAmount: 5490000,
    status: 'completed',
    orderType: 'installation',
    loaiDonHang: 'installation',
    trangThai: 'completed',
    technicians: [{ id: 'tech_hn_001', name: 'Lê Hoàng Nam', phone: '0912345679' }],
    items: [{ id: 'prod_ka_k9i', name: 'Máy lọc nước Karofi K9I-1', price: 5490000, quantity: 1, thoiGianBaoHanh: 24 }],
    createdAt: admin.firestore.Timestamp.fromDate(getRandomDate(30)),
    note: 'Khách yêu cầu gọi trước khi đến'
  },
  {
    id: 'ORD-MASTER-002',
    customerName: 'Cửa hàng Cafe Highland',
    phoneNumber: '0988222333',
    provinceCode: 1, districtCode: 1, wardCode: 1,
    street: 'Tầng 1 Lotte Center',
    address: 'Tầng 1 Lotte Center, Liễu Giai, Ba Đình, Hà Nội',
    productName: 'Kangaroo KG10A3 (x2)',
    totalAmount: 13980000,
    status: 'paid',
    orderType: 'installation',
    loaiDonHang: 'installation',
    trangThai: 'paid',
    technicians: [{ id: 'tech_hcm_001', name: 'Nguyễn Văn Hùng', phone: '0901234567' }],
    items: [{ id: 'prod_kg_10a3', name: 'Kangaroo KG10A3 Nóng Lạnh', price: 6990000, quantity: 2, thoiGianBaoHanh: 12 }],
    createdAt: admin.firestore.Timestamp.fromDate(getRandomDate(40)),
    note: 'Xuất hóa đơn điện tử'
  },
  {
    id: 'ORD-MASTER-003',
    customerName: 'Trần Thị Mai',
    phoneNumber: '0912345678',
    provinceCode: 79, districtCode: 760, wardCode: 26734,
    street: 'Số 5 Đường D1',
    address: 'Số 5 Đường D1, Tân Hưng, Quận 7, TP HCM',
    productName: 'Thay lõi Karofi 1-2-3',
    totalAmount: 350000,
    status: 'assigned',
    orderType: 'maintenance',
    loaiDonHang: 'maintenance',
    trangThai: 'pending',
    technicians: [{ id: 'tech_hcm_002', name: 'Trần Thanh Sơn', phone: '0902345678' }],
    items: [{ id: 'prod_loi_123_ka', name: 'Bộ 3 lõi lọc thô Karofi 1-2-3', price: 350000, quantity: 1, thoiGianBaoHanh: 0 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 48*60*60*1000)),
    scheduledDate: admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(14, 0, 0))), // 14:00 hôm nay
    note: 'Bảo trì định kỳ 6 tháng'
  }
];

// Sinh thêm 7 đơn hàng ngẫu nhiên (tổng 10)
const statuses = ['pending', 'approved', 'assigned', 'processing', 'completed', 'paid'];
const types = ['installation', 'maintenance', 'repair'];
for (let i = 4; i <= 10; i++) {
  const p = products[Math.floor(Math.random() * products.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const orderDate = getRandomDate(15);
  
  let techArr = [];
  let schedDate = null;
  if (['assigned', 'processing', 'completed', 'paid'].includes(status)) {
    const t = users[Math.floor(Math.random() * 3) + 3]; // Lấy random technician
    techArr = [{ id: t.uid, name: t.displayName, phone: t.phoneNumber }];
    const sDate = new Date(orderDate.getTime() + 86400000);
    sDate.setHours(Math.floor(Math.random() * 4) + 9, 30, 0); // Hẹn 9:30 - 12:30 sáng hôm sau
    schedDate = admin.firestore.Timestamp.fromDate(sDate);
  }

  orders.push({
    id: `ORD-MASTER-00${i}`,
    customerName: `Khách Hàng ${i}`,
    phoneNumber: `090${Math.floor(Math.random() * 9000000)}`,
    provinceCode: 1, districtCode: 1, wardCode: 1,
    street: `Số ${i} Đường Random`,
    address: `Số ${i} Đường Random, Phường X, Quận Y, TP Z`,
    productName: p.tenSanPham,
    totalAmount: p.giaBan,
    status: status,
    orderType: type,
    loaiDonHang: type,
    trangThai: type === 'maintenance' ? 'pending' : status,
    technicians: techArr,
    scheduledDate: schedDate,
    items: [{ id: p.id, name: p.tenSanPham, price: p.giaBan, quantity: 1, thoiGianBaoHanh: p.thoiGianBaoHanh }],
    createdAt: admin.firestore.Timestamp.fromDate(orderDate),
    note: 'Đơn hàng tự sinh'
  });
}

// ══════════════════════════════════════════════════════════════
// 5. HÀM THỰC THI SEED
// ══════════════════════════════════════════════════════════════
async function seedMaster() {
  console.log('🚀 BẮT ĐẦU SEED DỮ LIỆU TỔNG HỢP (MASTER SEED)');
  const batch = db.batch();

  try {
    // 1. Seed Users (Auth & Firestore)
    console.log('📦 Đang tạo người dùng (Khách hàng & Kỹ thuật viên)...');
    for (const user of users) {
      try {
        let authUser;
        try {
          authUser = await auth.getUserByEmail(user.email);
          await auth.updateUser(authUser.uid, { password: user.password, displayName: user.displayName, phoneNumber: user.phoneNumber });
        } catch (e) {
          authUser = await auth.createUser({ uid: user.uid, email: user.email, password: user.password, displayName: user.displayName, phoneNumber: user.phoneNumber });
        }

        const { password, ...firestoreData } = user;
        batch.set(db.collection('nguoiDung').doc(authUser.uid), {
          ...firestoreData,
          uid: authUser.uid,
          isVerified: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.error(`Lỗi tạo user ${user.email}:`, err.message);
      }
    }

    // 2. Seed Suppliers
    console.log('📦 Đang tạo Nhà cung cấp...');
    suppliers.forEach(s => batch.set(db.collection('suppliers').doc(s.id), { ...s, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));

    // 3. Seed Products
    console.log('📦 Đang tạo Sản phẩm...');
    products.forEach(p => batch.set(db.collection('sanPham').doc(p.id), { ...p, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));

    // 4. Seed Orders & Devices
    console.log('📦 Đang tạo Đơn hàng, Thiết bị & Lịch sử...');
    for (const ord of orders) {
      const orderRef = db.collection('donHang').doc(ord.id);
      const dbOrder = {
        ...ord,
        createdBy: 'system',
        createdByName: 'System Seed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        nextMaintenanceDate: admin.firestore.Timestamp.fromDate(new Date(ord.createdAt.toDate().getTime() + 180 * 24 * 60 * 60 * 1000))
      };
      batch.set(orderRef, dbOrder);

      // Nhật ký
      batch.set(db.collection('nhatKyHoatDong').doc(), {
        action: 'Tạo đơn hàng tự động',
        module: 'Đơn hàng',
        targetId: ord.id,
        userEmail: 'system@aquacare.vn',
        userName: 'System Master Seed',
        timestamp: ord.createdAt,
        details: { client: ord.customerName, amount: ord.totalAmount }
      });

      // Tạo Invoices cho Đơn Hàng đã Paid
      if (ord.status === 'paid') {
        const invoiceId = `INV-${ord.id.slice(-6).toUpperCase()}`;
        batch.set(db.collection('invoices').doc(invoiceId), {
          invoiceNumber: invoiceId,
          orderId: ord.id,
          customerName: ord.customerName,
          customerPhone: ord.phoneNumber,
          amount: ord.totalAmount,
          paymentMethod: 'COD',
          paymentStatus: 'paid',
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
          items: ord.items || [],
          isSeedData: true
        });
      }

      // Tạo Devices cho Đơn Lắp Đặt đã hoàn tất
      if ((ord.status === 'completed' || ord.status === 'paid') && ord.orderType === 'installation') {
        for (const item of ord.items) {
          if (item.thoiGianBaoHanh > 0) {
            for (let q = 0; q < item.quantity; q++) {
              const deviceId = `DEV-${ord.id.slice(-3)}-${item.id.slice(-3)}-${q}`;
              const deviceRef = db.collection('devices').doc(deviceId);
              
              // Xác định thời gian lắp đặt thực tế (dựa vào lịch hẹn)
              const installDate = ord.scheduledDate ? ord.scheduledDate.toDate() : new Date();
              if (ord.scheduledDate) installDate.setHours(installDate.getHours() + 1); // Hoàn thành 1 tiếng sau lịch hẹn

              const warrantyUntil = new Date(installDate);
              warrantyUntil.setMonth(installDate.getMonth() + item.thoiGianBaoHanh);

              batch.set(deviceRef, {
                id: deviceId,
                did: deviceId,
                order_id: ord.id,
                customer_id: ord.phoneNumber, // Hoặc uid của khách nếu có map
                customer_name: ord.customerName,
                customer_phone: ord.phoneNumber,
                product_id: item.id,
                product_name: item.name,
                serial_number: `SN-${ord.id.slice(-4)}-${q}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                install_date: admin.firestore.Timestamp.fromDate(installDate),
                warranty_until: admin.firestore.Timestamp.fromDate(warrantyUntil),
                status: 'active', // Tình trạng: đang hoạt động bình thường
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
                notes: `Máy mới tinh, đã lắp đặt và test nước ổn định. Kích hoạt bảo hành từ đơn ${ord.id}`
              });

              batch.set(deviceRef.collection('history').doc(), {
                event: 'installed',
                description: `Thiết bị #${q+1} lắp đặt hoàn tất, kiểm tra chạy ổn định và bàn giao cho khách hàng (Trạng thái: Hoạt động)`,
                performed_by: ord.technicians?.[0]?.id || 'system',
                performed_by_name: ord.technicians?.[0]?.name || 'Hệ thống',
                performed_at: admin.firestore.Timestamp.fromDate(installDate)
              });
            }
          }
        }
      }
    }

    // 5. Seed Thiết bị cần bảo trì (Maintenance Due)
    console.log('📦 Đang tạo Thiết bị đến hạn bảo trì...');
    for (let i = 1; i <= 3; i++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 6); // Lắp 6 tháng trước
      oldDate.setDate(oldDate.getDate() - Math.floor(Math.random() * 5));

      const warrantyUntil = new Date(oldDate);
      warrantyUntil.setMonth(oldDate.getMonth() + p.thoiGianBaoHanh);

      const deviceId = `DEV-OLD-00${i}`;
      const deviceRef = db.collection('devices').doc(deviceId);
      
      batch.set(deviceRef, {
        id: deviceId,
        did: deviceId,
        order_id: `ORD-LEGACY-00${i}`,
        customer_id: `090123400${i}`,
        customer_name: `Khách hàng cũ ${i}`,
        customer_phone: `090123400${i}`,
        product_id: p.id,
        product_name: p.tenSanPham,
        serial_number: `SN-OLD-${i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        install_date: admin.firestore.Timestamp.fromDate(oldDate),
        warranty_until: admin.firestore.Timestamp.fromDate(warrantyUntil),
        status: 'maintenance_due', // Tình trạng: Đến hạn bảo trì
        created_at: admin.firestore.Timestamp.fromDate(oldDate),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Máy đã lắp từ 6 tháng trước. Hiện tại đã đến hạn bảo trì/thay lõi lọc.`
      });

      batch.set(deviceRef.collection('history').doc(), {
        event: 'installed',
        description: `Thiết bị lắp đặt hoàn tất (dữ liệu cũ)`,
        performed_by: 'system',
        performed_by_name: 'Hệ thống',
        performed_at: admin.firestore.Timestamp.fromDate(oldDate)
      });
      
      batch.set(deviceRef.collection('history').doc(), {
        event: 'status_changed',
        description: `Hệ thống tự động chuyển trạng thái sang "Cần bảo trì" sau 6 tháng hoạt động`,
        performed_by: 'system',
        performed_by_name: 'Hệ thống',
        performed_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    console.log('✨ THÀNH CÔNG: Toàn bộ dữ liệu Master đã được đồng bộ lên Firebase!');
    console.log('👉 Các thiết bị đã xuất hiện trong Quản lý Bảo hành. Các KTV và Khách hàng có thể đăng nhập.');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

seedMaster();
