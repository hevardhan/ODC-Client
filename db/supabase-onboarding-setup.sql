-- ==========================================
-- UPDATE SELLERS TABLE FOR ONBOARDING
-- ==========================================
-- Run this in Supabase SQL Editor

-- Add new columns to sellers table for onboarding
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS about_seller TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_sellers_onboarding ON sellers(onboarding_completed);

-- Enable email confirmation in Supabase (Manual Step)
-- Go to: Authentication → Settings → Enable "Confirm email"
-- This will require users to verify their email before accessing the app

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sellers'
ORDER BY ordinal_position;

-- Check existing sellers onboarding status
SELECT id, email, full_name, shop_name, onboarding_completed
FROM sellers
LIMIT 10;
