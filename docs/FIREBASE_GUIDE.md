# 🔥 Firebase Configuration Guide

## 1️⃣ Tạo Firebase Project

### Bước 1: Vào Firebase Console
1. Truy cập [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Create a project"
3. Nhập tên project: `aquacare-system`
4. Chọn location (Đông Nam Á)

### Bước 2: Enable Firebase Services

#### Authentication
1. Console > Authentication > Get started
2. Enable email/password signin
3. Enable custom claims (dùng cho roles)

#### Firestore Database
1. Console > Firestore Database > Create Database
2. Chọn "Start in test mode" (tạo bước ngoài sau)
3. Chọn region: asia-southeast1

#### Cloud Storage
1. Console > Storage > Get started
2. Chọn region tương tự

#### Cloud Functions
1. Console > Functions > Get started
2. Chọn runtime: Node.js 18

#### Cloud Messaging (FCM)
1. Console > Cloud Messaging
2. Lấy Server Key (dùng cho backend gửi notifications)

## 2️⃣ Cấu hình Flutter Apps

### android/app/build.gradle

```gradle
// Thêm Google Services plugin
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'com.google.gms.google-services'
}
```

### ios/Podfile

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'FIREBASE_ANALYTICS_COLLECTION_ENABLED=1',
      ]
    end
  end
end
```

## 3️⃣ Cấu hình Web Admin

### firebase.config.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
```

## 4️⃣ Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc ghi dữ liệu của chính mình
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role == 'admin';
    }
    
    // Sản phẩm công khai đọc
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.role == 'admin';
    }
    
    // Đơn hàng
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.customer_id 
                      || request.auth.token.role == 'admin'
                      || request.auth.token.role == 'technician';
      allow create: if request.auth.uid == request.resource.data.customer_id;
      allow update, delete: if request.auth.uid == resource.data.customer_id 
                                  || request.auth.token.role == 'admin';
    }
    
    // Admin only
    match /admin/{document=**} {
      allow read, write: if request.auth.token.role == 'admin';
    }
    
    // Deny by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 5️⃣ Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Ảnh công khai
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Ảnh từ kỹ thuật viên
    match /technician/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId 
                            || request.auth.token.role == 'admin';
    }
    
    // Ảnh sản phẩm
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```

## 6️⃣ Cấu hình Cloud Functions

```bash
cd firebase/functions
npm install -g firebase-tools
firebase login
firebase init functions
```

### .env.local

```
FIREBASE_PROJECT_ID=aquacare-system
FIREBASE_DATABASE_URL=https://aquacare-system.firebaseio.com
```

## 7️⃣ Deployment

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules

```bash
firebase deploy --only storage
```

### Deploy Cloud Functions

```bash
cd firebase/functions
npm run deploy
```

### Deploy Hosting (Admin Web)

```bash
cd apps/admin_web
npm run build
firebase deploy --only hosting
```

---

**Lưu ý**: Luôn sửa Firestore security rules trước khi deploy lên production!
