# 📋 Project Overview - AquaCareSystem

## 🎯 Mục tiêu dự án

Xây dựng hệ thống quản lý bán hàng máy lọc nước toàn diện, bao gồm:
- Ứng dụng khách hàng: đặt hàng, theo dõi, quản lý bảo hành
- Ứng dụng kỹ thuật viên: quản lý công việc, xác nhận hoàn thành
- Trang quản lý admin: điều hành toàn hệ thống, báo cáo

## 🏗️ Kiến trúc hệ thống

### 3 thành phần chính

1. **Customer App (Flutter)**
   - Đặt hàng máy lọc nước
   - Theo dõi trạng thái đơn hàng
   - Quản lý thiết bị & bảo hành
   - Liên hệ kỹ thuật viên
   - Đánh giá, phản hồi

2. **Technician App (Flutter)**
   - Nhận công việc từ admin
   - Chỉ đường bằng Google Maps
   - Chụp ảnh xác nhận
   - Nhận tiền COD + ghi tip
   - Xem lịch làm việc

3. **Admin Web (React)**
   - Dashboard KPI
   - Quản lý sản phẩm & kho
   - Quản lý đơn hàng
   - Phân công kỹ thuật viên
   - Báo cáo doanh thu, hiệu suất
   - Quản lý bảo hành & bảo trì

### Backend - Firebase

- **Authentication**: OTP, Custom claims cho phân quyền
- **Firestore**: Lưu trữ dữ liệu (orders, products, users, etc.)
- **Cloud Functions**: Xử lý business logic (notifications, stock checking)
- **Storage**: Lưu ảnh chụp từ kỹ thuật viên
- **FCM**: Push notifications

## 📊 Quy trình vòng đời đơn hàng (Phase 1)

```
Khách → Đặt hàng → Chờ duyệt
         ↓
Admin → Phân công KTV
         ↓
KTV → Nhận việc → Chỉ đường → Trước lắp → Lắp đặt
         ↓
KTV → Chụp ảnh → Nhập COD + Tip → Gửi
         ↓
Khách ← Nhận thông báo hoàn thành ← Đơn hoàn tất
```

## 📱 Danh sách chức năng

### Phase 1 (Core - Bắt buộc)

**Customer App:**
- Onboarding & Đăng ký OTP
- Trang chủ, danh sách sản phẩm
- Đặt hàng với Google Places
- Tra cứu đơn hàng
- Thông báo FCM
- Hồ sơ tài khoản

**Technician App:**
- Đăng nhập
- Danh sách việc hôm nay
- Chi tiết đơn & thông tin khách
- Google Maps chỉ đường
- Chụp ≤5 ảnh xác nhận
- Nhập COD + tip

**Admin Web:**
- Dashboard KPI (doanh thu, đơn hôm nay, KTV)
- Quản lý sản phẩm
- Quản lý kho hàng
- Danh sách đơn hàng
- Danh sách kỹ thuật viên
- Phân công & xem lịch
- Cài đặt & phân quyền

### Phase 2 (Expansion)

- Pre-order khi hết hàng
- Quản lý thiết bị & QR Code
- Bảo hành tự động
- Bảo trì định kỳ (nhắc nhở)
- CRM khách hàng

### Phase 3 (Reporting)

- Báo cáo doanh thu chi tiết
- Báo cáo hiệu suất KTV
- Báo cáo tồn kho
- Xuất Excel/PDF

### Phase 4 (Advanced)

- Quét QR Code thiết bị
- Chat realtime Admin ↔ Khách
- Audit log hành động

## 💾 Cơ sở dữ liệu - Firestore Schema

### Collections chính

1. **users**
   - uid (PK)
   - name, phone, email
   - address
   - role: "customer" | "technician" | "admin"

2. **products**
   - pid (PK)
   - name, description, price
   - specs (model, capacity, warranty_years)
   - category, image_url

3. **orders**
   - oid (PK)
   - customer_id (FK)
   - product_id (FK)
   - quantity, total_price
   - status: pending → assigned → in_progress → completed
   - delivery_address
   - created_at, updated_at

4. **assignments**
   - aid (PK)
   - order_id (FK)
   - technician_id (FK)
   - status: assigned → accepted → on_route → arrived → in_progress → completed
   - assigned_at, completed_at

5. **devices**
   - did (PK)
   - order_id (FK)
   - customer_id (FK)
   - serial_number, qr_code
   - install_date, warranty_until
   - status: installing → active → warranty_ended

6. **maintenance**
   - mid (PK)
   - device_id (FK)
   - scheduled_date, completed_date
   - status: scheduled → in_progress → completed
   - notes

## 🔐 Security & Permissions

### Firestore Rules

- Users chỉ có thể đọc/sửa dữ liệu của mình
- Admin có quyền đọc/sửa mọi dữ liệu
- Technician có quyền xem assignment của mình
- Public: đọc products, categories

## 🕐 Timeline

| Phase | Khoảng thời gian | Mục tiêu |
|---|---|---|
| Phase 1 | Tháng 1-2 | Core functionality |
| Phase 2 | Tháng 3-4 | Expansion features |
| Phase 3 | Tháng 5 | Advanced reporting |
| Phase 4 | Tháng 6 | Polish & Deploy |

---

Xem [PHASE_ROADMAP.md](PHASE_ROADMAP.md) để biết chi tiết từng phase.
