import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class NavigationViewScreen extends StatefulWidget {
  final String jobId;
  const NavigationViewScreen({super.key, required this.jobId});

  @override
  State<NavigationViewScreen> createState() => _NavigationViewScreenState();
}

class _NavigationViewScreenState extends State<NavigationViewScreen>
    with TickerProviderStateMixin {
  final MapController _mapController = MapController();

  static const LatLng _defaultHanoi = LatLng(21.0285, 105.8542);
  static const LatLng _defaultHCMC = LatLng(10.7769, 106.7009);

  LatLng? _currentPosition;
  LatLng _destPosition = _defaultHCMC;
  bool _isLoadingLocation = true;
  bool _locationPermissionDenied = false;
  bool _isSatellite = false;
  bool _mapReady = false;

  // ── Tracking liên tục ────────────────────────────────────────────────
  StreamSubscription<Position>? _positionStream;
  bool _followMode = true;   // camera tự bám theo KTV
  double? _distanceToDestM;  // khoảng cách (mét) tới điểm đến
  double _headingDeg = 0;    // hướng di chuyển (độ)

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initLocationAndMap();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _positionStream?.cancel();
    super.dispose();
  }

  // ─── Tra tọa độ xấp xỉ từ địa chỉ (mock data) ───────────────────────────
  LatLng _guessLatLngFromAddress(String address) {
    final lower = address.toLowerCase();
    if (lower.contains('mỹ đình') || lower.contains('phạm hùng')) {
      return const LatLng(21.0275, 105.7803);
    } else if (lower.contains('vinhomes riverside') ||
        lower.contains('sài đồng') ||
        lower.contains('long biên')) {
      return const LatLng(21.0608, 105.8978);
    } else if (lower.contains('linh đàm') || lower.contains('hoàng mai')) {
      return const LatLng(20.9748, 105.8420);
    } else if (lower.contains('khuất duy tiến') ||
        lower.contains('thanh xuân')) {
      return const LatLng(20.9959, 105.8000);
    } else if (lower.contains('thụy khuê') || lower.contains('tây hồ')) {
      return const LatLng(21.0465, 105.8323);
    }
    if (lower.contains('tp.hcm') || lower.contains('hồ chí minh') || lower.contains('tphcm') || lower.contains('quận 1') || lower.contains('quận 3') || lower.contains('bến nghé')) {
      return _defaultHCMC;
    }
    return _defaultHanoi;
  }

  Future<void> _initLocationAndMap() async {
    final jobController = context.read<JobController>();
    final jobIndex =
        jobController.jobs.indexWhere((j) => j.id == widget.jobId);
    if (jobIndex == -1) return;
    final job = jobController.jobs[jobIndex];
    
    LatLng destLatLng;
    if (job.customerLatitude != null && job.customerLongitude != null) {
      destLatLng = LatLng(job.customerLatitude!, job.customerLongitude!);
    } else {
      destLatLng = _guessLatLngFromAddress(job.address);
    }

    if (mounted) setState(() => _destPosition = destLatLng);

    // ── Web: chỉ hiển thị điểm đến (không cần GPS) ───────────────────────
    if (kIsWeb) {
      // Web: hiển thị điểm đến ngay, map tự center qua initialCenter
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
          _currentPosition = null;
        });
      }
      // Không cần gọi _mapController.move() – đã dùng initialCenter
      return;
    }

    // ── Mobile: xin quyền GPS ─────────────────────────────────────────────
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever ||
        permission == LocationPermission.denied) {
      if (mounted) {
        setState(() {
          _locationPermissionDenied = true;
          _isLoadingLocation = false;
          _currentPosition = null;
        });
      }
      // Map đã center vào destPosition qua initialCenter
      return;
    }

    try {
      // Lấy vị trí lần đầu
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      final currentPos = LatLng(pos.latitude, pos.longitude);
      if (mounted) {
        setState(() {
          _currentPosition = currentPos;
          _isLoadingLocation = false;
          _distanceToDestM = _calcDistance(currentPos, destLatLng);
          _headingDeg = pos.heading;
        });
      }
      if (_mapReady) _fitBothPoints(currentPos, destLatLng);

      // Bắt đầu stream vị trí liên tục
      _startPositionStream(destLatLng);
    } catch (_) {
      if (mounted) {
        setState(() {
          _currentPosition = null;
          _isLoadingLocation = false;
        });
      }
    }
  }

  // ─── Stream GPS liên tục ──────────────────────────────────────────────
  void _startPositionStream(LatLng dest) {
    _positionStream?.cancel();
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5, // cập nhật mỗi khi di chuyển >= 5m
      ),
    ).listen((Position pos) {
      if (!mounted) return;
      final newPos = LatLng(pos.latitude, pos.longitude);
      setState(() {
        _currentPosition = newPos;
        _distanceToDestM = _calcDistance(newPos, dest);
        _headingDeg = pos.heading;
      });
      // Nếu Follow Mode đang bật → camera bám theo KTV
      if (_followMode && _mapReady) {
        _mapController.move(newPos, _mapController.camera.zoom);
      }
    });
  }

  // ─── Tính khoảng cách 2 điểm (mét) ──────────────────────────────────
  double _calcDistance(LatLng a, LatLng b) {
    return Geolocator.distanceBetween(
      a.latitude, a.longitude,
      b.latitude, b.longitude,
    );
  }

  // ─── Format khoảng cách hiển thị ─────────────────────────────────────
  String _formatDistance(double meters) {
    if (meters < 1000) return '${meters.toStringAsFixed(0)} m';
    return '${(meters / 1000).toStringAsFixed(1)} km';
  }

  void _fitBothPoints(LatLng a, LatLng b) {
    final bounds = LatLngBounds(a, b);
    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: bounds,
        padding: const EdgeInsets.fromLTRB(48, 100, 48, 280),
      ),
    );
  }

  // ─── Mở Google Maps bên ngoài ──────────────────────────────────────────
  Future<void> _openGoogleMapsExternal(String address) async {
    final encoded = Uri.encodeComponent(address);
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1'
      '&destination=$encoded'
      '&travelmode=driving',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: kIsWeb
            ? LaunchMode.platformDefault
            : LaunchMode.externalApplication,
      );
    } else {
      final fallback = Uri.parse('https://maps.google.com/?q=$encoded');
      await launchUrl(fallback, mode: LaunchMode.platformDefault);
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final jobIndex =
        jobController.jobs.indexWhere((j) => j.id == widget.jobId);

    if (jobIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Dẫn đường')),
        body: const Center(child: Text('Không tìm thấy công việc.')),
      );
    }

    final job = jobController.jobs[jobIndex];

    return Scaffold(
      backgroundColor: const Color(0xff0f172a),
      extendBodyBehindAppBar: true,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          _buildFlutterMap(job),
          if (_isLoadingLocation) _buildLoadingOverlay(),
          if (_locationPermissionDenied) _buildPermissionBanner(),

          // ── Chip khoảng cách còn lại ──────────────────────────────────
          if (_distanceToDestM != null && !_isLoadingLocation && !kIsWeb)
            Positioned(
              top: 110,
              left: 0,
              right: 72,
              child: Center(child: _buildDistanceChip()),
            ),

          // ── Nút vệ tinh / bản đồ ──────────────────────────────────────
          Positioned(top: 110, right: 16, child: _buildMapTypeButton()),

          // ── Nút Follow Mode (bám theo KTV) ────────────────────────────
          Positioned(top: 166, right: 16, child: _buildFollowButton()),

          // ── Nút xem toàn cảnh ─────────────────────────────────────────
          Positioned(top: 222, right: 16, child: _buildRecenterButton()),

          // ── Dashboard dưới cùng ───────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      leading: Container(
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.9),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      title: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Text(
          'DẪN ĐƯỜNG ĐẾN KHÁCH HÀNG',
          style: TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w900,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  Widget _buildFlutterMap(JobModel job) {
    final destLatLng = _destPosition;

    // Tile URLs – không cần API key, hoạt động ngay
    final tileUrl = _isSatellite
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    final markers = <Marker>[
      // Marker điểm đến (nhà khách hàng)
      Marker(
        point: destLatLng,
        width: 120,
        height: 58,
        alignment: Alignment.topCenter,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xffef4444),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: Text(
                job.customerName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            const Icon(
              Icons.location_on,
              color: Color(0xffef4444),
              size: 30,
            ),
          ],
        ),
      ),
    ];

    // Marker vị trí kỹ thuật viên (chỉ trên mobile có GPS)
    if (_currentPosition != null) {
      markers.add(
        Marker(
          point: _currentPosition!,
          width: 44,
          height: 44,
          child: Transform.rotate(
            // Xoay marker theo hướng di chuyển (heading)
            angle: _headingDeg * (3.14159265 / 180),
            child: Container(
              decoration: BoxDecoration(
                color: _followMode ? AppColors.primary : const Color(0xff0ea5e9),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.6),
                    blurRadius: 12,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: const Icon(
                Icons.navigation,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ),
      );
    }

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: destLatLng,
        initialZoom: 14,
        onMapReady: () {
          setState(() => _mapReady = true);
          if (_currentPosition != null) {
            _fitBothPoints(_currentPosition!, _destPosition);
          }
        },
        // Tắt follow mode khi user tự kéo bản đồ
        onPositionChanged: (_, hasGesture) {
          if (hasGesture && _followMode) {
            setState(() => _followMode = false);
          }
        },
      ),
      children: [
        TileLayer(
          urlTemplate: tileUrl,
          subdomains: _isSatellite ? const [] : const ['a', 'b', 'c'],
          userAgentPackageName: 'com.aquacare.technician',
          maxZoom: 19,
        ),
        MarkerLayer(markers: markers),
      ],
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: const Color(0xff0f172a).withValues(alpha: 0.75),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Đang xác định vị trí GPS...',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionBanner() {
    return Positioned(
      top: 100,
      left: 16,
      right: 72,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xffea580c).withValues(alpha: 0.95),
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Row(
          children: [
            Icon(Icons.location_off, color: Colors.white, size: 16),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Chưa cấp quyền vị trí. Hiển thị bản đồ điểm đến.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Chip khoảng cách ─────────────────────────────────────
  Widget _buildDistanceChip() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      child: Container(
        key: ValueKey(_distanceToDestM),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xff0f172a).withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.route, color: AppColors.primary, size: 15),
            const SizedBox(width: 6),
            Text(
              'Còn ${_formatDistance(_distanceToDestM!)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Nút Follow Mode ─────────────────────────────────────
  Widget _buildFollowButton() {
    return Tooltip(
      message: _followMode ? 'Camera đang bám theo bạn' : 'Bật bám theo vị trí',
      child: GestureDetector(
        onTap: () {
          setState(() => _followMode = !_followMode);
          // Bật lại follow → move camera tới KTV ngay
          if (_followMode && _currentPosition != null && _mapReady) {
            _mapController.move(
              _currentPosition!, _mapController.camera.zoom,
            );
          }
        },
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: _followMode
                ? AppColors.primary.withValues(alpha: 0.9)
                : const Color(0xff1e293b).withValues(alpha: 0.95),
            shape: BoxShape.circle,
            border: Border.all(
              color: _followMode ? AppColors.primary : const Color(0xff334155),
              width: 2,
            ),
          ),
          child: Icon(
            _followMode ? Icons.gps_fixed : Icons.gps_not_fixed,
            color: Colors.white,
            size: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildMapTypeButton() {
    return GestureDetector(
      onTap: () => setState(() => _isSatellite = !_isSatellite),
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.95),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xff334155)),
        ),
        child: Icon(
          _isSatellite ? Icons.map_outlined : Icons.satellite_alt,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildRecenterButton() {
    return GestureDetector(
      onTap: () {
        if (_currentPosition != null) {
          _fitBothPoints(_currentPosition!, _destPosition);
        } else {
          _mapController.move(_destPosition, 14);
        }
      },
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.95),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xff334155)),
        ),
        child: const Icon(
          Icons.my_location,
          color: AppColors.primary,
          size: 20,
        ),
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
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Header: tên + địa chỉ ─────────────────────────────────────
          Row(
            children: [
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) => Transform.scale(
                  scale: _pulseAnimation.value,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.location_on,
                      color: AppColors.primary,
                      size: 22,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job.customerName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      job.address,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.grey.shade400,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xff334155)),
          const SizedBox(height: 16),

          // ── 2 nút CTA ────────────────────────────────────────────────
          Row(
            children: [
              // Nút 1: Xem toàn cảnh bản đồ
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    if (_currentPosition != null) {
                      _fitBothPoints(_currentPosition!, _destPosition);
                    } else {
                      _mapController.move(_destPosition, 14);
                    }
                  },
                  icon: const Icon(Icons.zoom_out_map, size: 16),
                  label: const Text('XEM TOÀN CẢNH'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white70,
                    side: const BorderSide(
                      color: Color(0xff475569),
                      width: 1.5,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Nút 2: Mở Google Maps ngoài (turn-by-turn navigation)
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: () => _openGoogleMapsExternal(job.address),
                  icon: const Icon(Icons.directions, size: 18),
                  label: const Text('MỞ GOOGLE MAPS'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                    textStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Cập nhật trạng thái "Đang di chuyển" ─────────────────────
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              onPressed: () {
                final ctrl = context.read<JobController>();
                final currentJob = ctrl.jobs.firstWhere(
                  (j) => j.id == widget.jobId,
                );
                if (currentJob.status == JobStatus.waiting) {
                  ctrl.updateJobStatus(widget.jobId, JobStatus.onTheWay);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content:
                          Text('✅ Đã cập nhật: Đang di chuyển đến khách hàng'),
                      backgroundColor: Color(0xff0284c7),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.local_shipping_outlined, size: 16),
              label: const Text(
                'Đánh dấu "Đang di chuyển" đến khách hàng',
              ),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xff0284c7),
                textStyle: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
