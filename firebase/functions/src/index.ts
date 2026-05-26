/**
 * AquaCareSystem - Firebase Cloud Functions
 * 
 * Xử lý business logic cho hệ thống quản lý máy lọc nước
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Phase 1 - Core Functions

export const onOrderCreated = functions
  .region("asia-southeast1")
  .firestore.document("orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    try {
      const orderId = context.params.orderId;
      const data = snapshot.data();
      console.log(`Order created: ${orderId}`, data);
    } catch (error) {
      console.error("Error in onOrderCreated:", error);
      throw error;
    }
  });

/**
 * Cập nhật thông tin người dùng (Password, Role, v.v.) dành cho Admin
 */
export const adminUpdateUser = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    // Kiểm tra quyền Admin
    if (!context.auth || context.auth.token.role !== 1) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Chỉ Admin mới có quyền thực hiện thao tác này."
      );
    }

    const { uid, password, displayName, phoneNumber, role, status } = data;

    try {
      const updateData: any = {};
      if (password) updateData.password = password;
      if (displayName) updateData.displayName = displayName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;

      // Cập nhật Auth
      if (Object.keys(updateData).length > 0) {
        await admin.auth().updateUser(uid, updateData);
      }

      // Cập nhật Custom Claims nếu role thay đổi
      if (role !== undefined) {
        await admin.auth().setCustomUserClaims(uid, { role });
      }

      // Cập nhật Firestore
      const dbUpdate: any = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      if (displayName) dbUpdate.displayName = displayName;
      if (phoneNumber) dbUpdate.phoneNumber = phoneNumber;
      if (role !== undefined) dbUpdate.role = role;
      if (status) dbUpdate.status = status;

      await admin.firestore().collection("nguoiDung").doc(uid).update(dbUpdate);

      return { success: true, message: "Cập nhật thành công" };
    } catch (error: any) {
      console.error("Error adminUpdateUser:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Xóa người dùng (Auth + Firestore)
 */
export const adminDeleteUser = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 1) {
      throw new functions.https.HttpsError("permission-denied", "Không có quyền.");
    }

    const { uid } = data;
    try {
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("nguoiDung").doc(uid).delete();
      return { success: true };
    } catch (error: any) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

/**
 * Tạo người dùng mới từ Admin
 */
export const adminCreateUser = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 1) {
      throw new functions.https.HttpsError("permission-denied", "Không có quyền.");
    }

    const { email, password, displayName, phoneNumber, role } = data;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        phoneNumber,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      await admin.firestore().collection("nguoiDung").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || "",
        role: role || 0,
        status: "active",
        source: "admin_web",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, uid: userRecord.uid };
    } catch (error: any) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
