#!/bin/bash

# Deploy Firestore Rules

echo "📋 Deploying Firestore Rules..."

cd firebase

# Deploy rules
firebase deploy --only firestore:rules

echo "✅ Firestore Rules deployed!"
