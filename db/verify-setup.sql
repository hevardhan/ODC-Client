-- ==========================================
-- COMPLETE VERIFICATION SCRIPT
-- ==========================================
-- Run this to check if everything is properly configured

-- 1. Check product_images table exists and has RLS
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'product_images';
-- Expected: 1 row with RLS Enabled = true

-- 2. List all RLS policies on product_images
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles",
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as "Using",
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as "With Check"
FROM pg_policies 
WHERE tablename = 'product_images'
ORDER BY cmd;
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 3. Check storage bucket configuration
SELECT 
  id as "Bucket ID",
  name as "Bucket Name",
  public as "Is Public",
  created_at as "Created"
FROM storage.buckets 
WHERE id = 'product-images';
-- Expected: 1 row with Is Public = true

-- 4. Check storage policies
SELECT 
  name as "Policy Name",
  bucket_id as "Bucket",
  definition as "Definition"
FROM storage.policies 
WHERE bucket_id = 'product-images'
ORDER BY name;
-- Expected: 2-3 policies (upload, read, delete)

-- 5. Verify current authenticated user
SELECT 
  auth.uid() as "Your User ID",
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✓ Authenticated'
    ELSE '✗ Not Authenticated'
  END as "Auth Status";
-- Expected: Your UUID and "✓ Authenticated"

-- 6. Check your products (to verify seller_id)
SELECT 
  id as "Product ID",
  name as "Product Name",
  seller_id as "Seller ID",
  CASE 
    WHEN seller_id = auth.uid() THEN '✓ You own this'
    ELSE '✗ Not your product'
  END as "Ownership"
FROM products 
WHERE seller_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
-- Expected: List of your products with "✓ You own this"

-- 7. Check existing product images (if any)
SELECT 
  p.name as "Product",
  pi.image_url as "Image URL",
  pi.display_order as "Order",
  pi.is_primary as "Is Primary",
  pi.created_at as "Uploaded"
FROM product_images pi
JOIN products p ON p.id = pi.product_id
WHERE p.seller_id = auth.uid()
ORDER BY p.name, pi.display_order
LIMIT 10;
-- Expected: List of images (or empty if none uploaded yet)

-- 8. Test INSERT permission (simulation)
-- This doesn't actually insert, just checks if policy would allow it
EXPLAIN (FORMAT TEXT)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM products 
      WHERE id = 'some-uuid-here' 
      AND seller_id = auth.uid()
    ) THEN '✓ INSERT would be allowed'
    ELSE '✗ INSERT would be blocked'
  END as "Insert Permission Test";
-- Expected: "✓ INSERT would be allowed" if you own products

-- ==========================================
-- SUMMARY
-- ==========================================
-- All checks should pass (✓) for successful image uploads
-- If any check fails (✗), see FIX_RLS_ERROR.md for solutions
