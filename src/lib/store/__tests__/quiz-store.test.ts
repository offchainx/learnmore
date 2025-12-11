
import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '../quiz-store';

describe('quiz-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useQuizStore.getState().resetQuiz();
  });

  it('should initialize with default values', () => {
    const state = useQuizStore.getState();
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers.size).toBe(0);
    expect(state.timer).toBe(0);
    expect(state.totalQuestions).toBe(0);
  });

  it('should set total questions', () => {
    useQuizStore.getState().setTotalQuestions(10);
    expect(useQuizStore.getState().totalQuestions).toBe(10);
  });

  it('should handle nextQuestion navigation', () => {
    useQuizStore.getState().setTotalQuestions(3);
    
    // 0 -> 1
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(1);

    // 1 -> 2
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(2);

    // 2 -> 2 (should not exceed bounds)
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(2);
  });

  it('should handle prevQuestion navigation', () => {
    useQuizStore.getState().setTotalQuestions(3);
    useQuizStore.getState().setCurrentQuestionIndex(2);

    // 2 -> 1
    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(1);

    // 1 -> 0
    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(0);

    // 0 -> 0 (should not go below 0)
    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
  });

  it('should store answers', () => {
    useQuizStore.getState().setAnswer(0, 'A');
    useQuizStore.getState().setAnswer(1, ['B', 'C']);

    const answers = useQuizStore.getState().answers;
    expect(answers.get(0)).toBe('A');
    expect(answers.get(1)).toEqual(['B', 'C']);
  });

  it('should reset quiz state', () => {
    useQuizStore.getState().setTotalQuestions(5);
    useQuizStore.getState().setCurrentQuestionIndex(3);
    useQuizStore.getState().setAnswer(0, 'A');
    useQuizStore.getState().setTimer(100);

    useQuizStore.getState().resetQuiz();

    const state = useQuizStore.getState();
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers.size).toBe(0);
    expect(state.timer).toBe(0);
    expect(state.totalQuestions).toBe(5); // totalQuestions should not be reset
  });

  it('should decrement timer', () => {
    useQuizStore.getState().setTimer(10);
    useQuizStore.getState().decrementTimer();
    expect(useQuizStore.getState().timer).toBe(9);

    useQuizStore.getState().setTimer(0);
    useQuizStore.getState().decrementTimer();
    expect(useQuizStore.getState().timer).toBe(0); // Should not go below 0
  });
});
