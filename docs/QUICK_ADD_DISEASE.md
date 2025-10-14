# Quick Reference: Adding New Diseases

## ⚡ Fast Track (3 Steps)

### 1️⃣ Add to Supabase
```sql
INSERT INTO disease_data (
  disease_id,           -- Use snake_case, e.g., 'downy_mildew'
  disease_name,         -- Display name, e.g., 'Downy Mildew'
  description,
  symptoms,
  treatment,
  prevention
) VALUES (...);
```

### 2️⃣ Update Mapping
File: `lib/diseaseMapping.ts`

```typescript
export const DISEASE_MAPPING: DiseaseMapping = {
  // ... existing mappings ...
  
  // Add your new disease here:
  "Your_Disease_Name": "your_disease_id",  // Extract from model prediction
  
  // ... rest of mappings ...
};
```

### 3️⃣ Deploy & Test
✅ That's it! The system handles everything else automatically.

---

## 📋 Checklist

Before adding a new disease, ensure:

- [ ] Model is trained and predicting the new disease
- [ ] You know the exact prediction name (e.g., `"Cucumber___Downy_mildew"`)
- [ ] Disease info is ready (symptoms, treatment, prevention)

---

## 🔍 Finding the Disease Name

If you're not sure what the model outputs:

1. **Test with scan:**
   - Scan a plant with the new disease
   - Check the results modal
   - Note the full prediction name

2. **Or check model training data:**
   - Look at your training labels
   - Find the exact format used

3. **Format is always:**
   ```
   PlantName___DiseaseName
   ```

---

## 📝 Naming Conventions

### Database `disease_id` (snake_case)
```
✅ downy_mildew
✅ early_blight
✅ citrus_greening
❌ Downy-Mildew
❌ early blight
```

### Model Prediction (after `___`)
```
✅ Downy_mildew
✅ Early_blight
✅ Haunglongbing_(Citrus_greening)
```

### Mapping Key (extract disease portion only)
```typescript
// From: "Cucumber___Downy_mildew"
// Use: "Downy_mildew" as key

"Downy_mildew": "downy_mildew",
```

---

## 💡 Common Patterns

### Pattern 1: One-to-One Mapping
```typescript
// Model predicts "Rust", database has "rust"
"Rust": "rust",
```

### Pattern 2: Many-to-One Mapping
```typescript
// Multiple predictions → same disease
"Apple_scab": "scab",
"Pear_scab": "scab",
"Cherry_scab": "scab",
```

### Pattern 3: Complex Names
```typescript
// Handle parentheses and special formatting
"Haunglongbing_(Citrus_greening)": "citrus_greening",
"Esca_(Black_Measles)": "black_rot",
```

### Pattern 4: Similar Diseases
```typescript
// Group similar diseases under one category
"Northern_Leaf_Blight": "late_blight",
"Southern_Leaf_Blight": "late_blight",
"Late_blight": "late_blight",
```

---

## 🚨 Common Mistakes

### ❌ Wrong: Using full prediction name as key
```typescript
// WRONG - includes plant name
"Apple___Apple_scab": "scab",  // ❌
```

### ✅ Right: Using only disease portion
```typescript
// CORRECT - disease only
"Apple_scab": "scab",  // ✅
```

---

### ❌ Wrong: Typo in disease_id
```typescript
// WRONG - typo in value
"Powdery_mildew": "powdery_mildrew",  // ❌ mildrew
```

### ✅ Right: Exact match with database
```typescript
// CORRECT - matches database exactly
"Powdery_mildew": "powdery_mildew",  // ✅
```

---

### ❌ Wrong: Forgetting to update database first
```typescript
// WRONG - mapping added but no database entry
"New_Disease": "new_disease",  // ❌ doesn't exist in DB
```

### ✅ Right: Database first, then mapping
```sql
-- Step 1: Add to database
INSERT INTO disease_data (disease_id, ...) VALUES ('new_disease', ...);
```
```typescript
// Step 2: Add mapping
"New_Disease": "new_disease",  // ✅
```

---

## 🧪 Testing New Diseases

After adding a new disease:

1. **Test Scan:**
   ```
   - Scan an image with the new disease
   - Verify prediction appears in results
   - Check if name is formatted correctly
   ```

2. **Test Routing:**
   ```
   - Tap on the top prediction
   - Should navigate to disease detail page
   - Page should show correct disease info
   ```

3. **Test Logging:**
   ```
   - Check scan_activity table
   - Verify disease_id was logged correctly
   - Confirm user_id and timestamp are present
   ```

---

## 🔗 Quick Links

- **Full Guide:** `docs/DISEASE_MAPPING_GUIDE.md`
- **Mapping File:** `lib/diseaseMapping.ts`
- **Scan Screen:** `app/(tabs)/scan.tsx`
- **Detail Page:** `app/details/[diseaseId].tsx`

---

## 🆘 Troubleshooting

### Prediction not clickable?
→ Check if mapping exists in `DISEASE_MAPPING`

### Wrong disease details shown?
→ Verify `disease_id` matches database exactly

### "No Details Available" message?
→ Disease is in mapping but not in database

### Scan not logged?
→ Check user authentication and RLS policies

---

## 📞 Need Help?

1. Check full guide: `docs/DISEASE_MAPPING_GUIDE.md`
2. Review existing mappings: `lib/diseaseMapping.ts`
3. Test with debug logs:
   ```typescript
   import { getRoutingInfo } from '../../lib/diseaseMapping';
   console.log(getRoutingInfo("Your___Prediction"));
   ```
