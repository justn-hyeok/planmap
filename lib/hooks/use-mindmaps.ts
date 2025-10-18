import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ky from 'ky'
import type { Database } from '@/types/database'

type Mindmap = Database['public']['Tables']['mindmaps']['Row']
type MindmapInsert = Database['public']['Tables']['mindmaps']['Insert']
type MindmapUpdate = Database['public']['Tables']['mindmaps']['Update']

const api = ky.create({ prefixUrl: '/api' })

export function useMindmaps() {
  return useQuery({
    queryKey: ['mindmaps'],
    queryFn: () => api.get('mindmaps').json<Mindmap[]>(),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스시 자동 refetch 비활성화
  })
}

export function useMindmap(id: string) {
  return useQuery({
    queryKey: ['mindmaps', id],
    queryFn: () => api.get(`mindmaps/${id}`).json<Mindmap & {
      nodes: Database['public']['Tables']['nodes']['Row'][]
      edges: Database['public']['Tables']['edges']['Row'][]
    }>(),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분간 fresh (자주 변경되는 데이터)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 마운트시 자동 refetch 비활성화
  })
}

export function useCreateMindmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<MindmapInsert, 'user_id'>) =>
      api.post('mindmaps', { json: data }).json<Mindmap>(),
    onMutate: async (newMindmap) => {
      // 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: ['mindmaps'] })

      // 이전 데이터 백업
      const previousMindmaps = queryClient.getQueryData<Mindmap[]>(['mindmaps'])

      // Optimistic update
      if (previousMindmaps) {
        const optimisticMindmap: Mindmap = {
          id: `temp-${Date.now()}`,
          title: newMindmap.title,
          description: newMindmap.description || null,
          user_id: 'temp-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData<Mindmap[]>(
          ['mindmaps'],
          [...previousMindmaps, optimisticMindmap]
        )
      }

      return { previousMindmaps }
    },
    onError: (err, newMindmap, context) => {
      // 에러 발생시 이전 데이터로 롤백
      if (context?.previousMindmaps) {
        queryClient.setQueryData(['mindmaps'], context.previousMindmaps)
      }
    },
    onSettled: () => {
      // 성공/실패 관계없이 최신 데이터로 다시 fetch
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] })
    },
  })
}

export function useUpdateMindmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & MindmapUpdate) =>
      api.put(`mindmaps/${id}`, { json: data }).json<Mindmap>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] })
      queryClient.invalidateQueries({ queryKey: ['mindmaps', data.id] })
    },
  })
}

export function useDeleteMindmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`mindmaps/${id}`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] })
    },
  })
}