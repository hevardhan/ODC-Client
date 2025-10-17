-- ==========================================
-- TEST DATA SETUP FOR SELLER PORTAL
-- ==========================================
-- Run this after setting up your database tables
-- This will create sample orders and earnings data

-- ==========================================
-- SAMPLE ORDERS
-- ==========================================
-- Replace 'YOUR_USER_ID_HERE' with your actual auth.users ID
-- You can find it by running: SELECT auth.uid();

-- First, let's get your user ID (run this first to find your ID)
-- SELECT auth.uid() as my_user_id;

-- Then replace YOUR_USER_ID_HERE below with the UUID from above

-- Sample Order 1 - Delivered
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status, order_date)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM products WHERE seller_id = 'YOUR_USER_ID_HERE' LIMIT 1),
  'John Smith',
  'john.smith@example.com',
  129.99,
  2,
  'Delivered',
  NOW() - INTERVAL '5 days'
);

-- Sample Order 2 - Pending
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status, order_date)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM products WHERE seller_id = 'YOUR_USER_ID_HERE' LIMIT 1),
  'Sarah Johnson',
  'sarah.j@example.com',
  89.99,
  1,
  'Pending',
  NOW() - INTERVAL '2 days'
);

-- Sample Order 3 - Delivered
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status, order_date)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM products WHERE seller_id = 'YOUR_USER_ID_HERE' LIMIT 1),
  'Michael Brown',
  'michael.brown@example.com',
  199.99,
  1,
  'Delivered',
  NOW() - INTERVAL '10 days'
);

-- Sample Order 4 - Pending
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status, order_date)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM products WHERE seller_id = 'YOUR_USER_ID_HERE' LIMIT 1),
  'Emily Davis',
  'emily.d@example.com',
  45.50,
  3,
  'Pending',
  NOW() - INTERVAL '1 day'
);

-- Sample Order 5 - Cancelled
INSERT INTO orders (seller_id, product_id, customer_name, customer_email, amount, quantity, status, order_date)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM products WHERE seller_id = 'YOUR_USER_ID_HERE' LIMIT 1),
  'David Wilson',
  'david.w@example.com',
  75.00,
  1,
  'Cancelled',
  NOW() - INTERVAL '7 days'
);

-- ==========================================
-- SAMPLE EARNINGS
-- ==========================================
-- Current month earnings

INSERT INTO earnings (seller_id, order_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM orders WHERE seller_id = 'YOUR_USER_ID_HERE' AND status = 'Delivered' LIMIT 1),
  129.99,
  'Product Sale',
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
);

INSERT INTO earnings (seller_id, order_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  (SELECT id FROM orders WHERE seller_id = 'YOUR_USER_ID_HERE' AND status = 'Delivered' ORDER BY order_date DESC LIMIT 1 OFFSET 1),
  199.99,
  'Product Sale',
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
);

-- Last month earnings
INSERT INTO earnings (seller_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  450.00,
  'Product Sale',
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) = 1 THEN 12
    ELSE EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER - 1
  END,
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) = 1 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1
    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  END
);

-- Two months ago
INSERT INTO earnings (seller_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  380.00,
  'Product Sale',
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 2 THEN 12 - (2 - EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER)
    ELSE EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER - 2
  END,
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 2 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1
    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  END
);

-- Three months ago
INSERT INTO earnings (seller_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  520.00,
  'Product Sale',
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 3 THEN 12 - (3 - EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER)
    ELSE EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER - 3
  END,
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 3 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1
    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  END
);

-- Four months ago
INSERT INTO earnings (seller_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  390.00,
  'Product Sale',
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 4 THEN 12 - (4 - EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER)
    ELSE EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER - 4
  END,
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 4 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1
    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  END
);

-- Five months ago
INSERT INTO earnings (seller_id, amount, type, month, year)
VALUES (
  'YOUR_USER_ID_HERE',
  610.00,
  'Product Sale',
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 5 THEN 12 - (5 - EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER)
    ELSE EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER - 5
  END,
  CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 5 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 1
    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  END
);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check orders created
SELECT 
  customer_name,
  amount,
  status,
  order_date
FROM orders 
WHERE seller_id = 'YOUR_USER_ID_HERE'
ORDER BY order_date DESC;

-- Check earnings created
SELECT 
  amount,
  type,
  month,
  year
FROM earnings 
WHERE seller_id = 'YOUR_USER_ID_HERE'
ORDER BY year DESC, month DESC;

-- Get order statistics
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM orders 
WHERE seller_id = 'YOUR_USER_ID_HERE'
GROUP BY status;

-- Get monthly earnings summary
SELECT 
  month,
  year,
  SUM(amount) as total_earnings
FROM earnings 
WHERE seller_id = 'YOUR_USER_ID_HERE'
GROUP BY month, year
ORDER BY year DESC, month DESC;

-- ==========================================
-- CLEANUP (if needed)
-- ==========================================

-- Uncomment below to delete all test data
-- DELETE FROM earnings WHERE seller_id = 'YOUR_USER_ID_HERE';
-- DELETE FROM orders WHERE seller_id = 'YOUR_USER_ID_HERE';
