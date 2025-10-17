# 🚀 Quick Start: Database-Connected Features

## Prerequisites
Make sure you have:
- ✅ Supabase project set up
- ✅ Database tables created (sellers, products, orders, earnings)
- ✅ RLS policies configured
- ✅ User account created and logged in

---

## Step 1: Get Your User ID

1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Run this query:
```sql
SELECT auth.uid();
```
4. Copy the UUID returned - this is your user ID
5. Keep it handy for the next step

---

## Step 2: Add Test Data

### Option A: Using SQL Editor (Recommended)

1. Open the file: `db/insert-test-data.sql`
2. Replace **ALL** instances of `'YOUR_USER_ID_HERE'` with your actual user ID from Step 1
3. Copy the entire modified SQL
4. Go to Supabase **SQL Editor**
5. Paste and run the SQL
6. Check the verification queries at the bottom to confirm data was created

### Option B: Manual Entry

You can manually add test orders through your application:
1. Navigate to **Products** page
2. Create a few products first (if you haven't already)
3. Manually insert orders via Supabase Dashboard → Table Editor

---

## Step 3: Verify Each Page

### 📊 Dashboard
1. Navigate to `/dashboard`
2. You should see:
   - ✅ Total Products count
   - ✅ Total Orders count
   - ✅ Total Earnings amount
   - ✅ Pending Orders count
   - ✅ Recent orders table with real data
   - ✅ Monthly revenue chart with earnings

**Expected Result:** All stats show real numbers, not zeros

---

### 📦 Orders Page
1. Navigate to `/orders`
2. You should see:
   - ✅ List of all your orders
   - ✅ Customer names, products, amounts
   - ✅ Status badges (Pending/Delivered/Cancelled)
   - ✅ Action buttons on pending orders

**Try This:**
- Click **"Mark Delivered"** on a pending order
- Status should update immediately
- Dashboard stats should update

---

### 💰 Earnings Page
1. Navigate to `/earnings`
2. You should see:
   - ✅ Total Earnings card with all-time total
   - ✅ This Month card with current month earnings
   - ✅ Average Monthly card
   - ✅ Chart showing earnings over months

**Expected Result:** Chart shows bars/areas for each month with earnings data

---

### ⚙️ Settings Page
1. Navigate to `/settings`
2. You should see your profile pre-filled:
   - ✅ Full Name
   - ✅ Email (read-only)
   - ✅ Shop Name
   - ✅ Business details
   - ✅ Address fields

**Try This:**
1. Change your **Shop Name**
2. Click **"Save Changes"**
3. Green success message should appear
4. Refresh the page - your changes should persist

**Try Password Change:**
1. Enter new password (min 6 characters)
2. Confirm the password
3. Click **"Update Password"**
4. Success message should appear

---

## 🧪 Testing Scenarios

### Test Order Workflow
1. Go to **Orders** page
2. Find a **Pending** order
3. Click **"Mark Delivered"**
4. Order status should update to **Delivered**
5. Go to **Dashboard** - pending orders count should decrease
6. Go to **Earnings** - you can optionally create earnings for this order

### Test Profile Update
1. Go to **Settings**
2. Change **Shop Name** to "My Test Shop"
3. Change **Phone** to "555-1234"
4. Click **Save Changes**
5. Reload the page
6. Verify changes persisted

### Test Empty States
1. Create a new user account
2. Login with that account
3. Visit each page:
   - Dashboard should show zeros
   - Orders should show "No orders yet"
   - Earnings should show $0.00
   - Settings should load but be empty

---

## 📱 Page Features Overview

### Dashboard Features
- **Real-time Stats**: Shows current data from database
- **Recent Orders**: Last 5 orders with customer info
- **Revenue Chart**: Monthly earnings visualization
- **Auto-refresh**: Data updates when you navigate back to page

### Orders Features
- **Full Order List**: All orders with details
- **Status Management**: Update order status with one click
- **Product Info**: Shows related product name
- **Date Formatting**: Human-readable dates
- **Empty State**: Shows message when no orders exist

### Earnings Features
- **Statistics Cards**: Total, monthly, and average earnings
- **Trend Analysis**: Shows month-over-month change percentage
- **Chart Visualization**: Area chart for earnings over time
- **Auto-calculation**: All stats calculated from real data

### Settings Features
- **Complete Profile**: All seller fields available
- **Validation**: Email format, password length checks
- **Success/Error Messages**: Clear feedback on actions
- **Password Security**: Change password through Supabase Auth
- **Auto-sync**: Profile updates refresh user context

---

## 🔍 Troubleshooting

### "Loading forever" or Blank Page
**Cause:** No data in database or RLS policies blocking access

**Fix:**
1. Check Supabase RLS policies are set correctly
2. Verify you're logged in with correct account
3. Add test data using the SQL script
4. Check browser console for errors

### Orders Show "Product removed"
**Cause:** Product was deleted but order still references it

**Fix:** This is expected behavior - order keeps customer/amount info even if product deleted

### Earnings Chart is Empty
**Cause:** No earnings data in database

**Fix:**
1. Run the test data SQL script
2. Or manually add earnings through Supabase Table Editor
3. Make sure month is 1-12 and year is current/recent year

### Profile Changes Don't Save
**Cause:** RLS policy not allowing updates

**Fix:**
1. Check Supabase RLS policies on sellers table
2. Verify policy allows: `auth.uid() = id` for UPDATE
3. Check browser console for specific error

### Dashboard Stats Show Zero
**Cause:** No data in related tables

**Fix:**
1. Create some products first
2. Add test orders using SQL script
3. Add earnings data
4. Refresh the dashboard

---

## 🎯 Next Steps

Now that everything is connected:

1. **Add Real Products**: Go to Products page and add your actual inventory
2. **Test Order Flow**: Create test orders to see the full workflow
3. **Customize**: Modify the pages to match your business needs
4. **Add Features**: Consider implementing the optional enhancements listed in the documentation

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Review RLS policies in Supabase dashboard
4. Check that all required tables exist
5. Ensure test data was inserted correctly

---

## ✅ Success Checklist

- [ ] Test data inserted successfully
- [ ] Dashboard shows real statistics
- [ ] Orders page lists all orders
- [ ] Order status can be updated
- [ ] Earnings page shows monthly data
- [ ] Chart displays earnings
- [ ] Profile can be updated
- [ ] Password can be changed
- [ ] Success messages appear
- [ ] No console errors

---

**Congratulations! Your seller portal is now fully connected to Supabase! 🎉**
