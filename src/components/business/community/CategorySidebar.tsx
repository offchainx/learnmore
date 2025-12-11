'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayoutGrid } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string | null
  _count?: {
    posts?: number // Optional if we decide to show counts later
  }
}

interface CategorySidebarProps {
  categories: Category[]
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  return (
    <div className="w-full">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-semibold tracking-tight">Topics</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 p-2">
          <Button
            variant={!currentCategory ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/community">
              <LayoutGrid className="mr-2 h-4 w-4" />
              All Posts
            </Link>
          </Button>
          
          <div className="py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Subjects
            </h3>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-1"
                asChild
              >
                <Link
                  href={`/dashboard/community?category=${category.id}`}
                >
                  <span className="mr-2 h-4 w-4 flex items-center justify-center text-lg">
                     #
                  </span>
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
