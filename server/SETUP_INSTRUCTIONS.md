# FlowBoard PocketBase Setup Instructions

## Step-by-Step Setup Process

### 1. Start PocketBase Server
```bash
cd server
./pocketbase serve
```

### 2. Create Admin Account
1. Open your browser and go to: http://localhost:8090/_/
2. You'll see a setup screen asking you to create an admin account
3. Create admin account with these credentials:
   - **Email**: `admin@flowboard.com`
   - **Password**: `pass@12345`
4. Click "Create and Login"

### 3. Run the Automation Script
Once the admin account is created, run:
```bash
node setup-collections.js admin@flowboard.com pass@12345
```

### 4. Verify Setup
The script will:
- ✅ Authenticate with your admin account
- ✅ Create/update 5 collections: users, boards, lists, labels, cards
- ✅ Configure all API rules for secure access
- ✅ Set up proper relationships between collections

### 5. Test with Frontend
1. Make sure `.env` file exists in project root with:
   ```
   VITE_POCKETBASE_URL=http://localhost:8090
   ```
2. Start your frontend:
   ```bash
   cd ..
   npm run dev
   ```
3. Test user registration and board creation

## Troubleshooting

### If Admin Authentication Fails:
1. **Check if admin account exists**: Visit http://localhost:8090/_/
2. **Verify credentials**: Make sure you used exactly:
   - Email: `admin@flowboard.com`
   - Password: `pass@12345`
3. **Test authentication**: Run `node test-admin.js admin@flowboard.com pass@12345`

### If Collections Already Exist:
- The script is safe to re-run - it will update existing collections
- No data will be lost when updating collection schemas

### If Script Fails:
1. Check PocketBase is running: `curl http://localhost:8090/api/health`
2. Verify admin credentials with test script
3. Check the detailed error messages in the script output

## What Gets Created

### Collections:
1. **users** (Auth Collection)
   - Fields: name, avatar, phone, twoFactor
   - Supports OAuth and 2FA

2. **boards** (Base Collection)
   - Fields: title, description, user (relation)
   - User-owned project boards

3. **lists** (Base Collection)
   - Fields: title, board (relation), position
   - Columns within boards

4. **labels** (Base Collection)
   - Fields: name, color, board (relation)
   - Color-coded tags

5. **cards** (Base Collection)
   - Fields: title, description, list (relation), position, dueDate, recurrenceRule, labels (relation)
   - Full-featured task cards

### Security Rules:
- All collections have user-scoped access
- Users can only see/modify their own data
- Proper cascade delete for data integrity
- File upload restrictions for avatars

## Next Steps After Setup

1. **Configure OAuth** (Optional):
   - Go to Settings → Auth providers
   - Add Google/Microsoft OAuth credentials

2. **Test All Features**:
   - User registration/login
   - Board creation
   - List and card management
   - Drag and drop functionality
   - Label management

3. **Production Deployment**:
   - Update VITE_POCKETBASE_URL for production
   - Configure proper SMTP for email verification
   - Set up regular backups

Your FlowBoard backend will be fully functional after following these steps!