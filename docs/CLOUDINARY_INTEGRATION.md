# Cloudinary Integration for Image Uploads

## Overview
This document describes the implementation of Cloudinary integration for optimized image uploads in the CropGuard app.

## Changes Made

### 1. Replaced Supabase Storage with Cloudinary
- **Old**: Images were uploaded to Supabase Storage bucket `plants_scanned`
- **New**: Images are uploaded to Cloudinary with automatic optimization

### 2. Image Optimization
Cloudinary automatically handles:
- **Compression**: Uses `quality: auto:good` for intelligent compression
- **Format Selection**: Uses `fetch_format: auto` to serve optimal format (WebP, JPEG, etc.)
- **Storage**: Images are organized in `scans/{user_id}/` folders

### 3. Database Schema
The `scan_activity` table continues to use the `bucket_file_path` column, but now it stores:
- **Old**: Supabase bucket file path (e.g., `user_id/timestamp.jpg`)
- **New**: Cloudinary secure URL (e.g., `https://res.cloudinary.com/cropguard/image/upload/...`)

### 4. Configuration
Uses environment variables from `.env`:
```
CLOUDINARY_CLOUD_NAME="cropguard"
CLOUDINARY_UPLOAD_PRESET="CropGuard"
```

## Benefits

### 1. No Additional Packages Required
- Uses native `fetch` API and `FormData`
- No npm packages needed for Cloudinary integration

### 2. Automatic Optimization
- Images are compressed automatically by Cloudinary
- Optimal format selection (WebP when supported)
- Reduces bandwidth and storage costs

### 3. Better Performance
- CDN delivery for faster image loading
- Automatic responsive images
- Built-in image transformations available

### 4. Simplified Upload Process
- Single API call to Cloudinary
- No need for ArrayBuffer conversion
- Better error handling

## Implementation Details

### Upload Function
```typescript
const uploadToCloudinary = async (uri: string): Promise<string | null>
```

**Flow:**
1. Check user authentication
2. Create FormData with image and metadata
3. Add optimization parameters (quality, format)
4. Upload to Cloudinary API
5. Return secure HTTPS URL

**Parameters sent to Cloudinary:**
- `file`: The image data
- `upload_preset`: "CropGuard" (must be configured in Cloudinary dashboard)
- `folder`: `scans/{user_id}` for organization
- `quality`: `auto:good` for smart compression
- `fetch_format`: `auto` for optimal format selection

### Logging Function
```typescript
const logScanActivity = async (diseaseId: string, cloudinaryUrl: string, accuracyScore: number)
```

**Changes:**
- Parameter renamed from `bucketFilePath` to `cloudinaryUrl` for clarity
- Still inserts into same database column (`bucket_file_path`)
- No database schema changes required

## Usage

### Camera Capture
```typescript
const cloudinaryUrl = await uploadToCloudinary(photoUriFromCamera);
if (cloudinaryUrl) {
  await logScanActivity(topDiseaseId, cloudinaryUrl, accuracyScore);
}
```

### Gallery Selection
```typescript
const cloudinaryUrl = await uploadToCloudinary(assetUri);
if (cloudinaryUrl) {
  await logScanActivity(topDiseaseId, cloudinaryUrl, accuracyScore);
}
```

## Cloudinary Dashboard Setup

Ensure the following is configured in your Cloudinary account:

1. **Upload Preset**: Create an unsigned upload preset named "CropGuard"
   - Settings → Upload → Upload presets
   - Mode: Unsigned
   - Folder: Can be dynamic (we set it in the upload)

2. **Transformations** (Optional):
   - Can add default transformations to the preset
   - Or use transformation URLs when displaying images

## Error Handling

The implementation includes comprehensive error handling:
- Authentication checks before upload
- Network error handling
- User-friendly error messages via Alert
- Console logging for debugging

## Future Enhancements

Possible improvements:
1. Add image transformations (resize, crop) before upload
2. Implement upload progress tracking
3. Add retry logic for failed uploads
4. Implement image caching for offline support
5. Add thumbnail generation for list views

## Migration Notes

**No Database Migration Required:**
- The `bucket_file_path` column continues to store string values
- Old entries have Supabase paths, new entries have Cloudinary URLs
- Both work for display purposes

**Breaking Changes:**
- None - the change is transparent to other parts of the app
- Other screens reading from `scan_activity` will work unchanged
