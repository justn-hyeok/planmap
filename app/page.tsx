'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // 로그인된 사용자는 대시보드로
        router.push('/dashboard')
      } else {
        // 로그인되지 않은 사용자는 로그인 페이지로
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // 로딩 중일 때 표시할 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Planmap</h1>
        <div className="text-gray-500">로딩 중...</div>
      </div>
    </div>
  )
}
