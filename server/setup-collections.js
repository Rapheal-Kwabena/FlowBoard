#!/usr/bin/env node

/**
 * PocketBase Collection Setup Script for FlowBoard
 * 
 * This script automatically creates all required collections and configures
 * API rules for the FlowBoard application.
 * 
 * Prerequisites:
 * 1. PocketBase server must be running (./pocketbase serve)
 * 2. Admin account must be created
 * 3. Install dependencies: npm install pocketbase
 * 
 * Usage: node setup-collections.js <admin-email> <admin-password>
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const POCKETBASE_URL = 'http://localhost:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Get admin credentials from command line arguments
const [,, adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
    console.error('Usage: node setup-collections.js <admin-email> <admin-password>');
    process.exit(1);
}

// Collection schemas
const collections = {
    // Users collection is automatically created, we'll just update it
    users: {
        name: 'users',
        type: 'auth',
        schema: [
            {
                name: 'name',
                type: 'text',
                required: true,
                options: {
                    max: 100
                }
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
                options: {
                    max: 20
                }
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
                options: {
                    max: 200
                }
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                options: {
                    max: 1000
                }
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
                options: {
                    max: 100
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
            },
            {
                name: 'position',
                type: 'number',
                required: true,
                options: {
                    min: 0
                }
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
                options: {
                    max: 50
                }
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
                options: {
                    max: 200
                }
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                options: {
                    max: 2000
                }
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
                options: {
                    min: 0
                }
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
                options: {
                    max: 500
                }
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

async function authenticateAdmin() {
    try {
        console.log('🔐 Authenticating as admin...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
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
        // Check if collection exists
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
            // Update existing collection
            await pb.collections.update(collection.id, collectionConfig);
            console.log(`✅ Updated collection: ${name}`);
        } else {
            // Create new collection
            await pb.collections.create(collectionConfig);
            console.log(`✅ Created collection: ${name}`);
        }

    } catch (error) {
        console.error(`❌ Failed to create/update collection ${name}:`, error.message);
        throw error;
    }
}

async function setupCollections() {
    console.log('🚀 Starting PocketBase collection setup...\n');

    // Authenticate as admin
    const authSuccess = await authenticateAdmin();
    if (!authSuccess) {
        process.exit(1);
    }

    console.log('\n📦 Setting up collections...\n');

    // Create collections in order (dependencies first)
    const collectionOrder = ['users', 'boards', 'lists', 'labels', 'cards'];
    
    for (const collectionName of collectionOrder) {
        const collectionData = collections[collectionName];
        await createOrUpdateCollection(collectionData);
    }

    console.log('\n🎉 Collection setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- users: Auth collection with profile fields');
    console.log('- boards: User-owned project boards');
    console.log('- lists: Columns within boards');
    console.log('- labels: Color-coded tags for cards');
    console.log('- cards: Tasks with full feature support');
    
    console.log('\n🔒 Security:');
    console.log('- All collections have user-scoped access rules');
    console.log('- Cascade delete configured for data integrity');
    console.log('- File uploads restricted to images (avatars)');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Create a .env file with VITE_POCKETBASE_URL=http://localhost:8090');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Test user registration and board creation');
}

// Handle errors and cleanup
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the setup
setupCollections().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
});