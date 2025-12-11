# `submitQuiz`

**Type**: Server Action

Submits a user's quiz attempt for grading and recording.

## Usage

```typescript
import { submitQuiz } from '@/actions/quiz';

const result = await submitQuiz({
  chapterId: "optional-chapter-uuid",
  answers: [
    { questionId: "uuid-1", userAnswer: "A" },
    { questionId: "uuid-2", userAnswer: ["B", "C"] }
  ],
  duration: 120 // seconds
});
```

## Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | `Object` | Yes | The submission payload. |

### Payload (`data`)

- `answers`: Array of objects (Required).
    - `questionId`: `string` (UUID)
    - `userAnswer`: `string | string[] | number | null`
- `chapterId`: `string` (UUID) (Optional) - Context for the quiz.
- `duration`: `number` (Optional) - Time taken in seconds.

## Return Value

Returns a `Promise<QuizSubmissionResult>`:

```typescript
type QuizSubmissionResult = {
  success: boolean;
  score?: number; // 0-100
  totalQuestions?: number;
  correctCount?: number;
  results?: Record<string, boolean>; // Map of questionId -> isCorrect
  error?: string;
};
```

## Logic

1.  **Authentication**: Verifies the current user.
2.  **Validation**: Zod schema validation for input.
3.  **Grading**: Fetches questions from DB and compares answers.
    - Single Choice: Strict equality.
    - Multiple Choice: Array comparison (order independent).
    - Fill Blank: Strict string match (or array inclusion).
4.  **Persistence**:
    - Creates `ExamRecord` with summary stats.
    - Creates `UserAttempt` records for each question.
    - Executes in a Prisma transaction.
