const assert = require('node:assert/strict')
const path = require('node:path')
const process = require('node:process')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
const baseUrl = process.env.P001_WEBHOOK_ENDPOINT
  ? new URL(process.env.P001_WEBHOOK_ENDPOINT).origin
  : 'http://127.0.0.1:3000'

if (!supabaseUrl || !supabaseServiceRoleKey || !webhookSecret || !directUrl) {
  throw new Error('Missing required environment variables for voucher smoke test')
}

process.env.DATABASE_URL = directUrl

const { PrismaClient, UserRole } = require('@prisma/client')
const Stripe = require('stripe')
const prisma = new PrismaClient()
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

function createEvent(payload) {
  const now = Math.floor(Date.now() / 1000)

  return {
    id: payload.id,
    object: 'event',
    api_version: '2024-06-20',
    created: now,
    data: {
      object: {
        id: `in_${payload.id}`,
        object: 'invoice',
        customer: payload.customerId,
        amount_paid: payload.amountPaid,
        currency: 'myr',
        metadata: {
          userId: payload.userId,
          voucherCode: payload.voucherCode,
        },
        total_discount_amounts: payload.discountAmountMinor
          ? [{ amount: payload.discountAmountMinor }]
          : [],
        lines: {
          data: [
            {
              period: {
                start: now,
                end: now + 30 * 24 * 60 * 60,
              },
            },
          ],
        },
        parent: {
          subscription_details: {
            subscription: payload.subscriptionId,
            metadata: {
              userId: payload.userId,
              voucherCode: payload.voucherCode,
            },
          },
        },
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: 'invoice.payment_succeeded',
  }
}

async function sendWebhook(eventPayload) {
  const payload = JSON.stringify(eventPayload)
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  })

  const response = await fetch(`${baseUrl}/api/webhook/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body: payload,
  })

  const text = await response.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = text
  }

  assert.ok(response.ok, `Webhook failed: ${response.status} ${JSON.stringify(parsed)}`)
  return parsed
}

async function createTempAuthUser(prefix, role) {
  const email = `${prefix}-${Date.now()}@learnmore.test`
  const password = 'Password123!'

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  assert.ok(!error, `Failed to create auth user: ${error && error.message ? error.message : 'unknown error'}`)
  const authId = data.user && data.user.id ? data.user.id : null
  assert.ok(authId, 'Auth user id is missing')

  await prisma.user.upsert({
    where: { email },
    update: { role },
    create: {
      id: authId,
      email,
      username: prefix.replace(/[^a-z0-9]/gi, '_'),
      role,
    },
  })

  return { authId, publicId: authId, email }
}

async function createTempPublicUser(prefix) {
  const publicId = crypto.randomUUID()
  const email = `${prefix}-${Date.now()}@learnmore.test`

  await prisma.user.create({
    data: {
      id: publicId,
      email,
      username: prefix.replace(/[^a-z0-9]/gi, '_'),
      role: 'STUDENT',
    },
  })

  return { authId: null, publicId, email }
}

async function cleanupUsers(users) {
  for (const user of users) {
    await prisma.notification.deleteMany({
      where: {
        userId: user.publicId,
        link: { startsWith: 'stripe:event:' },
      },
    })
    await prisma.voucherRedemption.deleteMany({
      where: { userId: user.publicId },
    })
    await prisma.user.deleteMany({
      where: { id: user.publicId },
    })
    if (user.authId) {
      try {
        await supabase.auth.admin.deleteUser(user.authId)
      } catch (error) {
        console.warn('[voucher-smoke] failed to delete auth user', user.email, error)
      }
    }
  }
}

async function main() {
  const createdUsers = []
  const createdVoucherCodes = []

  try {
    const voucherCode = `T012B9${Date.now().toString().slice(-6)}`.toUpperCase()
    createdVoucherCodes.push(voucherCode)

    const activeVoucher = await prisma.voucherCode.create({
      data: {
        code: voucherCode,
        discountType: 'AMOUNT',
        discountValue: 10,
        maxRedemptions: 1,
        redeemedCount: 0,
        isActive: true,
        validFrom: new Date(Date.now() - 60 * 60 * 1000),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stripeCouponId: `cpn_${voucherCode.toLowerCase()}`,
      },
      select: { id: true, code: true, redeemedCount: true, maxRedemptions: true, isActive: true },
    })

    const studentA = await createTempAuthUser('voucher-smoke-a', UserRole.STUDENT)
    const studentB = await createTempPublicUser('voucher-smoke-b')
    createdUsers.push(studentA, studentB)

    const activeCustomerId = `cus_voucher_smoke_${Date.now()}`
    const activeSubscriptionId = `sub_voucher_smoke_${Date.now()}`

    await prisma.user.update({
      where: { id: studentA.publicId },
      data: {
        stripeCustomerId: activeCustomerId,
        stripeSubscriptionId: activeSubscriptionId,
      },
    })

    await prisma.user.update({
      where: { id: studentB.publicId },
      data: {
        stripeCustomerId: `${activeCustomerId}_b`,
        stripeSubscriptionId: `${activeSubscriptionId}_b`,
      },
    })

    await sendWebhook(
      createEvent({
        id: `evt_t012b9_${Date.now()}`,
        customerId: activeCustomerId,
        subscriptionId: activeSubscriptionId,
        userId: studentA.publicId,
        voucherCode,
        amountPaid: 6000,
        discountAmountMinor: 1000,
      })
    )

    const firstRedemption = await prisma.voucherRedemption.findFirst({
      where: { voucherId: activeVoucher.id, userId: studentA.publicId },
    })
    const voucherAfterFirstRedemption = await prisma.voucherCode.findUnique({
      where: { code: voucherCode },
      select: { redeemedCount: true },
    })

    assert.ok(firstRedemption, 'First paid webhook should create voucher redemption')
    assert.equal(voucherAfterFirstRedemption && voucherAfterFirstRedemption.redeemedCount, 1, 'redeemedCount should increment after first redemption')

    await sendWebhook(
      createEvent({
        id: `evt_t012b9_dup_${Date.now()}`,
        customerId: activeCustomerId,
        subscriptionId: activeSubscriptionId,
        userId: studentA.publicId,
        voucherCode,
        amountPaid: 6000,
        discountAmountMinor: 1000,
      })
    )

    const redemptionCountAfterDuplicate = await prisma.voucherRedemption.count({
      where: {
        voucherId: activeVoucher.id,
        userId: studentA.publicId,
      },
    })
    assert.equal(redemptionCountAfterDuplicate, 1, 'Duplicate webhook should not create another redemption')

    await sendWebhook(
      createEvent({
        id: `evt_t012b9_limit_${Date.now()}`,
        customerId: `${activeCustomerId}_b`,
        subscriptionId: `${activeSubscriptionId}_b`,
        userId: studentB.publicId,
        voucherCode,
        amountPaid: 6000,
        discountAmountMinor: 1000,
      })
    )

    const redemptionCountAfterLimit = await prisma.voucherRedemption.count({
      where: {
        voucherId: activeVoucher.id,
      },
    })
    assert.equal(redemptionCountAfterLimit, 1, 'Max redemptions should block additional users')

    const expiredCode = `T012B9X${Date.now().toString().slice(-5)}`.toUpperCase()
    createdVoucherCodes.push(expiredCode)
    const expiredVoucher = await prisma.voucherCode.create({
      data: {
        code: expiredCode,
        discountType: 'AMOUNT',
        discountValue: 5,
        maxRedemptions: 2,
        redeemedCount: 0,
        isActive: true,
        validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        validTo: new Date(Date.now() - 60 * 60 * 1000),
        stripeCouponId: `cpn_${expiredCode.toLowerCase()}`,
      },
      select: { id: true },
    })

    await sendWebhook(
      createEvent({
        id: `evt_t012b9_expired_${Date.now()}`,
        customerId: `${activeCustomerId}_expired`,
        subscriptionId: `${activeSubscriptionId}_expired`,
        userId: studentA.publicId,
        voucherCode: expiredCode,
        amountPaid: 6000,
        discountAmountMinor: 1000,
      })
    )

    const expiredRedemptionCount = await prisma.voucherRedemption.count({
      where: { voucherId: expiredVoucher.id },
    })
    assert.equal(expiredRedemptionCount, 0, 'Expired voucher should not create redemption')

    console.log(
      JSON.stringify(
        {
          ok: true,
          voucherCode,
          expiredCode,
          createdVoucherId: activeVoucher.id,
          activeRedemptions: redemptionCountAfterLimit,
          expiredRedemptions: expiredRedemptionCount,
        },
        null,
        2
      )
    )
  } finally {
    await cleanupUsers(createdUsers)
    await prisma.$disconnect()
  }
}

main().catch(async (error) => {
  console.error('[t012b9-voucher-smoke] failed', error)
  await prisma.$disconnect()
  process.exit(1)
})
