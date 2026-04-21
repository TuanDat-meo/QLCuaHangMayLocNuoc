# Technician App - Quick Reference Guide

## 📋 Changes Summary

### ✅ Removed (Cleanup)
- `lib/views/` - Empty directory
- `lib/utils/` - Empty directory  
- `lib/shared/` - Empty directory
- Duplicate model definitions

### ✅ Created (New Features)
- `lib/core/services/firestore_user_service.dart` - Database service for user profiles

### ✅ Updated (Improvements)
- `lib/models/auth_models.dart` - Now re-exports AuthUser from shared package
- `lib/controllers/auth_controller.dart` - Full Firestore integration

---

## 🗂️ Current Structure

```
lib/
├── controllers/
│   └── auth_controller.dart           ⭐ Updated with DB integration
├── core/
│   ├── routing/
│   └── services/
│       ├── firebase_service.dart
│       └── firestore_user_service.dart  ⭐ NEW
├── features/
│   └── auth/
│       └── screens/
│           ├── login_screen.dart
│           ├── signup_screen.dart
│           ├── forgot_password_screen.dart
│           └── reset_password_screen.dart
├── models/
│   └── auth_models.dart               ⭐ Updated (export AuthUser)
├── widgets/
│   ├── email_input_field.dart
│   └── password_input_field.dart
├── firebase_options.dart
├── main.dart
└── AUTH_SYSTEM.md                     ⭐ NEW - Complete docs
```

---

## 🚀 Key Features

### 1. **Authentication**
- Email/password signup and login
- Password reset functionality
- Firebase Auth + Firestore integration

### 2. **Database Operations**
- Automatic user profile save on signup
- Profile loading on login
- Update profile, specializations, availability
- Query all technicians

### 3. **State Management**
- Provider-based state management
- Error handling and loading states
- Automatic profile reload after updates

---

## 💾 Database Schema

**Collection**: `nguoiDung`
```json
{
  "uid": "tech123",
  "email": "tech@example.com",
  "displayName": "Nguyễn Văn A",
  "phoneNumber": "+84987654321",
  "role": "technician",
  "avatar": "https://...",
  "isVerified": true,
  "specializations": ["water_filter", "repair"],
  "isAvailable": true,
  "lastStatusUpdate": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-01T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 🔧 Usage Examples

### Import in Screens
```dart
import 'package:provider/provider.dart';
import '../../controllers/auth_controller.dart';
```

### Login
```dart
final authController = context.read<AuthController>();
final success = await authController.login(email, password);
if (success) {
  // Navigate to dashboard
  Navigator.of(context).pushReplacementNamed('/dashboard');
}
```

### Signup
```dart
final success = await authController.signup(
  email: email,
  password: password,
  displayName: displayName,
  phoneNumber: phoneNumber,
);
```

### Update Profile
```dart
// Update specialization
await authController.updateSpecialization(['water_filter', 'repair']);

// Update availability
await authController.updateAvailability(true);

// Custom update
await authController.updateProfile({
  'avatar': 'https://...',
});
```

### Observe State
```dart
Consumer<AuthController>(
  builder: (context, authController, _) {
    if (authController.isLoading) {
      return CircularProgressIndicator();
    }
    
    if (authController.error != null) {
      return Text(authController.error!);
    }
    
    final user = authController.currentUser;
    return Text('Welcome ${user?.displayName}');
  },
)
```

---

## ✨ Features by Method

### AuthController Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `login()` | Email/password login | `Future<bool>` |
| `signup()` | Register new technician | `Future<bool>` |
| `logout()` | Sign out | `Future<void>` |
| `sendPasswordReset()` | Request password reset | `Future<bool>` |
| `resetPassword()` | Complete password reset | `Future<bool>` |
| `updateProfile()` | Update user profile | `Future<bool>` |
| `updateSpecialization()` | Update specializations | `Future<bool>` |
| `updateAvailability()` | Change availability status | `Future<bool>` |

### FirestoreUserService Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `getUserProfile()` | Get user from DB | `Future<AuthUser?>` |
| `updateUserProfile()` | Update user data | `Future<void>` |
| `updateSpecialization()` | Update specializations | `Future<void>` |
| `updateAvailabilityStatus()` | Change availability | `Future<void>` |
| `getAllTechnicians()` | Get all technicians | `Future<List<AuthUser>>` |
| `deleteUserData()` | Delete user record | `Future<void>` |

---

## 🔐 Security Notes

1. **Firestore Rules**: Ensure users can only modify their own data
2. **Password Reset**: Sent via email for verification
3. **Email Verification**: Track with `isVerified` field
4. **Role-Based Access**: Use `role` field for permissions

---

## 📱 Integration with Screens

All 4 auth screens already integrated:
- ✅ `login_screen.dart` - Uses AuthController
- ✅ `signup_screen.dart` - Uses AuthController  
- ✅ `forgot_password_screen.dart` - Uses AuthController
- ✅ `reset_password_screen.dart` - Uses AuthController

---

## 🐛 Troubleshooting

### Issue: User not found after signup
- **Cause**: Firestore collection name mismatch
- **Fix**: Verify collection is named `nguoiDung`

### Issue: Profile won't update
- **Cause**: No active user session
- **Fix**: Check `authController.currentUser` is not null

### Issue: Firestore write fails
- **Cause**: Security rules too restrictive
- **Fix**: Allow authenticated user writes

---

## 📞 Support Files

- `lib/AUTH_SYSTEM.md` - Complete system documentation
- `packages/shared/lib/services/auth_service.dart` - Base auth service
- `lib/core/services/firestore_user_service.dart` - Database service

---

**Status**: ✅ Complete & Ready for Use
**Date**: April 18, 2026
**Version**: 1.0.0
