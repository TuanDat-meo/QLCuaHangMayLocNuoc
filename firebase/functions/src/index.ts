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
    /**
     * Trigger khi tạo đơn hàng mới
     */
    try {
      const orderId = context.params.orderId;
      const data = snapshot.data();

      console.log(`Order created: ${orderId}`);
      console.log(`Order data:`, data);

      // TODO: Gửi notification đến admin
      // TODO: Ghi audit log
    } catch (error) {
      console.error("Error in onOrderCreated:", error);
      throw error;
    }
  });

export const setCustomClaims = functions
  .region("asia-southeast1")
  .https.onRequest({ cors: true }, async (req, res) => {
    /**
     * Set custom claims (role) cho user
     */
    try {
      const { uid, role } = req.body; // "admin", "technician", "customer"

      if (!uid || !role) {
        res.status(400).json({ error: "Missing uid or role" });
        return;
      }

      // Set custom claims
      await admin.auth().setCustomUserClaims(uid, { role });

      res.status(200).json({
        success: true,
        message: `Role ${role} set for user ${uid}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

export const verifyOtp = functions
  .region("asia-southeast1")
  .https.onRequest({ cors: true }, async (req, res) => {
    /**
     * Xác thực OTP
     */
    // TODO: Implement OTP verification
    res.status(501).json({ error: "OTP verification not implemented" });
  });
