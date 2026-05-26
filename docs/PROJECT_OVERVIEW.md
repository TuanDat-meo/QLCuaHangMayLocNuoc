# 📋 Project Overview — AquaCareSystem

## 🎯 Mục tiêu

Xây dựng hệ thống quản lý bán hàng máy lọc nước toàn diện, bao gồm 3 thành phần:

| Ứng dụng | Người dùng | Chức năng chính |
|----------|-----------|-----------------|
| **Customer App** (Flutter) | Khách hàng | Đặt hàng, theo dõi, quản lý bảo hành |
| **Technician App** (Flutter) | Kỹ thuật viên | Nhận việc, chỉ đường, xác nhận lắp đặt, COD |
| **Admin Web** (React) | Admin | Dashboard KPI, quản lý sản phẩm/đơn hàng/kỹ thuật viên |

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────┐
│             Firebase Project (1 project)             │
│   Auth │ Firestore │ Storage │ Functions │ FCM       │
└──────────────────────────────────────────────────────┘
         │              │              │
   ┌─────────┐    ┌──────────┐   ┌───────────┐
   │  Admin  │    │ Customer │   │Technician │
   │   Web   │    │   App    │   │    App    │
   │ (React) │    │(Flutter) │   │ (Flutter) │
   └─────────┘    └──────────┘   └───────────┘
```

Mỗi app kết nối **trực tiếp** vào Firebase bằng credentials riêng, chia sẻ dữ liệu qua Firestore.

---

## 📊 Quy trình vòng đời đơn hàng

```
Khách → Đặt hàng → [Chờ duyệt]
                        ↓
              Admin → Phân công KTV
                        ↓
              KTV → Nhận → Chỉ đường → Lắp đặt
                        ↓
              KTV → Chụp ảnh + Nhập COD + Tip
                        ↓
              Khách ← Nhận thông báo hoàn tất
```

---

## 📱 Chức năng theo Phase

### Phase 1 — Core (bắt buộc)

**Customer App:**
- Onboarding & Đăng ký / Đăng nhập
- Trang chủ, danh sách sản phẩm, tìm kiếm
- Đặt hàng với Google Places
- Theo dõi đơn hàng real-time
- Thông báo FCM, Hồ sơ tài khoản

**Technician App:**
- Đăng nhập
- Danh sách công việc hôm nay
- Chi tiết đơn & thông tin khách hàng
- Google Maps chỉ đường
- Chụp ≤5 ảnh xác nhận
- Nhập COD + Tip

**Admin Web:**
- Dashboard KPI (doanh thu, đơn hôm nay, KTV online)
- Quản lý sản phẩm & danh mục
- Quản lý kho hàng
- Danh sách đơn hàng (filter/search)
- Danh sách KTV + rating
- Phân công KTV cho đơn
- Cài đặt & phân quyền

**Firebase Backend:**
- Cloud Functions: `onOrderCreated`, `onStatusChanged`, `onCompletionSubmitted`, `setCustomClaims`, `checkStockOnOrder`
- Security Rules: Firestore, Storage

### Phase 2 — Expansion
- Pre-order khi hết hàng
- Quản lý thiết bị & QR Code
- Bảo hành tự động, bảo trì định kỳ
- CRM khách hàng, Audit log

### Phase 3 — Reporting
- Báo cáo doanh thu / KTV / tồn kho
- Xuất Excel / PDF

### Phase 4 — Advanced
- Quét QR Code thiết bị
- Chat realtime Admin ↔ Khách
- Offline support (SQLite)

---

## 💾 Firestore Collections Chính

| Collection | Mô tả |
|-----------|-------|
| `users` | Thông tin người dùng (uid, name, phone, role) |
| `products` | Sản phẩm (tên, giá, mô tả, hình ảnh) |
| `orders` | Đơn hàng (trạng thái, khách, sản phẩm) |
| `assignments` | Phân công KTV cho đơn hàng |
| `devices` | Thiết bị đã lắp đặt (serial, QR, bảo hành) |
| `maintenance` | Lịch bảo trì định kỳ |
| `notifications` | Thông báo push FCM |
| `audit_log` | Lịch sử hành động admin |

Schema chi tiết → [`FIRESTORE_SCHEMA.md`](FIRESTORE_SCHEMA.md)

---

## 🔐 Phân quyền

| Role | Quyền |
|------|-------|
| `customer` | Xem sản phẩm, tạo/theo dõi đơn của mình |
| `technician` | Xem assignment của mình, cập nhật trạng thái |
| `admin` | Toàn quyền hệ thống |

Rules áp dụng qua **Firebase Custom Claims** + **Firestore Security Rules**.

---

Xem thêm: [`PHASE_ROADMAP.md`](PHASE_ROADMAP.md) | [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) | [`CONVENTIONS.md`](CONVENTIONS.md)
