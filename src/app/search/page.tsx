'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectSearchToLegal() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/legal?tab=search')
  }, [router])
  return null
} 