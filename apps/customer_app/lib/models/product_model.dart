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
  final String name;           // tenSanPham
  final double price;          // giaBan
  final double? giaLapDat;
  final String? danhMuc;       // danhMuc — dùng làm category
  final String? danhMucId;
  final List<String> imageUrls; // danhSachAnh
  final String? moTa;          // moTa — dùng làm description
  final String? sku;
  final int? soLuongTon;
  final int? tonKho;
  final String? thuongHieu;
  final String? trangThai;     // 'Active' = isAvailable
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

  // ── Computed getters ────────────────────────────────────────────────────────

  /// Alias cho ProductController và ProductsScreen
  String get category => danhMuc ?? '';

  /// Alias cho ProductDetailScreen
  String get description => moTa ?? 'Chưa có mô tả sản phẩm.';

  /// Alias cho ProductDetailScreen, ProductsScreen
  bool get isAvailable => trangThai == 'Active' && (tonKho ?? soLuongTon ?? 0) > 0;

  bool get isLowStock => (tonKho ?? soLuongTon ?? 0) <= nguongCanhBao;

  /// Alias cho ProductDetailScreen specs
  ProductSpecs get specs => ProductSpecs(
    doBen: thongSoKyThuat?['doBen'],
    thoiGianBaoHanh: thongSoKyThuat?['thoiGianBaoHanh'],
  );

  // ── fromMap — dùng cho ProductController.loadProducts() ────────────────────
  factory Product.fromMap(Map<String, dynamic> data, {String id = ''}) {
    return Product(
      id: id.isNotEmpty ? id : (data['id'] as String? ?? ''),
      name: data['tenSanPham'] as String? ?? data['name'] as String? ?? '',
      price: (data['giaBan'] as num?)?.toDouble() ?? (data['price'] as num?)?.toDouble() ?? 0.0,
      giaLapDat: (data['giaLapDat'] as num?)?.toDouble(),
      danhMuc: data['danhMuc'] as String? ?? data['category'] as String?,
      danhMucId: data['danhMucId'] as String?,
      imageUrls: List<String>.from(data['danhSachAnh'] as List? ?? data['imageUrls'] as List? ?? []),
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

  // ── fromFirestore — dùng trực tiếp với DocumentSnapshot ────────────────────
  factory Product.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Product.fromMap(data, id: doc.id);
  }

  Map<String, dynamic> toFirestore() {
    return {
      'tenSanPham': name,
      'giaBan': price,
      'giaLapDat': giaLapDat,
      'danhMuc': danhMuc,
      'danhMucId': danhMucId,
      'danhSachAnh': imageUrls,
      'moTa': moTa,
      'sku': sku,
      'soLuongTon': soLuongTon,
      'tonKho': tonKho,
      'thuongHieu': thuongHieu,
      'trangThai': trangThai,
      'phuKienDiKem': phuKienDiKem,
      'thongSoKyThuat': thongSoKyThuat,
      'nguongCanhBao': nguongCanhBao,
      'createdAt': createdAt,
      'ngayCapNhat': ngayCapNhat ?? DateTime.now(),
      'averageRating': averageRating,
    };
  }

  Product copyWith({
    String? id,
    String? name,
    double? price,
    double? giaLapDat,
    String? danhMuc,
    String? danhMucId,
    List<String>? imageUrls,
    String? moTa,
    String? sku,
    int? soLuongTon,
    int? tonKho,
    String? thuongHieu,
    String? trangThai,
    List<String>? phuKienDiKem,
    Map<String, String>? thongSoKyThuat,
    int? nguongCanhBao,
    double? averageRating,
    DateTime? createdAt,
    DateTime? ngayCapNhat,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      giaLapDat: giaLapDat ?? this.giaLapDat,
      danhMuc: danhMuc ?? this.danhMuc,
      danhMucId: danhMucId ?? this.danhMucId,
      imageUrls: imageUrls ?? this.imageUrls,
      moTa: moTa ?? this.moTa,
      sku: sku ?? this.sku,
      soLuongTon: soLuongTon ?? this.soLuongTon,
      tonKho: tonKho ?? this.tonKho,
      thuongHieu: thuongHieu ?? this.thuongHieu,
      trangThai: trangThai ?? this.trangThai,
      phuKienDiKem: phuKienDiKem ?? this.phuKienDiKem,
      thongSoKyThuat: thongSoKyThuat ?? this.thongSoKyThuat,
      nguongCanhBao: nguongCanhBao ?? this.nguongCanhBao,
      averageRating: averageRating ?? this.averageRating,
      createdAt: createdAt ?? this.createdAt,
      ngayCapNhat: ngayCapNhat ?? this.ngayCapNhat,
    );
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  static double _parsePrice(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toDouble();
    final str = value.toString().replaceAll(',', '').replaceAll('.', '');
    return double.tryParse(str) ?? 0;
  }

  static List<String> _parseList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
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