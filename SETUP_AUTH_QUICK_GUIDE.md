# Quick Setup Guide - Authentication System

## ⚡ 5 Bước Setup Nhanh

### Bước 1: Firebase Setup

1. **Tạo Firebase Project**
   - Vào [Firebase Console](https://console.firebase.google.com)
   - Tạo project mới
   - Enable Email/Password authentication

2. **Tạo Firestore Collections**
   - Cloud Firestore → Create Collection
   - Tạo collections: `nguoiDung`, `loginHistory`, `signupHistory`, `passwordResetHistory`

3. **Lấy Credentials**
   - Project Settings → Web App
   - Copy API keys

### Bước 2: Web App Setup

```bash
cd apps/admin_web

# Tạo .env.local
cp .env.example .env.local

# Điền Firebase credentials vào .env.local
VITE_FIREBASE_API_KEY=your_key
# ... (copy từ Firebase Console)

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Bước 3: Mobile App Setup (Flutter)

```bash
cd apps/customer_app

# Configure Firebase
flutterfire configure --project=your_firebase_project_id

# Install dependencies
flutter pub get

# Run app
flutter run
```

### Bước 4: Firestore Rules (Security)

Sao chép từ `firebase/firestore.rules` sang Firebase Console:
- Firestore Database → Rules
- Paste content từ file

### Bước 5: Test Authentication

**Web:**
```bash
npm run dev
# Truy cập: http://localhost:5173/login
```

**Mobile:**
```bash
flutter run
```

---

## 📝 File Structure

```
QLCuaHangMayLocNuoc/
├── apps/
│   ├── admin_web/src/
│   │   ├── types/auth.ts ✓
│   │   ├── services/authService.ts ✓
│   │   ├── hooks/useAuth.ts ✓
│   │   ├── utils/validation.ts ✓
│   │   └── pages/auth/
│   │       ├── LoginPage.tsx ✓
│   │       ├── SignupPage.tsx ✓
│   │       ├── ForgotPasswordPage.tsx ✓
│   │       └── ResetPasswordPage.tsx ✓
│   │
│   └── customer_app/lib/
│       ├── features/auth/screens/
│       │   ├── login_screen.dart ✓
│       │   ├── signup_screen.dart ✓
│       │   ├── forgot_password_screen.dart ✓
│       │   └── reset_password_screen.dart ✓
│       └── core/routing/
│           └── auth_routing.dart ✓
│
├── packages/shared/lib/
│   ├── services/auth_service.dart ✓
│   └── utils/form_validator.dart ✓
│
└── AUTH_SYSTEM_DOCUMENTATION.md ✓
```

---

## ✅ Các File Đã Tạo

**Web (React/TypeScript):**
- [x] Types & Interfaces
- [x] Firebase Auth Service  
- [x] Form Validation Utils
- [x] Custom Hooks
- [x] Login Page
- [x] Signup Page
- [x] Forgot Password Page
- [x] Reset Password Page
- [x] App.tsx Integration

**Mobile (Flutter):**
- [x] Auth Service (Shared)
- [x] Form Validator (Shared)
- [x] Login Screen
- [x] Signup Screen
- [x] Forgot Password Screen
- [x] Reset Password Screen
- [x] Auth Routing Handler

---

## 🔑 Key Features

### ✅ Validation
- Email validation
- Password strength (min 8 chars, must include uppercase, lowercase, number, special char)
- Phone number validation (Vietnam format)
- Display name validation
- Password confirmation

### ✅ Security
- Password reset history tracking
- Login attempt logging
- IP address & user agent tracking
- Email-based password recovery
- Firestore security rules

### ✅ User Experience
- Real-time error messages
- Loading states
- Success feedback
- Remember me option (web)
- Show/hide password
- Responsive design

---

## 🚀 Usage Examples

### Web - Login

```typescript
import { useLogin } from './hooks/useAuth';

export function LoginForm() {
  const { login, isLoading, error } = useLogin();
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      const user = await login({ email, password });
      console.log('Success:', user);
    } catch (err) {
      console.error('Error:', err);
    }
  };
}
```

### Mobile - Check Auth State

```dart
StreamBuilder<AuthUser?>(
  stream: AuthService().currentUserStream,
  builder: (context, snapshot) {
    if (snapshot.data != null) {
      return const HomePage(); // User logged in
    } else {
      return const LoginScreen(); // Show login
    }
  },
)
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Firebase not initialized | Call `initializeFirebase()` in App.tsx useEffect |
| .env.local not loading | Restart dev server |
| Validation errors | Check field values in console |
| Email not sending | Enable Email/Password in Firebase Console |
| Reset code expired | Retry password reset |
| Permission denied errors | Check Firestore rules |

---

## 📞 Support

- **Documentation:** See `AUTH_SYSTEM_DOCUMENTATION.md`
- **Firebase Docs:** https://firebase.google.com/docs
- **Flutter Docs:** https://flutter.dev/docs

---

**Status:** ✅ Ready for Development  
**Last Updated:** April 2024
