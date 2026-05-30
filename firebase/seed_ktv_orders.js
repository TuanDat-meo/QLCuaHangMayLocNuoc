/**
 * Script Seed Đơn hàng đã phân công cho KTV
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.endsWith('.json') && !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f));
const serviceAccount = require(path.join(__dirname, keyFile));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
}

const db = admin.firestore();

const sampleOrders = [
  {
    tenKhachHang: 'Nguyễn Thị Lan',
    phoneNumber: '0908112233',
    diaChiGiaoHang: '123 Lê Lợi, Quận 1, TP.HCM',
    tenSanPham: 'Máy lọc nước RO Karofi K7',
    tongTien: 4500000,
    trangThai: 'assigned', // Đã phân công
    loaiDonHang: 'install',
    technicianId: 'tech_hcm_001',
    technicianName: 'Nguyễn Văn Hùng',
    note: 'Khách muốn lắp trong buổi sáng',
  },
  {
    tenKhachHang: 'Lê Văn Tám',
    phoneNumber: '0912334455',
    diaChiGiaoHang: '456 Nguyễn Thị Thập, Quận 7, TP.HCM',
    tenSanPham: 'Thay bộ lõi lọc 1-2-3',
    tongTien: 450000,
    trangThai: 'processing', // Đang xử lý
    loaiDonHang: 'repair',
    technicianId: 'tech_hcm_002',
    technicianName: 'Trần Thanh Sơn',
    note: 'Máy có hiện tượng rò nước',
  },
  {
    tenKhachHang: 'Hoàng Anh Tuấn',
    phoneNumber: '0988776655',
    diaChiGiaoHang: '789 Xuân Thủy, Cầu Giấy, Hà Nội',
    tenSanPham: 'Máy lọc nước UV Kangaroo',
    tongTien: 3800000,
    trangThai: 'assigned',
    loaiDonHang: 'install',
    technicianId: 'tech_hn_001',
    technicianName: 'Lê Hoàng Nam',
    note: 'Chung cư tầng 15',
  }
];

async function seedKtvOrders() {
  console.log('📦 Đang tạo đơn hàng mẫu cho KTV...');
  try {
    const batch = db.batch();

    sampleOrders.forEach((order, index) => {
      const docRef = db.collection('donHang').doc(`order_ktv_test_00${index + 1}`);
      batch.set(docRef, {
        ...order,
        ngayTao: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ngayBaoTriTiepTheo: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))
      }, { merge: true });
    });

    await batch.commit();
    console.log('✨ Thành công! Các KTV giờ đây đã có đơn hàng trong danh sách công việc.');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

seedKtvOrders();
