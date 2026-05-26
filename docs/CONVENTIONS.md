# 📋 Quy ước Code — AquaCareSystem

## Dart / Flutter

### Đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Class, Enum | `PascalCase` | `OrderStatus`, `UserProfile` |
| Method, variable | `camelCase` | `fetchUserData()`, `totalPrice` |
| Constant | `camelCase` với `const` | `const appName = 'AquaCare'` |
| Private | `_leadingUnderscore` | `_privateMethod()` |
| File | `snake_case` | `order_model.dart`, `home_screen.dart` |

### Cấu trúc file

```
feature/
├── screens/      # UI screens
├── widgets/      # Reusable widgets
├── controllers/  # Business logic (Provider/Riverpod)
├── services/     # Firebase / API calls
└── models/       # Data models
```

### Code style

```dart
// ✅ Dùng const khi có thể
const Text('Hello')

// ✅ Null safety
String? userName;
String name = userName ?? 'Unknown';
user?.profile?.name;

// ✅ Async/await (tránh callback hell)
Future<void> fetchData() async {
  try {
    final data = await firestore.collection('users').get();
    setState(() => users = data.docs);
  } catch (e) {
    debugPrint('Error: $e');
  }
}

// ✅ Comments có ý nghĩa
/// Tính tổng giá trị đơn hàng (giá × số lượng từng sản phẩm)
double calculateTotal(List<OrderItem> items) { ... }
```

---

## TypeScript / React

### Đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Interface, Type | `PascalCase` | `UserProfile`, `OrderStatus` |
| Function, variable | `camelCase` | `fetchUserData()`, `totalPrice` |
| Constant toàn cục | `UPPER_SNAKE_CASE` | `API_BASE_URL` |
| React Component | `PascalCase` | `ProductCard`, `DashboardPage` |
| File | `PascalCase.tsx` (component), `camelCase.ts` (logic) | `ProductCard.tsx`, `apiService.ts` |

### Cấu trúc component

```typescript
interface ProductCardProps {
  productId: string;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ productId, onSelect }) => {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effects
  useEffect(() => { /* setup */ }, []);

  // 3. Handlers
  const handleClick = () => onSelect(productId);

  // 4. Render
  return <div onClick={handleClick}>{/* JSX */}</div>;
};
```

---

## Best Practices

### DRY — Don't Repeat Yourself
- Tách widget/component dùng chung
- Đặt vào `packages/shared` (Flutter) hoặc `src/components` (React)

### Single Responsibility
- Screen/Page: chỉ hiển thị UI
- Controller/Store: chỉ quản lý state
- Service: chỉ xử lý API/Firebase

### Performance
- Flutter: dùng `const` constructor, `RepaintBoundary`, lazy load
- React: `useMemo`, `useCallback`, code splitting

---

## Linting

```bash
# Flutter
flutter analyze

# React
npm run lint
```

> Mọi PR phải pass lint trước khi merge.
