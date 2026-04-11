# ADR 002: Flutter Monorepo Structure

## Status
**Accepted** - Use Monorepo with shared package

## Context
How to organize two Flutter mobile apps (Customer + Technician) that share significant code

## Decision
Use **Monorepo structure** with shared package:
```
AquaCareSystem/
├── apps/
│   ├── customer_app/
│   └── technician_app/
└── packages/
    └── shared/
```

## Rationale

### Why Monorepo?
1. **Code reuse** - Models, utilities, constants shared
2. **Consistency** - Same dependencies, versions
3. **Easier refactoring** - Change shared code, both apps update
4. **Single source of truth** - DRY principle
5. **Simpler CI/CD** - One build pipeline

### Why Separate Apps?
1. **Different user roles** - Customer vs Technician
2. **Different themes** - Blue for customer, teal for tech
3. **Different dependencies** - Tech app needs camera, customer needs maps
4. **Independent releases** - Can release separately

### Shared Package Contents
- **Models**: User, Product, Order, Device, etc.
- **Constants**: Firebase collections, enums, config
- **Utils**: Date formatting, validators, formatters
- **Services**: (Optional) Base Firebase wrapper

## Consequences

### Positive
- DRY - Don't repeat shared code
- Consistent data models
- Easier to maintain
- Single dependency management

### Negative
- More complex build process
- Need to coordinate releases
- Shared package version dependency
- Melos adds complexity

## Tools Used
- **Melos** - Monorepo task runner
- **Flutter** - Dart package system
- **pub.dev** - Package repository

## Setup Command
```bash
flutter create --template=package packages/shared
flutter create --org com.aquacare apps/customer_app
flutter create --org com.aquacare apps/technician_app
melos bootstrap
```

## CI/CD Strategy
- Build both apps on main branch push
- Test shared package changes affect both
- Can trigger independent builds via workflows

## Future Considerations
If moving to custom backend, can:
1. Keep monorepo for shared UI components
2. Split into web (admin) + mobile apps
3. Add platform-specific packages

---

**Decision Date**: 2024  
**Last Reviewed**: 2024  
**Related Issues**: Flutter modularization
