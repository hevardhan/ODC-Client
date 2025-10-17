import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/RichTextEditor"
import { MultipleImageUpload } from "@/components/MultipleImageUpload"
import { useAuth } from "@/context/AuthContext"
import { 
  createProduct, 
  updateProduct, 
  getProduct 
} from "@/services/productService"
import { getAllCategories } from "@/services/categoryService"
import { 
  uploadProductImages, 
  saveProductImages, 
  getProductImages,
  deleteAllProductImages 
} from "@/services/productImageService"

export function AddEditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const isEdit = !!id || searchParams.get('edit') === 'true'
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [productImages, setProductImages] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    product_details: "",
    specifications: "",
  })

  // Load categories on mount
  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  // Load product data if editing
  useEffect(() => {
    if (id && user) {
      loadProduct()
    }
  }, [id, user])

  const loadCategories = async () => {
    try {
      const result = await getAllCategories()
      if (result.success) {
        setCategories(result.data)
        // Set default category if not editing
        if (!id && result.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            category_id: result.data[0].id
          }))
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError("")
      const result = await getProduct(id)
      if (result.success) {
        const product = result.data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          stock: product.stock || "",
          category_id: product.category_id || "",
          product_details: product.product_details || "",
          specifications: product.specifications || "",
        })
        
        // Load existing images
        const imagesResult = await getProductImages(id)
        if (imagesResult.success && imagesResult.data) {
          const existingImages = imagesResult.data.map((img, index) => ({
            id: img.id,
            url: img.image_url,
            isPrimary: img.is_primary,
            order: img.display_order,
            existing: true // Mark as existing (not new upload)
          }))
          setProductImages(existingImages)
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImagesChange = (images) => {
    setProductImages(images)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file")
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError("")
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
    setFormData(prev => ({ ...prev, image_url: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Product name is required")
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error("Valid price is required")
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error("Valid stock quantity is required")
      }
      if (!formData.category_id) {
        throw new Error("Please select a category")
      }

      // Validate images (3-5 required)
      if (productImages.length < 3) {
        throw new Error("Please upload at least 3 product images")
      }
      if (productImages.length > 5) {
        throw new Error("Maximum 5 product images allowed")
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id,
        product_details: formData.product_details.trim(),
        specifications: formData.specifications,
        image_url: "", // Will be populated from first image
      }

      let result
      let productId

      if (id) {
        // Update existing product
        result = await updateProduct(id, productData)
        productId = id
      } else {
        // Create new product
        result = await createProduct(productData)
        productId = result.data?.id
      }

      if (!result.success) {
        throw new Error(result.error)
      }

      // Handle images
      if (productId) {
        // Get new images (those with 'file' property)
        const newImages = productImages.filter(img => img.file)
        
        if (newImages.length > 0) {
          // If editing, delete old images first
          if (id) {
            await deleteAllProductImages(productId)
          }

          // Upload new images
          const imageFiles = newImages.map(img => img.file)
          const uploadResult = await uploadProductImages(productId, imageFiles)
          
          if (!uploadResult.success) {
            throw new Error("Failed to upload images: " + uploadResult.error)
          }

          // Save to database with order and primary flag
          const imagesToSave = uploadResult.data.map((img, index) => ({
            url: img.url,
            order: index,
            isPrimary: index === 0
          }))

          const saveResult = await saveProductImages(productId, imagesToSave)
          if (!saveResult.success) {
            throw new Error("Failed to save images: " + saveResult.error)
          }

          // Update product with first image as primary
          await updateProduct(productId, {
            ...productData,
            image_url: uploadResult.data[0].url
          })
        }
      }

      navigate('/products')
    } catch (err) {
      setError(err.message || "Failed to save product")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/products')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {id ? 'Update product information' : 'Fill in the details to add a new product'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product Name <span className="text-destructive">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price ($) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Stock Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Add detailed information about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product Details
                </label>
                <textarea
                  name="product_details"
                  value={formData.product_details}
                  onChange={handleInputChange}
                  placeholder="Enter additional product details (features, materials, dimensions, etc.)"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Add details like features, materials, dimensions, or any other relevant information
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specifications (WYSIWYG) */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>
                Add detailed specifications using the rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={formData.specifications}
                onChange={(value) => setFormData(prev => ({ ...prev, specifications: value }))}
                placeholder="Enter product specifications (technical details, measurements, compatibility, etc.)"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format specifications using headings, lists, and bold text for better readability
              </p>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload 3-5 high-quality images of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultipleImageUpload
                images={productImages}
                onChange={handleImagesChange}
                minImages={3}
                maxImages={5}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {id ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {id ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
