import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationType } from '@prisma/client'

import { NotificationDropdown } from '../NotificationDropdown'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('NotificationDropdown', () => {
  it('在首次加载时显示加载态，不伪装成空列表', () => {
    render(
      <NotificationDropdown
        notifications={[]}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        isLoading
        loadError={null}
        actionError={null}
        onRetry={() => {}}
      />
    )

    expect(screen.getByText('正在加载通知')).toBeInTheDocument()
    expect(screen.queryByText('暂时没有新通知')).not.toBeInTheDocument()
  })

  it('在读取失败且没有缓存数据时显示错误态和重试入口', () => {
    render(
      <NotificationDropdown
        notifications={[]}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        isLoading={false}
        loadError="通知加载失败，请稍后重试。"
        actionError={null}
        onRetry={() => {}}
      />
    )

    expect(screen.getByText('通知加载失败，请稍后重试。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重试加载' })).toBeInTheDocument()
    expect(screen.queryByText('暂时没有新通知')).not.toBeInTheDocument()
  })

  it('在有缓存数据但刷新失败时保留列表并显示降级提示', () => {
    render(
      <NotificationDropdown
        notifications={[
          {
            id: 'notif-1',
            userId: 'user-1',
            type: NotificationType.SYSTEM,
            title: '系统通知',
            content: '一条缓存中的通知',
            link: '/dashboard',
            isRead: false,
            isArchived: false,
            createdAt: new Date('2026-04-09T10:00:00.000Z'),
            readAt: null,
            metadata: null,
          },
        ]}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        isLoading={false}
        loadError="通知加载失败，请稍后重试。"
        actionError={null}
        onRetry={() => {}}
      />
    )

    expect(screen.getByText('系统通知')).toBeInTheDocument()
    expect(screen.getByText('通知加载失败，请稍后重试。')).toBeInTheDocument()
  })

  it('会把历史 settings 深链规范到真实页面', () => {
    render(
      <NotificationDropdown
        notifications={[
          {
            id: 'notif-legacy-billing',
            userId: 'user-1',
            type: NotificationType.BILLING,
            title: '支付成功确认',
            content: '历史账单通知',
            link: '/dashboard/settings/billing',
            isRead: false,
            isArchived: false,
            createdAt: new Date('2026-04-09T10:00:00.000Z'),
            readAt: null,
            metadata: null,
          },
          {
            id: 'notif-legacy-feedback',
            userId: 'user-1',
            type: NotificationType.SYSTEM,
            title: '反馈已收到',
            content: '历史反馈通知',
            link: '/dashboard/settings?tab=feedback',
            isRead: false,
            isArchived: false,
            createdAt: new Date('2026-04-09T11:00:00.000Z'),
            readAt: null,
            metadata: null,
          },
        ]}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        isLoading={false}
        loadError={null}
        actionError={null}
        onRetry={() => {}}
      />
    )

    const detailLinks = screen.getAllByRole('link', { name: /查看详情/i })
    expect(detailLinks[0]).toHaveAttribute(
      'href',
      '/dashboard/settings?tab=subscription'
    )
    expect(detailLinks[1]).toHaveAttribute('href', '/help')
  })
})
