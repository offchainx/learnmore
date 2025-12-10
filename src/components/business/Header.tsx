'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserNav } from '@/components/business/UserNav'

export function Header() {
  const pathname = usePathname()
  // Split pathname into segments and remove empty strings
  // e.g., "/dashboard/courses" -> ["dashboard", "courses"]
  const pathSegments = pathname.split('/').filter(segment => segment !== '')

  // Placeholder user object for now.
  // In a real application, this would come from a server component or a global state.
  const user = {
    username: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Breadcrumb Navigation: Hidden on mobile, visible on medium screens and up */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            // Reconstruct path for each segment: /segment1/segment2
            const href = '/' + pathSegments.slice(0, index + 1).join('/')
            const isLast = index === pathSegments.length - 1
            // Capitalize first letter for display: "dashboard" -> "Dashboard"
            const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <div key={segment} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    // Last item is current page, not a link
                    <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{formattedSegment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search will go here later */}
      </div>
      <ThemeToggle />
      <UserNav user={user} />
    </header>
  )
}
