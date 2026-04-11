# 🌊 AquaCareSystem

Hệ thống quản lý cửa hàng máy lọc nước toàn diện - Monorepo với 3 ứng dụng (Customer, Technician, Admin)

## 📱 Các ứng dụng

- **Customer App** (Flutter) - Đặt hàng, theo dõi thiết bị, quản lý bảo hành
- **Technician App** (Flutter) - Quản lý công việc, chụp ảnh xác nhận, nhận COD
- **Admin Web** (React/TypeScript) - Quản lý toàn bộ hệ thống, báo cáo, KPI

## 🏗️ Stack công nghệ

- **Frontend**: Flutter (Dart), React + TypeScript, Vite
- **Backend**: Firebase (Firestore, Auth, Functions, Storage, FCM)
- **State Management**: Riverpod (Flutter), Zustand/Redux (Web)
- **Routing**: GoRouter (Flutter), React Router (Web)

## 📚 Tài liệu

Vui lòng đọc các tài liệu trong folder `docs/`:
- [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) - Tổng quan hệ thống
- [CONVENTIONS.md](docs/CONVENTIONS.md) - Quy ước đặt tên và coding style
- [FIREBASE_GUIDE.md](docs/FIREBASE_GUIDE.md) - Hướng dẫn cấu hình Firebase
- [FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md) - Schema Firestore
- [PHASE_ROADMAP.md](docs/PHASE_ROADMAP.md) - Lộ trình phát triển

## 🚀 Quick Start

### 1. Cài đặt dependencies

```bash
# Cài Melos
dart pub global activate melos

# Bootstrap project
melos bootstrap
```

### 2. Chạy Flutter apps

```bash
# Customer app
cd apps/customer_app
flutter run

# Technician app
cd apps/technician_app
flutter run
```

### 3. Chạy Admin Web

```bash
cd apps/admin_web
npm install
npm run dev
```

### 4. Cấu hình Firebase

```bash
cd firebase
firebase init
firebase deploy
```

## 📦 Cấu trúc thư mục

```
AquaCareSystem/
├── docs/                    # Tài liệu dự án
├── packages/shared/         # Shared Dart package
├── apps/
│   ├── customer_app/       # Flutter customer app
│   ├── technician_app/     # Flutter technician app
│   └── admin_web/          # React admin web
├── firebase/               # Firebase backend
├── infrastructure/         # Docker, scripts
├── .github/workflows/      # CI/CD pipelines
└── melos.yaml             # Monorepo config
```

## 📋 Development

### Branch naming convention

```
feature/[app]-[feature-name]
fix/[app]-[issue-name]
docs/[topic]
```

### Commit message format

```
[type]([scope]): [subject]

[body]
[footer]
```

Types: feat, fix, docs, style, refactor, perf, test, chore

## 🔄 Workflows

- `ci_functions.yml` - Deploy Cloud Functions
- `ci_admin_web.yml` - Deploy Admin Web
- `ci_flutter_customer.yml` - Build Customer App
- `ci_flutter_technician.yml` - Build Technician App

## 📞 Support

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết hướng dẫn đóng góp.

---

**Created**: 2024 | **Org**: AquaCare System
