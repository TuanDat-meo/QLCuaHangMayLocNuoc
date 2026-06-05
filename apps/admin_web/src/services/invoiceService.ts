import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { getDb } from './authService';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  issuedAt: any;
  items: any[];
  isSeedData?: boolean;
}

const COLLECTION_NAME = 'invoices';

export const getInvoiceByOrderId = async (orderId: string): Promise<Invoice | null> => {
  const db = getDb();
  const q = query(collection(db, COLLECTION_NAME), where('orderId', '==', orderId), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const d = querySnapshot.docs[0];
  return { id: d.id, ...d.data() } as Invoice;
};

export const createInvoiceFromOrder = async (order: any) => {
  const db = getDb();
  const invoiceId = `INV-${order.id.split('-').pop() || order.id.slice(-6).toUpperCase()}`;

  const invoiceData: Omit<Invoice, 'id'> = {
    invoiceNumber: invoiceId,
    orderId: order.id,
    customerName: order.customerName || order.tenKhachHang,
    customerPhone: order.phoneNumber,
    amount: order.totalAmount || order.tongTien,
    paymentMethod: 'COD',
    paymentStatus: 'paid',
    issuedAt: serverTimestamp(),
    items: order.items || []
  };

  await setDoc(doc(db, COLLECTION_NAME, invoiceId), invoiceData);
  return invoiceId;
};
