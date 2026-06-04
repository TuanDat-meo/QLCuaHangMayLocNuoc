import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ImageUploadService {
  static final ImagePicker _picker = ImagePicker();

  // Lấy thông tin cấu hình Cloudinary từ .env
  static String get _cloudName => dotenv.env['CLOUDINARY_CLOUD_NAME'] ?? '';
  static String get _uploadPreset => dotenv.env['CLOUDINARY_UPLOAD_PRESET'] ?? '';

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

  /// Upload danh sách ảnh lên Cloudinary
  /// Trả về danh sách URLs secure download
  static Future<List<String>> uploadImages({
    required List<XFile> files,
    required String jobId,
    required String folder, // 'before' | 'after' | 'issue' | 'avatars'
    void Function(int done, int total)? onProgress,
  }) async {
    final List<String> urls = [];

    // Nếu người dùng chưa cấu hình Cloud Name hoặc Preset, cảnh báo lỗi
    if (_cloudName.isEmpty || _uploadPreset.isEmpty) {
      debugPrint('LỖI: Chưa cấu hình CLOUDINARY_CLOUD_NAME hoặc CLOUDINARY_UPLOAD_PRESET trong file .env');
      return [];
    }

    for (int i = 0; i < files.length; i++) {
      try {
        final file = files[i];
        final url = Uri.parse('https://api.cloudinary.com/v1_1/$_cloudName/image/upload');
        
        final request = http.MultipartRequest('POST', url);
        
        // Thêm tham số cho Unsigned Upload
        request.fields['upload_preset'] = _uploadPreset;
        request.fields['folder'] = 'aquacare/$folder/$jobId';
        
        if (kIsWeb) {
          final bytes = await file.readAsBytes();
          request.files.add(http.MultipartFile.fromBytes(
            'file',
            bytes,
            filename: file.name,
          ));
        } else {
          request.files.add(await http.MultipartFile.fromPath(
            'file',
            file.path,
          ));
        }

        final streamedResponse = await request.send();
        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200 || response.statusCode == 201) {
          final responseData = json.decode(response.body);
          final secureUrl = responseData['secure_url'] as String;
          urls.add(secureUrl);
          onProgress?.call(i + 1, files.length);
        } else {
          debugPrint('Cloudinary upload failed: ${response.statusCode} - ${response.body}');
        }
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
