# Contributing Guidelines

## 🎯 Quy tắc đóng góp

### Branch naming

```
feature/[app]-[feature-name]
fix/[app]-[issue-name]
docs/[topic]
refactor/[app]-[module]
```

Ví dụ:
- `feature/customer-app-google-places`
- `fix/technician-app-maps-ios`
- `docs/firebase-schema-update`

### Commit messages

```
[type]([scope]): [subject]

[detailed description]

Fixes #[issue-number]
```

Types:
- **feat**: Chức năng mới
- **fix**: Sửa lỗi
- **docs**: Thay đổi tài liệu
- **style**: Định dạng code
- **refactor**: Cải tổ code
- **perf**: Tối ưu hiệu năng
- **test**: Thêm/sửa test
- **chore**: Build, CI/CD, dependencies

### Pull Request

1. Tạo branch từ `main`
2. Commit các thay đổi
3. Push lên remote
4. Tạo PR với mô tả chi tiết
5. Chờ review

## 👨‍💻 Quy ước code

Vui lòng tham khảo [CONVENTIONS.md](docs/CONVENTIONS.md)

## ✅ Pre-commit

```bash
# Flutter
flutter analyze
flutter format lib/

# React
npm run lint
npm run format
```

## 🧪 Testing

```bash
# Flutter
flutter test

# React
npm run test
```

## 📝 Documentation

- Cập nhật tài liệu khi thêm chức năng mới
- Viết clear comments trong code
- Cập nhật README nếu cần thiết

## 🐛 Báo cáo lỗi

Vui lòng tạo issue với:
- Mô tả rõ ràng
- Bước tái tạo
- Expected vs Actual behavior
- Environment info
