import 'package:cloud_firestore/cloud_firestore.dart';

class ProductSpecs {
  final String? model;
  final dynamic capacity;
  final int? warrantyYears;
  final String? doBen;
  final String? thoiGianBaoHanh;

  const ProductSpecs({
    this.model,
    this.capacity,
    this.warrantyYears,
    this.doBen,
    this.thoiGianBaoHanh,
  });

  factory ProductSpecs.fromMap(Map<String, dynamic>? map) {
    if (map == null) return const ProductSpecs();
    return ProductSpecs(
      model: map['model'],
      capacity: map['capacity'],
      warrantyYears: map['warrantyYears'],
      doBen: map['doBen'],
      thoiGianBaoHanh: map['thoiGianBaoHanh'],
    );
  }
}

class Product {
  final String id;
  final String name;           
  final double price;          
  final double? giaLapDat;
  final String? danhMuc;       
  final String? danhMucId;
  final List<String> imageUrls; 
  final String? moTa;          
  final String? sku;
  final int? soLuongTon;
  final int? tonKho;
  final String? thuongHieu;
  final String? trangThai;     
  final List<String> phuKienDiKem;
  final Map<String, String>? thongSoKyThuat;
  final int nguongCanhBao;
  final double? averageRating;
  final DateTime createdAt;
  final DateTime? ngayCapNhat;

  Product({
    required this.id,
    required this.name,
    required this.price,
    this.giaLapDat,
    this.danhMuc,
    this.danhMucId,
    this.imageUrls = const [],
    this.moTa,
    this.sku,
    this.soLuongTon,
    this.tonKho,
    this.thuongHieu,
    this.trangThai,
    this.phuKienDiKem = const [],
    this.thongSoKyThuat,
    this.nguongCanhBao = 5,
    this.averageRating,
    DateTime? createdAt,
    this.ngayCapNhat,
  }) : createdAt = createdAt ?? DateTime.now();

  String get category => danhMuc ?? '';
  String get description => moTa ?? 'Chưa có mô tả sản phẩm.';
  bool get isAvailable => trangThai == 'Active' && (tonKho ?? soLuongTon ?? 0) > 0;

  ProductSpecs get specs => ProductSpecs(
    doBen: thongSoKyThuat?['doBen'],
    thoiGianBaoHanh: thongSoKyThuat?['thoiGianBaoHanh'],
  );

  factory Product.fromMap(Map<String, dynamic> data, {String id = ''}) {
    List<String> images = [];
    
    // Kiểm tra tất cả các trường có thể chứa link ảnh
    final rawImages = data['danhSachAnh'] ?? 
                     data['imageUrls'] ?? 
                     data['hinhAnh'] ?? 
                     data['image'] ?? 
                     data['url'] ?? 
                     data['linkAnh'] ??
                     data['imageUrl']; // Thêm các trường này
    
    if (rawImages is List) {
      images = List<String>.from(rawImages.map((e) => e.toString()));
    } else if (rawImages is String && rawImages.isNotEmpty) {
      images = [rawImages];
    }

    return Product(
      id: id.isNotEmpty ? id : (data['id'] as String? ?? ''),
      name: data['tenSanPham'] as String? ?? data['name'] as String? ?? '',
      price: (data['giaBan'] as num?)?.toDouble() ?? (data['price'] as num?)?.toDouble() ?? 0.0,
      giaLapDat: (data['giaLapDat'] as num?)?.toDouble(),
      danhMuc: data['danhMuc'] as String? ?? data['category'] as String?,
      danhMucId: data['danhMucId'] as String?,
      imageUrls: images,
      moTa: data['moTa'] as String? ?? data['description'] as String?,
      sku: data['sku'] as String?,
      soLuongTon: data['soLuongTon'] as int?,
      tonKho: data['tonKho'] as int? ?? data['stock'] as int?,
      thuongHieu: data['thuongHieu'] as String?,
      trangThai: data['trangThai'] as String? ?? data['status'] as String?,
      phuKienDiKem: List<String>.from(data['phuKienDiKem'] as List? ?? []),
      thongSoKyThuat: _parseStringMap(data['thongSoKyThuat']),
      nguongCanhBao: data['nguongCanhBao'] as int? ?? 5,
      averageRating: (data['averageRating'] as num?)?.toDouble(),
      createdAt: _parseTimestamp(data['createdAt']) ?? DateTime.now(),
      ngayCapNhat: _parseTimestamp(data['ngayCapNhat']),
    );
  }

  static Map<String, String>? _parseStringMap(dynamic value) {
    if (value == null) return null;
    if (value is Map) return value.map((k, v) => MapEntry(k.toString(), v.toString()));
    return null;
  }

  static DateTime? _parseTimestamp(dynamic value) {
    if (value == null) return null;
    if (value is Timestamp) return value.toDate();
    if (value is DateTime) return value;
    return null;
  }
}
