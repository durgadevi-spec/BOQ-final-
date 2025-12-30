-- Test CRUD operations
-- 1. CREATE: Insert test shop
INSERT INTO shops (id, name, location, city, state, country, pincode, rating, categories, gstno, approved, created_at) 
VALUES ('a1111111-1111-1111-1111-111111111111', 'TestShop_CRUD', 'TestLoc', 'TestCity', 'TS', 'TestCountry', '99999', 3.5, '["Civil"]'::jsonb, 'TESTGST123', false, now());

-- Check it was created
SELECT 'STEP 1: Test shop created' as step;
SELECT id, name, approved FROM shops WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- 2. CHECK COUNTS
SELECT 'STEP 2: Counts before approval' as step;
SELECT count(*) as total_shops, sum(case when approved then 1 else 0 end) as approved_count, sum(case when not approved then 1 else 0 end) as pending_count FROM shops;

-- 3. APPROVE: Update approved=true
UPDATE shops SET approved = true WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- Check it after approval
SELECT 'STEP 3: Test shop approved' as step;
SELECT id, name, approved FROM shops WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- 4. CHECK COUNTS AFTER APPROVAL
SELECT 'STEP 4: Counts after approval' as step;
SELECT count(*) as total_shops, sum(case when approved then 1 else 0 end) as approved_count, sum(case when not approved then 1 else 0 end) as pending_count FROM shops;

-- 5. DELETE: Remove the shop
DELETE FROM shops WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- Check if it's gone
SELECT 'STEP 5: Test shop deleted' as step;
SELECT count(*) as found FROM shops WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- 6. FINAL COUNTS
SELECT 'STEP 6: Final counts (should be back to original)' as step;
SELECT count(*) as total_shops, sum(case when approved then 1 else 0 end) as approved_count, sum(case when not approved then 1 else 0 end) as pending_count FROM shops;
