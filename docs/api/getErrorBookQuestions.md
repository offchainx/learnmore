# `getErrorBookQuestions`

**Type**: Server Action

Fetches a list of questions currently in the user's error book.

## Usage

```typescript
import { getErrorBookQuestions } from '@/actions/error-book';

const result = await getErrorBookQuestions('optional-subject-uuid');
```

## Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `subjectId` | `string` (UUID) | No | Optional: Filters error book questions by subject ID. |

## Return Value

Returns a `Promise<{ success: boolean; data?: ErrorBookEntryWithQuestionAndSubject[]; error?: string }>`. `ErrorBookEntryWithQuestionAndSubject` includes the `ErrorBook` entry itself, the associated `Question` and its `Subject` through nested includes.

## Logic

1.  **Authentication**: Verifies the current user.
2.  **Filtering**: Filters by `userId` and `masteryLevel` (greater than 0). Optionally filters by `subjectId`.
3.  **Includes**: Eager loads `Question` and `Subject` details.
4.  **Ordering**: Orders results by `updatedAt` in descending order.
