'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import TiptapEditor from './TiptapEditor' // We will create this component next
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast' // Assuming toast is available
import { createPost } from '@/actions/community' // We will create this action next

interface Category {
  id: string
  name: string
  icon: string | null
}

interface PostEditorFormProps {
  categories: Category[]
}

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100, 'Title must not exceed 100 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  subjectId: z.string().uuid('Please select a valid subject.').optional(),
})

type PostFormValues = z.infer<typeof formSchema>

export function PostEditorForm({ categories }: PostEditorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      subjectId: undefined,
    },
  })

  async function onSubmit(values: PostFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createPost({
        title: values.title,
        content: values.content,
        subjectId: values.subjectId,
      })

      if (result.success) {
        toast({
          title: 'Post created successfully!',
          description: 'Your post has been published to the community.',
        })
        router.push('/dashboard/community')
      } else {
        toast({
          title: 'Failed to create post.',
          description: result.error || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating post:', error)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Your post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <TiptapEditor 
                  content={field.value} 
                  onChange={field.onChange} 
                  editable={!isSubmitting} // Disable editing during submission
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </Form>
  )
}
