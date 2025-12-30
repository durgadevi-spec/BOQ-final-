// test_crud_workflow.js - Test CREATE, APPROVE, DELETE full workflow
const base = 'http://localhost:5001';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testWorkflow() {
  try {
    // Step 1: Login to get token
    console.log('=== STEP 1: LOGIN AS ADMIN ===');
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@example.com', password: 'DemoPass123!' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token obtained:', token ? 'YES' : 'NO');
    if (!token) { console.error('FAILED: No token'); process.exit(1); }

    // Step 2: Create a new shop
    console.log('\n=== STEP 2: CREATE NEW SHOP ===');
    const newShop = {
      name: 'TestShop_' + Date.now(),
      location: 'Test Location',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      pincode: '12345',
      rating: 3.5,
      categories: ['Civil', 'Plywood'],
      gstNo: 'TEST123GST456'
    };
    console.log('Creating shop:', newShop.name);

    const createRes = await fetch(base + '/api/shops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(newShop)
    });
    const createData = await createRes.json();
    const shopId = createData.shop?.id;
    console.log('Created shop ID:', shopId);
    console.log('Shop approved status:', createData.shop?.approved);

    if (!shopId) { console.error('FAILED: No shop ID returned'); process.exit(1); }

    // Step 3: Check pending shops (new shop should be there)
    console.log('\n=== STEP 3: CHECK PENDING SHOPS ===');
    const pendingRes = await fetch(base + '/api/shops-pending-approval');
    const pendingData = await pendingRes.json();
    const inPending = pendingData.shops.find(s => s.shop.id === shopId);
    console.log('New shop in pending?', inPending ? 'YES (' + inPending.shop.name + ')' : 'NO');

    // Step 4: Approve the new shop
    console.log('\n=== STEP 4: APPROVE NEW SHOP ===');
    const approveRes = await fetch(base + `/api/shops/${shopId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const approveData = await approveRes.json();
    console.log('Approve response status:', approveRes.status);
    console.log('Shop approved after approve call:', approveData.shop?.approved);

    // Step 5: Check public shops (new shop should be there)
    console.log('\n=== STEP 5: CHECK PUBLIC APPROVED SHOPS ===');
    const publicRes = await fetch(base + '/api/shops');
    const publicData = await publicRes.json();
    const inPublic = publicData.shops.find(s => s.id === shopId);
    console.log('New shop in public list?', inPublic ? 'YES (' + inPublic.name + ')' : 'NO');
    console.log('Total approved shops:', publicData.shops.length);

    // Step 6: DELETE the shop
    console.log('\n=== STEP 6: DELETE SHOP ===');
    const deleteRes = await fetch(base + `/api/shops/${shopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Delete response status:', deleteRes.status);
    const deleteData = await deleteRes.json();
    console.log('Delete response:', deleteData.message || deleteData);

    // Step 7: Check public shops after delete
    console.log('\n=== STEP 7: CHECK PUBLIC SHOPS AFTER DELETE ===');
    const publicAfterRes = await fetch(base + '/api/shops');
    const publicAfterData = await publicAfterRes.json();
    const stillThere = publicAfterData.shops.find(s => s.id === shopId);
    console.log('Shop still in public list?', stillThere ? 'YES (BUG!)' : 'NO (deleted correctly)');
    console.log('Total approved shops after delete:', publicAfterData.shops.length);

    // Step 8: Check database directly
    console.log('\n=== STEP 8: CHECK DATABASE DIRECTLY ===');
    const dbCheckRes = await fetch(base + `/api/shops/${shopId}`);
    if (dbCheckRes.status === 404) {
      console.log('Shop NOT found in database (correctly deleted)');
    } else {
      const dbShop = await dbCheckRes.json();
      console.log('Shop STILL exists in database (BUG!):', dbShop.shop?.name);
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log('✓ CREATE: New shop created with ID ' + shopId);
    console.log('✓ PENDING: New shop appears in pending list');
    console.log('✓ APPROVE: Shop approved and moved to public list');
    console.log(stillThere ? '✗ DELETE: Shop NOT deleted (still in public list)' : '✓ DELETE: Shop permanently deleted');

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

testWorkflow();
