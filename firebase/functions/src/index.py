"""
AquaCareSystem - Firebase Cloud Functions

Xử lý business logic cho hệ thống quản lý máy lọc nước
"""

from firebase_functions import firestore_fn, https_fn, options
from firebase_admin import initialize_app, firestore, auth
import json
from datetime import datetime

initialize_app()

# Phase 1 - Core Functions

@firestore_fn.on_document_created(
    database="(default)",
    document="orders/{orderId}",
    timeout_sec=540,
    memory_options=options.MemoryOption.GB_1,
    max_instances=10,
)
def on_order_created(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """Trigger khi tạo đơn hàng mới"""
    snapshot = event.data
    if not snapshot:
        print("No data associated with the event")
        return
    
    data = snapshot.to_dict()
    print(f"Order created: {snapshot.id}")
    print(f"Order data: {data}")
    
    # TODO: Gửi notification đến admin
    # TODO: Ghi audit log


@https_fn.on_request(
    cors=options.CorsPolicy(
        allow_credentials=True,
        allow_methods=["get", "post"],
        allow_origins=["*"],
    )
)
def set_custom_claims(req: https_fn.Request) -> https_fn.Response:
    """Set custom claims (role) cho user"""
    try:
        data = req.get_json()
        uid = data.get('uid')
        role = data.get('role')  # "admin", "technician", "customer"
        
        if not uid or not role:
            return https_fn.Response("Missing uid or role", status=400)
        
        # Set custom claims
        auth.set_custom_user_claims(uid, {'role': role})
        
        return https_fn.Response(
            json.dumps({'success': True, 'message': f'Role {role} set for user {uid}'}),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return https_fn.Response(f"Error: {str(e)}", status=500)


@https_fn.on_request()
def verify_otp(req: https_fn.Request) -> https_fn.Response:
    """Xác thực OTP"""
    # TODO: Implement OTP verification
    return https_fn.Response("OTP verification not implemented", status=501)
