# Tier-Based Scan Limit System Implementation

## Overview
This document outlines the implementation of a tier-based scan limit system that restricts free users to 5 scans while allowing premium users unlimited access.

## Architecture

### 1. Profile Cache Extension (`lib/profileCache.ts`)
- Added `tier` field to the `Profile` interface
- Type: `'free' | 'premium' | null`
- Default value: `'free'`
- Cached alongside other profile data with TTL

#### New Methods:
```typescript
getUserTier(userId: string): 'free' | 'premium' | null
setUserTier(userId: string, tier: 'free' | 'premium'): void
```

### 2. Database Schema
Ensure your `profiles` table in Supabase has a `tier` column:
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' 
CHECK (tier IN ('free', 'premium'));
```

### 3. Scan Screen Implementation (`app/(tabs)/scan.tsx`)

#### State Management
- `userTier`: Current user's tier ('free' or 'premium')
- `scanCount`: Number of scans performed by the user
- `upgradeModalVisible`: Controls the upgrade modal display
- `FREE_TIER_LIMIT`: Constant set to 5 scans

#### Key Functions

##### `loadUserTierAndScanCount(userId, forceRefresh)`
- Loads user tier from cache or database
- Retrieves scan count from `scan_activity` table
- Updates local state
- **Cache Strategy**: Check cache first, fallback to database
- Can force refresh to bypass cache

##### `canUserScan()`
- Returns `true` if user is premium
- Returns `true` if free user hasn't hit the limit
- Returns `false` if free user has reached 5 scans

##### `showUpgradeModal()`
- Displays the premium upgrade modal
- Called when free user attempts to scan after hitting limit

#### Integration Points
The scan limit check is added to:
1. **`handlePickImage()`** - Before opening image picker
2. **`handleTakePicture()`** - Before capturing from camera
3. **`handleStartCamera()`** - Before opening camera modal

```typescript
if (!canUserScan()) {
  showUpgradeModal();
  return;
}
```

## Upgrade Modal UI

### Design Features
- **Scan Count Display**: Visual representation of scans used (5/5)
- **Premium Benefits**: Clear list of premium features
  - Unlimited scans
  - Priority processing
  - Advanced analytics
  - Save favorites
- **CTA Button**: "Upgrade to Premium" (placeholder for payment integration)
- **Secondary Action**: "Maybe Later" button to dismiss

### Styling
- Modern, professional design
- Gold star icon for premium branding
- Feature list with icons
- Responsive layout
- Elevation and shadows for depth

## User Flow

### Free User Experience
1. User signs in → Tier loaded as 'free' (from cache or database)
2. User performs scans 1-5 → Scans work normally
3. User attempts scan #6 → Upgrade modal appears
4. User sees scan count (5/5) and premium benefits
5. Options:
   - Click "Upgrade to Premium" (TODO: implement payment)
   - Click "Maybe Later" to dismiss

### Premium User Experience
1. User signs in → Tier loaded as 'premium'
2. User can perform unlimited scans
3. No upgrade modal ever shown

## Cache Strategy

### On App Launch
1. Check profile cache for tier
2. If cached and valid → use cached value
3. If not cached or expired → fetch from database
4. Store in cache with TTL (1 hour default)

### After Each Scan
1. Increment local scan count immediately (optimistic update)
2. Reload tier and scan count to ensure accuracy
3. This prevents desync between cache and database

### Cache Invalidation
- Profile cache automatically expires after TTL
- Can manually invalidate: `profileCache.invalidateUser(userId)`
- Force refresh: `loadUserTierAndScanCount(userId, true)`

## Integration Checklist

### Backend Setup
- [ ] Add `tier` column to `profiles` table
- [ ] Set default value to 'free'
- [ ] Add constraint to limit values to 'free' or 'premium'
- [ ] Create migration script

### Frontend Implementation
- [x] Extend profile cache with tier support
- [x] Add tier and scan count state to scan screen
- [x] Implement `loadUserTierAndScanCount()` function
- [x] Implement `canUserScan()` check
- [x] Add scan limit checks before scan actions
- [x] Create upgrade modal UI
- [x] Update scan count after successful scan
- [ ] Implement premium upgrade flow (payment integration)

### Testing
- [ ] Test free user hitting 5-scan limit
- [ ] Test premium user with unlimited scans
- [ ] Test cache behavior (hit/miss/expiry)
- [ ] Test force refresh of tier data
- [ ] Test scan count incrementing correctly
- [ ] Test upgrade modal UI and interactions

## Future Enhancements

### Payment Integration
Replace the placeholder alert in the upgrade button with:
```typescript
onPress={() => {
  // Navigate to payment/checkout screen
  router.push('/checkout');
  // OR open in-app purchase flow
  // OR navigate to Stripe checkout
}}
```

### Admin Panel
- Allow admins to manually upgrade users
- View user tier distribution
- Analytics on conversion rates

### Additional Tier Features
Consider adding more premium features:
- Export scan history
- PDF reports
- Email notifications
- Custom scan schedules
- Team collaboration

### Progressive Limits
Instead of hard cutoff at 5:
- Show warning at 3 scans
- Show gentle reminder at 4 scans
- Show upgrade modal at 5 scans

## Code Locations

### Files Modified
1. `lib/profileCache.ts` - Profile cache with tier support
2. `app/(tabs)/scan.tsx` - Scan limit implementation and upgrade modal

### Key Code Sections
- Profile interface: `lib/profileCache.ts:10-17`
- Tier methods: `lib/profileCache.ts:204-222`
- State management: `app/(tabs)/scan.tsx:32-45`
- Tier loading: `app/(tabs)/scan.tsx:61-123`
- Scan checks: `app/(tabs)/scan.tsx:125-143`
- Upgrade modal: `app/(tabs)/scan.tsx:1130-1229`
- Modal styles: `app/(tabs)/scan.tsx:2258-2416`

## Database Query Examples

### Check User Tier
```sql
SELECT tier FROM profiles WHERE id = 'user-id-here';
```

### Get Scan Count
```sql
SELECT COUNT(*) FROM scan_activity WHERE user_id = 'user-id-here';
```

### Upgrade User to Premium
```sql
UPDATE profiles SET tier = 'premium' WHERE id = 'user-id-here';
```

### Get Users by Tier
```sql
SELECT tier, COUNT(*) as count FROM profiles GROUP BY tier;
```

## Support & Troubleshooting

### Common Issues

**Issue**: User shows as free but should be premium
- **Solution**: Force refresh tier: `loadUserTierAndScanCount(userId, true)`
- **Check**: Verify database has correct tier value

**Issue**: Scan count doesn't update
- **Solution**: Check that `logScanActivity` is being called
- **Check**: Verify Supabase permissions for `scan_activity` table

**Issue**: Cache not expiring
- **Solution**: Check `CACHE_DURATION` in `profileCache.ts`
- **Default**: 1 hour (60 * 60 * 1000 ms)

**Issue**: Upgrade modal showing for premium users
- **Solution**: Clear profile cache and reload
- **Check**: Database tier value is correctly set to 'premium'

## Performance Considerations

### Cache Hit Rate
- Expected: >90% for active users
- Monitor via `profileCache.getStats_CacheInfo()`

### Database Queries
- Tier check: 1 query per session (cached)
- Scan count: 1 query per scan (lightweight COUNT)
- Total impact: Minimal (~2 queries per scan)

### Optimization Tips
- Cache tier aggressively (rarely changes)
- Use COUNT with head: true for scan count
- Batch tier updates for multiple users
- Consider pre-loading tier on app launch

## Security Considerations

- **Client-side checks**: Good for UX, not security
- **Server-side validation**: Required for production
- **Recommendation**: Add server-side tier check in API/Edge Function
- **Prevent**: Users bypassing limit by modifying client code

### Server-Side Implementation (TODO)
```typescript
// In Supabase Edge Function or API
const { data: profile } = await supabase
  .from('profiles')
  .select('tier')
  .eq('id', userId)
  .single();

if (profile?.tier === 'free') {
  const { count } = await supabase
    .from('scan_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (count >= 5) {
    return new Response(JSON.stringify({ 
      error: 'Free tier limit reached' 
    }), { status: 403 });
  }
}
```

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
**Author**: CropGuard Development Team
