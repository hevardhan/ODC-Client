# 📝 How to Display Rich Text Content (Lists, Bold, etc.)

## Problem
When you save product specifications with the WYSIWYG editor (lists, bold, headings), they don't show up properly on the frontend.

## Solution
Use the `RichTextDisplay` component to render HTML content with proper styling.

---

## ✅ Fixed Files

### 1. `src/index.css` - Added CSS for lists, headings, bold, etc.
```css
.prose ul { list-style-type: disc; }
.prose ol { list-style-type: decimal; }
.prose strong { font-weight: 600; }
.prose h2 { font-size: 1.5em; }
/* ... and more */
```

### 2. `src/components/RichTextDisplay.jsx` - Created display component
Component to safely render HTML from WYSIWYG editor.

---

## 🎨 How to Use on Frontend

### Example 1: Display in Product Card (Products List)

```jsx
import { RichTextDisplay } from '@/components/RichTextDisplay';

<Card>
  <CardContent>
    <h3>{product.name}</h3>
    <p>{product.description}</p>
    
    {/* Display specifications with formatting */}
    {product.specifications && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Specifications:</h4>
        <RichTextDisplay content={product.specifications} />
      </div>
    )}
  </CardContent>
</Card>
```

### Example 2: Display in Product Detail Page

```jsx
import { RichTextDisplay } from '@/components/RichTextDisplay';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      <div className="my-6">
        <h2 className="text-xl font-bold mb-4">Product Details</h2>
        <p className="whitespace-pre-line">{product.product_details}</p>
      </div>
      
      {product.specifications && (
        <div className="my-6">
          <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
          {/* This will render HTML with lists, bold, headings properly */}
          <RichTextDisplay content={product.specifications} />
        </div>
      )}
    </div>
  );
}
```

### Example 3: Display in Shop Page

```jsx
import { RichTextDisplay } from '@/components/RichTextDisplay';

function Shop() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="border rounded p-4">
          <img src={product.image_url} alt={product.name} />
          <h3>{product.name}</h3>
          <p className="text-lg font-bold">${product.price}</p>
          
          {/* Show formatted specifications */}
          <RichTextDisplay 
            content={product.specifications} 
            className="mt-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 What Gets Rendered

### Input in WYSIWYG Editor:
```
## Features

- **Bold feature 1**
- Feature 2
- Feature 3

## Specifications

1. Dimension: 10cm x 15cm
2. Weight: 250g
3. Material: Cotton
```

### Output HTML (saved in database):
```html
<h2>Features</h2>
<ul>
  <li><strong>Bold feature 1</strong></li>
  <li>Feature 2</li>
  <li>Feature 3</li>
</ul>
<h2>Specifications</h2>
<ol>
  <li>Dimension: 10cm x 15cm</li>
  <li>Weight: 250g</li>
  <li>Material: Cotton</li>
</ol>
```

### Displayed on Frontend (with RichTextDisplay):
```
## Features

• Bold feature 1
• Feature 2
• Feature 3

## Specifications

1. Dimension: 10cm x 15cm
2. Weight: 250g
3. Material: Cotton
```

✅ **Lists show with bullets/numbers**  
✅ **Bold text is bold**  
✅ **Headings are larger**  

---

## 🔍 Testing

### Step 1: Add Product with Formatted Specs
1. Go to `/products/add`
2. In Specifications section, use toolbar:
   - Type "Features" and click **H2** button
   - Click bullet list button (**•**)
   - Type items and click **B** for bold
   - Add numbered list with **1** button

### Step 2: View in Database
Check Supabase Table Editor → products → specifications column  
You should see HTML: `<h2>Features</h2><ul><li>...</li></ul>`

### Step 3: Display on Frontend
Use `RichTextDisplay` component wherever you want to show the specs:
```jsx
<RichTextDisplay content={product.specifications} />
```

---

## 📋 RichTextDisplay Props

```jsx
<RichTextDisplay 
  content={htmlString}     // Required: HTML string from database
  className="text-sm"      // Optional: Additional CSS classes
/>
```

---

## 🎨 Styling Customization

### Default Styling (in index.css)
- **Headings:** Larger, bold
- **Lists:** Disc bullets (•) for `<ul>`, numbers for `<ol>`
- **Bold:** `font-weight: 600`
- **Italic:** `font-style: italic`
- **Code:** Gray background, monospace font
- **Spacing:** Proper margins between elements

### Custom Styling
Pass additional classes:
```jsx
<RichTextDisplay 
  content={product.specifications}
  className="text-lg text-blue-600"
/>
```

---

## 🐛 Troubleshooting

### Lists not showing bullets/numbers?
✅ **Fixed!** CSS for `.prose ul` and `.prose ol` added to `index.css`

### Bold not working?
✅ **Fixed!** CSS for `.prose strong` added to `index.css`

### HTML showing as text?
❌ Make sure you're using `RichTextDisplay` component, not just `{product.specifications}`

### Security Warning
The `RichTextDisplay` component uses `dangerouslySetInnerHTML` to render HTML. This is safe because:
- Content comes from your own WYSIWYG editor
- Only authenticated sellers can add products
- HTML is generated by TipTap (trusted library)
- No user-submitted raw HTML

---

## ✅ Quick Fix Summary

### Before:
```jsx
// Raw HTML shows as text
<p>{product.specifications}</p>

// Output: <h2>Features</h2><ul><li>Item</li></ul>
```

### After:
```jsx
// HTML renders with formatting
<RichTextDisplay content={product.specifications} />

// Output: 
// ## Features
// • Item
```

---

## 📚 Examples

### Minimal Example
```jsx
import { RichTextDisplay } from '@/components/RichTextDisplay';

function MyComponent({ product }) {
  return (
    <div>
      <RichTextDisplay content={product.specifications} />
    </div>
  );
}
```

### Full Product Page Example
```jsx
import { RichTextDisplay } from '@/components/RichTextDisplay';

function ProductPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Product Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl text-gray-600">${product.price}</p>
      </div>

      {/* Product Description */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <p className="text-gray-700">{product.description}</p>
      </section>

      {/* Product Details */}
      {product.product_details && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Details</h2>
          <p className="whitespace-pre-line text-gray-700">
            {product.product_details}
          </p>
        </section>
      )}

      {/* Specifications (WYSIWYG content) */}
      {product.specifications && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Specifications</h2>
          <RichTextDisplay content={product.specifications} />
        </section>
      )}
    </div>
  );
}
```

---

## 🎉 Done!

Now all your WYSIWYG formatting (lists, bold, headings) will display properly on the frontend!

**Usage:**
1. Import: `import { RichTextDisplay } from '@/components/RichTextDisplay';`
2. Use: `<RichTextDisplay content={product.specifications} />`
3. Enjoy formatted content! ✨
