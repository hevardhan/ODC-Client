# Fix "Row-Level Security Policy" Error - Step by Step

## Problem
Getting error: **"Failed to upload images: new row violates row-level security policy"**

This happens when:
1. RLS policies are not properly configured
2. Storage bucket policies are missing
3. User session is not authenticated correctly

## Solution

### Step 1: Fix Database RLS Policies

1. **Open Supabase Dashboard** → Your Project → **SQL Editor**
2. **Run the fix script**: Open `fix-rls-policies.sql` and execute it
3. **Verify policies** by running the verification query at the bottom

This will:
- Drop old conflicting policies
- Create new policies with proper `TO authenticated` clause
- Use `EXISTS` instead of `IN` for better performance

---

### Step 2: Configure Storage Bucket (CRITICAL!)

The storage bucket `product-images` needs proper policies for uploads to work.

#### Option A: Via Dashboard (RECOMMENDED)

1. **Go to Storage** in Supabase Dashboard
2. **Check if `product-images` bucket exists**:
   - If NO: Click "New Bucket" → Name: `product-images` → Public: **Yes** → Create
   - If YES: Continue to step 3

3. **Configure Bucket Policies**:
   - Click on `product-images` bucket
   - Go to **Policies** tab
   - Click **"New Policy"**

4. **Add Upload Policy**:
   ```
   Policy Name: Authenticated users can upload
   Allowed Operations: INSERT
   Target Roles: authenticated
   Policy Definition: true
   ```
   
   Or use this SQL in **Policy editor**:
   ```sql
   (auth.role() = 'authenticated')
   ```

5. **Add Delete Policy**:
   ```
   Policy Name: Authenticated users can delete
   Allowed Operations: DELETE
   Target Roles: authenticated
   Policy Definition: true
   ```
   
   Or use this SQL:
   ```sql
   (auth.role() = 'authenticated')
   ```

6. **Add Read Policy** (if not auto-created):
   ```
   Policy Name: Public can read
   Allowed Operations: SELECT
   Target Roles: public
   Policy Definition: true
   ```

#### Option B: Via SQL (Alternative)

If dashboard method doesn't work, run this in SQL Editor:

```sql
-- Make sure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Add storage policies
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES 
  ('Authenticated upload', 'product-images', '(auth.role() = ''authenticated'')', '(auth.role() = ''authenticated'')'),
  ('Authenticated delete', 'product-images', '(auth.role() = ''authenticated'')', '(auth.role() = ''authenticated'')'),
  ('Public read', 'product-images', 'true', NULL)
ON CONFLICT DO NOTHING;
```

---

### Step 3: Verify Your Session

Make sure you're logged in as a seller:

1. **Check browser console** (F12) for any auth errors
2. **Verify session** by running this in your app:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Current session:', session);
   ```

3. **Check seller_id** in products table matches your auth.uid:
   ```sql
   SELECT id, name, seller_id FROM products WHERE seller_id = auth.uid();
   ```

---

### Step 4: Test Upload

1. Go to **Add Product** page
2. Fill in all required fields
3. Upload 3-5 images
4. Click **Save Product**

If still failing, check browser console for detailed error messages.

---

## Common Issues & Solutions

### Issue 1: "Bucket not found"
**Solution**: Create `product-images` bucket in Storage dashboard (Step 2)

### Issue 2: "Not authenticated"
**Solution**: 
- Log out and log back in
- Clear browser cache
- Check if JWT token expired

### Issue 3: "Product not found"
**Solution**: Make sure product is saved to database BEFORE uploading images

### Issue 4: "Storage policy violation"
**Solution**: Double-check storage bucket policies (Step 2)

---

## Debugging Checklist

Run these in SQL Editor to verify setup:

```sql
-- 1. Check if product_images table has RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'product_images';
-- Expected: rowsecurity = true

-- 2. Check RLS policies on product_images
SELECT policyname, cmd, roles, qual
FROM pg_policies 
WHERE tablename = 'product_images';
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 3. Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';
-- Expected: 1 row with public = true

-- 4. Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'product-images';
-- Expected: At least 2-3 policies (upload, read, delete)

-- 5. Verify current user session
SELECT auth.uid() as current_user_id;
-- Expected: Your seller UUID (not null)
```

---

## Quick Fix (If All Else Fails)

**Temporarily disable RLS** to test (NOT for production!):

```sql
-- DISABLE RLS (testing only)
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- Test your upload...

-- RE-ENABLE RLS (after testing)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
```

Once upload works, you know it's an RLS policy issue. Fix the policies properly and re-enable RLS.

---

## Need More Help?

1. Check Supabase logs: Dashboard → Logs → Filter by "storage" or "postgres"
2. Enable verbose logging in your app
3. Check network tab in browser DevTools for failed requests
4. Verify the exact error message from Supabase response
