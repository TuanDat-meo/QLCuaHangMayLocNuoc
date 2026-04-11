#!/bin/bash

# Deploy Admin Web to Firebase Hosting

echo "🚀 Building and deploying Admin Web..."

cd apps/admin_web

# Install dependencies
npm ci

# Build
npm run build

# Deploy
firebase deploy --only hosting:admin

echo "✅ Admin Web deployed!"
