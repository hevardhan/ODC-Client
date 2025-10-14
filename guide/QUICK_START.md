# 🎯 QUICK START - Fix "Row-Level Security Policy" Error

## The Problem
```
Failed to upload images: new row violates row-level security policy
ERROR: 42P01: relation "storage.policies" does not exist
```

## The Solution (3 Steps)

### 📝 STEP 1: Run SQL Script (2 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** of `supabase-multiple-images-setup.sql`
3. Paste and click **RUN**
4. Wait for "Success" message

---

### 📦 STEP 2: Create Storage Bucket (1 minute)

**THIS IS THE MOST IMPORTANT STEP!**

1. Supabase Dashboard → **Storage** (left sidebar)
2. Click **"New Bucket"** button
3. Enter details:
   ```
   Name: product-images
   Public: ✅ CHECK THIS BOX!!!
   ```
4. Click **"Create Bucket"**

**⚠️ CRITICAL:** The "Public" checkbox MUST be checked!

---

### ✅ STEP 3: Verify (30 seconds)

Run this in SQL Editor:

```sql
-- Quick verification
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'product-images' AND public = true)
    THEN '✅ Storage bucket ready!'
    ELSE '❌ Storage bucket missing or not public'
  END as status;
```

Should return: `✅ Storage bucket ready!`

---

## 🧪 Test Upload

1. Go to **Products** → **Add Product**
2. Fill in required fields
3. Upload 3-5 images
4. Click **Save**

**Expected:** ✅ Success!

---

## 🔧 If Still Not Working

### Quick Diagnosis:

Run this in SQL Editor:
```sql
SELECT 
  'Table exists' as check_1,
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_images') 
    THEN '✅' ELSE '❌ Run SQL script' END as result
UNION ALL
SELECT 
  'Bucket exists' as check_1,
  CASE WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'product-images') 
    THEN '✅' ELSE '❌ Create bucket in Storage' END as result
UNION ALL
SELECT 
  'Bucket is public' as check_1,
  CASE WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'product-images' AND public = true) 
    THEN '✅' ELSE '❌ Make bucket public' END as result
UNION ALL
SELECT 
  'You are logged in' as check_1,
  CASE WHEN auth.uid() IS NOT NULL 
    THEN '✅' ELSE '❌ Log in to your app' END as result;
```

**Fix any ❌ items shown**

---

## 📖 Detailed Guides

- **Full setup guide:** `SETUP_GUIDE.md`
- **Troubleshooting:** `FIX_RLS_ERROR.md`
- **Verification queries:** `verify-setup.sql`
- **Fix policies only:** `fix-rls-policies.sql`

---

## 💡 Most Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| "RLS policy violation" | Bucket not created | Create `product-images` bucket |
| "Bucket not found" | Wrong bucket name | Must be exactly `product-images` |
| "Access denied" | Bucket not public | Check "Public" when creating bucket |
| "Not authenticated" | Logged out | Log back in as seller |

---

## ✨ Success Checklist

Before testing, verify:
- ✅ SQL script ran successfully
- ✅ `product-images` bucket exists in Storage
- ✅ Bucket is marked as **Public**
- ✅ You are logged in to the app
- ✅ App code is updated (AddEditProduct.jsx)

---

## 🆘 Emergency Fix

If nothing works, temporarily disable RLS to test:

```sql
-- TESTING ONLY - NOT FOR PRODUCTION!
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- Test upload now...
-- If it works, the issue is RLS policies

-- RE-ENABLE IMMEDIATELY:
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
```

Then properly fix the policies using `fix-rls-policies.sql`

---

## 📞 Need More Help?

1. Check browser console (F12) for detailed errors
2. Check Supabase Logs: Dashboard → Logs → "storage"
3. Verify SQL script ran without errors
4. Make sure bucket is PUBLIC (most common issue!)
5. Try logging out and back in

---

**🎉 Once working, you'll see:**
- Upload button with slot counter
- Image preview grid
- Primary image with green border
- Drag to reorder functionality
- Successful product save with images!
