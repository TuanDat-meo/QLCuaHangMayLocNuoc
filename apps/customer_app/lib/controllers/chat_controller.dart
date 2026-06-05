import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:customer_app/services/chat_service.dart';

/// Model for a chat message
class ChatMessageModel {
  final String id;
  final String senderId;
  final String senderType; // 'customer' | 'admin' | 'bot'
  final String? senderName;
  final String content;
  final DateTime createdAt;
  final bool isRead;

  ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.senderType,
    this.senderName,
    required this.content,
    required this.createdAt,
    required this.isRead,
  });

  factory ChatMessageModel.fromDoc(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    DateTime createdAt;
    final ts = data['createdAt'];
    if (ts is Timestamp) {
      createdAt = ts.toDate();
    } else {
      createdAt = DateTime.now();
    }
    return ChatMessageModel(
      id: doc.id,
      senderId: data['senderId'] ?? '',
      senderType: data['senderType'] ?? 'bot',
      senderName: data['senderName'],
      content: data['content'] ?? '',
      createdAt: createdAt,
      isRead: data['isRead'] ?? false,
    );
  }
}

/// ChatController - Quản lý state chat của khách hàng
class ChatController extends ChangeNotifier {
  String? _sessionId;
  List<ChatMessageModel> _messages = [];
  String _sessionStatus = 'bot'; // bot | waiting | active | closed
  String? _adminName;
  bool _isLoading = false;
  bool _isSending = false;
  int _unreadFromAdmin = 0;
  bool _autoInited = false;

  // Stream subscriptions
  StreamSubscription<QuerySnapshot>? _messagesSubscription;
  StreamSubscription<DocumentSnapshot>? _sessionSubscription;

  // Getters
  String? get sessionId => _sessionId;
  List<ChatMessageModel> get messages => _messages;
  String get sessionStatus => _sessionStatus;
  String? get adminName => _adminName;
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  int get unreadFromAdmin => _unreadFromAdmin;
  bool get isBotMode => _sessionStatus == 'bot';
  bool get isWaiting => _sessionStatus == 'waiting';
  bool get isActive => _sessionStatus == 'active';
  bool get isClosed => _sessionStatus == 'closed';
  bool get hasUnread => _unreadFromAdmin > 0;

  /// Tự động khởi tạo session khi user đăng nhập (chỉ load session có sẵn)
  Future<void> autoInit() async {
    if (_autoInited) return;
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    _autoInited = true;

    try {
      // Chỉ kiểm tra session hiện có, không tạo mới
      final querySnapshot = await FirebaseFirestore.instance
          .collection('chatSessions')
          .where('customerId', isEqualTo: user.uid)
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
        _sessionId = existing.first.id;
        _listenToSession();
        _listenToMessages();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('ChatController autoInit error: $e');
    }
  }

  /// Khởi tạo hoặc lấy session chat
  Future<void> initSession() async {

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      _sessionId = await ChatService.createOrGetSession(
        userId: user.uid,
        userName: user.displayName ?? 'Khách hàng',
        userEmail: user.email,
      );

      _listenToSession();
      _listenToMessages();
    } catch (e) {
      debugPrint('ChatController initSession error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _listenToSession() {
    _sessionSubscription?.cancel();
    if (_sessionId == null) return;
    _sessionSubscription = ChatService.sessionStream(_sessionId!).listen((doc) {
      if (!doc.exists) return;
      final data = doc.data() as Map<String, dynamic>;
      _sessionStatus = data['status'] ?? 'bot';
      _adminName = data['adminName'];
      _unreadFromAdmin = data['unreadByCustomer'] ?? 0;
      notifyListeners();
    });
  }

  void _listenToMessages() {
    _messagesSubscription?.cancel();
    if (_sessionId == null) return;
    _messagesSubscription = ChatService.messagesStream(_sessionId!).listen((snapshot) {
      _messages = snapshot.docs
          .map((d) => ChatMessageModel.fromDoc(d))
          .toList();
      notifyListeners();
    });
  }

  /// Khách hàng gửi tin nhắn
  Future<void> sendMessage(String content) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null || _sessionId == null || content.trim().isEmpty) return;

    _isSending = true;
    notifyListeners();

    try {
      await ChatService.sendMessage(
        sessionId: _sessionId!,
        content: content.trim(),
        senderType: 'customer',
        senderId: user.uid,
        senderName: user.displayName ?? 'Khách hàng',
      );

      // Nếu đang ở bot mode, xử lý bot reply
      if (isBotMode) {
        await _processBotReply(content.trim());
      }
    } catch (e) {
      debugPrint('ChatController sendMessage error: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  /// Xử lý bot trả lời
  Future<void> _processBotReply(String userMessage) async {
    if (_sessionId == null) return;

    // Delay nhỏ để UX tự nhiên hơn
    await Future.delayed(const Duration(milliseconds: 800));

    final botReply = ChatService.getBotReply(userMessage);

    if (botReply != null) {
      await ChatService.sendMessage(
        sessionId: _sessionId!,
        content: botReply,
        senderType: 'bot',
        senderId: 'aquabot',
        senderName: 'AquaBot',
      );

      // Sau bot reply, gợi ý kết nối nhân viên
      await Future.delayed(const Duration(milliseconds: 500));
      await ChatService.sendMessage(
        sessionId: _sessionId!,
        content: 'Bạn có muốn kết nối với nhân viên hỗ trợ để được tư vấn chi tiết hơn không?',
        senderType: 'bot',
        senderId: 'aquabot',
        senderName: 'AquaBot',
      );
    } else {
      // Không tìm được câu trả lời → tự động chuyển sang chờ nhân viên
      await ChatService.sendMessage(
        sessionId: _sessionId!,
        content: 'Câu hỏi của bạn cần được nhân viên hỗ trợ trực tiếp. Đang kết nối với nhân viên hỗ trợ...',
        senderType: 'bot',
        senderId: 'aquabot',
        senderName: 'AquaBot',
      );
      await Future.delayed(const Duration(milliseconds: 500));
      await requestHumanAgent();
    }
  }

  /// Yêu cầu kết nối nhân viên hỗ trợ
  Future<void> requestHumanAgent() async {
    if (_sessionId == null) return;
    try {
      await ChatService.requestHumanAgent(_sessionId!);
    } catch (e) {
      debugPrint('ChatController requestHumanAgent error: $e');
    }
  }

  /// Đánh dấu đã đọc (khi khách mở chat)
  Future<void> markRead() async {
    if (_sessionId == null) return;
    try {
      await ChatService.markReadByCustomer(_sessionId!);
      _unreadFromAdmin = 0;
      notifyListeners();
    } catch (e) {
      debugPrint('ChatController markRead error: $e');
    }
  }

  /// Reset controller (khi logout)
  void reset() {
    _sessionSubscription?.cancel();
    _messagesSubscription?.cancel();
    _sessionId = null;
    _messages = [];
    _sessionStatus = 'bot';
    _adminName = null;
    _unreadFromAdmin = 0;
    _autoInited = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _sessionSubscription?.cancel();
    _messagesSubscription?.cancel();
    super.dispose();
  }
}
