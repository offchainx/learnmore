'use client'

import React from 'react'
import { Admin } from '@/types'

interface StripeHistoryTableProps {
  payments: Admin.PaymentRecord[]
}

export const StripeHistoryTable: React.FC<StripeHistoryTableProps> = ({ payments }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Payment History</h3>
      
      {payments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No payment history found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
                  <td className="py-3 px-3 text-sm text-slate-300 font-mono">{p.date}</td>
                  <td className="py-3 px-3 text-sm text-white font-medium">${p.amount}.00</td>
                  <td className="py-3 px-3 text-sm text-slate-400">{p.type}</td>
                  <td className="py-3 px-3 text-sm text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === 'Success' 
                        ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/50' 
                        : 'text-red-400 bg-red-950/30 border border-red-900/50'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}