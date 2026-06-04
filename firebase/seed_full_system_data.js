/**
 * SCRIPT SEED DỮ LIỆU TOÀN DIỆN HỆ THỐNG AQUACARE - PHIÊN BẢN V4 (LOGIC & CHUẨN HÓA)
 * Cấu trúc: Nhà cung cấp -> Phiếu nhập kho -> Sản phẩm -> Đơn hàng (KTV)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

// 1. Khởi tạo Firebase Admin
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

// ══════════════════════════════════════════════════════════════
// 2. DỮ LIỆU NHÀ CUNG CẤP (suppliers)
// ══════════════════════════════════════════════════════════════
const suppliers = [
  {
    id: 'sup_karofi',
    name: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    phone: '19006418',
    email: 'info@karofi.com',
    taxCode: '0106151056',
    address: '210 Lê Trọng Tấn, Thanh Xuân, Hà Nội',
    status: 'Active'
  },
  {
    id: 'sup_kangaroo',
    name: 'TẬP ĐOÀN GIA DỤNG KANGAROO',
    phone: '1900555566',
    email: 'contact@kangaroo.vn',
    taxCode: '0101452588',
    address: 'Tòa nhà Ocean Park, Số 1 Đào Duy Anh, Hà Nội',
    status: 'Active'
  },
  {
    id: 'sup_aosmith',
    name: 'A. O. SMITH VIETNAM',
    phone: '18001228',
    email: 'hotline@aosmith.com.vn',
    taxCode: '0106720054',
    address: 'Tòa nhà Ladeco, 266 Đội Cấn, Ba Đình, Hà Nội',
    status: 'Active'
  },
  {
    id: 'sup_sunhouse',
    name: 'TẬP ĐOÀN SUNHOUSE',
    phone: '18006680',
    email: 'info@sunhouse.com.vn',
    taxCode: '0101150428',
    address: 'Số 139 Nguyễn Thái Học, Ba Đình, Hà Nội',
    status: 'Active'
  }
];

// ══════════════════════════════════════════════════════════════
// 3. DỮ LIỆU SẢN PHẨM (sanPham)
// ══════════════════════════════════════════════════════════════
const products = [
  {
    id: 'prod_ka_k9i',
    tenSanPham: 'Máy lọc nước Karofi K9I-1',
    danhMuc: 'Máy lọc RO',
    nhaCungCap: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    sku: 'KA-K9I',
    giaBan: 5490000,
    tonKho: 12,
    trangThai: 'Active',
    moTa: '9 cấp lọc, màng RO thay nhanh Purifim chuẩn Mỹ',
    imageUrl: 'https://karofi.com/media/product/k9i.jpg'
  },
  {
    id: 'prod_ka_l612',
    tenSanPham: 'Karofi Livotec 612',
    danhMuc: 'Máy lọc RO',
    nhaCungCap: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    sku: 'KA-L612',
    giaBan: 5890000,
    tonKho: 18,
    trangThai: 'Active',
    moTa: 'Thiết kế Slim nhỏ gọn, 10 lõi lọc Smax'
  },
  {
    id: 'prod_kg_10a3',
    tenSanPham: 'Kangaroo KG10A3 Nóng Lạnh',
    danhMuc: 'Máy lọc RO',
    nhaCungCap: 'TẬP ĐOÀN GIA DỤNG KANGAROO',
    sku: 'KG-10A3',
    giaBan: 6990000,
    tonKho: 8,
    trangThai: 'Active',
    moTa: 'Tiện lợi với 2 vòi 3 chế độ nước'
  },
  {
    id: 'prod_kg_hydrogen',
    tenSanPham: 'Kangaroo Hydrogen KG100HU',
    danhMuc: 'Máy Ion Kiềm',
    nhaCungCap: 'TẬP ĐOÀN GIA DỤNG KANGAROO',
    sku: 'KG-100HU',
    giaBan: 8500000,
    tonKho: 5,
    trangThai: 'Active',
    moTa: 'Công nghệ tạo nước Hydrogen tốt cho sức khỏe'
  },
  {
    id: 'prod_as_z7',
    tenSanPham: 'AO Smith Z7',
    danhMuc: 'Máy lọc RO',
    nhaCungCap: 'A. O. SMITH VIETNAM',
    sku: 'AS-Z7',
    giaBan: 11500000,
    tonKho: 4,
    trangThai: 'Active',
    moTa: 'Hệ thống giám sát điện tử EMS 2.0'
  },
  {
    id: 'prod_sh_8811',
    tenSanPham: 'Sunhouse SHA8811K 10 lõi',
    danhMuc: 'Máy lọc RO',
    nhaCungCap: 'TẬP ĐOÀN SUNHOUSE',
    sku: 'SH-8811',
    giaBan: 4200000,
    tonKho: 15,
    trangThai: 'Active',
    moTa: 'Vỏ tủ kính cường lực tràn viền sang trọng'
  },
  {
    id: 'prod_loi_123_ka',
    tenSanPham: 'Bộ 3 lõi lọc thô Karofi 1-2-3',
    danhMuc: 'Lõi lọc',
    nhaCungCap: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    sku: 'LL-KA-123',
    giaBan: 350000,
    tonKho: 120,
    trangThai: 'Active'
  },
  {
    id: 'prod_loi_123_kg',
    tenSanPham: 'Bộ 3 lõi lọc thô Kangaroo 1-2-3',
    danhMuc: 'Lõi lọc',
    nhaCungCap: 'TẬP ĐOÀN GIA DỤNG KANGAROO',
    sku: 'LL-KG-123',
    giaBan: 300000,
    tonKho: 95,
    trangThai: 'Active'
  },
  {
    id: 'prod_mang_ro_50',
    tenSanPham: 'Màng lọc RO Filmtec 50GPD Mỹ',
    danhMuc: 'Linh kiện',
    nhaCungCap: 'A. O. SMITH VIETNAM',
    sku: 'RO-US-50',
    giaBan: 650000,
    tonKho: 40,
    trangThai: 'Active'
  },
  {
    id: 'prod_bom_24v',
    tenSanPham: 'Bơm tăng áp Headon 24V',
    danhMuc: 'Linh kiện',
    nhaCungCap: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    sku: 'PUMP-24V',
    giaBan: 550000,
    tonKho: 22,
    trangThai: 'Active'
  }
];

// ══════════════════════════════════════════════════════════════
// 4. DỮ LIỆU PHIẾU NHẬP KHO (importVouchers)
// ══════════════════════════════════════════════════════════════
const importVouchers = [
  {
    id: 'IMP-2024-001',
    supplierId: 'sup_karofi',
    supplierName: 'TẬP ĐOÀN KAROFI VIỆT NAM',
    totalAmount: 125000000,
    status: 'Completed',
    note: 'Nhập lô hàng đầu quý 1',
    importDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-10')),
    items: [
      { productId: 'prod_ka_k9i', productName: 'Máy lọc nước Karofi K9I-1', quantity: 20, importPrice: 3800000, sku: 'KA-K9I' },
      { productId: 'prod_ka_l612', productName: 'Karofi Livotec 612', quantity: 25, importPrice: 4100000, sku: 'KA-L612' },
      { productId: 'prod_loi_123_ka', productName: 'Bộ 3 lõi lọc thô Karofi 1-2-3', quantity: 150, importPrice: 180000, sku: 'LL-KA-123' }
    ],
    createdByName: 'Admin'
  },
  {
    id: 'IMP-2024-002',
    supplierId: 'sup_kangaroo',
    supplierName: 'TẬP ĐOÀN GIA DỤNG KANGAROO',
    totalAmount: 85000000,
    status: 'Completed',
    note: 'Nhập hàng máy Hydrogen',
    importDate: admin.firestore.Timestamp.fromDate(new Date('2024-02-15')),
    items: [
      { productId: 'prod_kg_10a3', productName: 'Kangaroo KG10A3 Nóng Lạnh', quantity: 15, importPrice: 4800000, sku: 'KG-10A3' },
      { productId: 'prod_kg_hydrogen', productName: 'Kangaroo Hydrogen KG100HU', quantity: 10, importPrice: 6200000, sku: 'KG-100HU' }
    ],
    createdByName: 'Admin'
  }
];

// ══════════════════════════════════════════════════════════════
// 5. DỮ LIỆU ĐƠN HÀNG (donHang)
// ══════════════════════════════════════════════════════════════
const orders = [
  {
    id: 'ORD-2024-001',
    customerName: 'Anh Tuấn - Cầu Giấy',
    phoneNumber: '0912345678',
    address: 'Số 15 Duy Tân, Cầu Giấy, Hà Nội',
    productName: 'Karofi K9I-1',
    totalAmount: 5490000,
    status: 'completed',
    orderType: 'installation',
    technicianId: 'tech_hn_001',
    technicianName: 'Lê Hoàng Nam',
    items: [{ id: 'prod_ka_k9i', name: 'Máy lọc nước Karofi K9I-1', price: 5490000, quantity: 1 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01T09:00:00'))
  },
  {
    id: 'ORD-2024-002',
    customerName: 'Chị Lan - Hà Đông',
    phoneNumber: '0988222333',
    address: 'Chung cư Seasons Avenue, Mỗ Lao, Hà Đông',
    productName: 'Kangaroo KG10A3',
    totalAmount: 6990000,
    status: 'processing',
    orderType: 'installation',
    technicianId: 'tech_hn_001',
    technicianName: 'Lê Hoàng Nam',
    items: [{ id: 'prod_kg_10a3', name: 'Kangaroo KG10A3 Nóng Lạnh', price: 6990000, quantity: 1 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-12T14:30:00'))
  },
  {
    id: 'ORD-2024-003',
    customerName: 'Bác Hùng - Ba Đình',
    phoneNumber: '0904111222',
    address: 'Số 5 Phố Đội Cấn, Ba Đình, Hà Nội',
    productName: 'Thay lõi Karofi 1-2-3',
    totalAmount: 350000,
    status: 'assigned',
    orderType: 'maintenance',
    technicianId: 'tech_hn_002',
    technicianName: 'Nguyễn Văn Đức',
    items: [{ id: 'prod_loi_123_ka', name: 'Bộ 3 lõi lọc thô Karofi 1-2-3', price: 350000, quantity: 1 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-15T08:00:00'))
  },
  {
    id: 'ORD-2024-004',
    customerName: 'Cửa hàng Cafe Highland',
    phoneNumber: '0243555666',
    address: 'Tầng 1 Lotte Center, Liễu Giai, Hà Nội',
    productName: 'AO Smith Z7',
    totalAmount: 11500000,
    status: 'pending',
    orderType: 'installation',
    items: [{ id: 'prod_as_z7', name: 'AO Smith Z7', price: 11500000, quantity: 1 }],
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    id: 'ORD-2024-005',
    customerName: 'Anh Minh - Long Biên',
    phoneNumber: '0911777888',
    address: 'Số 45 Long Biên 2, Long Biên, Hà Nội',
    productName: 'Sửa bơm máy lọc nước',
    totalAmount: 550000,
    status: 'completed',
    orderType: 'repair',
    technicianId: 'tech_hn_001',
    technicianName: 'Lê Hoàng Nam',
    items: [{ id: 'prod_bom_24v', name: 'Bơm tăng áp Headon 24V', price: 550000, quantity: 1 }],
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-20T10:00:00'))
  }
];

// ══════════════════════════════════════════════════════════════
// 6. HÀM THỰC THI SEED
// ══════════════════════════════════════════════════════════════
async function seedData() {
  console.log('\n🌱 ĐANG SEED DỮ LIỆU TOÀN DIỆN CHO AQUACARE V4 (Free Plan Optimized)');
  console.log('════════════════════════════════════════════════════════════════');

  const batch = db.batch();

  // Seed Nhà cung cấp
  suppliers.forEach(s => batch.set(db.collection('suppliers').doc(s.id), { ...s, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
  console.log(` ✓ Đã chuẩn bị ${suppliers.length} Nhà cung cấp`);

  // Seed Sản phẩm
  products.forEach(p => batch.set(db.collection('sanPham').doc(p.id), { ...p, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
  console.log(` ✓ Đã chuẩn bị ${products.length} Sản phẩm trong kho`);

  // Seed Phiếu nhập
  importVouchers.forEach(v => batch.set(db.collection('importVouchers').doc(v.id), { ...v, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
  console.log(` ✓ Đã chuẩn bị ${importVouchers.length} Phiếu nhập kho`);

  // Seed Đơn hàng
  orders.forEach(ord => {
    const ref = db.collection('donHang').doc(ord.id);
    const dbOrder = {
      ...ord,
      tenKhachHang: ord.customerName,
      diaChiGiaoHang: ord.address,
      tenSanPham: ord.productName,
      tongTien: ord.totalAmount,
      loaiDonHang: ord.orderType,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ngayBaoTriTiepTheo: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))
    };
    batch.set(ref, dbOrder);
  });
  console.log(` ✓ Đã chuẩn bị ${orders.length} Đơn hàng mẫu`);

  try {
    await batch.commit();
    console.log('\n✨ THÀNH CÔNG! Toàn bộ dữ liệu đã được đồng bộ lên Firebase.');
    console.log('👉 Bây giờ bạn có thể vào trang Sản phẩm & Kho để kiểm tra lịch sử nhập hàng.');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
  } finally {
    process.exit(0);
  }
}

seedData();
