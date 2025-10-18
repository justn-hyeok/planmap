import { Database } from './database'

export type Mindmap = Database['public']['Tables']['mindmaps']['Row']
export type MindmapInsert = Database['public']['Tables']['mindmaps']['Insert']
export type MindmapUpdate = Database['public']['Tables']['mindmaps']['Update']

export type Node = Database['public']['Tables']['nodes']['Row']
export type NodeInsert = Database['public']['Tables']['nodes']['Insert']
export type NodeUpdate = Database['public']['Tables']['nodes']['Update']

export type Edge = Database['public']['Tables']['edges']['Row']
export type EdgeInsert = Database['public']['Tables']['edges']['Insert']
export type EdgeUpdate = Database['public']['Tables']['edges']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface MindmapWithNodes extends Mindmap {
  nodes: Node[]
  edges: Edge[]
}

export interface CreateMindmapData {
  title: string
  description?: string
}

export interface CreateNodeData {
  mindmapId: string
  title: string
  content?: string
  progress?: number
  position: {
    x: number
    y: number
  }
}

export interface UpdateNodeData {
  title?: string
  content?: string
  progress?: number
  position?: {
    x: number
    y: number
  }
}

export interface CreateEdgeData {
  mindmapId: string
  sourceNodeId: string
  targetNodeId: string
  type?: string
}