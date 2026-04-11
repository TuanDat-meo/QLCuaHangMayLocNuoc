# 🗺️ Phase Roadmap

Lộ trình phát triển AquaCareSystem từ Phase 1 → 4

## 📊 Timeline Overview

### Phase 1: Core (Tháng 1-2)

**Mục tiêu**: Vòng đời đơn hàng khép kín, đặt hàng → lắp đặt → hoàn tất

#### Customer App
- [x] Onboarding & Đăng ký OTP
- [x] Trang chủ + Banner
- [x] Danh sách sản phẩm + Tìm kiếm
- [x] Đặt hàng với Google Places (chọn địa chỉ)
- [x] Theo dõi đơn hàng real-time
- [x] Wishlist
- [x] Hồ sơ tài khoản
- [x] Thông báo FCM

#### Technician App
- [x] Đăng nhập + OTP
- [x] Danh sách công việc hôm nay
- [x] Chi tiết đơn + thông tin khách
- [x] Google Maps chỉ đường
- [x] Chụp ≤5 ảnh xác nhận
- [x] Nhập COD + Tip
- [x] Thông báo FCM
- [x] Hồ sơ tài khoản

#### Admin Web
- [x] Dashboard KPI (doanh thu, đơn hôm nay, KTV online)
- [x] Quản lý sản phẩm & danh mục
- [x] Quản lý kho hàng
- [x] Danh sách đơn hàng + filter/search
- [x] Danh sách KTV + rating
- [x] Phân công KTV cho đơn hàng
- [x] Cài đặt & Phân quyền (admin/tech/customer)

#### Firebase Backend
- [x] `onOrderCreated` - Gửi notification admin
- [x] `onStatusChanged` - FCM theo trạng thái
- [x] `onCompletionSubmitted` - Ghi nhận COD + ảnh
- [x] `setCustomClaims` - Phân quyền role
- [x] `verifyOtp` - Xác thực OTP
- [x] `checkStockOnOrder` - Kiểm tra tồn kho
- [x] Security Rules - Firestore, Storage

---

### Phase 2: Expansion (Tháng 3-4)

**Mục tiêu**: Mở rộng tính năng - pre-order, thiết bị, bảo hành, bảo trì

#### Features
- [ ] Pre-order khi hết hàng → Notification khi còn hàng
- [ ] Quản lý thiết bị (serial, QR code)
- [ ] Bảo hành tự động - device_status = "warranty_active"
- [ ] Bảo trì định kỳ - nhắc nhở 7 ngày trước
- [ ] CRM khách hàng - lịch sử mua, liên hệ
- [ ] Audit log - ghi hành động admin
- [ ] Multi-photo gallery từ KTV

#### Customer App
- [ ] My Devices screen
- [ ] Warranty status view
- [ ] Schedule maintenance
- [ ] Receive maintenance reminders

#### Admin Web
- [ ] 4.7 Devices management
- [ ] 4.8 Warranty & Maintenance
- [ ] 4.9 Customer CRM
- [ ] 4.12 Audit Log viewer
- [ ] Pre-order management

#### Firebase
- [ ] `createOnInstallation` - Auto create warranty
- [ ] `scheduleReminders` - Cron job bảo trì
- [ ] `onStockBelowThreshold` - Alert kho
- [ ] `auditLog` - Track all admin actions

---

### Phase 3: Reporting (Tháng 5)

**Mục tiêu**: Advanced analytics & reports

#### Features
- [ ] Revenue reports - Daily/Monthly/Yearly
- [ ] Technician performance - Orders completed, rating, speed
- [ ] Inventory reports - Stock levels, turnover
- [ ] Customer analytics - Repeat buyers, LTV
- [ ] Export Excel/PDF
- [ ] Custom date range filters

#### Admin Web
- [ ] 4.10 Reports module (Revenue, Performance, Inventory)
- [ ] Dashboard charts upgrade
- [ ] Export functionality

#### Firebase
- [ ] `generateDailyReport` - Cloud Scheduler
- [ ] `exportExcel` - Callable function
- [ ] `exportPdf` - Callable function

---

### Phase 4: Advanced Features (Tháng 6)

**Mục tiêu**: Polish, mobile features, realtime communication

#### Features
- [ ] QR Code scanning - Device check-in/check-out
- [ ] Chat realtime - Admin ↔ Customer support
- [ ] Push notifications - More granular
- [ ] Analytics dashboard - User engagement
- [ ] Web push notifications
- [ ] Offline support (SQLite for Flutter)

#### Technician App
- [ ] QR scan in device detail
- [ ] Check maintenance history

#### Customer App
- [ ] QR scan device to see warranty
- [ ] Chat with support
- [ ] Push notification preferences

#### Admin Web
- [ ] Live chat with customers
- [ ] Analytics dashboard
- [ ] Real-time notifications

#### Firebase
- [ ] `onQrScanned` - Track device events
- [ ] `onMessageCreated` - Chat FCM
- [ ] `sendPushNotification` - Enhanced FCM

---

## 📋 Database Milestones

### Phase 1 Ready Collections
- users ✓
- products ✓
- categories ✓
- orders ✓
- assignments ✓
- notifications ✓
- audit_log ✓

### Phase 2 New Collections
- devices ✓
- warranties ✓
- maintenance ✓
- pre_orders ✓

### Phase 3-4
- inventory (from Phase 1)
- analytics (new)

---

## 🔐 Auth & Permissions

### Phase 1 Roles
- **customer** - Browse, order, track
- **technician** - Accept jobs, complete work
- **admin** - Full access

### Phase 2+
- **support** - Chat, customer service
- **warehouse** - Inventory management
- **finance** - View reports

---

## 📱 UI/UX Priorities

### Phase 1
- Minimal, functional
- Focus on core features
- Native platform feel

### Phase 2-4
- Animations & micro-interactions
- Dark mode support
- Accessibility improvements
- Performance optimization

---

## 🚀 Deployment Strategy

- **Phase 1**: Closed beta → Selected partners
- **Phase 2**: Soft launch → 100 users
- **Phase 3**: Public launch → Scale
- **Phase 4**: Mature product → Expansion features

---

**Last Updated**: 2024  
**Status**: Ready for Phase 1 development
