# Environment Setup Guide

## Prerequisites

- Flutter 3.13+ (SDK)
- Node.js 18+ (Admin Web, Functions)
- Java 11+ (Android SDK)
- Firebase CLI
- Git

## Installation

### 1. Flutter Setup

```bash
# Download from https://flutter.dev/docs/get-started/install
flutter --version

# Enable web support (optional)
flutter config --enable-web

# Get Flutter packages
flutter pub global activate melos
```

### 2. Node.js Setup

```bash
# Check version
node --version  # v18+
npm --version   # 9+

# Install firebase tools
npm install -g firebase-tools
firebase --version
```

### 3. Android Setup

```bash
# Download Android Studio or SDK CLI
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk
```

### 4. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Create Firebase project (manual in console)
# https://console.firebase.google.com

# Initialize in project
cd AquaCareSystem
firebase init
```

## Development Environment

### Customer App (.env)

```bash
cd apps/customer_app
# No .env file needed - uses firebase_options.dart
```

### Technician App (.env)

```bash
cd apps/technician_app
# No .env file needed - uses firebase_options.dart
```

### Admin Web (.env.local)

```bash
cd apps/admin_web

# Create .env.local
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
EOF
```

### Root .env

```bash
cd AquaCareSystem

# Create .env (copy from .env.example)
cp .env.example .env

# Edit with your Firebase credentials
nano .env
```

## Quick Commands

### Bootstrap Monorepo

```bash
melos bootstrap
```

### Run Apps

```bash
# Customer
cd apps/customer_app && flutter run

# Technician
cd apps/technician_app && flutter run

# Admin Web
cd apps/admin_web && npm run dev
```

### Firebase Emulator

```bash
cd firebase
npm install -g @firebase/cli
firebase emulators:start
```

### Deploy

```bash
# Deploy functions
bash infrastructure/scripts/deploy_functions.sh

# Deploy hosting
bash infrastructure/scripts/deploy_hosting.sh

# Deploy Firestore rules
bash infrastructure/scripts/deploy_firestore.sh
```

## Troubleshooting

### Flutter: "Command 'flutter' not found"
```bash
# Add Flutter to PATH
export PATH="$PATH:`pwd`/flutter/bin"

# Or add to ~/.bashrc or ~/.zshrc permanently
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
```

### Gradle/Android Issues
```bash
flutter clean
cd android && ./gradlew clean
cd .. && flutter pub get
```

### Firebase Emulator Issues
```bash
# Clear emulator data
firebase emulators:start --import=./seed

# Or reset
rm -rf ~/.cache/firebase/emulators
firebase emulators:start
```

### React Node Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**Last Updated**: 2024  
**Maintained By**: Team
