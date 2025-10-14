# 🚀 Step-by-Step Supabase Integration Guide

Follow these steps **in order** to integrate Supabase with your Seller Portal. Estimated time: **30 minutes**.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] A Supabase account (sign up at [supabase.com](https://supabase.com))
- [ ] This project running locally (`npm run dev`)
- [ ] A code editor open (VS Code)

---

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up / Log In
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign In"**
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in the details:
   - **Organization**: Select or create one
   - **Name**: `seller-portal` (or your preferred name)
   - **Database Password**: Create a strong password **and save it somewhere safe!**
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier is fine for development
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to be provisioned ☕

### 1.3 Save Your Credentials
Once project is ready, go to **Settings** → **API**:
- Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- Copy **anon/public key** (starts with `eyJ...`)
- **Keep these safe!** You'll need them in Step 3.

✅ **Checkpoint**: You should see a green "Active" status on your project.

---

## Step 2: Set Up Database Schema (10 minutes)

### 2.1 Open SQL Editor
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**

### 2.2 Run SQL Queries

Copy and paste each query below **one at a time** and click **"Run"** after each.

#### Query 1: Enable UUID Extension
```sql
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
Click **Run** ✓

#### Query 2: Create Sellers Table
```sql
-- Create sellers table (extends Supabase auth.users)
CREATE TABLE sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  shop_name TEXT,
  shop_description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
Click **Run** ✓

#### Query 3: Create Products Table
```sql
-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
```
Click **Run** ✓

#### Query 4: Create Orders Table
```sql
-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  order_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date DESC);
```
Click **Run** ✓

#### Query 5: Create Earnings Table
```sql
-- Create earnings table
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  type TEXT NOT NULL CHECK (type IN ('sale', 'refund', 'adjustment')),
  description TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_earnings_seller_id ON earnings(seller_id);
CREATE INDEX idx_earnings_date ON earnings(date DESC);
```
Click **Run** ✓

#### Query 6: Create Auto-Update Triggers
```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
Click **Run** ✓

#### Query 7: Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Sellers: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON sellers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON sellers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON sellers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products: Sellers can only manage their own products
CREATE POLICY "Sellers can view own products" ON products
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- Orders: Sellers can only view their own orders
CREATE POLICY "Sellers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = seller_id);

-- Earnings: Sellers can only view their own earnings
CREATE POLICY "Sellers can view own earnings" ON earnings
  FOR SELECT USING (auth.uid() = seller_id);
```
Click **Run** ✓

✅ **Checkpoint**: Go to **Table Editor** in sidebar. You should see 4 tables: `sellers`, `products`, `orders`, `earnings`.

---

## Step 3: Set Up Storage for Product Images (5 minutes)

### 3.1 Create Storage Bucket
1. Click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (so images are publicly accessible)
4. Click **"Create bucket"**

### 3.2 Set Storage Policies
1. Click on `product-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"** → **"For full customization"**

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Sellers can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```
Click **"Review"** → **"Save policy"**

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```
Click **"Review"** → **"Save policy"**

**Policy 3: Allow sellers to delete their own images**
```sql
CREATE POLICY "Sellers can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```
Click **"Review"** → **"Save policy"**

✅ **Checkpoint**: You should see 3 policies active on `product-images` bucket.

---

## Step 4: Install Supabase Client (2 minutes)

### 4.1 Install Package
Open your terminal in VS Code and run:
```bash
npm install @supabase/supabase-js
```

Wait for installation to complete...

✅ **Checkpoint**: Check `package.json` - you should see `@supabase/supabase-js` in dependencies.

---

## Step 5: Configure Environment Variables (2 minutes)

### 5.1 Create .env File
In your project root (`H:\Projects\New folder (4)\ODC-Client`), create a file named `.env`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5.2 Add Your Credentials
Replace the placeholder values with your actual credentials from Step 1.3:
- Replace `your_project_url_here` with your Project URL
- Replace `your_anon_key_here` with your anon/public key

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.3 Update .gitignore
Make sure `.env` is in your `.gitignore` file (so you don't commit secrets):
```
.env
.env.local
```

### 5.4 Restart Dev Server
Stop your dev server (`Ctrl+C`) and restart it:
```bash
npm run dev
```

✅ **Checkpoint**: Server should restart without errors.

---

## Step 6: Create Supabase Client (3 minutes)

### 6.1 Create lib Directory
Create folder: `src/lib/`

### 6.2 Create Supabase Client File
Create file: `src/lib/supabase.js` with this content:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

✅ **Checkpoint**: No errors in console when dev server reloads.

---

## Step 7: Update Authentication (5 minutes)

### 7.1 Update AuthContext
Replace the entire content of `src/context/AuthContext.jsx` with the code from `SUPABASE-INTEGRATION.md` (lines 40-130).

**Key changes:**
- Uses `supabase.auth.signUp()` for signup
- Uses `supabase.auth.signInWithPassword()` for login
- Uses `supabase.auth.signOut()` for logout
- Creates seller profile automatically on signup
- Listens to auth state changes

### 7.2 Update Login Page
In `src/pages/Login.jsx`, update the `handleSubmit` function:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  } catch (err) {
    setError('Failed to log in. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 7.3 Update Signup Page
In `src/pages/Signup.jsx`, update the `handleSubmit` function:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  try {
    const result = await signup(formData.email, formData.password, formData.fullName);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to create account');
    }
  } catch (err) {
    setError('Failed to sign up. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

✅ **Checkpoint**: Try signing up with a new email. Check Supabase **Authentication** tab - you should see the new user.

---

## Step 8: Create Product Service (3 minutes)

### 8.1 Create services Directory
Create folder: `src/services/`

### 8.2 Create Product Service File
Create file: `src/services/productService.js` with the complete code from `SUPABASE-INTEGRATION.md` (lines 132-290).

**This service provides:**
- `getAllProducts()` - Fetch all products for current seller
- `getProduct(id)` - Get single product
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `uploadImage(file)` - Upload image to Supabase Storage
- `deleteImage(url)` - Delete image from Storage
- `getProductStats()` - Get product statistics

✅ **Checkpoint**: File created, no syntax errors.

---

## Step 9: Update Products Page (5 minutes)

### 9.1 Replace Products.jsx
Replace the entire content of `src/pages/Products.jsx` with the code from `SUPABASE-INTEGRATION.md` (lines 292-650).

**Key new features:**
- Fetches real products from Supabase on mount
- Image upload with preview
- Loading states with Skeleton components
- Error handling
- Real-time stats calculation
- Creates/updates products in database

✅ **Checkpoint**: Products page should load (empty list is normal if no products yet).

---

## 🎉 Step 10: Test Everything!

### 10.1 Test Signup Flow
1. Go to signup page
2. Create a new account with:
   - Email: `test@seller.com`
   - Password: `Test123!`
   - Full Name: `Test Seller`
3. Should redirect to dashboard automatically
4. **Verify**: Check Supabase **Authentication** tab - user should exist
5. **Verify**: Check `sellers` table - seller profile should be created

### 10.2 Test Product Creation
1. Go to Products page
2. Click **"Add Product"**
3. Fill in:
   - Name: `Test Product`
   - Price: `99.99`
   - Stock: `50`
   - Category: `Electronics`
   - Description: `A test product`
4. Click **"Choose File"** and select an image (JPG/PNG)
5. Click **"Add Product"**
6. **Verify**: Product card should appear
7. **Verify**: Check Supabase `products` table - product should be inserted
8. **Verify**: Check Storage `product-images` bucket - image should be uploaded

### 10.3 Test Product Editing
1. Click **Edit** on a product
2. Change the name or price
3. Click **"Save Changes"**
4. **Verify**: Changes reflect immediately
5. **Verify**: Check Supabase `products` table - updated_at should change

### 10.4 Test Product Deletion
1. Click **Delete** on a product
2. Confirm deletion
3. **Verify**: Product disappears
4. **Verify**: Check Storage - image should be deleted

### 10.5 Test Theme Toggle
1. Click sun/moon icon in navbar
2. **Verify**: Theme switches instantly
3. Refresh page
4. **Verify**: Theme persists

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: 
- Check `.env` file exists in project root
- Verify it has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env`

### Issue: "Failed to create account" on signup
**Solution**:
- Check Supabase **Authentication** → **Email Templates** → Enable email confirmation
- OR Go to **Authentication** → **Providers** → Email → Disable "Confirm email"

### Issue: "Row Level Security policy violation"
**Solution**:
- Verify you ran all RLS policies in Step 2.2, Query 7
- Check **Authentication** → **Policies** tab on each table

### Issue: Image upload fails
**Solution**:
- Verify `product-images` bucket is **public**
- Check all 3 storage policies are active
- Ensure file is JPG, PNG, or WEBP under 5MB

### Issue: Products not loading
**Solution**:
- Open browser console (F12) for error details
- Verify user is logged in (check `localStorage` for `supabase.auth.token`)
- Check Network tab for failed requests

### Issue: Can't see uploaded products
**Solution**:
- Verify products are in `products` table in Supabase
- Check `seller_id` matches your user ID in `auth.users`
- Try logging out and back in

---

## 📚 Next Steps

Now that Supabase is integrated, you can:

1. **Update Dashboard** - Fetch real orders and earnings data
2. **Update Orders Page** - Connect to `orders` table
3. **Update Earnings Page** - Connect to `earnings` table
4. **Update Settings** - Save to `sellers` table
5. **Add Search/Filter** - Use Supabase queries with filters
6. **Add Pagination** - Use `.range()` for large datasets
7. **Add Real-time Updates** - Use Supabase realtime subscriptions

---

## 🎓 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Completion Checklist

Before you're done, verify:
- [ ] Supabase project created and active
- [ ] All 7 SQL queries executed successfully
- [ ] Storage bucket `product-images` created with 3 policies
- [ ] `@supabase/supabase-js` installed
- [ ] `.env` file created with correct credentials
- [ ] `src/lib/supabase.js` created
- [ ] `AuthContext.jsx` updated
- [ ] `Login.jsx` and `Signup.jsx` updated
- [ ] `src/services/productService.js` created
- [ ] `Products.jsx` updated
- [ ] Can signup and login successfully
- [ ] Can create product with image
- [ ] Can edit and delete products
- [ ] Images upload to Supabase Storage

**Congratulations! 🎉 Your Seller Portal is now connected to Supabase!**
