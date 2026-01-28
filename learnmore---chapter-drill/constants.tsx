
import { Problem } from './types';

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 13,
    type: "Equations",
    level: 3,
    question: "Find the value of x for the following quadratic equation:",
    equation: "2x² − 5x + 3 = 0",
    options: ["x = 1, x = 1.5", "x = -1, x = -1.5", "x = 1, x = -1.5", "No real solutions"],
    correctIndex: 0,
    explanation: "Using the quadratic formula x = [-b ± sqrt(b² - 4ac)] / 2a, where a=2, b=-5, c=3. Discriminant D = 25 - 24 = 1. x = (5 ± 1) / 4. Roots are 1.5 and 1."
  },
  {
    id: 14,
    type: "Equations",
    level: 2,
    question: "Solve for x in the following equation:",
    equation: "x² - 4x + 4 = 0",
    options: ["x = 2", "x = -2", "x = 0, x = 4", "No real solutions"],
    correctIndex: 0,
    explanation: "This is a perfect square: (x - 2)² = 0, so x = 2."
  }
];

export const SIDEBAR_TOPICS = [
  { name: 'Quadratic Equations', icon: 'check_circle', active: true, locked: false },
  { name: 'Vertex Form', icon: 'radio_button_unchecked', active: false, locked: false },
  { name: 'Polynomial Functions', icon: 'lock', active: false, locked: true },
];
