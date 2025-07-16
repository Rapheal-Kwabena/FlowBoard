# FlowBoard PocketBase - Quick Start Guide

## 🚀 Fastest Setup (2 Steps)

### Step 1: Create Admin Account
1. Visit: http://localhost:8090/_/
2. Create admin with:
   - **Email**: `admin@flowboard.com`
   - **Password**: `pass@12345`

### Step 2: Run Complete Setup
```bash
cd server
npm run complete-setup
```

**That's it!** Your FlowBoard backend is ready.

---

## 📋 What Just Happened?

The automation script:
- ✅ Created 5 collections (users, boards, lists, cards, labels)
- ✅ Configured all API security rules
- ✅ Set up proper relationships and validation
- ✅ Made everything compatible with your frontend

## 🧪 Test Your Setup

```bash
# Start frontend
cd ..
npm run dev

# Test features:
# - User registration/login
# - Create boards
# - Add lists and cards
# - Drag and drop
# - Labels
```

## 🛠️ Available Scripts

```bash
npm run complete-setup    # Full automated setup
npm run setup            # Collections only (requires admin)
npm run test-admin       # Debug admin authentication
npm run start            # Start Express wrapper
```

## 🔧 Troubleshooting

**Script fails?**
- Ensure PocketBase is running: `./pocketbase serve`
- Check admin credentials match exactly
- Visit http://localhost:8090/_/ to verify admin exists

**Frontend can't connect?**
- Check `.env` has: `VITE_POCKETBASE_URL=http://localhost:8090`
- Restart frontend after creating `.env`

## 📁 Files Created

- `complete-setup.js` - Full automation (recommended)
- `setup-collections.js` - Collections only
- `test-admin.js` - Debug authentication
- `SETUP_INSTRUCTIONS.md` - Detailed manual guide
- `README.md` - Complete documentation

Your FlowBoard backend is now fully functional! 🎉