#!/usr/bin/env node

/**
 * Test script to verify admin authentication
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://localhost:8090';
const pb = new PocketBase(POCKETBASE_URL);

const [,, adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
    console.error('Usage: node test-admin.js <admin-email> <admin-password>');
    process.exit(1);
}

async function testAdmin() {
    try {
        console.log('🔍 Testing PocketBase connection...');
        
        // Test basic connection
        const health = await fetch(`${POCKETBASE_URL}/api/collections/users`);
        const healthData = await health.json();
        console.log('✅ PocketBase health:', healthData.message);
        
        console.log('\n🔐 Testing admin authentication...');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${'#'.repeat(adminPassword.length)}`);
        
        // Try to authenticate
        const authData = await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('✅ Admin authentication successful!');
        console.log('Admin ID:', authData.admin.id);
        console.log('Admin Email:', authData.admin.email);
        
        // Test listing collections
        console.log('\n📦 Testing collections access...');
        const collections = await pb.collections.getFullList();
        console.log(`Found ${collections.length} existing collections:`);
        collections.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Status:', error.status);
        console.error('Data:', error.data);
        
        if (error.status === 400) {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if admin account exists by visiting http://localhost:8090/_/');
            console.log('2. Verify the email and password are correct');
            console.log('3. Create admin account if it doesn\'t exist');
        }
        
        process.exit(1);
    }
}

testAdmin();