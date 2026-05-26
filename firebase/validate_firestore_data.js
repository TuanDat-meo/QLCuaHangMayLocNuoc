// firebase/validate_firestore_data.js
// Validate Firestore data matches firestore_collections.dart schema
// Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node validate_firestore_data.js <project_id>

const admin = require('firebase-admin');

const projectId = process.argv[2] || process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('❌ Error: PROJECT_ID required. Usage: node validate_firestore_data.js <project_id>');
  process.exit(1);
}

console.log('🔍 Initializing validation for project:', projectId);

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();

// ════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION RULES (from firestore_collections.dart)
// ════════════════════════════════════════════════════════════════════

const schemaRules = {
  danhMuc: {
    required: ['ten', 'moTa', 'thuTuHienThi'],
    timestamps: ['ngayTao', 'ngayCapNhat'],
  },
  sanPham: {
    required: [
      'danhMucId',
      'tenSanPham',
      'thuongHieu',
      'sku',
      'moTa',
      'giaBan',
      'giaLapDat',
      'trangThai',
      'soLuongTon',
      'nguongCanhBao',
    ],
    optional: ['thongSoKyThuat', 'phuKienDiKem', 'danhSachAnh', 'thuTuHienThi'],
    timestamps: ['ngayTao', 'ngayCapNhat'],
    enums: {
      trangThai: ['active', 'inactive'],
    },
  },
  nguoiDung: {
    required: ['uid', 'vaiTro', 'hoTen', 'soDienThoai', 'email'],
    optional: [
      'anhDaiDien',
      'trangThai',
      'fcmToken',
      'khuVuc',
      'lanDauDangNhap',
      'soLanDangNhatSai',
      'khoaUntil',
    ],
    timestamps: ['ngayTao', 'ngayCapNhat'],
    enums: {
      vaiTro: ['customer', 'admin', 'technician'],
      trangThai: ['active', 'inactive'],
    },
  },
  donHang: {
    required: [
      'maDonHang',
      'khachHangId',
      'tenKhachHang',
      'soDienThoai',
      'danhSachSanPham',
      'tongTien',
      'diaChi',
      'trangThai',
    ],
    optional: [
      'gioHen',
      'kyThuatVienId',
      'tenKyThuatVien',
      'soTienCOD',
      'soTienTip',
      'anhHoanThanh',
      'lyDoHuy',
      'ghiChuAdmin',
    ],
    timestamps: ['ngayTao', 'ngayCapNhat'],
    enums: {
      trangThai: ['cho_xn', 'da_xn', 'da_phan_cong', 'dang_di', 'dang_lap', 'hoan_thanh', 'huy'],
    },
  },
  thietBi: {
    required: [
      'maQR',
      'khachHangId',
      'sanPhamId',
      'tenSanPham',
      'soSeri',
      'ngayLapDat',
      'thangBaoHanh',
      'trangThai',
    ],
    optional: [
      'donHangId',
      'diaChiLapDat',
      'lapDatBoi',
      'batDauBaoHanh',
      'ketThucBaoHanh',
      'ngayBaoTriTiepTheo',
      'chuKyBaoTriThang',
    ],
    timestamps: ['ngayTao'],
    enums: {
      trangThai: ['hoat_dong', 'het_bao_hanh', 'ngung_su_dung'],
    },
  },
  thongBao: {
    required: ['nguoiNhanId', 'tieuDe', 'noiDung', 'loai'],
    optional: ['thamChieuId', 'loaiThamChieu', 'daDoc'],
    timestamps: ['ngayTao'],
    enums: {
      loai: ['don_hang', 'bao_tri', 'bao_hanh', 'hang_ve', 'phan_cong', 'he_thong'],
    },
  },
  nhaCungCap: {
    required: ['tenNCC', 'soDienThoai', 'email'],
    optional: ['diaChiNCC', 'trangThai'],
    timestamps: ['ngayTao', 'ngayCapNhat'],
  },
  banner: {
    required: ['title', 'image', 'trangThai'],
    optional: ['link', 'thuTuHienThi'],
    enums: {
      trangThai: ['active', 'inactive'],
    },
  },
};

// ════════════════════════════════════════════════════════════════════
// VALIDATION LOGIC
// ════════════════════════════════════════════════════════════════════

class ValidationError {
  constructor(docId, field, message) {
    this.docId = docId;
    this.field = field;
    this.message = message;
  }
}

async function validateCollection(collectionName) {
  console.log(`\n📋 Validating collection: ${collectionName}`);
  console.log('─'.repeat(60));

  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.size === 0) {
    console.log(`  ⚠️  Collection is empty (may be expected for dynamic collections)`);
    return { errors: [], warnings: [] };
  }

  const errors = [];
  const warnings = [];
  const schema = schemaRules[collectionName];

  if (!schema) {
    console.log(`  ⚠️  No schema defined for this collection`);
    return { errors: [], warnings: [{ message: 'No schema defined' }] };
  }

  let validDocs = 0;
  let docsWithIssues = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let hasError = false;

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(new ValidationError(doc.id, field, `Missing required field: ${field}`));
          hasError = true;
        }
      }
    }

    // Validate enum values
    if (schema.enums) {
      for (const [field, allowedValues] of Object.entries(schema.enums)) {
        if (field in data && !allowedValues.includes(data[field])) {
          errors.push(
            new ValidationError(
              doc.id,
              field,
              `Invalid enum value "${data[field]}". Allowed: ${allowedValues.join(', ')}`
            )
          );
          hasError = true;
        }
      }
    }

    // Check timestamp fields
    if (schema.timestamps) {
      for (const field of schema.timestamps) {
        if (!(field in data)) {
          warnings.push(
            new ValidationError(doc.id, field, `Missing timestamp field: ${field}`)
          );
        }
      }
    }

    if (hasError) {
      docsWithIssues++;
    } else {
      validDocs++;
    }
  }

  console.log(`  ✅ Valid documents: ${validDocs}/${snapshot.size}`);
  if (docsWithIssues > 0) {
    console.log(`  ❌ Documents with issues: ${docsWithIssues}`);
  }

  return { errors, warnings };
}

async function validateReferences() {
  console.log(`\n🔗 Validating cross-collection references...`);
  console.log('─'.repeat(60));

  const issues = [];

  // Validate sanPham → danhMuc references
  const productsSnapshot = await db.collection('sanPham').get();
  const categoriesSnapshot = await db.collection('danhMuc').get();
  const categoryIds = new Set(categoriesSnapshot.docs.map(doc => doc.id));

  for (const doc of productsSnapshot.docs) {
    const data = doc.data();
    if (data.danhMucId && !categoryIds.has(data.danhMucId)) {
      issues.push({
        collection: 'sanPham',
        docId: doc.id,
        issue: `danhMucId "${data.danhMucId}" not found in danhMuc collection`,
      });
    }
  }

  // Validate donHang → nguoiDung references
  const ordersSnapshot = await db.collection('donHang').get();
  const usersSnapshot = await db.collection('nguoiDung').get();
  const userIds = new Set(usersSnapshot.docs.map(doc => doc.data().uid));

  for (const doc of ordersSnapshot.docs) {
    const data = doc.data();
    if (data.khachHangId && !userIds.has(data.khachHangId)) {
      issues.push({
        collection: 'donHang',
        docId: doc.id,
        issue: `khachHangId "${data.khachHangId}" not found in nguoiDung collection`,
      });
    }
  }

  if (issues.length === 0) {
    console.log(`  ✅ All references valid`);
  } else {
    console.log(`  ❌ Found ${issues.length} broken references`);
    issues.forEach(issue => {
      console.log(`    • ${issue.collection}/${issue.docId}: ${issue.issue}`);
    });
  }

  return issues;
}

// ════════════════════════════════════════════════════════════════════
// MAIN VALIDATION
// ════════════════════════════════════════════════════════════════════

async function main() {
  try {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('✔️  FIRESTORE DATA VALIDATION');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`Project ID: ${projectId}\n`);

    let totalErrors = 0;
    let totalWarnings = 0;

    // Validate each collection
    for (const collectionName of Object.keys(schemaRules)) {
      const { errors, warnings } = await validateCollection(collectionName);
      totalErrors += errors.length;
      totalWarnings += warnings.length;

      if (errors.length > 0) {
        console.log(`\n  ❌ ERRORS IN ${collectionName}:`);
        errors.forEach(err => {
          console.log(`    • ${err.docId} [${err.field}]: ${err.message}`);
        });
      }

      if (warnings.length > 0) {
        console.log(`\n  ⚠️  WARNINGS IN ${collectionName}:`);
        warnings.forEach(warn => {
          console.log(`    • ${warn.docId} [${warn.field}]: ${warn.message}`);
        });
      }
    }

    // Validate cross-collection references
    const referenceIssues = await validateReferences();
    totalErrors += referenceIssues.length;

    // Summary
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('📊 VALIDATION SUMMARY');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`  Errors: ${totalErrors}`);
    console.log(`  Warnings: ${totalWarnings}`);

    if (totalErrors === 0) {
      console.log('\n✅ VALIDATION PASSED - Data is consistent with schema!\n');
      process.exit(0);
    } else {
      console.log('\n❌ VALIDATION FAILED - Please fix the above issues.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation error:', error);
    process.exit(1);
  }
}

main();
