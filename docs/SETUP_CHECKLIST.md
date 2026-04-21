# ✅ Firebase Setup Checklist

Kiểm tra danh sách này để đảm bảo tất cả đã được cấu hình đúng.

## Phase 1: Firebase Project Setup

- [ ] Firebase project tạo tại [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Project ID ghi lại: `_________________`
- [ ] Firestore Database tạo (Production mode)
- [ ] Firebase Authentication bật
- [ ] Storage bucket tạo
- [ ] Cloud Functions enabled

## Phase 2: Admin Web Configuration

### Environment Setup
- [ ] File `apps/admin_web/.env.local` tạo
- [ ] `VITE_FIREBASE_API_KEY` điền vào
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` điền vào
- [ ] `VITE_FIREBASE_PROJECT_ID` điền vào
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` điền vào
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` điền vào
- [ ] `VITE_FIREBASE_APP_ID` điền vào
- [ ] `VITE_FIREBASE_DATABASE_URL` điền vào

### Dependencies
- [ ] `npm install` chạy thành công trong `apps/admin_web/`
- [ ] `npm run dev` hoạt động (http://localhost:5173)
- [ ] No Firebase connection errors trong DevTools console

## Phase 3: Customer App (Flutter)

### Android Setup
- [ ] `google-services.json` tải từ Firebase Console
- [ ] `google-services.json` đặt vào `apps/customer_app/android/app/`
- [ ] `build.gradle.kts` có dòng: `id("com.google.gms.google-services")`
- [ ] `flutter pub get` chạy thành công

### iOS Setup
- [ ] `GoogleService-Info.plist` tải từ Firebase Console
- [ ] `GoogleService-Info.plist` đặt vào `apps/customer_app/ios/Runner/`
- [ ] Xcode project mở: `open apps/customer_app/ios/Runner.xcworkspace`
- [ ] File thêm vào Xcode (Right-click → Add Files)
- [ ] "Copy items if needed" checked
- [ ] Target "Runner" selected

### Test
- [ ] `flutter pub get` chạy thành công
- [ ] `flutter run` hoạt động trên device/emulator
- [ ] Không có Firebase initialization errors

## Phase 4: Technician App (Flutter)

### Android Setup
- [ ] `google-services.json` tải từ Firebase Console
- [ ] `google-services.json` đặt vào `apps/technician_app/android/app/`
- [ ] Dependencies khớp với customer app

### iOS Setup
- [ ] `GoogleService-Info.plist` tải từ Firebase Console
- [ ] `GoogleService-Info.plist` đặt vào `apps/technician_app/ios/Runner/`
- [ ] Xcode project cấu hình đúng

### Test
- [ ] `flutter pub get` chạy thành công
- [ ] `flutter run` hoạt động trên device/emulator
- [ ] Không có Firebase initialization errors

## Phase 5: Shared Package

- [ ] `packages/shared/lib/models/user.dart` tạo
- [ ] `packages/shared/lib/models/order.dart` tạo
- [ ] `packages/shared/lib/constants/app_constants.dart` tạo
- [ ] `path: ../../packages/shared` có trong pubspec.yaml của cả 2 Flutter app
- [ ] Models có thể import từ Flutter app

## Phase 6: Firebase Functions

- [ ] `firebase/functions/src/index.ts` tạo (TypeScript)
- [ ] `.python` file đã xóa
- [ ] `npm install` chạy trong `firebase/functions/`
- [ ] `firebase deploy --only functions` thành công

## Phase 7: Firestore Rules & Indexes

- [ ] `firebase/firestore.rules` update với quy tắc bảo mật
- [ ] `firebase deploy --only firestore:rules` chạy thành công
- [ ] Firestore indexes tạo (nếu cần)

## Phase 8: Verification

### Admin Web
```bash
cd apps/admin_web
npm run dev
# ✓ Truy cập http://localhost:5173
# ✓ Không có lỗi Firebase trong console
```

- [ ] Chạy thành công
- [ ] Không lỗi connection

### Customer App
```bash
cd apps/customer_app
flutter run
# ✓ App khởi động thành công
# ✓ Firebase initialized thành công
```

- [ ] Chạy thành công
- [ ] Không lỗi Firebase

### Technician App
```bash
cd apps/technician_app
flutter run
# ✓ App khởi động thành công
# ✓ Firebase initialized thành công
```

- [ ] Chạy thành công
- [ ] Không lỗi Firebase

## Phase 9: Test Firebase Operations

### Authentication
- [ ] Có thể tạo user mới qua Firebase Console
- [ ] Admin Web có thể đọc dữ liệu từ Firestore (nếu rules cho phép)
- [ ] Flutter apps có thể authenticate

### Firestore
- [ ] Có thể tạo collection test
- [ ] Có thể ghi dữ liệu từ client
- [ ] Có thể đọc dữ liệu từ client
- [ ] Rules hoạt động đúng (allow/deny hợp lý)

### Functions
- [ ] Functions deploy thành công
- [ ] Có thể call function từ client (nếu test)

## Optional: Firebase Emulator (Local Dev)

- [ ] `firebase emulators:start` hoạt động
- [ ] Emulator UI accessible tại http://localhost:4000
- [ ] Apps kết nối emulator thành công (trong dev mode)

## 🎉 Hoàn tất!

Khi tất cả các mục checked, Firebase setup hoàn tất!

### Tiếp theo:
1. Tạo feature screens (customer_app, technician_app)
2. Implement authentication flows
3. Tạo data models & services
4. Setup state management (Provider/Riverpod)
5. Unit & integration tests

---

### Liên hệ & Support

Nếu gặp vấn đề, xem chi tiết tại:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
