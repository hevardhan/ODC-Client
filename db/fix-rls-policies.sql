-- ==========================================
-- FIX RLS POLICIES FOR PRODUCT IMAGES
-- ==========================================
-- Run this if you're getting "row-level security policy" errors

-- 1. Drop all existing policies on product_images
DROP POLICY IF EXISTS "Sellers can view their product images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can insert their product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can update their product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can delete their product images" ON product_images;

-- 2. Create new policies with proper authentication

-- Allow anyone to view product images (public read)
CREATE POLICY "Anyone can view product images" 
ON product_images 
FOR SELECT 
USING (true);

-- Allow authenticated sellers to insert images for their products
CREATE POLICY "Sellers can insert their product images" 
ON product_images 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow authenticated sellers to update their product images
CREATE POLICY "Sellers can update their product images" 
ON product_images 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow authenticated sellers to delete their product images
CREATE POLICY "Sellers can delete their product images" 
ON product_images 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- ==========================================
-- VERIFY POLICIES
-- ==========================================
-- Run this to check if policies are applied correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_images';

-- ==========================================
-- STORAGE BUCKET POLICIES
-- ==========================================
-- Storage policies MUST be created via Dashboard or these SQL commands:

-- First, ensure the bucket exists (create manually in Dashboard if needed)
-- Then run these policies in SQL Editor:

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;

-- Create storage upload policy
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
);

-- Create storage delete policy
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
);

-- Create storage read policy (only if bucket is not public)
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'product-images'
);

-- Verify storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

