/**
 * SCRIPT SEED DỮ LIỆU MÔ PHỎNG (PHIÊN BẢN V12 - HOÀN THIỆN ĐỒNG BỘ)
 * Logic: Tạo 100 đơn hàng -> Tự động sinh thiết bị bảo hành theo số lượng thực tế.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'aquacaresystem0608';

const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.endsWith('.json') && !['package.json', 'firebase.json', 'package-lock.json', 'firestore.indexes.json'].includes(f));
if (!keyFile) {
    console.error('❌ Không tìm thấy file JSON chứng thực trong thư mục firebase/');
    process.exit(1);
}

const serviceAccount = require(path.join(__dirname, keyFile));
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID,
    });
}
const db = admin.firestore();

const PRODUCTS = [
    { tenSanPham: 'Máy lọc nước Karofi Livotec 612', danhMuc: 'Máy lọc RO', giaBan: 5490000, thoiGianBaoHanh: 24, sku: 'KAR-612' },
    { tenSanPham: 'Máy lọc nước Karofi KAQ-U05', danhMuc: 'Máy lọc RO', giaBan: 4200000, thoiGianBaoHanh: 24, sku: 'KAR-U05' },
    { tenSanPham: 'Máy lọc nước Kangaroo KG10A3', danhMuc: 'Máy lọc RO', giaBan: 6890000, thoiGianBaoHanh: 12, sku: 'KAN-10A3' },
    { tenSanPham: 'Máy lọc nước Panasonic TK-AS45', danhMuc: 'Máy lọc Ion Kiềm', giaBan: 25500000, thoiGianBaoHanh: 36, sku: 'PAN-AS45' },
];

const LOCATIONS = [
  { pCode: 1, pName: 'Thành phố Hà Nội', dCode: 1, dName: 'Quận Ba Đình', wCode: 1, wName: 'Phường Phúc Xá', street: 'Số 12 Phúc Xá' },
  { pCode: 1, pName: 'Thành phố Hà Nội', dCode: 5, dName: 'Quận Cầu Giấy', wCode: 172, wName: 'Phường Dịch Vọng', street: 'Số 45 Duy Tân' },
  { pCode: 1, pName: 'Thành phố Hà Nội', dCode: 6, dName: 'Quận Đống Đa', wCode: 190, wName: 'Phường Cát Linh', street: '88 Giảng Võ' },
];

const TECHNICIANS = [
    { id: 'tech_01', name: 'KTV Nguyễn Hoàng Nam', phone: '0912345678' },
    { id: 'tech_02', name: 'KTV Trần Văn Đức', phone: '0987654321' },
];

const VIETNAMESE_NAMES = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Minh Đức', 'Hoàng Thu Thảo', 'Vũ Anh Tuấn'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPhone = () => '0' + Math.floor(Math.random() * 900000000 + 100000000);

async function seed() {
    console.log('🚀 Đang chạy Seed Data V12 (Chuẩn hóa Thiết bị & Bảo hành)...');

    // 1. Đồng bộ Kỹ thuật viên
    for (const t of TECHNICIANS) {
        await db.collection('nguoiDung').doc(t.id).set({
            uid: t.id, displayName: t.name, phoneNumber: t.phone,
            role: 4, status: 'active', isVerified: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    // 2. Đồng bộ Đơn hàng & Thiết bị
    console.log(' ⏳ Đang đồng bộ 100 đơn hàng & thiết bị bảo hành...');
    for (let i = 0; i < 100; i++) {
        const orderId = `SEED-ORD-${String(i).padStart(3, '0')}`;
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (i % 60));

        const loc = randomItem(LOCATIONS);
        const prod = randomItem(PRODUCTS);

        // Phân bổ trạng thái chuẩn
        let status = 'pending';
        if (i >= 10 && i < 20) status = 'approved';   // Đã duyệt
        else if (i >= 20 && i < 35) status = 'assigned';   // Đã phân công
        else if (i >= 35 && i < 50) status = 'processing'; // Đang xử lý
        else if (i >= 50 && i < 90) status = 'completed';  // Hoàn tất
        else if (i >= 90) status = 'paid';                 // Đã tất toán

        const orderType = (i % 10 === 0 && i > 0) ? 'maintenance' : 'installation';
        const assignedTechs = (status !== 'pending' && status !== 'approved') ? [randomItem(TECHNICIANS)] : [];
        const customerPhone = randomPhone();
        const customerName = randomItem(VIETNAMESE_NAMES);
        const quantity = (orderType === 'installation' && i % 15 === 0) ? 2 : 1;

        const orderData = {
            tenKhachHang: customerName,
            phoneNumber: customerPhone,
            provinceCode: loc.pCode, districtCode: loc.dCode, wardCode: loc.wCode,
            diaChiGiaoHang: `${loc.street}, ${loc.wName}, ${loc.dName}, ${loc.pName}`,
            tenSanPham: quantity > 1 ? `${prod.tenSanPham} (x${quantity})` : (orderType === 'maintenance' ? 'Bảo trì ' + prod.tenSanPham : prod.tenSanPham),
            items: [{
                id: prod.sku,
                name: prod.tenSanPham,
                price: orderType === 'maintenance' ? 150000 : prod.giaBan,
                quantity: quantity,
                thoiGianBaoHanh: orderType === 'maintenance' ? 0 : prod.thoiGianBaoHanh
            }],
            tongTien: (orderType === 'maintenance' ? 150000 : prod.giaBan) * quantity,
            trangThai: status,
            loaiDonHang: orderType,
            technicians: assignedTechs,
            ngayTao: admin.firestore.Timestamp.fromDate(orderDate),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            ngayBaoTriTiepTheo: admin.firestore.Timestamp.fromDate(new Date(orderDate.getTime() + 180 * 24 * 60 * 60 * 1000)),
            isSeedData: true
        };

        await db.collection('donHang').doc(orderId).set(orderData, { merge: true });

        // TỰ ĐỘNG TẠO THIẾT BỊ BẢO HÀNH (Cho đơn Hoàn tất & loại Lắp đặt)
        if ((status === 'completed' || status === 'paid') && orderType === 'installation') {
            for (const item of orderData.items) {
                if (item.thoiGianBaoHanh > 0) {
                    for (let q = 0; q < item.quantity; q++) {
                        const deviceId = `DEV-SEED-${orderId.slice(-3)}-${q}`;
                        const warrantyUntil = new Date(orderDate);
                        warrantyUntil.setMonth(orderDate.getMonth() + item.thoiGianBaoHanh);

                        const deviceData = {
                            id: deviceId, did: deviceId, order_id: orderId,
                            customer_id: customerPhone, customer_name: customerName, customer_phone: customerPhone,
                            product_id: item.id, product_name: item.name,
                            serial_number: `SN-${orderId.slice(-4)}-${q}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
                            install_date: admin.firestore.Timestamp.fromDate(orderDate),
                            warranty_until: admin.firestore.Timestamp.fromDate(warrantyUntil),
                            status: 'active',
                            created_at: admin.firestore.FieldValue.serverTimestamp(),
                            updated_at: admin.firestore.FieldValue.serverTimestamp(),
                            notes: `Kích hoạt bảo hành ${item.thoiGianBaoHanh} tháng (Dữ liệu Seed)`
                        };

                        await db.collection('devices').doc(deviceId).set(deviceData, { merge: true });

                        // Thêm lịch sử lắp đặt
                        await db.collection('devices').doc(deviceId).collection('history').add({
                            event: 'installed',
                            description: 'Thiết bị lắp đặt và kích hoạt bảo hành thành công (Seed Data)',
                            performed_by: assignedTechs[0]?.id || 'system',
                            performed_by_name: assignedTechs[0]?.name || 'Hệ thống',
                            performed_at: admin.firestore.Timestamp.fromDate(orderDate)
                        });
                    }
                }
            }
        }
    }

    console.log('✨ HOÀN TẤT! Đã seed 100 đơn hàng và đồng bộ danh sách Thiết bị/Bảo hành chuẩn V12.');
    process.exit(0);
}

seed().catch(err => { console.error('❌ Lỗi Seed:', err); process.exit(1); });
