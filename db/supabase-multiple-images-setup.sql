-- ==========================================
-- MULTIPLE PRODUCT IMAGES SETUP
-- ==========================================
-- Run this in Supabase SQL Editor

-- 1. Create product_images table for multiple images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);

-- 3. Enable Row Level Security (RLS) on product_images table
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Sellers can view their product images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can insert their product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can update their product images" ON product_images;
DROP POLICY IF EXISTS "Sellers can delete their product images" ON product_images;

-- 5. Create policies for product_images table

-- Allow anyone to view product images (for buyers/shop)
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

-- 6. Migrate existing product images to product_images table
-- This will take the single image_url from products and create entries in product_images
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT 
  id as product_id,
  image_url,
  0 as display_order,
  true as is_primary
FROM products
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_images.product_id = products.id
  );

-- 7. Add constraint to ensure 3-5 images per product (optional, enforced in app)
-- Note: This is a soft constraint. Hard constraint would require triggers.
-- We'll enforce this in the application layer for better UX

-- 8. Create function to get primary image for a product (helper)
CREATE OR REPLACE FUNCTION get_primary_image(p_product_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_image_url TEXT;
BEGIN
  SELECT image_url INTO v_image_url
  FROM product_images
  WHERE product_id = p_product_id
  ORDER BY is_primary DESC, display_order ASC
  LIMIT 1;
  
  RETURN v_image_url;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STORAGE BUCKET SETUP (IMPORTANT!)
-- ==========================================
-- Storage bucket policies CANNOT be created via SQL in newer Supabase versions
-- You MUST create them via the Supabase Dashboard

-- STEP 1: Create Storage Bucket
-- --------------------------------------------
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Bucket Name: product-images
-- 4. Public bucket: YES (check this box)
-- 5. Click "Create Bucket"

-- STEP 2: Create Storage Policies for the Bucket
-- --------------------------------------------
-- After creating the bucket, you need to add policies:

-- METHOD A: Via Dashboard (RECOMMENDED)
-- 1. Click on 'product-images' bucket
-- 2. Go to "Policies" tab
-- 3. Click "New Policy" and create these 3 policies:

-- POLICY 1: Upload Policy
-- Name: Authenticated users can upload
-- Allowed operation: INSERT
-- Policy definition:
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
);

-- POLICY 2: Delete Policy  
-- Name: Authenticated users can delete
-- Allowed operation: DELETE
-- Policy definition:
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
);

-- POLICY 3: Public Read Policy (if bucket is not public)
-- Name: Public can read
-- Allowed operation: SELECT
-- Policy definition:
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'product-images'
);

-- NOTE: If you made the bucket PUBLIC during creation, 
-- the read policy is automatically created, so you only need policies 1 & 2

-- ==========================================
-- VERIFICATION QUERIES (Run these to check)
-- ==========================================

-- Check if product_images table was created
-- SELECT * FROM product_images LIMIT 10;

-- Check product images count per product
-- SELECT p.name, COUNT(pi.id) as image_count
-- FROM products p
-- LEFT JOIN product_images pi ON p.id = pi.product_id
-- GROUP BY p.id, p.name
-- ORDER BY image_count DESC;

-- Check primary images
-- SELECT p.name, pi.image_url, pi.is_primary, pi.display_order
-- FROM products p
-- JOIN product_images pi ON p.id = pi.product_id
-- WHERE pi.is_primary = true;
