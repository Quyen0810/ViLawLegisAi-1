'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LegalDocumentsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/legal?tab=browse')
  }, [router])
  return null
}
