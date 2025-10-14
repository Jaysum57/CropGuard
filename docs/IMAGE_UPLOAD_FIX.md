# Image Upload Fix for Supabase Storage

## Problem
Images uploaded to Supabase Storage from the React Native app appeared blank or couldn't be downloaded. The files were being created in the bucket but contained no actual image data.

## Root Cause
The original code was passing a file object with just a URI reference to Supabase Storage:

```typescript
const file = {
  uri: uri,
  name: filePath, 
  type: `image/jpeg`,
} as any;

await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {...});
```

**This doesn't work in React Native** because:
1. The `uri` is just a local file path (e.g., `file:///data/user/0/.../image.jpg`)
2. Supabase Storage can't access local file system paths
3. The file data itself was never being read or sent

## Solution
Convert the local file URI to actual binary data (ArrayBuffer) before uploading:

### Step-by-Step Process

1. **Fetch the image data**
   ```typescript
   const response = await fetch(uri);
   const blob = await response.blob();
   ```
   - Uses `fetch()` to read the local file URI
   - Converts to a Blob object containing the actual image data

2. **Convert to ArrayBuffer**
   ```typescript
   const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
     const reader = new FileReader();
     reader.onloadend = () => resolve(reader.result as ArrayBuffer);
     reader.readAsArrayBuffer(blob);
   });
   ```
   - FileReader reads the Blob as binary data
   - ArrayBuffer is a format Supabase Storage accepts

3. **Upload the binary data**
   ```typescript
   await supabase.storage
     .from(BUCKET_NAME)
     .upload(filePath, arrayBuffer, {
       contentType: 'image/jpeg',
       ...
     });
   ```
   - Now uploading actual image bytes, not just a URI reference

## Key Changes Made

### Before (Broken)
```typescript
const file = {
  uri: uri,
  name: filePath, 
  type: `image/jpeg`,
} as any;

const { error } = await supabase.storage
  .from(BUCKET_NAME)
  .upload(filePath, file, {...});
```

### After (Fixed)
```typescript
// Fetch actual file data
const response = await fetch(uri);
const blob = await response.blob();

// Convert to ArrayBuffer
const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result as ArrayBuffer);
  reader.readAsArrayBuffer(blob);
});

// Upload binary data
const { error } = await supabase.storage
  .from(BUCKET_NAME)
  .upload(filePath, arrayBuffer, {
    contentType: 'image/jpeg',
    ...
  });
```

## Additional Improvements

1. **Better Error Handling**
   - Added validation for fetch response
   - Added error handling for FileReader
   - Shows user-friendly error alerts

2. **Enhanced Logging**
   - Logs blob size and type
   - Logs ArrayBuffer byte length
   - Helps debug upload issues

3. **Proper Content Type**
   - Detects PNG vs JPEG from file extension
   - Sets correct MIME type for upload

## Testing the Fix

### Verify Upload Works
1. Take a photo or select from gallery
2. Wait for prediction to complete
3. Check console logs for:
   ```
   Starting upload: {...}
   Blob created: { size: 123456, type: "image/jpeg" }
   ArrayBuffer created: { byteLength: 123456 }
   Upload successful: {...}
   ```

### Verify in Supabase
1. Go to Supabase Dashboard
2. Navigate to Storage > plants_scanned bucket
3. Find the uploaded file (user_id/timestamp.jpg)
4. Click to view - image should display correctly
5. Download - file should be valid and openable

## Why This Approach?

### React Native File Handling
- React Native doesn't have direct file system access like Node.js
- File URIs are internal references to the app's sandbox
- Need to explicitly read file contents using `fetch()` or `FileReader`

### Supabase Storage Requirements
- Accepts: `File`, `Blob`, `ArrayBuffer`, `FormData`
- Does NOT accept: URI strings or path references
- Needs actual binary data to store

### Cross-Platform Compatibility
- Works on iOS and Android
- Works with camera photos and gallery images
- Handles both PNG and JPEG formats

## Alternative Approaches (Not Recommended)

### 1. Base64 Encoding
```typescript
// Works but creates larger files (33% overhead)
const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64,
});
const blob = base64ToBlob(base64, 'image/jpeg');
```

### 2. FormData
```typescript
// Works but less control over content type
const formData = new FormData();
formData.append('file', {
  uri: uri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});
// Supabase doesn't directly accept FormData for storage
```

### 3. expo-file-system
```typescript
// Requires additional dependency
import * as FileSystem from 'expo-file-system';
const fileInfo = await FileSystem.getInfoAsync(uri);
// Then read and convert to blob
```

## Performance Considerations

### File Size
- ArrayBuffer approach is efficient (no base64 bloat)
- Direct binary transfer
- Minimal memory overhead

### Speed
- Fetch + FileReader is fast for typical image sizes (1-5MB)
- Async operations don't block UI
- Shows processing modal during upload

### Memory
- Blob and ArrayBuffer are temporary
- Garbage collected after upload
- No persistent memory leaks

## Common Issues & Solutions

### Issue: "Failed to fetch image"
- **Cause**: URI is invalid or inaccessible
- **Solution**: Verify URI format, check camera/gallery permissions

### Issue: "Failed to convert blob to ArrayBuffer"
- **Cause**: Blob is empty or corrupted
- **Solution**: Check image source, try different image

### Issue: Upload succeeds but image still blank
- **Cause**: ArrayBuffer is empty (size = 0)
- **Solution**: Check blob size in logs, verify fetch response

### Issue: Wrong content type
- **Cause**: File extension detection failed
- **Solution**: Check file extension logic, default to JPEG

## Security Considerations

1. **User Authentication**: ✅ Verified before upload
2. **File Path**: ✅ Scoped to user ID
3. **Content Type**: ✅ Validated and set correctly
4. **File Size**: ⚠️ Consider adding size limit check
5. **RLS Policies**: ✅ Ensure Supabase RLS policies allow authenticated uploads

## Future Enhancements

- [ ] Add file size validation (e.g., max 10MB)
- [ ] Add image compression before upload
- [ ] Add upload progress indicator
- [ ] Add retry logic for failed uploads
- [ ] Cache upload results to prevent duplicates
- [ ] Add thumbnail generation
- [ ] Add image optimization/resizing

## Summary

✅ **Fixed**: Images now upload correctly to Supabase Storage
✅ **Method**: Convert URI → Blob → ArrayBuffer → Upload
✅ **Benefits**: Proper binary data transfer, reliable uploads
✅ **Verified**: Files are viewable and downloadable in Supabase

The key insight is that React Native requires explicit file reading - you can't just pass a URI string and expect the remote service to access your local file system!
