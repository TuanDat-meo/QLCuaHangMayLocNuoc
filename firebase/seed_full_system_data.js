/**
 * SCRIPT SEED DỮ LIỆU TOÀN DIỆN HỆ THỐNG AQUACARE - PHIÊN BẢN V6 (HOÀN THIỆN ĐỒNG BỘ)
 * Cấu trúc: Nhà cung cấp -> Sản phẩm -> Đơn hàng -> Thiết bị & Bảo hành (theo số lượng)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

// 1. Khởi tạo Firebase Admin
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.endsWith('.json') && !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f));
if (!keyFile) {
  console.error('❌ Không tìm thấy file JSON chứng thực trong thư mục firebase/');
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

// ══════════════════════════════════════════════════════════════
// 2. DỮ LIỆU NHÀ CUNG CẤP (suppliers)
// ══════════════════════════════════════════════════════════════
const suppliers = [
  { id: 'sup_karofi', name: 'TẬP ĐOÀN KAROFI VIỆT NAM', phone: '19006418', email: 'info@karofi.com', status: 'Active' },
  { id: 'sup_kangaroo', name: 'TẬP ĐOÀN GIA DỤNG KANGAROO', phone: '1900555566', email: 'contact@kangaroo.vn', status: 'Active' },
  { id: 'sup_aosmith', name: 'A. O. SMITH VIETNAM', phone: '18001228', email: 'hotline@aosmith.com.vn', status: 'Active' }
];

// ══════════════════════════════════════════════════════════════
// 3. DỮ LIỆU SẢN PHẨM (sanPham)
// ══════════════════════════════════════════════════════════════
const products = [
  { id: 'prod_ka_k9i', tenSanPham: 'Máy lọc nước Karofi K9I-1', sku: 'KA-K9I', giaBan: 5490000, tonKho: 12, thoiGianBaoHanh: 24, trangThai: 'Active' },
  { id: 'prod_ka_l612', tenSanPham: 'Karofi Livotec 612', sku: 'KA-L612', giaBan: 5890000, tonKho: 18, thoiGianBaoHanh: 24, trangThai: 'Active' },
  { id: 'prod_kg_10a3', tenSanPham: 'Kangaroo KG10A3 Nóng Lạnh', sku: 'KG-10A3', giaBan: 6990000, tonKho: 8, thoiGianBaoHanh: 12, trangThai: 'Active' },
  { id: 'prod_loi_123_ka', tenSanPham: 'Bộ 3 lõi lọc thô Karofi 1-2-3', sku: 'LL-KA-123', giaBan: 350000, tonKho: 120, thoiGianBaoHanh: 0, trangThai: 'Active' }
];

// ══════════════════════════════════════════════════════════════
// 4. DỮ LIỆU ĐƠN HÀNG (donHang)
// ══════════════════════════════════════════════════════════════
const orders = [
  {
    id: 'ORD-PROD-001',
    customerName: 'Anh Tuấn - Cầu Giấy',
    phoneNumber: '0912345678',
    address: 'Số 15 Duy Tân, Cầu Giấy, Hà Nội',
    productName: 'Karofi K9I-1',
    totalAmount: 5490000,
    status: 'completed',
    orderType: 'installation',
    technicians: [{ id: 'tech_01', name: 'Lê Hoàng Nam', phone: '0912345678' }],
    items: [{ id: 'prod_ka_k9i', name: 'Máy lọc nước Karofi K9I-1', price: 5490000, quantity: 1, thoiGianBaoHanh: 24 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T09:00:00'))
  },
  {
    id: 'ORD-PROD-002',
    customerName: 'Cửa hàng Cafe Highland',
    phoneNumber: '0988222333',
    address: 'Tầng 1 Lotte Center, Liễu Giai, Hà Nội',
    productName: 'Kangaroo KG10A3 (x2)',
    totalAmount: 13980000,
    status: 'completed',
    orderType: 'installation',
    technicians: [{ id: 'tech_02', name: 'Nguyễn Văn Đức', phone: '0987654321' }],
    items: [{ id: 'prod_kg_10a3', name: 'Kangaroo KG10A3 Nóng Lạnh', price: 6990000, quantity: 2, thoiGianBaoHanh: 12 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-10T14:30:00'))
  },
  {
    id: 'ORD-PROD-003',
    customerName: 'Bác Hùng - Ba Đình',
    phoneNumber: '0904111222',
    address: 'Số 5 Phố Đội Cấn, Ba Đình, Hà Nội',
    productName: 'Thay lõi Karofi 1-2-3',
    totalAmount: 350000,
    status: 'paid',
    orderType: 'maintenance',
    technicians: [{ id: 'tech_01', name: 'Lê Hoàng Nam', phone: '0912345678' }],
    items: [{ id: 'prod_loi_123_ka', name: 'Bộ 3 lõi lọc thô Karofi 1-2-3', price: 350000, quantity: 1, thoiGianBaoHanh: 0 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-05T08:00:00'))
  }
];

// ══════════════════════════════════════════════════════════════
// 5. HÀM THỰC THI SEED
// ══════════════════════════════════════════════════════════════
async function seedData() {
  console.log('\n🌱 ĐANG SEED DỮ LIỆU ĐƠN HÀNG & THIẾT BỊ BẢO HÀNH (V6)');
  console.log('════════════════════════════════════════════════════════════════');

  const batch = db.batch();

  // Seed Nhà cung cấp
  suppliers.forEach(s => batch.set(db.collection('suppliers').doc(s.id), { ...s, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));

  // Seed Sản phẩm
  products.forEach(p => batch.set(db.collection('sanPham').doc(p.id), { ...p, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));

  // Seed Đơn hàng và Thiết bị lắp đặt
  for (const ord of orders) {
    const orderRef = db.collection('donHang').doc(ord.id);
    const dbOrder = {
      ...ord,
      tenKhachHang: ord.customerName,
      diaChiGiaoHang: ord.address,
      tenSanPham: ord.productName,
      tongTien: ord.totalAmount,
      loaiDonHang: ord.orderType,
      trangThai: ord.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ngayBaoTriTiepTheo: admin.firestore.Timestamp.fromDate(new Date(ord.createdAt.toDate().getTime() + 180 * 24 * 60 * 60 * 1000))
    };
    batch.set(orderRef, dbOrder);

    // TỰ ĐỘNG TẠO THIẾT BỊ & BẢO HÀNH CHO ĐƠN LẮP ĐẶT ĐÃ HOÀN TẤT
    if ((ord.status === 'completed' || ord.status === 'paid') && ord.orderType === 'installation') {
      for (const item of ord.items) {
        if (item.thoiGianBaoHanh > 0) {
          // Tạo số lượng thiết bị tương ứng với item.quantity
          for (let q = 0; q < item.quantity; q++) {
            const deviceId = `DEV-${ord.id.slice(-3)}-${item.id.slice(-3)}-${q}`;
            const deviceRef = db.collection('devices').doc(deviceId);

            const installDate = ord.createdAt.toDate();
            const warrantyUntil = new Date(installDate);
            warrantyUntil.setMonth(installDate.getMonth() + item.thoiGianBaoHanh);

            const deviceData = {
              id: deviceId,
              did: deviceId,
              order_id: ord.id,
              customer_id: ord.phoneNumber,
              customer_name: ord.customerName,
              customer_phone: ord.phoneNumber,
              product_id: item.id,
              product_name: item.name,
              serial_number: `SN-${ord.id.slice(-4)}-${q}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              install_date: admin.firestore.Timestamp.fromDate(installDate),
              warranty_until: admin.firestore.Timestamp.fromDate(warrantyUntil),
              status: 'active',
              created_at: admin.firestore.FieldValue.serverTimestamp(),
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
              notes: `Kích hoạt bảo hành tự động ${item.thoiGianBaoHanh} tháng từ đơn hàng ${ord.id}`
            };

            batch.set(deviceRef, deviceData);

            // Thêm lịch sử lắp đặt
            const historyRef = deviceRef.collection('history').doc();
            batch.set(historyRef, {
              event: 'installed',
              description: `Thiết bị #${q+1} lắp đặt và kích hoạt bảo hành thành công`,
              performed_by: ord.technicians?.[0]?.id || 'system',
              performed_by_name: ord.technicians?.[0]?.name || 'Hệ thống',
              performed_at: admin.firestore.Timestamp.fromDate(installDate)
            });
          }
        }
      }
    }
  }
  console.log(` ✓ Đã chuẩn bị ${orders.length} Đơn hàng và các thiết bị liên quan`);

  try {
    await batch.commit();
    console.log('\n✨ THÀNH CÔNG! Dữ liệu đã được đồng bộ lên Firebase.');
    console.log('👉 Bây giờ các thiết bị đã xuất hiện trong mục Quản lý Bảo hành.');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
  } finally {
    process.exit(0);
  }
}

seedData();
