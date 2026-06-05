/**
 * Script sửa lỗi Authentication & đổi UID cho KTV Nguyễn Hoàng Nam
 * 
 * Mục tiêu:
 * 1. Đổi UID của tài khoản nam.tech@aquacare.vn thành 'tech_01' để khớp với dữ liệu phân công đơn hàng trong các seed khác.
 * 2. Xóa tài khoản cũ có UID 'SEED-TECH-01' khỏi Authentication và Firestore.
 * 3. Tạo/Cập nhật tài khoản Auth mới với UID 'tech_01', email 'nam.tech@aquacare.vn', mật khẩu 'abc@123'.
 * 4. Đồng bộ Firestore: Tạo tài liệu 'nguoiDung/tech_01' và xóa tài liệu 'nguoiDung/SEED-TECH-01'.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';
const TARGET_EMAIL = 'nam.tech@aquacare.vn';
const TARGET_UID = 'tech_01';
const OLD_UID = 'SEED-TECH-01';
const PASSWORD = 'abc@123';

// 1. Tìm key file JSON để khởi tạo Firebase Admin
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f =>
  f.endsWith('.json') &&
  !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f)
);

if (!keyFile) {
  console.error('❌ LỖI: Không tìm thấy file JSON chứng thực trong thư mục firebase/');
  process.exit(1);
}

const serviceAccount = require(path.join(__dirname, keyFile));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function fixAndChangeUID() {
  console.log(`\n==================================================`);
  console.log(`🔧 Bắt đầu cấu hình UID 'tech_01' cho ${TARGET_EMAIL}`);
  console.log(`==================================================\n`);

  try {
    // Bước 1: Xóa tài khoản Auth cũ theo email (nếu tồn tại) để tránh xung đột email trùng
    try {
      const userByEmail = await auth.getUserByEmail(TARGET_EMAIL);
      console.log(`🗑️  Phát hiện tài khoản Auth hiện tại (${userByEmail.email}, UID: ${userByEmail.uid}). Đang xóa...`);
      await auth.deleteUser(userByEmail.uid);
      console.log(`✅ Đã xóa tài khoản Auth trùng email.`);
    } catch (err) {
      if (err.code !== 'auth/user-not-found') throw err;
    }

    // Bước 2: Xóa tài khoản Auth cũ có UID 'SEED-TECH-01' (nếu tồn tại)
    try {
      console.log(`🗑️  Kiểm tra và xóa tài khoản Auth cũ có UID: ${OLD_UID}...`);
      await auth.deleteUser(OLD_UID);
      console.log(`✅ Đã xóa tài khoản Auth cũ có UID ${OLD_UID}.`);
    } catch (err) {
      if (err.code !== 'auth/user-not-found') {
        console.log(`ℹ️  Không tìm thấy tài khoản Auth với UID: ${OLD_UID}. Bỏ qua.`);
      }
    }

    // Bước 3: Tạo tài khoản Auth mới với UID 'tech_01'
    console.log(`➕ Đang tạo tài khoản Auth mới với UID: ${TARGET_UID}...`);
    await auth.createUser({
      uid: TARGET_UID,
      email: TARGET_EMAIL,
      password: PASSWORD,
      displayName: 'Nguyễn Hoàng Nam',
    });
    console.log(`✅ Tạo tài khoản Auth thành công!`);

    // Bước 4: Chuyển dữ liệu trong Firestore từ 'SEED-TECH-01' sang 'tech_01'
    const oldDocRef = db.collection('nguoiDung').doc(OLD_UID);
    const newDocRef = db.collection('nguoiDung').doc(TARGET_UID);
    
    const oldDoc = await oldDocRef.get();
    let techData = {
      displayName: 'Nguyễn Hoàng Nam',
      email: TARGET_EMAIL,
      phoneNumber: '0912345678',
      role: 4,
      vaiTro: 'technician',
      source: 'admin_web',
      status: 'active',
      isVerified: true,
    };

    if (oldDoc.exists) {
      console.log(`📄 Tìm thấy dữ liệu cũ tại Firestore: nguoiDung/${OLD_UID}`);
      techData = { ...techData, ...oldDoc.data() };
      
      // Xóa tài liệu cũ
      console.log(`🗑️  Đang xóa tài liệu Firestore cũ: nguoiDung/${OLD_UID}...`);
      await oldDocRef.delete();
      console.log(`✅ Đã xóa tài liệu Firestore cũ.`);
    }

    // Thiết lập tài liệu mới với UID chính xác
    techData.uid = TARGET_UID;
    console.log(`✍️  Đang ghi tài liệu Firestore mới: nguoiDung/${TARGET_UID}...`);
    await newDocRef.set({
      ...techData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`✅ Đã ghi tài liệu Firestore mới.`);

    console.log(`\n==================================================`);
    console.log(`🎉 HOÀN THÀNH ĐỔI UID SANG 'tech_01'!`);
    console.log(`   Email đăng nhập: ${TARGET_EMAIL}`);
    console.log(`   Mật khẩu: ${PASSWORD}`);
    console.log(`   UID trong Auth & Firestore: ${TARGET_UID}`);
    console.log(`==================================================\n`);

  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error.message);
  } finally {
    process.exit(0);
  }
}

fixAndChangeUID();
