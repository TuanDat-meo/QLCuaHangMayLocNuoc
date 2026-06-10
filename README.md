# 🌊 AquaCareSystem

Hệ thống quản lý cửa hàng máy lọc nước toàn diện — Kiến trúc Monorepo gồm 3 ứng dụng chính (Khách hàng, Kỹ thuật viên, Quản trị viên).

---

## 📱 Các ứng dụng

| Ứng dụng | Công nghệ | Mô tả & Chức năng chính |
|----------|-----------|-------------------------|
| **Customer App** | Flutter | Đặt hàng, theo dõi thiết bị, quản lý bảo hành và lịch sử bảo trì. |
| **Technician App** | Flutter | Quản lý công việc được giao, chụp ảnh xác nhận thi công, cập nhật trạng thái và nhận thanh toán COD. |
| **Admin Web** | React + TS + Vite | **Quản trị hệ thống**: Dashboard KPI, quản lý toàn bộ hệ thống. Bao gồm các chức năng **CRUD người dùng** (Thêm, Sửa, Xóa) và **chỉnh sửa mật khẩu**. Quản lý đơn hàng, thiết bị và báo cáo chi tiết. |

---

## 🏗️ Công nghệ sử dụng (Tech Stack)

- **Frontend**: Flutter (Dart), React + TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage, FCM)
- **Quản lý trạng thái**: Riverpod (Flutter) · Zustand (Web)
- **Điều hướng (Routing)**: GoRouter (Flutter) · React Router (Web)
- **Quản lý Monorepo**: Melos

---

## 📂 Cấu trúc thư mục

```
AquaCareSystem/
├── apps/
│   ├── admin_web/          # Giao diện Quản trị (Vite + TypeScript)
│   ├── customer_app/       # Ứng dụng cho Khách hàng (Flutter)
│   └── technician_app/     # Ứng dụng cho Kỹ thuật viên (Flutter)
├── packages/
│   └── shared/             # Gói Dart dùng chung (models, constants)
├── firebase/               # Cấu hình Firebase (Functions, Rules, Indexes)
├── infrastructure/         # Docker & các kịch bản triển khai
├── docs/                   # Tài liệu kỹ thuật chi tiết
└── .github/workflows/      # Luồng CI/CD tự động
```

---

## 🚀 Hướng dẫn khởi chạy nhanh (Quick Start)

### Yêu cầu hệ thống

- Flutter SDK ≥ 3.x
- Node.js ≥ 18.x
- Firebase CLI (`npm install -g firebase-tools`)
- Dart Melos (`dart pub global activate melos`)

### 1. Sao chép dự án & Cài đặt

```bash
git clone <repo-url>
cd AquaCareSystem
melos bootstrap
```

### 2. Cấu hình Firebase

1. Tạo dự án Firebase tại [console.firebase.google.com](https://console.firebase.google.com)
2. Kích hoạt các dịch vụ: **Authentication** (Email/Password), **Firestore**, **Storage**, **Functions**
3. Sao chép thông tin cấu hình vào các tệp sau:
   - `apps/admin_web/.env.local` (xem mẫu tại `.env.example`)
   - `apps/customer_app/lib/firebase_options.dart`
   - `apps/technician_app/lib/firebase_options.dart`

Xem hướng dẫn chi tiết tại → [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md)

### 3. Chạy môi trường phát triển (Development)

**Khởi chạy Firebase Emulator (giữ terminal này luôn mở):**
```bash
cd firebase
firebase emulators:start
# Giao diện Emulator UI: http://localhost:4000
```

**Admin Web:**
```bash
cd apps/admin_web
npm install
npm run dev
# Truy cập tại: http://localhost:5173
```

**Ứng dụng Flutter:**
```bash
# Ứng dụng Khách hàng
cd apps/customer_app && flutter run -d chrome

# Ứng dụng Kỹ thuật viên
cd apps/technician_app && flutter run -d chrome
```

---

## 📊 Lộ trình phát triển (Roadmap)

| Giai đoạn | Thời gian | Mục tiêu chính |
|-----------|-----------|----------------|
| **Phase 1** | Tháng 1–2 | Luồng nghiệp vụ cốt lõi: Đặt hàng → Lắp đặt → Hoàn tất |
| **Phase 2** | Tháng 3–4 | Mở rộng: Quản lý thiết bị, bảo hành, nhắc lịch bảo trì |
| **Phase 3** | Tháng 5 | Báo cáo nâng cao, xuất dữ liệu Excel/PDF |
| **Phase 4** | Tháng 6 | Tích hợp mã QR, Chat trực tuyến, Chế độ ngoại tuyến |

Chi tiết xem tại → [`docs/PHASE_ROADMAP.md`](docs/PHASE_ROADMAP.md)

---

## 🔐 Cổng kết nối Firebase Emulator

| Dịch vụ | Cổng (Port) |
|---------|-------------|
| Emulator UI | 4000 |
| Firestore | 8080 |
| Auth | 9099 |
| Functions | 5001 |
| Storage | 9199 |

---

## 🔄 Quy trình CI/CD

- `ci_functions.yml` — Triển khai Cloud Functions
- `ci_admin_web.yml` — Triển khai Admin Web
- `ci_flutter_customer.yml` — Build ứng dụng Khách hàng
- `ci_flutter_technician.yml` — Build ứng dụng Kỹ thuật viên

---

## 📚 Tài liệu tham khảo

| Tệp tin | Nội dung |
|---------|----------|
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | **Hướng dẫn sử dụng chi tiết hệ thống** |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Tổng quan kiến trúc & chức năng |
| [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) | Hướng dẫn cấu hình Firebase đầy đủ |
| [`docs/FIRESTORE_SCHEMA.md`](docs/FIRESTORE_SCHEMA.md) | Cấu trúc dữ liệu Firestore |
| [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) | Quy ước đặt tên & phong cách lập trình |
| [`docs/PHASE_ROADMAP.md`](docs/PHASE_ROADMAP.md) | Lộ trình phát triển chi tiết theo giai đoạn |

---

## 🌿 Quy định về Nhánh (Branch) & Commit

**Quy ước đặt tên nhánh:**
```
feature/<tên-app>-<tính-năng>
fix/<tên-app>-<mô-tả-lỗi>
docs/<chủ-đề>
```

**Định dạng ghi chú (Commit):**
```
<loại>(<phạm-vi>): <mô tả ngắn bằng tiếng Việt>

Loại (Type): feat | fix | docs | style | refactor | perf | test | chore
```

---

**Dự án**: AquaCareSystem · **Khởi tạo**: 2024 · **Trạng thái**: 🚧 Đang phát triển Giai đoạn 1
