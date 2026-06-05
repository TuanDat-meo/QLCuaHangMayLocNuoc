import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/chat_controller.dart';

/// ChatScreen - Màn hình chat đầy đủ giữa khách hàng và admin/bot
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _statusBannerCtrl;

  @override
  void initState() {
    super.initState();
    _statusBannerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _statusBannerCtrl.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final chat = context.read<ChatController>();
      if (chat.sessionId == null) {
        await chat.initSession();
      } else {
        await chat.markRead();
      }
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _statusBannerCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSend() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _textController.clear();
    final chat = context.read<ChatController>();
    await chat.sendMessage(text);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ChatController>(
      builder: (context, chat, _) {
        // Tự cuộn khi có tin mới
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

        return Scaffold(
          backgroundColor: const Color(0xfff8fafc),
          appBar: _buildAppBar(chat),
          body: chat.isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xff00459a)),
                )
              : Column(
                  children: [
                    // Status banner
                    AnimatedSize(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOutCubic,
                      child: _buildStatusSection(chat),
                    ),

                    // Messages list
                    Expanded(
                      child: chat.messages.isEmpty
                          ? _buildEmptyState()
                          : ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                              itemCount: chat.messages.length,
                              itemBuilder: (context, index) {
                                final msg = chat.messages[index];
                                final isCustomer = msg.senderType == 'customer';
                                return _buildMessageBubble(msg, isCustomer, context);
                              },
                            ),
                    ),

                    // Quick reply buttons (chỉ bot mode)
                    if (chat.isBotMode && chat.messages.isNotEmpty)
                      _buildQuickReplies(chat),

                    // Input area
                    _buildInputArea(chat),
                  ],
                ),
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(ChatController chat) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: Color(0xff0b1c30), size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      titleSpacing: 0,
      title: Row(
        children: [
          // Avatar với hiệu ứng trạng thái
          Stack(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: chat.isActive
                      ? const LinearGradient(
                          colors: [Color(0xff00459a), Color(0xff0061d5)],
                        )
                      : const LinearGradient(
                          colors: [Color(0xff9333ea), Color(0xffb366ff)],
                        ),
                ),
                child: Center(
                  child: Text(
                    chat.isActive ? '👨‍💼' : '🤖',
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),
              // Online dot
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 11,
                  height: 11,
                  decoration: BoxDecoration(
                    color: chat.isActive
                        ? const Color(0xff22c55e)
                        : chat.isWaiting
                            ? const Color(0xfffbbf24)
                            : const Color(0xff94a3b8),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                chat.isActive
                    ? (chat.adminName ?? 'Nhân viên hỗ trợ')
                    : 'AquaBot',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                ),
              ),
              Text(
                _getStatusText(chat),
                style: const TextStyle(fontSize: 11, color: Color(0xff64748b)),
              ),
            ],
          ),
        ],
      ),
      actions: [
        // Nút kết nối nhân viên nhanh (khi ở bot mode)
        if (chat.isBotMode)
          TextButton.icon(
            onPressed: () => _showConnectDialog(chat),
            icon: const Icon(Icons.support_agent_rounded,
                color: Color(0xff00459a), size: 18),
            label: const Text(
              'Gặp nhân viên',
              style: TextStyle(
                color: Color(0xff00459a),
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        // Nút hotline
        IconButton(
          icon: const Icon(Icons.phone_outlined,
              color: Color(0xff00459a), size: 22),
          onPressed: () {},
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: const Color(0xfff1f5f9)),
      ),
    );
  }

  String _getStatusText(ChatController chat) {
    if (chat.isActive) return '🟢 Đang trực tuyến';
    if (chat.isWaiting) return '⏳ Đang tìm nhân viên...';
    if (chat.isClosed) return '✅ Đã kết thúc';
    return '🤖 Trợ lý tự động';
  }

  Widget _buildStatusSection(ChatController chat) {
    if (chat.isWaiting) {
      return _buildWaitingBanner();
    }
    if (chat.isClosed) {
      return _buildStatusBanner(
        '✅ Cuộc trò chuyện đã kết thúc',
        const Color(0xffd1fae5),
        const Color(0xff065f46),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildWaitingBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: const BoxDecoration(
        color: Color(0xfffef3c7),
        border: Border(bottom: BorderSide(color: Color(0xfffde68a), width: 1)),
      ),
      child: Row(
        children: [
          // Spinner
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xffd97706)),
            ),
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Đang tìm nhân viên hỗ trợ...',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xff92400e),
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Vui lòng chờ trong giây lát, nhân viên sẽ kết nối ngay',
                  style: TextStyle(fontSize: 11, color: Color(0xffb45309)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(String text, Color bg, Color textColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: bg,
      child: Text(
        text,
        style: TextStyle(
            fontSize: 12, color: textColor, fontWeight: FontWeight.bold),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  const Color(0xff9333ea).withOpacity(0.1),
                  const Color(0xff00459a).withOpacity(0.1),
                ],
              ),
            ),
            child: const Center(
              child: Text('🤖', style: TextStyle(fontSize: 40)),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Xin chào! Tôi là AquaBot 👋',
            style: TextStyle(
                fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xff334155)),
          ),
          const SizedBox(height: 8),
          const Text(
            'Hãy gửi tin nhắn đầu tiên của bạn để bắt đầu trò chuyện',
            style: TextStyle(fontSize: 12, color: Color(0xff64748b)),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(dynamic msg, bool isCustomer, BuildContext context) {
    final isBot = msg.senderType == 'bot';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment:
            isCustomer ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          // Avatar (bot / admin)
          if (!isCustomer) ...[
            Container(
              width: 30,
              height: 30,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: isBot
                    ? const LinearGradient(
                        colors: [Color(0xff9333ea), Color(0xffb366ff)])
                    : const LinearGradient(
                        colors: [Color(0xff00459a), Color(0xff0061d5)]),
              ),
              child: Center(
                child: Text(
                  isBot ? '🤖' : '👨‍💼',
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ),
          ],

          // Bubble
          Flexible(
            child: Column(
              crossAxisAlignment: isCustomer
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                if (!isCustomer)
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 3),
                    child: Text(
                      msg.senderName ?? (isBot ? 'AquaBot' : 'Nhân viên'),
                      style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xff94a3b8),
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: isCustomer
                        ? const LinearGradient(
                            colors: [Color(0xff00459a), Color(0xff0061d5)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : null,
                    color: isCustomer
                        ? null
                        : isBot
                            ? const Color(0xfff3e8ff)
                            : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(isCustomer ? 18 : 4),
                      bottomRight: Radius.circular(isCustomer ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: (!isCustomer && !isBot)
                        ? Border.all(color: const Color(0xffe2e8f0))
                        : null,
                  ),
                  child: Text(
                    msg.content,
                    style: TextStyle(
                      fontSize: 13,
                      color: isCustomer
                          ? Colors.white
                          : isBot
                              ? const Color(0xff7c3aed)
                              : const Color(0xff1e293b),
                      height: 1.5,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 3, left: 4, right: 4),
                  child: Text(
                    _formatTime(msg.createdAt),
                    style: const TextStyle(
                        fontSize: 9, color: Color(0xffcbd5e1)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickReplies(ChatController chat) {
    final quickReplies = [
      '🔧 Thay lõi lọc',
      '🛡️ Bảo hành',
      '📦 Đơn hàng của tôi',
      '💰 Báo giá',
    ];

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xfff1f5f9))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Chọn nhanh:',
            style: TextStyle(
                fontSize: 10,
                color: Color(0xff94a3b8),
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              ...quickReplies.map(
                (reply) => GestureDetector(
                  onTap: () => chat.sendMessage(reply),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xffe2e8f0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      reply,
                      style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xff1e293b),
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Divider + Connect button nổi bật
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: GestureDetector(
              onTap: () => _showConnectDialog(chat),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xff00459a), Color(0xff0061d5)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xff00459a).withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.support_agent_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Kết nối ngay với nhân viên',
                      style: TextStyle(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }

  // Dialog xác nhận kết nối nhân viên
  void _showConnectDialog(ChatController chat) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xffe2e8f0),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    const Color(0xff00459a).withOpacity(0.1),
                    const Color(0xff0061d5).withOpacity(0.1),
                  ],
                ),
              ),
              child: const Icon(Icons.support_agent_rounded,
                  color: Color(0xff00459a), size: 32),
            ),
            const SizedBox(height: 16),
            const Text(
              'Kết nối với nhân viên hỗ trợ',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Nhân viên sẽ tiếp tục cuộc trò chuyện và hỗ trợ bạn trực tiếp. Thời gian chờ thường dưới 5 phút.',
              style: TextStyle(
                  fontSize: 13, color: Color(0xff64748b), height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: Color(0xffe2e8f0)),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text(
                      'Để sau',
                      style: TextStyle(
                          color: Color(0xff64748b), fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await chat.requestHumanAgent();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xff00459a),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.bolt_rounded, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'Kết nối ngay',
                          style: TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(ChatController chat) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xfff1f5f9))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xfff8fafc),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xffe2e8f0)),
              ),
              child: TextField(
                controller: _textController,
                onSubmitted: (_) => _handleSend(),
                maxLines: null,
                textInputAction: TextInputAction.send,
                decoration: InputDecoration(
                  hintText: chat.isClosed
                      ? 'Cuộc trò chuyện đã kết thúc'
                      : chat.isWaiting
                          ? 'Đang chờ nhân viên...'
                          : 'Nhập tin nhắn...',
                  hintStyle: const TextStyle(
                      color: Color(0xffcbd5e1), fontSize: 13),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                ),
                enabled: !chat.isClosed,
                style: const TextStyle(fontSize: 13, color: Color(0xff1e293b)),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Send button
          GestureDetector(
            onTap: chat.isClosed || chat.isSending ? null : _handleSend,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: chat.isClosed
                    ? LinearGradient(
                        colors: [Colors.grey.shade300, Colors.grey.shade300])
                    : const LinearGradient(
                        colors: [Color(0xff00459a), Color(0xff0061d5)]),
                boxShadow: chat.isClosed
                    ? []
                    : [
                        BoxShadow(
                          color: const Color(0xff00459a).withOpacity(0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              child: chat.isSending
                  ? const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
