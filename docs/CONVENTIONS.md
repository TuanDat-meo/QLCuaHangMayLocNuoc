# 📋 Quy ước - Đặt tên & Coding Style

## 📝 Dart (Flutter)

### Naming Conventions

```dart
// Classes - PascalCase
class UserProfile {}
class OrderStatus {}

// Functions/Methods - camelCase
void fetchUserData() {}
String getUserName() {}

// Variables - camelCase
String userName = "John";
int totalPrice = 1000;

// Constants - camelCase with const
const String appName = "AquaCareSystem";
const int maxRetries = 3;

// Enums - PascalCase
enum OrderStatusEnum { pending, confirmed, shipped }

// Private - leading underscore
String _privateVariable;
void _privateMethod() {}
```

### File Naming

```
screen: home_screen.dart
widget: product_card.dart
model: order_model.dart
provider: order_provider.dart
service: firebase_service.dart
util: date_utils.dart
```

### Class Structure

```dart
class OrderDetailScreen extends StatefulWidget {
  const OrderDetailScreen({Key? key}) : super(key: key);

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  // Properties
  String? orderId;
  
  @override
  void initState() {
    super.initState();
    // Initialization
  }

  @override
  void dispose() {
    // Cleanup
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Detail')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    return Center(child: CircularProgressIndicator());
  }
}
```

### Code Style

```dart
// Use const when possible
const Text('Hello')

// Use spread operator
Widget build(context) {
  return Column(
    children: [
      ...ListTile
      ...SizedBox
    ],
  );
}

// Use if with collection
if (isLoading) ...[
  LoadingWidget(),
]

// Comments
/// Doc comment for public API
// Regular comment
// TODO: vấn đề cần xử lý
```

## 🎨 TypeScript/React

### Naming Conventions

```typescript
// Types/Interfaces - PascalCase
interface UserProfile {
  userId: string;
  userName: string;
}

// Functions - camelCase
const fetchUserData = () => {};
const handleSubmit = () => {};

// Variables - camelCase
let userName = "John";
const totalPrice = 1000;

// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";
const MAX_RETRIES = 3;

// React Components - PascalCase
export const UserProfile: React.FC = () => {};

// Private functions - leading underscore
const _privateHelper = () => {};
```

### File Naming

```
page: UserProfilePage.tsx
component: ProductCard.tsx
hook: useUserData.ts
service: apiService.ts
store: userStore.ts
type: types.ts or models.ts
util: dateUtils.ts
```

### Component Structure

```typescript
interface ProductCardProps {
  productId: string;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  onSelect,
}) => {
  // Hooks
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    // Setup
  }, []);

  // Handlers
  const handleClick = () => {
    onSelect(productId);
  };

  // Render
  return (
    <div className="product-card" onClick={handleClick}>
      {/* JSX */}
    </div>
  );
};
```

## 📏 General Guidelines

### Comments

```dart
// BAD - vô ích
int count = 0; // Số lượng

// GOOD - giải thích tại sao
// Giới hạn số lượng sản phẩm trong giỏ hàng
int count = 0;

/// Tính tổng giá trị đơn hàng
/// 
/// Cộng giá của từng sản phẩm với số lượng
double calculateTotal(List<OrderItem> items) {}
```

### Null Safety

```dart
// Use ? cho nullable
String? userName;

// Use ! khi chắc chắn non-null
String name = userName!;

// Use ?? cho default value
String name = userName ?? 'Unknown';

// Use ?. cho optional chaining
user?.profile?.name;
```

### Async/Await

```dart
// Good
Future<void> fetchData() async {
  try {
    final data = await firestore.collection('users').get();
    setState(() {
      users = data.docs;
    });
  } catch (e) {
    print('Error: $e');
  }
}

// Avoid callback hell
// ❌ BAD
getUserData().then((user) {
  getOrders(user.id).then((orders) {
    getDetails(orders[0].id).then((details) {
      print(details);
    });
  });
});
```

## 🎯 Best Practices

### DRY - Don't Repeat Yourself
- Extract common widgets/components
- Create shared utilities
- Use generics when appropriate

### Single Responsibility
- Một class/function làm một việc
- Screens hiển thị UI, services xử lý logic
- Providers/stores quản lý state

### Defensive Programming
```dart
// Check null before use
if (userName != null && userName.isNotEmpty) {
  // Use userName
}

// Provide fallback
String displayName = user?.name ?? 'Anonymous';
```

### Performance
- Use const constructors
- Lazy load data
- Avoid rebuilds (Flutter: use RepaintBoundary)
- Use async/await thay vì callbacks

---

Mọi PRs phải tuân thủ những quy ước này. Sử dụng linters:
- Flutter: `flutter analyze`
- React: `npm run lint`
