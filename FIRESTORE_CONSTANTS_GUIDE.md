# 📚 Firestore Constants - Hướng Dẫn Sử Dụng

## 📍 Vị Trí File

```
packages/shared/lib/constants/
├── firestore_collections.dart  ← ⭐ CHÍNH (Thường xuyên dùng)
├── app_constants.dart          ← ⛔ CỰ (DEPRECATED)
└── index.dart                  ← Export chung
```

---

## 🚀 Cách Import

### ✅ **Cách đúng (Nên làm)**
```dart
import 'package:shared/constants/firestore_collections.dart';
// hoặc
import 'package:shared/constants/index.dart';
```

### ❌ **Cách cũ (Không nên làm)**
```dart
// Không dùng nữa (chỉ để backward compatibility)
import 'package:shared/constants/app_constants.dart';
```

---

## 💡 Ví Dụ Sử Dụng Thực Tế

### 1️⃣ **Lấy danh sách đơn hàng**
```dart
import 'package:shared/constants/firestore_collections.dart';

// ❌ Cũ - Dễ bị typo
final orders = await _firestore
    .collection('donHang')  // ← Có thể gõ sai
    .where('trangThai', isEqualTo: 'hoan_thanh')
    .get();

// ✅ Mới - Không sợ typo
final orders = await _firestore
    .collection(Col.donHang)  // ← Lấy từ constant
    .where(FDonHang.trangThai, isEqualTo: TrangThaiDonHang.hoanThanh)
    .get();
```

### 2️⃣ **Tạo đơn hàng mới**
```dart
final docRef = await _firestore
    .collection(Col.donHang)
    .add({
      FDonHang.maDonHang: 'DH-2024-001',
      FDonHang.khachHangId: userId,
      FDonHang.tenKhachHang: 'Nguyễn Văn A',
      FDonHang.soDienThoai: '0912345678',
      FDonHang.trangThai: TrangThaiDonHang.choXacNhan,
      FDonHang.tongTien: 5500000,
      FDonHang.ngayTao: FieldValue.serverTimestamp(),
      FDonHang.ngayCapNhat: FieldValue.serverTimestamp(),
    });
```

### 3️⃣ **Cập nhật trạng thái đơn hàng**
```dart
await _firestore
    .collection(Col.donHang)
    .doc(orderId)
    .update({
      FDonHang.trangThai: TrangThaiDonHang.daPhanCong,
      FDonHang.kyThuatVienId: technicianId,
      FDonHang.tenKyThuatVien: 'Trần Văn B',
      FDonHang.ngayCapNhat: FieldValue.serverTimestamp(),
    });

// Thêm vào lịch sử trạng thái
await _firestore
    .collection(Col.donHang)
    .doc(orderId)
    .collection(SubCol.lichSuTrangThai)
    .add({
      FDonHang.trangThai: TrangThaiDonHang.daPhanCong,
      'thoiGian': FieldValue.serverTimestamp(),
      'ghiChu': 'Phân công cho KTV $technicianId',
    });
```

### 4️⃣ **Lấy thông tin người dùng**
```dart
final userDoc = await _firestore
    .collection(Col.nguoiDung)
    .doc(userId)
    .get();

final user = userDoc.data();
print('Họ tên: ${user?[FNguoiDung.hoTen]}');
print('Vai trò: ${user?[FNguoiDung.vaiTro]}');
print('Trạng thái: ${user?[FNguoiDung.trangThai]}');

// Kiểm tra vai trò
if (user?[FNguoiDung.vaiTro] == VaiTro.kyThuatVien) {
  print('Đây là kỹ thuật viên');
}
```

### 5️⃣ **Tạo thông báo**
```dart
await _firestore
    .collection(Col.thongBao)
    .add({
      FThongBao.nguoiNhanId: userId,
      FThongBao.loai: LoaiThongBao.donHang,
      FThongBao.tieuDe: 'Đơn hàng được xác nhận',
      FThongBao.noiDung: 'Đơn hàng $orderId đã được xác nhận',
      FThongBao.thamChieuId: orderId,
      FThongBao.loaiThamChieu: 'order',
      FThongBao.daDoc: false,
      FThongBao.ngayTao: FieldValue.serverTimestamp(),
    });
```

### 6️⃣ **Thêm địa chỉ giao hàng**
```dart
await _firestore
    .collection(Col.nguoiDung)
    .doc(userId)
    .collection(SubCol.diaChiGiaoHang)
    .add({
      'hoTen': 'Nguyễn Văn A',
      'soDienThoai': '0912345678',
      'diaChi': '123 Đường ABC, Quận 1, TP.HCM',
      'phuongXa': 'Phường 1',
      'quanHuyen': 'Quận 1',
      'thanhPho': 'TP.HCM',
      'maPostal': '70000',
      'macDinh': true,
      'ngayTao': FieldValue.serverTimestamp(),
    });
```

---

## 📋 Bảng Tham Chiếu Nhanh

| **Tác Vụ** | **Dùng** | **Ví Dụ** |
|-----------|---------|---------|
| Collection name | `Col` | `Col.donHang` |
| Sub-collection name | `SubCol` | `SubCol.lichSuTrangThai` |
| User fields | `FNguoiDung` | `FNguoiDung.hoTen` |
| Product fields | `FSanPham` | `FSanPham.giaBan` |
| Order fields | `FDonHang` | `FDonHang.trangThai` |
| Device fields | `FThietBi` | `FThietBi.soSeri` |
| Notification fields | `FThongBao` | `FThongBao.loai` |
| User roles | `VaiTro` | `VaiTro.kyThuatVien` |
| Order statuses | `TrangThaiDonHang` | `TrangThaiDonHang.hoanThanh` |
| Device statuses | `TrangThaiThietBi` | `TrangThaiThietBi.hoatDong` |
| Notification types | `LoaiThongBao` | `LoaiThongBao.donHang` |
| Event types | `LoaiSuKien` | `LoaiSuKien.datHang` |

---

## ⚙️ Khi Firestore Schema Thay Đổi

**Bước 1:** Cập nhật `firestore_collections.dart`
```dart
class Col {
  // Thêm collection mới
  static const myShinnyNewCollection = 'myNewCollection';
}

class FMyNewCollection {
  static const myField = 'myField';
}
```

**Bước 2:** Git commit
```bash
git add packages/shared/lib/constants/firestore_collections.dart
git commit -m "feat: add new Firestore collection and fields"
```

**Bước 3:** Thông báo team trong PR/MR

---

## 🔍 Validation & Safety

### Query Type-Safe
```dart
// ❌ Dễ sai - Compiler không check
await _firestore
    .collection('orders')
    .where('status', isEqualTo: 'completedd')  // ← Typo!
    .get();

// ✅ An toàn - Constants không thể sai
await _firestore
    .collection(Col.donHang)
    .where(FDonHang.trangThai, isEqualTo: TrangThaiDonHang.hoanThanh)
    .get();
```

### Model Validation
```dart
// Khi parse từ Firestore
Map<String, dynamic> data = doc.data()!;

// Validate fields tồn tại
if (!data.containsKey(FDonHang.trangThai)) {
  throw Exception('Missing field: ${FDonHang.trangThai}');
}

// Validate value hợp lệ
final status = data[FDonHang.trangThai];
if (![
  TrangThaiDonHang.choXacNhan,
  TrangThaiDonHang.daXacNhan,
  TrangThaiDonHang.hoanThanh,
].contains(status)) {
  throw Exception('Invalid status: $status');
}
```

---

## 📞 Hỗ Trợ & Câu Hỏi

- **Thêm collection mới?** → Update `firestore_collections.dart`
- **Thêm field mới?** → Thêm vào class F...
- **Thêm status mới?** → Thêm vào class TrangThai...
- **Sửa tên cũ?** → Cập nhật + notify team

---

## ✨ Best Practices

1. **Luôn import từ `firestore_collections.dart`** - Không gõ string cứng
2. **Dùng constants cho fields** - Tránh typo
3. **Dùng enum values cho status** - Consistency
4. **Document thay đổi** - Git commit message rõ ràng
5. **Share với team** - Đặt file trong `packages/shared`
