import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { normalizeExamcooImageUrl, replaceExamcooLegacyUploadsInMarkdown } from '@/lib/content-pipeline/examcoo-image';

interface QuestionContentProps {
  content: string;
  className?: string;
}

export const QuestionContent: React.FC<QuestionContentProps> = ({ content, className }) => {
  const normalizedContent = replaceExamcooLegacyUploadsInMarkdown(content);

  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt }) => (
            <img
              src={normalizeExamcooImageUrl(typeof src === 'string' ? src : '') || (typeof src === 'string' ? src : '')}
              alt={alt || '题目图片'}
              className="my-4 max-h-[420px] w-auto max-w-full rounded-lg border border-borderTone object-contain"
              loading="lazy"
            />
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
