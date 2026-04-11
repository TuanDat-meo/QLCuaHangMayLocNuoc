# Getting Started - AquaCareSystem

Hướng dẫn bắt đầu phát triển AquaCareSystem

## 📚 Tài liệu chính

Đọc các tài liệu theo thứ tự:

1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Tổng quan hệ thống (bắt buộc)
2. **[CONVENTIONS.md](CONVENTIONS.md)** - Quy ước code & naming (bắt buộc)
3. **[ENV_SETUP.md](ENV_SETUP.md)** - Cài đặt môi trường (bắt buộc)
4. **[FIREBASE_GUIDE.md](FIREBASE_GUIDE.md)** - Setup Firebase project
5. **[FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)** - Cấu trúc database
6. **[PHASE_ROADMAP.md](PHASE_ROADMAP.md)** - Lộ trình phát triển

## 🚀 Quick Start (5 phút)

### 1. Clone & Setup

```bash
cd AquaCareSystem

# Bootstrap monorepo
melos bootstrap
```

### 2. Configure Firebase

```bash
# Create Firebase project
firebase login
firebase init

# Setup .env
cp .env.example .env
# Edit .env với Firebase credentials
```

### 3. Run Apps

```bash
# Terminal 1 - Customer App
cd apps/customer_app
flutter run

# Terminal 2 - Technician App
cd apps/technician_app
flutter run

# Terminal 3 - Admin Web
cd apps/admin_web
npm run dev
```

## 📱 Cấu trúc 3 ứng dụng

### 🔵 Customer App (Flutter)
- Đặt hàng máy lọc nước
- Theo dõi bảo hành
- Nhận thông báo

**Bắt đầu**: [apps/customer_app/README.md](../apps/customer_app/README.md)

### 🟢 Technician App (Flutter)
- Nhận công việc
- Chỉ đường GPS
- Chụp ảnh xác nhận

**Bắt đầu**: [apps/technician_app/README.md](../apps/technician_app/README.md)

### 🟡 Admin Web (React + TypeScript)
- Dashboard KPI
- Quản lý sản phẩm
- Phân công KTV
- Báo cáo

**Bắt đầu**: [apps/admin_web/README.md](../apps/admin_web/README.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Customer | Technician | Admin Web  │
│       (Flutter x2 + React)          │
└──────────────────┬──────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Firebase Backend  │
        ├─────────────────────┤
        │ • Firestore (DB)    │
        │ • Auth (OTP)        │
        │ • Functions (Logic) │
        │ • Storage (Photos)  │
        │ • FCM (Messaging)   │
        └─────────────────────┘
```

## 💻 Development Workflow

### 1. Tạo branch

```bash
git checkout -b feature/customer-app-order-flow
```

### 2. Follow conventions

- Xem [CONVENTIONS.md](CONVENTIONS.md)
- Flutter: `flutter analyze && dart format lib/`
- React: `npm run lint && npm run format`

### 3. Commit

```bash
git commit -m "feat(customer-app): implement order flow with Google Places"
```

### 4. Push & PR

```bash
git push origin feature/customer-app-order-flow
# Open PR on GitHub
```

## 📋 Phase 1 Checklist

- [ ] Cái đặt Firebase project
- [ ] Clone repository
- [ ] Bootstrap Melos
- [ ] Run all 3 apps
- [ ] Tạo sample orders
- [ ] Tạo sample assignments
- [ ] Test order flow end-to-end

## 🆘 Gặp vấn đề?

### Flutter không chạy
```bash
flutter clean
flutter pub get
flutter run
```

### Admin Web không chạy
```bash
cd apps/admin_web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Firebase connection error
- Check .env credentials
- Verify Firebase project is active
- Check internet connection

## 📞 Support

- Check documentation in `docs/`
- Read existing README files
- Ask in team chat

## 🎯 Next Steps

1. ✅ Setup environment
2. ✅ Run all apps
3. Read PHASE_ROADMAP.md
4. Pick a feature to implement
5. Create PR with your changes

---

**Happy Coding! 🚀**

*Last Updated: 2024*
