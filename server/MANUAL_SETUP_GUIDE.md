# Manual PocketBase Setup Guide for FlowBoard

Since the API automation is encountering authentication issues, here's a step-by-step manual setup guide using the PocketBase web interface.

## 🌐 Access PocketBase Admin Interface

1. Open your browser and go to: **http://localhost:8090/_/**
2. Login with your admin credentials:
   - Email: `admin@flowboard.com`
   - Password: `pass@12345`

## 📦 Create Collections

### 1. Update Users Collection

The `users` collection already exists. We need to add custom fields:

1. Go to **Collections** → **users**
2. Click **Edit** (pencil icon)
3. Go to **Fields** tab
4. Add these fields by clicking **+ New field**:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `name` | Text | ✅ Yes | Max length: 100 |
| `avatar` | File | ❌ No | Max select: 1, Max size: 5MB, Types: image/* |
| `phone` | Text | ❌ No | Max length: 20 |
| `twoFactor` | Bool | ❌ No | Default: false |

5. Go to **API rules** tab and set:
   - **List/Search**: `@request.auth.id != ""`
   - **View**: `@request.auth.id != "" && (@request.auth.id = id || @collection.boards.user.id ?= @request.auth.id)`
   - **Create**: `@request.auth.id = ""`
   - **Update**: `@request.auth.id = id`
   - **Delete**: `@request.auth.id = id`

6. Click **Save changes**

### 2. Create Boards Collection

1. Click **+ New collection**
2. **Name**: `boards`
3. **Type**: Base collection
4. Click **Create**
5. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `title` | Text | ✅ Yes | Max length: 200 |
| `description` | Text | ❌ No | Max length: 1000 |
| `user` | Relation | ✅ Yes | Collection: users, Max select: 1, Cascade delete: ✅ |

6. **API rules**:
   - **List/Search**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
   - **Update**: `@request.auth.id != "" && user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && user.id = @request.auth.id`

7. Click **Save changes**

### 3. Create Lists Collection

1. Click **+ New collection**
2. **Name**: `lists`
3. **Type**: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `title` | Text | ✅ Yes | Max length: 100 |
| `board` | Relation | ✅ Yes | Collection: boards, Max select: 1, Cascade delete: ✅ |
| `position` | Number | ✅ Yes | Min: 0 |

5. **API rules**:
   - **List/Search**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && board.user.id = @request.auth.id`

6. Click **Save changes**

### 4. Create Labels Collection

1. Click **+ New collection**
2. **Name**: `labels`
3. **Type**: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `name` | Text | ✅ Yes | Max length: 50 |
| `color` | Text | ✅ Yes | Max length: 7, Pattern: `^#[0-9A-Fa-f]{6}$` |
| `board` | Relation | ✅ Yes | Collection: boards, Max select: 1, Cascade delete: ✅ |

5. **API rules**:
   - **List/Search**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && board.user.id = @request.auth.id`

6. Click **Save changes**

### 5. Create Cards Collection

1. Click **+ New collection**
2. **Name**: `cards`
3. **Type**: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `title` | Text | ✅ Yes | Max length: 200 |
| `description` | Text | ❌ No | Max length: 2000 |
| `list` | Relation | ✅ Yes | Collection: lists, Max select: 1, Cascade delete: ✅ |
| `position` | Number | ✅ Yes | Min: 0 |
| `dueDate` | Date | ❌ No | - |
| `recurrenceRule` | Text | ❌ No | Max length: 500 |
| `labels` | Relation | ❌ No | Collection: labels, Max select: 10, Cascade delete: ❌ |

5. **API rules**:
   - **List/Search**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **View**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Create**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Update**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`
   - **Delete**: `@request.auth.id != "" && list.board.user.id = @request.auth.id`

6. Click **Save changes**

## ✅ Verification

After creating all collections, you should have:
- ✅ **users** (modified with custom fields)
- ✅ **boards** (new)
- ✅ **lists** (new)
- ✅ **labels** (new)
- ✅ **cards** (new)

## 🚀 Test Your Setup

1. Ensure your `.env` file contains:
   ```
   VITE_POCKETBASE_URL=http://localhost:8090
   ```

2. Start your frontend:
   ```bash
   cd ..
   npm run dev
   ```

3. Test the following:
   - User registration
   - User login
   - Create a board
   - Add lists to the board
   - Create cards in lists
   - Create and apply labels
   - Drag and drop cards between lists

## 🔧 Troubleshooting

**If frontend can't connect:**
- Verify PocketBase is running: `./pocketbase serve`
- Check `.env` file has correct URL
- Restart frontend after creating `.env`

**If API calls fail:**
- Double-check all API rules are exactly as specified
- Ensure all relation fields point to correct collections
- Verify cascade delete settings

**If drag-and-drop doesn't work:**
- Check that `position` fields are set as Number type
- Verify API rules allow updates

Your FlowBoard backend is now ready! 🎉

## 📝 Notes

- All collections have user-scoped security
- Cascade delete maintains data integrity
- File uploads are restricted to images for avatars
- Position fields enable drag-and-drop functionality
- API rules ensure users only see their own data

The manual setup ensures everything works exactly as your frontend expects!