# 👨‍🔧 Technician App - Flutter

Ứng dụng di động cho kỹ thuật viên quản lý công việc lắp đặt

## 🎯 Chức năng Phase 1

- ✅ Đăng nhập
- ✅ Danh sách công việc hôm nay
- ✅ Chi tiết đơn hàng & thông tin khách
- ✅ Google Maps chỉ đường
- ✅ Chụp ≤5 ảnh xác nhận
- ✅ Nhập COD + tip
- ✅ Lịch làm việc
- ✅ Thông báo FCM
- ✅ Hồ sơ tài khoản

## 🚀 Quick Start

```bash
cd apps/technician_app

# Get dependencies
flutter pub get

# Run
flutter run

# Build APK
flutter build apk --release

# Build IPA (macOS only)
flutter build ios --release
```

## 📂 Folder Structure

```
lib/
├── main.dart                 # Entry point
├── app/
│   ├── app.dart             # Root widget
│   ├── routes.dart          # Navigation
│   ├── theme.dart           # Theme (Teal/Green)
│   └── di.dart              # Dependency injection
├── models/
│   ├── job_model.dart       # Assignment/Job
│   ├── completion_model.dart
│   └── schedule_model.dart
├── views/                   # Screens
│   ├── auth/               # Login
│   ├── job/                # Job list, detail
│   ├── navigation/         # Maps launcher
│   ├── completion/         # Photo + COD + tip
│   ├── schedule/           # Daily timeline
│   └── profile/
├── widgets/                # Components
├── utils/                  # Services
└── test/
```

## 🔐 Firebase Setup

1. Tạo Firebase project
2. Thêm Android app
3. Download `google-services.json`
4. Thêm vào `android/app/`

## 📦 Dependencies

- `firebase_core`, `firebase_auth`, `cloud_firestore`
- `go_router` - Navigation
- `map_launcher` - Open Google Maps
- `image_picker` - Camera
- `flutter_image_compress` - Compress photos

## 🧪 Testing

```bash
flutter test
```

## 📱 Screens (Phase 1)

| Screen | Path | Status |
|--------|------|--------|
| Login | `/login` | TODO |
| Job List | `/jobs` | TODO |
| Job Detail | `/jobs/:id` | TODO |
| Maps | `/job/:id/map` | TODO |
| Completion | `/job/:id/complete` | TODO |
| Photo Preview | `/photos` | TODO |
| Schedule | `/schedule` | TODO |
| Profile | `/profile` | TODO |

---

**Next Phase**: Device tracking, QR Code, Chat
