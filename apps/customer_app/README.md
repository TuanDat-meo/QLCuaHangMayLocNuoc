# 📱 Customer App — Flutter

Ứng dụng khách hàng của AquaCareSystem. Cho phép đặt hàng, theo dõi thiết bị và quản lý bảo hành.

## 🛠️ Tech Stack

- Flutter (Dart) — Cross-platform (iOS, Android, Web)
- Firebase: Auth, Firestore, Storage, FCM
- Riverpod — State management
- GoRouter — Navigation
- Google Maps / Places — Địa chỉ giao hàng

## 🚀 Chạy development

```bash
cd apps/customer_app
flutter pub get
flutter run -d chrome      # Web
flutter run -d <device_id> # Mobile
```

Cần Firebase Emulator chạy trước:
```bash
cd firebase && firebase emulators:start
```

## 📂 Cấu trúc lib/

```
lib/
├── main.dart                  # Entry point + Firebase init
├── firebase_options.dart      # Firebase config (auto-generated)
├── core/
│   ├── routing/               # GoRouter config
│   └── services/              # Firebase service wrappers
├── features/
│   ├── auth/
│   │   └── screens/           # Login, Signup, ForgotPassword, ResetPassword
│   ├── home/
│   ├── products/
│   ├── orders/
│   ├── profile/
│   └── notifications/
├── models/                    # Data models
└── widgets/                   # Reusable widgets
```

## ✅ Chức năng Phase 1

- [x] Đăng ký / Đăng nhập (Email + Password)
- [x] Đặt hàng với Google Places
- [x] Theo dõi trạng thái đơn hàng real-time
- [x] Thông báo push FCM
- [x] Hồ sơ tài khoản

## 📦 Dependencies chính

```yaml
firebase_core, firebase_auth, cloud_firestore,
firebase_storage, firebase_messaging,
flutter_riverpod, go_router,
google_maps_flutter, google_places_flutter,
shared  # packages/shared
```

## 🔐 Firebase Config

File `firebase_options.dart` được tạo bằng:
```bash
flutterfire configure
```

Khi dev dùng emulator, app tự kết nối:
- Auth: `localhost:9099`
- Firestore: `localhost:8080`
