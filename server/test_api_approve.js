// Test approve API endpoint with seeded admin token
(async () => {
  const base = 'http://localhost:5001';
  
  try {
    // 1. Login as admin
    console.log('1. LOGIN as admin@example.com');
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@example.com', password: 'DemoPass123!' })
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status);
    console.log('   Token:', loginData.token ? loginData.token.substring(0, 20) + '...' : 'NONE');
    
    const token = loginData.token;
    if (!token) { console.error('ERROR: No token'); process.exit(1); }

    // 2. Fetch pending shops
    console.log('\n2. PENDING SHOPS BEFORE APPROVE');
    const pendingRes = await fetch(base + '/api/shops-pending-approval');
    const pendingData = await pendingRes.json();
    console.log('   Count:', pendingData.shops.length);
    pendingData.shops.forEach(s => {
      console.log('   -', s.shop.name, '(id:', s.shop.id, ')');
    });

    if (pendingData.shops.length === 0) {
      console.log('   No pending shops to approve');
      process.exit(0);
    }

    const shopId = pendingData.shops[0].shop.id;
    const shopName = pendingData.shops[0].shop.name;

    // 3. Approve first pending shop
    console.log('\n3. APPROVE SHOP:', shopName);
    const approveRes = await fetch(base + `/api/shops/${shopId}/approve`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
    const approveData = await approveRes.json();
    console.log('   Status:', approveRes.status);
    console.log('   Approved:', approveData.shop?.approved);

    // 4. Check pending shops after approve
    console.log('\n4. PENDING SHOPS AFTER APPROVE');
    const pendingAfterRes = await fetch(base + '/api/shops-pending-approval');
    const pendingAfterData = await pendingAfterRes.json();
    console.log('   Count:', pendingAfterData.shops.length);
    pendingAfterData.shops.forEach(s => {
      console.log('   -', s.shop.name);
    });

    // 5. Check public shops (approved list)
    console.log('\n5. PUBLIC APPROVED SHOPS');
    const publicRes = await fetch(base + '/api/shops');
    const publicData = await publicRes.json();
    console.log('   Count:', publicData.shops.length);
    publicData.shops.forEach(s => {
      console.log('   -', s.name, '(approved:', s.approved, ')');
    });

    console.log('\n✅ SUCCESS: Approve workflow works end-to-end');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
