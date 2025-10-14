# 🎯 Quick Test Guide

## How to Test the Fixes

### 🌓 Testing Theme Toggle

1. **Open the app** at http://localhost:5174/
2. **Login** with any credentials
3. **Look for the theme toggle** in the top-right corner of the navbar (sun/moon icon)
4. **Click it** - the entire page should switch between light and dark modes
5. **Refresh the browser** - theme should stay the same (persisted)
6. **Check the effects:**
   - Background changes from white to dark (or vice versa)
   - Text color inverts
   - Cards update their colors
   - All components respect the theme

**Expected Behavior:**
- ✅ Instant theme switch on click
- ✅ Smooth transition animations
- ✅ Theme persists after refresh
- ✅ All UI elements update colors

---

### ✏️ Testing Product Editing

#### Test 1: Add New Product
1. Go to **Products** page from sidebar
2. Click **"+ Add Product"** button
3. Fill in:
   - Name: "Test Product"
   - Price: 99.99
   - Stock: 50
4. Click **"Add Product"**
5. ✅ New product appears in table
6. ✅ Status shows "In Stock" (green badge)

#### Test 2: Edit Existing Product
1. Find any product in the table
2. Click the **pencil icon** (edit button)
3. ✅ Dialog opens with **"Edit Product"** title
4. ✅ Form is **pre-filled** with product data
5. Change the name to "Updated Product Name"
6. Change stock to 5
7. Click **"Update Product"**
8. ✅ Product name updates in table
9. ✅ Status changes to "Low Stock" (yellow badge)

#### Test 3: Edit Another Product
1. Find "USB-C Cable" (stock: 0)
2. Click **pencil icon**
3. Change stock to 100
4. Click **"Update Product"**
5. ✅ Status changes from "Out of Stock" (red) to "In Stock" (green)

#### Test 4: Cancel Edit
1. Click edit on any product
2. Make some changes
3. Click **"Cancel"** button
4. ✅ Dialog closes
5. ✅ No changes saved
6. Click **"+ Add Product"** again
7. ✅ Form is empty (not showing previous data)

#### Test 5: Delete Product
1. Click **trash icon** on any product
2. ✅ Product is removed from table
3. ✅ No dialog confirmation (instant delete)

---

## Status Badge Colors

The product status automatically updates based on stock:

| Stock Level | Status | Badge Color |
|------------|--------|-------------|
| > 20 | In Stock | 🟢 Green (default) |
| 1-20 | Low Stock | 🟡 Yellow (secondary) |
| 0 | Out of Stock | 🔴 Red (destructive) |

**Test this:**
1. Edit a product with stock > 20
2. Change stock to 10
3. ✅ Badge changes from green to yellow
4. Change stock to 0
5. ✅ Badge changes from yellow to red
6. Change stock to 50
7. ✅ Badge changes back to green

---

## Visual Indicators

### Theme Toggle States
```
Light Mode: ☀️ Sun icon visible
Dark Mode:  🌙 Moon icon visible
```

### Product Dialog States
```
Adding:  Dialog Title: "Add New Product"
         Button Text:  "Add Product"
         Form:         Empty

Editing: Dialog Title: "Edit Product"
         Button Text:  "Update Product"
         Form:         Pre-filled with product data
```

---

## Keyboard Shortcuts

- **Esc** - Close dialog
- **Enter** - Submit form (when in input field)
- **Tab** - Navigate between form fields

---

## Common Issues to Check

### If theme toggle doesn't work:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Check if `<html>` element has `dark` class in DevTools

### If product edit doesn't work:
1. Check browser console for errors
2. Verify you're clicking the pencil icon (not trash)
3. Make sure you're clicking "Update Product" not "Cancel"
4. Check that form fields are filled correctly

---

## Developer Console Checks

Open DevTools (F12) and check:

### For Theme:
```javascript
// Check current theme
localStorage.getItem('theme')  // Should return "light" or "dark"

// Check HTML class
document.documentElement.classList.contains('dark')  // true in dark mode
```

### For Products:
- No errors should appear in console
- React DevTools should show state updates

---

## Mobile Testing

1. Resize browser to mobile width (< 768px)
2. Theme toggle should still work
3. Product editing should open dialog properly
4. Forms should be scrollable on small screens

---

**All tests passing?** 🎉 You're good to go!

**Found an issue?** Check BUGFIXES.md for troubleshooting steps.
