#!/bin/bash

# Deploy Cloud Functions

echo "🔥 Deploying Cloud Functions..."

cd firebase/functions

# Install dependencies
npm ci

# Build
npm run build

# Deploy
npm run deploy

echo "✅ Cloud Functions deployed!"
