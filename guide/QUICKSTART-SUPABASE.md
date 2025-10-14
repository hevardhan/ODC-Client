# 🚀 Quick Start: Supabase Integration

## Follow these steps in order:

---

## Part 1: Supabase Setup (10 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `seller-portal`
3. Save your database password!

### 2. Run SQL Queries
Open **SQL Editor** and run these queries **in order**:

1. ✅ **Sellers table** (from SUPABASE-SETUP.md)
2. ✅ **Products table** (from SUPABASE-SETUP.md)
3. ✅ **Orders table** (from SUPABASE-SETUP.md)
4. ✅ **Earnings table** (from SUPABASE-SETUP.md)
5. ✅ **Triggers** (from SUPABASE-SETUP.md)
6. ✅ **Product status function** (from SUPABASE-SETUP.md)

### 3. Create Storage Bucket
1. Go to **Storage** → **New bucket**
2. Name: `product-images`
3. ✅ Check "Public bucket"
4. Create it

### 4. Run Storage Policies
Back in **SQL Editor**, run storage policies (from SUPABASE-SETUP.md)

### 5. Get API Keys
1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - anon public key

---

## Part 2: React Integration (5 minutes)

### 1. Install Supabase
```bash
cd "H:\Projects\New folder (4)\ODC-Client"
npm install @supabase/supabase-js
```

### 2. Create Environment File
Create `.env` in project root:
```env
VITE_SUPABASE_URL=YOUR_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 3. Add to .gitignore
Add this line to `.gitignore`:
```
.env
```

### 4. Create Supabase Client
Create `src/lib/supabase.js` (code in SUPABASE-INTEGRATION.md)

### 5. Create Product Service
Create `src/services/productService.js` (code in SUPABASE-INTEGRATION.md)

### 6. Update AuthContext
Replace `src/context/AuthContext.jsx` (code in SUPABASE-INTEGRATION.md)

### 7. Update Products Page
Replace `src/pages/Products.jsx` (code in SUPABASE-INTEGRATION.md)

### 8. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Part 3: Test Everything (5 minutes)

### Test Signup
1. Open http://localhost:5174/signup
2. Create account with email/password
3. ✅ Should redirect to dashboard

### Test Products
1. Go to Products page
2. Click "+ Add Product"
3. Fill form and upload image
4. ✅ Product should appear with image
5. Click Edit → change stock → save
6. ✅ Status badge should update
7. Click Delete
8. ✅ Product should be removed

### Verify in Supabase
1. Go to Supabase **Table Editor**
2. Check `sellers` table → your user exists
3. Check `products` table → your products exist
4. Go to **Storage** → `product-images`
5. ✅ Your uploaded images are there

---

## 📋 SQL Queries Quick Copy

### 1. Sellers Table
```sql
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

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seller data"
  ON sellers FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own seller data"
  ON sellers FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own seller data"
  ON sellers FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Products Table
```sql
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

CREATE INDEX products_seller_id_idx ON products(seller_id);
CREATE INDEX products_status_idx ON products(status);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE USING (auth.uid() = seller_id);
```

### 3. Orders Table
```sql
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

CREATE INDEX orders_seller_id_idx ON orders(seller_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_order_date_idx ON orders(order_date DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE USING (auth.uid() = seller_id);
```

### 4. Earnings Table
```sql
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

CREATE INDEX earnings_seller_id_idx ON earnings(seller_id);
CREATE INDEX earnings_month_year_idx ON earnings(month, year);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings"
  ON earnings FOR SELECT USING (auth.uid() = seller_id);
```

### 5. Triggers
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. Product Status Function
```sql
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

CREATE TRIGGER auto_update_product_status
  BEFORE INSERT OR UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_status();
```

### 7. Storage Policies
```sql
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Users can update own product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
```

---

## 🎯 Expected Result

After completing all steps:

✅ Database tables created
✅ Storage bucket configured  
✅ React app connected to Supabase
✅ Can signup/login
✅ Can add/edit/delete products
✅ Can upload product images
✅ Images display in product cards
✅ Everything persists in database

---

## 🆘 Common Issues

### "relation does not exist"
→ Run SQL queries in correct order

### ".env not found"
→ Restart dev server after creating `.env`

### "Policy violation"
→ Check RLS policies are created

### Images not uploading
→ Verify storage bucket is public

---

## 📚 Full Documentation

- **SUPABASE-SETUP.md** - Complete database setup
- **SUPABASE-INTEGRATION.md** - React integration code

---

**Time to complete:** ~20 minutes
**Difficulty:** Medium

Let's go! 🚀
