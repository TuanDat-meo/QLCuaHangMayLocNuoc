# 🎨 Component API Reference

Quick lookup for all available components and how to use them.

---

## Colors

**Location:** `lib/core/theme/app_theme.dart`

### Usage
```dart
import 'package:technician_app/core/theme/app_theme.dart';

// In your widget
Container(
  color: AppColors.primaryBlue,
  child: Text('Hello', style: TextStyle(color: AppColors.textPrimary)),
)
```

### Available Colors

| Constant | Hex Code | Usage |
|----------|----------|-------|
| `primaryBlue` | #00459A | Main brand color, primary buttons, active states |
| `darkNavy` | #0B1C30 | Text, headings, secondary brand color |
| `lightGray` | #F8FAFC | Background, surface, disabled states |
| `statusWaiting` | #FFA500 | Orange - Waiting jobs |
| `statusOnWay` | #00459A | Blue - On the way |
| `statusArrived` | #3B82F6 | Light blue - Arrived |
| `statusInstalling` | #7C3AED | Purple - Installing |
| `statusCompleted` | #10B981 | Green - Completed |
| `statusNeedSupport` | #EF4444 | Red - Need support |
| `textPrimary` | #0B1C30 | Primary text |
| `textSecondary` | #64748B | Secondary text, labels |
| `borderColor` | #E2E8F0 | Borders, dividers |
| `errorColor` | #EF4444 | Error states |
| `warningColor` | #FFA500 | Warnings |
| `successColor` | #10B981 | Success states |

---

## Typography

**Location:** `lib/core/theme/app_theme.dart`

### Usage
```dart
Text(
  'My Title',
  style: AppTypography.heading2,
)
```

### Available Styles

| Constant | Size | Weight | Usage |
|----------|------|--------|-------|
| `heading1` | 28px | W900 | Page titles |
| `heading2` | 24px | W900 | Section titles |
| `heading3` | 20px | W900 | Subsection titles |
| `heading4` | 18px | W700 | Card titles |
| `bodyLarge` | 16px | W500 | Large body text |
| `bodyMedium` | 14px | W500 | Standard body text |
| `bodySmall` | 12px | W400 | Secondary text, labels |
| `caption` | 11px | W400 | Very small text, hints |
| `buttonLarge` | 15px | W900 | Primary button text |
| `buttonMedium` | 14px | W700 | Medium button text |
| `buttonSmall` | 12px | W700 | Small button text |

---

## Spacing System

**Location:** `lib/core/theme/app_theme.dart`

### 8px Grid System

```dart
// Use in all padding/margin
SizedBox(height: AppSpacing.spacing16) // 16px = 2 grid units
```

| Constant | Value | Usage |
|----------|-------|-------|
| `spacing2` | 2px | Minimal spacing |
| `spacing4` | 4px | Extra small |
| `spacing6` | 6px | Small spacing |
| `spacing8` | 8px | Base unit |
| `spacing12` | 12px | 1.5x base |
| `spacing16` | 16px | 2x base (standard padding) |
| `spacing20` | 20px | 2.5x base |
| `spacing24` | 24px | 3x base (between sections) |
| `spacing32` | 32px | 4x base |
| `spacing40` | 40px | 5x base |
| `spacing48` | 48px | 6x base |
| `spacing56` | 56px | 7x base |
| `spacing64` | 64px | 8x base |

---

## Border Radius

**Location:** `lib/core/theme/app_theme.dart`

```dart
Container(
  borderRadius: BorderRadius.circular(AppRadius.medium),
)
```

| Constant | Value | Usage |
|----------|-------|-------|
| `small` | 8px | Small elements, icons |
| `medium` | 12px | Inputs, small buttons |
| `large` | 16px | Cards, large buttons |
| `xl` | 24px | Extra large components |
| `full` | 999px | Circles, avatars, fully rounded |

---

## Shadows

**Location:** `lib/core/theme/app_theme.dart`

```dart
Container(
  boxShadow: [AppShadows.card],
)
```

| Constant | Usage |
|----------|-------|
| `card` | Card shadow (subtle) |
| `button` | Button shadow (elevation) |
| `elevation1` | Level 1 elevation |
| `elevation2` | Level 2 elevation (default card) |
| `elevation3` | Level 3 elevation (prominent) |

---

## Buttons

**Location:** `lib/core/widgets/common_widgets.dart`

### PrimaryButton

```dart
PrimaryButton(
  label: 'Submit',
  onPressed: () { },
  isLoading: false,          // Optional
  isEnabled: true,           // Optional
  width: double.infinity,    // Optional
  icon: Icons.check,         // Optional
)
```

**Parameters:**
- `label` (required): Button text
- `onPressed` (required): Callback function
- `isLoading` (optional): Show loading spinner
- `isEnabled` (optional): Enable/disable button
- `width` (optional): Fixed width
- `icon` (optional): Icon before text
- `textStyle` (optional): Custom text style
- `padding` (optional): Custom padding

### SecondaryButton

```dart
SecondaryButton(
  label: 'Cancel',
  onPressed: () { },
  isLoading: false,          // Optional
  isEnabled: true,           // Optional
  width: double.infinity,    // Optional
  color: AppColors.errorColor, // Optional
  icon: Icons.close,         // Optional
)
```

**Parameters:**
- Same as PrimaryButton
- `color` (optional): Button border/text color

### TextButton (Use Material TextButton)

```dart
TextButton(
  onPressed: () { },
  child: const Text('Skip'),
)
```

---

## Input Fields

**Location:** `lib/core/theme/app_theme.dart` (pre-configured theme)

### Text Input

```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Email',
    hintText: 'Enter your email',
    prefixIcon: const Icon(Icons.email_outlined),
    suffixIcon: const Icon(Icons.clear),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppRadius.medium),
    ),
  ),
  validator: FormValidation.validateEmail,
)
```

### Predefined Input Validation

```dart
import 'package:technician_app/docs/TECHNICIAN_APP_IMPLEMENTATION_GUIDE.dart';

// Email validation
validator: FormValidation.validateEmail,

// Password validation
validator: FormValidation.validatePassword,

// Phone validation
validator: FormValidation.validatePhone,

// Amount validation
validator: FormValidation.validateAmount,
```

---

## Cards & Containers

### Job Card

```dart
JobCard(
  jobId: 'JOB-12345',
  customerName: 'Nguyen Van A',
  customerPhone: '0912345678',
  address: '123 Nguyen Hue St, District 1, HCMC',
  status: 'WAITING',
  statusColor: AppColors.statusWaiting,
  priority: 1,
  timeRemaining: '50 mins remaining',
  isUrgent: true,
  onNavigate: () { },
  onViewDetails: () { },
  onCall: () { },
)
```

**Parameters:**
- `jobId`: Job identifier
- `customerName`: Customer full name
- `customerPhone`: Phone number with country code
- `address`: Full address
- `status`: Current job status (string)
- `statusColor`: Color for the status badge
- `priority`: Priority number (1-5)
- `timeRemaining`: Formatted time remaining string
- `isUrgent`: Flag for visual urgency indicator
- `onNavigate`: Callback for navigate button
- `onViewDetails`: Callback for details button
- `onCall`: Callback for call button (optional)

### Generic Card Container

```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(AppRadius.large),
    border: Border.all(color: AppColors.borderColor),
    boxShadow: const [AppShadows.card],
  ),
  padding: const EdgeInsets.all(AppSpacing.spacing16),
  child: // Your content
)
```

---

## Status Components

### Status Chip

```dart
StatusChip(
  label: 'COMPLETED',
  backgroundColor: AppColors.statusCompleted,
  borderColor: AppColors.statusCompleted,
  textColor: AppColors.statusCompleted,
  filled: true,  // Optional: fill background or outline
)
```

**Parameters:**
- `label` (required): Status text
- `backgroundColor` (required): Background color
- `borderColor` (required): Border color
- `textColor` (required): Text color
- `filled` (optional): Filled or outline style
- `width` (optional): Fixed width

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
  currentStatusIndex: 2,  // Arrived (0-indexed)
  statusColors: [
    AppColors.statusWaiting,
    AppColors.statusOnWay,
    AppColors.statusArrived,
    AppColors.statusInstalling,
    AppColors.statusCompleted,
  ],
)
```

**Parameters:**
- `statuses`: List of status labels
- `currentStatusIndex`: Current step (0-indexed)
- `statusColors`: Colors for each step

---

## Lists & Empty States

### Empty State Widget

```dart
EmptyStateWidget(
  title: 'All Done!',
  subtitle: 'No more jobs scheduled for today',
  icon: Icons.celebration_outlined,
  actionText: 'Go Offline',      // Optional
  actionLabel: () { },           // Optional
)
```

**Parameters:**
- `title` (required): Main message
- `subtitle` (required): Detailed message
- `icon` (required): Icon to display
- `actionText` (optional): Button label
- `actionLabel` (optional): Button callback

### Loading Spinner

```dart
LoadingSpinner(
  color: AppColors.primaryBlue,  // Optional
  size: 40,                       // Optional (default 40)
)
```

---

## Banners & Alerts

### Info Banner

```dart
InfoBanner(
  message: 'Please update your password',
  backgroundColor: Color(0xFFF0F9FF),    // Optional
  textColor: AppColors.primaryBlue,      // Optional
  iconColor: AppColors.primaryBlue,      // Optional
  icon: Icons.info_outline,              // Optional
  onClose: () { },                       // Optional
)

// Error Banner
InfoBanner(
  message: 'Error: Failed to load jobs',
  backgroundColor: AppColors.errorColor.withOpacity(0.15),
  textColor: AppColors.errorColor,
  iconColor: AppColors.errorColor,
  icon: Icons.error_outline,
)

// Success Banner
InfoBanner(
  message: 'Job completed successfully!',
  backgroundColor: AppColors.successColor.withOpacity(0.15),
  textColor: AppColors.successColor,
  iconColor: AppColors.successColor,
  icon: Icons.check_circle_outline,
)
```

---

## App Bar

### Custom App Bar

```dart
AppBarWidget(
  title: 'Job Details',
  onBackPressed: () => Navigator.pop(context),
  actions: [
    IconButton(
      icon: const Icon(Icons.share),
      onPressed: () { },
    ),
  ],
  backgroundColor: Colors.white,    // Optional
  centerTitle: true,                // Optional
  elevation: 0,                     // Optional
)
```

**Parameters:**
- `title` (optional): App bar title
- `onBackPressed` (optional): Back button callback
- `actions` (optional): List of action buttons
- `backgroundColor` (optional): Background color
- `centerTitle` (optional): Center the title
- `elevation` (optional): Shadow elevation
- `bottom` (optional): Bottom widget (search, tabs)

---

## Layout Components

### Safe Area Padding

```dart
Scaffold(
  body: SafeArea(
    child: Padding(
      padding: const EdgeInsets.all(AppSpacing.spacing16),
      child: // Your content
    ),
  ),
)
```

### Common Layout Pattern

```dart
Scaffold(
  appBar: AppBarWidget(
    title: 'Screen Title',
    onBackPressed: () => Navigator.pop(context),
  ),
  body: SingleChildScrollView(
    padding: const EdgeInsets.all(AppSpacing.spacing16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Your content
      ],
    ),
  ),
  bottomNavigationBar: // Optional
)
```

---

## Forms & Validation

### Complete Form Example

```dart
Form(
  key: _formKey,
  child: Column(
    children: [
      TextFormField(
        controller: _emailController,
        decoration: InputDecoration(
          labelText: 'Email',
          prefixIcon: const Icon(Icons.email_outlined),
        ),
        validator: FormValidation.validateEmail,
      ),
      const SizedBox(height: AppSpacing.spacing16),
      TextFormField(
        controller: _passwordController,
        obscureText: true,
        decoration: InputDecoration(
          labelText: 'Password',
          prefixIcon: const Icon(Icons.lock_outlined),
        ),
        validator: FormValidation.validatePassword,
      ),
      const SizedBox(height: AppSpacing.spacing24),
      SizedBox(
        width: double.infinity,
        child: PrimaryButton(
          label: 'Login',
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              // Submit form
            }
          },
        ),
      ),
    ],
  ),
)
```

---

## Navigation & Dialogs

### Show Confirmation Dialog

```dart
showDialog(
  context: context,
  builder: (_) => AlertDialog(
    title: const Text('Confirm Action'),
    content: const Text('Are you sure?'),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      TextButton(
        onPressed: () {
          Navigator.pop(context);
          // Perform action
        },
        child: const Text('Confirm'),
      ),
    ],
  ),
)
```

### Show Bottom Sheet

```dart
showModalBottomSheet(
  context: context,
  builder: (_) => Container(
    padding: const EdgeInsets.all(AppSpacing.spacing16),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Your content
      ],
    ),
  ),
)
```

---

## Quick Copy-Paste Templates

### Screen Template

```dart
import 'package:flutter/material.dart';
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
    // Initialize
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBarWidget(
        title: 'My Screen',
        onBackPressed: () => Navigator.pop(context),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Your content
            ],
          ),
        ),
      ),
    );
  }
}
```

### Full-Width Button

```dart
SizedBox(
  width: double.infinity,
  child: PrimaryButton(
    label: 'Submit',
    onPressed: () { },
  ),
)
```

### Two-Column Buttons

```dart
Row(
  children: [
    Expanded(
      child: SecondaryButton(
        label: 'Cancel',
        onPressed: () { },
      ),
    ),
    const SizedBox(width: AppSpacing.spacing12),
    Expanded(
      child: PrimaryButton(
        label: 'Confirm',
        onPressed: () { },
      ),
    ),
  ],
)
```

---

## Import Cheat Sheet

```dart
// Theme & Colors
import 'package:technician_app/core/theme/app_theme.dart';

// Components
import 'package:technician_app/core/widgets/common_widgets.dart';

// Using in widget
AppColors.primaryBlue
AppTypography.heading2
AppSpacing.spacing16
AppRadius.medium
AppShadows.card

// Button
PrimaryButton(...)
SecondaryButton(...)

// Card
JobCard(...)
StatusChip(...)

// Layout
AppBarWidget(...)
EmptyStateWidget(...)
LoadingSpinner(...)
InfoBanner(...)

// Timeline
JobStatusTimeline(...)
```

---

## Customization

### Custom Colors

```dart
// For temporary overrides (prefer using AppColors)
Container(
  color: AppColors.primaryBlue.withOpacity(0.5),
  child: // content
)
```

### Custom Text Styles

```dart
// Extend AppTypography styles
Text(
  'Custom Text',
  style: AppTypography.bodyMedium.copyWith(
    color: AppColors.errorColor,
    fontWeight: FontWeight.w700,
  ),
)
```

### Custom Padding

```dart
// Always use AppSpacing constants
padding: const EdgeInsets.symmetric(
  horizontal: AppSpacing.spacing16,
  vertical: AppSpacing.spacing12,
)
```

---

## Common Patterns

### List with Empty State

```dart
if (items.isEmpty) {
  EmptyStateWidget(
    title: 'No items',
    subtitle: 'Create one to get started',
    icon: Icons.add_circle_outline,
    actionText: 'Create',
    actionLabel: () { },
  )
} else {
  ListView.builder(
    itemCount: items.length,
    itemBuilder: (context, index) {
      return // Item widget
    },
  )
}
```

### Loading State

```dart
if (isLoading) {
  const Center(child: LoadingSpinner());
} else if (error != null) {
  InfoBanner(
    message: error!,
    backgroundColor: AppColors.errorColor.withOpacity(0.15),
    textColor: AppColors.errorColor,
    icon: Icons.error_outline,
  );
} else {
  // Success content
}
```

---

