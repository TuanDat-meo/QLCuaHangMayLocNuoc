# 🚀 Quick Start - AquaCare Monorepo

Hướng dẫn nhanh để chạy toàn bộ hệ thống.

## 1️⃣ Chuẩn bị trước

```bash
# Cài đặt Node.js (v18+) & Flutter SDK
# Download từ nodejs.org và flutter.dev

# Clone project
git clone <repo-url>
cd QLCuaHangMayLocNuoc
```

## 2️⃣ Firebase Setup (lần đầu)

1. Tạo Firebase project: [firebase.google.com](https://firebase.google.com)
2. Lấy credentials cho Web app
3. Tải `google-services.json` & `GoogleService-Info.plist` cho Flutter
4. Xem chi tiết: [docs/FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 3️⃣ Chạy 3 app (3 Terminal)

### Terminal 1 - Admin Web
```bash
cd apps/admin_web
npm install          # Lần đầu thôi
npm run dev
# ✓ http://localhost:5173
```

### Terminal 2 - Customer App
```bash
cd apps/customer_app
flutter pub get      # Lần đầu thôi
flutter run
# Chọn device từ danh sách
```

### Terminal 3 - Technician App
```bash
cd apps/technician_app
flutter pub get      # Lần đầu thôi
flutter run -d <device_id>
# Hoặc flutter devices để xem ID
```

## 🔧 Essential Commands

```bash
# Admin Web
cd apps/admin_web
npm run build                    # Build production
npm run lint                     # Check linting
npm run type-check              # TypeScript check

# Flutter apps
cd apps/customer_app
flutter clean                   # Reset project
flutter pub upgrade             # Update dependencies
flutter analyze               # Check code quality

# Firebase functions
cd firebase/functions
npm run build
firebase deploy --only functions
```

## 📁 Cấu trúc thư mục

```
apps/
├── admin_web/           (React + Vite)
├── customer_app/        (Flutter)
└── technician_app/      (Flutter)

packages/
└── shared/              (Dart models & constants)

firebase/
├── functions/           (TypeScript Cloud Functions)
├── firestore.rules      (Security rules)
└── storage.rules        (Storage rules)

docs/
├── FIREBASE_SETUP.md    (Chi tiết cấu hình)
├── PROJECT_OVERVIEW.md
└── ENV_SETUP.md
```

## 💡 Tips

- **Debugging Admin Web:** Mở DevTools (F12) → Console/Network
- **Debugging Flutter:** Use `flutter logs` hoặc DevTools (`flutter pub global activate devtools`)
- **Shared models:** Sửa trong `packages/shared/lib/models/` → cả 2 Flutter app tự cập nhật
- **Emulator:** Chạy `firebase emulators:start` để test Firebase local

## 🆘 Gặp vấn đề?

1. **Port 5173 đã bận?**
   ```bash
   npm run dev -- --port 5174
   ```

2. **Flutter build error?**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

3. **Firebase credentials sai?**
   - Kiểm tra `.env.local` (Admin Web)
   - Kiểm tra `google-services.json` (Android)
   - Kiểm tra `GoogleService-Info.plist` (iOS)

4. **Firestore permission denied?**
   - Xem [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) phần Firestore Rules

---

**Mọi chi tiết xem:** [docs/FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
