"use strict";
/**
 * AquaCareSystem - Firebase Cloud Functions
 *
 * Xử lý business logic cho hệ thống quản lý máy lọc nước
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.setCustomClaims = exports.onOrderCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Phase 1 - Core Functions
exports.onOrderCreated = functions
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
    }
    catch (error) {
        console.error("Error in onOrderCreated:", error);
        throw error;
    }
});
exports.setCustomClaims = functions
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
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});
exports.verifyOtp = functions
    .region("asia-southeast1")
    .https.onRequest({ cors: true }, async (req, res) => {
    /**
     * Xác thực OTP
     */
    // TODO: Implement OTP verification
    res.status(501).json({ error: "OTP verification not implemented" });
});
