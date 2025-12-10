import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionCard } from '../QuestionCard';
import { Question } from '../types';

const singleChoiceQuestion: Question = {
  id: '1',
  type: 'SINGLE_CHOICE',
  content: 'What is 1 + 1?',
  options: {
    A: '1',
    B: '2',
    C: '3'
  },
  answer: 'B',
  explanation: '1 + 1 equals 2'
};

const multiChoiceQuestion: Question = {
  id: '2',
  type: 'MULTIPLE_CHOICE',
  content: 'Select prime numbers',
  options: {
    A: '2',
    B: '4',
    C: '5'
  },
  answer: ['A', 'C'],
  explanation: '2 and 5 are prime.'
};

describe('QuestionCard', () => {
  it('renders single choice question', () => {
    render(<QuestionCard question={singleChoiceQuestion} />);
    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
    
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);

    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('B.')).toBeInTheDocument();
    expect(screen.getByText('C.')).toBeInTheDocument();
    
    // Check for option content '2' and '3' which are unique enough in this context
    // '1' is in question text too, so we skip checking it strictly or use getAll
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles single choice selection', () => {
    const handleChange = vi.fn();
    render(<QuestionCard question={singleChoiceQuestion} onAnswerChange={handleChange} />);
    
    // Find the radio button for option B (value="B")
    const radioB = screen.getAllByRole('radio')[1]; // A is index 0, B is index 1
    fireEvent.click(radioB);
    expect(handleChange).toHaveBeenCalledWith('B');
  });

  it('renders multiple choice question', () => {
    render(<QuestionCard question={multiChoiceQuestion} />);
    expect(screen.getByText('Select prime numbers')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('handles multiple choice selection', () => {
    const handleChange = vi.fn();
    render(<QuestionCard question={multiChoiceQuestion} userAnswer={[]} onAnswerChange={handleChange} />);
    
    // Find checkbox for option A
    const checkboxA = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkboxA);
    expect(handleChange).toHaveBeenCalledWith(['A']);
  });

  it('shows result correctly for correct answer', () => {
    render(
      <QuestionCard 
        question={singleChoiceQuestion} 
        userAnswer="B" 
        showResult={true} 
      />
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('1 + 1 equals 2')).toBeInTheDocument();
  });

    it('shows result correctly for incorrect answer', () => {

      render(

        <QuestionCard 

          question={singleChoiceQuestion} 

          userAnswer="A" 

          showResult={true} 

        />

      );

      expect(screen.getByText('Incorrect')).toBeInTheDocument();

    });

  

    const fillBlankQuestion: Question = {

      id: '3',

      type: 'FILL_BLANK',

      content: 'The capital of France is?',

      answer: 'Paris',

      explanation: 'Paris is the capital.'

    };

  

    it('renders fill blank question', () => {

      render(<QuestionCard question={fillBlankQuestion} />);

      expect(screen.getByText('The capital of France is?')).toBeInTheDocument();

      expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument();

    });

  

    it('handles fill blank input', () => {

      const handleChange = vi.fn();

      render(<QuestionCard question={fillBlankQuestion} onAnswerChange={handleChange} />);

      

      const input = screen.getByPlaceholderText('Type your answer here...');

      fireEvent.change(input, { target: { value: 'Paris' } });

      expect(handleChange).toHaveBeenCalledWith('Paris');

    });

  

    it('shows result correctly for fill blank correct answer', () => {

      render(

          <QuestionCard 

              question={fillBlankQuestion} 

              userAnswer="Paris" 

              showResult={true} 

          />

      );

      expect(screen.getByText('Correct')).toBeInTheDocument();

    });

  });

  