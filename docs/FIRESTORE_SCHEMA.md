# 📊 Firestore Schema

## Collections & Subcollections

### 1. users
```
users/{userId}
├── uid: string (Primary Key)
├── name: string
├── phone: string
├── email: string
├── address: {
│   street: string
│   ward: string
│   district: string
│   city: string
│   coordinates: GeoPoint
├── avatar_url: string
├── role: "customer" | "technician" | "admin"  // Custom claim
├── status: "active" | "inactive" | "banned"
├── created_at: timestamp
├── updated_at: timestamp
└── (chỉ admin) settings: {...}
```

### 2. products
```
products/{productId}
├── pid: string (Auto)
├── name: string
├── description: string
├── price: number
├── specs: {
│   model: string
│   capacity: number (liters)
│   warranty_years: number
│   dimensions: {width, height, depth}
│   weight: number
│   power: string
├── category: string (FK → categories)
├── image_urls: array
├── status: "active" | "inactive" | "discontinued"
├── stock: number
├── created_at: timestamp
├── updated_at: timestamp
└── subcollection: reviews (product_id, rating, comment)
```

### 3. categories
```
categories/{categoryId}
├── cid: string
├── name: string
├── description: string
├── image_url: string
├── display_order: number
└── is_active: boolean
```

### 4. orders
```
orders/{orderId}
├── oid: string (Auto-generated)
├── customer_id: string (FK → users)
├── product_id: string (FK → products)
├── quantity: number
├── unit_price: number
├── total_price: number
├── discount: number (nếu có)
├── final_price: number
├── delivery_address: {
│   street: string
│   ward: string
│   district: string
│   city: string
│   coordinates: GeoPoint
│   recipient_name: string
│   recipient_phone: string
├── status: "pending" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled"
├── order_notes: string
├── admin_notes: string
├── created_at: timestamp
├── updated_at: timestamp
├── scheduled_date: timestamp (nếu đặt trước)
└── subcollection: timeline (status changes)
```

### 5. assignments
```
assignments/{assignmentId}
├── aid: string (Auto)
├── order_id: string (FK → orders)
├── technician_id: string (FK → users)
├── admin_id: string (FK → users) // người phân công
├── status: "assigned" | "accepted" | "on_route" | "arrived" | "in_progress" | "completed" | "cancelled"
├── assigned_at: timestamp
├── accepted_at: timestamp
├── started_at: timestamp
├── completed_at: timestamp
├── notes: string
├── route_distance: number (km)
├── route_duration: number (minutes)
└── subcollection: completion_info
    ├── photos: array (URLs)
    ├── cod_amount: number
    ├── tip_amount: number
    ├── payment_method: "cash" | "card" | "transfer"
    ├── submitted_by: string (technician_id)
    └── submitted_at: timestamp
```

### 6. devices
```
devices/{deviceId}
├── did: string (Auto)
├── order_id: string (FK → orders)
├── customer_id: string (FK → users)
├── product_id: string (FK → products)
├── serial_number: string (unique)
├── qr_code: string
├── install_date: timestamp
├── warranty_until: timestamp
├── status: "installing" | "active" | "warranty_ended" | "maintenance_due" | "deactivated"
├── location: GeoPoint (optional)
├── notes: string
├── created_at: timestamp
├── updated_at: timestamp
└── subcollection: history
    ├── event: "installed" | "maintained" | "repaired" | "status_changed"
    ├── description: string
    ├── performed_by: string (technician_id)
    └── performed_at: timestamp
```

### 7. maintenance
```
maintenance/{maintenanceId}
├── mid: string (Auto)
├── device_id: string (FK → devices)
├── customer_id: string (FK → users)
├── scheduled_date: timestamp
├── completed_date: timestamp
├── status: "scheduled" | "in_progress" | "completed" | "cancelled"
├── maintenance_type: "routine" | "repair" | "cleaning" | "inspection"
├── notes: string
├── cost: number
├── technician_id: string (FK → users) // assigned technician
├── before_photos: array (URLs)
├── after_photos: array (URLs)
└── created_at: timestamp
```

### 8. warranties
```
warranties/{warrantyId}
├── wid: string (Auto)
├── device_id: string (FK → devices)
├── customer_id: string (FK → users)
├── start_date: timestamp
├── end_date: timestamp
├── coverage: {
│   parts: boolean
│   labor: boolean
│   water_damage: boolean
├── claim_history: array
├── status: "active" | "expired" | "voided"
└── created_at: timestamp
```

### 9. inventory
```
inventory/{skuId}
├── sid: string (Auto)
├── product_id: string (FK → products)
├── quantity: number
├── reserved: number (pending orders)
├── available: number (calculated)
├── reorder_level: number (cảnh báo)
├── warehouse_location: string
├── last_updated: timestamp
└── subcollection: transactions
    ├── type: "in" | "out" | "adjustment"
    ├── quantity: number
    ├── notes: string
    ├── reference_id: string (order_id or purchase_id)
    └── created_at: timestamp
```

### 10. notifications
```
notifications/{notificationId}
├── nid: string (Auto)
├── user_id: string (FK → users)
├── title: string
├── message: string
├── type: "order" | "maintenance" | "promotion" | "system"
├── related_id: string (order_id, device_id, etc.)
├── is_read: boolean
├── created_at: timestamp
└── recipient_role: array (multiple users if broadcast)
```

### 11. pre_orders
```
pre_orders/{preOrderId}
├── poid: string (Auto)
├── customer_id: string (FK → users)
├── product_id: string (FK → products)
├── quantity: number
├── requested_date: timestamp
├── status: "pending" | "notified" | "converted_to_order" | "cancelled"
├── notification_sent_at: timestamp
├── created_at: timestamp
└── notes: string
```

### 12. audit_log
```
audit_log/{logId}
├── lid: string (Auto)
├── user_id: string (FK → users)
├── action: string (e.g., "created_order", "updated_product")
├── resource_type: string (e.g., "order", "product", "user")
├── resource_id: string
├── changes: {
│   before: {...}
│   after: {...}
├── ip_address: string
├── timestamp: timestamp
└── status: "success" | "failed"
```

---

## Indexes cần tạo

```
// Cần composite index
orders: (customer_id, created_at DESC)
orders: (status, created_at DESC)
devices: (customer_id, status)
maintenance: (device_id, scheduled_date)
audit_log: (user_id, timestamp DESC)
```

## Data Types

- **string**: Text
- **number**: Integer hoặc Float
- **boolean**: true/false
- **timestamp**: Server timestamp
- **array**: Mảng strings, numbers, maps, etc.
- **map**: Object/Dictionary
- **GeoPoint**: Tọa độ GPS (latitude, longitude)
- **bytes**: Binary data
