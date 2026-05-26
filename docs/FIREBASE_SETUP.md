# 🔥 Firebase Setup — AquaCareSystem

## Kiến trúc

```
┌──────────────────────────────────────────┐
│         Firebase Project (1 project)     │
│   Auth │ Firestore │ Storage │ Functions │
└──────────────────────────────────────────┘
          ↓           ↓           ↓
    ┌─────────┐ ┌──────────┐ ┌───────────┐
    │  Admin  │ │ Customer │ │Technician │
    │   Web   │ │   App    │ │    App    │
    └─────────┘ └──────────┘ └───────────┘
```

Mỗi app kết nối **trực tiếp** vào Firebase, chia sẻ dữ liệu qua Firestore.

---

## Bước 1 — Tạo Firebase Project

1. Vào [console.firebase.google.com](https://console.firebase.google.com) → **Create project** → Đặt tên `AquaCareSystem`
2. Kích hoạt các dịch vụ:
   - **Authentication** → Sign-in method → **Email/Password** ✅
   - **Cloud Firestore** → Tạo database (chọn region `asia-southeast1`)
   - **Storage** → Tạo bucket
   - **Functions** → Upgrade plan lên Blaze

---

## Bước 2 — Admin Web (React + Vite)

### Lấy Web credentials
Firebase Console → Project Settings → **Add app** → Web (`</>`) → Copy config

### Tạo file `.env.local`
```bash
# apps/admin_web/.env.local
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Chạy
```bash
cd apps/admin_web
npm install && npm run dev
# http://localhost:5173
```

---

## Bước 3 — Flutter Apps

### Android
1. Firebase Console → Project Settings → **Add app** → Android
2. Tải `google-services.json` → đặt vào:
   - `apps/customer_app/android/app/google-services.json`
   - `apps/technician_app/android/app/google-services.json`

### iOS
1. Firebase Console → Project Settings → **Add app** → iOS
2. Tải `GoogleService-Info.plist` → đặt vào:
   - `apps/customer_app/ios/Runner/`
   - `apps/technician_app/ios/Runner/`
3. Mở Xcode → Add Files → chọn plist, tick **Copy items if needed**

### Chạy
```bash
cd apps/customer_app && flutter pub get && flutter run
cd apps/technician_app && flutter pub get && flutter run
```

---

## Bước 4 — Firebase Emulator (Development)

```bash
cd firebase
firebase emulators:start
```

| Service | URL |
|---------|-----|
| Emulator UI | http://localhost:4000 |
| Firestore | localhost:8080 |
| Auth | localhost:9099 |
| Functions | localhost:5001 |
| Storage | localhost:9199 |

> ✅ Cả 3 app đã được cấu hình tự kết nối emulator khi chạy development.

---

## Bước 5 — Cloud Functions

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

**Gọi từ React:**
```typescript
import { httpsCallable } from 'firebase/functions';
const setRole = httpsCallable(functions, 'setCustomClaims');
await setRole({ uid: 'user123', role: 'admin' });
```

**Gọi từ Flutter:**
```dart
await FirebaseFunctions.instance
    .httpsCallable('setCustomClaims')
    .call({'uid': 'user123', 'role': 'admin'});
```

---

## Bước 6 — Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

File: `firebase/firestore.rules` — đã cấu hình đầy đủ theo roles:
- `customer`: đọc/ghi đơn hàng của mình
- `technician`: xem assignment được giao
- `admin`: toàn quyền

---

## Bước 7 — Seed Data (tuỳ chọn)

```bash
cd firebase
node seed_firestore.js          # Dev data
node seed_firestore_production.js  # Production data
```

---

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `400 Bad Request` khi login | Auth chưa bật hoặc emulator chưa chạy | Bật Email/Password Auth hoặc `firebase emulators:start` |
| `permission-denied` Firestore | Chưa đăng nhập hoặc sai role | Kiểm tra Firestore Rules |
| Flutter không kết nối Firebase | Sai `firebase_options.dart` | Chạy lại `flutterfire configure` |
| Admin Web `apiKey missing` | Thiếu `.env.local` | Tạo file `apps/admin_web/.env.local` |

---

## Checklist

- [ ] Firebase project đã tạo
- [ ] Authentication Email/Password đã bật
- [ ] `apps/admin_web/.env.local` đã điền credentials
- [ ] `google-services.json` đã thêm (Android)
- [ ] `GoogleService-Info.plist` đã thêm (iOS)
- [ ] Flutter: `flutter pub get` cho cả 2 app
- [ ] `npm install` cho admin_web
- [ ] Firebase Emulator chạy được
- [ ] Test đăng nhập thành công
