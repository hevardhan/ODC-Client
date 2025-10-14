# COMPLETE SETUP GUIDE - Multiple Product Images

## 🚨 IMPORTANT: Follow in EXACT Order

### ✅ STEP 1: Run Main SQL Script

1. Open **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy this **ENTIRE** file: `supabase-multiple-images-setup.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. ✅ Should see: "Success. No rows returned"

**What this does:**
- Creates `product_images` table
- Sets up RLS policies for database table
- Creates storage policies (for storage.objects)
- Migrates existing images

---

### ✅ STEP 2: Create Storage Bucket (CRITICAL!)

**You MUST do this manually in the Dashboard:**

1. Go to **Storage** (left sidebar)
2. Click **"New Bucket"** (top right)
3. Fill in:
   - **Name**: `product-images` (exactly this name!)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - File size limit: 5MB (optional)
4. Click **"Create Bucket"**

**Screenshot location:**
Storage → Create New Bucket → Name: product-images, Public: YES

---

### ✅ STEP 3: Verify Everything Works

Run this in SQL Editor to verify:

```sql
-- 1. Check product_images table exists
SELECT COUNT(*) FROM product_images;
-- Expected: 0 or more (number of migrated images)

-- 2. Check RLS policies on product_images (should show 4)
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_images';
-- Expected: 4

-- 3. Check storage policies exist (should show 3)
SELECT COUNT(*) FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE '%product images%';
-- Expected: 3

-- 4. Check if storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';
-- Expected: 1 row with public = true
```

---

### ✅ STEP 4: Test Upload

1. Go to your app → **Products** → **Add Product**
2. Fill in all required fields
3. Upload **3-5 images**
4. Click **Save Product**

**Expected result:** Product saved with images ✅

**If error:** Continue to troubleshooting below ⬇️

---

## 🔧 TROUBLESHOOTING

### Error: "new row violates row-level security policy"

**Cause:** Storage bucket not created or not public

**Fix:**
1. Go to Storage → Check if `product-images` bucket exists
2. If exists: Click on it → Settings → Make sure "Public" is ON
3. If not exists: Follow STEP 2 above

---

### Error: "Bucket not found"

**Cause:** Storage bucket `product-images` doesn't exist

**Fix:** Follow STEP 2 above to create it

---

### Error: "Not authenticated" or "No auth token"

**Cause:** User session expired

**Fix:**
1. Log out of your app
2. Log back in as seller
3. Try uploading again

---

### Images Upload But Don't Display

**Cause:** Storage bucket is not public

**Fix:**
1. Go to **Storage** → Click `product-images` bucket
2. Go to **Settings** tab
3. Toggle **"Public bucket"** to ON
4. Save changes

---

### Error: "Failed to fetch"

**Cause:** Network issue or incorrect bucket name

**Fix:**
1. Check browser console (F12) for exact error
2. Verify bucket name is exactly `product-images` (no typos!)
3. Check if Supabase project is running

---

## 📊 Verification Checklist

Before testing upload, verify:

- ✅ `product_images` table exists
- ✅ RLS enabled on `product_images` table
- ✅ 4 policies on `product_images` (SELECT, INSERT, UPDATE, DELETE)
- ✅ Storage bucket `product-images` exists
- ✅ Storage bucket is **PUBLIC**
- ✅ 3 storage policies on `storage.objects` for product-images
- ✅ You are logged in as seller
- ✅ Product form shows "Upload 3-5 images"

---

## 🎯 Quick Test

Run this in SQL Editor to test everything:

```sql
-- THIS WILL TEST ALL PERMISSIONS
DO $$
DECLARE
  test_product_id UUID;
BEGIN
  -- Check auth
  IF auth.uid() IS NULL THEN
    RAISE NOTICE '❌ NOT AUTHENTICATED - Please log in first';
    RETURN;
  END IF;
  RAISE NOTICE '✅ Authenticated as: %', auth.uid();

  -- Check if you have products
  SELECT id INTO test_product_id FROM products WHERE seller_id = auth.uid() LIMIT 1;
  IF test_product_id IS NULL THEN
    RAISE NOTICE '⚠️  No products found - Create a product first';
    RETURN;
  END IF;
  RAISE NOTICE '✅ Found your product: %', test_product_id;

  -- Check if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_images') THEN
    RAISE NOTICE '✅ Table product_images exists';
  ELSE
    RAISE NOTICE '❌ Table product_images NOT FOUND - Run SQL script first';
    RETURN;
  END IF;

  -- Check RLS
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_images' AND rowsecurity = true) THEN
    RAISE NOTICE '✅ RLS is enabled';
  ELSE
    RAISE NOTICE '❌ RLS is NOT enabled';
  END IF;

  -- Check policies
  RAISE NOTICE '✅ Found % policies on product_images', 
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_images');

  -- Check storage bucket
  IF EXISTS (SELECT FROM storage.buckets WHERE id = 'product-images') THEN
    RAISE NOTICE '✅ Storage bucket exists';
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'product-images' AND public = true) THEN
      RAISE NOTICE '✅ Storage bucket is PUBLIC';
    ELSE
      RAISE NOTICE '❌ Storage bucket is NOT public - Make it public!';
    END IF;
  ELSE
    RAISE NOTICE '❌ Storage bucket NOT FOUND - Create it in Dashboard';
  END IF;

  RAISE NOTICE '================================';
  RAISE NOTICE '✅ ALL CHECKS PASSED - Ready to upload!';
END $$;
```

---

## 📞 Still Having Issues?

1. Run the verification script above
2. Check browser console (F12) for errors
3. Check Supabase Logs: Dashboard → Logs → Filter "storage" or "postgres"
4. Make sure you're using the latest code from `AddEditProduct.jsx`
5. Clear browser cache and try again

---

## 🎉 Success Indicators

When everything works, you should see:
- ✅ Upload button shows remaining slots (e.g., "Upload Images (2 remaining)")
- ✅ Images appear in grid with preview
- ✅ First image has green border and star (primary)
- ✅ Can reorder images with arrows
- ✅ Can remove images with X button
- ✅ Can set different image as primary with star button
- ✅ Validation blocks upload if <3 or >5 images
- ✅ Product saves successfully with all images
