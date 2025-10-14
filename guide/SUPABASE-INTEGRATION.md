# 🔌 Supabase Integration with React

## Complete guide to integrate Supabase with your Seller Portal

---

## 📦 Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 🔧 Step 2: Create Supabase Client

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔐 Step 3: Create Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Add `.env` to `.gitignore`:
```
# .gitignore
.env
.env.local
```

---

## 👤 Step 4: Update AuthContext with Supabase

Replace `src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create seller profile
      const { error: profileError } = await supabase
        .from('sellers')
        .insert([
          {
            id: authData.user.id,
            full_name: name,
            email: email,
            shop_name: `${name}'s Shop`,
          },
        ]);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 🛍️ Step 5: Create Products Service

Create `src/services/productService.js`:

```javascript
import { supabase } from '@/lib/supabase';

export const productService = {
  // Get all products for current user
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add new product
  async addProduct(product) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          seller_id: user.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: parseInt(product.stock),
          image_url: product.image_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: parseFloat(updates.price),
        stock: parseInt(updates.stock),
        image_url: updates.image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload product image
  async uploadImage(file, productId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Delete product image
  async deleteImage(imageUrl) {
    if (!imageUrl) return;
    
    const path = imageUrl.split('/product-images/')[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);

    if (error) throw error;
  },
};
```

---

## 📦 Step 6: Update Products Page

Update `src/pages/Products.jsx`:

```javascript
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { productService } from "@/services/productService"
import { useAuth } from "@/context/AuthContext"

export function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  })

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Failed to load products')
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = editingProduct?.image_url || null

      // Upload image if selected
      if (imageFile) {
        const tempId = editingProduct?.id || `temp-${Date.now()}`
        imageUrl = await productService.uploadImage(imageFile, tempId)
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        image_url: imageUrl,
      }

      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(editingProduct.id, productData)
      } else {
        // Add new product
        await productService.addProduct(productData)
      }

      await loadProducts()
      handleDialogClose()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const product = products.find(p => p.id === id)
      
      // Delete image if exists
      if (product?.image_url) {
        await productService.deleteImage(product.image_url)
      }

      await productService.deleteProduct(id)
      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setImageFile(null)
    setFormData({ name: "", description: "", price: "", stock: "" })
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setImageFile(null)
    setFormData({ name: "", description: "", price: "", stock: "" })
    setIsDialogOpen(true)
  }

  const getStatusBadge = (stock) => {
    if (stock === 0) return { variant: "destructive", label: "Out of Stock" }
    if (stock <= 20) return { variant: "secondary", label: "Low Stock" }
    return { variant: "default", label: "In Stock" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleDialogClose()
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details" : "Fill in the details to add a new product"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock *</label>
                <Input
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imageFile && (
                    <Badge variant="secondary">{imageFile.name}</Badge>
                  )}
                </div>
                {editingProduct?.image_url && !imageFile && (
                  <img 
                    src={editingProduct.image_url} 
                    alt="Current product" 
                    className="mt-2 h-20 w-20 object-cover rounded border"
                  />
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleDialogClose} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-3xl">{products.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Stock</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {products.filter(p => p.stock > 20).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Low Stock</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {products.filter(p => p.stock <= 20 && p.stock > 0).length + products.filter(p => p.stock === 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {products.map((product, index) => {
          const status = getStatusBadge(product.stock)
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="text-2xl font-bold text-foreground">${product.price}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-medium">{product.stock} units</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {products.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
```

---

## 📝 Step 7: Update Login & Signup Pages

### Update Login.jsx

```javascript
// In handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault()
  setError("")
  
  if (!email || !password) {
    setError("Please fill in all fields")
    return
  }

  const result = await login(email, password)
  if (result.success) {
    navigate("/dashboard")
  } else {
    setError(result.error || "Invalid credentials")
  }
}
```

### Update Signup.jsx

```javascript
// In handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault()
  setError("")
  
  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
    setError("Please fill in all fields")
    return
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match")
    return
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters")
    return
  }

  const result = await signup(formData.name, formData.email, formData.password)
  if (result.success) {
    navigate("/dashboard")
  } else {
    setError(result.error || "Registration failed")
  }
}
```

---

## 🎯 Testing Checklist

### Authentication
- [ ] Sign up with new account
- [ ] Verify email (check Supabase email logs)
- [ ] Login with credentials
- [ ] Logout
- [ ] Session persists on refresh

### Products
- [ ] View products list
- [ ] Add new product (with image)
- [ ] Edit existing product
- [ ] Upload/change product image
- [ ] Delete product
- [ ] Status auto-updates based on stock

### Storage
- [ ] Images upload successfully
- [ ] Images display in cards
- [ ] Images are publicly accessible
- [ ] Old images deleted when updated

---

## 🐛 Troubleshooting

### "Failed to fetch"
- Check `.env` file exists and has correct values
- Restart dev server after adding `.env`
- Verify Supabase URL and keys are correct

### "Row Level Security policy violation"
- Check RLS policies are created
- Verify user is authenticated
- Check seller_id matches auth.uid()

### Images not uploading
- Check storage bucket is public
- Verify storage policies exist
- Check file size < 50MB
- Ensure correct MIME type

### User not persisting
- Check `auth.getSession()` in AuthContext
- Verify `onAuthStateChange` listener
- Check browser local storage for auth tokens

---

**Next:** Run the full integration test and start building features!

Date: October 13, 2025
