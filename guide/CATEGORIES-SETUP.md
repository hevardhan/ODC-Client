# 🎯 Categories & Enhanced Product Form - Setup Instructions

## Overview

Your seller portal has been upgraded with:
- ✅ **Categories table** with dropdown selection (Crafts, Spices, Foods, HandMade, Others)
- ✅ **Separate Add/Edit Product page** (no more popup dialog)
- ✅ **WYSIWYG Editor** for product specifications
- ✅ **New product fields**: Product Details and Specifications

---

## 🚀 Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase-categories-setup.sql` from your project root
3. Copy and paste the entire SQL into Supabase SQL Editor
4. Click **Run** to execute

This will:
- Create the `categories` table
- Insert 5 default categories (Crafts, Spices, Foods, HandMade, Others)
- Add new columns to `products` table: `category_id`, `product_details`, `specifications`
- Set up Row Level Security policies
- Create indexes for better performance

---

## 🎨 Step 2: Verify Database Changes

After running the SQL, verify in Supabase:

### Check Categories Table
```sql
SELECT * FROM categories;
```

You should see 5 categories:
| id | name | slug | description |
|----|------|------|-------------|
| ... | Crafts | crafts | Handcrafted items and artistic creations |
| ... | Spices | spices | Fresh and aromatic spices |
| ... | Foods | foods | Food products and consumables |
| ... | HandMade | handmade | Handmade products and artisan goods |
| ... | Others | others | Miscellaneous products |

### Check Products Table
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('category_id', 'product_details', 'specifications');
```

You should see 3 new columns:
- `category_id` (uuid)
- `product_details` (text)
- `specifications` (text)

---

## 🎉 Step 3: Test the New Features

### Start the Application
```bash
npm run dev
```

### Test Add Product Flow
1. Navigate to **Products** page
2. Click **"Add Product"** button
3. You'll be redirected to `/products/add` (separate page!)
4. Test the new form:
   - ✅ **Category Dropdown** - Select from Crafts, Spices, Foods, HandMade, Others
   - ✅ **Product Description** - Regular textarea (brief description)
   - ✅ **Product Details** - Textarea for additional details
   - ✅ **Specifications** - WYSIWYG editor with formatting toolbar
   - ✅ **Image Upload** - Same as before
5. Fill in the form and click **"Create Product"**
6. You'll be redirected back to products list

### Test Edit Product Flow
1. On Products page, click **Edit** (pencil icon) on any product
2. You'll be redirected to `/products/edit/{id}`
3. Form will be pre-filled with existing data
4. Make changes and click **"Update Product"**
5. You'll be redirected back to products list

### Test WYSIWYG Editor Features
In the **Specifications** section, test these toolbar buttons:
- **Bold** - Make text bold
- **Italic** - Make text italic
- **Heading** - Create section headings
- **Bullet List** - Create unordered lists
- **Numbered List** - Create ordered lists
- **Code Block** - Add code snippets
- **Undo/Redo** - Revert changes

---

## 📋 What Changed?

### New Files Created
1. **`supabase-categories-setup.sql`** - Database migration script
2. **`src/components/RichTextEditor.jsx`** - WYSIWYG editor component
3. **`src/services/categoryService.js`** - Category data service
4. **`src/pages/AddEditProduct.jsx`** - New separate add/edit product page
5. **`CATEGORIES-SETUP.md`** - This file (instructions)

### Files Modified
1. **`src/App.jsx`**
   - Added routes: `/products/add` and `/products/edit/:id`
   - Imported `AddEditProduct` component

2. **`src/pages/Products.jsx`**
   - Removed dialog popup for add/edit
   - Changed "Add Product" button to navigate to `/products/add`
   - Changed "Edit" button to navigate to `/products/edit/{id}`
   - Cleaned up form-related state and handlers

3. **`src/services/productService.js`**
   - Updated `createProduct()` to handle new fields:
     - `category_id` (UUID from categories table)
     - `product_details` (text)
     - `specifications` (HTML from WYSIWYG editor)
     - `stock_quantity` (renamed from `stock`)
   - Updated `updateProduct()` with same changes

4. **`src/index.css`**
   - Added TipTap editor styles (`.ProseMirror` classes)

5. **`package.json`**
   - Added dependencies:
     - `@tiptap/react` - WYSIWYG editor core
     - `@tiptap/starter-kit` - Basic editor extensions
     - `@tiptap/extension-placeholder` - Placeholder text

---

## 🗄️ Database Schema

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table (Updated)
```sql
-- Existing columns remain the same
-- New columns added:
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES categories(id),
ADD COLUMN product_details TEXT,
ADD COLUMN specifications TEXT;
```

**Note:** The old `category` column (text) still exists for backward compatibility, but new products use `category_id` (UUID foreign key).

---

## 🎨 Form Structure

### Add/Edit Product Page Sections

#### 1. **Basic Information**
- Product Name* (required)
- Product Description* (required) - Textarea
- Category* (required) - Dropdown with 5 categories
- Price* (required) - Number input
- Stock Quantity* (required) - Number input

#### 2. **Product Details**
- Product Details - Textarea
- Used for: Features, materials, dimensions, usage instructions, etc.

#### 3. **Specifications** (WYSIWYG Editor)
- Technical specifications with rich formatting
- Supports: Headings, lists, bold, italic, code blocks
- Stored as HTML in database

#### 4. **Product Image**
- Image upload (max 5MB)
- Preview before upload
- Change/remove image option

---

## 🔧 Troubleshooting

### Issue: Categories dropdown is empty
**Solution:**
1. Check if SQL was run successfully in Supabase
2. Verify categories exist: `SELECT * FROM categories;`
3. Check browser console for errors
4. Verify RLS policy allows reading categories

### Issue: Can't save product with category
**Solution:**
1. Make sure `category_id` column exists in products table
2. Check if foreign key constraint is set up
3. Verify the category UUID is valid

### Issue: WYSIWYG editor not showing
**Solution:**
1. Check if `@tiptap` packages are installed: `npm list @tiptap/react`
2. Clear browser cache and reload
3. Check browser console for errors
4. Make sure CSS for `.ProseMirror` is loaded

### Issue: Product Details/Specifications not saving
**Solution:**
1. Verify columns exist: Run verification SQL from Step 2
2. Check browser console for errors during save
3. Verify productService.js includes new fields in insert/update

### Issue: Edit redirects but form is empty
**Solution:**
1. Check if product ID is valid in URL
2. Verify `getProduct()` service includes new fields
3. Check browser console for errors loading product
4. Ensure product exists in database

---

## 🎯 Category Options

The 5 categories available in the dropdown:

1. **Crafts** - Handcrafted items and artistic creations
2. **Spices** - Fresh and aromatic spices
3. **Foods** - Food products and consumables
4. **HandMade** - Handmade products and artisan goods
5. **Others** - Miscellaneous products

### Want to Add More Categories?

**Option 1: Via SQL**
```sql
INSERT INTO categories (name, slug, description) VALUES
  ('Electronics', 'electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'clothing', 'Apparel and fashion items');
```

**Option 2: Via Supabase Table Editor**
1. Go to **Table Editor** → **categories**
2. Click **Insert row**
3. Fill in: name, slug, description
4. Save

---

## 📊 Data Migration

If you have existing products with the old `category` text field, they were automatically migrated to use `category_id` based on matching category names.

**Check migration:**
```sql
SELECT p.name, p.category as old_category, c.name as new_category 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
LIMIT 10;
```

**If some products weren't migrated:**
```sql
-- Manually link products to "Others" category
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Others')
WHERE category_id IS NULL;
```

---

## 🚀 What's Next?

Now that you have:
- ✅ Category dropdown
- ✅ Separate add/edit page
- ✅ WYSIWYG editor
- ✅ Enhanced product details

Consider adding:
- **Product variants** (size, color options)
- **Multiple images** (image gallery)
- **Product tags** (for better filtering)
- **Product reviews** (buyer feedback)
- **Inventory alerts** (low stock notifications)

---

## 📚 WYSIWYG Editor Usage Tips

### For Sellers:
When adding specifications, format them like this:

```
## Technical Specifications

- **Dimensions:** 10cm x 15cm x 5cm
- **Weight:** 250g
- **Material:** Handwoven cotton

## Care Instructions

1. Hand wash in cold water
2. Do not bleach
3. Lay flat to dry
```

This creates professional-looking product pages!

---

## 🔗 Useful Links

- **TipTap Docs:** https://tiptap.dev/
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com/

---

## ✅ Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify categories table exists with 5 categories
- [ ] Verify products table has new columns
- [ ] Test add product with category dropdown
- [ ] Test edit product flow
- [ ] Test WYSIWYG editor formatting
- [ ] Test image upload
- [ ] Create a sample product with full details

---

**Need help?** Check the browser console for error messages or refer to the troubleshooting section above.

Happy selling! 🎉
