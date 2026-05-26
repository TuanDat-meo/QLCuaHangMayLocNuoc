// Assignment Model - Phân công kỹ thuật viên
class Assignment {
  final String id;
  final String orderId;
  final String technicianId;
  final String technicianName;
  final String technicianPhone;
  final String technicianAvatar;
  final String status; // pending, accepted, in_progress, completed, cancelled
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final String? completionNotes;
  final List<String>? completionImageUrls;
  final double? codAmount;
  final double? tipAmount;
  final double? rating;
  final String? review;

  Assignment({
    required this.id,
    required this.orderId,
    required this.technicianId,
    required this.technicianName,
    required this.technicianPhone,
    required this.technicianAvatar,
    required this.status,
    required this.createdAt,
    this.acceptedAt,
    this.startedAt,
    this.completedAt,
    this.completionNotes,
    this.completionImageUrls,
    this.codAmount,
    this.tipAmount,
    this.rating,
    this.review,
  });

  bool get isPending => status == 'pending';
  bool get isAccepted => status == 'accepted';
  bool get isInProgress => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  String get statusDisplayText {
    switch (status) {
      case 'pending':
        return 'Chờ KTV';
      case 'accepted':
        return 'KTV đã nhận';
      case 'in_progress':
        return 'Đang lắp đặt';
      case 'completed':
        return 'Hoàn tất';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  factory Assignment.fromMap(Map<String, dynamic> map) {
    return Assignment(
      id: map['id'] as String? ?? '',
      orderId: map['orderId'] as String? ?? '',
      technicianId: map['technicianId'] as String? ?? '',
      technicianName: map['technicianName'] as String? ?? '',
      technicianPhone: map['technicianPhone'] as String? ?? '',
      technicianAvatar: map['technicianAvatar'] as String? ?? '',
      status: map['status'] as String? ?? 'pending',
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      acceptedAt: (map['acceptedAt'] as dynamic)?.toDate(),
      startedAt: (map['startedAt'] as dynamic)?.toDate(),
      completedAt: (map['completedAt'] as dynamic)?.toDate(),
      completionNotes: map['completionNotes'] as String?,
      completionImageUrls: List<String>.from(map['completionImageUrls'] as List? ?? []),
      codAmount: (map['codAmount'] as num?)?.toDouble(),
      tipAmount: (map['tipAmount'] as num?)?.toDouble(),
      rating: (map['rating'] as num?)?.toDouble(),
      review: map['review'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'orderId': orderId,
      'technicianId': technicianId,
      'technicianName': technicianName,
      'technicianPhone': technicianPhone,
      'technicianAvatar': technicianAvatar,
      'status': status,
      'createdAt': createdAt,
      'acceptedAt': acceptedAt,
      'startedAt': startedAt,
      'completedAt': completedAt,
      'completionNotes': completionNotes,
      'completionImageUrls': completionImageUrls,
      'codAmount': codAmount,
      'tipAmount': tipAmount,
      'rating': rating,
      'review': review,
    };
  }
}
