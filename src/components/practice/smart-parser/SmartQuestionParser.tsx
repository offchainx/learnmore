import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParserState, ParsedQuestion } from './types';
import { ImageUploader } from './ImageUploader';
import { ProcessingOverlay } from './ProcessingOverlay';
import { QuestionEditor } from './QuestionEditor';
import { parseQuestionImage } from '@/actions/practice/parser';
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface SmartQuestionParserProps {
  onSave: (data: ParsedQuestion) => Promise<void>;
}

export const SmartQuestionParser: React.FC<SmartQuestionParserProps> = ({ onSave }) => {
  const [state, setState] = useState<ParserState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Changed to handle multiple questions
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 图片压缩函数 (减小 Base64 大小以便于预览)
  const compressImageForPreview = async (file: File): Promise<string> => {
    // 检查是否为 HEIC 格式 (浏览器 Canvas 不支持)
    const isHEIC = file.type === 'image/heic' ||
                   file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (isHEIC) {
      console.log('⚠️ HEIC 格式图片，跳过压缩（浏览器 Canvas 不支持）');
      // 对于 HEIC，不进行压缩，直接返回占位符
      throw new Error('HEIC format - skip compression');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          try {
            // 创建 Canvas 进行压缩
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // 限制最大宽度为 1200px (保持清晰度的同时减小文件大小)
            const MAX_WIDTH = 1200;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 转换为 JPEG 格式，质量 0.85 (平衡清晰度和大小)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            console.log(`✅ 图片压缩完成: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedBase64.length / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedBase64);
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = (err) => {
          console.error('❌ 图片加载失败:', err);
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    setState('PROCESSING');
    setError(null);

    try {
      // 1. 压缩图片用于预览 (减小内存占用)
      let previewData: string;
      try {
        previewData = await compressImageForPreview(file);
        console.log('✅ 图片压缩成功，用于预览');
      } catch (compressError) {
        console.warn('⚠️ 图片压缩失败，使用原始文件预览:', compressError);
        // Fallback: 如果压缩失败，直接读取原始 Base64
        previewData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      setImagePreview(previewData);

      // 2. 准备发送给 API 的数据（始终使用原始文件）
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 [前端] 发送解析请求...', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
      });

      const result = await parseQuestionImage(formData);

      console.log('📥 [前端] 收到后端响应:', result);

      if (!result.success) {
        const errorMsg = result.error || "Failed to parse image";
        console.error('❌ 后端返回错误:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!result.data || result.data.length === 0) {
        console.error('❌ 未识别到题目');
        throw new Error("No questions found in the image. Please try a clearer photo.");
      }

      console.log(`✅ 解析成功！识别到 ${result.data.length} 道题目`);

      // 🔍 调试：打印第一道题的原始数据
      if (result.data.length > 0) {
        console.log('🔍 [调试] 第一道题的原始数据:', JSON.stringify(result.data[0], null, 2));
      }

      // Map Server Action result to UI Type (add temporary IDs)
      const mappedData: ParsedQuestion[] = result.data.map((q, idx) => {
        const mapped = {
          content: q.content,
          type: q.type,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          rawText: undefined,
          uncertainSegments: undefined,
          createdAt: Date.now() + idx
        };

        // 🔍 调试：检查每道题的字段
        if (idx === 0) {
          console.log('🔍 [调试] 映射后的第一道题:', {
            hasContent: !!mapped.content,
            hasType: !!mapped.type,
            hasOptions: !!mapped.options,
            hasAnswer: !!mapped.answer,
            hasExplanation: !!mapped.explanation,
            contentLength: mapped.content?.length || 0,
            optionsKeys: Object.keys(mapped.options || {}),
          });
        }

        return mapped;
      });

      console.log('🔍 [调试] mappedData 数组长度:', mappedData.length);
      console.log('🔍 [调试] 完整 mappedData:', mappedData);

      setParsedQuestions(mappedData);
      setCurrentIndex(0);
      setState('REVIEW');
    } catch (err: any) {
      console.error('❌ [前端] 解析失败:', err);

      // 提供更有帮助的错误信息
      let userMessage = err.message || "Failed to recognize the image.";

      // 如果是网络错误
      if (err.message?.includes('fetch')) {
        userMessage = "Network error. Please check your connection and try again.";
      }
      // 如果是超时错误
      else if (err.message?.includes('timeout')) {
        userMessage = "Request timeout. The image might be too large. Please try a smaller image.";
      }

      setError(userMessage);
      setState('IDLE');
    }
  };

  const handleSaveCurrent = async (data: ParsedQuestion) => {
    try {
      await onSave(data);

      console.log('✅ [前端] 题目保存成功，剩余', parsedQuestions.length - 1, '道题目');

      // If there are more questions, remove current and show next
      const remaining = parsedQuestions.filter((_, idx) => idx !== currentIndex);

      if (remaining.length === 0) {
        // All questions saved
        setState('SUCCESS');
        setTimeout(() => {
          setState('IDLE');
          setParsedQuestions([]);
          setImagePreview(null);
        }, 3000);
      } else {
        // More questions to process
        setParsedQuestions(remaining);
        // Adjust index if needed (e.g. if we were at the last one)
        if (currentIndex >= remaining.length) {
          setCurrentIndex(remaining.length - 1);
        }
      }
    } catch (err: any) {
      console.error('❌ [前端] 保存失败:', err);

      // Show user-friendly error message
      const errorMessage = err.message || "Failed to save question to database.";

      // Check if it's a validation error
      if (errorMessage.includes('Answer is required')) {
        alert('❌ 保存失败：答案为空\n\n请先填写正确答案（Answer字段），然后再点击保存。');
      } else if (errorMessage.includes('content is required')) {
        alert('❌ 保存失败：题目内容为空\n\n请确保题目内容（Question Body）已填写。');
      } else {
        alert(`❌ 保存失败：${errorMessage}\n\n请检查数据后重试。`);
      }
    }
  };

  const handleDiscard = () => {
    setState('IDLE');
    setParsedQuestions([]);
    setImagePreview(null);
  };

  const currentQuestion = parsedQuestions[currentIndex];

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {state === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-slate-100">
                AI Smart Question Extractor
              </h1>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Transform textbook images into digitized question banks in seconds.
              </p>
            </div>
            
            {error && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
                <AlertTriangle className="text-amber-500 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            <ImageUploader onImageSelect={handleImageSelect} />
          </motion.div>
        )}

        {state === 'PROCESSING' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProcessingOverlay />
          </motion.div>
        )}

        {state === 'REVIEW' && currentQuestion && imagePreview && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full h-full flex flex-col gap-4"
          >
            {/* Multi-Question Navigation Bar */}
            {parsedQuestions.length > 1 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-in slide-in-from-top">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold px-2">
                  <Layers size={20} />
                  <span>Found {parsedQuestions.length} Questions</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 font-medium">
                    Editing {currentIndex + 1} of {parsedQuestions.length}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentIndex(prev => Math.min(parsedQuestions.length - 1, prev + 1))}
                      disabled={currentIndex === parsedQuestions.length - 1}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <QuestionEditor 
              key={currentQuestion.createdAt} // Force re-mount on question switch
              initialData={currentQuestion}
              imagePreview={imagePreview}
              onSave={handleSaveCurrent}
              onDiscard={handleDiscard}
            />
          </motion.div>
        )}

        {state === 'SUCCESS' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Done!</h2>
            <p className="text-slate-500 mt-2">All parsed questions have been saved to your database.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};