#!/usr/bin/env node

/**
 * Script kích hoạt tài khoản Admin cho hệ thống Aquacare (Phiên bản Role Số)
 * 1: Admin, 2: Manager, 3: Staff, 4: Technician, 5: Customer, 0: Pending
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

console.log('🚀 Đang chuẩn bị kích hoạt tài khoản Admin (Role Số)...');

const files = fs.readdirSync(__dirname);
const keyFile = files.find(f =>
  f.endsWith('.json') &&
  !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f)
);

if (!keyFile) {
  console.error('\n❌ LỖI: Không tìm thấy file JSON chứng thực trong thư mục firebase/');
  process.exit(1);
}

try {
  const serviceAccount = require(path.join(__dirname, keyFile));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
} catch (error) {
  console.error('❌ Lỗi khởi tạo Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function setAdmin() {
  // ==========================================================
  // THAY THÔNG TIN CỦA BẠN VÀO ĐÂY
  const adminUID = 'THAY_UID_CUA_BAN_TAI_DAY';
  const adminEmail = 'admin@aquacare.com';
  // ==========================================================

  if (adminUID === 'THAY_UID_CUA_BAN_TAI_DAY') {
    console.log('⚠️  CHÚ Ý: Bạn chưa điền UID của mình vào file.');
    process.exit(1);
  }

  try {
    console.log(`⚙️  Đang nâng cấp tài khoản ${adminEmail} lên Admin (Role: 1)...`);

    await db.collection('nguoiDung').doc(adminUID).set({
      uid: adminUID,
      email: adminEmail,
      role: 1,         // QUAN TRỌNG: Admin là số 1
      status: 'active',
      source: 'admin_web',
      isVerified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('\n✨ THÀNH CÔNG! Tài khoản của bạn đã được kích hoạt quyền Admin với Role số 1.');
    console.log('👉 Lưu ý: Trong Firestore, trường "role" phải là kiểu Number.');
  } catch (error) {
    console.error('❌ Lỗi cập nhật Database:', error.message);
  } finally {
    process.exit(0);
  }
}

setAdmin();
