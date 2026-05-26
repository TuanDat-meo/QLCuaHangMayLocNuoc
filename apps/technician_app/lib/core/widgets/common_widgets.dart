import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Primary CTA Button
class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isEnabled;
  final double? width;
  final EdgeInsets? padding;
  final TextStyle? textStyle;
  final IconData? icon;

  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isEnabled = true,
    this.width,
    this.padding,
    this.textStyle,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: ElevatedButton(
        onPressed: (isEnabled && !isLoading) ? onPressed : null,
        style: ElevatedButton.styleFrom(
          padding: padding ??
              const EdgeInsets.symmetric(
                vertical: AppSpacing.spacing16,
              ),
        ),
        child: isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isEnabled ? Colors.white : AppColors.textSecondary,
                  ),
                  strokeWidth: 2,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon),
                    const SizedBox(width: AppSpacing.spacing8),
                  ],
                  Text(
                    label,
                    style: textStyle ?? AppTypography.buttonLarge,
                  ),
                ],
              ),
      ),
    );
  }
}

/// Secondary Button (Outlined)
class SecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isEnabled;
  final double? width;
  final EdgeInsets? padding;
  final Color? color;
  final IconData? icon;

  const SecondaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isEnabled = true,
    this.width,
    this.padding,
    this.color,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? AppColors.primaryBlue;

    return SizedBox(
      width: width,
      child: OutlinedButton(
        onPressed: (isEnabled && !isLoading) ? onPressed : null,
        style: OutlinedButton.styleFrom(
          padding: padding ??
              const EdgeInsets.symmetric(
                vertical: AppSpacing.spacing16,
              ),
          side: BorderSide(
            color: buttonColor,
            width: 2,
          ),
        ),
        child: isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(buttonColor),
                  strokeWidth: 2,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, color: buttonColor),
                    const SizedBox(width: AppSpacing.spacing8),
                  ],
                  Text(
                    label,
                    style: AppTypography.buttonLarge.copyWith(
                      color: buttonColor,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Status Chip - Used for displaying job status
class StatusChip extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;
  final double? width;
  final bool filled;

  const StatusChip({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.borderColor,
    required this.textColor,
    this.width,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.spacing12,
        vertical: AppSpacing.spacing6,
      ),
      decoration: BoxDecoration(
        color: filled ? backgroundColor : backgroundColor.withAlpha((0.15 * 255).round()),
        border: Border.all(
          color: borderColor.withAlpha((0.3 * 255).round()),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(AppRadius.small),
      ),
      child: Center(
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            color: filled ? Colors.white : textColor,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

/// Job Card - Main card for job display
class JobCard extends StatelessWidget {
  final String jobId;
  final String customerName;
  final String customerPhone;
  final String address;
  final String status;
  final Color statusColor;
  final int priority;
  final String timeRemaining;
  final VoidCallback onNavigate;
  final VoidCallback onViewDetails;
  final VoidCallback? onCall;
  final bool isUrgent;

  const JobCard({
    super.key,
    required this.jobId,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.status,
    required this.statusColor,
    required this.priority,
    required this.timeRemaining,
    required this.onNavigate,
    required this.onViewDetails,
    this.onCall,
    this.isUrgent = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.large),
        border: Border.all(color: AppColors.borderColor),
      ),
      margin: const EdgeInsets.only(bottom: AppSpacing.spacing16),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.spacing16),
            decoration: BoxDecoration(
              color: statusColor.withAlpha((0.1 * 255).round()),
              border: const Border(
                bottom: BorderSide(color: AppColors.borderColor),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.spacing8,
                        vertical: AppSpacing.spacing4,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Priority $priority',
                        style: AppTypography.caption.copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                StatusChip(
                  label: status.toUpperCase(),
                  backgroundColor: statusColor,
                  borderColor: statusColor,
                  textColor: statusColor,
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Customer info
                Row(
                  children: [
                    const Icon(
                      Icons.person_outline,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppSpacing.spacing8),
                    Expanded(
                      child: Text(
                        customerName,
                        style: AppTypography.bodyMedium,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (onCall != null)
                      GestureDetector(
                        onTap: onCall,
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.spacing8),
                          decoration: BoxDecoration(
                            color: Colors.green.withAlpha((0.1 * 255).round()),
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
                const SizedBox(height: AppSpacing.spacing12),

                // Address
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppSpacing.spacing8),
                    Expanded(
                      child: Text(
                        address,
                        style: AppTypography.bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.spacing12),

                // Time remaining
                Row(
                  children: [
                    const Icon(
                      Icons.schedule,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppSpacing.spacing8),
                    Text(
                      timeRemaining,
                      style: AppTypography.bodySmall.copyWith(
                        color: isUrgent
                            ? AppColors.warningColor
                            : AppColors.textSecondary,
                        fontWeight: isUrgent ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Actions
          Container(
            padding: const EdgeInsets.all(AppSpacing.spacing16),
            decoration: BoxDecoration(
              color: AppColors.lightGray.withAlpha((0.5 * 255).round()),
              border: const Border(
                top: BorderSide(color: AppColors.borderColor),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: SecondaryButton(
                    label: 'Navigate',
                    onPressed: onNavigate,
                    icon: Icons.navigation,
                  ),
                ),
                const SizedBox(width: AppSpacing.spacing12),
                Expanded(
                  child: PrimaryButton(
                    label: 'Details',
                    onPressed: onViewDetails,
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

/// App Bar with custom styling
class AppBarWidget extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final bool centerTitle;
  final PreferredSizeWidget? bottom;
  final double? elevation;

  const AppBarWidget({
    super.key,
    this.title,
    this.onBackPressed,
    this.actions,
    this.backgroundColor,
    this.centerTitle = true,
    this.bottom,
    this.elevation = 0,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: title != null
          ? Text(
              title!,
              style: AppTypography.heading3,
            )
          : null,
      centerTitle: centerTitle,
      backgroundColor: backgroundColor ?? Colors.white,
      elevation: elevation,
      leading: onBackPressed != null
          ? IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: onBackPressed,
            )
          : null,
      actions: actions,
      bottom: bottom,
    );
  }

  @override
  Size get preferredSize =>
      Size.fromHeight(kToolbarHeight + (bottom?.preferredSize.height ?? 0));
}

/// Status Timeline
class JobStatusTimeline extends StatelessWidget {
  final List<String> statuses;
  final int currentStatusIndex;
  final List<Color> statusColors;

  const JobStatusTimeline({
    super.key,
    required this.statuses,
    required this.currentStatusIndex,
    required this.statusColors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        statuses.length,
        (index) {
          final isCompleted = index < currentStatusIndex;
          final isCurrent = index == currentStatusIndex;
          final isLast = index == statuses.length - 1;
          final color = statusColors[index];

          return Column(
            children: [
              Row(
                children: [
                  // Circle
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted || isCurrent ? color : AppColors.borderColor,
                      border: isCurrent
                          ? Border.all(color: AppColors.primaryBlue, width: 3)
                          : null,
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 20,
                            )
                          : Text(
                              (index + 1).toString(),
                              style: TextStyle(
                                color: isCurrent
                                    ? AppColors.primaryBlue
                                    : AppColors.textSecondary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.spacing12),

                  // Label
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          statuses[index],
                          style: TextStyle(
                            fontWeight: isCurrent
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: isCompleted || isCurrent
                                ? AppColors.textPrimary
                                : AppColors.textSecondary,
                          ),
                        ),
                        if (isCurrent)
                          Text(
                            'Current',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryBlue,
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
                    top: AppSpacing.spacing12,
                    bottom: AppSpacing.spacing12,
                  ),
                  child: Container(
                    width: 2,
                    height: 32,
                    color: AppColors.borderColor,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

/// Empty State Widget
class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback? actionLabel;
  final String? actionText;

  const EmptyStateWidget({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.actionLabel,
    this.actionText,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: AppColors.textSecondary.withAlpha((0.3 * 255).round()),
          ),
          const SizedBox(height: AppSpacing.spacing24),
          Text(
            title,
            style: AppTypography.heading3,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.spacing12),
          Text(
            subtitle,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          if (actionText != null && actionLabel != null) ...[
            const SizedBox(height: AppSpacing.spacing32),
            PrimaryButton(
              label: actionText!,
              onPressed: actionLabel!,
              width: 200,
            ),
          ],
        ],
      ),
    );
  }
}

/// Loading Spinner
class LoadingSpinner extends StatelessWidget {
  final Color? color;
  final double size;

  const LoadingSpinner({
    super.key,
    this.color,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: size,
      width: size,
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? AppColors.primaryBlue,
        ),
        strokeWidth: 3,
      ),
    );
  }
}

/// Information Banner
class InfoBanner extends StatelessWidget {
  final String message;
  final Color backgroundColor;
  final Color textColor;
  final Color iconColor;
  final IconData icon;
  final VoidCallback? onClose;

  const InfoBanner({
    super.key,
    required this.message,
    this.backgroundColor = const Color(0xFFF0F9FF),
    this.textColor = AppColors.primaryBlue,
    this.iconColor = AppColors.primaryBlue,
    this.icon = Icons.info_outline,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.spacing12),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(AppRadius.medium),
        border: Border.all(
          color: textColor.withAlpha((0.3 * 255).round()),
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: iconColor,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.spacing12),
          Expanded(
            child: Text(
              message,
              style: AppTypography.bodySmall.copyWith(
                color: textColor,
              ),
            ),
          ),
          if (onClose != null)
            GestureDetector(
              onTap: onClose,
              child: Icon(
                Icons.close,
                size: 16,
                color: textColor,
              ),
            ),
        ],
      ),
    );
  }
}
