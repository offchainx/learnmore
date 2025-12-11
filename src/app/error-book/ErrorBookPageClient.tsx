
'use client';

import { useState, useEffect } from 'react';
import { QuestionCard, Question } from '@/components/business/question';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { getErrorBookQuestions, removeErrorBookEntry } from '@/actions/error-book';
import { Subject } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllSubjects } from '@/actions/subject';

interface ErrorBookQuestion extends Question {
  errorBookEntryId: string;
}

export default function ErrorBookPageClient() {
  const [errorQuestions, setErrorQuestions] = useState<ErrorBookQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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
      setRefetchTrigger(prev => prev + 1); // Trigger refetch
    } else {
      alert('Failed to remove error: ' + result.error);
    }
  };

  const currentQuestion = errorQuestions[currentQuestionIndex];
  const totalQuestions = errorQuestions.length;

  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-3xl text-center">
        Loading error book...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">我的错题本</h1>
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

      {totalQuestions === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-lg">
          恭喜，目前没有错题！
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            错题 {currentQuestionIndex + 1} / {totalQuestions}
          </p>
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id} // Use question.id as key for QuestionCard
              question={currentQuestion}
              showResult={true} // Always show result for error book review
              readOnly={true}
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
            <Button
              onClick={() => handleRemoveError(currentQuestion.errorBookEntryId)}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" /> 消灭错题
            </Button>
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
