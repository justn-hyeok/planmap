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
  })
}

export function useCreateMindmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<MindmapInsert, 'user_id'>) =>
      api.post('mindmaps', { json: data }).json<Mindmap>(),
    onSuccess: () => {
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