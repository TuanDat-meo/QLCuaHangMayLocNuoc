import fs from 'fs';
import readline from 'readline';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

// 1. Đọc cấu hình từ .env.local
const envContent = fs.readFileSync('../apps/admin_web/.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) env[key.trim()] = value.join('=').trim();
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// 2. Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// 3. Hàm hỗ trợ tạo ngày ngẫu nhiên trong khoảng 60 ngày qua
const getRandomDatePast2Months = () => {
  const now = new Date();
  const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 ngày trước
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
};

// 4. Các dữ liệu mẫu
const suppliers = ['Karofi', 'Kangaroo', 'Panasonic', 'Aqua', 'Sunhouse'];
const productCategories = ['Máy lọc nước RO', 'Máy lọc nước Nóng Lạnh', 'Hệ thống lọc tổng', 'Lõi lọc & Phụ kiện'];
const statuses = ['pending', 'approved', 'assigned', 'processing', 'completed', 'paid', 'incident', 'cancelled'];
const orderTypes = ['installation', 'maintenance', 'repair'];

const customerNames = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đặng Thị F', 'Bùi Văn G', 'Đỗ Thị H', 'Hồ Văn I', 'Ngô Thị K', 'Trương Văn L', 'Lý Thị M', 'Vương Văn N', 'Mai Thị O', 'Đinh Văn P'];
const addresses = [
  'Số 1, Đường ABC, Quận 1, TP HCM', 'Số 2, Đường DEF, Quận 2, TP HCM', 'Số 3, Đường GHI, Quận 3, TP HCM',
  'Ngõ 4, Phố JKL, Đống Đa, Hà Nội', 'Hẻm 5, Đường MNO, Tân Bình, TP HCM', 'KĐT PQR, Quận 7, TP HCM',
  'Chung cư STU, Thanh Xuân, Hà Nội', 'Khu dân cư VWX, Cầu Giấy, Hà Nội', 'Tòa nhà YZ, Hoàn Kiếm, Hà Nội'
];
const notes = ['Khách hàng yêu cầu gọi trước khi đến', 'Lắp đặt tại chung cư, cần thẻ thang máy', 'Máy kêu to, cần kiểm tra kỹ', 'Thay 3 lõi lọc thô', 'Bảo trì định kỳ 6 tháng', 'Sửa vòi nước bị rỉ', 'Lắp máy mới, cần mang theo dây cấp nước dài', '', '', ''];

// 5. Hàm chính để seed dữ liệu
async function seedData() {
  console.log('Bắt đầu quá trình seed dữ liệu (Append mode)...');

  const email = await askQuestion("Nhập Email Admin của bạn để cấp quyền ghi: ");
  const password = await askQuestion("Nhập Mật khẩu Admin: ");
  rl.close();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Đăng nhập thành công! Bắt đầu ghi dữ liệu lên Firebase...');
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.message);
    process.exit(1);
  }



  // --- Seed Sản phẩm (khoảng 15 sản phẩm) ---
  console.log('Đang tạo Sản phẩm mẫu...');
  const products = [];
  for (let i = 1; i <= 15; i++) {
    const product = {
      tenSanPham: `Sản phẩm mẫu ${i} - ${suppliers[Math.floor(Math.random() * suppliers.length)]}`,
      danhMuc: productCategories[Math.floor(Math.random() * productCategories.length)],
      nhaCungCap: suppliers[Math.floor(Math.random() * suppliers.length)],
      giaBan: Math.floor(Math.random() * 100) * 100000 + 500000,
      tonKho: Math.floor(Math.random() * 50) + 5,
      trangThai: 'Active',
      thoiGianBaoHanh: 12 + Math.floor(Math.random() * 3) * 12, // 12, 24, 36, 48 tháng
      createdAt: Timestamp.fromDate(getRandomDatePast2Months()),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'sanPham'), product);
    products.push({ id: docRef.id, ...product });
  }

  // Lấy danh sách kỹ thuật viên thực tế đang có để gán cho hợp lý, nếu không có thì tạo fake
  console.log('Đang lấy danh sách Kỹ thuật viên...');
  const usersSnapshot = await getDocs(query(collection(db, 'nguoiDung'), where('role', '==', 3))); // 3 = TECHNICIAN
  let technicians = [];
  usersSnapshot.forEach(doc => technicians.push({ id: doc.id, name: doc.data().displayName || 'KTV Vô Danh' }));
  
  if (technicians.length === 0) {
    console.log('Chưa có KTV nào, tạo KTV ảo...');
    const fakeTechs = [
      { id: 'fake_tech_1', name: 'Trần Kỹ Thuật' },
      { id: 'fake_tech_2', name: 'Lê Thợ Máy' },
      { id: 'fake_tech_3', name: 'Nguyễn Bảo Trì' }
    ];
    for (const tech of fakeTechs) {
      await setDoc(doc(db, 'nguoiDung', tech.id), {
        uid: tech.id,
        displayName: tech.name,
        email: `${tech.id}@example.com`,
        phoneNumber: '0987654321',
        role: 3,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    technicians = fakeTechs;
  }

  // --- Seed Đơn hàng (khoảng 80 đơn) ---
  console.log('Đang tạo Đơn hàng mẫu (khoảng 80 đơn trong 60 ngày qua)...');
  const orders = [];
  for (let i = 1; i <= 80; i++) {
    const orderDate = getRandomDatePast2Months();
    const isCompleted = orderDate.getTime() < Date.now() - 3 * 24 * 60 * 60 * 1000; // Đơn cách đây > 3 ngày thường đã xong
    
    let status = isCompleted ? (Math.random() > 0.2 ? 'completed' : 'paid') : statuses[Math.floor(Math.random() * statuses.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    
    // Gán 1-2 sản phẩm ngẫu nhiên
    const numItems = Math.floor(Math.random() * 2) + 1;
    const orderItems = [];
    let totalAmount = 0;
    for (let j = 0; j < numItems; j++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      orderItems.push({
        id: p.id,
        name: p.tenSanPham,
        price: p.giaBan,
        quantity: qty,
        thoiGianBaoHanh: p.thoiGianBaoHanh
      });
      totalAmount += p.giaBan * qty;
    }

    const scheduledDate = new Date(orderDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000); // Lịch hẹn sau 1-3 ngày tạo

    // KTV phụ trách
    const numTechs = Math.floor(Math.random() * 2) + 1;
    const assignedTechs = [];
    for(let k=0; k<numTechs; k++) {
        const t = technicians[Math.floor(Math.random() * technicians.length)];
        if (!assignedTechs.find(x => x.id === t.id)) assignedTechs.push(t);
    }

    const orderData = {
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      phoneNumber: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: addresses[Math.floor(Math.random() * addresses.length)],
      street: addresses[Math.floor(Math.random() * addresses.length)],
      provinceCode: 1, // Mặc định Hà Nội hoặc fake
      districtCode: 1,
      wardCode: 1,
      productName: orderItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
      items: orderItems,
      totalAmount: totalAmount,
      status: status,
      orderType: orderType,
      technicians: ['assigned', 'processing', 'completed', 'paid', 'incident'].includes(status) ? assignedTechs : [],
      scheduledDate: ['assigned', 'processing', 'completed', 'paid', 'incident'].includes(status) ? Timestamp.fromDate(scheduledDate) : null,
      createdAt: Timestamp.fromDate(orderDate),
      updatedAt: Timestamp.fromDate(new Date(orderDate.getTime() + 86400000)), // Update sau 1 ngày
      createdByName: 'Hệ thống (Seed)',
      note: notes[Math.floor(Math.random() * notes.length)]
    };

    const docRef = await addDoc(collection(db, 'donHang'), orderData);
    orders.push({ id: docRef.id, ...orderData });

    // --- Seed Thiết bị (nếu lắp đặt hoàn tất) ---
    if (orderType === 'installation' && (status === 'completed' || status === 'paid')) {
       for (const item of orderItems) {
           const installDate = new Date(orderDate.getTime() + 86400000);
           const warrantyUntil = new Date(installDate);
           warrantyUntil.setMonth(warrantyUntil.getMonth() + (item.thoiGianBaoHanh || 12));

           await addDoc(collection(db, 'thietBi'), {
               did: `AQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
               order_id: docRef.id,
               customer_id: 'guest',
               customer_name: orderData.customerName,
               customer_phone: orderData.phoneNumber,
               product_id: item.id,
               product_name: item.name,
               serial_number: `SN${Math.floor(Math.random() * 100000000)}`,
               install_date: Timestamp.fromDate(installDate),
               warranty_until: Timestamp.fromDate(warrantyUntil),
               status: 'active',
               created_at: Timestamp.fromDate(installDate),
               updated_at: Timestamp.fromDate(installDate)
           });
       }
    }

    // --- Seed Nhật ký (Audit Logs) ---
    await addDoc(collection(db, 'nhatKyHoatDong'), {
        action: 'Tạo đơn hàng tự động',
        module: 'Đơn hàng',
        targetId: docRef.id,
        userEmail: 'system@aquacare.vn',
        userName: 'System Auto',
        timestamp: Timestamp.fromDate(orderDate),
        details: { client: orderData.customerName, amount: orderData.totalAmount }
    });
  }

  console.log('✅ SEED DỮ LIỆU HOÀN TẤT!');
  process.exit(0);
}

seedData().catch(console.error);
