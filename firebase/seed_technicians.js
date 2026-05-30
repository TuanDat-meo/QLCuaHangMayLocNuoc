/**
 * Script Seed dữ liệu Kỹ thuật viên (KTV) cho hệ thống Aquacare
 * Role: 4 (TECHNICIAN)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

console.log('🚀 Đang khởi tạo dữ liệu mẫu cho Kỹ thuật viên (KTV)...');

// Tự động tìm file service account
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f =>
  f.endsWith('.json') &&
  !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f)
);

if (!keyFile) {
  console.error('\n❌ LỖI: Không tìm thấy file JSON chứng thực trong thư mục firebase/');
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

const technicians = [
  {
    uid: 'tech_hcm_001',
    displayName: 'Nguyễn Văn Hùng',
    email: 'hung.tech@aquacare.com',
    phoneNumber: '0901234567',
    role: 4,
    status: 'active',
    isAvailable: true,
    specializations: ['Lắp đặt', 'Sửa chữa máy RO'],
    khuVuc: 'Quận 1, TP.HCM',
    rating: 4.8,
    jobsCompleted: 15
  },
  {
    uid: 'tech_hcm_002',
    displayName: 'Trần Thanh Sơn',
    email: 'son.tech@aquacare.com',
    phoneNumber: '0902345678',
    role: 4,
    status: 'active',
    isAvailable: true,
    specializations: ['Bảo trì định kỳ', 'Thay lõi lọc'],
    khuVuc: 'Quận 7, TP.HCM',
    rating: 4.9,
    jobsCompleted: 22
  },
  {
    uid: 'tech_hn_001',
    displayName: 'Lê Hoàng Nam',
    email: 'nam.tech@aquacare.com',
    phoneNumber: '0912345678',
    role: 4,
    status: 'active',
    isAvailable: true,
    specializations: ['Xử lý nước công nghiệp', 'Lắp đặt'],
    khuVuc: 'Cầu Giấy, Hà Nội',
    rating: 4.7,
    jobsCompleted: 10
  },
  {
    uid: 'tech_ct_001',
    displayName: 'Phạm Minh Đức',
    email: 'duc.tech@aquacare.com',
    phoneNumber: '0939123456',
    role: 4,
    status: 'active',
    isAvailable: false,
    specializations: ['Sửa chữa board mạch', 'Máy lọc Nano'],
    khuVuc: 'Ninh Kiều, Cần Thơ',
    rating: 4.5,
    jobsCompleted: 8
  },
  {
    uid: 'tech_dn_001',
    displayName: 'Vũ Anh Tuấn',
    email: 'tuan.tech@aquacare.com',
    phoneNumber: '0987654321',
    role: 4,
    status: 'active',
    isAvailable: true,
    specializations: ['Tư vấn lắp đặt', 'Sửa chữa nhanh'],
    khuVuc: 'Hải Châu, Đà Nẵng',
    rating: 5.0,
    jobsCompleted: 30
  }
];

async function seedTechnicians() {
  try {
    const batch = db.batch();

    technicians.forEach((tech) => {
      const docRef = db.collection('nguoiDung').doc(tech.uid);
      batch.set(docRef, {
        ...tech,
        source: 'admin_web',
        isVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
    console.log(`\n✨ THÀNH CÔNG: Đã tạo ${technicians.length} kỹ thuật viên mẫu.`);
    console.log('👉 Các tài khoản này hiện đã có thể được chọn để phân công đơn hàng.');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
  } finally {
    process.exit(0);
  }
}

seedTechnicians();
