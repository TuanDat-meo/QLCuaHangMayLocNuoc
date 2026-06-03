import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;

class ImageUploadService {
  static final FirebaseStorage _storage = FirebaseStorage.instance;
  static final ImagePicker _picker = ImagePicker();

  /// Chọn ảnh từ camera hoặc thư viện
  static Future<List<XFile>> pickImages({
    ImageSource source = ImageSource.gallery,
    int maxImages = 5,
  }) async {
    if (source == ImageSource.gallery) {
      final result = await _picker.pickMultiImage(imageQuality: 80);
      return result.take(maxImages).toList();
    } else {
      final result = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      return result != null ? [result] : [];
    }
  }

  /// Upload danh sách ảnh lên Firebase Storage
  /// Trả về danh sách URLs download
  static Future<List<String>> uploadImages({
    required List<XFile> files,
    required String jobId,
    required String folder, // 'before' | 'after' | 'issue'
    void Function(int done, int total)? onProgress,
  }) async {
    final List<String> urls = [];
    final timestamp = DateTime.now().millisecondsSinceEpoch;

    for (int i = 0; i < files.length; i++) {
      try {
        final file = files[i];
        final ext = file.name.split('.').last.toLowerCase();
        final path = 'jobs/$jobId/$folder/${timestamp}_$i.$ext';
        final ref = _storage.ref().child(path);

        UploadTask task;
        if (kIsWeb) {
          final bytes = await file.readAsBytes();
          task = ref.putData(bytes, SettableMetadata(contentType: 'image/$ext'));
        } else {
          task = ref.putFile(File(file.path));
        }

        final snapshot = await task;
        final url = await snapshot.ref.getDownloadURL();
        urls.add(url);
        onProgress?.call(i + 1, files.length);
      } catch (e) {
        debugPrint('Upload error for ${files[i].name}: $e');
      }
    }

    return urls;
  }

  /// Upload một ảnh đơn lẻ
  static Future<String?> uploadSingle({
    required XFile file,
    required String jobId,
    required String folder,
  }) async {
    final results = await uploadImages(
      files: [file],
      jobId: jobId,
      folder: folder,
    );
    return results.isNotEmpty ? results.first : null;
  }
}
