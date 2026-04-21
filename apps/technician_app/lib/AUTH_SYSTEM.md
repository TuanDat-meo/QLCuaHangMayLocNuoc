# Technician App - Auth System Documentation

## Overview
Complete authentication system with Firestore database integration for the Technician mobile application.

## Architecture

### Components

#### 1. **Auth Service** (Shared Package)
- **Location**: `packages/shared/lib/services/auth_service.dart`
- **Responsibilities**:
  - Firebase Authentication (login, signup, password reset)
  - User data persistence to Firestore on signup
  - User profile loading from Firestore on login
  - Login history logging

**User Collection**: `nguoiDung`
```
uid: string
email: string
displayName: string
phoneNumber: string
role: string (technician, customer, admin)
avatar: string (optional)
isVerified: boolean
createdAt: timestamp
updatedAt: timestamp
```

#### 2. **Firestore User Service** (Technician App)
- **Location**: `lib/core/services/firestore_user_service.dart`
- **Responsibilities**:
  - Read user profiles from Firestore
  - Update user profile information
  - Update technician-specific data (specializations, availability)
  - Retrieve all technicians
  - Delete user data

**Key Methods**:
```dart
// Get user profile
Future<AuthUser?> getUserProfile(String uid)

// Update profile
Future<void> updateUserProfile(String uid, Map<String, dynamic> data)

// Update specialization
Future<void> updateSpecialization(String uid, List<String> specializations)

// Update availability
Future<void> updateAvailabilityStatus(String uid, bool isAvailable)

// Get all technicians
Future<List<AuthUser>> getAllTechnicians()

// Delete user data
Future<void> deleteUserData(String uid)
```

#### 3. **Auth Controller** (Technician App)
- **Location**: `lib/controllers/auth_controller.dart`
- **Responsibilities**:
  - State management for auth operations (using Provider)
  - Integration of AuthService and FirestoreUserService
  - Error handling and loading states
  - User profile updates

**Key Methods**:
```dart
// Authentication
Future<bool> login(String email, String password)
Future<bool> signup(String email, String password, String displayName, String phoneNumber)
Future<bool> sendPasswordReset(String email)
Future<bool> resetPassword(String code, String newPassword)
Future<void> logout()

// Profile Management
Future<bool> updateProfile(Map<String, dynamic> updates)
Future<bool> updateSpecialization(List<String> specializations)
Future<bool> updateAvailability(bool isAvailable)
```

#### 4. **Auth Models** (Technician App)
- **Location**: `lib/models/auth_models.dart`
- **Models**:
  - `LoginRequest`: Email & password for login
  - `SignupRequest`: Signup form data
  - `AuthResponse`: API response wrapper
  - `AuthUser`: Re-exported from shared package

#### 5. **Auth Screens** (Technician App)
- **Location**: `lib/features/auth/screens/`
- **Screens**:
  - `login_screen.dart`: User login
  - `signup_screen.dart`: New technician registration
  - `forgot_password_screen.dart`: Password reset request
  - `reset_password_screen.dart`: Complete password reset

---

## Data Flow

### Signup Flow
```
Signup Screen
    ↓
AuthController.signup()
    ↓
AuthService.signupWithEmail()
    ↓
Firebase Auth (create user)
    ↓
Firestore Save (nguoiDung collection)
    ↓
Controller updates state & notifies UI
```

### Login Flow
```
Login Screen
    ↓
AuthController.login()
    ↓
AuthService.loginWithEmail()
    ↓
Firebase Auth (verify credentials)
    ↓
Load from Firestore (getUserProfile)
    ↓
Controller stores user & notifies UI
```

### Profile Update Flow
```
User Screen
    ↓
AuthController.updateProfile()
    ↓
FirestoreUserService.updateUserProfile()
    ↓
Firestore Update (add updatedAt timestamp)
    ↓
Reload profile & update controller state
    ↓
Notify UI with updated data
```

---

## Database Schema

### Users Collection (`nguoiDung`)

```firestore
collection: nguoiDung
├── {uid: technician1}
│   ├── uid: "technician1"
│   ├── email: "tech@example.com"
│   ├── displayName: "Nguyễn Văn A"
│   ├── phoneNumber: "+84987654321"
│   ├── role: "technician"
│   ├── avatar: "https://..."
│   ├── isVerified: true
│   ├── specializations: ["water_filter", "repair"]
│   ├── isAvailable: true
│   ├── lastStatusUpdate: timestamp
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
```

---

## Cleanup & Restructure Summary

### Removed Empty Directories
- ✅ `lib/views/` - Empty folder (no functionality)
- ✅ `lib/utils/` - Empty folder (use shared utilities instead)
- ✅ `lib/shared/` - Empty folder (use packages/shared instead)

### Consolidated Structure
- ✅ Auth models now re-export `AuthUser` from shared package
- ✅ Single source of truth for user models
- ✅ Auth controller integrates both AuthService and FirestoreUserService
- ✅ Proper separation of concerns

### Final Directory Structure
```
lib/
├── controllers/
│   └── auth_controller.dart          # State management
├── core/
│   ├── routing/
│   │   └── auth_routing.dart
│   └── services/
│       ├── firebase_service.dart     # Firebase provider
│       └── firestore_user_service.dart  # User DB operations ⭐ NEW
├── features/
│   └── auth/
│       └── screens/
│           ├── login_screen.dart
│           ├── signup_screen.dart
│           ├── forgot_password_screen.dart
│           └── reset_password_screen.dart
├── models/
│   └── auth_models.dart              # Updated (exports shared AuthUser)
├── widgets/
│   ├── email_input_field.dart
│   └── password_input_field.dart
├── firebase_options.dart
└── main.dart
```

---

## Usage Examples

### In Screens

```dart
// Example: Login Screen
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthController>(
      builder: (context, authController, _) {
        return Form(
          onSubmitted: (_) async {
            final success = await authController.login(
              emailController.text,
              passwordController.text,
            );
            
            if (success) {
              // Navigate to dashboard
              Navigator.of(context).pushReplacementNamed('/dashboard');
            } else {
              // Show error
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(authController.error ?? 'Error')),
              );
            }
          },
          child: Column(
            children: [
              EmailInputField(controller: emailController),
              PasswordInputField(controller: passwordController),
              if (authController.isLoading)
                CircularProgressIndicator()
              else
                ElevatedButton(
                  onPressed: () => authController.login(...),
                  child: Text('Đăng nhập'),
                ),
            ],
          ),
        );
      },
    );
  }
}
```

### Update Profile Example

```dart
// Update specialization
await authController.updateSpecialization(['water_filter', 'repair']);

// Update availability
await authController.updateAvailability(true);

// Custom update
await authController.updateProfile({
  'avatar': 'https://...',
  'specializations': ['water_filter'],
});
```

---

## Firebase Firestore Rules

Ensure rules allow technicians to:
- Read/write their own profile
- Read other technicians (for admin features)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /nguoiDung/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth.uid == userId;
      
      // Anyone can read technician listings
      allow read: if request.auth != null && 
                     resource.data.role == 'technician';
    }
  }
}
```

---

## Next Steps

1. ✅ Implement database operations
2. ⏳ Add role-based access control (RBAC)
3. ⏳ Implement caching/offline support
4. ⏳ Add audit logging for sensitive operations
5. ⏳ Create analytics tracking

---

## Troubleshooting

### User data not persisting
- Check Firestore rules allow write access
- Verify Firebase project configuration
- Check `firebase_options.dart` is correctly generated

### Profile not loading on login
- Ensure user document exists in Firestore
- Check network connectivity
- Verify collection name is `nguoiDung`

### Update profile fails
- Confirm user is logged in (`_currentUser != null`)
- Check Firestore rules
- Verify updated fields are valid

---

**Last Updated**: April 18, 2026
**Version**: 1.0.0
