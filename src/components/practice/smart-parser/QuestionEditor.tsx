import React, { useState } from 'react';
import { QuestionType, ParsedQuestion } from './types';
import { 
  Trash2, Save, RefreshCw, Plus, X, Eye, Edit3, 
  AlertTriangle, FileText, ChevronRight, ChevronLeft, Copy 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuestionEditorProps {
  initialData: ParsedQuestion;
  imagePreview: string;
  onSave: (data: ParsedQuestion) => Promise<void>;
  onDiscard: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  initialData,
  imagePreview,
  onSave,
  onDiscard
}) => {
  const [formData, setFormData] = useState<ParsedQuestion>(initialData);
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [showRaw, setShowRaw] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const updateField = (field: keyof ParsedQuestion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (key: string, value: string) => {
    const newOptions = { ...formData.options, [key]: value };
    updateField('options', newOptions);
  };

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + Object.keys(formData.options || {}).length);
    handleOptionChange(nextKey, "");
  };

  const removeOption = (key: string) => {
    const newOptions = { ...formData.options };
    delete newOptions[key];
    updateField('options', newOptions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[700px]">
      {/* Left Column: Image Preview */}
      <div className="lg:w-1/3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col h-[700px]">
        <div className="p-3 border-b bg-white flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">原始试题</span>
          <div className="flex items-center gap-2">
            {imageLoaded && <span className="text-xs text-green-600 font-medium">✓ 已加载</span>}
            <span className="text-[10px] text-slate-400 font-mono">
              {imagePreview ? `${(imagePreview.length / 1024 / 1024).toFixed(2)}MB` : 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 bg-slate-200 overflow-y-auto">
          {imagePreview ? (
            <div className="w-full space-y-2">
              {/* 主渲染区域 */}
              <div className="relative w-full min-h-[400px] bg-white rounded-lg shadow-inner p-2">
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">加载中...</p>
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-50 rounded-lg border-2 border-amber-200">
                    <div className="text-center p-6 max-w-sm">
                      <FileText className="w-16 h-16 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm text-amber-800 font-semibold mb-2">
                        预览不可用
                      </p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        该格式（HEIC/HEIF）暂不支持浏览器预览，但 <span className="font-bold">AI 已成功识别题目内容</span>。
                        你可以直接在右侧编辑识别结果。
                      </p>
                      <div className="mt-4 p-2 bg-amber-100 rounded text-xs text-amber-600">
                        💡 提示: 使用 JPG/PNG 格式可以获得图片预览
                      </div>
                    </div>
                  </div>
                )}

                <img
                  src={imagePreview}
                  alt="Question Preview"
                  onLoad={() => {
                    setImageLoaded(true);
                    setImageError(null);
                    console.log('✅ 图片加载成功');
                  }}
                  onError={(e) => {
                    setImageError('图片渲染错误（可能是 HEIC 格式）');
                    console.error('❌ 图片加载失败:', e);
                  }}
                  className="w-full h-auto object-contain rounded-lg"
                  style={{
                    maxWidth: '100%',
                    display: imageLoaded ? 'block' : 'none',
                  }}
                />
              </div>

              {/* 调试信息 */}
              <details className="text-xs bg-slate-800 text-green-400 p-2 rounded font-mono">
                <summary className="cursor-pointer hover:text-green-300">调试信息 (Debug Info)</summary>
                <div className="mt-2 space-y-1 text-[10px]">
                  <div>格式: {imagePreview.substring(0, 30)}...</div>
                  <div>长度: {imagePreview.length.toLocaleString()} chars</div>
                  <div>大小: {(imagePreview.length / 1024 / 1024).toFixed(2)} MB</div>
                  <div>状态: {imageLoaded ? '✓ 已渲染' : imageError ? '✗ 失败' : '⏳ 加载中'}</div>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                <p className="text-red-600 font-bold">图片数据缺失</p>
                <p className="text-sm text-slate-500 mt-1">imagePreview 为空</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle/Main Column: Editor Form */}
      <div className="flex-1 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden h-[700px]">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('EDIT')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'EDIT' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={16} /> Edit
            </button>
            <button 
              onClick={() => setViewMode('PREVIEW')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'PREVIEW' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eye size={16} /> Preview
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onDiscard}
              className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Retry
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save & Store"}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'EDIT' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Question Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"
                >
                  <option value="SINGLE_CHOICE">Single Choice</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="FILL_BLANK">Fill in the Blank</option>
                  <option value="ESSAY">Essay / Long Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Question Body</label>
                <textarea 
                  rows={6}
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm"
                />
              </div>

              {(formData.type === 'SINGLE_CHOICE' || formData.type === 'MULTIPLE_CHOICE') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Options</label>
                    <button onClick={addOption} className="text-xs text-indigo-600 font-medium">+ Add Option</button>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(formData.options || {}).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="w-8 h-10 bg-indigo-50 flex items-center justify-center font-bold rounded-lg border border-indigo-100">{key}</span>
                        <input
                          value={value || ''}
                          onChange={(e) => handleOptionChange(key, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4"
                        />
                        <button onClick={() => removeOption(key)} className="p-2 text-slate-400 hover:text-red-500"><X size={18} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Answer
                  {!formData.answer && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">
                      (⚠️ AI 未识别，请手动填写)
                    </span>
                  )}
                </label>
                <input
                  value={Array.isArray(formData.answer) ? formData.answer.join(', ') : (formData.answer || '')}
                  onChange={(e) => updateField('answer', e.target.value)}
                  placeholder={formData.type === 'MULTIPLE_CHOICE' ? 'A, C (多选用逗号分隔)' : 'A'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-medium text-green-600 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Explanation
                  {!formData.explanation && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">
                      (可选 - 建议补充解题思路)
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={formData.explanation || ''}
                  onChange={(e) => updateField('explanation', e.target.value)}
                  placeholder="详细解释为什么选择这个答案..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm placeholder:text-slate-400"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                <div className="text-xs uppercase tracking-wider font-bold text-indigo-500 mb-2">{formData.type}</div>
                <div className="text-lg font-medium text-slate-800 leading-relaxed mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {formData.content}
                  </ReactMarkdown>
                </div>

                {Object.keys(formData.options || {}).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {Object.entries(formData.options || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-indigo-600">{key}.</span>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-4 border-t border-indigo-100">
                  <div className="flex items-start gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Answer</span>
                    <span className="font-semibold">{Array.isArray(formData.answer) ? formData.answer.join(', ') : formData.answer}</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {formData.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};