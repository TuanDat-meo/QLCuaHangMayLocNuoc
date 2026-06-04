export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  status: 'Active' | 'Inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface ImportVoucherItem {
  productId: string;
  productName: string;
  quantity: number;
  importPrice: number;
  category?: string;
  sku?: string;
  imageUrl?: string;
  sellingPrice?: number; // Giá bán lẻ đề xuất cho sản phẩm mới
}

export interface ImportVoucher {
  id: string;
  supplierId: string;
  supplierName: string;
  importDate: any;
  items: ImportVoucherItem[];
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  note?: string;
  createdBy: string;
  createdByName: string;
  createdAt: any;
  updatedAt: any;
}
