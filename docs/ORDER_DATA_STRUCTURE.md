# Complete Order Data Structure Guide

## Overview
This guide documents the complete order data structure that has been implemented across the Flutter customer app, TypeScript admin web app, and Firebase backend.

---

## Order Data Model

### Complete Order Example
```json
{
  "id": "Zs9iqoF2pX3IcTyuGg1t",
  "orderCode": "ORD-2026-108980",
  "orderType": "home",
  
  "customerId": "huyy5725-id",
  "customerName": "Huy Nguyễn",
  "customerEmail": "huyy5725@gmail.com",
  "phoneNumber": "0912 345 678",

  "deliveryAddress": {
    "type": "home",
    "recipientName": "Nhà riêng",
    "street": "123 Đường Lê Lợi",
    "ward": "Phường Bến Thành",
    "district": "Quận 1",
    "city": "TP. HCM",
    "wardCode": 26842,
    "districtCode": 769,
    "provinceCode": 79,
    "latitude": 10.7769,
    "longitude": 106.7009
  },

  "items": [
    {
      "id": "1780572100873",
      "productId": "An3eCI5Vv92xMIDtu2qt",
      "productName": "Máy lọc nước UV Kangaroo",
      "imageUrl": "https://via.placeholder.com/400",
      "price": 3500000,
      "quantity": 1,
      "subtotal": 3500000,
      "warrantyPeriod": 12
    }
  ],

  "subtotal": 3500000,
  "discount": 0,
  "shippingFee": 0,
  "totalAmount": 3500000,
  
  "notes": "",
  "status": "pending",

  "scheduledDate": "2026-06-05T18:21:42.000Z",
  "scheduledSlot": {
    "slotId": "slot2",
    "label": "10:00 - 12:00"
  },

  "technicians": [
    {
      "id": "9zik81pJbtWTUEwUQifnamRWzlJ2",
      "name": "Kỹ thuật viên 01",
      "phone": "0987654321",
      "isPrimary": true
    }
  ],

  "createdAt": "2026-06-04T18:21:50.000Z",
  "updatedAt": "2026-06-05T08:42:50.000Z",
  "updatedBy": "QsCwfXisWPPOkS2udoz8v82f6kn1",
  "updatedByName": "Nguyễn Hoàng Tuấn Đạt"
}
```

---

## Data Structure Details

### Order Status
Valid values: `pending`, `assigned`, `processing`, `completed`, `incident`, `paid`, `cancelled`, `deleted`

### Order Type
Valid values: `home`, `installation`, `maintenance`, `repair`

### Order Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Document ID from Firestore |
| orderCode | string | Yes | Unique order code (ORD-YYYY-XXXXX) |
| orderType | string | Yes | Type of order |
| customerId | string | Yes | Customer user ID |
| customerName | string | Yes | Customer full name |
| customerEmail | string | Yes | Customer email address |
| phoneNumber | string | Yes | Customer phone number |
| deliveryAddress | object | Yes | Complete delivery address |
| items | array | Yes | Array of order items (min 1) |
| subtotal | number | Yes | Total before discount/shipping |
| discount | number | Yes | Discount amount |
| shippingFee | number | Yes | Shipping fee |
| totalAmount | number | Yes | Final total (subtotal - discount + shippingFee) |
| notes | string | No | Order notes/remarks |
| status | string | Yes | Current order status |
| scheduledDate | timestamp | Yes | Scheduled delivery date |
| scheduledSlot | object | No | Time slot for delivery |
| technicians | array | Yes | Array of assigned technicians |
| createdAt | timestamp | Yes | Creation timestamp |
| updatedAt | timestamp | Yes | Last update timestamp |
| updatedBy | string | No | User ID who made the last update |
| updatedByName | string | No | User name who made the last update |

---

## Sub-Model Details

### DeliveryAddress
```dart
{
  "type": string,           // 'home', 'office', etc.
  "recipientName": string,  // Name of recipient
  "street": string,         // Street address
  "ward": string,           // Ward/Commune name
  "district": string,       // District name
  "city": string,           // City/Province name
  "wardCode": number,       // Ward code from GHN/GiaoHangNhanh
  "districtCode": number,   // District code from GHN
  "provinceCode": number,   // Province code from GHN
  "latitude": number,       // GPS latitude
  "longitude": number       // GPS longitude
}
```

### OrderItem
```dart
{
  "id": string,           // Unique item ID
  "productId": string,    // Product ID from sanPham collection
  "productName": string,  // Product name
  "imageUrl": string,     // Product image URL
  "price": number,        // Unit price
  "quantity": number,     // Quantity ordered (min 1)
  "subtotal": number,     // price * quantity
  "warrantyPeriod": number // Warranty period in months
}
```

### Technician
```dart
{
  "id": string,      // Technician user ID
  "name": string,    // Technician name
  "phone": string,   // Technician phone
  "isPrimary": bool  // Is primary technician
}
```

### ScheduledSlot
```dart
{
  "slotId": string,  // Slot identifier
  "label": string    // Slot time range (e.g., "10:00 - 12:00")
}
```

---

## Implementation Guide

### Flutter Customer App

#### Create Order
```dart
import 'package:shared/models/order.dart';
import 'package:customer_app/services/order_service.dart';
import 'package:customer_app/utils/order_helper.dart';
import 'package:customer_app/utils/order_validator.dart';

// Create order item
final item = OrderHelper.createOrderItem(
  productId: 'An3eCI5Vv92xMIDtu2qt',
  productName: 'Máy lọc nước UV Kangaroo',
  price: 3500000,
  quantity: 1,
  imageUrl: 'https://...',
  warrantyPeriod: 12,
);

// Create delivery address
final address = OrderHelper.createDeliveryAddress(
  street: '123 Đường Lê Lợi',
  ward: 'Phường Bến Thành',
  district: 'Quận 1',
  city: 'TP. HCM',
  wardCode: 26842,
  districtCode: 769,
  provinceCode: 79,
  latitude: 10.7769,
  longitude: 106.7009,
);

// Create order
final order = OrderHelper.createOrder(
  customerId: 'user-id',
  customerName: 'Huy Nguyễn',
  customerEmail: 'huyy5725@gmail.com',
  phoneNumber: '0912345678',
  deliveryAddress: address,
  items: [item],
  orderType: OrderType.home,
);

// Validate order
final errors = OrderValidator.validateCompleteOrder(order);
if (errors.isNotEmpty) {
  print('Validation errors: $errors');
  return;
}

// Save to Firebase
try {
  final orderId = await OrderService.createOrder(order);
  print('Order created: $orderId');
} catch (e) {
  print('Error: $e');
}
```

#### Fetch Orders
```dart
// Get all customer orders (stream)
OrderService.streamCustomerOrders(customerId).listen((orders) {
  print('Orders: $orders');
});

// Get orders by status
final pendingOrders = await OrderService.getOrdersByStatus(customerId, OrderStatus.pending);

// Get single order
final order = await OrderService.getOrderById(orderId);
```

#### Update Order
```dart
// Update status
await OrderService.updateOrderStatus(
  orderId,
  OrderStatus.assigned,
  updatedBy: userId,
  updatedByName: userName,
);

// Update technicians
final technicians = [
  OrderHelper.createTechnician(
    id: 'tech-id',
    name: 'Kỹ thuật viên 01',
    phone: '0987654321',
    isPrimary: true,
  ),
];
await OrderService.updateTechnicians(orderId, technicians);

// Cancel order
await OrderService.cancelOrder(
  orderId,
  reason: 'Khách hàng yêu cầu hủy',
  updatedBy: userId,
  updatedByName: userName,
);
```

### TypeScript Admin Web App

#### Create Order
```typescript
import { addOrder } from '../services/orderService';
import { CreateOrderDTO, OrderType } from '../types/order';

const orderData: CreateOrderDTO = {
  orderType: 'home',
  customerId: 'huyy5725-id',
  customerName: 'Huy Nguyễn',
  customerEmail: 'huyy5725@gmail.com',
  phoneNumber: '0912 345 678',
  deliveryAddress: {
    type: 'home',
    recipientName: 'Nhà riêng',
    street: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. HCM',
    wardCode: 26842,
    districtCode: 769,
    provinceCode: 79,
    latitude: 10.7769,
    longitude: 106.7009,
  },
  items: [
    {
      id: '1780572100873',
      productId: 'An3eCI5Vv92xMIDtu2qt',
      productName: 'Máy lọc nước UV Kangaroo',
      imageUrl: 'https://...',
      price: 3500000,
      quantity: 1,
      subtotal: 3500000,
      warrantyPeriod: 12,
    },
  ],
  subtotal: 3500000,
  discount: 0,
  shippingFee: 0,
  totalAmount: 3500000,
  scheduledDate: new Date('2026-06-05T18:21:42.000Z'),
  technicians: [],
};

try {
  const orderId = await addOrder(orderData);
  console.log('Order created:', orderId);
} catch (error) {
  console.error('Error creating order:', error);
}
```

#### Subscribe to Orders
```typescript
import { subscribeToOrders } from '../services/orderService';

const unsubscribe = subscribeToOrders((orders) => {
  console.log('Orders updated:', orders);
}, 'pending'); // optional status filter

// Stop listening
// unsubscribe();
```

#### Update Order
```typescript
import { updateOrder, updateOrderStatus, assignTechnicians } from '../services/orderService';

// Update status
await updateOrderStatus(orderId, 'assigned', userId, userName);

// Assign technicians
await assignTechnicians(orderId, [
  {
    id: 'tech-id',
    name: 'Kỹ thuật viên 01',
    phone: '0987654321',
    isPrimary: true,
  },
], userId, userName);
```

---

## Firestore Rules Validation

The Firestore security rules now include comprehensive validation:

1. **Order creation** requires:
   - All required fields present
   - Valid delivery address
   - At least one valid order item
   - Matching customer ID with authenticated user (unless admin)

2. **Order updates** restricted to:
   - Order owner (customer)
   - Admin users
   - Staff users

3. **Order deletion** allowed only:
   - Admin users
   - Only for pending orders

---

## API Endpoints Summary

### OrderService (Flutter)
- `createOrder(order)` - Create new order
- `getOrderById(orderId)` - Get order by ID
- `getCustomerOrders(customerId)` - Get all orders for customer
- `getOrdersByStatus(customerId, status)` - Get orders by status
- `streamCustomerOrders(customerId)` - Real-time order stream
- `updateOrderStatus(orderId, status)` - Update status
- `updateOrder(orderId, order)` - Update entire order
- `updateTechnicians(orderId, technicians)` - Assign technicians
- `updateDeliveryAddress(orderId, address)` - Update address
- `deleteOrder(orderId, status)` - Delete/cancel order
- `cancelOrder(orderId, reason)` - Cancel order with reason
- `createOrdersBatch(orders)` - Batch create orders

### orderService (TypeScript)
- `addOrder(orderData)` - Create new order
- `getOrderById(orderId)` - Get order by ID
- `subscribeToOrders(callback, statusFilter)` - Real-time updates
- `updateOrder(orderId, updateData)` - Update order
- `updateOrderStatus(orderId, status)` - Update status
- `assignTechnicians(orderId, technicians)` - Assign technicians
- `deleteOrder(orderId, status)` - Delete/soft delete order

---

## Validation Rules

### Required Fields
- orderCode, orderType
- customerId, customerName, phoneNumber
- deliveryAddress with all required fields
- At least one item in items array
- totalAmount > 0
- Valid status value

### Phone Number Format
- Vietnamese format: 0XXXXXXXXX (10 digits, starting with 0)

### Email Format
- Standard email format

### Order Totals
- subtotal must equal sum of all item subtotals
- totalAmount = subtotal - discount + shippingFee

---

## Migration Notes

The system maintains backward compatibility with old field names:
- `tenKhachHang` → `customerName`
- `tenSanPham` → `productName`
- `tongTien` → `totalAmount`
- `trangThai` → `status`
- `loaiDonHang` → `orderType`

However, new code should use the standardized field names defined in the models.
