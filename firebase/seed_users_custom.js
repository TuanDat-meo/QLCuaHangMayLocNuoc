// firebase/seed_users_custom.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Script seed người dùng theo yêu cầu cụ thể
 * 1. Admin: nguyenhoangtuandat0608@gmail.com / TuanDat@0608
 * 2. Admin: lethanhlong0102@gmail.com / abc@123
 * 3. Các tài khoản khác / abc@123
 */

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
    console.error('❌ LỖI: Không tìm thấy file JSON chứng thực trong thư mục firebase/');
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

const usersToSeed = [
  {
    email: 'nguyenhoangtuandat0608@gmail.com',
    password: 'TuanDat@0608',
    displayName: 'Nguyễn Hoàng Tuấn Đạt',
    phoneNumber: '+84900000001',
    role: 1, // ADMIN
    status: 'active',
    source: 'admin_web'
  },
  {
    email: 'lethanhlong0102@gmail.com',
    password: 'abc@123',
    displayName: 'Lê Thành Long',
    phoneNumber: '+84900000002',
    role: 1, // ADMIN
    status: 'active',
    source: 'admin_web'
  },
  {
    email: 'huyy5725@gmail.com',
    password: 'abc@123',
    displayName: 'Huy Nguyễn',
    phoneNumber: '+84987654321',
    role: 5, // CUSTOMER
    status: 'active',
    source: 'customer_app'
  },
  {
    email: 'staff01@aquacare.vn',
    password: 'abc@123',
    displayName: 'Nhân viên 01',
    phoneNumber: '+84911111111',
    role: 3, // STAFF
    status: 'active',
    source: 'admin_web'
  },
  {
    email: 'tech01@aquacare.vn',
    password: 'abc@123',
    displayName: 'Kỹ thuật viên 01',
    phoneNumber: '+84922222222',
    role: 4, // TECHNICIAN
    status: 'active',
    source: 'technician_app'
  }
];

async function seedUsers() {
  console.log('🌱 Bắt đầu tạo/cập nhật dữ liệu người dùng...\n');

  for (const user of usersToSeed) {
    try {
      let authUser;
      try {
        authUser = await auth.getUserByEmail(user.email);
        console.log(`⏭️  Tài khoản ${user.email} đã tồn tại. Đang cập nhật mật khẩu & thông tin...`);

        await auth.updateUser(authUser.uid, {
          password: user.password,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber
        });
      } catch (err) {
        authUser = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
        });
        console.log(`✅ Đã tạo mới Auth: ${user.email}`);
      }

      // Đồng bộ vào Firestore (collection: nguoiDung)
      const { password, ...firestoreData } = user;
      await db.collection('nguoiDung').doc(authUser.uid).set({
        ...firestoreData,
        uid: authUser.uid,
        isVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`✅ Đã đồng bộ Firestore: ${user.displayName} (Role: ${user.role})`);
    } catch (error) {
      console.error(`❌ Lỗi xử lý tài khoản ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Hoàn tất!');
  process.exit(0);
}

seedUsers();
