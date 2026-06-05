import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';
import '../../profile/screens/stats_dashboard_screen.dart';

enum CalendarViewMode { day, week, month }

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen>
    with TickerProviderStateMixin {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;
  CalendarViewMode _viewMode = CalendarViewMode.month;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOut,
    ));
    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    super.dispose();
  }

  bool _isSameDay(DateTime d1, DateTime d2) =>
      d1.year == d2.year && d1.month == d2.month && d1.day == d2.day;

  /// Lấy danh sách jobs cho 1 ngày cụ thể
  List<JobModel> _getJobsForDay(DateTime day, List<JobModel> allJobs) {
    return allJobs.where((job) => _isSameDay(job.date, day)).toList();
  }

  Color _statusColor(JobModel job) => job.status.color;

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final allJobs = jobController.jobs;

    final selectedJobs = _getJobsForDay(_selectedDay, allJobs)
      ..sort((a, b) => a.appointmentTime.compareTo(b.appointmentTime));

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          _buildSliverAppBar(allJobs),
        ],
        body: selectedJobs.isEmpty
            ? _buildEmptyState()
            : SlideTransition(
                position: _slideAnimation,
                child: _buildJobList(selectedJobs),
              ),
      ),
    );
  }

  Widget _buildSliverAppBar(List<JobModel> allJobs) {
    return SliverToBoxAdapter(
      child: Container(
        color: Colors.white,
        child: Column(
          children: [
            // ── AppBar manual ──
            Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 8,
                left: 20,
                right: 20,
                bottom: 0,
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        DateFormat('MMMM yyyy', 'vi_VN').format(_focusedDay),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: AppColors.onSurface,
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        'Lịch làm việc của bạn',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Toggle format buttons
                  _buildFormatToggle(),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Card Hiệu suất & Thu nhập (to, chi tiết chỉ số)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildStatsCard(allJobs),
            ),
            const SizedBox(height: 12),

            // ── TableCalendar hoặc Day Navigation ──
            if (_viewMode == CalendarViewMode.day)
              _buildDayNavigation()
            else
              TableCalendar(
                locale: 'vi_VN',
                firstDay: DateTime.utc(2024, 1, 1),
                lastDay: DateTime.utc(2026, 12, 31),
              focusedDay: _focusedDay,
              calendarFormat: _calendarFormat,
              selectedDayPredicate: (day) => _isSameDay(day, _selectedDay),
              eventLoader: (day) => _getJobsForDay(day, allJobs),
              startingDayOfWeek: StartingDayOfWeek.monday,
              availableCalendarFormats: const {
                CalendarFormat.month: 'Tháng',
                CalendarFormat.twoWeeks: '2 tuần',
                CalendarFormat.week: 'Tuần',
              },
              onFormatChanged: (format) {
                setState(() => _calendarFormat = format);
              },
              onDaySelected: (selectedDay, focusedDay) {
                setState(() {
                  _selectedDay = selectedDay;
                  _focusedDay = focusedDay;
                });
                _slideController
                  ..reset()
                  ..forward();
              },
              onPageChanged: (focusedDay) {
                setState(() => _focusedDay = focusedDay);
              },
              headerVisible: false,
              daysOfWeekStyle: DaysOfWeekStyle(
                weekdayStyle: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xff94a3b8),
                ),
                weekendStyle: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.red.shade300,
                ),
                dowTextFormatter: (date, locale) =>
                    DateFormat.E(locale).format(date).toUpperCase(),
              ),
              calendarStyle: CalendarStyle(
                outsideDaysVisible: true,
                outsideTextStyle: const TextStyle(
                  color: Color(0xffcbd5e1),
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                defaultTextStyle: const TextStyle(
                  color: AppColors.onSurface,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
                weekendTextStyle: TextStyle(
                  color: Colors.red.shade400,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
                todayDecoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                todayTextStyle: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
                selectedDecoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                selectedTextStyle: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
                markerDecoration: const BoxDecoration(
                  color: Color(0xff10b981),
                  shape: BoxShape.circle,
                ),
                markerSize: 5,
                markersMaxCount: 3,
                markersOffset: const PositionedOffset(bottom: 2),
                cellMargin: const EdgeInsets.all(4),
              ),
              rowHeight: 46,
            ),

            // ── Month stats bar ──
            _buildMonthStats(allJobs),
            Container(height: 1, color: const Color(0xffe2e8f0)),
          ],
        ),
      ),
    );
  }

  Widget _buildFormatToggle() {
    final formats = [
      (CalendarViewMode.month, 'Tháng'),
      (CalendarViewMode.week, 'Tuần'),
      (CalendarViewMode.day, 'Ngày'),
    ];
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xfff1f5f9),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(3),
      child: Row(
        children: formats.map((f) {
          final isSelected = _viewMode == f.$1;
          return GestureDetector(
            onTap: () {
              setState(() {
                _viewMode = f.$1;
                if (_viewMode == CalendarViewMode.month) {
                  _calendarFormat = CalendarFormat.month;
                } else if (_viewMode == CalendarViewMode.week) {
                  _calendarFormat = CalendarFormat.week;
                }
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(9),
              ),
              child: Text(
                f.$2,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? Colors.white : const Color(0xff64748b),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDayNavigation() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left_rounded, color: AppColors.primary, size: 28),
            onPressed: () {
              setState(() {
                _selectedDay = _selectedDay.subtract(const Duration(days: 1));
                _focusedDay = _selectedDay;
              });
              _slideController
                ..reset()
                ..forward();
            },
          ),
          Column(
            children: [
              Text(
                DateFormat('EEEE', 'vi_VN').format(_selectedDay).toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('dd/MM/yyyy').format(_selectedDay),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: AppColors.onSurface,
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right_rounded, color: AppColors.primary, size: 28),
            onPressed: () {
              setState(() {
                _selectedDay = _selectedDay.add(const Duration(days: 1));
                _focusedDay = _selectedDay;
              });
              _slideController
                ..reset()
                ..forward();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard(List<JobModel> allJobs) {
    // Thống kê cho tháng đang hiển thị (_focusedDay.month)
    final monthJobs = allJobs.where((j) =>
        j.date.month == _focusedDay.month &&
        j.date.year == _focusedDay.year).toList();
    
    final completedCount = monthJobs.where((j) => j.status == JobStatus.completed).length;
    final inProgressCount = monthJobs.where((j) => j.status == JobStatus.installing || j.status == JobStatus.arrived || j.status == JobStatus.onTheWay).length;
    
    double totalEarnings = 0;
    for (var j in monthJobs) {
      if (j.status == JobStatus.completed) {
        totalEarnings += j.codAmount + j.tipAmount;
      }
    }

    final currencyFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xff0f172a), Color(0xff1e293b)], // Modern dark slate
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const StatsDashboardScreen(),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.analytics_rounded, color: Color(0xff38bdf8), size: 22),
                    const SizedBox(width: 8),
                    Text(
                      'HIỆU SUẤT & THU NHẬP THÁNG ${_focusedDay.month}',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Color(0xff94a3b8),
                        letterSpacing: 1.0,
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white60, size: 12),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    // Cột trái: Đơn hàng
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Hoàn thành',
                            style: TextStyle(fontSize: 11, color: Colors.white60, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$completedCount đơn',
                            style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Đang thực hiện',
                            style: TextStyle(fontSize: 11, color: Colors.white60, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$inProgressCount đơn',
                            style: const TextStyle(fontSize: 14, color: Color(0xff38bdf8), fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ),
                    Container(height: 50, width: 1, color: Colors.white10),
                    const SizedBox(width: 16),
                    // Cột phải: Thu nhập
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Tổng thu nhập',
                            style: TextStyle(fontSize: 11, color: Colors.white60, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            currencyFormatter.format(totalEarnings),
                            style: const TextStyle(
                              fontSize: 18,
                              color: Color(0xff4ade80),
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Nhận định tháng',
                            style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            completedCount >= 10
                                ? 'Xuất sắc'
                                : completedCount >= 5
                                    ? 'Ổn định'
                                    : 'Cần nỗ lực',
                            style: const TextStyle(fontSize: 12, color: Colors.white70, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMonthStats(List<JobModel> allJobs) {
    final monthJobs = allJobs.where((j) =>
        j.date.month == _focusedDay.month &&
        j.date.year == _focusedDay.year).toList();
    final completedCount = monthJobs.where((j) =>
        j.status.rawValue == 'hoan_thanh').length;
    final pendingCount = monthJobs.length - completedCount;

    final selectedCount = _getJobsForDay(_selectedDay, allJobs).length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          _statChip(
            icon: Icons.event_note_outlined,
            label: 'Tháng này',
            value: '${monthJobs.length} việc',
            color: AppColors.primary,
          ),
          const SizedBox(width: 8),
          _statChip(
            icon: Icons.check_circle_outline,
            label: 'Xong',
            value: '$completedCount',
            color: const Color(0xff10b981),
          ),
          const SizedBox(width: 8),
          _statChip(
            icon: Icons.pending_outlined,
            label: 'Còn lại',
            value: '$pendingCount',
            color: const Color(0xffea580c),
          ),
          const Spacer(),
          if (selectedCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '$selectedCount việc hôm nay',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _statChip({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    final isToday = _isSameDay(_selectedDay, DateTime.now());
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: const Color(0xfff1f5f9),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xffe2e8f0), width: 2),
            ),
            child: const Icon(
              Icons.event_available_outlined,
              size: 40,
              color: Color(0xff94a3b8),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isToday ? 'Hôm nay không có lịch hẹn' : 'Ngày này không có lịch',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Color(0xff475569),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            DateFormat('EEEE, dd/MM/yyyy', 'vi_VN').format(_selectedDay),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xff94a3b8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobList(List<JobModel> jobs) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      itemCount: jobs.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                Text(
                  DateFormat('EEEE, dd/MM', 'vi_VN').format(_selectedDay),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${jobs.length} công việc',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          );
        }
        final job = jobs[index - 1];
        final isLast = index == jobs.length;
        return _buildTimelineItem(job, isLast);
      },
    );
  }

  Widget _buildTimelineItem(JobModel job, bool isLast) {
    final timeParts = job.appointmentTime.split(' - ');
    final startTime = timeParts.isNotEmpty ? timeParts[0] : '';
    final endTime = timeParts.length > 1 ? timeParts[1] : '';
    final color = _statusColor(job);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Cột giờ ──
          SizedBox(
            width: 64,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  startTime,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onSurface,
                  ),
                ),
                if (endTime.isNotEmpty)
                  Text(
                    endTime,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Color(0xff94a3b8),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // ── Timeline dot + line ──
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 3),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 2),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [color.withValues(alpha: 0.4), const Color(0xffe2e8f0)],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),

          // ── Thẻ công việc ──
          Expanded(
            child: GestureDetector(
              onTap: () => Navigator.pushNamed(
                context,
                '/job-detail',
                arguments: job.id,
              ),
              child: Container(
                margin: EdgeInsets.only(bottom: isLast ? 0 : 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: color.withValues(alpha: 0.2),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: color.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Accent bar trên cùng
                      Container(
                        height: 3,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [color, color.withValues(alpha: 0.4)],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    job.customerName,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.onSurface,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    job.status.displayName,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: color,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.water_drop_outlined,
                                    size: 12, color: Color(0xff94a3b8)),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    job.productName,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xff64748b),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined,
                                    size: 12, color: Color(0xff94a3b8)),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    job.address,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xff94a3b8),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            if (job.codAmount > 0) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xff10b981).withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'COD: ${NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0).format(job.codAmount)}',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xff10b981),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
