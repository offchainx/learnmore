import prisma from '@/lib/prisma'
import { normalizeHandle, validateHandle } from './handle'

export async function isReservedHandle(handle: string): Promise<boolean> {
  const normalized = normalizeHandle(handle)
  if (!normalized) return false

  const staticError = validateHandle(normalized)
  if (staticError === '该账号标识为保留字段，暂不可申请') {
    return true
  }

  const reserved = await prisma.reservedHandle.findUnique({
    where: { handle: normalized },
    select: { id: true },
  })

  return Boolean(reserved)
}

export async function getHandleAvailability(
  handle: string,
  currentUserId?: string | null,
) {
  const normalized = normalizeHandle(handle)
  const validationError = validateHandle(normalized)

  if (validationError && validationError !== '该账号标识为保留字段，暂不可申请') {
    return {
      normalizedHandle: normalized,
      available: false,
      reason: validationError,
    }
  }

  if (await isReservedHandle(normalized)) {
    return {
      normalizedHandle: normalized,
      available: false,
      reason: '该账号标识为保留字段，暂不可申请',
    }
  }

  const existing = await prisma.user.findUnique({
    where: { handle: normalized },
    select: { id: true },
  })

  if (existing && existing.id !== currentUserId) {
    return {
      normalizedHandle: normalized,
      available: false,
      reason: '该账号标识已被占用',
    }
  }

  return {
    normalizedHandle: normalized,
    available: true,
    reason: null,
  }
}

export async function resolveUsersByHandles(handles: string[]) {
  const normalizedHandles = handles.map((handle) => normalizeHandle(handle)).filter(Boolean)

  if (normalizedHandles.length === 0) {
    return []
  }

  return prisma.user.findMany({
    where: {
      OR: normalizedHandles.map((handle) => ({
        handle: {
          equals: handle,
          mode: 'insensitive',
        },
      })),
    },
    select: {
      id: true,
      username: true,
      handle: true,
    },
  })
}
