// Layout is simplified to allow the Page component to handle the full shell structure
// as per the new UI migration from AI Studio (Story-021).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}