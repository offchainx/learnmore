'use client'

import * as React from 'react'
import { Bold, Italic, List, Heading1, Heading2, Quote, Code, Link as LinkIcon, Image as ImageIcon, Sigma } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  rows = 10
}: RichTextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertFormat = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    
    const beforeText = text.substring(0, start)
    const selectedText = text.substring(start, end)
    const afterText = text.substring(end)

    const newValue = beforeText + before + selectedText + after + afterText
    
    onChange(newValue)

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(
        start + before.length,
        selectedText.length ? start + before.length + selectedText.length : newCursorPos
      )
    }, 0)
  }

  return (
    <div className={cn("flex flex-col border rounded-md focus-within:ring-1 focus-within:ring-ring", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton 
          icon={<Bold className="h-4 w-4" />} 
          onClick={() => insertFormat('**', '**')} 
          tooltip="Bold" 
        />
        <ToolbarButton 
          icon={<Italic className="h-4 w-4" />} 
          onClick={() => insertFormat('*', '*')} 
          tooltip="Italic" 
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton 
          icon={<Heading1 className="h-4 w-4" />} 
          onClick={() => insertFormat('# ', '')} 
          tooltip="Heading 1" 
        />
        <ToolbarButton 
          icon={<Heading2 className="h-4 w-4" />} 
          onClick={() => insertFormat('## ', '')} 
          tooltip="Heading 2" 
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton 
          icon={<List className="h-4 w-4" />} 
          onClick={() => insertFormat('- ', '')} 
          tooltip="List" 
        />
        <ToolbarButton 
          icon={<Quote className="h-4 w-4" />} 
          onClick={() => insertFormat('> ', '')} 
          tooltip="Quote" 
        />
        <ToolbarButton 
          icon={<Code className="h-4 w-4" />} 
          onClick={() => insertFormat('```\n', '\n```')} 
          tooltip="Code Block" 
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton 
          icon={<LinkIcon className="h-4 w-4" />} 
          onClick={() => insertFormat('[', '](url)')} 
          tooltip="Link" 
        />
        <ToolbarButton 
          icon={<ImageIcon className="h-4 w-4" />} 
          onClick={() => insertFormat('![alt](', ')')} 
          tooltip="Image" 
        />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton 
          icon={<Sigma className="h-4 w-4" />} 
          onClick={() => insertFormat('$', '$')} 
          tooltip="Inline Math" 
        />
        <ToolbarButton 
          icon={<span className="font-mono text-xs font-bold">$$</span>} 
          onClick={() => insertFormat('$$\n', '\n$$')} 
          tooltip="Block Math" 
        />
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 shadow-none rounded-t-none resize-y min-h-[150px] focus-visible:ring-0"
        rows={rows}
      />
    </div>
  )
}

function ToolbarButton({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={tooltip}
    >
      {icon}
    </Button>
  )
}
