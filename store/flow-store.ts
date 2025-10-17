import { create } from 'zustand'
import { Node, Edge, Connection, addEdge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import { mockNodes, mockEdges, convertToFlowNodes } from '@/lib/mock-data'

interface FlowState {
  nodes: Node[]
  edges: Edge[]
  selectedMindmapId: string | null
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setSelectedMindmap: (id: string) => void
  addNode: (node: Node) => void
  updateNode: (id: string, data: any) => void
  deleteNode: (id: string) => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedMindmapId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },

  setSelectedMindmap: (id: string) => {
    const mindmapNodes = mockNodes.filter(node => node.mindmap_id === id)
    const mindmapEdges = mockEdges.filter(edge =>
      mindmapNodes.some(node => node.id === edge.source) &&
      mindmapNodes.some(node => node.id === edge.target)
    )

    set({
      selectedMindmapId: id,
      nodes: convertToFlowNodes(mindmapNodes),
      edges: mindmapEdges,
    })
  },

  addNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    })
  },

  updateNode: (id: string, data: any) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })
  },

  deleteNode: (id: string) => {
    set({
      nodes: get().nodes.filter(node => node.id !== id),
      edges: get().edges.filter(edge => edge.source !== id && edge.target !== id),
    })
  },
}))