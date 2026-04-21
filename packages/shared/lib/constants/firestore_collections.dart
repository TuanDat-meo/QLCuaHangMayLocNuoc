// lib/constants/firestore_collections.dart
// Tên collection và field dùng chung toàn project
// Import file này thay vì gõ string trực tiếp — tránh typo

// ─────────────────────────────────────────────────────────────
// TÊN COLLECTION
// ─────────────────────────────────────────────────────────────

class Col {
  Col._();

  static const nguoiDung        = 'nguoiDung';
  static const danhMuc          = 'danhMuc';
  static const sanPham          = 'sanPham';
  static const nhaCungCap       = 'nhaCungCap';
  static const phieuNhapHang    = 'phieuNhapHang';
  static const lichSuTonKho     = 'lichSuTonKho';
  static const donHang          = 'donHang';
  static const datTruoc         = 'datTruoc';
  static const thietBi          = 'thietBi';
  static const yeuCauBaoHanh    = 'yeuCauBaoHanh';
  static const lichBaoTri       = 'lichBaoTri';
  static const thongBao         = 'thongBao';
  static const danhGia          = 'danhGia';
  static const nhatKyHoatDong   = 'nhatKyHoatDong';
  static const banner           = 'banner';
  static const phongChat        = 'phongChat';
}

// ─────────────────────────────────────────────────────────────
// TÊN SUBCOLLECTION
// ─────────────────────────────────────────────────────────────

class SubCol {
  SubCol._();

  // nguoiDung/{uid}/...
  static const diaChiGiaoHang   = 'diaChiGiaoHang';
  static const gioHang          = 'gioHang';
  static const lichSuHoatDong   = 'lichSuHoatDong';

  // donHang/{id}/...
  static const lichSuTrangThai  = 'lichSuTrangThai';

  // phongChat/{id}/...
  static const tinNhan          = 'tinNhan';
}

// ─────────────────────────────────────────────────────────────
// FIELD — NGUOI DUNG
// ─────────────────────────────────────────────────────────────

class FNguoiDung {
  FNguoiDung._();
  static const uid              = 'uid';
  static const vaiTro           = 'vaiTro';
  static const hoTen            = 'hoTen';
  static const soDienThoai      = 'soDienThoai';
  static const email            = 'email';
  static const anhDaiDien       = 'anhDaiDien';
  static const trangThai        = 'trangThai';
  static const soLanDangNhatSai = 'soLanDangNhatSai';
  static const khoaUntil        = 'khoaUntil';
  static const fcmToken         = 'fcmToken';
  static const tuyChinhThongBao = 'tuyChinhThongBao';
  static const khuVuc           = 'khuVuc';          // KTV only
  static const lanDauDangNhap   = 'lanDauDangNhap';  // KTV/Admin only
  static const ngayTao          = 'ngayTao';
  static const ngayCapNhat      = 'ngayCapNhat';
}

// ─────────────────────────────────────────────────────────────
// FIELD — SAN PHAM
// ─────────────────────────────────────────────────────────────

class FSanPham {
  FSanPham._();
  static const danhMucId        = 'danhMucId';
  static const tenSanPham       = 'tenSanPham';
  static const thuongHieu       = 'thuongHieu';
  static const sku              = 'sku';
  static const moTa             = 'moTa';
  static const danhSachAnh      = 'danhSachAnh';
  static const giaBan           = 'giaBan';
  static const giaLapDat        = 'giaLapDat';
  static const thongSoKyThuat   = 'thongSoKyThuat';
  static const phuKienDiKem     = 'phuKienDiKem';
  static const trangThai        = 'trangThai';
  static const soLuongTon       = 'soLuongTon';
  static const nguongCanhBao    = 'nguongCanhBao';
  static const thuTuHienThi     = 'thuTuHienThi';
  static const ngayTao          = 'ngayTao';
  static const ngayCapNhat      = 'ngayCapNhat';
}

// ─────────────────────────────────────────────────────────────
// FIELD — DON HANG
// ─────────────────────────────────────────────────────────────

class FDonHang {
  FDonHang._();
  static const maDonHang        = 'maDonHang';
  static const khachHangId      = 'khachHangId';
  static const tenKhachHang     = 'tenKhachHang';
  static const soDienThoai      = 'soDienThoai';
  static const danhSachSanPham  = 'danhSachSanPham';
  static const tongTien         = 'tongTien';
  static const diaChi           = 'diaChi';
  static const gioHen           = 'gioHen';
  static const trangThai        = 'trangThai';
  static const kyThuatVienId    = 'kyThuatVienId';
  static const tenKyThuatVien   = 'tenKyThuatVien';
  static const soTienCOD        = 'soTienCOD';
  static const soTienTip        = 'soTienTip';
  static const anhHoanThanh     = 'anhHoanThanh';
  static const lyDoHuy          = 'lyDoHuy';
  static const ghiChuAdmin      = 'ghiChuAdmin';
  static const ngayTao          = 'ngayTao';
  static const ngayCapNhat      = 'ngayCapNhat';
}

// ─────────────────────────────────────────────────────────────
// FIELD — THIET BI
// ─────────────────────────────────────────────────────────────

class FThietBi {
  FThietBi._();
  static const maQR               = 'maQR';
  static const khachHangId        = 'khachHangId';
  static const donHangId          = 'donHangId';
  static const sanPhamId          = 'sanPhamId';
  static const tenSanPham         = 'tenSanPham';
  static const soSeri             = 'soSeri';
  static const diaChiLapDat       = 'diaChiLapDat';
  static const ngayLapDat         = 'ngayLapDat';
  static const lapDatBoi          = 'lapDatBoi';
  static const thangBaoHanh       = 'thangBaoHanh';
  static const batDauBaoHanh      = 'batDauBaoHanh';
  static const ketThucBaoHanh     = 'ketThucBaoHanh';
  static const ngayBaoTriTiepTheo = 'ngayBaoTriTiepTheo';
  static const chuKyBaoTriThang   = 'chuKyBaoTriThang';
  static const trangThai          = 'trangThai';
  static const ngayTao            = 'ngayTao';
}

// ─────────────────────────────────────────────────────────────
// FIELD — THONG BAO
// ─────────────────────────────────────────────────────────────

class FThongBao {
  FThongBao._();
  static const nguoiNhanId      = 'nguoiNhanId';
  static const tieuDe           = 'tieuDe';
  static const noiDung          = 'noiDung';
  static const loai             = 'loai';
  static const thamChieuId      = 'thamChieuId';
  static const loaiThamChieu    = 'loaiThamChieu';
  static const daDoc            = 'daDoc';
  static const ngayTao          = 'ngayTao';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — TRANG THAI DON HANG
// ─────────────────────────────────────────────────────────────

class TrangThaiDonHang {
  TrangThaiDonHang._();
  static const choXacNhan   = 'cho_xn';
  static const daXacNhan    = 'da_xn';
  static const daPhanCong   = 'da_phan_cong';
  static const dangDi       = 'dang_di';
  static const dangLapDat   = 'dang_lap';
  static const hoanThanh    = 'hoan_thanh';
  static const huy          = 'huy';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — TRANG THAI THIET BI
// ─────────────────────────────────────────────────────────────

class TrangThaiThietBi {
  TrangThaiThietBi._();
  static const hoatDong       = 'hoat_dong';
  static const hetBaoHanh     = 'het_bao_hanh';
  static const ngungSuDung    = 'ngung_su_dung';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — TRANG THAI LICH BAO TRI
// ─────────────────────────────────────────────────────────────

class TrangThaiLichBaoTri {
  TrangThaiLichBaoTri._();
  static const choXacNhan   = 'cho_xn';
  static const daXacNhan    = 'da_xn';
  static const daGan        = 'da_gan';
  static const hoanThanh    = 'hoan_thanh';
  static const doiLich      = 'doi_lich';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — VAI TRO
// ─────────────────────────────────────────────────────────────

class VaiTro {
  VaiTro._();
  static const khachHang    = 'customer';
  static const admin        = 'admin';
  static const kyThuatVien  = 'technician';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — LOAI THONG BAO
// ─────────────────────────────────────────────────────────────

class LoaiThongBao {
  LoaiThongBao._();
  static const donHang    = 'don_hang';
  static const baoTri     = 'bao_tri';
  static const baoHanh    = 'bao_hanh';
  static const hangVe     = 'hang_ve';
  static const phanCong   = 'phan_cong';
  static const heThong    = 'he_thong';
}

// ─────────────────────────────────────────────────────────────
// ENUM VALUE — LOAI SU KIEN LICH SU HOAT DONG
// ─────────────────────────────────────────────────────────────

class LoaiSuKien {
  LoaiSuKien._();

  // Khách hàng
  static const datHang          = 'DAT_HANG';
  static const huyDon           = 'HUY_DON';
  static const datTruoc         = 'DAT_TRUOC';
  static const yeuCauBaoHanh    = 'YEU_CAU_BAO_HANH';
  static const xacNhanBaoTri    = 'XAC_NHAN_BAO_TRI';
  static const doiLichBaoTri    = 'DOI_LICH_BAO_TRI';
  static const danhGia          = 'DANH_GIA';
  static const capNhatHoSo      = 'CAP_NHAT_HO_SO';

  // KTV
  static const nhanViec         = 'NHAN_VIEC';
  static const batDauCongViec   = 'BAT_DAU_CONG_VIEC';
  static const daDenNoi         = 'DA_DEN_NOI';
  static const hoanThanh        = 'HOAN_THANH';
  static const baoCaoSuCo       = 'BAO_CAO_SU_CO';
  static const nhanDanhGia      = 'NHAN_DANH_GIA';
  static const baoTriDinhKy     = 'BAO_TRI_DINH_KY';
  static const xuLyBaoHanh      = 'XU_LY_BAO_HANH';

  // Admin/Nhân viên
  static const xacNhanDon       = 'XAC_NHAN_DON';
  static const phanCongKTV      = 'PHAN_CONG_KTV';
  static const doiKTV           = 'DOI_KTV';
  static const suaSanPham       = 'SUA_SAN_PHAM';
  static const themSanPham      = 'THEM_SAN_PHAM';
  static const anSanPham        = 'AN_SAN_PHAM';
  static const nhapKho          = 'NHAP_KHO';
  static const dieuChinhKho     = 'DIEU_CHINH_KHO';
  static const taoTaiKhoan      = 'TAO_TAI_KHOAN';
  static const khoaTaiKhoan     = 'KHOA_TAI_KHOAN';

  // Chung
  static const dangNhap         = 'DANG_NHAP';
  static const dangXuat         = 'DANG_XUAT';
  static const doiMatKhau       = 'DOI_MAT_KHAU';
  static const resetMatKhau     = 'RESET_MAT_KHAU';
}
