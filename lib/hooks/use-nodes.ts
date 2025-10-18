import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ky from 'ky'
import type { Database } from '@/types/database'

type Node = Database['public']['Tables']['nodes']['Row']
type NodeInsert = Database['public']['Tables']['nodes']['Insert']
type NodeUpdate = Database['public']['Tables']['nodes']['Update']

const api = ky.create({ prefixUrl: '/api' })

export function useNodes(mindmapId: string) {
  return useQuery({
    queryKey: ['nodes', mindmapId],
    queryFn: () => api.get('nodes', { searchParams: { mindmap_id: mindmapId } }).json<Node[]>(),
    enabled: !!mindmapId,
  })
}

export function useCreateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NodeInsert) =>
      api.post('nodes', { json: data }).json<Node>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', data.mindmap_id] })
      queryClient.invalidateQueries({ queryKey: ['mindmaps', data.mindmap_id] })
    },
  })
}

export function useUpdateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & NodeUpdate) =>
      api.put(`nodes/${id}`, { json: data }).json<Node>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', data.mindmap_id] })
      queryClient.invalidateQueries({ queryKey: ['mindmaps', data.mindmap_id] })
    },
  })
}

export function useUpdateNodesBulk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { nodes: (NodeUpdate & { id: string })[] }) =>
      api.put('nodes/bulk', { json: data }).json<Node[]>(),
    onSuccess: (data) => {
      if (data.length > 0) {
        const mindmapId = data[0].mindmap_id
        queryClient.invalidateQueries({ queryKey: ['nodes', mindmapId] })
        queryClient.invalidateQueries({ queryKey: ['mindmaps', mindmapId] })
      }
    },
  })
}

export function useDeleteNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`nodes/${id}`).json(),
    onSuccess: (_, id) => {
      // We need to invalidate all mindmap queries since we don't know the mindmap_id
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] })
    },
  })
}