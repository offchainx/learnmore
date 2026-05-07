import Script from 'next/script'
import { DashboardVisualReplica } from '@/components/dashboard/DashboardVisualReplica'

export default function DashboardPreviewPage() {
  return (
    <>
      <Script id="preview-cookie-consent" strategy="beforeInteractive">
        {`try { localStorage.setItem('cookie-consent', 'accepted') } catch (error) {}`}
      </Script>
      <DashboardVisualReplica />
    </>
  )
}
