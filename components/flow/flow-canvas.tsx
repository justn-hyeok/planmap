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
} from 'reactflow'
import 'reactflow/dist/style.css'

import StudyNode from './custom-node'
import { useUpdateNodesBulk } from '@/lib/hooks/use-nodes'
import { debounce } from '@/lib/utils'
import { NODE_TYPES, DEFAULT_VIEWPORT, DEBOUNCE_DELAY } from '@/lib/constants'
import type { Database } from '@/types/database'

type DatabaseNode = Database['public']['Tables']['nodes']['Row']
type DatabaseEdge = Database['public']['Tables']['edges']['Row']

interface FlowCanvasProps {
  mindmapId: string
  nodes: DatabaseNode[]
  edges: DatabaseEdge[]
  onNodeEdit?: (nodeId: string) => void
  onAddNode?: (position: { x: number; y: number }) => void
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
}: FlowCanvasProps) {
  const { project } = useReactFlow()
  const updateNodesBulk = useUpdateNodesBulk()

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
  }, [initialNodes, setNodes])

  // Update edges when dbEdges change
  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Debounced save function for node positions
  const debouncedSavePositions = useMemo(
    () =>
      debounce((changedNodes: Node[]) => {
        const updates = changedNodes
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
          updateNodesBulk.mutate({ nodes: updates })
        }
      }, DEBOUNCE_DELAY.AUTO_SAVE),
    [dbNodes, updateNodesBulk]
  )

  // Handle node changes with position tracking
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)

      // Check for position changes
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && change.dragging === false
      )

      if (positionChanges.length > 0) {
        const changedNodes = nodes.filter((node) =>
          positionChanges.some((change) => change.id === node.id)
        )
        debouncedSavePositions(changedNodes)
      }
    },
    [onNodesChange, nodes, debouncedSavePositions]
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
        fitView
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