
'use client';

import { useState, useEffect } from 'react';
import { QuestionCard, Question } from '@/components/business/question';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, XCircle, Play, CheckCircle2 } from 'lucide-react';
import { getErrorBookQuestions, removeErrorBookEntry, updateErrorBookMastery } from '@/actions/error-book';
import { Subject } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllSubjects } from '@/actions/subject';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ErrorBookQuestion extends Question {
  errorBookEntryId: string;
}

export default function ErrorBookPageClient() {
  const { toast } = useToast();
  const [errorQuestions, setErrorQuestions] = useState<ErrorBookQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Practice Mode State
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({}); // questionId -> isCorrect

  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await getAllSubjects();
      if (res.success && res.data) {
        setSubjects(res.data);
      } else {
        console.error(res.error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const result = await getErrorBookQuestions(selectedSubject);
      if (result.success && result.data) {
        // Map Prisma data to client-side Question interface, adding errorBookEntryId
        const formattedQuestions: ErrorBookQuestion[] = result.data.map(entry => ({
          errorBookEntryId: entry.id,
          id: entry.question.id,
          type: entry.question.type,
          content: entry.question.content,
          options: entry.question.options as Record<string, string> | null,
          answer: entry.question.answer as string | string[] | null,
          explanation: entry.question.explanation,
        }));
        setErrorQuestions(formattedQuestions);
        setCurrentQuestionIndex(0); // Reset index on new data
        setUserAnswers({});
        setSubmittedQuestions({});
      } else {
        console.error(result.error);
        setErrorQuestions([]);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [selectedSubject, refetchTrigger]);

  const handleRemoveError = async (errorBookEntryId: string) => {
    const result = await removeErrorBookEntry(errorBookEntryId);
    if (result.success) {
      toast({
        title: "Successfully removed",
        description: "The question has been removed from your error book.",
      });
      setRefetchTrigger(prev => prev + 1); // Trigger refetch
    } else {
      toast({
        title: "Error",
        description: "Failed to remove error: " + result.error,
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkAnswer = (question: ErrorBookQuestion, userAnswer: any) => {
    if (question.type === 'SINGLE_CHOICE') {
      return String(userAnswer) === String(question.answer);
    }
    if (question.type === 'MULTIPLE_CHOICE') {
        const correctArr = Array.isArray(question.answer) ? (question.answer as string[]) : [String(question.answer)];
        const userArr = Array.isArray(userAnswer) ? (userAnswer as string[]) : [String(userAnswer)];
        if (correctArr.length !== userArr.length) return false;
        const sortedCa = [...correctArr].sort();
        const sortedUa = [...userArr].sort();
        return sortedCa.every((val, idx) => val === sortedUa[idx]);
    }
    if (question.type === 'FILL_BLANK') {
      const val = String(userAnswer).trim();
      if (Array.isArray(question.answer)) {
        return (question.answer as string[]).includes(val);
      } else {
        return String(question.answer).trim() === val;
      }
    }
    return false;
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = errorQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const userAnswer = userAnswers[currentQuestion.id];
    if (!userAnswer) {
        toast({
            title: "Please answer first",
            description: "Select an option or type your answer.",
            variant: "destructive",
        });
        return;
    }

    const isCorrect = checkAnswer(currentQuestion, userAnswer);
    
    // Update local submitted state
    setSubmittedQuestions(prev => ({
        ...prev,
        [currentQuestion.id]: isCorrect
    }));

    // Call server action
    const result = await updateErrorBookMastery(currentQuestion.id, isCorrect);
    
    if (result.success) {
        if (result.mastered) {
             toast({
                title: "Mastered!",
                description: "You've mastered this problem! It will be removed from your error book.",
                className: "bg-emerald-500 text-white",
            });
            // Delay refresh slightly to let user see result
            setTimeout(() => setRefetchTrigger(prev => prev + 1), 1500);
        } else if (isCorrect) {
             toast({
                title: "Correct!",
                description: "Mastery level increased.",
                className: "bg-emerald-500 text-white",
            });
        } else {
             toast({
                title: "Incorrect",
                description: "Don't give up! Review the explanation and try again later.",
                variant: "destructive",
            });
        }
    } else {
         toast({
            title: "Error",
            description: "Failed to update progress: " + result.error,
            variant: "destructive",
        });
    }
  };

  const currentQuestion = errorQuestions[currentQuestionIndex];
  const totalQuestions = errorQuestions.length;
  const isSubmitted = currentQuestion ? !!(submittedQuestions[currentQuestion.id] !== undefined) : false;

  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-3xl text-center">
        Loading error book...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">我的错题本</h1>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2">
                <Switch id="practice-mode" checked={isPracticeMode} onCheckedChange={setIsPracticeMode} />
                <Label htmlFor="practice-mode">练习模式</Label>
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择科目" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="undefined">所有科目</SelectItem>
                {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>

      {totalQuestions === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-muted/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">恭喜！目前没有错题</h3>
            <p className="text-muted-foreground">去课程中做一些练习题吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
             <p>错题 {currentQuestionIndex + 1} / {totalQuestions}</p>
             {isPracticeMode && !isSubmitted && (
                 <span className="text-blue-500 flex items-center gap-1">
                    <Play className="w-3 h-3" /> Practice Active
                 </span>
             )}
          </div>
          
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id} 
              question={currentQuestion}
              userAnswer={userAnswers[currentQuestion.id]}
              onAnswerChange={(val) => {
                  if (!isSubmitted) {
                    setUserAnswers(prev => ({...prev, [currentQuestion.id]: val}));
                  }
              }}
              showResult={!isPracticeMode || isSubmitted} 
              readOnly={!isPracticeMode || isSubmitted}
            />
          )}

          <div className="flex items-center justify-between">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> 上一题
            </Button>
            
            <div className="flex gap-2">
                {!isPracticeMode ? (
                     <Button
                        onClick={() => handleRemoveError(currentQuestion.errorBookEntryId)}
                        variant="destructive"
                    >
                        <XCircle className="h-4 w-4 mr-2" /> 消灭错题
                    </Button>
                ) : (
                    !isSubmitted ? (
                        <Button onClick={handleSubmitAnswer} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Check Answer
                        </Button>
                    ) : (
                        <Button onClick={() => {
                             // Reset for retry? Or just show next?
                             // Story says: "mastery level >= 3 remove".
                             // Let's just allow moving to next.
                             if (currentQuestionIndex < totalQuestions - 1) {
                                 setCurrentQuestionIndex(prev => prev + 1);
                             }
                        }} variant="outline">
                            {currentQuestionIndex < totalQuestions - 1 ? "Next Problem" : "Finish Review"}
                        </Button>
                    )
                )}
            </div>

            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentQuestionIndex === totalQuestions - 1}
              variant="outline"
            >
              下一题 <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
