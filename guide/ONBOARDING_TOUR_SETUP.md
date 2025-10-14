# 🎉 Email Verification, Onboarding & Tour Guide Setup

## Overview
This guide helps you set up:
1. **Email Verification** - Users must verify their email after signup
2. **Onboarding Flow** - Collect seller information with WYSIWYG editor
3. **Tour Guide** - Interactive application tour using TourGuideJS

---

## 📋 Step 1: Update Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- File: supabase-onboarding-setup.sql

-- Add new columns to sellers table for onboarding
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS about_seller TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_sellers_onboarding ON sellers(onboarding_completed);
```

---

## ⚙️ Step 2: Enable Email Confirmation in Supabase

### Via Supabase Dashboard:

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth** section
3. Find **"Confirm email"** setting
4. Toggle it **ON** ✅
5. Click **Save**

### Configure Email Templates (Optional but Recommended):

1. Go to **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Customize the email message (optional)
4. Make sure it's enabled

### Test Email Settings:

1. Go to **Project Settings** → **Auth**
2. Check **Site URL** is set correctly (e.g., `http://localhost:5174` for development)
3. For production, set your actual domain

---

## 🎨 Step 3: Install TourGuideJS

Already installed! ✅
```bash
npm i @sjmc11/tourguidejs
```

---

## 📁 Files Created

### New Pages:
1. **`src/pages/EmailVerification.jsx`** - Email verification screen
   - Shows animated email icon
   - Displays user's email
   - Resend verification email button
   - Auto-redirects when verified

2. **`src/pages/Onboarding.jsx`** - Multi-step onboarding form
   - Step 1: Business Information (shop_name, business_name)
   - Step 2: Contact Details (phone, address, city, state, zip)
   - Step 3: About Store (WYSIWYG editor for about_seller)
   - Progress bar with icons
   - Form validation
   - Saves to database

### New Components:
3. **`src/components/TourGuide.jsx`** - Tour guide hook and steps
   - `useTourGuide()` hook
   - Predefined tour steps for:
     - Dashboard tour
     - Products tour
     - Add Product tour
     - Orders tour
     - Earnings tour

### Updated Files:
4. **`src/App.jsx`** - Added new routes
5. **`src/pages/Signup.jsx`** - Redirects to email verification
6. **`src/pages/Dashboard.jsx`** - Added tour functionality
7. **`src/components/layout/Sidebar.jsx`** - Added tour data attributes
8. **`src/index.css`** - Imported TourGuideJS CSS

---

## 🔄 User Flow

### For New Users:

```
1. User signs up at /signup
   ↓
2. Redirected to /email-verification
   - Shows "Check your email" message
   - User clicks verification link in email
   ↓
3. Redirected to /onboarding
   - 3-step form to collect seller info
   - WYSIWYG editor for "About Seller"
   ↓
4. After onboarding completion
   - Redirected to /dashboard?tour=start
   - Tour automatically starts
   ↓
5. User can take tour or skip
   - "Take a Tour" button available on all pages
```

### For Returning Users:

```
1. User logs in at /login
   ↓
2. Check if onboarding_completed = true
   - If NO: Redirect to /onboarding
   - If YES: Go to /dashboard
   ↓
3. Normal app usage
   - Can restart tour anytime with "Take a Tour" button
```

---

## 🎯 Tour Guide Usage

### On Dashboard:

The tour automatically starts when:
- User completes onboarding (URL has `?tour=start`)
- User clicks "Take a Tour" button

### Tour Steps Include:

1. **Dashboard Overview** - Introduction
2. **Sales Statistics** - Stats cards explanation
3. **Recent Activity** - Orders table
4. **Products Overview** - Inventory chart
5. **Navigation Menu** - Sidebar navigation
6. **Profile Settings** - Profile menu

### Add Tour to Other Pages:

```jsx
import { useTourGuide, productsTourSteps } from '@/components/TourGuide'

function ProductsPage() {
  const { startTour } = useTourGuide(productsTourSteps)
  
  return (
    <div>
      <Button onClick={startTour}>
        <Rocket className="mr-2 h-4 w-4" />
        Take a Tour
      </Button>
      
      {/* Your content with data-tour attributes */}
      <div data-tour="products-page">...</div>
    </div>
  )
}
```

---

## 🔍 Data Tour Attributes

Add these to elements for the tour to highlight them:

### Dashboard:
- `data-tour="dashboard"` - Main container
- `data-tour="stats-cards"` - Statistics cards
- `data-tour="recent-orders"` - Orders table
- `data-tour="products-overview"` - Products chart
- `data-tour="sidebar"` - Navigation sidebar
- `data-tour="profile-menu"` - Profile dropdown

### Products Page (To Add):
- `data-tour="products-page"` - Main container
- `data-tour="add-product"` - Add button
- `data-tour="product-card"` - Product card
- `data-tour="product-actions"` - Edit/Delete buttons
- `data-tour="stock-badge"` - Stock status badge

### Add Product Page (To Add):
- `data-tour="product-form"` - Form container
- `data-tour="category-select"` - Category dropdown
- `data-tour="product-details"` - Details textarea
- `data-tour="specifications"` - WYSIWYG editor
- `data-tour="product-images"` - Multiple images upload

---

## 🧪 Testing

### Test Email Verification:

1. **Signup with a new email**:
   ```
   Name: Test User
   Email: test@example.com
   Password: Test123!
   ```

2. **Should redirect to** `/email-verification`

3. **Check Supabase**:
   - Go to **Authentication** → **Users**
   - Find your user
   - Should see `email_confirmed_at` is NULL
   - Click **"Confirm Email"** manually for testing

4. **After confirmation**:
   - User should auto-redirect to `/onboarding`

### Test Onboarding:

1. **Fill Step 1** (Business Info):
   ```
   Shop Name: My Awesome Shop
   Business Name: ABC Trading Co.
   ```

2. **Fill Step 2** (Contact):
   ```
   Phone: +1 (555) 123-4567
   Address: 123 Main St
   City: New York
   State: NY
   ZIP: 10001
   ```

3. **Fill Step 3** (About Seller):
   - Use WYSIWYG editor
   - Add headings, lists, bold text
   - Minimum 50 characters required

4. **Click "Complete Setup"**

5. **Should redirect to** `/dashboard?tour=start`

6. **Tour should auto-start**

### Test Tour Guide:

1. **After onboarding**, tour starts automatically

2. **Tour controls**:
   - **Next** - Move to next step
   - **Back** - Previous step
   - **Skip** - End tour
   - **Close** (X) - End tour

3. **Manual tour**:
   - Click "Take a Tour" button on dashboard
   - Tour should start from beginning

---

## 🔧 Customization

### Customize Tour Steps:

Edit `src/components/TourGuide.jsx`:

```javascript
export const customTourSteps = [
  {
    title: 'Step Title',
    content: 'Step description and instructions',
    target: '[data-tour="element-id"]', // CSS selector
  },
  // Add more steps...
]
```

### Customize Onboarding Steps:

Edit `src/pages/Onboarding.jsx`:

```javascript
const steps = [
  { id: 1, title: 'Your Step', icon: YourIcon },
  // Add more steps...
]
```

### Customize Email Verification:

Edit `src/pages/EmailVerification.jsx` to change:
- Animation
- Text content
- Styling
- Resend email logic

---

## 🐛 Troubleshooting

### Email Not Sending:

**Issue**: User doesn't receive verification email

**Solutions**:
1. Check Supabase **Logs** → Filter "auth"
2. Verify email provider is configured
3. Check spam folder
4. Use Supabase Dashboard to manually confirm email for testing

### Onboarding Not Showing:

**Issue**: After email verification, user goes to dashboard instead of onboarding

**Solutions**:
1. Check `onboarding_completed` in database:
   ```sql
   SELECT id, email, onboarding_completed FROM sellers;
   ```
2. Set to `false` if needed:
   ```sql
   UPDATE sellers SET onboarding_completed = false WHERE id = 'user-id';
   ```

### Tour Not Starting:

**Issue**: Tour doesn't start after onboarding

**Solutions**:
1. Check browser console for errors
2. Verify TourGuideJS is installed:
   ```bash
   npm list @sjmc11/tourguidejs
   ```
3. Check if `data-tour` attributes exist on elements
4. Ensure CSS is imported in `index.css`

### Tour Targets Not Found:

**Issue**: Tour steps show but don't highlight elements

**Solutions**:
1. Check `data-tour` attributes match tour step targets
2. Ensure elements are rendered before starting tour
3. Add delay to tour start:
   ```javascript
   setTimeout(() => startTour(), 500)
   ```

---

## 📚 Next Steps

After setup:

1. ✅ **Add tour to Products page**
   - Add "Take a Tour" button
   - Add `data-tour` attributes to elements

2. ✅ **Add tour to Add Product page**
   - Highlight multiple image upload
   - Explain WYSIWYG editor
   - Show category dropdown

3. ✅ **Add tour to Orders page**
   - Explain status filters
   - Show order details

4. ✅ **Add tour to Earnings page**
   - Highlight revenue chart
   - Show payout information

5. ✅ **Customize email templates**
   - Add your branding
   - Customize verification email content

6. ✅ **Add "About Seller" display**
   - Show seller info on e-commerce site
   - Create public seller profile page

---

## 🎉 Success Checklist

Before going live:

- ✅ Email confirmation enabled in Supabase
- ✅ Database schema updated with onboarding fields
- ✅ Email verification page working
- ✅ Onboarding flow complete (3 steps)
- ✅ WYSIWYG editor saves HTML correctly
- ✅ Tour guide starts after onboarding
- ✅ "Take a Tour" button on dashboard
- ✅ Tour steps highlight correct elements
- ✅ Site URL configured in Supabase for production
- ✅ Email templates customized (optional)

---

## 📖 Additional Resources

- **TourGuideJS Docs**: https://github.com/sjmc11/tourguidejs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **TipTap (WYSIWYG)**: https://tiptap.dev/docs
- **Framer Motion**: https://www.framer.com/motion

**Date**: October 14, 2025
