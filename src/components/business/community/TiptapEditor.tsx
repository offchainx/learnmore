'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Bold, Italic, List, ListOrdered, Quote, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/actions/storage'
import { toast } from '@/components/ui/use-toast'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

const TiptapEditor = ({ content, onChange, editable = true }: TiptapEditorProps) => {
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Only image files are allowed.',
        variant: 'destructive',
      })
      return null
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'Error',
        description: 'File size exceeds 5MB limit.',
        variant: 'destructive',
      })
      return null
    }

    const formData = new FormData()
    formData.append('file', file)

    toast({
      title: 'Uploading image...',
      description: 'Please wait.',
    })

    const result = await uploadImage(formData)

    if (result.success && result.url) {
      toast({
        title: 'Image uploaded successfully!',
        description: 'The image has been inserted.',
      })
      return result.url
    } else {
      toast({
        title: 'Image upload failed.',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      })
      return null
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({
        inline: true, // Render images inline
        allowBase64: true, // For development or very small images, not recommended for production
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md', // Tailwind classes for images
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
      handleDrop: (view, event) => {
        if (!editable) return false;

        const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0;
        if (hasFiles) {
          for (const file of Array.from(event.dataTransfer.files)) {
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(file).then(url => {
                if (url) {
                  if (editor) { // <--- Null check
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }
              });
              return true; // Handled the drop
            }
          }
        }

        // Default behavior for other drops (e.g. text)
        return false;
      },
      handlePaste: (view, event) => {
        if (!editable) return false;

        const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0;
        if (hasFiles) {
          for (const file of Array.from(event.clipboardData.files)) {
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(file).then(url => {
                if (url) {
                  if (editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }
              });
              return true; // Handled the paste
            }
          }
        }

        // Default behavior for other pastes
        return false;
      },
    },
    editable,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            editor.isActive('bold') ? 'is-active bg-accent text-accent-foreground' : ''
          )}
          disabled={!editable}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            editor.isActive('italic') ? 'is-active bg-accent text-accent-foreground' : ''
          )}
          disabled={!editable}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            editor.isActive('bulletList') ? 'is-active bg-accent text-accent-foreground' : ''
          )}
          disabled={!editable}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            editor.isActive('orderedList') ? 'is-active bg-accent text-accent-foreground' : ''
          )}
          disabled={!editable}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            editor.isActive('blockquote') ? 'is-active bg-accent text-accent-foreground' : ''
          )}
          disabled={!editable}
        >
          <Quote className="h-4 w-4" />
        </Button>
        {/* Add image button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (!editable) return;
            const url = window.prompt('Image URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          disabled={!editable}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose dark:prose-invert max-w-none p-3 focus:outline-none" />
    </div>
  )
}

export default TiptapEditor