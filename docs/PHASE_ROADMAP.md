# 🗺️ Phase Roadmap — AquaCareSystem

## Phase 1 — Core ✅ (Tháng 1–2)
> Vòng đời đơn hàng khép kín: Đặt hàng → Lắp đặt → Hoàn tất

### Customer App
- [x] Onboarding & Đăng ký / Đăng nhập
- [x] Trang chủ + Banner sản phẩm
- [x] Danh sách sản phẩm + Tìm kiếm
- [x] Đặt hàng với Google Places
- [x] Theo dõi đơn hàng real-time
- [x] Thông báo FCM
- [x] Hồ sơ tài khoản

### Technician App
- [x] Đăng nhập
- [x] Danh sách công việc hôm nay
- [x] Chi tiết đơn & thông tin khách
- [x] Google Maps chỉ đường
- [x] Chụp ≤5 ảnh xác nhận
- [x] Nhập COD + Tip
- [x] Thông báo FCM

### Admin Web
- [x] Dashboard KPI (doanh thu, đơn hôm nay, KTV online)
- [x] Quản lý sản phẩm & danh mục
- [x] Quản lý kho hàng
- [x] Danh sách đơn hàng (filter/search)
- [x] Danh sách KTV + rating
- [x] Phân công KTV cho đơn hàng
- [x] Cài đặt & phân quyền

### Firebase Backend
- [x] `onOrderCreated` — gửi notification cho admin
- [x] `onStatusChanged` — FCM theo trạng thái đơn
- [x] `onCompletionSubmitted` — ghi nhận COD + ảnh
- [x] `setCustomClaims` — phân quyền role
- [x] `checkStockOnOrder` — kiểm tra tồn kho
- [x] Security Rules — Firestore & Storage

---

## Phase 2 — Expansion ⏳ (Tháng 3–4)
> Mở rộng: thiết bị, bảo hành, bảo trì, CRM

- [ ] Pre-order khi hết hàng → Notify khi có hàng
- [ ] Quản lý thiết bị (serial, QR Code)
- [ ] Bảo hành tự động khi lắp đặt xong
- [ ] Bảo trì định kỳ — nhắc nhở 7 ngày trước
- [ ] CRM khách hàng — lịch sử mua, liên hệ
- [ ] Audit log — ghi lại hành động admin
- [ ] `createOnInstallation` — tự tạo warranty
- [ ] `scheduleReminders` — Cron job bảo trì
- [ ] `onStockBelowThreshold` — cảnh báo kho

---

## Phase 3 — Reporting ⏳ (Tháng 5)
> Báo cáo nâng cao & phân tích

- [ ] Báo cáo doanh thu (Ngày/Tháng/Năm)
- [ ] Báo cáo hiệu suất KTV (đơn hoàn thành, rating, tốc độ)
- [ ] Báo cáo tồn kho
- [ ] Phân tích khách hàng (LTV, khách quay lại)
- [ ] Xuất Excel / PDF
- [ ] `generateDailyReport` — Cloud Scheduler
- [ ] `exportExcel` / `exportPdf` — Callable Functions

---

## Phase 4 — Advanced ⏳ (Tháng 6)
> Tính năng cao cấp: QR, chat, offline

- [ ] Quét QR Code thiết bị — check-in/check-out
- [ ] Chat realtime Admin ↔ Khách
- [ ] Push notification chi tiết hơn
- [ ] Web push notifications
- [ ] Offline support (SQLite cho Flutter)
- [ ] `onQrScanned` — theo dõi sự kiện thiết bị
- [ ] `onMessageCreated` — Chat FCM
- [ ] Analytics dashboard — user engagement

---

## 📋 Collections Theo Phase

| Phase | Collections |
|-------|------------|
| Phase 1 | `users`, `products`, `orders`, `assignments`, `notifications`, `audit_log` |
| Phase 2 | + `devices`, `warranties`, `maintenance`, `pre_orders` |
| Phase 3–4 | + `analytics` |

---

## 🔐 Roles Theo Phase

| Phase | Roles |
|-------|-------|
| Phase 1 | `customer`, `technician`, `admin` |
| Phase 2+ | + `support`, `warehouse`, `finance` |

---

**Last Updated**: 2026-05-05 · **Status**: 🚧 Phase 1 Complete, Phase 2 In Progress
