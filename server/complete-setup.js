#!/usr/bin/env node

/**
 * Complete PocketBase Setup Script for FlowBoard
 * 
 * This script handles the complete setup process:
 * 1. Creates the initial admin account
 * 2. Sets up all collections and API rules
 * 
 * Usage: node complete-setup.js
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://localhost:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Admin credentials
const ADMIN_EMAIL = 'admin@flowboard.com';
const ADMIN_PASSWORD = 'pass@12345';

// Collection schemas (same as in setup-collections.js)
const collections = {
    users: {
        name: 'users',
        type: 'auth',
        schema: [
            {
                name: 'name',
                type: 'text',
                required: true,
                options: { max: 100 }
            },
            {
                name: 'avatar',
                type: 'file',
                required: false,
                options: {
                    maxSelect: 1,
                    maxSize: 5242880, // 5MB
                    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                }
            },
            {
                name: 'phone',
                type: 'text',
                required: false,
                options: { max: 20 }
            },
            {
                name: 'twoFactor',
                type: 'bool',
                required: false,
                options: {}
            }
        ],
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != "" && (@request.auth.id = id || @collection.boards.user.id ?= @request.auth.id)',
        createRule: '@request.auth.id = ""',
        updateRule: '@request.auth.id = id',
        deleteRule: '@request.auth.id = id'
    },

    boards: {
        name: 'boards',
        type: 'base',
        schema: [
            {
                name: 'title',
                type: 'text',
                required: true,
                options: { max: 200 }
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                options: { max: 1000 }
            },
            {
                name: 'user',
                type: 'relation',
                required: true,
                options: {
                    collectionId: 'users',
                    cascadeDelete: true,
                    maxSelect: 1
                }
            }
        ],
        listRule: '@request.auth.id != "" && user.id = @request.auth.id',
        viewRule: '@request.auth.id != "" && user.id = @request.auth.id',
        createRule: '@request.auth.id != "" && @request.data.user = @request.auth.id',
        updateRule: '@request.auth.id != "" && user.id = @request.auth.id',
        deleteRule: '@request.auth.id != "" && user.id = @request.auth.id'
    },

    lists: {
        name: 'lists',
        type: 'base',
        schema: [
            {
                name: 'title',
                type: 'text',
                required: true,
                options: { max: 100 }
            },
            {
                name: 'board',
                type: 'relation',
                required: true,
                options: {
                    collectionId: 'boards',
                    cascadeDelete: true,
                    maxSelect: 1
                }
            },
            {
                name: 'position',
                type: 'number',
                required: true,
                options: { min: 0 }
            }
        ],
        listRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        viewRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        createRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        updateRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        deleteRule: '@request.auth.id != "" && board.user.id = @request.auth.id'
    },

    labels: {
        name: 'labels',
        type: 'base',
        schema: [
            {
                name: 'name',
                type: 'text',
                required: true,
                options: { max: 50 }
            },
            {
                name: 'color',
                type: 'text',
                required: true,
                options: {
                    max: 7,
                    pattern: '^#[0-9A-Fa-f]{6}$'
                }
            },
            {
                name: 'board',
                type: 'relation',
                required: true,
                options: {
                    collectionId: 'boards',
                    cascadeDelete: true,
                    maxSelect: 1
                }
            }
        ],
        listRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        viewRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        createRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        updateRule: '@request.auth.id != "" && board.user.id = @request.auth.id',
        deleteRule: '@request.auth.id != "" && board.user.id = @request.auth.id'
    },

    cards: {
        name: 'cards',
        type: 'base',
        schema: [
            {
                name: 'title',
                type: 'text',
                required: true,
                options: { max: 200 }
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                options: { max: 2000 }
            },
            {
                name: 'list',
                type: 'relation',
                required: true,
                options: {
                    collectionId: 'lists',
                    cascadeDelete: true,
                    maxSelect: 1
                }
            },
            {
                name: 'position',
                type: 'number',
                required: true,
                options: { min: 0 }
            },
            {
                name: 'dueDate',
                type: 'date',
                required: false,
                options: {}
            },
            {
                name: 'recurrenceRule',
                type: 'text',
                required: false,
                options: { max: 500 }
            },
            {
                name: 'labels',
                type: 'relation',
                required: false,
                options: {
                    collectionId: 'labels',
                    cascadeDelete: false,
                    maxSelect: 10
                }
            }
        ],
        listRule: '@request.auth.id != "" && list.board.user.id = @request.auth.id',
        viewRule: '@request.auth.id != "" && list.board.user.id = @request.auth.id',
        createRule: '@request.auth.id != "" && list.board.user.id = @request.auth.id',
        updateRule: '@request.auth.id != "" && list.board.user.id = @request.auth.id',
        deleteRule: '@request.auth.id != "" && list.board.user.id = @request.auth.id'
    }
};

async function checkPocketBaseHealth() {
    try {
        const response = await fetch(`${POCKETBASE_URL}/api/health`);
        const data = await response.json();
        if (data.code === 200) {
            console.log('✅ PocketBase is running and healthy');
            return true;
        }
    } catch (error) {
        console.error('❌ PocketBase is not running. Please start it with: ./pocketbase serve');
        return false;
    }
}

async function createInitialAdmin() {
    try {
        console.log('🔧 Creating initial admin account...');
        
        // Try to create admin via the initial setup endpoint
        const response = await fetch(`${POCKETBASE_URL}/api/admins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                passwordConfirm: ADMIN_PASSWORD
            })
        });

        if (response.ok) {
            console.log('✅ Admin account created successfully');
            return true;
        } else {
            const errorData = await response.json();
            if (response.status === 400 && errorData.message?.includes('already exists')) {
                console.log('ℹ️  Admin account already exists');
                return true;
            }
            console.error('❌ Failed to create admin:', errorData);
            return false;
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        return false;
    }
}

async function authenticateAdmin() {
    try {
        console.log('🔐 Authenticating as admin...');
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Admin authentication successful');
        return true;
    } catch (error) {
        console.error('❌ Admin authentication failed:', error.message);
        return false;
    }
}

async function createOrUpdateCollection(collectionData) {
    const { name, type, schema, listRule, viewRule, createRule, updateRule, deleteRule } = collectionData;
    
    try {
        let collection;
        try {
            collection = await pb.collections.getOne(name);
            console.log(`📝 Updating existing collection: ${name}`);
        } catch (error) {
            if (error.status === 404) {
                console.log(`🆕 Creating new collection: ${name}`);
                collection = null;
            } else {
                throw error;
            }
        }

        const collectionConfig = {
            name,
            type,
            schema,
            listRule: listRule || '',
            viewRule: viewRule || '',
            createRule: createRule || '',
            updateRule: updateRule || '',
            deleteRule: deleteRule || ''
        };

        if (collection) {
            await pb.collections.update(collection.id, collectionConfig);
            console.log(`✅ Updated collection: ${name}`);
        } else {
            await pb.collections.create(collectionConfig);
            console.log(`✅ Created collection: ${name}`);
        }

    } catch (error) {
        console.error(`❌ Failed to create/update collection ${name}:`, error.message);
        throw error;
    }
}

async function setupCollections() {
    console.log('\n📦 Setting up collections...\n');

    const collectionOrder = ['users', 'boards', 'lists', 'labels', 'cards'];
    
    for (const collectionName of collectionOrder) {
        const collectionData = collections[collectionName];
        await createOrUpdateCollection(collectionData);
    }
}

async function completeSetup() {
    console.log('🚀 Starting complete PocketBase setup for FlowBoard...\n');

    // Step 1: Check PocketBase health
    const isHealthy = await checkPocketBaseHealth();
    if (!isHealthy) {
        process.exit(1);
    }

    // Step 2: Create initial admin account
    const adminCreated = await createInitialAdmin();
    if (!adminCreated) {
        console.log('\n💡 Manual steps required:');
        console.log('1. Visit http://localhost:8090/_/ in your browser');
        console.log('2. Create admin account with:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('3. Then run this script again');
        process.exit(1);
    }

    // Step 3: Authenticate as admin
    const authSuccess = await authenticateAdmin();
    if (!authSuccess) {
        process.exit(1);
    }

    // Step 4: Setup collections
    await setupCollections();

    console.log('\n🎉 Complete setup finished successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Admin account: ${ADMIN_EMAIL}`);
    console.log('- Collections: users, boards, lists, labels, cards');
    console.log('- API rules: Configured for user-scoped access');
    console.log('- Security: Cascade delete and validation rules applied');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Ensure .env file has: VITE_POCKETBASE_URL=http://localhost:8090');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Test user registration and board creation');
    console.log('4. Visit http://localhost:8090/_/ to manage your backend');
}

// Handle errors and cleanup
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the complete setup
completeSetup().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
});