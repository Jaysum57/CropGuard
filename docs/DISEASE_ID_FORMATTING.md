# Disease ID Formatting for Database

## ✅ Update Complete

Disease IDs are now **formatted before storing** in the database - underscores are removed and each word is capitalized.

## 🔄 Transformation Flow

```
Raw Model Prediction → Mapping → Formatting → Database
"Tomato___Early_blight" → "early_blight" → "Early Blight" → scan_activity
```

## 📝 Changes Made

### 1. Added Formatting Function
```typescript
const formatDiseaseId = (diseaseId: string): string => {
  return diseaseId
    .split('_')              // Split by underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');              // Join with space
};
```

### 2. Applied to Both Handlers
Updated `handlePickImage` and `handleTakePicture` to format before logging:
```typescript
const mappedDiseaseId = mapPredictionToDiseaseId(topPrediction);
const formattedDiseaseId = formatDiseaseId(mappedDiseaseId);
await logScanActivity(formattedDiseaseId, cloudinaryUrl, accuracyScore);
```

## 📊 Formatting Examples

| Mapped ID (from mapping) | Formatted ID (to database) |
|--------------------------|---------------------------|
| `early_blight` | `Early Blight` |
| `late_blight` | `Late Blight` |
| `bacterial_spot` | `Bacterial Spot` |
| `powdery_mildew` | `Powdery Mildew` |
| `citrus_greening` | `Citrus Greening` |
| `leaf_curl_virus` | `Leaf Curl Virus` |
| `spider_mite` | `Spider Mite` |
| `gray_leaf_spot` | `Gray Leaf Spot` |

## 🔍 Console Output

When scanning, you'll now see:
```
💾 [LOGGING] Raw prediction: Tomato___Early_blight
💾 [LOGGING] Mapped disease ID: early_blight
💾 [LOGGING] Formatted disease ID: Early Blight
✅ Scan logged successfully
```

## 🗄️ Database Impact

### scan_activity Table
```sql
disease_id: "Early Blight"  -- Formatted (was "early_blight")
bucket_file_path: "https://cloudinary..."
user_id: "user-uuid"
accuracy_score: 0.76
```

## ⚠️ Important Considerations

### Foreign Key Relationships

**If your `disease_data` table uses lowercase with underscores:**
```sql
-- disease_data table
disease_id: "early_blight"  -- Lowercase with underscores

-- scan_activity table
disease_id: "Early Blight"  -- Formatted (won't match!)
```

This will **break foreign key constraints** if you have them set up!

### Recommended Solutions

#### Option 1: Store Lowercase, Format on Display (Recommended)
**Keep database consistent, format only in UI:**

```typescript
// DON'T format before storing
await logScanActivity(mappedDiseaseId, cloudinaryUrl, accuracyScore);

// Format when displaying
const displayName = formatDiseaseId(diseaseId);
```

Benefits:
- ✅ Maintains foreign key relationships
- ✅ Database consistency
- ✅ Easy queries and joins

#### Option 2: Update disease_data Table to Match
**Change your disease_data table to use formatted IDs:**

```sql
UPDATE disease_data 
SET disease_id = 'Early Blight' 
WHERE disease_id = 'early_blight';

UPDATE disease_data 
SET disease_id = 'Late Blight' 
WHERE disease_id = 'late_blight';

-- Repeat for all diseases...
```

Benefits:
- ✅ Human-readable IDs in database
- ✅ No formatting needed on display
- ❌ Harder to type/query (spaces, capitals)

#### Option 3: Use Formatted IDs for New Column
**Add a display_name column:**

```sql
ALTER TABLE disease_data 
ADD COLUMN display_name VARCHAR(100);

UPDATE disease_data 
SET display_name = 'Early Blight' 
WHERE disease_id = 'early_blight';
```

Benefits:
- ✅ Best of both worlds
- ✅ Keeps foreign keys working
- ✅ Human-readable display names

## 🎯 Current Implementation

As implemented, the system now:
1. ✅ Maps raw prediction to standardized ID
2. ✅ Formats the ID (removes `_`, capitalizes)
3. ✅ Stores formatted ID in `scan_activity`

## 🔧 If You Need to Revert

To revert to storing unformatted IDs, remove the formatting step:

```typescript
// BEFORE (formatted)
const formattedDiseaseId = formatDiseaseId(mappedDiseaseId);
await logScanActivity(formattedDiseaseId, cloudinaryUrl, accuracyScore);

// AFTER (unformatted)
await logScanActivity(mappedDiseaseId, cloudinaryUrl, accuracyScore);
```

## 📋 Testing Checklist

Before deploying, verify:

- [ ] Does `disease_data` table use formatted or lowercase IDs?
- [ ] Are there foreign key constraints?
- [ ] Do existing scans use formatted or lowercase IDs?
- [ ] Can you successfully query disease details?
- [ ] Does the disease detail page work?
- [ ] Does scan history display correctly?

## 💡 Recommendation

**I recommend Option 1** - Store unformatted in database, format only for display:

```typescript
// Store unformatted
await logScanActivity(mappedDiseaseId, cloudinaryUrl, accuracyScore);

// Format when displaying in UI
<Text>{formatDiseaseId(scan.disease_id)}</Text>
```

This keeps your database normalized and maintains foreign key relationships while still showing users friendly names!

## 🎨 Display Formatting Utility

If you go with Option 1, you can export the formatting function for reuse:

```typescript
// lib/diseaseMapping.ts
export function formatDiseaseIdForDisplay(diseaseId: string): string {
  return diseaseId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

Then use it anywhere you display disease names:
```typescript
import { formatDiseaseIdForDisplay } from '../../lib/diseaseMapping';

<Text>{formatDiseaseIdForDisplay(disease.disease_id)}</Text>
```

---

## 🚨 Action Required

**Please decide:**
1. Keep formatted IDs in database (current implementation)
2. Revert to unformatted IDs in database (recommended)
3. Update disease_data table to use formatted IDs

Let me know which approach you prefer!
