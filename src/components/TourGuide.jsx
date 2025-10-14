import { useEffect, useRef } from 'react';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import '@sjmc11/tourguidejs/src/scss/tour.scss';

export function useTourGuide(steps, options = {}) {
  const tourRef = useRef(null);

  useEffect(() => {
    // Initialize tour
    if (!tourRef.current && steps && steps.length > 0) {
      tourRef.current = new TourGuideClient({
        steps: steps,
        showStepDots: true,
        showStepProgress: true,
        exitOnClickOutside: false,
        exitOnEscape: true,
        ...options,
      });
    }

    return () => {
      // Cleanup tour on unmount
      if (tourRef.current) {
        tourRef.current.finishTour();
      }
    };
  }, [steps, options]);

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.start();
    }
  };

  const nextStep = () => {
    if (tourRef.current) {
      tourRef.current.next();
    }
  };

  const prevStep = () => {
    if (tourRef.current) {
      tourRef.current.back();
    }
  };

  const finishTour = () => {
    if (tourRef.current) {
      tourRef.current.finishTour();
    }
  };

  return { startTour, nextStep, prevStep, finishTour };
}

// Predefined tour steps for different pages
export const dashboardTourSteps = [
  {
    title: 'Welcome to Your Dashboard! 🎉',
    content: 'This is your command center where you can see an overview of your business performance.',
    target: '[data-tour="dashboard"]',
  },
  {
    title: 'Sales Statistics',
    content: 'Track your total sales, revenue, and pending orders at a glance.',
    target: '[data-tour="stats-cards"]',
  },
  {
    title: 'Recent Activity',
    content: 'Monitor your latest orders and track their status in real-time.',
    target: '[data-tour="recent-orders"]',
  },
  {
    title: 'Products Overview',
    content: 'Quick view of your product inventory and stock levels.',
    target: '[data-tour="products-overview"]',
  },
  {
    title: 'Navigation Menu',
    content: 'Use the sidebar to navigate between Products, Orders, and Earnings pages.',
    target: '[data-tour="sidebar"]',
  },
  {
    title: 'Profile Settings',
    content: 'Access your profile and account settings from here. You can also toggle dark mode!',
    target: '[data-tour="profile-menu"]',
  },
];

export const productsTourSteps = [
  {
    title: 'Products Page',
    content: 'Manage all your products in one place. Add, edit, delete, and track your inventory.',
    target: '[data-tour="products-page"]',
  },
  {
    title: 'Add New Product',
    content: 'Click here to add a new product. Remember, you need 3-5 images per product!',
    target: '[data-tour="add-product"]',
  },
  {
    title: 'Product Cards',
    content: 'Each card shows your product image, details, stock status, and quick actions.',
    target: '[data-tour="product-card"]',
  },
  {
    title: 'Edit & Delete',
    content: 'Use these buttons to edit product details or remove products from your store.',
    target: '[data-tour="product-actions"]',
  },
  {
    title: 'Stock Status',
    content: 'Products are automatically marked as "Out of Stock" when inventory reaches zero.',
    target: '[data-tour="stock-badge"]',
  },
];

export const addProductTourSteps = [
  {
    title: 'Add Product Form',
    content: 'Fill in all the details about your product. All fields marked with * are required.',
    target: '[data-tour="product-form"]',
  },
  {
    title: 'Category Selection',
    content: 'Choose the right category: Crafts, Spices, Foods, HandMade, or Others.',
    target: '[data-tour="category-select"]',
  },
  {
    title: 'Product Details',
    content: 'Add comprehensive details about your product features and materials.',
    target: '[data-tour="product-details"]',
  },
  {
    title: 'Specifications (WYSIWYG)',
    content: 'Use the rich text editor to add formatted specifications with headings, lists, and bold text.',
    target: '[data-tour="specifications"]',
  },
  {
    title: 'Multiple Images (3-5)',
    content: 'Upload 3-5 high-quality images. You can reorder them, set a primary image, and remove unwanted ones.',
    target: '[data-tour="product-images"]',
  },
];

export const ordersTourSteps = [
  {
    title: 'Orders Management',
    content: 'View and manage all your customer orders. Track their status and update them.',
    target: '[data-tour="orders-page"]',
  },
  {
    title: 'Order Filters',
    content: 'Filter orders by status: All, Pending, Processing, Shipped, or Delivered.',
    target: '[data-tour="order-filters"]',
  },
  {
    title: 'Order Details',
    content: 'Click on any order to view customer details, items, and delivery information.',
    target: '[data-tour="order-card"]',
  },
  {
    title: 'Update Status',
    content: 'Change order status as you process and ship items to customers.',
    target: '[data-tour="order-status"]',
  },
];

export const earningsTourSteps = [
  {
    title: 'Earnings Dashboard',
    content: 'Track your revenue, analyze performance, and monitor your financial growth.',
    target: '[data-tour="earnings-page"]',
  },
  {
    title: 'Revenue Chart',
    content: 'Visualize your earnings over time with interactive charts and graphs.',
    target: '[data-tour="revenue-chart"]',
  },
  {
    title: 'Breakdown by Product',
    content: 'See which products are generating the most revenue for your business.',
    target: '[data-tour="product-breakdown"]',
  },
  {
    title: 'Payout Information',
    content: 'View your available balance and payout history.',
    target: '[data-tour="payout-info"]',
  },
];
