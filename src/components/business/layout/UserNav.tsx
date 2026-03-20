'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/actions/user/auth'
import { User } from '@prisma/client'
import { useTransition } from 'react'

interface UserNavProps {
  user: Pick<User, 'username' | 'email' | 'avatar'>;
  showDetails?: boolean;
}

export function UserNav({ user, showDetails = false }: UserNavProps) {
  const displayName = user.username || user.email.split('@')[0]
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="relative h-9 w-9 rounded-lg p-0">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatar || undefined} alt={displayName} className="object-cover"/>
              <AvatarFallback className="rounded-lg border border-slate-200 bg-slate-50 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          {showDetails && (
            <div className="hidden md:block text-left">
               <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{displayName}</p>
               <p className="text-xs text-slate-500 mt-1">Grade 8</p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings">Settings</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-red-600 cursor-pointer"
        >
          {isPending ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
