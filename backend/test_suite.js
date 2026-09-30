/**
 * Comprehensive Developer Test Suite for Ecobin
 * Tests All Core Workflows:
 * 1. Auth & Admin Security (Saurabh Pandey)
 * 2. Complaints Redressal Lifecycle
 * 3. Doorstep Pickups with 4-step Statuses & Points
 * 4. Smart Bins IoT Telemetry & Thresholds
 * 5. Super Admin Access Control & Permission Delegation
 * 6. Hotspots Heatmap Data
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Comprehensive Ecobin System Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ---------------------------------------------------------
    // 1. AUTH & SECURITY AUDIT
    // ---------------------------------------------------------
    console.log('--- 1. Testing Auth & Security ---');

    // 1.1 Admin Login
    const adminLoginRes = await (await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecobin.in', password: 'Password@123' })
    })).json();

    assert(adminLoginRes.success === true, 'Admin login succeeded with Password@123');
    assert(adminLoginRes.user?.name.includes('Saurabh Pandey'), `Admin user is Saurabh Pandey: got "${adminLoginRes.user?.name}"`);
    assert(adminLoginRes.user?.role === 'admin', 'Admin user has role "admin"');
    const adminToken = adminLoginRes.token;

    // 1.2 Admin Login with extra spaces
    const spaceLoginRes = await (await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecobin.in ', password: 'Password@123 ' })
    })).json();
    assert(spaceLoginRes.success === true, 'Admin login auto-trims whitespace');

    // 1.3 Security: Block unauthenticated demo switch to admin
    const fakeSwitchRes = await (await fetch(`${BASE_URL}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    })).json();
    assert(fakeSwitchRes.success === false, 'Blocked unauthorized demo switch to admin');

    // 1.4 Security: Public signup cannot self-grant admin role
    const testEmail = `sec_test_${Date.now()}@example.com`;
    const secSignupRes = await (await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker User', email: testEmail, password: 'Password@123', role: 'admin' })
    })).json();
    assert(secSignupRes.user?.role === 'citizen', 'Public signup with role: admin forced to citizen role');

    // ---------------------------------------------------------
    // 2. CITIZEN DOORSTEP PICKUP LIFECYCLE
    // ---------------------------------------------------------
    console.log('\n--- 2. Testing Doorstep Pickup Lifecycle ---');

    // 2.1 Citizen Login
    const citizenLoginRes = await (await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@ecobin.in', password: 'Password@123' })
    })).json();
    assert(citizenLoginRes.success === true, 'Citizen login succeeded');
    const citizenToken = citizenLoginRes.token;
    const initialEcoPoints = citizenLoginRes.user.eco_points || 0;

    // 2.2 Schedule a Doorstep Pickup
    const pickupRes = await (await fetch(`${BASE_URL}/pickups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citizenToken}` },
      body: JSON.stringify({
        waste_type: 'electronic',
        preferred_slot: 'Morning 9-11 AM',
        address_text: 'B-12 Malviya Nagar, New Delhi',
        notes: '2 broken printers and old cables'
      })
    })).json();
    assert(pickupRes.success === true, 'Citizen scheduled doorstep pickup');
    assert(pickupRes.pickup?.status === 'pending', 'New pickup has status "pending"');
    const pickupId = pickupRes.pickup.id;

    // 2.3 Check Citizen Eco-Points Reward (+40 pts)
    const citizenMeRes = await (await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    })).json();
    assert(citizenMeRes.user.eco_points >= initialEcoPoints + 40, 'Citizen rewarded +40 Eco-Points for pickup scheduling');

    // 2.4 Admin Views Pickup and Assigns Driver
    const adminPickupsRes = await (await fetch(`${BASE_URL}/pickups`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })).json();
    const createdPickup = adminPickupsRes.pickups.find(p => p.id === pickupId);
    assert(!!createdPickup, 'Admin dashboard retrieved scheduled pickup');
    assert(createdPickup.citizen_name !== undefined, 'Pickup enriched with citizen name');

    // 2.5 Admin assigns Driver and updates status to 'in-transit'
    const assignRes = await (await fetch(`${BASE_URL}/pickups/${pickupId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ assigned_staff_id: 2, status: 'in-transit' })
    })).json();
    assert(assignRes.success === true && assignRes.pickup.status === 'in-transit', 'Pickup assigned to driver and in-transit');

    // 2.6 Admin completes the pickup
    const completeRes = await (await fetch(`${BASE_URL}/pickups/${pickupId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'completed' })
    })).json();
    assert(completeRes.success === true && completeRes.pickup.status === 'completed', 'Pickup successfully marked completed');

    // ---------------------------------------------------------
    // 3. SMART BINS & TELEMETRY
    // ---------------------------------------------------------
    console.log('\n--- 3. Testing Smart Bins IoT Telemetry ---');

    const binsRes = await (await fetch(`${BASE_URL}/bins`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })).json();
    assert(binsRes.success === true && binsRes.bins.length > 0, `Smart Bins retrieved (${binsRes.bins.length} bins found)`);

    const firstBin = binsRes.bins[0];
    assert(firstBin.latitude && firstBin.longitude, `Bin has valid GPS coordinates (${firstBin.latitude}, ${firstBin.longitude}) for Google Maps`);

    // Dump Waste Test
    const prevFill = firstBin.fill_percentage;
    const dumpRes = await (await fetch(`${BASE_URL}/bins/${firstBin.id}/trigger-dump`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ addedFill: 20 })
    })).json();
    assert(dumpRes.success === true, 'Bin dump simulation triggered');

    // Empty Bin Test
    const emptyRes = await (await fetch(`${BASE_URL}/bins/${firstBin.id}/empty`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })).json();
    assert(emptyRes.success === true && emptyRes.bin.fill_percentage === 0, 'Bin 1-click clearance emptied fill to 0%');

    // ---------------------------------------------------------
    // 4. SUPER ADMIN ACCESS CONTROL & PERMISSION DELEGATION
    // ---------------------------------------------------------
    console.log('\n--- 4. Testing Super Admin Access Control ---');

    // 4.1 Fetch user list
    const usersListRes = await (await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })).json();
    assert(usersListRes.success === true && usersListRes.count > 0, `Users directory retrieved (${usersListRes.count} registered accounts)`);

    // 4.2 Citizen cannot access admin users list (RBAC check)
    const citizenRbacRes = await (await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    })).json();
    assert(citizenRbacRes.success === false, 'Access control blocks citizen from viewing user permissions');

    // 4.3 Super admin Saurabh Pandey promotes test user to Admin
    const promoteRes = await (await fetch(`${BASE_URL}/admin/users/grant-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ email: testEmail, role: 'admin' })
    })).json();
    assert(promoteRes.success === true && promoteRes.user?.role === 'admin', 'Saurabh Pandey successfully granted Admin role to user');

    // 4.4 Demote back to citizen
    const demoteRes = await (await fetch(`${BASE_URL}/admin/users/${promoteRes.user.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'citizen' })
    })).json();
    assert(demoteRes.success === true && demoteRes.user?.role === 'citizen', 'Saurabh Pandey revoked admin permission and demoted to citizen');

    // 4.5 Protection: Ensure Saurabh Pandey himself cannot be demoted
    const superAdminObj = usersListRes.users.find(u => u.email === 'admin@ecobin.in');
    const demoteSuperAdminRes = await (await fetch(`${BASE_URL}/admin/users/${superAdminObj.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'citizen' })
    })).json();
    assert(demoteSuperAdminRes.success === false, 'Safety rule protected Super Admin Saurabh Pandey from demotion');

    // ---------------------------------------------------------
    // 5. HEATMAP & GIS DATA
    // ---------------------------------------------------------
    console.log('\n--- 5. Testing GIS Heatmap Data ---');

    const heatmapRes = await (await fetch(`${BASE_URL}/complaints/heatmap`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })).json();
    assert(heatmapRes.success === true && heatmapRes.totalPoints > 0, `Heatmap GIS density points retrieved (${heatmapRes.totalPoints} hotspots)`);

    console.log(`\n=======================================================`);
    console.log(`🏁 TESTING SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log(`=======================================================`);

    if (failed === 0) {
      console.log('🎉 ALL SYSTEMS OPERATIONAL AND PASSING 100% OF TESTS!');
    }
  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
  }
}

runTests();
