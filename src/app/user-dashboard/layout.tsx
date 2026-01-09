import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/login?redirect=/user-dashboard')
  }

  return <>{children}</>
}
