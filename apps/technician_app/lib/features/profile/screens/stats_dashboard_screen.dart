import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class StatsDashboardScreen extends StatefulWidget {
  const StatsDashboardScreen({super.key});

  @override
  State<StatsDashboardScreen> createState() => _StatsDashboardScreenState();
}

class _StatsDashboardScreenState extends State<StatsDashboardScreen> {
  int _selectedPeriod = 0; // 0: 7 ngày qua, 1: Tháng này, 2: Tất cả

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final allJobs = jobController.jobs;

    // Lọc danh sách công việc theo chu kỳ chọn lựa
    final now = DateTime.now();
    final filteredJobs = allJobs.where((job) {
      if (_selectedPeriod == 0) {
        // 7 ngày qua
        final diff = now.difference(job.date).inDays;
        return diff >= 0 && diff < 7;
      } else if (_selectedPeriod == 1) {
        // Tháng này
        return job.date.month == now.month && job.date.year == now.year;
      }
      return true; // Tất cả
    }).toList();

    // ── Tính toán các chỉ số ──────────────────────────────────────────────
    final completedCount = filteredJobs.where((j) => j.status == JobStatus.completed).length;
    final inProgressCount = filteredJobs.where((j) => j.status == JobStatus.onTheWay || j.status == JobStatus.installing || j.status == JobStatus.arrived).length;
    final waitingCount = filteredJobs.where((j) => j.status == JobStatus.waiting).length;
    final issueCount = filteredJobs.where((j) => j.status == JobStatus.needSupport).length;

    double totalCod = 0;
    double totalTip = 0;
    double totalVatTu = 0;

    for (var job in filteredJobs) {
      if (job.status == JobStatus.completed) {
        totalCod += job.codAmount;
        totalTip += job.tipAmount;
        // Phụ thu vật tư phát sinh
        for (var vt in job.vatTuPhatSinh) {
          final price = vt['price'] ?? 0;
          final qty = vt['quantity'] ?? 0;
          totalVatTu += price * qty;
        }
      }
    }

    final currencyFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('THỐNG KÊ HIỆU SUẤT'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Bộ chọn chu kỳ ──────────────────────────────────────────────
            _buildPeriodSelector(),
            const SizedBox(height: 16),

            // ── Thẻ Tổng Quan Chỉ Số ──────────────────────────────────────────
            _buildStatSummaryCards(
              completedCount: completedCount,
              totalCod: totalCod,
              totalTip: totalTip,
              currencyFormatter: currencyFormatter,
            ),
            const SizedBox(height: 16),

            // ── Chi tiết thu nhập ─────────────────────────────────────────────
            _buildIncomeDetailCard(
              totalCod: totalCod,
              totalTip: totalTip,
              totalVatTu: totalVatTu,
              currencyFormatter: currencyFormatter,
            ),
            const SizedBox(height: 16),

            // ── Biểu đồ phân bổ trạng thái (Pie Chart) ───────────────────────
            _buildStatusPieChartCard(
              completed: completedCount,
              inProgress: inProgressCount,
              waiting: waitingCount,
              issue: issueCount,
            ),
            const SizedBox(height: 16),

            // ── Biểu đồ cột hiệu suất 7 ngày (Bar Chart) ─────────────────────
            if (_selectedPeriod == 0) ...[
              _buildDailyPerformanceBarChart(allJobs),
              const SizedBox(height: 16),
            ],

            // ── Tip ghi điểm: Nhận xét hiệu quả ──────────────────────────────
            _buildPerformanceRatingCard(completedCount, issueCount),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // ── 1. Bộ chọn chu kỳ ──────────────────────────────────────────────
  Widget _buildPeriodSelector() {
    final List<String> periods = ['7 ngày qua', 'Tháng này', 'Tất cả'];
    return Container(
      height: 48,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xffe2e8f0)),
      ),
      child: Row(
        children: List.generate(periods.length, (index) {
          final isSelected = _selectedPeriod == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedPeriod = index),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  periods[index],
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? Colors.white : const Color(0xff64748b),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ── 2. Thẻ Tổng Quan Chỉ Số ──────────────────────────────────────────
  Widget _buildStatSummaryCards({
    required int completedCount,
    required double totalCod,
    required double totalTip,
    required NumberFormat currencyFormatter,
  }) {
    return Row(
      children: [
        // Hoàn thành
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xff0d9488), Color(0xff14b8a6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xff0d9488).withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_outline, color: Colors.white, size: 24),
                const SizedBox(height: 12),
                const Text(
                  'Đã hoàn thành',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '$completedCount đơn',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Tổng tiền thu hộ + Tip
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, Color(0xff38bdf8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.account_balance_wallet_outlined, color: Colors.white, size: 24),
                const SizedBox(height: 12),
                const Text(
                  'Thu nhập & Thu hộ',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  currencyFormatter.format(totalCod + totalTip),
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 3. Chi tiết thu nhập ─────────────────────────────────────────────
  Widget _buildIncomeDetailCard({
    required double totalCod,
    required double totalTip,
    required double totalVatTu,
    required NumberFormat currencyFormatter,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'CHI TIẾT DÒNG TIỀN THU NHẬN',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 16),
          _buildIncomeRow(
            icon: Icons.payments_outlined,
            title: 'Tiền thu hộ khách hàng (COD)',
            amount: currencyFormatter.format(totalCod),
            color: const Color(0xff0ea5e9),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(height: 1, color: Color(0xfff1f5f9)),
          ),
          _buildIncomeRow(
            icon: Icons.volunteer_activism_outlined,
            title: 'Tiền bồi dưỡng (Tip)',
            amount: currencyFormatter.format(totalTip),
            color: const Color(0xffe11d48),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(height: 1, color: Color(0xfff1f5f9)),
          ),
          _buildIncomeRow(
            icon: Icons.plumbing_outlined,
            title: 'Phụ thu linh kiện phát sinh',
            amount: currencyFormatter.format(totalVatTu),
            color: const Color(0xffca8a04),
          ),
        ],
      ),
    );
  }

  Widget _buildIncomeRow({
    required IconData icon,
    required String title,
    required String amount,
    required Color color,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xff475569)),
          ),
        ),
        Text(
          amount,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.onSurface),
        ),
      ],
    );
  }

  // ── 4. Biểu đồ phân bổ trạng thái (Pie Chart) ───────────────────────
  Widget _buildStatusPieChartCard({
    required int completed,
    required int inProgress,
    required int waiting,
    required int issue,
  }) {
    final total = completed + inProgress + waiting + issue;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PHÂN BỔ TRẠNG THÁI NHIỆM VỤ',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 20),
          if (total == 0)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text(
                  'Không có dữ liệu trong khoảng thời gian này',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
                ),
              ),
            )
          else
            Row(
              children: [
                // Pie Chart
                SizedBox(
                  width: 130,
                  height: 130,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 35,
                      sections: [
                        PieChartSectionData(
                          color: const Color(0xff10b981),
                          value: completed.toDouble(),
                          title: completed > 0 ? '$completed' : '',
                          radius: 30,
                          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        PieChartSectionData(
                          color: AppColors.primary,
                          value: inProgress.toDouble(),
                          title: inProgress > 0 ? '$inProgress' : '',
                          radius: 30,
                          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        PieChartSectionData(
                          color: const Color(0xffe2e8f0),
                          value: waiting.toDouble(),
                          title: waiting > 0 ? '$waiting' : '',
                          radius: 30,
                          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff475569)),
                        ),
                        PieChartSectionData(
                          color: const Color(0xffef4444),
                          value: issue.toDouble(),
                          title: issue > 0 ? '$issue' : '',
                          radius: 30,
                          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                // Legend labels
                Expanded(
                  child: Column(
                    children: [
                      _buildLegendItem('Hoàn thành', const Color(0xff10b981), completed, total),
                      const SizedBox(height: 6),
                      _buildLegendItem('Đang xử lý', AppColors.primary, inProgress, total),
                      const SizedBox(height: 6),
                      _buildLegendItem('Chờ thực hiện', const Color(0xffcbd5e1), waiting, total),
                      const SizedBox(height: 6),
                      _buildLegendItem('Gặp sự cố', const Color(0xffef4444), issue, total),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, int count, int total) {
    final pct = total > 0 ? (count / total * 100).toStringAsFixed(0) : '0';
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff475569)),
          ),
        ),
        Text(
          '$count ($pct%)',
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xff94a3b8)),
        ),
      ],
    );
  }

  // ── 5. Biểu đồ cột hiệu suất 7 ngày (Bar Chart) ─────────────────────
  Widget _buildDailyPerformanceBarChart(List<JobModel> allJobs) {
    // Tạo mốc 7 ngày qua
    final List<DateTime> last7Days = List.generate(7, (i) {
      final d = DateTime.now().subtract(Duration(days: 6 - i));
      return DateTime(d.year, d.month, d.day);
    });

    final Map<DateTime, int> dayCounts = {for (var d in last7Days) d: 0};

    for (var job in allJobs) {
      if (job.status == JobStatus.completed) {
        final jobDay = DateTime(job.date.year, job.date.month, job.date.day);
        if (dayCounts.containsKey(jobDay)) {
          dayCounts[jobDay] = dayCounts[jobDay]! + 1;
        }
      }
    }

    final barGroups = List.generate(7, (index) {
      final day = last7Days[index];
      final count = dayCounts[day] ?? 0;
      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: count.toDouble(),
            color: AppColors.primary,
            width: 14,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      );
    });

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'HIỆU SUẤT ĐƠN HOÀN THÀNH 7 NGÀY QUA',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 150,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 6,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= 7) return const SizedBox();
                        final date = last7Days[index];
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            DateFormat('dd/MM').format(date),
                            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: barGroups,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── 6. Nhận xét hiệu quả (Ghi điểm) ──────────────────────────────
  Widget _buildPerformanceRatingCard(int completed, int issues) {
    String title = 'Hiệu suất ổn định';
    String description = 'Duy trì phong độ hiện tại để nhận các đơn hàng có điểm thưởng cao hơn.';
    IconData icon = Icons.trending_flat;
    Color color = const Color(0xff0ea5e9);

    if (completed >= 5 && issues == 0) {
      title = 'Kỹ thuật viên xuất sắc!';
      description = 'Tỷ lệ đơn lỗi 0% với năng suất làm việc vượt trội. Admin sẽ ưu tiên phân các dự án lớn.';
      icon = Icons.emoji_events;
      color = const Color(0xffeab308);
    } else if (issues > 1) {
      title = 'Cần chú ý hỗ trợ';
      description = 'Đang có nhiều hơn 1 đơn phát sinh sự cố. Vui lòng liên hệ Admin nếu cần hỗ trợ kỹ thuật.';
      icon = Icons.report_problem;
      color = const Color(0xfff43f5e);
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: color),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff475569), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
