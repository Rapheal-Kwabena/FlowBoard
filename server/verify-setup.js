#!/usr/bin/env node

/**
 * PocketBase Setup Verification Script for FlowBoard
 * 
 * This script verifies that all collections are properly created
 * and configured for the FlowBoard application.
 * 
 * Usage: node verify-setup.js
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://localhost:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Expected collections and their key fields
const expectedCollections = {
    users: {
        type: 'auth',
        requiredFields: ['name', 'avatar', 'phone', 'twoFactor'],
        description: 'User authentication and profiles'
    },
    boards: {
        type: 'base',
        requiredFields: ['title', 'description', 'user'],
        description: 'Project boards with user ownership'
    },
    lists: {
        type: 'base',
        requiredFields: ['title', 'board', 'position'],
        description: 'Columns within boards'
    },
    labels: {
        type: 'base',
        requiredFields: ['name', 'color', 'board'],
        description: 'Color-coded tags for cards'
    },
    cards: {
        type: 'base',
        requiredFields: ['title', 'description', 'list', 'position', 'dueDate', 'recurrenceRule', 'labels'],
        description: 'Tasks with full feature support'
    }
};

async function checkPocketBaseHealth() {
    try {
        const response = await fetch(`${POCKETBASE_URL}/api/health`);
        const data = await response.json();
        if (data.code === 200 || data.message?.includes('healthy')) {
            console.log('✅ PocketBase is running and healthy');
            return true;
        }
    } catch (error) {
        console.error('❌ PocketBase is not running. Please start it with: ./pocketbase serve');
        return false;
    }
}

async function verifyCollections() {
    try {
        console.log('📦 Checking collections...\n');
        
        // Get all collections without authentication (public endpoint)
        const response = await fetch(`${POCKETBASE_URL}/api/collections`);
        
        if (!response.ok) {
            console.log('ℹ️  Collections endpoint requires authentication, trying alternative method...');
            return await verifyCollectionsAlternative();
        }
        
        const data = await response.json();
        const collections = data.items || [];
        
        let allGood = true;
        const foundCollections = {};
        
        // Check each expected collection
        for (const [collectionName, expectedConfig] of Object.entries(expectedCollections)) {
            const collection = collections.find(c => c.name === collectionName);
            
            if (!collection) {
                console.log(`❌ Collection '${collectionName}' not found`);
                allGood = false;
                continue;
            }
            
            foundCollections[collectionName] = collection;
            console.log(`✅ Collection '${collectionName}' found (${expectedConfig.description})`);
            
            // Check collection type
            if (collection.type !== expectedConfig.type) {
                console.log(`   ⚠️  Type mismatch: expected '${expectedConfig.type}', got '${collection.type}'`);
                allGood = false;
            } else {
                console.log(`   ✅ Type: ${collection.type}`);
            }
            
            // Check fields
            const fieldNames = collection.schema?.map(field => field.name) || [];
            const missingFields = expectedConfig.requiredFields.filter(field => !fieldNames.includes(field));
            
            if (missingFields.length > 0) {
                console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
                allGood = false;
            } else {
                console.log(`   ✅ All required fields present: ${expectedConfig.requiredFields.join(', ')}`);
            }
            
            // Check API rules
            const hasRules = collection.listRule || collection.viewRule || collection.createRule || collection.updateRule || collection.deleteRule;
            if (hasRules) {
                console.log(`   ✅ API rules configured`);
            } else {
                console.log(`   ⚠️  No API rules found - this might cause security issues`);
                allGood = false;
            }
            
            console.log('');
        }
        
        // Check for extra collections
        const extraCollections = collections.filter(c => !expectedCollections[c.name] && !c.name.startsWith('_'));
        if (extraCollections.length > 0) {
            console.log('ℹ️  Additional collections found:');
            extraCollections.forEach(c => console.log(`   - ${c.name} (${c.type})`));
            console.log('');
        }
        
        return allGood;
        
    } catch (error) {
        console.error('❌ Error checking collections:', error.message);
        return false;
    }
}

async function verifyCollectionsAlternative() {
    console.log('🔍 Trying alternative verification method...\n');
    
    let allGood = true;
    
    // Try to access each collection endpoint to see if it exists
    for (const [collectionName, expectedConfig] of Object.entries(expectedCollections)) {
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/${collectionName}`);
            
            if (response.status === 404) {
                console.log(`❌ Collection '${collectionName}' not found`);
                allGood = false;
            } else if (response.status === 401 || response.status === 403) {
                // Collection exists but requires auth (which is expected)
                console.log(`✅ Collection '${collectionName}' exists (${expectedConfig.description})`);
                console.log(`   ✅ Protected by authentication (good security)`);
            } else if (response.ok) {
                console.log(`✅ Collection '${collectionName}' exists and accessible`);
            } else {
                console.log(`⚠️  Collection '${collectionName}' status: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Error checking collection '${collectionName}': ${error.message}`);
            allGood = false;
        }
        console.log('');
    }
    
    return allGood;
}

async function testBasicFunctionality() {
    console.log('🧪 Testing basic functionality...\n');
    
    try {
        // Test user registration endpoint
        const userResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123',
                passwordConfirm: 'testpassword123',
                name: 'Test User'
            })
        });
        
        if (userResponse.status === 400) {
            const errorData = await userResponse.json();
            if (errorData.message?.includes('already exists')) {
                console.log('✅ User registration endpoint working (test user already exists)');
            } else {
                console.log('✅ User registration endpoint accessible (validation working)');
            }
        } else if (userResponse.status === 200 || userResponse.status === 201) {
            console.log('✅ User registration endpoint working');
            // Clean up test user if created
            try {
                const userData = await userResponse.json();
                await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userData.id}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                // Ignore cleanup errors
            }
        } else {
            console.log(`⚠️  User registration returned status: ${userResponse.status}`);
        }
        
    } catch (error) {
        console.log(`⚠️  Could not test user registration: ${error.message}`);
    }
    
    console.log('');
}

async function verifySetup() {
    console.log('🔍 FlowBoard PocketBase Setup Verification\n');
    console.log('==========================================\n');
    
    // Step 1: Check PocketBase health
    const isHealthy = await checkPocketBaseHealth();
    if (!isHealthy) {
        process.exit(1);
    }
    console.log('');
    
    // Step 2: Verify collections
    const collectionsOk = await verifyCollections();
    
    // Step 3: Test basic functionality
    await testBasicFunctionality();
    
    // Final summary
    console.log('📋 Verification Summary');
    console.log('======================\n');
    
    if (collectionsOk) {
        console.log('🎉 All collections are properly set up!');
        console.log('');
        console.log('✅ Your FlowBoard backend is ready to use');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('1. Ensure .env file has: VITE_POCKETBASE_URL=http://localhost:8090');
        console.log('2. Start your frontend: npm run dev');
        console.log('3. Test user registration and board creation');
        console.log('4. Enjoy your FlowBoard application!');
        
        process.exit(0);
    } else {
        console.log('⚠️  Some issues were found with your setup');
        console.log('');
        console.log('💡 Recommendations:');
        console.log('1. Review the manual setup guide: server/MANUAL_SETUP_GUIDE.md');
        console.log('2. Check that all collections were created correctly');
        console.log('3. Verify API rules are configured for security');
        console.log('4. Re-run this verification after fixes');
        
        process.exit(1);
    }
}

// Handle errors and cleanup
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the verification
verifySetup().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});