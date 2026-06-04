import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { getDb } from './authService';
import { Supplier, ImportVoucher } from '../types/supplier';

const SUPPLIER_COLLECTION = 'suppliers';
const IMPORT_COLLECTION = 'importVouchers';

export const getSuppliers = async (): Promise<Supplier[]> => {
  const db = getDb();
  const q = query(collection(db, SUPPLIER_COLLECTION), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Supplier));
};

export const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
  const db = getDb();
  return await addDoc(collection(db, SUPPLIER_COLLECTION), {
    ...supplier,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
  const db = getDb();
  const docRef = doc(db, SUPPLIER_COLLECTION, id);
  return await updateDoc(docRef, {
    ...supplier,
    updatedAt: serverTimestamp()
  });
};

export const deleteSupplier = async (id: string) => {
  const db = getDb();
  const docRef = doc(db, SUPPLIER_COLLECTION, id);
  return await deleteDoc(docRef);
};

export const getImportVouchers = async (): Promise<ImportVoucher[]> => {
  const db = getDb();
  const q = query(collection(db, IMPORT_COLLECTION), orderBy('importDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ImportVoucher));
};

export const createImportVoucher = async (voucher: any) => {
  const db = getDb();

  // 1. Thu thập tên sản phẩm và chuẩn hóa (trim) để tìm kiếm chính xác
  const productNames = [...new Set(voucher.items.map((i: any) => i.productName?.trim()).filter(Boolean))];
  let existingProducts: any[] = [];

  if (productNames.length > 0) {
    // Chia nhỏ mảng tên nếu quá 30 sản phẩm (giới hạn của 'in' query)
    const q = query(collection(db, 'sanPham'), where('tenSanPham', 'in', productNames.slice(0, 30)));
    const snap = await getDocs(q);
    existingProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return await runTransaction(db, async (transaction) => {
    let finalSupplierId = voucher.supplierId;
    let finalSupplierName = voucher.supplierName?.trim();

    // Xử lý Nhà cung cấp mới
    if (finalSupplierId === 'NEW_SUPPLIER') {
      const supplierRef = doc(collection(db, SUPPLIER_COLLECTION));
      const sName = voucher.newSupplierName?.trim();
      transaction.set(supplierRef, {
        name: sName,
        phone: voucher.newSupplierPhone || 'Chưa có',
        taxCode: voucher.newSupplierTaxCode || '',
        address: voucher.newSupplierAddress || 'Chưa có',
        status: 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      finalSupplierId = supplierRef.id;
      finalSupplierName = sName;
    }

    const processedItems = [];

    // 2. XỬ LÝ TỪNG DÒNG HÀNG NHẬP
    for (const item of voucher.items) {
      const iName = item.productName?.trim();

      // LOGIC QUAN TRỌNG: Chỉ khớp nếu TRÙNG TÊN và TRÙNG NHÀ CUNG CẤP
      // Nếu khác nhà cung cấp, hệ thống sẽ tự động tách thành sản phẩm mới
      const exactMatch = existingProducts.find(p =>
        p.tenSanPham?.trim() === iName &&
        (p.nhaCungCap?.trim() === finalSupplierName)
      );

      let finalProductId = exactMatch?.id;

      if (!finalProductId) {
        // TẠO SẢN PHẨM MỚI (vì chưa có sản phẩm này cho NCC hiện tại)
        const productRef = doc(collection(db, 'sanPham'));
        const sellingPrice = item.sellingPrice || Math.round(item.importPrice * 1.3);

        transaction.set(productRef, {
          tenSanPham: iName,
          tonKho: item.quantity,
          trangThai: 'Active',
          giaBan: sellingPrice,
          danhMuc: item.category || 'Linh kiện',
          nhaCungCap: finalSupplierName,
          sku: item.sku?.trim() || ('SKU-' + Math.random().toString(36).substring(7).toUpperCase()),
          imageUrl: item.imageUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        finalProductId = productRef.id;

        // Thêm vào danh sách đã tồn tại để nếu dòng tiếp theo trong cùng voucher có cùng SP này thì nó sẽ match
        existingProducts.push({
            id: finalProductId,
            tenSanPham: iName,
            nhaCungCap: finalSupplierName,
            tonKho: item.quantity
        });
      } else {
        // CẬP NHẬT TỒN KHO VÀO SẢN PHẨM ĐÃ CÓ (CÙNG TÊN & CÙNG NCC)
        const productRef = doc(db, 'sanPham', finalProductId);
        const productDoc = await transaction.get(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const currentStock = productData.tonKho || 0;
          const newStock = currentStock + item.quantity;

          const updateData: any = {
            tonKho: newStock,
            trangThai: newStock > 0 ? 'Active' : 'OutOfStock',
            updatedAt: serverTimestamp()
          };

          // Cập nhật giá bán mới nếu có nhập vào phiếu
          if (item.sellingPrice !== undefined && item.sellingPrice >= 0) {
            updateData.giaBan = item.sellingPrice;
          }

          transaction.update(productRef, updateData);

          // Cập nhật local list để dòng tiếp theo (nếu có) cộng dồn chính xác
          const idx = existingProducts.findIndex(p => p.id === finalProductId);
          if (idx !== -1) existingProducts[idx].tonKho = newStock;
        }
      }

      processedItems.push({
        productId: finalProductId,
        productName: iName,
        quantity: item.quantity,
        importPrice: item.importPrice,
        sku: item.sku?.trim() || ''
      });
    }

    // 3. Tạo phiếu nhập cuối cùng
    const voucherRef = doc(collection(db, IMPORT_COLLECTION));
    transaction.set(voucherRef, {
      supplierId: finalSupplierId,
      supplierName: finalSupplierName,
      importDate: voucher.importDate,
      items: processedItems,
      totalAmount: voucher.totalAmount,
      status: voucher.status || 'Completed',
      note: voucher.note || '',
      createdBy: voucher.createdBy,
      createdByName: voucher.createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return voucherRef.id;
  });
};
