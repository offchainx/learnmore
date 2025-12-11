# Storage Actions API Documentation

## Overview

The storage actions module provides server-side functionality for handling file storage operations, specifically for images and video content.

## Server Actions

### `uploadImage(formData: FormData): Promise<UploadImageResult>`

Uploads an image file to Supabase Storage (community-posts bucket).

**Authentication**: Required (must be logged in)

**Parameters**:
- `formData` (FormData): Form data containing the file
  - `file` (File): Image file to upload

**Validation**:
- File type: Must be an image (`image/*`)
- File size: Max 5MB
- User authentication: Required

**Returns**:
```typescript
interface UploadImageResult {
  success: boolean
  url?: string      // Public URL of uploaded image (if success)
  error?: string    // Error message (if failed)
}
```

**Example Usage**:
```typescript
'use client'

async function handleUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const result = await uploadImage(formData)

  if (result.success) {
    console.log('Image uploaded:', result.url)
  } else {
    console.error('Upload failed:', result.error)
  }
}
```

**Error Codes**:
- `"User not authenticated."` - User is not logged in
- `"No file provided."` - No file in form data
- `"Only image files are allowed."` - File is not an image
- `"File size exceeds 5MB limit."` - File too large
- Supabase error messages (various)

---

### `getSignedVideoUrl(lessonId: string): Promise<GetVideoUrlResult>`

Retrieves a signed URL for accessing video content associated with a lesson.

**Authentication**: Required (must be logged in)

**Parameters**:
- `lessonId` (string): UUID of the lesson

**Returns**:
```typescript
interface GetVideoUrlResult {
  success: boolean
  url?: string      // Signed URL or external URL (if success)
  error?: string    // Error message (if failed)
}
```

**Behavior**:
1. **External URLs**: If lesson's `videoUrl` starts with `http`, returns it directly
2. **Supabase Storage**: If lesson's `videoUrl` is a storage path, generates a signed URL with 1-hour validity
3. **Not Found**: If lesson or videoUrl doesn't exist, returns error

**Example Usage**:
```typescript
// Server Component
import { getSignedVideoUrl } from '@/actions/storage'
import { VideoPlayer } from '@/components/business/VideoPlayer'

export default async function LessonPage({ params }) {
  const result = await getSignedVideoUrl(params.lessonId)

  if (!result.success) {
    return <div>Video not available</div>
  }

  return <VideoPlayer url={result.url} />
}
```

**Security**:
- Signed URLs expire after 1 hour (3600 seconds)
- Authentication required (prevents unauthorized access)
- URLs are single-use and time-limited

**Error Codes**:
- `"Unauthorized"` - User not authenticated
- `"Video not found"` - Lesson doesn't exist or has no videoUrl
- Supabase error messages (e.g., file not found in storage)

---

## Storage Buckets

### `community-posts`
- **Purpose**: User-uploaded images for forum posts
- **Public**: Yes (public URLs)
- **Path Structure**: `posts/{userId}/{uuid}.{extension}`
- **Allowed Types**: Images only
- **Size Limit**: 5MB

### `videos`
- **Purpose**: Lesson video content
- **Public**: No (requires signed URLs)
- **Path Structure**: `lessons/{filename}.mp4`
- **Allowed Types**: `video/mp4`, `video/webm`
- **Size Limit**: 50MB (configurable)
- **Access**: Via signed URLs (1-hour validity)

---

## Error Handling Best Practices

```typescript
// Always check success before using result
const result = await getSignedVideoUrl(lessonId)

if (!result.success) {
  // Log error for debugging
  console.error('Video URL fetch failed:', result.error)

  // Show user-friendly error
  return <ErrorMessage>Video temporarily unavailable</ErrorMessage>
}

// Use the URL
return <VideoPlayer url={result.url} />
```

---

## Security Considerations

1. **Authentication**: All actions verify user authentication
2. **File Validation**:
   - File types are validated server-side
   - File sizes are checked before upload
3. **Signed URLs**: Video URLs expire after 1 hour
4. **Path Isolation**: User files stored in user-specific paths
5. **No Direct Access**: Videos cannot be accessed without authentication

---

## Performance Notes

- **Upload Speed**: Depends on file size and network
- **Signed URL Generation**: < 100ms (typically)
- **Caching**: Signed URLs can be cached for up to 1 hour
- **Retry Logic**: Not implemented (consider adding for production)

---

## Migration Path

**Current (MVP)**: Direct Supabase Storage integration
**Future (V2.0+)**: Consider CDN integration for better performance
- CloudFront or Cloudflare for video streaming
- HLS/DASH for adaptive bitrate
- Edge caching for faster access

---

## Related Components

- [`VideoPlayer`](/src/components/business/VideoPlayer.tsx) - Frontend video player component
- [`LessonPage`](/src/app/course/[subjectId]/[lessonId]/page.tsx) - Example usage

---

**Last Updated**: 2025-12-11
**Story**: Story-008 Video Player Integration
