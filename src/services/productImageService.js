import { supabase } from '@/lib/supabase';

/**
 * Product Images Service - Handles multiple image operations
 */

// Upload multiple images for a product
export const uploadProductImages = async (productId, imageFiles) => {
  try {
    const uploadedImages = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedImages.push({
        url: publicUrl,
        order: i
      });
    }

    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error('Error uploading images:', error);
    return { success: false, error: error.message };
  }
};

// Save product images to database
export const saveProductImages = async (productId, images) => {
  try {
    const imageRecords = images.map((img, index) => ({
      product_id: productId,
      image_url: img.url,
      display_order: index,
      is_primary: index === 0 // First image is primary
    }));

    const { data, error } = await supabase
      .from('product_images')
      .insert(imageRecords)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving product images:', error);
    return { success: false, error: error.message };
  }
};

// Get all images for a product
export const getProductImages = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching product images:', error);
    return { success: false, error: error.message };
  }
};

// Delete a single product image
export const deleteProductImage = async (imageId, imageUrl) => {
  try {
    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    // Delete from storage
    if (imageUrl) {
      const path = imageUrl.split('/').pop();
      await supabase.storage
        .from('product-images')
        .remove([path]);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product image:', error);
    return { success: false, error: error.message };
  }
};

// Delete all images for a product
export const deleteAllProductImages = async (productId) => {
  try {
    // Get all images first
    const { data: images } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId);

    if (images && images.length > 0) {
      // Delete from storage
      const filePaths = images.map(img => {
        const url = img.image_url;
        return url.split('/').pop();
      }).filter(Boolean);

      if (filePaths.length > 0) {
        await supabase.storage
          .from('product-images')
          .remove(filePaths);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (dbError) throw dbError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting all product images:', error);
    return { success: false, error: error.message };
  }
};

// Update image order
export const updateImageOrder = async (imageId, newOrder) => {
  try {
    const { error } = await supabase
      .from('product_images')
      .update({ display_order: newOrder })
      .eq('id', imageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating image order:', error);
    return { success: false, error: error.message };
  }
};

// Set primary image
export const setPrimaryImage = async (productId, imageId) => {
  try {
    // Remove primary flag from all images of this product
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Set new primary image
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error setting primary image:', error);
    return { success: false, error: error.message };
  }
};
