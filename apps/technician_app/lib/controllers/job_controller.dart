import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

enum JobStatus {
  waiting,     // Đã phân công / Chờ
  onTheWay,    // Đang di chuyển
  arrived,     // Đã đến nơi
  installing,  // Đang lắp đặt
  completed,   // Hoàn thành
  needSupport  // Cần hỗ trợ / Gặp sự cố
}

extension JobStatusExtension on JobStatus {
  String get rawValue {
    switch (this) {
      case JobStatus.waiting:
        return 'da_phan_cong';
      case JobStatus.onTheWay:
        return 'dang_di';
      case JobStatus.arrived:
        return 'da_den_noi';
      case JobStatus.installing:
        return 'dang_lap';
      case JobStatus.completed:
        return 'hoan_thanh';
      case JobStatus.needSupport:
        return 'su_co';
    }
  }

  String get displayName {
    switch (this) {
      case JobStatus.waiting:
        return 'Chờ thực hiện';
      case JobStatus.onTheWay:
        return 'Đang di chuyển';
      case JobStatus.arrived:
        return 'Đã đến nơi';
      case JobStatus.installing:
        return 'Đang lắp đặt';
      case JobStatus.completed:
        return 'Đã hoàn thành';
      case JobStatus.needSupport:
        return 'Cần hỗ trợ';
    }
  }

  Color get color {
    switch (this) {
      case JobStatus.waiting:
        return const Color(0xff64748b);
      case JobStatus.onTheWay:
        return const Color(0xff0284c7);
      case JobStatus.arrived:
        return const Color(0xff0d9488);
      case JobStatus.installing:
        return const Color(0xffea580c);
      case JobStatus.completed:
        return const Color(0xff10b981);
      case JobStatus.needSupport:
        return const Color(0xffef4444);
    }
  }
}

class JobModel {
  final String id;
  final String customerName;
  final String customerPhone;
  final String address;
  final String appointmentTime;
  final String productName;
  final String productSpecs;
  final String adminNotes;
  final double codAmount;
  final double tipAmount;
  final JobStatus status;
  final DateTime date;
  final List<String> images;
  final List<String> imagesBefore;
  final List<String> imagesAfter;
  final List<Map<String, dynamic>> timeline;
  final List<Map<String, dynamic>> vatTuPhatSinh;
  final String? issueReason;
  final String? issueDesc;
  final double? customerLatitude;
  final double? customerLongitude;

  JobModel({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.appointmentTime,
    required this.productName,
    required this.productSpecs,
    required this.adminNotes,
    required this.codAmount,
    required this.tipAmount,
    required this.status,
    required this.date,
    required this.images,
    this.imagesBefore = const [],
    this.imagesAfter = const [],
    required this.timeline,
    this.vatTuPhatSinh = const [],
    this.issueReason,
    this.issueDesc,
    this.customerLatitude,
    this.customerLongitude,
  });

  JobModel copyWith({
    JobStatus? status,
    List<String>? images,
    List<String>? imagesBefore,
    List<String>? imagesAfter,
    double? tipAmount,
    double? codAmount,
    List<Map<String, dynamic>>? timeline,
    List<Map<String, dynamic>>? vatTuPhatSinh,
    String? issueReason,
    String? issueDesc,
    double? customerLatitude,
    double? customerLongitude,
  }) {
    return JobModel(
      id: id,
      customerName: customerName,
      customerPhone: customerPhone,
      address: address,
      appointmentTime: appointmentTime,
      productName: productName,
      productSpecs: productSpecs,
      adminNotes: adminNotes,
      codAmount: codAmount ?? this.codAmount,
      tipAmount: tipAmount ?? this.tipAmount,
      status: status ?? this.status,
      date: date,
      images: images ?? this.images,
      imagesBefore: imagesBefore ?? this.imagesBefore,
      imagesAfter: imagesAfter ?? this.imagesAfter,
      timeline: timeline ?? this.timeline,
      vatTuPhatSinh: vatTuPhatSinh ?? this.vatTuPhatSinh,
      issueReason: issueReason ?? this.issueReason,
      issueDesc: issueDesc ?? this.issueDesc,
      customerLatitude: customerLatitude ?? this.customerLatitude,
      customerLongitude: customerLongitude ?? this.customerLongitude,
    );
  }
}

class JobController extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  bool _isLoading = false;
  bool _hasFirestoreData = false;
  List<JobModel> _jobs = [];
  List<Map<String, dynamic>> _notifications = [];

  StreamSubscription? _jobsSub;
  StreamSubscription? _notisSub;
  StreamSubscription<User?>? _authSub;

  bool get isLoading => _isLoading;
  bool get hasFirestoreData => _hasFirestoreData;
  List<JobModel> get jobs => _jobs;
  List<Map<String, dynamic>> get notifications => _notifications;

  JobController() {
    _loadMockData();
    _authSub = _auth.authStateChanges().listen((user) {
      if (user != null) {
        _listenToFirestoreJobs(user.uid);
      } else {
        _cancelFirestoreListeners();
        _hasFirestoreData = false;
        _loadMockData();
        notifyListeners();
      }
    });
  }

  void _cancelFirestoreListeners() {
    _jobsSub?.cancel();
    _notisSub?.cancel();
    _jobsSub = null;
    _notisSub = null;
  }

  @override
  void dispose() {
    _cancelFirestoreListeners();
    _authSub?.cancel();
    super.dispose();
  }

  void _loadMockData() {
    final today = DateTime.now();
    _jobs = [
      JobModel(
        id: 'JOB-001',
        customerName: 'Nguyễn Văn Tiến',
        customerPhone: '0901234567',
        address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
        appointmentTime: '09:00 - ${today.day}/${today.month}/${today.year}',
        productName: 'Máy lọc nước RO HomeMax Pro',
        productSpecs: 'Model: HMP-500, 8 lõi lọc, công suất 500 GPD',
        adminNotes: 'Khách hàng yêu cầu lắp đặt tại tầng 3, không có thang máy. Cần mang thêm ống nối dài.',
        codAmount: 650000,
        tipAmount: 0,
        status: JobStatus.waiting,
        date: today,
        images: [],
        timeline: [
          {
            'status': 'da_phan_cong',
            'time': today.subtract(const Duration(hours: 2)),
            'title': 'Đơn hàng được phân công',
            'desc': 'Hệ thống tự động phân công cho bạn',
          }
        ],
        customerLatitude: 10.7769,
        customerLongitude: 106.7009,
      ),
      JobModel(
        id: 'JOB-002',
        customerName: 'Trần Thị Hoa',
        customerPhone: '0912345678',
        address: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        appointmentTime: '14:00 - ${today.day}/${today.month}/${today.year}',
        productName: 'Máy lọc nước Alkaline AquaPure',
        productSpecs: 'Model: AP-700, 9 lõi lọc, ion kiềm',
        adminNotes: '',
        codAmount: 0,
        tipAmount: 100000,
        status: JobStatus.completed,
        date: today.subtract(const Duration(days: 1)),
        images: [],
        timeline: [
          {
            'status': 'hoan_thanh',
            'time': today.subtract(const Duration(days: 1, hours: 3)),
            'title': 'Hoàn tất công việc',
            'desc': 'Đã bàn giao và xác nhận khách hàng hài lòng',
          }
        ],
        customerLatitude: 10.7745,
        customerLongitude: 106.7020,
      ),
    ];
    _notifications = [
      {
        'id': 'noti-001',
        'title': 'Đơn hàng mới',
        'body': 'Bạn có đơn hàng JOB-001 mới được phân công',
        'time': today.subtract(const Duration(hours: 2)),
        'read': false,
        'type': 'new_job',
        'jobId': 'JOB-001',
      },
    ];
  }

  void _listenToFirestoreJobs(String uid) {
    _cancelFirestoreListeners();
    _isLoading = true;
    notifyListeners();

    _jobsSub = _firestore
        .collection('donHang')
        .where('ktvId', isEqualTo: uid)
        .orderBy('ngayTao', descending: true)
        .snapshots()
        .listen(
      (snapshot) {
        if (snapshot.docs.isEmpty) {
          _isLoading = false;
          notifyListeners();
          return;
        }
        _hasFirestoreData = true;
        _jobs = snapshot.docs.map((doc) {
          return _docToJobModel(doc);
        }).toList();
        _isLoading = false;
        notifyListeners();
      },
      onError: (e) {
        debugPrint('Firestore job stream error: $e');
        _isLoading = false;
        notifyListeners();
      },
    );

    _notisSub = _firestore
        .collection('thongBao')
        .where('ktvId', isEqualTo: uid)
        .orderBy('ngayTao', descending: true)
        .limit(20)
        .snapshots()
        .listen(
      (snapshot) {
        _notifications = snapshot.docs.map((doc) {
          final data = doc.data();
          return {
            'id': doc.id,
            'title': data['tieuDe'] ?? '',
            'body': data['noiDung'] ?? '',
            'time': (data['ngayTao'] as Timestamp?)?.toDate() ?? DateTime.now(),
            'read': data['daDoc'] ?? false,
            'type': data['loai'] ?? '',
            'jobId': data['donHangId'] ?? '',
          };
        }).toList();
        notifyListeners();
      },
      onError: (e) => debugPrint('Firestore noti stream error: $e'),
    );
  }

  JobModel _docToJobModel(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    JobStatus status = JobStatus.waiting;
    final rawStatus = data['trangThai'] as String? ?? '';
    switch (rawStatus) {
      case 'da_phan_cong': status = JobStatus.waiting; break;
      case 'dang_di': status = JobStatus.onTheWay; break;
      case 'da_den_noi': status = JobStatus.arrived; break;
      case 'dang_lap': status = JobStatus.installing; break;
      case 'hoan_thanh': status = JobStatus.completed; break;
      case 'su_co': status = JobStatus.needSupport; break;
    }

    List<Map<String, dynamic>> timeline = [];
    final rawTimeline = data['lichSuTrangThai'];
    if (rawTimeline is List) {
      timeline = rawTimeline.map((e) {
        final m = e as Map<String, dynamic>;
        return {
          'status': m['trangThai'] ?? '',
          'time': (m['thoiGian'] as Timestamp?)?.toDate() ?? DateTime.now(),
          'title': m['tieuDe'] ?? '',
          'desc': m['moTa'] ?? '',
        };
      }).toList();
    }

    List<Map<String, dynamic>> vatTu = [];
    final rawVatTu = data['vatTuPhatSinh'];
    if (rawVatTu is List) {
      vatTu = rawVatTu.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }

    double? _toDouble(dynamic val) {
      if (val is num) return val.toDouble();
      if (val is String) return double.tryParse(val);
      return null;
    }

    final double? lat = _toDouble(data['diaChiViDo'] ?? data['viDo'] ?? data['latitude'] ?? data['lat']);
    final double? lng = _toDouble(data['diaChiKinhDo'] ?? data['kinhDo'] ?? data['longitude'] ?? data['lng']);

    return JobModel(
      id: doc.id,
      customerName: data['tenKhachHang'] ?? '',
      customerPhone: data['soDienThoai'] ?? '',
      address: data['diaChi'] ?? '',
      appointmentTime: data['gioHen'] ?? '',
      productName: data['tenSanPham'] ?? '',
      productSpecs: data['thongSoSanPham'] ?? '',
      adminNotes: data['ghiChuAdmin'] ?? '',
      codAmount: (data['soTienCOD'] as num?)?.toDouble() ?? 0,
      tipAmount: (data['soTienTip'] as num?)?.toDouble() ?? 0,
      status: status,
      date: (data['ngayTao'] as Timestamp?)?.toDate() ?? DateTime.now(),
      images: List<String>.from(data['anhHoanThanh'] ?? []),
      imagesBefore: List<String>.from(data['anhTruocKhiLam'] ?? []),
      imagesAfter: List<String>.from(data['anhSauKhiLam'] ?? []),
      timeline: timeline,
      vatTuPhatSinh: vatTu,
      issueReason: data['lyDoSuCo'],
      issueDesc: data['moTaSuCo'],
      customerLatitude: lat,
      customerLongitude: lng,
    );
  }

  /// Cập nhật trạng thái công việc kèm tọa độ GPS nếu cần
  Future<bool> updateJobStatus(String jobId, JobStatus newStatus, {double? ktvLatitude, double? ktvLongitude}) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];
    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);
    
    String descText = 'Trạng thái cập nhật bởi kỹ thuật viên';
    if (newStatus == JobStatus.arrived && ktvLatitude != null && ktvLongitude != null) {
      descText = 'KTV xác nhận check-in tại tọa độ ($ktvLatitude, $ktvLongitude)';
    }

    updatedTimeline.add({
      'status': newStatus.rawValue,
      'time': DateTime.now(),
      'title': newStatus.displayName,
      'desc': descText,
    });

    _jobs[idx] = job.copyWith(
      status: newStatus,
      timeline: updatedTimeline,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      final Map<String, dynamic> updateData = {
        'trangThai': newStatus.rawValue,
        'lichSuTrangThai': FieldValue.arrayUnion([
          {
            'trangThai': newStatus.rawValue,
            'thoiGian': FieldValue.serverTimestamp(),
            'tieuDe': newStatus.displayName,
            'moTa': descText,
          }
        ]),
        'ngayCapNhat': FieldValue.serverTimestamp(),
      };

      if (newStatus == JobStatus.arrived && ktvLatitude != null && ktvLongitude != null) {
        updateData['ktvViDoDenNoi'] = ktvLatitude;
        updateData['ktvKinhDoDenNoi'] = ktvLongitude;
        updateData['thoiGianCheckIn'] = FieldValue.serverTimestamp();
      }

      await _firestore.collection('donHang').doc(jobId).update(updateData);

      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'CAP_NHAT_TRANG_THAI',
          'moTa': 'Cập nhật trạng thái đơn $jobId → ${newStatus.displayName}${ktvLatitude != null ? ' (Check-in GPS)' : ''}',
          'ngayTao': FieldValue.serverTimestamp(),
        });
      }
      return true;
    } catch (e) {
      debugPrint('Firestore status sync warning: $e');
      return true;
    }
  }

  /// Báo cáo sự cố
  Future<bool> reportIssue({
    required String jobId,
    required String reason,
    required String description,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    _jobs[idx] = _jobs[idx].copyWith(
      status: JobStatus.needSupport,
      issueReason: reason,
      issueDesc: description,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': 'su_co',
        'lyDoSuCo': reason,
        'moTaSuCo': description,
        'lyDoHuy': '$reason: $description',
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'BAO_CAO_SU_CO',
          'moTa': 'Báo cáo sự cố đơn hàng $jobId: $reason',
          'ngayTao': FieldValue.serverTimestamp(),
        });
      }
      return true;
    } catch (e) {
      debugPrint('Firestore issue report sync warning: $e');
      return true;
    }
  }

  /// Xác nhận hoàn thành lắp đặt
  Future<bool> completeJob({
    required String jobId,
    required double codCollected,
    required double tipAmount,
    required List<String> photos,
    required String notes,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];
    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);
    updatedTimeline.add({
      'status': 'hoan_thanh',
      'time': DateTime.now(),
      'title': 'Hoàn tất công việc',
      'desc': 'Đã bàn giao & thu $codCollected VND. Ghi chú: $notes',
    });

    _jobs[idx] = job.copyWith(
      status: JobStatus.completed,
      codAmount: codCollected,
      tipAmount: tipAmount,
      images: photos,
      timeline: updatedTimeline,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': 'hoan_thanh',
        'soTienCOD': codCollected,
        'soTienTip': tipAmount,
        'anhHoanThanh': photos,
        'hoanThanhVao': FieldValue.serverTimestamp(),
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'HOAN_THANH',
          'moTa': 'Hoàn thành lắp đặt đơn hàng $jobId, thu COD: $codCollected, Tip: $tipAmount',
          'ngayTao': FieldValue.serverTimestamp(),
        });
      }
      return true;
    } catch (e) {
      debugPrint('Firestore complete sync warning: $e');
      return true;
    }
  }

  /// Đánh dấu đã đọc thông báo
  Future<void> markNotificationAsRead(String notiId) async {
    final idx = _notifications.indexWhere((n) => n['id'] == notiId);
    if (idx == -1) return;

    _notifications[idx]['read'] = true;
    notifyListeners();

    try {
      await _firestore.collection('thongBao').doc(notiId).update({'daDoc': true});
    } catch (e) {
      debugPrint('Firestore mark read error: $e');
    }
  }

  /// Đánh dấu tất cả thông báo là đã đọc
  Future<void> markAllNotificationsAsRead() async {
    for (final noti in _notifications) {
      noti['read'] = true;
    }
    notifyListeners();

    final batch = _firestore.batch();
    for (final noti in _notifications) {
      batch.update(_firestore.collection('thongBao').doc(noti['id']), {'daDoc': true});
    }
    try {
      await batch.commit();
    } catch (e) {
      debugPrint('Firestore batch mark read error: $e');
    }
  }

  /// Lưu ảnh trước/sau khi lắp đặt
  Future<bool> saveJobImages({
    required String jobId,
    List<String>? imagesBefore,
    List<String>? imagesAfter,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    _jobs[idx] = _jobs[idx].copyWith(
      imagesBefore: imagesBefore ?? _jobs[idx].imagesBefore,
      imagesAfter: imagesAfter ?? _jobs[idx].imagesAfter,
    );
    notifyListeners();

    try {
      final Map<String, dynamic> updateData = {
        'ngayCapNhat': FieldValue.serverTimestamp(),
      };
      if (imagesBefore != null) updateData['anhTruocKhiLam'] = imagesBefore;
      if (imagesAfter != null) updateData['anhSauKhiLam'] = imagesAfter;
      await _firestore.collection('donHang').doc(jobId).update(updateData);
      return true;
    } catch (e) {
      debugPrint('Firestore save images error: $e');
      return true;
    }
  }

  /// Thêm vật tư phát sinh
  Future<bool> addVatTuPhatSinh({
    required String jobId,
    required String tenVatTu,
    required int soLuong,
    double donGia = 0,
    String ghiChu = '',
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final newItem = {
      'tenVatTu': tenVatTu,
      'soLuong': soLuong,
      'donGia': donGia,
      'thanhTien': soLuong * donGia,
      'ghiChu': ghiChu,
      'thoiGian': DateTime.now().toIso8601String(),
    };

    final updated = List<Map<String, dynamic>>.from(_jobs[idx].vatTuPhatSinh)
      ..add(newItem);
    _jobs[idx] = _jobs[idx].copyWith(vatTuPhatSinh: updated);
    notifyListeners();

    try {
      await _firestore.collection('donHang').doc(jobId).update({
        'vatTuPhatSinh': updated,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      debugPrint('Firestore vatTu error: $e');
      return true;
    }
  }

  /// Xóa vật tư phát sinh
  Future<bool> deleteVatTuPhatSinh({
    required String jobId,
    required int index,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final updated = List<Map<String, dynamic>>.from(_jobs[idx].vatTuPhatSinh);
    if (index < 0 || index >= updated.length) return false;
    updated.removeAt(index);

    _jobs[idx] = _jobs[idx].copyWith(vatTuPhatSinh: updated);
    notifyListeners();

    try {
      await _firestore.collection('donHang').doc(jobId).update({
        'vatTuPhatSinh': updated,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      debugPrint('Firestore delete vatTu error: $e');
      return true;
    }
  }

  /// Cập nhật vật tư phát sinh
  Future<bool> updateVatTuPhatSinh({
    required String jobId,
    required int index,
    required String tenVatTu,
    required int soLuong,
    double donGia = 0,
    String ghiChu = '',
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final updated = List<Map<String, dynamic>>.from(_jobs[idx].vatTuPhatSinh);
    if (index < 0 || index >= updated.length) return false;

    final existing = updated[index];
    updated[index] = {
      ...existing,
      'tenVatTu': tenVatTu,
      'soLuong': soLuong,
      'donGia': donGia,
      'thanhTien': soLuong * donGia,
      'ghiChu': ghiChu,
    };

    _jobs[idx] = _jobs[idx].copyWith(vatTuPhatSinh: updated);
    notifyListeners();

    try {
      await _firestore.collection('donHang').doc(jobId).update({
        'vatTuPhatSinh': updated,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      debugPrint('Firestore update vatTu error: $e');
      return true;
    }
  }

  /// Xác nhận đã đến nơi
  Future<bool> confirmArrival(String jobId) async {
    return updateJobStatus(jobId, JobStatus.arrived);
  }

  /// Xác nhận bắt đầu lắp đặt
  Future<bool> confirmStartInstalling(String jobId) async {
    return updateJobStatus(jobId, JobStatus.installing);
  }
}
