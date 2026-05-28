/**
 * Script Seed dữ liệu Dashboard Admin - Phiên bản FIX 100% PERMISSION & INDEX
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

const files = fs.readdirSync(__dirname);
let keyFilePath = null;

for (const f of files) {
  if (f.endsWith('.json') && !['package.json', 'package-lock.json', 'firebase.json', 'firestore.indexes.json'].includes(f)) {
    try {
      const fullPath = path.join(__dirname, f);
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (content.project_id && content.private_key && content.client_email) {
        keyFilePath = fullPath;
        console.log(`✅ Đã tìm thấy file Service Account: ${f}`);
        break;
      }
    } catch (e) {}
  }
}

if (!keyFilePath) {
  console.error('❌ LỖI: Không tìm thấy file JSON Service Account chuẩn!');
  process.exit(1);
}

const serviceAccount = require(keyFilePath);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
}

const db = admin.firestore();

async function seed() {
  try {
    console.log('\n🧹 Đang dọn dẹp dữ liệu cũ (Giữ lại User Admin/Manager)...');
    const cols = ['donHang', 'nhatKyHoatDong', 'sanPham', 'nguoiDung', 'notifications'];
    for (const c of cols) {
      const snap = await db.collection(c).get();
      const batch = db.batch();
      snap.docs.forEach(d => {
        // KHÔNG xóa user có role 1, 2 để tránh mất quyền truy cập Dashboard
        if (c === 'nguoiDung' && d.data().role <= 2) return;
        batch.delete(d.ref);
      });
      await batch.commit();
    }

    console.log('🌱 Đang nạp dữ liệu Dashboard mới...');

    // 1. Seed Sản phẩm
    const products = [
      { name: 'Máy lọc RO Aquapro', stock: 15, threshold: 5, price: 5000000 },
      { name: 'Lõi lọc số 1', stock: 2, threshold: 10, price: 80000 }
    ];
    const pRefs = [];
    for (const p of products) {
      const res = await db.collection('sanPham').add({
        tenSanPham: p.name,
        soLuongTon: p.stock,
        nguongCanhBao: p.threshold,
        giaBan: p.price,
        trangThai: 'active',
        ngayTao: admin.firestore.FieldValue.serverTimestamp()
      });
      pRefs.push({ id: res.id, ...p });
    }

    // 2. Seed Đơn hàng (7 ngày qua)
    const now = new Date();
    for (let i = 0; i < 25; i++) {
      const dayOffset = Math.floor(Math.random() * 7);
      const orderDate = new Date();
      orderDate.setDate(now.getDate() - dayOffset);

      await db.collection('donHang').add({
        tenKhachHang: `Khách hàng ${Math.floor(Math.random() * 10) + 1}`,
        tenSanPham: pRefs[Math.floor(Math.random() * 2)].name,
        tongTien: 500000,
        trangThai: dayOffset === 0 ? 'pending' : 'completed',
        loaiDonHang: Math.random() > 0.8 ? 'maintenance' : 'installation',
        diaChiGiaoHang: 'Quận 1, TP. HCM',
        ngayTao: admin.firestore.Timestamp.fromDate(orderDate)
      });
    }

    // 3. Seed Thông báo
    await db.collection('notifications').add({
      title: 'Hệ thống đã cập nhật',
      message: 'Dữ liệu Dashboard đã được làm mới.',
      type: 'system',
      recipient_role: [1, 2],
      is_read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n✨ XONG! Dữ liệu đã sẵn sàng. Hãy click vào các link Index trong Console trình duyệt.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seed();
