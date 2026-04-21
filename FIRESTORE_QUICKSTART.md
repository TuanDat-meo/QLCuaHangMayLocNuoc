# 🔥 Firestore - Quick Start

## ⚡ **Chạy Nhanh**

### 1️⃣ **Chạy Firestore Emulator Locally**
```bash
cd firebase
firebase emulators:start
```

✅ Firestore sẽ chạy ở: `http://127.0.0.1:8080`

### 2️⃣ **Kết nối Apps vào Emulator**

**Flutter:**
```dart
// lib/main.dart
if (kDebugMode) {
  FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
  FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
}
```

**React Web:**
```typescript
// src/main.tsx
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### 3️⃣ **Seed Dữ Liệu**
```bash
cd firebase
npm run seed
```

---

## 📱 **Trên Firebase Console**

### Đăng nhập
```
https://console.firebase.google.com
```

### Tạo Collection Manually
```
Firestore → Create Collection → nguoiDung
```

### Add Document
```json
{
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0912345678",
  "email": "nguyenvana@email.com",
  "vaiTro": "customer",
  "trangThai": "active"
}
```

---

## 🚀 **Deploy Production**

### Deploy Security Rules
```bash
cd firebase
firebase deploy --only firestore:rules
```

### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Deploy Hosting
```bash
firebase deploy --only hosting
```

---

## 📝 **Collections Quan Trọng**

| Collection | Mô Tả | Quyền |
|-----------|-------|-------|
| **nguoiDung** | Users | Owner read/write + Admin |
| **sanPham** | Products | Public read, Admin write |
| **donHang** | Orders | Owner/Admin/Tech read |
| **thietBi** | Devices | Admin/Tech read, write |
| **thongBao** | Notifications | Owner read, Admin write |

---

## 🔗 **Tài Liệu Chi Tiết**

Xem: `FIRESTORE_MANAGEMENT_GUIDE.md`

---

## ❓ **Giúp Đỡ**

**Lỗi "Permission denied"?**
→ Kiểm tra `firebase/firestore.rules` và `vaiTro` của user

**Emulator không kết nối?**
```bash
firebase emulators:stop
firebase emulators:start --import ./seed-data
```

**Deploy rules không thành công?**
```bash
firebase deploy --only firestore:rules --debug
```
