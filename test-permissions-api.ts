/**
 * Test script for Permissions API
 * Run this after starting the dev server and logging in as superadmin
 */

const BASE_URL = 'http://localhost:3000';

async function testPermissionsAPI() {
    console.log('🧪 Testing Permissions API...\n');

    try {
        // Test 1: GET all permissions
        console.log('1️⃣ Testing GET /api/permissions');
        const getResponse = await fetch(`${BASE_URL}/api/permissions`, {
            credentials: 'include',
        });
        const permissions = await getResponse.json();
        console.log(`✅ Status: ${getResponse.status}`);
        console.log(`✅ Found ${permissions.length} permissions`);
        console.log('Permissions:', permissions.map((p: any) => p.name).join(', '));
        console.log('');

        // Test 2: POST create new permission
        console.log('2️⃣ Testing POST /api/permissions');
        const createResponse = await fetch(`${BASE_URL}/api/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: 'test:permissions',
                description: 'Test permission for API testing'
            }),
        });
        const newPermission = await createResponse.json();
        console.log(`✅ Status: ${createResponse.status}`);
        console.log('Created permission:', newPermission);
        console.log('');

        // Test 3: PUT update permission
        console.log('3️⃣ Testing PUT /api/permissions/[id]');
        const updateResponse = await fetch(`${BASE_URL}/api/permissions/${newPermission._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: 'test:permissions',
                description: 'Updated description'
            }),
        });
        const updatedPermission = await updateResponse.json();
        console.log(`✅ Status: ${updateResponse.status}`);
        console.log('Updated permission:', updatedPermission);
        console.log('');

        // Test 4: DELETE permission
        console.log('4️⃣ Testing DELETE /api/permissions/[id]');
        const deleteResponse = await fetch(`${BASE_URL}/api/permissions/${newPermission._id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const deleteResult = await deleteResponse.json();
        console.log(`✅ Status: ${deleteResponse.status}`);
        console.log('Delete result:', deleteResult);
        console.log('');

        // Test 5: Try to delete a protected permission (should fail)
        console.log('5️⃣ Testing DELETE protected permission (should fail)');
        const protectedPerm = permissions.find((p: any) => p.name === 'create:users');
        if (protectedPerm) {
            const protectedDeleteResponse = await fetch(`${BASE_URL}/api/permissions/${protectedPerm._id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const protectedDeleteResult = await protectedDeleteResponse.json();
            console.log(`✅ Status: ${protectedDeleteResponse.status} (should be 403)`);
            console.log('Result:', protectedDeleteResult);
        }

        console.log('\n✅ All tests completed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests
testPermissionsAPI();
