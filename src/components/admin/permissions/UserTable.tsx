'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OverrideModal } from './OverrideModal'
import { ShieldAlert, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserTableProps {
  users: any[]
  onUpdate: () => void
}

export function UserTable({ users, onUpdate }: UserTableProps) {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'PREMIER':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'PRO':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-slate-500 hover:bg-slate-600'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>当前等级</TableHead>
            <TableHead>过期时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.username || '未设置用户名'}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{user.id}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTierBadgeColor(user.subscriptionTier)}>
                  {user.subscriptionTier}
                </Badge>
              </TableCell>
              <TableCell>
                {user.subscriptionEnd ? (
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-3 w-3" />
                    {format(new Date(user.subscriptionEnd), 'yyyy-MM-dd', { locale: zhCN })}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">永久/未设置</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <OverrideModal user={user} onSuccess={onUpdate}>
                  <Button variant="outline" size="sm">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    提权/覆写
                  </Button>
                </OverrideModal>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
