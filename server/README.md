# FlowBoard PocketBase Server Setup

This directory contains the PocketBase server setup and automation scripts for the FlowBoard application.

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start PocketBase
```bash
./pocketbase serve
```

### 3. Create Admin Account
- Open http://localhost:8090/_/ in your browser
- Create an admin account when prompted

### 4. Run Automation Script
```bash
npm run setup <admin-email> <admin-password>
```

Example:
```bash
npm run setup admin@example.com mypassword123
```

## What the Script Does

The automation script (`setup-collections.js`) will:

1. **Authenticate** with your PocketBase admin account
2. **Create/Update Collections**:
   - `users` - User authentication and profiles
   - `boards` - Project boards with user ownership
   - `lists` - Columns within boards
   - `labels` - Color-coded tags for cards
   - `cards` - Tasks with full feature support

3. **Configure API Rules** for secure, user-scoped access
4. **Set up Relationships** between collections
5. **Apply Validation Rules** for data integrity

## Manual Setup Alternative

If you prefer manual setup, follow the detailed instructions in:
- `../POCKETBASE_SETUP.md` - Complete step-by-step guide
- `../POCKETBASE_COLLECTION_SCHEMAS.md` - Quick reference

## Files

- `pocketbase.exe` - PocketBase executable (download from pocketbase.io)
- `setup-collections.js` - Automation script for collection setup
- `server.mjs` - Express server wrapper (optional)
- `package.json` - Node.js dependencies

## Environment Setup

After running the setup script, create a `.env` file in your project root:

```env
VITE_POCKETBASE_URL=http://localhost:8090
```

## Testing

After setup, test your configuration:

1. Start PocketBase: `./pocketbase serve`
2. Start frontend: `cd .. && npm run dev`
3. Test user registration and login
4. Create a board and add lists/cards
5. Test drag-and-drop functionality

## Troubleshooting

### Common Issues

1. **Script fails with authentication error**
   - Ensure PocketBase is running on http://localhost:8090
   - Verify admin credentials are correct
   - Check that admin account was created via web interface

2. **Collection creation fails**
   - Ensure you have admin privileges
   - Check PocketBase logs for detailed error messages
   - Try running the script again (it's safe to re-run)

3. **Frontend can't connect**
   - Verify `.env` file has correct `VITE_POCKETBASE_URL`
   - Ensure PocketBase server is running
   - Check browser console for CORS errors

### Reset Collections

To start fresh, you can delete collections via the admin interface and re-run the script.

## Security Notes

- The script sets up user-scoped API rules
- All data access is restricted to authenticated users
- Users can only access their own boards, lists, and cards
- File uploads are restricted to images for avatars
- Cascade delete is configured to maintain data integrity

## Support

For issues with:
- **PocketBase**: Check https://pocketbase.io/docs/
- **FlowBoard Frontend**: Review the main project documentation
- **This Setup**: Check the troubleshooting section above