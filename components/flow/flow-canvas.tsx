'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type Viewport,
} from 'reactflow'
import 'reactflow/dist/style.css'

import StudyNode from './custom-node'
import { useUpdateNodesBulk } from '@/lib/hooks/use-nodes'
import { debounce } from '@/lib/utils'
import { NODE_TYPES, DEFAULT_VIEWPORT, SAVE_SETTINGS } from '@/lib/constants'
import type { Database } from '@/types/database'

type DatabaseNode = Database['public']['Tables']['nodes']['Row']
type DatabaseEdge = Database['public']['Tables']['edges']['Row']

interface FlowCanvasProps {
  mindmapId: string
  nodes: DatabaseNode[]
  edges: DatabaseEdge[]
  onNodeEdit?: (nodeId: string) => void
  onAddNode?: (position: { x: number; y: number }) => void
  onSave?: () => void
}

const nodeTypes = {
  [NODE_TYPES.STUDY_NODE]: StudyNode,
}

export default function FlowCanvas({
  mindmapId,
  nodes: dbNodes,
  edges: dbEdges,
  onNodeEdit,
  onAddNode,
  onSave,
}: FlowCanvasProps) {
  const { project, getViewport, setViewport } = useReactFlow()
  const updateNodesBulk = useUpdateNodesBulk()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 뷰포트 상태 저장용
  const [savedViewport, setSavedViewport] = useState<Viewport | null>(null)

  // Convert database nodes to React Flow nodes
  const initialNodes = useMemo((): Node[] => {
    return dbNodes.map((node) => ({
      id: node.react_flow_id,
      type: NODE_TYPES.STUDY_NODE,
      position: node.position,
      data: {
        title: node.title,
        content: node.content || '',
        progress: node.progress,
        onEdit: onNodeEdit,
      },
    }))
  }, [dbNodes, onNodeEdit])

  // Convert database edges to React Flow edges
  const initialEdges = useMemo((): Edge[] => {
    return dbEdges.map((edge) => ({
      id: edge.react_flow_id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      type: edge.type || 'default',
    }))
  }, [dbEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when dbNodes change
  useEffect(() => {
    setNodes(initialNodes)
    // 새 노드가 추가되었는지 확인
    if (initialNodes.length > nodes.length) {
      setHasUnsavedChanges(false) // 새 노드는 이미 DB에 저장됨
    }
  }, [initialNodes, setNodes, nodes.length])

  // Update edges when dbEdges change
  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Manual save function
  const savePositions = useCallback(() => {
    const updates = nodes
      .map((node) => {
        const dbNode = dbNodes.find((n) => n.react_flow_id === node.id)
        if (!dbNode) return null

        return {
          id: dbNode.id,
          position: node.position,
        }
      })
      .filter(Boolean) as any[]

    if (updates.length > 0) {
      updateNodesBulk.mutate(
        { nodes: updates },
        {
          onSuccess: () => {
            setHasUnsavedChanges(false)
            // 뷰포트 상태도 저장
            const currentViewport = getViewport()
            setSavedViewport(currentViewport)
            localStorage.setItem(`mindmap-viewport-${mindmapId}`, JSON.stringify(currentViewport))
            onSave?.()
          }
        }
      )
    } else {
      // 위치 변경이 없어도 뷰포트는 저장
      const currentViewport = getViewport()
      setSavedViewport(currentViewport)
      localStorage.setItem(`mindmap-viewport-${mindmapId}`, JSON.stringify(currentViewport))
      setHasUnsavedChanges(false)
      onSave?.()
    }
  }, [nodes, dbNodes, updateNodesBulk, onSave, getViewport, mindmapId])

  // 5분마다 자동 저장
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        savePositions()
      }
    }, SAVE_SETTINGS.AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [hasUnsavedChanges, savePositions])


  // 뷰포트 복원
  useEffect(() => {
    const savedViewportData = localStorage.getItem(`mindmap-viewport-${mindmapId}`)
    if (savedViewportData) {
      try {
        const viewport = JSON.parse(savedViewportData)
        setSavedViewport(viewport)
        // 약간의 지연을 두고 뷰포트 설정 (React Flow 초기화 후)
        setTimeout(() => {
          setViewport(viewport)
        }, 100)
      } catch (error) {
        console.error('Failed to restore viewport:', error)
      }
    }
  }, [mindmapId, setViewport])

  // 뷰포트 자동 저장 (디바운스된 방식)
  const debouncedSaveViewport = useMemo(
    () => debounce((viewport: Viewport) => {
      localStorage.setItem(`mindmap-viewport-${mindmapId}`, JSON.stringify(viewport))
      setSavedViewport(viewport)
    }, 2000), // 2초 디바운스
    [mindmapId]
  )

  // 뷰포트 변경 감지 (더 효율적인 방식)
  useEffect(() => {
    let lastViewport = getViewport()

    const checkViewportChange = () => {
      const currentViewport = getViewport()
      const hasChanged =
        Math.abs(currentViewport.x - lastViewport.x) > 5 ||
        Math.abs(currentViewport.y - lastViewport.y) > 5 ||
        Math.abs(currentViewport.zoom - lastViewport.zoom) > 0.01

      if (hasChanged) {
        // 변경사항이 있으면 마킹하고 디바운스된 저장 실행
        if (savedViewport) {
          const significantChange =
            Math.abs(currentViewport.x - savedViewport.x) > 10 ||
            Math.abs(currentViewport.y - savedViewport.y) > 10 ||
            Math.abs(currentViewport.zoom - savedViewport.zoom) > 0.01

          if (significantChange) {
            setHasUnsavedChanges(true)
          }
        }

        debouncedSaveViewport(currentViewport)
        lastViewport = currentViewport
      }
    }

    const interval = setInterval(checkViewportChange, 500) // 0.5초마다 체크 (더 반응성 있게)
    return () => clearInterval(interval)
  }, [savedViewport, getViewport, debouncedSaveViewport])

  // Handle node changes with position tracking
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)

      // Check for position changes (mark as unsaved when position changes)
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && change.dragging === false
      )

      if (positionChanges.length > 0) {
        setHasUnsavedChanges(true)
      }
    },
    [onNodesChange]
  )

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
      // TODO: Save edge to database
    },
    [setEdges]
  )

  // Handle canvas click for adding nodes
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2 && onAddNode) {
        // Double click to add node
        const position = project({
          x: event.clientX,
          y: event.clientY,
        })
        onAddNode(position)
      }
    },
    [project, onAddNode]
  )

  return (
    <div className="w-full h-full">
      {/* Save Status and Button */}
      <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-3 border">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-orange-600">변경사항 있음</span>
            </>
          ) : updateNodesBulk.isPending ? (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600">저장 중...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">저장됨</span>
            </>
          )}
        </div>
        <button
          onClick={savePositions}
          disabled={!hasUnsavedChanges || updateNodesBulk.isPending}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          저장
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={DEFAULT_VIEWPORT}
        fitView={false}
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Controls position="top-left" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  )
}