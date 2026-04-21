# Hệ thống Xác thực (Authentication System) - AquaCare

## Tổng quan

Hệ thống xác thực của AquaCare cung cấp các chức năng:
- ✅ Đăng nhập (Login)
- ✅ Đăng ký (Signup)
- ✅ Quên mật khẩu (Forgot Password)
- ✅ Đặt lại mật khẩu (Reset Password)
- ✅ Lịch sử hoạt động xác thực
- ✅ Validation cho tất cả các trường nhập liệu

## Kiến trúc

### Web (React/TypeScript)

```
admin_web/src/
├── types/
│   └── auth.ts              # Type definitions
├── services/
│   └── authService.ts       # Firebase integration
├── hooks/
│   └── useAuth.ts           # Custom auth hooks
├── utils/
│   └── validation.ts        # Form validation
└── pages/auth/
    ├── LoginPage.tsx
    ├── SignupPage.tsx
    ├── ForgotPasswordPage.tsx
    └── ResetPasswordPage.tsx
```

### Mobile (Flutter)

```
packages/shared/
├── lib/
│   ├── services/
│   │   └── auth_service.dart       # Firebase integration
│   └── utils/
│       └── form_validator.dart     # Form validation

customer_app/lib/
├── features/auth/screens/
│   ├── login_screen.dart
│   ├── signup_screen.dart
│   ├── forgot_password_screen.dart
│   └── reset_password_screen.dart
└── core/routing/
    └── auth_routing.dart           # Route management

technician_app/lib/
└── (Same structure as customer_app)
```

## Setup & Configuration

### Web App

#### 1. Firebase Configuration

Tạo file `.env.local` trong thư mục `admin_web`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 2. Initialize Firebase (main.tsx)

```typescript
import { initializeFirebase } from './services/authService';

// Call on app mount
useEffect(() => {
  initializeFirebase();
}, []);
```

#### 3. Update App.tsx

```typescript
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Protected routes */}
      </Routes>
    </Router>
  );
};
```

### Mobile App (Flutter)

#### 1. Firebase Configuration

Chạy flutterfire configure:

```bash
flutterfire configure --project=your_firebase_project_id
```

#### 2. Update pubspec.yaml

```yaml
dependencies:
  firebase_core: ^latest
  firebase_auth: ^latest
  cloud_firestore: ^latest
```

#### 3. Update main.dart

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/routing/auth_routing.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: const AuthGate(),
      onGenerateRoute: authRouteGenerator,
    );
  }
}
```

## Firestore Collection Structure

### Collections cần tạo:

```
nguoiDung/
├── {uid}
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── phoneNumber: string
│   ├── role: 'customer' | 'technician' | 'admin'
│   ├── avatar: string (optional)
│   ├── isVerified: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

loginHistory/
├── {docId}
│   ├── userId: string
│   ├── email: string
│   ├── status: 'success' | 'failed'
│   ├── timestamp: timestamp
│   ├── ipAddress: string
│   └── userAgent: string

signupHistory/
├── {docId}
│   ├── userId: string
│   ├── email: string
│   ├── role: string
│   ├── timestamp: timestamp
│   ├── ipAddress: string
│   └── userAgent: string

passwordResetHistory/
├── {docId}
│   ├── email: string
│   ├── status: 'success' | 'failed'
│   ├── timestamp: timestamp
│   ├── ipAddress: string
│   ├── userAgent: string
│   └── method: 'email'
```

## Form Validation Rules

### Email
- Bắt buộc
- Định dạng email hợp lệ

### Password
- Bắt buộc
- Tối thiểu 8 ký tự
- Phải chứa: chữ hoa, chữ thường, số, ký tự đặc biệt (@$!%*?&)

### Phone Number (Vietnam)
- Bắt buộc
- Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx
- 10-11 ký tự

### Display Name
- Bắt buộc
- 2-50 ký tự

### Confirm Password
- Bắt buộc
- Phải khớp với password

## Sử dụng (Usage)

### Web App

#### Login

```typescript
import { useLogin } from './hooks/useAuth';

const { login, isLoading, error } = useLogin();

const handleLogin = async () => {
  try {
    const user = await login({
      email: 'user@example.com',
      password: 'Password123!',
    });
    console.log('Logged in:', user);
  } catch (err) {
    console.error('Login failed:', err);
  }
};
```

#### Signup

```typescript
import { useSignup } from './hooks/useAuth';

const { signup, isLoading, error } = useSignup();

const handleSignup = async () => {
  try {
    const user = await signup({
      email: 'user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      displayName: 'Nguyễn Văn A',
      phoneNumber: '0912345678',
      role: 'customer',
    });
    console.log('Signed up:', user);
  } catch (err) {
    console.error('Signup failed:', err);
  }
};
```

#### Forgot Password

```typescript
import { useForgotPassword } from './hooks/useAuth';

const { sendReset, isLoading, success } = useForgotPassword();

const handleForgotPassword = async () => {
  try {
    await sendReset('user@example.com');
    console.log('Reset email sent');
  } catch (err) {
    console.error('Send reset failed:', err);
  }
};
```

#### Logout

```typescript
import { useLogout } from './hooks/useAuth';

const { logout, isLoading } = useLogout();

const handleLogout = async () => {
  try {
    await logout();
    console.log('Logged out');
  } catch (err) {
    console.error('Logout failed:', err);
  }
};
```

### Mobile App

#### Login

```dart
import 'package:shared/services/auth_service.dart';

final authService = AuthService();

try {
  final user = await authService.loginWithEmail(
    email: 'user@example.com',
    password: 'Password123!',
  );
  print('Logged in: ${user.displayName}');
} on AuthException catch (e) {
  print('Login failed: ${e.message}');
}
```

#### Signup

```dart
try {
  final user = await authService.signupWithEmail(
    email: 'user@example.com',
    password: 'Password123!',
    displayName: 'Nguyễn Văn A',
    phoneNumber: '0912345678',
    role: 'customer',
  );
  print('Signed up: ${user.displayName}');
} on AuthException catch (e) {
  print('Signup failed: ${e.message}');
}
```

#### Listen to Auth State

```dart
StreamBuilder<AuthUser?>(
  stream: AuthService().currentUserStream,
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const CircularProgressIndicator();
    }
    
    if (snapshot.hasData && snapshot.data != null) {
      return Text('Welcome ${snapshot.data!.displayName}');
    }
    
    return const LoginScreen();
  },
)
```

## Password Reset Email Template

Firebase sẽ tự động gửi email reset. Bạn có thể custom template trong Firebase Console:

1. Vào Firebase Console → Authentication
2. Chọn "Email Templates" tab
3. Chọn "Password reset" email
4. Custom template theo ý của bạn

Template có thể chứa:
- `%%PASSWORD_RESET_LINK%%` - Reset link
- `%%USERNAME%%` - Username/email
- `%%EMAIL%%` - Email address

## Security Best Practices

✅ **Passwords**
- Tối thiểu 8 ký tự
- Bắt buộc chứa hoa, thường, số, ký tự đặc biệt
- Không lưu trữ plaintext

✅ **Session Management**
- Sử dụng browser local persistence (web)
- Automatic token refresh
- Timeout sau không hoạt động (optional)

✅ **Logging**
- Lưu lịch sử login/logout
- Ghi lại failed login attempts
- Lưu password reset history với IP & user agent

✅ **HTTPS Only**
- Tất cả traffic phải qua HTTPS
- Firebase Auth tự động enforce HTTPS

## Troubleshooting

### Email không gửi được

**Kiểm tra:**
- Firebase project đã enable Email/Password auth?
- SMTP settings trong Firebase?
- Email domain verified?

### Password reset code hết hạn

**Nguyên nhân:**
- Code hết hạn (mặc định 1 giờ)

**Giải pháp:**
- Yêu cầu reset lại
- Kiểm tra Firebase Console settings

### Validation errors

**Kiểm tra logs:**
```typescript
// Web
console.error('Validation errors:', errors);

// Mobile
debugPrint('Validation errors: $errors');
```

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Remember device
- [ ] Account recovery questions
- [ ] Email verification
- [ ] Device management
- [ ] Login history dashboard

---

**Phiên bản:** 1.0  
**Cập nhật:** 2024
