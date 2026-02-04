'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { getEffectiveTier as calcEffectiveTier, checkPermission as calcCheckPermission } from '@/lib/permissions/engine'
import { FeatureKey, PermissionCheckResult, TierKey } from '@/lib/permissions/types'

export async function getUserPermissionStatus(): Promise<{ tier: TierKey; isAuth: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { tier: 'STARTER', isAuth: false };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      subscriptionTier: true,
      subscriptionEnd: true,
      permissionOverrides: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        select: {
          targetField: true,
          newValue: true,
          expiresAt: true
        }
      }
    }
  });

  if (!dbUser) {
    // Should ideally not happen if auth exists, but fallback safely
    return { tier: 'STARTER', isAuth: true }; // Auth is true, but no DB record? weird. 
    // Actually, if no DB record, treat as unauthed or STARTER? 
    // Let's stick to STARTER.
  }

  const effectiveTier = calcEffectiveTier(dbUser);
  return { tier: effectiveTier, isAuth: true };
}

export async function checkPermissionAction(feature: FeatureKey): Promise<PermissionCheckResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const defaultUser = {
        subscriptionTier: 'STARTER' as const,
        subscriptionEnd: null,
        permissionOverrides: []
    };

    if (!user) {
         return calcCheckPermission(defaultUser, feature);
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            subscriptionTier: true,
            subscriptionEnd: true,
            permissionOverrides: {
                where: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                },
                select: {
                    targetField: true,
                    newValue: true,
                    expiresAt: true
                }
            }
        }
    });

    if (!dbUser) {
         return calcCheckPermission(defaultUser, feature);
    }
    
    return calcCheckPermission(dbUser, feature);
}
