# 📱 Customer App - Flutter

Ứng dụng di động cho khách hàng đặt hàng máy lọc nước và quản lý bảo hành

## 🎯 Chức năng Phase 1

- ✅ Onboarding & Đăng ký OTP
- ✅ Trang chủ với banner
- ✅ Danh sách sản phẩm & tìm kiếm
- ✅ Chi tiết sản phẩm
- ✅ Đặt hàng với Google Places
- ✅ Tra cứu đơn hàng
- ✅ Thông báo FCM
- ✅ Hồ sơ tài khoản
- ✅ Giỏ hàng & Wishlist

## 🚀 Quick Start

```bash
cd apps/customer_app

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
│   ├── theme.dart           # Theme
│   └── di.dart              # Dependency injection
├── models/                  # Local models
├── views/                   # All screens
│   ├── auth/
│   ├── home/
│   ├── product/
│   ├── order/
│   └── ...
├── widgets/                 # Reusable components
├── utils/                   # Services & utilities
└── test/                    # Tests
```

## 🔐 Firebase Setup

1. Tạo Firebase project
2. Thêm Android app
3. Download `google-services.json`
4. Thêm vào `android/app/`

## 📦 Dependencies

- `firebase_core`, `firebase_auth`, `cloud_firestore`
- `go_router` - Navigation
- `flutter_riverpod` - State management
- `google_maps_flutter` - Maps
- `image_picker` - Select photos

## 🧪 Testing

```bash
flutter test
```

## 📱 Screens (Phase 1)

| Screen | Path | Status |
|--------|------|--------|
| Splash | `/` | TODO |
| Login | `/login` | TODO |
| Register | `/register` | TODO |
| Home | `/home` | TODO |
| Products | `/products` | TODO |
| Product Detail | `/products/:id` | TODO |
| Cart | `/cart` | TODO |
| Checkout | `/checkout` | TODO |
| Orders | `/orders` | TODO |
| Order Detail | `/orders/:id` | TODO |
| Profile | `/profile` | TODO |

---

**Next Phase**: Pre-order, Devices, Warranty
