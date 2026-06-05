import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import '../services/notification_service.dart';

enum JobStatus {
  waiting, // Đã phân công / Chờ
  onTheWay, // Đang di chuyển
  arrived, // Đã đến nơi
  installing, // Đang lắp đặt
  completed, // Hoàn thành
  needSupport, // Cần hỗ trợ / Gặp sự cố
}

extension JobStatusExtension on JobStatus {
  String get rawValue {
    switch (this) {
      case JobStatus.waiting:
        return 'assigned';
      case JobStatus.onTheWay:
        return 'processing'; // Bắt đầu xử lý
      case JobStatus.arrived:
        return 'arrived';
      case JobStatus.installing:
        return 'installing';
      case JobStatus.completed:
        return 'completed';
      case JobStatus.needSupport:
        return 'incident';
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

  String get englishRawValue {
    switch (this) {
      case JobStatus.waiting:
        return 'processing';
      case JobStatus.onTheWay:
        return 'shipping';
      case JobStatus.arrived:
        return 'arrived';
      case JobStatus.installing:
        return 'installing';
      case JobStatus.completed:
        return 'completed';
      case JobStatus.needSupport:
        return 'failed';
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
  final DateTime? scheduledDate;
  final List<String> images;
  final List<String> imagesBefore;
  final List<String> imagesAfter;
  final List<Map<String, dynamic>> timeline;
  final List<Map<String, dynamic>> vatTuPhatSinh;
  final String? issueReason;
  final String? issueDesc;
  final double? customerLatitude;
  final double? customerLongitude;
  final String? customerSignature;

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
    this.scheduledDate,
    required this.images,
    this.imagesBefore = const [],
    this.imagesAfter = const [],
    required this.timeline,
    this.vatTuPhatSinh = const [],
    this.issueReason,
    this.issueDesc,
    this.customerLatitude,
    this.customerLongitude,
    this.customerSignature,
  });

  bool get isLocked {
    if (scheduledDate == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final schedDay = DateTime(
      scheduledDate!.year,
      scheduledDate!.month,
      scheduledDate!.day,
    );
    return today.isBefore(schedDay);
  }

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
    String? customerSignature,
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
      scheduledDate: scheduledDate,
      images: images ?? this.images,
      imagesBefore: imagesBefore ?? this.imagesBefore,
      imagesAfter: imagesAfter ?? this.imagesAfter,
      timeline: timeline ?? this.timeline,
      vatTuPhatSinh: vatTuPhatSinh ?? this.vatTuPhatSinh,
      issueReason: issueReason ?? this.issueReason,
      issueDesc: issueDesc ?? this.issueDesc,
      customerLatitude: customerLatitude ?? this.customerLatitude,
      customerLongitude: customerLongitude ?? this.customerLongitude,
      customerSignature: customerSignature ?? this.customerSignature,
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
  String? _lastError;
  String? get lastError => _lastError;

  StreamSubscription? _jobsSub1;
  StreamSubscription? _jobsSub2;
  StreamSubscription? _jobsSub3;
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
    _jobsSub1?.cancel();
    _jobsSub2?.cancel();
    _jobsSub3?.cancel();
    _notisSub?.cancel();
    _jobsSub1 = null;
    _jobsSub2 = null;
    _jobsSub3 = null;
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
        adminNotes:
            'Khách hàng yêu cầu lắp đặt tại tầng 3, không có thang máy. Cần mang thêm ống nối dài.',
        codAmount: 650000,
        tipAmount: 0,
        status: JobStatus.waiting,
        date: today,
        scheduledDate: today,
        images: [],
        timeline: [
          {
            'status': 'da_phan_cong',
            'time': today.subtract(const Duration(hours: 2)),
            'title': 'Đơn hàng được phân công',
            'desc': 'Hệ thống tự động phân công cho bạn',
          },
        ],
        customerLatitude: 10.7769,
        customerLongitude: 106.7009,
      ),
      JobModel(
        id: 'JOB-002',
        customerName: 'Trần Thị Mai',
        customerPhone: '0912.345.678',
        address:
            'Biệt thự B2-15, KĐT Vinhomes Riverside, Sài Đồng, Long Biên, Hà Nội',
        appointmentTime: '13:30 - 15:30',
        productName: 'Máy lọc nước nóng lạnh Karofi KAD-D66',
        productSpecs:
            'Model: KAD-D66 • Chế độ: Nóng - Lạnh - Nguội • 11 lõi lọc Smax',
        adminNotes:
            'Liên hệ trước khi đến 30 phút. Lắp đặt trong hốc bếp, cần đi dây ống âm thẩm mỹ.',
        codAmount: 11200000.0,
        tipAmount: 0.0,
        status: JobStatus.onTheWay,
        date: today,
        scheduledDate: today,
        images: [],
        timeline: [
          {
            'status': 'da_phan_cong',
            'time': today.subtract(const Duration(hours: 3)),
            'title': 'Đã phân công',
            'desc': 'Quản trị viên đã phân công công việc',
          },
          {
            'status': 'dang_di',
            'time': today.subtract(const Duration(minutes: 15)),
            'title': 'Đang di chuyển',
            'desc': 'Bắt đầu di chuyển từ cửa hàng',
          },
        ],
        customerLatitude: 21.0374,
        customerLongitude: 105.9142,
      ),
      JobModel(
        id: 'JOB-003',
        customerName: 'Phạm Minh Hoàng',
        customerPhone: '0904.789.012',
        address:
            'Phòng 1804, Chung cư HH2B Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội',
        appointmentTime: '16:00 - 18:00',
        productName: 'Máy lọc nước ion kiềm Panasonic TK-AS45',
        productSpecs: 'Model: TK-AS45-W • Công nghệ điện phân • 3 tấm điện cực',
        adminNotes:
            'Cần kiểm tra độ pH nước đầu vào và sau khi lọc. Khách hàng đã thanh toán trước qua chuyển khoản ngân hàng.',
        codAmount: 0.0,
        tipAmount: 0.0,
        status: JobStatus.installing,
        date: today,
        scheduledDate: today,
        images: [],
        timeline: [
          {
            'status': 'da_phan_cong',
            'time': today.subtract(const Duration(hours: 5)),
            'title': 'Đã phân công',
            'desc': 'Bàn giao công việc',
          },
          {
            'status': 'dang_di',
            'time': today.subtract(const Duration(hours: 1)),
            'title': 'Đang di chuyển',
            'desc': 'Kỹ thuật viên đang di chuyển',
          },
          {
            'status': 'da_den_noi',
            'time': today.subtract(const Duration(minutes: 45)),
            'title': 'Đã đến nơi',
            'desc': 'Đã có mặt tại địa chỉ lắp đặt',
          },
          {
            'status': 'dang_lap',
            'time': today.subtract(const Duration(minutes: 35)),
            'title': 'Đang tiến hành',
            'desc': 'Bắt đầu lắp đặt máy lọc nước',
          },
        ],
        customerLatitude: 20.9625,
        customerLongitude: 105.8252,
      ),
      JobModel(
        id: 'JOB-004',
        customerName: 'Hoàng Thị Cúc',
        customerPhone: '0975.123.456',
        address:
            'Số 42, Ngõ 102 Khuất Duy Tiến, Nhân Chính, Thanh Xuân, Hà Nội',
        appointmentTime: '10:00 - 12:00',
        productName: 'Hệ thống lọc nước đầu nguồn AquaCare GW-03',
        productSpecs:
            'Model: AC-GW03 • 3 cột lọc composite composite • Van tự động sục rửa',
        adminNotes:
            'Lắp đặt trên tầng thượng. Cần mang dây bảo hiểm và thang chữ A dài.',
        codAmount: 24500000.0,
        tipAmount: 50000.0,
        status: JobStatus.completed,
        date: today,
        scheduledDate: today,
        images: [
          'https://dummyimage.com/600x400/00459a/fff.png&text=Lap+Dat+1',
          'https://dummyimage.com/600x400/00459a/fff.png&text=Lap+Dat+2',
        ],
        timeline: [
          {
            'status': 'da_phan_cong',
            'time': today.subtract(const Duration(hours: 8)),
            'title': 'Đã phân công',
            'desc': 'Bàn giao công việc',
          },
          {
            'status': 'dang_di',
            'time': today.subtract(const Duration(hours: 7)),
            'title': 'Đang di chuyển',
            'desc': 'Kỹ thuật viên đang di chuyển',
          },
          {
            'status': 'da_den_noi',
            'time': today.subtract(const Duration(hours: 6)),
            'title': 'Đã đến nơi',
            'desc': 'Có mặt tại nhà khách hàng',
          },
          {
            'status': 'dang_lap',
            'time': today.subtract(const Duration(hours: 5, minutes: 45)),
            'title': 'Đang lắp đặt',
            'desc': 'Bắt đầu thi công lắp đặt',
          },
          {
            'status': 'hoan_thanh',
            'time': today.subtract(const Duration(hours: 4)),
            'title': 'Hoàn thành',
            'desc': 'Đã lắp đặt xong và bàn giao sản phẩm',
          },
        ],
        customerLatitude: 20.9984,
        customerLongitude: 105.7984,
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
        scheduledDate: today.subtract(const Duration(days: 1)),
        images: [],
        timeline: [
          {
            'status': 'su_co',
            'time': today.subtract(const Duration(days: 1, hours: 3)),
            'title': 'Gặp sự cố',
            'desc': 'Không liên lạc được với khách hàng',
          },
        ],
        issueReason: 'Không liên lạc được với khách hàng',
        issueDesc:
            'Đã đến nơi gọi điện 5 lần trong vòng 30 phút đều thuê bao, bấm chuông cửa không có ai thưa.',
        customerLatitude: 21.0427,
        customerLongitude: 105.8166,
      ),
    ];
    _notifications = [
      {
        'id': 'noti-1',
        'title': 'Được phân công công việc mới',
        'body':
            'Bạn có một lịch lắp đặt máy lọc nước RO Premium lúc 08:30 hôm nay cho khách hàng Nguyễn Văn Tiến.',
        'time': today.subtract(const Duration(hours: 4)),
        'read': false,
        'type': 'phan_cong',
        'refId': 'JOB-001',
      },
      {
        'id': 'noti-2',
        'title': 'Thay đổi lịch hẹn công việc',
        'body':
            'Lịch hẹn lắp máy Karofi KAD-D66 của khách hàng Trần Thị Mai chuyển từ 15:00 sang 13:30.',
        'time': today.subtract(const Duration(hours: 3)),
        'read': true,
        'type': 'bao_tri',
        'refId': 'JOB-002',
      },
      {
        'id': 'noti-3',
        'title': 'Yêu cầu bảo hành được chỉ định',
        'body':
            'Bạn được chỉ định xử lý sự cố rò rỉ nước tại chung cư Linh Đàm cho anh Hoàng.',
        'time': today.subtract(const Duration(hours: 5)),
        'read': false,
        'type': 'bao_hanh',
        'refId': 'JOB-003',
      },
    ];
  }

  void _listenToFirestoreJobs(String uid) {
    _cancelFirestoreListeners();
    _isLoading = true;
    _jobs = []; // Xóa dữ liệu mock ngay khi bắt đầu đồng bộ Firestore
    notifyListeners();

    final Map<String, JobModel> jobsMap = {};
    bool isFirstSnapshot = true;

    void handleSnapshot(QuerySnapshot snapshot) {
      _hasFirestoreData = true;
      final List<JobModel> newlyAddedJobs = [];
      final List<JobModel> modifiedJobs = [];

      for (final doc in snapshot.docs) {
        final data = doc.data() as Map<String, dynamic>;
        bool isMyJob = false;

        if (data['ktvId'] == uid) {
          isMyJob = true;
        } else if (data['technicianId'] == uid) {
          isMyJob = true;
        } else {
          final techs = data['technicians'];
          if (techs is List) {
            for (final t in techs) {
              if (t is Map && t['id'] == uid) {
                isMyJob = true;
                break;
              }
            }
          }
        }

        if (isMyJob) {
          final jobModel = _docToJobModel(doc);
          if (!jobsMap.containsKey(doc.id)) {
            if (!isFirstSnapshot) {
              newlyAddedJobs.add(jobModel);
            }
          } else {
            final oldJob = jobsMap[doc.id]!;
            if (oldJob.status != jobModel.status ||
                oldJob.scheduledDate != jobModel.scheduledDate ||
                oldJob.appointmentTime != jobModel.appointmentTime) {
              modifiedJobs.add(jobModel);
            }
          }
          jobsMap[doc.id] = jobModel;
        } else {
          if (jobsMap.containsKey(doc.id)) {
            final oldJob = jobsMap[doc.id]!;
            NotificationService.instance.cancelNotification(oldJob.id.hashCode);
            NotificationService.instance.cancelNotification(oldJob.id.hashCode + 100000);
          }
          jobsMap.remove(doc.id);
        }
      }

      for (final change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.removed) {
          final docId = change.doc.id;
          NotificationService.instance.cancelNotification(docId.hashCode);
          NotificationService.instance.cancelNotification(docId.hashCode + 100000);
          jobsMap.remove(docId);
        }
      }

      final sortedJobs = jobsMap.values.toList()
        ..sort((a, b) => b.date.compareTo(a.date));
      _jobs = sortedJobs;
      _isLoading = false;
      notifyListeners();

      // Xử lý các job mới được thêm
      if (newlyAddedJobs.isNotEmpty) {
        for (final job in newlyAddedJobs) {
          NotificationService.instance.showLocalNotificationDirect(
            id: job.id.hashCode,
            title: '🔧 Bạn có công việc mới được phân công!',
            body: 'Đơn hàng #${job.id}\nKH: ${job.customerName} - ${job.address}',
            payloadData: {'jobId': job.id, 'type': 'new_job'},
          );

          final schedDate = job.scheduledDate;
          if (schedDate != null &&
              job.status != JobStatus.completed &&
              job.status != JobStatus.needSupport &&
              job.status != JobStatus.arrived) {
            final reminderTime = schedDate.subtract(const Duration(hours: 1));
            if (reminderTime.isAfter(DateTime.now())) {
              NotificationService.instance.scheduleNotification(
                id: job.id.hashCode + 100000,
                title: '⏰ Nhắc nhở: Sắp đến giờ hẹn lịch làm việc!',
                body: 'Đơn hàng #${job.id} của KH ${job.customerName} sẽ bắt đầu lúc ${job.appointmentTime}.',
                scheduledDateTime: reminderTime,
              );
            }
          }
        }
      }

      // Xử lý các job bị sửa đổi
      if (modifiedJobs.isNotEmpty) {
        for (final job in modifiedJobs) {
          if (job.status == JobStatus.completed ||
              job.status == JobStatus.needSupport ||
              job.status == JobStatus.arrived) {
            NotificationService.instance.cancelNotification(job.id.hashCode);
            NotificationService.instance.cancelNotification(job.id.hashCode + 100000);
          } else {
            NotificationService.instance.cancelNotification(job.id.hashCode + 100000);
            final schedDate = job.scheduledDate;
            if (schedDate != null) {
              final reminderTime = schedDate.subtract(const Duration(hours: 1));
              if (reminderTime.isAfter(DateTime.now())) {
                NotificationService.instance.scheduleNotification(
                  id: job.id.hashCode + 100000,
                  title: '⏰ Nhắc nhở: Sắp đến giờ hẹn lịch làm việc!',
                  body: 'Đơn hàng #${job.id} của KH ${job.customerName} sẽ bắt đầu lúc ${job.appointmentTime}.',
                  scheduledDateTime: reminderTime,
                );
              }
            }
          }
        }
      }

      // Lên lịch nhắc nhở lần đầu cho toàn bộ job hiện có
      if (isFirstSnapshot) {
        for (final job in jobsMap.values) {
          final schedDate = job.scheduledDate;
          if (schedDate != null &&
              job.status != JobStatus.completed &&
              job.status != JobStatus.needSupport &&
              job.status != JobStatus.arrived) {
            final reminderTime = schedDate.subtract(const Duration(hours: 1));
            if (reminderTime.isAfter(DateTime.now())) {
              NotificationService.instance.scheduleNotification(
                id: job.id.hashCode + 100000,
                title: '⏰ Nhắc nhở: Sắp đến giờ hẹn lịch làm việc!',
                body: 'Đơn hàng #${job.id} của KH ${job.customerName} sẽ bắt đầu lúc ${job.appointmentTime}.',
                scheduledDateTime: reminderTime,
              );
            }
          }
        }
      }

      isFirstSnapshot = false;
    }

    _jobsSub1 = _firestore
        .collection('donHang')
        .snapshots()
        .listen(
          handleSnapshot,
          onError: (e) => debugPrint('Firestore job stream error: $e'),
        );

    bool isFirstNoti = true;
    _notisSub = _firestore.collection('thongBao').snapshots().listen((
      snapshot,
    ) {
      final myNotis = snapshot.docs.where((doc) {
        final data = doc.data() as Map<String, dynamic>;
        return data['ktvId'] == uid ||
            data['nguoiNhanId'] == uid ||
            data['nguoiDungId'] == uid ||
            data['userId'] == uid ||
            data['nguoiNhan'] == uid;
      });

      if (!isFirstNoti) {
        for (final change in snapshot.docChanges) {
          if (change.type == DocumentChangeType.added) {
            final doc = change.doc;
            final data = doc.data() as Map<String, dynamic>;
            final isForMe = data['ktvId'] == uid ||
                data['nguoiNhanId'] == uid ||
                data['nguoiDungId'] == uid ||
                data['userId'] == uid ||
                data['nguoiNhan'] == uid;
            if (isForMe) {
              final title = data['tieuDe'] ?? 'Thông báo từ Admin';
              final body = data['noiDung'] ?? '';
              final jobId = data['donHangId'] ?? '';
              NotificationService.instance.showLocalNotificationDirect(
                id: doc.id.hashCode,
                title: '🔔 $title',
                body: body,
                payloadData: {'jobId': jobId, 'type': 'notification'},
              );
            }
          }
        }
      }

      _notifications = myNotis.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
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

      _notifications.sort((a, b) {
        final aTime = a['time'] as DateTime;
        final bTime = b['time'] as DateTime;
        return bTime.compareTo(aTime);
      });

      isFirstNoti = false;
      notifyListeners();
    }, onError: (e) => debugPrint('Firestore noti stream error: $e'));
  }

  Future<void> refreshJobs() async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(seconds: 1)); // Tạo cảm giác load
    _isLoading = false;
    notifyListeners();
  }

  /// Làm mới dữ liệu từ Firestore
  Future<void> refreshData() async {
    final uid = _auth.currentUser?.uid;
    if (uid != null) {
      _listenToFirestoreJobs(uid);
    }
  }

  JobModel _docToJobModel(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    JobStatus status = JobStatus.waiting;
    final rawStatus = (data['trangThai'] ?? data['status'] ?? '') as String;
    switch (rawStatus) {
      case 'da_phan_cong':
      case 'assigned':
        status = JobStatus.waiting;
        break;
      case 'dang_di':
      case 'shipping':
      case 'processing':
        status = JobStatus.onTheWay;
        break;
      case 'da_den_noi':
      case 'arrived':
      case 'delivered':
        status = JobStatus.arrived;
        break;
      case 'dang_lap':
      case 'installing':
        status = JobStatus.installing;
        break;
      case 'hoan_thanh':
      case 'completed':
        status = JobStatus.completed;
        break;
      case 'su_co':
      case 'failed':
      case 'incident':
      case 'needSupport':
        status = JobStatus.needSupport;
        break;
      default:
        status = JobStatus.waiting;
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

    final double? lat = _toDouble(
      data['diaChiViDo'] ?? data['viDo'] ?? data['latitude'] ?? data['lat'],
    );
    final double? lng = _toDouble(
      data['diaChiKinhDo'] ??
          data['kinhDo'] ??
          data['longitude'] ??
          data['lng'],
    );

    // Parse product details from nested items if present
    String prodName = data['tenSanPham'] ?? '';
    String prodSpecs = data['thongSoSanPham'] ?? '';
    final itemsList = data['items'];
    if (itemsList is List && itemsList.isNotEmpty) {
      final firstItem = itemsList[0];
      if (firstItem is Map) {
        prodName = firstItem['name'] ?? '';
        prodSpecs =
            'Model: ${firstItem['id'] ?? ''}, SL: ${firstItem['quantity'] ?? 1}';
      }
    }

    // Format appointment time from scheduledDate Timestamp if present
    String apptTime = data['gioHen'] ?? '';
    if (data['scheduledDate'] is Timestamp) {
      final timestamp = data['scheduledDate'] as Timestamp;
      apptTime = DateFormat('HH:mm - dd/MM/yyyy').format(timestamp.toDate());
    }

    return JobModel(
      id: doc.id,
      customerName: data['customerName'] ?? data['tenKhachHang'] ?? '',
      customerPhone: data['phoneNumber'] ?? data['soDienThoai'] ?? '',
      address: data['diaChiGiaoHang'] ?? data['diaChi'] ?? '',
      appointmentTime: apptTime,
      productName: prodName,
      productSpecs: prodSpecs,
      adminNotes: data['ghiChuAdmin'] ?? data['note'] ?? '',
      codAmount: _toDouble(data['soTienCOD'] ?? data['tongTien'] ?? 0) ?? 0.0,
      tipAmount: _toDouble(data['soTienTip'] ?? 0) ?? 0.0,
      status: status,
      date: (data['ngayTao'] as Timestamp?)?.toDate() ?? DateTime.now(),
      scheduledDate: data['scheduledDate'] is Timestamp
          ? (data['scheduledDate'] as Timestamp).toDate()
          : null,
      images: List<String>.from(data['anhHoanThanh'] ?? []),
      imagesBefore: List<String>.from(data['anhTruocKhiLam'] ?? []),
      imagesAfter: List<String>.from(data['anhSauKhiLam'] ?? []),
      timeline: timeline,
      vatTuPhatSinh: vatTu,
      issueReason: data['lyDoSuCo'],
      issueDesc: data['moTaSuCo'],
      customerLatitude: lat,
      customerLongitude: lng,
      customerSignature: data['chuKyKhachHang'] as String?,
    );
  }

  /// Cập nhật trạng thái công việc kèm tọa độ GPS nếu cần
  Future<bool> updateJobStatus(
    String jobId,
    JobStatus newStatus, {
    double? ktvLatitude,
    double? ktvLongitude,
  }) async {
    _lastError = null;
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];

    // Kiểm tra khóa theo ngày hẹn
    if (job.isLocked && newStatus != JobStatus.waiting) {
      debugPrint(
        'LOCKED WARNING: Updating status before scheduled date (${job.scheduledDate})',
      );
    }

    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);

    String descText = 'Trạng thái cập nhật bởi kỹ thuật viên';
    if (newStatus == JobStatus.arrived &&
        ktvLatitude != null &&
        ktvLongitude != null) {
      descText =
          'KTV xác nhận check-in tại tọa độ ($ktvLatitude, $ktvLongitude)';
    }

    updatedTimeline.add({
      'status': newStatus.rawValue,
      'time': DateTime.now(),
      'title': newStatus.displayName,
      'desc': descText,
    });

    _jobs[idx] = job.copyWith(status: newStatus, timeline: updatedTimeline);
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      final Map<String, dynamic> updateData = {
        'trangThai': newStatus.rawValue,
        'status': newStatus.englishRawValue,
        'lichSuTrangThai': FieldValue.arrayUnion([
          {
            'trangThai': newStatus.rawValue,
            'status': newStatus.englishRawValue,
            'thoiGian': Timestamp.now(),
            'tieuDe': newStatus.displayName,
            'moTa': descText,
          },
        ]),
        'ngayCapNhat': FieldValue.serverTimestamp(),
      };

      if (newStatus == JobStatus.arrived &&
          ktvLatitude != null &&
          ktvLongitude != null) {
        updateData['ktvViDoDenNoi'] = ktvLatitude;
        updateData['ktvKinhDoDenNoi'] = ktvLongitude;
        updateData['thoiGianCheckIn'] = FieldValue.serverTimestamp();
      }

      await _firestore
          .collection('donHang')
          .doc(jobId)
          .update(updateData)
          .timeout(const Duration(seconds: 5));

      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'CAP_NHAT_TRANG_THAI',
          'moTa':
              'Cập nhật trạng thái đơn $jobId → ${newStatus.displayName}${ktvLatitude != null ? ' (Check-in GPS)' : ''}',
          'ngayTao': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 3));
      }
      return true;
    } catch (e) {
      _lastError = e.toString();
      debugPrint('Firestore status sync error/timeout (will retry offline): $e');
      // Trả về true để tối ưu trải nghiệm offline-first, thay đổi đã được áp dụng local và sẽ tự động sync khi có mạng
      return true;
    }
  }

  /// Báo cáo sự cố
  Future<bool> reportIssue({
    required String jobId,
    required String reason,
    required String description,
    List<String> photos = const [],
  }) async {
    _lastError = null;
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];

    // Kiểm tra khóa theo ngày hẹn
    if (job.isLocked) {
      debugPrint(
        'LOCKED WARNING: Reporting issue before scheduled date (${job.scheduledDate})',
      );
    }

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
      timeline: updatedTimeline,
      images: photos,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': 'incident',
        'status': 'failed',
        'lyDoSuCo': reason,
        'moTaSuCo': description,
        'lyDoHuy': '$reason: $description',
        'anhSuCo': photos,
        'updatedAt': FieldValue.serverTimestamp(),
      }).timeout(const Duration(seconds: 5));
      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'BAO_CAO_SU_CO',
          'moTa': 'Báo cáo sự cố đơn hàng $jobId: $reason',
          'ngayTao': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 3));
      }
      return true;
    } catch (e) {
      _lastError = e.toString();
      debugPrint('Firestore issue report sync error/timeout (will retry offline): $e');
      // Trả về true để tối ưu trải nghiệm offline-first, thay đổi đã được áp dụng local và sẽ tự động sync khi có mạng
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
    String? customerSignature,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];

    // Kiểm tra khóa theo ngày hẹn
    if (job.isLocked) {
      debugPrint(
        'LOCKED WARNING: Completing job before scheduled date (${job.scheduledDate})',
      );
    }

    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);
    updatedTimeline.add({
      'status': 'hoan_thanh',
      'time': DateTime.now(),
      'title': 'Hoàn tất công việc',
      'desc': 'Đã bàn giao & thu $codCollected VND. Ghi chú: $notes',
    });

    final oldJob = _jobs[idx];
    _jobs[idx] = job.copyWith(
      status: JobStatus.completed,
      codAmount: codCollected,
      tipAmount: tipAmount,
      images: photos,
      timeline: updatedTimeline,
      customerSignature: customerSignature,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      await _firestore.collection('donHang').doc(jobId).update({
        'trangThai': 'hoan_thanh',
        'status': 'completed',
        'soTienCOD': codCollected,
        'soTienTip': tipAmount,
        'totalAmount': codCollected,
        'tipAmount': tipAmount,
        'anhHoanThanh': photos,
        'chuKyKhachHang': customerSignature,
        'hoanThanhVao': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      }).timeout(const Duration(seconds: 5));
      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'HOAN_THANH',
          'moTa':
              'Hoàn thành lắp đặt đơn hàng $jobId, thu COD: $codCollected, Tip: $tipAmount',
          'ngayTao': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 3));
      }
      return true;
    } catch (e) {
      debugPrint('Firestore complete sync error/timeout (will retry offline): $e');
      // Trả về true để tối ưu trải nghiệm offline-first, thay đổi đã được áp dụng local và sẽ tự động sync khi có mạng
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
    for (final noti in _notifications) {
      noti['read'] = true;
    }
    notifyListeners();

    final batch = _firestore.batch();
    for (final noti in _notifications) {
      batch.update(_firestore.collection('thongBao').doc(noti['id']), {
        'daDoc': true,
      });
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

    final oldJob = _jobs[idx];
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
      _jobs[idx] = oldJob;
      notifyListeners();
      return false;
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

    final oldJob = _jobs[idx];
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
      }).timeout(const Duration(seconds: 5));
      return true;
    } catch (e) {
      debugPrint('Firestore vatTu error/timeout (will retry offline): $e');
      // Không revert local, trả về true để giữ trải nghiệm offline-first
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

    final oldJob = _jobs[idx];
    final updated = List<Map<String, dynamic>>.from(_jobs[idx].vatTuPhatSinh);
    if (index < 0 || index >= updated.length) return false;
    updated.removeAt(index);

    _jobs[idx] = _jobs[idx].copyWith(vatTuPhatSinh: updated);
    notifyListeners();

    try {
      await _firestore.collection('donHang').doc(jobId).update({
        'vatTuPhatSinh': updated,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      }).timeout(const Duration(seconds: 5));
      return true;
    } catch (e) {
      debugPrint('Firestore delete vatTu error/timeout (will retry offline): $e');
      // Không revert local, trả về true để giữ trải nghiệm offline-first
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

    final oldJob = _jobs[idx];
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
      }).timeout(const Duration(seconds: 5));
      return true;
    } catch (e) {
      debugPrint('Firestore update vatTu error/timeout (will retry offline): $e');
      // Không revert local, trả về true để giữ trải nghiệm offline-first
      return true;
    }
  }

  /// Lấy danh sách sản phẩm/vật tư tiêu chuẩn từ Firestore
  Future<List<Map<String, dynamic>>> fetchStandardProducts() async {
    try {
      final snapshot = await _firestore.collection('sanPham').get();
      return snapshot.docs.map((doc) {
        final data = doc.data();
        int parseToInt(dynamic val) {
          if (val is num) return val.toInt();
          if (val is String) return int.tryParse(val) ?? 0;
          return 0;
        }

        return {
          'id': doc.id,
          'name': data['tenSanPham'] ?? '',
          'price': (data['giaBan'] as num?)?.toDouble() ?? 0.0,
          'brand': data['thuongHieu'] ?? '',
          'sku': data['sku'] ?? '',
          'category': data['danhMuc'] ?? '',
          'tonKho': parseToInt(data['tonKho'] ?? data['soLuongTon'] ?? 0),
        };
      }).toList();
    } catch (e) {
      debugPrint('Error fetching standard products: $e');
      return [];
    }
  }

  /// Lấy danh sách danh mục từ Firestore
  Future<List<Map<String, dynamic>>> fetchCategories() async {
    try {
      final snapshot = await _firestore.collection('danhMuc').get();
      return snapshot.docs.map((doc) {
        final data = doc.data();
        return {
          'id': doc.id,
          'name': data['ten'] ?? '',
          'icon': data['icon'] ?? '⚙️',
        };
      }).toList();
    } catch (e) {
      debugPrint('Error fetching categories: $e');
      return [];
    }
  }

  /// Xác nhận thanh toán thành công
  Future<bool> confirmPayment({
    required String jobId,
    required String method,
    required double amount,
  }) async {
    final idx = _jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;

    final job = _jobs[idx];
    final updatedTimeline = List<Map<String, dynamic>>.from(job.timeline);

    updatedTimeline.add({
      'status': 'hoan_thanh',
      'trangThai': 'hoan_thanh',
      'time': DateTime.now(),
      'title': 'Thanh toán thành công',
      'desc': 'Khách hàng thanh toán qua $method số tiền ${amount.toInt()}đ',
    });

    updatedTimeline.add({
      'status': 'hoan_thanh',
      'trangThai': 'hoan_thanh',
      'time': DateTime.now(),
      'title': 'Hoàn tất công việc',
      'desc':
          'Hệ thống tự động xác nhận hoàn thành sau khi nhận thanh toán QR.',
    });

    _jobs[idx] = job.copyWith(
      status: JobStatus.completed,
      timeline: updatedTimeline,
    );
    notifyListeners();

    try {
      final uid = _auth.currentUser?.uid;
      final Map<String, dynamic> updateData = {
        'trangThai': 'hoan_thanh',
        'status': 'completed',
        'paymentStatus': 'paid',
        'paymentMethod': method,
        'lichSuTrangThai': FieldValue.arrayUnion([
          {
            'trangThai': 'hoan_thanh',
            'status': 'completed',
            'thoiGian': Timestamp.now(),
            'tieuDe': 'Thanh toán thành công',
            'moTa':
                'Khách hàng thanh toán qua $method số tiền ${amount.toInt()}đ',
          },
          {
            'trangThai': 'hoan_thanh',
            'status': 'completed',
            'thoiGian': Timestamp.now(),
            'tieuDe': 'Hoàn thành công việc',
            'moTa':
                'Hệ thống tự động xác nhận hoàn thành sau khi nhận thanh toán QR.',
          },
        ]),
        'ngayCapNhat': FieldValue.serverTimestamp(),
      };

      await _firestore
          .collection('donHang')
          .doc(jobId)
          .update(updateData)
          .timeout(const Duration(seconds: 5));

      if (uid != null) {
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'CAP_NHAT_TRANG_THAI',
          'moTa':
              'Cập nhật trạng thái đơn $jobId → Đã hoàn thành (Tự động sau thanh toán)',
          'ngayTao': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 3));
        await _firestore.collection('nhatKyHoatDong').add({
          'nguoiDungId': uid,
          'loaiSuKien': 'THANH_TOAN_DON_HANG',
          'moTa':
              'Đã nhận thanh toán ${amount.toInt()}đ qua $method cho đơn $jobId',
          'ngayTao': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 3));
      }
      return true;
    } catch (e) {
      debugPrint('Firestore confirm payment error/timeout (will retry offline): $e');
      // Không revert local, trả về true để giữ trải nghiệm offline-first
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
