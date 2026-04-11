# 🌐 Admin Web - React + TypeScript

Dashboard quản lý toàn bộ hệ thống AquaCareSystem

## 🎯 Chức năng Phase 1

- ✅ Dashboard KPI
- ✅ Quản lý sản phẩm
- ✅ Quản lý kho hàng
- ✅ Danh sách đơn hàng
- ✅ Danh sách KTV
- ✅ Phân công & lịch
- ✅ Cài đặt & phân quyền
- ✅ Audit log (Phase 2)

## 🚀 Quick Start

```bash
cd apps/admin_web

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint & format
npm run lint
npm run format
```

## 📂 Folder Structure

```
src/
├── main.tsx               # Entry point
├── App.tsx                # Root component
├── index.css              # Global styles
├── app/
│   ├── routes.tsx         # Route config
│   ├── firebase.config.ts
│   └── theme.ts           # Design tokens
├── models/                # TypeScript interfaces
├── views/                 # Pages (1 page = 1 business module)
│   ├── auth/
│   ├── dashboard/
│   ├── products/
│   ├── inventory/
│   ├── orders/
│   ├── technicians/
│   ├── assignments/
│   └── ...
├── widgets/               # Reusable components
├── utils/
│   ├── services/          # API calls
│   ├── hooks/             # Custom hooks
│   └── store/             # Zustand state
└── test/
```

## 🔐 Environment Variables

Tạo `.env.local`:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

## 📦 Dependencies

- `react`, `react-dom` v18
- `react-router-dom` v6
- `firebase` - Backend
- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `recharts` - Charts & graphs
- `react-hook-form` - Forms
- `tailwindcss` - Styling

## 🧪 Testing

```bash
npm run test
npm run test:ui
```

## 🌐 Modules (Pages)

| Module | Path | Phase | Status |
|--------|------|-------|--------|
| 4.0 Auth | `/login` | P1 | TODO |
| 4.1 Dashboard | `/` | P1 | TODO |
| 4.2 Products | `/products` | P1 | TODO |
| 4.3 Inventory | `/inventory` | P1-2 | TODO |
| 4.4 Orders | `/orders` | P1 | TODO |
| 4.5 Technicians | `/technicians` | P1 | TODO |
| 4.6 Assignments | `/assignments` | P1 | TODO |
| 4.7 Devices | `/devices` | P2 | TODO |
| 4.8 Warranty | `/warranty` | P2 | TODO |
| 4.9 Customers | `/customers` | P2 | TODO |
| 4.10 Reports | `/reports` | P3-4 | TODO |
| 4.11 Settings | `/settings` | P1 | TODO |
| 4.12 Audit Log | `/audit-log` | P2-3 | TODO |

## 📊 Dashboard KPI

- Doanh thu hôm nay / tháng / năm
- Số đơn hàng mới
- Số KTV hoạt động
- Đơn đang chờ phân công
- Top sản phẩm bán chạy

---

**Next Phase**: Advanced reports, Analytics, Chat
