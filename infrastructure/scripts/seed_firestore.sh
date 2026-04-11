#!/bin/bash

# Seed Firestore with sample data

echo "🌱 Seeding Firestore..."

firebase firestore:delete --all

# Run seed script
node seed_firestore.js

echo "✅ Firestore seeded!"
