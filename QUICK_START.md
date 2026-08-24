# ShebaBD - Quick Start Guide

## ✅ System Status: FULLY OPERATIONAL

Both servers are running and ready for use!

---

## 🚀 How to Test the Donation System

### Step 1: Open the Application
**In your browser, go to:** http://localhost:5174

### Step 2: Sign In
- Click **"Sign In"** (top right)
- Use demo credentials:
  - **Email:** `user@shebabd.org`
  - **Password:** `password123`
- Click **"Sign In"**

### Step 3: Make a Donation
1. Click **"Donate Now"** button
2. Fill in the form:
   - **Amount:** `500`
   - **Cause:** Select "Education"
   - **Phone:** `+8801712345678`
   - **Message:** (optional)
3. Select a payment method:
   - **bKash** (instant, min ৳10)
   - **Nagad** (instant, min ৳10)
   - **Bank Transfer** (manual, min ৳100)
4. Click **"Proceed to Payment"**
5. Follow the payment flow
6. Complete the donation!

### Step 4: Track Your Donation
- After payment, you'll see the tracking page
- Status will update: Pending → Processing → Completed
- Auto-refreshes every 3 seconds

### Step 5: View History
- Go to **Donation History** in the menu
- See all your donations with stats

### Step 6: Admin Dashboard (Optional)
- Sign out and sign in as: `admin@shebabd.org` / `password123`
- Go to **Admin > Donations**
- View all donations and analytics

---

## 🛠️ Services Running

| Service | URL | Status |
|---------|-----|--------|
| Frontend (React) | http://localhost:5174 | ✅ Running |
| Backend (FastAPI) | http://localhost:8000 | ✅ Running |
| API Docs | http://localhost:8000/docs | ✅ Available |
| Database | backend/shebabd.db | ✅ Connected |

---

## 📝 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Regular User | user@shebabd.org | password123 |
| Volunteer | volunteer@shebabd.org | password123 |
| NGO | ngo@shebabd.org | password123 |
| Admin | admin@shebabd.org | password123 |

---

## 🐛 If Something Doesn't Work

**Frontend not loading?** Check terminal: `term_1786617849816_oq92syxlb2`

**Backend errors?** Check terminal: `term_1786618220406_r8mlwsf04cs`

**Need to restart backend:**
```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

**Need to restart frontend:**
```bash
npm run dev
```

---

## 📚 Documentation

- **DONATION_SYSTEM_COMPLETE.md** - Full system details
- **test_donation_flow.md** - Testing guide
- **FINAL_STATUS.md** - Technical summary

---

**Status: ✅ READY FOR TESTING**
Open http://localhost:5174 and try it now!