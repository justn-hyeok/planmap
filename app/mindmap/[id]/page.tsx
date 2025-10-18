'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FlowCanvas from '@/components/flow/flow-canvas'
import NodeSidebar from '@/components/flow/node-sidebar'
import { useMindmap } from '@/lib/hooks/use-mindmaps'
import { useCreateNode } from '@/lib/hooks/use-nodes'
import { generateId } from '@/lib/utils'
import { NODE_TYPES } from '@/lib/constants'
import type { Database } from '@/types/database'

type DatabaseNode = Database['public']['Tables']['nodes']['Row']

export default function MindmapPage() {
  const params = useParams()
  const router = useRouter()
  const mindmapId = params.id as string

  const [selectedNode, setSelectedNode] = useState<DatabaseNode | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: mindmap, isLoading, error } = useMindmap(mindmapId)
  const createNode = useCreateNode()

  const handleNodeEdit = (nodeId: string) => {
    console.log('handleNodeEdit called:', nodeId)
    const node = mindmap?.nodes?.find((n) => n.react_flow_id === nodeId)
    console.log('Found node:', node)
    if (node) {
      setSelectedNode(node)
      setSidebarOpen(true)
    }
  }

  const handleAddNode = async (position: { x: number; y: number }) => {
    if (!mindmap) return

    const newNodeId = generateId()

    createNode.mutate({
      mindmap_id: mindmap.id,
      react_flow_id: newNodeId,
      title: '새 노드',
      type: NODE_TYPES.STUDY_NODE,
      position,
    })
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedNode(null)
  }

  const handleSave = () => {
    // 저장 완료 피드백 (필요시)
    console.log('저장 완료!')
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">마인드맵을 불러오는 중...</div>
      </div>
    )
  }

  if (error || !mindmap) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">마인드맵을 불러올 수 없습니다.</div>
          <Button onClick={() => router.push('/dashboard')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen relative">
        {/* Header */}
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드
          </Button>
          <div className="text-lg font-semibold">{mindmap.title}</div>
        </div>

        {/* Add Node Button */}
        <div className="absolute top-4 right-56 z-10">
          <Button
            onClick={() => handleAddNode({ x: 100, y: 100 })}
            disabled={createNode.isPending}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createNode.isPending ? '추가 중...' : '노드 추가'}
          </Button>
        </div>

        {/* Flow Canvas */}
        <FlowCanvas
          mindmapId={mindmap.id}
          nodes={mindmap.nodes || []}
          edges={mindmap.edges || []}
          onNodeEdit={handleNodeEdit}
          onAddNode={handleAddNode}
          onSave={handleSave}
        />

        {/* Node Sidebar */}
        <NodeSidebar
          node={selectedNode}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>
    </ReactFlowProvider>
  )
}