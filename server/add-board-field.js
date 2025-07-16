#!/usr/bin/env node

/**
 * Add missing board field to cards collection
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://localhost:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Get admin credentials from command line arguments
const [,, adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
    console.error('Usage: node add-board-field.js <admin-email> <admin-password>');
    process.exit(1);
}

async function addBoardField() {
    try {
        console.log('🔐 Authenticating as admin...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('✅ Admin authentication successful');

        // Get the cards collection
        console.log('📦 Getting cards collection...');
        const cardsCollection = await pb.collections.getOne('cards');
        
        // Check if board field already exists
        const boardFieldExists = cardsCollection.schema.some(field => field.name === 'board');
        
        if (boardFieldExists) {
            console.log('✅ Board field already exists in cards collection');
            return;
        }

        console.log('➕ Adding board field to cards collection...');
        
        // Add the board field to the schema
        const updatedSchema = [
            ...cardsCollection.schema,
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
        ];

        // Update the collection
        await pb.collections.update(cardsCollection.id, {
            schema: updatedSchema
        });

        console.log('✅ Successfully added board field to cards collection');
        console.log('🎉 Cards collection now includes the board relationship field');
        
    } catch (error) {
        console.error('❌ Failed to add board field:', error.message);
        if (error.data) {
            console.error('Error details:', JSON.stringify(error.data, null, 2));
        }
        process.exit(1);
    }
}

addBoardField();