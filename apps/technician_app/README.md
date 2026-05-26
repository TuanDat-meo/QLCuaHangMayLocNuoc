# 🔧 Technician App — Flutter

Ứng dụng kỹ thuật viên của AquaCareSystem. Quản lý công việc lắp đặt, chụp ảnh xác nhận và nhận COD.

## 🛠️ Tech Stack

- Flutter (Dart) — Cross-platform (iOS, Android, Web)
- Firebase: Auth, Firestore, Storage, FCM
- Provider — State management
- GoRouter — Navigation
- Google Maps — Chỉ đường đến khách hàng

## 🚀 Chạy development

```bash
cd apps/technician_app
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
├── main.dart                    # Entry point + Firebase init
├── firebase_options.dart        # Firebase config (auto-generated)
├── controllers/
│   └── auth_controller.dart     # Auth state (Provider)
├── core/
│   ├── routing/                 # GoRouter + auth guard
│   └── services/
│       ├── firebase_service.dart
│       └── firestore_user_service.dart  # User CRUD
├── features/
│   ├── auth/
│   │   └── screens/             # Login, Signup, ForgotPassword, ResetPassword
│   ├── jobs/                    # Danh sách công việc
│   ├── map/                     # Google Maps chỉ đường
│   └── profile/
├── models/
│   └── auth_models.dart         # Re-exports AuthUser từ shared
└── widgets/
    ├── email_input_field.dart
    └── password_input_field.dart
```

## ✅ Chức năng Phase 1

- [x] Đăng nhập / Đăng ký
- [x] Danh sách công việc hôm nay
- [x] Chi tiết đơn hàng & thông tin khách
- [x] Google Maps chỉ đường
- [x] Chụp ≤5 ảnh xác nhận lắp đặt
- [x] Nhập COD + Tip
- [x] Cập nhật trạng thái tài khoản (availability)

## 💾 Firestore Collection

**`nguoiDung`** — User profiles:
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "phoneNumber": "string",
  "role": "technician",
  "specializations": ["water_filter", "repair"],
  "isAvailable": true,
  "isVerified": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 📦 Dependencies chính

```yaml
firebase_core, firebase_auth, cloud_firestore,
firebase_storage, firebase_messaging,
provider, go_router,
google_maps_flutter,
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
