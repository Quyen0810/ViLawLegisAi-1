import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Check if user is admin - check role first, fallback to email pattern
  const user = session.user as any
  const isAdmin = user.role === 'ADMIN' || user.role === 'admin' ||
    (user.email?.includes('admin') || user.email?.includes('hungdoan'))

  if (!isAdmin) {
    redirect('/user-dashboard')
  }

  return <>{children}</>
}
