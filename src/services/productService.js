import { supabase } from '@/lib/supabase';

/**
 * Product Service - Handles all product-related database operations
 */

// Get all products for the current seller
export const getAllProducts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
};

// Get a single product by ID
export const getProduct = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: error.message };
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get category name from category_id for backward compatibility with category column
    let categoryName = 'Others'; // Default
    if (productData.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', productData.category_id)
        .single();
      
      if (categoryData) {
        categoryName = categoryData.name;
      }
    }

    // Determine status based on stock
    const status = productData.stock === 0 ? 'out_of_stock' 
      : productData.stock < 10 ? 'low_stock' 
      : 'in_stock';

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          seller_id: user.id,
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock),
          category: categoryName, // Set category name from categories table
          category_id: productData.category_id || null, // New category_id field
          product_details: productData.product_details || null,
          specifications: productData.specifications || null,
          image_url: productData.image_url,
          status: status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
};

// Update a product
export const updateProduct = async (id, productData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get category name from category_id for backward compatibility with category column
    let categoryName = 'Others'; // Default
    if (productData.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', productData.category_id)
        .single();
      
      if (categoryData) {
        categoryName = categoryData.name;
      }
    }

    // Determine status based on stock
    const status = productData.stock === 0 ? 'out_of_stock' 
      : productData.stock < 10 ? 'low_stock' 
      : 'in_stock';

    const updateData = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category: categoryName, // Set category name from categories table
      category_id: productData.category_id || null, // New category_id field
      product_details: productData.product_details || null,
      specifications: productData.specifications || null,
      status: status,
    };

    // Only update image_url if provided
    if (productData.image_url !== undefined) {
      updateData.image_url = productData.image_url;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('seller_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get product to find image URL
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    // Delete product from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) throw error;

    // Delete image from storage if exists
    if (product?.image_url) {
      await deleteImage(product.image_url);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};

// Upload product image to Supabase Storage
export const uploadImage = async (file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB.');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

// Delete image from Supabase Storage
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return { success: true };

    // Extract file path from URL
    const urlParts = imageUrl.split('/product-images/');
    if (urlParts.length < 2) return { success: true };

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select('stock, status')
      .eq('seller_id', user.id);

    if (error) throw error;

    const stats = {
      total: data.length,
      inStock: data.filter(p => p.status === 'in_stock').length,
      lowStock: data.filter(p => p.status === 'low_stock').length,
      outOfStock: data.filter(p => p.status === 'out_of_stock').length,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return { success: false, error: error.message };
  }
};
