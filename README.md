# 🛍️ Seller Portal - E-Commerce Dashboard

A modern, feature-rich seller portal built with React, Vite, Tailwind CSS, and shadcn/ui. This application provides a complete dashboard interface for e-commerce sellers to manage their products, orders, and earnings.

## ✨ Features

### 🔐 Authentication
- **Login Page** - Secure authentication with email and password
- **Signup Page** - New seller registration with validation
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Session Management** - Persistent login using localStorage

### 🎨 Theme & Design
- **Dark/Light Mode** - Toggle between themes with smooth transitions
- **Black & White Color Scheme** - Clean, minimal design with neutral grays
- **Responsive Layout** - Mobile-friendly with collapsible sidebar
- **Smooth Animations** - Powered by Framer Motion

### 📊 Dashboard
- **Quick Stats Cards** - Total Products, Orders, Earnings, Pending Orders
- **Sales Chart** - Visual representation of sales performance
- **Recent Orders Table** - Quick overview of latest transactions
- **Status Badges** - Color-coded order statuses

### 📦 Products Management
- **Product Listing** - Table view with images, prices, stock levels
- **Add Product Dialog** - Modal form for adding new products
- **Stock Status Badges** - Visual indicators (In Stock, Low Stock, Out of Stock)
- **Edit/Delete Actions** - Manage product inventory

### 🛒 Orders Management
- **Orders Table** - Complete list of customer orders
- **Order Details** - ID, Customer, Product, Amount, Status, Date
- **Status Filtering** - Color-coded badges (Delivered, Pending, Cancelled)

### 💰 Earnings Dashboard
- **Summary Cards** - Total, Monthly, and Average earnings
- **Earnings Chart** - Interactive area chart showing trends
- **Earnings Breakdown** - Detailed revenue sources

### ⚙️ Account Settings
- **Profile Management** - Edit name, email, shop name
- **Password Change** - Secure password update functionality
- **Shop Settings** - Configure shop preferences and notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Left sidebar navigation
│   │   └── ThemeToggle.jsx     # Dark/light mode toggle
│   ├── ui/                      # shadcn/ui components
│   └── ProtectedRoute.jsx      # Route protection wrapper
├── context/
│   ├── AuthContext.jsx         # Authentication context
│   └── ThemeProvider.jsx       # Theme management
├── pages/
│   ├── Login.jsx               # Login page
│   ├── Signup.jsx              # Registration page
│   ├── Dashboard.jsx           # Main dashboard
│   ├── Products.jsx            # Products management
│   ├── Orders.jsx              # Orders list
│   ├── Earnings.jsx            # Earnings dashboard
│   └── Settings.jsx            # Account settings
├── App.jsx                     # Main app component with routing
├── main.jsx                    # Application entry point
└── index.css                   # Global styles
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router DOM v6** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Animation library
- **Recharts** - Charting library
- **Lucide React** - Icon library

## 📱 Responsive Design

- **Desktop** - Full sidebar and navbar layout
- **Tablet** - Collapsible sidebar with hamburger menu
- **Mobile** - Drawer-based navigation with touch-friendly UI

## 🔒 Demo Credentials

For testing purposes, any email and password combination will work:

```
Email: demo@seller.com
Password: password123
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Colors
Edit the CSS variables in `src/index.css` to customize the color scheme

### Components
All shadcn/ui components can be customized in `src/components/ui/`

## 🚧 Future Enhancements

- Real API integration
- Advanced filtering and search
- Export data functionality
- Real-time notifications
- Multi-language support
- Analytics dashboard
- Inventory alerts

---

Built with ❤️ using React + Vite + shadcn/ui
