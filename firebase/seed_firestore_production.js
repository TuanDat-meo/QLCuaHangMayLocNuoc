// firebase/seed_firestore_production.js
// Seed production Firestore with data matching firestore_collections.dart
// Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node seed_firestore_production.js <project_id>

const admin = require('firebase-admin');
const path = require('path');

const projectId = process.argv[2] || process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('❌ Error: PROJECT_ID required. Usage: node seed_firestore_production.js <project_id>');
  process.exit(1);
}

console.log('🔥 Initializing Firebase Admin SDK for project:', projectId);

// Initialize Firebase Admin SDK (requires GOOGLE_APPLICATION_CREDENTIALS)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();
const firestore = admin.firestore.FieldValue;

// ════════════════════════════════════════════════════════════════════
// FIRESTORE_COLLECTIONS.DART DATA STRUCTURE
// ════════════════════════════════════════════════════════════════════

const collectionsData = {
  // ─────────────────────────────────────────────────────────────
  // DANH MUC (Categories)
  // ─────────────────────────────────────────────────────────────
  danhMuc: [
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
  ],

  // ─────────────────────────────────────────────────────────────
  // SAN PHAM (Products) - Mẫu
  // ─────────────────────────────────────────────────────────────
  sanPham: [
    {
      tenSanPham: 'Máy lọc nước RO Karofi K7',
      thuongHieu: 'Karofi',
      sku: 'RO-K7-2024',
      moTa: 'Máy lọc nước RO 7 cấp công nghệ Nhật - Tích hợp UV',
      giaBan: 4500000,
      giaLapDat: 500000,
      thongSoKyThuat: {
        congSuat: '60L/h',
        ap: '1-6 bar',
        heatVaSmell: 'RO 100% + UV',
      },
      phuKienDiKem: ['Bộ lọc nước RO', 'Đầu vòi nước', 'Ống dẫn nước'],
      soLuongTon: 50,
      nguongCanhBao: 10,
      trangThai: 'active',
      danhMucId: '', // Will be updated after category seeding
    },
    {
      tenSanPham: 'Máy lọc nước UV Kangaroo KG100',
      thuongHieu: 'Kangaroo',
      sku: 'UV-KG100-2024',
      moTa: 'Máy lọc nước UV loại bỏ 99% vi khuẩn',
      giaBan: 2500000,
      giaLapDat: 300000,
      thongSoKyThuat: {
        congSuat: '30L/h',
        apLight: '6W UV',
      },
      phuKienDiKem: ['Bộ lọc carbon', 'Bóng đèn UV'],
      soLuongTon: 30,
      nguongCanhBao: 5,
      trangThai: 'active',
      danhMucId: '',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // NHA CUNG CAP (Suppliers)
  // ─────────────────────────────────────────────────────────────
  nhaCungCap: [
    {
      tenNCC: 'Công ty Karofi',
      soDienThoai: '0212345678',
      email: 'contact@karofi.com.vn',
      diaChiNCC: 'HCM, Vietnam',
      trangThai: 'active',
    },
    {
      tenNCC: 'Công ty Kangaroo',
      soDienThoai: '0223456789',
      email: 'sales@kangaroo.vn',
      diaChiNCC: 'Biên Hòa, Vietnam',
      trangThai: 'active',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // THONG BAO (Notifications) - Empty, created dynamically
  // ─────────────────────────────────────────────────────────────
  thongBao: [],

  // ─────────────────────────────────────────────────────────────
  // DANH GIA (Reviews) - Empty, created by users
  // ─────────────────────────────────────────────────────────────
  danhGia: [],

  // ─────────────────────────────────────────────────────────────
  // NHAT KY HOAT DONG (Activity Logs) - Empty, created on user action
  // ─────────────────────────────────────────────────────────────
  nhatKyHoatDong: [],

  // ─────────────────────────────────────────────────────────────
  // BANNER (Promotional Banners)
  // ─────────────────────────────────────────────────────────────
  banner: [
    {
      title: 'Máy lọc nước cao cấp - Giảm 20%',
      image: 'https://via.placeholder.com/1200x300?text=Banner+1',
      link: '/products?category=may-loc-nuoc',
      trangThai: 'active',
      thuTuHienThi: 1,
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ════════════════════════════════════════════════════════════════════

async function clearAllCollections() {
  console.log('\n🗑️  Clearing all existing collections...');
  const collections = [
    'danhMuc',
    'sanPham',
    'nhaCungCap',
    'thongBao',
    'danhGia',
    'nhatKyHoatDong',
    'banner',
    'nguoiDung',
    'donHang',
    'thietBi',
  ];

  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).get();
      if (snapshot.size === 0) {
        console.log(`  ✓ ${collection}: (empty)`);
        continue;
      }

      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`  ✓ ${collection}: deleted ${snapshot.size} docs`);
    } catch (error) {
      console.log(`  ⚠️  ${collection}: ${error.message}`);
    }
  }
  console.log('✅ All collections cleared\n');
}

async function seedCollection(collectionName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️  ${collectionName}: (skipped - no data)`);
    return [];
  }

  console.log(`📝 Seeding ${collectionName}...`);
  const docIds = [];

  for (const item of data) {
    const docRef = db.collection(collectionName).doc();
    const docData = {
      ...item,
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    };
    await docRef.set(docData);
    docIds.push(docRef.id);
    console.log(`  ✓ Added: ${docData.tenSanPham || docData.ten || docData.tenNCC || 'Doc'} (${docRef.id})`);
  }

  console.log(`✅ ${collectionName}: ${data.length} docs seeded\n`);
  return docIds;
}

async function seedProducts(categoryIds) {
  console.log('📦 Seeding sản phẩm with category references...');
  
  // Update products with actual category IDs
  const productsWithCategories = collectionsData.sanPham.map((product, index) => ({
    ...product,
    danhMucId: categoryIds[index % categoryIds.length],
  }));

  const docIds = [];
  for (const product of productsWithCategories) {
    const docRef = db.collection('sanPham').doc();
    const docData = {
      ...product,
      ngayTao: firestore.serverTimestamp(),
      ngayCapNhat: firestore.serverTimestamp(),
    };
    await docRef.set(docData);
    docIds.push(docRef.id);
    console.log(`  ✓ ${product.tenSanPham} → danhMucId: ${product.danhMucId}`);
  }

  console.log(`✅ sanPham: ${productsWithCategories.length} docs seeded\n`);
  return docIds;
}

// ════════════════════════════════════════════════════════════════════
// MAIN SEEDING PROCESS
// ════════════════════════════════════════════════════════════════════

async function main() {
  try {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🌱 SEEDING PRODUCTION FIRESTORE DATA');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`Project ID: ${projectId}\n`);

    // 1. Clear existing data
    await clearAllCollections();

    // 2. Seed categories first
    const categoryIds = await seedCollection('danhMuc', collectionsData.danhMuc);

    // 3. Seed products with category references
    await seedProducts(categoryIds);

    // 4. Seed suppliers
    await seedCollection('nhaCungCap', collectionsData.nhaCungCap);

    // 5. Seed banners
    await seedCollection('banner', collectionsData.banner);

    console.log('════════════════════════════════════════════════════════════════');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`  • danhMuc: ${collectionsData.danhMuc.length} docs`);
    console.log(`  • sanPham: ${collectionsData.sanPham.length} docs`);
    console.log(`  • nhaCungCap: ${collectionsData.nhaCungCap.length} docs`);
    console.log(`  • banner: ${collectionsData.banner.length} docs`);
    console.log(`  • Collections ready: nguoiDung, donHang, thietBi, thongBao (created on demand)\n`);

    console.log('🔗 Verify data at: https://console.firebase.google.com/project/' + projectId + '/firestore/data\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
