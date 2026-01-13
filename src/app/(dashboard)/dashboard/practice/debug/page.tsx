'use client'

import { useState } from 'react'
import { parseQuestionImage } from '@/actions/practice/parser'

export default function DebugParserPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    if (!file) {
      alert('请先选择文件')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('🧪 [Debug] 开始测试:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
      })

      const response = await parseQuestionImage(formData)

      console.log('🧪 [Debug] 后端响应:', response)
      setResult(response)

      if (!response.success) {
        setError(response.error || 'Unknown error')
      }
    } catch (err: any) {
      console.error('🧪 [Debug] 捕获异常:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🔬 Parser Debug Tool
          </h1>
          <p className="text-slate-500 mb-8">
            用于调试 Gemini 图片解析功能的临时页面
          </p>

          <div className="space-y-6">
            {/* 文件选择 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                选择图片
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-2 text-sm text-slate-600">
                  已选择: <span className="font-medium">{file.name}</span> (
                  {(file.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            {/* 测试按钮 */}
            <button
              onClick={handleTest}
              disabled={!file || loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '⏳ 解析中...' : '🚀 开始测试'}
            </button>

            {/* 错误信息 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-1">❌ 错误</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 成功结果 */}
            {result && result.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-bold text-green-800 mb-2">
                  ✅ 解析成功
                </h3>
                <p className="text-sm text-green-600 mb-2">
                  识别到 {result.data?.length || 0} 道题目
                </p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-green-700 font-medium">
                    查看详细数据
                  </summary>
                  <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-96 border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* 原始响应 */}
            {result && (
              <details className="p-4 bg-slate-100 rounded-lg">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  📋 完整响应对象
                </summary>
                <pre className="mt-3 p-3 bg-slate-800 text-green-400 rounded text-xs overflow-auto max-h-96 font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* 调试提示 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-bold text-blue-800 mb-2">💡 调试提示</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>打开浏览器开发者工具的 Console 标签页</li>
              <li>查看带有 [Parser] 和 [Debug] 前缀的日志</li>
              <li>检查 Network 标签页中的请求响应时间</li>
              <li>如果超过 30 秒未响应，可能是 Gemini API 超时</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
