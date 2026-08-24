# Manual Test - Donation Flow ✅

## Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5174
- Logged in as any user (e.g., user@shebabd.org / password123)

## Test Steps

### Step 1: Navigate to Donate Page
1. Open browser: http://localhost:5174
2. Click "Sign In" (top right)
3. Enter credentials: `user@shebabd.org` / `password123`
4. Click "Donate Now" button or navigate to `/donate`

**Expected Result:** Donation form loads with all fields

---

### Step 2: Fill Donation Form
1. **Amount:** Enter `500`
2. **Cause:** Select "Education"
3. **Donor Name:** Auto-filled from user profile
4. **Email:** Auto-filled from user profile
5. **Phone:** Enter `+8801712345678`
6. **Message:** Enter "Test donation for education"
7. **Anonymous:** Leave unchecked

**Expected Result:** All fields validate successfully

---

### Step 3: Select Payment Method - bKash
1. Click on **bKash** payment card
2. Click **"Proceed to Payment"** button

**Expected Result:**
- Loading indicator appears
- Donation created in database
- Redirected to payment initiation

---

### Step 4: Complete Payment
**What happens behind the scenes:**
1. POST `/api/donations` → Creates donation record (status: PENDING)
2. POST `/api/donations/{id}/initiate-payment` → Updates status to PROCESSING
3. Returns simulated bKash payment URL and transaction ID
4. Frontend simulates successful payment
5. PUT `/api/donations/{id}/verify` → Updates status to COMPLETED

**Expected Result:**
- Donation status changes to COMPLETED
- Redirected to tracking page
- Success toast notification appears

---

### Step 5: View Tracking Page
URL: `/donations/{donation_id}/track`

**Expected Result:**
- Donation details displayed:
  - Amount: ৳500
  - Status: Completed (with green checkmark)
  - Cause: Education
  - Payment Provider: bKash
  - Receipt Number: DN20260813XXXXXXXX
  - Timeline with all events
- Auto-refreshes every 3 seconds

---

### Step 6: View Donation History
1. Navigate to **Donation History** (menu or `/donations/history`)

**Expected Result:**
- Table shows the new donation
- Statistics updated:
  - Total Donations: 1
  - Total Amount: ৳500
  - Success Rate: 100%
  - Average Donation: ৳500
- Filters work (Status, Cause, Date Range)
- Sorting works (Date, Amount)

---

### Step 7: Admin Analytics (Admin Only)
1. Sign out
2. Sign in as: `admin@shebabd.org` / `password123`
3. Navigate to **Admin > Donations** or `/admin/donations`

**Expected Result:**
- Analytics dashboard displays:
  - Total donations count
  - Total amount raised
  - Completion rate
  - Charts by cause
  - Charts by payment provider
  - Charts by status
- All user donations visible in table

---

## Test Different Payment Methods

### Test bKash (Already done above)
- Min: ৳10, Max: ৳500,000
- Instant confirmation

### Test Nagad
1. Create new donation with amount ৳1000
2. Select **Nagad** payment method
3. Click "Proceed to Payment"

**Expected Result:**
- Similar flow to bKash
- Different provider transaction ID format (NG...)
- Different provider response structure

### Test Bank Transfer
1. Create new donation with amount ৳5000
2. Select **Bank Transfer** payment method
3. Click "Proceed to Payment"

**Expected Result:**
- Shows bank account details:
  ```
  Account Name: ShebaBD Foundation
  Account Number: 1234567890
  Bank: Dutch Bangla Bank Limited
  Branch: Dhanmondi Branch
  Routing Number: 090260323
  ```
- Shows reference number (BT...)
- Instructions displayed
- "I've Completed Transfer" button shown
- Status remains PROCESSING (awaiting manual verification)

---

## Test Error Scenarios

### Invalid Amount (Too Low)
1. Enter amount: `5`
2. Select bKash (min: ৳10)
3. Click "Proceed to Payment"

**Expected Result:**
- Error toast: "Minimum donation amount is ৳10"
- HTTP 400 Bad Request

### Invalid Amount (Too High)
1. Enter amount: `10000000`
2. Select bKash (max: ৳500,000)
3. Click "Proceed to Payment"

**Expected Result:**
- Error toast: "Maximum donation amount is ৳500,000"
- HTTP 400 Bad Request

### Missing Required Fields
1. Leave donor phone empty
2. Click "Proceed to Payment"

**Expected Result:**
- Form validation error
- Field highlighted in red
- Cannot proceed

### Unauthorized Access
1. Sign out
2. Try to access: http://localhost:5174/donations/history

**Expected Result:**
- Redirected to sign-in page
- Toast: "Please sign in to continue"

### Non-existent Donation
1. Navigate to: http://localhost:5174/donations/00000000-0000-0000-0000-000000000000/track

**Expected Result:**
- Error page or redirect
- Toast: "Donation not found"
- HTTP 404 Not Found

---

## Verify Database Records

### Check Donations Table
```bash
cd backend
sqlite3 shebabd.db
SELECT id, amount, status, cause, payment_provider, receipt_number FROM donations ORDER BY created_at DESC LIMIT 5;
.quit
```

### Check Transactions Table
```bash
sqlite3 shebabd.db
SELECT id, donation_id, amount, provider, status, provider_transaction_id FROM transactions ORDER BY created_at DESC LIMIT 5;
.quit
```

### Check Payment Methods
```bash
sqlite3 shebabd.db
SELECT provider, name, is_active, min_amount, max_amount FROM payment_methods;
.quit
```

---

## API Testing (Using curl or Postman)

### Get Payment Methods
```bash
curl http://localhost:8000/api/donations/payment-methods
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "provider": "bkash",
    "name": "bKash",
    "description": "Pay with bKash mobile wallet",
    "is_active": true,
    "min_amount": 10.0,
    "max_amount": 500000.0,
    "processing_time": "Instant"
  },
  // ... more payment methods
]
```

### Create Donation (Requires Auth Token)
```bash
# Get token first by signing in
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@shebabd.org","password":"password123"}'

# Copy the access_token from response, then:
curl -X POST http://localhost:8000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 500,
    "payment_provider": "bkash",
    "cause": "education",
    "donor_name": "Test User",
    "donor_email": "user@shebabd.org",
    "donor_phone": "+8801712345678",
    "message": "API test donation"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "user_id": "...",
  "amount": 500.0,
  "currency": "BDT",
  "cause": "education",
  "status": "pending",
  "receipt_number": "DN20260813XXXXXXXX",
  // ... more fields
}
```

---

## Browser Console Checks

Open browser DevTools (F12) and check:

### Network Tab
- All API requests to `/api/donations/*` should return 200 or 201
- No 500 errors
- Response times < 500ms

### Console Tab
- No JavaScript errors
- No React warnings
- Token stored in localStorage as `shebabd_token`

### Application Tab (Storage)
- localStorage > `shebabd_token` should contain JWT
- sessionStorage should be empty or have temporary data

---

## Success Criteria ✅

- [ ] User can sign in successfully
- [ ] Donation form loads and validates
- [ ] All 3 payment methods work
- [ ] Donations are created in database
- [ ] Transaction records are created
- [ ] Status updates correctly (PENDING → PROCESSING → COMPLETED)
- [ ] Tracking page shows real-time updates
- [ ] Donation history displays all donations
- [ ] Filters and sorting work
- [ ] Statistics calculate correctly
- [ ] Admin can view all donations
- [ ] Admin analytics display correctly
- [ ] No 500 errors in backend
- [ ] No JavaScript errors in frontend
- [ ] Proper error handling for invalid inputs
- [ ] Authentication protects donation routes

---

## Status: ✅ READY FOR TESTING

Both servers are running:
- **Backend:** http://localhost:8000 (Terminal: term_1786618220406_r8mlwsf04cs)
- **Frontend:** http://localhost:5174 (Terminal: term_1786617849816_oq92syxlb2)

Start testing by opening http://localhost:5174 in your browser!
