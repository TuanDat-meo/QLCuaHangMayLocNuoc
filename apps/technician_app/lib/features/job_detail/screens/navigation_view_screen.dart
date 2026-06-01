import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
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
  final Completer<GoogleMapController> _mapController = Completer();

  // Vị trí mặc định - Hà Nội (sẽ bị ghi đè bởi GPS thật)
  static const LatLng _defaultHanoi = LatLng(21.0285, 105.8542);

  LatLng? _currentPosition;
  bool _isLoadingLocation = true;
  bool _locationPermissionDenied = false;

  Set<Marker> _markers = {};
  MapType _mapType = MapType.normal;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initLocationAndMap();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  // ─── Địa chỉ → Tọa độ giả lập ───────────────────────────────────────────
  // Trong thực tế bạn có thể gọi Google Geocoding API.
  // Hiện tại dùng một bảng tra nhanh cho mock data demo.
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
    return _defaultHanoi; // fallback
  }

  Future<void> _initLocationAndMap() async {
    final jobController = context.read<JobController>();
    final jobIndex = jobController.jobs.indexWhere((j) => j.id == widget.jobId);
    if (jobIndex == -1) return;
    final job = jobController.jobs[jobIndex];
    final destLatLng = _guessLatLngFromAddress(job.address);

    // Xin quyền vị trí
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
          _currentPosition = _defaultHanoi;
          _markers = _buildMarkers(
            currentPos: _defaultHanoi,
            destPos: destLatLng,
            customerName: job.customerName,
          );
        });
      }
      _moveCameraTo(destLatLng);
      return;
    }

    // Lấy vị trí GPS hiện tại
    try {
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
          _markers = _buildMarkers(
            currentPos: currentPos,
            destPos: destLatLng,
            customerName: job.customerName,
          );
        });
      }
      _moveCameraToFitBoth(currentPos, destLatLng);
    } catch (e) {
      // Fallback nếu GPS timeout
      if (mounted) {
        setState(() {
          _currentPosition = _defaultHanoi;
          _isLoadingLocation = false;
          _markers = _buildMarkers(
            currentPos: _defaultHanoi,
            destPos: destLatLng,
            customerName: job.customerName,
          );
        });
      }
      _moveCameraTo(destLatLng);
    }
  }

  Set<Marker> _buildMarkers({
    required LatLng currentPos,
    required LatLng destPos,
    required String customerName,
  }) {
    return {
      Marker(
        markerId: const MarkerId('my_location'),
        position: currentPos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        infoWindow: const InfoWindow(title: 'Vị trí của bạn'),
      ),
      Marker(
        markerId: const MarkerId('destination'),
        position: destPos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(title: customerName, snippet: 'Điểm đến'),
      ),
    };
  }

  Future<void> _moveCameraTo(LatLng target) async {
    final controller = await _mapController.future;
    controller.animateCamera(CameraUpdate.newLatLngZoom(target, 15));
  }

  Future<void> _moveCameraToFitBoth(LatLng a, LatLng b) async {
    final controller = await _mapController.future;
    final bounds = LatLngBounds(
      southwest: LatLng(
        a.latitude < b.latitude ? a.latitude : b.latitude,
        a.longitude < b.longitude ? a.longitude : b.longitude,
      ),
      northeast: LatLng(
        a.latitude > b.latitude ? a.latitude : b.latitude,
        a.longitude > b.longitude ? a.longitude : b.longitude,
      ),
    );
    controller.animateCamera(CameraUpdate.newLatLngBounds(bounds, 80));
  }

  // ─── Mở Google Maps bên ngoài để dẫn đường turn-by-turn ─────────────────
  Future<void> _openGoogleMapsExternal(String address) async {
    final jobController = context.read<JobController>();
    final jobIndex = jobController.jobs.indexWhere((j) => j.id == widget.jobId);
    if (jobIndex == -1) return;
    final destLatLng = _guessLatLngFromAddress(
      jobController.jobs[jobIndex].address,
    );

    // Ưu tiên mở bằng tọa độ thật cho chính xác hơn
    final geoUri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1'
      '&destination=${destLatLng.latitude},${destLatLng.longitude}'
      '&travelmode=driving',
    );

    if (await canLaunchUrl(geoUri)) {
      await launchUrl(geoUri, mode: LaunchMode.externalApplication);
    } else {
      // Fallback: mở bằng địa chỉ văn bản
      final encoded = Uri.encodeComponent(address);
      final fallbackUri = Uri.parse('https://maps.google.com/?q=$encoded');
      await launchUrl(fallbackUri, mode: LaunchMode.externalApplication);
    }
  }

  void _toggleMapType() {
    setState(() {
      _mapType = _mapType == MapType.normal
          ? MapType.satellite
          : MapType.normal;
    });
  }

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final jobIndex = jobController.jobs.indexWhere((j) => j.id == widget.jobId);

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
          // ── Bản đồ Google Maps ──────────────────────────────────────────
          _buildGoogleMap(job),

          // ── Overlay khi đang tải GPS ────────────────────────────────────
          if (_isLoadingLocation) _buildLoadingOverlay(),

          // ── Cảnh báo nếu bị từ chối quyền vị trí ───────────────────────
          if (_locationPermissionDenied) _buildPermissionBanner(),

          // ── Nút chuyển loại bản đồ (Vệ tinh / Thường) ──────────────────
          Positioned(top: 110, right: 16, child: _buildMapTypeButton()),

          // ── Nút định vị lại vị trí của tôi ─────────────────────────────
          Positioned(top: 166, right: 16, child: _buildMyLocationButton(job)),

          // ── Dashboard dưới cùng ─────────────────────────────────────────
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

  Widget _buildGoogleMap(JobModel job) {
    final destLatLng = _guessLatLngFromAddress(job.address);
    return GoogleMap(
      mapType: _mapType,
      style: _darkMapStyle,
      initialCameraPosition: CameraPosition(
        target: _currentPosition ?? destLatLng,
        zoom: 14,
      ),
      markers: _markers,
      myLocationEnabled: !_locationPermissionDenied,
      myLocationButtonEnabled: false,
      zoomControlsEnabled: false,
      compassEnabled: true,
      onMapCreated: (GoogleMapController controller) {
        _mapController.complete(controller);
      },
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: const Color(0xff0f172a).withValues(alpha: 0.7),
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
                'Chưa cấp quyền vị trí. Đang hiển thị bản đồ tổng quan.',
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

  Widget _buildMapTypeButton() {
    return GestureDetector(
      onTap: _toggleMapType,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.9),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xff334155)),
        ),
        child: Icon(
          _mapType == MapType.normal ? Icons.satellite_alt : Icons.map,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildMyLocationButton(JobModel job) {
    return GestureDetector(
      onTap: () {
        if (_currentPosition != null) {
          final destLatLng = _guessLatLngFromAddress(job.address);
          _moveCameraToFitBoth(_currentPosition!, destLatLng);
        }
      },
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xff1e293b).withValues(alpha: 0.9),
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
          // ── Header: tên khách hàng & địa chỉ ───────────────────────────
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

          // ── 2 nút CTA ───────────────────────────────────────────────────
          Row(
            children: [
              // Nút 1: Xem trên bản đồ trong app (di chuyển camera)
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    final destLatLng = _guessLatLngFromAddress(job.address);
                    if (_currentPosition != null) {
                      _moveCameraToFitBoth(_currentPosition!, destLatLng);
                    } else {
                      _moveCameraTo(destLatLng);
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

              // Nút 2: Mở Google Maps bên ngoài – dẫn đường turn-by-turn
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

          // ── Gợi ý: nút cập nhật trạng thái "đang di chuyển" ────────────
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
                      content: Text('✅ Đã cập nhật trạng thái: Đang di chuyển'),
                      backgroundColor: Color(0xff0284c7),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.local_shipping_outlined, size: 16),
              label: const Text('Đánh dấu "Đang di chuyển" đến khách hàng'),
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

// ─── Dark Style cho Google Map ─────────────────────────────────────────────
// Tạo tại: https://mapstyle.withgoogle.com/
const String _darkMapStyle = '''
[
  {"elementType":"geometry","stylers":[{"color":"#212121"}]},
  {"elementType":"labels.icon","stylers":[{"visibility":"off"}]},
  {"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
  {"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},
  {"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"}]},
  {"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},
  {"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},
  {"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},
  {"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
  {"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},
  {"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},
  {"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},
  {"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#2c2c2c"}]},
  {"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},
  {"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},
  {"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#3c3c3c"}]},
  {"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#4e4e4e"}]},
  {"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},
  {"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
  {"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},
  {"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}
]
''';
