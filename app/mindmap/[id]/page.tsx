'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { ReactFlow, Background, Controls, MiniMap } from 'reactflow'
import { useFlowStore } from '@/store/flow-store'
import 'reactflow/dist/style.css'

export default function MindmapPage() {
  const params = useParams()
  const mindmapId = params.id as string

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedMindmap,
  } = useFlowStore()

  useEffect(() => {
    if (mindmapId) {
      setSelectedMindmap(mindmapId)
    }
  }, [mindmapId, setSelectedMindmap])

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}