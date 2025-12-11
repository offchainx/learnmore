
import { create } from 'zustand';

export type AnswerValue = string | string[] | number | null;

interface QuizState {
  currentQuestionIndex: number;
  answers: Map<number, AnswerValue>; // Map question index to answer
  timer: number;
  totalQuestions: number;
  isSubmitted: boolean;
  isSubmitting: boolean;
  score: number | null;
  results: Record<string, boolean> | null; // questionId -> isCorrect
}

interface QuizActions {
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionIndex: number, answer: AnswerValue) => void;
  setTimer: (time: number) => void;
  setTotalQuestions: (count: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
  decrementTimer: () => void;
  submitQuiz: (results: any) => void; // Update state after submission
  startSubmitting: () => void;
}

export const useQuizStore = create<QuizState & QuizActions>((set) => ({
  currentQuestionIndex: 0,
  answers: new Map(),
  timer: 0,
  totalQuestions: 0,
  isSubmitted: false,
  isSubmitting: false,
  score: null,
  results: null,

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setAnswer: (questionIndex, answer) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionIndex, answer);
      return { answers: newAnswers };
    }),
  setTimer: (time) => set({ timer: time }),
  setTotalQuestions: (count) => set({ totalQuestions: count }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.totalQuestions - 1),
    })),
  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
  resetQuiz: () =>
    set({
      currentQuestionIndex: 0,
      answers: new Map(),
      timer: 0,
      isSubmitted: false,
      isSubmitting: false,
      score: null,
      results: null,
    }),
  decrementTimer: () =>
    set((state) => ({
      timer: Math.max(0, state.timer - 1),
    })),
  
  startSubmitting: () => set({ isSubmitting: true }),
  submitQuiz: (data) => set({ 
    isSubmitted: true, 
    isSubmitting: false,
    score: data.score,
    results: data.results
  }),
}));
