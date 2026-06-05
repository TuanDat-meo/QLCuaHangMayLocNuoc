import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:customer_app/controllers/chat_controller.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    try {
      // Sử dụng launchUrl trực tiếp thay vì canLaunchUrl nếu gặp vấn đề về cấu hình
      await launchUrl(launchUri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('Không thể thực hiện cuộc gọi: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Trung tâm hỗ trợ'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 0. Live Chat Card - NỔI BẬT
            Consumer<ChatController>(
              builder: (context, chat, _) {
                return GestureDetector(
                  onTap: () async {
                    final navigator = Navigator.of(context);
                    if (chat.sessionId == null) {
                      await chat.initSession();
                    }
                    await chat.markRead();
                    navigator.pushNamed('/chat');
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xff0b1c30), Color(0xff00459a)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xff00459a).withOpacity(0.35),
                          blurRadius: 24,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            // Live indicator
                            Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                color: Color(0xff4ade80),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Đang trực tuyến',
                              style: TextStyle(
                                color: Color(0xff4ade80),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Chat trực tiếp với\nnhân viên hỗ trợ',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Được hỗ trợ ngay lập tức, không cần chờ đợi',
                          style: TextStyle(color: Colors.white60, fontSize: 13),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            // Chat button
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.15),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.chat_bubble_rounded,
                                        color: Color(0xff00459a), size: 18),
                                    const SizedBox(width: 8),
                                    Text(
                                      chat.unreadFromAdmin > 0
                                          ? 'Chat (${chat.unreadFromAdmin} mới)'
                                          : 'Bắt đầu chat',
                                      style: const TextStyle(
                                        color: Color(0xff00459a),
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Call button
                            GestureDetector(
                              onTap: () => _makePhoneCall('0947271643'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 12, horizontal: 16),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                      color: Colors.white30, width: 1),
                                ),
                                child: const Icon(Icons.call_rounded,
                                    color: Colors.white, size: 22),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            // 1. Hotline Card

            GestureDetector(
              onTap: () => _makePhoneCall('0947271643'),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xff00459a), Color(0xff0061d5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xff00459a).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.headset_mic_rounded, color: Colors.white, size: 32),
                    ),
                    const SizedBox(width: 20),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tổng đài hỗ trợ 24/7',
                            style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '0947 271 643',
                            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.phone_forwarded_rounded, color: Colors.white),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            // 2. FAQ Section
            const Text(
              'Câu hỏi thường gặp',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xff0b1c30)),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xfff1f5f9)),
              ),
              child: const Column(
                children: [
                  _FAQItem(
                    question: 'Làm thế nào để đặt lịch thay lõi lọc?',
                    answer: 'Bạn có thể vào phần Sản phẩm, chọn loại lõi lọc cần thay và đặt hàng. Kỹ thuật viên sẽ liên hệ để hẹn giờ lắp đặt.',
                  ),
                  _FAQItem(
                    question: 'Chính sách bảo hành như thế nào?',
                    answer: 'Tất cả sản phẩm chính hãng tại Aquacare đều được bảo hành từ 1-2 năm tùy dòng máy. Bạn có thể theo dõi thời hạn bảo hành trong chi tiết đơn hàng.',
                  ),
                  _FAQItem(
                    question: 'Làm sao để thanh toán đơn hàng?',
                    answer: 'Hiện tại Aquacare hỗ trợ thanh toán khi nhận hàng (COD) sau khi kỹ thuật viên hoàn tất lắp đặt và kiểm tra máy.',
                    isLast: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // 3. User Guide Section
            const Text(
              'Cẩm nang sử dụng',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xff0b1c30)),
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.3,
              children: [
                _GuideCard(
                  icon: Icons.cleaning_services_rounded,
                  title: 'Vệ sinh máy',
                  color: Colors.orange,
                  onTap: () {},
                ),
                _GuideCard(
                  icon: Icons.lightbulb_outline_rounded,
                  title: 'Đọc đèn báo',
                  color: Colors.blue,
                  onTap: () {},
                ),
                _GuideCard(
                  icon: Icons.biotech_rounded,
                  title: 'Kiểm tra TDS',
                  color: Colors.green,
                  onTap: () {},
                ),
                _GuideCard(
                  icon: Icons.verified_user_outlined,
                  title: 'An toàn điện',
                  color: Colors.purple,
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _FAQItem extends StatelessWidget {
  final String question;
  final String answer;
  final bool isLast;

  const _FAQItem({required this.question, required this.answer, this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpansionTile(
          shape: const Border(),
          collapsedShape: const Border(),
          title: Text(
            question,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xff1e293b)),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: const TextStyle(fontSize: 13, color: Color(0xff64748b), height: 1.5),
              ),
            ),
          ],
        ),
        if (!isLast) const Divider(height: 1, indent: 20, endIndent: 20, color: Color(0xfff8fafc)),
      ],
    );
  }
}

class _GuideCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _GuideCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xfff1f5f9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xff1e293b)),
            ),
          ],
        ),
      ),
    );
  }
}
