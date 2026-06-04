// firebase/seed_firestore.js
// Seed Firestore with sample data for development

// SET EMULATOR HOST BEFORE IMPORTING FIREBASE
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const admin = require('firebase-admin');
const path = require('path');

console.log('🔥 Firestore Emulator Host:', process.env.FIRESTORE_EMULATOR_HOST);

// For emulator: minimal initialization (no credentials needed)
// Import file key vừa tải về
const serviceAccount = require('./serviceAccountKey.json'); 

// Khởi tạo kết nối với Firebase thật bằng credential
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}


const db = admin.firestore();
const firestore = admin.firestore.FieldValue;

async function clearAllCollections() {
  console.log('🗑️  Clearing all collections...');
  const collections = [
    'danhMuc',
    'sanPham',
    'nguoiDung',
    'donHang',
    'thietBi',
    'thongBao',
    'nhaCungCap',
  ];

  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
  console.log('✅ All collections cleared');
}

async function seedCategories() {
  console.log('📁 Seeding danh mục...');
  const categories = [
    {
      ten: 'Máy lọc nước',
      moTa: 'Các loại máy lọc nước RO, UV, lọc composite',
      icon: '💧',
      thuTuHienThi: 1,
    },
    {
      ten: 'Bộ lọc',
      moTa: 'Bộ lọc thay thế cho máy lọc nước',
      icon: '🔧',
      thuTuHienThi: 2,
    },
    {
      ten: 'Phụ kiện',
      moTa: 'Các phụ kiện kèm theo máy lọc',
      icon: '⚙️',
      thuTuHienThi: 3,
    },
  ];

  for (const cat of categories) {
    const docRef = db.collection('danhMuc').doc();
    await docRef.set({
      ...cat,
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);
}

async function seedProducts() {
  console.log('📦 Seeding sản phẩm...');
  const categories = await db.collection('danhMuc').limit(3).get();
  const categoryIds = categories.docs.map(doc => doc.id);

  const products = [
    {
      tenSanPham: 'Máy lọc nước RO Karofi K7',
      thuongHieu: 'Karofi',
      sku: 'RO-K7-2024',
      moTa: 'Máy lọc nước RO 7 cấp công nghệ Nhật',
      giaBan: 4500000,
      giaLapDat: 500000,
      soLuongTon: 50,
      nguongCanhBao: 10,
      trangThai: 'active',
      danhMucId: categoryIds[0] || 'cat-1',
    },
    {
      tenSanPham: 'Máy lọc nước UV Kangaroo',
      thuongHieu: 'Kangaroo',
      sku: 'UV-KG-2024',
      moTa: 'Máy lọc nước UV tiệt khuẩn cao cấp',
      giaBan: 3500000,
      giaLapDat: 400000,
      soLuongTon: 30,
      nguongCanhBao: 5,
      trangThai: 'active',
      danhMucId: categoryIds[0] || 'cat-1',
    },
    {
      tenSanPham: 'Bộ lọc RO 5 cấp',
      thuongHieu: 'Generic',
      sku: 'FILTER-RO5-2024',
      moTa: 'Bộ lọc thay thế cho máy lọc nước RO',
      giaBan: 250000,
      giaLapDat: 50000,
      soLuongTon: 200,
      nguongCanhBao: 50,
      trangThai: 'active',
      danhMucId: categoryIds[1] || 'cat-2',
    },
  ];

  for (const prod of products) {
    const docRef = db.collection('sanPham').doc();
    await docRef.set({
      ...prod,
      danhSachAnh: [
        'https://via.placeholder.com/400',
        'https://via.placeholder.com/400',
      ],
      thongSoKyThuat: {
        doBen: '5 sao',
        thoiGianBaoHanh: '12 tháng',
      },
      phuKienDiKem: ['Đầu vòi', 'Van cấp'],
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    });
  }
  console.log(`✅ ${products.length} products seeded`);
}

async function seedUsers() {
  console.log('👥 Seeding người dùng...');
  const users = [
    {
      uid: 'admin-001',
      hoTen: 'Nguyễn Văn Admin',
      email: 'admin@aquacare.local',
      soDienThoai: '0912000001',
      vaiTro: 'admin',
      trangThai: 'active',
      fcmToken: 'fcm_token_admin_001',
    },
    {
      uid: 'tech-001',
      hoTen: 'Trần Văn Kỹ Thuật',
      email: 'technician1@aquacare.local',
      soDienThoai: '0912111111',
      vaiTro: 'technician',
      trangThai: 'active',
      khuVuc: 'TP.HCM',
      fcmToken: 'fcm_token_tech_001',
    },
    {
      uid: 'tech-002',
      hoTen: 'Lê Văn KTV 2',
      email: 'technician2@aquacare.local',
      soDienThoai: '0912222222',
      vaiTro: 'technician',
      trangThai: 'active',
      khuVuc: 'Hà Nội',
      fcmToken: 'fcm_token_tech_002',
    },
    {
      uid: 'customer-001',
      hoTen: 'Phạm Thị Khách Hàng',
      email: 'customer1@aquacare.local',
      soDienThoai: '0913111111',
      vaiTro: 'customer',
      trangThai: 'active',
      fcmToken: 'fcm_token_customer_001',
    },
    {
      uid: 'customer-002',
      hoTen: 'Huynèee',
      email: 'huyy5725@gmail.com',
      soDienThoai: '0947271643',
      vaiTro: 'customer',
      trangThai: 'active',
      fcmToken: 'fcm_token_customer_002',
    },
  ];

  for (const user of users) {
    await db.collection('nguoiDung').doc(user.uid).set({
      ...user,
      anhDaiDien: 'https://via.placeholder.com/200',
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    });
  }
  console.log(`✅ ${users.length} users seeded`);
}

async function seedOrders() {
  console.log('📋 Seeding đơn hàng...');
  const customers = await db.collection('nguoiDung')
    .where('vaiTro', '==', 'customer')
    .get();
  const technicians = await db.collection('nguoiDung')
    .where('vaiTro', '==', 'technician')
    .get();
  const products = await db.collection('sanPham').limit(2).get();

  if (customers.empty) {
    console.log('⚠️  No customers found, skipping orders');
    return;
  }

  const customer = customers.docs[0];
  const technician = technicians.docs[0];
  const product = products.docs[0];

  const orders = [
    {
      maDonHang: 'DH-2024-001',
      khachHangId: customer.id,
      tenKhachHang: customer.data().hoTen,
      soDienThoai: customer.data().soDienThoai,
      danhSachSanPham: [
        {
          sanPhamId: product.id,
          tenSanPham: product.data().tenSanPham,
          soLuong: 1,
          giaBan: product.data().giaBan,
        },
      ],
      tongTien: product.data().giaBan + 500000,
      diaChi: '123 Đường ABC, Quận 1, TP.HCM',
      gioHen: new Date('2024-04-20T09:00:00'),
      trangThai: 'cho_xn',
      kyThuatVienId: technician?.id || null,
      tenKyThuatVien: technician?.data().hoTen || null,
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    },
  ];

  for (const order of orders) {
    const docRef = db.collection('donHang').doc();
    await docRef.set(order);
  }
  console.log(`✅ ${orders.length} orders seeded`);
}

async function seedNotifications() {
  console.log('🔔 Seeding thông báo...');
  const users = await db.collection('nguoiDung').limit(2).get();

  const notifications = [];
  for (const user of users.docs) {
    notifications.push({
      nguoiNhanId: user.id,
      tieuDe: 'Chào mừng đến AquaCareSystem',
      noiDung: 'Hệ thống quản lý dịch vụ nước được cải thiện',
      loai: 'he_thong',
      daDoc: false,
      ngayTao: firestore.serverTimestamp(),
    });
  }

  for (const notif of notifications) {
    await db.collection('thongBao').doc().set(notif);
  }
  console.log(`✅ ${notifications.length} notifications seeded`);
}

async function seedAuthUsers() {
  console.log('🔐 Seeding Firebase Auth users...');
  const auth = admin.auth();
  
  // Default password for all test users
  const defaultPassword = 'Admin@123456';
  
  const users = [
    {
      uid: 'admin-001',
      email: 'admin@aquacare.local',
      displayName: 'Nguyễn Văn Admin',
      password: defaultPassword,
    },
    {
      uid: 'tech-001',
      email: 'technician1@aquacare.local',
      displayName: 'Trần Văn Kỹ Thuật',
      password: defaultPassword,
    },
    {
      uid: 'tech-002',
      email: 'technician2@aquacare.local',
      displayName: 'Lê Văn KTV 2',
      password: defaultPassword,
    },
    {
      uid: 'customer-001',
      email: 'customer1@aquacare.local',
      displayName: 'Phạm Thị Khách Hàng',
      password: defaultPassword,
    },
    {
      uid: 'customer-002',
      email: 'huynheee@aquacare.local',
      displayName: 'Huynèee',
      password: defaultPassword,
    },
  ];

  for (const user of users) {
    try {
      // Check if user already exists
      try {
        await auth.getUser(user.uid);
        console.log(`⏭️  User ${user.email} already exists, skipping`);
        continue;
      } catch (err) {
        // User doesn't exist, continue with creation
      }

      // Create user
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        password: user.password,
      });
      console.log(`✅ Created user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message);
    }
  }
  
  console.log(`\n📝 Auth Credentials for Testing:`);
  console.log(`   Email: admin@aquacare.local`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`   (Same for all test users)\n`);
}

async function main() {
  try {
    console.log('\n========================================');
    console.log('  🌱 Firestore Seed Script Started');
    console.log('========================================\n');

    await clearAllCollections();
    await seedCategories();
    await seedProducts();
    await seedUsers();
    await seedOrders();
    await seedNotifications();
    await seedAuthUsers();

    console.log('\n========================================');
    console.log('  ✨ Seeding Completed Successfully!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

main();
