'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { searchUsersForOverride } from '@/actions/admin/permission-override'
import { UserTable } from './UserTable'
import { Search, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function UserPermissionManager() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query || query.length < 2) {
      toast({
        title: "搜索词太短",
        description: "请输入至少 2 个字符进行搜索",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const results = await searchUsersForOverride(query)
      setUsers(results)
      if (results.length === 0) {
        toast({
          title: "未找到用户",
          description: "没有匹配该搜索条件的用户",
        })
      }
    } catch (error) {
      toast({
        title: "搜索失败",
        description: "获取用户列表时出错",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>搜索用户</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索邮箱、用户名或用户 ID..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              搜索
            </Button>
          </form>
        </CardContent>
      </Card>

      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>搜索结果</CardTitle>
          </CardHeader>
          <CardContent>
            <UserTable users={users} onUpdate={handleSearch} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
