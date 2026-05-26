═══════════════════════════════════════════════════════════════════════════════
AquaCareSystem — KẾ HOẠCH CHI TIẾT 3 TUẦN
Phân chia công việc cho nhóm 3 người: Đạt, Huy, Bình
═══════════════════════════════════════════════════════════════════════════════

📌 QUICK SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Dự án: Hệ thống quản lý bán máy lọc nước (3 app: Customer, Technician, Admin Web)
Trạng thái hiện tại: Phase 1 đánh dấu [x] hoàn tất nhưng code chưa 100% complete
Mục tiêu 3 tuần: Hoàn thiện code → Kiểm thử đầy đủ → Sẵn sàng deploy

Deadline: 6/6/2026
Scope: 51 task (40 development + 11 testing/deployment)
Total Effort: ~320 hours (≈ 10.7 hours/day × 3 people × 21 working days)

═══════════════════════════════════════════════════════════════════════════════
👤 PHÂN CÔNG NHÂN SỰ
═══════════════════════════════════════════════════════════════════════════════

【 ĐẠT 】Backend + Firebase + Database
───────────────────────────────────────
✓ Firebase Cloud Functions (5-6 functions)
✓ Firestore Security Rules
✓ Storage Rules
✓ Database consistency
✓ Integration testing
✓ Performance optimization
✓ Production deployment

Tasks: T1.01-T1.07, T3.01-T3.05 (13 tasks)
Total Hours: ~78 hours (40 dev + 38 testing)

【 HUY 】Admin Web (React + TypeScript + Vite)
───────────────────────────────────────
✓ Admin Dashboard UI
✓ Users Management (CRUD)
✓ Orders Management
✓ Technician Management
✓ Products Management
✓ Settings & Permissions
✓ Responsive design
✓ Production deployment

Tasks: T1.08-T1.09, T2.13-T2.17, T3.06-T3.10 (15 tasks)
Total Hours: ~88 hours (56 dev + 32 polish/test)

【 BÌNH 】Mobile Apps (Flutter)
───────────────────────────────────────
✓ Customer App: Auth, Home, Cart, Orders, Tracking, Profile, Notifications
✓ Technician App: Auth, Home, Job Detail, Job Actions, Photos, COD, Completion, Notifications
✓ Both apps: Feature completeness, UI/UX polish, testing
✓ APK/IPA builds

Tasks: T1.10-T1.13, T2.01-T2.12, T3.11-T3.17 (23 tasks)
Total Hours: ~154 hours (88 dev + 66 testing)

═══════════════════════════════════════════════════════════════════════════════
📅 TIMELINE CHI TIẾT
═══════════════════════════════════════════════════════════════════════════════

【 TUẦN 1: 17/5 - 23/5 】Thiết lập Backend & Admin Web
───────────────────────────────────────────────────────

ĐẠT (Backend - 40 hours)
├─ T1.01 onStatusChanged (3d) → 19/5
│   Send FCM when order status changes
│   - Query Firestore listener on orders/{id} status update
│   - Check role (customer/technician/admin)
│   - Send FCM notification via Firebase Admin SDK
│   - Log to analytics collection
│
├─ T1.02 onCompletionSubmitted (1d) → 20/5
│   Auto create device + warranty when KTV completes job
│   - Trigger on assignments/{id}/completions create
│   - Parse photo URLs + COD amount
│   - Create devices/{id} record
│   - Create warranties/{id} record
│   - Update orders/{id} status → completed
│
├─ T1.03 checkStockOnOrder (1d) → 20/5
│   Validate stock before order confirmation
│   - Callable function from customer app
│   - Check products/{pid} stock
│   - If stock >= qty: return {status: confirmed}
│   - Else: create pre_orders record, return {status: pre_order}
│
├─ T1.04 onStockBelowThreshold (1d) → 23/5 [BONUS]
│   Send alert when stock < 5
│   - Trigger on products/{id} stock update
│   - Check if new stock < 5
│   - Create alerts/{id} document
│   - Send FCM to admin
│
├─ T1.05 Review Existing Functions (2d) → 21/5
│   Audit adminCreateUser/Update/Delete
│   - Test all 3 functions
│   - Add input validation (email format, password strength)
│   - Add Vietnamese error messages
│   - Add Firestore audit log entry
│   - Verify role-based access control
│
├─ T1.06 Firestore Security Rules (1d) → 22/5
│   Verify role-based permissions work correctly
│   - Test: getRole() function reads user.role correctly
│   - Test: isAdmin() → role == 1
│   - Test: isOwner(uid) works
│   - Test: collections access per role
│   - Test: edge cases (user updating own profile)
│   - Deploy rules to staging
│
└─ T1.07 Storage Rules (1d) → 22/5
    Verify file access permissions
    - Test: public/* readable by everyone
    - Test: products/* admin-write only
    - Test: technician/{uid}/* only owner + admin
    - Test: users/{uid}/profile/* owner-write only

HUY (Admin Web - 32 hours)
├─ T1.08 Users Management Page (4d) → 23/5
│   Display: ID|Name|Email|Phone|Role|Status|Actions table
│   - Fetch users from Firestore
│   - Filter by role dropdown
│   - Search input (name/email/phone)
│   - Table with pagination
│   - Edit button → Modal with form fields:
│     * displayName (editable)
│     * phoneNumber (editable)
│     * status dropdown (active/inactive/banned)
│   - Delete button → Confirm modal → Call adminDeleteUser
│   - Create button → Modal with form:
│     * email, password, displayName, phoneNumber, role
│     * Call adminCreateUser
│   - Status badges: green=active, gray=inactive, red=banned
│   - UI: Responsive, loading states, error messages
│
└─ T1.09 Dashboard KPI Widgets (4d) → 23/5
    Display key metrics
    - 4 KPI cards:
      * Total Revenue: sum(orders.final_price where status='completed')
      * Orders Today: count(orders where created_at >= today)
      * Active Technicians: count(users where role='technician' AND status='active')
      * Avg Order Value: sum(total_price) / count(orders)
    - Revenue Trend: 7-day line chart (Recharts)
    - Top Products: bar chart (product name vs order count)
    - Use TanStack React Query for real-time data
    - Format currency as VND (1.234.567 ₫)
    - Loading skeletons
    - Error handling

BÌNH (Mobile - 32 hours)
├─ T1.10 Customer Auth Verification (3d) → 20/5
│   Test & fix auth flow
│   - Sign up: email→password→firebase.auth.createUserWithEmailAndPassword()
│     Then create user doc in Firestore (users/{uid})
│   - Sign in: email→password→firebase.auth.signInWithEmailAndPassword()
│     Check token created + saved in SharedPreferences
│   - Password reset: email→firebase.auth.sendPasswordResetEmail()
│   - Session persist: Read SharedPreferences on app start
│   - Verify redirects: Auth → Home screen, No auth → Login screen
│   - Test error messages: invalid email, weak password, user not found
│
├─ T1.11 Technician Auth Verification (3d) → 20/5
│   Test KTV login
│   - Phone/Email + password login
│   - Verify user doc in Firestore has role='technician'
│   - If not technician → show error "Not authorized as technician"
│   - On success → navigate to home (job list)
│   - Token persist in SharedPreferences
│
├─ T1.12 Customer Cart Verification (2d) → 22/5
│   Test cart operations
│   - Add product: increases qty (if same product exists, increment qty)
│   - Remove product: delete from cart
│   - Update qty: change quantity slider/input
│   - Persist cart in local storage (SharedPreferences or Hive)
│   - Proceed to checkout: transfer to checkout screen
│   - Test: cart empty, single item, multiple items
│
└─ T1.13 Technician Home Verification (2d) → 21/5
    Test job list today
    - Query: assignments where status='assigned' AND assigned_date=today
    - Display job cards: OrderID|CustomerName|Address|Product|CreatedTime
    - Tap job → navigate to job_detail page
    - Real-time listener: new jobs appear instantly
    - Refresh button to manually refresh
    - Empty state: "No jobs assigned today"

═══════════════════════════════════════════════════════════════════════════════

【 TUẦN 2: 24/5 - 30/5 】Mobile Apps Completion & Admin Web Features
────────────────────────────────────────────────────────────────────

BÌNH (Mobile - 56 hours) - Main Effort
├─ Technician App Core (28 hours)
│  ├─ T2.01 Job Detail Screen (2d) → 25/5
│  │  Show: Order details + Customer info + Google Maps
│  │  - Order card: Product name, qty, price, customer name
│  │  - Customer card: Name, phone, address
│  │  - Google Maps: marker at customer location, route from current to customer
│  │  - Get current location: geolocator package
│  │  - Get customer location: from Firestore GeoPoint
│  │  - Draw polyline: location.flutter_map or google_maps_flutter
│  │  - Buttons: [Accept] [Reject] with icons
│  │
│  ├─ T2.02 Job Actions (1d) → 26/5
│  │  Update assignment status
│  │  - Accept: assignments/{id} status='accepted'
│  │  - Reject: assignments/{id} status='cancelled' + send FCM admin
│  │  - On way: assignments/{id} status='on_route'
│  │  - Arrived: assignments/{id} status='arrived'
│  │  - After each update: send FCM to customer + admin
│  │  - Navigate to next screen after action
│  │
│  ├─ T2.03 Photo Capture (2d) → 27/5
│  │  Max 5 photos
│  │  - Camera button: open camera_picker
│  │  - Take photo → preview + add to gallery
│  │  - Gallery display: horizontal scrollable photo list
│  │  - Remove photo: X button on each thumbnail
│  │  - Counter badge: "3/5"
│  │  - On submit: upload all photos to Storage
│  │    Path: storage/technician/{uid}/{assignmentId}/{timestamp}.jpg
│  │  - Store URLs in assignments/{id}/completions/{completionId}
│  │
│  ├─ T2.04 COD + Tip Form (1d) → 28/5
│  │  Currency input for payment
│  │  - Input 1: COD amount (money received from customer)
│  │  - Input 2: Tip amount (optional, default 0)
│  │  - Validate: COD > 0
│  │  - Format: Vietnamese currency (e.g., "50.000")
│  │  - Submit button → Create assignments/{id}/completions record
│  │  - Trigger: onCompletionSubmitted function
│  │
│  ├─ T2.05 Job Completion Flow (1d) → 28/5
│  │  Integration: Photos + COD → Success
│  │  - Show step indicators: (1) Photos → (2) Payment → (3) Done
│  │  - After step 2 submit:
│  │    * Show success screen: "Job completed successfully!"
│  │    * Display summary: OrderID, TechName, CompletionTime, COD, Tip
│  │    * Button: Back to Home
│  │    * Auto-navigate after 2 seconds
│  │
│  ├─ T2.06 Technician Notifications (1d) → 29/5
│  │  FCM for job assignments
│  │  - Initialize FCM: firebase_messaging
│  │  - Save FCM token to Firestore users/{uid}/fcmTokens
│  │  - Listen to FCM messages:
│  │    * New assignment: "You have new job"
│  │    * Job cancelled: "Job cancelled"
│  │    * Admin message: "Admin notice"
│  │  - Display local push notification
│  │  - Tap notification → navigate to job detail
│  │
│  └─ T2.07 Technician Profile (1d) → 30/5
│     User profile screen
│     - Display: Name, phone, address, profile pic
│     - Stats: Completed jobs (count), rating (average), earnings (sum COD)
│     - Edit button → Modal: Edit name/phone/address
│     - Sign out button
│
├─ Customer App Orders (28 hours)
│  ├─ T2.08 Checkout Flow (2d) → 25/5
│  │  Cart → Address → Order placement
│  │  - Address input: Google Places autocomplete
│  │    * Search field: "Nhập địa chỉ giao hàng"
│  │    * Shows suggestions: "123 Nguyễn Huệ, Hồ Chí Minh"
│  │    * Get coordinates: GeoPoint from places API
│  │  - Order summary: Product | Qty | Price | Delivery fee | Total
│  │  - Review cart: can edit qty/remove items
│  │  - Place Order button:
│  │    * Create orders doc: customer_id, product_id, qty, address, total_price
│  │    * Status = 'pending'
│  │    * Trigger onOrderCreated function
│  │  - On success: show order number + clear cart
│  │  - Navigate to orders list
│  │
│  ├─ T2.09 Orders List Screen (2d) → 25/5
│  │  Show all orders
│  │  - Query: orders where customer_id = current_user
│  │  - Display table: OrderID | Date | Status | Total | Actions
│  │  - Filter tabs: All | Pending | Confirmed | In Progress | Completed
│  │  - Search by order ID
│  │  - Pagination: show 10 per page
│  │  - Tap order row → order detail
│  │  - Status badges: colors per status
│  │
│  ├─ T2.10 Order Detail + Tracking (2d) → 27/5
│  │  Real-time tracking
│  │  - Section 1: Order info
│  │    * Order ID, date, product, qty, price
│  │  - Section 2: Technician info
│  │    * Name, phone (clickable to call), rating, photo
│  │  - Section 3: Real-time map
│  │    * Show tech current location (if status >= 'on_route')
│  │    * Show customer location (marker)
│  │    * Draw route between them
│  │    * Distance + estimated time
│  │  - Section 4: Status timeline
│  │    * Steps: Pending → Confirmed → On Way → Arrived → Completed
│  │    * Current step highlighted
│  │    * Timestamps for each step
│  │  - Real-time listener: update map every 10 seconds
│  │
│  ├─ T2.11 Customer Notifications (1d) → 28/5
│  │  FCM for order updates
│  │  - Save FCM token
│  │  - Receive notifications:
│  │    * "Đơn hàng của bạn đã được xác nhận"
│  │    * "Kỹ thuật viên đang trên đường"
│  │    * "Kỹ thuật viên đã tới nơi"
│  │    * "Lắp đặt hoàn tất"
│  │  - Tap notification → navigate to order detail
│  │
│  └─ T2.12 Customer Profile (1d) → 30/5
│     User profile & history
│     - Display: Name, phone, email, address, profile pic
│     - Edit button → Modal: Edit fields
│     - Order history: last 10 orders (ID, date, status)
│     - Sign out

HUY (Admin Web - 40 hours)
├─ T2.13 Orders Management (2d) → 26/5
│  Table: OrderID|Customer|Product|Qty|Total|Status|Date|Actions
│  - Filter by status dropdown
│  - Search by order ID or customer name
│  - Sort by date (newest first)
│  - Pagination: 20 orders per page
│  - Click order → show detail modal:
│    * Full order info + assignment info (if assigned)
│    * View technician details (if assigned)
│    * Edit order notes (admin-only)
│  - Status badge colors
│  - Export button (export to Excel) - optional
│
├─ T2.14 Technician Assignment (1d) → 27/5
│  Assign KTV to pending orders
│  - Show pending orders only
│  - Click order → Assignment modal:
│    * List available technicians (role='technician' AND status='active')
│    * Show technician: photo, name, phone, current jobs
│    * Select technician → Assign button
│    * Backend: Call createAssignment function
│      - Create assignments/{id} doc
│      - Update orders/{id} status → 'assigned'
│      - Send FCM to technician
│    * On success: refresh orders list
│
├─ T2.15 Technicians List & Rating (1d) → 28/5
│  Show all technicians
│  - Table: Name | Phone | Rating (avg stars) | Completed Jobs | Status
│  - Filter by status: Online/Offline/On Break
│  - Search by name/phone
│  - Click technician → Detail view:
│    * Name, phone, address, email
│    * Stats: total jobs, completed, cancelled, average rating
│    * Recent jobs (last 5)
│    * Workload today: how many jobs assigned
│
├─ T2.16 Products Management (1d) → 29/5
│  CRUD products
│  - List table: ProductID|Name|Category|Price|Stock|Status|Actions
│  - Add button:
│    * Modal form: name, description, category, price, stock
│    * Image upload to Storage (drag & drop)
│    * Submit → Create products/{id} doc
│  - Edit button: update fields + re-upload image
│  - Delete button: soft delete (status='inactive')
│  - Filter by category
│  - Search by name
│
└─ T2.17 Settings & Permissions (1d) → 30/5
   Settings page
   - Section 1: Roles & Permissions
     * Display: Admin, Manager, Technician, Customer roles
     * Expandable: show permissions for each role
     * View-only (permission management by super admin)
   - Section 2: Notification Settings
     * Checkboxes: Send email notifications
     * Checkboxes: Send in-app notifications
     * Checkboxes: Send SMS (if integrated)
   - Section 3: System Settings
     * App version
     * API status
     * Database status
   - Save button

════════════════════════════════════════════════════════════════════════════════

【 TUẦN 3: 31/5 - 6/6 】Testing, Bug Fixes, Deployment
────────────────────────────────────────────────────────

ĐẠT (Backend Testing - 32 hours)
├─ T3.01 End-to-End Order Flow Testing (2d) → 1/6
│  Full test: Customer → Admin → Technician → Completion
│  Scenario:
│  1. Customer signs up + adds address
│  2. Customer adds product to cart + checkout (triggers checkStockOnOrder)
│  3. Order created in Firestore (triggers onOrderCreated)
│  4. Admin receives notification (verify FCM)
│  5. Admin assigns technician (creates assignment)
│  6. Technician receives notification (verify FCM)
│  7. Technician accepts job (status → accepted)
│  8. Technician on route (status → on_route, customer sees map update)
│  9. Technician arrived (status → arrived)
│  10. Technician takes 3 photos + enters COD amount
│  11. Submit completion (triggers onCompletionSubmitted)
│  12. Device + Warranty created automatically
│  13. Order marked completed
│  14. Customer receives notification
│  15. Verify all Firestore docs created correctly
│  16. Verify all FCM notifications sent
│
├─ T3.02 Security Testing (1d) → 2/6
│  Verify security rules prevent access
│  - Test 1: Unauthenticated user tries to read orders → Denied
│  - Test 2: Customer A tries to read Customer B's orders → Denied
│  - Test 3: Technician tries to delete admin user → Denied
│  - Test 4: Admin can read all orders → Allowed
│  - Test 5: Technician can only read own assignments → Allowed
│  - Test 6: Storage: Non-admin tries to upload to products/ → Denied
│  - Test 7: Storage: Technician can upload to technician/{uid}/ → Allowed
│
├─ T3.03 Bug Fixes (1d) → 2/6
│  Fix errors found during testing
│  - Review Cloud Function logs (Firebase Console)
│  - Check for errors: null pointers, undefined fields, failed queries
│  - Fix error messages (must be Vietnamese)
│  - Re-deploy functions
│  - Re-test problematic flows
│
├─ T3.04 Performance Optimization (1d) → 3/6
│  Speed up queries & functions
│  - Identify slow queries (Firestore query latency)
│  - Add composite indexes for common filters
│  - Optimize function execution (< 3 seconds target)
│  - Batch operations: reduce round trips to Firestore
│  - Cache frequently accessed data
│
└─ T3.05 Firebase Production Deployment (1d) → 4/6
   Deploy to production
   - Run: firebase deploy --only functions,firestore:rules,storage
   - Verify deployment succeeded
   - Test production functions
   - Monitor for errors in real-time (Firebase Console)

HUY (Admin Web Polish - 32 hours)
├─ T3.06 UI/UX Responsive Design (1d) → 1/6
│  Test on multiple devices
│  - Desktop 1920px: all features visible + readable
│  - Tablet 768px: layout reflows, no overflow
│  - Mobile 375px: stacked layout, readable text
│  - Fix any responsive issues
│  - Dark mode check (if applicable)
│  - Font sizes, padding, spacing consistent
│
├─ T3.07 Bug Fixes - Admin Web (1d) → 2/6
│  Fix issues found during T2
│  - Data not loading: verify Firestore queries
│  - Form validation: test edge cases
│  - Navigation: test routing between pages
│  - Firestore sync: real-time updates working
│  - Error messages: display correctly
│
├─ T3.08 Performance (1d) → 3/6
│  Optimize web app
│  - Check bundle size (npm run build)
│  - Compress images
│  - Code splitting: lazy load pages
│  - Remove unused CSS/JS
│  - Target: Lighthouse score > 80
│
├─ T3.09 Build & Deploy (1d) → 4/6
│  Production build
│  - Run: npm run build
│  - Verify: dist/ folder created
│  - Run: firebase deploy --only hosting
│  - Test production URL: should be live
│  - Verify all features work on live URL
│
└─ T3.10 Final Testing (1d) → 5/6
   Regression testing
   - Test all CRUD: create user, edit user, delete user
   - Test filters: filter by role, status
   - Test search: search user by name/email
   - Test dashboard: metrics display correctly
   - Test orders: filter, search, view detail
   - Test assignments: assign technician, verify FCM
   - On live production URL

BÌNH (Mobile Testing & Build - 40 hours)
├─ T3.11 Customer App Testing (2d) → 1/6
│  Full end-to-end testing
│  - Devices: 1 Android phone + 1 iOS (if available)
│  - Test flows:
│    1. Sign up → email verification → confirm
│    2. Sign in → persist token → app restart (token still valid)
│    3. Home: browse products, search, view details
│    4. Add to cart: add multiple items, update qty
│    5. Checkout: select address with Google Places
│    6. Place order: verify order created
│    7. Orders list: view all orders, filter by status
│    8. Order detail: real-time map tracking, status timeline
│    9. Notifications: check FCM messages received
│    10. Profile: edit info, view order history, sign out
│    11. Edge cases: no internet, slow network, app kill & restart
│
├─ T3.12 Technician App Testing (1d) → 2/6
│  Full end-to-end testing
│  - Devices: 1 Android phone + 1 iOS (if available)
│  - Test flows:
│    1. Login: enter credentials, verify role
│    2. Home: view jobs assigned today
│    3. Job detail: view order details, show maps
│    4. Accept job: status changes to accepted
│    5. On route: navigate using Google Maps
│    6. Arrived: status changes to arrived
│    7. Photos: capture 3 photos, verify upload to Storage
│    8. COD: enter money amount, validate input
│    9. Tip: enter optional tip
│    10. Submit: completion triggers, success message
│    11. Notifications: receive FCM for new jobs
│    12. Profile: view stats, edit info
│
├─ T3.13 Customer App Fixes (1d) → 3/6
│  Fix bugs found during T3.11
│  - Crashes: stacktrace analysis
│  - UI layout: fixes for responsive issues
│  - Firestore: ensure real-time updates working
│  - Camera/Gallery: permissions + file handling
│  - Navigation: correct route transitions
│
├─ T3.14 Technician App Fixes (1d) → 3/6
│  Fix bugs found during T3.12
│  - Crashes: debug + fix
│  - Maps display: verify geolocation accuracy
│  - Notifications: FCM delivery consistency
│  - Photo upload: retry on failure
│  - Status updates: verify Firestore writes
│
├─ T3.15 Mobile Performance (1d) → 4/6
│  Optimize mobile apps
│  - Reduce APK size: target < 150MB
│  - Firestore queries: add pagination (10 items per page)
│  - Image loading: implement lazy loading, caching
│  - FCM processing: optimize notification handling
│  - Bundle analysis: flutter analyze
│
├─ T3.16 Build APK/IPA (1d) → 5/6
│  Create release builds
│  - Customer App:
│    * flutter build apk --release
│    * flutter build ios --release (if available)
│    * Sign APK with release keystore
│  - Technician App:
│    * flutter build apk --release
│    * flutter build ios --release (if available)
│  - Verify sizes:
│    * Customer APK: < 120MB
│    * Technician APK: < 120MB
│  - Store builds in artifacts folder
│
└─ T3.17 Final Validation (1d) → 6/6
   Last check all platforms
   - Android devices: install APK, test
   - iOS: test if available
   - Web: test Chrome & Firefox
   - Data consistency: orders sync across apps
   - All links: clickable, navigate correctly
   - All buttons: responsive, labeled
   - Notifications: test Firebase notifications
   - Sign out: test on all apps
   - Ready for production!

════════════════════════════════════════════════════════════════════════════════
📊 RISK ASSESSMENT & MITIGATION
════════════════════════════════════════════════════════════════════════════════

Risk 1: Firebase Functions debugging takes too long
  Severity: HIGH
  Mitigation:
    - Setup local Firebase emulator immediately (Day 1)
    - Test functions locally before deploying
    - Keep function logs accessible (Firestore logs collection)

Risk 2: Flutter camera/maps integration issues
  Severity: HIGH
  Mitigation:
    - Test camera + maps on physical devices in T1
    - Pre-configure permissions in AndroidManifest.xml + Info.plist
    - Use proven packages: camera, google_maps_flutter, geolocator

Risk 3: Firestore real-time sync latency
  Severity: MEDIUM
  Mitigation:
    - Enable Firestore offline persistence
    - Implement local caching (SharedPreferences/Hive)
    - Monitor Firestore latency in logs

Risk 4: Google Places API quota exceeded
  Severity: MEDIUM
  Mitigation:
    - Pre-test Places API from Day 1
    - Implement response caching
    - Setup API key restrictions (billing)

Risk 5: iOS deployment takes longer than expected
  Severity: MEDIUM
  Mitigation:
    - If iOS testing not available, focus on Android
    - Provisioning profiles: setup early if needed
    - Accept iOS as "nice to have" for this sprint

Risk 6: Scope creep - too many features to complete
  Severity: HIGH (but mitigated by scope freeze)
  Mitigation:
    - Stick to 51 tasks listed only
    - No new features without removing tasks
    - Prioritize core flows (T1 critical path)

════════════════════════════════════════════════════════════════════════════════
🎯 SUCCESS CRITERIA (GO LIVE CHECKLIST)
════════════════════════════════════════════════════════════════════════════════

By 6/6/2026, verify:

【 Backend ✅ 】
□ onStatusChanged function deployed & tested
□ onCompletionSubmitted function deployed & tested
□ checkStockOnOrder function deployed & tested
□ Firestore security rules deployed
□ Storage security rules deployed
□ No errors in Cloud Function logs
□ End-to-end order flow tested successfully
□ Database performance acceptable (queries < 500ms)
□ No security leaks in Firestore/Storage access

【 Admin Web ✅ 】
□ Users CRUD fully functional (create/edit/delete)
□ Users can filter by role, search by name/email
□ Dashboard displays correct KPI metrics
□ Dashboard revenue calculation matches actual orders
□ Orders management page displays all orders
□ Technician assignment working (creates assignment doc)
□ Technician list shows all technicians with stats
□ Products CRUD working
□ Settings page accessible
□ Build succeeds (npm run build)
□ Deployed to Firebase Hosting
□ No errors in browser console
□ Responsive on desktop/tablet/mobile
□ No critical security issues

【 Customer App ✅ 】
□ APK built successfully (< 150MB)
□ Sign up/sign in/sign out working
□ Products list & search working
□ Cart operations working (add/remove/update)
□ Checkout flow working (address input, order placement)
□ Orders list shows all user's orders
□ Order detail + real-time map tracking working
□ FCM notifications received & displayable
□ No crashes during testing
□ Responsive UI on Android (1-3 devices tested)

【 Technician App ✅ 】
□ APK built successfully (< 150MB)
□ Login working
□ Home: Job list displays today's assignments
□ Job detail: shows order + customer + maps
□ Job actions: accept/reject/on route/arrived updating status
□ Photo capture: able to take & upload ≤5 photos
□ COD + tip form: input validation working
□ Job completion: full flow working (photos→COD→success)
□ FCM notifications received for job assignments
□ No crashes during testing
□ Responsive UI on Android (1-3 devices tested)

【 Integration ✅ 】
□ Full order flow tested: customer → admin → tech → completion
□ All FCM notifications sent at correct times
□ Data consistency across apps (Firestore truth source)
□ No data leaks in Firestore/Storage
□ Maps display accurate locations
□ Real-time updates working (orders, assignments)
□ Chat/notifications functional

════════════════════════════════════════════════════════════════════════════════
📞 COMMUNICATION & ESCALATION
════════════════════════════════════════════════════════════════════════════════

Daily Standup (9:00 AM - 15 min)
  Format: Each person reports:
    ✓ What completed yesterday
    ⚠ What blocked today
    → Next steps for today
  
  Đạt: Firebase functions progress
  Huy: Admin web progress
  Bình: Mobile progress

Weekly Sync (Friday 4:00 PM - 30 min)
  - Review completed tasks
  - Identify remaining blockers
  - Adjust task priorities if needed
  - Demo completed features
  - Plan next week

Blocking Issues Escalation
  - If blocked > 2 hours: notify team immediately
  - If requires other person's help: sync call asap
  - Document blockers in shared doc

════════════════════════════════════════════════════════════════════════════════
📂 FOLDER STRUCTURE & FILE LOCATIONS
════════════════════════════════════════════════════════════════════════════════

Project Root:
  d:\Apps\BTL\QLCuaHangMayLocNuoc\

Backend (Đạt):
  📁 firebase/
    ├── functions/src/index.ts          ← Cloud Functions
    ├── firestore.rules                  ← Firestore Rules
    ├── storage.rules                    ← Storage Rules
    └── firestore.indexes.json           ← Indexes

Admin Web (Huy):
  📁 apps/admin_web/
    ├── src/pages/                       ← Page components
    │   ├── DashboardPage.tsx
    │   ├── UsersPage.tsx
    │   ├── OrdersPage.tsx (new)
    │   ├── TechniciansPage.tsx (new)
    │   ├── ProductsPage.tsx (new)
    │   └── SettingsPage.tsx (new)
    ├── src/components/                  ← UI components
    ├── src/services/                    ← Firebase services
    └── package.json

Customer App (Bình):
  📁 apps/customer_app/
    ├── lib/features/
    │   ├── auth/                        ← Auth screens
    │   ├── home/                        ← Product browse
    │   ├── cart/                        ← Cart management
    │   ├── orders/                      ← Order list + detail
    │   ├── notifications/               ← FCM handling
    │   └── profile/                     ← User profile
    └── pubspec.yaml

Technician App (Bình):
  📁 apps/technician_app/
    ├── lib/features/
    │   ├── auth/                        ← Login screens
    │   ├── home/                        ← Job list
    │   ├── job_detail/                  ← Job detail + maps
    │   ├── notifications/               ← FCM handling
    │   └── profile/                     ← User profile
    └── pubspec.yaml

Shared (All):
  📁 packages/shared/
    ├── lib/models/                      ← Data models
    └── pubspec.yaml

════════════════════════════════════════════════════════════════════════════════
✏️ NOTES FOR THE TEAM
════════════════════════════════════════════════════════════════════════════════

1. Code Quality
   - Follow code conventions: CONVENTIONS.md (Dart/TS naming, structure)
   - Commit frequently with clear messages
   - Test locally before pushing

2. Daily Checkin
   - Update task status in spreadsheet
   - Mark as "In Progress" when starting
   - Mark as "Done" when complete
   - Note any blockers

3. Documentation
   - Document new functions in code comments
   - Update README if adding new feature
   - Keep deployment notes in docs/

4. Testing
   - Manual testing on devices (not just simulator)
   - Test with real Firebase project (not local emulator only for final)
   - Test network failures (offline mode)

5. Deployment
   - Create Firebase billing project before Tuần 3
   - Setup signing keys for APK
   - Backup all credentials safely
   - Test production deploy on dummy data first

6. Team Coordination
   - If Tuần 1 tasks finish early, start Tuần 2 early
   - Share blockers immediately (don't wait for standup)
   - Help team member if stuck (pair programming if needed)

════════════════════════════════════════════════════════════════════════════════

Soạn bởi: AI Assistant
Ngày: 26/5/2026
Status: READY FOR EXECUTION

═══════════════════════════════════════════════════════════════════════════════
