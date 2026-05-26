import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class NavigationViewScreen extends StatefulWidget {
  final String jobId;
  const NavigationViewScreen({super.key, required this.jobId});

  @override
  State<NavigationViewScreen> createState() => _NavigationViewScreenState();
}

class _NavigationViewScreenState extends State<NavigationViewScreen> {
  bool _isNavigating = false;
  bool _showMap = true;

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final job = jobController.jobs.firstWhere((j) => j.id == widget.jobId);

    return Scaffold(
      backgroundColor: const Color(0xff0f172a), // Dark theme for driving mode
      appBar: AppBar(
        backgroundColor: const Color(0xff1e293b),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'DẪN ĐƯỜNG DI CHUYỂN',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _showMap ? Icons.map_outlined : Icons.list_alt_outlined,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() => _showMap = !_showMap);
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Khung mô phỏng bản đồ hoặc Trạng thái lỗi map
          if (!_showMap)
            _buildListDirections(job)
          else
            _buildMapSimulation(job),

          // Lớp thông tin dẫn đường (Driving Dashboard)
          Positioned(
            left: 16,
            right: 16,
            bottom: 24,
            child: _buildNavigationDashboard(job),
          ),
        ],
      ),
    );
  }

  Widget _buildMapSimulation(JobModel job) {
    return Container(
      color: const Color(0xff0f172a),
      child: Stack(
        children: [
          // Vẽ lưới tọa độ giả
          Positioned.fill(
            child: CustomPaint(
              painter: GridPainter(),
            ),
          ),
          
          // Trục đường đi mô phỏng vẽ trên Canvas
          Positioned.fill(
            child: CustomPaint(
              painter: RoutePainter(isNavigating: _isNavigating),
            ),
          ),

          // Điểm xuất phát
          const Positioned(
            left: 60,
            bottom: 180,
            child: CircleAvatar(
              radius: 12,
              backgroundColor: AppColors.primary,
              child: Icon(Icons.my_location, color: Colors.white, size: 12),
            ),
          ),

          // Điểm đến (Khách hàng)
          Positioned(
            right: 80,
            top: 150,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    job.customerName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Icon(
                  Icons.location_on,
                  color: AppColors.error,
                  size: 32,
                ),
              ],
            ),
          ),

          if (!_isNavigating)
            Center(
              child: Container(
                padding: const EdgeInsets.all(24),
                margin: const EdgeInsets.symmetric(horizontal: 32),
                decoration: BoxDecoration(
                  color: const Color(0xff1e293b).withOpacity(0.95),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xff334155)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.gps_fixed, color: AppColors.primary, size: 40),
                    const SizedBox(height: 12),
                    const Text(
                      'Tín hiệu GPS sẵn sàng',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Mô phỏng đường đi: 5.2 km (Khoảng 12 phút)',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildListDirections(JobModel job) {
    final directions = [
      {'distance': 'Xuất phát', 'desc': 'Khởi hành từ cửa hàng AquaCare System.'},
      {'distance': 'Rẽ phải sau 200m', 'desc': 'Đi vào đường Phạm Hùng hướng về Khuất Duy Tiến.'},
      {'distance': 'Đi thẳng 2.5 km', 'desc': 'Đi qua ngã tư Trần Duy Hưng - Khuất Duy Tiến.'},
      {'distance': 'Rẽ trái tại ngã ba', 'desc': 'Vào đường Nguyễn Trãi hướng Tây Hà Đông.'},
      {'distance': 'Đến nơi sau 800m', 'desc': 'Điểm đến nhà khách hàng ${job.customerName} ở bên tay phải.'},
    ];

    return Container(
      color: const Color(0xff0f172a),
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 250),
      child: ListView.builder(
        itemCount: directions.length,
        itemBuilder: (context, index) {
          final step = directions[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppColors.primary.withOpacity(0.2),
                  child: Text(
                    (index + 1).toString(),
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step['distance']!,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        step['desc']!,
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 13, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildNavigationDashboard(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xff1e293b),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xff334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xff0f172a),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.directions_car, color: Color(0xff10b981), size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tuyến đường tối ưu nhất',
                      style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                    ),
                    SizedBox(height: 2),
                    Text(
                      '5.2 km • 12 phút',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Khách hàng: ${job.customerName}',
            style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          Text(
            job.address,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.w600),
          ),
          const Divider(height: 24, color: Color(0xff334155)),
          Row(
            children: [
              // CTA 1: Mở Google Maps ngoài
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Simulate launching external intent
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Đang mở ứng dụng Google Maps chỉ đường...'),
                        backgroundColor: Color(0xff10b981),
                      ),
                    );
                  },
                  icon: const Icon(Icons.launch, size: 18),
                  label: const Text('GOOGLE MAPS'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xff475569), width: 2),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              
              // CTA 2: Bắt đầu đi (Trong app)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _isNavigating = !_isNavigating;
                    });
                    if (_isNavigating) {
                      // Tự động cập nhật trạng thái đơn hàng thành "Đang di chuyển" nếu chưa có
                      if (job.status == JobStatus.waiting) {
                        context.read<JobController>().updateJobStatus(job.id, JobStatus.onTheWay);
                      }
                    }
                  },
                  icon: Icon(_isNavigating ? Icons.pause : Icons.navigation),
                  label: Text(_isNavigating ? 'TẠM DỪNG' : 'BẮT ĐẦU ĐI'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isNavigating ? const Color(0xffea580c) : AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xff1e293b).withOpacity(0.3)
      ..strokeWidth = 0.5;

    const step = 40.0;
    for (double i = 0; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class RoutePainter extends CustomPainter {
  final bool isNavigating;
  RoutePainter({required this.isNavigating});

  @override
  void paint(Canvas canvas, Size size) {
    final paintRoute = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(60, size.height - 180);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.5, size.width * 0.4, size.height * 0.4);
    path.lineTo(size.width * 0.7, size.height * 0.35);
    path.lineTo(size.width - 80, 182);

    canvas.drawPath(path, paintRoute);

    // Điểm đang di chuyển mô phỏng
    if (isNavigating) {
      final paintTech = Paint()
        ..color = const Color(0xff10b981)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(size.width * 0.4, size.height * 0.4), 8, paintTech);
    }
  }

  @override
  bool shouldRepaint(covariant RoutePainter oldDelegate) => oldDelegate.isNavigating != isNavigating;
}
