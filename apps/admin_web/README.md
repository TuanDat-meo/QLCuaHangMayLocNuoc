# 🌐 Admin Web — React + TypeScript

Dashboard quản lý toàn bộ hệ thống AquaCareSystem.

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (Material Design 3)
- React Router v6
- Zustand (state management)
- TanStack Query (data fetching)
- Recharts (biểu đồ)
- Firebase Web SDK

## 🚀 Chạy development

```bash
cd apps/admin_web
npm install
npm run dev
# http://localhost:5173
```

Cần có Firebase Emulator chạy trước:
```bash
cd firebase && firebase emulators:start
```

## 🔐 Environment

Tạo file `.env.local` (xem `.env.example`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 📂 Cấu trúc src/

```
src/
├── app/                  # Config (routes, firebase, theme)
├── components/
│   └── layouts/          # MainLayout, Sidebar, Header
├── pages/
│   ├── auth/             # Login, ForgotPassword, ResetPassword
│   ├── DashboardPage/
│   ├── orders/
│   ├── products/
│   ├── technicians/
│   └── ...
├── services/             # Firebase service calls
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
├── models/               # TypeScript interfaces
└── index.css             # Design system utilities
```

## 📋 Modules & Routes

| Route | Module | Phase |
|-------|--------|-------|
| `/login` | Authentication | P1 ✅ |
| `/` | Dashboard KPI | P1 ✅ |
| `/products` | Quản lý sản phẩm | P1 ✅ |
| `/inventory` | Quản lý kho | P1-2 |
| `/orders` | Đơn hàng | P1 ✅ |
| `/technicians` | Kỹ thuật viên | P1 ✅ |
| `/assignments` | Phân công | P1 ✅ |
| `/devices` | Thiết bị | P2 |
| `/warranty` | Bảo hành | P2 |
| `/customers` | CRM Khách hàng | P2 |
| `/reports` | Báo cáo | P3 |
| `/settings` | Cài đặt | P1 ✅ |

## 🎨 Design System

- **Font**: Inter (Google Fonts)
- **Primary color**: `#00459a` (Water Blue)
- **Secondary**: `#00677d` (Teal)
- Utilities: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.input-field`, `.badge-*`
- Tokens defined in `tailwind.config.js` + `src/index.css`

## Scripts

```bash
npm run dev       # Dev server
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # ESLint
```
