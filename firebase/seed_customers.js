// firebase/seed_customers.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Script seed dữ liệu khách hàng mẫu cho hệ thống AquaCare
 * Bao gồm tài khoản: huyy5725@gmail.com / huy123
 */

// Kiểm tra môi trường Emulator hoặc Production
const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (isEmulator) {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'demo-aquacare-local' });
  }
  console.log('🚀 Đang chạy trên môi trường EMULATOR');
} else {
  const files = fs.readdirSync(__dirname);
  const keyFile = files.find(f =>
    f.endsWith('.json') &&
    !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f)
  );

  if (!keyFile) {
    console.error('❌ LỖI: Không tìm thấy file JSON chứng thực (serviceAccountKey.json) trong thư mục firebase/');
    process.exit(1);
  }

  const serviceAccount = require(path.join(__dirname, keyFile));
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log('🚀 Đang chạy trên môi trường PRODUCTION');
}

const db = admin.firestore();
const auth = admin.auth();

const customers = [
  {
    uid: 'huyy5725-id',
    email: 'huyy5725@gmail.com',
    password: 'huy123',
    displayName: 'Nguyễn Huy (huyy5725)',
    phoneNumber: '+84987654321', // Chỉnh lại định dạng E.164
    role: 5, // CUSTOMER
    status: 'active',
    source: 'customer_app'
  },
  {
    uid: 'cus-002',
    email: 'khachhang1@gmail.com',
    password: 'Password123',
    displayName: 'Trần Thị Mai',
    phoneNumber: '+84912345678',
    role: 5,
    status: 'active',
    source: 'customer_app'
  },
  {
    uid: 'cus-003',
    email: 'khachhang2@gmail.com',
    password: 'Password123',
    displayName: 'Lê Văn Tám',
    phoneNumber: '+84905123456',
    role: 5,
    status: 'active',
    source: 'customer_app'
  }
];

async function seedCustomers() {
  console.log('🌱 Bắt đầu tạo dữ liệu khách hàng...\n');

  for (const user of customers) {
    try {
      // 1. Tạo hoặc cập nhật user trong Firebase Auth
      let authUser;
      try {
        authUser = await auth.getUserByEmail(user.email);
        console.log(`⏭️  Tài khoản ${user.email} đã tồn tại trong Auth. Đang cập nhật...`);

        await auth.updateUser(authUser.uid, {
          password: user.password,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber
        });
      } catch (err) {
        authUser = await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
        });
        console.log(`✅ Đã tạo mới tài khoản Auth: ${user.email}`);
      }

      // 2. Đồng bộ thông tin vào Firestore (collection: nguoiDung)
      const { password, ...firestoreData } = user;
      await db.collection('nguoiDung').doc(authUser.uid).set({
        ...firestoreData,
        uid: authUser.uid,
        isVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`✅ Đã cập nhật profile Firestore cho: ${user.displayName}`);
    } catch (error) {
      console.error(`❌ Lỗi xử lý tài khoản ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Hoàn tất seed dữ liệu khách hàng!');
  process.exit(0);
}

seedCustomers();
