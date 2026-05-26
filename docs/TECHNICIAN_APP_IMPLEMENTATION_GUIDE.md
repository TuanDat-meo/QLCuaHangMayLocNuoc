# 🚀 Technician App — Implementation Guide

## Quick Start

### 1. Theme Setup (main.dart)

```dart
import 'package:flutter/material.dart';
import 'package:technician_app/core/theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaCare Technician',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      home: const SplashScreen(), // or AuthGate
    );
  }
}
```

### 2. Using Colors in Your Widgets

```dart
import 'package:technician_app/core/theme/app_theme.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.lightGray,
      child: Text(
        'Hello Technician',
        style: AppTypography.heading2,
      ),
    );
  }
}
```

### 3. Using Spacing System

```dart
import 'package:technician_app/core/theme/app_theme.dart';

class MyLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      child: Column(
        children: [
          Text('Title'),
          const SizedBox(height: AppSpacing.spacing12),
          Text('Subtitle'),
        ],
      ),
    );
  }
}
```

---

## Component Usage Examples

### Primary Button

```dart
import 'package:technician_app/core/widgets/common_widgets.dart';

PrimaryButton(
  label: 'Start Navigation',
  onPressed: () {
    // Handle navigation
  },
  width: double.infinity,
  icon: Icons.navigation,
)
```

### Secondary Button

```dart
SecondaryButton(
  label: 'Cancel',
  onPressed: () {
    Navigator.pop(context);
  },
  color: AppColors.errorColor,
)
```

### Status Chip

```dart
StatusChip(
  label: 'COMPLETED',
  backgroundColor: AppColors.statusCompleted,
  borderColor: AppColors.statusCompleted,
  textColor: AppColors.statusCompleted,
  filled: true,
)
```

### Job Card

```dart
JobCard(
  jobId: 'JOB-12345',
  customerName: 'Nguyen Van A',
  customerPhone: '0912345678',
  address: '123 Nguyen Hue St, District 1, HCMC',
  status: 'Waiting',
  statusColor: AppColors.statusWaiting,
  priority: 1,
  timeRemaining: '50 mins remaining',
  isUrgent: true,
  onNavigate: () {
    // Open maps
  },
  onViewDetails: () {
    // Navigate to detail screen
  },
  onCall: () {
    // Launch phone call
  },
)
```

### Status Timeline

```dart
JobStatusTimeline(
  statuses: [
    'Waiting',
    'On the Way',
    'Arrived',
    'Installing',
    'Completed',
  ],
  currentStatusIndex: 1, // On the Way
  statusColors: [
    AppColors.statusWaiting,
    AppColors.statusOnWay,
    AppColors.statusArrived,
    AppColors.statusInstalling,
    AppColors.statusCompleted,
  ],
)
```

### Empty State

```dart
EmptyStateWidget(
  title: 'All Done!',
  subtitle: 'No more jobs scheduled for today',
  icon: Icons.celebration_outlined,
  actionText: 'Go Offline',
  actionLabel: () {
    // Handle offline
  },
)
```

---

## Screen Implementation Templates

### Screen Structure (Best Practice)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:technician_app/core/theme/app_theme.dart';
import 'package:technician_app/core/widgets/common_widgets.dart';

class MyScreen extends StatefulWidget {
  const MyScreen({super.key});

  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  @override
  void initState() {
    super.initState();
    // Load data
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBarWidget(
        title: 'My Screen',
        onBackPressed: () => Navigator.pop(context),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              // Show menu
            },
          ),
        ],
      ),
      body: SafeArea(
        child: _buildBody(),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      child: Column(
        children: [
          // Your content here
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    // Optional bottom navigation
    return null;
  }
}
```

### Home Screen Template

```dart
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBarWidget(
        title: 'Home',
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Navigate to notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Refresh job list
        },
        child: _buildJobList(),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Go offline or other action
        },
        label: const Text('Status'),
        icon: const Icon(Icons.circle),
        backgroundColor: AppColors.primaryBlue,
      ),
    );
  }

  Widget _buildJobList() {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      children: [
        // Quick stats
        _buildQuickStats(),
        const SizedBox(height: AppSpacing.spacing20),
        
        // Upcoming jobs
        Text('Upcoming Jobs', style: AppTypography.heading3),
        const SizedBox(height: AppSpacing.spacing12),
        // Job cards
      ],
    );
  }

  Widget _buildQuickStats() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard('Today', '4', 'jobs'),
        ),
        const SizedBox(width: AppSpacing.spacing12),
        Expanded(
          child: _buildStatCard('In Way', '1', 'job'),
        ),
        const SizedBox(width: AppSpacing.spacing12),
        Expanded(
          child: _buildStatCard('Complete', '2', 'jobs'),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String count, String label) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.spacing12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.medium),
        border: Border.all(color: AppColors.borderColor),
        boxShadow: const [AppShadows.card],
      ),
      child: Column(
        children: [
          Text(
            count,
            style: AppTypography.heading2.copyWith(
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.spacing4),
          Text(
            '$label\n$title',
            textAlign: TextAlign.center,
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }
}
```

### Job Detail Screen Template

```dart
class JobDetailScreen extends StatefulWidget {
  final String jobId;

  const JobDetailScreen({
    super.key,
    required this.jobId,
  });

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  late Future<JobDetail> _jobFuture;

  @override
  void initState() {
    super.initState();
    _jobFuture = _loadJobDetails();
  }

  Future<JobDetail> _loadJobDetails() {
    // Fetch from API/Firebase
    return Future.delayed(Duration.zero);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBarWidget(
        title: 'Job Details',
        onBackPressed: () => Navigator.pop(context),
      ),
      body: FutureBuilder<JobDetail>(
        future: _jobFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: LoadingSpinner());
          }

          if (snapshot.hasError) {
            return Center(
              child: EmptyStateWidget(
                title: 'Error',
                subtitle: 'Failed to load job details',
                icon: Icons.error_outline,
              ),
            );
          }

          final job = snapshot.data!;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status banner
                _buildStatusBanner(job),
                const SizedBox(height: AppSpacing.spacing20),

                // Customer info
                _buildCustomerInfo(job),
                const SizedBox(height: AppSpacing.spacing20),

                // Order details
                _buildOrderDetails(job),
                const SizedBox(height: AppSpacing.spacing20),

                // Timeline
                _buildTimeline(job),
                const SizedBox(height: AppSpacing.spacing32),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: _buildActionButtons(),
    );
  }

  Widget _buildStatusBanner(JobDetail job) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      decoration: BoxDecoration(
        color: AppColors.statusWaiting.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppRadius.large),
        border: Border.all(color: AppColors.statusWaiting.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: AppColors.statusWaiting,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AppSpacing.spacing12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STATUS: WAITING',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  'Priority 1 • ID: ${job.jobId}',
                  style: AppTypography.caption,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerInfo(JobDetail job) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.large),
        border: Border.all(color: AppColors.borderColor),
        boxShadow: const [AppShadows.card],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Customer Information',
            style: AppTypography.heading4,
          ),
          const SizedBox(height: AppSpacing.spacing12),
          _infoRow('👤', job.customerName),
          _infoRow('📱', job.customerPhone),
          _infoRow('📧', job.customerEmail),
          const SizedBox(height: AppSpacing.spacing12),
          _infoRow('📍', job.address),
        ],
      ),
    );
  }

  Widget _infoRow(String icon, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.spacing8),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: AppSpacing.spacing12),
          Expanded(
            child: Text(
              value,
              style: AppTypography.bodyMedium,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderDetails(JobDetail job) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.large),
        border: Border.all(color: AppColors.borderColor),
        boxShadow: const [AppShadows.card],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Order Details',
            style: AppTypography.heading4,
          ),
          const SizedBox(height: AppSpacing.spacing16),
          // Add order details here
        ],
      ),
    );
  }

  Widget _buildTimeline(JobDetail job) {
    return JobStatusTimeline(
      statuses: ['Waiting', 'On the Way', 'Installing', 'Completed'],
      currentStatusIndex: 0,
      statusColors: [
        AppColors.statusWaiting,
        AppColors.statusOnWay,
        AppColors.statusInstalling,
        AppColors.statusCompleted,
      ],
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            child: PrimaryButton(
              label: 'Update Status',
              onPressed: () {
                // Show status update modal
              },
            ),
          ),
          const SizedBox(height: AppSpacing.spacing12),
          SizedBox(
            width: double.infinity,
            child: SecondaryButton(
              label: 'Report Issue',
              onPressed: () {
                // Navigate to issue report
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Navigation Flow

### Using Go Router (Recommended)

```dart
final routerConfig = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
      routes: [
        GoRoute(
          path: 'job/:jobId',
          builder: (context, state) => JobDetailScreen(
            jobId: state.pathParameters['jobId']!,
          ),
        ),
        GoRoute(
          path: 'schedule',
          builder: (context, state) => const ScheduleScreen(),
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
  ],
);
```

---

## State Management (Provider Pattern)

### Job Controller

```dart
class JobController extends ChangeNotifier {
  final FirestoreService _firestoreService;

  List<JobDetail> _jobs = [];
  JobDetail? _selectedJob;
  bool _isLoading = false;
  String? _error;

  JobController({required FirestoreService firestoreService})
      : _firestoreService = firestoreService;

  List<JobDetail> get jobs => _jobs;
  JobDetail? get selectedJob => _selectedJob;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchTodayJobs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _jobs = await _firestoreService.getTodayJobs();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateJobStatus(
    String jobId,
    JobStatus status,
  ) async {
    try {
      await _firestoreService.updateJobStatus(jobId, status);
      // Update local state
      final index = _jobs.indexWhere((j) => j.jobId == jobId);
      if (index != -1) {
        _jobs[index] = _jobs[index].copyWith(status: status);
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> selectJob(String jobId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedJob = await _firestoreService.getJobDetail(jobId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### Using in Widgets

```dart
class MyJobWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<JobController>(
      builder: (context, jobController, child) {
        if (jobController.isLoading) {
          return const LoadingSpinner();
        }

        if (jobController.error != null) {
          return InfoBanner(
            message: 'Error: ${jobController.error}',
            backgroundColor: AppColors.errorColor.withOpacity(0.15),
            textColor: AppColors.errorColor,
            iconColor: AppColors.errorColor,
            icon: Icons.error_outline,
          );
        }

        return ListView.builder(
          itemCount: jobController.jobs.length,
          itemBuilder: (context, index) {
            final job = jobController.jobs[index];
            return JobCard(
              jobId: job.jobId,
              customerName: job.customerName,
              customerPhone: job.customerPhone,
              address: job.address,
              status: job.status.name,
              statusColor: _getStatusColor(job.status),
              priority: job.priority,
              timeRemaining: _calculateTimeRemaining(job.appointmentTime),
              onNavigate: () {
                // Navigate
              },
              onViewDetails: () {
                jobController.selectJob(job.jobId);
              },
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(JobStatus status) {
    // Your logic
    return AppColors.statusWaiting;
  }

  String _calculateTimeRemaining(DateTime appointmentTime) {
    // Your logic
    return '50 mins remaining';
  }
}
```

---

## Form Validation

### Form Validation Helpers

```dart
class FormValidation {
  static String? validateEmail(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Email is required';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
        .hasMatch(value!)) {
      return 'Invalid email format';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Password is required';
    }
    if (value!.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain uppercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain number';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Phone number is required';
    }
    if (!RegExp(r'^[0-9]{10}$').hasMatch(value!)) {
      return 'Phone number must be 10 digits';
    }
    return null;
  }

  static String? validateAmount(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Amount is required';
    }
    try {
      double.parse(value!);
      return null;
    } catch (e) {
      return 'Invalid amount';
    }
  }
}
```

### Using in Forms

```dart
TextFormField(
  controller: _emailController,
  decoration: InputDecoration(
    labelText: 'Email',
    prefixIcon: const Icon(Icons.email_outlined),
  ),
  validator: FormValidation.validateEmail,
)
```

---

## Performance Tips

1. **Use const constructor whenever possible**
   ```dart
   const PrimaryButton(...)
   ```

2. **Lazy load images**
   ```dart
   Image.network(
     url,
     cacheHeight: 300,
     cacheWidth: 300,
   )
   ```

3. **Use RepaintBoundary for heavy widgets**
   ```dart
   RepaintBoundary(
     child: HeavyWidget(),
   )
   ```

4. **Minimize rebuilds with ChangeNotifier**
   ```dart
   notifyListeners(); // Only when necessary
   ```

5. **Use FutureBuilder for async data**
   ```dart
   FutureBuilder<Data>(
     future: _future,
     builder: (context, snapshot) { ... }
   )
   ```

---

## Accessibility Guidelines

1. **Semantic labels for screen readers**
   ```dart
   Semantics(
     label: 'Navigate to job',
     button: true,
     onTap: () {},
   )
   ```

2. **Sufficient color contrast**
   - Minimum WCAG AA contrast ratio: 4.5:1
   - Our color palette meets this standard

3. **Touch targets minimum 44x44dp**
   ```dart
   SizedBox(
     width: 44,
     height: 44,
     child: Material(
       child: InkWell(...),
     ),
   )
   ```

4. **Meaningful error messages**
   ```dart
   'Email must be in format: name@example.com'
   ```

---

## Testing

### Widget Testing Example

```dart
void main() {
  testWidgets('Primary Button renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: PrimaryButton(
            label: 'Test',
            onPressed: () {},
          ),
        ),
      ),
    );

    expect(find.text('Test'), findsOneWidget);
    expect(
      find.byType(ElevatedButton),
      findsOneWidget,
    );
  });
}
```

### Integration Testing

```dart
void main() {
  group('Job Detail Screen', () {
    testWidgets('Load and display job', (WidgetTester tester) async {
      // Setup
      await tester.pumpWidget(const MyApp());
      
      // Load
      await tester.pumpAndSettle();
      
      // Verify
      expect(find.text('Job Details'), findsOneWidget);
    });
  });
}
```

---

## Troubleshooting

### Common Issues

1. **Colors not showing**
   - Ensure you're using `AppColors.*` constants
   - Check if ThemeData is properly configured

2. **Spacing not consistent**
   - Always use `AppSpacing.*` constants
   - Never hardcode pixel values

3. **Buttons not responding**
   - Ensure `onPressed` callback is provided
   - Check if `isEnabled` is true

4. **Text overflowing**
   - Use `overflow: TextOverflow.ellipsis`
   - Wrap in `Expanded` widget
   - Use `maxLines` parameter

---

## Additional Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Material 3 Design](https://m3.material.io/)
- [Firebase Documentation](https://firebase.flutter.dev/)
- [Provider Package](https://pub.dev/packages/provider)

