/// User model shared between all apps
/// Maps to Firebase Auth user + Firestore user_profiles collection
library user_model;

class User {
  final String uid;
  final String email;
  final String displayName;
  final String phoneNumber;
  final String role; // "admin", "technician", "customer"
  final String profileImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;

  User({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.phoneNumber,
    required this.role,
    required this.profileImageUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
  });

  /// Convert Firestore document to User model
  factory User.fromMap(Map<String, dynamic> data, String uid) {
    return User(
      uid: uid,
      email: data['email'] ?? '',
      displayName: data['displayName'] ?? '',
      phoneNumber: data['phoneNumber'] ?? '',
      role: data['role'] ?? 'customer',
      profileImageUrl: data['profileImageUrl'] ?? '',
      createdAt: (data['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as dynamic)?.toDate() ?? DateTime.now(),
      isActive: data['isActive'] ?? true,
    );
  }

  /// Convert User model to Firestore document
  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'displayName': displayName,
      'phoneNumber': phoneNumber,
      'role': role,
      'profileImageUrl': profileImageUrl,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'isActive': isActive,
    };
  }

  /// Create a copy with modified fields
  User copyWith({
    String? displayName,
    String? phoneNumber,
    String? profileImageUrl,
    bool? isActive,
  }) {
    return User(
      uid: uid,
      email: email,
      displayName: displayName ?? this.displayName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      role: role,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      isActive: isActive ?? this.isActive,
    );
  }
}
