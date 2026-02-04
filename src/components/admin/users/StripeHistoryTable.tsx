'use client'

import { PaymentRecord } from '@/actions/admin/stripe-mock'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface StripeHistoryTableProps {
  payments: PaymentRecord[]
}

export function StripeHistoryTable({ payments }: StripeHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md">
        暂无支付记录
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>交易 ID</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>项目</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {payment.id}
              </TableCell>
              <TableCell>
                {format(new Date(payment.created * 1000), 'yyyy-MM-dd HH:mm')}
              </TableCell>
              <TableCell>{payment.description}</TableCell>
              <TableCell>
                {(payment.amount / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: payment.currency.toUpperCase(),
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.status === 'succeeded'
                      ? 'default' // Usually black/primary
                      : payment.status === 'pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className={
                     payment.status === 'succeeded' ? 'bg-green-600 hover:bg-green-700' : ''
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
