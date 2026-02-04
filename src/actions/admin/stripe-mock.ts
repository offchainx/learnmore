'use server'

export type PaymentRecord = {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  description: string
  invoice_url?: string
}

export async function getStripePaymentHistory(userId: string): Promise<PaymentRecord[]> {
  // Mock data simulation
  // In a real app, this would fetch from Stripe API using the user's stripeCustomerId
  
  const mockPayments: PaymentRecord[] = [
    {
      id: 'pi_3Q' + Math.random().toString(36).substring(7),
      amount: 2999, // $29.99
      currency: 'usd',
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
      description: 'Subscription - Smart Plus (Monthly)',
      invoice_url: '#'
    },
    {
      id: 'pi_3Q' + Math.random().toString(36).substring(7),
      amount: 2999,
      currency: 'usd',
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000) - 86400 * 32, // 32 days ago
      description: 'Subscription - Smart Plus (Monthly)',
      invoice_url: '#'
    },
    {
      id: 'pi_3Q' + Math.random().toString(36).substring(7),
      amount: 999, // $9.99
      currency: 'usd',
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000) - 86400 * 62, // 62 days ago
      description: 'Subscription - Standard (Monthly)',
      invoice_url: '#'
    }
  ]

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPayments), 500) // Simulate network delay
  })
}
