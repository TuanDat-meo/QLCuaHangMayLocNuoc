import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from './authService';

export interface Product {
  id: string;
  tenSanPham: string;
  danhMuc: string;
  nhaCungCap: string; // Nhà cung cấp
  giaBan: number;
  tonKho: number;
  trangThai: 'Active' | 'OutOfStock' | 'Inactive';
  moTa?: string;
  imageUrl?: string;
  sku?: string;
  thoiGianBaoHanh: number; // Thời gian bảo hành tính theo tháng
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'sanPham';

export const getProducts = async (): Promise<Product[]> => {
  const db = getDb();
  const q = query(collection(db, COLLECTION_NAME), orderBy('tenSanPham', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const db = getDb();
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...product,
    thoiGianBaoHanh: Number(product.thoiGianBaoHanh) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const db = getDb();
  const productRef = doc(db, COLLECTION_NAME, id);
  const updateData = { ...product, updatedAt: serverTimestamp() };
  if (product.thoiGianBaoHanh !== undefined) {
    updateData.thoiGianBaoHanh = Number(product.thoiGianBaoHanh);
  }
  return await updateDoc(productRef, updateData);
};

export const deleteProduct = async (id: string) => {
  const db = getDb();
  const productRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(productRef);
};

export const updateStock = async (id: string, newStock: number) => {
  const db = getDb();
  const productRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(productRef, {
    tonKho: newStock,
    trangThai: newStock > 0 ? 'Active' : 'OutOfStock',
    updatedAt: serverTimestamp()
  });
};
