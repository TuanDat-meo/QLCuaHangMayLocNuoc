#!/usr/bin/env pwsh
# Firebase Connection Verification Script
# This script verifies that Firebase is properly configured across all apps

Write-Host "🔍 Firebase Connection Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase emulator is running
Write-Host "1️⃣  Checking Firebase Emulator..." -ForegroundColor Yellow
$emulatorRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 4000 -WarningAction SilentlyContinue
if ($emulatorRunning.TcpTestSucceeded) {
    Write-Host "✅ Firebase Emulator UI is running on http://localhost:4000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firebase Emulator UI is NOT running" -ForegroundColor Yellow
    Write-Host "   To start: npm run start:emulator" -ForegroundColor Gray
}

Write-Host ""

# Check .env files
Write-Host "2️⃣  Checking Environment Configuration..." -ForegroundColor Yellow

# Check root .env.development
if (Test-Path ".\\.env.development") {
    $env_content = Get-Content ".\\.env.development"
    if ($env_content -match "FIREBASE_PROJECT_ID=aquacare-system") {
        Write-Host "✅ Root .env.development is properly configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Root .env.development missing Firebase config" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Root .env.development not found" -ForegroundColor Red
}

# Check admin_web .env.local
if (Test-Path ".\\apps\\admin_web\\.env.local") {
    $env_content = Get-Content ".\\apps\\admin_web\\.env.local"
    if ($env_content -match "VITE_FIREBASE_PROJECT_ID=aquacare-system") {
        Write-Host "✅ Admin Web .env.local is properly configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Admin Web .env.local missing Firebase config" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Admin Web .env.local not found - PLEASE CREATE IT!" -ForegroundColor Red
    Write-Host "   Run: Copy-Item apps/admin_web/.env.example apps/admin_web/.env.local" -ForegroundColor Gray
}

Write-Host ""

# Check Firebase Projects
Write-Host "3️⃣  Checking Firebase Project Configurations..." -ForegroundColor Yellow

$projects = @(
    @{ name = "customer_app"; path = ".\\apps\\customer_app\\lib\\firebase_options.dart" },
    @{ name = "technician_app"; path = ".\\apps\\technician_app\\lib\\firebase_options.dart" }
)

foreach ($project in $projects) {
    if (Test-Path $project.path) {
        $content = Get-Content $project.path
        if ($content -match "projectId: 'aquacare-system'") {
            Write-Host "✅ $($project.name) Firebase configuration is present" -ForegroundColor Green
        } else {
            Write-Host "❌ $($project.name) Firebase configuration might be incorrect" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $($project.name) firebase_options.dart not found" -ForegroundColor Red
    }
}

Write-Host ""

# Check dependencies
Write-Host "4️⃣  Checking npm/pub Dependencies..." -ForegroundColor Yellow

$npmPackages = @("firebase-admin", "firebase-functions")
if (Test-Path ".\\firebase\\functions\\package.json") {
    $packageJson = Get-Content ".\\firebase\\functions\\package.json" | ConvertFrom-Json
    $hasAll = $true
    foreach ($pkg in $npmPackages) {
        if ($packageJson.dependencies.$pkg -or $packageJson.devDependencies.$pkg) {
            Write-Host "✅ $pkg found in Firebase Functions" -ForegroundColor Green
        } else {
            Write-Host "❌ $pkg NOT found in Firebase Functions" -ForegroundColor Red
            $hasAll = $false
        }
    }
} else {
    Write-Host "❌ Firebase Functions package.json not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Verification Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure .env.local exists in admin_web/ with Firebase credentials" -ForegroundColor Gray
Write-Host "2. Run 'npm install' in firebase/functions" -ForegroundColor Gray
Write-Host "3. Run 'flutter pub get' in customer_app and technician_app" -ForegroundColor Gray
Write-Host "4. Run 'npm install' in apps/admin_web" -ForegroundColor Gray
Write-Host "5. Start Firebase Emulator: firebase emulators:start" -ForegroundColor Gray
