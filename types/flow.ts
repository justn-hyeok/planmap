import { Node, Edge, Viewport } from 'reactflow'

export interface StudyNodeData {
  title: string
  content?: string
  progress: number // 0-100
  color?: string
}

export interface StudyNode extends Node<StudyNodeData> {
  type: 'studyNode'
}

export type StudyEdge = Edge & {
  type?: 'default' | 'straight' | 'step' | 'smoothstep'
}

export interface MindmapData {
  id: string
  title: string
  description?: string
  nodes: StudyNode[]
  edges: StudyEdge[]
  viewport: Viewport
  lastSaved?: Date
}

export interface FlowState {
  nodes: StudyNode[]
  edges: StudyEdge[]
  viewport: Viewport
  selectedNodeId: string | null
  isEditing: boolean
  isDirty: boolean
}

export type ProgressLevel = 'low' | 'medium' | 'high'

export interface NodePosition {
  x: number
  y: number
}