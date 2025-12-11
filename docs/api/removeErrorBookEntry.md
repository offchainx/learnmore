# `removeErrorBookEntry`

**Type**: Server Action

Removes a specific entry from the user's error book.

## Usage

```typescript
import { removeErrorBookEntry } from '@/actions/error-book';

const result = await removeErrorBookEntry('error-book-entry-uuid');
```

## Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `errorBookEntryId` | `string` (UUID) | Yes | The ID of the error book entry to remove. |

## Return Value

Returns a `Promise<{ success: boolean; error?: string }>`. A successful removal means `success: true`.

## Logic

1.  **Authentication**: Verifies the current user.
2.  **Authorization**: Ensures only the owner can delete their own error book entries.
3.  **Deletion**: Deletes the specified `ErrorBook` entry.
