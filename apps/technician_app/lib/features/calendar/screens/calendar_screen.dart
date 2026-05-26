import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late DateTime _selectedDate;
  late List<DateTime> _weekDays;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _generateWeekDays();
  }

  void _generateWeekDays() {
    final today = DateTime.now();
    // Tạo danh sách 7 ngày từ 3 ngày trước đến 3 ngày sau
    _weekDays = List.generate(7, (index) {
      return today.add(Duration(days: index - 3));
    });
  }

  bool _isSameDay(DateTime d1, DateTime d2) {
    return d1.year == d2.year && d1.month == d2.month && d1.day == d2.day;
  }

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();

    // Lọc công việc cho ngày được chọn
    final dayJobs = jobController.jobs.where((job) {
      return _isSameDay(job.date, _selectedDate);
    }).toList();

    // Sắp xếp theo giờ hẹn (sử dụng thời gian bắt đầu trong chuỗi '08:30 - 10:30')
    dayJobs.sort((a, b) => a.appointmentTime.compareTo(b.appointmentTime));

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('LỊCH LÀM VIỆC'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(90),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 16, top: 4),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: _weekDays.map((date) {
                  final isSelected = _isSameDay(date, _selectedDate);
                  final isToday = _isSameDay(date, DateTime.now());
                  final dayName = DateFormat('E', 'vi_VN').format(date).replaceAll('Th ', 'T');
                  final dayNumber = DateFormat('dd').format(date);

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedDate = date;
                      });
                    },
                    child: Container(
                      width: 50,
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary
                            : (isToday ? AppColors.primary.withOpacity(0.08) : Colors.transparent),
                        borderRadius: BorderRadius.circular(16),
                        border: isToday && !isSelected
                            ? Border.all(color: AppColors.primary.withOpacity(0.3), width: 1.5)
                            : null,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            dayName.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: isSelected
                                  ? Colors.white
                                  : (isToday ? AppColors.primary : const Color(0xff94a3b8)),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            dayNumber,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: isSelected
                                  ? Colors.white
                                  : (isToday ? AppColors.primary : AppColors.onSurface),
                            ),
                          ),
                          if (isToday) ...[
                            const SizedBox(height: 4),
                            Container(
                              width: 4,
                              height: 4,
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.white : AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
      body: dayJobs.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              itemCount: dayJobs.length,
              itemBuilder: (context, index) {
                final job = dayJobs[index];
                return _buildTimelineItem(job, index == dayJobs.length - 1);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xfff1f5f9), width: 2),
            ),
            child: const Icon(
              Icons.calendar_today_outlined,
              size: 40,
              color: Color(0xff94a3b8),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không có lịch hẹn lắp đặt',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xff64748b),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Lịch hẹn ngày ${DateFormat('dd/MM/yyyy').format(_selectedDate)} trống.',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xffcbd5e1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(JobModel job, bool isLast) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Cột thời gian bên trái
          SizedBox(
            width: 75,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job.appointmentTime.split(' - ')[0],
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onSurface,
                  ),
                ),
                Text(
                  'Đến ${job.appointmentTime.split(' - ')[1]}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xff94a3b8),
                  ),
                ),
              ],
            ),
          ),

          // Đường kẻ timeline ở giữa
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: job.status.color, width: 3),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: const Color(0xffe2e8f0),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),

          // Thẻ công việc bên phải
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 24),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xfff1f5f9)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: InkWell(
                onTap: () {
                  Navigator.pushNamed(context, '/job-detail', arguments: job.id);
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: job.status.color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            job.status.displayName,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: job.status.color,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      job.productName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xff475569),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      job.address,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Color(0xff94a3b8),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
