# Model Retraining Checklist

When you retrain your ML model with new diseases, follow this checklist to ensure smooth integration.

## 📋 Pre-Training

- [ ] Document the new diseases you're adding
- [ ] Prepare disease information (symptoms, treatment, prevention)
- [ ] Note the exact label format you'll use in training data

## 🤖 During Training

- [ ] Use consistent naming: `PlantName___DiseaseName`
- [ ] Keep disease names descriptive
- [ ] Avoid special characters except underscores and parentheses
- [ ] Test model outputs to confirm prediction format

## ✅ Post-Training Integration

### Step 1: Export Model Predictions
Document all possible predictions your model can output:

```
Example model outputs after retraining:
- Apple___Apple_scab
- Apple___Black_rot
- Apple___Cedar_apple_rust
- Apple___healthy
- Cucumber___Anthracnose  ← NEW
- Cucumber___Downy_mildew  ← NEW
- Cucumber___healthy  ← NEW
... (list all predictions)
```

### Step 2: Identify New Diseases
From the list above, identify truly **new diseases** (not just new plants):

```
New diseases to add:
1. Anthracnose
2. Downy_mildew
```

### Step 3: Update Supabase Database
For each new disease, add to `disease_data` table:

```sql
-- Example for Anthracnose
INSERT INTO disease_data (
  disease_id,
  disease_name,
  description,
  symptoms,
  treatment,
  prevention,
  image_url,
  created_at
) VALUES (
  'anthracnose',
  'Anthracnose',
  'A fungal disease causing dark, sunken lesions on fruits and vegetables.',
  '["Dark sunken spots", "Lesions on fruits", "Stem cankers", "Leaf spots with yellow halos"]',
  '["Remove infected plant parts", "Apply copper-based fungicide", "Improve air circulation", "Avoid overhead watering"]',
  '["Use disease-resistant varieties", "Practice crop rotation", "Clean garden tools", "Remove plant debris"]',
  NULL,
  NOW()
);

-- Example for Downy Mildew
INSERT INTO disease_data (
  disease_id,
  disease_name,
  description,
  symptoms,
  treatment,
  prevention,
  image_url,
  created_at
) VALUES (
  'downy_mildew',
  'Downy Mildew',
  'A destructive fungal-like disease affecting many crops, particularly cucurbits.',
  '["Yellow patches on upper leaf surface", "White to gray fuzzy growth on undersides", "Leaf curling", "Stunted growth"]',
  '["Apply fungicide at first sign", "Remove severely infected leaves", "Increase plant spacing", "Water in the morning"]',
  '["Plant resistant varieties", "Ensure good air circulation", "Avoid overhead irrigation", "Monitor humidity levels"]',
  NULL,
  NOW()
);
```

### Step 4: Update Disease Mapping
Open `lib/diseaseMapping.ts` and add new mappings:

```typescript
export const DISEASE_MAPPING: DiseaseMapping = {
  // ... existing mappings ...
  
  // ===== NEW DISEASES (Added: Jan 2026) =====
  
  // Cucumber diseases
  "Anthracnose": "anthracnose",
  "Downy_mildew": "downy_mildew",
  
  // Note: If other plants can have these diseases, they'll map automatically
  // Example: "Tomato___Anthracnose" → extracts "Anthracnose" → maps to "anthracnose"
  
  // ===== END NEW DISEASES =====
  
  // ... rest of mappings ...
};
```

### Step 5: Update Documentation
Update the mapping file header comment:

```typescript
/**
 * Disease Mapping Configuration
 * 
 * Last Updated: January 2026
 * Model Version: v2.1
 * Total Diseases: 18 (added anthracnose, downy_mildew)
 * 
 * ... rest of header ...
 */
```

### Step 6: Test Integration
Test with actual images:

```
Testing Checklist:
- [ ] Scan image with new disease
- [ ] Verify prediction appears correctly
- [ ] Check if name is formatted properly
- [ ] Tap on prediction
- [ ] Confirm navigation to detail page
- [ ] Verify disease information displays
- [ ] Check scan logging in database
- [ ] Test with healthy plant (should not route)
```

### Step 7: Deploy

```bash
# Commit changes
git add lib/diseaseMapping.ts
git commit -m "Add anthracnose and downy_mildew disease mappings (Model v2.1)"

# Deploy model (your ML pipeline)
# Deploy app updates
# Run database migrations if needed
```

---

## 🔄 Handling Existing Diseases on New Plants

If your retrained model detects an **existing disease** on a **new plant** (e.g., "Cucumber___Powdery_mildew" but you already have "powdery_mildew"):

### ✅ No Action Needed!

The mapping system automatically handles this:

```
User scans cucumber → Model predicts "Cucumber___Powdery_mildew"
→ System extracts "Powdery_mildew"
→ Maps to existing "powdery_mildew"
→ Routes to /details/powdery_mildew
→ Shows existing disease information
```

**Only add new mapping entries for truly NEW diseases!**

---

## 🎯 Consolidating Similar Diseases

If your new model detects variations of existing diseases, you can map them:

```typescript
// Old model: Just "Rust"
// New model: "Common_rust_", "Stripe_rust", "Leaf_rust"

// Option 1: Map all to generic "rust"
"Common_rust_": "rust",
"Stripe_rust": "rust",
"Leaf_rust": "rust",

// Option 2: Create specific entries (requires new DB rows)
"Common_rust_": "common_rust",
"Stripe_rust": "stripe_rust",
"Leaf_rust": "leaf_rust",
```

Choose based on whether you want:
- **General information** (Option 1): Easier, less maintenance
- **Specific information** (Option 2): More detailed, more work

---

## 🧹 Removing Obsolete Diseases

If you retrained and **removed** a disease from your model:

### Option 1: Keep Everything (Recommended)
- Leave mapping entry (no harm if never predicted)
- Keep database row (historical scans may reference it)
- Users with old scans can still view details

### Option 2: Clean Up (Advanced)
```sql
-- 1. Check if any scans reference this disease
SELECT COUNT(*) FROM scan_activity WHERE disease_id = 'obsolete_disease';

-- 2. If zero, safe to delete
DELETE FROM disease_data WHERE disease_id = 'obsolete_disease';
```

```typescript
// Remove from mapping
// "Obsolete_Disease": "obsolete_disease",  ← Delete this line
```

---

## 📊 Tracking Model Versions

Keep a log in your mapping file:

```typescript
/**
 * MODEL VERSION HISTORY
 * 
 * v1.0 (Oct 2025) - Initial 38 predictions
 * v1.1 (Nov 2025) - Added tomato diseases (5 new)
 * v2.0 (Dec 2025) - Major retraining, improved accuracy
 * v2.1 (Jan 2026) - Added cucumber diseases (anthracnose, downy_mildew)
 */
```

---

## 🆘 Rollback Plan

If something goes wrong after model update:

### 1. Revert Mapping
```bash
git revert <commit-hash>
```

### 2. Use Old Model Temporarily
- Keep old model deployed
- Fix issues
- Redeploy new model

### 3. Database Rollback (if needed)
```sql
-- Delete new disease entries if they cause issues
DELETE FROM disease_data WHERE disease_id IN ('anthracnose', 'downy_mildew');
```

---

## 📝 Model Update Template

Use this template for documenting model updates:

```markdown
# Model Update: v2.1

**Date:** January 15, 2026
**Updated By:** [Your Name]

## Changes
- Added cucumber disease detection
- Improved accuracy for existing diseases
- Total predictions: 41 (was 38)

## New Predictions
- Cucumber___Anthracnose
- Cucumber___Downy_mildew
- Cucumber___healthy

## Database Updates
✅ Added `anthracnose` to disease_data
✅ Added `downy_mildew` to disease_data

## Mapping Updates
✅ Added 2 new disease mappings

## Testing Results
✅ All existing predictions still work
✅ New diseases route correctly
✅ Scan logging functional
✅ UI displays properly

## Deployment
✅ Model deployed to HuggingFace
✅ App updated and tested
✅ Database migrated

## Notes
- Old model backed up as v2.0
- All tests passed
- No breaking changes
```

---

## 🎓 Best Practices

1. **Test Locally First**: Test new model with your app before deploying to production
2. **Backup Everything**: Keep old model, old mappings, old database state
3. **Incremental Updates**: Add a few diseases at a time, not dozens
4. **Document Changes**: Keep clear records of what changed and why
5. **Version Everything**: Model version, app version, database schema version
6. **Monitor Performance**: Track prediction accuracy after updates

---

## 🔗 Related Resources

- **Disease Mapping Guide:** `docs/DISEASE_MAPPING_GUIDE.md`
- **Quick Add Disease:** `docs/QUICK_ADD_DISEASE.md`
- **Mapping File:** `lib/diseaseMapping.ts`

---

## ✅ Final Checklist

Before considering your model update complete:

- [ ] All new diseases in database
- [ ] All new diseases in mapping
- [ ] Documentation updated
- [ ] Changes committed to git
- [ ] Tested on real devices
- [ ] Backup of old model created
- [ ] Team notified of changes
- [ ] Monitoring set up for new predictions
- [ ] User-facing changes announced (if any)

---

**Remember:** The mapping system is designed to make model updates easy. The only files you need to update are:
1. `disease_data` table (Supabase)
2. `lib/diseaseMapping.ts` (one line per new disease)

Everything else happens automatically! 🚀
