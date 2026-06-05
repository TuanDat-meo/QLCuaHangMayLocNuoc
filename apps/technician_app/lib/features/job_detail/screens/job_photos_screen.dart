import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';
import '../../../core/services/image_upload_service.dart';

/// Màn hình chụp ảnh hiện trường TRƯỚC khi lắp đặt hoặc SAU khi hoàn thành
/// [isBefore] = true → ảnh trước; false → ảnh sau
class JobPhotosScreen extends StatefulWidget {
  final String jobId;
  final bool isBefore;

  const JobPhotosScreen({
    super.key,
    required this.jobId,
    required this.isBefore,
  });

  @override
  State<JobPhotosScreen> createState() => _JobPhotosScreenState();
}

class _JobPhotosScreenState extends State<JobPhotosScreen> {
  final List<XFile> _pickedFiles = [];
  List<String> _existingUrls = [];
  bool _isUploading = false;
  int _uploadDone = 0;

  String get _folderKey => widget.isBefore ? 'before' : 'after';
  String get _title => widget.isBefore ? 'Ảnh trước khi lắp đặt' : 'Ảnh sau khi hoàn thành';
  Color get _accentColor =>
      widget.isBefore ? const Color(0xff0284c7) : const Color(0xff10b981);

  @override
  void initState() {
    super.initState();
    _loadExisting();
  }

  void _loadExisting() {
    final ctrl = context.read<JobController>();
    final idx = ctrl.jobs.indexWhere((j) => j.id == widget.jobId);
    if (idx == -1) return;
    final job = ctrl.jobs[idx];
    setState(() {
      _existingUrls = List<String>.from(
        widget.isBefore ? job.imagesBefore : job.imagesAfter,
      );
    });
  }

  Future<void> _pick(ImageSource source) async {
    final files = await ImageUploadService.pickImages(
      source: source,
      maxImages: 5 - _pickedFiles.length,
    );
    if (files.isNotEmpty) {
      setState(() => _pickedFiles.addAll(files));
    }
  }

  Future<void> _upload() async {
    if (_pickedFiles.isEmpty) return;
    setState(() {
      _isUploading = true;
      _uploadDone = 0;
    });

    final urls = await ImageUploadService.uploadImages(
      files: _pickedFiles,
      jobId: widget.jobId,
      folder: _folderKey,
      onProgress: (done, total) => setState(() => _uploadDone = done),
    );

    final allUrls = [..._existingUrls, ...urls];
    final ctrl = context.read<JobController>();
    await ctrl.saveJobImages(
      jobId: widget.jobId,
      imagesBefore: widget.isBefore ? allUrls : null,
      imagesAfter: widget.isBefore ? null : allUrls,
    );

    if (mounted) {
      setState(() {
        _isUploading = false;
        _existingUrls = allUrls;
        _pickedFiles.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Đã lưu ${urls.length} ảnh'),
          backgroundColor: _accentColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _existingUrls.length + _pickedFiles.length;

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: Text(_title),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.onSurface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xffe2e8f0)),
        ),
        actions: [
          if (_pickedFiles.isNotEmpty && !_isUploading)
            TextButton.icon(
              onPressed: _upload,
              icon: const Icon(Icons.cloud_upload_outlined, size: 18),
              label: const Text('Lưu'),
              style: TextButton.styleFrom(foregroundColor: _accentColor),
            ),
        ],
      ),
      body: Column(
        children: [
          // ── Header info ─────────────────────────────────────────────────
          Container(
            width: double.infinity,
            color: _accentColor.withValues(alpha: 0.08),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            child: Row(
              children: [
                Icon(
                  widget.isBefore ? Icons.camera_alt : Icons.check_circle_outline,
                  color: _accentColor,
                  size: 22,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    widget.isBefore
                        ? 'Chụp ảnh hiện trạng trước khi bắt đầu lắp đặt'
                        : 'Chụp ảnh xác nhận hoàn thành, bàn giao sản phẩm',
                    style: TextStyle(
                      color: _accentColor,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Upload progress ──────────────────────────────────────────────
          if (_isUploading)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Column(
                children: [
                  LinearProgressIndicator(
                    value: _pickedFiles.isNotEmpty
                        ? _uploadDone / _pickedFiles.length
                        : null,
                    color: _accentColor,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Đang tải lên $_uploadDone/${_pickedFiles.length} ảnh...',
                    style: TextStyle(
                      color: _accentColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),

          // ── Grid ảnh ────────────────────────────────────────────────────
          Expanded(
            child: total == 0
                ? _buildEmptyState()
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemCount: total,
                    itemBuilder: (context, i) {
                      if (i < _existingUrls.length) {
                        // Ảnh đã upload
                        return _buildNetworkPhoto(_existingUrls[i]);
                      } else {
                        // Ảnh mới chọn chưa upload
                        final file = _pickedFiles[i - _existingUrls.length];
                        return _buildLocalPhoto(file);
                      }
                    },
                  ),
          ),
        ],
      ),

      // ── FAB chọn ảnh ────────────────────────────────────────────────────
      floatingActionButton: total < 10
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!kIsWeb)
                  FloatingActionButton.small(
                    heroTag: 'camera',
                    onPressed: () => _pick(ImageSource.camera),
                    backgroundColor: _accentColor,
                    child: const Icon(Icons.camera_alt, color: Colors.white),
                  ),
                const SizedBox(height: 8),
                FloatingActionButton.extended(
                  heroTag: 'gallery',
                  onPressed: () => _pick(ImageSource.gallery),
                  backgroundColor: _accentColor,
                  icon: const Icon(Icons.photo_library_outlined, color: Colors.white),
                  label: const Text(
                    'CHỌN ẢNH',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            )
          : null,
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.add_photo_alternate_outlined,
              size: 72, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            'Chưa có ảnh nào',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Nhấn nút bên dưới để chụp hoặc chọn ảnh',
            style: TextStyle(color: Colors.grey.shade400, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkPhoto(String url) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(url, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                    color: Colors.grey.shade200,
                    child: const Icon(Icons.broken_image_outlined),
                  )),
          Positioned(
            top: 4,
            right: 4,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cloud_done, color: Colors.white, size: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocalPhoto(XFile file) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Stack(
        fit: StackFit.expand,
        children: [
          FutureBuilder<Uint8List>(
            future: file.readAsBytes(),
            builder: (_, snap) {
              if (snap.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snap.hasData && snap.data != null) {
                return Image.memory(snap.data!, fit: BoxFit.cover);
              }
              return const Center(
                child: Icon(Icons.broken_image, color: Colors.grey),
              );
            },
          ),
          // Overlay "chưa upload"
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 3),
              color: Colors.orange.withValues(alpha: 0.8),
              child: const Text(
                'Chưa lưu',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          // Nút xóa
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: () {
                final idx = _pickedFiles.indexOf(file);
                if (idx != -1) setState(() => _pickedFiles.removeAt(idx));
              },
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, color: Colors.white, size: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _base64Encode(List<int> bytes) {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    final output = StringBuffer();
    for (int i = 0; i < bytes.length; i += 3) {
      final b0 = bytes[i];
      final b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      final b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      output.write(chars[(b0 >> 2) & 63]);
      output.write(chars[((b0 << 4) | (b1 >> 4)) & 63]);
      output.write(i + 1 < bytes.length ? chars[((b1 << 2) | (b2 >> 6)) & 63] : '=');
      output.write(i + 2 < bytes.length ? chars[b2 & 63] : '=');
    }
    return output.toString();
  }
}
