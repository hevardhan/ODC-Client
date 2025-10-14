# Multiple Images Migration Guide

## Overview
This guide helps you migrate from single product image to multiple images (3-5 per product).

## Step 1: Run SQL in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `supabase-multiple-images-setup.sql` in your project
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute

The SQL script will:
- Create a new `product_images` table to store multiple images per product
- Set up Row Level Security (RLS) policies for sellers and public access
- Migrate existing single images from `products.image_url` to `product_images` table
- Create helper functions for getting primary images

## Step 2: Verify Database Changes

After running the SQL, verify the following:

```sql
-- Check if product_images table exists
SELECT * FROM product_images LIMIT 1;

-- Check if existing images were migrated
SELECT 
  p.name as product_name,
  pi.image_url,
  pi.display_order,
  pi.is_primary
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.created_at DESC;
```

## Step 3: Test the Frontend

1. **Add New Product**:
   - Go to Products page → "Add Product"
   - Try uploading less than 3 images → Should show error
   - Upload 3-5 images → Should work
   - Try uploading more than 5 images → Should be blocked
   - Verify first image is marked as primary (green border with star)

2. **Edit Existing Product**:
   - Go to Products page → Click edit on any product
   - Existing images should load automatically
   - Add/remove images (maintain 3-5 count)
   - Reorder images using up/down arrows
   - Change primary image using star icon
   - Save changes

3. **Image Controls**:
   - **Remove**: Click X button on any image
   - **Reorder**: Use up/down arrow buttons to change order
   - **Set Primary**: Click star icon to mark as primary image
   - Primary image has green border and star badge

## Database Schema

### product_images Table
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Constraints
- Each product must have 3-5 images (enforced in frontend)
- Only one image per product can be marked as primary
- Images are automatically deleted when product is deleted (CASCADE)
- Images are ordered by `display_order` field

## Files Changed

### New Files Created:
1. **`supabase-multiple-images-setup.sql`** - Database migration script
2. **`src/services/productImageService.js`** - Image CRUD operations
3. **`src/components/MultipleImageUpload.jsx`** - Image upload UI component

### Modified Files:
1. **`src/pages/AddEditProduct.jsx`**:
   - Replaced single image upload with multiple images
   - Added validation for 3-5 images
   - Added image reordering and primary selection
   - Integrated with `productImageService`

## Image Storage

Images are stored in Supabase Storage bucket: `product-images`

**File naming convention**: `{productId}/{timestamp}-{filename}`

**Example**: `550e8400-e29b-41d4-a716-446655440000/1704067200000-product.jpg`

## Backward Compatibility

The `products.image_url` column is still maintained for backward compatibility:
- First/primary image URL is stored in `products.image_url`
- This ensures old code continues to work
- New code should use `product_images` table

## Troubleshooting

### Images not uploading
- Check if Supabase Storage bucket `product-images` exists
- Verify RLS policies allow sellers to upload
- Check browser console for errors

### Images not displaying
- Verify `product_images` table has records
- Check if `image_url` values are valid URLs
- Ensure public access is enabled in Storage bucket

### Migration issues
- If migration fails, check if `products.image_url` column exists
- Verify foreign key constraints are correct
- Check Supabase logs for detailed errors

## Next Steps

After successful migration:
1. Update `Products.jsx` to display primary image from `product_images`
2. Consider adding image zoom/lightbox feature
3. Add image optimization (resize, compress) on upload
4. Implement lazy loading for product images

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- Product images service code: `src/services/productImageService.js`
- Component implementation: `src/components/MultipleImageUpload.jsx`
