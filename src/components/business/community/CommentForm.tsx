'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { createComment } from '@/actions/community'
import { toast } from '@/components/ui/use-toast'

interface CommentFormProps {
  postId: string
  onCommentPosted: () => void // Callback to refresh comments in parent
}

const formSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment too long.'),
})

type CommentFormValues = z.infer<typeof formSchema>

export function CommentForm({ postId, onCommentPosted }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  async function onSubmit(values: CommentFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createComment({
        postId,
        content: values.content,
      })

      if (result.success) {
        toast({
          title: 'Comment posted!',
          description: 'Your comment has been added.',
        })
        form.reset() // Clear form
        onCommentPosted() // Notify parent to refresh comments
      } else {
        toast({
          title: 'Failed to post comment.',
          description: result.error || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: 'An unexpected error occurred.',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2 mt-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Add a comment..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </Form>
  )
}
