'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2분 기본 staleTime
        gcTime: 5 * 60 * 1000, // 5분 기본 gcTime
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // 404, 401, 403 에러는 재시도하지 않음
          if (error && 'status' in error) {
            const status = (error as any).status
            if ([404, 401, 403].includes(status)) {
              return false
            }
          }
          // 3번까지 재시도
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1, // 뮤테이션은 1번만 재시도
        retryDelay: 1000,
        onError: (error) => {
          console.error('Mutation error:', error)
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}