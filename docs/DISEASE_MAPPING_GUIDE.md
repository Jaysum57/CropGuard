# Disease Mapping System Guide

## Overview

The disease mapping system decouples your ML model's prediction names from your database disease IDs. This allows you to:
- Train your model with detailed plant-specific names
- Store generalized disease information in your database
- Easily add new diseases without breaking existing code
- Handle multiple prediction variations that map to the same disease

## Architecture

```
ML Model Prediction → Disease Mapping → Database Disease ID → Detail Page
"Apple___Apple_scab" → mapPredictionToDiseaseId() → "scab" → /details/scab
```

## Files Involved

1. **`lib/diseaseMapping.ts`** - Central mapping configuration
2. **`app/(tabs)/scan.tsx`** - Uses mapping for routing
3. **`supabase: disease_data table`** - Contains disease information
4. **`app/details/[diseaseId].tsx`** - Disease detail page

## How It Works

### 1. Model Predictions
Your model returns predictions like:
```typescript
{
  "Apple___Apple_scab": 0.95,
  "Apple___healthy": 0.03,
  "Tomato___Early_blight": 0.02
}
```

### 2. Mapping Extraction
The system extracts just the disease portion:
```typescript
"Apple___Apple_scab" → "Apple_scab"
"Tomato___healthy" → "healthy"
```

### 3. Database Lookup
Maps to your database disease_id:
```typescript
"Apple_scab" → "scab"
"Early_blight" → "early_blight"
"healthy" → null (no disease)
```

### 4. Routing
Navigates to detail page:
```typescript
diseaseId: "scab" → router.push("/details/scab")
```

## Adding a New Disease

### Scenario: Your model now detects "Cucumber___Downy_mildew"

#### Step 1: Add to Supabase Database
Add a new row to the `disease_data` table:

```sql
INSERT INTO disease_data (disease_id, disease_name, description, symptoms, treatment, prevention)
VALUES (
  'downy_mildew',
  'Downy Mildew',
  'A fungal disease affecting cucurbits...',
  '["Yellow patches on leaves", "White fuzzy growth on undersides"]',
  '["Apply fungicide", "Remove infected leaves"]',
  '["Improve air circulation", "Avoid overhead watering"]'
);
```

#### Step 2: Update Disease Mapping
Open `lib/diseaseMapping.ts` and add to `DISEASE_MAPPING`:

```typescript
export const DISEASE_MAPPING: DiseaseMapping = {
  // ... existing mappings ...
  
  // Cucumber
  "Downy_mildew": "downy_mildew",
  
  // ... rest of mappings ...
};
```

#### Step 3: Test
That's it! The system will now:
- ✅ Extract "Downy_mildew" from "Cucumber___Downy_mildew"
- ✅ Map it to "downy_mildew" disease ID
- ✅ Make the prediction clickable
- ✅ Route to `/details/downy_mildew`
- ✅ Log scans correctly

## Handling Similar Diseases

If your model predicts multiple variations that should map to the same disease:

```typescript
export const DISEASE_MAPPING: DiseaseMapping = {
  // Different model predictions, same disease
  "Apple_scab": "scab",
  "Pear_scab": "scab",
  "Cherry_scab": "scab",
  
  // Similar diseases grouped together
  "Northern_Leaf_Blight": "late_blight",
  "Late_blight": "late_blight",
  "Potato_blight": "late_blight",
};
```

## Handling Healthy Plants

Healthy predictions return `null` as the disease ID:

```typescript
"healthy": null,
"Apple___healthy": null (extracts to "healthy" → maps to null)
```

The UI shows a special message instead of routing.

## Troubleshooting

### Problem: Prediction not routing
**Solution:** Check if the disease portion is in `DISEASE_MAPPING`

1. Log the prediction name:
   ```typescript
   console.log("Top prediction:", topPlant);
   ```

2. Check what disease portion is extracted:
   ```typescript
   import { extractDiseaseName } from "../../lib/diseaseMapping";
   console.log("Disease name:", extractDiseaseName(topPlant));
   ```

3. Verify it's in the mapping:
   ```typescript
   import { mapPredictionToDiseaseId } from "../../lib/diseaseMapping";
   console.log("Disease ID:", mapPredictionToDiseaseId(topPlant));
   ```

### Problem: New disease not working
**Checklist:**
- ✅ Added to Supabase `disease_data` table?
- ✅ disease_id matches exactly in mapping?
- ✅ Mapping key matches model's disease portion (after `___`)?
- ✅ No typos in disease_id?

### Problem: Wrong disease details shown
**Solution:** Check your mapping entry points to correct disease_id

```typescript
// WRONG - typo in disease_id
"Powdery_mildew": "powdery_mildrew", // mildrew ❌

// CORRECT
"Powdery_mildew": "powdery_mildew", // mildew ✅
```

## Maintenance Best Practices

### 1. Keep Mapping Documented
Add comments for grouped diseases:
```typescript
// Rust diseases - all map to generic "rust" entry
"Cedar_apple_rust": "rust",
"Common_rust_": "rust",
```

### 2. Sync with Model Updates
When retraining your model:
- Note new disease names in output
- Update mapping before deploying
- Test routing for new diseases

### 3. Centralize Disease List
Keep a reference list in comments:
```typescript
/**
 * Current database disease_ids:
 * - bacterial_spot
 * - black_rot
 * - citrus_greening
 * ... (list all)
 */
```

### 4. Version Control
When adding diseases, commit mapping and database changes together:
```bash
git add lib/diseaseMapping.ts
git commit -m "Add downy_mildew disease mapping"
```

## API Reference

### `extractDiseaseName(predictionName: string): string`
Extracts disease portion from model prediction.

```typescript
extractDiseaseName("Apple___Apple_scab") // → "Apple_scab"
```

### `mapPredictionToDiseaseId(predictionName: string): string | null`
Maps prediction to database disease ID.

```typescript
mapPredictionToDiseaseId("Apple___Apple_scab") // → "scab"
mapPredictionToDiseaseId("Apple___healthy") // → null
```

### `isHealthyPrediction(predictionName: string): boolean`
Checks if prediction indicates healthy plant.

```typescript
isHealthyPrediction("Apple___healthy") // → true
isHealthyPrediction("Apple___Apple_scab") // → false
```

### `getDisplayName(predictionName: string): string`
Formats prediction for display in UI.

```typescript
getDisplayName("Apple___Apple_scab") // → "Apple - Apple Scab"
```

### `getRoutingInfo(predictionName: string)`
Complete routing information for UI.

```typescript
getRoutingInfo("Apple___Apple_scab")
// → {
//     diseaseId: "scab",
//     isRoutable: true,
//     displayName: "Apple - Apple Scab"
//   }
```

## Example: Complete Workflow

### Model Training
Train model with new "Zucchini___Blossom_end_rot" disease.

### Database Update
```sql
INSERT INTO disease_data (disease_id, ...) 
VALUES ('blossom_end_rot', ...);
```

### Mapping Update
```typescript
// lib/diseaseMapping.ts
export const DISEASE_MAPPING: DiseaseMapping = {
  // ... existing ...
  "Blossom_end_rot": "blossom_end_rot",
};
```

### Automatic Behavior
User scans plant → Model predicts → System:
1. ✅ Extracts "Blossom_end_rot"
2. ✅ Maps to "blossom_end_rot"
3. ✅ Shows as clickable result
4. ✅ Routes to `/details/blossom_end_rot`
5. ✅ Displays disease information from database

## Migration Notes

### From Old System
If you had hardcoded disease names:
```typescript
// OLD - hardcoded
if (topPlant.includes("scab")) {
  router.push("/details/scab");
}

// NEW - automatic via mapping
const { diseaseId, isRoutable } = getRoutingInfo(topPlant);
if (isRoutable) {
  router.push(`/details/${diseaseId}`);
}
```

### Benefits of New System
- ✅ No conditional logic needed
- ✅ Centralized configuration
- ✅ Easy to add new diseases
- ✅ Consistent formatting
- ✅ Type-safe
- ✅ Maintainable

## Future Enhancements

### Potential Additions
1. **Severity Levels**: Map confidence to severity
2. **Related Diseases**: Group similar diseases
3. **Localization**: Multi-language disease names
4. **Aliases**: Multiple names for same disease
5. **Categories**: Group by plant type or disease type

### Example Enhancement
```typescript
export const DISEASE_METADATA = {
  scab: {
    severity: "moderate",
    category: "fungal",
    relatedDiseases: ["rust", "powdery_mildew"],
    aliases: ["apple_scab", "pear_scab"],
  },
};
```

---

**Questions?** Check the mapping file comments or consult this guide.
