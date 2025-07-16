# FlowBoard PocketBase Backend Setup Guide

This guide will help you set up a PocketBase backend that matches your FlowBoard frontend application structure.

## Prerequisites

- Downloaded PocketBase executable from https://pocketbase.io/
- Place the PocketBase executable in your `server/` directory
- Basic understanding of PocketBase admin interface

## Overview

Your FlowBoard application requires the following collections:
- `users` - User authentication and profiles
- `boards` - Project boards
- `lists` - Columns within boards
- `cards` - Tasks/items within lists
- `labels` - Color-coded labels for cards

## Step 1: Start PocketBase

1. Navigate to your `server/` directory
2. Run PocketBase:
   ```bash
   ./pocketbase serve
   ```
3. Open http://localhost:8090/_/ in your browser
4. Create an admin account when prompted

## Step 2: Configure Authentication Settings

### Basic Auth Settings
1. Go to **Settings** → **Auth**
2. Configure the following:
   - **Minimum password length**: 8
   - **Require email verification**: Enable (recommended)
   - **Allow username auth**: Disable (email only)

### OAuth Providers (Optional)
Based on your frontend code, you support Google and Microsoft OAuth:

1. Go to **Settings** → **Auth providers**
2. **Google OAuth2**:
   - Enable Google provider
   - Add your Google Client ID and Secret
   - Redirect URL: `http://localhost:8090/api/oauth2-redirect`
3. **Microsoft OAuth2**:
   - Enable Microsoft provider
   - Add your Microsoft Client ID and Secret
   - Redirect URL: `http://localhost:8090/api/oauth2-redirect`

## Step 3: Create Collections

### Collection 1: users (Auth Collection)

**Note**: PocketBase automatically creates a `users` collection. You need to modify it:

1. Go to **Collections** → **users**
2. **Fields to add/modify**:

| Field Name | Type | Required | Unique | Options |
|------------|------|----------|--------|---------|
| name | Text | Yes | No | Max length: 100 |
| avatar | File | No | No | Max select: 1, Max size: 5MB, Types: image/* |
| phone | Text | No | No | Max length: 20 |
| twoFactor | Bool | No | No | Default: false |

3. **API Rules**:
   - **List/Search**: `@request.auth.id != ""`
   - **View**: `@request.auth.id != "" && (@request.auth.id = id || @collection.boards.user.id ?= @request.auth.id)`
   - **Create**: `@request.auth.id = ""`
   - **Update**: `@request.auth.id = id`
   - **Delete**: `@request.auth.id = id`

### Collection 2: boards

1. Create new collection named `boards`
2. **Type**: Base collection
3. **Fields**:

| Field Name | Type | Required | Unique | Options |
|------------|------|----------|--------|---------|
| title | Text | Yes | No | Max length: 200 |
| description | Text | No | No | Max length: 1000 |
| user | Relation | Yes | No | Collection: users, Max select: 1, Cascade delete |

4. **API Rules**:
   - **List/Search**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
   - **Update**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && user.id = @request.auth.id`

### Collection 3: lists

1. Create new collection named `lists`
2. **Type**: Base collection
3. **Fields**:

| Field Name | Type | Required | Unique | Options |
|------------|------|----------|--------|---------|
| title | Text | Yes | No | Max length: 100 |
| board | Relation | Yes | No | Collection: boards, Max select: 1, Cascade delete |
| position | Number | Yes | No | Min: 0 |

4. **API Rules**:
   - **List/Search**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && board.user.id = @request.auth.id`

### Collection 4: cards

1. Create new collection named `cards`
2. **Type**: Base collection
3. **Fields**:

| Field Name | Type | Required | Unique | Options |
|------------|------|----------|--------|---------|
| title | Text | Yes | No | Max length: 200 |
| description | Text | No | No | Max length: 2000 |
| list | Relation | Yes | No | Collection: lists, Max select: 1, Cascade delete |
| position | Number | Yes | No | Min: 0 |
| dueDate | Date | No | No | - |
| recurrenceRule | Text | No | No | Max length: 500 |
| labels | Relation | No | No | Collection: labels, Max select: 10 |

4. **API Rules**:
   - **List/Search**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`

### Collection 5: labels

1. Create new collection named `labels`
2. **Type**: Base collection
3. **Fields**:

| Field Name | Type | Required | Unique | Options |
|------------|------|----------|--------|---------|
| name | Text | Yes | No | Max length: 50 |
| color | Text | Yes | No | Max length: 7, Pattern: ^#[0-9A-Fa-f]{6}$ |
| board | Relation | Yes | No | Collection: boards, Max select: 1, Cascade delete |

4. **API Rules**:
   - **List/Search**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && board.user.id = @request.auth.id`

## Step 4: Environment Configuration

Create a `.env` file in your project root:

```env
VITE_POCKETBASE_URL=http://localhost:8090
```

## Step 5: Data Relationships

The collections are structured with the following relationships:

```
users (1) ←→ (many) boards
boards (1) ←→ (many) lists
boards (1) ←→ (many) labels
lists (1) ←→ (many) cards
labels (many) ←→ (many) cards
```

## Step 6: Testing the Setup

1. Start your PocketBase server:
   ```bash
   cd server
   ./pocketbase serve
   ```

2. Start your frontend development server:
   ```bash
   npm run dev
   ```

3. Test the following functionality:
   - User registration and login
   - Creating a new board
   - Adding lists to a board
   - Creating cards in lists
   - Creating and applying labels
   - Drag and drop cards between lists

## Step 7: Additional Configuration (Optional)

### File Storage
If you want to customize file storage for user avatars:
1. Go to **Settings** → **Files**
2. Configure storage settings as needed

### Email Settings
For email verification and password reset:
1. Go to **Settings** → **Mail**
2. Configure SMTP settings

### Backup
Set up regular backups:
1. Go to **Settings** → **Backups**
2. Configure automatic backup schedule

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend is running on the expected port and PocketBase CORS settings allow it.

2. **Authentication Issues**: Verify that the `VITE_POCKETBASE_URL` environment variable matches your PocketBase server URL.

3. **Permission Errors**: Double-check the API rules for each collection to ensure they match the patterns above.

4. **Relation Errors**: Ensure all relation fields are properly configured with the correct target collections.

### Verification Checklist

- [ ] PocketBase server starts without errors
- [ ] All 5 collections created with correct fields
- [ ] API rules configured for each collection
- [ ] Environment variables set correctly
- [ ] Frontend can connect to PocketBase
- [ ] User registration/login works
- [ ] CRUD operations work for boards, lists, cards, and labels

## Security Considerations

1. **API Rules**: The provided API rules ensure users can only access their own data
2. **File Uploads**: Avatar uploads are restricted to images with size limits
3. **Input Validation**: Field constraints prevent malicious input
4. **Authentication**: All operations require authentication except user creation

## Next Steps

After completing this setup:
1. Test all functionality thoroughly
2. Consider implementing additional features like:
   - Card comments and attachments
   - Board sharing and collaboration
   - Activity logging
   - Real-time updates with PocketBase realtime subscriptions

Your PocketBase backend should now be fully compatible with your FlowBoard frontend application!