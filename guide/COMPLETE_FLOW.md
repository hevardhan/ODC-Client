# 🔄 Complete Authentication & Onboarding Flow

## User Journey - Step by Step

### 🆕 New User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEW USER SIGNUP                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: SIGNUP PAGE (/signup)                                  │
│  • User enters: Name, Email, Password                           │
│  • Click "Sign Up"                                              │
│  • Account created in Supabase                                  │
│  • Email verification required ❌ (not confirmed yet)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: EMAIL VERIFICATION PAGE (/email-verification)          │
│  ✉️  "Check Your Email"                                         │
│  • Shows user's email address                                   │
│  • Animated mail icon                                           │
│  • Resend verification email button                             │
│  • Waiting for user to click link in email...                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    USER CLICKS EMAIL LINK
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Email Verified! ✅                                             │
│  • email_confirmed_at set in Supabase                           │
│  • Auto-redirect triggered                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: ONBOARDING PAGE (/onboarding)                          │
│                                                                  │
│  📋 Step 1 of 3: Business Information                           │
│     • Shop Name                                                 │
│     • Business Name                                             │
│     [Next →]                                                    │
│                                                                  │
│  📞 Step 2 of 3: Contact Details                                │
│     • Phone                                                     │
│     • Address, City, State, ZIP                                 │
│     [← Back] [Next →]                                           │
│                                                                  │
│  📝 Step 3 of 3: About Your Store                               │
│     • WYSIWYG Editor (rich text)                                │
│     • Tell buyers about your store                              │
│     [← Back] [Complete Setup ✓]                                 │
│                                                                  │
│  • onboarding_completed set to TRUE                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: DASHBOARD with TOUR (/dashboard?tour=start)            │
│  🎪 Tour Automatically Starts!                                  │
│                                                                  │
│  Tour Steps:                                                     │
│  1. Welcome to Dashboard                                        │
│  2. Sales Statistics                                            │
│  3. Recent Orders                                               │
│  4. Products Overview                                           │
│  5. Navigation Sidebar                                          │
│  6. Profile Menu                                                │
│                                                                  │
│  User can:                                                       │
│  • Complete tour                                                │
│  • Skip tour                                                    │
│  • Restart tour anytime with "Take a Tour" button              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    READY TO USE APP! 🎉                         │
│  • Full access to all features                                  │
│  • Products, Orders, Earnings, Settings                         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🔄 Returning User Flow (Login)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN PAGE (/login)                           │
│  • User enters: Email, Password                                 │
│  • Click "Log In"                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   LOGIN SUCCESS ✅
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              CHECK USER STATUS (Automatic)                       │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │ Email Verified?      │                                       │
│  └──────────────────────┘                                       │
│            ↓                                                     │
│       NO ❌                  YES ✅                              │
│            ↓                    ↓                                │
│   /email-verification    ┌──────────────────────┐               │
│                          │ Onboarding Complete? │               │
│                          └──────────────────────┘               │
│                                   ↓                              │
│                              NO ❌    YES ✅                     │
│                                   ↓        ↓                     │
│                            /onboarding  /dashboard               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ ProtectedRoute Logic

The `ProtectedRoute` component enforces this flow automatically:

```javascript
1. Check if user is logged in
   ❌ Not logged in → Redirect to /login

2. Check if email is verified
   ❌ Not verified → Redirect to /email-verification
   
3. Check if onboarding is completed
   ❌ Not completed → Redirect to /onboarding
   
4. All checks passed ✅ → Show protected content
```

---

## 📊 Database States

### User States in Database:

| State | email_confirmed_at | onboarding_completed | Can Access |
|-------|-------------------|---------------------|------------|
| **Just Signed Up** | `NULL` | `false` | `/email-verification` only |
| **Email Verified** | `timestamp` | `false` | `/onboarding` only |
| **Fully Setup** | `timestamp` | `true` | Full app access |

---

## 🔐 Route Protection

### Public Routes (No auth required):
- `/login` - Login page
- `/signup` - Signup page

### Auth Required (Email NOT verified):
- `/email-verification` - Wait for email confirmation

### Auth + Email Verified (Onboarding NOT complete):
- `/onboarding` - Complete 3-step setup

### Full Access (Auth + Email + Onboarding):
- `/dashboard` - Main dashboard
- `/products` - Products management
- `/orders` - Orders management
- `/earnings` - Earnings tracking
- `/settings` - Account settings

---

## ⚙️ Technical Implementation

### 1. Signup Flow (`Signup.jsx`):
```javascript
signup() → Create account → Redirect to /email-verification
```

### 2. Email Verification (`EmailVerification.jsx`):
```javascript
Listen for auth changes → 
When email_confirmed_at is set → 
Redirect to /onboarding
```

### 3. Onboarding (`Onboarding.jsx`):
```javascript
Complete 3 steps →
Save to database (onboarding_completed = true) →
Redirect to /dashboard?tour=start
```

### 4. Dashboard (`Dashboard.jsx`):
```javascript
Check URL param ?tour=start →
If present → startTour()
```

### 5. Login (`Login.jsx`):
```javascript
login() →
Check email_confirmed_at →
  If false → /email-verification
Check onboarding_completed →
  If false → /onboarding
  If true → /dashboard
```

---

## 🧪 Testing the Complete Flow

### Test 1: New User Signup

1. **Signup** at `/signup`
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!

2. **Email Verification** page should appear
   - ✅ Shows email address
   - ✅ Has resend button

3. **Verify Email** (two ways):
   - Click link in email OR
   - Manually confirm in Supabase: Authentication → Users → Confirm Email

4. **Onboarding** page should appear automatically
   - ✅ Shows Step 1 of 3
   - ✅ Progress bar at 0%

5. **Complete Step 1**: Business Information
   - Shop Name: My Test Shop
   - Business Name: Test Business
   - Click "Next"

6. **Complete Step 2**: Contact Details
   - Phone: +1 (555) 123-4567
   - Address: 123 Test St
   - City: Test City
   - Click "Next"

7. **Complete Step 3**: About Store
   - Write at least 50 characters in WYSIWYG editor
   - Use formatting (headings, lists, bold)
   - Click "Complete Setup"

8. **Dashboard** should appear with tour
   - ✅ URL is `/dashboard?tour=start`
   - ✅ Tour starts automatically
   - ✅ "Take a Tour" button visible

### Test 2: Returning User Login

1. **Login** at `/login`
   - Email: test@example.com
   - Password: Test123!

2. **Should go directly to Dashboard**
   - ✅ No email verification (already verified)
   - ✅ No onboarding (already completed)
   - ✅ Dashboard loads immediately

### Test 3: Incomplete Onboarding

1. **In Supabase**, set `onboarding_completed = false` for test user

2. **Login** at `/login`

3. **Should redirect to `/onboarding`**
   - ✅ Can't access dashboard until onboarding complete

### Test 4: Unverified Email

1. **Create new user** via Supabase Dashboard
   - Don't confirm email

2. **Try to login**

3. **Should redirect to `/email-verification`**
   - ✅ Can't proceed without email verification

---

## 🚨 Important Notes

### Email Verification:
- **Required**: Must enable in Supabase (Authentication → Settings → Confirm email)
- **For Testing**: Can manually confirm emails in Supabase Dashboard
- **In Production**: Users receive real verification emails

### Onboarding:
- **One Time**: Only shown once (when `onboarding_completed = false`)
- **Required Fields**: All fields with * are mandatory
- **WYSIWYG**: Step 3 requires minimum 50 characters
- **Database**: All data saved to `sellers` table

### Tour:
- **Auto-Start**: Only on first dashboard visit after onboarding
- **Manual Start**: "Take a Tour" button always available
- **Repeatable**: Can restart tour anytime
- **Skippable**: User can skip or close tour

---

## 🔧 Configuration

### Disable Email Verification (Development Only):
In Supabase Dashboard:
```
Authentication → Settings → 
Email Auth → Confirm email → OFF
```
**Warning**: Not recommended for production!

### Skip Onboarding (For Testing):
Manually set in database:
```sql
UPDATE sellers 
SET onboarding_completed = true 
WHERE id = 'user-id';
```

---

## 📚 Files Involved

| File | Purpose |
|------|---------|
| `src/App.jsx` | Route configuration |
| `src/components/ProtectedRoute.jsx` | Flow enforcement |
| `src/pages/Signup.jsx` | User registration |
| `src/pages/Login.jsx` | User login with redirects |
| `src/pages/EmailVerification.jsx` | Email verification wait screen |
| `src/pages/Onboarding.jsx` | 3-step onboarding form |
| `src/pages/Dashboard.jsx` | Main app with tour |
| `src/components/TourGuide.jsx` | Tour guide logic |

---

**Status**: ✅ Complete Flow Implemented
**Date**: October 14, 2025
