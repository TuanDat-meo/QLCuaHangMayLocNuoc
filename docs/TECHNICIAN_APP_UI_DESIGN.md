# 📱 Technician App — UI/UX Design Specification

## 🎨 Design System (Matching Customer App)

### Color Palette

```dart
// Primary Colors
const Color primaryBlue = Color(0xff00459a);      // #00459A — Main brand color
const Color darkNavy = Color(0xff0b1c30);          // #0B1C30 — Secondary, text
const Color lightGray = Color(0xfff8fafc);         // #F8FAFC — Surface background

// Status Colors
const Color statusWaiting = Color(0xffFFA500);    // Orange — Waiting
const Color statusOnWay = Color(0xff00459a);      // Blue — On the way
const Color statusInstalling = Color(0xff7C3AED); // Purple — Installing
const Color statusCompleted = Color(0xff10B981);  // Green — Completed
const Color statusNeedSupport = Color(0xffEF4444); // Red — Need support

// Neutral & Semantic
const Color textPrimary = Color(0xff0b1c30);      // Dark Navy
const Color textSecondary = Color(0xff64748b);    // Gray
const Color borderColor = Color(0xffe2e8f0);      // Light border
const Color errorColor = Color(0xffEF4444);       // Error
const Color warningColor = Color(0xffFFA500);     // Warning
const Color successColor = Color(0xff10B981);     // Success
```

### Typography

```dart
// Heading
TextStyle heading1 = TextStyle(
  fontSize: 28,
  fontWeight: FontWeight.w900,
  color: darkNavy,
  letterSpacing: -0.5,
);

TextStyle heading2 = TextStyle(
  fontSize: 24,
  fontWeight: FontWeight.w900,
  color: darkNavy,
);

TextStyle heading3 = TextStyle(
  fontSize: 20,
  fontWeight: FontWeight.w900,
  color: darkNavy,
);

// Body
TextStyle bodyLarge = TextStyle(
  fontSize: 16,
  fontWeight: FontWeight.w500,
  color: textPrimary,
);

TextStyle bodyMedium = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.w500,
  color: textPrimary,
);

TextStyle bodySmall = TextStyle(
  fontSize: 12,
  fontWeight: FontWeight.w400,
  color: textSecondary,
);

// Caption
TextStyle caption = TextStyle(
  fontSize: 11,
  fontWeight: FontWeight.w400,
  color: textSecondary,
);
```

### Spacing System

```dart
// Base: 8px grid
const double spacing4 = 4;
const double spacing8 = 8;
const double spacing12 = 12;
const double spacing16 = 16;
const double spacing20 = 20;
const double spacing24 = 24;
const double spacing32 = 32;
const double spacing48 = 48;
```

### Border Radius

```dart
// Consistent with Customer App
const double borderRadiusSmall = 8;   // Small elements
const double borderRadiusMedium = 12; // Inputs, buttons
const double borderRadiusLarge = 16;  // Cards
const double borderRadiusXL = 24;     // Large components
```

### Shadows

```dart
// Card shadow
BoxShadow cardShadow = BoxShadow(
  color: Colors.black.withOpacity(0.05),
  blurRadius: 8,
  offset: const Offset(0, 2),
);

// Elevated button shadow
BoxShadow buttonShadow = BoxShadow(
  color: primaryBlue.withOpacity(0.2),
  blurRadius: 12,
  offset: const Offset(0, 4),
);
```

### Component Styles

#### Buttons

**Primary Button (CTA)**
```dart
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: primaryBlue,
    foregroundColor: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
    padding: const EdgeInsets.symmetric(
      vertical: 16,
      horizontal: 24,
    ),
    elevation: 4,
  ),
  onPressed: () {},
  child: const Text(
    'Confirm',
    style: TextStyle(
      fontSize: 15,
      fontWeight: FontWeight.w900,
    ),
  ),
)
```

**Secondary Button**
```dart
OutlinedButton(
  style: OutlinedButton.styleFrom(
    side: const BorderSide(color: primaryBlue, width: 2),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
    padding: const EdgeInsets.symmetric(
      vertical: 16,
      horizontal: 24,
    ),
  ),
  onPressed: () {},
  child: const Text(
    'Cancel',
    style: TextStyle(
      color: primaryBlue,
      fontSize: 15,
      fontWeight: FontWeight.w900,
    ),
  ),
)
```

**Small Action Button (Status Update)**
```dart
SizedBox(
  width: double.infinity,
  child: ElevatedButton(
    style: ElevatedButton.styleFrom(
      backgroundColor: statusOnWay,
      padding: const EdgeInsets.symmetric(vertical: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    onPressed: () {},
    child: const Text('On the Way'),
  ),
)
```

#### Input Fields

```dart
TextFormField(
  decoration: InputDecoration(
    hintText: 'Search jobs',
    labelText: 'Search',
    prefixIcon: const Icon(Icons.search),
    suffixIcon: _searchText.isNotEmpty
        ? IconButton(
            icon: const Icon(Icons.clear),
            onPressed: () {},
          )
        : null,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: borderColor),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: borderColor),
    ),
    contentPadding: const EdgeInsets.symmetric(
      vertical: 14,
      horizontal: 16,
    ),
  ),
)
```

#### Status Chips

```dart
Container(
  padding: const EdgeInsets.symmetric(
    horizontal: 12,
    vertical: 6,
  ),
  decoration: BoxDecoration(
    color: statusCompleted.withOpacity(0.15),
    border: Border.all(color: statusCompleted.withOpacity(0.3)),
    borderRadius: BorderRadius.circular(8),
  ),
  child: Text(
    'Completed',
    style: TextStyle(
      color: statusCompleted,
      fontWeight: FontWeight.w700,
      fontSize: 12,
    ),
  ),
)
```

#### Cards

```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: borderColor,
      width: 1,
    ),
    boxShadow: [cardShadow],
  ),
  padding: const EdgeInsets.all(16),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Content
    ],
  ),
)
```

#### Bottom Navigation

```dart
BottomNavigationBar(
  backgroundColor: Colors.white,
  selectedItemColor: primaryBlue,
  unselectedItemColor: textSecondary,
  showUnselectedLabels: true,
  elevation: 8,
  items: const [
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: 'Home',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.calendar_today),
      label: 'Schedule',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.account_circle),
      label: 'Profile',
    ),
  ],
)
```

---

## 📱 Screen Designs & User Flows

### 1. AUTHENTICATION FLOW

#### 1.1 Splash Screen
**Duration:** 2-3 seconds auto-dismiss

```
┌─────────────────────────────────┐
│                                 │
│           [LOGO]                │
│        AquaCare Tech             │
│                                 │
│      "Serving you better"       │
│                                 │
│     [Loading indicator]          │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- Logo centered
- App name (heading2 style, darkNavy)
- Tagline (bodySmall, textSecondary)
- Loading indicator (primaryBlue)
- Fade-out animation (500ms)

**Dart Implementation Pattern:**
```dart
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    Future.delayed(const Duration(seconds: 2), () {
      _fadeController.forward().then((_) {
        if (mounted) {
          // Navigate based on auth state
          // context.go('/home') or context.go('/login')
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: lightGray,
      body: FadeTransition(
        opacity: _fadeController.drive(
          Tween<double>(begin: 1, end: 0),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/logo.png', width: 80),
              const SizedBox(height: spacing20),
              Text(
                'AquaCare Tech',
                style: heading2,
              ),
              const SizedBox(height: spacing12),
              Text(
                'Serving you better',
                style: bodySmall,
              ),
              const SizedBox(height: spacing32),
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryBlue),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }
}
```

---

#### 1.2 Login Screen

```
┌─────────────────────────────────┐
│                                 │
│      Back Arrow  [Technician]   │
│                                 │
│      Welcome Back!              │
│    Sign in to your account      │
│                                 │
│  [📧 Email Input]               │
│  [🔒 Password Input]            │
│                                 │
│  [ ] Remember me       [?]      │
│                                 │
│  [Sign In Button]               │
│                                 │
│  Forgot password?               │
│                                 │
└─────────────────────────────────┘
```

**Key Features:**
- Email input with validation
- Password field with show/hide toggle
- Remember me checkbox
- Forgot password link
- Error state handling
- Account lock countdown (after 5 failed attempts)
- Loading state during authentication

**Input Fields:**
- Border radius: 12px
- Padding: vertical 14px, horizontal 16px
- Font size: 14px (bodyMedium)
- Icon color: textSecondary
- Border color: borderColor (default), primaryBlue (focused), errorColor (error)

**Button:**
- Full width
- Padding: vertical 16px
- Border radius: 16px
- Font: W900, 15px

**Error Handling:**
```dart
// Email validation
String? _validateEmail(String? value) {
  if (value?.isEmpty ?? true) return 'Email is required';
  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value!)) {
    return 'Invalid email format';
  }
  return null;
}

// Password validation
String? _validatePassword(String? value) {
  if (value?.isEmpty ?? true) return 'Password is required';
  if (value!.length < 6) return 'Password must be at least 6 characters';
  return null;
}

// Account lock (after 5 failed attempts)
if (_failedAttempts >= 5) {
  _lockoutEndTime = DateTime.now().add(const Duration(minutes: 15));
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: const Text(
        'Account locked for 15 minutes due to multiple failed login attempts',
      ),
      backgroundColor: errorColor,
      duration: const Duration(seconds: 5),
    ),
  );
}
```

**Loading State:**
```dart
Opacity(
  opacity: _isLoading ? 0.6 : 1.0,
  child: IgnorePointer(
    ignoring: _isLoading,
    child: ElevatedButton(
      onPressed: _isLoading ? null : _handleLogin,
      child: _isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                strokeWidth: 2,
              ),
            )
          : const Text('Sign In'),
    ),
  ),
)
```

---

#### 1.3 Forgot Password Flow

**Screen 1: Enter Email**
```
┌─────────────────────────────────┐
│  ← Back              Forgot Password
│                                 │
│   Enter your email address      │
│   to reset your password        │
│                                 │
│  [📧 Email Input]               │
│                                 │
│  [Send OTP Button]              │
│                                 │
│  Back to login                  │
│                                 │
└─────────────────────────────────┘
```

**Screen 2: OTP Verification**
```
┌─────────────────────────────────┐
│  ← Back           OTP Verification
│                                 │
│   We sent a code to            │
│   user@example.com             │
│                                 │
│   [_][_][_][_][_][_]           │
│    OTP Input (6 digits)        │
│                                 │
│   [ ] 60s Resend               │
│                                 │
│  [Verify Button]                │
│                                 │
└─────────────────────────────────┘
```

**OTP Input Implementation:**
```dart
class OTPInput extends StatefulWidget {
  final ValueChanged<String> onChanged;
  final int length;

  const OTPInput({
    super.key,
    required this.onChanged,
    this.length = 6,
  });

  @override
  State<OTPInput> createState() => _OTPInputState();
}

class _OTPInputState extends State<OTPInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
      (index) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
      (index) => FocusNode(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(
        widget.length,
        (index) => SizedBox(
          width: 48,
          height: 56,
          child: TextFormField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            textAlign: TextAlign.center,
            maxLength: 1,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
            ],
            decoration: InputDecoration(
              counterText: '',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: EdgeInsets.zero,
            ),
            onChanged: (value) {
              if (value.isNotEmpty) {
                if (index < widget.length - 1) {
                  _focusNodes[index + 1].requestFocus();
                } else {
                  _focusNodes[index].unfocus();
                }
              }
              widget.onChanged(
                _controllers.map((c) => c.text).join(),
              );
            },
            onBackspace: index > 0
                ? () => _focusNodes[index - 1].requestFocus()
                : null,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }
}
```

**Screen 3: Create New Password**
```
┌─────────────────────────────────┐
│  ← Back          New Password   │
│                                 │
│   Enter your new password       │
│                                 │
│  [🔒 New Password Input]        │
│  [🔒 Confirm Password Input]    │
│                                 │
│   Password requirements:        │
│   ✓ At least 8 characters      │
│   ✓ One uppercase letter       │
│   ✓ One number                 │
│                                 │
│  [Reset Password Button]        │
│                                 │
└─────────────────────────────────┘
```

**Password Strength Indicator:**
```dart
class PasswordStrengthIndicator extends StatelessWidget {
  final String password;

  const PasswordStrengthIndicator({
    super.key,
    required this.password,
  });

  Map<String, bool> _getRequirements() {
    return {
      'At least 8 characters': password.length >= 8,
      'One uppercase letter': password.contains(RegExp(r'[A-Z]')),
      'One number': password.contains(RegExp(r'[0-9]')),
      'One special character': password.contains(RegExp(r'[!@#$%^&*]')),
    };
  }

  @override
  Widget build(BuildContext context) {
    final requirements = _getRequirements();
    final met = requirements.values.where((v) => v).length;
    final strength = met / requirements.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: strength,
            minHeight: 4,
            valueColor: AlwaysStoppedAnimation<Color>(
              strength < 0.5
                  ? warningColor
                  : strength < 1.0
                      ? Color(0xffFBBC04)
                      : successColor,
            ),
            backgroundColor: borderColor,
          ),
        ),
        const SizedBox(height: spacing12),
        ...requirements.entries.map(
          (entry) => Padding(
            padding: const EdgeInsets.symmetric(vertical: spacing4),
            child: Row(
              children: [
                Icon(
                  entry.value ? Icons.check_circle : Icons.circle_outlined,
                  size: 16,
                  color: entry.value ? successColor : textSecondary,
                ),
                const SizedBox(width: spacing8),
                Text(
                  entry.key,
                  style: bodySmall.copyWith(
                    color:
                        entry.value ? textPrimary : textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
```

---

#### 1.4 Force Change Temporary Password (First Login)

```
┌─────────────────────────────────┐
│                                 │
│   🔐 Secure Your Account        │
│                                 │
│   You must change your         │
│   temporary password            │
│                                 │
│  [🔒 Current Password]          │
│  [🔒 New Password]              │
│  [🔒 Confirm Password]          │
│                                 │
│   [Change Password Button]      │
│                                 │
│   You cannot skip this step     │
│                                 │
└─────────────────────────────────┘
```

**Key Features:**
- Cannot dismiss (modal barrier)
- Shows password requirements
- Validates current password
- Matches new passwords
- Force change on first login

---

#### 1.5 Profile & Security

**Main Profile Screen:**
```
┌─────────────────────────────────┐
│  ← Back                  Profile│
│                                 │
│   [Avatar Tap]  John Technician │
│   [Edit Photo Button]           │
│                                 │
│   ──────────────────────────    │
│   PERSONAL INFORMATION          │
│                                 │
│   📧 john.tech@aquacare.com    │
│   📱 0912345678                 │
│   🏢 Technician - Hanoi Branch │
│   🆔 ID: TECH-001              │
│                                 │
│   [Edit Information Button]     │
│                                 │
│   ──────────────────────────    │
│   SECURITY                      │
│                                 │
│   [ ] Change Password >         │
│   [ ] Login History >           │
│   [ ] Devices >                 │
│   [ ] Logout All Devices >      │
│                                 │
│   ──────────────────────────    │
│                                 │
│   [ ] Logout Button             │
│                                 │
└─────────────────────────────────┘
```

**Avatar Update Flow:**
```
1. Tap avatar → Image picker
2. Select from gallery or camera
3. Crop image (square, 1:1 ratio)
4. Preview + Confirm
5. Upload to Firebase Storage
6. Update Firestore profile
7. Reload UI
```

**Login History Screen:**
```
┌─────────────────────────────────┐
│  ← Back             Login History
│                                 │
│   May 26, 2024 - Today          │
│   ├─ 09:15 AM                  │
│   │ iPhone 14 Pro - Safari      │
│   │ 192.168.1.100 (Home)       │
│   │ ✓ Current session           │
│   │                             │
│   ├─ Yesterday 08:30 PM         │
│   │ Samsung Galaxy S23          │
│   │ 192.168.1.101 (Home)       │
│   │                             │
│   └─ May 25, 2024 - 3 days ago │
│     iPhone 14 Pro - Chrome      │
│      10.0.0.5 (Office)         │
│                                 │
└─────────────────────────────────┘
```

**Logout All Devices:**
```
┌─────────────────────────────────┐
│   ⚠️  Logout from all devices   │
│                                 │
│   You will be logged out from   │
│   all devices immediately.      │
│   You'll need to login again.   │
│                                 │
│   Are you sure?                 │
│                                 │
│  [Cancel]      [Logout All]     │
│                                 │
└─────────────────────────────────┘
```

---

### 2. HOME / JOB DASHBOARD

#### 2.1 Main Home Screen

```
┌─────────────────────────────────┐
│  @ 9:30 AM    ☀️  Good morning! │
│               John Technician    │
│                                 │
│  📍 Hanoi | Online              │
│                                 │
│  ──────────────────────────────│
│                                 │
│  QUICK STATS (Horizontal scroll)│
│  ┌─────────┬─────────┬────────┐│
│  │ Today   │ In Way  │Complete││
│  │   4     │   1     │   2    ││
│  │ jobs    │ job     │ jobs   ││
│  └─────────┴─────────┴────────┘│
│                                 │
│  ──────────────────────────────│
│                                 │
│  UPCOMING JOBS (Next 2 hours)   │
│                                 │
│  [Card 1] Priority 1            │
│  📍 District 1, HCM             │
│  👤 Nguyen Van A                │
│  ⏰ 10:30 AM (50 mins)           │
│  [Navigate] [Details]           │
│                                 │
│  [Card 2] Priority 2            │
│  📍 District 3, HCM             │
│  👤 Tran Thi B                  │
│  ⏰ 12:00 PM (2 hours 50 mins)  │
│  [Navigate] [Details]           │
│                                 │
│  ──────────────────────────────│
│  ⬇️ SWIPE UP OR TAP "ALL JOBS"  │
│                                 │
└─────────────────────────────────┘
│ [🏠 Home] [📅 Schedule] [👤 Profile]
└─────────────────────────────────┘
```

**Features:**
1. **Greeting + Status:**
   - Time-based greeting (Good morning, Good afternoon, Good evening)
   - Technician name
   - Location (if enabled)
   - Online/Offline status

2. **Quick Stats (Horizontal Scrollable Cards):**
   - Today's total jobs
   - In progress jobs
   - Completed today
   - Pending review

3. **Upcoming Jobs Section:**
   - Show next 2 jobs by appointment time
   - Pull-to-refresh support
   - Auto-refresh every 30 seconds when app is active
   - Tap to view details or navigate

4. **Empty State (No jobs today):**
```
┌─────────────────────────────────┐
│                                 │
│   🎉 All Done!                 │
│                                 │
│   No more jobs scheduled        │
│   for today. Enjoy your day!   │
│                                 │
│   Last job completed at 4:30 PM│
│                                 │
│   [Stay Online]  [Go Offline]   │
│                                 │
└─────────────────────────────────┘
```

**Job Card Component:**
```dart
class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback onNavigate;
  final VoidCallback onViewDetails;

  const JobCard({
    super.key,
    required this.job,
    required this.onNavigate,
    required this.onViewDetails,
  });

  Color _getStatusColor(JobStatus status) {
    switch (status) {
      case JobStatus.waiting:
        return statusWaiting;
      case JobStatus.onWay:
        return statusOnWay;
      case JobStatus.installing:
        return statusInstalling;
      case JobStatus.completed:
        return statusCompleted;
      case JobStatus.needSupport:
        return statusNeedSupport;
    }
  }

  Duration _timeUntilAppointment() {
    return job.appointmentTime.difference(DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    final timeRemaining = _timeUntilAppointment();
    final hours = timeRemaining.inHours;
    final minutes = timeRemaining.inMinutes % 60;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [cardShadow],
      ),
      margin: const EdgeInsets.only(bottom: spacing16),
      child: Column(
        children: [
          // Header with priority & status
          Container(
            padding: const EdgeInsets.all(spacing16),
            decoration: BoxDecoration(
              color: _getStatusColor(job.status).withOpacity(0.1),
              border: Border(
                bottom: BorderSide(
                  color: borderColor,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: spacing8,
                        vertical: spacing4,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(job.status),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Priority ${job.priority}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: spacing8,
                    vertical: spacing4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(job.status).withOpacity(0.2),
                    border: Border.all(
                      color: _getStatusColor(job.status),
                    ),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    job.status.name.replaceAll('_', ' ').toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(job.status),
                      fontWeight: FontWeight.w700,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Customer & Address Info
          Padding(
            padding: const EdgeInsets.all(spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.person_outline,
                      size: 18,
                      color: textSecondary,
                    ),
                    const SizedBox(width: spacing8),
                    Expanded(
                      child: Text(
                        job.customerName,
                        style: bodyMedium,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        // Launch phone call
                        launchUrl(
                          Uri(scheme: 'tel', path: job.customerPhone),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(spacing8),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.phone,
                          size: 18,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: spacing12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: textSecondary,
                    ),
                    const SizedBox(width: spacing8),
                    Expanded(
                      child: Text(
                        job.address,
                        style: bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: spacing12),
                Row(
                  children: [
                    const Icon(
                      Icons.schedule,
                      size: 18,
                      color: textSecondary,
                    ),
                    const SizedBox(width: spacing8),
                    Text(
                      '${hours}h ${minutes}m remaining',
                      style: bodySmall.copyWith(
                        color: hours == 0 && minutes < 30
                            ? warningColor
                            : textSecondary,
                        fontWeight: hours == 0 && minutes < 30
                            ? FontWeight.w700
                            : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Action Buttons
          Container(
            padding: const EdgeInsets.all(spacing16),
            decoration: BoxDecoration(
              color: lightGray.withOpacity(0.5),
              border: Border(
                top: BorderSide(color: borderColor),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onNavigate,
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.navigation, size: 18),
                        SizedBox(width: spacing8),
                        Text('Navigate'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: spacing12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onViewDetails,
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Details'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

### 3. CALENDAR / WORK SCHEDULE

#### 3.1 Schedule Main Screen

```
┌─────────────────────────────────┐
│  ← Back                 Schedule │
│                                 │
│  MAY 2024                       │
│  ┌─ Sun ─ Mon ─ Tue ─ Wed ─┐  │
│  │  26   27   28   29   30  │  │
│  │  [4]  [5]  [3]  [2]  [4] │  │
│  │                           │  │
│  │  31   1    2    3    4   │  │
│  │  [1]  [6]  [5]  [2]  [3] │  │
│  └───────────────────────────┘  │
│                                 │
│  MONDAY, MAY 27, 2024 (5 jobs)  │
│                                 │
│  ⏱️ 8:30 AM - Installation      │
│  📍 District 1 - 3.2km away     │
│  👤 Nguyen Van A                │
│  [📞] [→]                       │
│                                 │
│  ⏱️ 10:30 AM - Installation     │
│  📍 District 2 - 1.8km away     │
│  👤 Tran Thi B                  │
│  [📞] [→]                       │
│                                 │
│  ⏱️ 1:00 PM - Maintenance       │
│  📍 District 3 - 5.1km away     │
│  👤 Le Van C                    │
│  [📞] [→]                       │
│                                 │
│  [Load more...]                 │
│                                 │
└─────────────────────────────────┘
│ [🏠 Home] [📅 Schedule] [👤 Profile]
└─────────────────────────────────┘
```

**Features:**
1. **Month View with Job Count:**
   - Small calendar showing job count per day
   - Current day highlighted
   - Tap to select specific day

2. **Day View (Timeline):**
   - Jobs sorted by appointment time
   - Status color coding
   - Quick actions: call, navigate
   - Drag to reschedule (if enabled)

3. **Status Colors:**
   - Waiting: Orange
   - On the way: Blue
   - Installing: Purple
   - Completed: Green
   - Need support: Red

**Calendar Cell Component:**
```dart
class CalendarCell extends StatelessWidget {
  final DateTime date;
  final int jobCount;
  final bool isSelected;
  final bool isToday;
  final VoidCallback onTap;

  const CalendarCell({
    super.key,
    required this.date,
    required this.jobCount,
    required this.isSelected,
    required this.isToday,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? primaryBlue : Colors.transparent,
          border: isToday
              ? Border.all(color: primaryBlue, width: 2)
              : isSelected
                  ? null
                  : Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              date.day.toString(),
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : textPrimary,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: spacing4),
            if (jobCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: spacing6,
                  vertical: spacing2,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withOpacity(0.3)
                      : primaryBlue.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '[$jobCount]',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.white : primaryBlue,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

---

#### 3.2 Weekly Timeline View

```
┌─────────────────────────────────┐
│                   THIS WEEK      │
│ MON    TUE    WED    THU    FRI  │
│ [27]   [28]   [29]   [30]   [1] │
│                                 │
│ TIMELINE VIEW                   │
│                                 │
│ 8:00 AM ─────────────────────── │
│  └─ [Orange] 📍 D1 - Install    │
│     Nguyen Van A (0912345)      │
│     45 mins remaining            │
│                                 │
│ 10:00 AM ────────────────────── │
│  └─ [Blue] 📍 D2 - Install      │
│     Tran Thi B (0987654)        │
│     2h 15m remaining             │
│                                 │
│ 12:30 PM ────────────────────── │
│  └─ [Purple] 📍 D3 - Maint      │
│     Le Van C (0912888)          │
│     4h 45m remaining             │
│                                 │
│ 2:00 PM ───────────────────────│
│  ├─ [Green] 📍 D4 - Complete   │
│  └─ Le Thi D (0988888) [✓]     │
│                                 │
│ 4:00 PM ───────────────────────│
│  └─ [Red] 📍 D5 - Support      │
│     Hoang Van E (0912999)      │
│     Report: Device issue        │
│                                 │
└─────────────────────────────────┘
```

---

### 4. JOB DETAIL SCREEN

```
┌─────────────────────────────────┐
│  ← Back              Job Details │
│                                 │
│  ╔═════════════════════════════╗│
│  ║ STATUS: 🟠 WAITING          ║│
│  ║ Priority: 1 • ID: JOB-12345 ║│
│  ╚═════════════════════════════╝│
│                                 │
│  CUSTOMER INFORMATION           │
│  ┌─────────────────────────────┐│
│  │ 👤 Nguyen Van A             ││
│  │ 📱 0912345678               ││
│  │ 📧 nguyenvana@email.com     ││
│  │                             ││
│  │ 📍 123 Nguyen Hue St        ││
│  │    District 1, HCMC         ││
│  │                             ││
│  │ [📞 Call] [💬 SMS] [📍 Maps]││
│  └─────────────────────────────┘│
│                                 │
│  APPOINTMENT & ORDER            │
│  ┌─────────────────────────────┐│
│  │ ⏰ May 27, 2024             ││
│  │    10:30 AM - 11:30 AM      ││
│  │    Status: Waiting           ││
│  │                             ││
│  │ 📦 AquaCare Pro Model X     ││
│  │    SKU: ACX-2024-001        ││
│  │    Qty: 1                   ││
│  │    Color: White             ││
│  │                             │
│  │ 💵 Order Total: 8,999,000 VND
│  │ 💚 COD Expected: 8,999,000  │
│  │ 💛 Tip Allowed: Up to 500k  │
│  │                             │
│  │ 📝 Notes:                   │
│  │    "Install with warranty"  │
│  │    "Call before arrival"    │
│  └─────────────────────────────┘│
│                                 │
│  INSTALLATION TIMELINE          │
│  ┌─────────────────────────────┐│
│  │ ⭕ Waiting for KTV           │
│  │ ──────────────────────────  │
│  │ ⭕ On the way (pending)     │
│  │ ──────────────────────────  │
│  │ ⭕ Arrived (pending)         │
│  │ ──────────────────────────  │
│  │ ⭕ Installing (pending)      │
│  │ ──────────────────────────  │
│  │ ⭕ Complete (pending)        │
│  └─────────────────────────────┘│
│                                 │
│  ╔═════════════════════════════╗│
│  ║ [🔄 Update Status]          ║│
│  ║ [⚠️ Report Issue]           ║│
│  ║ [📞 Call Customer]          ║│
│  ║ [📍 Navigate]               ║│
│  ╚═════════════════════════════╝│
│                                 │
└─────────────────────────────────┘
```

**Job Detail Model:**
```dart
class JobDetail {
  final String jobId;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String address;
  final String latitude;
  final String longitude;
  final DateTime appointmentTime;
  final DateTime createdAt;
  final JobStatus status;
  final int priority;
  final List<Product> products;
  final double totalAmount;
  final double codAmount;
  final double maxTip;
  final String? notes;
  final List<String> imageUrls; // Installation photos
  final bool isCompleted;
  final DateTime? completedAt;
  final double? actualCollected;
  final double? tipAmount;
  final String? installationNotes;
  final String? issueReason;
  final String? issueDescription;
  final List<String> issueImageUrls;

  JobDetail({
    required this.jobId,
    // ... other fields
  });
}
```

**Key Components:**
1. Status banner with color coding
2. Customer info card with quick actions
3. Order details with product info
4. Timeline showing job progress
5. Sticky bottom action buttons

**Status Timeline Component:**
```dart
class JobStatusTimeline extends StatelessWidget {
  final JobStatus currentStatus;
  final List<JobStatus> statusSteps = const [
    JobStatus.waiting,
    JobStatus.onWay,
    JobStatus.installing,
    JobStatus.completed,
  ];

  const JobStatusTimeline({super.key, required this.currentStatus});

  bool _isCompleted(JobStatus status) {
    return statusSteps.indexOf(status) < statusSteps.indexOf(currentStatus);
  }

  bool _isCurrent(JobStatus status) {
    return status == currentStatus;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        statusSteps.length,
        (index) {
          final status = statusSteps[index];
          final isLast = index == statusSteps.length - 1;

          return Column(
            children: [
              Row(
                children: [
                  // Status circle
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isCompleted(status) || _isCurrent(status)
                          ? successColor
                          : borderColor,
                      border: _isCurrent(status)
                          ? Border.all(color: primaryBlue, width: 3)
                          : null,
                    ),
                    child: Center(
                      child: _isCompleted(status)
                          ? const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 20,
                            )
                          : Text(
                              (index + 1).toString(),
                              style: TextStyle(
                                color: _isCurrent(status)
                                    ? primaryBlue
                                    : textSecondary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: spacing12),

                  // Status label
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _statusLabel(status),
                          style: TextStyle(
                            fontWeight: _isCurrent(status)
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: _isCompleted(status) || _isCurrent(status)
                                ? textPrimary
                                : textSecondary,
                          ),
                        ),
                        if (_isCurrent(status))
                          Text(
                            'Current',
                            style: caption.copyWith(
                              color: primaryBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.only(
                    left: 20,
                    top: spacing12,
                    bottom: spacing12,
                  ),
                  child: Container(
                    width: 2,
                    height: 32,
                    color: borderColor,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  String _statusLabel(JobStatus status) {
    switch (status) {
      case JobStatus.waiting:
        return 'Waiting for KTV';
      case JobStatus.onWay:
        return 'On the way';
      case JobStatus.installing:
        return 'Installing';
      case JobStatus.completed:
        return 'Completed';
      case JobStatus.needSupport:
        return 'Need Support';
    }
  }
}
```

---

### 5. GOOGLE MAPS NAVIGATION

```
┌─────────────────────────────────┐
│ ◄ Navigation              15.2km │
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │    🗺️ GOOGLE MAPS VIEW     ││
│  │                             ││
│  │  [📍 Blue Dot - Technician]│
│  │                             │
│  │  [Red Pin - Destination]   ││
│  │                             │
│  │  Route: 35 mins (normal)   ││
│  │                             │
│  │                             │
│  └─────────────────────────────┘│
│                                 │
│  ╔═════════════════════════════╗│
│  ║ 📍 123 Nguyen Hue Street   ║│
│  ║                             ║│
│  ║ Distance: 15.2 km           ║│
│  ║ Est. Time: 35 mins          ║║
│  ║ Traffic: Normal 🟢           ║│
│  ║                             ║│
│  ║ [🚗 Navigate]               ║│
│  ║ [☎️ Call Customer]          ║│
│  ╚═════════════════════════════╝│
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Integrates Google Maps SDK
- Shows current technician location (blue dot)
- Destination marked (red pin)
- Route overview
- Distance + estimated time
- Traffic status with color coding
- One-tap "Navigate" button
- Call customer button

**Navigation Handler:**
```dart
class NavigationHandler {
  static Future<void> openGoogleMaps({
    required double destLat,
    required double destLng,
    required String address,
  }) async {
    try {
      // Google Maps URL scheme
      final googleMapsUrl = 'https://www.google.com/maps/dir/?api=1'
          '&destination=$destLat,$destLng'
          '&destination_place_id=$address'
          '&travelmode=driving';

      if (await canLaunchUrl(Uri.parse(googleMapsUrl))) {
        await launchUrl(Uri.parse(googleMapsUrl));
      } else {
        // Fallback: Open Google Maps app or web
        final fallbackUrl =
            'https://maps.google.com/?q=$destLat,$destLng';
        if (await canLaunchUrl(Uri.parse(fallbackUrl))) {
          await launchUrl(Uri.parse(fallbackUrl));
        }
      }
    } catch (e) {
      debugPrint('Error opening maps: $e');
      // Show error toast
    }
  }

  static Future<void> startNavigation({
    required String origin, // User location
    required String destination, // Job location
  }) async {
    // For in-app navigation using google_maps_flutter
    // Create GoogleMapController and animate camera
  }
}
```

**Fallback State (No Maps Available):**
```
┌─────────────────────────────────┐
│  ◄ Navigation                   │
│                                 │
│  ⚠️ Google Maps Not Available   │
│                                 │
│  Your address:                  │
│  123 Nguyen Hue Street          │
│  District 1, HCMC, Vietnam      │
│                                 │
│  Distance: 15.2 km              │
│  Est. Time: 35 mins (normal)   │
│                                 │
│  [Copy Address]                 │
│  [Call Customer]                │
│  [Show on Web Map]              │
│                                 │
└─────────────────────────────────┘
```

---

### 6. UPDATE WORK STATUS FLOW

#### 6.1 Status Update Modal

```
┌─────────────────────────────────┐
│   Update Job Status             │
│   Job ID: JOB-12345             │
│                                 │
│   Current Status: 🟠 Waiting    │
│                                 │
│   ──────────────────────────────│
│                                 │
│   Next Status Options:          │
│                                 │
│   [ ] 🔵 On the Way             │
│       Started traveling         │
│                                 │
│   [ ] 🟣 Arrived                │
│       Reached location          │
│                                 │
│   [ ] 🟡 Installing             │
│       Started installation      │
│                                 │
│   [ ] 🟢 Completed              │
│       Install complete (need    │
│       photos & COD)             │
│                                 │
│   [ ] 🔴 Need Support           │
│       Issue encountered         │
│                                 │
│  [Cancel]  [Update Status]      │
│                                 │
└─────────────────────────────────┘
```

**One-Tap Status Update (Quick Mode):**
```
┌─────────────────────────────────┐
│                                 │
│  👆 TAP TO UPDATE STATUS        │
│                                 │
│  [ 🔵 ] [ 🟣 ] [ 🟡 ]  [ 🟢 ]  │
│  On Way Arrived Install Complete
│                                 │
│  Long press for details ↓       │
│                                 │
│  [ 🔴 ] Report Issue            │
│                                 │
└─────────────────────────────────┘
```

**Status Update Implementation:**
```dart
enum JobStatus {
  waiting,
  onWay,
  arrived,
  installing,
  completed,
  needSupport,
}

class StatusUpdateBottomSheet extends StatefulWidget {
  final Job currentJob;
  final ValueChanged<JobStatus> onStatusUpdate;

  const StatusUpdateBottomSheet({
    super.key,
    required this.currentJob,
    required this.onStatusUpdate,
  });

  @override
  State<StatusUpdateBottomSheet> createState() =>
      _StatusUpdateBottomSheetState();
}

class _StatusUpdateBottomSheetState extends State<StatusUpdateBottomSheet> {
  JobStatus? _selectedStatus;

  Color _getStatusColor(JobStatus status) {
    switch (status) {
      case JobStatus.waiting:
        return statusWaiting;
      case JobStatus.onWay:
        return statusOnWay;
      case JobStatus.arrived:
        return const Color(0xff3B82F6);
      case JobStatus.installing:
        return statusInstalling;
      case JobStatus.completed:
        return statusCompleted;
      case JobStatus.needSupport:
        return statusNeedSupport;
    }
  }

  String _getStatusLabel(JobStatus status) {
    switch (status) {
      case JobStatus.waiting:
        return 'Waiting';
      case JobStatus.onWay:
        return 'On the Way';
      case JobStatus.arrived:
        return 'Arrived';
      case JobStatus.installing:
        return 'Installing';
      case JobStatus.completed:
        return 'Completed';
      case JobStatus.needSupport:
        return 'Need Support';
    }
  }

  @override
  Widget build(BuildContext context) {
    final availableStatuses = _getAvailableNextStatuses(
      widget.currentJob.status,
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      builder: (_, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(borderRadiusLarge),
            ),
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Padding(
              padding: const EdgeInsets.all(spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: borderColor,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: spacing20),
                  Text(
                    'Update Job Status',
                    style: heading2,
                  ),
                  const SizedBox(height: spacing8),
                  Text(
                    'Job ID: ${widget.currentJob.jobId}',
                    style: bodySmall,
                  ),
                  const SizedBox(height: spacing20),

                  // Current status
                  Container(
                    padding: const EdgeInsets.all(spacing12),
                    decoration: BoxDecoration(
                      color: _getStatusColor(widget.currentJob.status)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(borderRadiusMedium),
                      border: Border.all(
                        color: _getStatusColor(widget.currentJob.status)
                            .withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: _getStatusColor(widget.currentJob.status),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: spacing12),
                        Text(
                          'Current: ${_getStatusLabel(widget.currentJob.status)}',
                          style: bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: spacing20),

                  Text(
                    'Next Status',
                    style: heading3,
                  ),
                  const SizedBox(height: spacing12),

                  // Status options
                  ...availableStatuses.map(
                    (status) => Padding(
                      padding: const EdgeInsets.only(bottom: spacing12),
                      child: GestureDetector(
                        onTap: () =>
                            setState(() => _selectedStatus = status),
                        child: Container(
                          decoration: BoxDecoration(
                            color: _selectedStatus == status
                                ? _getStatusColor(status).withOpacity(0.1)
                                : Colors.transparent,
                            border: Border.all(
                              color: _selectedStatus == status
                                  ? _getStatusColor(status)
                                  : borderColor,
                              width: _selectedStatus == status ? 2 : 1,
                            ),
                            borderRadius: BorderRadius.circular(
                              borderRadiusMedium,
                            ),
                          ),
                          padding: const EdgeInsets.all(spacing12),
                          child: Row(
                            children: [
                              Container(
                                width: 20,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: _getStatusColor(status),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: spacing12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _getStatusLabel(status),
                                      style: bodyMedium.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      _getStatusDescription(status),
                                      style: bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                              if (_selectedStatus == status)
                                const Icon(
                                  Icons.check_circle,
                                  color: successColor,
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: spacing24),

                  // Confirmation
                  if (_selectedStatus == JobStatus.completed)
                    Container(
                      padding: const EdgeInsets.all(spacing12),
                      decoration: BoxDecoration(
                        color: warningColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(
                          borderRadiusMedium,
                        ),
                        border: Border.all(
                          color: warningColor.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: warningColor,
                            size: 20,
                          ),
                          const SizedBox(width: spacing12),
                          Expanded(
                            child: Text(
                              'You\'ll need to upload photos and confirm COD',
                              style: bodySmall.copyWith(
                                color: warningColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: spacing24),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              vertical: 14,
                            ),
                          ),
                          child: const Text('Cancel'),
                        ),
                      ),
                      const SizedBox(width: spacing12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _selectedStatus == null
                              ? null
                              : () {
                                  widget.onStatusUpdate(_selectedStatus!);
                                  Navigator.pop(context);
                                },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              vertical: 14,
                            ),
                          ),
                          child: const Text('Update Status'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  List<JobStatus> _getAvailableNextStatuses(JobStatus current) {
    switch (current) {
      case JobStatus.waiting:
        return [JobStatus.onWay, JobStatus.needSupport];
      case JobStatus.onWay:
        return [JobStatus.arrived, JobStatus.needSupport];
      case JobStatus.arrived:
        return [JobStatus.installing, JobStatus.needSupport];
      case JobStatus.installing:
        return [JobStatus.completed, JobStatus.needSupport];
      case JobStatus.completed:
      case JobStatus.needSupport:
        return [];
    }
  }

  String _getStatusDescription(JobStatus status) {
    switch (status) {
      case JobStatus.onWay:
        return 'Started traveling to customer';
      case JobStatus.arrived:
        return 'Reached the destination';
      case JobStatus.installing:
        return 'Started installation process';
      case JobStatus.completed:
        return 'Installation finished';
      case JobStatus.needSupport:
        return 'Issue encountered, need support';
      default:
        return '';
    }
  }
}
```

---

### 7. COMPLETE INSTALLATION SCREEN

#### 7.1 Completion Form

```
┌─────────────────────────────────┐
│  ← Back          Complete Job   │
│                                 │
│  ✅ INSTALLATION PHOTOS         │
│  Max 5 photos (3 uploaded)      │
│                                 │
│  [📷 Pic1] [📷 Pic2] [📷 Pic3]  │
│  [  +  ]                        │
│                                 │
│  ──────────────────────────────│
│                                 │
│  💵 COD CONFIRMATION            │
│                                 │
│  Expected Amount:               │
│  8,999,000 VND                  │
│                                 │
│  Actual Amount Collected:       │
│  [_____________] VND            │
│                                 │
│  Tip Amount (Optional):         │
│  Max: 500,000 VND              │
│  [_____________] VND            │
│                                 │
│  ──────────────────────────────│
│                                 │
│  📝 INSTALLATION NOTES          │
│  [_________________________]    │
│  [_________________________]    │
│  [_________________________]    │
│                                 │
│  ──────────────────────────────│
│                                 │
│  [ ] By clicking Complete, you  │
│      confirm all details above  │
│                                 │
│  ╔═════════════════════════════╗│
│  ║ [Complete Job]              ║│
│  ╚═════════════════════════════╝│
│                                 │
└─────────────────────────────────┘
```

**Features:**
1. **Photo Upload (Max 5)**
   - Camera or gallery picker
   - Preview grid (3 columns)
   - Delete individual photo
   - Shows upload progress
   - Permission handling

2. **COD Confirmation**
   - Shows expected amount (read-only)
   - Input for actual collected
   - Tip input (optional)
   - Validation for amount discrepancy

3. **Installation Notes**
   - Text area for notes
   - Character limit (500 chars)
   - Optional field

4. **Confirmation Checkbox**
   - Must check before submitting
   - Disables submit button

**Photo Upload Implementation:**
```dart
class PhotoUploadWidget extends StatefulWidget {
  final List<File> photos;
  final ValueChanged<File> onPhotoAdded;
  final VoidCallback onPhotoRemoved;

  const PhotoUploadWidget({
    super.key,
    required this.photos,
    required this.onPhotoAdded,
    required this.onPhotoRemoved,
  });

  @override
  State<PhotoUploadWidget> createState() => _PhotoUploadWidgetState();
}

class _PhotoUploadWidgetState extends State<PhotoUploadWidget> {
  late ImagePicker _imagePicker;

  @override
  void initState() {
    super.initState();
    _imagePicker = ImagePicker();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      // Request camera/gallery permission
      final status = source == ImageSource.camera
          ? await Permission.camera.request()
          : await Permission.photos.request();

      if (!status.isGranted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Permission required to access photos'),
            ),
          );
        }
        return;
      }

      final image = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        widget.onPhotoAdded(File(image.path));
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '✅ Installation Photos',
              style: heading3,
            ),
            Text(
              '${widget.photos.length}/5',
              style: bodySmall,
            ),
          ],
        ),
        const SizedBox(height: spacing12),
        GridView.count(
          crossAxisCount: 3,
          mainAxisSpacing: spacing8,
          crossAxisSpacing: spacing8,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            ...widget.photos.asMap().entries.map((entry) {
              final index = entry.key;
              final file = entry.value;
              return Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(borderRadiusMedium),
                      image: DecorationImage(
                        image: FileImage(file),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    top: spacing4,
                    right: spacing4,
                    child: GestureDetector(
                      onTap: () => _removePhoto(index),
                      child: Container(
                        padding: const EdgeInsets.all(spacing4),
                        decoration: const BoxDecoration(
                          color: errorColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            }),
            if (widget.photos.length < 5)
              GestureDetector(
                onTap: () => _showPhotoOptions(context),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: borderColor,
                      width: 2,
                      strokeAlign: BorderSide.strokeAlignCenter,
                    ),
                    borderRadius:
                        BorderRadius.circular(borderRadiusMedium),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.add_a_photo_outlined,
                      size: 32,
                      color: textSecondary,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  void _removePhoto(int index) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remove Photo?'),
        content: const Text('Are you sure you want to remove this photo?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              widget.onPhotoRemoved();
              Navigator.pop(context);
            },
            child: const Text('Remove', style: TextStyle(color: errorColor)),
          ),
        ],
      ),
    );
  }

  void _showPhotoOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Container(
        padding: const EdgeInsets.all(spacing16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.image),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

**COD Input with Validation:**
```dart
class CodConfirmationWidget extends StatefulWidget {
  final double expectedAmount;
  final double maxTip;
  final ValueChanged<(double actual, double tip)> onConfirm;

  const CodConfirmationWidget({
    super.key,
    required this.expectedAmount,
    required this.maxTip,
    required this.onConfirm,
  });

  @override
  State<CodConfirmationWidget> createState() => _CodConfirmationWidgetState();
}

class _CodConfirmationWidgetState extends State<CodConfirmationWidget> {
  late TextEditingController _actualController;
  late TextEditingController _tipController;

  @override
  void initState() {
    super.initState();
    _actualController = TextEditingController();
    _tipController = TextEditingController();
  }

  @override
  void dispose() {
    _actualController.dispose();
    _tipController.dispose();
    super.dispose();
  }

  bool _hasAmountDisrepancy() {
    final actual = double.tryParse(_actualController.text) ?? 0;
    final difference = (actual - widget.expectedAmount).abs();
    return difference > 1000; // 1000 VND tolerance
  }

  @override
  Widget build(BuildContext context) {
    final actual = double.tryParse(_actualController.text) ?? 0;
    final hasDisrepancy = _hasAmountDisrepancy();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '💵 COD Confirmation',
          style: heading3,
        ),
        const SizedBox(height: spacing12),
        Container(
          padding: const EdgeInsets.all(spacing12),
          decoration: BoxDecoration(
            color: lightGray,
            borderRadius: BorderRadius.circular(borderRadiusMedium),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Expected Amount:',
                style: bodyMedium,
              ),
              Text(
                '${widget.expectedAmount.toStringAsFixed(0)} VND',
                style: bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: spacing16),
        Text(
          'Actual Amount Collected',
          style: bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: spacing8),
        TextFormField(
          controller: _actualController,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(
            hintText: 'Enter amount',
            suffixText: 'VND',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(borderRadiusMedium),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(borderRadiusMedium),
              borderSide: const BorderSide(color: errorColor),
            ),
            errorText: hasDisrepancy
                ? 'Amount differs from expected'
                : null,
          ),
          onChanged: (_) => setState(() {}),
        ),
        if (hasDisrepancy)
          Padding(
            padding: const EdgeInsets.only(top: spacing8),
            child: Container(
              padding: const EdgeInsets.all(spacing8),
              decoration: BoxDecoration(
                color: warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(borderRadiusMedium),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: warningColor,
                    size: 18,
                  ),
                  const SizedBox(width: spacing8),
                  Expanded(
                    child: Text(
                      'Difference: ${(actual - widget.expectedAmount).abs().toStringAsFixed(0)} VND',
                      style: bodySmall.copyWith(color: warningColor),
                    ),
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: spacing16),
        Text(
          'Tip Amount (Optional)',
          style: bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: spacing8),
        TextFormField(
          controller: _tipController,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(
            hintText: '0',
            helperText: 'Max: ${widget.maxTip.toStringAsFixed(0)} VND',
            suffixText: 'VND',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(borderRadiusMedium),
            ),
          ),
        ),
      ],
    );
  }
}
```

---

### 8. REPORT ISSUE SCREEN

```
┌─────────────────────────────────┐
│  ← Back              Report Issue│
│                                 │
│  ⚠️  Tell us what went wrong    │
│                                 │
│  SELECT ISSUE REASON            │
│                                 │
│  [ ] Customer not at home       │
│  [ ] Customer not available     │
│  [ ] Device damaged             │
│  [ ] Incorrect address          │
│  [ ] Customer request reschedule│
│  [ ] Installation failed        │
│  [ ] Other                      │
│                                 │
│  ──────────────────────────────│
│                                 │
│  DESCRIPTION (Required)         │
│  [_________________________]    │
│  [_________________________]    │
│  [_________________________]    │
│  (Max 500 characters)           │
│                                 │
│  ──────────────────────────────│
│                                 │
│  PHOTOS (Optional)              │
│  [📷] [📷] [+]                  │
│                                 │
│  ──────────────────────────────│
│                                 │
│  ╔═════════════════════════════╗│
│  ║ [Submit Report]             ║│
│  ╚═════════════════════════════╝│
│                                 │
└─────────────────────────────────┘
```

**Issue Reasons Enum:**
```dart
enum IssueReason {
  customerNotHome,
  customerNotAvailable,
  deviceDamaged,
  incorrectAddress,
  customerRequestReschedule,
  installationFailed,
  other,
}

extension IssueReasonExtension on IssueReason {
  String get label {
    switch (this) {
      case IssueReason.customerNotHome:
        return 'Customer not at home';
      case IssueReason.customerNotAvailable:
        return 'Customer not available';
      case IssueReason.deviceDamaged:
        return 'Device damaged';
      case IssueReason.incorrectAddress:
        return 'Incorrect address';
      case IssueReason.customerRequestReschedule:
        return 'Customer request reschedule';
      case IssueReason.installationFailed:
        return 'Installation failed';
      case IssueReason.other:
        return 'Other';
    }
  }

  String get description {
    switch (this) {
      case IssueReason.customerNotHome:
        return 'The customer was not present at the location';
      case IssueReason.customerNotAvailable:
        return 'Unable to contact customer';
      case IssueReason.deviceDamaged:
        return 'The device or packaging was damaged';
      case IssueReason.incorrectAddress:
        return 'The provided address was incorrect';
      case IssueReason.customerRequestReschedule:
        return 'Customer asked to reschedule';
      case IssueReason.installationFailed:
        return 'The installation process encountered issues';
      case IssueReason.other:
        return 'Other reason';
    }
  }
}
```

---

### 9. NOTIFICATION CENTER

```
┌─────────────────────────────────┐
│  ← Back             Notifications│
│                                 │
│  TODAY                          │
│                                 │
│  [ ] 🟠 9:45 AM                 │
│     New job assigned: JOB-12345 │
│     District 1, HCMC            │
│     Mark as read                │
│                                 │
│  [✓] 🟢 8:30 AM                 │
│     Job JOB-12344 completed    │
│     You earned 50,000 VND      │
│                                 │
│  YESTERDAY                      │
│                                 │
│  [✓] 🔵 2:15 PM                 │
│     Schedule changed: JOB-12342 │
│     New time: 3:00 PM          │
│                                 │
│  [✓] 🟡 11:30 AM                │
│     Warranty task assigned     │
│     Maintenance call required  │
│                                 │
│  MAY 25                         │
│                                 │
│  [✓] 🔴 4:45 PM                 │
│     Issue reported: JOB-12341  │
│     Admin review needed        │
│                                 │
│  ──────────────────────────────│
│  [Mark all as read]             │
│                                 │
└─────────────────────────────────┘
```

**Notification Model:**
```dart
enum NotificationType {
  jobAssigned,
  jobCompleted,
  scheduleChanged,
  warrantyTaskAssigned,
  issueReported,
  paymentReceived,
  messageFromAdmin,
}

class TechnicianNotification {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final String? jobId;
  final String? jobTitle;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic> data; // Extra data for navigation

  TechnicianNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.jobId,
    this.jobTitle,
    required this.timestamp,
    this.isRead = false,
    required this.data,
  });
}
```

---

### 10. SETTINGS

```
┌─────────────────────────────────┐
│  ← Back                 Settings │
│                                 │
│  👤 ACCOUNT                     │
│  ┌─────────────────────────────┐│
│  │ Edit Profile >              ││
│  │ Change Password >           ││
│  │ Security Settings >         ││
│  │ Login History >             ││
│  └─────────────────────────────┘│
│                                 │
│  🔔 NOTIFICATIONS               │
│  ┌─────────────────────────────┐│
│  │ Job Assigned         [ON]   ││
│  │ Schedule Changed     [ON]   ││
│  │ Warranty Tasks       [OFF]  ││
│  │ Messages             [ON]   ││
│  │ Payment Notifications[ON]   ││
│  └─────────────────────────────┘│
│                                 │
│  📍 LOCATION                    │
│  ┌─────────────────────────────┐│
│  │ Share Location       [ON]   ││
│  │ Auto-update Location [30s]  │││  │ Offline Support      [OFF]  │││  └─────────────────────────────┘│
│                                 │
│  ℹ️  APP                        │
│  ┌─────────────────────────────┐│
│  │ App Version: 1.0.0          ││
│  │ Build: 2024050101          │││  │ Check for Updates   >       │││  │ Terms & Conditions  >       │││  │ Privacy Policy      >       │││  │ Help & Support      >       │││  └─────────────────────────────┘│
│                                 │
│  ╔═════════════════════════════╗│
│  ║ [🚪 Logout]                 ║│
│  ╚═════════════════════════════╝│
│                                 │
└─────────────────────────────────┘
│ [🏠 Home] [📅 Schedule] [👤 Profile]
└─────────────────────────────────┘
```

**Settings Implementation:**
```dart
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // Settings state
  bool _jobNotifications = true;
  bool _scheduleNotifications = true;
  bool _warrantyNotifications = false;
  bool _messageNotifications = true;
  bool _paymentNotifications = true;

  bool _shareLocation = true;
  String _locationUpdateInterval = '30s';
  bool _offlineSupport = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        children: [
          // Account Section
          _SettingsSectionHeader(title: '👤 Account'),
          _SettingsMenuTile(
            title: 'Edit Profile',
            onTap: () {
              // Navigate to edit profile
            },
          ),
          _SettingsMenuTile(
            title: 'Change Password',
            onTap: () {
              // Navigate to change password
            },
          ),
          _SettingsMenuTile(
            title: 'Security Settings',
            onTap: () {
              // Navigate to security settings
            },
          ),
          _SettingsMenuTile(
            title: 'Login History',
            onTap: () {
              // Navigate to login history
            },
          ),

          const SizedBox(height: spacing20),

          // Notifications Section
          _SettingsSectionHeader(title: '🔔 Notifications'),
          _SettingsToggleTile(
            title: 'Job Assigned',
            value: _jobNotifications,
            onChanged: (value) =>
                setState(() => _jobNotifications = value),
          ),
          _SettingsToggleTile(
            title: 'Schedule Changed',
            value: _scheduleNotifications,
            onChanged: (value) =>
                setState(() => _scheduleNotifications = value),
          ),
          _SettingsToggleTile(
            title: 'Warranty Tasks',
            value: _warrantyNotifications,
            onChanged: (value) =>
                setState(() => _warrantyNotifications = value),
          ),
          _SettingsToggleTile(
            title: 'Messages',
            value: _messageNotifications,
            onChanged: (value) =>
                setState(() => _messageNotifications = value),
          ),
          _SettingsToggleTile(
            title: 'Payment Notifications',
            value: _paymentNotifications,
            onChanged: (value) =>
                setState(() => _paymentNotifications = value),
          ),

          const SizedBox(height: spacing20),

          // Location Section
          _SettingsSectionHeader(title: '📍 Location'),
          _SettingsToggleTile(
            title: 'Share Location',
            value: _shareLocation,
            onChanged: (value) =>
                setState(() => _shareLocation = value),
          ),
          _SettingsMenuTile(
            title: 'Location Update Interval',
            subtitle: _locationUpdateInterval,
            onTap: () {
              // Show interval picker
            },
          ),
          _SettingsToggleTile(
            title: 'Offline Support',
            value: _offlineSupport,
            onChanged: (value) =>
                setState(() => _offlineSupport = value),
            subtitle: 'Sync data when offline',
          ),

          const SizedBox(height: spacing20),

          // App Section
          _SettingsSectionHeader(title: 'ℹ️ App'),
          Container(
            padding: const EdgeInsets.all(spacing16),
            color: lightGray,
            child: Text(
              'App Version: 1.0.0\nBuild: 2024050101',
              style: bodySmall,
            ),
          ),
          _SettingsMenuTile(
            title: 'Check for Updates',
            onTap: () {
              // Check app updates
            },
          ),
          _SettingsMenuTile(
            title: 'Terms & Conditions',
            onTap: () {
              // Open terms
            },
          ),
          _SettingsMenuTile(
            title: 'Privacy Policy',
            onTap: () {
              // Open privacy
            },
          ),
          _SettingsMenuTile(
            title: 'Help & Support',
            onTap: () {
              // Open help
            },
          ),

          const SizedBox(height: spacing24),

          // Logout Button
          Padding(
            padding: const EdgeInsets.all(spacing16),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: errorColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                // Show logout confirmation
                _showLogoutConfirmation();
              },
              child: const Text('🚪 Logout'),
            ),
          ),

          const SizedBox(height: spacing20),
        ],
      ),
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Logout'),
        content: const Text(
          'Are you sure you want to logout? You\'ll need to login again.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Perform logout
              // context.read<AuthController>().logout();
            },
            child: const Text('Logout', style: TextStyle(color: errorColor)),
          ),
        ],
      ),
    );
  }
}

// Helper widgets for settings screen
class _SettingsSectionHeader extends StatelessWidget {
  final String title;

  const _SettingsSectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        spacing16,
        spacing20,
        spacing16,
        spacing12,
      ),
      child: Text(
        title,
        style: heading3,
      ),
    );
  }
}

class _SettingsMenuTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _SettingsMenuTile({
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title, style: bodyMedium),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: spacing16,
        vertical: spacing8,
      ),
    );
  }
}

class _SettingsToggleTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingsToggleTile({
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title, style: bodyMedium),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: primaryBlue,
      ),
      onTap: () => onChanged(!value),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: spacing16,
        vertical: spacing8,
      ),
    );
  }
}
```

---

## 📐 Layout Guidelines

### Safe Areas
- Top: 40-56px (status bar + app bar)
- Bottom: 56px (bottom navigation)
- Left/Right: 16px padding

### Responsive Breakpoints
- Small (< 360px): Single column layouts, smaller padding
- Medium (360-600px): Default 16px padding, normal layouts
- Large (> 600px): Consider tablet layout with sidebar

### Motion & Animations
- Page transition: 300ms ease-out
- Status chip color change: 200ms ease-in
- Bottom sheet entrance: 250ms curve: Curves.easeOut
- Button press: 150ms scale animation
- Loading spinner: continuous rotation (2s cycle)

---

## 🧪 Testing Checklist

- [ ] All screens render correctly on 4.5"-6.5" devices
- [ ] Touch targets minimum 44x44dp
- [ ] Images load and cache properly
- [ ] Form validation works with edge cases
- [ ] Permissions requested and handled
- [ ] Offline state handled gracefully
- [ ] Images compress before upload
- [ ] Real-time updates via WebSocket/FCM work
- [ ] Deep linking to job details from notifications
- [ ] Accessibility: color contrast WCAG AA standard
- [ ] Accessibility: screen reader support for buttons

---

## 📦 Component Library Structure

```dart
lib/
├── core/
│   ├── theme/
│   │   ├── app_theme.dart          // Main ThemeData
│   │   ├── app_colors.dart         // Color constants
│   │   ├── app_text_styles.dart    // TextStyle constants
│   │   └── app_spacing.dart        // Spacing constants
│   └── widgets/
│       ├── common/
│       │   ├── primary_button.dart
│       │   ├── secondary_button.dart
│       │   ├── status_chip.dart
│       │   ├── job_card.dart
│       │   ├── bottom_navigation.dart
│       │   └── app_bar.dart
│       └── inputs/
│           ├── email_input_field.dart
│           ├── password_input_field.dart
│           ├── text_input_field.dart
│           └── phone_input_field.dart
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── models/
│   ├── home/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── models/
│   ├── schedule/
│   ├── job_detail/
│   ├── navigation/
│   ├── completion/
│   ├── issue_report/
│   ├── notifications/
│   └── settings/
└── services/
    ├── firebase_service.dart
    └── location_service.dart
```

---

## 🚀 Implementation Priority

**Phase 1 (MVP):**
1. Authentication (Login, Splash)
2. Home Dashboard
3. Job Detail
4. Google Maps Navigation
5. Status Update

**Phase 2:**
1. Completion form with photos
2. Calendar/Schedule view
3. Notifications
4. Settings

**Phase 3:**
1. Issue reporting
2. Profile management
3. Dark mode support
4. Offline capability

---

