# Firebase Configuration Guide - AquaCare Monorepo

Tài liệu này hướng dẫn cách cấu hình Firebase cho toàn bộ monorepo và chạy 3 app độc lập.

## 📋 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────┐
│        Firebase Project (1 project duy nhất)    │
│  ┌──────────────────────────────────────────┐  │
│  │  Firestore | Auth | Storage | Functions │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
          ↓         ↓         ↓
    ┌─────────┬─────────┬──────────┐
    │ Admin   │Customer │Technician│
    │  Web    │  App    │   App    │
    │ (React) │(Flutter)│ (Flutter)│
    └─────────┴─────────┴──────────┘
```

**Điểm mấu chốt:** Mỗi app **tự kết nối trực tiếp** vào Firebase bằng config riêng. Chúng không phụ thuộc nhau — chỉ chia sẻ dữ liệu ở tầng Firestore.

---

## 🚀 Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a new project"** → Đặt tên `AquaCareSystem`
3. Enable Analytics (optional)
4. Sau khi project create, note lại **Project ID** (ví dụ: `aquacarsystem-abc123`)

---

## 2️⃣ Bước 2: Setup Admin Web (React + Vite)

### a) Lấy Firebase credentials cho Web

1. Trong Firebase Console, click **"Add app"** → chọn **Web** (</> icon)
2. Đặt tên `Admin Web` → Firebase SDK setup → Copy cấu hình JSON
3. Ví dụ:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "aquacareystem-abc123.firebaseapp.com",
     projectId: "aquacareystem-abc123",
     storageBucket: "aquacareystem-abc123.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

### b) Cập nhật `.env.local` cho Admin Web

File đã tạo: `apps/admin_web/.env.local`

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=aquacareystem-abc123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aquacareystem-abc123
VITE_FIREBASE_STORAGE_BUCKET=aquacareystem-abc123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_DATABASE_URL=https://aquacareystem-abc123.firebaseio.com
```

### c) Chạy Admin Web

```bash
cd apps/admin_web
npm install
npm run dev
# Truy cập: http://localhost:5173
```

---

## 3️⃣ Bước 3: Setup Flutter Apps (Customer + Technician)

### a) Tải Google Services

**Cho Android:**
1. Firebase Console → Project Settings → **Service Accounts** tab
2. Click **"Google Cloud Console"**
3. Tìm ứng dụng Android → tải `google-services.json`
4. Đặt vào: `apps/customer_app/android/app/google-services.json`
5. Làm tương tự cho `apps/technician_app/android/app/google-services.json`

**Cho iOS:**
1. Firebase Console → Project Settings → **General** tab
2. Tìm app iOS → Download `GoogleService-Info.plist`
3. Đặt vào: `apps/customer_app/ios/Runner/GoogleService-Info.plist`
4. Làm tương tự cho technician app
5. **Quan trọng:** Thêm file vào Xcode:
   ```bash
   # Mở Xcode project
   open apps/customer_app/ios/Runner.xcworkspace
   # Right-click Runner → Add Files → chọn GoogleService-Info.plist
   # Đảm bảo "Copy items if needed" và target "Runner" được chọn
   ```

### b) Chạy Flutter Apps

```bash
# Terminal 1 - Customer App
cd apps/customer_app
flutter pub get
flutter run -d chrome  # hoặc device ID

# Terminal 2 - Technician App
cd apps/technician_app
flutter pub get
flutter run -d <device_id>
```

Tìm device ID:
```bash
flutter devices
```

---

## 4️⃣ Bước 4: Setup Shared Package

Shared package ở `packages/shared/` chứa models và constants dùng chung giữa 2 Flutter app.

**Sử dụng trong code:**
```dart
import 'package:shared/models/user.dart';
import 'package:shared/constants/app_constants.dart';

// Ví dụ
final user = User.fromMap(firestoreData, uid);
```

**pubspec.yaml của mỗi Flutter app đã cấu hình:**
```yaml
dependencies:
  shared:
    path: ../../packages/shared
```

---

## 5️⃣ Bước 5: Setup Firebase Functions (Backend)

File `firebase/functions/src/index.ts` đã được chuyển sang TypeScript.

### a) Deploy Functions

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

### b) Gọi Functions từ client

**Từ React (Admin Web):**
```typescript
import { functions } from '@/app/firebase.config';
import { httpsCallable } from 'firebase/functions';

const setRoleFunc = httpsCallable(functions, 'setCustomClaims');
await setRoleFunc({ uid: 'user123', role: 'admin' });
```

**Từ Flutter:**
```dart
import 'package:cloud_functions/cloud_functions.dart';

FirebaseFunctions.instance.httpsCallable('setCustomClaims').call({
  'uid': 'user123',
  'role': 'admin',
});
```

---

## 6️⃣ Bước 6: Setup Firestore Rules & Indexes

### a) Firestore Security Rules

File: `firebase/firestore.rules`

Ví dụ quy tắc:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Chỉ admin hoặc chính user đó mới xem được
    match /users/{uid} {
      allow read: if request.auth.uid == uid || 
                     request.auth.token.role == 'admin';
      allow write: if request.auth.uid == uid;
    }

    // Orders: Customer tạo, technician & admin xem
    match /orders/{orderId} {
      allow create: if request.auth.token.role == 'customer';
      allow read: if request.auth.token.role in ['admin', 'technician', 'customer'];
      allow update: if request.auth.token.role in ['admin', 'technician'];
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### b) Tạo Indexes (nếu cần)

Khi query phức tạp, Firestore sẽ tự suggest tạo index. Click link trong console để tạo.

---

## 🧪 Bước 7: Test Locally (Optional)

Sử dụng **Firebase Emulator Suite** để test local:

```bash
# Cài Firebase CLI
npm install -g firebase-tools

# Khởi động emulator
cd firebase
firebase emulators:start

# Apps sẽ tự kết nối emulator (đã config trong firebase.config.ts)
```

Emulator UI: http://localhost:4000

---

## 📁 Cấu trúc tệp sau setup

```
apps/
├── admin_web/
│   ├── .env.local          (✓ Firebase credentials)
│   ├── src/app/
│   │   └── firebase.config.ts
│   └── src/services/
│       └── firebase/       (Cần tạo)
├── customer_app/
│   ├── android/app/
│   │   └── google-services.json   (✓ Cần tải)
│   ├── ios/Runner/
│   │   └── GoogleService-Info.plist  (✓ Cần tải)
│   ├── lib/
│   │   ├── main.dart       (✓ Firebase init)
│   │   ├── core/
│   │   │   └── firebase/   (Cần tạo)
│   │   └── features/
│   └── pubspec.yaml        (✓ Firebase deps)
└── technician_app/         (Tương tự)

packages/shared/lib/
├── models/
│   ├── user.dart           (✓)
│   ├── order.dart          (✓)
│   └── index.dart
├── constants/
│   ├── app_constants.dart  (✓)
│   └── index.dart
└── utils/                  (cần phát triển)

firebase/functions/
├── src/
│   └── index.ts            (✓ TypeScript)
└── firestore.rules         (✓)
```

---

## ✅ Checklist

- [ ] Firebase Project created
- [ ] Admin Web `.env.local` filled
- [ ] Android `google-services.json` added
- [ ] iOS `GoogleService-Info.plist` added & linked in Xcode
- [ ] `flutter pub get` chạy cho cả 2 Flutter app
- [ ] `npm install` chạy cho admin_web
- [ ] Test chạy từng app:
  - [ ] Admin Web: `npm run dev`
  - [ ] Customer App: `flutter run`
  - [ ] Technician App: `flutter run`

---

## 🆘 Troubleshooting

### Admin Web không kết nối Firebase
- Kiểm tra `.env.local` có các credentials
- Trong DevTools Console, xem error từ Firebase

### Flutter app không kết nối
- Đảm bảo `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) đúng vị trí
- Chạy `flutter clean` → `flutter pub get` → `flutter run`

### Firestore permission denied
- Firestore rules mặc định từ chối hết. Cần update rules hoặc dùng emulator
- Hoặc login trước bằng Firebase Auth

---

## 📚 Tài liệu thêm

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Flutter Firebase](https://firebase.flutter.dev/)
- [Firestore Security Rules](https://firebase.google.com/docs/rules)
