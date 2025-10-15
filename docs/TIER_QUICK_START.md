# Tier-Based Scan Limit - Quick Start Guide

## Overview
Free users are now limited to 5 scans. Premium users have unlimited scans.

## What Was Implemented

### 1. **Profile Cache Updates** (`lib/profileCache.ts`)
- Added `tier` field to profile interface
- Added `getUserTier()` and `setUserTier()` methods
- Tier is cached with profile data (1-hour TTL)

### 2. **Scan Limit System** (`app/(tabs)/scan.tsx`)
- Checks user tier before allowing scans
- Tracks scan count from database
- Shows upgrade modal when free users hit 5-scan limit
- Premium users bypass all limits

### 3. **Upgrade Modal**
Beautiful modal showing:
- Current scan count (5/5)
- Premium benefits list
- "Upgrade to Premium" button (needs payment integration)
- "Maybe Later" button to dismiss

## Setup Required

### Database Migration
Run this SQL in your Supabase SQL Editor:

```sql
-- Add tier column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
CHECK (tier IN ('free', 'premium'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- Set existing users to 'free'
UPDATE profiles SET tier = 'free' WHERE tier IS NULL;
```

Or use the migration file: `docs/migrations/add_tier_column.sql`

## How It Works

### Free User Flow
1. User opens scan screen
2. System loads tier from cache (or database if not cached)
3. User performs scans 1-5 → Works normally
4. User tries scan #6 → Upgrade modal appears
5. User must upgrade to continue

### Premium User Flow
1. User opens scan screen
2. System loads tier as 'premium'
3. User can scan unlimited times
4. No restrictions or modals

## Testing the System

### Test as Free User
1. Ensure your user has `tier = 'free'` in database
2. Perform 5 scans successfully
3. Attempt 6th scan → Should show upgrade modal

### Test as Premium User
1. Update your user: `UPDATE profiles SET tier = 'premium' WHERE id = 'your-user-id';`
2. Perform many scans → Should work without limits

### Force Cache Refresh
```typescript
// In your code if needed
await loadUserTierAndScanCount(userId, true);
```

## Next Steps

### 1. Payment Integration (TODO)
Replace the placeholder in scan.tsx:
```typescript
// Line ~1206 in scan.tsx
onPress={() => {
  // TODO: Implement payment flow
  // Examples:
  // - router.push('/checkout')
  // - Stripe checkout
  // - In-app purchase
  Alert.alert("Coming Soon", "Premium upgrade will be available soon!");
}}
```

### 2. Server-Side Validation (Recommended)
Add tier check in your API/Edge Functions to prevent bypass:
```typescript
// In Supabase Edge Function
const canScan = await checkUserCanScan(userId);
if (!canScan) {
  return new Response('Free tier limit reached', { status: 403 });
}
```

### 3. Admin Tools
- Build admin panel to manually upgrade users
- View tier analytics
- Track conversion rates

## Key Files

| File | Purpose |
|------|---------|
| `lib/profileCache.ts` | Profile caching with tier support |
| `app/(tabs)/scan.tsx` | Scan limit logic & upgrade modal |
| `docs/TIER_SYSTEM_IMPLEMENTATION.md` | Full documentation |
| `docs/migrations/add_tier_column.sql` | Database migration |

## Quick Commands

### Check User Tier
```sql
SELECT id, tier FROM profiles WHERE id = 'user-id';
```

### Upgrade User
```sql
UPDATE profiles SET tier = 'premium' WHERE id = 'user-id';
```

### Get Scan Count
```sql
SELECT COUNT(*) FROM scan_activity WHERE user_id = 'user-id';
```

### View Tier Distribution
```sql
SELECT tier, COUNT(*) FROM profiles GROUP BY tier;
```

## Features Ready to Use

✅ Tier-based scan limiting
✅ Profile cache with tier support  
✅ Scan count tracking
✅ Upgrade modal UI
✅ Free tier limit (5 scans)
✅ Unlimited scans for premium
✅ Cache invalidation support
✅ Database migration script

## Features Pending

⏳ Payment integration
⏳ Server-side validation
⏳ Admin panel
⏳ Analytics dashboard

## Support

If you encounter issues:
1. Check database has `tier` column
2. Verify user has valid tier value ('free' or 'premium')
3. Clear cache: `profileCache.invalidateUser(userId)`
4. Force refresh: `loadUserTierAndScanCount(userId, true)`

---

**Ready to Go!** 🚀

The system is fully functional for testing. Just run the database migration and start testing with free/premium users.
