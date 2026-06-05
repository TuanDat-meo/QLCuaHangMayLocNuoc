import {
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from '../services/authService';
import { UserRole } from '../types/auth';
import { OrderStatus, OrderType } from '../types/order';

/**
 * MASTER SEED SCRIPT V23 - ĐỒNG BỘ LOGIC THỜI GIAN THỰC TẾ
 * Quy tắc:
 * - Đơn trước 5/6: Đã Tất toán/Hoàn tất + Có Hóa đơn.
 * - Đơn sau 5/6: Đang xử lý/Chờ duyệt + Lịch hẹn tương lai.
 */

const SUPPLIERS = [
  { id: 'SEED-SUP-01', name: 'Karofi Việt Nam', phone: '19006418', address: 'Thanh Xuân, Hà Nội', status: 'Active' },
  { id: 'SEED-SUP-02', name: 'Kangaroo Group', phone: '1900555566', address: 'Đống Đa, Hà Nội', status: 'Active' },
];

const PRODUCTS = [
  { sku: 'KAR-V1', tenSanPham: 'Karofi Optimus O-P1310', danhMuc: 'Máy lọc RO', giaBan: 7500000, thoiGianBaoHanh: 24, supplierId: 'SEED-SUP-01' },
  { sku: 'KAR-V2', tenSanPham: 'Karofi Livotec 612', danhMuc: 'Máy lọc RO', giaBan: 5490000, thoiGianBaoHanh: 24, supplierId: 'SEED-SUP-01' },
  { sku: 'KAN-V1', tenSanPham: 'Kangaroo Hydrogen KG100HK', danhMuc: 'Nóng lạnh', giaBan: 8900000, thoiGianBaoHanh: 12, supplierId: 'SEED-SUP-02' },
];

const TECHS = [
  { uid: 'SEED-TECH-01', displayName: 'Nguyễn Hoàng Nam', role: UserRole.TECHNICIAN, email: 'nam.tech@aquacare.vn' },
  { uid: 'SEED-TECH-02', displayName: 'Trần Văn Đức', role: UserRole.TECHNICIAN, email: 'duc.tech@aquacare.vn' },
];

const LOCATIONS = [
  { pCode: 1, pName: 'Hà Nội', dCode: 5, dName: 'Quận Cầu Giấy', wCode: 172, wName: 'Phường Dịch Vọng', street: '45 Duy Tân' },
  { pCode: 1, pName: 'Hà Nội', dCode: 1, dName: 'Quận Ba Đình', wCode: 1, wName: 'Phường Phúc Xá', street: '12 Phúc Xá' },
  { pCode: 1, pName: 'Hà Nội', dCode: 6, dName: 'Quận Đống Đa', wCode: 190, wName: 'Phường Cát Linh', street: '88 Giảng Võ' },
];

const randomPhone = () => '0' + Math.floor(Math.random() * 90000000 + 10000000);
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const seedData = async (shouldClear: boolean = false) => {
  const db = getDb();

  // MỐC THỜI GIAN QUAN TRỌNG
  const cutoffDate = new Date(2024, 5, 5); // 5/6/2024
  const referenceNow = new Date(2024, 5, 8); // Giả định hôm nay là 8/6 để logic sau 5/6 hoạt động tốt

  console.log('🚀 Bắt đầu nạp dữ liệu chuẩn hóa (Relational & Time Logic)...');

  // 1. Seed Technicians
  for (const t of TECHS) {
    await setDoc(doc(db, 'nguoiDung', t.uid), { ...t, status: 'active', phoneNumber: randomPhone(), isVerified: true, source: 'admin_web', updatedAt: serverTimestamp() }, { merge: true });
  }

  // 2. Seed 60 Đơn hàng
  for (let i = 0; i < 60; i++) {
    const orderId = `SEED-ORD-${String(i).padStart(3, '0')}`;
    const product = PRODUCTS[i % PRODUCTS.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const tech = TECHS[i % TECHS.length];

    // Ngày tạo rải rác xung quanh mốc 5/6
    // i=0..29 -> Trước 5/6 | i=30..59 -> Sau 5/6
    const orderDate = new Date(cutoffDate);
    orderDate.setDate(orderDate.getDate() + (i - 30));
    orderDate.setHours(9, 0);

    const isPastOrder = orderDate < cutoffDate;

    /**
     * LOGIC TRẠNG THÁI THEO THỜI GIAN:
     * - Trước 5/6: Đã xong (paid)
     * - Sau 5/6: Đang xử lý (pending, processing, assigned)
     */
    let status: OrderStatus = isPastOrder ? 'paid' : randomItem(['pending', 'processing', 'assigned']);

    // THỜI GIAN HẸN: Sau ngày tạo đơn
    const scheduledDate = new Date(orderDate);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    scheduledDate.setHours(10, 30);

    const orderData = {
      customerName: `Khách hàng mẫu ${i + 1}`,
      phoneNumber: randomPhone(),
      provinceCode: loc.pCode, districtCode: loc.dCode, wardCode: loc.wCode, street: loc.street,
      diaChiGiaoHang: `${loc.street}, ${loc.wName}, ${loc.dName}, ${loc.pName}`,
      tenSanPham: product.tenSanPham,
      items: [{
        id: product.sku,
        name: product.tenSanPham,
        price: product.giaBan,
        quantity: 1,
        thoiGianBaoHanh: product.thoiGianBaoHanh
      }],
      totalAmount: product.giaBan,
      status: status,
      loaiDonHang: 'installation' as OrderType,
      ngayTao: Timestamp.fromDate(orderDate),
      createdAt: Timestamp.fromDate(orderDate),
      scheduledDate: Timestamp.fromDate(scheduledDate),
      technicians: status === 'pending' ? [] : [{ id: tech.uid, name: tech.displayName }],
      updatedAt: serverTimestamp(),
      isSeedData: true
    };

    await setDoc(doc(db, 'donHang', orderId), orderData, { merge: true });

    // --- 3. TỰ ĐỘNG SINH HÓA ĐƠN CHO ĐƠN ĐÃ THANH TOÁN ---
    if (status === 'paid' || status === 'completed') {
      const invoiceId = `INV-${orderId.split('-').pop()}`;
      await setDoc(doc(db, 'invoices', invoiceId), {
        invoiceNumber: invoiceId,
        orderId: orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.phoneNumber,
        amount: orderData.totalAmount,
        paymentStatus: 'paid',
        paymentMethod: 'Bank Transfer',
        issuedAt: Timestamp.fromDate(orderDate),
        items: orderData.items,
        isSeedData: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // --- 4. TỰ ĐỘNG SINH THIẾT BỊ BẢO HÀNH ---
    if (status === 'paid' || status === 'completed') {
      const deviceId = `DEV-${orderId.split('-').pop()}`;
      const warrantyUntil = new Date(orderDate);
      warrantyUntil.setMonth(warrantyUntil.getMonth() + product.thoiGianBaoHanh);
      await setDoc(doc(db, 'devices', deviceId), {
        did: deviceId, order_id: orderId, customer_name: orderData.customerName,
        product_id: product.sku, product_name: product.tenSanPham,
        install_date: Timestamp.fromDate(orderDate),
        warranty_until: Timestamp.fromDate(warrantyUntil),
        status: 'active', isSeedData: true, created_at: Timestamp.fromDate(orderDate)
      }, { merge: true });
    }
  }

  console.log('✨ HOÀN TẤT! Dữ liệu đã khớp logic: Trước 5/6 đã Tất toán & có Hóa đơn. Sau 5/6 đang xử lý.');
  return true;
};
