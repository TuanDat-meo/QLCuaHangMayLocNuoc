# 🔥 Firestore Quản Lý & Triển Khai - Hướng Dẫn Đầy Đủ

## 📍 Cấu Trúc Project Firebase

```
firebase/
├── firebase.json              ← Config chính
├── firestore.rules            ← Security rules
├── firestore.indexes.json     ← Indexes (auto generate)
├── storage.rules              ← Storage rules
└── functions/                 ← Cloud Functions

infrastructure/scripts/
├── deploy_firestore.sh        ← Deploy rules
├── deploy_functions.sh        ← Deploy functions
├── deploy_hosting.sh          ← Deploy hosting
└── seed_firestore.sh          ← Seed dữ liệu
```

---

## 🚀 **Cách 1: Chạy Firestore Emulator (Local Development)**

### Bước 1: Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Bước 2: Khởi tạo emulator
```bash
cd firebase
firebase emulators:start
```

**Output sẽ hiển thị:**
```
┌─────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe │
│    to connect your app.                 │
├─────────────────────────────────────────┤
│ Firestore Emulator: http://127.0.0.1:8080
│ Realtime Database Emulator: http://127.0.0.1:9000
│ Storage Emulator: http://127.0.0.1:9199
│ Pub/Sub Emulator: http://127.0.0.1:8085
│ Cloud Functions Emulator: http://127.0.0.1:5001
└─────────────────────────────────────────┘
```

### Bước 3: Kết nối apps vào emulator

**Flutter (customer_app/technician_app):**
```dart
// lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Kết nối emulator (chỉ development)
  if (kDebugMode) {
    FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
    FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
  }

  runApp(const MyApp());
}
```

**React Web (admin_web):**
```typescript
// src/main.tsx
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Kết nối emulator
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Bước 4: Seed dữ liệu ban đầu
```bash
cd infrastructure/scripts
bash seed_firestore.sh
```

---

## 📱 **Cách 2: Quản Lý trên Firebase Console**

### Đăng nhập Firebase Console
```
https://console.firebase.google.com
```

### Bước 1: Chọn Project AquaCareSystem

### Bước 2: Điều hướng đến Firestore
```
Build → Firestore Database
```

### Bước 3: Cấu trúc Collections

**Tạo Collection Manually:**
1. Click "Create Collection"
2. Collection ID: `nguoiDung`
3. Add first document:
   - Document ID: `user123`
   - Fields:
     ```
     hoTen: "Nguyễn Văn A"
     soDienThoai: "0912345678"
     email: "nguyenvana@email.com"
     vaiTro: "customer"
     trangThai: "active"
     ngayTao: timestamp
     ```

### Bước 4: Các Collections Chính Cần Tạo
- ✅ `nguoiDung` - User data
- ✅ `sanPham` - Products
- ✅ `donHang` - Orders
- ✅ `thietBi` - Devices
- ✅ `thongBao` - Notifications
- ✅ `danhMuc` - Categories
- ✅ `nhaCungCap` - Suppliers

---

## 🚀 **Cách 3: Deploy Firestore Rules Lên Production**

### Bước 1: Kiểm tra rules hiện tại
```bash
cd firebase
cat firestore.rules
```

### Bước 2: Cập nhật rules (nếu cần)
Sửa file `firebase/firestore.rules` theo yêu cầu

### Bước 3: Deploy lên Firebase
```bash
cd infrastructure/scripts
bash deploy_firestore.sh
```

**Hoặc deploy trực tiếp:**
```bash
cd firebase
firebase deploy --only firestore:rules
```

---

## 📊 **Cách 4: Seed Dữ Liệu Ban Đầu**

### Tạo file seed data
```bash
cd firebase
touch seed_firestore.js
```

### Ví dụ Seed Script
```javascript
// firebase/seed_firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedData() {
  console.log('🌱 Starting seed...');

  // Seed Categories
  const categories = [
    { id: 'cat-1', ten: 'Máy lọc nước', icon: '💧' },
    { id: 'cat-2', ten: 'Bộ lọc', icon: '🔧' },
    { id: 'cat-3', ten: 'Phụ kiện', icon: '⚙️' },
  ];

  for (const cat of categories) {
    await db.collection('danhMuc').doc(cat.id).set({
      ten: cat.ten,
      icon: cat.icon,
      thuTuHienThi: 1,
      ngayTao: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  console.log('✅ Categories seeded');

  // Seed Products
  const products = [
    {
      id: 'sp-001',
      tenSanPham: 'Máy lọc nước RO',
      thuongHieu: 'Karofi',
      sku: 'RO-001',
      giaBan: 5000000,
      giaLapDat: 500000,
      soLuongTon: 50,
      trangThai: 'active',
      danhMucId: 'cat-1',
    },
  ];

  for (const prod of products) {
    await db.collection('sanPham').doc(prod.id).set(prod);
  }
  console.log('✅ Products seeded');

  // Seed Users
  const users = [
    {
      uid: 'admin-001',
      hoTen: 'Admin System',
      email: 'admin@aquacare.com',
      soDienThoai: '0912000001',
      vaiTro: 'admin',
      trangThai: 'active',
    },
    {
      uid: 'tech-001',
      hoTen: 'Trần Văn B',
      email: 'technician@aquacare.com',
      soDienThoai: '0912000002',
      vaiTro: 'technician',
      trangThai: 'active',
      khuVuc: 'Ho Chi Minh',
    },
  ];

  for (const user of users) {
    await db.collection('nguoiDung').doc(user.uid).set(user);
  }
  console.log('✅ Users seeded');

  console.log('✨ Seed completed!');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Error seeding:', err);
  process.exit(1);
});
```

### Chạy seed script
```bash
cd firebase
npm run seed
# hoặc
node seed_firestore.js
```

---

## 🔐 **Cách 5: Firestore Security Rules Được Cập Nhật**

### Firestore Rules Cho AquaCareSystem
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ─────────────────────────────────────────────────────
    // Người dùng - Đọc/ghi data của chính mình
    // ─────────────────────────────────────────────────────
    match /nguoiDung/{uid} {
      // User đọc/ghi data của mình
      allow read, write: if request.auth.uid == uid;
      // Admin đọc tất cả
      allow read: if request.auth.token.vaiTro == 'admin';
      // Admin ghi tất cả
      allow write: if request.auth.token.vaiTro == 'admin';
      
      // Sub-collections
      match /diaChiGiaoHang/{doc=**} {
        allow read, write: if request.auth.uid == uid;
      }
      match /gioHang/{doc=**} {
        allow read, write: if request.auth.uid == uid;
      }
      match /lichSuHoatDong/{doc=**} {
        allow read: if request.auth.uid == uid;
      }
    }

    // ─────────────────────────────────────────────────────
    // Sản phẩm - Public read, Admin write
    // ─────────────────────────────────────────────────────
    match /sanPham/{productId} {
      allow read: if true;
      allow write: if request.auth.token.vaiTro == 'admin';
    }

    // ─────────────────────────────────────────────────────
    // Đơn hàng - Khách read/write own, Admin/Tech read all
    // ─────────────────────────────────────────────────────
    match /donHang/{orderId} {
      allow read: if 
        request.auth.uid == resource.data.khachHangId ||
        request.auth.token.vaiTro == 'admin' ||
        request.auth.token.vaiTro == 'technician';
      
      allow create: if 
        request.auth.uid == request.resource.data.khachHangId &&
        request.resource.data.trangThai == 'cho_xn';
      
      allow update: if 
        request.auth.uid == resource.data.khachHangId ||
        request.auth.token.vaiTro == 'admin' ||
        (request.auth.token.vaiTro == 'technician' && 
         request.auth.uid == resource.data.kyThuatVienId);
      
      // Lịch sử trạng thái
      match /lichSuTrangThai/{doc=**} {
        allow read: if 
          request.auth.uid == resource.parent.parent.data().khachHangId ||
          request.auth.token.vaiTro == 'admin' ||
          request.auth.token.vaiTro == 'technician';
      }
    }

    // ─────────────────────────────────────────────────────
    // Thiết bị - Admin/Tech read all, Customer read own
    // ─────────────────────────────────────────────────────
    match /thietBi/{deviceId} {
      allow read: if 
        request.auth.uid == resource.data.khachHangId ||
        request.auth.token.vaiTro == 'admin' ||
        request.auth.token.vaiTro == 'technician';
      
      allow write: if 
        request.auth.token.vaiTro == 'admin' ||
        request.auth.token.vaiTro == 'technician';
    }

    // ─────────────────────────────────────────────────────
    // Thông báo - Read own, Write for all
    // ─────────────────────────────────────────────────────
    match /thongBao/{notificationId} {
      allow read: if request.auth.uid == resource.data.nguoiNhanId;
      allow create: if request.auth.token.vaiTro == 'admin' ||
                       request.auth.token.vaiTro == 'technician';
      allow update: if request.auth.uid == resource.data.nguoiNhanId;
    }

    // ─────────────────────────────────────────────────────
    // Danh mục, Nhà cung cấp - Public read, Admin write
    // ─────────────────────────────────────────────────────
    match /danhMuc/{doc=**} {
      allow read: if true;
      allow write: if request.auth.token.vaiTro == 'admin';
    }
    match /nhaCungCap/{doc=**} {
      allow read: if true;
      allow write: if request.auth.token.vaiTro == 'admin';
    }

    // ─────────────────────────────────────────────────────
    // Mặc định: Từ chối tất cả
    // ─────────────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Deploy updated rules
```bash
firebase deploy --only firestore:rules
```

---

## 📈 **Cách 6: Firestore Indexes**

### Tạo indexes tự động
Khi query phức tạp, Firebase console sẽ gợi ý tạo index.

### Hoặc tạo manual
```bash
# Xem indexes hiện tại
firebase firestore:indexes:list

# Tạo index từ CLI
firebase firestore:indexes --json > firestore.indexes.json
```

---

## 🔍 **Monitoring & Analytics**

### Xem Real-time Data
1. Firebase Console → Firestore
2. Click collection name để xem documents
3. Click document ID để xem fields

### Xem Realtime Usage
1. Firebase Console → Usage
2. Firestore Read/Write/Delete operations

### Xem Errors & Logs
1. Firebase Console → Firestore → Monitor
2. Chọn date range
3. Xem error metrics

---

## 🛠️ **Troubleshooting**

### Lỗi: "Permission denied"
**Giải pháp:**
- Kiểm tra `firestore.rules` security rules
- Kiểm tra `custom claims` của user (vaiTro)
- Test trong Firestore console

### Lỗi: "Document not found"
**Giải pháp:**
- Kiểm tra document ID đúng không
- Kiểm tra collection name (tiếng Việt vs tiếng Anh)

### Emulator không kết nối
**Giải pháp:**
```bash
# Stop emulator
firebase emulators:stop

# Start lại
firebase emulators:start --import ./seed-data
```

---

## 📋 **Checklist Deploy Production**

- [ ] Cập nhật `firestore.rules`
- [ ] Test rules trong console
- [ ] Cập nhật `firestore.indexes.json`
- [ ] Seed dữ liệu ban đầu
- [ ] Deploy rules: `firebase deploy --only firestore:rules`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Deploy hosting: `firebase deploy --only hosting`
- [ ] Kiểm tra permissions
- [ ] Bật backup schedule

---

## 🔗 **Tài Liệu Tham Khảo**

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)
