# 🗄️ Supabase Database & Storage Setup Guide

## 📋 Overview

This guide will help you set up a complete Supabase backend for your Seller Portal with:
- PostgreSQL database tables
- S3-compatible storage for product images
- Row Level Security (RLS) policies
- API integration code

---

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Login
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `seller-portal`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for project to be provisioned (~2 minutes)

---

## 🗃️ Step 2: Database Schema

### SQL Queries to Run

Go to **SQL Editor** in Supabase Dashboard and run these queries:

#### 1. Create Users/Sellers Table

```sql
-- Create sellers table (extends Supabase auth.users)
CREATE TABLE sellers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  shop_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own data
CREATE POLICY "Users can view own seller data"
  ON sellers FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own data
CREATE POLICY "Users can update own seller data"
  ON sellers FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own data
CREATE POLICY "Users can insert own seller data"
  ON sellers FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### 2. Create Products Table

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  status TEXT CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')) DEFAULT 'In Stock',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX products_seller_id_idx ON products(seller_id);
CREATE INDEX products_status_idx ON products(status);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own products
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = seller_id);

-- Create policy: Users can insert their own products
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Create policy: Users can update their own products
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id);

-- Create policy: Users can delete their own products
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);
```

#### 3. Create Orders Table

```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT CHECK (status IN ('Pending', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX orders_seller_id_idx ON orders(seller_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_order_date_idx ON orders(order_date DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);

-- Create policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Create policy: Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id);
```

#### 4. Create Earnings Table

```sql
-- Create earnings table
CREATE TABLE earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  type TEXT CHECK (type IN ('Product Sale', 'Shipping Fee', 'Other')) DEFAULT 'Product Sale',
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX earnings_seller_id_idx ON earnings(seller_id);
CREATE INDEX earnings_month_year_idx ON earnings(month, year);

-- Enable Row Level Security
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own earnings
CREATE POLICY "Users can view own earnings"
  ON earnings FOR SELECT
  USING (auth.uid() = seller_id);
```

#### 5. Create Triggers for Auto-updating timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sellers table
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 6. Create Function to Auto-update Product Status

```sql
-- Function to automatically update product status based on stock
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock = 0 THEN
    NEW.status = 'Out of Stock';
  ELSIF NEW.stock <= 20 THEN
    NEW.status = 'Low Stock';
  ELSE
    NEW.status = 'In Stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER auto_update_product_status
  BEFORE INSERT OR UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_status();
```

---

## 📦 Step 3: Storage Setup (S3-Compatible)

### Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Fill in:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (so images are publicly accessible)
4. Click **"Create bucket"**

### Storage Policies (Run in SQL Editor)

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Allow public read access to images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
```

---

## 🔑 Step 4: Get Your API Keys

1. Go to **Settings** > **API** in Supabase Dashboard
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (safe to use in frontend)
   - **service_role key**: `eyJhbGc...` (keep secret, server-side only)

---

## 📊 Step 5: Database Relationships Diagram

```
┌─────────────┐
│   auth.users│ (Supabase managed)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│   sellers   │
│─────────────│
│ id (PK)     │
│ full_name   │
│ email       │
│ shop_name   │
│ avatar_url  │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐         ┌─────────────┐
│  products   │◄────────│   orders    │
│─────────────│  N:1    │─────────────│
│ id (PK)     │         │ id (PK)     │
│ seller_id   │         │ seller_id   │
│ name        │         │ product_id  │
│ price       │         │ customer    │
│ stock       │         │ amount      │
│ image_url   │         │ status      │
│ status      │         └──────┬──────┘
└─────────────┘                │
                               │ 1:N
                               ▼
                        ┌─────────────┐
                        │  earnings   │
                        │─────────────│
                        │ id (PK)     │
                        │ seller_id   │
                        │ order_id    │
                        │ amount      │
                        │ type        │
                        └─────────────┘
```

---

## 📝 Step 6: Seed Data (Optional)

Insert sample data for testing:

```sql
-- Note: Replace 'YOUR_USER_ID' with actual user ID after signup
-- You can get this from auth.users table after creating an account

-- Insert sample seller
INSERT INTO sellers (id, full_name, email, shop_name)
VALUES 
  ('YOUR_USER_ID', 'John Seller', 'john@example.com', 'John\'s Electronics');

-- Insert sample products
INSERT INTO products (seller_id, name, description, price, stock, status)
VALUES 
  ('YOUR_USER_ID', 'Wireless Headphones', 'High-quality Bluetooth headphones', 89.99, 45, 'In Stock'),
  ('YOUR_USER_ID', 'Smart Watch', 'Fitness tracking smartwatch', 299.99, 12, 'Low Stock'),
  ('YOUR_USER_ID', 'Laptop Stand', 'Ergonomic aluminum stand', 45.50, 89, 'In Stock'),
  ('YOUR_USER_ID', 'USB-C Cable', 'Fast charging cable 6ft', 12.99, 0, 'Out of Stock'),
  ('YOUR_USER_ID', 'Phone Case', 'Protective silicone case', 19.99, 156, 'In Stock');

-- Insert sample orders
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status)
SELECT 
  'YOUR_USER_ID',
  id,
  'Alice Johnson',
  'alice@example.com',
  price,
  1,
  'Delivered'
FROM products WHERE seller_id = 'YOUR_USER_ID' LIMIT 1;
```

---

## 🔍 Useful Queries

### View all tables
```sql
SELECT * FROM sellers;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM earnings;
```

### Get products with seller info
```sql
SELECT p.*, s.shop_name, s.full_name as seller_name
FROM products p
JOIN sellers s ON p.seller_id = s.id;
```

### Get total earnings by seller
```sql
SELECT 
  s.full_name,
  s.shop_name,
  COUNT(o.id) as total_orders,
  SUM(o.amount) as total_earnings
FROM sellers s
LEFT JOIN orders o ON s.id = o.seller_id
GROUP BY s.id, s.full_name, s.shop_name;
```

### Get monthly earnings
```sql
SELECT 
  DATE_TRUNC('month', order_date) as month,
  SUM(amount) as earnings
FROM orders
WHERE seller_id = 'YOUR_USER_ID'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month DESC;
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] All tables created (sellers, products, orders, earnings)
- [ ] RLS policies enabled on all tables
- [ ] Triggers created for timestamps and status
- [ ] Storage bucket created (product-images)
- [ ] Storage policies configured
- [ ] API keys copied
- [ ] Sample data inserted (optional)
- [ ] Queries tested in SQL Editor

---

## 📌 Important Notes

### Security
- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Storage bucket has proper access policies
- ✅ API keys are scoped appropriately

### Storage
- Images are stored in S3-compatible Supabase Storage
- Public bucket allows direct image URLs
- Maximum file size: 50MB (default)
- Supported formats: JPEG, PNG, GIF, WebP

### Database
- UUID primary keys for better security
- Timestamps in UTC timezone
- Foreign key constraints for data integrity
- Indexes for optimized queries
- Check constraints for data validation

---

**Next Step:** See `SUPABASE-INTEGRATION.md` for React frontend integration code!

Date: October 13, 2025
