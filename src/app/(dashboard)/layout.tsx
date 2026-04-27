// Layout is simplified to allow the Page component to handle the full shell structure
// as per the new UI migration from AI Studio (Story-021).
import { createElement, Fragment, type ReactNode } from 'react'
import { ImpersonateBannerWrapper } from '@/components/admin/users/ImpersonateBannerWrapper'

export const preferredRegion = 'sin1'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return createElement(
    Fragment,
    null,
    createElement(ImpersonateBannerWrapper),
    children
  )
}
