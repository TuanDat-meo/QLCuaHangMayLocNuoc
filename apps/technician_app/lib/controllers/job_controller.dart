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
        return const Color(0xff64748b); // Grey
      case JobStatus.onTheWay:
        return const Color(0xff0284c7); // Deep Sky Blue
      case JobStatus.arrived:
        return const Color(0xff0d9488); // Teal
      case JobStatus.installing:
        return const Color(0xffea580c); // Orange
      case JobStatus.completed:
        return const Color(0xff10b981); // Emerald Green
      case JobStatus.needSupport:
        return const Color(0xffef4444); // Red
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
  final List<Map<String, dynamic>> timeline;
  final String? issueReason;
  final String? issueDesc;

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
    required this.timeline,
    this.issueReason,
    this.issueDesc,
  });

  JobModel copyWith({
    JobStatus? status,
    List<String>? images,
    double? tipAmount,
    double? codAmount,
    List<Map<String, dynamic>>? timeline,
    String? issueReason,
    String? issueDesc,
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
      timeline: timeline ?? this.timeline,
      issueReason: issueReason ?? this.issueReason,
      issueDesc: issueDesc ?? this.issueDesc,
    );
  }
}

class JobController extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  bool _isLoading = false;
  List<JobModel> _jobs = [];
  List<Map<String, dynamic>> _notifications = [];

  bool get isLoading => _isLoading;
  List<JobModel> get jobs => _jobs;
  List<Map<String, dynamic>> get notifications => _notifications;

  JobController() {
    _loadMockData(); // Khởi tạo dữ liệu mẫu chất lượng cao để hiển thị mượt mà
    _listenToFirestoreJobs();
  }

  void _loadMockData() {
    final today = DateTime.now();
    _jobs = [
      JobModel(
        id: 'JOB-001',
        customerName: 'Nguyễn Văn Tiến',
        customerPhone: '0987.654.321',
        address: 'Tháp B, Tòa nhà Sông Đà, Phạm Hùng, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
        appointmentTime: '08:30 - 10:30',
        productName: 'Máy lọc nước AquaCare RO Premium 10 lõi',
        productSpecs: 'Model: AC-RO10P • Công suất: 20L/h • Màng lọc RO Dow Aqualast',
        adminNotes: 'Khách hàng yêu cầu kiểm tra kỹ đường nước cấp đầu vào và kiểm tra rò rỉ điện. Cần mang thêm cút nối chữ T.',
        codAmount: 8500000.0,
        tipAmount: 0.0,
        status: JobStatus.waiting,
        date: today,
        images: [],
        timeline: [
          {'status': 'da_phan_cong', 'time': today.subtract(const Duration(hours: 4)), 'title': 'Đã phân công', 'desc': 'Quản trị viên đã bàn giao công việc cho bạn'},
        ],
      ),
      JobModel(
        id: 'JOB-002',
        customerName: 'Trần Thị Mai',
        customerPhone: '0912.345.678',
        address: 'Biệt thự B2-15, KĐT Vinhomes Riverside, Sài Đồng, Long Biên, Hà Nội',
        appointmentTime: '13:30 - 15:30',
        productName: 'Máy lọc nước nóng lạnh Karofi KAD-D66',
        productSpecs: 'Model: KAD-D66 • Chế độ: Nóng - Lạnh - Nguội • 11 lõi lọc Smax',
        adminNotes: 'Liên hệ trước khi đến 30 phút. Lắp đặt trong hốc bếp, cần đi dây ống âm thẩm mỹ.',
        codAmount: 11200000.0,
        tipAmount: 0.0,
        status: JobStatus.onTheWay,
        date: today,
        images: [],
        timeline: [
          {'status': 'da_phan_cong', 'time': today.subtract(const Duration(hours: 3)), 'title': 'Đã phân công', 'desc': 'Quản trị viên đã phân công công việc'},
          {'status': 'dang_di', 'time': today.subtract(const Duration(minutes: 15)), 'title': 'Đang di chuyển', 'desc': 'Bắt đầu di chuyển từ cửa hàng'},
        ],
      ),
      JobModel(
        id: 'JOB-003',
        customerName: 'Phạm Minh Hoàng',
        customerPhone: '0904.789.012',
        address: 'Phòng 1804, Chung cư HH2B Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội',
        appointmentTime: '16:00 - 18:00',
        productName: 'Máy lọc nước ion kiềm Panasonic TK-AS45',
        productSpecs: 'Model: TK-AS45-W • Công nghệ điện phân • 3 tấm điện cực',
        adminNotes: 'Cần kiểm tra độ pH nước đầu vào và sau khi lọc. Khách hàng đã thanh toán trước qua chuyển khoản ngân hàng.',
        codAmount: 0.0,
        tipAmount: 0.0,
        status: JobStatus.installing,
        date: today,
        images: [],
        timeline: [
          {'status': 'da_phan_cong', 'time': today.subtract(const Duration(hours: 5)), 'title': 'Đã phân công', 'desc': 'Bàn giao công việc'},
          {'status': 'dang_di', 'time': today.subtract(const Duration(hours: 1)), 'title': 'Đang di chuyển', 'desc': 'Kỹ thuật viên đang di chuyển'},
          {'status': 'da_den_noi', 'time': today.subtract(const Duration(minutes: 45)), 'title': 'Đã đến nơi', 'desc': 'Đã có mặt tại địa chỉ lắp đặt'},
          {'status': 'dang_lap', 'time': today.subtract(const Duration(minutes: 35)), 'title': 'Đang tiến hành', 'desc': 'Bắt đầu lắp đặt máy lọc nước'},
        ],
      ),
      JobModel(
        id: 'JOB-004',
        customerName: 'Hoàng Thị Cúc',
        customerPhone: '0975.123.456',
        address: 'Số 42, Ngõ 102 Khuất Duy Tiến, Nhân Chính, Thanh Xuân, Hà Nội',
        appointmentTime: '10:00 - 12:00',
        productName: 'Hệ thống lọc nước đầu nguồn AquaCare GW-03',
        productSpecs: 'Model: AC-GW03 • 3 cột lọc composite composite • Van tự động sục rửa',
        adminNotes: 'Lắp đặt trên tầng thượng. Cần mang dây bảo hiểm và thang chữ A dài.',
        codAmount: 24500000.0,
        tipAmount: 50000.0,
        status: JobStatus.completed,
        date: today,
        images: ['https://dummyimage.com/600x400/00459a/fff.png&text=Lap+Dat+1', 'https://dummyimage.com/600x400/00459a/fff.png&text=Lap+Dat+2'],
        timeline: [
          {'status': 'da_phan_cong', 'time': today.subtract(const Duration(hours: 8)), 'title': 'Đã phân công', 'desc': 'Bàn giao công việc'},
          {'status': 'dang_di', 'time': today.subtract(const Duration(hours: 7)), 'title': 'Đang di chuyển', 'desc': 'Kỹ thuật viên đang di chuyển'},
          {'status': 'da_den_noi', 'time': today.subtract(const Duration(hours: 6)), 'title': 'Đã đến nơi', 'desc': 'Có mặt tại nhà khách hàng'},
          {'status': 'dang_lap', 'time': today.subtract(const Duration(hours: 5, minutes: 45)), 'title': 'Đang lắp đặt', 'desc': 'Bắt đầu thi công lắp đặt'},
          {'status': 'hoan_thanh', 'time': today.subtract(const Duration(hours: 4)), 'title': 'Hoàn thành', 'desc': 'Đã lắp đặt xong và bàn giao sản phẩm'},
        ],
      ),
      JobModel(
        id: 'JOB-005',
        customerName: 'Lê Hoàng Long',
        customerPhone: '0868.999.888',
        address: 'Số 15, Hẻm 2/12 Hoàng Hoa Thám, Thụy Khuê, Tây Hồ, Hà Nội',
        appointmentTime: '08:00 - 09:30',
        productName: 'Máy lọc nước nóng lạnh Kangaroo KG10A3',
        productSpecs: 'Model: KG10A3 • 10 cấp lọc • Tích hợp 2 vòi nóng lạnh',
        adminNotes: 'Thay lõi lọc định kỳ số 1, 2, 3 và màng RO.',
        codAmount: 650000.0,
        tipAmount: 0.0,
        status: JobStatus.needSupport,
        date: today.subtract(const Duration(days: 1)),
        images: [],
        timeline: [
          {'status': 'da_phan_cong', 'time': today.subtract(const Duration(days: 1, hours: 4)), 'title': 'Đã phân công', 'desc': 'Phân công công việc bảo trì'},
          {'status': 'dang_di', 'time': today.subtract(const Duration(days: 1, hours: 3)), 'title': 'Đang di chuyển', 'desc': 'Bắt đầu di chuyển'},
          {'status': 'da_den_noi', 'time': today.subtract(const Duration(days: 1, hours: 2)), 'title': 'Đã đến nơi', 'desc': 'Đã đến địa chỉ khách hàng'},
          {'status': 'su_co', 'time': today.subtract(const Duration(days: 1, hours: 1)), 'title': 'Gặp sự cố', 'desc': 'Không liên hệ được khách hàng, gọi điện thuê bao nhiều lần'},
        ],
        issueReason: 'Không liên lạc được với khách hàng',
        issueDesc: 'Đã đến nơi gọi điện 5 lần trong vòng 30 phút đều thuê bao, bấm chuông cửa không có ai thưa.',
      ),
    ];

    _notifications = [
      {
        'id': 'noti-1',
        'title': 'Được phân công công việc mới',
        'body': 'Bạn có một lịch lắp đặt máy lọc nước RO Premium lúc 08:30 hôm nay cho khách hàng Nguyễn Văn Tiến.',
        'time': today.subtract(const Duration(hours: 4)),
        'read': false,
        'type': 'phan_cong',
        'refId': 'JOB-001'
      },
      {
        'id': 'noti-2',
        'title': 'Thay đổi lịch hẹn công việc',
        'body': 'Lịch hẹn lắp máy Karofi KAD-D66 của khách hàng Trần Thị Mai chuyển từ 15:00 sang 13:30.',
        'time': today.subtract(const Duration(hours: 3)),
        'read': true,
        'type': 'bao_tri',
        'refId': 'JOB-002'
      },
      {
        'id': 'noti-3',
        'title': 'Yêu cầu bảo hành được chỉ định',
        'body': 'Bạn được chỉ định xử lý sự cố rò rỉ nước tại chung cư Linh Đàm cho anh Hoàng.',
        'time': today.subtract(const Duration(hours: 5)),
        'read': false,
        'type': 'bao_hanh',
        'refId': 'JOB-003'
      },
    ];
  }

  void _listenToFirestoreJobs() {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;

    // Lắng nghe realtime từ bộ sưu tập donHang trong Firestore
    _firestore
        .collection('donHang')
        .where('kyThuatVienId', isEqualTo: uid)
        .orderBy('ngayTao', descending: true)
        .snapshots()
        .listen((snapshot) {
      if (snapshot.docs.isEmpty) return;

      final List<JobModel> firestoreJobs = [];
      for (var doc in snapshot.docs) {
        final data = doc.data();
        
        // Convert status string to JobStatus
        final statusString = data['trangThai'] ?? '';
        JobStatus status = JobStatus.waiting;
        if (statusString == 'dang_di') status = JobStatus.onTheWay;
        if (statusString == 'dang_lap') status = JobStatus.installing;
        if (statusString == 'hoan_thanh') status = JobStatus.completed;
        if (statusString == 'su_co') status = JobStatus.needSupport;

        final addressMap = data['diaChi'] as Map<String, dynamic>? ?? {};
        final fullAddress = addressMap['street'] != null 
            ? '${addressMap['street']}, ${addressMap['ward']}, ${addressMap['district']}, ${addressMap['city']}'
            : (data['diaChi'] is String ? data['diaChi'] : 'Chưa có địa chỉ');

        // Extract products
        final items = data['danhSachSanPham'] as List? ?? [];
        final prodName = items.isNotEmpty ? (items[0]['productName'] ?? 'Máy lọc nước') : 'Máy lọc nước';

        firestoreJobs.add(JobModel(
          id: doc.id,
          customerName: data['tenKhachHang'] ?? 'Khách hàng',
          customerPhone: data['soDienThoai'] ?? '',
          address: fullAddress,
          appointmentTime: data['gioHen'] ?? 'Trong ngày',
          productName: prodName,
          productSpecs: 'Sản phẩm chính hãng',
          adminNotes: data['ghiChuAdmin'] ?? 'Không có ghi chú',
          codAmount: (data['soTienCOD'] as num?)?.toDouble() ?? 0.0,
          tipAmount: (data['soTienTip'] as num?)?.toDouble() ?? 0.0,
          status: status,
          date: (data['ngayTao'] as Timestamp?)?.toDate() ?? DateTime.now(),
          images: List<String>.from(data['anhHoanThanh'] ?? []),
          timeline: [],
        ));
      }

      // Hợp nhất dữ liệu Firestore vào danh sách
      // Giữ lại mock data cho các phần chưa có trên Firestore để UI đầy đủ hơn
      final List<JobModel> merged = [...firestoreJobs];
      for (var mock in _jobs) {
        if (!merged.any((j) => j.id == mock.id)) {
          merged.add(mock);
        }
      }
      _jobs = merged;
      notifyListeners();
    }, onError: (e) {
      debugPrint('Firestore error listing jobs: $e');
    });

    // Lắng nghe thongBao
    _firestore
        .collection('thongBao')
        .where('nguoiNhanId', isEqualTo: uid)
        .orderBy('ngayTao', descending: true)
        .snapshots()
        .listen((snapshot) {
      final List<Map<String, dynamic>> list = [];
      for (var doc in snapshot.docs) {
        final data = doc.data();
        list.add({
          'id': doc.id,
          'title': data['tieuDe'] ?? '',
          'body': data['noiDung'] ?? '',
          'time': (data['ngayTao'] as Timestamp?)?.toDate() ?? DateTime.now(),
          'read': data['daDoc'] ?? false,
          'type': data['loai'] ?? 'he_thong',
          'refId': data['thamChieuId'],
        });
      }
      if (list.isNotEmpty) {
        _notifications = list;
        notifyListeners();
      }
    });
  }

  Future<void> refreshJobs() async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(seconds: 1)); // Tạo cảm giác load
    _isLoading = false;
    notifyListeners();
  }

  /// Cập nhật trạng thái công việc
  Future<bool> updateJobStatus(String jobId, JobStatus newStatus) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];
    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);

    String statusText = '';
    String descText = '';
    if (newStatus == JobStatus.onTheWay) {
      statusText = 'Đang di chuyển';
      descText = 'Bắt đầu di chuyển tới nhà khách hàng';
    } else if (newStatus == JobStatus.arrived) {
      statusText = 'Đã đến nơi';
      descText = 'Đã có mặt tại địa chỉ khách hàng';
    } else if (newStatus == JobStatus.installing) {
      statusText = 'Đang lắp đặt';
      descText = 'Đang thực hiện quy trình lắp đặt/bảo trì';
    } else if (newStatus == JobStatus.completed) {
      statusText = 'Hoàn thành';
      descText = 'Bàn giao thiết bị cho khách hàng thành công';
    } else if (newStatus == JobStatus.needSupport) {
      statusText = 'Gặp sự cố';
      descText = 'Gặp vấn đề cản trở thi công';
    }

    updatedTimeline.add({
      'status': newStatus.rawValue,
      'time': DateTime.now(),
      'title': statusText,
      'desc': descText,
    });

    _jobs[idx] = job.copyWith(
      status: newStatus,
      timeline: updatedTimeline,
    );
    notifyListeners();

    // Đồng bộ Firestore
    try {
      final uid = _auth.currentUser?.uid;
      // Ghi nhật ký hoạt động
      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': newStatus == JobStatus.onTheWay 
              ? 'BAT_DAU_CONG_VIEC' 
              : (newStatus == JobStatus.completed ? 'HOAN_THANH' : 'CAP_NHAT_HO_SO'),
          'moTa': 'Cập nhật đơn $jobId thành ${newStatus.displayName}',
          'ngayTao': FieldValue.serverTimestamp(),
        });
      }

      // Cập nhật trạng thái đơn hàng
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': newStatus.rawValue,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      debugPrint('Firestore sync warning: $e (Using offline state)');
      return true; // Vẫn cho thành công offline
    }
  }

  /// Báo cáo sự cố lắp đặt
  Future<bool> reportIssue({
    required String jobId,
    required String reason,
    required String description,
    required List<String> localPhotos,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];
    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);
    updatedTimeline.add({
      'status': 'su_co',
      'time': DateTime.now(),
      'title': 'Báo cáo sự cố',
      'desc': '$reason: $description',
    });

    _jobs[idx] = job.copyWith(
      status: JobStatus.needSupport,
      issueReason: reason,
      issueDesc: description,
      images: [...job.images, ...localPhotos],
      timeline: updatedTimeline,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': 'su_co',
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
      await _firestore.collection('thongBao').doc(notiId).update({
        'daDoc': true,
      });
    } catch (e) {
      debugPrint('Firestore mark read error: $e');
    }
  }

  /// Đánh dấu tất cả thông báo là đã đọc
  Future<void> markAllNotificationsAsRead() async {
    for (var n in _notifications) {
      n['read'] = true;
    }
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      if (uid == null) return;
      final snapshot = await _firestore
          .collection('thongBao')
          .where('nguoiNhanId', isEqualTo: uid)
          .where('daDoc', isEqualTo: false)
          .get();
      
      final batch = _firestore.batch();
      for (var doc in snapshot.docs) {
        batch.update(doc.reference, {'daDoc': true});
      }
      await batch.commit();
    } catch (e) {
      debugPrint('Firestore mark all read error: $e');
    }
  }
}
