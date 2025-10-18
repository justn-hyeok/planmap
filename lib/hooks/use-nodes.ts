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
    staleTime: 30 * 1000, // 30초간 fresh (실시간 편집 고려)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false,
  })
}

export function useCreateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NodeInsert) =>
      api.post('nodes', { json: data }).json<Node>(),
    onMutate: async (newNode) => {
      // 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: ['nodes', newNode.mindmap_id] })
      await queryClient.cancelQueries({ queryKey: ['mindmaps', newNode.mindmap_id] })

      // 이전 데이터 백업
      const previousNodes = queryClient.getQueryData<Node[]>(['nodes', newNode.mindmap_id])

      // Optimistic update - 노드 목록에 임시 노드 추가
      if (previousNodes) {
        const optimisticNode: Node = {
          id: `temp-${Date.now()}`,
          mindmap_id: newNode.mindmap_id,
          react_flow_id: newNode.react_flow_id,
          title: newNode.title || '새 노드',
          content: newNode.content || null,
          progress: newNode.progress || 0,
          type: newNode.type || 'default',
          position: newNode.position || { x: 0, y: 0 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData<Node[]>(
          ['nodes', newNode.mindmap_id],
          [...previousNodes, optimisticNode]
        )
      }

      return { previousNodes }
    },
    onError: (err, newNode, context) => {
      // 에러 발생시 이전 데이터로 롤백
      if (context?.previousNodes) {
        queryClient.setQueryData(['nodes', newNode.mindmap_id], context.previousNodes)
      }
    },
    onSuccess: (data) => {
      // 성공시 관련 쿼리들 무효화
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
    onMutate: async ({ id, ...updateData }) => {
      // 노드가 속한 mindmap_id를 찾기 위해 기존 데이터 확인
      const queryCache = queryClient.getQueryCache()
      const nodesQueries = queryCache.findAll({ queryKey: ['nodes'] })

      let mindmapId: string | null = null
      let previousNodes: Node[] | undefined

      // 해당 노드가 있는 mindmap 찾기
      for (const query of nodesQueries) {
        const nodes = query.state.data as Node[] | undefined
        if (nodes) {
          const targetNode = nodes.find(n => n.id === id)
          if (targetNode) {
            mindmapId = targetNode.mindmap_id
            previousNodes = nodes
            break
          }
        }
      }

      if (mindmapId && previousNodes) {
        await queryClient.cancelQueries({ queryKey: ['nodes', mindmapId] })

        // Optimistic update
        const updatedNodes = previousNodes.map(node =>
          node.id === id
            ? { ...node, ...updateData, updated_at: new Date().toISOString() }
            : node
        )

        queryClient.setQueryData(['nodes', mindmapId], updatedNodes)

        return { mindmapId, previousNodes }
      }

      return {}
    },
    onError: (err, { id }, context) => {
      // 에러 발생시 롤백
      if (context?.mindmapId && context?.previousNodes) {
        queryClient.setQueryData(['nodes', context.mindmapId], context.previousNodes)
      }
    },
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
    onMutate: async ({ nodes: updateNodes }) => {
      if (updateNodes.length === 0) return {}

      // 첫 번째 노드로부터 mindmap_id 찾기
      const queryCache = queryClient.getQueryCache()
      const nodesQueries = queryCache.findAll({ queryKey: ['nodes'] })

      let mindmapId: string | null = null
      let previousNodes: Node[] | undefined

      for (const query of nodesQueries) {
        const nodes = query.state.data as Node[] | undefined
        if (nodes) {
          const targetNode = nodes.find(n =>
            updateNodes.some(update => update.id === n.id)
          )
          if (targetNode) {
            mindmapId = targetNode.mindmap_id
            previousNodes = nodes
            break
          }
        }
      }

      if (mindmapId && previousNodes) {
        await queryClient.cancelQueries({ queryKey: ['nodes', mindmapId] })

        // Optimistic update - 벌크 업데이트
        const updatedNodes = previousNodes.map(node => {
          const update = updateNodes.find(u => u.id === node.id)
          return update
            ? { ...node, ...update, updated_at: new Date().toISOString() }
            : node
        })

        queryClient.setQueryData(['nodes', mindmapId], updatedNodes)

        return { mindmapId, previousNodes }
      }

      return {}
    },
    onError: (err, data, context) => {
      // 에러 발생시 롤백
      if (context?.mindmapId && context?.previousNodes) {
        queryClient.setQueryData(['nodes', context.mindmapId], context.previousNodes)
      }
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        const mindmapId = data[0].mindmap_id
        // 데이터가 이미 optimistic update로 최신화되어 있으므로
        // invalidate만 하여 서버와 동기화
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