# 📚 Seller Portal - Feature Guide

## 🎯 Quick Start

1. Open the app at `http://localhost:5174/`
2. You'll be redirected to the login page
3. Enter any email and password (mock auth)
4. You'll be redirected to the dashboard

## 🔐 Authentication Pages

### Login Page (`/login`)
- Email and password fields
- "Forgot password?" link
- Link to signup page
- Smooth animations on load

### Signup Page (`/signup`)
- Full name, email, password, confirm password
- Form validation
- Link to login page
- Auto-login after successful registration

## 📊 Dashboard (`/dashboard`)

### Stats Cards
- **Total Products**: Shows 245 products with +12% growth
- **Total Orders**: 1,234 orders with +23% growth
- **Earnings**: $45,231 with +18% growth
- **Pending Orders**: 23 orders with -5% change

### Sales Chart
- Line chart showing 6 months of sales data
- Interactive tooltips on hover
- Responsive design

### Recent Orders Table
- Last 5 orders displayed
- Columns: Order ID, Customer, Status
- Color-coded status badges

## 📦 Products Page (`/products`)

### Features
- Product table with columns: Image, Name, Price, Stock, Status, Actions
- Status badges:
  - **Green (In Stock)**: Stock > 20
  - **Yellow (Low Stock)**: Stock 1-20
  - **Red (Out of Stock)**: Stock = 0

### Add Product Dialog
1. Click "+ Add Product" button
2. Fill in the form:
   - Product Name (required)
   - Description
   - Price (required, numeric)
   - Stock (required, number)
   - Upload Image (file input)
3. Click "Add Product" or "Cancel"

### Actions
- **Edit Button**: Edit product (UI placeholder)
- **Delete Button**: Remove product from list

## 🛒 Orders Page (`/orders`)

### Features
- Complete orders table
- Columns: Order ID, Customer Name, Product, Amount, Status, Date
- 10 sample orders displayed

### Status Badges
- **Delivered**: Green badge
- **Pending**: Yellow badge
- **Cancelled**: Red badge

## 💰 Earnings Page (`/earnings`)

### Summary Cards
- **Total Earnings**: $75,231 (all-time)
- **This Month**: $9,100 (current month)
- **Average Monthly**: $6,269 (monthly average)

### Earnings Chart
- Area chart with gradient fill
- 12 months of earnings data
- Interactive tooltips showing exact values
- Smooth animations

### Earnings Breakdown
- Product Sales: $68,450
- Shipping Fees: $4,231
- Other Income: $2,550

## ⚙️ Settings Page (`/settings`)

### Profile Information
- Edit full name
- Edit email
- Edit shop name
- Save changes button
- Success/error messages

### Change Password
- Current password field
- New password field
- Confirm new password field
- Validation:
  - All fields required
  - Passwords must match
  - Minimum 6 characters
- Success/error messages

### Shop Settings
- Shop Status management
- Notifications configuration
- Payment Methods setup
- Each with "Manage"/"Configure"/"Setup" buttons

## 🎨 Theme Toggle

### How to Use
1. Look for the sun/moon icon in the top-right navbar
2. Click to toggle between light and dark modes
3. Theme preference is saved in localStorage
4. Smooth transition animations

### Theme Colors
- **Light Mode**: White background, black text, neutral grays
- **Dark Mode**: Dark background, light text, adjusted grays

## 🧭 Navigation

### Desktop Navigation
- Fixed sidebar on the left
- Links: Dashboard, Products, Orders, Earnings, Settings
- Active link highlighted with background color

### Mobile Navigation
- Hamburger menu button in navbar (< 768px)
- Drawer slides in from left
- Close button or backdrop click to close
- Same navigation links as desktop

## 👤 User Profile Menu

### Access
- Click on the avatar in the top-right of the navbar

### Menu Options
- **Profile**: Navigate to settings
- **Settings**: Navigate to settings
- **Logout**: Clear session and return to login

### Avatar
- Shows user initials (e.g., "JS" for John Seller)
- Fallback to "U" if name not available

## 🎭 Animations

### Page Transitions
- Fade in with upward motion
- Stagger animations for cards
- Smooth enter/exit transitions

### Interactive Elements
- Hover effects on buttons and links
- Scale animations on cards
- Smooth color transitions

## 🔒 Security

### Protected Routes
- All pages except `/login` and `/signup` are protected
- Automatic redirect to `/login` if not authenticated
- Session persisted in localStorage
- Loading state while checking authentication

### Mock Authentication
- Any email/password combination works
- Real app would validate against backend API
- User data stored in localStorage
- Clear session on logout

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (md)
  - Collapsible sidebar
  - Stacked layouts
  - Touch-friendly buttons

- **Tablet**: 768px - 1024px
  - Sidebar drawer
  - Responsive tables
  - Adjusted spacing

- **Desktop**: > 1024px (lg)
  - Fixed sidebar
  - Multi-column layouts
  - Full feature set

## 🎨 UI Components Used

### shadcn/ui Components
- Button
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Input
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
- Avatar, AvatarFallback
- Badge
- DropdownMenu
- Sheet (Mobile drawer)
- Separator
- Tooltip

### Icons (Lucide React)
- LayoutDashboard, Package, ShoppingCart, DollarSign
- Settings, Menu, X, Sun, Moon
- Plus, Pencil, Trash2
- TrendingUp, Calendar

## 🚀 Performance Tips

1. **Code Splitting**: Routes are lazy-loaded
2. **Optimized Builds**: Vite provides fast builds
3. **CSS Variables**: Theming via CSS custom properties
4. **Local State**: Minimal re-renders with proper state management

## 🐛 Troubleshooting

### Issue: Page not loading
- Check if dev server is running (`npm run dev`)
- Check console for errors
- Clear browser cache and localStorage

### Issue: Theme not persisting
- Check if localStorage is enabled
- Clear localStorage and try again

### Issue: Login redirects to login
- Check if user data is in localStorage
- Try signing up again

### Issue: Styling issues
- Clear browser cache
- Check if Tailwind CSS is properly loaded
- Verify all CSS imports

## 📝 Data Structure

### User Object
```javascript
{
  id: '1',
  name: 'John Seller',
  email: 'john@example.com',
  shopName: 'My Shop'
}
```

### Product Object
```javascript
{
  id: 1,
  name: 'Product Name',
  price: '$99.99',
  stock: 50,
  status: 'In Stock',
  image: '🎧'
}
```

### Order Object
```javascript
{
  id: '#ORD-001',
  customer: 'Customer Name',
  product: 'Product Name',
  amount: '$99.99',
  status: 'Delivered',
  date: '2024-03-15'
}
```

---

Need help? Check the main README.md for more information!
