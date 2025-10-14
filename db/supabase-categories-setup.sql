-- ==========================================
-- CATEGORIES TABLE SETUP
-- ==========================================
-- Run this in Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Crafts', 'crafts', 'Handcrafted items and artistic creations'),
  ('Spices', 'spices', 'Fresh and aromatic spices'),
  ('Foods', 'foods', 'Food products and consumables'),
  ('HandMade', 'handmade', 'Handmade products and artisan goods'),
  ('Others', 'others', 'Miscellaneous products')
ON CONFLICT (name) DO NOTHING;

-- 3. Add category_id column to products table (foreign key to categories)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 4. Add new columns for product details and specifications
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_details TEXT,
ADD COLUMN IF NOT EXISTS specifications TEXT;

-- 5. Migrate existing category data (if any products use old category column)
-- This will map old text categories to new category_id
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(p.category) = LOWER(c.name)
AND p.category_id IS NULL;

-- Set default category for products without a category
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Others')
WHERE category_id IS NULL;

-- 6. Enable Row Level Security (RLS) on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for categories table

-- Allow everyone to read categories (for dropdown)
CREATE POLICY "Anyone can view categories" 
ON categories 
FOR SELECT 
USING (true);

-- Only authenticated sellers can create categories (optional - for future)
CREATE POLICY "Authenticated users can insert categories" 
ON categories 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 8. Update existing products policies to include new columns (if needed)
-- This ensures sellers can read/write the new columns

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ==========================================
-- VERIFICATION QUERIES (Run these to check)
-- ==========================================

-- Check if categories were created
-- SELECT * FROM categories;

-- Check if products table was updated
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
-- AND column_name IN ('category_id', 'product_details', 'specifications');

-- Check if products are linked to categories
-- SELECT p.name, p.category, c.name as category_name 
-- FROM products p 
-- LEFT JOIN categories c ON p.category_id = c.id 
-- LIMIT 10;
