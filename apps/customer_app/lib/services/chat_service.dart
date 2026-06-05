import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// ChatService - Xử lý tất cả thao tác Firestore cho hệ thống chat
class ChatService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;
  static const String _sessionsCol = 'chatSessions';

  // ============================================================
  // SESSION MANAGEMENT
  // ============================================================

  /// Tạo hoặc lấy session chat hiện tại của user
  static Future<String> createOrGetSession({
    required String userId,
    required String userName,
    String? userEmail,
  }) async {
    final querySnapshot = await _db
        .collection(_sessionsCol)
        .where('customerId', isEqualTo: userId)
        .get();

    final activeStatuses = ['bot', 'waiting', 'active'];
    final existing = querySnapshot.docs.where((doc) {
      final status = doc.data()['status'] as String?;
      return activeStatuses.contains(status);
    }).toList();

    if (existing.isNotEmpty) {
      // Sort locally descending by createdAt
      existing.sort((a, b) {
        final ta = a.data()['createdAt'] as Timestamp?;
        final tb = b.data()['createdAt'] as Timestamp?;
        final da = ta?.toDate() ?? DateTime.now();
        final db = tb?.toDate() ?? DateTime.now();
        return db.compareTo(da);
      });
      return existing.first.id;
    }

    // Tạo session mới
    final docRef = await _db.collection(_sessionsCol).add({
      'customerId': userId,
      'customerName': userName,
      'customerEmail': userEmail ?? '',
      'adminId': null,
      'adminName': null,
      'status': 'bot',
      'createdAt': FieldValue.serverTimestamp(),
      'lastMessage': 'Bắt đầu cuộc trò chuyện',
      'lastMessageAt': FieldValue.serverTimestamp(),
      'unreadByAdmin': 0,
      'unreadByCustomer': 0,
    });

    // Gửi tin chào mừng từ bot
    await _sendBotWelcome(docRef.id, userName);

    return docRef.id;
  }

  /// Gửi tin chào mừng khi mở chat
  static Future<void> _sendBotWelcome(String sessionId, String userName) async {
    final firstName = userName.split(' ').last;
    await sendMessage(
      sessionId: sessionId,
      content:
          'Xin chào $firstName! 👋 Tôi là AquaBot - trợ lý ảo của AquaCare.\n\nTôi có thể giúp bạn:\n• 🔧 Thay lõi lọc\n• 🛡️ Bảo hành sản phẩm\n• 📦 Theo dõi đơn hàng\n• 💰 Báo giá sản phẩm\n\nBạn cần hỗ trợ gì?',
      senderType: 'bot',
      senderId: 'aquabot',
      senderName: 'AquaBot',
    );
  }

  // ============================================================
  // MESSAGES
  // ============================================================

  /// Gửi tin nhắn vào session
  static Future<void> sendMessage({
    required String sessionId,
    required String content,
    required String senderType, // 'customer' | 'admin' | 'bot'
    required String senderId,
    String? senderName,
  }) async {
    final batch = _db.batch();

    // Thêm message
    final msgRef =
        _db.collection(_sessionsCol).doc(sessionId).collection('messages').doc();
    batch.set(msgRef, {
      'senderId': senderId,
      'senderType': senderType,
      'senderName': senderName,
      'content': content,
      'createdAt': FieldValue.serverTimestamp(),
      'isRead': false,
    });

    // Update session lastMessage
    final sessionRef = _db.collection(_sessionsCol).doc(sessionId);
    final updateData = <String, dynamic>{
      'lastMessage': content,
      'lastMessageAt': FieldValue.serverTimestamp(),
    };

    if (senderType == 'customer') {
      updateData['unreadByAdmin'] = FieldValue.increment(1);
    } else if (senderType == 'admin') {
      updateData['unreadByCustomer'] = FieldValue.increment(1);
    }

    batch.update(sessionRef, updateData);
    await batch.commit();
  }

  /// Stream tin nhắn realtime của 1 session
  static Stream<QuerySnapshot> messagesStream(String sessionId) {
    return _db
        .collection(_sessionsCol)
        .doc(sessionId)
        .collection('messages')
        .orderBy('createdAt', descending: false)
        .snapshots();
  }

  /// Stream session hiện tại (theo dõi status thay đổi)
  static Stream<DocumentSnapshot> sessionStream(String sessionId) {
    return _db.collection(_sessionsCol).doc(sessionId).snapshots();
  }

  // ============================================================
  // CUSTOMER ACTIONS
  // ============================================================

  /// Yêu cầu kết nối với nhân viên thực sự (thoát bot mode)
  static Future<void> requestHumanAgent(String sessionId) async {
    await _db.collection(_sessionsCol).doc(sessionId).update({
      'status': 'waiting',
      'unreadByAdmin': FieldValue.increment(1),
    });

    await sendMessage(
      sessionId: sessionId,
      content:
          '🙋 Bạn đã yêu cầu kết nối với nhân viên hỗ trợ. Vui lòng chờ trong giây lát...',
      senderType: 'bot',
      senderId: 'system',
      senderName: 'Hệ thống',
    );
  }

  /// Đánh dấu đã đọc (phía khách hàng)
  static Future<void> markReadByCustomer(String sessionId) async {
    await _db
        .collection(_sessionsCol)
        .doc(sessionId)
        .update({'unreadByCustomer': 0});
  }

  // ============================================================
  // BOT LOGIC
  // ============================================================

  /// Xử lý bot reply dựa trên keyword matching
  static String? getBotReply(String userMessage) {
    final msg = userMessage.toLowerCase().trim();

    // Thay lõi lọc
    if (_contains(msg, ['lõi', 'lọc', 'thay lõi', 'filter', 'loi loc'])) {
      return '🔧 Để đặt lịch thay lõi lọc:\n1. Vào mục "Sản phẩm"\n2. Chọn loại lõi phù hợp\n3. Đặt hàng - kỹ thuật viên sẽ hẹn lịch lắp đặt\n\nHoặc gọi hotline: 0947 271 643';
    }

    // Bảo hành
    if (_contains(msg, ['bảo hành', 'bao hanh', 'warranty', 'hết hạn'])) {
      return '🛡️ Chính sách bảo hành:\n• Máy lọc nước: 12-24 tháng\n• Lõi lọc: 3-6 tháng\n• Phụ kiện: 3-6 tháng\n\nXem chi tiết trong phần "Đơn hàng" của bạn.';
    }

    // Giá / báo giá
    if (_contains(msg, ['giá', 'gia', 'bao nhiêu', 'báo giá', 'price', 'cost'])) {
      return '💰 Xem bảng giá đầy đủ trong mục "Sản phẩm" của ứng dụng.\n\nHoặc để tư vấn cụ thể, nhấn "Kết nối nhân viên" để gặp nhân viên hỗ trợ.';
    }

    // Đơn hàng / tracking
    if (_contains(msg, ['đơn hàng', 'don hang', 'order', 'theo dõi', 'trạng thái'])) {
      return '📦 Để theo dõi đơn hàng:\n1. Vào mục "Đơn hàng" trong app\n2. Chọn đơn cần xem\n3. Xem chi tiết tiến trình\n\nCần hỗ trợ thêm?';
    }

    // Hủy đơn
    if (_contains(msg, ['hủy', 'huy', 'cancel', 'hủy đơn'])) {
      return '❌ Để hủy đơn hàng:\n1. Vào "Đơn hàng"\n2. Chọn đơn muốn hủy\n3. Nhấn "Hủy đơn" (chỉ áp dụng khi đơn còn ở trạng thái chờ xử lý)';
    }

    // Thanh toán
    if (_contains(msg, ['thanh toán', 'coc', 'cod', 'tiền', 'payment'])) {
      return '💳 Phương thức thanh toán:\n• Hiện tại: Thanh toán khi nhận hàng (COD)\n• Kỹ thuật viên thu tiền sau khi lắp đặt thành công\n\nChúng tôi sẽ sớm hỗ trợ thêm hình thức thanh toán khác.';
    }

    // Kỹ thuật viên / lắp đặt
    if (_contains(msg, ['kỹ thuật', 'ky thuat', 'lắp đặt', 'lap dat', 'technician'])) {
      return '👨‍🔧 Kỹ thuật viên của AquaCare sẽ liên hệ và hẹn lịch lắp đặt trong vòng 24h sau khi bạn đặt hàng.\n\nHotline: 0947 271 643';
    }

    // Chào hỏi
    if (_contains(msg, ['xin chào', 'hello', 'hi', 'chào', 'chao', 'hey'])) {
      return '👋 Xin chào! Tôi là AquaBot. Bạn cần hỗ trợ gì về sản phẩm máy lọc nước?';
    }

    // Cảm ơn
    if (_contains(msg, ['cảm ơn', 'cam on', 'thanks', 'thank you', 'ok'])) {
      return '😊 Không có gì! AquaCare luôn sẵn sàng hỗ trợ bạn. Chúc bạn có trải nghiệm tốt!';
    }

    // Không tìm thấy → gợi ý kết nối nhân viên
    return null;
  }

  static bool _contains(String message, List<String> keywords) {
    return keywords.any((k) => message.contains(k));
  }
}
