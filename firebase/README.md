# AquaCareSystem Firebase Backend

Chứa cấu hình Firebase (Firestore, Storage, Cloud Functions)

## Cấu trúc

- `firebase.json` - Firebase project config
- `firestore.rules` - Firestore security rules
- `storage.rules` - Storage security rules
- `firestore.indexes.json` - Composite indexes
- `functions/` - Cloud Functions (TypeScript/Node.js)

## Deployment

```bash
# Deploy firestore rules
firebase deploy --only firestore:rules

# Deploy storage rules
firebase deploy --only storage

# Deploy functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```
