
import { getErrorWiperSession } from '../src/actions/practice/error-book';

async function main() {
  console.log('--- Debugging Error Wiper Session Data ---');
  const session = await getErrorWiperSession();

  if (!session.success) {
    console.error('Failed to fetch session:', session.error);
    return;
  }

  if (!session.data || session.data.length === 0) {
    console.log('Session is empty (All Clear).');
    return;
  }

  console.log(`Fetched ${session.data.length} entries.`);

  // Check the first entry specifically for 'options' structure
  const firstEntry = session.data[0];
  console.log('First Entry ID:', firstEntry.id);
  console.log('Question ID:', firstEntry.question.id);
  console.log('Raw Options Type:', typeof firstEntry.question.options);
  console.log('Raw Options Value:', JSON.stringify(firstEntry.question.options, null, 2));

  // Simulate the mapping from page.tsx
  try {
    const formatted = session.data.map((entry) => ({
        id: entry.id,
        questionId: entry.questionId,
        masteryLevel: entry.masteryLevel,
        question: {
          id: entry.question.id,
          type: entry.question.type,
          content: entry.question.content,
          options: entry.question.options,
          answer: entry.question.answer,
          explanation: entry.question.explanation,
        }
      }));
      console.log('Mapping successful.');
      
      // Test Object.entries on the first item
      const opts = formatted[0].question.options;
      if (opts) {
          console.log('Testing Object.entries(options)...');
          // @ts-ignore
          const entries = Object.entries(opts);
          console.log('Entries:', entries);
      } else {
          console.log('Options is null/undefined.');
      }

  } catch (error) {
      console.error('CRITICAL: Mapping or Object.entries failed:', error);
  }
}

main();
